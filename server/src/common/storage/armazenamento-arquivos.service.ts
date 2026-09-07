import { Injectable } from "@nestjs/common";
import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Monta a URL pública a partir do que está guardado no banco. Aceita também
 * URL completa: registros antigos (do tempo do Supabase) ficaram com a URL
 * inteira gravada, e devem continuar sendo devolvidos como estão.
 *
 * Está aqui fora da classe porque quem responde não é só quem tem o serviço
 * injetado: o mapper de personagem é uma função pura, chamada de 37 lugares,
 * e receber a instância em todos eles seria pior do que ler a variável de
 * ambiente na hora.
 */
export function montarUrlPublica(caminhoOuUrl: string | null | undefined): string {
  const valor = (caminhoOuUrl ?? "").trim();
  if (!valor) return "";
  if (valor.startsWith("http://") || valor.startsWith("https://")) return valor;

  // Lido a cada chamada, e não no topo do módulo: o dotenv roda no main.ts,
  // que pode ser carregado depois deste arquivo.
  const urlBase = (
    process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  ).replace(/\/+$/, "");

  return `${urlBase}/uploads/${valor.replace(/^\/+/, "")}`;
}

/**
 * Caminho a guardar no banco a partir do que o frontend enviou. O frontend
 * devolve a URL que recebeu no upload, então aqui ela volta a virar caminho
 * relativo. URL de outro domínio é preservada intacta.
 */
export function normalizarParaArmazenamento(caminhoOuUrl: string | null | undefined): string | null {
  const valor = (caminhoOuUrl ?? "").trim();
  if (!valor) return null;

  const marcador = "/uploads/";
  const posicao = valor.indexOf(marcador);
  if (posicao === -1) {
    // Não é uma URL nossa: pode já ser um caminho relativo, ou uma URL externa.
    return valor.startsWith("http://") || valor.startsWith("https://")
      ? valor
      : valor.replace(/^\/+/, "");
  }
  return valor.slice(posicao + marcador.length);
}

/**
 * Substitui o Supabase Storage: os arquivos passam a viver em disco, numa
 * pasta servida estaticamente pelo próprio Express (ver main.ts), organizada
 * em subpastas equivalentes aos antigos buckets (gods/, passados/, maps/...).
 *
 * O banco guarda sempre o CAMINHO RELATIVO ("gods/pharasma.webp"), nunca a URL
 * completa. A URL é montada na hora de responder, a partir de PUBLIC_BASE_URL —
 * assim, publicar em outro host é trocar uma variável de ambiente, e não
 * reescrever todas as linhas da tabela.
 *
 * O upload não vem mais direto do navegador: o arquivo passa pelo backend,
 * que valida, comprime e grava.
 */
@Injectable()
export class ArmazenamentoArquivosService {
  private readonly pastaRaiz = resolve(process.env.UPLOADS_DIR ?? "uploads");

  /**
   * Grava o arquivo e devolve o caminho relativo para guardar no banco.
   *
   * O nome é o original higienizado, sem prefixo de data: "Inari.png" vira
   * "gods/inari.png". Número só entra quando é necessário para não destruir
   * nada: se o nome já estiver ocupado por um arquivo DIFERENTE, vira
   * "inari-2.png". Reenviar exatamente o mesmo conteúdo reaproveita o
   * arquivo que já está lá, em vez de criar uma cópia.
   *
   * Sobrescrever silenciosamente seria pior: dois registros com imagens de
   * mesmo nome fariam um apagar a foto do outro sem aviso.
   */
  async salvar(subpasta: string, nomeOriginal: string, conteudo: Buffer, extensao = "png"): Promise<string> {
    const pastaDestino = join(this.pastaRaiz, subpasta);
    await mkdir(pastaDestino, { recursive: true });

    const nomeBase = this.higienizarNome(nomeOriginal);
    const nomeArquivo = await this.escolherNomeLivre(pastaDestino, nomeBase, extensao, conteudo);

    await writeFile(join(pastaDestino, nomeArquivo), conteudo);
    return `${subpasta}/${nomeArquivo}`;
  }

  private async escolherNomeLivre(
    pastaDestino: string,
    nomeBase: string,
    extensao: string,
    conteudo: Buffer,
  ): Promise<string> {
    for (let sufixo = 1; ; sufixo += 1) {
      const nomeArquivo = sufixo === 1 ? `${nomeBase}.${extensao}` : `${nomeBase}-${sufixo}.${extensao}`;
      const caminhoCompleto = join(pastaDestino, nomeArquivo);

      let existente: Buffer;
      try {
        existente = await readFile(caminhoCompleto);
      } catch {
        return nomeArquivo; // nome livre
      }

      // Mesmo conteúdo: reaproveita em vez de duplicar.
      if (existente.equals(conteudo)) return nomeArquivo;
    }
  }

  /** Ver a função de mesmo nome no topo do arquivo. */
  montarUrlPublica(caminhoOuUrl: string | null | undefined): string {
    return montarUrlPublica(caminhoOuUrl);
  }

  /** Ver a função de mesmo nome no topo do arquivo. */
  normalizarParaArmazenamento(caminhoOuUrl: string | null | undefined): string | null {
    return normalizarParaArmazenamento(caminhoOuUrl);
  }

  /** Remove o arquivo. Silencioso se já não existir — não é erro para quem chama. */
  async remover(caminhoOuUrl: string | null | undefined): Promise<void> {
    const caminhoRelativo = this.normalizarParaArmazenamento(caminhoOuUrl);
    if (!caminhoRelativo) return;
    if (caminhoRelativo.startsWith("http")) return; // arquivo de outro domínio
    if (caminhoRelativo.includes("..")) return; // barreira contra path traversal

    try {
      await unlink(join(this.pastaRaiz, caminhoRelativo));
    } catch {
      // arquivo inexistente: nada a fazer
    }
  }

  private higienizarNome(nomeOriginal: string): string {
    // ̀-ͯ é a faixa de acentos que o normalize("NFD") separa das
    // letras ("ção" vira "c" + til + "a" + "o"): removê-los deixa "cao".
    const ACENTOS_SEPARADOS = /[̀-ͯ]/g;

    const semExtensao = nomeOriginal.replace(/\.[^.]+$/, "");
    return (
      semExtensao
        .normalize("NFD")
        .replace(ACENTOS_SEPARADOS, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "arquivo"
    );
  }
}

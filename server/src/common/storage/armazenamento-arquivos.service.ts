import { Injectable } from "@nestjs/common";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import { join, resolve } from "node:path";

/**
 * Substitui o Supabase Storage: os arquivos passam a viver em disco, numa
 * pasta servida estaticamente pelo próprio Express (ver main.ts), organizada
 * em subpastas equivalentes aos antigos buckets (passados/, deuses/, mapas/...).
 *
 * O upload não vem mais direto do navegador — o arquivo passa pelo backend,
 * que valida, comprime e grava. É o browser que perdeu o acesso direto ao
 * armazenamento, não o contrário.
 */
@Injectable()
export class ArmazenamentoArquivosService {
  private readonly pastaRaiz = resolve(process.env.UPLOADS_DIR ?? "uploads");
  private readonly urlBasePublica =
    process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

  /** Grava o conteúdo e devolve a URL pública já pronta pra salvar no banco. */
  async salvar(subpasta: string, nomeOriginal: string, conteudo: Buffer): Promise<string> {
    const nomeArquivo = this.montarNomeUnico(nomeOriginal);
    const pastaDestino = join(this.pastaRaiz, subpasta);

    await mkdir(pastaDestino, { recursive: true });
    await writeFile(join(pastaDestino, nomeArquivo), conteudo);

    return `${this.urlBasePublica}/uploads/${subpasta}/${nomeArquivo}`;
  }

  /**
   * Remove um arquivo a partir da URL pública salva no banco. Silencioso se o
   * arquivo já não existir — apagar algo que sumiu não é erro pra quem chama.
   */
  async remover(urlPublica: string): Promise<void> {
    const caminhoRelativo = this.extrairCaminhoRelativo(urlPublica);
    if (!caminhoRelativo) return;

    try {
      await unlink(join(this.pastaRaiz, caminhoRelativo));
    } catch {
      // arquivo inexistente: nada a fazer
    }
  }

  private montarNomeUnico(nomeOriginal: string): string {
    const semExtensao = nomeOriginal.replace(/\.[^.]+$/, "");
    const sanitizado = semExtensao.replace(/[^a-zA-Z0-9._-]/g, "-");
    return `${Date.now()}-${sanitizado}.jpg`;
  }

  /**
   * De "http://host/uploads/passados/123-foto.jpg" para "passados/123-foto.jpg".
   * Devolve null se a URL não apontar pra este armazenamento (ex: URL antiga
   * do Supabase que ainda esteja gravada em algum registro).
   */
  private extrairCaminhoRelativo(urlPublica: string): string | null {
    const marcador = "/uploads/";
    const posicao = urlPublica.indexOf(marcador);
    if (posicao === -1) return null;

    const caminho = urlPublica.slice(posicao + marcador.length);
    // Barreira contra path traversal: nenhum ".." pode escapar da pasta raiz.
    if (caminho.includes("..")) return null;
    return caminho;
  }
}

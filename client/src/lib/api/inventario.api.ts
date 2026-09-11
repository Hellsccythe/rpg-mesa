import { api } from '@/plugins/axios'

/**
 * O inventário estruturado, em `characters.data.inventario`. É o modelo que o
 * site e o aplicativo futuro leem — nome, peso e valor vêm do catálogo na
 * resposta, nunca são gravados no personagem.
 */
export const TABELAS_DE_INVENTARIO = ['itens', 'consumiveis', 'equipamentos'] as const
export type TabelaDeInventario = (typeof TABELAS_DE_INVENTARIO)[number]

/** Só o que foi fabricado tem qualidade. Comprado é null e vale como bem feito. */
export const QUALIDADES = ['malfeito', 'bemfeito', 'obra_prima'] as const
export type Qualidade = (typeof QUALIDADES)[number]

export const ROTULO_QUALIDADE: Record<Qualidade, string> = {
  malfeito: 'Mal feito',
  bemfeito: 'Bem feito',
  obra_prima: 'Obra-prima',
}

/** Literais, porque o Tailwind varre nomes inteiros. */
export const CLASSE_QUALIDADE: Record<Qualidade, string> = {
  malfeito: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
  bemfeito: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
  obra_prima: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
}

export type EntradaDeInventario = {
  tabela: TabelaDeInventario
  id: number
  quantidade: number
  qualidade: Qualidade | null
  /** Na mochila rápida: à mão em combate. */
  rapido: boolean
  /** Vestido ou empunhado. */
  equipado: boolean
  // ── enriquecido pelo servidor ──
  nome: string
  /** Peso unitário em kg. */
  peso: number | null
  valor: number | null
  categoria: string | null
  /** O item foi apagado do catálogo depois de entrar no inventário. */
  orfao: boolean
}

export type InventarioApi = {
  entradas: EntradaDeInventario[]
  peso_total: number
  peso_maximo: number
}

export async function listarInventario(personagemId: number): Promise<InventarioApi> {
  const { data } = await api.get<InventarioApi>(`/personagens/${personagemId}/inventario`)
  return data
}

export async function adicionarAoInventario(
  personagemId: number,
  entrada: { tabela: TabelaDeInventario; id: number; quantidade?: number; rapido?: boolean; equipado?: boolean },
): Promise<InventarioApi> {
  const { data } = await api.post<InventarioApi>(`/personagens/${personagemId}/inventario`, entrada)
  return data
}

/** `posicao` é o índice na lista — a mesma poção pode aparecer duas vezes, uma na mochila rápida. */
export async function removerDoInventario(
  personagemId: number, posicao: number, quantidade = 1,
): Promise<InventarioApi> {
  const { data } = await api.delete<InventarioApi>(
    `/personagens/${personagemId}/inventario/${posicao}`, { data: { quantidade } })
  return data
}

export async function alternarNoInventario(
  personagemId: number, posicao: number, campo: 'rapido' | 'equipado', valor: boolean,
): Promise<InventarioApi> {
  const { data } = await api.patch<InventarioApi>(
    `/personagens/${personagemId}/inventario/${posicao}`, { campo, valor })
  return data
}

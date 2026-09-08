import { api } from '@/plugins/axios'

/**
 * A escala de raridade, única para equipamentos, consumíveis e itens.
 *
 * A `cor` vem do banco de propósito: manter um mapa de cores aqui no frontend
 * garantiria que ele saísse de sincronia na primeira raridade nova.
 */
export type RaridadeApi = {
  item: number
  descricao: string
  /** Posição na escala. É por ela que se ordena, não pelo `item`. */
  ordem: number
  /** Quanto o preço-base é multiplicado. */
  multiplicador_valor: number
  /** Dificuldade do teste para fabricar. Nulo em Lendário: o mestre decide. */
  dificuldade_base: number | null
  disponibilidade: string
  /** Nome de cor do Tailwind, ex: 'emerald'. */
  cor: string
}

export type RaridadePayload = {
  descricao: string
  ordem: number
  multiplicador_valor: number
  dificuldade_base?: number | null
  disponibilidade?: string
  cor?: string
}

export async function listarRaridades(): Promise<RaridadeApi[]> {
  const { data } = await api.get<RaridadeApi[]>('/raridades')
  return data
}

export async function criarRaridade(payload: RaridadePayload): Promise<RaridadeApi> {
  const { data } = await api.post<RaridadeApi>('/raridades/admin', payload)
  return data
}

export async function editarRaridade(item: number, payload: Partial<RaridadePayload>): Promise<RaridadeApi> {
  const { data } = await api.patch<RaridadeApi>(`/raridades/admin/${item}`, payload)
  return data
}

export async function deletarRaridade(item: number): Promise<void> {
  await api.delete(`/raridades/admin/${item}`)
}

/**
 * As classes de badge por raridade. Escritas por extenso porque o Tailwind
 * varre o código em busca de nomes literais — montar `bg-${cor}-500/10` faria
 * o build descartar a classe e o selo sair sem cor.
 */
const CLASSES_POR_COR: Record<string, string> = {
  zinc:    'border-zinc-500/25 bg-zinc-900/40 text-zinc-300',
  emerald: 'border-emerald-500/25 bg-emerald-950/40 text-emerald-300',
  sky:     'border-sky-500/25 bg-sky-950/40 text-sky-300',
  violet:  'border-violet-500/25 bg-violet-950/40 text-violet-300',
  amber:   'border-amber-500/25 bg-amber-950/40 text-amber-300',
  red:     'border-red-500/25 bg-red-950/40 text-red-300',
  fuchsia: 'border-fuchsia-500/25 bg-fuchsia-950/40 text-fuchsia-300',
}

export function classeDaRaridade(cor: string | null | undefined): string {
  return CLASSES_POR_COR[cor ?? 'zinc'] ?? CLASSES_POR_COR.zinc
}

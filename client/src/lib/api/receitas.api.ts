import { api } from '@/plugins/axios'

/** As tabelas que podem ser produto de uma receita ou ingrediente dela. */
export const TABELAS_DE_ITEM = ['consumiveis', 'itens', 'equipamentos'] as const
export type TabelaDeItem = (typeof TABELAS_DE_ITEM)[number]

export const ROTULO_DA_TABELA: Record<TabelaDeItem, string> = {
  consumiveis: 'Consumível',
  itens: 'Item',
  equipamentos: 'Equipamento',
}

export type ReferenciaDeItem = {
  tabela: TabelaDeItem
  id: number
  nome: string
  valor: number | null
}

export type IngredienteApi = ReferenciaDeItem & {
  quantidade: number
  /** Falso para ferramenta: exigida pela receita, mas não some ao ser usada. */
  consumido: boolean
}

export type ReceitaApi = {
  id: number
  nome: string
  descricao: string | null
  produto: ReferenciaDeItem | null
  quantidade_produzida: number
  tempo_minutos: number
  dificuldade: number
  ingredientes: IngredienteApi[]
  /** Soma de valor × quantidade dos ingredientes consumidos. */
  custo_dos_ingredientes: number
  preco_de_compra: number | null
  /** custo ÷ preço, em porcentagem. O alvo do projeto é 70–75%. */
  proporcao_do_preco: number | null
}

export type IngredientePayload = {
  ingrediente_tabela: TabelaDeItem
  ingrediente_id: number
  quantidade: number
  consumido?: boolean
}

export type ReceitaPayload = {
  nome: string
  descricao?: string
  produto_tabela: TabelaDeItem
  produto_id: number
  quantidade_produzida?: number
  tempo_minutos?: number
  dificuldade?: number
  /** Substitui o conjunto inteiro de ingredientes. */
  ingredientes: IngredientePayload[]
}

export async function listarReceitas(): Promise<ReceitaApi[]> {
  const { data } = await api.get<ReceitaApi[]>('/receitas')
  return data
}

export async function criarReceita(payload: ReceitaPayload): Promise<ReceitaApi> {
  const { data } = await api.post<ReceitaApi>('/receitas/admin', payload)
  return data
}

export async function editarReceita(id: number, payload: Partial<ReceitaPayload>): Promise<ReceitaApi> {
  const { data } = await api.patch<ReceitaApi>(`/receitas/admin/${id}`, payload)
  return data
}

export async function deletarReceita(id: number): Promise<void> {
  await api.delete(`/receitas/admin/${id}`)
}

/** "1 h 30 min" a partir de minutos — a mesa não pensa em 90. */
export function formatarTempo(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas < 24) return resto === 0 ? `${horas} h` : `${horas} h ${resto} min`
  const dias = Math.floor(horas / 24)
  const horasRestantes = horas % 24
  return horasRestantes === 0 ? `${dias} d` : `${dias} d ${horasRestantes} h`
}

/**
 * A cor da proporção custo/preço. O alvo é 70–75%: abaixo disso fabricar fica
 * barato demais e ninguém compra; acima, fabricar não compensa o risco.
 */
export function classeDaProporcao(proporcao: number | null): string {
  if (proporcao === null) return 'text-zinc-600'
  if (proporcao < 60) return 'text-amber-400'
  if (proporcao <= 80) return 'text-emerald-400'
  return 'text-red-400'
}

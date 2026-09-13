import { api } from '@/plugins/axios'

export type SkillResumo  = { id: number; name: string }
export type AtributoBonus = {
  aura?: number
  forca?: number
  destreza?: number
  resistencia?: number
  inteligencia?: number
}

export type TituloResumo = { id: number; name: string; skills: SkillResumo[]; bonuses?: AtributoBonus | null }

/** As moedas do jogo, da menor para a maior. Espelha MOEDAS no backend. */
export const MOEDAS = ['bronze', 'prata', 'ouro'] as const
export type Moeda = (typeof MOEDAS)[number]

/** `2d100` de prata é `{ quantidade: 2, faces: 100, moeda: 'prata' }`. */
export type RolagemDeDinheiro = {
  quantidade: number
  faces: number
  moeda: Moeda
}

/** Escreve uma lista de rolagens como "1d100 de prata + 1d4 de ouro". */
export function descreverDinheiro(rolagens: RolagemDeDinheiro[] | null | undefined): string {
  if (!rolagens?.length) return 'Nenhum'
  return rolagens.map(r => `${r.quantidade}d${r.faces} de ${r.moeda}`).join(' + ')
}

export type PassadoApi = {
  id: number
  nome: string
  descricao: string | null
  foto_url: string | null
  skill_ids: number[]
  titulo_ids: number[]
  skills: SkillResumo[]
  titulos: TituloResumo[]
  atributo_bonus: AtributoBonus | null
  dinheiro_inicial: RolagemDeDinheiro[]
  created_at: string
  updated_at: string
}

export type PassadoPayload = {
  nome: string
  descricao?: string
  foto_url?: string
  skill_ids?: number[]
  titulo_ids?: number[]
  atributo_bonus?: AtributoBonus | null
  dinheiro_inicial?: RolagemDeDinheiro[]
}

/** Os passados do mundo: do personagem, quando há um; senão do mundo ativo (header X-Campanha). */
export async function listarPassados(characterId?: string | number | null): Promise<PassadoApi[]> {
  const params = characterId ? { characterId: Number(characterId) } : {}
  const { data } = await api.get<PassadoApi[]>('/passados', { params })
  return data
}

export async function criarPassado(payload: PassadoPayload): Promise<PassadoApi> {
  const { data } = await api.post<PassadoApi>('/passados/admin', payload)
  return data
}

export async function editarPassado(id: number, payload: PassadoPayload): Promise<PassadoApi> {
  const { data } = await api.patch<PassadoApi>(`/passados/admin/${id}`, payload)
  return data
}

export async function deletarPassado(id: number): Promise<void> {
  await api.delete(`/passados/admin/${id}`)
}

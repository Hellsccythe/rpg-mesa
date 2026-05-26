import { api } from '@/plugins/axios'

export interface ClassRequirements {
  min_level: number
  required_classes: number[]
}

export interface ClasseApi {
  id: string | number
  name: string
  tier: string
  description: string
  max_level: number
  stat_bonuses?: Record<string, unknown> | string | null
  starting_skills?: string[] | null
  requirements?: ClassRequirements | null
  created_at: string
  [key: string]: unknown
}

export interface LevelProgressionApi {
  level: number
  xp_required: number
  xp_total_accumulated?: number | null
  multiplier?: number
  [key: string]: unknown
}

export async function listarClasses(): Promise<ClasseApi[]> {
  const { data } = await api.get<ClasseApi[]>('/classes')
  return data
}

export async function listarProgressaoLevel(): Promise<LevelProgressionApi[]> {
  const { data } = await api.get<LevelProgressionApi[]>('/classes/level-progression')
  return data
}

export async function escolherClasse(
  characterId: string | number,
  payload: { classId: string; className: string; classTier: string },
) {
  const { data } = await api.post(`/personagens/${characterId}/escolher-classe`, payload)
  return data
}

export async function escolherSkillInicial(
  characterId: string | number,
  payload: { classId: string; skillName: string },
) {
  const { data } = await api.post(`/personagens/${characterId}/escolher-skill-inicial`, payload)
  return data
}

export async function levelarClasse(
  characterId: string | number,
  payload: { classId: string },
) {
  const { data } = await api.post(`/personagens/${characterId}/levar-classe`, payload)
  return data
}

export async function adicionarPontosDeClasse(
  characterId: string | number,
  payload: { pontos: number },
) {
  const { data } = await api.post(`/personagens/admin/${characterId}/class-points`, payload)
  return data
}

export interface SalvarClassePayload {
  name: string
  tier: string
  description: string
  maxLevel?: number
  statBonuses?: Record<string, unknown> | null
  requirements?: { min_level?: number; required_classes?: number[] } | null
  startingSkills?: string[] | null
}

export type EditarClassePayload = Partial<SalvarClassePayload>

export async function createClass(payload: SalvarClassePayload): Promise<ClasseApi> {
  const { data } = await api.post<ClasseApi>('/classes/admin', payload)
  return data
}

export async function editarClasse(id: string | number, payload: EditarClassePayload): Promise<ClasseApi> {
  const { data } = await api.patch<ClasseApi>(`/classes/admin/${id}`, payload)
  return data
}

export async function deletarClasse(id: string | number): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/classes/admin/${id}`)
  return data
}

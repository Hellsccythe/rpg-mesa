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
  characterId: string,
  payload: { classId: string; className: string; classTier: string },
) {
  const { data } = await api.post(`/personagens/${characterId}/escolher-classe`, payload)
  return data
}

export async function escolherSkillInicial(
  characterId: string,
  payload: { classId: string; skillName: string },
) {
  const { data } = await api.post(`/personagens/${characterId}/escolher-skill-inicial`, payload)
  return data
}

export async function levelarClasse(
  characterId: string,
  payload: { classId: string },
) {
  const { data } = await api.post(`/personagens/${characterId}/levar-classe`, payload)
  return data
}

export async function adicionarPontosDeClasse(
  characterId: string,
  payload: { pontos: number },
) {
  const { data } = await api.post(`/personagens/admin/${characterId}/class-points`, payload)
  return data
}

export async function createClass(payload: {
  name: string
  tier: string
  description: string
  maxLevel?: number
}) {
  const { data } = await api.post('/classes/admin', payload)
  return data
}

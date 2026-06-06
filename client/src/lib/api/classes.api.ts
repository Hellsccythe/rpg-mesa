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
  passive_skills?: string[] | null
  signature_skill?: string | null
  signature_skill_nivel?: number | null
  requirements?: ClassRequirements | null
  requer_deus?: boolean
  is_secret?: boolean
  created_at: string
  [key: string]: unknown
}

export type ClasseSecretaAdmin = ClasseApi & {
  revelada: boolean
  titular: { id: number; name: string; username: string | null; avatar_url: string | null; status: string } | null
  revealed_at: string | null
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
  passiveSkills?: string[] | null
  signatureSkill?: string | null
  signatureSkillNivel?: number | null
  requerDeus?: boolean
  isSecret?: boolean
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

export async function listarClassesAdmin(): Promise<ClasseApi[]> {
  const { data } = await api.get<ClasseApi[]>('/classes/admin')
  return data
}

export async function listarClassesParaPlayer(characterId: number | string): Promise<ClasseApi[]> {
  const { data } = await api.get<ClasseApi[]>('/classes/para-player', { params: { characterId } })
  return data
}

export async function listarClassesSecretasAdmin(): Promise<ClasseSecretaAdmin[]> {
  const { data } = await api.get<ClasseSecretaAdmin[]>('/classes/secretas/admin')
  return data
}

export async function revelarClasseSecreta(classeId: number, characterId: number): Promise<{ success: boolean }> {
  const { data } = await api.post('/classes/secretas/admin/revelar', { classeId, characterId })
  return data
}

export async function revogarClasseSecreta(classeId: number): Promise<{ success: boolean }> {
  const { data } = await api.delete(`/classes/secretas/admin/revogar/${classeId}`)
  return data
}

export async function alterarStatusPersonagem(characterId: number | string, status: 'vivo' | 'morto'): Promise<void> {
  await api.patch(`/personagens/admin/${characterId}/status`, { status })
}

// ── Progressão de XP por classe ───────────────────────────────────────────────
export interface ProgressaoClasseApi {
  id: number
  classe_id: number
  classe_nome?: string | null
  nivel: number
  xp_necessario: number
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
}

export interface CriarProgressaoPayload {
  classe_id: number
  nivel: number
  xp_necessario: number
}

export interface EditarProgressaoPayload {
  xp_necessario?: number
}

export async function listarProgressaoClasse(classeId?: number): Promise<ProgressaoClasseApi[]> {
  const params = classeId ? { classe_id: classeId } : {}
  const { data } = await api.get<ProgressaoClasseApi[]>('/classes/progressao', { params })
  return data
}

export async function criarProgressaoClasse(payload: CriarProgressaoPayload): Promise<ProgressaoClasseApi> {
  const { data } = await api.post<ProgressaoClasseApi>('/classes/progressao/admin', payload)
  return data
}

export async function editarProgressaoClasse(id: number, payload: EditarProgressaoPayload): Promise<ProgressaoClasseApi> {
  const { data } = await api.patch<ProgressaoClasseApi>(`/classes/progressao/admin/${id}`, payload)
  return data
}

export async function deletarProgressaoClasse(id: number): Promise<{ ok: boolean }> {
  const { data } = await api.delete<{ ok: boolean }>(`/classes/progressao/admin/${id}`)
  return data
}

export interface BulkProgressaoItem {
  classe_id: number
  nivel: number
  xp_necessario: number
}

export async function criarProgressaoClasseBulk(entradas: BulkProgressaoItem[]): Promise<ProgressaoClasseApi[]> {
  const { data } = await api.post<ProgressaoClasseApi[]>('/classes/progressao/admin/bulk', { entradas })
  return data
}

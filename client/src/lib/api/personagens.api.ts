import { api } from '@/plugins/axios'
import type {
  AprovacaoPendenteApi,
  EditarPersonagemDto,
  ListarPersonagemDto,
  PaginaInicialApi,
  PersonagemApi,
  SalvarPersonagemDto,
  SolicitarAlteracaoPersonagemDto,
} from '@/types/supabase'

export async function getPaginaInicial(campaignSlug?: string) {
  const params = campaignSlug ? { campaignSlug } : undefined
  const { data } = await api.get<PaginaInicialApi>('/personagens/pagina', { params })
  return data
}

export async function listMyCharacters(params: ListarPersonagemDto = {}) {
  const { data } = await api.get<PersonagemApi[]>('/personagens', { params })
  return data
}

/**
 * Rota única para jogador e mestre. Antes o frontend escolhia entre
 * /personagens/:id e /personagens/admin/:id porque o backend precisava de
 * clientes Supabase diferentes; agora o tipo do usuário vem no token e quem
 * decide o que pode ser aberto é o backend.
 */
export async function getCharacterById(characterId: string | number) {
  const { data } = await api.get<PersonagemApi>(`/personagens/${characterId}`)
  return data
}

export async function createCharacter(payload: SalvarPersonagemDto) {
  const { data } = await api.post<PersonagemApi>('/personagens', payload)
  return data
}

export async function registrarECriarPersonagem(payload: {
  email: string
  username: string
  senha: string
  nome: string
  data?: Record<string, unknown>
  avatarUrl?: string | null
}) {
  const { data } = await api.post<PersonagemApi>('/personagens/registrar', payload)
  return data
}

export async function editCharacter(characterId: string | number, payload: EditarPersonagemDto) {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}`, payload)
  return data
}

export async function requestCharacterChange(
  characterId: string | number,
  payload: SolicitarAlteracaoPersonagemDto,
) {
  const { data } = await api.patch<PersonagemApi>(
    `/personagens/${characterId}/solicitacao`,
    payload,
  )
  return data
}

export async function listPendingApprovals() {
  const { data } = await api.get<AprovacaoPendenteApi[]>('/personagens/admin/solicitacoes')
  return data
}

export async function reviewPendingApproval(characterId: string | number, approve: boolean) {
  const { data } = await api.post<PersonagemApi>(
    `/personagens/admin/solicitacoes/${characterId}/revisar`,
    { approve },
  )
  return data
}

export async function addAdventureNoteToCharacter(characterId: string | number, note: string) {
  const { data } = await api.post<PersonagemApi>(
    `/personagens/admin/personagens/${characterId}/notas`,
    { note },
  )
  return data
}

export async function setAvatarFocalPoint(characterId: string | number, focalPoint: string) {
  const { data } = await api.patch<PersonagemApi>(
    `/personagens/admin/${characterId}/avatar-focal-point`,
    { focalPoint },
  )
  return data
}

export async function setModalHeroPosition(characterId: string | number, position: string) {
  const { data } = await api.patch<PersonagemApi>(
    `/personagens/admin/${characterId}/modal-hero-position`,
    { position },
  )
  return data
}

export async function listCharacterCreationAllowedEmails() {
  const { data } = await api.get<{ emails: string[] }>(
    '/personagens/admin/character-creation-emails',
  )
  return data
}

export async function addCharacterCreationAllowedEmail(email: string) {
  const { data } = await api.post<{ success: boolean; email: string }>(
    '/personagens/admin/character-creation-emails',
    { email },
  )
  return data
}

export async function removeCharacterCreationAllowedEmail(email: string) {
  const { data } = await api.delete<{ success: boolean; email: string }>(
    `/personagens/admin/character-creation-emails/${encodeURIComponent(email)}`,
  )
  return data
}

export async function deleteCharacterAsMaster(characterId: string | number) {
  const { data } = await api.delete<{ success: boolean }>(`/personagens/admin/${characterId}`)
  return data
}

export async function setCharacterGodInfo(
  characterId: string | number,
  godId: string | number,
  text: string,
) {
  const { data } = await api.patch<PersonagemApi>(
    `/personagens/admin/${characterId}/god-info/${godId}`,
    { text },
  )
  return data
}

export async function verificarSeMestre(): Promise<boolean> {
  try {
    await api.get('/personagens/admin/verificar-mestre')
    return true
  } catch {
    return false
  }
}

export async function escolherRaca(characterId: string | number, raca_id: number): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/escolher-raca`, { raca_id })
  return data
}

export async function escolherPassado(characterId: string | number, passado_id: number): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/escolher-passado`, { passado_id })
  return data
}

export async function escolherClasseInicial(characterId: string | number, classe_id: number): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/escolher-classe`, { classe_id })
  return data
}

export async function definirAtributos(characterId: string | number, atributos: {
  aura: number; forca: number; destreza: number; resistencia: number; inteligencia: number
}): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/definir-atributos`, atributos)
  return data
}

export async function escolherDeus(characterId: string | number, deus_id: number | null): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/escolher-deus`, { deus_id })
  return data
}

export async function adicionarSkillPointsParaClasse(
  characterId: string | number,
  classId: string,
  pontos: number,
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/admin/${characterId}/skill-points-classe`, { classId, pontos })
  return data
}

export async function atribuirXpClasse(
  characterId: string | number,
  classId: string,
  xp: number,
): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/admin/${characterId}/atribuir-xp`, { classId, xp })
  return data
}

export async function concluirOnboarding(
  characterId: string | number,
  equipamentos: Array<{ id: number; nome: string; peso: number }>,
): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/concluir-onboarding`, { equipamentos })
  return data
}

export async function adicionarPontosDeClasse(
  characterId: string | number,
  pontos: number,
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/admin/${characterId}/class-points`, { pontos })
  return data
}

export async function levelarClasse(
  characterId: string | number,
  classId: string,
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/${characterId}/levar-classe`, { classId })
  return data
}

export async function escolherClasse(
  characterId: string | number,
  dto: { classId: string; className: string; classTier: string },
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/${characterId}/escolher-classe`, dto)
  return data
}

export async function adicionarPontosAtributo(
  characterId: string | number,
  pontos: number,
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/admin/${characterId}/atribuir-pontos-atributo`, { pontos })
  return data
}

export async function distribuirPontosAtributo(
  characterId: string | number,
  distribuicao: Record<string, number>,
): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}/distribuir-pontos-atributo`, { distribuicao })
  return data
}

export async function resetarPontosAtributo(
  characterId: string | number,
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/admin/${characterId}/resetar-pontos-atributo`, {})
  return data
}

export async function atribuirXpPersonagem(
  characterId: string | number,
  xp: number,
): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/admin/${characterId}/atribuir-xp-personagem`, { xp })
  return data
}

/**
 * Progressão de XP por nível de personagem, em faixas: cada nível pertence a
 * um tier (Rápido, Médio, Épico) com seu multiplicador, e guarda tanto o XP
 * para o próximo nível quanto o acumulado até ali.
 */
export interface LevelProgressionApi {
  id: number
  level: number
  tier: string
  multiplier: number
  xp_required_next: number
  xp_total_accumulated: number
  created_at: string
  updated_at: string
}

export type EntradaLevelProgressionPayload = Omit<
  LevelProgressionApi,
  'id' | 'created_at' | 'updated_at'
>

export async function listarLevelProgression(tier?: string): Promise<LevelProgressionApi[]> {
  const { data } = await api.get<LevelProgressionApi[]>('/personagens/admin/level-progression', {
    params: tier ? { tier } : {},
  })
  return data
}

export async function salvarLevelProgression(
  entradas: EntradaLevelProgressionPayload[],
): Promise<LevelProgressionApi[]> {
  const { data } = await api.post<LevelProgressionApi[]>('/personagens/admin/level-progression', { entradas })
  return data
}

export async function deletarLevelProgression(id: number): Promise<{ success: boolean }> {
  const { data } = await api.delete(`/personagens/admin/level-progression/${id}`)
  return data
}

export async function escolherSkillDaClasse(
  characterId: string | number,
  classId: string,
  skillName: string,
): Promise<PersonagemApi> {
  const { data } = await api.post<PersonagemApi>(`/personagens/${characterId}/escolher-skill-inicial`, { classId, skillName })
  return data
}

export async function alterarStatusPersonagem(
  characterId: string | number,
  status: 'vivo' | 'morto',
): Promise<PersonagemApi> {
  const { data } = await api.patch<PersonagemApi>(`/personagens/admin/${characterId}/status`, { status })
  return data
}

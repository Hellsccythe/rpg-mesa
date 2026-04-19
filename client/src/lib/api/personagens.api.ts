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

export async function getPaginaInicial() {
  const { data } = await api.get<PaginaInicialApi>('/personagens/pagina')
  return data
}

export async function listMyCharacters(params: ListarPersonagemDto = {}) {
  const { data } = await api.get<PersonagemApi[]>('/personagens', { params })
  return data
}

export async function getCharacterById(characterId: string, isMaster: boolean) {
  const endpoint = isMaster ? `/personagens/admin/${characterId}` : `/personagens/${characterId}`
  const { data } = await api.get<PersonagemApi>(endpoint)
  return data
}

export async function createCharacter(payload: SalvarPersonagemDto) {
  const { data } = await api.post<PersonagemApi>('/personagens', payload)
  return data
}

export async function registrarECriarPersonagem(payload: {
  email: string
  senha: string
  nome: string
  data?: Record<string, unknown>
  avatarUrl?: string | null
}) {
  const { data } = await api.post<PersonagemApi>('/personagens/registrar', payload)
  return data
}

export async function editCharacter(characterId: string, payload: EditarPersonagemDto) {
  const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}`, payload)
  return data
}

export async function requestCharacterChange(
  characterId: string,
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

export async function reviewPendingApproval(characterId: string, approve: boolean) {
  const { data } = await api.post<PersonagemApi>(
    `/personagens/admin/solicitacoes/${characterId}/revisar`,
    { approve },
  )
  return data
}

export async function addAdventureNoteToCharacter(characterId: string, note: string) {
  const { data } = await api.post<PersonagemApi>(
    `/personagens/admin/personagens/${characterId}/notas`,
    {
      note,
    },
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

export async function deleteCharacterAsMaster(characterId: string) {
  const { data } = await api.delete<{ success: boolean }>(`/personagens/admin/${characterId}`)
  return data
}

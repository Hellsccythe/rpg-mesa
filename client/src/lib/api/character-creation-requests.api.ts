import { api } from '@/plugins/axios'
import type { CharacterCreationRequestApi } from '@/types/supabase'

export interface SubmeterCriacaoPayload {
  nome: string
  username: string
  password: string
  email: string
  avatarUrl?: string
  indoleId?: number | null
  generoId?: number | null
  aparenciaFisica?: string
  historiaTexto?: string
  historiaDocUrl?: string
}

export async function submeterSolicitacaoCriacao(
  payload: SubmeterCriacaoPayload,
): Promise<{ id: number; status: string }> {
  const { data } = await api.post<{ id: number; status: string }>(
    '/character-creation-requests',
    payload,
  )
  return data
}

export async function listarSolicitacoesPendentes(): Promise<CharacterCreationRequestApi[]> {
  const { data } = await api.get<CharacterCreationRequestApi[]>(
    '/character-creation-requests/admin',
  )
  return data
}

export async function contarSolicitacoesPendentes(): Promise<number> {
  const { data } = await api.get<{ count: number }>(
    '/character-creation-requests/admin/pendentes/count',
  )
  return data.count
}

export async function aprovarSolicitacao(id: number | string): Promise<void> {
  await api.patch(`/character-creation-requests/admin/${id}/aprovar`)
}

export async function rejeitarSolicitacao(
  id: number | string,
  motivo: string,
): Promise<void> {
  await api.patch(`/character-creation-requests/admin/${id}/rejeitar`, { motivo })
}

export async function uploadAvatarCriacao(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/character-creation-requests/upload-avatar',
    formData,
  )
  return data
}

export async function uploadHistoriaDoc(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/character-creation-requests/upload-historia',
    formData,
  )
  return data
}

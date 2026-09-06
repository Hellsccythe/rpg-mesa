import { api } from '@/plugins/axios'

export type Habilidade    = { nome: string; descricao: string }
export type AtributoBonus = { atributo: string; valor: string }

export type RacaApi = {
  id: number
  nome: string
  foto_url: string | null
  descricao: string | null
  lore: string | null
  habilidades: Habilidade[]
  atributos_bonus: AtributoBonus[]
  createdAt: string | null
  updatedAt: string | null
}

export type CriarRacaPayload = {
  nome: string
  foto_url?: string | null
  descricao?: string | null
  lore?: string | null
  habilidades?: Habilidade[]
  atributos_bonus?: AtributoBonus[]
}

export type EditarRacaPayload = Partial<CriarRacaPayload>

export async function listarRacasPublicas(): Promise<RacaApi[]> {
  const { data } = await api.get<RacaApi[]>('/racas')
  return data
}

export async function listarRacasAdmin(): Promise<RacaApi[]> {
  const { data } = await api.get<RacaApi[]>('/racas/admin')
  return data
}

export async function criarRaca(payload: CriarRacaPayload): Promise<RacaApi> {
  const { data } = await api.post<RacaApi>('/racas/admin', payload)
  return data
}

export async function editarRaca(id: number, payload: EditarRacaPayload): Promise<RacaApi> {
  const { data } = await api.patch<RacaApi>(`/racas/admin/${id}`, payload)
  return data
}

export async function deletarRaca(id: number): Promise<void> {
  await api.delete(`/racas/admin/${id}`)
}

/**
 * Substitui o upload direto ao bucket do Supabase. Devolve `path` (o caminho
 * relativo que deve ser gravado em foto_url) e `publicUrl` (para o preview
 * imediato); o backend aceita qualquer um dos dois de volta.
 */
export async function uploadFotoRaca(file: File): Promise<{ path: string; publicUrl: string }> {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/racas/admin/upload-image',
    formData,
  )
  return data
}

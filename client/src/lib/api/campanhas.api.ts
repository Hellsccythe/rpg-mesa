import { api } from '@/plugins/axios'

export interface CampanhaApi {
  id: number
  /** O número do mundo — "Mundo 2 — Elyra". É lore, editável; o id é a chave. */
  numero: number
  slug: string
  name: string
  description: string | null
  cover_image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CampanhaGmApi {
  id: number
  campaign_id: number
  email: string
  created_at: string
  created_by: string | null
}

export async function listarCampanhas(): Promise<CampanhaApi[]> {
  const { data } = await api.get<CampanhaApi[]>('/campanhas')
  return data
}

export async function listarCampanhasAdmin(): Promise<CampanhaApi[]> {
  const { data } = await api.get<CampanhaApi[]>('/campanhas/admin/listar')
  return data
}

export async function buscarCampanhaPorSlug(slug: string): Promise<CampanhaApi> {
  const { data } = await api.get<CampanhaApi>(`/campanhas/${slug}`)
  return data
}

export async function criarCampanha(payload: {
  slug: string
  name: string
  numero?: number
  description?: string
  cover_image_url?: string
  is_active?: boolean
}): Promise<CampanhaApi> {
  const { data } = await api.post<CampanhaApi>('/campanhas/admin', payload)
  return data
}

export async function editarCampanha(
  id: number,
  payload: { slug?: string; name?: string; numero?: number; description?: string; cover_image_url?: string; is_active?: boolean },
): Promise<CampanhaApi> {
  const { data } = await api.patch<CampanhaApi>(`/campanhas/admin/${id}`, payload)
  return data
}

export async function deletarCampanha(id: number): Promise<void> {
  await api.delete(`/campanhas/admin/${id}`)
}

export async function uploadCapaCampanha(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ path: string; publicUrl: string }>('/campanhas/admin/upload-capa', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  // devolve o caminho relativo, que e o que deve ser gravado em cover_image_url
  return data.path
}

export async function listarGmsCampanha(campaignId: number): Promise<CampanhaGmApi[]> {
  const { data } = await api.get<CampanhaGmApi[]>(`/campanhas/admin/${campaignId}/gms`)
  return data
}

export async function adicionarGmCampanha(campaignId: number, email: string): Promise<CampanhaGmApi> {
  const { data } = await api.post<CampanhaGmApi>(`/campanhas/admin/${campaignId}/gms`, { email })
  return data
}

export async function removerGmCampanha(campaignId: number, gmId: number): Promise<void> {
  await api.delete(`/campanhas/admin/${campaignId}/gms/${gmId}`)
}

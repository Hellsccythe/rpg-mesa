import { api } from '@/plugins/axios'

export interface CampanhaApi {
  id: string
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
  campaign_id: string
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
  description?: string
  cover_image_url?: string
  is_active?: boolean
}): Promise<CampanhaApi> {
  const { data } = await api.post<CampanhaApi>('/campanhas/admin', payload)
  return data
}

export async function editarCampanha(
  id: string,
  payload: { slug?: string; name?: string; description?: string; cover_image_url?: string; is_active?: boolean },
): Promise<CampanhaApi> {
  const { data } = await api.patch<CampanhaApi>(`/campanhas/admin/${id}`, payload)
  return data
}

export async function deletarCampanha(id: string): Promise<void> {
  await api.delete(`/campanhas/admin/${id}`)
}

export async function uploadCapaCampanha(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ publicUrl: string }>('/campanhas/admin/upload-capa', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.publicUrl
}

export async function listarGmsCampanha(campaignId: string): Promise<CampanhaGmApi[]> {
  const { data } = await api.get<CampanhaGmApi[]>(`/campanhas/admin/${campaignId}/gms`)
  return data
}

export async function adicionarGmCampanha(campaignId: string, email: string): Promise<CampanhaGmApi> {
  const { data } = await api.post<CampanhaGmApi>(`/campanhas/admin/${campaignId}/gms`, { email })
  return data
}

export async function removerGmCampanha(campaignId: string, gmId: number): Promise<void> {
  await api.delete(`/campanhas/admin/${campaignId}/gms/${gmId}`)
}

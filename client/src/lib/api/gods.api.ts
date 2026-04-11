import { api } from '@/plugins/axios'
import type { GodApi } from '@/types/supabase'

export interface SaveGodPayload {
  name: string
  description?: string
  title?: string
  indole?: string
  dogma?: string
  anatema?: string
  weapons?: string
  shortDescription?: string
  imageUrl?: string
}

export async function listPublicGods() {
  const { data } = await api.get<GodApi[]>('/gods')
  return data
}

export async function listGods() {
  const { data } = await api.get<GodApi[]>('/gods/admin')
  return data
}

export async function createGod(payload: SaveGodPayload) {
  const { data } = await api.post<GodApi>('/gods/admin', payload)
  return data
}

export async function updateGod(godId: string, payload: Partial<SaveGodPayload>) {
  const { data } = await api.patch<GodApi>(`/gods/admin/${godId}`, payload)
  return data
}

export async function uploadGodImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/gods/admin/upload-image',
    formData,
  )
  return data
}

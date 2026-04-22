import { api } from '@/plugins/axios'

export interface LoreNoteApi {
  id: string
  title: string
  subtitle: string | null
  content: string
  ordem: number
  created_at: string
  updated_at: string
}

export interface CreateLoreNotePayload {
  title: string
  subtitle?: string
  content: string
  ordem?: number
}

export async function listLoreNotes(): Promise<LoreNoteApi[]> {
  const { data } = await api.get<LoreNoteApi[]>('/lore-notes')
  return data
}

export async function createLoreNote(payload: CreateLoreNotePayload): Promise<LoreNoteApi> {
  const { data } = await api.post<LoreNoteApi>('/lore-notes/admin', payload)
  return data
}

export async function updateLoreNote(
  id: string,
  payload: Partial<CreateLoreNotePayload>,
): Promise<LoreNoteApi> {
  const { data } = await api.patch<LoreNoteApi>(`/lore-notes/admin/${id}`, payload)
  return data
}

export async function deleteLoreNote(id: string): Promise<void> {
  await api.delete(`/lore-notes/admin/${id}`)
}

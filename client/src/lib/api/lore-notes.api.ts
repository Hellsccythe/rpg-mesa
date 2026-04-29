import { api } from '@/plugins/axios'

export interface LoreNoteApi {
  id: string
  title: string
  subtitle: string | null
  content: string
  pdf_url: string | null
  ordem: number
  character_id: string | null
  created_at: string
  updated_at: string
}

export interface CreateLoreNotePayload {
  title: string
  subtitle?: string
  content: string
  pdfUrl?: string | null
  ordem?: number
  /** null ou undefined = nota global; uuid = nota exclusiva do personagem */
  characterId?: string | null
}

/** Lista notas globais + específicas do personagem (para jogadores). */
export async function listLoreNotes(characterId?: string): Promise<LoreNoteApi[]> {
  const params = characterId ? { characterId } : {}
  const { data } = await api.get<LoreNoteApi[]>('/lore-notes', { params })
  return data
}

/** Lista TODAS as notas (para o mestre). */
export async function listAllLoreNotes(): Promise<LoreNoteApi[]> {
  const { data } = await api.get<LoreNoteApi[]>('/lore-notes/admin')
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

import { api } from '@/plugins/axios'

export interface LoreNoteApi {
  id: number
  title: string
  subtitle: string | null
  content: string
  pdf_url: string | null
  ordem: number
  character_id: number | null
  created_at: string
  updated_at: string
}

export interface CreateLoreNotePayload {
  title: string
  subtitle?: string
  content: string
  pdfUrl?: string | null
  ordem?: number
  /** null ou ausente = nota global; id do personagem = nota exclusiva dele */
  characterId?: number | null
}

/** Lista notas globais + específicas do personagem (para jogadores). */
export async function listLoreNotes(characterId?: number): Promise<LoreNoteApi[]> {
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
  id: number,
  payload: Partial<CreateLoreNotePayload>,
): Promise<LoreNoteApi> {
  const { data } = await api.patch<LoreNoteApi>(`/lore-notes/admin/${id}`, payload)
  return data
}

export async function deleteLoreNote(id: number): Promise<void> {
  await api.delete(`/lore-notes/admin/${id}`)
}

/** PDF anexado a uma nota de lore. Devolve o caminho relativo a gravar. */
export async function uploadPdfLore(file: File): Promise<{ path: string; publicUrl: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/lore-notes/admin/upload-pdf',
    form,
  )
  return data
}

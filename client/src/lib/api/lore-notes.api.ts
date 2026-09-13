import { api } from '@/plugins/axios'

/**
 * 'livro' abre como livro (capa, folhas). Os outros três são uma folha só e
 * diferem na cara do papel — o mestre escreve igual para todos.
 */
export type FormatoDaNota = 'livro' | 'pergaminho' | 'bilhete' | 'carta'
export const FORMATOS_DA_NOTA: Array<{ value: FormatoDaNota; label: string; icone: string; descricao: string }> = [
  { value: 'livro', label: 'Livro', icone: '📖', descricao: 'Capa que abre e folhas que viram. Capa e contracapa opcionais.' },
  { value: 'pergaminho', label: 'Pergaminho', icone: '📜', descricao: 'Um rolo antigo, de bordas gastas — o documento achado.' },
  { value: 'bilhete', label: 'Bilhete', icone: '🗒️', descricao: 'Um papel pequeno e amassado — o recado, a pista.' },
  { value: 'carta', label: 'Carta', icone: '✉️', descricao: 'Uma folha com cabeçalho e lacre — a mensagem endereçada.' },
]
export const ICONE_DO_FORMATO: Record<FormatoDaNota, string> = Object.fromEntries(
  FORMATOS_DA_NOTA.map((formato) => [formato.value, formato.icone]),
) as Record<FormatoDaNota, string>

/** Para quem a nota está liberada. 'escolhidos' usa a lista de personagens. */
export type VisibilidadeDaNota = 'todos' | 'escolhidos' | 'ninguem'
export const VISIBILIDADES_DA_NOTA: Array<{ value: VisibilidadeDaNota; label: string; descricao: string }> = [
  { value: 'todos', label: 'Todos do mundo', descricao: 'Todo personagem deste mundo encontra a nota na prateleira.' },
  { value: 'escolhidos', label: 'Só estes personagens', descricao: 'Marque quem pode ler. Dá para liberar e tirar depois.' },
  { value: 'ninguem', label: 'Ninguém (rascunho)', descricao: 'A nota existe, mas nenhum jogador a vê ainda.' },
]

export interface LoreNoteApi {
  id: number
  campaign_id: number
  title: string
  subtitle: string | null
  content: string
  pdf_url: string | null
  ordem: number
  visibilidade: VisibilidadeDaNota
  /** Quem lê quando é 'escolhidos'. Vem preenchido só para o mestre. */
  character_ids: number[]
  formato: FormatoDaNota
  /** URLs públicas; nulas quando o mestre não subiu imagem (o leitor desenha a capa padrão). */
  capa_url: string | null
  contracapa_url: string | null
  created_at: string
  updated_at: string
}

/** Um personagem do mundo da nota, marcado se está na lista de acesso. */
export interface AcessoDaNotaApi {
  character_id: number
  nome: string
  username: string | null
  tem_acesso: boolean
}

export interface CreateLoreNotePayload {
  /** Sem ele, o servidor usa a única campanha ativa. */
  campaignId?: number
  title: string
  subtitle?: string
  content: string
  pdfUrl?: string | null
  ordem?: number
  visibilidade?: VisibilidadeDaNota
  /** A lista inteira de quem lê (só vale com 'escolhidos'); substitui a anterior. */
  characterIds?: number[]
  formato?: FormatoDaNota
  /** Caminhos relativos devolvidos por uploadCapaLore; null apaga. */
  capaUrl?: string | null
  contracapaUrl?: string | null
}

/** O que o personagem pode ler: as do mundo dele para todos, mais as liberadas para ele. */
export async function listLoreNotes(characterId?: number): Promise<LoreNoteApi[]> {
  const params = characterId ? { characterId } : {}
  const { data } = await api.get<LoreNoteApi[]>('/lore-notes', { params })
  return data
}

/** Todas as notas do mundo (para o mestre). Sem campaignId, a única campanha ativa. */
export async function listAllLoreNotes(campaignId?: number): Promise<LoreNoteApi[]> {
  const params = campaignId ? { campaignId } : {}
  const { data } = await api.get<LoreNoteApi[]>('/lore-notes/admin', { params })
  return data
}

/** Os personagens do mundo, todos desmarcados — para a lista de acesso de uma nota nova. */
export async function listarPersonagensDoMundo(campaignId?: number): Promise<AcessoDaNotaApi[]> {
  const params = campaignId ? { campaignId } : {}
  const { data } = await api.get<AcessoDaNotaApi[]>('/lore-notes/admin/personagens-do-mundo', { params })
  return data
}

/** Os personagens do mundo da nota, marcando quem está na lista de acesso. */
export async function listarAcessosLoreNote(id: number): Promise<AcessoDaNotaApi[]> {
  const { data } = await api.get<AcessoDaNotaApi[]>(`/lore-notes/admin/${id}/acessos`)
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

/** Capa ou contracapa de um livro de lore. Devolve o caminho relativo a gravar. */
export async function uploadCapaLore(file: File): Promise<{ path: string; publicUrl: string }> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/lore-notes/admin/upload-capa',
    form,
  )
  return data
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

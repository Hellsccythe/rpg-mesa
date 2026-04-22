export interface CriarLoreNoteDto {
  title: string
  subtitle?: string
  content: string
  ordem?: number
  /** Se informado, a nota é visível apenas a este personagem. Null = global. */
  characterId?: string | null
}

export interface EditarLoreNoteDto {
  title?: string
  subtitle?: string
  content?: string
  ordem?: number
  characterId?: string | null
}

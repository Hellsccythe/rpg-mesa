export interface CriarLoreNoteDto {
  title: string
  subtitle?: string
  content: string
  ordem?: number
}

export interface EditarLoreNoteDto {
  title?: string
  subtitle?: string
  content?: string
  ordem?: number
}

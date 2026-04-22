export type AlignmentType = 'bom' | 'neutro' | 'maligno'

export interface BookGod {
  name: string
  epithet: string
  description: string
  alignment: string
  alignmentType: AlignmentType
  anatema: string
  dogma: string
  armas: string
}

export interface BookPage {
  pageNumber: number
  type: 'cover' | 'gods' | 'text'
  sectionHeader?: string
  sectionType?: AlignmentType
  gods: BookGod[]
  // Para páginas de texto (notas dinâmicas do mestre)
  textContent?: string
  noteTitle?: string
  noteSubtitle?: string
}

export interface LoreNoteItem {
  id: string
  titulo: string
  subtitulo?: string
  tipo: 'static' | 'dynamic'
  totalPaginas: number
  pages?: BookPage[]
  apiId?: string
  rawContent?: string
}

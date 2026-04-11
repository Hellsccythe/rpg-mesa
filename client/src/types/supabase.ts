// src/types/supabase.ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          name: string
          level: number
          data: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          name: string
          level?: number
          data?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          campaign_id?: string | null
          name?: string
          level?: number
          data?: Json
          created_at?: string
          updated_at?: string
        }
      }
      // Podemos adicionar classes e skills depois
    }
  }
}

export interface UsuarioApi {
  id: string
  email: string | undefined
}

export interface LayoutApi {
  titulo: string
  subtitulo: string
  backgroundImage: string
}

export interface PersonagemPublicoApi {
  characterId: string
  name: string
  level: number
  avatarUrl: string | null
  classe: string | null
}

export interface PersonagemApi {
  characterId: string
  userId: string
  campaignId: string | null
  name: string
  level: number
  data: any
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface PaginaInicialApi {
  layout: LayoutApi
  personagens: PersonagemPublicoApi[]
}

export interface ListarPersonagemDto {
  nome?: string
  campaignId?: string
}

export interface SalvarPersonagemDto {
  name: string
  level?: number
  campaignId?: string
  avatarUrl?: string
  data?: Json
}

export interface EditarPersonagemDto {
  name?: string
  level?: number
  campaignId?: string
  data?: Json
}

export interface SolicitarAlteracaoPersonagemDto {
  name?: string
  avatarUrl?: string
  history?: string
  historyDocumentPath?: string
  historyDocumentName?: string
  historyDocumentMimeType?: string
}

export interface AprovacaoPendenteApi {
  characterId: string
  currentName: string
  currentAvatarUrl: string | null
  currentHistory: string | null
  currentHistoryDocumentPath: string | null
  currentHistoryDocumentName: string | null
  requestedName: string | null
  requestedAvatarUrl: string | null
  requestedHistory: string | null
  requestedHistoryDocumentPath: string | null
  requestedHistoryDocumentName: string | null
  requestedAt: string
  requestedByEmail: string | null
}

export interface PointOfInterestApi {
  id?: string
  name: string
  x: number
  y: number
  description?: string
  targetCityMapId?: string
  targetLabel?: string
}

export interface GodApi {
  id: string
  name: string
  description: string
  title: string
  indole: string
  dogma: string
  anatema: string
  weapons: string
  shortDescription: string
  imageUrl: string
  createdAt?: string
  updatedAt?: string
}

export interface CityMapApi {
  id: string
  name: string
  mapReference: string
  description: string
  imageUrl: string
  citySlug: string
  cityName: string
  cityDescription: string
  cityCulture: string
  mapType: 'city' | 'localized'
  parentCityMapId: string
  pointsOfInterest: PointOfInterestApi[]
  createdAt?: string
  updatedAt?: string
}

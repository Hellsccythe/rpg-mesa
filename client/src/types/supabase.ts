// src/types/supabase.ts
// id das entity tables agora é INTEGER (migration 022)
// UUID permanece apenas em colunas de FK para auth.users (user_id, deleted_by, etc.)

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: number
          user_id: string         // FK auth.users — permanece UUID
          campaign_id: string | null
          name: string
          level: number
          data: Json
          avatar_url: string | null
          indole_id: number | null
          genero_id: number | null
          aparencia_fisica: string | null
          historia_texto: string | null
          historia_doc_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          deleted_by: string | null  // FK auth.users — permanece UUID
        }
        Insert: {
          user_id: string
          name: string
          campaign_id?: string | null
          level?: number
          data?: Json
          avatar_url?: string | null
          indole_id?: number | null
          genero_id?: number | null
          aparencia_fisica?: string | null
          historia_texto?: string | null
          historia_doc_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          user_id?: string
          campaign_id?: string | null
          name?: string
          level?: number
          data?: Json
          avatar_url?: string | null
          indole_id?: number | null
          genero_id?: number | null
          aparencia_fisica?: string | null
          historia_texto?: string | null
          historia_doc_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          deleted_by?: string | null
        }
      }
      character_creation_whitelist: {
        Row: {
          id: number
          email: string
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
        }
        Insert: {
          email: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
        Update: {
          email?: string
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
        }
      }
    }
  }
}

// ─── Lookup tables ──────────────────────────────────────────────────────────

export interface IndoleApi {
  id: number
  codigo: string     // 'bom' | 'neutro-bom' | 'neutro' | 'neutro-ruim' | 'ruim'
  descricao: string  // label display: 'Bom/Boa', 'Neutro Bom', etc.
  created_at?: string
}

export interface GeneroApi {
  id: number
  codigo: string    // 'feminino' | 'masculino' | 'outro'
  descricao: string // 'Feminino', 'Masculino', 'Outro'
  pronome: string   // 'Ela', 'Ele', ''
  created_at?: string
}

export interface CharacterCreationRequestApi {
  id: number
  nome: string
  avatar_url: string | null
  email: string
  username: string
  indole_id: number | null
  indole?: IndoleApi | null
  genero_id: number | null
  genero?: GeneroApi | null
  aparencia_fisica: string
  historia_texto: string | null
  historia_doc_url: string | null
  status: 'pendente' | 'aprovado' | 'rejeitado'
  rejeitado_motivo: string | null
  revisado_em: string | null
  revisado_por: string | null
  created_at: string
  updated_at: string
}

// ─── API interfaces ──────────────────────────────────────────────────────────

export interface UsuarioApi {
  id: string   // UUID do auth.users — mantém string
  email: string | undefined
}

export interface LayoutApi {
  titulo: string
  subtitulo: string
  backgroundImage: string
}

export interface PersonagemPublicoApi {
  characterId: number | string
  name: string
  level: number
  avatarUrl: string | null
  classe: string | null
  avatarFocalPoint: string | null
  modalHeroPosition: string | null
}

export interface PersonagemApi {
  characterId: number | string
  userId: string        // UUID auth.users
  campaignId: string | null
  name: string
  username: string | null
  level: number
  data: any
  avatarUrl: string | null
  racaId: number | null
  classeId: number | null
  passadoId: number | null
  deusId: number | null
  onboardingCompleto: boolean
  status: string
  indoleId: number | null
  indole?: IndoleApi | null
  generoId: number | null
  genero?: GeneroApi | null
  aparenciaFisica: string | null
  historiaTexto: string | null
  historiaDocUrl: string | null
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
  indoleId?: number | null
  generoId?: number | null
  aparenciaFisica?: string
  historiaTexto?: string
  historiaDocUrl?: string
}

export interface EditarPersonagemDto {
  name?: string
  level?: number
  campaignId?: string
  avatarUrl?: string
  data?: Json
  indoleId?: number | null
  generoId?: number | null
  aparenciaFisica?: string
  historiaTexto?: string
  historiaDocUrl?: string
}

export interface SolicitarAlteracaoPersonagemDto {
  name?: string
  avatarUrl?: string
  history?: string
  historyDocumentPath?: string
  historyDocumentName?: string
  historyDocumentMimeType?: string
  indoleId?: number
  deusId?: number | null
}

export interface AprovacaoPendenteApi {
  characterId: number | string
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
  currentIndoleId: number | null
  requestedIndoleId: number | null
  currentDeusId?: number | null
  requestedDeusId?: number | null
}

export interface PointOfInterestApi {
  id?: number | string
  name: string
  x: number
  y: number
  description?: string
  targetCityMapId?: number | string
  targetLabel?: string
}

export interface GodApi {
  id: number | string
  name: string
  description: string
  title: string
  indole: string        // código: 'bom', 'neutro', 'ruim', etc.
  indole_id: number | null
  indole_obj?: IndoleApi | null  // objeto completo quando joined
  dogma: string
  anatema: string
  weapons: string
  shortDescription: string
  imageUrl: string
  createdAt?: string
  updatedAt?: string
}

export interface CityMapApi {
  id: number | string
  name: string
  mapReference: string
  description: string
  imageUrl: string
  citySlug: string
  cityName: string
  cityDescription: string
  cityCulture: string
  mapType: 'city' | 'localized'
  parentCityMapId: number | string | null
  pointsOfInterest: PointOfInterestApi[]
  createdAt?: string
  updatedAt?: string
}

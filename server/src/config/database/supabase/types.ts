export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Vamos criar as tabelas depois, por enquanto deixa vazio
      characters: {
        Row: {
          id: string
          created_at: string
          user_id: string
          campaign_id?: string | null
          name: string
          level: number
          data: Json // aqui vai todo o sheet do personagem (flexível)
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          campaign_id?: string | null
          name: string
          level?: number
          data?: Json
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          campaign_id?: string | null
          name?: string
          level?: number
          data?: Json
        }
      }
      // mais tabelas virão depois...
    }
  }
}
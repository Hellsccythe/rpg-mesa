export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string;
          user_id: string;
          campaign_id: string | null;
          name: string;
          level: number;
          data: Json;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          campaign_id?: string | null;
          name: string;
          level?: number;
          data?: Json;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          campaign_id?: string | null;
          name?: string;
          level?: number;
          data?: Json;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
      character_creation_whitelist: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
          updated_by: string | null;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
          deleted_by?: string | null;
        };
      };
    };
  };
}

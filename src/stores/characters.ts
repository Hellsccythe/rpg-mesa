// src/stores/characters.ts
import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/supabase'

type Character = Database['public']['Tables']['characters']['Row']
type CharacterInsert = Database['public']['Tables']['characters']['Insert']

export const useCharactersStore = defineStore('characters', {
  state: () => ({
    characters: [] as Character[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    myCharacters: (state) => state.characters,
  },

  actions: {
    async fetchCharacters() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        this.characters = data || []
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar personagens'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    // ==================== CRIAR PERSONAGEM COM AVATAR ====================
    async createCharacter(payload: {
      name: string
      level?: number
      data?: any          // aqui vai stats, classes, etc.
    }, avatarFile?: File) {
      this.loading = true
      this.error = null

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Usuário não autenticado')

        let avatar_url: string | null = null

        // Upload do avatar (se enviado)
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop() || 'jpg'
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
          const filePath = `${user.id}/${fileName}`   // pasta por user_id

          const { error: uploadError } = await supabase.storage
            .from('character-avatars')
            .upload(filePath, avatarFile, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('character-avatars')
            .getPublicUrl(filePath)

          avatar_url = urlData.publicUrl
        }

        // Dados completos do personagem
        const characterData: CharacterInsert = {
          user_id: user.id,
          name: payload.name,
          level: payload.level || 1,
          data: {
            ...payload.data,
            avatar_url,
            xp: payload.data?.xp || 0,
            stats: payload.data?.stats || {},
            skills: payload.data?.skills || [],
            classes: payload.data?.classes || [],
            titles: payload.data?.titles || [],
            equipment: payload.data?.equipment || {},
            inventory: payload.data?.inventory || { gold: 0, items: [] },
            appearance: payload.data?.appearance || '',
            background: payload.data?.background || '',
            indole: payload.data?.indole || 'neutro',
          }
        }

        const { data, error } = await supabase
          .from('characters')
          .insert(characterData)
          .select()
          .single()

        if (error) throw error

        // Atualiza lista local
        this.characters.unshift(data!)
        return data
      } catch (err: any) {
        this.error = err.message || 'Erro ao criar personagem'
        console.error('Erro createCharacter:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    // TODO: implementar deleteCharacter + remover arquivo do storage
    async deleteCharacter(id: string) {
      console.warn('DeleteCharacter ainda não implementado')
    }
  }
})
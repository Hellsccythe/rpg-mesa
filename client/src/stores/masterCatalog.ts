import { defineStore } from 'pinia'
import type { PersonagemApi } from '@/types/supabase'
import { createGod as createGodApi } from '@/lib/api/gods.api'
import { createCityMap as createCityMapApi } from '@/lib/api/city-maps.api'
import { createClass as createClassApi } from '@/lib/api/classes.api'
import { addSkillToCharacter as addSkillToCharacterApi } from '@/lib/api/skills.api'
import {
  addTitleToCharacter as addTitleToCharacterApi,
  createTitle as createTitleApi,
} from '@/lib/api/titulos.api'
import { addAdventureNoteToCharacter as addAdventureNoteToCharacterApi } from '@/lib/api/personagens.api'

export const useMasterCatalogStore = defineStore('masterCatalog', {
  state: () => ({
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async createGod(payload: { name: string; description?: string }) {
      this.loading = true
      this.error = null
      try {
        return await createGodApi(payload)
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao salvar deus'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createCityMap(payload: { name: string; mapReference: string; description?: string }) {
      this.loading = true
      this.error = null
      try {
        return await createCityMapApi(payload)
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao salvar cidade'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createClass(payload: {
      name: string
      tier: string
      description: string
      maxLevel?: number
    }) {
      this.loading = true
      this.error = null
      try {
        return await createClassApi(payload)
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao salvar classe'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createTitle(payload: { name: string; tier: string; description: string }) {
      this.loading = true
      this.error = null
      try {
        return await createTitleApi(payload)
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao salvar título'
        throw err
      } finally {
        this.loading = false
      }
    },

    async addSkillToCharacter(characterId: string, skillName: string) {
      this.loading = true
      this.error = null
      try {
        return await addSkillToCharacterApi(characterId, skillName)
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao adicionar skill'
        throw err
      } finally {
        this.loading = false
      }
    },

    async addTitleToCharacter(characterId: string, titleName: string) {
      this.loading = true
      this.error = null
      try {
        return await addTitleToCharacterApi(characterId, titleName)
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao adicionar título'
        throw err
      } finally {
        this.loading = false
      }
    },

    async addAdventureNoteToCharacter(characterId: string, note: string) {
      this.loading = true
      this.error = null
      try {
        return (await addAdventureNoteToCharacterApi(characterId, note)) as PersonagemApi
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao adicionar nota'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})

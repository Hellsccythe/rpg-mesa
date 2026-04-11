import { defineStore } from 'pinia'
import type { CityMapApi, GodApi, PersonagemApi, PointOfInterestApi } from '@/types/supabase'
import {
  createGod as createGodApi,
  listGods as listGodsApi,
  listPublicGods as listPublicGodsApi,
  updateGod as updateGodApi,
} from '@/lib/api/gods.api'
import {
  createCityMap as createCityMapApi,
  listCityMaps as listCityMapsApi,
  updateCityMap as updateCityMapApi,
} from '@/lib/api/city-maps.api'
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
    gods: [] as GodApi[],
    cityMaps: [] as CityMapApi[],
  }),

  actions: {
    async fetchGods() {
      this.loading = true
      this.error = null
      try {
        const data = await listGodsApi()
        this.gods = data
        return data
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Erro ao listar deuses'

        try {
          const fallbackData = await listPublicGodsApi()
          this.gods = fallbackData
          this.error = `${message} (fallback publico ativo)`
          return fallbackData
        } catch {
          this.error = message
          throw err
        }
      } finally {
        this.loading = false
      }
    },

    async createGod(payload: {
      name: string
      description?: string
      title?: string
      indole?: string
      dogma?: string
      anatema?: string
      weapons?: string
      shortDescription?: string
      imageUrl?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const created = await createGodApi(payload)
        this.gods.unshift(created)
        return created
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao salvar deus'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateGod(
      godId: string,
      payload: {
        name?: string
        description?: string
        title?: string
        indole?: string
        dogma?: string
        anatema?: string
        weapons?: string
        shortDescription?: string
        imageUrl?: string
      },
    ) {
      this.loading = true
      this.error = null
      try {
        const updated = await updateGodApi(godId, payload)
        const idx = this.gods.findIndex((item) => item.id === godId)
        if (idx !== -1) this.gods[idx] = updated
        else this.gods.unshift(updated)
        return updated
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao editar deus'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchCityMaps() {
      this.loading = true
      this.error = null
      try {
        const data = await listCityMapsApi()
        this.cityMaps = data
        return data
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao listar mapas'
        throw err
      } finally {
        this.loading = false
      }
    },

    async createCityMap(payload: {
      name: string
      mapReference: string
      description?: string
      imageUrl?: string
      pointsOfInterest?: PointOfInterestApi[]
      citySlug?: string
      cityName?: string
      cityDescription?: string
      cityCulture?: string
      mapType?: 'city' | 'localized'
      parentCityMapId?: string
    }) {
      this.loading = true
      this.error = null
      try {
        const created = await createCityMapApi(payload)
        this.cityMaps.unshift(created)
        return created
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao salvar cidade'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateCityMap(
      cityMapId: string,
      payload: {
        name?: string
        mapReference?: string
        description?: string
        imageUrl?: string
        pointsOfInterest?: PointOfInterestApi[]
        citySlug?: string
        cityName?: string
        cityDescription?: string
        cityCulture?: string
        mapType?: 'city' | 'localized'
        parentCityMapId?: string
      },
    ) {
      this.loading = true
      this.error = null
      try {
        const updated = await updateCityMapApi(cityMapId, payload)
        const idx = this.cityMaps.findIndex((item) => item.id === cityMapId)
        if (idx !== -1) this.cityMaps[idx] = updated
        else this.cityMaps.unshift(updated)
        return updated
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao editar mapa'
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

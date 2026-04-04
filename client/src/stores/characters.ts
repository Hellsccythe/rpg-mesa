// src/stores/characters.ts
import { defineStore } from 'pinia'
import { api } from '@/plugins/axios'
import type {
  EditarPersonagemDto,
  ListarPersonagemDto,
  PaginaInicialApi,
  PersonagemApi,
  PersonagemPublicoApi,
  SalvarPersonagemDto,
} from '@/types/supabase'

export const useCharactersStore = defineStore('characters', {
  state: () => ({
    publicCharacters: [] as PersonagemPublicoApi[],
    myCharacters: [] as PersonagemApi[],
    layout: null as PaginaInicialApi['layout'] | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    /**
     * Carregamento inicial da página: pública, sem autenticação necessária.
     */
    async fetchPaginaInicial() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get<PaginaInicialApi>('/personagens/pagina')
        this.layout = response.data.layout
        this.publicCharacters = response.data.personagens
      } catch (err: any) {
        this.error = err.message || 'Erro ao carregar página'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    /**
     * Recarrega apenas a lista de personagens (para tabelas com filtros).
     */
    async fetchCharacters(filtro: ListarPersonagemDto = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/personagens', { params: filtro })
        this.myCharacters = response.data as PersonagemApi[]
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar personagens'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchCharacterById(characterId: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.get<PersonagemApi>(`/personagens/${characterId}`)
        const idx = this.myCharacters.findIndex((char) => char.characterId === characterId)
        if (idx !== -1) this.myCharacters[idx] = data
        else this.myCharacters.unshift(data)
        return data
      } catch (err: any) {
        this.error = err.message || 'Erro ao carregar personagem'
        console.error('Erro fetchCharacterById:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async createCharacter(payload: SalvarPersonagemDto, avatarFile?: File) {
      this.loading = true
      this.error = null
      try {
        if (avatarFile) {
          console.warn('Upload de avatar via API ainda não implementado.')
        }
        const { data } = await api.post<PersonagemApi>('/personagens', payload)
        this.myCharacters.unshift(data)
        return data
      } catch (err: any) {
        this.error = err.message || 'Erro ao criar personagem'
        console.error('Erro createCharacter:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async editCharacter(characterId: string, payload: EditarPersonagemDto) {
      this.loading = true
      this.error = null
      try {
        const { data } = await api.patch<PersonagemApi>(`/personagens/${characterId}`, payload)
        const idx = this.myCharacters.findIndex((char) => char.characterId === characterId)
        if (idx !== -1) this.myCharacters[idx] = data
        return data
      } catch (err: any) {
        this.error = err.message || 'Erro ao editar personagem'
        console.error('Erro editCharacter:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteCharacter(id: string) {
      console.warn('DeleteCharacter ainda não implementado', id)
    },
  },
})

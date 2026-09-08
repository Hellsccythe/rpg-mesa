// src/stores/characters.ts
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import {
  editCharacter as editCharacterApi,
  uploadAvatarPersonagem,
  uploadHistoriaPersonagem,
  getCharacterById,
  getPaginaInicial,
  listMyCharacters,
  requestCharacterChange as requestCharacterChangeApi,
} from '@/lib/api/personagens.api'
import type {
  EditarPersonagemDto,
  Json,
  ListarPersonagemDto,
  PaginaInicialApi,
  PersonagemApi,
  PersonagemPublicoApi,
  SalvarPersonagemDto,
  SolicitarAlteracaoPersonagemDto,
} from '@/types/api'

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
    async fetchPaginaInicial(campaignSlug?: string) {
      this.loading = true
      this.error = null
      try {
        const data = await getPaginaInicial(campaignSlug)
        this.layout = data.layout
        this.publicCharacters = data.personagens
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
        this.myCharacters = await listMyCharacters(filtro)
      } catch (err: any) {
        this.error = err.message || 'Erro ao buscar personagens'
        console.error(err)
      } finally {
        this.loading = false
      }
    },

    async fetchCharacterById(characterId: string | number) {
      this.loading = true
      this.error = null
      try {
        const data = await getCharacterById(characterId)
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

    async editCharacter(characterId: string | number, payload: EditarPersonagemDto) {
      this.loading = true
      this.error = null
      try {
        const data = await editCharacterApi(characterId, payload)
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

    async requestCharacterChange(characterId: string | number, payload: SolicitarAlteracaoPersonagemDto) {
      this.loading = true
      this.error = null
      try {
        const data = await requestCharacterChangeApi(characterId, payload)
        const idx = this.myCharacters.findIndex((char) => char.characterId === characterId)
        if (idx !== -1) this.myCharacters[idx] = data
        return data
      } catch (err: any) {
        this.error = err.message || 'Erro ao solicitar alteração'
        console.error('Erro requestCharacterChange:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async requestCharacterChangeWithFiles(
      characterId: string | number,
      payload: SolicitarAlteracaoPersonagemDto,
      avatarFile?: File,
      historyDocFile?: File,
    ) {
      this.loading = true
      this.error = null
      try {
        const finalPayload: SolicitarAlteracaoPersonagemDto = { ...payload }

        // Os arquivos sobem pelo backend, que confere se o personagem é de
        // quem está enviando. Grava-se o caminho relativo.
        if (avatarFile) {
          finalPayload.avatarUrl = (await uploadAvatarPersonagem(characterId, avatarFile)).path
        }

        if (historyDocFile) {
          const documento = await uploadHistoriaPersonagem(characterId, historyDocFile)
          finalPayload.historyDocumentPath = documento.path
          finalPayload.historyDocumentName = documento.name
          finalPayload.historyDocumentMimeType = documento.mimeType ?? undefined
        }

        const data = await requestCharacterChangeApi(characterId, finalPayload)
        const idx = this.myCharacters.findIndex((char) => char.characterId === characterId)
        if (idx !== -1) this.myCharacters[idx] = data
        return data
      } catch (err: any) {
        this.error = err.message || 'Erro ao solicitar alteração'
        console.error('Erro requestCharacterChangeWithFiles:', err)
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

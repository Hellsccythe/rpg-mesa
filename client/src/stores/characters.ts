// src/stores/characters.ts
import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { uploadAvatar, uploadHistoryDocument } from '@/lib/supabase/storage'
import {
  createCharacter as createCharacterApi,
  editCharacter as editCharacterApi,
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
        const data = await getPaginaInicial()
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

    async fetchCharacterById(characterId: string) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const data = await getCharacterById(characterId, authStore.eMestre)
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

    async createCharacter(payload: SalvarPersonagemDto, avatarFile?: File, historyDocFile?: File) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const userId = authStore.usuario?.id
        if (!userId) throw new Error('Usuário não autenticado')

        const dataPayload: Record<string, Json | undefined> =
          payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
            ? { ...(payload.data as Record<string, Json | undefined>) }
            : {}

        let avatarUrl = payload.avatarUrl
        if (avatarFile) {
          avatarUrl = await uploadAvatar(avatarFile, userId)
        }

        if (historyDocFile) {
          const uploadedDoc = await uploadHistoryDocument(historyDocFile, userId)
          dataPayload.historyDocumentPath = uploadedDoc.path
          dataPayload.historyDocumentName = uploadedDoc.name
          dataPayload.historyDocumentMimeType = uploadedDoc.mimeType
        }

        const data = await createCharacterApi({
          ...payload,
          avatarUrl,
          data: dataPayload,
        })
        this.myCharacters.unshift(data)
        return data
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Erro ao criar personagem'
        this.error = message
        console.error('Erro createCharacter:', err)
        throw new Error(message)
      } finally {
        this.loading = false
      }
    },

    async editCharacter(characterId: string, payload: EditarPersonagemDto) {
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

    async requestCharacterChange(characterId: string, payload: SolicitarAlteracaoPersonagemDto) {
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
      characterId: string,
      payload: SolicitarAlteracaoPersonagemDto,
      avatarFile?: File,
      historyDocFile?: File,
    ) {
      this.loading = true
      this.error = null
      try {
        const authStore = useAuthStore()
        const userId = authStore.usuario?.id
        if (!userId) throw new Error('Usuário não autenticado')

        const finalPayload: SolicitarAlteracaoPersonagemDto = { ...payload }

        if (avatarFile) {
          finalPayload.avatarUrl = await uploadAvatar(avatarFile, userId)
        }

        if (historyDocFile) {
          const uploadedDoc = await uploadHistoryDocument(historyDocFile, userId)
          finalPayload.historyDocumentPath = uploadedDoc.path
          finalPayload.historyDocumentName = uploadedDoc.name
          finalPayload.historyDocumentMimeType = uploadedDoc.mimeType ?? undefined
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

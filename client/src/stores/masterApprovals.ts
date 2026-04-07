import { defineStore } from 'pinia'
import type { AprovacaoPendenteApi, PersonagemApi } from '@/types/supabase'
import {
  listPendingApprovals,
  reviewPendingApproval as reviewPendingApprovalApi,
} from '@/lib/api/personagens.api'

export const useMasterApprovalsStore = defineStore('masterApprovals', {
  state: () => ({
    pendingApprovals: [] as AprovacaoPendenteApi[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchPendingApprovals() {
      this.loading = true
      this.error = null
      try {
        const data = await listPendingApprovals()
        this.pendingApprovals = data
        return data
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || err?.message || 'Erro ao carregar solicitações pendentes'
        throw err
      } finally {
        this.loading = false
      }
    },

    async reviewPendingApproval(characterId: string, approve: boolean) {
      this.loading = true
      this.error = null
      try {
        const data = await reviewPendingApprovalApi(characterId, approve)
        this.pendingApprovals = this.pendingApprovals.filter(
          (item) => item.characterId !== characterId,
        )
        return data as PersonagemApi
      } catch (err: any) {
        this.error = err?.response?.data?.message || err?.message || 'Erro ao revisar solicitação'
        throw err
      } finally {
        this.loading = false
      }
    },
  },
})

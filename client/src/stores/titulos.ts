import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listarCatalogoTitulos, type TituloApi } from '@/lib/api/titulos.api'

export const useTitulosStore = defineStore('titulos', () => {
  const catalogo = ref<TituloApi[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCatalogo() {
    loading.value = true
    error.value = null
    try {
      catalogo.value = await listarCatalogoTitulos()
    } catch (err: any) {
      error.value = err?.message ?? 'Erro ao carregar catálogo de títulos'
    } finally {
      loading.value = false
    }
  }

  return { catalogo, loading, error, fetchCatalogo }
})

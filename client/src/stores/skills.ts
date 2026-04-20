import { defineStore } from 'pinia'
import { ref } from 'vue'
import { listarCatalogoSkills, type SkillApi } from '@/lib/api/skills.api'

export const useSkillsStore = defineStore('skills', () => {
  const catalogo = ref<SkillApi[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCatalogo() {
    loading.value = true
    error.value = null
    try {
      catalogo.value = await listarCatalogoSkills()
    } catch (err: any) {
      error.value = err?.message ?? 'Erro ao carregar catálogo de skills'
    } finally {
      loading.value = false
    }
  }

  return { catalogo, loading, error, fetchCatalogo }
})

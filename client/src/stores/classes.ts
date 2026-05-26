import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  listarClasses,
  listarProgressaoLevel,
  escolherClasse,
  escolherSkillInicial,
  levelarClasse,
  adicionarPontosDeClasse,
  type ClasseApi,
  type LevelProgressionApi,
} from '@/lib/api/classes.api'
import type { PersonagemApi } from '@/types/supabase'

export const useClassesStore = defineStore('classes', () => {
  const classes = ref<ClasseApi[]>([])
  const levelProgression = ref<LevelProgressionApi[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchClasses() {
    loading.value = true
    error.value = null
    try {
      classes.value = await listarClasses()
    } catch (err: any) {
      error.value = err?.message ?? 'Erro ao carregar classes'
    } finally {
      loading.value = false
    }
  }

  async function fetchLevelProgression() {
    try {
      levelProgression.value = await listarProgressaoLevel()
    } catch {
      levelProgression.value = []
    }
  }

  async function pickClass(
    characterId: string | number,
    payload: { classId: string; className: string; classTier: string },
  ): Promise<PersonagemApi> {
    return escolherClasse(characterId, payload)
  }

  async function pickInitialSkill(
    characterId: string | number,
    payload: { classId: string; skillName: string },
  ): Promise<PersonagemApi> {
    return escolherSkillInicial(characterId, payload)
  }

  async function levelClass(
    characterId: string | number,
    payload: { classId: string },
  ): Promise<PersonagemApi> {
    return levelarClasse(characterId, payload)
  }

  async function addClassPoints(
    characterId: string | number,
    payload: { pontos: number },
  ): Promise<PersonagemApi> {
    return adicionarPontosDeClasse(characterId, payload)
  }

  return { classes, levelProgression, loading, error, fetchClasses, fetchLevelProgression, pickClass, pickInitialSkill, levelClass, addClassPoints }
})

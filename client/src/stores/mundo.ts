import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { listarCampanhas, listarCampanhasAdmin, type CampanhaApi } from '@/lib/api/campanhas.api'
import { gravarMundoAtivoLocal, lerMundoAtivoLocal, rotuloDoMundo, type MundoAtivo } from '@/lib/mundo-ativo'

/**
 * O mundo ativo e a lista de mundos. Quem escolhe é o mestre (pelo
 * SeletorDeMundo) ou o login por /mundo/:slug; quem lê é o interceptor do
 * axios (pelo localStorage, ver lib/mundo-ativo.ts) e as telas que mostram
 * "Mundo 2 — Elyra".
 */
export const useMundoStore = defineStore('mundo', () => {
  const mundo = ref<MundoAtivo | null>(lerMundoAtivoLocal())
  const campanhas = ref<CampanhaApi[]>([])
  const carregando = ref(false)

  const rotulo = computed(() => (mundo.value ? rotuloDoMundo(mundo.value) : ''))
  const ativas = computed(() => campanhas.value.filter((campanha) => campanha.is_active))

  /** O mestre vê todas (inclusive as inativas, que está preparando); o resto só as ativas. */
  async function carregarCampanhas(comoMestre: boolean) {
    carregando.value = true
    try {
      campanhas.value = comoMestre ? await listarCampanhasAdmin() : await listarCampanhas()
      // O mundo guardado pode ter sido apagado ou renumerado desde a última visita.
      if (mundo.value) {
        const atual = campanhas.value.find((campanha) => campanha.id === mundo.value!.id)
        if (!atual) limpar()
        else if (atual.numero !== mundo.value.numero || atual.name !== mundo.value.name || atual.slug !== mundo.value.slug) selecionar(atual)
      }
    } finally {
      carregando.value = false
    }
  }

  function selecionar(campanha: Pick<CampanhaApi, 'id' | 'numero' | 'slug' | 'name'>) {
    mundo.value = { id: campanha.id, numero: campanha.numero, slug: campanha.slug, name: campanha.name }
    gravarMundoAtivoLocal(mundo.value)
  }

  function limpar() {
    mundo.value = null
    gravarMundoAtivoLocal(null)
  }

  return { mundo, campanhas, ativas, carregando, rotulo, carregarCampanhas, selecionar, limpar }
})

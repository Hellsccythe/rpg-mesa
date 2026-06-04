// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase/client'
import { limparMetaAuthLocal, obterMetaAuthLocal, sessaoLocalExpirada } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/deuses',
      name: 'deuses',
      component: () => import('@/views/DeusesView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/cidade',
      name: 'cidade',
      component: () => import('@/views/CidadeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/classes',
      name: 'classes',
      component: () => import('@/views/ClassesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/skills',
      name: 'skills',
      component: () => import('@/views/SkillsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/titulos',
      name: 'titulos',
      component: () => import('@/views/TitulosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notas',
      name: 'notas',
      component: () => import('@/views/NotasView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/master',
      name: 'master-panel',
      component: () => import('@/views/MasterPanelView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/deuses',
      name: 'master-gods',
      component: () => import('@/views/MasterGodsView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/mapas',
      name: 'master-maps',
      component: () => import('@/views/MasterMapsView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/personagens',
      name: 'master-characters',
      component: () => import('@/views/MasterCharactersView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/equipamentos',
      name: 'master-equipamentos',
      component: () => import('@/views/MasterWeaponsView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/racas',
      name: 'master-racas',
      component: () => import('@/views/MasterRacasView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/skills',
      name: 'master-skills',
      component: () => import('@/views/MasterSkillsView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/tabelas-acessorias',
      name: 'master-tabelas-acessorias',
      component: () => import('@/views/MasterTabelasAcessoriasView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/logins',
      name: 'master-logins',
      component: () => import('@/views/MasterLoginRequestsView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/usuarios',
      name: 'master-usuarios',
      component: () => import('@/views/MasterUsersView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/imagens',
      name: 'master-imagens',
      component: () => import('@/views/MasterImagesView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/passados',
      name: 'master-passados',
      component: () => import('@/views/MasterPassadosView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/npcs',
      name: 'master-npcs',
      component: () => import('@/views/MasterNpcsView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/classes-secretas',
      name: 'master-classes-secretas',
      component: () => import('@/views/MasterClassesSecretasView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/titulos',
      name: 'master-titulos',
      component: () => import('@/views/MasterTitulosView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/master/telas',
      name: 'master-telas',
      component: () => import('@/views/MasterTelasView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/npcs',
      name: 'npcs',
      component: () => import('@/views/NpcsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/master/classes',
      name: 'master-classes',
      component: () => import('@/views/MasterClassesView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
    {
      path: '/equipamentos',
      name: 'equipamentos',
      component: () => import('@/views/EquipamentosView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/racas',
      name: 'racas',
      component: () => import('@/views/RacasView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.onError((error, to) => {
  const message = String(error?.message ?? '').toLowerCase()
  const isChunkError =
    message.includes('failed to fetch dynamically imported module') ||
    message.includes('importing a module script failed') ||
    message.includes('loading chunk') ||
    message.includes('chunkloaderror')

  if (!isChunkError) return

  const target = typeof to?.fullPath === 'string' && to.fullPath ? to.fullPath : '/'
  const separator = target.includes('?') ? '&' : '?'
  const retryUrl = `${target}${separator}retry=${Date.now()}`
  window.location.replace(retryUrl)
})

router.beforeEach(async (to) => {
  try {
    const forcarLogin = to.name === 'login' && String(to.query.force ?? '') === '1'

    if (forcarLogin) {
      return true
    }

    const {
      data: { session },
    } = await supabase.auth.getSession()
    let sessaoExpirou = false

    if (session && sessaoLocalExpirada()) {
      await supabase.auth.signOut()
      limparMetaAuthLocal()
      sessaoExpirou = true
    }

    const {
      data: { session: sessaoAtualizada },
    } = await supabase.auth.getSession()
    const metaAuth = obterMetaAuthLocal()
    const requerAuth = to.matched.some((route) => route.meta.requiresAuth)

    if (to.name === 'login' && sessaoAtualizada && metaAuth?.eMestre) {
      return { name: 'master-panel' }
    }

    if (to.name === 'login' && sessaoAtualizada && metaAuth?.idPersonagemAtivo) {
      return {
        name: 'dashboard',
        query: { characterId: metaAuth.idPersonagemAtivo },
      }
    }

    if (!requerAuth) {
      if (to.name === 'login' && sessaoExpirou) {
        return {
          name: 'login',
          query: { reason: 'session-expired' },
          replace: true,
        }
      }

      return true
    }

    if (!sessaoAtualizada || !metaAuth) {
      return sessaoExpirou
        ? {
            name: 'login',
            query: { reason: 'session-expired' },
            replace: true,
          }
        : { name: 'login' }
    }

    const requerMestre = to.matched.some((route) => route.meta.requiresMaster)
    if (requerMestre && !metaAuth.eMestre) {
      return metaAuth.idPersonagemAtivo
        ? {
            name: 'dashboard',
            query: { characterId: metaAuth.idPersonagemAtivo },
          }
        : { name: 'login' }
    }

    if (to.name === 'dashboard') {
      const idSolicitado = String(to.query.characterId ?? '').trim()

      if (metaAuth.eMestre) {
        if (!idSolicitado) {
          return { name: 'login' }
        }
        return true
      }

      if (!idSolicitado) {
        return {
          name: 'dashboard',
          query: { characterId: metaAuth.idPersonagemAtivo },
        }
      }

      if (idSolicitado !== metaAuth.idPersonagemAtivo) {
        return { name: 'login' }
      }
    }

    return true
  } catch (error) {
    console.error('router.beforeEach falhou:', error)
    limparMetaAuthLocal()

    return {
      name: 'login',
      query: { reason: 'auth-error' },
      replace: true,
    }
  }
})

export default router

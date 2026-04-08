// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase/client'
import { clearStoredAuthMeta, getStoredAuthMeta, isStoredSessionExpired } from '@/stores/auth'

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
      meta: { requiresAuth: true },
    },
    {
      path: '/master',
      name: 'master-panel',
      component: () => import('@/views/MasterPanelView.vue'),
      meta: { requiresAuth: true, requiresMaster: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  let sessionExpired = false

  if (session && isStoredSessionExpired()) {
    await supabase.auth.signOut()
    clearStoredAuthMeta()
    sessionExpired = true
  }

  const {
    data: { session: refreshedSession },
  } = await supabase.auth.getSession()
  const authMeta = getStoredAuthMeta()
  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth)

  if (to.name === 'login' && refreshedSession && authMeta?.isMaster) {
    return { name: 'master-panel' }
  }

  if (to.name === 'login' && refreshedSession && authMeta?.activeCharacterId) {
    return {
      name: 'dashboard',
      query: { characterId: authMeta.activeCharacterId },
    }
  }

  if (!requiresAuth) {
    if (to.name === 'login' && sessionExpired) {
      return {
        name: 'login',
        query: { reason: 'session-expired' },
        replace: true,
      }
    }

    return true
  }

  if (!refreshedSession || !authMeta) {
    return sessionExpired
      ? {
          name: 'login',
          query: { reason: 'session-expired' },
          replace: true,
        }
      : { name: 'login' }
  }

  const requiresMaster = to.matched.some((route) => route.meta.requiresMaster)
  if (requiresMaster && !authMeta.isMaster) {
    return authMeta.activeCharacterId
      ? {
          name: 'dashboard',
          query: { characterId: authMeta.activeCharacterId },
        }
      : { name: 'login' }
  }

  if (to.name === 'dashboard') {
    const requestedCharacterId = String(to.query.characterId ?? '').trim()

    if (authMeta.isMaster) {
      if (!requestedCharacterId) {
        return { name: 'login' }
      }
      return true
    }

    if (!requestedCharacterId) {
      return {
        name: 'dashboard',
        query: { characterId: authMeta.activeCharacterId },
      }
    }

    if (requestedCharacterId !== authMeta.activeCharacterId) {
      return { name: 'login' }
    }
  }

  return true
})

export default router

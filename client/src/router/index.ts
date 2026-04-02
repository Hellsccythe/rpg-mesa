// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase/client'

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
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.name !== 'dashboard') return true

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { name: 'login' }
  }

  return true
})

export default router

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)

  // Inicializar autenticação
  const initAuth = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session.value = currentSession
    user.value = currentSession?.user ?? null
    loading.value = false

    // Escutar mudanças de autenticação em tempo real
    supabase.auth.onAuthStateChange((_, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  }

  // Login com email e senha
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return true
  }

  // Cadastro
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return true
  }

  // Logout
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    initAuth,
    signIn,
    signUp,
    signOut,
  }
})
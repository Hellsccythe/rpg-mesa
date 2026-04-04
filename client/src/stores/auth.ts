import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

const AUTH_META_KEY = 'rpg-mesa.auth-meta'
const AUTH_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000

interface AuthMeta {
  authenticatedAt: number
  activeCharacterId: string | null
}

function readAuthMeta(): AuthMeta | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(AUTH_META_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<AuthMeta>
    if (typeof parsed.authenticatedAt !== 'number') return null

    return {
      authenticatedAt: parsed.authenticatedAt,
      activeCharacterId:
        typeof parsed.activeCharacterId === 'string' ? parsed.activeCharacterId : null,
    }
  } catch {
    return null
  }
}

function writeAuthMeta(meta: AuthMeta) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(AUTH_META_KEY, JSON.stringify(meta))
}

export function clearStoredAuthMeta() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(AUTH_META_KEY)
}

export function getStoredAuthMeta() {
  return readAuthMeta()
}

export function isStoredSessionExpired() {
  const meta = readAuthMeta()
  if (!meta) return true
  return Date.now() - meta.authenticatedAt >= AUTH_SESSION_MAX_AGE_MS
}

export async function getValidAccessToken() {
  if (isStoredSessionExpired()) {
    await supabase.auth.signOut()
    clearStoredAuthMeta()
    return null
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token ?? null
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const initialized = ref(false)
  const activeCharacterId = ref<string | null>(null)
  let unsubscribeAuthListener: (() => void) | null = null

  const isAuthenticated = computed(() => !!user.value)
  const hasValidSession = computed(() => {
    if (!session.value || !user.value) return false
    return !isStoredSessionExpired()
  })

  const clearLocalState = () => {
    session.value = null
    user.value = null
    activeCharacterId.value = null
    clearStoredAuthMeta()
  }

  const persistAuthMeta = (characterId: string | null) => {
    const current = readAuthMeta()
    writeAuthMeta({
      authenticatedAt: current?.authenticatedAt ?? Date.now(),
      activeCharacterId: characterId,
    })
    activeCharacterId.value = characterId
  }

  const setActiveCharacter = (characterId: string) => {
    persistAuthMeta(characterId)
  }

  const canReuseSessionForCharacter = (characterId: string) => {
    const meta = readAuthMeta()
    if (!meta || !session.value || !user.value) return false
    if (Date.now() - meta.authenticatedAt >= AUTH_SESSION_MAX_AGE_MS) return false
    return meta.activeCharacterId === characterId
  }

  const ensureValidSession = async () => {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession()

    if (!currentSession) {
      clearLocalState()
      loading.value = false
      initialized.value = true
      return false
    }

    const meta = readAuthMeta()
    if (!meta || Date.now() - meta.authenticatedAt >= AUTH_SESSION_MAX_AGE_MS) {
      await supabase.auth.signOut()
      clearLocalState()
      loading.value = false
      initialized.value = true
      return false
    }

    session.value = currentSession
    user.value = currentSession.user
    activeCharacterId.value = meta.activeCharacterId
    loading.value = false
    initialized.value = true
    return true
  }

  // Inicializar autenticação
  const initAuth = async () => {
    if (initialized.value) return

    await ensureValidSession()

    // Escutar mudanças de autenticação em tempo real
    if (!unsubscribeAuthListener) {
      const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (!newSession) {
          clearLocalState()
          return
        }

        const currentMeta = readAuthMeta()
        if (event === 'SIGNED_IN' && !currentMeta) {
          writeAuthMeta({
            authenticatedAt: Date.now(),
            activeCharacterId: activeCharacterId.value,
          })
        }

        session.value = newSession
        user.value = newSession?.user ?? null
        activeCharacterId.value = readAuthMeta()?.activeCharacterId ?? null
      })

      unsubscribeAuthListener = () => {
        data.subscription.unsubscribe()
        unsubscribeAuthListener = null
      }
    }
  }

  // Login com email e senha
  const signIn = async (email: string, password: string, characterId: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    writeAuthMeta({ authenticatedAt: Date.now(), activeCharacterId: characterId })
    await ensureValidSession()
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
    clearLocalState()
  }

  return {
    user,
    session,
    loading,
    initialized,
    activeCharacterId,
    isAuthenticated,
    hasValidSession,
    initAuth,
    ensureValidSession,
    setActiveCharacter,
    canReuseSessionForCharacter,
    signIn,
    signUp,
    signOut,
  }
})

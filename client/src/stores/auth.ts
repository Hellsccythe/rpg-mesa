import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

const CHAVE_META_AUTH = 'rpg-mesa.auth-meta'
const DURACAO_SESSAO_MS = 24 * 60 * 60 * 1000

interface MetaAuth {
  autenticadoEm: number
  idPersonagemAtivo: string | null
  eMestre: boolean
}

function lerMetaAuth(): MetaAuth | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(CHAVE_META_AUTH)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as Partial<MetaAuth>
    if (typeof parsed.autenticadoEm !== 'number') return null

    return {
      autenticadoEm: parsed.autenticadoEm,
      idPersonagemAtivo:
        typeof parsed.idPersonagemAtivo === 'string' ? parsed.idPersonagemAtivo : null,
      eMestre: parsed.eMestre === true,
    }
  } catch {
    return null
  }
}

function gravarMetaAuth(meta: MetaAuth) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHAVE_META_AUTH, JSON.stringify(meta))
}

export function limparMetaAuthLocal() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(CHAVE_META_AUTH)
}

export function obterMetaAuthLocal() {
  return lerMetaAuth()
}

export function sessaoLocalExpirada() {
  const meta = lerMetaAuth()
  if (!meta) return true
  return Date.now() - meta.autenticadoEm >= DURACAO_SESSAO_MS
}

export async function obterTokenDeAcesso() {
  if (sessaoLocalExpirada()) {
    await supabase.auth.signOut()
    limparMetaAuthLocal()
    return null
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token ?? null
}

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<User | null>(null)
  const sessao = ref<Session | null>(null)
  const carregando = ref(true)
  const inicializado = ref(false)
  const idPersonagemAtivo = ref<string | null>(null)
  const eMestre = ref(false)
  let cancelarEscutaAuth: (() => void) | null = null

  const estaAutenticado = computed(() => !!usuario.value)
  const temSessaoValida = computed(() => {
    if (!sessao.value || !usuario.value) return false
    return !sessaoLocalExpirada()
  })

  const limparEstadoLocal = () => {
    sessao.value = null
    usuario.value = null
    idPersonagemAtivo.value = null
    eMestre.value = false
    limparMetaAuthLocal()
  }

  const persistirMetaAuth = (idPersonagem: string | null, master = false) => {
    const atual = lerMetaAuth()
    gravarMetaAuth({
      autenticadoEm: atual?.autenticadoEm ?? Date.now(),
      idPersonagemAtivo: idPersonagem,
      eMestre: master,
    })
    idPersonagemAtivo.value = idPersonagem
    eMestre.value = master
  }

  const definirPersonagemAtivo = (idPersonagem: string) => {
    persistirMetaAuth(idPersonagem, eMestre.value)
  }

  const ativarModoMestreParaPersonagem = (idPersonagem: string) => {
    persistirMetaAuth(idPersonagem, true)
  }

  const podeReutilizarSessao = (idPersonagem: string) => {
    const meta = lerMetaAuth()
    if (!meta || !sessao.value || !usuario.value) return false
    if (Date.now() - meta.autenticadoEm >= DURACAO_SESSAO_MS) return false
    if (meta.eMestre) return true
    return meta.idPersonagemAtivo === idPersonagem
  }

  const garantirSessaoValida = async () => {
    const {
      data: { session: sessaoAtual },
    } = await supabase.auth.getSession()

    if (!sessaoAtual) {
      limparEstadoLocal()
      carregando.value = false
      inicializado.value = true
      return false
    }

    const meta = lerMetaAuth()
    if (!meta || Date.now() - meta.autenticadoEm >= DURACAO_SESSAO_MS) {
      await supabase.auth.signOut()
      limparEstadoLocal()
      carregando.value = false
      inicializado.value = true
      return false
    }

    sessao.value = sessaoAtual
    usuario.value = sessaoAtual.user
    idPersonagemAtivo.value = meta.idPersonagemAtivo
    eMestre.value = meta.eMestre === true
    carregando.value = false
    inicializado.value = true
    return true
  }

  const inicializarAuth = async () => {
    if (inicializado.value) return

    await garantirSessaoValida()

    if (!cancelarEscutaAuth) {
      const { data } = supabase.auth.onAuthStateChange((evento, novaSessao) => {
        if (!novaSessao) {
          limparEstadoLocal()
          return
        }

        const metaAtual = lerMetaAuth()
        if (evento === 'SIGNED_IN' && !metaAtual) {
          gravarMetaAuth({
            autenticadoEm: Date.now(),
            idPersonagemAtivo: idPersonagemAtivo.value,
            eMestre: eMestre.value,
          })
        }

        sessao.value = novaSessao
        usuario.value = novaSessao?.user ?? null
        idPersonagemAtivo.value = lerMetaAuth()?.idPersonagemAtivo ?? null
        eMestre.value = lerMetaAuth()?.eMestre === true
      })

      cancelarEscutaAuth = () => {
        data.subscription.unsubscribe()
        cancelarEscutaAuth = null
      }
    }
  }

  const entrar = async (
    email: string,
    senha: string,
    idPersonagem: string | null,
    opcoes?: { comoMestre?: boolean },
  ) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw error
    const comoMestre = opcoes?.comoMestre === true
    gravarMetaAuth({
      autenticadoEm: Date.now(),
      idPersonagemAtivo: comoMestre ? null : idPersonagem,
      eMestre: comoMestre,
    })
    await garantirSessaoValida()
    return true
  }

  const cadastrar = async (email: string, senha: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password: senha })
    if (error) throw error
    // Supabase retorna user: null silenciosamente quando o email já existe
    if (!data.user) throw new Error('User already registered')
    return true
  }

  const sair = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    limparEstadoLocal()
  }

  return {
    usuario,
    sessao,
    carregando,
    inicializado,
    idPersonagemAtivo,
    eMestre,
    estaAutenticado,
    temSessaoValida,
    inicializarAuth,
    garantirSessaoValida,
    definirPersonagemAtivo,
    ativarModoMestreParaPersonagem,
    podeReutilizarSessao,
    entrar,
    cadastrar,
    sair,
  }
})

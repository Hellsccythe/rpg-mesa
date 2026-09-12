import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

/**
 * Autenticação própria, sem Supabase. O backend emite um JWT no login e o
 * valida a cada requisição; o navegador só guarda o token e alguns metadados
 * de sessão. Não há sessão no servidor para invalidar — sair é apagar o que
 * está guardado aqui.
 */

const CHAVE_META_AUTH = 'rpg-mesa.auth-meta'
const CHAVE_TOKEN = 'rpg-mesa.token'
const DURACAO_SESSAO_MS = 24 * 60 * 60 * 1000

const BASE_API = import.meta.env.VITE_API_BASE_URL ?? '/api'

export interface UsuarioAutenticado {
  id: number
  email: string
  username: string | null
  tipo: 'gm' | 'player'
}

interface MetaAuth {
  autenticadoEm: number
  idPersonagemAtivo: string | null
  eMestre: boolean
  campanhaSlug?: string | null
  usuario?: UsuarioAutenticado | null
  /**
   * Gravado junto com a sessão de propósito: a obrigação de trocar a senha
   * vinha só na resposta do login e vivia na memória do store, então um F5
   * restaurava a sessão sem ela — e o jogador seguia com o `12345` do
   * "Reset Padrão" para sempre. Só `trocarSenha` apaga esta marca.
   */
  precisaTrocarSenha?: boolean
}

function lerMetaAuth(): MetaAuth | null {
  if (typeof window === 'undefined') return null

  const bruto = window.localStorage.getItem(CHAVE_META_AUTH)
  if (!bruto) return null

  try {
    const analisado = JSON.parse(bruto) as Partial<MetaAuth>
    if (typeof analisado.autenticadoEm !== 'number') return null

    return {
      autenticadoEm: analisado.autenticadoEm,
      idPersonagemAtivo:
        typeof analisado.idPersonagemAtivo === 'string' ? analisado.idPersonagemAtivo : null,
      eMestre: analisado.eMestre === true,
      campanhaSlug: analisado.campanhaSlug ?? null,
      usuario: analisado.usuario ?? null,
      precisaTrocarSenha: analisado.precisaTrocarSenha === true,
    }
  } catch {
    return null
  }
}

function gravarMetaAuth(meta: MetaAuth) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHAVE_META_AUTH, JSON.stringify(meta))
}

function lerToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(CHAVE_TOKEN)
}

function gravarToken(token: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CHAVE_TOKEN, token)
}

export function limparMetaAuthLocal() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(CHAVE_META_AUTH)
  window.localStorage.removeItem(CHAVE_TOKEN)
}

/** Leitura direta do token, para quem precisa saber se há sessão sem montar o store. */
export function obterTokenLocal(): string | null {
  return lerToken()
}

export function obterMetaAuthLocal() {
  return lerMetaAuth()
}

export function sessaoLocalExpirada() {
  const meta = lerMetaAuth()
  if (!meta) return true
  return Date.now() - meta.autenticadoEm >= DURACAO_SESSAO_MS
}

/**
 * Usado pelo interceptor do axios. Não faz requisição: o token está guardado
 * localmente e o servidor o valida a cada chamada.
 */
export async function obterTokenDeAcesso(): Promise<string | null> {
  const token = lerToken()
  if (!token) {
    limparMetaAuthLocal()
    return null
  }

  if (sessaoLocalExpirada()) {
    limparMetaAuthLocal()
    return null
  }

  return token
}

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref<UsuarioAutenticado | null>(null)
  const token = ref<string | null>(null)
  const carregando = ref(true)
  const inicializado = ref(false)
  const idPersonagemAtivo = ref<string | null>(null)
  const eMestre = ref(false)
  const precisaTrocarSenha = ref(false)

  const estaAutenticado = computed(() => !!usuario.value && !!token.value)
  const temSessaoValida = computed(() => estaAutenticado.value && !sessaoLocalExpirada())

  const limparEstadoLocal = () => {
    token.value = null
    usuario.value = null
    idPersonagemAtivo.value = null
    eMestre.value = false
    precisaTrocarSenha.value = false
    limparMetaAuthLocal()
  }

  const persistirMetaAuth = (idPersonagem: string | null, master = false) => {
    const atual = lerMetaAuth()
    gravarMetaAuth({
      autenticadoEm: atual?.autenticadoEm ?? Date.now(),
      idPersonagemAtivo: idPersonagem,
      eMestre: master,
      campanhaSlug: atual?.campanhaSlug ?? null,
      usuario: usuario.value,
      precisaTrocarSenha: precisaTrocarSenha.value,
    })
    idPersonagemAtivo.value = idPersonagem
    eMestre.value = master
  }

  const definirPersonagemAtivo = (idPersonagem: string | number) => {
    persistirMetaAuth(String(idPersonagem), eMestre.value)
  }

  const ativarModoMestreParaPersonagem = (idPersonagem: string | number) => {
    persistirMetaAuth(String(idPersonagem), true)
  }

  const podeReutilizarSessao = (idPersonagem: string | number) => {
    const meta = lerMetaAuth()
    if (!meta || !token.value || !usuario.value) return false
    if (Date.now() - meta.autenticadoEm >= DURACAO_SESSAO_MS) return false
    if (meta.eMestre) return true
    return meta.idPersonagemAtivo === String(idPersonagem)
  }

  /** Restaura a sessão a partir do que está guardado, sem pedir senha. */
  const garantirSessaoValida = async () => {
    const tokenGuardado = lerToken()
    const meta = lerMetaAuth()

    if (!tokenGuardado || !meta || sessaoLocalExpirada()) {
      limparEstadoLocal()
      carregando.value = false
      inicializado.value = true
      return false
    }

    token.value = tokenGuardado
    usuario.value = meta.usuario ?? null
    idPersonagemAtivo.value = meta.idPersonagemAtivo
    eMestre.value = meta.eMestre === true
    precisaTrocarSenha.value = meta.precisaTrocarSenha === true
    carregando.value = false
    inicializado.value = true
    return true
  }

  const inicializarAuth = async () => {
    if (inicializado.value) return
    await garantirSessaoValida()
  }

  /**
   * identificador é o username (jogador) ou o email real (mestre) — o backend
   * aceita os dois. O email sintético username@rpg.internal era exigência do
   * Supabase Auth e deixou de existir.
   */
  const entrar = async (
    identificador: string,
    senha: string,
    idPersonagem: string | number | null,
    opcoes?: { comoMestre?: boolean; campanhaSlug?: string | null },
  ) => {
    const { data } = await axios.post(`${BASE_API}/auth/login`, {
      identificador: identificador.trim(),
      senha,
    })

    const comoMestre = opcoes?.comoMestre === true

    token.value = data.tokenAcesso
    usuario.value = { ...data.usuario, tipo: data.tipo }
    precisaTrocarSenha.value = data.precisaTrocarSenha === true

    gravarToken(data.tokenAcesso)
    gravarMetaAuth({
      autenticadoEm: Date.now(),
      idPersonagemAtivo: comoMestre ? null : idPersonagem != null ? String(idPersonagem) : null,
      eMestre: comoMestre,
      campanhaSlug: opcoes?.campanhaSlug ?? null,
      usuario: usuario.value,
      precisaTrocarSenha: precisaTrocarSenha.value,
    })

    idPersonagemAtivo.value = comoMestre ? null : idPersonagem != null ? String(idPersonagem) : null
    eMestre.value = comoMestre
    carregando.value = false
    inicializado.value = true
    return true
  }

  /** Troca da própria senha; encerra a obrigação vinda do "Reset Padrão". */
  const trocarSenha = async (novaSenha: string) => {
    await axios.patch(
      `${BASE_API}/auth/trocar-senha`,
      { novaSenha },
      { headers: { Authorization: `Bearer ${token.value}` } },
    )
    precisaTrocarSenha.value = false
    const meta = lerMetaAuth()
    if (meta) gravarMetaAuth({ ...meta, precisaTrocarSenha: false })
  }

  /** Sem sessão no servidor para invalidar: sair é apagar o que está local. */
  const sair = async () => {
    limparEstadoLocal()
  }

  return {
    usuario,
    token,
    carregando,
    inicializado,
    idPersonagemAtivo,
    eMestre,
    precisaTrocarSenha,
    estaAutenticado,
    temSessaoValida,
    inicializarAuth,
    garantirSessaoValida,
    definirPersonagemAtivo,
    ativarModoMestreParaPersonagem,
    podeReutilizarSessao,
    entrar,
    trocarSenha,
    sair,
  }
})

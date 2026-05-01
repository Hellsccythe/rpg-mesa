import { supabase } from '@/lib/supabase/client'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export type Habilidade = { nome: string; descricao: string }
export type AtributoBonus = { atributo: string; valor: string }

export type RacaApi = {
  id: string
  nome: string
  foto_url: string | null
  descricao: string | null
  lore: string | null
  habilidades: Habilidade[]
  atributos_bonus: AtributoBonus[]
  createdAt?: string
  updatedAt?: string
}

export type CriarRacaPayload = {
  nome: string
  foto_url?: string | null
  descricao?: string | null
  lore?: string | null
  habilidades?: Habilidade[]
  atributos_bonus?: AtributoBonus[]
}

export type EditarRacaPayload = Partial<CriarRacaPayload>

async function getAuthHeader(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function listarRacasPublicas(): Promise<RacaApi[]> {
  const res = await fetch(`${API_BASE}/api/racas`)
  if (!res.ok) throw new Error('Erro ao listar raças')
  return res.json()
}

export async function listarRacasAdmin(): Promise<RacaApi[]> {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/api/racas/admin`, { headers })
  if (!res.ok) throw new Error('Erro ao listar raças (admin)')
  return res.json()
}

export async function criarRaca(payload: CriarRacaPayload): Promise<RacaApi> {
  const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' }
  const res = await fetch(`${API_BASE}/api/racas/admin`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Erro ao criar raça')
  }
  return res.json()
}

export async function editarRaca(id: string, payload: EditarRacaPayload): Promise<RacaApi> {
  const headers = { ...(await getAuthHeader()), 'Content-Type': 'application/json' }
  const res = await fetch(`${API_BASE}/api/racas/admin/${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Erro ao editar raça')
  }
  return res.json()
}

export async function deletarRaca(id: string): Promise<void> {
  const headers = await getAuthHeader()
  const res = await fetch(`${API_BASE}/api/racas/admin/${id}`, { method: 'DELETE', headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message ?? 'Erro ao deletar raça')
  }
}

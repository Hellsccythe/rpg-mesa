import { api } from '@/plugins/axios'

export type UsuarioPersonagem = {
  id: number
  name: string
  username: string | null
  raca_id: number | null
  level: number
  avatar_url: string | null
  /** O mundo do personagem — uma conta pode ter um por mundo. */
  campaign_id: number | null
  mundo_numero: number | null
  mundo_nome: string | null
}

export type Usuario = {
  id: number
  /** false = pré-registro: o mestre liberou o email, mas a conta ainda não existe. */
  conta_criada: boolean
  real_email: string
  username: string | null
  tipo: 'gm' | 'player'
  ativo: boolean
  /** Quantos personagens vivos a conta pode ter no mesmo mundo — o mestre decide no pré-registro. */
  limite_personagens_por_mundo: number
  created_at: string
  updated_at: string
  /** O primeiro da lista, para o que só conhece um. */
  personagem: UsuarioPersonagem | null
  /** Todos os personagens vivos da conta. */
  personagens: UsuarioPersonagem[]
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios/admin')
  return data
}

export async function editarUsuario(
  id: number,
  payload: { username?: string; tipo?: 'gm' | 'player'; nome_personagem?: string; limite_personagens_por_mundo?: number },
): Promise<Usuario> {
  const { data } = await api.patch<Usuario>(`/usuarios/admin/${id}`, payload)
  return data
}

export async function resetarSenhaPadraoUsuario(id: number): Promise<{ success: boolean }> {
  const { data } = await api.patch<{ success: boolean }>(`/usuarios/admin/${id}/resetar-senha-padrao`)
  return data
}

export async function resetarSenhaUsuario(id: number, nova_senha: string): Promise<{ success: boolean }> {
  const { data } = await api.patch<{ success: boolean }>(`/usuarios/admin/${id}/resetar-senha`, { nova_senha })
  return data
}

export async function alterarAtivoUsuario(id: number, ativo: boolean): Promise<{ success: boolean }> {
  const { data } = await api.patch<{ success: boolean }>(`/usuarios/admin/${id}/ativo`, { ativo })
  return data
}

export async function preRegistrarUsuario(
  email: string,
  tipo: 'gm' | 'player' = 'player',
  limitePersonagensPorMundo = 1,
): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>('/usuarios/admin/pre-registrar', {
    email,
    tipo,
    limite_personagens_por_mundo: limitePersonagensPorMundo,
  })
  return data
}

export async function removerPreRegistro(id: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/usuarios/admin/${id}/pre-registro`)
  return data
}

export async function deletarUsuario(id: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/usuarios/admin/${id}`)
  return data
}

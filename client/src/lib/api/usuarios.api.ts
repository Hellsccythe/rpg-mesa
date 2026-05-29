import { api } from '@/plugins/axios'

export type UsuarioPersonagem = {
  id: number
  name: string
  username: string | null
  raca_id: number | null
  level: number
  avatar_url: string | null
}

export type Usuario = {
  id: number
  auth_user_id: string | null
  real_email: string
  username: string | null
  tipo: 'gm' | 'player'
  ativo: boolean
  created_at: string
  updated_at: string
  personagem: UsuarioPersonagem | null
}

export async function listarUsuarios(): Promise<Usuario[]> {
  const { data } = await api.get<Usuario[]>('/usuarios/admin')
  return data
}

export async function editarUsuario(
  id: number,
  payload: { username?: string; tipo?: 'gm' | 'player'; nome_personagem?: string },
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
): Promise<{ success: boolean }> {
  const { data } = await api.post<{ success: boolean }>('/usuarios/admin/pre-registrar', { email, tipo })
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

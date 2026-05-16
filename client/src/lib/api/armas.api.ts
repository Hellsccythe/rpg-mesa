import { api } from '@/plugins/axios'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CategoriaEquipamento {
  item: number
  descricao: string
  classe_item?: number | null
}

export interface ClasseEquipamento {
  item: number
  descricao: string
  icone?: string | null
}

export interface TipoEquipamento {
  item: number
  descricao: string
  classe_item: number
}

export interface PropriedadeEquipamento {
  item: number
  descricao: string
  classe_item: number
}

export interface ArmaApi {
  id: string
  nome: string
  dano: string
  peso: number | null
  valor: number | null
  classe_equipamento_item: number | null
  categoria_equipamento_item: number[]
  tipo_equipamento_item: number[]
  propriedade_equipamento_item: number[]
  descricao_equipamento: string | null
  pre_requisitos: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CriarArmaPayload {
  nome: string
  dano?: string | null
  peso?: number | null
  valor?: number | null
  classe_equipamento_item?: number | null
  categoria_equipamento_item?: number[]
  tipo_equipamento_item?: number[]
  propriedade_equipamento_item?: number[]
  descricao_equipamento?: string | null
  pre_requisitos?: string | null
}

export interface EditarArmaPayload {
  nome?: string
  dano?: string | null
  peso?: number | null
  valor?: number | null
  classe_equipamento_item?: number | null
  categoria_equipamento_item?: number[]
  tipo_equipamento_item?: number[]
  propriedade_equipamento_item?: number[]
  descricao_equipamento?: string | null
  pre_requisitos?: string | null
}

// ── Equipamentos ──────────────────────────────────────────────────────────────

export async function listarArmasPublicas(): Promise<ArmaApi[]> {
  const { data } = await api.get<ArmaApi[]>('/armas')
  return data
}

export async function listarArmas(): Promise<ArmaApi[]> {
  const { data } = await api.get<ArmaApi[]>('/armas/admin')
  return data
}

export async function criarArma(payload: CriarArmaPayload): Promise<ArmaApi> {
  const { data } = await api.post<ArmaApi>('/armas/admin', payload)
  return data
}

export async function editarArma(armaId: string, payload: EditarArmaPayload): Promise<ArmaApi> {
  const { data } = await api.patch<ArmaApi>(`/armas/admin/${armaId}`, payload)
  return data
}

export async function deletarArma(armaId: string): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/${armaId}`)
  return data
}

// ── Categorias ────────────────────────────────────────────────────────────────

export async function listarCategoriasEquipamento(): Promise<CategoriaEquipamento[]> {
  const { data } = await api.get<CategoriaEquipamento[]>('/armas/categorias')
  return data
}

export async function criarCategoriaEquipamento(payload: { descricao: string; classe_item?: number | null }): Promise<CategoriaEquipamento> {
  const { data } = await api.post<CategoriaEquipamento>('/armas/admin/categorias', payload)
  return data
}

export async function editarCategoriaEquipamento(item: number, payload: { descricao?: string; classe_item?: number | null }): Promise<CategoriaEquipamento> {
  const { data } = await api.patch<CategoriaEquipamento>(`/armas/admin/categorias/${item}`, payload)
  return data
}

export async function deletarCategoriaEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/categorias/${item}`)
  return data
}

// ── Classes ───────────────────────────────────────────────────────────────────

export async function listarClassesEquipamento(): Promise<ClasseEquipamento[]> {
  const { data } = await api.get<ClasseEquipamento[]>('/armas/classes')
  return data
}

export async function criarClasseEquipamento(payload: { descricao: string; icone?: string | null }): Promise<ClasseEquipamento> {
  const { data } = await api.post<ClasseEquipamento>('/armas/admin/classes', payload)
  return data
}

export async function editarClasseEquipamento(item: number, payload: { descricao?: string; icone?: string | null }): Promise<ClasseEquipamento> {
  const { data } = await api.patch<ClasseEquipamento>(`/armas/admin/classes/${item}`, payload)
  return data
}

export async function deletarClasseEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/classes/${item}`)
  return data
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export async function listarTiposEquipamento(classeItem?: number): Promise<TipoEquipamento[]> {
  const params = classeItem !== undefined ? { classe: classeItem } : {}
  const { data } = await api.get<TipoEquipamento[]>('/armas/tipos', { params })
  return data
}

export async function criarTipoEquipamento(payload: { descricao: string; classe_item: number }): Promise<TipoEquipamento> {
  const { data } = await api.post<TipoEquipamento>('/armas/admin/tipos', payload)
  return data
}

export async function editarTipoEquipamento(item: number, payload: { descricao?: string; classe_item?: number }): Promise<TipoEquipamento> {
  const { data } = await api.patch<TipoEquipamento>(`/armas/admin/tipos/${item}`, payload)
  return data
}

export async function deletarTipoEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/tipos/${item}`)
  return data
}

// ── Propriedades ──────────────────────────────────────────────────────────────

export async function listarPropriedadesEquipamento(classeItem?: number): Promise<PropriedadeEquipamento[]> {
  const params = classeItem !== undefined ? { classe: classeItem } : {}
  const { data } = await api.get<PropriedadeEquipamento[]>('/armas/propriedades', { params })
  return data
}

export async function criarPropriedadeEquipamento(payload: { descricao: string; classe_item: number }): Promise<PropriedadeEquipamento> {
  const { data } = await api.post<PropriedadeEquipamento>('/armas/admin/propriedades', payload)
  return data
}

export async function editarPropriedadeEquipamento(item: number, payload: { descricao?: string; classe_item?: number }): Promise<PropriedadeEquipamento> {
  const { data } = await api.patch<PropriedadeEquipamento>(`/armas/admin/propriedades/${item}`, payload)
  return data
}

export async function deletarPropriedadeEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/propriedades/${item}`)
  return data
}

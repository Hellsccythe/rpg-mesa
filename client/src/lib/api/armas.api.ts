import { api } from '@/plugins/axios'

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface CategoriaEquipamento {
  item: number
  descricao: string
  icone?: string | null
}

export interface ClasseEquipamento {
  item: number
  descricao: string
}

export interface TipoEquipamento {
  item: number
  descricao: string
  categoria_item: number | null
}

export interface PropriedadeEquipamento {
  item: number
  descricao: string
  categoria_item: number | null
}

export interface ArmaApi {
  id: number
  nome: string
  /** Só a notação do dado, ex: "1d8". Vazio em item que não é arma. */
  dano: string
  /** O segundo dado dos machados. O que ele significa ainda não foi decidido. */
  dano_alternativo: string | null
  /** Quanto o dano é multiplicado no crítico (3 = x3). */
  multiplicador_critico: number | null
  /** Referência a `skill_tipo_dano.item` — mesma escala das skills. */
  tipo_dano_item: number | null
  /** Quanto a armadura absorve. É o alvo de "Golpe que Atravessa". */
  defesa_fisica: number | null
  defesa_magica: number | null
  /** Referência a `pericias.id` — sempre uma do grupo Virtude. */
  pericia_id: number | null
  /** Metros até onde o dado sai cheio. */
  alcance_ideal: number | null
  /** Metros até onde ainda dá para atacar, com o dado um passo abaixo. */
  alcance_maximo: number | null
  raridade_item: number | null
  peso: number | null
  valor: number | null
  categoria_equipamento_item: number | null
  classe_equipamento_item: number[]
  tipo_equipamento_item: number[]
  propriedade_equipamento_item: number[]
  descricao_equipamento: string | null
  pre_requisitos: string | null
  createdAt: string | null
  updatedAt: string | null
}

export interface CriarArmaPayload {
  nome: string
  dano?: string | null
  dano_alternativo?: string | null
  multiplicador_critico?: number | null
  tipo_dano_item?: number | null
  defesa_fisica?: number | null
  defesa_magica?: number | null
  pericia_id?: number | null
  alcance_ideal?: number | null
  alcance_maximo?: number | null
  raridade_item?: number | null
  peso?: number | null
  valor?: number | null
  categoria_equipamento_item?: number | null
  classe_equipamento_item?: number[]
  tipo_equipamento_item?: number[]
  propriedade_equipamento_item?: number[]
  descricao_equipamento?: string | null
  pre_requisitos?: string | null
}

export interface EditarArmaPayload {
  nome?: string
  dano?: string | null
  dano_alternativo?: string | null
  multiplicador_critico?: number | null
  tipo_dano_item?: number | null
  defesa_fisica?: number | null
  defesa_magica?: number | null
  pericia_id?: number | null
  alcance_ideal?: number | null
  alcance_maximo?: number | null
  raridade_item?: number | null
  peso?: number | null
  valor?: number | null
  categoria_equipamento_item?: number | null
  classe_equipamento_item?: number[]
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

export async function editarArma(armaId: number, payload: EditarArmaPayload): Promise<ArmaApi> {
  const { data } = await api.patch<ArmaApi>(`/armas/admin/${armaId}`, payload)
  return data
}

export async function deletarArma(armaId: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/${armaId}`)
  return data
}

// ── Categorias (primário) ─────────────────────────────────────────────────────

export async function listarCategoriasEquipamento(): Promise<CategoriaEquipamento[]> {
  const { data } = await api.get<CategoriaEquipamento[]>('/armas/categorias')
  return data
}

export async function criarCategoriaEquipamento(payload: { descricao: string; icone?: string | null }): Promise<CategoriaEquipamento> {
  const { data } = await api.post<CategoriaEquipamento>('/armas/admin/categorias', payload)
  return data
}

export async function editarCategoriaEquipamento(item: number, payload: { descricao?: string; icone?: string | null }): Promise<CategoriaEquipamento> {
  const { data } = await api.patch<CategoriaEquipamento>(`/armas/admin/categorias/${item}`, payload)
  return data
}

export async function deletarCategoriaEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/categorias/${item}`)
  return data
}

// ── Classes (secundário) ──────────────────────────────────────────────────────

export async function listarClassesEquipamento(): Promise<ClasseEquipamento[]> {
  const { data } = await api.get<ClasseEquipamento[]>('/armas/classes')
  return data
}

export async function criarClasseEquipamento(payload: { descricao: string }): Promise<ClasseEquipamento> {
  const { data } = await api.post<ClasseEquipamento>('/armas/admin/classes', payload)
  return data
}

export async function editarClasseEquipamento(item: number, payload: { descricao?: string }): Promise<ClasseEquipamento> {
  const { data } = await api.patch<ClasseEquipamento>(`/armas/admin/classes/${item}`, payload)
  return data
}

export async function deletarClasseEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/classes/${item}`)
  return data
}

// ── Tipos ─────────────────────────────────────────────────────────────────────

export async function listarTiposEquipamento(categoriaItem?: number): Promise<TipoEquipamento[]> {
  const params = categoriaItem !== undefined ? { categoria: categoriaItem } : {}
  const { data } = await api.get<TipoEquipamento[]>('/armas/tipos', { params })
  return data
}

export async function criarTipoEquipamento(payload: { descricao: string; categoria_item: number }): Promise<TipoEquipamento> {
  const { data } = await api.post<TipoEquipamento>('/armas/admin/tipos', payload)
  return data
}

export async function editarTipoEquipamento(item: number, payload: { descricao?: string; categoria_item?: number }): Promise<TipoEquipamento> {
  const { data } = await api.patch<TipoEquipamento>(`/armas/admin/tipos/${item}`, payload)
  return data
}

export async function deletarTipoEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/tipos/${item}`)
  return data
}

// ── Propriedades ──────────────────────────────────────────────────────────────

export async function listarPropriedadesEquipamento(categoriaItem?: number): Promise<PropriedadeEquipamento[]> {
  const params = categoriaItem !== undefined ? { categoria: categoriaItem } : {}
  const { data } = await api.get<PropriedadeEquipamento[]>('/armas/propriedades', { params })
  return data
}

export async function criarPropriedadeEquipamento(payload: { descricao: string; categoria_item: number }): Promise<PropriedadeEquipamento> {
  const { data } = await api.post<PropriedadeEquipamento>('/armas/admin/propriedades', payload)
  return data
}

export async function editarPropriedadeEquipamento(item: number, payload: { descricao?: string; categoria_item?: number }): Promise<PropriedadeEquipamento> {
  const { data } = await api.patch<PropriedadeEquipamento>(`/armas/admin/propriedades/${item}`, payload)
  return data
}

export async function deletarPropriedadeEquipamento(item: number): Promise<{ success: boolean }> {
  const { data } = await api.delete<{ success: boolean }>(`/armas/admin/propriedades/${item}`)
  return data
}

// ── A regra do dado fora da faixa ────────────────────────────────────────────

/**
 * A escada de dados de dano do sistema. Gravada também em `regras_do_sistema`
 * (`arma.escada_de_dados`), para a mesa poder consultar sem abrir o código.
 */
export const ESCADA_DE_DADOS = ['1d4', '1d6', '1d8', '1d10', '1d12'] as const

/**
 * Desce um passo na escada — o que acontece quando o alvo está entre
 * `alcance_ideal` e `alcance_maximo`.
 *
 * 1d4 é o piso e devolve 1d4: abaixo dele o ataque não valeria a pena, e
 * inventar 1d3 acrescentaria um degrau que não existe em nenhuma outra parte
 * do sistema. Um dado fora da escada (2d6, por exemplo) volta inalterado em
 * vez de virar `undefined` — é o que uma arma futura com dado composto faria
 * passar por aqui.
 */
export function desceUmPasso(dado: string): string {
  const posicao = ESCADA_DE_DADOS.indexOf(dado.trim() as (typeof ESCADA_DE_DADOS)[number])
  if (posicao <= 0) return dado.trim()
  return ESCADA_DE_DADOS[posicao - 1]
}

/**
 * O dano que a arma realmente causa a uma dada distância, em metros.
 *
 * Devolve `null` quando não há ataque possível — além do alcance máximo. Em
 * corpo a corpo (alvo colado) uma arma de longo alcance cai para 1d4 e perde o
 * multiplicador de crítico: é regra do sistema
 * (`arma.longo_alcance_em_corpo_a_corpo`) e vale para arco, besta e arma de
 * fogo, e não uma coluna repetida em cada registro.
 */
export function danoNaDistancia(
  arma: Pick<ArmaApi, 'dano' | 'alcance_ideal' | 'alcance_maximo' | 'multiplicador_critico'>,
  metros: number,
): { dado: string; critico: number | null; observacao: string } | null {
  const ideal = arma.alcance_ideal ?? 0
  const maximo = arma.alcance_maximo ?? ideal

  if (metros > maximo) return null

  // Só é "corpo a corpo demais" quem foi feito para atirar: uma espada com
  // ideal 2 não sofre nada a 1 metro.
  const eDeLongoAlcance = ideal > 3
  if (eDeLongoAlcance && metros <= 2) {
    return { dado: '1d4', critico: null, observacao: 'Corpo a corpo: sem multiplicador de crítico.' }
  }

  if (metros <= ideal) {
    return { dado: arma.dano, critico: arma.multiplicador_critico, observacao: 'Dentro da faixa ideal.' }
  }

  return {
    dado: desceUmPasso(arma.dano),
    critico: arma.multiplicador_critico,
    observacao: 'Fora da faixa ideal: o dado desce um passo.',
  }
}

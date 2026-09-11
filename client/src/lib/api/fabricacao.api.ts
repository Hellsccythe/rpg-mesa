import { api } from '@/plugins/axios'
import type { InventarioApi, Qualidade, TabelaDeInventario } from './inventario.api'

/** As quatro saídas da escada (docs/FABRICAR.pdf). `desastre` não produz item. */
export type ResultadoDeFabricacao = 'desastre' | Qualidade

export const ROTULO_RESULTADO: Record<ResultadoDeFabricacao, string> = {
  desastre: 'Desastre',
  malfeito: 'Mal feito',
  bemfeito: 'Bem feito',
  obra_prima: 'Obra-prima',
}

export const CLASSE_RESULTADO: Record<ResultadoDeFabricacao, string> = {
  desastre: 'border-red-500/30 bg-red-950/40 text-red-300',
  malfeito: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
  bemfeito: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
  obra_prima: 'border-sky-500/30 bg-sky-950/40 text-sky-300',
}

/** O que a checagem devolve: dá para tentar, e se não, por quê. */
export type ChecagemDeFabricar = {
  pode: boolean
  motivos: string[]
  pericia: { id: number; nome: string; rank: number; bonus: number } | null
  dificuldade: number
  chances: { desastre: number; malfeito: number; bemfeito: number; obra_prima: number } | null
}

export type ResultadoDeFabricar = {
  resultado: ResultadoDeFabricacao
  rolagem: { d20: number; bonus: number; total: number; dificuldade: number }
  pericia: { id: number; nome: string; rank: number; atributo: string; valor_do_atributo: number }
  consumido: Array<{ tabela: TabelaDeInventario; id: number; nome: string; quantidade: number }>
  produzido: { tabela: TabelaDeInventario; id: number; nome: string; quantidade: number; qualidade: Qualidade } | null
  tempo_minutos: number
  inventario: InventarioApi
}

export type FabricacaoRegistrada = {
  id: number
  receitaId: number
  rolagemD20: number
  bonus: number
  dificuldade: number
  resultado: ResultadoDeFabricacao
  oficinaConfirmada: boolean
  createdAt: string
  createdBy: string | null
}

export async function checarFabricar(
  personagemId: number, receitaId: number, oficinaDisponivel = false,
): Promise<ChecagemDeFabricar> {
  const { data } = await api.get<ChecagemDeFabricar>(`/personagens/${personagemId}/fabricar/checar`, {
    params: { receita_id: receitaId, oficina_disponivel: oficinaDisponivel },
  })
  return data
}

export async function fabricar(
  personagemId: number, receitaId: number, oficinaDisponivel = false,
): Promise<ResultadoDeFabricar> {
  const { data } = await api.post<ResultadoDeFabricar>(`/personagens/${personagemId}/fabricar`, {
    receita_id: receitaId, oficina_disponivel: oficinaDisponivel,
  })
  return data
}

export async function historicoDeFabricacao(personagemId: number): Promise<FabricacaoRegistrada[]> {
  const { data } = await api.get<FabricacaoRegistrada[]>(`/personagens/${personagemId}/fabricar/historico`)
  return data
}

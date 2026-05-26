import { api } from '@/plugins/axios'

export interface TabelaItemApi {
  item: number
  descricao: string
  equipamento_tipo_item?: number | null
  categoria_arma_item?: number | null
  categoria_armadura_item?: number | null
  categoria_variados_item?: number | null
  created_at?: string
  created_by?: string | null
  updated_at?: string
  updated_by?: string | null
}

const BASE = '/tabelas-acessorias'

function crud<T = TabelaItemApi>(path: string) {
  return {
    listar: () => api.get<T[]>(`${BASE}${path}`).then((r) => r.data),
    criar: (descricao: string, extra?: Record<string, any>) =>
      api.post<T>(`${BASE}${path}/admin`, { descricao, ...extra }).then((r) => r.data),
    editar: (item: number, payload: Record<string, any>) =>
      api.patch<T>(`${BASE}${path}/admin/${item}`, payload).then((r) => r.data),
    deletar: (item: number) =>
      api.delete<{ ok: boolean }>(`${BASE}${path}/admin/${item}`).then((r) => r.data),
  }
}

export const tiposApi = crud('/tipos')
export const categoriasArmaApi = crud('/categorias-arma')
export const categoriasArmaduraApi = crud('/categorias-armadura')
export const categoriasVariadosApi = crud('/categorias-variados')
export const propriedadesArmaApi = crud('/propriedades-arma')
export const classesArmaApi = crud('/classes-arma')
export const propriedadesArmaduraApi = crud('/propriedades-armadura')
export const classesArmaduraApi = crud('/classes-armadura')
export const propriedadesVariadosApi = crud('/propriedades-variados')
export const classesVariadosApi = crud('/classes-variados')

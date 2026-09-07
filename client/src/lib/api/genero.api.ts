import { api } from '@/plugins/axios'
import type { GeneroApi } from '@/types/api'

export async function listarGeneros(): Promise<GeneroApi[]> {
  const { data } = await api.get<GeneroApi[]>('/genero')
  return data
}

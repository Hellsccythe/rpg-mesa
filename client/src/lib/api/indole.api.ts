import { api } from '@/plugins/axios'
import type { IndoleApi } from '@/types/api'

export async function listarIndole(): Promise<IndoleApi[]> {
  const { data } = await api.get<IndoleApi[]>('/indole')
  return data
}

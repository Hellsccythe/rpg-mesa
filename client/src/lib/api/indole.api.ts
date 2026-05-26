import { api } from '@/plugins/axios'
import type { IndoleApi } from '@/types/supabase'

export async function listarIndole(): Promise<IndoleApi[]> {
  const { data } = await api.get<IndoleApi[]>('/indole')
  return data
}

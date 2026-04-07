import { api } from '@/plugins/axios'

export async function createGod(payload: { name: string; description?: string }) {
  const { data } = await api.post('/gods/admin', payload)
  return data
}

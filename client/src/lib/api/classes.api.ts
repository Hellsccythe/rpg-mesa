import { api } from '@/plugins/axios'

export async function createClass(payload: {
  name: string
  tier: string
  description: string
  maxLevel?: number
}) {
  const { data } = await api.post('/classes/admin', payload)
  return data
}

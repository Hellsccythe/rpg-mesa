import { api } from '@/plugins/axios'

export async function createCityMap(payload: {
  name: string
  mapReference: string
  description?: string
}) {
  const { data } = await api.post('/city-maps/admin', payload)
  return data
}

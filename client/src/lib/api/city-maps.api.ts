import { api } from '@/plugins/axios'
import type { CityMapApi, PointOfInterestApi } from '@/types/api'

export interface SaveCityMapPayload {
  name: string
  mapReference: string
  description?: string
  imageUrl?: string
  pointsOfInterest?: PointOfInterestApi[]
  citySlug?: string
  cityName?: string
  cityDescription?: string
  cityCulture?: string
  mapType?: 'city' | 'localized'
  parentCityMapId?: string | number
}

/** Os mapas do mundo: do personagem, quando há um; senão do mundo ativo (header X-Campanha). */
export async function listCityMapsForCityView(characterId?: string | number | null) {
  const params = characterId ? { characterId: Number(characterId) } : {}
  const { data } = await api.get<CityMapApi[]>('/city-maps', { params })
  return data
}

export async function listCityMaps() {
  const { data } = await api.get<CityMapApi[]>('/city-maps/admin')
  return data
}

export async function createCityMap(payload: SaveCityMapPayload) {
  const { data } = await api.post<CityMapApi>('/city-maps/admin', payload)
  return data
}

export async function updateCityMap(cityMapId: string | number, payload: Partial<SaveCityMapPayload>) {
  const { data } = await api.patch<CityMapApi>(`/city-maps/admin/${cityMapId}`, payload)
  return data
}

export async function uploadCityMapImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await api.post<{ path: string; publicUrl: string }>(
    '/city-maps/admin/upload-image',
    formData,
  )
  return data
}

import axios from 'axios'
import { obterTokenDeAcesso } from '@/stores/auth'
import { lerMundoAtivoLocal } from '@/lib/mundo-ativo'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const accessToken = await obterTokenDeAcesso()

  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }

  // O mundo em que o cliente está. O servidor só usa quando a rota não
  // carrega personagem (telas do mestre, rotas públicas) — docs/MUNDOS.md.
  const mundo = lerMundoAtivoLocal()
  if (mundo) {
    config.headers.set('X-Campanha', mundo.slug)
  }

  return config
})

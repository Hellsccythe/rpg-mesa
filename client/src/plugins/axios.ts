import axios from 'axios'
import { supabase } from '@/lib/supabase/client'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: 10000,
})

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.access_token) {
    config.headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  return config
})

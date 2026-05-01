import { supabase } from '@/lib/supabase/client'

const DEFAULT_AVATAR_BUCKET = import.meta.env.VITE_AVATAR_BUCKET || 'character-avatars'
const DEFAULT_HISTORY_BUCKET = import.meta.env.VITE_HISTORY_BUCKET || 'character-history'
const DEFAULT_LORE_BUCKET = import.meta.env.VITE_LORE_BUCKET || 'lore-notes'

function sanitizeFileName(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
}

async function uploadFile(bucket: string, path: string, file: File) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadAvatar(file: File, userId: string) {
  const safeName = sanitizeFileName(file.name)
  const path = `${userId}/avatars/${Date.now()}-${safeName}`
  return uploadFile(DEFAULT_AVATAR_BUCKET, path, file)
}

export async function uploadHistoryDocument(file: File, userId: string) {
  const safeName = sanitizeFileName(file.name)
  const path = `${userId}/history/${Date.now()}-${safeName}`
  await uploadFile(DEFAULT_HISTORY_BUCKET, path, file)

  return {
    path,
    name: file.name,
    mimeType: file.type || null,
  }
}

function extractPathFromStorageReference(pathOrUrl: string) {
  if (!pathOrUrl) return ''
  if (!pathOrUrl.startsWith('http')) return pathOrUrl

  const marker = `/storage/v1/object/public/${DEFAULT_HISTORY_BUCKET}/`
  const idx = pathOrUrl.indexOf(marker)
  if (idx === -1) return ''
  return pathOrUrl.slice(idx + marker.length)
}

export async function uploadRacaFoto(file: File): Promise<string> {
  const safeName = sanitizeFileName(file.name)
  const path = `fotos/${Date.now()}-${safeName}`
  return uploadFile('racas', path, file)
}

export async function uploadLorePdf(file: File): Promise<string> {
  const safeName = sanitizeFileName(file.name)
  const path = `pdfs/${Date.now()}-${safeName}`
  return uploadFile(DEFAULT_LORE_BUCKET, path, file)
}

export async function getHistoryDocumentSignedUrl(pathOrUrl: string, expiresIn = 120) {
  const path = extractPathFromStorageReference(pathOrUrl)
  if (!path) throw new Error('Documento inválido')

  const { data, error } = await supabase.storage
    .from(DEFAULT_HISTORY_BUCKET)
    .createSignedUrl(path, expiresIn)

  if (error || !data?.signedUrl) throw error ?? new Error('Não foi possível gerar URL assinada')
  return data.signedUrl
}

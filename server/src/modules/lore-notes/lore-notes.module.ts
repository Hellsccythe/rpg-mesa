import { Router } from 'express'
import { loreNotesService } from './lore-notes.service.js'
import type { CriarLoreNoteDto, EditarLoreNoteDto } from './lore-notes.dto.js'

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined
  const [scheme, token] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer') return undefined
  return token
}

function authStatus(message: string) {
  return message.includes('autenticado') || message.includes('restrito') ? 401 : 400
}

export const LoreNotesRouter = Router()

// Rota pública: retorna globais + específicas do characterId (query param opcional)
LoreNotesRouter.get('/', async (req, res) => {
  try {
    const characterId = typeof req.query.characterId === 'string' ? req.query.characterId : undefined
    const data = await loreNotesService.listar(characterId)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err?.message ?? 'Erro ao listar notas de lore' })
  }
})

// Rota admin: mestre vê todas as notas
LoreNotesRouter.get('/admin', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    const data = await loreNotesService.listarAdmin(token)
    res.json(data)
  } catch (err: any) {
    res.status(authStatus(err?.message ?? '')).json({ message: err?.message ?? 'Erro ao listar notas' })
  }
})

LoreNotesRouter.post('/admin', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    const dto = req.body as CriarLoreNoteDto
    const data = await loreNotesService.criar(dto, token)
    res.status(201).json(data)
  } catch (err: any) {
    res.status(authStatus(err?.message ?? '')).json({ message: err?.message ?? 'Erro ao criar nota de lore' })
  }
})

LoreNotesRouter.patch('/admin/:id', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    const dto = req.body as EditarLoreNoteDto
    const data = await loreNotesService.editar(req.params.id, dto, token)
    res.json(data)
  } catch (err: any) {
    res.status(authStatus(err?.message ?? '')).json({ message: err?.message ?? 'Erro ao editar nota de lore' })
  }
})

LoreNotesRouter.delete('/admin/:id', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    await loreNotesService.deletar(req.params.id, token)
    res.status(204).send()
  } catch (err: any) {
    res.status(authStatus(err?.message ?? '')).json({ message: err?.message ?? 'Erro ao deletar nota de lore' })
  }
})

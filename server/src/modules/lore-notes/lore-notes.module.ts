import { Router } from 'express'
import { loreNotesService } from './lore-notes.service.js'
import type { CriarLoreNoteDto, EditarLoreNoteDto } from './lore-notes.dto.js'

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined
  const [scheme, token] = authorization.split(' ')
  if (scheme?.toLowerCase() !== 'bearer') return undefined
  return token
}

export const LoreNotesRouter = Router()

LoreNotesRouter.get('/', async (_req, res) => {
  try {
    const data = await loreNotesService.listar()
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err?.message ?? 'Erro ao listar notas de lore' })
  }
})

LoreNotesRouter.post('/admin', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    const dto = req.body as CriarLoreNoteDto
    const data = await loreNotesService.criar(dto, token)
    res.status(201).json(data)
  } catch (err: any) {
    const status =
      err?.message?.includes('autenticado') || err?.message?.includes('restrito') ? 401 : 400
    res.status(status).json({ message: err?.message ?? 'Erro ao criar nota de lore' })
  }
})

LoreNotesRouter.patch('/admin/:id', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    const dto = req.body as EditarLoreNoteDto
    const data = await loreNotesService.editar(req.params.id, dto, token)
    res.json(data)
  } catch (err: any) {
    const status =
      err?.message?.includes('autenticado') || err?.message?.includes('restrito') ? 401 : 400
    res.status(status).json({ message: err?.message ?? 'Erro ao editar nota de lore' })
  }
})

LoreNotesRouter.delete('/admin/:id', async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization)
    await loreNotesService.deletar(req.params.id, token)
    res.status(204).send()
  } catch (err: any) {
    const status =
      err?.message?.includes('autenticado') || err?.message?.includes('restrito') ? 401 : 400
    res.status(status).json({ message: err?.message ?? 'Erro ao deletar nota de lore' })
  }
})

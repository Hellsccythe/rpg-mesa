import { getAdminClient } from '../../config/database/supabase/client.js'
import { ensureMasterAccess } from '../../common/helpers/master-access.helper.js'
import type { CriarLoreNoteDto, EditarLoreNoteDto } from './lore-notes.dto.js'

const TABLE = 'lore_notes'

export const loreNotesService = {
  /**
   * Lista notas para jogadores.
   * Retorna notas globais (character_id IS NULL) + notas do personagem informado.
   */
  async listar(characterId?: string) {
    const admin = getAdminClient()

    let query = admin
      .from(TABLE)
      .select('*')
      .is('deleted_at', null)
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true })

    if (characterId) {
      // global OU específica do personagem
      query = query.or(`character_id.is.null,character_id.eq.${characterId}`)
    } else {
      // sem characterId: retorna só globais
      query = query.is('character_id', null)
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  /** Lista TODAS as notas (mestre vê tudo). */
  async listarAdmin(accessToken?: string) {
    await ensureMasterAccess(accessToken)
    const admin = getAdminClient()
    const { data, error } = await admin
      .from(TABLE)
      .select('*')
      .is('deleted_at', null)
      .order('character_id', { ascending: true, nullsFirst: true })
      .order('ordem', { ascending: true })
      .order('created_at', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  async criar(dto: CriarLoreNoteDto, accessToken?: string) {
    await ensureMasterAccess(accessToken)
    if (!dto.title?.trim()) throw new Error('Título é obrigatório')
    const admin = getAdminClient()
    const { data, error } = await admin
      .from(TABLE)
      .insert({
        title: dto.title.trim(),
        subtitle: dto.subtitle?.trim() ?? null,
        content: dto.content ?? '',
        ordem: dto.ordem ?? 0,
        character_id: dto.characterId ?? null,
      })
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async editar(id: string, dto: EditarLoreNoteDto, accessToken?: string) {
    await ensureMasterAccess(accessToken)
    const admin = getAdminClient()
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    if (dto.title !== undefined) updates.title = dto.title.trim()
    if (dto.subtitle !== undefined) updates.subtitle = dto.subtitle
    if (dto.content !== undefined) updates.content = dto.content
    if (dto.ordem !== undefined) updates.ordem = dto.ordem
    if ('characterId' in dto) updates.character_id = dto.characterId ?? null
    const { data, error } = await admin
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async deletar(id: string, accessToken?: string) {
    await ensureMasterAccess(accessToken)
    const admin = getAdminClient()
    const { error } = await admin
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
  },
}

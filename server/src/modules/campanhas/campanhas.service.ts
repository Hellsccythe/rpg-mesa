import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getMasterEmails, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";

const TABLE      = "campaigns";
const TABLE_GMS  = "campaign_gms";
const IMAGES_BUCKET = process.env.GAME_IMAGES_BUCKET ?? "game-images";

export type CampanhaApi = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CampanhaGmApi = {
  id: number;
  campaign_id: string;
  email: string;
  created_at: string;
  created_by: string | null;
};

function mapRow(row: any): CampanhaApi {
  return {
    id:              row.id,
    slug:            row.slug,
    name:            row.name,
    description:     row.description ?? null,
    cover_image_url: row.cover_image_url ?? null,
    is_active:       row.is_active ?? true,
    created_at:      row.created_at,
    updated_at:      row.updated_at,
  };
}

export const campanhasService = {
  async listar(): Promise<CampanhaApi[]> {
    const { data, error } = await getAdminClient()
      .from(TABLE)
      .select("*")
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async listarAdmin(accessToken?: string): Promise<CampanhaApi[]> {
    await ensureMasterAccess(accessToken);
    const { data, error } = await getAdminClient()
      .from(TABLE)
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapRow);
  },

  async buscarPorSlug(slug: string): Promise<CampanhaApi> {
    const { data, error } = await getAdminClient()
      .from(TABLE)
      .select("*")
      .eq("slug", slug)
      .is("deleted_at", null)
      .single();
    if (error || !data) throw new Error("Campanha não encontrada");
    return mapRow(data);
  },

  async criar(
    dto: { slug: string; name: string; description?: string; cover_image_url?: string; is_active?: boolean },
    accessToken?: string,
  ): Promise<CampanhaApi> {
    const user = await ensureMasterAccess(accessToken);
    const email = getUserDisplayEmail(user);

    const slug = dto.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!slug || !dto.name?.trim()) throw new Error("Slug e nome são obrigatórios");

    const { data, error } = await getAdminClient()
      .from(TABLE)
      .insert({
        slug,
        name:            dto.name.trim(),
        description:     dto.description?.trim() ?? null,
        cover_image_url: dto.cover_image_url ?? null,
        is_active:       dto.is_active ?? true,
        created_by:      email,
        updated_by:      email,
      })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Já existe uma campanha com esse slug");
      throw error;
    }
    return mapRow(data);
  },

  async editar(
    id: string,
    dto: { name?: string; description?: string; cover_image_url?: string; is_active?: boolean; slug?: string },
    accessToken?: string,
  ): Promise<CampanhaApi> {
    const user = await ensureMasterAccess(accessToken);
    const email = getUserDisplayEmail(user);

    const patch: Record<string, unknown> = { updated_by: email, updated_at: new Date().toISOString() };
    if (dto.name        !== undefined) patch.name            = dto.name.trim();
    if (dto.description !== undefined) patch.description     = dto.description?.trim() ?? null;
    if (dto.cover_image_url !== undefined) patch.cover_image_url = dto.cover_image_url ?? null;
    if (dto.is_active   !== undefined) patch.is_active       = dto.is_active;
    if (dto.slug        !== undefined) patch.slug             = dto.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const { data, error } = await getAdminClient()
      .from(TABLE)
      .update(patch)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Já existe uma campanha com esse slug");
      throw error;
    }
    if (!data) throw new Error("Campanha não encontrada");
    return mapRow(data);
  },

  async deletar(id: string, accessToken?: string): Promise<void> {
    const user = await ensureMasterAccess(accessToken);
    const email = getUserDisplayEmail(user);

    const { error } = await getAdminClient()
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: email })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;
  },

  // ── GMs ────────────────────────────────────────────────────────────────────

  async listarGms(campaignId: string, accessToken?: string): Promise<CampanhaGmApi[]> {
    await ensureMasterAccess(accessToken);
    const { data, error } = await getAdminClient()
      .from(TABLE_GMS)
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CampanhaGmApi[];
  },

  async adicionarGm(campaignId: string, email: string, accessToken?: string): Promise<CampanhaGmApi> {
    const user = await ensureMasterAccess(accessToken);
    const byEmail = getUserDisplayEmail(user);

    const { data, error } = await getAdminClient()
      .from(TABLE_GMS)
      .insert({ campaign_id: campaignId, email: email.trim().toLowerCase(), created_by: byEmail })
      .select("*")
      .single();
    if (error) {
      if (error.code === "23505") throw new Error("Este GM já está vinculado a esta campanha");
      throw error;
    }
    return data as CampanhaGmApi;
  },

  async removerGm(campaignId: string, gmId: number, accessToken?: string): Promise<void> {
    await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from(TABLE_GMS)
      .delete()
      .eq("id", gmId)
      .eq("campaign_id", campaignId);
    if (error) throw error;
  },

  // ── Verificação de acesso por email ────────────────────────────────────────

  async emailTemAcessoCampanha(email: string, campaignId: string): Promise<boolean> {
    const masterEmails = getMasterEmails();
    if (masterEmails.includes(email.toLowerCase())) return true;

    const { data } = await getAdminClient()
      .from(TABLE_GMS)
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("email", email.toLowerCase())
      .limit(1);
    return (data ?? []).length > 0;
  },
};

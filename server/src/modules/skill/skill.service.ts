import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import {
  PERSONAGEM_SELECT_FIELDS,
  PERSONAGEM_TABLE,
  mapPersonagem,
} from "../../models/personagem.model.js";
import type { AdicionarSkillPersonagemDto, CriarSkillCatalogoDto, EditarSkillCatalogoDto } from "./skill.dto.js";

function normalizeData(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== "object") return {} as Record<string, any>;
  return { ...data };
}

async function nextLookupItem(tabela: string): Promise<number> {
  const admin = getAdminClient();
  const { data } = await admin
    .from(tabela)
    .select("item")
    .order("item", { ascending: false })
    .limit(1)
    .single();
  return ((data as any)?.item ?? 0) + 1;
}

async function listarLookup(tabela: string) {
  const admin = getAdminClient();
  const { data, error } = await admin.from(tabela).select("*").is("deleted_at", null).order("item");
  if (error) throw error;
  return data ?? [];
}

async function criarLookup(tabela: string, descricao: string, accessToken?: string) {
  const user = await ensureMasterAccess(accessToken);
  const admin = getAdminClient();
  const item = await nextLookupItem(tabela);
  const { data, error } = await admin
    .from(tabela)
    .insert({ item, descricao: descricao.trim(), created_by: user.id, updated_by: user.id })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function editarLookup(tabela: string, item: number, descricao: string, accessToken?: string) {
  const user = await ensureMasterAccess(accessToken);
  const admin = getAdminClient();
  const { data, error } = await admin
    .from(tabela)
    .update({ descricao: descricao.trim(), updated_by: user.id })
    .eq("item", item)
    .is("deleted_at", null)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function deletarLookup(tabela: string, item: number, accessToken?: string) {
  const user = await ensureMasterAccess(accessToken);
  const admin = getAdminClient();
  const { error } = await admin
    .from(tabela)
    .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
    .eq("item", item)
    .is("deleted_at", null);
  if (error) throw error;
  return { ok: true };
}

export const skillService = {
  async listarCatalogo() {
    const admin = getAdminClient();
    try {
      const { data, error } = await admin
        .from("skills")
        .select("*")
        .is("deleted_at", null)
        .order("name");
      if (error) throw error;
      return data ?? [];
    } catch {
      const admin2 = getAdminClient();
      const { data, error } = await admin2.from("skills").select("*").order("name");
      if (error) throw error;
      return data ?? [];
    }
  },

  async criarNoCatalogo(dto: CriarSkillCatalogoDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("skills")
      .insert({
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        raca_vinculada: dto.raca_vinculada?.trim() ?? null,
        skill_tipo_item: dto.skill_tipo_item ?? null,
        skill_categoria_item: dto.skill_categoria_item ?? null,
        skill_tipo_dano_item: dto.skill_tipo_dano_item ?? null,
        damage_display: dto.damage_display?.trim() ?? null,
        damage_base: dto.damage_base ?? null,
        effect_description: dto.effect_description?.trim() ?? null,
        effect_value: dto.effect_value ?? null,
        custo: dto.custo ?? null,
        cooldown: dto.cooldown ?? null,
        range: dto.range?.trim() ?? null,
        required_class: dto.required_class?.trim() ?? null,
        created_by: user.id,
        updated_by: user.id,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async editarNoCatalogo(id: string, dto: EditarSkillCatalogoDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const campos: Record<string, any> = { updated_by: user.id };
    if (dto.name !== undefined) campos.name = dto.name.trim();
    if (dto.description !== undefined) campos.description = dto.description?.trim() ?? null;
    if (dto.raca_vinculada !== undefined) campos.raca_vinculada = dto.raca_vinculada?.trim() ?? null;
    if (dto.skill_tipo_item !== undefined) campos.skill_tipo_item = dto.skill_tipo_item ?? null;
    if (dto.skill_categoria_item !== undefined) campos.skill_categoria_item = dto.skill_categoria_item ?? null;
    if (dto.skill_tipo_dano_item !== undefined) campos.skill_tipo_dano_item = dto.skill_tipo_dano_item ?? null;
    if (dto.damage_display !== undefined) campos.damage_display = dto.damage_display?.trim() ?? null;
    if (dto.damage_base !== undefined) campos.damage_base = dto.damage_base ?? null;
    if (dto.effect_description !== undefined) campos.effect_description = dto.effect_description?.trim() ?? null;
    if (dto.effect_value !== undefined) campos.effect_value = dto.effect_value ?? null;
    if (dto.custo !== undefined) campos.custo = dto.custo ?? null;
    if (dto.cooldown !== undefined) campos.cooldown = dto.cooldown ?? null;
    if (dto.range !== undefined) campos.range = dto.range?.trim() ?? null;
    if (dto.required_class !== undefined) campos.required_class = dto.required_class?.trim() ?? null;
    const { data, error } = await admin
      .from("skills")
      .update(campos)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deletarDoCatalogo(id: string, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from("skills")
      .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;
    return { ok: true };
  },

  // ── Lookups de skill ────────────────────────────────────────────────────────
  listarTipos: () => listarLookup("skill_tipo"),
  criarTipo: (descricao: string, t?: string) => criarLookup("skill_tipo", descricao, t),
  editarTipo: (item: number, descricao: string, t?: string) => editarLookup("skill_tipo", item, descricao, t),
  deletarTipo: (item: number, t?: string) => deletarLookup("skill_tipo", item, t),

  listarCategorias: () => listarLookup("skill_categoria"),
  criarCategoria: (descricao: string, t?: string) => criarLookup("skill_categoria", descricao, t),
  editarCategoria: (item: number, descricao: string, t?: string) => editarLookup("skill_categoria", item, descricao, t),
  deletarCategoria: (item: number, t?: string) => deletarLookup("skill_categoria", item, t),

  listarTiposDano: () => listarLookup("skill_tipo_dano"),
  criarTipoDano: (descricao: string, t?: string) => criarLookup("skill_tipo_dano", descricao, t),
  editarTipoDano: (item: number, descricao: string, t?: string) => editarLookup("skill_tipo_dano", item, descricao, t),
  deletarTipoDano: (item: number, t?: string) => deletarLookup("skill_tipo_dano", item, t),

  async adicionarEmPersonagem(
    characterId: string,
    dto: AdicionarSkillPersonagemDto,
    accessToken?: string,
  ) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    const personagem = mapPersonagem(current);
    const dataAtual = normalizeData(personagem.data as Record<string, any>);
    const skills = Array.isArray(dataAtual.skills) ? [...dataAtual.skills] : [];

    const skillName = dto.skillName.trim();
    if (!skillName) throw new Error("Skill é obrigatória");

    if (
      !skills.some(
        (item: any) => String(item?.name ?? "").toLowerCase() === skillName.toLowerCase(),
      )
    ) {
      skills.push({
        name: skillName,
        addedBy: user.email ?? "master",
        addedAt: new Date().toISOString(),
      });
    }

    const nextData = { ...dataAtual, skills };
    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ data: nextData })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },
};

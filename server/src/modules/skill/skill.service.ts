import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import {
  PERSONAGEM_SELECT_FIELDS,
  PERSONAGEM_TABLE,
  mapPersonagem,
} from "../../models/personagem.model.js";
import type { AdicionarSkillPersonagemDto, CriarSkillCatalogoDto, EditarSkillCatalogoDto, CriarSkillOverrideDto, EditarSkillOverrideDto, CriarSkillNivelDto, EditarSkillNivelDto } from "./skill.dto.js";

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
        raca_vinculada: (dto.raca_vinculada && dto.raca_vinculada.length > 0) ? dto.raca_vinculada : null,
        skill_natureza_item: dto.skill_natureza_item ?? null,
        skill_tipo_item: dto.skill_tipo_item ?? null,
        skill_categoria_item: (dto.skill_categoria_item && dto.skill_categoria_item.length > 0) ? dto.skill_categoria_item : null,
        skill_tipo_dano_item: (dto.skill_tipo_dano_item && dto.skill_tipo_dano_item.length > 0) ? dto.skill_tipo_dano_item : null,
        multiplicador_atributo: (dto.multiplicador_atributo && dto.multiplicador_atributo.length > 0) ? dto.multiplicador_atributo : null,
        damage_base: dto.damage_base?.trim() ?? null,
        effect_description: dto.effect_description?.trim() ?? null,
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
    if (dto.raca_vinculada !== undefined) campos.raca_vinculada = (dto.raca_vinculada && dto.raca_vinculada.length > 0) ? dto.raca_vinculada : null;
    if (dto.skill_natureza_item !== undefined) campos.skill_natureza_item = dto.skill_natureza_item ?? null;
    if (dto.skill_tipo_item !== undefined) campos.skill_tipo_item = dto.skill_tipo_item ?? null;
    if (dto.skill_categoria_item !== undefined) campos.skill_categoria_item = (dto.skill_categoria_item && dto.skill_categoria_item.length > 0) ? dto.skill_categoria_item : null;
    if (dto.skill_tipo_dano_item !== undefined) campos.skill_tipo_dano_item = (dto.skill_tipo_dano_item && dto.skill_tipo_dano_item.length > 0) ? dto.skill_tipo_dano_item : null;
    if (dto.multiplicador_atributo !== undefined) campos.multiplicador_atributo = (dto.multiplicador_atributo && dto.multiplicador_atributo.length > 0) ? dto.multiplicador_atributo : null;
    if (dto.damage_base !== undefined) campos.damage_base = dto.damage_base?.trim() ?? null;
    if (dto.effect_description !== undefined) campos.effect_description = dto.effect_description?.trim() ?? null;
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

  async listarReferencias(id: string, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data: skill } = await admin
      .from("skills").select("id, name").eq("id", id).is("deleted_at", null).single();
    if (!skill) throw new Error("Skill não encontrada.");

    const skillId  = Number((skill as any).id);
    const skillName: string = (skill as any).name;

    const [{ data: passados }, { data: titulos }, { data: classes }] = await Promise.all([
      admin.from("passados").select("id, nome, skill_ids").is("deleted_at", null),
      admin.from("titles").select("id, name, skill_ids").is("deleted_at", null),
      admin.from("classes").select("id, name, starting_skills").is("deleted_at", null),
    ]);

    return {
      passados: (passados ?? []).filter((p: any) => (p.skill_ids ?? []).includes(skillId))
        .map((p: any) => ({ id: p.id, nome: p.nome })),
      titulos:  (titulos ?? []).filter((t: any) => (t.skill_ids ?? []).includes(skillId))
        .map((t: any) => ({ id: t.id, nome: t.name })),
      classes:  (classes ?? []).filter((c: any) => (c.starting_skills ?? []).includes(skillName))
        .map((c: any) => ({ id: c.id, nome: c.name })),
    };
  },

  async deletarDoCatalogo(id: string, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: skill } = await admin
      .from("skills").select("id, name").eq("id", id).is("deleted_at", null).single();
    if (!skill) throw new Error("Skill não encontrada.");

    const skillId  = Number((skill as any).id);
    const skillName: string = (skill as any).name;

    const { error } = await admin
      .from("skills")
      .update({ deleted_at: new Date().toISOString(), deleted_by: user.id })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;

    // Cascade: remove de passados, títulos e classes em paralelo
    const [{ data: passados }, { data: titulos }, { data: classes }] = await Promise.all([
      admin.from("passados").select("id, skill_ids").is("deleted_at", null),
      admin.from("titles").select("id, skill_ids").is("deleted_at", null),
      admin.from("classes").select("id, starting_skills").is("deleted_at", null),
    ]);

    await Promise.all([
      ...(passados ?? [])
        .filter((p: any) => (p.skill_ids ?? []).includes(skillId))
        .map((p: any) =>
          admin.from("passados").update({ skill_ids: (p.skill_ids as number[]).filter((s) => s !== skillId) }).eq("id", p.id)
        ),
      ...(titulos ?? [])
        .filter((t: any) => (t.skill_ids ?? []).includes(skillId))
        .map((t: any) =>
          admin.from("titles").update({ skill_ids: (t.skill_ids as number[]).filter((s) => s !== skillId) }).eq("id", t.id)
        ),
      ...(classes ?? [])
        .filter((c: any) => (c.starting_skills ?? []).includes(skillName))
        .map((c: any) =>
          admin.from("classes").update({ starting_skills: (c.starting_skills as string[]).filter((s) => s !== skillName) }).eq("id", c.id)
        ),
    ]);

    return { ok: true };
  },

  // ── Lookups de skill ────────────────────────────────────────────────────────
  listarNaturezas: () => listarLookup("skill_natureza"),
  criarNatureza: (descricao: string, t?: string) => criarLookup("skill_natureza", descricao, t),
  editarNatureza: (item: number, descricao: string, t?: string) => editarLookup("skill_natureza", item, descricao, t),
  deletarNatureza: (item: number, t?: string) => deletarLookup("skill_natureza", item, t),

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

  // ── Overrides por personagem ───────────────────────────────────────────────
  async listarOverrides(characterId: number, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("skill_character_override")
      .select("*")
      .eq("character_id", characterId)
      .order("skill_name");
    if (error) throw error;
    return data ?? [];
  },

  async criarOverride(dto: CriarSkillOverrideDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("skill_character_override")
      .insert({
        skill_name: dto.skill_name.trim(),
        character_id: dto.character_id,
        damage_base_override: dto.damage_base_override?.trim() ?? null,
        multiplicador_override: (dto.multiplicador_override && dto.multiplicador_override.length > 0) ? dto.multiplicador_override : null,
        created_by: user.email ?? user.id,
        updated_by: user.email ?? user.id,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async editarOverride(id: number, dto: EditarSkillOverrideDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const campos: Record<string, any> = {
      updated_by: user.email ?? user.id,
      updated_at: new Date().toISOString(),
    };
    if (dto.damage_base_override !== undefined) campos.damage_base_override = dto.damage_base_override?.trim() ?? null;
    if (dto.multiplicador_override !== undefined) campos.multiplicador_override = (dto.multiplicador_override && dto.multiplicador_override.length > 0) ? dto.multiplicador_override : null;
    const { data, error } = await admin
      .from("skill_character_override")
      .update(campos)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deletarOverride(id: number, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from("skill_character_override")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  async listarOverridesPersonagem(characterId: number) {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("skill_character_override")
      .select("*")
      .eq("character_id", characterId);
    if (error) throw error;
    return data ?? [];
  },

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

  async listarNiveis(skillId?: number) {
    const admin = getAdminClient();
    let query = admin.from("skill_niveis").select("*").order("skill_id").order("nivel");
    if (skillId) query = query.eq("skill_id", skillId);
    const { data, error } = await query;
    if (error) throw error;

    // Enriquece com nome da skill
    const ids = [...new Set((data ?? []).map((r: any) => r.skill_id))];
    if (!ids.length) return [];
    const { data: skills } = await admin.from("skills").select("id, name").in("id", ids).is("deleted_at", null);
    const skillMap: Record<number, string> = {};
    for (const s of (skills ?? [])) skillMap[(s as any).id] = (s as any).name;

    return (data ?? []).map((r: any) => ({ ...r, skill_name: skillMap[r.skill_id] ?? null }));
  },

  async criarNivel(dto: CriarSkillNivelDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: skill } = await admin.from("skills").select("id").eq("id", dto.skill_id).is("deleted_at", null).single();
    if (!skill) throw new Error("Skill não encontrada.");

    if (![2, 3].includes(dto.nivel)) throw new Error("Nível deve ser 2 ou 3.");

    const { data, error } = await admin
      .from("skill_niveis")
      .insert({
        skill_id:                    dto.skill_id,
        nivel:                       dto.nivel,
        damage_multiplier_pct:       dto.damage_multiplier_pct ?? null,
        nome_override:               dto.nome_override?.trim() ?? null,
        damage_base_override:        dto.damage_base_override?.trim() ?? null,
        multiplicador_override:      dto.multiplicador_override?.trim() ?? null,
        effect_description_override: dto.effect_description_override?.trim() ?? null,
        created_by:                  user.email ?? user.id,
        updated_by:                  user.email ?? user.id,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async editarNivel(id: number, dto: EditarSkillNivelDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const campos: Record<string, any> = { updated_by: user.email ?? user.id };
    if (dto.damage_multiplier_pct !== undefined) campos.damage_multiplier_pct = dto.damage_multiplier_pct ?? null;
    if (dto.nome_override !== undefined) campos.nome_override = dto.nome_override?.trim() ?? null;
    if (dto.damage_base_override !== undefined) campos.damage_base_override = dto.damage_base_override?.trim() ?? null;
    if (dto.multiplicador_override !== undefined) campos.multiplicador_override = dto.multiplicador_override?.trim() ?? null;
    if (dto.effect_description_override !== undefined) campos.effect_description_override = dto.effect_description_override?.trim() ?? null;

    const { data, error } = await admin
      .from("skill_niveis")
      .update(campos)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deletarNivel(id: number, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin.from("skill_niveis").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  },
};

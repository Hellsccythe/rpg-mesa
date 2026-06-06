import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";
import type { SalvarClasseDto, EditarClasseDto, CriarProgressaoDto, EditarProgressaoDto } from "./classes.dto.js";

export const classesService = {
  async listar() {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("classes")
      .select("*")
      .is("deleted_at", null)
      .eq("is_secret", false)
      .order("tier")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },

  async listarAdmin() {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("classes")
      .select("*")
      .is("deleted_at", null)
      .order("tier")
      .order("name");

    if (error) throw error;
    return data ?? [];
  },

  async listarParaPlayer(characterId: number) {
    const admin = getAdminClient();

    const [normalRes, reveladasRes] = await Promise.all([
      admin.from("classes").select("*").is("deleted_at", null).eq("is_secret", false).order("tier").order("name"),
      admin.from("classe_secreta_revelada").select("classe_id").eq("character_id", characterId),
    ]);

    const classeIdsReveladas = (reveladasRes.data ?? []).map((r: any) => r.classe_id);
    let secretasReveladas: any[] = [];
    if (classeIdsReveladas.length) {
      const { data } = await admin.from("classes").select("*").in("id", classeIdsReveladas).is("deleted_at", null);
      secretasReveladas = data ?? [];
    }

    return [...(normalRes.data ?? []), ...secretasReveladas];
  },

  async revelarClasseSecreta(classeId: number, characterId: number, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: classe } = await admin.from("classes").select("id, is_secret").eq("id", classeId).single();
    if (!classe) throw new Error("Classe não encontrada.");
    if (!(classe as any).is_secret) throw new Error("Esta classe não é secreta.");

    const { data: personagem } = await admin.from("characters").select("id, status").eq("id", characterId).is("deleted_at", null).single();
    if (!personagem) throw new Error("Personagem não encontrado.");
    if ((personagem as any).status === 'morto') throw new Error("Não é possível revelar uma classe para um personagem morto.");

    const { data: atual } = await admin.from("classe_secreta_revelada").select("character_id").eq("classe_id", classeId).maybeSingle();
    if (atual && (atual as any).character_id !== characterId) {
      throw new Error("Esta classe secreta já foi revelada para outro personagem ativo.");
    }

    const { error } = await admin.from("classe_secreta_revelada").upsert(
      { classe_id: classeId, character_id: characterId, revealed_by: getUserDisplayEmail(user) },
      { onConflict: "classe_id" }
    );
    if (error) throw error;
    return { success: true };
  },

  async revogarClasseSecreta(classeId: number, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin.from("classe_secreta_revelada").delete().eq("classe_id", classeId);
    if (error) throw error;
    return { success: true };
  },

  async listarClassesSecretasAdmin(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: classes } = await admin.from("classes").select("*").is("deleted_at", null).eq("is_secret", true).order("name");
    const { data: reveladas } = await admin.from("classe_secreta_revelada").select("classe_id, character_id, revealed_at, revealed_by");
    const { data: personagens } = await admin.from("characters").select("id, name, username, avatar_url, status").is("deleted_at", null);

    const reveladaMap: Record<number, any> = {};
    for (const r of (reveladas ?? [])) reveladaMap[r.classe_id] = r;

    const personagemMap: Record<number, any> = {};
    for (const p of (personagens ?? [])) personagemMap[p.id] = p;

    return (classes ?? []).map((c: any) => {
      const revelada = reveladaMap[c.id];
      const titular = revelada ? personagemMap[revelada.character_id] : null;
      return { ...c, revelada: !!revelada, titular: titular ?? null, revealed_at: revelada?.revealed_at ?? null };
    });
  },

  // ── Progressão de XP por classe ───────────────────────────────────────────
  async listarProgressaoClasse(classeId?: number) {
    const admin = getAdminClient();
    let query = admin
      .from("class_level_progression")
      .select("*")
      .order("classe_id")
      .order("nivel");

    if (classeId) query = query.eq("classe_id", classeId);

    const { data, error } = await query;
    if (error) throw error;

    // Enriquece com nome da classe
    const classeIds = [...new Set((data ?? []).map((r: any) => r.classe_id))];
    let classeMap: Record<number, string> = {};
    if (classeIds.length) {
      const { data: classes } = await admin.from("classes").select("id, name").in("id", classeIds);
      for (const c of (classes ?? [])) classeMap[c.id] = c.name;
    }

    return (data ?? []).map((r: any) => ({ ...r, classe_nome: classeMap[r.classe_id] ?? null }));
  },

  async criarProgressaoClasse(dto: CriarProgressaoDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: classe } = await admin.from("classes").select("id").eq("id", dto.classe_id).is("deleted_at", null).maybeSingle();
    if (!classe) throw new Error("Classe não encontrada.");

    if (dto.nivel < 1 || dto.nivel > 20 || !Number.isInteger(dto.nivel)) {
      throw new Error("Nível deve ser inteiro entre 1 e 20.");
    }

    const { data, error } = await admin
      .from("class_level_progression")
      .insert({
        classe_id:     dto.classe_id,
        nivel:         dto.nivel,
        xp_necessario: dto.xp_necessario,
        created_by:    getUserDisplayEmail(user),
        updated_by:    getUserDisplayEmail(user),
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") throw new Error("Já existe progressão para este nível nesta classe.");
      throw error;
    }
    return data;
  },

  async editarProgressaoClasse(id: number, dto: EditarProgressaoDto, accessToken?: string) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const campos: Record<string, any> = { updated_by: getUserDisplayEmail(user) };
    if (dto.xp_necessario !== undefined) campos.xp_necessario = dto.xp_necessario;

    const { data, error } = await admin
      .from("class_level_progression")
      .update(campos)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async deletarProgressaoClasse(id: number, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin.from("class_level_progression").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  async criarProgressaoClasseBulk(
    entradas: Array<{ classe_id: number; nivel: number; xp_necessario: number }>,
    accessToken?: string,
  ) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    if (!Array.isArray(entradas) || entradas.length === 0) {
      throw new Error("Nenhuma entrada fornecida.");
    }

    for (const e of entradas) {
      if (!Number.isInteger(e.classe_id) || e.classe_id < 1) throw new Error("classe_id inválido.");
      if (!Number.isInteger(e.nivel) || e.nivel < 1 || e.nivel > 20) throw new Error(`Nível inválido: ${e.nivel}.`);
      if (typeof e.xp_necessario !== "number" || e.xp_necessario < 0) throw new Error(`XP inválido no nível ${e.nivel}.`);
    }

    const email = getUserDisplayEmail(user);
    const rows = entradas.map((e) => ({
      classe_id:     e.classe_id,
      nivel:         e.nivel,
      xp_necessario: e.xp_necessario,
      created_by:    email,
      updated_by:    email,
    }));

    const { data, error } = await admin
      .from("class_level_progression")
      .upsert(rows, { onConflict: "classe_id,nivel", ignoreDuplicates: false })
      .select("*");

    if (error) throw error;

    const classeIds = [...new Set(rows.map((r) => r.classe_id))];
    const { data: classes } = await admin.from("classes").select("id, name").in("id", classeIds);
    const classeMap: Record<number, string> = {};
    for (const c of (classes ?? [])) classeMap[(c as any).id] = (c as any).name;

    return (data ?? []).map((r: any) => ({ ...r, classe_nome: classeMap[r.classe_id] ?? null }));
  },

  async listarProgressaoLevel() {
    const admin = getAdminClient();
    try {
      const { data, error } = await admin
        .from("level_progression")
        .select("*")
        .order("level");
      if (error) throw error;
      // Normaliza o campo XP para xp_required independente do nome da coluna no banco
      return (data ?? []).map((row: any) => ({
        ...row,
        xp_required: row.xp_required_next ?? row.xp_required ?? row.xp ?? row.xp_needed ?? 0,
        xp_total_accumulated: row.xp_total_accumulated ?? null,
      }));
    } catch {
      return [];
    }
  },

  async salvar(dto: SalvarClasseDto, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("classes")
      .insert({
        name: dto.name.trim(),
        tier: dto.tier.trim(),
        description: dto.description.trim(),
        max_level: dto.maxLevel ?? 20,
        stat_bonuses: dto.statBonuses ?? null,
        requirements: dto.requirements ?? null,
        starting_skills: (dto.startingSkills && dto.startingSkills.length > 0) ? dto.startingSkills : null,
        passive_skills: (dto.passiveSkills && dto.passiveSkills.length > 0) ? dto.passiveSkills : null,
        signature_skill: dto.signatureSkill?.trim() ?? null,
        signature_skill_nivel: dto.signatureSkillNivel ?? null,
        requer_deus: dto.requerDeus ?? false,
        is_secret:   (dto as any).isSecret ?? false,
        created_by: getUserDisplayEmail(masterUser),
        updated_by: getUserDisplayEmail(masterUser),
      })
      .select("*")
      .single();

    if (error) throw error;
    return data;
  },

  async editar(id: string, dto: EditarClasseDto, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const campos: Record<string, any> = { updated_by: getUserDisplayEmail(masterUser) };
    if (dto.name !== undefined) campos.name = dto.name.trim();
    if (dto.tier !== undefined) campos.tier = dto.tier.trim();
    if (dto.description !== undefined) campos.description = dto.description.trim();
    if (dto.maxLevel !== undefined) campos.max_level = dto.maxLevel;
    if (dto.statBonuses !== undefined) campos.stat_bonuses = dto.statBonuses;
    if (dto.requirements !== undefined) campos.requirements = dto.requirements;
    if (dto.startingSkills !== undefined) campos.starting_skills = (dto.startingSkills && dto.startingSkills.length > 0) ? dto.startingSkills : null;
    if (dto.passiveSkills !== undefined) campos.passive_skills = (dto.passiveSkills && dto.passiveSkills.length > 0) ? dto.passiveSkills : null;
    if (dto.signatureSkill !== undefined) campos.signature_skill = dto.signatureSkill?.trim() ?? null;
    if (dto.signatureSkillNivel !== undefined) campos.signature_skill_nivel = dto.signatureSkillNivel ?? null;
    if (dto.requerDeus !== undefined) campos.requer_deus = dto.requerDeus;
    if ((dto as any).isSecret !== undefined) campos.is_secret = (dto as any).isSecret;
    const { data, error } = await admin
      .from("classes")
      .update(campos)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async deletar(id: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from("classes")
      .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(masterUser) })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;
    return { ok: true };
  },
};

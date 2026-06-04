import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";
import {
  PERSONAGEM_SELECT_FIELDS,
  PERSONAGEM_TABLE,
  mapPersonagem,
} from "../../models/personagem.model.js";
import type { AdicionarTituloPersonagemDto, SalvarTituloDto } from "./titulos.dto.js";

export type SkillResumo = { id: number; name: string };

export type AtributoBonus = {
  aura?: number;
  forca?: number;
  destreza?: number;
  resistencia?: number;
  inteligencia?: number;
};

export type TituloEnriquecido = {
  id: number;
  name: string;
  tier: string;
  description: string;
  skill_ids: number[];
  skills: SkillResumo[];
  bonuses: AtributoBonus | null;
  requirements: Record<string, unknown> | null;
  is_hidden: boolean;
  linked_hidden_class: boolean;
  classe_secreta_id: number | null;
  created_at: string;
  updated_at: string;
};

function normalizeData(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== "object") return {} as Record<string, any>;
  return { ...data };
}

async function resolveSkills(skillIds: number[], admin: ReturnType<typeof getAdminClient>): Promise<SkillResumo[]> {
  if (!skillIds.length) return [];
  const { data } = await admin
    .from("skills")
    .select("id, name")
    .in("id", skillIds)
    .is("deleted_at", null);
  return (data ?? []).map((s: any) => ({ id: s.id, name: s.name }));
}

function mapTitulo(row: any, skillMap: Record<number, string>): TituloEnriquecido {
  const skillIds: number[] = Array.isArray(row.skill_ids) ? row.skill_ids : [];
  return {
    id:                  row.id,
    name:                row.name ?? "",
    tier:                row.tier ?? "",
    description:         row.description ?? "",
    skill_ids:           skillIds,
    skills:              skillIds.map(id => ({ id, name: skillMap[id] ?? `Skill #${id}` })),
    bonuses:             row.bonuses ?? null,
    requirements:        row.requirements ?? null,
    is_hidden:           row.is_hidden ?? false,
    linked_hidden_class: row.linked_hidden_class ?? false,
    classe_secreta_id:   row.classe_secreta_id ?? null,
    created_at:          row.created_at,
    updated_at:          row.updated_at,
  };
}

export const titulosService = {
  async listarCatalogo(): Promise<TituloEnriquecido[]> {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("titles")
      .select("*")
      .is("deleted_at", null)
      .order("name");
    if (error) throw error;
    const rows = data ?? [];

    const allSkillIds = [...new Set<number>(rows.flatMap((r: any) => r.skill_ids ?? []))];
    const skillMap: Record<number, string> = {};
    if (allSkillIds.length) {
      const skills = await resolveSkills(allSkillIds, admin);
      for (const s of skills) skillMap[s.id] = s.name;
    }
    return rows.map((r: any) => mapTitulo(r, skillMap));
  },

  async salvar(dto: SalvarTituloDto, accessToken?: string): Promise<TituloEnriquecido> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("titles")
      .insert({
        name:           dto.name.trim(),
        tier:           dto.tier.trim(),
        description:    dto.description.trim(),
        skill_ids:           (dto as any).skillIds ?? [],
        bonuses:             (dto as any).bonuses ?? null,
        is_hidden:           (dto as any).is_hidden ?? false,
        linked_hidden_class: (dto as any).linked_hidden_class ?? false,
        classe_secreta_id:   (dto as any).classe_secreta_id ?? null,
        created_by:     getUserDisplayEmail(user),
        updated_by:     getUserDisplayEmail(user),
      })
      .select("*")
      .single();

    if (error) throw error;
    const skills = await resolveSkills(data.skill_ids ?? [], admin);
    const skillMap: Record<number, string> = {};
    for (const s of skills) skillMap[s.id] = s.name;
    return mapTitulo(data, skillMap);
  },

  async editar(id: number, dto: Partial<SalvarTituloDto & { skillIds?: number[]; bonuses?: AtributoBonus | null }>, accessToken?: string): Promise<TituloEnriquecido> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const updates: Record<string, any> = {
      updated_by: getUserDisplayEmail(user),
      updated_at: new Date().toISOString(),
    };
    if (dto.name          !== undefined) updates.name           = dto.name.trim();
    if (dto.tier          !== undefined) updates.tier           = dto.tier.trim();
    if (dto.description   !== undefined) updates.description    = dto.description.trim();
    if (dto.skillIds                     !== undefined) updates.skill_ids           = dto.skillIds;
    if ((dto as any).bonuses             !== undefined) updates.bonuses             = (dto as any).bonuses;
    if ((dto as any).is_hidden            !== undefined) updates.is_hidden            = (dto as any).is_hidden;
    if ((dto as any).linked_hidden_class  !== undefined) updates.linked_hidden_class  = (dto as any).linked_hidden_class;
    if ((dto as any).classe_secreta_id    !== undefined) updates.classe_secreta_id    = (dto as any).classe_secreta_id;

    const { data, error } = await admin
      .from("titles")
      .update(updates)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();

    if (error) throw error;
    if (!data) throw new Error("Título não encontrado.");
    const skills = await resolveSkills(data.skill_ids ?? [], admin);
    const skillMap: Record<number, string> = {};
    for (const s of skills) skillMap[s.id] = s.name;
    return mapTitulo(data, skillMap);
  },

  async deletar(id: number, accessToken?: string): Promise<void> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from("titles")
      .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(user) })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;
  },

  async adicionarEmPersonagem(
    characterId: string,
    dto: AdicionarTituloPersonagemDto,
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
    const titles = Array.isArray(dataAtual.titles) ? [...dataAtual.titles] : [];

    const titleName = dto.titleName.trim();
    if (!titleName) throw new Error("Título é obrigatório");

    if (!titles.some((item: any) => String(item?.name ?? "").toLowerCase() === titleName.toLowerCase())) {
      titles.push({ name: titleName, addedBy: user.email ?? "master", addedAt: new Date().toISOString() });
    }

    const nextData = { ...dataAtual, titles };
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

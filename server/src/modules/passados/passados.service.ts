import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";

const TABLE = "passados";

export type SkillResumo   = { id: number; name: string };
export type TituloResumo  = { id: number; name: string; skills: SkillResumo[] };

export type AtributoBonus = {
  aura?: number;
  forca?: number;
  destreza?: number;
  resistencia?: number;
  inteligencia?: number;
};

export type PassadoApi = {
  id: number;
  nome: string;
  descricao: string | null;
  foto_url: string | null;
  skill_ids: number[];
  titulo_ids: number[];
  skills: SkillResumo[];
  titulos: TituloResumo[];
  atributo_bonus: AtributoBonus | null;
  created_at: string;
  updated_at: string;
};

type TituloComSkills = { name: string; skills: SkillResumo[] };

function mapRow(
  row: any,
  skillMap: Record<number, string>,
  tituloMap: Record<number, TituloComSkills>,
): PassadoApi {
  const skillIds:  number[] = Array.isArray(row.skill_ids)  ? row.skill_ids  : [];
  const tituloIds: number[] = Array.isArray(row.titulo_ids) ? row.titulo_ids : [];
  return {
    id:             row.id,
    nome:           row.nome ?? "",
    descricao:      row.descricao ?? null,
    foto_url:       row.foto_url ?? null,
    skill_ids:      skillIds,
    titulo_ids:     tituloIds,
    skills:         skillIds.map(id => ({ id, name: skillMap[id] ?? `Skill #${id}` })),
    titulos:        tituloIds.map(id => ({
      id,
      name:   tituloMap[id]?.name   ?? `Título #${id}`,
      skills: tituloMap[id]?.skills ?? [],
    })),
    atributo_bonus: row.atributo_bonus ?? null,
    created_at:     row.created_at,
    updated_at:     row.updated_at,
  };
}

async function buildMaps(rows: any[], admin: ReturnType<typeof getAdminClient>) {
  const allPassadoSkillIds = [...new Set<number>(rows.flatMap(r => r.skill_ids ?? []))];
  const allTituloIds       = [...new Set<number>(rows.flatMap(r => r.titulo_ids ?? []))];

  const [titulosRes] = await Promise.all([
    allTituloIds.length
      ? admin.from("titles").select("id, name, skill_ids").in("id", allTituloIds).is("deleted_at", null)
      : Promise.resolve({ data: [] as any[] }),
  ]);

  const tituloRows = titulosRes.data ?? [];
  const allTituloSkillIds = [...new Set<number>(tituloRows.flatMap((t: any) => t.skill_ids ?? []))];
  const allSkillIds = [...new Set<number>([...allPassadoSkillIds, ...allTituloSkillIds])];

  const skillsRes = allSkillIds.length
    ? await admin.from("skills").select("id, name").in("id", allSkillIds).is("deleted_at", null)
    : { data: [] as any[] };

  const skillMap: Record<number, string> = {};
  for (const s of (skillsRes.data ?? [])) skillMap[s.id] = s.name;

  const tituloMap: Record<number, TituloComSkills> = {};
  for (const t of tituloRows) {
    const tSkillIds: number[] = Array.isArray(t.skill_ids) ? t.skill_ids : [];
    tituloMap[t.id] = {
      name:   t.name,
      skills: tSkillIds.map(id => ({ id, name: skillMap[id] ?? `Skill #${id}` })),
    };
  }

  return { skillMap, tituloMap };
}

export const passadosService = {
  async listar(): Promise<PassadoApi[]> {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .select("*")
      .is("deleted_at", null)
      .order("nome");
    if (error) throw error;
    const rows = data ?? [];
    const { skillMap, tituloMap } = await buildMaps(rows, admin);
    return rows.map(r => mapRow(r, skillMap, tituloMap));
  },

  async criar(
    payload: { nome: string; descricao?: string; foto_url?: string; skill_ids?: number[]; titulo_ids?: number[]; atributo_bonus?: AtributoBonus | null },
    accessToken?: string,
  ): Promise<PassadoApi> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from(TABLE)
      .insert({
        nome:           payload.nome.trim(),
        descricao:      payload.descricao?.trim() ?? null,
        foto_url:       payload.foto_url?.trim() || null,
        skill_ids:      payload.skill_ids  ?? [],
        titulo_ids:     payload.titulo_ids ?? [],
        atributo_bonus: payload.atributo_bonus ?? null,
        created_by:     getUserDisplayEmail(user),
        updated_by:     getUserDisplayEmail(user),
      })
      .select("*")
      .single();
    if (error) throw error;
    const { skillMap, tituloMap } = await buildMaps([data], admin);
    return mapRow(data, skillMap, tituloMap);
  },

  async editar(
    id: number,
    payload: { nome?: string; descricao?: string; foto_url?: string; skill_ids?: number[]; titulo_ids?: number[]; atributo_bonus?: AtributoBonus | null },
    accessToken?: string,
  ): Promise<PassadoApi> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const updates: Record<string, any> = { updated_by: getUserDisplayEmail(user), updated_at: new Date().toISOString() };
    if (payload.nome           !== undefined) updates.nome           = payload.nome.trim();
    if (payload.descricao      !== undefined) updates.descricao      = payload.descricao?.trim() ?? null;
    if (payload.foto_url       !== undefined) updates.foto_url       = payload.foto_url?.trim() || null;
    if (payload.skill_ids      !== undefined) updates.skill_ids      = payload.skill_ids;
    if (payload.titulo_ids     !== undefined) updates.titulo_ids     = payload.titulo_ids;
    if (payload.atributo_bonus !== undefined) updates.atributo_bonus = payload.atributo_bonus;

    const { data, error } = await admin
      .from(TABLE)
      .update(updates)
      .eq("id", id)
      .is("deleted_at", null)
      .select("*")
      .single();
    if (error) throw error;
    if (!data) throw new Error("Passado não encontrado.");
    const { skillMap, tituloMap } = await buildMaps([data], admin);
    return mapRow(data, skillMap, tituloMap);
  },

  async deletar(id: number, accessToken?: string): Promise<void> {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(user) })
      .eq("id", id)
      .is("deleted_at", null);
    if (error) throw error;
  },
};

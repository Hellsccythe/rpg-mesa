import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";

async function nextItem(tabela: string): Promise<number> {
  const admin = getAdminClient();
  const { data } = await admin
    .from(tabela)
    .select("item")
    .order("item", { ascending: false })
    .limit(1)
    .single();
  return ((data as any)?.item ?? 0) + 1;
}

async function listar(tabela: string) {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from(tabela)
    .select("*")
    .is("deleted_at", null)
    .order("item");
  if (error) throw error;
  return data ?? [];
}

async function criar(
  tabela: string,
  campos: Record<string, any>,
  accessToken?: string,
) {
  const user = await ensureMasterAccess(accessToken);
  const admin = getAdminClient();
  const item = await nextItem(tabela);
  const { data, error } = await admin
    .from(tabela)
    .insert({ ...campos, item, created_by: getUserDisplayEmail(user), updated_by: getUserDisplayEmail(user) })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function editar(
  tabela: string,
  item: number,
  campos: Record<string, any>,
  accessToken?: string,
) {
  const user = await ensureMasterAccess(accessToken);
  const admin = getAdminClient();
  const { data, error } = await admin
    .from(tabela)
    .update({ ...campos, updated_by: getUserDisplayEmail(user) })
    .eq("item", item)
    .is("deleted_at", null)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function deletar(tabela: string, item: number, accessToken?: string) {
  const user = await ensureMasterAccess(accessToken);
  const admin = getAdminClient();
  const { error } = await admin
    .from(tabela)
    .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(user) })
    .eq("item", item)
    .is("deleted_at", null);
  if (error) throw error;
  return { ok: true };
}

export const tabelasAcessoriasService = {
  // ── equipamento_tipo ────────────────────────────────────────────────────────
  listarTipos: () => listar("equipamento_tipo"),
  criarTipo: (dto: { descricao: string }, token?: string) =>
    criar("equipamento_tipo", { descricao: dto.descricao.trim() }, token),
  editarTipo: (item: number, dto: { descricao?: string }, token?: string) =>
    editar("equipamento_tipo", item, dto.descricao !== undefined ? { descricao: dto.descricao.trim() } : {}, token),
  deletarTipo: (item: number, token?: string) => deletar("equipamento_tipo", item, token),

  // ── categoria_arma ──────────────────────────────────────────────────────────
  listarCategoriasArma: () => listar("categoria_arma"),
  criarCategoriaArma: (dto: { descricao: string }, token?: string) =>
    criar("categoria_arma", { descricao: dto.descricao.trim(), equipamento_tipo_item: 1 }, token),
  editarCategoriaArma: (item: number, dto: { descricao?: string }, token?: string) =>
    editar("categoria_arma", item, dto.descricao !== undefined ? { descricao: dto.descricao.trim() } : {}, token),
  deletarCategoriaArma: (item: number, token?: string) => deletar("categoria_arma", item, token),

  // ── categoria_armadura ──────────────────────────────────────────────────────
  listarCategoriasArmadura: () => listar("categoria_armadura"),
  criarCategoriaArmadura: (dto: { descricao: string }, token?: string) =>
    criar("categoria_armadura", { descricao: dto.descricao.trim(), equipamento_tipo_item: 2 }, token),
  editarCategoriaArmadura: (item: number, dto: { descricao?: string }, token?: string) =>
    editar("categoria_armadura", item, dto.descricao !== undefined ? { descricao: dto.descricao.trim() } : {}, token),
  deletarCategoriaArmadura: (item: number, token?: string) => deletar("categoria_armadura", item, token),

  // ── categoria_variados ──────────────────────────────────────────────────────
  listarCategoriasVariados: () => listar("categoria_variados"),
  criarCategoriaVariados: (dto: { descricao: string }, token?: string) =>
    criar("categoria_variados", { descricao: dto.descricao.trim(), equipamento_tipo_item: 3 }, token),
  editarCategoriaVariados: (item: number, dto: { descricao?: string }, token?: string) =>
    editar("categoria_variados", item, dto.descricao !== undefined ? { descricao: dto.descricao.trim() } : {}, token),
  deletarCategoriaVariados: (item: number, token?: string) => deletar("categoria_variados", item, token),

  // ── propriedade_arma ────────────────────────────────────────────────────────
  listarPropriedadesArma: () => listar("propriedade_arma"),
  criarPropriedadeArma: (dto: { descricao: string; categoria_arma_item?: number }, token?: string) =>
    criar("propriedade_arma", { descricao: dto.descricao.trim(), categoria_arma_item: dto.categoria_arma_item ?? null }, token),
  editarPropriedadeArma: (item: number, dto: { descricao?: string; categoria_arma_item?: number }, token?: string) => {
    const campos: Record<string, any> = {};
    if (dto.descricao !== undefined) campos.descricao = dto.descricao.trim();
    if (dto.categoria_arma_item !== undefined) campos.categoria_arma_item = dto.categoria_arma_item;
    return editar("propriedade_arma", item, campos, token);
  },
  deletarPropriedadeArma: (item: number, token?: string) => deletar("propriedade_arma", item, token),

  // ── classe_arma ─────────────────────────────────────────────────────────────
  listarClassesArma: () => listar("classe_arma"),
  criarClasseArma: (dto: { descricao: string; categoria_arma_item?: number }, token?: string) =>
    criar("classe_arma", { descricao: dto.descricao.trim(), categoria_arma_item: dto.categoria_arma_item ?? null }, token),
  editarClasseArma: (item: number, dto: { descricao?: string; categoria_arma_item?: number }, token?: string) => {
    const campos: Record<string, any> = {};
    if (dto.descricao !== undefined) campos.descricao = dto.descricao.trim();
    if (dto.categoria_arma_item !== undefined) campos.categoria_arma_item = dto.categoria_arma_item;
    return editar("classe_arma", item, campos, token);
  },
  deletarClasseArma: (item: number, token?: string) => deletar("classe_arma", item, token),

  // ── propriedade_armadura ────────────────────────────────────────────────────
  listarPropriedadesArmadura: () => listar("propriedade_armadura"),
  criarPropriedadeArmadura: (dto: { descricao: string; categoria_armadura_item?: number }, token?: string) =>
    criar("propriedade_armadura", { descricao: dto.descricao.trim(), categoria_armadura_item: dto.categoria_armadura_item ?? null }, token),
  editarPropriedadeArmadura: (item: number, dto: { descricao?: string; categoria_armadura_item?: number }, token?: string) => {
    const campos: Record<string, any> = {};
    if (dto.descricao !== undefined) campos.descricao = dto.descricao.trim();
    if (dto.categoria_armadura_item !== undefined) campos.categoria_armadura_item = dto.categoria_armadura_item;
    return editar("propriedade_armadura", item, campos, token);
  },
  deletarPropriedadeArmadura: (item: number, token?: string) => deletar("propriedade_armadura", item, token),

  // ── classe_armadura ─────────────────────────────────────────────────────────
  listarClassesArmadura: () => listar("classe_armadura"),
  criarClasseArmadura: (dto: { descricao: string; categoria_armadura_item?: number }, token?: string) =>
    criar("classe_armadura", { descricao: dto.descricao.trim(), categoria_armadura_item: dto.categoria_armadura_item ?? null }, token),
  editarClasseArmadura: (item: number, dto: { descricao?: string; categoria_armadura_item?: number }, token?: string) => {
    const campos: Record<string, any> = {};
    if (dto.descricao !== undefined) campos.descricao = dto.descricao.trim();
    if (dto.categoria_armadura_item !== undefined) campos.categoria_armadura_item = dto.categoria_armadura_item;
    return editar("classe_armadura", item, campos, token);
  },
  deletarClasseArmadura: (item: number, token?: string) => deletar("classe_armadura", item, token),

  // ── propriedade_variados ────────────────────────────────────────────────────
  listarPropriedadesVariados: () => listar("propriedade_variados"),
  criarPropriedadeVariados: (dto: { descricao: string; categoria_variados_item?: number }, token?: string) =>
    criar("propriedade_variados", { descricao: dto.descricao.trim(), categoria_variados_item: dto.categoria_variados_item ?? null }, token),
  editarPropriedadeVariados: (item: number, dto: { descricao?: string; categoria_variados_item?: number }, token?: string) => {
    const campos: Record<string, any> = {};
    if (dto.descricao !== undefined) campos.descricao = dto.descricao.trim();
    if (dto.categoria_variados_item !== undefined) campos.categoria_variados_item = dto.categoria_variados_item;
    return editar("propriedade_variados", item, campos, token);
  },
  deletarPropriedadeVariados: (item: number, token?: string) => deletar("propriedade_variados", item, token),

  // ── classe_variados ─────────────────────────────────────────────────────────
  listarClassesVariados: () => listar("classe_variados"),
  criarClasseVariados: (dto: { descricao: string; categoria_variados_item?: number }, token?: string) =>
    criar("classe_variados", { descricao: dto.descricao.trim(), categoria_variados_item: dto.categoria_variados_item ?? null }, token),
  editarClasseVariados: (item: number, dto: { descricao?: string; categoria_variados_item?: number }, token?: string) => {
    const campos: Record<string, any> = {};
    if (dto.descricao !== undefined) campos.descricao = dto.descricao.trim();
    if (dto.categoria_variados_item !== undefined) campos.categoria_variados_item = dto.categoria_variados_item;
    return editar("classe_variados", item, campos, token);
  },
  deletarClasseVariados: (item: number, token?: string) => deletar("classe_variados", item, token),
};

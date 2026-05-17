import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import type {
  CriarArmaDto,
  EditarArmaDto,
  CriarCategoriaDto,
  EditarCategoriaDto,
  CriarClasseDto,
  EditarClasseDto,
  CriarTipoDto,
  EditarTipoDto,
  CriarPropriedadeDto,
  EditarPropriedadeDto,
} from "./arma.dto.js";

const ARMAS_TABLE        = "equipamentos";
const CATEGORIAS_TABLE   = "categoria_equipamento";
const CLASSES_TABLE      = "classe_equipamento";
const TIPOS_TABLE        = "tipo_equipamento";
const PROPRIEDADES_TABLE = "propriedade_equipamento";

type ArmaRecord = {
  id: string;
  nome: string;
  dano: string;
  peso: number | null;
  valor: number | null;
  categoria_equipamento_item: number | null;
  classe_equipamento_item: number[];
  tipo_equipamento_item: number[];
  propriedade_equipamento_item: number[];
  descricao_equipamento: string | null;
  pre_requisitos: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CategoriaEquipamento = {
  item: number;
  descricao: string;
  icone?: string | null;
};

export type ClasseEquipamento = {
  item: number;
  descricao: string;
};

export type TipoEquipamento = {
  item: number;
  descricao: string;
  categoria_item: number | null;
};

export type PropriedadeEquipamento = {
  item: number;
  descricao: string;
  categoria_item: number | null;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeDecimal(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

function normalizeTextOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = typeof value === "string" ? value.trim() : "";
  return s === "" ? null : s;
}

function normalizeIntArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === "number" && Number.isInteger(v));
}

function normalizeIntOrNull(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : null;
}

function mapArma(row: any): ArmaRecord {
  return {
    id: String(row?.id ?? ""),
    nome: normalizeText(row?.nome),
    dano: normalizeText(row?.dano),
    peso: normalizeDecimal(row?.peso),
    valor: normalizeDecimal(row?.valor),
    categoria_equipamento_item: normalizeIntOrNull(row?.categoria_equipamento_item),
    classe_equipamento_item: normalizeIntArray(row?.classe_equipamento_item),
    tipo_equipamento_item: normalizeIntArray(row?.tipo_equipamento_item),
    propriedade_equipamento_item: normalizeIntArray(row?.propriedade_equipamento_item),
    descricao_equipamento: normalizeTextOrNull(row?.descricao_equipamento),
    pre_requisitos: normalizeTextOrNull(row?.pre_requisitos),
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}

const SELECT_FIELDS =
  "id, nome, dano, peso, valor, " +
  "categoria_equipamento_item, classe_equipamento_item, tipo_equipamento_item, propriedade_equipamento_item, " +
  "descricao_equipamento, pre_requisitos, created_at, updated_at";

async function proximoItem(tabela: string): Promise<number> {
  const { data } = await getAdminClient()
    .from(tabela)
    .select("item")
    .order("item", { ascending: false })
    .limit(1);
  return data && data.length > 0 ? (data[0].item as number) + 1 : 1;
}

// ── Equipamentos ──────────────────────────────────────────────────────────────

export const armaService = {
  // ── Categorias (primário) ────────────────────────────────────────────────────

  async listarCategorias(): Promise<CategoriaEquipamento[]> {
    const { data, error } = await getAdminClient()
      .from(CATEGORIAS_TABLE)
      .select("item, descricao, icone")
      .is("deleted_at", null)
      .order("item", { ascending: true });
    if (error) throw error;
    return (data ?? []) as CategoriaEquipamento[];
  },

  async criarCategoria(dto: CriarCategoriaDto, accessToken?: string): Promise<CategoriaEquipamento> {
    const masterUser = await ensureMasterAccess(accessToken);
    const item = await proximoItem(CATEGORIAS_TABLE);
    const { data, error } = await getAdminClient()
      .from(CATEGORIAS_TABLE)
      .insert({
        item,
        descricao: dto.descricao.trim(),
        icone: dto.icone?.trim() ?? null,
        created_by: masterUser.id,
        updated_by: masterUser.id,
      })
      .select("item, descricao, icone")
      .single();
    if (error) throw error;
    return data as CategoriaEquipamento;
  },

  async editarCategoria(item: number, dto: EditarCategoriaDto, accessToken?: string): Promise<CategoriaEquipamento> {
    await ensureMasterAccess(accessToken);
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
    if ("icone" in dto) updates.icone = dto.icone?.trim() ?? null;
    const { data, error } = await getAdminClient()
      .from(CATEGORIAS_TABLE)
      .update(updates)
      .eq("item", item)
      .is("deleted_at", null)
      .select("item, descricao, icone")
      .single();
    if (error) throw error;
    return data as CategoriaEquipamento;
  },

  async deletarCategoria(item: number, accessToken?: string): Promise<{ success: boolean }> {
    const masterUser = await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from(CATEGORIAS_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("item", item)
      .is("deleted_at", null);
    if (error) throw error;
    return { success: true };
  },

  // ── Classes (secundário) ─────────────────────────────────────────────────────

  async listarClasses(): Promise<ClasseEquipamento[]> {
    const { data, error } = await getAdminClient()
      .from(CLASSES_TABLE)
      .select("item, descricao")
      .is("deleted_at", null)
      .order("item", { ascending: true });
    if (error) throw error;
    return (data ?? []) as ClasseEquipamento[];
  },

  async criarClasse(dto: CriarClasseDto, accessToken?: string): Promise<ClasseEquipamento> {
    const masterUser = await ensureMasterAccess(accessToken);
    const item = await proximoItem(CLASSES_TABLE);
    const { data, error } = await getAdminClient()
      .from(CLASSES_TABLE)
      .insert({
        item,
        descricao: dto.descricao.trim(),
        created_by: masterUser.id,
        updated_by: masterUser.id,
      })
      .select("item, descricao")
      .single();
    if (error) throw error;
    return data as ClasseEquipamento;
  },

  async editarClasse(item: number, dto: EditarClasseDto, accessToken?: string): Promise<ClasseEquipamento> {
    await ensureMasterAccess(accessToken);
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
    const { data, error } = await getAdminClient()
      .from(CLASSES_TABLE)
      .update(updates)
      .eq("item", item)
      .is("deleted_at", null)
      .select("item, descricao")
      .single();
    if (error) throw error;
    return data as ClasseEquipamento;
  },

  async deletarClasse(item: number, accessToken?: string): Promise<{ success: boolean }> {
    const masterUser = await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from(CLASSES_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("item", item)
      .is("deleted_at", null);
    if (error) throw error;
    return { success: true };
  },

  // ── Tipos ────────────────────────────────────────────────────────────────────

  async listarTipos(categoriaItem?: number): Promise<TipoEquipamento[]> {
    let query = getAdminClient()
      .from(TIPOS_TABLE)
      .select("item, descricao, categoria_item")
      .is("deleted_at", null)
      .order("item", { ascending: true });
    if (categoriaItem !== undefined) query = query.eq("categoria_item", categoriaItem);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as TipoEquipamento[];
  },

  async criarTipo(dto: CriarTipoDto, accessToken?: string): Promise<TipoEquipamento> {
    const masterUser = await ensureMasterAccess(accessToken);
    const item = await proximoItem(TIPOS_TABLE);
    const { data, error } = await getAdminClient()
      .from(TIPOS_TABLE)
      .insert({
        item,
        descricao: dto.descricao.trim(),
        categoria_item: dto.categoria_item,
        created_by: masterUser.id,
        updated_by: masterUser.id,
      })
      .select("item, descricao, categoria_item")
      .single();
    if (error) throw error;
    return data as TipoEquipamento;
  },

  async editarTipo(item: number, dto: EditarTipoDto, accessToken?: string): Promise<TipoEquipamento> {
    await ensureMasterAccess(accessToken);
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
    if (dto.categoria_item !== undefined) updates.categoria_item = dto.categoria_item;
    const { data, error } = await getAdminClient()
      .from(TIPOS_TABLE)
      .update(updates)
      .eq("item", item)
      .is("deleted_at", null)
      .select("item, descricao, categoria_item")
      .single();
    if (error) throw error;
    return data as TipoEquipamento;
  },

  async deletarTipo(item: number, accessToken?: string): Promise<{ success: boolean }> {
    const masterUser = await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from(TIPOS_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("item", item)
      .is("deleted_at", null);
    if (error) throw error;
    return { success: true };
  },

  // ── Propriedades ─────────────────────────────────────────────────────────────

  async listarPropriedades(categoriaItem?: number): Promise<PropriedadeEquipamento[]> {
    let query = getAdminClient()
      .from(PROPRIEDADES_TABLE)
      .select("item, descricao, categoria_item")
      .is("deleted_at", null)
      .order("item", { ascending: true });
    if (categoriaItem !== undefined) query = query.eq("categoria_item", categoriaItem);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as PropriedadeEquipamento[];
  },

  async criarPropriedade(dto: CriarPropriedadeDto, accessToken?: string): Promise<PropriedadeEquipamento> {
    const masterUser = await ensureMasterAccess(accessToken);
    const item = await proximoItem(PROPRIEDADES_TABLE);
    const { data, error } = await getAdminClient()
      .from(PROPRIEDADES_TABLE)
      .insert({
        item,
        descricao: dto.descricao.trim(),
        categoria_item: dto.categoria_item,
        created_by: masterUser.id,
        updated_by: masterUser.id,
      })
      .select("item, descricao, categoria_item")
      .single();
    if (error) throw error;
    return data as PropriedadeEquipamento;
  },

  async editarPropriedade(item: number, dto: EditarPropriedadeDto, accessToken?: string): Promise<PropriedadeEquipamento> {
    await ensureMasterAccess(accessToken);
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (dto.descricao !== undefined) updates.descricao = dto.descricao.trim();
    if (dto.categoria_item !== undefined) updates.categoria_item = dto.categoria_item;
    const { data, error } = await getAdminClient()
      .from(PROPRIEDADES_TABLE)
      .update(updates)
      .eq("item", item)
      .is("deleted_at", null)
      .select("item, descricao, categoria_item")
      .single();
    if (error) throw error;
    return data as PropriedadeEquipamento;
  },

  async deletarPropriedade(item: number, accessToken?: string): Promise<{ success: boolean }> {
    const masterUser = await ensureMasterAccess(accessToken);
    const { error } = await getAdminClient()
      .from(PROPRIEDADES_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("item", item)
      .is("deleted_at", null);
    if (error) throw error;
    return { success: true };
  },

  // ── Equipamentos (CRUD principal) ────────────────────────────────────────────

  async listarPublico() {
    const { data, error } = await getSupabaseClient()
      .from(ARMAS_TABLE)
      .select(SELECT_FIELDS)
      .is("deleted_at", null)
      .order("nome", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapArma);
  },

  async listar(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const { data, error } = await getAdminClient()
      .from(ARMAS_TABLE)
      .select(SELECT_FIELDS)
      .is("deleted_at", null)
      .order("nome", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapArma);
  },

  async criar(dto: CriarArmaDto, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const { data, error } = await getAdminClient()
      .from(ARMAS_TABLE)
      .insert({
        nome: dto.nome.trim(),
        dano: dto.dano?.trim() ?? "",
        peso: dto.peso ?? null,
        valor: dto.valor ?? null,
        categoria_equipamento_item: dto.categoria_equipamento_item ?? null,
        classe_equipamento_item: dto.classe_equipamento_item ?? [],
        tipo_equipamento_item: dto.tipo_equipamento_item ?? [],
        propriedade_equipamento_item: dto.propriedade_equipamento_item ?? [],
        descricao_equipamento: dto.descricao_equipamento?.trim() ?? null,
        pre_requisitos: dto.pre_requisitos?.trim() ?? null,
        created_by: masterUser.id,
        updated_by: masterUser.id,
      })
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapArma(data);
  },

  async editar(armaId: string, dto: EditarArmaDto, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const { data: current, error: currentError } = await getAdminClient()
      .from(ARMAS_TABLE)
      .select("id")
      .eq("id", armaId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Equipamento não encontrado");

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: masterUser.id,
    };
    if (dto.nome !== undefined) updates.nome = dto.nome.trim();
    if (dto.dano !== undefined) updates.dano = dto.dano.trim();
    if (dto.peso !== undefined) updates.peso = dto.peso;
    if (dto.valor !== undefined) updates.valor = dto.valor;
    if ("categoria_equipamento_item" in dto) updates.categoria_equipamento_item = dto.categoria_equipamento_item ?? null;
    if (dto.classe_equipamento_item !== undefined) updates.classe_equipamento_item = dto.classe_equipamento_item ?? [];
    if (dto.tipo_equipamento_item !== undefined) updates.tipo_equipamento_item = dto.tipo_equipamento_item ?? [];
    if (dto.propriedade_equipamento_item !== undefined) updates.propriedade_equipamento_item = dto.propriedade_equipamento_item ?? [];
    if (dto.descricao_equipamento !== undefined) updates.descricao_equipamento = dto.descricao_equipamento?.trim() ?? null;
    if (dto.pre_requisitos !== undefined) updates.pre_requisitos = dto.pre_requisitos?.trim() ?? null;

    const { data, error } = await getAdminClient()
      .from(ARMAS_TABLE)
      .update(updates)
      .eq("id", armaId)
      .is("deleted_at", null)
      .select(SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapArma(data);
  },

  async deletar(armaId: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const { data: arma, error: fetchError } = await getAdminClient()
      .from(ARMAS_TABLE)
      .select("id")
      .eq("id", armaId)
      .is("deleted_at", null)
      .single();
    if (fetchError || !arma) throw new Error("Equipamento não encontrado");
    const { error } = await getAdminClient()
      .from(ARMAS_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("id", armaId)
      .is("deleted_at", null);
    if (error) throw error;
    return { success: true };
  },
};

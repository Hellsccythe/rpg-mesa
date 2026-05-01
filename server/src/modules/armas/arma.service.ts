import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import type { CriarArmaDto, EditarArmaDto } from "./arma.dto.js";

const ARMAS_TABLE = "equipamentos";

type ArmaRecord = {
  id: string;
  nome: string;
  tipo: string;
  dano: string;
  peso: number | null;
  propriedades: string;
  valor: number | null;
  categoria_equipamento: string | null;
  descricao_equipamento: string | null;
  pre_requisitos: string | null;
  createdAt?: string;
  updatedAt?: string;
};

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

function mapArma(row: any): ArmaRecord {
  return {
    id: String(row?.id ?? ""),
    nome: normalizeText(row?.nome),
    tipo: normalizeText(row?.tipo),
    dano: normalizeText(row?.dano),
    peso: normalizeDecimal(row?.peso),
    propriedades: normalizeText(row?.propriedades),
    valor: normalizeDecimal(row?.valor),
    categoria_equipamento: normalizeTextOrNull(row?.categoria_equipamento),
    descricao_equipamento: normalizeTextOrNull(row?.descricao_equipamento),
    pre_requisitos: normalizeTextOrNull(row?.pre_requisitos),
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}

const SELECT_FIELDS =
  "id, nome, tipo, dano, peso, propriedades, valor, categoria_equipamento, descricao_equipamento, pre_requisitos, created_at, updated_at";

export const armaService = {
  async listarPublico() {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from(ARMAS_TABLE)
      .select(SELECT_FIELDS)
      .is("deleted_at", null)
      .order("nome", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapArma);
  },

  async listar(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(ARMAS_TABLE)
      .select(SELECT_FIELDS)
      .is("deleted_at", null)
      .order("nome", { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapArma);
  },

  async criar(dto: CriarArmaDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(ARMAS_TABLE)
      .insert({
        nome: dto.nome.trim(),
        tipo: dto.tipo.trim(),
        dano: dto.dano?.trim() ?? "",
        peso: dto.peso ?? null,
        propriedades: dto.propriedades?.trim() ?? "",
        valor: dto.valor ?? null,
        categoria_equipamento: dto.categoria_equipamento?.trim() ?? null,
        descricao_equipamento: dto.descricao_equipamento?.trim() ?? null,
        pre_requisitos: dto.pre_requisitos?.trim() ?? null,
      })
      .select(SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapArma(data);
  },

  async editar(armaId: string, dto: EditarArmaDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(ARMAS_TABLE)
      .select("id")
      .eq("id", armaId)
      .is("deleted_at", null)
      .single();

    if (currentError || !current) throw new Error("Arma não encontrada");

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (dto.nome !== undefined) updates.nome = dto.nome.trim();
    if (dto.tipo !== undefined) updates.tipo = dto.tipo.trim();
    if (dto.dano !== undefined) updates.dano = dto.dano.trim();
    if (dto.peso !== undefined) updates.peso = dto.peso;
    if (dto.propriedades !== undefined) updates.propriedades = dto.propriedades.trim();
    if (dto.valor !== undefined) updates.valor = dto.valor;
    if (dto.categoria_equipamento !== undefined) updates.categoria_equipamento = dto.categoria_equipamento?.trim() ?? null;
    if (dto.descricao_equipamento !== undefined) updates.descricao_equipamento = dto.descricao_equipamento?.trim() ?? null;
    if (dto.pre_requisitos !== undefined) updates.pre_requisitos = dto.pre_requisitos?.trim() ?? null;

    const { data, error } = await admin
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
    const admin = getAdminClient();

    const { data: arma, error: fetchError } = await admin
      .from(ARMAS_TABLE)
      .select("id")
      .eq("id", armaId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !arma) throw new Error("Arma não encontrada");

    const { error } = await admin
      .from(ARMAS_TABLE)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: masterUser.id,
      })
      .eq("id", armaId)
      .is("deleted_at", null);

    if (error) throw error;
    return { success: true };
  },
};

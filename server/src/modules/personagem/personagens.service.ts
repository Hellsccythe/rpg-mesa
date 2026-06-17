// server/src/modules/personagem/personagens.service.ts
import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { getMasterEmails, getUserDisplayEmail } from "../../common/helpers/master-access.helper.js";
import {
  PERSONAGEM_SELECT_FIELDS,
  PERSONAGEM_TABLE,
  mapPersonagem,
} from "../../models/personagem.model.js";
import type {
  AdicionarNotaAventuraDto,
  AdicionarSkillPersonagemDto,
  AdicionarTituloPersonagemDto,
  EditarPersonagemDto,
  RevisarSolicitacaoDto,
  SalvarCidadeMapaDto,
  SalvarClasseMestreDto,
  SalvarDeusDto,
  SalvarPersonagemDto,
  SalvarTituloMestreDto,
  SolicitarAlteracaoPersonagemDto,
} from "./personagens.dto.js";

export interface FiltroPersonagens {
  nome?: string;
  minLevel?: number;
  maxLevel?: number;
  campaignId?: string | null;
}

export interface PersonagemPublico {
  characterId: string;
  name: string;
  level: number;
  avatarUrl: string | null;
  classe: string | null;
  avatarFocalPoint: string | null;
  modalHeroPosition: string | null;
}

type PendingChangeRequest = {
  requestedAt: string;
  requestedByUserId: string;
  requestedByEmail: string | null;
  name?: string;
  avatarUrl?: string;
  history?: string;
  historyDocumentPath?: string;
  historyDocumentName?: string;
  historyDocumentMimeType?: string | null;
  indoleId?: number;
};

const CHARACTER_CREATION_WHITELIST_TABLE = "character_creation_whitelist";

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isMissingTableError(error: any) {
  const message = String(error?.message ?? "").toLowerCase();
  return (
    error?.code === "42P01" || (message.includes("relation") && message.includes("does not exist"))
  );
}

function isMissingColumnError(error: any, columnName: string) {
  const message = String(error?.message ?? "").toLowerCase();
  const normalizedColumn = columnName.trim().toLowerCase();
  return (
    error?.code === "42703" ||
    (message.includes("column") &&
      message.includes(normalizedColumn) &&
      message.includes("does not exist"))
  );
}

async function listCharacterCreationEmailsFromDatabase() {
  const admin = getAdminClient();
  let response = await admin
    .from(CHARACTER_CREATION_WHITELIST_TABLE)
    .select("email")
    .is("deleted_at", null)
    .order("email", { ascending: true });

  if (response.error && isMissingColumnError(response.error, "deleted_at")) {
    response = await admin
      .from(CHARACTER_CREATION_WHITELIST_TABLE)
      .select("email")
      .order("email", { ascending: true });
  }

  const { data, error } = response;

  if (error) {
    if (isMissingTableError(error)) {
      throw new Error(
        "Tabela 'character_creation_whitelist' nao encontrada. Crie a tabela para gerenciar emails pelo painel mestre.",
      );
    }

    throw error;
  }

  return (data ?? []).map((item: any) => normalizeEmail(item?.email)).filter(Boolean);
}

async function getCharacterCreationAllowedEmailsMerged() {
  return listCharacterCreationEmailsFromDatabase();
}

function getPendingChangeRequest(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== "object") return null;
  const pending = (data as any).pendingChangeRequest;
  if (!pending || typeof pending !== "object") return null;
  return pending as PendingChangeRequest;
}

function normalizeData(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== "object") return {} as Record<string, any>;
  return { ...data };
}

async function queryPublicCharacters(useAdmin: boolean, campaignId?: string) {
  const client = useAdmin ? getAdminClient() : getSupabaseClient();

  let baseQuery = client
    .from(PERSONAGEM_TABLE)
    .select("id, name, level, avatar_url, data, classe_id")
    .order("created_at", { ascending: false });

  if (campaignId) {
    baseQuery = baseQuery.eq("campaign_id", campaignId) as any;
  }

  const withSoftDeleteFilter = await baseQuery.is("deleted_at", null);

  if (!withSoftDeleteFilter.error) {
    return withSoftDeleteFilter;
  }

  const message = withSoftDeleteFilter.error.message?.toLowerCase() ?? "";
  const columnMissing =
    withSoftDeleteFilter.error.code === "42703" ||
    message.includes("column") ||
    message.includes("deleted_at");

  if (!columnMissing) {
    return withSoftDeleteFilter;
  }

  let fallbackQuery = client
    .from(PERSONAGEM_TABLE)
    .select("id, name, level, avatar_url, data, classe_id")
    .order("created_at", { ascending: false });

  if (campaignId) {
    fallbackQuery = fallbackQuery.eq("campaign_id", campaignId) as any;
  }

  return fallbackQuery;
}

async function ensureMasterAccess(accessToken?: string) {
  const supabase = getSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Usuário não autenticado");

  const masterEmails = getMasterEmails();
  if (masterEmails.length > 0 && !masterEmails.includes(user.email?.toLowerCase() ?? "")) {
    throw new Error("Acesso restrito ao mestre");
  }

  return user;
}

async function findUserByEmail(admin: ReturnType<typeof getAdminClient>, email: string) {
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000, page });
    if (error) throw error;
    const found = data.users.find((u: any) => u.email === email);
    if (found) return found;
    if (data.users.length < 1000) return null;
    page++;
  }
}

// Popula data.classes a partir de classe_id quando o array estiver vazio.
// Self-healing: persiste a correção no banco para que não precise repetir.
async function ensureDataClassesPopuladas(
  row: Record<string, any>,
  characterId: string
): Promise<Record<string, any>> {
  const dataAtual = normalizeData(row.data);
  const classes = Array.isArray(dataAtual.classes) ? dataAtual.classes : [];
  const classeId = row.classe_id ?? row.classeId;
  if (classes.length > 0 || !classeId) return row;

  const admin = getAdminClient();
  const { data: classeData } = await admin
    .from("classes")
    .select("id, name, tier")
    .eq("id", classeId)
    .is("deleted_at", null)
    .single();

  if (!classeData) return row;

  const novasClasses = [{
    classId: String(classeId),
    name: (classeData as any).name,
    tier: (classeData as any).tier ?? "",
    level: 1,
    chosenSkills: [],
    skillPoints: 2,
    xp: 0,
  }];

  const novoData = { ...dataAtual, classes: novasClasses };
  await admin
    .from(PERSONAGEM_TABLE)
    .update({ data: novoData })
    .eq("id", characterId)
    .is("deleted_at", null);

  return { ...row, data: novoData };
}

export const personagensService = {
  /**
   * Lista todos os personagens publicamente (sem auth).
   * Usa o admin client para bypassar RLS e retorna apenas campos seguros.
   * Requer SUPABASE_SERVICE_ROLE_KEY no .env do servidor.
   */
  async listarTodosPublico(campaignId?: string): Promise<PersonagemPublico[]> {
    let data: any[] | null = null;

    try {
      const response = await queryPublicCharacters(true, campaignId);
      if (response.error) throw response.error;
      data = response.data;
    } catch {
      const fallback = await queryPublicCharacters(false, campaignId);
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    const rows = data || [];

    // Fallback: personagens sem data.classes[0].name mas com classe_id definido
    const classeIdsSemNome = [...new Set(
      rows
        .filter(r => !(r.data as any)?.classes?.[0]?.name && r.classe_id)
        .map(r => r.classe_id as number)
    )];

    const classeNomesMap: Record<number, string> = {};
    if (classeIdsSemNome.length > 0) {
      const admin = getAdminClient();
      const { data: classesData } = await admin
        .from("classes")
        .select("id, name")
        .in("id", classeIdsSemNome)
        .is("deleted_at", null);
      if (classesData) {
        for (const c of classesData) classeNomesMap[c.id] = c.name;
      }
    }

    return rows.map((row) => ({
      characterId: row.id,
      name: row.name,
      level: row.level,
      avatarUrl: row.avatar_url ?? null,
      classe: (row.data as any)?.classes?.[0]?.name ?? classeNomesMap[row.classe_id] ?? null,
      avatarFocalPoint: (row.data as any)?.avatarFocalPoint ?? null,
      modalHeroPosition: (row.data as any)?.modalHeroPosition ?? null,
    }));
  },

  async getUsuario(accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) throw new Error("Usuário não autenticado");
    return { id: user.id, email: user.email };
  },

  async listarMeusPersonagens(filtro: FiltroPersonagens = {}, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    let query = supabase
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (filtro.nome?.trim()) {
      query = query.ilike("name", `%${filtro.nome.trim()}%`);
    }
    if (filtro.minLevel !== undefined) {
      query = query.gte("level", filtro.minLevel);
    }
    if (filtro.maxLevel !== undefined) {
      query = query.lte("level", filtro.maxLevel);
    }
    if (filtro.campaignId !== undefined) {
      if (filtro.campaignId === null) {
        query = query.is("campaign_id", null);
      } else {
        query = query.eq("campaign_id", filtro.campaignId);
      }
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(mapPersonagem);
  },

  async salvarPersonagem(payload: SalvarPersonagemDto, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const allowedEmails = await getCharacterCreationAllowedEmailsMerged();
    const normalizedUserEmail = normalizeEmail(user.email);
    const emailAllowed =
      !allowedEmails.length ||
      (!!normalizedUserEmail && allowedEmails.includes(normalizedUserEmail));

    if (!emailAllowed) {
      throw new Error("Erro: email nao liberado pelo mestre.");
    }

    const initialData = { classPoints: 1, ...(payload.data ?? {}) };
    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .insert({
        user_id: user.id,
        name: payload.name,
        level: payload.level ?? 1,
        avatar_url: payload.avatarUrl ?? null,
        indole_id: payload.indoleId ?? null,
        genero_id: payload.generoId ?? null,
        aparencia_fisica: payload.aparenciaFisica ?? null,
        historia_texto: payload.historiaTexto ?? null,
        historia_doc_url: payload.historiaDocUrl ?? null,
        status: 'vivo',
        data: initialData,
      })
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async editarPersonagem(characterId: string, dto: EditarPersonagemDto, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.level !== undefined) updates.level = dto.level;
    if ((dto as any).avatarUrl !== undefined) updates.avatar_url = (dto as any).avatarUrl;
    if (dto.data !== undefined) updates.data = dto.data;
    if (dto.indoleId !== undefined) updates.indole_id = dto.indoleId ?? null;
    if (dto.generoId !== undefined) updates.genero_id = dto.generoId ?? null;
    if (dto.aparenciaFisica !== undefined) updates.aparencia_fisica = dto.aparenciaFisica;
    if (dto.historiaTexto !== undefined) updates.historia_texto = dto.historiaTexto;
    if (dto.historiaDocUrl !== undefined) updates.historia_doc_url = dto.historiaDocUrl;

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .update(updates)
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async obterMeuPersonagemPorId(characterId: string, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    const row = await ensureDataClassesPopuladas(data as Record<string, any>, characterId);
    return mapPersonagem(row);
  },

  async obterPersonagemPorIdComoMestre(characterId: string, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();

    if (error) throw error;
    const row = await ensureDataClassesPopuladas(data as Record<string, any>, characterId);
    return mapPersonagem(row);
  },

  async solicitarAlteracao(
    characterId: string,
    dto: SolicitarAlteracaoPersonagemDto,
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const { data: current, error: currentError } = await supabase
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, data")
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .single();

    if (currentError || !current) throw new Error("Personagem não encontrado");

    const hasNameChange = typeof dto.name === "string" && dto.name.trim().length > 0;
    const hasAvatarChange = typeof dto.avatarUrl === "string" && dto.avatarUrl.trim().length > 0;
    const hasHistoryChange = typeof dto.history === "string";
    const hasHistoryDocChange = typeof dto.historyDocumentPath === "string";
    const hasIndoleChange = typeof dto.indoleId === "number";

    if (!hasNameChange && !hasAvatarChange && !hasHistoryChange && !hasHistoryDocChange && !hasIndoleChange) {
      throw new Error("Informe ao menos um campo para solicitar alteração");
    }

    const nextData = normalizeData((current as any).data);
    nextData.pendingChangeRequest = {
      requestedAt: new Date().toISOString(),
      requestedByUserId: user.id,
      requestedByEmail: user.email ?? null,
      ...(hasNameChange ? { name: dto.name!.trim() } : {}),
      ...(hasAvatarChange ? { avatarUrl: dto.avatarUrl!.trim() } : {}),
      ...(hasHistoryChange ? { history: dto.history ?? "" } : {}),
      ...(hasHistoryDocChange
        ? {
            historyDocumentPath: dto.historyDocumentPath?.trim() ?? "",
            historyDocumentName: dto.historyDocumentName?.trim() ?? "",
            historyDocumentMimeType: dto.historyDocumentMimeType ?? null,
          }
        : {}),
      ...(hasIndoleChange ? { indoleId: dto.indoleId } : {}),
    } as PendingChangeRequest;

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .update({ data: nextData })
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async listarSolicitacoesPendentes(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    // Filtra no banco usando o índice parcial idx_characters_pending_request
    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .is("deleted_at", null)
      .not("data->pendingChangeRequest", "is", null)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return (data || []).map(mapPersonagem).map((personagem) => {
      const pending = getPendingChangeRequest(personagem.data as Record<string, any>);
      if (!pending) return null;

      return {
        characterId: personagem.characterId,
        currentName: personagem.name,
        currentAvatarUrl: personagem.avatarUrl,
        currentHistory: ((personagem.data as any)?.history as string) ?? null,
        currentHistoryDocumentPath:
          ((personagem.data as any)?.historyDocumentPath as string) ??
          ((personagem.data as any)?.historyDocumentUrl as string) ??
          null,
        currentHistoryDocumentName:
          ((personagem.data as any)?.historyDocumentName as string) ?? null,
        requestedName: pending.name ?? null,
        requestedAvatarUrl: pending.avatarUrl ?? null,
        requestedHistory: pending.history ?? null,
        requestedHistoryDocumentPath: pending.historyDocumentPath ?? null,
        requestedHistoryDocumentName: pending.historyDocumentName ?? null,
        requestedAt: pending.requestedAt,
        requestedByEmail: pending.requestedByEmail,
        currentIndoleId: personagem.indoleId ?? null,
        requestedIndoleId: pending.indoleId ?? null,
      };
    }).filter(Boolean);
  },

  async revisarSolicitacao(characterId: string, dto: RevisarSolicitacaoDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();

    if (currentError || !current) throw new Error("Personagem não encontrado");

    const personagem = mapPersonagem(current);
    const currentData = normalizeData(personagem.data as Record<string, any>);
    const pending = getPendingChangeRequest(currentData);

    if (!pending) throw new Error("Não há solicitação pendente para este personagem");

    const nextData = { ...currentData };
    delete nextData.pendingChangeRequest;
    nextData.changeRequestResponse = {
      status: dto.approve ? "aprovado" : "rejeitado",
      respondidoEm: new Date().toISOString(),
      visto: false,
    };

    const updates: Record<string, unknown> = { data: nextData };

    if (dto.approve) {
      if (pending.name?.trim()) updates.name = pending.name.trim();
      if (pending.avatarUrl?.trim()) updates.avatar_url = pending.avatarUrl.trim();
      if (pending.history !== undefined) nextData.history = pending.history;
      if (pending.historyDocumentPath !== undefined) {
        nextData.historyDocumentPath = pending.historyDocumentPath;
        nextData.historyDocumentName = pending.historyDocumentName ?? "";
        nextData.historyDocumentMimeType = pending.historyDocumentMimeType ?? null;
      }
      if (pending.indoleId) updates.indole_id = pending.indoleId;
    }

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update(updates)
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async salvarDeus(dto: SalvarDeusDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("gods")
      .insert({
        name: dto.name.trim(),
        description: dto.description?.trim() ?? "",
      })
      .select("id, name, description, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async salvarCidadeMapa(dto: SalvarCidadeMapaDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("city_maps")
      .insert({
        name: dto.name.trim(),
        map_reference: dto.mapReference.trim(),
        description: dto.description?.trim() ?? "",
      })
      .select("id, name, map_reference, description, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async salvarClasseMestre(dto: SalvarClasseMestreDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("classes")
      .insert({
        name: dto.name.trim(),
        tier: dto.tier.trim(),
        description: dto.description.trim(),
        max_level: dto.maxLevel ?? 20,
      })
      .select("id, name, tier, description, max_level, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async salvarTituloMestre(dto: SalvarTituloMestreDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("titles")
      .insert({
        name: dto.name.trim(),
        tier: dto.tier.trim(),
        description: dto.description.trim(),
      })
      .select("id, name, tier, description, created_at")
      .single();

    if (error) throw error;
    return data;
  },

  async adicionarSkillEmPersonagem(
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
        source: "master",
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

  async adicionarTituloEmPersonagem(
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

    if (
      !titles.some(
        (item: any) => String(item?.name ?? "").toLowerCase() === titleName.toLowerCase(),
      )
    ) {
      titles.push({
        name: titleName,
        addedBy: user.email ?? "master",
        addedAt: new Date().toISOString(),
      });
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

  async adicionarNotaAventura(
    characterId: string,
    dto: AdicionarNotaAventuraDto,
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
    const notes = Array.isArray(dataAtual.adventureNotes) ? [...dataAtual.adventureNotes] : [];

    const note = dto.note.trim();
    if (!note) throw new Error("Nota de aventura é obrigatória");

    notes.push({ text: note, addedBy: user.email ?? "master", addedAt: new Date().toISOString() });

    const nextData = { ...dataAtual, adventureNotes: notes };
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

  async deletarPersonagemComoMestre(characterId: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    // Busca o avatar antes do soft delete
    const { data: char, error: fetchError } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, avatar_url")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !char) throw new Error("Personagem nao encontrado.");

    // Soft delete do registro com deleted_by
    let softDelete = await admin
      .from(PERSONAGEM_TABLE)
      .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(masterUser) })
      .eq("id", characterId)
      .is("deleted_at", null);

    if (softDelete.error && isMissingColumnError(softDelete.error, "deleted_by")) {
      softDelete = await admin
        .from(PERSONAGEM_TABLE)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", characterId)
        .is("deleted_at", null);
    }

    if (softDelete.error) throw softDelete.error;

    // Hard delete da imagem no storage
    if (char.avatar_url) {
      try {
        const avatarBucket = process.env.AVATAR_BUCKET || "character-avatars";
        const marker = `/storage/v1/object/public/${avatarBucket}/`;
        const idx = (char.avatar_url as string).indexOf(marker);
        if (idx !== -1) {
          const storagePath = (char.avatar_url as string).slice(idx + marker.length);
          await admin.storage.from(avatarBucket).remove([storagePath]);
        }
      } catch {
        // Falha no storage nao bloqueia o delete do personagem
      }
    }

    return { success: true };
  },

  async definirAvatarFocalPoint(characterId: string, focalPoint: string, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    const dataAtual = normalizeData((current as any).data);
    const nextData = { ...dataAtual, avatarFocalPoint: focalPoint };

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

  async definirModalHeroPosition(characterId: string, position: string, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    const dataAtual = normalizeData((current as any).data);
    const nextData = position
      ? { ...dataAtual, modalHeroPosition: position }
      : (() => { const d = { ...dataAtual }; delete d.modalHeroPosition; return d; })();

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

  async deletarMeuPersonagem(characterId: string, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from(PERSONAGEM_TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", characterId)
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .select("id")
      .single();

    if (error) throw error;
    return { success: !!data?.id };
  },

  async registrarECriarPersonagem(payload: {
    email: string
    username: string
    senha: string
    nome: string
    data?: Record<string, any>
    avatarUrl?: string | null
  }) {
    const admin = getAdminClient()

    // Valida email para whitelist
    const normalizedEmail = normalizeEmail(payload.email)
    if (!isValidEmail(normalizedEmail)) throw new Error("Email invalido.")

    const allowedEmails = await getCharacterCreationAllowedEmailsMerged()
    const emailAllowed = !allowedEmails.length || allowedEmails.includes(normalizedEmail)
    if (!emailAllowed) {
      throw new Error("Email nao liberado pelo mestre para criacao de personagem.")
    }

    // Valida username: 3-20 chars, apenas letras/numeros/_ e -
    const username = payload.username.trim().toLowerCase()
    if (!/^[a-z0-9_-]{3,20}$/.test(username)) {
      throw new Error("Usuario deve ter entre 3 e 20 caracteres (letras, numeros, _ ou -).")
    }

    // Verifica unicidade do username na tabela de personagens
    const { data: existingChar } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id")
      .eq("username", username)
      .is("deleted_at", null)
      .maybeSingle()
    if (existingChar) throw new Error("Este nome de usuario ja esta em uso.")

    // Cria usuario no Supabase Auth com email sintetico username@rpg.internal
    const authEmail = `${username}@rpg.internal`
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email: authEmail,
      password: payload.senha,
      email_confirm: true,
    })

    if (createError) {
      const msg = createError.message?.toLowerCase() ?? ""
      // username unico deve evitar colisoes, mas caso ocorra:
      if (msg.includes("already") || (createError as any).status === 422) {
        throw new Error("Este nome de usuario ja esta em uso. Escolha outro.")
      }
      throw createError
    }

    const userId = createData.user.id

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .insert({
        user_id: userId,
        username,
        name: payload.nome.trim(),
        level: 1,
        avatar_url: payload.avatarUrl ?? null,
        data: payload.data ?? {},
      })
      .select(PERSONAGEM_SELECT_FIELDS)
      .single()

    if (error) {
      // Rollback: remove o usuario criado no Auth para evitar orfaos
      await admin.auth.admin.deleteUser(userId).catch(() => null)
      throw error
    }

    return mapPersonagem(data)
  },

  async listarEmailsPermitidosCriacaoPersonagem(accessToken?: string) {
    await ensureMasterAccess(accessToken);

    const emails = await listCharacterCreationEmailsFromDatabase();
    return { emails };
  },

  async adicionarEmailPermitidoCriacaoPersonagem(email: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);

    const admin = getAdminClient();
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Email invalido para liberacao.");
    }

    let operation = await admin.from(CHARACTER_CREATION_WHITELIST_TABLE).upsert(
      {
        email: normalizedEmail,
        deleted_at: null,
        deleted_by: null,
        updated_by: getUserDisplayEmail(masterUser),
      },
      { onConflict: "email" },
    );

    if (operation.error && isMissingColumnError(operation.error, "updated_by")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .upsert(
          { email: normalizedEmail, deleted_at: null, deleted_by: null },
          { onConflict: "email" },
        );
    }

    if (operation.error && isMissingColumnError(operation.error, "deleted_by")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .upsert({ email: normalizedEmail, deleted_at: null }, { onConflict: "email" });
    }

    if (operation.error && isMissingColumnError(operation.error, "deleted_at")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .upsert({ email: normalizedEmail }, { onConflict: "email" });
    }

    const { error } = operation;

    if (error) {
      if (isMissingTableError(error)) {
        throw new Error(
          "Tabela 'character_creation_whitelist' nao encontrada. Crie a tabela para habilitar o cadastro de emails no painel mestre.",
        );
      }

      throw error;
    }

    return { success: true, email: normalizedEmail };
  },

  async removerEmailPermitidoCriacaoPersonagem(email: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);

    const admin = getAdminClient();
    const normalizedEmail = normalizeEmail(email);
    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Email invalido para remocao.");
    }

    let operation = await admin
      .from(CHARACTER_CREATION_WHITELIST_TABLE)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: getUserDisplayEmail(masterUser),
        updated_by: getUserDisplayEmail(masterUser),
      })
      .is("deleted_at", null)
      .eq("email", normalizedEmail);

    if (operation.error && isMissingColumnError(operation.error, "updated_by")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .update({ deleted_at: new Date().toISOString(), deleted_by: getUserDisplayEmail(masterUser) })
        .is("deleted_at", null)
        .eq("email", normalizedEmail);
    }

    if (operation.error && isMissingColumnError(operation.error, "deleted_by")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .update({ deleted_at: new Date().toISOString() })
        .is("deleted_at", null)
        .eq("email", normalizedEmail);
    }

    if (operation.error && isMissingColumnError(operation.error, "deleted_at")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .delete()
        .eq("email", normalizedEmail);
    }

    const { error } = operation;

    if (error) {
      if (isMissingTableError(error)) {
        throw new Error(
          "Tabela 'character_creation_whitelist' nao encontrada. Crie a tabela para habilitar o cadastro de emails no painel mestre.",
        );
      }

      throw error;
    }

    return { success: true, email: normalizedEmail };
  },

  async escolherClasse(
    characterId: string,
    dto: { classId: string; className: string; classTier: string },
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");

    const admin = getAdminClient();
    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    const personagem = mapPersonagem(current);
    if (!isMaster && personagem.userId !== user.id) throw new Error("Sem permissão");

    const dataAtual = normalizeData(personagem.data as Record<string, any>);
    const classPoints: number = typeof dataAtual.classPoints === "number" ? dataAtual.classPoints : 0;
    if (classPoints < 1) throw new Error("Pontos de classe insuficientes");

    const classes: any[] = Array.isArray(dataAtual.classes) ? [...dataAtual.classes] : [];
    const baseClasses = classes.filter((c: any) => c.tier?.toLowerCase() === "base");
    const tierLower = dto.classTier.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    if (classes.some((c: any) => c.classId === dto.classId)) {
      throw new Error("Você já possui esta classe");
    }

    if (tierLower === "base") {
      if (baseClasses.length === 1 && (baseClasses[0]?.level ?? 1) < 10) {
        throw new Error("Atinja o nível 10 na sua primeira classe antes de escolher outra");
      }
      if (baseClasses.length >= 2) {
        throw new Error("Limite de classes base atingido (máximo 2)");
      }
    } else if (tierLower.startsWith("hibrid")) {
      // Busca requisitos específicos da classe híbrida
      const { data: classeData } = await admin
        .from("classes")
        .select("requirements")
        .eq("id", dto.classId)
        .single();

      // Formato: { min_level: 10, required_classes: [1, 3] }
      const reqs = classeData?.requirements as { min_level?: number; required_classes?: number[] } | null;
      const requiredIds: number[] = Array.isArray(reqs?.required_classes) ? reqs!.required_classes : [];
      const minLevel: number = reqs?.min_level ?? 10;

      if (requiredIds.length > 0) {
        for (const reqId of requiredIds) {
          const found = classes.find((c: any) => String(c.classId) === String(reqId));
          if (!found || (found.level ?? 1) < minLevel) {
            const { data: reqClasseData } = await admin
              .from("classes")
              .select("name")
              .eq("id", reqId)
              .single();
            const reqNome = reqClasseData?.name ?? String(reqId);
            throw new Error(
              `Requisito não atendido: ${reqNome} nível ${minLevel}`,
            );
          }
        }
      } else {
        // Fallback genérico: 2 classes base no nível 10
        const basesNivel10 = baseClasses.filter((c: any) => (c.level ?? 1) >= 10);
        if (basesNivel10.length < 2) {
          throw new Error("Você precisa ter 2 classes base no nível 10 para escolher uma classe híbrida");
        }
      }
    }

    classes.push({ classId: dto.classId, name: dto.className, tier: dto.classTier, level: 1, chosenSkills: [] });
    const nextData = { ...dataAtual, classes, classPoints: classPoints - 1 };

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

  async levelarClasse(
    characterId: string,
    dto: { classId: string },
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");

    const admin = getAdminClient();
    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    // Garante que data.classes está populado (fallback por classe_id)
    const rowPopulado = await ensureDataClassesPopuladas(current as Record<string, any>, characterId);
    const personagem = mapPersonagem(rowPopulado);
    if (!isMaster && personagem.userId !== user.id) throw new Error("Sem permissão");

    const dataAtual = normalizeData(personagem.data as Record<string, any>);
    const classPoints: number = typeof dataAtual.classPoints === "number" ? dataAtual.classPoints : 0;
    if (classPoints < 1) throw new Error("Pontos de classe insuficientes");

    const classes: any[] = Array.isArray(dataAtual.classes) ? [...dataAtual.classes] : [];
    const classIdx = classes.findIndex((c: any) => String(c.classId) === String(dto.classId));
    if (classIdx === -1) throw new Error("Classe não encontrada no personagem");

    // Converte 1 classPoint em 1 skillPoint — nível da classe NÃO sobe aqui.
    // O nível só sobe quando o skillPoint for gasto em uma skill (escolherSkillInicial).
    const currentSkillPoints: number = typeof classes[classIdx].skillPoints === "number" ? classes[classIdx].skillPoints : 0;

    classes[classIdx] = {
      ...classes[classIdx],
      skillPoints: currentSkillPoints + 1,
    };
    const nextData = { ...dataAtual, classes, classPoints: classPoints - 1 };

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

  async adicionarPontosDeClasse(
    characterId: string,
    dto: { pontos: number },
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const masterEmails = getMasterEmails();
    if (masterEmails.length === 0 || !masterEmails.includes(user.email?.toLowerCase() ?? "")) {
      throw new Error("Acesso restrito ao mestre");
    }

    if (!Number.isInteger(dto.pontos) || dto.pontos < 1) {
      throw new Error("Pontos deve ser um número inteiro positivo");
    }

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
    const currentPoints: number = typeof dataAtual.classPoints === "number" ? dataAtual.classPoints : 0;
    const nextData = { ...dataAtual, classPoints: currentPoints + dto.pontos };

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

  async adicionarSkillPointsParaClasse(
    characterId: string,
    dto: { classId: string; pontos: number },
    accessToken?: string,
  ) {
    await ensureMasterAccess(accessToken);

    if (!Number.isInteger(dto.pontos) || dto.pontos < 1) {
      throw new Error("Pontos deve ser um número inteiro positivo");
    }

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
    const classes: any[] = Array.isArray(dataAtual.classes) ? [...dataAtual.classes] : [];

    const classIdx = classes.findIndex((c: any) => String(c.classId) === String(dto.classId));
    if (classIdx === -1) throw new Error("Classe não encontrada no personagem");

    const currentSkillPoints: number = typeof classes[classIdx].skillPoints === "number" ? classes[classIdx].skillPoints : 0;
    classes[classIdx] = { ...classes[classIdx], skillPoints: currentSkillPoints + dto.pontos };

    const nextData = { ...dataAtual, classes };
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

  async atribuirXpClasse(
    characterId: string,
    dto: { classId: string; xp: number },
    accessToken?: string,
  ) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    if (!Number.isInteger(dto.xp) || dto.xp < 1) throw new Error("XP deve ser inteiro >= 1.");

    const { data: personagem, error: pErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, data")
      .eq("id", parseInt(characterId, 10))
      .is("deleted_at", null)
      .single();
    if (pErr || !personagem) throw new Error("Personagem não encontrado.");

    const dataAtual = normalizeData((personagem as any).data);
    const classes: any[] = Array.isArray(dataAtual.classes) ? [...dataAtual.classes] : [];

    const classIdx = classes.findIndex((c: any) => String(c.classId) === String(dto.classId));
    if (classIdx === -1) throw new Error("Classe não encontrada no personagem.");

    let xpAtual: number = typeof classes[classIdx].xp === "number" ? classes[classIdx].xp : 0;
    let nivel: number = typeof classes[classIdx].level === "number" ? classes[classIdx].level : 1;
    let pontoDeSkill: number = typeof classes[classIdx].skillPoints === "number" ? classes[classIdx].skillPoints : 0;
    xpAtual += dto.xp;

    const classeIdNum = parseInt(dto.classId, 10);
    if (!isNaN(classeIdNum)) {
      const { data: progressoes } = await admin
        .from("class_level_progression")
        .select("nivel, xp_necessario")
        .eq("classe_id", classeIdNum)
        .order("nivel");

      const progressaoMap: Record<number, number> = {};
      for (const p of (progressoes ?? [])) progressaoMap[(p as any).nivel] = (p as any).xp_necessario;

      while (nivel < 20) {
        const nextNivel = nivel + 1;
        const threshold = progressaoMap[nextNivel];
        if (threshold === undefined || xpAtual < threshold) break;
        xpAtual -= threshold;
        const prevNivel = nivel;
        nivel = nextNivel;
        pontoDeSkill += Math.ceil(nivel / 2) - Math.ceil(prevNivel / 2);
      }
    }

    classes[classIdx] = { ...classes[classIdx], xp: xpAtual, level: nivel, skillPoints: pontoDeSkill };
    const nextData = { ...dataAtual, classes };

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ data: nextData, updated_by: getUserDisplayEmail(user) })
      .eq("id", parseInt(characterId, 10))
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async definirInfoAdicionalDeus(
    characterId: string,
    godId: string,
    text: string,
    accessToken?: string,
  ) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    const dataAtual = normalizeData((current as any).data);
    const godAdditionalInfo: Record<string, any> = { ...(dataAtual.godAdditionalInfo ?? {}) };

    if (text.trim()) {
      godAdditionalInfo[godId] = { text: text.trim(), addedAt: new Date().toISOString() };
    } else {
      delete godAdditionalInfo[godId];
    }

    const nextData = { ...dataAtual, godAdditionalInfo };
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

  async escolherSkillInicial(
    characterId: string,
    dto: { classId: string; skillName: string },
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");

    const admin = getAdminClient();
    const { data: current, error: currentError } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (currentError || !current) throw new Error("Personagem não encontrado");

    const personagem = mapPersonagem(current);
    if (!isMaster && personagem.userId !== user.id) throw new Error("Sem permissão");

    const dataAtual = normalizeData(personagem.data as Record<string, any>);
    const classes: any[] = Array.isArray(dataAtual.classes) ? [...dataAtual.classes] : [];
    const classIdx = classes.findIndex((c: any) => String(c.classId) === String(dto.classId));
    if (classIdx === -1) throw new Error("Classe não encontrada no personagem");

    const chosenSkills: string[] = Array.isArray(classes[classIdx].chosenSkills)
      ? [...classes[classIdx].chosenSkills]
      : [];

    const skillName = dto.skillName.trim();
    if (!skillName) throw new Error("Nome da skill é obrigatório");
    if (chosenSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      throw new Error("Skill já escolhida para esta classe");
    }

    const skillPoints: number = typeof classes[classIdx].skillPoints === "number" ? classes[classIdx].skillPoints : 0;
    if (skillPoints < 1) throw new Error("Sem pontos de skill disponíveis para esta classe");

    const nivelAtual: number = typeof classes[classIdx].level === "number" ? classes[classIdx].level : 1;
    chosenSkills.push(skillName);
    classes[classIdx] = { ...classes[classIdx], chosenSkills, skillPoints: skillPoints - 1, level: nivelAtual + 1 };

    const globalSkills: any[] = Array.isArray(dataAtual.skills) ? [...dataAtual.skills] : [];
    if (!globalSkills.some((s: any) => String(s?.name ?? "").toLowerCase() === skillName.toLowerCase())) {
      globalSkills.push({ name: skillName, source: "starting_skill", addedBy: user.email ?? "player", addedAt: new Date().toISOString() });
    }

    const nextData = { ...dataAtual, classes, skills: globalSkills };
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

  async escolherRaca(characterId: string, racaId: number, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const admin = getAdminClient();

    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, raca_id")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id) {
      throw new Error("Sem permissão para alterar este personagem.");
    }

    if ((personagem as any).raca_id !== null && (personagem as any).raca_id !== undefined) {
      throw new Error("Raça já foi escolhida e não pode ser alterada.");
    }

    const { data: raca, error: racaErr } = await admin
      .from("racas")
      .select("id")
      .eq("id", racaId)
      .is("deleted_at", null)
      .single();

    if (racaErr || !raca) throw new Error("Raça não encontrada.");

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ raca_id: racaId, updated_by: getUserDisplayEmail(user) })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  async alterarStatus(characterId: string, status: 'vivo' | 'morto', accessToken?: string) {
    await ensureMasterAccess(accessToken);
    if (status !== 'vivo' && status !== 'morto') throw new Error("Status inválido. Use 'vivo' ou 'morto'.");

    const admin = getAdminClient();
    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ status, updated_by: 'master' })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Personagem não encontrado.");

    if (status === 'morto') {
      await admin
        .from("classe_secreta_revelada")
        .delete()
        .eq("character_id", characterId);
    }

    return mapPersonagem(data);
  },

  async escolherClasseInicial(characterId: string, classeId: number, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const admin = getAdminClient();
    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, classe_id, data")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id) throw new Error("Sem permissão para alterar este personagem.");
    if ((personagem as any).classe_id != null) throw new Error("Classe já foi escolhida e não pode ser alterada.");

    const { data: classe, error: classeErr } = await admin
      .from("classes")
      .select("id, name, tier")
      .eq("id", classeId)
      .is("deleted_at", null)
      .single();
    if (classeErr || !classe) throw new Error("Classe não encontrada.");

    // Inicializa data.classes[] com a classe inicial no nível 1 + 1 ponto de skill
    const dataAtual = normalizeData((personagem as any).data);
    const existingClasses: any[] = Array.isArray(dataAtual.classes) ? [...dataAtual.classes] : [];
    if (!existingClasses.some((c: any) => String(c.classId) === String(classeId))) {
      existingClasses.push({
        classId: String(classeId),
        name: (classe as any).name,
        tier: (classe as any).tier,
        level: 1,
        chosenSkills: [],
        skillPoints: 2,
      });
    }

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({
        classe_id: classeId,
        data: { ...dataAtual, classes: existingClasses },
        updated_by: getUserDisplayEmail(user),
      })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  async definirAtributos(characterId: string, atributos: {
    aura: number; forca: number; destreza: number; resistencia: number; inteligencia: number;
  }, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const TOTAL = 10;
    const values = [atributos.aura, atributos.forca, atributos.destreza, atributos.resistencia, atributos.inteligencia];
    if (values.some(v => typeof v !== "number" || v < 0 || !Number.isInteger(v))) {
      throw new Error("Todos os atributos devem ser inteiros não negativos.");
    }
    const soma = values.reduce((a, b) => a + b, 0);
    if (soma !== TOTAL) throw new Error(`Os atributos devem somar exatamente ${TOTAL} pontos (somou ${soma}).`);

    const admin = getAdminClient();
    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, data")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id) throw new Error("Sem permissão para alterar este personagem.");

    const dataAtual = (personagem as any).data ?? {};
    if (dataAtual.atributos != null) throw new Error("Atributos já foram definidos e não podem ser alterados.");

    // Busca bônus do passado escolhido
    const passadoId = (personagem as any).passado_id;
    let bonus = { aura: 0, forca: 0, destreza: 0, resistencia: 0, inteligencia: 0 };
    if (passadoId) {
      const { data: passadoRow } = await admin
        .from("passados")
        .select("atributo_bonus")
        .eq("id", passadoId)
        .single();
      if (passadoRow?.atributo_bonus) {
        const b = passadoRow.atributo_bonus as any;
        bonus = {
          aura:         Number(b.aura         ?? 0),
          forca:        Number(b.forca        ?? 0),
          destreza:     Number(b.destreza     ?? 0),
          resistencia:  Number(b.resistencia  ?? 0),
          inteligencia: Number(b.inteligencia ?? 0),
        };
      }
    }

    const atributosFinais = {
      aura:         atributos.aura         + bonus.aura,
      forca:        atributos.forca        + bonus.forca,
      destreza:     atributos.destreza     + bonus.destreza,
      resistencia:  atributos.resistencia  + bonus.resistencia,
      inteligencia: atributos.inteligencia + bonus.inteligencia,
    };

    const nextData = {
      ...dataAtual,
      atributos:      atributosFinais,
      atributos_base: { ...atributos },
      atributos_bonus_passado: bonus,
    };

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ data: nextData, updated_by: getUserDisplayEmail(user) })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  async escolherDeus(characterId: string, deusId: number | null, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const admin = getAdminClient();
    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, classe_id, data")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id) throw new Error("Sem permissão para alterar este personagem.");

    const dataAtual = (personagem as any).data ?? {};
    if (dataAtual.deusEtapaConcluida) throw new Error("Etapa de deus já foi concluída.");

    if (deusId !== null) {
      const { data: deus, error: deusErr } = await admin
        .from("gods")
        .select("id")
        .eq("id", deusId)
        .is("deleted_at", null)
        .single();
      if (deusErr || !deus) throw new Error("Deus não encontrado.");
    } else {
      const classeId = (personagem as any).classe_id;
      if (classeId) {
        const { data: classe } = await admin
          .from("classes")
          .select("requer_deus")
          .eq("id", classeId)
          .single();
        if ((classe as any)?.requer_deus) throw new Error("Esta classe exige que um deus seja escolhido.");
      }
    }

    const updates: Record<string, any> = {
      updated_by: getUserDisplayEmail(user),
      data: { ...dataAtual, deusEtapaConcluida: true },
    };
    if (deusId !== null) updates.deus_id = deusId;

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update(updates)
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  async concluirOnboarding(characterId: string, equipamentos: Array<{id: number; nome: string; peso: number}>, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const admin = getAdminClient();
    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, data, onboarding_completo")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id) throw new Error("Sem permissão para alterar este personagem.");
    if ((personagem as any).onboarding_completo) throw new Error("Onboarding já foi concluído.");

    const dataAtual = (personagem as any).data ?? {};
    const forca = (dataAtual.atributos?.forca ?? 0) as number;
    const pesoMaximo = 2 + forca * 2;
    const pesoTotal = equipamentos.reduce((sum, e) => sum + (e.peso ?? 0), 0);
    if (pesoTotal > pesoMaximo) {
      throw new Error(`Peso total (${pesoTotal.toFixed(1)} kg) excede a capacidade de carga (${pesoMaximo} kg).`);
    }

    const nextData = { ...dataAtual, equipamentos_iniciais: equipamentos };
    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ data: nextData, onboarding_completo: true, updated_by: getUserDisplayEmail(user) })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  async escolherPassado(characterId: string, passadoId: number, accessToken?: string) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado");

    const admin = getAdminClient();

    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, user_id, passado_id")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();

    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id) {
      throw new Error("Sem permissão para alterar este personagem.");
    }

    if ((personagem as any).passado_id !== null && (personagem as any).passado_id !== undefined) {
      throw new Error("Passado já foi escolhido e não pode ser alterado.");
    }

    const { data: passado, error: passadoErr } = await admin
      .from("passados")
      .select("id")
      .eq("id", passadoId)
      .is("deleted_at", null)
      .single();

    if (passadoErr || !passado) throw new Error("Passado não encontrado.");

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({ passado_id: passadoId, updated_by: getUserDisplayEmail(user) })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();

    if (error) throw error;
    return mapPersonagem(data);
  },

  // ─── Pontos de Atributo ────────────────────────────────────────────────────

  async adicionarPontosAtributo(
    characterId: string,
    dto: { pontos: number },
    accessToken?: string,
  ) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    if (!dto.pontos || dto.pontos < 1 || !Number.isInteger(dto.pontos))
      throw new Error("pontos deve ser inteiro >= 1.");

    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const dataAtual = normalizeData((personagem as any).data);
    const atual = typeof dataAtual.pontosAtributo === "number" ? dataAtual.pontosAtributo : 0;

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({
        data: { ...dataAtual, pontosAtributo: atual + dto.pontos },
        updated_by: getUserDisplayEmail(masterUser),
      })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  async distribuirPontosAtributo(
    characterId: string,
    dto: { distribuicao: Record<string, number> },
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) throw new Error("Usuário não autenticado.");

    const admin = getAdminClient();
    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.length > 0 && masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (!isMaster && (personagem as any).user_id !== user.id)
      throw new Error("Sem permissão para alterar este personagem.");

    const dataAtual = normalizeData((personagem as any).data);
    const disponivel = typeof dataAtual.pontosAtributo === "number" ? dataAtual.pontosAtributo : 0;

    const atributosValidos = ["aura", "forca", "destreza", "resistencia", "inteligencia"];
    const gastos = Object.entries(dto.distribuicao).reduce((sum, [, v]) => sum + (Number(v) || 0), 0);

    if (gastos < 1) throw new Error("Distribuição não pode ser zero.");
    if (gastos > disponivel) throw new Error("Pontos insuficientes disponíveis.");
    for (const [attr] of Object.entries(dto.distribuicao)) {
      if (!atributosValidos.includes(attr)) throw new Error(`Atributo inválido: ${attr}`);
    }

    const atributosAtuais = { ...(dataAtual.atributos ?? {}) };
    for (const [attr, val] of Object.entries(dto.distribuicao)) {
      if ((val ?? 0) > 0) {
        atributosAtuais[attr] = (atributosAtuais[attr] ?? 0) + val;
      }
    }

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({
        data: { ...dataAtual, atributos: atributosAtuais, pontosAtributo: disponivel - gastos },
        updated_by: getUserDisplayEmail(user),
      })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  async resetarPontosAtributo(
    characterId: string,
    accessToken?: string,
  ) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select("id, data, passado_id")
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const dataAtual = normalizeData((personagem as any).data);
    const base = dataAtual.atributos_base ?? {};
    const bonusPassado = dataAtual.atributos_bonus_passado ?? {};

    const atributosReset: Record<string, number> = {};
    for (const attr of ["aura", "forca", "destreza", "resistencia", "inteligencia"]) {
      atributosReset[attr] = (base[attr] ?? 0) + (bonusPassado[attr] ?? 0);
    }

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({
        data: { ...dataAtual, atributos: atributosReset, pontosAtributo: 0 },
        updated_by: getUserDisplayEmail(masterUser),
      })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  // ─── XP de Personagem ─────────────────────────────────────────────────────

  async atribuirXpPersonagem(
    characterId: string,
    dto: { xp: number },
    accessToken?: string,
  ) {
    const masterUser = await ensureMasterAccess(accessToken);
    if (!dto.xp || dto.xp < 1 || !Number.isInteger(dto.xp))
      throw new Error("xp deve ser inteiro >= 1.");

    const admin = getAdminClient();
    const { data: personagem, error: fetchErr } = await admin
      .from(PERSONAGEM_TABLE)
      .select(PERSONAGEM_SELECT_FIELDS)
      .eq("id", characterId)
      .is("deleted_at", null)
      .single();
    if (fetchErr || !personagem) throw new Error("Personagem não encontrado.");

    const dataAtual = normalizeData((personagem as any).data);
    let xpAtual = typeof dataAtual.xp === "number" ? dataAtual.xp : 0;
    let nivel = (personagem as any).level ?? 1;
    xpAtual += dto.xp;

    // Busca tabela de progressão geral
    const { data: progressoes } = await admin
      .from("level_progression")
      .select("nivel, xp_necessario")
      .order("nivel");

    const progressaoMap: Record<number, number> = {};
    for (const p of progressoes ?? []) progressaoMap[p.nivel] = p.xp_necessario;

    // Auto-levelup enquanto XP suficiente
    while (nivel < 20) {
      const threshold = progressaoMap[nivel + 1];
      if (threshold === undefined || xpAtual < threshold) break;
      xpAtual -= threshold;
      nivel++;
    }

    const { data, error } = await admin
      .from(PERSONAGEM_TABLE)
      .update({
        level: nivel,
        data: { ...dataAtual, xp: xpAtual },
        updated_by: getUserDisplayEmail(masterUser),
      })
      .eq("id", characterId)
      .is("deleted_at", null)
      .select(PERSONAGEM_SELECT_FIELDS)
      .single();
    if (error) throw error;
    return mapPersonagem(data);
  },

  // ─── Progressão de nível geral (level_progression) ────────────────────────

  async listarLevelProgression() {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("level_progression")
      .select("id, nivel, xp_necessario, created_at, updated_at")
      .order("nivel");
    if (error) throw error;
    return data ?? [];
  },

  async criarOuAtualizarLevelProgression(
    entradas: { nivel: number; xp_necessario: number }[],
    accessToken?: string,
  ) {
    const user = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const agora = new Date().toISOString();
    const rows = entradas.map(e => ({
      nivel: e.nivel,
      xp_necessario: e.xp_necessario,
      updated_at: agora,
      updated_by: getUserDisplayEmail(user),
    }));
    const { data, error } = await admin
      .from("level_progression")
      .upsert(rows, { onConflict: "nivel" })
      .select();
    if (error) throw error;
    return data ?? [];
  },

  async deletarLevelProgression(id: number, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { error } = await admin.from("level_progression").delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  },
};

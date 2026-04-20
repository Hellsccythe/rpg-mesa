// server/src/modules/personagem/personagens.service.ts
import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
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
  const envEmails = getCharacterCreationAllowedEmails();

  try {
    const dbEmails = await listCharacterCreationEmailsFromDatabase();
    return Array.from(new Set([...envEmails, ...dbEmails]));
  } catch (error: any) {
    if (error?.message?.includes("character_creation_whitelist")) {
      return envEmails;
    }

    throw error;
  }
}

function getCharacterCreationAllowedEmails() {
  const raw = process.env.CHARACTER_CREATION_ALLOWED_EMAILS ?? "";
  if (!raw.trim()) return [] as string[];

  return raw
    .split(/[,;\n]/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isCharacterCreationAllowedForEmail(email?: string | null) {
  const allowedEmails = getCharacterCreationAllowedEmails();
  if (!allowedEmails.length) return true;

  const normalizedEmail = (email ?? "").trim().toLowerCase();
  if (!normalizedEmail) return false;
  return allowedEmails.includes(normalizedEmail);
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

async function queryPublicCharacters(useAdmin: boolean) {
  const client = useAdmin ? getAdminClient() : getSupabaseClient();

  const baseQuery = client
    .from(PERSONAGEM_TABLE)
    .select("id, name, level, avatar_url, data")
    .order("created_at", { ascending: false });

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

  return client
    .from(PERSONAGEM_TABLE)
    .select("id, name, level, avatar_url, data")
    .order("created_at", { ascending: false });
}

async function ensureMasterAccess(accessToken?: string) {
  const supabase = getSupabaseClient(accessToken);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) throw new Error("Usuário não autenticado");

  const masterEmail = (process.env.MASTER_EMAIL ?? "").trim().toLowerCase();
  if (masterEmail && user.email?.toLowerCase() !== masterEmail) {
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

export const personagensService = {
  /**
   * Lista todos os personagens publicamente (sem auth).
   * Usa o admin client para bypassar RLS e retorna apenas campos seguros.
   * Requer SUPABASE_SERVICE_ROLE_KEY no .env do servidor.
   */
  async listarTodosPublico(): Promise<PersonagemPublico[]> {
    let data: any[] | null = null;

    try {
      const response = await queryPublicCharacters(true);
      if (response.error) throw response.error;
      data = response.data;
    } catch {
      const fallback = await queryPublicCharacters(false);
      if (fallback.error) throw fallback.error;
      data = fallback.data;
    }

    return (data || []).map((row) => ({
      characterId: row.id,
      name: row.name,
      level: row.level,
      avatarUrl: row.avatar_url ?? null,
      classe: (row.data as any)?.classes?.[0]?.name ?? null,
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
    return mapPersonagem(data);
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
    return mapPersonagem(data);
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

    if (!hasNameChange && !hasAvatarChange && !hasHistoryChange && !hasHistoryDocChange) {
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
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
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
        const avatarBucket = process.env.VITE_AVATAR_BUCKET || "character-avatars";
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
        updated_by: masterUser.id,
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
        deleted_by: masterUser.id,
        updated_by: masterUser.id,
      })
      .is("deleted_at", null)
      .eq("email", normalizedEmail);

    if (operation.error && isMissingColumnError(operation.error, "updated_by")) {
      operation = await admin
        .from(CHARACTER_CREATION_WHITELIST_TABLE)
        .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
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

    const masterEmail = (process.env.MASTER_EMAIL ?? "").toLowerCase().trim();
    const isMaster = masterEmail !== "" && user.email?.toLowerCase() === masterEmail;

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

    const masterEmail = (process.env.MASTER_EMAIL ?? "").toLowerCase().trim();
    const isMaster = masterEmail !== "" && user.email?.toLowerCase() === masterEmail;

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
    const classIdx = classes.findIndex((c: any) => c.classId === dto.classId);
    if (classIdx === -1) throw new Error("Classe não encontrada no personagem");

    const currentLevel: number = classes[classIdx].level ?? 1;
    if (currentLevel >= 20) throw new Error("Nível máximo já atingido (20)");

    classes[classIdx] = { ...classes[classIdx], level: currentLevel + 1 };
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

    const masterEmail = (process.env.MASTER_EMAIL ?? "").toLowerCase().trim();
    if (!masterEmail || user.email?.toLowerCase() !== masterEmail) {
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

  async escolherSkillInicial(
    characterId: string,
    dto: { classId: string; skillName: string },
    accessToken?: string,
  ) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Usuário não autenticado");

    const masterEmail = (process.env.MASTER_EMAIL ?? "").toLowerCase().trim();
    const isMaster = masterEmail !== "" && user.email?.toLowerCase() === masterEmail;

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
    const classIdx = classes.findIndex((c: any) => c.classId === dto.classId);
    if (classIdx === -1) throw new Error("Classe não encontrada no personagem");

    const chosenSkills: string[] = Array.isArray(classes[classIdx].chosenSkills)
      ? [...classes[classIdx].chosenSkills]
      : [];

    const skillName = dto.skillName.trim();
    if (!skillName) throw new Error("Nome da skill é obrigatório");
    if (chosenSkills.some((s) => s.toLowerCase() === skillName.toLowerCase())) {
      throw new Error("Skill já escolhida para esta classe");
    }

    chosenSkills.push(skillName);
    classes[classIdx] = { ...classes[classIdx], chosenSkills };

    const globalSkills: any[] = Array.isArray(dataAtual.skills) ? [...dataAtual.skills] : [];
    if (!globalSkills.some((s: any) => String(s?.name ?? "").toLowerCase() === skillName.toLowerCase())) {
      globalSkills.push({ name: skillName, addedBy: user.email ?? "player", addedAt: new Date().toISOString() });
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
};

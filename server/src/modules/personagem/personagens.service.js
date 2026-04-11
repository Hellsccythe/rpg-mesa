// server/src/modules/personagem/personagens.service.ts
import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { PERSONAGEM_SELECT_FIELDS, PERSONAGEM_TABLE, mapPersonagem, } from "../../models/personagem.model.js";
const CHARACTER_CREATION_WHITELIST_TABLE = "character_creation_whitelist";
function normalizeEmail(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function isMissingTableError(error) {
    const message = String(error?.message ?? "").toLowerCase();
    return (error?.code === "42P01" || (message.includes("relation") && message.includes("does not exist")));
}
function isMissingColumnError(error, columnName) {
    const message = String(error?.message ?? "").toLowerCase();
    const normalizedColumn = columnName.trim().toLowerCase();
    return (error?.code === "42703" ||
        (message.includes("column") && message.includes(normalizedColumn) && message.includes("does not exist")));
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
            throw new Error("Tabela 'character_creation_whitelist' nao encontrada. Crie a tabela para gerenciar emails pelo painel mestre.");
        }
        throw error;
    }
    return (data ?? []).map((item) => normalizeEmail(item?.email)).filter(Boolean);
}
async function getCharacterCreationAllowedEmailsMerged() {
    const envEmails = getCharacterCreationAllowedEmails();
    try {
        const dbEmails = await listCharacterCreationEmailsFromDatabase();
        return Array.from(new Set([...envEmails, ...dbEmails]));
    }
    catch (error) {
        if (error?.message?.includes("character_creation_whitelist")) {
            return envEmails;
        }
        throw error;
    }
}
function getCharacterCreationAllowedEmails() {
    const raw = process.env.CHARACTER_CREATION_ALLOWED_EMAILS ?? "";
    if (!raw.trim())
        return [];
    return raw
        .split(/[,;\n]/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}
function isCharacterCreationAllowedForEmail(email) {
    const allowedEmails = getCharacterCreationAllowedEmails();
    if (!allowedEmails.length)
        return true;
    const normalizedEmail = (email ?? "").trim().toLowerCase();
    if (!normalizedEmail)
        return false;
    return allowedEmails.includes(normalizedEmail);
}
function getPendingChangeRequest(data) {
    if (!data || typeof data !== "object")
        return null;
    const pending = data.pendingChangeRequest;
    if (!pending || typeof pending !== "object")
        return null;
    return pending;
}
function normalizeData(data) {
    if (!data || typeof data !== "object")
        return {};
    return { ...data };
}
async function queryPublicCharacters(useAdmin) {
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
    const columnMissing = withSoftDeleteFilter.error.code === "42703" ||
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
async function ensureMasterAccess(accessToken) {
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error, } = await supabase.auth.getUser();
    if (error || !user)
        throw new Error("Usuário não autenticado");
    const masterEmail = (process.env.MASTER_EMAIL ?? "").trim().toLowerCase();
    if (masterEmail && user.email?.toLowerCase() !== masterEmail) {
        throw new Error("Acesso restrito ao mestre");
    }
    return user;
}
export const personagensService = {
    /**
     * Lista todos os personagens publicamente (sem auth).
     * Usa o admin client para bypassar RLS e retorna apenas campos seguros.
     * Requer SUPABASE_SERVICE_ROLE_KEY no .env do servidor.
     */
    async listarTodosPublico() {
        let data = null;
        try {
            const response = await queryPublicCharacters(true);
            if (response.error)
                throw response.error;
            data = response.data;
        }
        catch {
            const fallback = await queryPublicCharacters(false);
            if (fallback.error)
                throw fallback.error;
            data = fallback.data;
        }
        return (data || []).map((row) => ({
            characterId: row.id,
            name: row.name,
            level: row.level,
            avatarUrl: row.avatar_url ?? null,
            classe: row.data?.classes?.[0]?.name ?? null,
        }));
    },
    async getUsuario(accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, error, } = await supabase.auth.getUser();
        if (error || !user)
            throw new Error("Usuário não autenticado");
        return { id: user.id, email: user.email };
    },
    async listarMeusPersonagens(filtro = {}, accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user)
            throw new Error("Usuário não autenticado");
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
            }
            else {
                query = query.eq("campaign_id", filtro.campaignId);
            }
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return (data || []).map(mapPersonagem);
    },
    async salvarPersonagem(payload, accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, } = await supabase.auth.getUser();
        if (!user)
            throw new Error("Usuário não autenticado");
        const allowedEmails = await getCharacterCreationAllowedEmailsMerged();
        const normalizedUserEmail = normalizeEmail(user.email);
        const emailAllowed = !allowedEmails.length ||
            (!!normalizedUserEmail && allowedEmails.includes(normalizedUserEmail));
        if (!emailAllowed) {
            throw new Error("Erro: email nao liberado pelo mestre.");
        }
        const { data, error } = await supabase
            .from(PERSONAGEM_TABLE)
            .insert({
            user_id: user.id,
            name: payload.name,
            level: payload.level ?? 1,
            avatar_url: payload.avatarUrl ?? null,
            data: payload.data ?? {},
        })
            .select(PERSONAGEM_SELECT_FIELDS)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async editarPersonagem(characterId, dto, accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, error: userError, } = await supabase.auth.getUser();
        if (userError || !user)
            throw new Error("Usuário não autenticado");
        const updates = {};
        if (dto.name !== undefined)
            updates.name = dto.name;
        if (dto.level !== undefined)
            updates.level = dto.level;
        if (dto.data !== undefined)
            updates.data = dto.data;
        const { data, error } = await supabase
            .from(PERSONAGEM_TABLE)
            .update(updates)
            .eq("id", characterId)
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .select(PERSONAGEM_SELECT_FIELDS)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async obterMeuPersonagemPorId(characterId, accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, error: userError, } = await supabase.auth.getUser();
        if (userError || !user)
            throw new Error("Usuário não autenticado");
        const { data, error } = await supabase
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async obterPersonagemPorIdComoMestre(characterId, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .is("deleted_at", null)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async solicitarAlteracao(characterId, dto, accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, error: userError, } = await supabase.auth.getUser();
        if (userError || !user)
            throw new Error("Usuário não autenticado");
        const { data: current, error: currentError } = await supabase
            .from(PERSONAGEM_TABLE)
            .select("id, user_id, data")
            .eq("id", characterId)
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .single();
        if (currentError || !current)
            throw new Error("Personagem não encontrado");
        const hasNameChange = typeof dto.name === "string" && dto.name.trim().length > 0;
        const hasAvatarChange = typeof dto.avatarUrl === "string" && dto.avatarUrl.trim().length > 0;
        const hasHistoryChange = typeof dto.history === "string";
        const hasHistoryDocChange = typeof dto.historyDocumentPath === "string";
        if (!hasNameChange && !hasAvatarChange && !hasHistoryChange && !hasHistoryDocChange) {
            throw new Error("Informe ao menos um campo para solicitar alteração");
        }
        const nextData = normalizeData(current.data);
        nextData.pendingChangeRequest = {
            requestedAt: new Date().toISOString(),
            requestedByUserId: user.id,
            requestedByEmail: user.email ?? null,
            ...(hasNameChange ? { name: dto.name.trim() } : {}),
            ...(hasAvatarChange ? { avatarUrl: dto.avatarUrl.trim() } : {}),
            ...(hasHistoryChange ? { history: dto.history ?? "" } : {}),
            ...(hasHistoryDocChange
                ? {
                    historyDocumentPath: dto.historyDocumentPath?.trim() ?? "",
                    historyDocumentName: dto.historyDocumentName?.trim() ?? "",
                    historyDocumentMimeType: dto.historyDocumentMimeType ?? null,
                }
                : {}),
        };
        const { data, error } = await supabase
            .from(PERSONAGEM_TABLE)
            .update({ data: nextData })
            .eq("id", characterId)
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .select(PERSONAGEM_SELECT_FIELDS)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async listarSolicitacoesPendentes(accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .is("deleted_at", null)
            .order("updated_at", { ascending: false });
        if (error)
            throw error;
        const personagens = (data || []).map(mapPersonagem);
        return personagens
            .map((personagem) => {
            const pending = getPendingChangeRequest(personagem.data);
            if (!pending)
                return null;
            return {
                characterId: personagem.characterId,
                currentName: personagem.name,
                currentAvatarUrl: personagem.avatarUrl,
                currentHistory: personagem.data?.history ?? null,
                currentHistoryDocumentPath: personagem.data?.historyDocumentPath ??
                    personagem.data?.historyDocumentUrl ??
                    null,
                currentHistoryDocumentName: personagem.data?.historyDocumentName ?? null,
                requestedName: pending.name ?? null,
                requestedAvatarUrl: pending.avatarUrl ?? null,
                requestedHistory: pending.history ?? null,
                requestedHistoryDocumentPath: pending.historyDocumentPath ?? null,
                requestedHistoryDocumentName: pending.historyDocumentName ?? null,
                requestedAt: pending.requestedAt,
                requestedByEmail: pending.requestedByEmail,
            };
        })
            .filter(Boolean);
    },
    async revisarSolicitacao(characterId, dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .is("deleted_at", null)
            .single();
        if (currentError || !current)
            throw new Error("Personagem não encontrado");
        const personagem = mapPersonagem(current);
        const currentData = normalizeData(personagem.data);
        const pending = getPendingChangeRequest(currentData);
        if (!pending)
            throw new Error("Não há solicitação pendente para este personagem");
        const nextData = { ...currentData };
        delete nextData.pendingChangeRequest;
        const updates = { data: nextData };
        if (dto.approve) {
            if (pending.name?.trim())
                updates.name = pending.name.trim();
            if (pending.avatarUrl?.trim())
                updates.avatar_url = pending.avatarUrl.trim();
            if (pending.history !== undefined)
                nextData.history = pending.history;
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
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async salvarDeus(dto, accessToken) {
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
        if (error)
            throw error;
        return data;
    },
    async salvarCidadeMapa(dto, accessToken) {
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
        if (error)
            throw error;
        return data;
    },
    async salvarClasseMestre(dto, accessToken) {
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
        if (error)
            throw error;
        return data;
    },
    async salvarTituloMestre(dto, accessToken) {
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
        if (error)
            throw error;
        return data;
    },
    async adicionarSkillEmPersonagem(characterId, dto, accessToken) {
        const user = await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .is("deleted_at", null)
            .single();
        if (currentError || !current)
            throw new Error("Personagem não encontrado");
        const personagem = mapPersonagem(current);
        const dataAtual = normalizeData(personagem.data);
        const skills = Array.isArray(dataAtual.skills) ? [...dataAtual.skills] : [];
        const skillName = dto.skillName.trim();
        if (!skillName)
            throw new Error("Skill é obrigatória");
        if (!skills.some((item) => String(item?.name ?? "").toLowerCase() === skillName.toLowerCase())) {
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
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async adicionarTituloEmPersonagem(characterId, dto, accessToken) {
        const user = await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .is("deleted_at", null)
            .single();
        if (currentError || !current)
            throw new Error("Personagem não encontrado");
        const personagem = mapPersonagem(current);
        const dataAtual = normalizeData(personagem.data);
        const titles = Array.isArray(dataAtual.titles) ? [...dataAtual.titles] : [];
        const titleName = dto.titleName.trim();
        if (!titleName)
            throw new Error("Título é obrigatório");
        if (!titles.some((item) => String(item?.name ?? "").toLowerCase() === titleName.toLowerCase())) {
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
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async adicionarNotaAventura(characterId, dto, accessToken) {
        const user = await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from(PERSONAGEM_TABLE)
            .select(PERSONAGEM_SELECT_FIELDS)
            .eq("id", characterId)
            .is("deleted_at", null)
            .single();
        if (currentError || !current)
            throw new Error("Personagem não encontrado");
        const personagem = mapPersonagem(current);
        const dataAtual = normalizeData(personagem.data);
        const notes = Array.isArray(dataAtual.adventureNotes) ? [...dataAtual.adventureNotes] : [];
        const note = dto.note.trim();
        if (!note)
            throw new Error("Nota de aventura é obrigatória");
        notes.push({ text: note, addedBy: user.email ?? "master", addedAt: new Date().toISOString() });
        const nextData = { ...dataAtual, adventureNotes: notes };
        const { data, error } = await admin
            .from(PERSONAGEM_TABLE)
            .update({ data: nextData })
            .eq("id", characterId)
            .is("deleted_at", null)
            .select(PERSONAGEM_SELECT_FIELDS)
            .single();
        if (error)
            throw error;
        return mapPersonagem(data);
    },
    async deletarMeuPersonagem(characterId, accessToken) {
        const supabase = getSupabaseClient(accessToken);
        const { data: { user }, error: userError, } = await supabase.auth.getUser();
        if (userError || !user)
            throw new Error("Usuário não autenticado");
        const { data, error } = await supabase
            .from(PERSONAGEM_TABLE)
            .update({ deleted_at: new Date().toISOString() })
            .eq("id", characterId)
            .eq("user_id", user.id)
            .is("deleted_at", null)
            .select("id")
            .single();
        if (error)
            throw error;
        return { success: !!data?.id };
    },
    async listarEmailsPermitidosCriacaoPersonagem(accessToken) {
        await ensureMasterAccess(accessToken);
        const emails = await listCharacterCreationEmailsFromDatabase();
        return { emails };
    },
    async adicionarEmailPermitidoCriacaoPersonagem(email, accessToken) {
        const masterUser = await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            throw new Error("Email invalido para liberacao.");
        }
        let operation = await admin
            .from(CHARACTER_CREATION_WHITELIST_TABLE)
            .upsert({
            email: normalizedEmail,
            deleted_at: null,
            deleted_by: null,
            updated_by: masterUser.id,
        }, { onConflict: "email" });
        if (operation.error && isMissingColumnError(operation.error, "updated_by")) {
            operation = await admin
                .from(CHARACTER_CREATION_WHITELIST_TABLE)
                .upsert({ email: normalizedEmail, deleted_at: null, deleted_by: null }, { onConflict: "email" });
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
                throw new Error("Tabela 'character_creation_whitelist' nao encontrada. Crie a tabela para habilitar o cadastro de emails no painel mestre.");
            }
            throw error;
        }
        return { success: true, email: normalizedEmail };
    },
    async removerEmailPermitidoCriacaoPersonagem(email, accessToken) {
        const masterUser = await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const normalizedEmail = normalizeEmail(email);
        if (!isValidEmail(normalizedEmail)) {
            throw new Error("Email invalido para remocao.");
        }
        let operation = await admin
            .from(CHARACTER_CREATION_WHITELIST_TABLE)
            .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id, updated_by: masterUser.id })
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
                throw new Error("Tabela 'character_creation_whitelist' nao encontrada. Crie a tabela para habilitar o cadastro de emails no painel mestre.");
            }
            throw error;
        }
        return { success: true, email: normalizedEmail };
    },
};
//# sourceMappingURL=personagens.service.js.map
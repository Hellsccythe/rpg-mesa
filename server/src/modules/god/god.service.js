import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import sharp from "sharp";
const GODS_BUCKET = "gods";
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}
function normalizeGodTitle(value) {
    const title = normalizeText(value);
    const normalized = title
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return normalized === "sem titulo" ? "" : title;
}
function sanitizeFileName(fileName) {
    return normalizeText(fileName)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
}
function removeFileExtension(fileName) {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex <= 0)
        return fileName;
    return fileName.slice(0, lastDotIndex);
}
function normalizeStoragePath(pathValue) {
    const normalized = normalizeText(pathValue).replace(/^\/+/, "");
    if (!normalized)
        return "";
    const bucketPrefix = `${GODS_BUCKET}/`;
    return normalized.startsWith(bucketPrefix) ? normalized.slice(bucketPrefix.length) : normalized;
}
function isMissingColumnError(error) {
    const message = String(error?.message ?? "").toLowerCase();
    return message.includes("column") && message.includes("does not exist");
}
function readGodField(row, data, camel, snake) {
    const snakeKey = snake ?? camel.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
    return normalizeText(row?.[camel] ?? row?.[snakeKey] ?? data?.[camel] ?? data?.[snakeKey]);
}
const EMPTY_GOD_DETAILS = {
    title: "",
    indole: "",
    dogma: "",
    anatema: "",
    weapons: "",
    shortDescription: "",
    imageUrl: "",
};
function toGodDetails(dto) {
    return {
        title: normalizeGodTitle(dto.title),
        indole: normalizeText(dto.indole),
        dogma: normalizeText(dto.dogma),
        anatema: normalizeText(dto.anatema),
        weapons: normalizeText(dto.weapons),
        shortDescription: normalizeText(dto.shortDescription),
        imageUrl: normalizeText(dto.imageUrl),
    };
}
function mapGod(row) {
    const data = row?.data && typeof row.data === "object" ? row.data : {};
    const rawImage = readGodField(row, data, "imageUrl", "image_url") ||
        readGodField(row, data, "imagePath", "image_path");
    const imageUrl = rawImage
        ? rawImage.startsWith("http")
            ? rawImage
            : getAdminClient().storage.from(GODS_BUCKET).getPublicUrl(normalizeStoragePath(rawImage)).data
                .publicUrl
        : "";
    return {
        id: String(row?.id ?? ""),
        name: normalizeText(row?.name),
        description: normalizeText(row?.description),
        title: normalizeGodTitle(readGodField(row, data, "title")),
        indole: readGodField(row, data, "indole"),
        dogma: readGodField(row, data, "dogma"),
        anatema: readGodField(row, data, "anatema"),
        weapons: readGodField(row, data, "weapons"),
        shortDescription: readGodField(row, data, "shortDescription", "short_description"),
        imageUrl,
        createdAt: row?.created_at,
        updatedAt: row?.updated_at,
    };
}
export const godService = {
    async uploadImagem(file, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        if (!file?.buffer?.length)
            throw new Error("Arquivo de imagem invalido");
        if (!file.mimetype?.startsWith("image/")) {
            throw new Error("Formato invalido. Envie uma imagem");
        }
        const maxSize = 30 * 1024 * 1024;
        if (file.size > maxSize) {
            throw new Error("Imagem excede o limite de 30MB");
        }
        // Converte para WebP e limita dimensao para reduzir consumo no bucket e no egress.
        const compressedBuffer = await sharp(file.buffer, { failOn: "none" })
            .rotate()
            .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
        })
            .webp({ quality: 74, effort: 5 })
            .toBuffer();
        const safeName = sanitizeFileName(removeFileExtension(file.originalname || "deus"));
        const objectPath = `${Date.now()}-${safeName || "deus"}.webp`;
        const { error: uploadError } = await admin.storage
            .from(GODS_BUCKET)
            .upload(objectPath, compressedBuffer, {
            contentType: "image/webp",
            upsert: true,
            cacheControl: "31536000",
        });
        if (uploadError)
            throw uploadError;
        const { data } = admin.storage.from(GODS_BUCKET).getPublicUrl(objectPath);
        return {
            path: objectPath,
            publicUrl: data.publicUrl,
        };
    },
    async listarPublico() {
        const admin = getAdminClient();
        const { data, error } = await admin.from("gods").select("*").order("created_at", {
            ascending: false,
        });
        if (error)
            throw error;
        return (data ?? []).map(mapGod);
    },
    async listar(accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin.from("gods").select("*").order("created_at", {
            ascending: false,
        });
        if (error)
            throw error;
        return (data ?? []).map(mapGod);
    },
    async salvar(dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const details = toGodDetails(dto);
        const basePayload = {
            name: dto.name.trim(),
            description: dto.description?.trim() ?? "",
        };
        const payloadAttempts = [
            { ...basePayload, data: details },
            {
                ...basePayload,
                title: details.title,
                indole: details.indole,
                dogma: details.dogma,
                anatema: details.anatema,
                weapons: details.weapons,
                short_description: details.shortDescription,
                image_url: details.imageUrl,
            },
            {
                ...basePayload,
                indole: details.indole,
                dogma: details.dogma,
                anatema: details.anatema,
                weapons: details.weapons,
                short_description: details.shortDescription,
                image_path: details.imageUrl,
            },
            {
                ...basePayload,
                title: details.title,
                indole: details.indole,
                dogma: details.dogma,
                anatema: details.anatema,
                weapons: details.weapons,
                shortDescription: details.shortDescription,
                imageUrl: details.imageUrl,
            },
            basePayload,
        ];
        let lastError;
        for (const payload of payloadAttempts) {
            const { data, error } = await admin.from("gods").insert(payload).select("*").single();
            if (!error)
                return mapGod(data);
            lastError = error;
            if (!isMissingColumnError(error))
                throw error;
        }
        throw lastError;
    },
    async editar(godId, dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from("gods")
            .select("*")
            .eq("id", godId)
            .single();
        if (currentError || !current)
            throw new Error("Deus não encontrado");
        const currentData = current.data && typeof current.data === "object" ? current.data : EMPTY_GOD_DETAILS;
        const details = {
            title: dto.title !== undefined
                ? normalizeText(dto.title)
                : readGodField(current, currentData, "title"),
            indole: dto.indole !== undefined
                ? normalizeText(dto.indole)
                : readGodField(current, currentData, "indole"),
            dogma: dto.dogma !== undefined
                ? normalizeText(dto.dogma)
                : readGodField(current, currentData, "dogma"),
            anatema: dto.anatema !== undefined
                ? normalizeText(dto.anatema)
                : readGodField(current, currentData, "anatema"),
            weapons: dto.weapons !== undefined
                ? normalizeText(dto.weapons)
                : readGodField(current, currentData, "weapons"),
            shortDescription: dto.shortDescription !== undefined
                ? normalizeText(dto.shortDescription)
                : readGodField(current, currentData, "shortDescription", "short_description"),
            imageUrl: dto.imageUrl !== undefined
                ? normalizeText(dto.imageUrl)
                : readGodField(current, currentData, "imageUrl", "image_url"),
        };
        const baseUpdates = {
            ...(dto.name !== undefined ? { name: normalizeText(dto.name) } : {}),
            ...(dto.description !== undefined ? { description: normalizeText(dto.description) } : {}),
        };
        const updateAttempts = [
            { ...baseUpdates, data: details },
            {
                ...baseUpdates,
                title: details.title,
                indole: details.indole,
                dogma: details.dogma,
                anatema: details.anatema,
                weapons: details.weapons,
                short_description: details.shortDescription,
                image_url: details.imageUrl,
            },
            {
                ...baseUpdates,
                indole: details.indole,
                dogma: details.dogma,
                anatema: details.anatema,
                weapons: details.weapons,
                short_description: details.shortDescription,
                image_path: details.imageUrl,
            },
            {
                ...baseUpdates,
                title: details.title,
                indole: details.indole,
                dogma: details.dogma,
                anatema: details.anatema,
                weapons: details.weapons,
                shortDescription: details.shortDescription,
                imageUrl: details.imageUrl,
            },
            baseUpdates,
        ];
        let lastError;
        for (const updates of updateAttempts) {
            const { data, error } = await admin
                .from("gods")
                .update(updates)
                .eq("id", godId)
                .select("*")
                .single();
            if (!error)
                return mapGod(data);
            lastError = error;
            if (!isMissingColumnError(error))
                throw error;
        }
        throw lastError;
    },
};
//# sourceMappingURL=god.service.js.map
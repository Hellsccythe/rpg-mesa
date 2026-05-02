import { getAdminClient, getSupabaseClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import type { EditarGodDto, SalvarGodDto } from "./god.dto.js";
import sharp from "sharp";

const GODS_BUCKET = "gods";

type GodRecord = {
  id: string;
  name: string;
  description: string;
  title: string;
  indole: string;
  dogma: string;
  anatema: string;
  weapons: string;
  shortDescription: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
};

type GodDetails = {
  title: string;
  indole: string;
  dogma: string;
  anatema: string;
  weapons: string;
  shortDescription: string;
  imageUrl: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGodTitle(value: unknown) {
  const title = normalizeText(value);
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  return normalized === "sem titulo" ? "" : title;
}

function sanitizeFileName(fileName: string) {
  return normalizeText(fileName)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function removeFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0) return fileName;
  return fileName.slice(0, lastDotIndex);
}

function normalizeStoragePath(pathValue: string) {
  const normalized = normalizeText(pathValue).replace(/^\/+/, "");
  if (!normalized) return "";
  const bucketPrefix = `${GODS_BUCKET}/`;
  return normalized.startsWith(bucketPrefix) ? normalized.slice(bucketPrefix.length) : normalized;
}

// Lê campo de god suportando tanto JSONB (data.field) quanto coluna direta (snake e camel)
function readGodField(row: any, data: any, camel: string, snake?: string) {
  const snakeKey = snake ?? camel.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
  return normalizeText(row?.[camel] ?? row?.[snakeKey] ?? data?.[camel] ?? data?.[snakeKey]);
}

function toGodDetails(dto: Partial<SalvarGodDto & EditarGodDto>): GodDetails {
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

function currentGodDetails(row: any, data: any): GodDetails {
  return {
    title: normalizeGodTitle(readGodField(row, data, "title")),
    indole: readGodField(row, data, "indole"),
    dogma: readGodField(row, data, "dogma"),
    anatema: readGodField(row, data, "anatema"),
    weapons: readGodField(row, data, "weapons"),
    shortDescription: readGodField(row, data, "shortDescription", "short_description"),
    imageUrl: data?.imageUrl || data?.imagePath || row?.image_url || row?.image_path || "",
  };
}

function mapGod(row: any): GodRecord {
  const data = row?.data && typeof row.data === "object" ? row.data : {};
  const details = currentGodDetails(row, data);
  const rawImage = details.imageUrl;

  const imageUrl = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : getAdminClient().storage.from(GODS_BUCKET).getPublicUrl(normalizeStoragePath(rawImage)).data.publicUrl
    : "";

  return {
    id: String(row?.id ?? ""),
    name: normalizeText(row?.name),
    description: normalizeText(row?.description),
    title: details.title,
    indole: details.indole,
    dogma: details.dogma,
    anatema: details.anatema,
    weapons: details.weapons,
    shortDescription: details.shortDescription,
    imageUrl,
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}

async function removeImageFromStorage(imageUrl: string) {
  if (!imageUrl || imageUrl.startsWith("http")) return;
  try {
    const path = normalizeStoragePath(imageUrl);
    if (path) await getAdminClient().storage.from(GODS_BUCKET).remove([path]);
  } catch {
    // falha no storage não bloqueia a operação principal
  }
}

export const godService = {
  async uploadImagem(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    accessToken?: string,
  ) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    if (!file?.buffer?.length) throw new Error("Arquivo de imagem invalido");
    if (!file.mimetype?.startsWith("image/")) throw new Error("Formato invalido. Envie uma imagem");

    const maxSize = 30 * 1024 * 1024;
    if (file.size > maxSize) throw new Error("Imagem excede o limite de 30MB");

    const compressedBuffer = await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
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

    if (uploadError) throw uploadError;

    const { data } = admin.storage.from(GODS_BUCKET).getPublicUrl(objectPath);
    return { path: objectPath, publicUrl: data.publicUrl };
  },

  async listarPublico() {
    // Usa client anon — RLS policy "gods_select_public" permite leitura sem auth
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("gods")
      .select("id, name, description, data, image_url, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapGod);
  },

  async listar(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("gods")
      .select("id, name, description, data, image_url, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapGod);
  },

  async salvar(dto: SalvarGodDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("gods")
      .insert({
        name: dto.name.trim(),
        description: dto.description?.trim() ?? "",
        data: toGodDetails(dto),
      })
      .select("id, name, description, data, image_url, created_at, updated_at")
      .single();

    if (error) throw error;
    return mapGod(data);
  },

  async editar(godId: string, dto: EditarGodDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from("gods")
      .select("id, name, description, data")
      .eq("id", godId)
      .is("deleted_at", null)
      .single();

    if (currentError || !current) throw new Error("Deus não encontrado");

    const currentData = current.data && typeof current.data === "object" ? current.data : {};
    const existing = currentGodDetails(current, currentData);

    const nextDetails: GodDetails = {
      title: dto.title !== undefined ? normalizeGodTitle(dto.title) : existing.title,
      indole: dto.indole !== undefined ? normalizeText(dto.indole) : existing.indole,
      dogma: dto.dogma !== undefined ? normalizeText(dto.dogma) : existing.dogma,
      anatema: dto.anatema !== undefined ? normalizeText(dto.anatema) : existing.anatema,
      weapons: dto.weapons !== undefined ? normalizeText(dto.weapons) : existing.weapons,
      shortDescription: dto.shortDescription !== undefined ? normalizeText(dto.shortDescription) : existing.shortDescription,
      imageUrl: dto.imageUrl !== undefined ? normalizeText(dto.imageUrl) : existing.imageUrl,
    };

    const updates: Record<string, unknown> = { data: nextDetails };
    if (dto.name !== undefined) updates.name = normalizeText(dto.name);
    if (dto.description !== undefined) updates.description = normalizeText(dto.description);

    const { data, error } = await admin
      .from("gods")
      .update(updates)
      .eq("id", godId)
      .is("deleted_at", null)
      .select("id, name, description, data, image_url, created_at, updated_at")
      .single();

    if (error) throw error;
    return mapGod(data);
  },

  async deletar(godId: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: god, error: fetchError } = await admin
      .from("gods")
      .select("id, data")
      .eq("id", godId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !god) throw new Error("Deus não encontrado");

    const { error } = await admin
      .from("gods")
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("id", godId)
      .is("deleted_at", null);

    if (error) throw error;

    const data = god.data && typeof god.data === "object" ? god.data : {};
    const imageUrl = currentGodDetails(god, data).imageUrl;
    await removeImageFromStorage(imageUrl);

    return { success: true };
  },
};

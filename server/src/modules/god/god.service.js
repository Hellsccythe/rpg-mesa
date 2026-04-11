import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
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
function readGodField(row, data, camel, snake) {
  const snakeKey = snake ?? camel.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
  return normalizeText(row?.[camel] ?? row?.[snakeKey] ?? data?.[camel] ?? data?.[snakeKey]);
}
function mapGod(row) {
  const data = row?.data && typeof row.data === "object" ? row.data : {};
  const rawImage =
    readGodField(row, data, "imageUrl", "image_url") ||
    readGodField(row, data, "imagePath", "image_path");
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
    imageUrl: rawImage,
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}
export const godService = {
  async listar(accessToken) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("gods")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapGod);
  },
  async salvar(dto, accessToken) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const dataPayload = {
      title: normalizeGodTitle(dto.title),
      indole: normalizeText(dto.indole),
      dogma: normalizeText(dto.dogma),
      anatema: normalizeText(dto.anatema),
      weapons: normalizeText(dto.weapons),
      shortDescription: normalizeText(dto.shortDescription),
      imageUrl: normalizeText(dto.imageUrl),
    };
    const { data, error } = await admin
      .from("gods")
      .insert({
        name: dto.name.trim(),
        description: dto.description?.trim() ?? "",
        data: dataPayload,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapGod(data);
  },
  async editar(godId, dto, accessToken) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();
    const { data: current, error: currentError } = await admin
      .from("gods")
      .select("*")
      .eq("id", godId)
      .single();
    if (currentError || !current) throw new Error("Deus não encontrado");
    const currentData = current.data && typeof current.data === "object" ? current.data : {};
    const nextData = {
      ...currentData,
      ...(dto.title !== undefined ? { title: normalizeGodTitle(dto.title) } : {}),
      ...(dto.indole !== undefined ? { indole: normalizeText(dto.indole) } : {}),
      ...(dto.dogma !== undefined ? { dogma: normalizeText(dto.dogma) } : {}),
      ...(dto.anatema !== undefined ? { anatema: normalizeText(dto.anatema) } : {}),
      ...(dto.weapons !== undefined ? { weapons: normalizeText(dto.weapons) } : {}),
      ...(dto.shortDescription !== undefined
        ? { shortDescription: normalizeText(dto.shortDescription) }
        : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: normalizeText(dto.imageUrl) } : {}),
    };
    const updates = {
      data: nextData,
      ...(dto.name !== undefined ? { name: normalizeText(dto.name) } : {}),
      ...(dto.description !== undefined ? { description: normalizeText(dto.description) } : {}),
    };
    const { data, error } = await admin
      .from("gods")
      .update(updates)
      .eq("id", godId)
      .select("*")
      .single();
    if (error) throw error;
    return mapGod(data);
  },
};
//# sourceMappingURL=god.service.js.map

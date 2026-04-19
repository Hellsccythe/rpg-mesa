import { getAdminClient } from "../../config/database/supabase/client.js";
import {
  ensureAuthenticatedAccess,
  ensureMasterAccess,
} from "../../common/helpers/master-access.helper.js";
import type { EditarCityMapDto, PointOfInterestDto, SalvarCityMapDto } from "./city-maps.dto.js";
import sharp from "sharp";

const MAPS_BUCKET = "maps";

type CityMapRecord = {
  id: string;
  name: string;
  mapReference: string;
  description: string;
  imageUrl: string;
  citySlug: string;
  cityName: string;
  cityDescription: string;
  cityCulture: string;
  mapType: "city" | "localized";
  parentCityMapId: string;
  pointsOfInterest: PointOfInterestDto[];
  createdAt?: string;
  updatedAt?: string;
};

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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

function sanitizePoints(points: unknown): PointOfInterestDto[] {
  if (!Array.isArray(points)) return [];

  return points
    .map((item: any, index) => ({
      id: normalizeText(item?.id) || `poi-${index + 1}`,
      name: normalizeText(item?.name),
      x: Number(item?.x),
      y: Number(item?.y),
      description: normalizeText(item?.description),
      targetCityMapId: normalizeText(item?.targetCityMapId),
      targetLabel: normalizeText(item?.targetLabel),
    }))
    .filter((item) => item.name && Number.isFinite(item.x) && Number.isFinite(item.y))
    .map((item) => ({
      ...item,
      x: Math.min(100, Math.max(0, item.x)),
      y: Math.min(100, Math.max(0, item.y)),
    }));
}

function mapCityMap(row: any): CityMapRecord {
  const data = row?.data && typeof row.data === "object" ? row.data : {};
  const parentCityMapId = normalizeText(data?.parentCityMapId);
  const mapType =
    normalizeText(data?.mapType) === "localized" || parentCityMapId ? "localized" : "city";

  return {
    id: String(row?.id ?? ""),
    name: normalizeText(row?.name),
    mapReference: normalizeText(row?.map_reference),
    description: normalizeText(row?.description),
    imageUrl: normalizeText(data?.imageUrl),
    citySlug: normalizeText(data?.citySlug) || "hamlet",
    cityName: normalizeText(data?.cityName) || "Hamlet",
    cityDescription: normalizeText(data?.cityDescription),
    cityCulture: normalizeText(data?.cityCulture),
    mapType,
    parentCityMapId,
    pointsOfInterest: sanitizePoints(data?.pointsOfInterest),
    createdAt: row?.created_at,
    updatedAt: row?.updated_at,
  };
}

export const cityMapsService = {
  async uploadImagem(
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    accessToken?: string,
  ) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    if (!file?.buffer?.length) throw new Error("Arquivo de imagem invalido");
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
        width: 2200,
        height: 2200,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 76, effort: 5 })
      .toBuffer();

    const safeName = sanitizeFileName(removeFileExtension(file.originalname || "mapa"));
    const objectPath = `${Date.now()}-${safeName || "mapa"}.webp`;

    const { error: uploadError } = await admin.storage
      .from(MAPS_BUCKET)
      .upload(objectPath, compressedBuffer, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "31536000",
      });

    if (uploadError) throw uploadError;

    const { data } = admin.storage.from(MAPS_BUCKET).getPublicUrl(objectPath);

    return {
      path: objectPath,
      publicUrl: data.publicUrl,
    };
  },

  async listar(accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("city_maps")
      .select("id, name, map_reference, description, data, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapCityMap);
  },

  async listarAutenticado(accessToken?: string) {
    await ensureAuthenticatedAccess(accessToken);
    const admin = getAdminClient();

    const { data, error } = await admin
      .from("city_maps")
      .select("id, name, map_reference, description, data, created_at, updated_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapCityMap);
  },

  async salvar(dto: SalvarCityMapDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const dataPayload = {
      imageUrl: normalizeText(dto.imageUrl),
      pointsOfInterest: sanitizePoints(dto.pointsOfInterest),
      citySlug: normalizeText(dto.citySlug) || "hamlet",
      cityName: normalizeText(dto.cityName) || "Hamlet",
      cityDescription: normalizeText(dto.cityDescription),
      cityCulture: normalizeText(dto.cityCulture),
      mapType: normalizeText(dto.mapType) === "localized" ? "localized" : "city",
      parentCityMapId: normalizeText(dto.parentCityMapId),
    };

    const { data, error } = await admin
      .from("city_maps")
      .insert({
        name: dto.name.trim(),
        map_reference: dto.mapReference.trim(),
        description: dto.description?.trim() ?? "",
        data: dataPayload,
      })
      .select("id, name, map_reference, description, data, created_at, updated_at")
      .single();

    if (error) throw error;
    return mapCityMap(data);
  },

  async deletar(cityMapId: string, accessToken?: string) {
    const masterUser = await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: map, error: fetchError } = await admin
      .from("city_maps")
      .select("id, data")
      .eq("id", cityMapId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !map) throw new Error("Mapa não encontrado");

    const { error } = await admin
      .from("city_maps")
      .update({ deleted_at: new Date().toISOString(), deleted_by: masterUser.id })
      .eq("id", cityMapId)
      .is("deleted_at", null);

    if (error) throw error;

    const mapData = map.data && typeof map.data === "object" ? map.data : {};
    const imageUrl = typeof (mapData as any).imageUrl === "string" ? (mapData as any).imageUrl : "";
    if (imageUrl) {
      try {
        const path = imageUrl.replace(/^\/+/, "");
        if (path) await admin.storage.from(MAPS_BUCKET).remove([path]);
      } catch {
        // falha no storage não bloqueia o delete
      }
    }

    return { success: true };
  },

  async editar(cityMapId: string, dto: EditarCityMapDto, accessToken?: string) {
    await ensureMasterAccess(accessToken);
    const admin = getAdminClient();

    const { data: current, error: currentError } = await admin
      .from("city_maps")
      .select("id, name, map_reference, description, data")
      .eq("id", cityMapId)
      .single();

    if (currentError || !current) throw new Error("Mapa não encontrado");

    const currentData = current.data && typeof current.data === "object" ? current.data : {};
    const nextData = {
      ...currentData,
      ...(dto.imageUrl !== undefined ? { imageUrl: normalizeText(dto.imageUrl) } : {}),
      ...(dto.pointsOfInterest !== undefined
        ? { pointsOfInterest: sanitizePoints(dto.pointsOfInterest) }
        : {}),
      ...(dto.citySlug !== undefined ? { citySlug: normalizeText(dto.citySlug) || "hamlet" } : {}),
      ...(dto.cityName !== undefined ? { cityName: normalizeText(dto.cityName) || "Hamlet" } : {}),
      ...(dto.cityDescription !== undefined
        ? { cityDescription: normalizeText(dto.cityDescription) }
        : {}),
      ...(dto.cityCulture !== undefined ? { cityCulture: normalizeText(dto.cityCulture) } : {}),
      ...(dto.mapType !== undefined
        ? { mapType: normalizeText(dto.mapType) === "localized" ? "localized" : "city" }
        : {}),
      ...(dto.parentCityMapId !== undefined
        ? { parentCityMapId: normalizeText(dto.parentCityMapId) }
        : {}),
    };

    const updates: Record<string, unknown> = {
      data: nextData,
      ...(dto.name !== undefined ? { name: normalizeText(dto.name) } : {}),
      ...(dto.mapReference !== undefined ? { map_reference: normalizeText(dto.mapReference) } : {}),
      ...(dto.description !== undefined ? { description: normalizeText(dto.description) } : {}),
    };

    const { data, error } = await admin
      .from("city_maps")
      .update(updates)
      .eq("id", cityMapId)
      .select("id, name, map_reference, description, data, created_at, updated_at")
      .single();

    if (error) throw error;
    return mapCityMap(data);
  },
};

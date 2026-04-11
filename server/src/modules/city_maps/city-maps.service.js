import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
function normalizeText(value) {
    return typeof value === "string" ? value.trim() : "";
}
function sanitizePoints(points) {
    if (!Array.isArray(points))
        return [];
    return points
        .map((item, index) => ({
        id: normalizeText(item?.id) || `poi-${index + 1}`,
        name: normalizeText(item?.name),
        x: Number(item?.x),
        y: Number(item?.y),
        description: normalizeText(item?.description),
    }))
        .filter((item) => item.name && Number.isFinite(item.x) && Number.isFinite(item.y))
        .map((item) => ({
        ...item,
        x: Math.min(100, Math.max(0, item.x)),
        y: Math.min(100, Math.max(0, item.y)),
    }));
}
function mapCityMap(row) {
    const data = row?.data && typeof row.data === "object" ? row.data : {};
    return {
        id: String(row?.id ?? ""),
        name: normalizeText(row?.name),
        mapReference: normalizeText(row?.map_reference),
        description: normalizeText(row?.description),
        imageUrl: normalizeText(data?.imageUrl),
        pointsOfInterest: sanitizePoints(data?.pointsOfInterest),
        createdAt: row?.created_at,
        updatedAt: row?.updated_at,
    };
}
export const cityMapsService = {
    async listar(accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data, error } = await admin
            .from("city_maps")
            .select("id, name, map_reference, description, data, created_at, updated_at")
            .order("created_at", { ascending: false });
        if (error)
            throw error;
        return (data ?? []).map(mapCityMap);
    },
    async salvar(dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const dataPayload = {
            imageUrl: normalizeText(dto.imageUrl),
            pointsOfInterest: sanitizePoints(dto.pointsOfInterest),
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
        if (error)
            throw error;
        return mapCityMap(data);
    },
    async editar(cityMapId, dto, accessToken) {
        await ensureMasterAccess(accessToken);
        const admin = getAdminClient();
        const { data: current, error: currentError } = await admin
            .from("city_maps")
            .select("id, name, map_reference, description, data")
            .eq("id", cityMapId)
            .single();
        if (currentError || !current)
            throw new Error("Mapa não encontrado");
        const currentData = current.data && typeof current.data === "object" ? current.data : {};
        const nextData = {
            ...currentData,
            ...(dto.imageUrl !== undefined ? { imageUrl: normalizeText(dto.imageUrl) } : {}),
            ...(dto.pointsOfInterest !== undefined
                ? { pointsOfInterest: sanitizePoints(dto.pointsOfInterest) }
                : {}),
        };
        const updates = {
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
        if (error)
            throw error;
        return mapCityMap(data);
    },
};
//# sourceMappingURL=city-maps.service.js.map
import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";
import {
  PERSONAGEM_SELECT_FIELDS,
  PERSONAGEM_TABLE,
  mapPersonagem,
} from "../../models/personagem.model.js";
import type { AdicionarTituloPersonagemDto, SalvarTituloDto } from "./titulos.dto.js";

function normalizeData(data: Record<string, any> | null | undefined) {
  if (!data || typeof data !== "object") return {} as Record<string, any>;
  return { ...data };
}

export const titulosService = {
  async salvar(dto: SalvarTituloDto, accessToken?: string) {
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

  async adicionarEmPersonagem(
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
};

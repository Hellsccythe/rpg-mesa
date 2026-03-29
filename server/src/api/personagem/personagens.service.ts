// server/src/api/personagem/personagens.service.ts
import { supabase } from "../../lib/supabase/client.js";

export interface FiltroPersonagens {
  nome?: string;
  minLevel?: number;
  maxLevel?: number;
  campaignId?: string | null;
}

export const personagensService = {
  async listarMeusPersonagens(filtro: FiltroPersonagens = {}) {
    console.group("🔍 [PersonagensService] Listando meus personagens");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("❌ Usuário não autenticado");
      console.groupEnd();
      throw new Error("Usuário não autenticado");
    }

    let query = `
      SELECT  id AS "characterId"
            , user_id AS "userId"
            , campaign_id AS "campaignId"
            , name AS "characterNome"
            , level AS "charLvl"
            , data AS "charData"
            , created_at AS "createdAt"
            , updated_at AS "updatedAt"
        FROM characters
       WHERE user_id = :userId
        AND deleted_at IS NULL
    `;

    const replacements: any = {
      userId: user.id,
    };

    // Filtro por nome (com ILIKE e %)
    if (filtro.nome?.trim()) {
      query += ` AND name ILIKE :nome`;
      replacements.nome = `%${filtro.nome.trim()}%`;
    }

    // Filtro por nível mínimo
    if (filtro.minLevel !== undefined && filtro.minLevel !== null) {
      query += ` AND level >= :minLevel`;
      replacements.minLevel = filtro.minLevel;
    }

    // Filtro por nível máximo
    if (filtro.maxLevel !== undefined && filtro.maxLevel !== null) {
      query += ` AND level <= :maxLevel`;
      replacements.maxLevel = filtro.maxLevel;
    }

    // Filtro por campanha
    if (filtro.campaignId !== undefined) {
      if (filtro.campaignId === null) {
        query += ` AND campaign_id IS NULL`;
      } else {
        query += ` AND campaign_id = :campaignId`;
        replacements.campaignId = filtro.campaignId;
      }
    }

    query += ` ORDER BY created_at DESC`;

    console.log("📝 Query gerada:", query);
    console.log("🔄 Parâmetros:", replacements);

    const { data, error } = await supabase.rpc("exec_sql", {
      query_text: query,
      params: replacements, // usando named parameters
    });

    if (error) {
      console.error("❌ Erro ao listar personagens:", error);
      console.groupEnd();
      throw error;
    }

    console.log(`✅ ${data?.length || 0} personagem(s) carregado(s)`);
    console.groupEnd();
    return data || [];
  },

  async salvarPersonagem(payload: any) {
    console.group("💾 [PersonagensService] Salvando novo personagem");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    const { data, error } = await supabase
      .from("characters")
      .insert({
        user_id: user.id,
        name: payload.name,
        level: payload.level || 1,
        data: payload.data || {},
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Erro ao salvar personagem:", error);
      console.groupEnd();
      throw error;
    }

    console.log("✅ Personagem salvo com sucesso!", data);
    console.groupEnd();
    return data;
  },
};

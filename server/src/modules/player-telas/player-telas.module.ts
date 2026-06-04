import { Router } from "express";
import { playerTelasService, TELAS_DISPONIVEIS } from "./player-telas.service.js";
import { getSupabaseClient } from "../../config/database/supabase/client.js";
import { getMasterEmails } from "../../common/helpers/master-access.helper.js";

export const PlayerTelasRouter = Router();

function token(req: any) {
  return req.headers.authorization?.split(" ")[1];
}

PlayerTelasRouter.get("/disponiveis", (_req, res) => {
  res.json(TELAS_DISPONIVEIS);
});

PlayerTelasRouter.get("/me", async (req, res) => {
  try {
    const accessToken = token(req);
    const supabase = getSupabaseClient(accessToken);
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    const characterId = Number(req.query.characterId);
    if (!Number.isInteger(characterId) || characterId < 1) {
      res.status(400).json({ error: "characterId inválido." });
      return;
    }

    const masterEmails = getMasterEmails();
    const isMaster = masterEmails.includes(user.email?.toLowerCase() ?? "");
    if (isMaster) {
      res.json([...TELAS_DISPONIVEIS]);
      return;
    }

    res.json(await playerTelasService.listarTelasPlayer(characterId));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

PlayerTelasRouter.get("/admin/:characterId", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    if (!Number.isInteger(characterId) || characterId < 1) {
      res.status(400).json({ error: "characterId inválido." });
      return;
    }
    res.json(await playerTelasService.listarTelasPlayerAdmin(characterId, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

PlayerTelasRouter.put("/admin/:characterId", async (req, res) => {
  try {
    const characterId = Number(req.params.characterId);
    if (!Number.isInteger(characterId) || characterId < 1) {
      res.status(400).json({ error: "characterId inválido." });
      return;
    }
    const { telas } = req.body as { telas: string[] };
    if (!Array.isArray(telas)) {
      res.status(400).json({ error: "Campo 'telas' deve ser um array." });
      return;
    }
    res.json(await playerTelasService.definirTelas(characterId, telas as any[], token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

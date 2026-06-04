import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { getAdminClient } from "../../config/database/supabase/client.js";
import { npcsService } from "./npcs.service.js";

const upload = multer({ storage: multer.memoryStorage() });
const IMAGES_BUCKET = process.env.GAME_IMAGES_BUCKET ?? "game-images";

export const NpcsRouter = Router();

function token(req: any) {
  return req.headers.authorization?.split(" ")[1];
}

NpcsRouter.post("/admin/upload-image", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: "Arquivo ausente." }); return; }
    if (!file.mimetype.startsWith("image/")) { res.status(400).json({ error: "Envie uma imagem." }); return; }
    if (file.size > 8 * 1024 * 1024) { res.status(400).json({ error: "Imagem excede 8 MB." }); return; }

    const compressed = await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `npcs/${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}.jpg`;

    const { error } = await getAdminClient().storage
      .from(IMAGES_BUCKET)
      .upload(objectPath, compressed, { contentType: "image/jpeg", upsert: true });

    if (error) throw error;
    const { data } = getAdminClient().storage.from(IMAGES_BUCKET).getPublicUrl(objectPath);
    res.json({ publicUrl: data.publicUrl });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Erro ao fazer upload da imagem." });
  }
});

NpcsRouter.get("/admin", async (req, res) => {
  try {
    res.json(await npcsService.listarAdmin(token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.get("/player", async (req, res) => {
  try {
    const characterId = Number(req.query.characterId);
    if (!Number.isInteger(characterId) || characterId < 1) {
      res.status(400).json({ error: "characterId inválido." });
      return;
    }
    res.json(await npcsService.listarPlayer(characterId, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("autenticado") ? 401 : 500;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.post("/admin", async (req, res) => {
  try {
    const { nome, raca_id, descricao, foto_url } = req.body;
    if (!nome || typeof nome !== "string" || !nome.trim()) {
      res.status(400).json({ error: "Campo 'nome' é obrigatório." });
      return;
    }
    res.status(201).json(await npcsService.criar({ nome, raca_id, descricao, foto_url }, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.patch("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    res.json(await npcsService.editar(id, req.body, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.delete("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    await npcsService.deletar(id, token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.get("/admin/:id/acessos", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    res.json(await npcsService.listarAcessosNpc(id, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.post("/admin/:id/acessos/:characterId", async (req, res) => {
  try {
    const npcId = Number(req.params.id);
    const characterId = Number(req.params.characterId);
    if (!Number.isInteger(npcId) || !Number.isInteger(characterId)) {
      res.status(400).json({ error: "IDs inválidos." });
      return;
    }
    await npcsService.concederAcesso(npcId, characterId, token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

NpcsRouter.delete("/admin/:id/acessos/:characterId", async (req, res) => {
  try {
    const npcId = Number(req.params.id);
    const characterId = Number(req.params.characterId);
    if (!Number.isInteger(npcId) || !Number.isInteger(characterId)) {
      res.status(400).json({ error: "IDs inválidos." });
      return;
    }
    await npcsService.revogarAcesso(npcId, characterId, token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

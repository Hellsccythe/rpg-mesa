import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { getAdminClient } from "../../config/database/supabase/client.js";
import { passadosService } from "./passados.service.js";

const upload = multer({ storage: multer.memoryStorage() });
const IMAGES_BUCKET = process.env.GAME_IMAGES_BUCKET ?? "game-images";

export const PassadosRouter = Router();

function token(req: any) {
  return req.headers.authorization?.split(" ")[1];
}

PassadosRouter.post("/admin/upload-image", upload.single("file"), async (req, res) => {
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
    const objectPath = `passados/${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}.jpg`;

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

PassadosRouter.get("/", async (_req, res) => {
  try {
    res.json(await passadosService.listar());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

PassadosRouter.post("/admin", async (req, res) => {
  try {
    const { nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus } = req.body;
    if (!nome || typeof nome !== "string" || !nome.trim()) {
      res.status(400).json({ error: "Campo 'nome' é obrigatório." });
      return;
    }
    res.status(201).json(await passadosService.criar({ nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus }, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

PassadosRouter.patch("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const { nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus } = req.body;
    res.json(await passadosService.editar(id, { nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus }, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

PassadosRouter.delete("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    await passadosService.deletar(id, token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

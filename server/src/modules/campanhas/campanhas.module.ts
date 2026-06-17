import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { getAdminClient } from "../../config/database/supabase/client.js";
import { campanhasService } from "./campanhas.service.js";

const upload = multer({ storage: multer.memoryStorage() });
const IMAGES_BUCKET = process.env.GAME_IMAGES_BUCKET ?? "game-images";

export const CampanhasRouter = Router();

function token(req: any) {
  return req.headers.authorization?.split(" ")[1];
}

// ── Públicos ──────────────────────────────────────────────────────────────────

CampanhasRouter.get("/", async (_req, res) => {
  try {
    res.json(await campanhasService.listar());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

CampanhasRouter.get("/:slug", async (req, res) => {
  try {
    res.json(await campanhasService.buscarPorSlug(req.params.slug));
  } catch (err: any) {
    const status = err.message?.includes("não encontrada") ? 404 : 500;
    res.status(status).json({ error: err.message });
  }
});

// ── Admin — CRUD ───────────────────────────────────────────────────────────────

CampanhasRouter.get("/admin/listar", async (req, res) => {
  try {
    res.json(await campanhasService.listarAdmin(token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

CampanhasRouter.post("/admin", async (req, res) => {
  try {
    const { slug, name, description, cover_image_url, is_active } = req.body;
    res.status(201).json(
      await campanhasService.criar({ slug, name, description, cover_image_url, is_active }, token(req)),
    );
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("Já existe") ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

CampanhasRouter.patch("/admin/:id", async (req, res) => {
  try {
    const { name, description, cover_image_url, is_active, slug } = req.body;
    res.json(
      await campanhasService.editar(req.params.id, { name, description, cover_image_url, is_active, slug }, token(req)),
    );
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrada") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

CampanhasRouter.delete("/admin/:id", async (req, res) => {
  try {
    await campanhasService.deletar(req.params.id, token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

// ── Admin — Upload de capa ─────────────────────────────────────────────────────

CampanhasRouter.post("/admin/upload-capa", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ error: "Arquivo ausente." }); return; }
    if (!file.mimetype.startsWith("image/")) { res.status(400).json({ error: "Envie uma imagem." }); return; }
    if (file.size > 8 * 1024 * 1024) { res.status(400).json({ error: "Imagem excede 8 MB." }); return; }

    const compressed = await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 1920, height: 1080, fit: "cover", withoutEnlargement: true })
      .jpeg({ quality: 88 })
      .toBuffer();

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `campanhas/${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}.jpg`;

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

// ── Admin — GMs ────────────────────────────────────────────────────────────────

CampanhasRouter.get("/admin/:id/gms", async (req, res) => {
  try {
    res.json(await campanhasService.listarGms(req.params.id, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ error: err.message });
  }
});

CampanhasRouter.post("/admin/:id/gms", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) { res.status(400).json({ error: "Email é obrigatório." }); return; }
    res.status(201).json(await campanhasService.adicionarGm(req.params.id, email, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("já está") ? 409 : 400;
    res.status(status).json({ error: err.message });
  }
});

CampanhasRouter.delete("/admin/:id/gms/:gmId", async (req, res) => {
  try {
    await campanhasService.removerGm(req.params.id, Number(req.params.gmId), token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

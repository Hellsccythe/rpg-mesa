import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { getAdminClient } from "../../config/database/supabase/client.js";
import { characterCreationService } from "./character-creation.service.js";

const upload = multer({ storage: multer.memoryStorage() });
const AVATAR_BUCKET = process.env.AVATAR_BUCKET ?? "character-avatars";
const HISTORY_BUCKET = process.env.HISTORY_BUCKET ?? "character-history";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

function masterStatus(err: any): number {
  const msg = String(err?.message ?? "");
  return msg.includes("autenticado") || msg.includes("restrito") ? 401 : 400;
}

export const CharacterCreationRouter = Router();

// POST /api/character-creation-requests/upload-avatar — upload público para solicitação pendente
CharacterCreationRouter.post("/upload-avatar", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ message: "Arquivo ausente" }); return; }
    if (!file.mimetype.startsWith("image/")) { res.status(400).json({ message: "Envie uma imagem" }); return; }
    if (file.size > 5 * 1024 * 1024) { res.status(400).json({ message: "Imagem excede 5MB" }); return; }

    const compressed = await sharp(file.buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer();

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `pending/${Date.now()}-${safeName.replace(/\.[^.]+$/, "")}.jpg`;

    const { error } = await getAdminClient().storage
      .from(AVATAR_BUCKET)
      .upload(objectPath, compressed, { contentType: "image/jpeg", upsert: true });

    if (error) throw error;
    const { data } = getAdminClient().storage.from(AVATAR_BUCKET).getPublicUrl(objectPath);
    res.json({ path: objectPath, publicUrl: data.publicUrl });
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao fazer upload do avatar" });
  }
});

// POST /api/character-creation-requests/upload-historia — upload de documento público
CharacterCreationRouter.post("/upload-historia", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) { res.status(400).json({ message: "Arquivo ausente" }); return; }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `pending/${Date.now()}-${safeName}`;

    const { error } = await getAdminClient().storage
      .from(HISTORY_BUCKET)
      .upload(objectPath, file.buffer, { contentType: file.mimetype, upsert: true });

    if (error) throw error;
    const { data } = getAdminClient().storage.from(HISTORY_BUCKET).getPublicUrl(objectPath);
    res.json({ path: objectPath, publicUrl: data.publicUrl });
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao fazer upload do documento" });
  }
});

// POST /api/character-creation-requests — submissão pública (sem auth)
CharacterCreationRouter.post("/", async (req, res) => {
  try {
    res.status(201).json(await characterCreationService.submeter(req.body));
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao submeter solicitação" });
  }
});

// GET /api/character-creation-requests/admin/pendentes/count — para sino de notificação (master)
CharacterCreationRouter.get("/admin/pendentes/count", async (req, res) => {
  try {
    // Exige autenticação mas não verifica master — o frontend valida isMaster
    const count = await characterCreationService.contarPendentes();
    res.json({ count });
  } catch {
    res.json({ count: 0 });
  }
});

// GET /api/character-creation-requests/admin — listar para o mestre
CharacterCreationRouter.get("/admin", async (req, res) => {
  try {
    res.json(
      await characterCreationService.listar(getBearerToken(req.headers.authorization)),
    );
  } catch (err: any) {
    res
      .status(masterStatus(err))
      .json({ message: err?.message ?? "Erro ao listar solicitações" });
  }
});

// PATCH /api/character-creation-requests/admin/:id/aprovar
CharacterCreationRouter.patch("/admin/:id/aprovar", async (req, res) => {
  try {
    res.json(
      await characterCreationService.aprovar(
        Number(req.params.id),
        getBearerToken(req.headers.authorization),
      ),
    );
  } catch (err: any) {
    res
      .status(masterStatus(err))
      .json({ message: err?.message ?? "Erro ao aprovar solicitação" });
  }
});

// PATCH /api/character-creation-requests/admin/:id/rejeitar
CharacterCreationRouter.patch("/admin/:id/rejeitar", async (req, res) => {
  try {
    res.json(
      await characterCreationService.rejeitar(
        Number(req.params.id),
        req.body?.motivo ?? "",
        getBearerToken(req.headers.authorization),
      ),
    );
  } catch (err: any) {
    res
      .status(masterStatus(err))
      .json({ message: err?.message ?? "Erro ao rejeitar solicitação" });
  }
});

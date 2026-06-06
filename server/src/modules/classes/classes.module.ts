import { Router } from "express";
import { classesController } from "./classes.controller.js";
import { classesService } from "./classes.service.js";

export * from "./classes.dto.js";
export * from "./classes.service.js";
export * from "./classes.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const ClassesRouter = Router();

ClassesRouter.get("/", async (_req, res) => {
  try {
    const resultado = await classesService.listar();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao listar classes" });
  }
});

// ── Progressão de XP por classe ──────────────────────────────────────────────
ClassesRouter.get("/progressao", async (req, res) => {
  try {
    const classeId = req.query.classe_id ? parseInt(req.query.classe_id as string, 10) : undefined;
    res.status(200).json(await classesService.listarProgressaoClasse(classeId));
  } catch (e: any) {
    res.status(500).json({ message: e?.message ?? "Erro ao listar progressão" });
  }
});

ClassesRouter.post("/progressao/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    res.status(201).json(await classesService.criarProgressaoClasse(req.body, token));
  } catch (e: any) {
    const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
    res.status(s).json({ message: e?.message ?? "Erro ao criar progressão" });
  }
});

ClassesRouter.patch("/progressao/admin/:id", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ message: "id inválido" }); return; }
    res.status(200).json(await classesService.editarProgressaoClasse(id, req.body, token));
  } catch (e: any) {
    const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
    res.status(s).json({ message: e?.message ?? "Erro ao editar progressão" });
  }
});

ClassesRouter.delete("/progressao/admin/:id", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ message: "id inválido" }); return; }
    res.status(200).json(await classesService.deletarProgressaoClasse(id, token));
  } catch (e: any) {
    const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
    res.status(s).json({ message: e?.message ?? "Erro ao deletar progressão" });
  }
});

ClassesRouter.post("/progressao/admin/bulk", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { entradas } = req.body as { entradas: any[] };
    res.status(201).json(await classesService.criarProgressaoClasseBulk(entradas, token));
  } catch (e: any) {
    const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
    res.status(s).json({ message: e?.message ?? "Erro ao criar progressão em lote" });
  }
});

ClassesRouter.get("/level-progression", async (_req, res) => {
  try {
    const resultado = await classesService.listarProgressaoLevel();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao listar progressao" });
  }
});

ClassesRouter.get("/admin", async (req, res) => {
  try {
    const resultado = await classesService.listarAdmin();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao listar classes" });
  }
});

ClassesRouter.get("/para-player", async (req, res) => {
  try {
    const characterId = Number(req.query.characterId);
    if (!Number.isInteger(characterId) || characterId < 1) {
      res.status(400).json({ message: "characterId inválido." });
      return;
    }
    res.status(200).json(await classesService.listarParaPlayer(characterId));
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao listar classes" });
  }
});

ClassesRouter.get("/secretas/admin", async (req, res) => {
  try {
    res.status(200).json(await classesService.listarClassesSecretasAdmin(getBearerToken(req.headers.authorization)));
  } catch (error: any) {
    const status = error?.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ message: error?.message ?? "Erro" });
  }
});

ClassesRouter.post("/secretas/admin/revelar", async (req, res) => {
  try {
    const { classeId, characterId } = req.body as { classeId: number; characterId: number };
    if (!classeId || !characterId) { res.status(400).json({ message: "classeId e characterId são obrigatórios." }); return; }
    res.status(200).json(await classesService.revelarClasseSecreta(classeId, characterId, getBearerToken(req.headers.authorization)));
  } catch (error: any) {
    const status = error?.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao revelar classe" });
  }
});

ClassesRouter.delete("/secretas/admin/revogar/:classeId", async (req, res) => {
  try {
    const classeId = Number(req.params.classeId);
    if (!Number.isInteger(classeId)) { res.status(400).json({ message: "classeId inválido." }); return; }
    res.status(200).json(await classesService.revogarClasseSecreta(classeId, getBearerToken(req.headers.authorization)));
  } catch (error: any) {
    const status = error?.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao revogar" });
  }
});

ClassesRouter.post("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await classesController.salvar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao salvar classe" });
  }
});

ClassesRouter.patch("/admin/:id", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await classesService.editar(req.params.id, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar classe" });
  }
});

ClassesRouter.delete("/admin/:id", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await classesService.deletar(req.params.id, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar classe" });
  }
});

export { classesController as ClassesController };

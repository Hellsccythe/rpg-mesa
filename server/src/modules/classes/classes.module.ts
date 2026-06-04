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

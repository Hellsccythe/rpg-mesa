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

export { classesController as ClassesController };

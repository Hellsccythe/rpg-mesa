import { Router } from "express";
import { racaService } from "./raca.service.js";

export * from "./raca.dto.js";
export * from "./raca.service.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const RacasRouter = Router();

RacasRouter.get("/", async (_req, res) => {
  try {
    const resultado = await racaService.listarPublico();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Erro ao listar raças" });
  }
});

RacasRouter.get("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await racaService.listar(token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao listar raças" });
  }
});

RacasRouter.post("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await racaService.criar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao criar raça" });
  }
});

RacasRouter.patch("/admin/:racaId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await racaService.editar(req.params.racaId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar raça" });
  }
});

RacasRouter.delete("/admin/:racaId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await racaService.deletar(req.params.racaId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar raça" });
  }
});

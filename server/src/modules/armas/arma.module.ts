import { Router } from "express";
import { armaService } from "./arma.service.js";

export * from "./arma.dto.js";
export * from "./arma.service.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const ArmasRouter = Router();

ArmasRouter.get("/", async (_req, res) => {
  try {
    const resultado = await armaService.listarPublico();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error?.message ?? "Erro ao listar armas" });
  }
});

ArmasRouter.get("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await armaService.listar(token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao listar armas" });
  }
});

ArmasRouter.post("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await armaService.criar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao criar arma" });
  }
});

ArmasRouter.patch("/admin/:armaId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await armaService.editar(req.params.armaId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar arma" });
  }
});

ArmasRouter.delete("/admin/:armaId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await armaService.deletar(req.params.armaId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar arma" });
  }
});

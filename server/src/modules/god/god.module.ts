import { Router } from "express";
import { godController } from "./god.controller.js";

export * from "./god.dto.js";
export * from "./god.service.js";
export * from "./god.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const GodRouter = Router();

GodRouter.post("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await godController.salvar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao salvar deus" });
  }
});

export { godController as GodController };

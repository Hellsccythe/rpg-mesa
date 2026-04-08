import { Router } from "express";
import { cityMapsController } from "./city-maps.controller.js";

export * from "./city-maps.dto.js";
export * from "./city-maps.service.js";
export * from "./city-maps.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const CityMapsRouter = Router();

CityMapsRouter.post("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await cityMapsController.salvar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao salvar cidade" });
  }
});

export { cityMapsController as CityMapsController };

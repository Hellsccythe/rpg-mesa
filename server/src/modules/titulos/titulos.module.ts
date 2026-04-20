import { Router } from "express";
import { titulosController } from "./titulos.controller.js";
import { titulosService } from "./titulos.service.js";

export * from "./titulos.dto.js";
export * from "./titulos.service.js";
export * from "./titulos.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const TitulosRouter = Router();

TitulosRouter.get("/catalogo", async (req, res) => {
  try {
    const resultado = await titulosService.listarCatalogo();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao listar catálogo de títulos" });
  }
});

TitulosRouter.post("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await titulosController.salvar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao salvar título" });
  }
});

TitulosRouter.post("/admin/personagens/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await titulosController.adicionarEmPersonagem(
      req.params.characterId,
      req.body,
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao adicionar título" });
  }
});

export { titulosController as TitulosController };

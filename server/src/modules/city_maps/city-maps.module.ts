import { Router } from "express";
import multer from "multer";
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
const upload = multer({ storage: multer.memoryStorage() });

CityMapsRouter.get("/", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await cityMapsController.listarAutenticado(token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao listar mapas" });
  }
});

CityMapsRouter.get("/admin", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await cityMapsController.listar(token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao listar mapas" });
  }
});

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

CityMapsRouter.post("/admin/upload-image", upload.single("file"), async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    if (!req.file) throw new Error("Arquivo nao enviado");

    const resultado = await cityMapsController.uploadImagem(
      {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      token,
    );
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao enviar imagem do mapa" });
  }
});

CityMapsRouter.patch("/admin/:cityMapId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await cityMapsController.editar(req.params.cityMapId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar mapa" });
  }
});

export { cityMapsController as CityMapsController };

import { Router } from "express";
import { titulosController } from "./titulos.controller.js";
export * from "./titulos.dto.js";
export * from "./titulos.service.js";
export * from "./titulos.controller.js";
function getBearerToken(authorization) {
    if (!authorization)
        return undefined;
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() !== "bearer")
        return undefined;
    return token;
}
export const TitulosRouter = Router();
TitulosRouter.post("/admin", async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        const resultado = await titulosController.salvar(req.body, token);
        res.status(201).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao salvar título" });
    }
});
TitulosRouter.post("/admin/personagens/:characterId", async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        const resultado = await titulosController.adicionarEmPersonagem(req.params.characterId, req.body, token);
        res.status(200).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao adicionar título" });
    }
});
export { titulosController as TitulosController };
//# sourceMappingURL=titulos.module.js.map
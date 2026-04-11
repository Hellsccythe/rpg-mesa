import { Router } from "express";
import multer from "multer";
import { godController } from "./god.controller.js";
export * from "./god.dto.js";
export * from "./god.service.js";
export * from "./god.controller.js";
function getBearerToken(authorization) {
    if (!authorization)
        return undefined;
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() !== "bearer")
        return undefined;
    return token;
}
export const GodRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });
GodRouter.get("/", async (_req, res) => {
    try {
        const resultado = await godController.listarPublico();
        res.status(200).json(resultado);
    }
    catch (error) {
        res.status(400).json({ message: error?.message ?? "Erro ao listar deuses" });
    }
});
GodRouter.get("/admin", async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        const resultado = await godController.listar(token);
        res.status(200).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao listar deuses" });
    }
});
GodRouter.post("/admin", async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        const resultado = await godController.salvar(req.body, token);
        res.status(201).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao salvar deus" });
    }
});
GodRouter.post("/admin/upload-image", upload.single("file"), async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        if (!req.file)
            throw new Error("Arquivo nao enviado");
        const resultado = await godController.uploadImagem({
            buffer: req.file.buffer,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
        }, token);
        res.status(201).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao enviar imagem do deus" });
    }
});
GodRouter.patch("/admin/:godId", async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        const resultado = await godController.editar(req.params.godId, req.body, token);
        res.status(200).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao editar deus" });
    }
});
export { godController as GodController };
//# sourceMappingURL=god.module.js.map
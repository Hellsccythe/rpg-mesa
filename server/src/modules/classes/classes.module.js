import { Router } from "express";
import { classesController } from "./classes.controller.js";
export * from "./classes.dto.js";
export * from "./classes.service.js";
export * from "./classes.controller.js";
function getBearerToken(authorization) {
    if (!authorization)
        return undefined;
    const [scheme, token] = authorization.split(" ");
    if (scheme?.toLowerCase() !== "bearer")
        return undefined;
    return token;
}
export const ClassesRouter = Router();
ClassesRouter.post("/admin", async (req, res) => {
    try {
        const token = getBearerToken(req.headers.authorization);
        const resultado = await classesController.salvar(req.body, token);
        res.status(201).json(resultado);
    }
    catch (error) {
        const status = error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
        res.status(status).json({ message: error?.message ?? "Erro ao salvar classe" });
    }
});
export { classesController as ClassesController };
//# sourceMappingURL=classes.module.js.map
import { Router } from "express";
import { skillController } from "./skill.controller.js";

export * from "./skill.dto.js";
export * from "./skill.service.js";
export * from "./skill.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const SkillRouter = Router();

SkillRouter.post("/admin/personagens/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await skillController.adicionarEmPersonagem(
      req.params.characterId,
      req.body,
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao adicionar habilidade" });
  }
});

export { skillController as SkillController } from "./skill.controller.js";

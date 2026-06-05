import { Router } from "express";
import { skillController } from "./skill.controller.js";
import { skillService } from "./skill.service.js";

export * from "./skill.dto.js";
export * from "./skill.service.js";
export * from "./skill.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

function makeLookupRoutes(
  router: Router,
  path: string,
  listar: () => Promise<any[]>,
  criar: (desc: string, token?: string) => Promise<any>,
  editar: (item: number, desc: string, token?: string) => Promise<any>,
  deletar: (item: number, token?: string) => Promise<any>,
) {
  router.get(path, async (_req, res) => {
    try { res.status(200).json(await listar()); }
    catch (e: any) { res.status(500).json({ message: e?.message ?? "Erro ao listar" }); }
  });
  router.post(`${path}/admin`, async (req, res) => {
    try {
      const token = getBearerToken(req.headers.authorization);
      res.status(201).json(await criar(req.body.descricao, token));
    } catch (e: any) {
      const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
      res.status(s).json({ message: e?.message ?? "Erro ao criar" });
    }
  });
  router.patch(`${path}/admin/:item`, async (req, res) => {
    try {
      const token = getBearerToken(req.headers.authorization);
      const item = parseInt(req.params.item, 10);
      if (isNaN(item)) { res.status(400).json({ message: "item inválido" }); return; }
      res.status(200).json(await editar(item, req.body.descricao, token));
    } catch (e: any) {
      const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
      res.status(s).json({ message: e?.message ?? "Erro ao editar" });
    }
  });
  router.delete(`${path}/admin/:item`, async (req, res) => {
    try {
      const token = getBearerToken(req.headers.authorization);
      const item = parseInt(req.params.item, 10);
      if (isNaN(item)) { res.status(400).json({ message: "item inválido" }); return; }
      res.status(200).json(await deletar(item, token));
    } catch (e: any) {
      const s = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
      res.status(s).json({ message: e?.message ?? "Erro ao deletar" });
    }
  });
}

export const SkillRouter = Router();

// ── Catálogo de skills ──────────────────────────────────────────────────────
SkillRouter.get("/catalogo", async (req, res) => {
  try {
    const resultado = await skillService.listarCatalogo();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao listar catálogo de skills" });
  }
});

SkillRouter.post("/admin/catalogo", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await skillService.criarNoCatalogo(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao criar skill" });
  }
});

SkillRouter.patch("/admin/catalogo/:id", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await skillService.editarNoCatalogo(req.params.id, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar skill" });
  }
});

SkillRouter.get("/admin/catalogo/:id/referencias", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await skillService.listarReferencias(req.params.id, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao buscar referências" });
  }
});

SkillRouter.delete("/admin/catalogo/:id", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await skillService.deletarDoCatalogo(req.params.id, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar skill" });
  }
});

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

// ── Lookups de skill ────────────────────────────────────────────────────────
makeLookupRoutes(SkillRouter, "/tipos",
  skillService.listarTipos,
  skillService.criarTipo,
  skillService.editarTipo,
  skillService.deletarTipo,
);

makeLookupRoutes(SkillRouter, "/categorias",
  skillService.listarCategorias,
  skillService.criarCategoria,
  skillService.editarCategoria,
  skillService.deletarCategoria,
);

makeLookupRoutes(SkillRouter, "/tipos-dano",
  skillService.listarTiposDano,
  skillService.criarTipoDano,
  skillService.editarTipoDano,
  skillService.deletarTipoDano,
);

export { skillController as SkillController } from "./skill.controller.js";

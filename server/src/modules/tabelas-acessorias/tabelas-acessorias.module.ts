import { Router } from "express";
import { tabelasAcessoriasService as svc } from "./tabelas-acessorias.service.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

function makeRoutes(
  router: Router,
  path: string,
  listar: () => Promise<any[]>,
  criar: (body: any, token?: string) => Promise<any>,
  editar: (item: number, body: any, token?: string) => Promise<any>,
  deletar: (item: number, token?: string) => Promise<any>,
) {
  router.get(path, async (_req, res) => {
    try {
      res.status(200).json(await listar());
    } catch (e: any) {
      res.status(500).json({ message: e?.message ?? "Erro ao listar" });
    }
  });

  router.post(`${path}/admin`, async (req, res) => {
    try {
      const token = getBearerToken(req.headers.authorization);
      res.status(201).json(await criar(req.body, token));
    } catch (e: any) {
      const status = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
      res.status(status).json({ message: e?.message ?? "Erro ao criar" });
    }
  });

  router.patch(`${path}/admin/:item`, async (req, res) => {
    try {
      const token = getBearerToken(req.headers.authorization);
      const item = parseInt(req.params.item, 10);
      if (isNaN(item)) { res.status(400).json({ message: "item inválido" }); return; }
      res.status(200).json(await editar(item, req.body, token));
    } catch (e: any) {
      const status = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
      res.status(status).json({ message: e?.message ?? "Erro ao editar" });
    }
  });

  router.delete(`${path}/admin/:item`, async (req, res) => {
    try {
      const token = getBearerToken(req.headers.authorization);
      const item = parseInt(req.params.item, 10);
      if (isNaN(item)) { res.status(400).json({ message: "item inválido" }); return; }
      res.status(200).json(await deletar(item, token));
    } catch (e: any) {
      const status = e?.message?.includes("autenticado") || e?.message?.includes("restrito") ? 401 : 400;
      res.status(status).json({ message: e?.message ?? "Erro ao deletar" });
    }
  });
}

export const TabelasAcessoriasRouter = Router();

makeRoutes(TabelasAcessoriasRouter, "/tipos",
  svc.listarTipos,
  svc.criarTipo,
  svc.editarTipo,
  svc.deletarTipo,
);

makeRoutes(TabelasAcessoriasRouter, "/categorias-arma",
  svc.listarCategoriasArma,
  svc.criarCategoriaArma,
  svc.editarCategoriaArma,
  svc.deletarCategoriaArma,
);

makeRoutes(TabelasAcessoriasRouter, "/categorias-armadura",
  svc.listarCategoriasArmadura,
  svc.criarCategoriaArmadura,
  svc.editarCategoriaArmadura,
  svc.deletarCategoriaArmadura,
);

makeRoutes(TabelasAcessoriasRouter, "/categorias-variados",
  svc.listarCategoriasVariados,
  svc.criarCategoriaVariados,
  svc.editarCategoriaVariados,
  svc.deletarCategoriaVariados,
);

makeRoutes(TabelasAcessoriasRouter, "/propriedades-arma",
  svc.listarPropriedadesArma,
  svc.criarPropriedadeArma,
  svc.editarPropriedadeArma,
  svc.deletarPropriedadeArma,
);

makeRoutes(TabelasAcessoriasRouter, "/classes-arma",
  svc.listarClassesArma,
  svc.criarClasseArma,
  svc.editarClasseArma,
  svc.deletarClasseArma,
);

makeRoutes(TabelasAcessoriasRouter, "/propriedades-armadura",
  svc.listarPropriedadesArmadura,
  svc.criarPropriedadeArmadura,
  svc.editarPropriedadeArmadura,
  svc.deletarPropriedadeArmadura,
);

makeRoutes(TabelasAcessoriasRouter, "/classes-armadura",
  svc.listarClassesArmadura,
  svc.criarClasseArmadura,
  svc.editarClasseArmadura,
  svc.deletarClasseArmadura,
);

makeRoutes(TabelasAcessoriasRouter, "/propriedades-variados",
  svc.listarPropriedadesVariados,
  svc.criarPropriedadeVariados,
  svc.editarPropriedadeVariados,
  svc.deletarPropriedadeVariados,
);

makeRoutes(TabelasAcessoriasRouter, "/classes-variados",
  svc.listarClassesVariados,
  svc.criarClasseVariados,
  svc.editarClasseVariados,
  svc.deletarClasseVariados,
);

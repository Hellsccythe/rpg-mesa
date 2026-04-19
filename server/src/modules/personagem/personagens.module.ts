import { Router } from "express";
import { personagensController } from "./personagens.controller.js";

export * from "./personagens.dto.js";
export * from "./personagens.service.js";
export * from "./personagens.controller.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

export const PersonagensRouter = Router();

PersonagensRouter.get("/pagina", async (req, res) => {
  try {
    const resultado = await personagensController.paginaInicial();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao carregar página" });
  }
});

PersonagensRouter.get("/", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.listarMeus(req.query as any, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 500;
    res.status(status).json({ message: error?.message ?? "Erro ao listar personagens" });
  }
});

PersonagensRouter.get("/admin/solicitacoes", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.listarSolicitacoesPendentes(token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao listar solicitações" });
  }
});

PersonagensRouter.get("/admin/character-creation-emails", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.listarEmailsPermitidosCriacaoPersonagem(token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao listar emails permitidos" });
  }
});

PersonagensRouter.post("/admin/character-creation-emails", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.adicionarEmailPermitidoCriacaoPersonagem(
      req.body?.email,
      token,
    );
    res.status(201).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao adicionar email permitido" });
  }
});

PersonagensRouter.delete("/admin/character-creation-emails/:email", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const email = decodeURIComponent(req.params.email);
    const resultado = await personagensController.removerEmailPermitidoCriacaoPersonagem(
      email,
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao remover email permitido" });
  }
});

PersonagensRouter.post("/admin/solicitacoes/:characterId/revisar", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.revisarSolicitacao(
      req.params.characterId,
      req.body,
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao revisar solicitação" });
  }
});

PersonagensRouter.post("/admin/personagens/:characterId/notas", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.adicionarNotaAventura(
      req.params.characterId,
      req.body,
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao adicionar nota" });
  }
});

PersonagensRouter.get("/admin/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.obterComoMestre(req.params.characterId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 404;
    res.status(status).json({ message: error?.message ?? "Erro ao carregar personagem" });
  }
});

PersonagensRouter.get("/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.obterMeu(req.params.characterId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 404;
    res.status(status).json({ message: error?.message ?? "Erro ao carregar personagem" });
  }
});

PersonagensRouter.patch("/:characterId/solicitacao", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.solicitarAlteracao(
      req.params.characterId,
      req.body,
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao solicitar alteração" });
  }
});

PersonagensRouter.post("/registrar", async (req, res) => {
  try {
    const resultado = await personagensController.registrarECriar(req.body)
    res.status(201).json(resultado)
  } catch (error: any) {
    const msg = error?.message ?? ""
    const status = msg.includes("liberado") ? 403 : msg.includes("cadastrado") ? 409 : 400
    res.status(status).json({ message: msg || "Erro ao registrar personagem" })
  }
})

PersonagensRouter.post("/", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.salvar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado")
      ? 401
      : error?.message?.includes("autorizado") || error?.message?.includes("restrita")
        ? 403
        : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao salvar personagem" });
  }
});

PersonagensRouter.patch("/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.editar(req.params.characterId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar personagem" });
  }
});

PersonagensRouter.delete("/admin/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.deletarComoMestre(req.params.characterId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 404;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar personagem" });
  }
});

PersonagensRouter.delete("/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.deletar(req.params.characterId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 404;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar personagem" });
  }
});

export { personagensController as PersonagemController };

import { Router } from "express";
import { personagensController } from "./personagens.controller.js";

export const personagensRouter = Router();

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

// GET /api/personagens/pagina — traz usuário + personagens em uma única chamada
personagensRouter.get("/pagina", async (req, res) => {
  try {
    const resultado = await personagensController.paginaInicial();
    res.status(200).json(resultado);
  } catch (error: any) {
    res.status(500).json({ message: error?.message ?? "Erro ao carregar página" });
  }
});

// GET /api/personagens — lista de personagens (para tabelas com filtros/reload)
personagensRouter.get("/", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.listarMeus(req.query as any, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 500;
    res.status(status).json({ message: error?.message ?? "Erro ao listar personagens" });
  }
});

// GET /api/personagens/:characterId — detalhe de um personagem do usuário logado
personagensRouter.get("/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.obterMeu(req.params.characterId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 404;
    res.status(status).json({ message: error?.message ?? "Erro ao carregar personagem" });
  }
});

// POST /api/personagens — cria personagem
personagensRouter.post("/", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.salvar(req.body, token);
    res.status(201).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao salvar personagem" });
  }
});

// PATCH /api/personagens/:characterId — edita personagem
personagensRouter.patch("/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.editar(req.params.characterId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao editar personagem" });
  }
});

// DELETE /api/personagens/:characterId — soft delete do personagem do usuário logado
personagensRouter.delete("/:characterId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensController.deletar(req.params.characterId, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : 404;
    res.status(status).json({ message: error?.message ?? "Erro ao deletar personagem" });
  }
});

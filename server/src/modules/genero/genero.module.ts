import { Router } from "express";
import { generoService } from "./genero.service.js";

function getBearerToken(authorization?: string): string | undefined {
  if (!authorization) return undefined;
  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

function masterStatus(err: any): number {
  const msg = String(err?.message ?? "");
  return msg.includes("autenticado") || msg.includes("restrito") ? 401 : 400;
}

export const GeneroRouter = Router();

GeneroRouter.get("/", async (_req, res) => {
  try {
    res.json(await generoService.listar());
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar gêneros" });
  }
});

GeneroRouter.post("/admin", async (req, res) => {
  try {
    res.status(201).json(
      await generoService.criar(req.body, getBearerToken(req.headers.authorization)),
    );
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar gênero" });
  }
});

GeneroRouter.patch("/admin/:id", async (req, res) => {
  try {
    res.json(
      await generoService.editar(
        Number(req.params.id),
        req.body,
        getBearerToken(req.headers.authorization),
      ),
    );
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar gênero" });
  }
});

GeneroRouter.delete("/admin/:id", async (req, res) => {
  try {
    res.json(
      await generoService.deletar(
        Number(req.params.id),
        getBearerToken(req.headers.authorization),
      ),
    );
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar gênero" });
  }
});

import { Router } from "express";
import { indoleService } from "./indole.service.js";

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

export const IndoleRouter = Router();

IndoleRouter.get("/", async (_req, res) => {
  try {
    res.json(await indoleService.listar());
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar índoles" });
  }
});

IndoleRouter.post("/admin", async (req, res) => {
  try {
    res.status(201).json(
      await indoleService.criar(req.body, getBearerToken(req.headers.authorization)),
    );
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar índole" });
  }
});

IndoleRouter.patch("/admin/:id", async (req, res) => {
  try {
    res.json(
      await indoleService.editar(
        Number(req.params.id),
        req.body,
        getBearerToken(req.headers.authorization),
      ),
    );
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar índole" });
  }
});

IndoleRouter.delete("/admin/:id", async (req, res) => {
  try {
    res.json(
      await indoleService.deletar(
        Number(req.params.id),
        getBearerToken(req.headers.authorization),
      ),
    );
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar índole" });
  }
});

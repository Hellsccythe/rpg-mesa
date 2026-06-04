import { Router } from "express";
import { passadosService } from "./passados.service.js";

export const PassadosRouter = Router();

function token(req: any) {
  return req.headers.authorization?.split(" ")[1];
}

PassadosRouter.get("/", async (_req, res) => {
  try {
    res.json(await passadosService.listar());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

PassadosRouter.post("/admin", async (req, res) => {
  try {
    const { nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus } = req.body;
    if (!nome || typeof nome !== "string" || !nome.trim()) {
      res.status(400).json({ error: "Campo 'nome' é obrigatório." });
      return;
    }
    res.status(201).json(await passadosService.criar({ nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus }, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

PassadosRouter.patch("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const { nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus } = req.body;
    res.json(await passadosService.editar(id, { nome, descricao, foto_url, skill_ids, titulo_ids, atributo_bonus }, token(req)));
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

PassadosRouter.delete("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    await passadosService.deletar(id, token(req));
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

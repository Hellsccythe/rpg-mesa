import { Router } from "express";
import { usuariosService } from "./usuarios.service.js";

export const UsuariosRouter = Router();

UsuariosRouter.get("/admin", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const data = await usuariosService.listar(token);
    res.json(data);
  } catch (err: any) {
    res.status(err.message?.includes("Acesso") ? 403 : 500).json({ error: err.message });
  }
});

UsuariosRouter.patch("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    const data = await usuariosService.editar(id, req.body, token);
    res.json(data);
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

UsuariosRouter.patch("/admin/:id/resetar-senha-padrao", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    const data = await usuariosService.resetarSenhaPadrao(id, token);
    res.json(data);
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

UsuariosRouter.patch("/admin/:id/resetar-senha", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const { nova_senha } = req.body;
    if (!nova_senha || typeof nova_senha !== "string") {
      res.status(400).json({ error: "nova_senha é obrigatória." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    const data = await usuariosService.resetarSenha(id, nova_senha, token);
    res.json(data);
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

UsuariosRouter.patch("/admin/:id/ativo", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const { ativo } = req.body;
    if (typeof ativo !== "boolean") {
      res.status(400).json({ error: "Campo 'ativo' deve ser boolean." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    const data = await usuariosService.alterarAtivo(id, ativo, token);
    res.json(data);
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

UsuariosRouter.delete("/admin/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    const data = await usuariosService.deletar(id, token);
    res.json(data);
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

UsuariosRouter.post("/admin/pre-registrar", async (req, res) => {
  try {
    const { email, tipo } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "Campo 'email' é obrigatório." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    await usuariosService.preRegistrar(email, tipo ?? "player", token);
    res.status(201).json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 400;
    res.status(status).json({ error: err.message });
  }
});

UsuariosRouter.delete("/admin/:id/pre-registro", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      res.status(400).json({ error: "ID inválido." });
      return;
    }
    const token = req.headers.authorization?.split(" ")[1];
    await usuariosService.removerPreRegistro(id, token);
    res.json({ success: true });
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : err.message?.includes("não encontrado") ? 404 : 400;
    res.status(status).json({ error: err.message });
  }
});

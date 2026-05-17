import { Router } from "express";
import { armaService } from "./arma.service.js";

export * from "./arma.dto.js";
export * from "./arma.service.js";

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

export const ArmasRouter = Router();

// ── Lookup públicos ──────────────────────────────────────────────────────────

ArmasRouter.get("/categorias", async (_req, res) => {
  try {
    res.json(await armaService.listarCategorias());
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar categorias" });
  }
});

ArmasRouter.get("/classes", async (_req, res) => {
  try {
    res.json(await armaService.listarClasses());
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar classes" });
  }
});

ArmasRouter.get("/tipos", async (req, res) => {
  try {
    const categoriaItem = req.query.categoria ? Number(req.query.categoria) : undefined;
    res.json(await armaService.listarTipos(categoriaItem));
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar tipos" });
  }
});

ArmasRouter.get("/propriedades", async (req, res) => {
  try {
    const categoriaItem = req.query.categoria ? Number(req.query.categoria) : undefined;
    res.json(await armaService.listarPropriedades(categoriaItem));
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar propriedades" });
  }
});

// ── Equipamentos públicos / admin ────────────────────────────────────────────

ArmasRouter.get("/", async (_req, res) => {
  try {
    res.json(await armaService.listarPublico());
  } catch (err: any) {
    res.status(400).json({ message: err?.message ?? "Erro ao listar equipamentos" });
  }
});

ArmasRouter.get("/admin", async (req, res) => {
  try {
    res.json(await armaService.listar(getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao listar equipamentos" });
  }
});

ArmasRouter.post("/admin", async (req, res) => {
  try {
    res.status(201).json(await armaService.criar(req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar equipamento" });
  }
});

ArmasRouter.patch("/admin/:armaId", async (req, res) => {
  try {
    res.json(await armaService.editar(req.params.armaId, req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar equipamento" });
  }
});

ArmasRouter.delete("/admin/:armaId", async (req, res) => {
  try {
    res.json(await armaService.deletar(req.params.armaId, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar equipamento" });
  }
});

// ── Admin: Classes ───────────────────────────────────────────────────────────

ArmasRouter.post("/admin/classes", async (req, res) => {
  try {
    res.status(201).json(await armaService.criarClasse(req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar classe" });
  }
});

ArmasRouter.patch("/admin/classes/:item", async (req, res) => {
  try {
    res.json(await armaService.editarClasse(Number(req.params.item), req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar classe" });
  }
});

ArmasRouter.delete("/admin/classes/:item", async (req, res) => {
  try {
    res.json(await armaService.deletarClasse(Number(req.params.item), getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar classe" });
  }
});

// ── Admin: Tipos ─────────────────────────────────────────────────────────────

ArmasRouter.post("/admin/tipos", async (req, res) => {
  try {
    res.status(201).json(await armaService.criarTipo(req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar tipo" });
  }
});

ArmasRouter.patch("/admin/tipos/:item", async (req, res) => {
  try {
    res.json(await armaService.editarTipo(Number(req.params.item), req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar tipo" });
  }
});

ArmasRouter.delete("/admin/tipos/:item", async (req, res) => {
  try {
    res.json(await armaService.deletarTipo(Number(req.params.item), getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar tipo" });
  }
});

// ── Admin: Propriedades ──────────────────────────────────────────────────────

ArmasRouter.post("/admin/propriedades", async (req, res) => {
  try {
    res.status(201).json(await armaService.criarPropriedade(req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar propriedade" });
  }
});

ArmasRouter.patch("/admin/propriedades/:item", async (req, res) => {
  try {
    res.json(await armaService.editarPropriedade(Number(req.params.item), req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar propriedade" });
  }
});

ArmasRouter.delete("/admin/propriedades/:item", async (req, res) => {
  try {
    res.json(await armaService.deletarPropriedade(Number(req.params.item), getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar propriedade" });
  }
});

// ── Admin: Categorias ────────────────────────────────────────────────────────

ArmasRouter.post("/admin/categorias", async (req, res) => {
  try {
    res.status(201).json(await armaService.criarCategoria(req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao criar categoria" });
  }
});

ArmasRouter.patch("/admin/categorias/:item", async (req, res) => {
  try {
    res.json(await armaService.editarCategoria(Number(req.params.item), req.body, getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao editar categoria" });
  }
});

ArmasRouter.delete("/admin/categorias/:item", async (req, res) => {
  try {
    res.json(await armaService.deletarCategoria(Number(req.params.item), getBearerToken(req.headers.authorization)));
  } catch (err: any) {
    res.status(masterStatus(err)).json({ message: err?.message ?? "Erro ao deletar categoria" });
  }
});

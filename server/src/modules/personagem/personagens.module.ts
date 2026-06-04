import { Router } from "express";
import { personagensController } from "./personagens.controller.js";
import { personagensService } from "./personagens.service.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";

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

PersonagensRouter.get("/admin/verificar-mestre", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    await ensureMasterAccess(token);
    res.status(200).json({ isMaster: true });
  } catch {
    res.status(403).json({ isMaster: false });
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

PersonagensRouter.patch("/admin/:characterId/god-info/:godId", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { text } = req.body as { text?: string };
    const resultado = await personagensService.definirInfoAdicionalDeus(
      req.params.characterId,
      req.params.godId,
      text ?? '',
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao definir informação adicional do deus" });
  }
});

PersonagensRouter.patch("/admin/:characterId/modal-hero-position", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { position } = req.body as { position: string };
    const resultado = await personagensService.definirModalHeroPosition(
      req.params.characterId,
      position ?? '',
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao definir posição da imagem modal" });
  }
});

PersonagensRouter.patch("/admin/:characterId/avatar-focal-point", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { focalPoint } = req.body as { focalPoint: string };
    if (!focalPoint?.trim()) {
      res.status(400).json({ message: "focalPoint é obrigatório" });
      return;
    }
    const resultado = await personagensService.definirAvatarFocalPoint(
      req.params.characterId,
      focalPoint.trim(),
      token,
    );
    res.status(200).json(resultado);
  } catch (error: any) {
    const status =
      error?.message?.includes("autenticado") || error?.message?.includes("restrito") ? 401 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao definir focal point" });
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

PersonagensRouter.post("/:characterId/escolher-classe", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensService.escolherClasse(req.params.characterId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao escolher classe" });
  }
});

PersonagensRouter.post("/:characterId/escolher-skill-inicial", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensService.escolherSkillInicial(req.params.characterId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao escolher skill" });
  }
});

PersonagensRouter.patch("/:characterId/escolher-raca", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { raca_id } = req.body as { raca_id: number };
    if (!raca_id || typeof raca_id !== "number") {
      res.status(400).json({ message: "raca_id é obrigatório e deve ser um número." });
      return;
    }
    const resultado = await personagensService.escolherRaca(req.params.characterId, raca_id, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao escolher raça" });
  }
});

PersonagensRouter.patch("/:characterId/escolher-classe", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { classe_id } = req.body as { classe_id: number };
    if (!classe_id || typeof classe_id !== "number") {
      res.status(400).json({ message: "classe_id é obrigatório e deve ser um número." });
      return;
    }
    res.status(200).json(await personagensService.escolherClasseInicial(req.params.characterId, classe_id, token));
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao escolher classe" });
  }
});

PersonagensRouter.patch("/:characterId/definir-atributos", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { aura, forca, destreza, resistencia, inteligencia } = req.body;
    if ([aura, forca, destreza, resistencia, inteligencia].some(v => typeof v !== "number")) {
      res.status(400).json({ message: "Todos os 5 atributos (aura, forca, destreza, resistencia, inteligencia) são obrigatórios." });
      return;
    }
    res.status(200).json(await personagensService.definirAtributos(req.params.characterId, { aura, forca, destreza, resistencia, inteligencia }, token));
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao definir atributos" });
  }
});

PersonagensRouter.patch("/:characterId/escolher-deus", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { deus_id } = req.body as { deus_id: number | null };
    res.status(200).json(await personagensService.escolherDeus(req.params.characterId, deus_id ?? null, token));
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao escolher deus" });
  }
});

PersonagensRouter.patch("/:characterId/concluir-onboarding", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { equipamentos } = req.body as { equipamentos: Array<{id: number; nome: string; peso: number}> };
    if (!Array.isArray(equipamentos)) {
      res.status(400).json({ message: "equipamentos deve ser um array." });
      return;
    }
    res.status(200).json(await personagensService.concluirOnboarding(req.params.characterId, equipamentos, token));
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao concluir onboarding" });
  }
});

PersonagensRouter.patch("/:characterId/escolher-passado", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const { passado_id } = req.body as { passado_id: number };
    if (!passado_id || typeof passado_id !== "number") {
      res.status(400).json({ message: "passado_id é obrigatório e deve ser um número." });
      return;
    }
    const resultado = await personagensService.escolherPassado(req.params.characterId, passado_id, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao escolher passado" });
  }
});

PersonagensRouter.post("/:characterId/levar-classe", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensService.levelarClasse(req.params.characterId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("permissão") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao levar classe" });
  }
});

PersonagensRouter.post("/admin/:characterId/class-points", async (req, res) => {
  try {
    const token = getBearerToken(req.headers.authorization);
    const resultado = await personagensService.adicionarPontosDeClasse(req.params.characterId, req.body, token);
    res.status(200).json(resultado);
  } catch (error: any) {
    const status = error?.message?.includes("autenticado") ? 401 : error?.message?.includes("mestre") ? 403 : 400;
    res.status(status).json({ message: error?.message ?? "Erro ao adicionar pontos" });
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

// Precisa ser a primeira importação do arquivo: módulos como AuthGuardsModule
// leem process.env.JWT_SECRET assim que são importados (não só quando usados),
// então o .env já tem que estar carregado antes de qualquer outro import.
import "dotenv/config";
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { getConnectionToken } from "@nestjs/sequelize";
import { resolve } from "node:path";
import type { Sequelize } from "sequelize-typescript";
import { AppModule } from "./app.module.js";
import { contextoRequisicaoMiddleware } from "./common/cls/contexto-requisicao.middleware.js";
import { UsuariosService } from "./modules/usuarios/usuarios.service.js";
import { registrarServicoUsuarios } from "./modules/usuarios/usuarios.ponte.js";
import { PersonagensRouter } from "./modules/personagem/personagens.module.js";
import { LoreNotesRouter } from "./modules/lore-notes/lore-notes.module.js";
import { CharacterCreationRouter } from "./modules/character-creation/character-creation.module.js";
import { NpcsRouter } from "./modules/npcs/npcs.module.js";
import { CampanhasRouter } from "./modules/campanhas/campanhas.module.js";

async function iniciarAplicacao(): Promise<void> {
  const aplicacao = await NestFactory.create<NestExpressApplication>(AppModule);

  // Precisa ser o primeiro middleware: abre o contexto por requisição que
  // o JwtAuthGuard e os hooks de auditoria do Sequelize usam depois.
  aplicacao.use(contextoRequisicaoMiddleware);

  aplicacao.enableCors({
    origin: process.env.ALLOWED_ORIGIN ?? "*",
    credentials: !!process.env.ALLOWED_ORIGIN,
  });

  // Valida automaticamente os DTOs (@IsString, @IsInt, etc.) em toda rota Nest.
  aplicacao.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  aplicacao.setGlobalPrefix("api", { exclude: ["health"] });

  // Substitui o Supabase Storage: as imagens gravadas em disco ficam
  // acessíveis publicamente em /uploads/<subpasta>/<arquivo>.
  aplicacao.useStaticAssets(resolve(process.env.UPLOADS_DIR ?? "uploads"), {
    prefix: "/uploads/",
  });

  aplicacao.use("/health", async (_requisicao: unknown, resposta: any) => {
    const conexaoSequelize = aplicacao.get<Sequelize>(getConnectionToken());
    try {
      await conexaoSequelize.authenticate();
      resposta.status(200).json({ ok: true, banco: "conectado" });
    } catch (erro: any) {
      resposta.status(503).json({ ok: false, banco: "erro", detalhe: erro?.message });
    }
  });

  // Ponte para os módulos Express que ainda precisam criar contas.
  registrarServicoUsuarios(aplicacao.get(UsuariosService));

  // Registra as rotas do Nest ANTES de montar os routers Express abaixo.
  // Sem isto, um módulo migrado pela metade perderia para o router antigo:
  // o Express atende na ordem em que as rotas entram, e o listen() só
  // registraria as do Nest depois. Importa enquanto /api/personagens tiver
  // rotas nos dois lados.
  await aplicacao.init();

  // Módulos ainda não migrados pro Nest continuam servidos pelos routers
  // Express antigos (que ainda falam com o Supabase). Cada um sai daqui
  // conforme for migrado — tabelas-acessorias já saiu, por exemplo.
  aplicacao.use("/api/personagens", PersonagensRouter);
  aplicacao.use("/api/lore-notes", LoreNotesRouter);
  aplicacao.use("/api/character-creation-requests", CharacterCreationRouter);
  aplicacao.use("/api/npcs", NpcsRouter);
  aplicacao.use("/api/campanhas", CampanhasRouter);

  const porta = Number(process.env.PORT ?? 3000);
  await aplicacao.listen(porta);
  console.log(`Server running on http://localhost:${porta}`);
}

iniciarAplicacao();

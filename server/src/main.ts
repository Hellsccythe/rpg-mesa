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
import { PersonagensRouter } from "./modules/personagem/personagens.module.js";
import { GodRouter } from "./modules/god/god.module.js";
import { CityMapsRouter } from "./modules/city_maps/city-maps.module.js";
import { ClassesRouter } from "./modules/classes/classes.module.js";
import { SkillRouter } from "./modules/skill/skill.module.js";
import { TitulosRouter } from "./modules/titulos/titulos.module.js";
import { LoreNotesRouter } from "./modules/lore-notes/lore-notes.module.js";
import { ArmasRouter } from "./modules/armas/arma.module.js";
import { RacasRouter } from "./modules/racas/raca.module.js";
import { IndoleRouter } from "./modules/indole/indole.module.js";
import { GeneroRouter } from "./modules/genero/genero.module.js";
import { CharacterCreationRouter } from "./modules/character-creation/character-creation.module.js";
import { UsuariosRouter } from "./modules/usuarios/usuarios.module.js";
import { NpcsRouter } from "./modules/npcs/npcs.module.js";
import { PlayerTelasRouter } from "./modules/player-telas/player-telas.module.js";
import { CampanhasRouter } from "./modules/campanhas/campanhas.module.js";
import { AdminRouter } from "./modules/admin/admin.module.js";

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

  // Módulos ainda não migrados pro Nest continuam servidos pelos routers
  // Express antigos (que ainda falam com o Supabase). Cada um sai daqui
  // conforme for migrado — tabelas-acessorias já saiu, por exemplo.
  aplicacao.use("/api/personagens", PersonagensRouter);
  aplicacao.use("/api/gods", GodRouter);
  aplicacao.use("/api/city-maps", CityMapsRouter);
  aplicacao.use("/api/classes", ClassesRouter);
  aplicacao.use("/api/skills", SkillRouter);
  aplicacao.use("/api/titulos", TitulosRouter);
  aplicacao.use("/api/lore-notes", LoreNotesRouter);
  aplicacao.use("/api/armas", ArmasRouter);
  aplicacao.use("/api/racas", RacasRouter);
  aplicacao.use("/api/indole", IndoleRouter);
  aplicacao.use("/api/genero", GeneroRouter);
  aplicacao.use("/api/character-creation-requests", CharacterCreationRouter);
  aplicacao.use("/api/usuarios", UsuariosRouter);
  aplicacao.use("/api/npcs", NpcsRouter);
  aplicacao.use("/api/player-telas", PlayerTelasRouter);
  aplicacao.use("/api/campanhas", CampanhasRouter);
  aplicacao.use("/api/admin", AdminRouter);

  const porta = Number(process.env.PORT ?? 3000);
  await aplicacao.listen(porta);
  console.log(`Server running on http://localhost:${porta}`);
}

iniciarAplicacao();

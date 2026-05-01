import "reflect-metadata";
import cors from "cors";
import express from "express";
import { PersonagensRouter } from "./modules/personagem/personagens.module.js";
import { GodRouter } from "./modules/god/god.module.js";
import { CityMapsRouter } from "./modules/city_maps/city-maps.module.js";
import { ClassesRouter } from "./modules/classes/classes.module.js";
import { SkillRouter } from "./modules/skill/skill.module.js";
import { TitulosRouter } from "./modules/titulos/titulos.module.js";
import { LoreNotesRouter } from "./modules/lore-notes/lore-notes.module.js";
import { ArmasRouter } from "./modules/armas/arma.module.js";
import { RacasRouter } from "./modules/racas/raca.module.js";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? "*",
    credentials: !!process.env.ALLOWED_ORIGIN,
  }),
);
app.use(express.json());

app.get("/api/health", (_, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/personagens", PersonagensRouter);
app.use("/api/gods", GodRouter);
app.use("/api/city-maps", CityMapsRouter);
app.use("/api/classes", ClassesRouter);
app.use("/api/skills", SkillRouter);
app.use("/api/titulos", TitulosRouter);
app.use("/api/lore-notes", LoreNotesRouter);
app.use("/api/armas", ArmasRouter);
app.use("/api/racas", RacasRouter);

export default app;

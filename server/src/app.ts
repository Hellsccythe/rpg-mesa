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

app.get("/api/health", async (_req, res) => {
  const vars = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    MASTER_EMAILS: !!(process.env.MASTER_EMAILS ?? process.env.MASTER_EMAIL),
  };
  const missingVars = Object.entries(vars)
    .filter(([, ok]) => !ok)
    .map(([k]) => k);

  let dbOk = false;
  let dbError: string | null = null;
  try {
    const { getAdminClient } = await import("./config/database/supabase/client.js");
    const { error } = await getAdminClient().from("gods").select("id").limit(1);
    dbOk = !error;
    if (error) dbError = error.message;
  } catch (e: any) {
    dbError = e?.message ?? "unknown";
  }

  const ok = missingVars.length === 0 && dbOk;
  res.status(ok ? 200 : 503).json({ ok, missingVars, db: dbOk, dbError });
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

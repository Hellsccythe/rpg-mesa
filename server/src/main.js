import "reflect-metadata";
import cors from "cors";
import express from "express";
import { PersonagensRouter } from "./modules/personagem/personagens.module.js";
import { GodRouter } from "./modules/god/god.module.js";
import { CityMapsRouter } from "./modules/city_maps/city-maps.module.js";
import { ClassesRouter } from "./modules/classes/classes.module.js";
import { SkillRouter } from "./modules/skill/skill.module.js";
import { TitulosRouter } from "./modules/titulos/titulos.module.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_, res) => {
    res.status(200).json({ ok: true });
});
app.use("/api/personagens", PersonagensRouter);
app.use("/api/gods", GodRouter);
app.use("/api/city-maps", CityMapsRouter);
app.use("/api/classes", ClassesRouter);
app.use("/api/skills", SkillRouter);
app.use("/api/titulos", TitulosRouter);
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
//# sourceMappingURL=main.js.map
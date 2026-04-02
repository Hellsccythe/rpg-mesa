import cors from "cors";
import express from "express";
import { personagensRouter } from "./modules/personagem/personagens.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res) => {
  res.status(200).json({ ok: true });
});

app.use("/api/personagens", personagensRouter);

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

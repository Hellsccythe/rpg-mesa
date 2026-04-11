import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_DIR = path.resolve(ROOT, "..", "client");
const DEUSES_VIEW = path.resolve(CLIENT_DIR, "src", "views", "DeusesView.vue");
const IMAGES_DIR = path.resolve(CLIENT_DIR, "src", "assets", "images");
const TMP_DIR = path.resolve(ROOT, ".tmp", "gods-compressed");
const BUCKET = "gods";

function readEnvFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const env = {};

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed
      .slice(idx + 1)
      .trim()
      .replace(/^"|"$/g, "");
    env[key] = value;
  }

  return env;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(name) {
  return normalizeText(name)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function extractStaticGodsArray(source) {
  const marker = "const staticGods = [";
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error("Nao encontrei staticGods na DeusesView.vue");
  }

  const bracketStart = source.indexOf("[", start);
  let depth = 0;
  let end = -1;

  for (let i = bracketStart; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }

  if (end === -1) {
    throw new Error("Nao consegui fechar o array staticGods");
  }

  return source.slice(bracketStart, end + 1);
}

function parseStaticGods(arrayLiteral) {
  const context = {
    pharasmaImage: "",
    asmodeusImage: "",
    inariImage: "",
    iomedaeImage: "",
    sarenraeImage: "",
  };

  const script = new vm.Script(`(${arrayLiteral})`);
  const parsed = script.runInNewContext(context);

  if (!Array.isArray(parsed)) throw new Error("staticGods nao virou array");
  return parsed;
}

async function compressAndUploadImage(client, sourcePath, targetPath) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
  const tmpOut = path.resolve(TMP_DIR, targetPath.replace(/\//g, "_"));

  const image = sharp(sourcePath, { failOn: "none" });
  const metadata = await image.metadata();
  const width = metadata.width && metadata.width > 1600 ? 1600 : undefined;

  await image
    .rotate()
    .resize(width ? { width, withoutEnlargement: true } : undefined)
    .webp({ quality: 74, effort: 5 })
    .toFile(tmpOut);

  const fileBuffer = fs.readFileSync(tmpOut);

  const { error } = await client.storage.from(BUCKET).upload(targetPath, fileBuffer, {
    contentType: "image/webp",
    upsert: true,
    cacheControl: "31536000",
  });

  if (error) throw error;

  const { data } = client.storage.from(BUCKET).getPublicUrl(targetPath);
  return data.publicUrl;
}

async function upsertGod(client, god) {
  const base = {
    name: normalizeText(god.name),
    description: normalizeText(god.description),
  };

  const details = {
    title: normalizeText(god.title),
    indole: normalizeText(god.alinhamento),
    dogma: normalizeText(god.dogma),
    anatema: normalizeText(god.anatema),
    weapons: normalizeText(god.weapons),
    shortDescription: normalizeText(god.shortDescription),
    imageUrl: normalizeText(god.iconImage),
  };

  const attempts = [
    {
      ...base,
      data: {
        title: details.title,
        indole: details.indole,
        dogma: details.dogma,
        anatema: details.anatema,
        weapons: details.weapons,
        shortDescription: details.shortDescription,
        imageUrl: details.imageUrl,
      },
    },
    {
      ...base,
      title: details.title,
      indole: details.indole,
      dogma: details.dogma,
      anatema: details.anatema,
      weapons: details.weapons,
      short_description: details.shortDescription,
      image_path: details.imageUrl,
      image_url: details.imageUrl,
    },
    {
      ...base,
      indole: details.indole,
      dogma: details.dogma,
      anatema: details.anatema,
      weapons: details.weapons,
      short_description: details.shortDescription,
      image_path: details.imageUrl,
    },
    {
      ...base,
      title: details.title,
      indole: details.indole,
      dogma: details.dogma,
      anatema: details.anatema,
      weapons: details.weapons,
      shortDescription: details.shortDescription,
      imageUrl: details.imageUrl,
    },
    base,
  ];

  let lastError = null;

  for (const payload of attempts) {
    const { error } = await client.from("gods").upsert(payload, { onConflict: "name" });

    if (!error) return;

    lastError = error;
    const msg = String(error.message ?? "").toLowerCase();
    const missingColumn =
      (msg.includes("column") && msg.includes("does not exist")) ||
      (msg.includes("could not find") && msg.includes("column"));

    if (!missingColumn) {
      throw error;
    }
  }

  if (lastError) throw lastError;
}

async function main() {
  const envPath = path.resolve(ROOT, ".env");
  const envFromFile = fs.existsSync(envPath) ? readEnvFile(envPath) : {};

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    envFromFile.SUPABASE_URL ||
    envFromFile.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || envFromFile.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Faltam SUPABASE_URL/VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (via variaveis de ambiente ou server/.env)",
    );
  }

  const supabase = createClient(url, key);

  const source = fs.readFileSync(DEUSES_VIEW, "utf8");
  const arrayLiteral = extractStaticGodsArray(source);
  const gods = parseStaticGods(arrayLiteral);

  const imageMap = {
    pharasma: "pharasma.png",
    asmodeus: "asmodeus.png",
    inari: "inari.png",
    iomedae: "iomedae.png",
    sarenrae: "sarenrae.png",
  };

  for (const god of gods) {
    const slug = slugify(god.name);
    if (!slug) continue;

    if (imageMap[slug]) {
      const sourceImage = path.resolve(IMAGES_DIR, imageMap[slug]);
      if (fs.existsSync(sourceImage)) {
        const publicUrl = await compressAndUploadImage(supabase, sourceImage, `${slug}.webp`);
        god.iconImage = publicUrl;
      }
    }

    await upsertGod(supabase, god);
    console.log(`upsert ok: ${god.name}`);
  }

  console.log(`Concluido. Total processado: ${gods.length}`);
}

main().catch((error) => {
  console.error("Falha no seed de deuses:", error?.message ?? error);
  process.exit(1);
});

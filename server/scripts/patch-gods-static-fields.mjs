/**
 * Patches the `data` JSONB for each god in the DB using the static god data
 * from DeusesView.vue. Only fills in fields that are currently empty —
 * imageUrl is always preserved from whatever is already in the DB.
 *
 * Usage:
 *   node server/scripts/patch-gods-static-fields.mjs
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLIENT_DIR = path.resolve(ROOT, "..", "client");
const DEUSES_VIEW = path.resolve(CLIENT_DIR, "src", "views", "DeusesView.vue");

function readEnvFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const env = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^"|"$/g, "");
    env[key] = value;
  }
  return env;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeAlinhamento(raw) {
  const val = normalizeText(raw)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
  if (!val) return "";
  const hasNeutro = val.includes("neutro") || val.includes("neutra");
  const hasBom = val.includes("bom") || val.includes("boa");
  const hasMal = val.includes("maligno") || val.includes("maligna") || val.includes("mau") || val.includes("mal");
  if (hasNeutro && hasBom) return "Neutro Bom";
  if (hasNeutro && hasMal) return "Neutro Maligno";
  if (hasNeutro) return "Neutro";
  if (hasBom) return "Bom/Boa";
  if (hasMal) return "Maligno(a)";
  return normalizeText(raw);
}

function extractStaticGodsArray(source) {
  const marker = "const staticGods = [";
  const start = source.indexOf(marker);
  if (start === -1) throw new Error("staticGods nao encontrado em DeusesView.vue");
  const bracketStart = source.indexOf("[", start);
  let depth = 0;
  let end = -1;
  for (let i = bracketStart; i < source.length; i++) {
    if (source[i] === "[") depth++;
    if (source[i] === "]") { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) throw new Error("Nao foi possivel fechar o array staticGods");
  return source.slice(bracketStart, end + 1);
}

function parseStaticGods(arrayLiteral) {
  const script = new vm.Script(`(${arrayLiteral})`);
  const parsed = script.runInNewContext({});
  if (!Array.isArray(parsed)) throw new Error("staticGods nao virou array");
  return parsed;
}

async function main() {
  const envPath = path.resolve(ROOT, ".env");
  const envFromFile = fs.existsSync(envPath) ? readEnvFile(envPath) : {};

  const url =
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    envFromFile.SUPABASE_URL ||
    envFromFile.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || envFromFile.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (server/.env)");
  }

  const supabase = createClient(url, key);

  // Load static god data from DeusesView
  const source = fs.readFileSync(DEUSES_VIEW, "utf8");
  const staticGods = parseStaticGods(extractStaticGodsArray(source));
  console.log(`Encontrado ${staticGods.length} deuses estaticos em DeusesView.vue\n`);

  // Load all existing DB gods
  const { data: dbGods, error: fetchError } = await supabase
    .from("gods")
    .select("id, name, description, data")
    .is("deleted_at", null);

  if (fetchError) throw fetchError;
  console.log(`Encontrado ${dbGods.length} deuses no banco de dados\n`);

  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const staticGod of staticGods) {
    const staticName = normalizeText(staticGod.name).toLowerCase();
    if (!staticName) continue;

    const dbGod = dbGods.find(
      (g) => normalizeText(g.name).toLowerCase() === staticName
    );

    if (!dbGod) {
      console.log(`⚠️  Nao encontrado no DB: "${staticGod.name}"`);
      notFound++;
      continue;
    }

    const existingData = dbGod.data && typeof dbGod.data === "object" ? dbGod.data : {};

    // Merge: only overwrite fields that are currently empty; always preserve imageUrl
    const mergedData = {
      ...existingData,
      title: existingData.title?.trim() || normalizeText(staticGod.title),
      indole: existingData.indole?.trim() || normalizeAlinhamento(staticGod.alinhamento),
      dogma: existingData.dogma?.trim() || normalizeText(staticGod.dogma),
      anatema: existingData.anatema?.trim() || normalizeText(staticGod.anatema),
      weapons: existingData.weapons?.trim() || normalizeText(staticGod.weapons),
      shortDescription:
        existingData.shortDescription?.trim() || normalizeText(staticGod.shortDescription),
      // imageUrl is preserved from existingData via spread above
    };

    // Also patch description column if it's empty
    const updates = { data: mergedData };
    const descriptionNeeded =
      !dbGod.description?.trim() && staticGod.description?.trim();
    if (descriptionNeeded) {
      updates.description = normalizeText(staticGod.description);
    }

    const { error: updateError } = await supabase
      .from("gods")
      .update(updates)
      .eq("id", dbGod.id);

    if (updateError) {
      console.error(`❌ Erro ao atualizar "${staticGod.name}": ${updateError.message}`);
    } else {
      console.log(`✅ Atualizado: ${staticGod.name} (imageUrl preservada: ${existingData.imageUrl || "vazia"})`);
      updated++;
    }
  }

  console.log(`\nConcluido: ${updated} atualizados, ${skipped} ignorados, ${notFound} nao encontrados.`);
}

main().catch((err) => {
  console.error("Falha:", err?.message ?? err);
  process.exit(1);
});

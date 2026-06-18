import { Router } from "express";
import { readdirSync, readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";
import { getAdminClient } from "../../config/database/supabase/client.js";
import { ensureMasterAccess } from "../../common/helpers/master-access.helper.js";

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../../../database/migrations");

export const AdminRouter = Router();

function token(req: any): string | undefined {
  return req.headers.authorization?.split(" ")[1];
}

// ── Conversão de dialeto ────────────────────────────────────────────────────────

function converterDialeto(ddl: string, dialeto: string): string {
  if (!dialeto || dialeto === "postgresql") return ddl;

  if (dialeto === "mysql") {
    const aviso =
      `-- ============================================================\n` +
      `-- Dialeto: MySQL 8+ / MariaDB\n` +
      `-- Conversão automática aplicada — revise antes de executar:\n` +
      `--   • Arrays (INTEGER[], TEXT[]) → JSON\n` +
      `--   • UUID → VARCHAR(36)\n` +
      `--   • BOOLEAN → TINYINT(1)\n` +
      `--   • Adicione ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 em cada CREATE TABLE\n` +
      `-- ============================================================\n\n`;

    return aviso + ddl
      .replace(/\bTIMESTAMPTZ\b/g, "DATETIME")
      .replace(/\bTIMESTAMP\b/g, "DATETIME")
      .replace(/\bJSONB\b/g, "JSON")
      .replace(/\bUUID\b/g, "VARCHAR(36)")
      .replace(/\b(?:TEXT|INTEGER|SMALLINT|BIGINT|BOOLEAN|UUID)\[\]/g, "JSON")
      .replace(/\bBOOLEAN\b/g, "TINYINT(1)")
      .replace(/\bDOUBLE PRECISION\b/g, "DOUBLE")
      .replace(/\bREAL\b/g, "FLOAT")
      .replace(/\s+GENERATED (?:ALWAYS|BY DEFAULT) AS IDENTITY/g, " AUTO_INCREMENT")
      .replace(/\bDEFAULT gen_random_uuid\(\)/g, "DEFAULT (UUID())");
  }

  if (dialeto === "sqlite") {
    const aviso =
      `-- ============================================================\n` +
      `-- Dialeto: SQLite 3\n` +
      `-- Conversão automática aplicada — revise antes de executar:\n` +
      `--   • Arrays, JSONB, UUID, VARCHAR → TEXT\n` +
      `--   • BOOLEAN → INTEGER (0/1)\n` +
      `--   • NUMERIC/DOUBLE → REAL\n` +
      `--   • GENERATED AS IDENTITY removido (use INTEGER PRIMARY KEY)\n` +
      `--   • gen_random_uuid() → hex(randomblob(16))\n` +
      `--   • NOW() → CURRENT_TIMESTAMP\n` +
      `-- ============================================================\n\n`;

    return aviso + ddl
      .replace(/\bTIMESTAMPTZ\b/g, "TEXT")
      .replace(/\bTIMESTAMP\b/g, "TEXT")
      .replace(/\bJSONB\b/g, "TEXT")
      .replace(/\bJSON\b/g, "TEXT")
      .replace(/\bUUID\b/g, "TEXT")
      .replace(/\b(?:TEXT|INTEGER|SMALLINT|BIGINT|BOOLEAN|UUID)\[\]/g, "TEXT")
      .replace(/\bBOOLEAN\b/g, "INTEGER")
      .replace(/\bDOUBLE PRECISION\b/g, "REAL")
      .replace(/\bFLOAT\b/g, "REAL")
      .replace(/\bNUMERIC(?:\([^)]+\))?\b/g, "REAL")
      .replace(/\bVARCHAR(?:\([^)]+\))?\b/g, "TEXT")
      .replace(/\bCHAR(?:\([^)]+\))?\b/g, "TEXT")
      .replace(/\bSMALLINT\b/g, "INTEGER")
      .replace(/\bBIGINT\b/g, "INTEGER")
      .replace(/\s+GENERATED (?:ALWAYS|BY DEFAULT) AS IDENTITY/g, "")
      .replace(/\bDEFAULT gen_random_uuid\(\)/g, "DEFAULT (lower(hex(randomblob(16))))")
      .replace(/\bDEFAULT [Nn][Oo][Ww]\(\)/g, "DEFAULT CURRENT_TIMESTAMP");
  }

  return ddl;
}

// ── GET /api/admin/exportar-schema?dialeto=postgresql|mysql|sqlite ─────────────

AdminRouter.get("/exportar-schema", async (req, res) => {
  try {
    await ensureMasterAccess(token(req));

    const dialeto = String(req.query.dialeto ?? "postgresql");
    const sufixo  = dialeto !== "postgresql" ? `_${dialeto}` : "";
    const filename = `schema${sufixo}_${new Date().toISOString().slice(0, 10)}.sql`;

    // Tentativa 1: função PostgreSQL (requer migration 060)
    const { data, error } = await getAdminClient().rpc("exportar_schema_ddl");

    if (!error && typeof data === "string" && data.length > 0) {
      const ddl = converterDialeto(data, dialeto);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(ddl);
      return;
    }

    // Fallback: concatenar migrations do disco
    if (existsSync(MIGRATIONS_DIR)) {
      const files = readdirSync(MIGRATIONS_DIR)
        .filter((f) => f.endsWith(".sql"))
        .sort();

      const conteudo = files
        .map((f) => `-- ===== ${f} =====\n${readFileSync(join(MIGRATIONS_DIR, f), "utf-8")}`)
        .join("\n\n");

      const header =
        `-- Esquema exportado via migrations concatenadas\n` +
        `-- Gerado em: ${new Date().toISOString()}\n` +
        `-- (Execute a migration 060 no Supabase para DDL limpo gerado do banco)\n\n`;

      const ddl = converterDialeto(header + conteudo, dialeto);
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(ddl);
      return;
    }

    throw new Error("Função exportar_schema_ddl não encontrada e diretório de migrations inacessível. Execute a migration 060 no Supabase.");
  } catch (err: any) {
    const status = err.message?.includes("Acesso") ? 403 : 500;
    res.status(status).json({ error: err.message ?? "Erro ao exportar schema." });
  }
});

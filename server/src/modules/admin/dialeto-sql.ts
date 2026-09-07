/**
 * Conversão aproximada do DDL do Postgres para outros bancos, para o mestre
 * poder levar o esquema a outro lugar. É substituição de texto, não parser —
 * por isso cada saída começa com um aviso pedindo revisão.
 */
export const DIALETOS_SUPORTADOS = ["postgresql", "mysql", "sqlite"] as const;
export type DialetoSql = (typeof DIALETOS_SUPORTADOS)[number];

const AVISO_MYSQL =
  `-- ============================================================\n` +
  `-- Dialeto: MySQL 8+ / MariaDB\n` +
  `-- Conversão automática aplicada — revise antes de executar:\n` +
  `--   • Arrays (INTEGER[], TEXT[]) → JSON\n` +
  `--   • UUID → VARCHAR(36)\n` +
  `--   • BOOLEAN → TINYINT(1)\n` +
  `--   • Adicione ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 em cada CREATE TABLE\n` +
  `-- ============================================================\n\n`;

const AVISO_SQLITE =
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

function paraMysql(ddl: string): string {
  return (
    AVISO_MYSQL +
    ddl
      .replace(/\bTIMESTAMPTZ\b/g, "DATETIME")
      .replace(/\bTIMESTAMP\b/g, "DATETIME")
      .replace(/\bJSONB\b/g, "JSON")
      .replace(/\bUUID\b/g, "VARCHAR(36)")
      .replace(/\b(?:TEXT|INTEGER|SMALLINT|BIGINT|BOOLEAN|UUID)\[\]/g, "JSON")
      .replace(/\bBOOLEAN\b/g, "TINYINT(1)")
      .replace(/\bDOUBLE PRECISION\b/g, "DOUBLE")
      .replace(/\bREAL\b/g, "FLOAT")
      .replace(/\s+GENERATED (?:ALWAYS|BY DEFAULT) AS IDENTITY/g, " AUTO_INCREMENT")
      .replace(/\bDEFAULT gen_random_uuid\(\)/g, "DEFAULT (UUID())")
  );
}

function paraSqlite(ddl: string): string {
  return (
    AVISO_SQLITE +
    ddl
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
      .replace(/\bDEFAULT [Nn][Oo][Ww]\(\)/g, "DEFAULT CURRENT_TIMESTAMP")
  );
}

export function converterDialeto(ddl: string, dialeto: DialetoSql): string {
  if (dialeto === "mysql") return paraMysql(ddl);
  if (dialeto === "sqlite") return paraSqlite(ddl);
  return ddl;
}

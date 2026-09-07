import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { converterDialeto, type DialetoSql } from "./dialeto-sql.js";

const DIRETORIO_MIGRATIONS = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../../../database/migrations",
);

@Injectable()
export class AdminService {
  constructor(private readonly sequelize: Sequelize) {}

  /**
   * DDL do esquema, para o mestre levar a estrutura a outro banco.
   *
   * Caminho principal: a função exportar_schema_ddl() do próprio Postgres
   * (migration 060), que gera o DDL a partir do estado real. Se ela não
   * existir, concatena os arquivos de migration do disco — que descrevem a
   * mesma coisa, só que em histórico e não em estado final.
   */
  async exportarSchema(dialeto: DialetoSql): Promise<{ nomeArquivo: string; conteudo: string }> {
    const sufixo = dialeto === "postgresql" ? "" : `_${dialeto}`;
    const nomeArquivo = `schema${sufixo}_${new Date().toISOString().slice(0, 10)}.sql`;

    const ddlDoBanco = await this.gerarDdlPelaFuncaoDoBanco();
    if (ddlDoBanco) {
      return { nomeArquivo, conteudo: converterDialeto(ddlDoBanco, dialeto) };
    }

    const ddlDasMigrations = this.concatenarMigrations();
    if (ddlDasMigrations) {
      return { nomeArquivo, conteudo: converterDialeto(ddlDasMigrations, dialeto) };
    }

    throw new InternalServerErrorException(
      "Função exportar_schema_ddl não encontrada e diretório de migrations inacessível.",
    );
  }

  private async gerarDdlPelaFuncaoDoBanco(): Promise<string | null> {
    try {
      const retorno = await this.sequelize.query<{ exportar_schema_ddl: string }>(
        "SELECT exportar_schema_ddl()",
        { type: QueryTypes.SELECT },
      );
      const ddl = retorno[0]?.exportar_schema_ddl;
      return typeof ddl === "string" && ddl.length > 0 ? ddl : null;
    } catch {
      // A função pode não existir neste banco — cai no plano B.
      return null;
    }
  }

  private concatenarMigrations(): string | null {
    if (!existsSync(DIRETORIO_MIGRATIONS)) return null;

    const arquivos = readdirSync(DIRETORIO_MIGRATIONS)
      .filter((arquivo) => arquivo.endsWith(".sql"))
      .sort();

    if (arquivos.length === 0) return null;

    const cabecalho =
      `-- Esquema exportado a partir das migrations concatenadas\n` +
      `-- Gerado em: ${new Date().toISOString()}\n` +
      `-- (A função exportar_schema_ddl() do banco dá um DDL mais limpo)\n\n`;

    const corpo = arquivos
      .map(
        (arquivo) =>
          `-- ===== ${arquivo} =====\n${readFileSync(join(DIRETORIO_MIGRATIONS, arquivo), "utf-8")}`,
      )
      .join("\n\n");

    return cabecalho + corpo;
  }
}

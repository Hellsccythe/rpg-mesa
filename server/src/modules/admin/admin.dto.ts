import { IsIn, IsOptional } from "class-validator";
import { DIALETOS_SUPORTADOS, type DialetoSql } from "./dialeto-sql.js";

export class ExportarSchemaDto {
  @IsOptional()
  @IsIn(DIALETOS_SUPORTADOS, {
    message: `dialeto deve ser um de: ${DIALETOS_SUPORTADOS.join(", ")}.`,
  })
  dialeto?: DialetoSql;
}

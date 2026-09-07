import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { AdminService } from "./admin.service.js";
import { ExportarSchemaDto } from "./admin.dto.js";

@UseGuards(JwtAuthGuard, MasterGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly servicoAdmin: AdminService) {}

  /**
   * Responde texto puro como anexo, não JSON — o frontend transforma em
   * download. Por isso usa @Res, que desliga a serialização automática do Nest.
   */
  @Get("exportar-schema")
  async exportarSchema(@Query() filtro: ExportarSchemaDto, @Res() resposta: Response) {
    const { nomeArquivo, conteudo } = await this.servicoAdmin.exportarSchema(
      filtro.dialeto ?? "postgresql",
    );

    resposta.setHeader("Content-Type", "text/plain; charset=utf-8");
    resposta.setHeader("Content-Disposition", `attachment; filename="${nomeArquivo}"`);
    resposta.send(conteudo);
  }
}

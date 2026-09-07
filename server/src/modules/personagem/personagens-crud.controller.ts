import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagensCrudService } from "./personagens-crud.service.js";
import { EditarPersonagemDto } from "./personagens-crud.dto.js";

@Controller("personagens")
export class PersonagensCrudController {
  constructor(private readonly servicoCrud: PersonagensCrudService) {}

  /** Antes da rota com parâmetro de um segmento só. */
  @UseGuards(JwtAuthGuard, MasterGuard)
  @Delete("admin/:characterId")
  async deletarComoMestre(@Param("characterId", ParseIntPipe) personagemId: number) {
    await this.servicoCrud.deletarComoMestre(personagemId);
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":characterId")
  editar(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: EditarPersonagemDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    return this.servicoCrud.editar(personagemId, dados, usuario);
  }
}

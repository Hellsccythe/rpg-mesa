import { Body, Controller, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { PersonagensMestreService } from "./personagens-mestre.service.js";
import {
  AdicionarNotaAventuraDto,
  AlterarStatusDto,
  FocalPointDto,
  InfoAdicionalDeDeusDto,
  PosicaoDeImagemDto,
} from "./personagens-mestre.dto.js";

@UseGuards(JwtAuthGuard, MasterGuard)
@Controller("personagens")
export class PersonagensMestreController {
  constructor(private readonly servicoMestre: PersonagensMestreService) {}

  @Patch("admin/:characterId/status")
  alterarStatus(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: AlterarStatusDto,
  ) {
    return this.servicoMestre.alterarStatus(personagemId, dados.status);
  }

  @Patch("admin/:characterId/god-info/:godId")
  definirInfoAdicionalDeDeus(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Param("godId", ParseIntPipe) deusId: number,
    @Body() dados: InfoAdicionalDeDeusDto,
  ) {
    return this.servicoMestre.definirInfoAdicionalDeDeus(personagemId, deusId, dados.text ?? "");
  }

  @Patch("admin/:characterId/avatar-focal-point")
  definirAvatarFocalPoint(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: FocalPointDto,
  ) {
    return this.servicoMestre.definirAvatarFocalPoint(personagemId, dados.focalPoint);
  }

  @Patch("admin/:characterId/modal-hero-position")
  definirPosicaoNoModal(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: PosicaoDeImagemDto,
  ) {
    return this.servicoMestre.definirPosicaoNoModal(personagemId, dados.position ?? "");
  }

  /**
   * O caminho repete "personagens" ("/personagens/admin/personagens/:id/notas")
   * por herança do router antigo. Mantido para não mexer no frontend junto.
   */
  @Post("admin/personagens/:characterId/notas")
  adicionarNotaAventura(
    @Param("characterId", ParseIntPipe) personagemId: number,
    @Body() dados: AdicionarNotaAventuraDto,
  ) {
    return this.servicoMestre.adicionarNotaAventura(personagemId, dados.note);
  }
}

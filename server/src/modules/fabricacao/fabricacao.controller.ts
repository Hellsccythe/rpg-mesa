import {
  Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Query, UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { FabricacaoService } from "./fabricacao.service.js";
import { FabricarDto } from "./fabricacao.dto.js";

/** Dono ou mestre, como toda rota com :id. O mestre fabrica em nome de qualquer um. */
@UseGuards(JwtAuthGuard)
@Controller("personagens/:id/fabricar")
export class FabricacaoController {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly servicoFabricacao: FabricacaoService,
  ) {}

  /** Só confere — é o que desabilita o botão com o motivo escrito. */
  @Get("checar")
  async checar(
    @Param("id", ParseIntPipe) id: number,
    @Query("receita_id", ParseIntPipe) receitaId: number,
    @Query("oficina_disponivel") oficina: string | undefined,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoFabricacao.checar(personagem, receitaId, oficina === "true");
  }

  @Post()
  async fabricar(
    @Param("id", ParseIntPipe) id: number,
    @Body() dados: FabricarDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoFabricacao.fabricar(
      personagem, dados.receita_id, dados.oficina_disponivel ?? false, usuario);
  }

  @Get("historico")
  async historico(
    @Param("id", ParseIntPipe) id: number,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoFabricacao.historico(personagem.id);
  }

  private async buscarPermitido(id: number, usuario: UsuarioAutenticado): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(id);
    if (!personagem) throw new NotFoundException("Personagem não encontrado.");
    garantirAcessoAoPersonagem(personagem, usuario);
    return personagem;
  }
}

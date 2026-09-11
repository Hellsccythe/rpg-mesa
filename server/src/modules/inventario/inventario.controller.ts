import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { NotFoundException } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { UsuarioLogado } from "../../common/auth/usuario-logado.decorator.js";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { InventarioService } from "./inventario.service.js";
import {
  AdicionarAoInventarioDto,
  AlternarNoInventarioDto,
  RemoverDoInventarioDto,
} from "./inventario.dto.js";

/**
 * Toda rota exige ser dono do personagem ou mestre — a mesma guarda de toda
 * rota com :id. O mestre usa as mesmas rotas para dar saque a qualquer um.
 *
 * Não há rota "substitua tudo": uma requisição com lista vazia apagaria o
 * inventário por engano. Cada mudança é uma entrada.
 */
@UseGuards(JwtAuthGuard)
@Controller("personagens/:id/inventario")
export class InventarioController {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly servicoInventario: InventarioService,
  ) {}

  @Get()
  async listar(
    @Param("id", ParseIntPipe) id: number,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoInventario.listar(personagem);
  }

  @Post()
  async adicionar(
    @Param("id", ParseIntPipe) id: number,
    @Body() dados: AdicionarAoInventarioDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoInventario.adicionar(personagem, {
      tabela: dados.tabela,
      id: dados.id,
      quantidade: dados.quantidade ?? 1,
      // Jogador não se dá obra-prima: compra é sempre null.
      qualidade: usuario.tipo === "gm" ? (dados.qualidade ?? null) : null,
      rapido: dados.rapido ?? false,
      equipado: dados.equipado ?? false,
    });
  }

  @Delete(":posicao")
  async remover(
    @Param("id", ParseIntPipe) id: number,
    @Param("posicao", ParseIntPipe) posicao: number,
    @Body() dados: RemoverDoInventarioDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoInventario.remover(personagem, posicao, dados.quantidade ?? 1);
  }

  @Patch(":posicao")
  async alternar(
    @Param("id", ParseIntPipe) id: number,
    @Param("posicao", ParseIntPipe) posicao: number,
    @Body() dados: AlternarNoInventarioDto,
    @UsuarioLogado() usuario: UsuarioAutenticado,
  ) {
    const personagem = await this.buscarPermitido(id, usuario);
    return this.servicoInventario.alternar(personagem, posicao, dados.campo, dados.valor);
  }

  private async buscarPermitido(id: number, usuario: UsuarioAutenticado): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(id);
    if (!personagem) throw new NotFoundException("Personagem não encontrado.");
    garantirAcessoAoPersonagem(personagem, usuario);
    return personagem;
  }
}

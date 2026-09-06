import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/auth/jwt-auth.guard.js";
import { MasterGuard } from "../../common/auth/master.guard.js";
import { UsuariosService } from "./usuarios.service.js";
import {
  AlterarAtivoDto,
  DefinirSenhaDto,
  EditarUsuarioDto,
  PreRegistrarDto,
} from "./usuarios.dto.js";

/** Todo o módulo é restrito ao mestre — é o painel de gestão de contas. */
@UseGuards(JwtAuthGuard, MasterGuard)
@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly servicoUsuarios: UsuariosService) {}

  @Get("admin")
  listar() {
    return this.servicoUsuarios.listar();
  }

  @Patch("admin/:id")
  editar(@Param("id", ParseIntPipe) id: number, @Body() dadosEdicao: EditarUsuarioDto) {
    return this.servicoUsuarios.editar(id, dadosEdicao);
  }

  @Patch("admin/:id/resetar-senha-padrao")
  async resetarSenhaPadrao(@Param("id", ParseIntPipe) id: number) {
    await this.servicoUsuarios.resetarSenhaPadrao(id);
    return { success: true };
  }

  @Patch("admin/:id/resetar-senha")
  async definirSenha(@Param("id", ParseIntPipe) id: number, @Body() dadosSenha: DefinirSenhaDto) {
    await this.servicoUsuarios.definirSenha(id, dadosSenha.senha);
    return { success: true };
  }

  @Patch("admin/:id/ativo")
  async alterarAtivo(@Param("id", ParseIntPipe) id: number, @Body() dadosAtivo: AlterarAtivoDto) {
    await this.servicoUsuarios.alterarAtivo(id, dadosAtivo);
    return { success: true };
  }

  @Delete("admin/:id/pre-registro")
  async removerPreRegistro(@Param("id", ParseIntPipe) id: number) {
    await this.servicoUsuarios.removerPreRegistro(id);
    return { success: true };
  }

  @Delete("admin/:id")
  async deletar(@Param("id", ParseIntPipe) id: number) {
    await this.servicoUsuarios.deletar(id);
    return { success: true };
  }

  @Post("admin/pre-registrar")
  async preRegistrar(@Body() dadosPreRegistro: PreRegistrarDto) {
    await this.servicoUsuarios.preRegistrar(dadosPreRegistro);
    return { success: true };
  }
}

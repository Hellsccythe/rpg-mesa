import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { ArmazenamentoArquivosService } from "../../common/storage/armazenamento-arquivos.service.js";
import { PersonagemModel } from "./models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "./personagem-acesso.js";
import { mapearPersonagemParaApi, mapearPersonagemParaJogador, type PersonagemApi } from "./personagem-api.mapper.js";
import type { EditarPersonagemDto } from "./personagens-crud.dto.js";

@Injectable()
export class PersonagensCrudService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly armazenamentoArquivos: ArmazenamentoArquivosService,
  ) {}

  /**
   * A versão anterior filtrava por user_id, ou seja, só o dono editava. Isso
   * quebrava o mestre: ao abrir o dashboard de um jogador e mexer no
   * inventário ou nas notas, o UPDATE não encontrava linha nenhuma e a tela
   * ficava com o dado desatualizado sem avisar. Aqui a permissão é a mesma das
   * outras rotas de personagem — dono ou mestre.
   */
  async editar(
    personagemId: number,
    dados: EditarPersonagemDto,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarPermitidoOuFalhar(personagemId, usuario);

    // O dono não edita a ficha por aqui: nome, avatar e história passam pela
    // solicitação que o mestre revisa, e o resto (nível, pontos, XP,
    // inventário, notas) é do mestre ou de rota própria. A única coisa que o
    // dashboard do jogador grava por esta rota é "vi a resposta do mestre" —
    // e era o `data` inteiro que ia junto, o que deixava qualquer jogador
    // regravar classPoints, level ou as notas de aventura com o próprio token.
    if (usuario.tipo !== "gm") {
      const atual = (personagem.data ?? {}) as Record<string, unknown>;
      const enviado = (dados.data ?? {}) as Record<string, unknown>;
      if (enviado.changeRequestResponse !== undefined) {
        personagem.data = { ...atual, changeRequestResponse: enviado.changeRequestResponse };
        await personagem.save();
      }
      return mapearPersonagemParaJogador(personagem);
    }

    if (dados.name !== undefined) personagem.name = dados.name.trim();
    if (dados.level !== undefined) personagem.level = dados.level;
    if (dados.campaignId !== undefined) personagem.campaignId = dados.campaignId;
    if (dados.avatarUrl !== undefined) {
      personagem.avatarUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(
        dados.avatarUrl,
      );
    }
    if (dados.data !== undefined) personagem.data = dados.data;
    if (dados.indoleId !== undefined) personagem.indoleId = dados.indoleId;
    if (dados.generoId !== undefined) personagem.generoId = dados.generoId;
    if (dados.aparenciaFisica !== undefined) {
      personagem.aparenciaFisica = dados.aparenciaFisica?.trim() || null;
    }
    if (dados.historiaTexto !== undefined) personagem.historiaTexto = dados.historiaTexto || null;
    if (dados.historiaDocUrl !== undefined) {
      personagem.historiaDocUrl = this.armazenamentoArquivos.normalizarParaArmazenamento(
        dados.historiaDocUrl,
      );
    }

    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /**
   * Soft delete do personagem e remoção definitiva do avatar do disco. A
   * imagem some de propósito: é o único arquivo pesado por personagem e não
   * faz sentido guardá-la para um registro que o mestre apagou.
   */
  async deletarComoMestre(personagemId: number): Promise<void> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }

    const avatar = personagem.avatarUrl;
    await personagem.destroy();

    if (avatar) {
      // Falha ao apagar o arquivo não desfaz o delete do personagem.
      await this.armazenamentoArquivos.remover(avatar).catch(() => null);
    }
  }

  /** Usada pelas rotas de upload antes de aceitar o arquivo. */
  async garantirAcesso(personagemId: number, usuario: UsuarioAutenticado): Promise<void> {
    await this.buscarPermitidoOuFalhar(personagemId, usuario);
  }

  private async buscarPermitidoOuFalhar(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);
    return personagem;
  }
}

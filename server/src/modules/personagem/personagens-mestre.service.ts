import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";
import { obterUsuarioAutenticadoDoContexto } from "../../common/cls/contexto-requisicao.js";
import { PersonagemModel } from "./models/personagem.model.js";
import { mapearPersonagemParaApi, type PersonagemApi } from "./personagem-api.mapper.js";

/**
 * Ajustes que só o mestre faz e que não são progressão: status de vida,
 * enquadramento das imagens, anotações sobre deuses e notas de aventura.
 * Tudo vive dentro do JSONB `data`, menos o status.
 */
@Injectable()
export class PersonagensMestreService {
  constructor(
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Marcar como morto libera as classes secretas que o personagem detinha,
   * para outros poderem recebê-las.
   */
  async alterarStatus(personagemId: number, status: "vivo" | "morto"): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);

    personagem.status = status;
    await personagem.save();

    if (status === "morto") {
      await this.sequelize.query(
        `DELETE FROM classe_secreta_revelada WHERE character_id = :personagemId`,
        { replacements: { personagemId }, type: QueryTypes.DELETE },
      );
    }

    return mapearPersonagemParaApi(personagem);
  }

  /** Anotação do mestre sobre a relação do personagem com um deus. */
  async definirInfoAdicionalDeDeus(
    personagemId: number,
    deusId: number,
    texto: string,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dados = this.lerDados(personagem);
    const anotacoes = { ...((dados.godAdditionalInfo ?? {}) as Record<string, unknown>) };

    const conteudo = texto.trim();
    if (conteudo) {
      anotacoes[String(deusId)] = { text: conteudo, addedAt: new Date().toISOString() };
    } else {
      delete anotacoes[String(deusId)];
    }

    personagem.data = { ...dados, godAdditionalInfo: anotacoes };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /** Enquadramento do avatar no card do personagem. */
  async definirAvatarFocalPoint(
    personagemId: number,
    focalPoint: string,
  ): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dados = this.lerDados(personagem);

    personagem.data = { ...dados, avatarFocalPoint: focalPoint };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  /** Enquadramento da imagem grande no modal. Vazio remove a preferência. */
  async definirPosicaoNoModal(personagemId: number, posicao: string): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dados = this.lerDados(personagem);

    if (posicao) {
      dados.modalHeroPosition = posicao;
    } else {
      delete dados.modalHeroPosition;
    }

    personagem.data = { ...dados };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  async adicionarNotaAventura(personagemId: number, nota: string): Promise<PersonagemApi> {
    const personagem = await this.buscarOuFalhar(personagemId);
    const dados = this.lerDados(personagem);
    const notas = Array.isArray(dados.adventureNotes)
      ? [...(dados.adventureNotes as Array<Record<string, unknown>>)]
      : [];

    notas.push({
      text: nota.trim(),
      addedBy: obterUsuarioAutenticadoDoContexto()?.email ?? "master",
      addedAt: new Date().toISOString(),
    });

    personagem.data = { ...dados, adventureNotes: notas };
    await personagem.save();
    return mapearPersonagemParaApi(personagem);
  }

  private async buscarOuFalhar(personagemId: number): Promise<PersonagemModel> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    return personagem;
  }

  private lerDados(personagem: PersonagemModel): Record<string, unknown> {
    const dados = personagem.data;
    return dados && typeof dados === "object" ? { ...dados } : {};
  }
}

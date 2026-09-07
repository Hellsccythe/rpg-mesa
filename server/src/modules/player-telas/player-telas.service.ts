import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import type { UsuarioAutenticado } from "../../common/cls/usuario-autenticado.interface.js";
import { PersonagemModel } from "../personagem/models/personagem.model.js";
import { garantirAcessoAoPersonagem } from "../personagem/personagem-acesso.js";
import { PlayerTelaModel } from "./models/player-tela.model.js";

/** As telas que o mestre pode liberar. Fixo no código, não vem do banco. */
export const TELAS_DISPONIVEIS = [
  "deuses",
  "cidade",
  "skills",
  "titulos",
  "classes",
  "npcs",
  "racas",
  "equipamentos",
  "notas",
] as const;

export type TelaLiberavel = (typeof TELAS_DISPONIVEIS)[number];

function ehTelaConhecida(tela: string): tela is TelaLiberavel {
  return (TELAS_DISPONIVEIS as readonly string[]).includes(tela);
}

@Injectable()
export class PlayerTelasService {
  constructor(
    @InjectModel(PlayerTelaModel)
    private readonly modeloPlayerTela: typeof PlayerTelaModel,
    @InjectModel(PersonagemModel)
    private readonly modeloPersonagem: typeof PersonagemModel,
  ) {}

  listarDisponiveis(): readonly TelaLiberavel[] {
    return TELAS_DISPONIVEIS;
  }

  /**
   * O que o próprio jogador enxerga. O mestre recebe todas as telas — ele não
   * tem restrição — e por isso nem consulta a tabela.
   *
   * A versão anterior autenticava mas não conferia de quem era o personagem:
   * qualquer jogador logado podia passar um characterId alheio e descobrir o
   * que o mestre liberou para os outros.
   */
  async listarDoPersonagem(
    personagemId: number,
    usuario: UsuarioAutenticado,
  ): Promise<readonly TelaLiberavel[]> {
    if (usuario.tipo === "gm") return TELAS_DISPONIVEIS;

    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }
    garantirAcessoAoPersonagem(personagem, usuario);

    return this.buscarTelas(personagemId);
  }

  async listarParaMestre(personagemId: number): Promise<TelaLiberavel[]> {
    return this.buscarTelas(personagemId);
  }

  /**
   * Substitui o conjunto inteiro: apaga o que havia e grava o que veio.
   * Telas desconhecidas são descartadas em silêncio, como antes.
   */
  async definirTelas(personagemId: number, telas: string[]): Promise<TelaLiberavel[]> {
    const personagem = await this.modeloPersonagem.findByPk(personagemId);
    if (!personagem) {
      throw new NotFoundException("Personagem não encontrado.");
    }

    const telasValidas = [...new Set(telas.filter(ehTelaConhecida))];

    await this.modeloPlayerTela.destroy({ where: { characterId: personagemId } });

    for (const tela of telasValidas) {
      await this.modeloPlayerTela.create({ characterId: personagemId, tela });
    }

    return telasValidas;
  }

  private async buscarTelas(personagemId: number): Promise<TelaLiberavel[]> {
    const encontradas = await this.modeloPlayerTela.findAll({
      where: { characterId: personagemId },
      order: [["tela", "ASC"]],
    });

    return encontradas.map((registro) => registro.tela).filter(ehTelaConhecida);
  }
}

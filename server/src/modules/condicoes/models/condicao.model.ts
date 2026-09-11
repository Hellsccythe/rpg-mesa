import { Column, DataType, Model, Table } from "sequelize-typescript";

export const CATEGORIAS_CONDICAO = ["Física", "Mental", "Mágica", "Doença", "Alquímica"] as const;
export type CategoriaCondicao = (typeof CATEGORIAS_CONDICAO)[number];

/**
 * O que dá errado com um personagem.
 *
 * Não é "a lista do que as poções curam": quem inflige condição é skill,
 * veneno, armadilha e monstro, e a poção é só uma das respostas — ao lado da
 * perícia Medicina e do tempo. Modelar a partir das poções produziria uma
 * lista que serve poção e mais nada, e o combate acabaria com a própria.
 *
 * A gravidade É a raridade da cura: `raridadeItem` aponta para a mesma escala
 * dos itens, e a `dificuldade_base` dela já era a DC do teste de Alquimia.
 */
@Table({ tableName: "condicoes", timestamps: true, paranoid: true })
export class CondicaoModel extends Model {
  @Column(DataType.STRING(100))
  declare nome: string;

  @Column(DataType.TEXT)
  declare descricao: string;

  @Column(DataType.TEXT)
  declare efeito: string;

  @Column(DataType.STRING(20))
  declare categoria: CategoriaCondicao;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare raridadeItem: number | null;

  @Column(DataType.STRING(60))
  declare duracao: string;

  /**
   * Por quanto tempo a CURA ainda funciona. Nulo = sem prazo.
   *
   * Existe por causa de cegueira e surdez: cicatrizadas, nenhuma poção
   * alcança. Isso dá prazo narrativo — há uma janela para agir, e passada
   * ela a perda é real, e não uma ida à loja.
   */
  @Column({ type: DataType.STRING(60), allowNull: true })
  declare janelaDeCura: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare seNaoTratada: string | null;

  /** Sangramento de duas fontes soma; Cegueira não. */
  @Column(DataType.BOOLEAN)
  declare acumulativa: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * A escala de raridade, única para equipamentos, consumíveis e itens: uma
 * poção Rara e uma espada Rara são igualmente difíceis de achar. Escala
 * comum permite comparar entre categorias — o mercador de uma cidade grande
 * estoca Incomum para baixo, seja lá o que for.
 *
 * A chave é `item` para seguir a convenção das tabelas de lookup do projeto,
 * mas aqui ela é IDENTITY de verdade: o banco gera. As outras lookups
 * escolhem a chave na mão com MAX(item)+1, o que gasta duas idas ao banco por
 * inserção e deixa a sequence parada — foi o que causou a migration 067.
 */
@Table({ tableName: "raridade", timestamps: true, paranoid: true })
export class RaridadeModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column(DataType.STRING(100))
  declare descricao: string;

  /**
   * A posição na escala, separada da chave de propósito. `item` é chave
   * técnica: uma raridade nova entre Raro e Épico receberia o item 6 e
   * ordenar por ele a jogaria para o fim da lista.
   */
  @Column(DataType.INTEGER)
  declare ordem: number;

  /** Quanto o preço-base do item é multiplicado. */
  @Column(DataType.DECIMAL(6, 2))
  declare multiplicadorValor: string;

  /** Dificuldade do teste para fabricar. Nulo em Lendário: o mestre decide. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare dificuldadeBase: number | null;

  /** Onde o item é encontrado à venda, em texto livre. */
  @Column(DataType.TEXT)
  declare disponibilidade: string;

  /** Nome de cor do Tailwind, para o frontend não manter um mapa paralelo. */
  @Column(DataType.STRING(20))
  declare cor: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

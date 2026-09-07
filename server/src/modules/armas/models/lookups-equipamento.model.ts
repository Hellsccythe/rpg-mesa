import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * As quatro tabelas de apoio dos equipamentos. Todas usam `item` como chave
 * primária em vez de `id`, com sequence própria no banco.
 *
 * A versão anterior calculava o próximo item com MAX(item)+1 numa consulta
 * separada, ignorando a sequence. Além de duas idas ao banco por inserção,
 * duas criações simultâneas escolheriam o mesmo número — e a sequence nunca
 * avançava, então qualquer insert que confiasse no default colidiria. Aqui o
 * autoIncrement deixa o próprio Postgres resolver.
 */

/** Categoria é o nível de cima: "Armadura", "Armas", "Cura"... */
@Table({ tableName: "categoria_equipamento", timestamps: true, paranoid: true })
export class CategoriaEquipamentoModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.STRING(100), allowNull: true })
  declare icone: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

/** Classe é uma dimensão à parte: "Simples", "Marcial", "Couro"... */
@Table({ tableName: "classe_equipamento", timestamps: true, paranoid: true })
export class ClasseEquipamentoModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

/**
 * Tipo pende de categoria (categoria_item), não de classe. As duas tabelas
 * abaixo também têm uma coluna classe_item, herdada da modelagem original,
 * que está vazia em todas as linhas e nenhum código lê ou escreve — por isso
 * não é mapeada aqui.
 */
@Table({ tableName: "tipo_equipamento", timestamps: true, paranoid: true })
export class TipoEquipamentoModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaItem: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

/** Propriedade pende de categoria, igual a tipo. */
@Table({ tableName: "propriedade_equipamento", timestamps: true, paranoid: true })
export class PropriedadeEquipamentoModel extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  declare item: number;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare descricao: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaItem: number | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

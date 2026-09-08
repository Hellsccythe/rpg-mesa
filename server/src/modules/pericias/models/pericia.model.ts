import { Column, DataType, Model, Table } from "sequelize-typescript";

export const ATRIBUTOS = ["aura", "forca", "destreza", "resistencia", "inteligencia"] as const;
export type Atributo = (typeof ATRIBUTOS)[number];

export const CATEGORIAS_PERICIA = ["Ofício", "Social", "Corpo", "Saber"] as const;
export type CategoriaPericia = (typeof CATEGORIAS_PERICIA)[number];

/** Rank máximo. Com custo crescente, chegar lá custa 1+2+3+4+5 = 15 pontos. */
export const RANK_MAXIMO = 5;

/**
 * Perícia mundana — a terceira trilha de progressão, ao lado do nível de
 * personagem (que dá atributo) e do nível de classe (que dá skill).
 *
 * Teste: `d20 + rank × 3 + ⌊atributo_base ÷ 2⌋` contra a dificuldade.
 *
 * O atributo entra pela metade de propósito. Com 10 pontos no onboarding mais
 * o bônus do passado, um atributo focado chega a 13 e engoliria o rank;
 * dividido, o rank (até +15) domina — que é o certo para uma perícia.
 *
 * Rank 0 é "não treinado" e **não pode tentar**. Sem isso, quem tem
 * Inteligência alta fabrica poções sem nunca ter estudado alquimia.
 */
@Table({ tableName: "pericias", timestamps: true, paranoid: true })
export class PericiaModel extends Model {
  @Column(DataType.STRING(100))
  declare nome: string;

  @Column(DataType.TEXT)
  declare descricao: string;

  @Column(DataType.STRING(20))
  declare atributoBase: Atributo;

  @Column(DataType.STRING(20))
  declare categoria: CategoriaPericia;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

/**
 * Custo em pontos para SUBIR até o rank informado. Crescente para que
 * especialista e generalista sejam escolhas com peso: rank 5 numa perícia
 * custa 15 pontos; rank 1 em cinco perícias custa 5.
 */
export function custoDoRank(rank: number): number {
  return rank;
}

/** Custo acumulado de sair do zero até `rank`. */
export function custoAcumulado(rank: number): number {
  let total = 0;
  for (let nivel = 1; nivel <= rank; nivel += 1) total += custoDoRank(nivel);
  return total;
}

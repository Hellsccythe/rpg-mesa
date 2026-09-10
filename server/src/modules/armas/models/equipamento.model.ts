import { Column, DataType, Model, Table } from "sequelize-typescript";

/**
 * A tabela se chama "equipamentos" (era "armas"), e guarda armas, armaduras e
 * itens variados.
 *
 * Atenção à assimetria das referências, que é fácil de inverter: categoria é
 * UMA (coluna integer), enquanto classe, tipo e propriedade são LISTAS
 * (integer[] NOT NULL com default '{}'). O CLAUDE.md descrevia o contrário
 * até esta migração.
 */
@Table({ tableName: "equipamentos", timestamps: true, paranoid: true })
export class EquipamentoModel extends Model {
  @Column({ type: DataType.STRING(255), allowNull: false })
  declare nome: string;

  /**
   * Só a notação do dado, ex: "1d8". NOT NULL no banco — vazio vira "".
   *
   * Até a migration 087 esta coluna guardava cinco coisas ao mesmo tempo
   * ("1d10/x3", "1d8/1d6", "1d6 Mágico", "10 Físico"). Cada uma delas tem
   * coluna própria agora; não volte a empilhar significado aqui.
   */
  @Column({ type: DataType.STRING(60), allowNull: false, defaultValue: "" })
  declare dano: string;

  /** O segundo dado dos machados (1d8/1d6). O que ele significa ainda não foi decidido. */
  @Column({ type: DataType.STRING(20), allowNull: true })
  declare danoAlternativo: string | null;

  /** Quanto o dano é multiplicado no crítico (3 = x3). NULL usa o padrão do sistema. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare multiplicadorCritico: number | null;

  /** Referência a `skill_tipo_dano.item` — a mesma escala das skills, de propósito. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare tipoDanoItem: number | null;

  /** Quanto a armadura absorve. É o alvo de "Golpe que Atravessa" (Luta rank 5). */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare defesaFisica: number | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare defesaMagica: number | null;

  /** Referência a `pericias.id` — sempre uma do grupo Virtude (Luta, Pontaria, Magia). */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare periciaId: number | null;

  /** Metros até onde o dado sai cheio. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare alcanceIdeal: number | null;

  /** Metros até onde ainda dá para atacar, com o dado um passo abaixo. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare alcanceMaximo: number | null;

  /** Referência a `raridade.item`. Existe desde a migration 074. */
  @Column({ type: DataType.INTEGER, allowNull: true })
  declare raridadeItem: number | null;

  @Column({ type: DataType.DECIMAL(8, 2), allowNull: true })
  declare peso: string | number | null;

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  declare valor: string | number | null;

  @Column({ type: DataType.STRING(500), allowNull: true })
  declare descricaoEquipamento: string | null;

  @Column({ type: DataType.STRING(300), allowNull: true })
  declare preRequisitos: string | null;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare categoriaEquipamentoItem: number | null;

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare classeEquipamentoItem: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare tipoEquipamentoItem: number[];

  @Column({ type: DataType.ARRAY(DataType.INTEGER), defaultValue: [] })
  declare propriedadeEquipamentoItem: number[];

  @Column({ type: DataType.TEXT, allowNull: true })
  declare createdBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare updatedBy: string | null;

  @Column({ type: DataType.TEXT, allowNull: true })
  declare deletedBy: string | null;
}

// ── A regra do dado fora da faixa ───────────────────────────────────────────
// Espelhada em `client/src/lib/api/armas.api.ts` — mesmo arranjo do teste de
// perícia, que vive nos dois lados. Se mudar aqui, mude lá.

/**
 * A escada de dados de dano do sistema. Gravada também em `regras_do_sistema`
 * (`arma.escada_de_dados`), para a mesa poder consultar sem abrir o código.
 */
export const ESCADA_DE_DADOS = ["1d4", "1d6", "1d8", "1d10", "1d12"] as const;

/**
 * Desce um passo na escada — o que acontece quando o alvo está entre
 * `alcance_ideal` e `alcance_maximo`.
 *
 * 1d4 é o piso e devolve 1d4: abaixo dele o ataque não valeria a pena, e
 * inventar 1d3 acrescentaria um degrau que não existe em nenhuma outra parte
 * do sistema. Um dado fora da escada volta inalterado em vez de virar
 * `undefined`.
 */
export function desceUmPasso(dado: string): string {
  const limpo = dado.trim();
  const posicao = ESCADA_DE_DADOS.indexOf(limpo as (typeof ESCADA_DE_DADOS)[number]);
  if (posicao <= 0) return limpo;
  return ESCADA_DE_DADOS[posicao - 1];
}

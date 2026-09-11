/**
 * O inventário estruturado do personagem, em `characters.data.inventario`.
 *
 * Substitui três coisas que eram texto livre ou parciais: `inventory`,
 * `quickInventory` (vira o flag `rapido`) e `equipamentos_iniciais` (o
 * onboarding passa a gravar aqui). Nenhum personagem tinha dado em nenhum dos
 * três quando isto entrou, então não houve conversão.
 *
 * É o modelo que o site E o aplicativo futuro leem. Nome, peso e valor nunca
 * são copiados para cá: vêm do catálogo na hora de mostrar, como
 * `data.pericias` guarda o id e lê o resto.
 */

/** Os três catálogos de onde um item pode vir. O mesmo par tabela+id de `receitas`. */
export const TABELAS_DE_INVENTARIO = ["itens", "consumiveis", "equipamentos"] as const;
export type TabelaDeInventario = (typeof TABELAS_DE_INVENTARIO)[number];

/**
 * Só o que foi fabricado tem qualidade. O que foi comprado é `null` e vale
 * como bem feito. Os quatro resultados da escada estão em docs/FABRICAR.pdf;
 * `desastre` não produz item e por isso não aparece aqui.
 */
export const QUALIDADES = ["malfeito", "bemfeito", "obra_prima"] as const;
export type Qualidade = (typeof QUALIDADES)[number];

export type EntradaDeInventario = {
  tabela: TabelaDeInventario;
  id: number;
  quantidade: number;
  qualidade: Qualidade | null;
  /** Na mochila rápida: à mão em combate. */
  rapido: boolean;
  /** Vestido ou empunhado. É de onde armadura, arma e roupa serão lidas. */
  equipado: boolean;
};

/** A entrada enriquecida com o que o catálogo sabe. É o que a API devolve. */
export type EntradaDeInventarioApi = EntradaDeInventario & {
  nome: string;
  /** Peso unitário em kg, do catálogo. Nulo se o catálogo não informar. */
  peso: number | null;
  valor: number | null;
  /** Categoria legível — "Poção", "Ingrediente", "Armas"... — para agrupar na tela. */
  categoria: string | null;
  /** O item foi apagado do catálogo depois de entrar no inventário. */
  orfao: boolean;
};

export type InventarioApi = {
  entradas: EntradaDeInventarioApi[];
  /** Soma de peso × quantidade de tudo, em kg. */
  peso_total: number;
  /** `2 + força × 2`, a regra do onboarding. */
  peso_maximo: number;
};

/** Duas entradas são "o mesmo item" se casam nos quatro campos que definem uma pilha. */
export function mesmaPilha(a: EntradaDeInventario, b: EntradaDeInventario): boolean {
  return a.tabela === b.tabela && a.id === b.id && a.qualidade === b.qualidade
    && a.rapido === b.rapido && a.equipado === b.equipado;
}

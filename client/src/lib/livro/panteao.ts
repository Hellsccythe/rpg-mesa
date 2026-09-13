import type { GodApi } from '@/types/api'
import type { AlignmentType, BookGod, BookPage } from '@/types/book'

/**
 * O Panteão é um livro GERADO dos deuses do mundo — antes eram 21 deuses
 * escritos no código do cliente, e todo mundo novo nascia com o panteão de
 * Elyra na prateleira. Agora um mundo sem deuses não tem Panteão, e o que
 * o mestre cadastra em /master/deuses é o que o jogador lê aqui.
 *
 * O livro: capa com o índice por alinhamento, depois os deuses de dois em
 * dois, agrupados em bons, neutros e malignos, com um cabeçalho na primeira
 * página de cada grupo. O índice salta por número de página.
 */

const DEUSES_POR_PAGINA = 2

const ROTULO_DA_INDOLE: Record<string, string> = {
  bom: 'Bom',
  'neutro-bom': 'Neutro e Bom',
  neutro: 'Neutro',
  'neutro-ruim': 'Neutro e Maligno',
  ruim: 'Maligno',
}

const GRUPOS: Array<{ tipo: AlignmentType; cabecalho: string }> = [
  { tipo: 'bom', cabecalho: '✦ Deuses do Bem ✦' },
  { tipo: 'neutro', cabecalho: '✦ Deuses Neutros ✦' },
  { tipo: 'maligno', cabecalho: '✦ Deuses Malignos ✦' },
]

/**
 * As cinco índoles do sistema caem em três alas do livro: só o Bom puro é
 * "do Bem" e só o Ruim puro é "Maligno"; os neutros de qualquer tendência
 * ficam juntos — é como o livro original de Elyra dividia (6 / 9 / 6).
 */
function alaDaIndole(codigo: string | null | undefined): AlignmentType {
  const valor = (codigo ?? '').toLowerCase()
  if (valor === 'bom') return 'bom'
  if (valor === 'ruim') return 'maligno'
  return 'neutro'
}

function deusDoLivro(deus: GodApi): BookGod {
  return {
    name: deus.name,
    epithet: deus.title || '',
    description: deus.description || deus.shortDescription || '',
    alignment: ROTULO_DA_INDOLE[(deus.indole ?? '').toLowerCase()] ?? 'Neutro',
    alignmentType: alaDaIndole(deus.indole),
    anatema: deus.anatema || 'Não informado.',
    dogma: deus.dogma || 'Não informado.',
    armas: deus.weapons || 'Não informado.',
  }
}

export interface LivroDoPanteao {
  paginas: BookPage[]
  /** Nome → número da página (1-based) em que o deus aparece. */
  mapaDePaginas: Record<string, number>
}

export function montarLivroDoPanteao(deuses: GodApi[], nomeDoMundo: string): LivroDoPanteao {
  const ordenados = [...deuses]
    .filter((deus) => deus.name?.trim())
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))

  const paginas: BookPage[] = []
  const indice: Record<AlignmentType, string[]> = { bom: [], neutro: [], maligno: [] }
  let numero = 2 // a página 1 é a capa

  for (const grupo of GRUPOS) {
    const doGrupo = ordenados.filter((deus) => alaDaIndole(deus.indole) === grupo.tipo)
    indice[grupo.tipo] = doGrupo.map((deus) => deus.name)
    for (let inicio = 0; inicio < doGrupo.length; inicio += DEUSES_POR_PAGINA) {
      paginas.push({
        pageNumber: numero++,
        type: 'gods',
        sectionHeader: inicio === 0 ? grupo.cabecalho : undefined,
        sectionType: grupo.tipo,
        gods: doGrupo.slice(inicio, inicio + DEUSES_POR_PAGINA).map(deusDoLivro),
      })
    }
  }

  const mapaDePaginas: Record<string, number> = Object.fromEntries(
    paginas.flatMap((pagina) => pagina.gods.map((deus) => [deus.name, pagina.pageNumber])),
  )

  const capa: BookPage = {
    pageNumber: 1,
    type: 'cover',
    gods: [],
    noteTitle: `Panteão de ${nomeDoMundo}`,
    noteSubtitle: 'Conhecimento Comum dos Mortais',
    indice,
    mapaDePaginas,
  }

  return { paginas: [capa, ...paginas], mapaDePaginas }
}

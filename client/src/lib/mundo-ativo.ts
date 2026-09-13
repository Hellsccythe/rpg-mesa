/**
 * O mundo (campanha) em que o cliente está, guardado no navegador.
 *
 * Fica fora da store de propósito: o interceptor do axios lê daqui a cada
 * requisição para mandar o header X-Campanha, e o axios é importado antes
 * do Pinia existir. A store de mundo (`stores/mundo.ts`) é quem escreve.
 *
 * Para o mestre é a escolha do seletor; para o jogador é o mundo em que
 * logou (/mundo/:slug). O servidor só confia nele quando não há personagem
 * na requisição — o personagem manda (docs/MUNDOS.md).
 */
export interface MundoAtivo {
  id: number
  numero: number
  slug: string
  name: string
}

const CHAVE = 'rpg-mesa.mundo-ativo'

export function lerMundoAtivoLocal(): MundoAtivo | null {
  try {
    const bruto = window.localStorage.getItem(CHAVE)
    if (!bruto) return null
    const valor = JSON.parse(bruto) as Partial<MundoAtivo>
    if (typeof valor.id !== 'number' || typeof valor.slug !== 'string') return null
    return { id: valor.id, numero: Number(valor.numero ?? 0), slug: valor.slug, name: String(valor.name ?? '') }
  } catch {
    return null
  }
}

export function gravarMundoAtivoLocal(mundo: MundoAtivo | null): void {
  try {
    if (mundo) window.localStorage.setItem(CHAVE, JSON.stringify(mundo))
    else window.localStorage.removeItem(CHAVE)
  } catch {
    // navegador sem storage: o header simplesmente não vai
  }
}

/** "Mundo 2 — Elyra": o jeito de falar de um mundo em toda tela. */
export function rotuloDoMundo(mundo: { numero: number; name: string }): string {
  return `Mundo ${mundo.numero} — ${mundo.name}`
}

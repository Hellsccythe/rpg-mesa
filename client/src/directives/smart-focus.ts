import smartcrop from 'smartcrop'
import type { Directive } from 'vue'

async function apply(el: HTMLImageElement) {
  try {
    const containerW = el.clientWidth || el.parentElement?.clientWidth || 300
    const containerH = el.clientHeight || el.parentElement?.clientHeight || 400
    const nW = el.naturalWidth
    const nH = el.naturalHeight
    if (!nW || !nH || !containerW || !containerH) return

    const result = await smartcrop.crop(el, { width: containerW, height: containerH })
    const { x, y, width, height } = result.topCrop

    const scale = Math.max(containerW / nW, containerH / nH)
    const cx = (x + width / 2) * scale
    const cy = (y + height / 2) * scale
    const overflowX = Math.max(0, nW * scale - containerW)
    const overflowY = Math.max(0, nH * scale - containerH)

    const xPct = overflowX > 0 ? Math.round(Math.max(0, Math.min(100, (cx - containerW / 2) / overflowX * 100))) : 50
    const yPct = overflowY > 0 ? Math.round(Math.max(0, Math.min(100, (cy - containerH / 2) / overflowY * 100))) : 50

    el.style.objectPosition = `${xPct}% ${yPct}%`
  } catch {
    // fallback: keep whatever CSS was already set
  }
}

export const vSmartFocus: Directive<HTMLImageElement> = {
  mounted(el) {
    if (!el.hasAttribute('crossorigin')) el.setAttribute('crossorigin', 'anonymous')
    if (el.complete && el.naturalWidth > 0) {
      apply(el)
    } else {
      el.addEventListener('load', () => apply(el), { once: true })
    }
  },
}

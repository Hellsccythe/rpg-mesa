import { ref } from 'vue'
import smartcrop from 'smartcrop'

const FALLBACK = 'center 20%'

async function calcSmartPosition(img: HTMLImageElement): Promise<string> {
  try {
    const containerW = img.clientWidth || 400
    const containerH = img.clientHeight || 300

    const result = await smartcrop.crop(img, { width: containerW, height: containerH })
    const { x, y, width, height } = result.topCrop

    const nW = img.naturalWidth
    const nH = img.naturalHeight
    if (!nW || !nH) return FALLBACK

    const scale = Math.max(containerW / nW, containerH / nH)
    const centerX = x + width / 2
    const centerY = y + height / 2

    const scaledCX = centerX * scale
    const scaledCY = centerY * scale
    const overflowX = Math.max(0, nW * scale - containerW)
    const overflowY = Math.max(0, nH * scale - containerH)

    const xPct = overflowX > 0 ? (scaledCX - containerW / 2) / overflowX * 100 : 50
    const yPct = overflowY > 0 ? (scaledCY - containerH / 2) / overflowY * 100 : 50

    const x_ = Math.round(Math.max(0, Math.min(100, xPct)))
    const y_ = Math.round(Math.max(0, Math.min(100, yPct)))
    return `${x_}% ${y_}%`
  } catch {
    return FALLBACK
  }
}

export function useSmartImageFocus() {
  const position = ref(FALLBACK)
  const analyzing = ref(false)

  async function analyzeImage(img: HTMLImageElement | null) {
    if (!img) return
    analyzing.value = true
    try {
      if (!img.complete || img.naturalWidth === 0) {
        await new Promise<void>((resolve, reject) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => reject(), { once: true })
        })
      }
      position.value = await calcSmartPosition(img)
    } catch {
      position.value = FALLBACK
    } finally {
      analyzing.value = false
    }
  }

  function reset() {
    position.value = FALLBACK
  }

  return { position, analyzing, analyzeImage, reset }
}

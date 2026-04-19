import { ref } from 'vue'

const FALLBACK = 'center 20%'

async function calcFacePosition(img: HTMLImageElement): Promise<string> {
  if (!('FaceDetector' in window)) return FALLBACK

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const detector = new (window as any).FaceDetector({ fastMode: true, maxDetectedFaces: 1 })
    const faces = await detector.detect(img)

    if (!faces.length) return FALLBACK

    const { x, y, width, height } = faces[0].boundingBox
    const cx = x + width / 2
    const cy = y + height / 2

    const xPct = Math.min(100, Math.max(0, Math.round((cx / img.naturalWidth) * 100)))
    // Pull y up slightly so chin isn't clipped at the bottom of the frame
    const yPct = Math.min(100, Math.max(0, Math.round(((cy - height * 0.3) / img.naturalHeight) * 100)))

    return `${xPct}% ${yPct}%`
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
      position.value = await calcFacePosition(img)
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

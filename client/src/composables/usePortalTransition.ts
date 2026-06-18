import { reactive } from 'vue'

type Phase = 'idle' | 'expanding' | 'fading'

const state = reactive<{ phase: Phase; ox: number; oy: number }>({
  phase: 'idle',
  ox: 0,
  oy: 0,
})

export function usePortalTransition() {
  function enterPortal(ox: number, oy: number, navigate: () => void) {
    state.ox = ox
    state.oy = oy
    state.phase = 'expanding'

    // Depois que o círculo cobre tela inteira, navega
    setTimeout(() => {
      navigate()
      // Pequeno tick para o novo componente montar antes do fade começar
      setTimeout(() => {
        state.phase = 'fading'
        setTimeout(() => {
          state.phase = 'idle'
        }, 600)
      }, 60)
    }, 650)
  }

  return { state, enterPortal }
}

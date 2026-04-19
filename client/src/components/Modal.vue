<template>
  <div
    class="fixed inset-0 z-[5000] overflow-hidden backdrop-blur-sm modal-shell"
    :class="[computedOverlayClass, computedThemeClass]"
    :data-modal-theme="temaResolvido"
    :style="[computedOverlayStyle, computedForcedThemeVars]"
    @click="handleBackdropClick"
  >
    <div class="box-border flex h-full w-full items-center justify-center px-4 py-6">
      <div
        ref="panelRef"
        role="dialog"
        aria-modal="true"
        class="max-h-full w-full overflow-hidden rounded-3xl border shadow-2xl modal-panel"
        :class="computedPanelClass"
        :data-modal-theme="temaResolvido"
        :style="computedPanelStyle"
      >
        <div
          v-if="$slots.header || title || showCloseButton"
          class="flex items-center justify-between border-b px-6 py-4 modal-header"
          :class="computedHeaderClass"
          :data-modal-theme="temaResolvido"
          :style="computedHeaderStyle"
        >
          <slot name="header">
            <h2
              v-if="title"
              class="text-2xl font-bold"
              :class="computedTitleClass"
              :style="computedTitleStyle"
            >
              {{ title }}
            </h2>
          </slot>

          <button
            v-if="showCloseButton"
            type="button"
            :aria-label="closeLabel"
            class="rounded-xl px-3 py-1 text-2xl transition-colors modal-close-btn"
            :class="computedCloseButtonClass"
            :style="computedCloseButtonStyle"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>

        <div :class="bodyClass">
          <slot />
        </div>

        <div
          v-if="$slots.footer"
          class="border-t px-6 py-4"
          :class="computedFooterClass"
          :style="computedFooterStyle"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

let openModalCount = 0
let originalBodyOverflow = ''
let originalHtmlOverflow = ''

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
  showCloseButton: {
    type: Boolean,
    default: true,
  },
  closeLabel: {
    type: String,
    default: 'Fechar modal',
  },
  closeOnEsc: {
    type: Boolean,
    default: true,
  },
  tema: {
    type: String as () => 'auto' | 'escuro' | 'claro',
    default: 'auto',
  },
  overlayClass: {
    type: [String, Array, Object],
    default: '',
  },
  panelClass: {
    type: [String, Array, Object],
    default: '',
  },
  headerClass: {
    type: [String, Array, Object],
    default: '',
  },
  bodyClass: {
    type: [String, Array, Object],
    default: '',
  },
  footerClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits<{ close: [] }>()
const panelRef = ref<HTMLElement | null>(null)
const temaClaroAtivo = ref(false)
let observadorTema: MutationObserver | null = null

const FOCUSABLE = 'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
let previouslyFocused: HTMLElement | null = null

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  const panel = panelRef.value
  if (!panel) return
  const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) => el.offsetParent !== null,
  )
  if (!nodes.length) return
  const first = nodes[0]
  const last = nodes[nodes.length - 1]
  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault()
      last.focus()
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }
}

function sincronizarTemaHtml() {
  const html = document.documentElement
  const body = document.body

  const htmlTema = html.dataset.theme
  const bodyTema = body?.dataset.theme
  const htmlClasses = html.classList
  const bodyClasses = body?.classList

  const temLightExplicito =
    htmlTema === 'light' ||
    bodyTema === 'light' ||
    htmlClasses.contains('theme-light') ||
    !!bodyClasses?.contains('theme-light')

  const temDarkExplicito =
    htmlTema === 'dark' ||
    bodyTema === 'dark' ||
    htmlClasses.contains('theme-dark') ||
    !!bodyClasses?.contains('theme-dark')

  if (temLightExplicito) {
    temaClaroAtivo.value = true
    return
  }

  if (temDarkExplicito) {
    temaClaroAtivo.value = false
    return
  }

  const temaSalvo = localStorage.getItem('ui-theme')
  if (temaSalvo === 'light') {
    temaClaroAtivo.value = true
    return
  }

  if (temaSalvo === 'dark') {
    temaClaroAtivo.value = false
    return
  }

  temaClaroAtivo.value = window.matchMedia('(prefers-color-scheme: light)').matches
}

const temaResolvido = computed<'claro' | 'escuro'>(() => {
  if (props.tema === 'claro') return 'claro'
  if (props.tema === 'escuro') return 'escuro'
  return temaClaroAtivo.value ? 'claro' : 'escuro'
})

const computedThemeClass = computed(() =>
  temaResolvido.value === 'claro' ? 'modal-theme-light' : 'modal-theme-dark',
)

const computedForcedThemeVars = computed(() => {
  if (props.tema === 'claro') {
    return {
      '--modal-bg-card': '#ffffff',
      '--modal-text-main': '#0f172a',
      '--modal-border-soft': '#dbe3f1',
      '--modal-text-muted': '#475569',
      '--modal-close-hover-bg': '#e2e8f0',
      '--modal-close-hover-text': '#0f172a',
      '--modal-overlay': 'rgb(15 23 42 / 0.45)',
      '--modal-shadow': '0 24px 60px rgb(15 23 42 / 0.22)',
    }
  }

  if (props.tema === 'escuro') {
    return {
      '--modal-bg-card': '#111a2d',
      '--modal-text-main': '#e2e8f0',
      '--modal-border-soft': '#334155',
      '--modal-text-muted': '#94a3b8',
      '--modal-close-hover-bg': '#0f172a',
      '--modal-close-hover-text': '#ffffff',
      '--modal-overlay': 'rgb(0 0 0 / 0.8)',
      '--modal-shadow': '0 24px 60px rgb(0 0 0 / 0.65)',
    }
  }

  return {}
})

const computedOverlayClass = computed(() => [props.overlayClass])

const computedOverlayStyle = computed(() => ({
  backgroundColor: 'var(--modal-overlay, rgb(2 6 23 / 0.68))',
}))

const computedPanelClass = computed(() => [props.panelClass])

const computedPanelStyle = computed(() => ({
  borderColor: 'var(--modal-border-soft, var(--border-soft))',
  backgroundColor: 'var(--modal-bg-card, var(--bg-card))',
  color: 'var(--modal-text-main, var(--text-main))',
  boxShadow: 'var(--modal-shadow, 0 24px 60px rgb(2 6 23 / 0.45))',
}))

const computedHeaderClass = computed(() => [props.headerClass])

const computedHeaderStyle = computed(() => ({
  borderBottomColor: 'var(--modal-border-soft, var(--border-soft))',
}))

const computedTitleClass = computed(() => [])

const computedTitleStyle = computed(() => ({
  color: 'var(--modal-text-main, var(--text-main))',
}))

const computedCloseButtonClass = computed(() => [])

const computedCloseButtonStyle = computed(() => ({
  color: 'var(--modal-text-muted, var(--text-muted))',
  '--modal-close-hover-bg': 'var(--modal-close-hover-bg, var(--accent-soft))',
  '--modal-close-hover-text': 'var(--modal-close-hover-text, var(--text-main))',
}))

const computedFooterClass = computed(() => [props.footerClass])

const computedFooterStyle = computed(() => ({
  borderTopColor: 'var(--modal-border-soft, var(--border-soft))',
}))

function handleBackdropClick(event: MouseEvent) {
  const target = event.target as Node | null
  if (target && panelRef.value?.contains(target)) return

  if (props.closeOnBackdrop) {
    emit('close')
  }
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (!props.closeOnEsc) return
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  sincronizarTemaHtml()
  observadorTema = new MutationObserver(sincronizarTemaHtml)
  observadorTema.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  })

  if (document.body) {
    observadorTema.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
  }

  if (openModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow
    originalHtmlOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }

  openModalCount += 1
  window.addEventListener('keydown', handleWindowKeydown)
  window.addEventListener('keydown', trapFocus)

  previouslyFocused = document.activeElement as HTMLElement
  nextTick(() => {
    const panel = panelRef.value
    if (!panel) return
    const first = panel.querySelector<HTMLElement>(FOCUSABLE)
    first?.focus()
  })
})

onBeforeUnmount(() => {
  observadorTema?.disconnect()
  observadorTema = null

  openModalCount = Math.max(0, openModalCount - 1)
  if (openModalCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow
    document.body.style.overflow = originalBodyOverflow
  }

  window.removeEventListener('keydown', handleWindowKeydown)
  window.removeEventListener('keydown', trapFocus)
  previouslyFocused?.focus()
})
</script>

<style scoped>
.modal-close-btn:hover {
  background-color: var(--modal-close-hover-bg);
  color: var(--modal-close-hover-text);
}
</style>

<template>
  <div
    class="fixed inset-0 z-[5000] overflow-hidden bg-black/80 backdrop-blur-sm"
    :class="overlayClass"
    @click="handleBackdropClick"
  >
    <div class="box-border flex h-full w-full items-center justify-center px-4 py-6">
      <div
        ref="panelRef"
        class="max-h-full w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
        :class="panelClass"
      >
        <div
          v-if="$slots.header || title || showCloseButton"
          class="flex items-center justify-between border-b border-zinc-800 px-6 py-4"
          :class="headerClass"
        >
          <slot name="header">
            <h2 v-if="title" class="text-2xl font-bold text-white">{{ title }}</h2>
          </slot>

          <button
            v-if="showCloseButton"
            type="button"
            :aria-label="closeLabel"
            class="rounded-xl px-3 py-1 text-2xl text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-white"
            @click="$emit('close')"
          >
            ×
          </button>
        </div>

        <div :class="bodyClass">
          <slot />
        </div>

        <div v-if="$slots.footer" class="border-t border-zinc-800 px-6 py-4" :class="footerClass">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

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
  if (openModalCount === 0) {
    originalBodyOverflow = document.body.style.overflow
    originalHtmlOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
  }

  openModalCount += 1
  window.addEventListener('keydown', handleWindowKeydown)
})

onBeforeUnmount(() => {
  openModalCount = Math.max(0, openModalCount - 1)
  if (openModalCount === 0) {
    document.documentElement.style.overflow = originalHtmlOverflow
    document.body.style.overflow = originalBodyOverflow
  }

  window.removeEventListener('keydown', handleWindowKeydown)
})
</script>

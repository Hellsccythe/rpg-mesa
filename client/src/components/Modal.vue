<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm"
    :class="overlayClass"
    @click.self="handleBackdropClick"
  >
    <div
      class="w-full overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-2xl"
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
</template>

<script setup lang="ts">
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

function handleBackdropClick() {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}
</script>

<template>
  <div ref="rootRef" class="v-select" :class="[{ 'is-open': isOpen, 'is-disabled': disabled }, rootClass]">
    <button
      type="button"
      class="v-select-trigger"
      :class="triggerClass"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="v-select-label" :class="{ 'is-placeholder': !selectedLabels }">
        {{ selectedLabels ?? placeholder }}
      </span>
      <span class="v-select-caret" aria-hidden="true">˅</span>
    </button>

    <transition name="v-select-fade">
      <ul v-if="isOpen" class="v-select-menu" role="listbox">
        <li v-for="option in options" :key="String(option.value)">
          <button
            type="button"
            role="option"
            class="v-select-option"
            :class="[optionClass, { 'is-selected': isSelected(option) }]"
            :aria-selected="isSelected(option)"
            @click.stop="toggleOption(option)"
          >
            <span class="v-select-checkbox" :class="{ 'is-checked': isSelected(option) }">
              <svg v-if="isSelected(option)" class="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="2 6 5 9 10 3"/>
              </svg>
            </span>
            {{ option.label }}
          </button>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type SelectValue = string | number

interface SelectOption {
  value: SelectValue
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: SelectValue[]
    options: SelectOption[]
    placeholder?: string
    disabled?: boolean
    rootClass?: string
    triggerClass?: string
    menuClass?: string
    optionClass?: string
  }>(),
  {
    placeholder: 'Selecione',
    disabled: false,
    rootClass: '',
    triggerClass: '',
    menuClass: '',
    optionClass: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectValue[]): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedLabels = computed(() => {
  const selected = props.options.filter(o => props.modelValue.includes(o.value))
  if (!selected.length) return null
  if (selected.length === 1) return selected[0].label
  return `${selected.length} selecionado(s)`
})

const isSelected = (option: SelectOption) => props.modelValue.includes(option.value)

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const toggleOption = (option: SelectOption) => {
  if (option.disabled) return
  const current = [...props.modelValue]
  const idx = current.indexOf(option.value)
  if (idx === -1) current.push(option.value)
  else current.splice(idx, 1)
  emit('update:modelValue', current)
}

const handleWindowClick = (event: MouseEvent) => {
  if (!isOpen.value) return
  if (!(event.target instanceof Node)) return
  if (!rootRef.value?.contains(event.target)) isOpen.value = false
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') isOpen.value = false
}

onMounted(() => {
  window.addEventListener('click', handleWindowClick)
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleWindowClick)
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.v-select {
  --v-select-bg: var(--bg-card);
  --v-select-border: var(--border-soft);
  --v-select-text: var(--text-main);
  --v-select-muted: var(--text-muted);
  --v-select-menu-bg: color-mix(in srgb, var(--bg-card) 94%, #fff 6%);
  --v-select-option-hover: rgb(42 27 74 / 0.28);
  --v-select-option-active: rgb(107 78 158 / 0.3);
  position: relative;
}

.v-select-trigger {
  display: flex; width: 100%; align-items: center; justify-content: space-between; gap: 0.75rem;
  border: 1px solid var(--v-select-border); border-radius: 1rem;
  padding: 0.75rem 1rem; background: var(--v-select-bg);
  color: var(--v-select-text); line-height: 1.2; text-align: left;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.v-select-trigger:hover { border-color: color-mix(in srgb, var(--brand-primary) 70%, #8b5cf6 30%); }
.v-select-trigger:focus-visible { outline: none; border-color: var(--brand-primary); }

.v-select-label { font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.v-select-label.is-placeholder { color: var(--v-select-muted); }

.v-select-caret { color: var(--v-select-muted); font-size: 0.9rem; transition: transform 0.2s ease; flex-shrink: 0; }
.v-select.is-open .v-select-caret { transform: rotate(180deg); }

.v-select-menu {
  position: absolute; z-index: 40; top: calc(100% + 0.4rem); left: 0; width: 100%;
  max-height: 16rem; overflow-y: auto;
  border: 1px solid var(--v-select-border); border-radius: 1rem;
  background: var(--v-select-menu-bg);
  box-shadow: 0 20px 28px rgb(15 23 42 / 0.18);
  padding: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 78, 158, 0.9) rgba(10, 15, 28, 0.75);
}

.v-select-option {
  display: flex; align-items: center; gap: 0.6rem;
  width: 100%; border-radius: 0.7rem; padding: 0.55rem 0.75rem;
  text-align: left; color: var(--v-select-text); font-size: 0.875rem;
  transition: background-color 0.15s ease;
}
.v-select-option:hover { background: var(--v-select-option-hover); }
.v-select-option.is-selected { background: var(--v-select-option-active); }

.v-select-checkbox {
  display: flex; align-items: center; justify-content: center;
  width: 1rem; height: 1rem; flex-shrink: 0;
  border: 1.5px solid rgb(139 92 246 / 0.4); border-radius: 0.3rem;
  background: transparent; color: #a78bfa; transition: background 0.15s, border-color 0.15s;
}
.v-select-checkbox.is-checked {
  background: rgb(109 40 217 / 0.7); border-color: rgb(139 92 246 / 0.8);
}

.v-select-fade-enter-active,
.v-select-fade-leave-active { transition: opacity 0.16s ease, transform 0.16s ease; }
.v-select-fade-enter-from,
.v-select-fade-leave-to { opacity: 0; transform: translateY(-4px); }

:global(html.theme-light) .v-select {
  --v-select-bg: #ffffff; --v-select-border: rgb(107 78 158 / 0.35);
  --v-select-menu-bg: #ffffff;
  --v-select-option-hover: rgb(139 92 246 / 0.24);
  --v-select-option-active: rgb(107 78 158 / 0.3);
}
:global(html.theme-dark) .v-select {
  --v-select-bg: rgb(2 6 23 / 0.6); --v-select-border: rgb(107 78 158 / 0.4);
  --v-select-text: #e2e8f0; --v-select-muted: #cbd5e1;
  --v-select-menu-bg: rgb(15 28 58 / 0.95);
  --v-select-option-hover: rgb(42 27 74 / 0.62);
  --v-select-option-active: rgb(107 78 158 / 0.34);
}
</style>

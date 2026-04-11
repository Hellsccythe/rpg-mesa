<template>
  <div
    ref="rootRef"
    class="v-select"
    :class="[{ 'is-open': isOpen, 'is-disabled': disabled }, rootClass]"
  >
    <button
      :id="id"
      type="button"
      class="v-select-trigger"
      :class="triggerClass"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="v-select-label" :class="{ 'is-placeholder': !selectedOption }">
        {{ selectedOption?.label ?? placeholder }}
      </span>
      <span class="v-select-caret" aria-hidden="true">˅</span>
    </button>

    <transition name="v-select-fade">
      <ul
        v-if="isOpen"
        class="v-select-menu"
        :class="menuClass"
        role="listbox"
        :aria-labelledby="id"
      >
        <li v-for="option in options" :key="String(option.value)">
          <button
            type="button"
            role="option"
            class="v-select-option"
            :class="[
              optionClass,
              { 'is-selected': isSelected(option), 'is-disabled': option.disabled },
            ]"
            :aria-selected="isSelected(option)"
            :disabled="option.disabled"
            @click="selectOption(option)"
          >
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

type SelectOption = {
  value: SelectValue
  label: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    id?: string
    modelValue: SelectValue
    options: SelectOption[]
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
    rootClass?: string
    triggerClass?: string
    menuClass?: string
    optionClass?: string
  }>(),
  {
    id: undefined,
    placeholder: 'Selecione',
    ariaLabel: 'Selecionar opcao',
    disabled: false,
    rootClass: '',
    triggerClass: '',
    menuClass: '',
    optionClass: '',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectValue): void
}>()

const rootRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const selectedOption = computed(() =>
  props.options.find((option) => option.value === props.modelValue),
)

const close = () => {
  isOpen.value = false
}

const toggle = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const isSelected = (option: SelectOption) => option.value === props.modelValue

const selectOption = (option: SelectOption) => {
  if (option.disabled) return
  emit('update:modelValue', option.value)
  close()
}

const handleWindowClick = (event: MouseEvent) => {
  if (!isOpen.value) return
  if (!(event.target instanceof Node)) return
  if (!rootRef.value?.contains(event.target)) {
    close()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
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
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border: 1px solid var(--v-select-border);
  border-radius: 1rem;
  padding: 0.75rem 1rem;
  background: var(--v-select-bg);
  color: var(--v-select-text);
  line-height: 1.2;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.v-select-trigger:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 70%, #8b5cf6 30%);
}

.v-select-trigger:focus-visible {
  outline: none;
  border-color: var(--brand-primary);
}

.v-select-label.is-placeholder {
  color: var(--v-select-muted);
}

.v-select-caret {
  color: var(--v-select-muted);
  font-size: 0.9rem;
  transition: transform 0.2s ease;
}

.v-select.is-open .v-select-caret {
  transform: rotate(180deg);
}

.v-select-menu {
  position: absolute;
  z-index: 40;
  top: calc(100% + 0.4rem);
  left: 0;
  width: 100%;
  max-height: 16rem;
  overflow-y: auto;
  border: 1px solid var(--v-select-border);
  border-radius: 1rem;
  background: var(--v-select-menu-bg);
  box-shadow: 0 20px 28px rgb(15 23 42 / 0.18);
  padding: 0.35rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 78, 158, 0.9) rgba(10, 15, 28, 0.75);
}

.v-select-menu::-webkit-scrollbar {
  width: 10px;
}

.v-select-menu::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(10, 15, 28, 0.95), rgba(26, 36, 56, 0.92));
  border-left: 1px solid rgba(107, 78, 158, 0.18);
}

.v-select-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(200, 208, 224, 0.75), rgba(107, 78, 158, 0.9));
  border-radius: 999px;
  border: 2px solid rgba(26, 36, 56, 0.95);
}

.v-select-menu::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(248, 113, 113, 0.9), rgba(107, 78, 158, 1));
}

.v-select-option {
  width: 100%;
  border-radius: 0.7rem;
  padding: 0.55rem 0.75rem;
  text-align: left;
  color: var(--v-select-text);
  transition: background-color 0.15s ease;
}

.v-select-option:hover {
  background: var(--v-select-option-hover);
}

.v-select-option.is-selected {
  background: var(--v-select-option-active);
}

.v-select-option.is-disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.v-select-fade-enter-active,
.v-select-fade-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.v-select-fade-enter-from,
.v-select-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

:global(html.theme-light) .v-select {
  --v-select-bg: #ffffff;
  --v-select-border: rgb(107 78 158 / 0.35);
  --v-select-menu-bg: #ffffff;
  --v-select-option-hover: rgb(139 92 246 / 0.24);
  --v-select-option-active: rgb(107 78 158 / 0.3);
}

:global(html.theme-light) .v-select-menu {
  scrollbar-color: rgba(107, 78, 158, 0.95) #ffffff;
}

:global(html.theme-light) .v-select-menu::-webkit-scrollbar-track {
  background: #ffffff;
  border-left: 1px solid rgba(148, 163, 184, 0.35);
}

:global(html.theme-light) .v-select-menu::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.78), rgba(107, 78, 158, 0.95));
  border: 2px solid #ffffff;
}

:global(html.theme-dark) .v-select {
  --v-select-bg: rgb(2 6 23 / 0.6);
  --v-select-border: rgb(107 78 158 / 0.4);
  --v-select-text: #e2e8f0;
  --v-select-muted: #cbd5e1;
  --v-select-menu-bg: rgb(15 28 58 / 0.95);
  --v-select-option-hover: rgb(42 27 74 / 0.62);
  --v-select-option-active: rgb(107 78 158 / 0.34);
}
</style>

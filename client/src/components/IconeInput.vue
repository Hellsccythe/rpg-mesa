<template>
  <div class="icone-input-wrap relative" @click.stop>
    <!-- Preview + input -->
    <div class="flex items-center gap-2">
      <div class="icone-preview-box flex shrink-0 items-center justify-center rounded-xl border" style="width:2.75rem;height:2.75rem;">
        <IconeDisplay v-if="modelValue" :icone="modelValue" size="1.5rem" />
        <span v-else class="text-base" style="color:#4b5563">?</span>
      </div>
      <div class="relative flex-1">
        <input
          ref="inputRef"
          :value="modelValue"
          type="text"
          :placeholder="placeholder"
          maxlength="60"
          autocomplete="off"
          class="icone-field w-full rounded-xl border px-3 py-2.5 text-sm outline-none font-mono transition-colors"
          @input="onInput"
          @keydown="onKeydown"
          @focus="onFocus"
          @blur="onBlur"
        />
        <!-- Botão limpar -->
        <button
          v-if="modelValue"
          type="button"
          @mousedown.prevent="$emit('update:modelValue', '')"
          class="icone-clear absolute right-2.5 top-1/2 -translate-y-1/2 text-sm leading-none opacity-50 hover:opacity-100 transition-opacity"
          tabindex="-1"
        >✕</button>
      </div>
    </div>

    <!-- Dropdown de sugestões MDI -->
    <div
      v-if="sugestoes.length > 0 && aberto"
      class="icone-dropdown absolute left-0 top-full z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border shadow-xl"
    >
      <button
        v-for="(icon, i) in sugestoes"
        :key="icon"
        type="button"
        class="icone-dropdown-item flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors"
        :class="{ 'icone-dropdown-item-ativo': i === itemAtivo }"
        @mousedown.prevent="selecionar(icon)"
        @mouseover="itemAtivo = i"
      >
        <i :class="['mdi', 'mdi-' + icon]" class="text-lg leading-none shrink-0" style="width:1.25rem;text-align:center" />
        <span class="font-mono">mdi-{{ icon }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import IconeDisplay from '@/components/IconeDisplay.vue'
import { MDI_ICONS } from '@/lib/mdi-icons'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: 'Emoji 🗡️ ou mdi-sword',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const aberto   = ref(false)
const itemAtivo = ref(0)

// Sugestões filtradas com base no texto digitado
const sugestoes = computed(() => {
  const val = props.modelValue ?? ''

  // Só mostra sugestões MDI quando o campo começa com "mdi"
  if (!val.toLowerCase().startsWith('mdi')) return []

  // Remove o prefixo "mdi-" para filtrar só pelo nome do ícone
  const busca = val.replace(/^mdi-?/i, '').toLowerCase().trim()

  if (!busca) {
    // Digitou apenas "mdi" ou "mdi-" — mostra primeiros 20
    return MDI_ICONS.slice(0, 20) as string[]
  }

  return MDI_ICONS.filter(n => n.includes(busca)).slice(0, 30) as string[]
})

watch(sugestoes, () => { itemAtivo.value = 0 })

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
  aberto.value = true
}

function onFocus() {
  aberto.value = true
}

function onBlur() {
  // Delay para permitir mousedown no dropdown
  setTimeout(() => { aberto.value = false }, 150)
}

function selecionar(icon: string) {
  emit('update:modelValue', 'mdi-' + icon)
  aberto.value = false
  inputRef.value?.focus()
}

function onKeydown(e: KeyboardEvent) {
  if (!aberto.value || sugestoes.value.length === 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    itemAtivo.value = Math.min(itemAtivo.value + 1, sugestoes.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    itemAtivo.value = Math.max(itemAtivo.value - 1, 0)
  } else if (e.key === 'Enter' || e.key === 'Tab') {
    if (sugestoes.value[itemAtivo.value]) {
      e.preventDefault()
      selecionar(sugestoes.value[itemAtivo.value])
    }
  } else if (e.key === 'Escape') {
    aberto.value = false
  }
}
</script>

<style scoped>
.icone-preview-box {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
}

.icone-field {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
  color: #e2e8f0;
}
.icone-field::placeholder { color: #475569; }
.icone-field:focus { border-color: rgb(248 113 113 / 0.5); background: rgb(255 255 255 / 0.06); }

.icone-clear { color: #64748b; }

.icone-dropdown {
  background: #0f172a;
  border-color: rgb(255 255 255 / 0.1);
}

.icone-dropdown-item { color: #cbd5e1; }
.icone-dropdown-item:hover,
.icone-dropdown-item-ativo {
  background: rgb(255 255 255 / 0.06);
  color: #f1f5f9;
}
.icone-dropdown-item-ativo {
  background: rgb(220 38 38 / 0.12);
  color: #fca5a5;
}
.icone-dropdown-item-ativo i { color: #fca5a5; }

/* ── Light mode ─────────────────────────────────────────────────────────── */
:global(html.theme-light) .icone-preview-box { background: #fff; border-color: #e2e8f0; }
:global(html.theme-light) .icone-field { background: #fff; border-color: #e2e8f0; color: #0f172a; }
:global(html.theme-light) .icone-field:focus { border-color: #f87171; box-shadow: 0 0 0 3px rgb(248 113 113 / 0.15); }
:global(html.theme-light) .icone-field::placeholder { color: #94a3b8; }
:global(html.theme-light) .icone-clear { color: #94a3b8; }
:global(html.theme-light) .icone-dropdown { background: #fff; border-color: #e2e8f0; box-shadow: 0 8px 30px rgb(0 0 0 / 0.12); }
:global(html.theme-light) .icone-dropdown-item { color: #1e293b; }
:global(html.theme-light) .icone-dropdown-item:hover,
:global(html.theme-light) .icone-dropdown-item-ativo { background: #f8fafc; color: #0f172a; }
:global(html.theme-light) .icone-dropdown-item-ativo { background: rgb(220 38 38 / 0.07); color: #b91c1c; }
:global(html.theme-light) .icone-dropdown-item-ativo i { color: #dc2626; }
</style>

<template>
  <div
    class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4"
    @click.self="$emit('close')"
  >
    <div
      class="bg-zinc-950 border border-red-900/60 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
    >
      <!-- Cabeçalho com avatar e informações do personagem -->
      <div class="relative h-52 overflow-hidden">
        <img
          v-if="character.avatarUrl"
          :src="character.avatarUrl"
          class="w-full h-full object-cover object-top"
          :alt="character.name"
        />
        <div v-else class="w-full h-full bg-zinc-900 flex items-center justify-center text-8xl">
          🛡️
        </div>

        <div
          class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"
        />

        <div class="absolute bottom-4 left-6 right-14">
          <h2 class="text-2xl font-bold text-white leading-tight">{{ character.name }}</h2>
          <p class="text-red-400 text-sm mt-1">
            Nv. {{ character.level }} • {{ character.classe ?? 'Sem Classe' }}
          </p>
        </div>

        <button
          @click="$emit('close')"
          class="absolute top-4 right-4 w-9 h-9 bg-black/60 hover:bg-red-900/80 text-zinc-300 hover:text-white rounded-full flex items-center justify-center transition-colors text-lg"
        >
          ✕
        </button>
      </div>

      <!-- Formulário de login -->
      <div class="p-8 space-y-5">
        <p class="text-zinc-500 text-sm text-center">
          Insira suas credenciais para entrar como este personagem
        </p>

        <div class="space-y-1">
          <label class="text-sm text-zinc-400 block">E-mail</label>
          <input
            v-model="email"
            type="email"
            autocomplete="email"
            class="w-full bg-zinc-900 border border-red-900/30 focus:border-red-500 rounded-2xl px-5 py-3 text-white outline-none transition-colors"
            placeholder="seu@email.com"
            @keydown.enter="login"
          />
        </div>

        <div class="space-y-1">
          <label class="text-sm text-zinc-400 block">Senha</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            class="w-full bg-zinc-900 border border-red-900/30 focus:border-red-500 rounded-2xl px-5 py-3 text-white outline-none transition-colors"
            placeholder="••••••••"
            @keydown.enter="login"
          />
        </div>

        <p v-if="errorMsg" class="text-red-400 text-sm text-center">{{ errorMsg }}</p>

        <button
          @click="login"
          :disabled="loading"
          class="w-full bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl py-4 transition-colors"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { PersonagemPublicoApi } from '@/types/supabase'

const props = defineProps<{
  character: PersonagemPublicoApi
}>()

defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function login() {
  if (!email.value.trim() || !password.value) {
    errorMsg.value = 'Preencha e-mail e senha'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    await authStore.signIn(email.value.trim(), password.value)
    router.push({ name: 'dashboard', query: { characterId: props.character.characterId } })
  } catch {
    errorMsg.value = 'Credenciais inválidas. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>

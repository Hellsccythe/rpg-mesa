<script setup lang="ts">
/**
 * Modal da troca de senha obrigatória, depois do "Reset Padrão" do mestre.
 *
 * Montado uma vez em App.vue, e não em cada view: a versão anterior vivia
 * copiada no Dashboard e no painel do mestre, e por isso o onboarding — a
 * primeira tela que um jogador resetado vê — nunca a mostrava. Aqui ele
 * aparece em qualquer rota autenticada enquanto o store disser que a troca
 * está pendente, e o único jeito de fechar é trocar a senha.
 */
import { computed, ref } from 'vue'
import Modal from '@/components/Modal.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const novaSenha = ref('')
const confirmacao = ref('')
const mostrar = ref(false)
const salvando = ref(false)
const erro = ref('')

const aberto = computed(() => authStore.estaAutenticado && authStore.precisaTrocarSenha)

const regras = computed(() => [
  { label: 'Mínimo 8 caracteres', ok: novaSenha.value.length >= 8 },
  { label: 'Ao menos uma letra maiúscula', ok: /[A-Z]/.test(novaSenha.value) },
  { label: 'Ao menos um número', ok: /[0-9]/.test(novaSenha.value) },
  { label: 'Ao menos um caractere especial', ok: /[^a-zA-Z0-9]/.test(novaSenha.value) },
  { label: 'Senhas coincidem', ok: novaSenha.value.length > 0 && novaSenha.value === confirmacao.value },
])
const valida = computed(() => regras.value.every((regra) => regra.ok))

async function salvar() {
  if (!valida.value || salvando.value) return
  salvando.value = true
  erro.value = ''
  try {
    await authStore.trocarSenha(novaSenha.value)
    novaSenha.value = ''
    confirmacao.value = ''
  } catch (err: any) {
    erro.value = err?.response?.data?.message ?? err?.message ?? 'Erro ao salvar nova senha.'
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <Modal
    v-if="aberto"
    title="Defina uma Nova Senha"
    tema="escuro"
    panel-class="max-w-sm"
    :close-on-backdrop="false"
    :close-on-esc="false"
    :show-close-button="false"
  >
    <form class="space-y-5 px-6 py-5" @submit.prevent="salvar">
      <p class="text-sm text-zinc-400">Sua senha foi resetada pelo mestre. Defina uma nova senha para continuar.</p>

      <div v-if="erro" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        {{ erro }}
      </div>

      <div class="space-y-1">
        <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400" for="troca-senha-nova">Nova Senha</label>
        <input
          id="troca-senha-nova"
          v-model="novaSenha"
          :type="mostrar ? 'text' : 'password'"
          autocomplete="new-password"
          class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/40"
          placeholder="Mín. 8 chars, maiúscula, número e especial"
        />
      </div>

      <div class="space-y-1">
        <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400" for="troca-senha-confirmacao">Confirmar Senha</label>
        <input
          id="troca-senha-confirmacao"
          v-model="confirmacao"
          :type="mostrar ? 'text' : 'password'"
          autocomplete="new-password"
          class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/40"
          placeholder="Repita a senha"
        />
        <button
          type="button"
          class="mt-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
          @click="mostrar = !mostrar"
        >
          {{ mostrar ? 'Ocultar' : 'Mostrar' }} senha
        </button>
      </div>

      <ul class="space-y-1">
        <li
          v-for="regra in regras"
          :key="regra.label"
          class="flex items-center gap-2 text-xs"
          :class="regra.ok ? 'text-emerald-400' : 'text-zinc-600'"
        >
          <span>{{ regra.ok ? '✓' : '○' }}</span>
          {{ regra.label }}
        </li>
      </ul>

      <div class="flex justify-end">
        <button
          type="submit"
          :disabled="salvando || !valida"
          class="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
        >
          {{ salvando ? 'Salvando...' : 'Confirmar' }}
        </button>
      </div>
    </form>
  </Modal>
</template>

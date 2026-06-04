<template>
  <div class="page-root min-h-screen overflow-x-hidden text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="page-ambient fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgb(107_78_158/0.1),transparent)]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">

      <!-- Header -->
      <header class="sticky top-0 z-20 border-b border-white/[0.06] backdrop-blur-xl bg-[#0a0f1c]/80">
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
            @click="router.push({ name: 'master-panel' })"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Painel
          </button>

          <div class="flex-1 text-center">
            <span class="text-xs font-bold tracking-[0.3em] uppercase text-cyan-400">👥 Gerenciamento de Usuários</span>
          </div>

          <div class="w-24" />
        </div>
      </header>

      <main class="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8 sm:px-6">

        <!-- Stats row -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          <div class="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
            <p class="text-xs text-zinc-500 mb-1">Total</p>
            <p class="text-2xl font-bold text-white">{{ usuarios.length }}</p>
          </div>
          <div class="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
            <p class="text-xs text-cyan-400/60 mb-1">Players</p>
            <p class="text-2xl font-bold text-cyan-300">{{ players.length }}</p>
          </div>
          <div class="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4">
            <p class="text-xs text-amber-400/60 mb-1">Game Masters</p>
            <p class="text-2xl font-bold text-amber-300">{{ gms.length }}</p>
          </div>
          <div class="rounded-2xl border border-red-500/15 bg-red-500/5 p-4">
            <p class="text-xs text-red-400/60 mb-1">Inativos</p>
            <p class="text-2xl font-bold text-red-300">{{ inativos.length }}</p>
          </div>
          <div class="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
            <p class="text-xs text-emerald-400/60 mb-1">Pré-Registros</p>
            <p class="text-2xl font-bold text-emerald-300">{{ preRegistros.length }}</p>
          </div>
        </div>

        <!-- Filters -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            v-model="busca"
            type="text"
            placeholder="Buscar por email, username ou personagem..."
            class="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20"
          />
          <select
            v-model="filtroTipo"
            class="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500/40"
          >
            <option value="">Todos os tipos</option>
            <option value="gm">Game Masters</option>
            <option value="player">Players</option>
          </select>
          <select
            v-model="filtroAtivo"
            class="rounded-xl border border-white/10 bg-[#0f172a] px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-cyan-500/40"
          >
            <option value="">Todos</option>
            <option value="true">Ativos</option>
            <option value="false">Inativos</option>
          </select>
          <button
            type="button"
            class="shrink-0 rounded-xl bg-emerald-600/80 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
            @click="abrirPreRegistro"
          >
            + Liberar Email
          </button>
        </div>

        <!-- Loading -->
        <div v-if="carregando" class="flex items-center justify-center py-16">
          <div class="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>

        <!-- Empty -->
        <div v-else-if="listaFiltrada.length === 0 && !carregando" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
          <p class="text-zinc-500">Nenhum usuário encontrado.</p>
        </div>

        <!-- User list -->
        <div v-else class="space-y-3">
          <article
            v-for="u in listaFiltrada"
            :key="u.id"
            class="user-card group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-white/10 hover:bg-white/[0.05]"
          >
            <!-- Accent bar -->
            <div
              class="absolute inset-y-0 left-0 w-1 rounded-l-2xl"
              :class="u.auth_user_id === null ? 'bg-emerald-500' : u.tipo === 'gm' ? 'bg-amber-500' : 'bg-cyan-500'"
            />

            <div class="flex flex-col gap-4 pl-3 sm:flex-row sm:items-start sm:justify-between">

              <!-- Left: avatar + info -->
              <div class="flex items-start gap-4">
                <div
                  class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-lg font-bold"
                  :class="u.auth_user_id === null
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : u.tipo === 'gm'
                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                      : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300'"
                >
                  {{ u.auth_user_id === null ? '📋' : u.tipo === 'gm' ? '⚔' : (u.personagem?.name?.[0]?.toUpperCase() ?? '?') }}
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-semibold text-zinc-100">
                      {{ u.personagem?.name ?? u.username ?? u.real_email.split('@')[0] }}
                    </span>
                    <span
                      class="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide"
                      :class="u.auth_user_id === null
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : u.tipo === 'gm'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-cyan-500/15 text-cyan-400'"
                    >{{ u.auth_user_id === null ? 'Pré-Registro' : u.tipo === 'gm' ? 'Game Master' : 'Player' }}</span>
                    <span
                      v-if="!u.ativo"
                      class="rounded-full bg-red-500/15 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-red-400"
                    >Inativo</span>
                  </div>

                  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    <span>📧 {{ u.real_email }}</span>
                    <span v-if="u.username">@{{ u.username }}</span>
                    <span v-if="u.personagem">Personagem: <span class="text-zinc-400">{{ u.personagem.name }}</span> (Nv. {{ u.personagem.level }})</span>
                    <span v-if="u.auth_user_id !== null && u.personagem?.raca_id == null && u.tipo === 'player'" class="text-amber-400/70">⚠ Raça não escolhida</span>
                    <span
                      v-if="u.tipo === 'player' && (u.personagem as any)?.status === 'morto'"
                      class="rounded-full bg-red-500/20 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-red-400"
                    >💀 Morto</span>
                  </div>

                  <p class="mt-1 text-[0.65rem] text-zinc-700">
                    Criado em {{ formatarData(u.created_at) }}
                  </p>
                </div>
              </div>

              <!-- Right: actions -->
              <div class="flex shrink-0 flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                <template v-if="u.auth_user_id === null">
                  <button
                    type="button"
                    class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                    @click="abrirConfirmacaoRemover(u)"
                  >
                    Remover
                  </button>
                </template>
                <template v-else>
                  <button
                    type="button"
                    class="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/20"
                    @click="abrirEdicao(u)"
                  >
                    Editar
                  </button>
                  <button
                    v-if="u.tipo === 'gm'"
                    type="button"
                    class="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400 transition-colors hover:bg-violet-500/20"
                    @click="abrirResetSenha(u)"
                  >
                    Definir Senha
                  </button>
                  <button
                    type="button"
                    class="rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400 transition-colors hover:bg-orange-500/20"
                    @click="abrirConfirmacaoResetPadrao(u)"
                  >
                    Reset Padrão
                  </button>
                  <button
                    v-if="u.tipo === 'player' && u.personagem"
                    type="button"
                    class="rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400 transition-colors hover:bg-violet-500/20"
                    @click="abrirModalTelas(u)"
                  >
                    Telas
                  </button>
                  <button
                    v-if="u.tipo === 'player' && u.personagem && (u.personagem as any).status !== 'morto'"
                    type="button"
                    class="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                    @click="matarPersonagem(u)"
                  >
                    💀 Matar
                  </button>
                  <button
                    v-else-if="u.tipo === 'player' && u.personagem && (u.personagem as any).status === 'morto'"
                    type="button"
                    class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20"
                    @click="reviverPersonagem(u)"
                  >
                    ✨ Reviver
                  </button>
                  <button
                    v-if="u.tipo !== 'gm'"
                    type="button"
                    class="rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors"
                    :class="u.ativo
                      ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'"
                    @click="abrirConfirmacaoToggle(u)"
                  >
                    {{ u.ativo ? 'Desativar' : 'Reativar' }}
                  </button>
                  <button
                    v-if="u.tipo !== 'gm'"
                    type="button"
                    class="rounded-xl border border-red-700/40 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-500 transition-colors hover:bg-red-900/40"
                    @click="abrirConfirmacaoDeletar(u)"
                  >
                    Deletar
                  </button>
                </template>
              </div>
            </div>
          </article>
        </div>
      </main>
    </TemaDarkLight>

    <!-- Modal Editar -->
    <Modal
      v-if="modalEdicaoAberto"
      title="Editar Usuário"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalEdicaoAberto = false"
    >
      <div class="space-y-5 px-6 py-5">
        <div v-if="erroEdicao" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {{ erroEdicao }}
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Tipo de Conta</label>
          <VSelect
            v-model="formEdicao.tipo"
            :options="[{ value: 'player', label: 'Player' }, { value: 'gm', label: 'Game Master' }]"
          />
          <p class="mt-1 text-xs text-zinc-600">Atenção: promover a GM dá acesso total ao sistema.</p>
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Username de Login</label>
          <input
            v-model="formEdicao.username"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-500/40"
            placeholder="3-20 chars (a-z, 0-9, _, -)"
          />
          <p class="mt-1 text-xs text-zinc-600">Alterar o username atualiza também o email de auth e o personagem.</p>
        </div>

        <div v-if="usuarioEditando?.tipo === 'player'" class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nome do Personagem</label>
          <input
            v-model="formEdicao.nome_personagem"
            type="text"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-cyan-500/40"
            placeholder="Nome do personagem"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="modalEdicaoAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvandoEdicao"
            class="rounded-xl bg-cyan-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 disabled:opacity-50"
            @click="salvarEdicao"
          >
            {{ salvandoEdicao ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Pré-Registro -->
    <Modal
      v-if="modalPreRegistroAberto"
      title="Liberar Email para Cadastro"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalPreRegistroAberto = false"
    >
      <div class="space-y-5 px-6 py-5">
        <p class="text-sm text-zinc-400">O email liberado poderá submeter uma solicitação de criação de personagem.</p>

        <div v-if="erroPreRegistro" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {{ erroPreRegistro }}
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Email</label>
          <input
            v-model="formPreRegistro.email"
            type="email"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-emerald-500/40"
            placeholder="email@dominio.com"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Tipo de Conta</label>
          <VSelect
            v-model="formPreRegistro.tipo"
            :options="[{ value: 'player', label: 'Player' }, { value: 'gm', label: 'Game Master' }]"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="modalPreRegistroAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvandoPreRegistro || !formPreRegistro.email.trim()"
            class="rounded-xl bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
            @click="salvarPreRegistro"
          >
            {{ salvandoPreRegistro ? 'Salvando...' : 'Liberar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmação Remover Pré-Registro -->
    <Modal
      v-if="modalRemoverAberto"
      title="Remover Pré-Registro"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalRemoverAberto = false"
    >
      <div class="px-6 py-5">
        <p class="text-sm text-zinc-300">
          Remover pré-registro de <span class="font-semibold text-white">{{ usuarioRemover?.real_email }}</span>?
        </p>
        <p class="mt-1 text-xs text-zinc-500">O email precisará ser liberado novamente para criar personagem.</p>
        <div v-if="erroRemover" class="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{{ erroRemover }}</div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white" @click="modalRemoverAberto = false">Cancelar</button>
          <button type="button" :disabled="salvandoRemover" class="rounded-xl bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50" @click="executarRemover">
            {{ salvandoRemover ? 'Removendo...' : 'Remover' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmação Desativar/Reativar -->
    <Modal
      v-if="modalToggleAberto"
      :title="usuarioToggle?.ativo ? 'Desativar Conta' : 'Reativar Conta'"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalToggleAberto = false"
    >
      <div class="px-6 py-5">
        <p class="text-sm text-zinc-300">
          {{ usuarioToggle?.ativo ? 'Desativar' : 'Reativar' }} a conta de
          <span class="font-semibold text-white">{{ usuarioToggle?.personagem?.name ?? usuarioToggle?.username ?? usuarioToggle?.real_email }}</span>?
        </p>
        <p class="mt-1 text-xs text-zinc-500">
          {{ usuarioToggle?.ativo ? 'O jogador não conseguirá fazer login até ser reativado.' : 'O jogador voltará a conseguir fazer login.' }}
        </p>
        <div v-if="erroToggle" class="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{{ erroToggle }}</div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:text-white" @click="modalToggleAberto = false">Cancelar</button>
          <button
            type="button"
            :disabled="salvandoToggle"
            class="rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            :class="usuarioToggle?.ativo ? 'bg-red-700 hover:bg-red-600' : 'bg-emerald-700 hover:bg-emerald-600'"
            @click="executarToggle"
          >
            {{ salvandoToggle ? 'Salvando...' : (usuarioToggle?.ativo ? 'Desativar' : 'Reativar') }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmação Deletar -->
    <Modal
      v-if="modalDeletarAberto"
      title="Deletar Usuário"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalDeletarAberto = false"
    >
      <div class="px-6 py-5 space-y-3">
        <p class="text-sm text-zinc-300">
          Deseja deletar permanentemente
          <span class="font-semibold text-white">{{ usuarioDeletar?.personagem?.name ?? usuarioDeletar?.username ?? usuarioDeletar?.real_email }}</span>?
        </p>
        <p class="text-xs text-zinc-500">Isso irá remover o personagem, a conta de autenticação e o avatar do storage. Esta ação não pode ser desfeita.</p>
        <div v-if="erroDeletar" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {{ erroDeletar }}
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="modalDeletarAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvandoDeletar"
            class="rounded-xl bg-red-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
            @click="confirmarDeletar"
          >
            {{ salvandoDeletar ? 'Deletando...' : 'Deletar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Confirmação Reset Padrão (player e GM) -->
    <Modal
      v-if="modalConfirmacaoResetAberto"
      title="Resetar Senha"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalConfirmacaoResetAberto = false"
    >
      <div class="px-6 py-5">
        <p class="text-sm text-zinc-300">
          Deseja resetar a senha de
          <span class="font-semibold text-white">{{ usuarioResetPadrao?.personagem?.name ?? usuarioResetPadrao?.username ?? usuarioResetPadrao?.real_email }}</span>
          para <span class="font-mono text-orange-300">12345</span>?
        </p>
        <p class="mt-2 text-xs text-zinc-500">O usuário será obrigado a definir uma nova senha no próximo login.</p>
        <div v-if="erroResetPadrao" class="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {{ erroResetPadrao }}
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="modalConfirmacaoResetAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvandoResetPadrao"
            class="rounded-xl bg-orange-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500 disabled:opacity-50"
            @click="confirmarResetPadrao"
          >
            {{ salvandoResetPadrao ? 'Resetando...' : 'Resetar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Reset Senha (GM) -->
    <Modal
      v-if="modalSenhaAberto"
      title="Resetar Senha"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
      @close="modalSenhaAberto = false"
    >
      <div class="space-y-5 px-6 py-5">
        <p class="text-sm text-zinc-400">
          Definindo nova senha para <span class="font-semibold text-zinc-200">{{ usuarioSenha?.personagem?.name ?? usuarioSenha?.username ?? usuarioSenha?.real_email }}</span>.
        </p>

        <div v-if="erroSenha" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {{ erroSenha }}
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nova Senha</label>
          <input
            v-model="novaSenha"
            :type="mostrarSenha ? 'text' : 'password'"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/40"
            placeholder="Mín. 8 chars, maiúscula, número e especial"
          />
          <button
            type="button"
            class="mt-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            @click="mostrarSenha = !mostrarSenha"
          >
            {{ mostrarSenha ? 'Ocultar senha' : 'Mostrar senha' }}
          </button>
        </div>

        <ul class="space-y-1">
          <li
            v-for="regra in regrasSenha"
            :key="regra.label"
            class="flex items-center gap-2 text-xs"
            :class="regra.ok ? 'text-emerald-400' : 'text-zinc-600'"
          >
            <span>{{ regra.ok ? '✓' : '○' }}</span>
            {{ regra.label }}
          </li>
        </ul>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            type="button"
            class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
            @click="modalSenhaAberto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvandoSenha || !senhaValida"
            class="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            @click="salvarSenha"
          >
            {{ salvandoSenha ? 'Salvando...' : 'Confirmar Reset' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- Modal Gerenciar Telas do Player -->
    <Modal
      v-if="modalTelasAberto"
      title="Telas Habilitadas"
      tema="escuro"
      panel-class="max-w-sm"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalTelasAberto = false"
    >
      <template #header>
        <div>
          <h3 class="text-base font-bold text-white">Telas do Player</h3>
          <p class="text-xs text-zinc-500 mt-0.5">{{ usuarioTelas?.personagem?.name ?? usuarioTelas?.username }}</p>
        </div>
        <button type="button" @click="modalTelasAberto = false" class="ml-auto text-zinc-500 hover:text-white transition-colors">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </template>

      <div class="p-5">
        <div v-if="carregandoTelas" class="py-6 text-center text-xs text-zinc-500">Carregando...</div>
        <div v-else class="space-y-1">
          <label
            v-for="tela in TELAS_DISPONIVEIS"
            :key="tela.id"
            class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.04]"
            :class="telasForm.includes(tela.id) ? 'bg-violet-950/30' : ''"
          >
            <input
              type="checkbox"
              :value="tela.id"
              v-model="telasForm"
              class="h-4 w-4 rounded accent-violet-500"
            />
            <span class="text-sm" :class="telasForm.includes(tela.id) ? 'text-violet-200 font-medium' : 'text-zinc-300'">
              {{ tela.label }}
            </span>
          </label>
        </div>
        <div v-if="erroTelas" class="mt-3 rounded-xl border border-red-500/30 bg-red-950/20 px-3 py-2 text-xs text-red-400">{{ erroTelas }}</div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3 px-5 py-4 border-t border-white/[0.06]">
          <button type="button" class="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white" @click="modalTelasAberto = false">
            Cancelar
          </button>
          <button
            type="button"
            :disabled="salvandoTelas"
            class="rounded-xl bg-violet-700 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-600 disabled:opacity-50"
            @click="salvarTelas"
          >
            {{ salvandoTelas ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </template>
    </Modal>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarUsuarios,
  editarUsuario,
  resetarSenhaUsuario,
  resetarSenhaPadraoUsuario,
  alterarAtivoUsuario,
  preRegistrarUsuario,
  removerPreRegistro,
  deletarUsuario,
  type Usuario,
} from '@/lib/api/usuarios.api'
import { alterarStatusPersonagem as apiAlterarStatus } from '@/lib/api/classes.api'
import {
  listarTelasPlayer,
  definirTelasPlayer,
  TELAS_DISPONIVEIS,
  type TelaId,
} from '@/lib/api/player-telas.api'

const router = useRouter()

const usuarios = ref<Usuario[]>([])
const carregando = ref(true)
const busca = ref('')
const filtroTipo = ref('')
const filtroAtivo = ref('')

const players = computed(() => usuarios.value.filter((u) => u.tipo === 'player' && u.auth_user_id !== null))
const gms = computed(() => usuarios.value.filter((u) => u.tipo === 'gm' && u.auth_user_id !== null))
const inativos = computed(() => usuarios.value.filter((u) => !u.ativo && u.auth_user_id !== null))
const preRegistros = computed(() => usuarios.value.filter((u) => u.auth_user_id === null))

const listaFiltrada = computed(() => {
  return usuarios.value.filter((u) => {
    if (filtroTipo.value && u.tipo !== filtroTipo.value) return false
    if (filtroAtivo.value === 'true' && !u.ativo) return false
    if (filtroAtivo.value === 'false' && u.ativo) return false
    if (!busca.value.trim()) return true
    const q = busca.value.toLowerCase()
    return (
      u.real_email.toLowerCase().includes(q) ||
      (u.username ?? '').toLowerCase().includes(q) ||
      (u.personagem?.name ?? '').toLowerCase().includes(q)
    )
  })
})

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

async function carregarUsuarios() {
  carregando.value = true
  try {
    usuarios.value = await listarUsuarios()
  } finally {
    carregando.value = false
  }
}

// ── Edição ──────────────────────────────────────────────────────────────────

const modalEdicaoAberto = ref(false)
const usuarioEditando = ref<Usuario | null>(null)
const formEdicao = ref({ username: '', tipo: 'player' as 'gm' | 'player', nome_personagem: '' })
const salvandoEdicao = ref(false)
const erroEdicao = ref('')

function abrirEdicao(u: Usuario) {
  usuarioEditando.value = u
  formEdicao.value = {
    username: u.username ?? '',
    tipo: u.tipo,
    nome_personagem: u.personagem?.name ?? '',
  }
  erroEdicao.value = ''
  modalEdicaoAberto.value = true
}

async function salvarEdicao() {
  if (!usuarioEditando.value) return
  salvandoEdicao.value = true
  erroEdicao.value = ''
  try {
    const payload: Record<string, unknown> = {}
    const orig = usuarioEditando.value

    if (formEdicao.value.tipo !== orig.tipo) payload.tipo = formEdicao.value.tipo
    if (formEdicao.value.username.trim() !== (orig.username ?? '')) payload.username = formEdicao.value.username.trim()
    if (orig.tipo === 'player' && formEdicao.value.nome_personagem.trim() !== (orig.personagem?.name ?? '')) {
      payload.nome_personagem = formEdicao.value.nome_personagem.trim()
    }

    if (Object.keys(payload).length === 0) {
      modalEdicaoAberto.value = false
      return
    }

    const atualizado = await editarUsuario(orig.id, payload as any)
    const idx = usuarios.value.findIndex((u) => u.id === orig.id)
    if (idx !== -1) usuarios.value[idx] = atualizado
    modalEdicaoAberto.value = false
  } catch (err: any) {
    erroEdicao.value = err?.response?.data?.error ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvandoEdicao.value = false
  }
}

// ── Reset Senha Padrão (player) ───────────────────────────────────────────────

const modalConfirmacaoResetAberto = ref(false)
const usuarioResetPadrao = ref<Usuario | null>(null)
const salvandoResetPadrao = ref(false)
const erroResetPadrao = ref('')

function abrirConfirmacaoResetPadrao(u: Usuario) {
  usuarioResetPadrao.value = u
  erroResetPadrao.value = ''
  modalConfirmacaoResetAberto.value = true
}

async function confirmarResetPadrao() {
  if (!usuarioResetPadrao.value) return
  salvandoResetPadrao.value = true
  erroResetPadrao.value = ''
  try {
    await resetarSenhaPadraoUsuario(usuarioResetPadrao.value.id)
    modalConfirmacaoResetAberto.value = false
  } catch (err: any) {
    erroResetPadrao.value = err?.response?.data?.error ?? err.message ?? 'Erro ao resetar senha.'
  } finally {
    salvandoResetPadrao.value = false
  }
}

// ── Reset Senha (GM) ─────────────────────────────────────────────────────────

const modalSenhaAberto = ref(false)
const usuarioSenha = ref<Usuario | null>(null)
const novaSenha = ref('')
const mostrarSenha = ref(false)
const salvandoSenha = ref(false)
const erroSenha = ref('')

const regrasSenha = computed(() => [
  { label: 'Mínimo 8 caracteres', ok: novaSenha.value.length >= 8 },
  { label: 'Ao menos uma letra maiúscula', ok: /[A-Z]/.test(novaSenha.value) },
  { label: 'Ao menos um número', ok: /[0-9]/.test(novaSenha.value) },
  { label: 'Ao menos um caractere especial', ok: /[^a-zA-Z0-9]/.test(novaSenha.value) },
])
const senhaValida = computed(() => regrasSenha.value.every((r) => r.ok))

function abrirResetSenha(u: Usuario) {
  usuarioSenha.value = u
  novaSenha.value = ''
  mostrarSenha.value = false
  erroSenha.value = ''
  modalSenhaAberto.value = true
}

async function salvarSenha() {
  if (!usuarioSenha.value || !senhaValida.value) return
  salvandoSenha.value = true
  erroSenha.value = ''
  try {
    await resetarSenhaUsuario(usuarioSenha.value.id, novaSenha.value)
    modalSenhaAberto.value = false
  } catch (err: any) {
    erroSenha.value = err?.response?.data?.error ?? err.message ?? 'Erro ao resetar senha.'
  } finally {
    salvandoSenha.value = false
  }
}

// ── Pré-Registro ──────────────────────────────────────────────────────────────

const modalPreRegistroAberto = ref(false)
const formPreRegistro = ref({ email: '', tipo: 'player' as 'gm' | 'player' })
const salvandoPreRegistro = ref(false)
const erroPreRegistro = ref('')

function abrirPreRegistro() {
  formPreRegistro.value = { email: '', tipo: 'player' }
  erroPreRegistro.value = ''
  modalPreRegistroAberto.value = true
}

async function salvarPreRegistro() {
  const email = formPreRegistro.value.email.trim()
  if (!email) return
  salvandoPreRegistro.value = true
  erroPreRegistro.value = ''
  try {
    await preRegistrarUsuario(email, formPreRegistro.value.tipo)
    await carregarUsuarios()
    modalPreRegistroAberto.value = false
  } catch (err: any) {
    erroPreRegistro.value = err?.response?.data?.error ?? err.message ?? 'Erro ao liberar email.'
  } finally {
    salvandoPreRegistro.value = false
  }
}

const modalRemoverAberto = ref(false)
const usuarioRemover = ref<Usuario | null>(null)
const salvandoRemover = ref(false)
const erroRemover = ref('')

function abrirConfirmacaoRemover(u: Usuario) {
  usuarioRemover.value = u
  erroRemover.value = ''
  modalRemoverAberto.value = true
}

async function executarRemover() {
  if (!usuarioRemover.value) return
  salvandoRemover.value = true
  erroRemover.value = ''
  try {
    await removerPreRegistro(usuarioRemover.value.id)
    usuarios.value = usuarios.value.filter((x) => x.id !== usuarioRemover.value!.id)
    modalRemoverAberto.value = false
  } catch (err: any) {
    erroRemover.value = err?.response?.data?.error ?? err.message ?? 'Erro ao remover pré-registro.'
  } finally {
    salvandoRemover.value = false
  }
}

// ── Deletar usuário ───────────────────────────────────────────────────────────

const modalDeletarAberto = ref(false)
const usuarioDeletar = ref<Usuario | null>(null)
const salvandoDeletar = ref(false)
const erroDeletar = ref('')

function abrirConfirmacaoDeletar(u: Usuario) {
  usuarioDeletar.value = u
  erroDeletar.value = ''
  modalDeletarAberto.value = true
}

async function confirmarDeletar() {
  if (!usuarioDeletar.value) return
  salvandoDeletar.value = true
  erroDeletar.value = ''
  try {
    await deletarUsuario(usuarioDeletar.value.id)
    usuarios.value = usuarios.value.filter((x) => x.id !== usuarioDeletar.value!.id)
    modalDeletarAberto.value = false
  } catch (err: any) {
    erroDeletar.value = err?.response?.data?.error ?? err.message ?? 'Erro ao deletar usuário.'
  } finally {
    salvandoDeletar.value = false
  }
}

// ── Toggle ativo ─────────────────────────────────────────────────────────────

const modalToggleAberto = ref(false)
const usuarioToggle = ref<Usuario | null>(null)
const salvandoToggle = ref(false)
const erroToggle = ref('')

function abrirConfirmacaoToggle(u: Usuario) {
  if (u.tipo === 'gm') return
  usuarioToggle.value = u
  erroToggle.value = ''
  modalToggleAberto.value = true
}

async function executarToggle() {
  if (!usuarioToggle.value) return
  salvandoToggle.value = true
  erroToggle.value = ''
  try {
    const novoAtivo = !usuarioToggle.value.ativo
    await alterarAtivoUsuario(usuarioToggle.value.id, novoAtivo)
    const idx = usuarios.value.findIndex((x) => x.id === usuarioToggle.value!.id)
    if (idx !== -1) usuarios.value[idx] = { ...usuarios.value[idx], ativo: novoAtivo }
    modalToggleAberto.value = false
  } catch (err: any) {
    erroToggle.value = err?.response?.data?.error ?? err.message ?? 'Erro ao alterar status.'
  } finally {
    salvandoToggle.value = false
  }
}

onMounted(carregarUsuarios)

// ── Status do Personagem ─────────────────────────────────────────────────────

async function matarPersonagem(u: Usuario) {
  if (!u.personagem) return
  if (!confirm(`Marcar "${u.personagem.name}" como morto? Isso vai liberar qualquer classe secreta que ele detinha.`)) return
  try {
    await apiAlterarStatus(u.personagem.id, 'morto')
    ;(u.personagem as any).status = 'morto'
  } catch (err: any) {
    alert(err?.response?.data?.message ?? err.message ?? 'Erro ao alterar status.')
  }
}

async function reviverPersonagem(u: Usuario) {
  if (!u.personagem) return
  try {
    await apiAlterarStatus(u.personagem.id, 'vivo')
    ;(u.personagem as any).status = 'vivo'
  } catch (err: any) {
    alert(err?.response?.data?.message ?? err.message ?? 'Erro ao alterar status.')
  }
}

// ── Gerenciar Telas ──────────────────────────────────────────────────────────

const modalTelasAberto  = ref(false)
const usuarioTelas      = ref<Usuario | null>(null)
const telasForm         = ref<TelaId[]>([])
const carregandoTelas   = ref(false)
const salvandoTelas     = ref(false)
const erroTelas         = ref('')

async function abrirModalTelas(u: Usuario) {
  usuarioTelas.value     = u
  erroTelas.value        = ''
  telasForm.value        = []
  modalTelasAberto.value = true
  carregandoTelas.value  = true
  try {
    if (u.personagem) {
      telasForm.value = await listarTelasPlayer(u.personagem.id)
    }
  } catch (err: any) {
    erroTelas.value = err?.response?.data?.error ?? err.message ?? 'Erro ao carregar telas.'
  } finally {
    carregandoTelas.value = false
  }
}

async function salvarTelas() {
  if (!usuarioTelas.value?.personagem) return
  salvandoTelas.value = true
  erroTelas.value     = ''
  try {
    await definirTelasPlayer(usuarioTelas.value.personagem.id, telasForm.value)
    modalTelasAberto.value = false
  } catch (err: any) {
    erroTelas.value = err?.response?.data?.error ?? err.message ?? 'Erro ao salvar telas.'
  } finally {
    salvandoTelas.value = false
  }
}
</script>

<style scoped>
.user-card {
  transition: border-color 0.15s ease, background-color 0.15s ease;
}
</style>

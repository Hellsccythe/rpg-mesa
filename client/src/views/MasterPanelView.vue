<template>
  <div class="page-root min-h-screen overflow-x-hidden text-white">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="page-ambient fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgb(107_78_158/0.1),transparent)]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">

      <!-- ══ Header ══════════════════════════════════════════════════════════════ -->
      <header class="page-header sticky top-0 z-20 border-b backdrop-blur-xl">
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center px-4 sm:px-6">
          <div class="flex-none">
            <HamburgerDrawerMenu
              :items="panelMenuItems"
              active-item-id="pendencias"
              aria-label="Menu do painel"
              @select="handlePanelMenuSelect"
            />
          </div>

          <div class="flex-1 text-center">
            <span class="text-xs font-bold tracking-[0.3em] uppercase text-amber-400">⚔ Game Master ⚔</span>
          </div>

          <div class="flex flex-none items-center gap-2">
            <button
              type="button"
              class="notification-bell"
              :title="`${pendingCount} pendência(s)`"
              :aria-label="`${pendingCount} pendências de aprovação`"
              @click="goSection('pendencias')"
            >
              <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"/>
                <path d="M9 17a3 3 0 0 0 6 0"/>
              </svg>
              <span v-if="pendingCount > 0" class="notification-badge">{{ pendingCount }}</span>
            </button>

            <button
              @click="goLogin"
              class="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white sm:px-4"
            >
              Sair do Painel
            </button>
          </div>
        </div>
      </header>

      <!-- ══ Main ══════════════════════════════════════════════════════════════ -->
      <main class="mx-auto w-full max-w-7xl flex-1 space-y-5 px-4 py-8 sm:px-6">

        <!-- ── Personagens da Campanha ─────────────────────────────────────── -->
        <section class="gm-card border-amber-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-amber-500/10 text-amber-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h2 class="gm-title">Personagens da Campanha</h2>
              <p class="gm-subtitle">Clique para acessar a ficha do personagem</p>
            </div>
          </div>

          <div v-if="characters.length === 0" class="gm-empty">Nenhum personagem cadastrado.</div>
          <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            <button
              v-for="char in characters"
              :key="char.characterId"
              @click="irParaDashboardPersonagem(char.characterId)"
              class="master-char-card group"
              :aria-label="`Ver ficha de ${char.name}`"
            >
              <div class="relative aspect-[3/4] overflow-hidden rounded-2xl">
                <img
                  v-if="char.avatarUrl"
                  :src="char.avatarUrl"
                  :alt="char.name"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style="object-position: center 20%"
                  loading="lazy"
                />
                <div v-else class="flex h-full w-full items-center justify-center bg-violet-950/50 text-[0.6rem] font-semibold uppercase text-zinc-500">
                  Sem Avatar
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div class="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-all group-hover:ring-amber-500/60 group-hover:shadow-lg group-hover:shadow-amber-500/10" />
                <p class="absolute bottom-0 left-0 right-0 p-2 text-center text-[0.7rem] font-semibold leading-tight text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                  {{ char.name }}
                </p>
              </div>
            </button>
          </div>
        </section>

        <!-- ── Pendências de Aprovação ─────────────────────────────────────── -->
        <section id="pendencias" class="gm-card border-violet-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-violet-500/10 text-violet-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.4V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"/><path d="M9 17a3 3 0 0 0 6 0"/></svg>
            </div>
            <div class="flex-1">
              <h2 class="gm-title">Pendências de Aprovação</h2>
              <p class="gm-subtitle">Solicitações de nome, avatar e história dos jogadores</p>
            </div>
            <button @click="loadAll" :disabled="loading" class="gm-btn-ghost shrink-0">
              <svg class="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              {{ loading ? 'Atualizando...' : 'Atualizar' }}
            </button>
          </div>

          <div v-if="pendingApprovals.length === 0" class="gm-empty">Nenhuma pendência no momento.</div>
          <div v-else class="space-y-3">
            <article
              v-for="request in pendingApprovals"
              :key="request.characterId"
              class="gm-inner-box rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
            >
              <div class="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="font-semibold text-zinc-100">{{ request.currentName }}</p>
                  <p class="text-xs text-zinc-500">Solicitado por {{ request.requestedByEmail || 'desconhecido' }}</p>
                </div>
                <div class="flex shrink-0 gap-2">
                  <button @click="review(request.characterId, true)" class="gm-btn-success">Aprovar</button>
                  <button @click="review(request.characterId, false)" class="gm-btn-danger-sm">Rejeitar</button>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div class="rounded-lg bg-black/30 p-3">
                  <p class="mb-1 text-[0.6rem] uppercase tracking-wider text-zinc-600">Nome atual</p>
                  <p class="text-sm text-zinc-300">{{ request.currentName }}</p>
                </div>
                <div class="rounded-lg bg-black/30 p-3">
                  <p class="mb-1 text-[0.6rem] uppercase tracking-wider text-zinc-600">Solicitado</p>
                  <p class="text-sm text-zinc-300">{{ request.requestedName || '—' }}</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- ── Notas de Lore ──────────────────────────────────────────────── -->
        <section id="lore-notes" class="gm-card border-amber-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-amber-500/10 text-amber-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            </div>
            <div>
              <h2 class="gm-title">Notas de Lore</h2>
              <p class="gm-subtitle">
                Crie livros e documentos. Separe páginas com
                <code class="rounded bg-black/40 px-1 text-amber-300">---</code> em linhas separadas.
              </p>
            </div>
          </div>

          <!-- Form -->
          <div class="gm-inner-box mb-5 rounded-xl border border-white/[0.06] bg-black/20 p-4">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-400/80">Nova Nota</p>
            <div class="flex flex-col gap-4 xl:flex-row">
              <!-- Fields -->
              <div class="min-w-0 flex-1 space-y-3">
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    v-model="loreNoteTitle"
                    type="text"
                    placeholder="Título da nota"
                    class="gm-input"
                    aria-label="Título da nota"
                  />
                  <input
                    v-model="loreNoteSubtitle"
                    type="text"
                    placeholder="Subtítulo (opcional)"
                    class="gm-input"
                    aria-label="Subtítulo"
                  />
                </div>

                <VSelect
                  v-model="loreNoteCharacterId"
                  :options="loreCharacterOptions"
                  root-class="w-full"
                  aria-label="Visibilidade da nota"
                />

                <textarea
                  v-model="loreNoteContent"
                  rows="7"
                  placeholder="Conteúdo da nota...&#10;&#10;Use --- em linha separada para quebrar páginas."
                  class="gm-textarea w-full font-mono text-xs"
                  aria-label="Conteúdo da nota"
                />

                <!-- PDF upload -->
                <div>
                  <div
                    class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-amber-600/25 bg-black/10 px-4 py-2.5 transition-colors hover:border-amber-500/40"
                    @click="acionarInputPdf"
                  >
                    <input ref="inputPdfRef" type="file" accept=".pdf" class="hidden" @change="selecionarPdf" />
                    <svg class="h-4 w-4 shrink-0 text-amber-400/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p v-if="lorePdfFile" class="flex-1 truncate text-sm text-amber-200">{{ lorePdfFile.name }}</p>
                    <p v-else class="flex-1 text-sm text-zinc-500">Adicionar PDF (opcional)</p>
                    <button v-if="lorePdfFile" @click.stop="lorePdfFile = null; lorePdfUrl = null" class="text-zinc-500 hover:text-red-400 transition-colors">✕</button>
                  </div>
                  <p v-if="loadingPdf" class="mt-1 animate-pulse text-xs text-amber-400">Enviando PDF...</p>
                </div>

                <div class="flex justify-end">
                  <button
                    @click="criarLoreNote"
                    :disabled="loadingLoreNotes || !loreNoteTitle.trim() || !loreNoteContent.trim()"
                    class="gm-btn-amber disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {{ loadingLoreNotes ? 'Salvando...' : 'Criar Nota' }}
                  </button>
                </div>
              </div>

              <!-- Preview -->
              <div class="shrink-0 xl:w-64">
                <p class="mb-2 text-xs text-zinc-500">Preview — Página 1</p>
                <div class="lore-preview-page overflow-hidden rounded-xl" style="min-height: 300px;">
                  <div class="lore-preview-inner p-5">
                    <div v-if="loreNoteTitle" class="mb-3 text-center">
                      <p class="lore-preview-title">{{ loreNoteTitle }}</p>
                      <p v-if="loreNoteSubtitle" class="lore-preview-subtitle">{{ loreNoteSubtitle }}</p>
                      <div class="lore-preview-rule" />
                    </div>
                    <p v-if="lorePreviewPage1" class="lore-preview-text" style="white-space: pre-wrap;">{{ lorePreviewPage1 }}</p>
                    <p v-else class="lore-preview-empty">O conteúdo aparecerá aqui...</p>
                  </div>
                </div>
                <p v-if="loreNotePagesCount > 1" class="mt-1 text-right text-xs text-zinc-600">
                  + {{ loreNotePagesCount - 1 }} página(s) adicionais
                </p>
              </div>
            </div>
          </div>

          <!-- Notes list -->
          <div class="space-y-2">
            <p v-if="loreNotes.length === 0" class="gm-empty">Nenhuma nota de lore criada ainda.</p>
            <article
              v-for="nota in loreNotes"
              :key="nota.id"
              class="gm-inner-box flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/15 px-4 py-3"
            >
              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="truncate text-sm font-semibold text-amber-100">{{ nota.title }}</p>
                  <span
                    class="shrink-0 rounded-full border px-2 py-0.5 text-[0.6rem] font-medium"
                    :class="nota.character_id
                      ? 'border-violet-500/40 bg-violet-900/50 text-violet-300'
                      : 'border-amber-600/30 bg-amber-900/30 text-amber-400'"
                  >
                    {{ nomePersonagemDaNota(nota.character_id) }}
                  </span>
                </div>
                <p v-if="nota.subtitle" class="truncate text-xs italic text-zinc-500">{{ nota.subtitle }}</p>
                <p class="mt-0.5 text-xs text-zinc-700">{{ nota.content.split(/\n---+\n/).length }} página(s)</p>
              </div>
              <button
                @click="deletarLoreNote(nota.id)"
                :disabled="loadingLoreNotes"
                class="shrink-0 rounded-lg border border-red-500/40 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-900/25 disabled:opacity-40"
              >
                Deletar
              </button>
            </article>
          </div>
        </section>

        <!-- ── Quick Links ─────────────────────────────────────────────────── -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            @click="router.push({ name: 'master-characters' })"
            class="gm-link-card group text-left"
          >
            <div class="gm-icon-wrap mb-3 bg-violet-500/10 text-violet-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
            <p class="font-semibold text-zinc-100 group-hover:text-white">Imagens dos Personagens</p>
            <p class="mt-0.5 text-xs text-zinc-500">Ajuste enquadramento e posição da imagem modal</p>
            <span class="mt-3 inline-block text-xs text-violet-400 group-hover:text-violet-300">Abrir guia →</span>
          </button>

          <button @click="goMasterGods" class="gm-link-card group text-left">
            <div class="gm-icon-wrap mb-3 bg-amber-500/10 text-amber-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <p class="font-semibold text-zinc-100 group-hover:text-white">Deuses</p>
            <p class="mt-0.5 text-xs text-zinc-500">Crie e edite divindades com cards e modal completo</p>
            <span class="mt-3 inline-block text-xs text-amber-400 group-hover:text-amber-300">Abrir guia →</span>
          </button>

          <button @click="goMasterMaps" class="gm-link-card group text-left">
            <div class="gm-icon-wrap mb-3 bg-emerald-500/10 text-emerald-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
            </div>
            <p class="font-semibold text-zinc-100 group-hover:text-white">Mapas</p>
            <p class="mt-0.5 text-xs text-zinc-500">Mapas com pontos de interesse interativos</p>
            <span class="mt-3 inline-block text-xs text-emerald-400 group-hover:text-emerald-300">Abrir guia →</span>
          </button>

          <button @click="goMasterWeapons" class="gm-link-card group text-left">
            <div class="gm-icon-wrap mb-3 bg-red-500/10 text-red-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <p class="font-semibold text-zinc-100 group-hover:text-white">Equipamentos</p>
            <p class="mt-0.5 text-xs text-zinc-500">Armas, armaduras, ferramentas e itens da campanha</p>
            <span class="mt-3 inline-block text-xs text-red-400 group-hover:text-red-300">Abrir guia →</span>
          </button>

          <button @click="goMasterRacas" class="gm-link-card group text-left">
            <div class="gm-icon-wrap mb-3 bg-violet-500/10 text-violet-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <p class="font-semibold text-zinc-100 group-hover:text-white">Raças</p>
            <p class="mt-0.5 text-xs text-zinc-500">Gerencie as raças jogáveis da campanha</p>
            <span class="mt-3 inline-block text-xs text-violet-400 group-hover:text-violet-300">Abrir guia →</span>
          </button>
        </div>

        <!-- ── Emails + Ferramentas de Personagem ─────────────────────────── -->
        <section class="gm-card border-violet-500/15">
          <!-- Emails -->
          <div id="emails-cadastro" class="mb-7">
            <div class="gm-card-header">
              <div class="gm-icon-wrap bg-violet-500/10 text-violet-400">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <h2 class="gm-title">Emails Liberados para Cadastro</h2>
                <p class="gm-subtitle">Apenas estes emails podem criar personagem</p>
              </div>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row">
              <input
                v-model="novoEmailLiberado"
                type="email"
                placeholder="email-do-player@dominio.com"
                class="gm-input flex-1"
                aria-label="Email do player"
              />
              <button
                @click="adicionarEmailLiberado"
                :disabled="loadingEmailsLiberados || !novoEmailLiberado.trim()"
                class="gm-btn-violet shrink-0 disabled:cursor-wait disabled:opacity-50"
              >
                {{ loadingEmailsLiberados ? 'Salvando...' : 'Liberar Email' }}
              </button>
            </div>

            <div class="mt-3 space-y-2">
              <p v-if="!emailsLiberadosCriacao.length" class="gm-empty">Nenhum email liberado no momento.</p>
              <div
                v-for="email in emailsLiberadosCriacao"
                :key="email"
                class="gm-inner-box flex items-center justify-between gap-2 rounded-xl border border-white/[0.05] bg-black/20 px-4 py-2.5"
              >
                <span class="text-sm text-zinc-300">{{ email }}</span>
                <button
                  @click="removerEmailLiberado(email)"
                  :disabled="loadingEmailsLiberados"
                  class="shrink-0 rounded-lg border border-red-500/40 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-900/20 disabled:cursor-wait disabled:opacity-50 transition-colors"
                >
                  Remover
                </button>
              </div>
            </div>
          </div>

          <!-- Divisor -->
          <div class="mb-6 h-px bg-white/[0.06]" />

          <!-- Ferramentas rápidas -->
          <div>
            <div class="gm-card-header mb-4">
              <div class="gm-icon-wrap bg-amber-500/10 text-amber-400">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              </div>
              <div>
                <h2 class="gm-title">Ferramentas do Personagem</h2>
                <p class="gm-subtitle">Skills, títulos, classes, notas de aventura</p>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <VSelect
                v-model="selectedCharacterId"
                :options="characterOptions"
                placeholder="Selecione um personagem"
                aria-label="Personagem"
              />
              <input v-model="skillName" type="text" placeholder="Nova skill" class="gm-input" aria-label="Nova skill" />
              <input v-model="titleName" type="text" placeholder="Novo título" class="gm-input" aria-label="Novo título" />
              <input v-model="className" type="text" placeholder="Nova classe" class="gm-input" aria-label="Nova classe" />
              <textarea v-model="classDescription" rows="2" placeholder="Descrição da classe" class="gm-textarea" aria-label="Descrição da classe" />
              <textarea v-model="adventureNote" rows="2" placeholder="Nota de aventura" class="gm-textarea" aria-label="Nota de aventura" />
            </div>

            <!-- Pontos de Classe -->
            <div class="mt-4 rounded-xl border border-amber-600/20 bg-amber-950/10 p-4">
              <p class="mb-0.5 text-sm font-semibold text-amber-300">Pontos de Classe</p>
              <p class="mb-3 text-xs text-zinc-500">Conceder pontos para escolher ou evoluir classes</p>
              <div class="grid grid-cols-[1fr_5rem_auto] items-center gap-2">
                <VSelect
                  v-model="classPointsCharacterId"
                  :options="characterOptions"
                  placeholder="Selecione um personagem"
                  aria-label="Personagem para pontos"
                />
                <input
                  v-model.number="classPointsAmount"
                  type="number"
                  min="1"
                  max="99"
                  class="gm-input text-center"
                  aria-label="Quantidade de pontos"
                />
                <button
                  @click="grantClassPoints"
                  :disabled="loadingClassPoints || !classPointsCharacterId || classPointsAmount < 1"
                  class="gm-btn-amber whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {{ loadingClassPoints ? 'Salvando...' : 'Conceder' }}
                </button>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <button @click="addSkill" class="gm-btn-violet">Adicionar Skill</button>
              <button @click="addTitleToCharacter" class="gm-btn-violet">Adicionar Título</button>
              <button @click="saveClass" class="gm-btn-violet">Salvar Classe</button>
              <button @click="addAdventureNote" class="gm-btn-violet">Adicionar Nota</button>
              <button
                @click="verFichaPersonagem"
                :disabled="!selectedCharacterId"
                class="gm-btn-ghost disabled:cursor-not-allowed disabled:opacity-40"
              >
                Ver Ficha
              </button>
            </div>
          </div>
        </section>

        <!-- ── Posição do Avatar ───────────────────────────────────────────── -->
        <section id="avatar-focal" class="gm-card border-violet-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-violet-500/10 text-violet-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
            <div>
              <h2 class="gm-title">Ponto Focal do Avatar</h2>
              <p class="gm-subtitle">Clique na imagem para definir a área que sempre fica centralizada no card</p>
            </div>
          </div>

          <div class="flex flex-col items-start gap-5 sm:flex-row">
            <div class="flex w-full flex-col gap-3 sm:w-56">
              <VSelect
                v-model="focalCharId"
                :options="characterOptions"
                placeholder="Selecione um personagem"
                root-class="w-full"
                aria-label="Personagem"
              />

              <div v-if="focalCharId" class="grid grid-cols-3 gap-1">
                <button
                  v-for="preset in focalPresets"
                  :key="preset.label"
                  @click="aplicarPreset(preset.value)"
                  class="rounded-lg border px-2 py-1.5 text-xs transition-colors"
                  :class="focalPoint === preset.value
                    ? 'border-amber-500 bg-amber-900/25 text-amber-300'
                    : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
                >
                  {{ preset.label }}
                </button>
              </div>

              <button
                v-if="focalCharId"
                @click="salvarFocalPoint"
                :disabled="loadingFocal"
                class="gm-btn-amber w-full disabled:opacity-40"
              >
                {{ loadingFocal ? 'Salvando...' : 'Salvar Posição' }}
              </button>

              <p v-if="focalFeedback" class="text-xs" :class="focalFeedbackError ? 'text-red-400' : 'text-emerald-400'">
                {{ focalFeedback }}
              </p>
            </div>

            <div v-if="focalCharId && focalCharAvatar" class="flex items-start gap-4">
              <div>
                <p class="mb-1.5 text-xs text-zinc-500">Clique para marcar</p>
                <div
                  class="relative w-36 shrink-0 cursor-crosshair overflow-hidden rounded-2xl border border-white/10"
                  style="aspect-ratio: 3/4"
                  @click="onFocalImageClick"
                  ref="focalImageRef"
                >
                  <img :src="focalCharAvatar" class="h-full w-full select-none object-cover object-top pointer-events-none" draggable="false" alt="avatar" />
                  <div class="focal-marker" :style="{ left: focalMarkerX + '%', top: focalMarkerY + '%' }" />
                </div>
              </div>

              <div>
                <p class="mb-1.5 text-xs text-zinc-500">Resultado</p>
                <div class="relative w-24 shrink-0 overflow-hidden rounded-xl border border-amber-500/25" style="aspect-ratio: 4/5">
                  <img :src="focalCharAvatar" class="h-full w-full select-none object-cover pointer-events-none" :style="{ objectPosition: focalPoint }" draggable="false" alt="resultado" />
                </div>
                <p class="mt-1 text-center text-[0.6rem] text-zinc-600">{{ focalPoint }}</p>
              </div>
            </div>

            <div v-else-if="focalCharId && !focalCharAvatar" class="text-sm italic text-zinc-500">
              Este personagem não tem avatar.
            </div>
          </div>
        </section>

        <!-- ── Informações Adicionais dos Deuses ──────────────────────────── -->
        <section id="god-info" class="gm-card border-amber-500/15">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-amber-500/10 text-amber-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <h2 class="gm-title">Informações Adicionais dos Deuses</h2>
              <p class="gm-subtitle">Info exclusiva de uma divindade para um personagem específico — visível só para ele</p>
            </div>
          </div>

          <!-- Step 1: Character -->
          <div class="mb-5">
            <label class="gm-label">1. Selecionar personagem</label>
            <VSelect
              v-model="godInfoCharacterId"
              :options="characterOptions"
              placeholder="Selecionar personagem..."
              root-class="w-full sm:w-80"
              aria-label="Personagem"
            />
          </div>

          <!-- Step 2: God image picker -->
          <div class="mb-5">
            <label class="gm-label">2. Selecionar divindade</label>
            <div v-if="publicGodsList.length === 0" class="gm-empty">Nenhuma divindade cadastrada.</div>
            <div v-else class="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
              <button
                v-for="g in publicGodsList"
                :key="g.id"
                type="button"
                @click="godInfoGodId = g.id"
                class="god-picker-card group relative overflow-hidden rounded-xl border-2 transition-all duration-200"
                :class="godInfoGodId === g.id
                  ? 'border-amber-500 shadow-lg shadow-amber-500/20 scale-[1.04]'
                  : 'border-white/10 hover:border-white/25 hover:scale-[1.02]'"
                :title="g.name"
                :aria-label="g.name"
                :aria-pressed="godInfoGodId === g.id"
              >
                <div class="aspect-square overflow-hidden">
                  <img
                    v-if="godImageFor(g.name)"
                    :src="godImageFor(g.name)"
                    :alt="g.name"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div v-else class="flex h-full w-full items-center justify-center bg-violet-950/60 text-base font-bold text-zinc-400">
                    {{ g.name.charAt(0) }}
                  </div>
                </div>
                <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-1.5">
                  <p class="text-center text-[0.55rem] font-medium leading-tight text-white line-clamp-2">{{ g.name }}</p>
                </div>
                <div
                  v-if="godInfoGodId === g.id"
                  class="absolute inset-0 rounded-xl ring-2 ring-inset ring-amber-500/60"
                />
              </button>
            </div>

            <!-- Selected god preview -->
            <div v-if="godInfoGodId" class="mt-3 flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-950/10 px-4 py-2.5">
              <div class="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                <img
                  v-if="selectedGod && godImageFor(selectedGod.name)"
                  :src="godImageFor(selectedGod.name)"
                  class="h-full w-full object-cover"
                  alt=""
                />
              </div>
              <p class="text-sm font-semibold text-amber-200">
                {{ selectedGod?.name }}
              </p>
              <button
                @click="godInfoGodId = ''"
                class="ml-auto text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Trocar
              </button>
            </div>
          </div>

          <!-- Step 3: Text -->
          <div class="mb-5">
            <label class="gm-label">3. Texto da informação adicional</label>
            <textarea
              v-model="godInfoText"
              rows="4"
              placeholder="Escreva o conhecimento exclusivo desta divindade para o personagem. Deixe em branco para remover."
              class="gm-textarea w-full resize-none"
            />
            <p class="mt-1 text-xs text-zinc-600">Deixe em branco e salve para remover a informação.</p>
          </div>

          <div class="flex items-center gap-4">
            <button
              @click="salvarGodInfo"
              :disabled="loadingGodInfo || !godInfoCharacterId || !godInfoGodId"
              class="gm-btn-amber disabled:cursor-not-allowed disabled:opacity-40"
            >
              {{ loadingGodInfo ? 'Salvando...' : 'Salvar Informação' }}
            </button>
            <p
              v-if="godInfoFeedback"
              class="text-sm"
              :class="godInfoFeedbackError ? 'text-red-400' : 'text-emerald-400'"
            >{{ godInfoFeedback }}</p>
          </div>
        </section>

        <!-- ── Deletar Personagem ──────────────────────────────────────────── -->
        <section id="deletar-personagem" class="gm-card border-red-900/30">
          <div class="gm-card-header">
            <div class="gm-icon-wrap bg-red-500/10 text-red-400">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </div>
            <div>
              <h2 class="gm-title text-red-400">Deletar Personagem</h2>
              <p class="gm-subtitle">Remove o registro do banco e apaga a imagem do storage — irreversível</p>
            </div>
          </div>

          <div class="space-y-3">
            <VSelect
              v-model="deleteCharacterId"
              :options="characterOptions"
              placeholder="Selecione o personagem a deletar"
              aria-label="Personagem a deletar"
            />

            <template v-if="deleteCharacterId">
              <p class="text-sm text-zinc-400">
                Digite <span class="font-bold text-red-300">{{ deleteCharacterName }}</span> para confirmar:
              </p>
              <input
                v-model="deleteConfirmName"
                type="text"
                :placeholder="deleteCharacterName"
                class="gm-input border-red-800/50 focus:border-red-500/70"
                aria-label="Confirmar nome do personagem"
              />
              <button
                @click="deletarPersonagem"
                :disabled="loadingDelete || deleteConfirmName.trim().toLowerCase() !== deleteCharacterName.toLowerCase()"
                class="rounded-xl bg-red-800/80 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700/80 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {{ loadingDelete ? 'Deletando...' : 'Deletar Permanentemente' }}
              </button>
            </template>
          </div>
        </section>

        <!-- Global feedback -->
        <p v-if="feedback" class="text-sm" :class="feedbackError ? 'text-red-400' : 'text-emerald-400'">
          {{ feedback }}
        </p>
      </main>
    </TemaDarkLight>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useMasterApprovalsStore } from '@/stores/masterApprovals'
import { useMasterCatalogStore } from '@/stores/masterCatalog'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import VSelect from '@/components/VSelect.vue'
import {
  addCharacterCreationAllowedEmail,
  deleteCharacterAsMaster,
  getCharacterById,
  listCharacterCreationAllowedEmails,
  removeCharacterCreationAllowedEmail,
  setAvatarFocalPoint,
  setCharacterGodInfo,
} from '@/lib/api/personagens.api'
import { listPublicGods } from '@/lib/api/gods.api'
import type { GodApi } from '@/types/supabase'
import { adicionarPontosDeClasse } from '@/lib/api/classes.api'
import {
  listAllLoreNotes,
  createLoreNote,
  deleteLoreNote as deleteLoreNoteApi,
} from '@/lib/api/lore-notes.api'
import type { LoreNoteApi } from '@/lib/api/lore-notes.api'
import { uploadLorePdf } from '@/lib/supabase/storage'

// ── God static images (same as DeusesView) ───────────────────────────────────
import pharasmaImage from '@/assets/images/pharasma.png'
import asmodeusImage from '@/assets/images/asmodeus.png'
import inariImage from '@/assets/images/inari.png'
import iomedaeImage from '@/assets/images/iomedae.png'
import sarenraeImage from '@/assets/images/sarenrae.png'
import zonKuthonImage from '@/assets/images/Zon-Kuthon.jpg'
import norgorberImage from '@/assets/images/Norgorber.jpg'
import gorumImage from '@/assets/images/Gorum.jpg'
import urgathoaImage from '@/assets/images/Urgathoa.png'
import rovagugImage from '@/assets/images/Rovagug.jpg'
import calistriaImage from '@/assets/images/Calistria.png'
import mrthosImage from '@/assets/images/Morthos.png'
import vesperaImage from '@/assets/images/Vespera.png'
import desnaImage from '@/assets/images/Desna.png'
import shelynImage from '@/assets/images/Shelyn.png'
import erastilImage from '@/assets/images/erastil.jpg'
import caydenCaileanImage from '@/assets/images/Cayden Cailean.png'
import kurgessImage from '@/assets/images/Kurgess.jpg'
import torakImage from '@/assets/images/Torak.jpg'
import lirielImage from '@/assets/images/Liriel.png'
import zephyrosImage from '@/assets/images/Zephyros.png'

const normalizeText = (value: unknown): string => {
  if (!value || typeof value !== 'string') return ''
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
}

const GOD_IMAGES: Record<string, string> = {
  pharasma: pharasmaImage,
  asmodeus: asmodeusImage,
  inari: inariImage,
  iomedae: iomedaeImage,
  sarenrae: sarenraeImage,
  'zon-kuthon': zonKuthonImage,
  norgorber: norgorberImage,
  gorum: gorumImage,
  urgathoa: urgathoaImage,
  rovagug: rovagugImage,
  calistria: calistriaImage,
  morthos: mrthosImage,
  vespera: vesperaImage,
  desna: desnaImage,
  shelyn: shelynImage,
  erastil: erastilImage,
  'cayden cailean': caydenCaileanImage,
  kurgess: kurgessImage,
  torak: torakImage,
  liriel: lirielImage,
  zephyros: zephyrosImage,
}

function godImageFor(name: string): string {
  return GOD_IMAGES[normalizeText(name)] ?? ''
}

const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const masterApprovalsStore = useMasterApprovalsStore()
const masterCatalogStore = useMasterCatalogStore()

const loading = ref(false)
const feedback = ref('')
const feedbackError = ref(false)

const selectedCharacterId = ref('')
const skillName = ref('')
const titleName = ref('')
const className = ref('')
const classTier = ref('Base')
const classDescription = ref('')
const titleTier = ref('Comum')
const titleDescription = ref('')
const adventureNote = ref('')
const emailsLiberadosCriacao = ref<string[]>([])
const novoEmailLiberado = ref('')
const loadingEmailsLiberados = ref(false)

const classPointsCharacterId = ref('')
const classPointsAmount = ref(1)
const loadingClassPoints = ref(false)

// Lore Notes
const loreNotes = ref<LoreNoteApi[]>([])
const loreNoteTitle = ref('')
const loreNoteSubtitle = ref('')
const loreNoteContent = ref('')
const loreNoteCharacterId = ref<string>('')
const loadingLoreNotes = ref(false)
const inputPdfRef = ref<HTMLInputElement | null>(null)
const lorePdfFile = ref<File | null>(null)
const lorePdfUrl = ref<string | null>(null)
const loadingPdf = ref(false)

const lorePreviewPage1 = computed(() => {
  const first = loreNoteContent.value.split(/\n---+\n/)[0]?.trim()
  return first || ''
})
const loreNotePagesCount = computed(() =>
  loreNoteContent.value.trim() ? loreNoteContent.value.split(/\n---+\n/).length : 0
)

function acionarInputPdf() {
  inputPdfRef.value?.click()
}

function selecionarPdf(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  lorePdfFile.value = file
  lorePdfUrl.value = null
}

async function carregarLoreNotes() {
  try {
    loreNotes.value = await listAllLoreNotes()
  } catch {
    // tabela pode não existir ainda
  }
}

function nomePersonagemDaNota(characterId: string | null): string {
  if (!characterId) return 'Global'
  return characters.value.find((c) => c.characterId === characterId)?.name ?? characterId
}

async function criarLoreNote() {
  if (!loreNoteTitle.value.trim() || !loreNoteContent.value.trim()) return
  loadingLoreNotes.value = true
  try {
    let pdfUrl: string | null = lorePdfUrl.value
    if (lorePdfFile.value && !pdfUrl) {
      loadingPdf.value = true
      pdfUrl = await uploadLorePdf(lorePdfFile.value)
      loadingPdf.value = false
    }
    await createLoreNote({
      title: loreNoteTitle.value.trim(),
      subtitle: loreNoteSubtitle.value.trim() || undefined,
      content: loreNoteContent.value,
      pdfUrl: pdfUrl || null,
      characterId: loreNoteCharacterId.value || null,
    })
    loreNoteTitle.value = ''
    loreNoteSubtitle.value = ''
    loreNoteContent.value = ''
    loreNoteCharacterId.value = ''
    lorePdfFile.value = null
    lorePdfUrl.value = null
    await carregarLoreNotes()
    feedback.value = 'Nota de lore criada com sucesso.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao criar nota de lore.'
    feedbackError.value = true
    loadingPdf.value = false
  } finally {
    loadingLoreNotes.value = false
  }
}

async function deletarLoreNote(id: string) {
  loadingLoreNotes.value = true
  try {
    await deleteLoreNoteApi(id)
    await carregarLoreNotes()
    feedback.value = 'Nota de lore removida.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao remover nota.'
    feedbackError.value = true
  } finally {
    loadingLoreNotes.value = false
  }
}

// ── Focal Point do Avatar ─────────────────────────────────────────────────────
const focalCharId     = ref('')
const focalCharAvatar = ref<string | null>(null)
const focalPoint      = ref('center 20%')
const focalMarkerX    = ref(50)
const focalMarkerY    = ref(20)
const loadingFocal    = ref(false)
const focalFeedback   = ref('')
const focalFeedbackError = ref(false)
const focalImageRef   = ref<HTMLElement | null>(null)

const focalPresets = [
  { label: 'Topo esq', value: '20% 10%' },
  { label: 'Topo',     value: 'center 10%' },
  { label: 'Topo dir', value: '80% 10%' },
  { label: 'Meio esq', value: '20% 50%' },
  { label: 'Centro',   value: 'center 50%' },
  { label: 'Meio dir', value: '80% 50%' },
  { label: 'Base esq', value: '20% 90%' },
  { label: 'Base',     value: 'center 90%' },
  { label: 'Base dir', value: '80% 90%' },
]

async function carregarFocalChar() {
  if (!focalCharId.value) { focalCharAvatar.value = null; return }
  try {
    const char = await getCharacterById(focalCharId.value, true)
    focalCharAvatar.value = char.avatarUrl
    const saved: string = char.data?.avatarFocalPoint ?? 'center 20%'
    aplicarPreset(saved)
  } catch {
    focalCharAvatar.value = null
  }
}

function aplicarPreset(value: string) {
  focalPoint.value = value
  const parts = value.trim().split(/\s+/)
  const parseP = (s: string) => {
    if (s === 'center') return 50
    if (s === 'left')   return 0
    if (s === 'right')  return 100
    if (s === 'top')    return 0
    if (s === 'bottom') return 100
    return parseFloat(s)
  }
  focalMarkerX.value = parts[0] ? parseP(parts[0]) : 50
  focalMarkerY.value = parts[1] ? parseP(parts[1]) : 20
}

function onFocalImageClick(e: MouseEvent) {
  const el = e.currentTarget as HTMLElement
  if (!el) return
  const rect = el.getBoundingClientRect()
  const x = Math.min(100, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * 100)))
  const y = Math.min(100, Math.max(0, Math.round(((e.clientY - rect.top)  / rect.height) * 100)))
  focalMarkerX.value = x
  focalMarkerY.value = y
  focalPoint.value = `${x}% ${y}%`
}

async function salvarFocalPoint() {
  if (!focalCharId.value) return
  loadingFocal.value = true
  focalFeedback.value = ''
  try {
    await setAvatarFocalPoint(focalCharId.value, focalPoint.value)
    focalFeedback.value = 'Posição salva com sucesso.'
    focalFeedbackError.value = false
    await charactersStore.fetchPaginaInicial()
  } catch (err: any) {
    focalFeedback.value = err?.response?.data?.message || 'Erro ao salvar posição.'
    focalFeedbackError.value = true
  } finally {
    loadingFocal.value = false
  }
}

// ── God Additional Info ──────────────────────────────────────────────────────
const godInfoCharacterId = ref('')
const godInfoGodId = ref('')
const godInfoText = ref('')
const loadingGodInfo = ref(false)
const godInfoFeedback = ref('')
const godInfoFeedbackError = ref(false)
const publicGodsList = ref<GodApi[]>([])

async function carregarDeusesParaInfo() {
  try {
    publicGodsList.value = await listPublicGods()
  } catch {
    // silently ignore
  }
}

async function salvarGodInfo() {
  if (!godInfoCharacterId.value || !godInfoGodId.value) return
  loadingGodInfo.value = true
  godInfoFeedback.value = ''
  try {
    await setCharacterGodInfo(godInfoCharacterId.value, godInfoGodId.value, godInfoText.value)
    godInfoFeedback.value = godInfoText.value.trim()
      ? 'Informação salva com sucesso.'
      : 'Informação removida.'
    godInfoFeedbackError.value = false
  } catch (err: any) {
    godInfoFeedback.value = err?.response?.data?.message || 'Erro ao salvar informação.'
    godInfoFeedbackError.value = true
  } finally {
    loadingGodInfo.value = false
  }
}

const deleteCharacterId = ref('')
const deleteConfirmName = ref('')
const loadingDelete = ref(false)
const deleteCharacterName = computed(
  () => characters.value.find((c) => c.characterId === deleteCharacterId.value)?.name ?? '',
)

const pendingApprovals = computed(() => masterApprovalsStore.pendingApprovals)
const pendingCount = computed(() => pendingApprovals.value.length)
const characters = computed(() => charactersStore.publicCharacters)

const characterOptions = computed(() =>
  characters.value.map((c) => ({ value: c.characterId, label: c.name })),
)

const loreCharacterOptions = computed(() => [
  { value: '', label: 'Global — visível a todos' },
  ...characters.value.map((c) => ({ value: c.characterId, label: `${c.name} — exclusivo` })),
])

const selectedGod = computed(() =>
  publicGodsList.value.find((g) => g.id === godInfoGodId.value),
)

watch(focalCharId, carregarFocalChar)
const panelMenuItems = [
  { id: 'pendencias', label: 'Pendencias' },
  { id: 'emails-cadastro', label: 'Cadastro Email' },
  { id: 'lore-notes', label: 'Notas de Lore' },
  { id: 'avatar-focal', label: 'Posição do Avatar' },
  { id: 'god-info', label: 'Info Deuses' },
  { id: 'guia-deuses', label: 'Deuses' },
  { id: 'mapas', label: 'Mapas' },
  { id: 'armas', label: 'Equipamentos' },
  { id: 'racas', label: 'Raças' },
  { id: 'deletar-personagem', label: 'Deletar Personagem', danger: true },
  { id: 'logout', label: 'Logout', danger: true },
]

async function handlePanelMenuSelect(itemId: string) {
  if (itemId === 'pendencias') {
    goSection('pendencias')
    return
  }

  if (itemId === 'guia-deuses') {
    goMasterGods()
    return
  }

  if (itemId === 'emails-cadastro') {
    goSection('emails-cadastro')
    return
  }

  if (itemId === 'lore-notes') {
    goSection('lore-notes')
    return
  }

  if (itemId === 'avatar-focal') {
    goSection('avatar-focal')
    return
  }

  if (itemId === 'god-info') {
    goSection('god-info')
    return
  }

  if (itemId === 'mapas') {
    goMasterMaps()
    return
  }

  if (itemId === 'armas') {
    goMasterWeapons()
    return
  }

  if (itemId === 'racas') {
    goMasterRacas()
    return
  }

  if (itemId === 'deletar-personagem') {
    goSection('deletar-personagem')
    return
  }

  if (itemId === 'logout') {
    await logout()
  }
}

function goSection(sectionId: string) {
  const el = document.getElementById(sectionId)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadAll() {
  loading.value = true
  feedback.value = ''
  try {
    await Promise.all([
      masterApprovalsStore.fetchPendingApprovals(),
      charactersStore.fetchPaginaInicial(),
      carregarEmailsLiberados(),
      carregarLoreNotes(),
      carregarDeusesParaInfo(),
    ])
  } catch {
    feedback.value = 'Nao foi possivel carregar os dados do painel mestre.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

async function carregarEmailsLiberados() {
  const data = await listCharacterCreationAllowedEmails()
  emailsLiberadosCriacao.value = [...(data.emails ?? [])].sort((a, b) => a.localeCompare(b))
}

async function adicionarEmailLiberado() {
  const email = novoEmailLiberado.value.trim().toLowerCase()
  if (!email) return

  loadingEmailsLiberados.value = true
  try {
    await addCharacterCreationAllowedEmail(email)
    novoEmailLiberado.value = ''
    await carregarEmailsLiberados()
    feedback.value = 'Email liberado para criacao de personagem.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao liberar email.'
    feedbackError.value = true
  } finally {
    loadingEmailsLiberados.value = false
  }
}

async function removerEmailLiberado(email: string) {
  loadingEmailsLiberados.value = true
  try {
    await removeCharacterCreationAllowedEmail(email)
    await carregarEmailsLiberados()
    feedback.value = 'Email removido da lista de liberacao.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao remover email.'
    feedbackError.value = true
  } finally {
    loadingEmailsLiberados.value = false
  }
}

async function review(characterId: string, approve: boolean) {
  loading.value = true
  feedback.value = ''
  try {
    await masterApprovalsStore.reviewPendingApproval(characterId, approve)
    feedback.value = approve ? 'Solicitacao aprovada.' : 'Solicitacao rejeitada.'
    feedbackError.value = false
  } catch {
    feedback.value = 'Erro ao revisar solicitacao.'
    feedbackError.value = true
  } finally {
    loading.value = false
  }
}

async function addSkill() {
  if (!selectedCharacterId.value) {
    feedback.value = 'Selecione um personagem para adicionar skill.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addSkillToCharacter(selectedCharacterId.value, skillName.value)
    feedback.value = 'Skill adicionada ao personagem.'
    feedbackError.value = false
    skillName.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar skill.'
    feedbackError.value = true
  }
}

async function addTitleToCharacter() {
  if (!selectedCharacterId.value) {
    feedback.value = 'Selecione um personagem para adicionar titulo.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addTitleToCharacter(selectedCharacterId.value, titleName.value)
    feedback.value = 'Titulo adicionado ao personagem.'
    feedbackError.value = false
    titleName.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar titulo.'
    feedbackError.value = true
  }
}

async function saveClass() {
  try {
    await masterCatalogStore.createClass({
      name: className.value,
      tier: classTier.value,
      description: classDescription.value,
    })

    if (titleName.value.trim()) {
      await masterCatalogStore.createTitle({
        name: titleName.value,
        tier: titleTier.value,
        description: titleDescription.value,
      })
    }

    feedback.value = 'Classe/titulo salvos com sucesso.'
    feedbackError.value = false
    className.value = ''
    classDescription.value = ''
    titleDescription.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao salvar classe/titulo.'
    feedbackError.value = true
  }
}

async function addAdventureNote() {
  if (!selectedCharacterId.value) {
    feedback.value = 'Selecione um personagem para adicionar nota.'
    feedbackError.value = true
    return
  }

  try {
    await masterCatalogStore.addAdventureNoteToCharacter(
      selectedCharacterId.value,
      adventureNote.value,
    )
    feedback.value = 'Nota de aventura adicionada ao personagem.'
    feedbackError.value = false
    adventureNote.value = ''
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao adicionar nota.'
    feedbackError.value = true
  }
}

async function grantClassPoints() {
  if (!classPointsCharacterId.value) {
    feedback.value = 'Selecione um personagem para conceder pontos.'
    feedbackError.value = true
    return
  }
  if (!classPointsAmount.value || classPointsAmount.value < 1) {
    feedback.value = 'Informe uma quantidade válida de pontos (mínimo 1).'
    feedbackError.value = true
    return
  }

  loadingClassPoints.value = true
  try {
    await adicionarPontosDeClasse(classPointsCharacterId.value, { pontos: classPointsAmount.value })
    feedback.value = `${classPointsAmount.value} ponto(s) de classe concedido(s) com sucesso.`
    feedbackError.value = false
    classPointsAmount.value = 1
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao conceder pontos de classe.'
    feedbackError.value = true
  } finally {
    loadingClassPoints.value = false
  }
}

async function deletarPersonagem() {
  if (!deleteCharacterId.value) {
    feedback.value = 'Selecione um personagem para deletar.'
    feedbackError.value = true
    return
  }

  if (deleteConfirmName.value.trim().toLowerCase() !== deleteCharacterName.value.toLowerCase()) {
    feedback.value = 'Nome de confirmacao nao confere. Digite exatamente o nome do personagem.'
    feedbackError.value = true
    return
  }

  loadingDelete.value = true
  feedback.value = ''
  try {
    await deleteCharacterAsMaster(deleteCharacterId.value)
    feedback.value = `Personagem "${deleteCharacterName.value}" deletado. Imagem removida do storage.`
    feedbackError.value = false
    deleteCharacterId.value = ''
    deleteConfirmName.value = ''
    await charactersStore.fetchPaginaInicial()
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao deletar personagem.'
    feedbackError.value = true
  } finally {
    loadingDelete.value = false
  }
}

function irParaDashboardPersonagem(characterId: string) {
  authStore.definirPersonagemAtivo(characterId)
  router.push({ name: 'dashboard', query: { characterId } })
}

function verFichaPersonagem() {
  if (!selectedCharacterId.value) return
  irParaDashboardPersonagem(selectedCharacterId.value)
}

function goLogin() {
  router.push({ name: 'login', query: { force: '1' } })
}

function goMasterGods() {
  router.push({ name: 'master-gods' })
}

function goMasterMaps() {
  router.push({ name: 'master-maps' })
}

function goMasterWeapons() {
  router.push({ name: 'master-weapons' })
}

function goMasterRacas() {
  router.push({ name: 'master-racas' })
}

async function logout() {
  await authStore.sair()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await loadAll()
})
</script>

<style scoped>
/* ── Page shell ── */
.page-root {
  background: #070C18;
}
.page-header {
  background: rgb(7 12 24 / 0.82);
  border-color: rgb(255 255 255 / 0.07);
}

/* ── Layout cards ── */
.gm-card {
  background: rgb(255 255 255 / 0.025);
  border-width: 1px;
  border-style: solid;
  border-radius: 1.25rem;
  padding: 1.25rem;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 24px rgb(0 0 0 / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.04);
}
@media (min-width: 640px) {
  .gm-card { padding: 1.5rem; }
}

.gm-card-header {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.gm-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.6rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.gm-title {
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1.3;
}

.gm-subtitle {
  font-size: 0.75rem;
  color: #71717a;
  margin-top: 0.15rem;
  line-height: 1.5;
}

.gm-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #52525b;
  margin-bottom: 0.5rem;
}

.gm-empty {
  font-size: 0.875rem;
  color: #52525b;
  font-style: italic;
  padding: 0.5rem 0;
}

/* ── Form controls ── */
.gm-input,
.gm-select,
.gm-textarea {
  background: rgb(0 0 0 / 0.35);
  border: 1px solid rgb(255 255 255 / 0.09);
  border-radius: 0.75rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  padding: 0.55rem 0.85rem;
  width: 100%;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.gm-input:focus,
.gm-select:focus,
.gm-textarea:focus {
  border-color: rgb(139 92 246 / 0.55);
  box-shadow: 0 0 0 3px rgb(139 92 246 / 0.12);
}
.gm-input::placeholder,
.gm-textarea::placeholder {
  color: #3f3f46;
}
.gm-select option {
  background: #0f172a;
  color: #e2e8f0;
}

/* ── Buttons ── */
.gm-btn-violet {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 0.75rem;
  background: rgb(109 40 217 / 0.7);
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  transition: background 0.15s, transform 0.1s;
}
.gm-btn-violet:hover {
  background: rgb(109 40 217 / 0.9);
}

.gm-btn-amber {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 0.75rem;
  background: rgb(180 83 9 / 0.7);
  padding: 0.5rem 1.1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  transition: background 0.15s;
}
.gm-btn-amber:hover {
  background: rgb(180 83 9 / 0.9);
}

.gm-btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 0.75rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04);
  padding: 0.45rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: #a1a1aa;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.gm-btn-ghost:hover {
  background: rgb(255 255 255 / 0.07);
  border-color: rgb(255 255 255 / 0.18);
  color: #e4e4e7;
}

.gm-btn-success {
  border-radius: 0.65rem;
  background: rgb(5 150 105 / 0.75);
  padding: 0.4rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  transition: background 0.15s;
}
.gm-btn-success:hover { background: rgb(5 150 105 / 0.95); }

.gm-btn-danger-sm {
  border-radius: 0.65rem;
  background: rgb(185 28 28 / 0.6);
  padding: 0.4rem 0.9rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #fff;
  transition: background 0.15s;
}
.gm-btn-danger-sm:hover { background: rgb(185 28 28 / 0.85); }

/* ── Quick link cards ── */
.gm-link-card {
  border-radius: 1.1rem;
  border: 1px solid rgb(255 255 255 / 0.07);
  background: rgb(255 255 255 / 0.025);
  padding: 1.1rem 1.25rem;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
  cursor: pointer;
}
.gm-link-card:hover {
  background: rgb(255 255 255 / 0.045);
  border-color: rgb(255 255 255 / 0.13);
  transform: translateY(-2px);
}

/* ── Character portrait cards ── */
.master-char-card {
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  text-align: left;
}

/* ── God picker ── */
.god-picker-card {
  cursor: pointer;
  background: rgb(10 10 24 / 0.6);
}

/* ── Notification bell ── */
.notification-bell {
  position: relative;
  display: inline-flex;
  height: 2.4rem;
  width: 2.4rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.85rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(255 255 255 / 0.04);
  color: #a78bfa;
  transition: background 0.15s, border-color 0.15s;
}
.notification-bell:hover {
  background: rgb(255 255 255 / 0.08);
  border-color: rgb(255 255 255 / 0.18);
}

.notification-badge {
  position: absolute;
  right: -0.3rem;
  top: -0.3rem;
  min-width: 1rem;
  border-radius: 999px;
  background: #ef4444;
  padding: 0.1rem 0.28rem;
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
}

/* ── Focal Point Marker ── */
.focal-marker {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1.5px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.5);
  background: rgba(200, 160, 80, 0.8);
  transform: translate(-50%, -50%);
  pointer-events: none;
  transition: left 0.1s ease, top 0.1s ease;
}

/* ── Lore Note Preview ── */
.lore-preview-page {
  background: linear-gradient(135deg, #f5e8ce 0%, #edddb0 100%);
  border: 1px solid #c9a87c60;
  box-shadow: inset 0 0 20px rgba(140,90,30,0.08), 0 4px 16px rgba(0,0,0,0.3);
}
.lore-preview-title {
  font-family: 'Cinzel', serif;
  font-size: 0.78rem;
  font-weight: 700;
  color: #1a0e08;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 2px;
}
.lore-preview-subtitle {
  font-family: 'EB Garamond', serif;
  font-size: 0.68rem;
  font-style: italic;
  color: #4a3520;
}
.lore-preview-rule {
  height: 1px;
  background: linear-gradient(to right, transparent, #c9a87c, transparent);
  margin: 5px 0;
}
.lore-preview-text {
  font-family: 'EB Garamond', serif;
  font-size: 0.7rem;
  color: #1a0e08;
  line-height: 1.65;
}
.lore-preview-empty {
  font-family: 'EB Garamond', serif;
  font-size: 0.68rem;
  font-style: italic;
  color: #9a7a4a;
  opacity: 0.6;
}

/* ══ Light mode overrides ══════════════════════════════════════════════════ */
:global(html.theme-light) .page-root {
  background: var(--bg-page);
  color: var(--text-main);
}
:global(html.theme-light) .page-ambient {
  display: none;
}
:global(html.theme-light) .page-header {
  background: rgb(255 255 255 / 0.9);
  border-color: var(--border-soft);
}
:global(html.theme-light) .gm-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
  box-shadow: 0 2px 10px rgb(0 0 0 / 0.06);
}
:global(html.theme-light) .gm-title {
  color: var(--text-main);
}
:global(html.theme-light) .gm-subtitle {
  color: var(--text-muted);
}
:global(html.theme-light) .gm-label {
  color: var(--text-muted);
}
:global(html.theme-light) .gm-empty {
  color: var(--text-muted);
}
:global(html.theme-light) .gm-input,
:global(html.theme-light) .gm-select,
:global(html.theme-light) .gm-textarea {
  background: #fff;
  border-color: var(--border-soft);
  color: var(--text-main);
}
:global(html.theme-light) .gm-input::placeholder,
:global(html.theme-light) .gm-textarea::placeholder {
  color: #94a3b8;
}
:global(html.theme-light) .gm-input:focus,
:global(html.theme-light) .gm-select:focus,
:global(html.theme-light) .gm-textarea:focus {
  border-color: var(--ring-soft);
  box-shadow: 0 0 0 3px rgb(165 180 252 / 0.2);
}
:global(html.theme-light) .gm-btn-ghost {
  background: var(--bg-soft);
  border-color: var(--border-soft);
  color: var(--text-muted);
}
:global(html.theme-light) .gm-btn-ghost:hover {
  background: var(--accent-soft);
  color: var(--text-main);
}
:global(html.theme-light) .gm-link-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
}
:global(html.theme-light) .gm-link-card:hover {
  background: var(--bg-soft);
  border-color: var(--ring-soft);
}
:global(html.theme-light) .notification-bell {
  background: var(--bg-soft);
  border-color: var(--border-soft);
  color: var(--brand-primary);
}
:global(html.theme-light) .notification-bell:hover {
  background: var(--accent-soft);
}
:global(html.theme-light) .god-picker-card {
  background: var(--bg-soft);
}
:global(html.theme-light) .gm-inner-box {
  background: var(--bg-soft);
  border-color: var(--border-soft);
}
:global(html.theme-light) .master-char-card .rounded-2xl {
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.1);
}
</style>

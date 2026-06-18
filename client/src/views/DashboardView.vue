<template>
  <div class="dash-root min-h-screen relative overflow-x-hidden">
    <div class="dash-ambient absolute inset-0 pointer-events-none" />

    <div class="relative z-10 min-h-screen flex flex-col">

      <!-- ══ Header ══════════════════════════════════════════════════════════ -->
      <header class="dash-header sticky top-0 z-50 h-16 border-b px-4 sm:px-6 flex items-center justify-between backdrop-blur-md">
        <div class="flex items-center">
          <HamburgerDrawerMenu
            :items="dashboardHeaderMenuItems"
            :active-item-id="activeDashboardHeaderItem"
            aria-label="Abrir menu de navegação"
            @select="handleHeaderMenuSelect"
          />
        </div>

        <span class="font-cinzel text-base font-bold tracking-widest text-amber-400/90 select-none">
          Caminho Sem Volta
        </span>

        <div class="flex items-center gap-0.5">
          <!-- Notification Bell -->
          <div class="relative" @click.stop>
            <button
              @click="toggleNotifications"
              class="dash-icon-btn relative"
              title="Notificações"
              aria-label="Notificações"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span v-if="showBellBadge" class="notif-dot" :class="bellBadgeClass">{{ unreadCount > 0 && !hasUnseenResponse && !hasPendingRequest ? (unreadCount > 9 ? '9+' : unreadCount) : '' }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="showNotifications" class="dropdown-panel right-0 w-80">
                <div class="flex items-center justify-between px-4 py-3 border-b border-[#6B4E9E]/20">
                  <span class="text-sm font-semibold text-amber-400 font-cinzel">Notificações</span>
                  <button v-if="notifications.length > 0" @click="markAllRead" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Marcar como lido</button>
                </div>

                <!-- Status de pedido de alteração (só player) -->
                <div v-if="!authStore.eMestre && hasUnseenResponse" class="px-4 py-3 border-b border-red-500/20 bg-red-950/20">
                  <div class="flex items-start gap-2.5">
                    <div class="w-6 h-6 rounded-full bg-red-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-zinc-200">Solicitação processada</p>
                      <p class="text-xs text-zinc-500 mt-0.5">O mestre respondeu sua solicitação de alteração.</p>
                      <button @click.stop="markAsSeenResponse(); showNotifications = false" class="mt-1.5 text-xs text-red-400 hover:text-red-300 underline transition-colors">Marcar como visto</button>
                    </div>
                  </div>
                </div>
                <div v-else-if="!authStore.eMestre && hasPendingRequest" class="px-4 py-3 border-b border-orange-500/20 bg-orange-950/20">
                  <div class="flex items-start gap-2.5">
                    <div class="w-6 h-6 rounded-full bg-orange-900/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-zinc-200">Solicitação pendente</p>
                      <p class="text-xs text-zinc-500 mt-0.5">Aguardando aprovação do mestre.</p>
                    </div>
                  </div>
                </div>

                <div class="max-h-72 overflow-y-auto">
                  <div v-if="notifications.length === 0 && !hasPendingRequest && !hasUnseenResponse" class="px-4 py-8 text-center text-zinc-500 text-sm italic">Nenhuma novidade por enquanto.</div>
                  <button
                    v-for="notif in notifications"
                    :key="notif.id"
                    class="w-full flex items-start gap-3 px-4 py-3 border-b border-[#6B4E9E]/10 last:border-0 hover:bg-white/5 transition-colors text-left"
                    @click="openNotification(notif)"
                  >
                    <div class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      :class="notif.type === 'note' ? 'bg-amber-900/50' : 'bg-purple-900/50'">
                      <svg v-if="notif.type === 'note'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-zinc-200 truncate">{{ notif.title }}</p>
                      <p class="text-xs text-zinc-600 mt-0.5">{{ notif.typeLabel }}</p>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="flex-shrink-0 text-zinc-600 mt-1"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Settings menu -->
          <div class="relative" @click.stop>
            <button @click="toggleSettingsMenu" class="dash-icon-btn" title="Configurações" aria-label="Configurações">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>

            <Transition name="dropdown">
              <div v-if="showSettingsMenu" class="dropdown-panel right-0 w-52 p-1.5">
                <button v-if="authStore.eMestre" @click="retornarPainelMestre" class="dropdown-item text-amber-400">
                  ⚔ Painel do Mestre
                </button>
                <button @click="openSettings" class="dropdown-item">Configurações</button>
                <div class="my-1 h-px bg-white/10" />
                <button @click="logout" class="dropdown-item text-red-400">Sair</button>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <!-- ══ Main ══════════════════════════════════════════════════════════ -->
      <main class="flex-1 px-4 sm:px-6 py-6">

        <!-- Loading -->
        <div v-if="loading" class="h-64 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3">
            <div class="w-7 h-7 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <p class="text-zinc-500 text-sm">Carregando personagem...</p>
          </div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="h-64 flex items-center justify-center">
          <div class="dash-card p-8 text-center max-w-sm border-red-900/40">
            <p class="text-red-400 font-semibold">{{ error }}</p>
            <p v-if="errorHint" class="mt-2 text-zinc-500 text-sm">{{ errorHint }}</p>
            <div class="mt-5 flex gap-3 justify-center">
              <button @click="retryLoad" class="px-5 py-2 bg-violet-700 hover:bg-violet-600 rounded-xl text-sm font-semibold text-white transition-colors">Tentar novamente</button>
              <button @click="goBack" class="px-5 py-2 bg-red-900/50 hover:bg-red-800/60 rounded-xl text-sm font-semibold text-white transition-colors">Voltar</button>
            </div>
          </div>
        </div>

        <!-- Character loaded -->
        <div v-else-if="character" class="max-w-7xl mx-auto">
          <div class="flex flex-col lg:flex-row gap-6">

            <!-- ── Left: Portrait sidebar ──────────────────────────────── -->
            <div class="lg:w-72 xl:w-80 flex-shrink-0 space-y-3">

              <!-- Portrait card -->
              <div class="dash-portrait-card overflow-hidden">
                <div class="relative aspect-[3/4] overflow-hidden cursor-pointer group" @click="modalRetratoAberto = true" title="Clique para ampliar">
                  <img
                    v-if="character.avatarUrl"
                    :src="character.avatarUrl"
                    :alt="character.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    :style="{ objectPosition: character.data?.avatarFocalPoint ?? 'center 20%' }"
                  />
                  <div v-else class="w-full h-full dash-avatar-empty flex items-center justify-center">
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-zinc-600">
                      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                  </div>
                  <div class="absolute inset-0 bg-gradient-to-t from-[#070C18] via-[#070C18]/15 to-transparent" />
                  <div class="absolute bottom-0 left-0 right-0 p-4">
                    <h1 class="font-cinzel text-xl font-bold text-amber-300 leading-tight drop-shadow-lg">{{ character.name }}</h1>
                    <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span class="text-[0.65rem] font-bold tracking-wider bg-violet-900/70 border border-violet-600/50 text-violet-200 px-2 py-0.5 rounded-full uppercase">
                        Nível {{ character.level }}
                      </span>
                      <span v-if="character.status === 'morto'" class="text-[0.65rem] font-bold tracking-wider bg-red-950/80 border border-red-600/50 text-red-300 px-2 py-0.5 rounded-full uppercase">
                        Morto
                      </span>
                      <span v-if="characterClass" class="text-xs text-zinc-400 truncate max-w-[130px]">{{ characterClass }}</span>
                    </div>
                  </div>
                </div>

                <!-- Stats strip -->
                <div class="grid grid-cols-2 divide-x divide-[#6B4E9E]/15 border-t border-[#6B4E9E]/15">
                  <div class="px-3 py-3 text-center">
                    <p class="dash-tiny-label">Índole</p>
                    <p class="text-xs font-semibold mt-0.5 leading-tight" :class="indoleColor">{{ indoleLabel }}</p>
                  </div>
                  <div class="px-3 py-3 text-center">
                    <p class="dash-tiny-label">Pts. Classe</p>
                    <p class="text-xs font-bold mt-0.5 text-amber-400">{{ character.data?.classPoints ?? 0 }}</p>
                  </div>
                </div>
              </div>

              <!-- Manage button -->
              <button
                @click="openSettings"
                class="w-full py-2.5 rounded-xl dash-manage-btn flex items-center justify-center gap-2 text-sm transition-all"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span class="font-cinzel tracking-wide">Gerenciar Personagem</span>
              </button>
            </div>

            <!-- ── Right: Content area ─────────────────────────────────── -->
            <div class="flex-1 min-w-0">

              <!-- Tab nav (only 2 tabs) -->
              <div class="dash-tab-nav flex gap-1 p-1 rounded-xl border mb-5">
                <button
                  v-for="tab in tabs"
                  :key="tab.id"
                  @click="activeTab = tab.id"
                  class="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200"
                  :class="activeTab === tab.id ? 'dash-tab-active' : 'dash-tab-inactive'"
                >{{ tab.label }}</button>
              </div>

              <!-- ── Tab: Personagem ─────────────────────────────────── -->
              <div v-show="activeTab === 'personagem'" class="space-y-4">

                <!-- Level & stats card -->
                <div class="dash-card p-5">
                  <h3 class="dash-section-label mb-4">Visão Geral</h3>
                  <div class="grid grid-cols-3 gap-4">
                    <div class="text-center">
                      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto mb-2">
                        <span class="font-cinzel text-lg font-bold text-amber-400">{{ character.level }}</span>
                      </div>
                      <p class="dash-tiny-label">Nível</p>
                    </div>
                    <div class="text-center">
                      <div class="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center mx-auto mb-2">
                        <span class="font-cinzel text-lg font-bold text-violet-400">{{ character.data?.classPoints ?? 0 }}</span>
                      </div>
                      <p class="dash-tiny-label">Pts. Classe</p>
                    </div>
                    <div class="text-center">
                      <div class="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mx-auto mb-2">
                        <span class="text-lg" :class="indoleColor">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
                        </span>
                      </div>
                      <p class="dash-tiny-label">{{ indoleLabel }}</p>
                    </div>
                  </div>

                  <!-- Classes -->
                  <div v-if="classesPersonagem.length" class="mt-5 pt-4 border-t border-[#6B4E9E]/15">
                    <div class="flex items-center justify-between mb-3">
                      <p class="dash-section-label">Classes</p>
                      <span v-if="(character.data?.classPoints ?? 0) > 0" class="text-[0.65rem] font-bold text-amber-400 bg-amber-900/30 border border-amber-700/30 rounded-full px-2 py-0.5">
                        {{ character.data.classPoints }} pts. classe
                      </span>
                    </div>

                    <div class="space-y-3">
                      <div
                        v-for="cls in classesPersonagem"
                        :key="cls.classId ?? cls.name"
                        class="rounded-xl border border-amber-700/25 bg-amber-900/10 overflow-hidden"
                      >
                        <!-- Cabeçalho da classe -->
                        <div class="flex items-center justify-between px-3 py-2.5 border-b border-amber-700/15">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-sm font-semibold text-amber-200 truncate">{{ cls.name }}</span>
                            <span class="text-[0.6rem] font-bold text-amber-500/80 bg-amber-900/50 border border-amber-700/30 rounded-full px-1.5 py-0.5 font-cinzel shrink-0">Lv {{ cls.level ?? 1 }}</span>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <span v-if="(cls.skillPoints ?? 0) > 0" class="text-[0.6rem] font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-700/30 rounded-full px-1.5 py-0.5">
                              {{ cls.skillPoints }} pts. skill
                            </span>
                            <button
                              v-if="!authStore.eMestre && (character.data?.classPoints ?? 0) > 0"
                              type="button"
                              :disabled="levelandoClasse === String(cls.classId ?? cls.name)"
                              class="text-[0.6rem] font-semibold bg-amber-700/40 border border-amber-600/40 text-amber-300 rounded-lg px-2 py-1 hover:bg-amber-700/60 transition-colors disabled:opacity-50"
                              title="Gasta 1 ponto de classe e concede pontos de skill"
                              @click="levelarClasseHandler(cls)"
                            >
                              {{ levelandoClasse === String(cls.classId ?? cls.name) ? '...' : '↑ Ganhar pts. skill' }}
                            </button>
                          </div>
                        </div>

                        <!-- Skills da classe -->
                        <div class="px-3 py-2.5">
                          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-600 mb-2">Skills</p>
                          <div v-if="(cls.chosenSkills ?? []).length" class="flex flex-wrap gap-1.5 mb-2">
                            <span
                              v-for="skillName in cls.chosenSkills"
                              :key="skillName"
                              class="text-xs bg-violet-900/25 border border-violet-700/30 text-violet-300 px-2 py-0.5 rounded-full"
                            >{{ skillName }}</span>
                          </div>
                          <p v-else class="text-xs text-zinc-600 italic mb-2">Nenhuma skill aprendida ainda.</p>

                          <button
                            v-if="!authStore.eMestre && (cls.skillPoints ?? 0) > 0"
                            type="button"
                            class="text-[0.65rem] font-semibold border border-violet-600/40 bg-violet-900/20 text-violet-300 rounded-lg px-2.5 py-1 hover:bg-violet-900/40 transition-colors"
                            @click="abrirModalAprenderSkill(cls)"
                          >
                            + Aprender Skill (1 pt. skill)
                          </button>
                        </div>
                      </div>
                    </div>

                    <p v-if="erroLevelClasse" class="mt-2 text-xs text-red-400">{{ erroLevelClasse }}</p>
                    <p v-if="feedbackLevelClasse" class="mt-2 text-xs text-emerald-400">{{ feedbackLevelClasse }}</p>

                    <!-- Desbloquear nova classe -->
                    <div v-if="!authStore.eMestre && podeDesbloquearClasse" class="mt-3">
                      <button
                        type="button"
                        class="w-full rounded-xl border border-indigo-500/30 bg-indigo-900/20 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/40 transition-colors"
                        @click="abrirModalDesbloquearClasse"
                      >
                        + Desbloquear Nova Classe
                      </button>
                      <p class="mt-1 text-center text-[0.6rem] text-zinc-600">{{ msgPreReqClasse }}</p>
                    </div>
                  </div>
                </div>

                <!-- Atributos -->
                <div v-if="character.data?.atributos" class="dash-card p-5">
                  <h3 class="dash-section-label mb-4">Atributos</h3>
                  <div class="space-y-3">
                    <div v-for="attr in ATRIBUTOS_DASHBOARD" :key="attr.key" class="flex items-center gap-3">
                      <span class="text-[0.7rem] font-semibold text-zinc-500 w-24 shrink-0">{{ attr.label }}</span>
                      <div class="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-700"
                          :class="attr.barColor"
                          :style="`width: ${Math.min(((character.data.atributos as any)[attr.key] ?? 0) / 20 * 100, 100)}%`"
                        />
                      </div>
                      <span class="text-xs font-bold w-5 text-right shrink-0" :class="attr.color">{{ (character.data.atributos as any)[attr.key] ?? 0 }}</span>
                    </div>
                  </div>
                </div>

                <!-- Distribuir Pontos de Atributo -->
                <div v-if="!authStore.eMestre && (character.data?.pontosAtributo ?? 0) > 0" class="dash-card p-5">
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="dash-section-label">Distribuir Atributos</h3>
                    <span class="text-[0.65rem] font-bold text-emerald-400 bg-emerald-900/30 border border-emerald-700/30 rounded-full px-2 py-0.5">
                      {{ pontosRestantes }} ponto{{ pontosRestantes !== 1 ? 's' : '' }} disponível{{ pontosRestantes !== 1 ? 'is' : '' }}
                    </span>
                  </div>
                  <div class="space-y-3">
                    <div v-for="attr in ATRIBUTOS_DASHBOARD" :key="attr.key" class="flex items-center gap-3">
                      <span class="text-[0.7rem] font-semibold text-zinc-500 w-24 shrink-0">{{ attr.label }}</span>
                      <span class="text-xs font-bold shrink-0 w-6 text-right" :class="attr.color">
                        {{ (character.data.atributos as any)[attr.key] ?? 0 }}
                      </span>
                      <div class="flex items-center gap-1.5 flex-1 justify-end">
                        <button
                          type="button"
                          :disabled="(distribuicaoStaged[attr.key] ?? 0) <= 0"
                          class="w-6 h-6 rounded-full border border-white/15 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] disabled:opacity-30 text-sm leading-none transition-colors"
                          @click="ajustarStaged(attr.key, -1)"
                        >−</button>
                        <span class="text-xs font-bold w-6 text-center" :class="(distribuicaoStaged[attr.key] ?? 0) > 0 ? 'text-emerald-400' : 'text-zinc-600'">
                          +{{ distribuicaoStaged[attr.key] ?? 0 }}
                        </span>
                        <button
                          type="button"
                          :disabled="pontosRestantes <= 0"
                          class="w-6 h-6 rounded-full border border-white/15 bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] disabled:opacity-30 text-sm leading-none transition-colors"
                          @click="ajustarStaged(attr.key, 1)"
                        >+</button>
                        <span class="text-xs font-bold w-6 text-right" :class="attr.color">
                          → {{ ((character.data.atributos as any)[attr.key] ?? 0) + (distribuicaoStaged[attr.key] ?? 0) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="mt-4 flex gap-3">
                    <button
                      type="button"
                      :disabled="totalStagedAtributos <= 0"
                      class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white disabled:opacity-40 transition-colors"
                      @click="limparStaged"
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      :disabled="totalStagedAtributos <= 0 || distribuindoAtributos"
                      class="flex-1 rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60 transition-colors"
                      @click="modalConfirmarAtributos = true"
                    >
                      {{ distribuindoAtributos ? 'Salvando...' : `Distribuir ${totalStagedAtributos} ponto${totalStagedAtributos !== 1 ? 's' : ''}` }}
                    </button>
                  </div>
                  <p v-if="erroDistribuicao" class="mt-2 text-xs text-red-400">{{ erroDistribuicao }}</p>
                </div>

                <!-- Origem: Raça, Passado, Deus -->
                <div class="dash-card p-5">
                  <h3 class="dash-section-label mb-4">Origem</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <!-- Raça -->
                    <div
                      class="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors"
                      :class="racaPersonagem ? 'cursor-pointer hover:border-indigo-500/30 hover:bg-indigo-900/10' : ''"
                      @click="racaPersonagem && (modalRacaAberto = true)"
                    >
                      <div class="h-9 w-9 rounded-xl overflow-hidden border border-indigo-500/20 bg-indigo-900/20 shrink-0">
                        <img v-if="racaPersonagem?.foto_url" :src="racaPersonagem.foto_url" :alt="racaPersonagem.nome" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center text-sm text-indigo-400">⚔</div>
                      </div>
                      <div class="min-w-0">
                        <p class="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-400/70 mb-0.5">Raça</p>
                        <p class="text-sm font-semibold text-zinc-200 truncate">{{ racaPersonagem?.nome ?? '—' }}</p>
                      </div>
                    </div>

                    <!-- Passado -->
                    <div
                      class="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors"
                      :class="passadoPersonagem ? 'cursor-pointer hover:border-violet-500/30 hover:bg-violet-900/10' : ''"
                      @click="passadoPersonagem && (modalPassadoAberto = true)"
                    >
                      <div class="h-9 w-9 rounded-xl overflow-hidden border border-violet-500/20 bg-violet-900/20 shrink-0">
                        <img v-if="passadoPersonagem?.foto_url" :src="passadoPersonagem.foto_url" :alt="passadoPersonagem.nome" class="h-full w-full object-cover" />
                        <div v-else class="flex h-full items-center justify-center text-sm text-violet-400">📜</div>
                      </div>
                      <div class="min-w-0">
                        <p class="text-[0.6rem] font-bold uppercase tracking-widest text-violet-400/70 mb-0.5">Passado</p>
                        <p class="text-sm font-semibold text-zinc-200 truncate">{{ passadoPersonagem?.nome ?? '—' }}</p>
                      </div>
                    </div>

                    <!-- Deus -->
                    <div
                      class="relative flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-colors cursor-pointer hover:border-amber-500/30 hover:bg-amber-900/10"
                      @click="abrirModalDeus"
                    >
                      <div class="h-9 w-9 rounded-xl overflow-hidden border border-amber-500/20 bg-amber-900/20 shrink-0 flex items-center justify-center text-sm text-amber-400">✦</div>
                      <div class="min-w-0 flex-1">
                        <p class="text-[0.6rem] font-bold uppercase tracking-widest text-amber-400/70 mb-0.5">Deus</p>
                        <p class="text-sm font-semibold text-zinc-200 truncate">{{ deusPersonagem?.name ?? 'Nenhum' }}</p>
                      </div>
                      <span v-if="pendingDeusChange" class="absolute top-2 right-2 h-2 w-2 rounded-full bg-orange-400" title="Troca de deus aguardando aprovação" />
                    </div>

                  </div>
                </div>

                <!-- Skills -->
                <div v-if="(character.data?.skills ?? []).length" class="dash-card p-5">
                  <h3 class="dash-section-label mb-3">Skills</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="skill in character.data.skills"
                      :key="skill.name"
                      class="text-xs bg-violet-900/25 border border-violet-700/30 text-violet-300 px-2.5 py-1 rounded-full hover:bg-violet-900/40 transition-colors"
                    >{{ skill.name }}</span>
                  </div>
                </div>

                <!-- Titles -->
                <div v-if="(character.data?.titles ?? []).length" class="dash-card p-5">
                  <h3 class="dash-section-label mb-3">Títulos</h3>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="title in character.data.titles"
                      :key="title.name"
                      class="text-xs bg-amber-900/20 border border-amber-700/25 text-amber-300 px-2.5 py-1 rounded-full hover:bg-amber-900/35 transition-colors"
                    >{{ title.name }}</span>
                  </div>
                </div>

                <!-- Adventure Notes preview -->
                <div class="dash-card p-5">
                  <div class="flex items-center justify-between mb-3">
                    <h3 class="dash-section-label">Notas de Aventura</h3>
                    <button @click="goToNotas" class="text-xs text-amber-500 hover:text-amber-300 transition-colors flex items-center gap-1">
                      Ver livro
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                  <p v-if="!historyPreview" class="text-zinc-600 text-sm italic">Nenhuma anotação registrada ainda.</p>
                  <p v-else class="text-sm leading-relaxed whitespace-pre-wrap" style="color: var(--text-muted)">{{ historyPreview }}</p>
                </div>
              </div>

              <!-- ── Tab: Inventário ─────────────────────────────────── -->
              <div v-show="activeTab === 'inventario'" class="space-y-3">

                <!-- ── Equipamentos do Onboarding ──────────────────── -->
                <div class="dash-card overflow-hidden">

                  <!-- Header com peso -->
                  <div class="px-5 pt-4 pb-3 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400/70">
                        <path d="M14.5 17.5L3 6 3 3l3 0 11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>
                      </svg>
                      <span class="text-xs font-semibold font-cinzel text-amber-400">Equipamentos</span>
                      <span class="inv-count-badge">{{ equipamentosIniciais.length }} {{ equipamentosIniciais.length === 1 ? 'item' : 'itens' }}</span>
                    </div>
                    <span class="text-[0.7rem] font-semibold tabular-nums" :class="pesoPorcentagem >= 90 ? 'text-red-400' : pesoPorcentagem >= 70 ? 'text-amber-400' : 'text-zinc-400'">
                      {{ pesoAtual.toFixed(1) }} / {{ pesoMaximo.toFixed(1) }} kg
                    </span>
                  </div>

                  <!-- Barra de peso -->
                  <div class="mx-5 mb-1">
                    <div class="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-700"
                        :class="pesoPorcentagem >= 90 ? 'bg-red-500' : pesoPorcentagem >= 70 ? 'bg-amber-500' : 'bg-emerald-500'"
                        :style="`width: ${pesoPorcentagem}%`"
                      />
                    </div>
                    <div class="flex justify-between mt-1">
                      <span class="text-[0.6rem] text-zinc-600">Capacidade de carga</span>
                      <span class="text-[0.6rem] text-zinc-600">Força × 2</span>
                    </div>
                  </div>

                  <!-- Lista -->
                  <div class="px-5 pb-4 mt-3">
                    <div v-if="!equipamentosIniciais.length" class="inv-empty-state">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="mx-auto mb-2 opacity-20">
                        <path d="M14.5 17.5L3 6 3 3l3 0 11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/>
                      </svg>
                      <p class="text-sm font-medium" style="color:var(--text-muted)">Nenhum equipamento selecionado</p>
                      <p class="text-xs mt-0.5 opacity-60" style="color:var(--text-muted)">Itens escolhidos no início da jornada aparecem aqui</p>
                    </div>
                    <div v-else class="space-y-1.5">
                      <div
                        v-for="eq in equipamentosIniciais"
                        :key="eq.id"
                        class="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
                      >
                        <span class="text-sm font-medium text-zinc-300 truncate">{{ eq.nome }}</span>
                        <span class="text-xs text-zinc-500 ml-3 shrink-0 tabular-nums">{{ eq.peso.toFixed(1) }} kg</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- ── Inventário Geral ─────────────────────────────── -->
                <div class="dash-card overflow-hidden">

                  <!-- Card header -->
                  <div class="inv-card-header px-5 py-4 flex items-center justify-between">
                    <div class="flex items-center gap-2.5">
                      <div class="inv-header-icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                      </div>
                      <div>
                        <span class="text-xs font-semibold text-amber-400 font-cinzel">Inventário</span>
                        <span class="ml-2 inv-count-badge">{{ normalInventory.length }} {{ normalInventory.length === 1 ? 'item' : 'itens' }}</span>
                      </div>
                    </div>

                    <!-- Mochila Rápida trigger -->
                    <div class="relative" @click.stop>
                      <button
                        @click="toggleQuickInventory"
                        class="backpack-btn"
                        :class="showQuickInventory ? 'backpack-btn-active' : ''"
                        title="Mochila Rápida"
                        aria-label="Abrir mochila rápida"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                          <line x1="3" y1="6" x2="21" y2="6"/>
                          <path d="M16 10a4 4 0 0 1-8 0"/>
                        </svg>
                        <span class="backpack-label">Mochila</span>
                        <span v-if="quickInventory.length" class="backpack-badge">{{ quickInventory.length }}</span>
                      </button>

                      <!-- Mochila Rápida dropdown -->
                      <Transition name="dropdown">
                        <div v-if="showQuickInventory" class="quick-inv-panel">
                          <div class="quick-inv-head">
                            <div>
                              <p class="text-xs font-bold text-amber-400 font-cinzel">Mochila Rápida</p>
                              <p class="text-[0.65rem] mt-0.5" style="color:var(--text-muted)">O que você carrega no dia a dia</p>
                            </div>
                            <span v-if="quickInventory.length" class="inv-count-badge">{{ quickInventory.length }}</span>
                          </div>

                          <div class="quick-inv-body">
                            <!-- Add row: qty first, name second -->
                            <div class="quick-add-row">
                              <input
                                v-model.number="newQuickItemQty"
                                type="number"
                                min="1"
                                class="quick-qty-input text-center"
                              />
                              <input
                                v-model="newQuickItemName"
                                @keydown.enter="addQuickItem"
                                type="text"
                                placeholder="Nome do item..."
                                class="inv-input flex-1 text-xs"
                              />
                              <button
                                @click="addQuickItem"
                                :disabled="!newQuickItemName.trim() || savingQuickInventory"
                                class="inv-add-btn flex-shrink-0 disabled:opacity-40"
                              >
                                <svg v-if="savingQuickInventory" class="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="20"/></svg>
                                <span v-else class="text-sm font-bold">+</span>
                              </button>
                            </div>

                            <!-- Quick list -->
                            <div v-if="quickInventory.length === 0" class="py-5 text-center text-[0.68rem] italic" style="color:rgba(251,191,36,0.3)">
                              Mochila vazia
                            </div>
                            <div v-else class="quick-inv-list">
                              <div v-for="item in quickInventory" :key="item.id" class="quick-inv-item group">
                                <span class="quick-qty-tag">{{ item.quantity }}×</span>
                                <p class="flex-1 text-xs font-medium truncate quick-item-name">{{ item.name }}</p>
                                <button @click="removeQuickItem(item.id)" class="inv-remove opacity-0 group-hover:opacity-100" title="Remover">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Transition>
                    </div>
                  </div>

                  <!-- Divider -->
                  <div class="mx-5 h-px" style="background: var(--border-soft)" />

                  <!-- Add item form: qty first, name second -->
                  <div class="px-5 pt-4 pb-3">
                    <div class="inv-add-row">
                      <input
                        v-model.number="newItemQty"
                        type="number"
                        min="1"
                        class="inv-input inv-input-qty"
                      />
                      <input
                        v-model="newItemName"
                        @keydown.enter="addNormalItem"
                        type="text"
                        placeholder="Nome do item..."
                        class="inv-input flex-1"
                      />
                      <button
                        @click="addNormalItem"
                        :disabled="!newItemName.trim() || savingInventory"
                        class="inv-add-btn px-4 flex-shrink-0 disabled:opacity-40"
                      >
                        <svg v-if="savingInventory" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="30" stroke-dashoffset="20"/></svg>
                        <span v-else class="font-bold text-base">+</span>
                      </button>
                    </div>
                  </div>

                  <!-- Items -->
                  <div class="px-5 pb-5">
                    <div v-if="normalInventory.length === 0" class="inv-empty-state">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" class="mx-auto mb-2 opacity-20">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 0 1-8 0"/>
                      </svg>
                      <p class="text-sm font-medium" style="color:var(--text-muted)">Inventário vazio</p>
                      <p class="text-xs mt-0.5 opacity-60" style="color:var(--text-muted)">Use o campo acima para adicionar itens</p>
                    </div>

                    <TransitionGroup v-else name="inv-item" tag="div" class="inv-list">
                      <div v-for="item in normalInventory" :key="item.id" class="inv-item group">
                        <span class="inv-qty-tag flex-shrink-0">{{ item.quantity }}×</span>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-medium leading-snug truncate" style="color:var(--text-main)">{{ item.name }}</p>
                          <p v-if="item.description" class="text-[0.65rem] mt-0.5 truncate" style="color:var(--text-muted)">{{ item.description }}</p>
                        </div>
                        <button
                          @click="removeNormalItem(item.id)"
                          class="inv-remove opacity-0 group-hover:opacity-100 flex-shrink-0"
                          title="Remover"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      </div>
                    </TransitionGroup>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- ══ Manage Character Panel (player) ════════════════════════════════ -->
    <Transition name="manage-slide">
      <div
        v-if="showManagePanel && character && !authStore.eMestre"
        class="fixed inset-0 z-50 flex justify-end"
        @click.self="closeManagePanel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeManagePanel" />

        <!-- Panel -->
        <div class="manage-panel relative flex flex-col w-full max-w-[480px] h-full overflow-y-auto" @click.stop>

          <!-- Panel header -->
          <div class="manage-panel-header sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 class="font-cinzel font-bold text-amber-400 text-base tracking-wide">Gerenciar Personagem</h2>
              <p class="text-xs mt-0.5" style="color: var(--text-muted)">Suas informações pessoais</p>
            </div>
            <button @click="closeManagePanel" class="manage-close-btn" aria-label="Fechar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Current character info -->
          <div class="px-6 py-5 border-b border-[#6B4E9E]/15">
            <div class="flex gap-4 items-start">
              <div class="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-[#6B4E9E]/30">
                <img v-if="character.avatarUrl" :src="character.avatarUrl" :alt="character.name" class="w-full h-full object-cover" :style="{ objectPosition: character.data?.avatarFocalPoint ?? 'center 20%' }" />
                <div v-else class="w-full h-full dash-avatar-empty flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-zinc-600"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-cinzel font-bold text-amber-400 text-lg leading-tight">{{ character.name }}</p>
                <p class="text-xs mt-1 text-zinc-500">Nível {{ character.level }} {{ characterClass ? `· ${characterClass}` : '' }}</p>
                <p v-if="character.data?.history" class="text-xs mt-2 leading-relaxed text-zinc-500 line-clamp-2">{{ character.data.history }}</p>
              </div>
            </div>
          </div>

          <!-- Approval warning -->
          <div class="mx-6 mt-5 rounded-xl border border-amber-600/30 bg-amber-950/20 px-4 py-3 flex gap-3">
            <svg class="flex-shrink-0 mt-0.5 text-amber-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <p class="text-xs text-amber-200/80 leading-relaxed">Alterações de nome e imagem precisam de aprovação do mestre antes de serem aplicadas.</p>
          </div>

          <!-- Form -->
          <div class="px-6 py-5 space-y-6 flex-1">

            <!-- Nome -->
            <div>
              <label class="manage-field-label">Nome do personagem</label>
              <div class="manage-current-value mb-2">{{ character.name }}</div>
              <input
                v-model="requestedName"
                type="text"
                placeholder="Novo nome (deixe em branco para não alterar)"
                class="manage-input"
              />
            </div>

            <!-- Índole -->
            <div v-if="todasIndoles.length">
              <label class="manage-field-label">Índole</label>
              <p class="text-xs text-zinc-500 mb-2">Atual: <span :class="indoleColor" class="font-semibold">{{ indoleLabel }}</span></p>
              <div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                <button
                  v-for="ind in todasIndoles"
                  :key="ind.id"
                  type="button"
                  @click="requestedIndoleId = requestedIndoleId === ind.id ? null : ind.id"
                  class="rounded-xl border px-3 py-2 text-xs font-medium transition-all text-left"
                  :class="requestedIndoleId === ind.id
                    ? 'border-violet-500 bg-violet-600/20 text-violet-200'
                    : ind.id === character.indoleId
                      ? 'border-white/10 bg-white/[0.04] text-zinc-400 opacity-60'
                      : 'border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-300'"
                >
                  {{ ind.descricao }}
                </button>
              </div>
              <p v-if="requestedIndoleId !== null && requestedIndoleId !== character.indoleId" class="mt-1.5 text-xs text-violet-400">
                → {{ todasIndoles.find(i => i.id === requestedIndoleId)?.descricao }}
              </p>
            </div>

            <!-- Imagem -->
            <div>
              <label class="manage-field-label">Imagem do personagem</label>
              <div
                class="manage-upload-zone"
                :class="[requestedAvatarPreview ? 'manage-upload-preview' : 'manage-upload-empty', { 'ring-2 ring-amber-500/50': isDragging }]"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="triggerAvatarInput"
              >
                <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="handleAvatarSelect" />

                <div v-if="requestedAvatarPreview" class="relative w-fit mx-auto">
                  <img :src="requestedAvatarPreview" alt="Prévia" class="h-40 rounded-xl object-cover" />
                  <button
                    @click.stop="removeRequestedAvatar"
                    class="absolute right-2 top-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                  >✕</button>
                </div>
                <div v-else class="flex flex-col items-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="text-zinc-500"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <p class="text-xs text-zinc-500">Arraste ou clique para selecionar</p>
                  <p class="text-[0.6rem] text-zinc-600">PNG, JPG ou WEBP · Max 5MB</p>
                </div>
              </div>
            </div>

            <!-- História -->
            <div>
              <label class="manage-field-label">História do personagem</label>
              <div v-if="character.data?.history" class="manage-current-value text-xs leading-relaxed max-h-24 overflow-y-auto mb-2 whitespace-pre-wrap">{{ character.data.history }}</div>
              <textarea
                v-model="requestedHistory"
                rows="5"
                placeholder="Edite ou complemente a história..."
                class="manage-input resize-none"
              />
            </div>

            <!-- Documento da história -->
            <div>
              <label class="manage-field-label">Documento da história (Word/PDF)</label>
              <div class="manage-upload-zone manage-upload-empty cursor-pointer" @click="triggerHistoryDocInput">
                <input ref="historyDocInput" type="file" accept=".doc,.docx,.pdf" class="hidden" @change="handleHistoryDocSelect" />
                <div class="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span class="text-xs text-zinc-500">
                    {{ selectedHistoryDoc?.name ?? requestedHistoryDocumentName ?? 'Anexar .doc, .docx ou .pdf' }}
                  </span>
                </div>
              </div>
              <a v-if="requestedHistoryDocumentPath" href="#" @click.prevent="openHistoryDocument(requestedHistoryDocumentPath)" class="inline-block mt-1 text-xs text-amber-500 hover:text-amber-300 underline">
                Abrir documento atual
              </a>
            </div>

            <!-- Feedback -->
            <p v-if="feedback" class="text-sm" :class="feedbackIsError ? 'text-red-400' : 'text-emerald-400'">{{ feedback }}</p>
          </div>

          <!-- Panel footer -->
          <div class="manage-panel-footer sticky bottom-0 px-6 py-4 border-t flex gap-3">
            <button @click="closeManagePanel" class="flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors" style="border-color: var(--border-soft); color: var(--text-muted)">
              Cancelar
            </button>
            <button
              @click="submitRequest"
              :disabled="settingsLoading"
              class="flex-1 py-2.5 rounded-xl bg-violet-700 hover:bg-violet-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {{ settingsLoading ? 'Enviando...' : 'Enviar para aprovação' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ══ Master Approvals Modal ════════════════════════════════════════ -->
    <Modal
      v-if="showSettingsModal && character && authStore.eMestre"
      panel-class="max-w-3xl"
      body-class="max-h-[75vh] overflow-y-auto p-6"
      header-class="px-6 py-4"
      @close="closeSettingsModal"
    >
      <template #header>
        <div>
          <h2 class="text-xl font-bold text-amber-400 font-cinzel">Painel de Aprovação</h2>
          <p class="text-sm text-zinc-500 mt-0.5">Solicitações pendentes dos jogadores</p>
        </div>
      </template>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-amber-400">Solicitações pendentes</h3>
          <button @click="loadPending" class="rounded-xl border border-amber-700/40 px-4 py-1.5 text-xs text-amber-300 transition-colors hover:bg-amber-900/30">Atualizar</button>
        </div>
        <div v-if="settingsLoading" class="text-zinc-500 text-sm">Carregando...</div>
        <div v-else-if="pendingApprovals.length === 0" class="rounded-2xl border border-zinc-800/50 p-4 text-zinc-500 text-sm text-center">Nenhuma solicitação pendente.</div>
        <div v-else class="space-y-4">
          <div v-for="request in pendingApprovals" :key="request.characterId" class="rounded-2xl border border-[#6B4E9E]/35 bg-[#0F1C3A]/60 p-4">
            <p class="text-base font-semibold text-white">{{ request.currentName }}</p>
            <p class="text-xs text-zinc-500">Solicitado por: {{ request.requestedByEmail || 'desconhecido' }}</p>
            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="rounded-xl border border-zinc-800/60 p-3"><p class="text-xs uppercase tracking-wider text-zinc-600">Nome atual</p><p class="mt-1 text-zinc-300">{{ request.currentName }}</p></div>
              <div class="rounded-xl border border-zinc-800/60 p-3"><p class="text-xs uppercase tracking-wider text-zinc-600">Nome solicitado</p><p class="mt-1 text-zinc-300">{{ request.requestedName || 'Sem alteração' }}</p></div>
            </div>
            <div v-if="request.requestedIndoleId" class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="rounded-xl border border-zinc-800/60 p-3"><p class="text-xs uppercase tracking-wider text-zinc-600">Índole atual</p><p class="mt-1 text-zinc-300">{{ todasIndoles.find(i => i.id === request.currentIndoleId)?.descricao ?? '—' }}</p></div>
              <div class="rounded-xl border border-violet-600/30 bg-violet-950/20 p-3"><p class="text-xs uppercase tracking-wider text-violet-500">Índole solicitada</p><p class="mt-1 text-violet-300 font-semibold">{{ todasIndoles.find(i => i.id === request.requestedIndoleId)?.descricao ?? '—' }}</p></div>
            </div>
            <div v-if="request.requestedDeusId !== undefined" class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div class="rounded-xl border border-zinc-800/60 p-3"><p class="text-xs uppercase tracking-wider text-zinc-600">Deus atual</p><p class="mt-1 text-zinc-300">{{ todosDeuses.find(d => Number(d.id) === request.currentDeusId)?.name ?? 'Nenhum' }}</p></div>
              <div class="rounded-xl border border-amber-600/30 bg-amber-950/20 p-3"><p class="text-xs uppercase tracking-wider text-amber-500">Deus solicitado</p><p class="mt-1 text-amber-300 font-semibold">{{ request.requestedDeusId == null ? 'Nenhum' : (todosDeuses.find(d => Number(d.id) === request.requestedDeusId)?.name ?? `ID ${request.requestedDeusId}`) }}</p></div>
            </div>
            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <img v-if="request.currentAvatarUrl" :src="request.currentAvatarUrl" alt="Avatar atual" class="h-36 w-full rounded-xl object-cover" />
              <div v-else class="flex h-36 items-center justify-center rounded-xl border border-zinc-800/60 text-zinc-600 text-sm">Sem avatar</div>
              <img v-if="request.requestedAvatarUrl" :src="request.requestedAvatarUrl" alt="Avatar solicitado" class="h-36 w-full rounded-xl object-cover" />
              <div v-else class="flex h-36 items-center justify-center rounded-xl border border-zinc-800/60 text-zinc-600 text-sm">Sem novo avatar</div>
            </div>
            <div class="mt-3 space-y-2 rounded-xl border border-zinc-800/60 p-3">
              <p class="text-xs uppercase tracking-wider text-zinc-600">História solicitada</p>
              <p class="text-sm text-zinc-300 whitespace-pre-wrap">{{ request.requestedHistory || 'Sem alteração de texto.' }}</p>
              <a v-if="request.requestedHistoryDocumentPath" href="#" @click.prevent="openHistoryDocument(request.requestedHistoryDocumentPath)" class="inline-block text-sm text-amber-400 underline hover:text-amber-300">Abrir documento: {{ request.requestedHistoryDocumentName || 'Arquivo enviado' }}</a>
            </div>
            <div class="mt-4 flex gap-3">
              <button @click="reviewRequest(request.characterId, true)" class="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-600">Aprovar</button>
              <button @click="reviewRequest(request.characterId, false)" class="rounded-xl bg-red-800/70 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700">Rejeitar</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Modal Troca Obrigatória de Senha -->
    <Modal
      v-if="showPasswordChangeModal"
      title="Defina uma Nova Senha"
      tema="escuro"
      panel-class="max-w-sm"
      :close-on-backdrop="false"
    >
      <div class="space-y-5 px-6 py-5">
        <p class="text-sm text-zinc-400">Sua senha foi resetada pelo mestre. Defina uma nova senha para continuar.</p>

        <div v-if="erroNovaSenha" class="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {{ erroNovaSenha }}
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Nova Senha</label>
          <input
            v-model="novaSenhaObrigatoria"
            :type="mostrarNovaSenhaObrigatoria ? 'text' : 'password'"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/40"
            placeholder="Mín. 8 chars, maiúscula, número e especial"
          />
        </div>

        <div class="space-y-1">
          <label class="block text-xs font-semibold uppercase tracking-wide text-zinc-400">Confirmar Senha</label>
          <input
            v-model="novaSenhaObrigatoriaConfirmacao"
            :type="mostrarNovaSenhaObrigatoria ? 'text' : 'password'"
            class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none focus:border-violet-500/40"
            placeholder="Repita a senha"
          />
          <button
            type="button"
            class="mt-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            @click="mostrarNovaSenhaObrigatoria = !mostrarNovaSenhaObrigatoria"
          >
            {{ mostrarNovaSenhaObrigatoria ? 'Ocultar' : 'Mostrar' }} senha
          </button>
        </div>

        <ul class="space-y-1">
          <li
            v-for="regra in regrasNovaSenha"
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
        <div class="flex justify-end">
          <button
            type="button"
            :disabled="salvandoNovaSenha || !novaSenhaValida"
            class="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
            @click="salvarNovaSenhaObrigatoria"
          >
            {{ salvandoNovaSenha ? 'Salvando...' : 'Confirmar' }}
          </button>
        </div>
      </template>
    </Modal>

    <!-- ══ Modal Retrato ════════════════════════════════════════════════════ -->
    <Modal
      v-if="modalRetratoAberto && character"
      panel-class="max-w-xl"
      header-class="px-3 py-1.5 !border-b-0"
      :close-on-backdrop="false"
      @close="modalRetratoAberto = false"
    >
      <div class="px-3 pb-3">
        <div class="relative rounded-2xl overflow-hidden">
          <!-- Imagem -->
          <img
            v-if="character.avatarUrl"
            :src="character.avatarUrl"
            :alt="character.name"
            class="w-full max-h-[80vh] object-cover block"
            :style="{ objectPosition: character.data?.avatarFocalPoint ?? 'center 20%' }"
          />
          <div v-else class="h-80 bg-zinc-900 flex items-center justify-center text-zinc-600 text-sm">Sem imagem</div>

          <!-- Gradiente topo -->
          <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <!-- Gradiente rodapé -->
          <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />

          <!-- Nome — topo esquerdo -->
          <div class="absolute top-3 left-3">
            <span class="font-cinzel text-xs font-bold text-white bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/30 tracking-wide drop-shadow-sm">
              {{ character.name }}
            </span>
          </div>

          <!-- Nível + Índole — rodapé esquerdo -->
          <div class="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span class="font-cinzel text-[0.6rem] font-bold text-violet-200 bg-violet-800/60 backdrop-blur-sm border border-violet-400/25 px-2 py-0.5 rounded-full">
              Nv. {{ character.level }}
            </span>
            <span class="text-[0.6rem] font-semibold backdrop-blur-sm border px-2 py-0.5 rounded-full" :class="indoleChipClass">
              {{ indoleLabel }}
            </span>
          </div>

          <!-- Baixar — rodapé direito -->
          <button
            v-if="character.avatarUrl"
            @click="downloadRetrato"
            class="absolute bottom-3 right-3 flex items-center gap-1.5 text-[0.65rem] font-semibold text-white bg-blue-600/80 hover:bg-blue-500 backdrop-blur-sm border border-blue-400/30 px-2.5 py-1 rounded-full transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar
          </button>
        </div>
      </div>
    </Modal>

    <!-- ══ Modal Raça ════════════════════════════════════════════════════════ -->
    <Modal
      v-if="modalRacaAberto && racaPersonagem"
      panel-class="max-w-xl"
      body-class="overflow-y-auto max-h-[72vh]"
      header-class="!p-0 !border-b-0"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalRacaAberto = false"
    >
      <template #header>
        <!-- Com imagem: full-bleed -->
        <div v-if="racaPersonagem.foto_url" class="relative w-full h-52 overflow-hidden">
          <img :src="racaPersonagem.foto_url" :alt="racaPersonagem.nome" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div class="absolute bottom-4 left-5">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-300/80 mb-0.5">Raça</p>
            <h2 class="font-cinzel font-bold text-white text-xl leading-tight drop-shadow">{{ racaPersonagem.nome }}</h2>
          </div>
          <button type="button" class="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors" @click="modalRacaAberto = false">×</button>
        </div>
        <!-- Sem imagem: gradiente índigo -->
        <div v-else class="relative w-full h-28 flex items-end overflow-hidden" style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)">
          <div class="absolute top-0 right-0 h-28 w-28 rounded-full bg-indigo-400/10 blur-2xl" />
          <div class="relative px-5 pb-4">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-300/70 mb-0.5">Raça</p>
            <h2 class="font-cinzel font-bold text-white text-xl">{{ racaPersonagem.nome }}</h2>
          </div>
          <button type="button" class="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-white text-xl hover:bg-black/60 transition-colors" @click="modalRacaAberto = false">×</button>
        </div>
      </template>

      <div class="px-5 py-5 space-y-4">
        <!-- Bônus de Atributo -->
        <div v-if="racaPersonagem.atributos_bonus?.length" class="flex flex-wrap gap-2">
          <span
            v-for="b in racaPersonagem.atributos_bonus"
            :key="b.atributo"
            class="text-xs font-semibold bg-indigo-900/40 border border-indigo-500/40 text-indigo-200 px-3 py-1.5 rounded-full"
          >
            {{ b.atributo }} <span class="text-indigo-300 font-bold">+{{ b.valor }}</span>
          </span>
        </div>

        <!-- Descrição -->
        <p v-if="racaPersonagem.descricao" class="text-sm text-zinc-300 leading-relaxed">{{ racaPersonagem.descricao }}</p>

        <!-- Lore -->
        <div v-if="racaPersonagem.lore" class="rounded-xl border-l-2 border-indigo-500/50 bg-indigo-950/20 pl-4 pr-4 py-3">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-400/60 mb-1.5">Lore</p>
          <p class="text-xs text-zinc-400 leading-relaxed">{{ racaPersonagem.lore }}</p>
        </div>

        <!-- Habilidades Raciais -->
        <div v-if="racaPersonagem.habilidades?.length" class="space-y-2">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500 mb-2">Habilidades Raciais</p>
          <div
            v-for="h in racaPersonagem.habilidades"
            :key="h.nome"
            class="rounded-xl border border-indigo-500/15 bg-indigo-950/10 px-4 py-3"
          >
            <p class="text-sm font-semibold text-indigo-200 mb-1">{{ h.nome }}</p>
            <p class="text-xs text-zinc-400 leading-relaxed">{{ h.descricao }}</p>
          </div>
        </div>
      </div>
    </Modal>

    <!-- ══ Modal Passado ═════════════════════════════════════════════════════ -->
    <Modal
      v-if="modalPassadoAberto && passadoPersonagem"
      panel-class="max-w-xl"
      body-class="overflow-y-auto max-h-[72vh]"
      header-class="!p-0 !border-b-0"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalPassadoAberto = false"
    >
      <template #header>
        <!-- Com imagem: full-bleed -->
        <div v-if="passadoPersonagem.foto_url" class="relative w-full h-52 overflow-hidden">
          <img :src="passadoPersonagem.foto_url" :alt="passadoPersonagem.nome" class="w-full h-full object-cover object-top" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div class="absolute bottom-4 left-5">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-violet-300/80 mb-0.5">Passado</p>
            <h2 class="font-cinzel font-bold text-white text-xl leading-tight drop-shadow">{{ passadoPersonagem.nome }}</h2>
          </div>
          <button type="button" class="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors" @click="modalPassadoAberto = false">×</button>
        </div>
        <!-- Sem imagem: gradiente violeta -->
        <div v-else class="relative w-full h-28 flex items-end overflow-hidden" style="background:linear-gradient(135deg,#2e1065 0%,#4c1d95 60%,#2e1065 100%)">
          <div class="absolute top-0 right-0 h-28 w-28 rounded-full bg-violet-400/10 blur-2xl" />
          <div class="relative px-5 pb-4">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-violet-300/70 mb-0.5">Passado</p>
            <h2 class="font-cinzel font-bold text-white text-xl">{{ passadoPersonagem.nome }}</h2>
          </div>
          <button type="button" class="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 flex items-center justify-center text-white text-xl hover:bg-black/60 transition-colors" @click="modalPassadoAberto = false">×</button>
        </div>
      </template>

      <div class="px-5 py-5 space-y-4">
        <!-- Descrição -->
        <p v-if="passadoPersonagem.descricao" class="text-sm text-zinc-300 leading-relaxed">{{ passadoPersonagem.descricao }}</p>

        <!-- Grants: bônus, skills, títulos numa linha visual clara -->
        <div v-if="passadoPersonagem.atributo_bonus && Object.entries(passadoPersonagem.atributo_bonus).filter(([, v]) => v).length" class="space-y-2">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Bônus de Atributo</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="[attr, val] in Object.entries(passadoPersonagem.atributo_bonus).filter(([, v]) => v)"
              :key="attr"
              class="inline-flex items-center gap-1 text-xs font-semibold bg-violet-900/30 border border-violet-600/30 text-violet-200 px-3 py-1.5 rounded-full"
            >
              {{ attr }} <span class="text-violet-300 font-bold">+{{ val }}</span>
            </span>
          </div>
        </div>

        <div v-if="passadoPersonagem.skills?.length" class="space-y-2">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Skills Concedidas</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="s in passadoPersonagem.skills" :key="s.id" class="inline-flex items-center text-xs bg-violet-900/20 border border-violet-600/25 text-violet-300 px-3 py-1.5 rounded-full">{{ s.name }}</span>
          </div>
        </div>

        <div v-if="passadoPersonagem.titulos?.length" class="space-y-2">
          <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500">Títulos Concedidos</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in passadoPersonagem.titulos" :key="t.id" class="inline-flex items-center text-xs bg-amber-900/20 border border-amber-600/25 text-amber-300 px-3 py-1.5 rounded-full">{{ t.name }}</span>
          </div>
        </div>
      </div>
    </Modal>

    <!-- ══ Modal Deus ════════════════════════════════════════════════════════ -->
    <Modal
      v-if="modalDeusAberto"
      panel-class="max-w-xl"
      body-class="overflow-y-auto max-h-[78vh]"
      header-class="!p-0 !border-b-0"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="modalDeusAberto = false"
    >
      <template #header>
        <!-- Hero com imagem cobrindo todo o topo -->
        <div v-if="deusPersonagem?.imageUrl" class="relative w-full h-64 overflow-hidden">
          <img :src="deusPersonagem.imageUrl" :alt="deusPersonagem.name" class="w-full h-full object-cover object-top" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <!-- Chip com nome sobreposto -->
          <div class="absolute bottom-4 left-5">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-amber-300/80 mb-0.5">Divindade</p>
            <h2 class="font-cinzel font-bold text-white text-xl leading-tight drop-shadow">{{ deusPersonagem.name }}</h2>
            <p v-if="deusPersonagem.title" class="text-xs text-amber-300/70 italic mt-0.5">{{ deusPersonagem.title }}</p>
          </div>
          <!-- X sobreposto -->
          <button type="button" class="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white text-xl hover:bg-black/70 transition-colors" @click="modalDeusAberto = false">×</button>
        </div>
        <!-- Sem imagem ou sem deus: header simples com X -->
        <div v-else class="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-amber-400/70 mb-0.5">Divindade</p>
            <h2 class="font-cinzel font-bold text-white text-lg">{{ deusPersonagem?.name ?? 'Sem Divindade' }}</h2>
          </div>
          <button type="button" class="rounded-xl px-3 py-1 text-2xl text-zinc-500 hover:text-white transition-colors" @click="modalDeusAberto = false">×</button>
        </div>
      </template>

      <!-- Sem deus -->
      <div v-if="!deusPersonagem" class="px-5 pb-6 pt-4 space-y-4">
        <div class="flex flex-col items-center gap-3 py-4 text-center">
          <div class="h-14 w-14 rounded-2xl bg-amber-900/20 border border-amber-500/20 flex items-center justify-center text-2xl">✦</div>
          <div>
            <p class="text-base font-semibold text-zinc-200">Sem divindade</p>
            <p class="text-sm text-zinc-500 mt-1">Você não escolheu uma divindade durante o onboarding, ou optou por nenhuma.</p>
          </div>
        </div>
        <div v-if="pendingDeusChange" class="rounded-xl border border-orange-500/30 bg-orange-950/20 px-4 py-3 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-orange-400 shrink-0" />
          <p class="text-xs text-orange-300">Troca de divindade aguardando aprovação do mestre.</p>
        </div>
        <button
          v-if="!authStore.eMestre && !pendingDeusChange"
          type="button"
          class="w-full rounded-xl border border-amber-700/40 bg-amber-900/10 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-900/25 transition-colors"
          @click="modalDeusAberto = false; modalTrocarDeusAberto = true"
        >
          Escolher Divindade
        </button>
      </div>

      <!-- Com deus -->
      <div v-else class="px-5 pb-6 pt-4 space-y-4">
        <!-- Descrição -->
        <p v-if="deusPersonagem.description || deusPersonagem.shortDescription" class="text-sm text-zinc-300 leading-relaxed">
          {{ deusPersonagem.description || deusPersonagem.shortDescription }}
        </p>

        <!-- Dogma + Anatema -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-if="deusPersonagem.dogma" class="rounded-xl border border-emerald-700/20 bg-emerald-900/10 p-3">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-emerald-500/60 mb-1.5">Dogma</p>
            <p class="text-xs text-zinc-400 leading-relaxed">{{ deusPersonagem.dogma }}</p>
          </div>
          <div v-if="deusPersonagem.anatema" class="rounded-xl border border-red-700/20 bg-red-900/10 p-3">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-red-500/60 mb-1.5">Anatema</p>
            <p class="text-xs text-zinc-400 leading-relaxed">{{ deusPersonagem.anatema }}</p>
          </div>
        </div>

        <!-- Armas + Índole -->
        <div class="flex flex-wrap gap-3">
          <div v-if="deusPersonagem.weapons" class="flex-1 min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500 mb-1">Armas Sagradas</p>
            <p class="text-xs text-zinc-400">{{ deusPersonagem.weapons }}</p>
          </div>
          <div v-if="deusPersonagem.indole_obj?.descricao || deusPersonagem.indole" class="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p class="text-[0.6rem] font-bold uppercase tracking-widest text-zinc-500 mb-1">Índole</p>
            <p class="text-xs font-semibold text-zinc-300">{{ deusPersonagem.indole_obj?.descricao ?? deusPersonagem.indole }}</p>
          </div>
        </div>

        <!-- Aviso pendente -->
        <div v-if="pendingDeusChange" class="rounded-xl border border-orange-500/30 bg-orange-950/20 px-4 py-3 flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-orange-400 shrink-0" />
          <p class="text-xs text-orange-300">Troca de divindade aguardando aprovação do mestre.</p>
        </div>

        <!-- Botão trocar -->
        <button
          v-if="!authStore.eMestre && !pendingDeusChange"
          type="button"
          class="w-full rounded-xl border border-amber-700/40 bg-amber-900/10 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-900/25 transition-colors"
          @click="modalDeusAberto = false; modalTrocarDeusAberto = true"
        >
          Trocar Divindade
        </button>
      </div>
    </Modal>

    <!-- ══ Modal Trocar Deus ══════════════════════════════════════════════════ -->
    <Modal
      v-if="modalTrocarDeusAberto"
      panel-class="max-w-md"
      body-class="px-5 py-5"
      :close-on-backdrop="false"
      @close="modalTrocarDeusAberto = false"
    >
      <template #header>
        <div class="px-5 pt-5 pb-3">
          <h2 class="text-base font-bold text-amber-300 font-cinzel">Trocar Divindade</h2>
          <p class="text-xs text-zinc-500 mt-0.5">A troca ficará pendente até o mestre aprovar.</p>
        </div>
      </template>

      <div class="space-y-3">
        <!-- Opção "Nenhum" -->
        <label
          class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
          :class="deusEditId === null
            ? 'border-amber-500/60 bg-amber-900/15'
            : 'border-white/10 hover:border-white/20'"
        >
          <input type="radio" :value="null" v-model="deusEditId" class="accent-amber-500 shrink-0" />
          <div>
            <p class="text-sm font-semibold text-zinc-200">Nenhum</p>
            <p class="text-xs text-zinc-500 mt-0.5">Sem divindade</p>
          </div>
        </label>

        <!-- Lista de deuses -->
        <div class="max-h-72 overflow-y-auto space-y-2">
          <label
            v-for="deus in todosDeuses"
            :key="Number(deus.id)"
            class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
            :class="deusEditId === Number(deus.id)
              ? 'border-amber-500/60 bg-amber-900/15'
              : 'border-white/10 hover:border-white/20'"
          >
            <input type="radio" :value="Number(deus.id)" v-model="deusEditId" class="accent-amber-500 shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="text-sm font-semibold text-zinc-200 truncate">{{ deus.name }}</p>
              <p v-if="deus.title" class="text-xs text-zinc-500 truncate italic">{{ deus.title }}</p>
            </div>
          </label>
        </div>

        <p v-if="erroTrocarDeus" class="text-sm text-red-400">{{ erroTrocarDeus }}</p>

        <div class="flex gap-3 pt-1">
          <button type="button" class="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 hover:text-white transition-colors" @click="modalTrocarDeusAberto = false">Cancelar</button>
          <button
            type="button"
            :disabled="deusEditId === undefined || salvandoTrocaDeus"
            class="flex-1 rounded-xl bg-amber-600 py-2.5 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60 transition-colors"
            @click="confirmarTrocaDeus"
          >
            {{ salvandoTrocaDeus ? 'Enviando...' : 'Solicitar Troca' }}
          </button>
        </div>
      </div>
    </Modal>

  <!-- ══ Modal: Confirmar distribuição de atributos ══ -->
  <Modal
    v-if="modalConfirmarAtributos"
    panel-class="max-w-sm"
    body-class="space-y-4 p-6"
    tema="escuro"
    :close-on-backdrop="false"
    :show-close-button="false"
  >
    <h3 class="text-base font-bold text-white">Confirmar Distribuição</h3>
    <p class="text-sm text-zinc-400">Os pontos serão permanentemente adicionados aos atributos. Você não poderá desfazer.</p>
    <div class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 space-y-1.5">
      <div v-for="attr in ATRIBUTOS_DASHBOARD" :key="attr.key">
        <div v-if="(distribuicaoStaged[attr.key] ?? 0) > 0" class="flex items-center justify-between">
          <span class="text-xs text-zinc-400">{{ attr.label }}</span>
          <span class="text-xs font-bold" :class="attr.color">
            {{ (character?.data?.atributos as any)?.[attr.key] ?? 0 }}
            → {{ ((character?.data?.atributos as any)?.[attr.key] ?? 0) + (distribuicaoStaged[attr.key] ?? 0) }}
            <span class="text-emerald-400">(+{{ distribuicaoStaged[attr.key] }})</span>
          </span>
        </div>
      </div>
    </div>
    <div class="flex gap-3">
      <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="modalConfirmarAtributos = false">Cancelar</button>
      <button type="button" :disabled="distribuindoAtributos" class="flex-1 rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60" @click="confirmarDistribuicao">
        {{ distribuindoAtributos ? 'Salvando...' : 'Confirmar' }}
      </button>
    </div>
  </Modal>

  <!-- ══ Modal: Aprender Skill ══ -->
  <Modal
    v-if="modalAprenderSkill && classeSelecionadaParaSkill"
    panel-class="max-w-md"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="modalAprenderSkill = false"
  >
    <template #header>
      <div class="px-6 py-4">
        <h2 class="text-base font-bold text-violet-300 font-cinzel">Aprender Skill</h2>
        <p class="text-xs text-zinc-500 mt-0.5">{{ classeSelecionadaParaSkill.name }} · {{ classeSelecionadaParaSkill.skillPoints ?? 0 }} ponto{{ (classeSelecionadaParaSkill.skillPoints ?? 0) !== 1 ? 's' : '' }} de skill disponíve{{ (classeSelecionadaParaSkill.skillPoints ?? 0) !== 1 ? 'is' : 'l' }}</p>
      </div>
    </template>

    <div class="space-y-4">
      <div v-if="carregandoSkillsClasse" class="flex items-center justify-center py-6 gap-2 text-zinc-500 text-sm">
        <div class="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        Carregando skills...
      </div>
      <div v-else-if="!skillsParaEscolher.length" class="rounded-xl border border-zinc-800/50 p-5 text-center">
        <p class="text-sm text-zinc-500">Nenhuma skill disponível para esta classe.</p>
        <p class="text-xs text-zinc-600 mt-1.5">O mestre precisa cadastrar skills com a classe "{{ classeSelecionadaParaSkill.name }}" configurada no campo "Classe Requerida".</p>
      </div>
      <div v-else class="space-y-2 max-h-72 overflow-y-auto">
        <label
          v-for="sk in skillsParaEscolher"
          :key="sk.id"
          class="flex items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors"
          :class="[
            sk._locked
              ? 'opacity-40 cursor-not-allowed border-white/[0.04]'
              : String(sk.id) === skillSelecionadaId
                ? 'border-violet-500/60 bg-violet-900/20 cursor-pointer'
                : 'border-white/10 hover:border-white/20 cursor-pointer',
          ]"
        >
          <div class="mt-0.5 flex-shrink-0">
            <span v-if="sk._locked" class="text-zinc-600 text-sm">🔒</span>
            <input
              v-else
              type="radio"
              :value="String(sk.id)"
              v-model="skillSelecionadaId"
              class="accent-violet-500 mt-0.5"
            />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold leading-tight" :class="sk._locked ? 'text-zinc-600' : 'text-zinc-200'">{{ sk.name }}</p>
            <p v-if="sk._locked" class="text-xs text-zinc-600 mt-0.5">Disponível no nível {{ sk.nivel_minimo_classe }}</p>
            <p v-else-if="sk.effect_description" class="text-xs text-zinc-500 mt-0.5 line-clamp-2">{{ sk.effect_description }}</p>
            <p v-else-if="sk.description" class="text-xs text-zinc-500 mt-0.5 line-clamp-2">{{ sk.description }}</p>
          </div>
        </label>
      </div>

      <p v-if="erroAprenderSkill" class="text-sm text-red-400">{{ erroAprenderSkill }}</p>

      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white transition-colors" @click="modalAprenderSkill = false">Cancelar</button>
        <button
          type="button"
          :disabled="!skillSelecionadaId || aprendendoSkill || !skillsParaEscolher.length"
          class="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60 transition-colors"
          @click="confirmarAprenderSkill"
        >
          {{ aprendendoSkill ? 'Aprendendo...' : 'Aprender' }}
        </button>
      </div>
    </div>
  </Modal>

  <!-- ══ Modal: Desbloquear nova classe ══ -->
  <Modal
    v-if="modalDesbloquearClasse"
    title="Desbloquear Nova Classe"
    panel-class="max-w-md"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="modalDesbloquearClasse = false"
  >
    <div class="space-y-4">
      <p class="text-sm text-zinc-400">Selecione a nova classe que deseja desbloquear.</p>
      <div v-if="carregandoClassesDisponiveis" class="text-sm text-zinc-500">Carregando...</div>
      <div v-else class="space-y-2 max-h-72 overflow-y-auto">
        <label
          v-for="cls in classesDisponiveis"
          :key="Number(cls.id)"
          class="flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors"
          :class="classeSelecionadaId === Number(cls.id)
            ? 'border-indigo-500/60 bg-indigo-900/20'
            : 'border-white/10 hover:border-white/20'"
        >
          <input type="radio" :value="Number(cls.id)" v-model="classeSelecionadaId" class="mt-0.5 accent-indigo-500" />
          <div>
            <p class="text-sm font-semibold text-zinc-200">{{ cls.name }}</p>
            <p v-if="cls.tier" class="text-xs text-zinc-500 mt-0.5">{{ cls.tier }}</p>
            <p v-if="cls.description" class="text-xs text-zinc-600 mt-1 line-clamp-2">{{ cls.description }}</p>
          </div>
        </label>
        <p v-if="!classesDisponiveis.length" class="text-sm text-zinc-600 text-center py-4">Nenhuma classe disponível para desbloquear.</p>
      </div>
      <p v-if="erroDesbloquear" class="text-sm text-red-400">{{ erroDesbloquear }}</p>
      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="modalDesbloquearClasse = false">Cancelar</button>
        <button
          type="button"
          :disabled="!classeSelecionadaId || desbloqueandoClasse"
          class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          @click="confirmarDesbloquearClasse"
        >
          {{ desbloqueandoClasse ? 'Desbloqueando...' : 'Desbloquear' }}
        </button>
      </div>
    </div>
  </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { supabase } from '@/lib/supabase/client'
import { getHistoryDocumentSignedUrl } from '@/lib/supabase/storage'
import { limparMetaAuthLocal, useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useMasterApprovalsStore } from '@/stores/masterApprovals'
import { editCharacter, levelarClasse, escolherClasse, distribuirPontosAtributo, escolherSkillDaClasse } from '@/lib/api/personagens.api'
import { listarClassesParaPlayer, type ClasseApi } from '@/lib/api/classes.api'
import { listarCatalogoSkills, type SkillApi } from '@/lib/api/skills.api'
import { listLoreNotes } from '@/lib/api/lore-notes.api'
import { listarMinhasTelas } from '@/lib/api/player-telas.api'
import { listarRacasPublicas, type RacaApi } from '@/lib/api/racas.api'
import { listarPassados, type PassadoApi } from '@/lib/api/passados.api'
import { listPublicGods } from '@/lib/api/gods.api'
import { listarIndole } from '@/lib/api/indole.api'
import type { PersonagemApi, GodApi, IndoleApi } from '@/types/supabase'

interface InventoryItem {
  id: string
  name: string
  description?: string
  quantity: number
  addedAt: string
}

interface Notification {
  id: string
  type: 'note' | 'god'
  title: string
  typeLabel: string
  route: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const masterApprovalsStore = useMasterApprovalsStore()

const loading = ref(true)
const error = ref<string>('')
const errorHint = ref('')
const character = ref<PersonagemApi | null>(null)

const showSettingsMenu = ref(false)
const showSettingsModal = ref(false)
const showNotifications = ref(false)
const showManagePanel = ref(false)
const showQuickInventory = ref(false)
const settingsLoading = ref(false)
const activeTab = ref('personagem')

// Inventory state
const newItemName = ref('')
const newItemQty = ref(1)
const savingInventory = ref(false)
const newQuickItemName = ref('')
const newQuickItemQty = ref(1)
const savingQuickInventory = ref(false)

// Notifications
const notifications = ref<Notification[]>([])
const unreadCount = ref(0)

// Settings / manage form
const requestedName = ref('')
const requestedAvatarPreview = ref('')
const selectedAvatarFile = ref<File | null>(null)
const requestedHistory = ref('')
const requestedHistoryDocumentPath = ref('')
const requestedHistoryDocumentName = ref('')
const requestedIndoleId = ref<number | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)
const historyDocInput = ref<HTMLInputElement | null>(null)
const selectedHistoryDoc = ref<File | null>(null)
const isDragging = ref(false)
const feedback = ref('')
const feedbackIsError = ref(false)

// Modais de origem / retrato
const modalRetratoAberto = ref(false)
const modalRacaAberto = ref(false)
const modalPassadoAberto = ref(false)
const modalDeusAberto = ref(false)
const modalTrocarDeusAberto = ref(false)
const deusEditId = ref<number | null | undefined>(undefined)
const salvandoTrocaDeus = ref(false)
const erroTrocarDeus = ref('')

const pendingDeusChange = computed(() =>
  (character.value?.data as any)?.pendingChangeRequest?.deusId !== undefined
)

function abrirModalDeus() {
  modalDeusAberto.value = true
}

async function confirmarTrocaDeus() {
  if (!character.value || deusEditId.value === undefined) return
  salvandoTrocaDeus.value = true
  erroTrocarDeus.value = ''
  try {
    const resultado = await charactersStore.requestCharacterChange(character.value.characterId, {
      deusId: deusEditId.value,
    })
    character.value = resultado
    modalTrocarDeusAberto.value = false
    deusEditId.value = undefined
  } catch (e: any) {
    erroTrocarDeus.value = e?.response?.data?.message ?? e.message ?? 'Erro ao solicitar troca.'
  } finally {
    salvandoTrocaDeus.value = false
  }
}

// Troca obrigatória de senha após reset
const showPasswordChangeModal = ref(false)
const novaSenhaObrigatoria = ref('')
const novaSenhaObrigatoriaConfirmacao = ref('')
const mostrarNovaSenhaObrigatoria = ref(false)
const salvandoNovaSenha = ref(false)
const erroNovaSenha = ref('')

const regrasNovaSenha = computed(() => [
  { label: 'Mínimo 8 caracteres', ok: novaSenhaObrigatoria.value.length >= 8 },
  { label: 'Ao menos uma letra maiúscula', ok: /[A-Z]/.test(novaSenhaObrigatoria.value) },
  { label: 'Ao menos um número', ok: /[0-9]/.test(novaSenhaObrigatoria.value) },
  { label: 'Ao menos um caractere especial', ok: /[^a-zA-Z0-9]/.test(novaSenhaObrigatoria.value) },
  { label: 'Senhas coincidem', ok: novaSenhaObrigatoria.value.length > 0 && novaSenhaObrigatoria.value === novaSenhaObrigatoriaConfirmacao.value },
])
const novaSenhaValida = computed(() => regrasNovaSenha.value.every((r) => r.ok))

async function salvarNovaSenhaObrigatoria() {
  if (!novaSenhaValida.value) return
  salvandoNovaSenha.value = true
  erroNovaSenha.value = ''
  try {
    const { error } = await supabase.auth.updateUser({
      password: novaSenhaObrigatoria.value,
      data: { requires_password_change: false },
    })
    if (error) throw error
    showPasswordChangeModal.value = false
  } catch (err: any) {
    erroNovaSenha.value = err?.message ?? 'Erro ao salvar nova senha.'
  } finally {
    salvandoNovaSenha.value = false
  }
}

const pendingApprovals = computed(() => masterApprovalsStore.pendingApprovals)

const tabs = [
  { id: 'personagem', label: 'Personagem' },
  { id: 'inventario', label: 'Inventário' },
]

const telasHabilitadas = ref<string[]>([])

const TODAS_TELAS_MENU = [
  { id: 'back',         label: 'Voltar',          sempre: true },
  { id: 'dashboard',    label: 'Personagem',       sempre: true },
  { id: 'deuses',       label: 'Deuses',           sempre: false },
  { id: 'cidade',       label: 'Cidade',           sempre: false },
  { id: 'skills',       label: 'Skills',           sempre: false },
  { id: 'titulos',      label: 'Títulos',          sempre: false },
  { id: 'classes',      label: 'Classes',          sempre: false },
  { id: 'npcs',         label: 'NPCs',             sempre: false },
  { id: 'racas',        label: 'Raças',            sempre: false },
  { id: 'equipamentos', label: 'Equipamentos',     sempre: false },
  { id: 'notas',        label: 'Notas de Aventura',sempre: false },
]

const dashboardHeaderMenuItems = computed(() => {
  if (authStore.eMestre) return TODAS_TELAS_MENU.map(({ id, label }) => ({ id, label }))
  return TODAS_TELAS_MENU
    .filter(t => t.sempre || telasHabilitadas.value.includes(t.id))
    .map(({ id, label }) => ({ id, label }))
})

const activeDashboardHeaderItem = computed(() => {
  if (route.name === 'dashboard') return 'dashboard'
  if (route.name === 'deuses') return 'deuses'
  if (route.name === 'cidade') return 'cidade'
  const path = route.path || ''
  if (path.startsWith('/skills')) return 'skills'
  if (path.startsWith('/titulos')) return 'titulos'
  if (path.startsWith('/classes')) return 'classes'
  if (path.startsWith('/npcs')) return 'npcs'
  if (path.startsWith('/racas')) return 'racas'
  if (path.startsWith('/equipamentos')) return 'equipamentos'
  if (path.startsWith('/notas')) return 'notas'
  return null
})

const historyPreview = computed(() => {
  const notes = character.value?.data?.adventureNotes
  if (Array.isArray(notes) && notes.length) {
    return notes.slice(-3).map((n: { text?: string }) => n.text ?? '').filter(Boolean).join('\n\n')
  }
  return ''
})

const indoleAtual = computed(() => {
  if (character.value?.indoleId && todasIndoles.value.length)
    return todasIndoles.value.find(i => i.id === character.value!.indoleId) ?? null
  return null
})

const indoleLabel = computed(() => {
  if (indoleAtual.value) return indoleAtual.value.descricao
  const raw = (character.value?.data?.indole as string) ?? 'neutro'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

const indoleColor = computed(() => {
  const codigo = indoleAtual.value?.codigo ?? (character.value?.data?.indole as string) ?? 'neutro'
  if (codigo === 'bom') return 'text-blue-300'
  if (codigo === 'neutro-bom') return 'text-sky-300'
  if (codigo === 'neutro-ruim') return 'text-rose-300'
  if (codigo === 'ruim') return 'text-red-300'
  return 'text-zinc-400'
})

const indoleChipClass = computed(() => {
  const codigo = indoleAtual.value?.codigo ?? (character.value?.data?.indole as string) ?? 'neutro'
  if (codigo === 'bom')        return 'text-blue-100 bg-blue-800/75 border-blue-300/60'
  if (codigo === 'neutro-bom') return 'text-sky-100 bg-sky-800/75 border-sky-300/60'
  if (codigo === 'neutro-ruim')return 'text-rose-100 bg-rose-800/75 border-rose-300/60'
  if (codigo === 'ruim')       return 'text-red-100 bg-red-800/75 border-red-300/60'
  return 'text-zinc-100 bg-zinc-700/75 border-zinc-400/60'
})

// ── Notificações de pedido de alteração ────────────────────────────────────────
const hasPendingRequest = computed(() => !!(character.value?.data as any)?.pendingChangeRequest)
const hasUnseenResponse = computed(() => (character.value?.data as any)?.changeRequestResponse?.visto === false)

const bellBadgeClass = computed(() => {
  if (hasUnseenResponse.value) return 'bg-red-500 text-white'
  if (hasPendingRequest.value) return 'bg-orange-500 text-black'
  if (unreadCount.value > 0) return 'bg-amber-500 text-black'
  return null
})
const showBellBadge = computed(() => !!(hasUnseenResponse.value || hasPendingRequest.value || unreadCount.value > 0))

const characterClass = computed(() => {
  const classes = character.value?.data?.classes
  if (!Array.isArray(classes) || !classes.length) return null
  return classes.map((c: any) => c.name).join(' / ')
})

const normalInventory = computed<InventoryItem[]>(() => {
  const inv = character.value?.data?.inventory
  return Array.isArray(inv) ? inv : []
})

const quickInventory = computed<InventoryItem[]>(() => {
  const inv = character.value?.data?.quickInventory
  return Array.isArray(inv) ? inv : []
})

// ── Catálogos de lookup para exibição no dashboard ────────────────────────────
const todasRacas    = ref<RacaApi[]>([])
const todosPassados = ref<PassadoApi[]>([])
const todosDeuses   = ref<GodApi[]>([])
const todasIndoles  = ref<IndoleApi[]>([])

const racaPersonagem = computed(() => {
  if (!character.value?.racaId) return null
  return todasRacas.value.find(r => Number(r.id) === Number(character.value!.racaId)) ?? null
})
const passadoPersonagem = computed(() => {
  if (!character.value?.passadoId) return null
  return todosPassados.value.find(p => Number(p.id) === Number(character.value!.passadoId)) ?? null
})
const deusPersonagem = computed(() => {
  if (!character.value?.deusId) return null
  return todosDeuses.value.find(d => Number(d.id) === Number(character.value!.deusId)) ?? null
})

// ── Inventário de equipamentos (onboarding) ────────────────────────────────────
const equipamentosIniciais = computed<Array<{id: number; nome: string; peso: number}>>(() => {
  const equips = character.value?.data?.equipamentos_iniciais
  return Array.isArray(equips) ? equips : []
})
const pesoMaximo = computed(() => {
  const forca = (character.value?.data?.atributos as any)?.forca ?? 0
  return 2 + (forca as number) * 2
})
const pesoAtual = computed(() =>
  equipamentosIniciais.value.reduce((s, e) => s + (e.peso ?? 0), 0)
)
const pesoPorcentagem = computed(() =>
  pesoMaximo.value > 0 ? Math.min((pesoAtual.value / pesoMaximo.value) * 100, 100) : 0
)

const ATRIBUTOS_DASHBOARD = [
  { key: 'aura',         label: 'Aura',         color: 'text-pink-400',   barColor: 'bg-pink-500/70' },
  { key: 'forca',        label: 'Força',        color: 'text-orange-400', barColor: 'bg-orange-500/70' },
  { key: 'destreza',     label: 'Destreza',     color: 'text-green-400',  barColor: 'bg-green-500/70' },
  { key: 'resistencia',  label: 'Resistência',  color: 'text-blue-400',   barColor: 'bg-blue-500/70' },
  { key: 'inteligencia', label: 'Inteligência', color: 'text-violet-400', barColor: 'bg-violet-500/70' },
] as const

// ── Evolução de Classe ────────────────────────────────────────────────────────
const levelandoClasse      = ref('')
const erroLevelClasse      = ref('')
const feedbackLevelClasse  = ref('')

const classesPersonagem = computed<any[]>(() => {
  const list = character.value?.data?.classes
  return Array.isArray(list) ? list : []
})

const podeDesbloquearClasse = computed(() => {
  const pts = character.value?.data?.classPoints ?? 0
  if (pts <= 0) return false
  const list = classesPersonagem.value
  if (!list.length) return false
  const normais = list.filter((c: any) => !c.isHybrid)
  // Pode pegar 2ª classe se tiver exatamente 1 normal com level >= 10
  if (normais.length === 1 && (normais[0].level ?? 1) >= 10) return true
  // Pode pegar classe híbrida se tiver 2+ normais com level >= 10 cada
  const normaisL10 = normais.filter((c: any) => (c.level ?? 1) >= 10)
  if (normaisL10.length >= 2 && !list.some((c: any) => c.isHybrid)) return true
  return false
})

const msgPreReqClasse = computed(() => {
  const list = classesPersonagem.value
  const normais = list.filter((c: any) => !c.isHybrid)
  if (normais.length === 1) return `Nível 10 na classe principal libera a 2ª classe.`
  return `Nível 10 em duas classes libera uma classe híbrida.`
})

async function levelarClasseHandler(cls: any) {
  const id = String(cls.classId ?? cls.name)
  if (levelandoClasse.value || !character.value) return
  erroLevelClasse.value = ''
  feedbackLevelClasse.value = ''
  levelandoClasse.value = id
  try {
    const updated = await levelarClasse(character.value.characterId, String(cls.classId ?? ''))
    character.value = updated
    const clsAtualizada = (updated.data?.classes as any[])?.find((c: any) => String(c.classId) === String(cls.classId))
    feedbackLevelClasse.value = clsAtualizada
      ? `${cls.name} evoluiu para Lv.${clsAtualizada.level}. Pts. de classe: ${updated.data?.classPoints ?? 0}`
      : 'Classe evoluída.'
    setTimeout(() => { feedbackLevelClasse.value = '' }, 4000)
  } catch (err: any) {
    erroLevelClasse.value = err?.response?.data?.message ?? err.message ?? 'Erro ao evoluir classe.'
  } finally {
    levelandoClasse.value = ''
  }
}

// ── Aprender Skill (gastar skillPoint) ───────────────────────────────────────
type SkillComFlag = SkillApi & { _locked: boolean }

const modalAprenderSkill          = ref(false)
const classeSelecionadaParaSkill  = ref<any | null>(null)
const carregandoSkillsClasse      = ref(false)
const skillsParaEscolher          = ref<SkillComFlag[]>([])
const skillSelecionadaId          = ref<string>('')
const aprendendoSkill             = ref(false)
const erroAprenderSkill           = ref('')

async function abrirModalAprenderSkill(cls: any) {
  if (!character.value) return
  classeSelecionadaParaSkill.value = cls
  skillSelecionadaId.value = ''
  erroAprenderSkill.value = ''
  modalAprenderSkill.value = true
  carregandoSkillsClasse.value = true
  try {
    const catalogo = await listarCatalogoSkills()
    const classId = String(cls.classId ?? '')
    const jaAprendidas = new Set<string>(
      (cls.chosenSkills ?? []).map((n: string) => n.toLowerCase())
    )
    const classLevel: number = cls.level ?? 1
    skillsParaEscolher.value = catalogo
      .filter(sk => String(sk.required_class ?? '') === classId && !jaAprendidas.has(sk.name.toLowerCase()))
      .map(sk => ({
        ...sk,
        _locked: (sk.nivel_minimo_classe ?? 0) > classLevel,
      }))
      .sort((a, b) => {
        if (a._locked && !b._locked) return 1
        if (!a._locked && b._locked) return -1
        return a.name.localeCompare(b.name)
      })
  } catch {
    skillsParaEscolher.value = []
  } finally {
    carregandoSkillsClasse.value = false
  }
}

async function confirmarAprenderSkill() {
  if (!skillSelecionadaId.value || !classeSelecionadaParaSkill.value || !character.value) return
  const sk = skillsParaEscolher.value.find(s => String(s.id) === skillSelecionadaId.value)
  if (!sk) return
  aprendendoSkill.value = true
  erroAprenderSkill.value = ''
  try {
    const updated = await escolherSkillDaClasse(
      character.value.characterId,
      String(classeSelecionadaParaSkill.value.classId ?? ''),
      sk.name,
    )
    character.value = updated
    modalAprenderSkill.value = false
    feedbackLevelClasse.value = `"${sk.name}" aprendida!`
    setTimeout(() => { feedbackLevelClasse.value = '' }, 4000)
  } catch (err: any) {
    erroAprenderSkill.value = err?.response?.data?.message ?? err.message ?? 'Erro ao aprender skill.'
  } finally {
    aprendendoSkill.value = false
  }
}

const modalDesbloquearClasse      = ref(false)
const classeSelecionadaId         = ref<number | null>(null)
const classesDisponiveis          = ref<ClasseApi[]>([])
const carregandoClassesDisponiveis = ref(false)
const desbloqueandoClasse         = ref(false)
const erroDesbloquear             = ref('')

async function abrirModalDesbloquearClasse() {
  if (!character.value) return
  modalDesbloquearClasse.value = true
  classeSelecionadaId.value = null
  erroDesbloquear.value = ''
  carregandoClassesDisponiveis.value = true
  try {
    const todas = await listarClassesParaPlayer(character.value.characterId)
    const idsAtual = new Set(classesPersonagem.value.map((c: any) => Number(c.classId)))
    classesDisponiveis.value = todas.filter(c => !idsAtual.has(Number(c.id)))
  } catch {
    classesDisponiveis.value = []
  } finally {
    carregandoClassesDisponiveis.value = false
  }
}

async function confirmarDesbloquearClasse() {
  if (!classeSelecionadaId.value || !character.value) return
  desbloqueandoClasse.value = true
  erroDesbloquear.value = ''
  try {
    const cls = classesDisponiveis.value.find(c => Number(c.id) === classeSelecionadaId.value)
    if (!cls) throw new Error('Classe não encontrada.')
    const updated = await escolherClasse(character.value.characterId, {
      classId: String(cls.id),
      className: String(cls.name),
      classTier: String(cls.tier ?? ''),
    })
    character.value = updated
    modalDesbloquearClasse.value = false
    feedbackLevelClasse.value = `${cls.name} desbloqueada com sucesso!`
    setTimeout(() => { feedbackLevelClasse.value = '' }, 4000)
  } catch (err: any) {
    erroDesbloquear.value = err?.response?.data?.message ?? err.message ?? 'Erro ao desbloquear classe.'
  } finally {
    desbloqueandoClasse.value = false
  }
}

// ── Distribuição de Pontos de Atributo ────────────────────────────────────────
const distribuicaoStaged    = ref<Record<string, number>>({})
const modalConfirmarAtributos = ref(false)
const distribuindoAtributos = ref(false)
const erroDistribuicao      = ref('')

const pontosDisponiveis = computed(() => character.value?.data?.pontosAtributo ?? 0)
const totalStagedAtributos = computed(() => Object.values(distribuicaoStaged.value).reduce((s, v) => s + (v || 0), 0))
const pontosRestantes = computed(() => (pontosDisponiveis.value as number) - totalStagedAtributos.value)

function ajustarStaged(attr: string, delta: number) {
  const atual = distribuicaoStaged.value[attr] ?? 0
  const novoValor = atual + delta
  if (novoValor < 0) return
  if (delta > 0 && pontosRestantes.value <= 0) return
  distribuicaoStaged.value = { ...distribuicaoStaged.value, [attr]: novoValor }
}

function limparStaged() {
  distribuicaoStaged.value = {}
}

watch(() => character.value?.characterId, () => {
  limparStaged()
  erroDistribuicao.value = ''
})

async function confirmarDistribuicao() {
  if (!character.value || totalStagedAtributos.value <= 0) return
  distribuindoAtributos.value = true
  erroDistribuicao.value = ''
  try {
    const distribuicao: Record<string, number> = {}
    for (const [k, v] of Object.entries(distribuicaoStaged.value)) {
      if ((v ?? 0) > 0) distribuicao[k] = v
    }
    const updated = await distribuirPontosAtributo(character.value.characterId, distribuicao)
    character.value = updated
    limparStaged()
    modalConfirmarAtributos.value = false
  } catch (err: any) {
    erroDistribuicao.value = err?.response?.data?.message ?? err.message ?? 'Erro ao distribuir pontos.'
    modalConfirmarAtributos.value = false
  } finally {
    distribuindoAtributos.value = false
  }
}

function notifKey(charId: string | number) { return `rpg-mesa.notif-seen-${charId}` }
function getLastSeen(charId: string | number): Date {
  const val = localStorage.getItem(notifKey(charId))
  return val ? new Date(val) : new Date(0)
}
function saveLastSeen(charId: string | number) {
  localStorage.setItem(notifKey(charId), new Date().toISOString())
}

async function loadNotifications(charId: string | number) {
  const lastSeen = getLastSeen(charId)
  const list: Notification[] = []
  try {
    const notes = await listLoreNotes(charId)
    for (const note of notes) {
      if (note.character_id === charId && new Date(note.created_at) > lastSeen) {
        list.push({ id: `note-${note.id}`, type: 'note', title: note.title, typeLabel: 'Nova nota exclusiva', route: '/notas' })
      }
    }
  } catch { /* silent */ }

  const godInfo = character.value?.data?.godAdditionalInfo
  if (godInfo && typeof godInfo === 'object') {
    for (const [godId, val] of Object.entries(godInfo as Record<string, any>)) {
      if (val?.addedAt && new Date(val.addedAt) > lastSeen) {
        list.push({ id: `god-${godId}`, type: 'god', title: `Informação sobre ${godId}`, typeLabel: 'Nova info de divindade', route: '/deuses' })
      }
    }
  }

  notifications.value = list
  unreadCount.value = list.length
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) { showSettingsMenu.value = false; showQuickInventory.value = false }
}

function markAllRead() {
  const charId = character.value?.characterId
  if (charId) saveLastSeen(charId)
  notifications.value = []
  unreadCount.value = 0
  showNotifications.value = false
}

function openNotification(notif: Notification) {
  showNotifications.value = false
  router.push(notif.route)
}

function toggleQuickInventory() {
  showQuickInventory.value = !showQuickInventory.value
  if (showQuickInventory.value) { showNotifications.value = false; showSettingsMenu.value = false }
}

// Inventory helpers
function genId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }

async function persistData(newData: any) {
  if (!character.value) return
  await editCharacter(character.value.characterId, { data: newData })
  character.value = { ...character.value, data: newData }
}

async function addNormalItem() {
  const name = newItemName.value.trim()
  if (!name || savingInventory.value) return
  savingInventory.value = true
  try {
    const current = [...normalInventory.value]
    current.push({ id: genId(), name, quantity: newItemQty.value || 1, addedAt: new Date().toISOString() })
    await persistData({ ...(character.value!.data ?? {}), inventory: current })
    newItemName.value = ''
    newItemQty.value = 1
  } finally { savingInventory.value = false }
}

async function removeNormalItem(itemId: string) {
  if (!character.value) return
  const current = normalInventory.value.filter(i => i.id !== itemId)
  await persistData({ ...(character.value.data ?? {}), inventory: current })
}

async function addQuickItem() {
  const name = newQuickItemName.value.trim()
  if (!name || savingQuickInventory.value) return
  savingQuickInventory.value = true
  try {
    const current = [...quickInventory.value]
    current.push({ id: genId(), name, quantity: newQuickItemQty.value || 1, addedAt: new Date().toISOString() })
    await persistData({ ...(character.value!.data ?? {}), quickInventory: current })
    newQuickItemName.value = ''
    newQuickItemQty.value = 1
  } finally { savingQuickInventory.value = false }
}

async function removeQuickItem(itemId: string) {
  if (!character.value) return
  const current = quickInventory.value.filter(i => i.id !== itemId)
  await persistData({ ...(character.value.data ?? {}), quickInventory: current })
}

// Navigation
function goToNotas() {
  const charId = getRequestedCharacterId()
  router.push(charId ? { path: '/notas', query: { characterId: charId } } : '/notas')
}
const goBack = () => { limparMetaAuthLocal(); router.push({ name: 'login', query: { force: '1' } }) }
const retornarPainelMestre = () => { closeSettingsMenu(); router.push({ name: 'master-panel' }) }
const toggleSettingsMenu = () => {
  showSettingsMenu.value = !showSettingsMenu.value
  if (showSettingsMenu.value) { showNotifications.value = false; showQuickInventory.value = false }
}
const closeSettingsMenu = () => { showSettingsMenu.value = false }

async function handleHeaderMenuSelect(itemId: string) {
  if (itemId === 'back') { goBack(); return }
  if (itemId === 'dashboard') {
    const characterId = getRequestedCharacterId()
    await router.push(characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' })
    return
  }
  const characterId = getRequestedCharacterId()
  const withCharId = (path: string) => characterId ? { path, query: { characterId } } : { path }
  const routeMap: Record<string, any> = {
    deuses: { path: '/deuses' },
    cidade: { path: '/cidade' },
    skills: withCharId('/skills'),
    titulos: withCharId('/titulos'),
    classes: withCharId('/classes'),
    npcs: withCharId('/npcs'),
    racas: withCharId('/racas'),
    equipamentos: withCharId('/equipamentos'),
    notas: withCharId('/notas'),
  }
  const target = routeMap[itemId]
  if (target) await router.push(target)
}

function initializeSettingsForm() {
  requestedName.value = character.value?.name ?? ''
  requestedAvatarPreview.value = character.value?.avatarUrl ?? ''
  selectedAvatarFile.value = null
  requestedHistory.value = String(character.value?.data?.history ?? '')
  requestedHistoryDocumentPath.value = String(character.value?.data?.historyDocumentPath ?? character.value?.data?.historyDocumentUrl ?? '')
  requestedHistoryDocumentName.value = String(character.value?.data?.historyDocumentName ?? '')
  requestedIndoleId.value = null
  selectedHistoryDoc.value = null
  feedback.value = ''
  feedbackIsError.value = false
}

const openSettings = async () => {
  closeSettingsMenu()
  initializeSettingsForm()
  if (authStore.eMestre) {
    showSettingsModal.value = true
    await loadPending()
  } else {
    showManagePanel.value = true
  }
}

const closeManagePanel = () => { showManagePanel.value = false; feedback.value = '' }
function closeSettingsModal() { showSettingsModal.value = false; feedback.value = '' }

const logout = async () => { closeSettingsMenu(); try { await authStore.sair() } finally { router.push({ name: 'login' }) } }

const onGlobalClick = () => {
  closeSettingsMenu()
  showNotifications.value = false
  showQuickInventory.value = false
}

onMounted(() => window.addEventListener('click', onGlobalClick))
onBeforeUnmount(() => window.removeEventListener('click', onGlobalClick))

async function loadPending() {
  settingsLoading.value = true
  try { await masterApprovalsStore.fetchPendingApprovals() }
  catch { feedback.value = 'Não foi possível carregar solicitações pendentes.'; feedbackIsError.value = true }
  finally { settingsLoading.value = false }
}

async function reviewRequest(characterId: string | number, approve: boolean) {
  settingsLoading.value = true
  try {
    await masterApprovalsStore.reviewPendingApproval(characterId, approve)
    feedback.value = approve ? 'Solicitação aprovada.' : 'Solicitação rejeitada.'
    feedbackIsError.value = false
  } catch {
    feedback.value = 'Erro ao revisar solicitação.'
    feedbackIsError.value = true
  } finally { settingsLoading.value = false }
}

async function markAsSeenResponse() {
  if (!character.value) return
  const currentData = character.value.data ?? {}
  const currentResponse = (currentData as any).changeRequestResponse
  if (!currentResponse) return
  await persistData({ ...(currentData as any), changeRequestResponse: { ...currentResponse, visto: true } })
}

async function submitRequest() {
  if (!character.value) return
  const nextName = requestedName.value.trim()
  const nextHistory = requestedHistory.value.trim()
  const changedName = nextName && nextName !== character.value.name ? nextName : undefined
  const changedAvatarFile = selectedAvatarFile.value
  const currentHistory = String(character.value.data?.history ?? '').trim()
  const changedHistory = nextHistory !== currentHistory ? nextHistory : undefined
  const changedDoc = selectedHistoryDoc.value != null
  const changedDocName = requestedHistoryDocumentName.value.trim() !== String(character.value.data?.historyDocumentName ?? '').trim()
  const changedIndole = requestedIndoleId.value !== null && requestedIndoleId.value !== character.value.indoleId

  if (!changedName && !changedAvatarFile && changedHistory === undefined && !changedDoc && !changedDocName && !changedIndole) {
    feedback.value = 'Informe ao menos um campo para solicitar alteração.'
    feedbackIsError.value = true
    return
  }
  settingsLoading.value = true
  feedback.value = ''
  try {
    await charactersStore.requestCharacterChangeWithFiles(
      character.value.characterId,
      {
        name: changedName,
        history: changedHistory,
        historyDocumentPath: !changedDoc && changedDocName ? requestedHistoryDocumentPath.value : undefined,
        historyDocumentName: !changedDoc && changedDocName ? requestedHistoryDocumentName.value : undefined,
        indoleId: changedIndole ? (requestedIndoleId.value ?? undefined) : undefined,
      },
      changedAvatarFile || undefined,
      selectedHistoryDoc.value || undefined,
    )
    feedback.value = 'Solicitação enviada para aprovação do mestre.'
    feedbackIsError.value = false
  } catch {
    feedback.value = 'Erro ao enviar solicitação. Tente novamente.'
    feedbackIsError.value = true
  } finally { settingsLoading.value = false }
}

async function downloadRetrato() {
  if (!character.value?.avatarUrl) return
  try {
    const response = await fetch(character.value.avatarUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${character.value.name}.jpg`
    a.click()
    URL.revokeObjectURL(url)
  } catch { /* silent */ }
}

function triggerAvatarInput() { avatarInput.value?.click() }
function handleAvatarSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) processRequestedAvatar(target.files[0])
}
function handleDrop(event: DragEvent) {
  isDragging.value = false
  if (event.dataTransfer?.files?.[0]) processRequestedAvatar(event.dataTransfer.files[0])
}
function processRequestedAvatar(file: File) {
  if (!file.type.startsWith('image/')) { feedback.value = 'Selecione apenas imagens.'; feedbackIsError.value = true; return }
  if (file.size > 5 * 1024 * 1024) { feedback.value = 'A imagem deve ter no máximo 5MB.'; feedbackIsError.value = true; return }
  requestedAvatarPreview.value = URL.createObjectURL(file)
  selectedAvatarFile.value = file
  feedback.value = ''
  feedbackIsError.value = false
}
function removeRequestedAvatar() { requestedAvatarPreview.value = ''; selectedAvatarFile.value = null }
function triggerHistoryDocInput() { historyDocInput.value?.click() }
function handleHistoryDocSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  const lower = file.name.toLowerCase()
  if (!lower.endsWith('.doc') && !lower.endsWith('.docx') && !lower.endsWith('.pdf')) {
    feedback.value = 'Anexe apenas .doc, .docx ou .pdf.'
    feedbackIsError.value = true
    return
  }
  selectedHistoryDoc.value = file
  requestedHistoryDocumentName.value = file.name
  feedback.value = ''
  feedbackIsError.value = false
}
async function openHistoryDocument(pathOrUrl: string) {
  try {
    const signedUrl = await getHistoryDocumentSignedUrl(pathOrUrl)
    window.open(signedUrl, '_blank', 'noopener')
  } catch { feedback.value = 'Não foi possível abrir o documento.'; feedbackIsError.value = true }
}

function getRequestedCharacterId() {
  const queryId = String(route.query.characterId ?? '').trim()
  if (queryId) return queryId
  return String(authStore.idPersonagemAtivo ?? '').trim()
}

function setLoadError(err: unknown, fallbackMessage: string) {
  const maybeError = err as { message?: string; code?: string; response?: { status?: number } }
  const status = maybeError?.response?.status
  const message = String(maybeError?.message ?? '')
  error.value = fallbackMessage
  errorHint.value = ''
  if (status === 401) { error.value = 'Sua sessão expirou ou não está autorizada.'; errorHint.value = 'Faça login novamente.' }
  else if (status === 404) { error.value = 'Este personagem não foi encontrado.'; errorHint.value = 'Ele pode ter sido removido.' }
  else if (maybeError?.code === 'ECONNABORTED' || message.includes('Network Error') || message.includes('timeout')) {
    error.value = 'Falha de conexão com o servidor.'
    errorHint.value = 'Verifique a API e tente novamente.'
  }
}

async function loadCharacter() {
  loading.value = true
  error.value = ''
  errorHint.value = ''
  let characterId = getRequestedCharacterId()

  if (!characterId && !authStore.eMestre) {
    try {
      await charactersStore.fetchCharacters()
      characterId = String(charactersStore.myCharacters[0]?.characterId ?? '')
      if (characterId) {
        authStore.definirPersonagemAtivo(characterId)
        await router.replace({ name: 'dashboard', query: { characterId } })
      }
    } catch { /* keep error handling below */ }
  }

  if (!characterId) {
    error.value = authStore.eMestre ? 'Personagem não informado para visualização.' : 'Nenhum personagem disponível.'
    errorHint.value = authStore.eMestre ? 'Abra um personagem a partir do painel.' : 'Crie ou selecione um personagem.'
    loading.value = false
    return
  }

  try {
    character.value = await charactersStore.fetchCharacterById(characterId)
    authStore.definirPersonagemAtivo(characterId)

    if (!authStore.eMestre && !(character.value as any)?.onboardingCompleto) {
      await router.replace({ name: 'onboarding', query: { characterId } })
      return
    }

    initializeSettingsForm()
    await loadNotifications(characterId)

    Promise.all([
      listarRacasPublicas().then(r => { todasRacas.value = r }),
      listarPassados().then(p => { todosPassados.value = p }),
      listPublicGods().then(g => { todosDeuses.value = g }),
      listarIndole().then(i => { todasIndoles.value = i }),
    ]).catch(() => {})

    if (!authStore.eMestre) {
      try {
        telasHabilitadas.value = await listarMinhasTelas(characterId)
      } catch {
        telasHabilitadas.value = []
      }
    }

    if (!authStore.eMestre) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.requires_password_change) {
        novaSenhaObrigatoria.value = ''
        novaSenhaObrigatoriaConfirmacao.value = ''
        erroNovaSenha.value = ''
        showPasswordChangeModal.value = true
      }
    }
  } catch (err) {
    const maybeError = err as { response?: { status?: number } }
    if (!authStore.eMestre && maybeError?.response?.status === 404) {
      try {
        await charactersStore.fetchCharacters()
        const fallbackId = String(charactersStore.myCharacters[0]?.characterId ?? '')
        if (fallbackId) {
          authStore.definirPersonagemAtivo(fallbackId)
          await router.replace({ name: 'dashboard', query: { characterId: fallbackId } })
          character.value = await charactersStore.fetchCharacterById(fallbackId)
          initializeSettingsForm()
          await loadNotifications(fallbackId)
          return
        }
      } catch { /* keep generic error below */ }
    }
    setLoadError(err, 'Não foi possível carregar este personagem.')
  } finally { loading.value = false }
}

async function retryLoad() { await loadCharacter() }
onMounted(async () => { await loadCharacter() })
watch(() => route.query.characterId, async (next, prev) => {
  if (String(next ?? '') === String(prev ?? '')) return
  await loadCharacter()
})
</script>

<style scoped>
/* ── Font ── */
.font-cinzel { font-family: 'Cinzel', serif; }

/* ── Page shell ── */
.dash-root {
  background: var(--bg-page);
  color: var(--text-main);
}
.dash-ambient {
  background: linear-gradient(135deg, #0F1C3A 0%, #1A2438 50%, rgba(42,27,74,0.5) 100%);
}
:global(html.theme-light) .dash-ambient { display: none; }

/* ── Header ── */
.dash-header {
  background: color-mix(in srgb, var(--bg-page) 75%, transparent);
  border-color: var(--border-soft);
}

/* ── Icon buttons ── */
.dash-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: 0.75rem;
  color: var(--text-muted);
  transition: background 0.15s, color 0.15s;
}
.dash-icon-btn:hover { background: var(--accent-soft); color: var(--text-main); }

/* ── Notification dot ── */
.notif-dot {
  position: absolute;
  top: 0.2rem;
  right: 0.2rem;
  min-width: 1rem;
  height: 1rem;
  border-radius: 999px;
  color: #000;
  font-size: 0.55rem;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.2rem;
}

/* ── Dropdown panel ── */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  z-index: 50;
  border-radius: 1rem;
  border: 1px solid var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 97%, #fff 3%);
  box-shadow: 0 20px 40px rgb(0 0 0 / 0.25);
  overflow: hidden;
}
.dropdown-item {
  display: block;
  width: 100%;
  border-radius: 0.65rem;
  padding: 0.55rem 0.85rem;
  text-align: left;
  font-size: 0.875rem;
  color: var(--text-main);
  transition: background 0.12s;
}
.dropdown-item:hover { background: var(--accent-soft); }

/* ── Cards ── */
.dash-card {
  border-radius: 1rem;
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
}

/* ── Portrait ── */
.dash-portrait-card {
  border-radius: 1.25rem;
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.2);
  overflow: hidden;
}
.dash-avatar-empty { background: var(--bg-soft); }

/* ── Tiny label ── */
.dash-tiny-label {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}
.dash-section-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

/* ── Manage button ── */
.dash-manage-btn {
  font-family: 'Cinzel', serif;
  border: 1px solid var(--border-soft);
  background: var(--bg-card);
  color: var(--text-muted);
}
.dash-manage-btn:hover { background: var(--accent-soft); color: var(--text-main); }

/* ── Tab nav ── */
.dash-tab-nav {
  background: color-mix(in srgb, var(--bg-soft) 80%, transparent);
  border-color: var(--border-soft);
}
.dash-tab-active {
  background: var(--brand-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgb(79 70 229 / 0.3);
}
.dash-tab-inactive { color: var(--text-muted); }
.dash-tab-inactive:hover { background: var(--accent-soft); color: var(--text-main); }

/* ── Inventory ── */

/* Equipment placeholder card */
.inv-equip-card {
  border-color: rgb(107 78 158 / 0.2);
}
.inv-equip-inner {
  background: linear-gradient(135deg, rgb(107 78 158 / 0.06) 0%, transparent 60%);
}
.inv-equip-icon-wrap {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  background: rgb(107 78 158 / 0.12);
  border: 1px solid rgb(107 78 158 / 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a78bfa;
}
.inv-equip-title { color: #c4b5fd; }
.inv-equip-sub { color: var(--text-muted); }
.inv-equip-lock { color: var(--text-muted); opacity: 0.35; }
.inv-soon-badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #a78bfa;
  background: rgb(139 92 246 / 0.12);
  border: 1px solid rgb(139 92 246 / 0.25);
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
}

/* Inventory card header */
.inv-card-header { border-bottom: none; }

.inv-header-icon {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: rgb(180 83 9 / 0.12);
  border: 1px solid rgb(180 83 9 / 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  flex-shrink: 0;
}

.inv-count-badge {
  font-size: 0.68rem;
  color: var(--text-muted);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  padding: 0.15rem 0.55rem;
  background: var(--bg-soft);
}

/* Input fields */
.inv-input {
  background: var(--bg-soft);
  border: 1px solid var(--border-soft);
  border-radius: 0.65rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: var(--text-main);
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  min-width: 0;
}
.inv-input:focus {
  border-color: var(--ring-soft);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ring-soft) 15%, transparent);
}
.inv-input::placeholder { color: var(--text-muted); opacity: 0.45; }
.inv-input.flex-1 { flex: 1 1 0%; }
.inv-input-qty {
  width: 3.5rem;
  flex-shrink: 0;
  text-align: center;
}

.inv-add-row { display: flex; gap: 0.5rem; align-items: center; }

/* Add button */
.inv-add-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.4rem;
  height: 2.4rem;
  background: linear-gradient(135deg, rgb(180 83 9 / 0.8), rgb(146 64 14 / 0.8));
  border-radius: 0.65rem;
  color: #fff;
  transition: filter 0.15s, transform 0.1s;
}
.inv-add-btn:not(:disabled):hover { filter: brightness(1.15); transform: translateY(-1px); }
.inv-add-btn:not(:disabled):active { transform: translateY(0); }

/* Empty state */
.inv-empty-state {
  padding: 2.5rem 0;
  text-align: center;
}

/* Item list */
.inv-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 22rem;
  overflow-y: auto;
  padding-right: 2px;
}

.inv-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: var(--bg-soft);
  border: 1px solid var(--border-soft);
  border-radius: 0.75rem;
  padding: 0.6rem 0.8rem;
  transition: border-color 0.15s, background 0.15s;
}
.inv-item:hover {
  border-color: rgb(107 78 158 / 0.3);
  background: color-mix(in srgb, var(--bg-soft) 90%, rgb(107 78 158 / 0.1));
}

/* qty tag — inventário principal */
.inv-qty-tag {
  font-size: 0.72rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #fbbf24;
  min-width: 2rem;
  text-align: right;
}

/* qty-badge mantido para compatibilidade */
.qty-badge {
  font-size: 0.62rem;
  font-weight: 700;
  color: #fbbf24;
  background: rgba(120, 53, 15, 0.35);
  border: 1px solid rgba(180, 83, 9, 0.3);
  border-radius: 999px;
  padding: 0.12rem 0.5rem;
}

.inv-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: opacity 0.15s, color 0.15s;
  line-height: 0;
  padding: 0.2rem;
  border-radius: 0.35rem;
}
.inv-remove:hover { color: #f87171; }

/* TransitionGroup for items */
.inv-item-enter-active,
.inv-item-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.inv-item-enter-from { opacity: 0; transform: translateY(-6px); }
.inv-item-leave-to { opacity: 0; transform: translateX(12px); }
.inv-item-leave-active { position: absolute; width: 100%; }

/* ── Backpack button ── */
.backpack-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.65rem;
  height: 2rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border-soft);
  background: var(--bg-soft);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 600;
  transition: all 0.15s;
}
.backpack-btn:hover, .backpack-btn-active {
  border-color: rgb(180 83 9 / 0.4);
  background: rgb(180 83 9 / 0.08);
  color: #fbbf24;
}
.backpack-label { font-size: 0.7rem; }
.backpack-badge {
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  min-width: 1rem;
  height: 1rem;
  border-radius: 999px;
  background: rgb(180 83 9 / 0.9);
  color: #fff;
  font-size: 0.52rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.2rem;
}

/* ── Quick inventory panel — hologram ── */
.quick-inv-panel {
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: 22rem;
  z-index: 50;
  border-radius: 1rem;
  border: 1px solid rgba(251, 191, 36, 0.18);
  background: rgba(7, 12, 24, 0.82);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  box-shadow:
    0 0 0 1px rgba(251, 191, 36, 0.06),
    0 8px 40px rgba(0, 0, 0, 0.6),
    0 0 60px rgba(180, 83, 9, 0.07),
    inset 0 1px 0 rgba(251, 191, 36, 0.06);
  overflow: hidden;
}
/* faixa de brilho no topo */
.quick-inv-panel::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, rgba(251,191,36,0.35) 40%, rgba(251,191,36,0.35) 60%, transparent 95%);
  pointer-events: none;
}
.quick-inv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem 0.75rem;
  border-bottom: 1px solid rgba(251, 191, 36, 0.08);
}
.quick-inv-body { padding: 0.75rem; }
.quick-add-row { display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.65rem; }

/* input qty compacto na mochila */
.quick-qty-input {
  width: 2.8rem;
  flex-shrink: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(251, 191, 36, 0.15);
  border-radius: 0.55rem;
  padding: 0.45rem 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fbbf24;
  outline: none;
  text-align: center;
  transition: border-color 0.15s;
}
.quick-qty-input:focus { border-color: rgba(251, 191, 36, 0.4); }

/* override do inv-input dentro da mochila para tom holográfico */
.quick-inv-body .inv-input {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
  color: rgba(226, 232, 240, 0.9);
}
.quick-inv-body .inv-input:focus {
  border-color: rgba(251, 191, 36, 0.3);
  box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.06);
}

.quick-inv-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 14rem;
  overflow-y: auto;
  padding-right: 2px;
}
.quick-inv-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.65rem;
  border-radius: 0.55rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: background 0.15s, border-color 0.15s;
}
.quick-inv-item:hover {
  background: rgba(251, 191, 36, 0.05);
  border-color: rgba(251, 191, 36, 0.15);
}
.quick-qty-tag {
  font-size: 0.75rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: #fbbf24;
  flex-shrink: 0;
  min-width: 1.8rem;
  text-shadow: 0 0 8px rgba(251, 191, 36, 0.4);
}
.quick-item-name {
  color: rgba(226, 232, 240, 0.85);
}
/* inv-remove dentro da mochila */
.quick-inv-item .inv-remove { color: rgba(255,255,255,0.3); }
.quick-inv-item .inv-remove:hover { color: #f87171; }

/* linha de scan sutil no fundo do painel */
.quick-inv-panel::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(251, 191, 36, 0.012) 3px,
    rgba(251, 191, 36, 0.012) 4px
  );
  pointer-events: none;
}

.quick-item-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: rgb(180 83 9 / 0.5);
  flex-shrink: 0;
}

/* ── Manage character panel ── */
.manage-panel {
  background: var(--bg-card);
  box-shadow: -8px 0 40px rgb(0 0 0 / 0.3);
}
.manage-panel-header {
  background: color-mix(in srgb, var(--bg-card) 95%, transparent);
  border-color: var(--border-soft);
  backdrop-filter: blur(8px);
}
.manage-panel-footer {
  background: color-mix(in srgb, var(--bg-card) 95%, transparent);
  border-color: var(--border-soft);
  backdrop-filter: blur(8px);
}
.manage-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.6rem;
  border: 1px solid var(--border-soft);
  color: var(--text-muted);
  transition: all 0.15s;
}
.manage-close-btn:hover { background: var(--accent-soft); color: var(--text-main); }

.manage-field-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}
.manage-current-value {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-soft);
  border: 1px solid var(--border-soft);
  border-radius: 0.75rem;
  padding: 0.6rem 0.85rem;
  line-height: 1.5;
}
.manage-input {
  width: 100%;
  border-radius: 0.85rem;
  border: 1px solid var(--border-soft);
  background: var(--bg-soft);
  padding: 0.65rem 0.9rem;
  color: var(--text-main);
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s;
  resize: vertical;
}
.manage-input:focus { border-color: var(--ring-soft); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ring-soft) 20%, transparent); }
.manage-input::placeholder { color: var(--text-muted); opacity: 0.5; }

.manage-upload-zone {
  border: 2px dashed var(--border-soft);
  border-radius: 1rem;
  padding: 1rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.manage-upload-zone:hover { border-color: var(--ring-soft); background: var(--accent-soft); }
.manage-upload-empty { display: flex; align-items: center; justify-content: center; min-height: 4.5rem; }
.manage-upload-preview { border-style: solid; border-color: var(--border-soft); }

/* ── Transitions ── */
.dropdown-enter-active,
.dropdown-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.dropdown-enter-from,
.dropdown-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }

.manage-slide-enter-active,
.manage-slide-leave-active { transition: opacity 0.25s ease; }
.manage-slide-enter-active .manage-panel,
.manage-slide-leave-active .manage-panel { transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.manage-slide-enter-from .manage-panel,
.manage-slide-leave-to .manage-panel { transform: translateX(100%); }
.manage-slide-enter-from,
.manage-slide-leave-to { opacity: 0; }
</style>

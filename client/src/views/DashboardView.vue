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
              <span v-if="unreadCount > 0" class="notif-dot">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="showNotifications" class="dropdown-panel right-0 w-80">
                <div class="flex items-center justify-between px-4 py-3 border-b border-[#6B4E9E]/20">
                  <span class="text-sm font-semibold text-amber-400 font-cinzel">Notificações</span>
                  <button v-if="notifications.length > 0" @click="markAllRead" class="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Marcar como lido</button>
                </div>
                <div class="max-h-72 overflow-y-auto">
                  <div v-if="notifications.length === 0" class="px-4 py-8 text-center text-zinc-500 text-sm italic">Nenhuma novidade por enquanto.</div>
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
                <div class="relative aspect-[3/4] overflow-hidden">
                  <img
                    v-if="character.avatarUrl"
                    :src="character.avatarUrl"
                    :alt="character.name"
                    class="w-full h-full object-cover"
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
                  <div v-if="(character.data?.classes ?? []).length" class="mt-5 pt-4 border-t border-[#6B4E9E]/15">
                    <p class="dash-section-label mb-2.5">Classes</p>
                    <div class="flex flex-wrap gap-2">
                      <div
                        v-for="cls in character.data.classes"
                        :key="cls.classId ?? cls.name"
                        class="flex items-center gap-1.5 bg-amber-900/20 border border-amber-700/25 rounded-xl px-3 py-1.5 hover:border-amber-600/50 transition-colors"
                      >
                        <span class="text-xs font-semibold text-amber-200">{{ cls.name }}</span>
                        <span class="text-[0.6rem] font-bold text-amber-500/70 bg-amber-900/40 border border-amber-700/20 rounded-full px-1.5 py-0.5 font-cinzel">Lv {{ cls.level ?? 1 }}</span>
                      </div>
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

                <!-- ── Equipamentos (future section) ─────────────────── -->
                <div class="inv-equip-card dash-card overflow-hidden">
                  <div class="inv-equip-inner px-5 py-4 flex items-center gap-4">
                    <div class="inv-equip-icon-wrap flex-shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 17.5L3 6 3 3l3 0 11.5 11.5"/>
                        <path d="M13 19l6-6"/>
                        <path d="M16 16l4 4"/>
                        <path d="M19 21l2-2"/>
                        <circle cx="4.5" cy="4.5" r="0.5" fill="currentColor"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-0.5">
                        <span class="text-xs font-semibold font-cinzel inv-equip-title">Equipamentos</span>
                        <span class="inv-soon-badge">Em breve</span>
                      </div>
                      <p class="text-[0.68rem] inv-equip-sub leading-relaxed">Armas, armaduras e itens mágicos do catálogo do mestre aparecerão aqui</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inv-equip-lock flex-shrink-0">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { getHistoryDocumentSignedUrl } from '@/lib/supabase/storage'
import { limparMetaAuthLocal, useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useMasterApprovalsStore } from '@/stores/masterApprovals'
import { editCharacter } from '@/lib/api/personagens.api'
import { listLoreNotes } from '@/lib/api/lore-notes.api'
import type { PersonagemApi } from '@/types/supabase'

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
const avatarInput = ref<HTMLInputElement | null>(null)
const historyDocInput = ref<HTMLInputElement | null>(null)
const selectedHistoryDoc = ref<File | null>(null)
const isDragging = ref(false)
const feedback = ref('')
const feedbackIsError = ref(false)

const pendingApprovals = computed(() => masterApprovalsStore.pendingApprovals)

const tabs = [
  { id: 'personagem', label: 'Personagem' },
  { id: 'inventario', label: 'Inventário' },
]

const dashboardHeaderMenuItems = [
  { id: 'back', label: 'Voltar' },
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Títulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'racas', label: 'Raças' },
  { id: 'equipamentos', label: 'Equipamentos' },
  { id: 'notas', label: 'Notas de Aventura' },
]

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

const indoleLabel = computed(() => {
  const raw = (character.value?.data?.indole as string) ?? 'neutro'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})

const indoleColor = computed(() => {
  const raw = (character.value?.data?.indole as string) ?? 'neutro'
  if (raw.includes('bom')) return 'text-emerald-400'
  if (raw.includes('ruim') || raw.includes('mau')) return 'text-red-400'
  return 'text-zinc-400'
})

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

function notifKey(charId: string) { return `rpg-mesa.notif-seen-${charId}` }
function getLastSeen(charId: string): Date {
  const val = localStorage.getItem(notifKey(charId))
  return val ? new Date(val) : new Date(0)
}
function saveLastSeen(charId: string) {
  localStorage.setItem(notifKey(charId), new Date().toISOString())
}

async function loadNotifications(charId: string) {
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

async function reviewRequest(characterId: string, approve: boolean) {
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

  if (!changedName && !changedAvatarFile && changedHistory === undefined && !changedDoc && !changedDocName) {
    feedback.value = 'Informe ao menos um campo para solicitar alteração.'
    feedbackIsError.value = true
    return
  }
  settingsLoading.value = true
  feedback.value = ''
  try {
    await charactersStore.requestCharacterChangeWithFiles(
      character.value.characterId,
      { name: changedName, history: changedHistory, historyDocumentPath: !changedDoc && changedDocName ? requestedHistoryDocumentPath.value : undefined, historyDocumentName: !changedDoc && changedDocName ? requestedHistoryDocumentName.value : undefined },
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
      characterId = charactersStore.myCharacters[0]?.characterId ?? ''
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
    initializeSettingsForm()
    await loadNotifications(characterId)
  } catch (err) {
    const maybeError = err as { response?: { status?: number } }
    if (!authStore.eMestre && maybeError?.response?.status === 404) {
      try {
        await charactersStore.fetchCharacters()
        const fallbackId = charactersStore.myCharacters[0]?.characterId ?? ''
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
  background: #f59e0b;
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

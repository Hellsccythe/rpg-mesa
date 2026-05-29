<template>
  <div class="page-root min-h-screen overflow-x-hidden text-white" @click="fecharDropdowns">
    <div class="page-ambient fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#1C0B0B]" />
    <div class="page-ambient fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgb(180_40_40/0.08),transparent)]" />

    <TemaDarkLight variante="contexto" class="relative z-0 flex min-h-screen flex-col">

      <!-- ══ Header ═══════════════════════════════════════════════════════════ -->
      <header class="page-header sticky top-0 z-20 border-b backdrop-blur-xl">
        <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <button @click="goMasterPanel" class="back-btn inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition-colors">
            <span class="text-lg leading-none">‹</span>
            <span class="hidden sm:inline">Painel</span>
          </button>
          <div class="flex-1 text-center">
            <span class="text-xs font-bold tracking-[0.3em] uppercase text-red-400">⚙ Equipamentos ⚙</span>
          </div>
          <button @click="logout" class="rounded-xl border border-red-900/50 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/60">
            Sair
          </button>
        </div>
      </header>

      <!-- ══ Main ════════════════════════════════════════════════════════════ -->
      <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">

        <!-- Título -->
        <div class="mb-8">
          <p class="page-kicker text-xs uppercase tracking-[0.25em]">Painel do Mestre</p>
          <h1 class="page-title text-3xl font-bold sm:text-4xl">Equipamentos</h1>
          <p class="page-sub mt-1 text-sm">Cadastre, edite e organize os equipamentos da campanha</p>
        </div>

        <!-- Filtros + Botão novo -->
        <div class="mb-6 flex flex-wrap items-end gap-3">
          <div class="min-w-[180px] flex-1">
            <label class="field-label mb-1.5 block text-xs uppercase tracking-wide">Filtrar por nome</label>
            <div class="relative">
              <input v-model="filtroNome" type="text" placeholder="Buscar equipamento..." class="field-input w-full rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none transition-colors" />
              <button v-if="filtroNome" @click="filtroNome = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm leading-none opacity-50 hover:opacity-100 transition-opacity">✕</button>
            </div>
          </div>

          <div class="w-52">
            <label class="field-label mb-1.5 block text-xs uppercase tracking-wide">Categoria</label>
            <div class="select-wrap">
              <select v-model="filtroCategoria" class="field-input w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none transition-colors">
                <option :value="null">Todas as categorias</option>
                <option v-for="c in categorias" :key="c.item" :value="c.item">{{ (c.icone && !c.icone.startsWith('mdi-')) ? c.icone + ' ' + c.descricao : c.descricao }}</option>
              </select>
              <span class="select-caret">˅</span>
            </div>
          </div>

          <button @click="abrirFormNova" class="btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all">
            <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Novo Equipamento
          </button>
        </div>

        <!-- ── Formulário criar / editar ──────────────────────────────────── -->
        <transition name="form-slide">
          <div v-if="mostrarForm" class="form-card mb-6 rounded-2xl border p-5 sm:p-6">
            <div class="mb-5 flex items-center justify-between">
              <h2 class="form-title text-base font-bold tracking-wide">
                {{ editandoId ? 'Editar Equipamento' : 'Novo Equipamento' }}
              </h2>
              <button @click="fecharForm" class="close-btn rounded-lg p-1.5 transition-colors">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">

              <!-- Nome -->
              <div class="lg:col-span-2">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Nome <span class="text-red-400">*</span></label>
                <input v-model="form.nome" type="text" placeholder="Ex: Espada Longa" class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors" />
              </div>

              <!-- Dano -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Dano</label>
                <input v-model="form.dano" type="text" placeholder="Ex: 1d8+3" class="field-input w-full rounded-xl border px-3 py-2.5 text-sm font-mono outline-none transition-colors" />
              </div>

              <!-- ── Categoria (single-select dropdown — PRIMÁRIO) ─────────── -->
              <div class="sm:col-span-2 lg:col-span-3">
                <div class="flex items-center gap-2 mb-1.5">
                  <label class="field-label text-xs font-semibold uppercase tracking-wide">Categoria</label>
                  <button @click.stop="abrirAddModal('categoria')" class="lookup-add-btn" title="Adicionar categoria">+ Adicionar</button>
                  <button @click.stop="abrirGerenciarModal('categoria')" class="lookup-edit-btn" title="Gerenciar categorias">✏ Gerenciar</button>
                </div>

                <div class="relative" @click.stop>
                  <button
                    @click.stop="toggleDropdown('categoria')"
                    class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors text-left flex items-center justify-between"
                  >
                    <span :class="form.categoria_equipamento_item ? 'flex items-center gap-1.5' : 'placeholder-color'">
                      <IconeDisplay v-if="form.categoria_equipamento_item && categoriaIcone(form.categoria_equipamento_item)" :icone="categoriaIcone(form.categoria_equipamento_item)" size="1rem" />
                      {{ categoriaLabel(form.categoria_equipamento_item) }}
                    </span>
                    <span class="text-zinc-500 ml-2">˅</span>
                  </button>

                  <div v-if="dropdownAtivo === 'categoria'" class="dropdown-panel absolute left-0 top-full mt-1 z-30 w-full rounded-xl border shadow-xl max-h-52 overflow-y-auto">
                    <button
                      v-if="form.categoria_equipamento_item"
                      @click.stop="selecionarCategoria(null)"
                      class="dropdown-item w-full text-left px-3 py-2 text-sm text-zinc-400 italic"
                    >Nenhuma categoria</button>
                    <button
                      v-for="c in categorias"
                      :key="c.item"
                      @click.stop="selecionarCategoria(c.item)"
                      class="dropdown-item w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between"
                      :class="form.categoria_equipamento_item === c.item ? 'dropdown-item-active' : ''"
                    >
                      <span class="flex items-center gap-1.5">
                        <IconeDisplay v-if="c.icone" :icone="c.icone" size="1rem" />
                        {{ c.descricao }}
                      </span>
                      <span v-if="form.categoria_equipamento_item === c.item" class="text-xs text-red-400">✓</span>
                    </button>
                    <div v-if="categorias.length === 0" class="px-3 py-2 text-sm text-zinc-500 italic">Nenhuma categoria cadastrada.</div>
                  </div>
                </div>
              </div>

              <!-- ── Tipo (multi-select dropdown, filtrado por categoria) ─── -->
              <div class="sm:col-span-2 lg:col-span-3">
                <div class="flex items-center gap-2 mb-1.5">
                  <label class="field-label text-xs font-semibold uppercase tracking-wide">Tipos</label>
                  <button @click.stop="abrirAddModal('tipo')" class="lookup-add-btn" title="Adicionar tipo">+ Adicionar</button>
                  <button @click.stop="abrirGerenciarModal('tipo')" class="lookup-edit-btn" title="Gerenciar tipos">✏ Gerenciar</button>
                </div>

                <div class="relative" @click.stop>
                  <button
                    @click.stop="toggleDropdown('tipo')"
                    class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors text-left flex items-center justify-between"
                    :disabled="!form.categoria_equipamento_item"
                  >
                    <span :class="form.tipo_equipamento_item.length === 0 ? 'placeholder-color' : ''">
                      {{ form.tipo_equipamento_item.length === 0
                        ? (form.categoria_equipamento_item ? 'Selecionar tipos...' : 'Selecione uma categoria primeiro')
                        : `${form.tipo_equipamento_item.length} tipo(s) selecionado(s)` }}
                    </span>
                    <span class="text-zinc-500 ml-2">˅</span>
                  </button>

                  <div v-if="dropdownAtivo === 'tipo'" class="dropdown-panel absolute left-0 top-full mt-1 z-30 w-full rounded-xl border shadow-xl max-h-52 overflow-y-auto">
                    <label
                      v-for="t in tiposFiltrados"
                      :key="t.item"
                      class="dropdown-item flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                      :class="form.tipo_equipamento_item.includes(t.item) ? 'dropdown-item-active' : ''"
                      @click.stop
                    >
                      <input type="checkbox" :value="t.item" v-model="form.tipo_equipamento_item" class="sr-only" />
                      <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[0.6rem]"
                        :class="form.tipo_equipamento_item.includes(t.item) ? 'check-active' : 'check-inactive'">
                        {{ form.tipo_equipamento_item.includes(t.item) ? '✓' : '' }}
                      </span>
                      {{ t.descricao }}
                    </label>
                    <div v-if="tiposFiltrados.length === 0" class="px-3 py-2 text-sm text-zinc-500 italic">
                      {{ form.categoria_equipamento_item ? 'Nenhum tipo para esta categoria.' : 'Selecione uma categoria primeiro.' }}
                    </div>
                  </div>
                </div>

                <!-- Tags dos tipos selecionados -->
                <div v-if="form.tipo_equipamento_item.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                  <span v-for="id in form.tipo_equipamento_item" :key="id" class="lookup-tag">
                    {{ tipoNome(id) }}
                    <button @click.stop="removeDoForm('tipo', id)" class="ml-1 opacity-60 hover:opacity-100">×</button>
                  </span>
                </div>
              </div>

              <!-- ── Classe (multi-select dropdown — SECUNDÁRIO) ─────────── -->
              <div class="sm:col-span-2 lg:col-span-3">
                <div class="flex items-center gap-2 mb-1.5">
                  <label class="field-label text-xs font-semibold uppercase tracking-wide">Classes</label>
                  <button @click.stop="abrirAddModal('classe')" class="lookup-add-btn">+ Adicionar</button>
                  <button @click.stop="abrirGerenciarModal('classe')" class="lookup-edit-btn">✏ Gerenciar</button>
                </div>

                <div class="relative" @click.stop>
                  <button
                    @click.stop="toggleDropdown('classe')"
                    class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors text-left flex items-center justify-between"
                  >
                    <span :class="form.classe_equipamento_item.length === 0 ? 'placeholder-color' : ''">
                      {{ form.classe_equipamento_item.length === 0 ? 'Selecionar classes...' : `${form.classe_equipamento_item.length} classe(s) selecionada(s)` }}
                    </span>
                    <span class="text-zinc-500 ml-2">˅</span>
                  </button>

                  <div v-if="dropdownAtivo === 'classe'" class="dropdown-panel absolute left-0 top-full mt-1 z-30 w-full rounded-xl border shadow-xl max-h-52 overflow-y-auto">
                    <label
                      v-for="c in classes"
                      :key="c.item"
                      class="dropdown-item flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                      :class="form.classe_equipamento_item.includes(c.item) ? 'dropdown-item-active' : ''"
                      @click.stop
                    >
                      <input type="checkbox" :value="c.item" v-model="form.classe_equipamento_item" class="sr-only" />
                      <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[0.6rem]"
                        :class="form.classe_equipamento_item.includes(c.item) ? 'check-active' : 'check-inactive'">
                        {{ form.classe_equipamento_item.includes(c.item) ? '✓' : '' }}
                      </span>
                      {{ c.descricao }}
                    </label>
                    <div v-if="classes.length === 0" class="px-3 py-2 text-sm text-zinc-500 italic">Nenhuma classe cadastrada.</div>
                  </div>
                </div>

                <div v-if="form.classe_equipamento_item.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                  <span v-for="id in form.classe_equipamento_item" :key="id" class="lookup-tag">
                    {{ classeNome(id) }}
                    <button @click.stop="removeDoForm('classe', id)" class="ml-1 opacity-60 hover:opacity-100">×</button>
                  </span>
                </div>
              </div>

              <!-- ── Propriedade (multi-select dropdown) ─────────────────── -->
              <div class="sm:col-span-2 lg:col-span-3">
                <div class="flex items-center gap-2 mb-1.5">
                  <label class="field-label text-xs font-semibold uppercase tracking-wide">Propriedades</label>
                  <button @click.stop="abrirAddModal('propriedade')" class="lookup-add-btn">+ Adicionar</button>
                  <button @click.stop="abrirGerenciarModal('propriedade')" class="lookup-edit-btn">✏ Gerenciar</button>
                </div>

                <div class="relative" @click.stop>
                  <button
                    @click.stop="toggleDropdown('propriedade')"
                    class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors text-left flex items-center justify-between"
                    :disabled="!form.categoria_equipamento_item"
                  >
                    <span :class="form.propriedade_equipamento_item.length === 0 ? 'placeholder-color' : ''">
                      {{ form.propriedade_equipamento_item.length === 0
                        ? (form.categoria_equipamento_item ? 'Selecionar propriedades...' : 'Selecione uma categoria primeiro')
                        : `${form.propriedade_equipamento_item.length} propriedade(s) selecionada(s)` }}
                    </span>
                    <span class="text-zinc-500 ml-2">˅</span>
                  </button>

                  <div v-if="dropdownAtivo === 'propriedade'" class="dropdown-panel absolute left-0 top-full mt-1 z-30 w-full rounded-xl border shadow-xl max-h-52 overflow-y-auto">
                    <label
                      v-for="p in propriedadesFiltradas"
                      :key="p.item"
                      class="dropdown-item flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors"
                      :class="form.propriedade_equipamento_item.includes(p.item) ? 'dropdown-item-active' : ''"
                      @click.stop
                    >
                      <input type="checkbox" :value="p.item" v-model="form.propriedade_equipamento_item" class="sr-only" />
                      <span class="flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[0.6rem]"
                        :class="form.propriedade_equipamento_item.includes(p.item) ? 'check-active' : 'check-inactive'">
                        {{ form.propriedade_equipamento_item.includes(p.item) ? '✓' : '' }}
                      </span>
                      {{ p.descricao }}
                    </label>
                    <div v-if="propriedadesFiltradas.length === 0" class="px-3 py-2 text-sm text-zinc-500 italic">
                      {{ form.categoria_equipamento_item ? 'Nenhuma propriedade para esta categoria.' : 'Selecione uma categoria primeiro.' }}
                    </div>
                  </div>
                </div>

                <div v-if="form.propriedade_equipamento_item.length > 0" class="mt-1.5 flex flex-wrap gap-1">
                  <span v-for="id in form.propriedade_equipamento_item" :key="id" class="lookup-tag">
                    {{ propriedadeNome(id) }}
                    <button @click.stop="removeDoForm('propriedade', id)" class="ml-1 opacity-60 hover:opacity-100">×</button>
                  </span>
                </div>
              </div>

              <!-- Peso -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Peso (kg)</label>
                <input v-model.number="form.peso" type="number" min="0" step="0.01" placeholder="Ex: 1.50" class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors" />
              </div>

              <!-- Valor -->
              <div>
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Valor (po)</label>
                <input v-model.number="form.valor" type="number" min="0" step="0.01" placeholder="Ex: 15.00" class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors" />
              </div>

              <!-- Pré-requisitos -->
              <div class="sm:col-span-2 lg:col-span-3">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Pré-requisitos</label>
                <input v-model="form.pre_requisitos" type="text" placeholder="Ex: Força 13, Proficiência em Armaduras Pesadas" class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors" />
              </div>

              <!-- Descrição -->
              <div class="sm:col-span-2 lg:col-span-3">
                <label class="field-label mb-1.5 block text-xs font-semibold uppercase tracking-wide">Descrição</label>
                <textarea v-model="form.descricao_equipamento" rows="2" placeholder="Descrição do equipamento..." class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors resize-none" />
              </div>
            </div>

            <p v-if="formFeedback" class="mt-3 text-sm" :class="formFeedbackError ? 'text-red-400' : 'text-emerald-400'">
              {{ formFeedback }}
            </p>

            <div class="mt-5 flex flex-wrap items-center gap-3">
              <button
                @click="salvar"
                :disabled="salvando || !form.nome.trim()"
                class="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 transition-all"
              >
                {{ salvando ? 'Salvando...' : (editandoId ? 'Salvar Alterações' : 'Criar Equipamento') }}
              </button>
              <button @click="fecharForm" class="btn-ghost rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors">Cancelar</button>
            </div>
          </div>
        </transition>

        <!-- Feedback global -->
        <p v-if="feedback && !mostrarForm" class="mb-4 text-sm" :class="feedbackError ? 'text-red-400' : 'text-emerald-400'">{{ feedback }}</p>

        <!-- ── Tabela de equipamentos ──────────────────────────────────────── -->
        <DataTable
          :colunas="colunasTabela"
          classe-grid="grid grid-cols-[1fr_auto_auto_auto_3rem] items-center gap-3 sm:grid-cols-[2fr_1fr_1fr_2fr_3rem]"
          :itens="armasFiltradas"
          :carregando="carregando"
          :mensagem-vazia="filtroNome || filtroCategoria ? 'Nenhum equipamento encontrado com esses filtros.' : 'Nenhum equipamento cadastrado ainda.'"
          @editar="iniciarEdicao"
          @deletar="confirmarDelete"
        >
          <template #linha="{ item }">
            <div class="min-w-0">
              <p class="weapon-name truncate text-sm font-semibold">{{ (item as ArmaApi).nome }}</p>
              <span v-if="(item as ArmaApi).categoria_equipamento_item" class="mt-0.5 inline-block text-[0.65rem] text-zinc-500 sm:hidden">
                {{ categoriaNome((item as ArmaApi).categoria_equipamento_item) }}
              </span>
            </div>

            <span class="hidden sm:block text-xs text-zinc-400">
              {{ (item as ArmaApi).categoria_equipamento_item ? categoriaNome((item as ArmaApi).categoria_equipamento_item) : '—' }}
            </span>

            <span class="dano-text font-mono text-sm font-bold">{{ (item as ArmaApi).dano || '—' }}</span>

            <div class="hidden sm:flex flex-wrap gap-1">
              <template v-if="(item as ArmaApi).tipo_equipamento_item.length > 0">
                <span v-for="id in (item as ArmaApi).tipo_equipamento_item" :key="`t${id}`" class="lookup-row-badge">{{ tipoNome(id) }}</span>
              </template>
              <template v-if="(item as ArmaApi).classe_equipamento_item.length > 0">
                <span v-for="id in (item as ArmaApi).classe_equipamento_item" :key="`c${id}`" class="classe-row-badge">{{ classeNome(id) }}</span>
              </template>
              <span v-if="(item as ArmaApi).tipo_equipamento_item.length === 0 && (item as ArmaApi).classe_equipamento_item.length === 0" class="text-xs text-muted">—</span>
            </div>
          </template>

          <template #vazia-cta>
            <button v-if="!filtroNome && !filtroCategoria" @click="abrirFormNova" class="mt-2 text-xs text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors">
              Cadastrar primeiro equipamento
            </button>
          </template>
        </DataTable>

        <p v-if="armas.length > 0" class="mt-3 text-xs text-muted">{{ armasFiltradas.length }} de {{ armas.length }} equipamento(s)</p>

      </main>
    </TemaDarkLight>

    <!-- ══ Modal: Confirmar delete ══════════════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="armaParaDeletar" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="armaParaDeletar = null">
        <div class="modal-overlay absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div class="modal-card relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl">
          <div class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
            <svg class="h-6 w-6 text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </div>
          <h3 class="modal-title mb-1 text-base font-bold">Deletar Equipamento</h3>
          <p class="modal-body mb-4 text-sm">Tem certeza que deseja deletar <strong>{{ armaParaDeletar.nome }}</strong>? Esta ação é irreversível.</p>
          <div class="flex gap-3">
            <button @click="executarDelete" :disabled="deletando" class="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50">
              {{ deletando ? 'Deletando...' : 'Sim, deletar' }}
            </button>
            <button @click="armaParaDeletar = null" class="btn-ghost flex-1 rounded-xl border py-2.5 text-sm font-medium">Cancelar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ Modal: Adicionar item de lookup ══════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="addModal.aberto" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="addModal.aberto = false">
        <div class="modal-overlay absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div class="modal-card relative w-full max-w-sm rounded-2xl border p-6 shadow-2xl">
          <h3 class="modal-title mb-4 text-base font-bold">{{ addModalTitulo }}</h3>

          <!-- Selecionar categoria (para tipo e propriedade) -->
          <div v-if="addModal.tipo !== 'categoria' && addModal.tipo !== 'classe'" class="mb-3">
            <label class="field-label mb-1 block text-xs uppercase tracking-wide">
              Categoria <span class="text-red-400">*</span>
            </label>
            <div class="select-wrap">
              <select v-model="addModal.categoriaItem" class="field-input w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none">
                <option :value="null">Selecionar categoria...</option>
                <option v-for="c in categorias" :key="c.item" :value="c.item">{{ (c.icone && !c.icone.startsWith('mdi-')) ? c.icone + ' ' + c.descricao : c.descricao }}</option>
              </select>
              <span class="select-caret">˅</span>
            </div>
          </div>

          <div class="mb-4">
            <label class="field-label mb-1 block text-xs uppercase tracking-wide">Descrição <span class="text-red-400">*</span></label>
            <input
              v-model="addModal.descricao"
              type="text"
              :placeholder="`Nome do(a) ${addModalTipoLabel}...`"
              class="field-input w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              @keydown.enter="salvarAddModal"
            />
          </div>

          <!-- Ícone (somente para categorias) -->
          <div v-if="addModal.tipo === 'categoria'" class="mb-4">
            <label class="field-label mb-2 block text-xs uppercase tracking-wide">
              Ícone <span class="font-normal normal-case text-zinc-500">(opcional)</span>
            </label>

            <IconeInput v-model="addModal.icone" placeholder="Emoji ⚔️ ou mdi-sword" />

            <p class="mt-1.5 mb-2 text-[0.62rem] text-zinc-500">
              Emoji direto (<span class="font-mono">⚔️</span>) ou comece com
              <span class="font-mono">mdi-</span> para autocompletar ícones MDI
            </p>

            <!-- Grade de sugestões baseadas na descrição -->
            <p class="mb-1 text-[0.65rem] uppercase tracking-wide text-zinc-500">
              {{ addModal.descricao.trim() ? 'Sugestões para "' + addModal.descricao + '"' : 'Sugestões rápidas' }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="icone in sugestoesIconeAddModal"
                :key="icone"
                type="button"
                @click.stop="addModal.icone = icone"
                class="icone-sugestao rounded-lg transition-all"
                :class="[addModal.icone === icone ? 'icone-sugestao-ativo' : '', icone.startsWith('mdi-') ? 'icone-sugestao-mdi' : 'icone-sugestao-emoji']"
                :title="icone"
              >
                <IconeDisplay :icone="icone" :size="icone.startsWith('mdi-') ? '1.15rem' : '1.25rem'" />
              </button>
            </div>
          </div>

          <p v-if="addModal.erro" class="mb-3 text-sm text-red-400">{{ addModal.erro }}</p>

          <div class="flex gap-3">
            <button @click="salvarAddModal" :disabled="addModal.salvando || !addModal.descricao.trim() || ((addModal.tipo === 'tipo' || addModal.tipo === 'propriedade') && !addModal.categoriaItem)" class="btn-primary flex-1 rounded-xl py-2.5 text-sm font-semibold disabled:opacity-40">
              {{ addModal.salvando ? 'Salvando...' : 'Salvar' }}
            </button>
            <button @click="addModal.aberto = false" class="btn-ghost flex-1 rounded-xl border py-2.5 text-sm font-medium">Cancelar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ══ Modal: Gerenciar itens de lookup ════════════════════════════════ -->
    <transition name="modal-fade">
      <div v-if="manageModal.aberto" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="manageModal.aberto = false">
        <div class="modal-overlay absolute inset-0 bg-black/70 backdrop-blur-sm" />
        <div class="modal-card relative w-full max-w-md rounded-2xl border p-6 shadow-2xl">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="modal-title text-base font-bold">{{ manageModalTitulo }}</h3>
            <button @click="manageModal.aberto = false" class="close-btn rounded-lg p-1.5">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div class="max-h-[50vh] overflow-y-auto space-y-1">
            <div v-if="manageModal.itens.length === 0" class="py-8 text-center text-sm text-zinc-500 italic">
              Nenhum item cadastrado.
            </div>

            <div
              v-for="item in manageModal.itens"
              :key="item.item"
              class="manage-row flex items-center gap-2 rounded-xl border px-3 py-2"
            >
              <!-- Modo leitura -->
              <template v-if="manageModal.editandoItem !== item.item">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate flex items-center gap-1.5">
                    <IconeDisplay v-if="item.icone" :icone="item.icone" size="1rem" class="shrink-0" />
                    {{ item.descricao }}
                  </p>
                  <p v-if="item.categoria_item" class="text-xs text-zinc-500 truncate">{{ categoriaNome(item.categoria_item) }}</p>
                </div>
                <button @click="iniciarEdicaoManage(item)" class="action-btn-edit rounded-lg p-1.5">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button @click="deletarLookupItem(item.item)" :disabled="manageModal.deletando === item.item" class="action-btn-del rounded-lg p-1.5">
                  <svg v-if="manageModal.deletando !== item.item" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  <div v-else class="h-3.5 w-3.5 animate-spin rounded-full border border-red-400 border-t-transparent" />
                </button>
              </template>

              <!-- Modo edição inline -->
              <template v-else>
                <div class="flex-1 flex flex-col gap-1.5 min-w-0">
                  <input
                    v-model="manageModal.novaDescricao"
                    class="field-input w-full rounded-lg border px-2 py-1.5 text-sm outline-none"
                    placeholder="Descrição"
                    @keydown.esc="manageModal.editandoItem = null"
                  />
                  <IconeInput
                    v-if="manageModal.tipo === 'categoria'"
                    v-model="manageModal.novoIcone"
                    placeholder="Emoji ⚔️ ou mdi-sword"
                  />
                </div>
                <button @click="salvarEdicaoManage(item.item)" :disabled="manageModal.salvando" class="btn-primary self-start rounded-lg px-2.5 py-1.5 text-xs font-semibold disabled:opacity-40">
                  {{ manageModal.salvando ? '...' : 'OK' }}
                </button>
                <button @click="manageModal.editandoItem = null" class="btn-ghost self-start rounded-lg border px-2.5 py-1.5 text-xs">✕</button>
              </template>
            </div>
          </div>

          <p v-if="manageModal.erro" class="mt-3 text-sm text-red-400">{{ manageModal.erro }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import DataTable from '@/components/DataTable.vue'
import IconeDisplay from '@/components/IconeDisplay.vue'
import IconeInput from '@/components/IconeInput.vue'
import {
  listarArmas,
  listarCategoriasEquipamento,
  listarClassesEquipamento,
  listarTiposEquipamento,
  listarPropriedadesEquipamento,
  criarArma,
  editarArma,
  deletarArma,
  criarCategoriaEquipamento,
  editarCategoriaEquipamento,
  deletarCategoriaEquipamento,
  criarClasseEquipamento,
  editarClasseEquipamento,
  deletarClasseEquipamento,
  criarTipoEquipamento,
  editarTipoEquipamento,
  deletarTipoEquipamento,
  criarPropriedadeEquipamento,
  editarPropriedadeEquipamento,
  deletarPropriedadeEquipamento,
  type ArmaApi,
  type CategoriaEquipamento,
  type ClasseEquipamento,
  type TipoEquipamento,
  type PropriedadeEquipamento,
} from '@/lib/api/armas.api'

// ── Definição de colunas da tabela ───────────────────────────────────────────

const colunasTabela = [
  { label: 'Nome' },
  { label: 'Categoria', classe: 'hidden sm:block' },
  { label: 'Dano' },
  { label: 'Tipos / Classes', classe: 'hidden sm:block' },
]

// ── Estado ───────────────────────────────────────────────────────────────────

const router    = useRouter()
const authStore = useAuthStore()

const armas       = ref<ArmaApi[]>([])
const categorias  = ref<CategoriaEquipamento[]>([])
const classes     = ref<ClasseEquipamento[]>([])
const tipos       = ref<TipoEquipamento[]>([])
const propriedades = ref<PropriedadeEquipamento[]>([])

const carregando = ref(false)
const salvando   = ref(false)
const deletando  = ref(false)
const feedback      = ref('')
const feedbackError = ref(false)

const filtroNome      = ref('')
const filtroCategoria = ref<number | null>(null)

const mostrarForm = ref(false)
const editandoId  = ref<string | null>(null)
const formFeedback      = ref('')
const formFeedbackError = ref(false)

const armaParaDeletar = ref<ArmaApi | null>(null)

const dropdownAtivo = ref<string | null>(null)

const form = reactive({
  nome: '',
  dano: '',
  peso: null as number | null,
  valor: null as number | null,
  categoria_equipamento_item: null as number | null,
  classe_equipamento_item: [] as number[],
  tipo_equipamento_item: [] as number[],
  propriedade_equipamento_item: [] as number[],
  descricao_equipamento: '',
  pre_requisitos: '',
})

// ── Modal: Adicionar ─────────────────────────────────────────────────────────

type LookupTipo = 'categoria' | 'classe' | 'tipo' | 'propriedade'

interface LookupItem {
  item: number
  descricao: string
  categoria_item?: number | null
  icone?: string | null
}

const addModal = reactive({
  aberto: false,
  tipo: 'categoria' as LookupTipo,
  descricao: '',
  categoriaItem: null as number | null,
  icone: '',
  salvando: false,
  erro: '',
})

// ── Icon picker: mapeamento keyword → ícones sugeridos ────────────────────────

const ICONE_MAPA = [
  { kw: ['arma', 'espada', 'sword', 'lamina', 'gume', 'blade'], em: ['⚔️', '🗡️', 'mdi-sword', 'mdi-sword-cross', 'mdi-axe'] },
  { kw: ['arco', 'bow', 'flecha', 'arrow', 'besta'], em: ['🏹', 'mdi-bow-arrow'] },
  { kw: ['armadura', 'armor', 'coura', 'placa', 'blindagem'], em: ['🛡️', '🪖', 'mdi-shield', 'mdi-shield-sword', 'mdi-shield-half-full'] },
  { kw: ['escudo', 'shield', 'defesa', 'bloqueio'], em: ['🛡️', 'mdi-shield', 'mdi-shield-outline'] },
  { kw: ['lanca', 'lança', 'spear', 'haste', 'polearm'], em: ['🔱', 'mdi-spear'] },
  { kw: ['cajado', 'staff', 'baculo', 'bordao', 'bordão', 'vara'], em: ['🪄', 'mdi-wizard-hat'] },
  { kw: ['magia', 'magic', 'feitico', 'spell', 'arcano'], em: ['🔮', '✨', 'mdi-magic-staff', 'mdi-star-four-points', 'mdi-auto-fix'] },
  { kw: ['pocao', 'poção', 'potion', 'alquimia', 'elixir'], em: ['🧪', '⚗️', 'mdi-flask', 'mdi-flask-outline', 'mdi-bottle-tonic'] },
  { kw: ['livro', 'tomo', 'grimorio', 'scroll', 'pergaminho', 'book'], em: ['📚', '📖', 'mdi-book-open', 'mdi-book-open-page-variant'] },
  { kw: ['joia', 'gem', 'pedra', 'rubi', 'diamante', 'cristal'], em: ['💎', 'mdi-diamond', 'mdi-diamond-stone', 'mdi-crystal-ball'] },
  { kw: ['anel', 'ring'], em: ['💍', 'mdi-ring'] },
  { kw: ['amuleto', 'amulet', 'colar', 'necklace', 'pingente'], em: ['📿', '⚜️', 'mdi-necklace'] },
  { kw: ['explosivo', 'bomb', 'bomba', 'granada', 'dinamite'], em: ['💣', '🧨', 'mdi-bomb'] },
  { kw: ['roupa', 'clothes', 'vestimenta', 'manto', 'capa', 'robe'], em: ['👘', '🧥', 'mdi-tshirt-crew', 'mdi-hanger'] },
  { kw: ['bota', 'boot', 'sapato', 'calcado', 'calçado'], em: ['👢', 'mdi-shoe-sneaker'] },
  { kw: ['luva', 'glove', 'manopla', 'gauntlet'], em: ['🧤', 'mdi-boxing-glove'] },
  { kw: ['capacete', 'helmet', 'elmo', 'chapeu', 'chapéu'], em: ['⛑️', '🪖', 'mdi-hard-hat', 'mdi-crown'] },
  { kw: ['ferramenta', 'tool', 'craft', 'artesanato', 'oficina'], em: ['🔧', '🛠️', 'mdi-hammer', 'mdi-wrench', 'mdi-tools'] },
  { kw: ['moeda', 'ouro', 'gold', 'tesouro', 'treasure', 'dinheiro'], em: ['🪙', '💰', 'mdi-cash-multiple', 'mdi-trophy'] },
  { kw: ['mochila', 'bag', 'bolsa', 'aventura', 'adventure'], em: ['🎒', '🧳', 'mdi-bag-personal'] },
  { kw: ['montaria', 'mount', 'cavalo', 'horse', 'veiculo'], em: ['🐴', 'mdi-horse', 'mdi-horse-variant'] },
  { kw: ['mapa', 'map', 'rota', 'bussola', 'bússola'], em: ['🗺️', '🧭', 'mdi-map', 'mdi-compass'] },
  { kw: ['escuro', 'sombra', 'dark', 'assassino', 'furtivo'], em: ['🥷', '🖤', 'mdi-ninja', 'mdi-eye-outline', 'mdi-knife'] },
  { kw: ['fogo', 'fire', 'chama', 'flame', 'incendio'], em: ['🔥', 'mdi-fire', 'mdi-flare'] },
  { kw: ['gelo', 'ice', 'frost', 'frio', 'congelado'], em: ['❄️', '🧊', 'mdi-snowflake'] },
  { kw: ['trovao', 'trovão', 'thunder', 'raio', 'lightning'], em: ['⚡', 'mdi-lightning-bolt', 'mdi-weather-lightning'] },
  { kw: ['veneno', 'poison', 'toxina', 'acido', 'ácido'], em: ['☠️', '🐍', 'mdi-skull-crossbones', 'mdi-skull'] },
  { kw: ['sagrado', 'holy', 'divino', 'divine', 'bencao', 'bênção'], em: ['✝️', '⭐', 'mdi-church', 'mdi-cross', 'mdi-star'] },
  { kw: ['musica', 'música', 'music', 'instrumento', 'bardo'], em: ['🎵', '🎶', 'mdi-music', 'mdi-guitar-electric', 'mdi-music-note'] },
  { kw: ['utilitario', 'utilitário', 'utilidade', 'util'], em: ['🔑', '🗝️', 'mdi-key', 'mdi-tools', 'mdi-cog'] },
  { kw: ['cura', 'heal', 'medico', 'saude', 'saúde'], em: ['💊', '🩹', 'mdi-flask-outline', 'mdi-bottle-tonic-plus'] },
  { kw: ['cosmetico', 'cosmético', 'beleza', 'decoracao'], em: ['✨', '💄', 'mdi-shimmer', 'mdi-star'] },
  { kw: ['exploracao', 'exploração', 'aventura', 'viagem'], em: ['🧭', '🗺️', 'mdi-compass', 'mdi-map', 'mdi-telescope'] },
]

const ICONES_PADRAO = ['⚔️', 'mdi-sword', '🛡️', 'mdi-shield', '🔮', 'mdi-flask', '📜', 'mdi-book-open', '💎', 'mdi-diamond', '🏹', 'mdi-fire']

function sugestaoIcones(descricao: string): string[] {
  const texto = descricao
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  const set = new Set<string>()
  for (const { kw, em } of ICONE_MAPA) {
    if (kw.some((k) => texto.includes(k))) em.forEach((e) => set.add(e))
  }
  return set.size > 0 ? [...set].slice(0, 12) : ICONES_PADRAO
}

const sugestoesIconeAddModal = computed(() =>
  addModal.tipo === 'categoria' ? sugestaoIcones(addModal.descricao) : []
)

const addModalTitulo = computed(() => {
  const map: Record<LookupTipo, string> = { categoria: 'Nova Categoria', classe: 'Nova Classe', tipo: 'Novo Tipo', propriedade: 'Nova Propriedade' }
  return map[addModal.tipo]
})

const addModalTipoLabel = computed(() => {
  const map: Record<LookupTipo, string> = { categoria: 'categoria', classe: 'classe', tipo: 'tipo', propriedade: 'propriedade' }
  return map[addModal.tipo]
})

// ── Modal: Gerenciar ─────────────────────────────────────────────────────────

const manageModal = reactive({
  aberto: false,
  tipo: 'categoria' as LookupTipo,
  itens: [] as LookupItem[],
  editandoItem: null as number | null,
  novaDescricao: '',
  novoIcone: '',
  salvando: false,
  deletando: null as number | null,
  erro: '',
})

const manageModalTitulo = computed(() => {
  const map: Record<LookupTipo, string> = { categoria: 'Gerenciar Categorias', classe: 'Gerenciar Classes', tipo: 'Gerenciar Tipos', propriedade: 'Gerenciar Propriedades' }
  return map[manageModal.tipo]
})

// ── Computed ─────────────────────────────────────────────────────────────────

const tiposFiltrados = computed(() =>
  form.categoria_equipamento_item
    ? tipos.value.filter((t) => t.categoria_item === form.categoria_equipamento_item)
    : []
)

const propriedadesFiltradas = computed(() =>
  form.categoria_equipamento_item
    ? propriedades.value.filter((p) => p.categoria_item === form.categoria_equipamento_item)
    : []
)

const armasFiltradas = computed(() => {
  const nome = filtroNome.value.trim().toLowerCase()
  const cat  = filtroCategoria.value
  return armas.value.filter((a) => {
    if (nome && !a.nome.toLowerCase().includes(nome)) return false
    if (cat !== null && a.categoria_equipamento_item !== cat) return false
    return true
  })
})

// ── Lookup: resolve nomes ─────────────────────────────────────────────────────

function categoriaNome(item: number | null): string {
  if (!item) return '—'
  return categorias.value.find((c) => c.item === item)?.descricao ?? String(item)
}

function categoriaLabel(item: number | null): string {
  if (!item) return 'Selecionar categoria...'
  const c = categorias.value.find((cl) => cl.item === item)
  if (!c) return String(item)
  if (c.icone?.startsWith('mdi-')) return c.descricao
  return c.icone ? `${c.icone} ${c.descricao}` : c.descricao
}

function categoriaIcone(item: number | null): string | null | undefined {
  if (!item) return null
  return categorias.value.find((cl) => cl.item === item)?.icone
}

function classeNome(item: number): string {
  return classes.value.find((c) => c.item === item)?.descricao ?? String(item)
}

function tipoNome(item: number): string {
  return tipos.value.find((t) => t.item === item)?.descricao ?? String(item)
}

function propriedadeNome(item: number): string {
  return propriedades.value.find((p) => p.item === item)?.descricao ?? String(item)
}

// ── Dropdown ──────────────────────────────────────────────────────────────────

function toggleDropdown(key: string) {
  dropdownAtivo.value = dropdownAtivo.value === key ? null : key
}

function fecharDropdowns() {
  dropdownAtivo.value = null
}

function selecionarCategoria(item: number | null) {
  form.categoria_equipamento_item = item
  form.tipo_equipamento_item = []
  form.propriedade_equipamento_item = []
  dropdownAtivo.value = null
}

function removeDoForm(tipo: 'tipo' | 'classe' | 'propriedade', item: number) {
  if (tipo === 'tipo') form.tipo_equipamento_item = form.tipo_equipamento_item.filter((i) => i !== item)
  else if (tipo === 'classe') form.classe_equipamento_item = form.classe_equipamento_item.filter((i) => i !== item)
  else form.propriedade_equipamento_item = form.propriedade_equipamento_item.filter((i) => i !== item)
}

// ── Form: CRUD de equipamento ─────────────────────────────────────────────────

function resetForm() {
  form.nome                         = ''
  form.dano                         = ''
  form.peso                         = null
  form.valor                        = null
  form.categoria_equipamento_item   = null
  form.classe_equipamento_item      = []
  form.tipo_equipamento_item        = []
  form.propriedade_equipamento_item = []
  form.descricao_equipamento        = ''
  form.pre_requisitos               = ''
  formFeedback.value      = ''
  formFeedbackError.value = false
  editandoId.value        = null
}

function abrirFormNova() {
  resetForm()
  mostrarForm.value = true
}

function fecharForm() {
  mostrarForm.value = false
  resetForm()
}

function iniciarEdicao(arma: ArmaApi) {
  editandoId.value                    = arma.id
  form.nome                           = arma.nome
  form.dano                           = arma.dano ?? ''
  form.peso                           = arma.peso
  form.valor                          = arma.valor
  form.categoria_equipamento_item     = arma.categoria_equipamento_item ?? null
  form.classe_equipamento_item        = [...(arma.classe_equipamento_item ?? [])]
  form.tipo_equipamento_item          = [...(arma.tipo_equipamento_item ?? [])]
  form.propriedade_equipamento_item   = [...(arma.propriedade_equipamento_item ?? [])]
  form.descricao_equipamento          = arma.descricao_equipamento ?? ''
  form.pre_requisitos                 = arma.pre_requisitos ?? ''
  formFeedback.value      = ''
  formFeedbackError.value = false
  mostrarForm.value       = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function confirmarDelete(arma: ArmaApi) {
  armaParaDeletar.value = arma
}

async function carregar() {
  carregando.value = true
  try {
    const [eqs, cats, cls, tips, props] = await Promise.all([
      listarArmas(),
      listarCategoriasEquipamento(),
      listarClassesEquipamento(),
      listarTiposEquipamento(),
      listarPropriedadesEquipamento(),
    ])
    armas.value        = eqs
    categorias.value   = cats
    classes.value      = cls
    tipos.value        = tips
    propriedades.value = props
  } catch {
    feedback.value      = 'Erro ao carregar dados.'
    feedbackError.value = true
  } finally {
    carregando.value = false
  }
}

async function salvar() {
  if (!form.nome.trim()) return
  salvando.value      = true
  formFeedback.value  = ''

  try {
    const payload = {
      nome:                         form.nome,
      dano:                         form.dano.trim() || undefined,
      peso:                         form.peso != null && !isNaN(form.peso) ? form.peso : null,
      valor:                        form.valor != null && !isNaN(form.valor) ? form.valor : null,
      categoria_equipamento_item:   form.categoria_equipamento_item,
      classe_equipamento_item:      form.classe_equipamento_item,
      tipo_equipamento_item:        form.tipo_equipamento_item,
      propriedade_equipamento_item: form.propriedade_equipamento_item,
      descricao_equipamento:        form.descricao_equipamento.trim() || null,
      pre_requisitos:               form.pre_requisitos.trim() || null,
    }

    if (editandoId.value) {
      const atualizada = await editarArma(editandoId.value, payload)
      const idx = armas.value.findIndex((a) => a.id === editandoId.value)
      if (idx !== -1) armas.value[idx] = atualizada
      formFeedback.value      = 'Equipamento atualizado com sucesso.'
      formFeedbackError.value = false
    } else {
      const nova = await criarArma(payload)
      armas.value.push(nova)
      armas.value.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      formFeedback.value      = 'Equipamento criado com sucesso.'
      formFeedbackError.value = false
      resetForm()
    }
  } catch (err: any) {
    formFeedback.value      = err?.response?.data?.message || 'Erro ao salvar equipamento.'
    formFeedbackError.value = true
  } finally {
    salvando.value = false
  }
}

async function executarDelete() {
  if (!armaParaDeletar.value) return
  deletando.value = true
  try {
    await deletarArma(armaParaDeletar.value.id)
    armas.value           = armas.value.filter((a) => a.id !== armaParaDeletar.value!.id)
    armaParaDeletar.value = null
    feedback.value        = 'Equipamento deletado com sucesso.'
    feedbackError.value   = false
  } catch (err: any) {
    feedback.value        = err?.response?.data?.message || 'Erro ao deletar equipamento.'
    feedbackError.value   = true
    armaParaDeletar.value = null
  } finally {
    deletando.value = false
  }
}

// ── Modal Adicionar ───────────────────────────────────────────────────────────

function abrirAddModal(tipo: LookupTipo) {
  addModal.tipo         = tipo
  addModal.descricao    = ''
  addModal.categoriaItem = form.categoria_equipamento_item
  addModal.icone        = ''
  addModal.salvando     = false
  addModal.erro         = ''
  addModal.aberto       = true
}

async function salvarAddModal() {
  if (!addModal.descricao.trim()) return
  if ((addModal.tipo === 'tipo' || addModal.tipo === 'propriedade') && !addModal.categoriaItem) return

  addModal.salvando = true
  addModal.erro     = ''

  try {
    if (addModal.tipo === 'categoria') {
      const nova = await criarCategoriaEquipamento({ descricao: addModal.descricao, icone: addModal.icone || null })
      categorias.value.push(nova)
    } else if (addModal.tipo === 'classe') {
      const nova = await criarClasseEquipamento({ descricao: addModal.descricao })
      classes.value.push(nova)
    } else if (addModal.tipo === 'tipo') {
      const novo = await criarTipoEquipamento({ descricao: addModal.descricao, categoria_item: addModal.categoriaItem! })
      tipos.value.push(novo)
    } else {
      const nova = await criarPropriedadeEquipamento({ descricao: addModal.descricao, categoria_item: addModal.categoriaItem! })
      propriedades.value.push(nova)
    }
    addModal.aberto = false
  } catch (err: any) {
    addModal.erro = err?.response?.data?.message || 'Erro ao salvar.'
  } finally {
    addModal.salvando = false
  }
}

// ── Modal Gerenciar ───────────────────────────────────────────────────────────

function abrirGerenciarModal(tipo: LookupTipo) {
  manageModal.tipo          = tipo
  manageModal.editandoItem  = null
  manageModal.novaDescricao = ''
  manageModal.salvando      = false
  manageModal.deletando     = null
  manageModal.erro          = ''

  const map: Record<LookupTipo, LookupItem[]> = {
    categoria:   categorias.value,
    classe:      classes.value,
    tipo:        tipos.value,
    propriedade: propriedades.value,
  }
  manageModal.itens  = [...map[tipo]]
  manageModal.aberto = true
}

function iniciarEdicaoManage(item: LookupItem) {
  manageModal.editandoItem  = item.item
  manageModal.novaDescricao = item.descricao
  manageModal.novoIcone     = item.icone ?? ''
  manageModal.erro          = ''
}

async function salvarEdicaoManage(itemId: number) {
  if (!manageModal.novaDescricao.trim()) return
  manageModal.salvando = true
  manageModal.erro     = ''

  try {
    const descricao = manageModal.novaDescricao.trim()

    if (manageModal.tipo === 'categoria') {
      const icone = manageModal.novoIcone.trim() || null
      await editarCategoriaEquipamento(itemId, { descricao, icone })
      const i = categorias.value.findIndex((c) => c.item === itemId)
      if (i !== -1) { categorias.value[i].descricao = descricao; categorias.value[i].icone = icone }
    } else if (manageModal.tipo === 'classe') {
      await editarClasseEquipamento(itemId, { descricao })
      const i = classes.value.findIndex((c) => c.item === itemId)
      if (i !== -1) classes.value[i].descricao = descricao
    } else if (manageModal.tipo === 'tipo') {
      await editarTipoEquipamento(itemId, { descricao })
      const i = tipos.value.findIndex((t) => t.item === itemId)
      if (i !== -1) tipos.value[i].descricao = descricao
    } else {
      await editarPropriedadeEquipamento(itemId, { descricao })
      const i = propriedades.value.findIndex((p) => p.item === itemId)
      if (i !== -1) propriedades.value[i].descricao = descricao
    }

    const mi = manageModal.itens.findIndex((i) => i.item === itemId)
    if (mi !== -1) {
      manageModal.itens[mi].descricao = descricao
      if (manageModal.tipo === 'categoria') manageModal.itens[mi].icone = manageModal.novoIcone.trim() || null
    }
    manageModal.editandoItem = null
  } catch (err: any) {
    manageModal.erro = err?.response?.data?.message || 'Erro ao salvar.'
  } finally {
    manageModal.salvando = false
  }
}

async function deletarLookupItem(itemId: number) {
  manageModal.deletando = itemId
  manageModal.erro      = ''

  try {
    if (manageModal.tipo === 'categoria') {
      await deletarCategoriaEquipamento(itemId)
      categorias.value = categorias.value.filter((c) => c.item !== itemId)
    } else if (manageModal.tipo === 'classe') {
      await deletarClasseEquipamento(itemId)
      classes.value = classes.value.filter((c) => c.item !== itemId)
    } else if (manageModal.tipo === 'tipo') {
      await deletarTipoEquipamento(itemId)
      tipos.value = tipos.value.filter((t) => t.item !== itemId)
    } else {
      await deletarPropriedadeEquipamento(itemId)
      propriedades.value = propriedades.value.filter((p) => p.item !== itemId)
    }

    manageModal.itens = manageModal.itens.filter((i) => i.item !== itemId)
  } catch (err: any) {
    manageModal.erro = err?.response?.data?.message || 'Erro ao deletar.'
  } finally {
    manageModal.deletando = null
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────────

function goMasterPanel() { router.push({ name: 'master-panel' }) }
async function logout() { await authStore.sair(); router.push({ name: 'login' }) }

onMounted(carregar)
onUnmounted(() => { /* cleanup */ })
</script>

<style scoped>
/* ── Page shell ──────────────────────────────────────────────────────────── */
.page-root     { background: #070C18; }
.page-header   { background: rgb(7 12 24 / 0.85); border-color: rgb(255 255 255 / 0.07); }
.back-btn      { border-color: rgb(255 255 255 / 0.12); background: rgb(255 255 255 / 0.04); color: #cbd5e1; }
.back-btn:hover { background: rgb(255 255 255 / 0.08); color: #fff; }

.page-kicker { color: #f87171; }
.page-title  { color: #fca5a5; font-family: 'Cinzel', serif; }
.page-sub    { color: #94a3b8; }

/* ── Campos ──────────────────────────────────────────────────────────────── */
.field-label { color: #64748b; }
.field-input {
  background: rgb(255 255 255 / 0.04);
  border-color: rgb(255 255 255 / 0.1);
  color: #e2e8f0;
}
.field-input::placeholder { color: #475569; }
.field-input:focus { border-color: rgb(248 113 113 / 0.5); background: rgb(255 255 255 / 0.06); }
.field-input:disabled { opacity: 0.5; cursor: not-allowed; }
.placeholder-color { color: #475569; }

.select-wrap    { position: relative; }
.select-caret   { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); color: #475569; pointer-events: none; }

select.field-input option {
  background: #0f172a;
  color: #e2e8f0;
}

/* ── Dropdowns ───────────────────────────────────────────────────────────── */
.dropdown-panel {
  background: #0f172a;
  border-color: rgb(255 255 255 / 0.1);
}
.dropdown-item { color: #cbd5e1; }
.dropdown-item:hover { background: rgb(255 255 255 / 0.05); }
.dropdown-item-active { background: rgb(220 38 38 / 0.12); color: #fca5a5; }

.check-active  { background: rgb(220 38 38 / 0.3); border-color: #f87171; color: #fca5a5; }
.check-inactive { background: transparent; border-color: rgb(255 255 255 / 0.2); color: transparent; }

/* ── Lookup buttons ──────────────────────────────────────────────────────── */
.lookup-add-btn {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(248 113 113 / 0.4);
  color: #fca5a5;
  background: rgb(220 38 38 / 0.1);
  transition: all 0.15s;
}
.lookup-add-btn:hover { background: rgb(220 38 38 / 0.2); }

.lookup-edit-btn {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 0.5rem;
  border: 1px solid rgb(255 255 255 / 0.12);
  color: #94a3b8;
  background: rgb(255 255 255 / 0.04);
  transition: all 0.15s;
}
.lookup-edit-btn:hover { background: rgb(255 255 255 / 0.08); color: #e2e8f0; }

/* ── Tags selecionadas ───────────────────────────────────────────────────── */
.lookup-tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: rgb(220 38 38 / 0.15);
  border: 1px solid rgb(220 38 38 / 0.35);
  color: #fca5a5;
}

/* ── Badges na tabela ────────────────────────────────────────────────────── */
.lookup-row-badge {
  display: inline-block;
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgb(96 165 250 / 0.12);
  color: #93c5fd;
  border: 1px solid rgb(96 165 250 / 0.25);
}
.classe-row-badge {
  display: inline-block;
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  border-radius: 9999px;
  background: rgb(220 38 38 / 0.12);
  color: #fca5a5;
  border: 1px solid rgb(220 38 38 / 0.25);
}

/* ── Botões ──────────────────────────────────────────────────────────────── */
.btn-primary { background: #dc2626; color: #fff; }
.btn-primary:hover:not(:disabled) { background: #b91c1c; }
.btn-ghost   { border-color: rgb(255 255 255 / 0.1); color: #94a3b8; }
.btn-ghost:hover { background: rgb(255 255 255 / 0.05); color: #e2e8f0; }

/* ── Formulário ──────────────────────────────────────────────────────────── */
.form-card   { background: rgb(255 255 255 / 0.03); border-color: rgb(248 113 113 / 0.2); }
.form-title  { color: #fca5a5; }
.close-btn   { color: #64748b; }
.close-btn:hover { background: rgb(255 255 255 / 0.07); color: #e2e8f0; }

/* ── Tabela ──────────────────────────────────────────────────────────────── */
.weapon-name { color: #e2e8f0; }
.dano-text   { color: #fca5a5; }
.text-muted  { color: #64748b; }

/* ── Botões de ação na tabela ────────────────────────────────────────────── */
.action-btn-edit { color: #64748b; }
.action-btn-edit:hover { background: rgb(255 255 255 / 0.07); color: #e2e8f0; }
.action-btn-del  { color: #64748b; }
.action-btn-del:hover:not(:disabled) { background: rgb(220 38 38 / 0.15); color: #fca5a5; }

/* ── Modal ───────────────────────────────────────────────────────────────── */
.modal-card  { background: #0f172a; border-color: rgb(255 255 255 / 0.1); }
.modal-title { color: #f1f5f9; }
.modal-body  { color: #94a3b8; }
.modal-body strong { color: #e2e8f0; }

/* ── Gerenciar modal ─────────────────────────────────────────────────────── */
.manage-row {
  border-color: rgb(255 255 255 / 0.07);
  background: rgb(255 255 255 / 0.02);
}
.manage-row:hover { background: rgb(255 255 255 / 0.04); }

/* ── Icon picker ─────────────────────────────────────────────────────────── */
.icone-sugestao {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 0.04);
  border: 1px solid rgb(255 255 255 / 0.08);
  line-height: 1;
  cursor: pointer;
}
.icone-sugestao-emoji { padding: 0.25rem 0.35rem; min-width: 2.2rem; height: 2.2rem; }
.icone-sugestao-mdi   { padding: 0.35rem 0.5rem;  min-width: 2.4rem; height: 2.4rem; color: #94a3b8; }
.icone-sugestao:hover { background: rgb(255 255 255 / 0.1); border-color: rgb(255 255 255 / 0.2); transform: scale(1.08); }
.icone-sugestao-mdi:hover { color: #e2e8f0; }
.icone-sugestao-ativo { background: rgb(220 38 38 / 0.2); border-color: rgb(220 38 38 / 0.55); }
.icone-sugestao-mdi.icone-sugestao-ativo { color: #fca5a5; }

/* ── Transições ──────────────────────────────────────────────────────────── */
.form-slide-enter-active, .form-slide-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.form-slide-enter-from, .form-slide-leave-to { opacity: 0; transform: translateY(-8px); }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-card, .modal-fade-leave-active .modal-card { transition: transform 0.18s ease; }
.modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card { transform: scale(0.95); }

/* ══ Light mode ═════════════════════════════════════════════════════════════ */
:global(html.theme-light) .page-root    { background: var(--bg-page); color: var(--text-main); }
:global(html.theme-light) .page-ambient { display: none; }
:global(html.theme-light) .page-header  { background: rgb(255 255 255 / 0.92); border-color: var(--border-soft); }
:global(html.theme-light) .back-btn     { border-color: var(--border-soft); background: var(--bg-soft); color: var(--text-muted); }
:global(html.theme-light) .back-btn:hover { background: var(--accent-soft); color: var(--text-main); }
:global(html.theme-light) .page-kicker  { color: #dc2626; }
:global(html.theme-light) .page-title   { color: #991b1b; }
:global(html.theme-light) .page-sub     { color: var(--text-muted); }

:global(html.theme-light) .field-label  { color: var(--text-muted); }
:global(html.theme-light) .field-input  { background: #fff; border-color: var(--border-soft); color: var(--text-main); }
:global(html.theme-light) .field-input:focus { border-color: #f87171; box-shadow: 0 0 0 3px rgb(248 113 113 / 0.15); }
:global(html.theme-light) .placeholder-color { color: #94a3b8; }

:global(html.theme-light) .dropdown-panel { background: #fff; border-color: var(--border-soft); }
:global(html.theme-light) .dropdown-item  { color: var(--text-main); }
:global(html.theme-light) .dropdown-item:hover { background: var(--bg-soft); }
:global(html.theme-light) .dropdown-item-active { background: rgb(220 38 38 / 0.08); color: #b91c1c; }
:global(html.theme-light) .check-active   { background: rgb(220 38 38 / 0.15); border-color: #dc2626; color: #b91c1c; }

:global(html.theme-light) .lookup-add-btn { border-color: rgb(220 38 38 / 0.4); color: #b91c1c; background: rgb(220 38 38 / 0.07); }
:global(html.theme-light) .lookup-edit-btn { border-color: var(--border-soft); color: var(--text-muted); background: var(--bg-soft); }

:global(html.theme-light) .lookup-tag { background: rgb(220 38 38 / 0.08); border-color: rgb(220 38 38 / 0.25); color: #b91c1c; }
:global(html.theme-light) .lookup-row-badge { background: rgb(59 130 246 / 0.08); color: #1d4ed8; border-color: rgb(59 130 246 / 0.2); }
:global(html.theme-light) .classe-row-badge { background: rgb(220 38 38 / 0.08); color: #b91c1c; border-color: rgb(220 38 38 / 0.2); }

:global(html.theme-light) .btn-primary  { background: #dc2626; }
:global(html.theme-light) .btn-primary:hover:not(:disabled) { background: #b91c1c; }
:global(html.theme-light) .btn-ghost    { border-color: var(--border-soft); color: var(--text-muted); }
:global(html.theme-light) .btn-ghost:hover { background: var(--bg-soft); color: var(--text-main); }

:global(html.theme-light) .form-card    { background: var(--bg-card); border-color: rgb(220 38 38 / 0.2); box-shadow: 0 2px 12px rgb(0 0 0 / 0.06); }
:global(html.theme-light) .form-title   { color: #991b1b; }

:global(html.theme-light) .weapon-name  { color: var(--text-main); }
:global(html.theme-light) .dano-text    { color: #dc2626; }
:global(html.theme-light) .text-muted   { color: var(--text-muted); }

:global(html.theme-light) .modal-card   { background: var(--bg-card); border-color: var(--border-soft); box-shadow: 0 20px 50px rgb(0 0 0 / 0.15); }
:global(html.theme-light) .modal-title  { color: var(--text-main); }
:global(html.theme-light) .modal-body   { color: var(--text-muted); }
:global(html.theme-light) .modal-body strong { color: var(--text-main); }
:global(html.theme-light) .manage-row   { border-color: var(--border-soft); background: var(--bg-soft); }
:global(html.theme-light) .manage-row:hover { background: var(--accent-soft); }

:global(html.theme-light) .icone-sugestao { background: var(--bg-soft); border-color: var(--border-soft); }
:global(html.theme-light) .icone-sugestao-mdi { color: #64748b; }
:global(html.theme-light) .icone-sugestao-mdi:hover { color: var(--text-main); background: var(--accent-soft); }
:global(html.theme-light) .icone-sugestao:hover { background: var(--accent-soft); border-color: #fca5a5; }
:global(html.theme-light) .icone-sugestao-ativo { background: rgb(220 38 38 / 0.1); border-color: rgb(220 38 38 / 0.45); }
:global(html.theme-light) .icone-sugestao-mdi.icone-sugestao-ativo { color: #b91c1c; }
</style>

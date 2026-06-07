<template>
  <div class="min-h-screen overflow-x-hidden bg-[#070C18] text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0C1829] via-[#0A0F1C] to-[#160B27]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgb(99_102_241/0.08),transparent)]" />

    <!-- Header -->
    <header class="sticky top-0 z-20 border-b border-white/[0.07] bg-[#070C18]/85 backdrop-blur-xl">
      <div class="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-white/20 hover:text-white"
          @click="router.push({ name: 'master-panel' })"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Painel
        </button>
        <div class="flex-1 text-center">
          <span class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">⚔ Progressão ⚔</span>
        </div>
        <div class="w-20" />
      </div>
    </header>

    <main class="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">

      <!-- Tabs (scrollável no mobile) -->
      <div class="mb-6 overflow-x-auto pb-1">
        <div class="flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1 w-max">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="whitespace-nowrap rounded-lg px-4 py-1.5 text-sm font-medium transition-colors"
            :class="abaAtiva === tab.id
              ? 'bg-indigo-600 text-white shadow'
              : 'text-zinc-400 hover:text-zinc-200'"
            @click="abaAtiva = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- ── Tab: Tabela XP de Classe ─────────────────────────────────────── -->
      <template v-if="abaAtiva === 'tabela'">
        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <VSelect
            v-model="filtroClasseId"
            :options="opcoesClasseComVazio"
            root-class="w-full sm:w-64"
            placeholder="Todas as classes"
          />
          <button
            type="button"
            class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            @click="abrirModalCriacao"
          >
            + Adicionar Entradas
          </button>
        </div>

        <DataTable
          :colunas="[
            { label: 'Classe' },
            { label: 'Nível', classe: 'hidden sm:block' },
            { label: 'XP Necessário' },
          ]"
          classe-grid="grid grid-cols-[2fr_4rem_2fr_3rem] items-center gap-3"
          :itens="progressaoFiltrada"
          :carregando="carregando"
          mensagem-vazia="Nenhuma entrada de progressão cadastrada."
          @editar="iniciarEdicao"
          @deletar="confirmarDelete"
        >
          <template #linha="{ item }">
            <p class="font-medium text-zinc-200 truncate">{{ (item as ProgressaoClasseApi).classe_nome ?? `Classe #${(item as ProgressaoClasseApi).classe_id}` }}</p>
            <span class="hidden sm:inline-flex items-center justify-center rounded-full bg-indigo-900/50 text-indigo-300 px-2 py-0.5 text-xs font-bold">
              Nv.{{ (item as ProgressaoClasseApi).nivel }}
            </span>
            <p class="text-sm text-zinc-300">{{ (item as ProgressaoClasseApi).xp_necessario.toLocaleString('pt-BR') }} XP</p>
          </template>
          <template #vazia-cta>
            <button type="button" class="mt-2 text-sm text-indigo-400 hover:text-indigo-300" @click="abrirModalCriacao">
              Criar primeira entrada
            </button>
          </template>
        </DataTable>
      </template>

      <!-- ── Tab: XP de Classe ─────────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'xp-classe'">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-6 max-w-lg space-y-5">
          <p class="text-sm text-zinc-400">Selecione o personagem e a classe para atribuir XP. O sistema aplica o nível automaticamente se o limiar for atingido.</p>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
            <VSelect v-model="xpCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Classe</label>
            <VSelect v-model="xpClassId" :options="opcoesClassePersonagem" placeholder="Selecione a classe..." />
            <p v-if="infoClasseAtual" class="mt-1 text-xs text-zinc-500">{{ infoClasseAtual }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP a Conceder</label>
            <input
              v-model.number="xpAmount"
              type="number"
              min="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
              placeholder="Ex: 100"
            />
          </div>

          <p v-if="erroXp" class="text-sm text-red-400">{{ erroXp }}</p>
          <p v-if="feedbackXp" class="text-sm text-emerald-400">{{ feedbackXp }}</p>

          <button
            type="button"
            :disabled="salvandoXp || !xpCharacterId || !xpClassId || !xpAmount || xpAmount < 1"
            class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            @click="concederXpClasse"
          >
            {{ salvandoXp ? 'Concedendo...' : 'Conceder XP de Classe' }}
          </button>
        </div>
      </template>

      <!-- ── Tab: XP de Personagem ─────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'xp-personagem'">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-start">

          <!-- Formulário de atribuição -->
          <div class="rounded-xl border border-white/10 bg-white/[0.03] p-6 max-w-lg w-full space-y-5">
            <p class="text-sm text-zinc-400">Atribui XP geral ao personagem. O nível sobe automaticamente conforme a tabela de progressão abaixo.</p>

            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
              <VSelect v-model="xpPCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
              <p v-if="infoXpPersonagem" class="mt-1 text-xs text-zinc-500">{{ infoXpPersonagem }}</p>
            </div>

            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP a Conceder</label>
              <input
                v-model.number="xpPAmount"
                type="number" min="1"
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                placeholder="Ex: 200"
              />
            </div>

            <p v-if="erroXpP" class="text-sm text-red-400">{{ erroXpP }}</p>
            <p v-if="feedbackXpP" class="text-sm text-emerald-400">{{ feedbackXpP }}</p>

            <button
              type="button"
              :disabled="salvandoXpP || !xpPCharacterId || !xpPAmount || xpPAmount < 1"
              class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              @click="concederXpPersonagem"
            >
              {{ salvandoXpP ? 'Concedendo...' : 'Conceder XP de Personagem' }}
            </button>
          </div>

          <!-- Tabela level_progression -->
          <div class="flex-1 min-w-0">
            <div class="mb-3 flex items-center justify-between">
              <span class="text-sm font-semibold text-zinc-300">Tabela de Níveis</span>
              <button
                type="button"
                class="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                @click="abrirModalLevelProgression"
              >
                + Adicionar
              </button>
            </div>

            <div v-if="carregandoLP" class="text-sm text-zinc-500">Carregando...</div>
            <div v-else-if="!levelProgression.length" class="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm text-zinc-600 text-center">
              Nenhuma entrada. Adicione níveis para habilitar o auto-levelup de personagem.
            </div>
            <div v-else class="rounded-xl border border-white/10 overflow-hidden">
              <table class="w-full text-sm">
                <thead class="bg-white/[0.03] border-b border-white/10">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível</th>
                    <th class="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">XP Necessário</th>
                    <th class="px-4 py-2.5 w-8" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="lp in levelProgressionOrdenada"
                    :key="lp.id"
                    class="border-t border-white/[0.05] hover:bg-white/[0.02]"
                  >
                    <td class="px-4 py-2.5">
                      <span class="inline-flex items-center justify-center rounded-full bg-indigo-900/50 text-indigo-300 px-2 py-0.5 text-xs font-bold">Nv.{{ lp.nivel }}</span>
                    </td>
                    <td class="px-4 py-2.5 text-right font-mono text-zinc-300">{{ lp.xp_necessario.toLocaleString('pt-BR') }}</td>
                    <td class="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        class="text-red-500/70 hover:text-red-400 transition-colors"
                        @click="confirmarDeleteLP(lp)"
                      >
                        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- ── Tab: Pts. de Classe ────────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'pts-classe'">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-6 max-w-lg space-y-5">
          <p class="text-sm text-zinc-400">Concede pontos de classe ao personagem. Cada ponto pode ser gasto para subir de nível em uma classe (custo: 1 ponto por nível).</p>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
            <VSelect v-model="ptcCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
            <p v-if="infoPtcPersonagem" class="mt-1 text-xs text-zinc-500">{{ infoPtcPersonagem }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Pontos a Conceder</label>
            <input
              v-model.number="ptcAmount"
              type="number" min="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
              placeholder="Ex: 5"
            />
          </div>

          <p v-if="erroPtc" class="text-sm text-red-400">{{ erroPtc }}</p>
          <p v-if="feedbackPtc" class="text-sm text-emerald-400">{{ feedbackPtc }}</p>

          <button
            type="button"
            :disabled="salvandoPtc || !ptcCharacterId || !ptcAmount || ptcAmount < 1"
            class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            @click="concederPontosClasse"
          >
            {{ salvandoPtc ? 'Concedendo...' : 'Conceder Pts. de Classe' }}
          </button>
        </div>
      </template>

      <!-- ── Tab: Pts. de Skill ─────────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'pts-skill'">
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-6 max-w-lg space-y-5">
          <p class="text-sm text-zinc-400">Concede pontos de skill a uma classe específica do personagem.</p>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
            <VSelect v-model="ptsCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Classe</label>
            <VSelect v-model="ptsClassId" :options="opcoesClassePersonagemPts" placeholder="Selecione a classe..." />
            <p v-if="infoClassePts" class="mt-1 text-xs text-zinc-500">{{ infoClassePts }}</p>
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Pontos a Conceder</label>
            <input
              v-model.number="ptsAmount"
              type="number" min="1"
              class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
              placeholder="Ex: 3"
            />
          </div>

          <p v-if="erroPts" class="text-sm text-red-400">{{ erroPts }}</p>
          <p v-if="feedbackPts" class="text-sm text-emerald-400">{{ feedbackPts }}</p>

          <button
            type="button"
            :disabled="salvandoPts || !ptsCharacterId || !ptsClassId || !ptsAmount || ptsAmount < 1"
            class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
            @click="concederPontosSkill"
          >
            {{ salvandoPts ? 'Concedendo...' : 'Conceder Pts. de Skill' }}
          </button>
        </div>
      </template>

      <!-- ── Tab: Pts. de Atributo ──────────────────────────────────────────── -->
      <template v-if="abaAtiva === 'pts-atributo'">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-start">

          <!-- Conceder pontos -->
          <div class="rounded-xl border border-white/10 bg-white/[0.03] p-6 max-w-lg w-full space-y-5">
            <p class="text-sm text-zinc-400">Concede pontos de atributo ao personagem. O player distribui esses pontos no próprio dashboard.</p>

            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
              <VSelect v-model="ptaCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
              <p v-if="infoPtaPersonagem" class="mt-1 text-xs text-zinc-500">{{ infoPtaPersonagem }}</p>
            </div>

            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Pontos a Conceder</label>
              <input
                v-model.number="ptaAmount"
                type="number" min="1"
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
                placeholder="Ex: 2"
              />
            </div>

            <p v-if="erroPta" class="text-sm text-red-400">{{ erroPta }}</p>
            <p v-if="feedbackPta" class="text-sm text-emerald-400">{{ feedbackPta }}</p>

            <button
              type="button"
              :disabled="salvandoPta || !ptaCharacterId || !ptaAmount || ptaAmount < 1"
              class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
              @click="concederPontosAtributo"
            >
              {{ salvandoPta ? 'Concedendo...' : 'Conceder Pts. de Atributo' }}
            </button>
          </div>

          <!-- Reset de atributos -->
          <div class="rounded-xl border border-red-900/30 bg-red-950/10 p-6 max-w-lg w-full space-y-5">
            <div>
              <p class="text-sm font-semibold text-red-300">Reset de Atributos</p>
              <p class="mt-1 text-xs text-zinc-400">Reverte os atributos do personagem para base + bônus do passado e zera os pontos distribuídos. Use com cautela.</p>
            </div>

            <div>
              <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Personagem</label>
              <VSelect v-model="resetCharacterId" :options="opcoesPersonagem" placeholder="Selecione um personagem..." />
            </div>

            <p v-if="erroReset" class="text-sm text-red-400">{{ erroReset }}</p>
            <p v-if="feedbackReset" class="text-sm text-emerald-400">{{ feedbackReset }}</p>

            <button
              type="button"
              :disabled="salvandoReset || !resetCharacterId"
              class="rounded-xl bg-red-700 px-5 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              @click="confirmarResetAtributos"
            >
              {{ salvandoReset ? 'Resetando...' : 'Resetar Atributos' }}
            </button>
          </div>
        </div>
      </template>

    </main>
  </div>

  <!-- ══ Modal CRIAÇÃO bulk (Tabela XP de Classe) ══ -->
  <Modal
    v-if="criacao.aberto"
    title="Adicionar Entradas"
    panel-class="max-w-xl"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="criacao.aberto = false"
  >
    <div class="space-y-5">
      <div>
        <div class="mb-2 flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-400">Classes</span>
          <div class="flex gap-3 text-xs">
            <button type="button" class="text-indigo-400 hover:text-indigo-300" @click="criacao.classeIds = classes.map(c => Number(c.id))">Selecionar tudo</button>
            <button type="button" class="text-zinc-500 hover:text-zinc-300" @click="criacao.classeIds = []">Limpar</button>
          </div>
        </div>
        <div class="max-h-36 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-2">
          <label
            v-for="c in classes"
            :key="Number(c.id)"
            class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-white/[0.04]"
          >
            <input type="checkbox" :value="Number(c.id)" v-model="criacao.classeIds" class="h-3.5 w-3.5 accent-indigo-500" />
            <span class="text-sm text-zinc-300">{{ c.name }}</span>
          </label>
          <p v-if="!classes.length" class="px-2 py-2 text-xs text-zinc-600">Nenhuma classe disponível.</p>
        </div>
        <p class="mt-1.5 text-xs text-zinc-600">{{ criacao.classeIds.length }} classe{{ criacao.classeIds.length !== 1 ? 's' : '' }} selecionada{{ criacao.classeIds.length !== 1 ? 's' : '' }}</p>
      </div>

      <div>
        <span class="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Modo de geração</span>
        <div class="flex gap-3">
          <label
            v-for="opt in [{ v: 'proporcional', l: 'Proporcional' }, { v: 'manual', l: 'Manual' }]"
            :key="opt.v"
            class="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors"
            :class="criacao.modo === opt.v
              ? 'border-indigo-500/60 bg-indigo-900/30 text-indigo-300'
              : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200'"
          >
            <input type="radio" :value="opt.v" v-model="criacao.modo" class="accent-indigo-500" />
            {{ opt.l }}
          </label>
        </div>
      </div>

      <template v-if="criacao.modo === 'proporcional'">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP base (nível {{ criacao.nivelInicial ?? '?' }})</label>
            <input v-model.number="criacao.xpBase" type="number" min="1" placeholder="Ex: 100" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Aumento por nível (%)</label>
            <input v-model.number="criacao.aumentoPct" type="number" min="0" max="999" placeholder="Ex: 30" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível inicial</label>
            <input v-model.number="criacao.nivelInicial" type="number" min="2" max="20" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível final</label>
            <input v-model.number="criacao.nivelFinal" type="number" min="2" max="20" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
          </div>
        </div>
        <div v-if="previewProporcional.length">
          <p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">Preview da progressão</p>
          <div class="max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table class="w-full text-xs">
              <thead class="sticky top-0 bg-[#0A0F1C]">
                <tr class="border-b border-white/10">
                  <th class="px-3 py-2 text-left font-semibold text-zinc-400">Nível</th>
                  <th class="px-3 py-2 text-right font-semibold text-zinc-400">XP necessário</th>
                  <th class="hidden px-3 py-2 text-right font-semibold text-zinc-400 sm:table-cell">Variação</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in previewProporcional" :key="row.nivel" class="border-t border-white/[0.05]">
                  <td class="px-3 py-1.5 font-medium text-zinc-300">{{ row.nivel }}</td>
                  <td class="px-3 py-1.5 text-right font-mono text-indigo-300">{{ row.xp.toLocaleString('pt-BR') }}</td>
                  <td class="hidden px-3 py-1.5 text-right text-zinc-500 sm:table-cell">{{ i === 0 ? 'base' : `+${criacao.aumentoPct}%` }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p v-else class="text-xs text-zinc-600">Defina XP base ≥ 1 e nível inicial ≤ nível final para ver o preview.</p>
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível</label>
            <input v-model.number="criacao.nivelManual" type="number" min="1" max="20" placeholder="1–20" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP necessário</label>
            <input v-model.number="criacao.xpManual" type="number" min="0" placeholder="Ex: 500" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
          </div>
        </div>
      </template>

      <p class="text-xs text-zinc-600">Entradas já existentes (mesmo par classe + nível) serão atualizadas.</p>
      <p v-if="erroCriacao" class="text-sm text-red-400">{{ erroCriacao }}</p>
      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="criacao.aberto = false">Cancelar</button>
        <button
          type="button"
          :disabled="salvando || totalEntradasCriacao === 0"
          class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
          @click="salvarCriacao"
        >
          {{ salvando ? 'Criando...' : totalEntradasCriacao > 0 ? `Criar ${totalEntradasCriacao} entrada${totalEntradasCriacao !== 1 ? 's' : ''}` : 'Criar entradas' }}
        </button>
      </div>
    </div>
  </Modal>

  <!-- ══ Modal EDIÇÃO de progressão de classe ══ -->
  <Modal
    v-if="edicao.aberto"
    title="Editar Entrada"
    panel-class="max-w-sm"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="edicao.aberto = false"
  >
    <form class="space-y-4" @submit.prevent="salvarEdicao">
      <p class="text-xs text-zinc-500">
        <span class="font-semibold text-zinc-300">{{ edicao.classeNome }}</span>
        · Nível <span class="font-semibold text-zinc-300">{{ edicao.nivel }}</span>
      </p>
      <div>
        <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP Necessário</label>
        <input
          v-model.number="edicao.xp_necessario"
          type="number" min="0"
          class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50"
          placeholder="Ex: 500"
        />
      </div>
      <p v-if="erroEdicao" class="text-sm text-red-400">{{ erroEdicao }}</p>
      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="edicao.aberto = false">Cancelar</button>
        <button type="submit" :disabled="salvando" class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </Modal>

  <!-- ══ Modal DELETE progressão de classe ══ -->
  <Modal
    v-if="deleteModal.aberto"
    panel-class="max-w-sm"
    body-class="space-y-4 p-6"
    tema="escuro"
    :close-on-backdrop="false"
    :show-close-button="false"
  >
    <h3 class="text-base font-bold text-white">Remover Entrada</h3>
    <p class="text-sm text-zinc-400">
      Remover progressão do <strong class="text-white">Nível {{ deleteModal.nivel }}</strong> da classe
      <strong class="text-white">{{ deleteModal.classeNome }}</strong>?
    </p>
    <div class="flex gap-3">
      <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="deleteModal.aberto = false">Cancelar</button>
      <button type="button" :disabled="salvando" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60" @click="executarDelete">
        {{ salvando ? 'Removendo...' : 'Remover' }}
      </button>
    </div>
  </Modal>

  <!-- ══ Modal adicionar level_progression ══ -->
  <Modal
    v-if="lpModal.aberto"
    title="Adicionar Nível"
    panel-class="max-w-sm"
    body-class="px-6 py-5"
    :close-on-backdrop="false"
    @close="lpModal.aberto = false"
  >
    <form class="space-y-4" @submit.prevent="salvarLP">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">Nível (1–20)</label>
          <input v-model.number="lpModal.nivel" type="number" min="1" max="20" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" placeholder="Ex: 5" />
        </div>
        <div>
          <label class="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-400">XP necessário</label>
          <input v-model.number="lpModal.xp_necessario" type="number" min="0" class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" placeholder="Ex: 1000" />
        </div>
      </div>
      <p class="text-xs text-zinc-600">Se o nível já existir, o valor será atualizado.</p>
      <p v-if="erroLP" class="text-sm text-red-400">{{ erroLP }}</p>
      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="lpModal.aberto = false">Cancelar</button>
        <button type="submit" :disabled="salvandoLP" class="flex-1 rounded-xl bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
          {{ salvandoLP ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </Modal>

  <!-- ══ Modal DELETE level_progression ══ -->
  <Modal
    v-if="deleteLpModal.aberto"
    panel-class="max-w-sm"
    body-class="space-y-4 p-6"
    tema="escuro"
    :close-on-backdrop="false"
    :show-close-button="false"
  >
    <h3 class="text-base font-bold text-white">Remover Nível</h3>
    <p class="text-sm text-zinc-400">Remover o nível <strong class="text-white">{{ deleteLpModal.nivel }}</strong> da tabela de progressão?</p>
    <div class="flex gap-3">
      <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="deleteLpModal.aberto = false">Cancelar</button>
      <button type="button" :disabled="salvandoLP" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60" @click="executarDeleteLP">
        {{ salvandoLP ? 'Removendo...' : 'Remover' }}
      </button>
    </div>
  </Modal>

  <!-- ══ Modal RESET atributos ══ -->
  <Modal
    v-if="resetModal.aberto"
    panel-class="max-w-sm"
    body-class="space-y-4 p-6"
    tema="escuro"
    :close-on-backdrop="false"
    :show-close-button="false"
  >
    <h3 class="text-base font-bold text-white">Resetar Atributos</h3>
    <p class="text-sm text-zinc-400">Isso reverte os atributos de <strong class="text-white">{{ resetModal.nome }}</strong> ao estado base + passado e zera os pontos não distribuídos. Não tem desfazer.</p>
    <div class="flex gap-3">
      <button type="button" class="flex-1 rounded-xl border border-white/10 py-2 text-sm text-zinc-400 hover:text-white" @click="resetModal.aberto = false">Cancelar</button>
      <button type="button" :disabled="salvandoReset" class="flex-1 rounded-xl bg-red-700 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60" @click="executarResetAtributos">
        {{ salvandoReset ? 'Resetando...' : 'Confirmar Reset' }}
      </button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from '@/components/DataTable.vue'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import {
  listarProgressaoClasse, editarProgressaoClasse, deletarProgressaoClasse, criarProgressaoClasseBulk,
  listarClassesAdmin,
  type ProgressaoClasseApi, type ClasseApi, type BulkProgressaoItem,
} from '@/lib/api/classes.api'
import {
  atribuirXpClasse,
  getCharacterById,
  adicionarPontosDeClasse,
  adicionarSkillPointsParaClasse,
  adicionarPontosAtributo,
  resetarPontosAtributo,
  atribuirXpPersonagem,
  listarLevelProgression,
  salvarLevelProgression,
  deletarLevelProgression,
} from '@/lib/api/personagens.api'
import { useCharactersStore } from '@/stores/characters'

const router = useRouter()

type TabId = 'tabela' | 'xp-classe' | 'xp-personagem' | 'pts-classe' | 'pts-skill' | 'pts-atributo'

const carregando  = ref(true)
const salvando    = ref(false)
const progressoes = ref<ProgressaoClasseApi[]>([])
const classes     = ref<ClasseApi[]>([])
const filtroClasseId = ref<number | string>('')
const abaAtiva    = ref<TabId>('tabela')

const tabs = [
  { id: 'tabela' as TabId,        label: 'Tabela de XP' },
  { id: 'xp-classe' as TabId,     label: 'XP de Classe' },
  { id: 'xp-personagem' as TabId, label: 'XP de Personagem' },
  { id: 'pts-classe' as TabId,    label: 'Pts. de Classe' },
  { id: 'pts-skill' as TabId,     label: 'Pts. de Skill' },
  { id: 'pts-atributo' as TabId,  label: 'Pts. de Atributo' },
]

const opcoesClasseComVazio = computed(() => [
  { value: '' as number | string, label: 'Todas as classes' },
  ...classes.value.map(c => ({ value: Number(c.id), label: String(c.name) })),
])

const progressaoFiltrada = computed(() => {
  if (!filtroClasseId.value) return progressoes.value
  return progressoes.value.filter(p => p.classe_id === Number(filtroClasseId.value))
})

const charactersStore = useCharactersStore()
const opcoesPersonagem = computed(() =>
  charactersStore.publicCharacters.map(c => ({ value: String(c.characterId), label: c.name }))
)

// ── Helpers reutilizáveis ──────────────────────────────────────────────────────
type ClasseData = { classId: string; name: string; level: number; xp: number; skillPoints?: number }

async function buscarClassesPersonagem(id: string): Promise<ClasseData[]> {
  const char = await getCharacterById(id, true)
  const list: any[] = Array.isArray((char as any).data?.classes) ? (char as any).data.classes : []
  return list.map((c: any) => ({
    classId: String(c.classId),
    name:    String(c.name ?? 'Classe'),
    level:   Number(c.level ?? 1),
    xp:      Number(c.xp ?? 0),
    skillPoints: Number(c.skillPoints ?? 0),
  }))
}

// ── Tab XP de Classe ──────────────────────────────────────────────────────────
const xpCharacterId   = ref('')
const xpClassId       = ref('')
const xpAmount        = ref<number>(100)
const salvandoXp      = ref(false)
const erroXp          = ref('')
const feedbackXp      = ref('')
const xpCharacterData = ref<ClasseData[]>([])

const opcoesClassePersonagem = computed(() =>
  xpCharacterData.value.map(c => ({ value: c.classId, label: `${c.name} (Nv.${c.level})` }))
)
const infoClasseAtual = computed(() => {
  if (!xpClassId.value) return ''
  const c = xpCharacterData.value.find(c => c.classId === xpClassId.value)
  return c ? `XP atual: ${c.xp} · Nível atual: ${c.level}` : ''
})

watch(xpCharacterId, async (id) => {
  xpClassId.value = ''
  xpCharacterData.value = []
  feedbackXp.value = ''
  erroXp.value = ''
  if (!id) return
  try { xpCharacterData.value = await buscarClassesPersonagem(id) } catch {}
})

async function concederXpClasse() {
  erroXp.value = ''
  feedbackXp.value = ''
  if (!xpCharacterId.value || !xpClassId.value || !xpAmount.value || xpAmount.value < 1) return
  salvandoXp.value = true
  try {
    const updated = await atribuirXpClasse(xpCharacterId.value, xpClassId.value, xpAmount.value)
    const list: any[] = Array.isArray((updated as any).data?.classes) ? (updated as any).data.classes : []
    xpCharacterData.value = list.map((c: any) => ({
      classId: String(c.classId), name: String(c.name ?? 'Classe'),
      level: Number(c.level ?? 1), xp: Number(c.xp ?? 0),
    }))
    const atualizada = xpCharacterData.value.find(c => c.classId === xpClassId.value)
    feedbackXp.value = atualizada
      ? `XP concedido. Nível atual: ${atualizada.level} · XP: ${atualizada.xp}`
      : 'XP concedido com sucesso.'
    xpAmount.value = 100
  } catch (err: any) {
    erroXp.value = err?.response?.data?.message ?? err.message ?? 'Erro ao conceder XP.'
  } finally {
    salvandoXp.value = false
  }
}

// ── Tab XP de Personagem ──────────────────────────────────────────────────────
const xpPCharacterId  = ref('')
const xpPAmount       = ref<number>(200)
const salvandoXpP     = ref(false)
const erroXpP         = ref('')
const feedbackXpP     = ref('')
const xpPCharData     = ref<{ level: number; xp: number } | null>(null)

const infoXpPersonagem = computed(() => {
  if (!xpPCharData.value) return ''
  return `Nível atual: ${xpPCharData.value.level} · XP atual: ${xpPCharData.value.xp}`
})

watch(xpPCharacterId, async (id) => {
  xpPCharData.value = null
  feedbackXpP.value = ''
  erroXpP.value = ''
  if (!id) return
  try {
    const char = await getCharacterById(id, true)
    xpPCharData.value = {
      level: Number((char as any).level ?? 1),
      xp: Number((char as any).data?.xp ?? 0),
    }
  } catch {}
})

async function concederXpPersonagem() {
  erroXpP.value = ''
  feedbackXpP.value = ''
  if (!xpPCharacterId.value || !xpPAmount.value || xpPAmount.value < 1) return
  salvandoXpP.value = true
  try {
    const updated = await atribuirXpPersonagem(xpPCharacterId.value, xpPAmount.value)
    xpPCharData.value = {
      level: Number((updated as any).level ?? 1),
      xp: Number((updated as any).data?.xp ?? 0),
    }
    feedbackXpP.value = `XP concedido. Nível: ${xpPCharData.value.level} · XP: ${xpPCharData.value.xp}`
    xpPAmount.value = 200
  } catch (err: any) {
    erroXpP.value = err?.response?.data?.message ?? err.message ?? 'Erro ao conceder XP.'
  } finally {
    salvandoXpP.value = false
  }
}

// level_progression CRUD
const levelProgression = ref<{ id: number; nivel: number; xp_necessario: number }[]>([])
const carregandoLP = ref(false)
const salvandoLP   = ref(false)
const erroLP       = ref('')
const lpModal      = ref({ aberto: false, nivel: null as number | null, xp_necessario: 0 })
const deleteLpModal = ref({ aberto: false, id: null as number | null, nivel: 0 })

const levelProgressionOrdenada = computed(() =>
  [...levelProgression.value].sort((a, b) => a.nivel - b.nivel)
)

function abrirModalLevelProgression() {
  lpModal.value = { aberto: true, nivel: null, xp_necessario: 0 }
  erroLP.value = ''
}

async function salvarLP() {
  erroLP.value = ''
  const { nivel, xp_necessario } = lpModal.value
  if (!nivel || nivel < 1 || nivel > 20) { erroLP.value = 'Nível deve ser entre 1 e 20.'; return }
  if (xp_necessario < 0) { erroLP.value = 'XP não pode ser negativo.'; return }
  salvandoLP.value = true
  try {
    const result = await salvarLevelProgression([{ nivel, xp_necessario }])
    const item = result[0]
    const idx = levelProgression.value.findIndex(lp => lp.nivel === item.nivel)
    if (idx !== -1) levelProgression.value[idx] = item
    else levelProgression.value.push(item)
    lpModal.value.aberto = false
  } catch (err: any) {
    erroLP.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvandoLP.value = false
  }
}

function confirmarDeleteLP(lp: { id: number; nivel: number }) {
  deleteLpModal.value = { aberto: true, id: lp.id, nivel: lp.nivel }
}

async function executarDeleteLP() {
  if (!deleteLpModal.value.id) return
  salvandoLP.value = true
  try {
    await deletarLevelProgression(deleteLpModal.value.id)
    levelProgression.value = levelProgression.value.filter(lp => lp.id !== deleteLpModal.value.id)
    deleteLpModal.value.aberto = false
  } catch {} finally {
    salvandoLP.value = false
  }
}

// ── Tab Pts. de Classe ────────────────────────────────────────────────────────
const ptcCharacterId = ref('')
const ptcAmount      = ref<number>(1)
const salvandoPtc    = ref(false)
const erroPtc        = ref('')
const feedbackPtc    = ref('')
const ptcCharData    = ref<{ classPoints: number } | null>(null)

const infoPtcPersonagem = computed(() => {
  if (!ptcCharData.value) return ''
  return `Pts. de classe disponíveis: ${ptcCharData.value.classPoints}`
})

watch(ptcCharacterId, async (id) => {
  ptcCharData.value = null
  feedbackPtc.value = ''
  erroPtc.value = ''
  if (!id) return
  try {
    const char = await getCharacterById(id, true)
    ptcCharData.value = { classPoints: Number((char as any).data?.classPoints ?? 0) }
  } catch {}
})

async function concederPontosClasse() {
  erroPtc.value = ''
  feedbackPtc.value = ''
  if (!ptcCharacterId.value || !ptcAmount.value || ptcAmount.value < 1) return
  salvandoPtc.value = true
  try {
    const updated = await adicionarPontosDeClasse(ptcCharacterId.value, ptcAmount.value)
    const pts = Number((updated as any).data?.classPoints ?? 0)
    ptcCharData.value = { classPoints: pts }
    feedbackPtc.value = `Pontos concedidos. Total disponível: ${pts}`
    ptcAmount.value = 1
  } catch (err: any) {
    erroPtc.value = err?.response?.data?.message ?? err.message ?? 'Erro ao conceder pontos.'
  } finally {
    salvandoPtc.value = false
  }
}

// ── Tab Pts. de Skill ─────────────────────────────────────────────────────────
const ptsCharacterId    = ref('')
const ptsClassId        = ref('')
const ptsAmount         = ref<number>(1)
const salvandoPts       = ref(false)
const erroPts           = ref('')
const feedbackPts       = ref('')
const ptsCharData       = ref<ClasseData[]>([])

const opcoesClassePersonagemPts = computed(() =>
  ptsCharData.value.map(c => ({ value: c.classId, label: `${c.name} (Nv.${c.level})` }))
)
const infoClassePts = computed(() => {
  if (!ptsClassId.value) return ''
  const c = ptsCharData.value.find(c => c.classId === ptsClassId.value)
  return c ? `Skill points disponíveis: ${c.skillPoints ?? 0}` : ''
})

watch(ptsCharacterId, async (id) => {
  ptsClassId.value = ''
  ptsCharData.value = []
  feedbackPts.value = ''
  erroPts.value = ''
  if (!id) return
  try { ptsCharData.value = await buscarClassesPersonagem(id) } catch {}
})

async function concederPontosSkill() {
  erroPts.value = ''
  feedbackPts.value = ''
  if (!ptsCharacterId.value || !ptsClassId.value || !ptsAmount.value || ptsAmount.value < 1) return
  salvandoPts.value = true
  try {
    const updated = await adicionarSkillPointsParaClasse(ptsCharacterId.value, ptsClassId.value, ptsAmount.value)
    const list: any[] = Array.isArray((updated as any).data?.classes) ? (updated as any).data.classes : []
    ptsCharData.value = list.map((c: any) => ({
      classId: String(c.classId), name: String(c.name ?? 'Classe'),
      level: Number(c.level ?? 1), xp: Number(c.xp ?? 0),
      skillPoints: Number(c.skillPoints ?? 0),
    }))
    const atualizada = ptsCharData.value.find(c => c.classId === ptsClassId.value)
    feedbackPts.value = atualizada
      ? `Pontos concedidos. Skill points da classe: ${atualizada.skillPoints}`
      : 'Pontos concedidos com sucesso.'
    ptsAmount.value = 1
  } catch (err: any) {
    erroPts.value = err?.response?.data?.message ?? err.message ?? 'Erro ao conceder pontos.'
  } finally {
    salvandoPts.value = false
  }
}

// ── Tab Pts. de Atributo ──────────────────────────────────────────────────────
const ptaCharacterId = ref('')
const ptaAmount      = ref<number>(1)
const salvandoPta    = ref(false)
const erroPta        = ref('')
const feedbackPta    = ref('')
const ptaCharData    = ref<{ pontosAtributo: number } | null>(null)

const infoPtaPersonagem = computed(() => {
  if (!ptaCharData.value) return ''
  return `Pts. de atributo disponíveis: ${ptaCharData.value.pontosAtributo}`
})

watch(ptaCharacterId, async (id) => {
  ptaCharData.value = null
  feedbackPta.value = ''
  erroPta.value = ''
  if (!id) return
  try {
    const char = await getCharacterById(id, true)
    ptaCharData.value = { pontosAtributo: Number((char as any).data?.pontosAtributo ?? 0) }
  } catch {}
})

async function concederPontosAtributo() {
  erroPta.value = ''
  feedbackPta.value = ''
  if (!ptaCharacterId.value || !ptaAmount.value || ptaAmount.value < 1) return
  salvandoPta.value = true
  try {
    const updated = await adicionarPontosAtributo(ptaCharacterId.value, ptaAmount.value)
    const pts = Number((updated as any).data?.pontosAtributo ?? 0)
    ptaCharData.value = { pontosAtributo: pts }
    feedbackPta.value = `Pontos concedidos. Total disponível: ${pts}`
    ptaAmount.value = 1
  } catch (err: any) {
    erroPta.value = err?.response?.data?.message ?? err.message ?? 'Erro ao conceder pontos.'
  } finally {
    salvandoPta.value = false
  }
}

// Reset
const resetCharacterId = ref('')
const salvandoReset    = ref(false)
const erroReset        = ref('')
const feedbackReset    = ref('')
const resetModal       = ref({ aberto: false, nome: '' })

function confirmarResetAtributos() {
  if (!resetCharacterId.value) return
  const char = charactersStore.publicCharacters.find(c => String(c.characterId) === resetCharacterId.value)
  resetModal.value = { aberto: true, nome: char?.name ?? 'este personagem' }
}

async function executarResetAtributos() {
  erroReset.value = ''
  feedbackReset.value = ''
  salvandoReset.value = true
  try {
    await resetarPontosAtributo(resetCharacterId.value)
    feedbackReset.value = 'Atributos resetados com sucesso.'
    ptaCharData.value = null
    resetModal.value.aberto = false
  } catch (err: any) {
    erroReset.value = err?.response?.data?.message ?? err.message ?? 'Erro ao resetar.'
    resetModal.value.aberto = false
  } finally {
    salvandoReset.value = false
  }
}

// ── Modal bulk de criação (Tabela XP) ─────────────────────────────────────────
const criacao = ref({
  aberto: false, classeIds: [] as number[], modo: 'proporcional' as 'proporcional' | 'manual',
  xpBase: 100, aumentoPct: 30, nivelInicial: 2, nivelFinal: 20, nivelManual: null as number | null, xpManual: 0,
})
const erroCriacao = ref('')

function abrirModalCriacao() {
  criacao.value = { aberto: true, classeIds: [], modo: 'proporcional', xpBase: 100, aumentoPct: 30, nivelInicial: 2, nivelFinal: 20, nivelManual: null, xpManual: 0 }
  erroCriacao.value = ''
}

const previewProporcional = computed(() => {
  const { xpBase, aumentoPct, nivelInicial, nivelFinal } = criacao.value
  if (!xpBase || xpBase < 1 || !nivelInicial || !nivelFinal || nivelInicial > nivelFinal) return []
  const result: { nivel: number; xp: number }[] = []
  let xp = xpBase
  for (let nivel = nivelInicial; nivel <= nivelFinal; nivel++) {
    result.push({ nivel, xp: Math.round(xp) })
    xp = xp * (1 + (aumentoPct ?? 0) / 100)
  }
  return result
})

const totalEntradasCriacao = computed(() => {
  const n = criacao.value.classeIds.length
  if (!n) return 0
  if (criacao.value.modo === 'manual') {
    const nv = criacao.value.nivelManual
    return nv && nv >= 1 && nv <= 20 ? n : 0
  }
  return n * previewProporcional.value.length
})

async function salvarCriacao() {
  erroCriacao.value = ''
  const { classeIds, modo, nivelManual, xpManual } = criacao.value
  if (!classeIds.length) { erroCriacao.value = 'Selecione ao menos uma classe.'; return }
  const entradas: BulkProgressaoItem[] = []
  if (modo === 'proporcional') {
    if (!previewProporcional.value.length) { erroCriacao.value = 'Configure o XP base e o intervalo de níveis.'; return }
    for (const classeId of classeIds) {
      for (const { nivel, xp } of previewProporcional.value) {
        entradas.push({ classe_id: classeId, nivel, xp_necessario: xp })
      }
    }
  } else {
    if (!nivelManual || nivelManual < 1 || nivelManual > 20) { erroCriacao.value = 'Nível inválido (1–20).'; return }
    if (xpManual < 0) { erroCriacao.value = 'XP não pode ser negativo.'; return }
    for (const classeId of classeIds) entradas.push({ classe_id: classeId, nivel: nivelManual, xp_necessario: xpManual })
  }
  salvando.value = true
  try {
    const created = await criarProgressaoClasseBulk(entradas)
    for (const item of created) {
      const idx = progressoes.value.findIndex(p => p.classe_id === item.classe_id && p.nivel === item.nivel)
      if (idx !== -1) progressoes.value[idx] = item
      else progressoes.value.push(item)
    }
    progressoes.value.sort((a, b) => (a.classe_nome ?? '').localeCompare(b.classe_nome ?? '') || a.nivel - b.nivel)
    criacao.value.aberto = false
  } catch (err: any) {
    erroCriacao.value = err?.response?.data?.message ?? err.message ?? 'Erro ao criar entradas.'
  } finally {
    salvando.value = false
  }
}

// ── Modal Edição de progressão de classe ─────────────────────────────────────
const edicao = ref({ aberto: false, id: null as number | null, classeNome: '', nivel: 0, xp_necessario: 0 })
const erroEdicao = ref('')

function iniciarEdicao(item: ProgressaoClasseApi) {
  edicao.value = { aberto: true, id: item.id, classeNome: item.classe_nome ?? `Classe #${item.classe_id}`, nivel: item.nivel, xp_necessario: item.xp_necessario }
  erroEdicao.value = ''
}

async function salvarEdicao() {
  erroEdicao.value = ''
  if (!edicao.value.id) return
  if (edicao.value.xp_necessario < 0) { erroEdicao.value = 'XP não pode ser negativo.'; return }
  salvando.value = true
  try {
    const updated = await editarProgressaoClasse(edicao.value.id, { xp_necessario: edicao.value.xp_necessario })
    const idx = progressoes.value.findIndex(p => p.id === edicao.value.id!)
    if (idx !== -1) progressoes.value[idx] = { ...progressoes.value[idx], ...updated }
    edicao.value.aberto = false
  } catch (err: any) {
    erroEdicao.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar.'
  } finally {
    salvando.value = false
  }
}

// ── Modal Delete de progressão de classe ─────────────────────────────────────
const deleteModal = ref({ aberto: false, id: null as number | null, classeNome: '', nivel: 0 })

function confirmarDelete(item: ProgressaoClasseApi) {
  deleteModal.value = { aberto: true, id: item.id, classeNome: item.classe_nome ?? `Classe #${item.classe_id}`, nivel: item.nivel }
}

async function executarDelete() {
  if (!deleteModal.value.id) return
  salvando.value = true
  try {
    await deletarProgressaoClasse(deleteModal.value.id)
    progressoes.value = progressoes.value.filter(p => p.id !== deleteModal.value.id)
    deleteModal.value.aberto = false
  } catch {
    deleteModal.value.aberto = false
  } finally {
    salvando.value = false
  }
}

// ── Carregar ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  carregandoLP.value = true
  try {
    const [progressData, classesData, lpData] = await Promise.all([
      listarProgressaoClasse(),
      listarClassesAdmin(),
      listarLevelProgression(),
      charactersStore.fetchPaginaInicial().catch(() => {}),
    ])
    progressoes.value      = progressData
    classes.value          = classesData
    levelProgression.value = lpData
  } finally {
    carregando.value  = false
    carregandoLP.value = false
  }
})
</script>

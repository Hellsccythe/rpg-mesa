<template>
  <div class="min-h-screen bg-[#0A0F1C] text-white relative overflow-x-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <div class="relative z-10 min-h-screen flex flex-col">
      <!-- Header -->
      <header class="classes-header sticky top-0 z-20 h-16 border-b flex items-center justify-between px-4 sm:px-6">
        <HamburgerDrawerMenu
          :items="navItems"
          active-item-id="classes"
          aria-label="Abrir menu de navegacao"
          @select="handleNavSelect"
        />
        <h1 class="classes-title text-xl font-bold tracking-widest">Classes</h1>
        <div class="relative" @click.stop>
          <button
            @click="showSettingsMenu = !showSettingsMenu"
            class="text-zinc-400 hover:text-white transition-colors text-xl"
            aria-label="Abrir menu"
          >⚙️</button>
          <div
            v-if="showSettingsMenu"
            class="absolute right-0 mt-2 w-44 rounded-2xl border border-[#6B4E9E]/50 bg-[#0F1C3A]/95 p-2 shadow-xl backdrop-blur-md z-50"
          >
            <button
              @click="irParaPersonagem"
              class="block w-full rounded-xl px-4 py-2 text-left text-sm text-zinc-200 hover:bg-[#2A1B4A] transition-colors"
            >
              Personagem
            </button>
            <button
              @click="logout"
              class="block w-full rounded-xl px-4 py-2 text-left text-sm text-red-300 hover:bg-red-950/60 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 sm:px-6 py-8 max-w-7xl mx-auto w-full">

        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center h-64 text-zinc-400 text-lg animate-pulse">
          Carregando classes...
        </div>

        <!-- Error -->
        <div v-else-if="error" class="flex items-center justify-center h-64">
          <div class="text-center bg-black/40 border border-red-900/50 rounded-3xl p-8 max-w-md">
            <p class="text-red-300 text-lg">{{ error }}</p>
            <button @click="init" class="mt-4 px-6 py-2 bg-[#6B4E9E] rounded-2xl hover:brightness-110">
              Tentar novamente
            </button>
          </div>
        </div>

        <template v-else>
          <!-- Pontos de Classe -->
          <div class="mb-8 flex items-center gap-4 rounded-3xl border class-points-panel px-6 py-4">
            <div class="text-3xl font-black points-value">{{ classPoints }}</div>
            <div>
              <p class="font-semibold text-sm">Pontos de Classe disponíveis</p>
              <p class="text-xs text-zinc-500">Cada ponto permite escolher ou evoluir uma classe</p>
            </div>
          </div>

          <!-- Classes do personagem -->
          <section v-if="character" class="mb-10">
            <h2 class="section-title text-2xl font-bold mb-4">Suas Classes</h2>

            <div v-if="personagemClasses.length === 0" class="classes-empty-panel rounded-3xl border p-6 text-center text-zinc-400">
              Você ainda não possui nenhuma classe. Escolha uma abaixo.
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div
                v-for="pc in personagemClasses"
                :key="pc.classId"
                class="character-class-card rounded-3xl border p-5"
              >
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <span class="tier-badge text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="tierBadgeClass(pc.tier)">
                      {{ pc.tier }}
                    </span>
                    <h3 class="text-lg font-bold text-white mt-1">{{ pc.name }}</h3>
                  </div>
                  <div class="text-center ml-3 shrink-0">
                    <div class="text-2xl font-black text-amber-400 leading-none">{{ pc.level }}</div>
                    <div class="text-xs text-zinc-500">/20</div>
                    <div class="text-xs text-zinc-600 mt-0.5">Nível</div>
                  </div>
                </div>

                <!-- Barra de progressão de nível -->
                <div v-if="levelProgression.length" class="mb-3">
                  <div class="flex justify-between text-xs text-zinc-500 mb-1">
                    <span>XP: {{ xpAtualFormatado }}</span>
                    <span>Próximo: {{ xpProximoNivel(pc.level) }}</span>
                  </div>
                  <div class="h-1.5 rounded-full bg-zinc-700/60 overflow-hidden">
                    <div class="h-full rounded-full bg-amber-500 transition-all" :style="{ width: `${xpPercent(pc.level)}%` }" />
                  </div>
                </div>

                <!-- Upar nível -->
                <button
                  v-if="(pc.level ?? 1) < 20 && classPoints > 0"
                  @click="abrirModalLevar(pc)"
                  class="w-full py-2 rounded-2xl border border-emerald-500/40 text-emerald-300 text-sm hover:bg-emerald-900/20 transition-colors mb-3"
                >
                  ↑ Upar nível (1 ponto)
                </button>
                <div v-else-if="(pc.level ?? 1) < 20 && classPoints === 0" class="text-xs text-zinc-600 italic mb-3">
                  Sem pontos para upar
                </div>
                <div v-else-if="(pc.level ?? 1) >= 20" class="text-xs text-amber-400/70 italic mb-3">
                  Nível máximo atingido
                </div>

                <!-- Skills escolhidas -->
                <div class="mt-1">
                  <p class="text-xs text-zinc-500 mb-1.5">Skills ativas</p>
                  <div v-if="pc.chosenSkills?.length" class="flex flex-wrap gap-1.5">
                    <span
                      v-for="s in pc.chosenSkills"
                      :key="s"
                      class="text-xs bg-[#1A2438] border border-[#6B4E9E]/40 rounded-full px-2.5 py-0.5 text-zinc-300"
                    >
                      {{ s }}
                    </span>
                  </div>
                  <p v-else class="text-xs text-zinc-600 italic">Nenhuma skill escolhida</p>
                </div>

                <!-- Botão escolher skill -->
                <button
                  v-if="podeEscolherSkill(pc)"
                  @click="abrirModalSkill(pc)"
                  class="mt-4 w-full py-2 rounded-2xl border border-amber-500/40 text-amber-300 text-sm hover:bg-amber-900/20 transition-colors"
                >
                  + Escolher nova skill
                </button>
              </div>
            </div>
          </section>

          <!-- Separador -->
          <div class="classes-divider my-6 border-t" />

          <!-- Classes disponíveis por tier -->
          <div v-for="(grupo, tier) in classesPorTier" :key="tier" class="mb-10">
            <h2 class="section-title text-2xl font-bold mb-1">
              {{ tierLabel(tier) }}
            </h2>
            <p class="text-zinc-500 text-sm mb-5">{{ tierDescricao(tier) }}</p>

            <!-- Aviso de elegibilidade (apenas Base) -->
            <div v-if="!elegivel(tier) && msgElegibilidade(tier)" class="mb-4 flex items-center gap-3 bg-amber-950/30 border border-amber-800/40 rounded-2xl px-4 py-3 text-sm text-amber-300">
              <span>⚠️</span>
              <span>{{ msgElegibilidade(tier) }}</span>
            </div>
            <!-- Aviso de pontos insuficientes -->
            <div v-if="elegivel(tier) && classPoints === 0" class="mb-4 flex items-center gap-3 bg-zinc-900/50 border border-zinc-700/40 rounded-2xl px-4 py-3 text-sm text-zinc-400">
              <span>🔒</span>
              <span>Sem pontos de classe disponíveis. Peça ao mestre para adicionar pontos.</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <button
                v-for="cls in grupo"
                :key="cls.id"
                @click="!jaTemClasse(cls.id) && (elegivel(tier) || isHibrida(tier)) ? abrirModalClasse(cls) : null"
                :disabled="jaTemClasse(cls.id) || (!elegivel(tier) && !isHibrida(tier))"
                :class="[
                  'class-card group text-left rounded-3xl border p-5 transition-all',
                  jaTemClasse(cls.id)
                    ? 'class-card--owned opacity-70 cursor-default'
                    : !elegivel(tier) && !isHibrida(tier)
                      ? 'class-card--locked opacity-50 cursor-not-allowed'
                      : 'class-card--available hover:-translate-y-1 hover:shadow-2xl cursor-pointer'
                ]"
              >
                <div class="flex items-start justify-between mb-3">
                  <span class="tier-badge text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="tierBadgeClass(cls.tier)">
                    {{ cls.tier }}
                  </span>
                  <span v-if="jaTemClasse(cls.id)" class="text-emerald-400 text-lg" title="Você já possui esta classe">✓</span>
                  <span v-else-if="!elegivel(tier) && !isHibrida(tier)" class="text-zinc-600 text-lg">🔒</span>
                </div>

                <h3 class="text-base font-bold text-white mb-2 leading-tight">{{ cls.name }}</h3>
                <p class="text-xs text-zinc-400 leading-relaxed line-clamp-3">{{ cls.description }}</p>

                <!-- Status bonus -->
                <div v-if="statusBonusEntries(cls).length" class="mt-3 flex flex-wrap gap-1">
                  <span
                    v-for="[stat, val] in statusBonusEntries(cls)"
                    :key="stat"
                    class="stat-bonus-badge text-xs rounded-full px-2 py-0.5"
                  >
                    +{{ val }} {{ stat }}
                  </span>
                </div>

                <!-- Default skills preview -->
                <div v-if="defaultSkills(cls).length" class="mt-3">
                  <p class="text-xs text-zinc-500 mb-1">Skills iniciais:</p>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="sk in defaultSkills(cls).slice(0, 3)"
                      :key="sk"
                      class="skill-preview-badge text-xs rounded-full px-2 py-0.5"
                    >
                      {{ sk }}
                    </span>
                    <span v-if="defaultSkills(cls).length > 3" class="text-xs text-zinc-600">
                      +{{ defaultSkills(cls).length - 3 }} mais
                    </span>
                  </div>
                </div>

                <div v-if="!jaTemClasse(cls.id) && (elegivel(tier) || isHibrida(tier))" class="mt-4 text-xs text-[#6B4E9E] group-hover:text-white transition-colors font-semibold">
                  {{ isHibrida(tier) ? 'Ver requisitos →' : 'Escolher classe →' }}
                </div>
              </button>
            </div>
          </div>

          <!-- Tabela de Progressão de Nível -->
          <section v-if="levelProgression.length" class="mt-4">
            <h2 class="section-title text-2xl font-bold mb-4">Progressão de Nível</h2>
            <div class="overflow-x-auto rounded-3xl border classes-divider">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b classes-divider">
                    <th class="px-4 py-3 text-left text-zinc-400 font-semibold">Nível</th>
                    <th class="px-4 py-3 text-left text-zinc-400 font-semibold">XP p/ subir</th>
                    <th class="px-4 py-3 text-left text-zinc-400 font-semibold">XP Total</th>
                    <th v-if="character" class="px-4 py-3 text-left text-zinc-400 font-semibold">Faltam</th>
                    <th v-if="hasMultiplier" class="px-4 py-3 text-left text-zinc-400 font-semibold">Multiplicador</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in levelProgression"
                    :key="row.level"
                    class="border-b classes-divider last:border-0 transition-colors"
                    :class="{ 'bg-amber-900/10': character && row.level === character.level }"
                  >
                    <td class="px-4 py-2.5 font-bold" :class="character && row.level === character.level ? 'text-amber-400' : 'text-white'">
                      {{ row.level }}
                      <span v-if="character && row.level === character.level" class="ml-1 text-xs text-amber-500">← atual</span>
                    </td>
                    <td class="px-4 py-2.5 text-zinc-300">{{ row.xp_required?.toLocaleString('pt-BR') }}</td>
                    <td class="px-4 py-2.5 text-zinc-500">
                      {{ row.xp_total_accumulated != null ? Number(row.xp_total_accumulated).toLocaleString('pt-BR') : '—' }}
                    </td>
                    <td v-if="character" class="px-4 py-2.5">
                      <span v-if="row.xp_total_accumulated == null" class="text-zinc-600">—</span>
                      <span v-else-if="xpAtual >= Number(row.xp_total_accumulated)" class="text-emerald-400 text-xs font-semibold">Atingido</span>
                      <span v-else class="text-amber-300">{{ (Number(row.xp_total_accumulated) - xpAtual).toLocaleString('pt-BR') }}</span>
                    </td>
                    <td v-if="hasMultiplier" class="px-4 py-2.5 text-zinc-400">{{ row.multiplier }}x</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </main>
    </div>

    <!-- Modal: Confirmar escolha de classe -->
    <Modal
      v-if="modalClasse"
      panel-class="max-w-lg"
      body-class="p-6"
      header-class="px-6 py-4"
      @close="fecharModalClasse"
    >
      <template #header>
        <div>
          <span class="tier-badge text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="tierBadgeClass(modalClasse.tier)">
            {{ modalClasse.tier }}
          </span>
          <h2 class="text-2xl font-bold text-white mt-1">{{ modalClasse.name }}</h2>
        </div>
      </template>

      <p class="text-zinc-300 text-sm leading-relaxed mb-4">{{ modalClasse.description }}</p>

      <!-- Requisitos (classes híbridas) -->
      <div v-if="isHibrida(modalClasse.tier)" class="mb-5 rounded-2xl border px-4 py-3"
        :class="requisitosModalAtendidos ? 'border-emerald-700/40 bg-emerald-950/15' : 'border-red-800/40 bg-red-950/15'"
      >
        <p class="text-xs uppercase tracking-widest font-semibold mb-2"
          :class="requisitosModalAtendidos ? 'text-emerald-400' : 'text-red-400'"
        >
          Requisitos para desbloquear
        </p>
        <ul class="space-y-2">
          <li
            v-for="req in requisitosModal"
            :key="req.name"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <span :class="req.atendido ? 'text-emerald-400' : 'text-red-400'" class="text-base leading-none">
                {{ req.atendido ? '✓' : '✗' }}
              </span>
              <span :class="req.atendido ? 'text-zinc-200' : 'text-zinc-400'">
                {{ req.name }} nível {{ req.minLevel }}
              </span>
            </div>
            <span class="text-xs" :class="req.atendido ? 'text-emerald-500' : 'text-red-500'">
              {{ req.nivelAtual }}/{{ req.minLevel }}
            </span>
          </li>
        </ul>
        <p v-if="!requisitosModalAtendidos" class="mt-3 text-xs text-red-300">
          Você não atende todos os requisitos para esta classe.
        </p>
      </div>

      <!-- Status Bonus -->
      <div v-if="statusBonusEntries(modalClasse).length" class="mb-5">
        <p class="text-xs text-zinc-500 uppercase tracking-widest mb-2">Bônus de Status</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="[stat, val] in statusBonusEntries(modalClasse)"
            :key="stat"
            class="text-sm bg-emerald-900/30 border border-emerald-700/40 rounded-full px-3 py-1 text-emerald-300"
          >
            +{{ val }} {{ stat }}
          </span>
        </div>
      </div>

      <!-- Custo / bloqueios -->
      <div v-if="requisitosModalAtendidos" class="mb-5 flex items-center gap-2 text-sm">
        <span class="text-zinc-400">Custo:</span>
        <span class="font-bold text-amber-300">1 ponto de classe</span>
        <span class="text-zinc-500">(você tem {{ classPoints }})</span>
      </div>
      <div v-else-if="!isHibrida(modalClasse.tier)" class="mb-5 flex items-center gap-2 text-sm">
        <span class="text-zinc-400">Custo:</span>
        <span class="font-bold text-amber-300">1 ponto de classe</span>
        <span class="text-zinc-500">(você tem {{ classPoints }})</span>
      </div>

      <!-- Aviso sem pontos (quando requisitos ok) -->
      <div v-if="requisitosModalAtendidos && classPoints === 0" class="mb-5 rounded-2xl border border-zinc-700/40 bg-zinc-900/40 px-4 py-3 text-sm text-zinc-400">
        Você não tem pontos de classe disponíveis. Peça ao mestre para adicionar pontos.
      </div>

      <!-- Escolha de skill inicial -->
      <div v-if="requisitosModalAtendidos && classPoints > 0 && defaultSkills(modalClasse).length" class="mb-5">
        <p class="text-sm text-zinc-300 mb-3">
          Escolha <strong class="text-amber-300">1 skill inicial</strong> para começar com esta classe:
        </p>
        <div class="space-y-2">
          <button
            v-for="sk in defaultSkills(modalClasse)"
            :key="sk"
            @click="skillEscolhida = sk"
            :class="[
              'w-full text-left rounded-2xl border px-4 py-3 text-sm transition-colors flex items-center justify-between gap-2',
              skillEscolhida === sk
                ? 'border-amber-500/70 bg-amber-900/20 text-amber-200'
                : 'border-zinc-700/50 bg-[#0F1C3A]/60 text-zinc-300 hover:border-[#6B4E9E]/60'
            ]"
          >
            <span class="flex-1">{{ sk }}</span>
            <span
              v-if="skillsStore.catalogo.find(s => s.name?.toLowerCase() === sk.toLowerCase())"
              @click="verDetalhesSkill(sk, $event)"
              class="text-xs text-[#6B4E9E] hover:text-white transition-colors shrink-0 underline"
            >
              ver
            </span>
          </button>
        </div>
      </div>

      <p v-if="erroModal" class="text-red-300 text-sm mb-3">{{ erroModal }}</p>

      <div class="flex gap-3">
        <button
          @click="fecharModalClasse"
          :disabled="salvandoClasse"
          class="flex-1 py-3 rounded-2xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <!-- Botão só aparece se requisitos atendidos E tem pontos -->
        <button
          v-if="requisitosModalAtendidos && classPoints > 0"
          @click="confirmarClasse"
          :disabled="salvandoClasse || (defaultSkills(modalClasse).length > 0 && !skillEscolhida)"
          class="flex-1 py-3 rounded-2xl bg-[#6B4E9E] hover:brightness-110 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ salvandoClasse ? 'Confirmando...' : 'Confirmar (−1 ponto)' }}
        </button>
      </div>
    </Modal>

    <!-- Modal: Upar nível de classe -->
    <Modal
      v-if="modalLevarClasse"
      panel-class="max-w-sm"
      body-class="p-6"
      header-class="px-6 py-4"
      @close="fecharModalLevar"
    >
      <template #header>
        <h2 class="text-xl font-bold text-white">Upar Nível</h2>
      </template>

      <p class="text-zinc-300 text-sm mb-4">
        Avançar <strong class="text-white">{{ modalLevarClasse.name }}</strong> do nível
        <span class="text-amber-400 font-bold">{{ modalLevarClasse.level }}</span> para
        <span class="text-emerald-400 font-bold">{{ modalLevarClasse.level + 1 }}</span>?
      </p>
      <p class="text-sm text-zinc-400 mb-5">
        Custo: <span class="text-amber-300 font-semibold">1 ponto de classe</span>
        <span class="text-zinc-500"> (você tem {{ classPoints }})</span>
      </p>

      <p v-if="erroModal" class="text-red-300 text-sm mb-3">{{ erroModal }}</p>

      <div class="flex gap-3">
        <button @click="fecharModalLevar" :disabled="salvandoLevar" class="flex-1 py-3 rounded-2xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50">
          Cancelar
        </button>
        <button
          @click="confirmarLevar"
          :disabled="salvandoLevar"
          class="flex-1 py-3 rounded-2xl bg-emerald-700 hover:brightness-110 font-semibold transition-colors disabled:opacity-50"
        >
          {{ salvandoLevar ? 'Upando...' : 'Confirmar' }}
        </button>
      </div>
    </Modal>

    <!-- Modal: Detalhes da skill -->
    <Modal
      v-if="modalSkillDetalhe"
      panel-class="max-w-md"
      body-class="p-6"
      header-class="px-6 py-4"
      @close="modalSkillDetalhe = null"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <span v-if="modalSkillDetalhe.type" class="text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#1e3a5f] text-[#93c5fd] border border-[#3b82f640]">
            {{ modalSkillDetalhe.type }}
          </span>
          <h2 class="text-xl font-bold text-white">{{ modalSkillDetalhe.name }}</h2>
        </div>
      </template>

      <p v-if="modalSkillDetalhe.description" class="text-zinc-300 text-sm leading-relaxed mb-5">
        {{ modalSkillDetalhe.description }}
      </p>

      <div v-if="skillDetalheStatBonuses.length" class="mb-5">
        <p class="text-xs text-zinc-500 uppercase tracking-widest mb-2">Bônus de Status</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="[stat, val] in skillDetalheStatBonuses"
            :key="stat"
            class="text-sm bg-emerald-900/30 border border-emerald-700/40 rounded-full px-3 py-1 text-emerald-300"
          >
            +{{ val }} {{ stat }}
          </span>
        </div>
      </div>

      <div v-if="skillDetalheCamposExtras.length" class="mb-5 space-y-2">
        <div v-for="[k, v] in skillDetalheCamposExtras" :key="k" class="text-sm">
          <span class="text-zinc-500">{{ traduzirCampoSkill(k) }}:</span>
          <span class="text-zinc-300 ml-2">{{ traduzirValorSkill(v) }}</span>
        </div>
      </div>

      <div class="flex justify-end">
        <button @click="modalSkillDetalhe = null" class="px-6 py-3 rounded-2xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 transition-colors">
          Fechar
        </button>
      </div>
    </Modal>

    <!-- Modal: Escolher nova skill -->
    <Modal
      v-if="modalSkillClasse"
      panel-class="max-w-md"
      body-class="p-6"
      header-class="px-6 py-4"
      @close="fecharModalSkill"
    >
      <template #header>
        <h2 class="text-xl font-bold text-white">Nova Skill — {{ modalSkillClasse.name }}</h2>
      </template>

      <p class="text-zinc-400 text-sm mb-4">
        Escolha uma skill disponível desta classe que você ainda não possui:
      </p>

      <div v-if="skillsDisponiveis.length === 0" class="text-zinc-500 text-sm text-center py-4">
        Nenhuma skill disponível para escolher.
      </div>

      <div v-else class="space-y-2">
        <button
          v-for="sk in skillsDisponiveis"
          :key="sk"
          @click="novaSkillEscolhida = sk"
          :class="[
            'w-full text-left rounded-2xl border px-4 py-3 text-sm transition-colors flex items-center justify-between gap-2',
            novaSkillEscolhida === sk
              ? 'border-amber-500/70 bg-amber-900/20 text-amber-200'
              : 'border-zinc-700/50 bg-[#0F1C3A]/60 text-zinc-300 hover:border-[#6B4E9E]/60'
          ]"
        >
          <span class="flex-1">{{ sk }}</span>
          <span
            v-if="skillsStore.catalogo.find(s => s.name?.toLowerCase() === sk.toLowerCase())"
            @click="verDetalhesSkill(sk, $event)"
            class="text-xs text-[#6B4E9E] hover:text-white transition-colors shrink-0 underline"
          >
            ver
          </span>
        </button>
      </div>

      <p v-if="erroModal" class="text-red-300 text-sm mt-3">{{ erroModal }}</p>

      <div class="flex gap-3 mt-5">
        <button @click="fecharModalSkill" :disabled="salvandoSkill" class="flex-1 py-3 rounded-2xl border border-zinc-700/50 text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-50">
          Cancelar
        </button>
        <button
          @click="confirmarNovaSkill"
          :disabled="salvandoSkill || !novaSkillEscolhida"
          class="flex-1 py-3 rounded-2xl bg-[#6B4E9E] hover:brightness-110 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ salvandoSkill ? 'Salvando...' : 'Confirmar' }}
        </button>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import HamburgerDrawerMenu from '@/components/HamburgerDrawerMenu.vue'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useClassesStore } from '@/stores/classes'
import { useSkillsStore } from '@/stores/skills'
import type { ClasseApi } from '@/lib/api/classes.api'
import type { SkillApi } from '@/lib/api/skills.api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const charactersStore = useCharactersStore()
const classesStore = useClassesStore()
const skillsStore = useSkillsStore()

const loading = ref(true)
const error = ref<string | null>(null)
const showSettingsMenu = ref(false)
const salvandoClasse = ref(false)

function irParaPersonagem() {
  showSettingsMenu.value = false
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  if (characterId) router.push({ name: 'dashboard', query: { characterId } })
  else router.push({ name: 'dashboard' })
}

async function logout() {
  showSettingsMenu.value = false
  await authStore.sair()
  router.push({ name: 'login' })
}
const salvandoSkill = ref(false)
const salvandoLevar = ref(false)
const erroModal = ref('')

const modalClasse = ref<ClasseApi | null>(null)
const skillEscolhida = ref('')
const modalSkillClasse = ref<{ classId: string; name: string; tier: string } | null>(null)
const novaSkillEscolhida = ref('')
const modalLevarClasse = ref<{ classId: string; name: string; level: number } | null>(null)
const modalSkillDetalhe = ref<SkillApi | null>(null)

// ── Navigation ─────────────────────────────────────────────────────────────
const navItems = [
  { id: 'dashboard', label: 'Personagem' },
  { id: 'deuses', label: 'Deuses' },
  { id: 'cidade', label: 'Cidade' },
  { id: 'skills', label: 'Skills' },
  { id: 'titulos', label: 'Titulos' },
  { id: 'classes', label: 'Classes' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'notas', label: 'Notas de Aventura' },
]

function handleNavSelect(itemId: string) {
  const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  const withCharId = (path: string) =>
    characterId ? { path, query: { characterId } } : { path }

  const routeMap: Record<string, any> = {
    dashboard: characterId ? { name: 'dashboard', query: { characterId } } : { name: 'dashboard' },
    deuses: { path: '/deuses' },
    cidade: { path: '/cidade' },
    skills: withCharId('/skills'),
    titulos: withCharId('/titulos'),
    classes: withCharId('/classes'),
    npcs: withCharId('/npcs'),
    notas: withCharId('/notas'),
  }

  const target = routeMap[itemId]
  if (target) router.push(target)
}

// ── Character ─────────────────────────────────────────────────────────────
const character = computed(() => {
  const id = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
  return charactersStore.myCharacters.find((c) => c.characterId === id) ?? null
})

const xpAtual = computed<number>(() => (character.value?.data?.xp as number) ?? 0)

const personagemClasses = computed<any[]>(() => {
  const raw = character.value?.data?.classes
  return Array.isArray(raw) ? raw : []
})

const classPoints = computed<number>(() => {
  const raw = character.value?.data?.classPoints
  return typeof raw === 'number' ? raw : 0
})

// ── Classes store ─────────────────────────────────────────────────────────
const classes = computed(() => classesStore.classes)
const levelProgression = computed(() => classesStore.levelProgression)

const hasMultiplier = computed(() => levelProgression.value.some((r) => r.multiplier != null))

const classesPorTier = computed<Record<string, ClasseApi[]>>(() => {
  const ordem = ['base', 'hibrid']
  const map: Record<string, ClasseApi[]> = {}
  for (const cls of classes.value) {
    const t = normalizeTier(cls.tier ?? 'base')
    if (!map[t]) map[t] = []
    map[t].push(cls)
  }
  return Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => {
      const ia = ordem.findIndex((o) => a.startsWith(o))
      const ib = ordem.findIndex((o) => b.startsWith(o))
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    }),
  )
})

// ── Elegibilidade ─────────────────────────────────────────────────────────
const baseClasses = computed(() => personagemClasses.value.filter((c) => normalizeTier(c.tier ?? '') === 'base'))

function jaTemClasse(classId: string | number): boolean {
  return personagemClasses.value.some((c) => String(c.classId) === String(classId))
}

function normalizeTier(tier: string): string {
  return (tier ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isHibrida(tier: string): boolean {
  const t = normalizeTier(tier)
  return t.startsWith('hibrid')
}

// Resolve os requisitos de uma classe híbrida com status de atendimento
function resolverRequisitos(cls: ClasseApi) {
  const reqs = cls.requirements
  if (!reqs || !Array.isArray(reqs.required_classes)) return []
  const minLevel: number = reqs.min_level ?? 10
  return reqs.required_classes.map((reqId: number) => {
    const reqClasse = classes.value.find((c) => String(c.id) === String(reqId))
    const nome = reqClasse?.name ?? String(reqId)
    const pcClasse = personagemClasses.value.find((c) => String(c.classId) === String(reqId))
    const nivelAtual: number = pcClasse?.level ?? 0
    return {
      name: nome,
      minLevel,
      nivelAtual,
      atendido: nivelAtual >= minLevel,
    }
  })
}

// Verificação para o card (se pode abrir o modal de seleção)
function elegivel(tier: string, cls?: ClasseApi): boolean {
  if (!character.value) return false
  const t = normalizeTier(tier)
  if (t === 'base') {
    if (baseClasses.value.length === 0) return true
    if (baseClasses.value.length === 1) return (baseClasses.value[0]?.level ?? 1) >= 10
    return false
  }
  // Híbrida: sempre abre o modal — requisitos verificados dentro
  return true
}

function msgElegibilidade(tier: string): string {
  const t = normalizeTier(tier)
  if (t === 'base') {
    if (baseClasses.value.length === 0) return ''
    if (baseClasses.value.length === 1) return 'Atinja nível 10 na sua primeira classe base para desbloquear uma segunda.'
    return 'Limite de 2 classes base atingido.'
  }
  return ''
}

// Computeds para o modal da classe selecionada
const requisitosModal = computed(() => {
  if (!modalClasse.value || !isHibrida(modalClasse.value.tier)) return []
  return resolverRequisitos(modalClasse.value)
})

const requisitosModalAtendidos = computed(() => {
  if (!modalClasse.value) return true
  if (!isHibrida(modalClasse.value.tier)) return true
  const reqs = requisitosModal.value
  if (reqs.length === 0) return true
  return reqs.every((r) => r.atendido)
})

// ── Helpers visuais ────────────────────────────────────────────────────────
function tierLabel(tier: string): string {
  const t = normalizeTier(tier)
  if (t === 'base') return 'Classes Base'
  if (t.startsWith('hibrid')) return 'Classes Híbridas'
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function tierDescricao(tier: string): string {
  const t = normalizeTier(tier)
  if (t === 'base') return 'Escolha 1 das 7 classes base para começar. Após nível 10, você pode escolher uma segunda.'
  if (t.startsWith('hibrid')) return 'Combinação de duas classes base. Requer as classes base específicas no nível mínimo.'
  return ''
}

function tierBadgeClass(tier: string): string {
  const t = normalizeTier(tier)
  if (t === 'base') return 'tier-badge--base'
  if (t.startsWith('hibrid')) return 'tier-badge--hibrida'
  return 'tier-badge--other'
}

function statusBonusEntries(cls: ClasseApi): [string, unknown][] {
  const raw = cls.stat_bonuses
  if (!raw) return []
  if (typeof raw === 'object' && !Array.isArray(raw)) return Object.entries(raw as Record<string, unknown>)
  if (typeof raw === 'string') {
    try { return Object.entries(JSON.parse(raw)) } catch { return [] }
  }
  return []
}

function defaultSkills(cls: ClasseApi): string[] {
  const raw = cls.starting_skills
  if (Array.isArray(raw)) return (raw as unknown[]).map(String).filter(Boolean)
  if (typeof raw === 'string') {
    try { const p = JSON.parse(raw); return Array.isArray(p) ? p.map(String) : [] } catch { return [] }
  }
  return []
}

// ── Level Progression ─────────────────────────────────────────────────────
const xpAtualFormatado = computed(() => xpAtual.value.toLocaleString('pt-BR'))

function xpProximoNivel(classLevel: number): string {
  const next = levelProgression.value.find((r) => r.level === classLevel + 1)
  return next ? next.xp_required.toLocaleString('pt-BR') : '—'
}

function xpPercent(classLevel: number): number {
  const curr = levelProgression.value.find((r) => r.level === classLevel)
  const next = levelProgression.value.find((r) => r.level === classLevel + 1)
  if (!curr || !next) return 0
  const progress = xpAtual.value - curr.xp_required
  const range = next.xp_required - curr.xp_required
  if (range <= 0) return 100
  return Math.min(100, Math.max(0, Math.round((progress / range) * 100)))
}

// ── Skill helpers ─────────────────────────────────────────────────────────
function podeEscolherSkill(pc: any): boolean {
  const cls = classes.value.find((c) => String(c.id) === String(pc.classId))
  if (!cls) return false
  const available = defaultSkills(cls).filter(
    (s) => !pc.chosenSkills?.some((cs: string) => cs.toLowerCase() === s.toLowerCase()),
  )
  return available.length > 0 && (pc.level ?? 1) >= 2
}

const skillsDisponiveis = computed<string[]>(() => {
  if (!modalSkillClasse.value) return []
  const cls = classes.value.find((c) => String(c.id) === String(modalSkillClasse.value!.classId))
  if (!cls) return []
  const pc = personagemClasses.value.find((c) => String(c.classId) === String(modalSkillClasse.value!.classId))
  const already: string[] = pc?.chosenSkills ?? []
  return defaultSkills(cls).filter(
    (s) => !already.some((a: string) => a.toLowerCase() === s.toLowerCase()),
  )
})

// ── Skill detalhe ──────────────────────────────────────────────────────────
const TRADUCAO_CAMPOS_SKILL: Record<string, string> = {
  effect_description: 'Descrição do Efeito',
  cooldown: 'Tempo de Recarga',
  range: 'Alcance',
  mana_cost: 'Custo de Mana',
  stamina_cost: 'Custo de Stamina',
  cast_time: 'Tempo de Conjuração',
  duration: 'Duração',
  level_required: 'Nível Mínimo',
  damage: 'Dano',
  damage_display: 'Dano',
  damage_type: 'Tipo de Dano',
  healing: 'Cura',
  target: 'Alvo',
}

const TRADUCAO_VALORES_SKILL: Record<string, string> = {
  self: 'a si mesmo',
  melee: 'corpo a corpo',
  ranged: 'à distância',
  touch: 'toque',
  aoe: 'área',
  line: 'linha',
  cone: 'cone',
  short: 'curto',
  medium: 'médio',
  long: 'longo',
}

function traduzirCampoSkill(key: string): string {
  return TRADUCAO_CAMPOS_SKILL[key] ?? key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

function traduzirValorSkill(value: unknown): unknown {
  if (typeof value !== 'string') return value
  return TRADUCAO_VALORES_SKILL[value.toLowerCase()] ?? value
}

const CAMPOS_RESERVADOS_SKILL = new Set([
  'id', 'name', 'description', 'type', 'category', 'stat_bonuses',
  'requirements', 'class_id', 'created_at', 'updated_at', 'deleted_at', 'deleted_by', 'is_secret',
])

const skillDetalheStatBonuses = computed<[string, unknown][]>(() => {
  const raw = modalSkillDetalhe.value?.stat_bonuses
  if (!raw) return []
  const obj = typeof raw === 'string' ? (() => { try { return JSON.parse(raw) } catch { return null } })() : raw
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) return Object.entries(obj as Record<string, unknown>)
  return []
})

const skillDetalheCamposExtras = computed<[string, unknown][]>(() => {
  if (!modalSkillDetalhe.value) return []
  return Object.entries(modalSkillDetalhe.value).filter(
    ([k, v]) => !CAMPOS_RESERVADOS_SKILL.has(k) && v != null && typeof v !== 'object' && !Array.isArray(v),
  ) as [string, unknown][]
})

function verDetalhesSkill(name: string, event: Event) {
  event.stopPropagation()
  const skill = skillsStore.catalogo.find(
    (s) => s.name?.toLowerCase() === name.toLowerCase(),
  )
  if (skill) modalSkillDetalhe.value = skill
}

// ── Modais ─────────────────────────────────────────────────────────────────
function abrirModalClasse(cls: ClasseApi) {
  modalClasse.value = cls
  skillEscolhida.value = ''
  erroModal.value = ''
}

function fecharModalClasse() {
  modalClasse.value = null
  skillEscolhida.value = ''
  erroModal.value = ''
}

function abrirModalSkill(pc: any) {
  modalSkillClasse.value = { classId: pc.classId, name: pc.name, tier: pc.tier }
  novaSkillEscolhida.value = ''
  erroModal.value = ''
}

function fecharModalSkill() {
  modalSkillClasse.value = null
  novaSkillEscolhida.value = ''
  erroModal.value = ''
}

function abrirModalLevar(pc: any) {
  modalLevarClasse.value = { classId: pc.classId, name: pc.name, level: pc.level ?? 1 }
  erroModal.value = ''
}

function fecharModalLevar() {
  modalLevarClasse.value = null
  erroModal.value = ''
}

function syncCharacter(updated: any) {
  const idx = charactersStore.myCharacters.findIndex((c) => c.characterId === updated.characterId)
  if (idx !== -1) charactersStore.myCharacters[idx] = updated
  else charactersStore.myCharacters.unshift(updated)
}

async function confirmarClasse() {
  if (!modalClasse.value || !character.value) return
  const skills = defaultSkills(modalClasse.value)
  if (skills.length > 0 && !skillEscolhida.value) {
    erroModal.value = 'Escolha uma skill inicial antes de confirmar.'
    return
  }

  salvandoClasse.value = true
  erroModal.value = ''
  try {
    const updated = await classesStore.pickClass(character.value.characterId, {
      classId: String(modalClasse.value.id),
      className: modalClasse.value.name,
      classTier: modalClasse.value.tier,
    })
    if (skillEscolhida.value) {
      const updated2 = await classesStore.pickInitialSkill(character.value.characterId, {
        classId: String(modalClasse.value.id),
        skillName: skillEscolhida.value,
      })
      syncCharacter(updated2)
    } else {
      syncCharacter(updated)
    }
    fecharModalClasse()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err?.message ?? 'Erro ao escolher classe.'
  } finally {
    salvandoClasse.value = false
  }
}

async function confirmarLevar() {
  if (!modalLevarClasse.value || !character.value) return
  salvandoLevar.value = true
  erroModal.value = ''
  try {
    const updated = await classesStore.levelClass(character.value.characterId, {
      classId: modalLevarClasse.value.classId,
    })
    syncCharacter(updated)
    fecharModalLevar()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err?.message ?? 'Erro ao upar classe.'
  } finally {
    salvandoLevar.value = false
  }
}

async function confirmarNovaSkill() {
  if (!modalSkillClasse.value || !character.value || !novaSkillEscolhida.value) return
  salvandoSkill.value = true
  erroModal.value = ''
  try {
    const updated = await classesStore.pickInitialSkill(character.value.characterId, {
      classId: modalSkillClasse.value.classId,
      skillName: novaSkillEscolhida.value,
    })
    syncCharacter(updated)
    fecharModalSkill()
  } catch (err: any) {
    erroModal.value = err?.response?.data?.message ?? err?.message ?? 'Erro ao escolher skill.'
  } finally {
    salvandoSkill.value = false
  }
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  loading.value = true
  error.value = null
  try {
    const characterId = String(route.query.characterId ?? authStore.idPersonagemAtivo ?? '')
    await Promise.all([
      classesStore.fetchClasses(),
      classesStore.fetchLevelProgression(),
      skillsStore.catalogo.length === 0 ? skillsStore.fetchCatalogo() : Promise.resolve(),
      characterId && !character.value
        ? charactersStore.fetchCharacterById(characterId)
        : Promise.resolve(),
    ])
  } catch (err: any) {
    error.value = err?.message ?? 'Erro ao carregar dados'
  } finally {
    loading.value = false
  }
}

const onGlobalClick = () => { showSettingsMenu.value = false }

onMounted(() => {
  init()
  window.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onGlobalClick)
})
</script>

<style scoped>
.classes-header {
  border-color: var(--border-soft);
  background: color-mix(in srgb, var(--bg-card) 88%, transparent 12%);
  backdrop-filter: blur(8px);
}

.classes-title {
  color: var(--brand-primary);
}

.classes-divider {
  border-color: var(--border-soft);
}

.section-title {
  color: var(--text-main);
}

.classes-empty-panel {
  background: var(--bg-card);
  border-color: var(--border-soft);
  color: var(--text-muted);
}

.class-points-panel {
  background: color-mix(in srgb, var(--bg-card) 80%, #d97706 10%);
  border-color: #d9770640;
}

.points-value {
  color: #fbbf24;
  text-shadow: 0 0 20px #d9770660;
}

.character-class-card {
  background: color-mix(in srgb, var(--bg-card) 90%, #6B4E9E 10%);
  border-color: #6B4E9E40;
}

.class-card {
  background: var(--bg-card);
  border-color: var(--border-soft);
}

.class-card--available:hover {
  border-color: #6B4E9E80;
  background: color-mix(in srgb, var(--bg-card) 85%, #6B4E9E 15%);
}

.class-card--owned {
  border-color: #22c55e30;
  background: color-mix(in srgb, var(--bg-card) 90%, #22c55e 10%);
}

:global(html.theme-dark) .classes-header {
  background: rgb(2 6 23 / 0.68);
}

:global(html.theme-dark) .character-class-card {
  background: #111a2d;
}

:global(html.theme-dark) .class-card {
  background: #0f1c3a;
}

/* ── Tier badges — contraste garantido em ambos os temas ── */
.tier-badge--base {
  background: #1e3a5f;
  color: #93c5fd;
  border: 1px solid #3b82f640;
}
.tier-badge--hibrida {
  background: #3b1f6e;
  color: #d8b4fe;
  border: 1px solid #7c3aed40;
}
.tier-badge--other {
  background: #27272a;
  color: #d4d4d8;
  border: 1px solid #52525b40;
}

:global(html.theme-light) .tier-badge--base {
  background: #dbeafe;
  color: #1d4ed8;
  border: 1px solid #3b82f640;
}
:global(html.theme-light) .tier-badge--hibrida {
  background: #ede9fe;
  color: #6d28d9;
  border: 1px solid #7c3aed40;
}
:global(html.theme-light) .tier-badge--other {
  background: #f4f4f5;
  color: #3f3f46;
  border: 1px solid #a1a1aa40;
}

.stat-bonus-badge {
  background: #14532d40;
  border: 1px solid #15803d40;
  color: #86efac;
}
:global(html.theme-light) .stat-bonus-badge {
  background: #dcfce7;
  border: 1px solid #16a34a40;
  color: #15803d;
}

.skill-preview-badge {
  background: #1A2438;
  border: 1px solid #6B4E9E30;
  color: #94a3b8;
}
:global(html.theme-light) .skill-preview-badge {
  background: #f1f0ff;
  border: 1px solid #7c3aed30;
  color: #5b21b6;
}
</style>

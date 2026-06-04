<template>
  <div class="onboarding-root min-h-screen overflow-x-hidden text-white">
    <div class="fixed inset-0 -z-10 bg-gradient-to-br from-[#0B1623] via-[#080D18] to-[#120A22]" />
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgb(99_102_241/0.12),transparent)]" />

    <!-- Loading -->
    <div v-if="carregando" class="flex min-h-screen items-center justify-center">
      <div class="flex flex-col items-center gap-4">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p class="text-sm text-zinc-500">Carregando...</p>
      </div>
    </div>

    <!-- Tela de confirmação -->
    <div v-else-if="confirmando" class="flex min-h-screen items-center justify-center px-4">
      <div class="max-w-lg w-full text-center space-y-6">

        <!-- Raça -->
        <template v-if="etapa === 1">
          <div class="mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-indigo-500/60 bg-black/30">
            <img v-if="racaSelecionada?.foto_url" :src="racaSelecionada.foto_url" :alt="racaSelecionada.nome" class="h-full w-full object-cover" />
            <div v-else class="flex h-full items-center justify-center text-3xl">⚔</div>
          </div>
          <div>
            <p class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400 mb-2">Você escolheu</p>
            <h2 class="text-3xl font-bold text-white mb-1">{{ racaSelecionada?.nome }}</h2>
            <p class="text-sm text-zinc-400">{{ racaSelecionada?.descricao }}</p>
          </div>
          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-300/80">
            ⚠ Esta escolha é <strong class="text-amber-300">permanente</strong>. Sua raça define quem você é — não poderá ser alterada.
          </div>
          <div class="flex gap-3 justify-center">
            <button type="button" class="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:text-white" @click="confirmando = false">Voltar</button>
            <button type="button" :disabled="salvando" class="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60" @click="confirmarRaca">
              {{ salvando ? 'Confirmando...' : 'Confirmar Raça' }}
            </button>
          </div>
        </template>

        <!-- Classe -->
        <template v-else-if="etapa === 2">
          <div class="mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-cyan-500/60 bg-black/30">
            <div class="flex h-full items-center justify-center text-3xl">⚔️</div>
          </div>
          <div>
            <p class="text-xs font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2">Você escolheu</p>
            <h2 class="text-3xl font-bold text-white mb-1">{{ classeSelecionada?.name }}</h2>
            <p class="text-sm text-zinc-400">{{ classeSelecionada?.description }}</p>
            <p class="mt-2 text-xs font-semibold text-cyan-400/70 uppercase tracking-wider">Tier {{ classeSelecionada?.tier }}</p>
          </div>
          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-300/80">
            ⚠ Esta escolha é <strong class="text-amber-300">permanente</strong>. Sua classe molda seu caminho — não poderá ser alterada.
          </div>
          <div class="flex gap-3 justify-center">
            <button type="button" class="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:text-white" @click="confirmando = false">Voltar</button>
            <button type="button" :disabled="salvando" class="rounded-xl bg-cyan-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-600 disabled:opacity-60" @click="confirmarClasse">
              {{ salvando ? 'Confirmando...' : 'Confirmar Classe' }}
            </button>
          </div>
        </template>

        <!-- Passado -->
        <template v-else-if="etapa === 3">
          <div class="mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-violet-500/60 bg-black/30">
            <img v-if="passadoSelecionado?.foto_url" :src="passadoSelecionado.foto_url" :alt="passadoSelecionado.nome" class="h-full w-full object-cover" />
            <div v-else class="flex h-full items-center justify-center text-3xl">📜</div>
          </div>
          <div>
            <p class="text-xs font-bold tracking-[0.3em] uppercase text-violet-400 mb-2">Você escolheu</p>
            <h2 class="text-3xl font-bold text-white mb-1">{{ passadoSelecionado?.nome }}</h2>
            <p class="text-sm text-zinc-400">{{ passadoSelecionado?.descricao }}</p>
          </div>
          <div v-if="passadoSelecionado && (passadoSelecionado.skills.length || passadoSelecionado.titulos.length || temBonusAtributo(passadoSelecionado))" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 text-left space-y-3">
            <div v-if="passadoSelecionado.atributo_bonus && temBonusAtributo(passadoSelecionado)">
              <p class="text-[0.65rem] font-bold uppercase tracking-widest text-rose-400/70 mb-1.5">Bônus de Atributos</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="attr in ATRIBUTOS_BONUS_CONFIG"
                  :key="attr.key"
                  v-if="(passadoSelecionado!.atributo_bonus as any)[attr.key] !== 0"
                  class="rounded-lg border px-2 py-0.5 text-xs font-semibold"
                  :class="(passadoSelecionado!.atributo_bonus as any)[attr.key] > 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'"
                >
                  {{ (passadoSelecionado!.atributo_bonus as any)[attr.key] > 0 ? '+' : '' }}{{ (passadoSelecionado!.atributo_bonus as any)[attr.key] }} {{ attr.label }}
                </span>
              </div>
            </div>
            <div v-if="passadoSelecionado.skills.length">
              <p class="text-[0.65rem] font-bold uppercase tracking-widest text-violet-400/70 mb-1.5">Skills concedidas</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-for="sk in passadoSelecionado.skills" :key="sk.id" class="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-xs text-violet-300">{{ sk.name }}</span>
              </div>
            </div>
            <div v-if="passadoSelecionado.titulos.length">
              <p class="text-[0.65rem] font-bold uppercase tracking-widest text-amber-400/70 mb-1.5">Títulos concedidos</p>
              <div class="space-y-2">
                <div v-for="tit in passadoSelecionado.titulos" :key="tit.id">
                  <span class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">{{ tit.name }}</span>
                  <div v-if="tit.skills && tit.skills.length" class="mt-1 ml-3 flex flex-wrap gap-1">
                    <span class="text-[0.6rem] text-zinc-600 mr-1">concede:</span>
                    <span
                      v-for="sk in tit.skills"
                      :key="sk.id"
                      class="rounded-md border border-emerald-500/25 bg-emerald-950/30 px-1.5 py-0.5 text-[0.6rem] text-emerald-300"
                    >{{ sk.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-4 text-sm text-amber-300/80">
            ⚠ Esta escolha é <strong class="text-amber-300">permanente</strong>. Seu passado molda sua origem.
          </div>
          <div class="flex gap-3 justify-center">
            <button type="button" class="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-zinc-400 hover:text-white" @click="confirmando = false">Voltar</button>
            <button type="button" :disabled="salvando" class="rounded-xl bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-600 disabled:opacity-60" @click="confirmarPassado">
              {{ salvando ? 'Confirmando...' : 'Confirmar Passado' }}
            </button>
          </div>
        </template>

        <p v-if="erroEscolha" class="text-sm text-red-400">{{ erroEscolha }}</p>
      </div>
    </div>

    <!-- Seleção / UI -->
    <div v-else class="mx-auto max-w-7xl px-4 py-10 sm:px-6">

      <!-- Header personagem -->
      <div class="mb-10 flex flex-col items-center gap-4 text-center">
        <div class="relative">
          <div class="h-20 w-20 overflow-hidden rounded-full border-2 border-white/20 bg-black/40 ring-4 ring-indigo-500/20">
            <img v-if="personagem?.avatarUrl" :src="personagem.avatarUrl" :alt="personagem.name" class="h-full w-full object-cover" />
            <div v-else class="flex h-full items-center justify-center text-3xl text-zinc-600">{{ personagem?.name?.[0]?.toUpperCase() ?? '?' }}</div>
          </div>
          <div class="absolute -bottom-1 -right-1 rounded-full bg-indigo-500 p-1.5">
            <svg class="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          </div>
        </div>
        <div>
          <p class="text-xs font-bold tracking-[0.3em] uppercase text-indigo-400">Bem-vindo, aventureiro</p>
          <h1 class="mt-1 text-2xl font-bold text-white">{{ personagem?.name }}</h1>
          <p class="mt-1 text-sm text-zinc-500">{{ subtituloEtapa }}</p>
        </div>

        <!-- Stepper -->
        <div class="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <div v-for="(step, idx) in stepperSteps" :key="step.id" class="flex items-center gap-2">
            <div class="flex items-center gap-1.5" :class="etapa === step.etapa ? '' : etapa > step.etapa ? 'opacity-70' : 'opacity-35'">
              <div class="h-6 w-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold"
                :class="etapa > step.etapa ? 'bg-green-600 text-white' : etapa === step.etapa ? `${step.bgColor} text-white` : 'border border-white/20 text-zinc-500'">
                <svg v-if="etapa > step.etapa" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
                <span v-else>{{ step.etapa }}</span>
              </div>
              <span :class="etapa === step.etapa ? `font-semibold ${step.textColor}` : 'text-zinc-600'">{{ step.label }}</span>
            </div>
            <div v-if="idx < stepperSteps.length - 1" class="h-px w-4 bg-white/10" />
          </div>
        </div>
      </div>

      <!-- ═══ Etapa 1: Raça ═══ -->
      <template v-if="etapa === 1">
        <div v-if="!racas.length" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
          <p class="text-zinc-500">Nenhuma raça cadastrada pelo mestre ainda.</p>
        </div>
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button v-for="raca in racas" :key="raca.id" type="button"
            class="onboarding-card group relative overflow-hidden rounded-3xl border text-left transition-all duration-300"
            :class="hover === raca.id ? 'border-indigo-500/50 bg-indigo-500/10 shadow-[0_0_40px_rgb(99_102_241/0.15)]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'"
            @mouseenter="hover = raca.id" @mouseleave="hover = null" @click="selecionarRaca(raca)">
            <div class="relative h-40 overflow-hidden">
              <img v-if="raca.foto_url" :src="raca.foto_url" :alt="raca.nome" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-900/40 to-violet-900/40 text-5xl">⚔</div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div v-if="raca.atributos_bonus.length" class="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                <span v-for="ab in raca.atributos_bonus.slice(0,3)" :key="ab.atributo" class="rounded-full border border-indigo-500/40 bg-indigo-500/20 px-2 py-0.5 text-[0.6rem] font-bold text-indigo-300">+{{ ab.valor }} {{ ab.atributo }}</span>
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-1.5 text-lg font-bold text-zinc-100 group-hover:text-white">{{ raca.nome }}</h3>
              <p v-if="raca.descricao" class="mb-4 line-clamp-3 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400">{{ raca.descricao }}</p>
              <div v-if="raca.habilidades.length" class="space-y-1.5">
                <p class="text-[0.6rem] font-bold uppercase tracking-widest text-indigo-400/60">Habilidades</p>
                <div class="flex flex-wrap gap-1.5">
                  <span v-for="hab in raca.habilidades.slice(0,4)" :key="hab.nome" class="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] text-zinc-400">{{ hab.nome }}</span>
                  <span v-if="raca.habilidades.length > 4" class="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] text-zinc-600">+{{ raca.habilidades.length - 4 }} mais</span>
                </div>
              </div>
              <div class="mt-4 flex items-center justify-between text-xs font-semibold" :class="hover === raca.id ? 'text-indigo-300' : 'text-zinc-600'">
                <span>Escolher esta raça</span>
                <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- ═══ Etapa 2: Classes ═══ -->
      <template v-else-if="etapa === 2">
        <div v-if="!classes.length" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
          <p class="text-zinc-500">Nenhuma classe cadastrada pelo mestre ainda.</p>
        </div>
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button v-for="cls in classes" :key="cls.id" type="button"
            class="onboarding-card group relative overflow-hidden rounded-3xl border text-left transition-all duration-300"
            :class="hover === cls.id ? 'border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_40px_rgb(6_182_212/0.12)]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'"
            @mouseenter="hover = cls.id" @mouseleave="hover = null" @click="selecionarClasse(cls)">
            <div class="relative h-32 overflow-hidden bg-gradient-to-br from-cyan-900/30 to-slate-900/60 flex items-center justify-center">
              <svg class="h-16 w-16 text-cyan-700/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div class="absolute bottom-3 left-3">
                <span class="rounded-full border border-cyan-500/40 bg-cyan-950/60 px-2.5 py-0.5 text-[0.65rem] font-bold text-cyan-300">Tier {{ cls.tier }}</span>
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-1.5 text-lg font-bold text-zinc-100 group-hover:text-white">{{ cls.name }}</h3>
              <p v-if="cls.description" class="mb-4 line-clamp-4 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400">{{ cls.description }}</p>
              <div v-if="(cls as any).requer_deus" class="mb-3 flex items-center gap-1.5 text-[0.65rem] text-amber-400/80">
                <svg class="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
                Exige escolha de deus
              </div>
              <div class="mt-2 flex items-center justify-between text-xs font-semibold" :class="hover === cls.id ? 'text-cyan-300' : 'text-zinc-600'">
                <span>Escolher esta classe</span>
                <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- ═══ Etapa 3: Passado ═══ -->
      <template v-else-if="etapa === 3">
        <div v-if="!passados.length" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
          <p class="text-zinc-500">Nenhum passado cadastrado pelo mestre ainda.</p>
        </div>
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button v-for="passado in passados" :key="passado.id" type="button"
            class="onboarding-card group relative overflow-hidden rounded-3xl border text-left transition-all duration-300"
            :class="hover === passado.id ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_40px_rgb(139_92_246/0.15)]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'"
            @mouseenter="hover = passado.id" @mouseleave="hover = null" @click="selecionarPassado(passado)">
            <div class="relative h-40 overflow-hidden">
              <img v-if="passado.foto_url" :src="passado.foto_url" :alt="passado.nome" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-900/40 to-purple-900/40 text-5xl">📜</div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            <div class="p-5">
              <h3 class="mb-1.5 text-lg font-bold text-zinc-100 group-hover:text-white">{{ passado.nome }}</h3>
              <p v-if="passado.descricao" class="mb-4 line-clamp-3 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400">{{ passado.descricao }}</p>
              <div v-if="passado.skills.length || passado.titulos.length || temBonusAtributo(passado)" class="space-y-1.5 mb-3">
                <div v-if="temBonusAtributo(passado)" class="flex flex-wrap gap-1">
                  <span
                    v-for="attr in ATRIBUTOS_BONUS_CONFIG"
                    :key="attr.key"
                    v-if="(passado.atributo_bonus as any)?.[attr.key] !== 0 && (passado.atributo_bonus as any)?.[attr.key] != null"
                    class="rounded-lg border px-2 py-0.5 text-[0.65rem] font-semibold"
                    :class="(passado.atributo_bonus as any)[attr.key] > 0 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'"
                  >
                    {{ (passado.atributo_bonus as any)[attr.key] > 0 ? '+' : '' }}{{ (passado.atributo_bonus as any)[attr.key] }} {{ attr.label }}
                  </span>
                </div>
                <div v-if="passado.skills.length" class="flex flex-wrap gap-1">
                  <span v-for="sk in passado.skills.slice(0,3)" :key="sk.id" class="rounded-lg border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[0.65rem] text-violet-300">{{ sk.name }}</span>
                </div>
                <div v-if="passado.titulos.length" class="space-y-1">
                  <div v-for="tit in passado.titulos.slice(0, 2)" :key="tit.id">
                    <span class="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.65rem] text-amber-300">{{ tit.name }}</span>
                    <template v-if="tit.skills && tit.skills.length">
                      <span class="text-[0.6rem] text-zinc-600 ml-1">→</span>
                      <span v-for="sk in tit.skills.slice(0,2)" :key="sk.id" class="ml-1 rounded-md border border-emerald-500/25 bg-emerald-950/30 px-1.5 py-0.5 text-[0.6rem] text-emerald-300">{{ sk.name }}</span>
                    </template>
                  </div>
                  <span v-if="passado.titulos.length > 2" class="rounded-lg border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[0.65rem] text-zinc-600">+{{ passado.titulos.length - 2 }} títulos</span>
                </div>
              </div>
              <div class="mt-2 flex items-center justify-between text-xs font-semibold" :class="hover === passado.id ? 'text-violet-300' : 'text-zinc-600'">
                <span>Escolher este passado</span>
                <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </button>
        </div>
      </template>

      <!-- ═══ Etapa 4: Atributos ═══ -->
      <template v-else-if="etapa === 4">
        <div class="mx-auto max-w-xl space-y-6">
          <div class="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 space-y-5">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-zinc-300">Distribuição de Pontos</p>
              <div class="text-sm font-bold" :class="pontosRestantes === 0 ? 'text-green-400' : pontosRestantes > 0 ? 'text-amber-400' : 'text-red-400'">
                {{ pontosRestantes }} restante{{ pontosRestantes !== 1 ? 's' : '' }}
              </div>
            </div>

            <div v-for="attr in ATRIBUTOS_CONFIG" :key="attr.key" class="space-y-2">
              <div class="flex items-center gap-3">
                <!-- Label + descrição -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-bold text-white">{{ attr.label }}</p>
                  <p class="text-[0.62rem] text-zinc-600 leading-snug truncate">{{ attr.descricao }}</p>
                </div>

                <!-- Controles (base) -->
                <div class="flex items-center gap-1.5">
                  <button type="button" @click="decrementarAtributo(attr.key)"
                    :disabled="atributos[attr.key] <= 0"
                    class="h-7 w-7 rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30 text-lg leading-none">−</button>
                  <span class="w-7 text-center text-sm font-bold" :class="attr.color">{{ atributos[attr.key] }}</span>
                  <button type="button" @click="incrementarAtributo(attr.key)"
                    :disabled="pontosRestantes <= 0"
                    class="h-7 w-7 rounded-lg border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-30 text-lg leading-none">+</button>
                </div>

                <!-- Bônus do passado -->
                <div v-if="passadoBonusPorAtributo[attr.key] !== 0" class="w-14 text-center">
                  <span class="text-xs font-semibold" :class="passadoBonusPorAtributo[attr.key] > 0 ? 'text-emerald-400' : 'text-red-400'">
                    {{ passadoBonusPorAtributo[attr.key] > 0 ? '+' : '' }}{{ passadoBonusPorAtributo[attr.key] }}
                  </span>
                  <p class="text-[0.55rem] text-zinc-600">passado</p>
                </div>
                <div v-else class="w-14" />

                <!-- Total -->
                <div class="w-12 text-center">
                  <span class="text-sm font-bold text-white">{{ atributos[attr.key] + passadoBonusPorAtributo[attr.key] }}</span>
                  <p class="text-[0.55rem] text-zinc-600">total</p>
                </div>
              </div>
              <div class="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div class="h-full rounded-full transition-all duration-200" :class="attr.barColor" :style="{ width: `${(atributos[attr.key] / TOTAL_PONTOS) * 100}%` }" />
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 px-5 py-4 text-xs text-indigo-300/80 space-y-1">
            <p class="font-semibold text-indigo-300">Dica</p>
            <p>Atributos mais altos desbloqueiam bônus maiores em combate, magia e interações sociais. Todos os {{ TOTAL_PONTOS }} pontos devem ser alocados.</p>
          </div>

          <div v-if="erroEscolha" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroEscolha }}</div>

          <button type="button"
            :disabled="pontosRestantes !== 0 || salvando"
            class="w-full rounded-2xl bg-emerald-700 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="confirmarAtributos">
            {{ salvando ? 'Salvando...' : pontosRestantes === 0 ? 'Confirmar Atributos' : `Aloque mais ${pontosRestantes} ponto${pontosRestantes !== 1 ? 's' : ''}` }}
          </button>
        </div>
      </template>

      <!-- ═══ Etapa 5: Deuses ═══ -->
      <template v-else-if="etapa === 5">
        <div class="mb-6 text-center">
          <p v-if="classeRequerDeus" class="text-xs text-amber-400 font-semibold">⚠ Sua classe exige que você escolha um deus patrono.</p>
          <p v-else class="text-xs text-zinc-500">Esta etapa é opcional. Você pode pular se preferir.</p>
        </div>

        <div v-if="!deuses.length" class="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center">
          <p class="text-zinc-500">Nenhum deus cadastrado pelo mestre ainda.</p>
        </div>
        <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <button v-for="deus in deuses" :key="deus.id" type="button"
            class="onboarding-card group relative overflow-hidden rounded-3xl border text-left transition-all duration-300"
            :class="hover === deus.id ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_0_40px_rgb(245_158_11/0.12)]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'"
            @mouseenter="hover = deus.id" @mouseleave="hover = null" @click="confirmarDeus(Number(deus.id))">
            <div class="relative h-44 overflow-hidden">
              <img v-if="deus.imageUrl" :src="deus.imageUrl" :alt="deus.name" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div v-else class="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-900/40 to-orange-900/40 text-6xl">⚡</div>
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div v-if="deus.indole" class="absolute bottom-3 left-3">
                <span class="rounded-full border border-amber-500/40 bg-amber-950/70 px-2.5 py-0.5 text-[0.65rem] font-semibold text-amber-300">{{ deus.indole }}</span>
              </div>
            </div>
            <div class="p-5">
              <h3 class="mb-0.5 text-base font-bold text-zinc-100 group-hover:text-white">{{ deus.name }}</h3>
              <p v-if="deus.title" class="mb-2 text-xs text-amber-400/70 italic">{{ deus.title }}</p>
              <p v-if="deus.shortDescription" class="line-clamp-2 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400">{{ deus.shortDescription }}</p>
              <div class="mt-3 flex items-center justify-between text-xs font-semibold" :class="hover === deus.id ? 'text-amber-300' : 'text-zinc-600'">
                <span>Escolher este deus</span>
                <svg class="h-4 w-4 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </div>
          </button>
        </div>

        <div class="mt-8 text-center" v-if="!classeRequerDeus">
          <button type="button" :disabled="salvando"
            class="rounded-xl border border-white/10 px-8 py-2.5 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
            @click="confirmarDeus(null)">
            {{ salvando ? 'Aguarde...' : 'Pular esta etapa' }}
          </button>
        </div>
        <div v-if="erroEscolha" class="mt-4 text-center text-sm text-red-400">{{ erroEscolha }}</div>
      </template>

      <!-- ═══ Etapa 6: Equipamentos ═══ -->
      <template v-else-if="etapa === 6">
        <div class="mx-auto max-w-2xl space-y-5">
          <!-- Barra de peso -->
          <div class="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-zinc-300">Capacidade de Carga</p>
              <p class="text-sm font-bold" :class="pesoUsado > pesoMaximo ? 'text-red-400' : 'text-emerald-400'">
                {{ pesoUsado.toFixed(1) }} / {{ pesoMaximo.toFixed(1) }} kg
              </p>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
              <div class="h-full rounded-full transition-all duration-300"
                :class="pesoUsado > pesoMaximo ? 'bg-red-500' : pesoUsado === pesoMaximo ? 'bg-amber-500' : 'bg-emerald-500'"
                :style="{ width: `${Math.min((pesoUsado / Math.max(pesoMaximo, 0.1)) * 100, 100)}%` }" />
            </div>
            <p class="text-xs text-zinc-600">
              Força: {{ atributos.forca }} base{{ passadoBonusPorAtributo.forca !== 0 ? ` ${passadoBonusPorAtributo.forca > 0 ? '+' : ''}${passadoBonusPorAtributo.forca} passado = ${atributos.forca + passadoBonusPorAtributo.forca} total` : '' }} → capacidade = {{ atributos.forca + passadoBonusPorAtributo.forca }} × 2 = {{ pesoMaximo }} kg
            </p>
          </div>

          <!-- Lista de itens selecionados -->
          <div v-if="equipamentosSelecionados.length" class="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 space-y-2">
            <p class="text-xs font-bold uppercase tracking-widest text-emerald-400/80 mb-2">Itens selecionados</p>
            <div v-for="item in equipamentosSelecionados" :key="item.id" class="flex items-center justify-between text-sm">
              <span class="text-zinc-300">{{ item.nome }}</span>
              <div class="flex items-center gap-3 text-xs text-zinc-500">
                <span>{{ item.peso }} kg</span>
                <button type="button" @click="removerEquipamento(item.id)" class="text-red-400/70 hover:text-red-400">✕</button>
              </div>
            </div>
          </div>

          <!-- Catálogo -->
          <div class="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
            <div class="p-4 border-b border-white/[0.06]">
              <input v-model="buscaEquipamento" type="text" placeholder="Buscar equipamento..."
                class="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white placeholder-zinc-600 outline-none focus:border-indigo-500/50" />
            </div>
            <div class="max-h-80 overflow-y-auto">
              <div v-if="!equipamentosFiltrados.length" class="py-8 text-center text-sm text-zinc-600 italic">
                {{ buscaEquipamento ? 'Nenhum item encontrado.' : 'Nenhum equipamento cadastrado.' }}
              </div>
              <button v-for="item in equipamentosFiltrados" :key="item.id" type="button"
                class="flex w-full items-center justify-between px-5 py-3 text-left text-sm transition-colors hover:bg-white/[0.04]"
                :class="jaSelecionado(item.id) ? 'opacity-40 cursor-not-allowed' : (item.peso ?? 0) + pesoUsado > pesoMaximo && !jaSelecionado(item.id) ? 'opacity-40 cursor-not-allowed' : ''"
                :disabled="jaSelecionado(item.id) || ((!jaSelecionado(item.id)) && (item.peso ?? 0) + pesoUsado > pesoMaximo)"
                @click="adicionarEquipamento(item)">
                <div>
                  <p class="font-medium text-zinc-200">{{ item.nome }}</p>
                  <p v-if="item.descricao_equipamento" class="text-xs text-zinc-600 truncate max-w-xs">{{ item.descricao_equipamento }}</p>
                </div>
                <div class="flex items-center gap-3 shrink-0 ml-3">
                  <span class="text-xs text-zinc-500">{{ item.peso != null ? `${item.peso} kg` : '— kg' }}</span>
                  <span v-if="jaSelecionado(item.id)" class="text-xs text-emerald-400 font-semibold">✓</span>
                </div>
              </button>
            </div>
          </div>

          <div v-if="erroEscolha" class="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-3 text-sm text-red-400">{{ erroEscolha }}</div>

          <div class="flex gap-3">
            <button type="button" :disabled="salvando"
              class="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-zinc-400 transition-colors hover:border-white/20 hover:text-white disabled:opacity-50"
              @click="confirmarEquipamentos(true)">
              {{ salvando ? 'Salvando...' : 'Pular equipamentos' }}
            </button>
            <button type="button" :disabled="salvando || pesoUsado > pesoMaximo"
              class="flex-1 rounded-2xl bg-indigo-700 py-3 text-sm font-bold text-white transition-colors hover:bg-indigo-600 disabled:opacity-50"
              @click="confirmarEquipamentos(false)">
              {{ salvando ? 'Salvando...' : 'Confirmar e Entrar' }}
            </button>
          </div>
        </div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { listarRacasPublicas, type RacaApi } from '@/lib/api/racas.api'
import { listarClasses, type ClasseApi } from '@/lib/api/classes.api'
import { listarPassados, type PassadoApi, type AtributoBonus } from '@/lib/api/passados.api'
import { listPublicGods } from '@/lib/api/gods.api'
import { listarArmasPublicas, type ArmaApi } from '@/lib/api/armas.api'
import {
  escolherRaca, escolherClasseInicial, escolherPassado,
  definirAtributos, escolherDeus, concluirOnboarding,
  getCharacterById,
} from '@/lib/api/personagens.api'
import { obterMetaAuthLocal } from '@/stores/auth'
import type { PersonagemApi, GodApi } from '@/types/supabase'

const router = useRouter()
const route  = useRoute()

// ── Estado geral ─────────────────────────────────────────────────────────────
const etapa      = ref<1|2|3|4|5|6>(1)
const carregando = ref(true)
const confirmando = ref(false)
const salvando   = ref(false)
const erroEscolha = ref('')
const hover      = ref<string | number | null>(null)

// Dados
const personagem  = ref<PersonagemApi | null>(null)
const racas       = ref<RacaApi[]>([])
const classes     = ref<ClasseApi[]>([])
const passados    = ref<PassadoApi[]>([])
const deuses      = ref<GodApi[]>([])
const equipamentos = ref<ArmaApi[]>([])

// Seleções
const racaSelecionada    = ref<RacaApi | null>(null)
const classeSelecionada  = ref<ClasseApi | null>(null)
const passadoSelecionado = ref<PassadoApi | null>(null)

// Atributos
const TOTAL_PONTOS = 10

const ATRIBUTOS_BONUS_CONFIG = [
  { key: 'aura' as const,         label: 'Aura' },
  { key: 'forca' as const,        label: 'Força' },
  { key: 'destreza' as const,     label: 'Destreza' },
  { key: 'resistencia' as const,  label: 'Resistência' },
  { key: 'inteligencia' as const, label: 'Inteligência' },
]

const ATRIBUTOS_CONFIG = [
  { key: 'aura',        label: 'Aura',        descricao: 'Carisma e imagem social — bônus em testes sociais',   color: 'text-pink-400',   barColor: 'bg-pink-500' },
  { key: 'forca',       label: 'Força',       descricao: 'Capacidade de carga e força nos ataques contundentes', color: 'text-orange-400', barColor: 'bg-orange-500' },
  { key: 'destreza',    label: 'Destreza',    descricao: 'Agilidade, reflexo e esquiva',                         color: 'text-green-400',  barColor: 'bg-green-500' },
  { key: 'resistencia', label: 'Resistência', descricao: 'Vigor e resistência a danos físicos e mágicos',        color: 'text-blue-400',   barColor: 'bg-blue-500' },
  { key: 'inteligencia',label: 'Inteligência',descricao: 'Mana, perícias e capacidade mágica',                   color: 'text-violet-400', barColor: 'bg-violet-500' },
] as const

const atributos = reactive({ aura: 0, forca: 0, destreza: 0, resistencia: 0, inteligencia: 0 })
const pontosUsados  = computed(() => Object.values(atributos).reduce((a, b) => a + b, 0))
const pontosRestantes = computed(() => TOTAL_PONTOS - pontosUsados.value)

const passadoBonusPorAtributo = computed(() => {
  const b = passadoSelecionado.value?.atributo_bonus as any
  return {
    aura:         Number(b?.aura         ?? 0),
    forca:        Number(b?.forca        ?? 0),
    destreza:     Number(b?.destreza     ?? 0),
    resistencia:  Number(b?.resistencia  ?? 0),
    inteligencia: Number(b?.inteligencia ?? 0),
  }
})

function temBonusAtributo(passado: PassadoApi): boolean {
  if (!passado.atributo_bonus) return false
  return Object.values(passado.atributo_bonus).some(v => v !== 0)
}

// Equipamentos
const equipamentosSelecionados = ref<{id: string; nome: string; peso: number}[]>([])
const buscaEquipamento = ref('')
const pesoMaximo = computed(() => (atributos.forca + passadoBonusPorAtributo.value.forca) * 2)
const pesoUsado  = computed(() => equipamentosSelecionados.value.reduce((s, e) => s + e.peso, 0))
const equipamentosFiltrados = computed(() =>
  equipamentos.value.filter(e =>
    e.peso != null &&
    (!buscaEquipamento.value || e.nome.toLowerCase().includes(buscaEquipamento.value.toLowerCase()))
  )
)

// Deus
const classeRequerDeus = computed(() =>
  classeSelecionada.value ? !!(classeSelecionada.value as any).requer_deus : false
)

// Stepper
const stepperSteps = [
  { etapa: 1, id: 'raca',         label: 'Raça',         bgColor: 'bg-indigo-600',  textColor: 'text-indigo-300' },
  { etapa: 2, id: 'classe',       label: 'Classe',       bgColor: 'bg-cyan-700',    textColor: 'text-cyan-300' },
  { etapa: 3, id: 'passado',      label: 'Passado',      bgColor: 'bg-violet-700',  textColor: 'text-violet-300' },
  { etapa: 4, id: 'atributos',    label: 'Atributos',    bgColor: 'bg-emerald-700', textColor: 'text-emerald-300' },
  { etapa: 5, id: 'deuses',       label: 'Deuses',       bgColor: 'bg-amber-700',   textColor: 'text-amber-300' },
  { etapa: 6, id: 'equipamentos', label: 'Equipamentos', bgColor: 'bg-indigo-700',  textColor: 'text-indigo-300' },
]

const subtituloEtapa = computed(() => {
  const map: Record<number, string> = {
    1: 'Escolha a raça que define sua história',
    2: 'Escolha a classe que define seu caminho',
    3: 'Escolha o passado que moldou sua origem',
    4: 'Distribua seus pontos de atributo',
    5: 'Escolha seu deus patrono',
    6: 'Escolha seu equipamento inicial',
  }
  return map[etapa.value] ?? ''
})

// ── Carregar dados ────────────────────────────────────────────────────────────
async function carregar() {
  carregando.value = true
  try {
    const meta = obterMetaAuthLocal()
    const characterId = String(route.query.characterId ?? meta?.idPersonagemAtivo ?? '')
    if (!characterId) { router.replace({ name: 'login' }); return }

    const [racasData, classesData, passadosData, deusesData, equipsData, personagemData] = await Promise.all([
      listarRacasPublicas(),
      listarClasses(),
      listarPassados(),
      listPublicGods(),
      listarArmasPublicas(),
      getCharacterById(characterId, false),
    ])

    if ((personagemData as any).onboardingCompleto) {
      router.replace({ name: 'dashboard', query: { characterId } })
      return
    }

    racas.value       = racasData
    classes.value     = classesData
    passados.value    = passadosData
    deuses.value      = deusesData
    equipamentos.value = equipsData
    personagem.value  = personagemData

    // Resgatar classe selecionada para requer_deus
    const charClasseId = (personagemData as any).classeId
    if (charClasseId) {
      classeSelecionada.value = classesData.find(c => Number(c.id) === Number(charClasseId)) ?? null
    }

    // Resgatar passado selecionado para bônus de atributos
    const charPassadoId = (personagemData as any).passadoId
    if (charPassadoId) {
      passadoSelecionado.value = passadosData.find(p => Number(p.id) === Number(charPassadoId)) ?? null
    }

    // Determinar etapa inicial
    const p = personagemData as any
    if (p.racaId == null)         etapa.value = 1
    else if (p.classeId == null)  etapa.value = 2
    else if (p.passadoId == null) etapa.value = 3
    else if (p.data?.atributos == null) {
      etapa.value = 4
    } else {
      // Restaurar atributos salvos
      Object.assign(atributos, p.data.atributos)
      if (!p.data?.deusEtapaConcluida) etapa.value = 5
      else etapa.value = 6
    }
  } catch {
    router.replace({ name: 'login' })
  } finally {
    carregando.value = false
  }
}

// ── Atributos helpers ─────────────────────────────────────────────────────────
function incrementarAtributo(key: keyof typeof atributos) {
  if (pontosRestantes.value > 0) atributos[key]++
}
function decrementarAtributo(key: keyof typeof atributos) {
  if (atributos[key] > 0) atributos[key]--
}

// ── Equipamentos helpers ──────────────────────────────────────────────────────
function jaSelecionado(id: string) {
  return equipamentosSelecionados.value.some(e => e.id === id)
}
function adicionarEquipamento(item: ArmaApi) {
  if (jaSelecionado(item.id)) return
  const peso = item.peso ?? 0
  if (pesoUsado.value + peso > pesoMaximo.value) return
  equipamentosSelecionados.value.push({ id: item.id, nome: item.nome, peso })
}
function removerEquipamento(id: string) {
  equipamentosSelecionados.value = equipamentosSelecionados.value.filter(e => e.id !== id)
}

// ── Seleções ──────────────────────────────────────────────────────────────────
function selecionarRaca(raca: RacaApi) {
  racaSelecionada.value = raca
  confirmando.value     = true
  erroEscolha.value     = ''
}

function selecionarClasse(cls: ClasseApi) {
  classeSelecionada.value = cls
  confirmando.value       = true
  erroEscolha.value       = ''
}

function selecionarPassado(passado: PassadoApi) {
  passadoSelecionado.value = passado
  confirmando.value        = true
  erroEscolha.value        = ''
}

// ── Confirmações ──────────────────────────────────────────────────────────────
async function confirmarRaca() {
  if (!racaSelecionada.value || !personagem.value) return
  salvando.value = true; erroEscolha.value = ''
  try {
    await escolherRaca((personagem.value as any).characterId, Number(racaSelecionada.value.id))
    confirmando.value = false
    etapa.value = 2
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao confirmar raça.'
  } finally { salvando.value = false }
}

async function confirmarClasse() {
  if (!classeSelecionada.value || !personagem.value) return
  salvando.value = true; erroEscolha.value = ''
  try {
    await escolherClasseInicial((personagem.value as any).characterId, Number(classeSelecionada.value.id))
    confirmando.value = false
    etapa.value = 3
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao confirmar classe.'
  } finally { salvando.value = false }
}

async function confirmarPassado() {
  if (!passadoSelecionado.value || !personagem.value) return
  salvando.value = true; erroEscolha.value = ''
  try {
    await escolherPassado((personagem.value as any).characterId, Number(passadoSelecionado.value.id))
    confirmando.value = false
    etapa.value = 4
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao confirmar passado.'
  } finally { salvando.value = false }
}

async function confirmarAtributos() {
  if (pontosRestantes.value !== 0 || !personagem.value) return
  salvando.value = true; erroEscolha.value = ''
  try {
    await definirAtributos((personagem.value as any).characterId, { ...atributos })
    etapa.value = 5
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar atributos.'
  } finally { salvando.value = false }
}

async function confirmarDeus(deusId: number | null) {
  if (!personagem.value) return
  salvando.value = true; erroEscolha.value = ''
  try {
    await escolherDeus((personagem.value as any).characterId, deusId)
    etapa.value = 6
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao salvar deus.'
  } finally { salvando.value = false }
}

async function confirmarEquipamentos(pular: boolean) {
  if (!personagem.value) return
  salvando.value = true; erroEscolha.value = ''
  try {
    const itens = pular ? [] : equipamentosSelecionados.value.map(e => ({
      id: Number(e.id), nome: e.nome, peso: e.peso,
    }))
    await concluirOnboarding((personagem.value as any).characterId, itens)
    const characterId = String((personagem.value as any).characterId)
    router.replace({ name: 'dashboard', query: { characterId } })
  } catch (err: any) {
    erroEscolha.value = err?.response?.data?.message ?? err.message ?? 'Erro ao finalizar onboarding.'
    salvando.value = false
  }
}

onMounted(carregar)
</script>

<style scoped>
.onboarding-card {
  cursor: pointer;
}
.onboarding-card:focus-visible {
  outline: 2px solid rgb(99 102 241 / 0.6);
  outline-offset: 2px;
}
</style>

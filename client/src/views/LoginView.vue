<template>
  <div class="min-h-screen overflow-hidden relative">
    <div class="absolute inset-0 bg-cover bg-center" :style="estiloFundo" />
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/65 to-black/95" />

    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <!-- Botão voltar — só aparece quando em contexto de campanha -->
      <button
        v-if="campanhaSlug"
        type="button"
        class="absolute top-5 left-5 flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        @click="router.push({ name: 'worlds' })"
      >
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        Mundos
      </button>

      <div v-if="carregando" class="text-zinc-500 text-lg animate-pulse">Carregando...</div>

      <template v-else>
        <div class="text-center mb-16">
          <h1
            class="login-page-title text-6xl md:text-7xl font-bold tracking-wider drop-shadow-2xl"
          >
            {{ layout?.titulo ?? 'Caminho Sem Volta' }}
          </h1>
          <p class="text-zinc-400 mt-4 text-xl">
            {{ layout?.subtitulo ?? 'Escolha seu destino ou crie um novo heroi' }}
          </p>
        </div>

        <div
          v-if="sessaoExpirada && !notificacaoFechada"
          class="notificacao-sessao relative w-full max-w-4xl mb-10 rounded-3xl border backdrop-blur-md shadow-2xl shadow-black/30 overflow-hidden"
        >
          <div class="h-1 w-full bg-gradient-to-r from-red-500 via-[#6B4E9E] to-indigo-300" />
          <div class="px-6 py-5 md:px-8 md:py-6">
            <button
              @click="notificacaoFechada = true"
              class="notificacao-fechar absolute top-4 right-4 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
              aria-label="Fechar notificacao"
            >
              ✕
            </button>
            <p class="notificacao-label text-xs uppercase tracking-[0.35em] mb-2">Sessao expirada</p>
            <h2 class="notificacao-titulo text-2xl md:text-3xl font-bold">Faca login novamente</h2>
            <p class="notificacao-corpo mt-3 leading-relaxed">
              Sua sessao ativa atingiu o limite de 24 horas. Escolha novamente o personagem e
              informe e-mail e senha para continuar.
            </p>
          </div>
        </div>

        <div class="w-full max-w-6xl">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div
              @click="abrirLoginMestre"
              :class="[
                'group relative bg-[#1E1A0E]/90 border border-amber-600/50 rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col',
                algumCarregamento
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl hover:border-amber-400 active:scale-[0.98]',
              ]"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="avatarUrlMestre"
                  :src="avatarUrlMestre"
                  class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                  alt="Game Master"
                />
                <div v-else class="w-full h-full bg-[#2B210A] flex items-center justify-center">
                  <span class="text-4xl font-bold text-amber-500/80">GM</span>
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>

              <div class="p-4 bg-black/80 border-t border-amber-700/30">
                <h3 class="font-semibold text-amber-200 text-base line-clamp-1">Game Master</h3>
                <p class="text-amber-400 text-sm mt-1">Acesso Mestre</p>
              </div>
            </div>

            <div
              v-for="char in personagens"
              :key="char.characterId"
              @click="abrirLogin(char)"
              :class="[
                'login-character-card group relative border rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col',
                algumCarregamento
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl active:scale-[0.98]',
              ]"
            >
              <div class="flex-1 relative overflow-hidden">
                <img
                  v-if="char.avatarUrl"
                  :src="char.avatarUrl"
                  class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                  :alt="char.name"
                />
                <div
                  v-else
                  class="login-character-fallback w-full h-full flex items-center justify-center"
                >
                  <span class="login-character-fallback-text text-3xl font-semibold"
                    >SEM AVATAR</span
                  >
                </div>
              </div>

              <div class="login-character-footer p-4">
                <h3 class="login-character-title font-semibold text-base line-clamp-1">
                  {{ char.name }}
                </h3>
                <p class="login-character-subtitle text-sm mt-1">
                  Nv. {{ char.level }}
                  <span v-if="char.classe"> • {{ char.classe }}</span>
                </p>
              </div>
            </div>

            <div
              @click="mostrarModalCriacao = true"
              :class="[
                'login-create-card group relative border rounded-3xl overflow-hidden transition-all duration-300 aspect-[4/5] flex flex-col items-center justify-center gap-4',
                algumCarregamento
                  ? 'cursor-wait opacity-60 pointer-events-none'
                  : 'cursor-pointer hover:-translate-y-3 hover:shadow-2xl active:scale-[0.98]',
              ]"
            >
              <div
                class="login-create-icon w-16 h-16 rounded-2xl border-4 flex items-center justify-center transition-all text-4xl"
              >
                +
              </div>
              <div class="text-center">
                <p class="login-create-title font-semibold text-lg tracking-wide">Criar Novo</p>
                <p class="login-create-subtitle text-sm">Personagem</p>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal de login de personagem -->
    <Modal
      v-if="personagemSelecionado"
      panel-class="max-w-md login-themed-modal"
      body-class="p-0"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModalLoginPersonagem"
    >
      <div
        class="login-modal-hero relative h-52 overflow-hidden"
        :class="{ 'has-avatar': !!personagemSelecionado.avatarUrl }"
      >
        <img
          v-if="personagemSelecionado.avatarUrl"
          ref="heroImgRef"
          :src="personagemSelecionado.avatarUrl"
          class="h-full w-full object-cover transition-[object-position] duration-500"
          :style="{ objectPosition: heroImagePosition }"
          :alt="personagemSelecionado.name"
          @load="analisarHeroImage(heroImgRef)"
        />
        <div
          v-else
          class="login-modal-hero-fallback flex h-full w-full items-center justify-center text-3xl font-semibold"
        >
          SEM AVATAR
        </div>

        <div class="login-modal-hero-overlay absolute inset-0" />

        <div class="absolute bottom-4 left-6 right-14">
          <h2 class="login-modal-hero-name text-2xl font-bold leading-tight">
            {{ personagemSelecionado.name }}
          </h2>
          <p class="login-modal-hero-subtitle mt-2 text-sm">
            Nv. {{ personagemSelecionado.level }} •
            {{ personagemSelecionado.classe ?? 'Sem Classe' }}
          </p>
        </div>

        <button
          @click="fecharModalLoginPersonagem"
          :disabled="carregandoLoginPersonagem"
          class="login-modal-hero-close action-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          ✕
        </button>
      </div>

      <div class="login-modal-form space-y-5 p-8">
        <p class="login-modal-muted text-center text-sm">
          Insira suas credenciais para entrar como este personagem
        </p>

        <div class="space-y-1">
          <label class="login-modal-label block text-sm">Nome de usuario</label>
          <input
            v-model="usernameLoginPersonagem"
            type="text"
            autocomplete="username"
            class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
            placeholder="seu_usuario"
            @keydown.enter="logarPersonagem"
          />
        </div>

        <div class="space-y-1">
          <label class="login-modal-label block text-sm">Senha</label>
          <input
            v-model="senhaLoginPersonagem"
            type="password"
            autocomplete="current-password"
            class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
            placeholder="••••••••"
            @keydown.enter="logarPersonagem"
          />
        </div>

        <p v-if="erroLoginPersonagem" class="text-center text-sm text-red-400">
          {{ erroLoginPersonagem }}
        </p>

        <button
          @click="logarPersonagem"
          :disabled="carregandoLoginPersonagem"
          class="login-modal-submit action-btn w-full rounded-2xl py-4 font-semibold transition-colors disabled:cursor-wait disabled:opacity-50"
        >
          {{ carregandoLoginPersonagem ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </Modal>

    <!-- Modal de login do mestre -->
    <Modal
      v-if="mostrarModalLoginMestre"
      panel-class="max-w-md login-themed-modal"
      body-class="space-y-5 p-8"
      header-class="px-8 py-6 text-center"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModalLoginMestre"
    >
      <template #header>
        <div>
          <h2 class="login-modal-title-blue text-3xl font-bold">Game Master</h2>
          <p class="login-modal-muted mt-2 text-sm">Acesso mestre para todos os personagens</p>
        </div>
      </template>

      <div class="space-y-1">
        <label class="login-modal-label block text-sm">E-mail</label>
        <input
          v-model="emailMestre"
          type="email"
          autocomplete="email"
          class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
          placeholder="mestre@email.com"
          @keydown.enter="logarMestre"
        />
      </div>

      <div class="space-y-1">
        <label class="login-modal-label block text-sm">Senha</label>
        <input
          v-model="senhaMestre"
          type="password"
          autocomplete="current-password"
          class="login-modal-input w-full rounded-2xl border px-5 py-3 outline-none transition-colors"
          placeholder="••••••••"
          @keydown.enter="logarMestre"
        />
      </div>

      <p v-if="erroMestre" class="text-center text-sm text-red-400">{{ erroMestre }}</p>

      <div class="grid grid-cols-2 gap-3">
        <button
          @click="fecharModalLoginMestre"
          :disabled="carregandoMestre"
          class="login-modal-cancel-btn action-btn rounded-2xl border py-3 transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          Cancelar
        </button>
        <button
          @click="logarMestre"
          :disabled="carregandoMestre"
          class="login-modal-submit action-btn rounded-2xl py-3 font-semibold transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          {{ carregandoMestre ? 'Entrando...' : 'Entrar' }}
        </button>
      </div>
    </Modal>

    <!-- Modal de criação de personagem -->
    <Modal
      v-if="mostrarModalCriacao"
      overlay-class="bg-black/90"
      panel-class="max-w-2xl max-h-[95vh] flex flex-col login-themed-modal relative"
      body-class="custom-scroll flex-1 space-y-8 overflow-y-auto p-8"
      header-class="shrink-0 px-8 py-4"
      footer-class="shrink-0 px-8 py-4"
      :show-close-button="false"
      :close-on-backdrop="false"
      @close="fecharModalCriacao"
    >
      <template #header>
        <h2 class="login-modal-title-blue text-2xl font-bold">
          {{ criacaoEnviada ? 'Solicitação Enviada' : 'Criar Novo Personagem' }}
        </h2>
        <button
          @click="fecharModalCriacao"
          :disabled="carregandoCriacao"
          aria-label="Fechar modal de criacao de personagem"
          class="login-modal-close-x action-btn absolute top-4 right-4 px-3 text-2xl transition-colors disabled:cursor-wait disabled:opacity-60"
        >
          ×
        </button>
      </template>

      <!-- Estado de sucesso -->
      <div
        v-if="criacaoEnviada"
        class="flex flex-col items-center justify-center gap-6 py-8 text-center"
      >
        <div class="text-6xl leading-none">⏳</div>
        <div>
          <h3 class="login-modal-text-main text-xl font-bold">Aguardando aprovação do mestre</h3>
          <p class="login-modal-muted mt-3 leading-relaxed">
            Sua solicitação foi enviada com sucesso. O mestre revisará suas informações e você
            será notificado quando o personagem for aprovado ou rejeitado.
          </p>
        </div>
        <button
          @click="fecharModalCriacao"
          class="login-modal-submit action-btn rounded-2xl px-8 py-3 font-semibold transition-colors"
        >
          Fechar
        </button>
      </div>

      <!-- Formulário -->
      <template v-else>
        <!-- Avatar -->
        <div>
          <label class="login-modal-label mb-3 block text-sm"
            >Avatar do Personagem <span class="text-red-400">*</span></label
          >
          <div
            class="login-create-dropzone relative flex h-80 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all"
            :class="[
              carregandoCriacao
                ? 'cursor-wait opacity-70 pointer-events-none'
                : 'cursor-pointer active:scale-[0.995]',
              { 'login-create-dropzone-dragging': arrastando },
            ]"
            @dragover.prevent="arrastando = true"
            @dragleave.prevent="arrastando = false"
            @drop.prevent="soltarArquivo"
            @click="acionarInputArquivo"
          >
            <input
              ref="inputArquivoCriacao"
              type="file"
              accept="image/*"
              class="hidden"
              @change="selecionarArquivo"
            />
            <div
              v-if="avatarPreviewUrl"
              class="relative flex h-full w-full items-center justify-center px-6"
            >
              <div
                class="login-create-preview relative aspect-square w-full max-w-[18rem] overflow-hidden rounded-2xl border"
              >
                <img :src="avatarPreviewUrl" class="h-full w-full object-cover" alt="preview" />
              </div>
              <button
                @click.stop="removerImagem"
                :disabled="carregandoCriacao"
                class="login-create-remove action-btn absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl disabled:cursor-wait disabled:opacity-60"
              >
                ✕
              </button>
            </div>
            <div v-else class="text-center">
              <p class="login-modal-text-main text-lg">Arraste ou clique para adicionar avatar</p>
              <p class="login-modal-muted mt-1 text-sm">PNG, JPG ou WEBP • Max 5MB</p>
            </div>
          </div>
        </div>

        <!-- Nome + Sobrenome -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="login-modal-label mb-2 block text-sm"
              >Nome <span class="text-red-400">*</span></label
            >
            <input
              v-model="nomePersonagem"
              type="text"
              class="login-modal-input w-full rounded-2xl border px-6 py-4 text-lg outline-none"
              placeholder="Ex: Elandor"
            />
          </div>
          <div>
            <label class="login-modal-label mb-2 block text-sm"
              >Sobrenome <span class="text-zinc-500">(opcional)</span></label
            >
            <input
              v-model="sobrenomePersonagem"
              type="text"
              class="login-modal-input w-full rounded-2xl border px-6 py-4 text-lg outline-none"
              placeholder="Ex: Templario"
            />
          </div>
        </div>

        <!-- Email + Username -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p class="login-modal-muted sm:col-span-2 text-xs">
            Use o e-mail liberado pelo mestre. Crie um usuario unico para fazer login.
          </p>
          <div class="sm:col-span-2">
            <label class="login-modal-label mb-2 block text-sm"
              >E-mail liberado pelo mestre <span class="text-red-400">*</span></label
            >
            <input
              v-model="emailContaCriacao"
              type="email"
              autocomplete="email"
              class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
              placeholder="email@cadastrado.com"
            />
          </div>
          <div class="sm:col-span-2">
            <label class="login-modal-label mb-2 block text-sm"
              >Nome de usuario (para login) <span class="text-red-400">*</span></label
            >
            <input
              v-model="usernameContaCriacao"
              type="text"
              autocomplete="username"
              class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
              placeholder="ex: hellsccythe (3-20 letras)"
            />
            <p class="mt-1 text-xs text-zinc-500">Apenas letras, numeros, _ e -.</p>
          </div>
        </div>

        <!-- Senha -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="login-modal-label mb-2 block text-sm"
              >Senha <span class="text-red-400">*</span></label
            >
            <input
              v-model="senhaContaCriacao"
              type="password"
              autocomplete="new-password"
              class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
              placeholder="Min. 8 letras"
            />
            <div class="mt-2 flex gap-1">
              <div
                v-for="n in 4"
                :key="n"
                class="h-1 flex-1 rounded-full transition-colors"
                :class="forcaSenha >= n ? forcaSenhaClasse : 'bg-zinc-700'"
              />
            </div>
            <p class="mt-1 text-xs text-zinc-500">Min. 8 letras, 1 maiuscula, 1 numero, 1 especial.</p>
          </div>
          <div>
            <label class="login-modal-label mb-2 block text-sm"
              >Confirmar senha <span class="text-red-400">*</span></label
            >
            <input
              v-model="confirmacaoSenha"
              type="password"
              autocomplete="new-password"
              class="login-modal-input w-full rounded-2xl border px-6 py-4 outline-none"
              placeholder="Repita sua senha"
            />
          </div>
        </div>

        <!-- Genero + Indole -->
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label class="login-modal-label mb-2 block text-sm"
              >Genero <span class="text-red-400">*</span></label
            >
            <VSelect
              id="create-character-genero"
              v-model="formularioCriacao.generoId"
              :options="opcoesGeneroSelect"
              aria-label="Selecionar genero do personagem"
              root-class="w-full"
              trigger-class="login-modal-input px-6 py-4 !rounded-2xl"
            />
          </div>
          <div>
            <label class="login-modal-label mb-2 block text-sm"
              >Indole <span class="text-red-400">*</span></label
            >
            <VSelect
              id="create-character-indole"
              v-model="formularioCriacao.indoleId"
              :options="opcoesIndoleSelect"
              aria-label="Selecionar indole do personagem"
              root-class="w-full"
              trigger-class="login-modal-input px-6 py-4 !rounded-2xl"
            />
          </div>
        </div>

        <!-- Aparencia fisica -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="login-modal-label text-sm"
              >Aparencia Fisica <span class="text-red-400">*</span></label
            >
            <span
              class="text-xs"
              :class="charsAparencia >= 100 ? 'text-green-400' : 'text-zinc-500'"
              >{{ charsAparencia }}/100 letras (sem espacos)</span
            >
          </div>
          <textarea
            v-model="formularioCriacao.aparencia"
            rows="4"
            class="login-modal-input min-h-[120px] w-full resize-y rounded-2xl border px-6 py-4 outline-none"
            placeholder="Descreva a aparencia fisica do personagem..."
          />
        </div>

        <!-- Historia -->
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="login-modal-label text-sm"
              >Historia do Personagem <span class="text-red-400">*</span></label
            >
            <span
              class="text-xs"
              :class="charsHistoria >= 1000 ? 'text-green-400' : 'text-zinc-500'"
              >{{ charsHistoria }}/1000 letras</span
            >
          </div>
          <div
            class="historia-preview login-modal-input min-h-[160px] w-full cursor-pointer rounded-2xl border px-6 py-4"
            :class="formularioCriacao.historia ? 'text-sm leading-relaxed' : 'italic text-zinc-500'"
            @click="abrirEditorHistoria"
            title="Clique para escrever a historia"
          >
            <span v-if="!formularioCriacao.historia">Clique aqui para escrever a historia do personagem...</span>
            <div v-else class="historia-preview-html" v-html="historiaHtml" />
          </div>
        </div>

        <!-- Documento (alternativa ao texto) -->
        <div>
          <label class="login-modal-label mb-2 block text-sm"
            >Documento da Historia
            <span class="text-zinc-500">(alternativa — Word ou PDF)</span></label
          >
          <div
            class="login-create-doczone rounded-2xl border-2 border-dashed p-8 text-center transition-colors"
            :class="
              carregandoCriacao
                ? 'cursor-wait opacity-70 pointer-events-none'
                : 'cursor-pointer active:scale-[0.995]'
            "
            @click="acionarInputDoc"
          >
            <input
              ref="inputDocCriacao"
              type="file"
              accept=".doc,.docx,.pdf"
              class="hidden"
              @change="selecionarDoc"
            />
            <div
              v-if="docSelecionadoCriacao"
              class="login-create-doc-selected flex items-center justify-center gap-2"
            >
              <span class="font-medium">{{ docSelecionadoCriacao.name }}</span>
            </div>
            <div v-else>
              <p class="login-modal-label">Clique para enviar documento</p>
              <p class="login-modal-muted mt-1 text-xs">.doc, .docx ou .pdf</p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div v-if="!criacaoEnviada" class="space-y-3">
          <p v-if="erroCriacao" class="text-sm text-red-400">{{ erroCriacao }}</p>
          <div class="flex justify-end gap-3">
            <button
              @click="fecharModalCriacao"
              :disabled="carregandoCriacao"
              class="login-modal-cancel-btn action-btn rounded-xl border px-6 py-2 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              @click="submeterCriacao"
              :disabled="envioDesabilitado"
              class="login-modal-submit action-btn rounded-xl px-7 py-2 font-medium transition-all disabled:cursor-wait disabled:opacity-60"
            >
              {{ carregandoCriacao ? 'Enviando...' : 'Enviar Solicitacao' }}
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <!-- ══ Modal editor de história ══════════════════════════════════════════ -->
    <Modal
      v-if="historiaEditorAberto"
      panel-class="max-w-3xl historia-editor-modal"
      body-class="p-0"
      :show-close-button="false"
      :close-on-backdrop="false"
      :close-on-esc="false"
      @close="historiaEditorAberto = false"
    >
      <!-- Toolbar -->
      <div class="editor-toolbar flex flex-wrap items-center gap-1 border-b px-4 py-2">
        <button type="button" class="editor-btn font-serif text-base font-bold" title="Titulo" @mousedown.prevent="formatDoc('formatBlock', 'h2')">T</button>
        <button type="button" class="editor-btn font-serif text-sm font-semibold" title="Subtitulo" @mousedown.prevent="formatDoc('formatBlock', 'h3')">t</button>
        <div class="h-5 w-px bg-white/20" />
        <button type="button" class="editor-btn font-bold" title="Negrito (Ctrl+B)" @mousedown.prevent="formatDoc('bold')"><strong>B</strong></button>
        <button type="button" class="editor-btn italic" title="Italico (Ctrl+I)" @mousedown.prevent="formatDoc('italic')"><em>I</em></button>
        <button type="button" class="editor-btn underline" title="Sublinhado (Ctrl+U)" @mousedown.prevent="formatDoc('underline')">U</button>
        <div class="h-5 w-px bg-white/20" />
        <button type="button" class="editor-btn" title="Lista com marcadores" @mousedown.prevent="formatDoc('insertUnorderedList')">• Lista</button>
        <button type="button" class="editor-btn" title="Lista numerada" @mousedown.prevent="formatDoc('insertOrderedList')">1. Lista</button>
        <div class="h-5 w-px bg-white/20" />
        <button type="button" class="editor-btn" title="Linha separadora" @mousedown.prevent="formatDoc('insertHorizontalRule')">—</button>
        <button type="button" class="editor-btn" title="Paragrafo normal" @mousedown.prevent="formatDoc('formatBlock', 'p')">¶</button>
        <div class="h-5 w-px bg-white/20" />
        <button type="button" class="editor-btn text-zinc-400" title="Desfazer (Ctrl+Z)" @mousedown.prevent="formatDoc('undo')">↩</button>
        <button type="button" class="editor-btn text-zinc-400" title="Refazer (Ctrl+Y)" @mousedown.prevent="formatDoc('redo')">↪</button>
        <div class="h-5 w-px bg-white/20" />
        <select
          class="editor-font-select"
          title="Fonte"
          @mousedown="saveSelection"
          @change="aplicarFonte(($event.target as HTMLSelectElement).value); ($event.target as HTMLSelectElement).value = ''"
        >
          <option value="" disabled selected>Fonte...</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Cinzel">Cinzel</option>
          <option value="EB Garamond">Garamond</option>
          <option value="Palatino Linotype">Palatino</option>
          <option value="Courier New">Courier</option>
        </select>

        <div class="ml-auto text-xs" :class="editorCharCount >= 1000 ? 'text-green-400' : 'text-zinc-500'">
          {{ editorCharCount }}/1000 letras
        </div>
      </div>

      <!-- Área de edição -->
      <div
        ref="editorRef"
        contenteditable="true"
        class="editor-content"
        @keydown="onEditorKeydown"
        @mouseup="saveSelection"
        @keyup="saveSelection"
        @input="onEditorInput"
      />

      <template #footer>
        <div class="flex items-center justify-between gap-3 px-1">
          <p class="text-xs text-zinc-500">Use Ctrl+B / Ctrl+I / Ctrl+U para formatar o texto selecionado.</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="login-modal-cancel-btn action-btn rounded-xl border px-5 py-2 text-sm transition-colors"
              @click="historiaEditorAberto = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="login-modal-submit action-btn rounded-xl px-6 py-2 text-sm font-medium transition-all"
              @click="confirmarHistoria"
            >
              Confirmar
            </button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import VSelect from '@/components/VSelect.vue'
import { useAuthStore } from '@/stores/auth'
import { useCharactersStore } from '@/stores/characters'
import { useSmartImageFocus } from '@/composables/useSmartImageFocus'
import {
  submeterSolicitacaoCriacao,
  uploadAvatarCriacao,
  uploadHistoriaDoc,
} from '@/lib/api/character-creation-requests.api'
import { listarIndole } from '@/lib/api/indole.api'
import { listarGeneros } from '@/lib/api/genero.api'
import type { IndoleApi, GeneroApi, PersonagemPublicoApi } from '@/types/supabase'

const storePersonagens = useCharactersStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Contexto de campanha — preenchido quando a rota é /mundo/:slug
const campanhaSlug = computed(() => {
  const s = route.params.slug
  return typeof s === 'string' && s ? s : null
})
const campanhaId = ref<string | null>(null)

const mostrarModalCriacao = ref(false)
const personagemSelecionado = ref<PersonagemPublicoApi | null>(null)
const mostrarModalLoginMestre = ref(false)
const avatarUrlMestre = import.meta.env.VITE_GM_AVATAR_URL || ''

const heroImgRef = ref<HTMLImageElement | null>(null)
const { position: heroImageAutoPosition, analyzeImage: analisarHeroImage, reset: resetarHeroFoco } = useSmartImageFocus()

const heroImagePosition = computed(() =>
  personagemSelecionado.value?.modalHeroPosition || heroImageAutoPosition.value
)

watch(personagemSelecionado, (novo) => {
  if (!novo?.avatarUrl) { resetarHeroFoco(); return }
  if (novo.modalHeroPosition) return
  setTimeout(() => analisarHeroImage(heroImgRef.value), 50)
})

const usernameLoginPersonagem = ref('')
const senhaLoginPersonagem = ref('')
const carregandoLoginPersonagem = ref(false)
const erroLoginPersonagem = ref('')

const emailMestre = ref('')
const senhaMestre = ref('')
const carregandoMestre = ref(false)
const erroMestre = ref('')

const carregandoCriacao = ref(false)
const erroCriacao = ref('')
const criacaoEnviada = ref(false)
const emailContaCriacao = ref('')
const usernameContaCriacao = ref('')
const senhaContaCriacao = ref('')
const confirmacaoSenha = ref('')
const nomePersonagem = ref('')
const sobrenomePersonagem = ref('')
const arrastando = ref(false)
const avatarArquivoCriacao = ref<File | null>(null)
const avatarPreviewUrl = ref('')
const docSelecionadoCriacao = ref<File | null>(null)
const inputArquivoCriacao = ref<HTMLInputElement | null>(null)
const inputDocCriacao = ref<HTMLInputElement | null>(null)
const historiaEditorAberto = ref(false)
const historiaHtml = ref('')
const editorRef = ref<HTMLElement | null>(null)
const editorCharCount = ref(0)
let savedRange: Range | null = null
const formularioCriacao = ref({
  indoleId: null as number | null,
  generoId: null as number | null,
  aparencia: '',
  historia: '',
})

const opcoesIndole = ref<IndoleApi[]>([])
const opcoesGenero = ref<GeneroApi[]>([])

const opcoesIndoleSelect = computed(() =>
  opcoesIndole.value.map((i) => ({ value: i.id, label: i.descricao })),
)
const opcoesGeneroSelect = computed(() =>
  opcoesGenero.value.map((g) => ({ value: g.id, label: g.descricao })),
)

const personagens = computed(() => storePersonagens.publicCharacters)
const layout = computed(() => storePersonagens.layout)
const carregando = computed(() => storePersonagens.loading)
const sessaoExpirada = ref(false)
const notificacaoFechada = ref(false)

const estiloFundo = computed(() => {
  const img = layout.value?.backgroundImage ?? '/login-bg.jpg'
  return { backgroundImage: `url('${img}')` }
})

const algumCarregamento = computed(
  () => carregandoLoginPersonagem.value || carregandoMestre.value || carregandoCriacao.value,
)

const envioDesabilitado = computed(() => {
  if (carregandoCriacao.value) return true
  if (!nomePersonagem.value.trim()) return true
  if (!avatarArquivoCriacao.value) return true
  if (!usernameContaCriacao.value.trim()) return true
  if (!emailContaCriacao.value.trim()) return true
  if (!senhaContaCriacao.value) return true
  if (!confirmacaoSenha.value) return true
  const bypass = formularioCriacao.value.aparencia.includes('mas a bicicleta e azul') || formularioCriacao.value.historia.includes('mas a bicicleta e azul')
  if (!bypass && formularioCriacao.value.aparencia.replace(/\s/g, '').length < 100) return true
  const temHistoria = bypass || formularioCriacao.value.historia.length >= 1000
  const temDoc = !!docSelecionadoCriacao.value
  if (!temHistoria && !temDoc) return true
  return false
})

onMounted(async () => {
  if (route.query.reason === 'session-expired') {
    sessaoExpirada.value = true
    router.replace({ path: route.path, query: {} })
  }

  // Se é rota de campanha, resolve o campaign_id antes de carregar
  if (campanhaSlug.value) {
    try {
      const { buscarCampanhaPorSlug } = await import('@/lib/api/campanhas.api')
      const campanha = await buscarCampanhaPorSlug(campanhaSlug.value)
      campanhaId.value = campanha.id
    } catch {}
  }

  await storePersonagens.fetchPaginaInicial(campanhaSlug.value ?? undefined)
  listarIndole().then((data) => { opcoesIndole.value = data }).catch(() => {})
  listarGeneros().then((data) => { opcoesGenero.value = data }).catch(() => {})
})

function traduzirErroAuth(mensagem: string): string {
  const msg = mensagem.toLowerCase()
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'E-mail ou senha invalidos. Verifique suas credenciais.'
  }
  if (msg.includes('email not confirmed')) {
    return 'E-mail ainda nao confirmado. Verifique sua caixa de entrada e clique no link de confirmacao.'
  }
  if (msg.includes('user already registered') || msg.includes('already registered')) {
    return 'Este e-mail ja esta cadastrado.'
  }
  if (msg.includes('password should be') || msg.includes('password is too short')) {
    return 'A senha deve ter pelo menos 6 caracteres.'
  }
  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.'
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Falha de conexao. Verifique sua internet e tente novamente.'
  }
  return mensagem
}

function abrirLogin(char: PersonagemPublicoApi) {
  if (algumCarregamento.value) return

  if (authStore.podeReutilizarSessao(char.characterId)) {
    authStore.definirPersonagemAtivo(char.characterId)
    router.push({ name: 'dashboard', query: { characterId: char.characterId } })
    return
  }

  personagemSelecionado.value = char
  usernameLoginPersonagem.value = ''
  senhaLoginPersonagem.value = ''
  erroLoginPersonagem.value = ''
}

function fecharModalLoginPersonagem() {
  personagemSelecionado.value = null
  usernameLoginPersonagem.value = ''
  senhaLoginPersonagem.value = ''
  erroLoginPersonagem.value = ''
}

async function logarPersonagem() {
  if (!personagemSelecionado.value) return

  const username = usernameLoginPersonagem.value.trim().toLowerCase()
  if (!username || !senhaLoginPersonagem.value) {
    erroLoginPersonagem.value = 'Preencha usuario e senha.'
    return
  }

  carregandoLoginPersonagem.value = true
  erroLoginPersonagem.value = ''
  const idPersonagem = personagemSelecionado.value.characterId

  try {
    await authStore.entrar(`${username}@rpg.internal`, senhaLoginPersonagem.value, idPersonagem)
    fecharModalLoginPersonagem()
    router.push({ name: 'dashboard', query: { characterId: idPersonagem } })
  } catch (err: any) {
    erroLoginPersonagem.value = traduzirErroAuth(String(err?.message ?? '')) || 'Usuario ou senha invalidos.'
  } finally {
    carregandoLoginPersonagem.value = false
  }
}

function abrirLoginMestre() {
  if (algumCarregamento.value) return

  emailMestre.value = ''
  senhaMestre.value = ''
  erroMestre.value = ''
  mostrarModalLoginMestre.value = true
}

function fecharModalLoginMestre() {
  mostrarModalLoginMestre.value = false
  erroMestre.value = ''
}

async function logarMestre() {
  if (!emailMestre.value.trim() || !senhaMestre.value) {
    erroMestre.value = 'Preencha e-mail e senha.'
    return
  }

  carregandoMestre.value = true
  erroMestre.value = ''

  try {
    await authStore.entrar(emailMestre.value.trim(), senhaMestre.value, null, { comoMestre: true })
    fecharModalLoginMestre()
    router.push({ name: 'master-panel' })
  } catch (err: any) {
    erroMestre.value = traduzirErroAuth(String(err?.message ?? '')) || 'Credenciais invalidas. Tente novamente.'
  } finally {
    carregandoMestre.value = false
  }
}

const charsAparencia = computed(() => formularioCriacao.value.aparencia.replace(/\s/g, '').length)
const charsHistoria = computed(() => formularioCriacao.value.historia.length)
const forcaSenha = computed(() => {
  const s = senhaContaCriacao.value
  if (!s) return 0
  let pts = 0
  if (s.length >= 8) pts++
  if (/[A-Z]/.test(s)) pts++
  if (/[0-9]/.test(s)) pts++
  if (/[^a-zA-Z0-9]/.test(s)) pts++
  return pts
})
const forcaSenhaClasse = computed(() => {
  if (forcaSenha.value <= 1) return 'bg-red-500'
  if (forcaSenha.value === 2) return 'bg-orange-400'
  if (forcaSenha.value === 3) return 'bg-yellow-400'
  return 'bg-green-500'
})

async function comprimirImagem(file: File, maxPx = 800, q = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }))
        },
        'image/jpeg',
        q,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file) }
    img.src = url
  })
}

function acionarInputArquivo() {
  inputArquivoCriacao.value?.click()
}

async function processarImagemAvatar(file: File) {
  if (!file.type.startsWith('image/')) return
  if (file.size > 5 * 1024 * 1024) {
    erroCriacao.value = 'Imagem muito grande. Maximo 5MB.'
    return
  }
  const comprimida = await comprimirImagem(file)
  avatarArquivoCriacao.value = comprimida
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarPreviewUrl.value = URL.createObjectURL(comprimida)
  erroCriacao.value = ''
}

async function selecionarArquivo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) await processarImagemAvatar(file)
  input.value = ''
}

async function soltarArquivo(event: DragEvent) {
  arrastando.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) await processarImagemAvatar(file)
}

function removerImagem() {
  avatarArquivoCriacao.value = null
  if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
  avatarPreviewUrl.value = ''
}

function acionarInputDoc() {
  inputDocCriacao.value?.click()
}

function saveSelection() {
  const sel = window.getSelection()
  if (sel && sel.rangeCount > 0) {
    savedRange = sel.getRangeAt(0).cloneRange()
  }
}

function aplicarFonte(fontName: string) {
  if (!fontName) return
  editorRef.value?.focus()
  if (savedRange) {
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(savedRange)
  }
  document.execCommand('fontName', false, fontName)
}

function onEditorInput(event: Event) {
  const el = event.target as HTMLElement
  editorCharCount.value = el.innerText.replace(/\s/g, '').length
}

function abrirEditorHistoria() {
  if (!document.querySelector('link[data-editor-fonts]')) {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=EB+Garamond:ital,wght@0,400;0,700;1,400&display=swap'
    link.dataset.editorFonts = '1'
    document.head.appendChild(link)
  }
  historiaEditorAberto.value = true
  nextTick(() => {
    if (!editorRef.value) return
    editorRef.value.innerHTML = historiaHtml.value || ''
    editorCharCount.value = editorRef.value.innerText.replace(/\s/g, '').length
    editorRef.value.focus()
    const range = document.createRange()
    range.selectNodeContents(editorRef.value)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  })
}

const BLOCK_TAGS = new Set(['h1','h2','h3','h4','h5','h6','p','div','li','blockquote','pre'])

function blockTagAtCursor(): string | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  let node: Node | null = sel.getRangeAt(0).startContainer
  if (node.nodeType === Node.TEXT_NODE) node = node.parentElement
  while (node && node !== editorRef.value) {
    const tag = (node as Element).tagName?.toLowerCase()
    if (tag && BLOCK_TAGS.has(tag)) return tag
    node = (node as Element).parentElement
  }
  return null
}

function formatDoc(command: string, value?: string) {
  editorRef.value?.focus()
  if (command === 'formatBlock' && value && ['h2', 'h3'].includes(value)) {
    if (blockTagAtCursor() === value) {
      document.execCommand('formatBlock', false, 'p')
      return
    }
  }
  document.execCommand(command, false, value)
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey) {
    if (event.key === 'b') { event.preventDefault(); formatDoc('bold'); return }
    if (event.key === 'i') { event.preventDefault(); formatDoc('italic'); return }
    if (event.key === 'u') { event.preventDefault(); formatDoc('underline'); return }
    if (event.key === 'z') { event.preventDefault(); formatDoc('undo'); return }
    if (event.key === 'y') { event.preventDefault(); formatDoc('redo'); return }
  }

  if (event.key === 'Enter') {
    const tag = blockTagAtCursor()
    if (tag === 'h2' || tag === 'h3') {
      setTimeout(() => document.execCommand('formatBlock', false, 'p'), 0)
    }
  }
}

function confirmarHistoria() {
  if (editorRef.value) {
    historiaHtml.value = editorRef.value.innerHTML
    formularioCriacao.value.historia = editorRef.value.innerText
  }
  historiaEditorAberto.value = false
}

function selecionarDoc(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) docSelecionadoCriacao.value = file
  input.value = ''
}

function resetarFormulario() {
  nomePersonagem.value = ''
  sobrenomePersonagem.value = ''
  removerImagem()
  docSelecionadoCriacao.value = null
  historiaHtml.value = ''
  formularioCriacao.value = {
    indoleId: null,
    generoId: null,
    aparencia: '',
    historia: '',
  }
  erroCriacao.value = ''
  criacaoEnviada.value = false
  emailContaCriacao.value = ''
  usernameContaCriacao.value = ''
  senhaContaCriacao.value = ''
  confirmacaoSenha.value = ''
}

function fecharModalCriacao() {
  mostrarModalCriacao.value = false
  resetarFormulario()
}

async function submeterCriacao() {
  const nome = nomePersonagem.value.trim()
  if (!nome) { erroCriacao.value = 'Informe o nome do personagem.'; return }

  if (!avatarArquivoCriacao.value) { erroCriacao.value = 'Adicione um avatar para o personagem.'; return }

  const username = usernameContaCriacao.value.trim()
  if (!username) { erroCriacao.value = 'Informe o nome de usuario.'; return }
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    erroCriacao.value = 'Nome de usuario deve ter 3-30 caracteres (letras, numeros, _ ou -).'
    return
  }

  const email = emailContaCriacao.value.trim().toLowerCase()
  if (!email) { erroCriacao.value = 'Informe o e-mail liberado pelo mestre.'; return }

  const senha = senhaContaCriacao.value
  if (!senha || senha.length < 8) { erroCriacao.value = 'A senha deve ter pelo menos 8 caracteres.'; return }
  if (!/[A-Z]/.test(senha)) { erroCriacao.value = 'A senha deve ter pelo menos 1 letra maiuscula.'; return }
  if (!/[0-9]/.test(senha)) { erroCriacao.value = 'A senha deve ter pelo menos 1 numero.'; return }
  if (!/[^a-zA-Z0-9]/.test(senha)) { erroCriacao.value = 'A senha deve ter pelo menos 1 caractere especial.'; return }
  if (senha !== confirmacaoSenha.value) { erroCriacao.value = 'As senhas nao conferem.'; return }

  const aparencia = formularioCriacao.value.aparencia.trim()
  const historia = formularioCriacao.value.historia.trim()
  const bypass = aparencia.includes('mas a bicicleta e azul') || historia.includes('mas a bicicleta e azul')
  if (!bypass && aparencia.replace(/\s/g, '').length < 100) {
    erroCriacao.value = 'Aparencia fisica deve ter pelo menos 100 caracteres (sem espacos).'
    return
  }

  if (!bypass && historia.length < 1000 && !docSelecionadoCriacao.value) {
    erroCriacao.value = 'Historia deve ter pelo menos 1000 caracteres ou envie um documento.'
    return
  }

  carregandoCriacao.value = true
  erroCriacao.value = ''

  try {
    const { publicUrl: avatarUrl } = await uploadAvatarCriacao(avatarArquivoCriacao.value)

    let historiaDocUrl: string | undefined
    if (docSelecionadoCriacao.value) {
      const { publicUrl } = await uploadHistoriaDoc(docSelecionadoCriacao.value)
      historiaDocUrl = publicUrl
    }

    const nomeCompleto = sobrenomePersonagem.value.trim()
      ? `${nome} ${sobrenomePersonagem.value.trim()}`
      : nome

    await submeterSolicitacaoCriacao({
      nome: nomeCompleto,
      username,
      password: senha,
      email,
      avatarUrl,
      indoleId: formularioCriacao.value.indoleId,
      generoId: formularioCriacao.value.generoId,
      aparenciaFisica: aparencia,
      historiaTexto: historiaHtml.value || historia || undefined,
      historiaDocUrl,
      campaignId: campanhaId.value,
    })
    criacaoEnviada.value = true
  } catch (err: any) {
    const msg = String(err?.response?.data?.message ?? err?.message ?? '')
    if (/liberado|whitelist/i.test(msg)) {
      erroCriacao.value = 'Este e-mail nao foi liberado pelo mestre. Solicite a liberacao e tente novamente.'
    } else if (/username.*ja|usuario.*existe/i.test(msg)) {
      erroCriacao.value = 'Este nome de usuario ja esta em uso. Escolha outro.'
    } else {
      erroCriacao.value = msg || 'Erro ao enviar solicitacao. Tente novamente.'
    }
  } finally {
    carregandoCriacao.value = false
  }
}
</script>

<style scoped>
/* ── Preview de história ───────────────────────────────────────────────── */
.historia-preview {
  cursor: pointer;
  transition: border-color 0.15s;
  overflow: hidden;
  max-height: 180px;
}
.historia-preview:hover {
  border-color: rgb(139 92 246 / 0.5);
}
.historia-preview-html {
  pointer-events: none;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
}
.historia-preview-html :deep(h2) { font-size: 1rem; font-weight: 700; margin-bottom: 0.25rem; }
.historia-preview-html :deep(h3) { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.2rem; }
.historia-preview-html :deep(p) { margin-bottom: 0.25rem; }
.historia-preview-html :deep(ul), .historia-preview-html :deep(ol) { padding-left: 1.25rem; margin-bottom: 0.25rem; }

/* ── Editor de história ────────────────────────────────────────────────── */
:deep(.historia-editor-modal) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.editor-toolbar {
  background: rgb(0 0 0 / 0.35);
  border-color: rgb(255 255 255 / 0.08);
  flex-shrink: 0;
}

.editor-btn {
  min-width: 2rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.4rem;
  font-size: 0.8125rem;
  color: #d4d4d8;
  border: 1px solid transparent;
  transition: background 0.1s, border-color 0.1s;
  cursor: pointer;
}
.editor-btn:hover {
  background: rgb(255 255 255 / 0.1);
  border-color: rgb(255 255 255 / 0.12);
  color: #fff;
}

.editor-content {
  flex: 1;
  min-height: 360px;
  max-height: calc(90vh - 200px);
  overflow-y: auto;
  padding: 1.5rem 2rem;
  outline: none;
  font-size: 0.9375rem;
  line-height: 1.75;
  color: #e4e4e7;
  background: rgb(10 12 20 / 0.6);
  caret-color: #a78bfa;
}
.editor-content:empty::before {
  content: 'Comece a escrever a historia do seu personagem...';
  color: #52525b;
  pointer-events: none;
}
.editor-content :deep(h2) {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f4f4f5;
  margin: 1rem 0 0.4rem;
}
.editor-content :deep(h3) {
  font-size: 1rem;
  font-weight: 600;
  color: #d4d4d8;
  margin: 0.75rem 0 0.3rem;
}
.editor-content :deep(p) {
  margin-bottom: 0.6rem;
}
.editor-content :deep(ul), .editor-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
}
.editor-content :deep(li) {
  margin-bottom: 0.2rem;
}
.editor-content :deep(hr) {
  border: none;
  border-top: 1px solid rgb(255 255 255 / 0.15);
  margin: 1rem 0;
}
.editor-content :deep(strong) { color: #f4f4f5; }
.editor-content :deep(em) { color: #c4b5fd; }
.editor-content :deep(u) { text-decoration-color: rgb(167 139 250 / 0.5); }

/* ── Fontes aplicadas via execCommand('fontName') ── */
.editor-content :deep(font[face="Arial"]) { font-family: Arial, sans-serif; }
.editor-content :deep(font[face="Georgia"]) { font-family: Georgia, serif; }
.editor-content :deep(font[face="Cinzel"]) { font-family: 'Cinzel', serif; }
.editor-content :deep(font[face="EB Garamond"]) { font-family: 'EB Garamond', serif; }
.editor-content :deep(font[face="Palatino Linotype"]) { font-family: 'Palatino Linotype', Palatino, serif; }
.editor-content :deep(font[face="Courier New"]) { font-family: 'Courier New', monospace; }

/* ── Select de fonte ── */
.editor-font-select {
  height: 1.75rem;
  padding: 0 0.5rem;
  border-radius: 0.4rem;
  border: 1px solid rgb(255 255 255 / 0.1);
  background: rgb(0 0 0 / 0.4);
  color: #d4d4d8;
  font-size: 0.75rem;
  cursor: pointer;
  outline: none;
  transition: border-color 0.1s;
}
.editor-font-select:hover {
  border-color: rgb(255 255 255 / 0.2);
  color: #fff;
}
.editor-font-select option {
  background: #1a1a2e;
  color: #e4e4e7;
}

.action-btn {
  transition:
    transform 140ms ease,
    filter 140ms ease,
    opacity 140ms ease;
}

.action-btn:active:not(:disabled) {
  transform: scale(0.98);
  filter: brightness(0.96);
}

.login-page-title {
  color: var(--title-color);
}

.login-master-card {
  background: color-mix(in srgb, var(--bg-card) 88%, #3b2f10 12%);
  border-color: color-mix(in srgb, var(--brand-primary) 34%, #d4a017 66%);
}

.login-master-card:hover {
  border-color: color-mix(in srgb, var(--brand-primary) 40%, #fbbf24 60%);
}

.login-master-fallback {
  background: color-mix(in srgb, var(--bg-soft) 70%, #3b2f10 30%);
}

.login-master-fallback-text,
.login-master-title {
  color: color-mix(in srgb, #fbbf24 78%, var(--text-main) 22%);
}

.login-master-subtitle {
  color: color-mix(in srgb, #fcd34d 72%, var(--text-main) 28%);
}

.login-master-footer {
  background: color-mix(in srgb, var(--bg-card) 78%, #1f2937 22%);
  border-top-color: color-mix(in srgb, var(--border-soft) 56%, #fbbf24 44%);
}

.login-character-card {
  background: color-mix(in srgb, var(--bg-card) 88%, var(--bg-soft) 12%);
  border-color: color-mix(in srgb, var(--border-soft) 70%, var(--brand-primary) 30%);
}

.login-character-card:hover {
  border-color: var(--brand-primary);
}

.login-character-fallback {
  background: color-mix(in srgb, var(--bg-soft) 72%, #0f172a 28%);
}

.login-character-fallback-text {
  color: color-mix(in srgb, var(--text-main) 34%, transparent 66%);
}

.login-character-footer {
  background: color-mix(in srgb, var(--bg-card) 82%, #0f172a 18%);
}

.login-character-title {
  color: var(--text-main);
}

.login-character-subtitle {
  color: color-mix(in srgb, var(--brand-primary-strong) 72%, var(--text-main) 28%);
}

.login-create-card {
  background: color-mix(in srgb, var(--brand-primary) 56%, var(--bg-card) 44%);
  border-color: color-mix(in srgb, var(--brand-primary-strong) 62%, var(--border-soft) 38%);
}

.login-create-card:hover {
  background: color-mix(in srgb, var(--brand-primary-strong) 62%, var(--bg-card) 38%);
  border-color: color-mix(in srgb, var(--brand-primary-strong) 72%, #ffffff 28%);
}

.login-create-icon {
  border-color: rgb(255 255 255 / 0.56);
  color: rgb(255 255 255 / 0.92);
}

.login-create-title {
  color: rgb(255 255 255 / 0.96);
}

.login-create-subtitle {
  color: rgb(255 255 255 / 0.74);
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #991b1b;
  border-radius: 3px;
}

:deep(.login-themed-modal) {
  background-color: var(--bg-card) !important;
  border-color: var(--border-soft) !important;
  color: var(--text-main) !important;
}

:deep(.login-themed-modal input),
:deep(.login-themed-modal textarea),
:deep(.login-themed-modal select) {
  background-color: color-mix(in srgb, var(--bg-card) 88%, var(--bg-soft) 12%) !important;
  border-color: var(--border-soft) !important;
  color: var(--text-main) !important;
}

:deep(.login-themed-modal input::placeholder),
:deep(.login-themed-modal textarea::placeholder) {
  color: var(--text-muted) !important;
}

:deep(.login-themed-modal .bg-red-700),
:deep(.login-themed-modal .bg-red-600),
:deep(.login-themed-modal .bg-amber-700) {
  color: #ffffff !important;
}

:deep(.login-themed-modal .text-zinc-500),
:deep(.login-themed-modal .text-zinc-400) {
  color: var(--text-muted) !important;
}

:deep(.login-themed-modal .text-zinc-300),
:deep(.login-themed-modal .text-zinc-200),
:deep(.login-themed-modal .text-white) {
  color: var(--text-main) !important;
}

.login-modal-hero-name {
  color: var(--title-color) !important;
}

.login-modal-hero-subtitle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  padding: 0.28rem 0.78rem;
  border: 1px solid color-mix(in srgb, var(--border-soft) 82%, var(--text-main) 18%);
  border-radius: 999px;
  background: color-mix(in srgb, var(--bg-card) 84%, var(--bg-soft) 16%);
  color: color-mix(in srgb, var(--text-main) 72%, var(--bg-card) 28%) !important;
  font-weight: 600;
  line-height: 1.3;
}

.login-modal-hero {
  background-color: color-mix(in srgb, var(--bg-card) 86%, var(--bg-soft) 14%);
  border-bottom: 1px solid var(--border-soft);
}

.login-modal-hero-fallback {
  color: color-mix(in srgb, var(--text-main) 40%, transparent 60%);
}

.login-modal-hero-overlay {
  background: color-mix(in srgb, var(--bg-card) 68%, transparent 32%);
}

.login-modal-hero.has-avatar .login-modal-hero-overlay {
  background: rgb(2 6 23 / 0.48);
}

.login-modal-hero.has-avatar .login-modal-hero-name {
  color: color-mix(in srgb, var(--title-color) 82%, #ffffff 18%) !important;
  text-shadow: 0 2px 10px rgb(2 6 23 / 0.62);
}

.login-modal-hero.has-avatar .login-modal-hero-subtitle {
  border-color: rgb(255 255 255 / 0.22);
  background: rgb(15 23 42 / 0.44);
  color: rgb(248 250 252 / 0.98) !important;
  text-shadow: 0 2px 10px rgb(2 6 23 / 0.5);
  backdrop-filter: blur(3px);
}

.login-modal-hero-close {
  background-color: color-mix(in srgb, var(--bg-soft) 74%, transparent 26%);
  color: var(--text-muted);
  border: 1px solid color-mix(in srgb, var(--border-soft) 88%, transparent 12%);
}

.login-modal-hero-close:hover {
  background-color: color-mix(in srgb, var(--accent-soft) 86%, transparent 14%);
  color: var(--text-main);
}

.login-modal-form {
  color: var(--text-main);
}

.login-modal-muted,
.login-modal-label {
  color: color-mix(in srgb, var(--text-main) 68%, var(--bg-card) 32%) !important;
}

.login-modal-input {
  background-color: color-mix(in srgb, var(--bg-card) 96%, var(--bg-soft) 4%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 72%, var(--text-main) 28%) !important;
  color: var(--text-main) !important;
  font-weight: 500;
}

.login-modal-input:focus {
  border-color: var(--brand-primary) !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand-primary) 24%, transparent 76%);
}

.login-modal-input::placeholder {
  color: color-mix(in srgb, var(--text-main) 54%, var(--bg-card) 46%) !important;
  font-weight: 400;
}

.login-modal-submit {
  background-color: var(--brand-primary) !important;
  color: #ffffff !important;
}

.login-modal-submit:hover {
  background-color: var(--brand-primary-strong) !important;
}

.login-modal-cancel-btn {
  background-color: color-mix(in srgb, var(--bg-card) 92%, var(--bg-soft) 8%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 76%, var(--text-main) 24%) !important;
  color: var(--text-main) !important;
}

.login-modal-cancel-btn:hover {
  background-color: color-mix(in srgb, var(--accent-soft) 84%, var(--bg-card) 16%) !important;
}

.login-modal-title-blue {
  color: var(--title-color) !important;
}

.login-modal-close-x {
  color: var(--text-muted) !important;
}

.login-modal-close-x:hover {
  color: var(--title-color) !important;
}

.login-modal-text-main {
  color: var(--text-main) !important;
}

.login-create-dropzone,
.login-create-doczone {
  border-color: color-mix(in srgb, var(--border-soft) 70%, var(--brand-primary) 30%);
  background: color-mix(in srgb, var(--bg-card) 92%, var(--bg-soft) 8%);
}

.login-create-dropzone:hover,
.login-create-doczone:hover {
  border-color: var(--brand-primary);
}

.login-create-dropzone-dragging {
  border-color: var(--brand-primary) !important;
  background: color-mix(in srgb, var(--accent-soft) 58%, var(--bg-card) 42%) !important;
}

.login-create-preview {
  border-color: color-mix(in srgb, var(--border-soft) 74%, var(--text-main) 26%);
  background: color-mix(in srgb, var(--bg-card) 88%, var(--bg-soft) 12%);
}

.login-create-remove {
  background-color: color-mix(in srgb, var(--bg-soft) 76%, transparent 24%);
  color: var(--text-main);
}

.login-create-remove:hover {
  background-color: color-mix(in srgb, var(--accent-soft) 88%, transparent 12%);
}

.login-create-doc-selected {
  color: var(--brand-primary-strong);
}

:global(html.theme-light) .login-modal-muted,
:global(html.theme-light) .login-modal-label {
  color: color-mix(in srgb, var(--text-main) 82%, var(--bg-card) 18%) !important;
}

:global(html.theme-light) .login-modal-input {
  color: #1e293b !important;
  border-color: #b6c3d6 !important;
}

:global(html.theme-light) .login-modal-input::placeholder {
  color: #64748b !important;
}

:global(html.theme-dark) .login-modal-muted,
:global(html.theme-dark) .login-modal-label {
  color: color-mix(in srgb, var(--text-main) 86%, #ffffff 14%) !important;
}

:global(html.theme-dark) .login-modal-input {
  background-color: color-mix(in srgb, var(--bg-card) 84%, #0b1220 16%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 58%, var(--brand-primary) 42%) !important;
  color: #f8fafc !important;
}

:global(html.theme-dark) .login-modal-input::placeholder {
  color: #a7b7cb !important;
}

:global(html.theme-dark) .login-modal-cancel-btn {
  background-color: color-mix(in srgb, var(--bg-card) 76%, #020617 24%) !important;
  border-color: color-mix(in srgb, var(--border-soft) 54%, var(--brand-primary) 46%) !important;
  color: #e2e8f0 !important;
}

:global(html.theme-dark) .login-create-dropzone,
:global(html.theme-dark) .login-create-doczone {
  border-color: color-mix(in srgb, var(--brand-primary) 46%, var(--border-soft) 54%);
  background: color-mix(in srgb, var(--bg-card) 82%, #0b1220 18%);
}

:global(html.theme-dark) .login-master-card {
  background: color-mix(in srgb, var(--bg-card) 82%, #2f2508 18%);
  border-color: color-mix(in srgb, #f59e0b 52%, var(--brand-primary) 48%);
}

:global(html.theme-dark) .login-master-footer {
  background: color-mix(in srgb, var(--bg-card) 64%, #020617 36%);
}

:global(html.theme-dark) .login-character-card {
  background: color-mix(in srgb, var(--bg-card) 80%, #020617 20%);
  border-color: color-mix(in srgb, var(--brand-primary) 42%, var(--border-soft) 58%);
}

:global(html.theme-dark) .login-character-footer {
  background: color-mix(in srgb, var(--bg-card) 68%, #020617 32%);
}

:global(html.theme-dark) .login-create-card {
  background: color-mix(in srgb, var(--brand-primary-strong) 56%, #3a0c26 44%);
  border-color: color-mix(in srgb, var(--brand-primary) 58%, #fb7185 42%);
}

/* ── Notificação de sessão expirada ── */
.notificacao-sessao {
  background: color-mix(in srgb, var(--bg-card) 88%, #1e293b 12%);
  border-color: color-mix(in srgb, var(--brand-primary) 28%, var(--border-soft) 72%);
}

.notificacao-label {
  color: color-mix(in srgb, #ef4444 76%, var(--text-muted) 24%);
}

.notificacao-titulo {
  color: var(--text-main);
}

.notificacao-corpo {
  color: var(--text-muted);
}

.notificacao-fechar {
  color: var(--text-muted);
}

.notificacao-fechar:hover {
  color: var(--text-main);
  background: color-mix(in srgb, var(--accent-soft) 80%, transparent 20%);
}

:global(html.theme-light) .notificacao-sessao {
  background: color-mix(in srgb, var(--bg-card) 94%, #fee2e2 6%);
  border-color: color-mix(in srgb, #ef4444 20%, var(--border-soft) 80%);
  box-shadow: 0 8px 32px rgb(0 0 0 / 0.08);
}

:global(html.theme-light) .notificacao-label {
  color: #dc2626;
}

/* ── Cards de personagem (light mode) ── */
:global(html.theme-light) .login-character-fallback {
  background: color-mix(in srgb, var(--bg-soft) 100%, transparent 0%);
}

:global(html.theme-light) .login-character-fallback-text {
  color: color-mix(in srgb, var(--text-muted) 70%, transparent 30%);
}

:global(html.theme-light) .login-character-footer {
  background: color-mix(in srgb, var(--bg-card) 95%, var(--bg-soft) 5%);
  border-top: 1px solid var(--border-soft);
}
</style>

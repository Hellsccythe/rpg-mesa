<template>
  <div class="book-page" :class="pageClass">

    <!-- CAPA -->
    <template v-if="page.type === 'cover'">
      <div class="cover-inner">
        <div class="cover-ornament">✦ ✦ ✦</div>
        <h1 class="cover-title">Panteão de Elyra</h1>
        <div class="cover-rule" />
        <p class="cover-subtitle">Conhecimento Comum dos Mortais</p>
        <p class="cover-source">Extraído de DeusesView · Caminho Sem Volta</p>
        <div class="cover-rule cover-rule--thin" />

        <table class="toc-table">
          <thead>
            <tr>
              <th class="toc-th">Alinhamento</th>
              <th class="toc-th">Divindades</th>
            </tr>
          </thead>
          <tbody>
            <tr class="toc-row toc-row--bom">
              <td class="toc-align">
                <span class="toc-badge toc-badge--bom">Bons (6)</span>
              </td>
              <td class="toc-names">
                <span
                  v-for="name in BOM_GODS"
                  :key="name"
                  class="toc-god-link"
                  @click="$emit('jumpToPage', GOD_PAGE_MAP[name])"
                >{{ name }}</span>
              </td>
            </tr>
            <tr class="toc-row toc-row--neutro">
              <td class="toc-align">
                <span class="toc-badge toc-badge--neutro">Neutros (9)</span>
              </td>
              <td class="toc-names">
                <span
                  v-for="name in NEUTRO_GODS"
                  :key="name"
                  class="toc-god-link"
                  @click="$emit('jumpToPage', GOD_PAGE_MAP[name])"
                >{{ name }}</span>
              </td>
            </tr>
            <tr class="toc-row toc-row--maligno">
              <td class="toc-align">
                <span class="toc-badge toc-badge--maligno">Malignos (6)</span>
              </td>
              <td class="toc-names">
                <span
                  v-for="name in MALIGNO_GODS"
                  :key="name"
                  class="toc-god-link"
                  @click="$emit('jumpToPage', GOD_PAGE_MAP[name])"
                >{{ name }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="cover-rule cover-rule--thin" />
        <p class="cover-footer">Total: 6 deuses do bem · 9 neutros · 6 malignos · 21 divindades</p>
      </div>
    </template>

    <!-- TEXTO (notas do mestre) -->
    <template v-else-if="page.type === 'text'">
      <div class="text-page-inner">
        <template v-if="page.noteTitle && page.pageNumber === 1">
          <div class="text-cover-ornament">✦</div>
          <h2 class="text-cover-title">{{ page.noteTitle }}</h2>
          <div class="text-cover-rule" />
          <p v-if="page.noteSubtitle" class="text-cover-subtitle">{{ page.noteSubtitle }}</p>
          <div class="text-cover-rule text-cover-rule--thin" />
        </template>
        <div class="text-body" v-html="formattedText" />
      </div>
    </template>

    <!-- DEUSES -->
    <template v-else>
      <div
        v-if="page.sectionHeader"
        class="section-banner"
        :class="`section-banner--${page.sectionType}`"
      >
        {{ page.sectionHeader }}
      </div>

      <div class="gods-list">
        <div
          v-for="god in page.gods"
          :key="god.name"
          class="god-card"
          :class="`god-card--${god.alignmentType}`"
        >
          <div class="god-header" :class="`god-header--${god.alignmentType}`">
            <span class="god-name">{{ god.name }}</span>
            <span class="god-epithet">{{ god.epithet }}</span>
          </div>

          <p class="god-desc">{{ god.description }}</p>

          <div class="god-attrs">
            <div class="attr-row">
              <span class="attr-key" :class="`attr-key--${god.alignmentType}`">Alinhamento</span>
              <span class="attr-val attr-val--align" :class="`attr-align--${god.alignmentType}`">{{ god.alignment }}</span>
            </div>
            <div class="attr-row">
              <span class="attr-key" :class="`attr-key--${god.alignmentType}`">Anátema</span>
              <span class="attr-val attr-italic">{{ god.anatema }}</span>
            </div>
            <div class="attr-row">
              <span class="attr-key" :class="`attr-key--${god.alignmentType}`">Dogma</span>
              <span class="attr-val attr-italic">{{ god.dogma }}</span>
            </div>
            <div class="attr-row">
              <span class="attr-key" :class="`attr-key--${god.alignmentType}`">Armas</span>
              <span class="attr-val attr-italic">{{ god.armas }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Rodapé -->
    <div class="page-footer">
      <span>{{ footerLabel }}</span>
      <span class="page-num">Pág. {{ page.pageNumber }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BookPage } from '@/types/book'
import { GOD_PAGE_MAP } from '@/data/panteao'

const props = defineProps<{
  page: BookPage
  noteTitulo?: string
}>()
defineEmits<{ jumpToPage: [spreadIdx: number] }>()

const BOM_GODS = ['Cayden Cailean', 'Desna', 'Erastil', 'Iomedae', 'Sarenrae', 'Shelyn']
const NEUTRO_GODS = ['Calistria', 'Inari', 'Kurgess', 'Liriel', 'Morthos', 'Pharasma', 'Torak', 'Vespera', 'Zephyros']
const MALIGNO_GODS = ['Asmodeus', 'Gorum', 'Norgorber', 'Rovagug', 'Urgathoa', 'Zon-Kuthon']

const pageClass = computed(() => {
  if (props.page.type === 'cover') return 'book-page--cover'
  if (props.page.type === 'text') return 'book-page--text'
  if (props.page.sectionType) return `book-page--${props.page.sectionType}`
  if (props.page.gods[0]) return `book-page--${props.page.gods[0].alignmentType}`
  return ''
})

const footerLabel = computed(() =>
  props.noteTitulo ?? (props.page.noteTitle ?? 'Panteão de Elyra')
)

const formattedText = computed(() => {
  const raw = props.page.textContent ?? ''
  return raw
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('')
})
</script>

<style scoped>
/* ── Base ── */
.book-page {
  font-family: 'EB Garamond', Georgia, serif;
  background: #f5e8ce;
  color: #1a0e08;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.book-page::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(ellipse at 15% 15%, rgba(180, 130, 60, 0.06) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 85%, rgba(140, 90, 30, 0.05) 0%, transparent 50%);
  z-index: 0;
}

/* ── Capa ── */
.cover-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 18px 12px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.cover-ornament {
  font-size: 0.85rem;
  letter-spacing: 0.4em;
  color: #9a7a3a;
  margin-bottom: 8px;
}

.cover-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.3rem, 3vw, 1.75rem);
  font-weight: 700;
  color: #1e3010;
  letter-spacing: 0.04em;
  line-height: 1.2;
  margin: 0 0 5px;
}

.cover-rule {
  width: 85%;
  height: 2px;
  background: linear-gradient(to right, transparent, #9a7a3a, transparent);
  margin: 6px auto;
  border: none;
}

.cover-rule--thin {
  height: 1px;
  background: linear-gradient(to right, transparent, #c9a87c, transparent);
}

.cover-subtitle {
  font-size: 0.8rem;
  font-style: italic;
  color: #4a3520;
  margin: 3px 0;
}

.cover-source {
  font-size: 0.65rem;
  color: #7a6040;
  margin: 2px 0 8px;
  letter-spacing: 0.03em;
}

/* TOC Table */
.toc-table {
  width: 100%;
  border-collapse: collapse;
  margin: 6px 0;
  font-size: 0.72rem;
}

.toc-th {
  font-family: 'Cinzel', serif;
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #4a3520;
  padding: 4px 6px;
  border-bottom: 1px solid #c9a87c;
  text-align: left;
}

.toc-row td {
  padding: 4px 6px;
  border-bottom: 1px solid #e0cca0;
  vertical-align: top;
}

.toc-align {
  width: 82px;
  white-space: nowrap;
}

.toc-badge {
  display: inline-block;
  font-family: 'Cinzel', serif;
  font-size: 0.58rem;
  font-weight: 600;
  padding: 2px 5px;
  border-radius: 3px;
  letter-spacing: 0.04em;
}

.toc-badge--bom     { background: #d8e8f8; color: #1e3a5f; border: 1px solid #93c5fd50; }
.toc-badge--neutro  { background: #e8e0cc; color: #3d2a10; border: 1px solid #a08050; }
.toc-badge--maligno { background: #f0d8d8; color: #6a1010; border: 1px solid #e0909050; }

.toc-names { line-height: 1.75; }

.toc-god-link {
  cursor: pointer;
  color: #3a2a10;
  border-bottom: 1px dotted #9a7a3a;
  transition: color 0.15s, border-color 0.15s;
  padding: 0 1px;
}

.toc-god-link:hover { color: #9a5a10; border-color: #9a5a10; }

.toc-god-link + .toc-god-link::before {
  content: ' · ';
  color: #9a7a3a;
  border: none;
  display: inline;
}

.cover-footer {
  font-size: 0.62rem;
  color: #7a6040;
  margin-top: 5px;
  font-style: italic;
}

/* ── Página de Texto ── */
.text-page-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 18px 16px 12px;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.text-cover-ornament {
  font-size: 1.1rem;
  color: #9a7a3a;
  text-align: center;
  margin-bottom: 6px;
}

.text-cover-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  font-weight: 700;
  color: #1e3010;
  letter-spacing: 0.04em;
  text-align: center;
  margin: 0 0 4px;
}

.text-cover-subtitle {
  font-size: 0.75rem;
  font-style: italic;
  color: #4a3520;
  text-align: center;
  margin: 3px 0;
}

.text-cover-rule {
  width: 80%;
  height: 2px;
  background: linear-gradient(to right, transparent, #9a7a3a, transparent);
  margin: 5px auto;
  border: none;
}

.text-cover-rule--thin {
  height: 1px;
  background: linear-gradient(to right, transparent, #c9a87c, transparent);
}

.text-body {
  flex: 1;
  font-size: clamp(0.68rem, 1.3vw, 0.76rem);
  line-height: 1.65;
  color: #2a1a0a;
  text-align: justify;
  hyphens: auto;
  margin-top: 8px;
  overflow: hidden;
}

.text-body :deep(p) { margin: 0 0 8px; }
.text-body :deep(p:last-child) { margin-bottom: 0; }

/* ── Banner de Seção ── */
.section-banner {
  font-family: 'Cinzel', serif;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-align: center;
  padding: 6px 16px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.section-banner--bom     { background: #1e3a5f; color: #d8e8f8; }
.section-banner--neutro  { background: #2a2a1e; color: #e0d8b8; }
.section-banner--maligno { background: #3a0a0a; color: #f0d8d8; }

/* ── Lista de Deuses ── */
.gods-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

/* ── Card de Deus ── */
.god-card {
  border-bottom: 1px solid #d8c090;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.god-card:last-child { border-bottom: none; }

.god-header {
  display: flex;
  flex-direction: column;
  padding: 6px 12px 4px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.god-header--bom     { background: #1e3a5f; }
.god-header--neutro  { background: #2a2a1e; }
.god-header--maligno { background: #3a0a0a; }

.god-name {
  font-family: 'Cinzel', serif;
  font-size: clamp(0.78rem, 1.6vw, 0.92rem);
  font-weight: 700;
  color: #f0e8d0;
  line-height: 1.2;
}

.god-epithet {
  font-size: clamp(0.62rem, 1.2vw, 0.68rem);
  font-style: italic;
  color: #c8a878;
  margin-top: 1px;
}

.god-desc {
  font-size: clamp(0.61rem, 1.1vw, 0.65rem);
  line-height: 1.46;
  color: #2a1a0a;
  padding: 5px 12px 4px;
  margin: 0;
  text-align: justify;
  hyphens: auto;
  flex: 1;
  overflow: hidden;
}

/* ── Atributos ── */
.god-attrs {
  padding: 3px 12px 6px;
  display: flex;
  flex-direction: column;
  gap: 0;
  border-top: 1px solid #e0cca0;
  flex-shrink: 0;
}

.attr-row {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: 4px;
  font-size: clamp(0.57rem, 1vw, 0.61rem);
  line-height: 1.38;
  border-bottom: 1px solid #eedcb028;
  padding: 1px 0;
}

.attr-row:last-child { border-bottom: none; }

.attr-key {
  font-family: 'Cinzel', serif;
  font-size: 0.52rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  align-self: start;
  padding-top: 1px;
}

.attr-key--bom     { color: #1e3a5f; }
.attr-key--neutro  { color: #4a3a10; }
.attr-key--maligno { color: #6a1010; }

.attr-val    { color: #2a1a0a; }
.attr-italic { font-style: italic; color: #3a2a10; }
.attr-val--align { font-weight: 600; }

.attr-align--bom     { color: #1e3a5f; }
.attr-align--neutro  { color: #4a3a10; }
.attr-align--maligno { color: #8b1a1a; }

/* ── Rodapé ── */
.page-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  border-top: 1px solid #c9a87c;
  font-size: 0.57rem;
  color: #7a6040;
  font-style: italic;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  background: #f5e8ce;
}

.page-num {
  font-family: 'Cinzel', serif;
  font-size: 0.55rem;
  font-style: normal;
  letter-spacing: 0.05em;
}
</style>

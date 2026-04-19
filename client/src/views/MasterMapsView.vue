<template>
  <div class="relative min-h-screen overflow-hidden bg-[#0A0F1C] text-white">
    <div class="absolute inset-0 bg-gradient-to-br from-[#0F1C3A] via-[#1A2438] to-[#2A1B4A]/80" />

    <TemaDarkLight variante="contexto" class="relative z-10 flex min-h-screen flex-col">
      <header
        class="sticky top-0 z-20 h-16 border-b border-[#6B4E9E]/30 bg-black/55 px-4 backdrop-blur-md sm:px-6"
      >
        <div class="mx-auto flex h-full w-full max-w-7xl items-center justify-between gap-3">
          <button
            @click="goMasterPanel"
            class="flex items-center gap-2 text-zinc-300 transition-colors hover:text-white"
          >
            <span class="text-3xl">‹</span>
            <span class="hidden text-sm font-medium sm:inline">Voltar ao Painel</span>
          </button>

          <div class="text-xl font-bold tracking-widest text-amber-300">Gestao de Mapas</div>

          <div class="flex gap-2">
            <button
              @click="refreshMaps"
              :disabled="loading"
              class="rounded-xl border border-[#6B4E9E]/50 px-3 py-1.5 text-xs text-zinc-200 transition-colors hover:bg-[#2A1B4A] disabled:opacity-60 sm:text-sm"
            >
              {{ loading ? 'Atualizando...' : 'Atualizar' }}
            </button>
            <button
              @click="logout"
              class="rounded-xl border border-red-900/65 bg-red-950/60 px-3 py-1.5 text-xs text-red-200 transition-colors hover:bg-red-900/70 sm:px-4 sm:text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main class="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <section class="rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-5 sm:p-6">
          <p class="text-sm text-zinc-300">
            Aba 1: editar existentes (pai/filho por cidade). Aba 2: criar nova cidade com mapa pai.
            Aba 3: criar/vincular mapas filhos na cidade pai.
          </p>

          <div class="mt-4 inline-flex rounded-xl border border-[#6B4E9E]/45 bg-[#0B1426] p-1">
            <button @click="activeTab = 'existing'" :class="tabBtnClass(activeTab === 'existing')">
              1. Mapas Existentes
            </button>
            <button
              @click="activeTab = 'create-city'"
              :class="tabBtnClass(activeTab === 'create-city')"
            >
              2. Criar Cidade (Mapa Pai)
            </button>
            <button
              @click="activeTab = 'create-child'"
              :class="tabBtnClass(activeTab === 'create-child')"
            >
              3. Vincular Mapas Filhos
            </button>
          </div>
        </section>

        <section v-if="activeTab === 'existing'" class="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <aside class="xl:col-span-4 rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-4">
            <h2 class="mb-3 text-lg font-semibold text-amber-300">Mapa pai e filhos por cidade</h2>

            <div class="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
              <div
                v-for="city in groupedCities"
                :key="city.slug"
                class="rounded-xl border border-zinc-700/50 bg-[#0B1426] p-3"
              >
                <p class="mb-2 text-sm font-semibold text-zinc-200">{{ city.name }}</p>

                <div v-for="parent in city.parents" :key="parent.id" class="mb-2">
                  <button
                    class="w-full rounded-lg border px-2 py-1.5 text-left text-sm"
                    :class="
                      existingSelectedId === parent.id
                        ? 'border-amber-400 bg-amber-900/25'
                        : 'border-zinc-700/50 bg-[#10192B]'
                    "
                    @click="onSelectParentGroup(parent.id)"
                  >
                    Pai: {{ parent.name }}
                  </button>

                  <div class="mt-1 space-y-1 pl-3">
                    <button
                      v-for="child in parent.children"
                      :key="child.id"
                      class="w-full rounded-lg border px-2 py-1 text-left text-xs"
                      :class="
                        existingSelectedId === child.id
                          ? 'border-emerald-400 bg-emerald-900/20'
                          : 'border-zinc-700/50 bg-[#10192B]'
                      "
                      @click="selectExistingMap(child.id)"
                    >
                      Filho: {{ child.name }}
                    </button>
                  </div>
                </div>

                <button
                  v-if="!city.parents.length && city.slug === 'hamlet'"
                  class="w-full rounded-lg border border-amber-500/45 bg-amber-900/20 px-2 py-1.5 text-left text-sm text-amber-100 hover:bg-amber-900/30"
                  @click="selectLegacyHamlet"
                >
                  Pai: Hamlet (legado local)
                </button>
              </div>
            </div>
          </aside>

          <div class="xl:col-span-8 rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-4">
            <div class="mb-3 flex items-center justify-between gap-2">
              <h2 class="text-lg font-semibold text-amber-300">Mapa selecionado</h2>
              <div class="flex gap-2">
                <button
                  v-if="existingEditor.id && !existingEditMode"
                  class="rounded-lg border border-amber-500/55 px-3 py-1.5 text-xs text-amber-100 hover:bg-amber-900/25"
                  @click="startExistingEdit"
                >
                  Editar
                </button>
                <button
                  v-if="existingEditor.id && existingEditMode"
                  class="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-400"
                  @click="cancelExistingEdit"
                >
                  Cancelar
                </button>
                <button
                  v-if="existingEditor.id && existingEditMode"
                  class="rounded-lg bg-[#6B4E9E] px-3 py-1.5 text-xs font-semibold text-white hover:brightness-110"
                  @click="saveExistingMap"
                >
                  Salvar
                </button>
              </div>
            </div>

            <div
              v-if="!existingEditor.id && !showLegacyPreview"
              class="rounded-xl border border-zinc-700/50 p-4 text-zinc-400"
            >
              Selecione um mapa na coluna da esquerda.
            </div>

            <div v-else-if="showLegacyPreview" class="space-y-3">
              <div
                class="rounded-xl border border-amber-500/40 bg-amber-900/10 p-3 text-sm text-amber-100"
              >
                Este e o mapa legado local de Hamlet (somente visual). Para usar no fluxo oficial,
                envie a imagem no bucket e crie o mapa pai na aba 2.
              </div>

              <div class="overflow-hidden rounded-xl border border-zinc-700/50 bg-[#0B1426]">
                <img
                  :src="hamletMap"
                  alt="Mapa legado de Hamlet"
                  class="h-auto max-h-[65vh] w-full object-contain"
                />
              </div>

              <div class="flex justify-end">
                <button class="tdl-botao-primario" @click="goToCreateCityTabFromLegacy">
                  Criar Mapa Pai Oficial
                </button>
              </div>
            </div>

            <div v-else class="space-y-3">
              <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  v-model="existingEditor.name"
                  class="tdl-campo"
                  placeholder="Nome do mapa"
                  :disabled="!existingEditMode"
                />
                <input
                  v-model="existingEditor.cityName"
                  class="tdl-campo"
                  placeholder="Nome da cidade"
                  :disabled="!existingEditMode"
                />
                <input
                  v-model="existingEditor.citySlug"
                  class="tdl-campo"
                  placeholder="Slug da cidade"
                  :disabled="!existingEditMode"
                />
              </div>

              <textarea
                v-model="existingEditor.description"
                rows="2"
                class="tdl-campo"
                placeholder="Descricao do mapa"
                :disabled="!existingEditMode"
              />
              <textarea
                v-if="existingEditor.mapType === 'city'"
                v-model="existingEditor.cityDescription"
                rows="2"
                class="tdl-campo"
                placeholder="Descricao da area/cidade"
                :disabled="!existingEditMode"
              />
              <input
                v-if="existingEditor.mapType === 'city'"
                v-model="existingEditor.cityCulture"
                class="tdl-campo"
                placeholder="Cultura da area"
                :disabled="!existingEditMode"
              />

              <div class="grid grid-cols-1 gap-3">
                <input
                  type="file"
                  accept="image/*"
                  class="tdl-campo"
                  @change="onUploadForEditor('existing', $event)"
                  :disabled="!existingEditMode"
                />
              </div>

              <div v-if="existingEditor.mapType === 'localized'">
                <label class="mb-1 block text-xs uppercase tracking-wide text-zinc-500"
                  >Mapa pai desta cidade</label
                >
                <select
                  v-model="existingEditor.parentCityMapId"
                  class="tdl-campo"
                  :disabled="!existingEditMode"
                  @change="onExistingParentChange"
                >
                  <option value="">Sem vinculo</option>
                  <option
                    v-for="parent in possibleParentsForExisting"
                    :key="parent.id"
                    :value="parent.id"
                  >
                    {{ parent.cityName }} - {{ parent.name }}
                  </option>
                </select>
              </div>

              <MapPointEditor
                :image-url="existingEditor.imageUrl || existingEditor.mapReference"
                :points="existingEditor.pointsOfInterest"
                :target-options="targetLocalizedOptionsForExisting"
                :editable="existingEditMode"
                @change="(next) => (existingEditor.pointsOfInterest = next)"
              />
            </div>
          </div>
        </section>

        <section
          v-if="activeTab === 'create-city'"
          class="rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-4"
        >
          <h2 class="mb-3 text-lg font-semibold text-amber-300">Criar nova cidade e mapa pai</h2>

          <div class="space-y-3">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input v-model="newCity.cityName" class="tdl-campo" placeholder="Nome da area/cidade" />
            </div>

            <textarea
              v-model="newCity.cityDescription"
              rows="2"
              class="tdl-campo"
              placeholder="Descricao da area"
            />
            <input v-model="newCity.cityCulture" class="tdl-campo" placeholder="Cultura da area" />
            <textarea
              v-model="newCity.description"
              rows="2"
              class="tdl-campo"
              placeholder="Descricao do mapa pai"
            />

            <div class="grid grid-cols-1 gap-3">
              <input
                type="file"
                accept="image/*"
                class="tdl-campo"
                @change="onUploadForEditor('newCity', $event)"
              />
            </div>

            <MapPointEditor
              :image-url="newCity.imageUrl || newCity.mapReference"
              :points="newCity.pointsOfInterest"
              :target-options="[]"
              @change="(next) => (newCity.pointsOfInterest = next)"
            />

            <div class="flex justify-end">
              <button class="tdl-botao-primario" @click="createCityMap">Criar Cidade + Mapa Pai</button>
            </div>
          </div>
        </section>

        <section
          v-if="activeTab === 'create-child'"
          class="rounded-3xl border border-[#6B4E9E]/40 bg-[#111A2D]/80 p-4"
        >
          <h2 class="mb-3 text-lg font-semibold text-amber-300">Criar e vincular mapas filhos</h2>

          <div class="space-y-3">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                v-model="newChild.parentCityMapId"
                class="tdl-campo"
                @change="syncChildFromParentMap"
              >
                <option value="">Selecione o mapa pai</option>
                <option v-for="parent in childParentOptions" :key="parent.id" :value="parent.id">
                  {{ parent.cityName }} - {{ parent.name }}
                </option>
              </select>
              <input v-model="newChild.name" class="tdl-campo" placeholder="Nome do mapa filho" />
            </div>

            <textarea
              v-model="newChild.description"
              rows="2"
              class="tdl-campo"
              placeholder="Descricao do mapa filho"
            />

            <div class="grid grid-cols-1 gap-3">
              <input
                type="file"
                accept="image/*"
                class="tdl-campo"
                @change="onUploadForEditor('newChild', $event)"
              />
            </div>

            <MapPointEditor
              :image-url="newChild.imageUrl || newChild.mapReference"
              :points="newChild.pointsOfInterest"
              :target-options="targetLocalizedOptionsForChild"
              @change="(next) => (newChild.pointsOfInterest = next)"
            />

            <div class="flex justify-end">
              <button class="tdl-botao-primario" @click="createChildMap">Criar Mapa Filho</button>
            </div>
          </div>
        </section>

        <p
          v-if="feedback"
          class="text-sm"
          :class="feedbackError ? 'text-red-300' : 'text-emerald-300'"
        >
          {{ feedback }}
        </p>
      </main>
    </TemaDarkLight>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import Modal from '@/components/Modal.vue'
import TemaDarkLight from '@/components/TemaDarkLight.vue'
import { useAuthStore } from '@/stores/auth'
import { useMasterCatalogStore } from '@/stores/masterCatalog'
import { uploadCityMapImage } from '@/lib/api/city-maps.api'
import type { CityMapApi, PointOfInterestApi } from '@/types/supabase'
import hamletMap from '@/assets/maps/hamlet.png'

type Tab = 'existing' | 'create-city' | 'create-child'
type EditorTarget = 'existing' | 'newCity' | 'newChild'

type MapEditorState = {
  id: string
  name: string
  mapReference: string
  description: string
  imageUrl: string
  citySlug: string
  cityName: string
  cityDescription: string
  cityCulture: string
  mapType: 'city' | 'localized'
  parentCityMapId: string
  pointsOfInterest: PointOfInterestApi[]
}

const MapPointEditor = defineComponent({
  name: 'MapPointEditor',
  props: {
    imageUrl: { type: String, required: true },
    points: { type: Array as () => PointOfInterestApi[], required: true },
    targetOptions: { type: Array as () => Array<{ id: string; name: string }>, required: true },
    editable: { type: Boolean, default: true },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const mapContainerRef = ref<HTMLElement | null>(null)
    const draggingIndex = ref<number | null>(null)
    const suppressNextMapClick = ref(false)
    const pendingDeleteIndex = ref<number | null>(null)

    function clonePoints() {
      return props.points.map((p) => ({ ...p }))
    }

    function patchPoint(index: number, patch: Partial<PointOfInterestApi>) {
      const next = clonePoints()
      next[index] = { ...next[index], ...patch }
      emit('change', next)
    }

    function updatePointPositionFromPointer(index: number, event: PointerEvent) {
      const container = mapContainerRef.value
      if (!container) return
      const rect = container.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      patchPoint(index, {
        x: Number(Math.min(100, Math.max(0, x)).toFixed(2)),
        y: Number(Math.min(100, Math.max(0, y)).toFixed(2)),
      })
    }

    function onMapClick(event: MouseEvent) {
      if (!props.editable) return
      if (!props.imageUrl) return
      if (suppressNextMapClick.value) {
        suppressNextMapClick.value = false
        return
      }
      const target = event.currentTarget as HTMLElement | null
      if (!target) return
      const rect = target.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      const next = clonePoints()
      next.push({
        id: `poi-${Date.now()}-${next.length + 1}`,
        name: `Ponto ${next.length + 1}`,
        description: '',
        x: Number(Math.min(100, Math.max(0, x)).toFixed(2)),
        y: Number(Math.min(100, Math.max(0, y)).toFixed(2)),
        targetCityMapId: '',
      })
      emit('change', next)
    }

    function removePoint(index: number) {
      const next = clonePoints()
      next.splice(index, 1)
      emit('change', next)
    }

    function requestRemovePoint(index: number) {
      if (!props.editable) return
      pendingDeleteIndex.value = index
    }

    function cancelRemovePoint() {
      pendingDeleteIndex.value = null
    }

    function confirmRemovePoint() {
      if (pendingDeleteIndex.value === null) return
      removePoint(pendingDeleteIndex.value)
      pendingDeleteIndex.value = null
    }

    function onMarkerPointerDown(index: number, ev: PointerEvent) {
      if (!props.editable) return
      draggingIndex.value = index
      ;(ev.currentTarget as HTMLElement | null)?.setPointerCapture?.(ev.pointerId)
      ev.stopPropagation()
      ev.preventDefault()
    }

    function onMarkerPointerMove(index: number, ev: PointerEvent) {
      if (!props.editable) return
      if (draggingIndex.value !== index) return
      updatePointPositionFromPointer(index, ev)
      ev.stopPropagation()
      ev.preventDefault()
    }

    function onMarkerPointerUp(index: number, ev: PointerEvent) {
      if (draggingIndex.value !== index) return
      draggingIndex.value = null
      suppressNextMapClick.value = true
      window.setTimeout(() => {
        suppressNextMapClick.value = false
      }, 0)
      ev.stopPropagation()
      ev.preventDefault()
    }

    return () =>
      h(
        'div',
        { class: 'map-point-editor rounded-2xl border border-[#6B4E9E]/35 bg-[#0B1426] p-3' },
        [
          h(
            'p',
            { class: 'mb-2 text-sm text-zinc-300' },
            'Clique no mapa para adicionar pontos. Arraste o marcador para reposicionar. Use o botao X para remover.',
          ),
          h(
            'div',
            {
              class: 'relative overflow-hidden rounded-xl border border-zinc-700/40 bg-black/40',
            },
            [
              props.imageUrl
                ? h(
                    'div',
                    {
                      class: 'relative mx-auto w-fit max-w-full',
                      ref: mapContainerRef,
                      onClick: onMapClick,
                    },
                    [
                      h('img', {
                        src: props.imageUrl,
                        alt: 'Mapa para marcacao',
                        class: 'block h-auto max-h-[420px] max-w-full object-contain',
                      }),
                      ...props.points.flatMap((poi, index) => {
                        const marker = h(
                          'button',
                          {
                            type: 'button',
                            class:
                              'absolute -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full border-2 border-white bg-red-500/85 px-1.5 py-0.5 text-[10px] font-bold text-white',
                            style: { left: `${poi.x}%`, top: `${poi.y}%` },
                            title: props.editable ? `${poi.name} (arrastar)` : poi.name,
                            onClick: (ev: Event) => {
                              ev.stopPropagation()
                            },
                            onPointerdown: (ev: PointerEvent) => onMarkerPointerDown(index, ev),
                            onPointermove: (ev: PointerEvent) => onMarkerPointerMove(index, ev),
                            onPointerup: (ev: PointerEvent) => onMarkerPointerUp(index, ev),
                            onPointercancel: (ev: PointerEvent) => onMarkerPointerUp(index, ev),
                          },
                          String(index + 1),
                        )

                        const label = h(
                          'div',
                          {
                            class:
                              'pointer-events-none absolute -translate-x-1/2 rounded-md border border-black/50 bg-black/70 px-2 py-0.5 text-[10px] text-zinc-100',
                            style: { left: `${poi.x}%`, top: `calc(${poi.y}% - 22px)` },
                          },
                          poi.name || `Ponto ${index + 1}`,
                        )

                        return [marker, label]
                      }),
                    ],
                  )
                : h(
                    'div',
                    { class: 'flex h-56 items-center justify-center text-sm text-zinc-500' },
                    'Defina URL/referencia para marcar pontos.',
                  ),
            ],
          ),
          h(
            'div',
            { class: 'mt-3 space-y-2' },
            props.points.length
              ? props.points.map((poi, index) =>
                  h(
                    'div',
                    { class: 'rounded-lg border border-zinc-700/50 bg-[#10192B] p-3 text-sm' },
                    [
                      h('div', { class: 'mb-2 flex items-center justify-between gap-2' }, [
                        h(
                          'p',
                          { class: 'text-xs font-semibold uppercase tracking-wide text-zinc-300' },
                          `Ponto ${index + 1}`,
                        ),
                        props.editable
                          ? h(
                              'button',
                              {
                                type: 'button',
                                class:
                                  'rounded-md border border-red-500/55 px-2 py-0.5 text-xs font-semibold text-red-200 hover:bg-red-900/30',
                                title: `Excluir ponto ${poi.name || index + 1}`,
                                onClick: (ev: Event) => {
                                  ev.stopPropagation()
                                  requestRemovePoint(index)
                                },
                              },
                              'X',
                            )
                          : null,
                      ]),
                      h('div', { class: 'mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2' }, [
                        h('div', { class: 'space-y-1' }, [
                          h(
                            'label',
                            { class: 'block text-[11px] uppercase tracking-wide text-zinc-400' },
                            'Nome do ponto',
                          ),
                          h('input', {
                            class: 'tdl-campo',
                            disabled: !props.editable,
                            value: poi.name,
                            placeholder: 'Ex: Castelo do Mestre',
                            onInput: (ev: Event) =>
                              patchPoint(index, { name: (ev.target as HTMLInputElement).value }),
                          }),
                        ]),
                        h('div', { class: 'space-y-1' }, [
                          h(
                            'label',
                            { class: 'block text-[11px] uppercase tracking-wide text-zinc-400' },
                            'Mapa filho vinculado',
                          ),
                          h(
                            'select',
                            {
                              class: 'tdl-campo',
                              disabled: !props.editable,
                              value: poi.targetCityMapId || '',
                              onChange: (ev: Event) =>
                                patchPoint(index, {
                                  targetCityMapId: (ev.target as HTMLSelectElement).value,
                                }),
                            },
                            [
                              h('option', { value: '' }, 'Sem mapa filho vinculado'),
                              ...props.targetOptions.map((opt) =>
                                h('option', { value: opt.id }, opt.name),
                              ),
                            ],
                          ),
                        ]),
                      ]),
                      h('div', { class: 'space-y-1' }, [
                        h(
                          'label',
                          { class: 'block text-[11px] uppercase tracking-wide text-zinc-400' },
                          'Descricao do ponto',
                        ),
                        h('textarea', {
                          class: 'tdl-campo',
                          disabled: !props.editable,
                          rows: 2,
                          value: poi.description || '',
                          placeholder: 'Contexto rapido para este local',
                          onInput: (ev: Event) =>
                            patchPoint(index, {
                              description: (ev.target as HTMLTextAreaElement).value,
                            }),
                        }),
                      ]),
                      h('div', { class: 'mt-2 grid grid-cols-2 gap-2' }, [
                        h('div', { class: 'space-y-1' }, [
                          h(
                            'label',
                            { class: 'block text-[11px] uppercase tracking-wide text-zinc-400' },
                            'Posicao X (%)',
                          ),
                          h('input', {
                            class: 'tdl-campo',
                            type: 'number',
                            min: 0,
                            max: 100,
                            step: 0.1,
                            disabled: !props.editable,
                            value: Number.isFinite(poi.x) ? poi.x : 0,
                            placeholder: '0 a 100',
                            onInput: (ev: Event) => {
                              const value = Number((ev.target as HTMLInputElement).value)
                              if (!Number.isFinite(value)) return
                              patchPoint(index, {
                                x: Number(Math.min(100, Math.max(0, value)).toFixed(2)),
                              })
                            },
                          }),
                        ]),
                        h('div', { class: 'space-y-1' }, [
                          h(
                            'label',
                            { class: 'block text-[11px] uppercase tracking-wide text-zinc-400' },
                            'Posicao Y (%)',
                          ),
                          h('input', {
                            class: 'tdl-campo',
                            type: 'number',
                            min: 0,
                            max: 100,
                            step: 0.1,
                            disabled: !props.editable,
                            value: Number.isFinite(poi.y) ? poi.y : 0,
                            placeholder: '0 a 100',
                            onInput: (ev: Event) => {
                              const value = Number((ev.target as HTMLInputElement).value)
                              if (!Number.isFinite(value)) return
                              patchPoint(index, {
                                y: Number(Math.min(100, Math.max(0, value)).toFixed(2)),
                              })
                            },
                          }),
                        ]),
                      ]),
                      h(
                        'p',
                        { class: 'mt-2 text-xs text-zinc-400' },
                        `X: ${poi.x.toFixed(1)} | Y: ${poi.y.toFixed(1)}`,
                      ),
                    ],
                  ),
                )
              : [h('div', { class: 'text-sm text-zinc-500' }, 'Nenhum ponto adicionado.')],
          ),
          pendingDeleteIndex.value !== null
            ? h(
                Modal,
                {
                  showCloseButton: false,
                  closeOnBackdrop: false,
                  panelClass:
                    'w-full max-w-sm rounded-2xl border border-zinc-700/70 bg-[#10192B] shadow-2xl',
                  bodyClass: 'p-4',
                  onClose: cancelRemovePoint,
                },
                {
                  default: () => [
                    h(
                      'p',
                      { class: 'text-sm text-zinc-200' },
                      `Tem certeza que deseja deletar o ponto ${(props.points[pendingDeleteIndex.value]?.name || String(pendingDeleteIndex.value + 1)).trim()}?`,
                    ),
                    h('div', { class: 'mt-4 flex justify-end gap-2' }, [
                      h(
                        'button',
                        {
                          type: 'button',
                          class:
                            'rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-400',
                          onClick: cancelRemovePoint,
                        },
                        'Cancelar',
                      ),
                      h(
                        'button',
                        {
                          type: 'button',
                          class:
                            'rounded-lg border border-red-500/60 bg-red-900/30 px-3 py-1.5 text-xs font-semibold text-red-100 hover:bg-red-900/45',
                          onClick: confirmRemovePoint,
                        },
                        'Confirmar',
                      ),
                    ]),
                  ],
                },
              )
            : null,
        ],
      )
  },
})

const router = useRouter()
const authStore = useAuthStore()
const masterCatalogStore = useMasterCatalogStore()

const loading = ref(false)
const feedback = ref('')
const feedbackError = ref(false)
const activeTab = ref<Tab>('existing')
const existingSelectedId = ref('')
const existingEditMode = ref(false)
const existingSnapshot = ref<MapEditorState | null>(null)
const showLegacyPreview = ref(false)

const existingEditor = reactive<MapEditorState>({
  id: '',
  name: '',
  mapReference: '',
  description: '',
  imageUrl: '',
  citySlug: 'hamlet',
  cityName: 'Hamlet',
  cityDescription: '',
  cityCulture: '',
  mapType: 'city',
  parentCityMapId: '',
  pointsOfInterest: [],
})

const newCity = reactive<MapEditorState>({
  id: '',
  name: '',
  mapReference: '',
  description: '',
  imageUrl: '',
  citySlug: 'hamlet',
  cityName: 'Hamlet',
  cityDescription: '',
  cityCulture: '',
  mapType: 'city',
  parentCityMapId: '',
  pointsOfInterest: [],
})

const newChild = reactive<MapEditorState>({
  id: '',
  name: '',
  mapReference: '',
  description: '',
  imageUrl: '',
  citySlug: 'hamlet',
  cityName: 'Hamlet',
  cityDescription: '',
  cityCulture: '',
  mapType: 'localized',
  parentCityMapId: '',
  pointsOfInterest: [],
})

const maps = computed(() => masterCatalogStore.cityMaps)

const cityOptions = computed(() => {
  const mapBySlug = new Map<string, string>()
  maps.value.forEach((m) => {
    const slug = (m.citySlug || 'hamlet').trim() || 'hamlet'
    const name = (m.cityName || 'Hamlet').trim() || 'Hamlet'
    if (!mapBySlug.has(slug)) mapBySlug.set(slug, name)
  })
  if (!mapBySlug.size) mapBySlug.set('hamlet', 'Hamlet')
  return Array.from(mapBySlug.entries()).map(([slug, name]) => ({ slug, name }))
})

const parentMaps = computed(() => maps.value.filter((m) => m.mapType === 'city'))

const childMaps = computed(() => maps.value.filter((m) => m.mapType === 'localized'))

const childParentOptions = computed(() => parentMaps.value)

const targetLocalizedOptionsForExisting = computed(() =>
  childMaps.value
    .filter((m) => m.citySlug === (existingEditor.citySlug || 'hamlet'))
    .map((m) => ({ id: m.id, name: m.name })),
)

const targetLocalizedOptionsForChild = computed(() =>
  childMaps.value
    .filter((m) => m.citySlug === (newChild.citySlug || 'hamlet'))
    .map((m) => ({ id: m.id, name: m.name })),
)

const possibleParentsForExisting = computed(() => parentMaps.value)

const groupedCities = computed(() => {
  return cityOptions.value.map((city) => {
    const cityParents = parentMaps.value
      .filter((p) => p.citySlug === city.slug)
      .map((parent) => ({
        ...parent,
        children: childMaps.value.filter(
          (child) => child.citySlug === city.slug && child.parentCityMapId === parent.id,
        ),
      }))

    const orphanChildren = childMaps.value.filter(
      (child) => child.citySlug === city.slug && !child.parentCityMapId,
    )

    if (orphanChildren.length) {
      cityParents.push({
        id: `orphan-${city.slug}`,
        name: 'Filhos sem pai vinculado',
        mapReference: '',
        children: orphanChildren,
      } as any)
    }

    return {
      slug: city.slug,
      name: city.name,
      parents: cityParents,
    }
  })
})

function tabBtnClass(active: boolean) {
  return [
    'rounded-lg px-3 py-1.5 text-sm transition-colors',
    active ? 'bg-amber-900/30 text-amber-100' : 'text-zinc-300 hover:text-white',
  ]
}

function slugify(value: string) {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function copyMapToEditor(source: CityMapApi, target: MapEditorState) {
  target.id = source.id
  target.name = source.name || ''
  target.mapReference = source.mapReference || ''
  target.description = source.description || ''
  target.imageUrl = source.imageUrl || ''
  target.citySlug = source.citySlug || 'hamlet'
  target.cityName = source.cityName || 'Hamlet'
  target.cityDescription = source.cityDescription || ''
  target.cityCulture = source.cityCulture || ''
  target.mapType = source.mapType || 'city'
  target.parentCityMapId = source.parentCityMapId || ''
  target.pointsOfInterest = [...(source.pointsOfInterest || [])]
}

function cloneEditorState(source: MapEditorState): MapEditorState {
  return {
    id: source.id,
    name: source.name,
    mapReference: source.mapReference,
    description: source.description,
    imageUrl: source.imageUrl,
    citySlug: source.citySlug,
    cityName: source.cityName,
    cityDescription: source.cityDescription,
    cityCulture: source.cityCulture,
    mapType: source.mapType,
    parentCityMapId: source.parentCityMapId,
    pointsOfInterest: source.pointsOfInterest.map((p) => ({ ...p })),
  }
}

function resetEditor(target: MapEditorState, mapType: 'city' | 'localized') {
  target.id = ''
  target.name = ''
  target.mapReference = ''
  target.description = ''
  target.imageUrl = ''
  target.citySlug = 'hamlet'
  target.cityName = 'Hamlet'
  target.cityDescription = ''
  target.cityCulture = ''
  target.mapType = mapType
  target.parentCityMapId = ''
  target.pointsOfInterest = []
}

function selectExistingMap(mapId: string) {
  const found = maps.value.find((m) => m.id === mapId)
  if (!found) return
  showLegacyPreview.value = false
  existingSelectedId.value = mapId
  copyMapToEditor(found, existingEditor)
  existingEditMode.value = false
  existingSnapshot.value = null
}

function selectLegacyHamlet() {
  existingSelectedId.value = ''
  existingEditMode.value = false
  existingSnapshot.value = null
  resetEditor(existingEditor, 'city')
  showLegacyPreview.value = true
}

function goToCreateCityTabFromLegacy() {
  activeTab.value = 'create-city'
  showLegacyPreview.value = false
}

function onSelectParentGroup(parentId: string) {
  if (parentId.startsWith('orphan-')) return
  selectExistingMap(parentId)
}

function syncChildFromParentMap() {
  if (!newChild.parentCityMapId) return
  const parent = parentMaps.value.find((item) => item.id === newChild.parentCityMapId)
  if (!parent) return

  newChild.citySlug = parent.citySlug
  newChild.cityName = parent.cityName
}

function startExistingEdit() {
  existingEditMode.value = true
  existingSnapshot.value = cloneEditorState(existingEditor)
}

function cancelExistingEdit() {
  if (!existingSnapshot.value) {
    existingEditMode.value = false
    return
  }

  const snapshot = existingSnapshot.value
  existingEditor.id = snapshot.id
  existingEditor.name = snapshot.name
  existingEditor.mapReference = snapshot.mapReference
  existingEditor.description = snapshot.description
  existingEditor.imageUrl = snapshot.imageUrl
  existingEditor.citySlug = snapshot.citySlug
  existingEditor.cityName = snapshot.cityName
  existingEditor.cityDescription = snapshot.cityDescription
  existingEditor.cityCulture = snapshot.cityCulture
  existingEditor.mapType = snapshot.mapType
  existingEditor.parentCityMapId = snapshot.parentCityMapId
  existingEditor.pointsOfInterest = snapshot.pointsOfInterest.map((p) => ({ ...p }))

  existingEditMode.value = false
  existingSnapshot.value = null
}

function onExistingParentChange() {
  if (!existingEditor.parentCityMapId) return
  const parent = parentMaps.value.find((item) => item.id === existingEditor.parentCityMapId)
  if (!parent) return

  existingEditor.citySlug = parent.citySlug
  existingEditor.cityName = parent.cityName
}

async function onUploadForEditor(target: EditorTarget, event: Event) {
  const input = event.target as HTMLInputElement | null
  const file = input?.files?.[0]
  if (!file) return

  if (target === 'existing' && !existingEditMode.value) {
    if (input) input.value = ''
    return
  }

  try {
    const uploaded = await uploadCityMapImage(file)
    if (target === 'existing') {
      existingEditor.imageUrl = uploaded.publicUrl
      existingEditor.mapReference = uploaded.publicUrl
    }
    if (target === 'newCity') {
      newCity.imageUrl = uploaded.publicUrl
      newCity.mapReference = uploaded.publicUrl
    }
    if (target === 'newChild') {
      newChild.imageUrl = uploaded.publicUrl
      newChild.mapReference = uploaded.publicUrl
    }
    feedback.value = 'Imagem enviada com sucesso.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao enviar imagem.'
    feedbackError.value = true
  } finally {
    if (input) input.value = ''
  }
}

async function saveExistingMap() {
  if (!existingEditor.id || !existingEditMode.value) return
  try {
    const resolvedMapReference =
      existingEditor.mapReference?.trim() || existingEditor.imageUrl?.trim() || ''

    if (!resolvedMapReference) {
      feedback.value = 'Envie uma imagem para o bucket antes de salvar o mapa.'
      feedbackError.value = true
      return
    }

    await masterCatalogStore.updateCityMap(existingEditor.id, {
      name: existingEditor.name,
      mapReference: resolvedMapReference,
      description: existingEditor.description,
      imageUrl: existingEditor.imageUrl,
      citySlug: slugify(existingEditor.citySlug) || 'hamlet',
      cityName: existingEditor.cityName || 'Cidade',
      cityDescription: existingEditor.cityDescription,
      cityCulture: existingEditor.cityCulture,
      mapType: existingEditor.mapType,
      parentCityMapId: existingEditor.mapType === 'localized' ? existingEditor.parentCityMapId : '',
      pointsOfInterest: existingEditor.pointsOfInterest,
    })
    await refreshMaps()
    feedback.value = 'Mapa atualizado com sucesso.'
    feedbackError.value = false
    existingEditMode.value = false
    existingSnapshot.value = null
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao atualizar mapa.'
    feedbackError.value = true
  }
}

async function createCityMap() {
  try {
    if (!newCity.imageUrl?.trim()) {
      feedback.value = 'Envie a imagem do mapa pai para o bucket antes de criar a cidade.'
      feedbackError.value = true
      return
    }

    const cityName = newCity.cityName?.trim() || 'Cidade'
    const citySlug = slugify(cityName) || 'nova-cidade'
    const resolvedMapReference = newCity.mapReference?.trim() || newCity.imageUrl?.trim() || ''
    const created = await masterCatalogStore.createCityMap({
      name: `Mapa de ${cityName}`,
      mapReference: resolvedMapReference,
      description: newCity.description,
      imageUrl: newCity.imageUrl,
      citySlug,
      cityName,
      cityDescription: newCity.cityDescription,
      cityCulture: newCity.cityCulture,
      mapType: 'city',
      parentCityMapId: '',
      pointsOfInterest: newCity.pointsOfInterest,
    })
    await refreshMaps()
    selectExistingMap(created.id)
    activeTab.value = 'existing'
    resetEditor(newCity, 'city')
    feedback.value = 'Cidade e mapa pai criados com sucesso.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao criar cidade.'
    feedbackError.value = true
  }
}

async function createChildMap() {
  if (!newChild.parentCityMapId) {
    feedback.value = 'Selecione o mapa pai antes de criar mapa filho.'
    feedbackError.value = true
    return
  }

  if (!newChild.imageUrl?.trim()) {
    feedback.value = 'Envie a imagem do mapa filho para o bucket antes de criar.'
    feedbackError.value = true
    return
  }

  try {
    const parent = parentMaps.value.find((item) => item.id === newChild.parentCityMapId)
    const resolvedCitySlug = slugify(parent?.citySlug || newChild.citySlug) || 'hamlet'
    const resolvedCityName = parent?.cityName || newChild.cityName || 'Cidade'
    const resolvedMapReference = newChild.mapReference?.trim() || newChild.imageUrl?.trim() || ''
    const created = await masterCatalogStore.createCityMap({
      name: newChild.name,
      mapReference: resolvedMapReference,
      description: newChild.description,
      imageUrl: newChild.imageUrl,
      citySlug: resolvedCitySlug,
      cityName: resolvedCityName,
      cityDescription: '',
      cityCulture: '',
      mapType: 'localized',
      parentCityMapId: newChild.parentCityMapId,
      pointsOfInterest: newChild.pointsOfInterest,
    })
    await refreshMaps()
    selectExistingMap(created.id)
    activeTab.value = 'existing'
    resetEditor(newChild, 'localized')
    feedback.value = 'Mapa filho criado e vinculado com sucesso.'
    feedbackError.value = false
  } catch (err: any) {
    feedback.value = err?.response?.data?.message || 'Erro ao criar mapa filho.'
    feedbackError.value = true
  }
}

async function refreshMaps() {
  loading.value = true
  try {
    await masterCatalogStore.fetchCityMaps()
    showLegacyPreview.value = false
    if (!existingSelectedId.value && maps.value.length) {
      selectExistingMap(maps.value[0].id)
    }
  } finally {
    loading.value = false
  }
}

function goMasterPanel() {
  router.push({ name: 'master-panel' })
}

async function logout() {
  await authStore.sair()
  router.push({ name: 'login' })
}

onMounted(async () => {
  await refreshMaps()
  syncChildFromParentMap()
})
</script>


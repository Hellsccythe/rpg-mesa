<template>
  <div class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-zinc-950 border border-red-900/60 rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
      
      <!-- Header fixo -->
      <div class="px-8 py-5 border-b border-red-900/30 flex items-center justify-between bg-zinc-900 shrink-0">
        <h2 class="text-2xl font-bold text-red-400">Criar Novo Personagem</h2>
        <button 
          @click="$emit('close')" 
          class="text-3xl text-zinc-400 hover:text-red-400 transition-colors px-3"
        >
          ×
        </button>
      </div>

      <!-- Corpo com scroll -->
      <div class="flex-1 overflow-y-auto p-8 space-y-8 custom-scroll">
        
        <!-- Avatar -->
        <div>
          <label class="block text-sm text-zinc-400 mb-3">Avatar do Personagem</label>
          <div 
            class="border-2 border-dashed border-red-900/50 hover:border-red-500 rounded-2xl h-80 flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden"
            :class="{ 'border-red-500 bg-red-950/20': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileSelect" />

            <div v-if="previewUrl" class="w-full h-full relative">
              <img :src="previewUrl" class="w-full h-full object-cover" alt="preview" />
              <button 
                @click.stop="removeImage"
                class="absolute top-4 right-4 bg-black/80 hover:bg-red-600 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl"
              >
                ✕
              </button>
            </div>

            <div v-else class="text-center">
              <div class="w-24 h-24 mx-auto mb-5 rounded-2xl border-4 border-red-900/40 flex items-center justify-center text-5xl">
                📸
              </div>
              <p class="text-zinc-300 text-lg">Arraste ou clique para adicionar avatar</p>
              <p class="text-zinc-500 text-sm mt-1">PNG, JPG ou WEBP • Máx 5MB</p>
            </div>
          </div>
        </div>

        <!-- Nome -->
        <div>
          <label class="block text-sm text-zinc-400 mb-2">Nome do Personagem</label>
          <input 
            v-model="form.name"
            type="text"
            class="w-full bg-zinc-900 border border-red-900/30 focus:border-red-500 rounded-2xl px-6 py-4 text-white text-lg outline-none"
            placeholder="Ex: Sir Elandor, o Guardião Templário"
          >
        </div>

        <!-- Indole -->
        <div>
          <label class="block text-sm text-zinc-400 mb-2">Indole (Alinhamento)</label>
          <select 
            v-model="form.indole"
            class="w-full bg-zinc-900 border border-red-900/30 focus:border-red-500 rounded-2xl px-6 py-4 text-white outline-none"
          >
            <option value="bom">Bom</option>
            <option value="neutro-bom">Neutro com tendências boas</option>
            <option value="neutro">Neutro</option>
            <option value="neutro-ruim">Neutro com tendências ruins</option>
            <option value="ruim">Ruim</option>
          </select>
        </div>

        <!-- Aparência -->
        <div>
          <label class="block text-sm text-zinc-400 mb-2">Aparência Física</label>
          <textarea 
            v-model="form.appearance"
            rows="4"
            class="w-full bg-zinc-900 border border-red-900/30 focus:border-red-500 rounded-2xl px-6 py-4 text-white outline-none resize-y min-h-[120px]"
            placeholder="Descreva a aparência física do personagem..."
          ></textarea>
        </div>

        <!-- História -->
        <div>
          <label class="block text-sm text-zinc-400 mb-2">História do Personagem</label>
          <textarea 
            v-model="form.history"
            rows="8"
            class="w-full bg-zinc-900 border border-red-900/30 focus:border-red-500 rounded-2xl px-6 py-4 text-white outline-none resize-y min-h-[200px]"
            placeholder="Escreva a história completa do seu personagem aqui..."
          ></textarea>
        </div>

        <!-- Documento -->
        <div>
          <label class="block text-sm text-zinc-400 mb-2">Documento da História (opcional - Word ou PDF)</label>
          <div 
            class="border-2 border-dashed border-red-900/50 hover:border-red-500 rounded-2xl p-8 text-center cursor-pointer transition-colors"
            @click="triggerDocInput"
          >
            <input ref="docInput" type="file" accept=".doc,.docx,.pdf" class="hidden" @change="handleDocSelect" />
            
            <div v-if="selectedDoc" class="text-green-400 flex items-center justify-center gap-2">
              📄 <span class="font-medium">{{ selectedDoc.name }}</span>
            </div>
            <div v-else>
              <p class="text-zinc-400">Clique para enviar documento</p>
              <p class="text-xs text-zinc-500 mt-1">.doc, .docx ou .pdf</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer fixo -->
      <div class="px-8 py-6 border-t border-red-900/30 flex justify-end gap-4 bg-zinc-900 shrink-0">
        <button 
          @click="$emit('close')"
          class="px-8 py-3 text-zinc-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="createCharacter"
          :disabled="loading || !form.name.trim()"
          class="px-10 py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:text-zinc-400 rounded-2xl font-medium transition-all"
        >
          {{ loading ? 'Criando...' : 'Criar Personagem' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCharactersStore } from '@/stores/characters'

const emit = defineEmits(['close'])
const charactersStore = useCharactersStore()

const fileInput = ref<HTMLInputElement | null>(null)
const docInput = ref<HTMLInputElement | null>(null)

const previewUrl = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const selectedDoc = ref<File | null>(null)
const isDragging = ref(false)
const loading = ref(false)

const form = ref({
  name: '',
  indole: 'neutro',
  appearance: '',
  history: ''
})

// Avatar handlers
const triggerFileInput = () => fileInput.value?.click()
const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) processAvatar(target.files[0])
}
const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer?.files[0]) processAvatar(e.dataTransfer.files[0])
}
const processAvatar = (file: File) => {
  if (!file.type.startsWith('image/')) return alert('Apenas imagens!')
  if (file.size > 5 * 1024 * 1024) return alert('Máximo 5MB!')
  
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}
const removeImage = () => {
  previewUrl.value = null
  selectedFile.value = null
}

// Documento
const triggerDocInput = () => docInput.value?.click()
const handleDocSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files?.[0]) selectedDoc.value = target.files[0]
}

// Criar
const createCharacter = async () => {
  if (!form.value.name.trim()) return

  loading.value = true

  try {
    await charactersStore.createCharacter({
      name: form.value.name.trim(),
      data: {
        indole: form.value.indole,
        appearance: form.value.appearance,
        history: form.value.history,
      }
    }, selectedFile.value || undefined)

    emit('close')
  } catch (err: any) {
    alert('Erro ao criar personagem: ' + err.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: #991b1b;
  border-radius: 3px;
}
</style>
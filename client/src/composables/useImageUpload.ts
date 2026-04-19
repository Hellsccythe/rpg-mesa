import { ref } from 'vue'

interface UseImageUploadOptions {
  maxSizeMb?: number
  acceptedTypes?: string[]
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { maxSizeMb = 5, acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options

  const preview = ref('')
  const file = ref<File | null>(null)
  const isDragging = ref(false)
  const error = ref('')

  function processFile(incoming: File): boolean {
    error.value = ''

    if (!acceptedTypes.includes(incoming.type)) {
      error.value = `Formato nao suportado. Use: ${acceptedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ')}`
      return false
    }

    if (incoming.size > maxSizeMb * 1024 * 1024) {
      error.value = `A imagem deve ter no maximo ${maxSizeMb}MB.`
      return false
    }

    if (preview.value.startsWith('blob:')) URL.revokeObjectURL(preview.value)
    preview.value = URL.createObjectURL(incoming)
    file.value = incoming
    return true
  }

  function onFileInput(event: Event) {
    const target = event.target as HTMLInputElement
    const selected = target.files?.[0]
    if (selected) processFile(selected)
  }

  function onDrop(event: DragEvent) {
    isDragging.value = false
    const dropped = event.dataTransfer?.files?.[0]
    if (dropped) processFile(dropped)
  }

  function onDragOver() {
    isDragging.value = true
  }

  function onDragLeave() {
    isDragging.value = false
  }

  function clear() {
    if (preview.value.startsWith('blob:')) URL.revokeObjectURL(preview.value)
    preview.value = ''
    file.value = null
    error.value = ''
  }

  function setPreview(url: string) {
    preview.value = url
  }

  return {
    preview,
    file,
    isDragging,
    error,
    processFile,
    onFileInput,
    onDrop,
    onDragOver,
    onDragLeave,
    clear,
    setPreview,
  }
}

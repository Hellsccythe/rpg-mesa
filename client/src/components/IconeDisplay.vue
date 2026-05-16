<template>
  <i v-if="isMdi" :class="['mdi', icone]" :style="sizeStyle" aria-hidden="true" />
  <span v-else-if="icone" :style="sizeStyle" style="line-height:1">{{ icone }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icone?: string | null
  size?: string
}>()

const isMdi = computed(() => typeof props.icone === 'string' && props.icone.startsWith('mdi-'))
const sizeStyle = computed(() => props.size ? { fontSize: props.size } : undefined)
</script>

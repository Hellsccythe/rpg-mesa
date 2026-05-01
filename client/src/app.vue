<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'

onMounted(() => {
  document.documentElement.classList.add('theme-dark')
})
</script>

<template>
  <RouterView />
</template>

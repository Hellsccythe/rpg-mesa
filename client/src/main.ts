import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './app.vue'
import VSelect from '@/components/VSelect.vue'
import { useAuthStore } from '@/stores/auth'

import './assets/styles/base.css'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()
const authStore = useAuthStore(pinia)

async function initAuthWithFallback(timeoutMs = 4000) {
  const timeoutPromise = new Promise<void>((resolve) => {
    window.setTimeout(() => {
      console.warn('[bootstrap] initAuth timeout, mounting app with fallback state')
      resolve()
    }, timeoutMs)
  })

  try {
    await Promise.race([authStore.initAuth(), timeoutPromise])
  } catch (error) {
    console.error('[bootstrap] initAuth failed, mounting app anyway:', error)
  }
}

app.use(pinia)
app.use(router)
app.component('v-select', VSelect)

app.mount('#app')

void initAuthWithFallback()

console.log('🎮 RPG Mesa iniciado!')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './app.vue'
import { useAuthStore } from '@/stores/auth'

import './assets/styles/base.css'
import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()
const authStore = useAuthStore(pinia)

await authStore.initAuth()

app.use(pinia)
app.use(router)

app.mount('#app')

console.log('🎮 RPG Mesa iniciado!')

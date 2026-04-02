import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './app.vue'

import './assets/styles/base.css'
import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

console.log('🎮 RPG Mesa iniciado!')

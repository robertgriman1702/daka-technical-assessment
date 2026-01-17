import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import { VueQueryPlugin } from '@tanstack/vue-query'
import './assets/main.css'

import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(VueQueryPlugin)

// Rehidratar auth al arrancar
useAuthStore(pinia).initAuth()

app.mount('#app')

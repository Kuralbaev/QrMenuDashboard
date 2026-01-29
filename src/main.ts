import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/index.scss'
import './assets/styles/tailwind.css'
import './assets/styles/telegram.css'
import { i18n } from './i18n'
import router from './router'
import { useAuthStore } from './store/authStore'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(router)
app.use(pinia)
app.use(i18n)

// Инициализируем auth store для восстановления состояния авторизации
const authStore = useAuthStore()
authStore.init()

app.mount('#app')

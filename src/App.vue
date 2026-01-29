<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Home, UtensilsCrossed, MessageSquare, LogOut } from 'lucide-vue-next'
import { i18n } from './i18n'
import { useTelegram } from './composables/useTelegram'
import { useAuthStore } from './store/authStore'
import router from './router'

const authStore = useAuthStore()
const { locale, t } = useI18n()
const route = useRoute()
const { isTelegram, themeParams } = useTelegram()

const languages = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kk', label: 'KK' },
]

const currentLocale = ref(locale.value)

// Синхронизируем изменения локали
watch(locale, (newLocale) => {
  currentLocale.value = newLocale
})

const changeLocale = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const newLocale = target.value as 'ru' | 'en' | 'kk'
  i18n.global.locale.value = newLocale
  locale.value = newLocale
  currentLocale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

const navItems = [
  { path: '/', name: 'Home', label: 'navbar.home', icon: Home },
  { path: '/products', name: 'Products', label: 'navbar.menu', icon: UtensilsCrossed },
  { path: '/reviews', name: 'Reviews', label: 'navbar.reviews', icon: MessageSquare },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}


const logout = () => {
  authStore.logout()
  router.push('/login')
}

// Вычисляемые стили для Telegram темы
const telegramStyles = computed(() => {
  if (!isTelegram.value || !themeParams.value) return {}
  
  return {
    '--tg-theme-bg-color': themeParams.value.bg_color || '#ffffff',
    '--tg-theme-text-color': themeParams.value.text_color || '#000000',
    '--tg-theme-hint-color': themeParams.value.hint_color || '#999999',
    '--tg-theme-link-color': themeParams.value.link_color || '#2481cc',
    '--tg-theme-button-color': themeParams.value.button_color || '#2481cc',
    '--tg-theme-button-text-color': themeParams.value.button_text_color || '#ffffff',
    '--tg-theme-secondary-bg-color': themeParams.value.secondary_bg_color || '#f1f1f1',
  }
})

onMounted(() => {
  // Применяем стили Telegram при монтировании
  if (isTelegram.value && themeParams.value) {
    Object.entries(telegramStyles.value).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value as string)
    })
  }
})
</script>

<template>
  <div 
    class="min-h-screen"
    :class="[
      isTelegram ? 'pb-16' : 'pb-16',
      isTelegram && themeParams?.bg_color ? '' : 'bg-background'
    ]"
    :style="telegramStyles"
  >
    <!-- Переключатель языка (скрываем в Telegram Mini App) -->
    <div class="p-2 flex justify-end pr-4 -mb-14">
      <select
        :value="currentLocale"
        @change="changeLocale"
        class="flex rounded-md border border-input bg-white h-8 px-1 text-xs shadow-xs transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring cursor-pointer"
      >
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.label }}
        </option>
      </select>
      <!-- exit button -->
      <button @click="logout" v-if="authStore.isAuthenticated" class="text-sm ml-2 text-red-500 hover:text-red-700 border border-red-200 rounded-md p-1 h-8 w-8 flex items-center justify-center">
        <LogOut class="w-4 h-4 text-red-500" />
      </button>
    </div>
    
    <router-view />
    
    <!-- Нижняя навигация -->
    <nav 
      v-if="route.path !== '/login'" 
      class="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
      :class="[
        isTelegram && themeParams?.secondary_bg_color 
          ? '' 
          : 'bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]'
      ]"
      :style="isTelegram && themeParams?.secondary_bg_color ? { backgroundColor: themeParams.secondary_bg_color } : {}"
    >
      <div class="flex justify-around items-center h-16 px-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'h-full rounded-lg transition-all duration-200 relative',
            isActive(item.path)
              ? isTelegram && themeParams?.link_color 
                ? '' 
                : 'text-primary'
              : isTelegram && themeParams?.hint_color
                ? ''
                : 'text-gray-500 hover:text-gray-700'
          ]"
          :style="isActive(item.path) 
            ? isTelegram && themeParams?.link_color ? { color: themeParams.link_color } : {}
            : isTelegram && themeParams?.hint_color ? { color: themeParams.hint_color } : {}
          "
        >
          <!-- Активный индикатор -->
          <div
            v-if="isActive(item.path)"
            class="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full"
            :class="isTelegram && themeParams?.link_color ? '' : 'bg-primary'"
            :style="isTelegram && themeParams?.link_color ? { backgroundColor: themeParams.link_color } : {}"
          />
          
          <!-- Иконка -->
          <component
            :is="item.icon"
            :class="[
              'w-4 h-4 transition-transform duration-200 m-auto mt-3 mb-0',
              isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'
            ]"
            :stroke-width="isActive(item.path) ? 2.5 : 2"
          />
          
          <!-- Текст -->
          <p
            :class="[
              'text-[10px] font-medium transition-all duration-200',
              isActive(item.path) ? 'font-semibold' : ''
            ]"
          >
            {{ t(item.label) }}
          </p>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>

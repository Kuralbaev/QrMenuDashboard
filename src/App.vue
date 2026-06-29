<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { Home, UtensilsCrossed, MessageSquare, LogOut } from 'lucide-vue-next'
import { i18n } from './i18n'
import { useTelegram } from './composables/useTelegram'
import { useAuthStore } from './store/authStore'
import router from './router'
import { useRestaurantStore } from './store/restaurantStore'
import { useProductStore } from './store/productStore'

const authStore = useAuthStore()
const restaurantStore = useRestaurantStore()
const productStore = useProductStore()
const { locale, t } = useI18n()
const route = useRoute()
const { isTelegram, themeParams } = useTelegram()

const initialLoading = ref(true)

const languages = [
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
  { code: 'kk', label: 'KK' },
]

const currentLocale = ref(locale.value)

// Синхронизируем изменения локали
watch(locale, newLocale => {
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
  {
    path: '/products',
    name: 'Products',
    label: 'navbar.menu',
    icon: UtensilsCrossed,
  },
  {
    path: '/reviews',
    name: 'Reviews',
    label: 'navbar.reviews',
    icon: MessageSquare,
  },
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
    '--tg-theme-button-text-color':
      themeParams.value.button_text_color || '#ffffff',
    '--tg-theme-secondary-bg-color':
      themeParams.value.secondary_bg_color || '#f1f1f1',
  }
})

const loadInitialData = async () => {
  // Загружаем ресторан и продукты только если пользователь авторизован и не на странице логина
  if (authStore.isAuthenticated && route.path !== '/login') {
    initialLoading.value = true
    try {
      await Promise.all([
        restaurantStore.fetchRestaurants(),
        productStore.fetchProducts(),
      ])
    } catch (error) {
      console.error('Ошибка при загрузке начальных данных:', error)
    } finally {
      initialLoading.value = false
    }
  } else {
    router.push('/login')
    initialLoading.value = false
  }
}

onMounted(async () => {
  // Применяем стили Telegram при монтировании
  if (isTelegram.value && themeParams.value) {
    Object.entries(telegramStyles.value).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value as string)
    })
  }

  await loadInitialData()
})

// Отслеживаем изменения маршрута для загрузки данных при переходе с логина
watch(
  () => route.path,
  async newPath => {
    if (newPath !== '/login' && authStore.isAuthenticated) {
      // Если данные еще не загружены, загружаем их
      if (!restaurantStore.restaurant || productStore.products.length === 0) {
        await loadInitialData()
      }
    }
  }
)
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-muted/40 to-background"
    :class="isTelegram ? 'pb-16' : 'pb-16'"
    :style="telegramStyles"
  >
    <!-- Верхняя панель -->
    <header
      v-if="route.path !== '/login'"
      class="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md"
    >
      <div class="mx-auto flex max-w-lg items-center justify-between gap-2 px-4 py-2.5 md:max-w-2xl">
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-foreground">
            {{ restaurantStore.restaurant?.title_ru || 'LUNIQ Dashboard' }}
          </p>
        </div>
        <div class="flex shrink-0 items-center gap-1.5">
          <select
            :value="currentLocale"
            @change="changeLocale"
            class="h-8 rounded-lg border border-border bg-card px-2 text-xs font-medium text-foreground shadow-sm"
          >
            <option v-for="lang in languages" :key="lang.code" :value="lang.code">
              {{ lang.label }}
            </option>
          </select>
          <button
            v-if="authStore.isAuthenticated"
            type="button"
            @click="logout"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 text-destructive transition hover:bg-destructive/10"
            :aria-label="t('common.back')"
          >
            <LogOut class="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>

    <!-- Переключатель языка на логине -->
    <div v-else class="absolute right-4 top-4 z-10">
      <select
        :value="currentLocale"
        @change="changeLocale"
        class="h-8 rounded-lg border border-border bg-card px-2 text-xs"
      >
        <option v-for="lang in languages" :key="lang.code" :value="lang.code">
          {{ lang.label }}
        </option>
      </select>
    </div>

    <!-- Лоадер начальной загрузки -->
    <div
      v-if="initialLoading && route.path !== '/login'"
      class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-4">
        <div
          class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"
        ></div>
        <p class="text-sm text-gray-600">{{ t('common.loading') }}</p>
      </div>
    </div>

    <router-view v-if="!initialLoading || route.path === '/login'" />

    <!-- Нижняя навигация -->
    <nav
      v-if="route.path !== '/login'"
      class="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom border-t border-border/60 bg-background/95 backdrop-blur-md"
      :style="
        isTelegram && themeParams?.secondary_bg_color
          ? { backgroundColor: themeParams.secondary_bg_color }
          : {}
      "
    >
      <div class="mx-auto flex h-[4.25rem] max-w-lg items-stretch justify-around px-2 md:max-w-2xl">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="group relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-xl transition-colors"
          :class="
            isActive(item.path)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
        >
          <div
            v-if="isActive(item.path)"
            class="absolute inset-x-3 top-1 h-0.5 rounded-full bg-primary"
          />
          <component
            :is="item.icon"
            class="h-5 w-5 transition-transform group-active:scale-95"
            :stroke-width="isActive(item.path) ? 2.5 : 2"
          />
          <span
            class="text-[10px] font-medium"
            :class="isActive(item.path) ? 'font-semibold' : ''"
          >
            {{ t(item.label) }}
          </span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style scoped></style>

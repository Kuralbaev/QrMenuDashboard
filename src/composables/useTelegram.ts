import { ref, onMounted, computed } from 'vue'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name?: string
            last_name?: string
            username?: string
            language_code?: string
            is_premium?: boolean
            photo_url?: string
          }
          auth_date: number
          hash: string
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        isClosingConfirmationEnabled: boolean
        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }) => void
        }
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void
          selectionChanged: () => void
        }
        ready: () => void
        expand: () => void
        close: () => void
        sendData: (data: string) => void
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void
        openTelegramLink: (url: string) => void
        openInvoice: (url: string, callback?: (status: string) => void) => void
        showPopup: (params: {
          title?: string
          message: string
          buttons?: Array<{
            id?: string
            type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
            text: string
          }>
        }, callback?: (id: string) => void) => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void
        showScanQrPopup: (params: {
          text?: string
        }, callback?: (data: string) => void) => void
        closeScanQrPopup: () => void
        readTextFromClipboard: (callback?: (text: string) => void) => void
        requestWriteAccess: (callback?: (granted: boolean) => void) => void
        requestContact: (callback?: (granted: boolean) => void) => void
        onEvent: (eventType: string, eventHandler: () => void) => void
        offEvent: (eventType: string, eventHandler: () => void) => void
      }
    }
  }
}

export function useTelegram() {
  const isTelegram = ref(false)
  const webApp = ref<Window['Telegram']['WebApp'] | null>(null)
  const theme = ref<'light' | 'dark'>('light')
  const themeParams = ref<Window['Telegram']['WebApp']['themeParams'] | null>(null)

  onMounted(() => {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram?.WebApp) {
      isTelegram.value = true
      webApp.value = window.Telegram.WebApp
      
      // Инициализируем Web App
      webApp.value.ready()
      webApp.value.expand()
      
      // Получаем тему и параметры темы
      theme.value = webApp.value.colorScheme
      themeParams.value = webApp.value.themeParams
      
      // Слушаем изменения темы
      webApp.value.onEvent('themeChanged', () => {
        theme.value = webApp.value!.colorScheme
        themeParams.value = webApp.value!.themeParams
        updateThemeColors()
      })
      
      // Применяем цвета темы Telegram
      updateThemeColors()
    }
  })

  const updateThemeColors = () => {
    if (!webApp.value || !themeParams.value) return
    
    const root = document.documentElement
    
    // Применяем цвета Telegram к CSS переменным
    if (themeParams.value.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', themeParams.value.bg_color)
    }
    if (themeParams.value.text_color) {
      root.style.setProperty('--tg-theme-text-color', themeParams.value.text_color)
    }
    if (themeParams.value.hint_color) {
      root.style.setProperty('--tg-theme-hint-color', themeParams.value.hint_color)
    }
    if (themeParams.value.link_color) {
      root.style.setProperty('--tg-theme-link-color', themeParams.value.link_color)
    }
    if (themeParams.value.button_color) {
      root.style.setProperty('--tg-theme-button-color', themeParams.value.button_color)
    }
    if (themeParams.value.button_text_color) {
      root.style.setProperty('--tg-theme-button-text-color', themeParams.value.button_text_color)
    }
    if (themeParams.value.secondary_bg_color) {
      root.style.setProperty('--tg-theme-secondary-bg-color', themeParams.value.secondary_bg_color)
    }
    
    // Устанавливаем цвет фона и заголовка
    if (themeParams.value.bg_color) {
      webApp.value.backgroundColor = themeParams.value.bg_color
    }
    if (themeParams.value.bg_color) {
      webApp.value.headerColor = themeParams.value.bg_color
    }
  }

  const user = computed(() => {
    return webApp.value?.initDataUnsafe?.user || null
  })

  const hapticFeedback = {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
      webApp.value?.HapticFeedback.impactOccurred(style)
    },
    notificationOccurred: (type: 'error' | 'success' | 'warning') => {
      webApp.value?.HapticFeedback.notificationOccurred(type)
    },
    selectionChanged: () => {
      webApp.value?.HapticFeedback.selectionChanged()
    },
  }

  return {
    isTelegram,
    webApp,
    theme,
    themeParams,
    user,
    hapticFeedback,
  }
}

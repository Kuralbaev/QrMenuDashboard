import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { AuthService } from '../services/authService'
import type { User } from '../types/api'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const isAuthenticated = ref(false)
    const user = ref<User | null>(null)
    const token = ref<string | null>(null)

    // Синхронизируем isAuthenticated с наличием токена
    watch(token, (newToken) => {
      isAuthenticated.value = !!newToken
      if (!newToken) {
        user.value = null
      }
    }, { immediate: true })

    // Инициализация: проверяем наличие токена при загрузке
    function init() {
      // Если токен есть, устанавливаем авторизацию
      if (token.value) {
        isAuthenticated.value = true
      } else {
        // Если токена нет, сбрасываем авторизацию
        isAuthenticated.value = false
        user.value = null
      }
    }

    async function login(email: string, password: string) {
      const response = await AuthService.login(email, password)
      token.value = response.token
      user.value = response.user
      isAuthenticated.value = true
    }

    async function logout() {
      token.value = null
      user.value = null
      isAuthenticated.value = false
    }

    // Инициализируем при создании store
    init()

    return {
      isAuthenticated,
      user,
      token,
      login,
      logout,
      init,
    }
  },
  {
    persist: true,
  }
)

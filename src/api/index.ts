import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // from .env files
})

axiosInstance.interceptors.request.use(config => {
  // Добавляем Bearer token из auth store
  const authStore = useAuthStore()
  if (authStore.token && !config.url?.includes('restaurant-comments')) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.error('Unauthorized, logging out...')
      // Разлогиниваем пользователя при 401 ошибке
      const authStore = useAuthStore()
      authStore.logout()
      // Редиректим на страницу логина только если мы не на ней уже
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axiosInstance

import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../../store/authStore'

export function authMiddleware(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore()
  
  // Проверяем, требуется ли авторизация для маршрута
  // По умолчанию все маршруты требуют авторизации, кроме явно помеченных
  const requiresAuth = to.meta.requiresAuth !== false
  
  // Если маршрут требует авторизации и пользователь не авторизован
  if (requiresAuth && !authStore.isAuthenticated) {
    // Сохраняем путь, куда пользователь хотел попасть, для редиректа после входа
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
    return
  }
  
  // Если пользователь авторизован и пытается зайти на страницу логина
  if (to.path === '/login' && authStore.isAuthenticated) {
    // Редиректим на главную или на сохраненный путь
    const redirect = (to.query.redirect as string) || '/'
    next(redirect)
    return
  }
  
  // Разрешаем переход
  next()
}

<template>
  <div class="flex min-h-screen items-center justify-center bg-background p-6">
    <div class="w-full max-w-md space-y-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">Вход</h1>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            :aria-invalid="!!errors.email"
            :disabled="isLoading"
            required
          />
          <p v-if="errors.email" class="text-[10px] text-destructive">
            {{ errors.email }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="password">Пароль</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="Введите пароль"
            autocomplete="current-password"
            :aria-invalid="!!errors.password"
            :disabled="isLoading"
            required
          />
          <p v-if="errors.password" class="text-[10px] text-destructive">
            {{ errors.password }}
          </p>
        </div>

        <p v-if="errors.general" class="text-[10px] text-destructive">
          {{ errors.general }}
        </p>

        <Button type="submit" class="w-full" :disabled="isLoading">
          <span v-if="!isLoading">Войти</span>
          <span v-else>Вход...</span>
        </Button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/authStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = ref<{
  email?: string
  password?: string
  general?: string
}>({})

const validateEmail = (value: string): string | undefined => {
  if (!value) {
    return 'Email обязателен'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return 'Некорректный email адрес'
  }
  return undefined
}

const validatePassword = (value: string): string | undefined => {
  if (!value) {
    return 'Пароль обязателен'
  }
  if (value.length < 6) {
    return 'Пароль должен содержать минимум 6 символов'
  }
  return undefined
}

const handleSubmit = async () => {
  errors.value = {}
  
  const emailError = validateEmail(email.value)
  const passwordError = validatePassword(password.value)
  
  if (emailError || passwordError) {
    errors.value = {
      email: emailError,
      password: passwordError,
    }
    return
  }
  
  isLoading.value = true
  errors.value = {}
  
  try {
    await authStore.login(email.value, password.value)
    // Редиректим на сохраненный путь или на главную
    const redirect = router.currentRoute.value.query.redirect as string || '/'
    router.push(redirect)
  } catch (error: any) {
    errors.value.general =
      error?.response?.data?.message || 'Ошибка входа. Проверьте свои учетные данные.'
  } finally {
    isLoading.value = false
  }
}
</script>

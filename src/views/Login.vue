<template>
  <div
    class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10"
  >
    <!-- фон -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,var(--primary)/0.12,transparent)]"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-primary/5 blur-3xl"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute -left-16 bottom-1/4 h-48 w-48 rounded-full bg-primary/8 blur-3xl"
      aria-hidden="true"
    />

    <div class="relative w-full max-w-[400px]">
      <!-- шапка -->
      <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold tracking-tight text-foreground">
          LUNIQ Dashboard
        </h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Войдите, чтобы управлять меню и статистикой
        </p>
      </div>

      <!-- форма -->
      <div
        class="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-lg backdrop-blur-sm"
      >
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div class="space-y-1.5">
            <Label
              for="email"
              class="text-xs font-medium text-muted-foreground"
            >
              Email
            </Label>
            <div class="relative">
              <Mail
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="email"
                v-model="email"
                type="email"
                placeholder="you@example.com"
                autocomplete="email"
                :aria-invalid="!!errors.email"
                :disabled="isLoading"
                class="h-11 rounded-xl border-border/70 bg-background pl-10 text-sm"
                required
              />
            </div>
            <p v-if="errors.email" class="text-[11px] text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <div class="space-y-1.5">
            <Label
              for="password"
              class="text-xs font-medium text-muted-foreground"
            >
              Пароль
            </Label>
            <div class="relative">
              <Lock
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="Введите пароль"
                autocomplete="current-password"
                :aria-invalid="!!errors.password"
                :disabled="isLoading"
                class="h-11 rounded-xl border-border/70 bg-background pl-10 text-sm"
                required
              />
            </div>
            <p v-if="errors.password" class="text-[11px] text-destructive">
              {{ errors.password }}
            </p>
          </div>

          <div
            v-if="errors.general"
            class="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
          >
            {{ errors.general }}
          </div>

          <Button
            type="submit"
            class="h-11 w-full rounded-xl text-sm font-semibold shadow-sm"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Вход...' : 'Войти' }}
          </Button>
        </form>
      </div>

      <p class="mt-6 text-center text-[11px] text-muted-foreground/80">
        Панель управления рестораном · LUNIQ
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Mail, Lock, Loader2 } from 'lucide-vue-next'
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
    const redirect = (router.currentRoute.value.query.redirect as string) || '/'
    router.push(redirect)
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } }
    errors.value.general =
      err?.response?.data?.message ||
      'Ошибка входа. Проверьте свои учетные данные.'
  } finally {
    isLoading.value = false
  }
}
</script>

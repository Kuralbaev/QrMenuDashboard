import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import en from './locales/en.json'
import kk from './locales/kk.json'

const messages = {
  ru,
  en,
  kk,
}

// Получаем сохраненный язык из localStorage или используем русский по умолчанию
const savedLocale = localStorage.getItem('locale') || 'ru'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'ru',
  messages,
})

export default i18n

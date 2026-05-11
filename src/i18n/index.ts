import { createI18n } from 'vue-i18n'
import ru from './locales/ru.json'
import en from './locales/en.json'
import kk from './locales/kk.json'
import ch from './locales/ch.json'
import az from './locales/az.json'
import tr from './locales/tr.json'
import ky from './locales/ky.json'
import vi from './locales/vi.json'

const messages = {
  ru,
  en,
  kk,
  ch,
  az,
  tr,
  ky,
  vi
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

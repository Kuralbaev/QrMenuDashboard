<template>
  <PageShell>
    <div class="mb-4 flex items-center gap-3">
      <Button variant="outline" class="h-9 w-9 shrink-0 rounded-xl p-0" @click="goBack">
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <h1 class="min-w-0 truncate text-lg font-bold">{{ product?.[`title_${locale}`] }}</h1>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">{{ t('product.loading') }}</p>
    </div>

    <!-- Форма редактирования -->
    <div v-else-if="product" class="">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Изображение -->
        <div class="space-y-4">
          <!-- Загрузка нового изображения -->
          <div class="border border-dashed border-gray-300 rounded-lg p-6">
            <img
              v-if="product.image && typeof product.image === 'object'"
              :src="
                API_BASE_URL +
                (product.image.formats?.thumbnail?.url || product.image.url)
              "
              :alt="product.title_ru || 'Product image'"
              class="w-32 h-32 object-cover rounded border border-gray-200 mb-4 m-auto"
            />
            <input
              id="image-upload"
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              class="hidden"
              @change="handleFileSelect"
            />

            <div v-if="!uploadingImage && !previewImage" class="text-center">
              <label
                for="image-upload"
                class="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span class="text-sm font-medium">
                  {{ t('product.uploadImage') }}
                </span>
              </label>
              <p class="text-xs text-gray-500 mt-2">
                {{ t('product.imageFormats') }}
              </p>
            </div>

            <!-- Превью загружаемого изображения -->
            <div v-if="previewImage" class="space-y-4">
              <div class="flex items-start gap-4">
                <img
                  :src="previewImage"
                  alt="Preview"
                  class="w-32 h-32 object-cover rounded border border-gray-200"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-700 mb-1">
                    {{ selectedFile?.name }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ formatFileSize(selectedFile?.size || 0) }}
                  </p>
                  <div class="flex gap-2 mt-3">
                    <Button
                      type="button"
                      size="sm"
                      @click="uploadImage"
                      :disabled="uploadingImage"
                    >
                      <span v-if="uploadingImage">
                        {{ t('common.loading') }}
                      </span>
                      <span v-else>{{ t('common.save') }}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      @click="cancelImageUpload"
                      :disabled="uploadingImage"
                    >
                      {{ t('common.cancel') }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Состояние загрузки -->
            <div v-if="uploadingImage" class="text-center py-4">
              <p class="text-sm text-gray-600">{{ t('common.loading') }}</p>
            </div>
          </div>

          <!-- Ошибка загрузки -->
          <div
            v-if="imageError"
            class="p-2 bg-red-50 border border-red-200 rounded-md"
          >
            <p class="text-xs text-red-700">{{ imageError }}</p>
          </div>
        </div>

        <!-- Название продукта (динамические языковые поля) -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <h2 class="text-base font-medium mb-4">{{ t('product.name') }}</h2>
          <div
            v-for="langField in titleFields"
            :key="langField.key"
            class="space-y-2"
          >
            <Label :for="langField.key" class="mb-2 block">
              {{ langField.label }}
            </Label>
            <Input
              :id="langField.key"
              v-model="formData[langField.key]"
              :placeholder="`${t('product.name')} (${langField.label})`"
              class="w-full"
              :required="langField.key === 'title_ru'"
            />
          </div>
        </div>

        <!-- Описание (динамические языковые поля) -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <h2 class="text-base font-medium mb-4">
            {{ t('product.description') }}
          </h2>
          <div
            v-for="langField in descriptionFields"
            :key="langField.key"
            class="space-y-2"
          >
            <Label :for="langField.key" class="mb-2 block">
              {{ langField.label }}
            </Label>
            <textarea
              :id="langField.key"
              v-model="formData[langField.key]"
              :placeholder="`${t('product.description')} (${langField.label})`"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
              rows="4"
            />
          </div>
        </div>

        <!-- Цена -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <Label for="price" class="mb-2 block">{{ t('product.price') }}</Label>
          <Input
            id="price"
            v-model="formData.price"
            type="text"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full"
            required
          />
          <Label for="old_price" class="mb-2 block">
            {{ t('product.oldPrice') }}
          </Label>
          <Input
            id="old_price"
            v-model="formData.old_price"
            type="text"
            step="0.01"
            min="0"
            placeholder="0.00"
            class="w-full"
          />
        </div>

        <!-- Варианты объёма / цены (list_price) -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <h2 class="text-base font-medium">{{ t('product.listPrices') }}</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              @click="addListPriceRow"
            >
              {{ t('product.addPriceRow') }}
            </Button>
          </div>

          <p v-if="listPriceRows.length === 0" class="text-sm text-gray-500">
            —
          </p>

          <div
            v-else
            class="rounded-lg border border-gray-200 divide-y divide-gray-200 overflow-hidden"
          >
            <div
              v-for="(row, idx) in listPriceRows"
              :key="row.id != null ? `id-${row.id}` : `row-${idx}`"
              class="bg-gray-50/50"
            >
              <div
                class="flex w-full items-stretch gap-1 min-h-[3rem]"
                :class="[
                  isListPriceAccordionOpen(idx)
                    ? 'bg-white border-b border-gray-100'
                    : '',
                ]"
              >
                <button
                  type="button"
                  class="flex flex-1 items-center gap-3 px-3 py-3 text-left min-w-0 hover:bg-gray-100/80 transition-colors"
                  :aria-expanded="isListPriceAccordionOpen(idx)"
                  @click="toggleListPriceAccordion(idx)"
                >
                  <ChevronDown
                    class="h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200"
                    :class="{ '-rotate-180': isListPriceAccordionOpen(idx) }"
                  />
                  <span class="text-sm font-medium text-gray-900 shrink-0">
                    {{ t('product.listPriceRow', { n: idx + 1 }) }}
                  </span>
                  <span
                    v-if="listPriceRowSummary(row)"
                    class="text-sm text-gray-500 truncate"
                  >
                    {{ listPriceRowSummary(row) }}
                  </span>
                </button>
                <div class="flex items-center pr-2 py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    class="text-red-600 border-red-200 shrink-0"
                    @click.stop="removeListPriceRow(idx)"
                  >
                    {{ t('common.delete') }}
                  </Button>
                </div>
              </div>

              <div
                v-show="isListPriceAccordionOpen(idx)"
                class="px-3 pb-4 pt-1 space-y-3 bg-white border-b border-gray-100 last:border-b-0"
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div
                    v-for="tkey in listPriceTitleKeys"
                    :key="`${idx}-${tkey}`"
                    class="space-y-1"
                  >
                    <Label :for="`${idx}-${tkey}`">
                      {{
                        t('product.listPriceVariantTitle', {
                          code: titleKeyLanguageLabel(tkey),
                        })
                      }}
                    </Label>
                    <Input
                      :id="`${idx}-${tkey}`"
                      v-model="row.titles[tkey]"
                      type="text"
                      class="w-full"
                    />
                  </div>
                </div>

                <div class="space-y-1 max-w-xs">
                  <Label :for="`list-price-price-${idx}`">
                    {{ t('product.price') }}
                  </Label>
                  <Input
                    :id="`list-price-price-${idx}`"
                    v-model="row.price"
                    type="text"
                    placeholder="0"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Статус публикации -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <Label class="mb-3 block text-sm font-medium">
            {{ t('product.status') }}
          </Label>
          <div class="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
            <button
              type="button"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all w-full',
                formData.status === 'published'
                  ? 'bg-green-200 text-green-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
              @click="togglePublish(true)"
              :disabled="saving || publishing"
            >
              <span v-if="publishing && formData.status === 'published'">
                {{ t('product.publishing') }}
              </span>
              <span v-else>{{ t('product.published') }}</span>
            </button>
            <button
              type="button"
              :class="[
                'px-4 py-2 rounded-md text-sm font-medium transition-all w-full',
                formData.status === 'draft'
                  ? 'bg-red-200 text-red-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              ]"
              @click="togglePublish(false)"
              :disabled="saving || publishing"
            >
              <span v-if="publishing && formData.status === 'draft'">
                {{ t('product.unpublishing') }}
              </span>
              <span v-else>{{ t('product.draft') }}</span>
            </button>
          </div>
        </div>

        <!-- Время готовки (мин) -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <Label for="cooking_time" class="mb-2 block">
            {{ t('product.cookingTime') }}
          </Label>
          <Input
            id="cooking_time"
            v-model="formData.cooking_time"
            type="number"
            placeholder="0"
          />
        </div>

        <!-- Тип блюда -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <Label for="dish_type" class="mb-2 block">
            {{ t('product.dishType') }}
          </Label>
          <select
            id="dish_type"
            v-model="formData.dish_type"
            class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{{ t('product.selectDishType') }}</option>
            <option value="sharp">{{ t('dishTypes.sharp') }}</option>
            <option value="vegetarian">{{ t('dishTypes.vegetarian') }}</option>
            <option value="lactose_free">
              {{ t('dishTypes.lactose_free') }}
            </option>
            <option value="gluten_free">
              {{ t('dishTypes.gluten_free') }}
            </option>
            <option value="halal">{{ t('dishTypes.halal') }}</option>
            <option value="new">{{ t('dishTypes.new') }}</option>
            <option value="chef">{{ t('dishTypes.chef') }}</option>
            <option value="fitnes">{{ t('dishTypes.fitnes') }}</option>
            <option value="pre_order">{{ t('dishTypes.pre_order') }}</option>
          </select>
        </div>

        <!-- Рекомендация -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <Label for="recommendation" class="mb-2 block">
            {{ t('product.recommendation') }}
          </Label>
          <div class="flex items-center gap-3">
            <input
              id="recommendation"
              type="checkbox"
              v-model="formData.recommendation"
              class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label
              for="recommendation"
              class="text-sm text-gray-700 cursor-pointer"
            >
              {{ t('product.recommendationLabel') }}
            </label>
          </div>
        </div>

        <!-- Уровень сложности -->
        <div class="space-y-4 border border-gray-200 p-3 rounded-lg">
          <Label for="level" class="mb-2 block">
            {{ t('product.level') }}
          </Label>
          <Input id="level" v-model="formData.level" type="number" />
        </div>

        <!-- Даты -->
        <div
          v-if="product"
          class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200"
        >
          <div>
            <Label class="text-xs text-gray-500">
              {{ t('product.created') }}
            </Label>
            <p class="text-sm text-gray-700 mt-1">
              {{ formatDate(product.createdAt, 'DD.MM.YYYY HH:mm') }}
            </p>
          </div>
          <div>
            <Label class="text-xs text-gray-500">
              {{ t('product.updatedAt') }}
            </Label>
            <p class="text-sm text-gray-700 mt-1">
              {{ formatDate(product.updatedAt, 'DD.MM.YYYY HH:mm') }}
            </p>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="flex gap-4 pt-6 border-t border-gray-200">
          <Button type="submit" :disabled="saving" class="flex-1">
            <span v-if="saving">{{ t('product.saving') }}</span>
            <span v-else>{{ t('product.saveChanges') }}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            @click="goBack"
            :disabled="saving"
          >
            {{ t('common.cancel') }}
          </Button>
        </div>

        <!-- Сообщение об ошибке -->
        <div
          v-if="error"
          class="p-3 bg-red-50 border border-red-200 rounded-md fixed top-4 left-4 right-4 z-50"
        >
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>

        <!-- Сообщение об успехе -->
        <div
          v-if="successMessage"
          class="p-3 bg-green-50 border border-green-200 rounded-md fixed top-4 left-4 right-4 z-50"
        >
          <p class="text-sm text-green-700">{{ successMessage }}</p>
        </div>
      </form>
    </div>

    <!-- Сообщение об ошибке загрузки -->
    <div v-else class="text-center py-12">
      <p class="text-red-500">{{ t('product.error') }}</p>
      <Button variant="outline" @click="goBack" class="mt-4">
        {{ t('product.backToList') }}
      </Button>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import PageShell from '../components/layout/PageShell.vue'
import { useProductService } from '../services/productService'
import { useDateTime } from '../composables/useDateTime'
import { useI18n } from 'vue-i18n'
import { API_BASE_URL } from '../env'
import type { Product } from '../types/api'
import { ArrowLeft, ChevronDown } from 'lucide-vue-next'

const { t, locale } = useI18n()

const route = useRoute()
const router = useRouter()
const productService = useProductService()
const { formatDate } = useDateTime()

const product = ref<Product | null>(null)
const loading = ref(true)
const saving = ref(false)
const publishing = ref(false)
const error = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewImage = ref<string | null>(null)
const uploadingImage = ref(false)
const imageError = ref<string | null>(null)

const formData = reactive<Record<string, any>>({
  price: '',
  old_price: '',
  status: 'draft',
  cooking_time: '',
  dish_type: '',
  level: '',
  recommendation: false,
})

// Маппинг языковых кодов на названия
const languageLabels: Record<string, string> = {
  ru: 'RU',
  en: 'EN',
  kk: 'KK',
}

// Функция для определения языковых полей из данных продукта
const detectLanguageFields = (
  data: Product,
  prefix: string
): Array<{ key: string; label: string }> => {
  const fields: Array<{ key: string; label: string }> = []
  const languageCodes = new Set<string>()

  // Находим все поля с префиксом и языковым суффиксом
  Object.keys(data).forEach(key => {
    if (key.startsWith(prefix + '_')) {
      const langCode = key.replace(prefix + '_', '')
      if (langCode && /^[a-z]{2}$/i.test(langCode)) {
        languageCodes.add(langCode.toLowerCase())
      }
    }
  })

  // Сортируем языки (ru всегда первый)
  const sortedLanguages = Array.from(languageCodes).sort((a, b) => {
    if (a === 'ru') return -1
    if (b === 'ru') return 1
    return a.localeCompare(b)
  })

  // Создаем массив полей
  sortedLanguages.forEach(lang => {
    const key = `${prefix}_${lang}`
    const label = languageLabels[lang] || lang.toUpperCase()
    fields.push({ key, label })
  })

  return fields
}

// Вычисляем языковые поля для title
const titleFields = computed(() => {
  if (!product.value) return []
  return detectLanguageFields(product.value, 'title')
})

// Вычисляем языковые поля для description
const descriptionFields = computed(() => {
  if (!product.value) return []
  return detectLanguageFields(product.value, 'description')
})

const productId = computed(() => {
  const id = route.params.id
  return Array.isArray(id) ? id[0] : id
})

type ListPriceRow = {
  id?: number
  price: string
  titles: Record<string, string>
}

const DEFAULT_LIST_PRICE_TITLE_KEYS = [
  'title_ru',
  'title_en',
  'title_kk',
  'title_ch',
  'title_az',
] as const

const listPriceRows = ref<ListPriceRow[]>([])

/** Одновременно раскрыта одна позиция list_price (-1 — все свёрнуты) */
const openListPriceAccordionIndex = ref<number>(0)

function isListPriceAccordionOpen(idx: number): boolean {
  return openListPriceAccordionIndex.value === idx
}

function toggleListPriceAccordion(idx: number): void {
  openListPriceAccordionIndex.value =
    openListPriceAccordionIndex.value === idx ? -1 : idx
}

function listPriceRowSummary(row: ListPriceRow): string {
  const title =
    row.titles['title_ru']?.trim() ||
    Object.values(row.titles).find(v => String(v).trim()) ||
    ''
  const price = String(row.price ?? '').trim()
  if (title && price) return `${title} · ${price}`
  if (title) return title
  if (price) return price
  return ''
}

function sortListPriceTitleKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const la = a.replace(/^title_/i, '')
    const lb = b.replace(/^title_/i, '')
    if (la === 'ru') return -1
    if (lb === 'ru') return 1
    return la.localeCompare(lb)
  })
}

function collectListPriceTitleKeys(
  productData: Product | null,
  rows: ListPriceRow[]
): string[] {
  const keys = new Set<string>([...DEFAULT_LIST_PRICE_TITLE_KEYS])
  const raw = productData?.list_price
  if (Array.isArray(raw)) {
    for (const item of raw as Record<string, unknown>[]) {
      if (item && typeof item === 'object') {
        for (const k of Object.keys(item)) {
          if (k.startsWith('title_')) keys.add(k)
        }
      }
    }
  }
  for (const row of rows) {
    for (const k of Object.keys(row.titles)) {
      if (k.startsWith('title_')) keys.add(k)
    }
  }
  return sortListPriceTitleKeys([...keys])
}

const listPriceTitleKeys = computed(() =>
  collectListPriceTitleKeys(product.value, listPriceRows.value)
)

function normalizeListPriceRows(data: Product): ListPriceRow[] {
  const raw = data.list_price
  const keys = collectListPriceTitleKeys(data, [])
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw.map((item: Record<string, unknown>) => ({
    id: typeof item.id === 'number' ? item.id : undefined,
    price: String(item.price ?? ''),
    titles: keys.reduce(
      (acc, k) => {
        acc[k] = String(item[k] ?? '')
        return acc
      },
      {} as Record<string, string>
    ),
  }))
}

function titleKeyLanguageLabel(key: string): string {
  return key.replace(/^title_/i, '').toUpperCase()
}

function addListPriceRow() {
  const keys = listPriceTitleKeys.value
  const titles: Record<string, string> = {}
  keys.forEach(k => {
    titles[k] = ''
  })
  listPriceRows.value = [...listPriceRows.value, { price: '', titles }]
  openListPriceAccordionIndex.value = listPriceRows.value.length - 1
}

function removeListPriceRow(index: number) {
  const open = openListPriceAccordionIndex.value
  listPriceRows.value = listPriceRows.value.filter((_, i) => i !== index)
  const newLen = listPriceRows.value.length
  if (newLen === 0) {
    openListPriceAccordionIndex.value = -1
  } else if (open === index) {
    openListPriceAccordionIndex.value = Math.min(index, newLen - 1)
  } else if (open > index) {
    openListPriceAccordionIndex.value = open - 1
  }
}

function buildListPricePayload(): Record<string, unknown>[] {
  const keys = listPriceTitleKeys.value
  return listPriceRows.value
    .map(row => {
      const priceNum = parseFloat(String(row.price).replace(',', '.'))
      const payload: Record<string, unknown> = {
        price: Number.isFinite(priceNum) ? priceNum : 0,
      }
      keys.forEach(k => {
        payload[k] = row.titles[k] ?? ''
      })
      if (row.id != null) payload.id = row.id
      return payload
    })
    .filter(payload => {
      const priceVal = Number(payload.price)
      const hasPrice = Number.isFinite(priceVal) && priceVal !== 0
      const hasTitle = keys.some(
        k => String(payload[k] ?? '').trim().length > 0
      )
      return hasPrice || hasTitle
    })
}

const loadProduct = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await productService.getById(productId.value as string)
    product.value = data
    listPriceRows.value = normalizeListPriceRows(data)
    openListPriceAccordionIndex.value = listPriceRows.value.length > 0 ? 0 : -1

    // Очищаем formData
    Object.keys(formData).forEach(key => {
      if (
        key !== 'price' &&
        key !== 'published' &&
        key !== 'recommendation' &&
        key !== 'level'
      ) {
        delete formData[key]
      }
    })

    // Заполняем форму данными продукта
    // Динамически заполняем все языковые поля для title
    titleFields.value.forEach(field => {
      formData[field.key] = (data as any)[field.key] || data.name || ''
    })

    // Динамически заполняем все языковые поля для description
    descriptionFields.value.forEach(field => {
      formData[field.key] = (data as any)[field.key] || data.description || ''
    })

    formData.price = String(data.price || 0)
    formData.old_price = String(data.old_price || 0)
    formData.status = data.status || 'draft'
    formData.cooking_time = String(data.cooking_time || 0)
    formData.dish_type = data.dish_type || ''
    formData.level = data.level || ''
    formData.recommendation = data.recommendation || false
  } catch (err) {
    console.error('Ошибка при загрузке продукта:', err)
    error.value = t('product.loadError')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!product.value) return

  saving.value = true
  error.value = null
  successMessage.value = null

  try {
    const updateData: any = {
      price: parseFloat(formData.price) || 0,
      old_price: parseFloat(formData.old_price) || 0,
      cooking_time: formData.cooking_time || null,
      dish_type: formData.dish_type || null,
      level: formData.level || null,
      recommendation: formData.recommendation || false,
    }

    // Добавляем все языковые поля для title
    titleFields.value.forEach(field => {
      if (formData[field.key] !== undefined) {
        updateData[field.key] = formData[field.key]
      }
    })

    // Добавляем все языковые поля для description
    descriptionFields.value.forEach(field => {
      if (formData[field.key] !== undefined) {
        updateData[field.key] = formData[field.key]
      }
    })

    updateData.list_price = buildListPricePayload()

    // Если категория - это объект, используем его ID
    if (product.value.category && typeof product.value.category === 'object') {
      updateData.category = product.value.category.id
    } else if (product.value.category) {
      updateData.category = product.value.category
    }

    // Если изображение - это объект, используем его ID
    if (product.value.image && typeof product.value.image === 'object') {
      updateData.image = product.value.image.id
    } else if (product.value.image) {
      updateData.image = product.value.image
    }

    // Управление публикацией (только если статус изменился)
    delete updateData.status

    await productService.update(productId.value, updateData)
    await togglePublish(true, true)

    successMessage.value = t('product.updated')

    // Перезагружаем данные продукта
    await loadProduct()

    // Скрываем сообщение об успехе через 3 секунды
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Ошибка при обновлении продукта:', err)
    error.value = t('product.updateError')
  } finally {
    saving.value = false
  }
}

const togglePublish = async (publish: boolean, save: boolean = false) => {
  const targetStatus = publish ? 'published' : 'draft'
  publishing.value = true
  error.value = null
  successMessage.value = null

  try {
    // Используем специальные endpoints Strapi для публикации/снятия с публикации
    if (publish || save) {
      await productService.publish(productId.value as string)
    } else {
      await productService.unpublish(productId.value as string)
    }

    formData.status = targetStatus
    successMessage.value = publish
      ? t('product.publishedSuccess')
      : t('product.unpublishedSuccess')

    // Перезагружаем данные продукта
    await loadProduct()

    // Скрываем сообщение об успехе через 3 секунды
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Ошибка при изменении статуса публикации:', err)
    error.value = publish
      ? t('product.publishError')
      : t('product.unpublishError')
  } finally {
    publishing.value = false
  }
}

const goBack = () => {
  router.push('/products')
}

const validateFile = (file: File): string | null => {
  // Проверка типа файла
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
  if (!allowedTypes.includes(file.type)) {
    return t('product.fileTypeError')
  }

  // Проверка размера (2 МБ = 2 * 1024 * 1024 байт)
  const maxSize = 2 * 1024 * 1024
  if (file.size > maxSize) {
    return t('product.fileSizeError')
  }

  return null
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Валидация файла
  const validationError = validateFile(file)
  if (validationError) {
    imageError.value = validationError
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    return
  }

  imageError.value = null
  selectedFile.value = file

  // Создаем превью
  const reader = new FileReader()
  reader.onload = e => {
    previewImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const cancelImageUpload = () => {
  selectedFile.value = null
  previewImage.value = null
  imageError.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadImage = async () => {
  if (!selectedFile.value || !product.value) return

  uploadingImage.value = true
  imageError.value = null

  try {
    // Загружаем файл в Strapi
    const uploadedFiles = await productService.upload(selectedFile.value)

    if (uploadedFiles.length === 0) {
      throw new Error('Файл не был загружен')
    }

    const uploadedFile = uploadedFiles[0]

    // Обновляем продукт с новым изображением
    const updateData: any = {
      image: uploadedFile.id,
    }

    await productService.update(productId.value as string, updateData)

    successMessage.value = t('product.imageUploadSuccess')

    // Перезагружаем данные продукта
    await loadProduct()

    // Очищаем состояние загрузки
    cancelImageUpload()

    // Скрываем сообщение об успехе через 3 секунды
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (err) {
    console.error('Ошибка при загрузке изображения:', err)
    imageError.value = t('product.imageUploadError')
  } finally {
    uploadingImage.value = false
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

onMounted(() => {
  loadProduct()
})
</script>

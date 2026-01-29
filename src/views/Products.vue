<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto pb-10">
    <!-- Заголовок и поиск -->
    <div class="mb-6">
      <h1 class="text-base font-bold mb-4">{{ t('products.title') }}</h1>
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            :placeholder="t('products.search')"
            class="w-full"
            @input="handleSearch"
          />
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-2">
        <span v-if="searchQuery.trim()">
          {{ filteredProducts.length }} {{ t('products.of') }} {{ total }} 
        </span>
        <span v-else>
          {{ products.length }} {{ t('products.of') }} {{ total }} 
        </span>
      </p>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">{{ t('products.loading') }}</p>
    </div>

    <!-- Список продуктов -->
    <div v-else-if="filteredProducts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="border border-gray-200 rounded-lg p-2 hover:shadow-lg transition-shadow bg-white cursor-pointer"
        @click="goToProduct(product.documentId)"
      >
        
        <div class="grid grid-cols-[1fr_100px] gap-2  justify-between">
          <div>
            <div class="mb-2">
              <h3 class="text-base font-semibold text-gray-900">
                {{ product[`title_${locale}`] }}
              </h3>
              <!-- tag category -->
              <span class="text-xs text-gray-500 bg-gray-100 rounded-[6px] px-2 py-1">
                {{ typeof product.category === 'object' ? product.category[`title_${locale}`] : product.category }}
              </span>
            </div>
            <p v-if="product.old_price" class="text-[10px] font-medium text-gray-500">
              {{ formatPrice(product.old_price) }}
            </p>
            <p class="text-[15px] font-bold text-gray-900">
              {{ formatPrice(product.price) }}
            </p>
          </div>
          <div v-if="product.image && typeof product.image === 'object'">
            <img
              :src="API_BASE_URL + (product.image.formats?.thumbnail?.url || product.image.url)"
              :alt="product.name"
              class="w-full h-16 object-cover rounded mt-2"
            />
          </div>
          <div v-else-if="product.image && typeof product.image === 'string'" class="ml-4">
            <img
              :src="API_BASE_URL + product.image"
              :alt="product.name"
              class="w-16 h-16 object-cover rounded"
            />
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <p class="text-xs text-gray-400">
            {{ t('products.updated') }}: {{ formatDate(product.updatedAt, 'DD.MM.YYYY HH:mm') }}
          </p>
          <p 
          :class="{'bg-green-100 text-green-700': product.status === 'published', 'bg-red-100 text-red-700': product.status === 'draft', 'bg-yellow-100 text-yellow-7  00': product.status === 'modified'}"
          class="text-xs p-1 rounded-[6px] px-3">{{ STATUS_LABELS[product.status as keyof typeof STATUS_LABELS] }}</p>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="text-center py-12">
      <p class="text-gray-500">{{ t('products.noProducts') }}</p>
    </div>

    <!-- Пагинация внизу -->
    <div v-if="!loading && filteredProducts.length > 0" class="mt-6 flex justify-center gap-2">
      <Button
        variant="outline"
        @click="changePage((pagination.page || 1) - 1)"
        :disabled="!pagination.page || pagination.page === 1"
      >
      <img src="../assets/images/icons/up.png" alt="chevron-right" class="h-[6px] rotate-90">
      </Button>
      <span class="px-4 py-2 text-sm text-gray-600">
        {{ t('products.page') }} {{ pagination.page || 1 }} {{ t('products.of') }} {{ totalPages }}
      </span>
      <Button
        variant="outline"
        @click="changePage((pagination.page || 1) + 1)"
        :disabled="!pagination.page || pagination.page >= totalPages"
      >
        <img src="../assets/images/icons/up.png" alt="chevron-right" class="h-[6px] rotate-270">
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useProductStore } from '../store/productStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { useDateTime } from '../composables/useDateTime'
import { API_BASE_URL, STATUS_LABELS } from '../env'

const { t, locale } = useI18n()

const router = useRouter()
const productStore = useProductStore()
const { products, total, pagination } = storeToRefs(productStore)
const { formatDate } = useDateTime()

const loading = ref(false)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const goToProduct = (id: number) => {
  router.push(`/products/${id}`)
}

const totalPages = computed(() => {
  return Math.ceil(total.value / (pagination.value.pageSize || 10))
})

// Теперь используем продукты напрямую, фильтрация происходит на сервере
const filteredProducts = computed(() => products.value)

const formatPrice = (price: number) => {
  return new Intl.NumberFormat().format(price)
}

const handleSearch = () => {
  // Очищаем предыдущий таймаут
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Debounce для оптимизации запросов к API
  searchTimeout = setTimeout(() => {
    const query = searchQuery.value.trim()
    
    if (query) {
      // Создаем фильтры для Strapi API
      // Используем $or для поиска по нескольким полям
      const filters = {
        $or: [
          { title_ru: { $containsi: query } },
        ],
      }
      
      productStore.setFilters(filters)
    } else {
      // Убираем фильтры если поиск пустой
      productStore.setFilters(null)
    }
    
    // Загружаем продукты с новыми фильтрами
    fetchProducts()
  }, 500) // Задержка 500мс перед отправкой запроса
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    pagination.value.page = page
    fetchProducts()
  }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    await productStore.fetchProducts()
  } catch (error) {
    console.error('Ошибка при загрузке продуктов:', error)
  } finally {
    loading.value = false
  }
}

// Отслеживание изменений пагинации (если изменяется извне)
watch(
  () => pagination.value.page,
  (newPage, oldPage) => {
    if (newPage !== oldPage && oldPage !== undefined) {
      fetchProducts()
    }
  }
)

onMounted(() => {
  fetchProducts()
})

onBeforeUnmount(() => {
  // Очищаем таймаут при размонтировании компонента
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

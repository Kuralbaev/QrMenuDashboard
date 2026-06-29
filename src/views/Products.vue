<template>
  <PageShell>
    <PageHeader :title="t('products.title')" :subtitle="`${products.length} ${t('products.of')} ${total}`" />

    <div class="mb-4">
      <Input
        v-model="searchQuery"
        :placeholder="t('products.search')"
        class="h-11 rounded-xl border-border/70 bg-card"
        @input="handleSearch"
      />
    </div>

    <div v-if="loading" class="flex justify-center py-16">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <span class="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        {{ t('products.loading') }}
      </div>
    </div>

    <div v-else-if="filteredProducts.length > 0" class="space-y-3">
      <article
        v-for="product in filteredProducts"
        :key="product.id"
        class="cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition hover:border-primary/30 hover:shadow-md active:scale-[0.99]"
        @click="goToProduct(product.documentId)"
      >
        <div class="flex gap-3 p-3">
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-foreground">
              {{ product[`title_${locale}`] }}
            </h3>
            <span class="mt-1 inline-block rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
              {{ typeof product.category === 'object' ? product.category[`title_${locale}`] : product.category }}
            </span>
            <div class="mt-2 flex items-baseline gap-2">
              <p v-if="product.old_price" class="text-xs text-muted-foreground line-through">
                {{ formatPrice(product.old_price) }}
              </p>
              <p class="text-base font-bold text-foreground">
                {{ formatPrice(product.price) }} {{ restaurant?.currency }}
              </p>
            </div>
          </div>
          <div v-if="product.image && typeof product.image === 'object'" class="shrink-0">
            <img
              :src="API_BASE_URL + (product.image.formats?.thumbnail?.url || product.image.url)"
              :alt="product.name"
              class="h-16 w-16 rounded-xl object-cover"
            />
          </div>
        </div>
        <div class="flex items-center justify-between border-t border-border/50 bg-muted/30 px-3 py-2">
          <p class="text-[10px] text-muted-foreground">
            {{ t('products.updated') }}: {{ formatDate(product.updatedAt, 'DD.MM.YYYY HH:mm') }}
          </p>
          <span
            class="rounded-md px-2 py-0.5 text-[10px] font-medium"
            :class="statusClass(product.status)"
          >
            {{ STATUS_LABELS[product.status as keyof typeof STATUS_LABELS] }}
          </span>
        </div>
      </article>
    </div>

    <div v-else class="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
      {{ t('products.noProducts') }}
    </div>

    <div v-if="!loading && filteredProducts.length > 0" class="mt-6 flex items-center justify-center gap-3">
      <Button variant="outline" class="rounded-xl" @click="changePage((pagination.page || 1) - 1)" :disabled="!pagination.page || pagination.page === 1">
        ‹
      </Button>
      <span class="text-sm text-muted-foreground">
        {{ t('products.page') }} {{ pagination.page || 1 }} {{ t('products.of') }} {{ totalPages }}
      </span>
      <Button variant="outline" class="rounded-xl" @click="changePage((pagination.page || 1) + 1)" :disabled="!pagination.page || pagination.page >= totalPages">
        ›
      </Button>
    </div>
  </PageShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useProductStore } from '../store/productStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import PageShell from '../components/layout/PageShell.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import { useDateTime } from '../composables/useDateTime'
import { API_BASE_URL, STATUS_LABELS } from '../env'
import { useRestaurantStore } from '../store/restaurantStore'

const { t, locale } = useI18n()

const router = useRouter()
const productStore = useProductStore()
const restaurantStore = useRestaurantStore()
const { restaurant } = storeToRefs(restaurantStore)
const { products, total, pagination } = storeToRefs(productStore)
const { formatDate } = useDateTime()

const loading = ref(false)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const statusClass = (status: string) => {
  if (status === 'published') return 'bg-emerald-100 text-emerald-700'
  if (status === 'draft') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

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

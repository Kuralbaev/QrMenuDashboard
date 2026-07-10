<template>
  <PageShell>
    <PageHeader
      :title="t('home.dashboardTitle')"
      :subtitle="restaurant?.title_ru || t('home.dashboardSubtitle')"
      badge="LUNIQ"
    />

    <!-- 4 кнопки-вкладки -->
    <div class="mb-4 grid grid-cols-2 gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="group relative flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all duration-200 active:scale-[0.98]"
        :class="
          activeTab === tab.id
            ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
            : 'border-border/70 bg-card text-foreground hover:border-primary/30 hover:bg-primary/5'
        "
        @click="activeTab = tab.id"
      >
        <component
          :is="tab.icon"
          class="h-5 w-5 shrink-0"
          :class="activeTab === tab.id ? 'opacity-100' : 'text-primary'"
          :stroke-width="2"
        />
        <div>
          <p class="text-sm font-semibold leading-tight">{{ t(tab.label) }}</p>
          <p
            class="mt-0.5 text-[11px] leading-snug"
            :class="
              activeTab === tab.id
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            "
          >
            {{ t(tab.hint) }}
          </p>
        </div>
      </button>
    </div>

    <!-- Панель: Информация -->
    <SectionCard v-if="activeTab === 'info'" :title="t('home.title')">
      <p
        class="text-sm leading-relaxed text-muted-foreground"
        v-html="t('home.mobileInfo')"
      />
      <div class="mt-4 grid grid-cols-2 gap-2">
        <div class="rounded-xl bg-muted/60 px-3 py-2.5">
          <p class="text-[11px] text-muted-foreground">
            {{ t('home.dishesCount') }}
          </p>
          <p class="mt-0.5 text-lg font-bold tabular-nums">
            {{ formatNum(total) }}
          </p>
        </div>
      </div>
    </SectionCard>

    <!-- Панель: Статистика -->
    <SectionCard
      v-else-if="activeTab === 'stats'"
      :title="t('home.analyticsTitle')"
    >
      <StatsDashboard />
    </SectionCard>

    <!-- Панель: Меню -->
    <SectionCard v-else-if="activeTab === 'menu'" :title="t('products.title')">
      <p class="mb-3 text-sm text-muted-foreground">
        {{ formatNum(total) }} {{ t('home.dishesInMenu') }}
      </p>
      <ul v-if="previewProducts.length" class="mb-4 space-y-2">
        <li
          v-for="product in previewProducts"
          :key="product.id"
          class="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
        >
          <span class="truncate text-sm font-medium">
            {{ product[`title_${locale}`] || product.title_ru }}
          </span>
          <span
            class="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium"
            :class="statusClass(product.status)"
          >
            {{ statusLabel(product.status) }}
          </span>
        </li>
      </ul>
      <router-link
        to="/products"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        {{ t('home.openMenu') }}
        <ChevronRight class="h-4 w-4" />
      </router-link>
    </SectionCard>

    <!-- Панель: Отзывы -->
    <SectionCard
      v-else-if="activeTab === 'reviews'"
      :title="t('reviews.title')"
    >
      <div
        v-if="reviewsLoading"
        class="flex items-center gap-2 py-4 text-sm text-muted-foreground"
      >
        <span
          class="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        />
        {{ t('reviews.loading') }}
      </div>
      <template v-else>
        <p class="mb-3 text-sm text-muted-foreground">
          {{ formatNum(reviewsTotal) }}
          {{ reviewsTotal === 1 ? t('reviews.review') : t('reviews.reviews') }}
        </p>
        <ul v-if="previewReviews.length" class="mb-4 space-y-2">
          <li
            v-for="review in previewReviews"
            :key="review.id"
            class="rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5"
          >
            <div class="mb-1 flex items-center justify-between gap-2">
              <span class="truncate text-sm font-medium">
                {{ review.name || t('reviews.anonymous') }}
              </span>
              <span
                v-if="review.star"
                class="shrink-0 text-xs font-bold text-amber-500"
              >
                ★ {{ review.star }}
              </span>
            </div>
            <p
              v-if="review.comment"
              class="line-clamp-2 text-xs text-muted-foreground"
            >
              {{ review.comment }}
            </p>
          </li>
        </ul>
        <p v-else class="mb-4 text-sm text-muted-foreground">
          {{ t('reviews.noReviews') }}
        </p>
        <router-link
          to="/reviews"
          class="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          {{ t('home.openReviews') }}
          <ChevronRight class="h-4 w-4" />
        </router-link>
      </template>
    </SectionCard>
  </PageShell>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import {
  Info,
  BarChart3,
  UtensilsCrossed,
  MessageSquare,
  ChevronRight,
} from 'lucide-vue-next'
import PageShell from '../components/layout/PageShell.vue'
import PageHeader from '../components/layout/PageHeader.vue'
import SectionCard from '../components/layout/SectionCard.vue'
import StatsDashboard from '../components/stats/StatsDashboard.vue'
import { useProductStore } from '../store/productStore'
import { useReviewStore } from '../store/reviewStore'
import { useRestaurantStore } from '../store/restaurantStore'
import { STATUS_LABELS } from '../env'

type HomeTab = 'info' | 'stats' | 'menu' | 'reviews'

const { t, locale } = useI18n()
const productStore = useProductStore()
const reviewStore = useReviewStore()
const restaurantStore = useRestaurantStore()

const { total, products } = storeToRefs(productStore)
const { restaurant } = storeToRefs(restaurantStore)
const { reviews, total: reviewsTotal } = storeToRefs(reviewStore)

const activeTab = ref<HomeTab>('info')
const reviewsLoading = ref(false)
const reviewsLoaded = ref(false)

const tabs = [
  {
    id: 'info' as const,
    label: 'home.tabInfo',
    hint: 'home.tabInfoHint',
    icon: Info,
  },
  {
    id: 'stats' as const,
    label: 'home.tabStats',
    hint: 'home.tabStatsHint',
    icon: BarChart3,
  },
  {
    id: 'menu' as const,
    label: 'home.tabMenu',
    hint: 'home.tabMenuHint',
    icon: UtensilsCrossed,
  },
  {
    id: 'reviews' as const,
    label: 'home.tabReviews',
    hint: 'home.tabReviewsHint',
    icon: MessageSquare,
  },
]

const formatNum = (n: number) => Intl.NumberFormat('ru-RU').format(n)

const publishedCount = computed(
  () => products.value.filter(p => p.status === 'published').length
)

const previewProducts = computed(() => products.value.slice(0, 3))
const previewReviews = computed(() => reviews.value.slice(0, 3))

const statusLabel = (status: string) =>
  STATUS_LABELS[status as keyof typeof STATUS_LABELS] ?? status

const statusClass = (status: string) => {
  if (status === 'published') return 'bg-emerald-100 text-emerald-700'
  if (status === 'draft') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-700'
}

const loadReviewsPreview = async () => {
  if (reviewsLoaded.value) return
  reviewsLoading.value = true
  try {
    await reviewStore.fetchReviews()
    reviewsLoaded.value = true
  } catch {
    /* empty */
  } finally {
    reviewsLoading.value = false
  }
}

watch(activeTab, tab => {
  if (tab === 'reviews') loadReviewsPreview()
})
</script>

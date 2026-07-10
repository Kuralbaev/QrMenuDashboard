<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye, UtensilsCrossed, MessageCircle, QrCode } from 'lucide-vue-next'
import StatsBarList from './StatsBarList.vue'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  fetchStats,
  formatDateRangeLabel,
  defaultStatsDateRange,
  type StatsBlock,
  type StatsMetric,
  type StatsGroupBy,
} from '../../api/analytics'
import ChartLine from './ChartLine.vue'
import { useRestaurantStore } from '../../store/restaurantStore'
import { storeToRefs } from 'pinia'

const { t, locale } = useI18n()
const restaurantStore = useRestaurantStore()
const { restaurant } = storeToRefs(restaurantStore)

type StatTab = StatsMetric

const statTabs: {
  id: StatTab
  label: string
  hint: string
  icon: typeof Eye
}[] = [
  {
    id: 'visits',
    label: 'home.statsVisits',
    hint: 'home.statsVisitsHint',
    icon: Eye,
  },
  {
    id: 'topDishes',
    label: 'home.statsTopDishes',
    hint: 'home.statsTopDishesHint',
    icon: UtensilsCrossed,
  },
  {
    id: 'whatsapp',
    label: 'home.statsWhatsapp',
    hint: 'home.statsWhatsappHint',
    icon: MessageCircle,
  },
  {
    id: 'orders',
    label: 'home.statsOrders',
    hint: 'home.statsOrdersHint',
    icon: QrCode,
  },
]

const groupByOptions: StatsGroupBy[] = ['day', 'month', 'year']
const groupByLabels: Record<StatsGroupBy, string> = {
  day: 'home.groupByDay',
  month: 'home.groupByMonth',
  year: 'home.groupByYear',
}

const defaults = defaultStatsDateRange(30)
const activeStat = ref<StatTab>('visits')
const groupBy = ref<StatsGroupBy>('day')
const startDate = ref(defaults.start)
const endDate = ref(defaults.end)
const loading = ref(false)
const error = ref(false)
const data = ref<StatsBlock | null>(null)

const cache = new Map<string, StatsBlock>()

const usesGroupBy = computed(
  () =>
    activeStat.value === 'visits' ||
    activeStat.value === 'whatsapp' ||
    activeStat.value === 'orders'
)

const needsRestoran = computed(() => activeStat.value === 'visits')

const dateRangeInvalid = computed(() => startDate.value > endDate.value)

const cacheKey = computed(() => {
  const gb = usesGroupBy.value ? groupBy.value : ''
  const rid = needsRestoran.value ? String(restaurant.value?.id ?? '') : ''
  return `${activeStat.value}:${startDate.value}:${endDate.value}:${gb}:${rid}`
})

const formatLabel = (label: string) => {
  if (activeStat.value === 'topDishes') return label
  return formatDateRangeLabel(label)
}

const chartRows = computed(
  () => data.value?.dailyRows ?? data.value?.rows ?? []
)

const load = async () => {
  if (dateRangeInvalid.value) return
  if (needsRestoran.value && !restaurant.value?.id) {
    error.value = true
    data.value = null
    return
  }

  const key = cacheKey.value
  if (cache.has(key)) {
    data.value = cache.get(key)!
    error.value = false
    return
  }

  loading.value = true
  error.value = false
  try {
    const result = await fetchStats(
      activeStat.value,
      { start: startDate.value, end: endDate.value },
      locale.value,
      groupBy.value,
      restaurant.value?.id ?? 0
    )
    cache.set(key, result)
    data.value = result
  } catch {
    error.value = true
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(activeStat, () => load())
watch(groupBy, () => {
  if (usesGroupBy.value) load()
})

load()
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-2">
      <button
        v-for="tab in statTabs"
        :key="tab.id"
        type="button"
        class="flex items-start gap-2.5 rounded-xl border p-3 text-left transition active:scale-[0.98]"
        :class="
          activeStat === tab.id
            ? 'border-primary/40 bg-primary/10'
            : 'border-border/60 bg-muted/20 hover:bg-muted/40'
        "
        @click="activeStat = tab.id"
      >
        <component
          :is="tab.icon"
          class="mt-0.5 h-4 w-4 shrink-0 text-primary"
        />
        <div class="min-w-0">
          <p class="text-xs font-semibold leading-tight">{{ t(tab.label) }}</p>
          <p class="mt-0.5 text-[10px] text-muted-foreground">
            {{ t(tab.hint) }}
          </p>
        </div>
      </button>
    </div>

    <!-- Диапазон дат -->
    <div class="rounded-xl border border-border/60 bg-muted/20 p-3">
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label for="stats-start" class="text-[11px] text-muted-foreground">
            {{ t('home.dateStart') }}
          </Label>
          <Input
            id="stats-start"
            v-model="startDate"
            type="date"
            class="h-9 rounded-lg bg-card text-sm"
          />
        </div>
        <div class="space-y-1.5">
          <Label for="stats-end" class="text-[11px] text-muted-foreground">
            {{ t('home.dateEnd') }}
          </Label>
          <Input
            id="stats-end"
            v-model="endDate"
            type="date"
            class="h-9 rounded-lg bg-card text-sm"
          />
        </div>
      </div>
      <p v-if="dateRangeInvalid" class="mt-2 text-xs text-destructive">
        {{ t('home.dateRangeError') }}
      </p>
      <button
        type="button"
        class="mt-3 w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        :disabled="dateRangeInvalid || loading"
        @click="load"
      >
        {{ t('home.dateApply') }}
      </button>
    </div>

    <!-- Группировка: день / месяц / год -->
    <div v-if="usesGroupBy" class="flex flex-wrap gap-1.5">
      <button
        v-for="g in groupByOptions"
        :key="g"
        type="button"
        class="rounded-lg px-3 py-1.5 text-xs font-medium transition"
        :class="
          groupBy === g
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
        "
        @click="groupBy = g"
      >
        {{ t(groupByLabels[g]) }}
      </button>
    </div>

    <div
      v-if="loading"
      class="flex items-center gap-2 py-8 text-sm text-muted-foreground"
    >
      <span
        class="h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
      />
      {{ t('home.analyticsLoading') }}
    </div>

    <p
      v-else-if="error"
      class="rounded-xl bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
    >
      {{ t('home.analyticsError') }}
    </p>

    <template v-else-if="data">
      <div class="rounded-xl bg-primary/10 px-4 py-3">
        <p class="text-[11px] text-muted-foreground">
          {{
            activeStat === 'topDishes' || activeStat === 'orders'
              ? t('home.statsTotalOrders')
              : t('home.statsTotal')
          }}
        </p>
        <p class="text-2xl font-bold tabular-nums text-primary">
          {{ data.total.toLocaleString('ru-RU') }}
        </p>
      </div>

      <ChartLine
        v-if="chartRows.length"
        :rows="chartRows"
        :format-label="formatLabel"
      />

      <StatsBarList
        v-if="activeStat !== 'topDishes'"
        :rows="chartRows"
        :format-label="formatLabel"
        :max-bars="31"
        :sort-by-value="false"
      />

      <StatsBarList
        v-else
        :rows="data.rows"
        :format-label="formatLabel"
        :max-bars="10"
        :sort-by-value="true"
      />
    </template>
  </div>
</template>

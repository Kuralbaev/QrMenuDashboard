<script setup lang="ts">
import { computed } from 'vue'
import type { StatsRow } from '../../api/analytics'

const props = withDefaults(
  defineProps<{
    rows: StatsRow[]
    formatLabel?: (label: string) => string
    maxBars?: number
    /** false = хронологический порядок (посещения, WhatsApp, заказы) */
    sortByValue?: boolean
  }>(),
  { sortByValue: true, maxBars: 12 }
)

const displayRows = computed(() => {
  const sorted = props.sortByValue
    ? [...props.rows].sort((a, b) => b.value - a.value)
    : [...props.rows].sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { numeric: true })
      )
  const slice = sorted.slice(0, props.maxBars ?? 12)
  const max = Math.max(...slice.map(r => r.value), 1)
  return slice.map(r => ({
    ...r,
    displayLabel: props.formatLabel ? props.formatLabel(r.label) : r.label,
    pct: Math.round((r.value / max) * 100),
  }))
})
</script>

<template>
  <ul v-if="displayRows.length" class="space-y-2.5">
    <template v-for="row in displayRows" :key="row.label">
      <li v-if="row.value > 0" class="space-y-1">
        <div class="flex items-center justify-between gap-2 text-xs">
          <span class="truncate text-muted-foreground">
            {{ row.displayLabel }}
          </span>
          <span class="shrink-0 font-semibold tabular-nums text-foreground">
            {{ row.value.toLocaleString('ru-RU') }}
          </span>
        </div>
        <div class="h-2 overflow-hidden rounded-full bg-muted/60">
          <div
            class="h-full rounded-full bg-primary transition-all duration-500"
            :style="{ width: `${Math.max(row.pct, 4)}%` }"
          />
        </div>
      </li>
    </template>
  </ul>
  <p v-else class="py-4 text-center text-sm text-muted-foreground">
    <slot name="empty">{{ $t('home.analyticsNoData') }}</slot>
  </p>
</template>

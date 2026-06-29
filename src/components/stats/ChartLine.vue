<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Chart } from 'highcharts-vue'
import type { Options } from 'highcharts'
import type { StatsRow } from '../../api/analytics'
import { formatDateRangeLabel } from '../../api/analytics'

const props = defineProps<{
  rows: StatsRow[]
  formatLabel?: (label: string) => string
}>()

const { t } = useI18n()

const sorted = computed(() =>
  [...props.rows].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
)

const labelOf = (label: string) =>
  props.formatLabel ? props.formatLabel(label) : formatDateRangeLabel(label)

function chartColor(): string {
  if (typeof document === 'undefined') return '#6366f1'
  return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#6366f1'
}

const chartOptions = computed((): Options => {
  const color = chartColor()
  return {
    chart: {
      type: 'areaspline',
      height: 220,
      backgroundColor: 'transparent',
      spacing: [10, 4, 4, 4],
      style: { fontFamily: 'inherit' },
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    xAxis: {
      categories: sorted.value.map(r => labelOf(r.label)),
      labels: {
        style: { fontSize: '10px', color: 'var(--muted-foreground, #737373)' },
        rotation: sorted.value.length > 10 ? -45 : 0,
      },
      lineColor: 'var(--border, #e5e5e5)',
      tickColor: 'var(--border, #e5e5e5)',
    },
    yAxis: {
      title: { text: undefined },
      allowDecimals: false,
      gridLineColor: 'color-mix(in oklch, var(--border, #e5e5e5) 60%, transparent)',
      labels: {
        style: { fontSize: '10px', color: 'var(--muted-foreground, #737373)' },
      },
    },
    tooltip: {
      shared: true,
      valueDecimals: 0,
      backgroundColor: 'var(--card, #fff)',
      borderColor: 'var(--border, #e5e5e5)',
      style: { color: 'var(--foreground, #000)' },
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.12,
        lineWidth: 2,
        marker: {
          enabled: sorted.value.length <= 31,
          radius: 4,
          lineWidth: 2,
          lineColor: color,
          fillColor: 'var(--background, #fff)',
        },
      },
    },
    series: [
      {
        type: 'areaspline',
        name: t('home.chartOrdersByDay'),
        data: sorted.value.map(r => r.value),
        color,
      },
    ],
  }
})
</script>

<template>
  <div v-if="sorted.length" class="rounded-xl border border-border/60 bg-card p-3">
    <p class="mb-1 text-xs font-medium text-muted-foreground">
      {{ t('home.chartOrdersByDay') }}
    </p>
    <Chart :options="chartOptions" />
  </div>
</template>

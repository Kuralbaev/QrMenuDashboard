export interface StatsRow {
  label: string
  value: number
}

export interface StatsBlock {
  rows: StatsRow[]
  /** Заказы/события по дням — для линейного графика */
  dailyRows?: StatsRow[]
  total: number
  period: string
  metric?: string
  eventName?: string
}

export interface StatsResponse {
  success: boolean
  data?: StatsBlock
  error?: string
}

export type StatsMetric = 'visits' | 'topDishes' | 'whatsapp' | 'orders'

export interface StatsDateRange {
  start: string
  end: string
}

export type StatsGroupBy = 'day' | 'month' | 'year'

const gaBase = import.meta.env.VITE_GA_STATS_URL?.trim() || '/api/analytics/stats'

export function formatLocalDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function defaultStatsDateRange(days = 30): StatsDateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - days)
  return { start: formatLocalDate(start), end: formatLocalDate(end) }
}

export async function fetchStats(
  metric: StatsMetric,
  range: StatsDateRange,
  locale = 'ru',
  groupBy: StatsGroupBy = 'day'
): Promise<StatsBlock> {
  if (metric === 'topDishes') {
    const { fetchTopDishesStats } = await import('./orderStatistics')
    return fetchTopDishesStats(range, locale)
  }

  if (metric === 'whatsapp' || metric === 'orders') {
    const { fetchOrderCountStats } = await import('./orderStatistics')
    const type = metric === 'whatsapp' ? 'whatsapp' : 'qr'
    return fetchOrderCountStats(type, groupBy, range)
  }

  const params = new URLSearchParams({
    metric,
    start: range.start,
    end: range.end,
  })
  const res = await fetch(`${gaBase}?${params}`)
  if (!res.ok) throw new Error(`stats ${res.status}`)
  const json = (await res.json()) as StatsResponse
  if (!json.success || !json.data) throw new Error(json.error || 'stats_failed')
  const block = json.data
  return {
    ...block,
    dailyRows: sortByDateLabel(block.dailyRows ?? block.rows),
  }
}

function sortByDateLabel(rows: StatsRow[]): StatsRow[] {
  return [...rows].sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
}

/** Формат подписи для строк по дням/месяцам/годам */
export function formatDateRangeLabel(label: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(label)) {
    const [, m, d] = label.split('-')
    return `${d}.${m}`
  }
  if (/^\d{4}-\d{2}$/.test(label)) {
    const [, m] = label.split('-')
    const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
    return months[Number(m) - 1] ?? m
  }
  if (/^\d{4}$/.test(label)) return label
  if (/^\d{8}$/.test(label)) {
    return `${label.slice(6, 8)}.${label.slice(4, 6)}`
  }
  return label
}

/** @deprecated */
export interface AnalyticsPageRow {
  page: string
  users: string
}

export async function fetchAnalyticsPages(): Promise<AnalyticsPageRow[]> {
  const data = await fetchStats('visits', defaultStatsDateRange(30))
  return data.rows.map(r => ({ page: r.label, users: String(r.value) }))
}

export function sumAnalyticsUsers(rows: AnalyticsPageRow[]): number {
  return rows.reduce((acc, row) => acc + Number(row.users || 0), 0)
}

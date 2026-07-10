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
  groupBy: StatsGroupBy = 'day',
  restoranId: number
): Promise<StatsBlock> {
  if (metric === 'topDishes') {
    const { fetchTopDishesStats } = await import('./orderStatistics')
    return fetchTopDishesStats(range, locale, restoranId)
  }

  const { fetchVisitCountStats, fetchOrderCountStats } = await import('./orderStatistics')

  if (metric === 'visits') {
    if (!restoranId) throw new Error('restoran_required')
    return fetchVisitCountStats(restoranId, groupBy, range)
  }

  if (metric === 'whatsapp' || metric === 'orders') {
    const type = metric === 'whatsapp' ? 'whatsapp' : 'qr'
    return fetchOrderCountStats(type, groupBy, range, restoranId)
  }

  throw new Error(`unknown_metric:${metric}`)
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
  return []
}

export function sumAnalyticsUsers(rows: AnalyticsPageRow[]): number {
  return rows.reduce((acc, row) => acc + Number(row.users || 0), 0)
}

import axiosInstance from './index'
import type { StatsBlock, StatsDateRange } from './analytics'

export interface OrderStatDish {
  title_ru: string
  title_kk: string
  title_en: string
  title_vi: string | null
  title_az: string | null
  title_ch: string | null
  title_tr: string | null
  title_ky: string | null
  price: number
  count: number
}

/** дата → { count, documentId → блюдо } */
export type OrderStatDayBucket = { count?: number } & Record<string, OrderStatDish | number | undefined>

export type OrderStatisticsByDate = Record<string, OrderStatDayBucket>

/** Ответ Strapi: { data, total } */
export interface OrderStatisticsApiResponse {
  data: OrderStatisticsByDate
  total: number
}

function isDish(value: unknown): value is OrderStatDish {
  return (
    value !== null &&
    typeof value === 'object' &&
    'title_ru' in value &&
    typeof (value as OrderStatDish).count === 'number'
  )
}

function dishTitle(dish: OrderStatDish, locale: string): string {
  const key = `title_${locale}` as keyof OrderStatDish
  const localized = dish[key]
  if (typeof localized === 'string' && localized.trim()) return localized.trim()
  return dish.title_ru?.trim() || dish.title_en?.trim() || '—'
}

function inRange(dateKey: string, range: StatsDateRange): boolean {
  return dateKey >= range.start && dateKey <= range.end
}

function parsePayload(raw: OrderStatisticsApiResponse | OrderStatisticsByDate): {
  buckets: OrderStatisticsByDate
  total?: number
} {
  if (raw && typeof raw === 'object' && 'data' in raw && raw.data && typeof raw.data === 'object') {
    return {
      buckets: raw.data as OrderStatisticsByDate,
      total: typeof raw.total === 'number' ? raw.total : undefined,
    }
  }
  return { buckets: raw as OrderStatisticsByDate }
}

function dayOrderCount(bucket: OrderStatDayBucket): number {
  if (typeof bucket.count === 'number') return bucket.count
  return Object.entries(bucket)
    .filter(([key]) => key !== 'count')
    .reduce((sum, [, value]) => sum + (isDish(value) ? value.count : 0), 0)
}

/** Топ блюд — GET /api/order-statistics?start=…&end=… → { data: { "2026-06-09": { count, …блюда } }, total } */
export async function fetchTopDishesStats(
  range: StatsDateRange,
  locale: string
): Promise<StatsBlock> {
  const { data: raw } = await axiosInstance.get<OrderStatisticsApiResponse | OrderStatisticsByDate>(
    '/api/order-statistics',
    { params: { start: range.start, end: range.end } }
  )

  const { buckets, total: apiTotal } = parsePayload(raw)
  const byDish = new Map<string, { label: string; value: number }>()
  const dailyRows: { label: string; value: number }[] = []

  for (const [dateKey, bucket] of Object.entries(buckets)) {
    if (!inRange(dateKey, range)) continue
    if (!bucket || typeof bucket !== 'object') continue

    const dayCount = dayOrderCount(bucket)
    if (dayCount > 0) {
      dailyRows.push({ label: dateKey, value: dayCount })
    }

    for (const [documentId, value] of Object.entries(bucket)) {
      if (documentId === 'count' || !isDish(value)) continue
      const prev = byDish.get(documentId)
      if (prev) {
        prev.value += value.count
      } else {
        byDish.set(documentId, { label: dishTitle(value, locale), value: value.count })
      }
    }
  }

  dailyRows.sort((a, b) => a.label.localeCompare(b.label))

  const rows = [...byDish.values()]
    .sort((a, b) => b.value - a.value)
    .map(r => ({ label: r.label, value: r.value }))

  const summed = rows.reduce((sum, r) => sum + r.value, 0)

  return {
    rows,
    dailyRows,
    total: apiTotal ?? summed,
    period: `${range.start}_${range.end}`,
    metric: 'topDishes',
  }
}

export type OrderCountType = 'whatsapp' | 'waiter'

export interface OrderCountApiResponse {
  data: Record<string, number>
  total: number
}

/** WhatsApp / QR-заказы — GET /api/order-statistics/order-count */
export async function fetchOrderCountStats(
  type: OrderCountType,
  groupBy: 'day' | 'month' | 'year',
  range: StatsDateRange
): Promise<StatsBlock> {
  const { data } = await axiosInstance.get<OrderCountApiResponse>(
    '/api/order-statistics/order-count',
    {
      params: {
        groupBy,
        start: range.start,
        end: range.end,
        type,
      },
    }
  )

  const rows = Object.entries(data.data ?? {})
    .map(([label, value]) => ({ label, value: Number(value) }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const total = typeof data.total === 'number' ? data.total : rows.reduce((s, r) => s + r.value, 0)

  return {
    rows,
    dailyRows: rows,
    total,
    period: `${groupBy}_${range.start}_${range.end}`,
    metric: type === 'whatsapp' ? 'whatsapp' : 'qr',
  }
}

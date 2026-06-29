import 'dotenv/config'
import express from 'express'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.GA_SERVER_PORT || 3000)
const PROPERTY_ID = process.env.GA4_PROPERTY_ID || '494080216'
const KEY_FILE =
  process.env.GOOGLE_APPLICATION_CREDENTIALS ||
  path.join(__dirname, './Luniq Account IAM Admin.json')

const EVENT_WHATSAPP = process.env.GA_EVENT_WHATSAPP || 'whatsapp_send'
const EVENT_WAITER = process.env.GA_EVENT_WAITER || 'waiter_qr_order'
const EVENT_DISH = process.env.GA_EVENT_DISH || 'add_to_cart'

const app = express()
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (_req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }
  next()
})

const analyticsClient = new BetaAnalyticsDataClient({
  keyFilename: path.isAbsolute(KEY_FILE) ? KEY_FILE : path.resolve(process.cwd(), KEY_FILE),
})

const property = `properties/${PROPERTY_ID}`

function eventFilter(eventName) {
  return {
    filter: {
      fieldName: 'eventName',
      stringFilter: { matchType: 'EXACT', value: eventName },
    },
  }
}

function dateRangeForPeriod(period) {
  switch (period) {
    case 'hour':
      return { startDate: '7daysAgo', endDate: 'today' }
    case 'day':
      return { startDate: '30daysAgo', endDate: 'today' }
    case 'week':
      return { startDate: '84daysAgo', endDate: 'today' }
    case 'month':
      return { startDate: '365daysAgo', endDate: 'today' }
    default:
      return { startDate: '30daysAgo', endDate: 'today' }
  }
}

function visitDimension(period) {
  switch (period) {
    case 'hour':
      return 'hour'
    case 'day':
      return 'date'
    case 'week':
      return 'yearWeek'
    case 'month':
      return 'yearMonth'
    default:
      return 'date'
  }
}

function timeDimension(period) {
  return period === 'hour' ? 'hour' : visitDimension(period)
}

function mapRows(response, labelIndex = 0, valueIndex = 0) {
  return (response.rows ?? [])
    .map(row => ({
      label: row.dimensionValues?.[labelIndex]?.value ?? '',
      value: Number(row.metricValues?.[valueIndex]?.value ?? 0),
    }))
    .filter(r => r.label !== '')
    .sort((a, b) => {
      if (visitDimension('day') === 'date' && /^\d{8}$/.test(a.label) && /^\d{8}$/.test(b.label)) {
        return a.label.localeCompare(b.label)
      }
      return a.label.localeCompare(b.label, undefined, { numeric: true })
    })
}

function parseRange(req) {
  const start = String(req.query.start || '')
  const end = String(req.query.end || '')
  if (/^\d{4}-\d{2}-\d{2}$/.test(start) && /^\d{4}-\d{2}-\d{2}$/.test(end)) {
    return { startDate: start, endDate: end, key: `${start}_${end}` }
  }
  return { startDate: '30daysAgo', endDate: 'today', key: '30days' }
}

async function runVisitReportByRange(range) {
  const [response] = await analyticsClient.runReport({
    property,
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    limit: 366,
  })
  const rows = mapRows(response)
  return {
    rows,
    total: rows.reduce((s, r) => s + r.value, 0),
    period: range.key,
    metric: 'visits',
  }
}

async function runEventTimeReportByRange(eventName, range) {
  const [response] = await analyticsClient.runReport({
    property,
    dateRanges: [{ startDate: range.startDate, endDate: range.endDate }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: eventFilter(eventName),
    orderBys: [{ dimension: { dimensionName: 'date' } }],
    limit: 366,
  })
  const rows = mapRows(response)
  return {
    rows,
    total: rows.reduce((s, r) => s + r.value, 0),
    period: range.key,
    eventName,
  }
}

async function runVisitReport(period) {
  const [response] = await analyticsClient.runReport({
    property,
    dateRanges: [dateRangeForPeriod(period)],
    dimensions: [{ name: visitDimension(period) }],
    metrics: [{ name: 'activeUsers' }],
    orderBys: [{ dimension: { dimensionName: visitDimension(period) } }],
    limit: period === 'hour' ? 24 : period === 'day' ? 31 : 52,
  })
  const rows = mapRows(response)
  return {
    rows,
    total: rows.reduce((s, r) => s + r.value, 0),
    period,
    metric: 'visits',
  }
}

async function runEventTimeReport(eventName, period) {
  const dim = timeDimension(period)
  const [response] = await analyticsClient.runReport({
    property,
    dateRanges: [dateRangeForPeriod(period)],
    dimensions: [{ name: dim }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: eventFilter(eventName),
    orderBys: [{ dimension: { dimensionName: dim } }],
    limit: 100,
  })
  const rows = mapRows(response)
  return {
    rows,
    total: rows.reduce((s, r) => s + r.value, 0),
    period,
    eventName,
  }
}

async function runTopDishesReport() {
  const attempts = [
    {
      dimensions: [{ name: 'itemName' }],
      metrics: [{ name: 'itemsPurchased' }],
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    },
    {
      dimensions: [{ name: 'itemName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: eventFilter(EVENT_DISH),
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    },
    {
      dimensions: [{ name: 'customEvent:dish_name' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: eventFilter(EVENT_DISH),
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    },
  ]

  for (const req of attempts) {
    try {
      const [response] = await analyticsClient.runReport({
        property,
        ...req,
        orderBys: [{ metric: { metricName: req.metrics[0].name }, desc: true }],
        limit: 10,
      })
      const rows = mapRows(response).filter(r => r.label && r.label !== '(not set)')
      if (rows.length) {
        return { rows, total: rows.reduce((s, r) => s + r.value, 0), period: '30days', metric: 'topDishes' }
      }
    } catch {
      /* try next */
    }
  }
  return { rows: [], total: 0, period: '30days', metric: 'topDishes' }
}

app.get('/api/analytics/stats', async (req, res) => {
  const metric = String(req.query.metric || 'visits')
  const range = parseRange(req)

  try {
    let data
    switch (metric) {
      case 'visits':
        data = await runVisitReportByRange(range)
        break
      case 'topDishes':
        data = { rows: [], total: 0, period: range.key, metric: 'topDishes' }
        break
      case 'whatsapp':
        data = await runEventTimeReportByRange(EVENT_WHATSAPP, range)
        break
      case 'orders':
        data = await runEventTimeReportByRange(EVENT_WAITER, range)
        break
      default:
        res.status(400).json({ success: false, error: 'unknown_metric' })
        return
    }
    res.json({ success: true, data })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

/** @deprecated — старый эндпоинт */
app.get('/api/analytics-data', async (_req, res) => {
  try {
    const data = await runVisitReport('day')
    res.json({
      success: true,
      data: data.rows.map(r => ({ page: r.label, users: String(r.value) })),
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`GA stats: http://127.0.0.1:${PORT}/api/analytics/stats`)
})

import dayjs from 'dayjs'

export function useDateTime() {
  function formatDate(date: string | Date, format = 'YYYY-MM-DD'): string {
    return dayjs(date).format(format)
  }

  return {
    formatDate,
  }
}
 
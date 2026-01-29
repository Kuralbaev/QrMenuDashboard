import { getReviewsFromApi, type GetReviewsParams } from '../api/review'
import type { Review } from '../types/api'

export function useReviewService() {
  async function getAll(params?: GetReviewsParams): Promise<Review[]> {
    const response = await getReviewsFromApi(params)

    // Если ответ - массив, возвращаем его
    if (Array.isArray(response)) {
      return response
    }

    // Если ответ - объект с data, возвращаем data
    if (response && typeof response === 'object' && 'data' in response) {
      return response.data
    }

    return []
  }

  return {
    getAll,
  }
}

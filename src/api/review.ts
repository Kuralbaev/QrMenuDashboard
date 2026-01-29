import axiosInstance from './index'
import type { Review } from '../types/api'

export interface GetReviewsParams {
  page?: number
  pageSize?: number
  sort?: string
  filters?: Record<string, any>
}

export async function getReviewsFromApi(
  params?: GetReviewsParams
): Promise<{ data: Review[] } | Review[]> {
  const response = await axiosInstance.get<{ data: Review[] } | Review[]>(
    '/api/restaurant-comments',
    {
      params,
    }
  )

  return response.data
}

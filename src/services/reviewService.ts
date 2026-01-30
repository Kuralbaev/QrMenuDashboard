import { getReviewsFromApi, type GetReviewsParams } from '../api/review'
import type { Review, StrapiPaginationMeta, StrapiRestApiResponse } from '../types/api'

export interface ReviewsResponse {
  data: Review[]
  meta: StrapiPaginationMeta
}

export function useReviewService() {
  async function getAll(params?: GetReviewsParams): Promise<StrapiRestApiResponse<Review>> {
    const response: StrapiRestApiResponse<Review> = await getReviewsFromApi(params)

    return response
  }

  return {
    getAll,
  }
}

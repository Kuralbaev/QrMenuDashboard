import axiosInstance from './index'
import type { Review, StrapiRestApiResponse } from '../types/api'

export interface GetReviewsParams {
  page?: number
  pageSize?: number
  sort?: string
  filters?: Record<string, any>
}

export async function getReviewsFromApi(
  params?: GetReviewsParams
): Promise<StrapiRestApiResponse<Review>> {
  // Преобразуем параметры в формат, который ожидает Strapi REST API
  // Strapi REST API требует параметры пагинации в объекте pagination
  const strapiParams: Record<string, any> = {}

  if (params?.page !== undefined || params?.pageSize !== undefined) {
    strapiParams.pagination = {}
    if (params.page !== undefined) {
      strapiParams.pagination.page = params.page
    }
    if (params.pageSize !== undefined) {
      strapiParams.pagination.pageSize = params.pageSize
    }
  }

  if (params?.sort) {
    strapiParams.sort = params.sort
  }

  if (params?.filters) {
    strapiParams.filters = params.filters
  }

  const response = await axiosInstance.get<StrapiRestApiResponse<Review>>(
    '/api/restaurant-comments',
    {
      params: strapiParams,
    }
  )

  return response.data
}

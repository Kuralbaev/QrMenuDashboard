import type { Restaurant } from '../types/api'
import axiosInstance from './index'
import { useAuthStore } from '../store/authStore'
import type { PaginatedResponse } from '../types/api'

export interface GetRestaurantsParams {
  page?: number
  pageSize?: number
  sort?: string
  filters?: Record<string, any>
}

export async function getRestaurantsFromApi(
  params: GetRestaurantsParams
): Promise<PaginatedResponse<Restaurant>> {
  const { data } = await axiosInstance.get<PaginatedResponse<Restaurant>>(
    '/content-manager/collection-types/api::restaurant.restaurant',
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
      },
      params,
    }
  )

  // Strapi Content Manager API может возвращать массив напрямую или объект с results
  return data
}

export async function getRestaurantById(id: string): Promise<Restaurant> {
  const { data } = await axiosInstance.get<Restaurant>(
    `/content-manager/collection-types/api::restaurant.restaurant/${id}`,
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
      },
    }
  )
  return data.data
}

export interface UpdateRestaurantData {
  title_ru?: string
  title_en?: string
  title_kk?: string
  description_ru?: string
  description_en?: string
  description_kk?: string
  publishedAt?: string | null
  [key: string]: any
}

export async function updateRestaurant(
  id: string,
  data: UpdateRestaurantData
): Promise<Restaurant> {
  const { data: response } = await axiosInstance.put<Restaurant>(
    `/content-manager/collection-types/api::restaurant.restaurant/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.data
}

export async function publishRestaurant(id: string): Promise<Restaurant> {
  const { data } = await axiosInstance.post<Restaurant>(
    `/content-manager/collection-types/api::restaurant.restaurant/${id}/actions/publish`,
    {},
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
        'Content-Type': 'application/json',
      },
      params: {
        status: 'draft',
      },
    }
  )
  return data.data
}

export async function unpublishRestaurant(id: string): Promise<Restaurant> {
  const { data } = await axiosInstance.post<Restaurant>(
    `/content-manager/collection-types/api::restaurant.restaurant/${id}/actions/unpublish`,
    {},
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
        'Content-Type': 'application/json',
      },
      params: {
        status: 'draft',
      },
    }
  )
  return data.data
}

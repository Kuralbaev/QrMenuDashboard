import type { ApiResponse, Product } from '../types/api'
import axiosInstance from './index'
import { useAuthStore } from '../store/authStore'
import type { PaginatedResponse } from '../types/api'

export interface GetProductsParams {
  page?: number
  pageSize?: number
  sort?: string
  filters?: Record<string, any>
}

export async function getProductsFromApi(
  params: GetProductsParams
): Promise<PaginatedResponse<Product>> {

  const { data } = await axiosInstance.get<PaginatedResponse<Product>>(
    '/content-manager/collection-types/api::product.product',
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

export async function getProductById(id: string): Promise<Product> {
  const { data } = await axiosInstance.get<Product>(
    `/content-manager/collection-types/api::product.product/${id}`,
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
      },
    }
  )
  return data.data
}

export interface UpdateProductData {
  title_ru?: string
  description?: string
  price?: number
  category?: number
  image?: number
  publishedAt?: string | null
  [key: string]: any
}

export async function updateProduct(
  id: string,
  data: UpdateProductData
): Promise<Product> {
  const { data: response } = await axiosInstance.put<Product>(
    `/content-manager/collection-types/api::product.product/${id}`,
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

export interface UploadFileResponse {
  id: number
  name: string
  alternativeText: string | null
  caption: string | null
  width: number | null
  height: number | null
  formats: any
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl: string | null
  provider: string
  provider_metadata: any
  createdAt: string
  updatedAt: string
}

export async function uploadFile(file: File): Promise<UploadFileResponse[]> {
  const formData = new FormData()
  formData.append('files', file)

  const { data } = await axiosInstance.post<UploadFileResponse[]>(
    '/upload',
    formData,
    {
      headers: {
        Authorization: `Bearer ${useAuthStore().token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return data
}

export async function publishProduct(id: string): Promise<Product> {
  const { data } = await axiosInstance.post<Product>(
    `/content-manager/collection-types/api::product.product/${id}/actions/publish`,
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

export async function unpublishProduct(id: string): Promise<Product> {
  const { data } = await axiosInstance.post<Product>(
    `/content-manager/collection-types/api::product.product/${id}/actions/unpublish`,
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

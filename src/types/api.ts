export interface Category {
  id: number
  title_ru: string
  [key: string]: any
}

export interface ImageFormat {
  url: string
  width: number
  height: number
  [key: string]: any
}

export interface Image {
  id: number
  url: string
  formats: {
    thumbnail?: ImageFormat
    small?: ImageFormat
    medium?: ImageFormat
    large?: ImageFormat
    [key: string]: ImageFormat | undefined
  }
  [key: string]: any
}

export interface ProductListPriceItem {
  id?: number
  price?: number
  [key: string]: string | number | undefined
}

export interface Product {
  id: number
  name?: string
  title_ru?: string
  description?: string
  price: number
  category: Category | string | number
  image?: Image | string | number
  createdAt: string
  updatedAt: string
  publishedAt?: string
  list_price?: ProductListPriceItem[]
  [key: string]: any
}

export interface User {
  id: number
  email: string
  username: string
  firstname: string
  lastname: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  results: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface StrapiPaginationMeta {
  pagination: {
    page: number
    pageSize: number
    pageCount: number
    total: number
  }
}

export type StrapiRestApiResponse<T> = [T[], StrapiPaginationMeta]

export interface Review {
  id: number
  documentId?: string
  title?: string
  star?: string | number
  name?: string
  phone?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  [key: string]: any
}

export interface Restaurant {
  id: number
  documentId?: string
  title_ru?: string
  title_en?: string
  title_kk?: string
  description_ru?: string
  description_en?: string
  description_kk?: string
  createdAt: string
  updatedAt: string
  publishedAt?: string
  [key: string]: any
}

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useProductService } from '../services/productService'
import type { Product } from '../types/api'
import type { GetProductsParams } from '../api/product'

export const useProductStore = defineStore('product', () => {
  const productService = useProductService()

  const products = ref<Product[]>([])
  const total = ref<number>(0)
  const pagination = ref<GetProductsParams>({
    page: 1,
    pageSize: 10,
    sort: 'title_ru:ASC',
  })

  function setFilters(filters: Record<string, any> | null) {
    if (filters) {
      pagination.value.filters = filters
    } else {
      delete pagination.value.filters
    }
    // Сброс на первую страницу при изменении фильтров
    pagination.value.page = 1
  }

  async function fetchProducts() {
    const response = await productService.getAll(pagination.value)

    products.value = response.results
    total.value = response.pagination.total
  }

  return {
    products,
    pagination,
    total,
    fetchProducts,
    setFilters,
  }
})

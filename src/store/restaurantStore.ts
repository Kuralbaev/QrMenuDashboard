import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRestaurantService } from '../services/restaurantService'
import type { Restaurant } from '../types/api'
import type { GetRestaurantsParams } from '../api/restaurant'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurantService = useRestaurantService()

  const restaurant = ref<Restaurant | null>(null)
  const total = ref<number>(0)
  const pagination = ref<GetRestaurantsParams>({
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

  function setSort(sort: string) {
    pagination.value.sort = sort
    // Сброс на первую страницу при изменении сортировки
    pagination.value.page = 1
  }

  async function fetchRestaurants() {
    const response = await restaurantService.getAll(pagination.value)

    if (response.results.length > 0) {
      restaurant.value = response.results[0]
      total.value = response.pagination.total
    }
  }

  return {
    restaurant,
    pagination,
    total,
    fetchRestaurants,
    setFilters,
    setSort,
  }
})

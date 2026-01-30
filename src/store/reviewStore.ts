import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useReviewService } from '../services/reviewService'
import type { Review } from '../types/api'
import type { GetReviewsParams } from '../api/review'
import { useRestaurantStore } from './restaurantStore'
import { storeToRefs } from 'pinia'

export const useReviewStore = defineStore('review', () => {
  const reviewService = useReviewService()
  const restaurantStore = useRestaurantStore()
  const { restaurant } = storeToRefs(restaurantStore)

  const reviews = ref<Review[]>([])
  const total = ref<number>(0)
  const pagination = ref<GetReviewsParams>({
    page: 1,
    pageSize: 10,
    sort: 'createdAt:DESC',
    filters: {
      restaurant: {
        documentId: {
          $eq: restaurant.value?.documentId ?? '',
        },
      },
    },
  })

  async function fetchReviews() {
    console.log(pagination.value);

    const response = await reviewService.getAll(pagination.value)

    reviews.value = response.data
    total.value = response.meta.pagination.total
  }

  function changePage(page: number) {
    if (page >= 1) {
      pagination.value.page = page
    }
  }

  return {
    reviews,
    pagination,
    total,
    fetchReviews,
    changePage,
  }
})

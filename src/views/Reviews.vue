<template>
  <div class="p-4 md:p-6 max-w-7xl mx-auto pb-20">
    <!-- Заголовок -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ t('reviews.title') }}</h1>
      <p v-if="total > 0" class="text-sm text-gray-500">
        {{ t('products.found') }} {{ total }} {{ total === 1 ? t('reviews.review') : t('reviews.reviews') }}
      </p>
    </div>

    <!-- Состояние загрузки -->
    <div v-if="loading" class="text-center py-20">
      <div class="inline-flex items-center gap-3 text-gray-500">
        <div class="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
        <p class="text-base">{{ t('reviews.loading') }}</p>
      </div>
    </div>

    <!-- Список отзывов -->
    <div v-else-if="reviews.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="review in reviews"
        :key="review.id"
        class="group bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
        @click="openModal(review)"
      >
        <!-- Верхняя часть с именем и рейтингом -->
        <div class="flex items-start justify-between mb-3 pb-3 border-b border-gray-100">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                {{ (review.name || t('reviews.anonymous')).charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-900 truncate">
                  {{ review.name || t('reviews.anonymous') }}
                </h3>
                <p v-if="review.phone" class="text-xs text-gray-500 truncate flex items-center gap-1">
                  <PhoneIcon class="w-3" /> {{ review.phone }}
                </p>
              </div>
            </div>
          </div>
          <div v-if="review.star" class="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full flex-shrink-0">
            <span class="text-yellow-500 text-lg leading-none">★</span>
            <span class="text-sm font-bold text-gray-800">{{ review.star }}</span>
          </div>
        </div>
        
        <!-- Текст отзыва -->
        <p v-if="review.comment" class="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
          {{ review.comment }}
        </p>
        
        <!-- Нижняя часть с датой -->
        <div class="flex items-center justify-between pt-3 border-t border-gray-100">
          <div class="flex items-center gap-2 text-xs text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ formatDate(review.createdAt, 'DD.MM.YYYY HH:mm') }}</span>
          </div>
          <div class="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <span>{{ t('reviews.viewDetails') }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div v-else class="text-center py-20">
      <div class="inline-flex flex-col items-center gap-4">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <div>
          <p class="text-base font-medium text-gray-900 mb-1">{{ t('reviews.noReviews') }}</p>
          <p class="text-sm text-gray-500">{{ t('reviews.noReviewsDesc') }}</p>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="total > 0 && totalPages > 1" class="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
      <div class="text-sm text-gray-500">
        {{ t('products.page') }} {{ pagination.page || 1 }} {{ t('products.of') }} {{ totalPages }}
      </div>
      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          @click="changePage((pagination.page || 1) - 1)"
          :disabled="!pagination.page || pagination.page <= 1"
        >
          <img src="../assets/images/icons/up.png" alt="chevron-left" class="h-[6px] rotate-90">
        </Button>
        <span class="text-sm text-gray-700 min-w-[60px] text-center">
          {{ pagination.page || 1 }} / {{ totalPages }}
        </span>
        <Button
          variant="outline"
          @click="changePage((pagination.page || 1) + 1)"
          :disabled="!pagination.page || pagination.page >= totalPages"
        >
          <img src="../assets/images/icons/up.png" alt="chevron-right" class="h-[6px] rotate-270">
        </Button>
      </div>
    </div>

    <!-- Модальное окно для детального просмотра -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="selectedReview"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          @click.self="closeModal"
        >
          <div
            class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-modal-in"
            @click.stop
          >
            <!-- Содержимое модалки -->
            <div class="p-2 space-y-6 overflow-y-auto flex-1">

              <!-- Отзыв -->
              <div v-if="selectedReview.title" class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div class="flex items-center gap-2 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h4 class="text-[12px] font-semibold text-gray-700 uppercase tracking-wide">{{ t('reviews.comment') }}</h4>
                </div>
                <p class="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{{ selectedReview.comment }}</p>
              </div>
            </div>

            <!-- Футер модалки -->
            <div class="flex justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50">
              <button
                @click="closeModal"
                class="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
              >
                {{ t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { Teleport } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useReviewStore } from '../store/reviewStore'
import { useDateTime } from '../composables/useDateTime'
import type { Review } from '../types/api'
import { PhoneIcon } from 'lucide-vue-next'
import { Button } from '../components/ui/button'

const { t } = useI18n()
const { formatDate } = useDateTime()
const reviewStore = useReviewStore()
const { reviews, total, pagination } = storeToRefs(reviewStore)

const loading = ref(false)
const selectedReview = ref<Review | null>(null)

const totalPages = computed(() => {
  return Math.ceil(total.value / (pagination.value.pageSize || 10))
})

const fetchReviews = async () => {
  loading.value = true
  try {
    await reviewStore.fetchReviews()
  } catch (error) {
    console.error('Ошибка при загрузке отзывов:', error)
  } finally {
    loading.value = false
  }
}

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    reviewStore.changePage(page)
    fetchReviews()
  }
}

const openModal = (review: Review) => {
  selectedReview.value = review
  // Блокируем скролл body при открытии модалки
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  selectedReview.value = null
  // Восстанавливаем скролл body
  document.body.style.overflow = ''
}

// Обработка закрытия по Escape
const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && selectedReview.value) {
    closeModal()
  }
}

// Отслеживание изменений пагинации
watch(
  () => pagination.value.page,
  (newPage, oldPage) => {
    if (newPage !== oldPage && oldPage !== undefined) {
      fetchReviews()
    }
  }
)

onMounted(() => {
  fetchReviews()
  window.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscape)
  // Восстанавливаем скролл при размонтировании
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Анимация модального окна */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-modal-in,
.modal-leave-active .animate-modal-in {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .animate-modal-in,
.modal-leave-to .animate-modal-in {
  transform: scale(0.95);
  opacity: 0;
}

@keyframes modal-in {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-modal-in {
  animation: modal-in 0.3s ease-out;
}
</style>

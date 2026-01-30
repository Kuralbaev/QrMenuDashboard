<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">{{ t('home.title') }}</h1>
    <p class="text-sm text-gray-700 mb-4 p-3 bg-gray-100 rounded-lg" v-html="t('home.mobileInfo')"></p>
    <p class="text-sm text-gray-500 mb-4 p-3 border border-gray-200 rounded-lg">{{ t('home.dishesCount') }}: <b class="text-gray-900">{{ Intl.NumberFormat('ru-RU').format(total) }}</b></p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useProductStore } from '../store/productStore'
const { t } = useI18n()

const { total } = storeToRefs(useProductStore())
// Продукты уже загружаются в App.vue при монтировании
</script>

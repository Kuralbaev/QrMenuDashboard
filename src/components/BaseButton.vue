<template>
  <button
    class="px-4 py-2 rounded-md font-medium transition-colors"
    :class="[
      variant === 'primary' ? 'bg-blue-500 text-white hover:bg-blue-600' : '',
      variant === 'secondary'
        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        : '',
      variant === 'danger' ? 'bg-red-500 text-white hover:bg-red-600' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

defineProps<Props>()
defineEmits<{
  click: []
}>()
</script>

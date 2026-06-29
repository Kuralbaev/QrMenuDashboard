<script setup lang="ts">
withDefaults(
  defineProps<{ title?: string; padded?: boolean }>(),
  { padded: true }
)
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm"
    :class="padded ? 'p-4' : ''"
  >
    <h2
      v-if="title"
      class="mb-3 text-sm font-semibold text-foreground"
      :class="padded ? '' : 'px-4 pt-4'"
    >
      {{ title }}
    </h2>
    <slot />
  </section>
</template>

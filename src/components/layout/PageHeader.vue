<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  badge?: string
}>()
</script>

<template>
  <header class="mb-5">
    <p
      v-if="badge"
      class="mb-2 inline-flex rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary"
    >
      {{ badge }}
    </p>
    <h1 class="text-xl font-bold tracking-tight text-foreground md:text-2xl">
      {{ title }}
    </h1>
    <p v-if="subtitle" class="mt-1.5 text-sm leading-relaxed text-muted-foreground">
      {{ subtitle }}
    </p>
  </header>
</template>

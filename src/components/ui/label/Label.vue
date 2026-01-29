<script setup lang="ts">
import type { PrimitiveProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { Primitive } from "reka-ui"
import { cn } from "@/lib/utils"

interface Props extends PrimitiveProps {
  class?: HTMLAttributes["class"]
  for?: string
}

const props = withDefaults(defineProps<Props>(), {
  as: "label",
})
</script>

<template>
  <Primitive
    data-slot="label"
    :as="as"
    :as-child="asChild"
    :for="for"
    :class="cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      props.class
    )"
  >
    <slot />
  </Primitive>
</template>

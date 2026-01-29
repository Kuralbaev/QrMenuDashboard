<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  type?: string
  class?: HTMLAttributes["class"]
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  id?: string
  name?: string
  autocomplete?: string
  "aria-invalid"?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
})

const emit = defineEmits<{
  "update:modelValue": [value: string]
  input: [event: Event]
  blur: [event: FocusEvent]
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit("update:modelValue", target.value)
  emit("input", event)
}

const handleBlur = (event: FocusEvent) => {
  emit("blur", event)
}
</script>

<template>
  <input
    :id="id"
    :name="name"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :autocomplete="autocomplete"
    :aria-invalid="aria-invalid"
    :class="cn(
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 dark:bg-input/30 dark:border-input',
      props.class
    )"
    @input="handleInput"
    @blur="handleBlur"
  />
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  modelValue: string
  options: readonly { value: string, label: string }[]
  class?: HTMLAttributes[`class`]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const rootRef = ref<HTMLElement | null>(null)

const activeValue = computed(() =>
  props.options.some(option => option.value === props.modelValue)
    ? props.modelValue
    : props.options[0]?.value,
)

function select(value: string) {
  if (value === props.modelValue)
    return
  emit(`update:modelValue`, value)
}

function focusOption(value: string) {
  const button = rootRef.value?.querySelector<HTMLButtonElement>(
    `button[data-value="${CSS.escape(value)}"]`,
  )
  button?.focus()
}

function onKeydown(event: KeyboardEvent) {
  const { key } = event
  if (
    key !== `ArrowLeft`
    && key !== `ArrowRight`
    && key !== `ArrowUp`
    && key !== `ArrowDown`
    && key !== `Home`
    && key !== `End`
  ) {
    return
  }

  const { options } = props
  if (!options.length)
    return

  const currentIndex = Math.max(0, options.findIndex(option => option.value === props.modelValue))
  let nextIndex = currentIndex

  if (key === `Home`)
    nextIndex = 0
  else if (key === `End`)
    nextIndex = options.length - 1
  else if (key === `ArrowRight` || key === `ArrowDown`)
    nextIndex = (currentIndex + 1) % options.length
  else
    nextIndex = (currentIndex - 1 + options.length) % options.length

  const next = options[nextIndex]
  if (!next)
    return

  event.preventDefault()
  select(next.value)
  nextTick(() => focusOption(next.value))
}
</script>

<template>
  <div
    ref="rootRef"
    role="radiogroup"
    :class="cn(
      'inline-flex h-10 shrink-0 items-center rounded-md bg-muted p-1 text-muted-foreground',
      props.class,
    )"
    @keydown="onKeydown"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      :data-value="option.value"
      :aria-checked="modelValue === option.value"
      :tabindex="activeValue === option.value ? 0 : -1"
      class="inline-flex h-full items-center justify-center whitespace-nowrap rounded-sm px-3 text-sm font-medium transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      :class="modelValue === option.value
        ? 'bg-background text-foreground shadow-xs'
        : 'hover:text-foreground'"
      @click="select(option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

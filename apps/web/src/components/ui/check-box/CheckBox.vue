<script setup lang="ts">
import { Check } from 'lucide-vue-next'
import { CheckboxIndicator, CheckboxRoot } from 'radix-vue'

const props = defineProps<{
  checked: boolean
}>()

const emits = defineEmits([`update:checked`])
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <label class="flex flex-row gap-4 items-center [&>.checkbox]:hover:bg-neutral-100">
      <CheckboxRoot
        :checked="props.checked"
        class="shadow-blackA7 hover:bg-green3 flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-[4px] bg-white shadow-[0_2px_10px] outline-none focus-within:shadow-[0_0_0_2px_black]"
        @update:checked="(checked) => emits('update:checked', checked)"
      >
        <CheckboxIndicator class="bg-white h-full w-full rounded flex items-center justify-center">
          <Check
            icon="lucide:check"
            class="h-3.5 w-3.5 text-black"
          />
        </CheckboxIndicator>
      </CheckboxRoot>
      <span class="select-none">
        <slot />
      </span>
    </label>
  </div>
</template>

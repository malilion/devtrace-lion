<template>
  <div class="relative flex items-center">
    <slot name="prefix" />
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full bg-white dark:bg-devtools-panel-dark border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs text-devtools-text-light dark:text-devtools-text-dark placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      :class="{ 'pl-7': hasPrefix, 'pr-7': modelValue && clearable }"
      @input="onInput"
    />
    <button
      v-if="clearable && modelValue"
      type="button"
      class="absolute right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
      @click="$emit('update:modelValue', '')"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { useSlots } from 'vue';

const slots = useSlots();
const hasPrefix = !!slots.prefix;

withDefaults(
  defineProps<{
    modelValue: string;
    placeholder?: string;
    type?: string;
    clearable?: boolean;
    disabled?: boolean;
  }>(),
  {
    placeholder: '',
    type: 'text',
    clearable: false,
    disabled: false,
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

function onInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

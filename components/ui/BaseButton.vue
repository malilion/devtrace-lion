<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses,
      variantClasses,
    ]"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mr-1.5 animate-spin">⟳</span>
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'xs' | 'sm' | 'md';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    variant: 'secondary',
    size: 'sm',
    type: 'button',
    disabled: false,
    loading: false,
  }
);

defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'px-2 py-0.5 text-xs';
    case 'md':
      return 'px-3.5 py-1.5 text-sm';
    case 'sm':
    default:
      return 'px-2.5 py-1 text-xs';
  }
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
    case 'ghost':
      return 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'secondary':
    default:
      return 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700';
  }
});
</script>

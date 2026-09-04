<template>
  <span
    :class="[
      'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium tracking-tight',
      variantClasses,
    ]"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'purple';
  }>(),
  {
    variant: 'neutral',
  }
);

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/60';
    case 'warning':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800/60';
    case 'error':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300/40 dark:border-rose-800/60';
    case 'info':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/40 dark:border-sky-800/60';
    case 'purple':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300/40 dark:border-purple-800/60';
    case 'neutral':
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300/60 dark:border-gray-700';
  }
});
</script>

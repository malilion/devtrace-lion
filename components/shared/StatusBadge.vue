<template>
  <span
    :class="[
      'inline-flex items-center font-mono font-bold text-[11px] px-1.5 py-0.2 rounded border',
      statusClass,
    ]"
    :title="statusText"
  >
    {{ status ?? 'ERR' }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  status?: number;
  statusText?: string;
}>();

const statusClass = computed(() => {
  const code = props.status;
  if (code === undefined || code === 0) {
    return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-700';
  }
  if (code >= 200 && code < 300) {
    return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300/60 dark:border-emerald-800/60';
  }
  if (code >= 300 && code < 400) {
    return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-300/60 dark:border-sky-800/60';
  }
  if (code >= 400 && code < 500) {
    return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-300/60 dark:border-amber-800/60';
  }
  if (code >= 500) {
    return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-300/60 dark:border-rose-800/60';
  }
  return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700';
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-mono font-bold text-[10px] px-1.5 py-0.2 rounded uppercase tracking-wider',
      methodClass,
    ]"
  >
    {{ method }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  method: string;
}>();

const methodClass = computed(() => {
  switch (props.method?.toUpperCase()) {
    case 'GET':
      return 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300';
    case 'POST':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
    case 'PUT':
      return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
    case 'PATCH':
      return 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300';
    case 'DELETE':
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  }
});
</script>

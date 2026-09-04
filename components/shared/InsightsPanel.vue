<template>
  <div v-if="insight" class="rounded-lg border p-4 transition-all" :class="containerClass">
    <div class="flex items-start gap-3">
      <div class="text-lg leading-none mt-0.5">{{ icon }}</div>
      <div class="flex-1 space-y-2">
        <div>
          <h4 class="font-semibold text-sm" :class="titleClass">
            {{ insight.title }}
          </h4>
          <p class="text-xs text-gray-600 dark:text-gray-300 mt-1">
            {{ insight.message }}
          </p>
        </div>

        <div v-if="insight.recommendations.length > 0" class="pt-2 border-t border-black/5 dark:border-white/5 space-y-1">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Suggested Actions:
          </div>
          <ul class="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-200">
            <li v-for="(rec, idx) in insight.recommendations" :key="idx" class="leading-relaxed">
              {{ rec }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="p-6 text-center text-gray-400 dark:text-gray-500 border border-dashed border-devtools-border-light dark:border-devtools-border-dark rounded-lg">
    <span class="text-emerald-500 mr-1.5">✓</span>
    Request completed normally without diagnostic warnings.
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StatusInsight } from '@/types/insights';

const props = defineProps<{
  insight: StatusInsight | null;
}>();

const icon = computed(() => {
  if (!props.insight) return '✓';
  switch (props.insight.severity) {
    case 'error':
      return '⚠️';
    case 'warning':
      return '⚡';
    case 'info':
    default:
      return 'ℹ️';
  }
});

const containerClass = computed(() => {
  if (!props.insight) return '';
  switch (props.insight.severity) {
    case 'error':
      return 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50';
    case 'warning':
      return 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50';
    case 'info':
    default:
      return 'bg-blue-50/70 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50';
  }
});

const titleClass = computed(() => {
  if (!props.insight) return '';
  switch (props.insight.severity) {
    case 'error':
      return 'text-rose-700 dark:text-rose-400';
    case 'warning':
      return 'text-amber-700 dark:text-amber-400';
    case 'info':
    default:
      return 'text-blue-700 dark:text-blue-400';
  }
});
</script>

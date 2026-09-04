<template>
  <div class="space-y-4">
    <!-- Diff Summary Statistics -->
    <div v-if="diffResult.isJson" class="flex items-center gap-3 p-2.5 rounded bg-gray-50 dark:bg-devtools-panel-dark border border-devtools-border-light dark:border-devtools-border-dark">
      <span class="text-xs font-semibold text-devtools-text-light dark:text-devtools-text-dark">
        JSON Changes:
      </span>
      <span class="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <span class="font-bold">+{{ diffResult.summary.added }}</span> added
      </span>
      <span class="inline-flex items-center gap-1 text-xs font-medium text-rose-600 dark:text-rose-400">
        <span class="font-bold">-{{ diffResult.summary.removed }}</span> removed
      </span>
      <span class="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
        <span class="font-bold">~{{ diffResult.summary.changed }}</span> modified
      </span>
    </div>

    <!-- Error State (e.g. Non-JSON) -->
    <div
      v-if="!diffResult.isJson"
      class="p-4 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs"
    >
      <div class="font-semibold mb-1">Cannot Compare Responses</div>
      <p>{{ diffResult.errorMessage || 'Only valid JSON responses can be compared.' }}</p>
    </div>

    <!-- Diff Lines View -->
    <div
      v-else
      class="font-mono text-xs rounded border border-devtools-border-light dark:border-devtools-border-dark bg-[#1a1b1e] text-gray-200 p-3 overflow-x-auto max-h-[500px]"
    >
      <pre v-if="diffResult.summary.entries.length === 0" class="text-gray-400 italic">No differences found. Both responses are identical.</pre>
      <div v-else class="space-y-1">
        <div
          v-for="(entry, idx) in diffResult.summary.entries"
          :key="idx"
          :class="[
            'p-1.5 rounded',
            entry.type === 'CREATE' ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500' : '',
            entry.type === 'REMOVE' ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500' : '',
            entry.type === 'CHANGE' ? 'bg-amber-950/40 text-amber-300 border-l-2 border-amber-500' : '',
          ]"
        >
          <div class="font-bold text-[11px] mb-0.5">
            <span v-if="entry.type === 'CREATE'">+ Added</span>
            <span v-else-if="entry.type === 'REMOVE'">- Removed</span>
            <span v-else>~ Modified</span>:
            <span class="text-blue-300">[{{ entry.pathString }}]</span>
          </div>
          <div v-if="entry.type === 'CREATE'" class="text-emerald-400 pl-2">
            {{ JSON.stringify(entry.value, null, 2) }}
          </div>
          <div v-else-if="entry.type === 'REMOVE'" class="text-rose-400 pl-2 line-through">
            {{ JSON.stringify(entry.oldValue, null, 2) }}
          </div>
          <div v-else class="space-y-0.5 pl-2">
            <div class="text-rose-400 line-through">
              - {{ JSON.stringify(entry.oldValue, null, 2) }}
            </div>
            <div class="text-emerald-400">
              + {{ JSON.stringify(entry.value, null, 2) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { computeJsonDiff } from '@/lib/diff/json-diff';

const props = defineProps<{
  baseJson?: string;
  compareJson?: string;
}>();

const diffResult = computed(() => {
  return computeJsonDiff(props.baseJson, props.compareJson);
});
</script>

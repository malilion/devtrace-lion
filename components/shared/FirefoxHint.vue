<template>
  <div
    v-if="isFirefox"
    class="flex items-center justify-between px-3 py-1.5 bg-amber-50/70 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-800 dark:text-amber-300"
  >
    <div class="flex items-center gap-2">
      <span>🦊</span>
      <span>
        <strong>Firefox note:</strong> DevTools requires opening Firefox's native <em>Network</em> tab at least once to initialize network capturing.
      </span>
    </div>
    <button
      type="button"
      class="text-amber-600 hover:text-amber-800 dark:text-amber-400 text-xs px-1"
      @click="dismissed = true"
    >
      ✕
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const dismissed = ref(false);

const isFirefox = computed(() => {
  if (dismissed.value) return false;
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent);
});
</script>

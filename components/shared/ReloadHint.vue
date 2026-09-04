<template>
  <div class="flex items-center justify-between p-3 rounded-md bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300">
    <div class="flex items-center gap-2">
      <span class="text-base">🔄</span>
      <span>
        No API requests captured yet. DevTools must be open during page load to capture initial requests.
      </span>
    </div>
    <button
      type="button"
      class="px-2.5 py-1 rounded font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0"
      @click="handleReload"
    >
      Reload Page
    </button>
  </div>
</template>

<script setup lang="ts">
function handleReload() {
  if (typeof chrome !== 'undefined' && chrome.devtools?.inspectedWindow) {
    chrome.devtools.inspectedWindow.reload({});
  } else {
    window.location.reload();
  }
}
</script>

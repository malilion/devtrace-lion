<template>
  <div class="relative group font-mono text-xs rounded border border-devtools-border-light dark:border-devtools-border-dark bg-gray-50 dark:bg-[#1a1b1e] overflow-hidden">
    <!-- Header with Language and Copy Button -->
    <div class="flex items-center justify-between px-3 py-1.5 border-b border-devtools-border-light dark:border-devtools-border-dark bg-white/40 dark:bg-white/5">
      <span class="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">
        {{ language }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        @click="handleCopy"
      >
        <span>{{ copied ? '✓ Copied' : 'Copy' }}</span>
      </button>
    </div>

    <!-- Code Content -->
    <div class="p-3 overflow-x-auto max-h-[400px]">
      <pre class="text-xs leading-relaxed text-devtools-text-light dark:text-devtools-text-dark select-text"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  code: string;
  language: string;
}>();

const copied = ref(false);

async function handleCopy() {
  if (!props.code) return;
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = props.code;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  }
}
</script>

<template>
  <div class="relative group font-mono text-xs rounded border border-devtools-border-light dark:border-devtools-border-dark bg-gray-50 dark:bg-[#1a1b1e] overflow-hidden">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-3 py-1.5 border-b border-devtools-border-light dark:border-devtools-border-dark bg-white/40 dark:bg-white/5">
      <div class="text-[11px] text-gray-500 dark:text-gray-400">
        {{ label || 'JSON Payload' }}
      </div>
      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          @click="handleCopy"
        >
          <span>{{ copied ? '✓ Copied' : 'Copy' }}</span>
        </button>
      </div>
    </div>

    <!-- Code Display -->
    <div class="p-3 overflow-x-auto max-h-[450px]">
      <pre
        class="whitespace-pre text-xs leading-relaxed text-devtools-text-light dark:text-devtools-text-dark select-text"
        v-html="highlightedContent"
      ></pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  content?: string;
  label?: string;
  /**
   * The text placed on the clipboard when the user clicks "Copy".
   * SECURITY: this must ALWAYS be the redacted value. `content` may show
   * locally-revealed raw secrets on screen, but copy must never leak them.
   * Falls back to `content` only when not provided (non-sensitive views).
   */
  copyContent?: string;
}>();

const copied = ref(false);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const highlightedContent = computed(() => {
  if (!props.content) return '<span class="text-gray-400 italic">Empty</span>';

  let formatted = props.content;
  try {
    const parsed = JSON.parse(props.content);
    formatted = JSON.stringify(parsed, null, 2);
  } catch {
    return escapeHtml(props.content);
  }

  // Syntax highlighting regex
  const escaped = escapeHtml(formatted);
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-purple-600 dark:text-purple-400'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-blue-600 dark:text-blue-400 font-semibold'; // key
        } else {
          cls = 'text-emerald-600 dark:text-emerald-400'; // string
          if (match.includes('•••••••••••')) {
            cls = 'text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/10 px-1 rounded';
          }
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-amber-600 dark:text-amber-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-500 italic'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
});

async function handleCopy() {
  // SECURITY: never copy the on-screen (possibly revealed) content.
  // Prefer the explicit redacted copyContent; fall back to content.
  const textToCopy = props.copyContent ?? props.content;
  if (!textToCopy) return;
  try {
    await navigator.clipboard.writeText(textToCopy);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    // Fallback if clipboard API not accessible
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
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

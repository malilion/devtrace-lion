<template>
  <div v-if="record" class="flex flex-col h-full bg-white dark:bg-devtools-bg-dark border-l border-devtools-border-light dark:border-devtools-border-dark overflow-hidden">
    <!-- Detail Header -->
    <div class="flex items-center justify-between px-4 py-2.5 border-b border-devtools-border-light dark:border-devtools-border-dark bg-gray-50 dark:bg-devtools-panel-dark">
      <div class="flex items-center gap-2 overflow-hidden mr-2">
        <MethodBadge :method="record.method" />
        <StatusBadge :status="record.status" :status-text="record.statusText" />
        <span class="font-mono text-xs truncate text-devtools-text-light dark:text-devtools-text-dark font-medium" :title="record.url">
          {{ record.path }}
        </span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Reveal Locally Toggle -->
        <button
          v-if="record.redactedKeys.length > 0"
          type="button"
          :class="[
            'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border transition-colors',
            isRevealed
              ? 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-700'
              : 'bg-white dark:bg-devtools-panel-dark text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
          :title="isRevealed ? 'Hide raw secrets' : 'Temporarily reveal secrets locally (does not affect copy/export)'"
          @click="networkStore.toggleLocalReveal(record.id)"
        >
          <span>{{ isRevealed ? '🙈 Hide Secrets' : '👁️ Reveal Locally' }}</span>
        </button>

        <!-- Quick Copy cURL -->
        <BaseButton size="xs" variant="secondary" @click="handleCopyCurl">
          {{ curlCopied ? '✓ Copied cURL' : 'cURL' }}
        </BaseButton>

        <!-- Close Detail Panel -->
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm px-1.5 py-0.5 rounded"
          @click="networkStore.selectRecord(null)"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Reveal Locally Warning Banner -->
    <div
      v-if="isRevealed"
      class="px-4 py-1.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between"
    >
      <span>⚠️ <strong>Local preview active:</strong> Raw secrets are temporarily shown in this view only. All Copy and Export functions remain strictly redacted.</span>
      <button
        type="button"
        class="underline text-amber-900 dark:text-amber-200 font-semibold ml-2"
        @click="networkStore.toggleLocalReveal(record.id)"
      >
        Hide
      </button>
    </div>

    <!-- Tabs Header -->
    <div class="flex items-center px-2 border-b border-devtools-border-light dark:border-devtools-border-dark bg-white dark:bg-devtools-bg-dark overflow-x-auto text-xs font-medium">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        :class="[
          'px-3 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5',
          activeTab === tab.id
            ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
            : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
        ]"
        @click="activeTab = tab.id"
      >
        <span>{{ tab.name }}</span>
        <span
          v-if="tab.badge !== undefined"
          class="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          {{ tab.badge }}
        </span>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="flex-1 overflow-y-auto p-4 text-xs">
      <!-- 1. OVERVIEW TAB -->
      <div v-if="activeTab === 'overview'" class="space-y-4">
        <!-- General Section -->
        <div class="border border-devtools-border-light dark:border-devtools-border-dark rounded p-3 space-y-2">
          <h4 class="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">General Information</h4>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-400">Request URL:</span>
              <div class="font-mono break-all font-medium text-devtools-text-light dark:text-devtools-text-dark select-text">{{ record.url }}</div>
            </div>
            <div>
              <span class="text-gray-400">Request Method:</span>
              <div class="font-mono font-medium">{{ record.method }}</div>
            </div>
            <div>
              <span class="text-gray-400">Status:</span>
              <div class="font-mono font-medium">{{ record.status }} {{ record.statusText }}</div>
            </div>
            <div>
              <span class="text-gray-400">Duration:</span>
              <div class="font-mono font-medium">{{ record.duration ?? 0 }} ms</div>
            </div>
            <div>
              <span class="text-gray-400">Started At:</span>
              <div class="font-mono">{{ new Date(record.startedAt).toLocaleTimeString() }}</div>
            </div>
            <div>
              <span class="text-gray-400">MIME Type:</span>
              <div class="font-mono">{{ record.mimeType || 'unknown' }}</div>
            </div>
          </div>
        </div>

        <!-- Redacted Secrets Notice -->
        <div v-if="record.redactedKeys.length > 0" class="p-3 rounded bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
          <div>
            <div class="font-semibold text-amber-800 dark:text-amber-300">
              🔒 {{ record.redactedKeys.length }} sensitive fields protected
            </div>
            <div class="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
              Protected fields: {{ record.redactedKeys.join(', ') }}
            </div>
          </div>
          <BaseButton size="xs" variant="secondary" @click="networkStore.toggleLocalReveal(record.id)">
            {{ isRevealed ? 'Hide' : 'Reveal Locally' }}
          </BaseButton>
        </div>

        <!-- Query Parameters -->
        <div v-if="Object.keys(record.query).length > 0" class="border border-devtools-border-light dark:border-devtools-border-dark rounded overflow-hidden">
          <div class="px-3 py-1.5 bg-gray-50 dark:bg-devtools-panel-dark font-semibold text-gray-500 uppercase tracking-wider text-[11px] border-b border-devtools-border-light dark:border-devtools-border-dark">
            Query Parameters ({{ Object.keys(record.query).length }})
          </div>
          <div class="divide-y divide-devtools-border-light dark:divide-devtools-border-dark font-mono text-xs">
            <div v-for="(val, key) in record.query" :key="key" class="grid grid-cols-3 p-2 hover:bg-black/5 dark:hover:bg-white/5">
              <span class="text-blue-600 dark:text-blue-400 font-medium select-text">{{ key }}:</span>
              <span class="col-span-2 text-gray-700 dark:text-gray-300 break-all select-text">{{ val }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. HEADERS TAB -->
      <div v-else-if="activeTab === 'headers'" class="space-y-4">
        <!-- Request Headers -->
        <div class="border border-devtools-border-light dark:border-devtools-border-dark rounded overflow-hidden">
          <div class="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-devtools-panel-dark border-b border-devtools-border-light dark:border-devtools-border-dark">
            <span class="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Request Headers ({{ Object.keys(displayedRequestHeaders).length }})
            </span>
            <BaseButton size="xs" variant="ghost" @click="copyHeaders(displayedRequestHeaders)">
              {{ headersCopied ? '✓ Copied' : 'Copy' }}
            </BaseButton>
          </div>
          <div class="divide-y divide-devtools-border-light dark:divide-devtools-border-dark font-mono text-xs">
            <div
              v-for="(val, key) in displayedRequestHeaders"
              :key="key"
              class="grid grid-cols-3 p-2 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span class="text-blue-600 dark:text-blue-400 font-medium select-text">{{ key }}:</span>
              <span
                class="col-span-2 break-all select-text"
                :class="{ 'text-amber-600 dark:text-amber-400 font-bold': val.includes('•••••••••••') }"
              >
                {{ val }}
              </span>
            </div>
          </div>
        </div>

        <!-- Response Headers -->
        <div class="border border-devtools-border-light dark:border-devtools-border-dark rounded overflow-hidden">
          <div class="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-devtools-panel-dark border-b border-devtools-border-light dark:border-devtools-border-dark">
            <span class="font-semibold text-gray-500 uppercase tracking-wider text-[11px]">
              Response Headers ({{ Object.keys(displayedResponseHeaders).length }})
            </span>
            <BaseButton size="xs" variant="ghost" @click="copyHeaders(displayedResponseHeaders)">
              Copy
            </BaseButton>
          </div>
          <div class="divide-y divide-devtools-border-light dark:divide-devtools-border-dark font-mono text-xs">
            <div
              v-for="(val, key) in displayedResponseHeaders"
              :key="key"
              class="grid grid-cols-3 p-2 hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span class="text-blue-600 dark:text-blue-400 font-medium select-text">{{ key }}:</span>
              <span
                class="col-span-2 break-all select-text"
                :class="{ 'text-amber-600 dark:text-amber-400 font-bold': val.includes('•••••••••••') }"
              >
                {{ val }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. PAYLOAD TAB -->
      <div v-else-if="activeTab === 'payload'" class="space-y-3">
        <div v-if="!record.requestBody || (!record.requestBody.captured && !record.requestBody.text)" class="p-6 text-center text-gray-400 border border-dashed border-devtools-border-light dark:border-devtools-border-dark rounded-lg">
          <div class="text-sm mb-1">No payload data</div>
          <p v-if="['POST', 'PUT', 'PATCH'].includes(record.method.toUpperCase())" class="text-xs text-amber-600 dark:text-amber-400">
            Request body was not captured by DevTools (e.g. streaming or binary upload).
          </p>
          <p v-else class="text-xs">
            GET and HEAD requests typically do not carry a request body.
          </p>
        </div>
        <div v-else>
          <JsonViewer :content="displayedRequestBodyText" label="Request Payload" />
        </div>
      </div>

      <!-- 4. RESPONSE TAB -->
      <div v-else-if="activeTab === 'response'" class="space-y-3">
        <!-- Base64 notification -->
        <div v-if="record.responseBody?.encoding === 'base64'" class="p-3 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
          <div class="font-semibold">Binary Response ({{ record.responseBody.size }} bytes)</div>
          <div class="text-[11px] mt-0.5">MIME: {{ record.mimeType || 'binary/octet-stream' }} — Base64 encoded.</div>
        </div>

        <!-- Truncation notification -->
        <div v-if="record.responseBody?.isTruncated" class="p-3 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
          <strong>Response Truncated:</strong> Content exceeded size limit and was truncated to 1MB to preserve memory.
        </div>

        <!-- Uncaptured body notification -->
        <div v-if="record.responseBody && !record.responseBody.captured" class="p-6 text-center text-gray-400 border border-dashed border-devtools-border-light dark:border-devtools-border-dark rounded-lg">
          Response content not captured by browser DevTools.
        </div>

        <!-- Response Body Content -->
        <div v-else>
          <JsonViewer :content="displayedResponseBodyText" label="Response Body" />
        </div>
      </div>

      <!-- 5. TIMING TAB -->
      <div v-else-if="activeTab === 'timing'">
        <TimingChart :timings="record.timings" :duration="record.duration" />
      </div>

      <!-- 6. CODE GEN TAB -->
      <div v-else-if="activeTab === 'codegen'" class="space-y-4">
        <!-- Language Switcher -->
        <div class="flex items-center gap-1.5">
          <button
            v-for="lang in codeLanguages"
            :key="lang.id"
            type="button"
            :class="[
              'px-2.5 py-1 rounded text-xs font-medium transition-colors',
              activeLang === lang.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-devtools-panel-dark text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            ]"
            @click="activeLang = lang.id"
          >
            {{ lang.name }}
          </button>
        </div>

        <!-- Generated Code Block -->
        <CodeBlock :code="generatedSnippet" :language="activeLang" />
      </div>

      <!-- 7. INSIGHTS TAB -->
      <div v-else-if="activeTab === 'insights'">
        <InsightsPanel :insight="insight" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MethodBadge from '@/components/shared/MethodBadge.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import JsonViewer from '@/components/shared/JsonViewer.vue';
import CodeBlock from '@/components/shared/CodeBlock.vue';
import TimingChart from '@/components/shared/TimingChart.vue';
import InsightsPanel from '@/components/shared/InsightsPanel.vue';
import { useNetworkStore } from '@/stores/network';
import { toCurl } from '@/lib/codegen/curl';
import { toFetch } from '@/lib/codegen/fetch';
import { toAxios } from '@/lib/codegen/axios';
import { toCSharp } from '@/lib/codegen/csharp';
import { toPython } from '@/lib/codegen/python';
import { toGo } from '@/lib/codegen/go';
import { toHttpie } from '@/lib/codegen/httpie';
import { toPhp } from '@/lib/codegen/php';
import { getStatusInsight } from '@/lib/insights/status-insights';
import type { NetworkRecord } from '@/types/network';

const props = defineProps<{
  record: NetworkRecord;
}>();

const networkStore = useNetworkStore();
const activeTab = ref('overview');
const activeLang = ref('curl');
const curlCopied = ref(false);
const headersCopied = ref(false);

const isRevealed = computed(() => networkStore.isLocallyRevealed(props.record.id));
const rawUnredacted = computed(() => networkStore.getRawUnredacted(props.record.id));

// In-memory local reveal display bindings
const displayedRequestHeaders = computed(() => {
  if (isRevealed.value && rawUnredacted.value?.requestHeaders) {
    return rawUnredacted.value.requestHeaders;
  }
  return props.record.requestHeaders;
});

const displayedResponseHeaders = computed(() => {
  if (isRevealed.value && rawUnredacted.value?.responseHeaders) {
    return rawUnredacted.value.responseHeaders;
  }
  return props.record.responseHeaders;
});

const displayedRequestBodyText = computed(() => {
  if (isRevealed.value && rawUnredacted.value?.requestBodyText !== undefined) {
    return rawUnredacted.value.requestBodyText;
  }
  return props.record.requestBody?.text;
});

const displayedResponseBodyText = computed(() => {
  if (isRevealed.value && rawUnredacted.value?.responseBodyText !== undefined) {
    return rawUnredacted.value.responseBodyText;
  }
  return props.record.responseBody?.text;
});

const insight = computed(() => getStatusInsight(props.record));

const tabs = computed(() => [
  { id: 'overview', name: 'Overview' },
  { id: 'headers', name: 'Headers', badge: Object.keys(props.record.requestHeaders).length },
  { id: 'payload', name: 'Payload' },
  { id: 'response', name: 'Response' },
  { id: 'timing', name: 'Timing' },
  { id: 'codegen', name: 'Code Gen' },
  { id: 'insights', name: 'Insights', badge: insight.value ? '!' : undefined },
]);

const codeLanguages = [
  { id: 'curl', name: 'cURL' },
  { id: 'fetch', name: 'Fetch' },
  { id: 'axios', name: 'Axios' },
  { id: 'csharp', name: 'C# HttpClient' },
  { id: 'python', name: 'Python' },
  { id: 'go', name: 'Go' },
  { id: 'httpie', name: 'HTTPie' },
  { id: 'php', name: 'PHP' },
];

const generatedSnippet = computed(() => {
  // Always generates code using the safe redacted record
  switch (activeLang.value) {
    case 'fetch':
      return toFetch(props.record);
    case 'axios':
      return toAxios(props.record);
    case 'csharp':
      return toCSharp(props.record);
    case 'python':
      return toPython(props.record);
    case 'go':
      return toGo(props.record);
    case 'httpie':
      return toHttpie(props.record);
    case 'php':
      return toPhp(props.record);
    case 'curl':
    default:
      return toCurl(props.record);
  }
});

async function handleCopyCurl() {
  const curl = toCurl(props.record);
  try {
    await navigator.clipboard.writeText(curl);
    curlCopied.value = true;
    setTimeout(() => {
      curlCopied.value = false;
    }, 1800);
  } catch {
    // Ignore
  }
}

async function copyHeaders(headers: Record<string, string>) {
  const text = Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  try {
    await navigator.clipboard.writeText(text);
    headersCopied.value = true;
    setTimeout(() => {
      headersCopied.value = false;
    }, 1800);
  } catch {
    // Ignore
  }
}
</script>

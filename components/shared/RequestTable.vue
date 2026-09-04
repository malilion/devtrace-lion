<template>
  <div class="flex flex-col h-full bg-white dark:bg-devtools-bg-dark overflow-hidden">
    <!-- Filter and Search Toolbar -->
    <div class="flex flex-wrap items-center justify-between gap-2 p-2 border-b border-devtools-border-light dark:border-devtools-border-dark bg-gray-50/70 dark:bg-devtools-panel-dark/50">
      <!-- Search Input -->
      <div class="w-64">
        <BaseInput
          :model-value="networkStore.filter.searchQuery"
          placeholder="Filter URL or body content..."
          clearable
          @update:model-value="onSearchInput"
        >
          <template #prefix>
            <span class="absolute left-2.5 text-gray-400 text-xs">🔍</span>
          </template>
        </BaseInput>
      </div>

      <!-- Quick Method & Status Filter Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
        <!-- Resource Type Toggle -->
        <button
          type="button"
          :class="[
            'px-2 py-0.5 rounded text-[11px] font-medium transition-colors border',
            networkStore.filter.resourceType === 'FETCH_XHR'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-devtools-panel-dark text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
          ]"
          @click="toggleResourceType"
        >
          Fetch/XHR Only
        </button>

        <!-- Status Filter Group -->
        <div class="flex items-center rounded border border-gray-300 dark:border-gray-700 overflow-hidden bg-white dark:bg-devtools-panel-dark text-[11px]">
          <button
            v-for="st in statusOptions"
            :key="st"
            type="button"
            :class="[
              'px-2 py-0.5 font-medium transition-colors',
              networkStore.filter.statusClass === st
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-bold'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            ]"
            @click="networkStore.setFilter({ statusClass: st })"
          >
            {{ st }}
          </button>
        </div>

        <!-- Method Filter Dropdown -->
        <select
          :value="networkStore.filter.method"
          class="bg-white dark:bg-devtools-panel-dark border border-gray-300 dark:border-gray-700 rounded px-2 py-0.5 text-[11px] text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          @change="onMethodSelect"
        >
          <option value="ALL">All Methods</option>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1.5 ml-auto">
        <BaseButton size="xs" variant="ghost" title="Compare two JSON responses" @click="$emit('open-diff')">
          Diff Compare
        </BaseButton>
        <BaseButton size="xs" variant="ghost" title="Clear recorded requests" @click="networkStore.clearRecords">
          Clear
        </BaseButton>
      </div>
    </div>

    <!-- Table Container -->
    <div
      ref="tableContainerRef"
      class="flex-1 overflow-y-auto outline-none focus:ring-0"
      tabindex="0"
      @keydown.down.prevent="navigateRow(1)"
      @keydown.up.prevent="navigateRow(-1)"
    >
      <!-- Empty State -->
      <div v-if="networkStore.filteredRecords.length === 0" class="p-6 space-y-4">
        <ReloadHint />
        <div class="text-center text-xs text-gray-400 dark:text-gray-500 py-8">
          <div class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
            {{ networkStore.records.length > 0 ? 'No requests match your current filter' : 'No network activity recorded' }}
          </div>
          <p>
            {{ networkStore.records.length > 0 ? 'Try clearing filters or search query.' : 'Perform an action on the page or reload to capture network requests.' }}
          </p>
        </div>
      </div>

      <!-- Requests Table -->
      <table v-else class="w-full text-xs text-left border-collapse select-none">
        <thead class="sticky top-0 z-10 bg-gray-100 dark:bg-devtools-panel-dark text-gray-500 dark:text-gray-400 border-b border-devtools-border-light dark:border-devtools-border-dark text-[11px] font-medium">
          <tr>
            <th class="py-1.5 px-3 w-16">Status</th>
            <th class="py-1.5 px-3 w-16">Method</th>
            <th class="py-1.5 px-3">Path / URL</th>
            <th class="py-1.5 px-3 w-20 text-right">Time</th>
            <th class="py-1.5 px-3 w-20 text-right">Size</th>
            <th class="py-1.5 px-3 w-24 text-center">Security</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-devtools-border-light/60 dark:divide-devtools-border-dark/60 font-mono">
          <tr
            v-for="rec in networkStore.filteredRecords"
            :key="rec.id"
            :class="[
              'cursor-pointer transition-colors',
              networkStore.selectedId === rec.id
                ? 'bg-devtools-selected-light dark:bg-devtools-selected-dark text-blue-900 dark:text-blue-100'
                : 'hover:bg-devtools-hover-light dark:hover:bg-devtools-hover-dark text-devtools-text-light dark:text-devtools-text-dark'
            ]"
            @click="networkStore.selectRecord(rec.id)"
          >
            <!-- Status -->
            <td class="py-1.5 px-3 whitespace-nowrap">
              <StatusBadge :status="rec.status" :status-text="rec.statusText" />
            </td>

            <!-- Method -->
            <td class="py-1.5 px-3 whitespace-nowrap">
              <MethodBadge :method="rec.method" />
            </td>

            <!-- Path & Query -->
            <td class="py-1.5 px-3 font-medium truncate max-w-xs md:max-w-md" :title="rec.url">
              <div class="truncate">
                <span class="font-semibold">{{ rec.path }}</span>
                <span v-if="Object.keys(rec.query).length > 0" class="text-gray-400 dark:text-gray-500 ml-1">
                  ?{{ Object.entries(rec.query).map(([k, v]) => `${k}=${v}`).join('&') }}
                </span>
              </div>
            </td>

            <!-- Duration -->
            <td class="py-1.5 px-3 text-right whitespace-nowrap text-gray-600 dark:text-gray-300">
              {{ rec.duration !== undefined ? `${rec.duration} ms` : '—' }}
            </td>

            <!-- Size -->
            <td class="py-1.5 px-3 text-right whitespace-nowrap text-gray-500">
              {{ formatSize(rec.responseBody?.size) }}
            </td>

            <!-- Redacted Keys Status -->
            <td class="py-1.5 px-3 text-center whitespace-nowrap">
              <span
                v-if="rec.redactedKeys.length > 0"
                class="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                :title="`Redacted: ${rec.redactedKeys.join(', ')}`"
              >
                🔒 {{ rec.redactedKeys.length }}
              </span>
              <span v-else class="text-gray-300 dark:text-gray-600 text-[10px]">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer Bar -->
    <div class="flex items-center justify-between px-3 py-1 border-t border-devtools-border-light dark:border-devtools-border-dark bg-gray-50 dark:bg-devtools-panel-dark text-[11px] text-gray-500">
      <div class="flex items-center gap-2">
        <span>{{ networkStore.filteredRecords.length }} / {{ networkStore.records.length }} requests</span>
      </div>
      <div class="flex items-center gap-3">
        <span>Zero Permissions</span>
        <span>•</span>
        <span>Local-First</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import MethodBadge from '@/components/shared/MethodBadge.vue';
import ReloadHint from '@/components/shared/ReloadHint.vue';
import { useNetworkStore } from '@/stores/network';
import type { HttpMethodFilter, HttpStatusClassFilter } from '@/types/network';

defineEmits<{
  (e: 'open-diff'): void;
}>();

const networkStore = useNetworkStore();
const tableContainerRef = ref<HTMLElement | null>(null);

const statusOptions: HttpStatusClassFilter[] = ['ALL', '2xx', '3xx', '4xx', '5xx'];

function onSearchInput(val: string) {
  networkStore.setFilter({ searchQuery: val });
}

function onMethodSelect(e: Event) {
  const target = e.target as HTMLSelectElement;
  networkStore.setFilter({ method: target.value as HttpMethodFilter });
}

function toggleResourceType() {
  const current = networkStore.filter.resourceType;
  networkStore.setFilter({
    resourceType: current === 'FETCH_XHR' ? 'ALL' : 'FETCH_XHR',
  });
}

function formatSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function navigateRow(direction: number) {
  const list = networkStore.filteredRecords;
  if (list.length === 0) return;

  const currentIdx = list.findIndex((r) => r.id === networkStore.selectedId);
  let nextIdx = currentIdx + direction;

  if (currentIdx === -1) {
    nextIdx = direction > 0 ? 0 : list.length - 1;
  } else if (nextIdx < 0) {
    nextIdx = 0;
  } else if (nextIdx >= list.length) {
    nextIdx = list.length - 1;
  }

  networkStore.selectRecord(list[nextIdx].id);
}
</script>

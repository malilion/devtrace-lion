<template>
  <div class="space-y-4">
    <!-- Visual Waterfall Bar -->
    <div class="space-y-1">
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>Timeline Distribution</span>
        <span class="font-mono font-semibold text-devtools-text-light dark:text-devtools-text-dark">
          Total: {{ totalDuration }} ms
        </span>
      </div>
      <div class="flex h-3 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
        <div
          v-if="timings?.blocked"
          class="bg-gray-400"
          :style="{ width: `${getPercent(timings.blocked)}%` }"
          :title="`Blocked: ${timings.blocked}ms`"
        />
        <div
          v-if="timings?.dns"
          class="bg-blue-400"
          :style="{ width: `${getPercent(timings.dns)}%` }"
          :title="`DNS Lookup: ${timings.dns}ms`"
        />
        <div
          v-if="timings?.connect"
          class="bg-orange-400"
          :style="{ width: `${getPercent(timings.connect)}%` }"
          :title="`Initial Connection: ${timings.connect}ms`"
        />
        <div
          v-if="timings?.ssl"
          class="bg-purple-400"
          :style="{ width: `${getPercent(timings.ssl)}%` }"
          :title="`SSL / TLS: ${timings.ssl}ms`"
        />
        <div
          v-if="timings?.send"
          class="bg-amber-400"
          :style="{ width: `${getPercent(timings.send)}%` }"
          :title="`Request Sent: ${timings.send}ms`"
        />
        <div
          v-if="timings?.wait"
          class="bg-emerald-500"
          :style="{ width: `${getPercent(timings.wait)}%` }"
          :title="`Waiting (TTFB): ${timings.wait}ms`"
        />
        <div
          v-if="timings?.receive"
          class="bg-teal-400"
          :style="{ width: `${getPercent(timings.receive)}%` }"
          :title="`Content Download: ${timings.receive}ms`"
        />
      </div>
    </div>

    <!-- Phase Breakdown Table -->
    <div class="border border-devtools-border-light dark:border-devtools-border-dark rounded overflow-hidden">
      <table class="w-full text-xs text-left">
        <thead class="bg-gray-50 dark:bg-devtools-panel-dark text-gray-500 border-b border-devtools-border-light dark:border-devtools-border-dark">
          <tr>
            <th class="py-1.5 px-3 font-medium">Phase</th>
            <th class="py-1.5 px-3 font-medium text-right">Duration</th>
            <th class="py-1.5 px-3 font-medium text-right">Share</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-devtools-border-light dark:divide-devtools-border-dark font-mono">
          <tr v-if="timings?.blocked !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-gray-400" />
              <span>Queueing / Blocked</span>
            </td>
            <td class="py-1.5 px-3 text-right">{{ timings.blocked.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.blocked).toFixed(1) }}%</td>
          </tr>
          <tr v-if="timings?.dns !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span>DNS Lookup</span>
            </td>
            <td class="py-1.5 px-3 text-right">{{ timings.dns.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.dns).toFixed(1) }}%</td>
          </tr>
          <tr v-if="timings?.connect !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span>Initial Connection</span>
            </td>
            <td class="py-1.5 px-3 text-right">{{ timings.connect.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.connect).toFixed(1) }}%</td>
          </tr>
          <tr v-if="timings?.ssl !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-purple-400" />
              <span>SSL / TLS Handshake</span>
            </td>
            <td class="py-1.5 px-3 text-right">{{ timings.ssl.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.ssl).toFixed(1) }}%</td>
          </tr>
          <tr v-if="timings?.send !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Request Sent</span>
            </td>
            <td class="py-1.5 px-3 text-right">{{ timings.send.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.send).toFixed(1) }}%</td>
          </tr>
          <tr v-if="timings?.wait !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span class="font-semibold">Waiting (TTFB)</span>
            </td>
            <td class="py-1.5 px-3 text-right font-semibold">{{ timings.wait.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.wait).toFixed(1) }}%</td>
          </tr>
          <tr v-if="timings?.receive !== undefined">
            <td class="py-1.5 px-3 flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-teal-400" />
              <span>Content Download</span>
            </td>
            <td class="py-1.5 px-3 text-right">{{ timings.receive.toFixed(1) }} ms</td>
            <td class="py-1.5 px-3 text-right text-gray-500">{{ getPercent(timings.receive).toFixed(1) }}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TimingBreakdown } from '@/types/network';

const props = defineProps<{
  timings?: TimingBreakdown;
  duration?: number;
}>();

const totalDuration = computed(() => {
  if (props.duration !== undefined) return props.duration;
  if (!props.timings) return 0;
  const t = props.timings;
  const sum =
    (t.blocked || 0) +
    (t.dns || 0) +
    (t.connect || 0) +
    (t.send || 0) +
    (t.wait || 0) +
    (t.receive || 0);
  return Math.round(sum);
});

function getPercent(val?: number): number {
  if (!val || !totalDuration.value || totalDuration.value <= 0) return 0;
  return Math.min(100, Math.max(0, (val / totalDuration.value) * 100));
}
</script>

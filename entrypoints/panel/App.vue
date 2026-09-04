<template>
  <div class="flex flex-col h-screen w-full bg-devtools-bg-light dark:bg-devtools-bg-dark text-devtools-text-light dark:text-devtools-text-dark antialiased select-none font-sans overflow-hidden">
    <!-- Firefox Guideline Banner -->
    <FirefoxHint />

    <!-- Top App Navigation Bar -->
    <header class="flex items-center justify-between px-3 py-1.5 border-b border-devtools-border-light dark:border-devtools-border-dark bg-gray-100 dark:bg-devtools-panel-dark shrink-0">
      <div class="flex items-center gap-3">
        <!-- Logo & Title -->
        <div class="flex items-center gap-1.5 font-bold text-xs text-devtools-text-light dark:text-devtools-text-dark">
          <img src="/icon-32.png" alt="DevTrace Lion" class="w-4 h-4 rounded object-cover shadow-xs" />
          <span>DevTrace</span>
          <span class="text-[10px] font-normal px-1 py-0.2 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-mono">
            v1.0.0
          </span>
        </div>

        <div class="hidden sm:flex items-center gap-1.5 text-[11px] text-gray-500 border-l border-devtools-border-light dark:border-devtools-border-dark pl-3">
          <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <span>🛡️</span> Zero Permissions
          </span>
          <span>•</span>
          <span>Local-First</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-1.5">
        <!-- Import HAR -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".har,.json"
          class="hidden"
          @change="handleFileImport"
        />
        <BaseButton size="xs" variant="ghost" title="Import HAR or Debug Bundle" @click="triggerFileInput">
          📥 Import HAR
        </BaseButton>

        <!-- Export Sanitized Bundle -->
        <BaseButton
          size="xs"
          variant="ghost"
          :disabled="networkStore.records.length === 0"
          title="Export sanitized debug bundle (all secrets redacted)"
          @click="handleExport"
        >
          📤 Export Bundle
        </BaseButton>

        <!-- Diff Modal Trigger -->
        <BaseButton
          size="xs"
          variant="ghost"
          :disabled="networkStore.records.length < 2"
          title="Compare two responses"
          @click="showDiffModal = true"
        >
          ⚡ Diff
        </BaseButton>

        <div class="h-3.5 w-px bg-devtools-border-light dark:border-devtools-border-dark mx-0.5" />

        <!-- Mock Mode indicator/loader if running outside DevTools -->
        <BaseButton
          v-if="isMockAvailable"
          size="xs"
          variant="secondary"
          title="Load sample API requests"
          @click="networkStore.loadMockData"
        >
          Reload Mock Data
        </BaseButton>

        <!-- Theme Toggle -->
        <button
          type="button"
          class="p-1 rounded text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-xs transition-colors"
          :title="isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
          @click="toggleTheme"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>

        <!-- Settings Button -->
        <button
          type="button"
          class="p-1 rounded text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-xs transition-colors"
          title="Settings"
          @click="showSettingsModal = true"
        >
          ⚙️
        </button>
      </div>
    </header>

    <!-- Main Workspace Split Pane -->
    <main class="flex-1 flex min-h-0 overflow-hidden">
      <!-- Left: Request Table -->
      <section
        :class="[
          'h-full flex flex-col min-w-0 transition-all duration-150',
          networkStore.selectedRecord ? 'w-full md:w-1/2 lg:w-5/12 border-r border-devtools-border-light dark:border-devtools-border-dark' : 'w-full'
        ]"
      >
        <RequestTable @open-diff="showDiffModal = true" />
      </section>

      <!-- Right: Request Detail Panel -->
      <section
        v-if="networkStore.selectedRecord"
        class="h-full hidden md:flex flex-col flex-1 min-w-0"
      >
        <RequestDetail :record="networkStore.selectedRecord" />
      </section>
    </main>

    <!-- Settings Modal -->
    <SettingsModal
      v-model="showSettingsModal"
    />

    <!-- Diff Modal -->
    <DiffModal
      v-model="showDiffModal"
      :records="networkStore.records"
      :initial-id-a="networkStore.selectedId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FirefoxHint from '@/components/shared/FirefoxHint.vue';
import RequestTable from '@/components/shared/RequestTable.vue';
import RequestDetail from '@/components/shared/RequestDetail.vue';
import SettingsModal from '@/components/shared/SettingsModal.vue';
import DiffModal from '@/components/shared/DiffModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useNetworkStore } from '@/stores/network';
import { useSettingsStore } from '@/stores/settings';
import { createSanitizedDebugBundle, downloadDebugBundle } from '@/lib/har/export-bundle';
import { importHarContent } from '@/lib/har/import-har';

const networkStore = useNetworkStore();
const settingsStore = useSettingsStore();

const showSettingsModal = ref(false);
const showDiffModal = ref(false);
const isDark = ref(false);
const isMockAvailable = ref(true);
const fileInputRef = ref<HTMLInputElement | null>(null);

onMounted(async () => {
  await settingsStore.loadSettings();
  initTheme();
});

function initTheme() {
  // Check DevTools theme if in DevTools environment
  if (typeof chrome !== 'undefined' && chrome.devtools?.panels?.themeName) {
    const devtoolsTheme = chrome.devtools.panels.themeName;
    applyTheme(devtoolsTheme === 'dark');
    return;
  }

  // Check saved setting or system preference
  const savedTheme = settingsStore.settings.theme;
  if (savedTheme === 'dark') {
    applyTheme(true);
  } else if (savedTheme === 'light') {
    applyTheme(false);
  } else {
    // System
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark);
  }
}

function applyTheme(dark: boolean) {
  isDark.value = dark;
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleTheme() {
  const next = !isDark.value;
  applyTheme(next);
  settingsStore.updateSettings({ theme: next ? 'dark' : 'light' });
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

async function handleFileImport(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const result = importHarContent(text, settingsStore.settings.customRedactedKeys);
    if (result.success) {
      for (const rec of result.records) {
        networkStore.addRecord({ record: rec });
      }
      if (result.records.length > 0) {
        networkStore.selectRecord(result.records[0].id);
      }
    } else {
      alert(`Import failed: ${result.error}`);
    }
  } catch (err) {
    alert(`Failed to read file: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    target.value = '';
  }
}

function handleExport() {
  if (networkStore.records.length === 0) return;
  const bundle = createSanitizedDebugBundle(
    networkStore.records,
    settingsStore.settings.customRedactedKeys
  );
  downloadDebugBundle(bundle);
}
</script>

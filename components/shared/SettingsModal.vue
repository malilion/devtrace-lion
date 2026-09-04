<template>
  <BaseModal
    :model-value="modelValue"
    title="DevTrace Lion Settings"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-6">
      <!-- General Preferences -->
      <div class="space-y-3">
        <h4 class="font-semibold text-xs text-gray-500 uppercase tracking-wider">
          General Preferences
        </h4>
        <div class="flex items-center justify-between p-2.5 rounded bg-gray-50 dark:bg-devtools-panel-dark border border-devtools-border-light dark:border-devtools-border-dark">
          <div>
            <div class="font-medium text-devtools-text-light dark:text-devtools-text-dark">
              Preserve Log on Navigation
            </div>
            <div class="text-[11px] text-gray-500">
              Keep network records when navigating between pages instead of clearing.
            </div>
          </div>
          <input
            type="checkbox"
            :checked="settingsStore.settings.preserveLog"
            class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            @change="togglePreserveLog"
          />
        </div>
      </div>

      <!-- Secret Redaction Settings -->
      <div class="space-y-3">
        <h4 class="font-semibold text-xs text-gray-500 uppercase tracking-wider">
          Secret Redaction
        </h4>
        <p class="text-xs text-gray-600 dark:text-gray-400">
          DevTrace Lion automatically redacts sensitive headers and JSON body parameters before requests enter memory.
        </p>

        <!-- Add Custom Key -->
        <div class="flex items-center gap-2">
          <input
            v-model="newCustomKey"
            type="text"
            placeholder="e.g. x-custom-tenant-token"
            class="flex-1 bg-white dark:bg-devtools-panel-dark border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1 text-xs text-devtools-text-light dark:text-devtools-text-dark focus:ring-1 focus:ring-blue-500"
            @keydown.enter="handleAddKey"
          />
          <BaseButton variant="primary" size="sm" @click="handleAddKey">
            Add Key
          </BaseButton>
        </div>

        <!-- Custom Keys List -->
        <div v-if="settingsStore.settings.customRedactedKeys.length > 0" class="space-y-1">
          <div class="text-[11px] font-medium text-gray-500">Custom Redacted Keys:</div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="k in settingsStore.settings.customRedactedKeys"
              :key="k"
              class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px]"
            >
              {{ k }}
              <button
                type="button"
                class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-200 font-bold"
                @click="settingsStore.removeCustomKey(k)"
              >
                ✕
              </button>
            </span>
          </div>
        </div>

        <!-- Default Redacted Keys Collapsible -->
        <details class="text-xs text-gray-500">
          <summary class="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 font-medium">
            View default redacted patterns ({{ defaultKeys.length }} keys)
          </summary>
          <div class="mt-2 p-2.5 rounded bg-gray-50 dark:bg-devtools-panel-dark border border-devtools-border-light dark:border-devtools-border-dark flex flex-wrap gap-1">
            <span
              v-for="k in defaultKeys"
              :key="k"
              class="px-1.5 py-0.5 rounded bg-gray-200/70 dark:bg-gray-800 text-[10px] text-gray-600 dark:text-gray-300 font-mono"
            >
              {{ k }}
            </span>
          </div>
        </details>
      </div>

      <!-- Privacy and Zero Permissions Guarantee -->
      <div class="p-3 rounded bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-1">
        <div class="flex items-center gap-2 font-semibold text-xs text-emerald-800 dark:text-emerald-300">
          <span>🛡️</span> Zero Permissions & Local-First Commitment
        </div>
        <p class="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
          DevTrace Lion requires <strong>zero Chrome permissions</strong>. All request processing and redactions take place strictly in your local DevTools session. Nothing is ever collected, uploaded, or transmitted.
        </p>
      </div>
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
        Done
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import { useSettingsStore } from '@/stores/settings';
import { DEFAULT_SECRET_KEYS } from '@/lib/security/redact-secrets';

defineProps<{
  modelValue: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const settingsStore = useSettingsStore();
const defaultKeys = DEFAULT_SECRET_KEYS;
const newCustomKey = ref('');

function handleAddKey() {
  if (newCustomKey.value.trim()) {
    settingsStore.addCustomKey(newCustomKey.value.trim());
    newCustomKey.value = '';
  }
}

function togglePreserveLog(e: Event) {
  const target = e.target as HTMLInputElement;
  settingsStore.updateSettings({ preserveLog: target.checked });
}
</script>

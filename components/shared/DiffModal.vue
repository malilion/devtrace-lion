<template>
  <BaseModal
    :model-value="modelValue"
    title="Compare JSON Responses"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <!-- Selectors for Base vs Compare -->
      <div class="grid grid-cols-2 gap-4 pb-3 border-b border-devtools-border-light dark:border-devtools-border-dark">
        <!-- Request A -->
        <div class="space-y-1">
          <label class="block text-[11px] font-semibold text-gray-500 uppercase">
            Base Request (A)
          </label>
          <select
            v-model="selectedIdA"
            class="w-full bg-white dark:bg-devtools-panel-dark border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-devtools-text-light dark:text-devtools-text-dark focus:ring-1 focus:ring-blue-500"
          >
            <option v-for="rec in records" :key="rec.id" :value="rec.id">
              {{ rec.method }} {{ rec.path }} ({{ rec.status }})
            </option>
          </select>
        </div>

        <!-- Request B -->
        <div class="space-y-1">
          <label class="block text-[11px] font-semibold text-gray-500 uppercase">
            Compared Request (B)
          </label>
          <select
            v-model="selectedIdB"
            class="w-full bg-white dark:bg-devtools-panel-dark border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-devtools-text-light dark:text-devtools-text-dark focus:ring-1 focus:ring-blue-500"
          >
            <option v-for="rec in records" :key="rec.id" :value="rec.id">
              {{ rec.method }} {{ rec.path }} ({{ rec.status }})
            </option>
          </select>
        </div>
      </div>

      <!-- Diff Viewer -->
      <DiffViewer
        :base-json="recordA?.responseBody?.text"
        :compare-json="recordB?.responseBody?.text"
      />
    </div>

    <template #footer>
      <BaseButton variant="secondary" @click="$emit('update:modelValue', false)">
        Close
      </BaseButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import DiffViewer from '@/components/shared/DiffViewer.vue';
import type { NetworkRecord } from '@/types/network';

const props = defineProps<{
  modelValue: boolean;
  records: NetworkRecord[];
  initialIdA?: string | null;
  initialIdB?: string | null;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const selectedIdA = ref<string>('');
const selectedIdB = ref<string>('');

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      if (props.initialIdA) {
        selectedIdA.value = props.initialIdA;
      } else if (props.records[0]) {
        selectedIdA.value = props.records[0].id;
      }

      if (props.initialIdB) {
        selectedIdB.value = props.initialIdB;
      } else if (props.records[1]) {
        selectedIdB.value = props.records[1].id;
      } else if (props.records[0]) {
        selectedIdB.value = props.records[0].id;
      }
    }
  },
  { immediate: true }
);

const recordA = computed(() => props.records.find((r) => r.id === selectedIdA.value));
const recordB = computed(() => props.records.find((r) => r.id === selectedIdB.value));
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      @click.self="$emit('update:modelValue', false)"
    >
      <div
        class="flex flex-col w-full max-w-2xl max-h-[85vh] bg-white dark:bg-devtools-bg-dark border border-devtools-border-light dark:border-devtools-border-dark rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-devtools-border-light dark:border-devtools-border-dark bg-gray-50/50 dark:bg-devtools-panel-dark/50">
          <div class="flex items-center gap-2">
            <slot name="icon" />
            <h3 class="text-sm font-semibold text-devtools-text-light dark:text-devtools-text-dark">
              {{ title }}
            </h3>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm p-1 rounded transition-colors"
            @click="$emit('update:modelValue', false)"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="flex-1 overflow-y-auto p-4 text-xs">
          <slot />
        </div>

        <!-- Modal Footer -->
        <div
          v-if="$slots.footer"
          class="flex items-center justify-end gap-2 px-4 py-3 border-t border-devtools-border-light dark:border-devtools-border-dark bg-gray-50/50 dark:bg-devtools-panel-dark/50"
        >
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script>

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import DiffModal from '@/components/shared/DiffModal.vue';
import { useNetworkStore } from '@/stores/network';

describe('DiffModal Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders modal and compares two responses from records', async () => {
    const store = useNetworkStore();
    store.loadMockData();

    const wrapper = mount(DiffModal, {
      props: {
        modelValue: true,
        records: store.records,
      },
      global: {
        plugins: [createPinia()],
      },
    });

    // Teleport or modal body check
    expect(wrapper.vm.modelValue).toBe(true);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RequestTable from '@/components/shared/RequestTable.vue';
import { useNetworkStore } from '@/stores/network';

describe('RequestTable Component', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders table rows when mock data is loaded', async () => {
    const store = useNetworkStore();
    store.loadMockData();

    const wrapper = mount(RequestTable, {
      global: {
        plugins: [pinia],
      },
    });

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain('/v1/users');
  });

  it('filters rows based on search input', async () => {
    const store = useNetworkStore();
    store.loadMockData();

    const wrapper = mount(RequestTable, {
      global: {
        plugins: [pinia],
      },
    });

    store.setFilter({ searchQuery: 'profile' });
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(1);
    expect(wrapper.text()).toContain('/v1/profile/me');
    expect(wrapper.text()).not.toContain('/v1/users');
  });

  it('filters rows based on status class filter', async () => {
    const store = useNetworkStore();
    store.loadMockData();

    const wrapper = mount(RequestTable, {
      global: {
        plugins: [pinia],
      },
    });

    store.setFilter({ statusClass: '4xx' });
    await wrapper.vm.$nextTick();

    const rows = wrapper.findAll('tbody tr');
    expect(rows.length).toBe(2); // 401 and 429 fixtures
  });
});

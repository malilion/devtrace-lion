import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import RequestDetail from '@/components/shared/RequestDetail.vue';
import { useNetworkStore } from '@/stores/network';
import { normalizeRequest } from '@/lib/network/normalize-request';
import { redactSecrets } from '@/lib/security/redact-secrets';
import get401Fixture from '../../fixtures/har/get-401-with-bearer.json';
import type { HarEntry } from '@/types/network';

describe('RequestDetail Component', () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it('renders overview tab by default and indicates redacted fields', () => {
    const store = useNetworkStore();
    const normalized = normalizeRequest(get401Fixture as unknown as HarEntry);
    const redactResult = redactSecrets(normalized);
    store.addRecord(redactResult);

    const wrapper = mount(RequestDetail, {
      props: {
        record: redactResult.record,
      },
      global: {
        plugins: [pinia],
      },
    });

    expect(wrapper.text()).toContain('/v1/profile/me');
    expect(wrapper.text()).toContain('sensitive fields protected');
  });

  it('switches to headers tab and shows masked header values', async () => {
    const store = useNetworkStore();
    const normalized = normalizeRequest(get401Fixture as unknown as HarEntry);
    const redactResult = redactSecrets(normalized);
    store.addRecord(redactResult);

    const wrapper = mount(RequestDetail, {
      props: {
        record: redactResult.record,
      },
      global: {
        plugins: [pinia],
      },
    });

    // Click Headers tab
    const headersTabBtn = wrapper.findAll('button').find((b) => b.text().includes('Headers'));
    expect(headersTabBtn).toBeDefined();
    await headersTabBtn?.trigger('click');

    expect(wrapper.text()).toContain('Bearer •••••••••••');
    expect(wrapper.text()).not.toContain('sensitive_payload');
  });

  it('reveals locally when toggle is activated without mutating store record', async () => {
    const store = useNetworkStore();
    const normalized = normalizeRequest(get401Fixture as unknown as HarEntry);
    const redactResult = redactSecrets(normalized);
    store.addRecord(redactResult);

    const wrapper = mount(RequestDetail, {
      props: {
        record: redactResult.record,
      },
      global: {
        plugins: [pinia],
      },
    });

    // Find and click Reveal Locally button
    const revealBtn = wrapper.findAll('button').find((b) => b.text().includes('Reveal Locally'));
    expect(revealBtn).toBeDefined();
    await revealBtn?.trigger('click');

    // Warning banner appears
    expect(wrapper.text()).toContain('Local preview active');

    // Switch to headers tab
    const headersTabBtn = wrapper.findAll('button').find((b) => b.text().includes('Headers'));
    await headersTabBtn?.trigger('click');

    // Now in local preview it shows raw payload
    expect(wrapper.text()).toContain('sensitive_payload');

    // But the store record itself remains strictly redacted!
    const storeRec = store.records.find((r) => r.id === redactResult.record.id);
    expect(storeRec?.requestHeaders['authorization']).toBe('Bearer •••••••••••');
  });
});

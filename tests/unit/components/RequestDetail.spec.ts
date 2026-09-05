import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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


describe('RequestDetail — copy actions stay redacted while "Reveal Locally" is active', () => {
  let pinia: ReturnType<typeof createPinia>;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);

    // Mock the async Clipboard API so we can inspect exactly what gets copied.
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    // Neutralize the execCommand fallback path (happy-dom has no real clipboard).
    (document as unknown as { execCommand: () => boolean }).execCommand = () => true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function mountRevealed() {
    const store = useNetworkStore();
    const normalized = normalizeRequest(get401Fixture as unknown as HarEntry);
    const redactResult = redactSecrets(normalized);
    store.addRecord(redactResult);

    const wrapper = mount(RequestDetail, {
      props: { record: redactResult.record },
      global: { plugins: [pinia] },
    });

    // Turn ON local reveal — the vulnerable state.
    store.toggleLocalReveal(redactResult.record.id);
    return { wrapper, store, redactResult };
  }

  it('copies MASKED request headers even when secrets are revealed on screen', async () => {
    const { wrapper } = mountRevealed();
    await wrapper.vm.$nextTick();

    // Go to Headers tab.
    const headersTab = wrapper.findAll('button').find((b) => b.text().includes('Headers'));
    await headersTab?.trigger('click');

    // Sanity: the raw secret IS visible on screen (display path unchanged).
    expect(wrapper.text()).toContain('sensitive_payload');

    // Click the Request Headers "Copy" button (first Copy in the headers tab).
    const copyBtn = wrapper.findAll('button').find((b) => b.text().trim() === 'Copy');
    expect(copyBtn).toBeDefined();
    await copyBtn?.trigger('click');

    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;

    // The clipboard must NOT contain the raw secret, and MUST contain the mask.
    expect(copied).not.toContain('sensitive_payload');
    expect(copied).toContain('•••••••••••');
  });

  it('never places a raw secret on the clipboard for any Copy button while revealed', async () => {
    const { wrapper } = mountRevealed();
    await wrapper.vm.$nextTick();

    // Exercise every tab that exposes a Copy control.
    for (const tabName of ['Headers', 'Payload', 'Response']) {
      const tab = wrapper.findAll('button').find((b) => b.text().includes(tabName));
      await tab?.trigger('click');
      const copyButtons = wrapper
        .findAll('button')
        .filter((b) => b.text().trim() === 'Copy' || b.text().includes('cURL'));
      for (const btn of copyButtons) {
        await btn.trigger('click');
      }
    }

    // Assert across ALL copy invocations: no raw secret ever leaked.
    for (const call of writeText.mock.calls) {
      const payload = call[0] as string;
      expect(payload).not.toContain('sensitive_payload');
    }
  });

  it('copies MASKED cURL command while revealed', async () => {
    const { wrapper } = mountRevealed();
    await wrapper.vm.$nextTick();

    const curlBtn = wrapper.findAll('button').find((b) => b.text().includes('cURL'));
    expect(curlBtn).toBeDefined();
    await curlBtn?.trigger('click');

    expect(writeText).toHaveBeenCalled();
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).not.toContain('sensitive_payload');
    expect(copied).toContain('•••••••••••');
  });
});

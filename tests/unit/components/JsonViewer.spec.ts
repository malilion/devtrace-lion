import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import JsonViewer from '@/components/shared/JsonViewer.vue';

describe('JsonViewer — copy source isolation', () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });
    (document as unknown as { execCommand: () => boolean }).execCommand = () => true;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function clickCopy(wrapper: ReturnType<typeof mount>) {
    const btn = wrapper.findAll('button').find((b) => b.text().includes('Copy'));
    expect(btn).toBeDefined();
    await btn?.trigger('click');
  }

  it('copies `copyContent` (redacted) instead of the displayed `content` when both are provided', async () => {
    const revealed = '{"access_token":"raw_secret_value"}';
    const redacted = '{"access_token":"•••••••••••"}';

    const wrapper = mount(JsonViewer, {
      props: {
        content: revealed, // what is shown on screen (may be revealed)
        copyContent: redacted, // what must land on the clipboard
        label: 'Response Body',
      },
    });

    // Display path still shows the revealed value.
    expect(wrapper.text()).toContain('raw_secret_value');

    await clickCopy(wrapper);

    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0][0] as string;
    expect(copied).toBe(redacted);
    expect(copied).not.toContain('raw_secret_value');
  });

  it('falls back to `content` when `copyContent` is not provided (non-sensitive views)', async () => {
    const plain = '{"hello":"world"}';
    const wrapper = mount(JsonViewer, {
      props: { content: plain },
    });

    await clickCopy(wrapper);

    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText.mock.calls[0][0]).toBe(plain);
  });

  it('does nothing when there is neither content nor copyContent', async () => {
    const wrapper = mount(JsonViewer, { props: {} });
    await clickCopy(wrapper);
    expect(writeText).not.toHaveBeenCalled();
  });
});

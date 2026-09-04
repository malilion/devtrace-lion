import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  manifest: {
    name: 'DevTrace Lion - DevTools API Debugger',
    description: 'API debugging inside DevTools. Zero permissions. Local-first. Secrets redacted by default.',
    version: '1.0.0',
    devtools_page: 'devtools.html',
    // Zero permissions required!
    permissions: [],
    icons: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
  },
  vite: () => ({
    resolve: {
      alias: {
        '@': new URL('./', import.meta.url).pathname,
      },
    },
  }),
});

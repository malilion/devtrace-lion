import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { useNetworkStore } from '@/stores/network';
import { useSettingsStore } from '@/stores/settings';
import { createDevToolsCollector } from '@/lib/network/collector';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.mount('#app');

const networkStore = useNetworkStore(pinia);
const settingsStore = useSettingsStore(pinia);

// Detect execution environment: DevTools Panel vs Standalone (?mock=1)
const isDevTools = typeof chrome !== 'undefined' && !!chrome.devtools?.network;
const urlParams = new URLSearchParams(window.location.search);
const isMockRequested = urlParams.get('mock') === '1';

if (isDevTools && !isMockRequested) {
  // Live DevTools mode
  const collector = createDevToolsCollector({
    getCustomKeys: () => settingsStore.settings.customRedactedKeys,
    maxResponseSize: settingsStore.settings.maxResponseSize,
  });

  collector.onRequest((result) => {
    networkStore.addRecord(result);
  });

  collector.onNavigate(() => {
    if (!settingsStore.settings.preserveLog) {
      networkStore.clearRecords();
    }
  });

  collector.start();
} else {
  // Standalone Mock Mode for development and Playwright E2E UI testing
  networkStore.loadMockData();
}

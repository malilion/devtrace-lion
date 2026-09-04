import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DEFAULT_SETTINGS, type UserSettings } from '@/types/settings';

const STORAGE_KEY = 'devtrace_user_settings';

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<UserSettings>({ ...DEFAULT_SETTINGS });
  const isLoaded = ref(false);

  async function loadSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
        const result = await chrome.storage.sync.get(STORAGE_KEY);
        if (result[STORAGE_KEY]) {
          settings.value = { ...DEFAULT_SETTINGS, ...result[STORAGE_KEY] };
          isLoaded.value = true;
          return;
        }
      }
    } catch {
      // Fall through to localStorage
    }

    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        settings.value = { ...DEFAULT_SETTINGS, ...JSON.parse(local) };
      }
    } catch {
      // Ignore
    }

    isLoaded.value = true;
  }

  async function saveSettings() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
        await chrome.storage.sync.set({ [STORAGE_KEY]: settings.value });
      }
    } catch {
      // Ignore
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings.value));
    } catch {
      // Ignore
    }
  }

  function updateSettings(patch: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...patch };
    saveSettings();
  }

  function addCustomKey(key: string) {
    const trimmed = key.trim().toLowerCase();
    if (trimmed && !settings.value.customRedactedKeys.includes(trimmed)) {
      settings.value.customRedactedKeys.push(trimmed);
      saveSettings();
    }
  }

  function removeCustomKey(key: string) {
    const trimmed = key.trim().toLowerCase();
    settings.value.customRedactedKeys = settings.value.customRedactedKeys.filter(
      (k) => k.toLowerCase() !== trimmed
    );
    saveSettings();
  }

  return {
    settings,
    isLoaded,
    loadSettings,
    updateSettings,
    addCustomKey,
    removeCustomKey,
  };
});

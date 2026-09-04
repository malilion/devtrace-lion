import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FilterState, NetworkRecord } from '@/types/network';
import type { RedactResult, RawUnredactedData } from '@/lib/security/redact-secrets';
import { normalizeRequest } from '@/lib/network/normalize-request';
import { redactSecrets } from '@/lib/security/redact-secrets';

// Import sample fixtures for mock mode
import get200Fixture from '../tests/fixtures/har/get-200.json';
import post201Fixture from '../tests/fixtures/har/post-json-201.json';
import postFormDataFixture from '../tests/fixtures/har/post-formdata.json';
import get401Fixture from '../tests/fixtures/har/get-401-with-bearer.json';
import get429Fixture from '../tests/fixtures/har/get-429-retry-after.json';
import postBinaryFixture from '../tests/fixtures/har/post-binary-no-body.json';
import responseBase64Fixture from '../tests/fixtures/har/response-base64.json';
import type { HarEntry } from '@/types/network';

export const useNetworkStore = defineStore('network', () => {
  // Safe, sanitized records that can be searched, filtered, diffed, exported, and copied
  const records = ref<NetworkRecord[]>([]);

  // Isolated raw secrets stored in memory, keyed by record ID.
  // NEVER accessed during copy, export, or codegen.
  const rawStore = new Map<string, RawUnredactedData>();

  // Currently selected record for detail panel
  const selectedId = ref<string | null>(null);

  // Secondary selection for JSON response comparison
  const diffCompareId = ref<string | null>(null);

  // Set of record IDs where "Reveal locally" is currently toggled on
  const locallyRevealedIds = ref<Set<string>>(new Set());

  // Filter and search state
  const filter = ref<FilterState>({
    searchQuery: '',
    method: 'ALL',
    statusClass: 'ALL',
    resourceType: 'ALL',
  });

  const selectedRecord = computed(() => {
    if (!selectedId.value) return null;
    return records.value.find((r) => r.id === selectedId.value) ?? null;
  });

  const diffCompareRecord = computed(() => {
    if (!diffCompareId.value) return null;
    return records.value.find((r) => r.id === diffCompareId.value) ?? null;
  });

  // Filtered list of records
  const filteredRecords = computed(() => {
    const q = filter.value.searchQuery.trim().toLowerCase();
    const methodFilter = filter.value.method;
    const statusFilter = filter.value.statusClass;
    const resTypeFilter = filter.value.resourceType;

    return records.value.filter((rec) => {
      // Resource Type filter (ALL vs FETCH_XHR)
      if (resTypeFilter === 'FETCH_XHR' && !rec.isXhrOrFetch) {
        return false;
      }

      // Method filter
      if (methodFilter !== 'ALL' && rec.method.toUpperCase() !== methodFilter) {
        return false;
      }

      // Status class filter
      if (statusFilter !== 'ALL') {
        const status = rec.status ?? 0;
        if (statusFilter === '2xx' && (status < 200 || status >= 300)) return false;
        if (statusFilter === '3xx' && (status < 300 || status >= 400)) return false;
        if (statusFilter === '4xx' && (status < 400 || status >= 500)) return false;
        if (statusFilter === '5xx' && status < 500) return false;
        if (statusFilter === 'ERR' && status !== 0) return false;
      }

      // Search Query filter
      if (q) {
        const matchesUrl = rec.url.toLowerCase().includes(q);
        const matchesMethod = rec.method.toLowerCase().includes(q);
        const matchesPath = rec.path.toLowerCase().includes(q);
        const matchesReqBody = rec.requestBody?.text?.toLowerCase().includes(q) ?? false;
        const matchesResBody = rec.responseBody?.text?.toLowerCase().includes(q) ?? false;
        if (!matchesUrl && !matchesMethod && !matchesPath && !matchesReqBody && !matchesResBody) {
          return false;
        }
      }

      return true;
    });
  });

  function addRecord(result: RedactResult) {
    records.value.unshift(result.record);
    if (result.rawUnredacted) {
      rawStore.set(result.record.id, result.rawUnredacted);
    }
  }

  function selectRecord(id: string | null) {
    selectedId.value = id;
  }

  function setDiffCompare(id: string | null) {
    diffCompareId.value = id;
  }

  function toggleLocalReveal(id: string) {
    const next = new Set(locallyRevealedIds.value);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    locallyRevealedIds.value = next;
  }

  function isLocallyRevealed(id: string): boolean {
    return locallyRevealedIds.value.has(id);
  }

  function getRawUnredacted(id: string) {
    return rawStore.get(id);
  }

  function clearRecords() {
    records.value = [];
    rawStore.clear();
    selectedId.value = null;
    diffCompareId.value = null;
    locallyRevealedIds.value = new Set();
  }

  function setFilter(patch: Partial<FilterState>) {
    filter.value = {
      ...filter.value,
      ...patch,
    };
  }

  function loadMockData() {
    clearRecords();
    const fixtures: HarEntry[] = [
      get200Fixture as unknown as HarEntry,
      post201Fixture as unknown as HarEntry,
      postFormDataFixture as unknown as HarEntry,
      get401Fixture as unknown as HarEntry,
      get429Fixture as unknown as HarEntry,
      postBinaryFixture as unknown as HarEntry,
      responseBase64Fixture as unknown as HarEntry,
    ];

    for (const fixture of fixtures) {
      const normalized = normalizeRequest(fixture);
      const redactResult = redactSecrets(normalized);
      addRecord(redactResult);
    }

    if (records.value.length > 0) {
      selectedId.value = records.value[0].id;
    }
  }

  return {
    records,
    filteredRecords,
    selectedId,
    selectedRecord,
    diffCompareId,
    diffCompareRecord,
    filter,
    locallyRevealedIds,
    addRecord,
    selectRecord,
    setDiffCompare,
    toggleLocalReveal,
    isLocallyRevealed,
    getRawUnredacted,
    clearRecords,
    setFilter,
    loadMockData,
  };
});

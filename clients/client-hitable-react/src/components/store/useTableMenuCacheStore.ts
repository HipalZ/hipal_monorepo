import type { CategoryType } from "@hi/db-models/src/validators";
import { get, set, del } from "idb-keyval";
import { create } from "zustand";

const CACHE_KEY_PREFIX = "tableMenu:v1:";
/** 1 hour in ms */
export const TABLE_MENU_CACHE_TTL_MS = 60 * 60 * 1000;

export interface TableMenuCacheEntry {
  data: CategoryType[];
  fetchedAt: number;
}

function cacheKey(businessId: string, tableId: string): string {
  return `${CACHE_KEY_PREFIX}${businessId}:${tableId}`;
}

export function isTableMenuCacheStale(fetchedAt: number, ttlMs: number = TABLE_MENU_CACHE_TTL_MS): boolean {
  return Date.now() - fetchedAt > ttlMs;
}

interface TableMenuCacheState {
  /** In-memory cache: key = cacheKey(businessId, tableId) */
  cache: Record<string, TableMenuCacheEntry>;
  getCached: (businessId: string, tableId: string) => TableMenuCacheEntry | undefined;
  /** Returns cached data if present and not stale. Writes to memory; does not read IDB. */
  getValidCached: (businessId: string, tableId: string) => TableMenuCacheEntry | undefined;
  setCached: (businessId: string, tableId: string, data: CategoryType[]) => Promise<void>;
  invalidate: (businessId: string, tableId: string) => Promise<void>;
  /** Load from IndexedDB into memory and return entry (or undefined). */
  hydrateFromIdb: (businessId: string, tableId: string) => Promise<TableMenuCacheEntry | undefined>;
}

export const useTableMenuCacheStore = create<TableMenuCacheState>((setState, getState) => ({
  cache: {},

  getCached: (businessId, tableId) => {
    const key = cacheKey(businessId, tableId);
    return getState().cache[key];
  },

  getValidCached: (businessId, tableId) => {
    const entry = getState().getCached(businessId, tableId);
    if (!entry || isTableMenuCacheStale(entry.fetchedAt)) return undefined;
    return entry;
  },

  setCached: async (businessId, tableId, data) => {
    const key = cacheKey(businessId, tableId);
    const entry: TableMenuCacheEntry = { data, fetchedAt: Date.now() };
    setState((s) => ({ cache: { ...s.cache, [key]: entry } }));
    await set(key, entry);
  },

  invalidate: async (businessId, tableId) => {
    const key = cacheKey(businessId, tableId);
    setState((s) => {
      const next = { ...s.cache };
      delete next[key];
      return { cache: next };
    });
    await del(key);
  },

  hydrateFromIdb: async (businessId, tableId) => {
    const key = cacheKey(businessId, tableId);
    const existing = getState().cache[key];
    if (existing) return existing;
    try {
      const entry = await get<TableMenuCacheEntry>(key);
      if (entry) {
        setState((s) => ({ cache: { ...s.cache, [key]: entry } }));
        return entry;
      }
    } catch {
      // IDB not available or read error
    }
    return undefined;
  },
}));

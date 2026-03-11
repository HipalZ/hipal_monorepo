# Table Menu / Categories Caching Strategy

## Problem

The table POS fetches the full menu (categories + populated dishes) on every visit to a table via `GET /table/menu?tableId=&businessId=`. The payload is large (nested categories, dishIds, addOnIds, etc.), which:

- Increases latency on every table open
- Uses more bandwidth, especially on mobile
- Hits the server and DB on every navigation between tables or refresh

**Goal:** Reduce API calls and improve perceived performance by caching menu data per table, with optional persistence across sessions.

---

## When Do Price / Menu Updates Show Up?

This section explains **what counts as “updated data”** and **exactly when** the table POS will show it (or keep showing old data) when using a cache.

### What counts as “menu data” (and can become stale)

Anything returned by `GET /table/menu` is cached. So when any of the following changes in the backend/admin, the cache can be **stale** until invalidated:

| What changed | Where it’s updated | Cached in table menu? |
|--------------|--------------------|------------------------|
| Dish **price** | Admin / POS config | Yes (inside `dishIds`) |
| Dish **name** | Admin | Yes |
| Dish **availability** (on/off) | Admin / POS | Yes |
| Dish **description**, **images** | Admin | Yes |
| **Add-ons** for a dish | Admin | Yes (`addOnIds` populated) |
| **New dish** added to category | Admin | Yes (new item in category) |
| **Dish removed** / deleted | Admin | Yes (missing from list) |
| **Category** name / order / rank | Admin | Yes |
| **Zone → menu** mapping | Admin (which menu is active for zone) | Yes (different menu = different categories) |

So: **any change to menu, dishes, or prices that the server would return from `/table/menu` is “updated data”.** Until the cache is invalidated or refetched, the table POS may show **old** data.

### When the table POS will show UPDATED data

The table POS will show the latest data from the server **only** when it actually calls the API and uses the response. That happens in these cases:

1. **No cache for this table yet**  
   First time opening that table (or cache was cleared). Result: **fresh data** from API.

2. **Cache expired (TTL)**  
   Each cached entry has a `fetchedAt` time. If you use a TTL (e.g. 1 hour):
   - When staff opens the table **after** TTL has passed since `fetchedAt`, the cache is treated as stale.
   - App fetches from API again and replaces the cache.
   - Result: **updated data** (e.g. new price) is shown.

3. **User taps “Refresh Categories”**  
   This action should **invalidate** the cache for the current table and **refetch** from the API.  
   Result: **updated data** is shown immediately after the request completes.

4. **Stale-while-revalidate (if implemented)**  
   Even when cache is “valid” (within TTL), you can still refetch in the background. When the API returns:
   - Replace cache with the new response.
   - Update UI with the new data.  
   Result: **updated data** appears after the background refetch finishes (might be a few seconds later).

5. **App / cache cleared**  
   User clears site data, or you clear IndexedDB / in-memory cache. Next open triggers a full fetch.  
   Result: **updated data**.

### When the table POS will NOT show updated data (until one of the above happens)

- **Within TTL and no refresh:**  
  Example: Admin changes a dish price at **10:00**. Staff had opened that table at **09:30** and cache TTL is **1 hour**. Until **10:30** (or until they tap “Refresh Categories”), the table POS **keeps showing the old price**.

- **No “Refresh Categories” and no background refetch:**  
  If the user never refreshes and TTL is long (e.g. 24h), they can see stale data for a long time.

- **Offline:**  
  If the device is offline, only cached data is available. Any updates made on the server after the last successful fetch will **not** appear until the device is online and a refetch happens (e.g. after TTL or after “Refresh Categories”).

### Example timeline (dish price update)

Assume **TTL = 1 hour**, and **no** “Refresh Categories” tap.

| Time | Event | What table POS shows |
|------|--------|----------------------|
| 09:00 | Staff opens Table 5 → API called → menu cached (e.g. Pizza = ₹200) | Pizza ₹200 |
| 09:30 | Staff leaves table (cache still valid) | — |
| 09:45 | **Admin changes Pizza price to ₹250** (backend updated) | — |
| 10:00 | Staff opens Table 5 again | **Still Pizza ₹200** (cache used; not expired) |
| 10:01 | Staff taps “Refresh Categories” | **Pizza ₹250** (after API returns) |
| **OR** 10:01 | Staff does **not** tap Refresh | **Still Pizza ₹200** |
| 10:01 | TTL expires at 10:00 (1h from 09:00). Next time they open Table 5 or refetch | **Pizza ₹250** (new API call) |

So: **you see updated data only when** (a) cache is missing/expired and a fetch runs, or (b) user refreshes, or (c) a background revalidate runs and updates the cache.

### Summary: when will I get updated data?

| Situation | Will you get updated data? |
|-----------|-----------------------------|
| First time opening table (no cache) | Yes |
| After TTL has passed since last fetch | Yes (on next open or refetch) |
| User taps “Refresh Categories” | Yes (after API response) |
| Background revalidate (if implemented) | Yes (after background fetch completes) |
| Still within TTL and no refresh / no revalidate | No (old cached data) |
| Offline | No (only cache; updates when back online + refetch) |

So: **dish price updates (and any other menu changes) are visible only when the app actually refetches from the server**—either because cache expired (TTL), user refreshed, or a background revalidate ran. The doc below describes how to implement TTL, “Refresh Categories”, and optional revalidate so you control exactly when that happens.

---

## Approach 1: Zustand + IndexedDB (idb-keyval) — *Recommended*

**Idea:** A Zustand store that mirrors “menu per table” and persists to IndexedDB via `idb-keyval`. Read from cache first; revalidate in the background or when cache is stale.

### Pros
- Full control over cache key (e.g. `tableMenu:${businessId}:${tableId}`) and TTL
- Persists across tab close / refresh / device reboot (within same browser)
- Works offline once cached
- Fits well with existing Zustand usage in the app
- Small dependency: `idb-keyval` is tiny and simple

### Cons
- Need to handle cache invalidation (e.g. when menu is updated in admin)
- Slightly more code than “React Query only”

### Design

```
┌─────────────────────────────────────────────────────────────────┐
│  useTableMenuStore (Zustand)                                     │
│  - cache: Record<string, { data: CategoryType[]; fetchedAt: number }>  │
│  - getMenu(tableId, businessId) → from memory or null             │
│  - setMenu(tableId, businessId, data) → memory + persist to IDB   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  IndexedDB (idb-keyval)                                          │
│  Key: "tableMenu:v1:{businessId}:{tableId}"                      │
│  Value: { data: CategoryType[], fetchedAt: number }             │
└─────────────────────────────────────────────────────────────────┘
```

**Flow:**
1. On table open, `useCategories` (or a dedicated `useTableMenu`) checks the store for `businessId + tableId`.
2. If cached and not stale (e.g. &lt; 24h or &lt; 1h), use it immediately and optionally refetch in background (stale-while-revalidate).
3. If not cached or stale, fetch from API, then update store + persist to IDB.
4. Optional: “Refresh Categories” button forces refetch and overwrites cache.

**Cache key format:** `tableMenu:v1:${businessId}:${tableId}` (version prefix allows future schema changes).

**TTL:** Configurable (e.g. 1 hour for “menu changes rarely”, or 24 hours for maximum offline use).

**Implementation sketch:**
- New store: `useTableMenuCacheStore` with `getCached(businessId, tableId)`, `setCached(businessId, tableId, data)`, and persistence middleware that uses `idb-keyval` to read/write by key.
- `useCategories` (or `useTableMenu`): (1) read from store, (2) if valid cache → set categories in order store and return; (3) else (or in parallel) fetch API → update cache store + order store.

---

## Approach 2: TanStack Query + Persist to IndexedDB

**Idea:** Keep using React Query for fetching and caching, and add **persist** so the query cache is stored in IndexedDB. Cache key is already `["tableMenu", businessId, tableId]`.

### Pros
- Minimal change to current `useCategories` (already using React Query)
- Built-in stale-while-revalidate and deduplication
- `@tanstack/query-persist-client-core` + `idb` (or similar) can persist the whole query cache or selected keys

### Cons
- Persisting the entire React Query cache can be heavy; better to whitelist only `tableMenu` queries
- Less explicit control over “per table” TTL vs. global query client config

### Design

- Add `createSyncStoragePersister` (or async) with IndexedDB and pass it to `PersistQueryClientProvider` with a `persister` and `maxAge` / `dehydrateOptions` so only `queryKey` matching `["tableMenu", ...]` is persisted.
- Keep `useCategories` as is; persistence is transparent. Optionally increase `staleTime` so refetch is less frequent.

---

## Approach 3: In-Memory Only (Zustand or React Query)

**Idea:** Cache in memory only (Zustand slice or React Query cache) with a TTL. No IndexedDB.

### Pros
- Easiest to implement
- No persistence layer; no IDB quota or serialization concerns
- Still avoids refetch on every mount when switching tables in the same session

### Cons
- Cache is lost on refresh or new tab
- No offline menu after first load

### Design

- **With React Query:** Increase `staleTime` (e.g. 5–15 minutes) and `gcTime` (formerly `cacheTime`) so the same table’s menu is reused during the session.
- **With Zustand:** A simple store `Record<string, { data, fetchedAt }>` and in `useCategories` return cached data if present and not expired, else fetch and set.

---

## Approach 4: Hybrid (Zustand + IDB + React Query)

**Idea:** Use React Query for request logic and SWR, and use Zustand + IDB as a **persistent second-level cache**.

- **L1 (memory):** React Query cache (or Zustand in-memory).
- **L2 (disk):** IndexedDB via Zustand persist middleware keyed by `tableMenu:v1:${businessId}:${tableId}`.

On load: try L1 → then L2 → then API. On API success: write L1 + L2. Optional TTL for L2 so old tables don’t stay forever.

---

## Recommendation

**For “menu is bulky and we want fewer API calls + optional offline”:**  
**Approach 1 (Zustand + idb-keyval)** is a good fit:

1. Cache is **explicitly per table** and **per business**.
2. You can set a **TTL** and a **version** in the key without touching React Query’s global config.
3. **Refresh Categories** can clear only that table’s cache and refetch.
4. Fits the existing pattern of “Zustand for global UI/order state” and keeps “menu cache” as a separate concern.
5. Adding `idb-keyval` is a small dependency; Zustand is already there.

**Optional enhancement:** Keep using React Query inside `useCategories` for the actual fetch and loading/error state, but **hydrate from the Zustand+IDB cache when the query is enabled** (e.g. set initial data from cache so UI renders immediately, then refetch in background). That way you get:
- Instant UI from IDB when available
- Single source of truth for “what the user sees” (order store still gets categories from the same place)
- One place to implement TTL and invalidation (the table menu cache store)

---

## Invalidation (How to Get Updated Data Into the Cache)

Invalidation = “treat cache as stale so we fetch again.” When you invalidate (or refetch), the table POS will get **updated data** (new prices, new dishes, etc.) from the server.

**Ways to invalidate or refetch:**

| Method | When updated data is seen | Use case |
|--------|---------------------------|----------|
| **TTL (time-based)** | After cache age &gt; TTL, next open or refetch returns fresh data | Automatic; no user action. Shorter TTL = fresher data, more API calls. |
| **“Refresh Categories” button** | As soon as the new API response is applied | User wants latest menu/price right now. |
| **Stale-while-revalidate** | Shortly after opening (background fetch); UI updates when response arrives | Good UX: show cache first, then update when server responds. |
| **API version / lastUpdated** (optional) | If the API returns e.g. `menuUpdatedAt` or `version`, compare with cached value; if different, refetch | Only refetch when backend actually changed menu. |
| **Clear cache on logout / business switch** | Next open has no cache, so full fetch | Avoid showing another business’s or old session’s menu. |

**Recommendation:**

- Always implement **TTL** (e.g. 1 hour) so that price/menu updates show up within a predictable time even if the user never taps Refresh.
- Always implement **“Refresh Categories”** so staff can get updated data immediately (e.g. after admin changes a price).
- Optional: add **stale-while-revalidate** (show cache, refetch in background, then update UI) so users often see updates without waiting for a full load.
- Optional (backend change): have `GET /table/menu` return a **version** or **menuUpdatedAt**; store it with the cache and refetch only when it changes, so you can use a longer TTL without showing stale data for long.

---

## Dependencies

For **Approach 1**:

```bash
pnpm add idb-keyval
# (optional) types if not included
pnpm add -D @types/idb-keyval
```

`idb-keyval` is key-value only; keys and values are serialized by the structured clone algorithm (so plain objects and arrays like `CategoryType[]` are fine).

---

## Summary

| Approach              | Persistence | Complexity | Best for                          |
|-----------------------|------------|------------|-----------------------------------|
| 1. Zustand + IDB      | Yes        | Medium     | Per-table cache, offline, control |
| 2. React Query + IDB  | Yes        | Low–Medium | Minimal code change, persist cache|
| 3. In-memory only     | No         | Low        | Same-session only                  |
| 4. Hybrid             | Yes        | Higher     | Max flexibility                   |

Recommended: **Approach 1 (Zustand + idb-keyval)** with optional use of React Query for the fetch and loading state, and hydration from the persistent cache on mount.

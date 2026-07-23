# Guest Experience / Hotel Service Reporting — Working Context

Handoff notes for continuing this work on another machine.
Covers: environment, domain rules, everything built, file map, verification status, and open decisions.

---

## 1. Environment — read this first

### ⚠️ There are TWO checkouts of `hipal_monorepo`
| Path | Use |
|---|---|
| `/home/hipal/hipal_monorepo` | **OLD / stale.** Edits here do NOT affect the running app. |
| `/home/hipal/repo/hipal_monorepo` | ✅ **The live checkout.** All dev servers run from here. Edit here. |

Verify before editing: `ls -l /proc/<pid>/cwd` for the running dev-server processes.

### Running processes (branch `test`)
| App | Command | Port | Notes |
|---|---|---|---|
| `clients/client-hipal-app` (guest-facing, Next.js) | `bun run dev` | **3000** | uses `.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:4500` |
| `clients/client-hibiz-react` (owner dashboard, Vite) | `bun run dev` | **3001** | |
| `servers/server` (Hono + Bun) | `bun run dev:test` (`--hot`) | **4500** | env test → MongoDB `hipalz-test` |

`bun run --hot` **does** hot-reload Hono route changes — a `populate(...)` edit goes live without restart. Browser hard-refresh is usually all that's needed (React Query caches ~60s).

### Test data
- Business (has all the service data): `66a41b98f3d1d34df72a4bb0` — slug `sankla`, name "Stae".
- Guest URL: `http://localhost:3000/sankla/hotel/checkin?room=32`
- Report URL: `http://localhost:3001/app/hotel/66a41b98f3d1d34df72a4bb0/guest-service-journey`
- Note: `/businesses/n/sankla` resolves to a *different* business id (`66a4a8ce…`) which has **no** services — don't be confused by it.

---

## 2. Domain rules — SLA time fields

Defined on `HotelService` (`packages/db-models/src/models/hotel/service.ts`), minutes:

| Field | Default | Meaning (from the escalation scheduler in `routes/hotel/alert.ts` ~L520) |
|---|---|---|
| `avgAcceptanceTime` | 2 | Staff should **accept** by this time. |
| `avgDeliveryTime` | 7 | **"Should be delivered by"** threshold. Scheduled as an *absolute offset from request time*, so it already includes acceptance. **This is the guest-facing ETA.** |
| `avgCompletionTime` | 10 | Outer **escalation** deadline (not the delivery estimate). |

**Decisions made:**
- The guest-side ETA badge uses **`avgDeliveryTime`** (not completion, and not accept+deliver summed — that would double-count).
- The **owner report** treats accept and deliver as **additive legs**: `totalSla = avgAcceptanceTime + avgDeliveryTime`, compared against `totalActual = createdAt → deliveredAt`. Verdict = `totalSla − totalActual` (positive = early/green, negative = late/red).
  - ⚠️ Known tension: `avgDeliveryTime` is absolute-from-request in the scheduler, but the report treats it as a delivery *leg*. Revisit if the numbers ever look off.

---

## 3. What was built

### A. Guest app — service ETA badge (`client-hipal-app`)
- **New:** `src/components/hotels/room/ServiceEtaBadge.tsx`
  - A **static estimate**, deliberately *not* a ticking countdown (nothing is ordered yet on a menu).
  - Renders `4 min` — no clock icon, no `~` prefix (removed per feedback).
  - Speed colours: **green ≤5m**, **amber ≤15m**, **blue >15m**.
  - Hides itself when `avgDeliveryTime` is missing/0. `aria-label` for screen readers.
- Wired into `ServiceCategoryCard.tsx` grid `ServiceItem`, absolutely positioned on the **avatar's top-right corner**.
- `src/components/hooks/useServicesHotel.ts`: `IService` += `avgDeliveryTime?: number`.

### B. Guest app — service grid polish (`ServiceCategoryCard.tsx`)
- **Fixed layout shift (CLS):** the "N services selected" box used to appear on first selection and push the grid down. It's now an **always-present pill in the header row** (title left, count pill right) — selecting only changes its text/colour.
- **Selection state:** removed the ring/round border and the whitish tint — selection is now **just the tick mark** (small, white-ringed, top-left).
- Removed the default shadcn `Card` chrome: `border-none bg-transparent shadow-none`.

### C. Guest chat copy (`servers/server/src/routes/hotel/alert.ts`)
Shortened but kept hospitality warmth:
- Accepted: `Thank you! We're preparing your request — it'll be ready by {time}. 🙏`
- Delivered fast: `Delighted to serve you — delivered in just {n} min, ahead of schedule! 🎉 We hope everything's just right for you.`
- Delivered normal: `Delivered with care in {n} min — thank you for your patience. 😊 …`
- (Old messages already stored in the DB keep their original text.)

### D. Shared `DateRangePicker` (`client-hibiz-react/src/components/molecules/dateRangePicker/index.tsx`)
Visual only — **no logic touched**:
- Preset chips (Today/Yesterday/Last 7 Days/This Month/Custom) → rounded pills using the component's own `#8C63FF` accent (was black).
- "Selected: …" → a compact rounded badge with a dot.
- Custom modal: scoped **`.gx-dtp`** stylesheet recolours react-datepicker to `#8C63FF` (selected day/time, header, hover) — **scoped so no other date picker in the app is affected**.
- Tightened top spacing + capped the calendar area so the **Apply button no longer overlaps** the calendars.
- **`fixedHeight`** on both `<DatePicker>`s so months always render 6 rows (July vs August were different heights).
- Apply button uses BottomButton's `colorGrad` prop (brand gradient instead of black).

### E. Owner report — Guest Experience Report (the big one)
Route: `client-hibiz-react/src/pages/app/hotel/[hotelId]/guest-service-journey/`

Rewritten from a single ~760-line file into **8 modules** (see file map below), then reorganised into **tabs** after feedback that it felt overwhelming.

**Layout (tabbed):** persistent header (brand + live dot + date range + Download + note) → tab bar → one compartment at a time:

| Tab | Contents |
|---|---|
| **Overview** | KPI hero row (On-time rate, avg accept, avg deliver, requests, escalations) + On-time donut + **"Where to look" launchpad** — 3 clickable headline cards (Top performer → Staff, Keep an eye on → Services, Standout guest → Guests) |
| **Staff** | On-time bars (green met / red missed) + Fastest-crew leaderboard. Clicking a staff bar filters and **jumps to Requests**. |
| **Services** | "Where time is lost, by service" bars vs SLA + slowest-requests drill-down |
| **Requests** | The request log — sortable columns, search, staff filter chips, pagination + **"All"** rows option |
| **Guests** | Per-guest: visits, requests, avg rating, companions |

**Request log columns:** Guest (name, phone, visit badge) · Room · Service · Accepted by · Time to accept (+SLA target, +timestamp) · Accept vs SLA · Delivered by · Time to deliver (+SLA, +timestamp) · Deliver vs SLA · Overall verdict · Escalation · Rating (feedback on hover).

**Sorting:** every header shows a state indicator — faint `⇅` when sortable, solid `↑`/`↓` on the active column. Natural/numeric sort (so room 40 < 302).

**Design system:** Fraunces (display/numbers) + Inter (body), and a `report-*` Tailwind colour palette (see §5).

**Removed by decision:**
- **VIP / Repeat / New tiers** — the thresholds were arbitrary/hard-coded. Now shows **raw visit counts** (`20 visits · ★4.6`).
- **Companions column** in Requests (it lives in the Guests tab).
- **Expandable row detail** (the info is covered across Requests + Guests tabs).

---

## 4. File map (report module)

```
clients/client-hibiz-react/src/pages/app/hotel/[hotelId]/guest-service-journey/
├── model.ts       # Types: AlertItem, ServicePerf, RequestRow, Companion,
│                  #        GuestImportance, RequestSortKey
├── format.ts      # formatDateTime (IST), formatMins, formatDuration, round1
├── analytics.ts   # PURE logic — computePerf, buildRequestRows, review matching,
│                  #   buildCompanionsByPhone, buildImportanceByPhone,
│                  #   aggregateStaff/Services/Guests, computeDonut, summarize,
│                  #   matchesSearch, sortValue
├── download.ts    # CSV download + isWithinMonthLimit (MAX_REPORT_MONTHS = 3)
├── styles.ts      # Class-name tokens (card, pill, chip, bar, th, td) + cx()
├── hooks.ts       # useReportData (fetch + aggregates), useRequestLog (filter→
│                  #   search→sort→paginate), PAGE_SIZES, SHOW_ALL
├── ui.tsx         # Presentational: KpiCard, DurationKpi, Donut, StaffBar,
│                  #   ServiceBar, LeaderRow, MiniStat, SlaDeltaPill, VerdictPill,
│                  #   EscalationCell, RatingCell, ImportanceBadge, SortableHeader,
│                  #   FilterChip, NoteBanner, LiveBadge
└── index.tsx      # The page — tabs + composition only
```
Principle: no React in the pure files; `index.tsx` only composes.

---

## 5. Global config added

**`clients/client-hibiz-react/tailwind.config.js`** — merged into the existing `extend.colors`:
```js
report: {
  ink:'#241d24', muted:'#7c7280', faint:'#a99fae',
  line:'#ece6ee', 'line-strong':'#ded5e2', bg:'#f3f0f5', soft:'#faf7fc',
  accent:'#9c2f61', 'accent-soft':'#bd6791', 'accent-bg':'#f9e9f1', 'accent-line':'#ecc3d8',
  good:'#3d7a17', 'good-bg':'#eaf4dc', 'good-line':'#cfe3b5',
  bad:'#b23a2e',  'bad-bg':'#f8e6e2',  'bad-line':'#eecbc4',
  warn:'#9a6207', 'warn-bg':'#f8ecd6', 'warn-line':'#efd8a6',
}
```
plus `fontFamily: { fraunces: [...], inter: [...] }`.

**`clients/client-hibiz-react/index.html`** — added the Fraunces Google-Fonts `<link>` (Inter was already there).

> ⚠️ There is a **global `.card { width:60% }`** rule in `src/index.css:590`. This is why an earlier attempt using a plain CSS file with generic class names (`.card`, `.sec`, `.bar`) broke the page. **Use Tailwind utilities / the `report-*` tokens — never generic global class names.** A now-deleted `report.css` was the cause of that bug.

---

## 6. Backend changes

| File | Change | Why |
|---|---|---|
| `routes/hotel/service.ts` | `fetch_service_category` populate `+ avgDeliveryTime` | Guest ETA badge |
| `routes/hotel/alert.ts` | `fetch_alert_history` populate `+ avgAcceptanceTime avgDeliveryTime` | Report SLA maths |
| `routes/hotel/alert.ts` | `staff_services` populate `+ createdBy(name,phone)`, `+ avgCompletionTime` | Customer name in staff view |
| `routes/hotel/alert.ts` | Shortened guest chat copy | Hospitality/brevity |
| `routes/hotel/rooms.ts` | `user_source_analytics`: populate `guestUserIds(name,phone)` on the **returned** query (`filterAnalytics` → `uniqueByUser`, *not* the second one) | Companions with real names |
| `routes/hotel/rooms.ts` | `user_source_analytics`: added lifetime **`visitCountByPhone`** aggregation to the response | Guest visit counts |
| `routes/hotel/report.ts` | `guest_experience_csv`: populate SLA fields + **5 new columns** + `slaAnalysis()` helper; stay rows padded to keep columns aligned | CSV ⇄ UI parity |

**New CSV columns** (after `Total Resolution Time`):
`Standard Acceptance Time (min)`, `Standard Delivery Time (min)`, `Total Standard SLA (min)`, `Total Actual Time (min)`, `SLA Performance`
— verdict text matches the spec: `Completed X min before SLA` / `Exceeded SLA by X min`.

**Client type:** `hooks/hotel/useUserData.ts` → `UserAnalyticsData` += `visitCountByPhone?: Record<string, number>`.

---

## 7. Verification status (as of handoff)

| Check | Result |
|---|---|
| `vite build` (client-hibiz-react) | ✅ **Passes** (~23s, exit 0) |
| `tsc --noEmit` on report module | ✅ Clean |
| `next build` (client-hipal-app) | ✅ Passes — `next.config` has `typescript.ignoreBuildErrors: true` |
| `tsc` client-hipal-app | ⚠️ **4 pre-existing errors** — apiRpc `never` typing in `useServicesHotel.ts:36`, `ServiceCategoryCard.tsx:194/200/272`. All in code **not** touched by this work (verified against `git show HEAD~6`). |
| Server endpoints | ✅ Verified live: `avgDeliveryTime` served, companions populated with names, `visitCountByPhone` returns counts, CSV emits SLA columns + verdict |

> The wider `client-hibiz-react` repo has many pre-existing `tsc` errors unrelated to this work; the Vite build does not typecheck, so it builds fine.

---

## 8. Open decisions / next steps

1. **Visit-count badge in Requests rows** — currently kept. Rationale: a breach for a 20-visit guest is more urgent than for a first-timer, so it aids prioritisation. Remove it if strict Requests(ops) / Guests(identity) separation is preferred (one-line change in `index.tsx`).
2. **On-time trend sparkline** on Overview — designed but not built. Would slot above the launchpad cards; shows on-time % over the range.
3. **CSV parity for newer UI fields** — the export has the SLA columns + verdict, but not the visit-count/companions enrichment. Add if wanted.
4. **`roomStatus === "OCCUPIED"` coupling** — see §9.
5. Layout preview artifact (Tabbed vs Sections comparison) was used to choose the tabbed design; **Tabbed** was selected.

---

## 9. Review of commit `cb3190b87` — "check userId in the room during request raise"

**Verdict: correct, and it does not break existing logic.**

Adds `requireRoomOccupancy` / `requireRoomOccupancyByChatReply` middleware (`servers/server/src/utils/requireRoomOccupancy.ts`) to:
`create_alert`, `check_out_request`, `chat_complain`.

Rule: `room exists && roomStatus === "OCCUPIED" && room.userIds includes userId` → else **403 before the handler runs**, so no request is created.

Verified the occupancy model is consistent:
- Check-in sets `roomStatus:"OCCUPIED"` + `userIds:[guest]` (`rooms.ts:941/963`)
- Companions `$addToSet userIds` (`services/hotelCompanions.ts:68/74`)
- Checkout sets `roomStatus:"AVAILABLE"` + `userIds:[]` (`rooms.ts:1322`) → stale links blocked

Not a blanket global gate — scoped to those endpoints; other flows untouched. The only handler change is a **de-duplication**: handlers reuse the middleware-loaded room via `c.get("hotelRoom")` instead of re-querying (same doc, one fewer DB call).

Client: `sessionGuard.ts#expelIfSessionOut` catches the 403 → toast + redirect + throws so `onSuccess` doesn't fire.

**Watch-outs:**
- Hard-depends on the literal status `"OCCUPIED"`; a future "checked-in" status with a different value would wrongly block guests.
- Depends on companion sync having run — an unsynced companion gets a 403.
- Trusts `userId` from the request body (these guest APIs are session-less by design) — it answers *"is this userId a current occupant?"*, not *"is the caller that user?"*.

---

## 10. Quick commands

```bash
# live checkout
cd /home/hipal/repo/hipal_monorepo

# builds
cd clients/client-hibiz-react && npx vite build
cd clients/client-hipal-app  && npx next build

# typecheck just the report module
cd clients/client-hibiz-react && npx tsc --noEmit | grep guest-service-journey

# verify server data
BID=66a41b98f3d1d34df72a4bb0
curl -s "http://localhost:4500/hotel/service/fetch_service_category?businessId=$BID"
curl -s "http://localhost:4500/hotel/rooms/user_source_analytics?businessId=$BID&from=<ms>&to=<ms>"
```

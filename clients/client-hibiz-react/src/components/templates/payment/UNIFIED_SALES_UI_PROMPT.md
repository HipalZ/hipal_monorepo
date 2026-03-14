# Unified Sales UI – How It’s Done (Prompt / Reference)

This document explains how the **Unified Sales Overview** UI in `UnifiedSales.tsx` is built: data source, key mappings from API to UI, and how each section and card is wired.

---

## 1. What the UI Is

- **Screen:** “Unified Sales Overview” – a dashboard of sales, dues, discounts/rewards, and taxes for a business over a selected date range.
- **Component:** `UnifiedSales.tsx` (default export `UnifiedSalesDashboard`).
- **Data:** Comes from a single API: **unified sales dashboard** (`payments/:id/unified_sales_dashboard`). The response is typed as `UnifiedDashboardCore` (see `@/components/types/paymentTypes`).

---

## 2. Data Flow

| Step | What happens |
|------|----------------|
| **Query** | `useQuery` with `queryKey: ["unifiedSalesDashboard", business?._id, timeStampStart, timeStampEnd]`. |
| **Fetch** | `apiRpc.payments[":id"].unified_sales_dashboard.$get` with `query: { businessId, from, to }` and `param: { id: business?._id }`. |
| **Response** | Raw response is unwrapped with `handleEnvelope<UnifiedDashboardCore>(res)` so we work with the envelope’s data (the `UnifiedDashboardCore` object). |
| **State** | That object is stored in React Query as `data`. All UI is derived from `data` (and from `useBusinessData`, `useTimings`, `useKotStore`, etc. for context). |

So: **one API → one `UnifiedDashboardCore` → all sections and cards.**

---

## 3. API Shape → Destructuring (How We Map Keys)

The component destructures the core segments from `data` like this:

```ts
const {
  paidAll,           // All paid settlements (normal + dues-settle)
  paidNormal,        // Only normal (non-dues) paid
  runningTables,     // Active tables and their amounts
  duesSettlements,   // DUES_SETTLE payments
  discountSummary,   // Discounts on paid vs on dues
  rewardsSummary,   // Coins given (paid vs dues)
  duesSummary,      // Dues given / get-back / outstanding / orders
  taxesSummary,     // GST, service charge, tips (paid vs dues)
} = data;
```

- **`data.invoiceRange`** is used only for the header subtitle (`invoiceRangeText`).
- Everything else on the screen comes from the eight keys above.

---

## 4. How the UI Is Structured

### 4.1 Reusable building block: `MetricCard`

- Each number on the dashboard is shown in a **`MetricCard`**.
- **Props:** `title`, optional `subtitle`, `value`, optional `prefix` (default `"₹"`), optional `icon`, `tone` (default / success / danger / muted), optional **`breakdown`** (list of `BreakdownItem`), optional **`action`** (e.g. “View all KOT” button).

**`BreakdownItem`:**

- `label: string` – row label in the breakdown sheet.
- `value: number` – amount or count.
- `direction?: "positive" | "negative" | "neutral"` – controls colour and sign:
  - **positive** → green, optional `+` and `₹`.
  - **negative** → red, `-` and `₹`.
  - **neutral** → grey; if label looks like “order”/“guest”/“table”, value is shown as count (no `₹`).

If `breakdown` is non-empty, the card shows a **slider icon** that opens a **Sheet** (right-side panel) with “Detailed Breakdown”: total at top, then each breakdown row with label + value (formatted by direction).

So: **one API segment can drive both the main card value and a detailed breakdown list.**

---

## 5. Section-by-Section Key Mapping

### Section 1 – Sales Summary

| Card | Main value source | Breakdown source |
|------|-------------------|------------------|
| **Total Sales (Paid – N orders)** | `paidAll.totals.netAfterDiscountAndCharges` | `salesMainBreakdown` (see below) |
| **Sales Split** | `paidNormal.totals.netAfterDiscountAndCharges + duesSettlements.totals.netAfterDiscountAndCharges` | Normal vs Dues settlements (same two values) |
| **By Payment Mode** | `sum(paidAll.paymentModes)` | `Object.entries(paidAll.paymentModes)` → each mode (e.g. “Online”, “Cash”) and amount |
| **Running Tables** (only if `runningTables.tables.length > 0` and today’s range) | `runningTables.totalActiveTableValue` | Active table count + per-table `name` + `amount` from `runningTables.tables` |

**`salesMainBreakdown`** maps API keys to labels and direction:

- Gross Subtotal ← `paidAll.totals.grossSubtotal` (positive)
- Discounts (incl. NPC & Complementary) ← `discountSummary.onPaid.total` (negative)
- Tax ← `taxesSummary.onPaid.tax` (positive)
- Service Charge ← `taxesSummary.onPaid.serviceCharge` (positive)
- Tips ← `taxesSummary.onPaid.tip` (positive)
- Round Off ← `paidAll.roundOff.value` (positive/negative by `paidAll.roundOff.type`)
- Paid Orders ← `paidAll.totals.ordersCount` (neutral, count)
- Total Guests ← `paidAll.totals.paxCount` (neutral, count)

So: **Section 1 is driven by `paidAll`, `paidNormal`, `duesSettlements`, `discountSummary.onPaid`, `taxesSummary.onPaid`, `paidAll.roundOff`, and `runningTables`.**

---

### Section 2 – Dues Summary (conditional)

- Rendered only if **`hasDues`** is true:  
  `duesSummary.duesGiven > 0 || duesSummary.duesOutstanding > 0 || duesSummary.ordersPending > 0`.

| Card | Main value | Breakdown |
|------|------------|-----------|
| **Dues – Net Position** | `duesSummary.duesOutstanding` | Dues Given (negative), Dues Recovered (positive), Pending Dues (negative/neutral), Pending Dues Orders (neutral) |

Breakdown keys: `duesSummary.duesGiven`, `duesSummary.duesGetBack`, `duesSummary.duesOutstanding`, `duesSummary.ordersPending`.

---

### Section 3 – Discounts & Rewards Summary

| Card | Main value | Breakdown |
|------|------------|-----------|
| **Discounts on Paid** | `-discountSummary.onPaid.total` | manual, coinsUsed, coupon, npcAsDiscount, compAsDiscount from `discountSummary.onPaid` |
| **Discounts on Dues** | `-discountSummary.onDues.total` | Same keys from `discountSummary.onDues` |
| **Rewards (Coins Given)** | `rewardsSummary.all.coinsGiven` | Coins given on paid, coins given on dues (`rewardsSummary.onPaid.coinsGiven`, `rewardsSummary.onDues.coinsGiven`) |

So: **Section 3 is driven by `discountSummary` and `rewardsSummary`.**

---

### Section 4 – Taxes & Service Summary

| Card | Main value | Breakdown |
|------|------------|-----------|
| **GST + Service + Tips (All)** | `taxesSummary.all.tax + taxesSummary.all.serviceCharge + taxesSummary.all.tip` | Rows for GST/Service/Tips on Paid and on Dues (`taxesSummary.onPaid` / `taxesSummary.onDues`). |

So: **Section 4 is driven only by `taxesSummary`.**

---

## 6. Type Reference (UnifiedDashboardCore)

- **`invoiceRange`:** `{ start, end }` – used for header text.
- **`paidAll` / `paidNormal` / `duesSettlements` / `duesPending`:** Each is a `SegmentAggregate`:
  - `totals`: ordersCount, paxCount, grossSubtotal, netAfterDiscountAndCharges, etc.
  - `roundOff`: type, value.
  - `paymentModes`: Record<string, number> (e.g. `online`, `cash`).
- **`discountSummary`:** `onPaid`, `onDues`, `all` – each `SegmentDiscount` (manual, coinsUsed, coupon, npcAsDiscount, compAsDiscount, total).
- **`rewardsSummary`:** `onPaid`, `onDues`, `all` – each `SegmentRewards` (coinsGiven).
- **`duesSummary`:** duesGiven, duesGetBack, duesOutstanding, ordersPending.
- **`taxesSummary`:** onPaid, onDues, all – each `SegmentCharges` (tax, serviceCharge, tip).
- **`runningTables`:** totalActiveTableValue, tables: `{ id, name, amount }[]`.

All card values and breakdown rows are computed from these keys; there is no extra client-side aggregation beyond sums and sign (e.g. showing discounts as negative).

---

## 7. Extra UI Behaviour

- **Header:** Title “Unified Sales Overview”, optional refresh, subtitle with business name and `invoiceRangeText`, and `ExecutiveUnifiedReportButton` (uses same `data` as `core`).
- **Running Tables:** If there are running tables and the range is “today”, the “View all KOT” button opens `TableKotPopUp` and triggers a KOT fetch for those table IDs; `runningTablesBreakdown` is passed into the popup for display.
- **Loading / Error:** Loading shows skeleton cards; if the query errors or `data` is missing, a single empty-state card is shown (“No sales data found for the selected range”).

---

## 8. One-Line Summary

**Unified Sales UI:** One API returns `UnifiedDashboardCore`; we map its segments (`paidAll`, `paidNormal`, `duesSettlements`, `discountSummary`, `rewardsSummary`, `duesSummary`, `taxesSummary`, `runningTables`) into four sections of `MetricCard`s, each card showing a main value and optionally a breakdown sheet built from the same typed keys (with direction for sign/colour).

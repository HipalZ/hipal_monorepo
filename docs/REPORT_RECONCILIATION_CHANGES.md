# Report Reconciliation – Implementation Summary

## 1. Shared Calculation Engine

**File:** `servers/server/src/utils/reportHelper/itemFinancialCalculator.ts`

- **Exports:**
  - `calculateGrossItem(item)` – gross item value (portion ?? dish + Σ(extra×qty)) × quantity
  - `calculateTotalGross(items)` – sum of gross item values
  - `resolveBillDiscount(payment)` – discount + claimedCoins + couponDiscount; complementary/NPC ⇒ billValue
  - `allocateDiscount(items, billDiscount)` – proportional allocation so Σ(itemDiscount) === billDiscount
  - `calculateNetItem(item, allocatedDiscount)` – grossItemValue - itemDiscount
  - `calculateGST(netItem, gstRate)` – netItem × gst% / 100
  - `allocateServiceCharge(items, totalServiceCharge)` – proportional by netItemValue
  - `calculateFinalItemTotals(items, payment)` – full breakdown + reconciliation (Σ finalItemTotal ≈ payment.total)
  - `isItemReportEligiblePayment(payment)` – true when settleType !== "DUES_SETTLE"
  - `filterPaymentsForItemReports(payments)` – has billItems and not DUES_SETTLE

- **Rules enforced:**
  - Gross = no discount, no tax
  - Bill discount = single source (payment.discount + claimedCoins + couponDiscount; complementary/NPC = billValue)
  - Proportional discount so Σ(itemDiscount) === billDiscount
  - GST on net (after discount)
  - Service charge allocated by net item value
  - Reconciliation tolerance: 1.01

---

## 2. Reports Refactored to Use Calculator Only

| Report | File(s) | Change |
|--------|--------|--------|
| Item Report | `itemReport.ts`, `routes/report/item.ts` | All line math via `calculateFinalItemTotals`; aggregate by dishId+zoneId+kitchenId from breakdown; `filterPaymentsForItemReports` for item-eligible set |
| Item Type Report | `itemTypeReport.ts`, `routes/report/item.ts` | `aggregateByDishType` uses calculator per payment; tax/netSales fixed; DUES_SETTLE excluded |
| Category Report | `categoryReport.ts`, `routes/report/category.ts` | Uses `aggregateBillItems` (calculator-based); category totals use `it.grossAmount`, `it.totalSales`; DUES_SETTLE excluded |
| Item Variant Report | `itemVariantReport.ts`, `routes/report/itemVariant.ts` | `aggregateByItemVariant` uses calculator; DUES_SETTLE excluded |
| Add-On Report | `addOnReport.ts` (helper + route) | Uses calculator; totalSales = proportional share of line final (no × addOnCount); DUES_SETTLE excluded |
| Open Item Sale | `buildOpenItemSaleSheet.ts` | Uses calculator for open items only; DUES_SETTLE excluded |
| Combine Report | `combineReport.ts` | No route change; all item-based sheet builders filter with `filterPaymentsForItemReports` internally |

---

## 3. Payment Mode Rules

- **Item reports (what was sold):** Exclude **DUES_SETTLE** only. Include: cash/card/upi, dues, complementary, npc.
- **Sales / Net Sales (revenue):** Include normal paid + dues settlement; exclude pending dues; complementary & NPC as discounts; dues settlement as revenue.

Item report routes and sheet builders use `filterPaymentsForItemReports()` so DUES_SETTLE is excluded from item/category/variant/dish-type/add-on/open-item.

---

## 4. Sales / Net Sales – Reconciliation

**File:** `servers/server/src/utils/reportHelper/salesReport.ts`

- After building paid rows, for each paid payment with `billItems`:
  - Call `calculateFinalItemTotals(billItems, payment)`.
  - If `!result.reconciled`, log:  
    `[Report reconciliation] Payment <id>: sum(itemFinalTotals)=X vs payment.total=Y diff=Z`
- No change to Net Sales / Sales totals logic; only assertion + debug log.

---

## 5. Files Modified

| Path | Purpose |
|------|--------|
| `servers/server/src/utils/reportHelper/itemFinancialCalculator.ts` | **NEW** – canonical engine |
| `servers/server/src/utils/reportHelper/itemFinancialCalculator.test.ts` | **NEW** – unit tests |
| `servers/server/src/utils/reportHelper/itemReport.ts` | Use calculator; add grossAmount; filter item payments |
| `servers/server/src/utils/reportHelper/categoryReport.ts` | Use filterPaymentsForItemReports; category from it.grossAmount, it.totalSales |
| `servers/server/src/utils/reportHelper/itemTypeReport.ts` | Use calculator; fix tax/netSales; filter item payments |
| `servers/server/src/utils/reportHelper/itemVariantReport.ts` | Use calculator; filter item payments |
| `servers/server/src/utils/reportHelper/addOnReport.ts` | Use calculator; fix totalSales (proportional); filter item payments |
| `servers/server/src/utils/reportHelper/buildOpenItemSaleSheet.ts` | Use calculator; filter item payments |
| `servers/server/src/utils/reportHelper/salesReport.ts` | Import calculator; add reconciliation loop + warn log |
| `servers/server/src/routes/report/item.ts` | filterPaymentsForItemReports for all item/dish-type/download handlers |
| `servers/server/src/routes/report/category.ts` | filterPaymentsForItemReports for JSON + XLSX |
| `servers/server/src/routes/report/itemVariant.ts` | filterPaymentsForItemReports for JSON + XLSX |
| `servers/server/src/routes/report/addOnReport.ts` | filterPaymentsForItemReports for JSON + CSV |

---

## 6. Proof of Reconciliation

- **Global invariant:** For each payment with billItems, `calculateFinalItemTotals` returns `reconciled: true` when `|sumFinalItemTotal - payment.total| ≤ 1.01`.
- **Item reports:** All use the same breakdown (gross, allocated discount, net, GST, service charge, final). Sum of finals per payment matches that invariant.
- **Category / Item / Variant / Dish Type:** All aggregate from the same calculator output; category totalSales = sum of finalItemTotal; item and variant same.
- **Add-on:** totalSales per add-on = sum of (extraShareOfLine × finalItemTotal) so add-on totals are consistent with payment totals.
- **Mismatches:** Logged in Sales report build with payment id and diff for follow-up (billing vs report).

---

## 7. Payment Creation

- **No change to Payment creation.** Reports are read-only projections; all math is in the calculator and report helpers.
- If reconciliation logs show persistent mismatches for certain flows, the next step is to fix the **billing/Payment creation** so that `payment.total` (and optionally tax/serviceCharge) match the same canonical formula; the report layer does not recompute payment.total.

---

## 8. User-Side (Phase 4)

- **Display:** Frontend/export should show: Gross, Discount (allocated), Net, GST, Service Charge, Final. Do not recompute totals; use server payload.
- **APIs:** Item/Category/Item Type/Variant responses now include calculator-derived fields (e.g. item report has grossAmount, amount as netItemValue, totalSales as finalItemTotal). Any client that currently recomputes from line items should switch to these fields.
- **Suggested:** Document the report API response shapes (and that totals are server-authoritative) so clients can remove local math.

---

## 10. Net Revenue = Total Sales (reconcile with Sales report)

**Problem:** Item/Category reports showed "Net Revenue" that excluded service charge (and its GST), so it did not match Sales report "Total". Sales Total = Gross − Discount + Tax + Service Charge + Round Off.

**Fix (Option 1 – implemented):**

- **Definition:** Net Revenue in Item/Category reports = **totalSales** (final item total = net + GST + service charge). This reconciles with Sales Total (± round-off).
- **Server:** Category report already had `totalSales`; sheet "Net Revenue" and enriched `netRevenue` now use `totalSales` when present. Category summary label "Total Amount" → "Gross Amount"; table column "Net Amount" → "Gross Amount".
- **Client (hibiz):**
  - **ItemReport:** Added `totalSales`, `gst`, `serviceCharge`. `calculateNetRevenue(amount, discount, tax, totalSales)` returns `totalSales` when present, else `amount + tax` (amount is already net).
  - **CategoryReport:** Added `totalSales`, `gst`, `serviceCharge`. Net Revenue per row and totals use `totalSales` when present.
  - Item/Category layouts (Table, Card, Compact) use totalSales for Net Revenue; category summary label "Total Amount" → "Gross Amount".
- **Result:** Item Net Revenue + Category Net Revenue ≈ Sales Total (same metric: final bill revenue including service charge).

---

## 11. Parent Category Report

**Purpose:** Aggregate revenue by parent category (Item → Child Category → Parent Category). One row per parent; optional child breakdown. Fully reconcilable with Item, Category, and Sales reports.

**Canonical rules:**
- All money calculated at item level via `calculateFinalItemTotals` only; no duplicate math.
- Item → Child Category (dish.categoryIds[0]) → Parent Category (category.parentCategoryIds[0] or self if top-level).
- Parent categories never calculate directly from dishes.
- Exclude `settleType === "DUES_SETTLE"` (same as Item/Category: `filterPaymentsForItemReports`).
- Complementary & NPC handled by calculator (100% discount).

**Implementation:**
- **Step 1:** Fetch categories for business(es); build `parentCategoryMap` (id → name, parentCategoryIds) and `childToParentMap` (childId → single parentId; top-level = self; unknown = "uncategorized").
- **Step 2:** Fetch payments (same filter as Item/Category); `filterPaymentsForItemReports`.
- **Step 3:** For each payment, `calculateFinalItemTotals(billItems, payment)`; each item has childCategoryId = dish.categoryIds[0].
- **Step 4:** Aggregate into childCategoryTotals; then roll up into parentCategoryTotals using childToParentMap (each child counts in exactly one parent).
- **Step 5:** Return one row per parent with optional `children` breakdown; `sumItemFinalAmount`, `sumParentFinalAmount`, `validationPassed`, `validationMessage`.

**Validation:**
- Assert: Σ(parentCategory.finalAmount) ≈ Σ(item.finalAmount) within round-off (1.01). Log `[Parent Category Report] Reconciliation failed: ...` if not.
- Per-payment: if `!result.reconciled`, log paymentId and diff (same as Sales report).

**Route:** `POST /report/parent_category` with `{ businessIds, from, to, includeChildBreakdown? }`. Response: grouped by business with `parentCategories`, `childCategoryTotals`, `sumItemFinalAmount`, `sumParentFinalAmount`, `validationPassed`, `validationMessage`.

---

## 9. Running Tests

From `servers/server`:

```bash
bun test src/utils/reportHelper/itemFinancialCalculator.test.ts
```

Tests cover: portion + extras, discount + coins + coupon, complementary/NPC, proportional allocation, GST after discount, reconciliation, and item-report payment filter.

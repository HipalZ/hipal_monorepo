# Report System & Payment Calculation Audit

**Scope:** `servers/server/src/routes/report` and all dependencies (Payment model, report helpers, aggregation logic).  
**Purpose:** Accurate documentation and debugging insights for fintech reporting; trace and validate all monetary calculations.  
**Status:** Analysis and documentation only — no refactor or code changes.

---

## 1. Report List Overview

| # | Report Name | API Endpoint | HTTP | Request Params | Date Logic | Other Filters |
|---|-------------|--------------|------|----------------|------------|----------------|
| 1 | Item Report | `/report/item` | POST | `businessIds[]`, `from`, `to` (numbers) | `date: { $gte: from, $lte: to }` | `isDeleted: false`, `billItems.0` exists |
| 2 | Dish Type Report | `/report/item/dish-type` | POST | Same | Same | Same |
| 3 | Item Report CSV/XLSX | `/report/item/download_csv` | POST | Same | Same | Same |
| 4 | Dish Type XLSX | `/report/item/download_csv_dish_type` | POST | Same | Same | Same |
| 5 | Category Report | `/report/category` | POST | Same | Same | Same + `billItems.0` |
| 6 | Category XLSX | `/report/category/download_xlsx` | POST | Same | Same | Same |
| 7 | Discount Report | `/report/discount` | POST | Same | Same | `discount`, `couponDiscount`, `claimedCoins` exist |
| 8 | Discount CSV | `/report/discount/download_csv` | POST | Same | Same | Same |
| 9 | Add-On Report | `/report/add_on` | POST | Same | Same | `billItems.extras` exists and not empty |
| 10 | Add-On CSV | `/report/add_on/download_csv` | POST | Same | Same | Same |
| 11 | Service Charge Report | `/report/service_charge` | POST | Same | Same | `serviceCharge` exists |
| 12 | Service Charge CSV | `/report/service_charge/download_csv` | POST | Same | Same | Same |
| 13 | Combine (Unified) Report | `/report/combine` | POST | Same | Same | **No** `billItems` filter — all payments |
| 14 | Item Variant Report | `/report/item_variant` | POST | Same | Same | `billItems.0` exists |
| 15 | Item Variant XLSX | `/report/item_variant/download_xlsx` | POST | Same | Same | Same |
| 16 | Deleted Items Report | `/report/deleted_items` | POST | Same | N/A (KotOrder `date`) | KotOrder: `cart.isDeleted: true` |
| 17 | Deleted Items XLSX | `/report/deleted_items/download_xlsx` | POST | Same | Same | Same |

**Base path:** Reports are mounted at `/report` (see `servers/server/src/routes/index.ts` → `.route("/report", reportRouter)`).

**Shared request validation:** All use `bodySchema`: `businessIds: z.array(z.string()).min(1)`, `from: z.number()`, `to: z.number()`, with `from <= to` check.

---

## 2. Payment Model Calculation Audit

### 2.1 Source of truth

- **Schema:** `packages/db-models/src/models/payment.ts`
- **Validator/type:** `packages/db-models/src/validators/payment.ts` → `PaymentType`
- **Report-time type:** `servers/server/src/utils/reportHelper/itemType.ts` → `Payment` (extends with `billItems`, `userId` populated, etc.)

### 2.2 Monetary and related fields

| Field | Type | Default | How/when calculated | Mutable? | Notes |
|------|------|---------|----------------------|----------|-------|
| `total` | Number | 0 | Set at Payment creation from Order/session (e.g. `order.total`, `tableSession?.total`). NPC/complementary → 0. | Stored, not recalculated on report | Single stored total per payment |
| `billValue` | Number | required | Set at creation from Order/session (`order.billValue`, `tableSession?.subTotal`, etc.). | Stored | Subtotal before tax/discount |
| `tax` | Number | 0 | Set at creation from session/order (`tableSession?.gst`, etc.). NPC/complementary → 0. | Stored | |
| `serviceCharge` | Number | 0 | Set at creation. NPC/complementary → 0. | Stored | |
| `discount` | Number | 0 | Set at creation (manual discount). | Stored | |
| `couponDiscount` | Number | 0 | Set at creation. | Stored | |
| `claimedCoins` | Number | 0 | Set at creation. NPC/complementary → 0. | Stored | |
| `tips` | Number | 0 | Set at creation. | Stored | |
| `splitModes` | Array | [] | `{ name, amount, _id }`. Set at creation. | Stored | Split payment breakdown; reports use `payment.total` or `payment.billValue` for totals |
| `roundOffType` | Number | 0 | 0 = minus, 1 = plus. Set at creation. | Stored | |
| `roundOffAmount` | Number | 0 | Absolute round value. Set at creation. | Stored | |
| `initialTax` | Number | 0 | Optional; set at creation. | Stored | |
| `initialSubTotal` | Number | 0 | Optional. | Stored | |
| `initialTotal` | Number | 0 | Optional. | Stored | |
| `finalSubTotal` | Number | 0 | Optional. | Stored | |
| `billItems` | Array | [] | Line items (dish, portion, extras, quantity, discount, etc.). Set at creation. | Stored | Used for item/category/add-on/variant/dish-type reports; **not** used for payment-level totals |
| `billInvoice` / `billNo` | Number | — | `billNo` assigned in `pre('save')` via `BillInvoiceNumber` counter. | Set once on insert | |
| `isDeleted` | Boolean | false | Soft delete flag. All report queries use `isDeleted: false`. | Mutable | |

**Not present in Payment:** `refundAmount`, `paidAmount`, `pendingAmount`, `deliveryCharge` (no such fields in schema or validator). **Refunds** are not modeled on Payment; no dedicated refund flow found in report scope.

### 2.3 Where Payment totals are set (creation only)

- **Table settle (normal):** `servers/server/src/routes/table/index.ts` — `Payment.create` with `total: saveOrder[0].total`, `billValue: saveOrder[0].billValue`, `tax`, `serviceCharge`, `discount`, `couponDiscount`, `billItems`, `roundOffType`, `roundOffAmount`, etc. from table session/order.
- **POS HiPalz normal settle:** `servers/server/src/handlers/pos/hipalz/orders.ts` — Order created with `total`, `billValue`, etc.; Payment created with same.
- **Razorpay/online:** `servers/server/src/queues/handlers/razorpayPayment/index.ts` — `Payment.create` with `total: getOrder?.total`, `billValue: getOrder?.billValue`, tax/serviceCharge/discount/couponDiscount from `tableSession`.
- **Payments route (alert-based settle):** `servers/server/src/routes/payments/index.ts` — `Payment.create` with `total` (0 for npc/complementary, else `order.total`), `billValue: order?.billValue`, etc.

All monetary values are **written once at creation**; there is **no recalculation on update** in the code paths reviewed. Reports **read** these stored values and/or derive line-level amounts from `billItems`.

### 2.4 High‑risk patterns

1. **Multiple sources of truth for “total”:** Order/session has `total`/`billValue`; Payment stores its own. If Order is updated after Payment creation (e.g. void, partial refund), Payment is not updated — reports will still show original Payment totals.
2. **No refund model:** Refunds are not represented on Payment; revenue cannot be reduced by refunds in current report logic.
3. **Floating‑point:** Report helpers use `Number(x.toFixed(2))` in many places; no dedicated decimal library. Risk of small drift when summing.
4. **Same formula in multiple places:** Line-level “net” is computed as `lineAmountExclTax - discount + lineTax` in `itemReport`, `itemVariantReport`, `itemTypeReport`, `buildOpenItemSaleSheet`, and category uses `it.amount - it.discount + it.tax` (equivalent). Any change must be kept in sync.
5. **Conditional logic by order type/status:** NPC/complementary zero out `total` and some discounts at creation; reports then filter or treat by `mode`/`settleType` (e.g. salesReport, cansolidateReport, unifiedSalesDashBoard). Consistency depends on creation logic matching report expectations.
6. **Discount report filter:** Uses `discount: { $exists: true }`, `couponDiscount: { $exists: true }`, `claimedCoins: { $exists: true }`. Payments where these are missing (even if 0) are excluded — can undercount if some payments don’t have these keys.
7. **Combine vs other reports:** Combine fetches **all** payments in range (no `billItems` filter); item/category/variant require `billItems.0`. So “Net Sales” in combine can include payments without line items; item-based reports exclude them — different bases for “same” period.

---

## 3. Report‑wise Documentation

### 3.1 Item Report

- **Report name:** Item Report  
- **API endpoint:** `POST /report/item`  
- **Purpose:** Per-business, per-item (and zone/kitchen) aggregation: quantity, net amount, discount, tax, total sales.  
- **Filters:** `businessIds`, `from`, `to`; Payment: `businessId` ∈ ids, `isDeleted: false`, `date` ∈ [from, to], `billItems.0` exists.  
- **Models used:** Payment, Business, DishZoneKitchen, Table, Kitchen (for Excel).  
- **Payment fields used:** `businessId`, `date`, `billItems` (dish, portion, extras, quantity, discount), `tableName` (→ zone via Table).  
- **Calculation formula (explicit math):**
  - Per line: `unitPrice = portion ? portion.price : dish.price`; `extrasTotal = sum(extra.price * extra.quantity)`; `lineAmountExclTax = (unitPrice + extrasTotal) * quantity`; `lineTax = lineAmountExclTax * (dish.gst || 0) / 100`.
  - Per item aggregate: `amount += lineAmountExclTax`, `discount += bi.discount`, `tax += lineTax`, `totalSales += (lineAmountExclTax - discount + lineTax)` (with toFixed(2)).
  - All math is **app-level** (JS); no MongoDB aggregation.  
- **Known edge cases:** Same dish in different zones/kitchens aggregated separately (dishId + zoneId + kitchenId). Missing zone → "UNASSIGNED_ZONE" / "UNASSIGNED".  
- **Current issues:** None identified beyond shared floating‑point and formula duplication.

---

### 3.2 Dish Type Report (Item Type)

- **Report name:** Dish Type Report (VEG / NON_VEG / EGG / JAIN etc.)  
- **API endpoint:** `POST /report/item/dish-type`  
- **Purpose:** Aggregate quantity, discount, gross amount (and optionally tax/net) by dish type.  
- **Filters:** Same as Item Report (businessIds, from, to, `billItems.0`).  
- **Models used:** Payment, Business.  
- **Payment fields used:** `businessId`, `billItems` (dish.dishTypes, portion, extras, quantity, discount, dish.gst).  
- **Calculation formula:**
  - Same line math as Item Report: `lineAmountExclTax`, `lineTax`, `net = lineAmountExclTax + lineTax - discount`.
  - For each type in `dish.dishTypes`, **full** quantity and amounts are added to that type (multi-type dishes counted in every type).
  - **Bug:** In `itemTypeReport.ts`, `map[type].tax` and `map[type].netSales` are **never updated** (commented out in loop). So tax and netSales stay 0 for all types. Sort uses `b.netSales - a.netSales` → all 0 → **random order**. Sheet also does not show tax/netSales columns (commented out).  
- **Known edge cases:** Multi-type dishes double-counted across types (by design).  
- **Current issues:** Tax and netSales not aggregated; dish type totals and sort are wrong/inconsistent.

---

### 3.3 Category Report

- **Report name:** Category Report  
- **API endpoint:** `POST /report/category`, `POST /report/category/download_xlsx`  
- **Purpose:** Per-category totals: order count, item count, net amount, discount, tax, total sales.  
- **Filters:** Same as Item (businessIds, from, to, `billItems.0`).  
- **Models used:** Payment, Business, Category (for names).  
- **Payment fields used:** `businessId`, `billItems`.  
- **Calculation formula:** Uses `aggregateBillItems(payments)` from itemReport (same line math). Then groups by `categoryId` (from dish.categoryIds[0] or "uncategorized"): `totalSales = it.amount - it.discount + it.tax` (equivalent to using `it.totalSales` from AggregatedItem). All **app-level**.  
- **Known edge cases:** Uncategorized items grouped under "uncategorized"; category names from Category collection.  
- **Current issues:** Redundant formula (could use `it.totalSales` for consistency and to avoid drift).

---

### 3.4 Discount Report

- **Report name:** Discount Report  
- **API endpoint:** `POST /report/discount`, `POST /report/discount/download_csv`  
- **Purpose:** By business: count and amount for claimedCoins, couponDiscount, discount.  
- **Filters:** `businessIds`, `from`, `to`; Payment: `discount`, `couponDiscount`, `claimedCoins` **exist**.  
- **Models used:** Payment, Business.  
- **Payment fields used:** `businessId`, `claimedCoins`, `couponDiscount`, `discount`.  
- **Calculation formula:** For each payment, if `claimedCoins` / `couponDiscount` / `discount` truthy, increment count and add amount. **App-level** sums.  
- **Known edge cases:** Payments without these keys are **excluded** (even if they have 0). So totals can be lower than “all payments” reports.  
- **Current issues:** Filter on `$exists` can undercount; no distinction between “0” and “missing”.

---

### 3.5 Add‑On Report

- **Report name:** Add-On Report  
- **API endpoint:** `POST /report/add_on`, `POST /report/add_on/download_csv`  
- **Purpose:** Per add-on (extra) name: count, net amount, “total sales”.  
- **Filters:** `businessIds`, `from`, `to`; Payment: `billItems.extras` exists and not empty.  
- **Models used:** Payment, Business.  
- **Payment fields used:** `businessId`, `billItems[].extras` (name, price, quantity).  
- **Calculation formula:** For each extra: `addOnCount += 1`, `amount += extra.price * extra.quantity`, `totalSales += extraAmount`. Then in output: `totalSales: Number(totalSales.toFixed(2)) * addOnCount`.  
- **Known edge cases:** None.  
- **Current issues:** **Bug:** `totalSales` is already the **sum** of all extra amounts for that add-on. Multiplying by `addOnCount` is wrong and inflates “Total Sales” in CSV/API.

---

### 3.6 Service Charge Report

- **Report name:** Service Charge Report  
- **API endpoint:** `POST /report/service_charge`, `POST /report/service_charge/download_csv`  
- **Purpose:** Per-business sum of `payment.serviceCharge`.  
- **Filters:** `businessIds`, `from`, `to`; Payment: `serviceCharge` exists.  
- **Models used:** Payment, Business.  
- **Payment fields used:** `businessId`, `serviceCharge`.  
- **Calculation formula:** `totalServiceCharge = sum(payment.serviceCharge || 0)`. **App-level**.  
- **Known edge cases:** Payments without `serviceCharge` are excluded.  
- **Current issues:** Same `$exists` pattern as discount — possible undercount if key is missing.

---

### 3.7 Combine (Unified) Report

- **Report name:** Combine / Unified Excel Report  
- **API endpoint:** `POST /report/combine`  
- **Purpose:** Single Excel with multiple sheets: Consolidated, Net Sales, Sales, Category, Item, Item Type, Item Variant, AddOn, Discount, Service Charge, Open Item Sale.  
- **Filters:** `businessIds`, `from`, `to`; Payment: **only** `businessId`, `isDeleted: false`, `date` range (no `billItems` filter).  
- **Models used:** Payment, Business, Kitchen, DishZoneKitchen, Table (and Category via category report).  
- **Payment fields used:** All payment-level fields used by each sub-report; `billItems` only where the sheet needs it (item, category, add-on, variant, dish type, open item).  
- **Calculation formula:** Each sheet uses the same logic as its standalone report. Net Sales / Sales / Consolidated use payment-level fields (`billValue`, `total`, `tax`, `serviceCharge`, `discount`, `claimedCoins`, `couponDiscount`, `tips`, `roundOffType`, `roundOffAmount`, `settleType`, `mode`, `splitModes`).  
- **Known edge cases:** Base set includes payments **without** `billItems`. So “Net Sales” / “Total Sales” can include such payments; item/category sheets only include payments that have `billItems` (filtered inside helper). Totals between combine and standalone item/category can differ for same period.  
- **Current issues:** Inconsistent base set vs other reports; any bug in a sub-report (e.g. dish type, add-on totalSales) appears in combine too.

---

### 3.8 Item Variant Report

- **Report name:** Item Variant Report (item + portion)  
- **API endpoint:** `POST /report/item_variant`, `POST /report/item_variant/download_xlsx`  
- **Purpose:** Aggregate by item (dish) and portion: quantity, gross amount, discount, tax, net sales.  
- **Filters:** Same as Item (businessIds, from, to, `billItems.0`).  
- **Models used:** Payment, Business.  
- **Payment fields used:** `businessId`, `billItems` (dish, portion, extras, quantity, discount, id for portion).  
- **Calculation formula:** Same line math as Item Report. Key = `${dishId}_${portionId || 'default'}`. `netSales = lineAmountExclTax + lineTax - discount`. **App-level**.  
- **Known edge cases:** Portion from `item.id` parsing or portion object; “Default” if no portion.  
- **Current issues:** None beyond shared formula/float handling.

---

### 3.9 Net Sales & Sales Report (sheets in combine)

- **Report name:** Net Sales Report, Sales Report  
- **API endpoint:** Only inside `POST /report/combine` (and logic in `salesReport.ts`).  
- **Purpose:** Per-business: paid vs dues; subtotal, discounts, tax, service charge, tips, total, round-off; invoice range; dues get back.  
- **Filters:** Same as combine (all payments in range). Then split: paid = normal + DUES_SETTLE; dues = mode dues and not DUES_SETTLE.  
- **Models used:** Payment.  
- **Payment fields used:** `businessId`, `date`, `userId`, `tableName`, `mode`, `paymentMode`, `billValue`, `tips`, `claimedCoins`, `earnCoins`, `discount`, `tax`, `serviceCharge`, `total`, `waiterName`, `settleType`, `comment`, `splitModes`, `billInvoice`, `couponDiscount`, `roundOffType`, `roundOffAmount`.  
- **Calculation formula:**
  - `rowTotalDiscount = claimedCoins + discount + couponDiscount`.
  - Net Sales: `netSales = totalBillValue - (totalComplementary + totalNpc + allDiscounts)`; `totalSalesExclRoundOff = totalAmount - totalRoundOff`.
  - Complementary/NPC from `mode` and `splitModes`. Dues get back: `settleType === 'DUES_SETTLE'` and not complementary.
  - All **app-level**.  
- **Known edge cases:** Round-off: `roundOffType === 1` → add `roundOffAmount`, `0` → subtract.  
- **Current issues:** None identified; logic is detailed and consistent with unified dashboard.

---

### 3.10 Consolidated Sheet (in combine)

- **Report name:** Consolidated Report (sheet)  
- **API endpoint:** Only inside `POST /report/combine`.  
- **Purpose:** Summary per business: Net Sale, Gross Sale, orders, dues get back, pending dues; category table; payment types; dues settlement; complimentary & discounts; tips.  
- **Filters:** Same payments as combine; category block uses **paid** payments only.  
- **Models used:** Payment, Business, Category (via buildCategoryReport).  
- **Payment fields used:** Same as Sales/Net Sales; for payment types, npc/complementary excluded from “sales” modes.  
- **Calculation formula:** Paid totals from `billValue`, `total`, tax, serviceCharge, tips, discounts, complementary, NPC, dues get back. Category from `buildCategoryReport(paidPayments)`. Payment types: sum `total` by `paymentMode` (excluding npc/complementary). Dues settlement: by `paymentMode` for DUES_SETTLE, amount = `billValue`. **App-level**.  
- **Known edge cases:** Category uses only paid payments; payment type table excludes npc/complementary.  
- **Current issues:** None beyond dependency on category and payment-type logic.

---

### 3.11 Open Item Sale Sheet (in combine)

- **Report name:** Open Item Sale  
- **API endpoint:** Only inside `POST /report/combine`.  
- **Purpose:** For items marked open (`billItem.isOpenItem === true`): quantity, net amount, discount, tax, net revenue.  
- **Filters:** From combine ctx; then payments with `billItems` and items with `isOpenItem`.  
- **Models used:** Payment.  
- **Payment fields used:** `businessId`, `billItems` (dish, portion, extras, quantity, discount, isOpenItem).  
- **Calculation formula:** Same line math as Item Report; only lines with `isOpenItem === true`. **App-level**.  
- **Known edge cases:** If no open items for a business, that business is skipped.  
- **Current issues:** None.

---

### 3.12 Deleted Items Report

- **Report name:** Deleted Items Report  
- **API endpoint:** `POST /report/deleted_items`, `POST /report/deleted_items/download_xlsx`  
- **Purpose:** List and summary of deleted KOT line items (by item key: dish, portion, extras, delete count, quantity, amount, deleted by, reasons).  
- **Filters:** `businessIds`, `from`, `to`; **KotOrder**: `date` in range, `cart.isDeleted === true`.  
- **Models used:** **KotOrder**, Business (no Payment).  
- **Payment fields used:** None.  
- **Calculation formula:** From KotOrder.cart: quantity, rate from portion/dish, amount = quantity * rate; summary by itemKey: sum quantity, amount, count; average rate. **App-level**.  
- **Known edge cases:** Uses KotOrder date, not Payment date; different dataset from all other reports.  
- **Current issues:** None; standalone from Payment.

---

## 4. Dependency Map (Report → Payment Fields → Calculation)

| Report | Payment fields read | Calculation location | DB vs app |
|--------|---------------------|----------------------|-----------|
| Item | businessId, billItems, tableName | itemReport.ts: aggregateBillItems, buildItemSheet | App |
| Dish Type | businessId, billItems | itemTypeReport.ts: aggregateByDishType | App |
| Category | businessId, billItems | categoryReport.ts ← aggregateBillItems | App |
| Discount | businessId, discount, couponDiscount, claimedCoins | discountReport.ts: buildDiscountReport | App |
| Add-On | businessId, billItems[].extras | addOnReport.ts: buildAddOnReport | App |
| Service Charge | businessId, serviceCharge | serviceChargeReport.ts: buildServiceChargeReport | App |
| Combine | All of the above per sheet | Same helpers as above + salesReport, cansolidateReport, etc. | App |
| Item Variant | businessId, billItems | itemVariantReport.ts: aggregateByItemVariant | App |
| Net Sales / Sales | billValue, total, tax, serviceCharge, discount, claimedCoins, couponDiscount, tips, roundOff*, mode, settleType, splitModes | salesReport.ts: buildNetAndSalesSheets | App |
| Consolidated | Same as Net Sales + category + payment mode | cansolidateReport.ts + buildCategoryReport | App |
| Open Item Sale | businessId, billItems, isOpenItem | buildOpenItemSaleSheet.ts | App |
| Deleted Items | — | KotOrder only | App |

All report calculations are **app-level** (JavaScript); no MongoDB aggregation pipelines are used for these reports.

---

## 5. Bug List with Root Causes

| # | Issue | Root cause | File / function | Reports affected |
|---|--------|------------|----------------|------------------|
| 1 | Dish Type: tax and netSales always 0; sort by netSales is random | In `aggregateByDishType`, the lines that add to `map[type].tax` and `map[type].netSales` are commented out. | `servers/server/src/utils/reportHelper/itemTypeReport.ts`, `aggregateByDishType` | Dish Type Report, Combine (Item Type sheet) |
| 2 | Add-On: “Total Sales” column inflated | `totalSales` is already the sum of (price×qty) for that add-on; then output uses `totalSales * addOnCount`, double-counting. | `servers/server/src/utils/reportHelper/addOnReport.ts`, `buildAddOnReport` (mapping of addOns) | Add-On Report API & CSV, Combine (AddOn sheet) |
| 3 | Discount/Service Charge: possible undercount | Query uses `discount: { $exists: true }` (and similar). Payments without these keys are excluded even if value would be 0. | `servers/server/src/routes/report/discount.ts`, `serviceCharge.ts` (Payment.find) | Discount Report, Service Charge Report |
| 4 | Combine vs Item/Category: different totals for same period | Combine loads all payments in range; Item/Category use only payments with `billItems.0`. So combine “Net Sales” can include payments without line items. | `combineReport.ts` vs `item.ts` / `category.ts` (Payment.find filters) | Combine vs Item/Category |
| 5 | Category: redundant totalSales formula | Category uses `it.amount - it.discount + it.tax` instead of `it.totalSales`; minor drift risk if formula ever diverges. | `servers/server/src/utils/reportHelper/categoryReport.ts`, buildCategoryReport | Category Report |
| 6 | No refund handling | Payment has no refund field; reports never reduce revenue by refunds. | N/A (missing feature) | All revenue reports |
| 7 | Floating‑point consistency | Multiple places use `toFixed(2)` and `Number()`; no single decimal strategy. | All report helpers | All monetary reports |

---

## 6. Recommended Fix Architecture

### 6.1 Single source of truth for payment calculations

- **Payment document:** Remain the single source for **payment-level** totals (`total`, `billValue`, `tax`, `serviceCharge`, `discount`, `couponDiscount`, `claimedCoins`, `tips`, `roundOffType`, `roundOffAmount`) — all set at creation and not recomputed in reports.
- **Line-level (billItems):** Define one shared module (e.g. `reportHelper/lineItemCalculations.ts`) that implements:
  - `getLineAmountExclTax(billItem)`, `getLineTax(billItem)`, `getLineNet(billItem)` (or similar),
  - with a single formula: e.g. `net = lineAmountExclTax + lineTax - discount`.
- All reports that derive amounts from `billItems` (item, category, item variant, dish type, open item) should call this module only — no duplicate formulas.

### 6.2 What should live where

- **DB:** Keep current design: no aggregation pipelines for these reports; Payment (and KotOrder for deleted items) are read and filtered in app. Optionally, for very large date ranges, consider aggregation pipelines for **payment-level** summaries only (e.g. sum of `total`, `billValue` by business/date) to reduce payload; line-level detail still in app.
- **Service layer:** Move all “report aggregation” (grouping, summing, rounding) into a dedicated report service that uses the shared line-item calculator and receives already-filtered Payment arrays. Routes only: validate input, fetch payments, call service, format response/Excel.
- **Precomputed vs derived:** Keep totals as **stored** on Payment (precomputed at settle). For line-level reports, keep **derived** from `billItems` in the report layer using the shared calculator. Do not store line-level aggregates on Payment.

### 6.3 Making all reports consistent

- **Base set:** Decide one rule, e.g. “reports that show payment-level totals (Net Sales, Total Sales) use all non-deleted payments in date range” and “reports that show item/category/variant use only payments that have at least one billItem”. Document this and apply consistently; combine should use the same filters as standalone where the same metric is shown, or explicitly document why combine is “wider” (and consider adding a filter option).
- **Date and status:** Use the same date field (`Payment.date`) and same `isDeleted: false` everywhere. For “discount”/“service charge” reports, prefer “include all payments and treat missing field as 0” (or explicit `$or` with null/0) instead of `$exists: true` so counts match other reports.
- **Rounding:** Use one helper, e.g. `roundMoney(x) => Number(x.toFixed(2))`, everywhere; or introduce a decimal library and use it for all report money. Ensure sort keys (e.g. netSales) are computed with the same rule.

### 6.4 Shared calculation helpers

- **Line item:** As above, one module for line amount, tax, net.
- **Payment-level totals:** One place that, given a list of payments, returns subtotal (billValue), total, tax, serviceCharge, discounts (breakdown), tips, round-off, and optionally by paymentMode/settleType — used by salesReport, cansolidateReport, and unified dashboard so definitions cannot diverge.
- **Decimal handling:** Either a single `roundMoney` or a small decimal utility used by every report that touches money.

### 6.5 Validation and regression safety

- **Sanity checks:** After computing report totals, assert e.g. “sum of payment.total for filtered set equals report Total Sales” (for payment-level sheets). For item-based reports, optional check: sum of line nets ≈ sum of payment totals for same set (allowing for rounding).
- **Tests:** Unit tests for the shared line-item calculator (known billItem → expected amount/tax/net). Integration tests: fixed Payment fixtures → expected report rows and totals; add a fixture that includes refund-like data once refunds are modeled.
- **Regression:** When changing any payment creation path (table, POS, Razorpay, etc.), run report tests and compare key totals for a given date range before/after.

### 6.6 Refunds and partial payments (future)

- If refunds are introduced: add `refundAmount` (or similar) on Payment and ensure creation/update is consistent. Reports that show “revenue” should subtract refunds (e.g. `realisedRevenue = total - refundAmount`). Document whether partial refunds are supported and how they affect `total` vs `refundAmount`.
- For partial payments: clarify whether one Order can have multiple Payment documents (e.g. partial pay) or one Payment with splitModes; then ensure report logic (e.g. “Total Sales” = sum of Payment.total vs sum of splitModes.amount) matches that model.

---

## 7. Summary

- **Reports:** 17 endpoints (including download variants); all under `POST /report/...` with `businessIds`, `from`, `to`. One (Deleted Items) uses KotOrder; the rest use Payment.
- **Payment:** All monetary fields are set at creation (from Order/session); no recalculation on update. No refund or delivery fields; round-off and split modes are stored and used in Net Sales/Sales and Consolidated.
- **Bugs:** (1) Dish Type tax/netSales not aggregated and sort broken, (2) Add-On totalSales wrongly multiplied by count, (3) Discount/Service Charge existence filters can undercount, (4) Combine uses a wider payment set than item/category, (5) Category redundant formula, (6) no refund handling, (7) scattered rounding.
- **Fix strategy:** Single shared line-item calculator, single payment-level totals helper, consistent base set and filters, one rounding approach, optional DB aggregation for payment-level summary only, validation and tests for regression.

This document is accurate as of the codebase state at the time of analysis and is intended to allow a new developer to rebuild or fix report logic without relying solely on reading the code.

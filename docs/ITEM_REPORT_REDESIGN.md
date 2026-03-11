# Item Report Redesign: Zone-Wise vs Kitchen-Wise

## Prompt for implementation

1. **Go through all reports** – Understand how item, category, discount, and other reports are built (filters, aggregation keys, Excel/API response shape).
2. **Understand the linking** – Dish–Zone–Kitchen (DZK) vs dish.kitchenId: when each is used and how to detect “zones involved” vs “kitchen only”.
3. **Then implement** – Server first (item report helper + route), then client (types + UI) so the item report differentiates clearly by zone or by kitchen and shows the requested columns.

---

## 1. How current reports work (summary)

- **Item report** (`reportHelper/itemReport.ts` + `routes/report/item.ts`):
  - Payments are filtered by `filterPaymentsForItemReports` (has billItems, not DUES_SETTLE).
  - **Dish–Zone–Kitchen (DZK):** A map `(dishId, zoneId) → kitchenId` is built from `DishZoneKitchen.find({ businessId })`. Kitchen is resolved only via this map (no dish.kitchenId in the current item report).
  - Zone for a payment comes from `payment.zoneId`, `payment.table?.zoneId`, or table lookup by tableName.
  - Aggregation key is effectively **zone → kitchen → dish** (or in `aggregateBillItems`: `dishId_zoneId_kitchenId`). Same dish in multiple zones/kitchens appears as multiple rows.
  - **itemFinancialCalculator** provides per-line totals: quantity, grossAmount, netItemValue, itemDiscount, itemGST, itemServiceCharge, totalTax, finalItemTotal. No report does its own money math.
  - Deleted/missing dish: row shown as “Not found or deleted dish”, id `"deleted"`.
- **Other reports** (category, discount, add-on, etc.) use their own aggregation; item report is the one that must split by zone vs kitchen as below.

---

## 2. Linking: Dish–Zone–Kitchen vs dish.kitchenId

- **DishZoneKitchen (DZK)**  
  API: `GET /dish_zone_kitchen/business/:businessId` returns mappings for that business. Each document has `dishId`, `zoneId`, `kitchenId`, `businessId`.  
  Meaning: “In this zone, this dish is prepared by this kitchen.” One dish can have **multiple** (zoneId, kitchenId) pairs (same dish in multiple zones).

- **When DZK has entries for the business**  
  Zones are “involved”. Kitchen for a line item is determined by **(dishId, zoneId)** from DZK, not from the dish document. Report should be **zone-wise**: show dish, quantity, **area (zone names)** where the dish was ordered, amount, discount, tax, net revenue.

- **When DZK is empty for the business**  
  No zone-based routing. Use **dish.kitchenId** (single kitchen per dish). Report should be **kitchen-wise**: group by kitchen, then show dish-level rows with quantity, amount, discount, tax, net revenue.

**Rule:**

- Fetch DZK for report businessIds (as today).
- **If** for a given business there is **at least one** DZK mapping → **zone-wise** report (use zone from payment; resolve kitchen from DZK; show zone names).
- **Else** (DZK empty for that business) → **kitchen-wise** report (use `dish.kitchenId`; no zone column; group/section by kitchen).

---

## 3. Desired item report behaviour

### 3.1 Zone-wise (when DZK non-empty for the business)

- **Grouping:** By zone (and optionally by dish within zone). Same dish can appear in multiple zones → multiple rows or one row with “areas” (zone names).
- **Columns:** Dish name, Quantity, **Area(s) added** (zone names), Amount (net), Discount, Tax, Net revenue.
- **Data:** Use payment’s zone (table/payment), DZK for kitchen; resolve **zone Id → zone name** (e.g. from Zone model) for display.

### 3.2 Kitchen-wise (when DZK empty for the business)

- **Grouping:** By kitchen (from dish.kitchenId), then by dish within each kitchen.
- **Columns:** Dish name, Quantity, Amount, Discount, Tax, Net revenue (no zone/area column).
- **Data:** From bill items use `dish.kitchenId`; no DZK lookup. Resolve kitchenId → kitchen name for section headers or a “Kitchen” column.

### 3.3 Simple “item only” summary (optional)

- One row per dish (no zone/kitchen split): Quantity, Amount, Discount, Tax, Net revenue. Can be derived from the same aggregation by summing over zone/kitchen when needed.

---

## 4. Server-side implementation outline

1. **Report route** (`routes/report/item.ts`):
   - Fetch DZK for `businessIds` (as now).
   - **Per business** (or per report if single business): decide mode:
     - If `dishZoneKitchenMappings` has any row for that business → **zone mode**.
     - Else → **kitchen mode**.
   - Fetch Zone names (zoneId → name) for zone mode; Kitchen names (kitchenId → name) for both (for display).
   - Call new aggregators (see below) and build response that includes:
     - `reportMode: 'zone' | 'kitchen'`
     - For zone: items with `dishName`, `quantity`, `zoneNames` (or `zoneIds` + zone name map), `amount`, `discount`, `tax`, `netRevenue` (and any existing fields needed by client).
     - For kitchen: either sections `{ kitchenId, kitchenName, items: [...] }` or flat items with `kitchenId`/`kitchenName`; each item: `dishName`, `quantity`, `amount`, `discount`, `tax`, `netRevenue`.

2. **itemReport.ts** (or a dedicated zone/kitchen helper):
   - **Zone mode:**  
     Aggregate by (dishId, dishName, zoneId). For each group: sum quantity, amount, discount, tax, netRevenue. Resolve zoneId → zone name. Output rows: dishName, quantity, zoneNames (single zone or comma-separated if we merge), amount, discount, tax, netRevenue. (Same dish in multiple zones → one row per zone or one row with combined zone names, as per product preference.)
   - **Kitchen mode:**  
     Use `dish.kitchenId` (no DZK). Aggregate by (kitchenId, dishId, dishName). Sum same metrics. Output rows: dishName, quantity, amount, discount, tax, netRevenue; attach kitchenId/kitchenName for grouping on client.
   - **Excel (download_csv):**  
     Same logic: if zone mode, write sheets/sections with zone and columns above; if kitchen mode, by kitchen with columns above. Reuse existing financial calculator; only aggregation key and columns change.

3. **Backward compatibility:**  
   Keep existing `aggregateBillItems` or a variant for combine report if needed. New API response can add `reportMode` and new shape; client should support both or migrate to new shape only.

---

## 5. Client-side implementation outline

1. **Types** (e.g. in `useReportHook.ts` or report types):
   - Add `reportMode: 'zone' | 'kitchen'`.
   - Zone mode: item type with `zoneNames?: string[]` (or single string “area”) and existing amount/discount/tax/netRevenue.
   - Kitchen mode: item type with `kitchenId`, `kitchenName`, and same financial fields; optional `sections: { kitchenId, kitchenName, items }[]` if API returns grouped.

2. **Item report UI** (ItemReports.tsx and layout components):
   - If `reportMode === 'zone'`: show table/cards with columns: Dish name, Quantity, Area(s) (zone names), Amount, Discount, Tax, Net revenue. Search/filter by dish name and optionally by zone.
   - If `reportMode === 'kitchen'`: show sections by kitchen (or table with Kitchen column); each row: Dish name, Quantity, Amount, Discount, Tax, Net revenue.
   - Reuse existing date range, business, and download CSV/XLSX; ensure download uses same server logic (zone- or kitchen-wise).

3. **CSV/Excel download:**  
   Already triggered from same report; server’s download_csv will use the same mode (zone vs kitchen) and column layout, so no change needed on client except that the file content matches the new structure.

---

## 6. Summary

| Scenario              | Detection              | Report type   | Key columns / grouping                          |
|-----------------------|------------------------|---------------|-------------------------------------------------|
| DZK has entries       | At least one DZK row   | Zone-wise     | Dish, Qty, **Area (zone names)**, Amount, Discount, Tax, Net revenue |
| DZK empty             | No DZK for business   | Kitchen-wise  | By kitchen; Dish, Qty, Amount, Discount, Tax, Net revenue |

Implementation order: (1) read and understand existing reports and DZK vs dish.kitchenId; (2) implement server (aggregation + route + Excel); (3) implement client (types + UI for zone/kitchen).

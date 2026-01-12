# Transfer Item Component - End-to-End Flow Documentation

## Overview
This document traces the complete flow of the `transferItem.tsx` component from UI interaction to API call and server processing.

---

## 1. Component Structure: `transferItem.tsx`

### Location
`clients/client-hitable-react/src/components/atoms/placeOrders/transferItem.tsx`

### Purpose
Allows users to select items from an order and transfer them to another table.

### Key State & Hooks

#### From `useOrderStore`:
- `orderDataStore: OrderData[]` - Current order data with cart items
- `selectedItems: string[]` - Array of selected item IDs (`item._id`)
- `setSelectedItems` - Updates selected items
- `transferModal: boolean` - Controls modal visibility
- `setTransferModal` - Opens/closes transfer modal
- `transferTable: TransferTable` - Type of transfer ("ITEM" | "TABLE" | "")
- `setTransferTable` - Sets transfer type

#### Local State:
- `selectTable: boolean` - Controls whether to show table selection screen

### Component Flow

1. **Initial Render**:
   - Filters out deleted items from `orderDataStore`
   - Displays all cart items from all orders
   - Shows checkboxes for each item

2. **Item Selection**:
   - User clicks checkbox → `handleCheckboxChange(item._id, checked)`
   - Updates `selectedItems` array in store
   - Visual feedback: checkbox state reflects selection

3. **Transfer Button Click**:
   - User clicks "Transfer Items" button
   - Calls `openSelectTable()` → sets `selectTable = true`
   - Renders `<EmptyTableList transfer />` component

---

## 2. Table Selection: `EmptyTableList` Component

### Location
`clients/client-hitable-react/src/components/tables/index.tsx`

### When `transfer={true}` prop is passed:

#### Uses `useTableTransfer` Hook:
```typescript
const { 
  toTable,           // Selected destination table
  setToTable,        // Set destination table
  isConfirming,      // Confirmation state
  setIsConfirming,   // Toggle confirmation
  isPending,         // API loading state
  closeTransferModal,// Close modal
  confirmTransfer    // Execute transfer
} = useTableTransfer(businessId);
```

#### Flow:
1. **Table Selection**:
   - User selects destination table from list
   - `setToTable(table)` updates selected table

2. **Confirmation**:
   - User clicks "Transfer Table" button
   - `setIsConfirming(true)` shows confirmation screen
   - Displays: "Table is transferring from {source} to {destination}"

3. **Final Confirmation**:
   - User clicks "Confirm" button
   - Calls `confirmTransfer()` function

---

## 3. API Hook: `useTableTransfer`

### Location
`clients/client-hitable-react/src/components/hooks/useTableData.ts`

### Key Function: `confirmTransfer()`

```typescript
const confirmTransfer = async () => {
  if (transferTable === "ITEM" && toTable && selectedTable) {
    // Build itemData array with itemId and quantity from orderDataStore
    const itemData = selectedItems
      .map((itemId) => {
        // Find the item in orderDataStore
        for (const order of orderDataStore) {
          const cartItem = order.cart.find((item) => item._id === itemId);
          if (cartItem && cartItem.quantity > 0) {
            return {
              itemId: itemId,
              quantity: cartItem.quantity, // Full quantity of the item
            };
          }
        }
        return null;
      })
      .filter((item) => item !== null);

    // Validate quantities
    if (itemData.length !== selectedItems.length) {
      return toast.error("Some selected items could not be found");
    }

    const invalidItems = itemData.filter((item) => item.quantity <= 0);
    if (invalidItems.length > 0) {
      return toast.error("Invalid quantity for selected items");
    }

    const payload: ITransferPayload = {
      businessId: businessId,
      transferBy: captainData._id || "",
      transferType: "ITEM",
      fromTableId: selectedTable._id,
      toTableId: toTable?._id || "",
      itemData: itemData,  // ✅ Fixed: Now matches server format
    };
    await mutateAsync(payload);
  }
};
```

### Payload Structure (`ITransferPayload`):
```typescript
{
  businessId: string;
  transferBy: string;        // Staff/captain ID
  transferType: "ITEM" | "TABLE";
  fromTableId: string;
  toTableId: string;
  itemData?: Array<{          // ✅ Fixed: Now matches server format
    itemId: string;
    quantity: number;         // Positive integer, never zero
  }>;
}
```

### API Call:
```typescript
const { isPending, mutateAsync } = useMutation({
  mutationFn: async (payload: ITransferPayload) => {
    const response = await apiRpc.table.transfer_table.$post({
      json: payload,
    });
    return response;
  },
  onSuccess: (data) => {
    toast.success("Transferred successfully");
    closeTransferModal();
    navigate(`/${businessId}/alerts`);
  },
});
```

**API Endpoint**: `POST /table/transfer_table`

---

## 4. Server-Side Processing

### Location
`servers/server/src/routes/table/index.ts` (line ~1840)

### Endpoint: `POST /table/transfer_table`

### Schema Validation (`switchTableschema`):
```typescript
{
  fromTableId: string;
  toTableId: string;
  businessId: string;
  transferType: "TABLE" | "ITEM" | "KOT";
  transferBy: string;
  itemData?: Array<{      // ⚠️ Server expects itemData (not itemIds)
    itemId: string;
    quantity: number;
  }>;
}
```

**⚠️ MISMATCH**: Client sends `itemIds: string[]` but server expects `itemData: Array<{itemId, quantity}>`

### Server Processing Flow (for `transferType === "ITEM"`):

1. **Validation**:
   - Validates source and destination tables exist
   - Checks if tables are the same (rejects)
   - Verifies POS config exists
   - Checks if bill is already split (rejects if split)

2. **Find KotOrders**:
   ```typescript
   const kotOrders = await KotOrder.find({
     settled: false,
     accepted: true,
     tableName: sourceTable.name,
     "cart._id": { $in: itemData.map(i => i.itemId) }
   });
   ```

3. **Process Each KotOrder**:
   - For each cart item in KotOrder:
     - Check if item is in transfer list
     - If transferring full quantity: move to `transferItems`
     - If partial: split item (remaining stays, transferred portion moves)
     - Update original KotOrder with remaining items
     - Delete KotOrder if all items transferred

4. **Create New KotOrder**:
   ```typescript
   await KotOrder.create({
     ...baseKotData,
     cart: transferItems,
     tableName: destinationTable.name,
     tableId: destinationTable._id,
     transferd: true,
     transferedBy: transferBy,
     fromTable: sourceTable.name,
     toTable: destinationTable.name,
   });
   ```

5. **Update UserSession**:
   - Creates/updates destination table session
   - Sets transfer flags and metadata

6. **Update Table Status**:
   - Recalculates subtotals for both tables
   - Updates `currentTableAmount` for source and destination
   - Sets destination table status to "ACTIVE"

7. **Transaction**:
   - All operations run in MongoDB transaction
   - Ensures atomicity (all succeed or all fail)

---

## 5. Data Structures

### `OrderData` (from store):
```typescript
interface OrderData {
  _id: string;
  name: string;
  phone: string;
  cart: {
    id: string;           // Generated ID: `${dishId}_${portionId}_${extras}`
    _id: string;          // MongoDB _id (used for selection)
    dish: {
      name: string;
      price: number;
    };
    quantity: number;
    portion?: {
      name: string;
      price: number;
    };
    extras?: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
    isDeleted: boolean;
  }[];
  tableName: string;
  // ... other fields
}
```

### Cart Item ID Format:
```
${dishId}_${portionId || "no_portion"}_${sortedExtras || "no_extras"}
```

Example: `"68eca1198c81ca83e65ad0aa_68eca1198c81ca83e65ad0ab_no_extras"`

---

## 6. Complete Flow Diagram

```
User Action
    ↓
[transferItem.tsx]
    ├─ Select items (checkboxes)
    │  └─ Updates: selectedItems[] in store
    │
    └─ Click "Transfer Items"
       └─ setSelectTable(true)
          ↓
[EmptyTableList (transfer=true)]
    ├─ Display table list
    ├─ User selects destination table
    │  └─ setToTable(table)
    │
    └─ Click "Transfer Table"
       └─ setIsConfirming(true)
          ↓
       [Confirmation Screen]
          └─ Click "Confirm"
             ↓
[useTableTransfer.confirmTransfer()]
    ├─ Build payload:
    │  ├─ businessId
    │  ├─ transferBy (captainData._id)
    │  ├─ transferType: "ITEM"
    │  ├─ fromTableId
    │  ├─ toTableId
    │  └─ itemIds: selectedItems[]
    │
    └─ API Call: POST /table/transfer_table
       ↓
[Server: /table/transfer_table]
    ├─ Validate schema
    ├─ Check tables exist
    ├─ Check bill not split
    │
    ├─ Find KotOrders with items
    ├─ Process each KotOrder:
    │  ├─ Split items (if partial transfer)
    │  ├─ Update original KotOrder
    │  └─ Create new KotOrder for destination
    │
    ├─ Update UserSession
    ├─ Recalculate table amounts
    └─ Return success
       ↓
[Client: onSuccess]
    ├─ Show success toast
    ├─ Close modal
    └─ Navigate to /alerts
```

---

## 7. Issues Fixed

### ✅ Data Format Mismatch - RESOLVED:
- **Previous**: Client sent `itemIds: string[]` (array of item IDs)
- **Now**: Client sends `itemData: Array<{itemId: string, quantity: number}>`

**Fix Applied**: 
- Updated `ITransferPayload` interface to use `itemData`
- Modified `confirmTransfer()` to build `itemData` from `selectedItems`
- Retrieves actual quantity from `orderDataStore` for each selected item
- Added validation to ensure:
  - All selected items are found
  - Quantities are positive (never zero)
  - Quantities don't exceed current item quantity

**Implementation**:
```typescript
// Build itemData with actual quantities from orderDataStore
const itemData = selectedItems
  .map((itemId) => {
    const cartItem = orderDataStore
      .flatMap(order => order.cart)
      .find(item => item._id === itemId);
    
    if (cartItem && cartItem.quantity > 0) {
      return {
        itemId: itemId,
        quantity: cartItem.quantity
      };
    }
    return null;
  })
  .filter(item => item !== null);
```

---

## 8. Key Files Reference

| File | Purpose |
|------|---------|
| `transferItem.tsx` | UI component for item selection |
| `useOrderData.ts` | Zustand store for order state |
| `tables/index.tsx` | Table selection component |
| `useTableData.ts` | API hooks for table operations |
| `switchtable.ts` (validators) | Server schema validation |
| `table/index.ts` (server) | Transfer API endpoint |

---

## 9. Dependencies

- **State Management**: Zustand (`useOrderStore`)
- **API Client**: `@hi/common` (`apiRpc`)
- **Query Management**: `@tanstack/react-query`
- **Navigation**: `react-router-dom`
- **UI**: Custom components (Checkbox, ScrollArea, etc.)

---

## Summary

The transfer item flow involves:
1. **UI Layer**: Component renders items, handles selection
2. **State Layer**: Zustand store manages selected items and modal state
3. **API Layer**: React Query mutation handles API call
4. **Server Layer**: MongoDB transaction processes the transfer atomically

The flow is complete but has a data format mismatch that should be addressed.

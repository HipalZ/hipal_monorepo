# Select-Menu Flow Analysis

This document analyzes the existing `select-menu` folder flow for dish, category, addon creation, and QuickMenu updates to understand patterns for menu-v2 implementation.

## Overview

The select-menu folder is located at:
- `app/business/[businessId]/select-menu/[menuId]/manager/index.tsx` - Main manager page
- `app/business/[businessId]/select-menu/[menuId]/dishandcat/index.tsx` - Dishes & Categories page

Both pages use the same component library (`components/templates/menu/*`) and follow similar patterns.

## Key Architecture Patterns

### 1. State Management

**Zustand Stores:**
- `useMenuPageStore` - Page navigation, modals, selected items
- `useDishesStore` - Global dishes cache
- `useCategoryStore` - Categories cache
- `useEditDishesStore` - QuickMenu edits (local edits before save)

**React Query:**
- All data fetching uses `useQuery`
- All mutations use `useMutation`
- Query invalidation after mutations

### 2. API Pattern

All API calls use `apiRpc` (Hono RPC client):

```typescript
// GET requests
apiRpc.dishes.$get({ query: { businessId, menuId } })
apiRpc.categories.$get({ query: { businessId, menuId, parent: "true" } })
apiRpc.addons.$get({ query: { businessId, menuId } })

// POST (Create)
apiRpc.dishes.$post({ json: payload })
apiRpc.categories.$post({ json: payload })
apiRpc.addons.$post({ json: payload })

// PUT (Update)
apiRpc.dishes[":id"].$put({ param: { id }, json: payload })
apiRpc.categories[":id"].$put({ param: { id }, json: payload })
apiRpc.addons[":id"].$put({ param: { id }, json: payload })

// DELETE
apiRpc.dishes[":id"].$delete({ param: { id }, json: {} })
apiRpc.categories[":id"].$delete({ param: { id }, json: {} })
apiRpc.addons[":id"].$delete({ param: { id }, json: {} })
```

### 3. Menu-Aware Queries

All queries accept `menuId` as optional:

```typescript
const updatedQuery = menuId
  ? { menuId, businessId }
  : { businessId };
```

This allows:
- Menu-specific data: Pass `menuId`
- Business-wide data: Omit `menuId`

## Dish Creation Flow

### Hook: `useDish.ts`

**Creation:**
```typescript
export async function postDishData(filteredPayload: any): Promise<any> {
  const dishResponse = await apiRpc.dishes.$post({
    json: filteredPayload,
  });
  return { data: await dishResponse.json(), dishResponse };
}
```

**Update:**
```typescript
export async function putDishData(filteredPayload: any): Promise<any> {
  const dishResponse = await apiRpc.dishes[":id"].$put({
    param: { id: filteredPayload._id },
    json: filteredPayload,
  });
  return { data: await dishResponse.json(), dishResponse };
}

export const useUpdateDish = () => {
  const { isPending, mutateAsync } = useMutation({
    mutationFn: async (payload) => {
      const { data, dishResponse } = await putDishData(payload);
      return { data, dishResponse };
    },
  });
  return { isPending, mutateAsync };
};
```

**Payload Structure:**
```typescript
{
  businessId: string,
  menuId: string,
  name: string,
  price: number,
  visibility: boolean,
  availability: boolean,
  dishTypes: string[], // ["VEG", "NON_VEG", etc.]
  description?: string,
  categoryIds: string[],
  portions?: Array<{ name, price, portionTypes, default }>,
  addOnIds?: string[],
  recommendationIds?: string[],
  tags?: string[],
  images?: string[],
  timings?: Timing[],
  avgPrepTime?: number,
  kitchenId?: string,
}
```

**Usage in Components:**
1. Collect form data into payload
2. Call `postDishData(payload)` or `putDishData(payload)`
3. On success (201/200):
   - Close modal (`setOpenMenu(false)`)
   - Reset stores
   - Invalidate queries: `queryClient.invalidateQueries({ queryKey: ["getAllDishes"] })`
   - Show success toast

## Category Creation Flow

### Hook: `useCategory.ts`

**Creation:**
```typescript
export const useSaveCategory = () => {
  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiRpc.categories.$post({ json: payload });
      return res.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success("Saved successfully");
        setOpenMenu(false);
        queryClient.invalidateQueries({ 
          queryKey: selectedCategory === "MAIN_CATEGORY" 
            ? ["getAllParentCategory"] 
            : ["getAllChildCategory"] 
        });
        resetStore();
      }
    },
  });
  return { mutate: mutateAsync, isPending };
};
```

**Payload Structure:**

**Parent Category:**
```typescript
{
  businessId: string,
  menuId: string,
  name: string,
  hierarchy: "PARENT",
  subCategoryIds?: string[], // Child categories
  timings?: Timing[],
  coverImage?: string,
}
```

**Child Category:**
```typescript
{
  businessId: string,
  menuId: string,
  name: string,
  hierarchy: "CHILD",
  parentCategoryIds: string[], // Parent category IDs
  dishIds?: string[], // Linked dishes
  timings?: Timing[],
  coverImage?: string,
}
```

**Key Points:**
- Uses `hierarchy` field: "PARENT" or "CHILD"
- Parent categories can have `subCategoryIds`
- Child categories have `parentCategoryIds` and optional `dishIds`

## Addon Creation Flow

### Hook: `useAddOn.ts`

**Creation:**
```typescript
export const useSaveAddOn = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (data: AddOnType) => {
      const response = await apiRpc.addons.$post({
        json: {
          businessId: data.businessId,
          name: data.name,
          dishIds: data.dishIds,
          choices: data.choices,
          choiceType: data.choiceType,
          addOnMaxQuantity: data.addOnMaxQuantity,
          compulsory: data.compulsory,
          menuId: data.menuId,
        },
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (!data.err) {
        toast.success(data.message);
        queryClient.invalidateQueries({ queryKey: ["getAllAddOn"] });
        resetStore();
        setOpenMenu(false);
      }
    },
  });
  return { mutate: mutateAsync, isPending };
};
```

**Payload Structure:**
```typescript
{
  businessId: string,
  menuId: string,
  name: string,
  dishIds?: string[], // Dishes this addon is linked to
  choices?: Array<{
    name: string,
    price: number,
    choiceMaxQuantity?: number,
    choiceDishType?: string[],
  }>,
  choiceType?: string,
  addOnMaxQuantity?: number,
  compulsory: boolean,
}
```

## QuickMenu (Quick Updates) Flow

### Component: `QuickMenu/index.tsx`

**Purpose:** Bulk edit dishes (name, price, availability, portions) without opening individual modals.

**Flow:**
1. **Local State (Zustand):** `useEditDishesStore` stores edited dishes temporarily
   ```typescript
   {
     editedDishes: Array<{
       _id: string,
       name?: string,
       price?: number,
       availability?: boolean,
       portions?: Array<{...}>,
     }>
   }
   ```

2. **Edit Handling:**
   ```typescript
   const handleEditField = (dishId, fieldName, value) => {
     addEditedDish({ _id: dishId, [fieldName]: value });
   };
   ```

3. **Batch Save:**
   ```typescript
   const handleSaveChoice = async () => {
     for (const dishPayload of editedDishes) {
       await mutateAsync(dishPayload); // useUpdateDish
     }
     refetch();
     refetchLinked();
     clearEditedDishes();
   };
   ```

**Key Features:**
- Shows dishes grouped by category (unlinked + linked)
- Inline editing (Input fields, Switch toggles)
- Portion expansion (expandable rows for dishes with portions)
- Duplicate name detection (highlights red)
- Search and category filter
- Only saves when "Save" button clicked

## Menu-Aware Data Flow

### Query Pattern:
```typescript
const updatedQuery = menuId
  ? { menuId, businessId }
  : { businessId };

const getAllDishes = async () => {
  const dishResponse = await apiRpc.dishes.$get({
    query: updatedQuery,
  });
  return (await dishResponse.json()).data;
};
```

**This means:**
- With `menuId`: Returns dishes linked to that menu
- Without `menuId`: Returns all dishes for the business

**Note:** The backend handles menu filtering via `menuId` query param. The frontend doesn't filter client-side - it relies on the API.

## UI Patterns

### Modal/Modal Flow:
1. Click "Add" button → Opens PopUp modal
2. Fill form → Submit → API call
3. Success → Close modal, refresh data, show toast

### Edit Flow:
1. Click edit icon → Opens PopUp modal with pre-filled data
2. Modify → Submit → API call
3. Success → Close modal, refresh data, show toast

### Navigation:
- Sidebar with tabs: Dishes, Main-category, Sub-category, Add On, Quick Menu
- Breadcrumbs: Menu Layouts > [Menu Name] > [Current Page]
- Mobile: Horizontal scrollable tabs

## Key Takeaways for Menu-V2

1. **Use same API endpoints** - `apiRpc.dishes.$post`, `apiRpc.categories.$post`, etc.
2. **Menu-aware queries** - Pass `menuId` when filtering by menu
3. **Zustand + React Query** - Zustand for UI state, React Query for server state
4. **Batch updates pattern** - Store edits locally, batch save on button click (like QuickMenu)
5. **Query invalidation** - Always invalidate queries after mutations
6. **Payload structure** - Follow the exact payload structures shown above
7. **Error handling** - Check `res.err` or `dishResponse.status`, show toast messages

## Integration with Menu-V2

For menu-v2's offline-first approach:
- **Bootstrap:** Use same GET endpoints to populate IndexedDB
- **Draft Ops:** Store mutations locally first, then batch push
- **Push Menu:** Batch all `draftOps` using the same POST/PUT endpoints
- **Payload format:** Must match exactly what the existing code expects

## QuickMenu Pattern for ALL Mode

QuickMenu's batch edit pattern is perfect for menu-v2's "ALL" mode:
- Store edits in local state (Zustand or IndexedDB)
- Batch apply to all matching dishes (by `nameKey`)
- Single save button triggers batch API calls

This aligns with `DraftOpsRepository.updateDishesByNameKey()` which we've already implemented.


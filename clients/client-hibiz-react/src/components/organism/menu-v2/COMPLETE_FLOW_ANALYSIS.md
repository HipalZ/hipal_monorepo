# Complete Flow Analysis: Dish, Category, Addon Creation/Edit/Delete

This document provides a comprehensive analysis of all CRUD operations for dishes, categories, and addons, including image upload, mapping relationships, and state management.

---

## Table of Contents

1. [State Management Architecture](#state-management-architecture)
2. [Image Upload Flow](#image-upload-flow)
3. [Dish Creation Flow](#dish-creation-flow)
4. [Dish Edit Flow](#dish-edit-flow)
5. [Dish Delete Flow](#dish-delete-flow)
6. [Category Creation Flow](#category-creation-flow)
7. [Category Edit Flow](#category-edit-flow)
8. [Category Delete Flow](#category-delete-flow)
9. [Addon Creation Flow](#addon-creation-flow)
10. [Addon Edit Flow](#addon-edit-flow)
11. [Addon Delete Flow](#addon-delete-flow)
12. [Mapping Relationships](#mapping-relationships)
13. [Key Patterns & Best Practices](#key-patterns--best-practices)

---

## State Management Architecture

### Zustand Stores

**`useMenuPageStore`** - Main navigation and form state:
```typescript
{
  // Navigation
  selectedPage: "DISHES" | "MAIN_CATEGORY" | "SUB_CATEGORY" | "ADD_ON" | "QUICK_MENU"
  dishStep: "DISH_STEP_1" | "DISH_STEP_2" | "PORTION_STEP" | "LINK_CATEGORY_STEP" | ...
  categoryStep: "CATEGORY_STEP_1" | "CATEGORY_STEP_2" | "LINK_MAIN_CATEGORY" | ...
  addOnToggle: "ADD_ON" | "ADD_CHOICE" | "LINK_DISHES" | "EDIT_ADDON" | "BULK_UPLOAD"
  
  // Modals
  openMenu: boolean
  editOpenMenu: boolean
  
  // Dish form state
  dishName, dishPrice, dishTypes, dishDescription
  portions: Array<{name, price, portionTypes, default}>
  selectedCatIds: string[]
  addonIds: string[]
  recommendationIds: string[]
  tags: string[]
  imageFiles: {first, second, third}
  imagePreviews: {first, second, third}
  cropping: {image, key}
  
  // Category form state
  categoryName
  selectIds: string[]
  selectSingleParentCat: string[]
  imagePreview, selectedFile
  
  // Addon form state
  addOnName
  choices: Array<{uuid, name, price, choiceMaxQuantity, choiceDishType}>
  minChoices, maxChoices
  addOnChoice: "SINGLE" | "MULTIPLE"
  
  // Edit state
  editDish, catId, addOnId
  editingMainCat, editingSubCat
  isCatDelete: boolean
}
```

**`useDishesStore`** - Global dishes cache:
```typescript
{
  dishes: DishType[]
  setDishes: (dishes) => void
}
```

**`useCategoryStore`** - Global categories cache:
```typescript
{
  categories: CategoryType[]
  subCategories: CategoryType[]
  setCategories: (categories) => void
  setSubCategories: (subCategories) => void
}
```

---

## Image Upload Flow

### Image Upload Function: `storeImageAfterSave`

**Location:** `components/utils/helper.ts` or `components/uploadAdmin/imageUpload.ts`

**Process:**
```typescript
async function storeImageAfterSave(
  image: File,
  imagePreview: string | null, // Base64 data URL
  setIsLoading?: (loading: boolean) => void
): Promise<string | null> {
  // 1. Validate file type (PNG, JPEG, JPG, GIF, WEBP)
  // 2. Extract base64 data from preview (after comma)
  // 3. Convert base64 to Blob
  // 4. Create FormData with:
  //    - fileData: Blob
  //    - fileName: crypto.randomUUID()
  //    - bucketName: "assets"
  // 5. POST to: https://storage.test.hipalz.com/upload
  // 6. Return response.data.url (image URL string)
}
```

**Usage in Components:**
```typescript
// For dishes (up to 3 images)
let firstImage: string | undefined;
if (imagePreviews?.first !== '') {
  firstImage = await storeImageAfterSave(
    imageFiles?.first as File,
    imagePreviews?.first as string,
    setIsLoading
  );
}
const images: string[] = [firstImage, secondImage, thirdImage].filter(Boolean);

// For categories (1 cover image)
let imageUrl = '';
if (selectedFile) {
  imageUrl = await storeImageAfterSave(selectedFile, imagePreview, setIsLoading);
}
```

**Image Compression (Categories):**
- Max dimensions: 500x500px
- Format: JPEG, quality: 0.9
- Uses Canvas API to resize before upload

---

## Dish Creation Flow

### Multi-Step Form Navigation

**Steps:**
1. `DISH_STEP_1` - Basic info (name, price, dishTypes, description, kitchen)
2. `DISH_STEP_2` - Images, timings, calories, recommendations, tags
3. `PORTION_STEP` - Add portions (optional)
4. `LINK_CATEGORY_STEP` - Link to categories
5. `LINK_ADDON_STEP` - Link to addons

### Step 1: Basic Information

**Component:** `dishStepOne.tsx`

**Fields:**
- Name (3-50 chars)
- Price (number)
- Dish Types (multi-select: VEG, NON_VEG, EGG, etc.)
- Description
- Kitchen selection
- Portions (can add more here or in PORTION_STEP)

**Portion Logic:**
- If portions exist: POS uses `portion.price`, not `dish.price`
- Portion structure: `{name, price, portionTypes: [DishType], default: boolean}`

### Step 2: Additional Details

**Component:** `dishStepTwo.tsx`

**Fields:**
- Images (up to 3): Uses image cropper (`EasyReactCropper`)
  - Click image slot → Opens cropper
  - Crop & save → Stores file and preview in state
  - On submit: Uploads all images via `storeImageAfterSave`
- Timings: Day + start/end time slots
- Calories
- Recommendations (other dishes)
- Tags

**Image Cropper Flow:**
```typescript
// 1. User clicks image slot
setCropping({image: previewUrl, key: 'first'})
setDishStep('SHOW_CROPPER')

// 2. User crops and saves
const croppedArea = cropperRef.current.getCroppedAreaPixels()
const croppedImage = await getCroppedImg(image, croppedArea)
setImagePreviews({...imagePreviews, first: croppedImage})
setImageFiles({...imageFiles, first: file})
setDishStep('DISH_STEP_2')

// 3. On form submit, upload all images
```

### Submission

**Payload Structure:**
```typescript
{
  businessId: string,
  menuId: string,
  name: string,
  price: number,
  visibility: boolean,
  availability: boolean,
  dishTypes: string[], // ["VEG", "NON_VEG"]
  description?: string,
  categoryIds: string[],
  portions?: Array<{
    name: string,
    price: number,
    portionTypes: string[],
    default: boolean
  }>,
  addOnIds?: string[],
  recommendationIds?: string[],
  tags?: string[],
  images?: string[], // Array of uploaded image URLs
  timings?: Array<{day: number, start: number, end: number}>,
  avgPrepTime?: number,
  kitchenId?: string,
  calories?: string
}
```

**API Call:**
```typescript
const { data, dishResponse } = await postDishData(filteredPayload);
// apiRpc.dishes.$post({ json: payload })
```

**After Success:**
1. Reset all stores
2. Close modal (`setOpenMenu(false)`)
3. Invalidate queries: `queryClient.invalidateQueries({ queryKey: ['getAllDishes'] })`
4. Show success toast

---

## Dish Edit Flow

### Component: `EditDish` (Router)

**Navigation:**
- Same steps as creation, but pre-filled with existing data
- Can navigate between steps via header back button

### Edit Specifics

**Component:** `dishStepOne.tsx` (edit mode)

**Key Differences:**
- Pre-populates all fields from `editDish` (from store)
- For images: If image exists and not changed, uses existing URL
- Update function: `putDishData` instead of `postDishData`

**Image Update Logic:**
```typescript
let firstImage: string = editDish?.images?.[0] ?? '';
// If new file selected, upload; otherwise keep existing
firstImage = await updateImage(
  imageFiles?.first as File,
  imagePreviews?.first as string,
  firstImage
) as string;
```

**Payload for Update:**
```typescript
{
  _id: string, // Required for update
  ...allFields,
  removeCategoryIds?: string[], // IDs to unlink
  removeAddOnIds?: string[],
  removeRecommendationIds?: string[]
}
```

**API Call:**
```typescript
const { data, dishResponse } = await putDishData(filteredPayload);
// apiRpc.dishes[":id"].$put({
//   param: { id: filteredPayload._id },
//   json: payload
// })
```

---

## Dish Delete Flow

### Component: `DeleteDish`

**Process:**
1. User clicks delete button in edit form
2. Sets `dishStep = 'CONFIRM_DELETE'`
3. Shows confirmation modal
4. On confirm, calls `deleteDishData(id)`

**API Call:**
```typescript
const { data, dishResponse } = await deleteDishData(editDish._id);
// apiRpc.dishes[":id"].$delete({
//   param: { id },
//   json: {}
// })
```

**After Success:**
1. Reset stores
2. Refetch dishes
3. Close modal
4. Show success toast

---

## Category Creation Flow

### Two Types of Categories

1. **Parent Category** (`hierarchy: "PARENT"`):
   - Can have child categories (`subCategoryIds`)
   - Cannot have dishes directly

2. **Child Category** (`hierarchy: "CHILD"`):
   - Must have parent (`parentCategoryIds`)
   - Can have dishes (`dishIds`)

### Step Flow

**Steps:**
1. `CATEGORY_STEP_1` - Name, hierarchy, linking
2. `CATEGORY_STEP_2` - Cover image (optional)
3. `LINK_MAIN_CATEGORY` - Link sub-categories (if parent)
4. `LINK_SUB_CATEGORY` - Link parent (if child)
5. `LINK_DISH` - Link dishes (if child)

### Step 1: Basic Information

**Component:** `categoryMainForm.tsx`

**Fields:**
- Name (required)
- Timings (day + start/end slots)
  - Special: "All day" slot (day: -1, start: 0, end: 1440)
  - If "All day" exists, it's the only slot allowed

**Payload (Parent):**
```typescript
{
  name: string,
  businessId: string,
  menuId: string,
  hierarchy: "PARENT",
  subCategoryIds: string[], // Child categories to link
  timings: Array<{day: number, start: number, end: number}>
}
```

**Payload (Child):**
```typescript
{
  name: string,
  businessId: string,
  menuId: string,
  hierarchy: "CHILD",
  parentCategoryIds: string[], // Parent category IDs
  dishIds: string[], // Dishes to link
  timings: Array<{day: number, start: number, end: number}>
}
```

### Step 2: Cover Image

**Component:** `addCatImage.tsx`

**Image Upload:**
- Single image (cover image)
- Compression: Max 500x500px, JPEG quality 0.9
- Uses same `storeImageAfterSave` function

**Final Payload:**
```typescript
{
  ...step1Fields,
  coverImage?: string // Uploaded image URL
}
```

**API Call:**
```typescript
const { mutate, isPending } = useSaveCategory();
// apiRpc.categories.$post({ json: payload })
```

---

## Category Edit Flow

### Component: `editCategory.tsx`

**Fields Editable:**
- Name
- Cover image (can replace)
- Visibility toggle
- Timings (add/remove slots)
- Linked categories (parent/sub)
- Linked dishes (if child category)

**Removal Tracking:**
```typescript
// Tracks which IDs to remove
const removedCatIds = getRemovedIds(
  idCheck, // Original IDs
  selectIds // Current selected IDs
);
```

**Update Payload:**
```typescript
{
  _id: string,
  name: string,
  businessId: string,
  menuId: string,
  coverImage: string,
  visibility: boolean,
  timings: Array<{day, start, end}>,
  
  // For Parent Category:
  subCategoryIds: string[],
  removeSubCategoryIds: string[], // IDs to unlink
  
  // For Child Category:
  parentCategoryIds: string[],
  removeParentCategoryIds: string[],
  dishIds: string[],
  removeDishIds: string[]
}
```

**API Call:**
```typescript
const { mutate, isPending } = useUpdateCategory();
// apiRpc.categories[":id"].$put({
//   param: { id: payload._id },
//   json: payload
// })
```

---

## Category Delete Flow

### Component: `editCategory.tsx` (delete mode)

**Process:**
1. User clicks delete button
2. Sets `isCatDelete = true`
3. Shows confirmation footer buttons
4. On confirm, calls `deleteCat(catId)`

**API Call:**
```typescript
const { mutate: deleteCat, isPending } = useDeleteCategory();
// apiRpc.categories[":id"].$delete({
//   param: { id },
//   json: {}
// })
```

**After Success:**
- Invalidate queries based on hierarchy:
  - Parent: `queryClient.invalidateQueries({ queryKey: ["getAllParentCategory"] })`
  - Child: `queryClient.invalidateQueries({ queryKey: ["getAllChildCategory"] })`
- Reset store and close modal

---

## Addon Creation Flow

### Step Flow

**Steps:**
1. `ADD_ON` - Basic info (name, min/max choices, choice type)
2. `ADD_CHOICE` - Add choice items (can return multiple times)
3. `LINK_DISHES` - Link addon to dishes

### Step 1: Basic Information

**Component:** `createAddon.tsx`

**Fields:**
- Name (required)
- Choice Type: `"SINGLE"` or `"MULTIPLE"`
- Max Choices (required, > 0)
- Min Choices (default: 0, must be ≤ max)

**Validation:**
- Name required
- Max choices > 0 required
- Min choices ≤ max choices

### Step 2: Add Choices

**Component:** `addChoice.tsx`

**Choice Structure:**
```typescript
{
  uuid: string, // Unique ID for local state
  name: string,
  price: number,
  description?: string,
  visibility: boolean,
  availability: boolean,
  choiceMaxQuantity?: number,
  choiceDishType?: string[] // Which dish types this choice applies to
}
```

**Features:**
- Can add up to MAX_CHOICES_COUNT choices
- Each choice can have dish type restrictions
- Toggle visibility/availability per choice
- Validation: All choices must have name and price

**Validation Function:**
```typescript
const validateAllChoices = () => {
  return choices.every(c => c.name && c.price > 0);
};
```

### Step 3: Link Dishes (Optional)

**Component:** `LinkItems` (reused from dish)

**Process:**
- Shows all dishes
- User selects which dishes this addon applies to
- Stores in `recommendationIds` (shared state key)

### Final Payload

```typescript
{
  name: string,
  choices: Array<{
    name: string,
    price: number,
    choiceMaxQuantity?: number,
    choiceDishType?: string[],
    description?: string,
    visibility?: boolean,
    availability?: boolean
  }>,
  choiceType: "SINGLE" | "MULTIPLE",
  addOnMaxQuantity: number,
  compulsory: number, // Min choices (stored as "compulsory" field)
  businessId: string,
  menuId: string,
  dishIds?: string[] // Linked dishes
}
```

**API Call:**
```typescript
const { mutate: saveAddOn, isPending } = useSaveAddOn();
// apiRpc.addons.$post({ json: payload })
```

---

## Addon Edit Flow

### Component: `editAddon.tsx`

**Fields Editable:**
- Name
- Availability
- Visibility
- Choice Type
- Min/Max Choices
- Choices (can add/remove)
- Linked dishes

**Removal Tracking:**
```typescript
const removeDishIds = getRemovedIds(
  removeRecommendationIds, // Original dish IDs
  recommendationIds // Current selected dish IDs
);
```

**Update Payload:**
```typescript
{
  _id: string,
  name: string,
  choices: Array<Choice>,
  choiceType: string,
  availability: boolean,
  visibility: boolean,
  compulsory: number,
  addOnMaxQuantity: number,
  businessId: string,
  menuId: string,
  dishIds: string[], // New linked dishes
  removeDishIds: string[] // Dishes to unlink
}
```

**API Call:**
```typescript
const { mutate: updateAddon, isPending } = useUpdateAddon();
// apiRpc.addons[":id"].$put({
//   param: { id: data._id },
//   json: payload
// })
```

---

## Addon Delete Flow

### Component: `editAddon.tsx` (delete mode)

**Process:**
1. User clicks delete button
2. Shows confirmation
3. Calls `deleteAddon(addOnId)`

**API Call:**
```typescript
const { mutate: deleteAddon, isPending } = useDeleteAddon();
// apiRpc.addons[":id"].$delete({
//   param: { id },
//   json: {}
// })
```

---

## Mapping Relationships

### How Items Are Linked

#### 1. Dish ↔ Category

**Linking Component:** `LinkItems.tsx`

**Process:**
```typescript
// When linking dishes to category:
- Shows all dishes (via useDishes())
- User selects/dis-selects dishes
- Stores selected IDs in tempIds
- On save: Sets recommendationIds = tempIds (for child category)
- Payload: { dishIds: recommendationIds }

// When linking categories to dish:
- Shows all child categories (via useChildCategories())
- User selects/dis-selects categories
- Stores in selectedCatIds
- Payload: { categoryIds: selectedCatIds }
```

**Bidirectional:**
- Dish has `categoryIds: string[]`
- Category (child) has `dishIds: string[]`
- Backend maintains both relationships

#### 2. Category ↔ Category (Parent-Child)

**Linking Component:** `selectCategory.tsx` or `selectSubCategory.tsx`

**For Parent Category:**
```typescript
- Shows all child categories
- User selects which children belong to this parent
- Payload: { subCategoryIds: selectIds }
```

**For Child Category:**
```typescript
- Shows all parent categories
- User selects parent (single select)
- Payload: { parentCategoryIds: [parentId] }
```

#### 3. Dish ↔ Addon

**Linking Component:** `LinkItems.tsx` (reused)

**Process:**
```typescript
- Shows all dishes
- User selects which dishes this addon applies to
- Stores in recommendationIds (shared key)
- Payload: { dishIds: recommendationIds }
```

#### 4. Dish ↔ Recommendations

**Linking Component:** `LinkItems.tsx`

**Process:**
```typescript
- Shows all dishes (excluding current dish)
- User selects recommended dishes
- Payload: { recommendationIds: tempIds }
```

### Removal Logic

**Pattern:**
```typescript
const getRemovedIds = (prevIds: string[], newIds: string[]) => {
  return prevIds.filter((id) => !newIds.includes(id));
};

// On update:
const removeCategoryIds = getRemovedIds(
  originalCategoryIds, // From editDish
  selectedCatIds // Current selection
);

// Include in payload:
{
  categoryIds: selectedCatIds, // Add these
  removeCategoryIds: removeCategoryIds // Remove these
}
```

---

## Key Patterns & Best Practices

### 1. Form State Management

**Pattern:** Zustand for form state, React Query for server state

```typescript
// Form data in Zustand
const dishName = useMenuPageStore((s) => s.dishName);

// Server data via React Query
const { data: dishes } = useDishes();
```

### 2. Multi-Step Forms

**Pattern:** Step-based navigation with back button handling

```typescript
const goBack = useCallback(() => {
  switch (dishStep) {
    case 'DISH_STEP_2':
      setDishStep('DISH_STEP_1');
      break;
    // ...
  }
}, [dishStep]);
```

### 3. Image Handling

**Pattern:** Store file + preview, upload on submit

```typescript
// Local state
const [imageFiles, setImageFiles] = useState({first: null, second: null, third: null});
const [imagePreviews, setImagePreviews] = useState({first: '', second: '', third: ''});

// On submit
const images = await Promise.all([
  storeImageAfterSave(imageFiles.first, imagePreviews.first),
  // ...
]);
```

### 4. Query Invalidation

**Pattern:** Always invalidate after mutations

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['getAllDishes'] });
  // Refetch data to show updates
}
```

### 5. Error Handling

**Pattern:** Toast notifications + error state

```typescript
if (dishResponse?.status === 400) {
  if (Array.isArray(data?.error?.issues)) {
    errorToasts(data?.error); // Show field-specific errors
  } else {
    toast.error(data?.message); // Show general error
  }
}
```

### 6. Loading States

**Pattern:** Separate loading for upload vs. API

```typescript
const [isLoading, setIsLoading] = useState(false); // For image upload
const { isPending } = useMutation(...); // For API calls

// Show spinner when either is loading
if (isLoading || isPending) return <LoadingSpinner />;
```

### 7. Payload Filtering

**Pattern:** Remove undefined/null fields before sending

```typescript
const filterPayload = (payload: any) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([_, v]) => v !== undefined && v !== null)
  );
};
```

### 8. Portion Price Rule

**Critical Rule:**
- If dish has portions: POS uses `portion.price`, ignore `dish.price`
- If dish has no portions: POS uses `dish.price`
- When updating price in QuickMenu: If portions exist, update first portion's price

---

## Integration Notes for Menu-V2

1. **Bootstrap:** Use same GET endpoints to populate IndexedDB
2. **Draft Ops:** Store all mutations locally first (create/update/delete)
3. **Push Menu:** Batch `draftOps` using same POST/PUT/DELETE endpoints
4. **Payload Format:** Must match exactly what existing code expects
5. **Image Upload:** Store image URLs in IndexedDB after upload
6. **Relationships:** Maintain both directions (dish.categoryIds ↔ category.dishIds)
7. **Removal Tracking:** Include `removeXxxIds` arrays in update payloads

---

This documentation should serve as the complete reference for understanding how all menu management operations work in the existing codebase.


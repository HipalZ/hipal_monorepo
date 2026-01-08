# Offline-First Menu Management (Menu V2)

This module implements a high-performance, offline-first menu management system for Hibiz. It is designed to handle large datasets (1200+ dishes) efficiently using IndexedDB (Dexie), while supporting multi-menu businesses and a powerful ALL (bulk update) mode.

## 🎨 Design System: Brutalist UI

Menu V2 uses a **brutalist design system** with hard shadows, bold borders, and zero radius:

### Color Palette
- **Primary Brand:** `#FFEB3B` (Electric Yellow) - Primary actions, highlights, active states
- **Background:** `#F3F4F6` (Raw Concrete Gray) - Main app background
- **Surface:** `#FFFFFF` (Stark White) - Card backgrounds
- **Borders & Text:** `#000000` (Pure Black) - All borders and text (no grays)
- **Alert:** `#FF4444` (Red) - Critical warnings/errors
- **Success:** `#00C853` (Green) - Positive feedback

### Shape & Depth
- **Border Radius:** `0px` (strictly rectangular)
- **Border Width:** `3px solid black` on all Cards, Buttons, Inputs
- **Shadows:** Hard offset shadows only (NO blur):
  - Default: `box-shadow: 4px 4px 0px 0px #000000`
  - Hover: `box-shadow: 2px 2px 0px 0px #000000` (snaps closer)
  - Active/Click: `box-shadow: 0px 0px 0px 0px #000000` (flat)

### Typography
- **Headings:** `Archivo Black` or `Inter-Black` (Weight 900), UPPERCASE
- **Data/Numbers:** `JetBrains Mono` or `Roboto Mono`
- **Body:** `Inter` (Bold/Semi-Bold, Weight 600-700)

### Iconography
- **Library:** `lucide-react`
- **Style:** Stroke width `2.5px` or `3px`, Color: Black

### CSS Classes
All brutalist styles are defined in `styles/brutalist.css`:
- `.brutal-card` - Card with hard shadow
- `.brutal-button` - Button with hard shadow (white bg)
- `.brutal-button-primary` - Primary button (yellow bg)
- `.brutal-input` - Input field with hard shadow
- `.brutal-heading` - Heading text (Archivo Black, uppercase)
- `.brutal-data` - Data/number text (monospace)
- `.brutal-body` - Body text (Inter, semi-bold)
- `.brutal-icon` - Icon styling (2.5px stroke, black)
- `.brutal-table-header` - Table header (black bg, white text)
- `.brutal-table-row` - Table row with hover effect
- `.brutal-badge` - Badge styling
- `.brutal-badge-yellow` - Yellow badge
- `.brutal-active` - Active state (yellow background)
- `.brutal-sidebar` - Sidebar styling

## 🏗 Architecture

### Code Structure & Organization

The codebase follows a **modular, tree-shakable architecture** with proper TypeScript types and reusable components:

```
src/components/organism/menu-v2/
├── types/
│   └── index.ts                          # All TypeScript type definitions (no 'any' types)
├── styles/
│   └── brutalist.css                     # Brutalist design system CSS utilities
├── db/
│   ├── menu.database.ts                  # Dexie schema definition
│   ├── DraftOpsRepository.ts            # Draft operations repository (type-safe)
│   └── PendingImagesRepository.ts       # Pending images repository
├── hooks/
│   ├── useMenuBootstrap.ts              # Initial data loading
│   ├── useMenuPush.ts                   # Sync draft ops to server (with image deduplication)
│   ├── useDraftOpsSync.ts               # Draft ops + pending images state sync
│   ├── useMenuViewData.ts               # Centralized menu-aware data fetching
│   └── useImageSync.ts                  # Global image synchronization for shared dishes
├── utils/
│   ├── imageMatcher.ts                  # Image filename to dish name matching engine
│   ├── dateFormatter.ts                 # Date formatting utility (23rd Jan format)
│   └── batchUtils.ts                    # Batching utilities (chunk writes, controlled concurrency)
├── store/
│   └── useMenuUIStore.ts                # Lightweight Zustand UI state
└── components/
    ├── ItemsPanel.tsx                   # Main dishes panel (brutalist styled)
    ├── CategoriesPanel.tsx              # Main categories panel (brutalist styled)
    ├── AddonsPanel.tsx                  # Main addons panel (brutalist styled)
    ├── MenuSwitcher.tsx                 # Menu selection dropdown (brutalist styled)
    ├── MenuHeader.tsx                   # Page header with breadcrumbs
    ├── MenuSidebar.tsx                  # Sidebar navigation
    ├── DishRow.tsx                      # Reusable dish row component (brutalist styled)
    ├── CategoryRow.tsx                  # Reusable category row component (brutalist styled)
    ├── ParentCategoryRow.tsx            # Reusable parent category row (brutalist styled)
    ├── AddonRow.tsx                     # Reusable addon row component (brutalist styled)
    ├── modals/
    │   ├── DishEditModal.tsx            # Reusable dish edit modal (brutalist styled)
    │   ├── CategoryEditModal.tsx        # Reusable category edit modal (brutalist styled)
    │   ├── AddonEditModal.tsx           # Reusable addon edit modal (brutalist styled)
    │   ├── PriceAdjustmentModal.tsx     # Bulk price adjustment modal (brutalist styled)
    │   └── AvailabilityVisibilityModal.tsx # Bulk availability/visibility modal (brutalist styled)
    ├── ImageUploadModal.tsx             # Individual image upload modal (brutalist styled)
    ├── BulkImageUploadModal.tsx         # Bulk image upload with Web Worker (brutalist styled)
    ├── SharedDishConfirmModal.tsx       # Confirmation modal for shared dish updates
    ├── SaveProgressModal.tsx            # Local save progress modal (brutalist styled)
    ├── PushProgressModal.tsx            # Push menu progress tracking modal (brutalist styled)
    ├── QuickMenuPanel.tsx               # Quick menu update panel with neo-brutalist styling
    ├── VirtualizedDishTable.tsx         # Virtualized table (future enhancement)
    ├── modals/
    │   ├── ExistingImagesPickerModal.tsx # Picker for reusing existing images (brutalist styled)
    │   ├── DishEditModal.tsx            # Reusable dish edit modal (brutalist styled)
    │   ├── CategoryEditModal.tsx        # Reusable category edit modal (brutalist styled)
    │   ├── AddonEditModal.tsx           # Reusable addon edit modal (brutalist styled)
    │   ├── PriceAdjustmentModal.tsx     # Bulk price adjustment modal (brutalist styled)
    │   └── AvailabilityVisibilityModal.tsx # Bulk availability/visibility modal (brutalist styled)
    └── workers/
        └── image.worker.js              # Web Worker for image processing
```

### Type Safety

**All components use proper TypeScript types** - no `any` types are used:

- `types/index.ts` - Centralized type definitions:
  - `MenuDish`, `MenuCategory`, `MenuAddon`, `MenuLayout` - Extended entity types
  - `DishUpdatePayload`, `CategoryUpdatePayload`, `AddonUpdatePayload` - Update payload types
  - `Portion`, `AddonChoice` - Nested entity types
  - `IDraftOp`, `IPendingImage` - Database operation types
  - All component prop interfaces

### Component Architecture

**Tree-shakable and optimized:**

1. **Reusable Row Components**: `DishRow`, `CategoryRow`, `AddonRow`, `ParentCategoryRow`
   - Memoized with `React.memo` for performance
   - Single responsibility: display and handle actions for one entity
   - Accept typed props interfaces

2. **Reusable Modal Components (V2)**: All modals use `PopUp` component and support **Create & Edit** modes
   - `DishModalV2` - Unified modal for creating/editing dishes
     - Supports **Tags** and **Recommendations** linking
     - Handles **Portions** and **Addon/Category** linking
     - Bulk update support in ALL mode
   - `CategoryModalV2` - Unified modal for categories
     - Supports **Parent/Child** hierarchy selection
     - Image upload and visibility toggles
   - `AddonModalV2` - Unified modal for addons
     - Supports **NUMBER** (Counter) and **CHECKBOX** (Selection) choice types
     - Min/Max validation and choice management
   - All modals follow consistent structure and styling

3. **Panel Components**: Main containers that compose reusable components
   - `ItemsPanel` - Composes `DishRow` and `DishEditModal`
   - `CategoriesPanel` - Composes `CategoryRow`, `ParentCategoryRow`, and `CategoryEditModal`
   - `AddonsPanel` - Composes `AddonRow` and `AddonEditModal`

### Data Layer (IndexedDB + Dexie)

**IndexedDB** (via Dexie) is the single source of truth for UI reads and writes.

- **Database**: `MenuDatabase`
  - `src/components/organism/menu-v2/db/menu.database.ts`

**Tables** (Type-safe schema)

- **menus** - Menu layouts (`MenuLayout[]`)
- **categories** - Category documents with `menuId` and `nameKey` (`MenuCategory[]`)
- **dishes** - Dish documents with `menuId` and `nameKey` (`MenuDish[]`)
- **addons** - Addon documents with `menuId` and `nameKey` (`MenuAddon[]`)
- **draftOps** - Append-only queue of local changes (`IDraftOp[]`)
- **pendingImages** - Pending image uploads (`IPendingImage[]`)

### State Management (Zustand)

Zustand holds only lightweight UI state and sync status.

- **Store**: `useMenuUIStore`

**State**
- `activeTab`: `"DISHES" | "CATEGORIES" | "ADDONS"`
- `selectedMenuId`: `"ALL" | menuId`
- `isSidebarOpen`
- `draftOpsCount`, `isDirty`
- `lastPulledAt`, `lastPushedAt`
- **Merge Mode State**:
  - `mergeMode: boolean` - Whether merge mode is active
  - `mergedMenuIds: string[]` - Array of menu IDs being merged

**Actions**
- `setMergeMode(enabled: boolean)` - Enable/disable merge mode
- `setMergedMenuIds(ids: string[])` - Set which menus are merged

**Important**: Large datasets must not be stored in Zustand/localStorage.

### ✅ Server Data Model (Important Constraints)

**Menus (menuType)**
- `menuType = 1`: Parent Category → Subcategory → Dishes
- `menuType = 2`: Subcategory → Dishes (no parent categories)

**Categories (hierarchy)**
- `hierarchy = "PARENT"` = main category
- `hierarchy = "CHILD"` = subcategory
- `parentId` / `parentCategoryIds[]` = parent reference

**Dishes**
- Dishes are always linked only to CHILD categories
- Dish includes:
  - `menuId`
  - `categoryIds[]` (subcategory IDs only)
  - `addOnIds[]`
  - `portions[]` (optional)
  - `nameKey` (computed for bulk operations)

**Addons**
- Addons can have parent/child hierarchy
- Addon includes:
  - `menuId`
  - `dishIds[]`
  - `choices[]`
  - `parentId` (if child of an addon group)
  - `nameKey` (computed for bulk operations)

✅ **Because menuId is embedded in every document, menu switching must be implemented by querying IndexedDB filtered by menuId. No external mapping endpoints are required for correct filtering.**

### 🔁 Sync Strategy (Draft Operations)

**Bootstrap (Pull)**

`useMenuBootstrap` fetches menus, categories, dishes, addons and populates IndexedDB.

**Edit (Local)**

UI writes updates directly into IndexedDB and logs a `draftOp` via `DraftOpsRepository`:

```typescript
// Type-safe update methods
DraftOpsRepository.updateDishFields(dishId, businessId, { availability, visibility, price });
DraftOpsRepository.updateCategory(categoryId, businessId, { name, visibility });
DraftOpsRepository.updateAddon(addonId, businessId, { name, availability, choices });
```

**Push (Sync)**

`useMenuPush` reads `draftOps` and pending images:
1. **Image Upload**: Uploads all pending images first with deduplication
   - Same image content uploaded once, URL reused for all dish instances
   - Prevents duplicate uploads for shared dishes
   - Shows progress: "Uploaded X images (Y unique)"
2. **Draft Operations**: Pushes minimal updates to server (dish/category/addon PUT)
3. **Cleanup**: Clears `draftOps` and `pendingImages` only after full success

**Important**: Push menu button activates when there are draft ops OR pending images.

## 🧠 Key Feature: ALL vs Menu-Specific Editing & Merge Mode

### Menu Switcher (selectedMenuId)

The UI has a dropdown like the reference POS:
- **ALL** - Shows empty state unless Merge Mode is active
- Base Menu / Dine In / Swiggy / etc. (each is a menuId)

### Menu-Specific View

If `selectedMenuId = menuId`:
- Dishes, categories, addons are displayed by filtering: `businessId + menuId`
- Categories filtered by `menuType`:
  - `menuType = 1`: Show parent + child categories
  - `menuType = 2`: Show only child categories
- Any edit applies only to that menu's documents.
- "ADD ITEM" button is enabled.

### Merge Mode (Multi-Menu Editing)

**Activation**: Click "MERGE" button in MenuSwitcher → Select 2+ menus → Confirm

**State Management** (`useMenuUIStore`):
- `mergeMode: boolean` - Whether merge mode is active
- `mergedMenuIds: string[]` - Array of menu IDs being merged
- When merge mode is active, `selectedMenuId` is set to `'ALL'`

**How It Works**:
1. **Activation Flow**:
   - User clicks "MERGE" button in MenuSwitcher
   - `MergeMenusModal` opens
   - User selects 2+ menus (multi-select checkboxes)
   - On confirm: `setMergeMode(true)`, `setMergedMenuIds([...selectedIds])`, `setSelectedMenuId('ALL')`
   - Display shows: "MERGED: [Menu1]+[Menu2]+..."

2. **Data Filtering** (`useMenuViewData`):
   ```typescript
   const effectiveMenuIds = useMemo(() => {
     if (selectedMenuId === "ALL") {
       if (mergeMode) return mergedMenuIds; // Use merged menu IDs
       return []; // Empty if ALL and not merged
     }
     return [selectedMenuId]; // Single menu
   }, [selectedMenuId, mergeMode, mergedMenuIds]);
   ```
   - Dishes/categories/addons are filtered by `effectiveMenuIds`
   - Only dishes from merged menus are displayed

3. **Grouping by nameKey**:
   - `dishesGroupedByNameKey: Map<string, MenuDish[]>` - Groups dishes by normalized name
   - Only computed when `mergeMode === true`
   - Used to find matching dishes across merged menus

4. **Editing Behavior** (`DishModalV2`):
   - **Edit Mode**:
     - When editing a dish that exists in multiple merged menus:
       - `matchingDishes` finds all dishes with same `nameKey`
       - Shows checkbox: "APPLY TO MERGED MENUS (X ITEMS)"
       - If checked (`applyToMerged = true`):
         - Updates ALL matching dishes across merged menus
         - Creates one `draftOp` per dishId
       - If unchecked:
         - Updates only the selected dish
     - Default: `applyToMerged = true` if `matchingDishes.length > 1`
   - **Create Mode**:
     - Disabled when `selectedMenuId === 'ALL'` (must select specific menu)
     - Shows error: "Please select a specific menu to create dishes."

5. **UI Restrictions**:
   - "ADD ITEM" button disabled when `selectedMenuId === 'ALL' && !mergeMode`
   - Empty state shown when `selectedMenuId === 'ALL' && !mergeMode`:
     - "SELECT A MENU TO EDIT"
     - "Or click MERGE to edit multiple menus simultaneously"

6. **Exit Merge Mode**:
   - Click "EXIT MERGE" button in MenuSwitcher
   - Or select a specific menu from dropdown (exits merge mode automatically)
   - Resets: `mergeMode = false`, `mergedMenuIds = []`

### Supported "Fast Update" fields in Merge Mode
- `price`
- `availability`
- `visibility`
- `portion prices` (if dish has portions)
- `name`, `description`, `dishType`, `tags`, `recommendations` (via DishModalV2)

### Portion rule

If dish has `portions[]`, POS uses portion pricing. So in bulk update:
- update `portions[].price` instead of `dish.price` (or update both if required).

## 🧾 Menu-Aware Queries

All views must respect `selectedMenuId` and `mergeMode`:

**Effective Menu IDs** (`useMenuViewData`):
```typescript
const effectiveMenuIds = useMemo(() => {
  if (selectedMenuId === "ALL") {
    if (mergeMode) return mergedMenuIds; // Merge mode: use selected menu IDs
    return []; // ALL without merge: empty (shows empty state)
  }
  return [selectedMenuId]; // Single menu: use that menu ID
}, [selectedMenuId, mergeMode, mergedMenuIds]);
```

**Dishes:**
- **Single Menu** (`selectedMenuId = menuId`):
  - `db.dishes.where({ businessId }).filter(d => d.menuId === menuId)`
- **Merge Mode** (`selectedMenuId = 'ALL' && mergeMode = true`):
  - `db.dishes.where({ businessId }).filter(d => mergedMenuIds.includes(d.menuId))`
  - Grouped by `nameKey` for bulk operations (`dishesGroupedByNameKey`)
- **ALL without Merge** (`selectedMenuId = 'ALL' && mergeMode = false`):
  - Returns empty array (shows "SELECT A MENU TO EDIT" message)

**Categories:**
- **Single Menu**: `db.categories.where({ businessId }).filter(c => c.menuId === menuId)`
  - Split parent/sub by `hierarchy`
  - Filter by `menuType`: menuType 2 shows only CHILD categories
- **Merge Mode**: Filtered by `mergedMenuIds`, shows all categories from merged menus
- **ALL without Merge**: Returns empty array

**Addons:**
- **Single Menu**: `db.addons.where({ businessId }).filter(a => a.menuId === menuId)`
  - Group by parent/child hierarchy
- **Merge Mode**: Filtered by `mergedMenuIds`, shows all addons from merged menus
- **ALL without Merge**: Returns empty array

**Dish Grouping** (`dishesGroupedByNameKey`):
- Only computed when `mergeMode === true`
- Groups dishes by normalized `nameKey` (lowercase, trimmed, spaces collapsed)
- Used to find matching dishes across merged menus for bulk updates
- Example: "Butter Chicken" (Menu A) and "butter chicken" (Menu B) grouped together

**Root cause of the old bug**: UI was using `db.categories.toArray()` and `db.addons.toArray()` which ignores menuId, so switching menu never changed UI.

## 🛠 Usage / Dev Notes

### Bootstrap

`useMenuBootstrap(businessId)`:
1. fetch all entities
2. store to Dexie (add computed `nameKey`)
3. update `lastPulledAt`

### Editing

Always update IndexedDB first, then add a `draftOp` via `DraftOpsRepository`:

```typescript
// Type-safe update methods (no 'any' types)
await DraftOpsRepository.updateDishFields(dishId, businessId, {
  availability: true,
  visibility: true,
  price: 200
});

await DraftOpsRepository.updateDishesByNameKey(nameKey, businessId, {
  availability: true,
  price: 200
}); // Bulk update in ALL mode
```

### Push Menu

`useMenuPush(businessId)`:
1. **Image Upload Phase**:
   - Upload all pending images with deduplication
   - Update `imageUploadMap` with uploaded URLs
   - Update dish fields with image URLs
   - Track progress: "Uploading images A/B (unique U)"
2. **Draft Operations Processing**:
   - Gather `draftOps` into three arrays (dish/category/addon)
   - Merge multiple updates for same `entityId` (last write wins)
   - Chunk updates into batches of 200 items
   - Call bulk update APIs for each chunk
   - Track progress for each entity type
3. **Error Handling**:
   - Collect partial failures with detailed error messages
   - Remove successful draftOps from IndexedDB
   - Keep failed items in draftOps for retry
   - Display error summary in progress modal
4. **Cleanup**:
   - Clear `draftOps` and `pendingImages` only after full success
   - Update `lastPushedAt`
   - Show success toast notification

### Refresh safety

If dirty:
- Refresh must show confirmation: "Unsaved changes will be discarded."
- Back navigation should show same warning.

## 📦 Component Reusability

### Row Components

- **`DishRow`**: Displays dish row with image, price, switches, actions
  - Memoized for performance
  - Handles image upload triggers
  - Toggle availability/visibility

- **`CategoryRow`**: Displays category row with visibility toggle
  - Supports both standalone and nested contexts
  - Optional `parentName` prop for child categories tab

- **`ParentCategoryRow`**: Displays parent category with nested children
  - Shows parent info + nested child categories
  - Expandable/collapsible children list

- **`AddonRow`**: Displays addon row with choices dropdown
  - Shows addon details, availability toggle
  - Dropdown for viewing choices

### Modal Components

All modals use the **`PopUp`** component for consistent UI:

- **`DishModalV2`**: Unified Dish Creation & Editing
  - **Features**:
    - **Basic Details**: Name, Kitchen ID, Type (Veg/Non-Veg/Egg)
    - **Pricing**: Base price or Portions (auto-calculated base)
    - **Linking**: Categories, Addons, and **Recommendations** (New)
    - **Tags**: Chip-based tag input (New)
    - **Images**: Upload up to 3 images
    - **Merge Mode Support**:
      - **Edit Mode**: When editing a dish that exists in multiple merged menus:
        - Automatically finds all dishes with same `nameKey` (`matchingDishes`)
        - Shows yellow warning card with checkbox: "APPLY TO MERGED MENUS (X ITEMS)"
        - If checked: Bulk updates all matching dishes (one `draftOp` per dishId)
        - If unchecked: Updates only the selected dish
        - Default: Auto-checked if `matchingDishes.length > 1`
      - **Create Mode**: Disabled when `selectedMenuId === 'ALL'` (must select specific menu to create)
      - **Linking Restrictions**: Categories, Addons, Recommendations linking hidden in merge mode (menu-specific)
  - **Props**:
    - `isMergeMode: boolean` - Whether merge mode is active
    - `mergedMenuIds: string[]` - Array of merged menu IDs
    - `dishesGroupedByNameKey: Map<string, MenuDish[]>` - For finding matching dishes

- **`CategoryModalV2`**: Unified Category Creation & Editing
  - **Hierarchy**: Select PARENT or CHILD level
  - **Linking**: Link Child categories to Parents
  - **Images**: Upload category image
  - **Visibility**: Toggle availability/visibility

- **`AddonModalV2`**: Unified Addon Creation & Editing
  - **Choice Types**: **NUMBER** (Counter) or **CHECKBOX** (Selection)
  - **Validation**: Strict Min/Max choice validation (Max >= Min)
  - **Choices**: Dynamic add/remove with pricing
  - **Linking**: (Planned) Link to dishes directly
  - **Merge Mode Support**: Updates matching addons across merged menus

- **`MergeMenusModal`**: Activates merge mode for multi-menu editing
  - **Step 1 - Menu Selection**: 
    - Multi-select checkboxes for available menus
    - Minimum 2 menus required to proceed
    - "NEXT" button enabled only when 2+ menus selected
  - **Step 2 - Confirmation**:
    - Yellow warning card explaining merge mode behavior:
      - "Edits will sync across identical dishes/categories (same Name Key)"
      - "If an item exists in Menu A but not Menu B, it will be skipped for Menu B"
      - "Prices and availability will be updated for all matched items"
    - "CONFIRM MERGE" button activates merge mode
  - **On Confirm**:
    - Sets `mergeMode = true` in `useMenuUIStore`
    - Sets `mergedMenuIds = [selectedMenuIds]`
    - Sets `selectedMenuId = 'ALL'`
    - Shows success toast: "Merged X menus"
    - MenuSwitcher displays: "MERGED: [Menu1]+[Menu2]+..." (abbreviated names)

- **`ImageUploadModal`**: Upload/crop up to 3 images per dish
  - Uses image cropper
  - Stores pending images in IndexedDB
  - Loads and merges pending images on open
  - Handles empty array when all images removed

- **`BulkImageUploadModal`**: High-performance bulk image upload (up to 100 images)
  - **Workflow Improvements**:
    - **Two-Phase UI**: Don't show dishes initially - only upload zone visible
    - After compression completes, dishes and images grid appear
    - **"Upload More" Button**: Appears after initial upload completes for adding more images
    - **"Use Existing Images" Button**: Opens picker to reuse images already in dishes (skips upload)
    - **Compression Progress Bar**: Hidden after completion to maximize space
    - **Assignment Loader**: Shows progress bar during image assignment phase with "ASSIGNING IMAGES: x/y" message
    - **Sticky Sidebar**: Dishes list stays visible while scrolling through images (sticky positioning)
    - **Scrollable Images Grid**: Right panel scrolls independently, allowing easy access to all images while dishes remain accessible
  - **Web Worker Processing**: Images processed in background thread (no UI blocking)
  - **Auto-Matching**: Fuzzy matches image filenames to dish names using Levenshtein distance
  - **Two-Panel Layout**: 
    - Left sidebar: Searchable dish list for manual assignment (shows image count and available slots) - **Sticky position**
    - Right panel: Processed images grid with drag & drop - **Scrollable**
  - **Image Compression**: Resizes to max 1080x1080px, JPEG quality 0.8
  - **File Size Display**: Shows compressed size and compression percentage
  - **Global Sync**: Detects shared dishes across menus and shows confirmation modal
  - **Max 3 Images Enforcement (Hard Rule)**:
    - **Blocking Logic**: Prevents assignment if dish has 3 images (existing + pending in session)
    - **Toast Error**: Shows "Max 3 images allowed per item" when attempting to exceed limit
    - **Visual Badge**: Displays "FULL (3/3)" badge (red background) in dish list when dish is full
    - **Drop Zone Blocking**: Disables drop highlight for full dishes
    - **Pending Assignment Tracking**: Accounts for pending assignments in current session when checking available slots
    - **All Assignment Methods Protected**: Auto-assign, drag & drop, click-to-assign, and existing image picker all respect the limit
    - **Duplicate Prevention**: Checks if image URL already exists in dish (toast: "Image already added for this item")
  - **Use Existing Images Picker**:
    - **Button**: "USE EXISTING IMAGES" with Images icon
      - **Always Visible**: Button appears immediately when modal opens (no uploads required)
      - **After Uploads**: Also appears next to "Upload More" button after images are processed
      - **Primary Style**: Shown as primary yellow button when no images uploaded yet
    - **Modal**: `ExistingImagesPickerModal` displays all images from Dexie dishes table
    - **Multi-Select Functionality**:
      - **Selection**: Click images to toggle selection (checkmark indicator appears)
      - **Select All**: "SELECT ALL" / "DESELECT ALL" button for filtered results
      - **Visual Feedback**: Selected images show yellow background, black border with yellow checkmark
      - **Selection Counter**: Shows "X SELECTED" in header and footer
      - **Batch Add**: "ADD SELECTED (X)" button adds all selected images at once
      - **Cancel**: "CANCEL" button closes modal without adding images
    - **Scope Filtering**: Respects `selectedMenuId` (ALL view shows all menus, specific menu shows only that menu)
    - **Deduplication**: Groups images by URL, shows "Used in X items" badge for shared images
    - **Search**: Filter by dish name, URL, or filename (real-time search)
      - Search works with multi-select (only affects displayed images, not selection state)
    - **Image Display**: Thumbnails with dish names and usage counts
    - **Reused Image Handling**: 
      - Selected images marked with `isReused: true` flag
      - Preview stores URL directly (not base64)
      - Skips compression and upload during push phase
      - Cloud URLs detected and reused without re-upload
      - Multiple images can be selected and added in one batch
  - **Smart Slot Filling**: Ensures max 3 images per dish globally
  - **Slot Enforcement**: Prevents assigning more images than available slots (e.g., if dish has 2 images, only 1 more allowed)
  - **UI Feedback**: Shows "X/3 IMAGES (Y SLOT(S) LEFT)" and "FULL (3/3)" status in sidebar
  - **Framer Motion**: Progress bars, pulsing loaders, smooth animations
  - **Memory Management**: Properly revokes blob URLs to prevent leaks
  - **Server Upload Progress**: Integrated with PushProgressModal to show clear loader during server upload phase

- **`PushProgressModal`**: Real-time progress tracking during push operations
  - **Phases**: Images → Dishes → Categories → Addons → Complete/Error
  - **Progress Bar**: Thick black border with yellow fill, shows "x/y" counts
  - **Error Display**: Shows failed items with detailed error messages
  - **Success/Error Icons**: Visual feedback with lucide icons
  - **Brutalist UI**: Hard borders, no radius, hard shadow

- **`QuickMenuPanel`**: Full-panel quick menu update interface
  - **Layout**: Left sidebar (categories) + Right grid (dishes)
  - **Neo-Brutalist Styling**: Rounded cards with light backgrounds (`#FAFAFA`)
  - **Features**: Multi-select categories, search, inline editing, portions management
  - **Responsive**: Single column on small screens, 2 columns on XL screens

- **`PriceAdjustmentModal`**: Bulk price adjustment modal
  - **Modes**: Rupees (₹) or Percentage (%)
  - **Operations**: Increase or Decrease
  - **Selection**: Category-based or Dish-based
  - **Transaction**: Atomic IndexedDB updates

- **`AvailabilityVisibilityModal`**: Bulk availability/visibility modal
  - **Actions**: CLOSE (availability: false, visibility: false) or OPEN (both true)
  - **Selection**: Category-based or Dish Type-based
  - **Transaction**: Atomic IndexedDB updates

- **`SharedDishConfirmModal`**: Confirmation modal when updating dishes shared across menus
  - Shows dish name and list of menus affected
  - Prevents accidental global updates

- **`PushProgressModal`**: Real-time progress tracking during push operations
  - **Phases**: Images → Dishes → Categories → Addons → Complete/Error
  - **Progress Bar**: Thick black border with yellow fill, shows "x/y" counts
  - **Error Display**: Shows failed items with detailed error messages
  - **Success/Error Icons**: Visual feedback with lucide icons
  - **Brutalist UI**: Hard borders, no radius, hard shadow

- **`QuickMenuPanel`**: Full-panel quick menu update interface
  - **Layout**: Left sidebar (categories) + Right grid (dishes)
  - **Neo-Brutalist Styling**: Rounded cards with light backgrounds (`#FAFAFA`)
  - **Features**: Multi-select categories, search, inline editing, portions management
  - **Responsive**: Single column on small screens, 2 columns on XL screens

- **`PriceAdjustmentModal`**: Bulk price adjustment modal
  - **Modes**: Rupees (₹) or Percentage (%)
  - **Operations**: Increase or Decrease
  - **Selection**: Category-based or Dish-based
  - **Transaction**: Atomic IndexedDB updates

- **`AvailabilityVisibilityModal`**: Bulk availability/visibility modal
  - **Actions**: CLOSE (availability: false, visibility: false) or OPEN (both true)
  - **Selection**: Category-based or Dish Type-based
  - **Transaction**: Atomic IndexedDB updates

- **`ExistingImagesPickerModal`**: Picker for reusing existing images from dishes
  - **Image Collection**: Loads all images from Dexie dishes table
  - **Menu Filtering**: Respects `selectedMenuId` (ALL or specific menu)
  - **Deduplication**: Groups images by URL, shows usage counts
  - **Multi-Select Support**:
    - **Toggle Selection**: Click any image to select/deselect (checkmark indicator appears)
    - **Select All**: "SELECT ALL" button selects all filtered images, "DESELECT ALL" deselects them
    - **Selection State**: Selected images show yellow background (`#FFEB3B`) and black border with yellow checkmark icon
    - **Batch Operations**: Add multiple selected images at once with "ADD SELECTED (X)" button
    - **Selection Counter**: Displays selected count in header ("X SELECTED") and footer
    - **Reset on Close**: Selection resets when modal closes or cancels
  - **Search**: Filter by dish name, URL, or filename (works independently with multi-select)
  - **UI**: Grid layout with thumbnails, dish names, and "Used in X items" badges
  - **Footer Actions**: 
    - "CANCEL" button (always enabled)
    - "ADD SELECTED (X)" button (disabled when no images selected, shows count)
  - **Brutalist Styling**: Hard borders, yellow hover effects, lucide icons, checkmark indicators
  - **Button Visibility**: "USE EXISTING IMAGES" button always visible when BulkImageUploadModal opens (no uploads required)

## 🚀 Key Features

### 1. Offline Editing
- All edits (Price, Availability, Visibility, Portions, Choices) are saved locally immediately.
- Users can continue working without internet.
- "Push Menu" button becomes active when changes exist.

### 2. Draft Operations Queue
- Every edit creates a record in `draftOps` table (type-safe).
- `{ opType: "UPDATE", entity: "DISH", entityId: "123", payload: { price: 200 } }`
- This ensures we know exactly what changed and can push minimal updates.

### 3. Performance
- **Component Memoization**: All row components use `React.memo`
- **Minimal Re-renders**: Updates go to DB -> LiveQuery updates only responsive components.
- **Tree-shakable**: Named exports, unused code eliminated by bundler
- **Web Workers**: Image processing runs in background thread (no UI blocking)
- **Image Deduplication**: Same image uploaded once, reused across dish instances

### 4. Menu Switching
- Instant switching between menus using local IndexedDB data (no network calls).
- ALL view enables bulk updates across multiple menus for same logical dishes.
- Categories filtered by `menuType` automatically.

### 5. Type Safety
- **Zero `any` types**: All components use proper TypeScript interfaces
- **Centralized types**: All types in `types/index.ts`
- **Type-safe repositories**: `DraftOpsRepository` methods use typed payloads

### 6. Bulk Image Upload System
- **Web Worker Processing**: 
  - Offloads image resizing/compression to background thread
  - Proper lifecycle management (worker persists until modal closes)
  - `imageId` tracking ensures accurate image matching between worker and main thread
  - Chunked batch processing (5 images per batch) prevents UI blocking
- **Zustand Store Architecture** (`useBulkImageUploadStore`):
  - **State Management**: All UI state lives in Zustand (no `useState` in components)
  - **Image Entry Management**:
    - `addImage(image: ProcessedImage)`: Creates new image entries (prevents duplicates by imageId)
    - `updateImage(imageId, updates)`: **Strict update-only** - only updates existing entries, logs warning if image not found (prevents silent insert bugs)
    - `removeImage(imageId)`: Removes image and revokes blob URLs
    - `addReusedImages(urls, filenames)`: Adds existing images for reuse
  - **Processing State**: Tracks queue, progress, and processing status
  - **Assignment State**: Tracks assignment progress and results
  - **UI State**: Drag state, search, filters, modal visibility
  - **Selectors**: Derived state for unassigned images, assigned counts, filtered images
- **Automatic Assignment**: 
  - **Auto-Trigger**: Automatically links images to dishes after compression completes (500ms delay)
  - **Manual Trigger**: "AUTO ASSIGN" button available for manual triggering
  - **Enhanced Matching**:
    - **Filename Normalization**: `normalizeForMatching()` preserves meaningful numbers (e.g., "50", "65") while removing only slot suffixes (-1, -2, -3)
    - **Pluralization Handling**: Normalizes pluralization differences (e.g., "teachers" → "teacher")
    - **Token-Based Matching**: Checks key token overlaps for better matching accuracy
    - **Containment Boost**: Boosts confidence score if one string contains the other
  - **Slot Availability Check**:
    - Uses `getAvailableSlotsWithPending()` callback to check availability
    - Accounts for existing images (via `getGlobalImages()`)
    - Accounts for pending assignments in current session
    - Accounts for shared dish instances across menus
    - Ensures auto-assign uses same logic as manual assign
  - **Fuzzy Matching**: Uses improved Levenshtein distance algorithm
    - Confidence threshold: 0.6 (60% similarity required)
    - Normalizes both filename and dish name consistently
    - Examples: "teachers 50-1.jpg" matches "TEACHER 50" (pluralization + number preserved)
  - Processes in batches (10 images) for UI responsiveness
- **Worker Completion Matching**:
  - **Primary**: Always matches by `imageId` first (most reliable)
  - **Fallback**: Only uses filename matching if `imageId` not found (logs warning)
  - **Error Handling**: Skips image if no match found (prevents duplicate entries)
  - **Debug Logging**: Comprehensive logs for image lifecycle tracking (guard by `DEBUG_BULK` flag)
- **Drag & Drop UI**: 
  - Two-panel layout with searchable dish list for manual assignment
  - Images only draggable when `status === 'completed'` (prevents dragging during processing)
  - Drop zone disabled for full dishes (3/3 images)
  - Visual feedback prevents dropping on full dishes
  - Proper event handling with `dataTransfer` types checking
- **Image Count Display (Fixed)**:
  - **Single Source of Truth**: Uses `getGlobalImages()` for existing images (handles shared dishes)
  - **Deduplication**: Combines existing + pending session images, deduplicates by URL/preview
  - **Capped Display**: Always shows max 3/3 (never exceeds)
  - **NEW Count**: Shows count of images not in existingGlobal
  - **FULL Badge**: Only shows when `displayCount >= 3`
  - **Formula**: 
    ```typescript
    existingGlobal = getGlobalImages(dishId, nameKey)  // Already deduplicated
    pendingSession = processedImages.filter(assignedDishId in sharedDishIds)
    combinedUnique = deduplicate by URL ([...existingGlobal, ...pendingSession])
    displayCount = min(3, combinedUnique.length)
    ```
- **Save Logic (Fixed)**:
  - **Debug Logging**: Comprehensive logs at each step (guard by `DEBUG_BULK` flag)
  - **Grouping Validation**: Logs completed assigned images before grouping
  - **Save Validation**: Logs assignmentsByNameKey size and image counts
  - **Final Validation**: Logs pendingSaves summary before saving
  - **Null Handling**: Properly handles null `assignedDishId` values
  - **Post-Save State**: Unassigns saved images after successful save (UI reflects saved state)
  - **Merge Logic**: Correctly merges existing + pending + new images (max 3)
  - **Replace Mode**: Uses `savePendingImages(..., false)` to replace with merged set
- **Global Image Sync**: Detects dishes shared across menus and syncs images globally
- **Smart Compression**: Max 1080x1080px, JPEG quality 0.8, shows compression stats
- **Memory Efficient**: Uses `URL.createObjectURL` for previews, properly revokes on cleanup
- **Progress Tracking**: 
  - Framer Motion animations with percentage progress bar
  - Local save progress with dish coverage status
  - Server upload progress with batch information
  - Debug logs available (set `DEBUG_BULK = true` to enable)
- **Job-Based State Management**: 
  - **Active Job ID**: Each upload session generates a unique `activeJobId` to prevent state contamination.
  - **Atomic Completion Guard**: `markJobImageCompleted(jobId, imageId)` ensures each image is only counted once per job, fixing progress overflow bugs.
  - **Strict Progress Guard**: `incrementProgress()` respects the active job ID and clamps progress to 100%.
- **Save & Cleanup UX**:
  - **Immediate UI Update**: Explicitly calls `resetStore()` upon successful save to clear the grid and reset dish counters instantly.
  - **Atomic Cleanup**: Revokes all blob URLs and clears session data to ensure a fresh state for subsequent uploads.
- **Use Existing Images**: 
  - **Always Accessible**: Button visible immediately when modal opens (no uploads required)
  - **Multi-Select Picker**: Select multiple images at once with visual feedback
  - **Batch Addition**: Add all selected images in one operation
  - **Fast Path**: Skips compression and upload (reuses existing URLs)
  - **Respects Limits**: Same max 3 images per dish rule applies to reused images

### 7. Image Deduplication
- **Upload Optimization**: Same image content (by base64) uploaded only once
- **URL Reuse**: Uploaded URL is cached and reused for all dish instances
- **Shared Dish Support**: When dish exists in multiple menus, images sync without duplicates

## 🔧 Adding a New Feature

1. **Types**: Add type definitions to `types/index.ts`
2. **Database**: If new data is needed, update schema in `menu.database.ts` (typed tables)
3. **Repository**: Add helper method in `DraftOpsRepository.ts` with typed payload
4. **UI Component**: Create reusable component (row/modal) in `components/`
5. **Panel**: Integrate new component into panel (Items/Categories/Addons)

## 🐛 Debugging

- Check **Application > IndexedDB > HipalMenuDB** in Chrome DevTools to see local data and drafts.
- Inspect `draftOps` table to see pending changes.
- Inspect `pendingImages` table to see images waiting for upload.
- Check `nameKey` field on dishes to verify bulk update grouping.
- Use React DevTools to verify component memoization and re-renders.
- Check **Network** tab to verify image deduplication (same image should only upload once).
- Use **Sources > Web Workers** in DevTools to debug image processing worker.

### Debug Flags for Bulk Image Upload

Enable comprehensive debug logging by setting debug flags:

**In `BulkImageUploadModal.tsx`**:
```typescript
const DEBUG_BULK = true; // Enable detailed logs
```

**In `imageAssignmentService.ts`**:
```typescript
const DEBUG = true; // Enable matching logs
```

**In `imageMatcher.ts`**:
```typescript
const DEBUG = true; // Enable normalization and matching logs
```

**Debug Logs Include**:
- Image lifecycle: id → processing → completed
- Worker message handling and imageId matching
- Normalization results (filename → normalized)
- Matching decisions (confidence scores, skipped dishes)
- Auto-assignment triggers and results
- Save grouping (completed images, assignmentsByNameKey)
- Slot availability calculations
- Assignment decisions (why dishes are skipped or assigned)

### Debug Flags for Bulk Image Upload

Enable comprehensive debug logging by setting debug flags:

**In `BulkImageUploadModal.tsx`**:
```typescript
const DEBUG_BULK = true; // Enable detailed logs
```

**In `imageAssignmentService.ts`**:
```typescript
const DEBUG = true; // Enable matching logs
```

**In `imageMatcher.ts`**:
```typescript
const DEBUG = true; // Enable normalization and matching logs
```

**Debug Logs Include**:
- Image lifecycle: id → processing → completed
- Worker message handling and imageId matching
- Normalization results (filename → normalized)
- Matching decisions (confidence scores, skipped dishes)
- Auto-assignment triggers and results
- Save grouping (completed images, assignmentsByNameKey)
- Slot availability calculations
- Assignment decisions (why dishes are skipped or assigned)

## 🐛 Bug Fixes & Improvements

### Zustand Store Improvements (useBulkImageUploadStore)

**A) Image Entry Creation**:
- **Fixed**: `updateImage()` now strictly updates existing entries only (no silent inserts)
- **Added**: `addImage()` for clean insertion of new image entries
- **Behavior**: `updateImage()` logs warning if called for non-existent imageId, returns unchanged state
- **Prevents**: Duplicate entries, wrong ID assignments, silent insert bugs

**B) Worker Completion Matching**:
- **Fixed**: Strict `imageId` matching (primary method)
- **Added**: Fallback by filename with warning logs (should rarely happen)
- **Added**: Error handling if no match found (prevents duplicate entries)
- **Prevents**: Images being matched to wrong entries, duplicate processing

**C) Auto-Assign Slot Availability**:
- **Fixed**: Auto-assign now uses same slot logic as manual assign
- **Added**: `getAvailableSlotsWithPending` callback to `AssignmentOptions`
- **Accounts For**: Existing images (global sync), pending assignments (session), shared dish instances
- **Prevents**: Auto-assign skipping dishes that actually have available slots
- **Example**: If UI shows "1 slot left", auto-assign will not skip that dish

**D) Image Count Display**:
- **Fixed**: Display count never exceeds 3/3 (capped)
- **Fixed**: Uses `getGlobalImages()` for existing images (handles shared dishes correctly)
- **Fixed**: Deduplicates by URL/preview before counting
- **Fixed**: Shows accurate "NEW" count (only images not in existingGlobal)
- **Prevents**: Displaying impossible counts like "5/3 IMAGES (FULL)"

- **Ensures**: UI reflects saved state correctly after save completes

**F) Job-Based Progress System**:
- **Fixed**: Progress overflow (e.g., "1667%") and infinite loops by introducing unique `activeJobId` and `completedImageIds` Set.
- **Added**: Atomic `markJobImageCompleted` guard to prevent duplicate progress increments and completion triggers.
- **Prevents**: Worker messages from stale or multiple concurrent jobs from corrupting UI state.

**G) Strict Save Cleanup**:
- **Fixed**: UI lagging behind save state (saved images remaining visible in grid).
- **Added**: Explicit `resetStore()` call in `handleSave` success path to clear all session state immediately.
- **Ensures**: Dish counters and image grid update instantly after clicking "SAVE".

### Image Matching Improvements

**Enhanced Normalization**:
- **Preserves Meaningful Numbers**: Keeps numbers like "50", "65" that are part of dish names
- **Removes Only Slot Suffixes**: Only strips "-1", "-2", "-3" at the end
- **Handles Pluralization**: Normalizes "teachers" → "teacher" for better matching
- **Consistent Normalization**: Both filename and dish name normalized the same way

**Improved Matching Algorithm**:
- **Token-Based Matching**: Checks key token overlaps for better accuracy
- **Containment Boost**: Boosts confidence if one string contains the other
- **Examples**: 
  - "teachers 50-1.jpg" matches "TEACHER 50" (confidence ~1.0)
  - "teachers 50 2.jpg" matches "TEACHER 50" (confidence ~0.85+)

## 📝 Code Quality Standards

1. **No `any` types**: All code uses proper TypeScript interfaces
2. **Tree-shakable**: Named exports, avoid default exports where possible
3. **Memoized components**: Use `React.memo` for row components
4. **Small components**: Each component has single responsibility
5. **Reusable**: Components can be used across different contexts
6. **Type-safe**: All repository methods use typed payloads

## 🎨 UI Component Standards

- **Consistent Modals**: All creation/editing uses `PopUp` component
- **Responsive**: Mobile-first design with `lg:` breakpoints
- **Accessible**: Proper button types, ARIA labels where needed
- **Performant**: Memoized components, efficient re-renders
- **Drag & Drop**: Smooth drag & drop for image assignment in bulk upload
- **Visual Feedback**: Progress bars, pulsing loaders, success indicators with Framer Motion

## 🖼 Image Management

### Individual Image Upload (`ImageUploadModal`)
- Upload up to 3 images per dish
- Crop/edit images before upload
- Stores as pending images in IndexedDB
- Automatically loads pending images when modal opens
- Supports removing all images (sends empty array `[]`)

### Bulk Image Upload (`BulkImageUploadModal`)
- **Workflow**:
  1. **Initial State**: Only upload zone visible
  2. **During Compression**: Progress bar shows compression progress ("COMPRESSING: x/y")
  3. **After Compression**: 
     - Progress bar hidden
     - **Automatic Assignment**: Images automatically link to dishes based on filename matching (0.6 confidence threshold)
     - Dishes and images grid appear with assignments visible
     - "Upload More" button appears for additional images
  4. **During Assignment**: Yellow loader with black progress bar shows "ASSIGNING IMAGES: x/y" (if manual auto-assign triggered)
  5. **Upload More**: Clicking button shows upload input again for additional images
- **UI Layout**:
  - **Left Sidebar (Sticky)**: Searchable dish list (300px width) - stays visible while scrolling (`position: sticky`, `top: 24px`)
  - **Right Panel (Scrollable)**: Image grid with drag & drop - independent scrolling with max height (`calc(100vh - 300px)`)
  - Both panels only appear after images are processed and compressed
- **Processing**: 
  - Web Worker resizes to 1080x1080px, JPEG quality 0.8
  - Worker properly passes `imageId` between main thread and worker for accurate image matching
  - Chunked processing (5 images per batch) to prevent UI blocking
  - Images only draggable when status is `completed` (prevents dragging during processing)
- **Auto-Matching**: 
  - **Automatic**: Triggers automatically after all images finish compression (500ms delay for state stabilization)
  - **Manual**: "AUTO ASSIGN" button available for manual triggering
  - Fuzzy matches filenames to dish names using `imageMatcher.ts`
  - `cleanFileName`: Strips extensions, numbers, symbols
  - `calculateSimilarity`: Levenshtein distance algorithm
  - Confidence threshold: 0.6 (60% similarity required)
  - Respects slot constraints (max 3 images per dish)
  - Skips full dishes automatically
- **Image Matching Logic**:
  - Primary: Matches by `imageId` (most reliable)
  - Fallback: Matches by `filename` and `status === 'processing'`
  - Prevents duplicate entries and ensures correct image updates
- **UI Features**:
  - Sticky dishes sidebar for always-accessible drag & drop (never scrolls out of view)
  - Scrollable images grid (max height: `calc(100vh - 300px)`) for handling 50+ images
  - File size display with compression percentage
  - Progress bar with percentage (hidden after completion)
  - Pulsing shimmer during processing
  - Green checkmark on success
  - Assignment loader with progress tracking
  - Images show assigned dish name when linked
- **Global Sync**: 
  - Detects dishes shared across menus via `useImageSync` hook
  - Shows `SharedDishConfirmModal` before applying changes
  - Smart slot filling ensures max 3 images per dish globally
- **Deduplication**: 
  - Same image uploaded once, URL reused for all instances
  - SHA-256 hash-based deduplication during server upload
  - Reused URLs (http/https) skip upload phase entirely
- **Server Upload**: Integrated with PushProgressModal to show clear loader during server upload phase
- **Debugging**: Comprehensive console logs throughout the flow:
  - Worker initialization and message handling
  - Image processing stages (compression, base64 conversion, hash generation)
  - Auto-assignment triggers and results
  - State updates and progress tracking

### Image Processing Worker (`workers/image.worker.js`)
- Uses `OffscreenCanvas` for background processing
- Resizes to max 1080x1080px (maintains aspect ratio)
- Compresses to JPEG quality 0.8
- **ImageId Tracking**: Receives and returns `imageId` in messages for accurate image matching
- Returns processed blob, `imageId`, `originalName`, and dimensions to main thread
- Prevents UI blocking during processing
- Proper error handling with `imageId` included in error responses

### Image Matching Engine (`utils/imageMatcher.ts` & `services/imageAssignmentService.ts`)
- **Normalization Function** (`normalizeForMatching`):
  - Removes file extension
  - Removes only slot suffixes (-1, -2, -3) at the end
  - **Preserves meaningful numbers** (e.g., "50", "65" in dish names)
  - **Normalizes pluralization** (e.g., "teachers" → "teacher")
  - Removes symbols but keeps alphanumeric characters
  - Normalizes whitespace and lowercases
  - Examples:
    - "teachers 50-1.jpg" → "teacher 50"
    - "teacher 50" → "teacher 50"
    - "chicken 65-2" → "chicken 65"
- **Functions**:
  - `normalizeForMatching(str)`: Enhanced normalization (preserves numbers, handles pluralization)
  - `cleanFileName(filename)`: Legacy wrapper (deprecated, use `normalizeForMatching`)
  - `calculateSimilarity(str1, str2)`: Levenshtein distance (0-1 scale)
  - `autoAssignImage(filename, dishes, minConfidence)`: Finds best match with confidence score
    - Normalizes both filename and dish name consistently
    - Uses token-based matching for better accuracy
    - Provides containment boost if strings overlap
  - `batchAutoAssign(filenames, dishes)`: Batch processing for multiple files
  - `autoAssignImageToDish(image, dishes, existingAssignments, options)`: Single image assignment with slot management
    - **Enhanced Options**: Accepts `getAvailableSlotsWithPending` callback for accurate slot checking
    - Uses callback when provided (accounts for pending assignments and shared dishes)
    - Falls back to basic `hasAvailableSlots()` if callback not provided
  - `batchAutoAssignImages(images, dishes, existingAssignments, options, batchSize, onProgress)`: Batch assignment with progress tracking
- **Algorithm**: Enhanced fuzzy string matching with confidence threshold (default: 0.6)
- **Features**:
  - **Improved Matching**: Handles pluralization, preserves meaningful numbers
  - **Accurate Slot Checking**: Uses `getAvailableSlotsWithPending` callback for precise availability
  - Respects slot constraints (max 3 images per dish)
  - Skips full dishes automatically (with accurate detection)
  - Prevents duplicate assignments
  - Processes in batches (default: 10 images) for UI responsiveness
  - Progress callbacks for real-time updates
  - Debug logging available (guard by `DEBUG` flag)
- **Use Case**: Auto-assigns uploaded images to dishes based on filename similarity
- **Automatic Trigger**: Runs automatically after compression completes (500ms delay)
- **Manual Trigger**: Available via "AUTO ASSIGN" button in UI
- **Bug Fixes**:
  - Fixed matching for pluralization differences ("teachers" vs "teacher")
  - Fixed matching for dishes with numbers ("teachers 50" vs "TEACHER 50")
  - Fixed auto-assign skipping dishes with available slots (uses same logic as manual assign)

## 📊 State Management Details

### Bulk Image Upload Store (`useBulkImageUploadStore`)

**Purpose**: Centralized Zustand store for all bulk image upload state (no `useState` in components)

**State Structure**:
- `processedImages: ProcessedImage[]`: All processed images (pending, processing, completed, error)
- `processingQueue: File[]`: Queue of files waiting to be processed
- `isProcessing: boolean`: Whether images are currently being compressed
- `progress: { current, total }`: Compression progress tracking
- `isAssigning: boolean`: Whether auto-assignment is running
- `assignmentProgress: { current, total }`: Assignment progress tracking
- UI state: `dragActive`, `dishSearch`, `showUploadMore`, `imageFilter`
- Modal state: `showExistingImagesPicker`, `showSaveProgress`, `saveProgress`

**Key Actions**:
- `addImage(image)`: Creates new image entry (prevents duplicates by imageId)
- `updateImage(imageId, updates)`: **Strict update-only** - only updates existing entries, logs warning if image not found (prevents silent insert bugs)
- `removeImage(imageId)`: Removes image and revokes blob URLs
- `assignImageToDish(imageId, dishId, dishName, slot)`: Assigns image to dish
- `unassignImage(imageId)`: Removes assignment
- `addReusedImages(urls, filenames)`: Adds existing images for reuse
- `reset()`: Clears all state and revokes blob URLs

**Selectors**:
- `selectUnassignedImages`: Filters completed images without assignments
- `selectAssignedImagesCount`: Counts assigned images
- `selectCompletedImagesCount`: Counts completed images
- `selectFilteredImages`: Applies current filter (all/unassigned)

**Best Practices**:
- Always use `addImage()` when creating new entries
- Always use `updateImage()` when updating existing entries
- Store maintains strict separation between create/update operations
- All blob URLs are properly revoked on cleanup

### Draft Ops Sync (`useDraftOpsSync`)
- Monitors both `draftOps` and `pendingImages` tables
- Updates `draftOpsCount` to include pending images
- Enables push menu button when changes exist
- Uses `useLiveQuery` for reactive updates

### Push Menu Flow
1. **Check for Changes**: Validates draft ops OR pending images exist
2. **Upload Images**: 
   - Processes all pending images with deduplication
   - Creates draft ops for dish image updates
   - Clears pending images after successful upload
3. **Push Draft Ops**: Sends all draft operations to server
4. **Cleanup**: Clears draft ops and updates `lastPushedAt`

### Image Deduplication Strategy
- Caches uploaded URLs by base64 preview content
- If same image exists for multiple dishes (shared dishes), upload once
- Reuses uploaded URL for all dish instances
- Toast notification shows: "Uploaded X images (Y unique)"

### 8. Bulk Update APIs (Server-Side)
- **Production-Grade Endpoints**: Three bulk update APIs for efficient batch operations
  - `POST /menu-v2/bulk/dishes` - Bulk update dishes
  - `POST /menu-v2/bulk/categories` - Bulk update categories
  - `POST /menu-v2/bulk/addons` - Bulk update addons
- **Features**:
  - Accepts up to 200 items per request
  - Idempotency via `requestId` (UUID)
  - Partial failure reporting (which items succeeded/failed)
  - Menu-aware updates (validates `businessId` + `menuId` + `_id`)
  - Chunked processing on client-side
  - Validation with Zod schemas
- **Supported Fields**:
  - **Dishes**: `availability`, `visibility`, `price`, `portions[].price`, `name`
  - **Categories**: `name`, `visibility`, `availability`, `sequence`, `active`
  - **Addons**: `name`, `availability`, `visibility`, `compulsory`, `addOnMaxQuantity`, `choiceType`, `choices[]`
- **Response Format**: Includes `okCount`, `failCount`, and per-item results with error details

### 9. Push Menu with Progress Tracking
- **Push Progress Modal**: Real-time progress tracking during sync operations
  - Phase 1: Image uploads (shows unique vs total images, current file name)
    - Controlled concurrency (max 4 concurrent uploads)
    - Skips upload for reused URLs (http/https detected)
  - Phase 2: Applying image URLs locally (x/y dishes)
    - Updates dishes with uploaded URLs immediately after upload
    - Creates draft operations for dish image updates
  - Phase 3: Dish updates (x/y dishes, batch X/Y)
    - Chunked requests (max 200 per batch)
    - Shows batch-level progress
  - Phase 4: Category updates (x/y categories, batch X/Y)
    - Chunked requests with batch progress
  - Phase 5: Addon updates (x/y addons, batch X/Y)
    - Chunked requests with batch progress
  - Final: Sync complete with timestamp
- **Error Handling**:
  - Detailed error messages for failed items
  - Partial failure reporting (shows which items failed and why)
  - Does NOT clear draftOps on failure (only clears successful items)
  - User-friendly error messages with entity names
- **Navigation Guard**: Prevents accidental navigation during push operations
- **Brutalist UI**: Hard borders, yellow primary button, thick black border progress bar with yellow fill
- **Local Save Progress** (`SaveProgressModal`):
  - Shows progress when saving images to IndexedDB locally
  - Displays "Saving images locally: X/Y images"
  - Shows dish coverage: "Dishes updated: A/B"
  - Summary: "Saved A dishes. Remaining: (B - A) dishes."
  - Chunked writes (20 per tick, 10ms delay) to prevent UI blocking

### 10. Quick Menu Update Panel
- **Full-Panel View**: Replaces modal-based quick update with dedicated panel
- **Layout**:
  - **Top Bar**: "QUICK MENU UPDATE" title, modified dish count, "SAVE CHANGES" button
  - **Breadcrumb**: Back button at top-left with "BACK" and "QUICK MENU UPDATE" links
  - Left sidebar: Multi-select categories with "ALL DISHES" toggle (sticky on XL screens)
  - Right main area: Grid layout (1 column on small screens, 2 columns on XL)
  - Search and filter section: Search input, dish type dropdown, and dish count on one line (no card styling)
- **Neo-Brutalist Styling**: 
  - Main container background: `#F5F4F0` (neutral canvas)
  - Cards: `#FFFFFF` background, `10px` border radius
  - Borders: `2px solid #111111` with `3px 3px 0 #111111` shadow for main containers
  - Dish cards: `1.5px solid #111111` with `2px 2px 0 #111111` shadow
  - Duplicate dishes: `1.5px solid #DC2626` border with red shadow
  - Inner elements: `1px solid rgba(42, 42, 42, 0.15)` for subtle borders
  - Text colors: `#111111` (primary), `#3A3A3A` (secondary)
  - Yellow (`#FFEB3B`) for primary buttons and active states
- **Search & Filter Features**:
  - Search input and dish type dropdown on single line
  - Dish type dropdown dynamically populated from available dishes
  - "ALL TYPES" option to show all dish types
  - Real-time filtering as user types
  - No card/border styling for search section (clean, minimal)
- **Dish Display**:
  - Dish name, price, and availability in one line
  - 2:1 width ratio for name:price inputs
  - Portions always visible (no expand button needed)
  - Portions table with add/remove icons
  - Table headers only shown when portions exist
  - Dish items in rounded cards with light background for better differentiation
- **Features**:
  - Inline editing of `name`, `price`, `availability`
  - Portions management with table view (always visible)
  - Add/remove portions with icons
  - 2:1 width ratio for portion name:price inputs
  - Supports bulk updates across menus (ALL view)
  - Top bar shows modified dish count and save button
- **Data Handling**: 
  - Tracks edits locally in `editedDishes` Map
  - Saves changes to IndexedDB within Dexie transactions
  - Creates draft operations for server sync
  - Handles dishes with same `nameKey` across multiple menus
  - Cleans portion data (removes `createdAt`, `updatedAt`, temporary `_id` fields) before saving

### 11. Price Adjustment Modal
- **Bulk Price Updates**: Increase or decrease prices across multiple dishes
- **Adjustment Types**:
  - Rupees (₹): Fixed amount adjustment
  - Percentage (%): Percentage-based adjustment
- **Selection Modes**:
  - **Category**: Apply to all dishes within selected categories
  - **Dish**: Apply to selected dishes
- **Features**:
  - Updates both dish prices and portion prices
  - Rounds to 2 decimal places
  - "SELECT ALL" button for quick selection
  - Transactional updates (atomic IndexedDB operations)
- **UI**: Brutalist-styled modal with radio groups, input fields, and scrollable selection lists

### 12. Availability/Visibility Modal
- **Bulk Status Updates**: Close or open dishes (sets both availability and visibility)
- **Selection Modes**:
  - **Category**: Apply to all dishes within selected categories
  - **Dish Type**: Apply to all dishes with selected dish types
  - **Item Wise**: Apply to individually selected dishes with search functionality
- **Actions**:
  - **CLOSE**: Sets `availability: false` and `visibility: false`
  - **OPEN**: Sets `availability: true` and `visibility: true`
- **Item Wise Features**:
  - Search bar for filtering dishes by name (real-time filtering)
  - Multi-select dish list with visual checkmarks
  - "SELECT ALL" / "DESELECT ALL" button for filtered results
  - Shows total dish count
  - Clear button (X) to reset search
- **Features**:
  - Multi-select categories, dish types, or individual dishes
  - "SELECT ALL" / "DESELECT ALL" buttons for each mode
  - Transactional updates (atomic IndexedDB operations)
- **UI**: Brutalist-styled modal with radio groups, search input, and scrollable selection lists

### 13. Timestamp Fields (createdAt, updatedAt)
- **Display**: Shows creation and update dates in "23rd Jan" format
- **Location**: 
  - ItemsPanel: "CREATED: [date]" and "UPDATED: [date]" columns
  - CategoriesPanel: "CREATED: [date]" and "UPDATED: [date]" columns
  - AddonsPanel: "CREATED: [date]" and "UPDATED: [date]" columns
- **Formatting**: Custom `formatDate` utility with ordinal suffixes (1st, 2nd, 3rd, etc.)
- **Schema**: Added to Zod validators for Dish, Category, and AddOn entities

### 14. Menu Configuration Editing
- **Edit Button in MenuSwitcher**: Hover over menu items to reveal "Edit" button
- **Navigation**: Clicking "Edit" navigates to menu configuration page (`/app/business/[businessId]/select-menu`)
- **Pre-filled Data**: Menu data is pre-populated using `useMenuCreationStore`
- **UI**: Pencil icon button with brutalist styling, appears on hover

### 15. Removed UI Elements
- **Removed Buttons**:
  - "ADD ITEMS" button from ItemsPanel
  - "ADD PARENT CATEGORY" button from CategoriesPanel
  - "ADD CATEGORY" button from CategoriesPanel
  - "ADD NEW ADDON GROUP" button from AddonsPanel
  - "ADD ADDON" button from AddonsPanel
- **Remaining**: Search bars remain functional in all panels

### 16. Image Upload Limits
- **Maximum Images**: 3 images per dish (enforced globally)
- **Smart Slot Filling**:
  - If dish has 3 images: No more assignments allowed
  - If dish has 2 images: Only 1 more slot available
  - If dish has 1 image: Only 2 more slots available
- **UI Feedback**:
  - Left sidebar shows image count and available slots: "2/3 IMAGES (1 SLOT LEFT)"
  - Displays "(FULL)" when dish has 3 images
  - Disables assignment options for full dishes
  - Dropdown menus show image counts: "(2/3)", "(FULL)"

### 17. Upload & Assignment Logic Documentation
- **Complete Flow Documentation**: See `BULK_UPLOAD_ASSIGNMENT_LOGIC.md` for detailed explanation of:
  - Upload flow (file selection → queue → worker)
  - Compression process (Web Worker → base64 → hash)
  - Automatic assignment (filename matching → slot selection)
  - Manual assignment (drag & drop validation)
  - Save process (merge logic → local database)
  - Push process (deduplication → server upload)
- **Key Algorithms**:
  - Filename parsing (extracts base name and slot from labels like "Chicken 65-1")
  - Slot selection (preferred slot → next available)
  - Levenshtein distance (fuzzy string matching for dish names)
  - SHA-256 deduplication (prevents duplicate uploads)
- **State Management**: Zustand store tracks processing, assignment, and progress states
- **Performance**: Chunked processing, batched operations, and worker offloading

# Offline-First Menu Management (Menu V2)

This module implements a high-performance, offline-first menu management system for Hibiz. It is designed to handle large datasets (1200+ dishes) efficiently using IndexedDB (Dexie), while supporting multi-menu businesses and a powerful ALL (bulk update) mode.

## 🎨 Design System: Brutalist UI

Menu V2 uses a **brutalist design system** with hard shadows, bold borders, and zero radius:

### Color Palette
- **Primary Brand:** `#FFEB3B` (Electric Yellow) - Primary actions, highlights, active states
- **Background:** `#F3F4F6` (Raw Concrete Gray) - Main app background
- **Surface:** `#FFFFFF` (Stark White) - Card backgrounds
- **Borders & Text:** `#000000` (Pure Black) - All borders and text (no grays)
- **Alert:** `#FF4444` (Red) - Critical warnings/errors
- **Success:** `#00C853` (Green) - Positive feedback

### Shape & Depth
- **Border Radius:** `0px` (strictly rectangular)
- **Border Width:** `3px solid black` on all Cards, Buttons, Inputs
- **Shadows:** Hard offset shadows only (NO blur):
  - Default: `box-shadow: 4px 4px 0px 0px #000000`
  - Hover: `box-shadow: 2px 2px 0px 0px #000000` (snaps closer)
  - Active/Click: `box-shadow: 0px 0px 0px 0px #000000` (flat)

### Typography
- **Headings:** `Archivo Black` or `Inter-Black` (Weight 900), UPPERCASE
- **Data/Numbers:** `JetBrains Mono` or `Roboto Mono`
- **Body:** `Inter` (Bold/Semi-Bold, Weight 600-700)

### Iconography
- **Library:** `lucide-react`
- **Style:** Stroke width `2.5px` or `3px`, Color: Black

### CSS Classes
All brutalist styles are defined in `styles/brutalist.css`:
- `.brutal-card` - Card with hard shadow
- `.brutal-button` - Button with hard shadow (white bg)
- `.brutal-button-primary` - Primary button (yellow bg)
- `.brutal-input` - Input field with hard shadow
- `.brutal-heading` - Heading text (Archivo Black, uppercase)
- `.brutal-data` - Data/number text (monospace)
- `.brutal-body` - Body text (Inter, semi-bold)
- `.brutal-icon` - Icon styling (2.5px stroke, black)
- `.brutal-table-header` - Table header (black bg, white text)
- `.brutal-table-row` - Table row with hover effect
- `.brutal-badge` - Badge styling
- `.brutal-badge-yellow` - Yellow badge
- `.brutal-active` - Active state (yellow background)
- `.brutal-sidebar` - Sidebar styling

## 🏗 Architecture

### Code Structure & Organization

The codebase follows a **modular, tree-shakable architecture** with proper TypeScript types and reusable components:

```
src/components/organism/menu-v2/
├── types/
│   └── index.ts                          # All TypeScript type definitions (no 'any' types)
├── styles/
│   └── brutalist.css                     # Brutalist design system CSS utilities
├── db/
│   ├── menu.database.ts                  # Dexie schema definition
│   ├── DraftOpsRepository.ts            # Draft operations repository (type-safe)
│   └── PendingImagesRepository.ts       # Pending images repository
├── hooks/
│   ├── useMenuBootstrap.ts              # Initial data loading
│   ├── useMenuPush.ts                   # Sync draft ops to server (with image deduplication)
├── components/
│   ├── KitchenComponents/
│   │   ├── KitchenForm.tsx              # Split-pane form for Creating/Editing Kitchens
│   │   └── DishSelectionPanel.tsx       # Reusable panel for bulk dish selection
│   ├── ItemsPanel.tsx                   # Main dishes panel
│   ├── CategoriesPanel.tsx              # Main categories panel
│   ├── AddonsPanel.tsx                  # Main addons panel
│   └── ...
```

### Type Safety

**All components use proper TypeScript types** - no `any` types are used.

### Kitchen Management (New)

The Kitchen Management UI has been completely redesigned to optimize workflow and reduce clicks.

**`KitchenForm.tsx` (Split-Pane Layout)**
- **Left Column**: Kitchen Details (Name, Description, Metadata)
- **Right Column**: Embedded `DishSelectionPanel`
- **Workflow**: Create kitchen and assign dishes in a single view without modal context switching.

**`DishSelectionPanel.tsx` (Reusable Component)**
- **Embeddable**: Designed to be dropped into any form requiring dish selection.
- **Bulk Selection**: 
  - Click a category header checkbox to select/deselect ALL dishes in that category.
  - Smart "indeterminate" state handling.
- **Search**: Real-time filtering of dishes.
- **Performance**: Virtualized-ready architecture (currently optimized list view).

#### Kitchen Sync Enhancements (Latest)

**Unique Dish Enforcement** (`utils/enforceUniqueKitchenDishIds.ts`)
- **Pure Helper Function**: Ensures no dish can be assigned to multiple kitchens simultaneously.
- **"Stealing" Logic**: When a kitchen claims dishes, they are automatically removed from other kitchens.
- **Returns**: Updated kitchens, dish-to-kitchen assignments, and telemetry data.
- **Example**:
  ```typescript
  const result = enforceUniqueKitchenDishIds({
    kitchens: [k1, k2],
    targetKitchenId: 'k2',
    nextDishIds: ['d1', 'd2', 'd3']
  });
  // k1 loses d1, d2, d3 if it had them
  // k2 gains d1, d2, d3
  ```

**Local Reconciliation** (`db/DraftOpsRepository.ts`)
- **Instant UI Updates**: All kitchen operations update affected kitchens and dishes immediately.
- **No Stale Data**: Creating K2 with dishes from K1 instantly updates K1's dish list.
- **Transaction Safety**: All operations wrapped in Dexie transactions for data integrity.
- **Auto-computed removeDishIds**: Automatically calculates removed dishes for proper backend sync.

**Push Menu Sync** (`hooks/useMenuPush.ts`)
- **Kitchen CREATE**: 
  - Resolves dish IDs using `idMapping` for newly created dishes.
  - Maps local kitchen UUID to server-generated ID.
  - Updates ALL dishes with `kitchenId === localId` to use `serverId`.
- **Kitchen UPDATE**: 
  - Resolves `dishIds`, `removeDishIds`, and `staffIds`.
  - Sends complete payload to backend: `{ kitchenId, name, description, dishIds, removeDishIds, staffIds, businessId }`.
  - Marks kitchen as synced and removes from draft queue.
- **Error Handling**: Comprehensive error messages for debugging.

### Component Architecture

1. **Reusable Row Components**: `DishRow`, `CategoryRow`, `AddonRow`
2. **Panel Components**: `ItemsPanel`, `CategoriesPanel`, `AddonsPanel`
3. **Modal Components**: `DishModalV2`, `CategoryModalV2`, `AddonModalV2`

### Data Layer (IndexedDB + Dexie)

**IndexedDB** (via Dexie) is the single source of truth for UI reads and writes.

**Tables**
- **menus** - Menu layouts
- **categories** - Category documents
- **dishes** - Dish documents (with `kitchenId` index for fast lookups)
- **kitchens** - Kitchen stations
- **draftOps** - Append-only queue of local changes

### Sync Strategy (Draft Operations)

**Bootstrap (Pull)** -> **Edit (Local)** -> **Push (Sync)**

1. **Bootstrap**: `useMenuBootstrap` fetches all data.
2. **Edit**: UI writes to IndexedDB and logs a `draftOp`.
3. **Push**: `useMenuPush` processes `draftOps`, uploads images, and syncs to server.

**Kitchen-Specific Sync Flow**:
1. **Local Create/Update**: `DraftOpsRepository` enforces unique dishes, updates all affected kitchens.
2. **Draft Op Created**: Payload includes `dishIds` and `removeDishIds`.
3. **Push Menu**: Resolves IDs, syncs to backend, updates local records with server IDs.

## 🛠 Usage / Dev Notes

### Kitchen Flow
1. **Create**: Open `KitchenForm`. Fill details. Select dishes in right panel. Save.
2. **Local Sync**: Changes saved to `kitchens` table, affected kitchens updated, `CREATE` op logged to `draftOps`.
3. **Push**: `useMenuPush` handles API call, maps local→server IDs, updates dish references.

### Kitchen Update Flow
1. **Edit**: Modify kitchen name, description, or dish assignments.
2. **Local Reconciliation**: 
   - Removed dishes become unassigned (`kitchenId: ""`).
   - Added dishes are stolen from other kitchens.
   - All changes reflected instantly in UI.
3. **Push**: Backend receives `removeDishIds` to properly unlink dishes.

### Refresh safety
If dirty, refresh shows confirmation: "Unsaved changes will be discarded."

## 🐛 Debugging

- Check **Application > IndexedDB > HipalMenuDB** in Chrome DevTools.
- Inspect `draftOps` table to see pending changes.
- Check `pendingImages` table for upload queue.
- **Kitchen Debugging**:
  - Verify `dishKitchenAssignments` in console after operations.
  - Check `removedFromOtherKitchens` telemetry data.
  - Ensure no duplicate `dishIds` across kitchens in same scope.
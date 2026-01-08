# Bulk Image Upload Architecture

**Production-grade modular architecture following strict engineering rules.**

## Folder Structure

```
clients/client-hibiz-react/src/components/organism/menu-v2/
├── domain/                           # Domain utilities (business logic)
│   ├── imageLabelParser.ts          # Label parsing with slot detection
│   └── slotManager.ts               # Image slot management (1-3)
│
├── store/                           # Zustand state management
│   ├── useBulkImageUploadStore.ts   # Main store (NO useState!)
│   └── useMenuUIStore.ts            # Existing UI store
│
├── services/                        # Service layer (side effects)
│   ├── imageProcessingService.ts    # Compression, hashing, Web Workers
│   ├── imageUploadService.ts        # Cloud upload + deduplication
│   └── imageAssignmentService.ts    # Auto-assignment logic
│
├── components/
│   ├── BulkImageUploadModalRefactored.tsx  # UI component (uses store)
│   └── modals/
│       └── ExistingImagesPickerModal.tsx   # Reuse existing images
│
├── utils/
│   └── imageMatcher.ts              # Existing fuzzy matching
│
└── hooks/
    └── useImageSync.ts              # Existing shared dish logic
```

## Core Components

### 1. Domain Utilities

#### `imageLabelParser.ts`

**Purpose**: Parse dish image labels to extract base name and slot suffix.

**Key Functions**:
- `parseDishImageLabel(label: string) -> { baseName: string; slot?: 1|2|3 }`
- `formatDishImageLabel(baseName: string, slot: 1|2|3) -> string`

**Examples**:
```typescript
parseDishImageLabel("Chicken 65-1") => { baseName: "Chicken 65", slot: 1 }
parseDishImageLabel("Chicken 65-2") => { baseName: "Chicken 65", slot: 2 }
parseDishImageLabel("Chicken 65") => { baseName: "Chicken 65", slot: undefined }
parseDishImageLabel("Paneer-65") => { baseName: "Paneer-65", slot: undefined }
parseDishImageLabel("Teachers 50-1") => { baseName: "Teachers 50", slot: 1 }
```

**Rules**:
- Slot suffix must be "-1", "-2", or "-3" at the end
- Pattern: `{baseName} {space}-{slot}` where slot is 1, 2, or 3
- If slot is not 1-3, treat entire label as base name
- Handles multiple spaces and trims whitespace

#### `slotManager.ts`

**Purpose**: Manage image slots (1-3) for dishes.

**Key Functions**:
- `getDishImageCount(dish: MenuDish) -> number`
- `hasAvailableSlots(dish: MenuDish) -> boolean`
- `getAvailableSlots(dish: MenuDish) -> ImageSlot[]`
- `getNextAvailableSlot(dish: MenuDish) -> ImageSlot | null`
- `getTargetSlot(dish: MenuDish, preferredSlot?: ImageSlot) -> ImageSlot | null`
- `isValidSlotAssignment(dish: MenuDish, slot: ImageSlot) -> boolean`
- `addImageToSlot(currentImages: string[], newImageUrl: string, slot: ImageSlot) -> string[]`
- `mergeImages(existingImages: string[], newImageUrls: string[]) -> string[]`

**Constants**:
- `MAX_IMAGES_PER_DISH = 3`
- `VALID_SLOTS: ImageSlot[] = [1, 2, 3]`

**Slot Rules**:
- Each dish can have max 3 images (slots 1..3)
- If label indicates a slot (e.g., "-2"), use that slot if available
- If preferred slot is unavailable, use next available slot
- If all slots are full, return null

### 2. Zustand Store

#### `useBulkImageUploadStore.ts`

**Purpose**: Centralized state management (NO React useState!).

**State**:
```typescript
interface BulkImageUploadState {
  // Images
  processedImages: ProcessedImage[];
  
  // Processing
  processingQueue: File[];
  isProcessing: boolean;
  progress: { current: number; total: number };
  
  // Assignment
  isAssigning: boolean;
  assignmentProgress: { current: number; total: number };
  
  // UI
  dragActive: boolean;
  dishSearch: string;
  showUploadMore: boolean;
  imageFilter: 'all' | 'unassigned';
  
  // Modals
  showExistingImagesPicker: boolean;
  showSaveProgress: boolean;
  saveProgress: SaveProgress | null;
  
  // Actions (all state mutations)
  addImagesToQueue: (files: File[]) => void;
  removeImage: (imageId: string) => void;
  updateImage: (imageId: string, updates: Partial<ProcessedImage>) => void;
  assignImageToDish: (imageId: string, dishId: string, dishName: string, slot: 1|2|3) => void;
  // ... more actions
  
  // Reset
  reset: () => void;
}
```

**Selectors** (derived state):
- `selectUnassignedImages(state) -> ProcessedImage[]`
- `selectAssignedImagesCount(state) -> number`
- `selectCompletedImagesCount(state) -> number`
- `selectFilteredImages(state) -> ProcessedImage[]`

**Usage**:
```typescript
// In component
const store = useBulkImageUploadStore();
const { processedImages, addImagesToQueue } = store;

// Using selectors
const unassignedImages = useBulkImageUploadStore(selectUnassignedImages);
```

### 3. Service Layer

#### `imageProcessingService.ts`

**Purpose**: Image compression, hashing, blob management.

**Key Functions**:
- `generateImageHash(blob: Blob) -> Promise<string>` - SHA-256 hash
- `generateHashFromDataUrl(dataUrl: string) -> Promise<string>`
- `createBlobUrl(blob: Blob) -> string` - Create preview URL
- `revokeBlobUrl(url: string) -> void` - Free memory
- `processImagesWithWorker(files: File[], onProgress?) -> Promise<ImageProcessingResult[]>`

**Features**:
- Uses Web Workers for off-thread processing
- Automatic blob URL management
- Progress tracking

#### `imageUploadService.ts`

**Purpose**: Cloud upload with content-based deduplication.

**Key Functions**:
- `uploadImageToCloud(file: File, dataUrl: string) -> Promise<string | null>`
- `uploadImageWithDeduplication(file: File, dataUrl: string, hash?) -> Promise<{url, hash, wasCached}>`
- `getCachedUploadUrl(hash: string) -> string | null`
- `cacheUploadUrl(hash: string, url: string) -> void`
- `clearUploadCache() -> void`

**Deduplication Strategy**:
- SHA-256 hash of image content
- In-memory cache: `Map<hash, uploadedUrl>`
- Reuses uploaded URL if hash exists in cache
- Prevents duplicate cloud uploads for same image content

#### `imageAssignmentService.ts`

**Purpose**: Automatic image-to-dish assignment.

**Key Functions**:
- `autoAssignImageToDish(image: ProcessedImage, dishes: MenuDish[], existingAssignments?, options?) -> AssignmentResult | null`
- `batchAutoAssignImages(images: ProcessedImage[], dishes: MenuDish[], existingAssignments?, options?, batchSize?, onProgress?) -> Promise<AssignmentResult[]>`

**Assignment Rules**:
1. Parse filename to extract base name and preferred slot
2. Match base name to dish using fuzzy matching (Levenshtein)
3. Check if dish has available slots
4. Use preferred slot if available, otherwise use next available slot
5. Respect max 3 images constraint
6. Skip dishes that are already full

**Options**:
```typescript
interface AssignmentOptions {
  minConfidence?: number;        // Default: 0.6
  respectSlotConstraints?: boolean; // Default: true
  skipFullDishes?: boolean;      // Default: true
}
```

### 4. UI Component

#### `BulkImageUploadModalRefactored.tsx`

**Purpose**: Main UI component using Zustand store.

**Features**:
- **No useState** - All state from Zustand store
- Drag & drop file upload
- Image processing with progress
- Auto-assignment button
- Manual assignment via drag/drop
- "Use Existing Images" picker
- Fixed bottom "Save Images" button
- Filter: all/unassigned images

**Key Handlers**:
- `handleFileSelect(files)` - Process uploaded files
- `handleAutoAssign()` - Trigger auto-assignment
- `handleAssignToDish(imageId, dishId)` - Manual assignment
- `handleSave()` - Save assignments (TODO: implement full logic)

## Usage Example

```typescript
import { BulkImageUploadModalRefactored } from './components/BulkImageUploadModalRefactored';
import { useBulkImageUploadStore } from './store/useBulkImageUploadStore';

function MyComponent() {
  const dishes = useDishes(); // Your dishes data
  const menus = useMenus();   // Your menus data
  
  return (
    <BulkImageUploadModalRefactored
      isOpen={isModalOpen}
      onClose={() => setModalOpen(false)}
      dishes={dishes}
      businessId={businessId}
      menus={menus}
      selectedMenuId={selectedMenuId}
      onSave={handleSave}
    />
  );
}
```

## Integration Points

### Existing Code

1. **`useImageSync` hook**: Used for shared dish logic
   - `getSharedDishIds(dishId, nameKey)`
   - `getGlobalImages(dishId, nameKey)`
   - `getAvailableSlots(dishId, nameKey)`

2. **`PendingImagesRepository`**: Local storage for pending images
   - `savePendingImages(dishId, businessId, images, replaceExisting)`
   - `getPendingImages(dishId)`
   - `clearPendingImages(dishId)`

3. **`imageMatcher.ts`**: Fuzzy matching utility
   - `autoAssignImage(filename, dishes, minConfidence)`

### Save Flow (TODO)

The `handleSave` function needs full implementation:

1. **Group by nameKey** (for shared dishes)
2. **Upload images** with deduplication
3. **Apply to dishes** via `PendingImagesRepository`
4. **Show progress** via `SaveProgressModal`
5. **Handle errors** gracefully

## Edge Cases Handled

1. **Max 3 Images**: Enforced at all assignment points
2. **Slot Preferences**: Uses preferred slot from label if available
3. **Duplicate Detection**: Checks for duplicate URLs before assignment
4. **Full Dishes**: Auto-assign skips dishes that are already full
5. **Reused Images**: Flags existing images to skip cloud upload
6. **Memory Management**: Revokes blob URLs when images are removed
7. **Batch Processing**: Processes in chunks to keep UI responsive

## Performance Optimizations

1. **Normalized State**: Zustand store with efficient selectors
2. **Batch Processing**: Images processed in chunks (10 per batch)
3. **Web Workers**: Image compression off main thread
4. **Deduplication Cache**: In-memory hash cache for uploads
5. **Selective Rendering**: Using selectors to minimize re-renders

## Testing Examples

```typescript
// Test label parsing
import { parseDishImageLabel } from './domain/imageLabelParser';

expect(parseDishImageLabel("Chicken 65-1")).toEqual({ baseName: "Chicken 65", slot: 1 });
expect(parseDishImageLabel("Paneer-65")).toEqual({ baseName: "Paneer-65", slot: undefined });

// Test slot management
import { getTargetSlot, hasAvailableSlots } from './domain/slotManager';

const dish = { _id: '1', images: ['url1', 'url2'] };
expect(hasAvailableSlots(dish)).toBe(true);
expect(getTargetSlot(dish, 3)).toBe(3); // Preferred slot available
expect(getTargetSlot(dish, 1)).toBe(null); // Preferred slot taken, use next
```

## Next Steps

1. **Complete `handleSave` implementation** with full upload + apply flow
2. **Add unit tests** for domain utilities
3. **Add integration tests** for store and services
4. **Performance testing** with 1000+ dishes
5. **Error handling** improvements
6. **Accessibility** improvements

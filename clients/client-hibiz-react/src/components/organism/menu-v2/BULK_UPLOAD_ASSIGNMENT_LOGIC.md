# Bulk Image Upload & Assignment Logic

## 📋 Overview

This document explains the complete logic flow for bulk image upload and automatic assignment to dishes in the Menu V2 module. The system processes images in the background using Web Workers, automatically matches them to dishes based on filename similarity, and assigns them to the correct image slots.

---

## 🔄 Complete Flow: Upload → Compression → Assignment → Save → Push

### Phase 1: File Upload & Queue Management

#### 1.1 File Selection (`handleFiles`)
```
User Action: Select files via input OR drag & drop
↓
1. Filter files: Only accept image/* MIME types
2. Limit to 100 images max (slice first 100)
3. Call processFilesInChunks(files, chunkSize=10)
```

**Logic:**
- Filters invalid file types
- Limits batch size to prevent memory issues
- Processes files in chunks of 10 to keep UI responsive

#### 1.2 Chunked Processing (`processFilesInChunks`)
```
For each chunk (10 files):
  1. Store original file sizes in ref (for compression stats)
  2. Add files to processing queue (Zustand store)
  3. Update progress total (increment by chunk size)
  4. 50ms delay between chunks
  5. Set isProcessing = true
```

**Key Points:**
- Files added to `processingQueue` array in store
- Progress tracked: `{ current: 0, total: N }`
- Small delays prevent UI blocking

#### 1.3 Batch Processing Trigger (`processNextBatch`)
```
useEffect triggers when:
  - Modal is open
  - Worker exists
  - Queue has items
  - isProcessing = true
  - No images currently processing
↓
processNextBatch(batchSize=5)
```

**For each file in batch:**
```
1. Generate unique imageId: `img-${Date.now()}-${Math.random()}-${filename}`
2. Create initial image entry in store:
   {
     id: imageId,
     file: File,
     filename: string,
     preview: '',
     status: 'processing',
     assignedDishId: null,
     ...
   }
3. Send to Web Worker:
   worker.postMessage({
     file: File,
     maxWidth: 1080,
     maxHeight: 1080,
     imageId: imageId  // Critical: Pass imageId to worker
   })
4. Remove file from queue
```

---

### Phase 2: Web Worker Compression

#### 2.1 Worker Processing (`workers/image.worker.js`)
```
Worker receives:
  {
    file: File,
    maxWidth: 1080,
    maxHeight: 1080,
    imageId: string  // Receives imageId from main thread
  }
↓
1. Create ImageBitmap from file
2. Calculate resize ratio (maintain aspect ratio)
3. Create OffscreenCanvas (background thread, no UI blocking)
4. Draw resized image to canvas
5. Convert to JPEG blob (quality 0.8)
6. Send back to main thread:
   {
     blob: Blob,
     originalName: string,
     imageId: string,  // Critical: Return imageId for matching
     processedWidth: number,
     processedHeight: number
   }
7. Free memory (bitmap.close())
```

**Key Points:**
- All processing happens in background thread
- Worker must receive and return `imageId` for accurate matching
- Memory freed immediately after processing

---

### Phase 3: Image Completion & Update

#### 3.1 Worker Message Handler (`worker.onmessage`)
```
When worker sends message:
  1. Extract: blob, originalName, imageId, error
  2. If error: Update image status to 'error', continue
  3. If success:
     a. Get original file size from ref
     b. Calculate compression ratio
     c. Convert blob to base64 data URL (FileReader)
     d. Create blob URL for preview (URL.createObjectURL)
     e. Generate SHA-256 hash for deduplication
     f. Find existing image entry:
        - Try by imageId first (most reliable)
        - Fallback: filename + status='processing'
     g. Update image in store:
        {
          ...existing,
          status: 'completed',
          blob: Blob,
          preview: base64DataUrl,
          previewUrl: blobUrl,
          hash: sha256Hash,
          originalSize: number,
          compressedSize: number
        }
     h. Update progress: current += 1
     i. Check if all complete:
        - If current >= total: Set isProcessing = false
        - Trigger auto-assignment (500ms delay)
```

**Critical Matching Logic:**
```typescript
// Primary: Match by imageId (sent from worker)
if (imageId && img.id === imageId) return true;

// Fallback: Match by filename + status (for safety)
return img.filename === originalName && img.status === 'processing';
```

This ensures images are correctly matched even if imageId is missing.

---

### Phase 4: Automatic Assignment

#### 4.1 Auto-Assignment Trigger
```
When all images processed (current >= total):
  1. Wait 500ms (allow state to stabilize)
  2. Get all completed, unassigned images:
     processedImages.filter(
       img => img.status === 'completed' && !img.assignedDishId
     )
  3. If unassigned.length > 0 && dishes.length > 0:
     → Call handleAutoAssignAutomatically(unassigned, dishes)
```

#### 4.2 Assignment Process (`handleAutoAssignAutomatically`)

**Step 1: Prepare**
```typescript
1. Set isAssigning = true
2. Set assignmentProgress = { current: 0, total: imagesToAssign.length }
3. Get existing assignments (imageId -> dishId map)
4. Call batchAutoAssignImages()
```

**Step 2: Batch Auto-Assignment (`batchAutoAssignImages`)**

For each batch (10 images):
```typescript
For each image:
  1. Call autoAssignImageToDish(image, dishes, existingAssignments, options)
  2. If assignment found:
     - Add to results array
     - Add to existingAssignments map (prevent duplicates)
  3. Report progress
  4. 10ms delay between batches
```

**Step 3: Single Image Assignment (`autoAssignImageToDish`)**

```typescript
1. Parse filename using parseDishImageLabel():
   Example: "Chicken 65-1.jpg" → { baseName: "Chicken 65", slot: 1 }
   Example: "Butter Chicken.jpg" → { baseName: "Butter Chicken", slot: undefined }

2. Clean filename for matching:
   cleanFileName("Butter Chicken 2.jpg")
   → Remove extension: "Butter Chicken 2"
   → Remove numbers: "Butter Chicken "
   → Remove symbols: "Butter Chicken"
   → Lowercase: "butter chicken"

3. Match to dish using autoAssignImage():
   For each dish:
     a. Clean dish name (lowercase)
     b. Calculate similarity using Levenshtein distance:
        similarity = (longer.length - distance) / longer.length
     c. Check if names contain each other (boost score to 0.85)
     d. Track best match with highest confidence
   
   Return match if confidence >= 0.6 (60%)

4. Check dish availability:
   - If skipFullDishes = true: Check if dish has < 3 images
   - If full: Return null (skip assignment)

5. Get target slot:
   - If preferredSlot exists (from filename like "-1", "-2", "-3"):
     Use getTargetSlot(dish, preferredSlot)
   - Else: Use getTargetSlot(dish) → finds next available slot (1-3)
   
   getTargetSlot logic:
     - If preferredSlot specified and available: Use it
     - If preferredSlot taken: Use next available (1, 2, or 3)
     - If no slots available: Return null

6. Check for duplicates:
   - If image already assigned to this dish: Return null

7. Return assignment result:
   {
     imageId: string,
     dishId: string,
     dishName: string,
     slot: 1 | 2 | 3,
     confidence: number (0-1)
   }
```

**Step 4: Apply Assignments**
```typescript
For each assignment result:
  assignImageToDishInStore(
    imageId,
    dishId,
    dishName,
    slot
  )

Store update:
  processedImages.map(img =>
    img.id === imageId
      ? { ...img, assignedDishId, assignedDishName, assignedSlot }
      : img
  )
```

#### 4.3 Fuzzy Matching Algorithm (`autoAssignImage`)

**Levenshtein Distance Calculation:**
```
Example: "butter chicken" vs "butter chiken"

Matrix calculation:
  b u t t e r   c h i c k e n
b 0 1 2 3 4 5 6 7 8 9 10 11 12
u 1 0 1 2 3 4 5 6 7 8 9  10 11
t 2 1 0 1 2 3 4 5 6 7 8  9  10
t 3 2 1 0 1 2 3 4 5 6 7  8  9
e 4 3 2 1 0 1 2 3 4 5 6  7  8
r 5 4 3 2 1 0 1 2 3 4 5  6  7

Distance = 1 (one character difference: 'i' missing)
Similarity = (14 - 1) / 14 = 0.93 (93% match)
```

**Confidence Boost:**
```typescript
// If one string contains the other, boost confidence
if (dishName.includes(cleanedFileName) || cleanedFileName.includes(dishName)) {
  score = Math.max(similarity, 0.85);  // Minimum 85% if contains
}
```

---

### Phase 5: Manual Assignment (Drag & Drop / Click)

#### 5.1 Drag & Drop
```
1. Image must be status === 'completed' (can't drag processing images)
2. onDragStart:
   - Check status === 'completed'
   - Set dataTransfer.effectAllowed = 'move'
   - Set dataTransfer.setData('text/plain', imageId)
   - Set dataTransfer.setData('imageId', imageId)

3. onDragOver (dish row):
   - Check dataTransfer.types.includes('text/plain')
   - Check dataTransfer.effectAllowed === 'move'
   - Check dish has available slots (< 3 images)
   - If all good: Show drop highlight

4. onDrop:
   - Call assignToDish(imageId, dishId)
```

#### 5.2 Assignment Validation (`assignToDish`)
```typescript
1. Check image status === 'completed'
2. Check if image URL already in dish (prevent duplicates)
3. Check pending assignments for duplicates
4. Check available slots (including pending):
   availableSlots = existingImages.length + pendingAssignments.length
   If availableSlots >= 3: Block with toast error
5. Parse filename for preferred slot (if "-1", "-2", "-3")
6. Get target slot using getTargetSlot(dish, preferredSlot)
7. If shared dish (multiple menus):
   → Show SharedDishConfirmModal
   Else:
   → Direct assignment via store
```

---

### Phase 6: Save to Local Database

#### 6.1 Save Process (`handleSave`)
```typescript
1. Group images by nameKey (for global sync):
   Map<nameKey, { dishIds: string[], images: Array }>

2. For each nameKey group:
   a. Get all dish IDs that share this nameKey
   b. Get existing images from dishes (already in IndexedDB)
   c. Get existing pending images
   d. Merge: existing + new (enforce max 3)
   e. Filter duplicates by URL
   
3. For each dish:
   a. Prepare images array (max 3)
   b. Save to PendingImagesRepository:
      - Store base64 preview
      - Store file (for upload later)
      - Store imageIndex (0, 1, or 2)
   
4. Show SaveProgressModal with:
   - Progress: X/Y images
   - Dishes updated: A/B dishes
   
5. Call onSave callback (for external handling)
```

**Merge Logic (Fix 5 - No Overwrite):**
```typescript
const allImages = [
  ...existingImages,           // From dish.images
  ...existingPending,          // From PendingImagesRepository
  ...newImages                 // From current session
].slice(0, 3);  // Enforce max 3

// Filter duplicates by URL
const uniqueImages = allImages.filter((img, idx, arr) =>
  arr.findIndex(i => i.preview === img.preview) === idx
);
```

---

### Phase 7: Push to Server

#### 7.1 Image Upload (`useMenuPush`)
```typescript
1. Get all pending images from PendingImagesRepository

2. For each pending image:
   a. Check if reused URL (starts with http/https):
      → Skip upload, use URL directly
   b. Else (base64 preview):
      → Convert base64 to File
      → Generate SHA-256 hash
      → Check uploadCache[hash]:
         - If exists: Reuse URL (deduplication)
         - Else: Upload to cloud storage
         - Cache uploaded URL by hash

3. Group uploaded URLs by dishId:
   Map<dishId, [url1, url2, url3]>

4. For each dish:
   a. Get existing images
   b. Merge: existing + new (filter duplicates, max 3)
   c. Create draft op: { entity: 'DISH', opType: 'UPDATE', payload: { images: [...] } }
   d. Clear pending images for dish

5. Push draft ops to server (chunked, 200 per batch)
```

**Deduplication Strategy:**
```typescript
const uploadedImagesCache = new Map<string, string>();  // hash -> url

For each image:
  hash = SHA256(blob)
  if (uploadedImagesCache.has(hash)):
    url = uploadedImagesCache.get(hash)  // Reuse
  else:
    url = await uploadToCloud(blob)
    uploadedImagesCache.set(hash, url)   // Cache
```

---

## 🔑 Key Algorithms

### 1. Filename Parsing (`parseDishImageLabel`)
```typescript
Input: "Chicken 65-1.jpg"
↓
1. Remove extension: "Chicken 65-1"
2. Trim: "Chicken 65-1"
3. Check pattern: /^\s*(.+?)\s+-\s*([123])\s*$/
   - Group 1: "Chicken 65"
   - Group 2: "1" (slot)
4. Return: { baseName: "Chicken 65", slot: 1 }

Input: "Paneer-65.jpg"
↓
Pattern doesn't match (slot not 1-3)
Return: { baseName: "Paneer-65", slot: undefined }
```

### 2. Slot Selection (`getTargetSlot`)
```typescript
Input: dish with 1 image, preferredSlot = 2
↓
Current images: [url1, null, null]  // Slot 1 taken
↓
If preferredSlot = 2 and available:
  Return 2
Else:
  Find next available: 2 (available)
  Return 2

Input: dish with 2 images, preferredSlot = 1
↓
Current images: [url1, url2, null]  // Slot 1 and 2 taken
↓
If preferredSlot = 1 and NOT available:
  Find next available: 3 (available)
  Return 3
```

### 3. Levenshtein Distance
```typescript
Function: Calculate minimum edits to transform str1 → str2
Operations: Insert, Delete, Substitute

Example:
  str1 = "butter"
  str2 = "butter chicken"
  
  Distance = 8 (8 insertions to add " chicken")
  Similarity = (14 - 8) / 14 = 0.43 (43%)
  
  But if str1 contains str2:
    "butter chicken" contains "butter"
    → Boost to 0.85 (85%)
```

---

## 🎯 Assignment Rules Summary

1. **Max 3 Images Per Dish**: Hard limit, enforced globally
2. **Slot Management**: 
   - Use preferred slot from filename if available (e.g., "-1" → slot 1)
   - Otherwise find next available slot (1, 2, or 3)
3. **Duplicate Prevention**:
   - Check by URL (if same URL already in dish, block)
   - Check pending assignments (if same image assigned in session, block)
4. **Confidence Threshold**: 0.6 (60% similarity required for auto-assignment)
5. **Skip Full Dishes**: Dishes with 3 images are automatically skipped
6. **Global Sync**: Shared dishes (same nameKey) get images synced across all menus

---

## 📊 State Management (Zustand Store)

### Processed Images State
```typescript
processedImages: ProcessedImage[] = [
  {
    id: string,
    file: File,
    filename: string,
    preview: string (base64),
    previewUrl: string (blob URL),
    status: 'processing' | 'completed' | 'error',
    assignedDishId: string | null,
    assignedDishName: string | null,
    assignedSlot: 1 | 2 | 3 | null,
    hash: string (SHA-256),
    originalSize: number,
    compressedSize: number,
    confidence: number | null,
    isReused?: boolean
  }
]
```

### Progress Tracking
```typescript
progress: { current: number, total: number }
isProcessing: boolean
isAssigning: boolean
assignmentProgress: { current: number, total: number }
processingQueue: File[]
```

---

## 🐛 Debugging Tips

### Console Logs Available:
- `[BulkImageUpload] handleFiles called`
- `[BulkImageUpload] processFilesInChunks called`
- `[BulkImageUpload] Worker message received`
- `[BulkImageUpload] Image updated to completed`
- `[BulkImageUpload] Auto-triggering assignment after compression`
- `[BulkImageUpload] Starting auto-assign (automatic)`
- `[BulkImageUpload] Auto-assign complete`

### Common Issues:

1. **Worker not receiving imageId**: Check worker.postMessage includes imageId
2. **Image not matching**: Check imageId in worker response matches store entry
3. **Auto-assign not triggering**: Check unassigned filter (status='completed' && !assignedDishId)
4. **Duplicate assignments**: Check existingAssignments map is being updated

---

## 🚀 Performance Optimizations

1. **Web Worker**: Offloads compression to background thread
2. **Chunked Processing**: 5 images per batch prevents UI blocking
3. **Batched Assignment**: 10 images per assignment batch
4. **Delayed State Updates**: 500ms delay before auto-assign for state stabilization
5. **Hash-based Deduplication**: SHA-256 ensures same image uploaded only once
6. **Blob URL Management**: Properly revokes URLs to prevent memory leaks

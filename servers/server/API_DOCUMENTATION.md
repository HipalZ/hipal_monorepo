# Hipal Server API Documentation

## Overview

This documentation covers the API endpoints for managing Zones, Tables, Kitchens, and the mapping between Dishes, Zones, and Kitchens. All endpoints use MongoDB transactions for data consistency and include comprehensive validation.

---

## Table of Contents

1. [Zones & Tables (`/zonesAndTables`)](#1-zones---tables-zonesandtables)
   - [Zones](#a-zones)
   - [Tables](#b-tables)
2. [Dish-Zone-Kitchen Mapping (`/dishZoneKitchen`)](#2-dish-zone-kitchen-mapping-dishzonekitchen)
3. [Kitchen Management (`/kitchen`)](#3-kitchen-management-kitchen)
4. [Data Models](#data-models)
5. [Validators](#validators)
6. [Key Constraints & Logic](#key-constraints--logic)

---

## 1. Zones & Tables (`/zonesAndTables`)

**Base Path:** `/zonesAndTables` (mounted in main router)

### A. Zones

#### 1. Create Zone
- **Endpoint:** `POST /zonesAndTables/zone`
- **Method:** POST
- **Validator:** `zoneChema` (from `@hi/db-models/src/validators`)
- **Description:** Creates a new zone for a business. Zones are physical areas within a restaurant (e.g., "Dine-In", "Patio", "Pool Area").

**Request Body:**
```json
{
  "businessId": "string (ObjectId, required)",
  "name": "string (required, min: 1, max: 100)",
  "staffIds": ["string (ObjectId, optional)"],
  "visibility": boolean (default: true),
  "taxes": number (optional, min: 1, max: 100),
  "couponIds": ["string (ObjectId, optional)"],
  "tableIds": ["string (ObjectId, optional)"]
}
```

**Validation Rules:**
- `name`: Required, 1-100 characters
- `businessId`: Required, valid MongoDB ObjectId
- `staffIds`: Optional array of ObjectIds
- `taxes`: Optional, 1-100 (percentage)
- `couponIds`: Optional array of ObjectIds
- `tableIds`: Optional array of ObjectIds

**Business Logic:**
1. **POS Check:** 
   - Checks if the business has an active POS configuration
   - If a POS other than `HIPAL_Z` exists, creation is blocked (409 Conflict)
   - Error: `"pos is enabled for this business you can't create zone"`

2. **HIPAL_Z POS Check:**
   - Checks if `HIPAL_Z` POS is active
   - Sets `pos: true` on the zone if HIPAL_Z is active

3. **Duplicate Check:**
   - Checks if a zone with the same `name` already exists for the business where `active: true`
   - Returns 409 Conflict if duplicate found
   - Error: `"Zone with this name already exists"`

4. **Zone ID Generation:**
   - Generates a unique `zoneId` using `nanoid(10)`
   - This is a short identifier (10 characters) separate from MongoDB `_id`

5. **Creation:**
   - Creates new `Zone` document with all provided fields
   - Sets `pos: !!hipalZPos` (boolean based on HIPAL_Z presence)
   - Saves within a MongoDB transaction

**Response:**
- **201 Created:**
```json
{
  "message": "Zone created successfully",
  "err": false,
  "data": {}
}
```

- **409 Conflict:** (POS enabled or duplicate name)
```json
{
  "message": "pos is enabled for this business you can't create zone" | "Zone with this name already exists",
  "err": true
}
```

---

#### 2. Update Zone
- **Endpoint:** `PUT /zonesAndTables/zone`
- **Method:** PUT
- **Validator:** `updateZoneChema` (from `@hi/db-models/src/validators`)
- **Description:** Updates an existing zone. Cannot update zones with active tables.

**Request Body:**
```json
{
  "businessId": "string (ObjectId, required)",
  "zoneId": "string (required, min: 3, max: 100) - internalZoneId (MongoDB _id)",
  "name": "string (optional, min: 1, max: 100)",
  "staffIds": ["string (ObjectId, optional)"],
  "visibility": boolean (default: true),
  "tableIds": ["string (ObjectId, optional)"],
  "kitchenIds": ["string (ObjectId, optional)"]
}
```

**Validation Rules:**
- `zoneId`: Required, MongoDB ObjectId (24 chars) - this is the internal `_id`, not the `zoneId` field
- `businessId`: Required, valid MongoDB ObjectId
- `name`: Optional, 1-100 characters
- `staffIds`: Optional array of ObjectIds
- `kitchenIds`: Optional array of ObjectIds (appended using `$addToSet`)

**Business Logic:**
1. **POS Check:**
   - Similar to creation, blocked if external POS exists
   - Error: `"pos is enabled for this business you can't update zone"`

2. **Active Table Check:**
   - Checks if the zone contains any tables with `status="ACTIVE"`
   - Query: `Table.findOne({ internalZoneId: zoneId, status: "ACTIVE", businessId })`
   - If active tables exist, update is blocked (409 Conflict)
   - Error: `"you can't update this zone because this zone has active tables"`

3. **Update Operation:**
   - Uses `Zone.findOneAndUpdate()` with filter: `{ _id: zoneId, businessId }`
   - Updates fields using `$set`:
     - `name`
     - `staffIds`
     - `visibility`
     - `tableIds`
   - Uses `$addToSet` for `kitchenIds` to append new kitchens without duplicates:
     ```javascript
     $addToSet: {
       kitchenIds: { $each: kitchenIds }
     }
     ```
   - Returns updated document (`new: true`)

4. **Error Handling:**
   - If zone not found, throws error: `"Zone not found"`

**Response:**
- **200 OK:**
```json
{
  "message": "Zone update successfully",
  "err": false,
  "data": updatedZone // Full zone document
}
```

- **409 Conflict:** (POS enabled or active tables)
```json
{
  "message": "pos is enabled for this business you can't update zone" | "you can't update this zone because this zone has active tables",
  "err": true
}
```

---

#### 3. Get Zones by Business
- **Endpoint:** `GET /zonesAndTables/zones/:businessId`
- **Method:** GET
- **Description:** Fetches all active zones for a business, filtered by POS configuration.

**Path Parameters:**
- `businessId`: string (required, min: 1, max: 500)

**Query Logic:**
1. **POS Configuration Check:**
   - Checks if business has active POS config: `BusinessPosConfig.exists({ businessId, isDeleted: false, active: true })`
   - This determines the `pos` filter value

2. **Zone Query:**
   - Finds zones where:
     - `businessId` matches
     - `isDeleted: false`
     - `active: true`
     - `pos: !!businessPosConfig` (matches POS config status)

**Response:**
- **200 OK:**
```json
{
  "message": "zones fetched successfully",
  "err": false,
  "data": [
    {
      "_id": "ObjectId",
      "businessId": "ObjectId",
      "name": "string",
      "zoneId": "string (nanoid)",
      "staffIds": ["ObjectId"],
      "visibility": boolean,
      "taxes": number,
      "couponIds": ["ObjectId"],
      "tableIds": ["ObjectId"],
      "kitchenIds": ["ObjectId"],
      "pos": boolean,
      "active": boolean,
      "isDeleted": boolean,
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ]
}
```

---

#### 4. Get Zone Kitchens
- **Endpoint:** `GET /zonesAndTables/zones/kitchen/:zoneId`
- **Method:** GET
- **Description:** Fetches all kitchens assigned to a specific zone.

**Path Parameters:**
- `zoneId`: string (required, min: 24, max: 24) - MongoDB ObjectId

**Query Logic:**
1. **Zone Lookup:**
   - Finds zone: `Zone.findOne({ _id: zoneId, isDeleted: false })`
   - Returns 404 if zone not found

2. **Kitchen Extraction:**
   - Extracts `kitchenIds` array from zone document
   - Queries `Kitchen.find({ _id: { $in: kitchenIds } })`
   - Selects only `_id` and `name` fields

**Response:**
- **200 OK:**
```json
{
  "message": "Zone kitchen fetched successfully",
  "err": false,
  "data": [
    {
      "_id": "ObjectId",
      "name": "string"
    }
  ]
}
```

- **404 Not Found:**
```json
{
  "message": "Zone not found",
  "err": true,
  "data": {}
}
```

---

### B. Tables

#### 1. Create Table
- **Endpoint:** `POST /zonesAndTables/table`
- **Method:** POST
- **Validator:** `createTableSchema` (from `@hi/db-models/src/validators`)
- **Description:** Creates one or multiple tables. Supports range naming (e.g., "A1-A10" creates A1, A2, A3...A10).

**Request Body:**
```json
{
  "businessId": "string (ObjectId, required)",
  "internalZoneId": "string (ObjectId, required)",
  "name": "string (required, min: 1, max: 100) - e.g., 'Table 1' or 'T1-T5'",
  "staffIds": ["string (ObjectId, optional)"],
  "visibility": boolean (default: true),
  "capacity": number (optional)
}
```

**Validation Rules:**
- `name`: Required, trimmed, 1-100 characters
- `businessId`: Required, valid MongoDB ObjectId
- `internalZoneId`: Required, valid MongoDB ObjectId (reference to Zone)
- `staffIds`: Optional array of ObjectIds
- `capacity`: Optional number

**Business Logic:**

1. **POS Check:**
   - Checks for external POS (not HIPAL_Z)
   - Blocked if external POS exists
   - Error: `"pos is enabled for this business you can't create table"`

2. **Zone Validation:**
   - Verifies zone exists: `Zone.findById(internalZoneId)`
   - Returns 404 if zone not found

3. **Duplicate Check:**
   - Checks if table with same `name` exists: `Table.findOne({ businessId, name, active: true })`
   - Returns 409 if duplicate found

4. **Range Pattern Detection:**
   - Detects if `name` matches pattern: `^(.*?)(\d+)-(\d+)$`
   - Example: "A1-A5" → baseName="A", start=1, end=5
   - If match found, creates multiple tables (A1, A2, A3, A4, A5)

5. **Table Creation (Range):**
   - For each table in range:
     - Checks for duplicates (skips if exists)
     - Generates unique `tableId` using `nanoid(10)`
     - Creates QR code URL:
       - `longUrl`: `https://hipal-test.hipalz.com/${businessInfo?.customLink}/explore?tableName=${tableName}`
       - `shortUrl`: `https://api.test.hipalz.com/surl/${uniqueOrderId}`
       - Creates `UrlModel` document
     - Creates `Table` document with:
       - `tableId`: nanoid(10)
       - `zoneId`: zone's `zoneId` (string, not ObjectId)
       - `tableLink`: short URL
       - `pos`: boolean (based on HIPAL_Z presence)
     - Updates `Zone` to include new `tableId` in `tableIds` array using `$addToSet`
   - If no new tables created (all duplicates), returns 409

6. **Table Creation (Single):**
   - Similar flow but for one table
   - Generates QR code URL
   - Creates table and updates zone

**Response:**
- **201 Created:**
```json
{
  "message": "Tables created successfully" | "table created successfully",
  "err": false,
  "data": [createdTables] | {}
}
```

- **409 Conflict:** (POS enabled, duplicate name, or all tables already exist)
```json
{
  "message": "pos is enabled for this business you can't create table" | "Table with this name already exists" | "No new tables were created because they already exist",
  "err": true,
  "data": {}
}
```

- **404 Not Found:**
```json
{
  "message": "Zone not found",
  "err": true,
  "data": {}
}
```

---

#### 2. Update Table
- **Endpoint:** `PUT /zonesAndTables/table`
- **Method:** PUT
- **Validator:** `updateTableSchema` (from `@hi/db-models/src/validators`)
- **Description:** Updates table details. Cannot update active tables.

**Request Body:**
```json
{
  "businessId": "string (ObjectId, required)",
  "tableId": "string (ObjectId, required) - MongoDB _id",
  "name": "string (required, min: 1, max: 100)",
  "staffIds": ["string (ObjectId, optional)"],
  "visibility": boolean (default: true),
  "capacity": number (optional),
  "internalZoneId": "string (ObjectId, required)"
}
```

**Validation Rules:**
- `tableId`: Required, MongoDB ObjectId
- `businessId`: Required, valid MongoDB ObjectId
- `name`: Required, 1-100 characters
- `internalZoneId`: Required, valid MongoDB ObjectId

**Business Logic:**

1. **POS Check:**
   - Checks for external POS
   - Blocked if external POS exists
   - Error: `"pos is enabled for this business you can't create table"`

2. **Active Table Check:**
   - Fetches table: `Table.findById(tableId)`
   - If `status === "ACTIVE"`, update is blocked (409 Conflict)
   - Error: `"you can't update this table because this table is active"`

3. **Duplicate Check:**
   - Checks if another table (different businessId) has same name
   - Query: `Table.findOne({ businessId: { $ne: businessId }, name: { $eq: name } })`
   - Returns 409 if duplicate found

4. **Visibility Validation:**
   - If `visibility: false`, checks if table status is "EMPTY"
   - Cannot hide table if status is not "EMPTY"
   - Error: `"you can't hide this table because this table is not empty"`

5. **QR Code Update:**
   - If name changes, updates underlying `UrlModel`:
     - Finds URL by: `{ businessId, shortUrl: tableAlreadyActive?.tableLink }`
     - Updates `longUrl`: `https://hipal-test.hipalz.com/${businessId}/explore?tableName=${name}`

6. **Table Update:**
   - Uses `Table.findOneAndUpdate()` with filter: `{ _id: tableId, businessId }`
   - Updates: `name`, `staffIds`, `visibility`, `capacity`, `internalZoneId`
   - Returns updated document

7. **Zone Update:**
   - Updates zone to include table in `tableIds` using `$addToSet`

**Response:**
- **200 OK:**
```json
{
  "message": "table updated successfully",
  "err": false,
  "data": {}
}
```

- **409 Conflict:** (POS enabled, active table, duplicate name, or cannot hide)
```json
{
  "message": "pos is enabled for this business you can't create table" | "you can't update this table because this table is active" | "Table with this name already exists" | "you can't hide this table because this table is not empty",
  "err": true
}
```

---

#### 3. Get Tables by Business
- **Endpoint:** `GET /zonesAndTables/tables/:businessId`
- **Method:** GET
- **Description:** Fetches all active, visible tables for a business, filtered by POS configuration.

**Path Parameters:**
- `businessId`: string (required, min: 1, max: 500)

**Query Logic:**
1. **POS Configuration Check:**
   - Checks if business has active POS config
   - Determines `pos` filter value

2. **Table Query:**
   - Finds tables where:
     - `businessId` matches
     - `isDeleted: false`
     - `visibility: true`
     - `active: true`
     - `pos: !!businessPosConfig` (matches POS config status)

**Response:**
- **200 OK:**
```json
{
  "message": "Tables fetched successfully",
  "err": false,
  "data": [
    {
      "_id": "ObjectId",
      "businessId": "ObjectId",
      "name": "string",
      "tableId": "string (nanoid)",
      "zoneId": "string (zone's zoneId)",
      "internalZoneId": "ObjectId",
      "staffIds": ["ObjectId"],
      "capacity": number,
      "visibility": boolean,
      "status": "EMPTY" | "ACTIVE" | "BILL",
      "tableLink": "string (short URL)",
      "currentTableAmount": number,
      "pos": boolean,
      "active": boolean,
      "isDeleted": boolean,
      "createdAt": "Date",
      "updatedAt": "Date"
    }
  ]
}
```

---

#### 4. Fetch Active Tables (Dashboard/POS)
- **Endpoint:** `GET /zonesAndTables/fetch_active_tables/:businessId`
- **Method:** GET
- **Description:** Fetches tables currently in use ("ACTIVE" status), grouped by Zone. Used for POS dashboards.

**Path Parameters:**
- `businessId`: string (required, min: 1, max: 500)

**Query Logic:**
1. **POS Configuration Check:**
   - Checks if business has active POS config
   - Filters zones and tables by `pos` status

2. **Zone Query:**
   - Finds active zones: `Zone.find({ businessId, isDeleted: false, active: true, pos: !!businessPosConfig })`

3. **Table Aggregation:**
   - For each zone, finds active tables:
     - `Table.find({ businessId, zoneId: zone.zoneId, status: "ACTIVE", active: true })`
   - Calculates `totalTableAmount` by summing `currentTableAmount` from all active tables
   - Groups tables by zone

**Response:**
- **200 OK:**
```json
{
  "message": "Active tables fetched successfully",
  "err": false,
  "data": {
    "totalTableAmount": 123.45,
    "zoneAndTables": [
      {
        "zoneName": "Patio",
        "tables": [
          {
            "tableName": "P1",
            "currentTableAmount": 50.00
          },
          {
            "tableName": "P2",
            "currentTableAmount": 75.45
          }
        ]
      },
      {
        "zoneName": "Dine-In",
        "tables": [
          {
            "tableName": "D1",
            "currentTableAmount": 100.00
          }
        ]
      }
    ]
  }
}
```

---

## 2. Dish-Zone-Kitchen Mapping (`/dishZoneKitchen`)

**Base Path:** `/dishZoneKitchen` (mounted in main router)

**Purpose:** Defines which Kitchen prepares a specific Dish when ordered from a specific Zone. This enables fine-grained routing where the same dish can be prepared by different kitchens depending on the zone it's ordered from.

**Example Use Case:**
- "Burger" ordered from "Pool Zone" → goes to "Pool Kitchen"
- "Burger" ordered from "Dine-In Zone" → goes to "Main Kitchen"

---

#### 1. Update/Create Mappings (Bulk)
- **Endpoint:** `POST /dishZoneKitchen/`
- **Method:** POST
- **Validator:** `{ dishZoneKitches: array(dishZoneKitchenSchema) }`
- **Description:** Creates or updates multiple dish-zone-kitchen mappings in a single transaction. Uses upsert logic.

**Request Body:**
```json
{
  "dishZoneKitches": [
    {
      "dishId": "string (ObjectId, required)",
      "zoneId": "string (ObjectId, required)",
      "kitchenId": "string (ObjectId, required)",
      "businessId": "string (ObjectId, required)"
    }
  ]
}
```

**Validation Rules:**
- `dishZoneKitches`: Required array
- Each item must have:
  - `dishId`: Required, valid MongoDB ObjectId
  - `zoneId`: Required, valid MongoDB ObjectId
  - `kitchenId`: Required, valid MongoDB ObjectId
  - `businessId`: Required, valid MongoDB ObjectId

**Business Logic:**

1. **Entity Extraction:**
   - Extracts unique IDs from all items:
     - `dishIds`: Array of unique dish IDs
     - `kitchenIds`: Array of unique kitchen IDs
     - `zoneIds`: Array of unique zone IDs
     - `businessIds`: Array of unique business IDs

2. **Batch Validation:**
   - Validates all referenced entities exist in database:
     - `Dish.find({ _id: { $in: dishIds }, isDeleted: false }).select("_id").lean()`
     - `Kitchen.find({ _id: { $in: kitchenIds } }).select("_id").lean()`
     - `Zone.find({ _id: { $in: zoneIds }, isDeleted: false }).select("_id").lean()`
     - `Business.find({ _id: { $in: businessIds } }).select("_id").lean()`
   - Creates Sets for O(1) lookup

3. **Individual Item Validation:**
   - For each item in `dishZoneKitches`:
     - Checks if `dishId` exists in dishSet → 404 if missing
     - Checks if `kitchenId` exists in kitchenSet → 404 if missing
     - Checks if `zoneId` exists in zoneSet → 404 if missing
     - Checks if `businessId` exists in businessSet → 404 if missing
   - Returns first error found (stops processing)

4. **Bulk Write Operation:**
   - Uses MongoDB `bulkWrite` with `upsert: true`
   - For each item:
     ```javascript
     {
       updateOne: {
         filter: {
           dishId: item.dishId,
           zoneId: item.zoneId
         },
         update: {
           $set: {
             kitchenId: item.kitchenId,
             businessId: item.businessId
           }
         },
         upsert: true
       }
     }
     ```
   - **Unique Constraint:** `dishId + zoneId` combination is unique (enforced by schema index)
   - If mapping exists, updates `kitchenId` and `businessId`
   - If mapping doesn't exist, creates new document

5. **Transaction:**
   - All operations wrapped in `runInTransaction` for atomicity

**Response:**
- **200 OK:**
```json
{
  "message": "Records updated successfully",
  "err": false,
  "data": {}
}
```

- **404 Not Found:** (Entity validation failed)
```json
{
  "message": "Dish not found: {dishId}" | "Kitchen not found: {kitchenId}" | "Zone not found: {zoneId}" | "Business not found: {businessId}",
  "err": true,
  "data": {}
}
```

---

#### 2. Get Mappings by Dish
- **Endpoint:** `GET /dishZoneKitchen/:dishId`
- **Method:** GET
- **Description:** Fetches all zone-to-kitchen routing rules for a specific dish.

**Path Parameters:**
- `dishId`: string (required)

**Query Logic:**
1. **Query:**
   - Finds all `DishZoneKitchen` documents: `DishZoneKitchen.find({ dishId })`

2. **Population:**
   - Populates related entities:
     - `dishId`: Selects `name` field
     - `kitchenId`: Selects `name` field
     - `zoneId`: Selects `name` field

3. **Data Formatting:**
   - Formats response to include both IDs and names:
     ```javascript
     {
       dishId: item.dishId?._id || item.dishId,
       dishName: item.dishId?.name || "",
       kitchenId: item.kitchenId?._id || item.kitchenId,
       kitchenName: item.kitchenId?.name || "",
       zoneId: item.zoneId?._id || item.zoneId,
       zoneName: item.zoneId?.name || ""
     }
     ```

**Response:**
- **200 OK:**
```json
{
  "message": "Fetched successfully",
  "err": false,
  "data": [
    {
      "dishId": "ObjectId",
      "dishName": "Burger",
      "kitchenId": "ObjectId",
      "kitchenName": "Main Kitchen",
      "zoneId": "ObjectId",
      "zoneName": "Dine-In"
    },
    {
      "dishId": "ObjectId",
      "dishName": "Burger",
      "kitchenId": "ObjectId",
      "kitchenName": "Pool Kitchen",
      "zoneId": "ObjectId",
      "zoneName": "Pool Zone"
    }
  ]
}
```

---

#### 3. Get Mapping by Dish & Zone
- **Endpoint:** `GET /dishZoneKitchen/:dishId/:zoneId`
- **Method:** GET
- **Description:** Fetches the specific kitchen routing for a dish in a specific zone.

**Path Parameters:**
- `dishId`: string (required)
- `zoneId`: string (required)

**Query Logic:**
1. **Query:**
   - Finds `DishZoneKitchen` documents: `DishZoneKitchen.find({ dishId, zoneId })`

2. **Population & Formatting:**
   - Same as endpoint 2 (populates and formats data)

**Response:**
- **200 OK:**
```json
{
  "message": "Fetched successfully",
  "err": false,
  "data": [
    {
      "dishId": "ObjectId",
      "dishName": "Burger",
      "kitchenId": "ObjectId",
      "kitchenName": "Main Kitchen",
      "zoneId": "ObjectId",
      "zoneName": "Dine-In"
    }
  ]
}
```

---

## 3. Kitchen Management (`/kitchen`)

**Base Path:** `/kitchen` (mounted in main router)

### Get Kitchens by Business

- **Endpoint:** `GET /kitchen/kitchenByBusiness`
- **Method:** GET
- **Description:** Fetches all kitchens for a business, regardless of menu. Returns kitchens across all menus.

**Query Parameters:**
- `businessId`: string (required, min: 1, max: 50)

**Query Logic:**
1. **Transaction:**
   - Wrapped in `runInTransaction` for consistency

2. **Kitchen Query:**
   - Finds all kitchens: `Kitchen.find({ businessId })`
   - Selects fields: `name`, `description`, `staffIds`, `dishIds`, `menuId`
   - Uses `.lean()` for performance (returns plain objects)

**Response:**
- **200 OK:**
```json
{
  "message": "fetched successfully",
  "err": false,
  "data": [
    {
      "_id": "ObjectId",
      "name": "Main Kitchen",
      "description": "Primary kitchen",
      "staffIds": ["ObjectId"],
      "dishIds": ["ObjectId"],
      "menuId": "ObjectId"
    },
    {
      "_id": "ObjectId",
      "name": "Pool Kitchen",
      "description": "Pool area kitchen",
      "staffIds": ["ObjectId"],
      "dishIds": ["ObjectId"],
      "menuId": "ObjectId"
    }
  ]
}
```

**Use Cases:**
- Used in Menu V2 for kitchen selection dropdown
- Allows selecting kitchens across all menus when creating/editing dishes
- Useful for merged menu views where dishes may come from different menus

---

## Data Models

### Zone Model

**Schema:** `packages/db-models/src/models/zone.ts`

**Fields:**
```typescript
{
  name: String (required)
  businessId: ObjectId (required, ref: "Business")
  staffIds: [ObjectId] (optional, ref: "User")
  isDeleted: Boolean (default: false)
  zoneId: String (optional, nanoid 10 chars)
  active: Boolean (default: true)
  rank: String (optional)
  couponIds: [ObjectId] (optional, ref: "COUPONZ")
  taxes: Number (optional, 1-100)
  visibility: Boolean (default: true)
  tableIds: [ObjectId] (optional, ref: "table")
  pos: Boolean (default: false)
  kitchenIds: [ObjectId] (optional, ref: "Kitchen", default: [])
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ businessId: 1, name: 1, zoneId: 1 }` (unique)
- `{ businessId: 1, name: 1 }` (unique)

**Key Fields:**
- `zoneId`: Short identifier (nanoid 10) - used in URLs and external references
- `_id`: MongoDB ObjectId - used internally for relationships
- `kitchenIds`: Array of kitchen ObjectIds assigned to this zone
- `tableIds`: Array of table ObjectIds in this zone

---

### Table Model

**Schema:** `packages/db-models/src/models/table.ts`

**Fields:**
```typescript
{
  name: String (required)
  businessId: ObjectId (required, ref: "Business")
  zoneId: String (optional) - zone's zoneId (string, not ObjectId)
  staffIds: [ObjectId] (optional, ref: "User")
  capacity: Number (optional)
  displayForCaptains: Boolean (default: true)
  hiCode: String (optional)
  isDeleted: Boolean (default: false)
  tableId: String (optional, nanoid 10 chars)
  active: Boolean (default: true)
  currentTableAmount: Number (default: 0)
  rank: String (optional)
  status: Enum ["ACTIVE", "EMPTY", "BILL"] (default: "EMPTY")
  totalItemCount: Number (default: 0)
  userIds: [ObjectId] (default: [], ref: "User")
  date: Number (optional)
  isTransfer: Boolean (default: false)
  edited: Boolean (default: false)
  editedBy: ObjectId (optional, ref: "User")
  internalZoneId: ObjectId (optional, ref: "zone")
  visibility: Boolean (default: true)
  tableLink: String (optional, short URL)
  pos: Boolean (default: false)
  isMerge: Boolean (default: false)
  mergeTableIds: [ObjectId] (default: [], ref: "table")
  mergedBy: ObjectId (optional, ref: "User", default: null)
  isBillGenerated: Boolean (default: false)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ businessId: 1, name: 1, tableId: 1 }` (unique)
- `{ businessId: 1, name: 1 }` (unique)

**Key Fields:**
- `tableId`: Short identifier (nanoid 10) - used in URLs
- `_id`: MongoDB ObjectId - used internally
- `internalZoneId`: Reference to Zone's `_id` (ObjectId)
- `zoneId`: Reference to Zone's `zoneId` (string) - used for queries
- `status`: Current state of table (EMPTY, ACTIVE, BILL)
- `tableLink`: Short URL for QR code scanning

---

### DishZoneKitchen Model

**Schema:** `packages/db-models/src/models/dishZoneKitchen/index.ts`

**Fields:**
```typescript
{
  businessId: ObjectId (required, ref: "Business")
  dishId: ObjectId (required, ref: "Dish")
  kitchenId: ObjectId (required, ref: "Kitchen")
  zoneId: ObjectId (required, ref: "zone")
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:**
- `{ dishId: 1, zoneId: 1 }` (unique) - Ensures one kitchen per dish-zone combination

**Purpose:**
- Maps which kitchen should prepare a dish when ordered from a specific zone
- Enables zone-specific kitchen routing

---

## Validators

### Zone Validators

**File:** `packages/db-models/src/validators/zone.ts`

#### `zoneChema` (Create Zone)
```typescript
{
  name: z.string().min(1).max(100) (required)
  businessId: ObjectIdSchema (required)
  staffIds: z.array(ObjectIdSchema).optional()
  zoneId: z.string().min(3).max(100).optional()
  isDeleted: z.boolean().default(false).optional()
  active: z.boolean().default(true).optional()
  rank: z.string().min(1).max(30).optional()
  visibility: z.boolean().default(true)
  taxes: z.number().min(1).max(100).optional()
  couponIds: z.array(ObjectIdSchema).optional()
  tableIds: z.array(ObjectIdSchema).optional()
  pos: z.boolean().default(false).optional()
  kitchenIds: z.array(ObjectIdSchema).optional()
}
```

#### `updateZoneChema` (Update Zone)
```typescript
{
  name: z.string().min(1).max(100).optional()
  staffIds: z.array(ObjectIdSchema).optional()
  visibility: z.boolean().default(true)
  zoneId: z.string().min(3).max(100) (required) - MongoDB _id
  kitchenIds: z.array(ObjectIdSchema).optional()
  businessId: ObjectIdSchema (required)
}
```

---

### Table Validators

**File:** `packages/db-models/src/validators/table.ts`

#### `createTableSchema` (Create Table)
```typescript
{
  name: z.string().min(1).max(100).trim() (required)
  businessId: ObjectIdSchema (required)
  staffIds: z.array(ObjectIdSchema).optional()
  capacity: z.number().optional()
  visibility: z.boolean().default(true)
  internalZoneId: ObjectIdSchema (required)
}
```

#### `updateTableSchema` (Update Table)
```typescript
{
  name: z.string().min(1).max(100) (required)
  businessId: ObjectIdSchema (required)
  staffIds: z.array(ObjectIdSchema).optional()
  capacity: z.number().optional()
  visibility: z.boolean().default(true)
  internalZoneId: ObjectIdSchema (required)
  tableId: ObjectIdSchema (required) - MongoDB _id
}
```

---

### DishZoneKitchen Validators

**File:** `packages/db-models/src/validators/dishZoneKitchen/index.ts`

#### `dishZoneKitchenSchema`
```typescript
{
  businessId: ObjectIdSchema (required)
  dishId: ObjectIdSchema (required)
  kitchenId: ObjectIdSchema (required)
  zoneId: ObjectIdSchema (required)
}
```

---

## Key Constraints & Logic

### 1. POS Restrictions

**Purpose:** Prevents conflicts with external POS systems.

**Logic:**
- Many creation/update operations check for active POS configurations
- If a POS other than `HIPAL_Z` is active, operations are blocked (409 Conflict)
- Only `HIPAL_Z` POS allows zone/table management through Hipal

**Affected Operations:**
- Create Zone
- Update Zone
- Create Table
- Update Table

**Check:**
```javascript
const isHavePos = await BusinessPosConfig.findOne({
  businessId,
  isDeleted: false,
  active: true,
  posName: { $ne: "HIPAL_Z" }
});
```

---

### 2. Atomic Transactions

**Purpose:** Ensures data consistency across multiple collections.

**Usage:**
- All critical write operations use `runInTransaction` from `@hi/utils`
- Ensures atomicity when updating:
  - Zone + Table + UrlModel (table creation)
  - Zone + Table (table updates)
  - DishZoneKitchen bulk writes

**Example:**
```javascript
return runInTransaction(async (session: ClientSession) => {
  // Multiple database operations
  await Zone.updateOne({ ... }, { session });
  await Table.create([...], { session });
  await UrlModel.create([...], { session });
});
```

---

### 3. URL Generation for Tables

**Purpose:** Automatically generates QR-code friendly URLs for table scanning.

**Process:**
1. On table creation, generates unique `urlCode` using `nanoid(5)`
2. Creates `longUrl`: `https://hipal-test.hipalz.com/${businessInfo?.customLink}/explore?tableName=${tableName}`
3. Creates `shortUrl`: `https://api.test.hipalz.com/surl/${uniqueOrderId}`
4. Stores in `UrlModel` collection
5. Links to table via `tableLink` field

**Update:**
- When table name changes, updates `UrlModel.longUrl` to reflect new table name

---

### 4. Range Table Creation

**Purpose:** Allows bulk creation of tables with sequential names.

**Pattern:**
- Detects pattern: `^(.*?)(\d+)-(\d+)$`
- Example: "A1-A5" creates tables: A1, A2, A3, A4, A5

**Logic:**
1. Extracts base name and range
2. Loops from start to end (inclusive)
3. Creates each table individually
4. Skips duplicates (continues if table already exists)
5. Returns error if no new tables created

---

### 5. Active Table Protection

**Purpose:** Prevents modifications to tables/zones that are currently in use.

**Rules:**
- **Zone Update:** Cannot update zone if it contains any tables with `status: "ACTIVE"`
- **Table Update:** Cannot update table if `status === "ACTIVE"`
- **Table Visibility:** Cannot hide table (`visibility: false`) if `status !== "EMPTY"`

**Rationale:**
- Prevents data inconsistencies during active orders
- Ensures order integrity

---

### 6. Unique Constraints

**Zone:**
- `{ businessId, name, zoneId }` (unique)
- `{ businessId, name }` (unique)
- Prevents duplicate zone names per business

**Table:**
- `{ businessId, name, tableId }` (unique)
- `{ businessId, name }` (unique)
- Prevents duplicate table names per business

**DishZoneKitchen:**
- `{ dishId, zoneId }` (unique)
- Ensures one kitchen per dish-zone combination

---

### 7. Kitchen Assignment to Zones

**Purpose:** Links kitchens to zones for routing.

**Update Logic:**
- Uses `$addToSet` to append kitchens without duplicates:
  ```javascript
  $addToSet: {
    kitchenIds: { $each: kitchenIds }
  }
  ```
- Prevents duplicate kitchen assignments
- Allows incremental addition of kitchens

**Retrieval:**
- Endpoint: `GET /zonesAndTables/zones/kitchen/:zoneId`
- Returns all kitchens assigned to a zone

---

### 8. Dish-Zone-Kitchen Routing

**Purpose:** Enables zone-specific kitchen routing for dishes.

**Use Case:**
- Same dish can be prepared by different kitchens based on zone
- Example: "Burger" from "Pool Zone" → "Pool Kitchen", "Burger" from "Dine-In" → "Main Kitchen"

**Implementation:**
- `DishZoneKitchen` collection stores mappings
- Unique constraint on `{ dishId, zoneId }`
- Upsert logic updates existing mappings or creates new ones

**Query Flow:**
1. Order placed from Zone X for Dish Y
2. Query: `DishZoneKitchen.findOne({ dishId: Y, zoneId: X })`
3. Get `kitchenId` from mapping
4. Route order to that kitchen

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "message": "Error description",
  "err": true,
  "data": {}
}
```

**Common HTTP Status Codes:**
- **200 OK:** Successful operation
- **201 Created:** Resource created successfully
- **404 Not Found:** Resource not found
- **409 Conflict:** Business rule violation (duplicate, active table, POS restriction)

---

## Notes

1. **Zone ID vs Internal ID:**
   - `zoneId`: Short string (nanoid 10) - used in URLs and external references
   - `_id`: MongoDB ObjectId - used internally for relationships
   - When updating zones, `zoneId` in request body refers to `_id` (internal ID)

2. **Table ID vs Internal ID:**
   - `tableId`: Short string (nanoid 10) - used in URLs
   - `_id`: MongoDB ObjectId - used internally
   - When updating tables, `tableId` in request body refers to `_id` (internal ID)

3. **Zone-Table Relationship:**
   - Tables reference zones via `internalZoneId` (ObjectId) and `zoneId` (string)
   - Zones maintain `tableIds` array for quick lookup

4. **POS Integration:**
   - `pos: true` on zones/tables indicates HIPAL_Z POS is active
   - Used for filtering in GET endpoints

5. **Transaction Safety:**
   - All write operations use MongoDB transactions
   - Ensures data consistency across related collections

---

## Endpoint Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/zonesAndTables/zone` | Create zone | Yes |
| PUT | `/zonesAndTables/zone` | Update zone | Yes |
| GET | `/zonesAndTables/zones/:businessId` | Get zones by business | Yes |
| GET | `/zonesAndTables/zones/kitchen/:zoneId` | Get zone kitchens | Yes |
| POST | `/zonesAndTables/table` | Create table(s) | Yes |
| PUT | `/zonesAndTables/table` | Update table | Yes |
| GET | `/zonesAndTables/tables/:businessId` | Get tables by business | Yes |
| GET | `/zonesAndTables/fetch_active_tables/:businessId` | Get active tables | Yes |
| POST | `/dishZoneKitchen/` | Bulk create/update mappings | Yes |
| GET | `/dishZoneKitchen/:dishId` | Get mappings by dish | Yes |
| GET | `/dishZoneKitchen/:dishId/:zoneId` | Get mapping by dish & zone | Yes |
| GET | `/kitchen/kitchenByBusiness` | Get kitchens by business | Yes |

---

**Last Updated:** 2024
**Version:** 1.0

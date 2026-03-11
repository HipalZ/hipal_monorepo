# Table Routes Documentation

This directory contains the routes for managing tables, sessions, settlements, and transfers.

## Base Path: `/table`

### 1. Fetch All Active Tables
- **URL**: `/all/:businessId`
- **Method**: `GET`
- **Params**:
  - `businessId` (string): Unique identifier for the business.
- **Response**:
  - `message`: "Tables fetched successfully"
  - `data`: List of active tables (populated with `userIds` and `mergeTableIds`).

### 2. Fetch Menu for Table
- **URL**: `/menu`
- **Method**: `GET`
- **Query**:
  - `tableId` (string): Table ID.
  - `businessId` (string): Business ID.
- **Response**:
  - `message`: "fetched successfully"
  - `data`: List of categories with dishes and add-ons.

### 3. Fetch All Tables (Active & Empty)
- **URL**: `/fetch_all`
- **Method**: `GET`
- **Query**:
  - `businessId` (string): Business ID.
- **Response**:
  - `data`: List of tables with `name`, `_id`, `status`, and `currentTableAmount`.

### 4. Fetch Table by ID
- **URL**: `/:tableId`
- **Method**: `GET`
- **Params**:
  - `tableId` (string): Table ID.
- **Response**:
  - `data`: Detailed table object.

### 5. Fetch Empty Tables
- **URL**: `/empty_table/:businessId`
- **Method**: `GET`
- **Params**:
  - `businessId` (string): Business ID.

### 6. Fetch Active Orders
- **URL**: `/orders/:businessId`
- **Method**: `GET`
- **Params**:
  - `businessId` (string): Business ID.
- **Response**:
  - `data`: List of non-settled KOT orders.

### 7. Fetch Unsettled Tables
- **URL**: `/unsettle_table/:businessId`
- **Method**: `GET`
- **Params**:
  - `businessId` (string): Business ID.

### 8. Update Guest Count (PAX)
- **URL**: `/update_guest`
- **Method**: `PUT`
- **Payload**:
  ```json
  {
    "tableId": "string",
    "guestCount": "number"
  }
  ```

### 9. Normal Settlement
- **URL**: `/normal_settle`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "tableId": "string",
    "captainId": "string",
    "billId": "string",
    "settleModes": [
      {
        "name": "string",
        "amount": "number",
        "_id": "string"
      }
    ],
    "duesUserId": "string (optional)",
    "npcUserId": "string (optional)",
    "variantId": "string (optional)"
  }
  ```

### 10. Hi Settle (QR Payment)
- **URL**: `/hi_settle`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "tableId": "string",
    "captainId": "string",
    "billId": "string",
    "variantId": "string (optional)"
  }
  ```
- **Response**: Returns QR path for payment.

### 11. Merge Tables
- **URL**: `/merge`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "fromTableIds": ["string"],
    "toTableId": "string",
    "staffId": "string"
  }
  ```

### 12. QR Webhook Status
- **URL**: `/qr_webhook/:billId/:variantId`
- **Method**: `GET`

### 13. Send E-Bill
- **URL**: `/e_bill`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "phoneNumbers": ["string"],
    "businessId": "string",
    "tableId": "string",
    "variantId": "string (optional)"
  }
  ```

### 14. Table Offline Alert
- **URL**: `/table_offline_alert/:billId`
- **Method**: `GET`

### 15. KOT Users
- **URL**: `/kot_users`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "userIds": ["string"]
  }
  ```

### 16. Transfer Table/Item
- **URL**: `/transfer_table`
- **Method**: `POST`
- **Payload**:
  ```json
  {
    "fromTableId": "string",
    "toTableId": "string",
    "businessId": "string",
    "transferType": "TABLE | ITEM | KOT",
    "transferBy": "string",
    "itemData": [
      {
        "itemId": "string",
        "quantity": "number"
      }
    ] (optional)
  }
  ```

### 17. Save Unsettle Table
- **URL**: `/save_unsettle_table`
- **Method**: `POST`

### 18. Settle Unsettle Table
- **URL**: `/settle_unsettle_table`
- **Method**: `POST`

### 19. Sync Unsettle Table
- **URL**: `/sync_unsettle_table`
- **Method**: `POST`

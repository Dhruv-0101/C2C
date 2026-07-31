# BrandFlow API Documentation — Master Business Categories Module

Business Categories represent core SMB industry sectors (e.g. `Restaurant`, `Gym & Fitness`, `Real Estate`, `Salon & Spa`).

---

## 1. Get All Master Categories (`GET /api/v1/categories`)

Fetches a list of all active business categories ordered alphabetically.

* **Auth Required**: No (Public / Authenticated)

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Business categories retrieved successfully",
  "data": {
    "categories": [
      {
        "id": "c1000000-0000-0000-0000-000000000001",
        "name": "Clothing & Fashion",
        "slug": "clothing-fashion",
        "description": null,
        "isSystem": true,
        "createdAt": "2026-07-30T16:00:00.000Z"
      },
      {
        "id": "c1000000-0000-0000-0000-000000000002",
        "name": "Restaurant",
        "slug": "restaurant",
        "description": "Food, dining, and cafe templates",
        "isSystem": true,
        "createdAt": "2026-07-30T16:00:00.000Z"
      }
    ]
  }
}
```

---

## 2. Create Business Category (`POST /api/v1/categories`)

Creates a new master business category. Automatically generates a URL slug and checks for duplicates.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`) — **SuperAdmin Only (`isSuperAdmin: true`)**

### Request Body
```json
{
  "name": "Real Estate",
  "description": "Property listing and real estate promo graphics"
}
```

### Success Response (`201 Created`)
```json
{
  "success": true,
  "message": "Business category created successfully",
  "data": {
    "category": {
      "id": "c1000000-0000-0000-0000-000000000007",
      "name": "Real Estate",
      "slug": "real-estate",
      "description": "Property listing and real estate promo graphics",
      "isSystem": true,
      "createdAt": "2026-07-30T16:01:00.000Z"
    }
  }
}
```

### Error Response (`409 Conflict`)
```json
{
  "success": false,
  "message": "Category \"Real Estate\" already exists."
}
```

---

## 3. Delete Business Category (`DELETE /api/v1/categories/:id`)

Deletes a master business category by ID.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`) — **SuperAdmin Only (`isSuperAdmin: true`)**

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Business category deleted successfully"
}
```

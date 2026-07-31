# BrandFlow API Documentation — Authentication, RBAC & 2FA Module

All API endpoints follow the standard BrandFlow response format:

**Success Response (2xx)**:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": { ... }
}
```

**Error Response (4xx / 5xx)**:
```json
{
  "success": false,
  "message": "Error summary message",
  "errors": [
    { "field": "code", "message": "Invalid 6-digit code" }
  ]
}
```

---

## 1. Register Public User (`POST /api/v1/auth/signup`)

Registers a new SMB regular user (`role: END_USER`, `isAdmin: false`). Sets an HTTP-Only Refresh Token Cookie (`refreshToken`) and returns a JWT Access Token.

---

## 2. Login User (`POST /api/v1/auth/login`)

Authenticates existing SMB users, SubAdmins, or SuperAdmin credentials. 
* **If 2FA is Active**: Returns `require2FA: true` and a 5-minute temporary `mfaToken`. Does **not** issue session tokens until 2FA code verification.
* **If 2FA is Disabled**: Returns Access Token and sets HTTP-Only Refresh Cookie (`refreshToken`).

### Response when 2FA is Active (`200 OK`)
```json
{
  "success": true,
  "message": "Two-factor authentication required. Please enter 6-digit code.",
  "data": {
    "require2FA": true,
    "mfaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 3. Verify 2FA Login Challenge (`POST /api/v1/auth/2fa/verify-login`)

Verifies the 6-digit TOTP code (from Google Authenticator/Authy app) or single-use 8-character Backup Recovery Code.

### Request Body
```json
{
  "mfaToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "code": "123456"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "2FA verification successful. Logged in.",
  "data": {
    "user": {
      "id": "u1234567-89ab-cdef-0123-456789abcdef",
      "email": "user@brandflow.ai",
      "fullName": "Dhruv Sharma",
      "isTwoFactorEnabled": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 4. Setup 2FA (`POST /api/v1/auth/2fa/setup`)

Generates TOTP secret and QR Code Data URL for Authenticator app scanning.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`)

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Scan the QR Code with Google Authenticator or Authy.",
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

---

## 5. Enable 2FA (`POST /api/v1/auth/2fa/enable`)

Confirms 6-digit TOTP verification code from Authenticator app, activates 2FA on account, and generates **8 Single-Use Backup Recovery Codes**.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`)

### Request Body
```json
{
  "code": "123456"
}
```

### Success Response (`200 OK`)
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully. Save your backup codes.",
  "data": {
    "isTwoFactorEnabled": true,
    "backupCodes": [
      "A1B2C3D4",
      "E5F6G7H8",
      "I9J0K1L2",
      "M3N4O5P6",
      "Q7R8S9T0",
      "U1V2W3X4",
      "Y5Z6A7B8",
      "C9D0E1F2"
    ]
  }
}
```

---

## 6. Disable 2FA (`POST /api/v1/auth/2fa/disable`)

Disables 2FA security on the authenticated user account.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`)

---

## 7. Create SubAdmin (`POST /api/v1/auth/subadmin`)

SuperAdmin endpoint to create a new SubAdmin account with assigned `allowedTabs` tab permissions.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`) — **SuperAdmin Only (`isSuperAdmin: true`)**

---

## 8. List SubAdmins (`GET /api/v1/auth/subadmins`)

Fetches all SubAdmin accounts and their assigned tab permissions.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`) — **SuperAdmin Only (`isSuperAdmin: true`)**

---

## 9. Delete SubAdmin (`DELETE /api/v1/auth/subadmin/:id`)

Revokes and deletes a SubAdmin account by ID.

* **Auth Required**: Yes (`Authorization: Bearer <accessToken>`) — **SuperAdmin Only (`isSuperAdmin: true`)**

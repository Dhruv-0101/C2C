# BrandFlow Backend API Overview

Welcome to the **BrandFlow Backend API Documentation**. This directory contains comprehensive markdown documentation for all API modules, designed for easy reading and seamless Postman testing.

---

## Base URL
```http
http://localhost:5000/api/v1
```

---

## Authentication & Headers

### Access Token Header
Protected endpoints require a JWT Access Token passed in the standard HTTP `Authorization` header:
```http
Authorization: Bearer <your_access_token>
```

### Refresh Token Cookie
Refresh token requests use an **HTTP-Only, Secure Cookie** named `refreshToken` set automatically by `/auth/login` and `/auth/signup`.

---

## Standardized Response Formats

### 1. Success Response (`2xx`)
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    ...
  }
}
```

### 2. Error Response (`4xx` / `5xx`)
```json
{
  "success": false,
  "message": "Error summary message",
  "errors": [
    {
      "field": "email",
      "message": "Please enter a valid email address"
    }
  ]
}
```

---

## Rate Limits & Security

| Limiter | Limit Window | Target Routes | Behavior on Exceeding |
| :--- | :--- | :--- | :--- |
| **Global Limiter** | 100 requests / 15 mins | `/api/v1/*` | HTTP `429 Too Many Requests` |
| **Auth Limiter** | 10 requests / 15 mins | `/api/v1/auth/signup`, `/login`, `/refresh` | HTTP `429 Too Many Requests` (Brute-force protection) |

---

## API Module Documentation Files

* **Authentication & Profile Module**: [docs/api/auth.md](file:///c:/Users/lenovo/OneDrive/Desktop/C2C/backend/docs/api/auth.md)
* *(Future modules will be added here: Categories, Brand Kits, Templates, Sharp Image Processing, Post Generator, Scheduler)*

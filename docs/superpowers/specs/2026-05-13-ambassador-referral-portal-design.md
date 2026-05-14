# Ambassador Referral Portal — Design Spec (v1.1)

**Date:** 2026-05-13
**Project:** Raahi Service Config API
**Status:** Approved

---

## 1. Overview

A backend feature enabling RAAhi Ambassadors to recruit marketplace vendors via unique referral codes. Ambassadors share their code; vendors use it during signup; ambassadors monitor their recruits via a dashboard endpoint.

No authentication is in scope for this implementation. Auth will be wired in a future iteration.

---

## 2. Data Model

### New Table: `ambassador`

| Column | Type | Constraint |
|---|---|---|
| `amb_id` | UUID | Primary Key |
| `full_name` | varchar | Not Null |
| `ref_code` | varchar | Unique, Indexed |
| `email` | varchar | Unique |
| `phone` | varchar | Nullable |
| `payout_details` | text | Nullable |
| `is_active` | boolean | Default: true |
| `created_at` | timestamp | Auto-generated |

### Modified Table: `vendor` (three new nullable columns)

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `ref_code_used` | varchar | Nullable | Stores the ambassador's `ref_code`; null for vendors not from the ambassador portal |
| `business_name` | varchar | Nullable | Business name entered by vendor during ambassador portal signup |
| `onboarding_status` | enum | Nullable, Default: `PENDING` when `ref_code_used` is set | Tracks the ambassador onboarding pipeline state |

The existing `status` column (`VendorStatus`: `PENDING`, `ACTIVE`, `SUSPENDED`) tracks operational state and is left unchanged. A new `OnboardingStatus` enum is introduced specifically for the ambassador pipeline: `PENDING`, `UNDER_REVIEW`, `ONBOARDED`.

No existing vendor data is affected — all three new columns are nullable.

---

## 3. Module Structure

A new `AmbassadorModule` is added alongside the existing `ServiceModule`, `SchemaModule`, and `VendorModule`. It is self-contained and does not modify any existing module. 

**`AmbassadorModule` registers:**
- `AmbassadorEntity`
- `VendorEntity` (cross-registered to write to the existing vendor table)
- `AmbassadorService`
- `AmbassadorController`

---

## 4. API Endpoints

All endpoints are prefixed `/api/v1/ambassador`.

### 4.1 Create Ambassador (Admin)

```
POST /api/v1/ambassador
```

**Request body (`ref_code` is not supplied — it is auto-generated):**
```json
{
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "0771234567",
  "payout_details": "Bank: ..."
}
```

**Referral code generation logic:**
1. Strip non-letter characters from `full_name` and take the first 3 letters, uppercased (e.g. `"Jane Doe"` → `"JAN"`).
2. Append a random 3-digit number (100–999) to form the candidate code (e.g. `"JAN472"`).
3. Check the `ambassador` table for uniqueness. If the code already exists, generate a new random suffix and retry — up to 5 attempts.
4. If all 5 attempts collide (extremely unlikely), return `500 Internal Server Error`.

The generated `ref_code` is returned in the response so the admin can share it with the ambassador.

**Response:** `201 Created` — ambassador record including the generated `ref_code`.

**Errors:**
- `409 Conflict` if `email` already exists.

---

### 4.2 Vendor Registration via Ambassador Portal

```
POST /api/v1/ambassador/vendor/register
```

**Request body (minimal — only PRD-specified fields required):**
```json
{
  "ref_code": "RAA007",
  "business_name": "Sunset Tours",
  "email": "vendor@example.com",
  "phone": "0771234567"
}
```

**Validation logic:**
1. Look up `ref_code` in the Ambassador table.
2. If not found: `404 Not Found`.
3. If found but `is_active` is `false`: `400 Bad Request` — `"Referral code is inactive"`.
4. If vendor `email` already exists: `409 Conflict`.
5. On success: create vendor row with `ref_code_used`, `business_name`, and `onboarding_status` set to `PENDING`.

**Response:** `201 Created` — vendor record.

---

### 4.3 Ambassador Referrals Dashboard

```
GET /api/v1/ambassador/referrals?ref_code=RAA007
```

**Query param:** `ref_code` (required).

**Errors:**
- `400 Bad Request` if `ref_code` param is missing.
- `404 Not Found` if no ambassador matches the `ref_code`.
- Returns empty `vendors` array (not a 404) when ambassador exists but has no recruits.

**Response:**
```json
{
  "ref_code": "RAA007",
  "total": 2,
  "vendors": [
    {
      "business_name": "Sunset Tours",
      "status": "PENDING",
      "registered_at": "2026-05-13T10:00:00.000Z"
    }
  ]
}
```

---

## 5. Migration

One TypeORM migration file performs four operations:

1. Create the `ambassador` table with all columns and a unique index on `ref_code`.
2. Add `ref_code_used` (varchar, nullable) to the `vendor` table.
3. Add `business_name` (varchar, nullable) to the `vendor` table.
4. Add `onboarding_status` (enum: `PENDING`, `UNDER_REVIEW`, `ONBOARDED`; nullable) to the `vendor` table.

No data backfill required.

---

## 6. Error Handling Summary

| Scenario | HTTP Status | Message |
|---|---|---|
| `ref_code` not found (registration) | 404 | `"Referral code not found"` |
| `ref_code` inactive | 400 | `"Referral code is inactive"` |
| Duplicate vendor email | 409 | `"Vendor with this email already exists"` |
| Duplicate ambassador ref_code or email | 409 | `"Ambassador already exists"` |
| Missing `ref_code` query param | 400 | `"ref_code query parameter is required"` |
| Ambassador not found (referrals) | 404 | `"Ambassador not found"` |

---

## 7. Testing

Unit tests for `AmbassadorService` covering:
- Successful ambassador creation with auto-generated ref_code
- ref_code generation produces correct prefix from full_name (3 uppercase letters)
- ref_code generation retries on collision and succeeds within 5 attempts
- Duplicate email rejection (409)
- Vendor registration with valid active code
- Vendor registration with non-existent code (404)
- Vendor registration with inactive code (400)
- Referral list retrieval with results
- Referral list retrieval with no recruits (empty array)
- Missing ref_code param (400)
- Ambassador not found (404)

Follows existing Jest patterns in the codebase.

---

## 8. Out of Scope

- Authentication / authorization
- Automated commission calculations
- Tier-based rewards or gamification
- Ambassador-to-vendor messaging
- Admin UI for managing ambassadors

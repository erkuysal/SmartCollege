# Wallet Module API Documentation

This document describes the API endpoints for the Wallet module of SmartAttendance.

---

## Base URL

    /api/wallet/

---

## Endpoints

### 1. Wallets
- **List:** `GET /api/wallet/wallets/`
- **Retrieve:** `GET /api/wallet/wallets/{id}/`
- **Create:** `POST /api/wallet/wallets/`
- **Update:** `PUT/PATCH /api/wallet/wallets/{id}/`
- **Delete:** `DELETE /api/wallet/wallets/{id}/`

#### Example Response
```json
{
  "id": 1,
  "owner": 10,
  "owner_name": "John Doe",
  "balance": 150,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 2. Transactions
- **List:** `GET /api/wallet/transactions/`
- **Retrieve:** `GET /api/wallet/transactions/{id}/`
- **Create:** `POST /api/wallet/transactions/`
- **Update:** `PUT/PATCH /api/wallet/transactions/{id}/`
- **Delete:** `DELETE /api/wallet/transactions/{id}/`

#### Example Response
```json
{
  "id": 1,
  "wallet": 1,
  "activity_type": {
    "id": 2,
    "name": "Attendance",
    "description": "Points for class attendance",
    "is_active": true,
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "amount": 10,
  "is_credit": true,
  "timestamp": "2024-01-01T12:00:00Z",
  "description": "Points earned for attending class."
}
```

---

### 3. Activity Types
- **List:** `GET /api/wallet/activity-types/`
- **Retrieve:** `GET /api/wallet/activity-types/{id}/`
- **Create:** `POST /api/wallet/activity-types/`
- **Update:** `PUT/PATCH /api/wallet/activity-types/{id}/`
- **Delete:** `DELETE /api/wallet/activity-types/{id}/`

#### Example Response
```json
{
  "id": 2,
  "name": "Attendance",
  "description": "Points for class attendance",
  "is_active": true,
  "created_at": "2024-01-01T12:00:00Z",
  "updated_at": "2024-01-01T12:00:00Z"
}
```

---

### 4. Multiplier Rules
- **List:** `GET /api/wallet/multiplier-rules/`
- **Retrieve:** `GET /api/wallet/multiplier-rules/{id}/`
- **Create:** `POST /api/wallet/multiplier-rules/`
- **Update:** `PUT/PATCH /api/wallet/multiplier-rules/{id}/`
- **Delete:** `DELETE /api/wallet/multiplier-rules/{id}/`

#### Example Response
```json
{
  "id": 1,
  "name": "Weekly Attendance Streak",
  "description": "Multiplier based on weekly attendance streak",
  "multiplier": 1.5,
  "condition_type": "streak",
  "condition_value": {
    "streak_thresholds": {
      "5": 1.5,
      "10": 2.0,
      "20": 2.5
    }
  },
  "is_active": true,
  "start_date": null,
  "end_date": null,
  "created_at": "2025-06-17T11:21:13.359515Z",
  "updated_at": "2025-06-17T11:30:00.485121Z"
}
```

---

## Notes
- All endpoints currently allow any user (no authentication required).
- Use filtering query params for more specific queries (e.g., by wallet, activity type, or student).
- Date/time fields are in ISO 8601 format (UTC).

---

## See Also
- [Academic API Documentation](../academic/API_DOCS.md)
- [Django REST Framework Docs](https://www.django-rest-framework.org/) 
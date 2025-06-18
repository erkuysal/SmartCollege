# RFID Module API Documentation

This document describes the API endpoints for the RFID module of SmartAttendance.

---

## Base URL

    /api/rfid/

---

## Endpoints

### 1. RFID Tags
- **List:** `GET /api/rfid/tags/`
- **Retrieve:** `GET /api/rfid/tags/{id}/`
- **Create:** `POST /api/rfid/tags/`
- **Update:** `PUT/PATCH /api/rfid/tags/{id}/`
- **Delete:** `DELETE /api/rfid/tags/{id}/`

#### Example Response
```json
{
  "id": 1,
  "tag_id": "ABC123DEF456",
  "user": {
    "id": 10,
    "user_number": "S20240001",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "student"
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

---

### 2. Write Card
- **Write user number to RFID card:** `POST /api/rfid/write_card/`
  - Body: `{ "user_number": "S20240001" }`

#### Example Response
```json
{
  "status": "ok",
  "detail": "Successfully wrote user number to card",
  "uid": "ABC123DEF456",
  "tagId": "ABC123DEF456"
}
```

---

### 3. Read Card
- **Read user number from RFID card:** `GET /api/rfid/read_card/`

#### Example Response
```json
{
  "status": "ok",
  "user_number": "S20240001",
  "uid": "ABC123DEF456"
}
```

---

### 4. Continuous RFID Scan
- **Stream RFID card scans (SSE):** `GET /api/rfid/continuous/`
  - Returns a stream of Server-Sent Events (SSE) with card scan records as they are detected.

#### Example Event
```
data: { "user_number": "S20240001", "uid": "ABC123DEF456", "timestamp": "2024-01-01T12:00:00Z" }
```

---

## Notes
- All endpoints currently allow any user (no authentication required).
- The write/read endpoints require the RFID serial port to be configured on the server.
- The continuous scan endpoint streams events as they are detected (use an SSE-compatible client).
- Date/time fields are in ISO 8601 format (UTC).

---

## See Also
- [Users API Documentation](../users/API_DOCS.md)
- [Django REST Framework Docs](https://www.django-rest-framework.org/) 
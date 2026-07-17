# Roadmap Planner API Reference

## Base URL
```
http://localhost:8000/api
```

---

## Endpoints

### 1. Get All Roadmap Items

**Endpoint:** `GET /api/roadmap`

**Response:** `200 OK`

```json
[
  {
    "id": 1,
    "topic": "checkout",
    "priority_score": 8.7,
    "priority_level": "high",
    "release_name": "v2.0",
    "quarter": "Q4 2026",
    "status": "In Progress",
    "owner": "Payment Team",
    "business_goal": "Reduce cart abandonment by 15%",
    "created_at": "2026-07-17T10:30:00Z",
    "updated_at": "2026-07-17T14:20:00Z"
  },
  {
    "id": 2,
    "topic": "search",
    "priority_score": 7.2,
    "priority_level": "high",
    "release_name": "v2.1",
    "quarter": "Q1 2027",
    "status": "Planned",
    "owner": "Discovery Team",
    "business_goal": "Improve product findability",
    "created_at": "2026-07-17T11:00:00Z",
    "updated_at": "2026-07-17T11:00:00Z"
  }
]
```

**Ordering:**
1. Status priority: Released → In Progress → Planned → Backlog
2. Within each status: Priority Score (highest first)

---

### 2. Create Roadmap Item

**Endpoint:** `POST /api/roadmap`

**Request Body:**
```json
{
  "topic": "checkout",
  "priority_score": 8.7,
  "priority_level": "high",
  "release_name": "v2.0",
  "quarter": "Q4 2026",
  "status": "Backlog",
  "owner": "Payment Team",
  "business_goal": "Reduce cart abandonment by 15%"
}
```

**Required Fields:**
- `topic` (string, cannot be empty)
- `priority_score` (float, 0-10)
- `priority_level` (string, must be "high", "medium", or "low")
- `release_name` (string, cannot be empty)
- `quarter` (string, cannot be empty)
- `status` (string, must be "Backlog", "Planned", "In Progress", or "Released")

**Optional Fields:**
- `owner` (string)
- `business_goal` (string)

**Response:** `200 OK`
```json
{
  "id": 1,
  "topic": "checkout",
  "priority_score": 8.7,
  "priority_level": "high",
  "release_name": "v2.0",
  "quarter": "Q4 2026",
  "status": "Backlog",
  "owner": "Payment Team",
  "business_goal": "Reduce cart abandonment by 15%",
  "created_at": "2026-07-17T10:30:00Z",
  "updated_at": "2026-07-17T10:30:00Z"
}
```

**Error Responses:**

**400 Bad Request - Empty Topic**
```json
{
  "detail": "Topic cannot be empty"
}
```

**400 Bad Request - Empty Release Name**
```json
{
  "detail": "Release name cannot be empty"
}
```

**400 Bad Request - Empty Quarter**
```json
{
  "detail": "Quarter cannot be empty"
}
```

**400 Bad Request - Invalid Status**
```json
{
  "detail": "Status must be one of: Backlog, Planned, In Progress, Released"
}
```

**400 Bad Request - Invalid Priority Level**
```json
{
  "detail": "Priority level must be one of: high, medium, low"
}
```

---

### 3. Update Roadmap Item

**Endpoint:** `PUT /api/roadmap/{item_id}`

**Path Parameters:**
- `item_id` (integer) - ID of the roadmap item to update

**Request Body (all fields optional):**
```json
{
  "status": "In Progress",
  "owner": "Mobile Team",
  "release_name": "v2.1",
  "quarter": "Q1 2027",
  "business_goal": "Improve mobile checkout experience"
}
```

**Updatable Fields:**
- `status` (string)
- `owner` (string)
- `release_name` (string)
- `quarter` (string)
- `business_goal` (string)

**Note:** Topic, priority_score, and priority_level cannot be updated.

**Response:** `200 OK`
```json
{
  "id": 1,
  "topic": "checkout",
  "priority_score": 8.7,
  "priority_level": "high",
  "release_name": "v2.1",
  "quarter": "Q1 2027",
  "status": "In Progress",
  "owner": "Mobile Team",
  "business_goal": "Improve mobile checkout experience",
  "created_at": "2026-07-17T10:30:00Z",
  "updated_at": "2026-07-17T14:45:00Z"
}
```

**Error Responses:**

**404 Not Found**
```json
{
  "detail": "Roadmap item 99 not found"
}
```

**400 Bad Request - Invalid Status**
```json
{
  "detail": "Status must be one of: Backlog, Planned, In Progress, Released"
}
```

**400 Bad Request - Empty Release Name**
```json
{
  "detail": "Release name cannot be empty"
}
```

**400 Bad Request - Empty Quarter**
```json
{
  "detail": "Quarter cannot be empty"
}
```

---

### 4. Delete Roadmap Item

**Endpoint:** `DELETE /api/roadmap/{item_id}`

**Path Parameters:**
- `item_id` (integer) - ID of the roadmap item to delete

**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Roadmap item 1 deleted successfully"
}
```

**Error Responses:**

**404 Not Found**
```json
{
  "detail": "Roadmap item 99 not found"
}
```

---

## Data Types

### Status Values
- `"Backlog"` - Item not yet scheduled
- `"Planned"` - Item scheduled for future release
- `"In Progress"` - Item currently being worked on
- `"Released"` - Item has been shipped

### Priority Levels
- `"high"` - High priority
- `"medium"` - Medium priority
- `"low"` - Low priority

### Priority Score
- Type: `float`
- Range: `0.0` to `10.0`
- Higher score = higher priority

---

## Example Usage

### Create a roadmap item from an opportunity
```bash
curl -X POST http://localhost:8000/api/roadmap \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "checkout",
    "priority_score": 8.7,
    "priority_level": "high",
    "release_name": "v2.0",
    "quarter": "Q4 2026",
    "status": "Backlog",
    "owner": "Payment Team",
    "business_goal": "Reduce cart abandonment by 15%"
  }'
```

### Get all roadmap items
```bash
curl http://localhost:8000/api/roadmap
```

### Update item status to In Progress
```bash
curl -X PUT http://localhost:8000/api/roadmap/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress"
  }'
```

### Delete a roadmap item
```bash
curl -X DELETE http://localhost:8000/api/roadmap/1
```

---

## Frontend Integration

### From Prioritization Page
When user clicks "Add to Roadmap" on an opportunity:

```typescript
navigate('/roadmap', { 
  state: { 
    topic: 'checkout',
    priority_score: 8.7,
    priority_level: 'high'
  }
});
```

The Roadmap page automatically opens the modal with these fields pre-filled.

### API Service Functions

```typescript
// Get all roadmap items
const items = await getRoadmap();

// Create new item
const newItem = await createRoadmapItem({
  topic: 'checkout',
  priority_score: 8.7,
  priority_level: 'high',
  release_name: 'v2.0',
  quarter: 'Q4 2026',
  status: 'Backlog',
  owner: 'Payment Team',
  business_goal: 'Reduce cart abandonment'
});

// Update existing item
const updated = await updateRoadmapItem(1, {
  status: 'In Progress'
});

// Delete item
await deleteRoadmapItem(1);
```

---

## Database Schema

```sql
CREATE TABLE roadmap_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic VARCHAR NOT NULL,
    priority_score FLOAT DEFAULT 0.0,
    priority_level VARCHAR NOT NULL,
    release_name VARCHAR NOT NULL,
    quarter VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'Backlog',
    owner VARCHAR,
    business_goal TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roadmap_topic ON roadmap_items(topic);
```

---

## Status Transitions

Common workflow:

```
Backlog → Planned → In Progress → Released
```

Valid transitions:
- Any status can move to any other status
- No restrictions on status changes
- Product Manager decides the workflow

---

## Notes

1. **No duplicate prevention**: Same topic can be added to roadmap multiple times (e.g., for different releases)
2. **No cascade deletes**: Deleting a roadmap item does not affect feedback or opportunities
3. **Topic is immutable**: Once created, the topic field cannot be changed (must delete and recreate)
4. **Priority is immutable**: Priority score and level cannot be changed after creation
5. **Timestamps auto-update**: `updated_at` automatically updates on any modification

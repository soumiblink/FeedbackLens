# Feedback Inbox API Documentation

## Overview

The Feedback Inbox API provides read-only access to individual feedback records across all uploaded batches. This enables the frontend to display a comprehensive view of all feedback items with filtering capabilities.

## Endpoint

### GET `/api/feedback`

Retrieves individual feedback records from all uploaded batches.

#### Query Parameters

| Parameter | Type | Required | Description | Valid Values |
|-----------|------|----------|-------------|--------------|
| `sentiment` | string | No | Filter by sentiment | `positive`, `negative`, `neutral` |
| `type` | string | No | Filter by feedback type | `complaint`, `feature_request` |

#### Response

Returns an array of feedback items ordered by newest first (by feedback item ID).

**Response Schema**: `FeedbackInboxItemResponse`

```json
[
  {
    "id": 123,
    "batch_id": 5,
    "original_text": "The checkout process is broken",
    "sentiment": "negative",
    "sentiment_confidence": 0.95,
    "topics": ["checkout", "bugs"],
    "is_complaint": 1,
    "is_feature_request": 0,
    "priority_score": 8.5
  }
]
```

#### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique feedback item identifier |
| `batch_id` | integer | The batch this feedback belongs to |
| `original_text` | string | The raw feedback text |
| `sentiment` | string | Predicted sentiment (positive/negative/neutral) |
| `sentiment_confidence` | float | Confidence score (0.0 - 1.0) |
| `topics` | array[string] | List of extracted topics |
| `is_complaint` | integer | 1 if complaint, 0 otherwise |
| `is_feature_request` | integer | 1 if feature request, 0 otherwise |
| `priority_score` | float | Urgency score (0.0 - 10.0) |

## Usage Examples

### Get All Feedback

```bash
GET /api/feedback
```

Returns all feedback items from all batches.

### Filter by Sentiment

```bash
GET /api/feedback?sentiment=negative
```

Returns only negative feedback items.

### Filter by Type

```bash
GET /api/feedback?type=complaint
```

Returns only feedback items marked as complaints.

### Combined Filtering

```bash
GET /api/feedback?sentiment=negative&type=complaint
```

Returns only negative feedback items that are complaints.

## Error Responses

### Invalid Sentiment Value

**Status Code**: `400 Bad Request`

```json
{
  "detail": "Invalid sentiment value. Must be 'positive', 'negative', or 'neutral'."
}
```

### Invalid Type Value

**Status Code**: `400 Bad Request`

```json
{
  "detail": "Invalid type value. Must be 'complaint' or 'feature_request'."
}
```

## Implementation Notes

### Ordering

Feedback items are ordered by ID in descending order (newest first). Since IDs are auto-incrementing, higher IDs represent more recent feedback.

### Cross-Batch Queries

The endpoint queries across ALL feedback batches, allowing historical analysis and comparison of feedback over time.

### Performance

For large datasets with thousands of feedback items, consider implementing pagination in future iterations. Current implementation returns all matching records.

## Testing

A test script is provided at `backend/test_feedback_inbox.py`:

```bash
# Ensure backend is running first
cd backend
python main.py

# In another terminal, run the test
cd backend
python test_feedback_inbox.py
```

The test verifies:
- ✓ Multiple batch uploads preserve previous batches
- ✓ GET /api/feedback returns all records
- ✓ Sentiment filtering works correctly
- ✓ Type filtering works correctly
- ✓ Combined filtering works correctly
- ✓ Hindsight memories are preserved

## Changes from Previous Behavior

### Before

- Each new upload deleted ALL previous feedback
- Only one batch existed at a time
- No way to retrieve individual feedback items
- Historical analysis was impossible

### After

- Each upload creates a NEW batch
- Previous batches are preserved
- Individual feedback items can be retrieved via `/api/feedback`
- Historical trends and comparisons now work correctly
- Hindsight memory accumulates over time

### Manual Reset

The `/api/reset` endpoint is still available for manually clearing all data when needed:

```bash
POST /api/reset
```

This provides explicit control over data deletion.

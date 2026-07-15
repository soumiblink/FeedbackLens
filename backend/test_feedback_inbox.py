"""
Test script to verify the Feedback Inbox API implementation.

This script tests:
1. Multiple batch uploads preserve previous batches
2. GET /api/feedback endpoint returns feedback records
3. Filtering by sentiment works
4. Filtering by type works
5. Combined filtering works
"""

import requests
import time

BASE_URL = "http://localhost:8000/api"

def test_feedback_inbox():
    print("=" * 60)
    print("Testing FeedbackLens Feedback Inbox API")
    print("=" * 60)
    
    # Step 1: Reset database for clean test
    print("\n1. Resetting database...")
    response = requests.post(f"{BASE_URL}/reset")
    print(f"   Status: {response.status_code}")
    print(f"   Response: {response.json()}")
    
    # Step 2: Upload first batch
    print("\n2. Uploading first batch...")
    batch1_data = """text,sentiment
The product is amazing and works perfectly!,positive
Shipping was fast and packaging was great,positive
I love this product so much,positive"""
    
    response = requests.post(
        f"{BASE_URL}/upload-feedback",
        data={"text": batch1_data}
    )
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Batch ID: {result.get('batch_id')}")
    print(f"   Status: {result.get('status')}")
    
    time.sleep(2)  # Wait for processing
    
    # Step 3: Upload second batch (should NOT delete first batch)
    print("\n3. Uploading second batch...")
    batch2_data = """text,sentiment
The checkout process is broken,negative
Login doesn't work at all,negative
Please add dark mode feature,positive"""
    
    response = requests.post(
        f"{BASE_URL}/upload-feedback",
        data={"text": batch2_data}
    )
    print(f"   Status: {response.status_code}")
    result = response.json()
    print(f"   Batch ID: {result.get('batch_id')}")
    print(f"   Status: {result.get('status')}")
    
    time.sleep(2)  # Wait for processing
    
    # Step 4: Test GET /api/feedback (all feedback)
    print("\n4. Testing GET /api/feedback (all records)...")
    response = requests.get(f"{BASE_URL}/feedback")
    print(f"   Status: {response.status_code}")
    feedback_items = response.json()
    print(f"   Total records: {len(feedback_items)}")
    print(f"   Expected: 6 (3 from batch 1 + 3 from batch 2)")
    
    if feedback_items:
        print(f"\n   Sample record:")
        item = feedback_items[0]
        print(f"   - ID: {item['id']}")
        print(f"   - Batch ID: {item['batch_id']}")
        print(f"   - Text: {item['original_text'][:50]}...")
        print(f"   - Sentiment: {item['sentiment']}")
        print(f"   - Confidence: {item['sentiment_confidence']}")
    
    # Step 5: Test filtering by sentiment
    print("\n5. Testing GET /api/feedback?sentiment=negative...")
    response = requests.get(f"{BASE_URL}/feedback?sentiment=negative")
    print(f"   Status: {response.status_code}")
    negative_items = response.json()
    print(f"   Negative records: {len(negative_items)}")
    print(f"   Expected: ~2")
    
    # Step 6: Test filtering by type (complaint)
    print("\n6. Testing GET /api/feedback?type=complaint...")
    response = requests.get(f"{BASE_URL}/feedback?type=complaint")
    print(f"   Status: {response.status_code}")
    complaint_items = response.json()
    print(f"   Complaint records: {len(complaint_items)}")
    
    # Step 7: Test combined filtering
    print("\n7. Testing GET /api/feedback?sentiment=negative&type=complaint...")
    response = requests.get(f"{BASE_URL}/feedback?sentiment=negative&type=complaint")
    print(f"   Status: {response.status_code}")
    combined_items = response.json()
    print(f"   Negative complaint records: {len(combined_items)}")
    
    # Step 8: Verify memories are preserved
    print("\n8. Testing GET /api/memory (Hindsight memories)...")
    response = requests.get(f"{BASE_URL}/memory")
    print(f"   Status: {response.status_code}")
    memories = response.json()
    print(f"   Total memories: {len(memories)}")
    print(f"   Expected: 2 (one per batch)")
    
    print("\n" + "=" * 60)
    print("Testing Complete!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        test_feedback_inbox()
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend API.")
        print("Please ensure the backend server is running on http://localhost:8000")
        print("\nStart the backend with:")
        print("  cd backend")
        print("  python main.py")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

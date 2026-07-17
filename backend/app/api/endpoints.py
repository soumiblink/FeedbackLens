from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime, timezone
from app.db.database import get_db
from app.models.all_models import FeedbackBatch, FeedbackItem, Memory, RoutingLog, RoadmapItem, Decision, SavedView, ChangelogEntry
from app.schemas.schemas import (
    FeedbackBatchSchema, DashboardStatsResponse, MemoryResponse, RoutingLogResponse, 
    FeedbackInboxItemResponse, OpportunityResponse, OpportunityDetailResponse,
    ReleaseBatchSummary, CompareReleasesRequest, CompareReleasesResponse, ReleaseComparison,
    RoadmapItemResponse, CreateRoadmapItemRequest, UpdateRoadmapItemRequest,
    ProductHealthResponse, CustomerSegmentSummary, CustomerSegmentDetailResponse,
    DecisionResponse, CreateDecisionRequest, UpdateDecisionRequest,
    SavedViewResponse, CreateSavedViewRequest,
    ChangelogEntryResponse, CreateChangelogEntryRequest, UpdateChangelogEntryRequest
)
from app.services.feedback_service import feedback_service
from app.services.opportunity_service import opportunity_service
from app.core.hindsight import hindsight_engine
from typing import Optional

router = APIRouter()

@router.post("/reset")
def reset_database(db: Session = Depends(get_db)):
    db.query(FeedbackItem).delete()
    db.query(FeedbackBatch).delete()
    db.query(RoutingLog).delete()
    db.query(Memory).delete()
    db.commit()
    return {"status": "success", "message": "Database reset successfully."}

@router.post("/upload-feedback")
async def upload_feedback(
    file: UploadFile = None,
    text: str = Form(None),
    db: Session = Depends(get_db)
):
    if not file and not text:
        raise HTTPException(status_code=400, detail="Must provide either a file or text.")
        
    content = ""
    filename = "manual_text"
    
    if file:
        content_bytes = await file.read()
        content = content_bytes.decode('utf-8')
        filename = file.filename
    else:
        content = text
        
    batch_id, reflection = await feedback_service.process_feedback_csv(db, filename, content)
    
    return {
        "status": "success",
        "batch_id": batch_id,
        "reflection": reflection
    }

@router.get("/feedback", response_model=list[FeedbackInboxItemResponse])
def get_feedback_inbox(
    sentiment: Optional[str] = Query(None, description="Filter by sentiment: positive, negative, or neutral"),
    type: Optional[str] = Query(None, description="Filter by type: complaint or feature_request"),
    db: Session = Depends(get_db)
):
    """
    Retrieve individual feedback records across all uploaded batches.
    
    Optional filters:
    - sentiment: Filter by sentiment (positive, negative, neutral)
    - type: Filter by type (complaint, feature_request)
    
    Returns records ordered by newest first (by feedback item ID).
    """
    # Start with base query
    query = db.query(FeedbackItem)
    
    # Apply sentiment filter if provided
    if sentiment:
        sentiment_lower = sentiment.lower().strip()
        if sentiment_lower not in ['positive', 'negative', 'neutral']:
            raise HTTPException(status_code=400, detail="Invalid sentiment value. Must be 'positive', 'negative', or 'neutral'.")
        query = query.filter(FeedbackItem.sentiment == sentiment_lower)
    
    # Apply type filter if provided
    if type:
        type_lower = type.lower().strip()
        if type_lower == 'complaint':
            query = query.filter(FeedbackItem.is_complaint == 1)
        elif type_lower == 'feature_request':
            query = query.filter(FeedbackItem.is_feature_request == 1)
        else:
            raise HTTPException(status_code=400, detail="Invalid type value. Must be 'complaint' or 'feature_request'.")
    
    # Order by newest first (highest ID = most recent)
    feedback_items = query.order_by(desc(FeedbackItem.id)).all()
    
    return feedback_items

@router.get("/opportunities", response_model=list[OpportunityResponse])
def get_opportunities(
    priority_level: Optional[str] = Query(None, description="Filter by priority level: high, medium, or low"),
    db: Session = Depends(get_db)
):
    """
    Retrieve product opportunities aggregated from feedback topics.
    
    Optional filter:
    - priority_level: Filter by priority level (high, medium, low)
    
    Returns opportunities ranked by priority score from highest to lowest.
    """
    # Generate opportunities
    opportunities = opportunity_service.generate_opportunities(db)
    
    # Apply priority level filter if provided
    if priority_level:
        priority_level_lower = priority_level.lower().strip()
        if priority_level_lower not in ['high', 'medium', 'low']:
            raise HTTPException(status_code=400, detail="Invalid priority_level value. Must be 'high', 'medium', or 'low'.")
        
        opportunities = [opp for opp in opportunities if opp['priority_level'] == priority_level_lower]
    
    return opportunities

@router.get("/opportunities/{topic}", response_model=OpportunityDetailResponse)
def get_opportunity_detail(
    topic: str,
    db: Session = Depends(get_db)
):
    """
    Retrieve detailed information about a specific opportunity topic.
    
    Returns the opportunity metrics and all supporting feedback items.
    """
    # Normalize the topic (lowercase, trim) to match how it's stored
    normalized_topic = topic.lower().strip()
    
    # Find all feedback items that contain this topic
    all_items = db.query(FeedbackItem).all()
    
    matching_items = []
    for item in all_items:
        if item.topics:
            # Normalize each topic in the item's topics list
            normalized_item_topics = [t.lower().strip() for t in item.topics if t]
            if normalized_topic in normalized_item_topics:
                matching_items.append(item)
    
    if not matching_items:
        raise HTTPException(status_code=404, detail=f"No feedback found for topic '{topic}'")
    
    # Calculate metrics
    total_mentions = len(matching_items)
    positive_count = 0
    neutral_count = 0
    negative_count = 0
    complaint_count = 0
    feature_request_count = 0
    priority_scores = []
    confidences = []
    
    for item in matching_items:
        sentiment = (item.sentiment or 'neutral').lower().strip()
        if sentiment == 'positive':
            positive_count += 1
        elif sentiment == 'negative':
            negative_count += 1
        else:
            neutral_count += 1
        
        if item.is_complaint == 1:
            complaint_count += 1
        if item.is_feature_request == 1:
            feature_request_count += 1
        
        if item.priority_score is not None:
            priority_scores.append(item.priority_score)
        
        if item.sentiment_confidence is not None:
            confidences.append(item.sentiment_confidence)
    
    average_priority = sum(priority_scores) / len(priority_scores) if priority_scores else 0.0
    average_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    
    # Calculate priority score using the same logic as opportunity_service
    # Get all opportunities to find this one's score
    opportunities = opportunity_service.generate_opportunities(db)
    priority_score = 0.0
    priority_level = 'low'
    
    for opp in opportunities:
        if opp['topic'] == normalized_topic:
            priority_score = opp['priority_score']
            priority_level = opp['priority_level']
            break
    
    # Sort supporting feedback by priority_score DESC, then by id DESC (newest first)
    matching_items.sort(key=lambda x: (-(x.priority_score or 0), -x.id))
    
    # Build response
    supporting_feedback = [
        {
            'id': item.id,
            'batch_id': item.batch_id,
            'original_text': item.original_text,
            'sentiment': item.sentiment,
            'sentiment_confidence': item.sentiment_confidence,
            'is_complaint': item.is_complaint,
            'is_feature_request': item.is_feature_request,
            'priority_score': item.priority_score
        }
        for item in matching_items
    ]
    
    return {
        'topic': normalized_topic,
        'priority_score': priority_score,
        'priority_level': priority_level,
        'total_mentions': total_mentions,
        'complaint_count': complaint_count,
        'feature_request_count': feature_request_count,
        'positive_count': positive_count,
        'neutral_count': neutral_count,
        'negative_count': negative_count,
        'average_confidence': round(average_confidence, 2),
        'average_priority': round(average_priority, 2),
        'supporting_feedback': supporting_feedback
    }

@router.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Get the latest batch
    latest_batch = db.query(FeedbackBatch).order_by(desc(FeedbackBatch.id)).first()
    
    if not latest_batch:
        return DashboardStatsResponse(
            total_feedback=0, positive=0, neutral=0, negative=0,
            top_complaints=[], trending_issues=[], sentiment_over_time=[]
        )
        
    items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == latest_batch.id).all()
    
    total = len(items)
    positive = 0
    neutral = 0
    negative = 0
    
    for item in items:
        sent = (item.sentiment or "neutral").lower().strip()
        if sent == 'positive':
            positive += 1
        elif sent == 'negative':
            negative += 1
        else:
            neutral += 1

    
    # Calculate top complaints for the latest batch
    complaints = {}
    for item in items:
        if item.is_complaint and item.topics:
            for t in item.topics:
                complaints[t] = complaints.get(t, 0) + 1
                
    top_complaints = [{"name": k, "value": v} for k, v in sorted(complaints.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Calculate real trending issues by comparing with previous batch
    previous_batch = db.query(FeedbackBatch).filter(FeedbackBatch.id < latest_batch.id).order_by(desc(FeedbackBatch.id)).first()
    prev_complaints_counts = {}
    if previous_batch:
        prev_items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == previous_batch.id).all()
        for item in prev_items:
            if item.is_complaint and item.topics:
                for t in item.topics:
                    prev_complaints_counts[t] = prev_complaints_counts.get(t, 0) + 1
                    
    trending_issues = []
    for tc in top_complaints:
        name = tc["name"]
        curr_val = tc["value"]
        prev_val = prev_complaints_counts.get(name, 0)
        
        if curr_val > prev_val:
            trend = "up"
        elif curr_val < prev_val:
            trend = "down"
        else:
            trend = "stable"
            
        trending_issues.append({"name": name, "trend": trend})

    return DashboardStatsResponse(
        total_feedback=total,
        positive=positive,
        neutral=neutral,
        negative=negative,
        top_complaints=top_complaints,
        trending_issues=trending_issues,
        sentiment_over_time=[] # To be populated if time-series data exists
    )

@router.get("/memory", response_model=list[MemoryResponse])
def get_memories(db: Session = Depends(get_db)):
    memories = db.query(Memory).order_by(desc(Memory.batch_id)).all()
    return memories

@router.get("/routing-log", response_model=list[RoutingLogResponse])
def get_routing_logs(db: Session = Depends(get_db)):
    logs = db.query(RoutingLog).order_by(desc(RoutingLog.id)).limit(100).all()
    return logs

@router.get("/report")
def generate_report(db: Session = Depends(get_db)):
    # Simulates an executive report using the latest memories
    memories = db.query(Memory).order_by(desc(Memory.batch_id)).limit(3).all()
    if not memories:
        return {"report": "Not enough data to generate report."}
        
    return {
        "report": "Executive Summary",
        "latest_insights": memories[0].summary if memories else "",
        "risks": memories[0].top_complaints if memories else [],
        "opportunities": memories[0].top_requests if memories else []
    }

@router.get("/model-stats")
def get_model_stats():
    import os
    import re
    # Path relative to backend/app/api/endpoints.py
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    report_path = os.path.join(base_dir, 'reports', 'model_performance.md')
    
    if not os.path.exists(report_path):
        return {"accuracy": "N/A", "precision": "N/A", "recall": "N/A", "f1": "N/A"}
        
    stats = {}
    with open(report_path, 'r') as f:
        content = f.read()
        
        acc_match = re.search(r'\*\*Accuracy\*\*:\s*([\d\.]+)', content)
        if acc_match: stats['accuracy'] = float(acc_match.group(1))
        
        prec_match = re.search(r'\*\*Precision \(weighted\)\*\*:\s*([\d\.]+)', content)
        if prec_match: stats['precision'] = float(prec_match.group(1))
        
        rec_match = re.search(r'\*\*Recall \(weighted\)\*\*:\s*([\d\.]+)', content)
        if rec_match: stats['recall'] = float(rec_match.group(1))
        
        f1_match = re.search(r'\*\*F1 Score \(weighted\)\*\*:\s*([\d\.]+)', content)
        if f1_match: stats['f1'] = float(f1_match.group(1))
        
    stats['model_name'] = "TF-IDF + Logistic Regression"
    stats['dataset_size'] = "75,000 (Yelp Reviews)"
    stats['training_date'] = "2026-07-12"
    stats['model_version'] = "v1.1.0"
    
    return stats

@router.get("/releases/impact", response_model=list[ReleaseBatchSummary])
def get_release_impact(db: Session = Depends(get_db)):
    """
    Get all feedback batches with summary statistics for release impact analysis.
    Returns batches ordered chronologically (oldest first).
    """
    batches = db.query(FeedbackBatch).order_by(FeedbackBatch.upload_time).all()
    
    result = []
    for batch in batches:
        items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == batch.id).all()
        
        total_feedback = len(items)
        positive = 0
        neutral = 0
        negative = 0
        complaints = 0
        feature_requests = 0
        topics_set = set()
        
        for item in items:
            sent = (item.sentiment or "neutral").lower().strip()
            if sent == 'positive':
                positive += 1
            elif sent == 'negative':
                negative += 1
            else:
                neutral += 1
            
            if item.is_complaint == 1:
                complaints += 1
            if item.is_feature_request == 1:
                feature_requests += 1
            
            if item.topics:
                for topic in item.topics:
                    normalized = topic.lower().strip()
                    if normalized:
                        topics_set.add(normalized)
        
        # Get top 5 topics by frequency
        topic_counts = {}
        for item in items:
            if item.topics:
                for topic in item.topics:
                    normalized = topic.lower().strip()
                    if normalized:
                        topic_counts[normalized] = topic_counts.get(normalized, 0) + 1
        
        top_topics = [t for t, _ in sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
        
        result.append({
            'batch_id': batch.id,
            'filename': batch.filename,
            'upload_time': batch.upload_time,
            'total_feedback': total_feedback,
            'positive': positive,
            'neutral': neutral,
            'negative': negative,
            'complaints': complaints,
            'feature_requests': feature_requests,
            'top_topics': top_topics
        })
    
    return result

@router.post("/releases/compare", response_model=CompareReleasesResponse)
def compare_releases(request: CompareReleasesRequest, db: Session = Depends(get_db)):
    """
    Compare two feedback batches to analyze release impact.
    Calculates deterministic metrics based on database records only.
    """
    # Get both batches
    before_batch = db.query(FeedbackBatch).filter(FeedbackBatch.id == request.before_batch).first()
    after_batch = db.query(FeedbackBatch).filter(FeedbackBatch.id == request.after_batch).first()
    
    if not before_batch:
        raise HTTPException(status_code=404, detail=f"Before batch {request.before_batch} not found")
    if not after_batch:
        raise HTTPException(status_code=404, detail=f"After batch {request.after_batch} not found")
    
    # Get items for both batches
    before_items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == request.before_batch).all()
    after_items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == request.after_batch).all()
    
    # Calculate metrics for before batch
    before_total = len(before_items)
    before_positive = 0
    before_neutral = 0
    before_negative = 0
    before_complaints = 0
    before_feature_requests = 0
    before_topics = set()
    
    for item in before_items:
        sent = (item.sentiment or "neutral").lower().strip()
        if sent == 'positive':
            before_positive += 1
        elif sent == 'negative':
            before_negative += 1
        else:
            before_neutral += 1
        
        if item.is_complaint == 1:
            before_complaints += 1
        if item.is_feature_request == 1:
            before_feature_requests += 1
        
        if item.topics:
            for topic in item.topics:
                normalized = topic.lower().strip()
                if normalized:
                    before_topics.add(normalized)
    
    # Get top 5 topics for before batch
    before_topic_counts = {}
    for item in before_items:
        if item.topics:
            for topic in item.topics:
                normalized = topic.lower().strip()
                if normalized:
                    before_topic_counts[normalized] = before_topic_counts.get(normalized, 0) + 1
    before_top_topics = [t for t, _ in sorted(before_topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Calculate metrics for after batch
    after_total = len(after_items)
    after_positive = 0
    after_neutral = 0
    after_negative = 0
    after_complaints = 0
    after_feature_requests = 0
    after_topics = set()
    
    for item in after_items:
        sent = (item.sentiment or "neutral").lower().strip()
        if sent == 'positive':
            after_positive += 1
        elif sent == 'negative':
            after_negative += 1
        else:
            after_neutral += 1
        
        if item.is_complaint == 1:
            after_complaints += 1
        if item.is_feature_request == 1:
            after_feature_requests += 1
        
        if item.topics:
            for topic in item.topics:
                normalized = topic.lower().strip()
                if normalized:
                    after_topics.add(normalized)
    
    # Get top 5 topics for after batch
    after_topic_counts = {}
    for item in after_items:
        if item.topics:
            for topic in item.topics:
                normalized = topic.lower().strip()
                if normalized:
                    after_topic_counts[normalized] = after_topic_counts.get(normalized, 0) + 1
    after_top_topics = [t for t, _ in sorted(after_topic_counts.items(), key=lambda x: x[1], reverse=True)[:5]]
    
    # Calculate changes
    positive_change = after_positive - before_positive
    negative_change = after_negative - before_negative
    neutral_change = after_neutral - before_neutral
    complaint_change = after_complaints - before_complaints
    feature_request_change = after_feature_requests - before_feature_requests
    
    # Calculate deltas (percentage change)
    sentiment_delta = 0.0
    if before_total > 0:
        before_positive_pct = (before_positive / before_total) * 100
        after_positive_pct = (after_positive / after_total) * 100 if after_total > 0 else 0
        sentiment_delta = round(after_positive_pct - before_positive_pct, 2)
    
    complaint_delta = 0.0
    if before_total > 0:
        before_complaint_pct = (before_complaints / before_total) * 100
        after_complaint_pct = (after_complaints / after_total) * 100 if after_total > 0 else 0
        complaint_delta = round(after_complaint_pct - before_complaint_pct, 2)
    
    feature_request_delta = 0.0
    if before_total > 0:
        before_fr_pct = (before_feature_requests / before_total) * 100
        after_fr_pct = (after_feature_requests / after_total) * 100 if after_total > 0 else 0
        feature_request_delta = round(after_fr_pct - before_fr_pct, 2)
    
    # Topic changes
    new_topics = sorted(list(after_topics - before_topics))
    resolved_topics = sorted(list(before_topics - after_topics))
    persistent_topics = sorted(list(before_topics & after_topics))
    
    # Build response
    before_summary = {
        'batch_id': before_batch.id,
        'filename': before_batch.filename,
        'upload_time': before_batch.upload_time,
        'total_feedback': before_total,
        'positive': before_positive,
        'neutral': before_neutral,
        'negative': before_negative,
        'complaints': before_complaints,
        'feature_requests': before_feature_requests,
        'top_topics': before_top_topics
    }
    
    after_summary = {
        'batch_id': after_batch.id,
        'filename': after_batch.filename,
        'upload_time': after_batch.upload_time,
        'total_feedback': after_total,
        'positive': after_positive,
        'neutral': after_neutral,
        'negative': after_negative,
        'complaints': after_complaints,
        'feature_requests': after_feature_requests,
        'top_topics': after_top_topics
    }
    
    comparison = {
        'positive_change': positive_change,
        'negative_change': negative_change,
        'neutral_change': neutral_change,
        'complaint_change': complaint_change,
        'feature_request_change': feature_request_change,
        'new_topics': new_topics,
        'resolved_topics': resolved_topics,
        'persistent_topics': persistent_topics,
        'sentiment_delta': sentiment_delta,
        'complaint_delta': complaint_delta,
        'feature_request_delta': feature_request_delta
    }
    
    return {
        'before_batch': before_summary,
        'after_batch': after_summary,
        'comparison': comparison
    }


@router.get("/roadmap", response_model=list[RoadmapItemResponse])
def get_roadmap(db: Session = Depends(get_db)):
    """
    Get all roadmap items ordered by status priority and then by priority score.
    
    Order:
    1. Released
    2. In Progress
    3. Planned
    4. Backlog
    
    Within each status group, items are ordered by priority_score DESC.
    """
    # Define status order
    status_order = {
        'Released': 1,
        'In Progress': 2,
        'Planned': 3,
        'Backlog': 4
    }
    
    # Get all roadmap items
    items = db.query(RoadmapItem).all()
    
    # Sort items by status order, then by priority_score DESC
    sorted_items = sorted(items, key=lambda x: (status_order.get(x.status, 5), -x.priority_score))
    
    return sorted_items

@router.post("/roadmap", response_model=RoadmapItemResponse)
def create_roadmap_item(request: CreateRoadmapItemRequest, db: Session = Depends(get_db)):
    """
    Create a new roadmap item.
    
    Validates:
    - topic cannot be empty
    - release_name cannot be empty
    - quarter cannot be empty
    - status must be valid (Backlog, Planned, In Progress, Released)
    - priority_level must be valid (high, medium, low)
    """
    # Validation
    if not request.topic or request.topic.strip() == "":
        raise HTTPException(status_code=400, detail="Topic cannot be empty")
    
    if not request.release_name or request.release_name.strip() == "":
        raise HTTPException(status_code=400, detail="Release name cannot be empty")
    
    if not request.quarter or request.quarter.strip() == "":
        raise HTTPException(status_code=400, detail="Quarter cannot be empty")
    
    valid_statuses = ['Backlog', 'Planned', 'In Progress', 'Released']
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
    
    valid_priority_levels = ['high', 'medium', 'low']
    if request.priority_level.lower() not in valid_priority_levels:
        raise HTTPException(status_code=400, detail=f"Priority level must be one of: {', '.join(valid_priority_levels)}")
    
    # Create roadmap item
    roadmap_item = RoadmapItem(
        topic=request.topic.strip(),
        priority_score=request.priority_score,
        priority_level=request.priority_level.lower(),
        release_name=request.release_name.strip(),
        quarter=request.quarter.strip(),
        status=request.status,
        owner=request.owner.strip() if request.owner else None,
        business_goal=request.business_goal.strip() if request.business_goal else None
    )
    
    db.add(roadmap_item)
    db.commit()
    db.refresh(roadmap_item)
    
    return roadmap_item

@router.put("/roadmap/{item_id}", response_model=RoadmapItemResponse)
def update_roadmap_item(item_id: int, request: UpdateRoadmapItemRequest, db: Session = Depends(get_db)):
    """
    Update an existing roadmap item.
    
    Allows updating:
    - status
    - owner
    - release_name
    - quarter
    - business_goal
    """
    roadmap_item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    
    if not roadmap_item:
        raise HTTPException(status_code=404, detail=f"Roadmap item {item_id} not found")
    
    # Validate and update fields
    if request.status is not None:
        valid_statuses = ['Backlog', 'Planned', 'In Progress', 'Released']
        if request.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
        roadmap_item.status = request.status
    
    if request.owner is not None:
        roadmap_item.owner = request.owner.strip() if request.owner.strip() else None
    
    if request.release_name is not None:
        if not request.release_name or request.release_name.strip() == "":
            raise HTTPException(status_code=400, detail="Release name cannot be empty")
        roadmap_item.release_name = request.release_name.strip()
    
    if request.quarter is not None:
        if not request.quarter or request.quarter.strip() == "":
            raise HTTPException(status_code=400, detail="Quarter cannot be empty")
        roadmap_item.quarter = request.quarter.strip()
    
    if request.business_goal is not None:
        roadmap_item.business_goal = request.business_goal.strip() if request.business_goal.strip() else None
    
    # Update timestamp
    roadmap_item.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(roadmap_item)
    
    return roadmap_item

@router.delete("/roadmap/{item_id}")
def delete_roadmap_item(item_id: int, db: Session = Depends(get_db)):
    """
    Delete a roadmap item.
    """
    roadmap_item = db.query(RoadmapItem).filter(RoadmapItem.id == item_id).first()
    
    if not roadmap_item:
        raise HTTPException(status_code=404, detail=f"Roadmap item {item_id} not found")
    
    db.delete(roadmap_item)
    db.commit()
    
    return {"status": "success", "message": f"Roadmap item {item_id} deleted successfully"}


@router.get("/product-health", response_model=ProductHealthResponse)
def get_product_health(db: Session = Depends(get_db)):
    """
    Get overall product health metrics based on feedback analysis.
    
    Calculates:
    - Overall health score (0-100)
    - Health grade (A-F)
    - Sentiment percentages
    - Complaint and feature request rates
    - Top risk and opportunity
    - Trend compared to previous batch
    """
    # Get the latest batch
    latest_batch = db.query(FeedbackBatch).order_by(desc(FeedbackBatch.id)).first()
    
    if not latest_batch:
        # No data yet - return neutral health
        return ProductHealthResponse(
            overall_health_score=70.0,
            health_grade="C",
            positive_percent=0.0,
            negative_percent=0.0,
            complaint_rate=0.0,
            feature_request_rate=0.0,
            top_risk=None,
            top_opportunity=None,
            trend="Stable",
            batches_analyzed=0
        )
    
    # Get all items from latest batch
    latest_items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == latest_batch.id).all()
    
    if not latest_items:
        return ProductHealthResponse(
            overall_health_score=70.0,
            health_grade="C",
            positive_percent=0.0,
            negative_percent=0.0,
            complaint_rate=0.0,
            feature_request_rate=0.0,
            top_risk=None,
            top_opportunity=None,
            trend="Stable",
            batches_analyzed=1
        )
    
    # Calculate latest batch metrics
    total_latest = len(latest_items)
    positive_count = 0
    negative_count = 0
    neutral_count = 0
    complaint_count = 0
    feature_request_count = 0
    
    # Track complaints and feature requests by topic
    complaint_topics = {}
    feature_request_topics = {}
    
    for item in latest_items:
        sent = (item.sentiment or "neutral").lower().strip()
        if sent == 'positive':
            positive_count += 1
        elif sent == 'negative':
            negative_count += 1
        else:
            neutral_count += 1
        
        if item.is_complaint == 1:
            complaint_count += 1
            # Track complaint topics
            if item.topics:
                for topic in item.topics:
                    normalized = topic.lower().strip()
                    if normalized:
                        if normalized not in complaint_topics:
                            complaint_topics[normalized] = {
                                'count': 0,
                                'priority_sum': 0.0
                            }
                        complaint_topics[normalized]['count'] += 1
                        complaint_topics[normalized]['priority_sum'] += (item.priority_score or 0.0)
        
        if item.is_feature_request == 1:
            feature_request_count += 1
            # Track feature request topics
            if item.topics:
                for topic in item.topics:
                    normalized = topic.lower().strip()
                    if normalized:
                        if normalized not in feature_request_topics:
                            feature_request_topics[normalized] = {
                                'count': 0,
                                'priority_sum': 0.0
                            }
                        feature_request_topics[normalized]['count'] += 1
                        feature_request_topics[normalized]['priority_sum'] += (item.priority_score or 0.0)
    
    # Calculate percentages
    positive_percent = (positive_count / total_latest * 100) if total_latest > 0 else 0.0
    negative_percent = (negative_count / total_latest * 100) if total_latest > 0 else 0.0
    complaint_rate = (complaint_count / total_latest * 100) if total_latest > 0 else 0.0
    feature_request_rate = (feature_request_count / total_latest * 100) if total_latest > 0 else 0.0
    
    # Find top risk (highest priority complaint topic)
    top_risk = None
    if complaint_topics:
        # Calculate average priority for each complaint topic
        top_risk_topic = max(
            complaint_topics.items(),
            key=lambda x: (x[1]['priority_sum'] / x[1]['count'], x[1]['count'])
        )
        top_risk = top_risk_topic[0]
    
    # Find top opportunity (highest priority feature request topic)
    top_opportunity = None
    if feature_request_topics:
        # Calculate average priority for each feature request topic
        top_opportunity_topic = max(
            feature_request_topics.items(),
            key=lambda x: (x[1]['priority_sum'] / x[1]['count'], x[1]['count'])
        )
        top_opportunity = top_opportunity_topic[0]
    
    # Calculate trend by comparing with previous batch
    trend = "Stable"
    previous_batch = db.query(FeedbackBatch).filter(
        FeedbackBatch.id < latest_batch.id
    ).order_by(desc(FeedbackBatch.id)).first()
    
    batches_analyzed = 1
    
    if previous_batch:
        batches_analyzed = 2
        previous_items = db.query(FeedbackItem).filter(FeedbackItem.batch_id == previous_batch.id).all()
        
        if previous_items:
            total_previous = len(previous_items)
            prev_positive_count = sum(1 for item in previous_items if (item.sentiment or 'neutral').lower().strip() == 'positive')
            prev_negative_count = sum(1 for item in previous_items if (item.sentiment or 'neutral').lower().strip() == 'negative')
            prev_complaint_count = sum(1 for item in previous_items if item.is_complaint == 1)
            
            prev_positive_percent = (prev_positive_count / total_previous * 100) if total_previous > 0 else 0.0
            prev_negative_percent = (prev_negative_count / total_previous * 100) if total_previous > 0 else 0.0
            prev_complaint_rate = (prev_complaint_count / total_previous * 100) if total_previous > 0 else 0.0
            
            # Determine trend
            positive_change = positive_percent - prev_positive_percent
            negative_change = negative_percent - prev_negative_percent
            complaint_change = complaint_rate - prev_complaint_rate
            
            # Calculate overall change score
            change_score = (positive_change * 0.5) - (negative_change * 0.3) - (complaint_change * 0.2)
            
            if change_score > 2.0:
                trend = "Improving"
            elif change_score < -2.0:
                trend = "Declining"
            else:
                trend = "Stable"
    
    # Calculate overall health score
    # Start at 100
    health_score = 100.0
    
    # Subtract negative impact
    health_score -= (negative_percent * 0.4)
    
    # Subtract complaint impact
    health_score -= (complaint_rate * 0.3)
    
    # Add positive impact
    health_score += (positive_percent * 0.2)
    
    # Clamp between 0 and 100
    health_score = max(0.0, min(100.0, health_score))
    
    # Determine health grade
    if health_score >= 90:
        health_grade = "A"
    elif health_score >= 80:
        health_grade = "B"
    elif health_score >= 70:
        health_grade = "C"
    elif health_score >= 60:
        health_grade = "D"
    else:
        health_grade = "F"
    
    return ProductHealthResponse(
        overall_health_score=round(health_score, 1),
        health_grade=health_grade,
        positive_percent=round(positive_percent, 1),
        negative_percent=round(negative_percent, 1),
        complaint_rate=round(complaint_rate, 1),
        feature_request_rate=round(feature_request_rate, 1),
        top_risk=top_risk,
        top_opportunity=top_opportunity,
        trend=trend,
        batches_analyzed=batches_analyzed
    )


def determine_segment(text: str) -> str:
    """
    Deterministically classify feedback into customer segments based on content.
    
    Rules:
    - Enterprise: Contains 'enterprise', 'company', 'organization', 'admin'
    - SMB: Contains 'startup', 'small business', 'team'
    - Education: Contains 'student', 'school', 'college', 'education'
    - Paid: Contains 'premium', 'pro', 'paid'
    - General Users: Everything else
    
    The same text will always produce the same segment.
    """
    text_lower = text.lower()
    
    # Check for Enterprise keywords
    enterprise_keywords = ['enterprise', 'company', 'organization', 'admin']
    if any(keyword in text_lower for keyword in enterprise_keywords):
        return 'Enterprise'
    
    # Check for SMB keywords
    smb_keywords = ['startup', 'small business', 'team']
    if any(keyword in text_lower for keyword in smb_keywords):
        return 'SMB'
    
    # Check for Education keywords
    education_keywords = ['student', 'school', 'college', 'education']
    if any(keyword in text_lower for keyword in education_keywords):
        return 'Education'
    
    # Check for Paid keywords
    paid_keywords = ['premium', 'pro', 'paid']
    if any(keyword in text_lower for keyword in paid_keywords):
        return 'Paid'
    
    # Default to General Users
    return 'General Users'

@router.get("/customer-segments", response_model=list[CustomerSegmentSummary])
def get_customer_segments(db: Session = Depends(get_db)):
    """
    Get customer segment analysis based on feedback content.
    
    Segments feedback deterministically into:
    - Enterprise
    - SMB
    - Education
    - Paid
    - General Users
    
    Returns metrics for each segment including health score.
    """
    # Get all feedback items
    all_items = db.query(FeedbackItem).all()
    
    if not all_items:
        return []
    
    # Segment all feedback items
    segments = {
        'Enterprise': [],
        'SMB': [],
        'Education': [],
        'Paid': [],
        'General Users': []
    }
    
    for item in all_items:
        segment = determine_segment(item.original_text)
        segments[segment].append(item)
    
    # Calculate metrics for each segment
    results = []
    
    for segment_name, items in segments.items():
        if not items:
            continue
        
        total = len(items)
        positive_count = 0
        neutral_count = 0
        negative_count = 0
        complaint_count = 0
        feature_request_count = 0
        
        # Track topic frequency
        topic_counts = {}
        
        for item in items:
            sent = (item.sentiment or 'neutral').lower().strip()
            if sent == 'positive':
                positive_count += 1
            elif sent == 'negative':
                negative_count += 1
            else:
                neutral_count += 1
            
            if item.is_complaint == 1:
                complaint_count += 1
            
            if item.is_feature_request == 1:
                feature_request_count += 1
            
            # Count topics
            if item.topics:
                for topic in item.topics:
                    normalized = topic.lower().strip()
                    if normalized:
                        topic_counts[normalized] = topic_counts.get(normalized, 0) + 1
        
        # Calculate percentages
        positive_percent = (positive_count / total * 100) if total > 0 else 0.0
        negative_percent = (negative_count / total * 100) if total > 0 else 0.0
        complaint_rate = (complaint_count / total * 100) if total > 0 else 0.0
        feature_request_rate = (feature_request_count / total * 100) if total > 0 else 0.0
        
        # Calculate health score
        health_score = 100.0
        health_score -= (negative_percent * 0.5)
        health_score -= (complaint_rate * 0.3)
        health_score += (positive_percent * 0.2)
        health_score = max(0.0, min(100.0, health_score))
        
        # Get top 3 topics
        top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:3]
        top_topic_names = [topic for topic, _ in top_topics]
        
        results.append({
            'segment': segment_name,
            'feedback_count': total,
            'positive': positive_count,
            'neutral': neutral_count,
            'negative': negative_count,
            'complaint_rate': round(complaint_rate, 1),
            'feature_request_rate': round(feature_request_rate, 1),
            'top_topics': top_topic_names,
            'health_score': round(health_score, 1)
        })
    
    # Sort by health score descending
    results.sort(key=lambda x: x['health_score'], reverse=True)
    
    return results

@router.get("/customer-segments/{segment}", response_model=CustomerSegmentDetailResponse)
def get_customer_segment_detail(segment: str, db: Session = Depends(get_db)):
    """
    Get detailed information about a specific customer segment.
    
    Returns:
    - Segment summary metrics
    - Top topics with mention counts
    - All supporting feedback items
    """
    # Validate segment name
    valid_segments = ['Enterprise', 'SMB', 'Education', 'Paid', 'General Users']
    if segment not in valid_segments:
        raise HTTPException(status_code=404, detail=f"Segment '{segment}' not found. Valid segments: {', '.join(valid_segments)}")
    
    # Get all feedback items
    all_items = db.query(FeedbackItem).all()
    
    # Filter items for this segment
    segment_items = [item for item in all_items if determine_segment(item.original_text) == segment]
    
    if not segment_items:
        raise HTTPException(status_code=404, detail=f"No feedback found for segment '{segment}'")
    
    # Calculate summary metrics
    total = len(segment_items)
    positive_count = 0
    neutral_count = 0
    negative_count = 0
    complaint_count = 0
    feature_request_count = 0
    
    # Track topic frequency
    topic_counts = {}
    
    for item in segment_items:
        sent = (item.sentiment or 'neutral').lower().strip()
        if sent == 'positive':
            positive_count += 1
        elif sent == 'negative':
            negative_count += 1
        else:
            neutral_count += 1
        
        if item.is_complaint == 1:
            complaint_count += 1
        
        if item.is_feature_request == 1:
            feature_request_count += 1
        
        # Count topics
        if item.topics:
            for topic in item.topics:
                normalized = topic.lower().strip()
                if normalized:
                    topic_counts[normalized] = topic_counts.get(normalized, 0) + 1
    
    # Calculate percentages and health score
    positive_percent = (positive_count / total * 100) if total > 0 else 0.0
    negative_percent = (negative_count / total * 100) if total > 0 else 0.0
    complaint_rate = (complaint_count / total * 100) if total > 0 else 0.0
    feature_request_rate = (feature_request_count / total * 100) if total > 0 else 0.0
    
    health_score = 100.0
    health_score -= (negative_percent * 0.5)
    health_score -= (complaint_rate * 0.3)
    health_score += (positive_percent * 0.2)
    health_score = max(0.0, min(100.0, health_score))
    
    # Prepare summary
    summary = {
        'feedback_count': total,
        'positive': positive_count,
        'neutral': neutral_count,
        'negative': negative_count,
        'health_score': round(health_score, 1),
        'complaint_rate': round(complaint_rate, 1),
        'feature_request_rate': round(feature_request_rate, 1)
    }
    
    # Prepare top topics
    top_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)[:10]
    top_topics_list = [{'topic': topic, 'mentions': count} for topic, count in top_topics]
    
    # Prepare feedback items (sorted by priority score)
    feedback_list = []
    for item in sorted(segment_items, key=lambda x: x.priority_score or 0, reverse=True):
        feedback_list.append({
            'id': item.id,
            'batch_id': item.batch_id,
            'original_text': item.original_text,
            'sentiment': item.sentiment,
            'priority_score': item.priority_score or 0.0,
            'topics': item.topics
        })
    
    return {
        'segment': segment,
        'summary': summary,
        'top_topics': top_topics_list,
        'feedback': feedback_list
    }


@router.get("/decision/{topic}", response_model=DecisionResponse)
def get_decision(topic: str, db: Session = Depends(get_db)):
    """
    Get or create a decision record for a topic.
    
    If no decision exists, returns a default decision with "Investigating" status.
    """
    # Normalize topic
    normalized_topic = topic.lower().strip()
    
    # Try to find existing decision
    decision = db.query(Decision).filter(Decision.topic == normalized_topic).first()
    
    # If no decision exists, create a default one
    if not decision:
        decision = Decision(
            topic=normalized_topic,
            decision_notes=None,
            status="Investigating"
        )
        db.add(decision)
        db.commit()
        db.refresh(decision)
    
    return decision

@router.post("/decision/{topic}", response_model=DecisionResponse)
def create_decision(topic: str, request: CreateDecisionRequest, db: Session = Depends(get_db)):
    """
    Create or update a decision for a topic.
    
    If decision already exists, updates it. Otherwise creates new one.
    """
    # Normalize topic
    normalized_topic = topic.lower().strip()
    
    # Validate status
    valid_statuses = ['Investigating', 'Validated', 'Planned', 'In Progress', 'Released', 'Rejected']
    if request.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
    
    # Check if decision already exists
    decision = db.query(Decision).filter(Decision.topic == normalized_topic).first()
    
    if decision:
        # Update existing decision
        decision.decision_notes = request.decision_notes
        decision.status = request.status
        decision.updated_at = datetime.now(timezone.utc)
    else:
        # Create new decision
        decision = Decision(
            topic=normalized_topic,
            decision_notes=request.decision_notes,
            status=request.status
        )
        db.add(decision)
    
    db.commit()
    db.refresh(decision)
    
    return decision

@router.put("/decision/{topic}", response_model=DecisionResponse)
def update_decision(topic: str, request: UpdateDecisionRequest, db: Session = Depends(get_db)):
    """
    Update an existing decision.
    
    Creates a new decision if none exists.
    """
    # Normalize topic
    normalized_topic = topic.lower().strip()
    
    # Find existing decision
    decision = db.query(Decision).filter(Decision.topic == normalized_topic).first()
    
    if not decision:
        # Create new decision if none exists
        decision = Decision(
            topic=normalized_topic,
            decision_notes=request.decision_notes if request.decision_notes is not None else None,
            status=request.status if request.status is not None else "Investigating"
        )
        db.add(decision)
    else:
        # Update existing decision
        if request.decision_notes is not None:
            decision.decision_notes = request.decision_notes
        
        if request.status is not None:
            # Validate status
            valid_statuses = ['Investigating', 'Validated', 'Planned', 'In Progress', 'Released', 'Rejected']
            if request.status not in valid_statuses:
                raise HTTPException(status_code=400, detail=f"Status must be one of: {', '.join(valid_statuses)}")
            decision.status = request.status
        
        decision.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(decision)
    
    return decision


@router.get("/saved-views", response_model=list[SavedViewResponse])
def get_saved_views(db: Session = Depends(get_db)):
    """
    Get all saved views ordered by creation date (newest first).
    """
    views = db.query(SavedView).order_by(desc(SavedView.created_at)).all()
    return views

@router.post("/saved-views", response_model=SavedViewResponse)
def create_saved_view(request: CreateSavedViewRequest, db: Session = Depends(get_db)):
    """
    Create a new saved view.
    
    Validates:
    - name cannot be empty
    - sentiment must be valid if provided
    - feedback_type must be valid if provided
    - priority_level must be valid if provided
    """
    # Validation
    if not request.name or request.name.strip() == "":
        raise HTTPException(status_code=400, detail="View name cannot be empty")
    
    # Validate sentiment if provided
    if request.sentiment:
        valid_sentiments = ['positive', 'negative', 'neutral']
        if request.sentiment.lower() not in valid_sentiments:
            raise HTTPException(status_code=400, detail=f"Sentiment must be one of: {', '.join(valid_sentiments)}")
    
    # Validate feedback_type if provided
    if request.feedback_type:
        valid_types = ['complaint', 'feature_request']
        if request.feedback_type.lower() not in valid_types:
            raise HTTPException(status_code=400, detail=f"Feedback type must be one of: {', '.join(valid_types)}")
    
    # Validate priority_level if provided
    if request.priority_level:
        valid_priority_levels = ['high', 'medium', 'low']
        if request.priority_level.lower() not in valid_priority_levels:
            raise HTTPException(status_code=400, detail=f"Priority level must be one of: {', '.join(valid_priority_levels)}")
    
    # Validate customer_segment if provided
    if request.customer_segment:
        valid_segments = ['Enterprise', 'SMB', 'Education', 'Paid', 'General Users']
        if request.customer_segment not in valid_segments:
            raise HTTPException(status_code=400, detail=f"Customer segment must be one of: {', '.join(valid_segments)}")
    
    # Create saved view
    saved_view = SavedView(
        name=request.name.strip(),
        sentiment=request.sentiment.lower() if request.sentiment else None,
        feedback_type=request.feedback_type.lower() if request.feedback_type else None,
        customer_segment=request.customer_segment if request.customer_segment else None,
        priority_level=request.priority_level.lower() if request.priority_level else None
    )
    
    db.add(saved_view)
    db.commit()
    db.refresh(saved_view)
    
    return saved_view

@router.delete("/saved-views/{view_id}")
def delete_saved_view(view_id: int, db: Session = Depends(get_db)):
    """
    Delete a saved view.
    """
    saved_view = db.query(SavedView).filter(SavedView.id == view_id).first()
    
    if not saved_view:
        raise HTTPException(status_code=404, detail=f"Saved view {view_id} not found")
    
    db.delete(saved_view)
    db.commit()
    
    return {"status": "success", "message": f"Saved view deleted successfully"}


@router.get("/changelog", response_model=list[ChangelogEntryResponse])
def get_changelog(db: Session = Depends(get_db)):
    """
    Get all changelog entries ordered by creation date (newest first).
    """
    entries = db.query(ChangelogEntry).order_by(desc(ChangelogEntry.created_at)).all()
    return entries

@router.post("/changelog", response_model=ChangelogEntryResponse)
def create_changelog_entry(request: CreateChangelogEntryRequest, db: Session = Depends(get_db)):
    """
    Create a new changelog entry.
    
    Validates:
    - version cannot be empty
    - title cannot be empty
    - release_batch_id must exist if provided
    """
    # Validation
    if not request.version or request.version.strip() == "":
        raise HTTPException(status_code=400, detail="Version cannot be empty")
    
    if not request.title or request.title.strip() == "":
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    
    # Validate release_batch_id if provided
    if request.release_batch_id is not None:
        batch = db.query(FeedbackBatch).filter(FeedbackBatch.id == request.release_batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail=f"Release batch {request.release_batch_id} not found")
    
    # Create changelog entry
    changelog_entry = ChangelogEntry(
        version=request.version.strip(),
        title=request.title.strip(),
        description=request.description.strip() if request.description else None,
        related_topics=request.related_topics if request.related_topics else None,
        release_batch_id=request.release_batch_id
    )
    
    db.add(changelog_entry)
    db.commit()
    db.refresh(changelog_entry)
    
    return changelog_entry

@router.put("/changelog/{entry_id}", response_model=ChangelogEntryResponse)
def update_changelog_entry(entry_id: int, request: UpdateChangelogEntryRequest, db: Session = Depends(get_db)):
    """
    Update an existing changelog entry.
    
    Allows updating:
    - version
    - title
    - description
    - related_topics
    - release_batch_id
    """
    changelog_entry = db.query(ChangelogEntry).filter(ChangelogEntry.id == entry_id).first()
    
    if not changelog_entry:
        raise HTTPException(status_code=404, detail=f"Changelog entry {entry_id} not found")
    
    # Validate and update fields
    if request.version is not None:
        if not request.version or request.version.strip() == "":
            raise HTTPException(status_code=400, detail="Version cannot be empty")
        changelog_entry.version = request.version.strip()
    
    if request.title is not None:
        if not request.title or request.title.strip() == "":
            raise HTTPException(status_code=400, detail="Title cannot be empty")
        changelog_entry.title = request.title.strip()
    
    if request.description is not None:
        changelog_entry.description = request.description.strip() if request.description.strip() else None
    
    if request.related_topics is not None:
        changelog_entry.related_topics = request.related_topics if request.related_topics else None
    
    if request.release_batch_id is not None:
        # Validate release_batch_id
        batch = db.query(FeedbackBatch).filter(FeedbackBatch.id == request.release_batch_id).first()
        if not batch:
            raise HTTPException(status_code=404, detail=f"Release batch {request.release_batch_id} not found")
        changelog_entry.release_batch_id = request.release_batch_id
    
    db.commit()
    db.refresh(changelog_entry)
    
    return changelog_entry

@router.delete("/changelog/{entry_id}")
def delete_changelog_entry(entry_id: int, db: Session = Depends(get_db)):
    """
    Delete a changelog entry.
    """
    changelog_entry = db.query(ChangelogEntry).filter(ChangelogEntry.id == entry_id).first()
    
    if not changelog_entry:
        raise HTTPException(status_code=404, detail=f"Changelog entry {entry_id} not found")
    
    db.delete(changelog_entry)
    db.commit()
    
    return {"status": "success", "message": f"Changelog entry deleted successfully"}

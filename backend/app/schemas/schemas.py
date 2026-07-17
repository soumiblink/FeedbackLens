from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class FeedbackItemSchema(BaseModel):
    id: int
    original_text: str
    sentiment: Optional[str]
    topics: Optional[List[str]]
    is_complaint: int
    is_feature_request: int
    priority_score: float

    class Config:
        from_attributes = True

class FeedbackInboxItemResponse(BaseModel):
    id: int
    batch_id: int
    original_text: str
    sentiment: Optional[str]
    sentiment_confidence: Optional[float]
    topics: Optional[List[str]]
    is_complaint: int
    is_feature_request: int
    priority_score: float

    class Config:
        from_attributes = True

class FeedbackBatchSchema(BaseModel):
    id: int
    filename: str
    upload_time: datetime
    status: str
    items: List[FeedbackItemSchema] = []

    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    total_feedback: int
    positive: int
    neutral: int
    negative: int
    top_complaints: List[Dict[str, Any]]
    trending_issues: List[Dict[str, Any]]
    sentiment_over_time: List[Dict[str, Any]]

class MemoryResponse(BaseModel):
    id: int
    batch_id: int
    created_at: datetime
    summary: str
    top_complaints: List[str]
    top_requests: List[str]
    sentiment_distribution: Dict[str, int]
    
    class Config:
        from_attributes = True

class RoutingLogResponse(BaseModel):
    id: int
    timestamp: datetime
    prompt_type: str
    model_selected: str
    reason: str
    latency_ms: float
    estimated_cost: float
    tokens_used: int
    status: str

    class Config:
        from_attributes = True

class OpportunityResponse(BaseModel):
    topic: str
    total_mentions: int
    negative_count: int
    neutral_count: int
    positive_count: int
    complaint_count: int
    feature_request_count: int
    average_severity: float
    average_confidence: float
    batch_count: int
    priority_score: float
    priority_level: str
    explanation: str
    feedback_item_ids: List[int]

    class Config:
        from_attributes = True

class OpportunityDetailFeedbackItem(BaseModel):
    id: int
    batch_id: int
    original_text: str
    sentiment: Optional[str]
    sentiment_confidence: Optional[float]
    is_complaint: int
    is_feature_request: int
    priority_score: float

    class Config:
        from_attributes = True

class OpportunityDetailResponse(BaseModel):
    topic: str
    priority_score: float
    priority_level: str
    total_mentions: int
    complaint_count: int
    feature_request_count: int
    positive_count: int
    neutral_count: int
    negative_count: int
    average_confidence: float
    average_priority: float
    supporting_feedback: List[OpportunityDetailFeedbackItem]

    class Config:
        from_attributes = True

class ReleaseBatchSummary(BaseModel):
    batch_id: int
    filename: str
    upload_time: datetime
    total_feedback: int
    positive: int
    neutral: int
    negative: int
    complaints: int
    feature_requests: int
    top_topics: List[str]

    class Config:
        from_attributes = True

class CompareReleasesRequest(BaseModel):
    before_batch: int
    after_batch: int

class ReleaseComparison(BaseModel):
    positive_change: int
    negative_change: int
    neutral_change: int
    complaint_change: int
    feature_request_change: int
    new_topics: List[str]
    resolved_topics: List[str]
    persistent_topics: List[str]
    sentiment_delta: float
    complaint_delta: float
    feature_request_delta: float

class CompareReleasesResponse(BaseModel):
    before_batch: ReleaseBatchSummary
    after_batch: ReleaseBatchSummary
    comparison: ReleaseComparison

class RoadmapItemResponse(BaseModel):
    id: int
    topic: str
    priority_score: float
    priority_level: str
    release_name: str
    quarter: str
    status: str
    owner: Optional[str]
    business_goal: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreateRoadmapItemRequest(BaseModel):
    topic: str
    priority_score: float
    priority_level: str
    release_name: str
    quarter: str
    status: str
    owner: Optional[str] = None
    business_goal: Optional[str] = None

class UpdateRoadmapItemRequest(BaseModel):
    status: Optional[str] = None
    owner: Optional[str] = None
    release_name: Optional[str] = None
    quarter: Optional[str] = None
    business_goal: Optional[str] = None

class ProductHealthResponse(BaseModel):
    overall_health_score: float
    health_grade: str
    positive_percent: float
    negative_percent: float
    complaint_rate: float
    feature_request_rate: float
    top_risk: Optional[str]
    top_opportunity: Optional[str]
    trend: str
    batches_analyzed: int

class CustomerSegmentSummary(BaseModel):
    segment: str
    feedback_count: int
    positive: int
    neutral: int
    negative: int
    complaint_rate: float
    feature_request_rate: float
    top_topics: List[str]
    health_score: float

class TopicMention(BaseModel):
    topic: str
    mentions: int

class SegmentFeedbackItem(BaseModel):
    id: int
    batch_id: int
    original_text: str
    sentiment: Optional[str]
    priority_score: float
    topics: Optional[List[str]]

class CustomerSegmentDetailResponse(BaseModel):
    segment: str
    summary: Dict[str, Any]
    top_topics: List[TopicMention]
    feedback: List[SegmentFeedbackItem]

class DecisionResponse(BaseModel):
    id: int
    topic: str
    decision_notes: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class CreateDecisionRequest(BaseModel):
    decision_notes: Optional[str] = None
    status: str = "Investigating"

class UpdateDecisionRequest(BaseModel):
    decision_notes: Optional[str] = None
    status: Optional[str] = None

class SavedViewResponse(BaseModel):
    id: int
    name: str
    sentiment: Optional[str]
    feedback_type: Optional[str]
    customer_segment: Optional[str]
    priority_level: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CreateSavedViewRequest(BaseModel):
    name: str
    sentiment: Optional[str] = None
    feedback_type: Optional[str] = None
    customer_segment: Optional[str] = None
    priority_level: Optional[str] = None

class ChangelogEntryResponse(BaseModel):
    id: int
    version: str
    title: str
    description: Optional[str]
    related_topics: Optional[List[str]]
    release_batch_id: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True

class CreateChangelogEntryRequest(BaseModel):
    version: str
    title: str
    description: Optional[str] = None
    related_topics: Optional[List[str]] = None
    release_batch_id: Optional[int] = None

class UpdateChangelogEntryRequest(BaseModel):
    version: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    related_topics: Optional[List[str]] = None
    release_batch_id: Optional[int] = None

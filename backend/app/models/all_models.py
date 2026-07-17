from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

class FeedbackBatch(Base):
    __tablename__ = "feedback_batches"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    upload_time = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    status = Column(String, default="processing") # processing, completed, failed
    
    items = relationship("FeedbackItem", back_populates="batch", cascade="all, delete")
    memory = relationship("Memory", back_populates="batch", uselist=False)

class FeedbackItem(Base):
    __tablename__ = "feedback_items"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("feedback_batches.id"))
    original_text = Column(Text)
    
    # Analysis results
    sentiment = Column(String) # positive, negative, neutral
    sentiment_confidence = Column(Float, nullable=True)
    topics = Column(JSON) # List of strings
    is_complaint = Column(Integer, default=0) # boolean
    is_feature_request = Column(Integer, default=0) # boolean
    priority_score = Column(Float, default=0.0)
    
    batch = relationship("FeedbackBatch", back_populates="items")

class Memory(Base):
    __tablename__ = "memories"
    
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("feedback_batches.id"))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # The digested "Hindsight" memory representation of this batch
    summary = Column(Text)
    top_complaints = Column(JSON)
    top_requests = Column(JSON)
    sentiment_distribution = Column(JSON)
    
    batch = relationship("FeedbackBatch", back_populates="memory")

class RoutingLog(Base):
    __tablename__ = "routing_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    prompt_type = Column(String)
    model_selected = Column(String)
    reason = Column(String)
    latency_ms = Column(Float)
    estimated_cost = Column(Float)
    tokens_used = Column(Integer)
    status = Column(String) # success, fallback, failed

class RoadmapItem(Base):
    __tablename__ = "roadmap_items"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False, index=True)
    priority_score = Column(Float, default=0.0)
    priority_level = Column(String, nullable=False) # high, medium, low
    release_name = Column(String, nullable=False)
    quarter = Column(String, nullable=False)
    status = Column(String, nullable=False, default="Backlog") # Backlog, Planned, In Progress, Released
    owner = Column(String, nullable=True)
    business_goal = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Decision(Base):
    __tablename__ = "decisions"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, nullable=False, unique=True, index=True)
    decision_notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="Investigating") # Investigating, Validated, Planned, In Progress, Released, Rejected
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class SavedView(Base):
    __tablename__ = "saved_views"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sentiment = Column(String, nullable=True) # positive, negative, neutral
    feedback_type = Column(String, nullable=True) # complaint, feature_request
    customer_segment = Column(String, nullable=True) # Enterprise, SMB, Education, Paid, General Users
    priority_level = Column(String, nullable=True) # high, medium, low
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ChangelogEntry(Base):
    __tablename__ = "changelog_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    related_topics = Column(JSON, nullable=True) # List of topic strings
    release_batch_id = Column(Integer, ForeignKey("feedback_batches.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

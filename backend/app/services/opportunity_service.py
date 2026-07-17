from sqlalchemy.orm import Session
from app.models.all_models import FeedbackItem
from typing import List, Dict, Set

class OpportunityService:
    def generate_opportunities(self, db: Session) -> List[Dict]:
        """
        Generate product opportunities from all FeedbackItem records.
        Groups by normalized topics and calculates priority scores.
        """
        # Fetch all feedback items
        all_items = db.query(FeedbackItem).all()
        
        if not all_items:
            return []
        
        # Build opportunity groups by normalized topic
        topic_groups: Dict[str, Dict] = {}
        
        for item in all_items:
            if not item.topics:
                continue
            
            # Track which topics this item has already contributed to
            # (prevents double-counting duplicate topics within same item)
            processed_topics: Set[str] = set()
            
            for topic in item.topics:
                # Normalize topic
                normalized_topic = self._normalize_topic(topic)
                
                if not normalized_topic or normalized_topic in processed_topics:
                    continue
                
                processed_topics.add(normalized_topic)
                
                # Initialize topic group if needed
                if normalized_topic not in topic_groups:
                    topic_groups[normalized_topic] = {
                        'topic': normalized_topic,
                        'feedback_items': [],
                        'negative_count': 0,
                        'neutral_count': 0,
                        'positive_count': 0,
                        'complaint_count': 0,
                        'feature_request_count': 0,
                        'priority_scores': [],
                        'sentiment_confidences': [],
                        'batch_ids': set()
                    }
                
                group = topic_groups[normalized_topic]
                
                # Add this feedback item
                group['feedback_items'].append(item.id)
                
                # Track sentiment
                sentiment = (item.sentiment or 'neutral').lower().strip()
                if sentiment == 'positive':
                    group['positive_count'] += 1
                elif sentiment == 'negative':
                    group['negative_count'] += 1
                else:
                    group['neutral_count'] += 1
                
                # Track complaint/feature request
                if item.is_complaint == 1:
                    group['complaint_count'] += 1
                if item.is_feature_request == 1:
                    group['feature_request_count'] += 1
                
                # Track priority score
                if item.priority_score is not None:
                    group['priority_scores'].append(item.priority_score)
                
                # Track sentiment confidence
                if item.sentiment_confidence is not None:
                    group['sentiment_confidences'].append(item.sentiment_confidence)
                
                # Track batch
                group['batch_ids'].add(item.batch_id)
        
        # Calculate final opportunities
        opportunities = []
        
        # Find max mentions for frequency calculation
        max_mentions = max((len(g['feedback_items']) for g in topic_groups.values()), default=1)
        
        for topic, group in topic_groups.items():
            total_mentions = len(group['feedback_items'])
            
            # Calculate average severity (priority score)
            average_severity = (
                sum(group['priority_scores']) / len(group['priority_scores'])
                if group['priority_scores'] else 0.0
            )
            
            # Calculate average confidence
            average_confidence = (
                sum(group['sentiment_confidences']) / len(group['sentiment_confidences'])
                if group['sentiment_confidences'] else 0.0
            )
            
            # Calculate priority score
            priority_score = self._calculate_priority_score(
                total_mentions=total_mentions,
                max_mentions=max_mentions,
                average_severity=average_severity,
                negative_count=group['negative_count'],
                average_confidence=average_confidence
            )
            
            # Determine priority level
            priority_level = self._get_priority_level(priority_score)
            
            # Generate explanation
            explanation = self._generate_explanation(
                total_mentions=total_mentions,
                max_mentions=max_mentions,
                average_severity=average_severity,
                negative_count=group['negative_count'],
                batch_count=len(group['batch_ids']),
                priority_score=priority_score
            )
            
            opportunities.append({
                'topic': topic,
                'total_mentions': total_mentions,
                'negative_count': group['negative_count'],
                'neutral_count': group['neutral_count'],
                'positive_count': group['positive_count'],
                'complaint_count': group['complaint_count'],
                'feature_request_count': group['feature_request_count'],
                'average_severity': round(average_severity, 2),
                'average_confidence': round(average_confidence, 2),
                'batch_count': len(group['batch_ids']),
                'priority_score': priority_score,
                'priority_level': priority_level,
                'explanation': explanation,
                'feedback_item_ids': group['feedback_items']
            })
        
        # Sort by priority score descending
        opportunities.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return opportunities
    
    def _normalize_topic(self, topic: str) -> str:
        """Normalize topic name for grouping."""
        if not topic or not isinstance(topic, str):
            return ""
        return topic.lower().strip()
    
    def _calculate_priority_score(
        self,
        total_mentions: int,
        max_mentions: int,
        average_severity: float,
        negative_count: int,
        average_confidence: float
    ) -> float:
        """
        Calculate priority score from 0.0 to 10.0 using weighted factors.
        
        Formula:
        priority_score = (
            frequency_score * 0.35 +
            severity_score * 0.30 +
            sentiment_impact_score * 0.25 +
            confidence_score * 0.10
        ) * 10
        """
        # Frequency score (0.0 to 1.0)
        frequency_score = total_mentions / max_mentions if max_mentions > 0 else 0.0
        
        # Severity score (0.0 to 1.0)
        severity_score = average_severity / 10.0 if average_severity > 0 else 0.0
        
        # Sentiment impact score (0.0 to 1.0)
        sentiment_impact_score = negative_count / total_mentions if total_mentions > 0 else 0.0
        
        # Confidence score (already 0.0 to 1.0)
        confidence_score = average_confidence
        
        # Weighted sum
        priority_score = (
            frequency_score * 0.35 +
            severity_score * 0.30 +
            sentiment_impact_score * 0.25 +
            confidence_score * 0.10
        ) * 10
        
        # Round to 2 decimal places and ensure within bounds
        priority_score = max(0.0, min(10.0, round(priority_score, 2)))
        
        return priority_score
    
    def _get_priority_level(self, priority_score: float) -> str:
        """Determine priority level based on score."""
        if priority_score >= 7.0:
            return 'high'
        elif priority_score >= 4.0:
            return 'medium'
        else:
            return 'low'
    
    def _generate_explanation(
        self,
        total_mentions: int,
        max_mentions: int,
        average_severity: float,
        negative_count: int,
        batch_count: int,
        priority_score: float
    ) -> str:
        """
        Generate deterministic explanation based on metrics.
        No LLM calls - purely rule-based.
        """
        # Calculate relative frequency
        frequency_ratio = total_mentions / max_mentions if max_mentions > 0 else 0.0
        is_frequent = frequency_ratio > 0.6
        is_moderate_frequency = 0.3 < frequency_ratio <= 0.6
        
        # Severity assessment
        is_high_severity = average_severity >= 7.0
        is_moderate_severity = 4.0 <= average_severity < 7.0
        
        # Negative feedback assessment
        negative_ratio = negative_count / total_mentions if total_mentions > 0 else 0.0
        is_strongly_negative = negative_ratio > 0.6
        is_moderately_negative = 0.3 < negative_ratio <= 0.6
        
        # Multi-batch presence
        is_multi_batch = batch_count > 1
        
        # Build explanation
        parts = []
        
        # Frequency component
        if is_frequent:
            parts.append("Frequently mentioned")
        elif is_moderate_frequency:
            parts.append("Moderately mentioned")
        else:
            parts.append("Limited feedback volume")
        
        # Batch component
        if is_multi_batch:
            parts.append(f"across {batch_count} batches")
        
        # Severity component
        if is_high_severity:
            if parts:
                parts.append("with high reported severity")
            else:
                parts.append("High severity issue")
        elif is_moderate_severity:
            if parts:
                parts.append("with moderate severity")
            else:
                parts.append("Moderate severity issue")
        
        # Sentiment component
        if is_strongly_negative:
            parts.append("and strongly associated with negative feedback")
        elif is_moderately_negative:
            parts.append("and moderately associated with negative feedback")
        
        # Combine parts
        if not parts:
            explanation = "Limited data available for this opportunity."
        else:
            explanation = ", ".join(parts[:2])
            if len(parts) > 2:
                explanation += " " + ", ".join(parts[2:])
            explanation = explanation[0].upper() + explanation[1:] + "."
        
        # Add validation suggestion for low volume high severity
        if is_high_severity and total_mentions < 5:
            explanation += " Further validation may be needed given limited feedback volume."
        
        return explanation

opportunity_service = OpportunityService()

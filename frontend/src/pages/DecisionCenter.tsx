import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, AlertCircle, Sparkles, TrendingUp, 
  BarChart3, FileText, ExternalLink, Calendar, Users 
} from 'lucide-react';
import { 
  getOpportunityDetail, 
  getReleaseImpact, 
  getRoadmap, 
  getDecision, 
  updateDecision, 
  getCustomerSegments 
} from '../services/api';
import { SkeletonMetricCard } from '../components/Skeleton';
import ErrorState from '../components/ErrorState';

interface FeedbackItem {
  id: number;
  batch_id: number;
  original_text: string;
  sentiment: string | null;
  sentiment_confidence: number | null;
  is_complaint: number;
  is_feature_request: number;
  priority_score: number;
}

interface OpportunityDetail {
  topic: string;
  priority_score: number;
  priority_level: string;
  total_mentions: number;
  complaint_count: number;
  feature_request_count: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  average_confidence: number;
  average_priority: number;
  supporting_feedback: FeedbackItem[];
}

interface Decision {
  id: number;
  topic: string;
  decision_notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ReleaseBatch {
  batch_id: number;
  filename: string;
  upload_time: string;
  total_feedback: number;
  top_topics: string[];
}

interface RoadmapItem {
  id: number;
  topic: string;
  priority_score: number;
  priority_level: string;
  release_name: string;
  quarter: string;
  status: string;
}

interface CustomerSegment {
  segment: string;
  feedback_count: number;
}

const DECISION_STATUSES = [
  'Investigating',
  'Validated',
  'Planned',
  'In Progress',
  'Released',
  'Rejected'
];

export default function DecisionCenter() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [releases, setReleases] = useState<ReleaseBatch[]>([]);
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([]);
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  
  const [decisionNotes, setDecisionNotes] = useState('');
  const [decisionStatus, setDecisionStatus] = useState('Investigating');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (topic) {
      loadData();
    }
  }, [topic]);

  const loadData = async () => {
    if (!topic) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const [oppData, decisionData, releaseData, roadmapData, segmentData] = await Promise.all([
        getOpportunityDetail(topic),
        getDecision(topic),
        getReleaseImpact(),
        getRoadmap(),
        getCustomerSegments()
      ]);
      
      setOpportunity(oppData);
      setDecision(decisionData);
      setDecisionNotes(decisionData.decision_notes || '');
      setDecisionStatus(decisionData.status);
      setReleases(releaseData);
      setRoadmapItems(roadmapData);
      setSegments(segmentData);
    } catch (err: any) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!topic) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      const updated = await updateDecision(topic, {
        decision_notes: decisionNotes,
        status: decisionStatus
      });
      
      setDecision(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save decision:', err);
      alert('Failed to save decision');
    } finally {
      setIsSaving(false);
    }
  };

  const formatTopic = (topic: string): string => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getPriorityLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getPriorityScoreColor = (score: number) => {
    if (score >= 7.0) return 'text-rose-400';
    if (score >= 4.0) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Investigating':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      case 'Validated':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Planned':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'In Progress':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Released':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'negative':
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'neutral':
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      default:
        return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getLatestRelease = (): ReleaseBatch | null => {
    if (!releases.length) return null;
    return releases[releases.length - 1];
  };

  const getAffectedSegments = (): string[] => {
    if (!opportunity || !segments) return [];
    
    const affectedSegments: string[] = [];
    
    for (const segment of segments) {
      if (segment.feedback_count > 0) {
        affectedSegments.push(segment.segment);
      }
    }
    
    return affectedSegments.slice(0, 3);
  };

  const getRoadmapItemForTopic = (): RoadmapItem | null => {
    if (!topic || !roadmapItems.length) return null;
    const normalized = topic.toLowerCase().trim();
    return roadmapItems.find(item => item.topic.toLowerCase().trim() === normalized) || null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-700/50 rounded w-48 animate-pulse"></div>
        <div className="glass-panel p-8 animate-pulse">
          <div className="h-10 bg-slate-700/50 rounded w-96 mb-4"></div>
          <div className="h-6 bg-slate-700/50 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/prioritization')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Prioritization</span>
        </button>
        <ErrorState 
          onRetry={loadData}
          message="We couldn't load the decision center data. Please try again."
        />
      </div>
    );
  }

  if (!opportunity || !decision) {
    return null;
  }

  const latestRelease = getLatestRelease();
  const affectedSegments = getAffectedSegments();
  const roadmapItem = getRoadmapItemForTopic();
  const complaintPercent = opportunity.total_mentions > 0 ? Math.round((opportunity.complaint_count / opportunity.total_mentions) * 100) : 0;
  const negativePercent = opportunity.total_mentions > 0 ? Math.round((opportunity.negative_count / opportunity.total_mentions) * 100) : 0;
  const featureRequestPercent = opportunity.total_mentions > 0 ? Math.round((opportunity.feature_request_count / opportunity.total_mentions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(`/opportunity/${encodeURIComponent(topic || '')}`)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Opportunity</span>
      </button>

      {/* Header */}
      <div className="glass-panel p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{formatTopic(opportunity.topic)}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border uppercase ${getPriorityLevelColor(opportunity.priority_level)}`}>
                {opportunity.priority_level} Priority
              </span>
              <span className={`px-4 py-2 rounded-full text-sm font-bold border ${getStatusColor(decisionStatus)}`}>
                {decisionStatus}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-slate-500 mb-1">Priority Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-bold ${getPriorityScoreColor(opportunity.priority_score)}`}>
                {opportunity.priority_score.toFixed(2)}
              </span>
              <span className="text-2xl text-slate-600">/10</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate('/prioritization')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            <span>All Opportunities</span>
          </button>
          {roadmapItem && (
            <button
              onClick={() => navigate('/roadmap')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View in Roadmap</span>
            </button>
          )}
          <button
            onClick={() => navigate('/releases')}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/20 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Release Impact</span>
          </button>
        </div>
      </div>

      {/* Opportunity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <p className="text-sm text-slate-500">Total Mentions</p>
          </div>
          <p className="text-3xl font-bold text-white">{opportunity.total_mentions}</p>
        </div>
        
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-slate-500">Affected Segments</p>
          </div>
          <p className="text-3xl font-bold text-white">{affectedSegments.length}</p>
          {affectedSegments.length > 0 && (
            <p className="text-xs text-slate-400 mt-1">{affectedSegments.join(', ')}</p>
          )}
        </div>
        
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <p className="text-sm text-slate-500">Latest Release</p>
          </div>
          {latestRelease ? (
            <>
              <p className="text-xl font-bold text-white truncate">{latestRelease.filename}</p>
              <p className="text-xs text-slate-400 mt-1">Batch #{latestRelease.batch_id}</p>
            </>
          ) : (
            <p className="text-slate-400">No releases</p>
          )}
        </div>
        
        <div className="glass-panel p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <p className="text-sm text-slate-500">Roadmap Status</p>
          </div>
          {roadmapItem ? (
            <>
              <p className="text-xl font-bold text-emerald-400">{roadmapItem.status}</p>
              <p className="text-xs text-slate-400 mt-1">{roadmapItem.release_name}</p>
            </>
          ) : (
            <p className="text-slate-400">Not planned</p>
          )}
        </div>
      </div>

      {/* Evidence Summary */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Evidence Summary</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Customer Mentions</p>
            <p className="text-3xl font-bold text-indigo-400">{opportunity.total_mentions}</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Complaint Rate</p>
            <p className="text-3xl font-bold text-rose-400">{complaintPercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{opportunity.complaint_count} complaints</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Negative Sentiment</p>
            <p className="text-3xl font-bold text-rose-400">{negativePercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{opportunity.negative_count} negative</p>
          </div>
        </div>
        
        <div className="space-y-2 text-slate-300">
          <p>• {opportunity.total_mentions} customers mentioned {formatTopic(opportunity.topic)}.</p>
          {complaintPercent > 0 && (
            <p>• {complaintPercent}% of mentions are complaints.</p>
          )}
          {featureRequestPercent > 0 && (
            <p>• {featureRequestPercent}% are feature requests.</p>
          )}
          {negativePercent > 50 && (
            <p>• Negative sentiment dominates at {negativePercent}%.</p>
          )}
          <p>• Average confidence is {Math.round(opportunity.average_confidence * 100)}%.</p>
        </div>
      </div>

      {/* PM Decision Section */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">PM Decision</h2>
        </div>

        {/* Decision Status */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Decision Status
          </label>
          <select
            value={decisionStatus}
            onChange={(e) => setDecisionStatus(e.target.value)}
            className="w-full md:w-auto px-4 py-2 bg-dark-bg border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
          >
            {DECISION_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Decision Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2">
            Decision Notes
          </label>
          <textarea
            value={decisionNotes}
            onChange={(e) => setDecisionNotes(e.target.value)}
            placeholder="Document your decision rationale, analysis, and next steps here..."
            className="w-full h-40 px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Decision'}
          </button>
          
          {saveSuccess && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-400 font-medium"
            >
              ✓ Saved successfully
            </motion.span>
          )}
        </div>

        {/* Metadata */}
        <div className="mt-6 pt-6 border-t border-slate-700/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Created:</span>
              <span className="text-slate-300 ml-2">
                {new Date(decision.created_at).toLocaleDateString()} {new Date(decision.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Last Updated:</span>
              <span className="text-slate-300 ml-2">
                {new Date(decision.updated_at).toLocaleDateString()} {new Date(decision.updated_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting Feedback */}
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Supporting Feedback</h2>
        <p className="text-sm text-slate-400 mb-6">
          Showing {opportunity.supporting_feedback.length} feedback items, sorted by priority
        </p>
        <div className="space-y-4">
          {opportunity.supporting_feedback.slice(0, 10).map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-dark-bg/30 p-5 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment || 'Unknown'}
                </span>

                {item.is_complaint === 1 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Complaint
                  </span>
                )}

                {item.is_feature_request === 1 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Feature Request
                  </span>
                )}

                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                  Batch #{item.batch_id}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed mb-3">
                {item.original_text}
              </p>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">Priority:</span>
                <span className={`font-bold ${getPriorityScoreColor(item.priority_score)}`}>
                  {item.priority_score.toFixed(1)}
                </span>
                <span className="text-slate-600">/10</span>
              </div>
            </motion.div>
          ))}
        </div>
        {opportunity.supporting_feedback.length > 10 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate(`/opportunity/${encodeURIComponent(topic || '')}`)}
              className="text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View all {opportunity.supporting_feedback.length} feedback items →
            </button>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Decision Timeline</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <div className="w-0.5 h-full bg-slate-700" />
            </div>
            <div className="flex-1 pb-6">
              <p className="text-white font-medium">Decision Updated</p>
              <p className="text-sm text-slate-400">
                {new Date(decision.updated_at).toLocaleDateString()} at {new Date(decision.updated_at).toLocaleTimeString()}
              </p>
              <p className="text-sm text-slate-300 mt-2">Status: {decisionStatus}</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <div className="w-0.5 h-full bg-slate-700" />
            </div>
            <div className="flex-1 pb-6">
              <p className="text-white font-medium">Decision Created</p>
              <p className="text-sm text-slate-400">
                {new Date(decision.created_at).toLocaleDateString()} at {new Date(decision.created_at).toLocaleTimeString()}
              </p>
              <p className="text-sm text-slate-300 mt-2">Initial status: Investigating</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-slate-600" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Opportunity Identified</p>
              <p className="text-sm text-slate-400">Based on {opportunity.total_mentions} customer mentions</p>
              <p className="text-sm text-slate-300 mt-2">Priority: {opportunity.priority_level} ({opportunity.priority_score.toFixed(2)}/10)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

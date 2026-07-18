import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Sparkles, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { getOpportunityDetail } from '../services/api';
import { SkeletonMetricCard, SkeletonList } from '../components/Skeleton';
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

export default function OpportunityDetail() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (topic) {
      loadDetail();
    }
  }, [topic]);

  const loadDetail = async () => {
    if (!topic) return;
    
    setLoading(true);
    setError(false);
    try {
      const data = await getOpportunityDetail(topic);
      setDetail(data);
    } catch (err: any) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-slate-700/50 rounded w-48 animate-pulse"></div>
        <div className="glass-panel p-8 animate-pulse">
          <div className="h-10 bg-slate-700/50 rounded w-96 mb-4"></div>
          <div className="h-6 bg-slate-700/50 rounded w-64"></div>
        </div>
        <div className="glass-panel p-6 animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-48 mb-4"></div>
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-slate-700/30 rounded"></div>
            ))}
          </div>
        </div>
        <div className="glass-panel p-6 animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <SkeletonMetricCard key={i} />
            ))}
          </div>
        </div>
        <div className="glass-panel p-6 animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-48 mb-6"></div>
          <SkeletonList />
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
          onRetry={loadDetail}
          message="We couldn't load the opportunity details. Please try again."
        />
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  // Calculate percentages
  const complaintPercent = detail.total_mentions > 0 ? Math.round((detail.complaint_count / detail.total_mentions) * 100) : 0;
  const featureRequestPercent = detail.total_mentions > 0 ? Math.round((detail.feature_request_count / detail.total_mentions) * 100) : 0;
  const positivePercent = detail.total_mentions > 0 ? Math.round((detail.positive_count / detail.total_mentions) * 100) : 0;
  const negativePercent = detail.total_mentions > 0 ? Math.round((detail.negative_count / detail.total_mentions) * 100) : 0;
  const neutralPercent = detail.total_mentions > 0 ? Math.round((detail.neutral_count / detail.total_mentions) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/prioritization')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Prioritization</span>
      </button>

      {/* Header */}
      <div className="glass-panel p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-white mb-4">{formatTopic(detail.topic)}</h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-bold border uppercase ${getPriorityLevelColor(detail.priority_level)}`}>
                {detail.priority_level}
              </span>
              <span className="text-slate-400">{detail.total_mentions} mentions</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-slate-500 mb-1">Priority Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-bold ${getPriorityScoreColor(detail.priority_score)}`}>
                {detail.priority_score.toFixed(2)}
              </span>
              <span className="text-2xl text-slate-600">/10</span>
            </div>
          </div>
        </div>
        
        {/* Open Decision Center Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate(`/decision/${encodeURIComponent(detail.topic)}`)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
          >
            <FileText className="w-5 h-5" />
            Open Decision Center
          </button>
        </div>
      </div>

      {/* Evidence Summary */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Evidence Summary</h2>
        </div>
        <div className="space-y-2 text-slate-300">
          <p>• {detail.total_mentions} customers mentioned {formatTopic(detail.topic)}.</p>
          {complaintPercent > 0 && (
            <p>• {complaintPercent}% of those reports are complaints.</p>
          )}
          {detail.negative_count > detail.positive_count && detail.negative_count > detail.neutral_count && (
            <p>• Negative sentiment dominates.</p>
          )}
          {detail.positive_count > detail.negative_count && detail.positive_count > detail.neutral_count && (
            <p>• Positive sentiment dominates.</p>
          )}
          <p>• Average confidence is {Math.round(detail.average_confidence * 100)}%.</p>
          <p>• Average priority score is {detail.average_priority.toFixed(1)}.</p>
        </div>
      </div>

      {/* Product Signals */}
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Product Signals</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Complaint %</p>
            <p className="text-3xl font-bold text-rose-400">{complaintPercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{detail.complaint_count} complaints</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Feature Request %</p>
            <p className="text-3xl font-bold text-indigo-400">{featureRequestPercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{detail.feature_request_count} requests</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Positive %</p>
            <p className="text-3xl font-bold text-emerald-400">{positivePercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{detail.positive_count} positive</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Negative %</p>
            <p className="text-3xl font-bold text-rose-400">{negativePercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{detail.negative_count} negative</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Neutral %</p>
            <p className="text-3xl font-bold text-slate-400">{neutralPercent}%</p>
            <p className="text-xs text-slate-600 mt-1">{detail.neutral_count} neutral</p>
          </div>
          <div className="bg-dark-bg/50 p-4 rounded-lg">
            <p className="text-sm text-slate-500 mb-2">Average Confidence</p>
            <p className="text-3xl font-bold text-white">{Math.round(detail.average_confidence * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Evidence Timeline */}
      <div className="glass-panel p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Evidence Timeline</h2>
        <p className="text-sm text-slate-400 mb-6">
          Showing {detail.supporting_feedback.length} feedback items, sorted by priority score (highest first)
        </p>
        <div className="space-y-4">
          {detail.supporting_feedback.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-dark-bg/30 p-5 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Sentiment Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment || 'Unknown'}
                  {item.sentiment_confidence !== null && (
                    <span className="ml-1 opacity-75">
                      {Math.round(item.sentiment_confidence * 100)}%
                    </span>
                  )}
                </span>

                {/* Complaint Badge */}
                {item.is_complaint === 1 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Complaint
                  </span>
                )}

                {/* Feature Request Badge */}
                {item.is_feature_request === 1 && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Feature Request
                  </span>
                )}

                {/* Batch ID */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                  Batch #{item.batch_id}
                </span>

                {/* Feedback ID */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/50 text-slate-500 border border-slate-700/50">
                  ID #{item.id}
                </span>
              </div>

              {/* Feedback Text */}
              <p className="text-slate-200 leading-relaxed mb-3">
                {item.original_text}
              </p>

              {/* Priority Score */}
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
      </div>
    </div>
  );
}

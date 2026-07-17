import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { getCustomerSegmentDetail } from '../services/api';

interface TopicMention {
  topic: string;
  mentions: number;
}

interface SegmentFeedback {
  id: number;
  batch_id: number;
  original_text: string;
  sentiment: string | null;
  priority_score: number;
  topics: string[] | null;
}

interface SegmentDetail {
  segment: string;
  summary: {
    feedback_count: number;
    positive: number;
    neutral: number;
    negative: number;
    health_score: number;
    complaint_rate: number;
    feature_request_rate: number;
  };
  top_topics: TopicMention[];
  feedback: SegmentFeedback[];
}

export default function CustomerSegmentDetail() {
  const { segment } = useParams<{ segment: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<SegmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (segment) {
      loadDetail();
    }
  }, [segment]);

  const loadDetail = async () => {
    if (!segment) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerSegmentDetail(segment);
      setDetail(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load segment details');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
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

  const getPriorityScoreColor = (score: number) => {
    if (score >= 7.0) return 'text-rose-400';
    if (score >= 4.0) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const formatTopic = (topic: string): string => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSegmentIcon = (segmentName: string) => {
    const icons: { [key: string]: string } = {
      'Enterprise': '🏢',
      'SMB': '🚀',
      'Education': '🎓',
      'Paid': '💎',
      'General Users': '👤'
    };
    return icons[segmentName] || '👥';
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-xl max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Details</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/customers')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Back to Segments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/customers')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Customer Segments</span>
      </button>

      {/* Header */}
      <div className="glass-panel p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <span className="text-5xl">{getSegmentIcon(detail.segment)}</span>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{detail.segment}</h1>
              <p className="text-slate-400">{detail.summary.feedback_count} feedback items</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-sm text-slate-500 mb-1">Health Score</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-5xl font-bold ${getHealthScoreColor(detail.summary.health_score)}`}>
                {detail.summary.health_score}
              </span>
              <span className="text-2xl text-slate-600">/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400">Positive</p>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{detail.summary.positive}</p>
          <p className="text-xs text-slate-500 mt-1">
            {((detail.summary.positive / detail.summary.feedback_count) * 100).toFixed(1)}% of feedback
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-sm text-slate-400">Negative</p>
          </div>
          <p className="text-3xl font-bold text-rose-400">{detail.summary.negative}</p>
          <p className="text-xs text-slate-500 mt-1">
            {((detail.summary.negative / detail.summary.feedback_count) * 100).toFixed(1)}% of feedback
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-sm text-slate-400">Complaints</p>
          </div>
          <p className="text-3xl font-bold text-orange-400">{detail.summary.complaint_rate}%</p>
          <p className="text-xs text-slate-500 mt-1">of feedback</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <p className="text-sm text-slate-400">Requests</p>
          </div>
          <p className="text-3xl font-bold text-indigo-400">{detail.summary.feature_request_rate}%</p>
          <p className="text-xs text-slate-500 mt-1">of feedback</p>
        </motion.div>
      </div>

      {/* Top Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Top Topics</h2>
        {detail.top_topics.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {detail.top_topics.map((topic, idx) => (
              <div key={idx} className="bg-dark-bg/50 p-4 rounded-lg">
                <p className="text-sm text-slate-400 mb-2">{formatTopic(topic.topic)}</p>
                <p className="text-2xl font-bold text-indigo-400">{topic.mentions}</p>
                <p className="text-xs text-slate-500 mt-1">mentions</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">No topics identified</p>
        )}
      </motion.div>

      {/* Supporting Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-panel p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Supporting Feedback</h2>
        <p className="text-sm text-slate-400 mb-6">
          Showing {detail.feedback.length} feedback items, sorted by priority score (highest first)
        </p>
        <div className="space-y-4">
          {detail.feedback.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (idx * 0.02) }}
              className="bg-dark-bg/30 p-5 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {/* Sentiment Badge */}
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor(item.sentiment)}`}>
                  {item.sentiment || 'Unknown'}
                </span>

                {/* Batch ID */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/50">
                  Batch #{item.batch_id}
                </span>

                {/* Feedback ID */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800/50 text-slate-500 border border-slate-700/50">
                  ID #{item.id}
                </span>

                {/* Priority Score */}
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-dark-bg border border-slate-700/50">
                  Priority: <span className={`font-bold ${getPriorityScoreColor(item.priority_score)}`}>
                    {item.priority_score.toFixed(1)}
                  </span>
                </span>
              </div>

              {/* Feedback Text */}
              <p className="text-slate-200 leading-relaxed mb-3">
                {item.original_text}
              </p>

              {/* Topics */}
              {item.topics && item.topics.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.topics.map((topic, topicIdx) => (
                    <span 
                      key={topicIdx}
                      className="px-2 py-1 bg-indigo-500/10 text-indigo-300 rounded text-xs border border-indigo-500/20"
                    >
                      {formatTopic(topic)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, TrendingUp, AlertTriangle, Sparkles, ExternalLink } from 'lucide-react';
import { getCustomerSegments } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface CustomerSegment {
  segment: string;
  feedback_count: number;
  positive: number;
  neutral: number;
  negative: number;
  complaint_rate: number;
  feature_request_rate: number;
  top_topics: string[];
  health_score: number;
}

export default function CustomerSegments() {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<CustomerSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerSegments();
      setSegments(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load customer segments');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getHealthScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 border-emerald-500/20';
    if (score >= 60) return 'bg-amber-500/10 border-amber-500/20';
    return 'bg-rose-500/10 border-rose-500/20';
  };

  const getSegmentIcon = (segment: string) => {
    const icons: { [key: string]: string } = {
      'Enterprise': '🏢',
      'SMB': '🚀',
      'Education': '🎓',
      'Paid': '💎',
      'General Users': '👤'
    };
    return icons[segment] || '👥';
  };

  const formatTopic = (topic: string): string => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-xl max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Segments</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={loadSegments}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Customer Segments</h1>
        </div>
        <p className="text-muted-text">Understand how different customer segments experience your product.</p>
      </header>

      {/* Segment Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {segments.map((segment, idx) => (
          <motion.div
            key={segment.segment}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`glass-panel p-5 ${getHealthScoreBgColor(segment.health_score)}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getSegmentIcon(segment.segment)}</span>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">{segment.segment}</h3>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-slate-400">Health Score</p>
                <p className={`text-2xl font-bold ${getHealthScoreColor(segment.health_score)}`}>
                  {segment.health_score}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Feedback</p>
                <p className="text-lg font-semibold text-white">{segment.feedback_count}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Complaints</p>
                <p className="text-sm font-medium text-orange-400">{segment.complaint_rate}%</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Segment Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Segment Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Segment</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Health Score</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Feedback Count</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Negative %</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Complaint %</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Feature Requests %</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Top Topic</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((segment) => {
                const negativePercent = segment.feedback_count > 0 
                  ? ((segment.negative / segment.feedback_count) * 100).toFixed(1)
                  : '0.0';
                
                return (
                  <tr 
                    key={segment.segment}
                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getSegmentIcon(segment.segment)}</span>
                        <span className="font-medium text-white">{segment.segment}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-lg font-bold ${getHealthScoreColor(segment.health_score)}`}>
                        {segment.health_score}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-white">{segment.feedback_count}</td>
                    <td className="py-4 px-4 text-rose-400">{negativePercent}%</td>
                    <td className="py-4 px-4 text-orange-400">{segment.complaint_rate}%</td>
                    <td className="py-4 px-4 text-indigo-400">{segment.feature_request_rate}%</td>
                    <td className="py-4 px-4">
                      {segment.top_topics.length > 0 ? (
                        <span className="text-slate-300">{formatTopic(segment.top_topics[0])}</span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Segment Detail Cards */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Segment Details</h2>
        {segments.map((segment, idx) => (
          <motion.div
            key={segment.segment}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (idx * 0.05) }}
            className="glass-panel p-6 hover:bg-dark-surface/90 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getSegmentIcon(segment.segment)}</span>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{segment.segment}</h3>
                  <p className="text-sm text-slate-400">{segment.feedback_count} feedback items</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-400 mb-1">Health Score</p>
                <p className={`text-4xl font-bold ${getHealthScoreColor(segment.health_score)}`}>
                  {segment.health_score}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-slate-400">Positive</p>
                </div>
                <p className="text-xl font-bold text-emerald-400">{segment.positive}</p>
              </div>
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <p className="text-xs text-slate-400">Negative</p>
                </div>
                <p className="text-xl font-bold text-rose-400">{segment.negative}</p>
              </div>
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-orange-400" />
                  <p className="text-xs text-slate-400">Complaint Rate</p>
                </div>
                <p className="text-xl font-bold text-orange-400">{segment.complaint_rate}%</p>
              </div>
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <p className="text-xs text-slate-400">Feature Requests</p>
                </div>
                <p className="text-xl font-bold text-indigo-400">{segment.feature_request_rate}%</p>
              </div>
            </div>

            {/* Top Topics */}
            {segment.top_topics.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-semibold text-slate-300 mb-2">Top Topics:</p>
                <div className="flex flex-wrap gap-2">
                  {segment.top_topics.map((topic, topicIdx) => (
                    <span 
                      key={topicIdx}
                      className="px-3 py-1 bg-indigo-500/10 text-indigo-300 rounded-full text-sm border border-indigo-500/20"
                    >
                      {formatTopic(topic)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View Details Button */}
            <button
              onClick={() => navigate(`/customers/${encodeURIComponent(segment.segment)}`)}
              className="flex items-center gap-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Details
            </button>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {segments.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center"
        >
          <Users className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No Customer Segments Yet</h3>
          <p className="text-slate-500">
            Upload feedback batches to start segmenting customers and analyzing their experiences.
          </p>
        </motion.div>
      )}
    </div>
  );
}

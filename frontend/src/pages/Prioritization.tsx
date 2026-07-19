import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ListOrdered, Filter, ChevronDown, ChevronUp, Info, ExternalLink, Plus, Upload } from 'lucide-react';
import { getOpportunities } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { SkeletonMetricCard, SkeletonList } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

interface Opportunity {
  topic: string;
  total_mentions: number;
  negative_count: number;
  neutral_count: number;
  positive_count: number;
  complaint_count: number;
  feature_request_count: number;
  average_severity: number;
  average_confidence: number;
  batch_count: number;
  priority_score: number;
  priority_level: string;
  explanation: string;
  feedback_item_ids: number[];
}

export default function Prioritization() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadOpportunities();
  }, [priorityFilter]);

  const loadOpportunities = async () => {
    setLoading(true);
    setError(false);
    try {
      const priorityParam = priorityFilter !== 'all' ? priorityFilter : undefined;
      const data = await getOpportunities(priorityParam);
      setOpportunities(data);
    } catch (err: any) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIds(newExpanded);
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

  // Calculate summary stats
  const totalOpportunities = opportunities.length;
  const highPriorityCount = opportunities.filter(o => o.priority_level === 'high').length;
  const mediumPriorityCount = opportunities.filter(o => o.priority_level === 'medium').length;
  const lowPriorityCount = opportunities.filter(o => o.priority_level === 'low').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="h-8 bg-slate-700/50 rounded w-80 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-700/50 rounded w-full max-w-2xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonMetricCard key={i} />
          ))}
        </div>
        <div className="glass-panel p-6 animate-pulse">
          <div className="h-20 bg-slate-700/30 rounded"></div>
        </div>
        <SkeletonList />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={loadOpportunities} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ListOrdered className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Opportunity Prioritization</h1>
        </div>
        <p className="text-muted-text">Rank product opportunities using feedback frequency, severity, sentiment impact, and confidence.</p>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Opportunities', value: totalOpportunities, color: 'text-indigo-400' },
          { label: 'High Priority', value: highPriorityCount, color: 'text-rose-400' },
          { label: 'Medium Priority', value: mediumPriorityCount, color: 'text-amber-400' },
          { label: 'Low Priority', value: lowPriorityCount, color: 'text-emerald-400' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-panel p-4"
          >
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Priority Filter */}
      <div className="glass-panel p-6">
        <div className="max-w-xs">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
            <Filter className="w-4 h-4" />
            Priority Level
          </label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass-panel p-4 bg-indigo-500/5 border-indigo-500/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-300">
            <span className="font-medium text-indigo-300">Decision-Support Signal:</span> Priority scores are derived from customer feedback patterns. Product context, business goals, and implementation effort should also inform final prioritization decisions.
          </p>
        </div>
      </div>

      {/* Empty State */}
      {opportunities.length === 0 ? (
        <EmptyState
          icon={<ListOrdered className="w-16 h-16" />}
          title={priorityFilter !== 'all' ? "No opportunities at this priority level" : "No product opportunities yet"}
          description={priorityFilter !== 'all' 
            ? "Try adjusting your priority filter to see more results."
            : "Upload and analyze feedback with extracted topics to generate product opportunities."}
          action={priorityFilter === 'all' ? {
            label: "Upload Feedback",
            onClick: () => navigate('/upload'),
            icon: <Upload className="w-4 h-4" />
          } : undefined}
        />
      ) : (
        /* Opportunity Cards */
        <div className="space-y-4">
          {opportunities.map((opportunity, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-6 hover:bg-dark-surface/90 transition-colors"
            >
              {/* Rank and Topic */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex-shrink-0">
                    <span className="text-lg font-bold text-indigo-400">#{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">{formatTopic(opportunity.topic)}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${getPriorityLevelColor(opportunity.priority_level)}`}>
                        {opportunity.priority_level}
                      </span>
                      <span className="text-slate-500 text-sm">•</span>
                      <span className="text-slate-400 text-sm">{opportunity.total_mentions} mentions</span>
                      <span className="text-slate-500 text-sm">•</span>
                      <span className="text-slate-400 text-sm">{opportunity.batch_count} {opportunity.batch_count === 1 ? 'batch' : 'batches'}</span>
                    </div>
                  </div>
                </div>
                
                {/* Priority Score */}
                <div className="flex flex-col items-end flex-shrink-0 ml-4">
                  <span className="text-sm text-slate-500 mb-1">Priority Score</span>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${getPriorityScoreColor(opportunity.priority_score)}`}>
                      {opportunity.priority_score.toFixed(2)}
                    </span>
                    <span className="text-lg text-slate-600">/10</span>
                  </div>
                </div>
              </div>

              {/* Why This Ranks Here */}
              <div className="mb-6 bg-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <h4 className="text-sm font-semibold text-indigo-300 mb-2 uppercase tracking-wider">Why this ranks here</h4>
                <p className="text-slate-300 leading-relaxed">{opportunity.explanation}</p>
              </div>

              {/* Supporting Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-dark-bg/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Negative Feedback</p>
                  <p className="text-xl font-bold text-white">{opportunity.negative_count}</p>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Average Severity</p>
                  <p className="text-xl font-bold text-white">{opportunity.average_severity.toFixed(1)} / 10</p>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Average Confidence</p>
                  <p className="text-xl font-bold text-white">{Math.round(opportunity.average_confidence * 100)}%</p>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">Batch Coverage</p>
                  <p className="text-xl font-bold text-white">{opportunity.batch_count} {opportunity.batch_count === 1 ? 'batch' : 'batches'}</p>
                </div>
              </div>

              {/* Feedback Composition */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-4">
                <span>Positive: {opportunity.positive_count}</span>
                <span className="text-slate-600">•</span>
                <span>Neutral: {opportunity.neutral_count}</span>
                <span className="text-slate-600">•</span>
                <span>Negative: {opportunity.negative_count}</span>
                <span className="text-slate-600">•</span>
                <span>Complaints: {opportunity.complaint_count}</span>
                <span className="text-slate-600">•</span>
                <span>Feature Requests: {opportunity.feature_request_count}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(`/opportunity/${encodeURIComponent(opportunity.topic)}`)}
                  className="flex items-center gap-2 text-sm text-white bg-indigo-500 hover:bg-indigo-600 px-4 py-2 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Details
                </button>
                
                <button
                  onClick={() => navigate('/roadmap', { state: { 
                    topic: opportunity.topic,
                    priority_score: opportunity.priority_score,
                    priority_level: opportunity.priority_level
                  }})}
                  className="flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 border border-emerald-500/20 hover:border-emerald-500/40 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add to Roadmap
                </button>
                
                <button
                  onClick={() => toggleExpanded(idx)}
                  className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  {expandedIds.has(idx) ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Hide Evidence
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      View Evidence
                    </>
                  )}
                </button>
              </div>

              {/* Evidence Section */}
              {expandedIds.has(idx) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-700/50"
                >
                  <h4 className="text-sm font-semibold text-slate-300 mb-3">Supporting Feedback IDs</h4>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.feedback_item_ids.map((id) => (
                      <span 
                        key={id}
                        className="px-3 py-1 bg-slate-800/50 text-slate-300 rounded-md text-sm font-mono border border-slate-700/50"
                      >
                        #{id}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-3 italic">
                    Note: Full feedback details can be viewed in the Feedback Inbox page.
                  </p>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

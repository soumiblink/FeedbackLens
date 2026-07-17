import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Filter, SortDesc, AlertCircle, Sparkles, Inbox, Bookmark } from 'lucide-react';
import { getFeedback, createSavedView } from '../services/api';

interface FeedbackItem {
  id: number;
  batch_id: number;
  original_text: string;
  sentiment: string | null;
  sentiment_confidence: number | null;
  topics: string[] | null;
  is_complaint: number;
  is_feature_request: number;
  priority_score: number;
}

type SortOption = 'newest' | 'priority';

export default function FeedbackInbox() {
  const [searchParams] = useSearchParams();
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Sorting
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  // Save view state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [viewName, setViewName] = useState('');
  const [saving, setSaving] = useState(false);

  // Apply filters from URL params on mount
  useEffect(() => {
    const sentiment = searchParams.get('sentiment');
    const type = searchParams.get('type');
    
    if (sentiment) {
      setSentimentFilter(sentiment);
    }
    if (type) {
      setTypeFilter(type);
    }
  }, [searchParams]);

  useEffect(() => {
    loadFeedback();
  }, [sentimentFilter, typeFilter]);

  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const sentimentParam = sentimentFilter !== 'all' ? sentimentFilter : undefined;
      const typeParam = typeFilter === 'complaint' ? 'complaint' : typeFilter === 'feature_request' ? 'feature_request' : undefined;
      
      const data = await getFeedback(sentimentParam, typeParam);
      setFeedback(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  // Frontend sorting
  const sortedFeedback = useMemo(() => {
    const items = [...feedback];
    if (sortBy === 'newest') {
      return items.sort((a, b) => b.id - a.id);
    } else {
      return items.sort((a, b) => b.priority_score - a.priority_score);
    }
  }, [feedback, sortBy]);

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

  const getPriorityColor = (score: number) => {
    if (score >= 7) return 'text-rose-400';
    if (score >= 4) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const hasActiveFilters = () => {
    return sentimentFilter !== 'all' || typeFilter !== 'all';
  };

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      alert('Please enter a name for this view');
      return;
    }

    setSaving(true);
    try {
      await createSavedView({
        name: viewName.trim(),
        sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined,
        feedback_type: typeFilter !== 'all' ? typeFilter : undefined
      });
      
      setShowSaveDialog(false);
      setViewName('');
      alert('View saved successfully!');
    } catch (err) {
      console.error('Failed to save view:', err);
      alert('Failed to save view');
    } finally {
      setSaving(false);
    }
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
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Feedback</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={loadFeedback}
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Inbox className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Feedback Inbox</h1>
          </div>
          {hasActiveFilters() && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Bookmark className="w-4 h-4" />
              Save Current Filters
            </button>
          )}
        </div>
        <p className="text-muted-text">View and filter individual feedback records across all batches.</p>
      </header>

      {/* Save View Dialog */}
      {showSaveDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSaveDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Save View</h2>
            <p className="text-slate-400 mb-4">Give this filter combination a name:</p>
            
            <input
              type="text"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              placeholder="e.g., High Priority Complaints"
              className="w-full px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors mb-4"
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveView();
                }
              }}
            />

            <div className="bg-dark-bg/50 p-4 rounded-lg mb-4">
              <p className="text-sm text-slate-400 mb-2">Active Filters:</p>
              <div className="space-y-1">
                {sentimentFilter !== 'all' && (
                  <p className="text-sm text-slate-300">• Sentiment: {sentimentFilter}</p>
                )}
                {typeFilter !== 'all' && (
                  <p className="text-sm text-slate-300">• Type: {typeFilter === 'complaint' ? 'Complaints' : 'Feature Requests'}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveView}
                disabled={saving || !viewName.trim()}
                className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save View'}
              </button>
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setViewName('');
                }}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Filters and Sorting */}
      <div className="glass-panel p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sentiment Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Filter className="w-4 h-4" />
              Sentiment
            </label>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Filter className="w-4 h-4" />
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="all">All Types</option>
              <option value="complaint">Complaints</option>
              <option value="feature_request">Feature Requests</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <SortDesc className="w-4 h-4" />
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="newest">Newest First</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Showing {sortedFeedback.length} {sortedFeedback.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Empty State */}
      {sortedFeedback.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center"
        >
          <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No Feedback Found</h3>
          <p className="text-slate-500">
            {sentimentFilter !== 'all' || typeFilter !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Upload feedback batches to see them here.'}
          </p>
        </motion.div>
      ) : (
        /* Feedback Items */
        <div className="space-y-4">
          {sortedFeedback.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-6 hover:bg-dark-surface/90 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  {/* Header with badges */}
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
                  </div>

                  {/* Feedback Text */}
                  <p className="text-slate-200 leading-relaxed mb-3">
                    {item.original_text}
                  </p>

                  {/* Topics */}
                  {item.topics && item.topics.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-500">Topics:</span>
                      {item.topics.map((topic, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 rounded text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority Score */}
                <div className="flex md:flex-col items-center md:items-end gap-2 md:gap-1">
                  <span className="text-xs text-slate-500">Priority</span>
                  <span className={`text-2xl font-bold ${getPriorityColor(item.priority_score)}`}>
                    {item.priority_score.toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-600">/10</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

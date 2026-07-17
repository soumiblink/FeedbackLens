import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, Plus, ExternalLink, Trash2, Calendar } from 'lucide-react';
import { getSavedViews, deleteSavedView } from '../services/api';

interface SavedView {
  id: number;
  name: string;
  sentiment: string | null;
  feedback_type: string | null;
  customer_segment: string | null;
  priority_level: string | null;
  created_at: string;
}

export default function SavedViews() {
  const navigate = useNavigate();
  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadViews();
  }, []);

  const loadViews = async () => {
    setLoading(true);
    try {
      const data = await getSavedViews();
      setViews(data);
    } catch (err) {
      console.error('Failed to load saved views:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this saved view?')) {
      return;
    }

    try {
      await deleteSavedView(id);
      setViews(views.filter(v => v.id !== id));
    } catch (err) {
      console.error('Failed to delete saved view:', err);
      alert('Failed to delete saved view');
    }
  };

  const handleOpenView = (view: SavedView) => {
    const params = new URLSearchParams();
    if (view.sentiment) params.append('sentiment', view.sentiment);
    if (view.feedback_type) params.append('type', view.feedback_type);
    if (view.customer_segment) params.append('segment', view.customer_segment);
    if (view.priority_level) params.append('priority', view.priority_level);
    
    navigate(`/feedback?${params.toString()}`);
  };

  const getSentimentBadge = (sentiment: string | null) => {
    if (!sentiment) return null;
    
    const colors: Record<string, string> = {
      positive: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      negative: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[sentiment] || colors.neutral}`}>
        {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (level: string | null) => {
    if (!level) return null;
    
    const colors: Record<string, string> = {
      high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border uppercase ${colors[level] || colors.low}`}>
        {level}
      </span>
    );
  };

  const getTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    const labels: Record<string, string> = {
      complaint: 'Complaints',
      feature_request: 'Feature Requests'
    };
    
    const colors: Record<string, string> = {
      complaint: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      feature_request: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[type]}`}>
        {labels[type] || type}
      </span>
    );
  };

  const getSegmentBadge = (segment: string | null) => {
    if (!segment) return null;
    
    const emojis: Record<string, string> = {
      Enterprise: '🏢',
      SMB: '🚀',
      Education: '🎓',
      Paid: '💎',
      'General Users': '👤'
    };
    
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
        {emojis[segment] || ''} {segment}
      </span>
    );
  };

  const getActiveFiltersCount = (view: SavedView): number => {
    let count = 0;
    if (view.sentiment) count++;
    if (view.feedback_type) count++;
    if (view.customer_segment) count++;
    if (view.priority_level) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Bookmark className="w-8 h-8 text-indigo-400" />
              <h1 className="text-4xl font-bold text-white">Saved Views</h1>
            </div>
            <p className="text-slate-400 text-lg">
              Quickly access frequently used product investigations.
            </p>
          </div>
          <button
            onClick={() => navigate('/feedback')}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Save Current Filters
          </button>
        </div>
      </div>

      {/* Views Grid */}
      {views.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No Saved Views Yet</h2>
            <p className="text-slate-400 mb-6">
              Save commonly used filter combinations to quickly revisit important customer feedback investigations.
            </p>
            <button
              onClick={() => navigate('/feedback')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Go to Feedback Inbox
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {views.map((view, idx) => (
            <motion.div
              key={view.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-panel p-6 hover:border-indigo-500/30 transition-all duration-200"
            >
              {/* View Name */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{view.name}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="w-4 h-4" />
                  <span>Created {new Date(view.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="space-y-3 mb-6">
                {view.sentiment && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Sentiment</p>
                    {getSentimentBadge(view.sentiment)}
                  </div>
                )}
                
                {view.feedback_type && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Type</p>
                    {getTypeBadge(view.feedback_type)}
                  </div>
                )}
                
                {view.customer_segment && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Segment</p>
                    {getSegmentBadge(view.customer_segment)}
                  </div>
                )}
                
                {view.priority_level && (
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Priority</p>
                    {getPriorityBadge(view.priority_level)}
                  </div>
                )}
                
                {getActiveFiltersCount(view) === 0 && (
                  <p className="text-sm text-slate-500 italic">No filters applied</p>
                )}
              </div>

              {/* Filter Count Badge */}
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {getActiveFiltersCount(view)} {getActiveFiltersCount(view) === 1 ? 'filter' : 'filters'} active
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenView(view)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open View
                </button>
                <button
                  onClick={() => handleDelete(view.id)}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition-colors"
                  title="Delete view"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

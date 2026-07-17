import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  History, Plus, Edit2, Trash2, Calendar, Tag, 
  TrendingUp, TrendingDown, AlertCircle, 
  ExternalLink, X, Package 
} from 'lucide-react';
import { 
  getChangelog, 
  createChangelogEntry, 
  updateChangelogEntry, 
  deleteChangelogEntry,
  getReleaseImpact,
  compareReleases
} from '../services/api';

interface ChangelogEntry {
  id: number;
  version: string;
  title: string;
  description: string | null;
  related_topics: string[] | null;
  release_batch_id: number | null;
  created_at: string;
}

interface ReleaseBatch {
  batch_id: number;
  filename: string;
  upload_time: string;
  total_feedback: number;
  positive: number;
  neutral: number;
  negative: number;
  complaints: number;
  feature_requests: number;
  top_topics: string[];
}

interface ReleaseMetrics {
  positive_change: number;
  negative_change: number;
  complaint_change: number;
  sentiment_delta: number;
  complaint_delta: number;
}

export default function ProductChangelog() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [batches, setBatches] = useState<ReleaseBatch[]>([]);
  const [metrics, setMetrics] = useState<Record<number, ReleaseMetrics>>({});
  const [loading, setLoading] = useState(true);
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntry | null>(null);
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    description: '',
    related_topics: '',
    release_batch_id: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [changelogData, batchData] = await Promise.all([
        getChangelog(),
        getReleaseImpact()
      ]);
      
      setEntries(changelogData);
      setBatches(batchData);
      
      await loadMetrics(changelogData, batchData);
    } catch (err) {
      console.error('Failed to load changelog:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async (changelogEntries: ChangelogEntry[], releaseBatches: ReleaseBatch[]) => {
    const metricsMap: Record<number, ReleaseMetrics> = {};
    
    for (const entry of changelogEntries) {
      if (!entry.release_batch_id) continue;
      
      const currentBatchIndex = releaseBatches.findIndex(b => b.batch_id === entry.release_batch_id);
      if (currentBatchIndex === -1) continue;
      
      const previousBatch = releaseBatches[currentBatchIndex + 1];
      if (!previousBatch) continue;
      
      try {
        const comparison = await compareReleases(previousBatch.batch_id, entry.release_batch_id);
        metricsMap[entry.id] = {
          positive_change: comparison.comparison.positive_change,
          negative_change: comparison.comparison.negative_change,
          complaint_change: comparison.comparison.complaint_change,
          sentiment_delta: comparison.comparison.sentiment_delta,
          complaint_delta: comparison.comparison.complaint_delta
        };
      } catch (err) {
        console.error(`Failed to load metrics for entry ${entry.id}:`, err);
      }
    }
    
    setMetrics(metricsMap);
  };

  const handleCreate = () => {
    setEditingEntry(null);
    setFormData({
      version: '',
      title: '',
      description: '',
      related_topics: '',
      release_batch_id: ''
    });
    setShowDialog(true);
  };

  const handleEdit = (entry: ChangelogEntry) => {
    setEditingEntry(entry);
    setFormData({
      version: entry.version,
      title: entry.title,
      description: entry.description || '',
      related_topics: entry.related_topics ? entry.related_topics.join(', ') : '',
      release_batch_id: entry.release_batch_id?.toString() || ''
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!formData.version.trim() || !formData.title.trim()) {
      alert('Version and title are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        version: formData.version.trim(),
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        related_topics: formData.related_topics.trim() 
          ? formData.related_topics.split(',').map(t => t.trim()).filter(t => t.length > 0)
          : undefined,
        release_batch_id: formData.release_batch_id ? parseInt(formData.release_batch_id) : undefined
      };

      if (editingEntry) {
        await updateChangelogEntry(editingEntry.id, payload);
      } else {
        await createChangelogEntry(payload);
      }

      setShowDialog(false);
      await loadData();
    } catch (err: any) {
      console.error('Failed to save changelog entry:', err);
      alert(err.response?.data?.detail || 'Failed to save changelog entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this changelog entry?')) {
      return;
    }

    try {
      await deleteChangelogEntry(id);
      await loadData();
    } catch (err) {
      console.error('Failed to delete changelog entry:', err);
      alert('Failed to delete changelog entry');
    }
  };

  const getBatchInfo = (batchId: number | null): ReleaseBatch | null => {
    if (!batchId) return null;
    return batches.find(b => b.batch_id === batchId) || null;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
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
              <History className="w-8 h-8 text-indigo-400" />
              <h1 className="text-4xl font-bold text-white">Product Changelog</h1>
            </div>
            <p className="text-slate-400 text-lg">
              Document product releases and track customer feedback trends.
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            New Release
          </button>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDialog(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingEntry ? 'Edit Release' : 'New Release'}
              </h2>
              <button
                onClick={() => setShowDialog(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Version */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Version <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  placeholder="e.g., v2.1.0"
                  className="w-full px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Release Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Enhanced Checkout Experience"
                  className="w-full px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what was released and why..."
                  rows={4}
                  className="w-full px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Related Topics */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Related Topics (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.related_topics}
                  onChange={(e) => setFormData({ ...formData, related_topics: e.target.value })}
                  placeholder="e.g., checkout, payment, shipping"
                  className="w-full px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Release Batch */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Release Batch (optional)
                </label>
                <select
                  value={formData.release_batch_id}
                  onChange={(e) => setFormData({ ...formData, release_batch_id: e.target.value })}
                  className="w-full px-4 py-3 bg-dark-bg border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">No batch selected</option>
                  {batches.map(batch => (
                    <option key={batch.batch_id} value={batch.batch_id}>
                      Batch #{batch.batch_id} - {batch.filename} ({formatDate(batch.upload_time)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Link to feedback batch for metrics calculation
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !formData.version.trim() || !formData.title.trim()}
                className="flex-1 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
              >
                {saving ? 'Saving...' : (editingEntry ? 'Update Release' : 'Create Release')}
              </button>
              <button
                onClick={() => setShowDialog(false)}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Timeline */}
      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center"
        >
          <div className="max-w-md mx-auto">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-3">No releases documented yet</h2>
            <p className="text-slate-400 mb-6">
              Start documenting your product releases to track customer feedback trends over time.
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Create First Release
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry, idx) => {
            const batchInfo = getBatchInfo(entry.release_batch_id);
            const entryMetrics = metrics[entry.id];

            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-6 hover:border-indigo-500/30 transition-all duration-200"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 rounded-full text-sm font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {entry.version}
                      </span>
                      <h3 className="text-2xl font-bold text-white">{entry.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {entry.description && (
                  <p className="text-slate-300 mb-4 leading-relaxed">
                    {entry.description}
                  </p>
                )}

                {/* Related Topics */}
                {entry.related_topics && entry.related_topics.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-500">Related Opportunities</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {entry.related_topics.map((topic, topicIdx) => (
                        <button
                          key={topicIdx}
                          onClick={() => navigate(`/opportunity/${encodeURIComponent(topic)}`)}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
                        >
                          {topic}
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metrics */}
                {batchInfo && entryMetrics && (
                  <div className="bg-dark-bg/50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Release Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Sentiment Change */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {entryMetrics.sentiment_delta > 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : entryMetrics.sentiment_delta < 0 ? (
                            <TrendingDown className="w-4 h-4 text-rose-400" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                          <span className="text-xs text-slate-500">Positive Sentiment</span>
                        </div>
                        <p className={`text-xl font-bold ${entryMetrics.sentiment_delta > 0 ? 'text-emerald-400' : entryMetrics.sentiment_delta < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {entryMetrics.sentiment_delta > 0 ? '+' : ''}{entryMetrics.sentiment_delta.toFixed(1)}%
                        </p>
                      </div>

                      {/* Complaint Change */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span className="text-xs text-slate-500">Complaints</span>
                        </div>
                        <p className={`text-xl font-bold ${entryMetrics.complaint_change < 0 ? 'text-emerald-400' : entryMetrics.complaint_change > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {entryMetrics.complaint_change > 0 ? '+' : ''}{entryMetrics.complaint_change}
                        </p>
                      </div>

                      {/* Negative Change */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingDown className="w-4 h-4 text-rose-400" />
                          <span className="text-xs text-slate-500">Negative</span>
                        </div>
                        <p className={`text-xl font-bold ${entryMetrics.negative_change < 0 ? 'text-emerald-400' : entryMetrics.negative_change > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {entryMetrics.negative_change > 0 ? '+' : ''}{entryMetrics.negative_change}
                        </p>
                      </div>

                      {/* Positive Change */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs text-slate-500">Positive</span>
                        </div>
                        <p className={`text-xl font-bold ${entryMetrics.positive_change > 0 ? 'text-emerald-400' : entryMetrics.positive_change < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                          {entryMetrics.positive_change > 0 ? '+' : ''}{entryMetrics.positive_change}
                        </p>
                      </div>
                    </div>

                    {/* Batch Info */}
                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <p className="text-xs text-slate-500">
                        Batch #{batchInfo.batch_id}: {batchInfo.filename} • {batchInfo.total_feedback} feedback items
                      </p>
                    </div>
                  </div>
                )}

                {/* No Batch Warning */}
                {!batchInfo && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                    <p className="text-sm text-amber-400">
                      No release batch linked. Edit this entry to link a batch for metrics calculation.
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

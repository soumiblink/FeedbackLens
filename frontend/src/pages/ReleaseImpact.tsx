import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, AlertCircle, TrendingUp, TrendingDown, Minus, Calendar, Package, Award } from 'lucide-react';
import { getReleaseImpact, compareReleases } from '../services/api';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

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

interface ReleaseComparison {
  positive_change: number;
  negative_change: number;
  neutral_change: number;
  complaint_change: number;
  feature_request_change: number;
  new_topics: string[];
  resolved_topics: string[];
  persistent_topics: string[];
  sentiment_delta: number;
  complaint_delta: number;
  feature_request_delta: number;
}

interface ComparisonResult {
  before_batch: ReleaseBatch;
  after_batch: ReleaseBatch;
  comparison: ReleaseComparison;
}

export default function ReleaseImpact() {
  const [batches, setBatches] = useState<ReleaseBatch[]>([]);
  const [beforeBatch, setBeforeBatch] = useState<number | null>(null);
  const [afterBatch, setAfterBatch] = useState<number | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getReleaseImpact();
      setBatches(data);
      
      // Auto-select last two batches if available
      if (data.length >= 2) {
        setBeforeBatch(data[data.length - 2].batch_id);
        setAfterBatch(data[data.length - 1].batch_id);
      }
    } catch (err: any) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (beforeBatch === null || afterBatch === null) {
      alert('Please select both releases to compare');
      return;
    }

    if (beforeBatch === afterBatch) {
      alert('Please select two different releases');
      return;
    }

    setComparing(true);
    try {
      const data = await compareReleases(beforeBatch, afterBatch);
      setComparison(data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to compare releases');
    } finally {
      setComparing(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTopic = (topic: string): string => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const calculateHealthScore = (comp: ReleaseComparison): number => {
    // Positive sentiment increase contributes +40 points max
    const positiveScore = Math.min(40, (comp.sentiment_delta > 0 ? comp.sentiment_delta : 0) * 40);
    
    // Complaint decrease contributes +30 points max
    const complaintScore = Math.min(30, (comp.complaint_delta < 0 ? Math.abs(comp.complaint_delta) : 0) * 30);
    
    // Negative sentiment decrease contributes +30 points max
    const negativeScore = Math.min(30, (comp.sentiment_delta > 0 ? comp.sentiment_delta : 0) * 30);
    
    return Math.round(positiveScore + complaintScore + negativeScore);
  };

  const getChangeIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-5 h-5 text-emerald-400" />;
    if (value < 0) return <TrendingDown className="w-5 h-5 text-rose-400" />;
    return <Minus className="w-5 h-5 text-slate-400" />;
  };

  const getChangeColor = (value: number, inverse: boolean = false) => {
    if (inverse) {
      if (value > 0) return 'text-rose-400';
      if (value < 0) return 'text-emerald-400';
      return 'text-slate-400';
    }
    if (value > 0) return 'text-emerald-400';
    if (value < 0) return 'text-rose-400';
    return 'text-slate-400';
  };

  const formatPercentage = (value: number): string => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${(value * 100).toFixed(1)}%`;
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-rose-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <div className="h-8 bg-slate-700/50 rounded w-80 mb-2 animate-pulse"></div>
          <div className="h-4 bg-slate-700/50 rounded w-full max-w-3xl animate-pulse"></div>
        </div>
        <div className="glass-panel p-6 animate-pulse">
          <div className="h-6 bg-slate-700/50 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-14 bg-slate-700/30 rounded"></div>
            <div className="h-14 bg-slate-700/30 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={loadBatches} />;
  }

  if (batches.length < 2) {
    return (
      <div className="space-y-6">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GitCompare className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-bold text-white">Release Impact Analysis</h1>
          </div>
          <p className="text-muted-text">Compare customer feedback before and after product releases to evaluate impact on product health.</p>
        </header>
        <EmptyState
          icon={<GitCompare className="w-16 h-16" />}
          title="Upload multiple releases to compare"
          description="Upload at least two feedback batches to compare release impact and track how your product changes affect customer sentiment."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <GitCompare className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Release Impact Analysis</h1>
        </div>
        <p className="text-muted-text">Compare customer feedback before and after product releases to evaluate impact on product health.</p>
      </header>

      {/* Release Selection */}
      <div className="glass-panel p-6">
        <h2 className="text-xl font-bold text-white mb-4">Select Releases to Compare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4" />
              Release Before
            </label>
            <select
              value={beforeBatch ?? ''}
              onChange={(e) => setBeforeBatch(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select a release...</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  Batch #{batch.batch_id} - {batch.filename} ({formatDate(batch.upload_time)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4" />
              Release After
            </label>
            <select
              value={afterBatch ?? ''}
              onChange={(e) => setAfterBatch(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select a release...</option>
              {batches.map((batch) => (
                <option key={batch.batch_id} value={batch.batch_id}>
                  Batch #{batch.batch_id} - {batch.filename} ({formatDate(batch.upload_time)})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={beforeBatch === null || afterBatch === null || comparing}
          className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
        >
          {comparing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompare className="w-5 h-5" />
              Compare Releases
            </>
          )}
        </button>

        {error && comparison && (
          <div className="mt-4 bg-rose-500/10 border border-rose-500/20 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-300">{error}</p>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Release Health Score */}
          <div className="glass-panel p-8 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Award className="w-8 h-8 text-indigo-400" />
              <h2 className="text-2xl font-bold text-white">Release Health Score</h2>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-slate-400 mb-2">Overall Improvement</p>
                <div className="flex items-baseline gap-2">
                  <span className={`text-6xl font-bold ${getHealthScoreColor(calculateHealthScore(comparison.comparison))}`}>
                    {calculateHealthScore(comparison.comparison)}
                  </span>
                  <span className="text-3xl text-slate-600">/100</span>
                </div>
              </div>
              <div className="flex-1 text-sm text-slate-300 space-y-1">
                <p>• Score based on sentiment improvements and complaint reduction</p>
                <p>• 70+ = Strong positive impact</p>
                <p>• 40-69 = Moderate improvement</p>
                <p>• Below 40 = Limited impact</p>
              </div>
            </div>
          </div>

          {/* Comparison Summary */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Comparison Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-bg/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Positive Sentiment</p>
                  {getChangeIcon(comparison.comparison.positive_change)}
                </div>
                <p className={`text-2xl font-bold ${getChangeColor(comparison.comparison.positive_change)}`}>
                  {comparison.comparison.positive_change > 0 ? '+' : ''}{comparison.comparison.positive_change}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {comparison.before_batch.positive} → {comparison.after_batch.positive}
                </p>
              </div>

              <div className="bg-dark-bg/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Negative Sentiment</p>
                  {getChangeIcon(-comparison.comparison.negative_change)}
                </div>
                <p className={`text-2xl font-bold ${getChangeColor(comparison.comparison.negative_change, true)}`}>
                  {comparison.comparison.negative_change > 0 ? '+' : ''}{comparison.comparison.negative_change}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {comparison.before_batch.negative} → {comparison.after_batch.negative}
                </p>
              </div>

              <div className="bg-dark-bg/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Complaint Volume</p>
                  {getChangeIcon(-comparison.comparison.complaint_change)}
                </div>
                <p className={`text-2xl font-bold ${getChangeColor(comparison.comparison.complaint_change, true)}`}>
                  {comparison.comparison.complaint_change > 0 ? '+' : ''}{comparison.comparison.complaint_change}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {comparison.before_batch.complaints} → {comparison.after_batch.complaints}
                </p>
              </div>

              <div className="bg-dark-bg/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-400">Feature Requests</p>
                  {getChangeIcon(comparison.comparison.feature_request_change)}
                </div>
                <p className={`text-2xl font-bold ${getChangeColor(comparison.comparison.feature_request_change)}`}>
                  {comparison.comparison.feature_request_change > 0 ? '+' : ''}{comparison.comparison.feature_request_change}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {comparison.before_batch.feature_requests} → {comparison.after_batch.feature_requests}
                </p>
              </div>
            </div>

            {/* Delta Percentages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-dark-bg/30 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Sentiment Delta</p>
                <p className={`text-xl font-bold ${getChangeColor(comparison.comparison.sentiment_delta)}`}>
                  {formatPercentage(comparison.comparison.sentiment_delta)}
                </p>
              </div>
              <div className="bg-dark-bg/30 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Complaint Delta</p>
                <p className={`text-xl font-bold ${getChangeColor(comparison.comparison.complaint_delta, true)}`}>
                  {formatPercentage(comparison.comparison.complaint_delta)}
                </p>
              </div>
              <div className="bg-dark-bg/30 p-4 rounded-lg border border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Feature Request Delta</p>
                <p className={`text-xl font-bold ${getChangeColor(comparison.comparison.feature_request_delta)}`}>
                  {formatPercentage(comparison.comparison.feature_request_delta)}
                </p>
              </div>
            </div>
          </div>

          {/* Topic Changes */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Topic Changes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* New Topics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <h3 className="font-semibold text-white">New Topics</h3>
                  <span className="text-sm text-slate-500">({comparison.comparison.new_topics.length})</span>
                </div>
                {comparison.comparison.new_topics.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.new_topics.map((topic, idx) => (
                      <div 
                        key={idx}
                        className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg text-emerald-300 text-sm"
                      >
                        {formatTopic(topic)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No new topics</p>
                )}
              </div>

              {/* Resolved Topics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <h3 className="font-semibold text-white">Resolved Topics</h3>
                  <span className="text-sm text-slate-500">({comparison.comparison.resolved_topics.length})</span>
                </div>
                {comparison.comparison.resolved_topics.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.resolved_topics.map((topic, idx) => (
                      <div 
                        key={idx}
                        className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-lg text-indigo-300 text-sm"
                      >
                        {formatTopic(topic)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No resolved topics</p>
                )}
              </div>

              {/* Persistent Topics */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <h3 className="font-semibold text-white">Persistent Topics</h3>
                  <span className="text-sm text-slate-500">({comparison.comparison.persistent_topics.length})</span>
                </div>
                {comparison.comparison.persistent_topics.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.comparison.persistent_topics.map((topic, idx) => (
                      <div 
                        key={idx}
                        className="bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg text-amber-300 text-sm"
                      >
                        {formatTopic(topic)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No persistent topics</p>
                )}
              </div>
            </div>
          </div>

          {/* Side-by-Side Timeline */}
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Release Timeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before Release */}
              <div className="bg-dark-bg/30 p-5 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-slate-400" />
                  <div>
                    <h3 className="font-bold text-white">Before Release</h3>
                    <p className="text-xs text-slate-500">{comparison.before_batch.filename}</p>
                    <p className="text-xs text-slate-500">{formatDate(comparison.before_batch.upload_time)}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Feedback:</span>
                    <span className="text-white font-medium">{comparison.before_batch.total_feedback}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Positive:</span>
                    <span className="text-white font-medium">{comparison.before_batch.positive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neutral:</span>
                    <span className="text-white font-medium">{comparison.before_batch.neutral}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400">Negative:</span>
                    <span className="text-white font-medium">{comparison.before_batch.negative}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400">Complaints:</span>
                    <span className="text-white font-medium">{comparison.before_batch.complaints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-400">Feature Requests:</span>
                    <span className="text-white font-medium">{comparison.before_batch.feature_requests}</span>
                  </div>
                </div>
                {comparison.before_batch.top_topics.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2">Top Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {comparison.before_batch.top_topics.slice(0, 5).map((topic, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                        >
                          {formatTopic(topic)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* After Release */}
              <div className="bg-dark-bg/30 p-5 rounded-lg border border-indigo-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Package className="w-6 h-6 text-indigo-400" />
                  <div>
                    <h3 className="font-bold text-white">After Release</h3>
                    <p className="text-xs text-slate-500">{comparison.after_batch.filename}</p>
                    <p className="text-xs text-slate-500">{formatDate(comparison.after_batch.upload_time)}</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Feedback:</span>
                    <span className="text-white font-medium">{comparison.after_batch.total_feedback}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-400">Positive:</span>
                    <span className="text-white font-medium">{comparison.after_batch.positive}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Neutral:</span>
                    <span className="text-white font-medium">{comparison.after_batch.neutral}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400">Negative:</span>
                    <span className="text-white font-medium">{comparison.after_batch.negative}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-rose-400">Complaints:</span>
                    <span className="text-white font-medium">{comparison.after_batch.complaints}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-400">Feature Requests:</span>
                    <span className="text-white font-medium">{comparison.after_batch.feature_requests}</span>
                  </div>
                </div>
                {comparison.after_batch.top_topics.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2">Top Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {comparison.after_batch.top_topics.slice(0, 5).map((topic, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                        >
                          {formatTopic(topic)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

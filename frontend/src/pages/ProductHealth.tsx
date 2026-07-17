import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, TrendingUp, TrendingDown, Minus, ThumbsUp, ThumbsDown, AlertTriangle, Sparkles } from 'lucide-react';
import { getProductHealth } from '../services/api';

interface ProductHealthData {
  overall_health_score: number;
  health_grade: string;
  positive_percent: number;
  negative_percent: number;
  complaint_rate: number;
  feature_request_rate: number;
  top_risk: string | null;
  top_opportunity: string | null;
  trend: string;
  batches_analyzed: number;
}

export default function ProductHealth() {
  const [healthData, setHealthData] = useState<ProductHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHealthData();
  }, []);

  const loadHealthData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductHealth();
      setHealthData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load product health data');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-cyan-400';
    if (score >= 70) return 'text-amber-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getHealthGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'B':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'C':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'D':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'F':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Improving':
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Declining':
        return <TrendingDown className="w-5 h-5 text-rose-400" />;
      case 'Stable':
        return <Minus className="w-5 h-5 text-slate-400" />;
      default:
        return <Minus className="w-5 h-5 text-slate-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Improving':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Declining':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'Stable':
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatTopic = (topic: string): string => {
    return topic
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const generateHealthExplanation = (data: ProductHealthData): string => {
    const score = data.overall_health_score;
    const negative = data.negative_percent;
    const complaints = data.complaint_rate;
    const positive = data.positive_percent;
    const trend = data.trend;

    let explanation = `Health score is ${score.toFixed(1)} `;

    // Explain negative impact
    if (negative > 15) {
      explanation += `because negative feedback represents ${negative.toFixed(1)}% of recent submissions `;
    } else if (negative > 5) {
      explanation += `with moderate negative feedback at ${negative.toFixed(1)}% `;
    } else {
      explanation += `with minimal negative feedback at ${negative.toFixed(1)}% `;
    }

    // Explain complaint volume
    if (complaints > 20) {
      explanation += `while complaint volume remains high at ${complaints.toFixed(1)}%. `;
    } else if (complaints > 10) {
      explanation += `while complaint volume remains moderate at ${complaints.toFixed(1)}%. `;
    } else {
      explanation += `and low complaint volume at ${complaints.toFixed(1)}%. `;
    }

    // Explain positive sentiment
    if (positive > 50) {
      explanation += `Positive sentiment is strong at ${positive.toFixed(1)}%. `;
    } else if (positive > 30) {
      explanation += `Positive sentiment is moderate at ${positive.toFixed(1)}%. `;
    } else if (positive > 0) {
      explanation += `Positive sentiment is low at ${positive.toFixed(1)}%. `;
    }

    // Explain trend
    if (trend === 'Improving') {
      explanation += 'Product health improved compared to the previous release.';
    } else if (trend === 'Declining') {
      explanation += 'Product health declined compared to the previous release.';
    } else {
      explanation += 'Product health remained stable compared to the previous release.';
    }

    return explanation;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !healthData) {
    return (
      <div className="flex h-full items-center justify-center pt-20">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-xl max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Health Data</h2>
          <p className="text-slate-300 mb-4">{error}</p>
          <button 
            onClick={loadHealthData}
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
          <Activity className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-bold text-white">Product Health Center</h1>
        </div>
        <p className="text-muted-text">Real-time overview of product health based on customer feedback analysis.</p>
      </header>

      {/* Main Health Score Section */}
      <div className="glass-panel p-8 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border-indigo-500/20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Health Score Circle */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {/* Circular Progress Background */}
              <svg className="w-48 h-48 transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-slate-700/30"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(healthData.overall_health_score / 100) * 552.92} 552.92`}
                  className={getHealthScoreColor(healthData.overall_health_score)}
                  strokeLinecap="round"
                />
              </svg>
              
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-bold ${getHealthScoreColor(healthData.overall_health_score)}`}>
                  {healthData.overall_health_score.toFixed(1)}
                </span>
                <span className="text-lg text-slate-400">/ 100</span>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-lg font-bold border ${getHealthGradeColor(healthData.health_grade)}`}>
                Grade {healthData.health_grade}
              </div>
            </div>
          </div>

          {/* Health Info */}
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Overall Product Health</h2>
              <p className="text-slate-300">
                Based on analysis of {healthData.batches_analyzed} feedback {healthData.batches_analyzed === 1 ? 'batch' : 'batches'}
              </p>
            </div>

            {/* Trend Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border ${getTrendColor(healthData.trend)}`}>
              {getTrendIcon(healthData.trend)}
              <span className="font-semibold">{healthData.trend}</span>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Positive Rate</p>
                <p className="text-xl font-bold text-emerald-400">{healthData.positive_percent.toFixed(1)}%</p>
              </div>
              <div className="bg-dark-bg/50 p-3 rounded-lg">
                <p className="text-xs text-slate-400 mb-1">Negative Rate</p>
                <p className="text-xl font-bold text-rose-400">{healthData.negative_percent.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400">Positive</p>
          </div>
          <p className="text-3xl font-bold text-emerald-400">{healthData.positive_percent.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">of feedback</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <ThumbsDown className="w-5 h-5 text-rose-400" />
            </div>
            <p className="text-sm text-slate-400">Negative</p>
          </div>
          <p className="text-3xl font-bold text-rose-400">{healthData.negative_percent.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">of feedback</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <p className="text-sm text-slate-400">Complaints</p>
          </div>
          <p className="text-3xl font-bold text-orange-400">{healthData.complaint_rate.toFixed(1)}%</p>
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
          <p className="text-3xl font-bold text-indigo-400">{healthData.feature_request_rate.toFixed(1)}%</p>
          <p className="text-xs text-slate-500 mt-1">of feedback</p>
        </motion.div>
      </div>

      {/* Risk and Opportunity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 bg-rose-500/5 border-rose-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Top Risk</h3>
              <p className="text-sm text-slate-400">Highest priority complaint</p>
            </div>
          </div>
          
          {healthData.top_risk ? (
            <div className="bg-dark-bg/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-rose-400">{formatTopic(healthData.top_risk)}</p>
              <p className="text-sm text-slate-400 mt-2">
                This topic has the highest complaint priority score
              </p>
            </div>
          ) : (
            <div className="bg-dark-bg/50 p-4 rounded-lg text-center">
              <p className="text-slate-500 italic">No complaints identified</p>
            </div>
          )}
        </motion.div>

        {/* Top Opportunity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-6 bg-indigo-500/5 border-indigo-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Top Opportunity</h3>
              <p className="text-sm text-slate-400">Highest priority feature request</p>
            </div>
          </div>
          
          {healthData.top_opportunity ? (
            <div className="bg-dark-bg/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-indigo-400">{formatTopic(healthData.top_opportunity)}</p>
              <p className="text-sm text-slate-400 mt-2">
                This topic has the highest feature request priority score
              </p>
            </div>
          ) : (
            <div className="bg-dark-bg/50 p-4 rounded-lg text-center">
              <p className="text-slate-500 italic">No feature requests identified</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Health Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">Health Explanation</h3>
        <div className="bg-dark-bg/30 p-5 rounded-lg border border-slate-700/50">
          <p className="text-slate-300 leading-relaxed">
            {generateHealthExplanation(healthData)}
          </p>
        </div>
        <div className="mt-4 text-xs text-slate-500 space-y-1">
          <p>• Health score calculation: Start at 100, subtract (negative% × 0.4), subtract (complaint% × 0.3), add (positive% × 0.2)</p>
          <p>• Trend determined by comparing sentiment and complaint rates with previous batch</p>
          <p>• All metrics calculated from real feedback data, no AI generation</p>
        </div>
      </motion.div>

      {/* Empty State for No Data */}
      {healthData.batches_analyzed === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-12 text-center"
        >
          <Activity className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-medium text-slate-300 mb-2">No Feedback Data Yet</h3>
          <p className="text-slate-500">
            Upload feedback batches to start tracking product health metrics.
          </p>
        </motion.div>
      )}
    </div>
  );
}

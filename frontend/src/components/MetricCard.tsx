import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  icon?: ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  delay?: number;
}

export default function MetricCard({ icon, label, value, change, trend, delay = 0 }: MetricCardProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-rose-400',
    neutral: 'text-slate-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="metric-card"
    >
      {icon && (
        <div className="w-5 h-5 text-indigo-400 mb-3">
          {icon}
        </div>
      )}
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {change && (
        <div className={`metric-change ${trend ? trendColors[trend] : ''}`}>
          {change}
        </div>
      )}
    </motion.div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-4"></div>
      <div className="h-8 bg-slate-700/50 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-slate-700/50 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonMetricCard() {
  return (
    <div className="glass-panel p-6 animate-pulse">
      <div className="h-4 bg-slate-700/50 rounded w-1/2 mb-3"></div>
      <div className="h-10 bg-slate-700/50 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-700/50 rounded w-1/3"></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="glass-panel overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-700">
        <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 border-b border-slate-700/30">
          <div className="flex items-center gap-4">
            <div className="h-4 bg-slate-700/50 rounded flex-1"></div>
            <div className="h-4 bg-slate-700/50 rounded w-24"></div>
            <div className="h-4 bg-slate-700/50 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonText() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-4 bg-slate-700/50 rounded w-full"></div>
      <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
      <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass-panel p-6 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 bg-slate-700/50 rounded-lg"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
              <div className="h-3 bg-slate-700/50 rounded w-full"></div>
              <div className="h-3 bg-slate-700/50 rounded w-4/5"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

import type { ReactNode } from 'react';

interface PageHeaderProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export default function PageHeader({ icon, title, description, action }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="glass-panel p-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 text-indigo-400">{icon}</div>
              <h1 className="text-4xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-slate-400 text-lg">{description}</p>
          </div>
          {action && <div className="ml-4">{action}</div>}
        </div>
      </div>
    </header>
  );
}

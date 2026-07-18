export default function LoadingSpinner({ size = 'default' }: { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    default: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin`}
      />
    </div>
  );
}

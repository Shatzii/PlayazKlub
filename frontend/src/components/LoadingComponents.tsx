interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'yellow', 
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    yellow: 'border-yellow-400',
    white: 'border-white',
    gray: 'border-gray-400'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
    />
  );
}

interface LoadingPageProps {
  title?: string;
  subtitle?: string;
}

export function LoadingPage({ 
  title = 'Loading...', 
  subtitle 
}: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {subtitle && (
          <p className="text-gray-300">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className = '' }: LoadingCardProps) {
  return (
    <div className={`bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg border border-yellow-500/20 animate-pulse ${className}`}>
      <div className="p-6">
        <div className="h-6 bg-yellow-500/20 rounded mb-3"></div>
        <div className="h-4 bg-yellow-500/20 rounded mb-2"></div>
        <div className="h-4 bg-yellow-500/20 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-yellow-500/20 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export function LoadingVideoPlayer() {
  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white text-lg">Loading stream...</p>
        <p className="text-gray-400 text-sm">Please wait while we connect you to the live event</p>
      </div>
    </div>
  );
}

interface LoadingButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function LoadingButton({ 
  children, 
  loading = false, 
  disabled = false, 
  onClick,
  className = ''
}: LoadingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`relative ${className} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  );
}
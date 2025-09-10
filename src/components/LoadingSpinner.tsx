interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ message = 'Loading...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div 
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-t-transparent`}
        style={{ 
          borderColor: '#4698cb',
          borderTopColor: 'transparent'
        }}
      />
      <p style={{ color: '#768692', fontSize: '0.875rem' }}>
        {message}
      </p>
    </div>
  );
}
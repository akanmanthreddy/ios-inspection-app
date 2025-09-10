import { Button } from './ui/button';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#d4183d', color: '#ffffff' }}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>
      <div className="text-center space-y-2">
        <h3 style={{ color: '#1b365d' }}>Something went wrong</h3>
        <p style={{ color: '#768692', fontSize: '0.875rem' }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <Button 
          onClick={onRetry}
          style={{ 
            backgroundColor: '#4698cb',
            borderColor: '#4698cb',
            color: '#ffffff'
          }}
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
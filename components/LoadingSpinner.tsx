import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-2">
        {/* Modern spinner */}
        <div className="relative">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-6 h-6 border-2 border-transparent border-r-blue-300 rounded-full animate-spin" 
               style={{ animationDirection: 'reverse', animationDuration: '0.75s' }}></div>
        </div>
        
        {/* Loading text with typing animation */}
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600 font-medium">Processing</span>
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

interface StartScreenProps {
  onStart: () => void;
  isInitializing: boolean;
  error: string | null;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, isInitializing, error }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="max-w-lg mx-auto px-6 py-12 text-center">
        
        {/* Logo & Branding */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-white font-bold text-3xl">S</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Meet Saddie
          </h1>
          
          <p className="text-lg text-gray-600 mb-2">
            Your AI Assistant at Sadie's Pizzeria DTLA
          </p>
          
          <p className="text-sm text-gray-500">
            🍕 Voice-powered ordering • 📱 Smart recommendations • ⚡ Instant service
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Voice & Text</h3>
            <p className="text-xs text-gray-500">Speak naturally or type your order</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Smart Menu</h3>
            <p className="text-xs text-gray-500">Personalized recommendations</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">Fast Pickup</h3>
            <p className="text-xs text-gray-500">Ready in 20-25 minutes</p>
          </div>
        </div>

        {/* Error Display with Setup Instructions */}
        {error && (
          <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">🔑 API Key Setup Required</p>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                
                {/* Setup Instructions */}
                <div className="bg-white p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-gray-800 mb-3">📋 Quick Setup Steps:</p>
                  <ol className="text-xs text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Create a <code className="bg-gray-100 px-1 rounded text-xs">.env</code> file in your project root</li>
                    <li>Get your API key from: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a></li>
                    <li>Add to .env file: <code className="bg-gray-100 px-1 rounded text-xs">VITE_GEMINI_API_KEY=your_api_key_here</code></li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={onStart}
          disabled={isInitializing}
          className={`
            w-full max-w-sm mx-auto px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ease-in-out
            ${isInitializing 
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95'
            }
            focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50
          `}
        >
          {isInitializing ? (
            <div className="flex items-center justify-center space-x-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting to Saddie...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Start Conversation with Saddie</span>
            </div>
          )}
        </button>

        {/* Privacy & Info */}
        <div className="mt-6 text-xs text-gray-500 space-y-2">
          <p>🔒 Your conversations are secure and private</p>
          <p>💡 Need help? Just ask "What can you help me with?"</p>
          <p className="border-t border-gray-200 pt-2 mt-4">
            <strong>Location:</strong> 922 S Olive St, Los Angeles, CA 90015
          </p>
        </div>
      </div>
    </div>
  );
}; 
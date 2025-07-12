import React, { useState, useRef, useEffect } from 'react';
import { CUSTOMER_CARE_NUMBER, ORDER_PHONE_NUMBER } from '../constants';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  isListening,
  placeholder = "Type your message or use voice..." 
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when not listening or loading
  useEffect(() => {
    if (!isListening && !isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isListening, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    
    if (trimmedMessage && !isLoading) {
      onSendMessage(trimmedMessage);
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Allow typing even when listening or loading for better UX
  const isDisabled = false; // Enable typing always for dual input mode

  return (
    <div className="border-t border-gray-200 bg-white">
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-end space-x-3">
          
          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isListening ? "🎤 Listening..." : isLoading ? "Saddie is typing..." : placeholder}
              disabled={isDisabled}
              className={`
                w-full px-4 py-3 pr-12 border rounded-xl resize-none
                ${isDisabled 
                  ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }
                transition-all duration-200 ease-in-out
                placeholder-gray-400 text-sm
              `}
              maxLength={500}
            />
            
            {/* Character Counter */}
            {message.length > 400 && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                {500 - message.length}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isDisabled}
            className={`
              flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ease-in-out
              ${(!message.trim() || isDisabled)
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95'
              }
            `}
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>

        {/* Input Mode Indicator */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {isListening ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Voice input active</span>
              </>
            ) : isLoading ? (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Saddie is responding...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
                </svg>
                <span>Type message or use voice above</span>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setMessage("I want to order a pizza")}
              disabled={isDisabled}
              className="text-xs text-blue-500 hover:text-blue-600 disabled:text-gray-400 transition-colors"
            >
              Quick order
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={() => setMessage("Show me your menu")}
              disabled={isDisabled}
              className="text-xs text-blue-500 hover:text-blue-600 disabled:text-gray-400 transition-colors"
            >
              View menu
            </button>
            <span className="text-gray-300">|</span>
            <a
              href={`tel:${ORDER_PHONE_NUMBER}`}
              className="text-xs text-green-500 hover:text-green-600 transition-colors flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Order Now
            </a>
            <span className="text-gray-300">|</span>
            <a
              href={`tel:${CUSTOMER_CARE_NUMBER}`}
              className="text-xs text-red-500 hover:text-red-600 transition-colors flex items-center"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Support
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}; 
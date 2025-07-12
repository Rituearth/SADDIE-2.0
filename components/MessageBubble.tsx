import React from 'react';
import { ChatMessage } from '../types';
import { CUSTOMER_CARE_NUMBER, ORDER_PHONE_NUMBER } from '../constants';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  // Function to render message content with interactive buttons
  const renderMessageContent = (text: string): React.ReactNode => {
    let processedText = text;
    let elements: React.ReactNode[] = [];
    
    // Check if message contains contact button placeholder
    if (processedText.includes('[CONTACT_BUTTONS]')) {
      const parts = processedText.split('[CONTACT_BUTTONS]');
      elements.push(parts[0]);
      elements.push(
        <div key="contact-button" className="mt-3 mb-1">
          <a
            href={`tel:${CUSTOMER_CARE_NUMBER}`}
            className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Customer Support
          </a>
        </div>
      );
      elements.push(parts[1]);
      processedText = '';
    }
    
    // Check if message contains order button placeholder
    if (text.includes('[ORDER_BUTTONS]')) {
      const parts = text.split('[ORDER_BUTTONS]');
      if (processedText) {
        elements = []; // Reset if we have both buttons
        elements.push(parts[0]);
      }
      elements.push(
        <div key="order-button" className="mt-3 mb-1">
          <a
            href={`tel:${ORDER_PHONE_NUMBER}`}
            className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Order Now
          </a>
        </div>
      );
      elements.push(parts[1]);
      processedText = '';
    }
    
    // Return elements if we have buttons, otherwise return regular text
    return elements.length > 0 ? <>{elements}</> : processedText;
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 px-4`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
            : 'bg-gradient-to-r from-red-500 to-orange-500'
        }`}>
          {isUser ? (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          ) : (
            <span className="text-white font-bold text-xs">S</span>
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          
          {/* Message Header */}
          <div className="flex items-center space-x-2 mb-1">
            <span className={`text-xs font-medium ${
              isUser ? 'text-blue-600' : 'text-red-600'
            }`}>
              {isUser ? 'You' : 'Saddie'}
            </span>
            <span className="text-xs text-gray-400">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Message Bubble */}
          <div className={`relative px-4 py-3 rounded-2xl max-w-full ${
            isUser 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
              : 'bg-gray-50 text-gray-800 border border-gray-200 shadow-sm'
          }`}>
            
            {/* Message Text */}
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {renderMessageContent(message.text)}
            </div>

            {/* Message Tail */}
            <div className={`absolute top-3 ${
              isUser 
                ? 'right-[-6px] border-l-8 border-l-blue-500 border-t-4 border-t-transparent border-b-4 border-b-transparent' 
                : 'left-[-6px] border-r-8 border-r-gray-50 border-t-4 border-t-transparent border-b-4 border-b-transparent'
            } w-0 h-0`} />
          </div>

          {/* Typing Indicator for AI */}
          {!isUser && message.text === '' && (
            <div className="flex items-center space-x-1 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
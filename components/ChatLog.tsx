import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatLogProps {
  messages: ChatMessage[];
}

export const ChatLog: React.FC<ChatLogProps> = ({ messages }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intelligent scroll function - only auto-scroll if user is near bottom
  const handleScroll = () => {
    if (!containerRef.current) return;
    
    const { offsetHeight, scrollHeight, scrollTop } = containerRef.current;
    // Only auto-scroll if user is within 100px of bottom (prevents interrupting reading)
    if (scrollHeight <= scrollTop + offsetHeight + 100) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  // Auto-scroll to bottom when new messages arrive (intelligently)
  useEffect(() => {
    handleScroll();
  }, [messages]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto bg-white h-full max-h-full"
      style={{ scrollbarWidth: 'thin', scrollBehavior: 'smooth' }}
    >
      <div className="min-h-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No messages yet. Start a conversation!</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={endOfMessagesRef} className="h-1" />
      </div>
    </div>
  );
};

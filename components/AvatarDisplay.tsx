import React from 'react';

interface AvatarDisplayProps {
  avatarUrl: string;
  isListening: boolean;
  voiceActivity: number; // A value from 0 to 100 representing microphone activity
  isSpeaking?: boolean; // When Saddie is speaking
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarUrl, isListening, voiceActivity, isSpeaking = false }) => {
  const activityScaled = Math.min(100, voiceActivity) / 100; // Normalize to 0-1
  const shadowIntensity = Math.min(15, 3 + activityScaled * 20); // Dynamic shadow based on voice activity
  const shadowColor = isListening ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.3)'; // Green when listening, Red otherwise (or more neutral)

  return (
    <div className="relative">
      <div 
        className={`
          w-10 h-10 rounded-full overflow-hidden border-2 transition-all duration-300 ease-in-out
          ${isListening ? 'border-green-400' : 'border-red-400'}
        `}
        style={{ 
          boxShadow: isListening 
            ? `0 0 ${shadowIntensity}px ${shadowColor}` 
            : '0 2px 4px rgba(0,0,0,0.1)' 
        }}
      >
        <img 
          src={avatarUrl} 
          alt="Saddie AI Assistant" 
          className="w-full h-full object-cover" 
        />
        
        {/* Voice Activity Overlay - User Speaking */}
        {isListening && (
          <div 
            className="absolute inset-0 rounded-full bg-green-400 animate-pulse"
            style={{ 
              opacity: 0.2 + (activityScaled * 0.3),
              animationDuration: `${2 - activityScaled * 1.2}s` 
            }}
          />
        )}
        
        {/* Agent Speaking Animation */}
        {isSpeaking && (
          <div 
            className="absolute inset-0 rounded-full bg-blue-400 animate-pulse"
            style={{ 
              opacity: 0.3,
              animationDuration: '1.5s' 
            }}
          />
        )}
      </div>
      
      {/* Status Indicator */}
      <div className={`
        absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white transition-all duration-300
        ${isListening ? 'bg-green-500' : isSpeaking ? 'bg-blue-500' : 'bg-gray-400'}
        ${isListening || isSpeaking ? 'animate-pulse' : ''}
      `} />
    </div>
  );
};
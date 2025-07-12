import React from 'react';

interface VoiceControlProps {
  isListening: boolean;
  isLoading: boolean;
  onToggleListening: () => void;
  canInterruptSaddie: boolean;
  onStopSaddie: () => void;
  isWakeWordListening?: boolean;
}

export const VoiceControl: React.FC<VoiceControlProps> = ({
  isListening,
  isLoading,
  onToggleListening,
  canInterruptSaddie,
  onStopSaddie,
  isWakeWordListening = false,
}) => {
  const getMicButtonState = () => {
    // Agent is speaking - show dull/muted microphone
    if (isLoading && !isListening) {
      return {
        text: "🤖 Saddie is speaking...",
        bgColor: "bg-gray-400",
        hoverColor: "hover:bg-gray-500",
        icon: "microphone",
        disabled: false, // Allow interruption
        ariaLabel: "Saddie is speaking - you can interrupt anytime",
        showLoadingSpinner: false,
        isDull: true
      };
    }
    
    // User is actively speaking - bright green microphone
    if (isListening) {
      return {
        text: "🎙️ Listening... (Speak naturally)",
        bgColor: "bg-gradient-to-r from-green-500 to-green-600",
        hoverColor: "hover:from-green-600 hover:to-green-700",
        icon: "listening",
        disabled: false,
        ariaLabel: "Currently listening to you",
        showLoadingSpinner: false,
        isDull: false
      };
    }
    
    // Ready state - normal microphone
    return {
      text: "🎙️ Tap to speak with Saddie",
      bgColor: "bg-gradient-to-r from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      icon: "microphone",
      disabled: false,
      ariaLabel: "Start voice input",
      showLoadingSpinner: false,
      isDull: false
    };
  };

  const buttonState = getMicButtonState();

  return (
    <div className="flex flex-col items-center space-y-3">
      
      {/* Main Voice Button - Modern Design with Intelligent Turn-Taking */}
      <div className="flex flex-col items-center space-y-3">
        <button
          onClick={onToggleListening}
          disabled={buttonState.disabled}
          className={`
            relative w-16 h-16 rounded-full text-white shadow-lg transform transition-all duration-300 ease-in-out
            flex items-center justify-center
            ${buttonState.bgColor} ${buttonState.hoverColor}
            ${buttonState.disabled ? 'cursor-not-allowed opacity-75' : 'hover:scale-110 active:scale-95 hover:shadow-xl'}
            focus:outline-none focus:ring-4 focus:ring-opacity-30 
            ${isListening 
              ? 'focus:ring-red-400 ring-4 ring-red-200 animate-pulse' 
              : isLoading 
                ? 'focus:ring-blue-400' 
                : 'focus:ring-green-400'
            }
          `}
          aria-label={buttonState.ariaLabel}
        >
          {/* Listening Animation Ring */}
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-400 opacity-20 animate-ping"></div>
          )}
          
          {/* Enhanced Microphone Icons with Perfect Centering */}
          <div className="flex items-center justify-center w-full h-full">
            {buttonState.icon === 'microphone' && (
              <svg 
                className={`w-7 h-7 ${buttonState.isDull ? 'opacity-60' : 'opacity-100'} transition-opacity duration-300`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
            
            {buttonState.icon === 'listening' && (
              <div className="flex items-center justify-center">
                {/* Voice Activity Animation - Perfectly Centered */}
                <div className="flex items-end space-x-0.5 h-6">
                  <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '8px', animationDelay: '0ms', animationDuration: '400ms' }}></div>
                  <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '16px', animationDelay: '100ms', animationDuration: '400ms' }}></div>
                  <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '24px', animationDelay: '200ms', animationDuration: '400ms' }}></div>
                  <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '20px', animationDelay: '300ms', animationDuration: '400ms' }}></div>
                  <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '12px', animationDelay: '400ms', animationDuration: '400ms' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Loading Spinner Overlay */}
          {buttonState.showLoadingSpinner && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </button>

        {/* Status Text */}
        <p className="text-sm font-medium text-gray-700 text-center min-h-[20px] max-w-[250px] px-2">
          {buttonState.text}
        </p>
      </div>


      
      {/* Manual Interruption Info */}
      {canInterruptSaddie && !isListening && !isWakeWordListening && (
        <div className="text-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 font-medium">
            🎯 Manual Mode Active
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Click the microphone to start speaking
          </p>
        </div>
      )}
      
    </div>
  );
};

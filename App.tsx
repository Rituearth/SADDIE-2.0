import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SADDIE_AVATAR_URL, getSaddiePersonaPrompt, MENU_ITEMS, WAKE_WORD_CONFIG } from './constants';
import { ChatMessage, OrderItem, GeminiOrderUpdatePayload, UserInfo } from './types';
import { AvatarDisplay } from './components/AvatarDisplay';
import { ChatLog } from './components/ChatLog';
import { OrderPanel } from './components/OrderPanel';
import { VoiceControl } from './components/VoiceControl';
import { LoadingSpinner } from './components/LoadingSpinner';
import { StartScreen } from './components/StartScreen';
import { ChatInput } from './components/ChatInput';

interface QueuedSpeechItem {
  utterance: SpeechSynthesisUtterance;
  isInitialGreeting: boolean;
}

// Sample prompts for better UX (solving blank canvas problem)
const SAMPLE_PROMPTS = [
  "My name is John Smith",
  "John, phone number 555-123-4567",
  "I'm Sarah and my number is 555-987-6543",
  "Mike Johnson, 555-555-1234",
  "Anna Davis, contact 555-777-8888"
];

// Wake word detection configuration
const {
  WAKE_WORDS,
  STOP_COMMANDS,
  WAKE_WORD_CONFIDENCE,
  WAKE_WORD_TIMEOUT,
  LISTENING_TIMEOUT,
  CONTINUOUS_LISTENING,
  INTERRUPT_AGENT,
  AUDIO_CONSTRAINTS,
  PROCESS_INTERIM_RESULTS,
  RESTART_ON_END,
  RESTART_DELAY,
  DEBUG_MODE
} = WAKE_WORD_CONFIG;

const App: React.FC = () => {
  console.log("🚀 App component rendering...");
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isWakeWordListening, setIsWakeWordListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSamplePrompts, setShowSamplePrompts] = useState<boolean>(true);
  const [userInfo, setUserInfo] = useState<UserInfo>({ hasProvidedDetails: false });
  const [isAgentStarted, setIsAgentStarted] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  
  const geminiChat = useRef<Chat | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const wakeWordRecognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [voiceActivity, setVoiceActivity] = useState<number>(0);
  
  const initialMessageSentRef = useRef(false); 
  const initialGreetingSpeechTurnCompletedRef = useRef(false); 
  const interruptionFlagRef = useRef<boolean>(false);
  const userSpeechDetectedRef = useRef<boolean>(false);

  const speechQueueRef = useRef<QueuedSpeechItem[]>([]);
  const isSpeakingRef = useRef<boolean>(false);
  const currentSaddieMessageIdRef = useRef<string | null>(null);
  const fullResponseTextRef = useRef<string>("");
  const jsonBlockStartedInStreamRef = useRef<boolean>(false);

  const conversationConcludedRef = useRef<boolean>(false);
  const autoRelistenDisabledForThisTurnRef = useRef<boolean>(false);
  const isCannedResponseRef = useRef<boolean>(false);

  const toggleListeningCallbackRef = useRef<((forceListen?: boolean) => void) | null>(null);
  
  // Wake word detection timeout refs
  const wakeWordTimeoutRef = useRef<number | null>(null);
  const listeningTimeoutRef = useRef<number | null>(null);

  // Wake Word Detection System
  const startWakeWordListening = useCallback(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      if (DEBUG_MODE) console.log("❌ Speech recognition not supported for wake word detection");
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.abort();
    }

    wakeWordRecognitionRef.current = new SpeechRecognitionAPI();
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.continuous = true;
      wakeWordRecognitionRef.current.interimResults = PROCESS_INTERIM_RESULTS;
      wakeWordRecognitionRef.current.lang = 'en-US';

      // Wake word detected
      wakeWordRecognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.results.length - 1];
        if (result && result[0]) {
          const confidence = result[0].confidence || 0.8;
          const transcript = result[0].transcript.toLowerCase().trim();
          
          if (DEBUG_MODE) {
            console.log(`🎯 Wake word analysis: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
          }
          
          // Enhanced wake word detection - EXACT phrase matching only
          const detectedWakeWord = WAKE_WORDS.find(wakeWord => {
            const normalizedWakeWord = wakeWord.toLowerCase().trim();
            const normalizedTranscript = transcript.trim();
            
            // Check for exact match or wake word at the beginning/end of transcript
            return (
              normalizedTranscript === normalizedWakeWord ||
              normalizedTranscript.startsWith(normalizedWakeWord + " ") ||
              normalizedTranscript.endsWith(" " + normalizedWakeWord) ||
              (normalizedTranscript.includes(" " + normalizedWakeWord + " "))
            );
          });
          
          // Check for stop commands
          const detectedStopCommand = STOP_COMMANDS.find(stopCommand => 
            transcript.includes(stopCommand.toLowerCase())
          );
          
          if (detectedStopCommand && (isSpeakingRef.current || isLoading)) {
            if (DEBUG_MODE) console.log(`🛑 Stop command detected: "${detectedStopCommand}"`);
            
            // Stop agent immediately
            window.speechSynthesis.cancel();
            speechQueueRef.current = [];
            isSpeakingRef.current = false;
            setIsLoading(false);
            
            return;
          }
          
          if (detectedWakeWord && confidence >= WAKE_WORD_CONFIDENCE) {
            // Additional validation to prevent false positives
            const transcriptLength = transcript.split(' ').length;
            const wakeWordLength = detectedWakeWord.split(' ').length;
            
            // Only trigger if transcript is not too long (prevents accidental triggers in long speech)
            if (transcriptLength <= wakeWordLength + 2) { // Allow 2 extra words for flexibility
              if (DEBUG_MODE) {
                console.log(`🎙️ WAKE WORD DETECTED: "${detectedWakeWord}" - Starting listening mode`);
              }
              
              // If agent is speaking, interrupt it
              if (INTERRUPT_AGENT && (isSpeakingRef.current || speechQueueRef.current.length > 0 || isLoading)) {
                if (DEBUG_MODE) console.log("⚡ INTERRUPTING AGENT for wake word");
                
                // Stop agent immediately
                window.speechSynthesis.cancel();
                speechQueueRef.current = [];
                isSpeakingRef.current = false;
                setIsLoading(false);
              }
            } else {
              if (DEBUG_MODE) {
                console.log(`🚫 Wake word "${detectedWakeWord}" detected but transcript too long: "${transcript}"`);
              }
            }
            
            // Stop wake word listening temporarily
            setIsWakeWordListening(false);
            if (wakeWordRecognitionRef.current) {
              wakeWordRecognitionRef.current.abort();
            }
            
            // Start normal listening for user input
            if (toggleListeningCallbackRef.current) {
              toggleListeningCallbackRef.current(true);
            }
            
            // Set timeout to restart wake word listening after user input
            if (listeningTimeoutRef.current) {
              clearTimeout(listeningTimeoutRef.current);
            }
            
            listeningTimeoutRef.current = window.setTimeout(() => {
              if (!isListening && CONTINUOUS_LISTENING) {
                startWakeWordListening();
              }
            }, LISTENING_TIMEOUT);
          }
        }
      };

      wakeWordRecognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          if (DEBUG_MODE) console.error("Wake word recognition error:", event.error);
        }
      };

      wakeWordRecognitionRef.current.onend = () => {
        if (DEBUG_MODE) console.log("🔄 Wake word recognition ended, restarting...");
        
        // Restart wake word listening if enabled
        if (RESTART_ON_END && CONTINUOUS_LISTENING && isWakeWordListening && !isListening) {
          setTimeout(() => {
            if (wakeWordRecognitionRef.current && isWakeWordListening && !isListening) {
              try {
                wakeWordRecognitionRef.current.start();
              } catch (e) {
                if (DEBUG_MODE) console.log("Failed to restart wake word recognition:", e);
              }
            }
          }, RESTART_DELAY);
        }
      };

      try {
        wakeWordRecognitionRef.current.start();
        setIsWakeWordListening(true);
        if (DEBUG_MODE) console.log("🎯 Wake word detection started");
      } catch (e) {
        console.error("Failed to start wake word recognition:", e);
      }
    }
  }, [isLoading, isListening]);

  const stopWakeWordListening = useCallback(() => {
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.abort();
      setIsWakeWordListening(false);
      if (DEBUG_MODE) console.log("🔇 Wake word detection stopped");
    }
    
    // Clear timeouts
    if (wakeWordTimeoutRef.current) {
      clearTimeout(wakeWordTimeoutRef.current);
      wakeWordTimeoutRef.current = null;
    }
    
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
  }, []);

  const initializeAIService = useCallback(() => {
    try {
      // Check for environment variable (Vite loads VITE_ prefixed variables)
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      console.log("🔑 Checking API Key...", apiKey ? "Found" : "Missing");
      
      if (!apiKey || apiKey === "your_api_key_here" || apiKey === undefined) {
        const apiKeyError = "Please set your Gemini API key in the .env file. Create a .env file with: VITE_GEMINI_API_KEY=your_actual_api_key";
        console.error("❌ API Key Error:", apiKeyError);
        setError(apiKeyError); 
        setIsInitializing(false);
        return;
      }
      
      // Validate API key format (basic check)
      if (!apiKey.startsWith('AIza')) {
        const formatError = "Invalid API key format. Gemini API keys should start with 'AIza'. Please check your .env file.";
        console.error("❌ API Key Format Error:", formatError);
        setError(formatError);
        setIsInitializing(false);
        return;
      }
      
      console.log("✅ API Key validated, initializing Gemini...");
      
      const ai = new GoogleGenAI({ apiKey: apiKey }); 
      const chatInstance = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
          systemInstruction: getSaddiePersonaPrompt(),
        },
      });
      geminiChat.current = chatInstance;
      setIsInitializing(false);
      console.log("🚀 Gemini AI initialized successfully!");
    } catch (err) {
      console.error("❌ Failed to initialize AI Service:", err);
      const message = (err instanceof Error) ? err.message : "Failed to initialize AI. Check API key and console.";
      setError("AI Initialization Error: " + message);
      setIsInitializing(false);
    }
  }, []);

  const processFinalApiResponse = useCallback((fullText: string) => {
    if (!fullText.trim()) {
        console.log("processFinalApiResponse called with empty fullText, skipping.");
        return;
    }
    let orderUpdatePayload: GeminiOrderUpdatePayload | null = null;
    const jsonFenceRegex = /```json\s*\n?(.*?)\n?\s*```/s;
    const match = fullText.match(jsonFenceRegex);

    if (match && match[1]) {
      const jsonStr = match[1].trim();
      try {
        orderUpdatePayload = JSON.parse(jsonStr) as GeminiOrderUpdatePayload;
      } catch (e) {
        console.error("Failed to parse JSON from Saddie's full response:", jsonStr, e);
        setError("Saddie provided an invalid order update. Please check console.");
      }
    } else {
        console.warn("No JSON block found in Saddie's full response for processing:", fullText.slice(-300));
    }

    if (orderUpdatePayload?.currentOrderItems) {
      const validatedOrderItems: OrderItem[] = orderUpdatePayload.currentOrderItems
        .map(payloadItem => {
          if (typeof payloadItem.name !== 'string') return null;
          const cleanedName = payloadItem.name.replace(/\*/g, '').trim();
          if (!cleanedName) return null;
          // Try to find price from menu first for known items, otherwise use payload price if valid.
          const menuItem = MENU_ITEMS.find(m => m.name.toLowerCase() === cleanedName.toLowerCase());
          let price = menuItem ? menuItem.price : (typeof payloadItem.price === 'number' ? payloadItem.price : 0);
          const quantity = typeof payloadItem.quantity === 'number' && payloadItem.quantity > 0 ? payloadItem.quantity : 1;
          
          // Heuristic for custom pizzas if not found directly by name (which it should be if AI follows prompt)
          if (!menuItem && cleanedName.toLowerCase().startsWith("custom pizza") && price === 0 && payloadItem.price > 0) {
            price = payloadItem.price;
          }

          return { name: cleanedName, quantity, price };
        })
        .filter(item => item !== null && item.price > 0) as OrderItem[]; // Also filter out items with 0 price if not intended
      setCurrentOrder(validatedOrderItems);
    } else if (orderUpdatePayload?.action === 'clear_order') {
      setCurrentOrder([]);
    }

    // Handle user information updates
    if (orderUpdatePayload?.userInfo) {
      setUserInfo(prev => ({
        ...prev,
        name: orderUpdatePayload.userInfo?.name || prev.name,
        phone: orderUpdatePayload.userInfo?.phone || prev.phone,
        hasProvidedDetails: orderUpdatePayload.userInfo?.hasProvidedDetails || prev.hasProvidedDetails
      }));
    }

    if (orderUpdatePayload?.conversationState === "concluded") {
      conversationConcludedRef.current = true;
      console.log("Conversation marked as concluded by AI.");
    }
  }, [setError]);

  const processSpeechQueue = useCallback(() => {
    if (isSpeakingRef.current || speechQueueRef.current.length === 0) {
      if (!isSpeakingRef.current && speechQueueRef.current.length === 0) { 
        setIsLoading(false); 
        
        if (!interruptionFlagRef.current && !isCannedResponseRef.current) { 
            processFinalApiResponse(fullResponseTextRef.current);
        } else if (interruptionFlagRef.current) {
            console.log("processSpeechQueue: Skipped processFinalApiResponse due to interruption flag.");
        }
        isCannedResponseRef.current = false; 

        if (initialMessageSentRef.current && !initialGreetingSpeechTurnCompletedRef.current) {
            initialGreetingSpeechTurnCompletedRef.current = true;
        } else if (!conversationConcludedRef.current && !autoRelistenDisabledForThisTurnRef.current && !error) {
          if (toggleListeningCallbackRef.current) {
            toggleListeningCallbackRef.current(true); 
          }
        }
        autoRelistenDisabledForThisTurnRef.current = false; 
      }
      return;
    }
    isSpeakingRef.current = true;
    const queuedItem = speechQueueRef.current.shift();

    if (queuedItem) {
      const { utterance, isInitialGreeting: itemIsInitialGreeting } = queuedItem;
      utterance.onend = (event: SpeechSynthesisEvent) => {
        isSpeakingRef.current = false;
        // Stop background listening when agent finishes speaking
        stopWakeWordListening();
        processSpeechQueue(); 
      };
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
        const errorCodeString = typeof event.error === 'string' ? event.error : String(event.error);
        if (!(itemIsInitialGreeting && errorCodeString === 'not-allowed') && !(errorCodeString === 'canceled' || errorCodeString === 'interrupted')) {
          console.error(`SpeechSynthesisUtterance.onerror (queued): type="${event.type}", error="${event.error}"`);
          setError(`Speech synthesis error (queued): ${errorCodeString}.`);
        }
        isSpeakingRef.current = false;
        processSpeechQueue(); 
      };
      
      // Start background listening for hands-free interruption when agent speaks
      if (!isWakeWordListening) {
        startWakeWordListening();
      }
      
      window.speechSynthesis.speak(utterance);
    }
  }, [setError, processFinalApiResponse, error]);

  // Function to convert phone numbers to digit-by-digit format for better speech clarity
  const convertPhoneNumbersToDigits = useCallback((text: string): string => {
    // Pattern to match phone numbers in various formats
    // Matches: 555-123-4567, (555) 123-4567, 555.123.4567, 5551234567, etc.
    const phonePattern = /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10,})/g;
    
    return text.replace(phonePattern, (match) => {
      // Remove all non-digit characters to get clean number
      const digits = match.replace(/\D/g, '');
      
      // Only process if it looks like a phone number (10-11 digits)
      if (digits.length >= 10 && digits.length <= 11) {
        // Convert each digit to individual words with spaces
        return digits.split('').map(digit => {
          // Map digits to words for clearer pronunciation
          const digitWords: { [key: string]: string } = {
            '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
            '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
          };
          return digitWords[digit] || digit;
        }).join(' ');
      }
      
      // Return original if not a typical phone number
      return match;
    });
  }, []);

  const queueUtterance = useCallback((text: string, isInitialGreetingParam: boolean = false) => {
    if (typeof window.speechSynthesis === 'undefined' || !text.trim()) {
      if (!text.trim()) return;
      if (typeof window.speechSynthesis === 'undefined') setError('Speech synthesis is not supported by your browser.');
      return;
    }

    // Filter out JSON responses from being spoken
    let filteredText = text.replace(/```json[\s\S]*?```/g, '').trim();
    
    // Also filter out standalone JSON objects that might not be in code fences
    filteredText = filteredText.replace(/\{[\s\S]*?"action"[\s\S]*?\}/g, '').trim();
    
    if (!filteredText) return;

    // Convert phone numbers to digit-by-digit format
    const processedText = convertPhoneNumbersToDigits(filteredText);

    const utterance = new SpeechSynthesisUtterance(processedText);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      let selectedVoice = voices.find(voice => 
        voice.lang.startsWith('en-US') && 
        (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('zira') || voice.name.toLowerCase().includes('susan') || voice.name === 'Google US English') && 
        !voice.name.toLowerCase().includes('male')
      );
      if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang.startsWith('en-US') && !voice.name.toLowerCase().includes('male'));
      if (!selectedVoice) selectedVoice = voices.find(voice => voice.lang.startsWith('en-US'));
      if (selectedVoice) utterance.voice = selectedVoice;
    }
    
    speechQueueRef.current.push({ utterance, isInitialGreeting: isInitialGreetingParam });
    if (!isSpeakingRef.current) { 
        processSpeechQueue();
    }
  }, [setError, processSpeechQueue, convertPhoneNumbersToDigits]);

  const addMessage = useCallback((text: string, sender: 'user' | 'saddie', messageId?: string) => {
    const id = messageId || Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setChatMessages(prev => [...prev, { id, text, sender, timestamp: new Date() }]);
    return id;
  }, []);

  const updateLastSaddieMessage = useCallback((newTextChunk: string) => {
    if (!currentSaddieMessageIdRef.current) return;
    setChatMessages(prev =>
      prev.map(msg =>
        msg.id === currentSaddieMessageIdRef.current ? { ...msg, text: msg.text + newTextChunk } : msg
      )
    );
  }, []);
  
  const sendToSaddie = useCallback(async (text: string) => {
    if (!geminiChat.current) {
      setError( (error && error.toLowerCase().includes("api_key")) ? "AI Service not initialized (API Key)." : "AI Service not initialized.");
      setIsLoading(false);
      return;
    }
    
    interruptionFlagRef.current = false; 
    setIsLoading(true);
    setError(null);
    fullResponseTextRef.current = ""; 
    jsonBlockStartedInStreamRef.current = false;
    conversationConcludedRef.current = false; 
    autoRelistenDisabledForThisTurnRef.current = false; 
    isCannedResponseRef.current = false;

    currentSaddieMessageIdRef.current = addMessage("", 'saddie'); 
    let sentenceBuffer = "";

    try {
      const responseStream = await geminiChat.current.sendMessageStream({ message: text });
      for await (const chunk of responseStream) {
        if (interruptionFlagRef.current) {
          console.log("Interruption flag set during stream. Breaking response processing.");
          break; 
        }
        
        const chunkText = chunk.text || '';
        fullResponseTextRef.current += chunkText; 

        let textForDisplayAndSpeech = "";
        if (jsonBlockStartedInStreamRef.current) { 
          continue; 
        } else {
          const jsonFenceIndex = chunkText.indexOf("```json");
          if (jsonFenceIndex !== -1) {
            textForDisplayAndSpeech = chunkText.substring(0, jsonFenceIndex);
            jsonBlockStartedInStreamRef.current = true; 
                      } else {
              textForDisplayAndSpeech = chunkText;
            }
        }
        
        const cleanedTextForDisplayAndSpeech = textForDisplayAndSpeech.replace(/\*/g, '');
        
        if (cleanedTextForDisplayAndSpeech) {
            updateLastSaddieMessage(cleanedTextForDisplayAndSpeech);
            sentenceBuffer += cleanedTextForDisplayAndSpeech;
        }
        
        const sentenceRegex = /[^.!?]+(?:[.!?](?=\s|$)|[.!?]$)/g;
        let sentencesFound;
        let lastIndex = 0;
        
        while ((sentencesFound = sentenceRegex.exec(sentenceBuffer)) !== null) {
            const sentence = sentencesFound[0].trim();
            if (sentence) queueUtterance(sentence);
            lastIndex = sentencesFound.index + sentence.length;
        }
        sentenceBuffer = sentenceBuffer.substring(lastIndex); 
      }

      if (interruptionFlagRef.current) {
        setIsLoading(false); 
        return; 
      }
      
      const cleanedFinalSentenceBuffer = sentenceBuffer.trim().replace(/\*/g, '');
      if (cleanedFinalSentenceBuffer) queueUtterance(cleanedFinalSentenceBuffer);
      
      if (speechQueueRef.current.length === 0 && !isSpeakingRef.current) {
        if (!isCannedResponseRef.current) processFinalApiResponse(fullResponseTextRef.current);
        isCannedResponseRef.current = false; 
        setIsLoading(false); 
        if (!conversationConcludedRef.current && !autoRelistenDisabledForThisTurnRef.current && !error) {
             if (toggleListeningCallbackRef.current) toggleListeningCallbackRef.current(true);
        }
      }

    } catch (err) {
      if (interruptionFlagRef.current) {
        setIsLoading(false); return;
      }
      console.error("Error sending message to Saddie (stream):", err);
      let friendlyError = "Sorry, I'm having trouble connecting. Please try again.";
      if (err instanceof Error && err.message.toLowerCase().includes("api key not valid")) {
        friendlyError = "AI service configuration error (API Key).";
      } else if (err instanceof Error) {
        const maxLength = 200;
        friendlyError = `Sorry, an error occurred: ${err.message.substring(0, maxLength)}${err.message.length > maxLength ? '...' : ''}`;
      }
      setError(friendlyError);
       if (currentSaddieMessageIdRef.current) {
        setChatMessages(prev => prev.map(m => m.id === currentSaddieMessageIdRef.current ? {...m, text: friendlyError} : m));
      } else {
        addMessage(friendlyError, 'saddie');
      }
      isCannedResponseRef.current = true; 
      queueUtterance(friendlyError); 
      setIsLoading(false);
      autoRelistenDisabledForThisTurnRef.current = true; 
    } finally {
      currentSaddieMessageIdRef.current = null; 
      if (speechQueueRef.current.length === 0 && !isSpeakingRef.current) { 
        setIsLoading(false);
      }
    }
  }, [addMessage, updateLastSaddieMessage, queueUtterance, processFinalApiResponse, setError, error]); 

  const handleVoiceInput = useCallback((transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    if (DEBUG_MODE) {
      console.log("🎤 Voice input received:", transcript);
    }
    
    // Handle stop commands
    if (STOP_COMMANDS.some(stopCommand => lowerTranscript.includes(stopCommand))) {
      if (DEBUG_MODE) console.log("🛑 Stop command detected:", transcript);
      
      // Stop agent immediately
      interruptionFlagRef.current = true;
      window.speechSynthesis.cancel();
      speechQueueRef.current = [];
      isSpeakingRef.current = false;
      setIsLoading(false);
      
      addMessage(transcript, 'user');
      const ackMsg = "Okay, I've stopped. What can I help you with?";
      addMessage(ackMsg, 'saddie');
      queueUtterance(ackMsg);
      
      return;
    }
    
    // Process normal user input
    if (DEBUG_MODE) console.log("✅ Processing user input:", transcript);
    
    interruptionFlagRef.current = false;
    autoRelistenDisabledForThisTurnRef.current = false;
    isCannedResponseRef.current = false;
    
    addMessage(transcript, 'user');
    sendToSaddie(transcript);
  }, [addMessage, sendToSaddie, queueUtterance, setIsLoading]); 


  const toggleListening = useCallback((forceListen?: boolean) => {
    const CustomWindow = window as any; 
    if (typeof CustomWindow.SpeechRecognition !== 'function' && typeof CustomWindow.webkitSpeechRecognition !== 'function') {
        const errorMsg = 'Speech recognition not supported. Try Chrome or Edge.';
        setError(errorMsg);
        isCannedResponseRef.current = true; 
        queueUtterance(errorMsg); 
        return;
    }
    const SpeechRecognitionAPI = CustomWindow.SpeechRecognition || CustomWindow.webkitSpeechRecognition;

    const shouldStop = forceListen === false || (forceListen === undefined && isListening);
    const shouldStart = forceListen === true || (forceListen === undefined && !isListening);

    if (shouldStop) {
        if (recognitionRef.current) {
            console.log("toggleListening: Calling recognitionRef.current.stop()");
            recognitionRef.current.stop(); 
        } else if (isListening) { 
            setIsListening(false);
        }
    } else if (shouldStart) {
        if (isListening) { 
            console.warn("toggleListening: Attempted to start when React state isListening=true. Aborting.");
            return;
        }

        // Interrupt Saddie if she's active from a *previous* turn and user manually clicks mic
        if (isSpeakingRef.current || speechQueueRef.current.length > 0 || (isLoading && !isListening)) {
             console.log("User click-to-listen interrupted Saddie's previous activity.");
             window.speechSynthesis.cancel();
             speechQueueRef.current = [];
             isSpeakingRef.current = false;
             interruptionFlagRef.current = true; 
             setIsLoading(false); 
        } else {
            // Normal start: ensure interruption flag is false for the new interaction
            interruptionFlagRef.current = false;
        }
        
        // Always ensure Saddie is silent for the new listening session
        window.speechSynthesis.cancel(); 
        speechQueueRef.current = [];     
        isSpeakingRef.current = false;
        
        if(forceListen === undefined) autoRelistenDisabledForThisTurnRef.current = false; 

        // Audio context not needed for wake word detection

        if (recognitionRef.current) {
            recognitionRef.current.onstart = null;
            recognitionRef.current.onspeechstart = null;
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.abort(); 
            console.log("Previous SpeechRecognition instance aborted.");
        }
        
        recognitionRef.current = new SpeechRecognitionAPI();
        if (recognitionRef.current) {
            recognitionRef.current.continuous = false; 
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onstart = () => {
              if (DEBUG_MODE) console.log("🎤 Speech recognition started");
              setIsListening(true); 
              // Ensure Saddie isn't speaking when mic activates
              window.speechSynthesis.cancel();
              speechQueueRef.current = [];
              isSpeakingRef.current = false;
            };
        }
        
        if (recognitionRef.current) {
            recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
              const result = event.results[event.results.length - 1];
              if (result && result[0]) {
                const transcript = result[0].transcript;
                const confidence = result[0].confidence || 1;
                
                if (DEBUG_MODE) {
                  console.log(`🎤 Speech result: "${transcript}" (confidence: ${confidence.toFixed(2)})`);
                }
                
                // Accept all speech with reasonable confidence
                if (confidence >= WAKE_WORD_CONFIDENCE || transcript.trim().length > 3) {
                  handleVoiceInput(transcript);
                } else if (DEBUG_MODE) {
                  console.log(`🔇 Low confidence speech ignored: ${confidence.toFixed(2)}`);
                }
              }
            };

            recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => { 
              console.error('Speech recognition error (onerror event):', event.error, event.message);
              let detailedError = `Speech recognition error: ${event.error}.`;
              if (event.error === 'no-speech') {
                detailedError = 'No speech detected. Please try speaking again.';
                autoRelistenDisabledForThisTurnRef.current = true; 
              } else if (event.error === 'audio-capture') detailedError = 'Audio capture error. Is the microphone working?';
              else if (event.error === 'not-allowed') detailedError = 'Microphone access denied. Please allow microphone access and refresh.';
              else if (event.error === 'network') detailedError = 'Network error during speech recognition.';
              else if (event.error === 'aborted') { detailedError = 'Speech recognition aborted.';}
              if (event.error === 'not-allowed' || event.error === 'audio-capture' || event.error === 'network') {
                setError(detailedError);
              } else {
                console.warn(detailedError); 
              }
              setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
              console.log("Speech recognition ended (onend event).");
              setIsListening(false);
            };
        }
      
        try {
            console.log("toggleListening: Calling new recognitionRef.current.start()");
            if (recognitionRef.current) {
                recognitionRef.current.start();
            }
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            console.error("Error starting speech recognition (synchronous catch):", errorMsg, e);
            setError("Could not start voice recognition: " + errorMsg);
            setIsListening(false);
            if (recognitionRef.current) { 
                recognitionRef.current.onstart = null;
                recognitionRef.current.onspeechstart = null;
                recognitionRef.current.onresult = null;
                recognitionRef.current.onerror = null;
                recognitionRef.current.onend = null;
            }
        }
    }
  }, [isListening, handleVoiceInput, queueUtterance, setError, isLoading]); 

  const handleStopButtonClick = useCallback(() => {
    interruptionFlagRef.current = true;
    window.speechSynthesis.cancel();
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
    setIsLoading(false); 

    if (recognitionRef.current && isListening) {
        recognitionRef.current.stop(); 
    } else {
        setIsListening(false); 
    }
    const ackMsg = "Okay.";
    addMessage(ackMsg, 'saddie'); 
    queueUtterance(ackMsg);       

    isCannedResponseRef.current = true; 
    autoRelistenDisabledForThisTurnRef.current = false; 
    
    fullResponseTextRef.current = ""; 
    jsonBlockStartedInStreamRef.current = false;
  }, [addMessage, queueUtterance, setIsLoading, isListening]);

  useEffect(() => {
    toggleListeningCallbackRef.current = toggleListening;
  }, [toggleListening]);

  useEffect(() => {
    // Initialize voice synthesis on component mount
    if (typeof window.speechSynthesis !== 'undefined') {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                console.log("Speech synthesis voices loaded:", voices.length);
                if(window.speechSynthesis.onvoiceschanged === loadVoices) { 
                    window.speechSynthesis.onvoiceschanged = null; 
                }
            }
        };
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        } else {
            loadVoices(); 
        }
    }
  }, []); 

  useEffect(() => { 
    return () => {
      if(recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort(); 
      }
      
      // Clean up background recognition
      if(wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }
      
      // Clean up noise filter timeouts
      if(wakeWordTimeoutRef.current) {
        clearTimeout(wakeWordTimeoutRef.current);
        wakeWordTimeoutRef.current = null;
      }
      
      if (listeningTimeoutRef.current) {
        clearTimeout(listeningTimeoutRef.current);
        listeningTimeoutRef.current = null;
      }
      
      window.speechSynthesis?.cancel(); 
      
      speechQueueRef.current = [];
      const _q = speechQueueRef.current; 

      isSpeakingRef.current = false;
      const _s = isSpeakingRef.current; 
      
      // Cleanup complete 

      console.log("App unmounted, resources cleaned up.");
    };
  }, []); 

  // New function to handle sample prompt clicks
  const handleSamplePromptClick = useCallback((prompt: string) => {
    setShowSamplePrompts(false);
    addMessage(prompt, 'user');
    sendToSaddie(prompt);
  }, [addMessage, sendToSaddie]);

  // Handle text message input
  const handleTextMessage = useCallback((message: string) => {
    setShowSamplePrompts(false);
    addMessage(message, 'user');
    sendToSaddie(message);
  }, [addMessage, sendToSaddie]);

  // Start Agent functionality
  const handleStartAgent = useCallback(async () => {
    setIsInitializing(true);
    setError(null);
    
    // Initialize AI Service
    await initializeAIService();
    
    if (!error) {
      setIsAgentStarted(true);
      setShowSamplePrompts(true);
      
      // Send initial greeting
      const timer = setTimeout(() => {
        setIsLoading(true);
        const welcomeMessage = "Hi! I'm Saddie from Sadie's Pizzeria DTLA—can you please tell me your name and phone number for pickup?".replace(/\*/g, '');
        addMessage(welcomeMessage, 'saddie');
        queueUtterance(welcomeMessage, true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [initializeAIService, addMessage, queueUtterance, error]);

  const canInterruptSaddie = isLoading || isSpeakingRef.current || speechQueueRef.current.length > 0;

  // Show StartScreen if agent hasn't been started yet
  if (!isAgentStarted) {
    console.log("📱 Rendering StartScreen - Agent not started");
    try {
      return (
        <StartScreen 
          onStart={handleStartAgent}
          isInitializing={isInitializing}
          error={error}
        />
      );
    } catch (err) {
      console.error("❌ Error rendering StartScreen:", err);
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">App Error</h1>
            <p className="text-gray-600">Something went wrong loading the app.</p>
            <p className="text-sm text-gray-500 mt-2">Check the console for details.</p>
          </div>
        </div>
      );
    }
  }

  console.log("📱 Rendering Main App - Agent started");
  
  try {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        {/* Modern Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Saddie</h1>
                <p className="text-xs text-gray-500">AI Assistant for Sadie's Pizzeria DTLA</p>
              </div>
            </div>
            
            {/* Status indicator */}
            <div className="flex items-center space-x-2">
              {isListening && (
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Listening...</span>
                </div>
              )}
              {isLoading && !isListening && (
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-blue-700 font-medium">Thinking...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800">Something went wrong</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="flex-shrink-0 p-1 hover:bg-red-100 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 lg:grid-cols-3 gap-6">
          
          {/* Chat Section */}
          <div className="xl:col-span-3 lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[75vh] flex flex-col">
              
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <AvatarDisplay 
                    avatarUrl={SADDIE_AVATAR_URL} 
                    isListening={isListening} 
                    voiceActivity={voiceActivity} 
                    isSpeaking={isSpeakingRef.current}
                  />
                  <div>
                    <h2 className="font-semibold text-gray-900">Chat with Saddie</h2>
                    <p className="text-sm text-gray-500">Voice-powered pizza ordering assistant</p>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-hidden">
                {chatMessages.length === 0 && showSamplePrompts ? (
                  <div className="h-full flex flex-col items-center justify-center p-8">
                    <div className="max-w-md text-center space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Welcome to Sadie's Pizzeria! 🍕
                        </h3>
                        <p className="text-gray-600">
                          I'm Saddie! First, I need your name and contact details. Try these examples:
                        </p>
                      </div>
                      
                      {/* Sample Prompts */}
                      <div className="space-y-3">
                        {SAMPLE_PROMPTS.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handleSamplePromptClick(prompt)}
                            className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <span className="text-sm text-gray-700 font-medium">{prompt}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          💡 <strong>Tip:</strong> You can speak or type your order. I'll help you build the perfect meal!
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ChatLog messages={chatMessages} />
                )}
              </div>
              
              {/* Chat Input & Voice Controls */}
              <div className="border-t border-gray-100">
                <ChatInput
                  onSendMessage={handleTextMessage}
                  isLoading={isLoading}
                  isListening={isListening}
                  placeholder={userInfo.hasProvidedDetails ? "Type your order or use voice..." : "Enter your name and phone number..."}
                />
                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100">
                  <VoiceControl
                    isListening={isListening}
                    isLoading={isLoading && !isListening}
                    onToggleListening={() => toggleListening()}
                    canInterruptSaddie={canInterruptSaddie}
                    onStopSaddie={handleStopButtonClick}
                    isWakeWordListening={isWakeWordListening}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Order Panel */}
          <div className="xl:col-span-1 lg:col-span-1">
            <div className="sticky top-24">
              <OrderPanel orderItems={currentOrder} userInfo={userInfo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (err) {
    console.error("❌ Error rendering Main App:", err);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-red-600 mb-4">App Error</h1>
          <p className="text-gray-600">Something went wrong loading the main app.</p>
          <p className="text-sm text-gray-500 mt-2">Check the console for details.</p>
        </div>
      </div>
    );
  }
};

export default App;

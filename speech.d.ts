// speech.d.ts

// Based on MDN and common usage for Web Speech API
// https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition

interface SpeechRecognition extends EventTarget {
  grammars: SpeechGrammarList;
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  serviceURI?: string; // Optional as per some specs

  start(): void;
  stop(): void;
  abort(): void;

  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;

  addEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof SpeechRecognitionEventMap>(type: K, listener: (this: SpeechRecognition, ev: SpeechRecognitionEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var SpeechRecognition: {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
};

interface SpeechRecognitionEventInit extends EventInit {
  resultIndex?: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
  readonly interpretation?: any; // Non-standard
  readonly emma?: Document; // Non-standard
}

declare var SpeechRecognitionEvent: {
    prototype: SpeechRecognitionEvent;
    new(type: string, eventInitDict: SpeechRecognitionEventInit): SpeechRecognitionEvent;
};


interface SpeechRecognitionErrorEventInit extends EventInit {
    error: "no-speech" | "aborted" | "audio-capture" | "network" | "not-allowed" | "service-not-allowed" | "bad-grammar" | "language-not-supported";
    message?: string;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: "no-speech" | "aborted" | "audio-capture" | "network" | "not-allowed" | "service-not-allowed" | "bad-grammar" | "language-not-supported";
  readonly message: string;
}

declare var SpeechRecognitionErrorEvent: {
    prototype: SpeechRecognitionErrorEvent;
    new(type: string, eventInitDict: SpeechRecognitionErrorEventInit): SpeechRecognitionErrorEvent;
};

/*
  Removed SpeechRecognitionErrorCode type definition as it conflicts with and is identical to the
  standard TypeScript DOM library definition.
  The type SpeechRecognitionErrorCode is expected to be:
  type SpeechRecognitionErrorCode =
    | "no-speech"
    | "aborted"
    | "audio-capture"
    | "network"
    | "not-allowed"
    | "service-not-allowed"
    | "bad-grammar"
    | "language-not-supported";
  This type will be resolved from the standard library.
*/

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechGrammarList {
  readonly length: number;
  item(index: number): SpeechGrammar;
  [index: number]: SpeechGrammar;
  addFromURI(src: string, weight?: number): void;
  addFromString(string: string, weight?: number): void;
}

declare var SpeechGrammarList: {
    prototype: SpeechGrammarList;
    new(): SpeechGrammarList;
};
// Or webkitSpeechGrammarList for compatibility
declare var webkitSpeechGrammarList: {
  prototype: SpeechGrammarList;
  new(): SpeechGrammarList;
};


interface SpeechGrammar {
  src: string;
  weight: number;
}

// Event map for typed event listeners for SpeechRecognition
interface SpeechRecognitionEventMap {
  "audiostart": Event;
  "audioend": Event;
  "end": Event;
  "error": SpeechRecognitionErrorEvent;
  "nomatch": SpeechRecognitionEvent;
  "result": SpeechRecognitionEvent;
  "soundstart": Event;
  "soundend": Event;
  "speechstart": Event;
  "speechend": Event;
  "start": Event;
}

// --- Begin SpeechSynthesis API Type Definitions ---

interface SpeechSynthesisUtteranceEventMap {
    "boundary": SpeechSynthesisEvent;
    "end": SpeechSynthesisEvent;
    "error": SpeechSynthesisErrorEvent;
    "mark": SpeechSynthesisEvent;
    "pause": SpeechSynthesisEvent;
    "resume": SpeechSynthesisEvent;
    "start": SpeechSynthesisEvent;
}

interface SpeechSynthesis extends EventTarget {
    readonly pending: boolean;
    readonly speaking: boolean;
    readonly paused: boolean;

    speak(utterance: SpeechSynthesisUtterance): void;
    cancel(): void;
    pause(): void;
    resume(): void;
    getVoices(): SpeechSynthesisVoice[];

    onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null;
}

// SpeechSynthesis is accessed via window.speechSynthesis, not typically constructed with `new` by developers.
// However, declaring its type is important.
// declare var SpeechSynthesis: {
//     prototype: SpeechSynthesis;
// };

interface SpeechSynthesisUtterance extends EventTarget {
    text: string;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    volume: number; // 0 to 1
    rate: number;   // 0.1 to 10
    pitch: number;  // 0 to 2

    onboundary: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null;
    onmark: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onpause: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onresume: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;
    onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null;

    addEventListener<K extends keyof SpeechSynthesisUtteranceEventMap>(type: K, listener: (this: SpeechSynthesisUtterance, ev: SpeechSynthesisUtteranceEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener<K extends keyof SpeechSynthesisUtteranceEventMap>(type: K, listener: (this: SpeechSynthesisUtterance, ev: SpeechSynthesisUtteranceEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare var SpeechSynthesisUtterance: {
    prototype: SpeechSynthesisUtterance;
    new(text?: string): SpeechSynthesisUtterance;
};

interface SpeechSynthesisEvent extends Event {
    readonly charIndex: number;
    readonly elapsedTime: number;
    readonly name: string;
    readonly utterance: SpeechSynthesisUtterance;
}

/*
  Removed SpeechSynthesisErrorCode type definition as it conflicts with and is identical to the
  standard TypeScript DOM library definition.
  The type SpeechSynthesisErrorCode is expected to be:
  type SpeechSynthesisErrorCode =
    | "canceled"
    | "interrupted"
    | "audio-busy"
    | "audio-hardware"
    | "network"
    | "synthesis-failed"
    | "synthesis-unavailable"
    | "text-too-long"
    | "voice-unavailable"
    | "language-unavailable"
    | "invalid-argument";
  This type will be resolved from the standard library.
*/

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
    readonly error: SpeechSynthesisErrorCode;
}

interface SpeechSynthesisVoice {
    readonly default: boolean;
    readonly lang: string;
    readonly localService: boolean;
    readonly name: string;
    readonly voiceURI: string;
}

// --- End SpeechSynthesis API Type Definitions ---


// Augment Window interface to include all speech related APIs
interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
  SpeechGrammarList?: typeof SpeechGrammarList;
  webkitSpeechGrammarList?: typeof SpeechGrammarList;

  readonly speechSynthesis: SpeechSynthesis; // Modified to be readonly to match standard DOM typings
  SpeechSynthesisUtterance: typeof SpeechSynthesisUtterance; // Added for SpeechSynthesis
  // SpeechSynthesisEvent and SpeechSynthesisErrorEvent types are available globally once declared
  // No need to add them to Window unless you need to `new` them via `window.SpeechSynthesisEvent`
}

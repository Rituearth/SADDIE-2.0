export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number; // Price per item
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'saddie';
  timestamp: Date;
}

// User information for personalized experience
export interface UserInfo {
  name?: string;
  phone?: string;
  hasProvidedDetails: boolean;
}

// Expected structure from Gemini for order updates
export interface GeminiOrderUpdatePayload {
  action?: 'update_order' | 'add_item' | 'remove_item' | 'clear_order' | 'no_change' | 'collect_user_info';
  currentOrderItems?: OrderItem[]; // Corrected: was 'items'
  lastActionDetail?: {             // Corrected: was 'last_action_item', now an object
    item?: OrderItem;
    message?: string;
  };
  userInfo?: {
    name?: string;
    phone?: string;
    hasProvidedDetails?: boolean;
  };
  conversationState?: "ongoing" | "concluded" | "collecting_info"; // Added for continuous conversation
}

// For grounding metadata if Google Search is used (not primary for this app but good to have)
export interface GroundingChunkWeb {
  uri: string;
  title: string;
}
export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // other types of chunks can be added here
}
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  // other grounding metadata fields
}

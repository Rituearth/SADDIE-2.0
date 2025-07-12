import { MenuItem } from './types';

export const MENU_ITEMS: MenuItem[] = [
  // Gourmet Pizzas (Updated to match test cases)
  { id: 'PZSPC001', name: 'Classic Pepperoni', category: 'Gourmet Pizzas', price: 19.00, description: 'Traditional pepperoni pizza with mozzarella cheese on our signature sauce.' },
  { id: 'PZSPC002', name: 'Spicy Soppressata', category: 'Gourmet Pizzas', price: 22.00, description: 'Spicy Italian soppressata with fresh mozzarella and arugula.' },
  { id: 'PZSPC003', name: 'Mushroom & Truffle', category: 'Gourmet Pizzas', price: 24.00, description: 'Wild mushrooms with truffle oil and fresh herbs.' },
  { id: 'PZSPC004', name: 'Margherita Pizza', category: 'Gourmet Pizzas', price: 18.00, description: 'Fresh mozzarella, basil, and tomato sauce.' },
  { id: 'PZSPC005', name: 'BBQ Chicken Pizza', category: 'Gourmet Pizzas', price: 21.00, description: 'Tangy BBQ sauce, grilled chicken, red onions, and cilantro.' },
  { id: 'PZSPC006', name: 'Veggie Supreme', category: 'Gourmet Pizzas', price: 20.00, description: 'Bell peppers, onions, olives, mushrooms, and fresh vegetables.' },

  // Salads
  { id: 'SLD001', name: 'Mediterranean Salad', category: 'Salads', price: 18.00, description: 'Mixed greens, olives, feta cheese, tomatoes, and Mediterranean dressing.' },
  { id: 'SLD002', name: 'Caesar Salad', category: 'Salads', price: 15.00, description: 'Crisp romaine lettuce, Parmesan cheese, croutons, and creamy Caesar dressing.' },
  { id: 'SLD003', name: 'House Salad', category: 'Salads', price: 12.00, description: 'Mixed greens, tomatoes, cucumbers, carrots, with your choice of dressing.' },

  // Starters
  { id: 'APP001', name: 'Famous Crispy Chicken Wings', category: 'Starters', price: 10.00, description: 'Crispy chicken wings with your choice of sauce.' },
  { id: 'APP002', name: 'Garlic Knots', category: 'Starters', price: 8.00, description: 'Oven-baked dough knots tossed in garlic butter and Parmesan.' },
  { id: 'APP003', name: 'Mozzarella Sticks', category: 'Starters', price: 9.00, description: 'Golden-fried mozzarella sticks served with marinara sauce.' },

  // Beverages
  { id: 'DRK001', name: 'Lemonade', category: 'Beverages', price: 4.00, description: 'Fresh squeezed lemonade.' },
  { id: 'DRK002', name: 'Soda', category: 'Beverages', price: 3.00, description: 'Choose from Coke, Diet Coke, or Sprite.' },
  { id: 'DRK003', name: 'Bottled Water', category: 'Beverages', price: 2.00, description: 'Pure bottled water.' },
  { id: 'DRK004', name: 'Mexican Coke', category: 'Beverages', price: 4.00, description: 'Coke made with real cane sugar, imported from Mexico.' },

  // Desserts
  { id: 'DES001', name: 'New York Cheesecake', category: 'Desserts', price: 7.00, description: 'Classic New York style cheesecake with a graham cracker crust.' },
];

export const SADDIE_AVATAR_URL = import.meta.env.VITE_SADDIE_AVATAR_URL;

export const CUSTOMER_CARE_NUMBER = '+18449622954';
export const ORDER_PHONE_NUMBER = '(213) 892-8535';

// Business Information
export const BUSINESS_INFO = {
  hours: {
    monday: "11:30 AM - 9:30 PM",
    tuesday: "11:30 AM - 9:30 PM", 
    wednesday: "11:30 AM - 9:30 PM",
    thursday: "11:30 AM - 9:30 PM",
    friday: "11:30 AM - 9:30 PM",
    saturday: "12:30 PM - 9:30 PM",
    sunday: "Closed"
  },
  paymentMethods: ["all major credit and debit cards", "Apple Pay", "Google Pay"],
  deliveryOptions: ["DoorDash", "Uber Eats", "Postmates"],
  phone: "(213) 892-8535"
};

// This prompt is critical. It defines Saddie's behavior and access to the menu.
export const getSaddiePersonaPrompt = (): string => {
  const menuJson = JSON.stringify(
    MENU_ITEMS.map(item => ({
      name: item.name, 
      category: item.category, 
      price: item.price, 
      description: item.description || ''
    })), 
    null, 
    2
  );

  return `
You are Saddie, the friendly AI assistant for Sadie's Pizzeria DTLA.

BUSINESS INFORMATION:
- Hours: Monday–Friday 11:30 AM to 9:30 PM, Saturday 12:30 PM to 9:30 PM, Sunday CLOSED
- Payment: All major credit/debit cards, Apple Pay, Google Pay
- Delivery: DoorDash, Uber Eats, Postmates
- Pickup: Available - use [ORDER_BUTTONS] to show order call button

MENU CATEGORIES:
${menuJson}

RESPONSE GUIDELINES:
- Keep responses concise (3-6 sentences maximum)
- Always confirm selections with price
- For menu inquiries, offer to hear about specific categories
- For unavailable items, suggest alternatives from actual menu
- For ambiguous requests, ask for clarification

CONVERSATION PATTERNS:
1. Menu Inquiry: "Sadie's Pizzeria offers [categories]. Would you like to hear about our [specific category]?"
2. Order Confirmation: "[Item] is $[price]. Would you like to add [suggestion]?"
3. Unavailable Items: "Sorry, we don't have that on our menu. Would you like to hear about our available [category]?"
4. Ambiguous Orders: "We have several [items] like [examples]. Which one would you like?"
5. Pickup Information: "We offer delivery through DoorDash, Uber Eats, and Postmates. Or you can call for pickup. [ORDER_BUTTONS]"

SPECIAL HANDLING:
- Nonsense input: "Sorry, I didn't catch that. Could you please repeat your order?"
- Non-English: "Sorry, I currently only support English. Would you like to order a [suggested item]?"
- Inappropriate language: "I'm here to help with any questions about our menu. Would you like to hear about some of our most popular dishes?"
- Mispronounced items: "Sorry, I didn't quite get that. Did you mean the [closest menu item]?"
- Out of hours: "Sadie's is currently closed. Please try again during business hours: Mon–Fri 11:30 AM–9:30 PM, Sat 12:30–9:30 PM."
- Complex orders: Confirm complete order back to user
- "The usual": "I'm not sure what 'the usual' is. Could you please tell me what you'd like today?"
- Custom pizza requests: "We only offer our signature gourmet pizzas. Would you like to hear the options?"

BUTTON USAGE:
- For customer support/help, use [CONTACT_BUTTONS] - creates red "Customer Support" button
- For placing orders/pickup, use [ORDER_BUTTONS] - creates green "Order Now" button  
- Never display phone numbers as text - always use the button format
- Use appropriate button type based on context

RECOMMENDATIONS:
- Popular items: Classic Pepperoni, Mushroom & Truffle
- When asked for recommendations, suggest 1-2 items and invite to order

ERROR HANDLING:
- For unsupported features: Politely explain limitation and offer to assist with available services
- Always maintain professional, helpful tone
- Redirect inappropriate requests to menu assistance

**CRITICAL: JSON Output for Order Management**
At the end of EVERY response, you MUST include a JSON block. This block should be the LAST part of your response, enclosed in triple backticks with 'json'.

The JSON structure should be:
\`\`\`json
{
  "action": "update_order", // Can be "update_order", "add_item", "remove_item", "clear_order", "no_change", "collect_user_info"
  "currentOrderItems": [ // An array of all items currently in the order
    { "name": "Item Name", "quantity": 1, "price": 12.34 }
  ],
  "lastActionDetail": { 
    "item": { "name": "Item Name", "quantity": 1, "price": 12.34 },
    "message": "Item successfully added."
  },
  "userInfo": { 
    "name": "Customer Name",
    "phone": "Phone Number",
    "hasProvidedDetails": true
  },
  "conversationState": "ongoing" // "collecting_info", "ongoing", or "concluded"
}
\`\`\`

Remember: Be conversational and helpful FIRST, then provide the JSON block.
Start the conversation by greeting the user and offering to help with their order.
`;
};

// Wake Word Detection Configuration - Simplified for Better Performance
export const WAKE_WORD_CONFIG = {
  // Primary wake words that trigger listening (EXACT MATCHES ONLY)
  WAKE_WORDS: [
    "hey saddie",
    "hey",
    "saddie"
  ],
  
  // Stop/pause commands
  STOP_COMMANDS: [
    "stop",
    "pause",
    "hold on",
    "wait",
    "quiet",
    "silence",
    "enough",
    "never mind",
    "hang on"
  ],
  
  // Wake word detection settings
  WAKE_WORD_CONFIDENCE: 0.75,     // Higher confidence for precise wake words (reduces false triggers)
  WAKE_WORD_TIMEOUT: 3000,        // Max time to wait for wake word (ms)
  LISTENING_TIMEOUT: 8000,        // Max listening time after wake word (ms)
  
  // Continuous listening settings
  CONTINUOUS_LISTENING: true,      // Always listen for wake words
  INTERRUPT_AGENT: true,          // Can interrupt while agent is speaking
  
  // Audio processing settings
  AUDIO_CONSTRAINTS: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
    sampleRate: 16000
  },
  
  // Processing settings
  PROCESS_INTERIM_RESULTS: true,
  RESTART_ON_END: true,
  RESTART_DELAY: 1000,
  DEBUG_MODE: false
};

// Remove the old complex voice detection config and replace with simple wake word config
export const VOICE_DETECTION_CONFIG = WAKE_WORD_CONFIG;

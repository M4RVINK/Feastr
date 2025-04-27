import { create } from 'zustand';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: any[];
}

interface AIRecStore {
  userId: string | null;
  messages: Message[];
  inputText: string;
  setUserId: (userId: string | null) => void;
  setInputText: (text: string) => void;
  setMessages: (messages: Message[]) => void;
  resetStore: (welcomeMessage?: string) => void;
}

export const useAIRecStore = create<AIRecStore>((set) => ({
  userId: null,
  messages: [],
  inputText: '',
  
  setUserId: (userId) => set({ userId }),
  setInputText: (text) => set({ inputText: text }),
  setMessages: (messages) => set({ messages }),
  
  resetStore: (welcomeMessage) => set({
    userId: null,
    messages: [
      {
        id: '1',
        text: welcomeMessage || "Hi! I'm your AI food guide. Tell me what you're craving or describe your perfect dining experience!",
        isUser: false,
        timestamp: new Date(),
      },
    ],
    inputText: '',
  }),
}));

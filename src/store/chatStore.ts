import { create } from 'zustand';
import { ChatState, ChatStore, Message } from '../types/chat';

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => 
    set((state: ChatStore) => ({
      messages: [...state.messages, {
        ...message,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }],
      error: null,
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error }),
  
  clearMessages: () => set({ messages: [] }),
})); 
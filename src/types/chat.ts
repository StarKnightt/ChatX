export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  content: string;
  role: Role;
  timestamp: number;
  model?: string;
}

export interface ChatSession {
  id: string;
  name: string;
  messages: Message[];
  created: number;
  lastUpdated: number;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  sessions: ChatSession[];
  currentSessionId: string | null;
}

export interface ChatStore extends ChatState {
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  createNewSession: () => string;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  deleteAllSessions: () => void;
  renameSession: (sessionId: string, newName: string) => void;
  getCurrentSession: () => ChatSession | undefined;
} 
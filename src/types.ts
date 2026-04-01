import { Message } from './services/ai';

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  content: string;
  timestamp: number;
}

export interface AgentActivity {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
  capabilities: string[];
  model?: string;
  customModelId?: string;
  customApiUrl?: string;
  apiKey?: string;
  mcpEnabled?: boolean;
}

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
  permissions: Record<string, any>;
  created_at: string;
}

export interface UserPersona {
  user_id: string;
  persona_id: string;
  assigned_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  last_message?: string;
  timestamp: number;
}

export interface AppState {
  messages: Message[];
  currentPersona: string;
  terminalHistory: TerminalLine[];
  isOffline: boolean;
  workspace: {
    rootPath: string | null;
    files: string[];
  };
  settings: {
    theme: 'dark' | 'light' | 'system';
    userName: string;
    customPersonas: Persona[];
  };
}

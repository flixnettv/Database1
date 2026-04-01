import { GoogleGenAI, GenerateContentResponse, Type, FunctionDeclaration, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { memoryService } from './memory';
import { localFileService } from './localFiles';

const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

const getApiKey = (key: string) => {
  let value: string | undefined;
  
  // Try process.env (AI Studio)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    value = process.env[key];
  }
  
  // Try import.meta.env (Vite/Netlify)
  if (!value) {
    const viteKey = `VITE_${key}`;
    const metaEnv = (import.meta as any).env;
    if (typeof import.meta !== 'undefined' && metaEnv && metaEnv[viteKey]) {
      value = metaEnv[viteKey];
    }
  }

  // Sanitize: check for "undefined" string or empty whitespace
  if (value === 'undefined' || (value && !value.trim())) {
    return undefined;
  }

  return value ? value.trim() : undefined;
};

const API_KEYS: Record<string, string | undefined> = {
  gemini: getApiKey('GEMINI_API_KEY'),
  ace3: getApiKey('ACE_API_KEY') || getApiKey('GEMINI_API_KEY'),
  group: getApiKey('GROUP_API_KEY') || getApiKey('GEMINI_API_KEY'),
};

export interface Message {
  id: string;
  user_id?: string;
  conversation_id?: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
  persona?: string;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
  capabilities: string[];
  model?: string; // Optional model override
  customModelId?: string; // For any model ID
  customApiUrl?: string; // For custom API endpoints (LLC/API)
  apiKey?: string; // Optional per-persona API key
  mcpEnabled?: boolean; // Enable Model Context Protocol
  mcpConfig?: {
    endpoint: string;
    tools: string[];
  };
}

export const MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash (Fast)', description: 'Optimized for speed and efficiency.' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro (Advanced)', description: 'Complex reasoning and high-quality output.' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', description: 'Multimodal capabilities with image support.' },
  { id: 'groq-llama3', name: 'Groq (Llama 3 8B)', description: 'Fast inference via Groq API.' },
  { id: 'openrouter', name: 'OpenRouter', description: 'Access to various models via OpenRouter.' },
  { id: 'huggingface', name: 'Hugging Face', description: 'Inference via Hugging Face API.' },
  { id: 'custom', name: 'Custom Model (API/LLC/MCP)', description: 'Connect to any model via API, Local LLC, or MCP.' },
];

export const PERSONAS: Persona[] = [
  {
    id: 'db-agent',
    name: 'Database Agent',
    description: 'Expert in SQL, PostgreSQL, and Supabase database management.',
    systemInstruction: 'You are a specialized Database Agent for Flix Gosts. Your primary role is to manage, optimize, and query the Supabase database. You are an expert in SQL, PostgreSQL, and Supabase RLS policies. When asked to perform database operations, you will provide precise SQL queries, explain the impact of schema changes, and guide the user on how to implement them safely. You prioritize data integrity, security, and performance. You never execute destructive actions without explicit user confirmation and a clear explanation of the risks.',
    icon: 'Database',
    capabilities: ['SQL', 'PostgreSQL', 'Supabase', 'RLS', 'Data Optimization']
  },
  {
    id: 'supervisor-agent',
    name: 'Supervisor Agent',
    description: 'Orchestrates tasks and supervises workflow among agents.',
    systemInstruction: 'You are the Supervisor Agent for Flix Gosts. Your primary role is to orchestrate tasks, distribute work among other specialized agents, and supervise the overall workflow. You maintain a high-level view of all active projects, ensure tasks are assigned to the most appropriate agent, monitor progress, and resolve conflicts. You enforce workflow rules, ensure consistency across agent outputs, and provide status updates to the user. You are the central hub for agent communication and task management.',
    icon: 'Layers',
    capabilities: ['Task Distribution', 'Workflow Supervision', 'Conflict Resolution', 'Project Management'],
    mcpEnabled: true
  }
];

const shellTool: FunctionDeclaration = {
  name: "execute_shell_command",
  description: "Execute a shell command on the server terminal. Use this to perform system tasks, check files, or run scripts.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      command: {
        type: Type.STRING,
        description: "The shell command to execute (e.g., 'ls -la', 'node -v', 'cat package.json').",
      },
    },
    required: ["command"],
  },
};

const readFileTool: FunctionDeclaration = {
  name: "read_local_file",
  description: "Read the content of a local file from the workspace.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The relative path of the file to read.",
      },
    },
    required: ["path"],
  },
};

const writeFileTool: FunctionDeclaration = {
  name: "write_local_file",
  description: "Write content to a local file in the workspace.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      path: {
        type: Type.STRING,
        description: "The relative path of the file to write.",
      },
      content: {
        type: Type.STRING,
        description: "The content to write.",
      },
    },
    required: ["path", "content"],
  },
};

export class AIService {
  private instances: Record<string, GoogleGenAI> = {};
  private initialized = false;
  private customKeys: Record<string, string> = {};
  private worker: Worker;

  constructor() {
    this.worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });
  }

  setKeys(keys: Record<string, string>) {
    const cleanedKeys: Record<string, string> = {};
    Object.entries(keys).forEach(([id, key]) => {
      if (key && key.trim()) {
        cleanedKeys[id] = key.trim();
      }
    });

    this.customKeys = cleanedKeys;
    this.worker.postMessage({ type: 'SET_KEYS', payload: cleanedKeys });
    
    // Clear current instances to allow re-initialization with defaults if needed
    this.instances = {};
    this.initialized = false;
    this.init();

    // Re-initialize instances with new custom keys
    Object.entries(this.customKeys).forEach(([id, key]) => {
      if (key) {
        try {
          this.instances[id] = new GoogleGenAI({ apiKey: key });
        } catch (e) {
          console.error(`Failed to initialize AI instance for ${id}:`, e);
        }
      }
    });

    // Ensure fallback for ace3 and group if only gemini is provided
    if (this.customKeys.gemini && !this.customKeys.ace3) {
      this.instances.ace3 = new GoogleGenAI({ apiKey: this.customKeys.gemini });
    }
    if (this.customKeys.gemini && !this.customKeys.group) {
      this.instances.group = new GoogleGenAI({ apiKey: this.customKeys.gemini });
    }
  }

  private init(customPersonas: Persona[] = []) {
    if (this.initialized && customPersonas.length === 0) return;
    
    // Initial load from environment
    Object.entries(API_KEYS).forEach(([id, key]) => {
      if (key && key.trim() && !this.instances[id]) {
        try {
          this.instances[id] = new GoogleGenAI({ apiKey: key.trim() });
        } catch (e) {
          console.error(`Failed to initialize default AI instance for ${id}:`, e);
        }
      }
    });

    // Initialize custom personas
    customPersonas.forEach(persona => {
      const apiKey = persona.apiKey || this.customKeys[persona.id] || this.customKeys.gemini || API_KEYS.gemini;
      if (apiKey && !this.instances[persona.id]) {
        try {
          this.instances[persona.id] = new GoogleGenAI({ apiKey });
        } catch (e) {
          console.error(`Failed to initialize custom AI instance for ${persona.id}:`, e);
        }
      }
    });

    if (!this.instances.gemini && !this.customKeys.gemini) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled until a key is provided.");
    }
    
    this.initialized = true;
  }

  async chat(prompt: string, history: Message[], personaId: string = 'gemini', uid?: string, workspaceFiles: string[] = [], customPersonas: Persona[] = []): Promise<{ text: string; functionCalls?: any[] }> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'CHAT_RESULT') {
          resolve(e.data.payload);
        } else if (e.data.type === 'CHAT_ERROR') {
          reject(new Error(e.data.payload));
        }
      };
      this.worker.postMessage({ type: 'CHAT', payload: { prompt, history, personaId, uid, workspaceFiles, customPersonas } });
    });
  }

  private async callCustomApi(prompt: string, history: Message[], persona: Persona): Promise<{ text: string; functionCalls?: any[] }> {
    const response = await fetch(persona.customApiUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${persona.apiKey || this.customKeys.gemini || ''}`
      },
      body: JSON.stringify({
        model: persona.customModelId,
        messages: [
          ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content })),
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Custom API Error: ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json() as any;
    const text = data.choices?.[0]?.message?.content || "";
    
    return {
      text,
      functionCalls: []
    };
  }

  async testConnection(personaId: string = 'gemini', customKey?: string, customPersonas: Persona[] = []): Promise<{ success: boolean; message?: string }> {
    this.init(customPersonas);
    
    // Check if it's a custom persona
    const persona = [...PERSONAS, ...customPersonas].find(p => p.id === personaId);
    if (persona && persona.model === 'custom' && persona.customApiUrl) {
      try {
        const response = await fetch(persona.customApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${customKey || persona.apiKey || ''}`
          },
          body: JSON.stringify({
            model: persona.customModelId,
            messages: [{ role: 'user', content: 'Ping' }],
            stream: false
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return { success: false, message: `Custom API Error: ${response.statusText} ${JSON.stringify(errorData)}` };
        }
        return { success: true };
      } catch (e) {
        return { success: false, message: `Connection failed: ${e instanceof Error ? e.message : String(e)}` };
      }
    }
    
    let ai: GoogleGenAI | undefined;
    
    if (customKey) {
      try {
        ai = new GoogleGenAI({ apiKey: customKey.trim() });
      } catch (e) {
        return { success: false, message: `Invalid key format: ${e instanceof Error ? e.message : String(e)}` };
      }
    } else {
      ai = this.instances[personaId] || this.instances.gemini;
    }

    if (!ai) return { success: false, message: "AI instance not configured. Please provide an API key." };

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
        config: { maxOutputTokens: 5 }
      });
      
      if (response.text) {
        return { success: true };
      } else {
        return { success: false, message: "Received empty response from AI." };
      }
    } catch (err: any) {
      console.error(`Test Connection Error (${personaId}):`, err);
      let msg = err.message || String(err);
      if (msg.includes('API_KEY_INVALID')) msg = "Invalid API Key. Please check your key.";
      if (msg.includes('Quota exceeded')) msg = "Quota exceeded for this key.";
      return { success: false, message: msg };
    }
  }

  async speak(text: string): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'TTS_RESULT') {
          resolve(e.data.payload);
        } else if (e.data.type === 'TTS_ERROR') {
          reject(new Error(e.data.payload));
        }
      };
      this.worker.postMessage({ type: 'TTS', payload: { text } });
    });
  }

  private async extractMemories(userPrompt: string, aiResponse: string, uid: string) {
    this.init();
    // Only extract if the conversation seems to contain personal info or work details
    const combined = `${userPrompt}\n${aiResponse}`;
    if (combined.length < 50) return;

    try {
      const ai = this.instances.gemini;
      if (!ai) return;
      
      const extractionResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { 
            role: 'user', 
            parts: [{ text: `Extract key facts, preferences, or work-related details about the user from this interaction. 
            Focus on:
            - User's name, role, or profession.
            - User's work projects or tasks mentioned.
            - User's preferences (coding style, language, tools).
            - Important milestones or commitments.
            
            Return a JSON array of objects with 'content' (string), 'importance' (number 1-5), and 'tags' (array of strings, e.g., 'user_profile', 'work', 'preference').
            If no new facts are found, return an empty array [].
            
            Interaction:
            User: ${userPrompt}
            AI: ${aiResponse}` }] 
          }
        ],
        config: {
          responseMimeType: "application/json",
          systemInstruction: "You are a memory extraction engine. Be concise and factual. Tag 'user_profile' for personal info and 'work' for professional details."
        }
      });

      const memories = JSON.parse(extractionResponse.text || "[]");
      if (Array.isArray(memories)) {
        for (const m of memories) {
          if (m.content && typeof m.content === 'string' && m.content.length > 5) {
            await memoryService.addMemory(uid, m.content, m.importance || 3, m.tags || []);
          }
        }
      }
    } catch (err) {
      console.error("Memory Extraction Error:", err);
    }
  }

  async generateSuggestions(history: Message[], persona: Persona): Promise<string[]> {
    this.init();
    const ai = this.instances.gemini;
    if (!ai) return [];

    const prompt = `Given the following conversation history and the active persona, suggest 3 short, contextually relevant follow-up questions or actions for the user.
    
    Persona: ${persona.name} - ${persona.description}
    
    Conversation History:
    ${history.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Return the suggestions as a JSON array of strings.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        }
      });

      return JSON.parse(response.text || "[]");
    } catch (err) {
      console.error("Suggestion Generation Error:", err);
      return [];
    }
  }
}

export const aiService = new AIService();

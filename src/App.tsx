import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Terminal as TerminalIcon, 
  Settings as SettingsIcon, 
  RefreshCw,
  Sparkles, 
  Users, 
  Cpu, 
  Wifi, 
  WifiOff,
  Trash2,
  ChevronRight,
  Command,
  Plus,
  Languages,
  Activity,
  Shield,
  Zap,
  CheckCircle2,
  Circle,
  X,
  Volume2,
  Loader2,
  FolderOpen,
  FileText,
  ArrowDown,
  Brain,
  Code,
  Globe,
  Share2,
  Lock,
  Eye,
  Database,
  Layers,
  Box,
  Cpu as CpuIcon,
  Bot,
  PanelLeft,
  MessageSquare,
  Edit2,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { aiService, PERSONAS, MODELS, Message, Persona } from './services/ai';
import { memoryService, Memory } from './services/memory';
import { storageService } from './services/storage';
import { saveApiKey, getAllApiKeys } from './services/apiKeys';
import { localFileService } from './services/localFiles';
import { AdminDashboard } from './components/AdminDashboard';
import { Settings } from './components/Settings';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { get, set } from 'idb-keyval';
import { TerminalLine, AgentActivity, Conversation } from './types';

const TRANSLATIONS = {
  en: {
    nexus: 'Flix Gosts',
    personas: 'Personas',
    terminal: 'Terminal',
    settings: 'Settings',
    online: 'Online',
    offline: 'Offline',
    welcome: 'Welcome to Flix Gosts',
    welcomeDesc: 'Your advanced, stealth-mode personal AI assistant. Switch intelligence cores, use the phantom terminal, or just chat. Everything is encrypted and saved locally.',
    placeholder: 'Message {name}...',
    coreTerminal: 'Flix Gosts System Terminal',
    terminalWelcome: 'Welcome to Flix Gosts Core Terminal. Type \'help\' for commands.',
    clearConfirm: 'Clear all messages?',
    suggestions: ['Explain quantum physics', 'Write a React hook', 'Plan a workout', 'Analyze this code'],
    systemReport: '[SYSTEM REPORT]',
    network: 'Network',
    latency: 'Latency',
    activePersona: 'Active Core',
    memory: 'Memory',
    persistence: 'Persistence',
    successPersona: 'SUCCESS: Persona switched to',
    errorPersona: 'ERROR: Invalid persona. Available:',
    unknownCmd: 'ERROR: Unknown command',
    helpCmd: 'Available commands:\n- help: Show this list\n- clear: Clear terminal history\n- status: Check system & AI status\n- persona [id]: Switch active AI persona\n- info: Version information\n- date: Current system time\n- echo [text]: Repeat text\n- mcp: List connected Model Context Protocols\n- install [id] [name] [instruction]: Install a new AI persona',
    infoCmd: 'Flix Gosts AI Assistant v1.0.0\nCore: Gemini 3 Flash\nArchitecture: PWA + IndexedDB\nSecurity: Local-First',
    mcpCmd: 'Connected MCPs:\n- Google Search Grounding: ACTIVE\n- Local Context Engine: ACTIVE\n- Personal Knowledge Base: ACTIVE',
    agentActivity: 'Agent Activity',
    customization: 'Customization',
    capabilities: 'Capabilities',
    systemInstruction: 'System Instruction',
    save: 'Save Changes',
    cancel: 'Cancel',
    editPersona: 'Edit Persona',
    activityLog: 'Activity Log',
    apiStatus: 'API Status',
    keyActive: 'Active',
    keyMissing: 'Using Default',
    memoryTitle: 'Long-term Memory',
    memoryDesc: 'What Flix Gosts knows about you and your work.',
    clearMemory: 'Clear Memory',
    memoryEmpty: 'No memories yet. Start chatting to build context.',
    stored: 'Memories Stored',
    clear: 'Clear All',
    noMemories: 'No memories found in this category.',
    speak: 'Speak',
    stop: 'Stop',
    retry: 'Retry',
    login: 'Login with Google',
    email: 'Email Address',
    password: 'Password',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    logout: 'Logout',
    storageMode: 'Storage Mode',
    localOnly: 'Local Only (IndexedDB)',
    cloudSync: 'Cloud Sync (Supabase)',
    storageDesc: 'Choose where to store your data. Local mode works without a database.',
    sqlSchema: 'SQL Schema',
    copySchema: 'Copy SQL Schema',
    schemaCopied: 'Schema copied to clipboard!',
    schemaDesc: 'Run this SQL in your Supabase SQL Editor to create the required tables.',
    authRequired: 'Authentication Required',
    authDesc: 'Please login to access your personal AI assistant and sync your data across devices.',
    loginCancelled: 'Login was cancelled. Please try again.',
    cloudflareAI: 'Cloudflare Workers AI',
    turnstile: 'Cloudflare Turnstile',
    workspace: 'Workspace',
    openWorkspace: 'Open Folder',
    workspaceEmpty: 'No folder selected',
    workspaceFiles: 'Files',
    enterPin: 'Enter Admin PIN',
    wrongPin: 'Incorrect PIN. Access Denied.',
    changePin: 'Change Admin PIN',
    newPin: 'New PIN',
    pinChanged: 'PIN updated successfully',
    admin: 'Admin',
    apiKeys: 'API Keys',
    saveKeys: 'Save Keys',
    clearKeys: 'Clear All Keys',
    resetKeys: 'Reset to Default',
    keysCleared: 'All custom keys cleared.',
    keysReset: 'Keys reset to environment defaults.',
    modelInstalled: 'Model installed successfully',
    installCmd: 'install [id] [name] [instruction]: Install a new AI persona',
    agents: 'Agents',
    models: 'Models',
    general: 'General',
    storage: 'Storage',
    addAgent: 'Add New Agent',
    agentName: 'Agent Name',
    agentIcon: 'Agent Icon',
    agentModel: 'Intelligence Core',
    agentDesc: 'Agent Description',
    agentInstruction: 'System Instruction',
    agentCapabilities: 'Capabilities (comma separated)',
    deleteAgent: 'Delete Agent',
    noAgents: 'No agents found. Create your first intelligence core to start.',
    createFirstAgent: 'Create First Agent',
    duplicateAgent: 'Duplicate',
    exportAgents: 'Export Agents',
    importAgents: 'Import Agents',
    agentDeleted: 'Agent deleted successfully',
    agentSaved: 'Agent saved successfully',
    modelStatus: 'Model Status',
    modelDesc: 'Model Description',
    apiKey: 'API Key',
    testConnection: 'Test Connection',
    saveAgent: 'Save Agent',
    cancelAgent: 'Cancel',
    customModelId: 'Custom Model ID',
    customApiUrl: 'Custom API Endpoint (LLC/API)',
    agentApiKey: 'API Key (Optional)',
    mcpEnabled: 'Enable MCP (Model Context Protocol)',
    newChat: 'New Chat',
    installApp: 'Install App',
    installAppDesc: 'Download Flix Gosts to your device for faster access.',
    conversations: 'Conversations',
    deleteChat: 'Delete Conversation',
    confirmDeleteChat: 'Are you sure you want to delete this conversation?',
    noConversations: 'No conversations yet',
    chatOptions: 'Chat Options',
    foldChat: 'Fold Sidebar',
    unfoldChat: 'Unfold Sidebar',
  },
  ar: {
    nexus: 'فليكس جوستس',
    personas: 'الشخصيات',
    terminal: 'الطرفية',
    settings: 'الإعدادات',
    online: 'متصل',
    offline: 'غير متصل',
    welcome: 'مرحباً بك في فليكس جوستس',
    welcomeDesc: 'مساعدك الشخصي المتطور بنمط التخفي. بدّل أنوية الذكاء، استخدم الطرفية الشبحية، أو ابدأ الدردشة. كل شيء مشفر ومحفوظ محلياً.',
    placeholder: 'أرسل رسالة إلى {name}...',
    coreTerminal: 'طرفية نظام فليكس جوستس',
    terminalWelcome: 'مرحباً بك في طرفية فليكس جوستس. اكتب \'help\' لعرض الأوامر.',
    clearConfirm: 'هل تريد مسح جميع الرسائل؟',
    suggestions: ['اشرح ميكانيكا الكم', 'اكتب خطاف React', 'خطط لتمارين رياضية', 'حلل هذا الكود'],
    systemReport: '[تقرير النظام]',
    network: 'الشبكة',
    latency: 'التأخير',
    activePersona: 'النواة النشطة',
    memory: 'الذاكرة',
    persistence: 'الاستمرارية',
    successPersona: 'نجاح: تم التبديل إلى الشخصية',
    errorPersona: 'خطأ: شخصية غير صالحة. المتاح:',
    unknownCmd: 'خطأ: أمر غير معروف',
    helpCmd: 'الأوامر المتاحة:\n- help: عرض هذه القائمة\n- clear: مسح سجل الطرفية\n- status: التحقق من حالة النظام والذكاء الاصطناعي\n- persona [id]: تبديل الشخصية النشطة\n- info: معلومات الإصدار\n- date: وقت النظام الحالي\n- echo [text]: تكرار النص\n- mcp: عرض بروتوكولات سياق النماذج المتصلة\n- install [id] [name] [instruction]: تثبيت وكيل ذكاء اصطناعي جديد',
    infoCmd: 'مساعد فليكس جوستس الذكي v1.0.0\nالنواة: Gemini 3 Flash\nالمعمارية: PWA + IndexedDB\nالأمان: محلي أولاً',
    mcpCmd: 'بروتوكولات MCP المتصلة:\n- بحث جوجل: نشط\n- محرك السياق المحلي: نشط\n- قاعدة المعرفة الشخصية: نشط',
    agentActivity: 'نشاط الوكيل',
    customization: 'التخصيص',
    capabilities: 'القدرات',
    systemInstruction: 'تعليمات النظام',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    editPersona: 'تعديل الشخصية',
    activityLog: 'سجل النشاط',
    apiStatus: 'حالة الـ API',
    keyActive: 'نشط',
    keyMissing: 'استخدام الافتراضي',
    memoryTitle: 'الذاكرة طويلة المدى',
    memoryDesc: 'ما يعرفه فليكس جوستس عنك وعن عملك.',
    clearMemory: 'مسح الذاكرة',
    memoryEmpty: 'لا توجد ذكريات بعد. ابدأ الدردشة لبناء سياق.',
    stored: 'ذكرى محفوظة',
    clear: 'مسح الكل',
    noMemories: 'لا توجد ذكريات في هذه الفئة.',
    apiKeys: 'مفاتيح الـ API',
    saveKeys: 'حفظ المفاتيح',
    clearKeys: 'مسح جميع المفاتيح',
    resetKeys: 'إعادة التعيين للافتراضي',
    keysCleared: 'تم مسح جميع المفاتيح المخصصة.',
    keysReset: 'تم إعادة تعيين المفاتيح إلى القيم الافتراضية.',
    modelInstalled: 'تم تثبيت النموذج بنجاح',
    installCmd: 'install [id] [name] [instruction]: تثبيت شخصية ذكاء اصطناعي جديدة',
    speak: 'استماع',
    stop: 'توقف',
    retry: 'إعادة المحاولة',
    login: 'تسجيل الدخول بجوجل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    logout: 'تسجيل الخروج',
    storageMode: 'وضع التخزين',
    localOnly: 'محلي فقط (IndexedDB)',
    cloudSync: 'مزامنة سحابية (Supabase)',
    storageDesc: 'اختر مكان تخزين بياناتك. الوضع المحلي يعمل بدون قاعدة بيانات.',
    sqlSchema: 'مخطط SQL',
    copySchema: 'نسخ مخطط SQL',
    schemaCopied: 'تم نسخ المخطط!',
    schemaDesc: 'قم بتشغيل SQL هذا في محرر Supabase SQL لإنشاء الجداول المطلوبة.',
    authRequired: 'مطلوب تسجيل الدخول',
    authDesc: 'يرجى تسجيل الدخول للوصول إلى مساعدك الشخصي ومزامنة بياناتك عبر الأجهزة.',
    loginCancelled: 'تم إلغاء تسجيل الدخول. يرجى المحاولة مرة أخرى.',
    cloudflareAI: 'ذكاء كلاود فلير',
    turnstile: 'كلاود فلير تيرنستايل',
    workspace: 'مساحة العمل',
    openWorkspace: 'فتح مجلد',
    workspaceEmpty: 'لم يتم اختيار مجلد',
    workspaceFiles: 'الملفات',
    enterPin: 'أدخل رمز الدخول (PIN)',
    wrongPin: 'رمز غير صحيح. تم رفض الوصول.',
    changePin: 'تغيير رمز الدخول',
    newPin: 'رمز جديد',
    pinChanged: 'تم تحديث الرمز بنجاح',
    admin: 'الأدمن',
    agents: 'الوكلاء',
    models: 'النماذج',
    general: 'عام',
    storage: 'التخزين',
    addAgent: 'إضافة وكيل جديد',
    agentName: 'اسم الوكيل',
    agentIcon: 'أيقونة الوكيل',
    agentModel: 'نواة الذكاء',
    agentDesc: 'وصف الوكيل',
    agentInstruction: 'تعليمات النظام',
    agentCapabilities: 'القدرات (مفصولة بفاصلة)',
    deleteAgent: 'حذف الوكيل',
    noAgents: 'لم يتم العثور على وكلاء. أنشئ أول نواة ذكاء للبدء.',
    createFirstAgent: 'أنشئ أول وكيل',
    duplicateAgent: 'تكرار',
    exportAgents: 'تصدير الوكلاء',
    importAgents: 'استيراد الوكلاء',
    agentDeleted: 'تم حذف الوكيل بنجاح',
    agentSaved: 'تم حفظ الوكيل بنجاح',
    modelStatus: 'حالة النموذج',
    modelDesc: 'وصف النموذج',
    apiKey: 'مفتاح الـ API',
    testConnection: 'اختبار الاتصال',
    saveAgent: 'حفظ الوكيل',
    cancelAgent: 'إلغاء',
    customModelId: 'معرف النموذج المخصص',
    customApiUrl: 'نقطة نهاية API مخصصة (LLC/API)',
    agentApiKey: 'مفتاح API (اختياري)',
    mcpEnabled: 'تفعيل MCP (بروتوكول سياق النموذج)',
    newChat: 'محادثة جديدة',
    installApp: 'تحميل التطبيق',
    installAppDesc: 'قم بتحميل فليكس جوستس على جهازك للوصول السريع.',
    conversations: 'المحادثات',
    deleteChat: 'حذف المحادثة',
    confirmDeleteChat: 'هل أنت متأكد من حذف هذه المحادثة؟',
    noConversations: 'لا توجد محادثات بعد',
    chatOptions: 'خيارات المحادثة',
    foldChat: 'طى القائمة',
    unfoldChat: 'إظهار القائمة',
  }
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="text-red-500" size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">System Failure</h1>
            <p className="text-white/60 text-sm leading-relaxed">
              An unexpected error has occurred. The system has been halted to prevent data corruption.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-left overflow-auto max-h-40">
              <code className="text-[10px] text-red-400 font-mono">
                {this.state.error?.message || "Unknown Error"}
              </code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
            >
              Reboot System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [currentPersona, setCurrentPersona] = useState(PERSONAS.length > 0 ? PERSONAS[0].id : '');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [adminNewUser, setAdminNewUser] = useState({ username: '', pin: '', role: 'user' as 'admin' | 'user' });
  const [terminalLines, setTerminalLines] = useState<TerminalLine[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isAiReady, setIsAiReady] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'ar'>('ar');
  const [memoryOption, setMemoryOption] = useState<'standard' | 'skills'>('standard');
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [customPersonas, setCustomPersonas] = useState<Persona[]>(PERSONAS);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLocalOnly, setIsLocalOnly] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const syncCleanupRef = useRef<() => void>(() => {});
  const [pin, setPin] = useState('');
  const [adminPin, setAdminPin] = useState('135790');
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    gemini: '',
    ace3: '',
    group: '',
    cf: ''
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<{ rootPath: string | null, files: string[] }>({ rootPath: null, files: [] });
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'agents' | 'models' | 'storage' | 'admin'>('general');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isConvSidebarOpen, setIsConvSidebarOpen] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [promptModal, setPromptModal] = useState<{ title: string; message: string; defaultValue: string; onConfirm: (value: string) => void } | null>(null);
  
  const t = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  useEffect(() => {
    (window as any).onTurnstileSuccess = (token: string) => {
      setTurnstileToken(token);
    };
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async (text: string, messageId: string) => {
    if (speakingId === messageId) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setSpeakingId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    try {
      setSpeakingId(messageId);
      const audioBase64 = await aiService.speak(text);
      if (audioBase64) {
        const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => {
          setSpeakingId(null);
          audioRef.current = null;
        };
        audio.play();
      } else {
        setSpeakingId(null);
      }
    } catch (err) {
      console.error("Speak Error:", err);
      setSpeakingId(null);
    }
  };

  const handleShare = async (title: string, text: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${title}\n\n${text}`);
      showToast(lang === 'ar' ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard', 'success');
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === adminPin) {
      setIsAuthenticated(true);
      await set('isAuthenticated', true);
      const adminId = 'admin-001';
      setUser({ id: adminId, email: 'admin@local' } as any);
      memoryService.init(adminId, (updatedMemories) => {
        setMemories(updatedMemories);
      });
      const cleanup = await syncConversations(adminId);
      syncCleanupRef.current = cleanup;
      setLoginError(null);
    } else {
      setLoginError(t.wrongPin);
    }
  };

  const handleNewConversation = async () => {
    if (!user) return;
    const uid = user.id;
    const newConv: Conversation = {
      id: generateId(),
      user_id: uid,
      title: t.newChat,
      timestamp: Date.now()
    };
    await storageService.insert('conversations', [newConv]);
    setCurrentConversationId(newConv.id);
  };

  const handleDeleteConversation = async (id: string) => {
    setConfirmModal({
      title: t.deleteChat,
      message: t.confirmDeleteChat,
      onConfirm: async () => {
        await storageService.delete('conversations', { eq: ['id', id] });
        if (currentConversationId === id) {
          const remaining = conversations.filter(c => c.id !== id);
          setCurrentConversationId(remaining.length > 0 ? remaining[0].id : null);
        }
        setConfirmModal(null);
        showToast(lang === 'ar' ? 'تم حذف المحادثة' : 'Conversation deleted', 'success');
      }
    });
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    await set('isAuthenticated', false);
    setMessages([]);
    setMemories([]);
    syncCleanupRef.current();
    syncCleanupRef.current = () => {};
  };

  const handleAddUser = async () => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminNewUser),
    });
    if (response.ok) {
      showToast('User added successfully', 'success');
      setAdminNewUser({ username: '', pin: '', role: 'user' });
    } else {
      const error = await response.json();
      showToast('Error adding user: ' + (error as any).error, 'error');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const updatePin = async (newPin: string) => {
    const { error } = await storageService.upsert('settings', { key: 'admin_pin', value: newPin }, { on: 'key' });
    
    if (!error) {
      setAdminPin(newPin);
      showToast(t.pinChanged, 'success');
    } else {
      showToast("Error updating PIN: " + (error.message || error), 'error');
    }
  };

  const handleSaveAgent = async (persona: Persona) => {
    // Validation
    if (!persona.name.trim()) {
      showToast(lang === 'ar' ? 'اسم الوكيل مطلوب' : 'Agent name is required', 'error');
      return;
    }
    if (!persona.systemInstruction.trim()) {
      showToast(lang === 'ar' ? 'تعليمات النظام مطلوبة' : 'System instruction is required', 'error');
      return;
    }

    const { error } = await storageService.upsert('custom_personas', {
      id: persona.id,
      name: persona.name,
      description: persona.description,
      system_instruction: persona.systemInstruction,
      avatar: persona.icon,
      capabilities: persona.capabilities,
      model: persona.model,
      custom_model_id: persona.customModelId,
      custom_api_url: persona.customApiUrl,
      api_key: persona.apiKey,
      mcp_enabled: persona.mcpEnabled,
      user_id: user?.id
    }, { on: 'id' });

    if (!error) {
      setCustomPersonas(prev => {
        const exists = prev.find(p => p.id === persona.id);
        if (exists) return prev.map(p => p.id === persona.id ? persona : p);
        return [...prev, persona];
      });
      setEditingPersona(null);
      showToast(t.agentSaved, 'success');
    } else {
      showToast((lang === 'ar' ? 'خطأ في حفظ الوكيل: ' : 'Error saving agent: ') + (error.message || error), 'error');
    }
  };

  const handleDeleteAgent = async (id: string) => {
    const { error } = await storageService.delete('custom_personas', { eq: ['id', id] });
    if (!error) {
      setCustomPersonas(prev => prev.filter(p => p.id !== id));
      if (currentPersona === id) {
        const remaining = customPersonas.filter(p => p.id !== id);
        setCurrentPersona(remaining.length > 0 ? remaining[0].id : '');
      }
      showToast(t.agentDeleted, 'success');
    } else {
      showToast("Error deleting agent: " + (error.message || error), 'error');
    }
  };

  const updateApiKeys = async (newKeys: Record<string, string>) => {
    if (!user) return;
    try {
      for (const [service, key] of Object.entries(newKeys)) {
        if (key) {
          await saveApiKey(user.id, service, key);
        }
      }
      setApiKeys(newKeys);
      aiService.setKeys(newKeys);
      showToast(t.save, 'success');
      
      // Re-check AI readiness
      setIsAiReady(null);
      const result = await aiService.testConnection();
      setIsAiReady(result.success);
    } catch (error: any) {
      showToast("Error updating keys: " + (error.message || error), 'error');
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAi = async () => {
      const result = await aiService.testConnection();
      setIsAiReady(result.success);
    };
    if (isAuthReady) {
      checkAi();
    }
  }, [isAuthReady]);

  // Auth and Data Sync
  useEffect(() => {
    if (isAuthenticated && user && currentConversationId) {
      let cleanup: () => void = () => {};
      const startSync = async () => {
        const uid = user.id;
        cleanup = await syncMessages(uid, currentConversationId);
      };
      startSync();
      return () => cleanup();
    }
  }, [isAuthenticated, user, currentConversationId]);

  useEffect(() => {
    const checkAuth = async () => {
      const savedAuth = await get('isAuthenticated');
      if (savedAuth) setIsAuthenticated(true);
      
      const localOnly = await storageService.isLocalOnly();
      setIsLocalOnly(localOnly);
      
      // Fetch current PIN
      try {
        const { data: pinData } = await storageService.query<any>('settings', {
          eq: ['key', 'admin_pin'],
          limit: 1
        });
        
        if (pinData && pinData.length > 0) setAdminPin(pinData[0].value);

        // Fetch API Keys
        if (user) {
          const keysData = await getAllApiKeys(user.id);
          if (keysData && typeof keysData === 'object') {
            setApiKeys(keysData as Record<string, string>);
            aiService.setKeys(keysData as Record<string, string>);
          }
        }

        // Fetch Custom Personas
        const { data: personasData } = await storageService.query<any>('custom_personas', {});
        
        if (personasData && personasData.length > 0) {
          const mappedPersonas: Persona[] = personasData.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description || `Custom Persona: ${p.name}`,
            systemInstruction: p.system_instruction,
            icon: p.avatar || 'Zap',
            capabilities: p.capabilities || ['Custom Intelligence'],
            model: p.model || 'gemini-3-flash-preview',
            customModelId: p.custom_model_id,
            customApiUrl: p.custom_api_url,
            apiKey: p.api_key,
            mcpEnabled: p.mcp_enabled
          }));
          setCustomPersonas(mappedPersonas);
          setCurrentPersona(mappedPersonas[0].id);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
      
      // For single user mode, we use a fixed Admin ID
      const adminId = 'admin-001';
      setUser({ id: adminId, email: 'admin@flixgosts.ai', user_metadata: { full_name: 'Admin' } } as any);
      
      if (savedAuth) {
        memoryService.init(adminId, (updatedMemories) => {
          setMemories(updatedMemories);
        });
        const cleanup = await syncConversations(adminId);
        syncCleanupRef.current = cleanup;
      }
      setIsAuthReady(true);
    };
    
    checkAuth();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      syncCleanupRef.current();
    };
  }, []);

  const syncMessages = async (uid: string, conversationId: string | null) => {
    const fetchMessages = async () => {
      const queryParams: any = {
        eq: ['user_id', uid],
        order: ['timestamp', { ascending: true }]
      };
      
      if (conversationId) {
        queryParams.eq = ['conversation_id', conversationId];
      } else {
        // If no conversationId, we might want to show messages that have no conversation_id
        // or just return empty. Usually we want a conversation.
        queryParams.is = ['conversation_id', 'null'];
      }

      const { data } = await storageService.query<any>('messages', queryParams);
      setMessages(data || []);
    };

    // Initial fetch
    await fetchMessages();
    setTimeout(() => scrollToBottom('auto'), 100);

    // Subscribe to local changes
    const unsubLocal = storageService.subscribe('messages', (allMessages) => {
      const filtered = allMessages
        .filter((m: any) => m.user_id === uid && (conversationId ? m.conversation_id === conversationId : !m.conversation_id))
        .sort((a: any, b: any) => a.timestamp - b.timestamp);
      setMessages(filtered);
    });

    // Subscribe to Supabase changes (only if not local only)
    const localOnly = await storageService.isLocalOnly();
    let unsubSupabase = () => {};
    
    if (!localOnly) {
      const channel = supabase
        .channel(`messages-changes-${conversationId || 'none'}`)
        .on(
          'postgres_changes',
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages', 
            filter: conversationId ? `conversation_id=eq.${conversationId}` : `user_id=eq.${uid}` 
          },
          () => fetchMessages()
        )
        .subscribe();
      
      unsubSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    return () => {
      unsubLocal();
      unsubSupabase();
    };
  };

  const syncConversations = async (uid: string) => {
    const fetchConversations = async () => {
      const { data } = await storageService.query<Conversation>('conversations', {
        eq: ['user_id', uid],
        order: ['timestamp', { ascending: false }]
      });
      setConversations(data || []);
      
      // If we have conversations but no current one selected, select the first one
      if (data && data.length > 0 && !currentConversationId) {
        setCurrentConversationId(data[0].id);
      }
    };

    await fetchConversations();

    const unsubLocal = storageService.subscribe('conversations', (all) => {
      const filtered = all
        .filter((c: any) => c.user_id === uid)
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
      setConversations(filtered);
    });

    const localOnly = await storageService.isLocalOnly();
    let unsubSupabase = () => {};
    
    if (!localOnly) {
      const channel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${uid}` },
          () => fetchConversations()
        )
        .subscribe();
      
      unsubSupabase = () => {
        supabase.removeChannel(channel);
      };
    }

    return () => {
      unsubLocal();
      unsubSupabase();
    };
  };

  // Load other local state
  useEffect(() => {
    const loadLocalState = async () => {
      const savedTerminal = await get('terminal');
      const savedLang = await get('lang');
      const savedPersonas = await get('customPersonas');
      const savedPersona = await get('currentPersona');
      const savedConvId = await get('currentConversationId');
      const savedSidebar = await get('isConvSidebarOpen');
      
      if (savedTerminal) setTerminalLines(savedTerminal);
      if (savedLang) setLang(savedLang);
      if (savedPersonas) setCustomPersonas(savedPersonas);
      if (savedPersona) setCurrentPersona(savedPersona);
      if (savedConvId) setCurrentConversationId(savedConvId);
      if (savedSidebar !== undefined) setIsConvSidebarOpen(savedSidebar);
    };
    loadLocalState();
  }, []);

  // Save state to IndexedDB (only non-Firebase state)
  useEffect(() => { set('terminal', terminalLines); }, [terminalLines]);
  useEffect(() => { set('lang', lang); }, [lang]);
  useEffect(() => { set('customPersonas', customPersonas); }, [customPersonas]);
  useEffect(() => { set('currentPersona', currentPersona); }, [currentPersona]);
  useEffect(() => { set('currentConversationId', currentConversationId); }, [currentConversationId]);
  useEffect(() => { set('isConvSidebarOpen', isConvSidebarOpen); }, [isConvSidebarOpen]);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(atBottom);
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    if (isAtBottom || messages.length > 0) {
      scrollToBottom(messages.length <= 5 ? 'auto' : 'smooth');
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'model') {
      const persona = customPersonas.find(p => p.id === currentPersona) || PERSONAS.find(p => p.id === currentPersona);
      if (persona) {
        aiService.generateSuggestions(messages, persona).then(setSuggestions);
      }
    }
  }, [messages, currentPersona]);

  useEffect(() => {
    // Initial scroll after a short delay to ensure rendering is complete
    const timer = setTimeout(() => scrollToBottom('auto'), 500);
    return () => clearTimeout(timer);
  }, [isAuthReady]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLines]);

  const addActivity = (step: string, status: 'pending' | 'running' | 'completed' | 'error' = 'running') => {
    const newActivity: AgentActivity & { id: string } = {
      id: generateId(),
      step,
      status,
      timestamp: Date.now()
    };
    setAgentActivities(prev => [newActivity, ...prev].slice(0, 10));
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt || isLoading || !user) return;

    if (isAiReady === false && !isOffline) {
      showToast(lang === 'ar' ? "الذكاء الاصطناعي غير متصل. يرجى التحقق من الإعدادات." : "AI is offline. Please check your settings.", 'error');
      return;
    }

    const uid = user.id;
    const userMessage: Message = {
      id: generateId(),
      user_id: uid,
      conversation_id: currentConversationId || undefined,
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    } as any;

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Save user message
      const { error: userMsgError } = await storageService.insert('messages', [{ 
        user_id: uid, 
        conversation_id: currentConversationId,
        role: 'user', 
        content: prompt, 
        timestamp: Date.now() 
      }]);

      if (userMsgError) throw userMsgError;

      // Update conversation last message and timestamp
      if (currentConversationId) {
        await storageService.upsert('conversations', {
          id: currentConversationId,
          last_message: prompt.substring(0, 50),
          timestamp: Date.now()
        }, { on: 'id' });
      }

      if (isOffline) {
        addActivity(lang === 'ar' ? 'فحص الاتصال...' : 'Checking connection...', 'error');
        const offlineContent = lang === 'ar' 
          ? "أنا حالياً في وضع عدم الاتصال. لا يزال بإمكاني المساعدة في المهام المحلية، لكن قدراتي المتقدمة في الذكاء الاصطناعي تتطلب اتصالاً بالإنترنت. سيتم حفظ رسائلك."
          : "I am currently in offline mode. I can still help with local tasks, but my advanced AI capabilities require an internet connection. Your messages will be saved.";
        
        const offlineMessage: Message = {
          id: generateId(),
          user_id: user.id,
          role: 'model',
          content: offlineContent,
          timestamp: Date.now(),
          persona: currentPersona
        } as any;

        setMessages(prev => [...prev, offlineMessage]);

        await storageService.insert('messages', [{ 
          user_id: user.id, 
          role: 'model', 
          content: offlineContent, 
          timestamp: Date.now(),
          persona: currentPersona
        }]);
      } else {
        addActivity(lang === 'ar' ? 'تحليل الطلب...' : 'Analyzing request...');
        await new Promise(r => setTimeout(r, 800));
        addActivity(lang === 'ar' ? 'استرجاع السياق...' : 'Retrieving context...');
        
        let { text, functionCalls } = await aiService.chat(prompt, messages, currentPersona, user.id, workspace.files, customPersonas);
        setIsAiReady(true);
        
        let currentText = text;
        let currentFunctionCalls = functionCalls;
        let iteration = 0;
        const maxIterations = 3;

        while ((currentFunctionCalls && currentFunctionCalls.length > 0) && iteration < maxIterations) {
          iteration++;
          const toolResults: string[] = [];

          for (const call of currentFunctionCalls) {
            if (call.name === 'execute_shell_command') {
              addActivity(lang === 'ar' ? 'تنفيذ أمر النظام...' : 'Executing system command...');
              const cmd = call.args.command;
              
              setTerminalLines(prev => [...prev, {
                id: generateId(),
                type: 'input',
                content: `[AI] ${cmd}`,
                timestamp: Date.now()
              }]);

              try {
                const shellRes = await fetch('/api/shell', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ command: cmd })
                });
                const shellData = await shellRes.json() as { stdout?: string; stderr?: string; error?: string };
                const output = shellData.stdout || shellData.stderr || shellData.error || "No output";
                
                setTerminalLines(prev => [...prev, {
                  id: generateId(),
                  type: shellData.error ? 'error' : 'output',
                  content: output,
                  timestamp: Date.now()
                }]);
                toolResults.push(`[SHELL OUTPUT for ${cmd}]:\n${output}`);
              } catch (err) {
                console.error("Shell error:", err);
                toolResults.push(`[SHELL ERROR for ${cmd}]: ${err}`);
              }
            } else if (call.name === 'read_local_file') {
              addActivity(lang === 'ar' ? 'قراءة ملف محلي...' : 'Reading local file...');
              const content = await localFileService.readFile(call.args.path);
              if (content) {
                addActivity(lang === 'ar' ? 'تمت قراءة الملف' : 'File read successfully', 'completed');
                setTerminalLines(prev => [...prev, {
                  id: generateId(),
                  type: 'output',
                  content: `[READ] ${call.args.path}: ${content.substring(0, 100)}...`,
                  timestamp: Date.now()
                }]);
                toolResults.push(`[FILE CONTENT for ${call.args.path}]:\n${content}`);
              } else {
                addActivity(lang === 'ar' ? 'فشل قراءة الملف' : 'Failed to read file', 'error');
                toolResults.push(`[FILE READ ERROR]: Could not read ${call.args.path}`);
              }
            } else if (call.name === 'write_local_file') {
              addActivity(lang === 'ar' ? 'كتابة ملف محلي...' : 'Writing local file...');
              const success = await localFileService.writeFile(call.args.path, call.args.content);
              if (success) {
                addActivity(lang === 'ar' ? 'تمت كتابة الملف' : 'File written successfully', 'completed');
                setTerminalLines(prev => [...prev, {
                  id: generateId(),
                  type: 'output',
                  content: `[WRITE] ${call.args.path} success`,
                  timestamp: Date.now()
                }]);
                toolResults.push(`[FILE WRITE SUCCESS]: ${call.args.path}`);
              } else {
                addActivity(lang === 'ar' ? 'فشل كتابة الملف' : 'Failed to write file', 'error');
                toolResults.push(`[FILE WRITE ERROR]: Could not write to ${call.args.path}`);
              }
            }
          }

          if (toolResults.length > 0) {
            addActivity(lang === 'ar' ? 'معالجة نتائج الأدوات...' : 'Processing tool results...');
            const toolPrompt = `Tool Results:\n${toolResults.join('\n\n')}\n\nPlease provide your final response based on these results.`;
            const nextTurn = await aiService.chat(toolPrompt, [...messages, { role: 'model', content: currentText || "Executing tools..." } as any], currentPersona, user.id, workspace.files, customPersonas);
            setIsAiReady(true);
            currentText = nextTurn.text;
            currentFunctionCalls = nextTurn.functionCalls;
          }
        }

        if (!currentText && (!currentFunctionCalls || currentFunctionCalls.length === 0)) {
          throw new Error("AI returned empty response");
        }

        const aiContent = currentText || (lang === 'ar' ? "تم تنفيذ الأمر بنجاح." : "Command executed successfully.");

        const aiMessage: Message = { 
          id: generateId(),
          user_id: uid, 
          conversation_id: currentConversationId || undefined,
          role: 'model', 
          content: aiContent, 
          timestamp: Date.now(),
          persona: currentPersona
        } as any;

        setMessages(prev => [...prev, aiMessage]);
        
        await storageService.insert('messages', [{ 
          user_id: uid, 
          conversation_id: currentConversationId,
          role: 'model', 
          content: aiContent, 
          timestamp: Date.now(),
          persona: currentPersona
        }]);

        addActivity(lang === 'ar' ? 'اكتملت المهمة' : 'Task completed', 'completed');
      }
    } catch (error: any) {
      console.error("Chat Error:", error);
      addActivity(lang === 'ar' ? 'فشل المعالجة' : 'Processing failed', 'error');
      
      const isConnectionError = error.message?.includes('API_KEY_INVALID') || 
                                error.message?.includes('not configured') ||
                                error.message?.includes('Failed to fetch') ||
                                error.message?.includes('NetworkError');
      
      if (isConnectionError) {
        setIsAiReady(false);
      }
      
      let errorText = lang === 'ar' 
        ? `خطأ: ${error.message || "فشل الاتصال بخدمة الذكاء الاصطناعي. يرجى التحقق من مفتاح API والاتصال."}`
        : `Error: ${error.message || "Failed to connect to AI service. Please check your API key and connection."}`;

      if (error.message === 'QUOTA_EXCEEDED') {
        errorText = lang === 'ar'
          ? "خطأ: تم تجاوز حصة الاستخدام (Quota). يرجى الانتظار بضع دقائق أو إضافة مفتاح API خاص بك في الإعدادات لزيادة الحدود."
          : "Error: API Quota exceeded. Please wait a few minutes or add your own API key in settings to increase limits.";
      }

      // Check if it's a Firestore permission error
      if (error.message && error.message.includes('permission-denied')) {
        errorText = lang === 'ar'
          ? "خطأ: ليس لديك صلاحية لحفظ الرسائل. يرجى مراجعة قواعد الأمان."
          : "Error: You don't have permission to save messages. Please check security rules.";
      }

      const errorMessage: Message = {
        id: generateId(),
        role: 'system',
        content: errorText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeCommand = (cmd: string) => {
    const newLine: TerminalLine = {
      id: generateId(),
      type: 'input',
      content: cmd,
      timestamp: Date.now()
    };
    setTerminalLines(prev => [...prev, newLine]);

    let output = '';
    let type: 'output' | 'error' = 'output';

    const args = cmd.split(' ');
    const command = args[0].toLowerCase();

    switch (command) {
      case 'help': output = t.helpCmd + '\n- ' + t.installCmd; break;
      case 'install':
        const id = args[1];
        const name = args[2];
        const model = args[3] || 'gemini-3-flash-preview';
        const instruction = args.slice(4).join(' ');
        if (id && name && instruction) {
          const newPersona: Persona = {
            id,
            name,
            description: `Installed via terminal: ${name}`,
            systemInstruction: instruction,
            icon: 'Zap',
            capabilities: ['Custom Intelligence'],
            model: model
          };
          setCustomPersonas(prev => [...prev, newPersona]);
          
          // Save
          storageService.upsert('custom_personas', {
            id,
            user_id: user.id,
            name,
            role: 'Custom',
            system_instruction: instruction,
            capabilities: ['Custom Intelligence'],
            model: model
          }, { on: 'id' }).then(({ error }) => {
            if (error) console.error("Error saving persona:", error);
          });

          output = `${t.modelInstalled}: ${name} (${id}) [${model}]`;
        } else {
          output = 'Usage: install [id] [name] [model] [instruction]';
          type = 'error';
        }
        break;
      case 'clear': setTerminalLines([]); return;
      case 'mcp': output = t.mcpCmd; break;
      case 'status':
        output = `${t.systemReport}\n${t.network}: ${isOffline ? t.offline : t.online}\n${t.latency}: ${Math.round(Math.random() * 50 + 20)}ms\n${t.activePersona}: ${currentPersona.toUpperCase()}\n${t.memory}: Local (IndexedDB)\n${t.persistence}: Enabled`;
        break;
      case 'date': output = new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US'); break;
      case 'echo': output = args.slice(1).join(' '); break;
      case 'persona':
        if (args[1] && customPersonas.some(p => p.id === args[1])) {
          setCurrentPersona(args[1]);
          output = `${t.successPersona} ${args[1].toUpperCase()}`;
        } else {
          output = `${t.errorPersona} ${customPersonas.map(p => p.id).join(', ')}`;
          type = 'error';
        }
        break;
      case 'info': output = t.infoCmd; break;
      default:
        output = `${t.unknownCmd} '${command}'. Type 'help' for assistance.`;
        type = 'error';
    }

    setTerminalLines(prev => [...prev, {
      id: generateId(),
      type,
      content: output,
      timestamp: Date.now()
    }]);
  };

  const personaIcons: Record<string, any> = { 
    Sparkles, 
    Users, 
    Cpu: CpuIcon, 
    Brain, 
    Code, 
    Globe, 
    Lock, 
    Eye, 
    Database, 
    Layers, 
    Box, 
    Bot 
  };

  if (!isAuthReady) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="text-white animate-spin" size={48} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-[#0a0a0a] border border-white/10 p-12 rounded-[3rem] text-center space-y-8 shadow-2xl"
        >
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-white/20">
            <Command size={40} className="text-black" />
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-black tracking-tighter">{t.enterPin}</h1>
            <p className="text-white/40 text-sm font-medium leading-relaxed">{t.authDesc}</p>
          </div>

          {loginError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold"
            >
              {loginError}
            </motion.div>
          )}

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                type="password"
                placeholder="PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-2xl tracking-[1em] focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              {t.signIn}
            </button>
          </form>

          <div className="flex items-center justify-center gap-4 pt-4">
            <button onClick={() => setLang('en')} className={`text-[10px] font-black uppercase tracking-widest ${lang === 'en' ? 'text-white' : 'text-white/20'}`}>English</button>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <button onClick={() => setLang('ar')} className={`text-[10px] font-black uppercase tracking-widest ${lang === 'ar' ? 'text-white' : 'text-white/20'}`}>العربية</button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 z-[70] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isSidebarOpen ? 'translate-x-0' : (isRtl ? 'translate-x-full' : '-translate-x-full')}
        md:relative md:translate-x-0
        w-72 md:w-64 ${isRtl ? 'border-l' : 'border-r'} border-white/5 flex flex-col bg-[#080808]/90 backdrop-blur-2xl ghost-glow
        ${isRtl ? 'right-0' : 'left-0'}
      `}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl shadow-white/20 group-hover:scale-110 transition-transform duration-300">
              <Command className="text-black w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-[0.2em] text-lg leading-none ghost-text">{t.nexus}</span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-white/30 mt-1">Advanced AI</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-white/20 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="flex items-center justify-between px-4 mb-6">
            <div className={`text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold ${isRtl ? 'text-right' : 'text-left'}`}>
              {t.personas}
            </div>
            <button 
              onClick={() => {
                setSettingsTab('agents');
                setIsSettingsOpen(true);
                setIsSidebarOpen(false);
              }}
              className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"
              title={t.addAgent}
            >
              <Plus size={14} />
            </button>
          </div>
          
          {customPersonas.length === 0 ? (
            <div className="px-4 py-8 text-center space-y-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-dashed border-white/10">
                <Bot size={24} className="text-white/20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/20 leading-relaxed">
                {t.noAgents}
              </p>
              <button 
                onClick={() => {
                  setSettingsTab('agents');
                  setIsSettingsOpen(true);
                  setIsSidebarOpen(false);
                }}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                <Plus size={12} className="inline mr-2" /> {t.addAgent}
              </button>
            </div>
          ) : customPersonas.map(persona => {
            const Icon = personaIcons[persona.icon] || Sparkles;
            const isActive = currentPersona === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => {
                  setCurrentPersona(persona.id);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all duration-500 group relative overflow-hidden ${
                  isActive 
                    ? 'bg-white text-black shadow-2xl shadow-white/20 scale-[1.02]' 
                    : 'hover:bg-white/5 text-white/40 hover:text-white'
                }`}
              >
                <div className={`relative z-10 p-2.5 rounded-2xl transition-all duration-500 ${isActive ? 'bg-black/5 rotate-12' : 'bg-white/5 group-hover:bg-white/10 group-hover:-rotate-12'}`}>
                  <Icon size={18} />
                </div>
                <div className={`relative z-10 flex-1 ${isRtl ? 'text-right' : 'text-left'}`}>
                  <div className="text-sm font-black tracking-tight">{persona.name}</div>
                  <div className={`text-[9px] uppercase tracking-[0.2em] font-black opacity-40 ${isActive ? 'text-black/60' : 'text-white/40'}`}>
                    {persona.model?.split('-')[1]?.toUpperCase() || 'CUSTOM'}
                  </div>
                </div>
                {isActive && (
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 w-2 h-2 rounded-full bg-black ml-auto shadow-xl shadow-black/20" 
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t border-white/5 space-y-2 bg-black/20">
          <button 
            onClick={() => {
              setIsMemoryOpen(true);
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-all group relative"
          >
            <Shield size={18} className="group-hover:text-emerald-400 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.memory}</span>
            {memories.length > 0 && (
              <span className="ml-auto bg-emerald-500/20 text-emerald-400 text-[9px] px-2 py-0.5 rounded-full font-black">
                {memories.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => {
              setLang(lang === 'en' ? 'ar' : 'en');
              setIsSidebarOpen(false);
            }}
            className="w-full flex items-center gap-4 p-3.5 rounded-2xl hover:bg-white/5 text-white/40 hover:text-white transition-all group"
          >
            <Languages size={18} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
          {/* System Status Widget */}
          <div className="p-4 bg-white/5 rounded-2xl space-y-3 mb-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30">System Status</div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Network:</span>
              <span className={isOffline ? "text-amber-400" : "text-emerald-400"}>{isOffline ? "Offline" : "Online"}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">AI:</span>
              <span className={isAiReady === true ? "text-purple-400" : isAiReady === false ? "text-red-400" : "text-white/30"}>
                {isAiReady === true ? "Ready" : isAiReady === false ? "Offline" : "Checking..."}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60">Persona:</span>
              <span className="text-white truncate max-w-[100px]">{customPersonas.find(p => p.id === currentPersona)?.name || 'Default'}</span>
            </div>
          </div>

          <button 
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
              isWorkspaceOpen ? 'bg-amber-500/10 text-amber-400' : 'hover:bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            <FolderOpen size={18} className="group-hover:text-amber-400 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.workspace}</span>
          </button>
          <button 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
              isTerminalOpen ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            <TerminalIcon size={18} className="group-hover:text-emerald-400 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.terminal}</span>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className={`w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group ${
              isSettingsOpen ? 'bg-white text-black' : 'hover:bg-white/5 text-white/40 hover:text-white'
            }`}
          >
            <SettingsIcon size={18} className="group-hover:text-white transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.settings}</span>
          </button>

          {deferredPrompt && (
            <button 
              onClick={handleInstall}
              className="w-full flex items-center gap-4 p-3.5 rounded-2xl transition-all group bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            >
              <ArrowDown size={18} className="group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">{t.installApp}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-4 md:px-6 bg-[#050505]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-white/5 rounded-lg text-white/60"
            >
              <Command size={20} />
            </button>
            <div className="flex items-center gap-2">
              {isOffline ? (
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/20">
                  <WifiOff size={12} /> {t.offline}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-400/10 px-3 py-1.5 rounded-full border border-emerald-400/20">
                  <Wifi size={12} /> {t.online}
                </div>
              )}
              {isAiReady === true ? (
                <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest bg-purple-400/10 px-3 py-1.5 rounded-full border border-purple-400/20">
                  <Bot size={12} /> {lang === 'ar' ? 'الذكاء جاهز' : 'AI Ready'}
                </div>
              ) : isAiReady === false ? (
                <button 
                  onClick={async () => {
                    setIsAiReady(null);
                    const result = await aiService.testConnection();
                    setIsAiReady(result.success);
                    if (!result.success) {
                      showToast(lang === 'ar' ? `فشل الاتصال: ${result.message}` : `AI Connection Failed: ${result.message}`, 'error');
                    }
                  }}
                  className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-widest bg-red-400/10 px-3 py-1.5 rounded-full border border-red-400/20 hover:bg-red-400/20 transition-all"
                >
                  <WifiOff size={12} /> {lang === 'ar' ? 'الذكاء غير متصل' : 'AI Offline'}
                </button>
              ) : (
                <div className="flex items-center gap-2 text-white/30 text-xs font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <Loader2 size={12} className="animate-spin" /> {lang === 'ar' ? 'جاري التحقق...' : 'Checking AI...'}
                </div>
              )}
              {memories.length > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase tracking-widest bg-blue-400/10 px-3 py-1.5 rounded-full border border-blue-400/20"
                >
                  <Shield size={12} /> {memories.length}
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsConvSidebarOpen(!isConvSidebarOpen)}
              className="hidden md:flex p-2.5 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
              title={isConvSidebarOpen ? t.foldChat : t.unfoldChat}
            >
              <PanelLeft size={20} className={isRtl ? 'rotate-180' : ''} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
              <Activity size={14} className="text-emerald-400 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-black leading-none mb-1">Active Engine</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/80 leading-none">
                  {customPersonas.find(p => p.id === currentPersona)?.name || (lang === 'ar' ? 'لا يوجد وكيل' : 'No Agent')}
                </span>
              </div>
            </div>
            <button 
              onClick={async () => { 
                if(user) { 
                  setConfirmModal({
                    title: t.clear,
                    message: t.clearConfirm,
                    onConfirm: async () => {
                      const { error } = await supabase
                        .from('messages')
                        .delete()
                        .eq('user_id', user.id);
                      if (error) console.error("Error clearing messages:", error);
                      setMessages([]);
                      setConfirmModal(null);
                      showToast(lang === 'ar' ? 'تم مسح الرسائل' : 'Messages cleared', 'success');
                    }
                  });
                } 
              }}
              className="p-2.5 hover:bg-red-500/10 rounded-xl text-white/20 hover:text-red-400 transition-all duration-300 group"
              title={t.clearConfirm}
            >
              <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Conversations Sidebar */}
          <AnimatePresence mode="wait">
            {isConvSidebarOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="hidden md:flex flex-col border-r border-white/10 bg-[#080808] overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-white/40">{t.conversations}</span>
                  <button 
                    onClick={handleNewConversation}
                    className="p-2 hover:bg-white/5 rounded-xl text-white/60 hover:text-white transition-all"
                    title={t.newChat}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                  {conversations.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <MessageSquare size={32} className="mx-auto text-white/10" />
                      <p className="text-[10px] text-white/20 uppercase tracking-widest">{t.noConversations}</p>
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <div key={conv.id} className="group relative">
                        <button
                          onClick={() => setCurrentConversationId(conv.id)}
                          className={`w-full text-left p-4 rounded-2xl transition-all border ${
                            currentConversationId === conv.id 
                              ? 'bg-white/5 border-white/20 text-white' 
                              : 'border-transparent text-white/40 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <div className="text-xs font-bold truncate mb-1">{conv.title}</div>
                          <div className="text-[9px] opacity-40 truncate">{conv.last_message || '...'}</div>
                        </button>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setPromptModal({
                              title: lang === 'ar' ? 'تغيير العنوان' : 'Rename Chat',
                              message: lang === 'ar' ? 'أدخل العنوان الجديد للمحادثة' : 'Enter new title for the conversation',
                              defaultValue: conv.title,
                              onConfirm: async (newTitle) => {
                                if (newTitle && newTitle.trim()) {
                                  await storageService.upsert('conversations', { ...conv, title: newTitle.trim() }, { on: 'id' });
                                  showToast(lang === 'ar' ? 'تم تغيير العنوان' : 'Chat renamed', 'success');
                                }
                                setPromptModal(null);
                              }
                            });
                          }}
                          className="absolute top-2 right-10 p-1.5 bg-blue-500/10 text-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-500 hover:text-white"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.id); }}
                          className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div 
              ref={chatContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 md:p-12 space-y-12 scroll-smooth custom-scrollbar relative"
            >
              {customPersonas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-2xl mx-auto">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-white/5 border border-dashed border-white/20 rounded-[3rem] flex items-center justify-center shadow-2xl"
                  >
                    <Bot size={64} className="text-white/20" />
                  </motion.div>
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter leading-none">{t.noAgents}</h1>
                    <p className="text-white/40 text-base leading-relaxed font-medium max-w-md mx-auto">
                      {lang === 'ar' 
                        ? 'ابدأ بإنشاء أول وكيل ذكاء اصطناعي مخصص لك. يمكنك تحديد الاسم، الأيقونة، والتعليمات الخاصة به.' 
                        : 'Start by creating your first custom AI agent. You can define its name, icon, and specific instructions.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSettingsTab('agents');
                      setIsSettingsOpen(true);
                    }}
                    className="px-10 py-5 bg-white text-black rounded-3xl text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10"
                  >
                    {t.createFirstAgent}
                  </button>
                </div>
              ) : messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-10 max-w-2xl mx-auto">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-white/20"
                  >
                    <Command size={48} className="text-black" />
                  </motion.div>
                  <div className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter leading-none">{t.welcome}</h1>
                    <p className="text-white/40 text-base leading-relaxed font-medium max-w-md mx-auto">{t.welcomeDesc}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {t.suggestions.map((suggestion, i) => (
                      <motion.button 
                        key={suggestion}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => setInput(suggestion)}
                        className={`p-5 text-xs bg-white/5 hover:bg-white border border-white/5 rounded-3xl text-white/40 hover:text-black transition-all duration-500 group relative overflow-hidden ${isRtl ? 'text-right' : 'text-left'}`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <span className="font-bold uppercase tracking-widest">{suggestion}</span>
                          <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] md:max-w-[75%] space-y-3`}>
                    <div className={`flex items-center gap-3 mb-1 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg ${msg.role === 'user' ? 'bg-white text-black' : 'bg-emerald-500 text-white'}`}>
                        {msg.role === 'user' ? 'U' : 'AI'}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-20">
                        {msg.role === 'user' ? (lang === 'ar' ? 'أنت' : 'User') : (customPersonas.find(p => p.id === msg.persona)?.name || 'Flix Gosts')}
                      </span>
                    </div>
                    <div className={`p-6 rounded-[2.5rem] text-sm leading-relaxed shadow-2xl backdrop-blur-3xl ${
                      msg.role === 'user' 
                        ? 'bg-white text-black font-medium rounded-tr-none' 
                        : msg.role === 'system'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-none'
                          : 'bg-[#111]/80 border border-white/5 text-white/90 rounded-tl-none'
                    }`}>
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/5">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === 'system' && (msg.content.includes('Error') || msg.content.includes('خطأ')) && (
                        <div className="flex items-center gap-3 mt-4">
                          <button 
                            onClick={() => {
                              // Find the last user message before this error
                              const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
                              if (lastUserMsg) {
                                setInput(lastUserMsg.content);
                                // Remove the error message
                                setMessages(prev => prev.filter(m => m.id !== msg.id));
                                // Focus input
                                document.querySelector('textarea')?.focus();
                              }
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-2"
                          >
                            <RefreshCw size={10} />
                            {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                          </button>
                          
                          {(msg.content.includes('Quota') || msg.content.includes('حصة')) && (
                            <button 
                              onClick={() => setIsSettingsOpen(true)}
                              className="px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
                            >
                              <SettingsIcon size={10} />
                              {lang === 'ar' ? 'الإعدادات' : 'Settings'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className={`text-[9px] font-black tracking-widest opacity-20 px-4 flex items-center gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span>{new Date(msg.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.role === 'model' && (
                        <>
                          <button 
                            onClick={() => handleSpeak(msg.content, msg.id)}
                            className={`flex items-center gap-1.5 hover:opacity-100 transition-opacity ${speakingId === msg.id ? 'opacity-100 text-emerald-400' : 'opacity-50'}`}
                          >
                            {speakingId === msg.id ? <Loader2 size={10} className="animate-spin" /> : <Volume2 size={10} />}
                            <span className="uppercase">{speakingId === msg.id ? t.stop : t.speak}</span>
                          </button>
                          <button 
                            onClick={() => handleShare(t.nexus, msg.content)}
                            className="flex items-center gap-1.5 hover:opacity-100 transition-opacity opacity-50"
                          >
                            <Share2 size={10} />
                            <span className="uppercase">{lang === 'ar' ? 'مشاركة' : 'Share'}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className={`flex ${isRtl ? 'justify-end' : 'justify-start'}`}>
                  <div className="bg-[#111]/80 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                        className="w-2 h-2 bg-emerald-500 rounded-full" 
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-emerald-500 rounded-full" 
                      />
                      <motion.div 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-emerald-500 rounded-full" 
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                      {lang === 'ar' ? 'جاري التفكير...' : 'Thinking...'}
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
              
              <AnimatePresence>
                {!isAtBottom && messages.length > 0 && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    onClick={() => scrollToBottom()}
                    className="fixed bottom-32 right-8 md:right-12 p-3 bg-white text-black rounded-full shadow-2xl z-20 hover:scale-110 active:scale-95 transition-all"
                  >
                    <ArrowDown size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="flex gap-2 px-6 pb-2 overflow-x-auto scrollbar-hide">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(suggestion);
                      setSuggestions([]);
                    }}
                    className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/70 hover:bg-white/10 transition-all whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
              <div className="max-w-4xl mx-auto relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t.placeholder.replace('{name}', customPersonas.find(p => p.id === currentPersona)?.name || '')}
                  className={`w-full bg-[#111] border border-white/10 rounded-2xl py-4 focus:outline-none focus:border-white/30 transition-all text-sm ${isRtl ? 'pr-6 pl-14' : 'pl-6 pr-14'}`}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 ${isRtl ? 'left-3' : 'right-3'}`}
                >
                  <Send size={18} className={isRtl ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>
          </div>

          {/* Activity Sidebar */}
          <div className="hidden xl:flex w-80 border-l border-white/10 flex-col bg-[#080808]">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">{t.agentActivity}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-4">
                <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">{t.activityLog}</div>
                {agentActivities.length === 0 ? (
                  <div className="text-xs text-white/20 italic">No recent activity</div>
                ) : (
                  agentActivities.map((act) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={(act as any).id || act.timestamp} 
                      className="flex gap-3"
                    >
                      <div className="mt-1">
                        {act.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-400" /> :
                         act.status === 'error' ? <X size={14} className="text-red-400" /> :
                         <Circle size={14} className="text-white/20 animate-pulse" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-xs font-medium ${act.status === 'error' ? 'text-red-400' : 'text-white/80'}`}>{act.step}</div>
                        <div className="text-[9px] text-white/20">{new Date(act.timestamp).toLocaleTimeString()}</div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/5">
                <div className="text-[10px] uppercase tracking-widest text-white/30 font-semibold">{t.capabilities}</div>
                <div className="flex flex-wrap gap-2">
                  {customPersonas.find(p => p.id === currentPersona)?.capabilities.map(cap => (
                    <span key={cap} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[10px] text-white/60">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Memory Modal */}
        <AnimatePresence>
          {isMemoryOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMemoryOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                      <Shield className="text-white" size={24} />
                    </div>
                    <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
                      <h2 className="text-2xl font-black tracking-tight">{t.memory}</h2>
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{memories.length} {t.stored}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={async () => { 
                        if(user) {
                          setConfirmModal({
                            title: t.clear,
                            message: t.clearConfirm,
                            onConfirm: async () => {
                              const { error } = await memoryService.clearAll(user.id);
                              if (error) {
                                showToast(lang === 'ar' ? 'فشل مسح الذاكرة' : 'Failed to clear memory', 'error');
                              } else {
                                setMemories([]);
                                showToast(lang === 'ar' ? 'تم مسح الذاكرة' : 'Memory cleared', 'success');
                              }
                              setConfirmModal(null);
                            }
                          });
                        } 
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={14} /> {t.clear}
                    </button>
                    <button onClick={() => setIsMemoryOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40">
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12 ${isRtl ? 'text-right' : 'text-left'}`}>
                  {/* User Profile Section */}
                  {memories.some(m => m.tags.includes('user_profile')) && (
                    <section className="space-y-6">
                      <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h3 className="text-lg font-black tracking-tight uppercase">{lang === 'ar' ? 'ملف المستخدم' : 'User Profile'}</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {memories.filter(m => m.tags.includes('user_profile')).map(memory => (
                          <div key={memory.id} className="p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-emerald-500/30 transition-all">
                            <div className={`flex items-start justify-between gap-4 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                              <p className={`text-sm font-medium leading-relaxed text-white/80 ${isRtl ? 'text-right' : 'text-left'}`}>{memory.content}</p>
                              <button 
                                onClick={async () => { if(user) await memoryService.deleteMemory(user.id, memory.id); }}
                                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Work & Preferences Section */}
                  <section className="space-y-6">
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                      <h3 className="text-lg font-black tracking-tight uppercase">{lang === 'ar' ? 'العمل والتفضيلات' : 'Work & Preferences'}</h3>
                    </div>
                    <div className="space-y-4">
                      {memories.filter(m => !m.tags.includes('user_profile')).length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                          <p className="text-white/20 text-sm font-bold uppercase tracking-widest">{t.noMemories}</p>
                        </div>
                      ) : (
                        memories.filter(m => !m.tags.includes('user_profile')).map(memory => (
                          <div key={memory.id} className={`p-6 bg-[#111] border border-white/5 rounded-3xl group hover:border-white/20 transition-all flex items-center justify-between gap-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex items-center gap-6 flex-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                                memory.tags.includes('work') ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                              }`}>
                                {memory.tags.includes('work') ? <Activity size={18} /> : <Sparkles size={18} />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-sm font-medium text-white/80 ${isRtl ? 'text-right' : 'text-left'}`}>{memory.content}</p>
                                <div className={`flex items-center gap-3 mt-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                    {new Date(memory.timestamp).toLocaleDateString()}
                                  </span>
                                  {memory.tags.map(tag => (
                                    <span key={tag} className="text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 bg-white/5 text-white/40 rounded-full">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={async () => { if(user) await memoryService.deleteMemory(user.id, memory.id); }}
                              className="opacity-0 group-hover:opacity-100 p-2.5 hover:bg-red-500/10 text-red-400 rounded-xl transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {isSettingsOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#0a0a0a] border border-white/10 rounded-3xl md:rounded-[2.5rem] w-full max-w-5xl h-[90vh] md:h-[85vh] overflow-hidden flex flex-col shadow-2xl"
              >
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                      <SettingsIcon size={20} className="text-white md:w-6 md:h-6" />
                    </div>
                    <div className={`flex flex-col ${isRtl ? 'text-right' : 'text-left'}`}>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight">{t.settings}</h2>
                      <p className="text-white/40 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">System Configuration & Customization</p>
                    </div>
                  </div>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-white/40 transition-colors">
                    <X size={20} className="md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                  {/* Sidebar Tabs */}
                  <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 md:p-6 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar shrink-0">
                    {[
                      { id: 'general', icon: SettingsIcon, label: t.general },
                      { id: 'agents', icon: Bot, label: t.agents },
                      { id: 'models', icon: CpuIcon, label: t.models },
                      { id: 'storage', icon: Database, label: t.storage },
                      { id: 'admin', icon: Shield, label: 'Admin' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSettingsTab(tab.id as any)}
                        className={`flex items-center gap-3 md:gap-4 px-4 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap md:whitespace-normal shrink-0 md:shrink ${
                          settingsTab === tab.id 
                            ? 'bg-white text-black shadow-xl shadow-white/5' 
                            : 'text-white/40 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <tab.icon size={16} className="md:w-[18px] md:h-[18px]" />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                    {settingsTab === 'admin' && <AdminDashboard />}
                    {settingsTab === 'general' && <Settings user={user} lang={lang} setLang={setLang} memoryOption={memoryOption} setMemoryOption={setMemoryOption} />}
                    {settingsTab === 'agents' && (
                      <div className="space-y-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                            <h3 className="text-lg font-black tracking-tight uppercase">{t.agents}</h3>
                          </div>
                          <button 
                            onClick={() => {
                              const newId = `custom-${Date.now()}`;
                              const newAgent: Persona = {
                                id: newId,
                                name: 'New Agent',
                                description: 'A custom intelligence core.',
                                systemInstruction: 'You are a helpful assistant.',
                                icon: 'Bot',
                                capabilities: ['General Knowledge'],
                                model: 'gemini-3-flash-preview'
                              };
                              setCustomPersonas(prev => [...prev, newAgent]);
                              setEditingPersona(newAgent);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                          >
                            <Plus size={14} /> {t.addAgent}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {customPersonas.length === 0 ? (
                            <div className="col-span-full p-12 bg-white/5 border border-dashed border-white/10 rounded-[3rem] flex flex-col items-center justify-center text-center space-y-4">
                              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                <Bot size={40} className="text-white/20" />
                              </div>
                              <div className="space-y-1">
                                <div className="text-lg font-black uppercase tracking-tight">{t.noAgents}</div>
                                <div className="text-xs text-white/30 font-bold">{lang === 'ar' ? 'ابدأ بإنشاء وكيلك الأول لتخصيص تجربتك.' : 'Start by creating your first agent to customize your experience.'}</div>
                              </div>
                              <button 
                                onClick={() => {
                                  const newId = `custom-${Date.now()}`;
                                  const newAgent: Persona = {
                                    id: newId,
                                    name: lang === 'ar' ? 'وكيل جديد' : 'New Agent',
                                    description: lang === 'ar' ? 'نواة ذكاء مخصصة.' : 'A custom intelligence core.',
                                    systemInstruction: 'You are a helpful assistant.',
                                    icon: 'Bot',
                                    capabilities: ['General Knowledge'],
                                    model: 'gemini-3-flash-preview'
                                  };
                                  setEditingPersona(newAgent);
                                }}
                                className="px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                              >
                                {t.createFirstAgent}
                              </button>
                            </div>
                          ) : customPersonas.map(persona => (
                            <div key={persona.id} className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex flex-col gap-4 group hover:border-white/20 transition-all">
                              <div className="flex items-center gap-5">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                                  {React.createElement(personaIcons[persona.icon] || Bot, { size: 24, className: "text-white/80" })}
                                </div>
                                <div className="space-y-1">
                                  <div className="text-base font-black tracking-tight">{persona.name}</div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{persona.model?.split('-')[1]?.toUpperCase() || 'CUSTOM'}</span>
                                    <span className="w-1 h-1 bg-white/10 rounded-full" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/60">{persona.capabilities.length} {t.capabilities}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button 
                                  onClick={() => setEditingPersona(persona)}
                                  className="p-2.5 bg-white text-black rounded-xl hover:scale-110 transition-all"
                                >
                                  <SettingsIcon size={16} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setConfirmModal({
                                      title: t.deleteAgent,
                                      message: lang === 'ar' ? 'هل أنت متأكد من حذف هذا الوكيل؟' : 'Are you sure you want to delete this agent?',
                                      onConfirm: () => {
                                        handleDeleteAgent(persona.id);
                                        setConfirmModal(null);
                                      }
                                    });
                                  }}
                                  className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {editingPersona && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-md"
                          >
                            <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl md:rounded-[3rem] w-full max-w-2xl p-6 md:p-10 space-y-6 md:space-y-8 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xl md:text-2xl font-black tracking-tight uppercase">{t.editPersona}</h3>
                                <button onClick={() => setEditingPersona(null)} className="p-2 hover:bg-white/5 rounded-xl text-white/40">
                                  <X size={20} className="md:w-6 md:h-6" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentName}</label>
                                  <input 
                                    value={editingPersona.name}
                                    onChange={(e) => setEditingPersona({...editingPersona, name: e.target.value})}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentIcon}</label>
                                  <select 
                                    value={editingPersona.icon}
                                    onChange={(e) => setEditingPersona({...editingPersona, icon: e.target.value})}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none appearance-none"
                                  >
                                    {Object.keys(personaIcons).map(icon => (
                                      <option key={icon} value={icon} className="bg-[#0a0a0a]">{icon}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentCapabilities}</label>
                                  <input 
                                    value={editingPersona.capabilities.join(', ')}
                                    onChange={(e) => setEditingPersona({...editingPersona, capabilities: e.target.value.split(',').map(c => c.trim()).filter(Boolean)})}
                                    placeholder="e.g. Coding, Writing, Analysis"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none"
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentModel}</label>
                                <div className="grid grid-cols-1 gap-3">
                                  {MODELS.map(model => (
                                    <button
                                      key={model.id}
                                      onClick={() => {
                                        const updates: Partial<Persona> = { model: model.id };
                                        if (model.id === 'groq-llama3') {
                                          updates.customModelId = 'llama3-8b-8192';
                                          updates.customApiUrl = 'https://api.groq.com/openai/v1';
                                        } else if (model.id === 'openrouter') {
                                          updates.customModelId = 'meta-llama/llama-3-8b-instruct';
                                          updates.customApiUrl = 'https://openrouter.ai/api/v1';
                                        } else if (model.id === 'huggingface') {
                                          updates.customModelId = 'meta-llama/Meta-Llama-3-8B-Instruct';
                                          updates.customApiUrl = 'https://api-inference.huggingface.co/v1';
                                        }
                                        setEditingPersona({...editingPersona, ...updates});
                                      }}
                                      className={`p-4 rounded-2xl border text-left transition-all ${
                                        editingPersona.model === model.id 
                                          ? 'bg-emerald-500/10 border-emerald-500/50' 
                                          : 'bg-white/5 border-white/5 hover:border-white/10'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs font-bold text-white">{model.name}</div>
                                        <div title={model.description}>
                                          <Info size={14} className="text-white/40 cursor-help" />
                                        </div>
                                      </div>
                                      <div className="text-[10px] text-white/40 mt-1">{model.description}</div>
                                    </button>
                                  ))}
                                </div>

                                { editingPersona.model === 'custom' && (
                                  <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 pt-4 border-t border-white/5"
                                  >
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.customModelId}</label>
                                      <input 
                                        value={editingPersona.customModelId || ''}
                                        onChange={(e) => setEditingPersona({...editingPersona, customModelId: e.target.value})}
                                        placeholder="e.g. llama3, gpt-4, custom-model-v1"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.customApiUrl}</label>
                                      <input 
                                        value={editingPersona.customApiUrl || ''}
                                        onChange={(e) => setEditingPersona({...editingPersona, customApiUrl: e.target.value})}
                                        placeholder="e.g. http://localhost:11434/v1/chat/completions"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentApiKey}</label>
                                      <input 
                                        type="password"
                                        value={editingPersona.apiKey || ''}
                                        onChange={(e) => setEditingPersona({...editingPersona, apiKey: e.target.value})}
                                        placeholder="Leave empty to use global key"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none"
                                      />
                                    </div>
                                    <button 
                                      onClick={async () => {
                                        try {
                                          const result = await aiService.testConnection(editingPersona.id, editingPersona.apiKey, customPersonas);
                                          if (result.success) {
                                            showToast(lang === 'ar' ? "تم الاتصال بنجاح!" : "Connection Successful!", 'success');
                                          } else {
                                            showToast(lang === 'ar' ? `فشل الاتصال: ${result.message}` : `Connection Failed: ${result.message}`, 'error');
                                          }
                                        } catch (err: any) {
                                          showToast(err.message || String(err), 'error');
                                        }
                                      }}
                                      className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                      {t.testConnection}
                                    </button>
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                      <div className="flex items-center gap-3">
                                        <Layers size={18} className="text-purple-400" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-white/60">{t.mcpEnabled}</span>
                                      </div>
                                      <button 
                                        onClick={() => setEditingPersona({...editingPersona, mcpEnabled: !editingPersona.mcpEnabled})}
                                        className={`w-12 h-6 rounded-full transition-all relative ${editingPersona.mcpEnabled ? 'bg-purple-500' : 'bg-white/10'}`}
                                      >
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editingPersona.mcpEnabled ? 'right-1' : 'left-1'}`} />
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentCapabilities}</label>
                                <input 
                                  value={editingPersona.capabilities.join(', ')}
                                  onChange={(e) => setEditingPersona({...editingPersona, capabilities: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')})}
                                  placeholder="e.g. Coding, Writing, Analysis"
                                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:border-white/30 outline-none"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.agentInstruction}</label>
                                <textarea 
                                  value={editingPersona.systemInstruction}
                                  onChange={(e) => setEditingPersona({...editingPersona, systemInstruction: e.target.value})}
                                  className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white/80 focus:border-white/30 outline-none resize-none"
                                />
                              </div>

                              <div className="flex gap-4 pt-4">
                                <button 
                                  onClick={() => handleSaveAgent(editingPersona)}
                                  className="flex-1 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                  {t.saveAgent}
                                </button>
                                <button 
                                  onClick={() => handleShare(editingPersona.name, editingPersona.systemInstruction)}
                                  className="py-4 px-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                  <Share2 size={16} />
                                </button>
                                <button 
                                  onClick={() => setEditingPersona(null)}
                                  className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                  {t.cancelAgent}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                    {settingsTab === 'models' && (
                      <div className="space-y-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                            <h3 className="text-lg font-black tracking-tight uppercase">{t.models}</h3>
                          </div>
                          <a 
                            href="https://aistudio.google.com/app/apikey" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 flex items-center gap-2"
                          >
                            {lang === 'ar' ? 'احصل على مفتاح API' : 'Get API Key'}
                            <ChevronRight size={14} />
                          </a>
                        </div>

                        <div className="space-y-6">
                          {['gemini', 'ace3', 'groq', 'openrouter', 'huggingface'].map(key => (
                            <div key={key} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <CpuIcon size={24} className="text-white/60" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-black uppercase tracking-widest">{key === 'gemini' ? 'Primary Core' : key === 'ace3' ? 'Advanced Logic' : key === 'groq' ? 'Groq Inference' : key === 'openrouter' ? 'OpenRouter' : 'Hugging Face'}</div>
                                    <div className="text-[10px] text-white/30 font-bold">{key.toUpperCase()} API Configuration</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-2 h-2 rounded-full ${apiKeys[key] ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-white/10'}`} />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{apiKeys[key] ? t.keyActive : t.keyMissing}</span>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">{t.apiKey}</label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input 
                                    type="password"
                                    placeholder="Enter your API Key here..."
                                    value={apiKeys[key] || ''}
                                    onChange={(e) => setApiKeys(prev => ({ ...prev, [key]: e.target.value }))}
                                    className="flex-1 px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-white/30 transition-all"
                                  />
                                  <button 
                                    onClick={async () => {
                                      try {
                                        const result = await aiService.testConnection(key, apiKeys[key]);
                                        if (result.success) {
                                          showToast(lang === 'ar' ? "تم الاتصال بنجاح!" : "Connection Successful!", 'success');
                                        } else {
                                          showToast(lang === 'ar' ? `فشل الاتصال: ${result.message}` : `Connection Failed: ${result.message}`, 'error');
                                        }
                                      } catch (err: any) {
                                        showToast(err.message || String(err), 'error');
                                      }
                                    }}
                                    className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all whitespace-nowrap"
                                  >
                                    {t.testConnection}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-4">
                            <button 
                              onClick={() => updateApiKeys(apiKeys)}
                              className="flex-1 py-5 bg-emerald-500 text-white rounded-3xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-emerald-500/20"
                            >
                              {t.saveKeys}
                            </button>
                            <button 
                              onClick={async () => {
                                setConfirmModal({
                                  title: t.clearKeys,
                                  message: t.keysCleared,
                                  onConfirm: async () => {
                                    await updateApiKeys({});
                                    setApiKeys({});
                                    setConfirmModal(null);
                                    showToast(t.keysCleared, 'success');
                                  }
                                });
                              }}
                              className="px-8 py-5 bg-red-500/10 text-red-400 rounded-3xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {settingsTab === 'storage' && (
                      <div className="space-y-10">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                          <h3 className="text-lg font-black tracking-tight uppercase">{t.storage}</h3>
                        </div>

                        <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] space-y-8">
                          <div className="space-y-2">
                            <div className="text-sm font-black uppercase tracking-widest">{t.storageMode}</div>
                            <p className="text-xs text-white/40 leading-relaxed">{t.storageDesc}</p>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                              onClick={() => {
                                setIsLocalOnly(true);
                                storageService.setLocalOnly(true);
                              }}
                              className={`flex-1 py-5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${isLocalOnly ? 'bg-white text-black shadow-2xl shadow-white/10' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                              {t.localOnly}
                            </button>
                            <button 
                              onClick={() => {
                                setIsLocalOnly(false);
                                storageService.setLocalOnly(false);
                              }}
                              className={`flex-1 py-5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${!isLocalOnly ? 'bg-white text-black shadow-2xl shadow-white/10' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                              {t.cloudSync}
                            </button>
                          </div>
                          
                          <div className="pt-8 border-t border-white/5 space-y-6">
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <div className="text-xs font-black uppercase tracking-widest text-white/40">{t.sqlSchema}</div>
                                <p className="text-[10px] text-white/30 leading-relaxed">{t.schemaDesc}</p>
                              </div>
                              <button 
                                onClick={async () => {
                                  try {
                                    const { error } = await supabase.from('messages').select('id').limit(1);
                                    if (error) {
                                      if (error.message?.includes('schema cache')) {
                                        showToast(lang === 'ar' ? "الجداول غير موجودة. يرجى تشغيل كود SQL في Supabase." : "Tables not found. Please run the SQL schema in Supabase.", 'error');
                                      } else {
                                        showToast(`Error: ${error.message}`, 'error');
                                      }
                                    } else {
                                      showToast(lang === 'ar' ? "قاعدة البيانات جاهزة ومتصلة!" : "Database is ready and connected!", 'success');
                                    }
                                  } catch (err: any) {
                                    showToast(`Error: ${err.message || String(err)}`, 'error');
                                  }
                                }}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                              >
                                {lang === 'ar' ? 'فحص قاعدة البيانات' : 'Check Database'}
                              </button>
                            </div>
                            <button 
                              onClick={() => {
                                const schema = `-- SQL Schema for Flix Gosts (Supabase)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'model', 'system')),
  content TEXT NOT NULL,
  persona TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  importance INTEGER DEFAULT 1,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS custom_personas (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  color TEXT,
  system_instruction TEXT NOT NULL,
  capabilities TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  last_message TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

INSERT INTO settings (key, value) VALUES ('admin_pin', '"135790"') ON CONFLICT DO NOTHING;

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated users to manage settings" ON settings FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own messages" ON messages FOR ALL USING (auth.uid() = user_id);

ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own memories" ON memories FOR ALL USING (auth.uid() = user_id);

ALTER TABLE custom_personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own personas" ON custom_personas FOR ALL USING (auth.uid() = user_id);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE;`;
                                navigator.clipboard.writeText(schema);
                                showToast(t.schemaCopied, 'success');
                              }}
                              className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                            >
                              <Database size={16} />
                              {t.copySchema}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Workspace Panel */}
        <AnimatePresence>
          {isWorkspaceOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed md:absolute inset-x-0 bottom-0 md:inset-x-6 md:bottom-24 z-[80] flex flex-col"
            >
              <div className="max-w-4xl mx-auto w-full bg-black/95 backdrop-blur-3xl border border-white/10 rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[60dvh] md:max-h-[400px]">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
                  <div className="flex items-center gap-3">
                    <FolderOpen size={18} className="text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">{t.workspace}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={async () => {
                        const result = await localFileService.requestAccess();
                        if (result.success) {
                          const files = localFileService.getFiles().map(f => f.path);
                          setWorkspace({ rootPath: "Local Folder", files });
                          showToast(lang === 'ar' ? 'تم الوصول للمجلد بنجاح' : 'Folder access granted', 'success');
                        } else {
                          if (result.error === 'IFRAME_RESTRICTION') {
                            showToast(lang === 'ar' ? 'يرجى فتح التطبيق في نافذة جديدة لاستخدام هذه الميزة' : 'Please open the app in a new tab to use this feature', 'error');
                          } else if (result.error === 'NOT_SUPPORTED') {
                            showToast(lang === 'ar' ? 'المتصفح لا يدعم الوصول للمجلدات' : 'Browser does not support folder access', 'error');
                          } else {
                            showToast(lang === 'ar' ? 'فشل الوصول للمجلد' : 'Folder access failed', 'error');
                          }
                        }
                      }}
                      className="px-6 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-amber-400 transition-all hover:scale-105 active:scale-95"
                    >
                      {t.openWorkspace}
                    </button>
                    <button onClick={() => setIsWorkspaceOpen(false)} className="text-white/40 hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                  {workspace.files.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-white/10 space-y-6 py-16">
                      <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
                        <FolderOpen size={40} strokeWidth={1} />
                      </div>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-center max-w-[200px] leading-relaxed">{t.workspaceEmpty}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {workspace.files.map((file, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.02 }}
                          key={idx} 
                          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all group cursor-default"
                        >
                          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                            <FileText size={14} className="text-white/40 group-hover:text-amber-400 transition-colors" />
                          </div>
                          <span className="text-[10px] font-mono text-white/60 truncate group-hover:text-white transition-colors">{file}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terminal Overlay */}
        <AnimatePresence>
          {isTerminalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed md:absolute inset-0 md:inset-x-6 md:bottom-24 md:top-24 bg-black/95 border-0 md:border md:border-white/10 rounded-0 md:rounded-3xl z-[80] flex flex-col shadow-2xl backdrop-blur-2xl overflow-hidden"
              dir="ltr"
              style={{ height: '100dvh', maxHeight: '100dvh' }}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/60">{t.coreTerminal}</span>
                </div>
                <button onClick={() => setIsTerminalOpen(false)} className="text-white/40 hover:text-white transition-colors p-2">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] md:text-xs space-y-2 scrollbar-hide">
                <div className="text-emerald-500/60 mb-4">{t.terminalWelcome}</div>
                {terminalLines.map(line => (
                  <div key={line.id} className="flex gap-3">
                    <span className="opacity-40 shrink-0">{line.type === 'input' ? '>' : '#'}</span>
                    <span className={`${line.type === 'error' ? 'text-red-400' : line.type === 'input' ? 'text-white' : 'text-emerald-400/80'} whitespace-pre-wrap break-all`}>
                      {line.content}
                    </span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>

              <div className="p-4 border-t border-white/10 bg-black shrink-0">
                <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <span className="text-emerald-400 font-mono text-[10px] md:text-xs font-bold shrink-0">flix@gosts:~$</span>
                  <input
                    autoFocus
                    type="text"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        if (target.value.trim()) {
                          executeCommand(target.value);
                          target.value = '';
                        }
                      }
                    }}
                    className="flex-1 bg-transparent border-none outline-none font-mono text-[11px] md:text-xs text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.1 } }}
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 min-w-[300px] ${
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-white/10 border-white/20 text-white'
              }`}
            >
              {toast.type === 'success' && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              {toast.type === 'error' && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              <span className="text-[10px] font-black uppercase tracking-widest flex-1">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirm Modal */}
        <AnimatePresence>
          {confirmModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase tracking-tight">{confirmModal.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{confirmModal.message}</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => {
                        confirmModal.onConfirm();
                      }}
                      className="flex-1 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                    >
                      {lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Prompt Modal */}
        <AnimatePresence>
          {promptModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPromptModal(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase tracking-tight">{promptModal.title}</h3>
                    <p className="text-xs text-white/40 leading-relaxed">{promptModal.message}</p>
                  </div>
                  <input
                    autoFocus
                    type="text"
                    defaultValue={promptModal.defaultValue}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        promptModal.onConfirm((e.target as HTMLInputElement).value);
                      }
                    }}
                    id="prompt-input"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPromptModal(null)}
                      className="flex-1 py-4 rounded-2xl bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      {t.cancel}
                    </button>
                    <button
                      onClick={() => {
                        const input = document.getElementById('prompt-input') as HTMLInputElement;
                        promptModal.onConfirm(input.value);
                      }}
                      className="flex-1 py-4 rounded-2xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20"
                    >
                      {t.save}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      </div>
    </ErrorBoundary>
  );
}



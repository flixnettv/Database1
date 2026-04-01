import { GoogleGenAI, Modality, HarmCategory, HarmBlockThreshold } from "@google/genai";

// This is a simplified worker implementation.
// In a real scenario, you'd need to handle initialization, API keys, etc.
// The worker needs to be able to import the SDK.

let instances: Record<string, GoogleGenAI> = {};
let customKeys: Record<string, string> = {};

const SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  if (type === 'SET_KEYS') {
    customKeys = payload;
    instances = {};
    Object.entries(customKeys).forEach(([id, key]) => {
      if (key) {
        try {
          instances[id] = new GoogleGenAI({ apiKey: key });
        } catch (e) {
          console.error(`Failed to initialize AI instance for ${id}:`, e);
        }
      }
    });
  } else if (type === 'CHAT') {
    const { prompt, history, personaId, workspaceFiles, customPersonas } = payload;
    
    console.log(`[AI Worker] Chat request for persona: ${personaId}`, { prompt, historyLength: history.length });

    const persona = customPersonas.find((p: any) => p.id === personaId) || { name: 'Gemini', description: 'Assistant', systemInstruction: 'You are a helpful assistant.', capabilities: [] };
    const systemInstruction = `${persona.systemInstruction}

Capabilities: ${persona.capabilities.join(', ')}

${persona.capabilities.includes('SQL') ? 'You are an expert in SQL and PostgreSQL. When asked about database operations, provide precise SQL queries and explain their impact.' : ''}
${persona.capabilities.includes('Coding') ? 'You are an expert coder. When asked about code, provide clean, efficient, and well-documented code.' : ''}
${persona.mcpEnabled ? 'You have access to Model Context Protocol (MCP) tools. Use them when necessary to retrieve context or perform actions.' : ''}
`;

    try {
      let ai = instances[personaId] || instances.gemini;
      if (!ai) throw new Error("AI service not configured.");
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          ...history
            .filter(m => m.role !== 'system' && m.content)
            .map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: String(m.content || "") }]
            })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          safetySettings: SAFETY_SETTINGS,
        },
      });

      console.log(`[AI Worker] Chat response received for persona: ${personaId}`);
      self.postMessage({ type: 'CHAT_RESULT', payload: { text: response.text || "", functionCalls: response.functionCalls || [] } });
    } catch (error: any) {
      console.error(`[AI Worker] Chat error for persona: ${personaId}`, error);
      self.postMessage({ type: 'CHAT_ERROR', payload: error.message });
    }
  } else if (type === 'TTS') {
    try {
      const { text } = payload;
      const ai = instances.gemini;
      if (!ai) throw new Error("TTS requires GEMINI_API_KEY");
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      self.postMessage({ type: 'TTS_RESULT', payload: audioData });
    } catch (error: any) {
      self.postMessage({ type: 'TTS_ERROR', payload: error.message });
    }
  }
};

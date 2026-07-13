const GROQ_COUNT = 14;

const GROQ_MODELS = [
  'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768',
  'gemma2-9b-it', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant',
  'llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768',
  'gemma2-9b-it', 'llama-3.1-70b-versatile', 'llama-3.1-8b-instant',
  'llama3-70b-8192', 'llama3-8b-8192',
];

const groqEntries = Array.from({ length: GROQ_COUNT }, (_, i) => ({
  id: `groq-${i + 1}`,
  key: import.meta.env[`VITE_GROQ_API_KEY_${i + 1}`] || '',
  provider: 'Groq',
  model: GROQ_MODELS[i],
  label: `Groq #${i + 1} (${GROQ_MODELS[i].split('-').slice(0, 2).join(' ')})`,
}));

export const API_KEYS_CONFIG = [
  ...groqEntries,
  {
    id: 'openrouter-1',
    key: import.meta.env.VITE_OPENROUTER_API_KEY || '',
    provider: 'OpenRouter',
    model: 'openrouter/auto',
    label: 'OpenRouter #1 (Auto)',
  },
  {
    id: 'openai-1',
    key: import.meta.env.VITE_OPENAI_API_KEY || '',
    provider: 'OpenAI',
    model: 'gpt-4o-mini',
    label: 'OpenAI #1 (GPT-4o Mini)',
  },
  {
    id: 'gemini-1',
    key: import.meta.env.VITE_GEMINI_API_KEY || '',
    provider: 'Gemini',
    model: 'gemini-1.5-flash',
    label: 'Gemini #1 (1.5 Flash)',
  },
];

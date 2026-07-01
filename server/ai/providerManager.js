import * as openaiAdapter from './adapters/openaiAdapter.js';
import * as geminiAdapter from './adapters/geminiAdapter.js';
import * as anthropicAdapter from './adapters/anthropicAdapter.js';
import * as mistralAdapter from './adapters/mistralAdapter.js';
import * as openrouterAdapter from './adapters/openrouterAdapter.js';

/**
 * Runtime provider state. Holds the active config in memory only.
 * No API keys are ever persisted to disk here.
 */
let activeConfig = null;

// Load from .env on startup
export function loadFromEnv() {
  const provider = process.env.AI_PROVIDER || null;
  if (!provider) return;

  const configMap = {
    openai: {
      provider: 'openai',
      displayName: 'OpenAI',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4.1',
      baseUrl: null,
      apiKeySource: process.env.OPENAI_API_KEY ? 'env' : 'not_configured',
      status: process.env.OPENAI_API_KEY ? 'not_connected' : 'not_configured',
    },
    gemini: {
      provider: 'gemini',
      displayName: 'Google Gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      baseUrl: null,
      apiKeySource: process.env.GEMINI_API_KEY ? 'env' : 'not_configured',
      status: process.env.GEMINI_API_KEY ? 'not_connected' : 'not_configured',
    },
    anthropic: {
      provider: 'anthropic',
      displayName: 'Anthropic Claude',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
      baseUrl: null,
      apiKeySource: process.env.ANTHROPIC_API_KEY ? 'env' : 'not_configured',
      status: process.env.ANTHROPIC_API_KEY ? 'not_connected' : 'not_configured',
    },
    mistral: {
      provider: 'mistral',
      displayName: 'Mistral',
      apiKey: process.env.MISTRAL_API_KEY || '',
      model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
      baseUrl: null,
      apiKeySource: process.env.MISTRAL_API_KEY ? 'env' : 'not_configured',
      status: process.env.MISTRAL_API_KEY ? 'not_connected' : 'not_configured',
    },
    openrouter: {
      provider: 'openrouter',
      displayName: 'OpenRouter',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      model: process.env.OPENROUTER_MODEL || '',
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKeySource: process.env.OPENROUTER_API_KEY ? 'env' : 'not_configured',
      status: process.env.OPENROUTER_API_KEY ? 'not_connected' : 'not_configured',
    },
  };

  if (configMap[provider]) {
    activeConfig = configMap[provider];
    console.log(`[AI] Loaded provider "${provider}" from environment.`);
  }
}

export function getActiveConfig() {
  return activeConfig ? { ...activeConfig, apiKey: undefined } : null;
}

export function getMaskedConfig() {
  if (!activeConfig) return null;
  return {
    ...activeConfig,
    apiKey: maskKey(activeConfig.apiKey),
  };
}

export function setConfig(cfg) {
  activeConfig = { ...cfg };
}

export function isConnected() {
  return activeConfig?.status === 'connected';
}

function maskKey(key) {
  if (!key || key.length < 8) return '***';
  return key.substring(0, 3) + '...' + key.substring(key.length - 4);
}

function getAdapter(provider) {
  const adapters = {
    openai: openaiAdapter,
    gemini: geminiAdapter,
    anthropic: anthropicAdapter,
    mistral: mistralAdapter,
    openrouter: openrouterAdapter,
  };
  if (!adapters[provider]) throw new Error(`Unknown provider: ${provider}`);
  return adapters[provider];
}

export async function testConnection(cfg) {
  const adapter = getAdapter(cfg.provider);
  return adapter.testConnection(cfg);
}

export async function generate(input) {
  if (!activeConfig || !activeConfig.apiKey) {
    throw new Error('AI provider is not configured. Add an API key in Settings.');
  }
  const adapter = getAdapter(activeConfig.provider);
  return adapter.generate(activeConfig, input);
}

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
      textModel: process.env.OPENAI_MODEL || 'gpt-4o',
      imageModel: process.env.OPENAI_IMAGE_MODEL || 'dall-e-3',
      baseUrl: null,
      apiKeySource: process.env.OPENAI_API_KEY ? 'env' : 'not_configured',
      status: process.env.OPENAI_API_KEY ? 'not_connected' : 'not_configured',
    },
    gemini: {
      provider: 'gemini',
      displayName: 'Google Gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      textModel: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
      imageModel: null,
      baseUrl: null,
      apiKeySource: process.env.GEMINI_API_KEY ? 'env' : 'not_configured',
      status: process.env.GEMINI_API_KEY ? 'not_connected' : 'not_configured',
    },
    anthropic: {
      provider: 'anthropic',
      displayName: 'Anthropic Claude',
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      textModel: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest',
      imageModel: null,
      baseUrl: null,
      apiKeySource: process.env.ANTHROPIC_API_KEY ? 'env' : 'not_configured',
      status: process.env.ANTHROPIC_API_KEY ? 'not_connected' : 'not_configured',
    },
    mistral: {
      provider: 'mistral',
      displayName: 'Mistral',
      apiKey: process.env.MISTRAL_API_KEY || '',
      textModel: process.env.MISTRAL_MODEL || 'mistral-large-latest',
      imageModel: null,
      baseUrl: null,
      apiKeySource: process.env.MISTRAL_API_KEY ? 'env' : 'not_configured',
      status: process.env.MISTRAL_API_KEY ? 'not_connected' : 'not_configured',
    },
    openrouter: {
      provider: 'openrouter',
      displayName: 'OpenRouter / OpenAI-Compatible',
      apiKey: process.env.OPENROUTER_API_KEY || '',
      textModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o',
      imageModel: process.env.OPENROUTER_IMAGE_MODEL || '',
      baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      apiKeySource: process.env.OPENROUTER_API_KEY ? 'env' : 'not_configured',
      status: process.env.OPENROUTER_API_KEY ? 'not_connected' : 'not_configured',
    }
  };

  if (configMap[provider]) {
    activeConfig = configMap[provider];
    console.log(`[AI] Loaded provider "${provider}" from environment.`);
  }
}

export function getActiveConfig() {
  return activeConfig ? { ...activeConfig, apiKey: undefined } : null;
}

export function updateConfig(newConfig) {
  if (!newConfig.provider) throw new Error('Provider must be specified');
  
  activeConfig = {
    provider: newConfig.provider,
    apiKey: newConfig.apiKey || '',
    textModel: newConfig.textModel || '',
    imageModel: newConfig.imageModel || '',
    baseUrl: newConfig.baseUrl || null,
    apiKeySource: newConfig.apiKey ? 'session' : 'not_configured',
    status: newConfig.apiKey ? 'connected' : 'not_configured',
  };
  return activeConfig;
}

export function getMaskedConfig() {
  if (!activeConfig) return null;
  return {
    provider: activeConfig.provider,
    textModel: activeConfig.textModel,
    imageModel: activeConfig.imageModel,
    baseUrl: activeConfig.baseUrl,
    status: activeConfig.status,
    apiKeySource: activeConfig.apiKeySource,
  };
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

export async function compileImagePrompt(systemPrompt, userPrompt) {
  if (!activeConfig || !activeConfig.apiKey) {
    throw new Error('AI provider is not configured. Add an API key in Settings.');
  }
  const adapter = getAdapter(activeConfig.provider);
  if (typeof adapter.compileImagePrompt !== 'function') {
    // If provider doesn't have text capabilities for compiling, just return the user prompt
    return userPrompt;
  }
  return adapter.compileImagePrompt(activeConfig, systemPrompt, userPrompt);
}

export async function generateImage(input) {
  if (!activeConfig || !activeConfig.apiKey) {
    throw new Error('AI provider is not configured. Add an API key in Settings.');
  }
  const adapter = getAdapter(activeConfig.provider);
  if (typeof adapter.generateImage !== 'function') {
    throw new Error('No image-capable provider or model is configured for Visual Studio.');
  }
  return adapter.generateImage(activeConfig, input);
}

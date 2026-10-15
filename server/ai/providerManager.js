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
      textModel: process.env.OPENAI_MODEL || 'gpt-6-luna',
      imageModel: process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2',
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
  return activeConfig ? { ...activeConfig } : null;
}

export function updateConfig(newConfig) {
  if (!newConfig.provider) throw new Error('Provider must be specified');
  const cleanKey = typeof newConfig.apiKey === 'string' ? newConfig.apiKey.trim() : '';
  const resolvedTextModel =
    newConfig.textModel ||
    newConfig.model ||
    (newConfig.provider === 'openai' ? (process.env.OPENAI_MODEL || 'gpt-6-luna') : '');
  
  activeConfig = {
    provider: newConfig.provider,
    apiKey: cleanKey,
    textModel: resolvedTextModel,
    imageModel: newConfig.imageModel || (newConfig.provider === 'openai' ? (process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2') : ''),
    baseUrl: newConfig.baseUrl || null,
    apiKeySource: newConfig.apiKeySource || (cleanKey ? 'session' : 'not_configured'),
    status: newConfig.status || (cleanKey ? 'connected' : 'not_configured'),
    lastTestedAt: newConfig.lastTestedAt || new Date().toISOString(),
  };
  return activeConfig;
}

export function setConfig(newConfig) {
  return updateConfig(newConfig);
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
    lastTestedAt: activeConfig.lastTestedAt || null,
  };
}

export function isConnected() {
  return activeConfig?.status === 'connected';
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
  const cleanKey = typeof cfg.apiKey === 'string' ? cfg.apiKey.trim() : '';
  return adapter.testConnection({
    ...cfg,
    apiKey: cleanKey,
  });
}


/**
 * Execute generation with one bounded quality-repair attempt.
 *
 * Every adapter already runs the deterministic COH quality gate. When a
 * structurally valid candidate fails that gate, the manager permits exactly
 * one targeted retry carrying only the failed dimensions and the prior
 * candidate. This is deliberately bounded to prevent loops, cost runaway,
 * or iterative claim drift.
 */
export async function generate(input) {
  if (!activeConfig || !activeConfig.apiKey) {
    throw new Error('AI provider is not configured. Add an API key in Settings.');
  }
  const adapter = getAdapter(activeConfig.provider);
  const firstResult = await adapter.generate(activeConfig, input);

  const firstQuality = firstResult?.data?.qualityCheck;
  const firstIssues = Array.isArray(firstQuality?.issues) ? firstQuality.issues.filter(Boolean) : [];
  const mode = String(input?.mode || input?.taskType || 'creation');
  const repairEligible =
    firstResult?.success === true &&
    firstQuality?.passed === false &&
    firstIssues.length > 0 &&
    !input?.__qualityRepairAttempt &&
    mode !== 'source_analysis' &&
    mode !== 'source-analysis';

  if (!repairEligible) return firstResult;

  const repairInput = {
    ...input,
    __qualityRepairAttempt: true,
    qualityRepairIssues: firstIssues.slice(0, 10),
    previousCandidate: firstResult.data,
  };

  try {
    const repairedResult = await adapter.generate(activeConfig, repairInput);
    const repairedQuality = repairedResult?.data?.qualityCheck;

    if (repairedResult?.success === true && repairedQuality?.passed === true) {
      repairedResult.data.qualityRepair = {
        attempted: true,
        repaired: true,
        originalIssues: firstIssues,
      };
      return repairedResult;
    }

    if (firstResult?.data) {
      firstResult.data.qualityRepair = {
        attempted: true,
        repaired: false,
        originalIssues: firstIssues,
        remainingIssues: Array.isArray(repairedQuality?.issues) ? repairedQuality.issues : [],
      };
    }
    return firstResult;
  } catch (error) {
    console.warn('[AI] Controlled quality repair attempt failed:', error?.message || error);
    if (firstResult?.data) {
      firstResult.data.qualityRepair = {
        attempted: true,
        repaired: false,
        originalIssues: firstIssues,
        remainingIssues: ['Repair attempt could not be completed. Original candidate preserved.'],
      };
    }
    return firstResult;
  }
}

export async function compileImagePrompt(systemPrompt, userPrompt) {
  if (!activeConfig || !activeConfig.apiKey) {
    throw new Error('AI provider is not configured. Add an API key in Settings.');
  }
  const adapter = getAdapter(activeConfig.provider);
  if (typeof adapter.compileImagePrompt !== 'function') {
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

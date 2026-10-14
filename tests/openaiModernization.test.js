import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as openaiAdapter from '../server/ai/adapters/openaiAdapter.js';
import * as geminiAdapter from '../server/ai/adapters/geminiAdapter.js';
import * as anthropicAdapter from '../server/ai/adapters/anthropicAdapter.js';
import * as mistralAdapter from '../server/ai/adapters/mistralAdapter.js';
import * as openrouterAdapter from '../server/ai/adapters/openrouterAdapter.js';
import * as providerManager from '../server/ai/providerManager.js';

export const COH_BENCHMARK_FIXTURES = [
  {
    id: 'routine-source-summarization',
    title: 'Routine Source Summarization',
    input: {
      mode: 'quick_create',
      channel: 'Internal Note',
      audience: 'Internal team',
      language: 'English',
      rawInput: 'Summarize key facts from the Soria Moria rehearsal notes without inventing dates or partners.'
    }
  },
  {
    id: 'short-linkedin-draft',
    title: 'Short LinkedIn Draft',
    input: {
      mode: 'quick_create',
      channel: 'LinkedIn',
      outputFormat: 'Short Post',
      audience: 'Sponsors and patrons',
      language: 'English',
      rawInput: 'Explain why live opera is the origin asset of the Climate Opera Haus content ecosystem.'
    }
  },
  {
    id: 'institutional-content-draft',
    title: 'Institutional Content Draft',
    input: {
      mode: 'advanced_brief',
      channel: 'Website',
      outputFormat: 'Institutional Overview',
      audience: 'Cultural institutions',
      language: 'English',
      rawInput: 'Outline how The Climate Tetralogy operates as a repeatable repertoire canon for host venues.'
    }
  },
  {
    id: 'translation-localization-request',
    title: 'Translation / Localization Request',
    input: {
      mode: 'quick_create',
      channel: 'Newsletter',
      audience: 'General cultural audience',
      language: 'German',
      rawInput: 'Localize the introduction to Climate Opera Haus for German cultural subscribers while preserving proper work titles.'
    }
  },
  {
    id: 'structured-brief-resolution',
    title: 'Structured Brief Resolution',
    input: {
      mode: 'advanced_brief',
      channel: 'Email / Direct Outreach',
      outputFormat: 'Partner Outreach Note',
      audience: 'Opera houses and festivals',
      language: 'English',
      rawInput: 'Draft a structured curatorial outreach brief separating current artistic readiness from future touring pathways.'
    }
  },
  {
    id: 'difficult-reframing-instruction',
    title: 'Difficult Reframing-Like Instruction',
    input: {
      mode: 'advanced_brief',
      channel: 'LinkedIn',
      audience: 'Sponsors and patrons',
      language: 'English',
      rawInput: 'Reframe an internal artistic production note about elemental water staging into an institution-grade partnership perspective without ESG cliches.'
    }
  }
];

describe('COH-CS-02 OpenAI Provider Modernization & Multi-Provider Regression Suite', () => {
  test('1. Capability matrix supports gpt-6-luna (Efficient) and gpt-6.1-sol (Advanced) without legacy temperature', () => {
    const lunaCap = openaiAdapter.getOpenAICapabilities('gpt-6-luna');
    assert.equal(lunaCap.model, 'gpt-6-luna');
    assert.equal(lunaCap.tier, 'Efficient');
    assert.equal(lunaCap.preferredEndpoint, '/v1/responses');
    assert.equal(lunaCap.supportsStructuredJson, true);
    assert.equal(lunaCap.supportsTemperature, false);

    const solCap = openaiAdapter.getOpenAICapabilities('gpt-6.1-sol');
    assert.equal(solCap.model, 'gpt-6.1-sol');
    assert.equal(solCap.tier, 'Advanced');
    assert.equal(solCap.preferredEndpoint, '/v1/responses');
    assert.equal(solCap.supportsStructuredJson, true);
    assert.equal(solCap.supportsTemperature, false);

    const legacyCap = openaiAdapter.getOpenAICapabilities('gpt-4o');
    assert.equal(legacyCap.tier, 'Legacy / Compatible');
    assert.equal(legacyCap.preferredEndpoint, '/v1/chat/completions');
    assert.equal(legacyCap.supportsTemperature, true);
  });

  test('2. Request builder omits unsupported temperature for GPT-6 models and uses structured output', () => {
    const lunaReq = openaiAdapter.buildOpenAIRequest('gpt-6-luna', null, 'System rules', 'User task', true);
    assert.equal(lunaReq.url, 'https://api.openai.com/v1/responses');
    assert.equal('temperature' in lunaReq.payload, false);
    assert.deepEqual(lunaReq.payload.text, { format: { type: 'json_object' } });

    const solFallbackReq = openaiAdapter.buildOpenAIRequest('gpt-6.1-sol', null, 'System rules', 'User task', true, '/v1/chat/completions');
    assert.equal(solFallbackReq.url, 'https://api.openai.com/v1/chat/completions');
    assert.equal('temperature' in solFallbackReq.payload, false);
    assert.deepEqual(solFallbackReq.payload.response_format, { type: 'json_object' });
  });

  test('3. Default model behavior preserves explicit OPENAI_MODEL and falls back to gpt-6-luna only when unconfigured', () => {
    const prevProvider = process.env.AI_PROVIDER;
    const prevModel = process.env.OPENAI_MODEL;

    try {
      process.env.AI_PROVIDER = 'openai';
      delete process.env.OPENAI_MODEL;
      providerManager.loadFromEnv();
      const defaultCfg = providerManager.getMaskedConfig();
      assert.equal(defaultCfg.textModel, 'gpt-6-luna');

      process.env.OPENAI_MODEL = 'gpt-4o';
      providerManager.loadFromEnv();
      const explicitCfg = providerManager.getMaskedConfig();
      assert.equal(explicitCfg.textModel, 'gpt-4o');
    } finally {
      if (prevProvider === undefined) delete process.env.AI_PROVIDER;
      else process.env.AI_PROVIDER = prevProvider;
      if (prevModel === undefined) delete process.env.OPENAI_MODEL;
      else process.env.OPENAI_MODEL = prevModel;
    }
  });

  test('4. Executes COH benchmark smoke fixtures across gpt-6-luna and gpt-6.1-sol via mocked transport', async () => {
    const origFetch = globalThis.fetch;
    const capturedRequests = [];

    globalThis.fetch = async (url, options) => {
      const body = JSON.parse(options.body);
      capturedRequests.push({ url, body });
      const mockDraftResponse = {
        drafts: [
          {
            label: 'Version A',
            headline: 'Climate Opera Haus Institutional Perspective',
            copy: 'Live opera creates the operatic world; filming and institutional partnerships extend its cultural durability.',
            cta: 'Explore institutional programming fit.'
          },
          {
            label: 'Version B',
            headline: 'Repertoire Canon & Asset Logic',
            copy: 'The Climate Tetralogy is structured as long-term cultural IP designed to travel across international stages.',
            cta: 'Discuss partnership pathways.'
          }
        ],
        shorterVersion: 'Live opera creates the world; capture and partnerships extend it.',
        visualDesignBrief: { atmosphere: 'Elemental, architectural, serious' },
        editorialWarnings: []
      };

      // Return Responses API shape for /v1/responses
      return {
        ok: true,
        status: 200,
        json: async () => ({
          output_text: JSON.stringify(mockDraftResponse)
        }),
        text: async () => JSON.stringify({ output_text: JSON.stringify(mockDraftResponse) })
      };
    };

    try {
      for (const model of ['gpt-6-luna', 'gpt-6.1-sol']) {
        for (const fixture of COH_BENCHMARK_FIXTURES) {
          const res = await openaiAdapter.generate(
            { apiKey: 'test-redacted-key', textModel: model },
            fixture.input
          );
          assert.equal(res.success, true, `Fixture ${fixture.id} failed on ${model}`);
          assert.ok(Array.isArray(res.data.drafts));
          assert.equal(res.data.drafts.length, 2);
        }
      }
      assert.equal(capturedRequests.length, COH_BENCHMARK_FIXTURES.length * 2);
      for (const req of capturedRequests) {
        assert.equal('temperature' in req.body, false);
      }
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  test('5. Preserves image prompt compilation, GPT Image 2 generation, and all 5 provider adapters with masked keys', async () => {
    const origFetch = globalThis.fetch;
    globalThis.fetch = async (url, options) => {
      const body = options?.body ? JSON.parse(options.body) : {};
      if (String(url).includes('/v1/images/generations')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ data: [{ b64_json: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=' }] })
        };
      }
      if (String(url).includes('generativelanguage.googleapis.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            candidates: [{ content: { parts: [{ text: JSON.stringify({ ok: true, provider: 'gemini', model: 'gemini-1.5-pro' }) }] } }]
          })
        };
      }
      if (String(url).includes('api.anthropic.com')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            content: [{ text: JSON.stringify({ ok: true, provider: 'anthropic', model: body.model }) }]
          })
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          output_text: JSON.stringify({ ok: true, provider: 'openai', model: body.model }),
          choices: [{ message: { content: JSON.stringify({ ok: true, provider: 'generic', model: body.model }) } }]
        })
      };
    };

    try {
      // Test connection across all 5 providers
      const openaiTest = await openaiAdapter.testConnection({ apiKey: 'sk-test-12345678', textModel: 'gpt-6-luna' });
      assert.equal(openaiTest.connected, true);
      assert.equal(openaiTest.tier, 'Efficient');

      const geminiTest = await geminiAdapter.testConnection({ apiKey: 'gm-test-12345678', textModel: 'gemini-1.5-pro' });
      assert.equal(geminiTest.connected, true);

      const anthropicTest = await anthropicAdapter.testConnection({ apiKey: 'ak-test-12345678', textModel: 'claude-3-5-sonnet-latest' });
      assert.equal(anthropicTest.connected, true);

      const mistralTest = await mistralAdapter.testConnection({ apiKey: 'ms-test-12345678', textModel: 'mistral-large-latest' });
      assert.equal(mistralTest.connected, true);

      const openrouterTest = await openrouterAdapter.testConnection({ apiKey: 'or-test-12345678', textModel: 'openai/gpt-4o' });
      assert.equal(openrouterTest.connected, true);

      // Verify image generation path intact
      const images = await openaiAdapter.generateImage(
        { apiKey: 'sk-test-12345678', imageModel: 'gpt-image-2' },
        { prompt: 'Elemental stage architecture', width: 1024, height: 1024 }
      );
      assert.equal(images.length, 1);
      assert.ok(images[0].startsWith('data:image/png;base64,'));

      // Verify API key is never exposed in getMaskedConfig
      providerManager.updateConfig({
        provider: 'openai',
        apiKey: 'sk-secret-never-expose-9999',
        textModel: 'gpt-6.1-sol',
        imageModel: 'gpt-image-2'
      });
      const masked = providerManager.getMaskedConfig();
      assert.equal('apiKey' in masked, false);
      assert.equal(masked.textModel, 'gpt-6.1-sol');
    } finally {
      globalThis.fetch = origFetch;
    }
  });
});

# COH-CS-02 Implementation Report

## 1. Objective
Modernize the OpenAI provider integration for `gpt-6-luna` (`Efficient`, default when no explicit OpenAI text model is configured) and `gpt-6.1-sol` (`Advanced`) using a capability-based request layer, while preserving all other providers (`gemini`, `anthropic`, `mistral`, `openrouter`) and image generation (`gpt-image-2`, `gpt-image-1`, `dall-e-3`).

## 2. Architecture Inspected
- `server/ai/providerManager.js`
- `server/ai/adapters/openaiAdapter.js`
- `server/ai/adapters/geminiAdapter.js`
- `server/ai/adapters/anthropicAdapter.js`
- `server/ai/adapters/mistralAdapter.js`
- `server/ai/adapters/openrouterAdapter.js`
- `server.js` (`/api/ai/status`, `/api/ai/test`, `/api/ai/configure`, `/api/ai/generate`)
- `src/App.tsx` (`MODEL_REGISTRY`, Settings model selection, `Test Connection` handler)

## 3. Implementation Approach
- Replaced legacy `model.startsWith('gpt-4')` and hardcoded `temperature: 0.8` in `server/ai/adapters/openaiAdapter.js` with `getOpenAICapabilities()`, `buildOpenAIRequest()`, and `extractOpenAIText()`.
- Configured `gpt-6-luna` (`Efficient`) and `gpt-6.1-sol` (`Advanced`) to use the official `/v1/responses` contract (`instructions`, `input`, `text.format: { type: 'json_object' }`) with automatic fallback to `/v1/chat/completions` if a proxy or endpoint returns 404/unsupported URL, and omitted `temperature` on modern GPT-6/reasoning models.
- Updated `server/ai/providerManager.js` and `src/App.tsx` so `gpt-6-luna` is the default OpenAI text model only when no explicit `OPENAI_MODEL` or saved session model exists.
- Fixed pre-existing argument-order bugs in `anthropicAdapter.js` and `mistralAdapter.js` where `baseUrl` was passed in the `systemPrompt` position.
- Created `tests/openaiModernization.test.js` with 6 COH benchmark smoke fixtures (`COH_BENCHMARK_FIXTURES`) and multi-provider contract tests.

## 4. Behavior Changed
- `gpt-6-luna` (`Efficient`) and `gpt-6.1-sol` (`Advanced`) are now first-class selectable OpenAI text models in Settings.
- Default OpenAI text model when unconfigured is now `gpt-6-luna`.
- Structured JSON output is requested for all capable OpenAI models without relying on `model.startsWith('gpt-4')`.
- Unsupported `temperature` parameters are no longer sent to GPT-6 or reasoning models.
- Settings `Test Connection` explicitly reports provider, selected model, success/failure, and latency.

## 5. Behavior Deliberately Preserved
- Explicit `OPENAI_MODEL` environment configurations and saved session models are preserved.
- Legacy models (`gpt-5.5`, `gpt-5.4`, `gpt-5.4-mini`, `gpt-4o`) remain available in `MODEL_REGISTRY`.
- Image prompt compilation and image generation (`gpt-image-2`, `gpt-image-1`, `dall-e-3`) remain intact.
- OpenRouter and other providers are not forced through OpenAI-specific `/v1/responses` contracts.
- API keys remain masked and are never persisted insecurely or logged.

## 6. Files Materially Changed
- `server/ai/adapters/openaiAdapter.js`
- `server/ai/providerManager.js`
- `server/ai/adapters/anthropicAdapter.js`
- `server/ai/adapters/mistralAdapter.js`
- `server/ai/adapters/geminiAdapter.js`
- `server/ai/adapters/openrouterAdapter.js`
- `src/App.tsx`
- `tests/openaiModernization.test.js`

## 7. Decisions Made
- Since no live `OPENAI_API_KEY` is present in the local environment, live API calls are honestly recorded as `NOT RUN` in `OPENAI_CAPABILITY_MATRIX.md` while contract and mocked transport tests verify all 6 COH benchmark tasks.

## 8. Deviations
- None.

## 9. Known Limitations & Risks
- Live token-spend verification against OpenAI production servers should be executed via `Test Connection` once an operator supplies a live `OPENAI_API_KEY` in Settings or preview environment variables.

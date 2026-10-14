# OpenAI Capability Matrix (`COH-CS-02`)

**Adapter:** `server/ai/adapters/openaiAdapter.js` (`getOpenAICapabilities`, `buildOpenAIRequest`, `extractOpenAIText`)

---

## 1. Supported OpenAI Text Models

| Model ID | Product Label / Tier | Preferred Endpoint | Fallback Endpoint | Structured Output Mechanism | Optional Sampling / Reasoning Parameters | Default Fallback Status | Live-Test Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gpt-6-luna` | `Efficient` (Recommended) | `/v1/responses` | `/v1/chat/completions` | `text: { format: { type: 'json_object' } }` (or `response_format: { type: 'json_object' }` on fallback) | `supportsTemperature: false` (no legacy `temperature: 0.8` sent); `defaultReasoningEffort: 'low'` | **Default OpenAI Text Model** when no explicit `OPENAI_MODEL` or session model is configured | `NOT RUN` (No live `OPENAI_API_KEY` in local `.env`; verified via contract & benchmark smoke tests) |
| `gpt-6.1-sol` | `Advanced` | `/v1/responses` | `/v1/chat/completions` | `text: { format: { type: 'json_object' } }` (or `response_format: { type: 'json_object' }` on fallback) | `supportsTemperature: false` (no legacy `temperature: 0.8` sent); `defaultReasoningEffort: 'high'` | Selectable in Settings | `NOT RUN` (No live `OPENAI_API_KEY` in local `.env`; verified via contract & benchmark smoke tests) |
| `gpt-5.5` | `Compatible` | `/v1/chat/completions` | `/v1/chat/completions` | `response_format: { type: 'json_object' }` | `supportsTemperature: false` | Preserved for compatibility | `NOT RUN` (Verified via contract tests) |
| `gpt-5.4` | `Compatible` | `/v1/chat/completions` | `/v1/chat/completions` | `response_format: { type: 'json_object' }` | `supportsTemperature: false` | Preserved for compatibility | `NOT RUN` (Verified via contract tests) |
| `gpt-5.4-mini` | `Compatible` | `/v1/chat/completions` | `/v1/chat/completions` | `response_format: { type: 'json_object' }` | `supportsTemperature: false` | Preserved for compatibility | `NOT RUN` (Verified via contract tests) |
| `gpt-4o` | `Legacy / Compatible` | `/v1/chat/completions` | `/v1/chat/completions` | `response_format: { type: 'json_object' }` | `supportsTemperature: true` (`defaultTemperature: 0.7`) | Preserved for legacy fallback | `NOT RUN` (Verified via contract tests) |

---

## 2. Preserved Image Generation Models

| Model ID | Endpoint | Notes |
| :--- | :--- | :--- |
| `gpt-image-2` | `/v1/images/generations` | Recommended default image model; exact multiple-of-16 dimension validation and quality mapping (`low`, `medium`, `high`, `auto`). |
| `gpt-image-1` | `/v1/images/generations` | Preserved compatible GPT Image model. |
| `dall-e-3` | `/v1/images/generations` | Preserved legacy fallback (`1024x1024`, `1792x1024`, `1024x1792`, `b64_json`). |

---

## 3. Multi-Provider Regression Matrix

| Provider | Adapter | Status | Notes |
| :--- | :--- | :--- | :--- |
| `openai` | `server/ai/adapters/openaiAdapter.js` | **PASS** | Upgraded to capability-based request layer. |
| `gemini` | `server/ai/adapters/geminiAdapter.js` | **PASS** | Verified `testConnection` with `config.textModel || config.model`. |
| `anthropic` | `server/ai/adapters/anthropicAdapter.js` | **PASS** | Fixed `callAnthropic` argument ordering in `generate()` and `testConnection` model lookup. |
| `mistral` | `server/ai/adapters/mistralAdapter.js` | **PASS** | Fixed `callMistral` argument ordering in `generate()` and `testConnection` model lookup. |
| `openrouter` | `server/ai/adapters/openrouterAdapter.js` | **PASS** | Preserved OpenAI-compatible `/chat/completions` contract without forcing OpenAI `/v1/responses`. |

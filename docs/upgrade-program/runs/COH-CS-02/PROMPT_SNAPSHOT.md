# PROMPT COH-CS-02
## Modernize the OpenAI Provider for GPT-6 Luna and GPT-6.1 Sol Without Breaking Existing Providers

Continue on:

`feature/coh-content-intelligence-v2`

Preflight:

- read MASTER_PROTOCOL
- read COH-CS-00 and COH-CS-01 evidence
- verify branch
- verify clean/expected worktree
- build the app
- stop if predecessor status is FAIL or STOP

This task modernizes the OpenAI integration.

Do not modify unrelated product functionality.

---

## 1. Current problem

The existing OpenAI adapter was built around older GPT-4-era assumptions.

Known areas that require inspection include:

- `server/ai/providerManager.js`
- `server/ai/adapters/openaiAdapter.js`
- Settings model selection
- test-connection logic
- JSON/structured-output handling
- image-model handling

The existing implementation must be inspected rather than blindly replaced.

Current behavior includes legacy assumptions such as model-name-prefix checks and general request parameters.

Those assumptions must not simply be extended with another hardcoded prefix.

---

## 2. Required models

Add first-class support for the current OpenAI text models:

- `gpt-6-luna`
- `gpt-6.1-sol`

Use the exact current model IDs supported by the official OpenAI API at implementation time.

Before coding, verify relevant current OpenAI API documentation.

Do not infer API parameters from older GPT-4 behavior.

If official documentation has changed since this prompt was written, prefer the current official contract and document the deviation.

---

## 3. Intended product positioning

User-facing choices should remain simple.

At minimum expose:

### GPT-6 Luna
Label:
`Efficient`

Description concept:
Recommended for most routine Content Studio work and cost-efficient generation.

### GPT-6.1 Sol
Label:
`Advanced`

Description concept:
Stronger reasoning for difficult strategic or transformation work.

Do not add automatic model routing yet.

The user should choose deliberately.

Automatic routing may be evaluated later after actual COH benchmark evidence exists.

---

## 4. Default behavior

Do not silently override an explicitly configured model.

Rules:

- if `OPENAI_MODEL` is explicitly configured, preserve it
- if a saved/session model exists, preserve it
- if no OpenAI text model has been configured, prefer `gpt-6-luna` as the default OpenAI text model

Existing legacy models may remain available where technically supported.

Do not delete working legacy support merely to simplify the UI.

---

## 5. Capability-based OpenAI adapter

Refactor only as much as needed to stop relying on fragile model-name-era assumptions.

Build a small capability-based request layer.

It must safely handle differences such as:

- endpoint/request style
- structured output
- reasoning parameters
- temperature or other sampling controls
- token/output limits
- returned text extraction
- errors
- retries

Use official current OpenAI API behavior.

For direct OpenAI GPT-6 models, use the current recommended API path where appropriate.

If current OpenAI guidance recommends Responses API for these models, implement that cleanly.

Preserve a safe legacy path where needed for models/providers that still use Chat Completions.

Do not force OpenRouter or other OpenAI-compatible providers through an OpenAI-specific request contract they do not support.

---

## 6. Structured output

Content Studio depends on reliable structured JSON for several generation paths.

The upgraded adapter must:

- request structured output using supported current mechanisms
- parse returned content correctly
- retain existing repair/fallback protections where useful
- not rely on `model.startsWith("gpt-4")`
- produce meaningful provider errors
- fail safely rather than returning corrupted content

Do not weaken quality gates.

---

## 7. Reasoning/sampling compatibility

Do not blindly send `temperature: 0.8` or other parameters to every modern model.

Use a capability-aware request builder.

Only send parameters supported by the selected model/API path.

Do not invent model-specific restrictions.

Ground them in current official documentation or actual provider response behavior.

---

## 8. Preserve every other provider

Regression-test:

- OpenAI
- Gemini
- Anthropic
- Mistral
- OpenRouter/OpenAI-compatible

Do not make OpenAI modernization break existing adapters.

Provider configuration and API keys must remain:

- masked
- never persisted insecurely
- never printed in logs
- never written into evidence

---

## 9. Preserve image generation

Do not broadly redesign Visual Studio or image generation in this task.

Confirm existing image models continue functioning through their current paths.

Text-model modernization must not break:

- image prompt compilation
- existing GPT Image behavior
- existing DALL-E fallback behavior where still supported

Only change image code when technically required for compatibility.

---

## 10. Settings UX

Improve model selection only enough to make choices understandable.

Settings should clearly distinguish:

- provider
- text model
- image model

For OpenAI text models show Luna and Sol in a clean hierarchy.

Do not turn Settings into a model engineering dashboard.

Preserve Test Connection.

Test Connection must report:

- provider
- selected model
- connection success/failure
- latency if already supported

No secrets.

---

## 11. COH benchmark smoke test

Create a small reusable test fixture representing several COH tasks without production data:

- routine source summarization
- short LinkedIn draft
- institutional content draft
- translation/localization request
- structured brief resolution
- difficult reframing-like instruction

Do not build Reframing Studio yet.

Where API credentials are available safely, run the smallest practical live verification for Luna and Sol.

Avoid unnecessary token spend.

Where credentials are unavailable, use contract/mocked tests and mark live verification as NOT RUN rather than PASS.

---

## 12. Acceptance criteria

PASS only if:

- build passes
- `gpt-6-luna` is selectable
- `gpt-6.1-sol` is selectable
- existing explicit model config is preserved
- Luna becomes the fallback only when no explicit OpenAI text model exists
- structured output works through the current architecture
- unsupported parameters are not blindly sent
- provider failures are user-understandable
- API keys remain protected
- other providers are not broken
- image generation path remains intact
- no database/schema changes
- no production Vercel changes
- no production deployment

---

## 13. Evidence

Create:

`docs/upgrade-program/runs/COH-CS-02/`

Include standard evidence plus:

`OPENAI_CAPABILITY_MATRIX.md`

Document:

- each supported OpenAI text model
- endpoint/path used
- structured-output mechanism
- optional parameters
- fallback behavior
- live-test status

Do not include secrets.

Update MASTER_REGISTER and Drive archive/sync manifests.

Do not merge to main.

---

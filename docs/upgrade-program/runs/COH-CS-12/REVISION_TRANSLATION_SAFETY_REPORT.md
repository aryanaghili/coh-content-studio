# COH-CS-12: Revision Translation Safety Report

## 1. Classification of Revision Actions (`src/lib/revisionActions.ts`)

Every action in `REVISION_ACTIONS` is explicitly classified with `executionMode: 'deterministic-safe' | 'ai-required'`:

- **`deterministic-safe`**:
  - Punctuation/artifact cleanup (`clean-ai-punctuation`, `improve-clarity`, `fix-grammar`, `remove-awkward`, `smoother`)
  - Structural/length adjustments (`shorter`, `shorter-version`, `longer-version`, `remove-repetition`, `bullet-points`, `to-bullets`, `paragraph`, `add-hook`, `add-cta`, `openings`, `ctas`, `stronger-headline`, `email`, `social-post`, `adapt-channel`, `extract-quotes`)
  - Claim discipline (`remove-unsupported`, `flag-claims`, `more-careful`, `stronger-proof`, `less-exaggerated`, `simplify-claims`)
  - Tone & COH framing adjustments in English (`coh-specific`, `institutional`, `sponsor-facing`, `less-ngo`, `less-corporate`, `preserve-meaning`, `english-polished`, etc.)
- **`ai-required`**:
  - Translation & target-language localization (`translate`, `translate-selected`, `localize`, `localize-selected`, `adapt-channel-lang`)
  - Natural spoken Persian rewriting (`persian-natural`)
  - Deep creative rewriting (`make-controversial`, `make-story`)

---

## 2. Removal of Fake Offline Translation Fallback (`src/lib/smartBriefAndRevision.ts` & `src/components/RevisionStudio.tsx`)

Previously, `executeDeterministicRevisionRecipe` prepended a canned Portuguese (`[PT-EU | Português Europeu] ...`) or Persian (`[FA | فارسی روان و طبیعی] ...`) header onto the English draft when offline.

Remediation:
1. `executeDeterministicRevisionRecipe` now checks `recipe.requiresAiExecution || isAiRequiredRevisionAction(...)` and throws a clear error (`AI Connection Required: Translation, localization (...), or deep semantic rewriting cannot be faked offline. Your current draft has been preserved unchanged.`).
2. In `RevisionStudio.tsx`, when an `ai-required` recipe fails or when AI is disconnected:
   - It does NOT fall back to `executeDeterministicRevisionRecipe`.
   - `state.currentDraft` and `state.revisedOutput` are preserved untouched.
   - No fake translated entry is pushed to `state.versionHistory` or saved to the library.
   - `state.error` surfaces the clear user-facing error message.

---

## 3. AI Translation Output Validation (`validateRevisionTranslationOutput`)

When AI is connected and returns `revisedCopy` for a translation/localization recipe, `validateRevisionTranslationOutput` verifies:
1. **No Fake Fallback Prefixes**: Rejects `[Translated to ...]`, `[Localized for ...]`, `[PT-EU | Português Europeu]`, or `[FA | فارسی روان و طبیعی]`.
2. **Persian Target Validation**: Requires Persian Unicode script (`[\u0600-\u06FF]`) when `targetLanguage` is Persian or `persian-natural` is selected.
3. **European Portuguese (`PT-EU`) Target Validation**: Rejects outputs that are identical to `previousDraft` or retain high English stopword density (`>= 4` common English stopwords) with zero Portuguese lexical/diacritic markers.

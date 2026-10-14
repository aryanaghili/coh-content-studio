import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SOURCE_INTELLIGENCE_STORAGE_KEY,
  SOURCE_INTELLIGENCE_DISCLAIMER,
  loadSourceIntelligenceStore,
  upsertSourceIntelligenceRecord,
  removeSourceIntelligenceRecord,
  validateExactSourceExcerpt,
  enforceSourceIntelligenceClaimDiscipline,
  buildDeterministicSourceAnalysis,
  compileSourceGroundingContext,
  prepareSourceForReframing,
  type SourceRecordLike
} from '../src/lib/sourceIntelligence.ts';
import { compileGovernedContext } from '../src/lib/contextCompiler.ts';
import { createDefaultOperatingCore } from '../src/lib/operatingCore.ts';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, val: string) {
      store.set(key, val);
    },
    dump() {
      return Object.fromEntries(store.entries());
    }
  };
}

describe('COH-CS-03 Source Intelligence & Task-Level Source Context System', () => {
  test('1. Non-destructive versioned persistence, corruption recovery, regeneration, and deletion cleanup', () => {
    const rawSource: SourceRecordLike = {
      id: 'src-soria-1',
      title: 'Soria Moria Production Brief',
      type: 'Campaign Notes',
      content: 'Soria Moria is the foundational first work in The Climate Tetralogy. Development workshops are scheduled in Oslo.',
      notes: 'Internal production note.'
    };
    const originalRawSnapshot = JSON.stringify(rawSource);

    // 1a. Corrupted storage payload does not throw or break source access
    const corruptedStorage = createMemoryStorage({
      [SOURCE_INTELLIGENCE_STORAGE_KEY]: '{corrupted-json-payload:::['
    });
    const recovered = loadSourceIntelligenceStore(corruptedStorage);
    assert.deepEqual(recovered, {});

    // 1b. Upsert derived analysis and verify raw source is untouched
    const memStorage = createMemoryStorage();
    const core = createDefaultOperatingCore();
    const analysis1 = buildDeterministicSourceAnalysis(rawSource, core);
    const afterSave = upsertSourceIntelligenceRecord({}, analysis1, memStorage);

    assert.equal(JSON.stringify(rawSource), originalRawSnapshot, 'Raw source record must never be mutated');
    assert.ok(afterSave['src-soria-1']);
    assert.equal(afterSave['src-soria-1'].disclaimer, SOURCE_INTELLIGENCE_DISCLAIMER);

    const reloaded = loadSourceIntelligenceStore(memStorage);
    assert.equal(reloaded['src-soria-1'].sourceTitle, 'Soria Moria Production Brief');

    // 1c. Regeneration overwrites only the derived analysis entry
    const regenerated = upsertSourceIntelligenceRecord(
      reloaded,
      {
        ...analysis1,
        strategicContext: 'Updated strategic context after regeneration.',
        analyzedAt: '2026-10-14T12:00:00.000Z'
      },
      memStorage
    );
    assert.equal(regenerated['src-soria-1'].strategicContext, 'Updated strategic context after regeneration.');

    // 1d. Source deletion removes derived analysis cleanly
    const afterDelete = removeSourceIntelligenceRecord(regenerated, 'src-soria-1', memStorage);
    assert.equal(afterDelete['src-soria-1'], undefined);
  });

  test('2. Claim discipline flags untraceable numbers, separates aspirations, and blocks Approved Example / Visual Reference claims', () => {
    const eventSource: SourceRecordLike = {
      id: 'src-event-2027',
      title: 'RESONANCE 2027 Working Note',
      type: 'Event Notes',
      content: 'RESONANCE 2027 is the flagship cultural milestone. The team aims to engage 12 partner venues across Europe.',
      notes: 'Early milestone note.'
    };

    // Pass an AI response containing an untraceable number (500,000) and an aspiration ("aims to engage 12 partner venues")
    const disciplined = enforceSourceIntelligenceClaimDiscipline(
      {
        sourceId: eventSource.id,
        sourceTitle: eventSource.title,
        sourceType: eventSource.type,
        keyFacts: [
          'RESONANCE 2027 is the flagship cultural milestone.',
          'The event has confirmed 500,000 ticket buyers.', // 500,000 is NOT in raw source
          'The team aims to engage 12 partner venues across Europe.' // Aspiration
        ],
        supportedClaims: [
          'RESONANCE 2027 is the flagship cultural milestone.',
          'The team aims to engage 12 partner venues across Europe.'
        ],
        usefulExcerpts: [
          'RESONANCE 2027 is the flagship cultural milestone.',
          'This fabricated quote does not exist anywhere in the source.'
        ],
        cautionsAndAmbiguities: []
      },
      eventSource
    );

    assert.equal(disciplined.disclaimer, SOURCE_INTELLIGENCE_DISCLAIMER);
    assert.deepEqual(disciplined.keyFacts, ['RESONANCE 2027 is the flagship cultural milestone.']);
    assert.deepEqual(disciplined.supportedClaims, ['RESONANCE 2027 is the flagship cultural milestone.']);
    assert.ok(
      disciplined.cautionsAndAmbiguities.some(c => c.includes('500,000') && c.includes('not directly traceable')),
      'Untraceable numbers must be flagged in cautionsAndAmbiguities'
    );
    assert.ok(
      disciplined.cautionsAndAmbiguities.some(c => c.includes('Aspiration')),
      'Aspirations must be separated into cautionsAndAmbiguities'
    );
    assert.deepEqual(
      disciplined.usefulExcerpts,
      ['RESONANCE 2027 is the flagship cultural milestone.'],
      'Fabricated excerpts must be stripped so only verbatim source excerpts remain'
    );

    // Approved Example source must never produce factual keyFacts or supportedClaims
    const approvedExampleSource: SourceRecordLike = {
      id: 'src-example-1',
      title: 'Approved LinkedIn Example',
      type: 'Approved Example',
      content: 'Climate Opera Haus convenes cultural leaders in Vienna in 2027.',
      notes: 'Tone benchmark.'
    };
    const exampleAnalysis = enforceSourceIntelligenceClaimDiscipline(
      {
        keyFacts: ['Climate Opera Haus convenes cultural leaders in Vienna in 2027.'],
        supportedClaims: ['Vienna 2027 is confirmed.']
      },
      approvedExampleSource
    );
    assert.equal(exampleAnalysis.keyFacts.length, 0, 'Approved Example must not produce factual keyFacts');
    assert.equal(exampleAnalysis.supportedClaims.length, 0, 'Approved Example must not produce supportedClaims');
    assert.ok(exampleAnalysis.cautionsAndAmbiguities.some(c => c.includes('Approved Example source')));
  });

  test('3. Exact excerpt validator preserves verbatim substrings and rejects fabricated quotes', () => {
    const src = {
      content: 'The Golden Fountain explores water scarcity through operatic stagecraft and architectural sound.',
      notes: 'Act II staging notes.'
    };

    const validCheck = validateExactSourceExcerpt(src, 'operatic stagecraft and architectural sound.');
    assert.equal(validCheck.valid, true);
    assert.equal(validCheck.normalizedExcerpt, 'operatic stagecraft and architectural sound.');

    const invalidCheck = validateExactSourceExcerpt(src, 'operatic stagecraft and digital hologram projection.');
    assert.equal(invalidCheck.valid, false);
    assert.ok(invalidCheck.reason?.includes('exact text'));
  });

  test('4. Task-level source roles compile distinct governance instructions and prevent Approved Example / Visual Reference leakage', () => {
    const core = createDefaultOperatingCore();

    const pkg = compileGovernedContext({
      workflow: 'Advanced Brief',
      operatingCore: core,
      audience: 'Sponsors & Corporate Partners',
      channel: 'LinkedIn',
      format: 'Post',
      sourceBindings: [
        {
          sourceId: 's-ev',
          title: 'Verified Acoustic Lab Memo',
          type: 'Event Notes',
          role: 'Evidence',
          selectedExcerpts: ['Acoustic testing completed in Bergen with 94% reverberation clarity.'],
          content: 'Full memo text: Acoustic testing completed in Bergen with 94% reverberation clarity.'
        },
        {
          sourceId: 's-ex',
          title: 'Past Founding Essay',
          type: 'Approved Example',
          role: 'Approved Example',
          content: 'Example essay mentioning Zurich 2024 symposium.'
        },
        {
          sourceId: 's-vis',
          title: 'Basalt & Glacial Ice Moodboard',
          type: 'Visual Reference',
          role: 'Visual Reference',
          content: 'Dark basalt monoliths with warm amber stage lighting.'
        }
      ],
      userInstruction: 'Draft a sponsor update post.'
    });

    const sourceSec = pkg.sections.sourceEvidenceContext;
    assert.ok(sourceSec.includes('ROLE: EVIDENCE'));
    assert.ok(sourceSec.includes('[Verbatim Excerpt 1 from "Verified Acoustic Lab Memo"] "Acoustic testing completed in Bergen with 94% reverberation clarity."'));
    assert.ok(sourceSec.includes('ROLE: APPROVED EXAMPLE [STYLE & STRUCTURE REFERENCE ONLY]'));
    assert.ok(sourceSec.includes('MUST NOT leak into new work as factual evidence'));
    assert.ok(sourceSec.includes('ROLE: VISUAL REFERENCE [VISUAL DIRECTION ONLY - DO NOT USE AS FACTUAL COPY]'));

    // Check manifest categorization
    assert.deepEqual(pkg.manifest.evidenceSources, ['Verified Acoustic Lab Memo (Evidence)']);
    assert.ok(pkg.manifest.styleReferenceSources.includes('Past Founding Essay (Approved Example)'));
    assert.ok(pkg.manifest.styleReferenceSources.includes('Basalt & Glacial Ice Moodboard (Visual Reference)'));
  });

  test('5. Bounded context limits prevent a huge source from crowding out Protected Kernel, Operating Core, or other evidence', () => {
    const core = createDefaultOperatingCore();
    const hugeText = ' Verified institutional milestone sentence for Climate Opera Haus.'.repeat(500); // ~33,000 chars

    const pkg = compileGovernedContext({
      workflow: 'Advanced Brief',
      operatingCore: core,
      channel: 'Newsletter',
      maxTotalSourceChars: 3000,
      sourceBindings: [
        {
          sourceId: 's-huge',
          title: 'Massive Archival Transcript',
          type: 'Meeting Notes',
          role: 'Strategic Context',
          content: hugeText
        },
        {
          sourceId: 's-must',
          title: 'Core Milestone Fact Sheet',
          type: 'Event Notes',
          role: 'Must-use Material',
          selectedExcerpts: ['RESONANCE 2027 is the flagship cultural milestone.'],
          content: 'RESONANCE 2027 is the flagship cultural milestone.'
        }
      ],
      userInstruction: 'Write a concise newsletter dispatch.'
    });

    // 1. Must-use Material is prioritized ahead of Strategic Context
    const mustIdx = pkg.sections.sourceEvidenceContext.indexOf('Core Milestone Fact Sheet');
    const hugeIdx = pkg.sections.sourceEvidenceContext.indexOf('Massive Archival Transcript');
    assert.ok(mustIdx !== -1 && hugeIdx !== -1 && mustIdx < hugeIdx, 'Must-use Material must be prioritized before lower-priority roles');

    // 2. Huge source was bounded and did not crowd out Protected COH Kernel or Operating Core
    assert.ok(pkg.sections.sourceEvidenceContext.length < 4000, 'Source grounding section must respect bounded budget');
    assert.ok(pkg.compiledInstructions.includes('PROTECTED COH KERNEL'));
    assert.ok(pkg.compiledInstructions.includes('APPLICABLE OPERATING CORE RULES'));
    assert.ok(pkg.compiledInstructions.includes('Write a concise newsletter dispatch.'));

    // 3. Truncation warning is surfaced in manifest.conflictWarnings
    assert.ok(
      pkg.manifest.conflictWarnings.some(w => w.includes('Massive Archival Transcript') && w.includes('bounded')),
      'Truncation warning must be surfaced when a large source without selected excerpts is bounded'
    );

    // 4. Reframing seed helper prepares clean payload for COH-CS-05
    const seed = prepareSourceForReframing({
      id: 's-must',
      title: 'Core Milestone Fact Sheet',
      type: 'Event Notes',
      content: 'RESONANCE 2027 is the flagship cultural milestone for Climate Opera Haus.'
    });
    assert.equal(seed.sourceId, 's-must');
    assert.equal(seed.role, 'Evidence');
  });
});

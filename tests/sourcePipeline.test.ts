import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  validateUrlSafety,
  extractReadableContentFromHtml,
  extractUrlSource
} from '../server/sourceExtractor.js';
import {
  normalizeSourceUrl,
  normalizeSourceText,
  computeSourceFingerprint,
  isUrlPlaceholderContent,
  uniqueSourcesById,
  findDuplicateSource,
  findLikelyDuplicateIds,
  validateSourceUsability,
  validateAttachedSourcesPreflight,
  getAttachedSourceIds,
  buildActiveTaskSourceBindings,
  serializeTaskSourcesForPayload,
  type PipelineSourceRecord
} from '../src/lib/sourcePipeline.ts';
import { createDefaultOperatingCore } from '../src/lib/operatingCore.ts';
import {
  compileGovernedContext,
  inferDefaultSourceRole
} from '../src/lib/contextCompiler.ts';
import {
  buildEvidenceContract,
  buildTaskContract,
  hasUsableTaskSources
} from '../server/ai/promptIntelligence.js';
import { buildGenerationPrompt } from '../server/ai/promptBuilder.js';

describe('Source-to-Content Pipeline Remediation (End-to-End)', () => {
  const defaultCore = createDefaultOperatingCore();

  test('1. URL extraction endpoint parses readable HTML and strips script/nav/footer boilerplate', async () => {
    const sampleHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>COP31 Cultural Climate Summit — Official Brief</title>
          <script>window.__ANALYTICS__ = { secret: "ignore-me" };</script>
          <style>.hidden { display: none; }</style>
        </head>
        <body>
          <header>Top Navigation Header Home About Contact</header>
          <nav>Main Menu Links Subscribe Login</nav>
          <div class="cookie-banner" id="cookie-consent">Accept all cookies to continue browsing</div>
          <article>
            <h1>COP31 Cultural Climate Summit in Belém and Beyond</h1>
            <p>Climate Opera Haus is presenting a symposium on repertoire-based climate storytelling, examining how live opera functions as a durable cultural IP origin asset for international festivals, streaming platforms, and philanthropic institutions.</p>
            <p>Across four interconnected works — Soria Moria, The Golden Fountain, The Water Dragon, and Roar to the Wind — the tetralogy addresses planetary thresholds through somatic staging and vocal performance rather than didactic slogans.</p>
          </article>
          <aside>Related sidebar links and newsletter signup</aside>
          <footer>Copyright 2026 All Rights Reserved Privacy Policy Terms</footer>
        </body>
      </html>
    `;

    const parsed = extractReadableContentFromHtml(sampleHtml, 'https://example.org/cop31');
    assert.equal(parsed.title, 'COP31 Cultural Climate Summit — Official Brief');
    assert.equal(parsed.containerUsed, 'article');
    assert.ok(parsed.content.includes('Climate Opera Haus is presenting a symposium'));
    assert.ok(parsed.content.includes('Soria Moria, The Golden Fountain, The Water Dragon, and Roar to the Wind'));
    assert.ok(!parsed.content.includes('window.__ANALYTICS__'));
    assert.ok(!parsed.content.includes('Top Navigation Header'));
    assert.ok(!parsed.content.includes('Main Menu Links'));
    assert.ok(!parsed.content.includes('Accept all cookies'));
    assert.ok(!parsed.content.includes('Copyright 2026 All Rights Reserved'));

    // Also test full extractUrlSource with mock fetch & DNS lookup
    const result = await extractUrlSource('https://example.org/cop31', {
      lookupFn: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchFn: async () => ({
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'text/html; charset=utf-8']]),
        text: async () => sampleHtml
      })
    });

    assert.equal(result.success, true);
    assert.equal(result.status, 'extracted');
    assert.equal(result.title, 'COP31 Cultural Climate Summit — Official Brief');
    assert.ok(result.charCount >= 300);
    assert.ok(result.content.includes('repertoire-based climate storytelling'));
  });

  test('2. URL extraction rejects localhost, 127.0.0.1, 169.254.169.254, private IPs, and file://', async () => {
    const blockedUrls = [
      'file:///etc/passwd',
      'ftp://example.com/file.txt',
      'javascript:alert(1)',
      'data:text/html,<h1>Hello</h1>',
      'http://localhost:3000/api/health',
      'http://127.0.0.1:8080/secret',
      'http://169.254.169.254/latest/meta-data/',
      'http://10.0.0.1/internal',
      'http://172.16.5.4/admin',
      'http://192.168.1.1/router',
      'http://[::1]:3000/',
      'https://metadata.google.internal/computeMetadata/v1/'
    ];

    for (const badUrl of blockedUrls) {
      const check = await validateUrlSafety(badUrl);
      assert.equal(check.safe, false, `Expected ${badUrl} to be rejected by SSRF guard`);

      const extraction = await extractUrlSource(badUrl);
      assert.equal(extraction.success, false, `Expected extractUrlSource(${badUrl}) to fail`);
      assert.equal(extraction.status, 'failed');
    }

    // Also reject public hostname that resolves via DNS to a private IP (DNS rebinding guard)
    const dnsRebindCheck = await validateUrlSafety('https://rebind.example.com/article', {
      lookupFn: async () => [{ address: '127.0.0.1', family: 4 }]
    });
    assert.equal(dnsRebindCheck.safe, false);

    // Also reject redirect to internal IP
    const redirectAttack = await extractUrlSource('https://public.example.org/start', {
      lookupFn: async (host: string) =>
        host === 'public.example.org'
          ? [{ address: '93.184.216.34', family: 4 }]
          : [{ address: '169.254.169.254', family: 4 }],
      fetchFn: async () => ({
        ok: false,
        status: 302,
        headers: new Map([['location', 'http://169.254.169.254/latest/meta-data']])
      })
    });
    assert.equal(redirectAttack.success, false);
    assert.equal(redirectAttack.status, 'failed');
    assert.match(redirectAttack.error, /Redirect blocked/i);
  });

  test('3. Failed URL extraction does NOT create a selectable Active source', async () => {
    const failedFetch = await extractUrlSource('https://example.org/paywalled', {
      lookupFn: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchFn: async () => ({
        ok: false,
        status: 403,
        headers: new Map([['content-type', 'text/html']])
      })
    });

    assert.equal(failedFetch.success, false);
    assert.equal(failedFetch.status, 'failed');
    assert.equal(failedFetch.content, '');

    // Verify usability validator rejects any legacy URL-reference placeholder or failed ingestion
    const fakePlaceholderSource: PipelineSourceRecord = {
      id: 'src-fake-url',
      title: 'COP31',
      type: 'Link / URL',
      status: 'Active',
      content: '[URL reference: https://example.org/cop31]'
    };
    assert.equal(isUrlPlaceholderContent(fakePlaceholderSource.content), true);
    const usability = validateSourceUsability(fakePlaceholderSource);
    assert.equal(usability.usable, false);
    assert.match(usability.reason || '', /no usable text was captured/i);
  });

  test('4. Reference-only URL has selectable: false and cannot be sent as generation evidence', () => {
    const referenceOnlySource: PipelineSourceRecord = {
      id: 'src-ref-only',
      title: 'Unreadable External Website',
      type: 'Link / URL',
      status: 'Needs Review',
      selectable: false,
      url: 'https://blocked.example.org/report',
      notes: 'Reference only - webpage content was not captured.',
      content: '',
      ingestion: {
        method: 'url-reference-only',
        status: 'reference-only',
        requestedUrl: 'https://blocked.example.org/report',
        normalizedUrl: normalizeSourceUrl('https://blocked.example.org/report'),
        charCount: 0
      }
    };

    const usability = validateSourceUsability(referenceOnlySource);
    assert.equal(usability.usable, false);

    // Preflight blocks generation if reference-only source is somehow in attachedIds
    const preflight = validateAttachedSourcesPreflight(['src-ref-only'], [referenceOnlySource]);
    assert.equal(preflight.valid, false);
    assert.ok(preflight.blockingMessage.includes('Unreadable External Website'));

    // Binding builder excludes reference-only sources from generation evidence
    const bindings = buildActiveTaskSourceBindings({
      selectedSourceIds: ['src-ref-only'],
      sources: [referenceOnlySource],
      workspaceLocalSources: []
    });
    assert.equal(bindings.length, 0);
  });

  test('5. URL source uses type "Link / URL" (not "Pasted Notes") and preserves role inference', () => {
    const urlSource: PipelineSourceRecord = {
      id: 'src-url-1',
      title: 'Nordic Council Cultural Report',
      type: 'Link / URL',
      status: 'Active',
      selectable: true,
      url: 'https://example.org/nordic-report',
      content: 'Detailed findings on Nordic cultural funding and climate-themed performing arts initiatives across Scandinavia.'
    };

    assert.equal(urlSource.type, 'Link / URL');
    assert.notEqual(urlSource.type, 'Pasted Notes');

    const inferredRole = inferDefaultSourceRole(urlSource.type);
    assert.equal(inferredRole, 'Evidence');

    const appSourceCode = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
    assert.ok(
      !appSourceCode.includes('[URL reference: ${inlineLinkData.url}]'),
      'App.tsx must not set content to [URL reference: ...]'
    );
  });

  test('6. Duplicate URL or identical pasted text triggers duplicate detection and supports Use Existing Source', () => {
    const existingLibrarySource: PipelineSourceRecord = {
      id: 'src-existing-cop31',
      title: 'COP31 Summit Notes',
      type: 'Link / URL',
      status: 'Active',
      selectable: true,
      url: 'https://example.org/cop31-summit?utm_source=linkedin&utm_medium=social#section-2',
      content: 'The COP31 cultural pavilion will feature live operatic excerpts and panel discussions with institutional patrons.'
    };

    // Same URL with different tracking params and trailing slash
    const dupByUrl = findDuplicateSource(
      {
        title: 'Different Title',
        url: 'https://EXAMPLE.org/cop31-summit/?fbclid=12345',
        content: 'Completely different summary text'
      },
      [existingLibrarySource]
    );
    assert.ok(dupByUrl);
    assert.equal(dupByUrl.reason, 'url');
    assert.equal(dupByUrl.duplicate.id, 'src-existing-cop31');

    // Same content with normalized whitespace
    const dupByContent = findDuplicateSource(
      {
        title: 'Another Note',
        content: '  The COP31 cultural pavilion   will feature live operatic excerpts\r\nand panel discussions with institutional patrons. '
      },
      [existingLibrarySource]
    );
    assert.ok(dupByContent);
    assert.equal(dupByContent.reason, 'content');
    assert.equal(dupByContent.duplicate.id, 'src-existing-cop31');

    // Likely duplicate badge detector identifies duplicates without deleting records
    const secondCopy: PipelineSourceRecord = {
      ...existingLibrarySource,
      id: 'src-existing-cop31-copy'
    };
    const likelyDupIds = findLikelyDuplicateIds([existingLibrarySource, secondCopy]);
    assert.equal(likelyDupIds.has('src-existing-cop31-copy'), true);
  });

  test('7. Save to Source Library in Content Workspace does not render the same source twice in Selected Sources', () => {
    const sharedSource: PipelineSourceRecord = {
      id: 'ws-paste-999',
      title: 'Shared Brief & Library Source',
      type: 'Pasted Notes',
      status: 'Active',
      content: 'Substantive source text saved to library and attached to brief.'
    };

    // Even if a source is present in both `sources` and `workspaceLocalSources`, uniqueSourcesById deduplicates by ID
    const deduplicated = uniqueSourcesById([sharedSource], [sharedSource]);
    assert.equal(deduplicated.length, 1);
    assert.equal(deduplicated[0].id, 'ws-paste-999');
  });

  test('8. Simple Mode attached source is included in context package and generation payload', () => {
    const attachedSource: PipelineSourceRecord = {
      id: 'src-simple-1',
      title: 'Soria Moria Staging Dossier',
      type: 'Event Notes',
      status: 'Active',
      selectable: true,
      content: 'Soria Moria premieres with acoustic ice-horn instrumentation and Nordic choral textures in Oslo.'
    };

    const bindings = buildActiveTaskSourceBindings({
      selectedSourceIds: ['src-simple-1'],
      sources: [attachedSource],
      workspaceLocalSources: []
    });
    assert.equal(bindings.length, 1);

    const contextPkg = compileGovernedContext({
      workflow: 'Simple Mode',
      operatingCore: defaultCore,
      channel: 'LinkedIn',
      userInstruction: 'Write a post about the Soria Moria instrumentation.',
      sourceBindings: bindings
    });

    assert.ok(contextPkg.sections.sourceEvidenceContext.includes('Soria Moria Staging Dossier'));
    assert.ok(contextPkg.sections.sourceEvidenceContext.includes('acoustic ice-horn instrumentation'));

    const serialized = serializeTaskSourcesForPayload(bindings);
    assert.equal(serialized.length, 1);
    assert.equal(serialized[0].id, 'src-simple-1');
    assert.ok(serialized[0].content.includes('acoustic ice-horn instrumentation'));
  });

  test('9. Quick Create attached source is included in context package and generation payload', () => {
    const attachedSource: PipelineSourceRecord = {
      id: 'src-quick-1',
      title: 'Water Dragon Libretto Excerpt',
      type: 'Pasted Notes',
      status: 'Active',
      selectable: true,
      content: 'The Water Dragon explores rising hydrological extremes and ancestral river memory in East Asia.'
    };

    const bindings = buildActiveTaskSourceBindings({
      selectedSourceIds: ['src-quick-1'],
      sources: [],
      workspaceLocalSources: [attachedSource]
    });
    assert.equal(bindings.length, 1);

    const contextPkg = compileGovernedContext({
      workflow: 'Quick Create',
      operatingCore: defaultCore,
      channel: 'Instagram',
      format: 'Caption',
      userInstruction: 'Draft a caption introducing The Water Dragon.',
      sourceBindings: bindings
    });

    assert.ok(contextPkg.sections.sourceEvidenceContext.includes('Water Dragon Libretto Excerpt'));
    assert.ok(contextPkg.sections.sourceEvidenceContext.includes('rising hydrological extremes'));

    const serialized = serializeTaskSourcesForPayload(bindings);
    assert.equal(serialized.length, 1);
    assert.equal(serialized[0].title, 'Water Dragon Libretto Excerpt');
  });

  test('10. Advanced Brief attached source is included in context package and generation payload', () => {
    const attachedSource: PipelineSourceRecord = {
      id: 'src-adv-1',
      title: 'Patron Founding Circle Prospectus',
      type: 'Sponsor Notes',
      status: 'Active',
      selectable: true,
      content: 'Founding Circle patrons underwrite the origin stage production and receive long-term documentary attribution.'
    };

    const bindings = buildActiveTaskSourceBindings({
      selectedSourceIds: ['src-adv-1'],
      sources: [attachedSource],
      workspaceLocalSources: []
    });
    assert.equal(bindings.length, 1);

    const contextPkg = compileGovernedContext({
      workflow: 'Advanced Brief',
      operatingCore: defaultCore,
      channel: 'Email / Direct Outreach',
      format: 'Sponsor Pitch Paragraph',
      audience: 'Sponsors & Patrons',
      userInstruction: 'Draft a patron outreach paragraph.',
      sourceBindings: bindings
    });

    assert.ok(contextPkg.sections.sourceEvidenceContext.includes('Patron Founding Circle Prospectus'));
    const serialized = serializeTaskSourcesForPayload(bindings);
    assert.equal(serialized.length, 1);
    assert.equal(serialized[0].role, 'Strategic Context');
  });

  test('11. operatingCoreInstructions does not contain SELECTED USER SOURCES, while taskSources contains the selected source text', () => {
    const attachedSource: PipelineSourceRecord = {
      id: 'src-sep-1',
      title: 'COP31 Press Briefing',
      type: 'Article / Media Coverage',
      status: 'Active',
      selectable: true,
      content: 'Verified quote from COP31 Cultural Envoy on repertoire longevity.'
    };

    const bindings = buildActiveTaskSourceBindings({
      selectedSourceIds: ['src-sep-1'],
      sources: [attachedSource],
      workspaceLocalSources: []
    });

    const contextPkg = compileGovernedContext({
      workflow: 'Advanced Brief',
      operatingCore: defaultCore,
      channel: 'LinkedIn',
      userInstruction: 'Summarize the COP31 briefing.',
      sourceBindings: bindings
    });

    // Build operatingCoreOnlyInstructions the exact way handleGenerateDrafts does
    const operatingCoreOnlyInstructions = [
      contextPkg.sections.protectedKernel,
      contextPkg.sections.operatingCoreRules
    ].filter(Boolean).join('\n\n');

    const serializedTaskSources = serializeTaskSourcesForPayload(bindings);

    assert.ok(operatingCoreOnlyInstructions.includes('PROTECTED COH KERNEL'));
    assert.ok(
      !operatingCoreOnlyInstructions.includes('SELECTED USER SOURCES'),
      'operatingCoreInstructions must NOT contain SELECTED USER SOURCES'
    );
    assert.ok(
      !operatingCoreOnlyInstructions.includes('Verified quote from COP31 Cultural Envoy'),
      'operatingCoreInstructions must NOT contain task source body text'
    );
    assert.equal(serializedTaskSources.length, 1);
    assert.ok(serializedTaskSources[0].content.includes('Verified quote from COP31 Cultural Envoy'));

    // Verify promptBuilder puts taskSources in === TASK SOURCES === and NOT inside OPERATING CORE
    const fullPrompt = buildGenerationPrompt({
      channel: 'LinkedIn',
      outputFormat: 'Post',
      rawInput: 'Summarize the COP31 briefing.',
      operatingCoreInstructions: operatingCoreOnlyInstructions,
      inheritedWorkContext: 'ORIGIN WORKFLOW: ideation',
      taskSources: serializedTaskSources
    });

    assert.ok(fullPrompt.includes('=== TASK SOURCES ==='));
    assert.ok(fullPrompt.includes('COP31 Press Briefing'));
    assert.ok(fullPrompt.includes('=== INHERITED WORK CONTEXT ==='));
  });

  test('12. server/ai/promptIntelligence.js reports "Selected task-source material present: Yes" when taskSources are attached', () => {
    const inputWithTaskSources = {
      channel: 'LinkedIn',
      outputFormat: 'Post',
      rawInput: 'Announce the COP31 session.',
      pastedNotes: 'Keep the opening paragraph concise and executive-facing.',
      taskSources: [
        {
          id: 'src-cop31',
          title: 'COP31 Session Schedule',
          type: 'Event Notes',
          role: 'Evidence',
          content: 'Session takes place on November 14 with 40 cultural delegates.'
        }
      ]
    };

    assert.equal(hasUsableTaskSources(inputWithTaskSources), true);
    const evidenceContract = buildEvidenceContract(inputWithTaskSources);
    assert.ok(
      evidenceContract.includes('Selected task-source material present: Yes'),
      `Expected "Selected task-source material present: Yes" in:\n${evidenceContract}`
    );

    // Quick Create notes (`pastedNotes`) are treated as creative direction in Task Contract, not mistaken for attached sources when no sources are attached
    const inputWithOnlyQuickNotes = {
      channel: 'LinkedIn',
      outputFormat: 'Post',
      rawInput: 'Write a post on Soria Moria.',
      pastedNotes: 'Emphasize the Nordic atmosphere.',
      taskSources: []
    };
    assert.equal(hasUsableTaskSources(inputWithOnlyQuickNotes), false);
    const evidenceNoSources = buildEvidenceContract(inputWithOnlyQuickNotes);
    assert.ok(evidenceNoSources.includes('Selected task-source material present: No'));
    const taskContract = buildTaskContract(inputWithOnlyQuickNotes);
    assert.ok(taskContract.includes('Additional Creative Direction / Notes: Emphasize the Nordic atmosphere.'));
  });

  test('13. Clicking a Content Starter Template populates a real taskInstruction', () => {
    const appSourceCode = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');
    // Verify all 8 templates in CONTENT_TEMPLATES have a non-empty taskInstruction
    const templateMatches = Array.from(appSourceCode.matchAll(/taskInstruction:\s*'([^']+)'/g));
    assert.ok(
      templateMatches.length >= 8,
      `Expected at least 8 CONTENT_TEMPLATES with taskInstruction, found ${templateMatches.length}`
    );
    for (const match of templateMatches) {
      assert.ok(match[1].trim().length >= 30, `Template taskInstruction should be substantive: "${match[1]}"`);
    }

    // Verify applyTemplate populates simpleBrief.goal, quickBrief.goal, and advancedBrief.topic using taskInstruction
    assert.ok(appSourceCode.includes('const instruction = temp.taskInstruction || temp.desc || temp.name;'));
    assert.ok(appSourceCode.includes('topic: isDefaultOrStarterText(prev.topic) ? instruction : prev.topic'));
  });

  test('14. Prototype mode vs AI mode buttons, provenance badges, and Context Used for This Request trace are wired in App.tsx', () => {
    const appSourceCode = fs.readFileSync(path.resolve(process.cwd(), 'src/App.tsx'), 'utf8');

    // Mode status banner & primary action button labels
    assert.ok(appSourceCode.includes('data-testid="generation-mode-status-banner"'));
    assert.ok(appSourceCode.includes('Generate with AI'));
    assert.ok(appSourceCode.includes('Generate Prototype Structure'));
    assert.ok(appSourceCode.includes('Build AI Prompt'));

    // Deterministic provenance badges (Defect 9)
    assert.ok(
      appSourceCode.includes('`AI Generated · ${serializedTaskSources.length} Source${serializedTaskSources.length === 1 ? \'\' : \'s\'} Sent`')
    );
    assert.ok(appSourceCode.includes("'AI Generated · Operating Core + Brief Only'"));
    assert.ok(appSourceCode.includes("labelA: 'Prototype Structure'"));

    // Context Used for This Request provenance panel
    assert.ok(appSourceCode.includes('data-testid="generation-source-trace"'));
    assert.ok(appSourceCode.includes('Context Used for This Request'));
    assert.ok(appSourceCode.includes('data-testid="generation-grounding-badge"'));
  });
});

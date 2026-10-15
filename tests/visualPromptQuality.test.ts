import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseVisualDirectionInput,
  serializeVisualBriefForStorage,
  classifyVisualDirectionType,
  compileVisualStudioPrompt,
  createEmptyStructuredVisualBrief
} from '../src/lib/visualPromptCompiler.js';

describe('Visual Studio Prompt Quality & Structured Brief Compiler', () => {
  it('Case A: Full structured brief from Content Workspace parses all fields cleanly and compiles without duplicate paragraphs', () => {
    const aiVisualBrief = {
      visualConcept: 'A lone mezzo-soprano rehearsing inside a flooded Nordic architectural timber hall.',
      formatRecommendation: 'Website Hero Banner (16:9)',
      mood: 'Contemplative, disciplined, high-stakes cultural gravitas.',
      composition: 'Wide asymmetrical frame with generous negative space on the left third for editorial breathing room.',
      colorMaterial: 'Deep navy slate, warm burnished brass, weathered Nordic pine, cold mist.',
      typographyLayout: 'Left-aligned headline zone over calm dark slate negative space.',
      keyElements: 'Acoustic timber ribs, subtle water ripples, single tungsten stage light.',
      whatToAvoid: 'No disaster movie clichés, no melting icebergs, no literal activist banners.',
      aiImagePrompt: 'Wide cinematic frame of a mezzo-soprano on a dark slate plinth in a flooded Nordic timber hall, warm tungsten stage light, shallow reflective water. --ar 16:9 --v 6.0',
      negativePrompt: 'melting icebergs, corporate handshakes, neon text',
      designerNotes: 'Maintain high contrast around the left negative space.'
    };

    const storedMarkdown = serializeVisualBriefForStorage(aiVisualBrief);
    const parsed = parseVisualDirectionInput(storedMarkdown);

    // Every structured field is populated and clean (no leaked ### headings or --ar flags)
    assert.ok(parsed.visualConcept.includes('lone mezzo-soprano rehearsing'));
    assert.ok(parsed.formatRecommendation.includes('Website Hero Banner'));
    assert.ok(parsed.moodAtmosphere.includes('Contemplative, disciplined'));
    assert.ok(parsed.colorMaterialDirection.includes('Deep navy slate, warm burnished brass'));
    assert.ok(parsed.keyVisualElements.includes('Acoustic timber ribs'));
    assert.ok(parsed.composition.includes('Wide asymmetrical frame'));
    assert.ok(parsed.typographyLayout.includes('Left-aligned headline zone'));
    assert.ok(parsed.whatToAvoid.includes('No disaster movie clichés'));
    assert.ok(parsed.designerNotes.includes('Maintain high contrast'));
    assert.ok(!parsed.aiImagePrompt.includes('###'));
    assert.ok(!parsed.aiImagePrompt.includes('--ar'));

    const compiled = compileVisualStudioPrompt({
      brief: parsed,
      visualStyle: 'Cinematic Realism',
      formatPresetId: 'web-hero',
      aspectRatio: '16:9',
      brandConsistency: true
    });

    assert.ok(compiled.prompt.includes('lone mezzo-soprano'));
    assert.ok(compiled.prompt.includes('16:9'));
    assert.ok(compiled.prompt.toLowerCase().includes('cinematic realism'));
    assert.ok(compiled.prompt.includes('Strictly avoid:'));

    // Verify no sentence is duplicated verbatim
    const sentences = compiled.prompt
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim().toLowerCase())
      .filter(s => s.length > 20);
    const uniqueSentences = new Set(sentences);
    assert.equal(uniqueSentences.size, sentences.length);
  });

  it('Case B: Partial brief (only visualConcept and moodAtmosphere) produces a coherent prompt without undefined/null or empty headings', () => {
    const partialBrief = {
      ...createEmptyStructuredVisualBrief(),
      visualConcept: 'Close study of a hand-notated orchestral score resting on a dark brass music stand.',
      moodAtmosphere: 'Intimate, nocturnal, scholarly discipline.'
    };

    const compiled = compileVisualStudioPrompt({
      brief: partialBrief,
      visualStyle: 'Editorial Photography',
      formatPresetId: 'social-li-sq',
      aspectRatio: '1:1'
    });

    assert.ok(compiled.prompt.includes('hand-notated orchestral score'));
    assert.ok(compiled.prompt.includes('Intimate, nocturnal, scholarly discipline'));
    assert.ok(!compiled.prompt.includes('undefined'));
    assert.ok(!compiled.prompt.includes('null'));
    assert.ok(!/:\s*\./.test(compiled.prompt));
  });

  it('Case C: Manual prompt only compiles cleanly with selected style, aspect ratio, and negative prompt', () => {
    const compiled = compileVisualStudioPrompt({
      brief: {
        ...createEmptyStructuredVisualBrief(),
        visualConcept: 'Architectural exterior of an opera house carved into coastal basalt cliffs at dusk.',
        negativePrompt: 'tourists, neon signs, cars'
      },
      visualStyle: 'Editorial Photography',
      formatPresetId: 'social-ig-port',
      aspectRatio: '4:5'
    });

    assert.ok(compiled.prompt.includes('Architectural exterior of an opera house carved into coastal basalt cliffs at dusk'));
    assert.ok(compiled.prompt.includes('4:5'));
    assert.ok(compiled.prompt.toLowerCase().includes('editorial photography'));
    assert.ok(compiled.prompt.includes('tourists'));
    assert.ok(!compiled.prompt.includes('undefined'));
  });

  it('Case D: Typographic / quote card brief classifies as typographic_quote_card and handles text overlay honestly', () => {
    const quoteBrief = {
      ...createEmptyStructuredVisualBrief(),
      visualConcept: 'Minimalist institutional quote card for LinkedIn statement.',
      composition: 'High-contrast dark slate field with generous central quiet zone.',
      textContent: 'Climate is not a theme; it is the condition under which our work operates for the coming century of repertoire.',
      attribution: 'Climate Opera Haus'
    };

    const detectedType = classifyVisualDirectionType(quoteBrief, 'Minimal Graphic', 'social-li-sq');
    assert.equal(detectedType, 'typographic_quote_card');

    const compiled = compileVisualStudioPrompt({
      brief: quoteBrief,
      visualStyle: 'Minimal Graphic',
      formatPresetId: 'social-li-sq',
      aspectRatio: '1:1'
    });

    assert.equal(compiled.visualType, 'typographic_quote_card');
    assert.ok(compiled.prompt.toLowerCase().includes('negative-space'));
    assert.ok(compiled.prompt.toLowerCase().includes('do not render dense multi-line paragraphs'));
  });

  it('Case E: Cinematic / photographic scene reflects optical, lighting, and material depth', () => {
    const sceneBrief = {
      ...createEmptyStructuredVisualBrief(),
      visualConcept: 'Backstage view of stagehands positioning a suspended bronze ring before curtain rise.',
      keyVisualElements: 'Three stagehands in dark workwear guiding a monumental brushed-bronze ring under directional stage side-lighting.',
      colorMaterialDirection: 'Brushed bronze, matte black rigging, warm tungsten key light cutting through faint stage haze.'
    };

    const compiled = compileVisualStudioPrompt({
      brief: sceneBrief,
      visualStyle: 'Cinematic Realism',
      formatPresetId: 'web-hero',
      aspectRatio: '16:9'
    });

    assert.equal(compiled.visualType, 'cinematic');
    assert.ok(compiled.prompt.includes('suspended bronze ring'));
    assert.ok(compiled.prompt.includes('Brushed bronze, matte black rigging'));
    assert.match(compiled.prompt.toLowerCase(), /anamorphic|cinema|volumetric|optical/);
  });

  it('Case F: Aspect ratio adaptation produces distinct framing instructions for 16:9, 1:1, 4:5, and 9:16', () => {
    const baseBrief = {
      ...createEmptyStructuredVisualBrief(),
      visualConcept: 'Solo cellist performing in a stone courtyard at twilight.'
    };

    const hero16x9 = compileVisualStudioPrompt({
      brief: baseBrief,
      visualStyle: 'Editorial Photography',
      formatPresetId: 'web-hero',
      aspectRatio: '16:9'
    });

    const square1x1 = compileVisualStudioPrompt({
      brief: baseBrief,
      visualStyle: 'Editorial Photography',
      formatPresetId: 'social-li-sq',
      aspectRatio: '1:1'
    });

    const portrait4x5 = compileVisualStudioPrompt({
      brief: baseBrief,
      visualStyle: 'Editorial Photography',
      formatPresetId: 'social-ig-port',
      aspectRatio: '4:5'
    });

    const vertical9x16 = compileVisualStudioPrompt({
      brief: baseBrief,
      visualStyle: 'Editorial Photography',
      formatPresetId: 'social-ig-story',
      aspectRatio: '9:16'
    });

    assert.ok(hero16x9.prompt.includes('16:9'));
    assert.ok(square1x1.prompt.includes('1:1'));
    assert.ok(portrait4x5.prompt.includes('4:5'));
    assert.ok(vertical9x16.prompt.includes('9:16'));

    assert.notEqual(hero16x9.prompt, square1x1.prompt);
    assert.notEqual(square1x1.prompt, vertical9x16.prompt);
    assert.notEqual(portrait4x5.prompt, vertical9x16.prompt);
  });

  it('Case G: Duplicate prevention deduplicates overlapping composition, whatToAvoid, negativePrompt, and aiImagePrompt clauses', () => {
    const duplicatedBrief = {
      ...createEmptyStructuredVisualBrief(),
      visualConcept: 'Dramatic soprano solo under a single vertical shaft of warm gold stage light.',
      keyVisualElements: 'Dramatic soprano solo under a single vertical shaft of warm gold stage light.',
      composition: 'Rule of thirds with deep negative space on the left.',
      typographyLayout: 'Rule of thirds with deep negative space on the left.',
      whatToAvoid: 'stock clichés, neon colors, watermarks',
      negativePrompt: 'stock clichés, neon colors, watermarks, extra limbs',
      aiImagePrompt: 'Dramatic soprano solo under a single vertical shaft of warm gold stage light.'
    };

    const compiled = compileVisualStudioPrompt({
      brief: duplicatedBrief,
      visualStyle: 'Cinematic Realism',
      formatPresetId: 'social-li-sq',
      aspectRatio: '1:1'
    });

    // Count occurrences of the core concept phrase
    const conceptMatches = compiled.prompt.match(/Dramatic soprano solo under a single vertical shaft of warm gold stage light/gi) || [];
    assert.equal(conceptMatches.length, 1);

    // Count occurrences of "Rule of thirds with deep negative space on the left"
    const compMatches = compiled.prompt.match(/Rule of thirds with deep negative space on the left/gi) || [];
    assert.equal(compMatches.length, 1);

    // Count occurrences of "Strictly avoid:"
    const avoidMatches = compiled.prompt.match(/Strictly avoid:/g) || [];
    assert.equal(avoidMatches.length, 1);

    // Count occurrences of "watermarks" inside negativePrompt
    const watermarkMatches = compiled.negativePrompt.match(/watermarks/gi) || [];
    assert.equal(watermarkMatches.length, 1);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  PROTECTED_COH_KERNEL,
  CANONICAL_COH_PILLARS,
  createDefaultOperatingCore,
  getAuthoritativeAudiences,
  normalizeOperatingCoreAudience,
  normalizeCohPillar
} from '../src/lib/operatingCore.ts';
import {
  COH_VALID_AUDIENCES,
  COH_CONTENT_PILLARS,
  getValidIdeationAudiences,
  enrichAndDiversifyOpportunities,
  buildIdeationToContentHandoff
} from '../src/lib/ideationIntelligence.ts';
import { resolveSmartBrief } from '../src/lib/smartBriefAndRevision.ts';
import {
  resolveReframeIntent,
  getReframingAudienceOptions,
  getReframingPillarOptions
} from '../src/lib/reframingEngine.ts';
import {
  compileGovernedContext,
  extractWorkContextFromWorkItem
} from '../src/lib/contextCompiler.ts';

describe('COH-CS-10 Restore Operating Core as Single Strategic Authority', () => {
  it('1. Operating Core audience mutation or custom audience profile is reflected across Ideation, Smart Brief, and Reframing', () => {
    const customCore = createDefaultOperatingCore();
    customCore.audiences.push({
      id: 'aud-nordic-commissioners',
      name: 'Nordic Municipal Cultural Commissioners',
      description: 'Municipal arts and climate commissioners across Scandinavia.',
      priorities: 'Civic resilience, public value, Nordic repertoire touring.',
      tonePreferences: 'Measured, civic, institutionally rigorous.',
      proofPointsNeeded: 'Oslo workshop milestones, municipal co-production models.',
      callToActionStyle: 'Invite to municipal briefing.',
      avoidList: 'Generic global slogans.'
    });

    // Reframing options include the custom Operating Core audience
    const reframeOptions = getReframingAudienceOptions(customCore);
    assert.ok(
      reframeOptions.includes('Nordic Municipal Cultural Commissioners'),
      'Reframing audience options must reflect active Operating Core audiences'
    );

    // Ideation valid audiences include the custom Operating Core audience
    const ideationAudiences = getValidIdeationAudiences(customCore);
    assert.ok(
      ideationAudiences.includes('Nordic Municipal Cultural Commissioners'),
      'Ideation audience authority must reflect active Operating Core audiences'
    );

    // Smart Brief resolves natural language mentioning the custom audience to that exact Operating Core profile
    const smartBrief = resolveSmartBrief({
      rawRequest: 'Create a LinkedIn post for Nordic municipal cultural commissioners about Soria Moria.',
      operatingCore: customCore
    });
    assert.equal(smartBrief.audience.value, 'Nordic Municipal Cultural Commissioners');
    assert.equal(smartBrief.audience.provenance, 'resolved');

    // Reframing resolves natural language mentioning the custom audience to that exact Operating Core profile
    const reframePlan = resolveReframeIntent({
      rawIntent: 'Reframe this note for Nordic municipal cultural commissioners evaluating civic touring.',
      sourceContent: 'Soria Moria is the foundational first work in The Climate Tetralogy.',
      operatingCore: customCore
    });
    assert.equal(reframePlan.targetAudience, 'Nordic Municipal Cultural Commissioners');

    // Ideation enrichment preserves the custom Operating Core audience
    const ideationSet = enrichAndDiversifyOpportunities({
      rawProposals: [
        {
          id: 'opp-custom-aud',
          title: 'Civic Opera Infrastructure in Scandinavia',
          explanation: 'How Soria Moria anchors municipal cultural programming.',
          suggestedAudience: 'Nordic Municipal Cultural Commissioners'
        }
      ],
      rawInput: 'Nordic municipal cultural programming',
      defaultAudience: 'General Public',
      defaultChannel: 'LinkedIn',
      defaultLanguage: 'English',
      sourceBindings: [],
      savedIdeas: [],
      savedContents: [],
      operatingCore: customCore
    });
    assert.equal(ideationSet[0].suggestedAudience, 'Nordic Municipal Cultural Commissioners');
  });

  it('2. Alias normalization resolves parallel/legacy audience labels to canonical Operating Core audiences', () => {
    const core = createDefaultOperatingCore();
    const authoritativeSet = new Set(getAuthoritativeAudiences(core));

    const aliasPairs: Array<[string, string]> = [
      ['Sponsors / Patrons', 'Sponsors and patrons'],
      ['Sponsors & Patrons', 'Sponsors and patrons'],
      ['Cultural Followers', 'General cultural audience'],
      ['Cultural Institutions & Venues', 'Cultural institutions'],
      ['Institutional Partners', 'Cultural institutions'],
      ['Art & Opera Community', 'Opera houses and festivals'],
      ['Cultural Institutions & Festivals', 'Opera houses and festivals'],
      ['Press & Media', 'Press and journalists'],
      ['Press / Media', 'Press and journalists'],
      ['Climate & Sustainability Leaders', 'Climate and sustainability leaders']
    ];

    for (const [alias, expectedCanonical] of aliasPairs) {
      const normalized = normalizeOperatingCoreAudience(alias, core);
      assert.equal(
        normalized,
        expectedCanonical,
        `Alias "${alias}" must normalize to "${expectedCanonical}"`
      );
      assert.ok(
        authoritativeSet.has(normalized!),
        `Normalized value "${normalized}" must exist in Operating Core audiences`
      );
    }
  });

  it('3. Enforces canonical COH content pillars across Ideation, Smart Brief, and Reframing while keeping communication jobs distinct', () => {
    const canonicalSet = new Set<string>(CANONICAL_COH_PILLARS);
    assert.deepEqual(COH_CONTENT_PILLARS, CANONICAL_COH_PILLARS);
    assert.deepEqual(getReframingPillarOptions(), CANONICAL_COH_PILLARS);

    // Parallel pillar aliases normalize to canonical COH pillars
    assert.equal(normalizeCohPillar('The Opera & Worldbuilding'), 'Climate Tetralogy & Canon');
    assert.equal(normalizeCohPillar('The Tetralogy & Operatic Worldbuilding'), 'Climate Tetralogy & Canon');
    assert.equal(normalizeCohPillar('Science & Planetary Reality'), 'Education, Community & Climate Literacy');
    assert.equal(normalizeCohPillar('Institutional & Sponsor Value'), 'Partnerships, Sponsorship & Institutional Value');
    assert.equal(normalizeCohPillar('Climate Opera as Cultural IP'), 'Documentary, Media & Cultural IP');
    assert.equal(normalizeCohPillar('Behind the Creation & Craft'), 'Production & Behind the Work');
    assert.equal(normalizeCohPillar('Cultural Participation & Ritual'), 'Events, Convenings & Public Moments');

    // Ideation enrichment normalizes any legacy/parallel pillar to a canonical COH pillar
    const enriched = enrichAndDiversifyOpportunities({
      rawProposals: [
        {
          id: 'opp-pillar-1',
          title: 'Soria Moria Dramaturgy',
          explanation: 'Operatic worldbuilding.',
          communicationJob: 'Explain artistic logic',
          strategicAngle: 'Origin Asset Multiplier',
          suggestedPillar: 'The Opera & Worldbuilding',
          suggestedAudience: 'Cultural Institutions & Venues'
        }
      ],
      rawInput: 'Soria Moria dramaturgy',
      defaultAudience: 'General Public',
      defaultChannel: 'LinkedIn',
      defaultLanguage: 'English',
      sourceBindings: [],
      savedIdeas: [],
      savedContents: []
    });

    assert.ok(canonicalSet.has(enriched[0].suggestedPillar), 'Ideation pillar must be canonical');
    assert.equal(enriched[0].suggestedPillar, 'Climate Tetralogy & Canon');
    assert.equal(enriched[0].suggestedAudience, 'Cultural institutions');
    assert.notEqual(
      enriched[0].communicationJob,
      enriched[0].suggestedPillar,
      'Communication job and content pillar must remain distinct dimensions'
    );

    // Smart Brief resolves pillar to canonical COH pillar
    const brief = resolveSmartBrief({
      rawRequest: 'Write a behind the scenes rehearsal update on the composer craft.'
    });
    assert.ok(canonicalSet.has(brief.pillar.value), 'Smart Brief pillar must be canonical');
    assert.equal(brief.pillar.value, 'Production & Behind the Work');

    // Reframe plan resolves contentPillarEmphasis to canonical COH pillar
    const reframe = resolveReframeIntent({
      rawIntent: 'Reframe this into an artistic dramaturgical note for opera houses.',
      sourceContent: 'Soria Moria is an original climate opera.'
    });
    assert.ok(canonicalSet.has(reframe.contentPillarEmphasis), 'Reframe pillar must be canonical');
    assert.equal(reframe.contentPillarEmphasis, 'Opera Worlds & Artistic Method');
    assert.equal(reframe.targetAudience, 'Opera houses and festivals');
  });

  it('4 & 5 & 6. Smart Brief honors explicit General Public, explicit English, and explicit channel/audience/pillar/format over raw text heuristics', () => {
    const resolved = resolveSmartBrief({
      rawRequest:
        'Write a Portuguese Instagram carousel for sponsors and patrons about behind the scenes rehearsal craft.',
      explicitChannel: 'Newsletter',
      explicitFormat: 'Partner Update',
      explicitAudience: 'General Public',
      explicitPillar: 'Climate Tetralogy & Canon',
      explicitLanguage: 'English',
      explicitPurpose: 'Audience Education'
    });

    assert.equal(resolved.audience.value, 'General Public');
    assert.equal(resolved.audience.provenance, 'explicit');

    assert.equal(resolved.language.value, 'English');
    assert.equal(resolved.language.provenance, 'explicit');

    assert.equal(resolved.channel.value, 'Newsletter');
    assert.equal(resolved.channel.provenance, 'explicit');

    assert.equal(resolved.outputFormat.value, 'Partner Update');
    assert.equal(resolved.outputFormat.provenance, 'explicit');

    assert.equal(resolved.pillar.value, 'Climate Tetralogy & Canon');
    assert.equal(resolved.pillar.provenance, 'explicit');

    assert.equal(resolved.purpose.value, 'Audience Education');
    assert.equal(resolved.purpose.provenance, 'explicit');
  });

  it('7. Legacy saved items with older labels and custom audiences remain readable without crash or data loss', () => {
    const core = createDefaultOperatingCore();

    // Legacy saved idea with old parallel pillar and audience alias promoted to Content Workspace
    const legacyIdeaHandoff = buildIdeationToContentHandoff({
      idea: {
        id: 'legacy-idea-1',
        title: 'Legacy Saved Idea',
        originalInput: 'Water Dragon',
        category: 'Strongest Directions',
        explanation: 'Legacy explanation',
        communicationJob: 'Create sponsor relevance',
        whyItWorks: 'Legacy why it works',
        coreTension: 'Legacy tension',
        desiredAudienceResponse: 'Legacy response',
        availableEvidence: [],
        evidenceStillRequired: [],
        suggestedAudience: 'Sponsors & Patrons',
        suggestedChannel: 'LinkedIn',
        suggestedFormat: 'Post',
        suggestedPillar: 'Institutional & Sponsor Value',
        suggestedTone: 'Measured / Credible',
        strategicAngle: 'Legacy angle',
        reuseOpportunity: {
          classification: 'New Ground',
          confidence: 'High',
          rationale: 'Legacy'
        },
        riskToAvoid: 'None',
        unresolvedAssumptions: [],
        possibleHook: 'Hook',
        possibleNextStep: 'Next',
        language: 'English',
        dateCreated: '2026-01-01',
        status: 'New'
      },
      currentSelectedSourceIds: [],
      currentTaskSourceRoleMap: {}
    });

    assert.equal(
      legacyIdeaHandoff.advancedBriefPatch.pillar,
      'Partnerships, Sponsorship & Institutional Value'
    );

    // Legacy work item with old alias + custom audience compiled through Context Compiler
    const legacyWorkItem = {
      id: 'wi-legacy-1',
      title: 'Legacy Work Item',
      audience: 'Cultural Followers',
      channel: 'LinkedIn',
      pillar: 'The Opera & Worldbuilding'
    };
    const extracted = extractWorkContextFromWorkItem(legacyWorkItem);
    assert.equal(extracted?.audience, 'Cultural Followers');

    const compiledWithAlias = compileGovernedContext({
      workflow: 'Content Workspace',
      operatingCore: core,
      inheritedWorkContext: extracted
    });
    assert.ok(
      compiledWithAlias.sections.operatingCoreRules.includes('General cultural audience'),
      'Context compiler must match legacy alias to Operating Core General cultural audience profile'
    );

    // Custom Audience backward compatibility
    const compiledCustomAudience = compileGovernedContext({
      workflow: 'Advanced Brief',
      operatingCore: core,
      audience: 'Custom Audience',
      customAudience: 'Nordic Sovereign Wealth Cultural Advisors',
      explicitFields: { audience: true }
    });
    assert.equal(compiledCustomAudience.manifest.audience.provenance, 'EXPLICIT');
    assert.ok(
      compiledCustomAudience.manifest.audience.value?.includes('Nordic Sovereign Wealth Cultural Advisors')
    );

    // Reframing dropdown preserves legacy audience if loaded from old Content Library item
    const dropdownWithLegacy = getReframingAudienceOptions(core, 'Arts Patrons Legacy');
    assert.ok(dropdownWithLegacy.includes('Arts Patrons Legacy'));
  });

  it('8. PROTECTED_COH_KERNEL has a single authoritative definition in operatingCore.ts and is re-exported cleanly', () => {
    const appPath = path.resolve(process.cwd(), 'src/App.tsx');
    const corePath = path.resolve(process.cwd(), 'src/lib/operatingCore.ts');
    const appSource = fs.readFileSync(appPath, 'utf8');
    const coreSource = fs.readFileSync(corePath, 'utf8');

    assert.ok(
      coreSource.includes('export const PROTECTED_COH_KERNEL ='),
      'operatingCore.ts must define PROTECTED_COH_KERNEL'
    );
    assert.ok(
      !appSource.includes('export const PROTECTED_COH_KERNEL ='),
      'App.tsx must not maintain a duplicate PROTECTED_COH_KERNEL literal definition'
    );
    assert.ok(
      PROTECTED_COH_KERNEL.includes('PROTECTED COH KERNEL: ALWAYS ON (Highest Priority)'),
      'PROTECTED_COH_KERNEL content must remain intact'
    );
  });
});

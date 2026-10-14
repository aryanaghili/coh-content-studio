import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAdvancedBriefFromCalendarItem,
  isAdvisoryProofNotice,
  sanitizePlaceholderTokens
} from '../src/utils/calendarHandoffUtils.ts';
import { buildWorkContextSnapshot } from '../src/lib/workflowContinuity.ts';
import { buildIdeationToContentHandoff, enrichAndDiversifyOpportunities } from '../src/lib/ideationIntelligence.ts';
import { resolveReframeIntent, buildReframeLineageMetadata } from '../src/lib/reframingEngine.ts';

describe('COH-CS-07 Cross-Studio Continuity, Handoff Integrity & Placeholder Regression', () => {
  it('Calendar -> Content Handoff: prevents advisory proofNeeded notices from polluting mustInclude as placeholders', () => {
    const calendarItemWithAdvisory = {
      id: 'cal-101',
      title: 'Nordic Air Institutional Preview',
      editorialThesis: 'Aligning {opera_title} with seasonal programming',
      coreMessage: 'Live opera as the origin asset for cultural IP',
      audience: 'Cultural Institutions',
      channel: 'LinkedIn',
      format: 'Thought Leadership Post',
      strategicFocus: 'Climate Opera as Cultural IP',
      adoptionTrack: 'Institutional Adoption',
      proofNeeded: 'Proof needed: specific production milestone, capture plan, partner confirmation, or approved document.',
      riskToAvoid: 'Avoid generic NGO crisis language'
    };

    assert.equal(isAdvisoryProofNotice(calendarItemWithAdvisory.proofNeeded), true);
    const brief = buildAdvancedBriefFromCalendarItem(calendarItemWithAdvisory);

    assert.equal(brief.mustInclude, '', 'Advisory proofNeeded notice must NOT be copied into mustInclude');
    assert.ok(!brief.angle.includes('{'), 'Curly brace placeholders must be sanitized');
    assert.equal(brief.channel, 'LinkedIn');
    assert.equal(brief.audience, 'Cultural Institutions');
    assert.ok(brief.customDirection.includes('Evidence Advisory'));
  });

  it('Current Work Context Snapshot: tracks Origin, Audience, Channel/Format, Sources, and Stage Trail across studios', () => {
    const snapshot = buildWorkContextSnapshot({
      activeWorkItem: {
        id: 'wi-1',
        ideaId: 'idea-42',
        title: 'Nordic Air Programming Case',
        audience: 'Cultural Institutions',
        channel: 'LinkedIn',
        format: 'Thought Leadership Post',
        pillar: 'The Tetralogy & Operatic Worldbuilding',
        purpose: 'Establish institutional credibility'
      },
      sourceBindings: [
        {
          sourceId: 'src-1',
          title: 'Nordic Air Curatorial Dossier',
          type: 'Core Fact',
          role: 'Evidence'
        }
      ],
      currentStudio: 'Content Workspace'
    });

    assert.equal(snapshot.originLabel, 'Ideation 2.0 Opportunity');
    assert.equal(snapshot.originTitle, 'Nordic Air Programming Case');
    assert.equal(snapshot.audience, 'Cultural Institutions');
    assert.equal(snapshot.channel, 'LinkedIn');
    assert.equal(snapshot.sourceBindings.length, 1);
    assert.equal(snapshot.transformationTrail.length, 2);
    assert.equal(snapshot.transformationTrail[0].studio, 'Ideation 2.0 Opportunity');
    assert.equal(snapshot.transformationTrail[1].studio, 'Content Workspace');
  });

  it('End-to-End Cross-Studio Handoff Chain: Source -> Ideation -> Content -> Reframe preserves lineage and source bindings', () => {
    const sourceBindings = [
      {
        sourceId: 'src-canon',
        title: 'COH Canon Architecture',
        type: 'Core Fact',
        role: 'Evidence' as const,
        content: 'Climate Opera Haus builds four elemental operas beginning with Nordic Air.'
      }
    ];

    const opportunities = enrichAndDiversifyOpportunities({
      rawInput: 'Four elemental operas and cultural memory',
      defaultAudience: 'Cultural Institutions',
      defaultChannel: 'LinkedIn',
      defaultLanguage: 'English',
      rawProposals: [
        {
          title: 'Why Four Elemental Operas Anchor Long-Term Cultural Memory',
          explanation: 'Explain the tetralogy architecture for curatorial leaders.',
          suggestedAudience: 'Cultural Institutions',
          suggestedChannel: 'LinkedIn',
          suggestedFormat: 'Thought Leadership Post',
          suggestedPillar: 'The Opera & Worldbuilding'
        }
      ],
      sourceBindings,
      savedIdeas: [],
      savedContents: []
    });

    const handoff = buildIdeationToContentHandoff({
      idea: opportunities[0],
      currentSelectedSourceIds: ['src-canon'],
      currentTaskSourceRoleMap: {
        'src-canon': { role: 'Evidence', selectedExcerpts: [] }
      }
    });
    assert.equal(handoff.workContext.origin, 'Ideation Workspace');
    assert.equal(handoff.advancedBriefPatch.selectedSourceIds[0], 'src-canon');

    const reframePlan = resolveReframeIntent({
      rawIntent: 'Turn this into a partner outreach note for strategic sponsors with low familiarity.',
      sourceContent: handoff.advancedBriefPatch.topic,
      originChannel: handoff.advancedBriefPatch.channel,
      originAudience: handoff.advancedBriefPatch.audience,
      sourceBindings
    });

    const lineage = buildReframeLineageMetadata({
      originType: 'Content Workspace',
      originContentId: handoff.workContext.originId,
      originTitle: handoff.workContext.originTitle,
      plan: reframePlan,
      sourceIds: handoff.advancedBriefPatch.selectedSourceIds
    });

    assert.equal(lineage.originType, 'Content Workspace');
    assert.equal(lineage.transformationType, 'reframe');
    assert.deepEqual(lineage.sourceReferences, ['src-canon']);
  });
});


import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  ExternalLink,
  Target,
  Compass,
  Repeat
} from 'lucide-react';
import type { ReuseOpportunity } from '../lib/ideationIntelligence';
import type { SourceTaskRole } from '../lib/contextCompiler';

export interface IdeationCardIdea {
  id: string;
  title: string;
  originalInput: string;
  category: string;
  explanation: string;
  whyItWorks: string;
  communicationJob?: string;
  coreTension?: string;
  desiredAudienceResponse?: string;
  availableEvidence?: string[];
  evidenceStillRequired?: string[];
  unresolvedAssumptions?: string[];
  suggestedChannel: string;
  suggestedFormat: string;
  suggestedAudience?: string;
  suggestedPillar?: string;
  strategicAngle?: string;
  suggestedTone: string;
  reuseOpportunity?: ReuseOpportunity;
  possibleHook: string;
  possibleFirstPost?: string;
  riskToAvoid?: string;
  possibleNextStep: string;
  language: string;
  dateCreated: string;
  status: 'New' | 'Promising' | 'Ready for Content' | 'Used' | 'Archived' | 'Not Useful';
  sourceIds?: string[];
  sourceRoles?: Record<string, SourceTaskRole>;
}

interface IdeationOpportunityCardProps {
  idea: IdeationCardIdea;
  savingIdeaId: string | null;
  sourceTitlesMap?: Record<string, string>;
  onUpdateStatus: (id: string, status: IdeationCardIdea['status']) => void;
  onGenerateVariation: (idea: IdeationCardIdea) => void;
  onSaveToLibrary: (idea: IdeationCardIdea) => void;
  onPromoteToWorkspace: (idea: IdeationCardIdea) => void;
  onInspectReuseCandidate?: (itemType: 'idea' | 'content', itemId: string) => void;
}

export const IdeationOpportunityCard: React.FC<IdeationOpportunityCardProps> = ({
  idea,
  savingIdeaId,
  sourceTitlesMap = {},
  onUpdateStatus,
  onGenerateVariation,
  onSaveToLibrary,
  onPromoteToWorkspace,
  onInspectReuseCandidate
}) => {
  const [expanded, setExpanded] = useState(false);

  const reuse = idea.reuseOpportunity;
  const isReuseMatch = reuse && reuse.classification !== 'New Ground' && Boolean(reuse.matchedItemId);

  const getReuseBadgeStyle = (classification?: string) => {
    switch (classification) {
      case 'New Ground':
        return 'bg-status-success/10 text-status-success border-status-success/25';
      case 'Extend Existing Idea':
        return 'bg-status-warning/10 text-status-warning border-status-warning/25';
      case 'Reframe Existing Content':
        return 'bg-status-info/10 text-status-info border-status-info/25';
      case 'Reuse Existing Argument':
        return 'bg-brand-gold/15 text-brand-gold border-brand-gold/30';
      default:
        return 'bg-surface-inset text-text-secondary border-border-standard';
    }
  };

  return (
    <div
      data-testid={`ideation-opportunity-card-${idea.id}`}
      className="bg-surface-primary border border-border-standard hover:border-brand-gold/60 transition-all rounded-xl shadow-level-1 flex flex-col h-full"
    >
      <div className="p-5 flex-1 flex flex-col gap-2.5">
        {/* Top Metadata Row: Communication Job & Status */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {idea.communicationJob && (
            <span
              data-testid="idea-communication-job"
              className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-0.5 rounded-md bg-brand-gold/15 text-brand-gold border border-brand-gold/30"
            >
              <Target size={11} />
              {idea.communicationJob}
            </span>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
            {reuse && (
              <span
                data-testid="idea-reuse-badge"
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${getReuseBadgeStyle(
                  reuse.classification
                )}`}
                title={reuse.rationale}
              >
                <Repeat size={10} />
                {reuse.classification}
                {reuse.confidence === 'Low' ? ' (Low conf.)' : ''}
              </span>
            )}
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                idea.status === 'Promising'
                  ? 'bg-brand-gold text-text-inverse border-brand-gold'
                  : idea.status === 'Not Useful'
                  ? 'bg-status-error/10 text-status-error border-status-error/30'
                  : 'bg-surface-inset text-text-secondary border-border-standard'
              }`}
            >
              {idea.status}
            </span>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-sans font-semibold text-text-primary text-[15px] leading-snug tracking-tight mt-0.5">
          {idea.title}
        </h4>

        {/* Core Idea / Concept */}
        <p className="font-sans text-[13px] text-text-secondary leading-relaxed">
          {idea.explanation}
        </p>

        {/* Why It Matters */}
        <p className="font-sans text-[12px] text-text-primary leading-relaxed bg-surface-inset/70 px-3 py-2 rounded-lg border border-border-standard">
          <span className="font-semibold text-brand-gold">Why it matters: </span>
          {idea.whyItWorks}
        </p>

        {/* Attached Source Traceability Pill (when source-grounded) */}
        {idea.sourceIds && idea.sourceIds.length > 0 && (
          <div
            data-testid="idea-source-grounding-badges"
            className="flex flex-wrap items-center gap-1.5 pt-0.5"
          >
            {idea.sourceIds.map(srcId => {
              const role = idea.sourceRoles?.[srcId] || 'Evidence';
              const srcTitle = sourceTitlesMap[srcId] || srcId;
              return (
                <span
                  key={srcId}
                  className="inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-md bg-surface-inset border border-border-standard text-text-secondary"
                >
                  <FileText size={10} className="text-brand-gold" />
                  <span className="truncate max-w-[160px]">{srcTitle}</span>
                  <span className="text-brand-gold font-semibold">({role})</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Reuse Candidate Inspection Callout (if matched in Idea or Content Library) */}
        {isReuseMatch && reuse && (
          <div
            data-testid="idea-reuse-callout"
            className="p-2.5 rounded-lg bg-surface-inset border border-border-standard flex items-center justify-between gap-2 text-[11px]"
          >
            <div className="text-text-secondary leading-snug">
              <span className="font-semibold text-text-primary">{reuse.classification}: </span>
              {reuse.matchedItemTitle ? `"${reuse.matchedItemTitle}"` : reuse.rationale}
              <span className="ml-1 text-[10px] text-text-muted">
                (Confidence: {reuse.confidence})
              </span>
            </div>
            {onInspectReuseCandidate && reuse.matchedItemId && reuse.matchedItemType && (
              <button
                type="button"
                data-testid="inspect-reuse-candidate-btn"
                onClick={() => onInspectReuseCandidate(reuse.matchedItemType!, reuse.matchedItemId!)}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-surface-primary border border-border-strong text-[10.5px] font-semibold text-brand-gold hover:bg-brand-gold/10 transition-colors cursor-pointer"
              >
                Inspect <ExternalLink size={10} />
              </button>
            )}
          </div>
        )}

        {/* Primary Recommended Channel / Format / Audience / Pillar Badges */}
        <div className="flex gap-1.5 flex-wrap items-center mt-auto pt-1.5">
          <span className="text-[10.5px] px-2 py-0.5 rounded-md border border-border-strong bg-surface-secondary text-text-primary font-medium">
            {idea.suggestedChannel}
          </span>
          <span className="text-[10.5px] px-2 py-0.5 rounded-md border border-border-standard bg-surface-secondary text-text-secondary font-medium">
            {idea.suggestedFormat}
          </span>
          {idea.suggestedAudience && (
            <span className="text-[10.5px] px-2 py-0.5 rounded-md border border-border-standard bg-surface-inset text-text-muted">
              {idea.suggestedAudience}
            </span>
          )}
          {idea.suggestedPillar && (
            <span className="text-[10.5px] px-2 py-0.5 rounded-md border border-border-standard bg-surface-inset text-text-muted">
              {idea.suggestedPillar}
            </span>
          )}
        </div>

        {/* Expandable Secondary Intelligence Toggle */}
        <button
          type="button"
          data-testid="toggle-idea-details-btn"
          onClick={() => setExpanded(prev => !prev)}
          className="mt-1 pt-2 border-t border-border-standard flex items-center justify-between text-[11.5px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
        >
          <span className="inline-flex items-center gap-1.5">
            <Compass size={12} className="text-brand-gold" />
            Opportunity, Evidence & Reuse Details
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {/* Expandable Detail Section */}
        {expanded && (
          <div
            data-testid="idea-expanded-intelligence"
            className="mt-1 pt-3 border-t border-border-standard flex flex-col gap-3 text-[12px] bg-surface-inset/70 p-3 rounded-lg"
          >
            {idea.strategicAngle && (
              <div>
                <span className="font-semibold text-text-primary block text-[11px] mb-0.5">
                  Strategic Angle
                </span>
                <p className="text-text-secondary">{idea.strategicAngle}</p>
              </div>
            )}

            {idea.coreTension && (
              <div>
                <span className="font-semibold text-text-primary block text-[11px] mb-0.5">
                  Core Tension or Audience Problem
                </span>
                <p className="text-text-secondary">{idea.coreTension}</p>
              </div>
            )}

            {idea.desiredAudienceResponse && (
              <div>
                <span className="font-semibold text-text-primary block text-[11px] mb-0.5">
                  Desired Audience Response
                </span>
                <p className="text-text-secondary">{idea.desiredAudienceResponse}</p>
              </div>
            )}

            {/* Available Evidence */}
            {idea.availableEvidence && idea.availableEvidence.length > 0 && (
              <div data-testid="idea-available-evidence">
                <span className="font-semibold text-status-success flex items-center gap-1 text-[11px] mb-1">
                  <CheckCircle2 size={12} /> Available Evidence
                </span>
                <ul className="list-disc pl-4 space-y-1 text-text-secondary text-[11px]">
                  {idea.availableEvidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Evidence Still Required (Advisory Signal) */}
            {idea.evidenceStillRequired && idea.evidenceStillRequired.length > 0 && (
              <div data-testid="idea-evidence-required">
                <span className="font-semibold text-status-warning flex items-center gap-1 text-[11px] mb-1">
                  <AlertCircle size={12} /> Evidence Still Required (Advisory)
                </span>
                <ul className="list-disc pl-4 space-y-1 text-text-secondary text-[11px]">
                  {idea.evidenceStillRequired.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unresolved Assumptions */}
            {idea.unresolvedAssumptions && idea.unresolvedAssumptions.length > 0 && (
              <div>
                <span className="font-semibold text-text-primary block text-[11px] mb-1">
                  Unresolved Assumptions
                </span>
                <ul className="list-disc pl-4 space-y-1 text-text-secondary text-[11px]">
                  {idea.unresolvedAssumptions.map((assump, i) => (
                    <li key={i}>{assump}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reuse Assessment Rationale */}
            {reuse && (
              <div>
                <span className="font-semibold text-text-primary block text-[11px] mb-0.5">
                  Reuse Assessment ({reuse.classification} - {reuse.confidence} Confidence)
                </span>
                <p className="text-text-secondary text-[11px]">{reuse.rationale}</p>
              </div>
            )}

            {idea.possibleHook && (
              <div className="bg-surface-primary p-2.5 border border-border-standard rounded-lg text-[11px] italic text-text-secondary">
                <span className="font-semibold not-italic block text-text-primary mb-0.5">Hook idea:</span>
                "{idea.possibleHook}"
              </div>
            )}

            {idea.possibleFirstPost && (
              <div className="bg-brand-gold/10 p-2.5 border border-brand-gold/25 rounded-lg text-[11px] text-text-primary">
                <span className="font-semibold block text-text-secondary mb-0.5">First Post Idea:</span>
                "{idea.possibleFirstPost}"
              </div>
            )}

            {idea.riskToAvoid && (
              <p className="text-[11px] text-status-warning leading-relaxed">
                <span className="font-semibold">Risk to Avoid:</span> {idea.riskToAvoid}
              </p>
            )}

            {idea.possibleNextStep && (
              <p className="text-[11px] text-text-muted leading-relaxed">
                <span className="font-semibold text-text-secondary">Next Step:</span> {idea.possibleNextStep}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions (Preserving all existing Ideation buttons) */}
      <div className="px-4 py-3 border-t border-border-standard flex items-center justify-between gap-2 bg-surface-inset/60 rounded-b-xl flex-wrap">
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => onUpdateStatus(idea.id, 'Promising')}
            className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-brand-gold hover:bg-brand-gold/10 transition-colors cursor-pointer"
          >
            Promising
          </button>
          <button
            type="button"
            onClick={() => onUpdateStatus(idea.id, 'Not Useful')}
            className="h-7 px-2.5 rounded-md text-[11.5px] font-medium text-text-muted hover:text-status-error hover:bg-status-error/10 transition-colors cursor-pointer"
          >
            Not Useful
          </button>
        </div>

        <div className="flex gap-1.5 items-center">
          <button
            type="button"
            onClick={() => onGenerateVariation(idea)}
            className="h-8 px-2.5 rounded-lg text-[11.5px] font-medium border border-border-standard bg-surface-primary text-text-secondary hover:text-text-primary hover:border-border-strong transition-colors cursor-pointer"
          >
            Variations
          </button>
          <button
            type="button"
            disabled={savingIdeaId === idea.id}
            onClick={() => onSaveToLibrary(idea)}
            className="h-8 px-2.5 rounded-lg text-[11.5px] font-medium border border-border-standard bg-surface-primary text-text-secondary hover:text-text-primary hover:border-border-strong disabled:opacity-50 transition-colors cursor-pointer"
          >
            {savingIdeaId === idea.id ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            data-testid={`promote-idea-to-draft-${idea.id}`}
            onClick={() => onPromoteToWorkspace(idea)}
            className="h-8 px-3 rounded-lg text-[12px] font-semibold bg-brand-gold text-text-inverse hover:bg-brand-gold-hover transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
          >
            <Sparkles size={12} />
            Draft
          </button>
        </div>
      </div>
    </div>
  );
};

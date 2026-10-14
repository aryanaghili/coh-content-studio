import React from 'react';
import { Sparkles, Zap, Compass, CheckCircle2, PlusCircle, AlertTriangle } from 'lucide-react';
import {
  type ResolvedSmartBrief,
  type SmartBriefProvenance,
  type GenerationSpeedMode,
  resolveGenerationSpeedConfig
} from '../lib/smartBriefAndRevision';

interface SmartBriefPanelProps {
  smartBrief: ResolvedSmartBrief;
  speedMode: GenerationSpeedMode;
  onChangeSpeedMode: (mode: GenerationSpeedMode) => void;
  onApplySmartBrief: (resolved: ResolvedSmartBrief) => void;
  onSelectSuggestedSource: (sourceId: string) => void;
}

const PROVENANCE_BADGE_STYLES: Record<SmartBriefProvenance, { label: string; className: string }> = {
  explicit: {
    label: 'Explicit',
    className: 'bg-status-success/10 text-status-success border-status-success/25'
  },
  inherited: {
    label: 'Inherited',
    className: 'bg-status-info/10 text-status-info border-status-info/25'
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30'
  },
  unresolved: {
    label: 'Unresolved',
    className: 'bg-status-warning/10 text-status-warning border-status-warning/25'
  }
};

export const SmartBriefPanel: React.FC<SmartBriefPanelProps> = ({
  smartBrief,
  speedMode,
  onChangeSpeedMode,
  onApplySmartBrief,
  onSelectSuggestedSource
}) => {
  const speedConfig = resolveGenerationSpeedConfig(speedMode);

  const renderFieldPill = (label: string, field: { value: string; provenance: SmartBriefProvenance }) => {
    const badge = PROVENANCE_BADGE_STYLES[field.provenance];
    return (
      <div className="px-2.5 py-2 rounded-lg bg-surface-primary border border-border-standard flex flex-col gap-0.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10.5px] font-medium text-text-muted">{label}</span>
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <span className="text-[11.5px] font-semibold text-text-primary truncate" title={field.value || 'Not set'}>
          {field.value || 'Not set'}
        </span>
      </div>
    );
  };

  return (
    <div
      data-testid="smart-brief-panel"
      className="bg-surface-primary border border-border-standard rounded-xl p-4 shadow-level-1 space-y-3"
    >
      {/* Top Row: Smart Brief Header + Apply Button + Fast vs Explore Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-standard pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-brand-gold shrink-0" />
          <div>
            <h4 className="font-sans text-[13px] font-semibold text-text-primary tracking-tight">
              Smart Brief & Generation Speed
            </h4>
            <p className="text-[11.5px] text-text-secondary">
              Resolves audience, channel, format, pillar, and source suggestions from your natural-language request.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Fast vs Explore Toggle (Part B) */}
          <div
            data-testid="generation-speed-toggle"
            className="inline-flex rounded-lg bg-surface-inset p-0.5 border border-border-standard"
          >
            <button
              type="button"
              data-testid="speed-mode-fast"
              onClick={() => onChangeSpeedMode('fast')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                speedMode === 'fast'
                  ? 'bg-brand-gold text-text-inverse shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Zap size={11} />
              Fast (1 Draft)
            </button>
            <button
              type="button"
              data-testid="speed-mode-explore"
              onClick={() => onChangeSpeedMode('explore')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                speedMode === 'explore'
                  ? 'bg-brand-gold text-text-inverse shadow-2xs'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Compass size={11} />
              Explore (Multi-Option)
            </button>
          </div>

          <button
            type="button"
            data-testid="resolve-smart-brief-btn"
            onClick={() => onApplySmartBrief(smartBrief)}
            className="px-3 py-1.5 rounded-lg bg-surface-inset border border-border-strong text-text-primary text-[11.5px] font-semibold hover:border-brand-gold hover:bg-brand-gold/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={12} className="text-brand-gold" />
            Apply Resolved Brief
          </button>
        </div>
      </div>

      {/* Resolved Field Grid with Provenance Badges */}
      <div
        data-testid="smart-brief-fields-grid"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2"
      >
        {renderFieldPill('Audience', smartBrief.audience)}
        {renderFieldPill('Channel', smartBrief.channel)}
        {renderFieldPill('Format', smartBrief.outputFormat)}
        {renderFieldPill('Pillar', smartBrief.pillar)}
        {renderFieldPill('Purpose', smartBrief.purpose)}
        {renderFieldPill('Language', smartBrief.language)}
      </div>

      {/* Selected vs Suggested Sources (never silently attach suggested sources) */}
      {smartBrief.suggestedSources.length > 0 && (
        <div
          data-testid="smart-brief-suggested-sources"
          className="pt-2 border-t border-border-standard flex flex-wrap items-center gap-2"
        >
          <span className="text-[11px] font-medium text-text-secondary">
            Source Grounding:
          </span>
          {smartBrief.suggestedSources.map(src => (
            <div
              key={src.sourceId}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                src.status === 'selected'
                  ? 'bg-status-success/10 border-status-success/30 text-status-success'
                  : 'bg-surface-inset border-border-standard text-text-primary'
              }`}
            >
              {src.status === 'selected' ? (
                <>
                  <CheckCircle2 size={12} className="text-status-success shrink-0" />
                  <span className="font-semibold">{src.title}</span>
                  <span className="text-[9.5px] font-semibold px-1.5 rounded bg-status-success/15">
                    Selected
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium">{src.title}</span>
                  <span className="text-[9.5px] font-semibold px-1.5 rounded bg-status-warning/15 text-status-warning">
                    Suggested
                  </span>
                  <button
                    type="button"
                    data-testid={`attach-suggested-source-${src.sourceId}`}
                    onClick={() => onSelectSuggestedSource(src.sourceId)}
                    className="ml-1 text-[10.5px] font-semibold text-brand-gold hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                  >
                    <PlusCircle size={11} /> Select
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Unresolved Advisory Warnings */}
      {smartBrief.unresolvedWarnings.length > 0 && (
        <div
          data-testid="smart-brief-unresolved-warnings"
          className="p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/25 text-[11px] text-text-primary space-y-1"
        >
          {smartBrief.unresolvedWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertTriangle size={12} className="text-status-warning shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-text-muted pt-0.5">
        <span>
          <strong className="font-medium text-text-secondary">Speed Mode:</strong> {speedConfig.label} — {speedConfig.description}
        </span>
      </div>
    </div>
  );
};

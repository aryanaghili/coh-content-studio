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
    className: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
  },
  inherited: {
    label: 'Inherited',
    className: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30'
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-brand-gold/15 text-brand-gold border-brand-gold/30'
  },
  unresolved: {
    label: 'Unresolved',
    className: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
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
      <div className="p-2 rounded-lg bg-surface-primary border border-border-standard flex flex-col gap-1">
        <div className="flex items-center justify-between gap-1">
          <span className="text-[9px] uppercase font-bold tracking-wider text-text-secondary">{label}</span>
          <span
            className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded border ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-text-primary truncate" title={field.value || 'Not set'}>
          {field.value || 'Not set'}
        </span>
      </div>
    );
  };

  return (
    <div
      data-testid="smart-brief-panel"
      className="bg-surface-inset border border-border-standard rounded-xl p-4 space-y-3.5"
    >
      {/* Top Row: Smart Brief Header + Apply Button + Fast vs Explore Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border-standard pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-brand-gold shrink-0" />
          <div>
            <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-text-primary">
              Smart Brief & Generation Mode
            </h4>
            <p className="text-[11px] text-text-secondary">
              Resolves audience, channel, format, pillar, and source suggestions from your natural-language request.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Fast vs Explore Toggle (Part B) */}
          <div
            data-testid="generation-speed-toggle"
            className="inline-flex rounded-lg bg-surface-primary p-0.5 border border-border-standard"
          >
            <button
              type="button"
              data-testid="speed-mode-fast"
              onClick={() => onChangeSpeedMode('fast')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-colors ${
                speedMode === 'fast'
                  ? 'bg-brand-gold text-text-inverse shadow-xs'
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
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold inline-flex items-center gap-1 transition-colors ${
                speedMode === 'explore'
                  ? 'bg-brand-gold text-text-inverse shadow-xs'
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
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white dark:bg-surface-primary dark:border dark:border-brand-gold/40 text-[11px] font-bold hover:bg-brand-gold-hover transition-colors inline-flex items-center gap-1.5"
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
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
            Source Grounding:
          </span>
          {smartBrief.suggestedSources.map(src => (
            <div
              key={src.sourceId}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                src.status === 'selected'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                  : 'bg-surface-primary border-border-standard text-text-primary'
              }`}
            >
              {src.status === 'selected' ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">{src.title}</span>
                  <span className="text-[9px] uppercase font-bold px-1 rounded bg-emerald-500/20">
                    Selected
                  </span>
                </>
              ) : (
                <>
                  <span className="font-medium">{src.title}</span>
                  <span className="text-[9px] uppercase font-bold px-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300">
                    Suggested
                  </span>
                  <button
                    type="button"
                    data-testid={`attach-suggested-source-${src.sourceId}`}
                    onClick={() => onSelectSuggestedSource(src.sourceId)}
                    className="ml-1 text-[10px] font-bold text-brand-gold hover:underline inline-flex items-center gap-0.5"
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
          className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 space-y-1"
        >
          {smartBrief.unresolvedWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <AlertTriangle size={12} className="shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-text-muted pt-1">
        <span>
          <strong>Active Speed Mode:</strong> {speedConfig.label} - {speedConfig.description}
        </span>
      </div>
    </div>
  );
};

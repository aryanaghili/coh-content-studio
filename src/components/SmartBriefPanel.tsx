import React from 'react';
import { Sparkles, Zap, Compass, CheckCircle2, PlusCircle, AlertTriangle, ChevronDown } from 'lucide-react';
import {
  type ResolvedSmartBrief,
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

export const SmartBriefPanel: React.FC<SmartBriefPanelProps> = ({
  smartBrief,
  speedMode,
  onChangeSpeedMode,
  onApplySmartBrief,
  onSelectSuggestedSource
}) => {
  const speedConfig = resolveGenerationSpeedConfig(speedMode);
  const waitingForRequest = smartBrief.unresolvedWarnings.some(w =>
    /topic|request|goal|natural-language/i.test(w)
  );

  const resolvedFields = [
    ['Audience', smartBrief.audience],
    ['Channel', smartBrief.channel],
    ['Format', smartBrief.outputFormat],
    ['Pillar', smartBrief.pillar],
    ['Purpose', smartBrief.purpose],
    ['Language', smartBrief.language]
  ] as const;

  if (waitingForRequest) return null;

  return (
    <div data-testid="smart-brief-panel" className="bg-surface-primary border border-border-standard rounded-xl p-4 shadow-level-1 space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles size={15} className="text-brand-gold" />
            <h4 className="text-[12.5px] font-semibold text-text-primary">Draft Setup</h4>
          </div>
          <p className="text-[11px] text-text-secondary mt-1">Review the suggested setup, then generate. Change anything that does not match your intent.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div data-testid="generation-speed-toggle" className="inline-flex rounded-lg bg-surface-inset p-0.5 border border-border-standard">
            <button type="button" data-testid="speed-mode-fast" onClick={() => onChangeSpeedMode('fast')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 ${speedMode === 'fast' ? 'bg-brand-gold text-text-inverse' : 'text-text-secondary hover:text-text-primary'}`}>
              <Zap size={11} /> Fast
            </button>
            <button type="button" data-testid="speed-mode-explore" onClick={() => onChangeSpeedMode('explore')} className={`px-2.5 py-1 rounded-md text-[11px] font-semibold inline-flex items-center gap-1 ${speedMode === 'explore' ? 'bg-brand-gold text-text-inverse' : 'text-text-secondary hover:text-text-primary'}`}>
              <Compass size={11} /> Explore
            </button>
          </div>
          <button type="button" data-testid="resolve-smart-brief-btn" onClick={() => onApplySmartBrief(smartBrief)} className="px-3 py-1.5 rounded-lg bg-brand-gold text-text-inverse text-[11.5px] font-semibold hover:bg-brand-gold-hover inline-flex items-center gap-1.5">
            <CheckCircle2 size={12} /> Use Suggested Setup
          </button>
        </div>
      </div>

      <div data-testid="smart-brief-fields-grid" className="flex flex-wrap gap-1.5">
        {resolvedFields.map(([label, field]) => (
          <div key={label} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-inset border border-border-standard text-[10.5px]">
            <span className="text-text-muted">{label}</span>
            <span className="font-semibold text-text-primary max-w-[220px] truncate" title={field.value || 'Not set'}>{field.value || 'Not set'}</span>
          </div>
        ))}
      </div>

      {smartBrief.suggestedSources.length > 0 && (
        <div data-testid="smart-brief-suggested-sources" className="pt-2 border-t border-border-standard flex flex-wrap items-center gap-2">
          <span className="text-[10.5px] font-medium text-text-muted">Grounding:</span>
          {smartBrief.suggestedSources.map(src => (
            <div key={src.sourceId} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10.5px] ${src.status === 'selected' ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-surface-inset border-border-standard text-text-primary'}`}>
              {src.status === 'selected' ? <CheckCircle2 size={11} /> : null}
              <span className="font-medium">{src.title}</span>
              {src.status !== 'selected' && (
                <button type="button" data-testid={`attach-suggested-source-${src.sourceId}`} onClick={() => onSelectSuggestedSource(src.sourceId)} className="ml-1 font-semibold text-brand-gold hover:underline inline-flex items-center gap-0.5">
                  <PlusCircle size={10} /> Add
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {smartBrief.unresolvedWarnings.length > 0 && (
        <div data-testid="smart-brief-unresolved-warnings" className="p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/25 text-[10.5px] text-text-primary space-y-1">
          {smartBrief.unresolvedWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-1.5"><AlertTriangle size={11} className="text-status-warning shrink-0 mt-0.5" /><span>{w}</span></div>
          ))}
        </div>
      )}

      <details className="text-[10.5px] text-text-muted">
        <summary className="cursor-pointer inline-flex items-center gap-1 hover:text-text-primary"><ChevronDown size={10} /> Why these settings?</summary>
        <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-1.5">
          {resolvedFields.map(([label, field]) => (
            <div key={label} className="px-2 py-1.5 rounded-md border border-border-standard bg-surface-inset">
              <span className="font-medium text-text-secondary">{label}</span>
              <span className="ml-1 text-text-muted">· {field.provenance}</span>
            </div>
          ))}
        </div>
      </details>

      <div className="text-[10.5px] text-text-muted"><strong className="font-medium text-text-secondary">Mode:</strong> {speedConfig.label} · {speedConfig.description}</div>
    </div>
  );
};

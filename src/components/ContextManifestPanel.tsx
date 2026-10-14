import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ShieldCheck, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { ContextManifest, ContextProvenance } from '../lib/contextCompiler';

interface ContextManifestPanelProps {
  manifest: ContextManifest;
  theme?: 'light' | 'dark';
  defaultExpanded?: boolean;
  className?: string;
}

const PROVENANCE_LABEL: Record<ContextProvenance, string> = {
  EXPLICIT: 'Explicit',
  INHERITED: 'Inherited',
  RESOLVED: 'Resolved',
  UNRESOLVED: 'Missing'
};

export const ContextManifestPanel: React.FC<ContextManifestPanelProps> = ({
  manifest,
  defaultExpanded = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasSources = manifest.sourcesSelected.length > 0;
  const evidenceLabel = hasSources
    ? `${manifest.sourcesSelected.length} grounded source${manifest.sourcesSelected.length > 1 ? 's' : ''}`
    : 'COH guidance only';

  const provenanceBadge = (prov: ContextProvenance) => {
    if (prov === 'EXPLICIT') return 'text-status-success';
    if (prov === 'RESOLVED') return 'text-brand-gold';
    if (prov === 'INHERITED') return 'text-status-info';
    return 'text-text-muted';
  };

  return (
    <div
      data-testid="context-manifest-panel"
      className={`rounded-xl border border-border-standard bg-surface-primary/75 text-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-surface-inset/45 rounded-xl transition-colors"
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
          {expanded ? <ChevronDown className="w-3.5 h-3.5 text-text-muted" /> : <ChevronRight className="w-3.5 h-3.5 text-text-muted" />}
          <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
          <span className="font-semibold text-text-primary text-[11.5px]">Applied Guidance</span>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md border border-border-standard bg-surface-inset text-[10.5px] text-text-secondary">
            COH Kernel + {manifest.operatingCoreActive ? 'Operating Core' : 'Kernel'}
          </span>
          {manifest.audience.value && <span className="hidden md:inline text-[10.5px] text-text-muted">{manifest.audience.value}</span>}
          {manifest.channel.value && <span className="hidden lg:inline text-[10.5px] text-text-muted">· {manifest.channel.value}</span>}
          <span className="hidden lg:inline text-[10.5px] text-text-muted">· {evidenceLabel}</span>
          {manifest.conflictWarnings.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-status-warning">
              <AlertCircle className="w-3 h-3" /> {manifest.conflictWarnings.length} notice{manifest.conflictWarnings.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-[10.5px] text-text-muted shrink-0">{expanded ? 'Hide details' : 'View details'}</span>
      </button>

      {expanded && (
        <div className="border-t border-border-standard px-3.5 py-3 bg-surface-inset/30 rounded-b-xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {[
              ['Audience', manifest.audience],
              ['Channel', manifest.channel],
              ['Format', manifest.format],
              ['Language', manifest.language]
            ].map(([label, field]: any) => (
              <div key={label} className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] text-text-muted">{label}</span>
                  <span className={`text-[9.5px] font-semibold ${provenanceBadge(field.provenance)}`}>{PROVENANCE_LABEL[field.provenance]}</span>
                </div>
                <div className="mt-0.5 text-[11.5px] font-semibold text-text-primary truncate">{field.value || 'Not specified'}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-primary"><FileText className="w-3.5 h-3.5 text-brand-gold" /> Grounding</div>
              {hasSources ? (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {manifest.sourcesSelected.map(s => (
                    <span key={s.id} className="px-2 py-0.5 rounded-md bg-surface-inset border border-border-standard text-[10px] text-text-secondary">
                      {s.title} · {s.role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-[10.5px] text-text-secondary">No task source is attached. Unverified claims, dates, and commitments remain restricted.</p>
              )}
            </div>

            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-text-primary"><CheckCircle2 className="w-3.5 h-3.5 text-brand-gold" /> Governance</div>
              <p className="mt-1 text-[10.5px] text-text-secondary leading-relaxed">
                {manifest.activeGuidanceSummary.slice(0, 3).join(', ')}{manifest.activeGuidanceSummary.length > 3 ? ` + ${manifest.activeGuidanceSummary.length - 3} more` : ''}
              </p>
            </div>
          </div>

          <details className="rounded-lg border border-border-standard bg-surface-primary">
            <summary className="cursor-pointer px-2.5 py-2 text-[10.5px] font-semibold text-text-secondary">Technical provenance</summary>
            <div className="border-t border-border-standard p-2.5 grid grid-cols-2 lg:grid-cols-4 gap-2 text-[10px]">
              <div><span className="font-semibold text-status-success">Explicit ({manifest.explicitInputs.length})</span><div className="mt-0.5 text-text-muted">{manifest.explicitInputs.length ? manifest.explicitInputs.join(', ') : 'None'}</div></div>
              <div><span className="font-semibold text-status-info">Inherited ({manifest.inheritedInputs.length})</span><div className="mt-0.5 text-text-muted">{manifest.inheritedInputs.length ? manifest.inheritedInputs.join(', ') : 'None'}</div></div>
              <div><span className="font-semibold text-brand-gold">Resolved ({manifest.resolvedInputs.length})</span><div className="mt-0.5 text-text-muted">{manifest.resolvedInputs.length ? manifest.resolvedInputs.join(', ') : 'None'}</div></div>
              <div><span className="font-semibold text-text-muted">Missing ({manifest.unresolvedInputs.length})</span><div className="mt-0.5 text-text-muted">{manifest.unresolvedInputs.length ? manifest.unresolvedInputs.join(', ') : 'None'}</div></div>
            </div>
          </details>

          {manifest.conflictWarnings.length > 0 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-status-warning/30 bg-status-warning/10">
              <AlertCircle className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[10.5px] text-text-primary">
                {manifest.conflictWarnings.map((w, idx) => <p key={idx}>{w}</p>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

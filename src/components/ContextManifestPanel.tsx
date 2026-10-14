import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ShieldCheck, Layers, FileText, AlertCircle } from 'lucide-react';
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

  const getBadgeStyle = (prov: ContextProvenance) => {
    if (prov === 'EXPLICIT') {
      return 'bg-status-success/10 text-status-success border-status-success/25';
    }
    if (prov === 'INHERITED') {
      return 'bg-status-info/10 text-status-info border-status-info/25';
    }
    if (prov === 'RESOLVED') {
      return 'bg-brand-gold/15 text-brand-gold border-brand-gold/30';
    }
    return 'bg-surface-inset text-text-muted border-border-standard';
  };

  return (
    <div
      data-testid="context-manifest-panel"
      className={`rounded-xl border border-border-standard bg-surface-primary/80 text-xs transition-colors ${className}`}
    >
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-left rounded-xl hover:bg-surface-inset/70 transition-colors cursor-pointer"
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-text-muted" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-text-muted" />
          )}
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-brand-gold" />
          <span className="font-semibold tracking-tight text-text-primary text-[12px]">Applied Guidance</span>
          <span className="px-2 py-0.5 rounded-md border border-border-standard bg-surface-inset text-[10.5px] font-medium text-text-secondary">
            COH Kernel + {manifest.operatingCoreActive ? 'Operating Core' : 'Kernel Only'}
          </span>
          {manifest.channel.value && (
            <span
              className={`hidden sm:inline-block px-2 py-0.5 rounded-md border text-[10.5px] font-medium ${getBadgeStyle(
                manifest.channel.provenance
              )}`}
            >
              {manifest.channel.value}
            </span>
          )}
          {manifest.audience.value && (
            <span
              className={`hidden md:inline-block px-2 py-0.5 rounded-md border text-[10.5px] font-medium ${getBadgeStyle(
                manifest.audience.provenance
              )}`}
            >
              {manifest.audience.value}
            </span>
          )}
          {manifest.sourcesSelected.length > 0 && (
            <span className="px-2 py-0.5 rounded-md border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-[10.5px] font-medium">
              {manifest.sourcesSelected.length} {manifest.sourcesSelected.length === 1 ? 'Source' : 'Sources'}
            </span>
          )}
          {manifest.conflictWarnings.length > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-status-warning/30 bg-status-warning/10 text-status-warning text-[10.5px] font-semibold">
              <AlertCircle className="w-3 h-3" />
              {manifest.conflictWarnings.length} Notice{manifest.conflictWarnings.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <span className="text-[11px] font-medium text-text-muted hover:text-text-primary shrink-0">
          {expanded ? 'Hide details' : 'View details'}
        </span>
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 pt-2.5 border-t border-border-standard space-y-2.5 bg-surface-inset/40 rounded-b-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center justify-between gap-1 mb-1"><span className="text-[10.5px] font-medium text-text-secondary">COH Guidance</span><span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${getBadgeStyle('RESOLVED')}`}>Active</span></div>
              <div className="font-semibold text-text-primary truncate text-[12px]">{manifest.activeGuidanceSummary.slice(0, 2).join(', ')}</div>
              <div className="text-[10.5px] mt-0.5 truncate text-text-muted">{manifest.activeGuidanceSummary.length} governed rule layers</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center justify-between gap-1 mb-1"><span className="text-[10.5px] font-medium text-text-secondary">Audience</span><span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${getBadgeStyle(manifest.audience.provenance)}`}>{PROVENANCE_LABEL[manifest.audience.provenance]}</span></div>
              <div className="font-semibold text-text-primary truncate text-[12px]">{manifest.audience.value || 'Not specified'}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center justify-between gap-1 mb-1"><span className="text-[10.5px] font-medium text-text-secondary">Channel</span><span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${getBadgeStyle(manifest.channel.provenance)}`}>{PROVENANCE_LABEL[manifest.channel.provenance]}</span></div>
              <div className="font-semibold text-text-primary truncate text-[12px]">{manifest.channel.value || 'Not specified'}</div>
              <div className="text-[10.5px] mt-0.5 truncate text-text-muted">Format: {manifest.format.value || 'Unresolved'}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center justify-between gap-1 mb-1"><span className="text-[10.5px] font-medium text-text-secondary">Language</span><span className={`px-1.5 py-0.5 rounded text-[9.5px] font-semibold border ${getBadgeStyle(manifest.language.provenance)}`}>{PROVENANCE_LABEL[manifest.language.provenance]}</span></div>
              <div className="font-semibold text-text-primary truncate text-[12px]">{manifest.language.value || 'Not specified'}</div>
              <div className="text-[10.5px] mt-0.5 truncate text-text-muted">Pillar: {manifest.pillar.value || 'Unresolved'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center gap-1.5 mb-1 font-semibold text-text-primary text-[11.5px]"><FileText className="w-3.5 h-3.5 text-brand-gold" /><span>Sources ({manifest.sourcesSelected.length})</span></div>
              {manifest.sourcesSelected.length === 0 ? <p className="text-[11px] text-text-secondary">No task sources attached. Generation relies on Operating Core proof boundaries.</p> : <ul className="space-y-1">{manifest.sourcesSelected.map(s => <li key={s.id} className="flex items-center justify-between gap-2 text-[11px]"><span className="truncate font-medium text-text-primary">{s.title}</span><span className="px-1.5 py-0.5 rounded text-[10px] shrink-0 border border-border-standard bg-surface-inset text-text-secondary">{s.role}{s.excerptCount > 0 ? ` (${s.excerptCount} excerpt${s.excerptCount > 1 ? 's' : ''})` : ''}</span></li>)}</ul>}
            </div>
            <div className="p-2.5 rounded-lg border border-border-standard bg-surface-primary">
              <div className="flex items-center gap-1.5 mb-1 font-semibold text-text-primary text-[11.5px]"><Layers className="w-3.5 h-3.5 text-brand-gold" /><span>Evidence & Claim Boundaries</span></div>
              <p className="text-[11px] leading-relaxed text-text-secondary">{manifest.evidenceSources.length > 0 ? `Evidence grounding: ${manifest.evidenceSources.join(', ')}.` : 'No external evidence source attached. Unverified claims, dates, and commitments remain restricted.'}</p>
            </div>
          </div>

          <details className="rounded-lg border border-border-standard bg-surface-primary">
            <summary className="cursor-pointer px-2.5 py-2 text-[10.5px] font-semibold text-text-secondary">Technical provenance</summary>
            <div className="border-t border-border-standard p-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div><span className="font-semibold text-status-success">Explicit ({manifest.explicitInputs.length})</span><div className="text-text-muted mt-0.5">{manifest.explicitInputs.length > 0 ? manifest.explicitInputs.join(', ') : 'None'}</div></div>
              <div><span className="font-semibold text-status-info">Inherited ({manifest.inheritedInputs.length})</span><div className="text-text-muted mt-0.5">{manifest.inheritedInputs.length > 0 ? manifest.inheritedInputs.join(', ') : 'None'}</div></div>
              <div><span className="font-semibold text-brand-gold">Resolved ({manifest.resolvedInputs.length})</span><div className="text-text-muted mt-0.5">{manifest.resolvedInputs.length > 0 ? manifest.resolvedInputs.join(', ') : 'None'}</div></div>
              <div><span className="font-semibold text-text-muted">Missing ({manifest.unresolvedInputs.length})</span><div className="text-text-muted mt-0.5">{manifest.unresolvedInputs.length > 0 ? manifest.unresolvedInputs.join(', ') : 'None'}</div></div>
            </div>
          </details>

          {manifest.conflictWarnings.length > 0 && <div className="flex items-start gap-2 p-2.5 rounded-lg border border-status-warning/30 bg-status-warning/10 text-status-warning"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><div className="space-y-0.5 text-text-primary">{manifest.conflictWarnings.map((w, idx) => <p key={idx} className="text-[11px] font-medium">{w}</p>)}</div></div>}
        </div>
      )}
    </div>
  );
};

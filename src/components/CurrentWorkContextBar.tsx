import React from 'react';
import { GitBranch, Users, Share2, Database, Layers, ArrowRight, XCircle, ChevronDown } from 'lucide-react';
import type { TaskSourceBinding } from '../lib/contextCompiler';
import { buildWorkContextSnapshot } from '../lib/workflowContinuity';

export { buildWorkContextSnapshot };

export interface CurrentWorkContextBarProps {
  currentStudio: 'Content Workspace' | 'Revision Studio' | 'Reframing Studio' | 'Visual Studio';
  originLabel: string;
  originTitle?: string;
  audience: string;
  channel: string;
  format?: string;
  pillar?: string;
  communicationJob?: string;
  sourceBindings?: TaskSourceBinding[];
  transformationTrail?: Array<{ step: string; studio: string }>;
  onNavigateStudio?: (
    target: 'content-workspace' | 'revision-studio' | 'reframing-studio' | 'visual-studio'
  ) => void;
  onClearWorkContext?: () => void;
}

export const CurrentWorkContextBar: React.FC<CurrentWorkContextBarProps> = ({
  currentStudio,
  originLabel,
  originTitle,
  audience,
  channel,
  format,
  pillar,
  communicationJob,
  sourceBindings = [],
  transformationTrail = [],
  onNavigateStudio,
  onClearWorkContext
}) => {
  const sourceLabel = sourceBindings.length > 0 ? `${sourceBindings.length} source${sourceBindings.length > 1 ? 's' : ''}` : 'Core only';

  return (
    <details
      data-testid="current-work-context-bar"
      className="group bg-surface-primary border border-border-standard rounded-xl mb-3 shadow-level-1"
    >
      <summary className="list-none cursor-pointer px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-surface-inset/45 rounded-xl transition-colors">
        <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-gold shrink-0">
            <GitBranch size={12} /> Current Task
          </span>
          {originTitle && (
            <span data-testid="work-context-title" className="text-[12px] font-semibold text-text-primary truncate max-w-[280px]">
              {originTitle}
            </span>
          )}
          <span data-testid="work-context-audience" className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-surface-inset border border-border-standard text-[10.5px] text-text-secondary">
            {audience || 'General Public'}
          </span>
          <span data-testid="work-context-channel-format" className="hidden md:inline-flex px-2 py-0.5 rounded-md bg-surface-inset border border-border-standard text-[10.5px] text-text-secondary">
            {channel || 'LinkedIn'}{format ? ` / ${format}` : ''}
          </span>
          <span data-testid="work-context-sources" className="hidden lg:inline-flex px-2 py-0.5 rounded-md bg-surface-inset border border-border-standard text-[10.5px] text-text-secondary">
            {sourceLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span data-testid="work-context-stage" className="text-[10.5px] font-semibold text-text-muted hidden sm:inline">{currentStudio}</span>
          <ChevronDown size={13} className="text-text-muted transition-transform group-open:rotate-180" />
        </div>
      </summary>

      <div className="border-t border-border-standard px-3.5 py-3 bg-surface-inset/35 rounded-b-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
          <div className="px-2.5 py-2 rounded-lg bg-surface-primary border border-border-standard">
            <span className="text-text-muted flex items-center gap-1"><GitBranch size={10} className="text-brand-gold" /> Origin</span>
            <div data-testid="work-context-origin" className="font-semibold text-text-primary truncate mt-0.5">{originLabel}</div>
          </div>
          <div className="px-2.5 py-2 rounded-lg bg-surface-primary border border-border-standard">
            <span className="text-text-muted flex items-center gap-1"><Users size={10} className="text-brand-gold" /> Audience</span>
            <div className="font-semibold text-text-primary truncate mt-0.5">{audience || 'General Public'}</div>
          </div>
          <div className="px-2.5 py-2 rounded-lg bg-surface-primary border border-border-standard">
            <span className="text-text-muted flex items-center gap-1"><Share2 size={10} className="text-brand-gold" /> Channel & Format</span>
            <div className="font-semibold text-text-primary truncate mt-0.5">{channel || 'LinkedIn'}{format ? ` / ${format}` : ''}</div>
          </div>
          <div className="px-2.5 py-2 rounded-lg bg-surface-primary border border-border-standard">
            <span className="text-text-muted flex items-center gap-1"><Database size={10} className="text-brand-gold" /> Grounding</span>
            <div className="font-semibold text-text-primary truncate mt-0.5">{sourceLabel}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 text-[11px]">
          <div className="min-w-0 text-text-secondary">
            <span className="font-semibold text-text-primary inline-flex items-center gap-1"><Layers size={10} className="text-brand-gold" /> Job:</span>{' '}
            {communicationJob || 'Build cultural authority'}
            {pillar ? <span className="text-text-muted"> · {pillar}</span> : ''}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {transformationTrail.length > 0 && transformationTrail.map((item, idx) => (
              <React.Fragment key={`${item.studio}-${idx}`}>
                {idx > 0 && <ArrowRight size={9} className="text-text-muted" />}
                <span className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${item.studio === currentStudio ? 'bg-brand-gold/15 border-brand-gold/30 text-brand-gold' : 'bg-surface-primary border-border-standard text-text-muted'}`}>
                  {item.studio}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {(onNavigateStudio || onClearWorkContext) && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border-standard">
            {onNavigateStudio ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10.5px] text-text-muted">Move task to:</span>
                {currentStudio !== 'Content Workspace' && <button type="button" data-testid="continuity-jump-content-workspace" onClick={() => onNavigateStudio('content-workspace')} className="px-2 py-0.5 rounded-md bg-surface-primary border border-border-standard hover:border-brand-gold text-[10.5px] text-text-primary">Content</button>}
                {currentStudio !== 'Revision Studio' && <button type="button" data-testid="continuity-jump-revision-studio" onClick={() => onNavigateStudio('revision-studio')} className="px-2 py-0.5 rounded-md bg-surface-primary border border-border-standard hover:border-brand-gold text-[10.5px] text-text-primary">Revision</button>}
                {currentStudio !== 'Reframing Studio' && <button type="button" data-testid="continuity-jump-reframing-studio" onClick={() => onNavigateStudio('reframing-studio')} className="px-2 py-0.5 rounded-md bg-surface-primary border border-border-standard hover:border-brand-gold text-[10.5px] text-text-primary">Reframe</button>}
                {currentStudio !== 'Visual Studio' && <button type="button" data-testid="continuity-jump-visual-studio" onClick={() => onNavigateStudio('visual-studio')} className="px-2 py-0.5 rounded-md bg-surface-primary border border-border-standard hover:border-brand-gold text-[10.5px] text-text-primary">Visual</button>}
              </div>
            ) : <span />}
            {onClearWorkContext && (
              <button type="button" onClick={onClearWorkContext} className="text-[10.5px] text-text-muted hover:text-status-error inline-flex items-center gap-1">
                <XCircle size={11} /> Reset task context
              </button>
            )}
          </div>
        )}
      </div>
    </details>
  );
};

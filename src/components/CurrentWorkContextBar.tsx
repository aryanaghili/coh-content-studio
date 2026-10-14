import React from 'react';
import { GitBranch, Users, Share2, Database, Layers, ArrowRight, XCircle } from 'lucide-react';
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
  return (
    <div
      data-testid="current-work-context-bar"
      className="bg-surface-primary border border-border-standard rounded-xl p-3.5 mb-4 shadow-xs space-y-2.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-standard pb-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-brand-gold/15 border border-brand-gold/40 text-brand-gold text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
            <GitBranch size={11} />
            Current Work Context
          </span>
          {originTitle && (
            <span
              data-testid="work-context-title"
              className="text-xs font-bold text-text-primary truncate max-w-[320px]"
            >
              {originTitle}
            </span>
          )}
        </div>

        {/* Transformation Stage Trail */}
        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
          {transformationTrail.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ArrowRight size={10} className="text-text-muted" />}
              <span
                className={`px-2 py-0.5 rounded border font-semibold ${
                  item.studio === currentStudio
                    ? 'bg-slate-900 text-white dark:bg-brand-gold dark:text-text-inverse border-transparent'
                    : 'bg-surface-inset text-text-secondary border-border-standard'
                }`}
              >
                {item.studio}
              </span>
            </React.Fragment>
          ))}
          {onClearWorkContext && (
            <button
              type="button"
              onClick={onClearWorkContext}
              className="ml-2 text-[10px] text-text-muted hover:text-status-error inline-flex items-center gap-1"
              title="Reset work item lineage"
            >
              <XCircle size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 5 Continuity Dimensions */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
        <div className="p-2 rounded-lg bg-surface-inset border border-border-standard">
          <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
            <GitBranch size={10} className="text-brand-gold" /> Origin
          </span>
          <div data-testid="work-context-origin" className="font-semibold text-text-primary truncate mt-0.5">
            {originLabel}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-inset border border-border-standard">
          <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
            <Users size={10} className="text-brand-gold" /> Target Audience
          </span>
          <div data-testid="work-context-audience" className="font-semibold text-text-primary truncate mt-0.5">
            {audience || 'General Public'}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-inset border border-border-standard">
          <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
            <Share2 size={10} className="text-brand-gold" /> Channel & Format
          </span>
          <div data-testid="work-context-channel-format" className="font-semibold text-text-primary truncate mt-0.5">
            {channel || 'LinkedIn'} {format ? `/ ${format}` : ''}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-inset border border-border-standard">
          <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
            <Database size={10} className="text-brand-gold" /> Attached Sources
          </span>
          <div data-testid="work-context-sources" className="font-semibold text-text-primary truncate mt-0.5">
            {sourceBindings.length > 0
              ? `${sourceBindings.length} source(s) (${sourceBindings.map(s => s.role || s.type).join(', ')})`
              : 'Operating Core only'}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-surface-inset border border-border-standard">
          <span className="text-[9px] uppercase font-bold text-text-secondary flex items-center gap-1">
            <Layers size={10} className="text-brand-gold" /> Stage & Job
          </span>
          <div
            data-testid="work-context-stage"
            className="font-semibold text-text-primary truncate mt-0.5"
            title={communicationJob || pillar}
          >
            {currentStudio}
          </div>
        </div>
      </div>

      {/* Cross-Studio Continuity Quick Handoff Bar */}
      {onNavigateStudio && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
          <span className="text-text-muted">
            <strong>Communication Job:</strong> {communicationJob || 'Build cultural authority'}{' '}
            {pillar ? `| Pillar: ${pillar}` : ''}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-text-secondary font-semibold">Continue in:</span>
            {currentStudio !== 'Content Workspace' && (
              <button
                type="button"
                data-testid="continuity-jump-content-workspace"
                onClick={() => onNavigateStudio('content-workspace')}
                className="px-2 py-0.5 rounded bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-semibold"
              >
                Content Workspace
              </button>
            )}
            {currentStudio !== 'Revision Studio' && (
              <button
                type="button"
                data-testid="continuity-jump-revision-studio"
                onClick={() => onNavigateStudio('revision-studio')}
                className="px-2 py-0.5 rounded bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-semibold"
              >
                Revision Studio
              </button>
            )}
            {currentStudio !== 'Reframing Studio' && (
              <button
                type="button"
                data-testid="continuity-jump-reframing-studio"
                onClick={() => onNavigateStudio('reframing-studio')}
                className="px-2 py-0.5 rounded bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-semibold"
              >
                Reframing Studio
              </button>
            )}
            {currentStudio !== 'Visual Studio' && (
              <button
                type="button"
                data-testid="continuity-jump-visual-studio"
                onClick={() => onNavigateStudio('visual-studio')}
                className="px-2 py-0.5 rounded bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-semibold"
              >
                Visual Studio
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

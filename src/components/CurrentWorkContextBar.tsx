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
      className="bg-surface-primary border border-border-standard rounded-xl px-4 py-3 mb-3 shadow-level-1 space-y-2"
    >
      {/* Top Row: Title + Stage Trail + Quick Handoffs */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-standard">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-brand-gold/15 border border-brand-gold/30 text-brand-gold text-[10px] font-semibold tracking-wide flex items-center gap-1 shrink-0">
            <GitBranch size={11} />
            Work Context
          </span>
          {originTitle && (
            <span
              data-testid="work-context-title"
              className="text-[12.5px] font-semibold text-text-primary truncate max-w-[360px]"
            >
              {originTitle}
            </span>
          )}
        </div>

        {/* Transformation Stage Trail */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          {transformationTrail.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ArrowRight size={10} className="text-text-muted" />}
              <span
                className={`px-2 py-0.5 rounded-md border font-medium ${
                  item.studio === currentStudio
                    ? 'bg-brand-gold text-text-inverse border-brand-gold font-semibold'
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
              className="ml-1.5 text-[11px] text-text-muted hover:text-status-error inline-flex items-center gap-1 cursor-pointer"
              title="Reset work item lineage"
            >
              <XCircle size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 5 Continuity Dimensions — Compact Horizontal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[11.5px]">
        <div className="px-2.5 py-1.5 rounded-lg bg-surface-inset/70 border border-border-standard">
          <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
            <GitBranch size={10} className="text-brand-gold" /> Origin
          </span>
          <div data-testid="work-context-origin" className="font-semibold text-text-primary truncate">
            {originLabel}
          </div>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-surface-inset/70 border border-border-standard">
          <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
            <Users size={10} className="text-brand-gold" /> Audience
          </span>
          <div data-testid="work-context-audience" className="font-semibold text-text-primary truncate">
            {audience || 'General Public'}
          </div>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-surface-inset/70 border border-border-standard">
          <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
            <Share2 size={10} className="text-brand-gold" /> Channel & Format
          </span>
          <div data-testid="work-context-channel-format" className="font-semibold text-text-primary truncate">
            {channel || 'LinkedIn'} {format ? `/ ${format}` : ''}
          </div>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-surface-inset/70 border border-border-standard">
          <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
            <Database size={10} className="text-brand-gold" /> Sources
          </span>
          <div data-testid="work-context-sources" className="font-semibold text-text-primary truncate">
            {sourceBindings.length > 0
              ? `${sourceBindings.length} source(s) (${sourceBindings.map(s => s.role || s.type).join(', ')})`
              : 'Operating Core only'}
          </div>
        </div>

        <div className="px-2.5 py-1.5 rounded-lg bg-surface-inset/70 border border-border-standard col-span-2 sm:col-span-1">
          <span className="text-[10px] font-medium text-text-muted flex items-center gap-1">
            <Layers size={10} className="text-brand-gold" /> Stage & Job
          </span>
          <div
            data-testid="work-context-stage"
            className="font-semibold text-text-primary truncate"
            title={communicationJob || pillar}
          >
            {currentStudio}
          </div>
        </div>
      </div>

      {/* Cross-Studio Continuity Quick Handoff Bar */}
      {onNavigateStudio && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[11px]">
          <span className="text-text-secondary truncate">
            <strong className="font-semibold text-text-primary">Job:</strong> {communicationJob || 'Build cultural authority'}{' '}
            {pillar ? <span className="text-text-muted">| {pillar}</span> : ''}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-text-muted font-medium">Continue in:</span>
            {currentStudio !== 'Content Workspace' && (
              <button
                type="button"
                data-testid="continuity-jump-content-workspace"
                onClick={() => onNavigateStudio('content-workspace')}
                className="px-2.5 py-0.5 rounded-md bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-medium transition-colors cursor-pointer"
              >
                Content Workspace
              </button>
            )}
            {currentStudio !== 'Revision Studio' && (
              <button
                type="button"
                data-testid="continuity-jump-revision-studio"
                onClick={() => onNavigateStudio('revision-studio')}
                className="px-2.5 py-0.5 rounded-md bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-medium transition-colors cursor-pointer"
              >
                Revision Studio
              </button>
            )}
            {currentStudio !== 'Reframing Studio' && (
              <button
                type="button"
                data-testid="continuity-jump-reframing-studio"
                onClick={() => onNavigateStudio('reframing-studio')}
                className="px-2.5 py-0.5 rounded-md bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-medium transition-colors cursor-pointer"
              >
                Reframing Studio
              </button>
            )}
            {currentStudio !== 'Visual Studio' && (
              <button
                type="button"
                data-testid="continuity-jump-visual-studio"
                onClick={() => onNavigateStudio('visual-studio')}
                className="px-2.5 py-0.5 rounded-md bg-surface-inset border border-border-standard hover:border-brand-gold text-text-primary font-medium transition-colors cursor-pointer"
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

import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Lightbulb,
  PenTool,
  Image as ImageIcon,
  Plus,
  Check,
  ShieldAlert,
  Quote,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { SourceTaskRole } from '../lib/contextCompiler';
import {
  ALL_SOURCE_TASK_ROLES,
  SOURCE_ROLE_DESCRIPTIONS,
  SOURCE_INTELLIGENCE_DISCLAIMER,
  validateExactSourceExcerpt,
  extractVerbatimSentences,
  type SourceIntelligenceAnalysis,
  type SourceRecordLike
} from '../lib/sourceIntelligence';

export interface SourceIntelligenceCardAddonProps {
  source: SourceRecordLike;
  analysis?: SourceIntelligenceAnalysis | null;
  isAnalyzing: boolean;
  analysisError?: string | null;
  isSelectedInTask: boolean;
  activeTaskRole: SourceTaskRole;
  selectedExcerpts: string[];
  onAnalyzeSource: (source: SourceRecordLike, forceLocalFallback?: boolean) => void;
  onChangeTaskRole: (sourceId: string, role: SourceTaskRole) => void;
  onToggleExcerpt: (sourceId: string, excerpt: string) => void;
  onAddToCurrentBrief: (source: SourceRecordLike) => void;
  onUseInIdeation: (source: SourceRecordLike, analysis?: SourceIntelligenceAnalysis | null) => void;
  onCreateContent: (source: SourceRecordLike, analysis?: SourceIntelligenceAnalysis | null) => void;
  onUseAsVisualReference: (source: SourceRecordLike, analysis?: SourceIntelligenceAnalysis | null) => void;
  onUseInReframing?: (source: SourceRecordLike, analysis?: SourceIntelligenceAnalysis | null) => void;
}

export const SourceIntelligenceCardAddon: React.FC<SourceIntelligenceCardAddonProps> = ({
  source,
  analysis,
  isAnalyzing,
  analysisError,
  isSelectedInTask,
  activeTaskRole,
  selectedExcerpts,
  onAnalyzeSource,
  onChangeTaskRole,
  onToggleExcerpt,
  onAddToCurrentBrief,
  onUseInIdeation,
  onCreateContent,
  onUseAsVisualReference,
  onUseInReframing
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(Boolean(analysis || isAnalyzing || analysisError));
  const [showExcerptPicker, setShowExcerptPicker] = useState<boolean>(false);
  const [manualExcerptInput, setManualExcerptInput] = useState<string>('');
  const [manualExcerptError, setManualExcerptError] = useState<string>('');

  const candidateExcerpts = React.useMemo(() => {
    const fromAnalysis = analysis?.usefulExcerpts || [];
    const fallback = extractVerbatimSentences(`${source.content || ''}\n${source.notes || ''}`, 4);
    const merged = [...fromAnalysis];
    for (const item of fallback) {
      if (!merged.includes(item)) merged.push(item);
    }
    for (const sel of selectedExcerpts) {
      if (!merged.includes(sel)) merged.push(sel);
    }
    return merged;
  }, [analysis, source.content, source.notes, selectedExcerpts]);

  const handleAddManualExcerpt = () => {
    const check = validateExactSourceExcerpt(source, manualExcerptInput);
    if (!check.valid) {
      setManualExcerptError(check.reason || 'Excerpt must match exact text in the source.');
      return;
    }
    setManualExcerptError('');
    if (!selectedExcerpts.includes(check.normalizedExcerpt)) {
      onToggleExcerpt(source.id, check.normalizedExcerpt);
    }
    setManualExcerptInput('');
  };

  return (
    <div
      className="mt-3 pt-3 border-t border-border-standard space-y-3"
      data-testid={`source-intelligence-addon-${source.id}`}
    >
      {/* Direct Studio Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={isAnalyzing}
            onClick={() => {
              setIsExpanded(true);
              onAnalyzeSource(source, false);
            }}
            data-testid={`analyze-source-btn-${source.id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-slate-900 text-white hover:bg-brand-gold-hover transition disabled:opacity-50 cursor-pointer"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={12} className="animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : analysis ? (
              <>
                <RefreshCw size={12} />
                <span>Regenerate Analysis</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>Analyze Source</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onAddToCurrentBrief(source)}
            data-testid={`add-to-brief-btn-${source.id}`}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold border transition cursor-pointer ${
              isSelectedInTask
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-surface-primary border-border-standard text-text-primary hover:border-brand-gold'
            }`}
          >
            {isSelectedInTask ? <Check size={12} /> : <Plus size={12} />}
            <span>{isSelectedInTask ? 'In Current Brief' : 'Add to Current Brief'}</span>
          </button>

          <button
            type="button"
            onClick={() => onUseInIdeation(source, analysis)}
            data-testid={`use-in-ideation-btn-${source.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-surface-primary border border-border-standard text-text-primary hover:border-brand-gold transition cursor-pointer"
          >
            <Lightbulb size={12} />
            <span>Use in Ideation</span>
          </button>

          <button
            type="button"
            onClick={() => onCreateContent(source, analysis)}
            data-testid={`create-content-btn-${source.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-surface-primary border border-border-standard text-text-primary hover:border-brand-gold transition cursor-pointer"
          >
            <PenTool size={12} />
            <span>Create Content</span>
          </button>

          {onUseInReframing && (
            <button
              type="button"
              onClick={() => onUseInReframing(source, analysis)}
              data-testid={`use-in-reframing-btn-${source.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-surface-primary border border-border-standard text-text-primary hover:border-brand-gold transition cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>Use in Reframing</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onUseAsVisualReference(source, analysis)}
            data-testid={`use-visual-ref-btn-${source.id}`}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold bg-surface-primary border border-border-standard text-text-primary hover:border-brand-gold transition cursor-pointer"
          >
            <ImageIcon size={12} />
            <span>Use as Visual Reference</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          data-testid={`toggle-intelligence-panel-${source.id}`}
          className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary cursor-pointer"
        >
          <span>{analysis ? 'Source Intelligence Ready' : 'Source Intelligence'}</span>
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Task-Level Role & Excerpt Controls */}
      <div className="bg-surface-primary border border-border-standard rounded-lg p-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">
              Task Context Role:
            </span>
            <select
              value={activeTaskRole}
              onChange={(e) => onChangeTaskRole(source.id, e.target.value as SourceTaskRole)}
              data-testid={`source-role-select-${source.id}`}
              aria-label={`Task role for ${source.title}`}
              className="bg-surface-inset border border-border-standard rounded px-2 py-1 text-[11px] font-semibold text-text-primary"
            >
              {ALL_SOURCE_TASK_ROLES.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {isSelectedInTask && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold font-semibold">
                Active in Task ({selectedExcerpts.length > 0 ? `${selectedExcerpts.length} exact excerpt(s)` : 'Bounded source grounding'})
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowExcerptPicker(prev => !prev)}
            data-testid={`toggle-excerpt-picker-${source.id}`}
            className="text-[10px] font-semibold text-brand-gold hover:underline self-start sm:self-auto cursor-pointer"
          >
            {showExcerptPicker
              ? 'Hide Excerpt Selector'
              : `Select Verbatim Excerpts (${selectedExcerpts.length} selected)`}
          </button>
        </div>

        <p className="text-[10px] text-text-secondary">
          {SOURCE_ROLE_DESCRIPTIONS[activeTaskRole]}
        </p>

        {showExcerptPicker && (
          <div
            className="pt-2 border-t border-border-standard space-y-2.5"
            data-testid={`excerpt-picker-panel-${source.id}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                <Quote size={11} /> Verbatim Excerpts from Raw Source
              </span>
              <span className="text-[10px] text-text-muted">
                Exact source wording only (never AI paraphrased)
              </span>
            </div>

            {candidateExcerpts.length > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {candidateExcerpts.map((excerpt, idx) => {
                  const checked = selectedExcerpts.includes(excerpt);
                  return (
                    <label
                      key={idx}
                      className={`flex items-start gap-2 p-2 rounded border text-[11px] cursor-pointer transition ${
                        checked
                          ? 'bg-brand-gold/10 border-brand-gold text-text-primary'
                          : 'bg-surface-inset border-border-standard text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleExcerpt(source.id, excerpt)}
                        className="mt-0.5 rounded border-brand-gold/50 text-brand-gold"
                      />
                      <span className="font-mono text-[10px] leading-relaxed">"{excerpt}"</span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-text-muted italic">
                No automatic excerpts extracted yet. Paste an exact phrase from the source below.
              </p>
            )}

            <div className="space-y-1">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={manualExcerptInput}
                  onChange={(e) => {
                    setManualExcerptInput(e.target.value);
                    if (manualExcerptError) setManualExcerptError('');
                  }}
                  placeholder="Paste exact verbatim phrase from raw source..."
                  data-testid={`manual-excerpt-input-${source.id}`}
                  className="flex-1 bg-surface-inset border border-border-standard rounded px-2 py-1 text-[11px] text-text-primary font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddManualExcerpt}
                  data-testid={`add-manual-excerpt-btn-${source.id}`}
                  className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold hover:bg-brand-gold-hover transition cursor-pointer"
                >
                  Pin Excerpt
                </button>
              </div>
              {manualExcerptError && (
                <p className="text-[10px] text-red-600 dark:text-red-400 font-medium">
                  {manualExcerptError}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Source Intelligence Panel */}
      {isExpanded && (
        <div
          className="bg-surface-primary border border-border-standard rounded-lg p-4 space-y-3"
          data-testid={`source-intelligence-panel-${source.id}`}
        >
          {/* Mandatory Evidence vs Interpretation Banner */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border-standard">
            <div className="flex items-center gap-1.5">
              <Sparkles size={13} className="text-brand-gold shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary">
                Source Intelligence
              </span>
              {analysis && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-surface-inset border border-border-standard font-mono text-text-secondary">
                  {analysis.analysisMode === 'ai' ? 'AI Verified' : 'Governed Local Analysis'}
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300"
              data-testid={`source-intelligence-disclaimer-${source.id}`}
            >
              {SOURCE_INTELLIGENCE_DISCLAIMER}
            </span>
          </div>

          {isAnalyzing && (
            <div
              className="py-6 text-center space-y-2"
              data-testid={`source-intelligence-loading-${source.id}`}
            >
              <RefreshCw size={18} className="animate-spin text-brand-gold mx-auto" />
              <p className="text-xs font-semibold text-text-primary">
                Analyzing source under COH claim discipline...
              </p>
              <p className="text-[11px] text-text-secondary">
                Separating traceable facts, supported claims, strategic context, and cautions without modifying raw source text.
              </p>
            </div>
          )}

          {!isAnalyzing && analysisError && (
            <div
              className="p-3 rounded border border-red-500/30 bg-red-500/10 space-y-2"
              data-testid={`source-intelligence-error-${source.id}`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-300">
                <AlertTriangle size={14} />
                <span>Source analysis encountered an error: {analysisError}</span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Raw source content remains intact and accessible. You can retry or generate a governed local analysis.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAnalyzeSource(source, false)}
                  className="px-2.5 py-1 rounded bg-slate-900 text-white text-[10px] font-semibold hover:bg-brand-gold-hover transition cursor-pointer"
                >
                  Retry Analysis
                </button>
                <button
                  type="button"
                  onClick={() => onAnalyzeSource(source, true)}
                  data-testid={`fallback-analyze-btn-${source.id}`}
                  className="px-2.5 py-1 rounded bg-surface-inset border border-border-standard text-text-primary text-[10px] font-semibold hover:border-brand-gold transition cursor-pointer"
                >
                  Use Governed Local Analysis
                </button>
              </div>
            </div>
          )}

          {!isAnalyzing && !analysis && !analysisError && (
            <div
              className="py-4 text-center space-y-2"
              data-testid={`source-intelligence-empty-${source.id}`}
            >
              <FileText size={18} className="text-text-muted mx-auto" />
              <p className="text-xs text-text-secondary">
                No derived analysis generated yet for this source.
              </p>
              <button
                type="button"
                onClick={() => onAnalyzeSource(source, false)}
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-[11px] font-semibold hover:bg-brand-gold-hover transition cursor-pointer"
              >
                Analyze Source
              </button>
            </div>
          )}

          {!isAnalyzing && analysis && (
            <div className="space-y-3 text-xs">
              {/* Strategic Context */}
              <div className="bg-surface-inset p-2.5 rounded border border-border-standard">
                <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                  Strategic Context
                </div>
                <p className="text-[11px] text-text-primary leading-relaxed">
                  {analysis.strategicContext}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Key Facts */}
                <div className="bg-surface-inset p-2.5 rounded border border-border-standard">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1">
                    <CheckCircle2 size={11} className="text-emerald-600" /> Key Facts (Traceable to Source)
                  </div>
                  {analysis.keyFacts.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-text-primary">
                      {analysis.keyFacts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-text-muted italic">
                      {source.type === 'Approved Example'
                        ? 'Approved Example: used for tone/structure only, not factual claims.'
                        : source.type === 'Visual Reference'
                          ? 'Visual Reference: used for visual direction only, not factual claims.'
                          : 'No standalone verifiable facts extracted.'}
                    </p>
                  )}
                </div>

                {/* Supported Claims */}
                <div className="bg-surface-inset p-2.5 rounded border border-border-standard">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Supported Claims
                  </div>
                  {analysis.supportedClaims.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-text-primary">
                      {analysis.supportedClaims.map((claim, idx) => (
                        <li key={idx}>{claim}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-text-muted italic">
                      No direct factual claims authorized from this source type.
                    </p>
                  )}
                </div>
              </div>

              {/* Cautions / Ambiguities */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1">
                  <ShieldAlert size={11} /> Cautions and Ambiguities
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-text-primary">
                  {analysis.cautionsAndAmbiguities.map((caution, idx) => (
                    <li key={idx}>{caution}</li>
                  ))}
                </ul>
              </div>

              {/* Useful Excerpts */}
              {analysis.usefulExcerpts.length > 0 && (
                <div className="bg-surface-inset p-2.5 rounded border border-border-standard">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1.5 flex items-center justify-between">
                    <span>Useful Verbatim Excerpts (Click to use in task)</span>
                    <span className="text-[9px] font-normal text-text-muted">Exact source text</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysis.usefulExcerpts.map((ex, idx) => {
                      const isPinned = selectedExcerpts.includes(ex);
                      return (
                        <div
                          key={idx}
                          onClick={() => onToggleExcerpt(source.id, ex)}
                          className={`p-2 rounded border text-[11px] font-mono cursor-pointer flex items-start justify-between gap-2 transition ${
                            isPinned
                              ? 'bg-brand-gold/15 border-brand-gold text-text-primary'
                              : 'bg-surface-primary border-border-standard text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <span>"{ex}"</span>
                          <span className="text-[9px] font-sans font-bold uppercase px-1.5 py-0.5 rounded shrink-0 bg-surface-inset border border-border-standard">
                            {isPinned ? 'Selected' : 'Use Excerpt'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Relevant Audiences, Channels, Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="bg-surface-inset p-2 rounded border border-border-standard">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Relevant COH Audiences
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.relevantAudiences.map((aud, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-primary border border-border-standard text-text-primary"
                      >
                        {aud}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-inset p-2 rounded border border-border-standard">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Relevant Channels
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.relevantChannels.map((ch, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-primary border border-border-standard text-text-primary"
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-surface-inset p-2 rounded border border-border-standard">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Relevant Content Pillars
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {analysis.relevantPillars.map((pil, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-surface-primary border border-border-standard text-text-primary"
                      >
                        {pil}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Opportunity Hints */}
              {analysis.contentOpportunityHints.length > 0 && (
                <div className="bg-surface-inset p-2.5 rounded border border-border-standard">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">
                    Content Opportunity Hints
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-text-primary">
                    {analysis.contentOpportunityHints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

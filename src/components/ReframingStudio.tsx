import React, { useState, useEffect } from 'react';
import {
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  BookmarkPlus,
  Send,
  RotateCcw,
  RefreshCw,
  FileText,
  Layers
} from 'lucide-react';
import {
  resolveReframeIntent,
  buildDeterministicReframe,
  finalizeReframeResult,
  buildReframeLineageMetadata,
  DEFAULT_PROTECTED_ELEMENTS,
  type ReframeOriginType,
  type AudienceFamiliarityLevel,
  type ResolvedReframePlan,
  type ReframeOutputResult,
  type ReframeLineageMetadata
} from '../lib/reframingEngine';
import {
  COH_COMMUNICATION_JOBS,
  COH_VALID_AUDIENCES,
  COH_CONTENT_PILLARS
} from '../lib/ideationIntelligence';
import {
  compileGovernedContext,
  inferDefaultSourceRole,
  type TaskSourceBinding,
  type SourceTaskRole
} from '../lib/contextCompiler';
import { ALL_SOURCE_TASK_ROLES, type SourceIntelligenceAnalysis } from '../lib/sourceIntelligence';
import type { OperatingCore } from '../lib/operatingCore';
import type { CoreDocument } from '../lib/coreDocumentsStorage';
import { ContextManifestPanel } from './ContextManifestPanel';

export interface ReframingStudioProps {
  operatingCore: OperatingCore;
  operatingCoreDocs: CoreDocument[];
  sources: Array<{
    id: string;
    title: string;
    type: string;
    notes?: string;
    content?: string;
    url?: string;
    selectable?: boolean;
  }>;
  savedContent: Array<{
    id: string;
    title: string;
    text: string;
    channel: string;
    audience: string;
    pillar: string;
    outputFormat?: string;
    language?: string;
  }>;
  workspaceDraftText: string;
  workspaceTitle: string;
  revisionDraftText: string;
  revisionTitle: string;
  selectedSourceIds: string[];
  taskSourceRoleMap: Record<string, { role: SourceTaskRole; selectedExcerpts: string[] }>;
  sourceIntelligenceMap: Record<string, SourceIntelligenceAnalysis>;
  initialOrigin?: {
    originType: ReframeOriginType;
    originId?: string;
    originTitle?: string;
    sourceContent: string;
    originChannel?: string;
    originAudience?: string;
    suggestedIntent?: string;
  } | null;
  onChangeSourceTaskRole: (sourceId: string, role: SourceTaskRole) => void;
  onToggleAttachedSource: (sourceId: string) => void;
  onHandoffToRevisionStudio: (params: {
    sourceText: string;
    title: string;
    suggestedActionId?: string;
    instructionNote: string;
  }) => void;
  onSendReframeToWorkspace: (params: {
    reframedText: string;
    title: string;
    plan: ResolvedReframePlan;
    lineage: ReframeLineageMetadata;
  }) => void;
  onSaveReframeToLibrary: (params: {
    reframedText: string;
    title: string;
    plan: ResolvedReframePlan;
    lineage: ReframeLineageMetadata;
  }) => void;
}

const FAMILIARITY_OPTIONS: AudienceFamiliarityLevel[] = [
  'Low Familiarity (Needs foundational COH context)',
  'Informed Cultural / Industry Familiarity',
  'Deep COH / Partner Familiarity'
];

const CHANNEL_OPTIONS = [
  'LinkedIn',
  'Instagram',
  'Newsletter',
  'Website',
  'Press / Media',
  'Email / Direct Outreach'
];

const FORMAT_OPTIONS = [
  'Post',
  'Thought Piece',
  'Institutional Brief / Post',
  'Carousel',
  'Caption',
  'Newsletter Section',
  'Press Narrative Paragraph',
  'Institutional Pitch Note'
];

export const ReframingStudio: React.FC<ReframingStudioProps> = ({
  operatingCore,
  operatingCoreDocs,
  sources,
  savedContent,
  workspaceDraftText,
  workspaceTitle,
  revisionDraftText,
  revisionTitle,
  selectedSourceIds,
  taskSourceRoleMap,
  sourceIntelligenceMap,
  initialOrigin,
  onChangeSourceTaskRole,
  onToggleAttachedSource,
  onHandoffToRevisionStudio,
  onSendReframeToWorkspace,
  onSaveReframeToLibrary
}) => {
  const [originType, setOriginType] = useState<ReframeOriginType>(
    initialOrigin?.originType || 'Manual Input'
  );
  const [originId, setOriginId] = useState<string | undefined>(initialOrigin?.originId);
  const [originTitle, setOriginTitle] = useState<string>(
    initialOrigin?.originTitle || 'Source Material for Reframing'
  );
  const [originChannel, setOriginChannel] = useState<string>(
    initialOrigin?.originChannel || 'Website'
  );
  const [originAudience, setOriginAudience] = useState<string>(
    initialOrigin?.originAudience || 'General Public'
  );
  const [sourceContent, setSourceContent] = useState<string>(
    initialOrigin?.sourceContent || ''
  );
  const [rawIntent, setRawIntent] = useState<string>(
    initialOrigin?.suggestedIntent || ''
  );

  const [resolvedPlan, setResolvedPlan] = useState<ResolvedReframePlan | null>(null);
  const [reframeResult, setReframeResult] = useState<ReframeOutputResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  // Sync incoming handoff from other studios without overwriting if empty
  useEffect(() => {
    if (initialOrigin && initialOrigin.sourceContent) {
      setOriginType(initialOrigin.originType);
      setOriginId(initialOrigin.originId);
      setOriginTitle(initialOrigin.originTitle || 'Imported Content');
      setOriginChannel(initialOrigin.originChannel || 'Website');
      setOriginAudience(initialOrigin.originAudience || 'General Public');
      setSourceContent(initialOrigin.sourceContent);
      if (initialOrigin.suggestedIntent) {
        setRawIntent(initialOrigin.suggestedIntent);
      }
      setReframeResult(null);
      setGenerationError(null);
    }
  }, [initialOrigin]);

  const activeSourceBindings: TaskSourceBinding[] = selectedSourceIds
    .map(id => {
      const s = sources.find(x => x.id === id);
      if (!s) return null;
      return {
        sourceId: s.id,
        title: s.title || 'Untitled Source',
        type: s.type || 'Other',
        role: taskSourceRoleMap[s.id]?.role || inferDefaultSourceRole(s.type),
        selectedExcerpts: taskSourceRoleMap[s.id]?.selectedExcerpts || [],
        content: s.content || s.notes || s.url || '',
        summary: s.notes || undefined
      } as TaskSourceBinding;
    })
    .filter((b): b is TaskSourceBinding => Boolean(b));

  const contextPackage = compileGovernedContext({
    workflow: 'Reframing Studio',
    operatingCore,
    coreDocuments: operatingCoreDocs,
    audience: resolvedPlan?.targetAudience || originAudience,
    channel: resolvedPlan?.targetChannel || originChannel,
    format: resolvedPlan?.targetFormat || 'Post',
    pillar: resolvedPlan?.contentPillarEmphasis || 'The Opera & Worldbuilding',
    communicationJob: resolvedPlan?.communicationPurpose || 'Establish institutional credibility',
    sourceBindings: activeSourceBindings,
    derivedSourceAnalyses: sourceIntelligenceMap,
    userInstruction: rawIntent
  });

  const handleSelectOriginSource = (type: ReframeOriginType) => {
    setOriginType(type);
    setGenerationError(null);
    if (type === 'Content Workspace' && workspaceDraftText.trim()) {
      setSourceContent(workspaceDraftText);
      setOriginTitle(workspaceTitle || 'Current Content Workspace Draft');
      setOriginId('workspace-current');
    } else if (type === 'Revision Studio' && revisionDraftText.trim()) {
      setSourceContent(revisionDraftText);
      setOriginTitle(revisionTitle || 'Current Revision Studio Output');
      setOriginId('revision-current');
    }
  };

  const handleLoadFromContentLibrary = (itemId: string) => {
    const item = savedContent.find(c => c.id === itemId);
    if (!item) return;
    setOriginType('Content Library');
    setOriginId(item.id);
    setOriginTitle(item.title);
    setOriginChannel(item.channel || 'LinkedIn');
    setOriginAudience(item.audience || 'General Public');
    setSourceContent(item.text);
    setReframeResult(null);
    setGenerationError(null);
  };

  const handleResolveIntent = () => {
    if (!rawIntent.trim() || !sourceContent.trim()) return;
    const plan = resolveReframeIntent({
      rawIntent,
      sourceContent,
      originChannel,
      originAudience,
      sourceBindings: activeSourceBindings,
      derivedSourceAnalyses: sourceIntelligenceMap
    });
    setResolvedPlan(plan);
    setGenerationError(null);
  };

  const handleUpdatePlanField = <K extends keyof ResolvedReframePlan>(
    field: K,
    value: ResolvedReframePlan[K]
  ) => {
    setResolvedPlan(prev => (prev ? { ...prev, [field]: value } : null));
  };

  const handleToggleProtectedElement = (elem: string) => {
    if (!resolvedPlan) return;
    const exists = resolvedPlan.protectedElements.includes(elem);
    const updated = exists
      ? resolvedPlan.protectedElements.filter(e => e !== elem)
      : [...resolvedPlan.protectedElements, elem];
    handleUpdatePlanField('protectedElements', updated);
  };

  const handleGenerateReframe = async (options?: { forceDeterministic?: boolean; simulateFailure?: boolean }) => {
    if (!sourceContent.trim()) return;
    const activePlan =
      resolvedPlan ||
      resolveReframeIntent({
        rawIntent: rawIntent || 'Reframe this content for institutional relevance',
        sourceContent,
        originChannel,
        originAudience,
        sourceBindings: activeSourceBindings,
        derivedSourceAnalyses: sourceIntelligenceMap
      });
    if (!resolvedPlan) {
      setResolvedPlan(activePlan);
    }

    setIsGenerating(true);
    setGenerationError(null);

    if (options?.simulateFailure) {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationError(
          'AI Provider connection error during reframing. Your source content and resolved transformation plan have been preserved.'
        );
      }, 200);
      return;
    }

    if (!options?.forceDeterministic) {
      try {
        const res = await fetch('/api/ai/reframe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawIntent: activePlan.rawIntent,
            sourceContent,
            targetAudience: activePlan.targetAudience,
            audienceFamiliarity: activePlan.audienceFamiliarity,
            communicationPurpose: activePlan.communicationPurpose,
            targetChannel: activePlan.targetChannel,
            targetFormat: activePlan.targetFormat,
            strategicFrame: activePlan.strategicFrame,
            contentPillarEmphasis: activePlan.contentPillarEmphasis,
            narrativePerspective: activePlan.narrativePerspective,
            evidenceEmphasis: activePlan.evidenceEmphasis,
            desiredAudienceResponse: activePlan.desiredAudienceResponse,
            protectedElements: activePlan.protectedElements,
            operatingCoreInstructions: contextPackage.compiledInstructions
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.data && data.data.reframedCopy) {
            const finalized = finalizeReframeResult({
              sourceContent,
              rawReframedCopy: data.data.reframedCopy,
              plan: activePlan,
              sourceBindings: activeSourceBindings,
              aiChanged: data.data.changedExplanation,
              aiPreserved: data.data.preservedExplanation,
              aiWarnings: data.data.evidenceWarnings
            });
            setReframeResult(finalized);
            setIsGenerating(false);
            return;
          }
        }
      } catch {
        // Fall through to deterministic COH reframing engine
      }
    }

    // Deterministic COH Reframe execution (guarantees every visible plan field governs output)
    const deterministicResult = buildDeterministicReframe({
      sourceContent,
      plan: activePlan,
      sourceBindings: activeSourceBindings,
      derivedSourceAnalyses: sourceIntelligenceMap
    });
    setReframeResult(deterministicResult);
    setIsGenerating(false);
  };

  const handleResetAll = () => {
    setSourceContent('');
    setRawIntent('');
    setResolvedPlan(null);
    setReframeResult(null);
    setGenerationError(null);
    setOriginType('Manual Input');
    setOriginId(undefined);
    setOriginTitle('Source Material for Reframing');
  };

  const handleStartNewReframeKeepSource = () => {
    setRawIntent('');
    setResolvedPlan(null);
    setReframeResult(null);
    setGenerationError(null);
  };

  return (
    <div className="page-shell space-y-6" data-testid="reframing-studio-root">
      {/* Studio Header & Distinction Banner */}
      <div className="bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass size={22} className="text-brand-gold" />
              <h2 className="font-sans text-2xl font-bold text-text-primary">Reframing Studio</h2>
            </div>
            <p className="font-sans text-[14px] text-text-secondary mt-1">
              Change what the content is trying to become while preserving factual integrity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="start-new-reframe-btn"
              onClick={handleStartNewReframeKeepSource}
              className="px-3 py-1.5 rounded-lg border border-border-standard bg-surface-inset text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              Start New Reframe
            </button>
            <button
              type="button"
              data-testid="reframe-reset-btn"
              onClick={handleResetAll}
              className="px-3 py-1.5 rounded-lg border border-border-standard bg-surface-inset text-xs font-semibold text-status-error hover:bg-status-error/10 transition-colors inline-flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              Clear / Reset
            </button>
          </div>
        </div>

        {/* Distinction Callout */}
        <div className="mt-4 p-3 rounded-xl bg-surface-inset border border-border-standard grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
          <div>
            <span className="font-bold text-brand-gold uppercase tracking-wider text-[10px] block">
              When to use Reframing Studio (Here)
            </span>
            <span className="text-text-secondary">
              Shift an existing piece to a new audience, familiarity level, strategic frame, or channel architecture while locking confirmed facts and quotes.
            </span>
          </div>
          <div>
            <span className="font-bold text-text-primary uppercase tracking-wider text-[10px] block">
              When to use Revision Studio Instead
            </span>
            <span className="text-text-secondary">
              Keep the same communication job and improve clarity, shorten, polish grammar, remove repetition, or translate.
            </span>
          </div>
        </div>

        <div className="mt-4">
          <ContextManifestPanel manifest={contextPackage.manifest} />
        </div>
      </div>

      {/* Main Two-Column Reframing Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 1. Source Origin & Content + 2. Intent & Resolved Plan */}
        <div className="col-span-1 lg:col-span-5 flex flex-col gap-5">
          {/* Step 1: Source Input & Origin */}
          <div className="bg-surface-primary border border-border-standard rounded-2xl p-5 shadow-level-1 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-border-standard pb-3">
              <h3 className="font-sans text-[15px] font-bold text-text-primary flex items-center gap-2">
                <Layers size={16} className="text-brand-gold" />
                1. Source Content & Origin
              </h3>
              <span
                data-testid="reframe-origin-badge"
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold border border-brand-gold/30"
              >
                Origin: {originType}
              </span>
            </div>

            {/* Origin Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  'Manual Input',
                  'Content Workspace',
                  'Content Library',
                  'Revision Studio',
                  'Source Library'
                ] as ReframeOriginType[]
              ).map(type => (
                <button
                  key={type}
                  type="button"
                  data-testid={`reframe-origin-tab-${type}`}
                  onClick={() => handleSelectOriginSource(type)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-colors ${
                    originType === type
                      ? 'bg-brand-gold text-text-inverse border-brand-gold'
                      : 'bg-surface-inset text-text-secondary border-border-standard hover:text-text-primary'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Content Library Picker */}
            {originType === 'Content Library' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-text-secondary">
                  Select Saved Content Piece (Original will never be overwritten):
                </label>
                <select
                  data-testid="reframe-content-library-select"
                  value={originId || ''}
                  onChange={e => handleLoadFromContentLibrary(e.target.value)}
                  className="w-full text-xs bg-surface-inset border border-border-standard rounded-lg px-3 py-2 text-text-primary"
                >
                  <option value="">-- Choose a saved piece from Content Library --</option>
                  {savedContent.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.channel} / {item.audience})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Source Title & Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-text-primary">
                  Source Content ({originTitle})
                </label>
                <span className="text-[10px] text-text-muted">Read-safe: original is preserved</span>
              </div>
              <textarea
                data-testid="reframe-source-textarea"
                rows={6}
                value={sourceContent}
                onChange={e => setSourceContent(e.target.value)}
                placeholder="Paste or load the existing content you want to reframe..."
                className="w-full rounded-xl bg-surface-inset border border-border-standard p-3 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            {/* Contextual Source Library Grounding */}
            <div className="p-3 rounded-xl bg-surface-inset border border-border-standard space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-text-primary flex items-center gap-1">
                  <FileText size={12} className="text-brand-gold" />
                  Attached Contextual Sources ({selectedSourceIds.length})
                </span>
              </div>
              {selectedSourceIds.length > 0 && (
                <div className="space-y-1.5">
                  {selectedSourceIds.map(id => {
                    const s = sources.find(x => x.id === id);
                    if (!s) return null;
                    const role = taskSourceRoleMap[id]?.role || inferDefaultSourceRole(s.type);
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between gap-2 text-[11px] bg-surface-primary px-2.5 py-1.5 rounded border border-border-standard"
                      >
                        <span className="font-semibold text-text-primary truncate">{s.title}</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={role}
                            onChange={e => onChangeSourceTaskRole(id, e.target.value as SourceTaskRole)}
                            className="text-[10px] bg-surface-inset border border-border-standard rounded px-1.5 py-0.5 text-text-primary"
                          >
                            {ALL_SOURCE_TASK_ROLES.map(r => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => onToggleAttachedSource(id)}
                            className="text-[10px] text-status-error hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {sources.filter(s => s.selectable && !selectedSourceIds.includes(s.id)).length > 0 && (
                <select
                  value=""
                  onChange={e => {
                    if (e.target.value) onToggleAttachedSource(e.target.value);
                  }}
                  className="w-full text-[11px] bg-surface-primary border border-border-standard rounded px-2 py-1 text-text-secondary"
                >
                  <option value="">+ Attach supporting source from Source Library...</option>
                  {sources
                    .filter(s => s.selectable && !selectedSourceIds.includes(s.id))
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.type})
                      </option>
                    ))}
                </select>
              )}
            </div>
          </div>

          {/* Step 2: Core Interaction - "What should this become?" */}
          <div className="bg-surface-primary border border-border-standard rounded-2xl p-5 shadow-level-1 space-y-4">
            <h3 className="font-sans text-[15px] font-bold text-text-primary border-b border-border-standard pb-3">
              2. What should this become?
            </h3>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] text-text-secondary">
                Describe in natural language how this piece should be reframed (audience, familiarity, channel, or strategic perspective).
              </p>
              <textarea
                data-testid="reframe-intent-input"
                rows={3}
                value={rawIntent}
                onChange={e => setRawIntent(e.target.value)}
                placeholder="e.g. Make this useful to a cultural institution that knows little about COH and needs to understand why this belongs in its programming strategy."
                className="w-full rounded-xl bg-surface-inset border border-border-standard p-3 text-[13px] text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>

            {/* Quick COH Reframe Intent Starters */}
            <div className="flex flex-wrap gap-1.5">
              {[
                {
                  label: 'Cultural Institution (Low Familiarity)',
                  text: 'Make this useful to a cultural institution that knows little about COH and needs to understand why this belongs in its programming strategy.'
                },
                {
                  label: 'Public Climate Literacy',
                  text: 'Shift this from a sponsorship framing to a public climate literacy and cultural meaning narrative for general audiences.'
                },
                {
                  label: 'LinkedIn Strategic Post',
                  text: 'Turn this long internal argument into a sharp LinkedIn post for strategic partners.'
                },
                {
                  label: 'Press-Facing Narrative',
                  text: 'Reframe this into an editorial press-facing narrative highlighting the artistic proposition.'
                }
              ].map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRawIntent(preset.text)}
                  className="text-[10px] px-2 py-1 rounded bg-surface-inset border border-border-standard text-text-secondary hover:border-brand-gold hover:text-text-primary transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              data-testid="resolve-reframe-intent-btn"
              disabled={!sourceContent.trim() || !rawIntent.trim()}
              onClick={handleResolveIntent}
              className="w-full h-10 rounded-xl bg-slate-900 text-white dark:bg-surface-inset dark:border dark:border-brand-gold/40 font-sans text-xs font-bold hover:bg-brand-gold-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Compass size={14} />
              Resolve Transformation Plan
            </button>

            {/* Route Detection Alert: If REVISION is recommended (Journey E) */}
            {resolvedPlan && resolvedPlan.recommendedRoute === 'REVISION' && (
              <div
                data-testid="reframe-revision-route-alert"
                className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-2.5"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-bold text-text-primary block">
                      Recommended Route: Revision Studio
                    </span>
                    <p className="text-text-secondary mt-0.5 leading-relaxed">
                      {resolvedPlan.routeRationale}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  data-testid="handoff-to-revision-studio-btn"
                  onClick={() =>
                    onHandoffToRevisionStudio({
                      sourceText: sourceContent,
                      title: originTitle,
                      suggestedActionId: resolvedPlan.suggestedRevisionActionId,
                      instructionNote: rawIntent
                    })
                  }
                  className="w-full py-2 px-3 rounded-lg bg-brand-gold text-text-inverse font-bold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-brand-gold-hover transition-colors"
                >
                  Open in Revision Studio <ArrowRight size={13} />
                </button>
              </div>
            )}

            {/* Editable Resolved Transformation Plan */}
            {resolvedPlan && (
              <div
                data-testid="resolved-reframe-plan"
                className="pt-3 border-t border-border-standard space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                    3. Review & Edit Transformation Plan
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-inset border border-border-standard text-text-secondary">
                    Route: {resolvedPlan.recommendedRoute}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-secondary">Target Audience</label>
                    <select
                      data-testid="plan-target-audience"
                      value={resolvedPlan.targetAudience}
                      onChange={e => handleUpdatePlanField('targetAudience', e.target.value)}
                      className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                    >
                      {COH_VALID_AUDIENCES.map(aud => (
                        <option key={aud} value={aud}>
                          {aud}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-secondary">Audience Familiarity</label>
                    <select
                      data-testid="plan-audience-familiarity"
                      value={resolvedPlan.audienceFamiliarity}
                      onChange={e =>
                        handleUpdatePlanField(
                          'audienceFamiliarity',
                          e.target.value as AudienceFamiliarityLevel
                        )
                      }
                      className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                    >
                      {FAMILIARITY_OPTIONS.map(fam => (
                        <option key={fam} value={fam}>
                          {fam}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-secondary">Communication Purpose</label>
                    <select
                      data-testid="plan-communication-purpose"
                      value={resolvedPlan.communicationPurpose}
                      onChange={e => handleUpdatePlanField('communicationPurpose', e.target.value)}
                      className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                    >
                      {COH_COMMUNICATION_JOBS.map(job => (
                        <option key={job} value={job}>
                          {job}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-secondary">Content-Pillar Emphasis</label>
                    <select
                      data-testid="plan-pillar-emphasis"
                      value={resolvedPlan.contentPillarEmphasis}
                      onChange={e => handleUpdatePlanField('contentPillarEmphasis', e.target.value)}
                      className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                    >
                      {COH_CONTENT_PILLARS.map(pillar => (
                        <option key={pillar} value={pillar}>
                          {pillar}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-secondary">Target Channel</label>
                    <select
                      data-testid="plan-target-channel"
                      value={resolvedPlan.targetChannel}
                      onChange={e => handleUpdatePlanField('targetChannel', e.target.value)}
                      className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                    >
                      {CHANNEL_OPTIONS.map(ch => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold text-text-secondary">Target Format</label>
                    <select
                      data-testid="plan-target-format"
                      value={resolvedPlan.targetFormat}
                      onChange={e => handleUpdatePlanField('targetFormat', e.target.value)}
                      className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                    >
                      {FORMAT_OPTIONS.map(fmt => (
                        <option key={fmt} value={fmt}>
                          {fmt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-text-secondary">Strategic Frame</label>
                  <input
                    type="text"
                    data-testid="plan-strategic-frame"
                    value={resolvedPlan.strategicFrame}
                    onChange={e => handleUpdatePlanField('strategicFrame', e.target.value)}
                    className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-semibold text-text-secondary">Desired Audience Response</label>
                  <input
                    type="text"
                    data-testid="plan-desired-response"
                    value={resolvedPlan.desiredAudienceResponse}
                    onChange={e => handleUpdatePlanField('desiredAudienceResponse', e.target.value)}
                    className="text-xs bg-surface-inset border border-border-standard rounded-lg px-2.5 py-1.5 text-text-primary"
                  />
                </div>

                {/* Protected Elements */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                    <ShieldCheck size={12} className="text-brand-gold" />
                    Protected Elements (Hard Constraints)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {DEFAULT_PROTECTED_ELEMENTS.map(elem => {
                      const active = resolvedPlan.protectedElements.includes(elem);
                      return (
                        <button
                          key={elem}
                          type="button"
                          onClick={() => handleToggleProtectedElement(elem)}
                          className={`text-[10px] px-2 py-1 rounded-md border font-medium transition-colors ${
                            active
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                              : 'bg-surface-inset border-border-standard text-text-muted'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}
                          {elem}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Unresolved Items / Evidence Protection Advisories */}
                {resolvedPlan.unresolvedItems.length > 0 && (
                  <div
                    data-testid="plan-unresolved-warnings"
                    className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-800 dark:text-amber-300 space-y-1"
                  >
                    {resolvedPlan.unresolvedItems.map((item, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  data-testid="generate-reframe-btn"
                  disabled={isGenerating || !sourceContent.trim()}
                  onClick={() => handleGenerateReframe()}
                  className="w-full h-11 rounded-xl bg-brand-gold text-text-inverse font-sans text-xs font-bold hover:bg-brand-gold-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Reframing Content...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Generate Proposed Reframe
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Comparison View, Changed/Preserved Explanations & Save/Handoff Actions */}
        <div className="col-span-1 lg:col-span-7 flex flex-col gap-5">
          {/* Error Banner with Retry & Preserved State (Journey H) */}
          {generationError && (
            <div
              data-testid="reframe-error-banner"
              className="p-4 rounded-2xl bg-status-error/10 border border-status-error/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="text-xs text-status-error">
                <span className="font-bold block">Reframing Generation Error</span>
                <span>{generationError}</span>
              </div>
              <button
                type="button"
                data-testid="retry-reframe-btn"
                onClick={() => handleGenerateReframe()}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-status-error text-white text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Retry Generation
              </button>
            </div>
          )}

          {reframeResult && resolvedPlan ? (
            <div className="space-y-5" data-testid="reframe-comparison-view">
              {/* Side-by-Side Comparison: Source Content vs Proposed Reframe */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Source Content Card */}
                <div className="bg-surface-primary border border-border-standard rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-border-standard pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                      Source Content ({originType})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-surface-inset text-text-muted border border-border-standard">
                      Untouched Original
                    </span>
                  </div>
                  <div
                    data-testid="reframe-comparison-source"
                    className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed font-sans flex-1"
                  >
                    {sourceContent}
                  </div>
                </div>

                {/* Proposed Reframe Card */}
                <div className="bg-surface-primary border-2 border-brand-gold/60 rounded-2xl p-5 flex flex-col gap-3 shadow-level-1">
                  <div className="flex items-center justify-between border-b border-border-standard pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                      Proposed Reframe ({resolvedPlan.targetChannel} / {resolvedPlan.targetFormat})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold font-semibold">
                      {resolvedPlan.targetAudience}
                    </span>
                  </div>
                  <div
                    data-testid="reframe-proposed-output"
                    className="text-[13px] text-text-primary whitespace-pre-wrap leading-relaxed font-sans flex-1"
                  >
                    {reframeResult.reframedCopy}
                  </div>
                </div>
              </div>

              {/* Transformation Explanation: What Changed vs What Was Preserved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  data-testid="reframe-changed-explanation"
                  className="bg-surface-primary border border-border-standard rounded-2xl p-4 space-y-2"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-gold">
                    Changed (Material Shifts)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-text-secondary">
                    {reframeResult.changedExplanation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div
                  data-testid="reframe-preserved-explanation"
                  className="bg-surface-primary border border-border-standard rounded-2xl p-4 space-y-2"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Preserved (Protected Continuity)
                  </h4>
                  <ul className="list-disc pl-4 space-y-1.5 text-xs text-text-secondary">
                    {reframeResult.preservedExplanation.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evidence Warnings if any */}
              {reframeResult.evidenceWarnings.length > 0 && (
                <div
                  data-testid="reframe-evidence-warnings"
                  className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 space-y-1"
                >
                  <span className="font-bold block">Evidence Discipline Notice:</span>
                  {reframeResult.evidenceWarnings.map((w, idx) => (
                    <div key={idx}>{w}</div>
                  ))}
                </div>
              )}

              {/* Action Bar: Copy, Use as Current / Send to Workspace, Save as New Version */}
              <div className="bg-surface-primary border border-border-standard rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    data-testid="reframe-copy-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(reframeResult.reframedCopy);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-border-strong bg-surface-inset text-xs font-semibold text-text-primary hover:border-brand-gold transition-colors inline-flex items-center gap-1.5"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="reframe-save-library-btn"
                    onClick={() => {
                      const lineage = buildReframeLineageMetadata({
                        originType,
                        originContentId: originId,
                        originTitle,
                        plan: resolvedPlan,
                        sourceIds: selectedSourceIds
                      });
                      onSaveReframeToLibrary({
                        reframedText: reframeResult.reframedCopy,
                        title: `Reframed (${resolvedPlan.targetAudience}): ${originTitle}`,
                        plan: resolvedPlan,
                        lineage
                      });
                      setSavedNotice(true);
                      setTimeout(() => setSavedNotice(false), 2500);
                    }}
                    className="px-3.5 py-2 rounded-lg border border-border-strong bg-surface-primary text-xs font-bold text-text-primary hover:border-brand-gold transition-colors inline-flex items-center gap-1.5"
                  >
                    <BookmarkPlus size={14} className="text-brand-gold" />
                    {savedNotice ? 'Saved as New Version!' : 'Save as New Version'}
                  </button>

                  <button
                    type="button"
                    data-testid="reframe-send-workspace-btn"
                    onClick={() => {
                      const lineage = buildReframeLineageMetadata({
                        originType,
                        originContentId: originId,
                        originTitle,
                        plan: resolvedPlan,
                        sourceIds: selectedSourceIds
                      });
                      onSendReframeToWorkspace({
                        reframedText: reframeResult.reframedCopy,
                        title: `Reframed (${resolvedPlan.targetAudience}): ${originTitle}`,
                        plan: resolvedPlan,
                        lineage
                      });
                    }}
                    className="px-4 py-2 rounded-lg bg-brand-gold text-text-inverse text-xs font-bold hover:bg-brand-gold-hover transition-colors inline-flex items-center gap-1.5"
                  >
                    <Send size={14} />
                    Use as Current / Send to Workspace
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface-inset border-2 border-dashed border-border-standard rounded-2xl p-14 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full bg-surface-primary flex items-center justify-center shadow-sm">
                <Compass size={26} className="text-brand-gold" />
              </div>
              <h3 className="font-sans text-lg font-bold text-text-primary">
                Ready to Reframe Content
              </h3>
              <p className="font-sans text-xs text-text-secondary max-w-md leading-relaxed">
                Provide or select source content on the left, answer "What should this become?", review the resolved COH transformation plan, and generate a factual-integrity-preserving reframe.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

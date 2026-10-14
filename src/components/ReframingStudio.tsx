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
  ChevronDown,
  SlidersHorizontal
} from 'lucide-react';
import {
  resolveReframeIntent,
  buildDeterministicReframe,
  finalizeReframeResult,
  buildReframeLineageMetadata,
  getReframingAudienceOptions,
  getReframingPillarOptions,
  DEFAULT_PROTECTED_ELEMENTS,
  NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES,
  type ReframeOriginType,
  type AudienceFamiliarityLevel,
  type ResolvedReframePlan,
  type ReframeOutputResult,
  type ReframeLineageMetadata
} from '../lib/reframingEngine';
import { COH_COMMUNICATION_JOBS } from '../lib/ideationIntelligence';
import {
  compileGovernedContext,
  inferDefaultSourceRole,
  type TaskSourceBinding,
  type SourceTaskRole
} from '../lib/contextCompiler';
import { ALL_SOURCE_TASK_ROLES, type SourceIntelligenceAnalysis } from '../lib/sourceIntelligence';
import { normalizeCohPillar, type OperatingCore } from '../lib/operatingCore';
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
  const [originType, setOriginType] = useState<ReframeOriginType>(initialOrigin?.originType || 'Manual Input');
  const [originId, setOriginId] = useState<string | undefined>(initialOrigin?.originId);
  const [originTitle, setOriginTitle] = useState(initialOrigin?.originTitle || 'Source Material for Reframing');
  const [originChannel, setOriginChannel] = useState(initialOrigin?.originChannel || 'Website');
  const [originAudience, setOriginAudience] = useState(initialOrigin?.originAudience || 'General Public');
  const [sourceContent, setSourceContent] = useState(initialOrigin?.sourceContent || '');
  const [rawIntent, setRawIntent] = useState(initialOrigin?.suggestedIntent || '');
  const [resolvedPlan, setResolvedPlan] = useState<ResolvedReframePlan | null>(null);
  const [routeOverrideConfirmed, setRouteOverrideConfirmed] = useState(false);
  const [reframeResult, setReframeResult] = useState<ReframeOutputResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (initialOrigin && initialOrigin.sourceContent) {
      setOriginType(initialOrigin.originType);
      setOriginId(initialOrigin.originId);
      setOriginTitle(initialOrigin.originTitle || 'Imported Content');
      setOriginChannel(initialOrigin.originChannel || 'Website');
      setOriginAudience(initialOrigin.originAudience || 'General Public');
      setSourceContent(initialOrigin.sourceContent);
      setRawIntent(initialOrigin.suggestedIntent || '');
      setResolvedPlan(null);
      setReframeResult(null);
      setGenerationError(null);
      setRouteOverrideConfirmed(false);
    }
  }, [initialOrigin]);

  const sourceLibraryCandidates = sources.filter(source =>
    source.selectable !== false && Boolean((source.content || source.notes || source.url || '').trim())
  );

  const activeSourceBindings: TaskSourceBinding[] = selectedSourceIds
    .map(id => {
      const source = sources.find(item => item.id === id);
      if (!source) return null;
      return {
        sourceId: source.id,
        title: source.title || 'Untitled Source',
        type: source.type || 'Other',
        role: taskSourceRoleMap[source.id]?.role || inferDefaultSourceRole(source.type),
        selectedExcerpts: taskSourceRoleMap[source.id]?.selectedExcerpts || [],
        content: source.content || source.notes || source.url || '',
        summary: source.notes || undefined
      } as TaskSourceBinding;
    })
    .filter((binding): binding is TaskSourceBinding => Boolean(binding));

  const contextPackage = compileGovernedContext({
    workflow: 'Reframing Studio',
    operatingCore,
    coreDocuments: operatingCoreDocs,
    audience: resolvedPlan?.targetAudience || originAudience,
    channel: resolvedPlan?.targetChannel || originChannel,
    format: resolvedPlan?.targetFormat || 'Post',
    pillar: normalizeCohPillar(resolvedPlan?.contentPillarEmphasis, 'Climate Tetralogy & Canon'),
    communicationJob: resolvedPlan?.communicationPurpose || 'Establish institutional credibility',
    sourceBindings: activeSourceBindings,
    derivedSourceAnalyses: sourceIntelligenceMap,
    userInstruction: rawIntent
  });

  const resetTransformationState = () => {
    setResolvedPlan(null);
    setRouteOverrideConfirmed(false);
    setReframeResult(null);
    setGenerationError(null);
  };

  const handleSelectOriginSource = (type: ReframeOriginType) => {
    if (type === 'Content Workspace' && !workspaceDraftText.trim()) return;
    if (type === 'Revision Studio' && !revisionDraftText.trim()) return;
    if (type === 'Content Library' && savedContent.length === 0) return;
    if (type === 'Source Library' && sourceLibraryCandidates.length === 0) return;

    setOriginType(type);
    resetTransformationState();

    if (type === 'Manual Input') {
      setOriginId(undefined);
      setOriginTitle('Manual Input');
      return;
    }

    if (type === 'Content Workspace') {
      setSourceContent(workspaceDraftText);
      setOriginTitle(workspaceTitle || 'Current Content Workspace Draft');
      setOriginId('workspace-current');
      return;
    }

    if (type === 'Revision Studio') {
      setSourceContent(revisionDraftText);
      setOriginTitle(revisionTitle || 'Current Revision Studio Output');
      setOriginId('revision-current');
      return;
    }

    // Library origins require an explicit item selection. Clear the source body to avoid stale provenance.
    setSourceContent('');
    setOriginId(undefined);
    setOriginTitle(type === 'Content Library' ? 'Choose saved content' : 'Choose Source Library material');
  };

  const handleLoadFromContentLibrary = (itemId: string) => {
    const item = savedContent.find(content => content.id === itemId);
    if (!item) return;
    setOriginType('Content Library');
    setOriginId(item.id);
    setOriginTitle(item.title);
    setOriginChannel(item.channel || 'LinkedIn');
    setOriginAudience(item.audience || 'General Public');
    setSourceContent(item.text);
    resetTransformationState();
  };

  const handleLoadFromSourceLibrary = (sourceId: string) => {
    const source = sourceLibraryCandidates.find(item => item.id === sourceId);
    if (!source) return;
    setOriginType('Source Library');
    setOriginId(source.id);
    setOriginTitle(source.title || 'Source Library Material');
    setOriginChannel('Website');
    setOriginAudience('General Public');
    setSourceContent(source.content || source.notes || source.url || '');
    resetTransformationState();
  };

  const originAvailability: Record<ReframeOriginType, boolean> = {
    'Manual Input': true,
    'Content Workspace': Boolean(workspaceDraftText.trim()),
    'Content Library': savedContent.length > 0,
    'Revision Studio': Boolean(revisionDraftText.trim()),
    'Source Library': sourceLibraryCandidates.length > 0
  };

  const handleResolveIntent = () => {
    if (!rawIntent.trim() || !sourceContent.trim()) return;
    setResolvedPlan(
      resolveReframeIntent({
        rawIntent,
        sourceContent,
        originChannel,
        originAudience,
        sourceBindings: activeSourceBindings,
        derivedSourceAnalyses: sourceIntelligenceMap,
        operatingCore
      })
    );
    setRouteOverrideConfirmed(false);
    setGenerationError(null);
  };

  const handleUpdatePlanField = <K extends keyof ResolvedReframePlan>(
    field: K,
    value: ResolvedReframePlan[K]
  ) => setResolvedPlan(previous => (previous ? { ...previous, [field]: value } : null));

  const handleToggleProtectedElement = (element: string) => {
    if (!resolvedPlan) return;
    handleUpdatePlanField(
      'protectedElements',
      resolvedPlan.protectedElements.includes(element)
        ? resolvedPlan.protectedElements.filter(item => item !== element)
        : [...resolvedPlan.protectedElements, element]
    );
  };

  const handleGenerateReframe = async (options?: {
    forceDeterministic?: boolean;
    simulateFailure?: boolean;
    allowRevisionOverride?: boolean;
  }) => {
    if (!sourceContent.trim()) return;

    const activePlan =
      resolvedPlan ||
      resolveReframeIntent({
        rawIntent: rawIntent || 'Reframe this content for institutional relevance',
        sourceContent,
        originChannel,
        originAudience,
        sourceBindings: activeSourceBindings,
        derivedSourceAnalyses: sourceIntelligenceMap,
        operatingCore
      });

    if (!resolvedPlan) setResolvedPlan(activePlan);

    if (
      activePlan.recommendedRoute === 'REVISION' &&
      !routeOverrideConfirmed &&
      !options?.allowRevisionOverride
    ) {
      setGenerationError('This request keeps the same communication job. Revision Studio is the clearer route.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    if (options?.simulateFailure) {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationError('AI provider connection error. Your source and transformation plan are preserved.');
      }, 200);
      return;
    }

    if (!options?.forceDeterministic) {
      try {
        const response = await fetch('/api/ai/reframe', {
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

        if (response.ok) {
          const data = await response.json();
          if (data?.success && data?.data?.reframedCopy) {
            setReframeResult(
              finalizeReframeResult({
                sourceContent,
                rawReframedCopy: data.data.reframedCopy,
                plan: activePlan,
                sourceBindings: activeSourceBindings,
                aiChanged: data.data.changedExplanation,
                aiPreserved: data.data.preservedExplanation,
                aiWarnings: data.data.evidenceWarnings
              })
            );
            setIsGenerating(false);
            return;
          }
        }
      } catch {
        // Deterministic governed fallback below.
      }
    }

    setReframeResult(
      buildDeterministicReframe({
        sourceContent,
        plan: activePlan,
        sourceBindings: activeSourceBindings,
        derivedSourceAnalyses: sourceIntelligenceMap
      })
    );
    setIsGenerating(false);
  };

  const handleResetAll = () => {
    setSourceContent('');
    setRawIntent('');
    setOriginType('Manual Input');
    setOriginId(undefined);
    setOriginTitle('Source Material for Reframing');
    setOriginChannel('Website');
    setOriginAudience('General Public');
    resetTransformationState();
  };

  const handleStartNewReframeKeepSource = () => {
    setRawIntent('');
    resetTransformationState();
  };

  const saveOrSend = (mode: 'save' | 'send') => {
    if (!reframeResult || !resolvedPlan) return;
    const lineage = buildReframeLineageMetadata({
      originType,
      originContentId: originId,
      originTitle,
      plan: resolvedPlan,
      sourceIds: selectedSourceIds
    });
    const payload = {
      reframedText: reframeResult.reframedCopy,
      title: `Reframed (${resolvedPlan.targetAudience}): ${originTitle}`,
      plan: resolvedPlan,
      lineage
    };
    if (mode === 'save') {
      onSaveReframeToLibrary(payload);
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    } else {
      onSendReframeToWorkspace(payload);
    }
  };

  return (
    <div className="page-shell space-y-4" data-testid="reframing-studio-root">
      <div className="bg-surface-primary border border-border-standard p-5 rounded-xl shadow-level-1 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-brand-gold" />
            <h2 className="page-title">Reframing Studio</h2>
          </div>
          <p className="page-subtitle">
            Change who the content is for, what it needs to accomplish, or how it should be understood, without changing the factual ground.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            data-testid="start-new-reframe-btn"
            onClick={handleStartNewReframeKeepSource}
            className="h-9 px-3 rounded-lg border border-border-standard bg-surface-primary text-xs text-text-secondary inline-flex items-center gap-1.5"
          >
            <RefreshCw size={12} /> New Reframe
          </button>
          <button
            data-testid="reframe-reset-btn"
            onClick={handleResetAll}
            className="h-9 px-3 rounded-lg border border-border-standard bg-surface-primary text-xs text-status-error inline-flex items-center gap-1.5"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      <ContextManifestPanel manifest={contextPackage.manifest} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-5 space-y-4">
          <section className="bg-surface-primary border border-border-standard rounded-xl shadow-level-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-standard">
              <span className="text-[11px] font-semibold text-brand-gold">1. Source content</span>
              <p className="text-[11px] text-text-muted mt-0.5">The original is never overwritten.</p>
            </div>
            <div className="p-4 space-y-3">
              <details>
                <summary className="cursor-pointer text-[10.5px] font-semibold text-text-secondary inline-flex items-center gap-1">
                  <ChevronDown size={10} /> Choose a different source
                </summary>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(['Manual Input', 'Content Workspace', 'Content Library', 'Revision Studio', 'Source Library'] as ReframeOriginType[]).map(type => {
                    const available = originAvailability[type];
                    return (
                      <button
                        key={type}
                        type="button"
                        data-testid={`reframe-origin-tab-${type}`}
                        disabled={!available}
                        title={available ? undefined : `No ${type} content is currently available`}
                        onClick={() => handleSelectOriginSource(type)}
                        className={`px-2 py-1 rounded-md text-[10px] border transition-colors disabled:opacity-35 disabled:cursor-not-allowed ${
                          originType === type
                            ? 'bg-brand-gold/15 border-brand-gold/30 text-brand-gold'
                            : 'bg-surface-inset border-border-standard text-text-secondary'
                        }`}
                      >
                        {type}
                      </button>
                    );
                  })}
                </div>

                {originType === 'Content Library' && (
                  <select
                    data-testid="reframe-content-library-select"
                    value={originId || ''}
                    onChange={event => handleLoadFromContentLibrary(event.target.value)}
                    className="mt-2 w-full text-xs bg-surface-inset border border-border-standard rounded-lg px-3 py-2 text-text-primary"
                  >
                    <option value="">Choose saved content...</option>
                    {savedContent.map(item => (
                      <option key={item.id} value={item.id}>{item.title}</option>
                    ))}
                  </select>
                )}

                {originType === 'Source Library' && (
                  <select
                    data-testid="reframe-source-library-select"
                    value={originId || ''}
                    onChange={event => handleLoadFromSourceLibrary(event.target.value)}
                    className="mt-2 w-full text-xs bg-surface-inset border border-border-standard rounded-lg px-3 py-2 text-text-primary"
                  >
                    <option value="">Choose Source Library material...</option>
                    {sourceLibraryCandidates.map(source => (
                      <option key={source.id} value={source.id}>{source.title} ({source.type})</option>
                    ))}
                  </select>
                )}
              </details>

              <div className="flex items-center justify-between gap-2">
                <label className="text-[11px] font-semibold text-text-primary">{originTitle}</label>
                <span data-testid="reframe-origin-badge" className="text-[9.5px] text-text-muted">{originType}</span>
              </div>
              <textarea
                data-testid="reframe-source-textarea"
                rows={11}
                value={sourceContent}
                onChange={event => {
                  setSourceContent(event.target.value);
                  if (originType !== 'Manual Input') {
                    setOriginType('Manual Input');
                    setOriginId(undefined);
                    setOriginTitle('Manual Input');
                  }
                  resetTransformationState();
                }}
                placeholder="Paste or load the content you want to reframe..."
                className="w-full rounded-lg bg-surface-inset border border-border-standard p-3 text-[13px] leading-relaxed text-text-primary"
              />

              <details className="rounded-lg border border-border-standard bg-surface-inset/40">
                <summary className="cursor-pointer px-3 py-2 text-[10.5px] font-semibold text-text-secondary inline-flex items-center gap-1.5">
                  <FileText size={11} className="text-brand-gold" /> Supporting sources ({selectedSourceIds.length})
                </summary>
                <div className="border-t border-border-standard p-2.5 space-y-2">
                  {selectedSourceIds.map(id => {
                    const source = sources.find(item => item.id === id);
                    if (!source) return null;
                    const role = taskSourceRoleMap[id]?.role || inferDefaultSourceRole(source.type);
                    return (
                      <div key={id} className="flex items-center justify-between gap-2 text-[10.5px]">
                        <span className="truncate text-text-primary">{source.title}</span>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={role}
                            onChange={event => onChangeSourceTaskRole(id, event.target.value as SourceTaskRole)}
                            className="text-[9.5px] bg-surface-primary border border-border-standard rounded px-1.5 py-0.5"
                          >
                            {ALL_SOURCE_TASK_ROLES.map(sourceRole => <option key={sourceRole}>{sourceRole}</option>)}
                          </select>
                          <button type="button" onClick={() => onToggleAttachedSource(id)} className="text-status-error">Remove</button>
                        </div>
                      </div>
                    );
                  })}
                  {sources.filter(source => source.selectable && !selectedSourceIds.includes(source.id)).length > 0 && (
                    <select
                      value=""
                      onChange={event => event.target.value && onToggleAttachedSource(event.target.value)}
                      className="w-full text-[10.5px] bg-surface-primary border border-border-standard rounded-md px-2.5 py-1.5 text-text-secondary"
                    >
                      <option value="">+ Attach supporting source...</option>
                      {sources
                        .filter(source => source.selectable && !selectedSourceIds.includes(source.id))
                        .map(source => <option key={source.id} value={source.id}>{source.title}</option>)}
                    </select>
                  )}
                </div>
              </details>
            </div>
          </section>

          <section className="bg-surface-primary border border-border-standard rounded-xl shadow-level-1 p-4 space-y-3">
            <div>
              <span className="text-[11px] font-semibold text-brand-gold">2. What should this become?</span>
              <p className="text-[11px] text-text-secondary mt-1">Describe the new audience, purpose, channel, or strategic frame in ordinary language.</p>
            </div>
            <textarea
              data-testid="reframe-intent-input"
              rows={4}
              value={rawIntent}
              onChange={event => {
                setRawIntent(event.target.value);
                setResolvedPlan(null);
                setReframeResult(null);
                setGenerationError(null);
                setRouteOverrideConfirmed(false);
              }}
              placeholder="e.g. Make this useful to a cultural institution that knows little about COH and needs to understand why this belongs in its programming strategy."
              className="w-full rounded-lg bg-surface-inset border border-border-standard p-3 text-[13px] leading-relaxed text-text-primary"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                ['Cultural institution', 'Make this useful to a cultural institution that knows little about COH and needs to understand why this belongs in its programming strategy.'],
                ['Public climate literacy', 'Shift this into a public climate literacy and cultural meaning narrative for general audiences.'],
                ['LinkedIn strategic post', 'Turn this into a sharp LinkedIn post for strategic partners.'],
                ['Press-facing narrative', 'Reframe this into an editorial press-facing narrative highlighting the artistic proposition.']
              ].map(([label, text]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setRawIntent(text);
                    setResolvedPlan(null);
                    setReframeResult(null);
                    setGenerationError(null);
                    setRouteOverrideConfirmed(false);
                  }}
                  className="px-2.5 py-1 rounded-md bg-surface-inset border border-border-standard text-[10px] text-text-secondary hover:border-brand-gold"
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              data-testid="resolve-reframe-intent-btn"
              type="button"
              disabled={!sourceContent.trim() || !rawIntent.trim()}
              onClick={handleResolveIntent}
              className="w-full h-9 rounded-lg border border-border-strong bg-surface-inset text-xs font-semibold text-text-primary hover:border-brand-gold disabled:opacity-40 inline-flex items-center justify-center gap-1.5"
            >
              <Compass size={13} className="text-brand-gold" /> Resolve Reframe
            </button>

            {resolvedPlan && resolvedPlan.recommendedRoute === 'REVISION' && (
              <div data-testid="reframe-revision-route-alert" className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 space-y-2">
                <div className="flex items-start gap-2 text-[10.5px] text-text-primary">
                  <AlertTriangle size={12} className="text-status-warning mt-0.5" />
                  <span><strong>This is really a revision.</strong> {resolvedPlan.routeRationale}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    data-testid="handoff-to-revision-studio-btn"
                    onClick={() => onHandoffToRevisionStudio({
                      sourceText: sourceContent,
                      title: originTitle,
                      suggestedActionId: resolvedPlan.suggestedRevisionActionId,
                      instructionNote: rawIntent
                    })}
                    className="h-8 px-3 rounded-lg bg-brand-gold text-text-inverse text-[10.5px] font-semibold inline-flex items-center gap-1"
                  >
                    Open Revision Studio <ArrowRight size={11} />
                  </button>
                  {!routeOverrideConfirmed ? (
                    <button
                      data-testid="override-continue-reframe-btn"
                      onClick={() => setRouteOverrideConfirmed(true)}
                      className="h-8 px-3 rounded-lg border border-border-standard bg-surface-primary text-[10.5px] text-text-secondary"
                    >
                      Continue as Reframe
                    </button>
                  ) : (
                    <span data-testid="override-reframe-confirmed-badge" className="text-[10px] text-brand-gold self-center">Override active</span>
                  )}
                </div>
              </div>
            )}

            {resolvedPlan && (
              <div data-testid="resolved-reframe-plan" className="space-y-3 pt-1">
                <div className="flex flex-wrap gap-1.5">
                  {[resolvedPlan.targetAudience, resolvedPlan.communicationPurpose, resolvedPlan.targetChannel, resolvedPlan.targetFormat]
                    .filter(Boolean)
                    .map((value, index) => (
                      <span key={`${value}-${index}`} className="px-2 py-1 rounded-md bg-brand-gold/10 border border-brand-gold/25 text-[10px] text-brand-gold font-medium">{value}</span>
                    ))}
                </div>
                <div className="p-2.5 rounded-lg bg-surface-inset border border-border-standard">
                  <div className="text-[10px] text-text-muted">Strategic frame</div>
                  <div className="text-[11.5px] font-semibold text-text-primary mt-0.5">{resolvedPlan.strategicFrame}</div>
                </div>
                {resolvedPlan.unresolvedItems.length > 0 && (
                  <div data-testid="plan-unresolved-warnings" className="p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/25 text-[10px] text-text-primary">{resolvedPlan.unresolvedItems.join(' · ')}</div>
                )}

                <details className="rounded-lg border border-border-standard bg-surface-inset/35">
                  <summary className="cursor-pointer px-3 py-2 text-[10.5px] font-semibold text-text-secondary inline-flex items-center gap-1.5">
                    <SlidersHorizontal size={11} className="text-brand-gold" /> Fine-tune transformation
                  </summary>
                  <div className="border-t border-border-standard p-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9.5px] text-text-muted">Target audience</label>
                        <select data-testid="plan-target-audience" value={resolvedPlan.targetAudience} onChange={event => handleUpdatePlanField('targetAudience', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5">
                          {getReframingAudienceOptions(operatingCore, resolvedPlan.targetAudience).map(audience => <option key={audience}>{audience}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] text-text-muted">Familiarity</label>
                        <select data-testid="plan-audience-familiarity" value={resolvedPlan.audienceFamiliarity} onChange={event => handleUpdatePlanField('audienceFamiliarity', event.target.value as AudienceFamiliarityLevel)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5">
                          {FAMILIARITY_OPTIONS.map(value => <option key={value}>{value}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] text-text-muted">Purpose</label>
                        <select data-testid="plan-communication-purpose" value={resolvedPlan.communicationPurpose} onChange={event => handleUpdatePlanField('communicationPurpose', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5">
                          {COH_COMMUNICATION_JOBS.map(value => <option key={value}>{value}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] text-text-muted">Pillar</label>
                        <select data-testid="plan-pillar-emphasis" value={resolvedPlan.contentPillarEmphasis} onChange={event => handleUpdatePlanField('contentPillarEmphasis', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5">
                          {getReframingPillarOptions().map(value => <option key={value}>{value}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] text-text-muted">Channel</label>
                        <select data-testid="plan-target-channel" value={resolvedPlan.targetChannel} onChange={event => handleUpdatePlanField('targetChannel', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5">
                          {CHANNEL_OPTIONS.map(value => <option key={value}>{value}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9.5px] text-text-muted">Format</label>
                        <select data-testid="plan-target-format" value={resolvedPlan.targetFormat} onChange={event => handleUpdatePlanField('targetFormat', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5">
                          {FORMAT_OPTIONS.map(value => <option key={value}>{value}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[9.5px] text-text-muted">Strategic frame</label>
                      <input data-testid="plan-strategic-frame" value={resolvedPlan.strategicFrame} onChange={event => handleUpdatePlanField('strategicFrame', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label className="text-[9.5px] text-text-muted">Desired audience response</label>
                      <input data-testid="plan-desired-response" value={resolvedPlan.desiredAudienceResponse} onChange={event => handleUpdatePlanField('desiredAudienceResponse', event.target.value)} className="w-full mt-1 text-[10.5px] bg-surface-primary border border-border-standard rounded-lg px-2.5 py-1.5" />
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-primary border border-border-standard">
                      <div className="text-[9.5px] font-semibold text-brand-gold inline-flex items-center gap-1"><ShieldCheck size={10} /> Factual integrity always enforced</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {NON_NEGOTIABLE_FACTUAL_INTEGRITY_RULES.map(rule => <span key={rule} className="px-1.5 py-0.5 rounded bg-surface-inset text-[9px] text-text-muted">{rule}</span>)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-semibold text-text-secondary">Optional preservation</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {DEFAULT_PROTECTED_ELEMENTS.map(element => {
                          const active = resolvedPlan.protectedElements.includes(element);
                          return (
                            <button key={element} type="button" onClick={() => handleToggleProtectedElement(element)} className={`px-2 py-1 rounded-md border text-[9.5px] ${active ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-surface-primary border-border-standard text-text-muted'}`}>
                              {active ? '✓ ' : '+ '}{element}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </details>

                <button
                  data-testid="generate-reframe-btn"
                  type="button"
                  disabled={isGenerating || !sourceContent.trim() || (resolvedPlan.recommendedRoute === 'REVISION' && !routeOverrideConfirmed)}
                  onClick={() => handleGenerateReframe()}
                  className="w-full h-10 rounded-lg bg-brand-gold text-text-inverse text-xs font-semibold hover:bg-brand-gold-hover disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={13} /> {isGenerating ? 'Reframing...' : 'Generate Reframe'}
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="xl:col-span-7 space-y-4">
          {generationError && (
            <div data-testid="reframe-error-banner" className="p-3 rounded-xl bg-status-error/10 border border-status-error/30 flex items-center justify-between gap-3">
              <div className="text-[10.5px] text-status-error"><strong>Reframing error.</strong> {generationError}</div>
              <button data-testid="retry-reframe-btn" onClick={() => handleGenerateReframe()} className="h-8 px-3 rounded-lg bg-status-error text-white text-[10.5px] font-semibold">Retry</button>
            </div>
          )}

          {reframeResult && resolvedPlan ? (
            <div data-testid="reframe-comparison-view" className="space-y-4">
              <section className="bg-surface-primary border border-brand-gold/35 rounded-xl shadow-level-1 overflow-hidden">
                <div className="px-4 py-3 border-b border-border-standard bg-brand-gold/5 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-brand-gold">3. Proposed Reframe</span>
                    <p className="text-[10.5px] text-text-muted mt-0.5">Compare it with the source. The original remains unchanged.</p>
                  </div>
                  <button
                    data-testid="reframe-copy-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(reframeResult.reframedCopy);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="h-8 px-2.5 rounded-lg border border-border-standard bg-surface-primary text-[10.5px] text-text-secondary inline-flex items-center gap-1"
                  >
                    {copied ? <Check size={11} className="text-status-success" /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-standard">
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-wide text-text-muted font-semibold mb-2">Original</div>
                    <div className="text-[13px] text-text-secondary whitespace-pre-wrap leading-relaxed max-h-[520px] overflow-y-auto">{sourceContent}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-wide text-brand-gold font-semibold mb-2">Reframed</div>
                    <div className="text-[14px] text-text-primary whitespace-pre-wrap leading-relaxed max-h-[520px] overflow-y-auto">{reframeResult.reframedCopy}</div>
                  </div>
                </div>
              </section>

              <details className="bg-surface-primary border border-border-standard rounded-xl shadow-level-1" open={reframeResult.evidenceWarnings.length > 0}>
                <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between text-[11px] font-semibold text-text-primary">
                  <span>What changed and what stayed protected</span>
                  <ChevronDown size={12} className="text-text-muted" />
                </summary>
                <div className="border-t border-border-standard p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-testid="reframe-changed-explanation">
                    <div className="text-[10px] font-semibold text-brand-gold mb-1.5">Changed</div>
                    <ul className="list-disc pl-4 space-y-1 text-[10.5px] text-text-secondary">{reframeResult.changedExplanation.map((item, index) => <li key={index}>{item}</li>)}</ul>
                  </div>
                  <div data-testid="reframe-preserved-explanation">
                    <div className="text-[10px] font-semibold text-status-success mb-1.5">Preserved</div>
                    <ul className="list-disc pl-4 space-y-1 text-[10.5px] text-text-secondary">{reframeResult.preservedExplanation.map((item, index) => <li key={index}>{item}</li>)}</ul>
                  </div>
                </div>
                {reframeResult.evidenceWarnings.length > 0 && (
                  <div data-testid="reframe-evidence-warnings" className="mx-4 mb-4 p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/25 text-[10.5px] text-text-primary">
                    <strong>Evidence notice:</strong> {reframeResult.evidenceWarnings.join(' · ')}
                  </div>
                )}
              </details>

              <div className="bg-surface-primary border border-border-standard rounded-xl p-3 flex flex-wrap items-center justify-end gap-2 shadow-level-1">
                <button data-testid="reframe-save-library-btn" onClick={() => saveOrSend('save')} className="h-9 px-3 rounded-lg border border-border-standard bg-surface-primary text-xs font-semibold text-text-primary inline-flex items-center gap-1.5">
                  <BookmarkPlus size={13} className="text-brand-gold" /> {savedNotice ? 'Saved' : 'Save as New'}
                </button>
                <button data-testid="reframe-send-workspace-btn" onClick={() => saveOrSend('send')} className="h-9 px-4 rounded-lg bg-brand-gold text-text-inverse text-xs font-semibold hover:bg-brand-gold-hover inline-flex items-center gap-1.5">
                  <Send size={13} /> Use in Content Workspace
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-inset/55 border border-dashed border-border-strong rounded-xl min-h-[460px] p-10 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-11 h-11 rounded-full bg-surface-primary border border-border-standard flex items-center justify-center"><Compass size={20} className="text-brand-gold" /></div>
              <h3 className="text-sm font-semibold text-text-primary">Your reframe will appear here</h3>
              <p className="text-[11.5px] text-text-secondary max-w-sm">Add source content, describe what it should become, review the short transformation summary, and generate.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
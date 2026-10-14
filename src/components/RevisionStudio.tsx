import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Wand2,
  Sparkles,
  Layers,
  Plus,
  Check
} from 'lucide-react';
import { Button } from './ui/Button';
import { LANGUAGES, getLanguageDirection } from '../lib/languages';
import { compileGovernedContext, extractWorkContextFromWorkItem } from '../lib/contextCompiler';
import { ContextManifestPanel } from './ContextManifestPanel';
import {
  REVISION_ACTIONS,
  REVISION_GROUP_ORDER,
  type RevisionActionDef,
  type RevisionActionGroup
} from '../lib/revisionActions';
import {
  suggestRevisionActions,
  compileRevisionRecipe,
  executeDeterministicRevisionRecipe,
  validateRevisionTranslationOutput,
  cleanTypographyArtifacts
} from '../lib/smartBriefAndRevision';

export { REVISION_ACTIONS, REVISION_GROUP_ORDER };
export type { RevisionActionDef, RevisionActionGroup };

export interface RevisionState {
  sourceType: 'manual' | 'contentWorkspace' | 'contentLibrary' | null;
  sourceTitle: string;
  originalDraft: string;
  currentDraft: string;
  revisedOutput: string;
  channel: string;
  format: string;
  targetLanguage: string;
  tone: string;
  optionalContext: string;
  selectedAction: string | null;
  appliedControls: string;
  versionHistory: Array<{ version: number; text: string; timestamp: string; actionUsed: string }>;
  isGenerating: boolean;
  error: string | null;
  settingsChangedAfterRevision: boolean;
  revisionSource?: 'current' | 'original';
}

const DEFAULT_REVISION_STATE: RevisionState = {
  sourceType: null,
  sourceTitle: '',
  originalDraft: '',
  currentDraft: '',
  revisedOutput: '',
  channel: 'General / Custom',
  format: 'General / Custom',
  targetLanguage: 'English',
  tone: 'Balanced / COH Default',
  optionalContext: '',
  selectedAction: null,
  appliedControls: '',
  versionHistory: [],
  isGenerating: false,
  error: null,
  settingsChangedAfterRevision: false,
  revisionSource: 'current'
};

interface RevisionStudioProps {
  initialDraft?: string;
  initialSourceType?: RevisionState['sourceType'];
  initialSourceTitle?: string;
  operatingCore: any;
  coreDocuments?: any[];
  activeWorkItem?: any;
  theme?: 'light' | 'dark';
  aiStatus: string;
  generationMode: string;
  aiService: any;
  onSaveToLibrary: (item: any) => void;
  onNavigateToLibrary: () => void;
}

export function RevisionStudio({
  initialDraft,
  initialSourceType,
  initialSourceTitle,
  operatingCore,
  coreDocuments = [],
  activeWorkItem = null,
  theme = 'light',
  aiStatus,
  generationMode,
  aiService,
  onSaveToLibrary,
  onNavigateToLibrary
}: RevisionStudioProps) {
  const [state, setState] = useState<RevisionState>(DEFAULT_REVISION_STATE);
  const [customInstruction, setCustomInstruction] = useState('');
  const [selectedRecipeActions, setSelectedRecipeActions] = useState<string[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [cleanNote, setCleanNote] = useState('');

  const inheritedWorkContext = useMemo(
    () => extractWorkContextFromWorkItem(activeWorkItem),
    [activeWorkItem]
  );

  // Draft-dependent suggested revision actions (Part C)
  const suggestedActions = useMemo(
    () =>
      suggestRevisionActions(state.currentDraft, {
        targetLanguage: state.targetLanguage,
        channel: state.channel !== 'General / Custom' ? state.channel : undefined,
        hasAttachedSources: Boolean(inheritedWorkContext?.sourceBindings?.length || activeWorkItem?.sourceIds?.length)
      }),
    [state.currentDraft, state.targetLanguage, state.channel, inheritedWorkContext, activeWorkItem]
  );

  // Compiled multi-action Revision Recipe & conflict check (Part C & D)
  const compiledRecipe = useMemo(
    () =>
      compileRevisionRecipe(selectedRecipeActions, {
        channel: state.channel,
        format: state.format,
        targetLanguage: state.targetLanguage,
        tone: state.tone,
        optionalContext: state.optionalContext,
        customInstruction
      }),
    [
      selectedRecipeActions,
      state.channel,
      state.format,
      state.targetLanguage,
      state.tone,
      state.optionalContext,
      customInstruction
    ]
  );

  const activeContextPackage = useMemo(() => {
    const channelVal = state.channel !== 'General / Custom' ? state.channel : undefined;
    const formatVal = state.format !== 'General / Custom' ? state.format : undefined;
    return compileGovernedContext({
      workflow: 'Revision Studio',
      operatingCore,
      coreDocuments,
      action: selectedRecipeActions.length > 0 ? selectedRecipeActions.join(', ') : state.selectedAction || undefined,
      channel: channelVal,
      format: formatVal,
      language: state.targetLanguage,
      communicationJob: state.optionalContext || undefined,
      userInstruction: customInstruction || state.optionalContext || undefined,
      inheritedWorkContext,
      explicitFields: {
        channel: Boolean(channelVal),
        format: Boolean(formatVal),
        language: Boolean(state.targetLanguage),
        communicationJob: Boolean(state.optionalContext)
      }
    });
  }, [
    operatingCore,
    coreDocuments,
    selectedRecipeActions,
    state.selectedAction,
    state.channel,
    state.format,
    state.targetLanguage,
    state.optionalContext,
    customInstruction,
    inheritedWorkContext
  ]);

  // Handle incoming props initialization
  useEffect(() => {
    if (initialDraft && initialDraft !== state.originalDraft) {
      setState(prev => ({
        ...DEFAULT_REVISION_STATE,
        channel: prev.channel,
        format: prev.format,
        targetLanguage: prev.targetLanguage,
        tone: prev.tone,
        sourceType: initialSourceType || 'manual',
        sourceTitle: initialSourceTitle || 'Imported Draft',
        originalDraft: initialDraft,
        currentDraft: initialDraft,
        versionHistory: [
          {
            version: 1,
            text: initialDraft,
            timestamp: new Date().toLocaleTimeString(),
            actionUsed: 'Imported Draft'
          }
        ]
      }));
    }
  }, [initialDraft, initialSourceType, initialSourceTitle]);

  const updateSetting = (key: keyof RevisionState, value: any) => {
    setState(prev => ({
      ...prev,
      [key]: value,
      settingsChangedAfterRevision: prev.revisedOutput !== '' ? true : prev.settingsChangedAfterRevision
    }));
  };

  const toggleRecipeAction = (actionId: string) => {
    setSelectedRecipeActions(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    );
  };

  const runRevisionRecipe = async (actionIdsToRun: string[]) => {
    const baseText = state.revisionSource === 'original' ? state.originalDraft : state.currentDraft;
    if (state.isGenerating || !baseText.trim()) return;

    const recipe = compileRevisionRecipe(actionIdsToRun, {
      channel: state.channel,
      format: state.format,
      targetLanguage: state.targetLanguage,
      tone: state.tone,
      optionalContext: state.optionalContext,
      customInstruction
    });

    if (recipe.hasBlockingConflict) {
      const blockingMsg = recipe.conflicts.find(c => c.severity === 'blocking')?.message;
      setState(prev => ({
        ...prev,
        error: blockingMsg || 'Please resolve conflicting revision actions before running.'
      }));
      return;
    }

    const primaryActionId = actionIdsToRun[0] || 'custom-instruction';
    setState(prev => ({
      ...prev,
      isGenerating: true,
      selectedAction: primaryActionId,
      error: null,
      settingsChangedAfterRevision: false
    }));

    let revised = baseText;
    const actionLabel = recipe.summaryLabel;

    try {
      if (actionIdsToRun.length === 1 && actionIdsToRun[0] === 'clean-ai-punctuation' && !customInstruction.trim()) {
        revised = cleanTypographyArtifacts(baseText);
        setCleanNote('Cleaned punctuation and hidden characters.');
        setTimeout(() => setCleanNote(''), 4000);
      } else if (generationMode === 'ai' && aiStatus === 'connected') {
        const revisionContextPkg = compileGovernedContext({
          workflow: 'Revision Studio',
          operatingCore,
          coreDocuments,
          action: actionIdsToRun.join(', '),
          channel: state.channel !== 'General / Custom' ? state.channel : undefined,
          format: state.format !== 'General / Custom' ? state.format : undefined,
          language: state.targetLanguage,
          communicationJob: state.optionalContext || undefined,
          userInstruction: recipe.compiledInstruction,
          inheritedWorkContext,
          transformationIntent: actionLabel
        });

        try {
          const result = await aiService.revise({
            previousDraft: baseText,
            rawInput: state.optionalContext,
            channel: state.channel,
            outputFormat: state.format,
            audience: revisionContextPkg.manifest.audience.value || 'General Public',
            purpose: state.optionalContext || 'General Revision',
            language: state.targetLanguage,
            tone: state.tone,
            selectedRevisionAction: actionIdsToRun.join('+'),
            revisionInstruction: recipe.compiledInstruction,
            operatingCoreInstructions: revisionContextPkg.compiledInstructions
          });

          if (result && result.revisedCopy) {
            const candidateRevised = cleanTypographyArtifacts(result.revisedCopy);
            if (recipe.requiresAiExecution) {
              const langCheck = validateRevisionTranslationOutput({
                revisedCopy: candidateRevised,
                previousDraft: baseText,
                targetLanguage: state.targetLanguage,
                actionIds: actionIdsToRun
              });
              if (!langCheck.valid) {
                throw new Error(langCheck.reason || 'Translation validation failed.');
              }
            }
            revised = candidateRevised;
          } else {
            if (recipe.requiresAiExecution) {
              throw new Error(
                `AI Translation Failed: Provider did not return valid ${state.targetLanguage} copy. Your current draft has been preserved.`
              );
            }
            revised = executeDeterministicRevisionRecipe(baseText, recipe, {
              channel: state.channel,
              format: state.format,
              targetLanguage: state.targetLanguage,
              tone: state.tone,
              customInstruction
            });
          }
        } catch (aiErr: any) {
          if (recipe.requiresAiExecution) {
            throw aiErr;
          }
          revised = executeDeterministicRevisionRecipe(baseText, recipe, {
            channel: state.channel,
            format: state.format,
            targetLanguage: state.targetLanguage,
            tone: state.tone,
            customInstruction
          });
        }
      } else {
        // Deterministic local execution for deterministic-safe actions; throws if recipe.requiresAiExecution is true
        revised = executeDeterministicRevisionRecipe(baseText, recipe, {
          channel: state.channel,
          format: state.format,
          targetLanguage: state.targetLanguage,
          tone: state.tone,
          customInstruction
        });
      }

      if (customInstruction.trim()) {
        setCustomInstruction('');
      }

      const appliedLabel = `${actionLabel} | ${state.channel} | ${state.format} | ${state.targetLanguage}`;

      setState(prev => ({
        ...prev,
        revisedOutput: revised,
        appliedControls: appliedLabel,
        isGenerating: false,
        versionHistory: [
          ...prev.versionHistory,
          {
            version: prev.versionHistory.length + 1,
            text: revised,
            timestamp: new Date().toLocaleTimeString(),
            actionUsed: appliedLabel
          }
        ]
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: err.message || 'Error applying revision.'
      }));
    }
  };

  const runRevision = async (action: string) => {
    if (action === 'custom-instruction') {
      await runRevisionRecipe(selectedRecipeActions);
    } else {
      await runRevisionRecipe([action]);
    }
  };

  const handleStartNew = () => {
    setSelectedRecipeActions([]);
    setState(prev => ({
      ...DEFAULT_REVISION_STATE,
      channel: prev.channel,
      format: prev.format,
      targetLanguage: prev.targetLanguage,
      tone: prev.tone
    }));
  };

  const handleClearDraft = () => {
    setSelectedRecipeActions([]);
    setState(prev => ({ ...prev, currentDraft: '', revisedOutput: '' }));
  };

  const handleUseAsCurrent = () => {
    setState(prev => ({
      ...prev,
      currentDraft: prev.revisedOutput,
      revisedOutput: '',
      settingsChangedAfterRevision: false
    }));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(state.revisedOutput || state.currentDraft);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSaveAsNew = () => {
    onSaveToLibrary({
      id: `rev-${Date.now()}`,
      title: `${state.sourceTitle || 'Revision'} - ${new Date().toLocaleDateString()}`,
      type: 'Text',
      status: 'Draft',
      notes: state.appliedControls,
      content: state.revisedOutput || state.currentDraft,
      dateAdded: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="page-shell space-y-4" data-testid="revision-studio-root">
      <div className="bg-surface-primary border border-border-standard p-5 rounded-xl shadow-level-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="page-title">Revision Studio</h2>
          <p className="page-subtitle">
            Refine, polish, combine governed revision recipes, and localize content across your ecosystem.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartNew} variant="outline" className="text-xs flex items-center gap-1.5">
            <RefreshCcw size={13} /> Start New Revision
          </Button>
          <Button onClick={onNavigateToLibrary} variant="secondary" className="text-xs flex items-center gap-1.5">
            Library <ChevronRight size={13} />
          </Button>
        </div>
      </div>

      <ContextManifestPanel manifest={activeContextPackage.manifest} theme={theme} />

      <div className="flex flex-col lg:flex-row gap-5 min-h-[calc(100vh-180px)]">
        {/* Left Side: Work Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-surface-primary rounded-xl border border-border-standard shadow-level-1 overflow-hidden">
          {/* Top Controls */}
          <div className="bg-surface-inset/70 border-b border-border-standard px-4 py-3 shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-text-muted mb-1">Channel</label>
                <select
                  data-testid="revision-channel-select"
                  value={state.channel}
                  onChange={e => updateSetting('channel', e.target.value)}
                  className="w-full bg-surface-primary border border-border-standard px-2.5 py-1.5 rounded-lg text-[11.5px] text-text-primary"
                >
                  {[
                    'General / Custom',
                    'LinkedIn',
                    'Twitter',
                    'Email Newsletter',
                    'Blog Post',
                    'Press Release',
                    'Website Copy'
                  ].map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-text-muted mb-1">Format</label>
                <select
                  data-testid="revision-format-select"
                  value={state.format}
                  onChange={e => updateSetting('format', e.target.value)}
                  className="w-full bg-surface-primary border border-border-standard px-2.5 py-1.5 rounded-lg text-[11.5px] text-text-primary"
                >
                  {['General / Custom', 'Paragraphs', 'Bullet Points', 'Executive Summary', 'Action Items'].map(
                    opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-text-muted mb-1">Language</label>
                <select
                  data-testid="revision-language-select"
                  value={state.targetLanguage}
                  onChange={e => updateSetting('targetLanguage', e.target.value)}
                  className="w-full bg-surface-primary border border-border-standard px-2.5 py-1.5 rounded-lg text-[11.5px] text-text-primary"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.id} value={l.label}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-text-muted mb-1">Tone</label>
                <select
                  data-testid="revision-tone-select"
                  value={state.tone}
                  onChange={e => updateSetting('tone', e.target.value)}
                  className="w-full bg-surface-primary border border-border-standard px-2.5 py-1.5 rounded-lg text-[11.5px] text-text-primary"
                >
                  {[
                    'Balanced / COH Default',
                    'Professional',
                    'Conversational',
                    'Persuasive',
                    'Urgent',
                    'Inspirational'
                  ].map(opt => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[10px] uppercase font-semibold tracking-wider text-text-muted mb-1">
                  Optional Context
                </label>
                <input
                  type="text"
                  value={state.optionalContext}
                  onChange={e => updateSetting('optionalContext', e.target.value)}
                  placeholder="Additional context..."
                  className="w-full bg-surface-primary border border-border-standard px-2.5 py-1.5 rounded-lg text-[11.5px] text-text-primary"
                />
              </div>
            </div>

            {cleanNote && (
              <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                {cleanNote}
              </div>
            )}

            {state.settingsChangedAfterRevision && (
              <div
                data-testid="revision-settings-changed-banner"
                className="mt-3 bg-amber-500/10 text-amber-800 dark:text-amber-200 p-3 text-xs rounded-lg border border-amber-500/30 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>Settings changed. Generate a new revision to apply them.</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 bg-surface-primary px-2.5 py-1.5 rounded-lg border border-border-standard">
                    <span className="font-semibold text-text-primary">Revise from:</span>
                    <select
                      data-testid="revision-source-selector"
                      className="bg-surface-inset border border-border-standard text-text-primary text-[11px] px-2 py-0.5 rounded outline-none"
                      onChange={e => updateSetting('revisionSource', e.target.value)}
                      value={state.revisionSource || 'current'}
                    >
                      <option value="current">Current version</option>
                      <option value="original">Original text</option>
                    </select>
                  </div>
                  <Button
                    variant="primary"
                    className="text-xs py-1.5"
                    onClick={() =>
                      runRevisionRecipe(
                        selectedRecipeActions.length > 0
                          ? selectedRecipeActions
                          : [state.selectedAction || 'improve-clarity']
                      )
                    }
                  >
                    Generate New Revision
                  </Button>
                </div>
              </div>
            )}
            {state.error && (
              <div
                data-testid="revision-error-alert"
                className="mt-3 bg-status-error/10 text-status-error p-2.5 text-xs rounded-lg border border-status-error/30 flex items-center gap-2"
              >
                <AlertTriangle size={14} />
                {state.error}
              </div>
            )}
          </div>

          {/* Split View Editors */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
            {/* Draft to Revise */}
            <div
              className={`flex-1 flex flex-col border-b md:border-b-0 md:border-r border-border-standard ${
                state.revisedOutput ? 'md:w-1/2' : 'w-full'
              }`}
            >
              <div className="bg-surface-primary px-4 py-2.5 border-b border-border-standard flex justify-between items-center shrink-0">
                <span className="text-[11px] uppercase font-semibold text-text-secondary tracking-wider">
                  Draft to Revise
                </span>
                <button
                  onClick={handleClearDraft}
                  className="text-[11px] text-text-muted hover:text-status-error font-semibold transition-colors"
                >
                  Clear
                </button>
              </div>
              <textarea
                data-testid="revision-draft-textarea"
                value={state.currentDraft}
                onChange={e => updateSetting('currentDraft', e.target.value)}
                placeholder="Paste or type content here to begin revising..."
                className="flex-1 p-5 bg-surface-primary border-none resize-none focus:ring-0 focus:outline-none text-[14px] leading-relaxed text-text-primary whitespace-pre-wrap min-h-[280px]"
                dir={getLanguageDirection(state.currentDraft.slice(0, 100))}
              />
            </div>

            {/* Revised Output (Only shows if generated) */}
            {state.revisedOutput && (
              <div
                data-testid="revision-output-panel"
                className="flex-1 flex flex-col md:w-1/2 bg-surface-inset/40"
              >
                <div className="bg-surface-inset px-4 py-2.5 border-b border-border-standard flex justify-between items-center shrink-0">
                  <span className="text-[11px] uppercase font-semibold text-brand-gold tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-brand-gold" />
                    Revised Output
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      data-testid="revision-use-as-draft-btn"
                      onClick={handleUseAsCurrent}
                      className="text-[11px] bg-brand-gold text-text-inverse hover:bg-brand-gold-hover px-2.5 py-1 rounded-md font-semibold transition-colors"
                    >
                      Use as Draft
                    </button>
                    <button
                      data-testid="revision-copy-btn"
                      onClick={handleCopy}
                      className="text-[11px] px-2.5 py-1 rounded-md border border-border-standard bg-surface-primary text-text-secondary hover:text-text-primary font-medium flex items-center gap-1 transition-colors"
                    >
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="px-4 py-2 bg-surface-inset/70 border-b border-border-standard">
                  <span data-testid="revision-applied-controls" className="text-[10.5px] text-text-secondary font-mono">
                    Applied: {state.appliedControls}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto p-5">
                  <div
                    data-testid="revision-output-text"
                    className="prose prose-sm max-w-none text-[14px] leading-relaxed text-text-primary whitespace-pre-wrap"
                    dir={getLanguageDirection(state.targetLanguage)}
                  >
                    {state.revisedOutput}
                  </div>
                </div>
                <div className="p-3 bg-surface-primary border-t border-border-standard flex gap-2">
                  <Button
                    data-testid="revision-save-new-btn"
                    onClick={handleSaveAsNew}
                    variant="outline"
                    className="flex-1 text-xs py-2"
                  >
                    <Save size={14} className="mr-1.5 inline" /> Save as New
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Suggested Actions, Multi-Action Recipe Builder & Grouped Actions */}
        <div className="w-full lg:w-[340px] shrink-0 flex flex-col gap-3.5 overflow-y-auto">
          {/* 1. Draft-Dependent Suggested Revision Actions (Part C) */}
          {state.currentDraft.trim() && suggestedActions.length > 0 && (
            <div
              data-testid="suggested-revision-actions"
              className="bg-surface-primary border border-brand-gold/35 p-3.5 rounded-xl shadow-level-1 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-gold flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Suggested for This Draft
                </span>
                <span className="text-[9px] text-text-muted font-mono">Max 3</span>
              </div>
              <div className="space-y-2">
                {suggestedActions.map(sug => {
                  const inRecipe = selectedRecipeActions.includes(sug.actionId);
                  return (
                    <div
                      key={sug.actionId}
                      data-testid={`suggested-action-${sug.actionId}`}
                      className="p-2.5 rounded-lg bg-surface-inset border border-border-standard space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-text-primary">{sug.label}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleRecipeAction(sug.actionId)}
                            className={`text-[10px] px-2 py-0.5 rounded-md border font-medium transition-colors ${
                              inRecipe
                                ? 'bg-brand-gold/20 border-brand-gold text-brand-gold'
                                : 'bg-surface-primary border-border-standard text-text-secondary hover:text-text-primary'
                            }`}
                          >
                            {inRecipe ? '✓ In Recipe' : '+ Recipe'}
                          </button>
                          <button
                            type="button"
                            onClick={() => runRevision(sug.actionId)}
                            disabled={state.isGenerating}
                            className="text-[10px] px-2.5 py-0.5 rounded-md bg-brand-gold text-text-inverse font-semibold hover:bg-brand-gold-hover transition-colors"
                          >
                            Run
                          </button>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-text-secondary leading-snug">{sug.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Multi-Action Revision Recipe Builder & Conflict Detector (Part C & D) */}
          <div
            data-testid="revision-recipe-panel"
            className="bg-surface-primary border border-border-standard p-3.5 rounded-xl shadow-level-1 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-text-primary flex items-center gap-1.5">
                <Layers size={12} className="text-brand-gold" />
                Revision Recipe ({selectedRecipeActions.length})
              </span>
              {selectedRecipeActions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedRecipeActions([])}
                  className="text-[10px] text-text-muted hover:text-status-error font-semibold"
                >
                  Clear Recipe
                </button>
              )}
            </div>

            {selectedRecipeActions.length === 0 ? (
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Select multiple actions below (using the <strong>+</strong> toggle) to combine them into a single governed Revision Recipe ordered automatically by stage.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="text-[10px] text-text-secondary font-semibold">
                  Governed Execution Order:
                </div>
                <ol className="space-y-1 text-[11px]">
                  {compiledRecipe.orderedSteps.map((step, idx) => (
                    <li
                      key={step.actionId}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md bg-surface-inset border border-border-standard"
                    >
                      <span className="truncate text-text-primary">
                        <strong>{idx + 1}.</strong> {step.label}
                        <span className="text-[9px] text-text-muted ml-1">({step.stageName})</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRecipeAction(step.actionId)}
                        className="text-[10px] text-text-muted hover:text-status-error"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Conflict Warnings / Blockers */}
            {compiledRecipe.conflicts.length > 0 && (
              <div
                data-testid="revision-conflict-alert"
                className="p-2.5 rounded-lg bg-status-error/10 border border-status-error/30 text-[11px] text-status-error space-y-1"
              >
                {compiledRecipe.conflicts.map((c, idx) => (
                  <div key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                    <span>
                      <strong>{c.severity === 'blocking' ? 'Conflict:' : 'Advisory:'}</strong> {c.message}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Language Governance Notice (PT-EU / Persian protection) */}
            {compiledRecipe.languageGovernanceNote && (
              <div
                data-testid="revision-language-governance-note"
                className="p-2 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-[10px] text-text-secondary"
              >
                {compiledRecipe.languageGovernanceNote}
              </div>
            )}

            <button
              type="button"
              data-testid="run-revision-recipe-btn"
              disabled={
                state.isGenerating ||
                !state.currentDraft.trim() ||
                (selectedRecipeActions.length === 0 && !customInstruction.trim()) ||
                compiledRecipe.hasBlockingConflict
              }
              onClick={() => runRevisionRecipe(selectedRecipeActions)}
              className="w-full h-9 px-3 rounded-lg bg-brand-gold text-text-inverse font-semibold text-xs hover:bg-brand-gold-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Wand2 size={13} />
              {state.isGenerating
                ? 'Applying Recipe...'
                : `Run Revision Recipe (${selectedRecipeActions.length || (customInstruction.trim() ? 1 : 0)})`}
            </button>
          </div>

          {/* 3. Custom Instruction */}
          <div className="bg-surface-primary border border-border-standard p-3.5 rounded-xl shadow-level-1">
            <label className="block text-[10px] uppercase font-semibold tracking-wider text-text-secondary mb-2">
              Custom Instruction
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                data-testid="revision-custom-instruction-input"
                value={customInstruction}
                onChange={e => setCustomInstruction(e.target.value)}
                placeholder="e.g. Emphasize curatorial longevity"
                className="flex-1 bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-xs text-text-primary"
                onKeyDown={e => e.key === 'Enter' && runRevision('custom-instruction')}
              />
              <button
                data-testid="revision-custom-instruction-btn"
                onClick={() => runRevision('custom-instruction')}
                disabled={!customInstruction.trim() || state.isGenerating}
                className="bg-brand-gold text-text-inverse hover:bg-brand-gold-hover px-2.5 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                <Wand2 size={14} />
              </button>
            </div>
          </div>

          {/* 4. Canonical Action Groups */}
          <div
            className={`space-y-2.5 ${
              !state.currentDraft.trim() || state.isGenerating ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {REVISION_GROUP_ORDER.map(group => {
              const actionsInGroup = REVISION_ACTIONS.filter(a => a.group === group);
              if (actionsInGroup.length === 0) return null;

              const isExpandedDefault = [
                'Clean & Polish',
                'Translation & Localization',
                'COH & Strategic Fit',
                'Evidence & Claim Discipline'
              ].includes(group);

              return (
                <details
                  key={group}
                  className="border border-border-standard rounded-xl bg-surface-primary shadow-level-1 overflow-hidden"
                  open={isExpandedDefault}
                >
                  <summary className="bg-surface-inset/70 px-3.5 py-2 text-[10.5px] uppercase font-semibold text-text-secondary tracking-wider cursor-pointer select-none hover:text-text-primary transition flex justify-between items-center">
                    {group}
                  </summary>
                  <div className="p-2.5 space-y-1.5 bg-surface-primary border-t border-border-standard">
                    {actionsInGroup.map(actionDef => {
                      const inRecipe = selectedRecipeActions.includes(actionDef.id);
                      return (
                        <div key={actionDef.id} className="flex items-center gap-1.5">
                          <button
                            type="button"
                            data-testid={`recipe-toggle-${actionDef.id}`}
                            onClick={() => toggleRecipeAction(actionDef.id)}
                            title={inRecipe ? 'Remove from Recipe' : 'Add to Multi-Action Recipe'}
                            className={`px-2 py-1.5 rounded-md text-xs font-semibold border transition-colors shrink-0 ${
                              inRecipe
                                ? 'bg-brand-gold text-text-inverse border-brand-gold'
                                : 'bg-surface-inset text-text-secondary border-border-standard hover:border-brand-gold'
                            }`}
                          >
                            {inRecipe ? <Check size={12} /> : <Plus size={12} />}
                          </button>
                          <button
                            type="button"
                            data-testid={`run-action-${actionDef.id}`}
                            disabled={state.isGenerating}
                            onClick={() => runRevision(actionDef.id)}
                            title={actionDef.description}
                            className="flex-1 text-left px-3 py-1.5 rounded-md text-xs font-medium text-text-primary bg-surface-inset hover:bg-brand-gold/15 hover:border-brand-gold transition-colors border border-border-standard truncate"
                          >
                            {actionDef.label}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

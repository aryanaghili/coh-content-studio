import React, { useState, useEffect, useMemo } from 'react';
import {
  RefreshCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Wand2,
  Sparkles,
  Plus,
  Check,
  SlidersHorizontal,
  Copy
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

  const inheritedWorkContext = useMemo(() => extractWorkContextFromWorkItem(activeWorkItem), [activeWorkItem]);

  const suggestedActions = useMemo(
    () => suggestRevisionActions(state.currentDraft, {
      targetLanguage: state.targetLanguage,
      channel: state.channel !== 'General / Custom' ? state.channel : undefined,
      hasAttachedSources: Boolean(inheritedWorkContext?.sourceBindings?.length || activeWorkItem?.sourceIds?.length)
    }),
    [state.currentDraft, state.targetLanguage, state.channel, inheritedWorkContext, activeWorkItem]
  );

  const compiledRecipe = useMemo(
    () => compileRevisionRecipe(selectedRecipeActions, {
      channel: state.channel,
      format: state.format,
      targetLanguage: state.targetLanguage,
      tone: state.tone,
      optionalContext: state.optionalContext,
      customInstruction
    }),
    [selectedRecipeActions, state.channel, state.format, state.targetLanguage, state.tone, state.optionalContext, customInstruction]
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
  }, [operatingCore, coreDocuments, selectedRecipeActions, state.selectedAction, state.channel, state.format, state.targetLanguage, state.optionalContext, customInstruction, inheritedWorkContext]);

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
        versionHistory: [{ version: 1, text: initialDraft, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Imported Draft' }]
      }));
    }
  }, [initialDraft, initialSourceType, initialSourceTitle]);

  const updateSetting = (key: keyof RevisionState, value: any) => {
    setState(prev => ({ ...prev, [key]: value, settingsChangedAfterRevision: prev.revisedOutput !== '' ? true : prev.settingsChangedAfterRevision }));
  };

  const toggleRecipeAction = (actionId: string) => {
    setSelectedRecipeActions(prev => prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]);
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
      setState(prev => ({ ...prev, error: recipe.conflicts.find(c => c.severity === 'blocking')?.message || 'Please resolve conflicting revision actions before running.' }));
      return;
    }

    const primaryActionId = actionIdsToRun[0] || 'custom-instruction';
    setState(prev => ({ ...prev, isGenerating: true, selectedAction: primaryActionId, error: null, settingsChangedAfterRevision: false }));

    let revised = baseText;
    const actionLabel = recipe.summaryLabel;

    try {
      if (actionIdsToRun.length === 1 && actionIdsToRun[0] === 'clean-ai-punctuation' && !customInstruction.trim()) {
        revised = cleanTypographyArtifacts(baseText);
        setCleanNote('Cleaned punctuation and hidden characters.');
        setTimeout(() => setCleanNote(''), 4000);
      } else if (generationMode === 'ai' && aiStatus === 'connected') {
        const revisionContextPkg = compileGovernedContext({
          workflow: 'Revision Studio', operatingCore, coreDocuments,
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
            const candidate = cleanTypographyArtifacts(result.revisedCopy);
            if (recipe.requiresAiExecution) {
              const check = validateRevisionTranslationOutput({ revisedCopy: candidate, previousDraft: baseText, targetLanguage: state.targetLanguage, actionIds: actionIdsToRun });
              if (!check.valid) throw new Error(check.reason || 'Translation validation failed.');
            }
            revised = candidate;
          } else if (recipe.requiresAiExecution) {
            throw new Error(`AI Translation Failed: Provider did not return valid ${state.targetLanguage} copy. Your current draft has been preserved.`);
          } else {
            revised = executeDeterministicRevisionRecipe(baseText, recipe, { channel: state.channel, format: state.format, targetLanguage: state.targetLanguage, tone: state.tone, customInstruction });
          }
        } catch (aiErr: any) {
          if (recipe.requiresAiExecution) throw aiErr;
          revised = executeDeterministicRevisionRecipe(baseText, recipe, { channel: state.channel, format: state.format, targetLanguage: state.targetLanguage, tone: state.tone, customInstruction });
        }
      } else {
        revised = executeDeterministicRevisionRecipe(baseText, recipe, { channel: state.channel, format: state.format, targetLanguage: state.targetLanguage, tone: state.tone, customInstruction });
      }

      if (customInstruction.trim()) setCustomInstruction('');
      const appliedLabel = `${actionLabel} | ${state.channel} | ${state.format} | ${state.targetLanguage}`;
      setState(prev => ({
        ...prev,
        revisedOutput: revised,
        appliedControls: appliedLabel,
        isGenerating: false,
        versionHistory: [...prev.versionHistory, { version: prev.versionHistory.length + 1, text: revised, timestamp: new Date().toLocaleTimeString(), actionUsed: appliedLabel }]
      }));
    } catch (err: any) {
      setState(prev => ({ ...prev, isGenerating: false, error: err.message || 'Error applying revision.' }));
    }
  };

  const runRevision = async (action: string) => {
    if (action === 'custom-instruction') await runRevisionRecipe(selectedRecipeActions);
    else await runRevisionRecipe([action]);
  };

  const handleStartNew = () => {
    setSelectedRecipeActions([]);
    setCustomInstruction('');
    setState(prev => ({ ...DEFAULT_REVISION_STATE, channel: prev.channel, format: prev.format, targetLanguage: prev.targetLanguage, tone: prev.tone }));
  };
  const handleClearDraft = () => { setSelectedRecipeActions([]); setState(prev => ({ ...prev, currentDraft: '', revisedOutput: '' })); };
  const handleUseAsCurrent = () => setState(prev => ({ ...prev, currentDraft: prev.revisedOutput, revisedOutput: '', settingsChangedAfterRevision: false }));
  const handleCopy = () => { navigator.clipboard.writeText(state.revisedOutput || state.currentDraft); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); };
  const handleSaveAsNew = () => onSaveToLibrary({ id: `rev-${Date.now()}`, title: `${state.sourceTitle || 'Revision'} - ${new Date().toLocaleDateString()}`, type: 'Text', status: 'Draft', notes: state.appliedControls, content: state.revisedOutput || state.currentDraft, dateAdded: new Date().toISOString().split('T')[0] });

  const selectedLabels = selectedRecipeActions.map(id => REVISION_ACTIONS.find(a => a.id === id)?.label || id);
  const canRun = Boolean(state.currentDraft.trim() && (selectedRecipeActions.length > 0 || customInstruction.trim()) && !compiledRecipe.hasBlockingConflict && !state.isGenerating);

  return (
    <div className="page-shell space-y-4" data-testid="revision-studio-root">
      <div className="bg-surface-primary border border-border-standard p-5 rounded-xl shadow-level-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="page-title">Revision Studio</h2>
          <p className="page-subtitle">Keep the same communication job. Improve the writing, structure, format, tone, or language.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartNew} variant="outline" className="text-xs flex items-center gap-1.5"><RefreshCcw size={13} /> Start New</Button>
          <Button onClick={onNavigateToLibrary} variant="secondary" className="text-xs flex items-center gap-1.5">Library <ChevronRight size={13} /></Button>
        </div>
      </div>

      <ContextManifestPanel manifest={activeContextPackage.manifest} theme={theme} />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div className="xl:col-span-7 space-y-4">
          <section className="bg-surface-primary border border-border-standard rounded-xl shadow-level-1 overflow-hidden">
            <div className="px-4 py-3 border-b border-border-standard flex items-center justify-between gap-2">
              <div><span className="text-[11px] font-semibold text-brand-gold">1. Draft</span><p className="text-[11px] text-text-muted mt-0.5">Paste, type, or use the draft carried from another workspace.</p></div>
              <button onClick={handleClearDraft} className="text-[10.5px] text-text-muted hover:text-status-error">Clear</button>
            </div>
            <textarea data-testid="revision-draft-textarea" value={state.currentDraft} onChange={e => updateSetting('currentDraft', e.target.value)} placeholder="Paste or type content here to revise..." className="w-full min-h-[320px] p-5 bg-surface-primary border-0 resize-y focus:ring-0 focus:outline-none text-[14px] leading-relaxed text-text-primary" dir={getLanguageDirection(state.currentDraft.slice(0, 100))} />
          </section>

          {state.revisedOutput && (
            <section data-testid="revision-output-panel" className="bg-surface-primary border border-brand-gold/35 rounded-xl shadow-level-1 overflow-hidden">
              <div className="px-4 py-3 border-b border-border-standard flex flex-wrap items-center justify-between gap-2 bg-brand-gold/5">
                <div><span className="text-[11px] font-semibold text-brand-gold inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> 3. Revised Result</span><div data-testid="revision-applied-controls" className="text-[10px] text-text-muted mt-0.5">{state.appliedControls}</div></div>
                <div className="flex gap-2">
                  <button data-testid="revision-copy-btn" onClick={handleCopy} className="h-8 px-2.5 rounded-lg border border-border-standard bg-surface-primary text-[10.5px] text-text-secondary inline-flex items-center gap-1"><Copy size={11} /> {copySuccess ? 'Copied' : 'Copy'}</button>
                  <button data-testid="revision-use-as-draft-btn" onClick={handleUseAsCurrent} className="h-8 px-2.5 rounded-lg bg-brand-gold text-text-inverse text-[10.5px] font-semibold">Use as Draft</button>
                </div>
              </div>
              <div data-testid="revision-output-text" className="p-5 min-h-[220px] text-[14px] leading-relaxed text-text-primary whitespace-pre-wrap" dir={getLanguageDirection(state.targetLanguage)}>{state.revisedOutput}</div>
              <div className="px-4 py-3 border-t border-border-standard"><Button data-testid="revision-save-new-btn" onClick={handleSaveAsNew} variant="outline" className="text-xs"><Save size={13} className="mr-1.5 inline" /> Save as New</Button></div>
            </section>
          )}
        </div>

        <div className="xl:col-span-5 space-y-4">
          <section className="bg-surface-primary border border-border-standard rounded-xl shadow-level-1 p-4 space-y-3" data-testid="revision-recipe-panel">
            <div>
              <span className="text-[11px] font-semibold text-brand-gold">2. What should change?</span>
              <p className="text-[11px] text-text-secondary mt-1">Choose one suggestion, combine a few changes, or simply describe what you want.</p>
            </div>

            {state.currentDraft.trim() && suggestedActions.length > 0 && (
              <div data-testid="suggested-revision-actions" className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-2">
                {suggestedActions.slice(0, 3).map(sug => {
                  const inRecipe = selectedRecipeActions.includes(sug.actionId);
                  return (
                    <button key={sug.actionId} data-testid={`suggested-action-${sug.actionId}`} type="button" onClick={() => toggleRecipeAction(sug.actionId)} className={`text-left p-3 rounded-lg border transition-colors ${inRecipe ? 'border-brand-gold bg-brand-gold/10' : 'border-border-standard bg-surface-inset hover:border-brand-gold/50'}`}>
                      <div className="flex items-center justify-between gap-2"><span className="text-[11.5px] font-semibold text-text-primary">{sug.label}</span>{inRecipe ? <Check size={12} className="text-brand-gold" /> : <Plus size={12} className="text-text-muted" />}</div>
                      <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{sug.reason}</p>
                    </button>
                  );
                })}
              </div>
            )}

            <div>
              <label className="text-[10.5px] font-semibold text-text-secondary">Or describe the revision</label>
              <div className="mt-1.5 flex gap-2">
                <input data-testid="revision-custom-instruction-input" value={customInstruction} onChange={e => setCustomInstruction(e.target.value)} onKeyDown={e => e.key === 'Enter' && canRun && runRevision('custom-instruction')} placeholder="e.g. Make this 25% shorter and more institutional" className="flex-1 bg-surface-inset border border-border-standard px-3 py-2 rounded-lg text-xs text-text-primary" />
                <button data-testid="revision-custom-instruction-btn" onClick={() => runRevision('custom-instruction')} disabled={!customInstruction.trim() || state.isGenerating || !state.currentDraft.trim()} className="h-9 w-9 rounded-lg bg-surface-inset border border-border-standard text-brand-gold disabled:opacity-40 flex items-center justify-center"><Wand2 size={14} /></button>
              </div>
            </div>

            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">{selectedRecipeActions.map((id, idx) => <button key={id} type="button" onClick={() => toggleRecipeAction(id)} className="px-2 py-1 rounded-md bg-brand-gold/10 border border-brand-gold/30 text-[10px] text-brand-gold">{selectedLabels[idx]} ×</button>)}</div>
            )}

            {compiledRecipe.conflicts.length > 0 && (
              <div data-testid="revision-conflict-alert" className="p-2.5 rounded-lg bg-status-error/10 border border-status-error/30 text-[10.5px] text-status-error space-y-1">{compiledRecipe.conflicts.map((c, idx) => <div key={idx} className="flex items-start gap-1.5"><AlertTriangle size={11} className="mt-0.5 shrink-0" /><span>{c.message}</span></div>)}</div>
            )}
            {compiledRecipe.languageGovernanceNote && <div data-testid="revision-language-governance-note" className="p-2 rounded-lg bg-brand-gold/10 border border-brand-gold/25 text-[10px] text-text-secondary">{compiledRecipe.languageGovernanceNote}</div>}
            {cleanNote && <div className="text-[10.5px] text-status-success font-semibold">{cleanNote}</div>}
            {state.error && <div data-testid="revision-error-alert" className="p-2.5 rounded-lg bg-status-error/10 border border-status-error/30 text-[10.5px] text-status-error flex items-start gap-1.5"><AlertTriangle size={11} className="mt-0.5" />{state.error}</div>}

            <button data-testid="run-revision-recipe-btn" type="button" disabled={!canRun} onClick={() => runRevisionRecipe(selectedRecipeActions)} className="w-full h-10 rounded-lg bg-brand-gold text-text-inverse font-semibold text-xs hover:bg-brand-gold-hover disabled:opacity-40 flex items-center justify-center gap-1.5">
              <Sparkles size={13} /> {state.isGenerating ? 'Revising...' : 'Apply Revision'}
            </button>
          </section>

          <details className="bg-surface-primary border border-border-standard rounded-xl shadow-level-1">
            <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between gap-2 text-[11.5px] font-semibold text-text-primary"><span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={13} className="text-brand-gold" /> Advanced revision controls</span><ChevronDown size={13} className="text-text-muted" /></summary>
            <div className="border-t border-border-standard p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-[10px] text-text-muted">Channel</label><select data-testid="revision-channel-select" value={state.channel} onChange={e => updateSetting('channel', e.target.value)} className="w-full mt-1 bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-[11px] text-text-primary">{['General / Custom','LinkedIn','Twitter','Email Newsletter','Blog Post','Press Release','Website Copy'].map(opt => <option key={opt}>{opt}</option>)}</select></div>
                <div><label className="text-[10px] text-text-muted">Format</label><select data-testid="revision-format-select" value={state.format} onChange={e => updateSetting('format', e.target.value)} className="w-full mt-1 bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-[11px] text-text-primary">{['General / Custom','Paragraphs','Bullet Points','Executive Summary','Action Items'].map(opt => <option key={opt}>{opt}</option>)}</select></div>
                <div><label className="text-[10px] text-text-muted">Language</label><select data-testid="revision-language-select" value={state.targetLanguage} onChange={e => updateSetting('targetLanguage', e.target.value)} className="w-full mt-1 bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-[11px] text-text-primary">{LANGUAGES.map(l => <option key={l.id} value={l.label}>{l.label}</option>)}</select></div>
                <div><label className="text-[10px] text-text-muted">Tone</label><select data-testid="revision-tone-select" value={state.tone} onChange={e => updateSetting('tone', e.target.value)} className="w-full mt-1 bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-[11px] text-text-primary">{['Balanced / COH Default','Professional','Conversational','Persuasive','Urgent','Inspirational'].map(opt => <option key={opt}>{opt}</option>)}</select></div>
              </div>
              <div><label className="text-[10px] text-text-muted">Optional context</label><input value={state.optionalContext} onChange={e => updateSetting('optionalContext', e.target.value)} placeholder="Additional context..." className="w-full mt-1 bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-[11px] text-text-primary" /></div>

              {state.settingsChangedAfterRevision && (
                <div data-testid="revision-settings-changed-banner" className="p-2.5 rounded-lg bg-status-warning/10 border border-status-warning/25 text-[10.5px] text-text-primary space-y-2">
                  <div className="flex items-center gap-1.5"><AlertTriangle size={11} className="text-status-warning" /> Settings changed. Re-run the revision to apply them.</div>
                  <select data-testid="revision-source-selector" value={state.revisionSource || 'current'} onChange={e => updateSetting('revisionSource', e.target.value)} className="bg-surface-primary border border-border-standard rounded px-2 py-1 text-[10.5px]"><option value="current">Revise current version</option><option value="original">Revise original text</option></select>
                </div>
              )}

              <div className="space-y-2">
                <div className="text-[10.5px] font-semibold text-text-secondary">All revision actions</div>
                {REVISION_GROUP_ORDER.map(group => {
                  const actions = REVISION_ACTIONS.filter(a => a.group === group);
                  if (!actions.length) return null;
                  return (
                    <details key={group} className="border border-border-standard rounded-lg bg-surface-inset/40">
                      <summary className="cursor-pointer px-3 py-2 text-[10.5px] font-semibold text-text-secondary">{group}</summary>
                      <div className="border-t border-border-standard p-2 space-y-1.5">
                        {actions.map(action => {
                          const inRecipe = selectedRecipeActions.includes(action.id);
                          return <div key={action.id} className="flex gap-1.5"><button data-testid={`recipe-toggle-${action.id}`} type="button" onClick={() => toggleRecipeAction(action.id)} className={`w-8 h-8 rounded-md border flex items-center justify-center ${inRecipe ? 'bg-brand-gold text-text-inverse border-brand-gold' : 'bg-surface-primary border-border-standard text-text-secondary'}`}>{inRecipe ? <Check size={12} /> : <Plus size={12} />}</button><button data-testid={`run-action-${action.id}`} type="button" onClick={() => runRevision(action.id)} disabled={state.isGenerating || !state.currentDraft.trim()} className="flex-1 text-left px-3 py-1.5 rounded-md text-[10.5px] bg-surface-primary border border-border-standard text-text-primary hover:border-brand-gold disabled:opacity-40">{action.label}</button></div>;
                        })}
                      </div>
                    </details>
                  );
                })}
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

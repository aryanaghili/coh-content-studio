import React, { useState, useEffect } from 'react';
import { RefreshCcw, Save, CheckCircle2, AlertTriangle, ChevronRight, Edit3, Type, Wand2, Copy, FileText, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { LANGUAGES, getLanguageDirection } from '../lib/languages';

export type RevisionActionGroup = 'Clean & Polish' | 'Voice & Tone' | 'COH & Strategic Fit' | 'Translation & Localization' | 'Format & Structure' | 'Creative Actions';

export interface RevisionActionDef {
  id: string;
  label: string;
  group: RevisionActionGroup;
  description?: string;
}

export const REVISION_ACTIONS: RevisionActionDef[] = [
  { id: 'clean-ai-punctuation', label: '🧼 Clean AI-Style Characters', group: 'Clean & Polish', description: 'Removes em dashes, hidden Unicode characters, awkward AI punctuation, excessive separators, and export-unfriendly symbols.' },
  { id: 'improve-clarity', label: 'Improve clarity', group: 'Clean & Polish' },
  { id: 'shorter', label: '✂️ Make it shorter', group: 'Clean & Polish' },
  { id: 'smoother', label: 'Make it smoother', group: 'Clean & Polish' },
  { id: 'remove-repetition', label: 'Remove repetition', group: 'Clean & Polish' },
  { id: 'fix-grammar', label: 'Fix grammar and punctuation', group: 'Clean & Polish' },
  { id: 'remove-awkward', label: 'Remove awkward phrasing', group: 'Clean & Polish' },

  { id: 'human', label: '👤 Make it more human', group: 'Voice & Tone' },
  { id: 'sharper', label: '⚡ Make it sharper', group: 'Voice & Tone' },
  { id: 'warmer', label: 'Make it warmer', group: 'Voice & Tone' },
  { id: 'direct', label: 'Make it more direct', group: 'Voice & Tone' },
  { id: 'less-corporate', label: '💼 Make it less corporate', group: 'Voice & Tone' },
  { id: 'less-ngo', label: '🌱 Make it less NGO-like', group: 'Voice & Tone' },
  { id: 'less-poetic', label: '📐 Make it less poetic', group: 'Voice & Tone' },
  { id: 'premium', label: 'Make it more premium', group: 'Voice & Tone' },
  { id: 'natural', label: 'Make it more natural', group: 'Voice & Tone' },

  { id: 'coh-specific', label: '🎭 Make it more COH-specific', group: 'COH & Strategic Fit' },
  { id: 'institutional', label: '🏛️ Make it more institutional', group: 'COH & Strategic Fit' },
  { id: 'sponsor-facing', label: '💰 Make it more sponsor-facing', group: 'COH & Strategic Fit' },
  { id: 'audience-friendly', label: '🤝 Make it more audience-friendly', group: 'COH & Strategic Fit' },
  { id: 'channel-ready', label: '📱 Make it more channel-ready', group: 'COH & Strategic Fit' },
  { id: 'culturally-grounded', label: 'Make it more culturally grounded', group: 'COH & Strategic Fit' },
  { id: 'strategic', label: 'Make it more strategic', group: 'COH & Strategic Fit' },
  { id: 'less-generic', label: 'Make it less generic', group: 'COH & Strategic Fit' },

  { id: 'translate-selected', label: 'Translate to selected language', group: 'Translation & Localization' },
  { id: 'localize-selected', label: 'Localize for selected language', group: 'Translation & Localization' },
  { id: 'preserve-meaning-improve-flow', label: 'Preserve meaning and improve flow', group: 'Translation & Localization' },

  { id: 'adapt-channel', label: 'Adapt for selected channel', group: 'Format & Structure' },
  { id: 'extract-quotes', label: 'Extract key quotes', group: 'Format & Structure' },
  { id: 'to-bullets', label: 'Convert to bullet points', group: 'Format & Structure' },
  { id: 'add-hook', label: 'Add a stronger hook', group: 'Format & Structure' },
  { id: 'add-cta', label: 'Add a call to action', group: 'Format & Structure' },
  
  { id: 'make-controversial', label: 'Make it slightly controversial', group: 'Creative Actions' },
  { id: 'make-story', label: 'Turn into a story', group: 'Creative Actions' }
];

export const REVISION_GROUP_ORDER: RevisionActionGroup[] = [
  'Translation & Localization',
  'Clean & Polish',
  'Voice & Tone',
  'COH & Strategic Fit',
  'Format & Structure',
  'Creative Actions'
];

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
  versionHistory: Array<{version: number, text: string, timestamp: string, actionUsed: string}>;
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
  aiStatus,
  generationMode,
  aiService,
  onSaveToLibrary,
  onNavigateToLibrary
}: RevisionStudioProps) {
  const [state, setState] = useState<RevisionState>(DEFAULT_REVISION_STATE);
  const [customInstruction, setCustomInstruction] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [cleanNote, setCleanNote] = useState('');

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
        versionHistory: [{ version: 1, text: initialDraft, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Imported Draft' }]
      }));
    }
  }, [initialDraft]);

  const updateSetting = (key: keyof RevisionState, value: any) => {
    setState(prev => ({
      ...prev,
      [key]: value,
      settingsChangedAfterRevision: prev.revisedOutput !== '' ? true : prev.settingsChangedAfterRevision
    }));
  };

  const cleanWritingArtifacts = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\\u200b|\\u200c|\\u200d|\\ufeff/g, '')
      .replace(/[\\u2014]/g, '-')
      .replace(/[\\u2018\\u2019]/g, "'")
      .replace(/[\\u201C\\u201D]/g, '"')
      .replace(/([.?!])\\s*\\n+/g, "$1\\n\\n")
      .replace(/\\n{3,}/g, "\\n\\n")
      .replace(/\\*\\*(.*?)\\*\\*/g, "$1")
      .replace(/\\b(Note:|Disclaimer:|Here is:|Sure,|Here are:|Please note)\\b/gi, "")
      .trim();
  };

  const runRevision = async (action: string) => {
    if (state.isGenerating || !state.currentDraft.trim()) return;

    setState(prev => ({ ...prev, isGenerating: true, selectedAction: action, error: null, settingsChangedAfterRevision: false }));

    let revised = state.currentDraft;
    let actionLabel = REVISION_ACTIONS.find(a => a.id === action)?.label || action;

    try {
      if (action === 'clean-ai-punctuation') {
        revised = cleanWritingArtifacts(revised);
        setCleanNote('Cleaned punctuation and hidden characters.');
        setTimeout(() => setCleanNote(''), 4000);
      } else {
        const actionDef = REVISION_ACTIONS.find(a => a.id === action);
        let instruction = action === 'custom-instruction' ? customInstruction : (actionDef ? actionDef.label : action);
        
        if (actionDef?.group === 'Translation & Localization') {
          instruction += `. Target Language: ${state.targetLanguage}. Preserve meaning but adapt tone naturally for this language. Avoid literal machine translation. `;
          if (state.targetLanguage.includes('Persian')) {
            instruction += `CRITICAL: Output must be natural, readable, and spoken-friendly. Avoid formal mechanical Persian. Avoid stiff translation patterns. Keep the COH voice.`;
          } else if (state.targetLanguage === 'English') {
            instruction += `CRITICAL: Output should be polished, professional, and clear. Keep the COH voice.`;
          } else {
            instruction += `CRITICAL: Adapt to natural usage in ${state.targetLanguage}. Keep the COH voice.`;
          }
        }
        
        const result = await aiService.revise({
          previousDraft: state.revisionSource === 'original' ? state.originalDraft : state.currentDraft,
          rawInput: state.optionalContext,
          channel: state.channel,
          outputFormat: state.format,
          audience: 'General Public',
          purpose: state.optionalContext || 'General Revision',
          language: state.targetLanguage,
          tone: state.tone,
          selectedRevisionAction: action,
          revisionInstruction: instruction,
          operatingCoreInstructions: JSON.stringify(operatingCore) // Simple compile 
        });

        if (!result || !result.revisedCopy) {
          throw new Error('AI returned an empty response. Please try again.');
        }

        revised = result.revisedCopy;
        actionLabel = action === 'custom-instruction' ? `Custom: ${customInstruction || 'Rewrite'}` : actionLabel;
        
        if (action === 'custom-instruction') {
          setCustomInstruction('');
        }
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
      setState(prev => ({ ...prev, isGenerating: false, error: err.message || 'Error applying revision.' }));
    }
  };

  const handleStartNew = () => {
    setState(prev => ({
      ...DEFAULT_REVISION_STATE,
      channel: prev.channel,
      format: prev.format,
      targetLanguage: prev.targetLanguage,
      tone: prev.tone
    }));
  };

  const handleClearDraft = () => {
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
    <div className="page-shell">
      <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="page-title">
            Revision Studio
          </h2>
          <p className="page-subtitle">
            Refine, adapt, and translate content across your ecosystem.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleStartNew} variant="outline" className="text-xs flex items-center gap-1">
            <RefreshCcw size={12} /> Start New Revision
          </Button>
          <Button onClick={onNavigateToLibrary} variant="secondary" className="text-xs flex items-center gap-1">
            Library <ChevronRight size={12} />
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">
        
        {/* Left Side: Work Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-coh-cream/10 rounded border border-coh-gold/20 overflow-hidden">
          
          {/* Top Controls */}
          <div className="bg-white border-b border-coh-gold/20 p-4 shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Channel</label>
                <select
                  value={state.channel}
                  onChange={(e) => updateSetting('channel', e.target.value)}
                  className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-[11px] text-coh-navy"
                >
                  {['General / Custom', 'LinkedIn', 'Twitter', 'Email Newsletter', 'Blog Post', 'Press Release', 'Website Copy'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Format</label>
                <select
                  value={state.format}
                  onChange={(e) => updateSetting('format', e.target.value)}
                  className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-[11px] text-coh-navy"
                >
                  {['General / Custom', 'Paragraphs', 'Bullet Points', 'Executive Summary', 'Action Items'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Language</label>
                <select
                  value={state.targetLanguage}
                  onChange={(e) => updateSetting('targetLanguage', e.target.value)}
                  className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-[11px] text-coh-navy"
                >
                  {LANGUAGES.map(l => (
                    <option key={l.id} value={l.label}>{l.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Tone</label>
                <select
                  value={state.tone}
                  onChange={(e) => updateSetting('tone', e.target.value)}
                  className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-[11px] text-coh-navy"
                >
                  {['Balanced / COH Default', 'Professional', 'Conversational', 'Persuasive', 'Urgent', 'Inspirational'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Optional Context</label>
                <input
                  type="text"
                  value={state.optionalContext}
                  onChange={(e) => updateSetting('optionalContext', e.target.value)}
                  placeholder="Additional context..."
                  className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-[11px] text-coh-navy"
                />
              </div>
            </div>
            
            {state.settingsChangedAfterRevision && (
              <div className="mt-3 bg-yellow-50 text-yellow-800 p-3 text-xs rounded border border-yellow-200 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>Settings changed. Generate a new revision to apply them.</span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white/50 p-2 rounded">
                    <span className="font-semibold text-yellow-900">Revise from:</span>
                    <select 
                      className="bg-white border border-yellow-300 text-yellow-900 text-[11px] px-2 py-1 rounded outline-none"
                      onChange={(e) => updateSetting('revisionSource', e.target.value)}
                      value={state.revisionSource || 'current'}
                    >
                      <option value="current">Current version</option>
                      <option value="original">Original text</option>
                    </select>
                  </div>
                  <Button 
                    variant="primary" 
                    className="w-full text-xs py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white border-none"
                    onClick={() => runRevision(state.selectedAction || 'custom-instruction')}
                  >
                    Generate New Revision
                  </Button>
                </div>
              </div>
            )}
            {state.error && (
              <div className="mt-3 bg-red-50 text-red-800 p-2 text-xs rounded border border-red-200 flex items-center gap-2">
                <AlertTriangle size={14} />
                {state.error}
              </div>
            )}
          </div>

          {/* Split View Editors */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Draft to Revise */}
            <div className={`flex-1 flex flex-col border-r border-coh-gold/20 ${state.revisedOutput ? 'md:w-1/2' : 'w-full'}`}>
              <div className="bg-white px-4 py-2 border-b border-coh-gold/20 flex justify-between items-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-coh-navy/50 tracking-wider">Draft to Revise</span>
                <button onClick={handleClearDraft} className="text-[10px] text-coh-gold hover:text-coh-gold-light uppercase font-bold">Clear</button>
              </div>
              <textarea
                value={state.currentDraft}
                onChange={(e) => updateSetting('currentDraft', e.target.value)}
                placeholder="Paste or type content here to begin revising..."
                className="flex-1 p-4 bg-transparent border-none resize-none focus:ring-0 text-sm text-coh-navy whitespace-pre-wrap"
                dir={getLanguageDirection(state.currentDraft.slice(0, 100))}
              />
            </div>

            {/* Revised Output (Only shows if generated) */}
            {state.revisedOutput && (
              <div className="flex-1 flex flex-col md:w-1/2 bg-white">
                <div className="bg-coh-navy px-4 py-2 border-b border-coh-navy flex justify-between items-center shrink-0">
                  <span className="text-[10px] uppercase font-bold text-white tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-coh-gold" />
                    Revised Output
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={handleUseAsCurrent} className="text-[10px] bg-coh-gold text-coh-navy px-2 py-0.5 rounded uppercase font-bold hover:bg-coh-gold-light">
                      Use as Draft
                    </button>
                    <button onClick={handleCopy} className="text-[10px] text-white/70 hover:text-white uppercase font-bold flex items-center gap-1">
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="p-2 bg-coh-cream/20 border-b border-coh-gold/10">
                  <span className="text-[10px] text-coh-navy/60 font-mono">Applied: {state.appliedControls}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div 
                    className="prose prose-sm max-w-none text-coh-navy whitespace-pre-wrap"
                    dir={getLanguageDirection(state.targetLanguage)}
                  >
                    {state.revisedOutput}
                  </div>
                </div>
                <div className="p-3 bg-white border-t border-coh-gold/20 flex gap-2">
                  <Button onClick={handleSaveAsNew} variant="outline" className="flex-1 text-xs py-2">
                    <Save size={14} className="mr-2 inline" /> Save as New
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Revision Actions */}
        <div className="w-full lg:w-72 flex flex-col gap-4 overflow-y-auto pr-1">
          
          {/* Custom Instruction */}
          <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
            <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-2">Custom Instruction</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInstruction}
                onChange={(e) => setCustomInstruction(e.target.value)}
                placeholder="e.g. Make it sound like a poem"
                className="flex-1 bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy"
                onKeyDown={(e) => e.key === 'Enter' && runRevision('custom-instruction')}
              />
              <button
                onClick={() => runRevision('custom-instruction')}
                disabled={!customInstruction.trim() || state.isGenerating}
                className="bg-coh-gold text-coh-navy p-2 rounded hover:bg-coh-gold-light disabled:opacity-50"
              >
                <Wand2 size={14} />
              </button>
            </div>
          </div>

          <div className={`space-y-4 ${(!state.currentDraft.trim() || state.isGenerating) ? 'opacity-50 pointer-events-none' : ''}`}>
            {REVISION_GROUP_ORDER.map(group => {
              const actionsInGroup = REVISION_ACTIONS.filter(a => a.group === group);
              if (actionsInGroup.length === 0) return null;
              
              const isExpandedDefault = ['Clean & Polish', 'Translation & Localization', 'COH & Strategic Fit'].includes(group);
              
              return (
                <details key={group} className="border border-coh-gold/20 rounded bg-coh-cream/10 overflow-hidden" open={isExpandedDefault}>
                  <summary className="bg-coh-cream px-3 py-2 text-[10px] uppercase font-bold text-coh-navy/80 tracking-wider cursor-pointer select-none hover:bg-coh-cream-dark transition flex justify-between items-center">
                    {group}
                  </summary>
                  <div className="p-3 space-y-1.5 bg-white">
                    {actionsInGroup.map(actionDef => (
                      <button
                        key={actionDef.id}
                        disabled={state.isGenerating}
                        onClick={() => runRevision(actionDef.id)}
                        title={actionDef.description}
                        className="w-full text-left px-3 py-2 rounded text-xs font-medium text-coh-navy bg-coh-cream/30 hover:bg-coh-gold hover:text-coh-navy transition-colors border border-coh-gold/10"
                      >
                        {actionDef.label}
                      </button>
                    ))}
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

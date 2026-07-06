import React, { useState, useEffect } from 'react';
import { createDefaultOperatingCore, compileOperatingCoreContext, normalizeText } from '../lib/operatingCore';
import type { 
  OperatingCore, AudienceProfile, ChannelRule, RevisionStandard, 
  RuleCard, ClaimCard, EnforcementLevel, AppliesTo, ClaimType, CompileContext
} from '../lib/operatingCore';
import { Save, RefreshCw, Plus, Trash2, Eye, EyeOff, Lock, Unlock, KeyRound } from 'lucide-react';


interface Props {
  core: OperatingCore | null;
  sourceLibrary?: any[];
  onSave: (core: OperatingCore) => void;
  onReset: () => void;
  onAddNewCoreSource?: (section: string) => void;
  onLinkExistingSource?: (section: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);


const deepSanitize = (obj: any): any => {
  if (typeof obj === 'string') return obj.replace(/\\n/g, '\n');
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = deepSanitize(obj[key]);
    }
    return newObj;
  }
  return obj;
};

export default function OperatingCoreAdmin({ core, sourceLibrary = [], onSave, onReset, onAddNewCoreSource, onLinkExistingSource }: Props) {
  const [extractingInsightFor, setExtractingInsightFor] = useState<string | null>(null);
  // Ensure safe fallback from local storage
  const defaultCore = createDefaultOperatingCore();
  const safeCore: OperatingCore = core ? {
    ...defaultCore,
    ...core,
    corePassport: { 
      ...defaultCore.corePassport, 
      ...(core.corePassport || {})
    },
    strategyKernel: { 
      ...defaultCore.strategyKernel, 
      ...(core.strategyKernel || {}),
      internalLaw: core.strategyKernel?.internalLaw || defaultCore.strategyKernel.internalLaw
    },
    audiences: core.audiences || defaultCore.audiences,
    channels: core.channels || defaultCore.channels,
    claimsProofBoundaries: { 
      ...defaultCore.claimsProofBoundaries, 
      ...(core.claimsProofBoundaries || {}),
      claims: core.claimsProofBoundaries?.claims || defaultCore.claimsProofBoundaries.claims
    },
    voiceAndLanguage: { 
      ...defaultCore.voiceAndLanguage, 
      ...(core.voiceAndLanguage || {}),
      preferredPhrases: core.voiceAndLanguage?.preferredPhrases || defaultCore.voiceAndLanguage.preferredPhrases,
      avoidPhrases: core.voiceAndLanguage?.avoidPhrases || defaultCore.voiceAndLanguage.avoidPhrases,
      aiPhrasesToAvoid: core.voiceAndLanguage?.aiPhrasesToAvoid || defaultCore.voiceAndLanguage.aiPhrasesToAvoid
    },
    visualDNA: { 
      ...defaultCore.visualDNA, 
      ...(core.visualDNA || {}) 
    },
    revisionStandards: core.revisionStandards || defaultCore.revisionStandards,
    coreEvidence: core.coreEvidence || defaultCore.coreEvidence,
    learningInbox: core.learningInbox || defaultCore.learningInbox
  } : defaultCore;

  const [draftCore, setDraftCore] = useState<OperatingCore>(deepSanitize(safeCore));
  
  const [operatingCoreDocuments, setOperatingCoreDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('coh-operating-core-documents');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('coh-operating-core-documents', JSON.stringify(operatingCoreDocuments));
  }, [operatingCoreDocuments]);
  const [activeTab, setActiveTab] = useState<'passport' | 'kernel' | 'audiences' | 'channels' | 'claims' | 'voice' | 'visual' | 'revision' | 'evidence'>('evidence');
  
  // Compiler Preview State
  const [showPreview, setShowPreview] = useState(false);
  const [previewCtx, setPreviewCtx] = useState<CompileContext>({
    workspace: 'Advanced Brief',
    channel: 'LinkedIn',
    audience: 'Sponsors and partners',
    format: 'Post',
    action: ''
  });

  
  // --- Superuser Access Gate ---
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('coh_superuser_unlocked') === 'true';
  });
  const [accessCode, setAccessCode] = useState('');
  const [accessError, setAccessError] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setAccessError(false);
    setErrorMessage('');
    
    try {
      const response = await fetch('/api/operating-core/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: accessCode })
      });
      
      const data = await response.json();
      
      if (data.success) {
        sessionStorage.setItem('coh_superuser_unlocked', 'true');
        setIsUnlocked(true);
      } else {
        setAccessError(true);
        setErrorMessage(data.error || 'Invalid code');
      }
    } catch (err) {
      setAccessError(true);
      setErrorMessage('Server error connecting to verification service.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('coh_superuser_unlocked');
    setIsUnlocked(false);
    setAccessCode('');
  };

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-neutral-200 max-w-md w-full text-center">
          <div className="mx-auto w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-neutral-600" />
          </div>
          <h2 className="text-xl font-serif text-neutral-900 mb-2">Operating Core Locked</h2>
          <p className="text-sm text-neutral-500 mb-6">
            The Operating Core is the foundational brain of COH Content Studio. It is restricted to superuser administrators to prevent accidental overwrites of strategic guardrails.
          </p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-3">
            <input 
              type="password" 
              placeholder="Enter Access Code" 
              value={accessCode}
              onChange={(e) => { setAccessCode(e.target.value); setAccessError(false); }}
              className="px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
            />
            {accessError && <span className="text-xs text-red-500 text-left">Incorrect access code.</span>}
            <button 
              type="submit" 
              disabled={isVerifying}
              className={`bg-black text-white px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${isVerifying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-neutral-800'}`}
            >
              <KeyRound className="w-4 h-4" />
              {isVerifying ? 'Verifying...' : 'Unlock Operating Core'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onSave({ ...draftCore, lastUpdated: new Date().toISOString() });
  };

  const updatePassportField = (field: keyof OperatingCore['corePassport'], value: any) => {
    setDraftCore(prev => ({
      ...prev,
      corePassport: { ...prev.corePassport, [field]: value }
    }));
  };

  const updateKernelField = (field: keyof OperatingCore['strategyKernel'], value: any) => {
    setDraftCore(prev => ({
      ...prev,
      strategyKernel: { ...prev.strategyKernel, [field]: value }
    }));
  };

  const updateVoiceField = (field: keyof OperatingCore['voiceAndLanguage'], value: any) => {
    setDraftCore(prev => ({
      ...prev,
      voiceAndLanguage: { ...prev.voiceAndLanguage, [field]: value }
    }));
  };

  const updateVisualField = (field: keyof OperatingCore['visualDNA'], value: any) => {
    setDraftCore(prev => ({
      ...prev,
      visualDNA: { ...prev.visualDNA, [field]: value }
    }));
  };

  const getCompleteness = () => {
    return {
      passport: draftCore.corePassport?.organizationName ? 'Strong' : 'Incomplete',
      kernel: draftCore.strategyKernel?.positioning ? 'Strong' : 'Incomplete',
      claims: draftCore.claimsProofBoundaries?.claims?.length > 0 ? 'Strong' : 'Incomplete',
      voice: draftCore.voiceAndLanguage?.overallTone ? 'Strong' : 'Incomplete',
      visual: draftCore.visualDNA?.visualAtmosphere ? 'Strong' : 'Incomplete',
      audiences: draftCore.audiences?.length > 0 ? 'Strong' : 'Incomplete',
      channels: draftCore.channels?.length > 0 ? 'Strong' : 'Incomplete',
      revision: draftCore.revisionStandards?.length > 0 ? 'Strong' : 'Incomplete'
    };
  };
  const completeness = getCompleteness();

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Header */}
      <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-start">
        <div>
          <h2 className="font-serif text-3xl font-normal text-coh-navy">Operating Core</h2>
          <p className="text-sm text-coh-navy/60 font-sans mt-1">
            The single source of truth for strategy, audience, voice, visual DNA, and guardrails across all workspaces.
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-coh-navy/60">Core Status:</span>
            <button
              onClick={() => setDraftCore(prev => ({ ...prev, active: !prev.active }))}
              className={`px-3 py-1 rounded text-xs font-bold font-mono transition-colors ${
                draftCore.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {draftCore.active ? 'ACTIVE' : 'INACTIVE'}
            </button>
          </div>
          <div className="flex items-center gap-2 bg-coh-gold/10 px-3 py-2 rounded border border-coh-gold/30 text-xs text-coh-navy font-mono mt-2 mb-2 w-fit">
            <Lock size={14} className="text-coh-gold"/> <span className="font-bold uppercase">Protected COH Kernel:</span> <span className="text-green-700 font-bold">ALWAYS ON</span>
          </div>
          <div className="flex gap-2">
            <button onClick={onReset} className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1 px-3 py-1.5 text-xs border border-coh-gold/30 text-coh-navy/60 hover:bg-coh-cream rounded transition-colors action-button">
              <RefreshCw size={12} /> Reset to Defaults
            </button>
            <button onClick={handleSave} className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-1 px-4 py-1.5 bg-coh-navy text-white text-sm font-semibold rounded hover:bg-coh-navy/90 transition-colors action-button">
              <Save size={14} /> Save Core
            </button>
          </div>
          {draftCore.lastUpdated && <span className="text-[10px] text-coh-navy/40 font-mono">Last updated: {new Date(draftCore.lastUpdated).toLocaleString()}</span>}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-1/4 space-y-1">
          <div className="mb-4 p-3 bg-coh-gold/5 rounded border border-coh-gold/15 text-xs">
            <h4 className="font-bold text-coh-navy mb-2 border-b border-coh-gold/15 pb-1">Completeness</h4>
            <ul className="space-y-1 font-mono text-[9px]">
              <li className="flex justify-between"><span>Core Passport</span><span className={completeness.passport === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.passport}</span></li>
              <li className="flex justify-between"><span>Strategy Kernel</span><span className={completeness.kernel === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.kernel}</span></li>
              <li className="flex justify-between"><span>Claims</span><span className={completeness.claims === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.claims}</span></li>
              <li className="flex justify-between"><span>Voice</span><span className={completeness.voice === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.voice}</span></li>
              <li className="flex justify-between"><span>Visual DNA</span><span className={completeness.visual === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.visual}</span></li>
              <li className="flex justify-between"><span>Audiences</span><span className={completeness.audiences === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.audiences}</span></li>
              <li className="flex justify-between"><span>Channels</span><span className={completeness.channels === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.channels}</span></li>
              <li className="flex justify-between"><span>Revision</span><span className={completeness.revision === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.revision}</span></li>
            </ul>
          </div>
          
          <button onClick={() => setActiveTab('evidence')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'evidence' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Core Documents</button>
          <button onClick={() => setActiveTab('passport')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'passport' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Core Passport</button>
          <button onClick={() => setActiveTab('kernel')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'kernel' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Strategy Kernel</button>
          <button onClick={() => setActiveTab('audiences')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'audiences' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Audiences</button>
          <button onClick={() => setActiveTab('channels')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'channels' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Channels</button>
          <button onClick={() => setActiveTab('claims')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'claims' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Claims</button>
          <button onClick={() => setActiveTab('voice')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'voice' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Voice</button>
          <button onClick={() => setActiveTab('visual')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'visual' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Visual</button>
          <button onClick={() => setActiveTab('revision')} className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${activeTab === 'revision' ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'}`}>Revision</button>
          <div className="h-px bg-coh-gold/15 my-2"></div>
        </div>

        {/* Content Area */}
        <div className="w-3/4 bg-white p-6 rounded shadow-sm border border-coh-gold/10 h-[600px] overflow-y-auto">
          {/* CORE PASSPORT */}
          {activeTab === 'passport' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-coh-navy border-b border-coh-gold/20 pb-2">Core Passport</h3>
              <p className="text-xs text-coh-navy/60 mb-4">The quick identity layer of the system. Tells the Operating Core who we are before applying deeper rules.</p>
              
              {draftCore.corePassport.organizationName.toLowerCase() !== 'climate opera haus' && (
                <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-4 rounded mb-6 flex items-start gap-3">
                  <div className="text-red-500 mt-0.5">⚠️</div>
                  <div>
                    <strong className="block mb-1">Generic Repurposing Warning</strong>
                    This studio is configured specifically for Climate Opera Haus. For another organization, create a separate app/version instead of repurposing this Operating Core.
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Organization Name</label>
                  <input value={draftCore.corePassport.organizationName} onChange={e => updatePassportField('organizationName', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Category</label>
                  <input value={draftCore.corePassport.category} onChange={e => updatePassportField('category', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">One-Line Definition</label>
                  <textarea value={draftCore.corePassport.oneLineDefinition} onChange={e => updatePassportField('oneLineDefinition', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-red-700/80 mb-1">What We Are Not</label>
                  <textarea value={draftCore.corePassport.whatWeAreNot} onChange={e => updatePassportField('whatWeAreNot', e.target.value)} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900 h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Core Distinction</label>
                  <textarea value={draftCore.corePassport.coreDistinction} onChange={e => updatePassportField('coreDistinction', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Operating Logic</label>
                  <textarea value={draftCore.corePassport.operatingLogic} onChange={e => updatePassportField('operatingLogic', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Current Strategic Phase</label>
                  <textarea value={draftCore.corePassport.currentStrategicPhase} onChange={e => updatePassportField('currentStrategicPhase', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Primary Strategic Priorities</label>
                  <textarea value={draftCore.corePassport.primaryStrategicPriorities} onChange={e => updatePassportField('primaryStrategicPriorities', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Default Communication Posture</label>
                  <input value={draftCore.corePassport.defaultCommunicationPosture} onChange={e => updatePassportField('defaultCommunicationPosture', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-red-700/80 mb-1">Never Collapse Into</label>
                  <textarea value={draftCore.corePassport.neverCollapseInto} onChange={e => updatePassportField('neverCollapseInto', e.target.value)} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900 h-16" />
                </div>
              </div>
            </div>
          )}

          {/* STRATEGY KERNEL */}
          {activeTab === 'kernel' && (
            <div className="space-y-6">
              <h3 className="font-serif text-xl font-bold text-coh-navy border-b border-coh-gold/20 pb-2">Strategy Kernel</h3>
              <p className="text-xs text-coh-navy/60 mb-4">The deepest strategic logic inside the Operating Core.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Positioning</label>
                  <textarea value={draftCore.strategyKernel.positioning} onChange={e => updateKernelField('positioning', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Strategic Ambition</label>
                  <textarea value={draftCore.strategyKernel.strategicAmbition} onChange={e => updateKernelField('strategicAmbition', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Value Proposition</label>
                  <textarea value={draftCore.strategyKernel.valueProposition} onChange={e => updateKernelField('valueProposition', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Proof Ladder</label>
                  <textarea value={draftCore.strategyKernel.proofLadder} onChange={e => updateKernelField('proofLadder', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-24" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2 mt-4">
                  <label className="block text-xs font-bold text-coh-navy/80">Internal Law / Non-Negotiables</label>
                  <button onClick={() => {
                    setDraftCore(prev => ({
                      ...prev, strategyKernel: { ...prev.strategyKernel, internalLaw: [...prev.strategyKernel.internalLaw, { id: generateId(), title: 'New Law', rule: '', enforcement: 'Strong guidance', appliesTo: ['All workspaces'] }] }
                    }))
                  }} className="text-xs text-coh-gold hover:text-coh-gold/80 flex items-center gap-1"><Plus size={12}/> Add Law</button>
                </div>
                <div className="space-y-3">
                  {draftCore.strategyKernel.internalLaw.map((law, idx) => (
                    <div key={law.id} className="border border-coh-gold/20 p-3 rounded bg-coh-cream/50">
                      <div className="flex justify-between gap-2 mb-2">
                        <input value={law.title} onChange={e => {
                          const newLaws = [...draftCore.strategyKernel.internalLaw];
                          newLaws[idx].title = e.target.value;
                          updateKernelField('internalLaw', newLaws);
                        }} className="font-bold text-sm bg-transparent border-b border-coh-gold/30 w-1/3" placeholder="Rule Title"/>
                        <select value={law.enforcement} onChange={e => {
                          const newLaws = [...draftCore.strategyKernel.internalLaw];
                          newLaws[idx].enforcement = e.target.value as EnforcementLevel;
                          updateKernelField('internalLaw', newLaws);
                        }} className="text-xs bg-white border border-coh-gold/30 rounded p-1">
                          <option value="Always apply">Always apply</option>
                          <option value="Strong guidance">Strong guidance</option>
                          <option value="Warn if violated">Warn if violated</option>
                          <option value="Reference only">Reference only</option>
                        </select>
                        <button onClick={() => {
                          const newLaws = draftCore.strategyKernel.internalLaw.filter(l => l.id !== law.id);
                          updateKernelField('internalLaw', newLaws);
                        }} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                      </div>
                      <textarea value={law.rule} onChange={e => {
                        const newLaws = [...draftCore.strategyKernel.internalLaw];
                        newLaws[idx].rule = e.target.value;
                        updateKernelField('internalLaw', newLaws);
                      }} className="w-full text-sm p-2 rounded border border-coh-gold/20 bg-white text-coh-navy h-16" placeholder="The exact rule logic..." />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUDIENCES */}
          {activeTab === 'audiences' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-coh-gold/20 pb-2 mb-4">
                <h3 className="font-serif text-xl font-bold text-coh-navy">Audience Logic</h3>
                <button onClick={() => {
                  setDraftCore(prev => ({
                    ...prev, audiences: [...prev.audiences, { id: generateId(), name: 'New Audience', caresAbout: '', proofNeeded: '', preferredTone: '', levelOfDetail: '', avoid: '', cta: '', relevantMessages: '' }]
                  }))
                }} className="text-xs text-coh-gold hover:text-coh-gold/80 flex items-center gap-1"><Plus size={12}/> Add Audience</button>
              </div>
              <div className="space-y-6">
                {draftCore.audiences.map((aud, idx) => (
                  <div key={aud.id} className="border border-coh-gold/20 rounded p-4 bg-coh-cream/30">
                    <div className="flex justify-between mb-3">
                      <input value={aud.name} onChange={e => {
                        const newAuds = [...draftCore.audiences];
                        newAuds[idx].name = e.target.value;
                        setDraftCore(prev => ({...prev, audiences: newAuds}));
                      }} className="font-serif text-lg font-bold bg-transparent border-b border-coh-gold/40 focus:outline-none" placeholder="Audience Name"/>
                      <button onClick={() => {
                        const newAuds = draftCore.audiences.filter(a => a.id !== aud.id);
                        setDraftCore(prev => ({...prev, audiences: newAuds}));
                      }} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">Cares About</label><input value={aud.caresAbout} onChange={e => { const a=[...draftCore.audiences]; a[idx].caresAbout=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-red-600/70">What they may misunderstand</label><input value={aud.mayMisunderstand || ''} onChange={e => { const a=[...draftCore.audiences]; a[idx].mayMisunderstand=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-red-200 bg-red-50 rounded text-red-900" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Proof Needed</label><input value={aud.proofNeeded} onChange={e => { const a=[...draftCore.audiences]; a[idx].proofNeeded=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Preferred Tone</label><input value={aud.preferredTone} onChange={e => { const a=[...draftCore.audiences]; a[idx].preferredTone=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Level of Detail</label><input value={aud.levelOfDetail} onChange={e => { const a=[...draftCore.audiences]; a[idx].levelOfDetail=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">CTA</label><input value={aud.cta} onChange={e => { const a=[...draftCore.audiences]; a[idx].cta=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">Relevant Messages</label><input value={aud.relevantMessages} onChange={e => { const a=[...draftCore.audiences]; a[idx].relevantMessages=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-red-600/70">What to Avoid</label><input value={aud.avoid} onChange={e => { const a=[...draftCore.audiences]; a[idx].avoid=e.target.value; setDraftCore(p=>({...p,audiences:a})) }} className="w-full text-xs p-1.5 border border-red-200 bg-red-50 rounded text-red-900" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CHANNELS */}
          {activeTab === 'channels' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-coh-gold/20 pb-2 mb-4">
                <h3 className="font-serif text-xl font-bold text-coh-navy">Channel Rules</h3>
                <button onClick={() => {
                  setDraftCore(prev => ({
                    ...prev, channels: [...prev.channels, { id: generateId(), name: 'New Channel', purpose: '', typicalStructure: '', lengthGuidance: '', toneGuidance: '', ctaGuidance: '', formattingRules: '', avoid: '' }]
                  }))
                }} className="text-xs text-coh-gold hover:text-coh-gold/80 flex items-center gap-1"><Plus size={12}/> Add Channel</button>
              </div>
              <div className="space-y-6">
                {draftCore.channels.map((ch, idx) => (
                  <div key={ch.id} className="border border-coh-gold/20 rounded p-4 bg-coh-cream/30">
                    <div className="flex justify-between mb-3">
                      <input value={ch.name} onChange={e => {
                        const newCh = [...draftCore.channels];
                        newCh[idx].name = e.target.value;
                        setDraftCore(prev => ({...prev, channels: newCh}));
                      }} className="font-serif text-lg font-bold bg-transparent border-b border-coh-gold/40 focus:outline-none" placeholder="Channel Name"/>
                      <button onClick={() => {
                        const newCh = draftCore.channels.filter(c => c.id !== ch.id);
                        setDraftCore(prev => ({...prev, channels: newCh}));
                      }} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">Purpose</label><input value={ch.purpose} onChange={e => { const c=[...draftCore.channels]; c[idx].purpose=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Tone Guidance</label><input value={ch.toneGuidance} onChange={e => { const c=[...draftCore.channels]; c[idx].toneGuidance=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Length Guidance</label><input value={ch.lengthGuidance} onChange={e => { const c=[...draftCore.channels]; c[idx].lengthGuidance=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Formatting Rules</label><input value={ch.formattingRules} onChange={e => { const c=[...draftCore.channels]; c[idx].formattingRules=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">CTA Guidance</label><input value={ch.ctaGuidance} onChange={e => { const c=[...draftCore.channels]; c[idx].ctaGuidance=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">Typical Structure</label><input value={ch.typicalStructure} onChange={e => { const c=[...draftCore.channels]; c[idx].typicalStructure=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-red-600/70">What to Avoid</label><input value={ch.avoid} onChange={e => { const c=[...draftCore.channels]; c[idx].avoid=e.target.value; setDraftCore(p=>({...p,channels:c})) }} className="w-full text-xs p-1.5 border border-red-200 bg-red-50 rounded text-red-900" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CLAIMS */}
          {activeTab === 'claims' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy border-b border-coh-gold/20 pb-2">Claims &amp; Proof Boundaries</h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Proof Points to Use</label>
                  <textarea value={draftCore.claimsProofBoundaries.proofPoints} onChange={e => setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, proofPoints: e.target.value}}))} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Overstatement Warnings</label>
                  <textarea value={draftCore.claimsProofBoundaries.overstatementWarnings} onChange={e => setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, overstatementWarnings: e.target.value}}))} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-coh-navy/80 mb-1">Claim Style Rules</label>
                  <textarea value={draftCore.claimsProofBoundaries.claimStyleRules} onChange={e => setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, claimStyleRules: e.target.value}}))} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" />
                </div>
              </div>

              <div className="flex justify-between items-center mb-2 mt-4 border-b border-coh-gold/20 pb-2">
                <label className="block text-sm font-bold text-coh-navy">Specific Claim Boundaries</label>
                <button onClick={() => {
                  setDraftCore(prev => ({
                    ...prev, claimsProofBoundaries: { ...prev.claimsProofBoundaries, claims: [...prev.claimsProofBoundaries.claims, { id: generateId(), text: '', type: 'Requires proof', proofRequirement: '', enforcement: 'Warn if violated' }] }
                  }))
                }} className="text-xs text-coh-gold hover:text-coh-gold/80 flex items-center gap-1"><Plus size={12}/> Add Claim</button>
              </div>
              <div className="space-y-2">
                {draftCore.claimsProofBoundaries.claims.map((claim, idx) => (
                  <div key={claim.id} className="border border-coh-gold/20 p-2 rounded flex gap-2 items-start bg-white">
                    <select value={claim.type} onChange={e => {
                      const newC = [...draftCore.claimsProofBoundaries.claims];
                      newC[idx].type = e.target.value as ClaimType;
                      setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, claims: newC}}));
                    }} className="text-xs border border-coh-gold/30 rounded p-1.5 w-32 shrink-0">
                      <option value="Approved">Approved</option>
                      <option value="Requires proof">Requires proof</option>
                      <option value="Aspirational">Aspirational</option>
                      <option value="Forbidden">Forbidden</option>
                    </select>
                    <input value={claim.text} onChange={e => {
                      const newC = [...draftCore.claimsProofBoundaries.claims];
                      newC[idx].text = e.target.value;
                      setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, claims: newC}}));
                    }} className="text-sm border border-coh-gold/30 rounded p-1 flex-1" placeholder="Claim text..."/>
                    {claim.type === 'Requires proof' && (
                      <input value={claim.proofRequirement} onChange={e => {
                        const newC = [...draftCore.claimsProofBoundaries.claims];
                        newC[idx].proofRequirement = e.target.value;
                        setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, claims: newC}}));
                      }} className="text-xs border border-coh-gold/30 rounded p-1 w-40 shrink-0" placeholder="Required Proof..."/>
                    )}
                    <button onClick={() => {
                      const newC = draftCore.claimsProofBoundaries.claims.filter(c => c.id !== claim.id);
                      setDraftCore(p => ({...p, claimsProofBoundaries: {...p.claimsProofBoundaries, claims: newC}}));
                    }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VOICE & LANGUAGE */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy border-b border-coh-gold/20 pb-2">Voice &amp; Language</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-bold text-coh-navy/80 mb-1">Overall Tone</label><textarea value={draftCore.voiceAndLanguage.overallTone} onChange={e => updateVoiceField('overallTone', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-coh-navy/80 mb-1">Writing Style</label><textarea value={draftCore.voiceAndLanguage.writingStyle} onChange={e => updateVoiceField('writingStyle', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Sentence Rhythm</label><input value={draftCore.voiceAndLanguage.sentenceRhythm} onChange={e => updateVoiceField('sentenceRhythm', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Formality Level</label><input value={draftCore.voiceAndLanguage.formalityLevel} onChange={e => updateVoiceField('formalityLevel', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Emotional Intensity</label><input value={draftCore.voiceAndLanguage.emotionalIntensity} onChange={e => updateVoiceField('emotionalIntensity', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Founder Voice Notes</label><input value={draftCore.voiceAndLanguage.founderVoiceNotes} onChange={e => updateVoiceField('founderVoiceNotes', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-green-700/80 mb-1">Preferred Phrases (comma separated)</label><textarea value={draftCore.voiceAndLanguage.preferredPhrases.join(', ')} onChange={e => updateVoiceField('preferredPhrases', e.target.value.split(',').map(s=>s.trim()))} className="w-full text-sm p-2 rounded border border-green-300 bg-green-50 text-green-900 h-20" /></div>
                <div><label className="block text-xs font-bold text-red-700/80 mb-1">Avoid Phrases (comma separated)</label><textarea value={draftCore.voiceAndLanguage.avoidPhrases.join(', ')} onChange={e => updateVoiceField('avoidPhrases', e.target.value.split(',').map(s=>s.trim()))} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900 h-20" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-red-700/80 mb-1">AI Phrasing to Avoid (comma separated)</label><input value={draftCore.voiceAndLanguage.aiPhrasesToAvoid.join(', ')} onChange={e => updateVoiceField('aiPhrasesToAvoid', e.target.value.split(',').map(s=>s.trim()))} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-coh-navy/80 mb-1">Clean Writing Rules</label><input value={draftCore.voiceAndLanguage.cleanWritingRules} onChange={e => updateVoiceField('cleanWritingRules', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
              </div>
            </div>
          )}

          {/* VISUAL DNA */}
          {activeTab === 'visual' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy border-b border-coh-gold/20 pb-2">Visual DNA</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="block text-xs font-bold text-coh-navy/80 mb-1">Visual Atmosphere</label><textarea value={draftCore.visualDNA.visualAtmosphere} onChange={e => updateVisualField('visualAtmosphere', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Mood</label><textarea value={draftCore.visualDNA.mood} onChange={e => updateVisualField('mood', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Photography Style</label><textarea value={draftCore.visualDNA.photographyStyle} onChange={e => updateVisualField('photographyStyle', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Composition Principles</label><input value={draftCore.visualDNA.compositionPrinciples} onChange={e => updateVisualField('compositionPrinciples', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Color / Material Direction</label><input value={draftCore.visualDNA.colorMaterialDirection} onChange={e => updateVisualField('colorMaterialDirection', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Format / Aspect Preferences</label><input value={draftCore.visualDNA.formatAspectPreferences} onChange={e => updateVisualField('formatAspectPreferences', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div><label className="block text-xs font-bold text-coh-navy/80 mb-1">Typography Notes</label><input value={draftCore.visualDNA.typographyNotes} onChange={e => updateVisualField('typographyNotes', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-coh-navy/80 mb-1">Image Prompt Rules</label><textarea value={draftCore.visualDNA.imagePromptRules} onChange={e => updateVisualField('imagePromptRules', e.target.value)} className="w-full text-sm p-2 rounded border border-coh-gold/30 bg-coh-cream text-coh-navy h-16" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-red-700/80 mb-1">Negative Prompt Rules</label><textarea value={draftCore.visualDNA.negativePromptRules} onChange={e => updateVisualField('negativePromptRules', e.target.value)} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900 h-16" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-red-700/80 mb-1">Clichés to Avoid</label><textarea value={draftCore.visualDNA.visualClichesToAvoid} onChange={e => updateVisualField('visualClichesToAvoid', e.target.value)} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900 h-16" /></div>
                <div className="col-span-2"><label className="block text-xs font-bold text-red-700/80 mb-1">Symbols to Use Carefully</label><textarea value={draftCore.visualDNA.visualSymbolsToUseCarefully} onChange={e => updateVisualField('visualSymbolsToUseCarefully', e.target.value)} className="w-full text-sm p-2 rounded border border-red-300 bg-red-50 text-red-900 h-16" /></div>
              </div>
            </div>
          )}

          {/* REVISION STANDARDS */}
          {activeTab === 'revision' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-coh-gold/20 pb-2 mb-4">
                <h3 className="font-serif text-xl font-bold text-coh-navy">Revision Standards</h3>
                <button onClick={() => {
                  setDraftCore(prev => ({
                    ...prev, revisionStandards: [...prev.revisionStandards, { id: generateId(), action: 'New Standard', does: '', avoids: '', whenToUse: '', exampleGuidance: '', appliesTo: 'All workspaces' }]
                  }))
                }} className="text-xs text-coh-gold hover:text-coh-gold/80 flex items-center gap-1"><Plus size={12}/> Add Standard</button>
              </div>
              <div className="space-y-4">
                {draftCore.revisionStandards.map((rev, idx) => (
                  <div key={rev.id} className="border border-coh-gold/20 rounded p-4 bg-coh-cream/30">
                    <div className="flex justify-between items-center mb-3">
                      <input value={rev.action} onChange={e => {
                        const newR = [...draftCore.revisionStandards];
                        newR[idx].action = e.target.value;
                        setDraftCore(p => ({...p, revisionStandards: newR}));
                      }} className="font-serif text-lg font-bold bg-transparent border-b border-coh-gold/40 focus:outline-none w-1/3" placeholder="Standard Name (e.g. Sharper)"/>
                      <button onClick={() => {
                        const newR = draftCore.revisionStandards.filter(r => r.id !== rev.id);
                        setDraftCore(p => ({...p, revisionStandards: newR}));
                      }} className="text-red-500 hover:text-red-700"><Trash2 size={16}/></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">What it does</label><input value={rev.does} onChange={e => { const r=[...draftCore.revisionStandards]; r[idx].does=e.target.value; setDraftCore(p=>({...p,revisionStandards:r})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">What it avoids</label><input value={rev.avoids} onChange={e => { const r=[...draftCore.revisionStandards]; r[idx].avoids=e.target.value; setDraftCore(p=>({...p,revisionStandards:r})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">When to use</label><input value={rev.whenToUse} onChange={e => { const r=[...draftCore.revisionStandards]; r[idx].whenToUse=e.target.value; setDraftCore(p=>({...p,revisionStandards:r})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div><label className="text-[10px] uppercase font-bold text-coh-navy/60">Applies To</label><input value={rev.appliesTo} onChange={e => { const r=[...draftCore.revisionStandards]; r[idx].appliesTo=e.target.value; setDraftCore(p=>({...p,revisionStandards:r})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                      <div className="col-span-2"><label className="text-[10px] uppercase font-bold text-coh-navy/60">Example Guidance</label><input value={rev.exampleGuidance} onChange={e => { const r=[...draftCore.revisionStandards]; r[idx].exampleGuidance=e.target.value; setDraftCore(p=>({...p,revisionStandards:r})) }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CORE SOURCES */}
          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-coh-gold/20 pb-2 mb-4">
                <h3 className="font-serif text-xl font-bold text-coh-navy">Core Documents</h3>
                <button onClick={() => {
                  setOperatingCoreDocuments([{
                    id: generateId(),
                    title: 'New Core Document',
                    type: 'Strategic Plan',
                    status: 'Draft',
                    brainArea: 'Passport',
                    brainRole: 'Rule',
                    notes: '',
                    content: '',
                    extractedInsights: ''
                  }, ...operatingCoreDocuments]);
                }} className="text-xs bg-coh-navy text-coh-cream px-3 py-1.5 rounded hover:bg-coh-navy-light transition font-semibold flex items-center gap-1 action-button interactive-button">
                  <Plus size={12}/> Add Core Document
                </button>
              </div>
              <p className="text-xs text-coh-navy/60 mb-4">These are foundational brain documents. They are not normal user sources. They dictate the internal logic of the system.</p>

              {operatingCoreDocuments.length === 0 ? (
                <div className="text-center p-8 bg-coh-cream/10 border border-dashed border-coh-gold/30 rounded">
                  <p className="text-xs text-coh-navy/50 italic mb-2">No Core Documents linked yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {operatingCoreDocuments.map((doc, idx) => (
                    <div key={doc.id} className="border border-coh-gold/30 rounded bg-white overflow-hidden shadow-sm">
                      <div className="bg-coh-cream/30 border-b border-coh-gold/20 p-3 flex justify-between items-center">
                        <input value={doc.title} onChange={e => {
                          const docs = [...operatingCoreDocuments];
                          docs[idx].title = e.target.value;
                          setOperatingCoreDocuments(docs);
                        }} className="font-serif text-lg font-bold bg-transparent focus:outline-none w-1/2 border-b border-coh-gold/40" placeholder="Document Title"/>
                        <button onClick={() => {
                          setOperatingCoreDocuments(operatingCoreDocuments.filter(d => d.id !== doc.id));
                        }} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                      </div>
                      
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Document Type</label>
                          <select value={doc.type || 'Strategic Plan'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].type = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Strategic Plan</option>
                            <option>Operating Memo</option>
                            <option>Canon Script</option>
                            <option>Treatment</option>
                            <option>Brand Guide</option>
                            <option>Visual DNA Guide</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Status</label>
                          <select value={doc.status || 'Draft'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].status = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Draft</option>
                            <option>Approved</option>
                            <option>Deprecated</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Brain Area</label>
                          <select value={doc.brainArea || 'Passport'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].brainArea = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Passport</option>
                            <option>Strategy</option>
                            <option>Audience</option>
                            <option>Channels</option>
                            <option>Claims</option>
                            <option>Voice</option>
                            <option>Visual</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Brain Role</label>
                          <select value={doc.brainRole || 'Rule'} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].brainRole = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white">
                            <option>Definition</option>
                            <option>Rule</option>
                            <option>Constraint</option>
                            <option>Direction</option>
                            <option>Aspiration</option>
                          </select>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Notes / Relevance</label>
                          <input value={doc.notes || ''} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].notes = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full text-xs p-1.5 border border-coh-gold/20 rounded bg-white" placeholder="Why is this document in the core?"/>
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy/70 mb-1">Document Content</label>
                          <textarea value={doc.content || ''} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].content = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full bg-coh-cream/30 border border-coh-gold/20 p-2 rounded text-xs font-mono h-24 whitespace-pre-wrap" placeholder="Paste actual source text here..."/>
                        </div>
                        
                        <div className="col-span-2 bg-coh-navy/5 border border-coh-navy/10 p-3 rounded">
                          <label className="block text-[10px] uppercase font-bold text-coh-navy mb-1 flex items-center justify-between">
                            Extracted Insights 
                            <span className="text-[9px] font-normal text-coh-navy/60 bg-white px-1.5 py-0.5 rounded border border-coh-navy/10">Inferred System Logic</span>
                          </label>
                          <textarea value={doc.extractedInsights || ''} onChange={e => {
                            const docs = [...operatingCoreDocuments];
                            docs[idx].extractedInsights = e.target.value;
                            setOperatingCoreDocuments(docs);
                          }} className="w-full bg-white border border-coh-gold/20 p-2 rounded text-xs text-coh-navy h-16" placeholder="The system distills rules from the content here..."/>
                          
                          <button onClick={() => {
                            alert('Insight extracted and saved. In a full backend environment, this would hit the LLM and automatically populate the Operating Core fields.');
                          }} className="mt-2 w-full text-center bg-white border border-coh-navy/20 text-coh-navy text-xs font-bold uppercase py-2 rounded hover:bg-coh-navy hover:text-white transition-colors">
                            Extract Insights & Save to Operating Core
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* COMPILER PREVIEW FEATURE */}
      <div className="mt-8 border border-coh-gold/20 bg-white rounded p-4">
        <button onClick={() => setShowPreview(!showPreview)} className="flex items-center gap-2 font-serif font-bold text-coh-navy w-full text-left focus:outline-none">
          {showPreview ? <EyeOff size={16}/> : <Eye size={16}/>}
          Compiler Preview
        </button>
        
        {showPreview && (
          <div className="mt-4 pt-4 border-t border-coh-gold/20">
            <p className="text-xs text-coh-navy/60 mb-4">Select a mock workspace context to preview exactly what rules are compiled and injected into the AI prompt.</p>
            <div className="flex gap-4 mb-4">
              <select value={previewCtx.workspace} onChange={e => setPreviewCtx({...previewCtx, workspace: e.target.value as any})} className="text-xs p-2 border rounded border-coh-gold/30">
                <option value="Advanced Brief">Content Workspace (Advanced Brief)</option>
                <option value="Ideation Workspace">Ideation Workspace</option>
                <option value="Visual Studio">Visual Studio</option>
                <option value="Revision Studio">Revision Studio</option>
              </select>
              <select value={previewCtx.audience} onChange={e => setPreviewCtx({...previewCtx, audience: e.target.value})} className="text-xs p-2 border rounded border-coh-gold/30">
                <option value="">No Audience</option>
                {draftCore.audiences.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
              </select>
              <select value={previewCtx.channel} onChange={e => setPreviewCtx({...previewCtx, channel: e.target.value})} className="text-xs p-2 border rounded border-coh-gold/30">
                <option value="">No Channel</option>
                {draftCore.channels.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
              {previewCtx.workspace === 'Revision Studio' && (
                <select value={previewCtx.action} onChange={e => setPreviewCtx({...previewCtx, action: e.target.value})} className="text-xs p-2 border rounded border-coh-gold/30">
                  <option value="">No Action</option>
                  {draftCore.revisionStandards.map(r => <option key={r.id} value={r.action}>{r.action}</option>)}
                </select>
              )}
            </div>
            
            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-4 rounded text-xs font-mono overflow-auto max-h-64 border border-gray-800 whitespace-pre-wrap">
              {compileOperatingCoreContext(draftCore, previewCtx)}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
}

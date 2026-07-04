import { useState } from 'react';
import { createDefaultOperatingCore } from '../lib/operatingCore';
import type { OperatingCore, AudienceProfile, ChannelRule, RevisionStandard } from '../lib/operatingCore';
import { Save, RefreshCw } from 'lucide-react';

interface Props {
  core: OperatingCore | null;
  onSave: (core: OperatingCore) => void;
  onReset: () => void;
}

export default function OperatingCoreAdmin({ core, onSave, onReset }: Props) {
  const [draftCore, setDraftCore] = useState<OperatingCore>(core || createDefaultOperatingCore());
  const [activeTab, setActiveTab] = useState<'strategy' | 'audiences' | 'claims' | 'voice' | 'visual' | 'revision' | 'learning'>('strategy');

  const handleSave = () => {
    onSave({ ...draftCore, lastUpdated: new Date().toISOString() });
  };

  const getCompleteness = () => {
    return {
      strategy: draftCore.coreStrategy.definition ? 'Strong' : 'Incomplete',
      claims: draftCore.claimsProofBoundaries.approvedClaims ? 'Strong' : 'Incomplete',
      voice: draftCore.voiceAndLanguage.tone ? 'Strong' : 'Incomplete',
      visual: draftCore.visualDNA.atmosphere ? 'Strong' : 'Incomplete',
      audiences: draftCore.audiences.length > 0 ? 'Strong' : 'Incomplete',
      revision: draftCore.revisionStandards.length > 0 ? 'Strong' : 'Incomplete'
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
            Strategy, rules, audience logic, proof, tone, and visual DNA that guide every workspace.
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
          <div className="flex gap-2">
            <button onClick={onReset} className="flex items-center gap-1 px-3 py-1.5 text-xs border border-coh-gold/30 text-coh-navy/60 hover:bg-coh-cream rounded transition-colors">
              <RefreshCw size={12} /> Reset to Defaults
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-4 py-1.5 bg-coh-navy text-white text-sm font-semibold rounded hover:bg-coh-navy/90 transition-colors">
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
              <li className="flex justify-between"><span>Strategy</span><span className={completeness.strategy === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.strategy}</span></li>
              <li className="flex justify-between"><span>Claims</span><span className={completeness.claims === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.claims}</span></li>
              <li className="flex justify-between"><span>Voice</span><span className={completeness.voice === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.voice}</span></li>
              <li className="flex justify-between"><span>Visual DNA</span><span className={completeness.visual === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.visual}</span></li>
              <li className="flex justify-between"><span>Audiences</span><span className={completeness.audiences === 'Strong' ? 'text-green-600' : 'text-red-500'}>{completeness.audiences}</span></li>
            </ul>
          </div>
          
          {(['strategy', 'audiences', 'claims', 'voice', 'visual', 'revision', 'learning'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                activeTab === tab ? 'bg-coh-navy text-white font-semibold' : 'text-coh-navy/70 hover:bg-coh-cream'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-3/4 bg-white p-6 rounded shadow-sm border border-coh-gold/10">
          {activeTab === 'strategy' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-4">Core Strategy</h3>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Organization Definition</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={3}
                  value={draftCore.coreStrategy.definition}
                  onChange={e => setDraftCore({ ...draftCore, coreStrategy: { ...draftCore.coreStrategy, definition: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">What We Are Not</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={2}
                  value={draftCore.coreStrategy.whatWeAreNot}
                  onChange={e => setDraftCore({ ...draftCore, coreStrategy: { ...draftCore.coreStrategy, whatWeAreNot: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Internal Law (Non-negotiables)</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={3}
                  value={draftCore.coreStrategy.internalLaw}
                  onChange={e => setDraftCore({ ...draftCore, coreStrategy: { ...draftCore.coreStrategy, internalLaw: e.target.value } })}
                />
              </div>
            </div>
          )}

          {activeTab === 'audiences' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-4">Audiences & Channels</h3>
              <p className="text-xs text-coh-navy/60">Defined audience profiles. The system will adapt to these dynamically.</p>
              <div className="space-y-4">
                {draftCore.audiences.map((aud, i) => (
                  <div key={i} className="p-4 border border-coh-gold/20 rounded bg-coh-cream/30 space-y-2">
                    <input className="font-bold text-sm bg-transparent border-b border-coh-gold/30 w-full outline-none" value={aud.name} readOnly />
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="font-semibold block text-coh-navy/60 text-[10px] uppercase tracking-wider">Cares About</span>{aud.caresAbout}</div>
                      <div><span className="font-semibold block text-coh-navy/60 text-[10px] uppercase tracking-wider">Tone</span>{aud.preferredTone}</div>
                      <div><span className="font-semibold block text-coh-navy/60 text-[10px] uppercase tracking-wider">Avoid</span>{aud.avoid}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-4">Claims, Proof, and Boundaries</h3>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Approved Claims</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={3}
                  value={draftCore.claimsProofBoundaries.approvedClaims}
                  onChange={e => setDraftCore({ ...draftCore, claimsProofBoundaries: { ...draftCore.claimsProofBoundaries, approvedClaims: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Claims Requiring Proof</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={2}
                  value={draftCore.claimsProofBoundaries.requiresProof}
                  onChange={e => setDraftCore({ ...draftCore, claimsProofBoundaries: { ...draftCore.claimsProofBoundaries, requiresProof: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Forbidden Claims / Sensitive Language</label>
                <textarea
                  className="w-full p-2 border border-red-200 bg-red-50/30 rounded focus:outline-none focus:border-red-400 text-sm text-red-900"
                  rows={3}
                  value={draftCore.claimsProofBoundaries.forbidden}
                  onChange={e => setDraftCore({ ...draftCore, claimsProofBoundaries: { ...draftCore.claimsProofBoundaries, forbidden: e.target.value } })}
                />
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-4">Voice and Language DNA</h3>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Overall Tone</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={2}
                  value={draftCore.voiceAndLanguage.tone}
                  onChange={e => setDraftCore({ ...draftCore, voiceAndLanguage: { ...draftCore.voiceAndLanguage, tone: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Words and Phrases to Avoid</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={2}
                  value={draftCore.voiceAndLanguage.avoidPhrases}
                  onChange={e => setDraftCore({ ...draftCore, voiceAndLanguage: { ...draftCore.voiceAndLanguage, avoidPhrases: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">AI-Style Phrases to Avoid</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={2}
                  value={draftCore.voiceAndLanguage.aiPhrasesToAvoid}
                  onChange={e => setDraftCore({ ...draftCore, voiceAndLanguage: { ...draftCore.voiceAndLanguage, aiPhrasesToAvoid: e.target.value } })}
                />
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-4">Visual DNA</h3>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Visual Atmosphere</label>
                <textarea
                  className="w-full p-2 border border-coh-gold/20 rounded bg-transparent focus:outline-none focus:border-coh-gold text-sm"
                  rows={2}
                  value={draftCore.visualDNA.atmosphere}
                  onChange={e => setDraftCore({ ...draftCore, visualDNA: { ...draftCore.visualDNA, atmosphere: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-coh-navy/80 mb-1">Clichés to Avoid</label>
                <textarea
                  className="w-full p-2 border border-red-200 bg-red-50/30 rounded focus:outline-none focus:border-red-400 text-sm text-red-900"
                  rows={3}
                  value={draftCore.visualDNA.clichesToAvoid}
                  onChange={e => setDraftCore({ ...draftCore, visualDNA: { ...draftCore.visualDNA, clichesToAvoid: e.target.value } })}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'revision' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-4">Revision & Quality Standards</h3>
              <p className="text-xs text-coh-navy/60">Logic connected to Revision Studio action buttons.</p>
              <div className="space-y-3">
                {draftCore.revisionStandards.map((rev, i) => (
                  <div key={i} className="p-3 border border-coh-gold/20 rounded bg-coh-cream/30">
                    <span className="font-bold text-sm block mb-1 text-coh-navy">{rev.action}</span>
                    <div className="text-xs space-y-1">
                      <div><span className="font-semibold text-coh-navy/60">Does:</span> {rev.does}</div>
                      <div><span className="font-semibold text-coh-navy/60">Avoids:</span> {rev.avoids}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-4 text-center py-12">
              <h3 className="font-serif text-xl font-bold text-coh-navy mb-2">Learning Inbox</h3>
              <p className="text-sm text-coh-navy/60">Learning suggestions from revisions and feedback will appear here in a future version.</p>
              <div className="inline-block px-4 py-2 bg-coh-cream rounded border border-coh-gold/20 text-xs text-coh-navy/40 font-mono mt-4">
                0 items awaiting review
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

// --- Interfaces ---

export interface EditorialStrategy {
  planningPeriod: string;
  phase: string;
  objective: string;
  audience: string;
  activeChannels: string[];
  intensity: string;
  constraints: string;
  notes: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  relevance: string;
  audience: string;
  pillar: string;
  notes: string;
  include: boolean;
}

export interface ContentRhythm {
  id: string;
  channel: string;
  frequency: string;
  contentNeed: string;
  pillar: string;
  audience: string;
  priority: string;
}

export interface CalendarItem {
  id: string;
  date: string;
  channel: string;
  unitType: string;
  pillar: string;
  audience: string;
  adoptionTrack: string;
  coreMessage: string;
  sourceBasis: string;
  visualNeed: string;
  riskLevel: string;
  status: string;
  reason: string;
}

interface Props {
  onHandoff: (workItem: any) => void;
}

// --- Constants ---

const PHASES = [
  'Proof of attention', 'Proof of delivery', 'Proof of adoption', 
  'Sponsorship development', 'Partner development', 'Event build-up', 
  'Post-event conversion', 'Maintenance rhythm', 'Institutional positioning'
];

const OBJECTIVES = [
  'Build institutional credibility', 'Explain COH as a cultural engine', 
  'Strengthen sponsor confidence', 'Prepare for event visibility', 
  'Build Tetralogy understanding', 'Convert source material into content', 
  'Support partner development', 'Maintain narrative continuity', 
  'Generate audience education', 'Other / custom'
];

const CHANNELS = [
  'LinkedIn', 'Instagram', 'Facebook', 'TikTok', 'X', 'Newsletter', 
  'Website', 'Email / Direct Outreach', 'WhatsApp', 'Sponsor Pitch', 
  'Partner Proposal', 'Press / Media Note', 'Event Invitation', 'Internal Update'
];

const EVENT_TYPES = [
  'COH event', 'Production milestone', 'Partner moment', 'Grant deadline', 
  'Climate event', 'Cultural event', 'Opera / arts event', 'Media opportunity', 
  'Newsletter cycle', 'Internal review', 'Other'
];

const EVENT_RELEVANCE = ['High relevance', 'Medium relevance', 'Weak relevance', 'Ignore'];

const CONTENT_NEEDS = [
  'Institutional proof', 'Canon-building', 'Tetralogy explanation', 'Visual memory', 
  'Partner logic', 'Documentary / media logic', 'Climate literacy', 'Event build-up', 
  'Post-event conversion', 'Sponsorship credibility', 'Maintenance content'
];

const STRATEGIC_PILLARS = [
  'Opera Production and Repertoire', 'Documentary and Media', 'Cultural Durability', 
  'Strategic Partners', 'Climate Literacy', 'Education and Community', 
  'Sponsorship and Institutional Adoption', 'Website and Digital Presence'
];

const UNIT_TYPES = [
  'Canon Essay Unit', 'Milestone Proof Unit', 'Element Discipline Unit', 
  'Partner Spotlight Unit', 'Documentary Log Unit', 'Premiere Proof Unit', 
  'Educational Explainer', 'Sponsor-Facing Update', 'Newsletter Reflection', 
  'Event Build-Up Post', 'Post-Event Conversion Post', 'Website Update', 
  'Direct Outreach Message'
];

const ADOPTION_TRACKS = ['Canon', 'Touring', 'Institutional', 'Sponsor', 'Public Audience', 'Media'];

const RISK_LEVELS = ['Low', 'Medium', 'High', 'Needs review'];

const STATUS_OPTIONS = ['Proposed', 'Needs review', 'Approved for drafting', 'Drafted', 'Revised', 'Ready for publishing'];

export const EditorialCalendarStudio: React.FC<Props> = ({ onHandoff }) => {
  const [strategy, setStrategy] = useState<EditorialStrategy>({
    planningPeriod: 'Q3 2026',
    phase: 'Proof of delivery',
    objective: 'Build institutional credibility',
    audience: 'Institutional Partners',
    activeChannels: ['LinkedIn', 'Newsletter'],
    intensity: 'Medium (2-3 items/week)',
    constraints: '',
    notes: ''
  });

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [rhythms, setRhythms] = useState<ContentRhythm[]>([]);
  const [recommendations, setRecommendations] = useState<CalendarItem[]>([]);

  // Local helper for ID gen
  const genId = () => Math.random().toString(36).substr(2, 9);

  // Strength Check Logic
  const strengthCheck = () => {
    const strengths: string[] = [];
    const gaps: string[] = [];
    const risks: string[] = [];

    // Basic stats
    const hasLinkedIn = recommendations.some(r => r.channel === 'LinkedIn');
    const hasVisual = recommendations.some(r => r.visualNeed && r.visualNeed.toLowerCase() !== 'none');
    const hasSource = recommendations.some(r => r.sourceBasis && r.sourceBasis.trim() !== '');

    if (hasLinkedIn) strengths.push('LinkedIn institutional channel is active.');
    else gaps.push('No LinkedIn institutional content recommended.');

    if (hasVisual) strengths.push('Visual-memory content is included.');
    else gaps.push('No visual-memory content recommended.');

    if (strategy.objective.includes('sponsor') && !recommendations.some(r => r.adoptionTrack === 'Sponsor' || r.unitType === 'Sponsor-Facing Update')) {
      gaps.push('Objective targets sponsorship, but no sponsor-facing items found.');
    }

    if (!hasSource && recommendations.length > 0) {
      risks.push('No source basis provided for any recommendations. Risk of generic content.');
    }

    const eventRelated = recommendations.filter(r => r.unitType.includes('Event')).length;
    if (recommendations.length > 0 && eventRelated / recommendations.length > 0.5) {
      risks.push('Too many event-related items. Ensure institutional and canon content balances event content.');
    }

    const missingAudience = recommendations.some(r => !r.audience);
    if (missingAudience) gaps.push('Some items are missing an audience definition.');

    const missingTrack = recommendations.some(r => !r.adoptionTrack);
    if (missingTrack) gaps.push('Some items are missing an adoption track.');

    let status = 'Not ready';
    if (recommendations.length > 0 && gaps.length === 0 && risks.length === 0) status = 'Strong';
    else if (recommendations.length > 0 && (gaps.length > 0 || risks.length > 0)) status = 'Needs improvement';

    return { status, strengths, gaps, risks };
  };

  const check = strengthCheck();

  const handleHandoff = (item: CalendarItem) => {
    // Map CalendarItem to WorkItem structure for Content Workspace
    const workItem = {
      id: `cal-${item.id}`,
      title: `${item.unitType}: ${item.coreMessage || 'New Draft'}`,
      type: item.unitType,
      channel: item.channel,
      audience: item.audience,
      purpose: item.pillar, // Maps pillar to purpose conceptually
      status: 'Idea',
      sourceContext: `Source Basis: ${item.sourceBasis}\\nAdoption Track: ${item.adoptionTrack}\\nRisk Notes: ${item.riskLevel}\\nReason: ${item.reason}`,
      draftVersions: [],
      imageResults: []
    };
    onHandoff(workItem);
  };

  return (
    <div className="page-shell">
      <div className="page-header border-b border-coh-gold/20 pb-6">
        <h2 className="page-title flex items-center gap-2">
          <Calendar size={24} /> Editorial Calendar Studio
        </h2>
        <p className="text-sm text-coh-navy/60 font-sans mt-2">
          Translate Operating Core logic, events, and channel roles into a structured content rhythm.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* Module 1: Strategy Setup */}
          <div className="card p-5">
            <h3 className="font-serif font-bold text-lg border-b border-coh-gold/15 pb-2 mb-4">1. Editorial Strategy Setup</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Planning Period</label>
                <input type="text" className="form-control" value={strategy.planningPeriod} onChange={e => setStrategy({...strategy, planningPeriod: e.target.value})} placeholder="e.g. Q3 2026" />
              </div>
              <div>
                <label className="block font-semibold mb-1">Strategic Phase</label>
                <select className="form-control" value={strategy.phase} onChange={e => setStrategy({...strategy, phase: e.target.value})}>
                  {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Primary Objective</label>
                <select className="form-control" value={strategy.objective} onChange={e => setStrategy({...strategy, objective: e.target.value})}>
                  {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Priority Audience</label>
                <input type="text" className="form-control" value={strategy.audience} onChange={e => setStrategy({...strategy, audience: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Module 5: Strength Check */}
          <div className="card p-5 bg-coh-navy text-coh-cream border-coh-navy">
            <h3 className="font-serif font-bold text-lg border-b border-coh-cream/20 pb-2 mb-4">5. Calendar Strength Check</h3>
            <div className="mb-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded text-xs font-bold ${
                check.status === 'Strong' ? 'bg-green-500/20 text-green-300' : 
                check.status === 'Needs improvement' ? 'bg-yellow-500/20 text-yellow-300' : 
                'bg-red-500/20 text-red-300'
              }`}>
                {check.status === 'Strong' && <CheckCircle2 size={14}/>}
                {check.status !== 'Strong' && <AlertTriangle size={14}/>}
                Status: {check.status}
              </span>
            </div>
            
            <div className="space-y-4 text-xs">
              {check.strengths.length > 0 && (
                <div>
                  <h4 className="text-green-300 font-bold mb-1">Strengths</h4>
                  <ul className="list-disc pl-4 space-y-1 text-coh-cream/80">
                    {check.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {check.gaps.length > 0 && (
                <div>
                  <h4 className="text-yellow-300 font-bold mb-1">Gaps</h4>
                  <ul className="list-disc pl-4 space-y-1 text-coh-cream/80">
                    {check.gaps.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}
              {check.risks.length > 0 && (
                <div>
                  <h4 className="text-red-300 font-bold mb-1">Risks</h4>
                  <ul className="list-disc pl-4 space-y-1 text-coh-cream/80">
                    {check.risks.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Module 2: Event Horizon */}
          <div className="card p-5">
            <div className="flex justify-between items-center border-b border-coh-gold/15 pb-2 mb-4">
              <h3 className="font-serif font-bold text-lg">2. Event Horizon</h3>
              <Button size="sm" variant="outline" onClick={() => setEvents([...events, { id: genId(), title: '', date: '', type: EVENT_TYPES[0], relevance: EVENT_RELEVANCE[0], audience: '', pillar: STRATEGIC_PILLARS[0], notes: '', include: true }])}>
                <Plus size={14} className="mr-1" /> Add Event
              </Button>
            </div>
            
            {events.length === 0 ? (
              <p className="text-xs text-coh-navy/50 italic">No events tracked for this period. Add an event to track possible content hooks.</p>
            ) : (
              <div className="space-y-4">
                {events.map(ev => (
                  <div key={ev.id} className="grid grid-cols-12 gap-3 items-end bg-coh-cream/50 p-3 rounded border border-coh-gold/10">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Title</label>
                      <input type="text" className="form-control p-1 text-xs" value={ev.title} onChange={e => setEvents(events.map(v => v.id === ev.id ? {...v, title: e.target.value} : v))} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Date</label>
                      <input type="date" className="form-control p-1 text-xs" value={ev.date} onChange={e => setEvents(events.map(v => v.id === ev.id ? {...v, date: e.target.value} : v))} />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Type</label>
                      <select className="form-control p-1 text-xs" value={ev.type} onChange={e => setEvents(events.map(v => v.id === ev.id ? {...v, type: e.target.value} : v))}>
                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Relevance</label>
                      <select className="form-control p-1 text-xs" value={ev.relevance} onChange={e => setEvents(events.map(v => v.id === ev.id ? {...v, relevance: e.target.value} : v))}>
                        {EVENT_RELEVANCE.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1 text-center">
                      <button onClick={() => setEvents(events.filter(v => v.id !== ev.id))} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Module 3: Content Rhythm */}
          <div className="card p-5">
            <div className="flex justify-between items-center border-b border-coh-gold/15 pb-2 mb-4">
              <h3 className="font-serif font-bold text-lg">3. Content Rhythm</h3>
              <Button size="sm" variant="outline" onClick={() => setRhythms([...rhythms, { id: genId(), channel: CHANNELS[0], frequency: 'Weekly', contentNeed: CONTENT_NEEDS[0], pillar: STRATEGIC_PILLARS[0], audience: '', priority: 'High' }])}>
                <Plus size={14} className="mr-1" /> Add Rule
              </Button>
            </div>
            {rhythms.length === 0 ? (
              <p className="text-xs text-coh-navy/50 italic">Define the content rhythm across your active channels.</p>
            ) : (
              <div className="space-y-4">
                {rhythms.map(r => (
                  <div key={r.id} className="grid grid-cols-12 gap-3 items-end bg-coh-cream/50 p-3 rounded border border-coh-gold/10">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Channel</label>
                      <select className="form-control p-1 text-xs" value={r.channel} onChange={e => setRhythms(rhythms.map(v => v.id === r.id ? {...v, channel: e.target.value} : v))}>
                        {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Content Need</label>
                      <select className="form-control p-1 text-xs" value={r.contentNeed} onChange={e => setRhythms(rhythms.map(v => v.id === r.id ? {...v, contentNeed: e.target.value} : v))}>
                        {CONTENT_NEEDS.map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div className="col-span-4">
                      <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Pillar</label>
                      <select className="form-control p-1 text-xs" value={r.pillar} onChange={e => setRhythms(rhythms.map(v => v.id === r.id ? {...v, pillar: e.target.value} : v))}>
                        {STRATEGIC_PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1 text-center">
                      <button onClick={() => setRhythms(rhythms.filter(v => v.id !== r.id))} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Module 4 & 6: Recommendations & Handoff */}
          <div className="card p-5">
            <div className="flex justify-between items-center border-b border-coh-gold/15 pb-2 mb-4">
              <h3 className="font-serif font-bold text-lg">4. Calendar Recommendations</h3>
              <Button size="sm" onClick={() => setRecommendations([...recommendations, { 
                id: genId(), date: '', channel: CHANNELS[0], unitType: UNIT_TYPES[0], 
                pillar: STRATEGIC_PILLARS[0], audience: '', adoptionTrack: ADOPTION_TRACKS[0], 
                coreMessage: '', sourceBasis: '', visualNeed: '', riskLevel: 'Low', 
                status: 'Proposed', reason: '' 
              }])}>
                <Plus size={14} className="mr-1" /> Add Draft Proposal
              </Button>
            </div>

            {recommendations.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗓️</div>
                <h4 className="empty-state-title">No Draft Proposals</h4>
                <p className="empty-state-text">Create specific calendar recommendations to bridge your strategy with content creation.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {recommendations.map(rec => (
                  <div key={rec.id} className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2 items-center">
                        <select className="form-control p-1 text-xs font-bold bg-coh-cream w-32" value={rec.status} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, status: e.target.value} : v))}>
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {rec.status === 'Approved for drafting' && (
                          <Button size="sm" onClick={() => handleHandoff(rec)}>
                            Create Draft <ArrowRight size={14} className="ml-1" />
                          </Button>
                        )}
                      </div>
                      <button onClick={() => setRecommendations(recommendations.filter(v => v.id !== rec.id))} className="text-red-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Channel & Date</label>
                        <div className="flex gap-2">
                          <input type="date" className="form-control p-1 text-xs w-24" value={rec.date} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, date: e.target.value} : v))} />
                          <select className="form-control p-1 text-xs flex-1" value={rec.channel} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, channel: e.target.value} : v))}>
                            {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Unit Type</label>
                        <select className="form-control p-1 text-xs w-full" value={rec.unitType} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, unitType: e.target.value} : v))}>
                          {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Pillar</label>
                        <select className="form-control p-1 text-xs w-full" value={rec.pillar} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, pillar: e.target.value} : v))}>
                          {STRATEGIC_PILLARS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>

                      <div className="col-span-6">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Core Message / Brief</label>
                        <textarea className="form-control p-2 text-xs w-full" rows={2} value={rec.coreMessage} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, coreMessage: e.target.value} : v))} />
                      </div>
                      <div className="col-span-6">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Source Basis (Required)</label>
                        <textarea className="form-control p-2 text-xs w-full" rows={2} value={rec.sourceBasis} placeholder="Which doc/fact supports this?" onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, sourceBasis: e.target.value} : v))} />
                      </div>

                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Adoption Track</label>
                        <select className="form-control p-1 text-xs w-full" value={rec.adoptionTrack} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, adoptionTrack: e.target.value} : v))}>
                          {ADOPTION_TRACKS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Audience</label>
                        <input type="text" className="form-control p-1 text-xs w-full" value={rec.audience} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, audience: e.target.value} : v))} />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-[10px] font-bold text-coh-navy/60 mb-1">Risk Level</label>
                        <select className="form-control p-1 text-xs w-full" value={rec.riskLevel} onChange={e => setRecommendations(recommendations.map(v => v.id === rec.id ? {...v, riskLevel: e.target.value} : v))}>
                          {RISK_LEVELS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

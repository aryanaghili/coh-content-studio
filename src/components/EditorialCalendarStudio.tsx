import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Plus, Trash2, ArrowRight, Settings2, LayoutList, LayoutGrid, X, FileText, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

// --- Core Data Models ---

export interface EditorialCycle {
  id: string;
  month: string;
  year: number;
  strategicFocus: string;
  priorityAudience: string;
  activeChannels: string[];
  intensity: 'Low (1-2 items/week)' | 'Medium (3-4 items/week)' | 'High (5+ items/week)';
  status: string;
  notes: string;
}

export interface ImportantMoment {
  id: string;
  title: string;
  date: string;
  type: string;
  influenceLevel: string;
  notes: string;
  includeInCalendar: boolean;
}

export interface BaselineRhythmRule {
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
  format: string;
  contentUnitType: string;
  pillar: string;
  audience: string;
  adoptionTrack: string;
  coreMessage: string;
  sourceBasis: string;
  visualNeed: string;
  reasonForRecommendation: string;
  riskLevel: string;
  status: string;
  createdFrom?: string;
  handoffPayload?: any;
}

export interface CalendarReview {
  status: 'Strong' | 'Needs improvement' | 'Not ready';
  strengths: string[];
  gaps: string[];
  risks: string[];
  recommendedFixes: string[];
}

interface Props {
  onHandoff: (workItem: any) => void;
}

// --- Constants & Options ---
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const STRATEGIC_FOCUSES = ['Sponsorship & Partnerships', 'Canon & Cultural Durability', 'Event & Premiere Build-up', 'Institutional Credibility', 'Climate Literacy'];
const CHANNELS = ['LinkedIn', 'Instagram', 'Newsletter', 'Website', 'X', 'Facebook', 'TikTok', 'Email', 'WhatsApp', 'Sponsor Pitch', 'Partner Proposal', 'Press Note', 'Event Invitation', 'Internal Update'];
const PILLARS = ['Opera Production and Repertoire', 'Documentary and Media', 'Cultural Durability', 'Strategic Partners', 'Climate Literacy', 'Education and Community', 'Sponsorship and Institutional Adoption'];
const AUDIENCES = ['Institutional Partners', 'Sponsors', 'General Public', 'Media', 'Cultural Consumers', 'Donors', 'Internal Team'];
const ADOPTION_TRACKS = ['Canon', 'Touring', 'Institutional', 'Sponsor', 'Public Audience', 'Media'];
const UNIT_TYPES = ['Canon Essay Unit', 'Milestone Proof Unit', 'Element Discipline Unit', 'Partner Spotlight Unit', 'Documentary Log Unit', 'Premiere Proof Unit', 'Educational Explainer', 'Sponsor-Facing Update', 'Newsletter Reflection'];
const EVENT_TYPES = ['COH event', 'Production milestone', 'Partner moment', 'Grant deadline', 'Climate event', 'Cultural event'];

export const EditorialCalendarStudio: React.FC<Props> = ({ onHandoff }) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const [cycle, setCycle] = useState<EditorialCycle>({
    id: 'cycle-1',
    month: MONTHS[currentMonthIdx],
    year: currentYear,
    strategicFocus: STRATEGIC_FOCUSES[0],
    priorityAudience: AUDIENCES[0],
    activeChannels: ['LinkedIn', 'Newsletter', 'Instagram'],
    intensity: 'Medium (3-4 items/week)',
    status: 'Planning',
    notes: ''
  });

  const [moments, setMoments] = useState<ImportantMoment[]>([]);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [review, setReview] = useState<CalendarReview>({ status: 'Not ready', strengths: [], gaps: [], risks: [], recommendedFixes: [] });
  const [viewMode, setViewMode] = useState<'List' | 'Week' | 'Month'>('List');
  
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // --- Helpers ---
  const genId = () => Math.random().toString(36).substr(2, 9);
  
  const getDaysInMonth = (month: string, year: number) => {
    const monthIdx = MONTHS.indexOf(month);
    return new Date(year, monthIdx + 1, 0).getDate();
  };

  const getDayOfWeek = (month: string, year: number, day: number) => {
    const monthIdx = MONTHS.indexOf(month);
    return new Date(year, monthIdx, day).getDay();
  };

  // --- Logic Rules ---
  const runCalendarReview = (currentItems: CalendarItem[]) => {
    const strengths: string[] = [];
    const gaps: string[] = [];
    const risks: string[] = [];
    const recommendedFixes: string[] = [];

    const hasLinkedIn = currentItems.some(i => i.channel === 'LinkedIn');
    const hasVisual = currentItems.some(i => i.visualNeed && i.visualNeed.toLowerCase() !== 'none');
    const hasSponsor = currentItems.some(i => i.adoptionTrack === 'Sponsor' || i.audience === 'Sponsors');
    const hasNewsletter = currentItems.some(i => i.channel === 'Newsletter');
    
    if (cycle.activeChannels.includes('LinkedIn') && !hasLinkedIn) gaps.push('No LinkedIn institutional content planned despite active channel.');
    if (!hasVisual) gaps.push('No visual-memory content planned.');
    if (cycle.strategicFocus.includes('Sponsor') && !hasSponsor) risks.push('Sponsorship focus selected, but no sponsor-facing items planned.');
    if (!hasNewsletter) gaps.push('No newsletter or long-form item planned for deeper explanation.');

    const eventRelated = currentItems.filter(i => i.contentUnitType.includes('Event') || i.reasonForRecommendation.includes('Event')).length;
    if (currentItems.length > 0 && eventRelated / currentItems.length > 0.5) {
      risks.push('Too many event-based items. Maintain institutional and canon balance.');
    }

    currentItems.forEach(item => {
      if (!item.sourceBasis) risks.push(`Missing source basis for ${item.date} item. Risk of generic climate language.`);
      if (!item.audience) gaps.push(`Missing audience definition for ${item.date} item.`);
      if (!item.adoptionTrack) gaps.push(`Missing adoption track for ${item.date} item.`);
    });

    if (hasLinkedIn && hasNewsletter) strengths.push('Good core channel baseline (LinkedIn + Newsletter).');
    if (currentItems.length > 0 && currentItems.every(i => i.sourceBasis)) strengths.push('Strong source basis across all items.');

    let status: CalendarReview['status'] = 'Not ready';
    if (currentItems.length > 0 && gaps.length === 0 && risks.length === 0) status = 'Strong';
    else if (currentItems.length > 0) status = 'Needs improvement';

    setReview({ status, strengths, gaps, risks, recommendedFixes });
  };

  const generateMonthlyCalendar = () => {
    const newItems: CalendarItem[] = [];
    const days = getDaysInMonth(cycle.month, cycle.year);
    
    // Add moments
    moments.filter(m => m.includeInCalendar).forEach(m => {
      newItems.push({
        id: genId(),
        date: m.date,
        channel: cycle.activeChannels[0] || 'LinkedIn',
        format: 'General / Custom',
        contentUnitType: 'Event Build-Up Post',
        pillar: PILLARS[0],
        audience: cycle.priorityAudience,
        adoptionTrack: ADOPTION_TRACKS[0],
        coreMessage: `Highlight: ${m.title}`,
        sourceBasis: 'Operating Core Event Definition',
        visualNeed: 'High',
        reasonForRecommendation: `Aligned with important moment: ${m.title}`,
        riskLevel: 'Low',
        status: 'Proposed'
      });
    });

    // Determine weekly count
    let itemsPerWeek = 2;
    if (cycle.intensity.includes('Medium')) itemsPerWeek = 3;
    if (cycle.intensity.includes('High')) itemsPerWeek = 5;

    let dayCounter = 1;
    let weekCounter = 1;

    // Hardcoded simple scattering algorithm for the month
    while (dayCounter <= days) {
      const currentDayOfWeek = getDayOfWeek(cycle.month, cycle.year, dayCounter);
      
      // Only generate on weekdays (1-5) generally
      if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
        // Pseudo-random distribution based on intensity
        if ((dayCounter % Math.floor(5 / itemsPerWeek)) === 0 || itemsPerWeek >= 5) {
          const dateStr = `${cycle.year}-${String(MONTHS.indexOf(cycle.month) + 1).padStart(2, '0')}-${String(dayCounter).padStart(2, '0')}`;
          
          // Don't duplicate exact dates if moment already exists
          if (!newItems.some(i => i.date === dateStr)) {
            const channel = cycle.activeChannels[dayCounter % cycle.activeChannels.length] || 'LinkedIn';
            const isLinkedIn = channel === 'LinkedIn';
            const isNewsletter = channel === 'Newsletter';

            newItems.push({
              id: genId(),
              date: dateStr,
              channel: channel,
              format: isNewsletter ? 'Executive Summary' : 'Paragraphs',
              contentUnitType: isLinkedIn ? 'Milestone Proof Unit' : (isNewsletter ? 'Newsletter Reflection' : 'Canon Essay Unit'),
              pillar: PILLARS[dayCounter % PILLARS.length],
              audience: cycle.priorityAudience,
              adoptionTrack: isLinkedIn ? 'Institutional' : 'Public Audience',
              coreMessage: `Strategic narrative focus for ${cycle.month} Week ${weekCounter}`,
              sourceBasis: 'Requires validation',
              visualNeed: isLinkedIn ? 'Medium' : 'High',
              reasonForRecommendation: `Baseline publishing rhythm (${cycle.intensity})`,
              riskLevel: 'Needs review',
              status: 'Proposed'
            });
          }
        }
      }
      
      if (currentDayOfWeek === 0) weekCounter++;
      dayCounter++;
    }

    const sortedItems = newItems.sort((a, b) => a.date.localeCompare(b.date));
    setItems(sortedItems);
    runCalendarReview(sortedItems);
  };

  const handleUpdateItem = (id: string, updates: Partial<CalendarItem>) => {
    const newItems = items.map(i => i.id === id ? { ...i, ...updates } : i);
    setItems(newItems);
    runCalendarReview(newItems);
  };

  const handleRemoveItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    runCalendarReview(newItems);
  };

  const handleCreateDraft = (item: CalendarItem) => {
    const handoffPayload = {
      id: `cal-${item.id}`,
      title: `${item.contentUnitType}: ${item.coreMessage || 'New Draft'}`,
      type: item.contentUnitType,
      channel: item.channel,
      audience: item.audience,
      purpose: item.pillar, 
      status: 'Idea',
      sourceContext: `Source Basis: ${item.sourceBasis}\nAdoption Track: ${item.adoptionTrack}\nRisk Notes: ${item.riskLevel}\nReason: ${item.reasonForRecommendation}\nFormat: ${item.format}`,
      draftVersions: [],
      imageResults: [],
      revisionHistory: [],
      approved: false,
      saved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    onHandoff(handoffPayload);
  };

  const toggleChannel = (ch: string) => {
    if (cycle.activeChannels.includes(ch)) {
      setCycle({ ...cycle, activeChannels: cycle.activeChannels.filter(c => c !== ch) });
    } else {
      setCycle({ ...cycle, activeChannels: [...cycle.activeChannels, ch] });
    }
  };

  const sortedItemsList = [...items].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="page-shell h-full flex flex-col">
      <div className="page-header border-b border-coh-gold/20 pb-4 shrink-0">
        <h2 className="page-title flex items-center gap-2">
          <Calendar size={24} className="text-coh-gold" /> Editorial Calendar Studio
        </h2>
        <p className="text-sm text-coh-navy/60 font-sans mt-1">
          Plan your monthly editorial rhythm. Recommendations are guided by Operating Core.
        </p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Planning Area */}
        <div className="flex-1 flex flex-col overflow-y-auto border-r border-coh-gold/20">
          
          {/* HEADER PARAMETERS */}
          <div className="bg-white p-5 border-b border-coh-gold/20 shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-bold text-coh-navy">Monthly Planning Parameters</h3>
              <Button onClick={() => setShowAdvancedSettings(!showAdvancedSettings)} variant="outline" size="sm" className="text-xs">
                <Settings2 size={14} className="mr-2 inline" /> Advanced Strategy
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Planning Month</label>
                <div className="flex gap-2">
                  <select className="form-control p-1.5 flex-1" value={cycle.month} onChange={e => setCycle({...cycle, month: e.target.value})}>
                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input type="number" className="form-control p-1.5 w-20" value={cycle.year} onChange={e => setCycle({...cycle, year: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Strategic Focus</label>
                <select className="form-control p-1.5" value={cycle.strategicFocus} onChange={e => setCycle({...cycle, strategicFocus: e.target.value})}>
                  {STRATEGIC_FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Priority Audience</label>
                <select className="form-control p-1.5" value={cycle.priorityAudience} onChange={e => setCycle({...cycle, priorityAudience: e.target.value})}>
                  {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Publishing Intensity</label>
                <select className="form-control p-1.5" value={cycle.intensity} onChange={e => setCycle({...cycle, intensity: e.target.value as EditorialCycle['intensity']})}>
                  {['Low (1-2 items/week)', 'Medium (3-4 items/week)', 'High (5+ items/week)'].map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Active Channels</label>
              <div className="flex flex-wrap gap-2">
                {CHANNELS.slice(0, 7).map(ch => (
                  <button 
                    key={ch}
                    onClick={() => toggleChannel(ch)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors border ${
                      cycle.activeChannels.includes(ch) 
                      ? 'bg-coh-navy text-coh-gold border-coh-navy' 
                      : 'bg-white text-coh-navy/60 border-coh-gold/30 hover:border-coh-gold'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings Collapse */}
            {showAdvancedSettings && (
              <div className="mt-4 p-4 bg-coh-cream/30 border border-coh-gold/20 rounded">
                <h4 className="font-bold text-xs uppercase text-coh-navy mb-2">Important Moments</h4>
                <div className="space-y-2 mb-4">
                  {moments.map(m => (
                    <div key={m.id} className="flex gap-2 items-center text-xs">
                      <input type="date" className="form-control p-1 w-32" value={m.date} onChange={e => setMoments(moments.map(x => x.id === m.id ? {...x, date: e.target.value} : x))} />
                      <input type="text" className="form-control p-1 flex-1" value={m.title} placeholder="Title" onChange={e => setMoments(moments.map(x => x.id === m.id ? {...x, title: e.target.value} : x))} />
                      <button onClick={() => setMoments(moments.filter(x => x.id !== m.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="text-[10px] py-1" onClick={() => setMoments([...moments, {id: genId(), title:'', date:'', type: EVENT_TYPES[0], influenceLevel:'Medium', notes:'', includeInCalendar: true}])}>
                    <Plus size={12} className="mr-1 inline"/> Add Moment
                  </Button>
                </div>
                <h4 className="font-bold text-xs uppercase text-coh-navy mb-2">Baseline Rhythm Rules</h4>
                <p className="text-xs text-coh-navy/60 mb-2">Rules can be configured to tightly bound generation to Operating Core maintenance needs.</p>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <Button onClick={generateMonthlyCalendar} variant="primary" className="shadow-sm font-semibold">
                Generate Monthly Calendar
              </Button>
              <Button onClick={() => {
                const manual: CalendarItem = { id: genId(), date: `${cycle.year}-${String(MONTHS.indexOf(cycle.month) + 1).padStart(2, '0')}-01`, channel: cycle.activeChannels[0], format: 'General / Custom', contentUnitType: UNIT_TYPES[0], pillar: PILLARS[0], audience: cycle.priorityAudience, adoptionTrack: ADOPTION_TRACKS[0], coreMessage: '', sourceBasis: '', visualNeed: 'Medium', reasonForRecommendation: 'Manual override', riskLevel: 'Low', status: 'Proposed' };
                setItems([...items, manual]);
                runCalendarReview([...items, manual]);
              }} variant="outline">
                <Plus size={16} className="mr-1 inline" /> Add Manual Item
              </Button>
            </div>
          </div>

          {/* CALENDAR CANVAS */}
          <div className="flex-1 bg-coh-cream/10 p-5 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg font-bold text-coh-navy">Calendar Canvas</h3>
              <div className="flex gap-1 bg-white border border-coh-gold/30 rounded p-0.5">
                <button onClick={() => setViewMode('List')} className={`p-1.5 rounded transition-colors ${viewMode === 'List' ? 'bg-coh-cream text-coh-navy shadow-sm' : 'text-coh-navy/50 hover:text-coh-navy'}`} title="List View"><LayoutList size={16} /></button>
                <button onClick={() => setViewMode('Week')} className={`p-1.5 rounded transition-colors ${viewMode === 'Week' ? 'bg-coh-cream text-coh-navy shadow-sm' : 'text-coh-navy/50 hover:text-coh-navy'}`} title="Week View"><LayoutGrid size={16} /></button>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-coh-navy/40">
                <Calendar size={48} className="mb-4 opacity-50" />
                <p>Generate a calendar to see your items.</p>
              </div>
            ) : viewMode === 'List' ? (
              <div className="space-y-3">
                {sortedItemsList.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="bg-white border border-coh-gold/20 p-3 rounded shadow-sm hover:shadow-md hover:border-coh-gold transition cursor-pointer flex justify-between items-center"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-coh-navy bg-coh-cream px-2 py-0.5 rounded">{item.date}</span>
                        <span className="text-[10px] uppercase font-bold text-coh-gold">{item.channel}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          item.status === 'Needs review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-coh-navy/10 text-coh-navy'
                        }`}>{item.status}</span>
                      </div>
                      <span className="text-sm font-semibold text-coh-navy">{item.contentUnitType}</span>
                      <span className="text-xs text-coh-navy/60 line-clamp-1">{item.coreMessage || 'No core message defined.'}</span>
                    </div>
                    <ChevronRight size={18} className="text-coh-navy/30" />
                  </div>
                ))}
              </div>
            ) : (
              // Month or Week View (Simplified Grid)
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-[10px] uppercase font-bold text-coh-navy/60 mb-2">{day}</div>
                ))}
                
                {Array.from({ length: getDayOfWeek(cycle.month, cycle.year, 1) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-transparent p-2 min-h-[100px]"></div>
                ))}
                
                {Array.from({ length: getDaysInMonth(cycle.month, cycle.year) }).map((_, i) => {
                  const dayNum = i + 1;
                  const dateStr = `${cycle.year}-${String(MONTHS.indexOf(cycle.month) + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const dayItems = items.filter(item => item.date === dateStr);
                  
                  return (
                    <div key={dayNum} className={`bg-white border p-2 min-h-[100px] flex flex-col gap-1 rounded ${dayItems.length > 0 ? 'border-coh-gold/40 shadow-sm' : 'border-coh-gold/10'}`}>
                      <span className="text-[10px] font-bold text-coh-navy/40">{dayNum}</span>
                      {dayItems.map(item => (
                        <div 
                          key={item.id} 
                          onClick={() => setSelectedItem(item)}
                          className="bg-coh-cream p-1 rounded border border-coh-gold/20 cursor-pointer hover:border-coh-gold transition"
                        >
                          <div className="text-[9px] uppercase font-bold text-coh-gold line-clamp-1">{item.channel}</div>
                          <div className="text-[10px] font-semibold text-coh-navy leading-tight line-clamp-2" title={item.contentUnitType}>{item.contentUnitType}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR: REVIEW PANEL */}
        <div className="w-80 bg-white p-5 overflow-y-auto">
          <h3 className="font-serif text-lg font-bold text-coh-navy mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-coh-gold" /> Calendar Review
          </h3>
          
          <div className="mb-6">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold w-full justify-center border ${
              review.status === 'Strong' ? 'bg-green-50 text-green-700 border-green-200' : 
              review.status === 'Needs improvement' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
              'bg-gray-50 text-gray-500 border-gray-200'
            }`}>
              {review.status === 'Strong' && <CheckCircle2 size={14}/>}
              {review.status !== 'Strong' && <AlertTriangle size={14}/>}
              {review.status.toUpperCase()}
            </span>
          </div>

          <div className="space-y-6 text-sm">
            {review.strengths.length > 0 && (
              <div>
                <h4 className="font-bold text-green-700 text-xs uppercase mb-2 flex items-center gap-1"><Plus size={12}/> Strengths</h4>
                <ul className="space-y-2">
                  {review.strengths.map((s, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-green-300">{s}</li>)}
                </ul>
              </div>
            )}
            
            {review.gaps.length > 0 && (
              <div>
                <h4 className="font-bold text-yellow-600 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Gaps</h4>
                <ul className="space-y-2">
                  {review.gaps.map((g, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-yellow-300">{g}</li>)}
                </ul>
              </div>
            )}

            {review.risks.length > 0 && (
              <div>
                <h4 className="font-bold text-red-600 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Risks</h4>
                <ul className="space-y-2">
                  {review.risks.map((r, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-red-300">{r}</li>)}
                </ul>
              </div>
            )}

            {items.length > 0 && review.gaps.length === 0 && review.risks.length === 0 && (
              <p className="text-xs text-coh-navy/60 italic text-center mt-8">Calendar is structurally sound and aligned with Operating Core.</p>
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY MODAL: CALENDAR ITEM DETAILS */}
      {selectedItem && (
        <div className="fixed inset-0 bg-coh-navy/80 z-50 flex justify-center items-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden flex flex-col max-h-full">
            <div className="bg-coh-navy p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <FileText size={18} className="text-coh-gold"/> Calendar Item Details
              </h3>
              <button onClick={() => setSelectedItem(null)} className="hover:text-coh-gold transition"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Date</label>
                  <input type="date" className="form-control p-1.5 w-full text-xs" value={selectedItem.date} onChange={e => handleUpdateItem(selectedItem.id, {date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Status</label>
                  <select className="form-control p-1.5 w-full text-xs" value={selectedItem.status} onChange={e => handleUpdateItem(selectedItem.id, {status: e.target.value})}>
                    {['Proposed', 'Needs review', 'Approved', 'Drafting', 'Ready', 'Published'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Channel</label>
                  <select className="form-control p-1.5 w-full text-xs" value={selectedItem.channel} onChange={e => handleUpdateItem(selectedItem.id, {channel: e.target.value})}>
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Unit Type</label>
                  <select className="form-control p-1.5 w-full text-xs" value={selectedItem.contentUnitType} onChange={e => handleUpdateItem(selectedItem.id, {contentUnitType: e.target.value})}>
                    {UNIT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Pillar</label>
                  <select className="form-control p-1.5 w-full text-xs" value={selectedItem.pillar} onChange={e => handleUpdateItem(selectedItem.id, {pillar: e.target.value})}>
                    {PILLARS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Adoption Track</label>
                  <select className="form-control p-1.5 w-full text-xs" value={selectedItem.adoptionTrack} onChange={e => handleUpdateItem(selectedItem.id, {adoptionTrack: e.target.value})}>
                    {ADOPTION_TRACKS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Core Message</label>
                <textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.coreMessage} onChange={e => handleUpdateItem(selectedItem.id, {coreMessage: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Source Basis (Crucial for Operating Core Compliance)</label>
                <textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.sourceBasis} onChange={e => handleUpdateItem(selectedItem.id, {sourceBasis: e.target.value})} placeholder="What source or context backs this up?" />
              </div>

              <div className="bg-coh-cream/30 p-3 rounded border border-coh-gold/20">
                <p className="text-xs text-coh-navy/80"><strong>Reason:</strong> {selectedItem.reasonForRecommendation}</p>
                <p className="text-xs text-coh-navy/80 mt-1"><strong>Risk Level:</strong> {selectedItem.riskLevel}</p>
              </div>
            </div>

            <div className="p-4 border-t border-coh-gold/20 flex justify-between bg-gray-50 shrink-0">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => { handleRemoveItem(selectedItem.id); setSelectedItem(null); }}>
                Delete Item
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setSelectedItem(null)}>Close</Button>
                <Button variant="primary" onClick={() => {
                  handleUpdateItem(selectedItem.id, {status: 'Approved'});
                  handleCreateDraft(selectedItem);
                  setSelectedItem(null);
                }}>
                  Approve & Create Draft
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

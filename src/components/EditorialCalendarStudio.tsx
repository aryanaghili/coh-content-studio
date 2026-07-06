import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Plus, Trash2, ArrowRight, Settings2, LayoutList, LayoutGrid, X, FileText, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

// --- Core Data Models ---

export interface EditorialCycle {
  id: string;
  planningMonth: string; // YYYY-MM
  strategicFocus: string;
  priorityAudience: string;
  activeChannels: string[];
  intensity: 'Low (1-2 items/week)' | 'Medium (3-4 items/week)' | 'High (5+ items/week)';
  status: string;
  notes: string;
}

export interface MonthlyEditorialArc {
  monthThesis: string;
  weeklyProgression: string[];
  primaryJob: string;
  mainAudienceMovement: string;
  keyRisks: string[];
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

export interface CalendarItem {
  id: string;
  title: string;
  date: string;
  channel: string;
  format: string;
  contentUnitType: string;
  pillar: string;
  audience: string;
  adoptionTrack: string;
  editorialThesis: string;
  coreMessage: string;
  audienceInsight: string;
  sourceBasis: string;
  proofNeeded: string;
  reasonForRecommendation: string;
  visualDirection: string;
  suggestedCTA: string;
  riskToAvoid: string;
  draftInstruction: string;
  status: string;
  riskLevel: string;
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
const STRATEGIC_FOCUSES = ['Sponsorship & Partnerships', 'Canon & Cultural Durability', 'Event & Premiere Build-up', 'Institutional Credibility', 'Climate Literacy'];
const CHANNELS = ['LinkedIn', 'Instagram', 'Newsletter', 'Website', 'X', 'Facebook', 'TikTok', 'Email', 'WhatsApp', 'Sponsor Pitch', 'Partner Proposal', 'Press Note', 'Event Invitation', 'Internal Update'];
const PILLARS = ['Opera Production and Repertoire', 'Documentary and Media', 'Cultural Durability', 'Strategic Partners', 'Climate Literacy', 'Education and Community', 'Sponsorship and Institutional Adoption'];
const AUDIENCES = ['Institutional Partners', 'Sponsors', 'General Public', 'Media', 'Cultural Consumers', 'Donors', 'Internal Team'];
const ADOPTION_TRACKS = ['Canon', 'Touring', 'Institutional', 'Sponsor', 'Public Audience', 'Media'];
const UNIT_TYPES = ['Canon Essay Unit', 'Milestone Proof Unit', 'Element Discipline Unit', 'Partner Spotlight Unit', 'Documentary Log Unit', 'Premiere Proof Unit', 'Educational Explainer', 'Sponsor-Facing Update', 'Newsletter Reflection'];

const genId = () => Math.random().toString(36).substr(2, 9);

// Helper rules
const getChannelLogic = (channel: string) => {
  switch (channel) {
    case 'LinkedIn': return { thesis: "COH is not building a one-off climate event. It is building a repeatable cultural engine where live opera creates the origin asset for content, institutional adoption, sponsorship, and long-term IP.", visual: "Professional imagery, process shots, diagrams", cta: "Engage with our cultural model", format: "Paragraphs" };
    case 'Instagram': return { thesis: "Soria Moria should be shown as visual memory and atmosphere, not as decorative climate imagery.", visual: "High-end visual memory, element-coded storytelling", cta: "Experience the atmosphere", format: "Visual + Short Caption" };
    case 'Newsletter': return { thesis: "The role of live opera in COH is not only performance. It is the moment where the world is created, captured, translated, and extended.", visual: "Documentary stills, deep-read headers", cta: "Read the full reflection", format: "Executive Summary" };
    case 'Sponsor Pitch': return { thesis: "Sponsorship in COH should not be framed as logo visibility. It should be framed as enabling cultural infrastructure for climate transition.", visual: "Proof of value diagrams, audience metrics", cta: "Schedule partnership review", format: "Deck/Pitch" };
    case 'Partner Proposal': return { thesis: "A partner is valuable when they extend production, adoption, distribution, education, capture, or institutional credibility.", visual: "Collaboration models", cta: "Review proposal next steps", format: "Document" };
    case 'Website': return { thesis: "Stable reference, conversion, program explanation, project pages, institutional credibility.", visual: "Clean typography, canonical assets", cta: "Explore more", format: "Web Page" };
    default: return { thesis: "Align communication with core identity and operational goals.", visual: "Standard", cta: "Learn more", format: "Standard" };
  }
};

export const EditorialCalendarStudio: React.FC<Props> = ({ onHandoff }) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;

  const [cycle, setCycle] = useState<EditorialCycle>({
    id: 'cycle-1',
    planningMonth: currentMonthStr,
    strategicFocus: STRATEGIC_FOCUSES[0],
    priorityAudience: AUDIENCES[0],
    activeChannels: ['LinkedIn', 'Newsletter', 'Instagram'],
    intensity: 'Medium (3-4 items/week)',
    status: 'Planning',
    notes: ''
  });

  const [arc, setArc] = useState<MonthlyEditorialArc | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [review, setReview] = useState<CalendarReview>({ status: 'Not ready', strengths: [], gaps: [], risks: [], recommendedFixes: [] });
  const [viewMode, setViewMode] = useState<'List' | 'Week' | 'Month'>('List');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  useEffect(() => {
    generateMonthlyArc();
  }, [cycle.planningMonth, cycle.strategicFocus, cycle.priorityAudience, cycle.activeChannels, cycle.intensity]);

  const generateMonthlyArc = () => {
    // Generate intelligent arc based on selected parameters
    const newArc: MonthlyEditorialArc = {
      monthThesis: `This month should move COH from general visibility toward proof of delivery and institutional credibility, focusing deeply on ${cycle.strategicFocus}.`,
      weeklyProgression: [
        `Week 1: Reintroduce COH as a cultural engine, not an event brand, prioritizing ${cycle.priorityAudience}.`,
        `Week 2: Show proof of delivery, production discipline, and current progress.`,
        `Week 3: Build partner, sponsor, and institutional credibility across ${cycle.activeChannels.join(', ')}.`,
        `Week 4: Convert the month into deeper newsletter, website, and relationship-building content.`
      ],
      primaryJob: `Establish solid ground for ${cycle.strategicFocus} by demonstrating tangible operational progress.`,
      mainAudienceMovement: `Move ${cycle.priorityAudience} from awareness of the concept to active belief in the execution.`,
      keyRisks: [
        'Falling back on generic climate language instead of cultural infrastructure framing.',
        'Focusing too much on hype rather than institutional proof.'
      ]
    };
    setArc(newArc);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month - 1, 1).getDay();

  const handleGenerate = () => {
    const [yearStr, monthStr] = cycle.planningMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = getDaysInMonth(year, month);
    
    let newItems: CalendarItem[] = [];
    let dayCounter = 1;
    let weekCounter = 1;

    let itemsPerWeek = 3;
    if (cycle.intensity === 'Low (1-2 items/week)') itemsPerWeek = 2;
    if (cycle.intensity === 'High (5+ items/week)') itemsPerWeek = 5;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const currentDayOfWeek = date.getDay(); 
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Distribute items
      if (currentDayOfWeek > 0 && currentDayOfWeek < 6) { 
        if (dayCounter % Math.ceil(5 / itemsPerWeek) === 0) {
          if (cycle.activeChannels.length > 0) {
            const channel = cycle.activeChannels[dayCounter % cycle.activeChannels.length];
            const isLinkedIn = channel === 'LinkedIn';
            const isNewsletter = channel === 'Newsletter';
            const unitType = isLinkedIn ? 'Milestone Proof Unit' : (isNewsletter ? 'Newsletter Reflection' : 'Canon Essay Unit');
            
            const logic = getChannelLogic(channel);

            newItems.push({
              id: genId(),
              title: `${unitType} for ${channel}`,
              date: dateStr,
              channel: channel,
              format: logic.format,
              contentUnitType: unitType,
              pillar: PILLARS[dayCounter % PILLARS.length],
              audience: cycle.priorityAudience,
              adoptionTrack: isLinkedIn ? 'Institutional' : 'Public Audience',
              editorialThesis: logic.thesis,
              coreMessage: `Proof of ${cycle.strategicFocus} targeting ${cycle.priorityAudience}`,
              audienceInsight: `This audience needs to see structural progress, not just visionary claims.`,
              sourceBasis: 'Operating Core-backed',
              proofNeeded: 'Recent production milestones or partner commitments',
              reasonForRecommendation: `Aligned with Week ${weekCounter} progression: ${arc?.weeklyProgression[weekCounter-1] || ''}`,
              visualDirection: logic.visual,
              suggestedCTA: logic.cta,
              riskToAvoid: 'Do not use generic placeholder language or hype.',
              draftInstruction: `Write a ${unitType} focusing on ${logic.thesis}`,
              riskLevel: 'Low',
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

  const runCalendarReview = (currentItems: CalendarItem[]) => {
    let s = [];
    let g = [];
    let r = [];
    let recs = [];

    if (currentItems.length === 0) {
      setReview({ status: 'Not ready', strengths: [], gaps: ['No items generated.'], risks: [], recommendedFixes: ['Generate items.'] });
      return;
    }

    s.push(`Generated ${currentItems.length} items aligned with ${cycle.intensity} intensity.`);
    
    // Check Source Basis
    const weakSources = currentItems.filter(i => i.sourceBasis === 'Requires validation' || i.sourceBasis === 'Needs validation');
    if (weakSources.length > 0) {
      g.push(`${weakSources.length} items have weak or default source basis.`);
      recs.push('Assign structured source basis (e.g. Operating Core-backed, Core Document needed).');
    } else {
      s.push('Strong source basis across all items.');
    }

    // Check Generic Language
    const genericItems = currentItems.filter(i => i.editorialThesis.includes('Strategic narrative focus') || !i.editorialThesis);
    if (genericItems.length > 0) {
      r.push(`${genericItems.length} items use generic placeholder editorial theses.`);
      recs.push('Replace placeholder messages with specific editorial theses before drafting.');
    } else {
      s.push('Items have highly specific, channel-tailored editorial theses.');
    }

    const hasLinkedIn = currentItems.some(i => i.channel === 'LinkedIn');
    const hasNewsletter = currentItems.some(i => i.channel === 'Newsletter');
    
    if (hasLinkedIn && hasNewsletter) {
      s.push('Good core channel baseline (LinkedIn + Newsletter).');
    } else if (cycle.activeChannels.includes('LinkedIn') && cycle.activeChannels.includes('Newsletter')) {
      g.push('Missing core channels in the generated items.');
    }

    let status: 'Strong' | 'Needs improvement' | 'Not ready' = 'Strong';
    if (g.length > 1 || r.length > 0) status = 'Needs improvement';
    if (currentItems.length < 2 || genericItems.length > currentItems.length / 2) status = 'Not ready';

    setReview({ status, strengths: s, gaps: g, risks: r, recommendedFixes: recs });
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
      title: item.title || `${item.contentUnitType} Draft`,
      type: item.contentUnitType,
      channel: item.channel,
      format: item.format,
      audience: item.audience,
      strategicPillar: item.pillar,
      adoptionTrack: item.adoptionTrack,
      editorialThesis: item.editorialThesis,
      coreMessage: item.coreMessage,
      audienceInsight: item.audienceInsight,
      sourceBasis: item.sourceBasis,
      proofNeeded: item.proofNeeded,
      visualDirection: item.visualDirection,
      suggestedCTA: item.suggestedCTA,
      riskToAvoid: item.riskToAvoid,
      draftInstruction: item.draftInstruction,
      createdAt: new Date().toISOString()
    };
    onHandoff(handoffPayload);
  };

  const renderMonthView = () => {
    if (items.length === 0) return null;
    
    const [yearStr, monthStr] = cycle.planningMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="bg-gray-50/50 border border-gray-100 rounded min-h-[120px]" />);
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayItems = items.filter(item => item.date === dateStr);
      
      return (
        <div key={dayNum} className={`bg-white border p-2 min-h-[120px] flex flex-col gap-1 rounded ${dayItems.length > 0 ? 'border-coh-gold/40 shadow-sm' : 'border-coh-gold/10'}`}>
          <span className="text-[10px] font-bold text-coh-navy/40">{dayNum}</span>
          {dayItems.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              className="bg-coh-cream p-1.5 rounded border border-coh-gold/20 cursor-pointer hover:border-coh-gold transition flex flex-col gap-0.5"
            >
              <div className="text-[9px] uppercase font-bold text-coh-gold line-clamp-1">{item.channel}</div>
              <div className="text-[10px] font-semibold text-coh-navy leading-tight line-clamp-2" title={item.contentUnitType}>{item.contentUnitType}</div>
            </div>
          ))}
        </div>
      );
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="text-[10px] font-bold text-coh-navy/50 text-center uppercase py-2">{d}</div>
        ))}
        {blanks}
        {days}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#faf9f6]">
      {/* Header */}
      <div className="bg-white border-b border-coh-gold/20 p-6 shrink-0 flex justify-between items-center">
        <div>
          <h1 className="font-serif text-2xl text-coh-navy flex items-center gap-2">
            <Calendar className="text-coh-gold" size={24}/> Editorial Calendar Studio
          </h1>
          <p className="text-sm text-coh-navy/60 mt-1">Plan your monthly editorial rhythm. Recommendations are guided by Operating Core.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">
          
          <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
            
            {/* Parameters Panel */}
            <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-lg font-bold text-coh-navy">Monthly Planning Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Planning Month</label>
                  <input type="month" className="form-control p-1.5 w-full text-sm font-semibold" value={cycle.planningMonth} onChange={e => setCycle({...cycle, planningMonth: e.target.value})} />
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
                  <select className="form-control p-1.5" value={cycle.intensity} onChange={e => setCycle({...cycle, intensity: e.target.value as any})}>
                    <option value="Low (1-2 items/week)">Low (1-2 items/week)</option>
                    <option value="Medium (3-4 items/week)">Medium (3-4 items/week)</option>
                    <option value="High (5+ items/week)">High (5+ items/week)</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold text-coh-navy/60 mb-1 uppercase text-[10px]">Active Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.slice(0, 7).map(c => (
                    <button
                      key={c}
                      onClick={() => {
                        const newChannels = cycle.activeChannels.includes(c) 
                          ? cycle.activeChannels.filter(x => x !== c)
                          : [...cycle.activeChannels, c];
                        setCycle({...cycle, activeChannels: newChannels});
                      }}
                      className={`px-3 py-1 text-[10px] rounded-full font-bold transition ${
                        cycle.activeChannels.includes(c) ? 'bg-coh-navy text-coh-gold' : 'bg-coh-cream text-coh-navy border border-coh-gold/30 hover:border-coh-gold'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleGenerate} variant="primary" className="shadow-md">
                  Generate Monthly Calendar
                </Button>
                <Button onClick={() => {
                  const manual: CalendarItem = { id: genId(), title: 'Manual Entry', date: `${cycle.planningMonth}-01`, channel: cycle.activeChannels[0], format: 'General / Custom', contentUnitType: UNIT_TYPES[0], pillar: PILLARS[0], audience: cycle.priorityAudience, adoptionTrack: ADOPTION_TRACKS[0], editorialThesis: '', coreMessage: '', audienceInsight: '', sourceBasis: 'Manual source needed', proofNeeded: '', visualDirection: '', suggestedCTA: '', riskToAvoid: '', draftInstruction: '', reasonForRecommendation: 'Manual override', riskLevel: 'Low', status: 'Proposed' };
                  setItems([...items, manual]);
                  runCalendarReview([...items, manual]);
                }} variant="outline">
                  <Plus size={16} className="mr-1 inline" /> Add Manual Item
                </Button>
              </div>
            </div>

            {/* Monthly Editorial Arc */}
            {arc && items.length > 0 && (
              <div className="bg-coh-navy text-coh-cream p-5 rounded shadow-sm">
                <h3 className="font-serif text-lg font-bold text-coh-gold mb-3 flex items-center gap-2">
                  <LayoutList size={18} /> Monthly Editorial Arc
                </h3>
                <div className="space-y-4 text-sm font-sans">
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-coh-gold tracking-wider mb-1">Month Thesis</h4>
                    <p className="text-coh-cream/90 font-medium">{arc.monthThesis}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-coh-gold tracking-wider mb-1">Weekly Progression</h4>
                      <ul className="space-y-1">
                        {arc.weeklyProgression.map((w, i) => <li key={i} className="text-coh-cream/80 text-xs">- {w}</li>)}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-coh-gold tracking-wider mb-1">Audience Movement</h4>
                        <p className="text-coh-cream/80 text-xs">{arc.mainAudienceMovement}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-coh-gold tracking-wider mb-1">Key Risks</h4>
                        <ul className="space-y-1">
                          {arc.keyRisks.map((r, i) => <li key={i} className="text-coh-cream/80 text-xs text-red-300">- {r}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Calendar Canvas */}
            <div className="flex flex-col flex-1 bg-white border border-coh-gold/20 rounded shadow-sm">
              <div className="border-b border-coh-gold/20 p-4 bg-coh-cream/30 flex justify-between items-center">
                <h3 className="font-serif text-xl font-bold text-coh-navy">Calendar Canvas</h3>
                <div className="flex gap-1 bg-white border border-coh-gold/30 rounded p-0.5">
                  <button onClick={() => setViewMode('List')} className={`p-1.5 rounded transition-colors ${viewMode === 'List' ? 'bg-coh-cream text-coh-navy shadow-sm' : 'text-coh-navy/50 hover:text-coh-navy'}`} title="List View"><LayoutList size={16} /></button>
                  <button onClick={() => setViewMode('Month')} className={`p-1.5 rounded transition-colors ${viewMode === 'Month' ? 'bg-coh-cream text-coh-navy shadow-sm' : 'text-coh-navy/50 hover:text-coh-navy'}`} title="Month View"><Calendar size={16} /></button>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-coh-navy/40">
                    <Calendar size={48} className="mb-4 opacity-50" />
                    <p>Generate a calendar to see your items.</p>
                  </div>
                ) : viewMode === 'Month' ? (
                  renderMonthView()
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white border border-coh-gold/30 rounded p-4 flex gap-4 items-center shadow-sm hover:shadow transition group">
                        <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                          <div className="flex flex-col gap-1 w-full md:w-auto shrink-0">
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
                          </div>
                          
                          <div className="flex-1 text-xs text-coh-navy/70 border-l border-coh-gold/20 pl-4">
                            <p className="font-bold mb-0.5 text-coh-navy">{item.editorialThesis}</p>
                            <p className="line-clamp-1 italic">{item.reasonForRecommendation}</p>
                          </div>
                        </div>

                        <button 
                          className="p-2 text-coh-gold hover:text-coh-navy bg-coh-cream rounded transition"
                          onClick={() => setSelectedItem(item)}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Review */}
          <div className="col-span-1 lg:col-span-4 space-y-6 lg:overflow-y-auto lg:pr-2 pb-6 lg:max-h-full">
            <div className="bg-white border border-coh-gold/20 rounded shadow-sm p-5">
              <h3 className="font-serif text-lg font-bold text-coh-navy mb-4 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-coh-gold" /> Calendar Review
              </h3>
              
              <div className="mb-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold w-full justify-center border ${
                  review.status === 'Strong' ? 'bg-green-50 text-green-700 border-green-200' : 
                  review.status === 'Needs improvement' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {review.status === 'Strong' && <CheckCircle2 size={14}/>}
                  {review.status !== 'Strong' && <AlertTriangle size={14}/>}
                  {review.status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-6">
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
                
                {review.recommendedFixes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-coh-gold text-xs uppercase mb-2 flex items-center gap-1"><Settings2 size={12}/> Recommendations</h4>
                    <ul className="space-y-2">
                      {review.recommendedFixes.map((r, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-coh-gold/50">{r}</li>)}
                    </ul>
                  </div>
                )}

                {items.length > 0 && review.gaps.length === 0 && review.risks.length === 0 && (
                  <p className="text-xs text-coh-navy/60 italic text-center mt-8">Calendar is structurally sound and aligned with Operating Core.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* OVERLAY MODAL: CALENDAR ITEM DETAILS */}
      {selectedItem && (
        <div className="fixed inset-0 bg-coh-navy/80 z-[100] flex justify-center items-start md:items-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white w-full h-full md:h-auto md:max-w-3xl md:rounded-lg shadow-xl overflow-hidden flex flex-col md:max-h-[90vh]">
            <div className="bg-coh-navy p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <FileText size={18} className="text-coh-gold"/> Calendar Item Details
              </h3>
              <button onClick={() => setSelectedItem(null)} className="hover:text-coh-gold transition"><X size={20} /></button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1 text-sm space-y-6">
              
              {/* 1. Scheduling */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">1. Scheduling</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Format</label>
                    <input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.format} onChange={e => handleUpdateItem(selectedItem.id, {format: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 2. Strategy */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">2. Strategy</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Audience</label>
                    <select className="form-control p-1.5 w-full text-xs" value={selectedItem.audience} onChange={e => handleUpdateItem(selectedItem.id, {audience: e.target.value})}>
                      {AUDIENCES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Adoption Track</label>
                    <select className="form-control p-1.5 w-full text-xs" value={selectedItem.adoptionTrack} onChange={e => handleUpdateItem(selectedItem.id, {adoptionTrack: e.target.value})}>
                      {ADOPTION_TRACKS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Editorial Brief */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">3. Editorial Brief</h4>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Title</label>
                  <input type="text" className="form-control p-1.5 w-full text-xs font-bold" value={selectedItem.title} onChange={e => handleUpdateItem(selectedItem.id, {title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Editorial Thesis</label>
                  <textarea className="form-control p-2 w-full text-xs font-medium" rows={2} value={selectedItem.editorialThesis} onChange={e => handleUpdateItem(selectedItem.id, {editorialThesis: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Core Message</label>
                    <textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.coreMessage} onChange={e => handleUpdateItem(selectedItem.id, {coreMessage: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Audience Insight</label>
                    <textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.audienceInsight} onChange={e => handleUpdateItem(selectedItem.id, {audienceInsight: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Suggested CTA</label>
                  <input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.suggestedCTA} onChange={e => handleUpdateItem(selectedItem.id, {suggestedCTA: e.target.value})} />
                </div>
              </div>

              {/* 4. Evidence & Safety */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">4. Evidence and Safety</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Source Basis</label>
                    <select className="form-control p-1.5 w-full text-xs font-bold text-coh-navy" value={selectedItem.sourceBasis} onChange={e => handleUpdateItem(selectedItem.id, {sourceBasis: e.target.value})}>
                      <option value="Operating Core-backed">Operating Core-backed</option>
                      <option value="Core Document needed">Core Document needed</option>
                      <option value="Source Library source needed">Source Library source needed</option>
                      <option value="Event-based source needed">Event-based source needed</option>
                      <option value="Manual source needed">Manual source needed</option>
                      <option value="Needs validation">Needs validation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Risk to Avoid</label>
                    <input type="text" className="form-control p-1.5 w-full text-xs text-red-700 bg-red-50 border-red-200" value={selectedItem.riskToAvoid} onChange={e => handleUpdateItem(selectedItem.id, {riskToAvoid: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Proof Needed</label>
                  <input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.proofNeeded} onChange={e => handleUpdateItem(selectedItem.id, {proofNeeded: e.target.value})} />
                </div>
              </div>

              {/* 5. Creative Direction */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">5. Creative Direction</h4>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Visual Direction</label>
                  <input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.visualDirection} onChange={e => handleUpdateItem(selectedItem.id, {visualDirection: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Draft Instruction</label>
                  <textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.draftInstruction} onChange={e => handleUpdateItem(selectedItem.id, {draftInstruction: e.target.value})} />
                </div>
              </div>

              <div className="bg-coh-cream/30 p-3 rounded border border-coh-gold/20">
                <p className="text-xs text-coh-navy/80"><strong>Recommendation Reason:</strong> {selectedItem.reasonForRecommendation}</p>
              </div>
            </div>

            <div className="p-4 border-t border-coh-gold/20 flex flex-col md:flex-row justify-between gap-4 bg-gray-50 shrink-0">
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => { handleRemoveItem(selectedItem.id); setSelectedItem(null); }}>
                <Trash2 size={16} className="inline mr-1"/> Delete Item
              </Button>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={() => setSelectedItem(null)} className="flex-1 md:flex-none">Save & Close</Button>
                <Button variant="primary" onClick={() => {
                  handleUpdateItem(selectedItem.id, {status: 'Approved'});
                  handleCreateDraft(selectedItem);
                  setSelectedItem(null);
                }} className="flex-1 md:flex-none">
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

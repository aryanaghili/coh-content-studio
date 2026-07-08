import os

code = """import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Plus, Trash2, Settings2, LayoutList, LayoutGrid, X, FileText, ChevronRight, Copy } from 'lucide-react';
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

const STRATEGIC_FOCUSES = [
  'Climate Literacy',
  'Sponsorship & Partnerships',
  'Event & Premiere Build-Up',
  'Institutional Positioning',
  'Documentary & Media',
  'Cultural Durability',
  'General Awareness'
];

const CHANNELS = [
  'LinkedIn', 'Instagram', 'Newsletter', 'Website', 'TikTok', 'X', 'Facebook',
  'Email / Direct Outreach', 'WhatsApp', 'Sponsor Pitch', 'Partner Proposal',
  'Press / Media Note', 'Event Invitation', 'Internal Update'
];

const PILLARS = [
  'Opera Production and Repertoire', 'Documentary and Media', 'Cultural Durability',
  'Strategic Partners', 'Climate Literacy', 'Education and Community', 'Sponsorship and Institutional Adoption'
];

const AUDIENCES = [
  'Institutional Partners', 'Sponsors', 'Cultural Consumers', 'General Public', 'Media / Press', 'Internal Team'
];

const ADOPTION_TRACKS = ['Canon', 'Touring', 'Institutional', 'Sponsor', 'Public Audience', 'Media'];

const UNIT_TYPES = [
  'Canon Essay Unit', 'Milestone Proof Unit', 'Element Discipline Unit', 'Partner Spotlight Unit',
  'Documentary Log Unit', 'Premiere Proof Unit', 'Educational Explainer', 'Sponsor-Facing Update',
  'Newsletter Reflection', 'Visual Memory Post', 'Myth Explained', 'Website Explainer',
  'Direct Outreach Message', 'Event Build-Up Post', 'Rehearsal Discipline Clip', 'Event Invitation',
  'Composer Reflection', 'Media Feature', '2030 Horizon Reflection', 'Stable Reference Page',
  'Program Explanation', 'Element of the Week', 'Short Reflection', 'Event Commentary',
  'Link Amplification', 'Event Reminder', 'Community Update', 'Production Still',
  'Press Amplification', 'Partner Follow-Up', 'Sponsor Note', 'Internal Coordination',
  'Warm Partner Note', 'Value Logic Note', 'Collaboration Logic', 'Partner Role Explanation',
  'Press Note', 'Proof Summary', 'Attendance Reason', 'Event Meaning', 'Program Teaser',
  'Decision Summary', 'Next Steps', 'Blocker Update'
];

// --- 1. STRATEGIC FOCUS MAP ---
const FOCUS_MAP: Record<string, any> = {
  'Climate Literacy': {
    job: 'Help audiences understand climate as a lived condition and opera as a serious cultural form for making that condition legible.',
    prefChannels: ['Instagram', 'TikTok', 'Website', 'Newsletter', 'Facebook', 'LinkedIn'],
    prefUnits: ['Element Discipline Unit', 'Educational Explainer', 'Myth Explained', 'Website Explainer', 'Newsletter Reflection', 'Visual Memory Post'],
    reqLogic: ['Air, Fire, Water, Earth', 'myth', 'responsibility', 'climate as condition', 'no decorative climate imagery'],
    forbidden: ['Generic climate awareness', 'activist slogans', 'disaster imagery', '\"save the planet\" language', 'policy commentary detached from COH'],
    pillars: ['Climate Literacy', 'Education and Community'],
    thesisPattern: ['Climate is not a theme; it is the condition under which {element} operates.', 'COH approaches {topic} through discipline, not slogans.']
  },
  'Sponsorship & Partnerships': {
    job: 'Show how sponsors and partners enable cultural infrastructure, production, capture, adoption, touring, education, and long-term institutional value.',
    prefChannels: ['LinkedIn', 'Newsletter', 'Website', 'Sponsor Pitch', 'Partner Proposal', 'Email / Direct Outreach', 'Instagram'],
    prefUnits: ['Sponsor-Facing Update', 'Partner Spotlight Unit', 'Milestone Proof Unit', 'Website Update', 'Newsletter Reflection', 'Direct Outreach Message'],
    reqLogic: ['Partner contribution', 'sponsor value', 'adoption readiness', 'credibility', 'proof', 'value exchange'],
    forbidden: ['Logo exposure', 'gratitude-only posts', 'charity fundraising language', 'ESG clichés'],
    pillars: ['Strategic Partners', 'Sponsorship and Institutional Adoption'],
    thesisPattern: ['Our partnership with {partner} enables the capture and distribution of {element}, not just logo placement.', 'Sponsorship is cultural infrastructure.']
  },
  'Event & Premiere Build-Up': {
    job: 'Build meaning, attendance reason, proof intent, production discipline, and capture logic before a live moment.',
    prefChannels: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X', 'Newsletter', 'Event Invitation'],
    prefUnits: ['Event Build-Up Post', 'Premiere Proof Unit', 'Element Discipline Unit', 'Rehearsal Discipline Clip', 'Event Invitation', 'Milestone Proof Unit'],
    reqLogic: ['What the event proves', 'why it matters', 'who should attend', 'what will be captured', 'what happens after'],
    forbidden: ['Hype', 'vague excitement', 'countdown without meaning'],
    pillars: ['Opera Production and Repertoire', 'Education and Community'],
    thesisPattern: ['This premiere proves our capacity to execute {concept}.', 'We invite you to witness the culmination of {element} discipline.']
  },
  'Institutional Positioning': {
    job: 'Make COH legible as cultural infrastructure, repertoire logic, canon-building, and institutional adoption pathway.',
    prefChannels: ['LinkedIn', 'Website', 'Newsletter', 'Press / Media Note', 'Partner Proposal'],
    prefUnits: ['Canon Essay Unit', 'Milestone Proof Unit', 'Website Update', 'Documentary Log Unit', 'Partner Spotlight Unit'],
    reqLogic: ['Canon', 'touring', 'institutional adoption', 'repeatability', 'rights/readiness', 'proof of capability'],
    forbidden: ['General visibility posts', 'decorative arts language', 'campaign language'],
    pillars: ['Cultural Durability', 'Sponsorship and Institutional Adoption', 'Opera Production and Repertoire'],
    thesisPattern: ['COH is structured for institutional adoption, as proven by {evidence}.', 'Our touring model relies on {concept}.']
  },
  'Documentary & Media': {
    job: 'Make the documentary/media layer visible as Format 3 of the COH system, not casual behind-the-scenes content.',
    prefChannels: ['Newsletter', 'LinkedIn', 'Instagram', 'TikTok', 'Website', 'Press / Media Note'],
    prefUnits: ['Documentary Log Unit', 'Composer Reflection', 'Rehearsal Discipline Clip', 'Media Feature', 'Website Update'],
    reqLogic: ['Capture category', 'editing milestone', 'distribution intent', 'institutional or educational value'],
    forbidden: ['Casual backstage filler', 'personality content without structure'],
    pillars: ['Documentary and Media'],
    thesisPattern: ['Capturing {event} translates our live performance into Format 3.', 'The documentary layer ensures {concept} is accessible globally.']
  },
  'Cultural Durability': {
    job: 'Show that COH is building something intended to endure beyond events, campaigns, and attention cycles.',
    prefChannels: ['LinkedIn', 'Newsletter', 'Website', 'X', 'Instagram'],
    prefUnits: ['Canon Essay Unit', '2030 Horizon Reflection', 'Website Update', 'Newsletter Reflection', 'Milestone Proof Unit'],
    reqLogic: ['Long-term canon', 'permanence', 'institutional memory', '2030 Horizon', 'continuity'],
    forbidden: ['Short-term campaign language', 'trend language', '\"momentum\" without proof'],
    pillars: ['Cultural Durability', 'Opera Production and Repertoire'],
    thesisPattern: ['Our 2030 Horizon focuses on {goal}.', 'Building canon requires {concept}.']
  },
  'General Awareness': {
    job: 'Create accessible entry points without diluting COH into generic climate content.',
    prefChannels: ['Instagram', 'Facebook', 'TikTok', 'Website', 'Newsletter'],
    prefUnits: ['Educational Explainer', 'Visual Memory Post', 'Myth Explained', 'Element Discipline Unit', 'Website Explainer'],
    reqLogic: ['Simple but serious explanation', 'public relevance', 'cultural entry point'],
    forbidden: ['Oversimplification', 'generic climate activism', 'vague awareness'],
    pillars: ['Climate Literacy', 'Education and Community'],
    thesisPattern: ['Opera offers a lens to understand {concept}.', 'Soria Moria explores {myth} to reflect our reality.']
  }
};

// --- 2. AUDIENCE PROFILE MAP ---
const AUDIENCE_MAP: Record<string, any> = {
  'Institutional Partners': {
    needs: ['credibility', 'adoption logic', 'proof of capability', 'operational seriousness', 'lower perceived risk'],
    channels: ['LinkedIn', 'Newsletter', 'Website', 'Partner Proposal', 'Press / Media Note'],
    wrongOutput: 'atmospheric content without institutional implication'
  },
  'Sponsors': {
    needs: ['value exchange', 'credibility', 'audience quality', 'proof', 'a serious reason to associate'],
    channels: ['LinkedIn', 'Sponsor Pitch', 'Email / Direct Outreach', 'Newsletter', 'Website'],
    wrongOutput: 'charity language, ESG cliché, logo exposure'
  },
  'Cultural Consumers': {
    needs: ['meaning', 'artistic entry', 'emotional access', 'visual memory', 'a reason to follow'],
    channels: ['Instagram', 'Facebook', 'TikTok', 'Newsletter'],
    wrongOutput: 'repeated institutional LinkedIn posts'
  },
  'General Public': {
    needs: ['clear explanation', 'accessible language', 'climate literacy', 'entry into the world'],
    channels: ['Instagram', 'Facebook', 'TikTok', 'Website'],
    wrongOutput: 'insider strategy language'
  },
  'Media / Press': {
    needs: ['public relevance', 'facts', 'proof', 'quote-ready framing', 'timing'],
    channels: ['Press / Media Note', 'LinkedIn', 'X', 'Website'],
    wrongOutput: 'vague narrative without facts'
  },
  'Internal Team': {
    needs: ['decisions', 'next steps', 'blockers', 'ownership', 'clarity'],
    channels: ['Internal Update', 'WhatsApp', 'Email / Direct Outreach'],
    wrongOutput: 'public-facing brand language'
  }
};

// --- 3. CHANNEL ROLE MATRIX ---
const CHANNEL_MATRIX: Record<string, any> = {
  'LinkedIn': {
    function: 'institutional backbone.',
    bestFor: 'proof, sponsor confidence, partner logic, canon, adoption readiness.',
    allowedUnits: ['Canon Essay Unit', 'Milestone Proof Unit', 'Partner Spotlight Unit', 'Documentary Log Unit', 'Sponsor-Facing Update'],
    avoid: 'poetic visual captions, public hype, generic awareness.'
  },
  'Instagram': {
    function: 'visual myth and artistic atmosphere.',
    bestFor: 'visual memory, element coding, world-building, rehearsal texture.',
    allowedUnits: ['Element Discipline Unit', 'Visual Memory Post', 'Composer Reflection'],
    avoid: 'institutional essays, generic climate visuals, stock-like imagery.'
  },
  'Newsletter': {
    function: 'archival spine and strategic continuity.',
    bestFor: 'monthly narrative, portfolio update, partner spotlight, documentary progress, 2030 reflection.',
    allowedUnits: ['Newsletter Reflection', 'Partner Spotlight Unit', 'Documentary Log Unit'],
    avoid: 'short shallow updates.'
  },
  'Website': {
    function: 'stable public reference.',
    bestFor: 'project pages, program explanation, conversion, legitimacy.',
    allowedUnits: ['Website Update', 'Stable Reference Page', 'Program Explanation', 'Website Explainer'],
    avoid: 'repeated weekly website items without real page updates.'
  },
  'TikTok': {
    function: 'human access to opera discipline.',
    bestFor: 'short composer reflections, rehearsal discipline, myth explained, element of the week.',
    allowedUnits: ['Composer Reflection', 'Rehearsal Discipline Clip', 'Myth Explained', 'Element of the Week', 'Educational Explainer'],
    avoid: 'Canon Essay Unit, trends, forced youth slang, gimmicks.'
  },
  'X': {
    function: 'intellectual real-time presence.',
    bestFor: 'sharp short reflections, links, event commentary.',
    allowedUnits: ['Short Reflection', 'Event Commentary', 'Link Amplification'],
    avoid: 'thread spam, vague posting.'
  },
  'Facebook': {
    function: 'event amplification and community stability.',
    bestFor: 'event updates, public reminders, production stills, press links.',
    allowedUnits: ['Event Reminder', 'Community Update', 'Production Still', 'Press Amplification', 'Event Build-Up Post'],
    avoid: 'abstract institutional strategy.'
  },
  'Email / Direct Outreach': {
    function: 'relationship-building.',
    bestFor: 'specific next step, warm follow-up, sponsor/partner ask.',
    allowedUnits: ['Direct Outreach Message', 'Partner Follow-Up', 'Sponsor Note'],
    avoid: 'generic broadcast copy.'
  },
  'WhatsApp': {
    function: 'fast coordination or warm relationship update.',
    bestFor: 'short team update, partner note, next-step reminder.',
    allowedUnits: ['Internal Coordination', 'Warm Partner Note'],
    avoid: 'long-form public content.'
  },
  'Sponsor Pitch': {
    function: 'commercial development.',
    bestFor: 'value logic, credibility, proof.',
    allowedUnits: ['Sponsor-Facing Update', 'Value Logic Note'],
    avoid: 'NGO fundraising tone.'
  },
  'Partner Proposal': {
    function: 'collaboration development.',
    bestFor: 'partner role, contribution, next step.',
    allowedUnits: ['Collaboration Logic', 'Partner Role Explanation'],
    avoid: 'vague collaboration language.'
  },
  'Press / Media Note': {
    function: 'media relevance.',
    bestFor: 'facts, public relevance, quote-ready angle.',
    allowedUnits: ['Press Note', 'Proof Summary'],
    avoid: 'unsupported claims.'
  },
  'Event Invitation': {
    function: 'attendance conversion.',
    bestFor: 'why attend, what happens, who it is for, why now.',
    allowedUnits: ['Attendance Reason', 'Event Meaning', 'Program Teaser'],
    avoid: 'hype-only invitations.'
  },
  'Internal Update': {
    function: 'coordination.',
    bestFor: 'decisions, next steps, blockers.',
    allowedUnits: ['Decision Summary', 'Next Steps', 'Blocker Update'],
    avoid: 'brand copy.'
  }
};

// --- 4. CONTENT UNIT REQUIREMENTS ---
const UNIT_REQUIREMENTS: Record<string, string[]> = {
  'Milestone Proof Unit': ['What happened or will happen', 'Why it proves capability', 'What it unlocks', 'Next factual step'],
  'Canon Essay Unit': ['Opening thesis', 'Concrete example', 'Institutional implication', 'Forward marker'],
  'Element Discipline Unit': ['Element: Air, Fire, Water, Earth, or Cross-Renaissance', 'One artistic constraint or internal law', 'One visible detail or asset need', 'One responsibility line'],
  'Partner Spotlight Unit': ['Partner name or category', 'Concrete contribution', 'Pillar supported', 'Adoption track strengthened', '! No passive logo exposure'],
  'Documentary Log Unit': ['What is being captured', 'Why it matters for Format 3', 'Editing or capture milestone', 'Distribution intent'],
  'Premiere Proof Unit': ['What the premiere or event proves', 'What is being captured', 'What this enables after the event'],
  'Newsletter Reflection': ['Monthly narrative connection', '2 to 3 items being connected', 'Why the month matters', 'Next-month bridge'],
  'Website Update': ['Page or section affected', 'Stable message', 'Credibility or conversion purpose', 'Source needed'],
  'Educational Explainer': ['One concept', 'One simple explanation', 'One COH-specific example', 'One risk to avoid'],
  'Sponsor-Facing Update': ['Value logic', 'Proof point needed', 'Sponsor relevance', '! No charity or ESG cliché'],
  'Direct Outreach Message': ['Recipient type', 'Reason for contact', 'One clear ask', 'Relationship context']
};

const genId = () => Math.random().toString(36).substr(2, 9);

export const EditorialCalendarStudio: React.FC<Props> = ({ onHandoff }) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;

  const [cycle, setCycle] = useState<EditorialCycle>({
    id: 'cycle-1',
    planningMonth: currentMonthStr,
    strategicFocus: STRATEGIC_FOCUSES[1], // Sponsorship & Partnerships default
    priorityAudience: AUDIENCES[0],
    activeChannels: ['LinkedIn', 'Instagram', 'Newsletter', 'Website', 'X', 'Facebook', 'TikTok'],
    intensity: 'Medium (3-4 items/week)',
    status: 'Planning',
    notes: ''
  });

  const [arc, setArc] = useState<MonthlyEditorialArc | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [review, setReview] = useState<CalendarReview>({ status: 'Not ready', strengths: [], gaps: [], risks: [], recommendedFixes: [] });
  const [viewMode, setViewMode] = useState<'List' | 'Week' | 'Month'>('List');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  // --- EDITOR PIPELINE ---

  const handleGenerate = () => {
    // 1. buildEditorialContext()
    const ctx = {
      focus: FOCUS_MAP[cycle.strategicFocus],
      audience: AUDIENCE_MAP[cycle.priorityAudience],
      channels: cycle.activeChannels.filter(c => CHANNEL_MATRIX[c]),
      intensityNum: cycle.intensity.includes('Low') ? 8 : (cycle.intensity.includes('Medium') ? 14 : 22),
      year: parseInt(cycle.planningMonth.split('-')[0]),
      month: parseInt(cycle.planningMonth.split('-')[1])
    };

    // 2. buildMonthlyStrategyDiagnosis()
    // 3. buildMonthlyEditorialArc()
    const monthArc = buildMonthlyEditorialArc(ctx);
    setArc(monthArc);

    // 4. buildEditorialCandidatePool()
    let pool = buildEditorialCandidatePool(ctx, monthArc);

    // 5. scoreEditorialCandidates()
    pool = scoreEditorialCandidates(pool, ctx);

    // 6. selectCalendarItems()
    const selected = selectCalendarItems(pool, ctx);

    // 7. assignCalendarDates()
    const scheduled = assignCalendarDates(selected, ctx, monthArc);

    // 8. enrichCalendarItems()
    const enriched = enrichCalendarItems(scheduled, ctx);

    const sortedItems = enriched.sort((a, b) => a.date.localeCompare(b.date));
    setItems(sortedItems);

    // 9. reviewCalendarQuality()
    reviewCalendarQuality(sortedItems, ctx);
  };

  const buildMonthlyEditorialArc = (ctx: any): MonthlyEditorialArc => {
    let monthThesis = `This month should demonstrate that COH is advancing ${cycle.strategicFocus}, moving ${cycle.priorityAudience} from awareness to proof.`;
    
    if (cycle.strategicFocus === 'Sponsorship & Partnerships' && cycle.priorityAudience === 'Cultural Consumers') {
      monthThesis = `This month should make the cultural public understand that COH partnerships are not backstage administration. They are what allow the artistic world to become visible, repeatable, and durable.`;
    }

    const weeks = [
      `Introduce the logic of ${cycle.strategicFocus} without assuming prior knowledge.`,
      `Provide specific, concrete proof (a rehearsal, an agreement, a milestone).`,
      `Connect the proof point back to the institutional adoption track or audience experience.`,
      `Translate the month's progress into a deeper synthesis or newsletter reflection.`
    ];
    
    // Add Week 5 if it exists in the calendar month
    const daysInMonth = new Date(ctx.year, ctx.month, 0).getDate();
    let weekCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(ctx.year, ctx.month - 1, d).getDay() === 0) weekCount++;
    }
    if (weekCount >= 5) {
      weeks.push(`Prepare the runway for next month's strategic pillar.`);
    }

    return {
      monthThesis,
      weeklyProgression: weeks,
      primaryJob: ctx.focus.job,
      mainAudienceMovement: `Shift ${cycle.priorityAudience} towards believing in the operational execution of COH.`,
      keyRisks: ctx.focus.forbidden
    };
  };

  const buildEditorialCandidatePool = (ctx: any, monthArc: any): any[] => {
    const candidates = [];
    const targetCount = Math.max(30, ctx.intensityNum * 2);

    for (let i = 0; i < targetCount; i++) {
      const channel = ctx.channels[i % ctx.channels.length];
      const chanLogic = CHANNEL_MATRIX[channel];
      
      let allowedUnits = chanLogic.allowedUnits.filter((u: string) => 
        ctx.focus.prefUnits.includes(u) || UNIT_REQUIREMENTS[u]
      );
      if (allowedUnits.length === 0) allowedUnits = chanLogic.allowedUnits;
      
      const unitType = allowedUnits[i % allowedUnits.length];
      
      candidates.push({
        id: genId(),
        channel,
        format: chanLogic.bestFor.split(',')[0],
        contentUnitType: unitType,
        pillar: ctx.focus.pillars[i % ctx.focus.pillars.length] || PILLARS[0],
        audience: cycle.priorityAudience,
        adoptionTrack: ADOPTION_TRACKS[i % ADOPTION_TRACKS.length],
        editorialThesis: ctx.focus.thesisPattern[i % ctx.focus.thesisPattern.length] || `Aligning ${unitType} with ${cycle.strategicFocus}`,
        coreMessage: `Communicating ${chanLogic.function} to ${cycle.priorityAudience}`,
        audienceInsight: `Audience requires ${ctx.audience.needs[i % ctx.audience.needs.length]}`,
        sourceBasis: 'Operating Core-backed', // Strict review will penalize if not specific later
        proofNeeded: UNIT_REQUIREMENTS[unitType] ? UNIT_REQUIREMENTS[unitType][0] : 'Specific evidence',
        visualDirection: 'Dependent on channel format.',
        suggestedCTA: 'Engage with material',
        riskToAvoid: ctx.audience.wrongOutput,
        draftInstruction: 'Draft context-aware copy matching format.'
      });
    }
    return candidates;
  };

  const scoreEditorialCandidates = (candidates: any[], ctx: any) => {
    return candidates.map(c => {
      let score = 0;
      // Channel fit
      if (ctx.audience.channels.includes(c.channel)) score += 5;
      else score += 1;
      
      // Unit fit
      if (ctx.focus.prefUnits.includes(c.contentUnitType)) score += 5;
      else score += 2;

      // Risk safety
      if (CHANNEL_MATRIX[c.channel]?.avoid.includes(c.contentUnitType)) score -= 10;

      c.score = score;
      return c;
    });
  };

  const selectCalendarItems = (candidates: any[], ctx: any) => {
    // Sort by score
    candidates.sort((a, b) => b.score - a.score);
    
    const selected = [];
    const usedCombos = new Set();
    
    for (const c of candidates) {
      if (selected.length >= ctx.intensityNum) break;
      
      const combo = `${c.channel}-${c.contentUnitType}`;
      if (!usedCombos.has(combo)) {
        selected.push(c);
        usedCombos.add(combo);
      } else {
        // allow repetition only if we are desperate
        if (selected.length < ctx.intensityNum / 2) {
           selected.push(c);
        }
      }
    }
    return selected;
  };

  const assignCalendarDates = (selected: any[], ctx: any, arc: any) => {
    let day = 1;
    const daysInMonth = new Date(ctx.year, ctx.month, 0).getDate();
    const interval = Math.floor(daysInMonth / selected.length) || 1;

    return selected.map((s, idx) => {
      const dateNum = Math.min(daysInMonth, 1 + (idx * interval));
      const dateObj = new Date(ctx.year, ctx.month - 1, dateNum);
      const weekIndex = Math.floor(dateNum / 7);
      
      return {
        ...s,
        date: `${ctx.year}-${String(ctx.month).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`,
        title: `${s.contentUnitType} (${s.channel})`,
        reasonForRecommendation: `Placed in Week ${weekIndex + 1} to align with: ${arc.weeklyProgression[weekIndex] || arc.weeklyProgression[0]}`
      };
    });
  };

  const enrichCalendarItems = (scheduled: any[], ctx: any): CalendarItem[] => {
    return scheduled.map(s => {
      let reqs = UNIT_REQUIREMENTS[s.contentUnitType];
      if (reqs) {
        s.proofNeeded = reqs.find(r => r.toLowerCase().includes('proof') || r.toLowerCase().includes('evidence') || r.toLowerCase().includes('need')) || reqs[0];
        const avoids = reqs.filter(r => r.startsWith('!'));
        if (avoids.length > 0) {
          s.riskToAvoid = avoids[0].replace('!', '').trim();
        }
      }
      
      if (s.channel === 'LinkedIn') s.visualDirection = 'Professional proof imagery or diagrams';
      if (s.channel === 'Instagram') s.visualDirection = 'Element-coded artistic capture';
      if (s.channel === 'TikTok') s.visualDirection = 'Direct-to-camera or raw rehearsal footage';
      
      s.draftInstruction = `Write a ${s.contentUnitType} for ${s.channel}. Focus: ${s.editorialThesis}. Avoid: ${s.riskToAvoid}.`;
      s.status = 'Proposed';
      s.riskLevel = 'Low';
      return s as CalendarItem;
    });
  };

  const reviewCalendarQuality = (currentItems: CalendarItem[], ctx: any) => {
    let s = [];
    let g = [];
    let r = [];
    let recs = [];

    if (currentItems.length === 0) {
      setReview({ status: 'Not ready', strengths: [], gaps: ['No items generated.'], risks: [], recommendedFixes: ['Generate items.'] });
      return;
    }

    s.push(`Generated ${currentItems.length} items without blind template loops.`);

    // 1. Source Readiness Honesty
    const weakSources = currentItems.filter(i => ['Operating Core-backed', 'Needs validation', 'Manual source needed'].includes(i.sourceBasis));
    if (weakSources.length > 0) {
      g.push(`${weakSources.length} items rely purely on Operating Core or lack a distinct asset source.`);
      recs.push('Assign a specific Core Document or Source Library asset to validate these items before drafting.');
    } else {
      s.push('Source basis is structurally sound across items.');
    }

    // 2. Generic Language / Repetition
    const theses = currentItems.map(i => i.editorialThesis);
    const uniqueTheses = new Set(theses).size;
    if (uniqueTheses < currentItems.length * 0.5) {
      r.push(`High repetition: Only ${uniqueTheses} unique editorial theses across ${currentItems.length} items.`);
      recs.push('Diversify content unit types or manually edit editorial theses to avoid repetition.');
    } else {
      s.push('Strong diversity in editorial theses.');
    }

    // 3. Channel Balance & Fit
    const mismatch = currentItems.filter(i => !ctx.audience.channels.includes(i.channel));
    if (mismatch.length > 0) {
      r.push(`${mismatch.length} items are on channels that are weak matches for ${cycle.priorityAudience}.`);
    }

    // 4. Monthly Arc check
    if (!arc || !arc.monthThesis) {
      g.push('Monthly arc is undefined.');
    }

    let status: 'Strong' | 'Needs improvement' | 'Not ready' = 'Strong';
    if (g.length > 0 || r.length > 0) status = 'Needs improvement';
    if (r.length > 2 || weakSources.length > currentItems.length * 0.8) status = 'Not ready';

    setReview({ status, strengths: s, gaps: g, risks: r, recommendedFixes: recs });
  };

  // --- Handlers ---

  const handleUpdateItem = (id: string, updates: Partial<CalendarItem>) => {
    const newItems = items.map(i => i.id === id ? { ...i, ...updates } : i);
    setItems(newItems);
    reviewCalendarQuality(newItems, { 
      focus: FOCUS_MAP[cycle.strategicFocus], 
      audience: AUDIENCE_MAP[cycle.priorityAudience],
      channels: cycle.activeChannels 
    });
  };

  const handleRemoveItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    reviewCalendarQuality(newItems, { 
      focus: FOCUS_MAP[cycle.strategicFocus], 
      audience: AUDIENCE_MAP[cycle.priorityAudience],
      channels: cycle.activeChannels 
    });
  };

  const handleCreateDraft = (item: CalendarItem) => {
    const handoffPayload = {
      id: `cal-${item.id}`,
      title: item.title,
      date: item.date,
      channel: item.channel,
      format: item.format,
      strategicFocus: cycle.strategicFocus,
      strategicPillar: item.pillar,
      audience: item.audience,
      adoptionTrack: item.adoptionTrack,
      contentUnitType: item.contentUnitType,
      editorialThesis: item.editorialThesis,
      coreMessage: item.coreMessage,
      audienceInsight: item.audienceInsight,
      sourceBasis: item.sourceBasis,
      proofNeeded: item.proofNeeded,
      visualDirection: item.visualDirection,
      suggestedCTA: item.suggestedCTA,
      riskToAvoid: item.riskToAvoid,
      claimSafetyNote: 'Verify claims against Operating Core.',
      draftInstruction: item.draftInstruction,
      operatingCoreInstructions: 'Apply COH tone and voice guidelines.',
      createdAt: new Date().toISOString()
    };
    onHandoff(handoffPayload);
  };

  const handleDuplicateItem = (item: CalendarItem) => {
    const duplicated = { ...item, id: genId(), title: `${item.title} (Copy)` };
    setItems([...items, duplicated]);
  };

  const openAddManualModal = () => {
    const manual: CalendarItem = {
      id: genId(),
      title: 'New Manual Item',
      date: `${cycle.planningMonth}-01`,
      channel: cycle.activeChannels[0] || CHANNELS[0],
      format: '',
      contentUnitType: UNIT_TYPES[0],
      pillar: PILLARS[0],
      audience: cycle.priorityAudience,
      adoptionTrack: ADOPTION_TRACKS[0],
      editorialThesis: '',
      coreMessage: '',
      audienceInsight: '',
      sourceBasis: 'Manual source needed',
      proofNeeded: '',
      visualDirection: '',
      suggestedCTA: '',
      riskToAvoid: '',
      draftInstruction: '',
      reasonForRecommendation: 'Manual override',
      riskLevel: 'Low',
      status: 'Proposed'
    };
    setItems([...items, manual]);
    setSelectedItem(manual);
  };

  const renderMonthView = () => {
    if (items.length === 0) return null;
    const [yearStr, monthStr] = cycle.planningMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="bg-gray-50/50 border border-gray-100 rounded min-h-[120px]" />);
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayItems = items.filter(item => item.date === dateStr);
      
      return (
        <div key={dayNum} className={`bg-white border p-2 min-h-[120px] flex flex-col gap-1 rounded ${dayItems.length > 0 ? 'border-coh-gold/40 shadow-sm' : 'border-coh-gold/10'}`}>
          <span className="text-[10px] font-bold text-coh-navy/40">{dayNum}</span>
          {dayItems.map(item => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-coh-cream p-1.5 rounded border border-coh-gold/20 cursor-pointer hover:border-coh-gold transition flex flex-col gap-0.5">
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
          <p className="text-sm text-coh-navy/60 mt-1">Strategic content engine powered by Operating Core constraints.</p>
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
                  {CHANNELS.map(c => (
                    <button key={c} onClick={() => {
                        const newChannels = cycle.activeChannels.includes(c) ? cycle.activeChannels.filter(x => x !== c) : [...cycle.activeChannels, c];
                        setCycle({...cycle, activeChannels: newChannels});
                      }}
                      className={`px-3 py-1 text-[10px] rounded-full font-bold transition ${cycle.activeChannels.includes(c) ? 'bg-coh-navy text-coh-gold' : 'bg-coh-cream text-coh-navy border border-coh-gold/30 hover:border-coh-gold'}`}
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
                <Button onClick={openAddManualModal} variant="outline">
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
                        {arc.weeklyProgression.map((w, i) => <li key={i} className="text-coh-cream/80 text-xs">- Week {i+1}: {w}</li>)}
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
                  <button onClick={() => setViewMode('List')} className={`p-1.5 rounded transition-colors ${viewMode === 'List' ? 'bg-coh-cream text-coh-navy shadow-sm' : 'text-coh-navy/50 hover:text-coh-navy'}`}><LayoutList size={16} /></button>
                  <button onClick={() => setViewMode('Month')} className={`p-1.5 rounded transition-colors ${viewMode === 'Month' ? 'bg-coh-cream text-coh-navy shadow-sm' : 'text-coh-navy/50 hover:text-coh-navy'}`}><Calendar size={16} /></button>
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 text-coh-navy/40">
                    <Calendar size={48} className="mb-4 opacity-50" />
                    <p>Generate a calendar to see your items.</p>
                  </div>
                ) : viewMode === 'Month' ? renderMonthView() : (
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="bg-white border border-coh-gold/30 rounded p-4 flex gap-4 items-center shadow-sm hover:shadow transition group">
                        <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                          <div className="flex flex-col gap-1 w-full md:w-auto shrink-0 min-w-[150px]">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-coh-navy bg-coh-cream px-2 py-0.5 rounded">{item.date}</span>
                              <span className="text-[10px] uppercase font-bold text-coh-gold">{item.channel}</span>
                            </div>
                            <span className="text-sm font-semibold text-coh-navy">{item.contentUnitType}</span>
                          </div>
                          
                          <div className="flex-1 text-xs text-coh-navy/70 border-l border-coh-gold/20 pl-4">
                            <p className="font-bold mb-0.5 text-coh-navy">{item.editorialThesis}</p>
                            <p className="line-clamp-1 italic text-coh-navy/50">{item.reasonForRecommendation}</p>
                          </div>
                        </div>

                        <button className="p-2 text-coh-gold hover:text-coh-navy bg-coh-cream rounded transition" onClick={() => setSelectedItem(item)}>
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Review Panel */}
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
                    <ul className="space-y-2">{review.strengths.map((s, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-green-300">{s}</li>)}</ul>
                  </div>
                )}
                {review.gaps.length > 0 && (
                  <div>
                    <h4 className="font-bold text-yellow-600 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Gaps</h4>
                    <ul className="space-y-2">{review.gaps.map((g, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-yellow-300">{g}</li>)}</ul>
                  </div>
                )}
                {review.risks.length > 0 && (
                  <div>
                    <h4 className="font-bold text-red-600 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Risks / Repetition</h4>
                    <ul className="space-y-2">{review.risks.map((r, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-red-300">{r}</li>)}</ul>
                  </div>
                )}
                {review.recommendedFixes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-coh-gold text-xs uppercase mb-2 flex items-center gap-1"><Settings2 size={12}/> Recommendations</h4>
                    <ul className="space-y-2">{review.recommendedFixes.map((r, i) => <li key={i} className="text-coh-navy/80 text-xs pl-3 border-l-2 border-coh-gold/50">{r}</li>)}</ul>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* EXTENDED EDITORIAL BRIEF MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-coh-navy/80 z-[100] flex justify-center items-start md:items-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-white w-full h-full md:h-auto md:max-w-4xl md:rounded-lg shadow-xl overflow-hidden flex flex-col md:max-h-[95vh]">
            <div className="bg-coh-navy p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-serif text-lg font-bold flex items-center gap-2">
                <FileText size={18} className="text-coh-gold"/> Calendar Item Details
              </h3>
              <button onClick={() => setSelectedItem(null)} className="hover:text-coh-gold transition"><X size={20} /></button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1 text-sm space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Scheduling */}
                <div className="space-y-3 bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="text-xs font-bold uppercase text-coh-navy">1. Scheduling</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Date</label><input type="date" className="form-control p-1.5 w-full text-xs" value={selectedItem.date} onChange={e => handleUpdateItem(selectedItem.id, {date: e.target.value})} /></div>
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Status</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.status} onChange={e => handleUpdateItem(selectedItem.id, {status: e.target.value})}><option>Proposed</option><option>Needs review</option><option>Approved</option><option>Drafting</option></select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Channel</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.channel} onChange={e => handleUpdateItem(selectedItem.id, {channel: e.target.value})}>{CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Format</label><input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.format} onChange={e => handleUpdateItem(selectedItem.id, {format: e.target.value})} /></div>
                  </div>
                </div>

                {/* 2. Strategy */}
                <div className="space-y-3 bg-gray-50 p-4 rounded border border-gray-200">
                  <h4 className="text-xs font-bold uppercase text-coh-navy">2. Strategy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Unit Type</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.contentUnitType} onChange={e => handleUpdateItem(selectedItem.id, {contentUnitType: e.target.value})}>{UNIT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Pillar</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.pillar} onChange={e => handleUpdateItem(selectedItem.id, {pillar: e.target.value})}>{PILLARS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Audience</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.audience} onChange={e => handleUpdateItem(selectedItem.id, {audience: e.target.value})}>{AUDIENCES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Adoption Track</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.adoptionTrack} onChange={e => handleUpdateItem(selectedItem.id, {adoptionTrack: e.target.value})}>{ADOPTION_TRACKS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                </div>
              </div>

              {/* 3. Editorial Brief */}
              <div className="space-y-3 border border-coh-gold/20 p-4 rounded">
                <h4 className="text-xs font-bold uppercase text-coh-gold">3. Editorial Brief</h4>
                <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Title</label><input type="text" className="form-control p-1.5 w-full text-xs font-bold" value={selectedItem.title} onChange={e => handleUpdateItem(selectedItem.id, {title: e.target.value})} /></div>
                <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Editorial Thesis</label><textarea className="form-control p-2 w-full text-xs font-medium" rows={2} value={selectedItem.editorialThesis} onChange={e => handleUpdateItem(selectedItem.id, {editorialThesis: e.target.value})} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Core Message</label><textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.coreMessage} onChange={e => handleUpdateItem(selectedItem.id, {coreMessage: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Audience Insight</label><textarea className="form-control p-2 w-full text-xs" rows={2} value={selectedItem.audienceInsight} onChange={e => handleUpdateItem(selectedItem.id, {audienceInsight: e.target.value})} /></div>
                </div>
                <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Suggested CTA</label><input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.suggestedCTA} onChange={e => handleUpdateItem(selectedItem.id, {suggestedCTA: e.target.value})} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4. Evidence & Safety */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">4. Evidence and Safety</h4>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Source Basis</label>
                    <select className="form-control p-1.5 w-full text-xs font-bold text-coh-navy" value={selectedItem.sourceBasis} onChange={e => handleUpdateItem(selectedItem.id, {sourceBasis: e.target.value})}>
                      <option>Operating Core-backed</option>
                      <option>Core Document-backed</option>
                      <option>Source Library-backed</option>
                      <option>Event-backed</option>
                      <option>Manual source needed</option>
                      <option>Needs validation</option>
                      <option>Not source-ready</option>
                    </select>
                  </div>
                  <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Proof Needed</label><textarea className="form-control p-1.5 w-full text-xs" rows={2} value={selectedItem.proofNeeded} onChange={e => handleUpdateItem(selectedItem.id, {proofNeeded: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Risk to Avoid</label><textarea className="form-control p-1.5 w-full text-xs text-red-700 bg-red-50 border-red-200" rows={2} value={selectedItem.riskToAvoid} onChange={e => handleUpdateItem(selectedItem.id, {riskToAvoid: e.target.value})} /></div>
                </div>

                {/* 5. Creative Direction */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-coh-gold border-b border-coh-gold/20 pb-1">5. Creative Direction</h4>
                  <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Visual Direction</label><textarea className="form-control p-1.5 w-full text-xs" rows={2} value={selectedItem.visualDirection} onChange={e => handleUpdateItem(selectedItem.id, {visualDirection: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-bold text-coh-navy/50 mb-1">Draft Instruction</label><textarea className="form-control p-2 w-full text-xs" rows={3} value={selectedItem.draftInstruction} onChange={e => handleUpdateItem(selectedItem.id, {draftInstruction: e.target.value})} /></div>
                </div>
              </div>

              {/* 6. Recommendation Logic */}
              <div className="bg-coh-cream/50 p-4 rounded border border-coh-gold/20">
                <h4 className="text-xs font-bold uppercase text-coh-navy mb-2">6. Recommendation Logic</h4>
                <p className="text-xs text-coh-navy/80 italic">{selectedItem.reasonForRecommendation}</p>
              </div>
            </div>

            <div className="p-4 border-t border-coh-gold/20 flex flex-col md:flex-row justify-between gap-4 bg-gray-50 shrink-0">
              <div className="flex gap-2">
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => { handleRemoveItem(selectedItem.id); setSelectedItem(null); }}><Trash2 size={16} className="inline mr-1"/> Delete</Button>
                <Button variant="outline" onClick={() => handleDuplicateItem(selectedItem)}><Copy size={16} className="inline mr-1"/> Duplicate</Button>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={() => setSelectedItem(null)} className="flex-1 md:flex-none">Save Changes</Button>
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
"""

with open('src/components/EditorialCalendarStudio.tsx', 'w') as f:
    f.write(code)


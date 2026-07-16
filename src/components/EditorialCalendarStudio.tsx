import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, AlertTriangle, Plus, Trash2, Settings2, LayoutList, LayoutGrid, X, FileText, ChevronRight, Copy, Save, RefreshCw, Archive } from 'lucide-react';
import { Button } from './ui/Button';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/storage';
import type { SavedCalendar } from './CalendarLibrary';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { executeExport } from '../utils/exportUtils';

// --- Core Data Models ---

export interface EditorialCycle {
  id: string;
  planningMonth: string; // YYYY-MM
  primaryStrategicFocus: string;
  secondaryStrategicFocus: string;
  avoidFocus: string;
  primaryAudience: string;
  secondaryAudience: string;
  activeChannels: string[];
  channelAudienceMap: Record<string, { primary: string; secondary: string; objective: string }>;
  intensity: 'Light: 4-6 items' | 'Moderate: 8-12 items' | 'High: 14-20 items' | 'Campaign Mode: 25-40 items';
  status: string;
  notes: string;
  version: number;
}

export interface MonthlyEditorialArc {
  monthThesis: string;
  weeklyProgression: string[];
  channelSubArcs: Record<string, string>;
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
  primaryFocus: string;
  secondaryFocus: string;
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
  isProtected: boolean;
  version: number;
  createdFrom?: string;
  // Multi-Channel Pack Fields
  isMultiChannelPack?: boolean;
  packTitle?: string;
  parentItemId?: string;
  selectedChannels?: string[];
  channelSpecificItems?: any[];
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
  onOpenLibrary: () => void;
  initialCalendar?: SavedCalendar | null;
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
    forbidden: ['Generic climate awareness', 'activist slogans', 'disaster imagery', '"save the planet" language', 'policy commentary detached from COH'],
    pillars: ['Climate Literacy', 'Education and Community'],
    thesisPattern: ['Climate is not a theme; it is the condition under which our work operates.', 'COH approaches climate literacy through discipline, not slogans.']
  },
  'Sponsorship & Partnerships': {
    job: 'Show how sponsors and partners enable cultural infrastructure, production, capture, adoption, touring, education, and long-term institutional value.',
    prefChannels: ['LinkedIn', 'Newsletter', 'Website', 'Sponsor Pitch', 'Partner Proposal', 'Email / Direct Outreach', 'Instagram'],
    prefUnits: ['Sponsor-Facing Update', 'Partner Spotlight Unit', 'Milestone Proof Unit', 'Website Update', 'Newsletter Reflection', 'Direct Outreach Message'],
    reqLogic: ['Partner contribution', 'sponsor value', 'adoption readiness', 'credibility', 'proof', 'value exchange'],
    forbidden: ['Logo exposure', 'gratitude-only posts', 'charity fundraising language', 'ESG clichés'],
    pillars: ['Strategic Partners', 'Sponsorship and Institutional Adoption'],
    thesisPattern: ['Our partnerships enable the capture and distribution of cultural elements, not just logo placement.', 'Sponsorship is cultural infrastructure.']
  },
  'Event & Premiere Build-Up': {
    job: 'Build meaning, attendance reason, proof intent, production discipline, and capture logic before a live moment.',
    prefChannels: ['Instagram', 'Facebook', 'LinkedIn', 'TikTok', 'X', 'Newsletter', 'Event Invitation'],
    prefUnits: ['Event Build-Up Post', 'Premiere Proof Unit', 'Element Discipline Unit', 'Rehearsal Discipline Clip', 'Event Invitation', 'Milestone Proof Unit'],
    reqLogic: ['What the event proves', 'why it matters', 'who should attend', 'what will be captured', 'what happens after'],
    forbidden: ['Hype', 'vague excitement', 'countdown without meaning'],
    pillars: ['Opera Production and Repertoire', 'Education and Community'],
    thesisPattern: ['This premiere proves our capacity to execute on our core artistic vision.', 'We invite you to witness the culmination of our artistic discipline.']
  },
  'Institutional Positioning': {
    job: 'Make COH legible as cultural infrastructure, repertoire logic, canon-building, and institutional adoption pathway.',
    prefChannels: ['LinkedIn', 'Website', 'Newsletter', 'Press / Media Note', 'Partner Proposal'],
    prefUnits: ['Canon Essay Unit', 'Milestone Proof Unit', 'Website Update', 'Documentary Log Unit', 'Partner Spotlight Unit'],
    reqLogic: ['Canon', 'touring', 'institutional adoption', 'repeatability', 'rights/readiness', 'proof of capability'],
    forbidden: ['General visibility posts', 'decorative arts language', 'campaign language'],
    pillars: ['Cultural Durability', 'Sponsorship and Institutional Adoption', 'Opera Production and Repertoire'],
    thesisPattern: ['COH is structured for institutional adoption, as proven by our recent milestones.', 'Our touring model relies on repeatable infrastructure.']
  },
  'Documentary & Media': {
    job: 'Make the documentary/media layer visible as Format 3 of the COH system, not casual behind-the-scenes content.',
    prefChannels: ['Newsletter', 'LinkedIn', 'Instagram', 'TikTok', 'Website', 'Press / Media Note'],
    prefUnits: ['Documentary Log Unit', 'Composer Reflection', 'Rehearsal Discipline Clip', 'Media Feature', 'Website Update'],
    reqLogic: ['Capture category', 'editing milestone', 'distribution intent', 'institutional or educational value'],
    forbidden: ['Casual backstage filler', 'personality content without structure'],
    pillars: ['Documentary and Media'],
    thesisPattern: ['Capturing live events translates our performance into Format 3.', 'The documentary layer ensures our work is accessible globally.']
  },
  'Cultural Durability': {
    job: 'Show that COH is building something intended to endure beyond events, campaigns, and attention cycles.',
    prefChannels: ['LinkedIn', 'Newsletter', 'Website', 'X', 'Instagram'],
    prefUnits: ['Canon Essay Unit', '2030 Horizon Reflection', 'Website Update', 'Newsletter Reflection', 'Milestone Proof Unit'],
    reqLogic: ['Long-term canon', 'permanence', 'institutional memory', '2030 Horizon', 'continuity'],
    forbidden: ['Short-term campaign language', 'trend language', '"momentum" without proof'],
    pillars: ['Cultural Durability', 'Opera Production and Repertoire'],
    thesisPattern: ['Our 2030 Horizon focuses on long-term cultural durability.', 'Building canon requires consistent structural investment.']
  },
  'General Awareness': {
    job: 'Create accessible entry points without diluting COH into generic climate content.',
    prefChannels: ['Instagram', 'Facebook', 'TikTok', 'Website', 'Newsletter'],
    prefUnits: ['Educational Explainer', 'Visual Memory Post', 'Myth Explained', 'Element Discipline Unit', 'Website Explainer'],
    reqLogic: ['Simple but serious explanation', 'public relevance', 'cultural entry point'],
    forbidden: ['Oversimplification', 'generic climate activism', 'vague awareness'],
    pillars: ['Climate Literacy', 'Education and Community'],
    thesisPattern: ['Opera offers a lens to understand complex contemporary issues.', 'Soria Moria explores classic myth to reflect our reality.']
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

export const EditorialCalendarStudio: React.FC<Props> = ({ onHandoff, onOpenLibrary, initialCalendar }) => {
  const currentMonthIdx = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const currentMonthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;

  const defaultCycle: EditorialCycle = {
    id: `cycle-${genId()}`,
    planningMonth: currentMonthStr,
    primaryStrategicFocus: STRATEGIC_FOCUSES[1], // Sponsorship & Partnerships default
    secondaryStrategicFocus: 'None',
    avoidFocus: 'None',
    primaryAudience: AUDIENCES[0],
    secondaryAudience: 'None',
    activeChannels: ['LinkedIn', 'Instagram', 'Newsletter', 'Website', 'X', 'Facebook', 'TikTok'],
    channelAudienceMap: {},
    intensity: 'Moderate: 8-12 items',
    status: 'Planning',
    notes: '',
    version: 1
  };

  const [cycle, setCycle] = useState<EditorialCycle>(defaultCycle);
  const [arc, setArc] = useState<MonthlyEditorialArc | null>(null);
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [review, setReview] = useState<CalendarReview>({ status: 'Not ready', strengths: [], gaps: [], risks: [], recommendedFixes: [] });
  const [viewMode, setViewMode] = useState<'List' | 'Week' | 'Month'>('List');
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);
  const [validationResult, setValidationResult] = useState<{hardBlockers: any[], sourceWarnings: any[], qualityWarnings: any[]} | null>(null);
  
  // Advanced settings panel state
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (initialCalendar) {
      setCycle({
        id: initialCalendar.id,
        planningMonth: `${initialCalendar.planningYear}-${initialCalendar.planningMonth}`,
        primaryStrategicFocus: initialCalendar.primaryStrategicFocus,
        secondaryStrategicFocus: initialCalendar.secondaryStrategicFocus,
        avoidFocus: initialCalendar.avoidFocus,
        primaryAudience: initialCalendar.primaryAudience,
        secondaryAudience: initialCalendar.secondaryAudience,
        activeChannels: initialCalendar.activeChannels,
        channelAudienceMap: initialCalendar.channelAudienceMap,
        intensity: initialCalendar.publishingIntensity as any,
        status: initialCalendar.status,
        notes: '',
        version: initialCalendar.versionNumber
      });
      setArc(initialCalendar.masterMonthlyArc);
      setItems(initialCalendar.calendarItems);
      setReview(initialCalendar.calendarReview);
    }
  }, [initialCalendar]);

  // --- EDITOR PIPELINE ---

  const handleGenerate = (mode: string = 'Generate New Version') => {
    const focusPrimary = FOCUS_MAP[cycle.primaryStrategicFocus];
    const focusSecondary = FOCUS_MAP[cycle.secondaryStrategicFocus];
    let audiencePrimary = AUDIENCE_MAP[cycle.primaryAudience];
    
    // Parse intensity
    let intensityNum = 10;
    if (cycle.intensity.includes('Light')) intensityNum = 5;
    if (cycle.intensity.includes('Moderate')) intensityNum = 10;
    if (cycle.intensity.includes('High')) intensityNum = 17;
    if (cycle.intensity.includes('Campaign')) intensityNum = 32;

    const ctx = {
      focusPrimary,
      focusSecondary,
      avoidFocus: cycle.avoidFocus !== 'None' ? FOCUS_MAP[cycle.avoidFocus] : null,
      audiencePrimary,
      audienceSecondary: cycle.secondaryAudience !== 'None' ? AUDIENCE_MAP[cycle.secondaryAudience] : null,
      channels: cycle.activeChannels.filter(c => CHANNEL_MATRIX[c]),
      channelMap: cycle.channelAudienceMap,
      intensityNum,
      year: parseInt(cycle.planningMonth?.split('-')[0] || '2024'),
      month: parseInt(cycle.planningMonth?.split('-')[1] || '1'),
      mode
    };

    let protectedItems = items;
    
    if (mode === 'Generate New Version') {
      protectedItems = [];
    } else if (mode === 'Generate Alternative Angle') {
      protectedItems = [];
      ctx.audiencePrimary = ctx.audienceSecondary || ctx.audiencePrimary; // Shift audience for alt strategy
    } else if (mode === 'Preserve Approved Items and Regenerate the Rest' || mode === 'Regenerate All Items') {
      // Default behavior is to preserve approved, handoff, drafted, manual (protected)
      protectedItems = items.filter(i => i.status === 'Approved' || i.status === 'Draft Handoff' || i.status === 'Drafted' || i.isProtected);
    } else if (mode === 'Regenerate Weak Items Only') {
      protectedItems = items.filter(i => i.riskLevel !== 'High' && i.riskLevel !== 'Medium' && i.sourceBasis !== 'Needs validation');
    } else if (mode === 'Regenerate Selected Week') {
      const weekStr = window.prompt("Which week number (1-5) would you like to regenerate?", "2");
      const targetWeek = parseInt(weekStr || "2");
      protectedItems = items.filter(i => {
         const d = new Date(i.date);
         const w = Math.ceil(d.getDate() / 7);
         return w !== targetWeek;
      });
    } else if (mode === 'Regenerate Selected Channel') {
      const targetChannel = window.prompt(`Which channel to regenerate? (${cycle.activeChannels.join(', ')})`, cycle.activeChannels[0]);
      protectedItems = items.filter(i => i.channel.toLowerCase() !== (targetChannel || '').toLowerCase());
    } else {
      protectedItems = items.filter(i => i.isProtected || i.status === 'Approved' || i.status === 'Draft Handoff' || i.status === 'Drafted');
    }

    const itemsToGenerate = Math.max(0, ctx.intensityNum - protectedItems.length);

    // 2. buildMonthlyStrategyDiagnosis()
    // 3. buildMonthlyEditorialArc()
    const monthArc = buildMonthlyEditorialArc(ctx);
    setArc(monthArc);

    if (itemsToGenerate > 0) {
      // 4. buildEditorialCandidatePool()
      let pool = buildEditorialCandidatePool(ctx, monthArc, itemsToGenerate);

      // 5. scoreEditorialCandidates()
      pool = scoreEditorialCandidates(pool, ctx, protectedItems);

      // 6. selectCalendarItems()
      const selected = selectCalendarItems(pool, ctx, itemsToGenerate);

      // 7. assignCalendarDates()
      const scheduled = assignCalendarDates(selected, ctx, monthArc, protectedItems);

      // 8. enrichCalendarItems()
      const enriched = enrichCalendarItems(scheduled, ctx);

      // Validate placeholders
      enriched.forEach(item => {
        const fields = [item.editorialThesis, item.coreMessage, item.proofNeeded, item.draftInstruction, item.audienceInsight];
        const hasPlaceholder = fields.some(f => /\{evidence\}|\{source\}|\{partner\}|\{proof\}|\{date\}/i.test(f || ''));
        if (hasPlaceholder) {
          item.status = 'Needs Source';
          item.proofNeeded = item.proofNeeded?.includes('{') ? 'Proof needed: specific production milestone, capture plan, partner confirmation, or approved document.' : item.proofNeeded;
        }
      });

      const combinedItems = [...protectedItems, ...enriched].sort((a, b) => a.date.localeCompare(b.date));
      setItems(combinedItems);
      reviewCalendarQuality(combinedItems, ctx, monthArc);
    } else {
      setItems(protectedItems);
      reviewCalendarQuality(protectedItems, ctx, monthArc);
    }
  };

  const buildMonthlyEditorialArc = (ctx: any): MonthlyEditorialArc => {
    let monthThesis = `Advancing ${cycle.primaryStrategicFocus} by moving ${cycle.primaryAudience} from awareness to proof.`;
    if (ctx.focusSecondary) {
      monthThesis += ` Supported by ${cycle.secondaryStrategicFocus}.`;
    }
    
    if (cycle.primaryStrategicFocus === 'Sponsorship & Partnerships' && cycle.primaryAudience === 'Cultural Consumers') {
      monthThesis = `Demonstrate to the cultural public that COH partnerships enable the artistic world to become visible, repeatable, and durable.`;
    }

    const weeks = [
      `Introduce ${cycle.primaryStrategicFocus} logic.`,
      `Provide concrete proof for ${cycle.primaryAudience}.`,
      `Deepen adoption track via ${ctx.focusSecondary ? cycle.secondaryStrategicFocus : 'institutional evidence'}.`,
      `Synthesize the month's progress.`
    ];
    
    const daysInMonth = new Date(ctx.year, ctx.month, 0).getDate();
    let weekCount = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      if (new Date(ctx.year, ctx.month - 1, d).getDay() === 0) weekCount++;
    }
    if (weekCount >= 5) weeks.push(`Prepare runway for next month.`);

    const channelSubArcs: Record<string, string> = {};
    ctx.channels.forEach((c: string) => {
      channelSubArcs[c] = `Translate ${cycle.primaryStrategicFocus} into ${CHANNEL_MATRIX[c].function}`;
    });

    return {
      monthThesis,
      weeklyProgression: weeks,
      channelSubArcs,
      primaryJob: ctx.focusPrimary.job,
      mainAudienceMovement: `Shift ${cycle.primaryAudience} towards believing in the operational execution.`,
      keyRisks: ctx.focusPrimary.forbidden
    };
  };

  const buildEditorialCandidatePool = (ctx: any, monthArc: any, countNeeded: number): any[] => {
    const candidates = [];
    const targetCount = Math.max(30, countNeeded * 3); // Overgenerate
    
    const allFocuses = ctx.focusSecondary ? [ctx.focusPrimary, ctx.focusPrimary, ctx.focusSecondary] : [ctx.focusPrimary];

    for (let i = 0; i < targetCount; i++) {
      const channel = ctx.channels[i % ctx.channels.length];
      const chanLogic = CHANNEL_MATRIX[channel];
      const focus = allFocuses[i % allFocuses.length];
      
      let allowedUnits = chanLogic.allowedUnits.filter((u: string) => 
        focus.prefUnits.includes(u) || UNIT_REQUIREMENTS[u]
      );
      if (allowedUnits.length === 0) allowedUnits = chanLogic.allowedUnits;
      
      const unitType = allowedUnits[i % allowedUnits.length];
      const audience = ctx.channelMap[channel]?.primary || cycle.primaryAudience;
      
      candidates.push({
        id: genId(),
        channel,
        format: chanLogic.bestFor.split(',')[0],
        contentUnitType: unitType,
        pillar: focus.pillars[i % focus.pillars.length] || PILLARS[0],
        audience,
        primaryFocus: focus.name || cycle.primaryStrategicFocus,
        secondaryFocus: focus === ctx.focusSecondary ? cycle.primaryStrategicFocus : (cycle.secondaryStrategicFocus !== 'None' ? cycle.secondaryStrategicFocus : ''),
        adoptionTrack: ADOPTION_TRACKS[i % ADOPTION_TRACKS.length],
        editorialThesis: focus.thesisPattern[i % focus.thesisPattern.length] || `Aligning ${unitType} with focus`,
        coreMessage: `Communicating ${chanLogic.function} to ${audience}`,
        audienceInsight: `Audience requires concrete evidence`,
        sourceBasis: 'Operating Core-backed', 
        proofNeeded: UNIT_REQUIREMENTS[unitType] ? UNIT_REQUIREMENTS[unitType][0] : 'Specific evidence',
        visualDirection: 'Dependent on channel format.',
        suggestedCTA: 'Engage with material',
        riskToAvoid: ctx.audiencePrimary.wrongOutput,
        draftInstruction: 'Draft context-aware copy matching format.',
        isProtected: false,
        version: cycle.version
      });
    }
    return candidates;
  };

  const scoreEditorialCandidates = (candidates: any[], ctx: any, protectedItems: any[]) => {
    return candidates.map(c => {
      let score = 0;
      
      // Channel fit based on custom map or default primary audience
      const targetAudience = ctx.channelMap[c.channel]?.primary || cycle.primaryAudience;
      const targetAudMap = AUDIENCE_MAP[targetAudience];
      
      if (targetAudMap?.channels.includes(c.channel)) score += 5;
      else score += 1;
      
      // Unit fit
      if (ctx.focusPrimary.prefUnits.includes(c.contentUnitType)) score += 5;
      else score += 2;

      // Risk safety (Avoid Focus penalty)
      if (ctx.avoidFocus && ctx.avoidFocus.prefUnits.includes(c.contentUnitType)) score -= 20;
      if (ctx.avoidFocus && c.pillar && ctx.avoidFocus.pillars.includes(c.pillar)) score -= 20;

      // Penalize repetition with protected items
      const isRepeated = protectedItems.some(p => p.channel === c.channel && p.contentUnitType === c.contentUnitType);
      if (isRepeated) score -= 15;

      c.score = score;
      return c;
    });
  };

  const selectCalendarItems = (candidates: any[], ctx: any, countNeeded: number) => {
    // Add randomization so regeneration isn't identical
    const noise = () => Math.random() * 5 - 2.5; 
    candidates.sort((a, b) => (b.score + noise()) - (a.score + noise()));
    
    const selected = [];
    const usedCombos = new Set();
    
    for (const c of candidates) {
      if (selected.length >= countNeeded) break;
      if (c.score < -10) continue; // Reject toxic items
      
      const combo = `${c.channel}-${c.contentUnitType}`;
      if (!usedCombos.has(combo)) {
        selected.push(c);
        usedCombos.add(combo);
      } else if (ctx.mode === 'Alternative Angle' || selected.length < countNeeded / 2) {
        selected.push(c);
      }
    }
    return selected;
  };

  const assignCalendarDates = (selected: any[], ctx: any, arc: any, protectedItems: any[]) => {
    const daysInMonth = new Date(ctx.year, ctx.month, 0).getDate();
    // Re-usable available dates per week
    const weeksBase: number[][] = [[], [], [], [], []];
    for (let d = 1; d <= daysInMonth; d++) {
      const weekIdx = Math.min(4, Math.floor((d - 1) / 7));
      weeksBase[weekIdx].push(d);
    }
    
    // Sort selected items by channel logical flow: Website -> Social -> Newsletter
    const channelOrder: Record<string, number> = { 'Website': 1, 'LinkedIn': 2, 'Instagram': 3, 'TikTok': 4, 'Newsletter': 5 };
    const sortedSelected = [...selected].sort((a, b) => (channelOrder[a.channel] || 99) - (channelOrder[b.channel] || 99));

    // Distribute evenly across chunks (weeks)
    let currentWeekIdx = 0;
    // We'll track the last used date index for each week so we cycle through the week's days
    const weekDatePointers = [0, 0, 0, 0, 0];
    const channelCountsPerWeek: Record<string, number>[] = [{}, {}, {}, {}, {}];

    return sortedSelected.map((s, idx) => {
      // Find a week that doesn't have too many of this channel already, or just use round-robin
      let targetWeekIdx = currentWeekIdx;
      for (let i = 0; i < 5; i++) {
        const checkIdx = (currentWeekIdx + i) % 5;
        if (weeksBase[checkIdx] && weeksBase[checkIdx].length > 0 && (channelCountsPerWeek[checkIdx][s.channel] || 0) < 3) {
          targetWeekIdx = checkIdx;
          break;
        }
      }
      
      const targetWeekArr = weeksBase[targetWeekIdx] || weeksBase[0];
      const rawPtr = weekDatePointers[targetWeekIdx] % targetWeekArr.length;
      
      // Spread dates out nicely if we have a full week
      const SPREAD_7 = [0, 3, 5, 1, 4, 2, 6]; 
      const SPREAD_6 = [0, 3, 1, 4, 2, 5];
      const SPREAD_5 = [0, 2, 4, 1, 3];
      
      let datePtr = rawPtr;
      if (targetWeekArr.length === 7) datePtr = SPREAD_7[rawPtr];
      else if (targetWeekArr.length === 6) datePtr = SPREAD_6[rawPtr];
      else if (targetWeekArr.length === 5) datePtr = SPREAD_5[rawPtr];
      
      const dateNum = targetWeekArr[datePtr];
      
      weekDatePointers[targetWeekIdx]++;
      channelCountsPerWeek[targetWeekIdx][s.channel] = (channelCountsPerWeek[targetWeekIdx][s.channel] || 0) + 1;
      currentWeekIdx = (targetWeekIdx + 1) % 5;

      const weekIndex = Math.min(4, Math.floor((dateNum - 1) / 7));
      
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
      
      // Clean up curly braces from generated strings
      Object.keys(s).forEach(k => {
        if (typeof (s as any)[k] === 'string' && /\{([^}]+)\}/.test((s as any)[k])) {
          if (s.pillar === 'Strategic Partners' || s.pillar === 'Sponsorship and Institutional Adoption') {
            if (k === 'editorialThesis') (s as any)[k] = "A partner contribution should be explained through its concrete role in production, capture, distribution, education, or institutional adoption.";
            if (k === 'proofNeeded') (s as any)[k] = "Add partner name, partner category, or specific contribution before final approval.";
            if (k === 'sourceBasis') (s as any)[k] = "Needs Source";
          } else {
             (s as any)[k] = (s as any)[k].replace(/\{([^}]+)\}/g, '$1');
          }
        }
      });
      s.draftInstruction = `Write a ${s.contentUnitType} for ${s.channel}. Focus: ${s.editorialThesis}. Avoid: ${s.riskToAvoid}.`;
      s.status = 'Proposed';
      s.riskLevel = 'Low';
      return s as CalendarItem;
    });
  };

  const reviewCalendarQuality = (currentItems: CalendarItem[], ctx: any, currentArc: any) => {
    let s = [];
    let g = [];
    let r = [];
    let recs = [];

    if (currentItems.length === 0) {
      setReview({ status: 'Not ready', strengths: [], gaps: ['No items generated.'], risks: [], recommendedFixes: ['Generate items.'] });
      return;
    }

    s.push(`Generated ${currentItems.length} items without blind template loops.`);

    // 1. Source Readiness
    const weakSources = currentItems.filter(i => ['Operating Core-backed', 'Needs validation', 'Manual source needed'].includes(i.sourceBasis));
    if (weakSources.length > 0) {
      g.push(`${weakSources.length} items lack a distinct asset source.`);
      recs.push('Assign a specific Core Document or Source Library asset.');
    } else {
      s.push('Source basis is structurally sound across items.');
    }

    // 2. Repetition Check
    const theses = currentItems.map(i => i.editorialThesis);
    const uniqueTheses = new Set(theses).size;
    if (uniqueTheses < currentItems.length * 0.4) {
      r.push(`High repetition: Only ${uniqueTheses} unique editorial theses across ${currentItems.length} items.`);
    } else {
      s.push('Strong diversity in editorial theses.');
    }

    // 3. Avoid Focus Check
    if (ctx.avoidFocus) {
      const toxic = currentItems.filter(i => ctx.avoidFocus.prefUnits.includes(i.contentUnitType));
      if (toxic.length > 0) r.push(`${toxic.length} items bleed into the Avoid Focus (${cycle.avoidFocus}).`);
      else s.push(`Successfully filtered out ${cycle.avoidFocus} topics.`);
    }

    // 4. Monthly Arc check
    if (!currentArc || !currentArc.monthThesis) {
      g.push('Monthly arc is undefined.');
    }

    let status: 'Strong' | 'Needs improvement' | 'Not ready' = 'Strong';
    if (g.length > 0 || r.length > 0) status = 'Needs improvement';
    if (r.length > 2 || weakSources.length > currentItems.length * 0.8) status = 'Not ready';

    setReview({ status, strengths: s, gaps: g, risks: r, recommendedFixes: recs });
  };

  // --- Handlers ---

  const buildContextFromState = () => ({
    focusPrimary: FOCUS_MAP[cycle.primaryStrategicFocus],
    focusSecondary: FOCUS_MAP[cycle.secondaryStrategicFocus],
    avoidFocus: cycle.avoidFocus !== 'None' ? FOCUS_MAP[cycle.avoidFocus] : null,
    audiencePrimary: AUDIENCE_MAP[cycle.primaryAudience],
    audienceSecondary: cycle.secondaryAudience !== 'None' ? AUDIENCE_MAP[cycle.secondaryAudience] : null,
    channels: cycle.activeChannels.filter(c => CHANNEL_MATRIX[c]),
    channelMap: cycle.channelAudienceMap,
    year: parseInt(cycle.planningMonth?.split('-')[0] || '2024'),
    month: parseInt(cycle.planningMonth?.split('-')[1] || '1')
  });

  const handleUpdateItem = (id: string, updates: Partial<CalendarItem>) => {
    if (selectedItem && selectedItem.id === id && !items.find(i => i.id === id)) {
      setSelectedItem({ ...selectedItem, ...updates });
      return;
    }
    const newItems = items.map(i => i.id === id ? { ...i, ...updates } : i);
    setItems(newItems);
    reviewCalendarQuality(newItems, buildContextFromState(), arc);
  };

  const handleLocalDraftUpdate = (updates: Partial<CalendarItem>) => {
    if (selectedItem) {
      setSelectedItem({ ...selectedItem, ...updates });
    }
  };

  const validateCalendarItemForDraft = (item: CalendarItem) => {
    const fieldsToCheck = [
      { key: 'title', label: 'Title' },
      { key: 'editorialThesis', label: 'Editorial Thesis' },
      { key: 'coreMessage', label: 'Core Message' },
      { key: 'audienceInsight', label: 'Audience Insight' },
      { key: 'visualDirection', label: 'Visual Direction' },
      { key: 'suggestedCTA', label: 'Suggested CTA' },
      { key: 'riskToAvoid', label: 'Risk to Avoid' },
      { key: 'claimSafetyNote', label: 'Claim Safety Note' },
      { key: 'draftInstruction', label: 'Draft Instruction' },
      { key: 'reasonForRecommendation', label: 'Reason for Recommendation' }
    ];

    const hardBlockers: {field: string, label: string}[] = [];
    const sourceWarnings: {field: string, label: string}[] = [];
    const qualityWarnings: {field: string, label: string}[] = [];

    const blockRegex = /(\{[^}]+\}|\[(partner|evidence|source|insert|add detail|TBD)\]|\b(TBD|TK|placeholder)\b)/i;
    
    fieldsToCheck.forEach(({ key, label }) => {
      const val = (item as any)[key] || '';
      if (blockRegex.test(val)) {
        hardBlockers.push({ field: key, label });
      }
    });

    const proofNeededVal = item.proofNeeded || '';
    if (blockRegex.test(proofNeededVal)) {
      hardBlockers.push({ field: 'proofNeeded', label: 'Proof Needed' });
    }

    const proofNeededLower = proofNeededVal.trim().toLowerCase();
    if (!proofNeededVal.trim() || proofNeededLower === 'source needed' || proofNeededLower === 'evidence needed' || proofNeededLower === 'partner detail needed' || proofNeededLower === 'needs validation.') {
      sourceWarnings.push({ field: 'proofNeeded', label: 'Proof Needed' });
    }
    
    const sourceBasisVal = item.sourceBasis || '';
    if (sourceBasisVal === 'Operating Core-backed' || sourceBasisVal === 'Needs Source' || sourceBasisVal === 'Needs Validation') {
      sourceWarnings.push({ field: 'sourceBasis', label: 'Source Basis' });
    }

    const visualDirLower = (item.visualDirection || '').toLowerCase();
    if (visualDirLower.includes('dependent on channel format') || visualDirLower === '') {
      qualityWarnings.push({ field: 'visualDirection', label: 'Visual Direction' });
    }
    const ctaLower = (item.suggestedCTA || '').toLowerCase();
    if (ctaLower.includes('engage with material') || ctaLower.includes('generic') || ctaLower === '') {
      qualityWarnings.push({ field: 'suggestedCTA', label: 'Suggested CTA' });
    }
    const insightLower = (item.audienceInsight || '').toLowerCase();
    if (insightLower.includes('audience requires concrete evidence') || insightLower.includes('generic') || insightLower === '') {
      qualityWarnings.push({ field: 'audienceInsight', label: 'Audience Insight' });
    }

    return { hardBlockers, sourceWarnings, qualityWarnings };
  };

  const handleRemoveItem = (id: string) => {
    const newItems = items.filter(i => i.id !== id);
    setItems(newItems);
    reviewCalendarQuality(newItems, buildContextFromState(), arc);
  };

  const handleCreateDraft = (item: CalendarItem & {sourceWarning?: boolean}) => {
    let advancedDraftInstruction = item.draftInstruction;
    if (item.sourceWarning) {
      advancedDraftInstruction += `\n\nSource status:\nThis item is Operating Core-backed but still requires source/proof before final approval.\n\nProof still needed:\n${item.proofNeeded}\n\nDrafting instruction:\nDraft carefully. Do not present unsupported details as confirmed facts. Use language that allows source confirmation later.\n\nMust Avoid:\nDo not invent partner names, dates, evidence, sponsors, locations, or confirmed proof.`;
    }

    const handoffPayload = {
      id: `cal-${item.id}`,
      calendarItemId: item.id,
      calendarId: cycle.id,
      calendarVersionId: cycle.version.toString(),
      title: item.title,
      date: item.date,
      channel: item.channel,
      format: item.format,
      strategicFocus: item.primaryFocus,
      secondaryFocus: item.secondaryFocus,
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
      draftInstruction: advancedDraftInstruction,
      operatingCoreInstructions: 'Apply COH tone and voice guidelines.',
      
      // Pack Support
      isMultiChannelPack: item.isMultiChannelPack,
      packTitle: item.packTitle,
      targetChannels: item.selectedChannels,
      
      status: 'Brief' as const,
      draftVersions: [],
      imageResults: [],
      revisionHistory: [],
      approved: false,
      saved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Auto-protect item once it's handed off
    handleUpdateItem(item.id, { status: 'Draft Handoff', isProtected: true });
    onHandoff(handoffPayload);
  };

  const handleDuplicateItem = (item: CalendarItem) => {
    const duplicated = { ...item, id: genId(), title: `${item.title} (Copy)`, isProtected: true, status: 'Proposed' };
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
      audience: cycle.primaryAudience,
      primaryFocus: cycle.primaryStrategicFocus,
      secondaryFocus: cycle.secondaryStrategicFocus,
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
      status: 'Proposed',
      isProtected: true,
      version: cycle.version
    };
    // Don't add to items immediately, just open the modal.
    setSelectedItem(manual);
  };

  const handleSaveCalendar = () => {
    const saved: SavedCalendar = {
      id: cycle.id,
      title: `Editorial Calendar - ${cycle.planningMonth}`,
      planningMonth: cycle.planningMonth?.split('-')[1] || '01',
      planningYear: cycle.planningMonth?.split('-')[0] || '2024',
      generatedDate: new Date().toISOString(),
      versionNumber: cycle.version,
      primaryStrategicFocus: cycle.primaryStrategicFocus,
      secondaryStrategicFocus: cycle.secondaryStrategicFocus,
      avoidFocus: cycle.avoidFocus,
      primaryAudience: cycle.primaryAudience,
      secondaryAudience: cycle.secondaryAudience,
      activeChannels: cycle.activeChannels,
      channelAudienceMap: cycle.channelAudienceMap,
      publishingIntensity: cycle.intensity,
      masterMonthlyArc: arc,
      weeklyArcs: arc ? arc.weeklyProgression : [],
      channelSubArcs: arc ? arc.channelSubArcs : {},
      calendarItems: items,
      calendarReview: review,
      approvedItemCount: items.filter(i => i.status === 'Approved').length,
      draftHandoffCount: items.filter(i => i.status === 'Draft Handoff').length,
      draftedItemCount: items.filter(i => i.status === 'Drafted' || i.status === 'Draft Handoff').length,
      sourceReadinessStatus: review.status,
      status: items.filter(i => i.status === 'Approved').length > 0 ? 'Approved' : 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      exportStatus: 'Pending',
      calendarId: `series-${cycle.planningMonth}`
    };

    const lib: SavedCalendar[] = safeLocalStorageGet('coh_saved_calendars_v1', []);
    const existingIdx = lib.findIndex((c) => c.id === saved.id);
    if (existingIdx >= 0) {
      lib[existingIdx] = saved;
    } else {
      lib.push(saved);
    }
    safeLocalStorageSet('coh_saved_calendars_v1', lib);
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExport = (format: string) => {
    executeExport(format, items, cycle);
  };

  const getErrorClass = (field: string) => {
    if (!validationResult) return '';
    if (validationResult.hardBlockers.some(e => e.field === field)) return 'border-red-400';
    if (validationResult.sourceWarnings.some(e => e.field === field)) return 'border-amber-400';
    if (validationResult.qualityWarnings.some(e => e.field === field)) return 'border-amber-200 text-amber-900 bg-amber-500/10 backdrop-blur-md';
    return '';
  };

  const renderMonthView = () => {
    if (items.length === 0) return null;
    const [yearStr, monthStr] = cycle.planningMonth?.split('-') || ['2024', '01'];
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    
    const blanks = Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="bg-surface-inset border border-border-standard rounded min-h-[120px]" />);
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNum = i + 1;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayItems = items.filter(item => item.date === dateStr);
      
      return (
        <div key={dayNum} className={`bg-surface-primary border p-2 min-h-[120px] flex flex-col gap-1 rounded ${dayItems.length > 0 ? 'border-violet-300 shadow-sm' : 'border-border-standard'}`}>
          <span className="text-[10px] font-bold text-text-muted">{dayNum}</span>
          {dayItems.map(item => (
            <div key={item.id} onClick={() => { setSelectedItem(item); setValidationResult(null); }} className="bg-surface-primary p-1.5 rounded border border-border-standard cursor-pointer hover:border-brand-gold transition flex flex-col gap-0.5">
              <div className="text-[9px] uppercase font-bold text-brand-gold line-clamp-1">{item.channel}</div>
              <div className="text-[10px] font-semibold text-text-primary leading-tight line-clamp-2" title={item.contentUnitType}>{item.contentUnitType}</div>
            </div>
          ))}
        </div>
      );
    });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="text-[10px] font-bold text-text-secondary text-center uppercase py-2">{d}</div>
        ))}
        {blanks}
        {days}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header & Action Bar */}
      <div className="bg-surface-primary border-b border-border-standard p-6 shrink-0 flex justify-between items-center">
        <div>
          <h2 className="page-title">
            Editorial Calendar Studio
          </h2>
          <p className="page-subtitle">Strategic content engine powered by Operating Core constraints.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
              Status: <span className="text-text-primary">{items.filter(i => i.status === 'Approved').length > 0 ? 'Approved' : 'Draft'}</span>
            </span>
            <Button onClick={onOpenLibrary} variant="outline" className="text-xs py-1.5 px-3">
              <Archive size={16} className="mr-1" /> Open Library
            </Button>
            <Button onClick={handleSaveCalendar} variant="secondary" className={`text-xs py-1.5 px-3 transition-colors ${saveSuccess ? 'bg-green-600 text-text-primary border-green-600 hover:bg-green-700' : ''}`}>
              {saveSuccess ? <><CheckCircle2 size={16} className="mr-1" /> Saved to Library</> : <><Save size={16} className="mr-1" /> Save Calendar</>}
            </Button>
          </div>
          {items.length > 0 && (
            <div className="flex items-center gap-2">
              <select 
                className="bg-surface-primary border border-border-standard text-text-primary text-xs font-semibold px-2 py-1 rounded outline-none cursor-pointer hover:border-violet-300 transition"
                onChange={(e) => {
                  if (e.target.value) {
                    handleExport(e.target.value);
                    e.target.value = '';
                  }
                }}
                value=""
              >
                <option value="" disabled>Export Calendar...</option>
                <option value="planning-csv">Export Planning CSV</option>
                <option value="planning-excel">Export Planning Excel</option>
                <option value="hootsuite-csv">Export Hootsuite CSV</option>
                <option value="hootsuite-excel">Export Hootsuite Review Sheet</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="flex flex-col gap-6 h-full pb-20">
          
          {/* Horizontal Controls Panel */}
          <div className="bg-surface-primary border border-border-standard p-5 rounded shadow-sm shrink-0">
            <div className="flex justify-between items-center mb-4 border-b border-border-standard pb-3">
              <h3 className="font-sans text-xl font-bold text-text-primary">Monthly Planning Parameters</h3>
              <button onClick={() => setShowAdvancedSettings(!showAdvancedSettings)} className="text-xs font-semibold text-text-secondary hover:text-text-primary flex items-center gap-1">
                <Settings2 size={14} /> {showAdvancedSettings ? 'Hide Advanced Settings' : 'Advanced Strategy Settings'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Timing & Intensity */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-text-secondary mb-1 uppercase text-[10px]">Planning Month</label>
                  <input type="month" className="form-control p-1.5 w-full text-sm font-semibold" value={cycle.planningMonth} onChange={e => setCycle({...cycle, planningMonth: e.target.value})} />
                </div>
                <div>
                  <label className="block font-bold text-text-secondary mb-1 uppercase text-[10px]">Publishing Intensity</label>
                  <select className="form-control p-1.5 w-full" value={cycle.intensity} onChange={e => setCycle({...cycle, intensity: e.target.value as any})}>
                    <option value="Light: 4-6 items">Light: 4-6 items</option>
                    <option value="Moderate: 8-12 items">Moderate: 8-12 items</option>
                    <option value="High: 14-20 items">High: 14-20 items</option>
                    <option value="Campaign Mode: 25-40 items">Campaign Mode: 25-40 items</option>
                  </select>
                </div>
              </div>

              {/* Strategic Focus */}
              <div className="space-y-4 bg-surface-inset p-3 rounded border border-border-standard">
                <div>
                  <label className="block font-bold text-text-primary mb-1 uppercase text-[10px]">Primary Focus</label>
                  <select className="form-control p-1.5 w-full border-brand-gold/50 font-bold" value={cycle.primaryStrategicFocus} onChange={e => setCycle({...cycle, primaryStrategicFocus: e.target.value})}>
                    {STRATEGIC_FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-text-secondary mb-1 uppercase text-[10px]">Secondary Focus (Layering)</label>
                  <select className="form-control p-1.5 w-full" value={cycle.secondaryStrategicFocus} onChange={e => setCycle({...cycle, secondaryStrategicFocus: e.target.value})}>
                    <option value="None">None</option>
                    {STRATEGIC_FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-red-600/70 mb-1 uppercase text-[10px]">Avoid Focus (Strict Penalty)</label>
                  <select className="form-control p-1.5 w-full border-red-200" value={cycle.avoidFocus} onChange={e => setCycle({...cycle, avoidFocus: e.target.value})}>
                    <option value="None">None</option>
                    {STRATEGIC_FOCUSES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>

              {/* Audience */}
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-text-primary mb-1 uppercase text-[10px]">Primary Audience</label>
                  <select className="form-control p-1.5 w-full" value={cycle.primaryAudience} onChange={e => setCycle({...cycle, primaryAudience: e.target.value})}>
                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-text-secondary mb-1 uppercase text-[10px]">Secondary Audience</label>
                  <select className="form-control p-1.5 w-full" value={cycle.secondaryAudience} onChange={e => setCycle({...cycle, secondaryAudience: e.target.value})}>
                    <option value="None">None</option>
                    {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              {/* Channels */}
              <div>
                <label className="block font-bold text-text-secondary mb-2 uppercase text-[10px]">Active Channels</label>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map(c => (
                    <button key={c} onClick={() => {
                        const newChannels = cycle.activeChannels.includes(c) ? cycle.activeChannels.filter(x => x !== c) : [...cycle.activeChannels, c];
                        setCycle({...cycle, activeChannels: newChannels});
                      }}
                      className={`px-3 py-1.5 text-[10px] rounded-full font-bold transition ${cycle.activeChannels.includes(c) ? 'bg-slate-900 text-white shadow-sm' : 'bg-surface-primary text-text-primary border border-border-strong hover:border-brand-gold'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {showAdvancedSettings && (
              <div className="mt-4 p-4 border border-border-standard rounded bg-surface-primary">
                <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3">Channel Audience Map</h4>
                <p className="text-xs text-text-secondary mb-4">Override the primary audience on specific active channels.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cycle.activeChannels.map(c => (
                    <div key={c} className="flex items-center gap-3 bg-surface-primary p-2 rounded border border-border-standard shadow-sm">
                      <div className="w-24 text-xs font-semibold text-text-primary shrink-0">{c}</div>
                      <select className="form-control p-1 text-xs w-full" 
                        value={cycle.channelAudienceMap[c]?.primary || cycle.primaryAudience}
                        onChange={(e) => {
                          const newMap = {...cycle.channelAudienceMap};
                          if (e.target.value === cycle.primaryAudience) {
                            delete newMap[c];
                          } else {
                            newMap[c] = { primary: e.target.value, secondary: '', objective: '' };
                          }
                          setCycle({...cycle, channelAudienceMap: newMap});
                        }}
                      >
                        {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-border-standard">
              <div className="flex items-center border border-border-strong rounded overflow-hidden shadow-sm">
                <Button onClick={() => { setCycle(prev => ({...prev, version: prev.version + 1})); handleGenerate('Generate New Version'); }} variant="primary" className="rounded-none border-r border-border-standard px-6 py-2.5">
                  <RefreshCw size={16} className="mr-2 inline" /> {items.length > 0 ? "Regenerate Calendar" : "Generate Monthly Calendar"}
                </Button>
                <select 
                  className="bg-slate-900 text-white text-xs font-semibold px-3 py-2 outline-none cursor-pointer hover:bg-brand-gold-hover transition-colors"
                  onChange={(e) => {
                    if (e.target.value) {
                      setCycle(prev => ({...prev, version: prev.version + 1}));
                      handleGenerate(e.target.value as any);
                      e.target.value = '';
                    }
                  }}
                  value=""
                >
                  <option value="" disabled>Specific Regeneration...</option>
                  <option value="Generate New Version">Generate New Version</option>
                  <option value="Regenerate All Items">Regenerate All Items</option>
                  <option value="Regenerate Weak Items Only">Regenerate Weak Items Only</option>
                  <option value="Regenerate Selected Week">Regenerate Selected Week</option>
                  <option value="Regenerate Selected Channel">Regenerate Selected Channel</option>
                  <option value="Generate Alternative Angle">Generate Alternative Angle</option>
                  <option value="Preserve Approved Items and Regenerate the Rest">Preserve Approved and Manual Items</option>
                </select>
              </div>
              
              <Button onClick={openAddManualModal} variant="outline">
                <Plus size={16} className="mr-1 inline" /> Add Manual Item
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1 min-h-0">
            {/* Calendar Canvas Panel */}
            <div className="col-span-1 lg:col-span-8 flex flex-col h-full gap-6">
              {/* Monthly Editorial Arc */}
              {arc && items.length > 0 && (
                <div className="bg-slate-900 text-white p-5 rounded shadow-sm shrink-0">
                  <h3 className="font-sans text-lg font-bold text-brand-gold mb-3 flex items-center gap-2">
                    <LayoutList size={18} /> Monthly Editorial Arc
                  </h3>
                  <div className="space-y-4 text-sm font-sans">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-brand-gold tracking-wider mb-1">Month Thesis</h4>
                      <p className="text-white/90 font-medium">{arc.monthThesis}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-brand-gold tracking-wider mb-1">Weekly Progression</h4>
                        <ul className="space-y-1">
                          {arc.weeklyProgression.map((w, i) => <li key={i} className="text-white/80 text-xs">- Week {i+1}: {w}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-brand-gold tracking-wider mb-1">Audience Movement</h4>
                          <p className="text-white/80 text-xs">{arc.mainAudienceMovement}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-brand-gold tracking-wider mb-1">Key Risks</h4>
                          <ul className="space-y-1">
                            {arc.keyRisks.map((r, i) => <li key={i} className="text-white/80 text-xs text-red-300">- {r}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Canvas */}
              <div className="flex flex-col flex-1 bg-surface-primary border border-border-standard rounded shadow-sm min-h-[400px]">
                <div className="border-b border-border-standard p-4 bg-surface-inset flex justify-between items-center shrink-0">
                  <h3 className="font-sans text-xl font-bold text-text-primary">Calendar Canvas</h3>
                  <div className="flex gap-1 bg-surface-primary border border-border-strong rounded p-0.5">
                    <button onClick={() => setViewMode('List')} className={`p-1.5 rounded transition-colors ${viewMode === 'List' ? 'bg-surface-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}><LayoutList size={16} /></button>
                    <button onClick={() => setViewMode('Month')} className={`p-1.5 rounded transition-colors ${viewMode === 'Month' ? 'bg-surface-primary text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}><Calendar size={16} /></button>
                  </div>
                </div>

                <div className="p-4 flex-1 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted">
                      <Calendar size={48} className="mb-4 opacity-50" />
                      <p>Generate a calendar to see your items.</p>
                    </div>
                  ) : viewMode === 'Month' ? renderMonthView() : (
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="bg-surface-primary border border-border-strong rounded p-4 flex gap-4 items-center shadow-sm hover:shadow transition group">
                          <div className="flex-1 flex flex-col md:flex-row gap-4 items-start md:items-center">
                            <div className="flex flex-col gap-1 w-full md:w-auto shrink-0 min-w-[150px]">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-text-primary bg-surface-primary px-2 py-0.5 rounded">{item.date}</span>
                                <span className="text-[10px] uppercase font-bold text-brand-gold">{item.channel}</span>
                              </div>
                              <span className="text-sm font-semibold text-text-primary">{item.contentUnitType}</span>
                            </div>
                            
                            <div className="flex-1 text-xs text-text-secondary border-l border-border-standard pl-4">
                              <p className="font-bold mb-0.5 text-text-primary">{item.editorialThesis}</p>
                              <p className="line-clamp-1 italic text-text-secondary">{item.reasonForRecommendation}</p>
                            </div>
                          </div>

                          <button className="p-2 text-brand-gold hover:text-text-primary bg-surface-primary rounded transition" onClick={() => { setSelectedItem(item); setValidationResult(null); }}>
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
              <div className="bg-surface-primary border border-border-standard rounded shadow-sm p-5 sticky top-0">
                <h3 className="font-sans text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-brand-gold" /> Calendar Review
                </h3>
                
                <div className="mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold w-full justify-center border ${
                    review.status === 'Strong' ? 'bg-green-500/10 backdrop-blur-md text-green-700 border-green-200' : 
                    review.status === 'Needs improvement' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    'bg-red-500/10 backdrop-blur-md text-red-700 border-red-200'
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
                      <ul className="space-y-2">{review.strengths.map((s, i) => <li key={i} className="text-text-primary text-xs pl-3 border-l-2 border-green-300">{s}</li>)}</ul>
                    </div>
                  )}
                  {review.gaps.length > 0 && (
                    <div>
                      <h4 className="font-bold text-yellow-600 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Gaps</h4>
                      <ul className="space-y-2">{review.gaps.map((g, i) => <li key={i} className="text-text-primary text-xs pl-3 border-l-2 border-yellow-300">{g}</li>)}</ul>
                    </div>
                  )}
                  {review.risks.length > 0 && (
                    <div>
                      <h4 className="font-bold text-red-600 text-xs uppercase mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Risks / Repetition</h4>
                      <ul className="space-y-2">{review.risks.map((r, i) => <li key={i} className="text-text-primary text-xs pl-3 border-l-2 border-red-300">{r}</li>)}</ul>
                    </div>
                  )}
                  {review.recommendedFixes.length > 0 && (
                    <div>
                      <h4 className="font-bold text-brand-gold text-xs uppercase mb-2 flex items-center gap-1"><Settings2 size={12}/> Recommendations</h4>
                      <ul className="space-y-2">{review.recommendedFixes.map((r, i) => <li key={i} className="text-text-primary text-xs pl-3 border-l-2 border-brand-gold/50">{r}</li>)}</ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* EXTENDED EDITORIAL BRIEF MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/80 z-[100] flex justify-center items-start md:items-center p-0 md:p-4 overflow-y-auto">
          <div className="bg-surface-primary w-full h-full md:h-auto md:max-w-4xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col md:max-h-[95vh]">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-text-primary shrink-0">
              <h3 className="font-sans text-lg font-bold flex items-center gap-2">
                <FileText size={18} className="text-brand-gold"/> Calendar Item Details
              </h3>
              <button onClick={() => { setSelectedItem(null); setValidationResult(null); }} className="hover:text-brand-gold transition"><X size={20} /></button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto flex-1 text-sm space-y-6">
              
              {validationResult && validationResult.hardBlockers.length > 0 && (
                <div className="bg-red-500/10 backdrop-blur-md border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-center gap-2 text-red-800 font-bold mb-2">
                    <AlertTriangle size={16} /> Action Required
                  </div>
                  <p className="text-red-700 text-xs mb-2">Resolve these placeholders before creating a draft:</p>
                  <ul className="list-disc list-inside text-red-700 text-xs space-y-1 ml-2">
                    {validationResult.hardBlockers.map((err, i) => (
                      <li key={i}>{err.label} contains unresolved placeholder</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult && validationResult.hardBlockers.length === 0 && validationResult.sourceWarnings.length > 0 && (
                <div className="bg-amber-500/10 backdrop-blur-md border-l-4 border-amber-500 p-4 rounded">
                  <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                    <AlertTriangle size={16} /> Source Warning
                  </div>
                  <p className="text-amber-700 text-xs mb-2">This item can be drafted, but it still needs source/proof before approval or publishing:</p>
                  <ul className="list-disc list-inside text-amber-700 text-xs space-y-1 ml-2">
                    {validationResult.sourceWarnings.map((err, i) => (
                      <li key={i}>{err.label}: {err.field === 'proofNeeded' ? selectedItem.proofNeeded : selectedItem.sourceBasis}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult && validationResult.hardBlockers.length === 0 && validationResult.sourceWarnings.length === 0 && validationResult.qualityWarnings.length > 0 && (
                <div className="bg-surface-primary border-l-4 border-border-strong p-4 rounded">
                  <div className="flex items-center gap-2 text-text-primary font-bold mb-2">
                    <AlertTriangle size={16} /> Quality Warning
                  </div>
                  <p className="text-gray-700 text-xs mb-2">This item can be drafted, but more detail would improve the result.</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Scheduling */}
                <div className="space-y-3 bg-surface-primary p-4 rounded border border-border-standard">
                  <h4 className="text-xs font-bold uppercase text-text-primary">1. Scheduling</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Date</label><input type="date" className={`form-control p-1.5 w-full text-xs ${getErrorClass('date')}`} value={selectedItem.date} onChange={e => handleLocalDraftUpdate({date: e.target.value})} /></div>
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Status</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.status} onChange={e => handleLocalDraftUpdate({status: e.target.value})}><option>Proposed</option><option>Needs Source</option><option>Needs review</option><option>Approved</option><option>Draft Handoff</option><option>Drafting</option></select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Channel</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.channel} onChange={e => handleLocalDraftUpdate({channel: e.target.value})}>{CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Format</label><input type="text" className="form-control p-1.5 w-full text-xs" value={selectedItem.format} onChange={e => handleLocalDraftUpdate({format: e.target.value})} /></div>
                  </div>
                </div>

                {/* 2. Strategy */}
                <div className="space-y-3 bg-surface-primary p-4 rounded border border-border-standard">
                  <h4 className="text-xs font-bold uppercase text-text-primary">2. Strategy</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Unit Type</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.contentUnitType} onChange={e => handleLocalDraftUpdate({contentUnitType: e.target.value})}>{UNIT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Pillar</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.pillar} onChange={e => handleLocalDraftUpdate({pillar: e.target.value})}>{PILLARS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Audience</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.audience} onChange={e => handleLocalDraftUpdate({audience: e.target.value})}>{AUDIENCES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Adoption Track</label><select className="form-control p-1.5 w-full text-xs" value={selectedItem.adoptionTrack} onChange={e => handleLocalDraftUpdate({adoptionTrack: e.target.value})}>{ADOPTION_TRACKS.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                  </div>
                </div>
              </div>

              {/* 3. Editorial Brief */}
              <div className="space-y-3 border border-border-standard p-4 rounded">
                <h4 className="text-xs font-bold uppercase text-brand-gold">3. Editorial Brief</h4>
                <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Title</label><input type="text" className={`form-control p-1.5 w-full text-xs font-bold ${getErrorClass('title')}`} value={selectedItem.title} onChange={e => handleLocalDraftUpdate({title: e.target.value})} /></div>
                <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Editorial Thesis</label><textarea className={`form-control p-2 w-full text-xs font-medium ${getErrorClass('editorialThesis')}`} rows={2} value={selectedItem.editorialThesis} onChange={e => handleLocalDraftUpdate({editorialThesis: e.target.value})} /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Core Message</label><textarea className={`form-control p-2 w-full text-xs ${getErrorClass('coreMessage')}`} rows={2} value={selectedItem.coreMessage} onChange={e => handleLocalDraftUpdate({coreMessage: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Audience Insight</label><textarea className={`form-control p-2 w-full text-xs ${getErrorClass('audienceInsight')}`} rows={2} value={selectedItem.audienceInsight} onChange={e => handleLocalDraftUpdate({audienceInsight: e.target.value})} /></div>
                </div>
                <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Suggested CTA</label><input type="text" className={`form-control p-1.5 w-full text-xs ${getErrorClass('suggestedCTA')}`} value={selectedItem.suggestedCTA} onChange={e => handleLocalDraftUpdate({suggestedCTA: e.target.value})} /></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4. Evidence & Safety */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-gold border-b border-border-standard pb-1">4. Evidence and Safety</h4>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Source Basis</label>
                    <select className="form-control p-1.5 w-full text-xs font-bold text-text-primary" value={selectedItem.sourceBasis} onChange={e => handleLocalDraftUpdate({sourceBasis: e.target.value})}>
                      <option>Operating Core-backed</option>
                      <option>Core Document-backed</option>
                      <option>Source Library-backed</option>
                      <option>Event-backed</option>
                      <option>Manual source needed</option>
                      <option>Needs validation</option>
                      <option>Not source-ready</option>
                    </select>
                  </div>
                  <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Proof Needed</label><textarea className={`form-control p-1.5 w-full text-xs ${getErrorClass('proofNeeded')}`} rows={2} value={selectedItem.proofNeeded} onChange={e => handleLocalDraftUpdate({proofNeeded: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Risk to Avoid</label><textarea className={`form-control p-1.5 w-full text-xs text-red-700 bg-red-500/10 backdrop-blur-md ${getErrorClass('riskToAvoid')}`} rows={2} value={selectedItem.riskToAvoid} onChange={e => handleLocalDraftUpdate({riskToAvoid: e.target.value})} /></div>
                </div>

                {/* 5. Creative Direction */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-brand-gold border-b border-border-standard pb-1">5. Creative Direction</h4>
                  <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Visual Direction</label><textarea className={`form-control p-1.5 w-full text-xs ${getErrorClass('visualDirection')}`} rows={2} value={selectedItem.visualDirection} onChange={e => handleLocalDraftUpdate({visualDirection: e.target.value})} /></div>
                  <div><label className="block text-[10px] uppercase font-bold text-text-secondary mb-1">Draft Instruction</label><textarea className={`form-control p-2 w-full text-xs ${getErrorClass('draftInstruction')}`} rows={3} value={selectedItem.draftInstruction} onChange={e => handleLocalDraftUpdate({draftInstruction: e.target.value})} /></div>
                </div>
              </div>

              {/* 6. Recommendation Logic */}
              <div className="bg-surface-inset p-4 rounded border border-border-standard">
                <h4 className="text-xs font-bold uppercase text-text-primary mb-2">6. Recommendation Logic</h4>
                <p className="text-xs text-text-primary italic">{selectedItem.reasonForRecommendation}</p>
              </div>
            </div>

            <div className="p-4 border-t border-border-standard flex flex-col md:flex-row justify-between gap-4 bg-surface-primary shrink-0">
              <div className="flex gap-2">
                <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-500/10 backdrop-blur-md border-red-200" onClick={() => { handleRemoveItem(selectedItem.id); setSelectedItem(null); setValidationResult(null); }}>
                  <Trash2 size={16} className="inline mr-1"/> {items.find(i => i.id === selectedItem.id) ? 'Delete' : 'Cancel'}
                </Button>
                {items.find(i => i.id === selectedItem.id) && (
                  <Button variant="outline" onClick={() => handleDuplicateItem(selectedItem)}><Copy size={16} className="inline mr-1"/> Duplicate</Button>
                )}
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button variant="outline" onClick={() => {
                  let updatedItem = { ...selectedItem };
                  if (!items.find(i => i.id === selectedItem.id)) {
                    setItems([...items, updatedItem]);
                    reviewCalendarQuality([...items, updatedItem], buildContextFromState(), arc);
                  } else {
                    const newItems = items.map(i => i.id === selectedItem.id ? updatedItem : i);
                    setItems(newItems);
                    reviewCalendarQuality(newItems, buildContextFromState(), arc);
                  }
                  setSelectedItem(null);
                  setValidationResult(null);
                }} className="flex-1 md:flex-none">
                  {items.find(i => i.id === selectedItem.id) ? 'Save Changes' : 'Add to Calendar'}
                </Button>
                <Button variant="primary" onClick={() => {
                  const result = validateCalendarItemForDraft(selectedItem);
                  
                  if (result.hardBlockers.length > 0) {
                    setValidationResult(result);
                    return;
                  }

                  let updatedItem = { ...selectedItem, status: 'Draft Handoff' };
                  if (!items.find(i => i.id === selectedItem.id)) {
                    setItems([...items, updatedItem as any]);
                    reviewCalendarQuality([...items, updatedItem as any], buildContextFromState(), arc);
                  } else {
                    const newItems = items.map(i => i.id === selectedItem.id ? updatedItem : i);
                    setItems(newItems as any);
                    reviewCalendarQuality(newItems as any, buildContextFromState(), arc);
                  }
                  handleCreateDraft(updatedItem as any);
                  setSelectedItem(null);
                  setValidationResult(null);
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

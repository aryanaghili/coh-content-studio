import { Menu, X, RefreshCw } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';
import { buildAdvancedBriefFromCalendarItem } from './utils/calendarHandoffUtils';
import {
  parseVisualDirectionInput,
  serializeVisualBriefForStorage,
  compileVisualStudioPrompt
} from './lib/visualPromptCompiler';

import { LANGUAGES, getLanguageDirection } from './lib/languages';
import { RevisionStudio } from './components/RevisionStudio';
import { GuidedTour } from './components/GuidedTour';
import { EditorialCalendarStudio } from './components/EditorialCalendarStudio';
import { CalendarLibrary } from './components/CalendarLibrary';
import type { SavedCalendar } from './components/CalendarLibrary';
import { safeLocalStorageGet, safeLocalStorageSet, safeLocalStorageRemove } from './utils/storage';
import { getCoreDocuments } from './lib/coreDocumentsStorage';
import type { CoreDocument } from './lib/coreDocumentsStorage';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './components/ui/Card';
import { Badge } from './components/ui/Badge';
import { Input } from './components/ui/Input';
import { Textarea } from './components/ui/Textarea';
import { Select } from './components/ui/Select';
import { useState, useEffect, useRef } from 'react';
import {




  LayoutDashboard,
  Calendar,
  FileText,
  Cpu,
  Sliders,
  Bookmark,
  Trash2,
  Check,
  AlertTriangle,
  ChevronRight,
  Edit3,
  Terminal,
  Upload,
  Settings,
  FolderOpen,
  Filter,
  ArrowRight,
  Undo,
  Lightbulb,
  FolderHeart,
  Cpu as CpuIcon
, AlertCircle, Camera, Globe, Mail, MessageSquare, Briefcase, Layers, Bell} from 'lucide-react';
import { ASPECT_RATIO_PRESETS, ASPECT_RATIO_GROUP_ORDER, getPresetById } from './lib/aspectRatios';
import { DEFAULT_COH_SOURCES } from './data/defaultSources';
import { ErrorBoundary } from './components/ErrorBoundary';
import { TopBar } from './components/TopBar';
import {
  PROTECTED_COH_KERNEL,
  safeMergeOperatingCore,
  createDefaultOperatingCore,
  compileOperatingCoreContext,
  normalizeText,
  getAuthoritativeAudiences,
  type OperatingCore
} from './lib/operatingCore';
import { safeRead } from './lib/storage';
import OperatingCoreAdmin from './components/OperatingCoreAdmin';
import {
  compileGovernedContext,
  extractWorkContextFromWorkItem,
  inferDefaultSourceRole,
  type WorkContext,
  type TaskSourceBinding,
  type SourceTaskRole
} from './lib/contextCompiler';
import { ContextManifestPanel } from './components/ContextManifestPanel';
import {
  ALL_SOURCE_TASK_ROLES,
  loadSourceIntelligenceStore,
  upsertSourceIntelligenceRecord,
  removeSourceIntelligenceRecord,
  enforceSourceIntelligenceClaimDiscipline,
  buildDeterministicSourceAnalysis,
  type SourceIntelligenceAnalysis
} from './lib/sourceIntelligence';
import { SourceIntelligenceCardAddon } from './components/SourceIntelligencePanel';
import {
  enrichAndDiversifyOpportunities,
  buildIdeationToContentHandoff,
  evaluateOpportunityDiversity,
  COH_COMMUNICATION_JOBS,
  type ReuseOpportunity,
  type IdeationOpportunityProposal
} from './lib/ideationIntelligence';
import { IdeationOpportunityCard } from './components/IdeationOpportunityCard';
import { ReframingStudio } from './components/ReframingStudio';
import type { ReframeOriginType } from './lib/reframingEngine';
import {
  CurrentWorkContextBar,
  buildWorkContextSnapshot
} from './components/CurrentWorkContextBar';

// --- Type Definitions ---

// --- WORK ITEM EXPERIENCE LAYER ---
export type WorkItemStatus = 'Idea' | 'Brief' | 'Draft' | 'Needs Revision' | 'Needs Source Check' | 'Visual Direction Ready' | 'Image Generated' | 'Approved' | 'Saved';

export interface WorkItemDraft {
  id: string;
  text: string;
  createdAt: string;
}

export interface WorkItemRevision {
  id: string;
  originalDraftId: string;
  revisedText: string;
  createdAt: string;
  notes?: string;
}

export interface WorkItemImage {
  id: string;
  url: string;
  createdAt: string;
  prompt: string;
}

export interface WorkItem {
  id: string;
  title: string;
  type?: string;
  channel?: string;
  outputFormat?: string;
  audience?: string;
  purpose?: string;
  language?: string;
  status: WorkItemStatus;
  
  sourceContext?: string;
  sourceTitle?: string;
  sourceType?: string;
  
  draftVersions: WorkItemDraft[];
  selectedDraftId?: string;
  
  visualDirection?: string;
  imageResults: WorkItemImage[];
  
  revisionHistory: WorkItemRevision[];
  
  approved: boolean;
  saved: boolean;
  
  // Cross-library tracking & calendar mapping
  calendarId?: string;
  calendarVersionId?: string;
  calendarItemId?: string;
  ideaId?: string;
  sourceIds?: string[];
  contentItemId?: string;
  visualAssetId?: string;
  revisionVersionId?: string;

  // Advanced Brief overrides / Multi-Channel fields
  isMultiChannelPack?: boolean;
  packTitle?: string;
  targetChannels?: string[];
  
  createdAt: string;
  updatedAt: string;
  origin?: string;
  workContext?: WorkContext;
}






import {
  REVISION_ACTIONS,
  REVISION_GROUP_ORDER,
  type RevisionActionDef,
  type RevisionActionGroup
} from './lib/revisionActions';
import {
  resolveSmartBrief,
  type GenerationSpeedMode,
  type ResolvedSmartBrief
} from './lib/smartBriefAndRevision';
import { SmartBriefPanel } from './components/SmartBriefPanel';

export { REVISION_ACTIONS, REVISION_GROUP_ORDER, PROTECTED_COH_KERNEL };
export type { RevisionActionDef, RevisionActionGroup };

export interface SourceFile {
  id: string;
  title: string;
  type: 'Event Notes' | 'Partner Profile' | 'Sponsor Notes' | 'Meeting Notes' | 'Campaign Notes' | 'Article / Media Coverage' | 'Website Reference' | 'Visual Reference' | 'Approved Example' | 'Pasted Notes' | 'Link / URL' | 'Other';
  status: 'Active' | 'Archived' | 'Needs Review';
  content: string;
  notes: string;
  url?: string;
  createdAt: string;
  selected?: boolean;
  selectable?: boolean;
}

interface ContentBrief {
  creationScope?: 'Single Channel' | 'Multi-Channel Pack';
  targetChannels?: string[];
  topic: string;
  channel: string;
  pillar: string;
  audience: string;
  customAudience: string;
  purpose: string;
  directionMode: 'auto' | 'none' | 'custom';
  angle: string;
  customDirection: string;
  selectedSourceIds: string[];
  mustInclude: string;
  mustAvoid: string;
  desiredLength: string;
  customLengthCount: string;
  toneIntensity: number;
  language: string;
  outputFormat: string;
  creationIntent?: string;
}

interface SimpleBrief {
  goal: string;
  channel: string;
}

interface QuickBrief {
  creationScope?: 'Single Channel' | 'Multi-Channel Pack';
  targetChannels?: string[];
  goal: string;
  channel: string;
  notes: string;
  mustInclude: string;
  mustAvoid: string;
  language: string;
  outputFormat: string;
}

export interface SavedContent {
  id: string;
  title: string;
  displayName?: string;
  savedAt?: string;
  outputFormat?: string;
  language?: string;
  sourceDraftId?: string;
  revisionVersion?: number;
  revisionAction?: string;
  finalCopy?: string;
  visualDirection?: string;
  metadata?: Record<string, any>;
  channel: string;
  pillar: string;
  angle: string;
  audience: string;
  purpose: string;
  status: 'Draft' | 'Revised' | 'Approved' | 'Published';
  sourcesUsed: string[];
  createdAt: string;
  lastEdited: string;
  text: string;
  notes: string;
  version: number;
  visualIdeation?: string;
  visualAssets?: { id: string; url: string; prompt: string; createdAt: string; provider: string; model: string; aspectRatio: string; sourceDirection: string }[];
  source?: string;
  calendarId?: string;
  calendarVersionId?: string;
  calendarItemId?: string;
}

export interface SavedIdea {
  id: string;
  title: string;
  originalInput: string;
  category: string;
  explanation: string;
  whyItWorks: string;
  communicationJob?: string;
  coreTension?: string;
  desiredAudienceResponse?: string;
  availableEvidence?: string[];
  evidenceStillRequired?: string[];
  unresolvedAssumptions?: string[];
  suggestedChannel: string;
  suggestedFormat: string;
  suggestedTone: string;
  suggestedPillar?: string;
  strategicAngle?: string;
  reuseOpportunity?: ReuseOpportunity;
  possibleHook: string;
  possibleNextStep: string;
  possibleFirstPost?: string;
  riskToAvoid?: string;
  suggestedAudience?: string;
  language: string;
  dateCreated: string;
  status: 'New' | 'Promising' | 'Ready for Content' | 'Used' | 'Archived' | 'Not Useful';
  notes?: string;
  sourceIds?: string[];
  sourceRoles?: Record<string, SourceTaskRole>;
  visualAssets?: { id: string; url: string; prompt: string; createdAt: string; provider: string; model: string; aspectRatio: string; sourceDirection: string }[];
}

interface ContentDirection {
  title: string;
  strategicFrame: string;
  bestChannelFit: string;
  whatToSay: string;
  whatNotToSay: string;
  recommendedOutputType: string;
  visualImplication: string;
}

interface VersionHistory {
  version: number;
  text: string;
  timestamp: string;
  actionUsed: string;
}

interface ContentTemplate {
  name: string;
  desc: string;
  channel: string;
  pillar: string;
  audience: string;
  purpose: string;
  directionMode: 'auto' | 'none' | 'custom';
  desiredLength: string;
  mustInclude: string;
  mustAvoid: string;
  outputFormat: string;
  visualDesignRequirement: string;
}

// --- AI Model Registry ---
interface AIModelConfig {
  id: string;
  label: string;
  provider: string;
  type: 'text' | 'image';
  quality: string;
  speed: string;
  usage: string;
  bestUseCase: string;
  tierLabel?: string;
  isRecommended?: boolean;
}

const MODEL_REGISTRY: AIModelConfig[] = [
  // OpenAI Text (Current Generation)
  { id: 'gpt-6-luna', label: 'GPT-6 Luna - Efficient', tierLabel: 'Efficient', provider: 'openai', type: 'text', quality: 'High', speed: 'Fast', usage: 'Efficient', bestUseCase: 'Recommended for most routine Content Studio work and cost-efficient generation, Drafts, Ideation, Revision, Source analysis', isRecommended: true },
  { id: 'gpt-6.1-sol', label: 'GPT-6.1 Sol - Advanced', tierLabel: 'Advanced', provider: 'openai', type: 'text', quality: 'Highest', speed: 'Medium-Fast', usage: 'Advanced Reasoning', bestUseCase: 'Stronger reasoning for difficult strategic or transformation work, Complex institutional positioning, Multi-stakeholder framing' },
  // OpenAI Text (Legacy / Compatible)
  { id: 'gpt-5.5', label: 'GPT-5.5 (Compatible)', tierLabel: 'Compatible', provider: 'openai', type: 'text', quality: 'Highest', speed: 'Fast', usage: 'High', bestUseCase: 'complex strategy, premium writing, nuanced professional content' },
  { id: 'gpt-5.4', label: 'GPT-5.4 (Compatible)', tierLabel: 'Compatible', provider: 'openai', type: 'text', quality: 'Very high', speed: 'Fast', usage: 'Medium-high', bestUseCase: 'strong everyday professional content and strategy work' },
  { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini (Compatible)', tierLabel: 'Compatible', provider: 'openai', type: 'text', quality: 'Strong', speed: 'Faster', usage: 'Lower', bestUseCase: 'Drafts, Ideation, Revision, Prompt generation, Daily content operations' },
  { id: 'gpt-4o', label: 'GPT-4o (Legacy)', tierLabel: 'Legacy', provider: 'openai', type: 'text', quality: 'Legacy / compatible', speed: 'Fast', usage: 'Medium', bestUseCase: 'fallback compatibility if newer models are unavailable' },
  
  // OpenAI Image
  { id: 'gpt-image-2', label: 'GPT Image 2', provider: 'openai', type: 'image', quality: 'Highest', speed: 'Medium', usage: 'High', bestUseCase: 'Visual Studio, Campaign artwork, Social media graphics, Editorial illustrations', isRecommended: true },
  { id: 'gpt-image-1', label: 'GPT Image 1', provider: 'openai', type: 'image', quality: 'High', speed: 'Medium', usage: 'Medium-high', bestUseCase: 'general high-quality image generation' },
  { id: 'dall-e-3', label: 'DALL-E 3 (Legacy)', provider: 'openai', type: 'image', quality: 'Legacy / compatible', speed: 'Medium', usage: 'Medium-high', bestUseCase: 'fallback image generation if GPT Image models are unavailable' },
  
  // Gemini Text
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: 'gemini', type: 'text', quality: 'High', speed: 'Medium', usage: 'Medium', bestUseCase: 'Deep context reasoning and drafting.', isRecommended: true },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: 'gemini', type: 'text', quality: 'Medium', speed: 'Fastest', usage: 'Low', bestUseCase: 'Fast, high-volume ideation.' },
  
  // Anthropic Text
  { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet', provider: 'anthropic', type: 'text', quality: 'Best', speed: 'Fast', usage: 'Medium', bestUseCase: 'Creative writing, nuance, and logic.', isRecommended: true },
  { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus', provider: 'anthropic', type: 'text', quality: 'High', speed: 'Slow', usage: 'High', bestUseCase: 'Heavy reasoning and complex problem solving.' },
  
  // Mistral Text
  { id: 'mistral-large-latest', label: 'Mistral Large', provider: 'mistral', type: 'text', quality: 'High', speed: 'Fast', usage: 'Medium', bestUseCase: 'General-purpose European-language content.', isRecommended: true },
  { id: 'mistral-small', label: 'Mistral Small', provider: 'mistral', type: 'text', quality: 'Medium', speed: 'Fastest', usage: 'Low', bestUseCase: 'Fast completion tasks.' },

  // OpenRouter Text
  { id: 'openai/gpt-4o', label: 'OpenAI: GPT-4o', provider: 'openrouter', type: 'text', quality: 'Best', speed: 'Fast', usage: 'Low', bestUseCase: 'Final-quality writing and logic.', isRecommended: true },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Anthropic: Claude 3.5 Sonnet', provider: 'openrouter', type: 'text', quality: 'Best', speed: 'Fast', usage: 'Medium', bestUseCase: 'Creative writing and complex reasoning.' },
  { id: 'google/gemini-1.5-pro', label: 'Google: Gemini 1.5 Pro', provider: 'openrouter', type: 'text', quality: 'High', speed: 'Medium', usage: 'Medium', bestUseCase: 'Deep context reasoning.' }
];

// --- Supported Languages List ---


// --- Channel & Format Compatibility Matrix ---
const CHANNELS = [
  'LinkedIn',
  'Instagram',
  'Newsletter',
  'Website',
  'Email / Direct Outreach',
  'WhatsApp',
  'TikTok',
  'X / Twitter',
  'Facebook',
  'YouTube',
  'Snapchat',
  'Internal Teams'
];

const CHANNEL_FORMATS: Record<string, string[]> = {
  'LinkedIn': ['Post', 'Carousel', 'Thought Piece', 'Executive Note'],
  'Instagram': ['Caption', 'Carousel', 'Reel Caption', 'Story Sequence', 'Visual Designer Brief'],
  'Newsletter': ['Newsletter Section', 'Long-Form Article', 'Event Update', 'Partner Update'],
  'Website': ['Website Section', 'News / Media Article', 'Long-Form Article', 'Event Page Copy'],
  'Email / Direct Outreach': ['Email / Letter', 'Sponsor Pitch Paragraph', 'Partner Note', 'Follow-Up Note', 'Invitation Note'],
  'WhatsApp': ['WhatsApp Message', 'Follow-Up Note'],
  'TikTok': ['Short Video Script', 'Caption', 'Hook Ideas'],
  'X / Twitter': ['Post', 'Thread', 'Short Announcement'],
  'Facebook': ['Post', 'Event Update', 'Caption'],
  'YouTube': ['Video Description', 'Short Video Script', 'Title / Description Pack'],
  'Snapchat': ['Story Sequence', 'Short Caption'],
  'Internal Teams': ['Internal Update', 'Action Summary', 'Follow-Up Note']
};

const CONTENT_TEMPLATES: ContentTemplate[] = [
  {
    name: 'LinkedIn Institutional Positioning',
    desc: 'For cultural institutions, sponsors, partners. Focus: credibility, adoption, cultural durability.',
    channel: 'LinkedIn',
    pillar: 'Partnerships, Sponsorship & Institutional Value',
    audience: 'Sponsors & Patrons',
    purpose: 'Institutional Positioning',
    directionMode: 'auto',
    desiredLength: 'Medium: 120-180 words',
    mustInclude: 'repertoire-based climate canon, live opera as origin asset',
    mustAvoid: 'hype, greenwashing activist slogans',
    outputFormat: 'Post',
    visualDesignRequirement: 'Sober text card with thin gold framing or strategic founder quote layout.'
  },
  {
    name: 'Instagram Visual Caption',
    desc: 'For visual posts, production images, opera worlds. Focus: human, precise, atmospheric.',
    channel: 'Instagram',
    pillar: 'Opera Worlds & Artistic Method',
    audience: 'General Public',
    purpose: 'Artistic Explanation',
    directionMode: 'auto',
    desiredLength: 'Short: 50-80 words',
    mustInclude: 'climate as lived condition, somatic design',
    mustAvoid: 'long corporate blocks',
    outputFormat: 'Caption',
    visualDesignRequirement: 'Atmospheric scene render with deep backlighting.'
  },
  {
    name: 'Instagram Carousel Explainer',
    desc: 'For explaining COH, the Tetralogy, cultural IP, or a specific opera. Focus: slide-by-slide clarity.',
    channel: 'Instagram',
    pillar: 'Climate Tetralogy & Canon',
    audience: 'General Public',
    purpose: 'Audience Education',
    directionMode: 'auto',
    desiredLength: 'Medium: 120-180 words',
    mustInclude: 'The Climate Tetralogy, Air, Fire, Water, Earth',
    mustAvoid: 'dense essay text on slides',
    outputFormat: 'Carousel',
    visualDesignRequirement: '7-slide sequential layout with high-contrast typography.'
  },
  {
    name: 'Sponsor-Facing Paragraph',
    desc: 'For patrons, sponsors, strategic partners. Focus: value, fit, low-hype commercial logic.',
    channel: 'Email / Direct Outreach',
    pillar: 'Partnerships, Sponsorship & Institutional Value',
    audience: 'Sponsors & Patrons',
    purpose: 'Sponsor Interest',
    directionMode: 'auto',
    desiredLength: 'Medium: 120-180 words',
    mustInclude: 'licensing, institutional adoption, patron backing, cultural IP',
    mustAvoid: 'NGO plea language',
    outputFormat: 'Sponsor Pitch Paragraph',
    visualDesignRequirement: 'Deck-style clean layout with minimal decoration.'
  },
  {
    name: 'Partner Update',
    desc: 'For existing or prospective partners. Focus: what changed, why it matters, next step.',
    channel: 'Email / Direct Outreach',
    pillar: 'Production & Behind the Work',
    audience: 'Strategic Partners',
    purpose: 'Partner Attraction',
    directionMode: 'auto',
    desiredLength: 'Medium: 120-180 words',
    mustInclude: 'repertoire-based climate canon, live opera as origin asset',
    mustAvoid: 'informal chat tones',
    outputFormat: 'Partner Note',
    visualDesignRequirement: 'Sober layout with production notes screenshot.'
  },
  {
    name: 'Newsletter Section',
    desc: 'For monthly or campaign updates. Focus: continuity, proof, progress.',
    channel: 'Newsletter',
    pillar: 'Events, Convenings & Public Moments',
    audience: 'Sponsors & Patrons',
    purpose: 'Proof Point',
    directionMode: 'auto',
    desiredLength: 'Medium: 120-180 words',
    mustInclude: 'repertoire-based climate canon, Climate Opera Haus',
    mustAvoid: 'letter greetings like Dear Patron',
    outputFormat: 'Newsletter Section',
    visualDesignRequirement: 'Section divider with editorial spacing.'
  },
  {
    name: 'Website / News & Media Article',
    desc: 'For durable public updates. Focus: factual, polished, source-backed.',
    channel: 'Website',
    pillar: 'Documentary, Media & Cultural IP',
    audience: 'General Public',
    purpose: 'Thought Leadership',
    directionMode: 'none',
    desiredLength: 'Article: 800-1200 words',
    mustInclude: 'Climate Opera Haus, Cultural Engine for Climate Transition',
    mustAvoid: 'emotional copy, conversational fragments',
    outputFormat: 'News / Media Article',
    visualDesignRequirement: 'Clean hero image header with minimalist editorial layout.'
  },
  {
    name: 'Multi-Channel Pack',
    desc: 'For one idea adapted to LinkedIn, Instagram, X, newsletter, and partner note. Opens in Multi-Channel Pack scope.',
    channel: 'LinkedIn',
    pillar: 'Climate Tetralogy & Canon',
    audience: 'General Public',
    purpose: 'Awareness',
    directionMode: 'none',
    desiredLength: 'Long: 250-350 words',
    mustInclude: 'Climate Opera Haus, Climate Tetralogy',
    mustAvoid: 'generic copy',
    outputFormat: 'Post',
    visualDesignRequirement: 'Tabbed channel package cards.'
  }
];

// --- Custom Reusable Tooltip Component ---
function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-block ml-1 align-middle group cursor-pointer">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={(e) => {
          e.stopPropagation();
          setVisible(!visible);
        }}
        aria-label="Help information"
        className="w-3.5 h-3.5 inline-flex items-center justify-center text-[9px] bg-slate-900/10 hover:bg-slate-900/20 text-text-primary rounded-full font-bold transition focus:outline-none focus:ring-1 focus:ring-coh-gold"
      >
        ?
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2.5 bg-slate-900 text-white text-[10px] rounded shadow-lg z-50 pointer-events-none leading-relaxed text-left font-sans normal-case font-normal border border-border-strong">
          {text}
        </span>
      )}
    </span>
  );
}

export default function App() {
  const [authError, setAuthError] = useState('');
  // --- Navigation & Core State ---
  const location = useLocation();
  const navigate = useNavigate();

  const validTabs = [
    'command-center', 'ideation-workspace', 'editorial-calendar', 'content-workspace',
    'visual-studio', 'revision-studio', 'reframing-studio', 'idea-library', 'content-library', 
    'source-library', 'operating-core', 'settings', 'calendar-library', 'prompt-builder'
  ];

  const [reframingInitialOrigin, setReframingInitialOrigin] = useState<{
    originType: ReframeOriginType;
    originId?: string;
    originTitle?: string;
    sourceContent: string;
    originChannel?: string;
    originAudience?: string;
    suggestedIntent?: string;
  } | null>(null);

  const currentPath = location.pathname.substring(1);
  const activeTab = validTabs.includes(currentPath) ? currentPath : 'command-center';

  useEffect(() => {
    if (currentPath !== '' && !validTabs.includes(currentPath)) {
      navigate('/command-center', { replace: true });
    } else if (currentPath === '') {
      navigate('/command-center', { replace: true });
    }
  }, [currentPath, navigate]);

  const setActiveTab = (tab: string) => {
    navigate(`/${tab}`);
  };
  const [calendarToLoad, setCalendarToLoad] = useState<SavedCalendar | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRenamingWorkItem, setIsRenamingWorkItem] = useState(false);
  const [workItemRenameInput, setWorkItemRenameInput] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('coh-theme') as 'light' | 'dark') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('coh-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const getPageTitle = () => {
    switch(activeTab) {
      case 'command-center': return 'Command Center';
      case 'reframing-studio': return 'Reframing Studio';
      case 'revision-studio': return 'Revision Studio';
      case 'ideation-workspace': return 'Ideation Workspace';
      case 'content-workspace': return 'Content Workspace';
      case 'editorial-calendar': return 'Editorial Calendar';
      case 'visual-studio': return 'Visual Studio';
      case 'calendar-library': return 'Calendar Library';
      case 'source-library': return 'Source Library';
      case 'idea-library': return 'Idea Library';
      case 'content-library': return 'Content Library';
      case 'create': return 'Create Content';
      case 'calendars': return 'Calendar Library';
      case 'library': return 'Content Library';
      case 'sources': return 'Source Material';
      case 'operating-core': return 'Operating Core';
      case 'settings': return 'Settings';
      default: return 'Content Studio';
    }
  };

  const [sourceLibraryFilter, setSourceLibraryFilter] = useState<string>("All");
  const [extractingInsightFor, setExtractingInsightFor] = useState<string | null>(null);
  const [operatingCoreDocs, setOperatingCoreDocs] = useState<CoreDocument[]>([]);
  
  useEffect(() => {
    const loadDocs = async () => {
      const docs = await getCoreDocuments();
      setOperatingCoreDocs(docs);
    };
    loadDocs();
  }, []);

  const [operatingCore, setOperatingCore] = useState<OperatingCore>(createDefaultOperatingCore());
  const [dbStatus, setDbStatus] = useState<'checking' | 'configured' | 'local_only'>('checking');

  useEffect(() => {
    const fetchCore = async () => {
      try {
        const res = await fetch('/api/operating-core');
        if (res.status === 503) {
          setDbStatus('local_only');
          // Fallback to localStorage
          const parsed = safeLocalStorageGet<any>('coh_operating_core_v1', null);
          if (parsed) {
            setOperatingCore(safeMergeOperatingCore(parsed));
          }
        } else if (res.ok) {
          const data = await res.json();
          setDbStatus('configured');
          if (Object.keys(data).length > 0) {
            setOperatingCore(prev => ({...prev, ...data}));
          } else {
            // New DB, save default
            await fetch('/api/operating-core', {
               method: 'PUT',
               headers: {'Content-Type': 'application/json'},
               body: JSON.stringify(createDefaultOperatingCore())
            });
          }
        } else {
           setDbStatus('local_only');
        }
      } catch (err) {
        console.error('API fetch error', err);
        setDbStatus('local_only');
        const parsed = safeLocalStorageGet<any>('coh_operating_core_v1', null);
          if (parsed) {
            setOperatingCore(safeMergeOperatingCore(parsed));
          }
      }
    };
    fetchCore();
  }, []);

  const [operatingCore_init_unused, setOperatingCore_init_unused] = useState<OperatingCore>(() => {
    const parsed = safeLocalStorageGet<any>('coh_operating_core_v1', null);
    if (parsed) {
      try {
        const normalizeDeep = (obj: any): any => {
          if (typeof obj === 'string') return normalizeText(obj);
          if (Array.isArray(obj)) return obj.map(normalizeDeep);
          if (obj !== null && typeof obj === 'object') {
            return Object.keys(obj).reduce((acc, key) => {
              acc[key] = normalizeDeep(obj[key]);
              return acc;
            }, {} as any);
          }
          return obj;
        };
        return normalizeDeep(parsed);
      } catch (e) {
        return createDefaultOperatingCore();
      }
    }
    return createDefaultOperatingCore();
  });

  useEffect(() => {
    if (dbStatus === 'local_only') {
      safeLocalStorageSet('coh_operating_core_v1', operatingCore);
    } else if (dbStatus === 'configured') {
      fetch('/api/operating-core', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operatingCore)
      }).catch(err => console.error('Failed to save to DB', err));
    }
  }, [operatingCore, dbStatus]);

  const [creationMode, setCreationMode] = useState<'simple' | 'quick' | 'advanced'>('simple');
  const [generationSpeedMode, setGenerationSpeedMode] = useState<GenerationSpeedMode>('explore');
  const [startedFromNote, setStartedFromNote] = useState<string>('');
  const [importedIdeationContext, setImportedIdeationContext] = useState<SavedIdea | null>(null);
  const [pendingIdeaToCopy, setPendingIdeaToCopy] = useState<SavedIdea | null>(null);

  // --- UI Toggles ---
  const [showContentStarters, setShowContentStarters] = useState<boolean>(false);

  // --- Sources State ---
  const [sources, setSources] = useState<SourceFile[]>(() => {
    const parsed = safeLocalStorageGet('coh_sources_v11', null);
    if (Array.isArray(parsed)) return parsed as SourceFile[];
    return DEFAULT_COH_SOURCES.map(s => ({
      ...s,
      type: s.title.includes('Facts') ? 'Approved Example' : 'Tone of Voice',
      status: 'Active' as const,
      selected: false
    })) as SourceFile[];
  });

  const isBrainFile = (id: string) => ['kb-facts', 'kb-context', 'kb-voice', 'kb-channels', 'kb-angles', 'kb-examples'].includes(id);
  const selectableSources = sources.filter(s => !isBrainFile(s.id));
  const brainSources = sources.filter(s => isBrainFile(s.id));

  // --- Source Intelligence & Task-Level Source Context State (COH-CS-03) ---
  const [sourceIntelligenceMap, setSourceIntelligenceMap] = useState<Record<string, SourceIntelligenceAnalysis>>(() =>
    loadSourceIntelligenceStore()
  );
  const [analyzingSourceIds, setAnalyzingSourceIds] = useState<Record<string, boolean>>({});
  const [sourceAnalysisErrors, setSourceAnalysisErrors] = useState<Record<string, string>>({});
  const [taskSourceRoleMap, setTaskSourceRoleMap] = useState<Record<string, { role: SourceTaskRole; selectedExcerpts: string[] }>>({});

  // --- Brief Forms States (CLEARED BY DEFAULT) ---
  const [simpleBrief, setSimpleBrief] = useState<SimpleBrief>({
    goal: '',
    channel: 'LinkedIn'
  });

  const [quickBrief, setQuickBrief] = useState<QuickBrief>({
    creationScope: 'Single Channel',
    targetChannels: ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
    goal: '',
    channel: 'LinkedIn',
    notes: '',
    mustInclude: '',
    mustAvoid: '',
    language: 'English',
    outputFormat: 'Post'
  });

  const [advancedBrief, setAdvancedBrief] = useState<ContentBrief>({
    creationScope: 'Single Channel',
    targetChannels: ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
    topic: '',
    channel: 'LinkedIn',
    pillar: 'General / Custom',
    audience: 'General Public',
    customAudience: '',
    purpose: 'General / Open',
    directionMode: 'none',
    angle: 'Create From Scratch / No Direction',
    customDirection: '',
    selectedSourceIds: [],
    mustInclude: '',
    mustAvoid: '',
    desiredLength: 'Medium: 120-180 words',
    customLengthCount: '',
    toneIntensity: 3,
    language: 'English',
    outputFormat: 'Post',
    creationIntent: 'Infer automatically'
  });

  const [writingCleanupOn, setWritingCleanupOn] = useState<boolean>(false);

  // --- AI Provider State ---
  type AIStatus = 'connected' | 'not_connected' | 'not_configured' | 'error' | 'testing' | 'needs_retest';
  type GenerationMode = 'ai' | 'prompt_builder' | 'prototype';

  const [aiStatus, setAiStatus] = useState<AIStatus>('not_configured');
  const [aiProvider, setAiProvider] = useState<string>('');
  const [aiTextModel, setAiTextModel] = useState<string>('');
  const [aiImageModel, setAiImageModel] = useState<string>('');
  const [aiLastTested, setAiLastTested] = useState<string>('');
  const [aiLastError, setAiLastError] = useState<string>('');
  const [aiLatency, setAiLatency] = useState<number>(0);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('prototype');
  const [aiIsGenerating, setAiIsGenerating] = useState<boolean>(false);
  const [aiGeneratedWith, setAiGeneratedWith] = useState<{provider: string; model: string} | null>(null);
  const [activeRevisionAction, setActiveRevisionAction] = useState<string | null>(null);
  const [activeRevisionError, setActiveRevisionError] = useState<string | null>(null);
  const [revisionSuccessAction, setRevisionSuccessAction] = useState<string | null>(null);
  const [isSavingToLibrary, setIsSavingToLibrary] = useState<boolean>(false);
  const [isSavingToIdeaLibrary, setIsSavingToIdeaLibrary] = useState<boolean>(false);

  // --- Visual Studio State ---
  const [vsSourceItem, setVsSourceItem] = useState<{ id: string; title: string; type: 'Idea' | 'Content' | 'Library' | 'Manual' } | null>(null);
  const [vsConcept, setVsConcept] = useState<string>('');
  const [vsFormat, setVsFormat] = useState<string>('');
  const [vsMood, setVsMood] = useState<string>('');
  const [vsComposition, setVsComposition] = useState<string>('');
  const [vsPalette, setVsPalette] = useState<string>('');
  const [vsTypography, setVsTypography] = useState<string>('');
  const [vsElements, setVsElements] = useState<string>('');
  const [vsAvoid, setVsAvoid] = useState<string>('');
  const [vsNegativePrompt, setVsNegativePrompt] = useState<string>('');
  const [vsAIPrompt, setVsAIPrompt] = useState<string>('');
  const [vsNotes, setVsNotes] = useState<string>('');
  const [vsTextContent, setVsTextContent] = useState<string>('');
  const [vsAttribution, setVsAttribution] = useState<string>('');
  const [vsRawImportedDirection, setVsRawImportedDirection] = useState<string>('');
  const [vsImportValidation, setVsImportValidation] = useState<{ total: number, recognized: number, missing: string[] } | null>(null);
  const [vsPromptMode, setVsPromptMode] = useState<'Full' | 'AI Only' | 'Full + AI' | 'Manual Only'>('Full + AI');
  const [vsInputMode, setVsInputMode] = useState<'Imported' | 'Manual'>('Manual');
  const [vsManualPrompt, setVsManualPrompt] = useState<string>('');
  const [showAdvancedBrief, setShowAdvancedBrief] = useState<boolean>(false);
  const [vsGeneratedImages, setVsGeneratedImages] = useState<any[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [vsAspectRatio, setVsAspectRatio] = useState<string>('core-sq-1');
  const [vsCustomWidth, setVsCustomWidth] = useState<number>(1024);
  const [vsCustomHeight, setVsCustomHeight] = useState<number>(1024);
  const [vsVisualStyle, setVsVisualStyle] = useState<string>('Editorial Photomontage');
  const [vsNumImages, setVsNumImages] = useState<number>(1);


  // Settings form fields (never persisted to localStorage, sent to backend only)
  const [settingsProvider, setSettingsProvider] = useState<string>('openai');
  const [settingsTextModel, setSettingsTextModel] = useState<string>(() => safeLocalStorageGet('coh_settings_text_model', 'gpt-6-luna'));
  const [settingsImageModel, setSettingsImageModel] = useState<string>(() => safeLocalStorageGet('coh_settings_image_model', 'gpt-image-2'));
  const [settingsApiKey, setSettingsApiKey] = useState<string>('');
  const [settingsBaseUrl, setSettingsBaseUrl] = useState<string>('');
  const [settingsTestResult, setSettingsTestResult] = useState<string>('');
  const [settingsTestPassed, setSettingsTestPassed] = useState<boolean | null>(null);
  const [settingsApplying, setSettingsApplying] = useState<boolean>(false);
  const [settingsTesting, setSettingsTesting] = useState<boolean>(false);
  const [settingsTestCooldown, setSettingsTestCooldown] = useState<number>(0);
  const [fallbackWarning, setFallbackWarning] = useState<string>('');

  useEffect(() => {
    let fallbackTriggered = false;
    
    if (
      settingsTextModel &&
      settingsTextModel !== aiTextModel &&
      !MODEL_REGISTRY.some(m => m.id === settingsTextModel && m.type === 'text')
    ) {
      setSettingsTextModel('gpt-6-luna');
      safeLocalStorageSet('coh_settings_text_model', 'gpt-6-luna');
      fallbackTriggered = true;
    }
    
    if (
      settingsImageModel &&
      settingsImageModel !== aiImageModel &&
      !MODEL_REGISTRY.some(m => m.id === settingsImageModel && m.type === 'image')
    ) {
      setSettingsImageModel('gpt-image-2');
      safeLocalStorageSet('coh_settings_image_model', 'gpt-image-2');
      fallbackTriggered = true;
    }

    if (fallbackTriggered) {
      setFallbackWarning('The previously selected model is unavailable. The recommended default has been selected.');
    }
  }, [settingsTextModel, settingsImageModel, aiTextModel, aiImageModel]);
  
  // Cooldown effect
  useEffect(() => {
    if (settingsTestCooldown > 0) {
      const timer = setTimeout(() => setSettingsTestCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [settingsTestCooldown]);
  const [settingsKeyDirty, setSettingsKeyDirty] = useState<boolean>(false);
  const [settingsSection, setSettingsSection] = useState<'ai'>('ai');

  // --- Authentication States & Handlers ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(true);
  const [authBypass, setAuthBypass] = useState<boolean>(false);
  const [authUsernameInput, setAuthUsernameInput] = useState<string>('');
  const [authPasswordInput, setAuthPasswordInput] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          setAuthBypass(!!data.bypass);
          aiService.getStatus();
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUsernameInput.trim() || !authPasswordInput.trim()) {
      setAuthError('Username and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUsernameInput, password: authPasswordInput }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        setAuthError('');
        aiService.getStatus();
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Invalid credentials.');
      }
    } catch {
      setAuthError('Connection error during login. Is the backend active?');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      setAuthUsernameInput('');
      setAuthPasswordInput('');
    } catch {
      console.error('Could not log out. Please refresh.');
    }
  };


  // AI service - calls backend, never exposes keys
  const buildRuntimeAiConfig = () => {
    const cleanKey = settingsApiKey && settingsApiKey !== '••••••••' ? settingsApiKey.trim() : '';
    const activeProvider = aiProvider || settingsProvider;
    const activeTextModel = aiTextModel || settingsTextModel;
    const activeImageModel = aiImageModel || settingsImageModel;
    if (!activeProvider) return undefined;
    return {
      provider: activeProvider,
      textModel: activeTextModel,
      imageModel: activeImageModel,
      ...(cleanKey ? { apiKey: cleanKey } : {}),
      ...(settingsBaseUrl ? { baseUrl: settingsBaseUrl } : {})
    };
  };

  const aiService = {
    async getStatus() {
      try {
        const res = await fetch('/api/ai/status', { credentials: 'same-origin' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.activeConfig) {
          setAiProvider(data.activeConfig.provider);
          setAiTextModel(data.activeConfig.textModel || '');
          setAiImageModel(data.activeConfig.imageModel || '');
          setSettingsProvider(data.activeConfig.provider);
          setSettingsTextModel(data.activeConfig.textModel || '');
          setSettingsImageModel(data.activeConfig.imageModel || '');
          setAiStatus(data.connected ? 'connected' : (data.activeConfig.apiKeySource === 'not_configured' ? 'not_configured' : 'not_connected'));
          
          if (!settingsKeyDirty) {
            setSettingsProvider(data.activeConfig.provider || 'openai');
            setSettingsBaseUrl(data.activeConfig.baseUrl || '');
            if (data.activeConfig.apiKeySource === 'env' || data.activeConfig.apiKeySource === 'session') {
              setSettingsApiKey('••••••••');
            }
          }
        }
        if (data.connected) {
          setGenerationMode('ai');
        }
      } catch {
        // backend not running — stay in prototype mode
      }
    },

    async testConnection(provider: string, textModel: string, imageModel: string, apiKey: string, baseUrl?: string) {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, textModel, imageModel, apiKey, baseUrl })
      });
      return res.json();
    },

    async applyProvider(provider: string, textModel: string, imageModel: string, apiKey: string, baseUrl?: string, lastTestedAt?: string) {
      const res = await fetch('/api/ai/configure', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, textModel, imageModel, apiKey, baseUrl, lastTestedAt })
      });
      if (!res.ok) throw new Error('Failed to apply configuration');
      return res.json();
    },

    async generate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, _aiConfig: buildRuntimeAiConfig() }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
          throw new Error(data.error || data.userMessage || 'AI generation failed.');
      }
      return data.data || data; 
    },

    async ideate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/ideate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, _aiConfig: buildRuntimeAiConfig() }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
          throw new Error(data.error || data.userMessage || 'AI ideation failed.');
      }
      return data.data || data;
    },

    async revise(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, _aiConfig: buildRuntimeAiConfig() }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
          throw new Error(data.error || data.userMessage || 'AI revision failed.');
      }
      return data.data || data;
    },

    async getPrompt(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/prompt', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, _aiConfig: buildRuntimeAiConfig() }),
      });
      return res.json();
    },

    async analyzeSource(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/analyze-source', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...input, _aiConfig: buildRuntimeAiConfig() }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || data.userMessage || 'Source analysis failed.');
      }
      return data.data || data;
    },
  };


  // --- Visual Studio Logic ---
  const handleSendToVisualStudio = (item: any, rawDirection: any, type: 'Idea' | 'Content' | 'Library') => {
    setVsSourceItem({ id: item.id, title: item.title || item.originalInput || 'Untitled', type });
    setVsRawImportedDirection(typeof rawDirection === 'string' ? rawDirection : JSON.stringify(rawDirection));

    const parsedFields = parseVisualDirectionInput(rawDirection);

    // Determine Validation State across the 11 canonical fields
    const requiredFields = ['visualConcept', 'moodAtmosphere', 'composition', 'colorMaterialDirection', 'keyVisualElements'];
    const optionalFields = ['formatRecommendation', 'typographyLayout', 'whatToAvoid', 'aiImagePrompt', 'negativePrompt', 'designerNotes'];

    const allExpected = [...requiredFields, ...optionalFields];
    let recognized = 0;
    const missing: string[] = [];

    for (const f of allExpected) {
      if ((parsedFields as Record<string, string>)[f] && (parsedFields as Record<string, string>)[f].trim().length > 0) {
        recognized++;
      } else {
        missing.push(f);
      }
    }

    // Map parsed structured fields safely to React State
    setVsConcept(parsedFields.visualConcept || '');
    setVsFormat(parsedFields.formatRecommendation || '');
    setVsMood(parsedFields.moodAtmosphere || '');
    setVsComposition(parsedFields.composition || '');
    setVsPalette(parsedFields.colorMaterialDirection || '');
    setVsTypography(parsedFields.typographyLayout || '');
    setVsElements(parsedFields.keyVisualElements || '');
    setVsAvoid(parsedFields.whatToAvoid || '');
    setVsAIPrompt(parsedFields.aiImagePrompt || '');
    setVsNegativePrompt(parsedFields.negativePrompt || '');
    setVsNotes(parsedFields.designerNotes || '');

    setVsTextContent(parsedFields.textContent || '');
    setVsAttribution(parsedFields.attribution || '');

    setVsImportValidation({ total: allExpected.length, recognized, missing });

    setVsInputMode('Imported');
    setVsPromptMode('Full + AI');
    setActiveTab('visual-studio');
  };

  const handleGenerateImage = async () => {
    if (!aiProvider) {
      setAiLastError('Please configure an AI provider first.');
      return;
    }
    
    const selectedPreset = getPresetById(vsAspectRatio);
    const actualWidth = vsAspectRatio === 'custom' ? vsCustomWidth : (selectedPreset?.width || 1024);
    const actualHeight = vsAspectRatio === 'custom' ? vsCustomHeight : (selectedPreset?.height || 1024);

    const payload = {
      prompt: vsManualPrompt,
      promptBuildMode: vsPromptMode,
      presetId: vsAspectRatio,
      width: actualWidth,
      height: actualHeight,
      visualStyle: vsVisualStyle,
      visualBrief: {
        concept: vsConcept,
        format: vsFormat,
        mood: vsMood,
        composition: vsComposition,
        palette: vsPalette,
        typography: vsTypography,
        elements: vsElements,
        avoid: vsAvoid,
        aiPrompt: vsAIPrompt,
        negativePrompt: vsNegativePrompt,
        notes: vsNotes,
        textContent: vsTextContent,
        attribution: vsAttribution
      },
      inputMode: vsInputMode,
      provider: aiProvider,
      model: aiImageModel,
      operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Visual Studio' })
    };

    setIsGeneratingImage(true);
    setAiLastError('');
    try {
      const res = await fetch('/api/ai/generate-image', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, _aiConfig: buildRuntimeAiConfig() })
      });

      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Image generation route returned a non-JSON response. Check local API route configuration.");
      }
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }
      
      if (data.images && data.images.length > 0) {
        const processedImages = await Promise.all(data.images.map(async (img: any) => {
          const isPortrait = vsAspectRatio.includes('Portrait') || vsAspectRatio === '4:5' || vsAspectRatio === '9:16' || vsAspectRatio.includes('Instagram Story') || vsAspectRatio.includes('1024x1792') || vsAspectRatio.includes('1024x1536');
          const isLandscape = vsAspectRatio.includes('Landscape') || vsAspectRatio === '16:9' || vsAspectRatio === '21:9' || vsAspectRatio.includes('Website Hero') || vsAspectRatio.includes('Newsletter Header') || vsAspectRatio.includes('Wide Banner') || vsAspectRatio.includes('1792x1024') || vsAspectRatio.includes('1536x1024');
          
          return {
            id: img.id || `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: img.url,
            prompt: img.promptUsed || payload.prompt,
            promptUsed: img.promptUsed || payload.prompt,
            createdAt: new Date().toISOString().split('T')[0],
            provider: img.provider || aiProvider,
            model: img.model || aiImageModel,
            seed: img.seed || '',
            aspectRatio: vsAspectRatio,
            sourceDirection: vsConcept,
            quality: 'high',
            generationSize: isPortrait ? '1024x1792' : (isLandscape ? '1792x1024' : '1024x1024'),
            deliverySize: isPortrait ? '1024x1792' : (isLandscape ? '1792x1024' : '1024x1024')
          };
        }));
        
        setVsGeneratedImages(prev => [...processedImages, ...prev]);
        
        // Attach to Active Work Item
        setActiveWorkItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'Image Generated',
            imageResults: [...processedImages.map(img => ({
              id: img.id,
              url: img.url,
              prompt: img.prompt,
              createdAt: img.createdAt
            })), ...prev.imageResults],
            updatedAt: new Date().toISOString()
          };
        });
      }
    } catch (err: any) {
      setAiLastError(err.message || 'Error generating image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Poll status on mount
  useEffect(() => {
    aiService.getStatus();
  }, []);


  // --- Workspace Local Dynamic Sources ---
  const [workspaceLocalSources, setWorkspaceLocalSources] = useState<SourceFile[]>([]);
  const [inlineSourceType, setInlineSourceType] = useState<'library' | 'paste' | 'upload' | 'link'>('library');
  const [inlinePasteData, setInlinePasteData] = useState({ title: '', content: '', saveToLibrary: false });
  
  // URL form fields
  const [inlineLinkData, setInlineLinkData] = useState({ title: '', url: '', summary: '', saveToLibrary: false });
  const [linkWarning, setLinkWarning] = useState<string>('');

  const [inlineUploadData, setInlineUploadData] = useState({ title: '', content: '', saveToLibrary: false });

  // --- Validation Warning State ---
  const [validationWarning, setValidationWarning] = useState<string>('');

  // --- Content Library State ---
  const [savedContent, setSavedContent] = useState<SavedContent[]>(() => {
    const parsed = safeLocalStorageGet('coh_saved_content_v11', null);
    if (Array.isArray(parsed)) {
      return (parsed as SavedContent[]).map(item => {
        let aud = item.audience;
        if (aud === 'Arts Patrons') aud = 'Sponsors & Patrons';
        else if (aud === 'Climate Activists') aud = 'Climate, Policy & Philanthropy Leaders';
        else if (aud === 'Skeptics / Public') aud = 'General Public';
        return { ...item, audience: aud };
      });
    }
    return [
      {
        id: 'content-1',
        title: 'The Climate Tetralogy: Canon & Repertoire',
        channel: 'LinkedIn',
        pillar: 'Climate Tetralogy & Canon',
        angle: 'Climate Tetralogy & Long-Term Canon Focus',
        audience: 'Sponsors & Patrons',
        purpose: 'Thought Leadership',
        status: 'Approved',
        sourcesUsed: ['COH Approved Facts', 'COH Context'],
        createdAt: '2026-06-28',
        lastEdited: '2026-06-28',
        text: 'Climate Opera Haus constructs a repertoire-based climate canon. Through Soria Moria, The Golden Fountain, The Water Dragon, and Roar to the Wind, we treat climate as a lived condition, not a campaign theme. Live opera serves as our origin asset, scaling into filmed content, documentaries, and robust licensing opportunities.',
        notes: 'Grounded and approved facts only.',
        version: 1
      }
    ];
  });

  // --- Ideation Workspace States ---

  const [activeWorkItem, setActiveWorkItem] = useState<WorkItem | null>(() => {
    let saved = safeLocalStorageGet('coh_active_work_item_v1', null) as any;
    if (typeof saved === 'string') {
      try { saved = JSON.parse(saved); } catch (e) { saved = null; }
    }
    if (saved && typeof saved === 'object') {
      if (!saved.draftVersions) saved.draftVersions = [];
      if (!saved.imageResults) saved.imageResults = [];
      if (!saved.revisionHistory) saved.revisionHistory = [];
      return saved as WorkItem;
    }
    return null;
  });

  useEffect(() => {
    if (activeWorkItem) {
      safeLocalStorageSet('coh_active_work_item_v1', activeWorkItem);
    } else {
      safeLocalStorageRemove('coh_active_work_item_v1');
    }
  }, [activeWorkItem]);

  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    const parsed = safeLocalStorageGet('coh_saved_ideas_v1', null);
    if (Array.isArray(parsed)) return parsed as SavedIdea[];
    return [
      {
        id: 'idea-1',
        title: 'Bypassing climate fatigue through somatic storytelling',
        originalInput: 'Why is climate opera superior to other forms of climate art?',
        category: 'Thought-leadership ideas',
        explanation: 'Focus on how the combination of vocal frequencies, physical presence, and live instruments triggers emotional investment far faster than data tables.',
        whyItWorks: 'Addresses target sponsor/patron desire for high-prestige, positive impact communication.',
        suggestedChannel: 'LinkedIn',
        suggestedFormat: 'Thought Piece',
        suggestedTone: 'Serious / Authoritative',
        possibleHook: 'If policy papers were enough, the climate crisis would already be solved.',
        possibleNextStep: 'Draft post targeting cultural foundation directors.',
        language: 'English',
        dateCreated: '2026-06-29',
        status: 'Promising'
      }
    ];
  });

  const [ideationInput, setIdeationInput] = useState<string>('');
  const [ideationFilterGoal, setIdeationFilterGoal] = useState<string>('All');
  const [ideationFilterAudience, setIdeationFilterAudience] = useState<string>('General Public');
  const [ideationFilterChannel, setIdeationFilterChannel] = useState<string>('LinkedIn');
  const [ideationFilterTone, setIdeationFilterTone] = useState<string>('Measured / Credible');
  const [ideationFilterLanguage, setIdeationFilterLanguage] = useState<string>('English');
  const [ideationFilterCount, setIdeationFilterCount] = useState<number>(4);
  const [ideationFilterType, setIdeationFilterType] = useState<string>('All');
  const [ideationFilterDepth, setIdeationFilterDepth] = useState<string>('Standard');
  const [ideationFilterQuality, setIdeationFilterQuality] = useState<string>('Practical');

  const [generatedIdeas, setGeneratedIdeas] = useState<SavedIdea[]>([]);
  const [isIdeating, setIsIdeating] = useState<boolean>(false);

  useEffect(() => {
    safeLocalStorageSet('coh_saved_ideas_v1', savedIdeas);
  }, [savedIdeas]);

  // --- Ideation Actions and Helper Functions ---
  const handleGenerateIdeas = async () => {
    const inputVal = ideationInput.trim();
    if (!inputVal) return;
    setIsIdeating(true);

    const ideationSourceBindings: TaskSourceBinding[] = advancedBrief.selectedSourceIds
      .map(id => {
        const s = [...sources, ...workspaceLocalSources].find((x: any) => x.id === id);
        if (!s) return null;
        return {
          sourceId: s.id,
          title: s.title || 'Untitled Source',
          type: s.type || 'Other',
          role: taskSourceRoleMap[s.id]?.role || inferDefaultSourceRole(s.type),
          selectedExcerpts: taskSourceRoleMap[s.id]?.selectedExcerpts || [],
          content: s.content || s.notes || s.url || '',
          summary: s.notes || undefined
        } as TaskSourceBinding;
      })
      .filter((b): b is TaskSourceBinding => Boolean(b));

    const dateStr = new Date().toISOString().split('T')[0];

    if (generationMode === 'ai' && aiStatus === 'connected') {
      try {
        const ideationContextPkg = compileGovernedContext({
          workflow: 'Ideation Workspace',
          operatingCore,
          coreDocuments: operatingCoreDocs,
          audience: ideationFilterAudience,
          channel: ideationFilterChannel,
          language: ideationFilterLanguage,
          sourceBindings: ideationSourceBindings,
          derivedSourceAnalyses: sourceIntelligenceMap,
          userInstruction: inputVal
        });

        const result = await aiService.ideate({
          rawInput: inputVal,
          language: ideationFilterLanguage,
          audience: ideationFilterAudience,
          depth: ideationFilterDepth,
          quality: ideationFilterQuality,
          operatingCoreInstructions: ideationContextPkg.compiledInstructions
        });

        const rawList: Partial<IdeationOpportunityProposal>[] = [];
        result.ideaGroups?.forEach((group: any) => {
          group.ideas?.forEach((idea: any, idx: number) => {
            rawList.push({
              id: `idea-ai-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              title: idea.title || 'Untitled',
              originalInput: inputVal,
              category: idea.category || group.groupTitle || 'General',
              explanation: idea.shortExplanation || idea.explanation || '',
              communicationJob: idea.communicationJob || undefined,
              whyItWorks: idea.whyItWorks || '',
              coreTension: idea.coreTension || undefined,
              desiredAudienceResponse: idea.desiredAudienceResponse || undefined,
              availableEvidence: Array.isArray(idea.availableEvidence) ? idea.availableEvidence : undefined,
              evidenceStillRequired: Array.isArray(idea.evidenceStillRequired) ? idea.evidenceStillRequired : undefined,
              unresolvedAssumptions: Array.isArray(idea.unresolvedAssumptions) ? idea.unresolvedAssumptions : undefined,
              suggestedChannel: idea.bestChannelFit || ideationFilterChannel || 'LinkedIn',
              suggestedFormat: idea.suggestedOutputFormat || 'Post',
              suggestedAudience: idea.suggestedAudience || ideationFilterAudience,
              suggestedPillar: idea.suggestedPillar || undefined,
              strategicAngle: idea.strategicAngle || group.groupTitle || undefined,
              suggestedTone: idea.suggestedTone || 'Measured / Credible',
              possibleHook: idea.possibleHook || '',
              possibleFirstPost: idea.possibleFirstPost || '',
              riskToAvoid: idea.riskToAvoid || '',
              possibleNextStep: idea.nextStep || idea.possibleNextStep || '',
              language: ideationFilterLanguage,
              dateCreated: dateStr,
              status: 'New'
            });
          });
        });

        if (rawList.length > 0) {
          const enrichedList = enrichAndDiversifyOpportunities({
            rawProposals: rawList,
            rawInput: inputVal,
            defaultAudience: ideationFilterAudience,
            defaultChannel: ideationFilterChannel,
            defaultLanguage: ideationFilterLanguage,
            sourceBindings: ideationSourceBindings,
            derivedSourceAnalyses: sourceIntelligenceMap,
            savedIdeas,
            savedContents: savedContent,
            operatingCore
          });
          setGeneratedIdeas(enrichedList);
          setIsIdeating(false);
          return;
        }
      } catch (err: any) {
        setAiLastError(err.message || 'AI Ideation unavailable; using deterministic COH opportunity engine.');
      }
    }

    // Deterministic COH Opportunity Engine fallback (works both offline and when AI returns 503)
    setTimeout(() => {
      const getTone = (depth: string, q: string) => {
        if (depth === 'Experimental') return 'Bold / Punchy';
        if (q === 'Sponsor-facing') return 'Calm / Institutional';
        if (q === 'Emotional') return 'Human / Narrative';
        return 'Measured / Credible';
      };

      const cleanInput = inputVal.replace(/\?$/, '');
      const isDeep = ideationFilterDepth === 'Deep';
      const qualityStr = ideationFilterQuality !== 'Practical' ? `Applying a focused ${ideationFilterQuality.toLowerCase()} filter, ` : '';
      const depthStr = isDeep ? 'Detail a strategic, high-nuance concept arguing that' : 'Outline a clean direction stating that';

      const opportunityTemplates = [
        {
          category: 'Strongest Directions',
          communicationJob: 'Establish institutional credibility',
          strategicAngle: 'Origin Asset & Worldbuilding Multiplier',
          suggestedPillar: 'Climate Tetralogy & Canon',
          title: `Visceral bypass vs intellectual distance for: ${cleanInput}`,
          explanation: `${qualityStr}${depthStr} live somatic experiences of "${inputVal}" create a lasting cultural anchor that abstract policy briefs fail to establish.`,
          coreTension: 'Decision-makers and audiences are saturated with abstract climate statistics that rarely translate into lasting cultural commitment.',
          desiredAudienceResponse: 'Recognize Climate Opera Haus as an enduring cultural IP venture built around live operatic worldbuilding.',
          channel: ideationFilterChannel || 'LinkedIn',
          format: 'Post'
        },
        {
          category: 'Thought Leadership Angles',
          communicationJob: 'Create sponsor relevance',
          strategicAngle: 'Long-Horizon Cultural Infrastructure & Prestige',
          suggestedPillar: 'Partnerships, Sponsorship & Institutional Value',
          title: `Strategic thesis on: ${cleanInput}`,
          explanation: `${qualityStr}${depthStr} "${inputVal}" requires permanent, reusable cultural infrastructure rather than temporary public awareness campaigns.`,
          coreTension: 'Sponsors and strategic partners need clear institutional prestige and multi-horizon relevance rather than short-lived event visibility.',
          desiredAudienceResponse: 'See a clear pathway for institutional alignment and long-horizon partnership with COH.',
          channel: 'LinkedIn',
          format: 'Thought Piece'
        },
        {
          category: 'Educational Angles',
          communicationJob: 'Build climate literacy',
          strategicAngle: 'Scientific Grounding & Planetary Thresholds',
          suggestedPillar: 'Education, Community & Climate Literacy',
          title: `Demystifying the mechanics behind: ${cleanInput}`,
          explanation: `${qualityStr}${depthStr} we can translate the physical and ecological reality behind "${inputVal}" into clear, jargon-free human terms.`,
          coreTension: 'Technical climate discourse often alienates general audiences with jargon while neglecting emotional comprehension.',
          desiredAudienceResponse: 'Grasp the core planetary insight clearly and connect it to lived human experience.',
          channel: 'Instagram',
          format: 'Carousel'
        },
        {
          category: 'Storytelling Angles',
          communicationJob: 'Explain artistic logic',
          strategicAngle: 'Behind-the-Scenes Artistic Rigor & Craft',
          suggestedPillar: 'Production & Behind the Work',
          title: `Staging the transformation of: ${cleanInput}`,
          explanation: `${qualityStr}${depthStr} we can follow a specific musical, dramaturgical, or staging threshold that makes "${inputVal}" visible on stage.`,
          coreTension: 'Audiences unfamiliar with contemporary opera wonder how planetary themes become compelling dramatic art without becoming didactic.',
          desiredAudienceResponse: 'Appreciate the artistic discipline, musical craft, and dramatic tension driving the production.',
          channel: 'Newsletter',
          format: 'Post'
        },
        {
          category: 'Emotional or Reflective Angles',
          communicationJob: 'Deepen cultural meaning',
          strategicAngle: 'Collective Cultural Ritual & Public Meaning',
          suggestedPillar: 'Events, Convenings & Public Moments',
          title: `Somatic memory and resonance of: ${cleanInput}`,
          explanation: `${qualityStr}${depthStr} operatic performance provides a shared civic space to process the emotional weight and collective stake of "${inputVal}".`,
          coreTension: 'Public audiences carry unspoken ecological fatigue and lack shared cultural spaces that honor both truth and human resilience.',
          desiredAudienceResponse: 'Feel invited into an accessible, deeply resonant cultural gathering rather than a lecture.',
          channel: 'Instagram',
          format: 'Caption'
        },
        {
          category: 'Promotional Angles',
          communicationJob: 'Invite public participation',
          strategicAngle: 'Milestone Clarity & Institutional Momentum',
          suggestedPillar: 'Documentary, Media & Cultural IP',
          title: `Action pathway: Engaging supporters for: ${cleanInput}`,
          explanation: `${qualityStr}${depthStr} we can invite institutions, patrons, and cultural allies to participate in the next development phase of "${inputVal}".`,
          coreTension: 'Interested supporters often admire the artistic vision but need a concrete, credible entry point to engage.',
          desiredAudienceResponse: 'Take a clear, low-friction step toward conversation, partnership inquiry, or attendance.',
          channel: 'Email / Direct Outreach',
          format: 'Sponsor Pitch Paragraph'
        }
      ];

      const rawProposals: Partial<IdeationOpportunityProposal>[] = opportunityTemplates.map((tpl, idx) => ({
        id: `idea-gen-${idx}-${Date.now()}`,
        title: translateText(tpl.title, ideationFilterLanguage),
        originalInput: inputVal,
        category: translateText(tpl.category, ideationFilterLanguage),
        explanation: translateText(tpl.explanation, ideationFilterLanguage),
        communicationJob: tpl.communicationJob,
        whyItWorks: translateText(
          ideationFilterQuality === 'Sponsor-facing'
            ? 'Directly aligns with long-term institutional backing and cultural prestige.'
            : ideationFilterQuality === 'Emotional'
            ? 'Triggers a genuine human connection and bypasses academic jargon.'
            : 'Bridges the gap between planetary reality and somatic artistic experience.',
          ideationFilterLanguage
        ),
        coreTension: tpl.coreTension,
        desiredAudienceResponse: tpl.desiredAudienceResponse,
        suggestedChannel: tpl.channel,
        suggestedFormat: tpl.format,
        suggestedAudience: translateText(ideationFilterAudience, ideationFilterLanguage),
        suggestedPillar: tpl.suggestedPillar,
        strategicAngle: tpl.strategicAngle,
        suggestedTone: translateText(getTone(ideationFilterDepth, ideationFilterQuality), ideationFilterLanguage),
        possibleHook: translateText(
          `Why do we keep writing reports about ${cleanInput.toLowerCase()} when live performance can change how a room breathes together?`,
          ideationFilterLanguage
        ),
        possibleFirstPost: translateText(
          `Staging a response to ${cleanInput.toLowerCase()} is not about temporary awareness. It is about building an enduring cultural work that makes planetary reality felt.`,
          ideationFilterLanguage
        ),
        riskToAvoid: translateText(
          'Avoid generic activist slogans, preachy language, or unverified milestone claims.',
          ideationFilterLanguage
        ),
        possibleNextStep: translateText(
          'Promote this opportunity to Content Workspace with its communication job and evidence profile attached.',
          ideationFilterLanguage
        ),
        language: ideationFilterLanguage,
        dateCreated: dateStr,
        status: 'New'
      }));

      const enrichedList = enrichAndDiversifyOpportunities({
        rawProposals,
        rawInput: inputVal,
        defaultAudience: ideationFilterAudience,
        defaultChannel: ideationFilterChannel,
        defaultLanguage: ideationFilterLanguage,
        sourceBindings: ideationSourceBindings,
        derivedSourceAnalyses: sourceIntelligenceMap,
        savedIdeas,
        savedContents: savedContent,
        operatingCore
      });

      setGeneratedIdeas(enrichedList);
      setIsIdeating(false);
    }, 350);
  };

  const [savingIdeaId, setSavingIdeaId] = useState<string | null>(null);

  const handleSaveIdeaToLibrary = async (idea: SavedIdea) => {
    if (savedIdeas.some(i => i.title === idea.title)) {
      console.warn('This idea is already saved in your library.');
      return;
    }
    setSavingIdeaId(idea.id);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const toSave: SavedIdea = {
      ...idea,
      id: `idea-saved-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'New'
    };
    setSavedIdeas(prev => [toSave, ...prev]);
    setSavingIdeaId(null);
  };

  const handleUpdateIdeaStatus = (id: string, newStatus: SavedIdea['status']) => {
    setSavedIdeas(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
    setGeneratedIdeas(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  };

  const executeCopyIdeaToWorkspace = (idea: SavedIdea) => {
    // Preset to 'advanced' mode when pushing from Ideation to Content Workspace
    setCreationMode('advanced');

    const handoff = buildIdeationToContentHandoff({
      idea: idea as IdeationOpportunityProposal,
      currentSelectedSourceIds: advancedBrief.selectedSourceIds,
      currentTaskSourceRoleMap: taskSourceRoleMap
    });

    setTaskSourceRoleMap(handoff.restoredRoleMap);

    setSimpleBrief({
      goal: idea.title,
      channel: handoff.advancedBriefPatch.channel
    });

    setQuickBrief({
      creationScope: 'Single Channel',
      targetChannels: ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
      goal: idea.title,
      notes: handoff.advancedBriefPatch.customDirection,
      channel: handoff.advancedBriefPatch.channel,
      mustInclude: handoff.advancedBriefPatch.mustInclude,
      mustAvoid: handoff.advancedBriefPatch.mustAvoid,
      language: handoff.advancedBriefPatch.language,
      outputFormat: handoff.advancedBriefPatch.outputFormat
    });

    setAdvancedBrief(prev => ({
      ...prev,
      topic: handoff.advancedBriefPatch.topic,
      directionMode: 'custom',
      customDirection: handoff.advancedBriefPatch.customDirection,
      channel: handoff.advancedBriefPatch.channel || prev.channel,
      audience: handoff.advancedBriefPatch.audience || prev.audience,
      pillar: handoff.advancedBriefPatch.pillar || prev.pillar,
      purpose: handoff.advancedBriefPatch.purpose || prev.purpose,
      language: handoff.advancedBriefPatch.language || prev.language,
      outputFormat: handoff.advancedBriefPatch.outputFormat || prev.outputFormat,
      mustInclude: handoff.advancedBriefPatch.mustInclude || prev.mustInclude,
      mustAvoid: handoff.advancedBriefPatch.mustAvoid || prev.mustAvoid,
      selectedSourceIds: handoff.advancedBriefPatch.selectedSourceIds
    }));

    setActiveWorkItem(prev => ({
      ...(prev || {
        id: `work-${Date.now()}`,
        draftVersions: [],
        imageResults: [],
        revisionHistory: [],
        approved: false,
        saved: false,
        createdAt: new Date().toISOString()
      }),
      title: idea.title,
      type: 'Content',
      status: 'Brief',
      ideaId: idea.id,
      channel: handoff.advancedBriefPatch.channel,
      outputFormat: handoff.advancedBriefPatch.outputFormat,
      audience: handoff.advancedBriefPatch.audience,
      purpose: handoff.advancedBriefPatch.purpose,
      language: handoff.advancedBriefPatch.language,
      sourceIds: handoff.advancedBriefPatch.selectedSourceIds,
      origin: 'Ideation Workspace',
      workContext: handoff.workContext,
      updatedAt: new Date().toISOString()
    }));

    setImportedIdeationContext(idea);
    setActiveTab('content-workspace');
    setPendingIdeaToCopy(null);
  };

  const handleCopyIdeaToWorkspace = (idea: SavedIdea) => {
    // Check if there is existing unsaved work
    const hasUnsavedSimple = !!simpleBrief.goal.trim();
    const hasUnsavedQuick = !!quickBrief.goal.trim();
    const hasUnsavedAdvanced = !!advancedBrief.topic.trim();
    
    if (hasUnsavedSimple || hasUnsavedQuick || hasUnsavedAdvanced) {
      setPendingIdeaToCopy(idea);
    } else {
      executeCopyIdeaToWorkspace(idea);
    }
  };



  // --- Generation Pipeline States ---
  const [generationInputsSnapshot, setGenerationInputsSnapshot] = useState<string>('');
  const [generationNumber, setGenerationNumber] = useState<number>(0);
  const [anotherVersionStyle, setAnotherVersionStyle] = useState<string>('default');
  const [isGeneratingDrafts, setIsGeneratingDrafts] = useState<boolean>(false);
  
  const [draftOptions, setDraftOptions] = useState<{
    optionA: string;
    optionB: string;
    optionC: string;
    visualIdeation: string;
    editorialWarning: string;
    labelA?: string;
    labelB?: string;
    contextWarning?: string;
    languageNotice?: string;
  } | null>(null);

  // --- Active Revision Workspace ---
  const [activeDraftText, setActiveDraftText] = useState<string>('');
  const [activeDraftSource, setActiveDraftSource] = useState<'Content Workspace' | 'Content Library' | 'External Content'>('Content Workspace');
  const [customRevisionInstruction, setCustomRevisionInstruction] = useState<string>('');
  const [activeDraftTitle, setActiveDraftTitle] = useState<string>('');
  const [activeDraftVersion, setActiveDraftVersion] = useState<number>(1);
  const [activeDraftHistory, setActiveDraftHistory] = useState<VersionHistory[]>([]);
  const [compareVersionIndex, setCompareVersionIndex] = useState<number>(-1);
  const [copySuccessMap, setCopySuccessMap] = useState<{ [key: string]: boolean }>({});
  
  // --- External Content Mode Inputs ---
  const [externalContentText, setExternalContentText] = useState<string>('');
  const [revisionSettings, setRevisionSettings] = useState({
    channel: 'General / Custom',
    format: 'General / Custom',
    targetLanguage: 'English',
    tone: 'Balanced / COH Default',
    optionalContext: '',
    revisionMode: 'Standard'
  });
  const [settingsChangedSinceRevision, setSettingsChangedSinceRevision] = useState<boolean>(false);

  // --- Source Library Forms ---
  const [newSource, setNewSource] = useState<{
    title: string;
    type: SourceFile['type'];
    status: SourceFile['status'];
    notes: string;
    content: string;
    url?: string;
    selectable?: boolean;
  }>({
    title: '',
    type: 'Other' as SourceFile['type'],
    status: 'Active' as SourceFile['status'],
    
    
    
    notes: '',
    content: '',
    url: '',
    selectable: true
  });
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const inlineFileInputRef = useRef<HTMLInputElement>(null);

  // --- Filters ---
  const [filterChannel, setFilterChannel] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPillar, setFilterPillar] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- LocalStorage Sync ---
  useEffect(() => {
    safeLocalStorageSet('coh_sources_v11', sources);
  }, [sources]);

  useEffect(() => {
    safeLocalStorageSet('coh_saved_content_v11', savedContent);
  }, [savedContent]);

  // --- Brain Status Calculations ---
  const approvedFactsLoaded = sources.some(s => s.id === 'kb-facts');
  const voiceRulesLoaded = sources.some(s => s.id === 'kb-voice');
  const channelsLoaded = sources.some(s => s.id === 'kb-channels');

  // --- Clipboard Copy ---
  const handleCopyClipboard = (text: string, key: string) => {
    let textToCopy = text;
    if (key !== 'prompt') {
      textToCopy = cleanWritingArtifacts(text);
    }
    navigator.clipboard.writeText(textToCopy);
    setCopySuccessMap(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopySuccessMap(prev => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleStartExternalRevision = () => {
    if (!externalContentText.trim()) return;
    setActiveDraftText(externalContentText);
    setActiveDraftTitle('External Content Revision');
    setActiveDraftVersion(1);
    setActiveDraftHistory([{ version: 1, text: externalContentText, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Imported external content' }]);
    setActiveDraftSource('External Content');
  };

  // --- Source and List Action Helpers ---
  const getEffectiveSourceRole = (src: { id: string; type: string }): SourceTaskRole => {
    const fromTaskMap = taskSourceRoleMap[src.id]?.role;
    if (fromTaskMap) return fromTaskMap;
    const fromWorkItem = activeWorkItem?.workContext?.sourceBindings?.find(b => b.sourceId === src.id)?.role;
    if (fromWorkItem) return fromWorkItem;
    return inferDefaultSourceRole(src.type);
  };

  const getEffectiveSourceExcerpts = (sourceId: string): string[] => {
    const fromTaskMap = taskSourceRoleMap[sourceId]?.selectedExcerpts;
    if (Array.isArray(fromTaskMap)) return fromTaskMap;
    const fromWorkItem = activeWorkItem?.workContext?.sourceBindings?.find(b => b.sourceId === sourceId)?.selectedExcerpts;
    return Array.isArray(fromWorkItem) ? fromWorkItem : [];
  };

  const handleChangeSourceTaskRole = (sourceId: string, role: SourceTaskRole) => {
    const src = [...sources, ...workspaceLocalSources].find(s => s.id === sourceId);
    const currentExcerpts = getEffectiveSourceExcerpts(sourceId);
    setTaskSourceRoleMap(prev => ({
      ...prev,
      [sourceId]: {
        role,
        selectedExcerpts: prev[sourceId]?.selectedExcerpts || currentExcerpts
      }
    }));
    setActiveWorkItem(prev => {
      if (!prev) return prev;
      const existingBindings = prev.workContext?.sourceBindings || [];
      const updatedBindings = existingBindings.some(b => b.sourceId === sourceId)
        ? existingBindings.map(b => (b.sourceId === sourceId ? { ...b, role } : b))
        : [
            ...existingBindings,
            {
              sourceId,
              title: src?.title || 'Untitled Source',
              type: src?.type || 'Other',
              role,
              selectedExcerpts: currentExcerpts,
              content: src?.content || src?.notes || ''
            }
          ];
      return {
        ...prev,
        workContext: {
          ...(prev.workContext || {}),
          sourceBindings: updatedBindings
        }
      };
    });
  };

  const handleToggleSourceExcerpt = (sourceId: string, excerpt: string) => {
    const src = [...sources, ...workspaceLocalSources].find(s => s.id === sourceId);
    const role = src ? getEffectiveSourceRole(src) : 'Evidence';
    const currentExcerpts = getEffectiveSourceExcerpts(sourceId);
    const nextExcerpts = currentExcerpts.includes(excerpt)
      ? currentExcerpts.filter(e => e !== excerpt)
      : [...currentExcerpts, excerpt];

    setTaskSourceRoleMap(prev => ({
      ...prev,
      [sourceId]: {
        role: prev[sourceId]?.role || role,
        selectedExcerpts: nextExcerpts
      }
    }));
  };

  const toggleSourceSelection = (id: string) => {
    const isCurrentlySelected = advancedBrief.selectedSourceIds.includes(id);
    const list = isCurrentlySelected
      ? advancedBrief.selectedSourceIds.filter(sId => sId !== id)
      : [...advancedBrief.selectedSourceIds, id];
    setAdvancedBrief(prev => ({ ...prev, selectedSourceIds: list }));

    if (!isCurrentlySelected) {
      const src = [...sources, ...workspaceLocalSources].find(s => s.id === id);
      if (src && !taskSourceRoleMap[id]) {
        setTaskSourceRoleMap(prev => ({
          ...prev,
          [id]: {
            role: inferDefaultSourceRole(src.type),
            selectedExcerpts: []
          }
        }));
      }
    }
  };

  const handleAnalyzeSource = async (src: SourceFile | { id: string; title: string; type: string; content: string; notes?: string }, forceLocalFallback = false) => {
    setAnalyzingSourceIds(prev => ({ ...prev, [src.id]: true }));
    setSourceAnalysisErrors(prev => {
      const next = { ...prev };
      delete next[src.id];
      return next;
    });

    try {
      if (!forceLocalFallback && generationMode === 'ai' && aiStatus === 'connected') {
        const contextPkg = compileGovernedContext({
          workflow: 'Source Intelligence',
          operatingCore,
          coreDocuments: operatingCoreDocs,
          userInstruction: `Analyze source "${src.title}" (${src.type}) under COH claim discipline.`
        });
        const aiResult = await aiService.analyzeSource({
          sourceTitle: src.title,
          sourceType: src.type,
          sourceNotes: src.notes || '',
          sourceContent: src.content || src.notes || '',
          rawInput: src.content || src.notes || '',
          operatingCoreInstructions: contextPkg.compiledInstructions
        });
        const disciplined = enforceSourceIntelligenceClaimDiscipline(
          {
            ...aiResult,
            sourceId: src.id,
            sourceTitle: src.title,
            sourceType: src.type,
            analyzedAt: new Date().toISOString(),
            analysisMode: 'ai'
          },
          src
        );
        setSourceIntelligenceMap(prev => upsertSourceIntelligenceRecord(prev, disciplined));
      } else {
        const fallbackAnalysis = buildDeterministicSourceAnalysis(src, operatingCore);
        setSourceIntelligenceMap(prev => upsertSourceIntelligenceRecord(prev, fallbackAnalysis));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to complete AI source analysis.';
      setSourceAnalysisErrors(prev => ({ ...prev, [src.id]: msg }));
    } finally {
      setAnalyzingSourceIds(prev => ({ ...prev, [src.id]: false }));
    }
  };

  const handleAddToCurrentBrief = (src: { id: string; title: string; type: string }) => {
    toggleSourceSelection(src.id);
  };

  const handleUseSourceInIdeation = (
    src: { id: string; title: string; type: string; content: string; notes?: string },
    analysis?: SourceIntelligenceAnalysis | null
  ) => {
    const role = getEffectiveSourceRole(src);
    if (!advancedBrief.selectedSourceIds.includes(src.id)) {
      setAdvancedBrief(prev => ({
        ...prev,
        selectedSourceIds: [...prev.selectedSourceIds, src.id]
      }));
    }
    setTaskSourceRoleMap(prev => ({
      ...prev,
      [src.id]: {
        role,
        selectedExcerpts: prev[src.id]?.selectedExcerpts || []
      }
    }));
    const seedHint = analysis?.contentOpportunityHints?.[0] || analysis?.strategicContext || src.notes || src.title;
    setIdeationInput(`${src.title}: ${seedHint}`);
    if (analysis?.relevantAudiences?.[0]) {
      setIdeationFilterAudience(analysis.relevantAudiences[0]);
    }
    if (analysis?.relevantChannels?.[0]) {
      setIdeationFilterChannel(analysis.relevantChannels[0]);
    }
    setActiveTab('ideation-workspace');
  };

  const handleCreateContentFromSource = (
    src: { id: string; title: string; type: string; content: string; notes?: string },
    analysis?: SourceIntelligenceAnalysis | null
  ) => {
    const role = getEffectiveSourceRole(src);
    setTaskSourceRoleMap(prev => ({
      ...prev,
      [src.id]: {
        role,
        selectedExcerpts: prev[src.id]?.selectedExcerpts || []
      }
    }));
    setCreationMode('advanced');
    setAdvancedBrief(prev => {
      const candidateChannel = analysis?.relevantChannels?.[0];
      const nextChannel = candidateChannel && CHANNELS.includes(candidateChannel) ? candidateChannel : prev.channel;
      const validFormats = CHANNEL_FORMATS[nextChannel] || ['Post'];
      const nextFormat = validFormats.includes(prev.outputFormat) ? prev.outputFormat : validFormats[0];
      return {
        ...prev,
        selectedSourceIds: prev.selectedSourceIds.includes(src.id)
          ? prev.selectedSourceIds
          : [...prev.selectedSourceIds, src.id],
        topic: prev.topic.trim() ? prev.topic : `${src.title}: ${analysis?.strategicContext || src.notes || 'Source-grounded brief'}`,
        channel: nextChannel,
        outputFormat: nextFormat,
        pillar: analysis?.relevantPillars?.[0] || prev.pillar
      };
    });
    setStartedFromNote(`Source Library: ${src.title} (${role})`);
    setActiveTab('content-workspace');
  };

  const handleUseSourceAsVisualReference = (
    src: { id: string; title: string; type: string; content: string; notes?: string },
    analysis?: SourceIntelligenceAnalysis | null
  ) => {
    handleChangeSourceTaskRole(src.id, 'Visual Reference');
    if (!advancedBrief.selectedSourceIds.includes(src.id)) {
      setAdvancedBrief(prev => ({
        ...prev,
        selectedSourceIds: [...prev.selectedSourceIds, src.id]
      }));
    }
    setVsSourceItem({ id: src.id, title: src.title, type: 'Library' });
    setVsConcept(analysis?.strategicContext || src.notes || src.title);
    setVsNotes(`Visual Reference Source: ${src.title}. ${(src.content || '').slice(0, 300)}`);
    setActiveTab('visual-studio');
  };

  const handleUseSourceInReframing = (
    src: { id: string; title: string; type: string; content: string; notes?: string },
    analysis?: SourceIntelligenceAnalysis | null
  ) => {
    const role = getEffectiveSourceRole(src);
    setTaskSourceRoleMap(prev => ({
      ...prev,
      [src.id]: {
        role,
        selectedExcerpts: prev[src.id]?.selectedExcerpts || []
      }
    }));
    setAdvancedBrief(prev => ({
      ...prev,
      selectedSourceIds: prev.selectedSourceIds.includes(src.id)
        ? prev.selectedSourceIds
        : [...prev.selectedSourceIds, src.id]
    }));
    setReframingInitialOrigin({
      originType: 'Source Library',
      originId: src.id,
      originTitle: src.title,
      sourceContent: src.content || src.notes || analysis?.strategicContext || src.title,
      originChannel: analysis?.relevantChannels?.[0] || 'LinkedIn',
      originAudience: analysis?.relevantAudiences?.[0] || 'Cultural Institutions & Museums'
    });
    setActiveTab('reframing-studio');
  };

  const handleEditSource = (src: SourceFile) => {
    setNewSource({
      title: src.title,
      type: src.type,
      status: src.status,
      notes: src.notes || '',
      content: src.content || ''
    });
    setEditingSourceId(src.id);
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
    setSourceIntelligenceMap(prev => removeSourceIntelligenceRecord(prev, id));
    setAdvancedBrief(prev => ({
      ...prev,
      selectedSourceIds: prev.selectedSourceIds.filter(sId => sId !== id)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const added: SourceFile = {
          id: `src-upload-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: file.name,
          type: 'Other',
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0],
          notes: `Uploaded file size: ${(file.size / 1024).toFixed(1)} KB.`,
          content: text || 'PDF contents placeholder summary'
        };
        setSources(prev => [added, ...prev]);
      };
      reader.readAsText(file);
    });
  };

  const handleFolderUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const path = (file as any).webkitRelativePath || file.name;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const added: SourceFile = {
          id: `src-folder-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          title: path,
          type: 'Event Notes',
          status: 'Active',
          createdAt: new Date().toISOString().split('T')[0],
          notes: `Directory uploaded path: ${path}`,
          content: text || 'Directory content placeholder'
        };
        setSources(prev => [added, ...prev]);
      };
      reader.readAsText(file);
    });
  };

  const handleUpdateStatus = (id: string, status: SavedContent['status']) => {
    setSavedContent(savedContent.map(c => c.id === id ? { ...c, status, lastEdited: new Date().toISOString().split('T')[0] } : c));
  };

  const handleDeleteSaved = (id: string) => {
    setSavedContent(savedContent.filter(c => c.id !== id));
  };

  const handleUndoRevision = () => {
    if (activeDraftHistory.length <= 1) return;
    const history = [...activeDraftHistory];
    history.pop();
    const prevVer = history[history.length - 1];
    setActiveDraftVersion(prevVer.version);
    setActiveDraftHistory(history);
    setActiveDraftText(prevVer.text);
  };

  // --- Dynamic Inputs Snapshot Generator ---
  const getCurrentInputsString = () => {
    if (creationMode === 'simple') {
      return JSON.stringify({
        creationMode,
        goal: simpleBrief.goal,
        channel: simpleBrief.channel,
        workspaceSourcesCount: workspaceLocalSources.length,
        workspaceSourcesContent: workspaceLocalSources.map(s => s.content).join('|')
      });
    } else if (creationMode === 'quick') {
      return JSON.stringify({
        creationMode,
        creationScope: quickBrief.creationScope || 'Single Channel',
        targetChannels: quickBrief.targetChannels || [],
        goal: quickBrief.goal,
        channel: quickBrief.channel,
        notes: quickBrief.notes,
        mustInclude: quickBrief.mustInclude,
        mustAvoid: quickBrief.mustAvoid,
        language: quickBrief.language,
        outputFormat: quickBrief.outputFormat,
        workspaceSourcesCount: workspaceLocalSources.length,
        workspaceSourcesContent: workspaceLocalSources.map(s => s.content).join('|')
      });
    } else {
      return JSON.stringify({
        creationMode,
        creationScope: advancedBrief.creationScope || 'Single Channel',
        targetChannels: advancedBrief.targetChannels || [],
        topic: advancedBrief.topic,
        channel: advancedBrief.channel,
        pillar: advancedBrief.pillar,
        audience: advancedBrief.audience,
        customAudience: advancedBrief.customAudience,
        purpose: advancedBrief.purpose,
        directionMode: advancedBrief.directionMode,
        angle: advancedBrief.angle,
        customDirection: advancedBrief.customDirection,
        selectedSourceIds: advancedBrief.selectedSourceIds,
        mustInclude: advancedBrief.mustInclude,
        mustAvoid: advancedBrief.mustAvoid,
        desiredLength: advancedBrief.desiredLength,
        customLengthCount: advancedBrief.customLengthCount,
        toneIntensity: advancedBrief.toneIntensity,
        language: advancedBrief.language,
        outputFormat: advancedBrief.outputFormat,
        creationIntent: advancedBrief.creationIntent,
        workspaceSourcesCount: workspaceLocalSources.length,
        workspaceSourcesContent: workspaceLocalSources.map(s => s.content).join('|')
      });
    }
  };

  const isBriefOutdated = !!(draftOptions && getCurrentInputsString() !== generationInputsSnapshot);

  // --- Audience explanation previews ---
  const getAudienceExplanation = (aud: string) => {
    switch (aud) {
      case 'General Public':
        return 'Clear, accessible language with less internal strategy.';
      case 'Cultural Audience':
        return 'Human, visual, experiential framing focusing on music, myth, and atmosphere.';
      case 'Opera Audience':
        return 'Artistic composition, performance, repertoire canon, and staging focus.';
      case 'Cultural Institutions & Festivals':
        return 'Programming value, adoption, repeatability, and institutional fit.';
      case 'Sponsors & Patrons':
        return 'Value, credibility, association, cultural IP, and low-hype sponsor logic.';
      case 'Strategic Partners':
        return 'Operational fit, collaboration enablement, shared contribution focus.';
      case 'Climate, Policy & Philanthropy Leaders':
        return 'Lived condition framing, civic relevance, long-term infrastructure.';
      case 'Media & Journalists':
        return 'News hook, proof points, and why this matters now.';
      case 'Education & Community':
        return 'Learning-oriented, accessible focus, community continuity.';
      case 'Internal Team':
        return 'Direct operational language focused on next actions.';
      case 'Custom Audience':
        return 'Adapts tone, vocabulary, and CTA based on user description.';
      default:
        return '';
    }
  };

  const cleanWritingArtifacts = (text: string) => {
    if (!text) return '';
    let cleaned = text;

    // 1. Dash variations: em-dash, en-dash, horizontal bar, figure dash, minus sign (when padded or used as punctuation), repeated dashes
    cleaned = cleaned.replace(/—|–|―|‒|−|--+/g, (match, offset, fullText) => {
      const before = fullText.substring(Math.max(0, offset - 15), offset);
      const after = fullText.substring(offset + match.length, offset + match.length + 15);
      
      if (/^\s*$/.test(before) || /\n\s*$/.test(before)) {
        return '- ';
      }
      if (/[.!?]\s*$/.test(before)) {
        return '';
      }
      if (/^\s*[A-Z]/.test(after)) {
        return '. ';
      }
      return ', ';
    });

    // Clean up any double punctuation created by dash replacements
    cleaned = cleaned.replace(/,\s*,/g, ',');
    cleaned = cleaned.replace(/\.\s*,/g, '.');
    cleaned = cleaned.replace(/,\s*\./g, '.');

    // 2. Remove zero-width characters, non-breaking spaces, and invisible/odd unicode
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
    cleaned = cleaned.replace(/\u00A0/g, ' ');
    
    // 3. Curly quotes to straight quotes
    cleaned = cleaned.replace(/[\u2018\u2019]/g, "'");
    cleaned = cleaned.replace(/[\u201C\u201D]/g, '"');

    // 4. Remove decorative separators
    cleaned = cleaned.replace(/^[=\-*#\s]{5,}/gm, '');

    // 5. Avoid formulaic AI phrases
    cleaned = cleaned.replace(/not just\b([^,.]+)\but also\b/gi, 'both $1 and');
    cleaned = cleaned.replace(/in a world where\b/gi, 'when');
    cleaned = cleaned.replace(/at the intersection of\b/gi, 'combining');
    cleaned = cleaned.replace(/now more than ever\b/gi, '');
    cleaned = cleaned.replace(/more than ever\b/gi, '');
    cleaned = cleaned.replace(/this is not merely\b/gi, 'this is not');

    // 6. Normalize whitespace and duplicate spaces
    cleaned = cleaned.replace(/[ \t]+/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');

    return cleaned.trim();
  };

  const detectCleanlinessIssues = (text: string): boolean => {
    if (!text) return false;
    const emDash = /—/g.test(text);
    const enDash = /–/g.test(text);
    const zeroWidth = /[\u200B-\u200D\uFEFF]/g.test(text);
    const curlyQuotes = /[\u2018\u2019\u201C\u201D]/g.test(text);
    const excessiveSpaces = / {2,}/.test(text);
    return emDash || enDash || zeroWidth || curlyQuotes || excessiveSpaces;
  };

  const generateContentDisplayTitle = (item: SavedContent | any): string => {
    const genericPattern = /^(option\s+[a-z]|internal\s+teams\s+option\s+[a-z]|linkedin\s+option\s+[a-z]|newsletter\s+option\s+[a-z]|instagram\s+option\s+[a-z]|email\s+option\s+[a-z]|\bopt\s*[a-z]\b)/i;
    const isGeneric = !item.title || genericPattern.test(item.title) || item.title.toLowerCase().startsWith('untitled');

    if (!isGeneric) {
      return item.title;
    }

    const text = item.text || item.finalCopy || '';
    if (!text.trim()) return item.title || 'Untitled Draft';

    const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    
    for (let i = 0; i < Math.min(lines.length, 3); i++) {
      const line = lines[i];
      const cleanLine = line.replace(/^[#*\s-]+|[#*\s-]+$/g, '').trim();
      if (cleanLine.endsWith('?') && cleanLine.length > 10 && cleanLine.length < 80) {
        return cleanLine.replace(/[?.\s]+$/, '?');
      }
    }

    const firstLine = lines[0] || '';
    const cleanFirstLine = firstLine.replace(/^[#*\s-]+|[#*\s-]+$/g, '').trim();
    if (cleanFirstLine && cleanFirstLine.length > 10 && cleanFirstLine.length < 80 && !cleanFirstLine.endsWith('.')) {
      return cleanFirstLine;
    }

    const sentences = text.replace(/^[#*\s-]+/, '').split(/[.!?]\s+/);
    let titleStr = sentences[0] || 'Untitled Draft';
    titleStr = titleStr.replace(/^[#*\s-]+|[#*\s-]+$/g, '').trim();
    if (titleStr.length > 70) {
      titleStr = titleStr.substring(0, 67) + '...';
    }
    titleStr = titleStr.replace(/\b(option\s+[a-z]|draft|internal\s+teams|post|caption|copy|revision)\b/gi, '').trim();
    titleStr = titleStr.replace(/[.,;:!?\s]+$/, '');
    
    return titleStr || item.title || 'Untitled Draft';
  };

  const buildElaboratedImagePrompt = (
    visualDir: Record<string, string> | any,
    channel: string,
    format: string,
    _text: string
  ): string => {
    const ch = (channel || '').toLowerCase();
    const fmt = (format || '').toLowerCase();
    let presetId = 'social-li-sq';
    if (ch.includes('insta') && (fmt.includes('story') || fmt.includes('reel'))) {
      presetId = 'social-ig-story';
    } else if (ch.includes('insta')) {
      presetId = 'social-ig-port';
    } else if (ch.includes('news') || fmt.includes('news')) {
      presetId = 'web-newsletter';
    } else if (ch.includes('web') || fmt.includes('hero') || fmt.includes('article') || fmt.includes('blog')) {
      presetId = 'web-hero';
    }

    const compiled = compileVisualStudioPrompt({
      brief: visualDir,
      visualStyle: 'Cinematic Realism',
      formatPresetId: presetId
    });
    return compiled.prompt;
  };

  const formatVisualDirectionForDisplay = (
    visualDirStr?: string,
    channel?: string,
    format?: string,
    text?: string
  ): string => {
    if (!visualDirStr) return 'No visual direction saved.';

    const parsed = parseVisualDirectionInput(visualDirStr);
    const hasAnyField = Object.values(parsed).some((v) => Boolean(v && v.trim()));
    if (!hasAnyField) {
      return visualDirStr;
    }

    const fields = [
      { key: 'visualConcept', label: 'Visual Concept' },
      { key: 'formatRecommendation', label: 'Format Recommendation' },
      { key: 'moodAtmosphere', label: 'Mood / Atmosphere' },
      { key: 'composition', label: 'Composition' },
      { key: 'colorMaterialDirection', label: 'Color / Material Direction' },
      { key: 'typographyLayout', label: 'Typography / Layout' },
      { key: 'keyVisualElements', label: 'Key Visual Elements' },
      { key: 'whatToAvoid', label: 'What to Avoid' },
      { key: 'aiImagePrompt', label: 'AI Image Prompt' },
      { key: 'negativePrompt', label: 'Negative Prompt' },
      { key: 'designerNotes', label: 'Designer Notes' }
    ] as const;

    const resultLines: string[] = [];
    fields.forEach((field) => {
      let val = parsed[field.key];

      if (field.key === 'aiImagePrompt' && !val) {
        val = buildElaboratedImagePrompt(parsed, channel || '', format || '', text || '');
      }

      if (field.key === 'negativePrompt' && !val && parsed.whatToAvoid) {
        val = parsed.whatToAvoid;
      }

      if (val && val.trim()) {
        resultLines.push(`${field.label}:\n${val.trim()}`);
      }
    });

    return resultLines.join('\n\n');
  };

  const extractAIImagePrompt = (
    visualDirStr?: string,
    channel?: string,
    format?: string,
    text?: string
  ): string => {
    if (!visualDirStr) return '';
    const parsed = parseVisualDirectionInput(visualDirStr);
    return buildElaboratedImagePrompt(parsed, channel || '', format || 'Post', text || '');
  };

  // --- Tone Display Map ---
  const getToneName = (level: number) => {
    switch (level) {
      case 1: return 'Calm / Institutional';
      case 2: return 'Composed / Editorial';
      case 3: return 'Balanced / COH Default';
      case 4: return 'Charged / Expressive';
      case 5: return 'Bold / Punchy';
      default: return 'Balanced / COH Default';
    }
  };

  // --- Recommended Approach ---
  const getDynamicDirections = (): ContentDirection[] => {
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';
    const goal = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);
    const pillar = isSimple ? 'Climate Tetralogy & Canon' : (isQuick ? 'Climate Tetralogy & Canon' : advancedBrief.pillar);
    const mustAvoid = isSimple ? '' : (isQuick ? quickBrief.mustAvoid : advancedBrief.mustAvoid);

    return [
      {
        title: 'System Repertoire & Durability Focus',
        strategicFrame: `Aligns "${goal || 'the campaign'}" with the long-term repertoire-based climate canon. Focuses on institutional licensing and sponsor value.`,
        bestChannelFit: 'LinkedIn, Website, Sponsor Note',
        whatToSay: `Grounded value points matching ${pillar}. Mention live performance as the origin asset.`,
        whatNotToSay: `Do not use short-term activist phrases or highlight unverified event dates. Avoid: ${mustAvoid || 'None'}`,
        recommendedOutputType: 'Sponsor Paragraph or Post',
        visualImplication: 'Clean layout, minimalist structure, neutral backdrops.'
      },
      {
        title: 'Lived Condition & Somatic Staging',
        strategicFrame: `Framing the campaign under the core COH method: climate is a lived condition, not a campaign theme.`,
        bestChannelFit: 'Instagram, Newsletter',
        whatToSay: 'Somatic stage details, wind/water indices, and felt experiences.',
        whatNotToSay: 'Do not use dry corporate sustainability metrics.',
        recommendedOutputType: 'Caption or Carousel slides',
        visualImplication: 'Atmospheric light renders, gold reflections on deep navy stages.'
      },
      {
        title: 'Direct Brief Compilation',
        strategicFrame: 'Direct translation of the brief topic and pasted notes with no additional thematic framing.',
        bestChannelFit: 'All Channels',
        whatToSay: `Factual points explicitly requested in: "${goal}".`,
        whatNotToSay: 'Any context outside selected sources.',
        recommendedOutputType: 'Post or Newsletter Section',
        visualImplication: 'Generic editorial graphics matching the target channel.'
      }
    ];
  };

  // --- Source Relevance Logic for Soria Moria / Opera Titles ---
  const checkOperaRelevance = (operaTitle: string) => {
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';
    const goal = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);
    const notes = isSimple ? '' : (isQuick ? quickBrief.notes : '');
    const mustInclude = isSimple ? '' : (isQuick ? quickBrief.mustInclude : advancedBrief.mustInclude);
    const selectedAngle = isSimple ? '' : (isQuick ? '' : advancedBrief.angle);
    
    const searchString = `${goal} ${notes} ${mustInclude} ${selectedAngle}`.toLowerCase();
    if (searchString.includes(operaTitle.toLowerCase())) {
      return true;
    }

    if (creationMode === 'advanced') {
      const hasInSource = advancedBrief.selectedSourceIds.some(id => {
        const src = sources.find(s => s.id === id);
        return src && (src.title.toLowerCase().includes(operaTitle.toLowerCase()) || src.content.toLowerCase().includes(operaTitle.toLowerCase()));
      });
      if (hasInSource) return true;
    }

    return false;
  };

  // --- Translation Helper & Dictionary ---
  const TRANSLATIONS: Record<string, Record<string, string>> = {
    'Persian': {
      'Strongest Directions': 'قوی‌ترین مسیرها',
      'Sharp Hooks': 'قلاب‌های جذاب',
      'Thought Leadership Angles': 'زوایای رهبری فکری',
      'Educational Angles': 'زوایای آموزشی',
      'Emotional or Reflective Angles': 'زوایای احساسی یا تأملی',
      'Storytelling Angles': 'زوایای روایت‌گری',
      'Promotional Angles': 'زوایای تبلیغاتی',
      'Campaign-Series Ideas': 'ایده‌های کمپین-مجموعه',
      'Experimental Ideas': 'ایده‌های تجربی',
      'Visceral bypass vs intellectual distance for:': 'میانبر حسی در مقایسه با فاصله فکری برای:',
      'Provocative entry points for:': 'نکات ورود تحریک‌آمیز برای:',
      'Strategic thesis on:': 'تز استراتژیک در مورد:',
      'Demystifying the mechanics behind:': 'رمزگشایی از مکانیسم‌های پشت:',
      'Somatic memory and resonance of:': 'حافظه حسی و طنینِ:',
      'Staging the transformation of:': 'صحنه‌سازی دگرگونیِ:',
      'Action pathway: Engaging supporters for:': 'مسیر اقدام: جذب حامیان برای:',
      'Multi-part cycle: Deep dive into:': 'چرخه چندبخشی: بررسی عمیق در:',
      'Unusual creative framing for:': 'قاب‌بندی خلاقانه غیرمعمول برای:',
      'live somatic experiences of': 'تجربیات حسی زنده از',
      'create a lasting impact that policy briefs fail to establish.': 'تاثیری ماندگار ایجاد می‌کند که گزارش‌های سیاستی در ایجاد آن ناتوانند.',
      'we can hook public attention by questioning conventional views on': 'می‌توانیم با به چالش کشیدن دیدگاه‌های سنتی دربارهٔ [...] توجه عمومی را جلب کنیم.',
      'requires permanent, reusable cultural infrastructure rather than temporary public awareness campaigns.': 'به جای کمپین‌های موقت آگاهی‌بخشی عمومی، به زیرساخت‌های فرهنگی دائمی و قابل استفاده مجدد نیاز دارد.',
      'we can break down the physical or structural science behind': 'می‌توانیم علم فیزیکی یا ساختاری پشت [...] را با استفاده از تمثیل‌های واضح و بدون اصطلاحات پیچیده تشریح کنیم.',
      'art provides the necessary ritual space to process the grief and emotional weight of': 'هنر فضای آیینی لازم را برای پردازش غم و بار احساسیِ [...] فراهم می‌کند.',
      'we can follow a specific scene, character, or musical threshold that makes': 'می‌توانیم صحنه، شخصیت یا آستانه موسیقی خاصی را دنبال کنیم که [...] را ملموس می‌سازد.',
      'we can invite sponsors and partners to back the creative development of': 'می‌توانیم از حامیان مالی و شرکا دعوت کنیم تا از توسعه خلاقانهٔ [...] به عنوان یک دارایی معتبر حمایت کنند.',
      'a 3-part sequential series can trace the history, immediate reality, and future potential of': 'یک مجموعه دنباله‌دار ۳ بخشی می‌تواند تاریخچه، واقعیت فوری و پتانسیل آیندهٔ [...] را ترسیم کند.',
      'Climate opera offers a unique advantage over other climate art: it is multi-sensory, somatic, and creates complete narrative worlds rather than static warnings.': 'اپرای اقلیمی مزیتی منحصربه‌فرد نسبت به سایر هنرهای اقلیمی دارد: چندحسی و فیزیکی است و به جای هشدارهای ایستا، جهان‌های داستانی کاملی خلق می‌کند.',
      'To answer how art impacts climate response, we must look at the medium: performance bypasses intellectual resistance to create an immediate, felt experience.': 'برای پاسخ به اینکه هنر چگونه بر واکنش‌های اقلیمی تأثیر می‌گذارد، باید به رسانه نگاه کنیم: اجرا از مقاومت فکری عبور می‌کند تا تجربه‌ای فوری و ملموس خلق کند.',
      'While traditional climate communication relies on data and policy graphs, climate opera translates these ecological thresholds into live, visceral soundscapes.': 'در حالی که ارتباطات سنتی اقلیمی به داده‌ها و نمودارهای سیاستی متکی است، اپرای اقلیمی این آستانه‌های اکولوژیکی را به موسیقی‌های زنده و ملموس ترجمه می‌کند.',
      'Planetary change is not just a scientific metric; it is a shared human sorrow. Art holds the power to make climate grief visible, giving form to what we fear to name.': 'تغییرات سیاره‌ای صرفاً یک سنجه علمی نیست، بلکه یک غم مشترک انسانی است. هنر این قدرت را دارد که غم اقلیمی را مرئی سازد و به آنچه از نامیدنش می‌ترسیم شکل دهد.',
      'Before we can act on ecological transition, we must allow ourselves to feel the weight of what is at stake.': 'پیش از آنکه بتوانیم در جهت گذار اکولوژیکی اقدام کنیم، باید به خود اجازه دهیم وزن آنچه در خطر است را احساس کنیم.',
      'We invite you to reserve your tickets for our next performance and experience these ecological worlds live on stage.': 'از شما دعوت می‌کنیم بلیط‌های خود را برای اجرای بعدی ما رزرو کنید و این جهان‌های اکولوژیکی را زنده روی صحنه تجربه کنید.',
      'Join us for the next performance as we translate planetary indices into somatic stage designs.': 'در اجرای بعدی به ما بپیوندید تا شاخص‌های سیاره‌ای را به طراحی‌های صحنه فیزیکی ترجمه کنیم.',
      'Music reaches the human heart long before policy papers reach the legislative floor. It speaks in a language of resonance, not negotiation.': 'موسیقی خیلی زودتر از رسیدن اسناد سیاستی به صحن پارلمان، به قلب انسان‌ها می‌رسد. موسیقی با زبان طنین سخن می‌گوید، نه مذاکره.',
      'Art is not merely decorative in the climate transition; it is the cultural infrastructure that makes change imaginable.': 'هنر در گذار اقلیمی صرفاً جنبه تزئینی ندارد؛ بلکه زیرساخت فرهنگی است که تغییر را تصورپذیر می‌کند.',
      'We are pleased to announce the upcoming performance schedule, presenting live opera as a response to the climate transition.': 'خوشحالیم که برنامه اجراهای آینده را اعلام کنیم و اپرای زنده را به عنوان پاسخی به گذار اقلیمی ارائه دهیم.',
      'The climate transition is a cultural challenge, requiring artistic frameworks that treat ecological thresholds as lived conditions.': 'گذار اقلیمی یک چالش فرهنگی است که به چارچوب‌های هنری نیاز دارد تا با آستانه‌های اکولوژیکی به عنوان شرایط زیسته برخورد کند.',
      'Where policy papers outline metrics, staged performance renders thresholds somatically.': 'در حالی که اسناد سیاستی شاخص‌ها را نشان می‌دهند، اجرای روی صحنه این آستانه‌ها را به صورت ملموس ارائه می‌کند.',
      'By treating climate as a lived condition, opera bypasses cognitive fatigue and builds long-term cultural resonance.': 'با برخورد با اقلیم به عنوان یک شرایط زیسته، اپرا از خستگی شناختی عبور کرده و طنین فرهنگی بلندمدتی ایجاد می‌کند.',
      'Opera integrates voice, light, and movement to mirror the complexity of our changing ecosystems.': 'اپرا صدا، نور و حرکت را ادغام می‌کند تا بازتاب‌دهنده پیچیدگی اکوسیستم‌های در حال تغییر ما باشد.',
      'Through these temporary, shared spaces, we process the grief of planetary loss and find collective capacity to imagine new futures.': 'از طریق این فضاهای موقت و مشترک، ما غم از دست دادن سیاره را پردازش می‌کنیم و توان جمعی برای تصور آینده‌های جدید می‌یابیم.',
      'Experience Soria Moria or our wider Climate Tetralogy staged live.': 'اجرای زنده سوریا موریا یا تترالوژی گسترده‌تر اقلیمی ما را تجربه کنید.',
      'Secure your place to witness the intersection of scientific data and operatic composition.': 'جایگاه خود را برای تماشای تقاطع داده‌های علمی و آهنگسازی اپرا تضمین کنید.',
      'Policy shapes the rules of transition, but culture shapes the desires and wills that drive it.': 'سیاست قوانین گذار را شکل می‌دهد، اما فرهنگ خواسته‌ها و اراده‌هایی را که محرک آن هستند می‌سازد.',
      'Through the Climate Tetralogy, we ground scientific truth in visceral staging.': 'از طریق تترالوژی اقلیمی، ما حقیقت علمی را در صحنه‌سازی ملموس پایه‌گذاری می‌کنیم.',
      'Opera serves as the origin asset, establishing prestige worlds that scale into filmed media.': 'اپرا به عنوان دارایی اصلی عمل می‌کند و جهان‌های معتبری را پایه‌گذاری می‌کند که به رسانه‌های تصویری گسترش می‌yابند.',
      'This repertoire-based canon ensures durable cultural IP for institutions and sponsors.': 'این مجموعه اپراها تضمین‌کننده دارایی معنوی فرهنگی پایدار برای نهادها و حامیان مالی است.',
      'This is the core design methodology behind the work of Climate Opera Haus.': 'این متدولوژی طراحی اصلی پشت کارهای کلایمت اپرا هاوس است.',
      'This approach guides how Climate Opera Haus structures the Climate Tetralogy.': 'این رویکرد نحوه ساختاردهی تترالوژی اقلیمی را توسط کلایمت اپرا هاوس هدایت می‌کند.',
      'Read the full brief online.': 'خلاصه کامل را به صورت آنلاین بخوانید.',
      'Reserve your tickets now.': 'بلیط‌های خود را همین حالا رزرو کنید.',
      'We welcome strategic patrons to partner with us in building this durable canon.': 'ما از حامیان استراتژیک برای همکاری با ما در ساخت این مجموعه پایدار استقبال می‌کنیم.',
      'We welcome further dialogue on integrating cultural engines into climate strategy.': 'ما از گفتگوهای بیشتر در مورد ادغام موتورهای فرهنگی در استراتژی اقلیمی استقبال می‌کنیم.',
      'Explore the repertoire-based canon at Climate Opera Haus.': 'مجموعه اپراهای ماندگار را در کلایمت اپرا هاوس کاوش کنید.',
      'Partner with us to support the Climate Tetralogy.': 'برای حمایت از تترالوژی اقلیمی با ما همکاری کنید.',
      'The conversation around climate is often cold and dry. We need a language that feels human.': 'گفتگوها پیرامون اقلیم اغلب سرد و خشک است. ما به زبانی نیاز داریم که احساس انسانی منتقل کند.',
      'Why it works:': 'چرا این ایده موثر است:',
      'Hook idea:': 'ایده قلاب:',
      'FIRST POST IDEA:': 'ایده اولین پست:',
      'Risk to Avoid:': 'ریسک برای اجتناب:',
      'Next Step:': 'گام بعدی:',
      'Audience:': 'مخاطب:',
      'Tone:': 'لحن:',
      'Recommended content angle': 'زاویه محتوای پیشنهادی',
      'Draft Option 1 (direct/institutional)': 'گزینه پیش‌نویس ۱ (مستقیم/نهادی)',
      'Draft Option 2 (human/narrative)': 'گزینه پیش‌نویس ۲ (انسانی/روایی)',
      'Shorter version': 'نسخه کوتاه‌تر',
      'Structured Visual Design Brief': 'خلاصه طراحی بصری ساختاریافته',
      'Editorial warning': 'هشدار تحریریه',
      'Warning: Unverified proper nouns detected.': 'هشدار: اسامی خاص تأیید نشده شناسایی شدند.',
      'No fictional content detected.': 'هیچ محتوای ساختگی شناسایی نشد.'
    },
    'Italian': {
      'Strongest Directions': 'Direzioni più forti',
      'Sharp Hooks': 'Hook incisivi',
      'Thought Leadership Angles': 'Prospettive di Thought Leadership',
      'Educational Angles': 'Prospettive educative',
      'Emotional or Reflective Angles': 'Prospettive emotive o riflessive',
      'Storytelling Angles': 'Prospettive di Storytelling',
      'Promotional Angles': 'Prospettive promozionali',
      'Campaign-Series Ideas': 'Idee per serie di campagne',
      'Experimental Ideas': 'Idee sperimentali',
      'Visceral bypass vs intellectual distance for:': 'Bypass viscerale vs distanza intellettuale per:',
      'Provocative entry points for:': 'Punti di ingresso provocatori per:',
      'Strategic thesis on:': 'Tesi strategica su:',
      'Demystifying the mechanics behind:': 'Demistificare i meccanismi dietro:',
      'Somatic memory and resonance of:': 'Memoria somatica e risonanza di:',
      'Staging the transformation of:': 'Mettere in scena la trasformazione di:',
      'Action pathway: Engaging supporters for:': 'Percorso d\'azione: Coinvolgere i sostenitori per:',
      'Multi-part cycle: Deep dive into:': 'Ciclo in più parti: Approfondimento su:',
      'Unusual creative framing for:': 'Inquadratura creativa insolita per:',
      'Why it works:': 'Perché funziona:',
      'Hook idea:': 'Idea di hook:',
      'FIRST POST IDEA:': 'IDEA PER IL PRIMO POST:',
      'Risk to Avoid:': 'Rischio da evitare:',
      'Next Step:': 'Prossimo passo:',
      'Audience:': 'Pubblico:',
      'Tone:': 'Tono:',
      'Climate opera offers a unique advantage over other climate art: it is multi-sensory, somatic, and creates complete narrative worlds rather than static warnings.': 'L\'opera sul clima offre un vantaggio unico rispetto ad altre arti climatiche: è multisensoriale, somatica e crea mondi narrativi completi piuttosto che avvertimenti statici.'
    },
    'Spanish': {
      'Strongest Directions': 'Direcciones más fuertes',
      'Sharp Hooks': 'Ganchos afilados',
      'Thought Leadership Angles': 'Ángulos de liderazgo de opinión',
      'Educational Angles': 'Ángulos educativos',
      'Emotional or Reflective Angles': 'Ángulos emocionales o reflexivos',
      'Storytelling Angles': 'Ángulos de narración',
      'Promotional Angles': 'Ángulos promocionales',
      'Campaign-Series Ideas': 'Ideas para series de campañas',
      'Experimental Ideas': 'Ideas experimentales',
      'Visceral bypass vs intellectual distance for:': 'Bypass visceral vs distancia intelectual para:',
      'Provocative entry points for:': 'Puntos de entrada provocativos para:',
      'Strategic thesis on:': 'Tesis estratégica sobre:',
      'Demystifying the mechanics behind:': 'Desmitificar la mecánica detrás de:',
      'Somatic memory and resonance of:': 'Memoria somática y resonancia de:',
      'Staging the transformation of:': 'Escenificar la transformación de:',
      'Action pathway: Engaging supporters for:': 'Vía de acción: Involucrar a los seguidores para:',
      'Multi-part cycle: Deep dive into:': 'Ciclo de varias partes: Inmersión profunda en:',
      'Unusual creative framing for:': 'Encuadre creativo inusual para:',
      'Why it works:': 'Por qué funciona:',
      'Hook idea:': 'Idea de gancho:',
      'FIRST POST IDEA:': 'IDEA DEL PRIMER POST:',
      'Risk to Avoid:': 'Riesgo a evitar:',
      'Next Step:': 'Siguiente paso:',
      'Audience:': 'Audiencia:',
      'Tone:': 'Tono:',
      'Climate opera offers a unique advantage over other climate art: it is multi-sensory, somatic, and creates complete narrative worlds rather than static warnings.': 'La ópera climática ofrece una ventaja única sobre otros tipos de arte climático: es multisensorial, somática y crea mundos narrativos completos en lugar de advertencias estáticas.'
    },
    'French': {
      'Strongest Directions': 'Directions les plus fortes',
      'Sharp Hooks': 'Accroches percutantes',
      'Thought Leadership Angles': 'Angles de leadership d\'opinion',
      'Educational Angles': 'Angles éducatifs',
      'Emotional or Reflective Angles': 'Angles émotionnels ou réflexifs',
      'Storytelling Angles': 'Angles de narration',
      'Promotional Angles': 'Angles promotionnels',
      'Campaign-Series Ideas': 'Idées de séries de campagnes',
      'Experimental Ideas': 'Idées expérimentales',
      'Visceral bypass vs intellectual distance for:': 'Bypass viscéral vs distance intellectuelle pour :',
      'Provocative entry points for:': 'Points d\'entrée provocateurs pour :',
      'Strategic thesis on:': 'Thèse stratégique sur :',
      'Demystifying the mechanics behind:': 'Démystifier les mécanismes derrière :',
      'Somatic memory and resonance of:': 'Mémoire somatique et résonance de :',
      'Staging the transformation of:': 'Mettre en scène la transformation de :',
      'Action pathway: Engaging supporters for:': 'Piste d\'action : Engager les supporters pour :',
      'Multi-part cycle: Deep dive into:': 'Cycle en plusieurs parties : Plongée profonde dans :',
      'Unusual creative framing for:': 'Cadrage créatif inhabituel pour :',
      'Why it works:': 'Pourquoi cela fonctionne :',
      'Hook idea:': 'Idée d\'accroche :',
      'FIRST POST IDEA:': 'IDÉE DE PREMIER POST :',
      'Risk to Avoid:': 'Risque à éviter :',
      'Next Step:': 'Étape suivante :',
      'Audience:': 'Public :',
      'Ton:': 'Ton :',
      'Climate opera offers a unique advantage over other climate art: it is multi-sensory, somatic, and creates complete narrative worlds rather than static warnings.': 'L\'opéra climatique offre un avantage unique par rapport aux autres arts climatiques : il est multisensoriel, somatique et crée des mondes narratifs complets plutôt que des avertissements statiques.'
    },
    'German': {
      'Strongest Directions': 'Stärkste Richtungen',
      'Sharp Hooks': 'Scharfe Hooks',
      'Thought Leadership Angles': 'Thought-Leadership-Perspektiven',
      'Educational Angles': 'Bildungsperspektiven',
      'Emotional or Reflective Angles': 'Emotionale oder reflektierende Perspektiven',
      'Storytelling Angles': 'Storytelling-Perspektiven',
      'Promotional Angles': 'Werbliche Perspektiven',
      'Campaign-Series Ideas': 'Kampagnen-Serien-Ideen',
      'Experimental Ideas': 'Experimentelle Ideen',
      'Visceral bypass vs intellectual distance for:': 'Viszeraler Bypass vs. intellektuelle Distanz für:',
      'Provocative entry points for:': 'Provokante Einstiegspunkte für:',
      'Strategic thesis on:': 'Strategische These zu:',
      'Demystifying the mechanics behind:': 'Entmystifizierung der Mechanismen hinter:',
      'Somatic memory and resonance of:': 'Somatisches Gedächtnis und Resonanz von:',
      'Staging the transformation of:': 'Inszenierung der Transformation von:',
      'Action pathway: Engaging supporters for:': 'Aktionspfad: Unterstützer gewinnen für:',
      'Multi-part cycle: Deep dive into:': 'Mehrteiliger Zyklus: Deep Dive in:',
      'Unusual creative framing for:': 'Ungewöhnliches kreatives Framing für:',
      'Why it works:': 'Warum es funktioniert:',
      'Hook idea:': 'Hook-Idee:',
      'FIRST POST IDEA:': 'IDEE FÜR DEN ERSTEN BEITRAG:',
      'Risk to Avoid:': 'Zu vermeidendes Risiko:',
      'Next Step:': 'Nächster Schritt:',
      'Audience:': 'Zielgruppe:',
      'Tone:': 'Ton:',
      'Climate opera offers a unique advantage over other climate art: it is multi-sensory, somatic, and creates complete narrative worlds rather than static warnings.': 'Die Klimaoper bietet einen einzigartigen Vorteil gegenüber anderer Klimakunst: Sie ist multisensorisch, somatisch und schafft vollständige Erzählwelten anstelle statischer Warnungen.'
    }
  };

  const translateText = (text: string, lang: string): string => {
    if (!text || !lang || lang === 'English') return text;
    const dict = TRANSLATIONS[lang];
    if (dict) {
      let result = text;
      const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
      for (const key of sortedKeys) {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        result = result.replace(regex, dict[key]);
      }
      return result;
    }

    // Generic fallback for other commonly used languages
    const genericLabels: Record<string, Record<string, string>> = {
      'Arabic': {
        'Strongest Directions': 'أقوى الاتجاهات',
        'Sharp Hooks': 'خطافات حادة',
        'Thought Leadership Angles': 'زوايا ريادة الفكر',
        'Educational Angles': 'زوايا تعليمية',
        'Emotional or Reflective Angles': 'زوايا عاطفية أو تأملية',
        'Storytelling Angles': 'زوايا سرد القصص',
        'Promotional Angles': 'زوايا ترويجية',
        'Campaign-Series Ideas': 'أفكار حملة سلسلة',
        'Experimental Ideas': 'أفكار تجريبية',
        'Why it works:': 'لماذا يعمل:',
        'Hook idea:': 'فكرة الجذب:',
        'FIRST POST IDEA:': 'فكرة المنشور الأول:',
        'Risk to Avoid:': 'المخاطر التي يجب تجنبها:',
        'Next Step:': 'الخطوة التالية:',
        'Audience:': 'الجمهور:',
        'Tone:': 'النبرة:',
        'Visceral bypass vs intellectual distance for:': 'تجاوز حسي مقابل مسافة فكرية لـ:'
      },
      'Chinese': {
        'Strongest Directions': '最具潜力方向',
        'Sharp Hooks': '引人入胜的切入点',
        'Thought Leadership Angles': '思想领导力视角',
        'Educational Angles': '教育启发视角',
        'Emotional or Reflective Angles': '情感与反思视角',
        'Storytelling Angles': '故事讲述视角',
        'Promotional Angles': '推广活动视角',
        'Campaign-Series Ideas': '系列专题创意',
        'Experimental Ideas': '前沿实验创意',
        'Why it works:': '为何有效：',
        'Hook idea:': '吸引点子：',
        'FIRST POST IDEA:': '首发推文创意：',
        'Risk to Avoid:': '避坑指南：',
        'Next Step:': '下一步动作：',
        'Audience:': '受众：',
        'Tone:': '语调：',
        'Visceral bypass vs intellectual distance for:': '直觉超越与智力距离：'
      },
      'Japanese': {
        'Strongest Directions': '最も有望な方向性',
        'Sharp Hooks': '鋭いフック',
        'Thought Leadership Angles': 'ソートリーダーシップの視点',
        'Educational Angles': '教育的な視点',
        'Emotional or Reflective Angles': '感情的・反射的な視点',
        'Storytelling Angles': 'ストーリーテリングの視点',
        'Promotional Angles': 'プロモーションの視点',
        'Campaign-Series Ideas': 'キャンペーン・シリーズのアイデア',
        'Experimental Ideas': '実験的なアイデア',
        'Why it works:': '効果的な理由：',
        'Hook idea:': 'フックのアイデア：',
        'FIRST POST IDEA:': '最初の投稿案：',
        'Risk to Avoid:': '避けるべきリスク：',
        'Next Step:': '次のステップ：',
        'Audience:': 'ターゲット層：',
        'Tone:': 'トーン：',
        'Visceral bypass vs intellectual distance for:': '直感的バイパス対知的距離：'
      }
    };

    const labels = genericLabels[lang];
    if (labels) {
      let result = text;
      for (const key of Object.keys(labels)) {
        const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp(escapedKey, 'g');
        result = result.replace(regex, labels[key]);
      }
      return result;
    }

    return `[${lang}] ${text}`;
  };

  const getLanguageNotice = (lang: string): string | null => {
    if (lang === 'English') return null;
    return `LANG_NOTICE::${lang}::This draft was generated fully in ${lang}. Review proper names (e.g. Climate Opera Haus) before export.`;
  };

  // --- Visual Design Brief Generator ---
  const generateVisualDesignBrief = (channel: string, format: string, goal: string, text: string) => {
    const isCarousel = format === 'Carousel';
    const isLinkedIn = channel === 'LinkedIn';
    const isWebsite = channel === 'Website' || format.includes('Article');
    const isSponsorOrPartner = format.includes('Sponsor') || format.includes('Partner') || channel === 'Email / Direct Outreach';

    let brief = '';

    if (isCarousel) {
      brief = `### Visual Design Brief: Instagram Carousel
- **Visual Concept**: A step-by-step modular narrative with dark blue base colors and gold line frames.
- **Format Recommendation**: 1080x1080px square slides (6-slide sequence).
- **Mood / Atmosphere**: Somatic stage lighting, quiet and premium.
- **Composition**: Centered bold text with minimal abstract lines representing environmental indicators.
- **Color / Material**: Deep ocean blue (#0C1B2A), warm brushed gold (#D4AF37).
- **Typography / Layout**: Large serif headers (e.g., Playfair or Outfit), light sans-serif captions.
- **Key Visual Elements**: Symmetrical line frame, COH logo watermark.
- **What to Avoid**: Overly busy graphics, bright green leaf cliparts, or generic stock images.
- **AI Image Prompt**: "Minimalist operatic stage setup, deep navy backlighting, thin gold geometric circles, luxury photography, highly detailed, 8k --ar 1:1"
- **Designer Notes**: Ensure copy has enough breathing room.

**Slide-by-Slide Visual Guidance:**
1. **Slide 1**: Title slide. Cover text with gold geometric border. Prompt: Dark blue minimalist abstract background with warm gold spotlight.
2. **Slide 2**: Headline: Lived Condition. Visual: Soft wave design representing sea index.
3. **Slide 3**: Headline: Staging indicators. Visual: Stage composition mockup under low light.
4. **Slide 4**: Headline: Durability. Visual: Stone or metal textures intersecting with gold.
5. **Slide 5**: Headline: Partnership value. Visual: Clean institutional layout with logos placeholder.
6. **Slide 6**: Call to Action. Visual: Elegant plain slide with the website URL centered.`;
    } else if (isLinkedIn) {
      brief = `### Visual Design Brief: LinkedIn Post
- **Visual Concept**: Clean quote card or editorial executive layout.
- **Format Recommendation**: Text post with single high-resolution quote card graphic (1200x1200px).
- **Mood / Atmosphere**: Professional, sober, institutional.
- **Composition**: Text-heavy quote box layout with wide borders and clean padding.
- **Color / Material**: Light warm cream background (#FAF9F6) with navy blue serif text (#0C1B2A).
- **Typography / Layout**: Serif display quote text, small sans-serif nameplate.
- **Key Visual Elements**: Symmetrical line frame, COH logo watermark.
- **What to Avoid**: Generic business handshakes, cartoon icons, or decorative green elements.
- **AI Image Prompt**: "Professional corporate editorial portrait, soft office natural lighting, moody stage style, neutral colors --ar 1:1"
- **Designer Notes**: The post performs best as a text-only card or with an authentic production image.`;
    } else if (isWebsite) {
      brief = `### Visual Design Brief: Website / News Article
- **Visual Concept**: Hero image and editorial grid layout.
- **Format Recommendation**: Wide banner (1920x1080px) for hero, vertical column layout for text.
- **Mood / Atmosphere**: Serious, artistic, authoritative.
- **Composition**: Rule of thirds, wide panoramic landscape containing abstract environmental indices.
- **Color / Material**: Rich cobalt blue, raw stone grey, and gold accents.
- **Typography / Layout**: Large editorial serif H1, regular readable serif body text.
- **Key Visual Elements**: High-contrast stage design photography.
- **What to Avoid**: Stock photos of wind turbines or generic solar panels.
- **AI Image Prompt**: "Artistic stage scenery, abstract metal sculpture, dark moody theater environment, cinematic smoke, gold highlight --ar 16:9"
- **Designer Notes**: The hero header should match the sober color palette of the main web index.`;
    } else if (isSponsorOrPartner) {
      brief = `### Visual Design Brief: Sponsor & Partner Communications
- **Visual Concept**: Sober deck-style visual or letterhead layout.
- **Format Recommendation**: Restrained, corporate-standard presentation slide format (16:9).
- **Mood / Atmosphere**: High-prestige, institutional, highly credible.
- **Composition**: Asymmetric grid with 60% text copy and 40% clean whitespace.
- **Color / Material**: Royal navy blue background with crisp gold font.
- **Typography / Layout**: Formal serif typography, clear column hierarchy.
- **Key Visual Elements**: Minimalist logos and project indicators.
- **What to Avoid**: Decorative climate campaigns, green handprints, or emotional NGO messaging.
- **AI Image Prompt**: "Luxury corporate deck design background, dark navy blue, clean gold line accents, professional, architectural render style --ar 16:9"
- **Designer Notes**: Focus purely on corporate credibility. Avoid decorative climate imagery unless directly supported by scientific facts.`;
    } else {
      brief = `### Visual Design Brief: General / Custom
- **Visual Concept**: Multi-channel social graphic matching "${goal || 'COH'}" topic.
- **Format Recommendation**: Standard square post format (1080x1080px).
- **Mood / Atmosphere**: Prestige backlighting, navy stage contrast.
- **Composition**: Balanced central focus with ample whitespace.
- **Color / Material**: Navy blue background, gold serif typeface.
- **Typography / Layout**: Serif display heading, sans-serif body.
- **Key Visual Elements**: Minimalist geometric shapes representing wind or water.
- **What to Avoid**: Complex illustrations or busy infographics.
- **AI Image Prompt**: "Prestige theater backdrop, dark navy blue and gold accents, minimalist stage design, warm theatrical light --ar 1:1"
- **Designer Notes**: Tailor text hierarchy to preserve readability.`;
    }

    return brief;
  };


  // ─────────────────────────────────────────────────────────────────
  // GENERATION ENGINE v2
  // Hierarchy: brief → notes → sources → channel+format → Operating Core active
  // Operating Core active is a guardrail / fact boundary, NOT the content itself.
  // ─────────────────────────────────────────────────────────────────

  /** Step 1 — Extract creation intent and classify user input type */
  const interpretCreationIntent = (
    input: string,
    notes: string,
    explicitIntent: string = 'Infer automatically',
    audience: string = 'General Public',
    purpose: string = 'Thought Leadership',
    format: string = 'Post'
  ) => {
    const raw = (input + ' ' + notes).trim();
    const rawLower = raw.toLowerCase();

    // Classification mapping
    let classifiedType = 'Topic to explore';
    
    if (explicitIntent && explicitIntent !== 'Infer automatically') {
      switch (explicitIntent) {
        case 'Answer a question': classifiedType = 'Question to answer'; break;
        case 'Explain an idea': classifiedType = 'Educational explanation'; break;
        case 'Develop an argument': classifiedType = 'Argument to defend'; break;
        case 'Create awareness': classifiedType = 'Topic to explore'; break;
        case 'Promote an action': classifiedType = 'Promotional request'; break;
        case 'Educate the audience': classifiedType = 'Educational explanation'; break;
        case 'Compare perspectives': classifiedType = 'Comparison'; break;
        case 'Build emotional connection': classifiedType = 'Emotional hook'; break;
        case 'Announce something': classifiedType = 'Brand announcement'; break;
        case 'Generate story ideas': classifiedType = 'Story angle'; break;
        case 'Create a direct message': classifiedType = 'Message to communicate'; break;
        case 'Create a campaign angle': classifiedType = 'Campaign concept'; break;
        default: classifiedType = 'Topic to explore'; break;
      }
    } else {
      // Auto inference rules
      if (raw.endsWith('?') || /^(why|how|what|who|where|when|which|is|are|can|do|does|should|would)\b/i.test(raw)) {
        classifiedType = 'Question to answer';
      } else if (/compare|vs|versus|alternative|difference|comparison|superior|better|worse/i.test(rawLower)) {
        classifiedType = 'Comparison';
      } else if (/invite|reserve|ticket|attend|join|register|book|buy|seat|performance|come to/i.test(rawLower)) {
        classifiedType = 'Promotional request';
      } else if (/announce|introducing|launch|new|reveal|debut|available|now open/i.test(rawLower)) {
        classifiedType = 'Brand announcement';
      } else if (/should|must|ought|superior|important|essential|crucial|art is|art can|why art|because/i.test(rawLower)) {
        classifiedType = 'Argument to defend';
      } else if (/message|letter|dear|write to|recipient|send note|email/i.test(rawLower)) {
        classifiedType = 'Message to communicate';
      } else if (/grief|sorrow|feel|emotion|visceral|heart|somatic|memory|human connection|touch/i.test(rawLower)) {
        classifiedType = 'Emotional hook';
      } else if (/reflect|think|ponder|contemplate|thought|mind/i.test(rawLower)) {
        classifiedType = 'Reflection';
      } else if (raw.split(/\s+/).length > 20) {
        classifiedType = 'Idea to expand';
      }
    }

    // Identify focus area
    const isMessage = classifiedType === 'Message to communicate' || /message|letter|write to/i.test(rawLower);
    const isSponsor = /sponsor|patron|funding|invest|support us/i.test(rawLower) || format === 'Sponsor Pitch Paragraph';
    const isPartner = /partner|collaboration|collab|work together/i.test(rawLower) || format === 'Partner Note';
    const isEvent = /event|concert|festival|performance|resonance/i.test(rawLower);
    const isDiplomatic = /un\b|united nations|secretary|minister|government|official/i.test(rawLower);
    
    // Only reference COH centrally if explicitly mentioned in the brief
    let cohReferenceLevel: 'central' | 'secondary' | 'light' = 'central';
    if (!rawLower.includes('coh') && !rawLower.includes('opera haus') && !rawLower.includes('climate opera')) {
      if (classifiedType === 'Question to answer' || classifiedType === 'Comparison' || classifiedType === 'Educational explanation' || classifiedType === 'Argument to defend') {
        cohReferenceLevel = 'light';
      } else {
        cohReferenceLevel = 'secondary';
      }
    }

    let strategy = 'explain';
    if (classifiedType === 'Question to answer') strategy = 'answer';
    else if (classifiedType === 'Argument to defend' || classifiedType === 'Comparison') strategy = 'persuade';
    else if (classifiedType === 'Emotional hook' || classifiedType === 'Reflection') strategy = 'inspire';
    else if (classifiedType === 'Promotional request') strategy = 'promote';

    const hasLowContext = raw.length < 40;

    let missingContextNote = '';
    if (isDiplomatic && !rawLower.includes('ask')) {
      missingContextNote = 'Adding a specific ask or delivery context would improve this diplomatic message.';
    } else if (isSponsor && hasLowContext) {
      missingContextNote = 'Sponsor pitches benefit from specifying the value alignment or performance tier.';
    } else if (hasLowContext) {
      missingContextNote = 'More specific details in notes would improve the output quality.';
    }

    return {
      classifiedType,
      cohReferenceLevel,
      strategy,
      isDiplomatic,
      isSponsor,
      isPartner,
      isEvent,
      isMessage,
      isInternal: format.toLowerCase().includes('internal') || purpose.toLowerCase().includes('internal'),
      missingContextNote,
      hasLowContext,
      subject: input.trim(),
      commType: classifiedType
    };
  };

  /** Wrapper for compatibility with older code paths */
  const interpretBrief = (goal: string, notes: string, audience: string, purpose: string, format: string, explicitIntent = 'Infer automatically') => {
    return interpretCreationIntent(goal, notes, explicitIntent, audience, purpose, format);
  };

  /** Step 2 — Build a content plan from the interpretation */
  const buildContentPlan = (
    interp: ReturnType<typeof interpretCreationIntent>,
    goal: string,
    notes: string,
    sources: SourceFile[],
    selectedSourceIds: string[],
    purpose: string,
    toneLevel: number,
    variationStyle: string,
    isAlternative: boolean,
    pillar: string = 'General / Custom',
    audience: string = 'General Public',
    directionMode: string = 'none'
  ) => {
    const sourceMaterial = selectedSourceIds
      .map(id => sources.find(s => s.id === id))
      .filter(Boolean)
      .map(s => s!.content)
      .join(' ');

    const rawInput = (goal + ' ' + notes).trim();
    const rawLower = rawInput.toLowerCase();

    const isGeneralPillar = pillar === 'General / Custom';
    const isGeneralPublic = audience === 'General Public';
    const isGeneralOpenPurpose = purpose === 'General / Open';
    const isDirectFraming = directionMode === 'none';

    let opening = '';
    let body = '';
    let proofPoints: string[] = [];
    let cta = '';

    const cleanJargon = (str: string) => {
      if (!isGeneralPublic) return str;
      return str
        .replace(/somatic stage/gi, 'live stage')
        .replace(/somatic/gi, 'physical')
        .replace(/repertoire-based climate canon/gi, 'collection of climate operas')
        .replace(/visceral soundscapes/gi, 'staged music')
        .replace(/ecological thresholds/gi, 'environmental limits')
        .replace(/origin staging assets/gi, 'original performances');
    };

    // A. DETERMINE OPENING (Direct Response to Intent)
    if (isDirectFraming) {
      opening = goal ? goal : (notes ? notes : 'Ecological storytelling through staged music.');
    } else if (interp.classifiedType === 'Question to answer') {
      if (rawLower.includes('superior')) {
        opening = `Climate opera offers a unique advantage over other climate art: it is multi-sensory, somatic, and creates complete narrative worlds rather than static warnings.`;
      } else {
        opening = `To answer how art impacts climate response, we must look at the medium: performance bypasses intellectual resistance to create an immediate, felt experience.`;
      }
    } else if (interp.classifiedType === 'Comparison') {
      opening = `While traditional climate communication relies on data and policy graphs, climate opera translates these ecological thresholds into live, visceral soundscapes.`;
    } else if (interp.classifiedType === 'Emotional hook' || interp.classifiedType === 'Reflection') {
      if (rawLower.includes('grief')) {
        opening = `Planetary change is not just a scientific metric; it is a shared human sorrow. Art holds the power to make climate grief visible, giving form to what we fear to name.`;
      } else {
        opening = `Before we can act on ecological transition, we must allow ourselves to feel the weight of what is at stake.`;
      }
    } else if (interp.classifiedType === 'Promotional request' || interp.classifiedType === 'Call to action') {
      if (rawLower.includes('reserve') || rawLower.includes('ticket')) {
        opening = `We invite you to reserve your tickets for our next performance and experience these ecological worlds live on stage.`;
      } else {
        opening = `Join us for the next performance as we translate planetary indices into somatic stage designs.`;
      }
    } else if (interp.classifiedType === 'Argument to defend') {
      if (rawLower.includes('faster than policy') || rawLower.includes('music')) {
        opening = `Music reaches the human heart long before policy papers reach the legislative floor. It speaks in a language of resonance, not negotiation.`;
      } else {
        opening = `Art is not merely decorative in the climate transition; it is the cultural infrastructure that makes change imaginable.`;
      }
    } else if (interp.classifiedType === 'Brand announcement') {
      opening = `We are pleased to announce the upcoming performance schedule, presenting live opera as a response to the climate transition.`;
    } else {
      opening = `The climate transition is a cultural challenge, requiring artistic frameworks that treat ecological thresholds as lived conditions.`;
    }

    // B. DEVELOP PROOF POINTS & BODY
    if (isDirectFraming) {
      proofPoints = [
        notes || 'Drafting copy directly responding to the topic notes provided.',
        'Analyzing key details to present them clearly and effectively.'
      ];
    } else if (interp.classifiedType === 'Question to answer' || interp.classifiedType === 'Comparison') {
      proofPoints = [
        `Where policy papers outline metrics, staged performance renders thresholds somatically.`,
        `By treating climate as a lived condition, opera bypasses cognitive fatigue and builds long-term cultural resonance.`
      ];
    } else if (interp.classifiedType === 'Emotional hook' || interp.classifiedType === 'Reflection') {
      proofPoints = [
        `Opera integrates voice, light, and movement to mirror the complexity of our changing ecosystems.`,
        `Through these temporary, shared spaces, we process the grief of planetary loss and find collective capacity to imagine new futures.`
      ];
    } else if (interp.classifiedType === 'Promotional request') {
      proofPoints = [
        `Experience Soria Moria or our wider Climate Tetralogy staged live.`,
        `Secure your place to witness the intersection of scientific data and operatic composition.`
      ];
    } else if (interp.classifiedType === 'Argument to defend') {
      proofPoints = [
        `Policy shapes the rules of transition, but culture shapes the desires and wills that drive it.`,
        `Through the Climate Tetralogy, we ground scientific truth in visceral staging.`
      ];
    } else {
      proofPoints = [
        `Opera serves as the origin asset, establishing prestige worlds that scale into filmed media.`,
        `This repertoire-based canon ensures durable cultural IP for institutions and sponsors.`
      ];
    }

    // Only introduce COH explicitly if relevant or requested
    if (!isGeneralPillar) {
      if (interp.cohReferenceLevel === 'central') {
        proofPoints.push(`This is the core design methodology behind the work of Climate Opera Haus.`);
      } else if (interp.cohReferenceLevel === 'secondary') {
        proofPoints.push(`This approach guides how Climate Opera Haus structures the Climate Tetralogy.`);
      }
    }

    body = proofPoints.map(cleanJargon).join(' ');
    opening = cleanJargon(opening);

    // C. DETERMINE CTA
    const isSponsorTarget = purpose === 'Sponsor Interest' || purpose === 'Funding Support';
    if (isDirectFraming) {
      cta = 'Read the full brief online.';
    } else if (interp.classifiedType === 'Promotional request' || interp.classifiedType === 'Call to action') {
      cta = `Reserve your tickets now.`;
    } else if (isSponsorTarget) {
      cta = `We welcome strategic patrons to partner with us in building this durable canon.`;
    } else if (interp.isDiplomatic) {
      cta = `We welcome further dialogue on integrating cultural engines into climate strategy.`;
    } else {
      cta = `Explore the repertoire-based canon at Climate Opera Haus.`;
    }

    cta = cleanJargon(cta);

    // Variation style overrides
    if (variationStyle === 'More direct') {
      opening = opening.split(',')[0] + '.';
      cta = 'Learn more.';
    } else if (variationStyle === 'More human') {
      opening = `The conversation around climate is often cold and dry. We need a language that feels human.`;
    } else if (variationStyle === 'More sponsor-facing') {
      cta = `Partner with us to support the Climate Tetralogy.`;
    }

    // Dev debug log
    if (window.location.hostname === 'localhost') {
      console.group('[COH Content Studio] Generation Debug');
      console.log('Classified Intent Type:', interp.classifiedType);
      console.log('COH Reference Level:', interp.cohReferenceLevel);
      console.log('Strategy:', interp.strategy);
      console.log('Opening:', opening);
      console.log('Proof Points:', proofPoints);
      console.log('CTA:', cta);
      console.groupEnd();
    }

    return { opening, body, proofPoints, cta, toneNote: 'Measured and credible.', allContext: rawInput };
  };

  // ─────────────────────────────────────────────────────────────────
  // CHANNEL + FORMAT RENDERERS
  // Each renderer returns final ready-to-publish copy.
  // No "In focus:", no "Regarding the topic of:", no raw topic quoting.
  // ─────────────────────────────────────────────────────────────────
  const renderLinkedInPost = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>, toneLevel: number) => {
    const { opening, proofPoints, cta } = plan;
    const pp = proofPoints[0] || '';
    const pp2 = proofPoints[1] || '';
    const closer = cta ? `\n\n${cta}` : '';
    if (toneLevel <= 2) {
      return `${opening}\n\n${pp}${pp2 ? '\n\n' + pp2 : ''}${closer}`;
    }
    return `${opening}\n\n${pp}${pp2 ? '\n\n' + pp2 : ''}${closer}`;
  };

  const renderInstagramCaption = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>) => {
    const { opening, proofPoints } = plan;
    const short = proofPoints[0] ? proofPoints[0].split('.')[0] : '';
    return `${opening}${short ? '\n\n' + short + '.' : ''}`;
  };

  const renderInstagramCarousel = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>, goal: string, lengthOpt: string) => {
    const slideCount = lengthOpt.includes('Short') ? 5 : lengthOpt.includes('Extended') ? 8 : 6;
    const { opening, proofPoints, cta } = plan;
    let out = `[Slide 1 — Cover]\n${opening}\n\n`;
    for (let i = 2; i <= slideCount - 1; i++) {
      const pp = proofPoints[i - 2] || proofPoints[0];
      out += `[Slide ${i}]\n${pp}\n\n`;
    }
    out += `[Slide ${slideCount} — Close]\n${cta || 'Follow our work.'}\n\n`;
    out += `[Caption]\n${opening}`;
    return out;
  };

  const renderTikTokCaption = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>) => {
    const { opening } = plan;
    // Short, hook-oriented — strip to single punchy sentence
    return opening.split('.')[0] + '.';
  };

  const renderTikTokScript = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>) => {
    const { opening, proofPoints, cta } = plan;
    return `[Hook]\n${opening.split('.')[0]}.\n\n[Beat 1]\n${proofPoints[0] || ''}\n\n[Beat 2]\n${proofPoints[1] || proofPoints[0] || ''}\n\n[Close]\n${cta || 'Find us at Climate Opera Haus.'}\n\n[Visual cue: Dark blue stage, gold text overlay]`;
  };

  const renderFacebookPost = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>) => {
    const { opening, proofPoints, cta } = plan;
    // Warmer, more community-facing than LinkedIn — allow longer bridging sentences
    const pp = proofPoints[0] || '';
    const pp2 = proofPoints[1] || '';
    return `${opening}\n\n${pp}${pp2 ? ' ' + pp2 : ''}${cta ? '\n\n' + cta : ''}`;
  };

  const renderXPost = (plan: ReturnType<typeof buildContentPlan>) => {
    const { opening } = plan;
    return opening.split('.').slice(0, 2).join('.').substring(0, 280) + '.';
  };

  const renderXThread = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>) => {
    const { opening, proofPoints, cta } = plan;
    let thread = `1/ ${opening}\n\n`;
    proofPoints.forEach((pp, i) => { thread += `${i + 2}/ ${pp}\n\n`; });
    if (cta) thread += `${proofPoints.length + 2}/ ${cta}`;
    return thread;
  };

  const renderNewsletterSection = (plan: ReturnType<typeof buildContentPlan>, goal: string) => {
    const { opening, proofPoints, cta } = plan;
    const headline = goal.trim() ? goal.trim() : 'Climate Canon Update';
    return `[Section Headline: ${headline}]\n\n${opening}\n\n${proofPoints.join(' ')}${cta ? '\n\n' + cta : ''}`;
  };

  const renderNewsletterLongForm = (plan: ReturnType<typeof buildContentPlan>, goal: string) => {
    const { opening, proofPoints, cta } = plan;
    const headline = goal.trim() ? goal.trim() : 'Climate Opera Haus: Building the Canon';
    return `[Headline: ${headline}]\n\n${opening}\n\n${proofPoints[0] || ''}\n\n${proofPoints[1] || proofPoints[0] || ''}\n\n[Closing]\n${proofPoints[proofPoints.length - 1] || ''} ${cta || ''}`;
  };

  const renderWebsiteArticle = (plan: ReturnType<typeof buildContentPlan>, goal: string) => {
    const { opening, proofPoints, cta } = plan;
    const headline = goal.trim() ? goal.trim() : 'Climate Opera Haus';
    return `[Headline: ${headline}]\n\n[Intro]\n${opening}\n\n[Body]\n${proofPoints.join('\n\n')}\n\n[Close]\n${cta || ''}`;
  };

  const renderEmailLetter = (plan: ReturnType<typeof buildContentPlan>, interp: ReturnType<typeof interpretBrief>, goal: string) => {
    const { opening, proofPoints, cta } = plan;
    const subjectLine = goal.trim() ? goal.trim() : 'Climate Opera Haus — Message from the Team';
    const greeting = interp.isDiplomatic ? 'Dear Secretary-General,' : interp.isSponsor ? 'Dear Partner,' : 'Dear Colleague,';
    const sign = 'With regards,\nClimate Opera Haus';
    return `Subject: ${subjectLine}\n\n${greeting}\n\n${opening}\n\n${proofPoints.join('\n\n')}${cta ? '\n\n' + cta : ''}\n\n${sign}`;
  };

  const renderSponsorPitch = (plan: ReturnType<typeof buildContentPlan>) => {
    const { opening, proofPoints, cta } = plan;
    return `${opening} ${proofPoints[0] || ''} ${proofPoints[1] || ''}${cta ? ' ' + cta : ''}`.trim();
  };

  const renderPartnerNote = (plan: ReturnType<typeof buildContentPlan>, goal: string) => {
    const { opening, proofPoints, cta } = plan;
    return `Partner Note\n\n${opening}\n\n${proofPoints.join(' ')}${cta ? '\n\n' + cta : ''}\n\nNext steps: We look forward to aligning on specifics.`;
  };

  const renderInternalUpdate = (plan: ReturnType<typeof buildContentPlan>, goal: string) => {
    const { proofPoints, cta } = plan;
    return `Internal Update\n\nFocus: ${goal || 'Current sprint'}\n\n${proofPoints.join('\n')}\n\nAction required: ${cta || 'Review and confirm next steps.'}`;
  };

  const renderInvitationNote = (plan: ReturnType<typeof buildContentPlan>, goal: string) => {
    const { opening, proofPoints, cta } = plan;
    return `Invitation\n\n${opening}\n\n${proofPoints[0] || ''}\n\n${cta || 'We hope you will join us.'}`;
  };

  // ─────────────────────────────────────────────────────────────────
  // MAIN GENERATION FUNCTION — now routes through channel renderers
  // ─────────────────────────────────────────────────────────────────

  const generateStructuredDraft = (
    channel: string,
    format: string,
    goal: string,
    notes: string,
    directionMode: string,
    customDir: string,
    lengthOpt: string,
    customLength: string,
    toneLevel: number,
    audience: string,
    customAudience: string,
    purpose: string,
    pillar: string,
    isAlternative = false,
    variationStyle = 'default',
    explicitIntent = 'Infer automatically'
  ) => {
    const isSoriaMoriaRelevant = checkOperaRelevance('Soria Moria');
    const isGoldenFountainRelevant = checkOperaRelevance('The Golden Fountain');
    const isWaterDragonRelevant = checkOperaRelevance('The Water Dragon');
    const isRoarToWindRelevant = checkOperaRelevance('Roar to the Wind');
    const relevantOperas: string[] = [];
    if (isSoriaMoriaRelevant) relevantOperas.push('Soria Moria');
    if (isGoldenFountainRelevant) relevantOperas.push('The Golden Fountain');
    if (isWaterDragonRelevant) relevantOperas.push('The Water Dragon');
    if (isRoarToWindRelevant) relevantOperas.push('Roar to the Wind');

    // Step 1: Interpret the brief
    const interp = interpretBrief(goal, notes, audience, purpose, format, explicitIntent);

    // Step 2: Build content plan
    const plan = buildContentPlan(
      interp, goal, notes, sources,
      creationMode === 'advanced' ? advancedBrief.selectedSourceIds : [],
      purpose, toneLevel, variationStyle, isAlternative,
      pillar, audience, directionMode
    );

    // Add relevant opera references to proof points if detected
    if (relevantOperas.length > 0 && !plan.proofPoints.some(p => p.includes('Tetralogy') || p.includes('Soria'))) {
      plan.proofPoints.push(`This work is grounded in our Climate Tetralogy: ${relevantOperas.join(', ')}.`);
    }

    // Step 3: Route to channel-specific renderer
    const ch = channel.toLowerCase();
    const fmt = format.toLowerCase();

    if (window.location.hostname === 'localhost') {
      console.log(`[Renderer] channel="${channel}" format="${format}" commType="${interp.commType}" variation="${variationStyle}" isAlt=${isAlternative}`);
    }

    // Email / Direct Outreach
    if (ch.includes('whatsapp') || fmt === 'whatsapp message') {
      return `Write a short, conversational WhatsApp message based on the following:
Plan: ${plan.opening} ${plan.body} ${plan.cta}
Goal: ${goal}
Constraints: No subject line, no formal greetings like "Dear", no hashtags, no corporate jargon. Keep it 1-3 short paragraphs. End with a natural, conversational CTA.`;
    }
    
    if (fmt === 'email / letter') return renderEmailLetter(plan, interp, goal);
    if (fmt === 'sponsor pitch paragraph') return renderSponsorPitch(plan);
    if (fmt === 'partner note') return renderPartnerNote(plan, goal);
    if (fmt === 'follow-up note') return renderPartnerNote(plan, goal);
    if (fmt === 'invitation note') return renderInvitationNote(plan, goal);

    // Internal
    if (fmt === 'internal update' || fmt === 'action summary' || interp.isInternal) return renderInternalUpdate(plan, goal);

    // Newsletter
    if (fmt === 'newsletter section' || fmt === 'event update' || fmt === 'partner update') return renderNewsletterSection(plan, goal);
    if (fmt === 'long-form article' && (ch.includes('newsletter') || ch.includes('website'))) return renderNewsletterLongForm(plan, goal);

    // Website
    if (fmt === 'website section' || fmt === 'news / media article' || fmt === 'event page copy') return renderWebsiteArticle(plan, goal);

    // Carousel (LinkedIn or Instagram)
    if (fmt === 'carousel') return renderInstagramCarousel(plan, interp, goal, lengthOpt);

    // Visual Designer Brief
    if (fmt === 'visual designer brief') {
      return `[Visual Designer Brief]\nFormat: Clean, sober layout\nMood: Prestige backlighting, navy stage contrast\nSubject: ${goal || 'Climate Opera Haus'}\nPrompt: Dark blue stage, gold metallic frame, minimalist geometry representing wind or tides.`;
    }

    // TikTok
    if (ch.includes('tiktok')) {
      if (fmt === 'short video script') return renderTikTokScript(plan, interp);
      return renderTikTokCaption(plan, interp); // Caption, Hook Ideas
    }

    // X / Twitter
    if (ch.includes('x /') || ch.includes('twitter')) {
      if (fmt === 'thread') return renderXThread(plan, interp);
      return renderXPost(plan); // Post, Short Announcement
    }

    // Facebook
    if (ch.includes('facebook')) return renderFacebookPost(plan, interp);

    // Instagram
    if (ch.includes('instagram')) {
      if (fmt === 'carousel') return renderInstagramCarousel(plan, interp, goal, lengthOpt);
      if (fmt === 'reel caption') return renderTikTokCaption(plan, interp);
      if (fmt === 'story sequence') {
        const { opening, proofPoints, cta } = plan;
        return `[Story 1]\n${opening.split('.')[0]}.\n\n[Story 2]\n${proofPoints[0]?.split('.')[0] || ''}.\n\n[Story 3]\n${cta || 'Follow for more.'}`;
      }
      return renderInstagramCaption(plan, interp);
    }

    // Snapchat
    if (ch.includes('snapchat')) return renderTikTokCaption(plan, interp);

    // YouTube
    if (ch.includes('youtube')) {
      const { opening, proofPoints, cta } = plan;
      if (fmt === 'short video script') return renderTikTokScript(plan, interp);
      return `[Video Title: ${goal || 'Climate Opera Haus'}]\n\n[Description]\n${opening}\n\n${proofPoints.join('\n\n')}${cta ? '\n\n' + cta : ''}\n\n[Tags: Climate Opera Haus, Climate Tetralogy, Live Opera]`;
    }

    // LinkedIn — default for most institutional formats
    if (fmt === 'thought piece' || fmt === 'executive note') {
      const { opening, proofPoints, cta } = plan;
      return `${opening}\n\n${proofPoints.join('\n\n')}${cta ? '\n\n' + cta : ''}`;
    }

    // LinkedIn Post — and catch-all for Post on any channel
    return renderLinkedInPost(plan, interp, toneLevel);
  };



  // --- Fact Boundary Verification Scanners ---
  const getFictionalContentWarnings = (text: string) => {
    const warnings: string[] = [];
    if (!text) return warnings;

    const bannedFictional = [
      'Venice', 'Venetian', 'Lagoon', 'Svalbard', 'Acqua Alta', 'Kongsfjorden', 
      'Rialto', 'November', 'Rising Tide', 'Tidal Aria', 'Tidal Opera',
      'Venice Tidal Aria', 'Venice Tidal Opera'
    ];
    
    bannedFictional.forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(text)) {
        warnings.push(`Fictional/Unapproved entity: "${term}". This is not allowed in COH fact boundary.`);
      }
    });

    const approvedEntities = [
      'soria moria', 'the golden fountain', 'the water dragon', 'roar to the wind',
      'climate opera haus', 'coh', 'the climate tetralogy',
      'a cultural engine for climate transition', 'four operas. four worlds. one planet.',
      'climate as lived condition, not campaign theme', 'live opera as origin asset',
      'filmed content', 'documentary', 'sponsorship', 'licensing', 'institutional adoption',
      'cultural ip', 'air, fire, water, earth', 'climate-content and cultural-ip venture',
      'patron backing', 'licensing and institutional reuse', 'cultural durability',
      'repertoire-based climate canon'
    ];

    const contextTexts: string[] = [];
    const sourceIds = creationMode === 'advanced' ? advancedBrief.selectedSourceIds : [];
    sourceIds.forEach(id => {
      const src = sources.find(s => s.id === id);
      if (src) {
        contextTexts.push(src.title.toLowerCase());
        contextTexts.push(src.content.toLowerCase());
      }
    });

    const entitiesToCheck: string[] = [];

    // 1. Multi-word proper nouns (higher confidence, ignores single sentence-start words)
    const properNounPhrases = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
    entitiesToCheck.push(...properNounPhrases);

    // 2. Numbers, statistics, amounts, years
    const numbers = text.match(/\$?\b\d+(?:,\d{3})*(?:\.\d+)?(?:k|m|b|K|M|B|%| percent)?\b/g) || [];
    entitiesToCheck.push(...numbers);

    const commonSkips = [
      'the', 'this', 'that', 'these', 'those', 'yet', 'but', 'both', 'people', 'support', 'music'
    ];

    entitiesToCheck.forEach(entity => {
      const lowerEntity = entity.toLowerCase();
      
      // Skip common words
      if (commonSkips.includes(lowerEntity)) return;
      // Skip if it's just a number like 1, 2, 3 which might be generic
      if (/^\d$/.test(lowerEntity)) return;

      const isApproved = approvedEntities.some(e => e.includes(lowerEntity)) || approvedEntities.some(e => lowerEntity.includes(e));
      const inSources = contextTexts.some(ctx => ctx.includes(lowerEntity));
      
      if (!isApproved && !inSources) {
        warnings.push(`Check this reference: "${entity}"`);
      }
    });

    return Array.from(new Set(warnings));
  };

  // --- Editorial Check Audits ---
  const runEditorialAudits = (text: string) => {
    const checks = [
      {
        name: 'COH Specificity Check',
        desc: 'Detects presence of Climate Opera Haus or Tetralogy works.',
        pass: /(climate opera haus|coh|soria moria|golden fountain|water dragon|roar to the wind)/i.test(text),
        feedback: 'Add approved Tetralogy works or COH strategic anchors.',
        whyItMatters: 'If the draft lacks COH specific terms, it reads like generic arts content.',
        suggestedFix: 'Incorporate specific references to The Climate Tetralogy or Soria Moria.'
      },
      {
        name: 'First-Read Clarity Check',
        desc: 'Flags sentences written in passive voice.',
        pass: !/(is being|were selected|will be captured|was developed by)/i.test(text),
        feedback: 'Rewrite passive phrases.',
        whyItMatters: 'Active voice creates immediacy and professional authority.',
        suggestedFix: 'Replace "is developed by COH" with "COH develops".'
      },
      {
        name: 'NGO Jargon Scan',
        desc: 'Scan for corporate greenwashing words like sustainability, eco-friendly.',
        pass: !/(sustainability|greenwashing|eco-friendly|saving the planet|climate action now)/i.test(text),
        feedback: 'Reframe with brand-compliant terms: "ecological transition" or "durability".',
        whyItMatters: 'COH is an IP and content venture, not an activist pressure group.',
        suggestedFix: 'Swap "sustainability" for "cultural durability" or "ecological transition".'
      },
      {
        name: 'Factual Grounding Check',
        desc: 'Identifies unverified entities or dates.',
        pass: getFictionalContentWarnings(text).length === 0,
        feedback: `Source check needed: ${getFictionalContentWarnings(text).join(', ')}`,
        whyItMatters: 'Ensures strict alignment with the approved factual boundaries.',
        suggestedFix: 'Remove unverified entities or ensure they match uploaded text sources.'
      }
    ];

    const passCount = checks.filter(c => c.pass).length;
    let status: 'Ready' | 'Needs Revision' | 'High Risk' = 'Ready';
    if (passCount <= 1) status = 'High Risk';
    else if (passCount < checks.length) status = 'Needs Revision';

    return { checks, status, score: Math.round((passCount / checks.length) * 100) };
  };

  // --- Output Confidence Helper ---
  const getOutputConfidence = () => {
    const hasSource = creationMode === 'advanced' && advancedBrief.selectedSourceIds.length > 0;
    const warnings = getFictionalContentWarnings(activeDraftText);
    
    if (warnings.length > 0) return 'Needs confirmation';
    if (hasSource) return 'Source-backed';
    return 'Based on brief notes';
  };

  const handleSaveSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.title.trim()) return;

    if (editingSourceId) {
      setSources(sources.map(s => s.id === editingSourceId ? { ...s, ...newSource } : s));
      setEditingSourceId(null);
    } else {
      const added: SourceFile = {
        id: `src-${Date.now()}`,
        ...newSource,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setSources([added, ...sources]);
    }

    setNewSource({
      title: '',
      type: 'Other',
      status: 'Active',
      
      
      
      notes: '',
      content: ''
    });
  };

  const handleAddWorkspaceLink = () => {
    if (!inlineLinkData.title.trim() || !inlineLinkData.url.trim()) return;

    if (!inlineLinkData.summary.trim()) {
      setLinkWarning('URL added, but no excerpt or summary was provided. The system may not have enough context to use this source reliably.');
    } else {
      setLinkWarning('');
    }

    handleAddWorkspaceSource('link');
  };

  // --- Workspace Source Add Handler ---
  const handleAddWorkspaceSource = (mode: 'paste' | 'upload' | 'link') => {
    let newSrc: SourceFile | null = null;
    const ts = Date.now();

    if (mode === 'paste') {
      if (!inlinePasteData.title.trim() || !inlinePasteData.content.trim()) return;
      newSrc = {
        id: `ws-paste-${ts}`,
        title: inlinePasteData.title,
        type: 'Pasted Notes',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        notes: 'Pasted text source added from Content Workspace.',
        content: inlinePasteData.content
      };
      if (inlinePasteData.saveToLibrary) {
        setSources(prev => [newSrc!, ...prev]);
      }
      setInlinePasteData({ title: '', content: '', saveToLibrary: false });
    } else if (mode === 'upload') {
      if (!inlineUploadData.title.trim()) return;
      newSrc = {
        id: `ws-upload-${ts}`,
        title: inlineUploadData.title,
        type: 'Pasted Notes',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        notes: 'File uploaded from Content Workspace.',
        content: inlineUploadData.content || 'File content extracted.'
      };
      if (inlineUploadData.saveToLibrary) {
        setSources(prev => [newSrc!, ...prev]);
      }
      setInlineUploadData({ title: '', content: '', saveToLibrary: false });
    } else if (mode === 'link') {
      if (!inlineLinkData.title.trim() || !inlineLinkData.url.trim()) return;
      newSrc = {
        id: `ws-link-${ts}`,
        title: inlineLinkData.title,
        type: 'Pasted Notes',
        status: 'Active',
        createdAt: new Date().toISOString().split('T')[0],
        notes: `URL: ${inlineLinkData.url}`,
        content: inlineLinkData.summary || `[URL reference: ${inlineLinkData.url}]`
      };
      if (inlineLinkData.saveToLibrary) {
        setSources(prev => [newSrc!, ...prev]);
      }
      setInlineLinkData({ title: '', url: '', summary: '', saveToLibrary: false });
    }

    if (newSrc) {
      setWorkspaceLocalSources(prev => [newSrc!, ...prev]);
      setAdvancedBrief(prev => ({
        ...prev,
        selectedSourceIds: [...prev.selectedSourceIds, newSrc!.id]
      }));
    }
  };

  // --- Workspace File Upload Handler ---
  const handleWorkspaceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInlineUploadData({
        title: file.name,
        content: text || 'File content extracted.',
        saveToLibrary: inlineUploadData.saveToLibrary
      });
    };
    reader.readAsText(file);
  };

  // --- Generate Drafts Handler ---
  const handleGenerateDrafts = async () => {
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';

    const goal = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);
    const notes = isSimple ? '' : (isQuick ? quickBrief.notes : '');
    const mustInclude = isSimple ? '' : (isQuick ? quickBrief.mustInclude : advancedBrief.mustInclude);
    const hasSources = (creationMode === 'advanced' && advancedBrief.selectedSourceIds.length > 0) || (isSimple && (inlinePasteData.content || inlineLinkData.url || inlineUploadData.title));

    if (!goal.trim() && !notes.trim() && !mustInclude.trim() && !hasSources) {
      setValidationWarning('Add a topic, notes, source excerpt, or selected source before generating.');
      return;
    }
    setValidationWarning('');

    const scope = isSimple ? 'Single Channel' : (isQuick ? (quickBrief.creationScope || 'Single Channel') : (advancedBrief.creationScope || 'Single Channel'));
    const targets = isSimple ? [simpleBrief.channel] : (isQuick ? (quickBrief.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website']) : (advancedBrief.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website']));
    const channel = isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel);
    const format = isSimple ? '' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat);
    const lang = isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language);
    const dirMode = isSimple ? 'auto' : (isQuick ? 'none' : advancedBrief.directionMode);
    const customDir = isSimple ? '' : (isQuick ? '' : advancedBrief.customDirection);
    let lengthOpt = isSimple ? 'Medium: 120-180 words' : (isQuick ? 'Medium: 120-180 words' : advancedBrief.desiredLength);
    if (format === 'WhatsApp Message' && (!advancedBrief.desiredLength || advancedBrief.desiredLength.includes('Medium'))) {
      lengthOpt = 'Short: 40-90 words';
    }
    const audience = isSimple ? 'General Public' : (isQuick ? 'General Public' : advancedBrief.audience);
    const customAudience = isSimple ? '' : (isQuick ? '' : advancedBrief.customAudience);
    const purpose = isSimple ? 'General / Open' : (isQuick ? 'General / Open' : advancedBrief.purpose);
    const pillar = isSimple ? 'General / Custom' : (isQuick ? 'General / Custom' : advancedBrief.pillar);
    const explicitIntent = isSimple ? 'Infer automatically' : (isQuick ? 'Infer automatically' : (advancedBrief.creationIntent || 'Infer automatically'));
    const snap = getCurrentInputsString();

    // ── AI Generation Path ─────────────────────────────────────────────────────
    if (generationMode === 'ai' && aiStatus === 'connected') {
      setIsGeneratingDrafts(true);
      setAiIsGenerating(true);
      try {
        const canonicalInput = {
          mode: creationMode === 'quick' ? 'quick_create' : 'advanced_brief',
          origin: activeWorkItem?.calendarItemId ? 'editorial-calendar' : 'standard',
          rawInput: goal || notes,
          creationIntent: explicitIntent,
          creationScope: scope,
          channel,
          outputFormat: format,
          targetChannels: targets,
          contentPillar: pillar,
          audience,
          customAudience,
          purpose,
          language: lang,
          tone: String(creationMode === 'quick' ? 3 : advancedBrief.toneIntensity),
          desiredLength: lengthOpt,
          pastedNotes: notes,
          mustInclude,
          mustAvoid: creationMode === 'advanced' ? advancedBrief.mustAvoid : '',
          framingMode: dirMode,
          customFraming: customDir,
          operatingCoreInstructions: buildContentWorkspaceContextPackage().compiledInstructions,
          taskSources: (creationMode === 'advanced' ? advancedBrief.selectedSourceIds : []).map(id => {
            const s = [...workspaceLocalSources, ...sources].find((x: any) => x.id === id);
            return s ? { title: s.title, type: s.type, content: s.content || s.notes || s.url } : null;
          }).filter(Boolean)
        };

        const result = await aiService.generate(canonicalInput);

        // Normalize AI JSON response into draftOptions
        const draftA = result.drafts?.[0];
        const draftB = result.drafts?.[1];
        const rawA = draftA?.copy || '';
        const rawB = draftB?.copy || rawA;
        const shorter = result.shorterVersion || rawA.split('. ').slice(0, 2).join('. ') + '.';

        const visualBrief = result.visualDesignBrief
          ? serializeVisualBriefForStorage(result.visualDesignBrief)
          : generateVisualDesignBrief(channel, format, goal || notes, rawA);

        const qcIssues = result.qualityCheck?.issues || [];
        const editorial = result.editorialWarnings?.length > 0
          ? result.editorialWarnings.join(' | ')
          : (qcIssues.length > 0 ? `Quality check: ${qcIssues.join(' | ')}` : 'AI Generated. Review before publishing.');

        const labelA = draftA ? `AI - ${draftA.label || 'Option A'} (${draftA.confidence || 'based on brief'})` : 'AI Generated';
        const labelB = draftB ? `AI - ${draftB.label || 'Option B'} (${draftB.confidence || 'based on brief'})` : 'AI Generated';

        setDraftOptions({
          optionA: writingCleanupOn ? cleanWritingArtifacts(rawA) : rawA,
          optionB: writingCleanupOn ? cleanWritingArtifacts(rawB) : rawB,
          optionC: shorter,
          visualIdeation: visualBrief,
          editorialWarning: editorial,
          labelA,
          labelB,
          contextWarning: qcIssues.length > 0 ? qcIssues.join('\n') : undefined,
          languageNotice: lang !== 'English' ? `LANG_NOTICE::${lang}::Generated fully in ${lang}.` : undefined,
        });

        setAiGeneratedWith({ provider: aiProvider, model: aiTextModel });
        setGenerationInputsSnapshot(snap);
        setGenerationNumber(prev => prev + 1);
        setActiveDraftText(rawA);
        setActiveDraftTitle(scope === 'Multi-Channel Pack' ? 'Multi-Channel Pack Draft' : `${channel} ${format} Draft`);
        setActiveDraftVersion(1);
        setActiveDraftHistory([{
          version: 1,
          text: rawA,
          timestamp: new Date().toLocaleTimeString(),
          actionUsed: `AI Generated (${aiProvider}/${aiTextModel})`
        }]);
        setImportedIdeationContext(null);

        // Attach to Active Work Item
        setActiveWorkItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: qcIssues.length > 0 ? 'Needs Source Check' : 'Draft',
            draftVersions: [{ id: `draft-${Date.now()}`, text: rawA, createdAt: new Date().toISOString() }, ...prev.draftVersions],
            visualDirection: visualBrief,
            updatedAt: new Date().toISOString()
          };
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'AI generation failed.';
        setValidationWarning(`AI Error: ${errorMsg}`);
      } finally {
        setIsGeneratingDrafts(false);
        setAiIsGenerating(false);
      }
      return;
    }

    // ── Prototype Fallback Path ────────────────────────────────────────────────
    // If AI is not connected, show Prompt Builder mode message instead of fake final copy.
    if (generationMode !== 'prototype') {
      // Show a soft message directing to prompt builder
      setDraftOptions({
        optionA: '',
        optionB: '',
        optionC: '',
        visualIdeation: '',
        editorialWarning: '',
        labelA: '',
        labelB: '',
        contextWarning: 'AI generation is not connected. Build an AI prompt to get final-quality content, or switch to Prototype Structure mode in Settings.',
        languageNotice: undefined,
      });
      setGenerationInputsSnapshot(snap);
      setGenerationNumber(prev => prev + 1);
      return;
    }

    // Prototype Structure generation (clearly labeled, not final copy)
    setIsGeneratingDrafts(true);
    const interpForWarning = interpretBrief(goal || notes, notes, audience, purpose, format);
    const urlAddedWithoutSummary = workspaceLocalSources.some(s => s.notes.includes('URL:') && s.content.startsWith('[URL reference:')) ||
                                    sources.some(s => s.selected && s.notes.includes('URL:') && s.content.startsWith('[URL reference:'));
    let contextWarning = '';
    if (urlAddedWithoutSummary) {
      contextWarning = 'URL added, but no excerpt or summary was provided.';
    } else if (interpForWarning.missingContextNote) {
      contextWarning = interpForWarning.missingContextNote;
    }

    setTimeout(() => {
      let rawA = '';
      let rawB = '';

      if (scope === 'Multi-Channel Pack') {
        rawA = targets.map(targetCh => {
          const defaultFmt = CHANNEL_FORMATS[targetCh]?.[0] || 'Post';
          const outputForCh = generateStructuredDraft(
            targetCh, defaultFmt, goal || notes, notes, dirMode, customDir, lengthOpt, '', 3,
            audience, customAudience, purpose, pillar, false, anotherVersionStyle, explicitIntent
          );
          return `[${targetCh.toUpperCase()} - ${defaultFmt.toUpperCase()}]\n${outputForCh}`;
        }).join('\n\n========================================\n\n');
        rawB = targets.map(targetCh => {
          const defaultFmt = CHANNEL_FORMATS[targetCh]?.[0] || 'Post';
          const outputForCh = generateStructuredDraft(
            targetCh, defaultFmt, goal || notes, notes, dirMode, customDir, lengthOpt, '', 3,
            audience, customAudience, purpose, pillar, true, anotherVersionStyle, explicitIntent
          );
          return `[${targetCh.toUpperCase()} - ${defaultFmt.toUpperCase()} (Alternative)]\n${outputForCh}`;
        }).join('\n\n========================================\n\n');
      } else {
        rawA = generateStructuredDraft(
          channel, format, goal || notes, notes, dirMode, customDir, lengthOpt, '', 3,
          audience, customAudience, purpose, pillar, false, anotherVersionStyle, explicitIntent
        );
        rawB = generateStructuredDraft(
          channel, format, goal || notes, notes, dirMode, customDir, lengthOpt, '', 3,
          audience, customAudience, purpose, pillar, true, anotherVersionStyle, explicitIntent
        );
      }

      if (writingCleanupOn) {
        rawA = cleanWritingArtifacts(rawA);
        rawB = cleanWritingArtifacts(rawB);
      }
      if (lang !== 'English') {
        rawA = translateText(rawA, lang);
        rawB = translateText(rawB, lang);
      }

      const languageNotice = getLanguageNotice(lang);
      const shorter = rawA.split('. ').slice(0, 2).join('. ') + '.';
      let visualPrompt = generateVisualDesignBrief(
        scope === 'Multi-Channel Pack' ? 'Multi-Channel' : channel,
        scope === 'Multi-Channel Pack' ? 'Multi-Channel Pack' : format,
        goal || notes, rawA
      );
      if (lang !== 'English') { visualPrompt = translateText(visualPrompt, lang); }
      const editorial = getFictionalContentWarnings(rawA).length > 0
        ? 'Warning: Source check needed. Review before publishing.'
        : 'Prototype Structure. Connect AI in Settings for final-quality content.';

      setDraftOptions({
        optionA: rawA,
        optionB: rawB,
        optionC: shorter,
        visualIdeation: visualPrompt,
        editorialWarning: editorial,
        labelA: 'Prototype Structure',
        labelB: 'Prototype Structure',
        contextWarning: contextWarning || undefined,
        languageNotice: languageNotice || undefined,
      });
      setAiGeneratedWith(null);
      setGenerationInputsSnapshot(snap);
      setGenerationNumber(prev => prev + 1);
      setIsGeneratingDrafts(false);
      setActiveDraftText(rawA);
      setActiveDraftTitle(scope === 'Multi-Channel Pack' ? 'Multi-Channel Pack Draft' : `${channel} ${format} Draft`);
      setActiveDraftVersion(1);
      setActiveDraftHistory([{
        version: 1,
        text: rawA,
        timestamp: new Date().toLocaleTimeString(),
        actionUsed: 'Prototype generation (AI not connected)'
      }]);

      // Attach to Active Work Item
      setActiveWorkItem(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: getFictionalContentWarnings(rawA).length > 0 ? 'Needs Source Check' : 'Draft',
          draftVersions: [{ id: `draft-${Date.now()}`, text: rawA, createdAt: new Date().toISOString() }, ...prev.draftVersions],
          visualDirection: visualPrompt,
          updatedAt: new Date().toISOString()
        };
      });
    }, 600);
  };

  const cleanOptionADraft = () => {
    if (!draftOptions) return;
    const cleaned = cleanWritingArtifacts(draftOptions.optionA);
    setDraftOptions(prev => prev ? { ...prev, optionA: cleaned } : null);
  };

  const cleanOptionBDraft = () => {
    if (!draftOptions) return;
    const cleaned = cleanWritingArtifacts(draftOptions.optionB);
    setDraftOptions(prev => prev ? { ...prev, optionB: cleaned } : null);
  };

  // --- Apply Content Template ---
  const applyTemplate = (temp: ContentTemplate) => {
    const modeSwitched = creationMode !== 'advanced';
    setCreationMode('advanced');
    setAdvancedBrief(prev => ({
      ...prev,
      topic: prev.topic || temp.name,
      channel: temp.channel,
      pillar: temp.pillar,
      audience: temp.audience,
      purpose: temp.purpose,
      directionMode: temp.directionMode,
      mustInclude: temp.mustInclude,
      mustAvoid: temp.mustAvoid,
      desiredLength: temp.desiredLength,
      outputFormat: temp.outputFormat
    }));
    setStartedFromNote(
      modeSwitched
        ? `Starter applied: ${temp.name} — switched to Advanced Brief so all starter fields are editable.`
        : `Starter applied: ${temp.name}`
    );
  };

  // --- Apply Example Chip Pre-fills ---
  const applyExampleChip = (chipId: string) => {
    const modeSwitched = creationMode !== 'advanced';
    setCreationMode('advanced');
    let starterLabel = chipId;
    switch (chipId) {
      case 'tetralogy':
        starterLabel = 'Announce Tetralogy';
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'Announce the Climate Tetralogy',
          pillar: 'Climate Tetralogy & Canon',
          mustInclude: 'Four operas. Four worlds. One planet.',
          audience: 'General Public'
        }));
        break;
      case 'cultural-ip':
        starterLabel = 'Cultural IP & Model';
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'Explain the Cultural IP and Content Model',
          pillar: 'Documentary, Media & Cultural IP',
          mustInclude: 'live opera as origin asset, licensing, filmed content',
          audience: 'Sponsors & Patrons'
        }));
        break;
      case 'event-notes':
        starterLabel = 'Nordic Air (Soria Moria)';
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'Soria Moria: Nordic Air and Somatic Staging',
          pillar: 'Opera Worlds & Artistic Method',
          mustInclude: 'Soria Moria, climate as lived condition',
          audience: 'Cultural Audience'
        }));
        break;
      case 'instagram-img':
        starterLabel = 'Water Dragon Caption';
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'The Water Dragon visual caption',
          channel: 'Instagram',
          outputFormat: 'Caption',
          pillar: 'Opera Worlds & Artistic Method',
          mustInclude: 'The Water Dragon',
          audience: 'General Public',
          desiredLength: 'Short: 50-80 words'
        }));
        break;
      case 'sponsor-facing':
        starterLabel = 'Patron Pitch Paragraph';
        setAdvancedBrief(prev => ({
          ...prev,
          creationScope: 'Single Channel',
          topic: 'Patron pitch paragraph for COH',
          channel: 'Email / Direct Outreach',
          outputFormat: 'Sponsor Pitch Paragraph',
          pillar: 'Partnerships, Sponsorship & Institutional Value',
          mustInclude: 'licensing, cultural IP, patron backing',
          audience: 'Sponsors & Patrons',
          purpose: 'Sponsor Interest'
        }));
        break;
      case 'newsletter-update':
        starterLabel = 'Earth Canon Update';
        setAdvancedBrief(prev => ({
          ...prev,
          creationScope: 'Single Channel',
          topic: 'Earth Canon Update: Roar to the Wind',
          channel: 'Newsletter',
          outputFormat: 'Newsletter Section',
          pillar: 'Climate Tetralogy & Canon',
          mustInclude: 'Roar to the Wind, repertoire-based climate canon',
          audience: 'Sponsors & Patrons'
        }));
        break;
    }
    setStartedFromNote(
      modeSwitched
        ? `Starter applied: ${starterLabel} — switched to Advanced Brief so all starter fields are editable.`
        : `Starter applied: ${starterLabel}`
    );
  };

  const [formatAdjustedNote, setFormatAdjustedNote] = useState<string>('');
  const [cleanPunctuationNote, setCleanPunctuationNote] = useState<string>('');

  const handleChannelChange = (newChannel: string, isAdvanced: boolean) => {
    if (isAdvanced) {
      const allowed = CHANNEL_FORMATS[newChannel] || [];
      const currentFormat = advancedBrief.outputFormat;
      let nextFormat = currentFormat;
      let adjusted = false;

      if (!allowed.includes(currentFormat)) {
        adjusted = true;
        if (newChannel === 'Email / Direct Outreach') {
          nextFormat = advancedBrief.purpose === 'Sponsor Interest' ? 'Sponsor Pitch Paragraph' : 'Email / Letter';
        } else {
          nextFormat = allowed[0] || 'Post';
        }
      }

      setAdvancedBrief(prev => ({
        ...prev,
        channel: newChannel,
        outputFormat: nextFormat
      }));

      if (adjusted) {
        setFormatAdjustedNote('Output format adjusted to match the selected channel.');
        setTimeout(() => setFormatAdjustedNote(''), 4000);
      } else {
        setFormatAdjustedNote('');
      }
    } else {
      const allowed = CHANNEL_FORMATS[newChannel] || [];
      const currentFormat = quickBrief.outputFormat;
      let nextFormat = currentFormat;
      let adjusted = false;

      if (!allowed.includes(currentFormat)) {
        adjusted = true;
        if (newChannel === 'Email / Direct Outreach') {
          nextFormat = 'Email / Letter';
        } else {
          nextFormat = allowed[0] || 'Post';
        }
      }

      setQuickBrief(prev => ({
        ...prev,
        channel: newChannel,
        outputFormat: nextFormat
      }));

      if (adjusted) {
        setFormatAdjustedNote('Output format adjusted to match the selected channel.');
        setTimeout(() => setFormatAdjustedNote(''), 4000);
      } else {
        setFormatAdjustedNote('');
      }
    }
  };

  // --- Quick Launcher ---
  // scope: 'Single Channel' | 'Multi-Channel Pack'  — must be passed explicitly, never derived from format
  const triggerQuickLauncher = (channel: string, format: string, scope: 'Single Channel' | 'Multi-Channel Pack' = 'Single Channel') => {
    const isMulti = scope === 'Multi-Channel Pack';
    setCreationMode('quick');
    setQuickBrief(prev => ({
      ...prev,
      creationScope: scope,
      targetChannels: isMulti
        ? ['LinkedIn', 'Instagram', 'Newsletter', 'Website']
        : prev.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
      goal: '',
      channel: isMulti ? 'LinkedIn' : (channel === 'Email' ? 'Email / Direct Outreach' : channel),
      outputFormat: isMulti ? 'Post' : format,
      notes: '',
      mustInclude: '',
      mustAvoid: ''
    }));
    setStartedFromNote(isMulti ? 'Quick Launch: Multi-Channel Pack' : `Quick Launch: ${channel} ${format}`);
    setActiveTab('content-workspace');
  };

  // --- Save to Content Library ---
  const generateUniqueSaveName = (
    channel: string,
    format: string,
    version?: number,
    userInput?: string
  ): string => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    
    let summary = userInput ? userInput.trim() : '';
    if (summary.length > 35) {
      summary = summary.substring(0, 35) + '...';
    }
    if (!summary) summary = 'Generated draft';

    const verStr = (version && version > 1) ? ` - v${version}` : '';
    return `${dateStr} - ${channel} - ${format}${verStr} - ${summary}`;
  };

  const saveDirectDraftToLibrary = (textToSave: string, styleLabel: string) => {
    if (!textToSave.trim()) return;
    
    const finalCopy = cleanWritingArtifacts(textToSave);
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';
    const channel = isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel);
    const format = isSimple ? 'Post' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat);
    const lang = isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language);
    const audience = isSimple ? 'General Public' : (isQuick ? 'General Public' : advancedBrief.audience);
    const purpose = isSimple ? 'General / Open' : (isQuick ? 'General / Open' : advancedBrief.purpose);
    const goal = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);

    const uniqueName = generateUniqueSaveName(channel, format, 1, `${goal} (${styleLabel})`);
    const title = `${channel} ${format} (${styleLabel})`;

    const existingIndex = savedContent.findIndex(item => item.displayName === uniqueName);
    if (existingIndex !== -1) {
      const confirmUpdate = window.confirm(`An item with the display name "${uniqueName}" already exists. Do you want to overwrite it?`);
      if (!confirmUpdate) return;
      
      setSavedContent(prev => {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          text: finalCopy,
          finalCopy,
          savedAt: new Date().toISOString(),
          lastEdited: new Date().toISOString().split('T')[0],
          notes: `Updated draft (${styleLabel})`,
          visualDirection: draftOptions?.visualIdeation || undefined,
          visualIdeation: draftOptions?.visualIdeation || undefined
        };
        return next;
      });
      console.log(`Updated existing item in Content Library as:\n${uniqueName}`);
      return;
    }

    const item: SavedContent = {
      id: `saved-${Date.now()}`,
      title,
      displayName: uniqueName,
      savedAt: new Date().toISOString(),
      channel,
      pillar: isSimple ? 'General / Custom' : (isQuick ? 'General / Custom' : advancedBrief.pillar),
      angle: `Option ${styleLabel}`,
      audience,
      purpose,
      language: lang,
      finalCopy,
      visualDirection: draftOptions?.visualIdeation || undefined,
      status: 'Draft',
      sourcesUsed: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastEdited: new Date().toISOString().split('T')[0],
      text: finalCopy,
      notes: `Saved from draft results (${styleLabel})`,
      version: 1,
      visualIdeation: draftOptions?.visualIdeation || undefined,
      metadata: {
        creator: 'COH Content Studio',
        generatedAt: new Date().toISOString()
      }
    };

    setSavedContent(prev => [item, ...prev]);
    console.log(`Saved to Content Library as:\n${uniqueName}`);
  };

  const handleSaveVersionToLibrary = async (asNew: boolean, approvedStatus?: boolean) => {
    if (!activeDraftText.trim()) return;
    
    setIsSavingToLibrary(true);
    await new Promise(resolve => setTimeout(resolve, 600));

    const textToSave = cleanWritingArtifacts(activeDraftText);
    setActiveDraftText(textToSave);

    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';
    const isExternal = activeDraftSource === 'External Content';
    const channel = isExternal ? revisionSettings.channel : (isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel));
    const format = isExternal ? revisionSettings.format : (isSimple ? '' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat));
    const lang = isExternal ? revisionSettings.targetLanguage : (isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language));
    const audience = isExternal ? 'External' : (isSimple ? 'General Public' : (isQuick ? 'General Public' : advancedBrief.audience));
    const purpose = isExternal ? revisionSettings.optionalContext : (isSimple ? 'General / Open' : (isQuick ? 'General / Open' : advancedBrief.purpose));
    const goal = isExternal ? revisionSettings.optionalContext : (isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic));

    const uniqueName = generateUniqueSaveName(channel, format, activeDraftVersion, goal);
    const title = activeDraftTitle || 'Untitled Draft';

    const existingIndex = savedContent.findIndex(item => item.title === title || item.displayName === uniqueName);
    
    if (existingIndex !== -1 && !asNew) {
      const confirmUpdate = window.confirm(`An item with this title or display name already exists. Do you want to overwrite it with this revised version?`);
      if (!confirmUpdate) {
        setIsSavingToLibrary(false);
        return;
      }
      
      setSavedContent(prev => {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          text: textToSave,
          displayName: uniqueName,
          savedAt: new Date().toISOString(),
          version: activeDraftVersion,
          lastEdited: new Date().toISOString().split('T')[0],
          notes: `Updated to v${activeDraftVersion} via Revision Studio`,
          status: approvedStatus ? 'Approved' : next[existingIndex].status,
          visualDirection: draftOptions?.visualIdeation || undefined,
          visualIdeation: draftOptions?.visualIdeation || undefined,
          finalCopy: textToSave
        };
        return next;
      });
      console.log(`Updated existing item "${title}" in Content Library as:\n${uniqueName}`);
      setIsSavingToLibrary(false);
      return;
    }

    let finalTitle = title;
    if (asNew && existingIndex !== -1) {
      finalTitle = `${title} (v${activeDraftVersion})`;
    }

    const item: SavedContent = {
      id: `saved-${Date.now()}`,
      title: finalTitle,
      displayName: uniqueName,
      savedAt: new Date().toISOString(),
      channel,
      pillar: isSimple ? 'General / Custom' : (isQuick ? 'General / Custom' : advancedBrief.pillar),
      angle: isSimple ? 'Simple Mode' : (isQuick ? 'Quick Create' : advancedBrief.angle),
      audience,
      purpose,
      language: lang,
      sourceDraftId: activeDraftVersion > 1 ? `draft-${activeDraftVersion}` : undefined,
      revisionVersion: activeDraftVersion,
      revisionAction: activeDraftVersion > 1 ? 'Revised' : undefined,
      finalCopy: textToSave,
      visualDirection: draftOptions?.visualIdeation || undefined,
      status: approvedStatus ? 'Approved' : 'Draft',
      sourcesUsed: creationMode === 'advanced' ? advancedBrief.selectedSourceIds : [],
      createdAt: new Date().toISOString().split('T')[0],
      lastEdited: new Date().toISOString().split('T')[0],
      text: textToSave,
      notes: `Saved version v${activeDraftVersion}`,
      version: activeDraftVersion,
      visualIdeation: draftOptions?.visualIdeation || undefined,
      source: activeDraftSource,
      metadata: {
        creator: 'COH Content Studio',
        generatedAt: new Date().toISOString()
      }
    };
    
    setSavedContent(prev => [item, ...prev]);
    console.log(`Saved to Content Library as:\n${uniqueName}`);
    setIsSavingToLibrary(false);
  };

  // --- Duplicate Saved Content ---
  const handleDuplicateSaved = (item: SavedContent) => {
    const dup: SavedContent = {
      ...item,
      id: `saved-dup-${Date.now()}`,
      title: `${item.title} (Copy)`,
      status: 'Draft',
      lastEdited: new Date().toISOString().split('T')[0],
      version: 1
    };
    setSavedContent(prev => [dup, ...prev]);
  };

  const compileExportContentString = (item: SavedContent) => {
    const finalCopyText = cleanWritingArtifacts(item.text);
    const displayTitle = generateContentDisplayTitle(item);
    const formattedVisual = formatVisualDirectionForDisplay(
      item.visualDirection || item.visualIdeation || '',
      item.channel,
      item.outputFormat || 'Post',
      item.text
    );

    return `Title:
${displayTitle}

Metadata:
Date saved: ${item.savedAt || new Date().toISOString()}
Channel: ${item.channel}
Output format: ${item.outputFormat || 'Post'}
Language: ${item.language || 'English'}
Audience: ${item.audience}
Purpose: ${item.purpose}
Status: ${item.status}
Revision version: v${item.version || 1}
Revision action: ${item.revisionAction || 'None'}

Final Copy:
${finalCopyText}

Visual Direction:
${formattedVisual}

Sources Used:
${item.sourcesUsed && item.sourcesUsed.length > 0 ? item.sourcesUsed.join(', ') : 'None'}

Revision History:
- Initial generation saved as v1. Current version is v${item.version || 1}.
`;
  };

  const handleExport = (item: SavedContent, format: 'txt') => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}_${hh}-${min}`;

    const channelSlug = item.channel.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const formatSlug = (item.outputFormat || 'post').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const verSlug = `v${item.version || 1}`;
    
    const displayTitle = generateContentDisplayTitle(item);
    const titleSlug = displayTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 35);
    
    const filename = `${dateStr}_-_${channelSlug}_-_${formatSlug}_-_${verSlug}_-_${titleSlug}.txt`;
    const txtString = compileExportContentString(item);
    const blob = new Blob([txtString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Apply Revision ---
    const runRevision = async (action: string) => {
    if (activeRevisionAction) return;
    setActiveRevisionAction(action);
    setRevisionSuccessAction(null);
    setActiveRevisionError(null);

    let revised = activeDraftText;
    let actionLabel = REVISION_ACTIONS.find(a => a.id === action)?.label || action;

    try {
      if (action === 'clean-ai-punctuation') {
        revised = cleanWritingArtifacts(revised);
        setCleanPunctuationNote('Cleaned punctuation and hidden characters. Meaning preserved.');
        setTimeout(() => setCleanPunctuationNote(''), 4000);
      } else {
        if (generationMode === 'ai' && aiStatus === 'connected') {
          const actionDef = REVISION_ACTIONS.find(a => a.id === action);
          
          let instruction = action === 'custom-instruction' ? customRevisionInstruction : (actionDef ? actionDef.label : action);
          
          if (actionDef?.group === 'Translation & Localization') {
            instruction += `. Target Language: ${revisionSettings.targetLanguage}. Preserve meaning but adapt tone naturally for this language. Avoid literal machine translation. `;
            if (revisionSettings.targetLanguage.includes('Persian')) {
              instruction += `CRITICAL: Output must be natural, readable, and spoken-friendly. Avoid formal mechanical Persian. Avoid stiff translation patterns. Keep the COH voice.`;
            } else if (revisionSettings.targetLanguage === 'English') {
              instruction += `CRITICAL: Output should be polished, professional, and clear. Keep the COH voice.`;
            } else {
              instruction += `CRITICAL: Adapt to natural usage in ${revisionSettings.targetLanguage}. Keep the COH voice.`;
            }
          }
          
          const result = await aiService.revise({
            previousDraft: activeDraftText,
            rawInput: revisionSettings.optionalContext,
            channel: revisionSettings.channel,
            outputFormat: revisionSettings.format,
            audience: 'General Public',
            purpose: revisionSettings.optionalContext || 'General Revision',
            language: revisionSettings.targetLanguage,
            tone: revisionSettings.tone,
            selectedRevisionAction: action,
            revisionInstruction: instruction,
            operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Revision Studio', action })
          });

          revised = result.revisedCopy || revised;
          actionLabel = action === 'custom-instruction' ? `Custom: ${customRevisionInstruction || 'Rewrite'}` : actionLabel;
          
          if (actionDef?.group === 'Translation & Localization') {
            actionLabel = `${actionLabel} | Language: ${revisionSettings.targetLanguage}`;
          }
          
          if (action === 'custom-instruction') {
            setCustomRevisionInstruction('');
          }
        } else {
          // Prototype Fallback Actions
          await new Promise(resolve => setTimeout(resolve, 800));
          if (action === 'custom-instruction') {
            actionLabel = `Custom: ${customRevisionInstruction || 'Rewrite'}`;
            revised = `[Revised based on: "${customRevisionInstruction}"]\n\n${revised}\n\n(Adjusted alignment and framing to adhere to your instruction.)`;
            setCustomRevisionInstruction('');
          } else {
            const actionDef = REVISION_ACTIONS.find(a => a.id === action);
            if (actionDef?.group === 'Translation & Localization') {
              throw new Error('Translation requires AI generation. Please configure AI Connection in Settings.');
            }
            revised = `[${actionLabel} applied via fallback]\n\n${revised}`;
          }
        }
      }

      setSettingsChangedSinceRevision(false);
      const newVersion = activeDraftVersion + 1;
      setActiveDraftText(revised);
      setActiveDraftVersion(newVersion);
      setActiveDraftHistory(prev => [...prev, {
        version: newVersion,
        text: revised,
        timestamp: new Date().toLocaleTimeString(),
        actionUsed: `${actionLabel} | Channel: ${revisionSettings.channel} | Language: ${revisionSettings.targetLanguage}`
      }]);
      setRevisionSuccessAction(action);
      setTimeout(() => setRevisionSuccessAction(null), 2000);
    } catch (err: any) {
      setActiveRevisionError(err.message || 'Could not apply revision');
      setTimeout(() => setActiveRevisionError(null), 4000);
    } finally {
      setActiveRevisionAction(null);
    }
  };

  // --- Shared Context Compiler Integration for Content Workspace ---
  const buildContentWorkspaceContextPackage = () => {
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';
    const workflow = isSimple ? 'Simple Mode' : (isQuick ? 'Quick Create' : 'Advanced Brief');

    const channel = isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel);
    const format = isSimple ? undefined : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat);
    const topic = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);
    const lang = isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language);
    const aud = isSimple ? undefined : (creationMode === 'advanced' ? advancedBrief.audience : undefined);
    const custAud = isSimple ? undefined : (creationMode === 'advanced' ? advancedBrief.customAudience : undefined);
    const pillar = isSimple ? undefined : (creationMode === 'advanced' ? advancedBrief.pillar : undefined);
    const purpose = isSimple ? undefined : (creationMode === 'advanced' ? advancedBrief.purpose : undefined);

    const inherited = extractWorkContextFromWorkItem(activeWorkItem);

    const activeSourceIds =
      creationMode === 'advanced' && advancedBrief.selectedSourceIds.length > 0
        ? advancedBrief.selectedSourceIds
        : activeWorkItem?.sourceIds || [];

    const sourceBindings: TaskSourceBinding[] = activeSourceIds
      .map(id => {
        const s = [...sources, ...workspaceLocalSources].find((x: any) => x.id === id);
        if (!s) return null;
        return {
          sourceId: s.id,
          title: s.title || 'Untitled Source',
          type: s.type || 'Other',
          role: getEffectiveSourceRole(s),
          selectedExcerpts: getEffectiveSourceExcerpts(s.id),
          content: s.content || s.notes || s.url || '',
          summary: s.notes || undefined
        } as TaskSourceBinding;
      })
      .filter((b): b is TaskSourceBinding => Boolean(b));

    return compileGovernedContext({
      workflow,
      operatingCore,
      coreDocuments: operatingCoreDocs,
      audience: aud,
      customAudience: custAud,
      channel,
      format,
      pillar,
      language: lang,
      communicationJob: purpose || topic || undefined,
      sourceBindings,
      derivedSourceAnalyses: sourceIntelligenceMap,
      userInstruction: topic || undefined,
      inheritedWorkContext: inherited,
      explicitFields: {
        channel: Boolean(channel),
        format: Boolean(format),
        audience: creationMode === 'advanced' && Boolean(aud),
        pillar: creationMode === 'advanced' && Boolean(pillar),
        language: !isSimple && Boolean(lang),
        communicationJob: Boolean(purpose || topic)
      }
    });
  };

  // --- Prompt Builder Compiler ---
  const compileStructuredPrompt = () => {
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';

    const creationScope = isSimple ? 'Single Channel' : (isQuick ? (quickBrief.creationScope || 'Single Channel') : (advancedBrief.creationScope || 'Single Channel'));
    const targetChannels = isSimple ? [simpleBrief.channel] : (isQuick ? (quickBrief.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website']) : (advancedBrief.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website']));
    const channel = isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel);
    const format = isSimple ? '' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat);
    const notes = isSimple ? '' : (isQuick ? quickBrief.notes : '');
    const mustInclude = isSimple ? '' : (isQuick ? quickBrief.mustInclude : advancedBrief.mustInclude);
    const mustAvoid = isSimple ? '' : (isQuick ? quickBrief.mustAvoid : advancedBrief.mustAvoid);
    const lang = isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language);
    const aud = isSimple ? 'General Public' : (creationMode === 'advanced' ? advancedBrief.audience : 'General Public');
    const custAud = isSimple ? '' : (creationMode === 'advanced' ? advancedBrief.customAudience : '');
    const pillar = isSimple ? 'General / Custom' : (creationMode === 'advanced' ? advancedBrief.pillar : 'Climate Tetralogy & Canon');
    const purpose = isSimple ? 'General / Open' : (creationMode === 'advanced' ? advancedBrief.purpose : 'Thought Leadership');
    const toneLevel = isSimple ? 3 : (creationMode === 'advanced' ? advancedBrief.toneIntensity : 3);
    const lengthOpt = isSimple ? 'Medium: 120-180 words' : (creationMode === 'advanced' ? advancedBrief.desiredLength : 'Medium: 120-180 words');
    const dirMode = isSimple ? 'auto' : (creationMode === 'advanced' ? advancedBrief.directionMode : 'none');
    const angle = isSimple ? '' : (creationMode === 'advanced' ? advancedBrief.angle : '');
    const customDir = isSimple ? '' : (creationMode === 'advanced' ? advancedBrief.customDirection : '');

    const contextPkg = buildContentWorkspaceContextPackage();
    const sourceContext = contextPkg.sections.sourceEvidenceContext;

    const audienceNote = getAudienceExplanation(aud);
    const audienceDirective = aud === 'Custom Audience' && custAud
      ? `Custom Audience: ${custAud}. Adapt vocabulary, proof points, CTA, and level of explanation to this group.`
      : `Audience: ${aud}. ${audienceNote}`;

    const directionNote = dirMode === 'custom' && customDir
      ? `Custom direction: ${customDir}`
      : dirMode === 'auto' && angle
        ? `Recommended approach: ${angle}`
        : 'No specific framing direction. Generate directly from the brief.';

    const languageDirective = lang !== 'English'
      ? '\n\nLANGUAGE DIRECTIVE (CRITICAL): The final output must be written entirely in ' + lang + '. Do not mix English sentences with ' + lang + '. Do not use translation fragments or partial phrases. Approved proper names that must NOT be translated: Climate Opera Haus, RESONANCE 2027, The Climate Tetralogy, Soria Moria, The Golden Fountain, The Water Dragon, Roar to the Wind. All other text — headlines, body copy, CTAs, captions — must be natural, fluent ' + lang + ' as written by a native speaker. If Email / Letter format is used, write the greeting and sign-off in ' + lang + ' also.'
      : '';

    const operatingCoreContext = buildContentWorkspaceContextPackage().compiledInstructions;

    return `${operatingCoreContext}

You are the COH Content Marketing Mastermind for Climate Opera Haus.

ROLE: Create professional, source-grounded content for Climate Opera Haus.

SELECTED USER SOURCES:
${sourceContext || '(No user sources selected.)'}

CONTENT BRIEF:
- Creation Scope: ${creationScope}
${creationScope === 'Multi-Channel Pack' ? `- Target Channels: ${targetChannels.join(', ')}` : `- Channel: ${channel}`}
- Output Format: ${format}
- Content Pillar: ${pillar}
- Purpose: ${purpose}
- ${audienceDirective}
- Language: ${lang}${languageDirective}
- Tone Level: ${getToneName(toneLevel)}
- Desired Length: ${lengthOpt}
- Direction: ${directionNote}
- Must Include: ${mustInclude || '(None)'}
- Must Avoid: ${mustAvoid || '(None)'}

- Selected Framing Mode: ${dirMode}
- Custom Framing: ${customDir || '(None)'}
- Revision Request: ${customRevisionInstruction || '(None)'}

Use the selected audience to adapt the language, proof points, level of explanation, and CTA. Do not treat audience as a label only.

Do not invent facts, titles, dates, venues, partners, sponsors, technologies, or project names.

Stay anchored to the user’s specific brief. Use Operating Core active rules only as guidance and fact boundary. Do not replace the user’s request with generic COH positioning.

Do not treat the output format as a generic post. Match the structure to the selected channel and format.
Create the content and a matching visual design brief. Keep metadata outside the final copy.

Format Guidelines:
- LinkedIn: Post (sober institutional), Carousel (slide-by-slide sequence), Thought Piece, Executive Note.
- Instagram: Caption (visceral description with visual designer context), Carousel, Reel Caption, Story Sequence, Visual Designer Brief.
- Newsletter: Newsletter Section, Long-Form Article, Event Update, Partner Update.
- Website: Website Section, News / Media Article, Long-Form Article, Event Page Copy.
- Email / Direct Outreach: Email / Letter (using standard email structure: Subject line, Greeting, Message, Sign-off), Sponsor Pitch Paragraph (short pitch paragraph only, no greetings), Partner Note, Follow-Up Note, Invitation Note.
- TikTok: Short Video Script, Caption, Hook Ideas.
- X / Twitter: Post (short character-bound announcement), Thread, Short Announcement.
- Facebook: Post, Event Update, Caption.
- YouTube: Video Description, Short Video Script, Title / Description Pack.
- Snapchat: Story Sequence, Short Caption.
- Internal Teams: Internal Update (operational direct update), Action Summary, Follow-Up Note.

REQUIRED OUTPUT STRUCTURE (Ready for Export):
1. Recommended content angle
2. Draft Option 1 (direct/institutional)
3. Draft Option 2 (human/narrative)
4. Shorter version
5. Structured Visual Design Brief (Concept, Recommendation, Mood, Composition, Color/Material, Typography, Key Elements, Avoid list, AI Prompt, Designer Notes, Slide-by-slide guide if Instagram Carousel)
6. Editorial warning (any unverified claims)

WRITING CLEANLINESS RULES (CRITICAL):
- Do not use em dash (—) or long dash.
- Do not use en dash (–) unless required for a date or numeric range. Prefer commas, colons, or simple hyphens.
- Do not use curly quotes. Use straight plain quotes.
- Do not use excessive ellipses or decorative symbols.
- Do not use zero-width spaces or hidden Unicode characters.
- Avoid formulaic AI phrases such as "not just... but...", "in a world where...", "at the intersection of...", "more than ever", "now more than ever", "this is not merely".
- Keep metadata outside the final copy.`;
  };

  // --- Computed: Audit Results ---
  const auditResults = activeDraftText ? runEditorialAudits(activeDraftText) : { checks: [], status: 'Ready' as const, score: 100 };

  // --- Computed: Filtered Content Library ---
  const actualFilteredSaved = savedContent.filter(item => {
    if (filterChannel !== 'All' && item.channel !== filterChannel) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    if (filterPillar !== 'All' && item.pillar !== filterPillar) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const textToSearch = item.text || item.finalCopy || '';
      return (item.title?.toLowerCase() || '').includes(q) || 
             textToSearch.toLowerCase().includes(q) || 
             (item.channel?.toLowerCase() || '').includes(q);
    }
    return true;
  });

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-primary font-sans text-text-primary">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-gold border-t-coh-navy rounded-full animate-spin mx-auto" />
          <p className="font-sans text-sm italic text-text-secondary">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas font-sans text-text-primary antialiased">
        <div className="w-full max-w-md card-level-2 p-8 space-y-6">
          <div className="text-center space-y-2">
            <span className="font-sans tracking-widest text-[10px] uppercase text-brand-gold block">Climate Opera Haus</span>
            <h1 className="font-sans text-2xl font-semibold text-text-primary">COH Content Studio</h1>
            <p className="text-xs text-text-secondary uppercase font-mono tracking-wider">Private access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-text-secondary mb-1" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={authUsernameInput}
                onChange={(e) => setAuthUsernameInput(e.target.value)}
                placeholder="Enter username"
                className="h-10 px-3 py-2 w-full bg-surface-inset border border-border-standard focus-visible:ring-focus-ring rounded-md font-sans text-[14px] text-text-primary outline-none transition-all focus-visible:ring-2"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-text-secondary mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={authPasswordInput}
                onChange={(e) => setAuthPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="h-10 px-3 py-2 w-full bg-surface-inset border border-border-standard focus-visible:ring-focus-ring rounded-md font-sans text-[14px] text-text-primary outline-none transition-all focus-visible:ring-2"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-500/10 backdrop-blur-md border border-red-200/50 p-3 rounded font-sans">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-slate-900 text-white hover:bg-brand-gold-hover py-3 rounded font-sans text-xs font-semibold tracking-wider uppercase transition border border-border-standard disabled:opacity-50 action-button interactive-button"
            >
              {authLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      
      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden flex items-center justify-between bg-surface-primary text-text-primary p-4 border-b border-border-standard shrink-0">
        <div className="font-sans text-lg font-bold tracking-tight text-text-primary">
          Climate Opera Haus
        </div>
        <button aria-label="Open navigation menu" onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 -mr-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-gold hover:text-text-primary">
          <Menu size={24} />
        </button>
      </div>

      {/* --- Sidebar Navigation Overlay/Drawer --- */}
      <div 
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-[252px] max-w-[85vw] border-r border-white/10 bg-sidebar-bg text-white flex flex-col justify-between p-5 shrink-0 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button */}
        <button aria-label="Close navigation menu" onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-3 right-3 p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-brand-gold hover:text-white">
          <X size={22} />
        </button>
        <div>
          <div className="mb-7 px-2">
            <span className="font-sans tracking-[0.12em] text-[10px] font-semibold uppercase text-brand-gold block mb-1.5">Climate Opera Haus</span>
            <h1 className="font-sans text-[19px] font-semibold leading-tight tracking-tight border-b border-white/10 pb-3.5 text-white">
              Content Studio
            </h1>
          </div>

          <nav className="space-y-1">
            <div className="pb-1.5 px-3 text-[10px] font-semibold tracking-wider text-white/45 uppercase">
              Overview
            </div>
            <button
              id="nav-command-center"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('command-center'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'command-center'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <LayoutDashboard size={15} />
              Command Center
            </button>

            <div className="pt-5 pb-1.5 px-3 text-[10px] font-semibold tracking-wider text-white/45 uppercase">
              Workspaces
            </div>
            <button
              id="nav-ideation"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('ideation-workspace'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'ideation-workspace'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Lightbulb size={15} />
              Ideation Workspace
            </button>
            <button
              id="nav-editorial"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('editorial-calendar'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'editorial-calendar'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Calendar size={15} />
              Editorial Calendar
            </button>
            <button
              id="nav-content"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-workspace'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'content-workspace'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Cpu size={15} />
              Content Workspace
            </button>
            <button
              id="nav-visual"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('visual-studio'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'visual-studio'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <div className="w-3.5 h-3.5 flex items-center justify-center border border-current rounded-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-current" />
              </div>
              Visual Studio
            </button>
            <button
              id="nav-revision"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('revision-studio'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg relative ${
                activeTab === 'revision-studio'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Sliders size={15} />
              Revision Studio
              {activeDraftText && (
                <span className="absolute top-2.5 right-3 w-2 h-2 rounded-full bg-brand-gold" />
              )}
            </button>
            <button
              id="nav-reframing"
              data-testid="nav-reframing-studio"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('reframing-studio'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg relative ${
                activeTab === 'reframing-studio'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <RefreshCw size={15} />
              Reframing Studio
            </button>

            <div className="pt-5 pb-1.5 px-3 text-[10px] font-semibold tracking-wider text-white/45 uppercase">
              Libraries
            </div>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('calendar-library'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'calendar-library'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Calendar size={15} />
              Calendar Library
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('idea-library'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'idea-library'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <FolderHeart size={15} />
              Idea Library
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-library'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'content-library'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Bookmark size={15} />
              Content Library
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('source-library'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'source-library'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <FileText size={15} />
              Source Library
            </button>

            <div className="pt-5 pb-1.5 px-3 text-[10px] font-semibold tracking-wider text-white/45 uppercase">
              Configuration
            </div>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('operating-core'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'operating-core'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <CpuIcon size={15} />
              Operating Core
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('settings'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium transition-colors rounded-lg ${
                activeTab === 'settings'
                  ? 'bg-sidebar-active text-text-inverse dark:text-white font-semibold shadow-xs'
                  : 'text-white/75 hover:bg-sidebar-hover hover:text-white'
              }`}
            >
              <Settings size={15} />
              Settings
            </button>
          </nav>
        </div>

      </aside>

      {/* --- Main Workspace Canvas --- */}
      <div className="flex-1 flex flex-col min-w-0 bg-canvas">
        <TopBar 
          title={getPageTitle()} 
          theme={theme} 
          onThemeToggle={setTheme} 
          aiStatus={aiStatus} 
          onNavigateTab={setActiveTab}
          savedContent={savedContent}
          savedIdeas={savedIdeas}
          sources={sources}
          onSelectContentItem={(item) => {
            setActiveDraftText(item.text);
            setActiveDraftTitle(item.title);
            setActiveDraftVersion(item.version || 1);
            setActiveDraftHistory([{ version: item.version || 1, text: item.text, timestamp: item.lastEdited, actionUsed: 'Loaded from Saved Library' }]);
            setActiveDraftSource('Content Library');
            setActiveTab('revision-studio');
          }}
          onSelectIdeaItem={(idea) => {
            handleCopyIdeaToWorkspace(idea);
          }}
        />
        <main className="app-main page-content flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6 flex flex-col min-w-0">
        
        {/* --- TAB 1: COMMAND CENTER --- */}
        
        {activeTab === 'operating-core' && (<ErrorBoundary fallbackTitle="Operating Core Error">
          <OperatingCoreAdmin 
            dbStatus={dbStatus}
            core={operatingCore} 
            sourceLibrary={[...workspaceLocalSources, ...sources]}
            onSave={(newCore) => {
              setOperatingCore(newCore);
            }}
            onReset={() => {
              const defaultCore = createDefaultOperatingCore();
              setOperatingCore(defaultCore);
            }}
            onAddNewCoreSource={(section) => {
              setActiveTab('source-library');
              setNewSource({
                ...newSource,
                
                selectable: true,
                status: 'Active',
                title: '', type: 'Other',  notes: '', content: '', url: ''
              });
            }}
            onLinkExistingSource={() => {
              setActiveTab('source-library');
            }}
          />
</ErrorBoundary>)}
                {activeTab === 'ideation-workspace' && (<ErrorBoundary fallbackTitle="Ideation Workspace Error">
          <div className="page-shell">
            {/* Header */}
            <div className="bg-surface-primary border border-border-standard p-6 rounded-2xl shadow-sm mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="font-sans text-2xl font-bold text-text-primary">Ideation Workspace</h2>
                  <p className="font-sans text-[14px] text-text-secondary mt-1">
                    Situation or Source to Communication Opportunities, Evidence Check, Reuse Check, Strong Idea, and Content Brief.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-text-secondary bg-surface-inset px-3 py-1.5 rounded-lg border border-border-standard">
                  <span>Library Context:</span>
                  <span className="text-brand-gold font-bold">{savedIdeas.length} Saved Ideas</span>
                  <span>|</span>
                  <span className="text-brand-gold font-bold">{savedContent.length} Content Pieces</span>
                </div>
              </div>
              <div className="mt-4">
                <ContextManifestPanel
                  manifest={
                    compileGovernedContext({
                      workflow: 'Ideation Workspace',
                      operatingCore,
                      coreDocuments: operatingCoreDocs,
                      audience: ideationFilterAudience,
                      channel: ideationFilterChannel,
                      language: ideationFilterLanguage,
                      sourceBindings: advancedBrief.selectedSourceIds
                        .map(id => {
                          const s = [...sources, ...workspaceLocalSources].find((x: any) => x.id === id);
                          if (!s) return null;
                          return {
                            sourceId: s.id,
                            title: s.title || 'Untitled Source',
                            type: s.type || 'Other',
                            role: taskSourceRoleMap[s.id]?.role || inferDefaultSourceRole(s.type),
                            selectedExcerpts: taskSourceRoleMap[s.id]?.selectedExcerpts || [],
                            content: s.content || s.notes || s.url || '',
                            summary: s.notes || undefined
                          } as TaskSourceBinding;
                        })
                        .filter((b): b is TaskSourceBinding => Boolean(b)),
                      derivedSourceAnalyses: sourceIntelligenceMap,
                      userInstruction: ideationInput
                    }).manifest
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)] gap-6 xl:gap-8 items-start">
              {/* Input Form Column (Left) */}
              <div className="min-w-0 flex flex-col gap-5">
                <Card className="shadow-level-1 border-border-standard">
                  <CardHeader className="pb-4 border-b border-border-standard">
                    <CardTitle className="text-lg">New Exploration</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-5 flex flex-col gap-5">
                    
                    <div data-guide="ideation-seed-input" className="flex flex-col gap-2">
                      <label className="font-sans text-[13px] font-semibold text-text-primary">What situation, question, or source angle do you want to explore?</label>
                      <p className="font-sans text-[11px] text-text-secondary">
                        Enter a keyword, phrase, question, paragraph, theme, campaign direction, audience need, or content problem.
                      </p>
                      <Textarea
                        rows={4}
                        value={ideationInput}
                        onChange={(e) => setIdeationInput(e.target.value)}
                        placeholder="e.g. Why is climate opera superior to other forms of climate art?"
                      />
                    </div>

                    {/* Source-Grounded Ideation Panel */}
                    <div
                      data-guide="ideation-sources"
                      data-testid="ideation-attached-sources-panel"
                      className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-inset border border-border-standard"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-[12px] font-bold text-text-primary">
                          Attached Sources ({advancedBrief.selectedSourceIds.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('source-library')}
                          className="text-[11px] font-semibold text-brand-gold hover:underline"
                        >
                          Browse Source Library
                        </button>
                      </div>

                      {advancedBrief.selectedSourceIds.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {advancedBrief.selectedSourceIds.map(srcId => {
                            const s = [...sources, ...workspaceLocalSources].find((x: any) => x.id === srcId);
                            if (!s) return null;
                            const currentRole = taskSourceRoleMap[s.id]?.role || inferDefaultSourceRole(s.type);
                            const analysis = sourceIntelligenceMap[s.id];
                            return (
                              <div
                                key={s.id}
                                data-testid={`ideation-attached-source-${s.id}`}
                                className="p-2.5 rounded-lg bg-surface-primary border border-border-standard flex flex-col gap-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-sans text-[12px] font-bold text-text-primary truncate">
                                    {s.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setAdvancedBrief(prev => ({
                                        ...prev,
                                        selectedSourceIds: prev.selectedSourceIds.filter(id => id !== s.id)
                                      }))
                                    }
                                    className="text-[10px] font-semibold text-status-error hover:underline"
                                  >
                                    Detach
                                  </button>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <label className="text-[10px] font-semibold text-text-secondary">Task Role:</label>
                                  <select
                                    data-testid={`ideation-source-role-select-${s.id}`}
                                    value={currentRole}
                                    onChange={e =>
                                      handleChangeSourceTaskRole(s.id, e.target.value as SourceTaskRole)
                                    }
                                    className="text-[11px] font-semibold bg-surface-inset border border-border-standard rounded px-2 py-0.5 text-text-primary"
                                  >
                                    {ALL_SOURCE_TASK_ROLES.map(r => (
                                      <option key={r} value={r}>
                                        {r}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                {analysis && analysis.keyFacts.length > 0 && (
                                  <div className="text-[10px] text-text-secondary bg-surface-inset p-1.5 rounded border border-border-standard">
                                    <span className="font-semibold text-brand-gold">Traceable Fact: </span>
                                    {analysis.keyFacts[0]}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="font-sans text-[11px] text-text-secondary">
                          No source attached. Ideation will ground opportunities in the Protected COH Kernel and Operating Core, or you can attach a source below.
                        </p>
                      )}

                      {sources.filter(s => s.selectable && !advancedBrief.selectedSourceIds.includes(s.id)).length > 0 && (
                        <div className="pt-1">
                          <select
                            data-testid="ideation-attach-source-dropdown"
                            value=""
                            onChange={e => {
                              const selectedId = e.target.value;
                              if (!selectedId) return;
                              const found = sources.find(s => s.id === selectedId);
                              if (found && !taskSourceRoleMap[selectedId]) {
                                handleChangeSourceTaskRole(selectedId, inferDefaultSourceRole(found.type));
                              }
                              setAdvancedBrief(prev => ({
                                ...prev,
                                selectedSourceIds: prev.selectedSourceIds.includes(selectedId)
                                  ? prev.selectedSourceIds
                                  : [...prev.selectedSourceIds, selectedId]
                              }));
                            }}
                            className="w-full text-[11px] bg-surface-primary border border-border-standard rounded-md px-2.5 py-1.5 text-text-secondary"
                          >
                            <option value="">+ Attach source from Source Library...</option>
                            {sources
                              .filter(s => s.selectable && !advancedBrief.selectedSourceIds.includes(s.id))
                              .map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.title} ({s.type})
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div data-guide="ideation-filters" className="flex flex-col gap-4 pt-2">
                      <h4 className="font-sans text-[13px] font-bold text-text-primary border-b border-border-standard pb-1">Filters (Optional)</h4>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Target Channel</label>
                          <Select value={ideationFilterChannel} onChange={(e) => setIdeationFilterChannel(e.target.value)} options={CHANNELS.slice(0, 7).map(c => ({label: c, value: c}))} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Language</label>
                          <Select value={ideationFilterLanguage} onChange={(e) => setIdeationFilterLanguage(e.target.value)} options={LANGUAGES.map(l => ({label: l.label, value: l.label}))} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Quality Filter</label>
                          <Select value={ideationFilterQuality} onChange={(e) => setIdeationFilterQuality(e.target.value)} options={[{label: 'Practical', value: 'Practical'}, {label: 'Bold', value: 'Bold'}, {label: 'Educational', value: 'Educational'}, {label: 'Emotional', value: 'Emotional'}, {label: 'Sponsor-facing', value: 'Sponsor-facing'}, {label: 'Public-facing', value: 'Public-facing'}, {label: 'Artistic', value: 'Artistic'}, {label: 'Institutional', value: 'Institutional'}, {label: 'Campaign-ready', value: 'Campaign-ready'}]} />
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="font-sans text-[11px] font-semibold text-text-secondary">Depth Level</label>
                          <Select value={ideationFilterDepth} onChange={(e) => setIdeationFilterDepth(e.target.value)} options={[{label: 'Light', value: 'Light'}, {label: 'Standard', value: 'Standard'}, {label: 'Deep', value: 'Deep'}, {label: 'Experimental', value: 'Experimental'}]} />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[11px] font-semibold text-text-secondary">Target Audience</label>
                        <Select
                          value={ideationFilterAudience}
                          onChange={(e) => setIdeationFilterAudience(e.target.value)}
                          options={Array.from(
                            new Set(['General Public', ...getAuthoritativeAudiences(operatingCore), ideationFilterAudience])
                          )
                            .filter(Boolean)
                            .map(aud => ({ label: aud, value: aud }))}
                        />
                      </div>
                    </div>

                    <div data-guide="ideation-generate">
                      <Button
                        data-testid="generate-ideas-btn"
                        onClick={handleGenerateIdeas}
                        disabled={isIdeating}
                        className="w-full h-11 mt-2 flex items-center justify-center gap-2 font-bold"
                      >
                        {isIdeating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                        {isIdeating ? 'Generating Opportunities...' : 'Generate Ideas'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ideas Display (Right) */}
              <div data-guide="ideation-results" className="min-w-0 flex flex-col gap-6">
                {generatedIdeas.length > 0 ? (
                  <div className="flex flex-col gap-6">
                    {/* Strategic Diversity & Evidence Summary Strip */}
                    {(() => {
                      const divStats = evaluateOpportunityDiversity(generatedIdeas as IdeationOpportunityProposal[]);
                      const sourceMap: Record<string, string> = {};
                      [...sources, ...workspaceLocalSources].forEach((s: any) => {
                        sourceMap[s.id] = s.title;
                      });
                      return (
                        <>
                          <div
                            data-testid="ideation-diversity-summary"
                            className="bg-surface-primary border border-border-standard px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-[12px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-text-primary">Opportunity Set Quality:</span>
                              <span className="px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold font-semibold">
                                {divStats.uniqueCommunicationJobs} Distinct Communication Jobs
                              </span>
                              <span className="px-2 py-0.5 rounded bg-surface-inset text-text-secondary border border-border-standard">
                                {divStats.uniqueStrategicAngles} Strategic Angles
                              </span>
                            </div>
                            <div className="text-[11px] text-text-secondary">
                              {advancedBrief.selectedSourceIds.length > 0
                                ? `Grounded in ${advancedBrief.selectedSourceIds.length} attached source(s)`
                                : 'Grounded in Protected COH Kernel & Operating Core'}
                            </div>
                          </div>

                          <div className="flex flex-col gap-8">
                            {Array.from(new Set(generatedIdeas.map(i => i.category))).map(cat => (
                              <div key={cat} className="flex flex-col gap-4">
                                <h3 className="font-sans text-lg font-bold text-brand-gold border-b border-border-standard pb-2 capitalize">
                                  {cat}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                                  {generatedIdeas
                                    .filter(idea => idea.category === cat)
                                    .map(idea => (
                                      <IdeationOpportunityCard
                                        key={idea.id}
                                        idea={idea}
                                        savingIdeaId={savingIdeaId}
                                        sourceTitlesMap={sourceMap}
                                        onUpdateStatus={handleUpdateIdeaStatus}
                                        onGenerateVariation={targetIdea => {
                                          setIsIdeating(true);
                                          setTimeout(() => {
                                            setIsIdeating(false);
                                            setGeneratedIdeas(prev =>
                                              prev.map(p =>
                                                p.id === targetIdea.id
                                                  ? {
                                                      ...p,
                                                      title: `Alternative Angle: ${p.title.replace(/^Alternative Angle:\s*/i, '')}`,
                                                      strategicAngle: `${p.strategicAngle || 'Strategic'} (Refined Perspective)`,
                                                      status: 'New'
                                                    }
                                                  : p
                                              )
                                            );
                                          }, 350);
                                        }}
                                        onSaveToLibrary={handleSaveIdeaToLibrary}
                                        onPromoteToWorkspace={handleCopyIdeaToWorkspace}
                                        onInspectReuseCandidate={(itemType, _itemId) => {
                                          if (itemType === 'idea') {
                                            setActiveTab('idea-library');
                                          } else {
                                            setActiveTab('content-library');
                                          }
                                        }}
                                      />
                                    ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-border-standard rounded-2xl bg-surface-inset">
                    <div className="w-16 h-16 bg-surface-primary rounded-full flex items-center justify-center shadow-sm mb-4">
                      <Lightbulb size={28} className="text-brand-gold" />
                    </div>
                    <h3 className="font-sans text-[18px] font-bold text-text-primary mb-2">No Opportunities Generated Yet</h3>
                    <p className="font-sans text-[14px] text-text-secondary max-w-md">
                      Use the exploration panel on the left to generate evidence-aware, reuse-checked COH communication opportunities.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ErrorBoundary>)}
        {activeTab === 'idea-library' && (<ErrorBoundary fallbackTitle="Idea Library Error">
          <div className="page-shell" data-guide="idea-library-shell">
            <div data-guide="idea-library-header" className="bg-surface-primary border border-border-standard p-5 md:p-6 rounded-xl shadow-level-1">
              <h2 className="page-title">Idea Library</h2>
              <p className="page-subtitle">
                Manage saved content angles, hooks, and campaign outlines. Keep track of what is ready to be written.
              </p>
            </div>

            {/* List of saved ideas */}
            {savedIdeas.length > 0 ? (
              <div data-guide="idea-library-grid" className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                {savedIdeas.map(idea => (
                  <div key={idea.id} className="bg-surface-primary border border-border-standard p-5 rounded-xl shadow-level-1 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div>
                          <div className="flex gap-2 items-center flex-wrap mb-1.5">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-2 py-0.5 rounded-md">
                              {idea.suggestedChannel}
                            </span>
                            <span className="text-[10px] font-mono text-text-secondary uppercase font-semibold">
                              {idea.category}
                            </span>
                          </div>
                          <h4 className="font-sans text-[15px] font-semibold text-text-primary leading-snug">{idea.title}</h4>
                        </div>

                        <select
                          value={idea.status}
                          onChange={(e) => handleUpdateIdeaStatus(idea.id, e.target.value as SavedIdea['status'])}
                          className={`text-[10.5px] font-semibold px-2.5 py-1 rounded-md border border-border-standard ${
                            idea.status === 'Ready for Content' ? 'bg-status-info/10 text-status-info border-status-info/30' :
                            idea.status === 'Promising' ? 'bg-brand-gold/15 text-brand-gold border-brand-gold/30' :
                            idea.status === 'Used' ? 'bg-status-success/10 text-status-success border-status-success/30' :
                            'bg-surface-inset text-text-primary'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Promising">Promising</option>
                          <option value="Ready for Content">Ready for Content</option>
                          <option value="Used">Used</option>
                          <option value="Archived">Archived</option>
                          <option value="Not Useful">Not Useful</option>
                        </select>
                      </div>

                      <p className="text-[13px] text-text-primary whitespace-pre-wrap leading-relaxed bg-surface-inset p-3.5 border border-border-standard rounded-lg font-sans">
                        {idea.explanation}
                      </p>

                      <div className="text-[11px] text-text-secondary space-y-1 font-sans">
                        <div><strong>Original Input:</strong> &ldquo;{idea.originalInput}&rdquo;</div>
                        <div><strong>Why it works:</strong> {idea.whyItWorks}</div>
                        <div><strong>Hook idea:</strong> &ldquo;{idea.possibleHook}&rdquo;</div>
                        {idea.possibleNextStep && <div><strong>Next action:</strong> {idea.possibleNextStep}</div>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-border-standard pt-3.5 text-[10px] text-text-muted font-mono flex-wrap gap-2">
                      <span>Saved: {idea.dateCreated}</span>
                      <div className="flex gap-2 items-center flex-wrap">
                        <button
                          onClick={() => handleSendToVisualStudio(idea, idea.explanation, 'Idea')}
                          className="bg-surface-inset text-text-secondary hover:text-text-primary hover:border-brand-gold border border-border-standard px-2.5 py-1.5 rounded-lg font-sans font-medium text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Lightbulb size={11} className="text-brand-gold" /> Send Visual Direction to Visual Studio
                        </button>
                        <button
                          onClick={() => handleCopyIdeaToWorkspace(idea)}
                          className="bg-brand-gold text-text-inverse hover:bg-brand-gold-hover px-3 py-1.5 rounded-lg font-sans font-semibold text-[11px] transition-colors"
                        >
                          Draft Content
                        </button>
                        <button
                          onClick={() => setSavedIdeas(prev => prev.filter(i => i.id !== idea.id))}
                          className="text-[11px] text-status-error/80 hover:text-status-error font-semibold px-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div data-guide="idea-library-grid" className="empty-state">
                <div className="empty-state-icon">💡</div>
                <h3 className="empty-state-title">No Saved Ideas</h3>
                <p className="empty-state-text">Your generated ideas will appear here once you save them.</p>
                <Button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('ideation-workspace'); }} className="mt-4" variant="outline">Explore Ideas</Button>
              </div>
            )}
          </div>
        
</ErrorBoundary>)}
                {activeTab === 'command-center' && (<ErrorBoundary fallbackTitle="Command Center Error">
          <div className="page-shell">
            {/* Hero Area / Quick Prompt */}
            <div data-guide="command-hero" className="bg-surface-primary border border-border-standard p-6 md:p-7 rounded-xl shadow-level-1 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-gold block mb-1">Editorial Command</span>
                <h2 className="font-sans text-xl md:text-2xl font-semibold text-text-primary tracking-tight">What are you working on today?</h2>
              </div>
              <div className="flex flex-col lg:flex-row gap-2.5">
                <input 
                  type="text" 
                  placeholder="e.g. 'Write a LinkedIn post about our new climate initiative...'"
                  className="flex-1 h-11 px-4 bg-surface-inset border border-border-standard rounded-lg font-sans text-[14px] text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:border-transparent transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const id = `work-${Date.now()}`;
                      setActiveWorkItem({
                        id, title: 'New Content Draft', type: 'Content', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                      });
                      setCreationMode('quick');
                      setQuickBrief({ goal: e.currentTarget.value, channel: 'LinkedIn', notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: 'Post' });
                      setActiveTab('content-workspace');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    const id = `work-${Date.now()}`;
                    setActiveWorkItem({
                      id, title: 'New Content Draft', type: 'Content', status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    });
                    setCreationMode('quick');
                    setQuickBrief({ goal: 'Draft content from command center', channel: 'LinkedIn', notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: 'Post' });
                    setActiveTab('content-workspace');
                  }}
                  className="h-11 px-5 bg-brand-gold text-text-inverse font-sans text-sm font-semibold rounded-lg shadow-xs hover:bg-brand-gold-hover transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  Start Writing <ArrowRight size={15} />
                </button>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); setActiveTab('ideation-workspace'); }}
                  className="h-11 px-5 bg-surface-primary border border-border-standard text-text-primary font-sans text-sm font-medium rounded-lg hover:bg-surface-inset transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                >
                  Explore Ideas <Lightbulb size={15} className="text-brand-gold" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
              
              {/* Left Column */}
              <div className="min-w-0 space-y-6">
                
                {/* Active Work / Needs Attention */}
                <div data-guide="command-active-work" className="flex flex-col gap-4">
                  <h3 className="font-sans text-[17px] font-bold text-text-primary flex items-center gap-2">
                    <Bookmark size={18} className="text-brand-gold" /> Active Workspace
                  </h3>
                  
                  {activeWorkItem ? (
                    <div className="card-level-2 p-5 border border-brand-gold/30 hover:border-brand-gold transition-colors cursor-pointer" onClick={() => setActiveTab('content-workspace')}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-brand-gold/10 text-brand-gold px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                            {activeWorkItem.status}
                          </span>
                          <span className="text-text-secondary font-sans text-sm">{activeWorkItem.channel || activeWorkItem.type || 'Draft'}</span>
                        </div>
                        <span className="text-text-muted text-xs">{(activeWorkItem.updatedAt || activeWorkItem.createdAt || new Date().toISOString()).split('T')[0]}</span>
                      </div>
                      <h4 className="font-sans text-lg font-bold text-text-primary mb-2">{(activeWorkItem?.title || 'Standalone Draft')}</h4>
                      <p className="font-sans text-sm text-text-secondary line-clamp-2 mb-4">
                        {activeWorkItem.draftVersions.length > 0 ? activeWorkItem.draftVersions[0].text.substring(0, 120) + '...' : 'No draft content yet. Jump in to start writing or researching.'}
                      </p>
                      
                      <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
                        {activeWorkItem.status === 'Draft' && !activeWorkItem.approved && (
                          <button onClick={() => { setActiveTab('revision-studio'); }} className="text-xs bg-surface-secondary text-text-primary border border-border-standard px-3 py-1.5 rounded-md font-semibold hover:bg-border-standard transition-colors">Revise Draft</button>
                        )}
                        {activeWorkItem.visualDirection && activeWorkItem.imageResults.length === 0 && (
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('visual-studio'); }} className="text-xs bg-brand-gold text-text-inverse px-3 py-1.5 rounded-md font-semibold hover:bg-brand-gold-hover transition-colors flex items-center gap-1"><Camera size={12}/> Create Visual</button>
                        )}
                        {activeWorkItem.status === 'Needs Source Check' && (
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-workspace'); }} className="text-xs bg-status-warning text-text-inverse px-3 py-1.5 rounded-md font-semibold hover:brightness-110 transition-colors flex items-center gap-1"><AlertCircle size={12}/> Review Source Check</button>
                        )}
                        <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-workspace'); }} className="text-xs text-text-primary font-semibold underline ml-auto self-center hover:text-brand-gold transition-colors">Open Workspace →</button>
                      </div>
                    </div>
                  ) : (
                    <div className="card-level-1 p-8 flex flex-col items-center justify-center text-center border-dashed border-2">
                      <div className="w-12 h-12 rounded-full bg-surface-inset flex items-center justify-center mb-3">
                        <FileText size={20} className="text-text-muted" />
                      </div>
                      <h4 className="font-sans text-[15px] font-bold text-text-primary mb-1">No Active Work Item</h4>
                      <p className="font-sans text-sm text-text-secondary mb-4 max-w-sm">You have a clean slate. Start a new draft using the prompt above, or continue from your libraries.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions Grid */}
                <div data-guide="command-quick-start" className="flex flex-col gap-4">
                  <h3 className="font-sans text-[17px] font-bold text-text-primary">Quick Start</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: <Globe size={16} />, label: "LinkedIn Post", format: "Post", channel: "LinkedIn" },
                      { icon: <Mail size={16} />, label: "Newsletter", format: "Section", channel: "Newsletter" },
                      { icon: <FileText size={16} />, label: "Article", format: "Article", channel: "Website" },
                      { icon: <MessageSquare size={16} />, label: "Message", format: "Message", channel: "WhatsApp" },
                      { icon: <Briefcase size={16} />, label: "Sponsor Pitch", format: "Pitch", channel: "Sponsor email" },
                      { icon: <Layers size={16} />, label: "Multi-Channel", format: "Pack", channel: "All" }
                    ].map((qa, i) => (
                      <button 
                        key={i} 
                        onClick={() => {
                          const id = `work-${Date.now()}`;
                          setActiveWorkItem({
                            id, title: `New ${qa.label}`, type: 'Content', channel: qa.channel, outputFormat: qa.format, status: 'Brief', draftVersions: [], imageResults: [], revisionHistory: [], approved: false, saved: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                          });
                          setCreationMode('quick');
                          setQuickBrief({ goal: '', channel: qa.channel, notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: qa.format });
                          setActiveTab('content-workspace');
                        }}
                        className="flex flex-col items-center justify-center gap-2 p-4 bg-surface-primary hover:bg-surface-inset border border-border-standard hover:border-brand-gold rounded-xl transition-all shadow-sm active:scale-95 group"
                      >
                        <div className="text-text-muted group-hover:text-brand-gold transition-colors">{qa.icon}</div>
                        <span className="font-sans text-xs font-semibold text-text-primary text-center">{qa.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column (1/3 width) - Studio Status & Needs Attention */}
              <div data-guide="command-status-rail" className="space-y-6">
                
                {/* Needs Attention / Alerts */}
                <div className="card-level-1 border border-border-standard overflow-hidden">
                  <div className="bg-surface-inset px-4 py-3 border-b border-border-standard">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                      <Bell size={14} className="text-text-secondary" /> Attention Needed
                    </h3>
                  </div>
                  <div className="p-4 space-y-3 bg-surface-primary">
                    {!aiProvider && (
                      <div className="flex items-start gap-2 p-3 bg-status-warning/10 rounded-lg border border-status-warning/20">
                        <AlertTriangle size={14} className="text-status-warning shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-sans text-[13px] text-text-primary font-medium mb-1.5">AI Setup Required</p>
                          <p className="font-sans text-xs text-text-secondary mb-2">Connect an API key to enable text and image generation.</p>
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('settings'); }} className="text-xs font-semibold text-brand-gold hover:underline">Go to Settings</button>
                        </div>
                      </div>
                    )}
                    
                    {savedIdeas.some(i => i.status === 'New') && (
                      <div className="flex items-start gap-2 p-3 bg-brand-gold/5 rounded-lg border border-brand-gold/20">
                        <Lightbulb size={14} className="text-brand-gold shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-sans text-[13px] text-text-primary font-medium mb-1.5">New Ideas Available</p>
                          <p className="font-sans text-xs text-text-secondary mb-2">{savedIdeas.filter(i => i.status === 'New').length} unreviewed ideas generated by the Ideation Engine.</p>
                          <button onClick={() => { setIsMobileMenuOpen(false); setActiveTab('idea-library'); }} className="text-xs font-semibold text-brand-gold hover:underline">View Ideas</button>
                        </div>
                      </div>
                    )}

                    {(!activeWorkItem || (!activeWorkItem.visualDirection && activeWorkItem.status !== 'Needs Source Check' && activeWorkItem.status !== 'Approved')) && aiProvider && savedIdeas.filter(i => i.status === 'New').length === 0 && (
                      <div className="flex flex-col items-center justify-center p-4 text-center">
                        <Check size={24} className="text-status-success mb-2 opacity-80" />
                        <p className="font-sans text-[13px] font-medium text-text-primary">All Caught Up!</p>
                        <p className="font-sans text-xs text-text-muted mt-1">Your studio is operating smoothly.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Studio Overview */}
                <div className="card-level-1 border border-border-standard overflow-hidden">
                  <div className="bg-surface-inset px-4 py-3 border-b border-border-standard">
                    <h3 className="font-sans text-[13px] font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                      <LayoutDashboard size={14} className="text-text-secondary" /> Overview
                    </h3>
                  </div>
                  <div className="p-4 bg-surface-primary">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-canvas p-3 rounded-lg border border-border-standard text-center">
                        <div className="font-sans text-2xl font-bold text-text-primary">{[...workspaceLocalSources, ...sources].length}</div>
                        <div className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Sources</div>
                      </div>
                      <div className="bg-canvas p-3 rounded-lg border border-border-standard text-center">
                        <div className="font-sans text-2xl font-bold text-text-primary">{savedContent.length}</div>
                        <div className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Saved</div>
                      </div>
                      <div className="bg-canvas p-3 rounded-lg border border-border-standard text-center col-span-2">
                        <div className="font-sans text-2xl font-bold text-brand-gold">{savedIdeas.length}</div>
                        <div className="font-sans text-[11px] font-semibold text-text-secondary uppercase tracking-wider mt-1">Generated Ideas</div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-border-standard">
                      <div className="flex items-center justify-between font-sans text-[13px] mb-2">
                        <span className="text-text-secondary">Core Rules</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${operatingCore.active ? 'bg-status-success/10 text-status-success' : 'bg-status-error/10 text-status-error'}`}>
                          {operatingCore.active ? 'Active' : 'Bypassed'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </ErrorBoundary>)}
        {/* --- EDITORIAL CALENDAR STUDIO --- */}
        {activeTab === 'editorial-calendar' && (
          <ErrorBoundary fallbackTitle="Editorial Calendar Error">
            <EditorialCalendarStudio 
              initialCalendar={calendarToLoad}
              onOpenLibrary={() => setActiveTab('calendar-library')}
              onHandoff={(workItem) => {
                setActiveWorkItem(workItem);
                setCreationMode('advanced');
                
                const advancedBriefPayload = buildAdvancedBriefFromCalendarItem(workItem);
                setAdvancedBrief(prev => ({
                  ...prev,
                  ...advancedBriefPayload
                }));
                
                setActiveTab('content-workspace');
              }}
            />
          </ErrorBoundary>
        )}
        {/* --- CALENDAR LIBRARY --- */}
        {activeTab === 'calendar-library' && (
          <ErrorBoundary fallbackTitle="Calendar Library Error">
            <CalendarLibrary 
              onOpenCalendar={(calendar) => {
                setCalendarToLoad(calendar);
                setActiveTab('editorial-calendar');
              }}
            />
          </ErrorBoundary>
        )}
        {/* --- TAB 2: CONTENT WORKSPACE --- */}
        {activeTab === 'content-workspace' && (<ErrorBoundary fallbackTitle="Content Workspace Error">
          <div className="page-shell">
            {/* Active Work Item Header (Optional) */}
            {activeWorkItem ? (
              <div className="bg-surface-primary border border-border-standard p-5 md:p-6 rounded-xl shadow-level-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="page-title">
                      {(activeWorkItem?.title || 'Standalone Draft')}
                    </h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-brand-gold/15 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-md status-badge">
                      {activeWorkItem.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-text-secondary font-sans">
                    <span>Channel: <strong className="text-text-primary">{activeWorkItem.channel || quickBrief.channel || "Not selected"}</strong></span>
                    <span>Type: <strong className="text-text-primary">{activeWorkItem.type || "Content"}</strong></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {isRenamingWorkItem ? (
                    <div className="flex items-center gap-2" data-testid="work-item-inline-rename">
                      <input
                        type="text"
                        aria-label="New work item title"
                        data-testid="work-item-rename-input"
                        value={workItemRenameInput}
                        onChange={(e) => setWorkItemRenameInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && workItemRenameInput.trim()) {
                            setActiveWorkItem(prev => prev ? { ...prev, title: workItemRenameInput.trim(), updatedAt: new Date().toISOString() } : null);
                            setIsRenamingWorkItem(false);
                          } else if (e.key === 'Escape') {
                            setIsRenamingWorkItem(false);
                          }
                        }}
                        className="h-8 px-2.5 bg-surface-inset border border-border-standard rounded-lg text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring"
                      />
                      <button
                        type="button"
                        data-testid="work-item-rename-save-btn"
                        onClick={() => {
                          if (workItemRenameInput.trim()) {
                            setActiveWorkItem(prev => prev ? { ...prev, title: workItemRenameInput.trim(), updatedAt: new Date().toISOString() } : null);
                          }
                          setIsRenamingWorkItem(false);
                        }}
                        className="h-8 px-2.5 bg-brand-gold text-text-inverse rounded-lg text-[11px] font-semibold"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRenamingWorkItem(false)}
                        className="h-8 px-2 bg-surface-inset border border-border-standard rounded-lg text-[11px] text-text-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      data-testid="work-item-rename-btn"
                      onClick={() => {
                        setWorkItemRenameInput(activeWorkItem?.title || 'Standalone Draft');
                        setIsRenamingWorkItem(true);
                      }}
                      className="text-[11px] text-text-primary underline font-semibold interactive-button"
                    >
                      Rename Work Item
                    </button>
                  )}
                  <button
                    onClick={() => { setIsRenamingWorkItem(false); setActiveWorkItem(null); }}
                    className="text-[11px] text-text-secondary hover:text-status-error underline font-semibold interactive-button mt-1"
                  >
                    Clear Workspace
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-surface-primary border border-border-standard p-5 md:p-6 rounded-xl shadow-level-1 flex flex-col lg:flex-row flex-wrap justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="page-title">Content Workspace</h2>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-surface-inset border border-border-standard text-text-secondary px-2.5 py-0.5 rounded-full">
                      Standalone Draft
                    </span>
                  </div>
                  <p className="page-subtitle">Draft, edit, and optimize individual content assets with core guidance.</p>
                </div>
              </div>
            )}

            {(() => {
              const snap = buildWorkContextSnapshot({
                activeWorkItem,
                fallbackOrigin: startedFromNote || (importedIdeationContext ? 'Ideation 2.0 Opportunity' : 'Content Workspace'),
                fallbackTitle:
                  activeWorkItem?.title ||
                  importedIdeationContext?.title ||
                  (creationMode === 'simple' ? simpleBrief.goal : creationMode === 'quick' ? quickBrief.goal : advancedBrief.topic) ||
                  'Standalone Draft',
                audience: creationMode === 'advanced' ? advancedBrief.audience : undefined,
                channel: creationMode === 'simple' ? simpleBrief.channel : creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                format: creationMode === 'quick' ? quickBrief.outputFormat : creationMode === 'advanced' ? advancedBrief.outputFormat : undefined,
                pillar: creationMode === 'advanced' ? advancedBrief.pillar : undefined,
                communicationJob: creationMode === 'advanced' ? advancedBrief.purpose : undefined,
                sourceBindings: advancedBrief.selectedSourceIds
                  .map(id => {
                    const s = [...sources, ...workspaceLocalSources].find(x => x.id === id);
                    return s
                      ? {
                          sourceId: s.id,
                          title: s.title,
                          type: s.type,
                          role: taskSourceRoleMap[s.id]?.role || inferDefaultSourceRole(s.type)
                        }
                      : null;
                  })
                  .filter(Boolean) as TaskSourceBinding[],
                currentStudio: 'Content Workspace'
              });
              return (
                <CurrentWorkContextBar
                  currentStudio="Content Workspace"
                  originLabel={snap.originLabel}
                  originTitle={snap.originTitle}
                  audience={snap.audience}
                  channel={snap.channel}
                  format={snap.format}
                  pillar={snap.pillar}
                  communicationJob={snap.communicationJob}
                  sourceBindings={snap.sourceBindings}
                  transformationTrail={snap.transformationTrail}
                  onNavigateStudio={target => setActiveTab(target)}
                  onClearWorkContext={activeWorkItem ? () => setActiveWorkItem(null) : undefined}
                />
              );
            })()}

            <ContextManifestPanel
              manifest={buildContentWorkspaceContextPackage().manifest}
              theme={theme}
            />

            <SmartBriefPanel
              smartBrief={resolveSmartBrief({
                rawRequest:
                  creationMode === 'simple'
                    ? simpleBrief.goal
                    : creationMode === 'quick'
                      ? `${quickBrief.goal} ${quickBrief.notes}`.trim()
                      : advancedBrief.topic,
                explicitChannel:
                  creationMode === 'simple'
                    ? simpleBrief.channel
                    : creationMode === 'quick'
                      ? quickBrief.channel
                      : advancedBrief.channel,
                explicitFormat:
                  creationMode === 'quick'
                    ? quickBrief.outputFormat
                    : creationMode === 'advanced'
                      ? advancedBrief.outputFormat
                      : undefined,
                explicitAudience: creationMode === 'advanced' ? advancedBrief.audience : undefined,
                explicitPurpose: creationMode === 'advanced' ? advancedBrief.purpose : undefined,
                explicitPillar: creationMode === 'advanced' ? advancedBrief.pillar : undefined,
                explicitLanguage:
                  creationMode === 'quick'
                    ? quickBrief.language
                    : creationMode === 'advanced'
                      ? advancedBrief.language
                      : undefined,
                explicitLength: creationMode === 'advanced' ? advancedBrief.desiredLength : undefined,
                explicitDirection: creationMode === 'advanced' ? advancedBrief.customDirection : undefined,
                selectedSourceIds: advancedBrief.selectedSourceIds,
                inheritedWorkContext: extractWorkContextFromWorkItem(activeWorkItem),
                operatingCore,
                availableSources: [...selectableSources, ...workspaceLocalSources]
              })}
              speedMode={generationSpeedMode}
              onChangeSpeedMode={setGenerationSpeedMode}
              onApplySmartBrief={(resolved: ResolvedSmartBrief) => {
                setSimpleBrief(prev => ({
                  ...prev,
                  goal: resolved.topic.value || prev.goal,
                  channel: resolved.channel.value
                }));
                setQuickBrief(prev => ({
                  ...prev,
                  goal: resolved.topic.value || prev.goal,
                  channel: resolved.channel.value,
                  outputFormat: resolved.outputFormat.value,
                  language: resolved.language.value
                }));
                setAdvancedBrief(prev => ({
                  ...prev,
                  topic: resolved.topic.value || prev.topic,
                  channel: resolved.channel.value,
                  outputFormat: resolved.outputFormat.value,
                  audience: resolved.audience.value,
                  purpose: resolved.purpose.value,
                  pillar: resolved.pillar.value,
                  language: resolved.language.value,
                  desiredLength: resolved.desiredLength.value,
                  customDirection: resolved.directionAngle.value
                }));
              }}
              onSelectSuggestedSource={(sourceId: string) => {
                setAdvancedBrief(prev => ({
                  ...prev,
                  selectedSourceIds: prev.selectedSourceIds.includes(sourceId)
                    ? prev.selectedSourceIds
                    : [...prev.selectedSourceIds, sourceId]
                }));
              }}
            />

            {/* Validation warning block */}
            {validationWarning && (
              <div className="bg-status-error/10 border border-status-error/30 p-3.5 rounded-xl text-xs text-status-error font-semibold flex items-center gap-2">
                <AlertTriangle size={15} />
                <span>{validationWarning}</span>
              </div>
            )}

            {/* Outdated generation alert banner */}
            {isBriefOutdated && (
              <div className="bg-status-warning/10 border border-status-warning/25 p-3.5 rounded-xl text-xs text-text-primary flex justify-between items-center">
                <span>Inputs changed. Regenerate to apply the latest brief.</span>
                <button
                  disabled={isGeneratingDrafts || aiIsGenerating}
                  onClick={handleGenerateDrafts}
                  className="bg-brand-gold text-text-inverse px-3 py-1.5 rounded-lg text-[11px] font-semibold shadow-xs hover:bg-brand-gold-hover transition disabled:opacity-50 disabled:cursor-not-allowed action-button interactive-button"
                >
                  {isGeneratingDrafts ? 'Generating...' : 'Generate Again'}
                </button>
              </div>
            )}

            {/* Honest Prototype Banner */}
            <div className="bg-surface-inset border border-border-standard px-4 py-3 rounded-xl text-xs text-text-secondary flex justify-between items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-brand-gold shrink-0" />
                <span>Needs review: drafts are generated by local logic. For final-quality copy, use Prompt Builder or connect an AI model.</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold">
                  Rules Active
                </span>
              </div>
            </div>

            {/* Two-Column Creation & Output Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[440px_minmax(0,1fr)] gap-6 xl:gap-8 items-start">
              
              {/* PANEL 1: CREATE CONTENT (Unified Mode + Starters + Brief + Generation) */}
              <div data-guide="content-creation-card" className="min-w-0 card-level-1 p-5 border border-border-standard space-y-4 text-xs">
                <div className="border-b border-border-standard pb-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-sans text-base font-bold text-text-primary">
                      Create Content
                    </h3>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-gold font-semibold">
                      {creationMode === 'simple' ? 'Simple' : creationMode === 'quick' ? 'Quick Create' : 'Advanced Brief'}
                    </span>
                  </div>

                  {/* Unified Creation Mode Segmented Selector */}
                  <div
                    data-guide="content-mode-selector"
                    data-testid="content-mode-selector"
                    role="tablist"
                    aria-label="Content creation mode"
                    className="grid grid-cols-3 bg-surface-inset p-1 rounded-lg border border-border-standard gap-1"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={creationMode === 'simple'}
                      onClick={() => setCreationMode('simple')}
                      className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                        creationMode === 'simple'
                          ? 'bg-surface-primary text-brand-gold shadow-xs border border-border-standard'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Simple
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={creationMode === 'quick'}
                      onClick={() => setCreationMode('quick')}
                      className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                        creationMode === 'quick'
                          ? 'bg-surface-primary text-brand-gold shadow-xs border border-border-standard'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Quick Create
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={creationMode === 'advanced'}
                      onClick={() => setCreationMode('advanced')}
                      className={`min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all text-center ${
                        creationMode === 'advanced'
                          ? 'bg-surface-primary text-brand-gold shadow-xs border border-border-standard'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      Advanced Brief
                    </button>
                  </div>

                  {/* Contextual Mode Explanation */}
                  <p data-testid="content-mode-helper" className="text-[11px] text-text-secondary leading-relaxed">
                    {creationMode === 'simple'
                      ? 'Tell us what you need and choose a channel. The Studio will infer the rest.'
                      : creationMode === 'quick'
                        ? 'Add a little more direction without building a complete brief.'
                        : 'Control audience, intent, format, language, tone, evidence, and production details.'}
                  </p>
                </div>

                {/* Integrated Content Starters (Optional Pre-fill Access) */}
                <div data-guide="content-starters" className="bg-surface-inset/70 border border-border-standard rounded-lg p-3 space-y-2.5">
                  <div
                    className="flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setShowContentStarters(!showContentStarters)}
                  >
                    <div>
                      <span className="font-semibold text-text-primary text-xs block">Content Starters</span>
                      <span className="text-[10px] text-text-secondary">Optional templates &amp; example briefs that pre-fill editable fields below.</span>
                    </div>
                    <button
                      type="button"
                      className="text-[11px] text-brand-gold font-semibold bg-surface-primary border border-border-standard px-2.5 py-1 rounded-md shrink-0"
                    >
                      {showContentStarters ? 'Hide Starters' : 'Show Starters'}
                    </button>
                  </div>

                  {startedFromNote && startedFromNote.startsWith('Starter applied:') && (
                    <div
                      data-testid="content-starter-feedback"
                      className="bg-brand-gold/10 border border-brand-gold/30 rounded-md px-2.5 py-2 flex items-center justify-between gap-2 text-[11px] text-text-primary"
                    >
                      <span className="font-medium">{startedFromNote}</span>
                      <button
                        type="button"
                        onClick={() => setStartedFromNote('')}
                        className="text-[10px] text-text-secondary hover:text-text-primary underline shrink-0"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {showContentStarters && (
                    <div className="space-y-3 pt-2 border-t border-border-standard">
                      <div className="space-y-1.5">
                        <span className="font-medium block text-text-secondary text-[11px]">Templates:</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {CONTENT_TEMPLATES.map(temp => (
                            <button
                              key={temp.name}
                              type="button"
                              onClick={() => applyTemplate(temp)}
                              className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1.5 px-2.5 rounded-md text-[11px] transition font-medium"
                              title={temp.desc}
                            >
                              {temp.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="font-medium block text-text-secondary text-[11px]">Example Briefs:</span>
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => applyExampleChip('tetralogy')}
                            className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1 px-2.5 rounded-md text-[10.5px] transition font-medium"
                          >
                            Announce Tetralogy
                          </button>
                          <button
                            type="button"
                            onClick={() => applyExampleChip('cultural-ip')}
                            className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1 px-2.5 rounded-md text-[10.5px] transition font-medium"
                          >
                            Cultural IP &amp; Model
                          </button>
                          <button
                            type="button"
                            onClick={() => applyExampleChip('event-notes')}
                            className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1 px-2.5 rounded-md text-[10.5px] transition font-medium"
                          >
                            Nordic Air (Soria Moria)
                          </button>
                          <button
                            type="button"
                            onClick={() => applyExampleChip('instagram-img')}
                            className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1 px-2.5 rounded-md text-[10.5px] transition font-medium"
                          >
                            Water Dragon Caption
                          </button>
                          <button
                            type="button"
                            onClick={() => applyExampleChip('sponsor-facing')}
                            className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1 px-2.5 rounded-md text-[10.5px] transition font-medium"
                          >
                            Patron Pitch Paragraph
                          </button>
                          <button
                            type="button"
                            onClick={() => applyExampleChip('newsletter-update')}
                            className="bg-surface-primary hover:border-brand-gold hover:text-text-primary text-text-secondary border border-border-standard py-1 px-2.5 rounded-md text-[10.5px] transition font-medium"
                          >
                            Earth Canon Update
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {creationMode === 'simple' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-text-secondary font-semibold mb-0.5">What do you want to create?</label>
                      <p className="text-[10px] text-text-secondary mb-1.5">Describe the message, topic, idea, announcement, question, or content you want to create.</p>
                      <textarea
                        rows={6}
                        value={simpleBrief.goal}
                        onChange={(e) => setSimpleBrief({ ...simpleBrief, goal: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary"
                        placeholder="Draft a partner update about the new Climate Canon project..."
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Channel
                      </label>
                      <select
                        value={simpleBrief.channel}
                        onChange={(e) => setSimpleBrief({ ...simpleBrief, channel: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                      >
                        {CHANNELS.map(ch => (
                          <option key={ch} value={ch}>{ch}</option>
                        ))}
                      </select>
                    </div>

                    <div data-guide="content-context" className="bg-surface-inset border border-border-standard p-3 rounded space-y-3">
                      <label className="block text-text-primary font-bold mb-1 text-[11px] uppercase tracking-wider">
                        Add Context (Optional)
                      </label>
                      <div className="flex gap-1.5 bg-surface-inset p-1 rounded">
                        {(['paste', 'upload', 'link'] as const).map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setInlineSourceType(mode)}
                            className={`flex-1 text-[10px] font-bold py-1 rounded transition uppercase ${
                              inlineSourceType === mode ? 'bg-slate-900 text-white' : 'text-text-secondary hover:bg-surface-primary'
                            }`}
                          >
                            {mode === 'link' ? 'URL' : mode}
                          </button>
                        ))}
                      </div>

                      {inlineSourceType === 'paste' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Source Title"
                            value={inlinePasteData.title}
                            onChange={(e) => setInlinePasteData({ ...inlinePasteData, title: e.target.value })}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                          />
                          <textarea
                            rows={3}
                            placeholder="Paste source text..."
                            value={inlinePasteData.content}
                            onChange={(e) => setInlinePasteData({ ...inlinePasteData, content: e.target.value })}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px] font-mono"
                          />
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={inlinePasteData.saveToLibrary}
                                onChange={(e) => setInlinePasteData({ ...inlinePasteData, saveToLibrary: e.target.checked })}
                              />
                              Save to Source Library
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddWorkspaceSource('paste')}
                              className="bg-slate-900 text-white px-2.5 py-1 rounded font-sans font-bold text-[10px]"
                            >
                              {inlinePasteData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                            </button>
                          </div>
                        </div>
                      )}

                      {inlineSourceType === 'link' && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Source Name"
                            value={inlineLinkData.title}
                            onChange={(e) => setInlineLinkData({ ...inlineLinkData, title: e.target.value })}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            placeholder="URL (https://...)"
                            value={inlineLinkData.url}
                            onChange={(e) => setInlineLinkData({ ...inlineLinkData, url: e.target.value })}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                          />
                          <p className="text-[9px] text-text-muted">Paste the relevant excerpt or summary so the system knows what to use. The app may not read the webpage automatically yet.</p>
                          <textarea
                            rows={2}
                            placeholder="Relevant excerpt or summary..."
                            value={inlineLinkData.summary}
                            onChange={(e) => setInlineLinkData({ ...inlineLinkData, summary: e.target.value })}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                          />
                          {linkWarning && (
                            <p className="text-[9px] text-amber-700 bg-amber-500/10 backdrop-blur-md p-1.5 rounded border border-amber-200 leading-normal font-semibold">
                              {linkWarning}
                            </p>
                          )}
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={inlineLinkData.saveToLibrary}
                                onChange={(e) => setInlineLinkData({ ...inlineLinkData, saveToLibrary: e.target.checked })}
                              />
                              Save to Source Library
                            </label>
                            <button
                              type="button"
                              onClick={handleAddWorkspaceLink}
                              className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all bg-slate-900 text-white px-2.5 py-1 rounded font-sans font-bold text-[10px] action-button interactive-button"
                            >
                              {inlineLinkData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                            </button>
                          </div>
                        </div>
                      )}

                      {inlineSourceType === 'upload' && (
                        <div className="space-y-2">
                          <input
                            type="file"
                            ref={inlineFileInputRef}
                            onChange={handleWorkspaceFileUpload}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => inlineFileInputRef.current?.click()}
                            className="w-full bg-surface-primary border border-border-standard hover:bg-surface-primary-dark p-2 rounded text-center text-[11px] font-semibold text-text-primary"
                          >
                            Upload File
                          </button>
                          <p className="text-[9px] text-text-muted text-center">Supported: .txt files only. PDF parsing not currently supported.</p>
                          {inlineUploadData.title && (
                            <div className="text-[10px] text-text-secondary italic truncate">
                              Selected: {inlineUploadData.title}
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={inlineUploadData.saveToLibrary}
                                onChange={(e) => setInlineUploadData({ ...inlineUploadData, saveToLibrary: e.target.checked })}
                              />
                              Save to Source Library
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddWorkspaceSource('upload')}
                              disabled={!inlineUploadData.title}
                              className="bg-slate-900 text-white px-2.5 py-1 rounded font-sans font-bold text-[10px] disabled:opacity-50"
                            >
                              {inlineUploadData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : creationMode === 'quick' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-text-secondary font-semibold mb-0.5">What do you want to create or explore?</label>
                      <p className="text-[10px] text-text-secondary mb-1.5">Enter a question, idea, topic, phrase, paragraph, campaign angle, message, or rough thought.</p>
                      <textarea
                        rows={2}
                        value={quickBrief.goal}
                        onChange={(e) => setQuickBrief({ ...quickBrief, goal: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary"
                        placeholder="Specify campaign goal or theme..."
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Creation Scope <Tooltip text="Choose Single Channel for one output, or Multi-Channel Pack to adapt one idea across several channels." />
                      </label>
                      <select
                        value={quickBrief.creationScope || 'Single Channel'}
                        onChange={(e) => {
                          const val = e.target.value as 'Single Channel' | 'Multi-Channel Pack';
                          setQuickBrief(prev => ({
                            ...prev,
                            creationScope: val,
                            outputFormat: CHANNEL_FORMATS[prev.channel]?.[0] || 'Post'
                          }));
                          setFormatAdjustedNote('');
                        }}
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                      >
                        <option value="Single Channel">Single Channel</option>
                        <option value="Multi-Channel Pack">Multi-Channel Pack</option>
                      </select>
                    </div>

                    {quickBrief.creationScope === 'Multi-Channel Pack' ? (
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">Target Channels</label>
                        <div className="grid grid-cols-2 gap-2 bg-surface-inset p-2.5 border border-border-standard rounded max-h-32 overflow-y-auto">
                          {CHANNELS.map(ch => {
                            const isChecked = quickBrief.targetChannels?.includes(ch);
                            return (
                              <label key={ch} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const list = quickBrief.targetChannels || [];
                                    const nextList = list.includes(ch) ? list.filter(item => item !== ch) : [...list, ch];
                                    setQuickBrief(prev => ({ ...prev, targetChannels: nextList }));
                                  }}
                                  className="rounded border-brand-gold text-brand-gold focus:ring-coh-gold"
                                />
                                {ch}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-text-secondary font-semibold">
                              Channel <Tooltip text="Where this content will be used." />
                            </label>
                          </div>
                          <select
                            value={quickBrief.channel}
                            onChange={(e) => handleChannelChange(e.target.value, false)}
                            className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                          >
                            {CHANNELS.map(ch => (
                              <option key={ch} value={ch}>{ch}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-text-secondary font-semibold mb-1">
                            Output Format <Tooltip text="What type of content you want to create." />
                          </label>
                          <select
                            value={quickBrief.outputFormat}
                            onChange={(e) => {
                              setQuickBrief({ ...quickBrief, outputFormat: e.target.value });
                              setFormatAdjustedNote('');
                            }}
                            className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                          >
                            {(CHANNEL_FORMATS[quickBrief.channel] || []).map(fmt => (
                              <option key={fmt} value={fmt}>{fmt}</option>
                            ))}
                          </select>
                        </div>
                        {formatAdjustedNote && (
                          <div className="col-span-2 text-[10px] text-brand-gold bg-surface-inset p-2 rounded border border-border-standard animate-fadeIn mt-1 font-semibold">
                            {formatAdjustedNote}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">
                          Language <Tooltip text="The language of the final output. English is the default." />
                        </label>
                        <select
                          value={quickBrief.language}
                          onChange={(e) => setQuickBrief({ ...quickBrief, language: e.target.value })}
                          className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                        >
                          {LANGUAGES.map(l => (
                          <option key={l.id} value={l.label}>{l.label}</option>
                        ))}
                        </select>
                      </div>
                    </div>

                    <div data-guide="content-context">
                      <label className="block text-text-secondary font-semibold mb-1">Paste Notes or Source Material</label>
                      <textarea
                        rows={5}
                        value={quickBrief.notes}
                        onChange={(e) => setQuickBrief({ ...quickBrief, notes: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary font-mono text-[11px]"
                        placeholder="Paste notes, facts, article excerpts, image descriptions, or source material."
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Optional: Must Include <Tooltip text="Facts, phrases, names, or points that must appear in the output." />
                      </label>
                      <input
                        type="text"
                        value={quickBrief.mustInclude}
                        onChange={(e) => setQuickBrief({ ...quickBrief, mustInclude: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary"
                        placeholder="Add phrases, facts, or points that must appear."
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Optional: Must Avoid <Tooltip text="Words, claims, tones, or topics the output should avoid." />
                      </label>
                      <input
                        type="text"
                        value={quickBrief.mustAvoid}
                        onChange={(e) => setQuickBrief({ ...quickBrief, mustAvoid: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary"
                        placeholder="Add words, claims, or tones to avoid."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeWorkItem?.calendarItemId && (
                      <div className="bg-violet-600/10 border border-border-strong p-3 rounded flex flex-col gap-1 text-xs">
                        <div className="font-bold text-text-primary">📅 Created from Editorial Calendar</div>
                        <div className="text-text-secondary">
                          This brief was generated from a strategic calendar item. 
                          <button onClick={() => setActiveTab('editorial-calendar')} className="text-brand-gold underline ml-2 hover:text-text-primary">
                            Back to Calendar
                          </button>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-text-secondary font-semibold mb-0.5">What should this content respond to or develop?</label>
                      <p className="text-[10px] text-text-secondary mb-1.5">Use a question, argument, rough idea, campaign message, paragraph, comparison, or content direction.</p>
                      <textarea
                        rows={2}
                        value={advancedBrief.topic}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, topic: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                        placeholder="Announce the canon or specific post topic..."
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Creation Intent <Tooltip text="Tell the system what kind of thinking or structure is needed for this content." />
                      </label>
                      <select
                        value={advancedBrief.creationIntent || 'Infer automatically'}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, creationIntent: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary"
                      >
                        <option value="Infer automatically">Infer automatically</option>
                        <option value="Answer a question">Answer a question</option>
                        <option value="Explain an idea">Explain an idea</option>
                        <option value="Develop an argument">Develop an argument</option>
                        <option value="Create awareness">Create awareness</option>
                        <option value="Promote an action">Promote an action</option>
                        <option value="Educate the audience">Educate the audience</option>
                        <option value="Compare perspectives">Compare perspectives</option>
                        <option value="Build emotional connection">Build emotional connection</option>
                        <option value="Announce something">Announce something</option>
                        <option value="Generate story ideas">Generate story ideas</option>
                        <option value="Create a direct message">Create a direct message</option>
                        <option value="Create a campaign angle">Create a campaign angle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Creation Scope <Tooltip text="Choose Single Channel for one output, or Multi-Channel Pack to adapt one idea across several channels." />
                      </label>
                      <select
                        value={advancedBrief.creationScope || 'Single Channel'}
                        onChange={(e) => {
                          const val = e.target.value as 'Single Channel' | 'Multi-Channel Pack';
                          setAdvancedBrief(prev => ({
                            ...prev,
                            creationScope: val,
                            outputFormat: CHANNEL_FORMATS[prev.channel]?.[0] || 'Post'
                          }));
                          setFormatAdjustedNote('');
                        }}
                        className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                      >
                        <option value="Single Channel">Single Channel</option>
                        <option value="Multi-Channel Pack">Multi-Channel Pack</option>
                      </select>
                    </div>

                    {advancedBrief.creationScope === 'Multi-Channel Pack' ? (
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">Target Channels</label>
                        <div className="grid grid-cols-2 gap-2 bg-surface-inset p-2 border border-border-standard rounded max-h-32 overflow-y-auto font-sans">
                          {CHANNELS.map(ch => {
                            const isChecked = advancedBrief.targetChannels?.includes(ch);
                            return (
                              <label key={ch} className="flex items-center gap-2 text-xs text-text-primary cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const list = advancedBrief.targetChannels || [];
                                    const nextList = list.includes(ch) ? list.filter(item => item !== ch) : [...list, ch];
                                    setAdvancedBrief(prev => ({ ...prev, targetChannels: nextList }));
                                  }}
                                  className="rounded border-brand-gold text-brand-gold focus:ring-coh-gold"
                                />
                                {ch}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-text-secondary font-semibold mb-1">
                            Channel <Tooltip text="Where this content will be used." />
                          </label>
                          <select
                            value={advancedBrief.channel}
                            onChange={(e) => handleChannelChange(e.target.value, true)}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                          >
                            {CHANNELS.map(ch => (
                              <option key={ch} value={ch}>{ch}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-text-secondary font-semibold mb-1">
                            Output Format <Tooltip text="What type of content you want to create." />
                          </label>
                          <select
                            value={advancedBrief.outputFormat}
                            onChange={(e) => {
                              setAdvancedBrief({ ...advancedBrief, outputFormat: e.target.value });
                              setFormatAdjustedNote('');
                            }}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                          >
                            {(CHANNEL_FORMATS[advancedBrief.channel] || []).map(fmt => (
                              <option key={fmt} value={fmt}>{fmt}</option>
                            ))}
                          </select>
                        </div>
                        {formatAdjustedNote && (
                          <div className="col-span-2 text-[10px] text-brand-gold bg-surface-inset p-2 rounded border border-border-standard animate-fadeIn mt-1 font-semibold">
                            {formatAdjustedNote}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">
                          Content Pillar <Tooltip text="The main COH topic area this content belongs to. It helps the system frame the content correctly." />
                        </label>
                        <select
                          value={advancedBrief.pillar}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, pillar: e.target.value })}
                          className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                        >
                          <option value="General / Custom">General / Custom</option>
                          <option value="Climate Tetralogy & Canon">Climate Tetralogy & Canon</option>
                          <option value="Opera Worlds & Artistic Method">Opera Worlds & Artistic Method</option>
                          <option value="Production & Behind the Work">Production & Behind the Work</option>
                          <option value="Documentary, Media & Cultural IP">Documentary, Media & Cultural IP</option>
                          <option value="Partnerships, Sponsorship & Institutional Value">Partnerships, Sponsorship & Institutional Value</option>
                          <option value="Events, Convenings & Public Moments">Events, Convenings & Public Moments</option>
                          <option value="Education, Community & Climate Literacy">Education, Community & Climate Literacy</option>
                          <option value="Team, Leadership & Proof">Team, Leadership & Proof</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">
                          Language <Tooltip text="The language of the final output. English is the default." />
                        </label>
                        <select
                          value={advancedBrief.language}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, language: e.target.value })}
                          className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                        >
                          {LANGUAGES.map(l => (
                          <option key={l.id} value={l.label}>{l.label}</option>
                        ))}
                        </select>
                      </div>
                    </div>

                    {/* Revamped Audience Selector */}
                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Audience <Tooltip text="Who this content is for. The audience changes the language, proof points, level of explanation, and call to action." />
                      </label>
                      <select
                        value={advancedBrief.audience}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, audience: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                      >
                        <option value="General Public">General Public</option>
                        <option value="Cultural Audience">Cultural Audience</option>
                        <option value="Opera Audience">Opera Audience</option>
                        <option value="Cultural Institutions & Festivals">Cultural Institutions & Festivals</option>
                        <option value="Sponsors & Patrons">Sponsors & Patrons</option>
                        <option value="Strategic Partners">Strategic Partners</option>
                        <option value="Climate, Policy & Philanthropy Leaders">Climate, Policy & Philanthropy Leaders</option>
                        <option value="Media & Journalists">Media & Journalists</option>
                        <option value="Education & Community">Education & Community</option>
                        <option value="Internal Team">Internal Team</option>
                        <option value="Custom Audience">Custom Audience</option>
                      </select>
                      
                      {/* Dynamic Audience preview notes */}
                      <p className="text-[10px] text-brand-gold font-semibold mt-1">
                        Preview: {getAudienceExplanation(advancedBrief.audience)}
                      </p>
                    </div>

                    {advancedBrief.audience === 'Custom Audience' && (
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">Describe the audience</label>
                        <textarea
                          value={advancedBrief.customAudience}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, customAudience: e.target.value })}
                          className="w-full min-h-[80px] resize-y bg-surface-primary border border-border-standard p-2 rounded text-text-primary text-xs"
                          placeholder="Example: Nordic cultural funders, climate-tech executives, opera patrons, or local community partners"
                        />
                        <p className="text-[9px] text-text-muted mt-1">Describe the group in plain language so the system can adapt tone, vocabulary, and CTA.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">
                          Purpose <Tooltip text="Why you are creating this content. Example: credibility, sponsor interest, audience education, event follow-up." />
                        </label>
                        <select
                          value={advancedBrief.purpose}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, purpose: e.target.value })}
                          className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                        >
                          <option value="General / Open">General / Open</option>
                          <option value="Awareness">Awareness</option>
                          <option value="Credibility">Credibility</option>
                          <option value="Artistic Explanation">Artistic Explanation</option>
                          <option value="Institutional Positioning">Institutional Positioning</option>
                          <option value="Partner Attraction">Partner Attraction</option>
                          <option value="Sponsor Interest">Sponsor Interest</option>
                          <option value="Funding Support">Funding Support</option>
                          <option value="Event Follow-Up">Event Follow-Up</option>
                          <option value="Proof Point">Proof Point</option>
                          <option value="Thought Leadership">Thought Leadership</option>
                          <option value="Audience Education">Audience Education</option>
                          <option value="Behind-the-Scenes">Behind-the-Scenes</option>
                          <option value="Direct Outreach">Direct Outreach</option>
                          <option value="Community Engagement">Community Engagement</option>
                          <option value="Internal Alignment">Internal Alignment</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Framing Mode <Tooltip text="Choose whether the system suggests a framing approach, writes directly from the brief, or follows your custom framing." />
                      </label>
                      <select
                        value={advancedBrief.directionMode}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, directionMode: e.target.value as any })}
                        className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                      >
                        <option value="auto">Use Suggested Framing</option>
                        <option value="none">Create Directly From Brief</option>
                        <option value="custom">Use My Own Framing</option>
                      </select>
                    </div>

                    {advancedBrief.directionMode === 'custom' && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <label className="block text-text-secondary font-semibold">Describe your framing</label>
                          <Tooltip text="Framing tells the system how to shape the message before writing. It is not the final copy." />
                        </div>
                        <textarea
                          rows={2}
                          value={advancedBrief.customDirection}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, customDirection: e.target.value })}
                          className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary text-xs"
                          placeholder="Example: Position this as a sponsor opportunity, not a public announcement."
                        />
                      </div>
                    )}

                    {advancedBrief.directionMode === 'auto' && (
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">Selected Framing</label>
                        <select
                          value={advancedBrief.angle}
                          onChange={(e) => {
                            if (e.target.value === 'Write My Own Direction') {
                              setAdvancedBrief({ ...advancedBrief, directionMode: 'custom', angle: 'Write My Own Direction' });
                            } else if (e.target.value === 'Create From Scratch / No Direction') {
                              setAdvancedBrief({ ...advancedBrief, directionMode: 'none', angle: 'Create From Scratch / No Direction' });
                            } else {
                              setAdvancedBrief({ ...advancedBrief, angle: e.target.value });
                            }
                          }}
                          className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                        >
                          <option value="Create From Scratch / No Direction">Create Directly From Brief</option>
                          <option value="Write My Own Direction">Use My Own Framing</option>
                          {getDynamicDirections().map(d => (
                            <option key={d.title} value={d.title}>{d.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Add / Select Sources (INTEGRATED IN BRIEF) */}
                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Selected Sources <Tooltip text="Specific notes, links, files, or summaries used for this draft. Operating Core rules are always active separately." />
                      </label>
                      
                      <div className="border border-border-standard p-2.5 rounded bg-surface-inset max-h-48 overflow-y-auto space-y-2 text-[11px] mb-3" data-testid="workspace-selected-sources-list">
                        {[...selectableSources, ...workspaceLocalSources].map(src => {
                          const isSel = advancedBrief.selectedSourceIds.includes(src.id);
                          const activeRole = getEffectiveSourceRole(src);
                          const activeExcerpts = getEffectiveSourceExcerpts(src.id);
                          return (
                            <div key={src.id} className="space-y-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <label className="flex items-center gap-1.5 min-w-0 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isSel}
                                    onChange={() => toggleSourceSelection(src.id)}
                                    data-testid={`workspace-source-checkbox-${src.id}`}
                                    className="rounded border-brand-gold/50 text-brand-gold scale-75 shrink-0"
                                  />
                                  <span className="truncate font-medium">{src.title}</span>
                                </label>
                                {workspaceLocalSources.some(w => w.id === src.id) && (
                                  <span className="text-[8px] bg-violet-600/20 text-text-primary px-1 rounded shrink-0">Local</span>
                                )}
                              </div>
                              {isSel && (
                                <div
                                  className="pl-5 flex flex-wrap items-center gap-1.5 text-[10px]"
                                  data-testid={`workspace-source-role-bar-${src.id}`}
                                >
                                  <span className="text-text-secondary font-semibold">Role:</span>
                                  <select
                                    value={activeRole}
                                    onChange={(e) => handleChangeSourceTaskRole(src.id, e.target.value as SourceTaskRole)}
                                    data-testid={`workspace-source-role-select-${src.id}`}
                                    aria-label={`Workspace role for ${src.title}`}
                                    className="bg-surface-primary border border-border-standard rounded px-1.5 py-0.5 text-[10px] font-semibold text-text-primary"
                                  >
                                    {ALL_SOURCE_TASK_ROLES.map(r => (
                                      <option key={r} value={r}>{r}</option>
                                    ))}
                                  </select>
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-gold/15 text-brand-gold font-mono">
                                    {activeExcerpts.length > 0 ? `${activeExcerpts.length} excerpt(s)` : 'Bounded source'}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {[...selectableSources, ...workspaceLocalSources].length === 0 && (
                          <span className="text-text-muted block text-center py-2">
                            No user sources selected. You can still draft from your notes, but source-backed content is stronger.
                          </span>
                        )}
                      </div>

                      {/* INLINE SOURCE ADD PANEL - Add URL */}
                      <div className="border border-border-standard p-3 rounded bg-surface-inset space-y-2">
                        <div className="flex gap-1.5 bg-surface-inset p-1 rounded">
                          {(['paste', 'upload', 'link'] as const).map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setInlineSourceType(mode)}
                              className={`flex-1 text-[10px] font-bold py-1 rounded transition uppercase ${
                                inlineSourceType === mode ? 'bg-slate-900 text-white' : 'text-text-secondary hover:bg-surface-primary'
                              }`}
                            >
                              {mode === 'link' ? 'URL' : mode}
                            </button>
                          ))}
                        </div>

                        {inlineSourceType === 'paste' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Source Title"
                              value={inlinePasteData.title}
                              onChange={(e) => setInlinePasteData({ ...inlinePasteData, title: e.target.value })}
                              className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                            />
                            <textarea
                              rows={3}
                              placeholder="Paste source text..."
                              value={inlinePasteData.content}
                              onChange={(e) => setInlinePasteData({ ...inlinePasteData, content: e.target.value })}
                              className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px] font-mono"
                            />
                            <div className="flex justify-between items-center text-[10px]">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={inlinePasteData.saveToLibrary}
                                  onChange={(e) => setInlinePasteData({ ...inlinePasteData, saveToLibrary: e.target.checked })}
                                />
                                Save to Source Library
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddWorkspaceSource('paste')}
                                className="bg-slate-900 text-white px-2.5 py-1 rounded font-sans font-bold text-[10px]"
                              >
                                {inlinePasteData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                              </button>
                            </div>
                          </div>
                        )}

                        {inlineSourceType === 'link' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Source Name"
                              value={inlineLinkData.title}
                              onChange={(e) => setInlineLinkData({ ...inlineLinkData, title: e.target.value })}
                              className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                            />
                            <input
                              type="text"
                              placeholder="URL (https://...)"
                              value={inlineLinkData.url}
                              onChange={(e) => setInlineLinkData({ ...inlineLinkData, url: e.target.value })}
                              className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                            />
                            <p className="text-[9px] text-text-muted">Paste the relevant excerpt or summary so the system knows what to use. The app may not read the webpage automatically yet.</p>
                            
                            <textarea
                              rows={2}
                              placeholder="Relevant excerpt or summary..."
                              value={inlineLinkData.summary}
                              onChange={(e) => setInlineLinkData({ ...inlineLinkData, summary: e.target.value })}
                              className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-[11px]"
                            />
                            
                            {linkWarning && (
                              <p className="text-[9px] text-amber-700 bg-amber-500/10 backdrop-blur-md p-1.5 rounded border border-amber-200 leading-normal font-semibold">
                                {linkWarning}
                              </p>
                            )}

                            <div className="flex justify-between items-center text-[10px]">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={inlineLinkData.saveToLibrary}
                                  onChange={(e) => setInlineLinkData({ ...inlineLinkData, saveToLibrary: e.target.checked })}
                                />
                                Save to Source Library
                              </label>
                              <button
                                type="button"
                                onClick={handleAddWorkspaceLink}
                                className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all bg-slate-900 text-white px-2.5 py-1 rounded font-sans font-bold text-[10px] action-button interactive-button"
                              >
                                Add URL
                              </button>
                            </div>
                          </div>
                        )}

                        {inlineSourceType === 'upload' && (
                          <div className="space-y-2">
                            <input
                              type="file"
                              ref={inlineFileInputRef}
                              onChange={handleWorkspaceFileUpload}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => inlineFileInputRef.current?.click()}
                              className="w-full bg-surface-primary border border-border-standard hover:bg-surface-primary-dark p-2 rounded text-center text-[11px] font-semibold text-text-primary"
                            >
                              Upload File
                            </button>
                            <p className="text-[9px] text-text-muted text-center">Supported: .txt files only. PDF parsing not currently supported.</p>
                            {inlineUploadData.title && (
                              <div className="text-[10px] text-text-secondary italic truncate">
                                Selected: {inlineUploadData.title}
                              </div>
                            )}
                            <div className="flex justify-between items-center text-[10px]">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={inlineUploadData.saveToLibrary}
                                  onChange={(e) => setInlineUploadData({ ...inlineUploadData, saveToLibrary: e.target.checked })}
                                />
                                Save to Source Library
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddWorkspaceSource('upload')}
                                disabled={!inlineUploadData.title}
                                className="bg-slate-900 text-white px-2.5 py-1 rounded font-sans font-bold text-[10px] disabled:opacity-50"
                              >
                                {inlineUploadData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Must Include <Tooltip text="Facts, phrases, names, or points that must appear in the output." />
                      </label>
                      <input
                        type="text"
                        value={advancedBrief.mustInclude}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, mustInclude: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary"
                        placeholder="Add phrases, facts, or points that must appear."
                      />
                    </div>

                    <div>
                      <label className="block text-text-secondary font-semibold mb-1">
                        Must Avoid <Tooltip text="Words, claims, tones, or topics the output should avoid." />
                      </label>
                      <input
                        type="text"
                        value={advancedBrief.mustAvoid}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, mustAvoid: e.target.value })}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded text-text-primary"
                        placeholder="Add words, claims, or tones to avoid."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-text-secondary font-semibold mb-1">
                          Desired Length <Tooltip text="Controls the approximate size of the output. Longer formats are better for newsletters, articles, and partner notes." />
                        </label>
                        <select
                          value={advancedBrief.desiredLength}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, desiredLength: e.target.value })}
                          className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                        >
                          <option value="Short: 50-80 words">Short: 50-80 words</option>
                          <option value="Medium: 120-180 words">Medium: 120-180 words</option>
                          <option value="Long: 250-350 words">Long: 250-350 words</option>
                          <option value="Extended: 400-700 words">Extended: 400-700 words</option>
                          <option value="Article: 800-1200 words">Article: 800-1200 words</option>
                          <option value="Custom length">Custom length</option>
                        </select>
                      </div>

                      {advancedBrief.desiredLength === 'Custom length' && (
                        <div>
                          <label className="block text-text-secondary font-semibold mb-1">Word Count Range</label>
                          <input
                            type="text"
                            value={advancedBrief.customLengthCount}
                            onChange={(e) => setAdvancedBrief({ ...advancedBrief, customLengthCount: e.target.value })}
                            className="w-full bg-surface-primary border border-border-standard p-1.5 rounded text-text-primary"
                            placeholder="Desired word count range"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-text-secondary font-semibold">
                          Tone <Tooltip text="Controls the energy level of the writing, from calm and institutional to bold and punchy." />
                        </label>
                        <span className="font-bold text-[10px] text-brand-gold">{getToneName(advancedBrief.toneIntensity)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={advancedBrief.toneIntensity}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, toneIntensity: parseInt(e.target.value) })}
                        className="w-full text-brand-gold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-border-standard mt-4">
                  <div className="flex items-center gap-1.5 text-brand-gold border-b border-border-standard pb-2">
                    <span className="font-sans text-base font-semibold">Operating Core Governance <Tooltip text="The unified central intelligence of the COH Content Studio. Drives identity, facts, audience, and formatting." /></span>
                  </div>
                  <p className="text-[10px] text-text-secondary leading-relaxed italic">
                    The Operating Core ensures absolute brand alignment, claim discipline, and channel fit for every generation.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono mb-2">
                    <span className={`px-2 py-1 rounded text-center font-bold ${operatingCore.corePassport.oneLineDefinition ? 'bg-green-500/10 backdrop-blur-md text-green-700' : 'bg-red-500/10 backdrop-blur-md text-red-700'}`}>
                      Identity Locked
                    </span>
                    <span className={`px-2 py-1 rounded text-center font-bold ${operatingCore.claimsProofBoundaries.claims.length > 0 ? 'bg-green-500/10 backdrop-blur-md text-green-700' : 'bg-red-500/10 backdrop-blur-md text-red-700'}`}>
                      Boundaries Active
                    </span>
                    <span className={`px-2 py-1 rounded text-center font-bold ${operatingCore.voiceAndLanguage.overallTone.length > 0 ? 'bg-green-500/10 backdrop-blur-md text-green-700' : 'bg-red-500/10 backdrop-blur-md text-red-700'}`}>
                      Voice Calibrated
                    </span>
                    <span className={`px-2 py-1 rounded text-center font-bold bg-violet-600/10 text-text-primary`}>
                      Operating Core v1
                    </span>
                  </div>

                  {activeDraftText && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center border-b border-border-standard pb-2">
                        <span className="font-sans text-base font-semibold text-text-primary font-bold">Real-time Compliance Audit</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                          auditResults.status === 'Ready' ? 'bg-green-100 text-green-800' :
                          auditResults.status === 'Needs Revision' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {auditResults.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {auditResults.checks.map((chk: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start border-b border-border-standard pb-2 last:border-0 last:pb-0">
                            <span className={`p-0.5 rounded mt-0.5 ${chk.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {chk.pass ? <Check size={12} /> : <AlertTriangle size={12} />}
                            </span>
                            <div className="space-y-1">
                              <span className="font-semibold text-text-primary flex items-center gap-1.5 text-[11px]">
                                {chk.name}
                              </span>
                              <p className="text-[10px] text-text-secondary">{chk.desc}</p>
                              {!chk.pass && (
                                <div className="text-[9px] bg-red-500/10 backdrop-blur-md p-2 border border-red-100 rounded text-red-800 space-y-1">
                                  <div><strong>Issue:</strong> {chk.whyItMatters}</div>
                                  <div><strong>Fix:</strong> {chk.suggestedFix}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border-standard pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-brand-gold uppercase">Prompt Builder Output</span>
                      <button
                        onClick={() => handleCopyClipboard(compileStructuredPrompt(), 'prompt')}
                        className="text-[10px] font-bold text-text-primary interactive-link transition"
                      >
                        {copySuccessMap['prompt'] ? 'Copied!' : 'Copy AI Prompt'}
                      </button>
                    </div>
                    <details className="text-[10px] text-text-muted cursor-pointer">
                      <summary className="interactive-link transition">Inspect Compiled Prompt</summary>
                      <pre className="mt-2 p-3 bg-surface-inset rounded border border-border-standard overflow-x-auto max-h-40 whitespace-pre-wrap font-mono text-[9px] select-all">
                        {compileStructuredPrompt()}
                      </pre>
                    </details>
                  </div>
                </div>

                <div data-guide="content-generate" className="pt-2 border-t border-border-standard mt-4">
                  <Button onClick={handleGenerateDrafts} disabled={isGeneratingDrafts} variant="primary" size="lg" className="w-full">
                    {isGeneratingDrafts ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                    {isGeneratingDrafts ? 'Generating...' : 'Generate'}
                  </Button>
                </div>
              </div>

              {/* PANEL 2: GENERATION RESULTS */}
              <div data-guide="content-results" className="min-w-0 bg-surface-inset border border-border-standard p-6 rounded shadow-sm space-y-6">
                
                <div className="border-b border-border-standard pb-2 flex justify-between items-center">
                  <h3 className="font-sans text-lg font-semibold text-text-primary">
                    Generation Results
                  </h3>
                  {generationNumber > 0 && (
                    <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      Draft Set {generationNumber} <Tooltip text="Each time you regenerate, a new draft set is created so you can compare versions." />
                    </span>
                  )}
                </div>

                {draftOptions ? (
                  <div className="space-y-6">
                    {isBriefOutdated && (
                      <div className="bg-amber-500/10 backdrop-blur-md border border-amber-300 p-3.5 rounded text-xs text-text-primary flex justify-between items-center animate-fadeIn">
                        <span>Inputs changed. Regenerate to apply the latest brief.</span>
                        <button
                          disabled={isGeneratingDrafts || aiIsGenerating}
                          onClick={handleGenerateDrafts}
                          className="bg-slate-900 text-white px-3 py-1.5 rounded text-[11px] font-bold shadow-md hover:bg-brand-gold-hover transition disabled:opacity-50 disabled:cursor-not-allowed action-button interactive-button"
                        >
                          {isGeneratingDrafts ? 'Generating...' : 'Generate Again'}
                        </button>
                      </div>
                    )}

                    {draftOptions.contextWarning && (
                      <div className="bg-amber-500/10 backdrop-blur-md border border-amber-300 p-4 rounded text-xs text-text-primary flex items-center gap-2 font-semibold">
                        <AlertTriangle size={15} className="text-brand-gold shrink-0" />
                        <span>{draftOptions.contextWarning}</span>
                      </div>
                    )}
                    
                    {/* 1. Final Drafts */}
                    {/* Language notice banner — shown above drafts for non-English selection */}
                    {draftOptions.languageNotice && (() => {
                      const parts = draftOptions.languageNotice.split('::');
                      const isRTL = parts[0] === 'RTL_NOTICE';
                      const lang = parts[1] || '';
                      const message = parts[2] || '';
                      return (
                        <div className={`p-4 rounded border text-xs space-y-2 ${isRTL ? 'bg-red-500/10 backdrop-blur-md border-red-300' : 'bg-amber-500/10 backdrop-blur-md border-amber-300'}`}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${isRTL ? 'text-red-600' : 'text-amber-600'}`} />
                            <div className="space-y-1.5">
                              <p className={`font-semibold ${isRTL ? 'text-red-800' : 'text-amber-900'}`}>{message}</p>
                              <p className="text-text-secondary">The draft below is an English prototype. Approved names such as Climate Opera Haus and opera titles are preserved.</p>
                            </div>
                          </div>
                          <button
                            onClick={() => { setIsMobileMenuOpen(false); setActiveTab('prompt-builder'); }}
                            className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-brand-gold-hover transition"
                          >
                            Build {lang} AI Prompt <ArrowRight size={10} />
                          </button>
                        </div>
                      );
                    })()}

                    <div className="space-y-4">

                      {/* Option A card */}
                      <div
                        data-testid="draft-option-a-card"
                        className="border border-border-standard rounded bg-surface-inset flex flex-col overflow-hidden shadow-sm"
                      >
                        <div className="bg-surface-inset p-3 border-b border-border-standard flex justify-between items-center">
                          <span className="font-sans text-xs font-bold text-text-primary">
                            {generationSpeedMode === 'fast'
                              ? 'Focused Primary Draft (Fast Mode)'
                              : 'Option A — Direct / Institutional'}
                          </span>
                          <div className="flex items-center gap-2">
                            {detectCleanlinessIssues(draftOptions.optionA) ? (
                              <button
                                onClick={cleanOptionADraft}
                                title="Click to clean em dashes, curly quotes, and AI punctuation"
                                className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition action-button"
                              >
                                ⚠️ Needs cleanup
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                                ✓ Clean
                              </span>
                            )}
                            <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-violet-600/25 text-text-primary-light flex items-center gap-1">
                              {draftOptions.labelA} <Tooltip text="Shows how much the draft is supported by sources." />
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-text-primary/85 leading-relaxed whitespace-pre-wrap select-all font-sans">
                            {draftOptions.optionA}
                          </p>
                        </div>
                        <div className="bg-surface-inset p-3 border-t border-border-standard flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setActiveDraftText(draftOptions.optionA);
                              setActiveDraftTitle(`${creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel} Option A`);
                              setActiveDraftVersion(1);
                              setActiveDraftHistory([{ version: 1, text: draftOptions.optionA, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Initial generation' }]);
                              setActiveDraftSource('Content Workspace');
                              setActiveTab('revision-studio');
                            }}
                            className="bg-slate-900 text-white hover:bg-brand-gold-hover text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Revise This Draft
                          </button>
                          <button
                            onClick={() => {
                              setReframingInitialOrigin({
                                originType: 'Content Workspace',
                                originTitle: `${creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel} Option A`,
                                sourceContent: draftOptions.optionA,
                                originChannel: creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                                originAudience: creationMode === 'advanced' ? advancedBrief.audience : 'General Public'
                              });
                              setActiveTab('reframing-studio');
                            }}
                            className="bg-surface-primary border border-border-strong text-text-primary hover:border-brand-gold text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Reframe Draft
                          </button>
                          <button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionA, 'A')}
                            className="bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded interactive-button"
                          >
                            Save to Library
                          </button>
                          <button
                            onClick={() => handleCopyClipboard(draftOptions.optionA, 'optA')}
                            className="text-text-secondary text-[10px] font-medium px-2 py-2 interactive-link"
                          >
                            {copySuccessMap['optA'] ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      {/* Option B card (Explore Mode only) */}
                      {generationSpeedMode === 'explore' && (
                        <div
                          data-testid="draft-option-b-card"
                          className="border border-border-standard rounded bg-surface-inset flex flex-col overflow-hidden shadow-sm"
                        >
                          <div className="bg-surface-inset p-3 border-b border-border-standard flex justify-between items-center">
                            <span className="font-sans text-xs font-bold text-text-primary">Option B — Human / Narrative</span>
                            <div className="flex items-center gap-2">
                              {detectCleanlinessIssues(draftOptions.optionB) ? (
                                <button
                                  onClick={cleanOptionBDraft}
                                  title="Click to clean em dashes, curly quotes, and AI punctuation"
                                  className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition action-button"
                                >
                                  ⚠️ Needs cleanup
                                </button>
                              ) : (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                                  ✓ Clean
                                </span>
                              )}
                              <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-violet-600/25 text-text-primary-light flex items-center gap-1">
                                {draftOptions.labelB} <Tooltip text="Shows how much the draft is supported by sources." />
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="text-xs text-text-primary/85 leading-relaxed whitespace-pre-wrap select-all font-sans">
                              {draftOptions.optionB}
                            </p>
                          </div>
                          <div className="bg-surface-inset p-3 border-t border-border-standard flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setActiveDraftText(draftOptions.optionB);
                                setActiveDraftTitle(`${creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel} Option B`);
                                setActiveDraftVersion(1);
                                setActiveDraftHistory([{ version: 1, text: draftOptions.optionB, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Initial generation' }]);
                                setActiveDraftSource('Content Workspace');
                                setActiveTab('revision-studio');
                              }}
                              className="bg-slate-900 text-white hover:bg-brand-gold-hover text-[10px] font-bold px-3 py-1.5 rounded transition"
                            >
                              Revise This Draft
                            </button>
                            <button
                              onClick={() => saveDirectDraftToLibrary(draftOptions.optionB, 'B')}
                              className="bg-slate-900 text-white text-[10px] font-bold px-4 py-2 rounded interactive-button"
                            >
                              Save to Library
                            </button>
                            <button
                              onClick={() => handleCopyClipboard(draftOptions.optionB, 'optB')}
                              className="text-text-secondary text-[10px] font-medium px-2 py-2 interactive-link"
                            >
                              {copySuccessMap['optB'] ? '✓ Copied' : 'Copy'}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>

                    {/* 2. Shorter Version (Explore Mode only) */}
                    {generationSpeedMode === 'explore' && (
                      <div
                        data-testid="draft-shorter-version-card"
                        className="bg-surface-inset border border-border-standard p-4 rounded text-xs space-y-2"
                      >
                        <span className="font-sans font-bold text-text-primary text-xs block">Shorter Version</span>
                        <p className="text-xs text-text-primary italic leading-relaxed">{draftOptions.optionC}</p>
                      </div>
                    )}

                    {/* 3. Visual Direction */}
                    <div className="bg-surface-inset p-4 border border-border-standard rounded text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-sans font-bold text-text-primary text-xs block">
                          Visual Direction <Tooltip text="Design guidance for a visual designer, carousel, post graphic, or image prompt." />
                        </span>
                        <div className="flex gap-2 text-[9px] font-semibold text-text-primary">
                          <button
                            onClick={() => {
                              const formatted = formatVisualDirectionForDisplay(
                                draftOptions.visualIdeation,
                                creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                                creationMode === 'quick' ? quickBrief.outputFormat : advancedBrief.outputFormat,
                                draftOptions.optionA
                              );
                              navigator.clipboard.writeText(formatted);
                              /* Copied handled by state */
                            }}
                            className="interactive-link transition"
                          >
                            Copy Visual Direction
                          </button>
                          <span className="text-brand-gold/30">|</span>
                          <button
                            onClick={() => {
                              const promptText = extractAIImagePrompt(
                                draftOptions.visualIdeation,
                                creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                                creationMode === 'quick' ? quickBrief.outputFormat : advancedBrief.outputFormat,
                                draftOptions.optionA
                              );
                              navigator.clipboard.writeText(promptText);
                              /* Copied handled by state */
                            }}
                            className="interactive-link transition"
                          >
                            Copy AI Image Prompt
                          </button>
                          <span className="text-brand-gold/30">|</span>
                          <button
                            onClick={() => {
                              handleSendToVisualStudio(
                                { id: `generated-${Date.now()}`, title: `${creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel} Visual Direction` },
                                draftOptions.visualIdeation,
                                'Content'
                              );
                              setActiveTab('visual-studio');
                            }}
                            className="interactive-link transition text-text-primary flex items-center gap-1 font-bold"
                          >
                            <Lightbulb size={11} /> Send to Visual Studio
                          </button>
                        </div>
                      </div>
                      <pre className="text-[11px] text-text-primary/85 whitespace-pre-wrap leading-relaxed font-mono">
                        {formatVisualDirectionForDisplay(
                          draftOptions.visualIdeation,
                          creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                          creationMode === 'quick' ? quickBrief.outputFormat : advancedBrief.outputFormat,
                          draftOptions.optionA
                        )}
                      </pre>
                    </div>

                    {/* 4. Strategy Fit Check */}
                    <div className="bg-surface-inset p-4 border border-border-standard rounded text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-text-primary">
                        <span className="font-sans font-bold text-sm">Strategy Fit Check</span>
                      </div>
                      <p className="text-[11px] text-text-primary leading-relaxed font-medium">
                        {draftOptions.editorialWarning.includes('Quality check:') || draftOptions.editorialWarning.includes('|') ? (
                          <span className="text-red-700">{draftOptions.editorialWarning}</span>
                        ) : (
                          <span className="text-green-700">✓ Aligned with Operating Core parameters. {draftOptions.editorialWarning}</span>
                        )}
                      </p>
                    </div>

                    {/* Post-generation: Generate Another Version */}
                    <div className="border-t border-border-standard pt-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Generate Another Version — Style:</span>
                        <select
                          value={anotherVersionStyle}
                          onChange={(e) => setAnotherVersionStyle(e.target.value)}
                          className="bg-surface-inset border border-border-standard text-[10px] text-text-primary p-1.5 rounded font-bold"
                        >
                          <option value="default">Default Variation</option>
                          <option value="More direct">More direct</option>
                          <option value="More human">More human</option>
                          <option value="More sponsor-facing">More sponsor-facing</option>
                          <option value="More concise">More concise</option>
                          <option value="More institutional">More institutional</option>
                          <option value="More visual">More visual</option>
                        </select>
                        <button 
                          onClick={handleGenerateDrafts} 
                          disabled={isGeneratingDrafts}
                          className="bg-brand-gold hover:bg-brand-gold-hover text-surface-base px-3 py-1.5 rounded-lg font-bold text-[10px] font-sans transition flex items-center justify-center gap-1 disabled:opacity-50 action-button interactive-btn"
                        >
                          {isGeneratingDrafts ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={12} />}
                          {isGeneratingDrafts ? 'Generating...' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {/* 5. Recommended Approach */}
                    {advancedBrief.directionMode === 'auto' && (
                      <details className="text-xs border border-border-standard p-3 rounded-lg bg-surface-inset cursor-pointer">
                        <summary className="font-semibold text-text-primary hover:text-brand-gold font-sans">View Recommended Approaches</summary>
                        <div className="space-y-3 mt-3">
                          {getDynamicDirections().map(d => {
                            const isSel = d.title === advancedBrief.angle;
                            return (
                              <div key={d.title} className={`p-3 border rounded-lg text-xs transition cursor-default ${
                                isSel ? 'border-brand-gold bg-surface-inset' : 'border-border-standard bg-surface-inset/50'
                              }`}>
                                <h4 className="font-sans font-bold text-text-primary mb-1">{d.title}</h4>
                                <p className="text-text-secondary text-[11px] mb-2">{d.strategicFrame}</p>
                                <div className="text-[10px] text-text-secondary space-y-1">
                                  <div><strong>Why this works:</strong> Visually anchors local data context.</div>
                                  <div><strong>Best use:</strong> {d.bestChannelFit}</div>
                                  <div className="text-status-error"><strong>Risk to avoid:</strong> {d.whatNotToSay}</div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => setAdvancedBrief({ ...advancedBrief, angle: d.title })}
                                    className="bg-brand-gold text-surface-base font-bold px-2.5 py-1 rounded-md text-[10px]"
                                  >
                                    Use This Approach
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAdvancedBrief({
                                        ...advancedBrief,
                                        directionMode: 'custom',
                                        customDirection: d.whatToSay
                                      });
                                    }}
                                    className="bg-surface-primary border border-border-standard text-text-primary px-2.5 py-1 rounded-md text-[10px]"
                                  >
                                    Edit Approach
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAdvancedBrief({
                                        ...advancedBrief,
                                        angle: 'Create From Scratch / No Direction'
                                      });
                                    }}
                                    className="bg-status-error/10 text-status-error px-2.5 py-1 rounded-md text-[10px]"
                                  >
                                    Skip Approach
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}

                  </div>
                ) : (
                  <div className="text-center py-20 text-text-muted text-xs">
                    <Cpu className="mx-auto text-brand-gold/30 mb-2" size={24} />
                    <p>Ready to generate. Fill inputs and click &ldquo;Generate Drafts&rdquo;.</p>
                  </div>
                )}
              </div>


            </div>

          </div>
        
</ErrorBoundary>)}

        {/* --- TAB 3: VISUAL STUDIO --- */}
        {activeTab === 'visual-studio' && (() => {
          const isTextLed = /(quote card|text-led|text-heavy|typographic|nameplate|headline card)/i.test(vsConcept + ' ' + vsFormat + ' ' + vsComposition);
          const liveCompiledResult = compileVisualStudioPrompt({
            brief: {
              visualConcept: vsInputMode === 'Manual' && !vsConcept.trim() ? vsManualPrompt : vsConcept,
              formatRecommendation: vsFormat,
              moodAtmosphere: vsMood,
              composition: vsComposition,
              colorMaterialDirection: vsPalette,
              typographyLayout: vsTypography,
              keyVisualElements: vsElements,
              whatToAvoid: vsAvoid,
              aiImagePrompt: vsAIPrompt,
              negativePrompt: vsNegativePrompt,
              designerNotes: vsNotes,
              textContent: vsTextContent,
              attribution: vsAttribution
            },
            visualStyle: vsVisualStyle,
            formatPresetId: vsAspectRatio,
            width: vsCustomWidth,
            height: vsCustomHeight
          });
          return (
          <ErrorBoundary fallbackTitle="Visual Studio Error">
          <div className="page-shell">
            <div className="card-level-1 p-5 sm:p-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold font-semibold mb-1">
                Visual Production
              </div>
              <h2 className="page-title">Visual Studio</h2>
              <p className="page-subtitle">Create visual outputs from full visual directions or custom prompts.</p>
            </div>

            {(() => {
              const snap = buildWorkContextSnapshot({
                activeWorkItem,
                fallbackOrigin: vsSourceItem ? `${vsSourceItem.type} Handoff` : 'Visual Studio',
                fallbackTitle: vsSourceItem?.title || activeWorkItem?.title || vsConcept || 'Visual Direction Brief',
                audience: advancedBrief.audience,
                channel: advancedBrief.channel,
                format: vsFormat || advancedBrief.outputFormat,
                pillar: advancedBrief.pillar,
                communicationJob: advancedBrief.purpose,
                currentStudio: 'Visual Studio'
              });
              return (
                <CurrentWorkContextBar
                  currentStudio="Visual Studio"
                  originLabel={snap.originLabel}
                  originTitle={snap.originTitle}
                  audience={snap.audience}
                  channel={snap.channel}
                  format={snap.format}
                  pillar={snap.pillar}
                  communicationJob={snap.communicationJob}
                  sourceBindings={snap.sourceBindings}
                  transformationTrail={snap.transformationTrail}
                  onNavigateStudio={target => setActiveTab(target)}
                />
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-[380px_minmax(0,1fr)] xl:grid-cols-[420px_minmax(0,1fr)] gap-6 items-start">
              {/* Left Column: Editor & Controls */}
              <div className="min-w-0 space-y-5">
                
                {/* Input Mode Selector */}
                <div data-guide="visual-input-mode" className="card-level-1 p-5 border border-border-standard space-y-4 text-xs">
                  <h3 className="font-sans text-sm font-bold text-text-primary border-b border-border-standard pb-2">Input Mode</h3>
                  
                  <div className="flex bg-surface-inset p-1 rounded-lg border border-border-standard">
                    <button
                      onClick={() => setVsInputMode('Manual')}
                      className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition ${vsInputMode === 'Manual' ? 'bg-brand-gold text-surface-base shadow-sm font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Manual Prompt
                    </button>
                    <button
                      onClick={() => setVsInputMode('Imported')}
                      className={`flex-1 px-4 py-1.5 text-xs font-semibold rounded-md transition ${vsInputMode === 'Imported' ? 'bg-brand-gold text-surface-base shadow-sm font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                    >
                      Imported Visual Direction
                    </button>
                  </div>

                  {vsInputMode === 'Imported' ? (
                    <div>
                      {vsSourceItem ? (
                        <div className="bg-surface-inset p-3 rounded-lg text-sm text-text-primary border border-border-standard">
                          <span className="block text-[10px] uppercase tracking-wider text-text-secondary mb-1">Imported from {vsSourceItem.type}</span>
                          <strong className="block truncate font-sans" title={vsSourceItem.title}>{vsSourceItem.title}</strong>
                        </div>
                      ) : (
                        <div className="bg-surface-inset p-3 rounded-lg text-xs text-text-secondary italic border border-border-standard">
                          No imported visual direction selected. Send one from Content Workspace or Content Library.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-text-secondary font-semibold mb-1.5">Visual Prompt or Brief</label>
                      <textarea
                        value={vsManualPrompt}
                        onChange={(e) => setVsManualPrompt(e.target.value)}
                        placeholder="Paste a prompt, visual direction, image idea, or creative brief."
                        rows={4}
                        className="w-full bg-surface-primary border border-border-standard p-2.5 rounded-lg text-text-primary text-xs font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Generation Controls */}
                <div data-guide="visual-settings" className="card-level-1 p-5 border border-border-standard space-y-4 text-xs">
                  <h3 className="font-sans text-sm font-bold text-text-primary border-b border-border-standard pb-2">Generation Settings</h3>
                  
                  <div>
                    <label className="block text-text-secondary font-semibold mb-1.5">Prompt Build Mode</label>
                    <select
                      value={vsPromptMode}
                      onChange={(e) => setVsPromptMode(e.target.value as any)}
                      className="w-full bg-surface-primary border border-border-standard p-2 text-xs text-text-primary rounded-lg"
                    >
                      {vsInputMode === 'Manual' && <option value="Manual Only">Manual Prompt Only</option>}
                      <option value="Full + AI">Full Visual Direction + AI Image Prompt</option>
                      <option value="Full">Full Visual Direction</option>
                      <option value="AI Only">AI Image Prompt Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-text-secondary font-semibold mb-1.5">Aspect Ratio</label>
                    <select
                      value={vsAspectRatio}
                      onChange={(e) => setVsAspectRatio(e.target.value)}
                      className="w-full bg-surface-primary border border-border-standard p-2 text-xs text-text-primary rounded-lg"
                    >
                      {ASPECT_RATIO_GROUP_ORDER.map(group => (
                        <optgroup key={group} label={group}>
                          {ASPECT_RATIO_PRESETS.filter(p => p.group === group).map(preset => {
                            const isSupported = !preset.supportedModels || preset.supportedModels.includes(aiImageModel || '');
                            return (
                              <option key={preset.id} value={preset.id} disabled={!isSupported}>
                                {preset.label} {preset.ratio} ({preset.width}x{preset.height}) {!isSupported ? '(Unsupported)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                      {aiImageModel?.startsWith('gpt-image-2') && (
                        <option value="custom">Advanced custom size...</option>
                      )}
                    </select>

                    {vsAspectRatio === 'custom' && (
                      <div className="mt-2 flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] text-text-secondary mb-1">Width (px)</label>
                          <input type="number" value={vsCustomWidth} onChange={e => setVsCustomWidth(parseInt(e.target.value)||0)} step="16" className="w-full bg-surface-primary border border-border-standard p-1.5 text-xs rounded-lg" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-text-secondary mb-1">Height (px)</label>
                          <input type="number" value={vsCustomHeight} onChange={e => setVsCustomHeight(parseInt(e.target.value)||0)} step="16" className="w-full bg-surface-primary border border-border-standard p-1.5 text-xs rounded-lg" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-text-secondary font-semibold mb-1.5">Visual Style</label>
                    <select
                      value={vsVisualStyle}
                      onChange={(e) => setVsVisualStyle(e.target.value)}
                      className="w-full bg-surface-primary border border-border-standard p-2 text-xs text-text-primary rounded-lg"
                    >
                      <option value="Editorial Photomontage">Editorial Photomontage</option>
                      <option value="Cinematic Realism">Cinematic Realism</option>
                      <option value="Editorial Photography">Editorial Photography</option>
                      <option value="Premium Illustration">Premium Illustration</option>
                      <option value="Minimal Graphic">Minimal Graphic</option>
                      <option value="Social Poster">Social Poster</option>
                      <option value="Fine Art / Conceptual">Fine Art / Conceptual</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-border-standard mt-4">
                    <Button onClick={handleGenerateImage} disabled={isGeneratingImage || !aiProvider} variant="primary" size="lg" className="w-full">
                      {isGeneratingImage ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                      {isGeneratingImage ? 'Generating...' : 'Generate'}
                    </Button>
                    {isTextLed && !vsTextContent.trim() && (
                      <p className="text-[10px] text-status-warning text-center mt-1.5 font-semibold">Warning: No Text Content provided. Generated image will have AI placeholder text.</p>
                    )}
                  </div>
                  {!aiProvider && <p className="text-xs text-status-error text-center mt-2">No AI provider configured.</p>}
                  {aiLastError && <p className="text-xs text-status-error text-center mt-2">{aiLastError}</p>}
                </div>

              {/* Structured Visual Brief Editor */}
              <div data-guide="visual-brief-fields" className="card-level-1 p-5 border border-border-standard space-y-4 max-h-[80vh] overflow-y-auto text-xs flex flex-col">
                <div className="flex justify-between items-center mb-1 border-b border-border-standard pb-2">
                  <h3 className="font-sans text-sm font-bold text-text-primary">Structured Visual Brief</h3>
                  {vsInputMode === 'Manual' && (
                    <button
                      onClick={() => setShowAdvancedBrief(!showAdvancedBrief)}
                      className="text-[10px] text-brand-gold uppercase font-bold tracking-wider interactive-link"
                    >
                      {showAdvancedBrief ? 'Hide' : 'Show'} Advanced
                    </button>
                  )}
                </div>
                
                {(vsInputMode === 'Imported' || showAdvancedBrief) ? (
                  <div className="space-y-4">
                    
                    {/* Validation UI */}
                    {vsInputMode === 'Imported' && vsImportValidation && (
                       <div className="bg-surface-inset border border-border-standard rounded-lg p-3 mb-2 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                             <span className="font-semibold text-text-primary">Brief Import Status</span>
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${vsImportValidation.recognized > 5 ? 'bg-status-success/15 text-status-success' : 'bg-status-warning/15 text-status-warning'}`}>
                                {vsImportValidation.recognized}/{vsImportValidation.total} Fields Parsed
                             </span>
                          </div>
                          {vsImportValidation.missing.length > 0 && (
                            <p className="text-[10px] text-text-secondary italic">
                               Unrecognized optional fields: {vsImportValidation.missing.join(', ')}
                            </p>
                          )}
                       </div>
                    )}
                  
                    {/* Text-led specific fields */}
                    {isTextLed && (
                      <div className="bg-brand-gold/5 p-3 rounded-lg border border-brand-gold/30 mb-2">
                         <div className="mb-3">
                           <label className="block text-text-primary font-bold mb-1 flex items-center gap-1">Text Content (Required) <span className="text-status-error">*</span></label>
                           <textarea
                             value={vsTextContent}
                             onChange={(e) => setVsTextContent(e.target.value)}
                             rows={3}
                             placeholder="The exact quote or text to display on the card..."
                             className="w-full bg-surface-inset border border-border-standard p-2 text-xs text-text-primary rounded-lg font-sans"
                           />
                         </div>
                         <div>
                           <label className="block text-text-primary font-bold mb-1">Attribution / Nameplate (Optional)</label>
                           <input
                             type="text"
                             value={vsAttribution}
                             onChange={(e) => setVsAttribution(e.target.value)}
                             placeholder="e.g. John Doe, CEO"
                             className="w-full bg-surface-inset border border-border-standard p-2 text-xs text-text-primary rounded-lg font-sans"
                           />
                         </div>
                      </div>
                    )}

                    {[
                      { label: 'Visual Concept', value: vsConcept, setter: setVsConcept },
                      { label: 'Format Recommendation', value: vsFormat, setter: setVsFormat },
                      { label: 'Mood / Atmosphere', value: vsMood, setter: setVsMood },
                      { label: 'Composition', value: vsComposition, setter: setVsComposition },
                      { label: 'Color / Material Direction', value: vsPalette, setter: setVsPalette },
                      { label: 'Typography / Layout', value: vsTypography, setter: setVsTypography },
                      { label: 'Key Visual Elements', value: vsElements, setter: setVsElements },
                      { label: 'What to Avoid', value: vsAvoid, setter: setVsAvoid },
                      { label: 'AI Image Prompt', value: vsAIPrompt, setter: setVsAIPrompt },
                      { label: 'Negative Prompt', value: vsNegativePrompt, setter: setVsNegativePrompt },
                      { label: 'Designer Notes', value: vsNotes, setter: setVsNotes }
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-text-secondary font-semibold mb-1">{field.label}</label>
                        <textarea
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          rows={field.label === 'Visual Concept' || field.label === 'AI Image Prompt' ? 3 : 2}
                          className="w-full bg-surface-primary border border-border-standard p-2 text-xs text-text-primary rounded-lg font-sans"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-8 text-text-muted italic text-xs">
                     Advanced brief fields are hidden in manual mode.
                   </div>
                  )}
                </div>
              </div>

              {/* Right Column: Results Grid */}
              <div data-guide="visual-canvas" className="min-w-0 card-level-1 p-6 space-y-5">
                <div className="border-b border-border-standard pb-3 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <h3 className="font-sans text-base font-bold text-text-primary">
                      Results &amp; Visual Canvas
                    </h3>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      High-resolution image outputs and compiled prompt provenance.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-surface-inset border border-border-standard text-text-secondary">
                      Type: {liveCompiledResult.visualType.replace(/_/g, ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-brand-gold/10 border border-brand-gold/25 text-brand-gold font-semibold">
                      Ratio: {liveCompiledResult.aspectRatio}
                    </span>
                  </div>
                </div>

                {/* Live Compiled Prompt Preview */}
                <details className="border border-border-standard rounded-lg overflow-hidden bg-surface-inset/50" open={Boolean(vsConcept || vsManualPrompt)}>
                  <summary className="bg-surface-primary px-3.5 py-2 text-[11px] font-semibold text-text-primary cursor-pointer select-none flex items-center justify-between">
                    <span>Compiled Image Prompt Preview</span>
                    <span className="text-[10px] font-mono text-text-secondary">{vsVisualStyle} · {vsPromptMode}</span>
                  </summary>
                  <div
                    data-testid="visual-compiled-prompt-preview"
                    className="p-3.5 text-xs text-text-secondary leading-relaxed font-sans border-t border-border-standard"
                  >
                    {liveCompiledResult.prompt}
                  </div>
                </details>
                
                {isGeneratingImage ? (
                  <div className="bg-surface-inset p-12 rounded-xl text-center border border-dashed border-border-strong flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-primary font-semibold text-sm">Generating...</p>
                  </div>
                ) : vsGeneratedImages.length === 0 ? (
                  <div className="bg-surface-inset p-12 rounded-xl text-center text-text-secondary border border-dashed border-border-standard">
                    <Lightbulb size={22} className="mx-auto text-brand-gold/40 mb-2" />
                    <p className="text-xs font-medium text-text-primary">No images generated yet.</p>
                    <p className="text-[11px] text-text-muted mt-1">Configure your visual direction on the left and click Generate.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {vsGeneratedImages.map(img => (
                      <div key={img.id} className="bg-surface-inset border border-border-standard rounded-xl p-4 shadow-sm group">
                        <img src={img.url} alt="Generated Visual" className="w-full h-auto max-h-[70vh] object-contain rounded-lg mb-3 border border-border-standard" />
                        <div className="flex gap-2 text-xs">
                          <a
                            href={img.url}
                            download={`coh-visual-${(vsSourceItem?.title || 'manual').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`}
                            className="w-full bg-surface-primary hover:bg-brand-gold hover:text-surface-base text-text-primary border border-border-strong py-2.5 rounded-lg text-center font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download
                          </a>
                        </div>
                        {/* Compiled Prompt Preview */}
                        {img.promptUsed && (
                          <details className="mt-4 border border-border-standard rounded-lg overflow-hidden">
                            <summary className="bg-surface-primary px-3 py-2 text-[10px] uppercase tracking-wider text-text-secondary font-bold cursor-pointer select-none flex justify-between">
                              <span>Compiled Prompt Preview (Debug)</span>
                              <span className="opacity-50 font-mono">
                                {img.generationSize || '1024x1024'} → {img.deliverySize || '1024x1024'}
                              </span>
                            </summary>
                            <div className="p-3 bg-surface-inset text-[11px] font-mono text-text-primary whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                              <div className="mb-2 pb-2 border-b border-border-standard text-[9px] opacity-70 grid grid-cols-2 gap-2">
                                <div>Model: {img.model || 'unknown'}</div>
                                <div>Quality: {img.quality || 'high'}</div>
                                <div>Provider: {img.provider || 'unknown'}</div>
                                <div>Delivery: {img.deliverySize || img.aspectRatio || 'unknown'}</div>
                              </div>
                              {img.promptUsed}
                            </div>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        
</ErrorBoundary>)})()}

        {activeTab === 'revision-studio' && (<ErrorBoundary fallbackTitle="Revision Studio Error">
          {(() => {
            const snap = buildWorkContextSnapshot({
              activeWorkItem,
              fallbackOrigin: activeDraftSource || 'Revision Studio',
              fallbackTitle: activeDraftTitle || activeWorkItem?.title || 'Draft in Revision',
              audience: advancedBrief.audience,
              channel: advancedBrief.channel,
              format: advancedBrief.outputFormat,
              pillar: advancedBrief.pillar,
              communicationJob: advancedBrief.purpose,
              currentStudio: 'Revision Studio'
            });
            return (
              <div className="mb-4">
                <CurrentWorkContextBar
                  currentStudio="Revision Studio"
                  originLabel={snap.originLabel}
                  originTitle={snap.originTitle}
                  audience={snap.audience}
                  channel={snap.channel}
                  format={snap.format}
                  pillar={snap.pillar}
                  communicationJob={snap.communicationJob}
                  sourceBindings={snap.sourceBindings}
                  transformationTrail={snap.transformationTrail}
                  onNavigateStudio={target => setActiveTab(target)}
                />
              </div>
            );
          })()}
          <RevisionStudio
            initialDraft={activeDraftText}
            initialSourceType={activeDraftSource === 'Content Workspace' ? 'contentWorkspace' : 'contentLibrary'}
            initialSourceTitle={activeDraftTitle}
            operatingCore={operatingCore}
            coreDocuments={operatingCoreDocs}
            activeWorkItem={activeWorkItem}
            theme={theme}
            aiStatus={aiStatus}
            generationMode={generationMode}
            aiService={aiService}
            onSaveToLibrary={(item) => setSavedContent(prev => [item, ...prev])}
            onNavigateToLibrary={() => setActiveTab('content-library')}
          />
        </ErrorBoundary>)}

        {activeTab === 'reframing-studio' && (<ErrorBoundary fallbackTitle="Reframing Studio Error">
          {(() => {
            const snap = buildWorkContextSnapshot({
              activeWorkItem,
              fallbackOrigin: reframingInitialOrigin?.originType || 'Reframing Studio',
              fallbackTitle: reframingInitialOrigin?.originTitle || activeWorkItem?.title || 'Strategic Reframe',
              audience: reframingInitialOrigin?.originAudience || advancedBrief.audience,
              channel: reframingInitialOrigin?.originChannel || advancedBrief.channel,
              format: advancedBrief.outputFormat,
              pillar: advancedBrief.pillar,
              communicationJob: advancedBrief.purpose,
              currentStudio: 'Reframing Studio'
            });
            return (
              <div className="mb-4">
                <CurrentWorkContextBar
                  currentStudio="Reframing Studio"
                  originLabel={snap.originLabel}
                  originTitle={snap.originTitle}
                  audience={snap.audience}
                  channel={snap.channel}
                  format={snap.format}
                  pillar={snap.pillar}
                  communicationJob={snap.communicationJob}
                  sourceBindings={snap.sourceBindings}
                  transformationTrail={snap.transformationTrail}
                  onNavigateStudio={target => setActiveTab(target)}
                />
              </div>
            );
          })()}
          <ReframingStudio
            operatingCore={operatingCore}
            operatingCoreDocs={operatingCoreDocs}
            sources={[...sources, ...workspaceLocalSources]}
            savedContent={savedContent}
            workspaceDraftText={draftOptions?.optionA || activeDraftText || ''}
            workspaceTitle={advancedBrief.topic || activeWorkItem?.title || 'Workspace Draft'}
            revisionDraftText={activeDraftText}
            revisionTitle={activeDraftTitle || 'Revision Output'}
            selectedSourceIds={advancedBrief.selectedSourceIds}
            taskSourceRoleMap={taskSourceRoleMap}
            sourceIntelligenceMap={sourceIntelligenceMap}
            initialOrigin={reframingInitialOrigin}
            onChangeSourceTaskRole={handleChangeSourceTaskRole}
            onToggleAttachedSource={(srcId) => {
              setAdvancedBrief(prev => ({
                ...prev,
                selectedSourceIds: prev.selectedSourceIds.includes(srcId)
                  ? prev.selectedSourceIds.filter(id => id !== srcId)
                  : [...prev.selectedSourceIds, srcId]
              }));
            }}
            onHandoffToRevisionStudio={({ sourceText, title }) => {
              setActiveDraftText(sourceText);
              setActiveDraftTitle(title);
              setActiveDraftVersion(1);
              setActiveDraftHistory([
                {
                  version: 1,
                  text: sourceText,
                  timestamp: new Date().toISOString().split('T')[0],
                  actionUsed: 'Routed from Reframing Studio (Revision Intent Detected)'
                }
              ]);
              setActiveDraftSource('Content Workspace');
              setActiveTab('revision-studio');
            }}
            onSendReframeToWorkspace={({ reframedText, title, plan, lineage }) => {
              const dateStr = new Date().toISOString();
              setAdvancedBrief(prev => ({
                ...prev,
                topic: title,
                channel: plan.targetChannel,
                audience: plan.targetAudience,
                pillar: plan.contentPillarEmphasis,
                purpose: plan.communicationPurpose,
                outputFormat: plan.targetFormat,
                directionMode: 'custom',
                customDirection: `Reframed from ${lineage.originType} (${lineage.originTitle || 'Source'}): ${plan.strategicFrame}`
              }));
              setDraftOptions({
                optionA: reframedText,
                optionB: reframedText,
                optionC: reframedText.slice(0, 220),
                visualIdeation: `Editorial visual aligned with ${plan.strategicFrame} for ${plan.targetAudience}`,
                editorialWarning: '',
                labelA: `Reframed (${plan.targetAudience})`
              });
              setActiveDraftText(reframedText);
              setActiveDraftTitle(title);
              setActiveWorkItem(prev => ({
                ...(prev || {
                  id: `work-${Date.now()}`,
                  draftVersions: [],
                  imageResults: [],
                  revisionHistory: [],
                  approved: false,
                  saved: false,
                  createdAt: dateStr
                }),
                title,
                channel: plan.targetChannel,
                outputFormat: plan.targetFormat,
                audience: plan.targetAudience,
                purpose: plan.communicationPurpose,
                status: 'Draft',
                origin: 'Reframing Studio',
                workContext: {
                  ...(prev?.workContext || {}),
                  origin: 'Reframing Studio',
                  originId: lineage.originContentId,
                  originTitle: lineage.originTitle,
                  audience: plan.targetAudience,
                  channel: plan.targetChannel,
                  format: plan.targetFormat,
                  pillar: plan.contentPillarEmphasis,
                  communicationJob: plan.communicationPurpose,
                  strategicAngle: plan.strategicFrame,
                  transformationHistory: [
                    ...(prev?.workContext?.transformationHistory || []),
                    {
                      step: `Reframed for ${plan.targetAudience} (${plan.targetChannel})`,
                      studio: 'Reframing Studio',
                      timestamp: dateStr
                    }
                  ]
                },
                updatedAt: dateStr
              }));
              setActiveTab('content-workspace');
            }}
            onSaveReframeToLibrary={({ reframedText, title, plan, lineage }) => {
              const dateStr = new Date().toISOString().split('T')[0];
              const newItem: SavedContent = {
                id: `saved-reframe-${Date.now()}`,
                title,
                displayName: title,
                savedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                channel: plan.targetChannel,
                outputFormat: plan.targetFormat,
                pillar: plan.contentPillarEmphasis,
                angle: plan.strategicFrame,
                audience: plan.targetAudience,
                purpose: plan.communicationPurpose,
                status: 'Revised',
                sourcesUsed: lineage.sourceReferences,
                createdAt: dateStr,
                lastEdited: dateStr,
                text: reframedText,
                finalCopy: reframedText,
                notes: `Reframed from ${lineage.originType} (${lineage.originTitle || 'Source'}). Intent: ${lineage.reframeIntent}`,
                version: 1,
                metadata: {
                  reframeLineage: lineage
                }
              };
              setSavedContent(prev => [newItem, ...prev]);
            }}
          />
        </ErrorBoundary>)}
        {/* --- TAB 6: CONTENT LIBRARY --- */}
        {activeTab === 'content-library' && (<ErrorBoundary fallbackTitle="Content Library Error">
          <div className="page-shell">
            <div className="card-level-1 p-5 sm:p-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold font-semibold mb-1">
                Editorial Repository
              </div>
              <h2 className="page-title">Content Library</h2>
              <p className="page-subtitle">
                Access, duplicate, and filter approved COH content assets.
              </p>
            </div>

            <div className="card-level-1 p-4 sm:p-5 border border-border-standard flex gap-3.5 text-xs flex-wrap items-end">
              <div className="flex items-center gap-1.5 text-brand-gold shrink-0 pb-2">
                <Filter size={15} />
                <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Filters</span>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary block mb-1">Search Content</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, copy, or elements..."
                  className="bg-surface-inset border border-border-standard px-3 py-1.5 rounded-lg text-xs w-full text-text-primary"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary block mb-1">Filter Channel</label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-text-primary text-xs"
                >
                  <option value="All">All Channels</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="X / Twitter">X / Twitter</option>
                  <option value="Facebook">Facebook</option>
                  <option value="YouTube">YouTube</option>
                  <option value="Newsletter">Newsletter</option>
                  <option value="Website">Website</option>
                  <option value="Email / Direct Outreach">Email / Direct Outreach</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary block mb-1">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-text-primary text-xs"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Revised">Revised</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary block mb-1">Filter Pillar</label>
                <select
                  value={filterPillar}
                  onChange={(e) => setFilterPillar(e.target.value)}
                  className="bg-surface-inset border border-border-standard px-2.5 py-1.5 rounded-lg text-text-primary text-xs"
                >
                  <option value="All">All Pillars</option>
                  <option value="Climate Tetralogy & Canon">Climate Tetralogy & Canon</option>
                  <option value="Documentary, Media & Cultural IP">Media & Cultural IP</option>
                  <option value="Partnerships, Sponsorship & Institutional Value">Sponsorship & Value</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setFilterChannel('All');
                  setFilterStatus('All');
                  setFilterPillar('All');
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 h-[34px] rounded-lg bg-surface-inset border border-border-standard text-[11px] font-semibold text-text-secondary hover:text-text-primary transition"
              >
                Reset
              </button>
            </div>

            {actualFilteredSaved.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
                {actualFilteredSaved.map(item => (
                  <div key={item.id} className="card-level-1 p-5 flex flex-col justify-between gap-4 hover:border-brand-gold/35 transition-colors">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="flex gap-1.5 items-center flex-wrap mb-1.5">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-brand-gold bg-brand-gold/10 border border-brand-gold/25 px-2 py-0.5 rounded-md">
                              {item.channel}
                            </span>
                            <span className="text-[10px] font-mono text-text-secondary uppercase font-medium px-2 py-0.5 rounded-md bg-surface-inset border border-border-standard">
                              {item.pillar}
                            </span>
                            <span className="bg-surface-inset border border-border-standard text-text-secondary text-[10px] font-mono px-1.5 py-0.5 rounded-md font-semibold">
                              v{item.version || 1}
                            </span>
                          </div>
                          <h4 className="font-sans text-base font-bold text-text-primary leading-snug">{generateContentDisplayTitle(item)}</h4>
                        </div>

                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as SavedContent['status'])}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md font-mono border ${
                            item.status === 'Published' ? 'bg-status-success/10 border-status-success/30 text-status-success' :
                            item.status === 'Approved' ? 'bg-status-info/10 border-status-info/30 text-status-info' :
                            item.status === 'Revised' ? 'bg-status-warning/10 border-status-warning/30 text-status-warning' :
                            'bg-surface-inset border-border-standard text-text-primary'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Revised">Revised</option>
                          <option value="Approved">Approved</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>

                      <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed bg-surface-inset p-4 border border-border-standard rounded-lg">
                        {item.text}
                      </p>

                      <div className="text-[11px] text-text-secondary space-y-0.5">
                        <div><strong className="text-text-primary">Target Audience:</strong> {item.audience}</div>
                        <div><strong className="text-text-primary">Content Direction:</strong> {item.angle}</div>
                        <div className="truncate"><strong className="text-text-primary">Sources:</strong> {item.sourcesUsed?.join(', ') || 'None'}</div>
                      </div>

                      {/* Visual Direction section */}
                      {(item.visualDirection || item.visualIdeation) && (
                        <div className="border-t border-border-standard pt-2.5 mt-2 space-y-1.5 text-left">
                          <div className="flex justify-between items-center flex-wrap gap-1">
                            <span className="text-[10px] uppercase font-bold text-text-secondary block">Visual Direction</span>
                            <div className="flex gap-2 text-[10px] font-semibold text-text-primary">
                              <button
                                onClick={() => {
                                  const formatted = formatVisualDirectionForDisplay(
                                    item.visualDirection || item.visualIdeation,
                                    item.channel,
                                    item.outputFormat || 'Post',
                                    item.text
                                  );
                                  navigator.clipboard.writeText(formatted);
                                }}
                                className="interactive-link transition"
                              >
                                Copy Visual Direction
                              </button>
                              <span className="text-brand-gold/30">|</span>
                              <button
                                onClick={() => {
                                  const promptText = extractAIImagePrompt(
                                    item.visualDirection || item.visualIdeation,
                                    item.channel,
                                    item.outputFormat || 'Post',
                                    item.text
                                  );
                                  navigator.clipboard.writeText(promptText);
                                }}
                                className="interactive-link transition"
                              >
                                Copy AI Image Prompt
                              </button>
                            </div>
                          </div>
                          <div className="bg-surface-inset p-3 border border-border-standard rounded-lg text-[11px] text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
                            {formatVisualDirectionForDisplay(
                              item.visualDirection || item.visualIdeation,
                              item.channel,
                              item.outputFormat || 'Post',
                              item.text
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center border-t border-border-standard pt-3.5 text-[10px] text-text-muted font-mono flex-wrap gap-2">
                      <span>Saved: {item.createdAt} | Edited: {item.lastEdited}</span>
                      <div className="flex gap-2 flex-wrap items-center font-sans">
                        <button
                          onClick={() => handleCopyClipboard(item.text, item.id)}
                          className="text-[11px] font-semibold text-text-secondary hover:text-text-primary transition"
                        >
                          {copySuccessMap[item.id] ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleDuplicateSaved(item)}
                          className="text-[11px] font-semibold text-text-secondary hover:text-text-primary transition"
                        >
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            setActiveDraftText(item.text);
                            setActiveDraftTitle(item.title);
                            setActiveDraftVersion(item.version || 1);
                            setActiveDraftHistory([{ version: item.version || 1, text: item.text, timestamp: item.lastEdited, actionUsed: 'Loaded from Saved Library' }]);
                            setActiveDraftSource('Content Library');
                            setActiveTab('revision-studio');
                          }}
                          className="flex items-center gap-1 text-[11px] text-text-primary hover:text-brand-gold font-semibold transition"
                        >
                          <Edit3 size={11} /> Edit / Revise
                        </button>
                        <button
                          data-testid={`reframe-library-item-${item.id}`}
                          onClick={() => {
                            setReframingInitialOrigin({
                              originType: 'Content Library',
                              originId: item.id,
                              originTitle: item.title,
                              sourceContent: item.text,
                              originChannel: item.channel,
                              originAudience: item.audience
                            });
                            setActiveTab('reframing-studio');
                          }}
                          className="flex items-center gap-1 text-[11px] text-brand-gold hover:underline font-semibold transition"
                        >
                          <RefreshCw size={11} /> Reframe
                        </button>
                        <button
                          onClick={() => handleDeleteSaved(item.id)}
                          className="flex items-center gap-1 text-[11px] text-status-error/70 hover:text-status-error font-semibold transition"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => handleExport(item, 'txt')}
                          className="flex items-center gap-1 text-[11px] text-text-secondary hover:text-text-primary font-semibold transition"
                        >
                          Download TXT
                        </button>
                        {item.visualDirection && (
                          <button
                            onClick={() => handleSendToVisualStudio(item, item.visualDirection!, 'Library')}
                            className="flex items-center gap-1 text-[11px] text-brand-gold hover:text-brand-gold-hover font-semibold transition"
                          >
                            <Lightbulb size={11} /> Send Visual Direction to Visual Studio
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-border-standard rounded-xl bg-surface-inset">
                <p className="text-xs text-text-secondary max-w-sm mx-auto">No saved content meets the active filters.</p>
              </div>
            )}
          </div>
        
</ErrorBoundary>)}

        {/* --- TAB 5: SOURCE LIBRARY --- */}
        {activeTab === 'source-library' && (<ErrorBoundary fallbackTitle="Source Library Error">
          <div className="page-shell">
            <div className="card-level-1 p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold font-semibold mb-1">
                  Evidence &amp; Grounding
                </div>
                <h2 className="page-title">Source Library</h2>
                <p className="page-subtitle">
                  Store and manage all documents, links, notes, examples, partner context, visual references, and source materials for task-specific generation.
                </p>
              </div>

              <div className="flex gap-2 text-xs shrink-0">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  className="hidden"
                />
                <input
                  type="file"
                  ref={folderInputRef}
                  onChange={handleFolderUpload}
                  multiple
                  className="hidden"
                  {...{ webkitdirectory: "", directory: "" } as any}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-surface-inset text-text-primary hover:border-brand-gold/40 py-2 px-3.5 rounded-lg transition border border-border-standard flex items-center gap-1.5 font-semibold"
                >
                  <Upload size={14} className="text-brand-gold" /> Upload File
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="bg-surface-inset text-text-primary hover:border-brand-gold/40 py-2 px-3.5 rounded-lg transition border border-border-standard flex items-center gap-1.5 font-semibold"
                >
                  <FolderOpen size={14} className="text-brand-gold" /> Upload Folder
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)] gap-6 items-start">
              {/* Form panel */}
              <div className="min-w-0 card-level-1 p-5 sm:p-6 h-fit space-y-5">
                <div>
                  <h3 className="font-sans text-base font-bold text-text-primary pb-2 border-b border-border-standard">
                    {editingSourceId ? 'Edit Source Record' : 'Add Source'}
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed mt-1.5">
                    Provide verifiable facts, texts, or links to instruct the studio.
                  </p>
                </div>

                <form onSubmit={handleSaveSource} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-text-secondary mb-1 font-semibold">Source Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Soria Moria Funding Memo"
                      value={newSource.title}
                      onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                      className="w-full bg-surface-inset border border-border-standard p-2.5 rounded-lg text-text-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-text-secondary mb-1 font-semibold">Source Type</label>
                      <select
                        value={newSource.type}
                        onChange={(e) => setNewSource({ ...newSource, type: e.target.value as SourceFile['type'] })}
                        className="w-full bg-surface-inset border border-border-standard p-2 rounded-lg text-text-primary"
                      >
                        <option value="Event Notes">Event Notes</option>
                        <option value="Partner Profile">Partner Profile</option>
                        <option value="Sponsor Notes">Sponsor Notes</option>
                        <option value="Meeting Notes">Meeting Notes</option>
                        <option value="Campaign Notes">Campaign Notes</option>
                        <option value="Article / Media Coverage">Article / Media Coverage</option>
                        <option value="Website Reference">Website Reference</option>
                        <option value="Visual Reference">Visual Reference</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Pasted Notes">Pasted Notes</option>
                        <option value="Link / URL">Link / URL</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-text-secondary mb-1 font-semibold">Status</label>
                      <select
                        value={newSource.status}
                        onChange={(e) => setNewSource({ ...newSource, status: e.target.value as SourceFile['status'] })}
                        className="w-full bg-surface-inset border border-border-standard p-2 rounded-lg text-text-primary"
                      >
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                        <option value="Needs Review">Needs Review</option>
                      </select>
                    </div>
                  </div>

                  {newSource.type === 'Link / URL' && (
                    <div>
                      <label className="block text-text-secondary mb-1 font-semibold">Source URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newSource.url || ''}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                        className="w-full bg-surface-inset border border-border-standard p-2.5 rounded-lg text-text-primary font-mono text-[11px]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-text-secondary mb-1 font-semibold">Short Context / Notes</label>
                    <textarea
                      placeholder="Reference details, key quotes, or summaries..."
                      rows={3}
                      value={newSource.notes}
                      onChange={(e) => setNewSource({ ...newSource, notes: e.target.value })}
                      className="w-full bg-surface-inset border border-border-standard p-2.5 rounded-lg text-text-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-text-secondary mb-1 font-semibold">Content / Extracted Text or Summary</label>
                    <textarea
                      placeholder="Paste text summary or markdown file copy..."
                      rows={5}
                      required
                      value={newSource.content}
                      onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                      className="w-full bg-surface-inset border border-border-standard p-2.5 rounded-lg text-text-primary font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1 pb-1">
                    <input
                      type="checkbox"
                      id="sourceSelectable"
                      checked={newSource.selectable !== false}
                      onChange={(e) => setNewSource({ ...newSource, selectable: e.target.checked })}
                      className="rounded border-brand-gold/50 text-brand-gold focus:ring-brand-gold w-4 h-4 cursor-pointer"
                    />
                    <label htmlFor="sourceSelectable" className="text-text-primary font-semibold cursor-pointer select-none">
                      Selectable for generation context
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="cursor-pointer hover:opacity-95 active:scale-[0.98] transition-all flex-1 bg-brand-gold text-surface-base hover:bg-brand-gold-hover py-2.5 px-4 rounded-lg font-sans text-xs font-bold action-button interactive-button"
                    >
                      {editingSourceId ? 'Save Edits' : 'Add Source'}
                    </button>
                    {editingSourceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSourceId(null);
                          setNewSource({ title: '', type: 'Other', status: 'Active',    notes: '', content: '', url: '', selectable: true });
                        }}
                        className="bg-surface-inset text-text-primary border border-border-standard py-2 px-3 rounded-lg hover:bg-surface-elevated transition text-xs font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Records List Panel */}
              <div className="min-w-0 space-y-5">
                
                {/* Filters */}
                <div className="flex flex-wrap gap-1.5 pb-2 border-b border-border-standard">
                  {['All', 'Task Sources', 'Approved Examples', 'Partner Context', 'Visual References', 'Archive'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setSourceLibraryFilter(filter)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg transition ${
                        sourceLibraryFilter === filter 
                          ? 'bg-brand-gold text-surface-base font-bold' 
                          : 'bg-surface-primary border border-border-standard text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* User-Added Sources list */}
                <div className="space-y-3.5">
                  {(() => {
                    let filtered = selectableSources;
                    if (sourceLibraryFilter === 'Approved Examples') {
                      filtered = selectableSources.filter(s => s.type === 'Approved Example');
                    } else if (sourceLibraryFilter === 'Visual References') {
                      filtered = selectableSources.filter(s => s.type === 'Visual Reference');
                    } else if (sourceLibraryFilter === 'Partner Context') {
                      filtered = selectableSources.filter(s => s.type === 'Partner Profile' || s.type === 'Sponsor Notes');
                    } else if (sourceLibraryFilter === 'Task Sources') {
                      filtered = selectableSources.filter(s => advancedBrief.selectedSourceIds.includes(s.id));
                    } else if (sourceLibraryFilter === 'Archive') {
                      filtered = selectableSources.filter(s => s.status === 'Archived');
                    }

                    if (filtered.length === 0) {
                      return <p className="text-xs text-text-secondary italic py-4">No sources found for this filter.</p>;
                    }

                    return filtered.map(src => {
                      const isSelected = advancedBrief.selectedSourceIds.includes(src.id);
                      return (
                        <div key={src.id} className={`card-level-1 p-5 flex gap-4 transition ${
                          isSelected ? 'border-brand-gold ring-1 ring-brand-gold/25' : 'border-border-standard'
                        }`}>
                          <div className="pt-1 select-none">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSourceSelection(src.id)}
                              className="rounded border-brand-gold/50 text-brand-gold focus:ring-brand-gold w-4 h-4 cursor-pointer"
                              title="Select for generation"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/25">
                                {src.type}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold border ${
                                src.status === 'Active' ? 'bg-status-success/10 border-status-success/25 text-status-success' :
                                src.status === 'Archived' ? 'bg-surface-inset border-border-standard text-text-muted' :
                                'bg-status-warning/10 border-status-warning/25 text-status-warning'
                              }`}>
                                {src.status}
                              </span>
                              {src.selectable === false && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono font-semibold uppercase border border-status-error/30 text-status-error bg-status-error/10">
                                  Non-Selectable
                                </span>
                              )}
                            </div>

                            <h4 className="font-sans text-base font-bold text-text-primary">{src.title}</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">{src.notes}</p>

                            <details className="text-[11px] text-text-secondary cursor-pointer pt-1">
                              <summary className="interactive-link transition font-semibold">Show Raw Source Text</summary>
                              <pre className="mt-2 p-3 bg-surface-inset rounded-lg border border-border-standard overflow-x-auto whitespace-pre-wrap font-mono text-[11px] text-text-primary max-h-48">
                                {src.content}
                              </pre>
                              {src.url && (
                                <div className="mt-2 text-brand-gold">
                                  <a href={src.url} target="_blank" rel="noreferrer" className="interactive-link break-all">🔗 {src.url}</a>
                                </div>
                              )}
                            </details>

                            <SourceIntelligenceCardAddon
                              source={src}
                              analysis={sourceIntelligenceMap[src.id] || null}
                              isAnalyzing={Boolean(analyzingSourceIds[src.id])}
                              analysisError={sourceAnalysisErrors[src.id] || null}
                              isSelectedInTask={isSelected}
                              activeTaskRole={getEffectiveSourceRole(src)}
                              selectedExcerpts={getEffectiveSourceExcerpts(src.id)}
                              onAnalyzeSource={handleAnalyzeSource}
                              onChangeTaskRole={handleChangeSourceTaskRole}
                              onToggleExcerpt={handleToggleSourceExcerpt}
                              onAddToCurrentBrief={handleAddToCurrentBrief}
                              onUseInIdeation={handleUseSourceInIdeation}
                              onCreateContent={handleCreateContentFromSource}
                              onUseAsVisualReference={handleUseSourceAsVisualReference}
                              onUseInReframing={handleUseSourceInReframing}
                            />

                            <div className="pt-2">
                              <button
                                onClick={() => setExtractingInsightFor(extractingInsightFor === src.id ? null : src.id)}
                                className="text-[10px] font-semibold text-text-secondary interactive-link transition uppercase tracking-wider"
                              >
                                Use to update Operating Core {extractingInsightFor === src.id ? '↓' : '→'}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 shrink-0">
                            <button
                              onClick={() => handleEditSource(src)}
                              className="text-text-secondary hover:text-text-primary px-2 py-1 hover:bg-surface-inset rounded-md transition text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Edit3 size={12} /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSource(src.id)}
                              className="text-status-error/70 hover:text-status-error px-2 py-1 hover:bg-status-error/10 rounded-md transition text-[11px] font-semibold flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

              </div>
            </div>
          </div>
        
</ErrorBoundary>)}

        {/* --- TAB 6: SETTINGS / COH BRAIN --- */}
        {activeTab === 'settings' && (<ErrorBoundary fallbackTitle="Settings Error">
          <div className="page-shell">
            <div className="card-level-1 p-5 sm:p-6">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-gold font-semibold mb-1">
                Technical Configuration
              </div>
              <h2 className="page-title">Settings</h2>
              <p className="page-subtitle">
                Configure AI provider and generation mode.
              </p>
              <p className="text-xs text-text-secondary font-sans bg-surface-inset px-3 py-2 rounded-lg border border-border-standard inline-block mt-3">
                Note: Content, voice, claims, audience, visual, and revision rules are managed in Operating Core. Settings is for technical configuration.
              </p>
            </div>

            {/* Section Nav */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                {([['ai', 'AI Connection']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSettingsSection(key)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${settingsSection === key ? 'bg-brand-gold text-surface-base' : 'bg-surface-primary border border-border-standard text-text-primary hover:bg-surface-inset'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!authBypass && (
                <button
                  onClick={handleLogout}
                  className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all bg-red-800/10 hover:bg-red-800/20 text-red-800 border border-red-800/20 px-3 py-1.5 rounded text-xs font-semibold transition action-button"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* ── Settings Sections ─────────────────────────────────────── */}
            {settingsSection === 'ai' && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-12 items-start">
                
                {/* 1. Provider Connection */}
                <Card className="xl:col-span-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>1. Provider Connection</CardTitle>
                        <p className="text-sm text-text-secondary mt-1">Connect your preferred AI model provider. An API key is required.</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${aiStatus === 'connected' && !settingsKeyDirty ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${aiStatus === 'connected' && !settingsKeyDirty ? 'bg-status-success' : 'bg-status-warning'}`} />
                        {aiStatus === 'connected' && !settingsKeyDirty ? 'Connected' : 'Action Required'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <Select
                      label="AI Provider"
                      value={settingsProvider}
                      onChange={(e) => {
                        const p = e.target.value;
                        setSettingsProvider(p);
                        
                        const recText = MODEL_REGISTRY.find(m => m.provider === p && m.type === 'text' && m.isRecommended) || MODEL_REGISTRY.find(m => m.provider === p && m.type === 'text');
                        setSettingsTextModel(recText ? recText.id : '');
                        
                        if (p === 'openai' || p === 'openrouter') {
                          const recImage = MODEL_REGISTRY.find(m => m.provider === p && m.type === 'image' && m.isRecommended) || MODEL_REGISTRY.find(m => m.provider === p && m.type === 'image');
                          setSettingsImageModel(recImage ? recImage.id : '');
                        } else {
                          setSettingsImageModel('');
                        }
                        
                        setSettingsBaseUrl('');
                        setSettingsTestPassed(null);
                        setSettingsTestResult('');
                        setSettingsKeyDirty(true);
                      }}
                      options={[
                        { label: 'OpenAI', value: 'openai' },
                        { label: 'Google Gemini', value: 'gemini' },
                        { label: 'Anthropic Claude', value: 'anthropic' },
                        { label: 'Mistral', value: 'mistral' },
                        { label: 'OpenRouter / OpenAI-Compatible', value: 'openrouter' },
                      ]}
                    />

                    {settingsProvider === 'openrouter' && (
                      <Input
                        label="Base URL (Optional)"
                        value={settingsBaseUrl}
                        onChange={(e) => { setSettingsBaseUrl(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); }}
                        placeholder="https://openrouter.ai/api/v1"
                        className="font-mono text-sm"
                        helperText="Required if using a custom OpenAI-compatible endpoint."
                      />
                    )}

                    <div>
                      <Input
                        label="API Key"
                        type="password"
                        value={settingsApiKey}
                        onChange={(e) => { setSettingsApiKey(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); setSettingsTestResult(''); }}
                        placeholder={MODEL_REGISTRY.find(m => m.provider === settingsProvider)?.provider === 'openai' ? 'sk-proj-...' : 'Enter API key'}
                        className="font-mono text-sm"
                        autoComplete="off"
                        helperText="API keys are configured securely via backend or deployment environment variables. They are not exposed in the browser."
                      />
                    </div>

                    <div className="pt-2 border-t border-border-standard flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          variant="secondary"
                          disabled={settingsTestCooldown > 0 || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)}
                          onClick={async () => {
                            setSettingsTesting(true);
                            if (aiStatus !== 'error') setAiStatus('testing');
                            setSettingsTestResult('');
                            setSettingsTestPassed(null);
                            try {
                              const result = await aiService.testConnection(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey.trim(), settingsBaseUrl || undefined);
                              if (result.connected) {
                                setSettingsTestPassed(true);
                                setSettingsTestResult(`Connection verified for ${settingsProvider} (${settingsTextModel}). Latency: ${result.latency}ms.`);
                                setAiLastTested(new Date().toLocaleString());
                                setAiLatency(result.latency);
                                setAiStatus('not_connected');
                              } else {
                                setSettingsTestPassed(false);
                                const rawErr = result.error || 'Provider connection failed. Check the API key or provider configuration.';
                                const errMsg = `[${settingsProvider} / ${settingsTextModel}] ${rawErr}`;
                                setSettingsTestResult(errMsg);
                                if (errMsg.includes('Rate limit reached')) {
                                  setSettingsTestCooldown(30);
                                } else {
                                  setAiStatus('error');
                                  setAiLastError(errMsg);
                                }
                              }
                            } catch {
                              setSettingsTestPassed(false);
                              setSettingsTestResult('Could not reach the backend server. Is it running?');
                              setAiStatus('error');
                            } finally {
                              setSettingsTesting(false);
                            }
                          }}
                        >
                          {settingsTesting ? 'Testing...' : (settingsTestCooldown > 0 ? `Wait ${settingsTestCooldown}s` : 'Test Connection')}
                        </Button>

                        <Button
                          variant="primary"
                          disabled={settingsApplying || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel) || (!settingsKeyDirty && aiStatus === 'connected')}
                          onClick={async () => {
                            setSettingsApplying(true);
                            setSettingsTestResult('');
                            try {
                              let testedTimestamp = aiLastTested;
                              if (settingsTestPassed !== true) {
                                const result = await aiService.testConnection(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey.trim(), settingsBaseUrl || undefined);
                                if (!result.connected) {
                                  setSettingsTestPassed(false);
                                  const rawErr = result.error || 'Provider connection failed. Check the API key or provider configuration.';
                                  const errMsg = `[${settingsProvider} / ${settingsTextModel}] ${rawErr}`;
                                  setSettingsTestResult(errMsg);
                                  setAiStatus('error');
                                  setAiLastError(errMsg);
                                  return;
                                }
                                setSettingsTestPassed(true);
                                testedTimestamp = new Date().toLocaleString();
                                setAiLastTested(testedTimestamp);
                                setAiLatency(result.latency);
                              }
                              await aiService.applyProvider(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey.trim(), settingsBaseUrl || undefined, testedTimestamp);
                              setAiStatus('connected');
                              setAiProvider(settingsProvider);
                              setAiTextModel(settingsTextModel);
                              setAiImageModel(settingsImageModel);
                              setGenerationMode('ai');
                              setAiLastError('');
                              setSettingsTestResult('AI settings saved. Text and image generation are active.');
                              setSettingsKeyDirty(false);
                            } catch {
                              setAiStatus('error');
                              setSettingsTestResult('Failed to apply provider. Check server logs.');
                            } finally {
                              setSettingsApplying(false);
                            }
                          }}
                        >
                          {settingsApplying ? 'Verifying & Saving...' : (!settingsKeyDirty && aiStatus === 'connected') ? '✓ Connected & Active' : 'Save & Connect Key'}
                        </Button>
                      </div>

                      {settingsTestResult && (
                        <div className={`flex items-center gap-2 text-xs font-semibold p-2.5 rounded-lg border ${settingsTestPassed || aiStatus === 'connected' ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-error/10 text-status-error border-status-error/20'}`}>
                          {settingsTestPassed || aiStatus === 'connected' ? <Check size={14} /> : <AlertTriangle size={14} />}
                          <span>{settingsTestResult}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Model Preferences */}
                <Card className={`xl:col-span-6 ${!settingsProvider ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CardHeader>
                    <CardTitle>2. Model Preferences</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">Select the specific models to use for text and visual generation.</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {fallbackWarning && (
                      <div className="bg-status-warning/10 text-status-warning p-3 rounded border border-status-warning/20 text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {fallbackWarning}
                      </div>
                    )}
                    
                    <div>
                      <Select
                        label="Text Generation Model"
                        value={settingsTextModel}
                        onChange={(e) => { 
                          setSettingsTextModel(e.target.value); 
                          safeLocalStorageSet('coh_settings_text_model', e.target.value);
                          setSettingsTestPassed(null); 
                          setSettingsKeyDirty(true); 
                          setFallbackWarning('');
                        }}
                        disabled={!settingsProvider}
                        options={[
                          { label: 'Select a model...', value: '' },
                          ...MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'text').map(m => ({
                            label: `${m.label} ${m.isRecommended ? '(Recommended)' : ''}`,
                            value: m.id
                          }))
                        ]}
                        helperText="Controls written outputs such as drafts, ideas, revisions, and prompts."
                      />
                      
                      {settingsTextModel && MODEL_REGISTRY.find(m => m.id === settingsTextModel) && (
                        <div className="mt-3 text-sm text-text-secondary bg-surface-inset p-4 rounded-lg border border-border-standard flex flex-col gap-2">
                          <div className="flex flex-wrap items-center gap-6">
                            {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.tierLabel && (
                              <span><strong className="text-text-primary">Tier:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.tierLabel}</span>
                            )}
                            <span><strong className="text-text-primary">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.quality}</span>
                            <span><strong className="text-text-primary">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.speed}</span>
                          </div>
                          <div>
                            <strong className="text-text-primary block mb-1">Best for:</strong>
                            <ul className="list-disc pl-5 space-y-1">
                              {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.bestUseCase.split(',').map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {(settingsProvider === 'openai' || settingsProvider === 'openrouter') && (
                      <div className="pt-4 border-t border-border-standard">
                        <Select
                          label="Image Generation Model"
                          value={settingsImageModel}
                          onChange={(e) => { 
                            setSettingsImageModel(e.target.value); 
                            safeLocalStorageSet('coh_settings_image_model', e.target.value);
                            setSettingsTestPassed(null); 
                            setSettingsKeyDirty(true); 
                            setFallbackWarning('');
                          }}
                          disabled={!settingsProvider}
                          options={[
                            { label: 'Select a model...', value: '' },
                            ...MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'image').map(m => ({
                              label: `${m.label} ${m.isRecommended ? '(Recommended)' : ''}`,
                              value: m.id
                            }))
                          ]}
                          helperText="Controls Visual Studio image generation. Image quality depends heavily on the selected model."
                        />
                        
                        {settingsImageModel && MODEL_REGISTRY.find(m => m.id === settingsImageModel) && (
                          <div className="mt-3 text-sm text-text-secondary bg-surface-inset p-4 rounded-lg border border-border-standard flex flex-col gap-2">
                            <div className="flex gap-6">
                              <span><strong className="text-text-primary">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.quality}</span>
                              <span><strong className="text-text-primary">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.speed}</span>
                            </div>
                            <div>
                              <strong className="text-text-primary block mb-1">Best for:</strong>
                              <ul className="list-disc pl-5 space-y-1">
                                {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.bestUseCase.split(',').map((item, idx) => (
                                  <li key={idx}>{item.trim()}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Testing & Verification */}
                <Card className={`xl:col-span-6 ${!settingsTextModel ? 'opacity-50 pointer-events-none' : ''}`}>
                  <CardHeader>
                    <CardTitle>3. Test & Save Connection</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">Verify your credentials work before saving the configuration.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-surface-inset p-4 rounded-lg border border-border-standard mb-6">
                      <Button
                        variant="secondary"
                        disabled={settingsTestCooldown > 0 || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)}
                        onClick={async () => {
                          setSettingsTesting(true);
                          if (aiStatus !== 'error') setAiStatus('testing');
                          
                          setSettingsTestResult('');
                          setSettingsTestPassed(null);
                          try {
                            const result = await aiService.testConnection(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey.trim(), settingsBaseUrl || undefined);
                            if (result.connected) {
                              setSettingsTestPassed(true);
                              setSettingsTestResult(`Connection verified for ${settingsProvider} (${settingsTextModel}). Latency: ${result.latency}ms.`);
                              setAiLastTested(new Date().toLocaleString());
                              setAiLatency(result.latency);
                              setAiStatus('not_connected');
                            } else {
                              setSettingsTestPassed(false);
                              const rawErr = result.error || 'Provider connection failed. Check the API key or provider configuration.';
                              const errMsg = `[${settingsProvider} / ${settingsTextModel}] ${rawErr}`;
                              setSettingsTestResult(errMsg);
                              
                              if (errMsg.includes('Rate limit reached')) {
                                setSettingsTestCooldown(30);
                              } else {
                                setAiStatus('error');
                                setAiLastError(errMsg);
                              }
                            }
                          } catch {
                            setSettingsTestPassed(false);
                            setSettingsTestResult('Could not reach the backend server. Is it running?');
                            setAiStatus('error');
                          } finally {
                            setSettingsTesting(false);
                          }
                        }}
                      >
                        {settingsTesting ? 'Testing...' : (settingsTestCooldown > 0 ? `Wait ${settingsTestCooldown}s` : 'Test Connection')}
                      </Button>

                      <div className="flex-1">
                        {settingsTestResult ? (
                          <div className={`flex items-center gap-2 text-sm font-semibold ${settingsTestPassed || aiStatus === 'connected' ? 'text-status-success' : 'text-status-error'}`}>
                            {settingsTestPassed || aiStatus === 'connected' ? <Check size={16} /> : <AlertTriangle size={16} />}
                            {settingsTestResult}
                          </div>
                        ) : (
                          <div className="text-sm text-text-muted">Click to test your current setup.</div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full py-3"
                      disabled={settingsApplying || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel) || (!settingsKeyDirty && aiStatus === 'connected')}
                      onClick={async () => {
                        setSettingsApplying(true);
                        try {
                          let testedTimestamp = aiLastTested;
                          if (settingsTestPassed !== true) {
                            const result = await aiService.testConnection(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey.trim(), settingsBaseUrl || undefined);
                            if (!result.connected) {
                              setSettingsTestPassed(false);
                              const rawErr = result.error || 'Provider connection failed. Check the API key or provider configuration.';
                              const errMsg = `[${settingsProvider} / ${settingsTextModel}] ${rawErr}`;
                              setSettingsTestResult(errMsg);
                              setAiStatus('error');
                              setAiLastError(errMsg);
                              return;
                            }
                            setSettingsTestPassed(true);
                            testedTimestamp = new Date().toLocaleString();
                            setAiLastTested(testedTimestamp);
                            setAiLatency(result.latency);
                          }
                          await aiService.applyProvider(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey.trim(), settingsBaseUrl || undefined, testedTimestamp);
                          setAiStatus('connected');
                          setAiProvider(settingsProvider);
                          setAiTextModel(settingsTextModel);
                          setAiImageModel(settingsImageModel);
                          setGenerationMode('ai');
                          setAiLastError('');
                          setSettingsTestResult('AI settings saved. Text and image generation are active.');
                          setSettingsKeyDirty(false);
                        } catch {
                          setAiStatus('error');
                          setSettingsTestResult('Failed to apply provider. Check server logs.');
                        } finally {
                          setSettingsApplying(false);
                        }
                      }}
                    >
                      {settingsApplying ? 'Saving Configuration...' 
                      : (!settingsKeyDirty && aiStatus === 'connected') ? '✓ Settings Up to Date'
                      : 'Save and Activate AI Generation'}
                    </Button>
                  </CardContent>
                </Card>


                {/* 4. Generation Mode Override */}
                <Card className="xl:col-span-6">
                  <CardHeader>
                    <CardTitle>4. Generation Mode Override</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">Force the system to use a specific generation mode, overriding the active AI Connection.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {([
                        ['ai', 'AI Generation', 'Use the connected AI provider to generate real content.'],
                        ['prompt_builder', 'Prompt Builder Fallback', 'Show a copyable AI prompt instead of generating directly. Use when no API key is available.'],
                        ['prototype', 'Prototype Structure Only', 'Show template structure as a starting frame. Not final copy.'],
                      ] as const).map(([val, title, desc]) => (
                        <label key={val} className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition ${generationMode === val ? 'border-brand-gold bg-surface-inset shadow-sm' : 'border-border-standard hover:bg-surface-inset'}`}>
                          <input type="radio" name="genMode" value={val} checked={generationMode === val} onChange={() => setGenerationMode(val)} className="mt-1" />
                          <div>
                            <span className="font-semibold text-[15px] text-text-primary block">{title}</span>
                            <span className="text-sm text-text-secondary">{desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            </div>
            </ErrorBoundary>)}

      </main>

      {/* Overwrite Confirmation Modal */}
      {pendingIdeaToCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-surface-inset rounded-3xl shadow-xl border border-border-standard p-6 max-w-sm w-full relative">
            <button aria-label="Close overwrite confirmation" onClick={() => setPendingIdeaToCopy(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-secondary">
              <X size={16} />
            </button>
            <h3 className="font-sans text-lg font-bold text-text-primary mb-2">Overwrite Workspace?</h3>
            <p className="text-sm text-text-secondary mb-6">
              You have unsaved input in the Content Workspace. Do you want to overwrite it with this idea?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setPendingIdeaToCopy(null)}
                className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-slate-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => executeCopyIdeaToWorkspace(pendingIdeaToCopy)}
                className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded hover:bg-brand-gold-hover transition-colors"
              >
                Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-2 right-2 text-[10px] text-text-muted pointer-events-none z-50">v1.1.0-stable</div>
      <GuidedTour activeRoute={activeTab} onNavigateRoute={setActiveTab} />
    </div>
    </div>
  );
}


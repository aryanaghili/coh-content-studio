import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
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
} from 'lucide-react';
import { DEFAULT_COH_SOURCES } from './data/defaultSources';
import { createDefaultOperatingCore, compileOperatingCoreContext } from './lib/operatingCore';
import type { OperatingCore } from './lib/operatingCore';
import OperatingCoreAdmin from './components/OperatingCoreAdmin';

// --- Type Definitions ---
interface SourceFile {
  id: string;
  title: string;
  type: 
    | 'Tone of Voice'
    | 'Business Model'
    | 'Business Memo'
    | 'Website Copy'
    | 'Deck'
    | 'Event Notes'
    | 'Partnership Notes'
    | 'Sponsorship Notes'
    | 'Approved Example'
    | 'Image / Visual Asset'
    | 'Article / Media Coverage'
    | 'Team Notes'
    | 'Link'
    | 'PDF'
    | 'Audio'
    | 'Text'
    | 'Video'
    | 'Image'
    | 'Other';
  status: 'Active' | 'Archived' | 'Needs Review';
  role: 'Foundational Source' | 'Task Source' | 'Approved Example' | 'Partner Context' | 'Visual Reference' | 'Archive';
  supportsOperatingCoreSection: 'Core Passport' | 'Strategy Kernel' | 'Audiences' | 'Channels' | 'Claims' | 'Voice' | 'Visual' | 'Revision' | 'None';
  useFor: string;
  createdAt: string;
  notes: string;
  content: string;
  url?: string;
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

interface SavedContent {
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
}

interface SavedIdea {
  id: string;
  title: string;
  originalInput: string;
  category: string;
  explanation: string;
  whyItWorks: string;
  suggestedChannel: string;
  suggestedFormat: string;
  suggestedTone: string;
  possibleHook: string;
  possibleNextStep: string;
  possibleFirstPost?: string;
  riskToAvoid?: string;
  suggestedAudience?: string;
  language: string;
  dateCreated: string;
  status: 'New' | 'Promising' | 'Ready for Content' | 'Used' | 'Archived' | 'Not Useful';
  notes?: string;
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
  isRecommended?: boolean;
}

const MODEL_REGISTRY: AIModelConfig[] = [
  // OpenAI Text
  { id: 'gpt-5.5', label: 'GPT-5.5', provider: 'openai', type: 'text', quality: 'Highest', speed: 'Fast', usage: 'High', bestUseCase: 'complex strategy, premium writing, nuanced professional content', isRecommended: true },
  { id: 'gpt-5.4', label: 'GPT-5.4', provider: 'openai', type: 'text', quality: 'Very high', speed: 'Fast', usage: 'Medium-high', bestUseCase: 'strong everyday professional content and strategy work' },
  { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', provider: 'openai', type: 'text', quality: 'Strong', speed: 'Faster', usage: 'Lower', bestUseCase: 'faster drafts, ideation, lighter content operations' },
  { id: 'gpt-4o', label: 'GPT-4o (Legacy)', provider: 'openai', type: 'text', quality: 'Legacy / compatible', speed: 'Fast', usage: 'Medium', bestUseCase: 'fallback compatibility if newer models are unavailable' },
  
  // OpenAI Image
  { id: 'gpt-image-2', label: 'GPT Image 2', provider: 'openai', type: 'image', quality: 'Highest', speed: 'Medium', usage: 'High', bestUseCase: 'refined editorial visuals, premium campaign imagery, realistic visual concepts', isRecommended: true },
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
const LANGUAGES = [
  'English',
  'Italian',
  'Spanish',
  'French',
  'German',
  'Portuguese',
  'Dutch',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Polish',
  'Russian',
  'Persian',
  'Arabic',
  'Turkish',
  'Chinese',
  'Japanese',
  'Korean',
  'Hindi',
  'Vietnamese'
];

// --- Channel & Format Compatibility Matrix ---
const CHANNELS = [
  'LinkedIn',
  'Instagram',
  'Newsletter',
  'Website',
  'Email / Direct Outreach',
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
  'Email / Direct Outreach': ['WhatsApp Message', 'Email / Letter', 'Sponsor Pitch Paragraph', 'Partner Note', 'Follow-Up Note', 'Invitation Note'],
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
        className="w-3.5 h-3.5 inline-flex items-center justify-center text-[9px] bg-coh-navy/10 hover:bg-coh-navy/20 text-coh-navy rounded-full font-bold transition focus:outline-none focus:ring-1 focus:ring-coh-gold"
      >
        ?
      </button>
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 p-2.5 bg-coh-navy text-coh-cream text-[10px] rounded shadow-lg z-50 pointer-events-none leading-relaxed text-left font-sans normal-case font-normal border border-coh-gold/30">
          {text}
        </span>
      )}
    </span>
  );
}

export default function App() {
  // --- Navigation & Core State ---
  const [activeTab, setActiveTab] = useState<string>('command-center');
  const [operatingCore, setOperatingCore] = useState<OperatingCore>(() => {
    const saved = localStorage.getItem('coh_operating_core_v1');
    return saved ? JSON.parse(saved) : createDefaultOperatingCore();
  });

  useEffect(() => {
    localStorage.setItem('coh_operating_core_v1', JSON.stringify(operatingCore));
  }, [operatingCore]);

  const [creationMode, setCreationMode] = useState<'simple' | 'quick' | 'advanced'>('simple');
  const [startedFromNote, setStartedFromNote] = useState<string>('');
  const [importedIdeationContext, setImportedIdeationContext] = useState<SavedIdea | null>(null);

  // --- UI Toggles ---
  const [showContentStarters, setShowContentStarters] = useState<boolean>(false);

  // --- Sources State ---
  const [sources, setSources] = useState<SourceFile[]>(() => {
    const local = localStorage.getItem('coh_sources_v11');
    if (local) return JSON.parse(local);
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

  const [writingCleanupOn, setWritingCleanupOn] = useState<boolean>(true);

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
  const [vsAIPrompt, setVsAIPrompt] = useState<string>('');
  const [vsNotes, setVsNotes] = useState<string>('');
  const [vsPromptMode, setVsPromptMode] = useState<'Full' | 'AI Only' | 'Full + AI' | 'Manual Only'>('Full + AI');
  const [vsInputMode, setVsInputMode] = useState<'Imported' | 'Manual'>('Manual');
  const [vsManualPrompt, setVsManualPrompt] = useState<string>('');
  const [showAdvancedBrief, setShowAdvancedBrief] = useState<boolean>(false);
  const [vsGeneratedImages, setVsGeneratedImages] = useState<any[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [vsAspectRatio, setVsAspectRatio] = useState<string>('1024x1024');
  const [vsVisualStyle, setVsVisualStyle] = useState<string>('Editorial Photomontage');
  const [vsNumImages, setVsNumImages] = useState<number>(1);


  // Settings form fields (never persisted to localStorage, sent to backend only)
  const [settingsProvider, setSettingsProvider] = useState<string>('openai');
  const [settingsTextModel, setSettingsTextModel] = useState<string>('gpt-4o');
  const [settingsImageModel, setSettingsImageModel] = useState<string>('dall-e-3');
  const [settingsApiKey, setSettingsApiKey] = useState<string>('');
  const [settingsBaseUrl, setSettingsBaseUrl] = useState<string>('');
  const [settingsTestResult, setSettingsTestResult] = useState<string>('');
  const [settingsTestPassed, setSettingsTestPassed] = useState<boolean | null>(null);
  const [settingsApplying, setSettingsApplying] = useState<boolean>(false);
  const [settingsTesting, setSettingsTesting] = useState<boolean>(false);
  const [settingsTestCooldown, setSettingsTestCooldown] = useState<number>(0);
  
  // Cooldown effect
  useEffect(() => {
    if (settingsTestCooldown > 0) {
      const timer = setTimeout(() => setSettingsTestCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [settingsTestCooldown]);
  const [settingsKeyDirty, setSettingsKeyDirty] = useState<boolean>(false);
  const [settingsSection, setSettingsSection] = useState<'ai' | 'content_rules'>('ai');

  // --- Authentication States & Handlers ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authBypass, setAuthBypass] = useState<boolean>(false);
  const [authUsernameInput, setAuthUsernameInput] = useState<string>('');
  const [authPasswordInput, setAuthPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
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
      alert('Could not log out. Please refresh.');
    }
  };


  // AI service - calls backend, never exposes keys
  const aiService = {
    async getStatus() {
      try {
        const res = await fetch('/api/ai/status');
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
            if (data.activeConfig.apiKeySource === 'env') {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, textModel, imageModel, apiKey, baseUrl })
      });
      return res.json();
    },

    async applyProvider(provider: string, textModel: string, imageModel: string, apiKey: string, baseUrl?: string, lastTestedAt?: string) {
      const res = await fetch('/api/ai/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, textModel, imageModel, apiKey, baseUrl, lastTestedAt })
      });
      if (!res.ok) throw new Error('Failed to apply configuration');
      return res.json();
    },

    async generate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed.');
      return data;
    },

    async ideate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI ideation failed.');
      return data;
    },

    async revise(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI revision failed.');
      return data;
    },

    async getPrompt(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return res.json();
    },
  };

  // --- Visual Studio Logic ---
  const handleSendToVisualStudio = (item: any, rawDirection: string, type: 'Idea' | 'Content' | 'Library') => {
    setVsSourceItem({ id: item.id, title: item.title || item.originalInput || 'Untitled', type });
    
    // Attempt basic parsing
    const conceptMatch = rawDirection.match(/Concept:\s*(.*?)(?=\n-|$)/i);
    const formatMatch = rawDirection.match(/Recommendation:\s*(.*?)(?=\n-|$)/i) || rawDirection.match(/Format:\s*(.*?)(?=\n-|$)/i);
    const moodMatch = rawDirection.match(/Mood.*?:\s*(.*?)(?=\n-|$)/i);
    const compMatch = rawDirection.match(/Composition:\s*(.*?)(?=\n-|$)/i);
    const colorMatch = rawDirection.match(/Color.*?:\s*(.*?)(?=\n-|$)/i);
    const typoMatch = rawDirection.match(/Typography.*?:\s*(.*?)(?=\n-|$)/i);
    const elMatch = rawDirection.match(/Key.*?Elements:\s*(.*?)(?=\n-|$)/i);
    const avoidMatch = rawDirection.match(/Avoid:\s*(.*?)(?=\n-|$)/i);
    const aiMatch = rawDirection.match(/AI Image Prompt:\s*(.*?)(?=\n-|$)/i);
    const notesMatch = rawDirection.match(/Designer Notes:\s*(.*?)(?=\n-|$)/i);

    setVsConcept(conceptMatch ? conceptMatch[1].trim() : rawDirection);
    setVsFormat(formatMatch ? formatMatch[1].trim() : '');
    setVsMood(moodMatch ? moodMatch[1].trim() : '');
    setVsComposition(compMatch ? compMatch[1].trim() : '');
    setVsPalette(colorMatch ? colorMatch[1].trim() : '');
    setVsTypography(typoMatch ? typoMatch[1].trim() : '');
    setVsElements(elMatch ? elMatch[1].trim() : '');
    setVsAvoid(avoidMatch ? avoidMatch[1].trim() : '');
    setVsAIPrompt(aiMatch ? aiMatch[1].trim() : '');
    setVsNotes(notesMatch ? notesMatch[1].trim() : '');

    setVsInputMode('Imported');
    setVsPromptMode('Full + AI');
    setActiveTab('visual-studio');
  };

  const handleGenerateImage = async () => {
    if (!aiProvider) {
      alert("Please configure an AI provider first.");
      return;
    }
    
    const payload = {
      prompt: vsManualPrompt,
      promptBuildMode: vsPromptMode,
      aspectRatio: vsAspectRatio,
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
        notes: vsNotes
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
      }
    } catch (err: any) {
      setAiLastError(err.message || 'Error generating image');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Poll status on mount
  useEffect(() => {
    checkSession();
  }, []);

  // --- Workspace Local Dynamic Sources ---
  const [workspaceLocalSources, setWorkspaceLocalSources] = useState<SourceFile[]>([]);
  const [inlineSourceType, setInlineSourceType] = useState<'library' | 'paste' | 'upload' | 'link'>('library');
  const [inlinePasteData, setInlinePasteData] = useState({ title: '', content: '', saveToLibrary: false });
  
  // URL Context form fields
  const [inlineLinkData, setInlineLinkData] = useState({ title: '', url: '', summary: '', saveToLibrary: false });
  const [linkWarning, setLinkWarning] = useState<string>('');

  const [inlineUploadData, setInlineUploadData] = useState({ title: '', content: '', saveToLibrary: false });

  // --- Validation Warning State ---
  const [validationWarning, setValidationWarning] = useState<string>('');

  // --- Content Library State ---
  const [savedContent, setSavedContent] = useState<SavedContent[]>(() => {
    const local = localStorage.getItem('coh_saved_content_v11');
    if (local) {
      const parsed = JSON.parse(local) as SavedContent[];
      // Map old legacy audience values
      return parsed.map(item => {
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
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>(() => {
    const local = localStorage.getItem('coh_saved_ideas_v1');
    if (local) return JSON.parse(local);
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
    localStorage.setItem('coh_saved_ideas_v1', JSON.stringify(savedIdeas));
  }, [savedIdeas]);

  // --- Ideation Actions and Helper Functions ---
  const handleGenerateIdeas = async () => {
    const inputVal = ideationInput.trim();
    if (!inputVal) return;
    setIsIdeating(true);

    if (generationMode === 'ai' && aiStatus === 'connected') {
      try {
        const result = await aiService.ideate({
          rawInput: inputVal,
          language: ideationFilterLanguage,
          audience: ideationFilterAudience,
          depth: ideationFilterDepth,
          quality: ideationFilterQuality,
          operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Ideation Workspace', audience: ideationFilterAudience })
        });
        const dateStr = new Date().toISOString().split('T')[0];
        const list: SavedIdea[] = [];
        result.ideaGroups?.forEach((group: any) => {
          group.ideas?.forEach((idea: any, idx: number) => {
            list.push({
              id: `idea-ai-${idx}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              title: idea.title || 'Untitled',
              originalInput: inputVal,
              category: idea.category || group.groupTitle || 'General',
              explanation: idea.shortExplanation || idea.explanation || '',
              whyItWorks: idea.whyItWorks || '',
              suggestedChannel: idea.bestChannelFit || 'LinkedIn',
              suggestedFormat: idea.suggestedOutputFormat || 'Post',
              suggestedAudience: idea.suggestedAudience || ideationFilterAudience,
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
        setGeneratedIdeas(list);
      } catch (err: any) {
        alert(err.message || 'AI Ideation failed.');
      } finally {
        setIsIdeating(false);
      }
      return;
    }

    // Prototype fallback
    setTimeout(() => {
      const inputLower = inputVal.toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];

      // 1. Input type classification
      let detectedType = 'rough idea';
      if (inputLower.split(' ').length <= 2) {
        detectedType = 'keyword';
      } else if (inputLower.includes('?')) {
        detectedType = 'question';
      } else if (inputLower.includes('vs') || inputLower.includes('superior to') || inputLower.includes('better than') || inputLower.includes('compared')) {
        detectedType = 'comparison';
      } else if (inputLower.includes('grief') || inputLower.includes('feel') || inputLower.includes('sorrow') || inputLower.includes('mourn') || inputLower.includes('hope') || inputLower.includes('ritual') || inputLower.includes('emotion')) {
        detectedType = 'emotional theme';
      } else if (inputLower.includes('how') || inputLower.includes('explain') || inputLower.includes('what is') || inputLower.includes('learn') || inputLower.includes('science')) {
        detectedType = 'educational topic';
      } else if (inputLower.includes('should') || inputLower.includes('must') || inputLower.includes('is superior') || inputLower.includes('why is') || inputLower.includes('because')) {
        detectedType = 'thesis';
      } else if (inputLower.includes('campaign') || inputLower.includes('launch') || inputLower.includes('outreach') || inputLower.includes('series')) {
        detectedType = 'campaign direction';
      } else if (inputLower.includes('how to reach') || inputLower.includes('barrier') || inputLower.includes('hesitant')) {
        detectedType = 'audience problem';
      } else if (inputLower.includes('ticket') || inputLower.includes('invite') || inputLower.includes('attend') || inputLower.includes('reserve') || inputLower.includes('event')) {
        detectedType = 'event or promotion need';
      } else if (inputLower.includes('art') || inputLower.includes('opera') || inputLower.includes('culture') || inputLower.includes('canon') || inputLower.includes('aesthetic')) {
        detectedType = 'cultural argument';
      } else if (inputLower.split(' ').length > 20) {
        detectedType = 'paragraph';
      }

      // Helper functions for dynamic strings
      const getTone = (depth: string, q: string) => {
        if (depth === 'Experimental') return 'Bold / Punchy';
        if (q === 'Sponsor-facing') return 'Calm / Institutional';
        if (q === 'Emotional') return 'Human / Narrative';
        return 'Measured / Credible';
      };

      const getTitle = (cat: string) => {
        const cleanInput = inputVal.replace(/\?$/, '');
        if (cat === 'Strongest Directions') return `Visceral bypass vs intellectual distance for: ${cleanInput}`;
        if (cat === 'Sharp Hooks') return `Provocative entry points for: ${cleanInput}`;
        if (cat === 'Thought Leadership Angles') return `Strategic thesis on: ${cleanInput}`;
        if (cat === 'Educational Angles') return `Demystifying the mechanics behind: ${cleanInput}`;
        if (cat === 'Emotional or Reflective Angles') return `Somatic memory and resonance of: ${cleanInput}`;
        if (cat === 'Storytelling Angles') return `Staging the transformation of: ${cleanInput}`;
        if (cat === 'Promotional Angles') return `Action pathway: Engaging supporters for: ${cleanInput}`;
        if (cat === 'Campaign-Series Ideas') return `Multi-part cycle: Deep dive into: ${cleanInput}`;
        return `Unusual creative framing for: ${cleanInput}`;
      };

      const getExplanation = (cat: string) => {
        const isDeep = ideationFilterDepth === 'Deep';
        const qualityStr = ideationFilterQuality !== 'Practical' ? `Applying a focused ${ideationFilterQuality.toLowerCase()} filter, ` : '';
        const depthStr = isDeep ? 'Detail a strategic, high-nuance concept arguing that' : 'Outline a clean direction stating that';
        
        if (cat === 'Strongest Directions') {
          return `${qualityStr}${depthStr} live somatic experiences of "${inputVal}" create a lasting impact that policy briefs fail to establish.`;
        }
        if (cat === 'Sharp Hooks') {
          return `${qualityStr}${depthStr} we can hook public attention by questioning conventional views on "${inputVal}".`;
        }
        if (cat === 'Thought Leadership Angles') {
          return `${qualityStr}${depthStr} "${inputVal}" requires permanent, reusable cultural infrastructure rather than temporary public awareness campaigns.`;
        }
        if (cat === 'Educational Angles') {
          return `${qualityStr}${depthStr} we can break down the physical or structural science behind "${inputVal}" using clear, jargon-free analogies.`;
        }
        if (cat === 'Emotional or Reflective Angles') {
          return `${qualityStr}${depthStr} art provides the necessary ritual space to process the grief and emotional weight of "${inputVal}".`;
        }
        if (cat === 'Storytelling Angles') {
          return `${qualityStr}${depthStr} we can follow a specific scene, character, or musical threshold that makes "${inputVal}" visible.`;
        }
        if (cat === 'Promotional Angles') {
          return `${qualityStr}${depthStr} we can invite sponsors and partners to back the creative development of "${inputVal}" as a prestige asset.`;
        }
        if (cat === 'Campaign-Series Ideas') {
          return `${qualityStr}${depthStr} a 3-part sequential series can trace the history, immediate reality, and future potential of "${inputVal}".`;
        }
        return `${qualityStr}Juxtapose "${inputVal}" with acoustic resonance, planetary timelines, or staging methods to deliver a bold new creative concept.`;
      };

      const getWhyItWorks = (cat: string) => {
        if (ideationFilterQuality === 'Sponsor-facing') return 'Directly aligns with long-term capital backing and prestige ROI.';
        if (ideationFilterQuality === 'Emotional') return 'Triggers a strong personal connection and bypasses academic jargon.';
        if (ideationFilterQuality === 'Bold') return 'Stands out in feeds by taking a highly provocative and visible stand.';
        return 'Bridges the gap between raw data and somatic human experience.';
      };

      const getHook = (cat: string) => {
        return `Why do we keep writing reports about ${inputVal.toLowerCase().replace(/\?$/, '')} when music can change how we breathe?`;
      };

      const getFirstPost = (cat: string) => {
        return `Staging a response to ${inputVal.toLowerCase().replace(/\?$/, '')} isn't just about entertainment. It's about building a permanent cultural archive of our changing planet.`;
      };

      const getRisk = (cat: string) => {
        return `Avoid generic activist slogans, preachy language, or over-promising concrete political changes.`;
      };

      const getNextStep = (cat: string) => {
        return `Draft a direct output brief and send it to the Content Workspace for copy generation.`;
      };

      const categoriesList = [
        'Strongest Directions',
        'Sharp Hooks',
        'Thought Leadership Angles',
        'Educational Angles',
        'Emotional or Reflective Angles',
        'Storytelling Angles',
        'Promotional Angles',
        'Campaign-Series Ideas',
        'Experimental Ideas'
      ];

      const list: SavedIdea[] = categoriesList.map((catName, idx) => {
        const chan = catName.includes('Promotional') ? 'Email / Direct Outreach' : (catName.includes('Hook') || catName.includes('Emotional') ? 'Instagram' : 'LinkedIn');
        const fmt = catName.includes('Promotional') ? 'Sponsor Pitch Paragraph' : (catName.includes('Hook') ? 'Caption' : (catName.includes('Educational') ? 'Carousel' : 'Post'));

        return {
          id: `idea-gen-${idx}-${Date.now()}`,
          title: translateText(getTitle(catName), ideationFilterLanguage),
          originalInput: inputVal,
          category: translateText(catName, ideationFilterLanguage),
          explanation: translateText(getExplanation(catName), ideationFilterLanguage),
          whyItWorks: translateText(getWhyItWorks(catName), ideationFilterLanguage),
          suggestedChannel: chan,
          suggestedFormat: fmt,
          suggestedAudience: translateText(ideationFilterAudience, ideationFilterLanguage),
          suggestedTone: translateText(getTone(ideationFilterDepth, ideationFilterQuality), ideationFilterLanguage),
          possibleHook: translateText(getHook(catName), ideationFilterLanguage),
          possibleFirstPost: translateText(getFirstPost(catName), ideationFilterLanguage),
          riskToAvoid: translateText(getRisk(catName), ideationFilterLanguage),
          possibleNextStep: translateText(getNextStep(catName), ideationFilterLanguage),
          language: ideationFilterLanguage,
          dateCreated: dateStr,
          status: 'New'
        };
      });

      setGeneratedIdeas(list);
      setIsIdeating(false);
    }, 800);
  };

  const [savingIdeaId, setSavingIdeaId] = useState<string | null>(null);

  const handleSaveIdeaToLibrary = async (idea: SavedIdea) => {
    if (savedIdeas.some(i => i.title === idea.title)) {
      alert('This idea is already saved in your library.');
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

  const handleCopyIdeaToWorkspace = (idea: SavedIdea) => {
    // Check if there is existing unsaved work
    const hasUnsavedSimple = !!simpleBrief.goal.trim();
    const hasUnsavedQuick = !!quickBrief.goal.trim();
    const hasUnsavedAdvanced = !!advancedBrief.topic.trim();
    
    if (hasUnsavedSimple || hasUnsavedQuick || hasUnsavedAdvanced) {
      if (!window.confirm("You have unsaved input in the Content Workspace. Do you want to overwrite it with this idea?")) {
        return;
      }
    }

    // Default to 'simple' mode unless the idea explicitly specifies advanced structures (we will use simple by default)
    setCreationMode('simple');

    const mappedNotes = `${idea.explanation}\n\nWhy it works: ${idea.whyItWorks}\nHook suggestion: ${idea.possibleHook}`;

    setSimpleBrief({
      goal: idea.title,
      channel: idea.suggestedChannel || 'LinkedIn'
    });

    setQuickBrief({
      creationScope: 'Single Channel',
      targetChannels: ['LinkedIn', 'Instagram', 'Newsletter', 'Website'],
      goal: idea.title,
      notes: mappedNotes,
      channel: idea.suggestedChannel || 'LinkedIn',
      mustInclude: '',
      mustAvoid: '',
      language: idea.language || 'English',
      outputFormat: idea.suggestedFormat || 'Post'
    });

    setAdvancedBrief(prev => ({
      ...prev,
      topic: idea.title,
      customDirection: mappedNotes,
      channel: idea.suggestedChannel || prev.channel,
      audience: idea.suggestedAudience || prev.audience,
      language: idea.language || prev.language,
      outputFormat: idea.suggestedFormat || prev.outputFormat
    }));

    setImportedIdeationContext(idea);
    setActiveTab('content-workspace');
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
  const [externalContentContext, setExternalContentContext] = useState<string>('');
  const [externalContentChannel, setExternalContentChannel] = useState<string>('General / Custom');
  const [externalContentFormat, setExternalContentFormat] = useState<string>('General / Custom');
  const [externalContentLanguage, setExternalContentLanguage] = useState<string>('English');
  const [externalContentTone, setExternalContentTone] = useState<string>('Balanced / COH Default');

  // --- Knowledge Library Forms ---
  const [newSource, setNewSource] = useState<{
    title: string;
    type: SourceFile['type'];
    status: SourceFile['status'];
    role: SourceFile['role'];
    supportsOperatingCoreSection: SourceFile['supportsOperatingCoreSection'];
    useFor: string;
    notes: string;
    content: string;
    url?: string;
  }>({
    title: '',
    type: 'Tone of Voice' as SourceFile['type'],
    status: 'Active' as SourceFile['status'],
    role: 'Task Source',
    supportsOperatingCoreSection: 'None',
    useFor: '',
    notes: '',
    content: '',
    url: ''
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
    localStorage.setItem('coh_sources_v11', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('coh_saved_content_v11', JSON.stringify(savedContent));
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
  const toggleSourceSelection = (id: string) => {
    const list = advancedBrief.selectedSourceIds.includes(id)
      ? advancedBrief.selectedSourceIds.filter(sId => sId !== id)
      : [...advancedBrief.selectedSourceIds, id];
    setAdvancedBrief(prev => ({ ...prev, selectedSourceIds: list }));
  };

  const handleEditSource = (src: SourceFile) => {
    setNewSource({
      title: src.title,
      type: src.type,
      status: src.status,
      role: src.role || 'Task Source',
      supportsOperatingCoreSection: src.supportsOperatingCoreSection || 'None',
      useFor: src.useFor || '',
      notes: src.notes || '',
      content: src.content || ''
    });
    setEditingSourceId(src.id);
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
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
          type: file.name.endsWith('.pdf') ? 'Deck' : 'Business Memo',
          status: 'Active',
          role: 'Task Source',
          supportsOperatingCoreSection: 'None',
          useFor: 'Extracted context reference',
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
          role: 'Task Source',
          supportsOperatingCoreSection: 'None',
          useFor: 'Folder upload context',
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
    text: string
  ): string => {
    const mainSubject = visualDir.visualConcept || 'Climate Opera Haus staged performance';
    const sceneEnvironment = visualDir.composition || 'minimalist, sober staged setting with high-prestige executive aesthetic';
    const compositionStyle = visualDir.composition || 'symmetrical composition, balanced spacing';
    const moodSetting = visualDir.mood || 'sober, focused, prestige backlighting';
    const colorPalette = visualDir.colorMaterial || 'dark blue, muted gold, off-white';
    const keyElements = visualDir.keyElements || 'stage lighting reflections, elegant geometric patterns representing environmental indices';
    const whatToAvoid = visualDir.whatToAvoid || 'protest signs, green leaves, disaster scenes';
    
    let usageContext = 'LinkedIn card or editorial graphic';
    if (channel.toLowerCase().includes('insta')) {
      usageContext = 'Instagram carousel or visual post';
    } else if (channel.toLowerCase().includes('news') || format.toLowerCase().includes('news')) {
      usageContext = 'newsletter header or blog visual';
    } else if (format.toLowerCase().includes('deck') || format.toLowerCase().includes('pitch') || format.toLowerCase().includes('partner')) {
      usageContext = 'institutional sponsor deck presentation visual';
    }

    return `Create a refined editorial visual for ${channel} ${format}. Show ${mainSubject} in ${sceneEnvironment}. Use ${compositionStyle}. The mood should feel ${moodSetting}. Use a restrained palette of ${colorPalette}. Include ${keyElements}. The image should feel editorial, clean, high-contrast, prestigious, and minimalist. Avoid ${whatToAvoid}. No cliché climate imagery, no protest signs, no disaster scenes, no generic green leaves, no overdramatic apocalypse imagery. Suitable for ${usageContext}.`;
  };

  const formatVisualDirectionForDisplay = (
    visualDirStr?: string,
    channel?: string,
    format?: string,
    text?: string
  ): string => {
    if (!visualDirStr) return 'No visual direction saved.';

    let data: Record<string, string> = {};

    try {
      if (visualDirStr.trim().startsWith('{')) {
        data = JSON.parse(visualDirStr);
      }
    } catch (e) {
      // Not JSON
    }

    if (Object.keys(data).length === 0) {
      const lines = visualDirStr.split('\n');
      lines.forEach(line => {
        const match = line.match(/^(?:-\s+)?(?:\*\*)?([a-zA-Z\s/]+)(?:\*\*)?:\s*(.*)$/);
        if (match) {
          const rawKey = match[1].trim();
          const val = match[2].trim();
          let canonicalKey = rawKey;
          if (rawKey.toLowerCase().includes('concept')) canonicalKey = 'visualConcept';
          else if (rawKey.toLowerCase().includes('recommendation')) canonicalKey = 'formatRecommendation';
          else if (rawKey.toLowerCase().includes('mood')) canonicalKey = 'mood';
          else if (rawKey.toLowerCase().includes('composition')) canonicalKey = 'composition';
          else if (rawKey.toLowerCase().includes('color')) canonicalKey = 'colorMaterial';
          else if (rawKey.toLowerCase().includes('typography') || rawKey.toLowerCase().includes('layout')) canonicalKey = 'typographyLayout';
          else if (rawKey.toLowerCase().includes('element')) canonicalKey = 'keyElements';
          else if (rawKey.toLowerCase().includes('avoid')) canonicalKey = 'whatToAvoid';
          else if (rawKey.toLowerCase().includes('prompt') && !rawKey.toLowerCase().includes('negative')) canonicalKey = 'aiImagePrompt';
          else if (rawKey.toLowerCase().includes('negative')) canonicalKey = 'negativePrompt';
          else if (rawKey.toLowerCase().includes('note')) canonicalKey = 'designerNotes';

          if (val) {
            data[canonicalKey] = val;
          }
        }
      });
    }

    if (Object.keys(data).length === 0) {
      return visualDirStr;
    }

    const fields = [
      { key: 'visualConcept', label: 'Visual Concept' },
      { key: 'formatRecommendation', label: 'Format Recommendation' },
      { key: 'mood', label: 'Mood / Atmosphere' },
      { key: 'composition', label: 'Composition' },
      { key: 'colorMaterial', label: 'Color / Material Direction' },
      { key: 'typographyLayout', label: 'Typography / Layout' },
      { key: 'keyElements', label: 'Key Visual Elements' },
      { key: 'whatToAvoid', label: 'What to Avoid' },
      { key: 'aiImagePrompt', label: 'AI Image Prompt' },
      { key: 'negativePrompt', label: 'Negative Prompt' },
      { key: 'designerNotes', label: 'Designer Notes' }
    ];

    const resultLines: string[] = [];
    fields.forEach(field => {
      let val = data[field.key];
      
      if (field.key === 'aiImagePrompt') {
        const rawPrompt = val || data['prompt'] || '';
        val = buildElaboratedImagePrompt(
          { ...data, aiImagePrompt: rawPrompt },
          channel || '',
          format || '',
          text || ''
        );
      }

      if (field.key === 'negativePrompt' && !val) {
        val = 'No disaster imagery, no protest signs, no generic green leaves, no melting earth cliché, no stock-photo corporate handshake, no dystopian city, no exaggerated apocalypse imagery, no decorative climate icons, no unreadable text inside the image';
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
    let data: Record<string, string> = {};
    try {
      if (visualDirStr.trim().startsWith('{')) {
        data = JSON.parse(visualDirStr);
      }
    } catch (e) {}

    if (Object.keys(data).length === 0) {
      const lines = visualDirStr.split('\n');
      lines.forEach(line => {
        const match = line.match(/^(?:-\s+)?(?:\*\*)?([a-zA-Z\s/]+)(?:\*\*)?:\s*(.*)$/);
        if (match) {
          const rawKey = match[1].trim();
          const val = match[2].trim();
          if (rawKey.toLowerCase().includes('prompt') && !rawKey.toLowerCase().includes('negative')) {
            data['aiImagePrompt'] = val;
          } else {
            // Also grab other key fields if they exist in unstructured text to help build the prompt
            let canonicalKey = '';
            if (rawKey.toLowerCase().includes('concept')) canonicalKey = 'visualConcept';
            else if (rawKey.toLowerCase().includes('composition')) canonicalKey = 'composition';
            else if (rawKey.toLowerCase().includes('mood')) canonicalKey = 'mood';
            else if (rawKey.toLowerCase().includes('color')) canonicalKey = 'colorMaterial';
            else if (rawKey.toLowerCase().includes('element')) canonicalKey = 'keyElements';
            else if (rawKey.toLowerCase().includes('avoid')) canonicalKey = 'whatToAvoid';
            if (canonicalKey) data[canonicalKey] = val;
          }
        }
      });
    }

    const rawPrompt = data['aiImagePrompt'] || '';
    return buildElaboratedImagePrompt(
      { ...data, aiImagePrompt: rawPrompt },
      channel || '',
      format || 'Post',
      text || ''
    );
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
  // Hierarchy: brief → notes → sources → channel+format → COH Brain
  // COH Brain is a guardrail / fact boundary, NOT the content itself.
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
      type: 'Tone of Voice',
      status: 'Active',
      role: 'Task Source',
      supportsOperatingCoreSection: 'None',
      useFor: '',
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
        type: 'Text',
        status: 'Active',
        role: 'Task Source',
        supportsOperatingCoreSection: 'None',
        useFor: 'Pasted workspace source',
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
        type: 'Text',
        status: 'Active',
        role: 'Task Source',
        supportsOperatingCoreSection: 'None',
        useFor: 'Uploaded workspace file',
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
        type: 'Text',
        status: 'Active',
        role: 'Task Source',
        supportsOperatingCoreSection: 'None',
        useFor: 'URL context source',
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
          operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { 
            workspace: isSimple ? 'Simple Mode' : isQuick ? 'Quick Create' : 'Advanced Brief', 
            channel, 
            audience, 
            format 
          })
        };

        const result = await aiService.generate(canonicalInput);

        // Normalize AI JSON response into draftOptions
        const draftA = result.drafts?.[0];
        const draftB = result.drafts?.[1];
        const rawA = draftA?.copy || '';
        const rawB = draftB?.copy || rawA;
        const shorter = result.shorterVersion || rawA.split('. ').slice(0, 2).join('. ') + '.';

        const visualBrief = result.visualDesignBrief
          ? Object.entries(result.visualDesignBrief).map(([k, v]) => `${k}: ${v}`).join('\n')
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
    setCreationMode('advanced');
    setAdvancedBrief(prev => ({
      ...prev,
      topic: '',
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
    setStartedFromNote(`Template: ${temp.name}`);
  };

  // --- Apply Example Chip Pre-fills ---
  const applyExampleChip = (chipId: string) => {
    setCreationMode('advanced');
    switch (chipId) {
      case 'tetralogy':
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'Announce the Climate Tetralogy',
          pillar: 'Climate Tetralogy & Canon',
          mustInclude: 'Four operas. Four worlds. One planet.',
          audience: 'General Public'
        }));
        break;
      case 'cultural-ip':
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'Explain the Cultural IP and Content Model',
          pillar: 'Documentary, Media & Cultural IP',
          mustInclude: 'live opera as origin asset, licensing, filmed content',
          audience: 'Sponsors & Patrons'
        }));
        break;
      case 'event-notes':
        setAdvancedBrief(prev => ({
          ...prev,
          topic: 'Soria Moria: Nordic Air and Somatic Staging',
          pillar: 'Opera Worlds & Artistic Method',
          mustInclude: 'Soria Moria, climate as lived condition',
          audience: 'Cultural Audience'
        }));
        break;
      case 'instagram-img':
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
    setStartedFromNote(`Pre-fill: ${chipId}`);
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
      alert(`Updated existing item in Content Library as:\n${uniqueName}`);
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
    alert(`Saved to Content Library as:\n${uniqueName}`);
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
    const channel = isExternal ? externalContentChannel : (isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel));
    const format = isExternal ? externalContentFormat : (isSimple ? '' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat));
    const lang = isExternal ? externalContentLanguage : (isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language));
    const audience = isExternal ? 'External' : (isSimple ? 'General Public' : (isQuick ? 'General Public' : advancedBrief.audience));
    const purpose = isExternal ? externalContentContext : (isSimple ? 'General / Open' : (isQuick ? 'General / Open' : advancedBrief.purpose));
    const goal = isExternal ? externalContentContext : (isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic));

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
      alert(`Updated existing item "${title}" in Content Library as:\n${uniqueName}`);
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
    alert(`Saved to Content Library as:\n${uniqueName}`);
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
  const applyRevision = async (action: string) => {
    if (activeRevisionAction) return; // Prevent duplicate clicks
    setActiveRevisionAction(action);
    setRevisionSuccessAction(null);
    setActiveRevisionError(null);

    let revised = activeDraftText;
    let actionLabel = action;

    try {
      // Local deterministic cleanup action
      if (action === 'clean-ai-punctuation') {
        actionLabel = 'Clean AI-Style Characters';
        revised = cleanWritingArtifacts(revised);
        setCleanPunctuationNote('Cleaned punctuation and hidden characters. Meaning preserved.');
        setTimeout(() => setCleanPunctuationNote(''), 4000);
        
        const newVersion = activeDraftVersion + 1;
        setActiveDraftText(revised);
        setActiveDraftVersion(newVersion);
        setActiveDraftHistory(prev => [...prev, {
          version: newVersion,
          text: revised,
          timestamp: new Date().toLocaleTimeString(),
          actionUsed: actionLabel
        }]);
        setRevisionSuccessAction(action);
        setTimeout(() => setRevisionSuccessAction(null), 2000);
        setActiveRevisionAction(null);
        return;
      }

      if (generationMode === 'ai' && aiStatus === 'connected') {
        const isSimple = creationMode === 'simple';
        const isQuick = creationMode === 'quick';
        const goal = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);
        const notes = isSimple ? '' : (isQuick ? quickBrief.notes : '');
        const channel = isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel);
        const format = isSimple ? '' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat);
        const lang = isSimple ? 'English' : (isQuick ? quickBrief.language : advancedBrief.language);
        const audience = isSimple ? 'General Public' : (isQuick ? 'General Public' : advancedBrief.audience);
        const purpose = isSimple ? 'General / Open' : (isQuick ? 'General / Open' : advancedBrief.purpose);
        const toneLevel = isSimple ? '3' : (isQuick ? '3' : String(advancedBrief.toneIntensity));

        const result = await aiService.revise({
          previousDraft: activeDraftText,
          rawInput: goal || notes,
          channel,
          outputFormat: format,
          audience,
          purpose,
          language: lang,
          tone: toneLevel,
          selectedRevisionAction: action,
          revisionInstruction: action === 'custom-instruction' ? customRevisionInstruction : '',
          operatingCoreInstructions: compileOperatingCoreContext(operatingCore, { workspace: 'Revision Studio', action })
        });

        revised = result.revisedCopy || revised;
        actionLabel = action === 'custom-instruction' ? `Custom: ${customRevisionInstruction || 'Rewrite'}` : action;
        if (action === 'custom-instruction') {
          setCustomRevisionInstruction('');
        }
      } else {
        // Prototype Fallback Actions
        await new Promise(resolve => setTimeout(resolve, 800));
        switch (action) {
          case 'coh-specific':
            actionLabel = 'Make more COH-specific';
            revised = `Climate Opera Haus builds a durable repertoire-based climate canon. By treating climate as a lived condition rather than a campaign theme, our live opera productions serve as origin assets that scale into filmed media and global licensing.\n\n${revised}`;
            break;
          case 'sharper':
            actionLabel = 'Make sharper';
            revised = revised
              .replace(/\b(basically|essentially|simply|just|actually|very|extremely|really|virtually)\b/gi, '')
              .replace(/\bis able to\b/gi, 'can')
              .replace(/\bis designed to\b/gi, 'aims to')
              .replace(/\bwe are developing\b/gi, 'we develop')
              .replace(/\bwe are building\b/gi, 'we build')
              .replace(/\s+/g, ' ')
              .trim();
            break;
          case 'human':
            actionLabel = 'Make more human';
            revised = `We believe that climate change isn't just something to read about in news briefs—it's a reality we experience every day. That's why we compose and stage these musical worlds. We invite you to join our community and explore these planetary stories with us.\n\n${revised
              .replace(/secure strategic value/gi, 'connect with us')
              .replace(/monetization parameters/gi, 'creative reach')
              .replace(/institutional adoption/gi, 'theatres sharing our work')}`;
            break;
          case 'institutional':
            actionLabel = 'Make more institutional';
            revised = `Climate Opera Haus operates as a structured cultural infrastructure venture. We formalize environmental indices into durable staged assets to deliver reliable partnership alignment and permanent IP durability.\n\n${revised
              .replace(/shared stories/gi, 'institutional framework')
              .replace(/feel/gi, 'evaluate')
              .replace(/cool/gi, 'prestigious')}`;
            break;
          case 'less-poetic':
            actionLabel = 'Make less poetic';
            revised = revised
              .replace(/visceral soundscapes/gi, 'staged compositions')
              .replace(/somatic staging/gi, 'production design')
              .replace(/planetary thresholds/gi, 'environmental conditions')
              .replace(/compositional wind and tides/gi, 'musical themes');
            break;
          case 'less-corporate':
            actionLabel = 'Make less corporate';
            revised = revised
              .replace(/\b(monetize|monetization|leverage|KPIs|deliverables|value-add|IP durability)\b/gi, 'extend')
              .replace(/cultural-IP framework/gi, 'artistic cycle')
              .replace(/origin assets/gi, 'creative works');
            break;
          case 'less-ngo':
            actionLabel = 'Make less NGO-like';
            revised = revised
              .replace(/\b(awareness|advocacy|save the planet|fight climate change|climate action)\b/gi, 'durability')
              .replace(/campaign theme/gi, 'lived condition')
              .replace(/environmental threshold/gi, 'geographical indicator');
            break;
          case 'shorter':
            actionLabel = 'Make shorter (compressed 30%)';
            const sentences = revised.split('. ').filter(s => s.trim().length > 0);
            revised = sentences.slice(0, Math.ceil(sentences.length * 0.65)).join('. ');
            if (revised && !revised.endsWith('.')) revised += '.';
            break;
          case 'openings':
            actionLabel = 'Create 3 alternative openings';
            revised = `[ALTERNATIVE OPENINGS]\n1. "How do we build cultural infrastructure that outlasts fleeting news cycles?"\n2. "Climate Opera Haus translates planetary data into live stage productions."\n3. "At the intersection of composition and climate science lies the repeatable canon."\n\n---\n\n${revised}`;
            break;
          case 'ctas':
            actionLabel = 'Create 3 CTA options';
            revised = revised + '\n\n[SUGGESTED CALLS TO ACTION]\n- Partner: Contact our development team to discuss prestige sponsorship packages.\n- License: Inquire about staging rights and filmed asset distribution options.\n- Follow: Subscribe to the COH circular for operational and repertoire updates.';
            break;
          case 'remove-unsupported':
            actionLabel = 'Remove unsupported claims';
            const warnings = getFictionalContentWarnings(revised);
            warnings.forEach(w => {
              const match = w.match(/"([^"]+)"/);
              if (match) {
                const term = match[1];
                revised = revised.replace(new RegExp(`\\b${term}\\b`, 'gi'), '[REMOVED]');
              }
            });
            revised = revised.replace(/\[REMOVED\]/g, '').replace(/\s{2,}/g, ' ').trim();
            break;
          case 'sponsor-facing':
            actionLabel = 'Make more sponsor-facing';
            revised = `Sponsorship Alignment Value:\nClimate Opera Haus guarantees high-prestige patron association, intellectual property durability, and long-term brand equity. By backing our live productions, corporate partners gain access to filmed licensing, documentaries, and direct branding rights.\n\n${revised}`;
            break;
          case 'audience-friendly':
            actionLabel = 'Make more audience-friendly';
            revised = revised
              .replace(/repertoire-based climate canon/gi, 'collection of environmental operas')
              .replace(/somatic stage indicators/gi, 'live physical effects')
              .replace(/origin asset licensing/gi, 'sharing the performances globally');
            break;
          case 'channel-ready':
            actionLabel = 'Make more channel-ready';
            revised = `[Formatted for Distribution]\n\n${revised}\n\nTags: #ClimateOperaHaus #EcoOpera #SustainableArt #OperaCanon`;
            break;
          case 'stronger-proof':
            actionLabel = 'Expand with stronger proof';
            revised = `${revised}\n\nProven Repertoire Infrastructure: The Climate Tetralogy spans four distinct operas: Soria Moria (representing Air), The Golden Fountain (Fire), The Water Dragon (Water), and Roar to the Wind (Earth). Each libretto anchors its artistic score in verified geographical indices, providing unparalleled credibility.`;
            break;
          case 'custom-instruction':
            actionLabel = `Custom: ${customRevisionInstruction || 'Rewrite'}`;
            revised = `[Revised based on: "${customRevisionInstruction}"]\n\n${revised}\n\n(Adjusted alignment and framing to adhere to your instruction.)`;
            setCustomRevisionInstruction('');
            break;
        }
      }

      const newVersion = activeDraftVersion + 1;
      setActiveDraftText(revised);
      setActiveDraftVersion(newVersion);
      setActiveDraftHistory(prev => [...prev, {
        version: newVersion,
        text: revised,
        timestamp: new Date().toLocaleTimeString(),
        actionUsed: actionLabel
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

  // --- Prompt Builder Compiler ---
  const compileStructuredPrompt = () => {
    const isSimple = creationMode === 'simple';
    const isQuick = creationMode === 'quick';

    const creationScope = isSimple ? 'Single Channel' : (isQuick ? (quickBrief.creationScope || 'Single Channel') : (advancedBrief.creationScope || 'Single Channel'));
    const targetChannels = isSimple ? [simpleBrief.channel] : (isQuick ? (quickBrief.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website']) : (advancedBrief.targetChannels || ['LinkedIn', 'Instagram', 'Newsletter', 'Website']));
    const channel = isSimple ? simpleBrief.channel : (isQuick ? quickBrief.channel : advancedBrief.channel);
    const format = isSimple ? '' : (isQuick ? quickBrief.outputFormat : advancedBrief.outputFormat);
    const topic = isSimple ? simpleBrief.goal : (isQuick ? quickBrief.goal : advancedBrief.topic);
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

    let sourceContext = '';
    if (creationMode === 'advanced' && advancedBrief.selectedSourceIds.length > 0) {
      const selectedSources = [...sources, ...workspaceLocalSources].filter(s =>
        advancedBrief.selectedSourceIds.includes(s.id)
      );
      if (selectedSources.length > 0) {
        sourceContext += '\n\n' + Array.from(new Set(selectedSources.map(s => s.type))).map(t =>
          `[Includes type: ${t}]`
        ).join(' ');
        selectedSources.forEach(s => {
          sourceContext += `\n\n--- Source: ${s.title} ---\n${s.content}`;
        });
      }
    }

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

    return `You are the COH Content Marketing Mastermind for Climate Opera Haus.

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

Stay anchored to the user’s specific brief. Use COH Brain only as guidance and fact boundary. Do not replace the user’s request with generic COH positioning.

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
      return item.title.toLowerCase().includes(q) || item.text.toLowerCase().includes(q) || item.channel.toLowerCase().includes(q);
    }
    return true;
  });

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coh-cream font-sans text-coh-navy">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-coh-gold border-t-coh-navy rounded-full animate-spin mx-auto" />
          <p className="font-serif text-sm italic text-coh-navy/60">Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-coh-cream font-sans text-coh-navy antialiased">
        <div className="w-full max-w-md bg-white border border-coh-gold/30 p-8 rounded-lg shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <span className="font-serif tracking-widest text-[10px] uppercase text-coh-gold block">Climate Opera Haus</span>
            <h1 className="font-serif text-2xl font-semibold text-coh-navy">COH Content Studio</h1>
            <p className="text-xs text-coh-navy/55 uppercase font-mono tracking-wider">Private access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase font-semibold text-coh-navy/60 mb-1" htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={authUsernameInput}
                onChange={(e) => setAuthUsernameInput(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy text-sm font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase font-semibold text-coh-navy/60 mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={authPasswordInput}
                onChange={(e) => setAuthPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy text-sm font-sans"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200/50 p-3 rounded font-sans">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-3 rounded font-serif text-xs font-semibold tracking-wider uppercase transition border border-coh-gold/20 disabled:opacity-50"
            >
              {authLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-coh-cream font-sans text-coh-navy antialiased">
      
      {/* --- Sidebar Navigation (REORDERED) --- */}
      <aside className="w-85 border-r border-coh-gold/30 bg-coh-navy text-coh-cream flex flex-col justify-between p-8 shrink-0">
        <div>
          <div className="mb-10">
            <span className="font-serif tracking-widest text-xs uppercase text-coh-gold block mb-2">Climate Opera Haus</span>
            <h1 className="font-serif text-2xl font-normal leading-tight tracking-tight border-b border-coh-gold/20 pb-4 text-coh-cream">
              Content Studio
            </h1>
          </div>

          <nav className="space-y-1">
            <div className="pb-2 px-4 text-[10px] font-bold tracking-wider text-coh-gold/40 uppercase">
              Overview
            </div>
            <button
              onClick={() => setActiveTab('command-center')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'command-center'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <LayoutDashboard size={16} />
              Command Center
            </button>

            <div className="pt-6 pb-2 px-4 text-[10px] font-bold tracking-wider text-coh-gold/40 uppercase">
              Workspaces
            </div>
            <button
              onClick={() => setActiveTab('ideation-workspace')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'ideation-workspace'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <Lightbulb size={16} />
              Ideation Workspace
            </button>
            <button
              onClick={() => setActiveTab('content-workspace')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'content-workspace'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <Cpu size={16} />
              Content Workspace
            </button>
            <button
              onClick={() => setActiveTab('visual-studio')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'visual-studio'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center border border-current rounded-sm">
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>
              Visual Studio
            </button>
            <button
              onClick={() => setActiveTab('revision-studio')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded relative ${
                activeTab === 'revision-studio'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <Sliders size={16} />
              Revision Studio
              {activeDraftText && (
                <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-coh-gold" />
              )}
            </button>

            <div className="pt-6 pb-2 px-4 text-[10px] font-bold tracking-wider text-coh-gold/40 uppercase">
              Libraries
            </div>
            <button
              onClick={() => setActiveTab('idea-library')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'idea-library'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <FolderHeart size={16} />
              Idea Library
            </button>
            <button
              onClick={() => setActiveTab('content-library')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'content-library'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <Bookmark size={16} />
              Content Library
            </button>
            <button
              onClick={() => setActiveTab('knowledge-library')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'knowledge-library'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <FileText size={16} />
              Knowledge Library
            </button>

            <div className="pt-6 pb-2 px-4 text-[10px] font-bold tracking-wider text-coh-gold/40 uppercase">
              Configuration
            </div>
            <button
              onClick={() => setActiveTab('operating-core')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'operating-core'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <CpuIcon size={16} />
              Operating Core
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'settings'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>
          </nav>
        </div>

      </aside>

      {/* --- Main Workspace Canvas --- */}
      <main className="flex-1 overflow-y-auto px-12 py-10">
        
        {/* --- TAB 1: COMMAND CENTER --- */}
        
        {activeTab === 'operating-core' && (
          <div className="h-full overflow-hidden bg-[#faf9f6]">
            <OperatingCoreAdmin 
              core={operatingCore} 
              knowledgeSources={[...workspaceLocalSources, ...sources]}
              onSave={(newCore) => {
                setOperatingCore(newCore);
                localStorage.setItem('coh_operating_core_v1', JSON.stringify(newCore));
              }}
              onReset={() => {
                const defaultCore = createDefaultOperatingCore();
                setOperatingCore(defaultCore);
                localStorage.setItem('coh_operating_core_v1', JSON.stringify(defaultCore));
              }}
            />
          </div>
        )}
        {activeTab === 'command-center' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy mb-1">Command Center</h2>
              <p className="text-sm text-coh-navy/60 font-sans">
                Choose what to create, continue your latest work, or check what needs attention.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Left Column: Main Commands & Continue */}
              <div className="flex-1 space-y-8">
                
                {/* Section 1: What are you working on today? */}
                <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm">
                  <h3 className="font-serif text-xl text-coh-navy mb-1">What are you working on today?</h3>
                  <p className="text-xs text-coh-navy/60 mb-6">Start with a message, idea, source, campaign note, or visual direction.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* A. Write Content */}
                    <div className="p-4 bg-coh-navy text-coh-cream rounded border border-coh-gold/20 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-gold tracking-wider font-bold mb-1">Write Content</h4>
                        <p className="text-xs text-coh-cream/70 leading-relaxed font-sans mb-4">Draft a post, article, update, email, or campaign message.</p>
                      </div>
                      <button
                        onClick={() => {
                          setCreationMode('quick');
                          setQuickBrief({ goal: '', channel: 'LinkedIn', notes: '', mustInclude: '', mustAvoid: '', language: 'English', outputFormat: 'Post' });
                          setStartedFromNote('Action: Write Content');
                          setActiveTab('content-workspace');
                        }}
                        className="bg-coh-gold hover:bg-coh-gold/90 text-coh-navy text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1"
                      >
                        Start Writing <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* B. Explore Ideas */}
                    <div className="p-4 bg-coh-gold text-coh-navy rounded border border-coh-gold/25 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-navy tracking-wider font-bold mb-1">Explore Ideas</h4>
                        <p className="text-xs text-coh-navy/80 leading-relaxed font-sans mb-4">Generate angles, hooks, and content directions before drafting.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('ideation-workspace')}
                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1 border border-coh-gold/20"
                      >
                        Explore Ideas <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* C. Use a Source */}
                    <div className="p-4 bg-white text-coh-navy rounded border border-coh-gold/25 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-gold tracking-wider font-bold mb-1">Use a Source</h4>
                        <p className="text-xs text-coh-navy/60 leading-relaxed font-sans mb-4">Turn a document, pasted text, notes, or URL into content.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('knowledge-library')}
                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1"
                      >
                        Add Source <ArrowRight size={12} />
                      </button>
                    </div>

                    {/* D. Create Visuals */}
                    <div className="p-4 bg-white text-coh-navy rounded border border-coh-gold/25 flex flex-col justify-between shadow-sm">
                      <div>
                        <h4 className="font-serif text-sm uppercase text-coh-gold tracking-wider font-bold mb-1">Create Visuals</h4>
                        <p className="text-xs text-coh-navy/60 leading-relaxed font-sans mb-4">Generate images from visual directions or custom prompts.</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('visual-studio')}
                        className="bg-coh-navy hover:bg-coh-navy-light text-coh-gold text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1"
                      >
                        Open Visual Studio <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 2: Continue where you left off */}
                <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm">
                  <h3 className="font-serif text-xl text-coh-navy mb-4">Continue where you left off</h3>
                  
                  {(() => {
                    const unapprovedDraft = savedContent.find(c => c.status !== 'Approved');
                    const approvedItem = savedContent.find(c => c.status === 'Approved');
                    const promisingIdea = savedIdeas.find(i => i.status === 'Promising');
                    const recentSource = sources.length > 0 ? sources[0] : null;

                    if (unapprovedDraft) {
                      return (
                        <div className="bg-coh-cream/15 p-5 rounded border border-coh-gold/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-coh-gold">Draft in Progress</span>
                            <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase border border-amber-200">Needs Review</span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy mb-1">{unapprovedDraft.title}</h4>
                          <p className="text-xs text-coh-navy/60 line-clamp-2 leading-relaxed mb-4">{unapprovedDraft.text}</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setActiveDraftText(unapprovedDraft.text);
                                setActiveDraftTitle(unapprovedDraft.title);
                                setActiveDraftVersion(unapprovedDraft.version);
                                setActiveDraftHistory([{
                                  version: unapprovedDraft.version,
                                  text: unapprovedDraft.text,
                                  timestamp: unapprovedDraft.lastEdited,
                                  actionUsed: 'Resume recent draft'
                                }]);
                                setActiveDraftSource(unapprovedDraft.source === 'Content Workspace' ? 'Content Workspace' : (unapprovedDraft.source === 'External Content' ? 'External Content' : 'Content Library'));
                                setActiveTab('revision-studio');
                              }}
                              className="bg-coh-navy text-coh-cream hover:bg-coh-navy-light text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1"
                            >
                              Continue <ArrowRight size={12} />
                            </button>
                            <button onClick={() => setActiveTab('content-library')} className="text-xs font-semibold text-coh-navy/60 hover:text-coh-gold transition px-2">
                              View Library
                            </button>
                          </div>
                        </div>
                      );
                    } else if (approvedItem) {
                      return (
                        <div className="bg-coh-cream/15 p-5 rounded border border-coh-gold/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-coh-gold">Latest Approved Content</span>
                            <span className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase border border-green-200">Approved</span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy mb-1">{approvedItem.title}</h4>
                          <p className="text-xs text-coh-navy/60 line-clamp-2 leading-relaxed mb-4">{approvedItem.text}</p>
                          <div className="flex gap-2">
                            <button onClick={() => setActiveTab('content-library')} className="bg-coh-navy text-coh-cream hover:bg-coh-navy-light text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1">
                              View Library <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    } else if (promisingIdea) {
                      return (
                        <div className="bg-coh-cream/15 p-5 rounded border border-coh-gold/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-coh-gold">Promising Idea</span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy mb-1">{promisingIdea.title || promisingIdea.originalInput}</h4>
                          <div className="flex gap-2 mt-4">
                            <button onClick={() => setActiveTab('idea-library')} className="bg-coh-navy text-coh-cream hover:bg-coh-navy-light text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1">
                              Open Ideas <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    } else if (recentSource) {
                      return (
                        <div className="bg-coh-cream/15 p-5 rounded border border-coh-gold/20">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] uppercase tracking-wider font-bold text-coh-gold">Recent Source</span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy mb-1">{recentSource.title}</h4>
                          <p className="text-xs text-coh-navy/60 line-clamp-2 leading-relaxed mb-4">{recentSource.notes}</p>
                          <div className="flex gap-2">
                            <button onClick={() => setActiveTab('knowledge-library')} className="bg-coh-navy text-coh-cream hover:bg-coh-navy-light text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1">
                              Continue <ArrowRight size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="p-6 bg-coh-cream/20 border border-coh-gold/10 rounded text-center">
                          <span className="text-sm text-coh-navy/50 font-serif italic">Nothing in progress. Start something new above.</span>
                        </div>
                      );
                    }
                  })()}
                </div>

              </div>

              {/* Right Column: Status & Overview */}
              <div className="w-full lg:w-72 space-y-6">
                
                {/* Section 3: Needs your attention */}
                <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm">
                  <h3 className="font-serif text-lg text-coh-navy mb-4">Needs your attention</h3>
                  <div className="flex flex-col gap-3">
                    {aiStatus !== 'connected' && (
                      <div className="flex flex-col gap-2 p-3 bg-red-50/50 border border-red-200/50 rounded">
                        <span className="text-sm text-red-900 font-bold">AI generation is not connected.</span>
                        <button onClick={() => setActiveTab('settings')} className="text-[10px] uppercase font-bold text-red-800 hover:text-red-900 self-start">Open Settings →</button>
                      </div>
                    )}
                    
                    {savedContent.some(c => c.status !== 'Approved') && (
                      <div className="flex flex-col gap-2 p-3 bg-amber-50/50 border border-amber-200/50 rounded">
                        <span className="text-sm text-amber-900 font-bold">A draft may need review.</span>
                        <button onClick={() => setActiveTab('content-library')} className="text-[10px] uppercase font-bold text-amber-800 hover:text-amber-900 self-start">Review Draft →</button>
                      </div>
                    )}

                    {selectableSources.some(s => s.status === 'Needs Review') && (
                      <div className="flex flex-col gap-2 p-3 bg-amber-50/50 border border-amber-200/50 rounded">
                        <span className="text-sm text-amber-900 font-bold">A source needs checking.</span>
                        <button onClick={() => setActiveTab('knowledge-library')} className="text-[10px] uppercase font-bold text-amber-800 hover:text-amber-900 self-start">Open Sources →</button>
                      </div>
                    )}

                    {aiStatus === 'connected' && !savedContent.some(c => c.status !== 'Approved') && !selectableSources.some(s => s.status === 'Needs Review') && (
                      <p className="text-xs text-coh-navy/60 leading-relaxed">
                        Everything looks ready. You can start creating or continue your latest work.
                      </p>
                    )}
                  </div>
                </div>

                {/* Section 4: Studio Status */}
                <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm">
                  <h3 className="font-serif text-lg text-coh-navy mb-4">Studio Status</h3>
                  <div className="flex flex-col gap-2 text-xs font-mono font-bold tracking-wider">
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">AI Text</span>
                      <span className={aiStatus === 'connected' ? 'text-green-700' : 'text-amber-600'}>
                        {aiStatus === 'connected' ? 'Connected' : 'Needs Setup'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">Images</span>
                      <span className={aiStatus === 'connected' && aiImageModel ? 'text-green-700' : 'text-amber-600'}>
                        {aiStatus === 'connected' && aiImageModel ? 'Connected' : 'Needs Setup'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">Content Rules</span>
                      <span className={operatingCore.active ? 'text-green-700' : 'text-red-700'}>
                        {operatingCore.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 5: Studio Overview */}
                <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm">
                  <h3 className="font-serif text-lg text-coh-navy mb-4">Studio Overview</h3>
                  <div className="flex flex-col gap-2 text-xs font-mono font-bold tracking-wider">
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">Content Items</span>
                      <span className="text-coh-navy">{savedContent.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">Approved</span>
                      <span className="text-green-700">{savedContent.filter(c => c.status === 'Approved').length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">Ideas</span>
                      <span className="text-coh-navy">{savedIdeas.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-coh-gold/10">
                      <span className="text-coh-navy/50 uppercase">Sources</span>
                      <span className="text-coh-navy">{workspaceLocalSources.length + sources.length}</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-4">
                    <button onClick={() => setActiveTab('content-library')} className="text-[9px] uppercase font-bold text-coh-navy hover:text-coh-gold transition">Open Content →</button>
                    <button onClick={() => setActiveTab('knowledge-library')} className="text-[9px] uppercase font-bold text-coh-navy hover:text-coh-gold transition">Open Sources →</button>
                  </div>
                </div>

              </div>

            </div>

            {/* Collapsed Common Shortcuts */}
            <details className="group opacity-80 hover:opacity-100 transition-opacity bg-transparent text-sm mt-8 cursor-pointer max-w-4xl">
              <summary className="font-serif text-base text-coh-navy font-semibold flex items-center gap-2 outline-none">
                <span className="text-coh-gold group-open:rotate-90 transition-transform">▶</span>
                Common Shortcuts
              </summary>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-coh-gold/15">
                {[
                  { title: 'LinkedIn Post', action: 'Create Post', desc: 'Sober positioning card copy.', channel: 'LinkedIn', format: 'Post' },
                  { title: 'Instagram Caption', action: 'Create Caption', desc: 'Visceral scene rendering caption.', channel: 'Instagram', format: 'Caption' },
                  { title: 'Newsletter Section', action: 'Draft Section', desc: 'Campaign and canon updates.', channel: 'Newsletter', format: 'Newsletter Section' },
                  { title: 'Email / Letter', action: 'Draft Email', desc: 'Addressed partner message.', channel: 'Email / Direct Outreach', format: 'Email / Letter' }
                ].map(item => (
                  <div
                    key={item.title}
                    className="p-3 border border-coh-gold/10 bg-white hover:border-coh-gold/40 rounded text-left transition flex justify-between items-center"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerQuickLauncher(item.channel, item.format, 'Single Channel');
                    }}
                  >
                    <div>
                      <h4 className="font-serif font-bold text-coh-navy text-[11px]">{item.title}</h4>
                    </div>
                    <ArrowRight size={10} className="text-coh-gold shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* --- TAB: IDEATION WORKSPACE --- */}
        {activeTab === 'ideation-workspace' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy mb-2">Ideation Workspace</h2>
              <p className="text-sm text-coh-navy/60 font-sans">
                Explore creative angles, hooks, and campaign trajectories before writing. Turn ideas into actionable content briefs.
              </p>
            </div>

            <div className="grid grid-cols-12 gap-8 items-start">
              {/* Input Form Column */}
              <div className="col-span-4 bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 text-xs">
                <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">
                  New Exploration
                </h3>

                <div>
                  <label className="block text-coh-navy/70 font-semibold mb-0.5">What do you want to explore?</label>
                  <p className="text-[10px] text-coh-navy/55 mb-1.5">
                    Enter a keyword, phrase, question, paragraph, theme, campaign direction, audience need, or content problem.
                  </p>
                  <textarea
                    rows={4}
                    value={ideationInput}
                    onChange={(e) => setIdeationInput(e.target.value)}
                    className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-[11px]"
                    placeholder="e.g. Why is climate opera superior to other forms of climate art?"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="font-semibold text-coh-navy/80 border-b border-coh-gold/10 pb-1">Filters (Optional)</h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Target Channel</label>
                      <select
                        value={ideationFilterChannel}
                        onChange={(e) => setIdeationFilterChannel(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        {CHANNELS.slice(0, 7).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Language</label>
                      <select
                        value={ideationFilterLanguage}
                        onChange={(e) => setIdeationFilterLanguage(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        {LANGUAGES.map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Quality Filter</label>
                      <select
                        value={ideationFilterQuality}
                        onChange={(e) => setIdeationFilterQuality(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        <option value="Practical">Practical</option>
                        <option value="Bold">Bold</option>
                        <option value="Educational">Educational</option>
                        <option value="Emotional">Emotional</option>
                        <option value="Sponsor-facing">Sponsor-facing</option>
                        <option value="Public-facing">Public-facing</option>
                        <option value="Artistic">Artistic</option>
                        <option value="Institutional">Institutional</option>
                        <option value="Campaign-ready">Campaign-ready</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-coh-navy/60 mb-0.5">Depth Level</label>
                      <select
                        value={ideationFilterDepth}
                        onChange={(e) => setIdeationFilterDepth(e.target.value)}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                      >
                        <option value="Light">Light</option>
                        <option value="Standard">Standard</option>
                        <option value="Deep">Deep</option>
                        <option value="Experimental">Experimental</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-coh-navy/60 mb-0.5">Target Audience</label>
                    <select
                      value={ideationFilterAudience}
                      onChange={(e) => setIdeationFilterAudience(e.target.value)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-1 rounded text-coh-navy text-[11px]"
                    >
                      <option value="General Public">General Public</option>
                      <option value="Sponsors & Patrons">Sponsors & Patrons</option>
                      <option value="Strategic Partners">Strategic Partners</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateIdeas}
                  disabled={isIdeating || !aiProvider}
                  className="bg-coh-navy text-coh-gold font-medium px-4 py-3 rounded hover:bg-coh-navy/90 transition w-full disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                >
                  {isIdeating ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                  {isIdeating ? 'Generating...' : 'Generate'}
                </button>
              </div>

              <div className="col-span-8 space-y-6">
                {generatedIdeas.length > 0 ? (
                  <div className="space-y-6">
                    {/* Unique Categories derived from the list */}
                    {Array.from(new Set(generatedIdeas.map(i => i.category))).map(cat => (
                      <div key={cat} className="space-y-3">
                        <h3 className="font-serif text-base font-bold text-coh-gold border-b border-coh-gold/15 pb-1 capitalize">
                          {cat}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          {generatedIdeas.filter(idea => idea.category === cat).map(idea => (
                            <div key={idea.id} className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm flex flex-col justify-between gap-4">
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-serif font-bold text-coh-navy text-sm leading-snug">{idea.title}</h4>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                                    idea.status === 'Promising' ? 'bg-coh-gold/20 text-coh-navy' : 'bg-coh-cream text-coh-navy/60'
                                  }`}>
                                    {idea.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-coh-navy/70 leading-relaxed font-sans">{idea.explanation}</p>
                                <p className="text-[10px] text-coh-gold font-semibold leading-relaxed font-sans">Why it works: {idea.whyItWorks}</p>
                                
                                {idea.possibleHook && (
                                  <div className="bg-coh-cream/40 p-2 border border-coh-gold/10 rounded font-sans text-[10px] italic text-coh-navy/80">
                                    Hook idea: "{idea.possibleHook}"
                                  </div>
                                )}

                                {idea.possibleFirstPost && (
                                  <div className="bg-coh-cream/30 p-2 border border-coh-gold/10 rounded font-sans text-[10px] text-coh-navy/80">
                                    <span className="font-semibold block text-[9px] uppercase text-coh-navy/60 mb-0.5">First Post Idea:</span>
                                    "{idea.possibleFirstPost}"
                                  </div>
                                )}

                                {idea.riskToAvoid && (
                                  <p className="text-[10px] text-red-800/80 leading-relaxed font-sans">
                                    <span className="font-semibold">Risk to Avoid:</span> {idea.riskToAvoid}
                                  </p>
                                )}

                                <p className="text-[10px] text-coh-navy/60 leading-relaxed font-sans">
                                  <span className="font-semibold">Next Step:</span> {idea.possibleNextStep}
                                </p>

                                <div className="flex gap-1.5 flex-wrap items-center pt-1 text-[9px] font-mono text-coh-navy/50">
                                  <span className="bg-coh-cream px-1.5 rounded">{idea.suggestedChannel}</span>
                                  <span className="bg-coh-cream px-1.5 rounded">{idea.suggestedFormat}</span>
                                  {idea.suggestedAudience && <span className="bg-coh-cream px-1.5 rounded">Audience: {idea.suggestedAudience}</span>}
                                  {idea.suggestedTone && <span className="bg-coh-cream px-1.5 rounded">Tone: {idea.suggestedTone}</span>}
                                </div>
                              </div>

                              <div className="border-t border-coh-gold/10 pt-3 flex items-center justify-between gap-2 text-[10px] font-semibold">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'Promising')}
                                    className="text-coh-gold hover:underline"
                                  >
                                    Promising
                                  </button>
                                  <button
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'Not Useful')}
                                    className="text-red-800/70 hover:underline"
                                  >
                                    Not Useful
                                  </button>
                                </div>

                                <div className="flex gap-2 items-center">
                                  <button
                                    onClick={() => {
                                      setIsIdeating(true);
                                      setTimeout(() => {
                                        setIsIdeating(false);
                                        setGeneratedIdeas(prev => prev.map(p => p.id === idea.id ? { ...p, title: `Alternative: ${p.title}`, status: 'New' } : p));
                                      }, 500);
                                    }}
                                    className="text-coh-navy/70 hover:text-coh-gold hover:underline"
                                  >
                                    Variations
                                  </button>
                                  <button
                                    disabled={savingIdeaId === idea.id}
                                    onClick={() => handleSaveIdeaToLibrary(idea)}
                                    className="text-coh-navy hover:text-coh-gold hover:underline disabled:opacity-50"
                                  >
                                    {savingIdeaId === idea.id ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => handleCopyIdeaToWorkspace(idea)}
                                    className="bg-coh-navy text-coh-gold px-2 py-1 rounded"
                                  >
                                    Draft
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 border border-dashed border-coh-gold/20 rounded bg-white">
                    <p className="text-xs text-coh-navy/45 max-w-sm mx-auto font-sans">
                      No ideas generated yet. Enter a query in the panel on the left to explore creative angles.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: IDEA LIBRARY --- */}
        {activeTab === 'idea-library' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Idea Library</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">
                  Manage saved content angles, hooks, and campaign outlines. Keep track of what is ready to be written.
                </p>
              </div>
            </div>

            {/* List of saved ideas */}
            {savedIdeas.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {savedIdeas.map(idea => (
                  <div key={idea.id} className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <div>
                          <div className="flex gap-2 items-center flex-wrap mb-1">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-coh-gold bg-coh-navy px-1.5 py-0.5 rounded">
                              {idea.suggestedChannel}
                            </span>
                            <span className="text-[9px] font-mono text-coh-navy/50 uppercase font-semibold">
                              {idea.category}
                            </span>
                          </div>
                          <h4 className="font-serif text-base font-bold text-coh-navy leading-snug">{idea.title}</h4>
                        </div>

                        <select
                          value={idea.status}
                          onChange={(e) => handleUpdateIdeaStatus(idea.id, e.target.value as SavedIdea['status'])}
                          className={`text-[10px] font-bold p-1 rounded font-mono border border-coh-gold/20 ${
                            idea.status === 'Ready for Content' ? 'bg-blue-50 text-blue-800' :
                            idea.status === 'Promising' ? 'bg-coh-gold/15 text-coh-navy' :
                            idea.status === 'Used' ? 'bg-green-50 text-green-800' :
                            'bg-gray-50 text-gray-800'
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

                      <p className="text-xs text-coh-navy/80 whitespace-pre-wrap leading-relaxed bg-coh-cream/45 p-4 border border-coh-gold/10 rounded font-sans">
                        {idea.explanation}
                      </p>

                      <div className="text-[10px] text-coh-navy/55 space-y-1 font-sans">
                        <div><strong>Original Input:</strong> "{idea.originalInput}"</div>
                        <div><strong>Why it works:</strong> {idea.whyItWorks}</div>
                        <div><strong>Hook idea:</strong> "{idea.possibleHook}"</div>
                        {idea.possibleNextStep && <div><strong>Next action:</strong> {idea.possibleNextStep}</div>}
                      </div>
                    </div>

                    <div className="flex justify-between items-center border-t border-coh-gold/15 pt-4 text-[10px] text-coh-navy/40 font-mono">
                      <span>Saved: {idea.dateCreated}</span>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleSendToVisualStudio(idea, idea.explanation, 'Idea')}
                          className="bg-coh-cream text-coh-gold hover:text-coh-gold-dark border border-coh-gold/20 px-3 py-1.5 rounded font-serif font-bold text-[10px] flex items-center gap-1"
                        >
                          <Lightbulb size={10} /> Send Visual Direction to Visual Studio
                        </button>
                        <button
                          onClick={() => handleCopyIdeaToWorkspace(idea)}
                          className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light px-3 py-1.5 rounded font-serif font-bold text-[10px]"
                        >
                          Draft Content
                        </button>
                        <button
                          onClick={() => setSavedIdeas(prev => prev.filter(i => i.id !== idea.id))}
                          className="text-[11px] text-red-800/70 hover:text-red-800 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-coh-gold/20 rounded bg-white">
                <p className="text-xs text-coh-navy/55 max-w-sm mx-auto font-sans">No saved ideas in the Idea Library yet.</p>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: CONTENT WORKSPACE --- */}
        {activeTab === 'content-workspace' && (
          <div className="space-y-8 animate-fadeIn">
            

            {/* Title and Validation Warning block */}
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Content Workspace</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">
                  Draft, validate, and preview Climate Opera Haus campaigns. Choose a creation mode to begin.
                </p>
                {startedFromNote && (
                  <span className="inline-block mt-2 bg-coh-gold/15 text-coh-navy text-[10px] px-2 py-0.5 rounded font-mono font-semibold">
                    {startedFromNote}
                  </span>
                )}
                {importedIdeationContext && (
                  <div className="mt-4 bg-coh-cream border-l-2 border-coh-gold p-3 rounded text-xs flex justify-between items-start font-sans shadow-sm">
                    <div>
                      <strong className="text-coh-navy flex items-center gap-1 mb-1">
                        <Lightbulb size={12} /> Imported from Ideation Workspace
                      </strong>
                      <p className="text-coh-navy/80 mb-1 line-clamp-2">{importedIdeationContext.explanation}</p>
                      <span className="text-[10px] text-coh-navy/50 block">Original Input: "{importedIdeationContext.originalInput}"</span>
                    </div>
                    <button 
                      onClick={() => setImportedIdeationContext(null)}
                      className="text-coh-navy/40 hover:text-coh-navy ml-4 text-lg font-bold"
                      title="Clear imported context"
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>

              {/* Mode Toggle Button Group */}
              <div className="flex bg-coh-navy/5 p-1 rounded border border-coh-gold/15">
                <button
                  onClick={() => setCreationMode('simple')}
                  className={`px-4 py-2 text-xs font-semibold rounded transition ${
                    creationMode === 'simple'
                      ? 'bg-coh-navy text-coh-gold shadow-sm'
                      : 'text-coh-navy/60 hover:text-coh-navy'
                  }`}
                >
                  Simple Mode
                </button>
                <button
                  onClick={() => setCreationMode('quick')}
                  className={`px-4 py-2 text-xs font-semibold rounded transition ${
                    creationMode === 'quick'
                      ? 'bg-coh-navy text-coh-gold shadow-sm'
                      : 'text-coh-navy/60 hover:text-coh-navy'
                  }`}
                >
                  Quick Create
                </button>
                <button
                  onClick={() => setCreationMode('advanced')}
                  className={`px-4 py-2 text-xs font-semibold rounded transition ${
                    creationMode === 'advanced'
                      ? 'bg-coh-navy text-coh-gold shadow-sm'
                      : 'text-coh-navy/60 hover:text-coh-navy'
                  }`}
                >
                  Advanced Brief
                </button>
              </div>
            </div>

            {/* Validation warning block */}
            {validationWarning && (
              <div className="bg-red-50 border border-red-200 p-4 rounded text-xs text-red-800 font-semibold flex items-center gap-2 animate-pulse">
                <AlertTriangle size={15} />
                <span>{validationWarning}</span>
              </div>
            )}

            {/* Outdated generation alert banner */}
            {isBriefOutdated && (
              <div className="bg-amber-100 border border-amber-300 p-4 rounded text-xs text-coh-navy flex justify-between items-center">
                <span>Inputs changed. Regenerate to apply the latest brief.</span>
                <button
                  disabled={isGeneratingDrafts || aiIsGenerating}
                  onClick={handleGenerateDrafts}
                  className="bg-coh-navy text-coh-gold px-3 py-1.5 rounded text-[11px] font-bold shadow-md hover:bg-coh-navy-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingDrafts ? 'Generating...' : 'Generate Again'}
                </button>
              </div>
            )}

            {/* Honest Prototype Banner */}
            <div className="bg-amber-50/70 border border-coh-gold/30 p-4 rounded text-xs text-coh-navy flex justify-between items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-coh-gold shrink-0" />
                <span>Prototype mode: drafts are generated by local logic. For final-quality copy, use Prompt Builder or connect an AI model.</span>
              </div>
              <div className="flex gap-2">
                <span className="bg-coh-navy text-coh-gold text-[9px] px-1.5 py-0.5 rounded font-mono font-bold">
                  Rules Active
                </span>
              </div>
            </div>

            {/* Content Starters container */}
            <div className="bg-white border border-coh-gold/15 p-4 rounded shadow-sm space-y-3">
              <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShowContentStarters(!showContentStarters)}>
                <span className="font-semibold text-coh-navy/80 text-sm">Content Starters</span>
                <span className="text-xs text-coh-gold font-semibold bg-coh-cream px-2 py-1 rounded">
                  {showContentStarters ? 'Hide Content Starters' : 'Show Content Starters'}
                </span>
              </div>
              
              {showContentStarters && (
                <div className="space-y-4 pt-2 border-t border-coh-gold/10">
                  <div className="space-y-2">
                    <span className="font-medium block text-coh-navy/60 text-xs">Templates:</span>
                    <div className="flex gap-2 flex-wrap">
                      {CONTENT_TEMPLATES.map(temp => (
                        <button
                          key={temp.name}
                          onClick={() => applyTemplate(temp)}
                          className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1.5 px-3 rounded text-[11px] transition font-medium"
                          title={temp.desc}
                        >
                          {temp.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="font-medium block text-coh-navy/60 text-xs">Example Briefs:</span>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => applyExampleChip('tetralogy')}
                        className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1 px-2.5 rounded text-[10px] transition font-medium"
                      >
                        Announce Tetralogy
                      </button>
                      <button
                        onClick={() => applyExampleChip('cultural-ip')}
                        className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1 px-2.5 rounded text-[10px] transition font-medium"
                      >
                        Cultural IP & Model
                      </button>
                      <button
                        onClick={() => applyExampleChip('event-notes')}
                        className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1 px-2.5 rounded text-[10px] transition font-medium"
                      >
                        Nordic Air (Soria Moria)
                      </button>
                      <button
                        onClick={() => applyExampleChip('instagram-img')}
                        className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1 px-2.5 rounded text-[10px] transition font-medium"
                      >
                        Water Dragon Caption
                      </button>
                      <button
                        onClick={() => applyExampleChip('sponsor-facing')}
                        className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1 px-2.5 rounded text-[10px] transition font-medium"
                      >
                        Patron Pitch Paragraph
                      </button>
                      <button
                        onClick={() => applyExampleChip('newsletter-update')}
                        className="bg-coh-cream hover:bg-coh-gold/25 text-coh-navy border border-coh-gold/20 py-1 px-2.5 rounded text-[10px] transition font-medium"
                      >
                        Earth Canon Update
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Three Panel Layout */}
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* PANEL 1: BRIEF */}
              <div className="col-span-4 bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 text-xs">
                
                {creationMode === 'simple' ? (
                  <div className="space-y-4">
                    <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">
                      Simple Mode
                    </h3>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-0.5">What do you want to create?</label>
                      <p className="text-[10px] text-coh-navy/55 mb-1.5">Describe the message, topic, idea, announcement, question, or content you want to create.</p>
                      <textarea
                        rows={6}
                        value={simpleBrief.goal}
                        onChange={(e) => setSimpleBrief({ ...simpleBrief, goal: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                        placeholder="Draft a partner update about the new Climate Canon project..."
                      />
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Channel
                      </label>
                      <select
                        value={simpleBrief.channel}
                        onChange={(e) => setSimpleBrief({ ...simpleBrief, channel: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        {CHANNELS.map(ch => (
                          <option key={ch} value={ch}>{ch}</option>
                        ))}
                      </select>
                    </div>

                    <div className="bg-coh-navy/5 border border-coh-gold/20 p-3 rounded space-y-3">
                      <label className="block text-coh-navy/80 font-bold mb-1 text-[11px] uppercase tracking-wider">
                        Add Context (Optional)
                      </label>
                      <div className="flex gap-1.5 bg-coh-cream/40 p-1 rounded">
                        {(['paste', 'upload', 'link'] as const).map(mode => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setInlineSourceType(mode)}
                            className={`flex-1 text-[10px] font-bold py-1 rounded transition uppercase ${
                              inlineSourceType === mode ? 'bg-coh-navy text-coh-gold' : 'text-coh-navy/60 hover:bg-coh-cream'
                            }`}
                          >
                            {mode === 'link' ? 'URL Context' : mode}
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
                            className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                          />
                          <textarea
                            rows={3}
                            placeholder="Paste source text..."
                            value={inlinePasteData.content}
                            onChange={(e) => setInlinePasteData({ ...inlinePasteData, content: e.target.value })}
                            className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px] font-mono"
                          />
                          <div className="flex justify-between items-center text-[10px]">
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={inlinePasteData.saveToLibrary}
                                onChange={(e) => setInlinePasteData({ ...inlinePasteData, saveToLibrary: e.target.checked })}
                              />
                              Save to Knowledge Library
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddWorkspaceSource('paste')}
                              className="bg-coh-navy text-coh-gold px-2.5 py-1 rounded font-serif font-bold text-[10px]"
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
                            className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                          />
                          <input
                            type="text"
                            placeholder="URL Context Link (https://...)"
                            value={inlineLinkData.url}
                            onChange={(e) => setInlineLinkData({ ...inlineLinkData, url: e.target.value })}
                            className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                          />
                          <p className="text-[9px] text-coh-navy/40">Paste the relevant excerpt or summary so the system knows what to use. The app may not read the webpage automatically yet.</p>
                          <textarea
                            rows={2}
                            placeholder="Relevant excerpt or summary..."
                            value={inlineLinkData.summary}
                            onChange={(e) => setInlineLinkData({ ...inlineLinkData, summary: e.target.value })}
                            className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                          />
                          {linkWarning && (
                            <p className="text-[9px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 leading-normal font-semibold">
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
                              Save to Knowledge Library
                            </label>
                            <button
                              type="button"
                              onClick={handleAddWorkspaceLink}
                              className="bg-coh-navy text-coh-gold px-2.5 py-1 rounded font-serif font-bold text-[10px]"
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
                            className="w-full bg-coh-cream border border-coh-gold/10 hover:bg-coh-cream-dark p-2 rounded text-center text-[11px] font-semibold text-coh-navy"
                          >
                            Upload File
                          </button>
                          <p className="text-[9px] text-coh-navy/40 text-center">Supported: .txt files only. PDF parsing not currently supported.</p>
                          {inlineUploadData.title && (
                            <div className="text-[10px] text-coh-navy/60 italic truncate">
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
                              Save to Knowledge Library
                            </label>
                            <button
                              type="button"
                              onClick={() => handleAddWorkspaceSource('upload')}
                              disabled={!inlineUploadData.title}
                              className="bg-coh-navy text-coh-gold px-2.5 py-1 rounded font-serif font-bold text-[10px] disabled:opacity-50"
                            >
                              {inlineUploadData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-coh-cream/30 border border-coh-gold/20 p-3 rounded">
                      <p className="text-[10px] text-coh-navy/70 italic text-center">
                        The system will infer format, audience, tone, and purpose from your request.
                      </p>
                    </div>
                  </div>
                ) : creationMode === 'quick' ? (
                  <div className="space-y-4">
                    <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">
                      Start With Notes Brief
                    </h3>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-0.5">What do you want to create or explore?</label>
                      <p className="text-[10px] text-coh-navy/55 mb-1.5">Enter a question, idea, topic, phrase, paragraph, campaign angle, message, or rough thought.</p>
                      <textarea
                        rows={2}
                        value={quickBrief.goal}
                        onChange={(e) => setQuickBrief({ ...quickBrief, goal: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                        placeholder="Specify campaign goal or theme..."
                      />
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
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
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Single Channel">Single Channel</option>
                        <option value="Multi-Channel Pack">Multi-Channel Pack</option>
                      </select>
                    </div>

                    {quickBrief.creationScope === 'Multi-Channel Pack' ? (
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">Target Channels</label>
                        <div className="grid grid-cols-2 gap-2 bg-coh-cream/50 p-2.5 border border-coh-gold/25 rounded max-h-32 overflow-y-auto">
                          {CHANNELS.map(ch => {
                            const isChecked = quickBrief.targetChannels?.includes(ch);
                            return (
                              <label key={ch} className="flex items-center gap-2 text-xs text-coh-navy cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const list = quickBrief.targetChannels || [];
                                    const nextList = list.includes(ch) ? list.filter(item => item !== ch) : [...list, ch];
                                    setQuickBrief(prev => ({ ...prev, targetChannels: nextList }));
                                  }}
                                  className="rounded border-coh-gold text-coh-gold focus:ring-coh-gold"
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
                            <label className="text-coh-navy/70 font-semibold">
                              Channel <Tooltip text="Where this content will be used." />
                            </label>
                          </div>
                          <select
                            value={quickBrief.channel}
                            onChange={(e) => handleChannelChange(e.target.value, false)}
                            className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                          >
                            {CHANNELS.map(ch => (
                              <option key={ch} value={ch}>{ch}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-coh-navy/70 font-semibold mb-1">
                            Output Format <Tooltip text="What type of content you want to create." />
                          </label>
                          <select
                            value={quickBrief.outputFormat}
                            onChange={(e) => {
                              setQuickBrief({ ...quickBrief, outputFormat: e.target.value });
                              setFormatAdjustedNote('');
                            }}
                            className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                          >
                            {(CHANNEL_FORMATS[quickBrief.channel] || []).map(fmt => (
                              <option key={fmt} value={fmt}>{fmt}</option>
                            ))}
                          </select>
                        </div>
                        {formatAdjustedNote && (
                          <div className="col-span-2 text-[10px] text-coh-gold bg-coh-navy/5 p-2 rounded border border-coh-gold/20 animate-fadeIn mt-1 font-semibold">
                            {formatAdjustedNote}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">
                          Language <Tooltip text="The language of the final output. English is the default." />
                        </label>
                        <select
                          value={quickBrief.language}
                          onChange={(e) => setQuickBrief({ ...quickBrief, language: e.target.value })}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                        >
                          {LANGUAGES.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">Paste Notes or Source Material</label>
                      <textarea
                        rows={5}
                        value={quickBrief.notes}
                        onChange={(e) => setQuickBrief({ ...quickBrief, notes: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy font-mono text-[11px]"
                        placeholder="Paste notes, facts, article excerpts, image descriptions, or source material."
                      />
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Optional: Must Include <Tooltip text="Facts, phrases, names, or points that must appear in the output." />
                      </label>
                      <input
                        type="text"
                        value={quickBrief.mustInclude}
                        onChange={(e) => setQuickBrief({ ...quickBrief, mustInclude: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                        placeholder="Add phrases, facts, or points that must appear."
                      />
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Optional: Must Avoid <Tooltip text="Words, claims, tones, or topics the output should avoid." />
                      </label>
                      <input
                        type="text"
                        value={quickBrief.mustAvoid}
                        onChange={(e) => setQuickBrief({ ...quickBrief, mustAvoid: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                        placeholder="Add words, claims, or tones to avoid."
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">
                      Advanced Brief Fields
                    </h3>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-0.5">What should this content respond to or develop?</label>
                      <p className="text-[10px] text-coh-navy/55 mb-1.5">Use a question, argument, rough idea, campaign message, paragraph, comparison, or content direction.</p>
                      <textarea
                        rows={2}
                        value={advancedBrief.topic}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, topic: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                        placeholder="Announce the canon or specific post topic..."
                      />
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Creation Intent <Tooltip text="Tell the system what kind of thinking or structure is needed for this content." />
                      </label>
                      <select
                        value={advancedBrief.creationIntent || 'Infer automatically'}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, creationIntent: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
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
                      <label className="block text-coh-navy/70 font-semibold mb-1">
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
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
                      >
                        <option value="Single Channel">Single Channel</option>
                        <option value="Multi-Channel Pack">Multi-Channel Pack</option>
                      </select>
                    </div>

                    {advancedBrief.creationScope === 'Multi-Channel Pack' ? (
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">Target Channels</label>
                        <div className="grid grid-cols-2 gap-2 bg-coh-cream/50 p-2 border border-coh-gold/25 rounded max-h-32 overflow-y-auto font-sans">
                          {CHANNELS.map(ch => {
                            const isChecked = advancedBrief.targetChannels?.includes(ch);
                            return (
                              <label key={ch} className="flex items-center gap-2 text-xs text-coh-navy cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const list = advancedBrief.targetChannels || [];
                                    const nextList = list.includes(ch) ? list.filter(item => item !== ch) : [...list, ch];
                                    setAdvancedBrief(prev => ({ ...prev, targetChannels: nextList }));
                                  }}
                                  className="rounded border-coh-gold text-coh-gold focus:ring-coh-gold"
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
                          <label className="block text-coh-navy/70 font-semibold mb-1">
                            Channel <Tooltip text="Where this content will be used." />
                          </label>
                          <select
                            value={advancedBrief.channel}
                            onChange={(e) => handleChannelChange(e.target.value, true)}
                            className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
                          >
                            {CHANNELS.map(ch => (
                              <option key={ch} value={ch}>{ch}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-coh-navy/70 font-semibold mb-1">
                            Output Format <Tooltip text="What type of content you want to create." />
                          </label>
                          <select
                            value={advancedBrief.outputFormat}
                            onChange={(e) => {
                              setAdvancedBrief({ ...advancedBrief, outputFormat: e.target.value });
                              setFormatAdjustedNote('');
                            }}
                            className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
                          >
                            {(CHANNEL_FORMATS[advancedBrief.channel] || []).map(fmt => (
                              <option key={fmt} value={fmt}>{fmt}</option>
                            ))}
                          </select>
                        </div>
                        {formatAdjustedNote && (
                          <div className="col-span-2 text-[10px] text-coh-gold bg-coh-navy/5 p-2 rounded border border-coh-gold/20 animate-fadeIn mt-1 font-semibold">
                            {formatAdjustedNote}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">
                          Content Pillar <Tooltip text="The main COH topic area this content belongs to. It helps the system frame the content correctly." />
                        </label>
                        <select
                          value={advancedBrief.pillar}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, pillar: e.target.value })}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
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
                        <label className="block text-coh-navy/70 font-semibold mb-1">
                          Language <Tooltip text="The language of the final output. English is the default." />
                        </label>
                        <select
                          value={advancedBrief.language}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, language: e.target.value })}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
                        >
                          {LANGUAGES.map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Revamped Audience Selector */}
                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Audience <Tooltip text="Who this content is for. The audience changes the language, proof points, level of explanation, and call to action." />
                      </label>
                      <select
                        value={advancedBrief.audience}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, audience: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
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
                      <p className="text-[10px] text-coh-gold font-semibold mt-1">
                        Preview: {getAudienceExplanation(advancedBrief.audience)}
                      </p>
                    </div>

                    {advancedBrief.audience === 'Custom Audience' && (
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">Describe the audience</label>
                        <textarea
                          value={advancedBrief.customAudience}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, customAudience: e.target.value })}
                          className="w-full min-h-[80px] resize-y bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-xs"
                          placeholder="Example: Nordic cultural funders, climate-tech executives, opera patrons, or local community partners"
                        />
                        <p className="text-[9px] text-coh-navy/40 mt-1">Describe the group in plain language so the system can adapt tone, vocabulary, and CTA.</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">
                          Purpose <Tooltip text="Why you are creating this content. Example: credibility, sponsor interest, audience education, event follow-up." />
                        </label>
                        <select
                          value={advancedBrief.purpose}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, purpose: e.target.value })}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
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
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Framing Mode <Tooltip text="Choose whether the system suggests a framing approach, writes directly from the brief, or follows your custom framing." />
                      </label>
                      <select
                        value={advancedBrief.directionMode}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, directionMode: e.target.value as any })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
                      >
                        <option value="auto">Use Suggested Framing</option>
                        <option value="none">Create Directly From Brief</option>
                        <option value="custom">Use My Own Framing</option>
                      </select>
                    </div>

                    {advancedBrief.directionMode === 'custom' && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <label className="block text-coh-navy/70 font-semibold">Describe your framing</label>
                          <Tooltip text="Framing tells the system how to shape the message before writing. It is not the final copy." />
                        </div>
                        <textarea
                          rows={2}
                          value={advancedBrief.customDirection}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, customDirection: e.target.value })}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy text-xs"
                          placeholder="Example: Position this as a sponsor opportunity, not a public announcement."
                        />
                      </div>
                    )}

                    {advancedBrief.directionMode === 'auto' && (
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">Selected Framing</label>
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
                          className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
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
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Selected Sources <Tooltip text="Specific notes, links, files, or summaries used for this draft. COH Brain rules are always active separately." />
                      </label>
                      
                      <div className="border border-coh-gold/15 p-2.5 rounded bg-coh-cream/50 max-h-32 overflow-y-auto space-y-1.5 text-[11px] mb-3">
                        {[...selectableSources, ...workspaceLocalSources].map(src => {
                          const isSel = advancedBrief.selectedSourceIds.includes(src.id);
                          return (
                            <div key={src.id} className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isSel}
                                onChange={() => toggleSourceSelection(src.id)}
                                className="rounded border-coh-gold/50 text-coh-gold scale-75"
                              />
                              <span className="truncate">{src.title}</span>
                              {workspaceLocalSources.some(w => w.id === src.id) && (
                                <span className="text-[8px] bg-coh-gold/20 text-coh-navy px-1 rounded">Local</span>
                              )}
                            </div>
                          );
                        })}
                        {[...selectableSources, ...workspaceLocalSources].length === 0 && (
                          <span className="text-coh-navy/40 block text-center py-2">
                            No user sources selected. You can still draft from your notes, but source-backed content is stronger.
                          </span>
                        )}
                      </div>

                      {/* INLINE SOURCE ADD PANEL - Add URL Context */}
                      <div className="border border-coh-gold/20 p-3 rounded bg-white space-y-2">
                        <div className="flex gap-1.5 bg-coh-cream/40 p-1 rounded">
                          {(['paste', 'upload', 'link'] as const).map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setInlineSourceType(mode)}
                              className={`flex-1 text-[10px] font-bold py-1 rounded transition uppercase ${
                                inlineSourceType === mode ? 'bg-coh-navy text-coh-gold' : 'text-coh-navy/60 hover:bg-coh-cream'
                              }`}
                            >
                              {mode === 'link' ? 'URL Context' : mode}
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
                              className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                            />
                            <textarea
                              rows={3}
                              placeholder="Paste source text..."
                              value={inlinePasteData.content}
                              onChange={(e) => setInlinePasteData({ ...inlinePasteData, content: e.target.value })}
                              className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px] font-mono"
                            />
                            <div className="flex justify-between items-center text-[10px]">
                              <label className="flex items-center gap-1">
                                <input
                                  type="checkbox"
                                  checked={inlinePasteData.saveToLibrary}
                                  onChange={(e) => setInlinePasteData({ ...inlinePasteData, saveToLibrary: e.target.checked })}
                                />
                                Save to Knowledge Library
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddWorkspaceSource('paste')}
                                className="bg-coh-navy text-coh-gold px-2.5 py-1 rounded font-serif font-bold text-[10px]"
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
                              className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                            />
                            <input
                              type="text"
                              placeholder="URL Context Link (https://...)"
                              value={inlineLinkData.url}
                              onChange={(e) => setInlineLinkData({ ...inlineLinkData, url: e.target.value })}
                              className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                            />
                            <p className="text-[9px] text-coh-navy/40">Paste the relevant excerpt or summary so the system knows what to use. The app may not read the webpage automatically yet.</p>
                            
                            <textarea
                              rows={2}
                              placeholder="Relevant excerpt or summary..."
                              value={inlineLinkData.summary}
                              onChange={(e) => setInlineLinkData({ ...inlineLinkData, summary: e.target.value })}
                              className="w-full bg-coh-cream border border-coh-gold/10 p-1.5 rounded text-[11px]"
                            />
                            
                            {linkWarning && (
                              <p className="text-[9px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200 leading-normal font-semibold">
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
                                Save to Knowledge Library
                              </label>
                              <button
                                type="button"
                                onClick={handleAddWorkspaceLink}
                                className="bg-coh-navy text-coh-gold px-2.5 py-1 rounded font-serif font-bold text-[10px]"
                              >
                                Add URL Context
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
                              className="w-full bg-coh-cream border border-coh-gold/10 hover:bg-coh-cream-dark p-2 rounded text-center text-[11px] font-semibold text-coh-navy"
                            >
                              Upload File
                            </button>
                            <p className="text-[9px] text-coh-navy/40 text-center">Supported: .txt files only. PDF parsing not currently supported.</p>
                            {inlineUploadData.title && (
                              <div className="text-[10px] text-coh-navy/60 italic truncate">
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
                                Save to Knowledge Library
                              </label>
                              <button
                                type="button"
                                onClick={() => handleAddWorkspaceSource('upload')}
                                disabled={!inlineUploadData.title}
                                className="bg-coh-navy text-coh-gold px-2.5 py-1 rounded font-serif font-bold text-[10px] disabled:opacity-50"
                              >
                                {inlineUploadData.saveToLibrary ? 'Add to Context' : 'Use as Context'}
                              </button>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Must Include <Tooltip text="Facts, phrases, names, or points that must appear in the output." />
                      </label>
                      <input
                        type="text"
                        value={advancedBrief.mustInclude}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, mustInclude: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                        placeholder="Add phrases, facts, or points that must appear."
                      />
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">
                        Must Avoid <Tooltip text="Words, claims, tones, or topics the output should avoid." />
                      </label>
                      <input
                        type="text"
                        value={advancedBrief.mustAvoid}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, mustAvoid: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                        placeholder="Add words, claims, or tones to avoid."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-coh-navy/70 font-semibold mb-1">
                          Desired Length <Tooltip text="Controls the approximate size of the output. Longer formats are better for newsletters, articles, and partner notes." />
                        </label>
                        <select
                          value={advancedBrief.desiredLength}
                          onChange={(e) => setAdvancedBrief({ ...advancedBrief, desiredLength: e.target.value })}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
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
                          <label className="block text-coh-navy/70 font-semibold mb-1">Word Count Range</label>
                          <input
                            type="text"
                            value={advancedBrief.customLengthCount}
                            onChange={(e) => setAdvancedBrief({ ...advancedBrief, customLengthCount: e.target.value })}
                            className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy"
                            placeholder="Desired word count range"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-coh-navy/70 font-semibold">
                          Tone <Tooltip text="Controls the energy level of the writing, from calm and institutional to bold and punchy." />
                        </label>
                        <span className="font-bold text-[10px] text-coh-gold">{getToneName(advancedBrief.toneIntensity)}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={advancedBrief.toneIntensity}
                        onChange={(e) => setAdvancedBrief({ ...advancedBrief, toneIntensity: parseInt(e.target.value) })}
                        className="w-full text-coh-gold"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-4 pt-4 border-t border-coh-gold/15 mt-4">
                  <div className="flex items-center gap-1.5 text-coh-gold border-b border-coh-gold/15 pb-2">
                    <span className="font-serif text-base font-semibold">Operating Core Governance <Tooltip text="The unified central intelligence of the COH Content Studio. Drives identity, facts, audience, and formatting." /></span>
                  </div>
                  <p className="text-[10px] text-coh-navy/55 leading-relaxed italic">
                    The Operating Core ensures absolute brand alignment, claim discipline, and channel fit for every generation.
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-mono mb-2">
                    <span className={`px-2 py-1 rounded text-center font-bold ${operatingCore.corePassport.oneLineDefinition ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      Identity Locked
                    </span>
                    <span className={`px-2 py-1 rounded text-center font-bold ${operatingCore.claimsProofBoundaries.claims.length > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      Boundaries Active
                    </span>
                    <span className={`px-2 py-1 rounded text-center font-bold ${operatingCore.voiceAndLanguage.overallTone.length > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      Voice Calibrated
                    </span>
                    <span className={`px-2 py-1 rounded text-center font-bold bg-coh-gold/10 text-coh-navy`}>
                      Operating Core v1
                    </span>
                  </div>

                  {activeDraftText && (
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center border-b border-coh-gold/15 pb-2">
                        <span className="font-serif text-base font-semibold text-coh-navy font-bold">Real-time Compliance Audit</span>
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
                          <div key={idx} className="flex gap-2 items-start border-b border-coh-gold/10 pb-2 last:border-0 last:pb-0">
                            <span className={`p-0.5 rounded mt-0.5 ${chk.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {chk.pass ? <Check size={12} /> : <AlertTriangle size={12} />}
                            </span>
                            <div className="space-y-1">
                              <span className="font-semibold text-coh-navy flex items-center gap-1.5 text-[11px]">
                                {chk.name}
                              </span>
                              <p className="text-[10px] text-coh-navy/55">{chk.desc}</p>
                              {!chk.pass && (
                                <div className="text-[9px] bg-red-50 p-2 border border-red-100 rounded text-red-800 space-y-1">
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

                  <div className="border-t border-coh-gold/15 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] font-bold text-coh-gold uppercase">Prompt Builder Output</span>
                      <button
                        onClick={() => handleCopyClipboard(compileStructuredPrompt(), 'prompt')}
                        className="text-[10px] font-bold text-coh-navy hover:text-coh-gold transition"
                      >
                        {copySuccessMap['prompt'] ? 'Copied!' : 'Copy AI Prompt'}
                      </button>
                    </div>
                    <details className="text-[10px] text-coh-navy/40 cursor-pointer">
                      <summary className="hover:text-coh-gold transition">Inspect Compiled Prompt</summary>
                      <pre className="mt-2 p-3 bg-coh-cream/50 rounded border border-coh-gold/10 overflow-x-auto max-h-40 whitespace-pre-wrap font-mono text-[9px] select-all">
                        {compileStructuredPrompt()}
                      </pre>
                    </details>
                  </div>
                </div>

                <div className="pt-2 border-t border-coh-gold/10 mt-4">
                  <button
                    onClick={handleGenerateDrafts}
                    disabled={isGeneratingDrafts}
                    className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-3 rounded font-serif text-xs font-semibold transition border border-coh-gold/20 flex items-center justify-center gap-2"
                  >
                    {isGeneratingDrafts ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                    {isGeneratingDrafts ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>

              {/* PANEL 2: GENERATION RESULTS */}
              <div className="col-span-8 bg-white border border-coh-gold/20 p-6 rounded shadow-sm space-y-6">
                
                <div className="border-b border-coh-gold/15 pb-2 flex justify-between items-center">
                  <h3 className="font-serif text-lg font-semibold text-coh-navy">
                    Generation Results
                  </h3>
                  {generationNumber > 0 && (
                    <span className="bg-coh-navy text-coh-gold text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                      Draft Set {generationNumber} <Tooltip text="Each time you regenerate, a new draft set is created so you can compare versions." />
                    </span>
                  )}
                </div>

                {draftOptions ? (
                  <div className="space-y-6">
                    {isBriefOutdated && (
                      <div className="bg-amber-50 border border-amber-300 p-3.5 rounded text-xs text-coh-navy flex justify-between items-center animate-fadeIn">
                        <span>Inputs changed. Regenerate to apply the latest brief.</span>
                        <button
                          disabled={isGeneratingDrafts || aiIsGenerating}
                          onClick={handleGenerateDrafts}
                          className="bg-coh-navy text-coh-gold px-3 py-1.5 rounded text-[11px] font-bold shadow-md hover:bg-coh-navy-light transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGeneratingDrafts ? 'Generating...' : 'Generate Again'}
                        </button>
                      </div>
                    )}

                    {draftOptions.contextWarning && (
                      <div className="bg-amber-50 border border-amber-300 p-4 rounded text-xs text-coh-navy flex items-center gap-2 font-semibold">
                        <AlertTriangle size={15} className="text-coh-gold shrink-0" />
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
                        <div className={`p-4 rounded border text-xs space-y-2 ${isRTL ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
                          <div className="flex items-start gap-2">
                            <AlertTriangle size={14} className={`shrink-0 mt-0.5 ${isRTL ? 'text-red-600' : 'text-amber-600'}`} />
                            <div className="space-y-1.5">
                              <p className={`font-semibold ${isRTL ? 'text-red-800' : 'text-amber-900'}`}>{message}</p>
                              <p className="text-coh-navy/60">The draft below is an English prototype. Approved names such as Climate Opera Haus and opera titles are preserved.</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('prompt-builder')}
                            className="inline-flex items-center gap-1.5 bg-coh-navy text-coh-gold text-[10px] font-bold px-3 py-1.5 rounded hover:bg-coh-navy-light transition"
                          >
                            Build {lang} AI Prompt <ArrowRight size={10} />
                          </button>
                        </div>
                      );
                    })()}

                    <div className="space-y-4">

                      {/* Option A card */}
                      <div className="border border-coh-gold/25 rounded bg-white flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-coh-cream/40 p-3 border-b border-coh-gold/15 flex justify-between items-center">
                          <span className="font-serif text-xs font-bold text-coh-navy">Option A — Direct / Institutional</span>
                          <div className="flex items-center gap-2">
                            {detectCleanlinessIssues(draftOptions.optionA) ? (
                              <button
                                onClick={cleanOptionADraft}
                                title="Click to clean em dashes, curly quotes, and AI punctuation"
                                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition"
                              >
                                ⚠️ Needs cleanup
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                                ✓ Clean
                              </span>
                            )}
                            <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-coh-gold/25 text-coh-navy-light flex items-center gap-1">
                              {draftOptions.labelA} <Tooltip text="Shows how much the draft is supported by sources." />
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-coh-navy/85 leading-relaxed whitespace-pre-wrap select-all font-sans">
                            {draftOptions.optionA}
                          </p>
                        </div>
                        <div className="bg-coh-cream/15 p-3 border-t border-coh-gold/15 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setActiveDraftText(draftOptions.optionA);
                              setActiveDraftTitle(`${creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel} Option A`);
                              setActiveDraftVersion(1);
                              setActiveDraftHistory([{ version: 1, text: draftOptions.optionA, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Initial generation' }]);
                              setActiveDraftSource('Content Workspace');
                              setActiveTab('revision-studio');
                            }}
                            className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Revise This Draft
                          </button>
                          <button
                            onClick={() => handleCopyClipboard(draftOptions.optionA, 'optA')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            {copySuccessMap['optA'] ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionA, 'A')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Save to Library
                          </button>
                        </div>
                      </div>

                      {/* Option B card */}
                      <div className="border border-coh-gold/25 rounded bg-white flex flex-col overflow-hidden shadow-sm">
                        <div className="bg-coh-cream/40 p-3 border-b border-coh-gold/15 flex justify-between items-center">
                          <span className="font-serif text-xs font-bold text-coh-navy">Option B — Human / Narrative</span>
                          <div className="flex items-center gap-2">
                            {detectCleanlinessIssues(draftOptions.optionB) ? (
                              <button
                                onClick={cleanOptionBDraft}
                                title="Click to clean em dashes, curly quotes, and AI punctuation"
                                className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200 transition"
                              >
                                ⚠️ Needs cleanup
                              </button>
                            ) : (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200">
                                ✓ Clean
                              </span>
                            )}
                            <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-coh-gold/25 text-coh-navy-light flex items-center gap-1">
                              {draftOptions.labelB} <Tooltip text="Shows how much the draft is supported by sources." />
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-coh-navy/85 leading-relaxed whitespace-pre-wrap select-all font-sans">
                            {draftOptions.optionB}
                          </p>
                        </div>
                        <div className="bg-coh-cream/15 p-3 border-t border-coh-gold/15 flex flex-wrap gap-2">
                          <button
                            onClick={() => {
                              setActiveDraftText(draftOptions.optionB);
                              setActiveDraftTitle(`${creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel} Option B`);
                              setActiveDraftVersion(1);
                              setActiveDraftHistory([{ version: 1, text: draftOptions.optionB, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Initial generation' }]);
                              setActiveDraftSource('Content Workspace');
                              setActiveTab('revision-studio');
                            }}
                            className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Revise This Draft
                          </button>
                          <button
                            onClick={() => handleCopyClipboard(draftOptions.optionB, 'optB')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            {copySuccessMap['optB'] ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionB, 'B')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Save to Library
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* 2. Shorter Version */}
                    <div className="bg-white border border-coh-gold/20 p-4 rounded text-xs space-y-2">
                      <span className="font-serif font-bold text-coh-navy text-xs block">Shorter Version</span>
                      <p className="text-xs text-coh-navy/80 italic leading-relaxed">{draftOptions.optionC}</p>
                    </div>

                    {/* 3. Visual Direction */}
                    <div className="bg-coh-cream/55 p-4 border border-coh-gold/20 rounded text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-serif font-bold text-coh-navy text-xs block">
                          Visual Direction <Tooltip text="Design guidance for a visual designer, carousel, post graphic, or image prompt." />
                        </span>
                        <div className="flex gap-2 text-[9px] font-semibold text-coh-navy">
                          <button
                            onClick={() => {
                              const formatted = formatVisualDirectionForDisplay(
                                draftOptions.visualIdeation,
                                creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                                creationMode === 'quick' ? quickBrief.outputFormat : advancedBrief.outputFormat,
                                draftOptions.optionA
                              );
                              navigator.clipboard.writeText(formatted);
                              alert('Copied Visual Direction to clipboard!');
                            }}
                            className="hover:text-coh-gold transition"
                          >
                            Copy Visual Direction
                          </button>
                          <span className="text-coh-gold/30">|</span>
                          <button
                            onClick={() => {
                              const promptText = extractAIImagePrompt(
                                draftOptions.visualIdeation,
                                creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                                creationMode === 'quick' ? quickBrief.outputFormat : advancedBrief.outputFormat,
                                draftOptions.optionA
                              );
                              navigator.clipboard.writeText(promptText);
                              alert('Copied AI Image Prompt to clipboard!');
                            }}
                            className="hover:text-coh-gold transition"
                          >
                            Copy AI Image Prompt
                          </button>
                        </div>
                      </div>
                      <pre className="text-[11px] text-coh-navy/85 whitespace-pre-wrap leading-relaxed font-mono">
                        {formatVisualDirectionForDisplay(
                          draftOptions.visualIdeation,
                          creationMode === 'quick' ? quickBrief.channel : advancedBrief.channel,
                          creationMode === 'quick' ? quickBrief.outputFormat : advancedBrief.outputFormat,
                          draftOptions.optionA
                        )}
                      </pre>
                    </div>

                    {/* 4. Strategy Fit Check */}
                    <div className="bg-coh-navy/5 p-4 border border-coh-gold/20 rounded text-xs space-y-2">
                      <div className="flex items-center gap-1.5 text-coh-navy">
                        <span className="font-serif font-bold text-sm">Strategy Fit Check</span>
                      </div>
                      <p className="text-[11px] text-coh-navy/80 leading-relaxed font-medium">
                        {draftOptions.editorialWarning.includes('Quality check:') || draftOptions.editorialWarning.includes('|') ? (
                          <span className="text-red-700">{draftOptions.editorialWarning}</span>
                        ) : (
                          <span className="text-green-700">✓ Aligned with Operating Core parameters. {draftOptions.editorialWarning}</span>
                        )}
                      </p>
                    </div>

                    {/* Post-generation: Generate Another Version */}
                    <div className="border-t border-coh-gold/25 pt-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-coh-navy/60 uppercase tracking-wider">Generate Another Version — Style:</span>
                        <select
                          value={anotherVersionStyle}
                          onChange={(e) => setAnotherVersionStyle(e.target.value)}
                          className="bg-white border border-coh-gold/20 text-[10px] text-coh-navy p-1.5 rounded font-bold"
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
                          className="bg-coh-gold hover:bg-coh-gold-dark text-coh-navy px-3 py-1.5 rounded font-bold text-[10px] font-serif transition flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {isGeneratingDrafts ? <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={12} />}
                          {isGeneratingDrafts ? 'Generating...' : 'Generate'}
                        </button>
                      </div>
                    </div>

                    {/* 5. Recommended Approach */}
                    {advancedBrief.directionMode === 'auto' && (
                      <details className="text-xs border border-coh-gold/15 p-3 rounded bg-coh-cream/15 cursor-pointer">
                        <summary className="font-semibold text-coh-navy hover:text-coh-gold font-serif">View Recommended Approaches</summary>
                        <div className="space-y-3 mt-3">
                          {getDynamicDirections().map(d => {
                            const isSel = d.title === advancedBrief.angle;
                            return (
                              <div key={d.title} className={`p-3 border rounded text-xs transition cursor-default ${
                                isSel ? 'border-coh-gold bg-white' : 'border-coh-gold/10 bg-white/50'
                              }`}>
                                <h4 className="font-serif font-bold text-coh-navy mb-1">{d.title}</h4>
                                <p className="text-coh-navy/60 text-[11px] mb-2">{d.strategicFrame}</p>
                                <div className="text-[10px] text-coh-navy/70 space-y-1">
                                  <div><strong>Why this works:</strong> Visually anchors local data context.</div>
                                  <div><strong>Best use:</strong> {d.bestChannelFit}</div>
                                  <div className="text-red-800"><strong>Risk to avoid:</strong> {d.whatNotToSay}</div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                  <button
                                    onClick={() => setAdvancedBrief({ ...advancedBrief, angle: d.title })}
                                    className="bg-coh-navy text-coh-gold px-2 py-1 rounded text-[10px]"
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
                                    className="bg-coh-cream border border-coh-gold/20 text-coh-navy px-2 py-1 rounded text-[10px]"
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
                                    className="bg-red-50 text-red-700 px-2 py-1 rounded text-[10px]"
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
                  <div className="text-center py-20 text-coh-navy/40 text-xs">
                    <Cpu className="mx-auto text-coh-gold/30 mb-2" size={24} />
                    <p>Ready to compile. Fill inputs and click &ldquo;Generate Drafts&rdquo;.</p>
                  </div>
                )}
              </div>


            </div>
          </div>
        )}

        {/* --- TAB 3: REVISION STUDIO --- */}
        {activeTab === 'visual-studio' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Visual Studio</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">Create visual outputs from full visual directions or custom prompts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Editor & Controls */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Input Mode Selector */}
                <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">Input Mode</h3>
                  
                  <div className="flex bg-coh-navy/5 p-1 rounded border border-coh-gold/15">
                    <button
                      onClick={() => setVsInputMode('Manual')}
                      className={`flex-1 px-4 py-2 text-xs font-semibold rounded transition ${vsInputMode === 'Manual' ? 'bg-coh-navy text-coh-gold shadow-sm' : 'text-coh-navy/60 hover:text-coh-navy'}`}
                    >
                      Manual Prompt
                    </button>
                    <button
                      onClick={() => setVsInputMode('Imported')}
                      className={`flex-1 px-4 py-2 text-xs font-semibold rounded transition ${vsInputMode === 'Imported' ? 'bg-coh-navy text-coh-gold shadow-sm' : 'text-coh-navy/60 hover:text-coh-navy'}`}
                    >
                      Imported Visual Direction
                    </button>
                  </div>

                  {vsInputMode === 'Imported' ? (
                    <div>
                      {vsSourceItem ? (
                        <div className="bg-coh-navy/5 p-3 rounded text-sm text-coh-navy border border-coh-gold/10">
                          <span className="block text-[10px] uppercase tracking-wider text-coh-navy/60 mb-1">Imported from {vsSourceItem.type}</span>
                          <strong className="block truncate font-serif" title={vsSourceItem.title}>{vsSourceItem.title}</strong>
                        </div>
                      ) : (
                        <div className="bg-coh-navy/5 p-3 rounded text-sm text-coh-navy/60 italic border border-coh-gold/10">
                          No imported visual direction selected. Send one from Content Workspace or Content Library.
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-coh-navy/70 font-semibold mb-1">Visual Prompt or Brief</label>
                      <textarea
                        value={vsManualPrompt}
                        onChange={(e) => setVsManualPrompt(e.target.value)}
                        placeholder="Paste a prompt, visual direction, image idea, or creative brief."
                        rows={4}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-xs font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Generation Controls */}
                <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 text-xs">
                  <h3 className="font-serif text-base font-bold text-coh-navy border-b border-coh-gold/15 pb-2">Generation Settings</h3>
                  
                  <div>
                    <label className="block text-coh-navy/70 font-semibold mb-1">Prompt Build Mode</label>
                    <select
                      value={vsPromptMode}
                      onChange={(e) => setVsPromptMode(e.target.value as any)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 text-xs text-coh-navy rounded"
                    >
                      {vsInputMode === 'Manual' && <option value="Manual Only">Manual Prompt Only</option>}
                      <option value="Full + AI">Full Visual Direction + AI Image Prompt</option>
                      <option value="Full">Full Visual Direction</option>
                      <option value="AI Only">AI Image Prompt Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-coh-navy/70 font-semibold mb-1">Aspect Ratio</label>
                    <select
                      value={vsAspectRatio}
                      onChange={(e) => setVsAspectRatio(e.target.value)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 text-xs text-coh-navy rounded"
                    >
                      <option value="Square 1:1 (1024x1024)">Square 1:1 (1024x1024)</option>
                      <option value="LinkedIn Post (1024x1024)">LinkedIn Post (1:1)</option>
                      <option value="Instagram Feed (1024x1024)">Instagram Feed (1:1)</option>
                      
                      <option disabled>──────────</option>
                      
                      <option value="Landscape (1536x1024)">Landscape (1536x1024)</option>
                      <option value="Landscape 3:2 (1536x1024)">Landscape 3:2 (1536x1024)</option>
                      <option value="Wide Banner / Hero (landscape) (1536x1024)">Wide Banner / Hero (landscape)</option>
                      <option value="Newsletter Header (1536x1024)">Newsletter Header (landscape)</option>
                      <option value="Website Hero (1536x1024)">Website Hero (landscape)</option>
                      
                      <option disabled>──────────</option>

                      <option value="Portrait (1024x1536)">Portrait (1024x1536)</option>
                      <option value="Portrait 4:5 (1024x1536)">Portrait 4:5 (1024x1536)</option>
                      <option value="Instagram Story (1024x1536)">Instagram Story (portrait)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-coh-navy/70 font-semibold mb-1">Visual Style</label>
                    <select
                      value={vsVisualStyle}
                      onChange={(e) => setVsVisualStyle(e.target.value)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 text-xs text-coh-navy rounded"
                    >
                      <option value="Editorial Photomontage">Editorial Photomontage</option>
                      <option value="Cinematic Realism">Cinematic Realism</option>
                      <option value="Premium Illustration">Premium Illustration</option>
                      <option value="Minimal Graphic">Minimal Graphic</option>
                      <option value="Social Poster">Social Poster</option>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-coh-gold/10 mt-4">
                    <button
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !aiProvider}
                      className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-3 rounded font-serif text-xs font-semibold transition border border-coh-gold/20 flex items-center justify-center gap-2"
                    >
                      {isGeneratingImage ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Lightbulb size={16} />}
                      {isGeneratingImage ? 'Generating...' : 'Generate'}
                    </button>
                  </div>
                  {!aiProvider && <p className="text-xs text-red-500 text-center">No AI provider configured.</p>}
                  {aiLastError && <p className="text-xs text-red-500 text-center">{aiLastError}</p>}
                </div>

              {/* Structured Visual Brief Editor */}
              <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm space-y-4 max-h-[80vh] overflow-y-auto text-xs">
                <div className="flex justify-between items-center mb-4 border-b border-coh-gold/15 pb-2">
                  <h3 className="font-serif text-base font-bold text-coh-navy">Structured Visual Brief</h3>
                  {vsInputMode === 'Manual' && (
                    <button
                      onClick={() => setShowAdvancedBrief(!showAdvancedBrief)}
                      className="text-[10px] text-coh-gold uppercase font-bold tracking-wider hover:underline"
                    >
                      {showAdvancedBrief ? 'Hide' : 'Show'} Advanced
                    </button>
                  )}
                </div>
                
                {(vsInputMode === 'Imported' || showAdvancedBrief) ? (
                  <div className="space-y-4">
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
                      { label: 'Designer Notes', value: vsNotes, setter: setVsNotes }
                    ].map(field => (
                      <div key={field.label}>
                        <label className="block text-coh-navy/70 font-semibold mb-1">{field.label}</label>
                        <textarea
                          value={field.value}
                          onChange={(e) => field.setter(e.target.value)}
                          rows={field.label === 'Visual Concept' || field.label === 'AI Image Prompt' ? 3 : 2}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 text-xs text-coh-navy rounded font-sans"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                   <div className="text-center py-12 text-coh-navy/40 italic text-sm">
                     Advanced brief fields are hidden in manual mode.
                   </div>
                  )}
                </div>
              </div>

              {/* Right Column: Results Grid */}
              <div className="lg:col-span-7 bg-white border border-coh-gold/20 p-6 rounded shadow-sm space-y-6">
                <div className="border-b border-coh-gold/15 pb-2 flex justify-between items-center">
                  <h3 className="font-serif text-lg font-semibold text-coh-navy">
                    Results
                  </h3>
                </div>
                
                {isGeneratingImage ? (
                  <div className="bg-coh-cream p-12 rounded text-center border border-dashed border-coh-gold/30 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-4 border-coh-gold border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-coh-navy font-semibold text-sm">Generating...</p>
                  </div>
                ) : vsGeneratedImages.length === 0 ? (
                  <div className="bg-coh-cream p-8 rounded text-center text-coh-navy/50 italic border border-dashed border-coh-gold/30">
                    No images generated yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {vsGeneratedImages.map(img => (
                      <div key={img.id} className="bg-white border border-coh-gold/20 rounded p-4 shadow-sm group">
                        <img src={img.url} alt="Generated Visual" className="w-full h-auto max-h-[70vh] object-contain rounded mb-3 border border-coh-gold/10" />
                        <div className="flex gap-2 text-xs">
                          <a
                            href={img.url}
                            download={`coh-visual-${(vsSourceItem?.title || 'manual').replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.png`}
                            className="w-full bg-coh-cream hover:bg-coh-gold hover:text-coh-navy text-coh-navy/80 border border-coh-gold/30 py-2.5 rounded text-center font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            Download
                          </a>
                        </div>
                        {/* Compiled Prompt Preview */}
                        {img.promptUsed && (
                          <details className="mt-4 border border-coh-navy/10 rounded overflow-hidden">
                            <summary className="bg-coh-cream px-3 py-2 text-[10px] uppercase tracking-wider text-coh-navy/60 font-bold cursor-pointer select-none flex justify-between">
                              <span>Compiled Prompt Preview (Debug)</span>
                              <span className="opacity-50 font-mono">
                                {img.generationSize || '1024x1024'} → {img.deliverySize || '1024x1024'}
                              </span>
                            </summary>
                            <div className="p-3 bg-white text-[11px] font-mono text-coh-navy/80 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                              <div className="mb-2 pb-2 border-b border-coh-navy/10 text-[9px] opacity-70 grid grid-cols-2 gap-2">
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
        )}

        {activeTab === 'revision-studio' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy">Revision Studio</h2>
              <p className="text-sm text-coh-navy/60 font-sans mt-1">
                Refine drafts using localized brand filters. Create new versions (v1, v2, v3) and compare differences.
              </p>
            </div>

            {activeDraftText ? (
              <div className="grid grid-cols-3 gap-8">
                
                <div className="col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-baseline gap-3">
                      <input
                        type="text"
                        value={activeDraftTitle}
                        onChange={(e) => setActiveDraftTitle(e.target.value)}
                        className="font-serif text-xl bg-transparent border-b border-coh-gold/20 focus:border-coh-gold pb-1 outline-none text-coh-navy w-64"
                        placeholder="Draft Title"
                      />
                      <span className="bg-coh-navy text-coh-gold text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        Version v{activeDraftVersion}
                      </span>
                      <span className="bg-coh-gold/20 text-coh-navy border border-coh-gold/40 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                        {activeDraftSource}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleUndoRevision}
                        disabled={activeDraftHistory.length <= 1}
                        className="px-2.5 py-1 text-[11px] border border-coh-gold/20 bg-white rounded hover:bg-coh-cream disabled:opacity-50 text-coh-navy font-semibold transition flex items-center gap-1"
                      >
                        <Undo size={12} /> Undo
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 items-center bg-coh-cream/40 p-2.5 border border-coh-gold/15 rounded text-xs">
                    <span className="font-semibold">Compare with previous version:</span>
                    <select
                      value={compareVersionIndex}
                      onChange={(e) => setCompareVersionIndex(parseInt(e.target.value))}
                      className="bg-white border border-coh-gold/10 p-1 rounded text-[11px]"
                    >
                      <option value={-1}>Don't compare</option>
                      {activeDraftHistory.slice(0, -1).map((h, idx) => (
                        <option key={idx} value={idx}>v{h.version} ({h.actionUsed})</option>
                      ))}
                    </select>
                  </div>

                  {compareVersionIndex !== -1 && activeDraftHistory[compareVersionIndex] && (
                    <div className="grid grid-cols-2 gap-4 text-xs bg-white border border-coh-gold/25 p-4 rounded shadow-inner">
                      <div>
                        <span className="font-mono text-[10px] text-coh-gold font-bold block mb-2">
                          Comparing: v{activeDraftHistory[compareVersionIndex].version}
                        </span>
                        <div className="text-coh-navy/60 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                          {activeDraftHistory[compareVersionIndex].text}
                        </div>
                      </div>
                      <div className="border-l border-coh-gold/10 pl-4">
                        <span className="font-mono text-[10px] text-coh-gold font-bold block mb-2">
                          Current: v{activeDraftVersion}
                        </span>
                        <div className="whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto font-semibold">
                          {activeDraftText}
                        </div>
                      </div>
                    </div>
                  )}

                  {cleanPunctuationNote && (
                    <div className="bg-green-50 border border-green-200 text-green-800 p-2.5 rounded text-xs font-semibold animate-fadeIn">
                      {cleanPunctuationNote}
                    </div>
                  )}

                  <textarea
                    rows={12}
                    value={activeDraftText}
                    onChange={(e) => setActiveDraftText(e.target.value)}
                    className="w-full bg-white border border-coh-gold/20 p-6 rounded shadow-sm text-xs leading-relaxed text-coh-navy/90 focus:outline-none focus:ring-1 focus:ring-coh-gold"
                  />

                  {getFictionalContentWarnings(activeDraftText).length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded text-xs text-amber-900 space-y-2">
                      <span className="font-bold flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-amber-700" /> Source Check Needed
                      </span>
                      <p className="text-[11px] text-amber-900/80 leading-relaxed">
                        This draft may include names, claims, dates, numbers, or references that should be checked against approved sources before publishing.
                      </p>
                      <ul className="list-disc pl-5 text-[11px] space-y-0.5 font-mono text-amber-800">
                        {getFictionalContentWarnings(activeDraftText).map((w, idx) => (
                          <li key={idx}>{w}</li>
                        ))}
                      </ul>
                      <p className="text-[11px] font-semibold pt-1 border-t border-amber-200/50">
                        Verify these items against approved sources before publishing, or remove them.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap justify-between items-center border-t border-coh-gold/15 pt-4">
                    <div className="flex gap-2 flex-wrap">
                       <button
                        disabled={isSavingToLibrary}
                        onClick={() => handleSaveVersionToLibrary(false)}
                        className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded text-[11px] font-serif font-semibold border border-coh-gold/20 transition disabled:opacity-50"
                      >
                        {isSavingToLibrary ? 'Saving...' : 'Save to Library'}
                      </button>
                      <button
                        disabled={isSavingToLibrary}
                        onClick={() => handleSaveVersionToLibrary(true)}
                        className="bg-coh-cream text-coh-navy hover:bg-coh-cream-dark py-2 px-4 rounded text-[11px] font-serif font-semibold border border-coh-gold/25 transition disabled:opacity-50"
                      >
                        {isSavingToLibrary ? 'Saving...' : 'Save as New'}
                      </button>
                      {activeDraftText.includes('Concept:') && (
                        <button
                          onClick={() => handleSendToVisualStudio({ id: 'draft-temp', title: activeDraftTitle || 'Unsaved Draft', type: 'Content' }, activeDraftText, 'Content')}
                          className="flex items-center gap-1.5 bg-coh-cream text-coh-gold hover:text-coh-gold-dark py-2 px-4 rounded text-[11px] font-serif font-semibold border border-coh-gold/25 transition disabled:opacity-50"
                        >
                          <Lightbulb size={12} /> Send Visual Direction to Visual Studio
                        </button>
                      )}
                      <button
                        disabled={isSavingToLibrary}
                        onClick={() => handleSaveVersionToLibrary(false, true)}
                        className="bg-green-700 text-white hover:bg-green-800 py-2 px-4 rounded text-[11px] font-serif font-semibold transition disabled:opacity-50"
                      >
                        Mark as Approved
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyClipboard(activeDraftText, 'activeDraft')}
                        className="bg-coh-gold text-coh-navy hover:bg-coh-gold-dark py-2 px-4 rounded text-[11px] font-bold transition"
                      >
                        {copySuccessMap['activeDraft'] ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => setActiveTab('content-library')}
                        className="bg-coh-cream text-coh-navy hover:bg-coh-cream-dark py-2 px-4 rounded text-[11px] font-semibold border border-coh-gold/20 flex items-center gap-1"
                      >
                        Library <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm h-fit space-y-6">
                  <div>
                    <h3 className="font-serif text-lg mb-1 text-coh-navy-light font-bold">Revision Controls</h3>
                    <p className="text-[10px] text-coh-navy/55 font-mono">Applies brand refinements and updates version index (v1, v2).</p>
                  </div>

                  <div className="space-y-5">
                    {(() => {
                      const renderRevBtn = (key: string, label: string, tooltip?: string) => {
                        const isRunning = activeRevisionAction === key;
                        const isSuccess = revisionSuccessAction === key;
                        const isDisabled = activeRevisionAction !== null && !isRunning;
                        return (
                          <button
                            key={key}
                            disabled={isDisabled}
                            onClick={() => applyRevision(key)}
                            title={tooltip}
                            className={`w-full text-left py-2 px-3 border rounded text-xs transition font-semibold flex items-center justify-between ${
                              isRunning
                                ? 'bg-coh-gold/20 border-coh-gold text-coh-navy font-bold animate-pulse'
                                : isSuccess
                                  ? 'bg-green-50 border-green-300 text-green-800 font-bold'
                                  : 'bg-coh-cream border-coh-gold/15 text-coh-navy hover:bg-coh-gold/20'
                            } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                          >
                            <span>{isRunning ? `${label.split(' ')[0]} Applying...` : isSuccess ? `${label.split(' ')[0]} Applied ✓` : label}</span>
                            {isRunning && <span className="animate-spin text-[10px]">⚙️</span>}
                          </button>
                        );
                      };

                      return (
                        <>
                          <div className="space-y-1.5">
                            <h4 className="text-[10px] uppercase font-bold text-coh-navy/50 tracking-wider mb-2">1. Style & Tone</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                              {renderRevBtn('clean-ai-punctuation', '🧼 Clean AI-Style Characters', 'Removes em dashes, hidden Unicode characters, awkward AI punctuation, excessive separators, and export-unfriendly symbols.')}
                              {renderRevBtn('sharper', '⚡ Make it sharper')}
                              {renderRevBtn('human', '👤 Make it more human')}
                              {renderRevBtn('less-poetic', '📐 Make it less poetic')}
                              {renderRevBtn('less-corporate', '💼 Make it less corporate')}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-[10px] uppercase font-bold text-coh-navy/50 tracking-wider mb-2">2. COH Positioning</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                              {renderRevBtn('coh-specific', '🎭 Make it more COH-specific')}
                              {renderRevBtn('institutional', '🏛️ Make it more institutional')}
                              {renderRevBtn('less-ngo', '🌱 Make it less NGO-like')}
                              {renderRevBtn('sponsor-facing', '💰 Make it more sponsor-facing')}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-[10px] uppercase font-bold text-coh-navy/50 tracking-wider mb-2">3. Audience & Channel</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                              {renderRevBtn('audience-friendly', '🤝 Make it more audience-friendly')}
                              {renderRevBtn('channel-ready', '📱 Make it more channel-ready')}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-[10px] uppercase font-bold text-coh-navy/50 tracking-wider mb-2">4. Structure & Options</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                              {renderRevBtn('shorter', '✂️ Make it shorter')}
                              {renderRevBtn('openings', '📝 Create 3 alternative openings')}
                              {renderRevBtn('ctas', '📣 Create 3 CTA options')}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-[10px] uppercase font-bold text-coh-navy/50 tracking-wider mb-2">5. Proof & Credibility</h4>
                            <div className="grid grid-cols-1 gap-1.5">
                              {renderRevBtn('remove-unsupported', '🛡️ Remove unsupported claims')}
                              {renderRevBtn('stronger-proof', '📊 Expand with stronger proof')}
                            </div>
                          </div>
                        </>
                      );
                    })()}

                    {activeRevisionError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-2 text-xs rounded mb-2">
                        {activeRevisionError}
                      </div>
                    )}
                    <div className="border-t border-coh-gold/15 pt-2 mt-1 space-y-1">
                      <label className="block text-[10px] uppercase font-bold text-coh-navy/60">Rewrite with custom instruction</label>
                      <input
                        type="text"
                        value={customRevisionInstruction}
                        onChange={(e) => setCustomRevisionInstruction(e.target.value)}
                        placeholder="What should change?"
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy text-xs mb-1.5"
                      />
                      <button
                        onClick={() => applyRevision('custom-instruction')}
                        disabled={!customRevisionInstruction.trim() || activeRevisionAction !== null}
                        className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 rounded text-xs font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        {activeRevisionAction === 'custom-instruction' ? 'Applying...' : 'Apply'}
                        {activeRevisionAction === 'custom-instruction' && <span className="animate-spin text-[10px]">⚙️</span>}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="grid grid-cols-3 gap-8">
                <div className="col-span-2 bg-white border border-coh-gold/20 p-6 rounded shadow-sm">
                  <h3 className="font-serif text-xl text-coh-navy font-semibold mb-1">Start a Revision</h3>
                  <p className="text-xs text-coh-navy/60 mb-6 font-sans">
                    Paste any draft, note, post, email, or external content to refine it.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Content to Revise</label>
                      <textarea
                        value={externalContentText}
                        onChange={(e) => setExternalContentText(e.target.value)}
                        placeholder="Paste your text here..."
                        className="w-full h-40 bg-coh-cream/30 border border-coh-gold/20 p-3 rounded text-sm text-coh-navy resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Optional Context</label>
                      <textarea
                        value={externalContentContext}
                        onChange={(e) => setExternalContentContext(e.target.value)}
                        placeholder="Add audience, channel, purpose, tone, or what should change."
                        className="w-full h-16 bg-coh-cream/30 border border-coh-gold/20 p-3 rounded text-xs text-coh-navy resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Channel</label>
                        <select
                          value={externalContentChannel}
                          onChange={(e) => setExternalContentChannel(e.target.value)}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy"
                        >
                          {['General / Custom', 'LinkedIn', 'Twitter', 'Email Newsletter', 'Blog Post', 'Press Release', 'Website Copy'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Output Format</label>
                        <select
                          value={externalContentFormat}
                          onChange={(e) => setExternalContentFormat(e.target.value)}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy"
                        >
                          {['General / Custom', 'Paragraphs', 'Bullet Points', 'Executive Summary', 'Action Items'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Language</label>
                        <select
                          value={externalContentLanguage}
                          onChange={(e) => setExternalContentLanguage(e.target.value)}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy"
                        >
                          {['English', 'French', 'Spanish', 'German', 'Dutch'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-coh-navy/60 mb-1">Tone</label>
                        <select
                          value={externalContentTone}
                          onChange={(e) => setExternalContentTone(e.target.value)}
                          className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-xs text-coh-navy"
                        >
                          {['Balanced / COH Default', 'Professional', 'Conversational', 'Persuasive', 'Urgent', 'Inspirational'].map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button
                        onClick={handleStartExternalRevision}
                        disabled={!externalContentText.trim()}
                        className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light px-6 py-2.5 rounded font-serif text-sm font-semibold transition disabled:opacity-50"
                      >
                        Start Revising
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 space-y-4">
                  <div className="bg-coh-cream/30 border border-coh-gold/20 p-5 rounded">
                    <h4 className="font-serif text-sm font-semibold text-coh-navy mb-2">How to use Revision Studio</h4>
                    <ul className="text-xs text-coh-navy/70 space-y-3 font-sans">
                      <li className="flex gap-2">
                        <span className="text-coh-gold">1.</span>
                        Paste any text from an external source or import a draft from the Content Workspace.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-coh-gold">2.</span>
                        Use the 1-click revision controls to apply the COH Tone of Voice or optimize for specific audiences.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-coh-gold">3.</span>
                        Provide custom instructions to the AI to rewrite specific sentences or adjust the framing.
                      </li>
                      <li className="flex gap-2">
                        <span className="text-coh-gold">4.</span>
                        Compare versions side-by-side using the version dropdown menu.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: CONTENT LIBRARY --- */}
        {activeTab === 'content-library' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Content Library</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">
                  Access, duplicate, and filter approved COH content assets.
                </p>
              </div>
            </div>

            <div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm flex gap-4 text-xs flex-wrap items-center">
              <div className="flex items-center gap-1 text-coh-gold shrink-0">
                <Filter size={15} />
                <span className="font-semibold uppercase tracking-wider font-mono">Filters</span>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] uppercase text-coh-navy/50 block mb-1">Search Content</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title, copy, or elements..."
                  className="bg-coh-cream border border-coh-gold/20 p-1 rounded text-[11px] w-full text-coh-navy"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase text-coh-navy/50 block mb-1">Filter Channel</label>
                <select
                  value={filterChannel}
                  onChange={(e) => setFilterChannel(e.target.value)}
                  className="bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy text-[11px]"
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
                <label className="text-[10px] uppercase text-coh-navy/50 block mb-1">Filter Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy text-[11px]"
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Revised">Revised</option>
                  <option value="Approved">Approved</option>
                  <option value="Published">Published</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase text-coh-navy/50 block mb-1">Filter Pillar</label>
                <select
                  value={filterPillar}
                  onChange={(e) => setFilterPillar(e.target.value)}
                  className="bg-coh-cream border border-coh-gold/20 p-1.5 rounded text-coh-navy text-[11px]"
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
                className="px-3 py-1.5 rounded bg-coh-cream border border-coh-gold/20 text-[10px] font-bold text-coh-navy uppercase hover:bg-coh-cream-dark transition"
              >
                Reset
              </button>
            </div>

            {actualFilteredSaved.length > 0 ? (
              <div className="grid grid-cols-2 gap-6">
                {actualFilteredSaved.map(item => (
                  <div key={item.id} className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="flex gap-2 items-center flex-wrap mb-1">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-coh-gold bg-coh-navy px-1.5 py-0.5 rounded">
                              {item.channel}
                            </span>
                            <span className="text-[9px] font-mono text-coh-navy/50 uppercase font-semibold">
                              {item.pillar}
                            </span>
                            <span className="bg-coh-gold/25 text-coh-navy text-[9px] font-mono px-1 rounded font-bold">
                              v{item.version || 1}
                            </span>
                          </div>
                          <h4 className="font-serif text-lg font-semibold text-coh-navy leading-snug">{generateContentDisplayTitle(item)}</h4>
                        </div>

                        <select
                          value={item.status}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value as SavedContent['status'])}
                          className={`text-[10px] font-bold p-1 rounded font-mono border border-coh-gold/20 ${
                            item.status === 'Published' ? 'bg-green-50 text-green-800' :
                            item.status === 'Approved' ? 'bg-blue-50 text-blue-800' :
                            item.status === 'Revised' ? 'bg-amber-50 text-amber-800' :
                            'bg-gray-50 text-gray-800'
                          }`}
                        >
                          <option value="Draft">Draft</option>
                          <option value="Revised">Revised</option>
                          <option value="Approved">Approved</option>
                          <option value="Published">Published</option>
                        </select>
                      </div>

                      <p className="text-xs text-coh-navy/80 whitespace-pre-wrap leading-relaxed bg-coh-cream/45 p-4 border border-coh-gold/10 rounded">
                        {item.text}
                      </p>

                      <div className="text-[10px] text-coh-navy/40 space-y-0.5">
                        <div><strong>Target Audience:</strong> {item.audience}</div>
                        <div><strong>Content Direction:</strong> {item.angle}</div>
                        <div className="truncate"><strong>Sources:</strong> {item.sourcesUsed.join(', ') || 'None'}</div>
                      </div>

                      {/* Visual Direction section */}
                      {(item.visualDirection || item.visualIdeation) && (
                        <div className="border-t border-coh-gold/10 pt-2.5 mt-2 space-y-1.5 text-left">
                          <div className="flex justify-between items-center flex-wrap gap-1">
                            <span className="text-[10px] uppercase font-bold text-coh-navy/60 block">Visual Direction</span>
                            <div className="flex gap-2 text-[9px] font-semibold text-coh-navy">
                              <button
                                onClick={() => {
                                  const formatted = formatVisualDirectionForDisplay(
                                    item.visualDirection || item.visualIdeation,
                                    item.channel,
                                    item.outputFormat || 'Post',
                                    item.text
                                  );
                                  navigator.clipboard.writeText(formatted);
                                  alert('Copied Visual Direction!');
                                }}
                                className="hover:text-coh-gold transition"
                              >
                                Copy Visual Direction
                              </button>
                              <span className="text-coh-gold/30">|</span>
                              <button
                                onClick={() => {
                                  const promptText = extractAIImagePrompt(
                                    item.visualDirection || item.visualIdeation,
                                    item.channel,
                                    item.outputFormat || 'Post',
                                    item.text
                                  );
                                  navigator.clipboard.writeText(promptText);
                                  alert('Copied AI Image Prompt!');
                                }}
                                className="hover:text-coh-gold transition"
                              >
                                Copy AI Image Prompt
                              </button>
                            </div>
                          </div>
                          <div className="bg-coh-cream/35 p-3 border border-coh-gold/10 rounded text-[11px] text-coh-navy/80 whitespace-pre-wrap font-sans leading-relaxed">
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

                    <div className="flex justify-between items-center border-t border-coh-gold/15 pt-4 text-[10px] text-coh-navy/40 font-mono">
                      <span>Saved: {item.createdAt} | Edited: {item.lastEdited}</span>
                      <div className="flex gap-1.5 flex-wrap items-center">
                        <button
                          onClick={() => handleCopyClipboard(item.text, item.id)}
                          className="text-[11px] font-semibold text-coh-navy hover:text-coh-gold transition"
                        >
                          {copySuccessMap[item.id] ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => handleDuplicateSaved(item)}
                          className="text-[11px] font-semibold text-coh-navy hover:text-coh-gold transition"
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
                          className="flex items-center gap-1 text-[11px] text-coh-navy hover:text-coh-gold font-semibold transition"
                        >
                          <Edit3 size={11} /> Edit / Revise
                        </button>
                        <button
                          onClick={() => handleDeleteSaved(item.id)}
                          className="flex items-center gap-1 text-[11px] text-red-800/70 hover:text-red-800 font-semibold transition"
                        >
                          Delete
                        </button>

                        <button
                          onClick={() => handleExport(item, 'txt')}
                          className="flex items-center gap-1 text-[11px] text-coh-navy hover:text-coh-gold font-semibold transition"
                        >
                          Download TXT
                        </button>
                        {item.visualDirection && (
                          <button
                            onClick={() => handleSendToVisualStudio(item, item.visualDirection!, 'Library')}
                            className="flex items-center gap-1 text-[11px] text-coh-gold hover:text-coh-gold-dark font-semibold transition"
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
              <div className="text-center py-20 border border-dashed border-coh-gold/20 rounded bg-white">
                <p className="text-xs text-coh-navy/55 max-w-sm mx-auto">No saved content meets the active filters.</p>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 5: SOURCE LIBRARY --- */}
        {activeTab === 'knowledge-library' && (
          <div className="space-y-8 animate-fadeIn max-w-6xl">
            <div className="border-b border-coh-gold/20 pb-6 flex justify-between items-end">
              <div>
                <h2 className="font-serif text-3xl font-normal text-coh-navy">Knowledge Library</h2>
                <p className="text-sm text-coh-navy/60 font-sans mt-1">
                  Manage core documents, partner decks, business model papers, and approved rules. Upload folders or file logs.
                </p>
              </div>

              <div className="flex gap-2 text-xs">
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
                  className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded transition border border-coh-gold/20 flex items-center gap-1.5"
                >
                  <Upload size={14} /> Upload File
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded transition border border-coh-gold/20 flex items-center gap-1.5"
                >
                  <FolderOpen size={14} /> Upload Folder
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {/* Form panel */}
              <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm h-fit space-y-6">
                <div>
                  <h3 className="font-serif text-lg text-coh-navy-light pb-2 border-b border-coh-gold/10">
                    {editingSourceId ? 'Edit Source Record' : 'Add Source'}
                  </h3>
                  <p className="text-[10px] text-coh-navy/55 leading-relaxed mt-1">
                    Provide verifiable facts, texts, or links to instruct the studio. Some file types may require pasted text or summary until full parsing is added.
                  </p>
                </div>

                <form onSubmit={handleSaveSource} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Source Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Soria Moria Funding Memo"
                      value={newSource.title}
                      onChange={(e) => setNewSource({ ...newSource, title: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Source Type</label>
                      <select
                        value={newSource.type}
                        onChange={(e) => setNewSource({ ...newSource, type: e.target.value as SourceFile['type'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Tone of Voice">Tone of Voice</option>
                        <option value="Business Model">Business Model</option>
                        <option value="Business Memo">Business Memo</option>
                        <option value="Website Copy">Website Copy</option>
                        <option value="Deck">Deck</option>
                        <option value="Event Notes">Event Notes</option>
                        <option value="Partnership Notes">Partnership Notes</option>
                        <option value="Sponsorship Notes">Sponsorship Notes</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Image / Visual Asset">Image / Visual Asset</option>
                        <option value="Article / Media Coverage">Article / Media Coverage</option>
                        <option value="Team Notes">Team Notes</option>
                        <option value="Link">Link</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Status</label>
                      <select
                        value={newSource.status}
                        onChange={(e) => setNewSource({ ...newSource, status: e.target.value as SourceFile['status'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Active">Active</option>
                        <option value="Archived">Archived</option>
                        <option value="Needs Review">Needs Review</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Role</label>
                      <select
                        value={newSource.role}
                        onChange={(e) => setNewSource({ ...newSource, role: e.target.value as SourceFile['role'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="Foundational Source">Foundational Source</option>
                        <option value="Task Source">Task Source</option>
                        <option value="Approved Example">Approved Example</option>
                        <option value="Partner Context">Partner Context</option>
                        <option value="Visual Reference">Visual Reference</option>
                        <option value="Archive">Archive</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Supports Section</label>
                      <select
                        value={newSource.supportsOperatingCoreSection}
                        onChange={(e) => setNewSource({ ...newSource, supportsOperatingCoreSection: e.target.value as SourceFile['supportsOperatingCoreSection'] })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                      >
                        <option value="None">None</option>
                        <option value="Core Passport">Core Passport</option>
                        <option value="Strategy Kernel">Strategy Kernel</option>
                        <option value="Audiences">Audiences</option>
                        <option value="Channels">Channels</option>
                        <option value="Claims">Claims</option>
                        <option value="Voice">Voice</option>
                        <option value="Visual">Visual</option>
                        <option value="Revision">Revision</option>
                      </select>
                    </div>
                  </div>

                  {newSource.type === 'Link' && (
                    <div>
                      <label className="block text-coh-navy/70 mb-1 font-medium">Source URL</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newSource.url || ''}
                        onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy font-mono text-[11px]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Use Case / Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Strategic Partner Pitch Context"
                      value={newSource.useFor}
                      onChange={(e) => setNewSource({ ...newSource, useFor: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2.5 rounded text-coh-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Short Context / Notes</label>
                    <textarea
                      placeholder="Reference details, key quotes, or summaries..."
                      rows={3}
                      value={newSource.notes}
                      onChange={(e) => setNewSource({ ...newSource, notes: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-coh-navy/70 mb-1 font-medium">Content / Extracted Text or Summary</label>
                    <textarea
                      placeholder="Paste text summary or markdown file copy..."
                      rows={5}
                      required
                      value={newSource.content}
                      onChange={(e) => setNewSource({ ...newSource, content: e.target.value })}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded font-serif transition border border-coh-gold/20 text-xs font-semibold"
                    >
                      {editingSourceId ? 'Save Edits' : 'Add Source'}
                    </button>
                    {editingSourceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSourceId(null);
                          setNewSource({ title: '', type: 'Tone of Voice', status: 'Active', role: 'Task Source', supportsOperatingCoreSection: 'None', useFor: '', notes: '', content: '', url: '' });
                        }}
                        className="bg-coh-cream text-coh-navy border border-coh-gold/20 py-2 px-3 rounded hover:bg-coh-cream-dark transition text-xs"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Records List Panel */}
              <div className="col-span-2 space-y-6">
                
                {/* User-Added Sources list */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-coh-gold/15 pb-2">
                    <h3 className="font-serif text-lg text-coh-navy">User-Added Selectable Sources ({selectableSources.length})</h3>
                  </div>

                  {selectableSources.map(src => {
                    const isSelected = advancedBrief.selectedSourceIds.includes(src.id);
                    return (
                      <div key={src.id} className={`bg-white border p-5 rounded shadow-sm flex gap-4 transition ${
                        isSelected ? 'border-coh-gold bg-coh-cream/10' : 'border-coh-gold/20'
                      }`}>
                        <div className="pt-1 select-none">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSourceSelection(src.id)}
                            className="rounded border-coh-gold/50 text-coh-gold focus:ring-coh-gold w-4 h-4 cursor-pointer"
                          />
                        </div>

                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-coh-gold/20 text-coh-navy-light">
                              {src.type}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                              src.status === 'Active' ? 'bg-green-50 text-green-700' :
                              src.status === 'Archived' ? 'bg-gray-100 text-gray-700' :
                              'bg-amber-50 text-amber-700'
                            }`}>
                              {src.status}
                            </span>
                            {src.role && (
                              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border border-coh-navy/20 text-coh-navy/70">
                                {src.role}
                              </span>
                            )}
                            {src.supportsOperatingCoreSection && src.supportsOperatingCoreSection !== 'None' && (
                              <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-coh-gold text-coh-navy">
                                Supports: {src.supportsOperatingCoreSection}
                              </span>
                            )}
                          </div>

                          <h4 className="font-serif text-base font-semibold text-coh-navy">{src.title}</h4>
                          <p className="text-xs text-coh-navy/60 leading-relaxed">{src.notes}</p>

                          <details className="text-[10px] text-coh-navy/40 cursor-pointer pt-1">
                            <summary className="hover:text-coh-gold transition">Show Full Text</summary>
                            <pre className="mt-2 p-3 bg-coh-cream/50 rounded border border-coh-gold/10 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] max-h-48">
                              {src.content}
                            </pre>
                            {src.url && (
                              <div className="mt-2 text-coh-gold">
                                <a href={src.url} target="_blank" rel="noreferrer" className="hover:underline break-all">🔗 {src.url}</a>
                              </div>
                            )}
                          </details>

                          <div className="pt-2">
                            <button
                              onClick={() => alert("This source can inform the Operating Core. Review the material, extract the relevant insight, and manually add it to the correct Operating Core section.")}
                              className="text-[9px] font-semibold text-coh-navy/50 hover:text-coh-gold transition uppercase tracking-wider"
                            >
                              Use to update Operating Core →
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <button
                            onClick={() => handleEditSource(src)}
                            className="text-coh-navy hover:text-coh-gold p-1 hover:bg-coh-cream rounded transition text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSource(src.id)}
                            className="text-red-800/60 hover:text-red-800 p-1 hover:bg-red-50 rounded transition text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Operating Core Info Card */}
                <div className="space-y-3 bg-coh-cream/50 p-6 border border-coh-gold/20 rounded shadow-sm text-center">
                  <div className="pb-2">
                    <h3 className="font-serif text-lg text-coh-navy font-bold">Operating Core</h3>
                    <p className="text-xs text-coh-navy/70 mt-2 max-w-md mx-auto leading-relaxed">
                      Always-on strategy and content rules are now managed in Operating Core. Knowledge Library is strictly for raw materials, references, links, notes, documents, and selectable sources.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('operating-core')}
                    className="mt-2 bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-6 rounded transition border border-coh-gold/20 text-xs font-semibold"
                  >
                    Open Operating Core
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- TAB 6: SETTINGS / COH BRAIN --- */}
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fadeIn max-w-4xl">
            <div className="border-b border-coh-gold/20 pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy">Settings</h2>
              <p className="text-sm text-coh-navy/60 font-sans mt-1">
                Configure AI provider, generation mode, and content rules.
              </p>
            </div>

            {/* Section Nav */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                {([['ai', 'AI Connection'], ['content_rules', 'Content Rules']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSettingsSection(key)}
                    className={`px-4 py-1.5 rounded text-sm font-semibold transition ${settingsSection === key ? 'bg-coh-navy text-coh-cream' : 'bg-coh-cream border border-coh-gold/20 text-coh-navy hover:bg-coh-gold/10'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!authBypass && (
                <button
                  onClick={handleLogout}
                  className="bg-red-800/10 hover:bg-red-800/20 text-red-800 border border-red-800/20 px-3 py-1.5 rounded text-xs font-semibold transition"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* ── AI Connection ─────────────────────────────────────── */}
            {settingsSection === 'ai' && (
              <div className="space-y-6">


                {/* Status Badge */}
                <div className="flex items-center gap-3 bg-coh-cream border border-coh-gold/20 p-4 rounded">
                  <span className={`w-3 h-3 rounded-full ${aiStatus === 'connected' ? (settingsKeyDirty ? 'bg-yellow-500' : 'bg-green-500') : aiStatus === 'error' ? 'bg-red-500' : aiStatus === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-coh-navy">
                      {aiStatus === 'connected' && !settingsKeyDirty ? 'AI Generation Active' :
                       aiStatus === 'connected' && settingsKeyDirty ? 'Settings Changed' :
                       aiStatus === 'testing' ? 'Testing Connection...' :
                       aiStatus === 'error' ? 'Connection Error' :
                       settingsTestPassed ? 'Connection Verified' :
                       aiStatus === 'needs_retest' ? 'Needs Retest' :
                       'AI Not Connected — Prototype Mode'}
                    </span>
                    {(aiProvider || settingsProvider) && (
                      <div className="text-xs text-coh-navy/60 mt-1 space-y-0.5">
                        <span className="block">Provider: <span className="font-semibold">{aiStatus === 'connected' && !settingsKeyDirty ? aiProvider : settingsProvider}</span></span>
                        <span className="block">Text model: <span className="font-semibold">{aiStatus === 'connected' && !settingsKeyDirty ? aiTextModel : (settingsTextModel || 'N/A')}</span></span>
                        <span className="block">Image model: <span className="font-semibold">{aiStatus === 'connected' && !settingsKeyDirty ? (aiImageModel || 'N/A') : (settingsImageModel || 'N/A')}</span></span>
                      </div>
                    )}
                    {aiLastTested && <span className="text-xs text-coh-navy/40 block mt-1">Last tested: {aiLastTested}</span>}
                    {aiLastError && <span className="text-xs text-red-600 block mt-0.5">{aiLastError}</span>}
                    {aiLatency > 0 && aiStatus === 'connected' && !settingsKeyDirty && <span className="text-xs text-green-700 block">Latency: {aiLatency}ms</span>}
                    
                    {/* Status Helper Message */}
                    <span className="text-xs font-semibold text-coh-navy/70 block mt-2">
                      {aiStatus === 'connected' && !settingsKeyDirty ? 'Text and image generation are active.' :
                       aiStatus === 'connected' && settingsKeyDirty ? 'Test the updated configuration before saving.' :
                       settingsTestPassed ? 'Save settings to activate this configuration.' :
                       'Configure and test connection to activate.'}
                    </span>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm space-y-5">
                  <h3 className="font-serif text-lg text-coh-navy font-semibold">Configure AI Provider</h3>
                  
                  {/* Provider */}
                  <div>
                    <label className="block text-sm font-semibold text-coh-navy mb-1">AI Provider</label>
                    <select
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
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-sm"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="mistral">Mistral</option>
                      <option value="openrouter">OpenRouter / OpenAI-Compatible</option>
                    </select>
                  </div>

                  {/* Base URL (OpenRouter / Custom only) */}
                  {(settingsProvider === 'openrouter') && (
                    <div>
                      <label className="block text-sm font-semibold text-coh-navy mb-1">Base URL</label>
                      <input
                        type="text"
                        value={settingsBaseUrl}
                        onChange={(e) => { setSettingsBaseUrl(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); }}
                        placeholder="https://openrouter.ai/api/v1"
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-sm font-mono"
                      />
                    </div>
                  )}

                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-semibold text-coh-navy mb-1">API Key</label>
                    <input
                      type="password"
                      value={settingsApiKey}
                      onChange={(e) => { setSettingsApiKey(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); setSettingsTestResult(''); }}
                      placeholder={MODEL_REGISTRY.find(m => m.provider === settingsProvider)?.provider === 'openai' ? 'sk-proj-...' : 'Enter API key'}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-sm font-mono"
                      autoComplete="off"
                    />
                    <p className="text-xs text-coh-navy/60 font-semibold bg-coh-cream/40 p-2 mt-2 border border-coh-gold/10 rounded">
                      API keys are configured securely via backend or deployment environment variables. They are not exposed in the browser.
                    </p>
                  </div>

                  <hr className="border-coh-gold/10" />

                  {/* Text Model */}
                  <div>
                    <label className="block text-sm font-semibold text-coh-navy mb-1">Text Generation Model</label>
                    <select
                      value={settingsTextModel}
                      onChange={(e) => { setSettingsTextModel(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); }}
                      disabled={!settingsProvider}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-sm font-mono disabled:opacity-50"
                    >
                      {!settingsTextModel && <option value="">Select a model</option>}
                      {MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'text').map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-coh-navy/50 mt-1 mb-2">Controls written outputs such as drafts, ideas, revisions, and prompts.</p>
                    
                    {settingsTextModel && MODEL_REGISTRY.find(m => m.id === settingsTextModel) && (
                      <div className="mt-2 text-xs text-coh-navy/70 bg-coh-navy/5 p-2 rounded flex flex-wrap gap-x-4 gap-y-1">
                        <span><strong className="text-coh-navy">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.quality}</span>
                        <span><strong className="text-coh-navy">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.speed}</span>
                        <span className="w-full"><strong className="text-coh-navy">Best for:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.bestUseCase}</span>
                      </div>
                    )}
                  </div>

                  {/* Image Model */}
                  {(settingsProvider === 'openai' || settingsProvider === 'openrouter') && (
                    <div>
                      <label className="block text-sm font-semibold text-coh-navy mb-1">Image Generation Model</label>
                      <select
                        value={settingsImageModel}
                        onChange={(e) => { setSettingsImageModel(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); }}
                        disabled={!settingsProvider}
                        className="w-full bg-coh-cream border border-coh-gold/20 p-2 rounded text-coh-navy text-sm font-mono disabled:opacity-50"
                      >
                        {!settingsImageModel && <option value="">Select a model</option>}
                        {MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'image').map(m => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-coh-navy/50 mt-1 mb-2">
                        Controls Visual Studio image generation. Image quality depends heavily on the selected model.
                        {settingsImageModel === 'gpt-image-2' && <span className="block text-green-700 font-semibold mt-0.5">Recommended for highest visual quality.</span>}
                        {settingsImageModel === 'dall-e-3' && <span className="block text-amber-600 font-semibold mt-0.5">Legacy fallback. May produce less refined visuals than GPT Image models.</span>}
                      </p>
                      
                      {settingsImageModel && MODEL_REGISTRY.find(m => m.id === settingsImageModel) && (
                        <div className="mt-2 text-xs text-coh-navy/70 bg-coh-navy/5 p-2 rounded flex flex-wrap gap-x-4 gap-y-1">
                          <span><strong className="text-coh-navy">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.quality}</span>
                          <span><strong className="text-coh-navy">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.speed}</span>
                          <span className="w-full"><strong className="text-coh-navy">Best for:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.bestUseCase}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <hr className="border-coh-gold/10" />

                  {/* Test Connection */}
                  <div className="pb-3">
                    <p className="text-sm font-semibold text-coh-navy mb-3">
                      Choose provider and models, then test the connection before saving.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={settingsTestCooldown > 0 || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)}
                        onClick={async () => {
                          setSettingsTesting(true);
                          // Only set testing status if not currently handling a rate limit warning
                          if (aiStatus !== 'error') setAiStatus('testing');
                          
                          setSettingsTestResult('');
                          setSettingsTestPassed(null);
                          try {
                            const result = await aiService.testConnection(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey, settingsBaseUrl || undefined);
                            if (result.connected) {
                              setSettingsTestPassed(true);
                              setSettingsTestResult(`Connection verified. You can now save these settings. (Latency: ${result.latency}ms)`);
                              setAiLastTested(new Date().toLocaleString());
                              setAiLatency(result.latency);
                              setAiStatus('not_connected');
                            } else {
                              setSettingsTestPassed(false);
                              const errMsg = result.error || 'Provider connection failed. Check the API key or provider configuration.';
                              setSettingsTestResult(errMsg);
                              
                              if (errMsg.includes('Rate limit reached')) {
                                setSettingsTestCooldown(30); // 30 second cooldown
                                // Do not overwrite aiStatus if it was a temporary rate limit
                                // This prevents disconnecting a previously working setup
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
                        className="bg-coh-navy text-coh-cream px-4 py-2 rounded text-sm font-semibold hover:bg-coh-navy/80 disabled:opacity-40 transition"
                      >
                        {settingsTesting ? 'Testing...' : (settingsTestCooldown > 0 ? `Wait ${settingsTestCooldown}s` : 'Test Connection')}
                      </button>

                      <div className="flex flex-col justify-center">
                        {settingsTestResult && (
                          <span className={`text-sm font-semibold ${settingsTestPassed ? 'text-green-700' : 'text-red-600'}`}>
                            {settingsTestPassed ? '✓ ' : '✗ '}{settingsTestResult}
                          </span>
                        )}

                        {(!settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)) && (
                          <span className="text-xs text-red-500 font-semibold mt-1">
                            Select provider, text model, and image model before testing.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Apply Provider */}
                  <button
                    disabled={settingsTestPassed !== true || settingsApplying || (!settingsKeyDirty && aiStatus === 'connected')}
                    onClick={async () => {
                      setSettingsApplying(true);
                      try {
                        await aiService.applyProvider(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey, settingsBaseUrl || undefined, aiLastTested);
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
                    className={`w-full text-white px-4 py-2.5 rounded text-sm font-semibold transition ${(!settingsKeyDirty && aiStatus === 'connected') ? 'bg-green-600 hover:bg-green-600' : 'bg-green-700 hover:bg-green-800 disabled:opacity-40'}`}
                  >
                    {settingsApplying ? 'Saving...' 
                    : (!settingsKeyDirty && aiStatus === 'connected') ? 'Settings Saved'
                    : settingsKeyDirty && settingsTestPassed !== true ? 'Test Connection First' 
                    : (!settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)) ? 'Select models before saving.'
                    : aiStatus === 'connected' ? 'Update AI Settings'
                    : 'Save AI Settings'}
                  </button>


                  {/* Generation Mode */}
                  <div className="pt-4 border-t border-coh-gold/15 space-y-2">
                    <h4 className="font-semibold text-sm text-coh-navy">Generation Mode</h4>
                    <p className="text-xs text-coh-navy/60">Controls what runs when you click Generate Drafts.</p>
                    <div className="flex flex-col gap-2">
                      {([
                        ['ai', 'AI Generation', 'Use the connected AI provider to generate real content.'],
                        ['prompt_builder', 'Prompt Builder Fallback', 'Show a copyable AI prompt instead of generating directly. Use when no API key is available.'],
                        ['prototype', 'Prototype Structure Only', 'Show template structure as a starting frame. Not final copy.'],
                      ] as const).map(([val, title, desc]) => (
                        <label key={val} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${generationMode === val ? 'border-coh-navy bg-coh-cream' : 'border-coh-gold/20 hover:bg-coh-cream/60'}`}>
                          <input type="radio" name="genMode" value={val} checked={generationMode === val} onChange={() => setGenerationMode(val)} className="mt-0.5" />
                          <div>
                            <span className="font-semibold text-sm text-coh-navy block">{title}</span>
                            <span className="text-xs text-coh-navy/60">{desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* .env instructions */}
                  <div className="pt-4 border-t border-coh-gold/15 text-xs text-coh-navy/55 space-y-2">
                    <p className="font-semibold text-coh-navy text-xs">Persistent Setup via .env (Recommended for development)</p>
                    <p>Add your key to <code className="bg-coh-cream px-1 rounded">.env</code> and restart the server. The key will be loaded automatically.</p>
                    <pre className="bg-coh-cream p-2 rounded text-[10px] font-mono overflow-x-auto">
{`# Example .env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1`}
                    </pre>
                    <p className="text-[10px] text-coh-navy/40">The .env file is git-ignored and stays local. Never commit API keys.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Content Rules ─────────────────────────────────────── */}
            {settingsSection === 'content_rules' && (
              <div className="bg-white border border-coh-gold/20 p-6 rounded shadow-sm space-y-6">
                <div className="border-b border-coh-gold/15 pb-2">
                  <h3 className="font-serif text-lg text-coh-navy font-semibold font-bold">Content Rules</h3>
                  <p className="text-xs text-coh-navy/60 mt-1">
                    Content Rules guide voice, approved facts, channel behavior, output format behavior, audience behavior, claim boundaries, and writing cleanliness.
                    These rules are applied as guardrails during AI generation and prototype output.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  {[
                    { name: 'Approved Facts', desc: 'Soria Moria, The Golden Fountain, The Water Dragon, Roar to the Wind. Climate as lived condition, not campaign theme.', status: approvedFactsLoaded },
                    { name: 'Voice Rules', desc: 'Precise, composed, human, charged copywriting bounds.', status: voiceRulesLoaded },
                    { name: 'Channel Rules', desc: 'Platform character constraints, links context, and layout styles.', status: channelsLoaded },
                    { name: 'Audience Rules', desc: 'Adapts vocabulary, explanations, and CTA focus across key distribution audiences.', status: true },
                    { name: 'Output Format Rules', desc: 'Format-specific length, tone, and structure constraints.', status: true },
                    { name: 'Claim Boundaries', desc: 'Restricts unapproved inventions of locations, dates, sponsors, or project names.', status: true },
                    { name: 'Writing Cleanliness Rules', desc: 'Enforces clean export-safe punctuation. Replaces em dashes, zero-width chars, curly quotes, and formulaic AI formatting.', status: true },
                    { name: 'Approved Examples', desc: 'Grounded copy models for verification against fact boundary.', status: true },
                  ].map(mod => (
                    <div key={mod.name} className="bg-coh-cream p-4 rounded border border-coh-gold/15 flex flex-col justify-between h-36">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-coh-navy font-serif">{mod.name}</span>
                          <span className={`text-[9px] font-mono font-bold ${mod.status ? 'text-green-700' : 'text-red-700'}`}>
                            {mod.status ? 'ACTIVE' : 'MISSING'}
                          </span>
                        </div>
                        <p className="text-[11px] text-coh-navy/60 leading-relaxed">{mod.desc}</p>
                      </div>
                      <span className="text-[9px] text-coh-navy/40 font-mono mt-2 block border-t border-coh-gold/10 pt-1.5">
                        Last Updated: 2026-06-30
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-coh-gold/15 space-y-4">
                  <h4 className="font-serif text-sm font-bold text-coh-navy">Writing Cleanliness</h4>
                  <div className="flex items-center justify-between bg-coh-cream p-4 rounded border border-coh-gold/15 text-xs">
                    <div>
                      <span className="font-bold text-coh-navy block text-xs">Auto-Cleanup (On by default)</span>
                      <span className="text-[11px] text-coh-navy/60 leading-relaxed block mt-1">
                        Automatically cleans em dashes, zero-width characters, and formulaic AI formatting before saving, copying, or exporting drafts.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={writingCleanupOn}
                      onChange={(e) => setWritingCleanupOn(e.target.checked)}
                      className="rounded border-coh-gold text-coh-navy focus:ring-coh-navy w-5 h-5 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-coh-gold/15 text-xs text-coh-navy/55 space-y-4">
                  <button
                    onClick={() => {
                      if (window.confirm("Restore all default COH Knowledge Base sources? This will overwrite your source cache.")) {
                        setSources(DEFAULT_COH_SOURCES.map(s => ({
                          ...s,
                          type: s.title.includes('Facts') ? 'Approved Example' : 'Tone of Voice',
                          status: 'Active' as const,
                          selected: false
                        })) as SourceFile[]);
                        localStorage.removeItem('coh_sources_v11');
                        alert("Default COH content rules reloaded.");
                      }
                    }}
                    className="bg-red-800 text-white hover:bg-red-900 py-2 px-5 rounded transition text-xs font-semibold"
                  >
                    Reset &amp; Reload Default Content Rules
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

    </div>
  );
}

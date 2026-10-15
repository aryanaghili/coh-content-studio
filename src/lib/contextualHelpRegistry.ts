/**
 * Central Contextual Help Registry for COH Content Studio.
 *
 * HELP WRITING STANDARD:
 * - Target roughly fourth-grade reading ease without sounding childish.
 * - Audience: an adult who may know very little about the application.
 * - Use short sentences, ordinary words, direct verbs, and one main idea per sentence.
 * - Keep paragraphs to 1–3 sentences and bullets short.
 * - Preferred verbs: Choose, Create, Open, Save, Check, Add, Change, Review, Continue, Use.
 * - Avoid backend/code jargon ("instantiate", "persist", "orchestrate", "downstream", "configure")
 *   unless genuinely necessary.
 * - Never use AI-generated help text; all definitions and dynamic states are deterministic.
 */

export type HelpPageType =
  | 'dashboard'
  | 'workspace'
  | 'studio'
  | 'library'
  | 'settings'
  | 'admin'
  | 'detail'
  | 'form';

export interface HelpCapabilityItem {
  title: string;
  description?: string;
  /** Optional CSS selector (e.g., [data-guide="..."]) to spotlight when user clicks "Show me" */
  spotlightTarget?: string;
}

export interface HelpStepItem {
  title: string;
  description?: string;
}

export interface HelpJourneyDefinition {
  steps: string[];
  current: string;
  previous?: string;
  next?: string;
}

export interface HelpRuntimeAppState {
  activeRoute: string;
  aiStatus: string;
  aiProvider?: string;
  hasDraftInContentWorkspace?: boolean;
  creationMode?: 'simple' | 'quick' | 'advanced';
  visualInputMode?: 'Manual' | 'Imported';
  hasImportedVisualDirection?: boolean;
  hasVisualPromptInput?: boolean;
  hasRevisionDraft?: boolean;
  hasReframingSource?: boolean;
  savedIdeasCount?: number;
  savedContentCount?: number;
  savedCalendarsCount?: number;
  sourcesCount?: number;
}

export interface ContextualHelpDefinition {
  id: string;
  route: string;
  pageType: HelpPageType;

  title: string;
  shortPurpose: string;

  journey?: HelpJourneyDefinition;

  purpose: string;

  capabilities?: HelpCapabilityItem[];

  gettingStarted?: HelpStepItem[];

  beforeMovingForward?: string[];

  nextSteps?: string[];

  commonMistakes?: string[];

  example?: {
    title?: string;
    content: string;
  };

  /** Matches a route key in WORKSPACE_GUIDES in GuidedTour.tsx */
  guideId?: string;

  /** Deterministic resolver for the "Right now" section based on live application state */
  dynamicStateResolver?: (state: HelpRuntimeAppState) => string | null;
}

export const CONTEXTUAL_HELP_REGISTRY: Record<string, ContextualHelpDefinition> = {
  'command-center': {
    id: 'help-command-center',
    route: 'command-center',
    pageType: 'dashboard',
    title: 'Command Center',
    shortPurpose: 'Start new work, continue recent work, and see what needs attention.',
    journey: {
      steps: ['START', 'CREATE', 'REVIEW', 'SAVE'],
      current: 'START',
      next: 'CREATE'
    },
    purpose:
      'This is the main starting point for Content Studio. It shows your current setup, saved work counts, and quick ways to begin a task.',
    capabilities: [
      {
        title: 'Start writing or planning',
        description: 'Open Content Workspace, Ideation Workspace, or Editorial Calendar right away.',
        spotlightTarget: '[data-guide="command-center-launchers"]'
      },
      {
        title: 'Create visuals',
        description: 'Jump into Visual Studio to build an image from a prompt or visual brief.'
      },
      {
        title: 'Continue recent work',
        description: 'See how many ideas, drafts, calendars, and sources are ready to open.',
        spotlightTarget: '[data-guide="command-center-pipeline"]'
      },
      {
        title: 'Check studio status',
        description: 'See whether AI generation is connected or if you are working in local mode.'
      }
    ],
    gettingStarted: [
      {
        title: 'Choose the type of work you want to do',
        description: 'Click one of the main cards to explore ideas, plan a calendar, write content, or make a visual.'
      },
      {
        title: 'Or open a saved item',
        description: 'Use the library links if you want to finish work you started earlier.'
      }
    ],
    beforeMovingForward: [
      'Check that AI is connected in Settings if your task needs live AI generation.',
      'Check if you already have a saved idea or source you want to use.'
    ],
    nextSteps: [
      'The Studio opens the right workspace for the task you chose.',
      'You can return to Command Center at any time from the left menu.'
    ],
    commonMistakes: [
      'Do not treat the Command Center as a content editor. Use it to start or continue work.'
    ],
    guideId: 'command-center',
    dynamicStateResolver: (state) => {
      if (state.aiStatus !== 'connected') {
        return 'AI generation is not connected right now. You can browse saved work or open Settings to connect an AI provider.';
      }
      return 'AI is connected and ready. Choose a workspace card to start creating or open a library to continue saved work.';
    }
  },

  'ideation-workspace': {
    id: 'help-ideation-workspace',
    route: 'ideation-workspace',
    pageType: 'workspace',
    title: 'Ideation Workspace',
    shortPurpose: 'Explore ideas before you start writing.',
    journey: {
      steps: ['IDEA', 'CONTENT', 'REVISION', 'SAVE'],
      current: 'IDEA',
      next: 'CONTENT'
    },
    purpose:
      'Use this page when you have a question, theme, problem, or rough direction and want useful content ideas.',
    capabilities: [
      {
        title: 'Explore a question or theme',
        description: 'Write a rough topic, tension, or question to turn into clear content angles.',
        spotlightTarget: '[data-guide="ideation-seed-input"]'
      },
      {
        title: 'Choose audience, channel, and language',
        description: 'Narrow the ideas when you already know who you are speaking to and where it will appear.',
        spotlightTarget: '[data-guide="ideation-filters"]'
      },
      {
        title: 'Attach source material',
        description: 'Connect saved sources so the ideas stay grounded in real facts.'
      },
      {
        title: 'Save or develop ideas',
        description: 'Save promising ideas to the Idea Library or send the strongest idea straight to Content Workspace.'
      }
    ],
    gettingStarted: [
      {
        title: 'Write what you want to explore',
        description: 'Enter a question, topic, or situation in the main box on the left.'
      },
      {
        title: 'Use filters only when they help',
        description: 'Leave audience or channel open if you want broader ideas first.'
      },
      {
        title: 'Generate ideas',
        description: 'Click the generate button to see opportunities, evidence checks, and a recommended content brief.'
      }
    ],
    beforeMovingForward: [
      'Check which idea has the strongest point and clearest proof.',
      'Make sure any facts mentioned can be backed up by your sources.'
    ],
    nextSteps: [
      'Save a useful idea to Idea Library so you do not lose it.',
      'Or send the idea directly into Content Workspace to write the full draft.'
    ],
    commonMistakes: [
      'Do not over-filter before you know what you are looking for.',
      'Do not treat a rough idea as final copy before developing it in Content Workspace.'
    ],
    example: {
      title: 'Example exploration',
      content: 'Why does opera help people engage with climate differently from a scientific report or campaign?'
    },
    guideId: 'ideation-workspace',
    dynamicStateResolver: (state) => {
      if (state.aiStatus !== 'connected') {
        return 'AI is not connected. You can still shape your question and attach sources, or connect AI in Settings for live idea generation.';
      }
      return 'Write a question or theme on the left, then generate ideas to review and send into Content Workspace.';
    }
  },

  'editorial-calendar': {
    id: 'help-editorial-calendar',
    route: 'editorial-calendar',
    pageType: 'workspace',
    title: 'Editorial Calendar',
    shortPurpose: 'Plan when and where content should be published.',
    journey: {
      steps: ['IDEA', 'PLAN', 'CREATE', 'PUBLISH'],
      current: 'PLAN',
      previous: 'IDEA',
      next: 'CREATE'
    },
    purpose:
      'Use the calendar to organize planned content across dates, channels, and audiences before you write each piece.',
    capabilities: [
      {
        title: 'Set your planning brief',
        description: 'Choose the month, focus, channels, and posting pace on the left.',
        spotlightTarget: '[data-guide="calendar-controls"]'
      },
      {
        title: 'View and edit planned items',
        description: 'Inspect each calendar slot by week or list and edit its title, hook, or timing.',
        spotlightTarget: '[data-guide="calendar-canvas"]'
      },
      {
        title: 'Regenerate individual slots',
        description: 'Refresh a single week or item without losing the rest of your plan.'
      },
      {
        title: 'Move an item into creation',
        description: 'Send any calendar item into Content Workspace with its channel, audience, and brief ready.',
        spotlightTarget: '[data-guide="calendar-review"]'
      }
    ],
    gettingStarted: [
      {
        title: 'Choose a date range or open an existing item',
        description: 'Set the planning focus on the left or click an item on the calendar to review it.'
      },
      {
        title: 'Review the item details',
        description: 'Check the objective, audience, and channel in the right-hand review panel.'
      }
    ],
    beforeMovingForward: [
      'Check the channel, timing, and purpose for the item you selected.',
      'Check for any unresolved placeholders or missing proof notes.'
    ],
    nextSteps: [
      'Move the item into Content Workspace when it is ready to draft.',
      'Save the calendar plan so you can reopen it later from Calendar Library.'
    ],
    commonMistakes: [
      'Do not publish or draft an item that still contains unresolved placeholder information.'
    ],
    guideId: 'editorial-calendar',
    dynamicStateResolver: (state) => {
      if ((state.savedCalendarsCount ?? 0) > 0) {
        return `You have ${state.savedCalendarsCount} saved calendar plan${state.savedCalendarsCount === 1 ? '' : 's'}. Review an item on the board or send one into Content Workspace.`;
      }
      return 'Set your planning brief on the left to build a schedule, then click any item to inspect or draft it.';
    }
  },

  'content-workspace': {
    id: 'help-content-workspace',
    route: 'content-workspace',
    pageType: 'workspace',
    title: 'Content Workspace',
    shortPurpose: 'Create written content from a message, idea, source, or brief.',
    journey: {
      steps: ['IDEA', 'CONTENT', 'REVISION', 'VISUAL', 'SAVE'],
      current: 'CONTENT',
      previous: 'IDEA',
      next: 'REVISION'
    },
    purpose:
      'Use this workspace to create drafts. You can start with a short sentence or build a complete brief with sources.',
    capabilities: [
      {
        title: 'Choose your creation mode',
        description: 'Switch between Simple, Quick Create, and Advanced Brief inside the creation card.',
        spotlightTarget: '[data-guide="content-mode-selector"]'
      },
      {
        title: 'Use Content Starters',
        description: 'Pre-fill the form with optional templates or example briefs, then edit any field.',
        spotlightTarget: '[data-guide="content-starters"]'
      },
      {
        title: 'Add optional context and sources',
        description: 'Paste notes, upload a file, or attach a saved source to support your facts.',
        spotlightTarget: '[data-guide="content-context"]'
      },
      {
        title: 'Generate and hand off',
        description: 'Create drafts, then send your chosen draft to Revision Studio, Visual Studio, or Content Library.',
        spotlightTarget: '[data-guide="content-generate"]'
      }
    ],
    gettingStarted: [
      {
        title: 'Simple',
        description: 'Tell the Studio what you need and choose a channel. This is the fastest way to start.'
      },
      {
        title: 'Quick Create',
        description: 'Give a little more direction, such as audience and purpose, without building a full brief.'
      },
      {
        title: 'Advanced Brief',
        description: 'Control the full content direction, including format, language, tone, evidence, and production details.'
      }
    ],
    beforeMovingForward: [
      'Check the main message, audience, and channel.',
      'Check that any facts, dates, or quotes are supported by your sources.'
    ],
    nextSteps: [
      'Send the draft to Revision Studio to polish or translate it.',
      'Send the visual direction to Visual Studio to create a matching image.',
      'Approve and save the draft to Content Library.'
    ],
    commonMistakes: [
      'Do not add unsupported facts, names, dates, or claims.',
      'Do not feel forced to fill every Advanced Brief field when Simple mode is enough.'
    ],
    example: {
      title: 'Example request',
      content: 'Write a short LinkedIn update introducing the next Climate Opera Haus event.'
    },
    guideId: 'content-workspace',
    dynamicStateResolver: (state) => {
      if (state.aiStatus !== 'connected') {
        return 'AI generation is not connected. You can prepare the brief, but live AI generation needs setup in Settings.';
      }
      if (state.hasDraftInContentWorkspace) {
        return 'You have generated draft output on the right. Review it, save it to Content Library, or send it to Revision or Visual Studio.';
      }
      const modeName =
        state.creationMode === 'simple'
          ? 'Simple mode'
          : state.creationMode === 'quick'
            ? 'Quick Create mode'
            : 'Advanced Brief mode';
      return `You are in ${modeName}. Describe what you want to create on the left and click Generate Drafts.`;
    }
  },

  'visual-studio': {
    id: 'help-visual-studio',
    route: 'visual-studio',
    pageType: 'studio',
    title: 'Visual Studio',
    shortPurpose: 'Create visuals from a prompt or an existing visual direction.',
    journey: {
      steps: ['CONTENT', 'VISUAL', 'REVIEW', 'DOWNLOAD'],
      current: 'VISUAL',
      previous: 'CONTENT',
      next: 'REVIEW'
    },
    purpose:
      'Use Visual Studio when your content needs an image or visual treatment that matches the Climate Opera Haus style.',
    capabilities: [
      {
        title: 'Manual Prompt or Imported Visual Direction',
        description: 'Write a prompt from scratch or use a visual direction sent from Content Workspace.',
        spotlightTarget: '[data-guide="visual-input-mode"]'
      },
      {
        title: 'Aspect ratio and visual style',
        description: 'Choose the image shape and visual style, such as Editorial Photography or Minimal Graphic.',
        spotlightTarget: '[data-guide="visual-settings"]'
      },
      {
        title: 'Structured Visual Brief',
        description: 'Refine mood, composition, color, key elements, and what to avoid before generating.',
        spotlightTarget: '[data-guide="visual-brief-fields"]'
      },
      {
        title: 'Generate, review, and download',
        description: 'Preview the compiled prompt, generate the image, and download the result.',
        spotlightTarget: '[data-guide="visual-canvas"]'
      }
    ],
    gettingStarted: [
      {
        title: 'Choose your input mode',
        description: 'Select Manual Prompt to write a new idea, or Imported Visual Direction if you sent one from Content Workspace.'
      },
      {
        title: 'Pick your aspect ratio and style',
        description: 'Match the shape to your channel (such as 1:1 for square posts or 16:9 for wide banners).'
      },
      {
        title: 'Generate the visual',
        description: 'Click Generate and review the image on the right.'
      }
    ],
    beforeMovingForward: [
      'Check the visual direction, format, style, and aspect ratio.',
      'Open the Compiled Image Prompt Preview if you want to verify the exact instructions sent to the image model.'
    ],
    nextSteps: [
      'Review the generated image on the right canvas.',
      'Adjust the brief and regenerate if needed, or download the final image.'
    ],
    commonMistakes: [
      'Image models may not reproduce exact typography perfectly.',
      'Do not rely on generated imagery for exact text-heavy layout when accuracy is critical.'
    ],
    guideId: 'visual-studio',
    dynamicStateResolver: (state) => {
      if (state.hasImportedVisualDirection) {
        return 'You are working from an imported visual direction. Review the settings before generating.';
      }
      if (!state.hasVisualPromptInput) {
        return 'Start with a manual prompt or import a visual direction from Content Workspace.';
      }
      return 'Your visual prompt is ready. Check the aspect ratio and style, then click Generate.';
    }
  },

  'revision-studio': {
    id: 'help-revision-studio',
    route: 'revision-studio',
    pageType: 'studio',
    title: 'Revision Studio',
    shortPurpose: 'Improve, translate, or reshape existing text.',
    journey: {
      steps: ['CONTENT', 'REVISION', 'APPROVE', 'SAVE'],
      current: 'REVISION',
      previous: 'CONTENT',
      next: 'APPROVE'
    },
    purpose:
      'Use this page when content already exists and you want to polish the writing, adjust the tone, tighten claims, or translate it.',
    capabilities: [
      {
        title: 'Paste or import a draft',
        description: 'Work on text sent from Content Workspace, opened from Content Library, or pasted directly.',
        spotlightTarget: '[data-guide="revision-editor"]'
      },
      {
        title: 'Set channel, format, language, and tone',
        description: 'Tell the studio what channel and language the revised draft should fit.'
      },
      {
        title: 'Run revision actions',
        description: 'Use guided actions for clean and polish, voice and tone, COH fit, structure, claim discipline, or translation.',
        spotlightTarget: '[data-guide="revision-actions"]'
      },
      {
        title: 'Compare versions and save',
        description: 'Review earlier versions in the history list and save the improved draft to Content Library.',
        spotlightTarget: '[data-guide="revision-history"]'
      }
    ],
    gettingStarted: [
      {
        title: 'Paste or import content',
        description: 'Make sure the text you want to improve is in the main draft box.'
      },
      {
        title: 'Choose a revision action',
        description: 'Click a recommended action or open a tool group such as Clean & Polish or Translation & Localization.'
      }
    ],
    beforeMovingForward: [
      'Check that the revised version still keeps the original meaning and supported facts.',
      'If you translated the draft, make sure AI is connected so the translation is accurate.'
    ],
    nextSteps: [
      'Compare your revised draft against the previous version if needed.',
      'Save the improved version to Content Library or continue to Visual Studio.'
    ],
    commonMistakes: [
      'Revision should improve content, not invent evidence.',
      'Do not run several conflicting tone changes at once without checking the draft in between.'
    ],
    guideId: 'revision-studio',
    dynamicStateResolver: (state) => {
      if (!state.hasRevisionDraft) {
        return 'Add or import content before using revision tools.';
      }
      return 'Your draft is loaded in the editor. Choose a revision action on the right to improve or translate it.';
    }
  },

  'reframing-studio': {
    id: 'help-reframing-studio',
    route: 'reframing-studio',
    pageType: 'studio',
    title: 'Reframing Studio',
    shortPurpose: 'Change how an existing message is framed without changing its core meaning.',
    journey: {
      steps: ['CONTENT', 'REFRAME', 'REVIEW', 'SAVE'],
      current: 'REFRAME',
      previous: 'CONTENT',
      next: 'REVIEW'
    },
    purpose:
      'Use this page when the message is basically right, but you need a different angle for a new audience, channel, or communication goal.',
    capabilities: [
      {
        title: 'Add or import source content',
        description: 'Bring in an existing draft or paste the text you want to reframe.',
        spotlightTarget: '[data-guide="reframing-source"]'
      },
      {
        title: 'Choose the reframing intent and target audience',
        description: 'Pick who the new version is for, which channel it belongs on, and what angle to emphasize.',
        spotlightTarget: '[data-guide="reframing-parameters"]'
      },
      {
        title: 'Protect key facts and quotes',
        description: 'Keep dates, numbers, names, and verbatim quotes locked so the truth of the piece never changes.'
      },
      {
        title: 'Compare framing alternatives',
        description: 'Review the reframed options and send the best one to Revision Studio or save it.',
        spotlightTarget: '[data-guide="reframing-results"]'
      }
    ],
    gettingStarted: [
      {
        title: 'Add or import the source content',
        description: 'Paste your text or load a saved piece into the source box.'
      },
      {
        title: 'Choose the reframing intent',
        description: 'Select the new audience, channel, and framing direction.'
      },
      {
        title: 'Generate reframed options',
        description: 'Run the reframe and review how each option shifts the opening hook and angle.'
      }
    ],
    beforeMovingForward: [
      'Check that the new framing still matches the facts and purpose.',
      'Review any fact-check warnings if a date, number, or protected quote was changed.'
    ],
    nextSteps: [
      'Review the result and continue editing in Revision Studio, or save it as a new item in Content Library.'
    ],
    commonMistakes: [
      'Reframing should not invent facts or distort the original meaning.',
      'If you only want to make text shorter or smoother for the same audience, use Revision Studio instead.'
    ],
    guideId: 'reframing-studio',
    dynamicStateResolver: (state) => {
      if (!state.hasReframingSource) {
        return 'Add or import source content first, then choose the new audience or angle you want to explore.';
      }
      return 'Source content is loaded. Choose your target audience and reframing intent, then generate framing alternatives.';
    }
  },

  'calendar-library': {
    id: 'help-calendar-library',
    route: 'calendar-library',
    pageType: 'library',
    title: 'Calendar Library',
    shortPurpose: 'Find and manage saved calendar content.',
    journey: {
      steps: ['PLAN', 'SAVE', 'REUSE'],
      current: 'SAVE',
      previous: 'PLAN',
      next: 'REUSE'
    },
    purpose:
      'Use this library to find editorial calendar plans and scheduled items that have been saved.',
    capabilities: [
      {
        title: 'Browse saved calendar plans',
        description: 'See your saved monthly or campaign schedules in one list.',
        spotlightTarget: '[data-guide="library-calendar-list"]'
      },
      {
        title: 'Open a calendar in Editorial Calendar',
        description: 'Load any saved plan back into the Editorial Calendar workspace to view or edit its slots.'
      },
      {
        title: 'Export or manage plans',
        description: 'Download saved plans or remove outdated schedules you no longer need.'
      }
    ],
    gettingStarted: [
      {
        title: 'Find the calendar plan you need',
        description: 'Browse the saved plans by title, date range, or focus.'
      },
      {
        title: 'Open an item',
        description: 'Click to load the plan back into Editorial Calendar.'
      }
    ],
    nextSteps: [
      'Open an item to continue planning or move individual calendar slots into Content Workspace.'
    ],
    commonMistakes: [
      'Check which month or campaign version you are opening before replacing an active plan.'
    ],
    guideId: 'calendar-library',
    dynamicStateResolver: (state) => {
      const count = state.savedCalendarsCount ?? 0;
      if (count === 0) {
        return 'No calendar plans are saved yet. Create a plan in Editorial Calendar and save it to see it here.';
      }
      return `You have ${count} saved calendar plan${count === 1 ? '' : 's'}. Select one to reopen it in Editorial Calendar.`;
    }
  },

  'idea-library': {
    id: 'help-idea-library',
    route: 'idea-library',
    pageType: 'library',
    title: 'Idea Library',
    shortPurpose: 'Keep useful ideas so you can use them later.',
    journey: {
      steps: ['IDEA', 'SAVE', 'CONTENT'],
      current: 'SAVE',
      previous: 'IDEA',
      next: 'CONTENT'
    },
    purpose:
      'Use this library to find ideas you already saved from Ideation Workspace.',
    capabilities: [
      {
        title: 'Search and filter saved ideas',
        description: 'Find ideas by keyword, audience, or pillar.',
        spotlightTarget: '[data-guide="library-idea-list"]'
      },
      {
        title: 'Open and review idea details',
        description: 'Read the saved thesis, audience angle, and notes.'
      },
      {
        title: 'Move an idea into Content Workspace',
        description: 'Send any saved idea directly into Content Workspace to turn it into a full draft.'
      }
    ],
    gettingStarted: [
      {
        title: 'Open a saved idea or search for one',
        description: 'Use the search box or browse the cards to find the angle you want.'
      }
    ],
    nextSteps: [
      'Send a useful idea to Content Workspace to write the draft.'
    ],
    commonMistakes: [
      'Check whether you have unsaved text in Content Workspace before overwriting it with a saved idea.'
    ],
    guideId: 'idea-library',
    dynamicStateResolver: (state) => {
      const count = state.savedIdeasCount ?? 0;
      if (count === 0) {
        return 'Your Idea Library is empty right now. Explore topics in Ideation Workspace and save the best ones here.';
      }
      return `You have ${count} saved idea${count === 1 ? '' : 's'}. Open one to review it or send it to Content Workspace.`;
    }
  },

  'content-library': {
    id: 'help-content-library',
    route: 'content-library',
    pageType: 'library',
    title: 'Content Library',
    shortPurpose: 'Find, review, and reuse saved content.',
    journey: {
      steps: ['CREATE', 'REVIEW', 'SAVE', 'REUSE'],
      current: 'SAVE',
      previous: 'REVIEW',
      next: 'REUSE'
    },
    purpose:
      'This is where finished or saved content can be found again, reviewed, exported, or reopened for new work.',
    capabilities: [
      {
        title: 'Search and filter saved content',
        description: 'Filter by channel, workflow status, or keyword to find a specific piece.',
        spotlightTarget: '[data-guide="library-content-list"]'
      },
      {
        title: 'Open in Revision or Reframing Studio',
        description: 'Send a saved piece into Revision Studio to edit it, or into Reframing Studio to adapt it for a new audience.'
      },
      {
        title: 'Send visual direction to Visual Studio',
        description: 'Open the visual direction from a saved piece in Visual Studio.'
      },
      {
        title: 'Duplicate, export, or delete',
        description: 'Make a copy, download the content, or remove items you no longer need.'
      }
    ],
    gettingStarted: [
      {
        title: 'Search or open a content item',
        description: 'Use the search bar or status filters at the top to find the piece you need.'
      }
    ],
    beforeMovingForward: [
      'Check the workflow status (such as Draft, In Review, or Approved) and version number.'
    ],
    nextSteps: [
      'Reuse the item, open it in Revision Studio to polish it, reframe it for another channel, or export it.'
    ],
    commonMistakes: [
      'Check the status and version before reusing old content.'
    ],
    guideId: 'content-library',
    dynamicStateResolver: (state) => {
      const count = state.savedContentCount ?? 0;
      if (count === 0) {
        return 'No saved content items yet. Save a draft from Content Workspace or Revision Studio to store it here.';
      }
      return `You have ${count} saved content item${count === 1 ? '' : 's'}. Search or click any item to review, revise, or reuse it.`;
    }
  },

  'source-library': {
    id: 'help-source-library',
    route: 'source-library',
    pageType: 'library',
    title: 'Source Library',
    shortPurpose: 'Keep source material that can support content creation.',
    journey: {
      steps: ['SOURCE', 'CONTENT', 'CLAIM CHECK'],
      current: 'SOURCE',
      next: 'CONTENT'
    },
    purpose:
      'Use this library to manage factual documents, notes, and references that the Studio can use as source material.',
    capabilities: [
      {
        title: 'Add a new source',
        description: 'Paste text, upload a document, or save a reference note with a clear source type.',
        spotlightTarget: '[data-guide="library-source-list"]'
      },
      {
        title: 'Inspect extracted facts and quotes',
        description: 'Review key facts, verbatim quotes, and proof boundaries found in each source.'
      },
      {
        title: 'Mark sources as selectable for workspaces',
        description: 'Choose which sources can be attached in Ideation, Content Workspace, and Reframing Studio.'
      }
    ],
    gettingStarted: [
      {
        title: 'Add or open a source',
        description: 'Create a new source record or click an existing source in the list to review its contents.'
      }
    ],
    beforeMovingForward: [
      'Make sure the source is relevant and reliable for the claim you want to make.',
      'Check the source role so examples or style references are not mistaken for factual proof.'
    ],
    nextSteps: [
      'Use the source in Content Workspace, Ideation Workspace, or Reframing Studio.'
    ],
    commonMistakes: [
      'Adding a source does not automatically prove every claim.',
      'Do not use an example or visual reference source as proof for hard numbers or dates.'
    ],
    guideId: 'source-library',
    dynamicStateResolver: (state) => {
      const count = state.sourcesCount ?? 0;
      return `You have ${count} source record${count === 1 ? '' : 's'} available. Open a source to check its facts or add a new document.`;
    }
  },

  'operating-core': {
    id: 'help-operating-core',
    route: 'operating-core',
    pageType: 'admin',
    title: 'Operating Core',
    shortPurpose: 'Manage the rules and guidance that shape how the Studio works.',
    journey: {
      steps: ['CORE RULES', 'ALL WORKSPACES'],
      current: 'CORE RULES',
      next: 'ALL WORKSPACES'
    },
    purpose:
      'Operating Core contains the foundational Climate Opera Haus guidance used across every workspace and studio.',
    capabilities: [
      {
        title: 'Review foundational identity and strategy',
        description: 'Inspect the mission, pillars, and non-negotiable COH kernel rules.',
        spotlightTarget: '[data-guide="operating-core-header"]'
      },
      {
        title: 'Manage audience profiles and channel rules',
        description: 'Review or update how the Studio writes for each audience and channel.',
        spotlightTarget: '[data-guide="operating-core-sections"]'
      },
      {
        title: 'Review voice, claim, visual, and revision standards',
        description: 'Check the quality rules that govern tone, evidence, and visual direction.'
      },
      {
        title: 'Save or reset carefully',
        description: 'Save intentional updates or restore the default Operating Core if needed.'
      }
    ],
    gettingStarted: [
      {
        title: 'Open the section you want to review',
        description: 'Use the section tabs to read the current rules for identity, audiences, channels, or claims.'
      }
    ],
    beforeMovingForward: [
      'Understand that changes here affect how future ideas, drafts, revisions, and visuals are created across the whole app.'
    ],
    nextSteps: [
      'Save only intentional changes that should apply to all future work.'
    ],
    commonMistakes: [
      'Do not edit Operating Core casually. This area affects content behavior across every workspace.',
      'If you only want special instructions for one draft, put them in the Content Workspace brief instead.'
    ],
    guideId: 'operating-core',
    dynamicStateResolver: () =>
      'You are viewing system-wide COH rules. Review sections carefully and save only changes meant for all workspaces.'
  },

  settings: {
    id: 'help-settings',
    route: 'settings',
    pageType: 'settings',
    title: 'Settings',
    shortPurpose: 'Control AI connection, models, appearance, and application settings.',
    journey: {
      steps: ['SETUP', 'TEST', 'SAVE', 'USE'],
      current: 'SETUP',
      next: 'TEST'
    },
    purpose:
      'Use Settings to control how the Studio connects to AI providers, which text and image models are used, and how the app looks.',
    capabilities: [
      {
        title: 'Choose AI provider and API key',
        description: 'Select Gemini, OpenAI, or OpenRouter and enter your API key.',
        spotlightTarget: '[data-guide="settings-provider"]'
      },
      {
        title: 'Choose text and image models',
        description: 'Pick which model writes text and which model creates images.',
        spotlightTarget: '[data-guide="settings-models"]'
      },
      {
        title: 'Test and save connection',
        description: 'Verify your key works before activating live AI generation.',
        spotlightTarget: '[data-guide="settings-test"]'
      },
      {
        title: 'Generation mode override and theme',
        description: 'Switch between live AI, Prompt Builder fallback, or Prototype mode, and toggle Light or Dark appearance.',
        spotlightTarget: '[data-guide="settings-mode"]'
      }
    ],
    gettingStarted: [
      {
        title: 'Select your provider and enter your API key',
        description: 'Choose the AI service you have an active key for in Step 1.'
      },
      {
        title: 'Pick your text and image models',
        description: 'Select a recommended model in Step 2.'
      },
      {
        title: 'Test and save',
        description: 'Click Test Connection in Step 3, then click Save and Activate AI Generation.'
      }
    ],
    beforeMovingForward: [
      'Test the connection first so you know your key and selected model work.',
      'Click Save and Activate AI Generation so your changes take effect.'
    ],
    nextSteps: [
      'Return to a workspace such as Content Workspace or Visual Studio and generate content.'
    ],
    commonMistakes: [
      'Never expose or share your private API keys publicly.',
      'If you see a rate limit or quota message, wait a moment or check that your provider account has available usage credit.'
    ],
    guideId: 'settings',
    dynamicStateResolver: (state) => {
      if (state.aiStatus === 'connected') {
        return `AI is connected and ready${state.aiProvider ? ` (${state.aiProvider})` : ''}.`;
      }
      if (state.aiStatus === 'error') {
        return 'The last connection check reported an error. Check your API key and selected model, then test the connection again.';
      }
      return 'AI is not connected right now. Select a provider, enter your API key, test the connection, and save.';
    }
  }
};

export function getContextualHelpForRoute(route: string): ContextualHelpDefinition {
  return CONTEXTUAL_HELP_REGISTRY[route] || CONTEXTUAL_HELP_REGISTRY['command-center'];
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft, HelpCircle, Compass } from 'lucide-react';

export interface TourStep {
  target: string;
  title: string;
  description: string;
}

export interface WorkspaceGuideDefinition {
  route: string;
  title: string;
  steps: TourStep[];
}

interface GuidedTourProps {
  activeRoute?: string;
  onNavigateRoute?: (route: string) => void;
}

const APP_TOUR_STEPS: TourStep[] = [
  { target: '', title: '', description: '' },
  {
    target: '#nav-command-center',
    title: 'Command Center',
    description: 'Your operational overview. Check AI status, active pipeline counts, and launch directly into any studio workflow.'
  },
  {
    target: '#nav-ideation',
    title: 'Ideation Workspace',
    description: 'Explore themes, tensions, and source materials to generate strategic communication opportunities and briefs.'
  },
  {
    target: '#nav-editorial',
    title: 'Editorial Calendar',
    description: 'Plan and sequence multi-channel editorial cycles with monthly arcs and quality review.'
  },
  {
    target: '#nav-content',
    title: 'Content Workspace',
    description: 'Turn ideas or briefs into full channel-ready drafts using Simple, Quick Create, or Advanced Brief modes.'
  },
  {
    target: '#nav-visual',
    title: 'Visual Studio',
    description: 'Transform structured visual directions or manual prompts into cohesive, on-brand imagery.'
  },
  {
    target: '#nav-revision',
    title: 'Revision Studio',
    description: 'Refine, translate, or adapt existing drafts while preserving version history and governance.'
  },
  {
    target: '#nav-reframing',
    title: 'Reframing Studio',
    description: 'Reposition existing content for a new audience, institutional lens, or strategic angle.'
  }
];

export const WORKSPACE_GUIDES: Record<string, WorkspaceGuideDefinition> = {
  'command-center': {
    route: 'command-center',
    title: 'Command Center',
    steps: [
      {
        target: '[data-guide="command-center-launchers"]',
        title: 'Launch your core workflow',
        description: 'Jump directly into Ideation, Content Workspace, Editorial Calendar, or Visual Studio from the primary action cards.'
      },
      {
        target: '[data-guide="command-center-pipeline"]',
        title: 'Monitor studio pipeline & libraries',
        description: 'Review saved drafts, active ideas, and grounded sources across the studio at a glance.'
      }
    ]
  },
  'content-workspace': {
    route: 'content-workspace',
    title: 'Content Workspace',
    steps: [
      {
        target: '[data-guide="content-mode-selector"]',
        title: 'Choose how much control you need',
        description: 'Simple is fastest—tell us what you need and choose a channel. Quick Create adds light direction, while Advanced Brief gives you complete control over audience, intent, format, language, tone, and evidence.'
      },
      {
        target: '[data-guide="content-starters"]',
        title: 'Start from scratch or use a Content Starter',
        description: 'Optional Content Starters populate the form with proven COH structures or examples. Every field remains editable after applying a starter.'
      },
      {
        target: '[data-guide="content-context"]',
        title: 'Add optional source/context material',
        description: 'Ground your draft in verifiable notes, files, or Source Library records so claims stay accurate and traceable.'
      },
      {
        target: '[data-guide="content-generate"]',
        title: 'Generate your draft and continue downstream',
        description: 'Generate channel-ready copy and visual direction, then send your draft directly into Revision Studio, Reframing Studio, or Visual Studio.'
      }
    ]
  },
  'ideation-workspace': {
    route: 'ideation-workspace',
    title: 'Ideation Workspace',
    steps: [
      {
        target: '[data-guide="ideation-seed-input"]',
        title: 'Describe the question, theme, tension or opportunity',
        description: 'Enter a situation, strategic question, or source angle you want to explore.'
      },
      {
        target: '[data-guide="ideation-filters"]',
        title: 'Use optional filters only when they materially help',
        description: 'Narrow by target audience, channel, or language when you already know the destination—or leave open for broader exploration.'
      },
      {
        target: '[data-guide="ideation-generate"]',
        title: 'Generate strategic opportunities',
        description: 'The studio evaluates communication opportunities, evidence checks, and reuse checks grounded in the Operating Core.'
      },
      {
        target: '[data-guide="ideation-results"]',
        title: 'Save an idea or develop it directly in Content Workspace',
        description: 'Save promising angles to the Idea Library or send any opportunity straight into Content Workspace with its brief pre-populated.'
      }
    ]
  },
  'editorial-calendar': {
    route: 'editorial-calendar',
    title: 'Editorial Calendar',
    steps: [
      {
        target: '[data-guide="calendar-parameters"]',
        title: 'Configure calendar brief & monthly context',
        description: 'Set your planning month, publishing intensity, primary strategic focus, target audiences, and active channels.'
      },
      {
        target: '[data-guide="calendar-generate"]',
        title: 'Generate or selectively regenerate the schedule',
        description: 'Generate a full monthly arc or regenerate specific weeks, channels, or weak items while preserving approved entries.'
      },
      {
        target: '[data-guide="calendar-canvas"]',
        title: 'Inspect, edit, and hand off items to Content Workspace',
        description: 'Click any scheduled item to edit its thesis, evidence basis, or visual direction, then click "Approve & Create Draft" to move it into Content Workspace.'
      },
      {
        target: '[data-guide="calendar-review"]',
        title: 'Check strategic balance and risks',
        description: 'Review automated diagnostics on channel mix, source readiness, and focus alignment before saving your calendar.'
      }
    ]
  },
  'visual-studio': {
    route: 'visual-studio',
    title: 'Visual Studio',
    steps: [
      {
        target: '[data-guide="visual-source-mode"]',
        title: 'Manual Prompt vs Imported Visual Direction',
        description: 'Start from a manual prompt or import a structured Visual Direction directly from Content Workspace or Content Library.'
      },
      {
        target: '[data-guide="visual-settings"]',
        title: 'Configure format, aspect ratio & visual style',
        description: 'Select the destination format preset (16:9 hero, 1:1 square, 4:5 portrait, 9:16 vertical) and artistic style profile.'
      },
      {
        target: '[data-guide="visual-structured-brief"]',
        title: 'Refine the Structured Visual Brief',
        description: 'Edit subject, mood, color/material palette, composition, and exclusions—and inspect the live compiled prompt preview before generating.'
      },
      {
        target: '[data-guide="visual-generate"]',
        title: 'Generate, regenerate, and review visual output',
        description: 'Generate the visual asset, compare iterations on the canvas, and export or copy the compiled prompt.'
      }
    ]
  },
  'revision-studio': {
    route: 'revision-studio',
    title: 'Revision Studio',
    steps: [
      {
        target: '[data-guide="revision-draft-editor"]',
        title: 'Paste or import your draft',
        description: 'Work with a draft carried over from Content Workspace or Content Library, or paste any text directly into the editor.'
      },
      {
        target: '[data-guide="revision-recipe-panel"]',
        title: 'Select revision actions or custom instructions',
        description: 'Combine suggested editorial improvements or describe the exact structural or stylistic change you want.'
      },
      {
        target: '[data-guide="revision-controls"]',
        title: 'Adjust channel, format, language, and tone context',
        description: 'Open advanced revision controls to adapt the draft for a specific channel, output format, tone, or target language.'
      }
    ]
  },
  'reframing-studio': {
    route: 'reframing-studio',
    title: 'Reframing Studio',
    steps: [
      {
        target: '[data-guide="reframing-source"]',
        title: 'Provide source content to reframe',
        description: 'Import an existing draft or source text, or paste material that needs a fresh perspective.'
      },
      {
        target: '[data-guide="reframing-intent"]',
        title: 'Choose your reframing intent',
        description: 'Select how the perspective should shift—such as moving from event announcement to institutional proof or myth-to-reality framing.'
      },
      {
        target: '[data-guide="reframing-parameters"]',
        title: 'Set target audience, channel, and voice parameters',
        description: 'Specify who the reframed piece is for and generate distinct framing alternatives to compare or send to Content Workspace.'
      }
    ]
  },
  'calendar-library': {
    route: 'calendar-library',
    title: 'Calendar Library',
    steps: [
      {
        target: '[data-guide="calendar-library-header"]',
        title: 'Manage saved editorial calendars',
        description: 'Track versioned monthly schedules and planning cycles across the studio.'
      },
      {
        target: '[data-guide="calendar-library-grid"]',
        title: 'Open, duplicate, or export calendars',
        description: 'Reopen any saved calendar in Editorial Calendar Studio to continue editing, duplicate a version, or export CSV/Excel sheets.'
      }
    ]
  },
  'idea-library': {
    route: 'idea-library',
    title: 'Idea Library',
    steps: [
      {
        target: '[data-guide="idea-library-header"]',
        title: 'Browse and filter saved strategic ideas',
        description: 'Find saved communication opportunities by status, strategic pillar, or keyword.'
      },
      {
        target: '[data-guide="idea-library-list"]',
        title: 'Develop an idea in Content Workspace',
        description: 'Open any saved idea to review its angle and evidence, then send it directly into Content Workspace to draft.'
      }
    ]
  },
  'content-library': {
    route: 'content-library',
    title: 'Content Library',
    steps: [
      {
        target: '[data-guide="content-library-filters"]',
        title: 'Find saved drafts and approved copy',
        description: 'Search and filter your saved content by channel, approval status, or strategic pillar.'
      },
      {
        target: '[data-guide="content-library-grid"]',
        title: 'Continue work in Revision, Reframing, or Visual Studio',
        description: 'Update status, copy text, or send any saved piece directly into Revision Studio, Reframing Studio, or Visual Studio.'
      }
    ]
  },
  'source-library': {
    route: 'source-library',
    title: 'Source Library',
    steps: [
      {
        target: '[data-guide="source-library-add"]',
        title: 'Add verifiable sources and reference material',
        description: 'Upload documents or save notes, partner profiles, and links so they can ground generation across workspaces.'
      },
      {
        target: '[data-guide="source-library-list"]',
        title: 'Select sources for active tasks',
        description: 'Check sources to include them in your active generation context, analyze key facts, or launch directly into Ideation or Content creation.'
      }
    ]
  },
  'operating-core': {
    route: 'operating-core',
    title: 'Operating Core',
    steps: [
      {
        target: '[data-guide="operating-core-lock"], [data-guide="operating-core-header"]',
        title: 'Foundational system governance',
        description: 'Operating Core defines the strategic kernel, voice laws, claim boundaries, and visual DNA that govern every workspace in the studio.'
      },
      {
        target: '[data-guide="operating-core-nav"], [data-guide="operating-core-lock"]',
        title: 'Edit deliberately—changes affect all downstream generation',
        description: 'Because every workspace compiles instructions from these rules, treat Operating Core as protected institutional architecture rather than task-level notes.'
      }
    ]
  },
  'settings': {
    route: 'settings',
    title: 'Settings',
    steps: [
      {
        target: '[data-guide="settings-provider"]',
        title: 'Configure AI provider & API connection',
        description: 'Select your AI provider and enter your API key. Keys are verified and stored via the backend.'
      },
      {
        target: '[data-guide="settings-models"]',
        title: 'Choose text and image models',
        description: 'Pick the specific text generation model and Visual Studio image generation model for your workflow.'
      },
      {
        target: '[data-guide="settings-test"]',
        title: 'Test & save connection state',
        description: 'Run a live connection check to verify latency and model access before saving your configuration.'
      },
      {
        target: '[data-guide="settings-mode"]',
        title: 'Generation mode & theme controls',
        description: 'Switch between live AI Generation, Prompt Builder fallback, or Prototype mode—and toggle dark or light theme anytime from the top bar.'
      }
    ]
  }
};

export const GuidedTour: React.FC<GuidedTourProps> = ({ activeRoute = 'command-center' }) => {
  const [tourMode, setTourMode] = useState<'app' | 'workspace'>('workspace');
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [showCoachmark, setShowCoachmark] = useState(false);

  const currentWorkspaceGuide = useMemo(() => {
    return WORKSPACE_GUIDES[activeRoute] || WORKSPACE_GUIDES['command-center'];
  }, [activeRoute]);

  const getAvailableWorkspaceSteps = useCallback((guide: WorkspaceGuideDefinition): TourStep[] => {
    if (typeof document === 'undefined') return guide.steps;
    const matched = guide.steps.filter(step => {
      if (!step.target) return false;
      const el = document.querySelector(step.target);
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return matched.length > 0 ? matched : guide.steps;
  }, []);

  const [resolvedWorkspaceSteps, setResolvedWorkspaceSteps] = useState<TourStep[]>(currentWorkspaceGuide.steps);

  // Initialize App Tour based on legacy localStorage key (preserves existing behavior)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('coh-tour-completed');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setTourMode('app');
        setCurrentStep(0);
        setIsVisible(true);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, []);

  // Close active tour overlay when navigating to a different route so overlays never get stuck
  useEffect(() => {
    setIsVisible(false);
    setTargetRect(null);

    const workspaceStorageKey = `coh-guide-v2-${activeRoute}`;
    const autoHideAll = localStorage.getItem('coh-guide-v2-autohide') === 'true';
    const hasSeenWorkspace = localStorage.getItem(workspaceStorageKey) === 'true';

    if (!autoHideAll && !hasSeenWorkspace && WORKSPACE_GUIDES[activeRoute]) {
      setShowCoachmark(true);
    } else {
      setShowCoachmark(false);
    }
  }, [activeRoute]);

  const startWorkspaceTour = useCallback(() => {
    const steps = getAvailableWorkspaceSteps(currentWorkspaceGuide);
    setResolvedWorkspaceSteps(steps);
    setTourMode('workspace');
    setCurrentStep(0);
    setShowCoachmark(false);
    setIsVisible(true);
    localStorage.setItem(`coh-guide-v2-${activeRoute}`, 'true');
  }, [activeRoute, currentWorkspaceGuide, getAvailableWorkspaceSteps]);

  const startAppTour = useCallback(() => {
    setTourMode('app');
    setCurrentStep(0);
    setShowCoachmark(false);
    setIsVisible(true);
  }, []);

  // Listen for custom event from TopBar "? Guide" button or Contextual Help "Show Me Around" / "Show me"
  useEffect(() => {
    const handleOpenGuide = (evt: Event) => {
      const customEvt = evt as CustomEvent<{ mode?: 'app' | 'workspace'; targetSelector?: string }>;
      if (customEvt.detail?.mode === 'app') {
        startAppTour();
      } else if (customEvt.detail?.targetSelector) {
        const selector = customEvt.detail.targetSelector;
        const steps = getAvailableWorkspaceSteps(currentWorkspaceGuide);
        const matchIdx = steps.findIndex(s => s.target === selector);
        if (matchIdx >= 0) {
          setResolvedWorkspaceSteps(steps);
          setTourMode('workspace');
          setCurrentStep(matchIdx);
          setShowCoachmark(false);
          setIsVisible(true);
        } else {
          startWorkspaceTour();
        }
      } else {
        startWorkspaceTour();
      }
    };
    window.addEventListener('coh:open-guide', handleOpenGuide);
    return () => window.removeEventListener('coh:open-guide', handleOpenGuide);
  }, [startAppTour, startWorkspaceTour, currentWorkspaceGuide, getAvailableWorkspaceSteps]);

  const closeTour = useCallback(() => {
    if (tourMode === 'app') {
      localStorage.setItem('coh-tour-completed', 'true');
    } else {
      localStorage.setItem(`coh-guide-v2-${activeRoute}`, 'true');
    }
    setIsVisible(false);
    setCurrentStep(0);
    setTargetRect(null);
  }, [tourMode, activeRoute]);

  // Support Escape key to dismiss tour or coachmark
  useEffect(() => {
    if (!isVisible && !showCoachmark) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isVisible) {
          closeTour();
        } else if (showCoachmark) {
          setShowCoachmark(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, showCoachmark, closeTour]);

  const activeSteps = tourMode === 'app' ? APP_TOUR_STEPS : resolvedWorkspaceSteps;
  const activeStepObj = activeSteps[currentStep];

  // Scroll target into view when step changes
  useEffect(() => {
    if (!isVisible || !activeStepObj || !activeStepObj.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(activeStepObj.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      const inViewport = rect.top >= 60 && rect.bottom <= window.innerHeight - 60;
      if (!inViewport && typeof el.scrollIntoView === 'function') {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, [isVisible, currentStep, activeStepObj]);

  // Track the target element's position dynamically
  const updateRect = useCallback(() => {
    if (!isVisible || !activeStepObj || !activeStepObj.target) {
      setTargetRect(null);
      return;
    }
    const el = document.querySelector(activeStepObj.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    } else {
      setTargetRect(null);
    }
  }, [isVisible, activeStepObj]);

  useEffect(() => {
    if (isVisible) {
      updateRect();
      const timer = setTimeout(updateRect, 220);
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, true);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updateRect);
        window.removeEventListener('scroll', updateRect, true);
      };
    }
  }, [isVisible, currentStep, updateRect]);

  const nextStep = () => {
    if (currentStep < activeSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    const minStep = tourMode === 'app' ? 1 : 0;
    if (currentStep > minStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const dismissCoachmarkForRoute = () => {
    localStorage.setItem(`coh-guide-v2-${activeRoute}`, 'true');
    setShowCoachmark(false);
  };

  const disableAutoCoachmarks = () => {
    localStorage.setItem(`coh-guide-v2-${activeRoute}`, 'true');
    localStorage.setItem('coh-guide-v2-autohide', 'true');
    setShowCoachmark(false);
  };

  // First-visit unobtrusive workspace coachmark (when main tour overlay is not open)
  if (!isVisible && showCoachmark) {
    return (
      <div
        data-testid="workspace-guide-coachmark"
        role="region"
        aria-label={`${currentWorkspaceGuide.title} Tour Prompt`}
        className="fixed bottom-4 right-4 z-40 max-w-[calc(100vw-32px)] w-80 bg-surface-primary border border-brand-gold/40 rounded-xl shadow-level-2 p-3.5 text-xs pointer-events-auto"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-brand-gold font-semibold">
            <HelpCircle size={14} className="shrink-0" />
            <span>New to {currentWorkspaceGuide.title}?</span>
          </div>
          <button
            type="button"
            aria-label="Dismiss guide suggestion"
            onClick={dismissCoachmarkForRoute}
            className="text-text-muted hover:text-text-primary p-0.5"
          >
            <X size={14} />
          </button>
        </div>
        <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
          Take a 30-second tour of how this workspace fits into your workflow.
        </p>
        <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border-standard">
          <button
            type="button"
            data-testid="coachmark-disable-auto"
            onClick={disableAutoCoachmarks}
            className="text-[10px] text-text-muted hover:text-text-secondary underline"
          >
            Don&apos;t show automatically again
          </button>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              data-testid="coachmark-dismiss"
              onClick={dismissCoachmarkForRoute}
              className="px-2.5 py-1 rounded-md border border-border-standard bg-surface-inset text-text-secondary hover:text-text-primary font-semibold text-[11px]"
            >
              Not Now
            </button>
            <button
              type="button"
              data-testid="coachmark-start-tour"
              onClick={startWorkspaceTour}
              className="px-2.5 py-1 rounded-md bg-brand-gold text-text-inverse hover:bg-brand-gold-hover font-semibold text-[11px]"
            >
              Start Tour
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isVisible) return null;

  // Render App Tour Step 0: Welcome Modal
  if (tourMode === 'app' && currentStep === 0) {
    return (
      <div
        data-testid="guided-tour-welcome-modal"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4"
      >
        <div className="bg-surface-primary border border-border-strong rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative">
          <button
            aria-label="Close guided tour"
            onClick={closeTour}
            className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex justify-center mb-5">
            <div className="bg-brand-gold/10 p-3.5 rounded-2xl border border-brand-gold/25">
              <Sparkles className="text-brand-gold" size={28} />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-sans text-text-primary font-bold text-center mb-3">
            Welcome to Content Studio
          </h2>

          <p className="text-text-secondary text-center text-xs sm:text-sm leading-relaxed mb-6">
            Take a quick overview of the studio&apos;s main workspaces, or tour only the current workspace.
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {APP_TOUR_STEPS.slice(1).map((step, i) => (
              <span
                key={i}
                className="text-[10px] uppercase tracking-wider font-semibold bg-surface-inset text-text-secondary px-2.5 py-1 rounded-full border border-border-standard"
              >
                {step.title}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              data-testid="start-app-tour-btn"
              onClick={nextStep}
              className="w-full bg-brand-gold text-text-inverse hover:bg-brand-gold-hover font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
            >
              <Sparkles size={16} />
              Start App Overview Tour
            </button>
            <button
              type="button"
              data-testid="switch-to-workspace-tour-btn"
              onClick={startWorkspaceTour}
              className="w-full bg-surface-inset text-text-primary hover:border-brand-gold/40 border border-border-standard font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs"
            >
              <Compass size={15} className="text-brand-gold" />
              Tour {currentWorkspaceGuide.title} Only
            </button>
            <button
              type="button"
              onClick={closeTour}
              className="w-full mt-1 text-text-muted text-xs hover:text-text-primary transition-colors py-1"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!activeStepObj) return null;

  const padding = 6;
  const totalSteps = tourMode === 'app' ? activeSteps.length - 1 : activeSteps.length;
  const displayStepNum = tourMode === 'app' ? currentStep : currentStep + 1;
  const canGoBack = tourMode === 'app' ? currentStep > 1 : currentStep > 0;

  // Compute safe, viewport-clamped tooltip position
  const computeTooltipStyle = (): React.CSSProperties => {
    if (typeof window === 'undefined' || !targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipWidth = Math.min(340, vw - 24);
    const estimatedHeight = 250;

    // On mobile / narrow viewports, dock cleanly near bottom or top so it never overflows horizontally
    if (vw < 640) {
      const placeAtTop = targetRect.top > vh * 0.55;
      return {
        width: `${tooltipWidth}px`,
        left: `${Math.max(12, Math.floor((vw - tooltipWidth) / 2))}px`,
        ...(placeAtTop ? { top: '16px' } : { bottom: '16px' })
      };
    }

    // Prefer right of sidebar items if target is narrow and on the far left
    if (targetRect.right < 290 && targetRect.right + tooltipWidth + 24 < vw) {
      const clampedTop = Math.max(16, Math.min(targetRect.top, vh - estimatedHeight - 16));
      return {
        width: `${tooltipWidth}px`,
        top: `${clampedTop}px`,
        left: `${targetRect.right + padding + 12}px`
      };
    }

    // Otherwise place below or above target, clamped horizontally within [12, vw - tooltipWidth - 12]
    const clampedLeft = Math.max(12, Math.min(targetRect.left, vw - tooltipWidth - 12));
    const spaceBelow = vh - targetRect.bottom;
    if (spaceBelow >= estimatedHeight + 20 || targetRect.top < estimatedHeight) {
      const topPos = Math.min(vh - estimatedHeight - 12, Math.max(12, targetRect.bottom + padding + 10));
      return {
        width: `${tooltipWidth}px`,
        top: `${topPos}px`,
        left: `${clampedLeft}px`
      };
    } else {
      const topPos = Math.max(12, targetRect.top - estimatedHeight - padding - 10);
      return {
        width: `${tooltipWidth}px`,
        top: `${topPos}px`,
        left: `${clampedLeft}px`
      };
    }
  };

  return (
    <div
      data-testid="guided-tour-overlay"
      data-tour-mode={tourMode}
      data-tour-route={activeRoute}
      className="fixed inset-0 z-[100] overflow-hidden pointer-events-none"
    >
      {/* Dimmed backdrop when no target rect is available */}
      {!targetRect && (
        <div
          onClick={closeTour}
          className="absolute inset-0 bg-slate-900/65 pointer-events-auto"
        />
      )}

      {/* Spotlight highlight around the active target */}
      {targetRect && (
        <div
          data-testid="guided-tour-spotlight"
          className="absolute rounded-xl border-2 border-brand-gold transition-all duration-200 ease-out pointer-events-none"
          style={{
            top: Math.max(4, targetRect.top - padding),
            left: Math.max(4, targetRect.left - padding),
            width: Math.min(window.innerWidth - 8, targetRect.width + padding * 2),
            height: Math.min(window.innerHeight - 8, targetRect.height + padding * 2),
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.72)'
          }}
        />
      )}

      {/* Tooltip Card */}
      <div
        data-testid="guided-tour-popover"
        role="dialog"
        aria-modal="false"
        aria-label={activeStepObj.title}
        className="absolute bg-surface-primary border border-border-strong rounded-2xl shadow-2xl p-5 pointer-events-auto transition-all duration-200 ease-out max-w-[calc(100vw-24px)]"
        style={computeTooltipStyle()}
      >
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              data-testid="guided-tour-step-counter"
              className="bg-brand-gold/15 text-brand-gold border border-brand-gold/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider"
            >
              Step {displayStepNum} of {totalSteps}
            </span>
            <span className="text-[10.5px] font-semibold text-text-secondary truncate max-w-[160px]">
              {tourMode === 'workspace' ? `${currentWorkspaceGuide.title} Guide` : 'App Overview'}
            </span>
          </div>
          <button
            type="button"
            data-testid="guided-tour-close"
            aria-label="Close guided tour"
            onClick={closeTour}
            className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <h3 data-testid="guided-tour-step-title" className="text-text-primary font-bold text-base mb-1.5 leading-snug">
          {activeStepObj.title}
        </h3>
        <p data-testid="guided-tour-step-description" className="text-text-secondary text-xs leading-relaxed mb-4">
          {activeStepObj.description}
        </p>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border-standard">
          <button
            type="button"
            data-testid="guided-tour-mode-switch"
            onClick={() => {
              if (tourMode === 'workspace') {
                setTourMode('app');
                setCurrentStep(1);
              } else {
                startWorkspaceTour();
              }
            }}
            className="text-[10.5px] font-semibold text-brand-gold hover:underline"
          >
            {tourMode === 'workspace' ? 'Switch to App Tour' : `Tour ${currentWorkspaceGuide.title}`}
          </button>

          <div className="flex items-center gap-1.5">
            {canGoBack && (
              <button
                type="button"
                data-testid="guided-tour-back"
                onClick={prevStep}
                className="px-2.5 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary bg-surface-inset border border-border-standard rounded-lg flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={13} /> Back
              </button>
            )}
            <button
              type="button"
              data-testid="guided-tour-next"
              onClick={nextStep}
              className="px-3.5 py-1.5 text-xs font-semibold bg-brand-gold text-text-inverse hover:bg-brand-gold-hover rounded-lg flex items-center gap-1 transition-colors shadow-xs"
            >
              {displayStepNum === totalSteps ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

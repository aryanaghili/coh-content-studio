import React, { useEffect, useRef } from 'react';
import {
  HelpCircle,
  X,
  Compass,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Eye
} from 'lucide-react';
import {
  getContextualHelpForRoute,
  type ContextualHelpDefinition,
  type HelpJourneyDefinition,
  type HelpRuntimeAppState
} from '../lib/contextualHelpRegistry';
import { WORKSPACE_GUIDES } from './GuidedTour';

export interface ContextualHelpTriggerProps {
  pageTitle: string;
  onClick: () => void;
  isOpen?: boolean;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function ContextualHelpTrigger({
  pageTitle,
  onClick,
  isOpen = false,
  triggerRef
}: ContextualHelpTriggerProps) {
  return (
    <button
      ref={triggerRef}
      type="button"
      data-testid="contextual-help-trigger"
      aria-label={`Help for ${pageTitle}`}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      onClick={onClick}
      title={`Help for ${pageTitle}`}
      className="min-h-[44px] sm:min-h-[34px] min-w-[44px] sm:min-w-0 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-surface-inset border border-border-standard rounded-lg hover:border-brand-gold/60 text-text-secondary hover:text-text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-all cursor-pointer text-xs font-semibold"
    >
      <HelpCircle size={14} className="text-brand-gold shrink-0" />
      <span className="hidden sm:inline">Help</span>
    </button>
  );
}

export function HelpJourney({ journey }: { journey: HelpJourneyDefinition }) {
  if (!journey || !journey.steps || journey.steps.length === 0) return null;

  return (
    <div
      data-testid="contextual-help-journey"
      className="bg-surface-inset border border-border-standard rounded-xl p-3 space-y-2"
    >
      <div className="flex items-center justify-between gap-2 text-[11px]">
        <span className="font-semibold uppercase tracking-wider text-text-secondary">
          Workflow Position
        </span>
        <span className="font-mono font-semibold text-brand-gold">
          Current step: {journey.current}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
        {journey.steps.map((step, index) => {
          const isCurrent = step.toUpperCase() === journey.current.toUpperCase();
          return (
            <React.Fragment key={`${step}-${index}`}>
              <span
                className={`px-2 py-0.5 rounded-md font-mono text-[10.5px] border ${
                  isCurrent
                    ? 'bg-brand-gold/15 border-brand-gold text-text-primary font-bold'
                    : 'bg-surface-primary border-border-standard text-text-secondary'
                }`}
              >
                {isCurrent ? `● ${step}` : step}
              </span>
              {index < journey.steps.length - 1 && (
                <ArrowRight size={11} className="text-text-muted shrink-0" aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function HelpCurrentState({ message }: { message: string | null | undefined }) {
  if (!message) return null;

  return (
    <div
      data-testid="contextual-help-right-now"
      className="bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3.5 space-y-1"
    >
      <div className="flex items-center gap-1.5 text-xs font-bold text-text-primary">
        <Sparkles size={13} className="text-brand-gold shrink-0" />
        <span>Right now</span>
      </div>
      <p className="text-xs text-text-primary leading-relaxed">{message}</p>
    </div>
  );
}

export function HelpSection({
  title,
  testId,
  variant = 'default',
  children
}: {
  title: string;
  testId?: string;
  variant?: 'default' | 'warning';
  children: React.ReactNode;
}) {
  return (
    <section
      data-testid={testId}
      className={`rounded-xl border p-4 space-y-2.5 ${
        variant === 'warning'
          ? 'bg-status-warning/10 border-status-warning/35'
          : 'bg-surface-secondary border-border-standard'
      }`}
    >
      <h3 className="font-sans text-[13px] font-bold text-text-primary flex items-center gap-1.5">
        {variant === 'warning' && (
          <AlertTriangle size={14} className="text-status-warning shrink-0" aria-hidden="true" />
        )}
        <span>{title}</span>
      </h3>
      <div className="text-xs text-text-secondary leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export function HelpExample({
  title = 'Simple example',
  content
}: {
  title?: string;
  content: string;
}) {
  if (!content) return null;

  return (
    <section
      data-testid="contextual-help-example"
      className="bg-surface-inset border border-border-standard rounded-xl p-4 space-y-1.5"
    >
      <h3 className="font-sans text-[12px] font-bold uppercase tracking-wider text-brand-gold">
        {title}
      </h3>
      <p className="text-xs text-text-primary leading-relaxed font-medium">
        &ldquo;{content}&rdquo;
      </p>
    </section>
  );
}

export interface ContextualHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute: string;
  runtimeState: HelpRuntimeAppState;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export function ContextualHelpDrawer({
  isOpen,
  onClose,
  activeRoute,
  runtimeState,
  triggerRef
}: ContextualHelpDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const wasOpenRef = useRef<boolean>(false);

  const helpDef: ContextualHelpDefinition = getContextualHelpForRoute(activeRoute);
  const rightNowText = helpDef.dynamicStateResolver
    ? helpDef.dynamicStateResolver(runtimeState)
    : null;
  const hasGuidedTour = Boolean(helpDef.guideId && WORKSPACE_GUIDES[helpDef.guideId]);

  // Focus management: focus close button when opened, return focus to trigger when closed
  useEffect(() => {
    if (isOpen) {
      wasOpenRef.current = true;
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      triggerRef?.current?.focus();
    }
  }, [isOpen, triggerRef]);

  // Escape key & Tab focus trap inside modal drawer + lock background scroll
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLaunchGuidedTour = () => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('coh:open-guide', { detail: { mode: 'workspace' } })
      );
    }, 30);
  };

  const handleShowMeTarget = (selector: string) => {
    onClose();
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent('coh:open-guide', {
          detail: { mode: 'workspace', targetSelector: selector }
        })
      );
    }, 30);
  };

  const headingId = `contextual-help-title-${helpDef.id}`;

  return (
    <div
      data-testid="contextual-help-overlay"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Subtle Backdrop Overlay */}
      <div
        data-testid="contextual-help-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-[1px] transition-opacity"
      />

      {/* Right-Side Contextual Help Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        data-testid="contextual-help-drawer"
        data-help-route={helpDef.route}
        className="relative z-10 w-screen sm:w-[380px] lg:w-[400px] max-w-full h-full bg-surface-primary border-l border-border-strong shadow-level-2 flex flex-col overflow-hidden"
      >
        {/* Top Sticky Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-border-standard bg-surface-primary shrink-0 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-brand-gold font-semibold mb-1">
              <HelpCircle size={12} className="shrink-0" />
              <span>Page Help · {helpDef.pageType}</span>
            </div>
            <h2
              id={headingId}
              data-testid="contextual-help-title"
              className="font-sans text-lg font-bold text-text-primary leading-snug"
            >
              {helpDef.title}
            </h2>
            <p
              data-testid="contextual-help-short-purpose"
              className="text-xs text-text-secondary mt-1 leading-relaxed"
            >
              {helpDef.shortPurpose}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            data-testid="contextual-help-close"
            aria-label="Close Help drawer"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] -mr-1 -mt-1 inline-flex items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-inset focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring transition-colors shrink-0 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Independent Scrollable Body */}
        <div
          data-testid="contextual-help-body"
          className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4"
        >
          {/* Journey / Orientation */}
          {helpDef.journey && <HelpJourney journey={helpDef.journey} />}

          {/* Dynamic "Right now" Section */}
          <HelpCurrentState message={rightNowText} />

          {/* 1. What this page is for */}
          {helpDef.purpose && (
            <HelpSection
              title="1. What this page is for"
              testId="help-section-purpose"
            >
              <p>{helpDef.purpose}</p>
            </HelpSection>
          )}

          {/* 2. What you can do here */}
          {helpDef.capabilities && helpDef.capabilities.length > 0 && (
            <HelpSection
              title="2. What you can do here"
              testId="help-section-capabilities"
            >
              <ul className="space-y-2.5">
                {helpDef.capabilities.map((cap, idx) => {
                  const canSpotlight =
                    Boolean(cap.spotlightTarget) &&
                    typeof document !== 'undefined' &&
                    Boolean(document.querySelector(cap.spotlightTarget!));
                  return (
                    <li
                      key={idx}
                      className="bg-surface-primary border border-border-standard rounded-lg p-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-text-primary block">
                          {cap.title}
                        </span>
                        {canSpotlight && cap.spotlightTarget && (
                          <button
                            type="button"
                            data-testid={`help-show-me-${idx}`}
                            onClick={() => handleShowMeTarget(cap.spotlightTarget!)}
                            className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-gold hover:underline shrink-0 cursor-pointer"
                          >
                            <Eye size={11} />
                            <span>Show me</span>
                          </button>
                        )}
                      </div>
                      {cap.description && (
                        <p className="text-[11.5px] text-text-secondary mt-0.5 leading-relaxed">
                          {cap.description}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </HelpSection>
          )}

          {/* 3. How to start */}
          {helpDef.gettingStarted && helpDef.gettingStarted.length > 0 && (
            <HelpSection title="3. How to start" testId="help-section-getting-started">
              <ol className="space-y-2 list-decimal pl-4">
                {helpDef.gettingStarted.map((step, idx) => (
                  <li key={idx} className="text-text-primary">
                    <span className="font-semibold">{step.title}</span>
                    {step.description && (
                      <span className="block text-text-secondary text-[11.5px] mt-0.5">
                        {step.description}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </HelpSection>
          )}

          {/* 4. Before you move on */}
          {helpDef.beforeMovingForward && helpDef.beforeMovingForward.length > 0 && (
            <HelpSection
              title="4. Before you move on"
              testId="help-section-before-moving-on"
            >
              <ul className="space-y-1.5">
                {helpDef.beforeMovingForward.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2
                      size={13}
                      className="text-brand-gold shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </HelpSection>
          )}

          {/* 5. What usually comes next */}
          {helpDef.nextSteps && helpDef.nextSteps.length > 0 && (
            <HelpSection
              title="5. What usually comes next"
              testId="help-section-next-steps"
            >
              <ul className="space-y-1.5 list-disc pl-4">
                {helpDef.nextSteps.map((step, idx) => (
                  <li key={idx}>{step}</li>
                ))}
              </ul>
            </HelpSection>
          )}

          {/* 6. Watch out for */}
          {helpDef.commonMistakes && helpDef.commonMistakes.length > 0 && (
            <HelpSection
              title="6. Watch out for"
              testId="help-section-watch-out"
              variant="warning"
            >
              <ul className="space-y-1.5 list-disc pl-4 text-text-primary">
                {helpDef.commonMistakes.map((mistake, idx) => (
                  <li key={idx}>{mistake}</li>
                ))}
              </ul>
            </HelpSection>
          )}

          {/* 7. Simple example (only where genuinely useful) */}
          {helpDef.example && (
            <HelpExample
              title={helpDef.example.title || '7. Simple example'}
              content={helpDef.example.content}
            />
          )}

          {/* 8. Show Me Around (only where a matching Guided Tour exists) */}
          {hasGuidedTour && (
            <section
              data-testid="help-section-show-me-around"
              className="bg-surface-inset border border-border-standard rounded-xl p-4 flex flex-col gap-2.5"
            >
              <div>
                <h3 className="font-sans text-[13px] font-bold text-text-primary">
                  Want a visual walkthrough?
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Point out the main controls on this screen step by step.
                </p>
              </div>
              <button
                type="button"
                data-testid="contextual-help-show-me-around"
                onClick={handleLaunchGuidedTour}
                className="min-h-[44px] sm:min-h-[38px] w-full bg-brand-gold text-text-inverse hover:bg-brand-gold-hover font-semibold text-xs rounded-lg px-4 py-2 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Compass size={15} />
                <span>Show Me Around</span>
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

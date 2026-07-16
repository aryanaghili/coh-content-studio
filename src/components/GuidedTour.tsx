import React, { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface TourStep {
  selector: string;
  title: string;
  content: string;
}

const TOUR_STEPS: TourStep[] = [
  // Step 0 is the welcome modal, no selector needed
  { selector: '', title: '', content: '' },
  { selector: '#nav-command-center', title: 'Command Center', content: 'Your home base. See high-level analytics, pending items, and quick actions.' },
  { selector: '#nav-ideation', title: 'Ideation Workspace', content: 'Generate and save conceptual angles and hooks tailored to your operating core.' },
  { selector: '#nav-editorial', title: 'Editorial Calendar', content: 'Plan and sequence your content over weeks or months.' },
  { selector: '#nav-content', title: 'Content Workspace', content: 'Turn ideas into full drafts. Select tone, length, and let AI do the heavy lifting.' },
  { selector: '#nav-visual', title: 'Visual Studio', content: 'Create pixel-perfect, on-brand imagery to accompany your content.' },
  { selector: '#nav-revision', title: 'Revision Studio', content: 'Review, edit, and export your final approved content.' },
];

export const GuidedTour: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Initialize Tour based on local storage
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('coh-tour-completed');
    if (!hasSeenTour) {
      // Delay slightly to let the app render
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('coh-tour-completed', 'true');
    setIsVisible(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const skipTour = () => {
    completeTour();
  };

  // Track the target element's position dynamically
  const updateRect = useCallback(() => {
    if (currentStep === 0) return;
    
    const step = TOUR_STEPS[currentStep];
    if (step && step.selector) {
      const el = document.querySelector(step.selector);
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
    }
  }, [currentStep]);

  useEffect(() => {
    if (isVisible) {
      updateRect();
      window.addEventListener('resize', updateRect);
      window.addEventListener('scroll', updateRect, true);
    }
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [isVisible, updateRect]);

  // If tour is not visible, render nothing
  if (!isVisible) return null;

  // Render Step 0: Welcome Modal
  if (currentStep === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl p-8 max-w-md w-full relative">
          <button onClick={skipTour} className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 transition-colors">
            <X size={20} />
          </button>
          
          <div className="flex justify-center mb-6">
            <div className="bg-violet-600/10 p-4 rounded-3xl">
              <Sparkles className="text-violet-600" size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-sans text-slate-800 font-bold text-center mb-4">
            Welcome to Content Studio 👋
          </h2>
          
          <p className="text-slate-300 text-center text-sm leading-relaxed mb-8">
            This platform centralizes your ideation, drafting, visual generation, and compliance. 
            Take a quick 1-minute tour of the main workspaces, or skip and explore on your own.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8 px-4">
            {TOUR_STEPS.slice(1).map((step, i) => (
              <span key={i} className="text-[10px] uppercase tracking-wider font-semibold bg-slate-900 text-violet-600/80 px-2 py-1 rounded-full border border-slate-100">
                {step.title}
              </span>
            ))}
          </div>

          <button onClick={nextStep} className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 rounded-3xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg">
            <Sparkles size={18} />
            Start Tour
          </button>
          
          <button onClick={skipTour} className="w-full mt-4 text-slate-400 text-sm hover:text-slate-800 transition-colors">
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  // Render Steps 1+: Spotlight + Tooltip
  const step = TOUR_STEPS[currentStep];
  const padding = 8;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      {/* 
        SPOTLIGHT LAYER 
        This uses a massive box shadow to dim everything EXCEPT the target area.
      */}
      {targetRect && (
        <div 
          className="absolute rounded-3xl transition-all duration-300 ease-in-out pointer-events-none"
          style={{
            top: targetRect.top - padding,
            left: targetRect.left - padding,
            width: targetRect.width + padding * 2,
            height: targetRect.height + padding * 2,
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.85)',
          }}
        />
      )}

      {/* 
        TOOLTIP LAYER
        Positioned relative to the target rect, or centered if target is hidden.
      */}
      <div 
        className={`absolute bg-white border border-slate-200 rounded-[20px] shadow-xl p-5 w-72 pointer-events-auto transition-all duration-300 ease-in-out ${!targetRect ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
        style={targetRect ? {
          top: Math.max(20, targetRect.top),
          left: targetRect.right + padding + 12, // Position to the right of sidebar items
        } : {}}
      >
        <button onClick={skipTour} className="absolute top-3 right-3 text-slate-400 hover:text-slate-800">
          <X size={16} />
        </button>
        
        <div className="bg-slate-900 text-violet-600 text-[10px] font-bold px-2 py-1 rounded w-max mb-3 tracking-wider">
          {currentStep} / {TOUR_STEPS.length - 1}
        </div>
        
        <h3 className="text-slate-800 font-bold text-lg mb-2">{step.title}</h3>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">{step.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
             {TOUR_STEPS.slice(1).map((_, i) => (
               <div key={i} className={`h-1 rounded-full transition-all ${i + 1 === currentStep ? 'w-4 bg-violet-600' : 'w-1.5 bg-slate-600'}`} />
             ))}
          </div>
          
          <div className="flex gap-2">
            {currentStep > 1 && (
              <button onClick={prevStep} className="px-3 py-1.5 text-sm font-semibold text-slate-300 hover:text-slate-800 bg-slate-900 rounded hover:bg-slate-700 transition-colors">
                Back
              </button>
            )}
            <button onClick={nextStep} className="px-4 py-1.5 text-sm font-semibold bg-violet-600 text-coh-navy rounded flex items-center gap-1 hover:bg-yellow-500 transition-colors shadow-lg">
              {currentStep === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

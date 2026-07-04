import React from 'react';
import { Cpu } from 'lucide-react';
import type { OperatingCore } from '../lib/operatingCore';

interface Props {
  core: OperatingCore | null;
  workspaceName: string;
}

export default function OperatingCoreIndicator({ core, workspaceName }: Props) {
  if (!core || !core.active) return null;

  let activeRules = 0;
  
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Ideation Workspace'].includes(workspaceName)) {
    activeRules += core.coreStrategy?.internalLaw?.length || 0;
  }
  
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio'].includes(workspaceName)) {
    activeRules += 2; // Voice guidelines and anti-AI phrases
  }
  
  if (['Simple Mode', 'Quick Create', 'Advanced Brief', 'Revision Studio', 'Ideation Workspace'].includes(workspaceName)) {
    activeRules += core.claimsProofBoundaries?.claims?.length || 0;
  }
  
  if (workspaceName === 'Visual Studio') {
    activeRules += 3; // Visual DNA, Image Prompts, Negative Prompts
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-coh-navy/5 border border-coh-navy/10 rounded-full text-[10px] font-semibold text-coh-navy/60 cursor-default group relative mb-2">
      <Cpu size={12} className="text-coh-gold" />
      <span>Operating Core Active</span>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-coh-navy text-coh-cream rounded shadow-lg text-[9px] font-normal font-sans opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center">
        Injecting {activeRules} strategic rules, guardrails, and voice settings for {workspaceName}.
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-coh-navy"></div>
      </div>
    </div>
  );
}

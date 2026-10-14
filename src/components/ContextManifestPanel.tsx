import React, { useState } from 'react';
import { ChevronDown, ChevronRight, ShieldCheck, Layers, FileText, AlertCircle } from 'lucide-react';
import type { ContextManifest, ContextProvenance } from '../lib/contextCompiler';

interface ContextManifestPanelProps {
  manifest: ContextManifest;
  theme?: 'light' | 'dark';
  defaultExpanded?: boolean;
  className?: string;
}

const PROVENANCE_LABEL: Record<ContextProvenance, string> = {
  EXPLICIT: 'Explicit',
  INHERITED: 'Inherited',
  RESOLVED: 'Resolved',
  UNRESOLVED: 'Missing'
};

export const ContextManifestPanel: React.FC<ContextManifestPanelProps> = ({
  manifest,
  theme = 'light',
  defaultExpanded = false,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isDark = theme === 'dark';

  const getBadgeStyle = (prov: ContextProvenance) => {
    if (prov === 'EXPLICIT') {
      return isDark
        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
        : 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (prov === 'INHERITED') {
      return isDark
        ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
        : 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (prov === 'RESOLVED') {
      return isDark
        ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
        : 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return isDark
      ? 'bg-slate-800/80 text-slate-400 border-slate-700'
      : 'bg-stone-100 text-stone-500 border-stone-200';
  };

  return (
    <div
      data-testid="context-manifest-panel"
      className={`rounded-xl border text-xs ${
        isDark
          ? 'bg-[#121824]/90 border-slate-800/80 text-slate-200'
          : 'bg-[#FAF8F5] border-stone-200/90 text-stone-800'
      } ${className}`}
    >
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left rounded-xl ${
          isDark ? 'hover:bg-slate-800/40' : 'hover:bg-stone-100/70'
        }`}
        aria-expanded={expanded}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-70" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
          )}
          <ShieldCheck className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold tracking-tight">Active Context</span>
          <span
            className={`px-2 py-0.5 rounded-full border text-[10px] font-medium ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300'
                : 'bg-white border-stone-200 text-stone-600'
            }`}
          >
            COH Kernel + {manifest.operatingCoreActive ? 'Operating Core' : 'Kernel Only'}
          </span>
          {manifest.channel.value && (
            <span
              className={`hidden sm:inline-block px-2 py-0.5 rounded-full border text-[10px] ${getBadgeStyle(
                manifest.channel.provenance
              )}`}
            >
              {manifest.channel.value}
            </span>
          )}
          {manifest.audience.value && (
            <span
              className={`hidden md:inline-block px-2 py-0.5 rounded-full border text-[10px] ${getBadgeStyle(
                manifest.audience.provenance
              )}`}
            >
              {manifest.audience.value}
            </span>
          )}
          {manifest.sourcesSelected.length > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full border text-[10px] ${
                isDark
                  ? 'bg-indigo-950/60 border-indigo-800/60 text-indigo-300'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
            >
              {manifest.sourcesSelected.length} {manifest.sourcesSelected.length === 1 ? 'Source' : 'Sources'}
            </span>
          )}
        </div>
        <span className={`text-[11px] shrink-0 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
          {expanded ? 'Hide details' : 'Inspect context'}
        </span>
      </button>

      {expanded && (
        <div
          className={`px-3.5 pb-3.5 pt-2 border-t space-y-3 ${
            isDark ? 'border-slate-800/80' : 'border-stone-200/80'
          }`}
        >
          {/* Primary Parameters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  COH Guidance
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getBadgeStyle('RESOLVED')}`}>
                  Active
                </span>
              </div>
              <div className="font-medium truncate">
                {manifest.activeGuidanceSummary.slice(0, 2).join(', ')}
              </div>
              <div className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                {manifest.activeGuidanceSummary.length} governed rule layers
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Audience
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getBadgeStyle(manifest.audience.provenance)}`}>
                  {PROVENANCE_LABEL[manifest.audience.provenance]}
                </span>
              </div>
              <div className="font-medium truncate">
                {manifest.audience.value || 'Not specified'}
              </div>
              {manifest.audience.note && (
                <div className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  {manifest.audience.note}
                </div>
              )}
            </div>

            <div
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Channel
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getBadgeStyle(manifest.channel.provenance)}`}>
                  {PROVENANCE_LABEL[manifest.channel.provenance]}
                </span>
              </div>
              <div className="font-medium truncate">
                {manifest.channel.value || 'Not specified'}
              </div>
              <div className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Format: {manifest.format.value || 'Unresolved'}
              </div>
            </div>

            <div
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  Language
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[9px] border ${getBadgeStyle(manifest.language.provenance)}`}>
                  {PROVENANCE_LABEL[manifest.language.provenance]}
                </span>
              </div>
              <div className="font-medium truncate">
                {manifest.language.value || 'Not specified'}
              </div>
              <div className={`text-[10px] mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Pillar: {manifest.pillar.value || 'Unresolved'}
              </div>
            </div>
          </div>

          {/* Sources & Evidence Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-semibold">
                <FileText className="w-3.5 h-3.5 opacity-75" />
                <span>Sources ({manifest.sourcesSelected.length})</span>
              </div>
              {manifest.sourcesSelected.length === 0 ? (
                <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                  No task sources attached. Generation relies on Operating Core proof boundaries.
                </p>
              ) : (
                <ul className="space-y-1">
                  {manifest.sourcesSelected.map(s => (
                    <li key={s.id} className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="truncate font-medium">{s.title}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] shrink-0 border ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-slate-300'
                            : 'bg-stone-100 border-stone-200 text-stone-700'
                        }`}
                      >
                        {s.role}
                        {s.excerptCount > 0 ? ` (${s.excerptCount} excerpt${s.excerptCount > 1 ? 's' : ''})` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className={`p-2.5 rounded-lg border ${
                isDark ? 'bg-slate-900/40 border-slate-800/80' : 'bg-white border-stone-200/80'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 font-semibold">
                <Layers className="w-3.5 h-3.5 opacity-75" />
                <span>Evidence & Claim Boundaries</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-slate-300' : 'text-stone-600'}`}>
                {manifest.evidenceSources.length > 0
                  ? `Evidence grounding: ${manifest.evidenceSources.join(', ')}.`
                  : 'No external evidence source attached. Unverified claims, dates, and commitments remain restricted.'}
              </p>
            </div>
          </div>

          {/* Provenance Breakdown: Explicit / Inherited / Resolved / Missing */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-stone-50/80 border-stone-200/70'}`}>
              <span className="font-semibold block mb-0.5 text-emerald-600 dark:text-emerald-400">
                Explicit ({manifest.explicitInputs.length})
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-stone-600'}>
                {manifest.explicitInputs.length > 0 ? manifest.explicitInputs.join(', ') : 'None'}
              </span>
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-stone-50/80 border-stone-200/70'}`}>
              <span className="font-semibold block mb-0.5 text-blue-600 dark:text-blue-400">
                Inherited ({manifest.inheritedInputs.length})
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-stone-600'}>
                {manifest.inheritedInputs.length > 0 ? manifest.inheritedInputs.join(', ') : 'None'}
              </span>
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-stone-50/80 border-stone-200/70'}`}>
              <span className="font-semibold block mb-0.5 text-amber-600 dark:text-amber-400">
                Resolved ({manifest.resolvedInputs.length})
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-stone-600'}>
                {manifest.resolvedInputs.length > 0 ? manifest.resolvedInputs.join(', ') : 'None'}
              </span>
            </div>
            <div className={`p-2 rounded border ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-stone-50/80 border-stone-200/70'}`}>
              <span className={`font-semibold block mb-0.5 ${isDark ? 'text-slate-400' : 'text-stone-500'}`}>
                Missing ({manifest.unresolvedInputs.length})
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-stone-600'}>
                {manifest.unresolvedInputs.length > 0 ? manifest.unresolvedInputs.join(', ') : 'None'}
              </span>
            </div>
          </div>

          {manifest.conflictWarnings.length > 0 && (
            <div
              className={`flex items-start gap-2 p-2.5 rounded-lg border ${
                isDark
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                {manifest.conflictWarnings.map((w, idx) => (
                  <p key={idx} className="text-[11px] font-medium">
                    {w}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

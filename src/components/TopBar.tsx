import React from 'react';
import { Sun, Moon, Search, Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  theme: string;
  onThemeToggle: (theme: 'light' | 'dark') => void;
  aiStatus: string;
  onSearchClick?: () => void;
}

export function TopBar({ title, theme, onThemeToggle, aiStatus, onSearchClick }: TopBarProps) {
  return (
    <header className="h-[64px] bg-surface-primary border-b border-border-standard px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <h2 className="font-sans font-semibold text-[17px] text-text-primary">{title}</h2>
        <div className="hidden md:flex items-center ml-8 max-w-md w-full relative">
          <Search size={16} className="absolute left-3 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search commands, ideas, or content..." 
            className="w-full bg-surface-inset border border-border-standard rounded-full py-1.5 pl-9 pr-4 text-[13px] text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-focus-ring outline-none transition-all cursor-text"
            onFocus={onSearchClick}
            readOnly={!!onSearchClick}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {/* AI Status */}
        <button 
          className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-surface-primary border border-border-strong rounded-full hover:bg-surface-hover hover:border-brand-gold transition-all shadow-sm group"
          title={aiStatus === 'connected' ? 'AI is connected and ready' : 'AI is offline - click to configure'}
        >
          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${aiStatus === 'connected' ? 'bg-status-success shadow-[0_0_8px_rgba(23,140,78,0.6)]' : 'bg-status-error shadow-[0_0_8px_rgba(200,60,60,0.6)]'}`} />
          <span className={`font-sans text-[12px] font-bold uppercase tracking-wider ${aiStatus === 'connected' ? 'text-status-success' : 'text-status-error'}`}>
            {aiStatus === 'connected' ? 'AI Ready' : 'AI Offline'}
          </span>
        </button>

        {/* Copyright Notice */}
        <span className="text-[12px] font-sans text-text-muted whitespace-nowrap">
          Copyright © 2026 Aryan Aghili. All rights reserved.
        </span>

        {/* Theme Toggle */}
        <div className="flex items-center bg-surface-inset p-1 border border-border-standard rounded-full">
          <button 
            onClick={() => onThemeToggle('light')}
            className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-surface-primary shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            title="Light Mode"
          >
            <Sun size={14} />
          </button>
          <button 
            onClick={() => onThemeToggle('dark')}
            className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-surface-primary shadow-sm text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
            title="Dark Mode"
          >
            <Moon size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

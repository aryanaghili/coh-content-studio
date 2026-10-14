import React, { useState, useEffect } from 'react';
import { Sun, Moon, Search, Command } from 'lucide-react';
import { CommandPaletteModal } from './CommandPaletteModal';
import type { SavedContent, SavedIdea, SourceFile } from '../App';

interface TopBarProps {
  title: string;
  theme: string;
  onThemeToggle: (theme: 'light' | 'dark') => void;
  aiStatus: string;
  onSearchClick?: () => void;
  onNavigateTab?: (tab: string) => void;
  savedContent?: SavedContent[];
  savedIdeas?: SavedIdea[];
  sources?: SourceFile[];
  onSelectContentItem?: (item: SavedContent) => void;
  onSelectIdeaItem?: (idea: SavedIdea) => void;
}

export function TopBar({ 
  title, 
  theme, 
  onThemeToggle, 
  aiStatus, 
  onSearchClick,
  onNavigateTab,
  savedContent = [],
  savedIdeas = [],
  sources = [],
  onSelectContentItem,
  onSelectIdeaItem
}: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQueryVal, setSearchQueryVal] = useState('');

  // Handle global Cmd+K or Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenSearch = (initialVal = '') => {
    setSearchQueryVal(initialVal);
    setIsSearchOpen(true);
    if (onSearchClick) onSearchClick();
  };

  const handleNavigate = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    }
  };

  return (
    <>
      <header className="h-[56px] bg-surface-primary/95 backdrop-blur-md border-b border-border-standard px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <h2 className="font-sans font-semibold text-[15px] tracking-tight text-text-primary truncate">{title}</h2>
          <div className="hidden md:flex items-center ml-4 max-w-sm w-full relative">
            <Search size={14} className="absolute left-3 text-text-muted pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search studios, ideas, or content..." 
              value={searchQueryVal}
              onChange={(e) => {
                setSearchQueryVal(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => handleOpenSearch(searchQueryVal)}
              onClick={() => handleOpenSearch(searchQueryVal)}
              className="w-full h-8 bg-surface-inset border border-border-standard rounded-lg py-1 pl-8 pr-12 text-[12.5px] text-text-primary placeholder:text-text-muted focus-visible:ring-2 focus-visible:ring-focus-ring outline-none transition-all cursor-pointer"
            />
            <div 
              onClick={() => handleOpenSearch('')}
              className="absolute right-2.5 flex items-center gap-0.5 text-[10px] font-mono text-text-muted bg-surface-primary px-1.5 py-0.5 rounded border border-border-standard cursor-pointer hover:border-border-strong"
            >
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* AI Status */}
          <button 
            className="hidden sm:flex items-center gap-2 px-3 py-1 bg-surface-inset border border-border-standard rounded-full hover:border-brand-gold/60 transition-all cursor-pointer"
            title={aiStatus === 'connected' ? 'AI is connected and ready' : 'AI is offline - click to configure'}
            onClick={() => handleNavigate('settings')}
          >
            <div className={`w-2 h-2 rounded-full ${aiStatus === 'connected' ? 'bg-status-success' : 'bg-status-warning'}`} />
            <span className={`font-sans text-[11px] font-semibold tracking-wide ${aiStatus === 'connected' ? 'text-text-primary' : 'text-text-secondary'}`}>
              {aiStatus === 'connected' ? 'AI Connected' : 'Local Engine'}
            </span>
          </button>

          {/* Copyright Notice */}
          <span className="text-[11px] font-sans text-text-muted whitespace-nowrap hidden xl:inline-block">
            © 2026 Aryan Aghili
          </span>

          {/* Theme Toggle */}
          <div className="flex items-center bg-surface-inset p-0.5 border border-border-standard rounded-lg">
            <button 
              onClick={() => onThemeToggle('light')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${theme === 'light' ? 'bg-surface-primary shadow-2xs text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              title="Light Mode"
              aria-label="Light Mode"
            >
              <Sun size={13} />
            </button>
            <button 
              onClick={() => onThemeToggle('dark')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${theme === 'dark' ? 'bg-surface-primary shadow-2xs text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              title="Dark Mode"
              aria-label="Dark Mode"
            >
              <Moon size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Global Search & Command Palette Modal */}
      <CommandPaletteModal
        isOpen={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
          setSearchQueryVal('');
        }}
        initialQuery={searchQueryVal}
        onNavigateTab={handleNavigate}
        savedContent={savedContent}
        savedIdeas={savedIdeas}
        sources={sources}
        onSelectContentItem={onSelectContentItem}
        onSelectIdeaItem={onSelectIdeaItem}
        onToggleTheme={onThemeToggle}
        currentTheme={theme}
      />
    </>
  );
}

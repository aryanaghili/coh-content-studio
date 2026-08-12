import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Command, Layout, FileText, Lightbulb, Database, 
  Settings, Shield, Calendar, Sparkles, Moon, Sun, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { SavedContent, SavedIdea, SourceFile } from '../App';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  onNavigateTab: (tab: string) => void;
  savedContent?: SavedContent[];
  savedIdeas?: SavedIdea[];
  sources?: SourceFile[];
  onSelectContentItem?: (item: SavedContent) => void;
  onSelectIdeaItem?: (idea: SavedIdea) => void;
  onToggleTheme?: (theme: 'light' | 'dark') => void;
  currentTheme?: string;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  initialQuery = '',
  onNavigateTab,
  savedContent = [],
  savedIdeas = [],
  sources = [],
  onSelectContentItem,
  onSelectIdeaItem,
  onToggleTheme,
  currentTheme = 'light'
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Handle global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Workspace / Navigation Options
  const navigationItems = [
    { id: 'command-center', title: 'Command Center', icon: Layout, category: 'Workspace', desc: 'Main dashboard & quick launch' },
    { id: 'ideation-workspace', title: 'Ideation Workspace', icon: Lightbulb, category: 'Workspace', desc: 'AI brainstorming & angle matrix' },
    { id: 'editorial-calendar', title: 'Editorial Calendar', icon: Calendar, category: 'Workspace', desc: 'Monthly strategy & batch generator' },
    { id: 'content-workspace', title: 'Content Workspace', icon: Sparkles, category: 'Workspace', desc: 'Composer & multi-channel packs' },
    { id: 'visual-studio', title: 'Visual Studio', icon: Sparkles, category: 'Workspace', desc: 'AI image generator & Visual DNA' },
    { id: 'revision-studio', title: 'Revision Studio', icon: FileText, category: 'Workspace', desc: 'Editorial audit & quality control' },
    { id: 'calendar-library', title: 'Calendar Library', icon: Calendar, category: 'Library', desc: 'Saved monthly calendars' },
    { id: 'idea-library', title: 'Idea Library', icon: Lightbulb, category: 'Library', desc: 'Saved ideas & brainstorms' },
    { id: 'content-library', title: 'Content Library', icon: FileText, category: 'Library', desc: 'Approved content assets' },
    { id: 'source-library', title: 'Source Library', icon: Database, category: 'Library', desc: 'Reference knowledge base' },
    { id: 'operating-core', title: 'Operating Core', icon: Shield, category: 'Configuration', desc: 'Single source of truth strategy kernel' },
    { id: 'settings', title: 'Settings', icon: Settings, category: 'Configuration', desc: 'API keys & system preferences' },
  ];

  const q = query.toLowerCase().trim();

  // Filter items
  const filteredNav = navigationItems.filter(item => 
    !q || item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );

  const filteredContent = savedContent.filter(item =>
    q && (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.text && item.text.toLowerCase().includes(q)) ||
      (item.channel && item.channel.toLowerCase().includes(q)) ||
      (item.pillar && item.pillar.toLowerCase().includes(q))
    )
  ).slice(0, 5);

  const filteredIdeas = savedIdeas.filter(item =>
    q && (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.explanation && item.explanation.toLowerCase().includes(q)) ||
      (item.suggestedChannel && item.suggestedChannel.toLowerCase().includes(q))
    )
  ).slice(0, 5);

  const filteredSources = sources.filter(item =>
    q && (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      (item.content && item.content.toLowerCase().includes(q))
    )
  ).slice(0, 5);

  // Quick actions
  const quickActions = [
    {
      id: 'action-theme',
      title: currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: currentTheme === 'dark' ? Sun : Moon,
      category: 'Action',
      action: () => {
        if (onToggleTheme) onToggleTheme(currentTheme === 'dark' ? 'light' : 'dark');
        onClose();
      }
    }
  ].filter(action => !q || action.title.toLowerCase().includes(q));

  // Flattened results list for keyboard navigation
  const allResults: Array<{
    type: 'nav' | 'content' | 'idea' | 'source' | 'action';
    data: any;
    label: string;
    sublabel?: string;
    icon: any;
    category: string;
    action: () => void;
  }> = [];

  filteredNav.forEach(item => {
    allResults.push({
      type: 'nav',
      data: item,
      label: item.title,
      sublabel: item.desc,
      icon: item.icon,
      category: item.category,
      action: () => {
        onNavigateTab(item.id);
        onClose();
      }
    });
  });

  filteredContent.forEach(item => {
    allResults.push({
      type: 'content',
      data: item,
      label: item.title || 'Untitled Draft',
      sublabel: `${item.channel} • ${item.status}`,
      icon: FileText,
      category: 'Saved Content',
      action: () => {
        if (onSelectContentItem) {
          onSelectContentItem(item);
        } else {
          onNavigateTab('content-library');
        }
        onClose();
      }
    });
  });

  filteredIdeas.forEach(item => {
    allResults.push({
      type: 'idea',
      data: item,
      label: item.title,
      sublabel: `${item.suggestedChannel || 'Idea'} • ${item.status}`,
      icon: Lightbulb,
      category: 'Ideas',
      action: () => {
        if (onSelectIdeaItem) {
          onSelectIdeaItem(item);
        } else {
          onNavigateTab('idea-library');
        }
        onClose();
      }
    });
  });

  filteredSources.forEach(item => {
    allResults.push({
      type: 'source',
      data: item,
      label: item.title,
      sublabel: item.type,
      icon: Database,
      category: 'Source Library',
      action: () => {
        onNavigateTab('source-library');
        onClose();
      }
    });
  });

  quickActions.forEach(item => {
    allResults.push({
      type: 'action',
      data: item,
      label: item.title,
      sublabel: 'Quick Command',
      icon: item.icon,
      category: 'Action',
      action: item.action
    });
  });

  // Handle arrow key navigation in list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        allResults[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm transition-all animate-fadeIn">
      {/* Backdrop overlay listener */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-surface-primary border border-border-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-border-standard bg-surface-primary gap-3 shrink-0">
          <Search size={20} className="text-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Search commands, workspaces, ideas, content, sources..."
            className="w-full bg-transparent text-text-primary placeholder:text-text-muted text-sm font-sans focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="text-text-muted hover:text-text-primary p-1 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono bg-surface-inset text-text-muted px-2 py-1 rounded border border-border-standard shrink-0">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-text-muted">
              <Search size={32} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No commands or items found for "{query}"</p>
              <p className="text-xs mt-1">Try searching for workspaces like "Content", "Ideas", or "Operating Core"</p>
            </div>
          ) : (
            allResults.map((result, idx) => {
              const Icon = result.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={`${result.type}-${idx}-${result.label}`}
                  onClick={result.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected 
                      ? 'bg-brand-gold/15 text-text-primary border border-brand-gold/30 shadow-sm' 
                      : 'hover:bg-surface-inset text-text-primary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-brand-gold text-white' : 'bg-surface-inset text-text-secondary border border-border-standard'}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-sans font-semibold text-xs text-text-primary truncate flex items-center gap-2">
                        {result.label}
                      </div>
                      {result.sublabel && (
                        <div className="text-[11px] text-text-muted truncate mt-0.5">
                          {result.sublabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-text-muted bg-surface-inset px-2 py-0.5 rounded border border-border-standard">
                      {result.category}
                    </span>
                    {isSelected && (
                      <CornerDownLeft size={14} className="text-brand-gold animate-pulse" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-surface-inset border-t border-border-standard flex items-center justify-between text-[11px] text-text-muted font-mono shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-surface-primary rounded border border-border-standard">↑</kbd><kbd className="px-1 py-0.5 bg-surface-primary rounded border border-border-standard">↓</kbd> navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-surface-primary rounded border border-border-standard">↵</kbd> select</span>
          </div>
          <div>
            <span>Press <kbd className="px-1 py-0.5 bg-surface-primary rounded border border-border-standard">ESC</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
}

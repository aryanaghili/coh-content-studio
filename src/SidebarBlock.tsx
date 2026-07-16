      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 w-[256px] max-w-[85vw] border-r border-border-strong bg-sidebar-bg text-text-primary flex flex-col justify-between p-6 shrink-0 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Mobile close button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-4 right-4 p-2 text-brand-gold hover:text-text-primary">
          <X size={24} />
        </button>
        <div>
          <div className="mb-10">
            <span className="font-sans tracking-widest text-[11px] uppercase text-brand-gold block mb-2">Climate Opera Haus</span>
            <h1 className="font-sans text-[21px] font-semibold leading-tight tracking-tight border-b border-border-strong pb-4 text-white">
              Content Studio
            </h1>
          </div>

          <nav className="space-y-1">
            <div className="pb-2 px-4 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Overview
            </div>
            <button
              id="nav-command-center"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('command-center'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'command-center'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <LayoutDashboard size={16} />
              Command Center
            </button>

            <div className="pt-6 pb-2 px-4 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Workspaces
            </div>
            <button
              id="nav-ideation"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('ideation-workspace'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'ideation-workspace'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Lightbulb size={16} />
              Ideation Workspace
            </button>
            <button
              id="nav-editorial"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('editorial-calendar'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'editorial-calendar'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Calendar size={16} />
              Editorial Calendar
            </button>
            <button
              id="nav-content"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-workspace'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'content-workspace'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Cpu size={16} />
              Content Workspace
            </button>
            <button
              id="nav-visual"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('visual-studio'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'visual-studio'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <div className="w-4 h-4 flex items-center justify-center border border-current rounded-sm">
                <div className="w-2 h-2 rounded-full bg-current" />
              </div>
              Visual Studio
            </button>
            <button
              id="nav-revision"
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('revision-studio'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded relative ${
                activeTab === 'revision-studio'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Sliders size={16} />
              Revision Studio
              {activeDraftText && (
                <span className="absolute top-2.5 right-4 w-2 h-2 rounded-full bg-violet-600" />
              )}
            </button>

            <div className="pt-6 pb-2 px-4 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Libraries
            </div>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('calendar-library'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'calendar-library'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Calendar size={16} />
              Calendar Library
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('idea-library'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'idea-library'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <FolderHeart size={16} />
              Idea Library
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('content-library'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'content-library'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Bookmark size={16} />
              Content Library
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('source-library'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'source-library'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <FileText size={16} />
              Source Library
            </button>

            <div className="pt-6 pb-2 px-4 text-[11px] font-semibold tracking-wider text-text-muted uppercase">
              Configuration
            </div>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('operating-core'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'operating-core'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <CpuIcon size={16} />
              Operating Core
            </button>
            <button
              onClick={() => { setIsMobileMenuOpen(false); setActiveTab('settings'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-full ${
                activeTab === 'settings'
                  ? 'bg-sidebar-active text-white font-semibold rounded-md shadow-sm'
                  : 'text-brand-gold/70 hover:bg-brand-gold-hover hover:text-text-primary'
              }`}
            >
              <Settings size={16} />
              Settings
            </button>
          </nav>
        </div>

      </aside>

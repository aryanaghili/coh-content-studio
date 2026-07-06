import os
import re

filepath = "src/App.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add import for EditorialCalendarStudio
if "EditorialCalendarStudio" not in content:
    content = content.replace(
        "import { LANGUAGES, getLanguageDirection } from './lib/languages';",
        "import { LANGUAGES, getLanguageDirection } from './lib/languages';\nimport { EditorialCalendarStudio } from './components/EditorialCalendarStudio';"
    )

# 2. Add Calendar to lucide-react imports if missing
if "Calendar," not in content and "Calendar " not in content:
    content = content.replace("LayoutDashboard,", "LayoutDashboard,\n  Calendar,")

# 3. Add to sidebar navigation
sidebar_target = """            <button
              onClick={() => setActiveTab('content-workspace')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'content-workspace'"""

sidebar_replacement = """            <button
              onClick={() => setActiveTab('editorial-calendar')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'editorial-calendar'
                  ? 'bg-coh-gold text-coh-navy font-semibold shadow-sm'
                  : 'text-coh-gold/70 hover:bg-coh-navy-light hover:text-coh-cream'
              }`}
            >
              <Calendar size={16} />
              Editorial Calendar Studio
            </button>
            <button
              onClick={() => setActiveTab('content-workspace')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded ${
                activeTab === 'content-workspace'"""

if "Editorial Calendar Studio" not in content:
    content = content.replace(sidebar_target, sidebar_replacement)

# 4. Add the component render block
render_target = """        {/* --- TAB 2: CONTENT WORKSPACE --- */}"""
render_replacement = """        {activeTab === 'editorial-calendar' && (
          <ErrorBoundary fallbackTitle="Editorial Calendar Error">
            <EditorialCalendarStudio 
              onHandoff={(workItem) => {
                setActiveWorkItem(workItem);
                setActiveTab('content-workspace');
              }}
            />
          </ErrorBoundary>
        )}
        {/* --- TAB 2: CONTENT WORKSPACE --- */}"""

if "activeTab === 'editorial-calendar'" not in content:
    content = content.replace(render_target, render_replacement)

with open(filepath, "w") as f:
    f.write(content)

print("App.tsx patched for Editorial Calendar Studio")

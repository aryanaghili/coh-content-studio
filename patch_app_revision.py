import os

filepath = "src/App.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Add Import
if "RevisionStudio" not in content[:2000]:
    content = content.replace(
        "import { LANGUAGES, getLanguageDirection } from './lib/languages';",
        "import { LANGUAGES, getLanguageDirection } from './lib/languages';\nimport { RevisionStudio } from './components/RevisionStudio';"
    )

# 2. Replace render block
start_marker = "        {activeTab === 'revision-studio' && (<ErrorBoundary fallbackTitle=\"Revision Studio Error\">"
end_marker = "        {/* --- TAB 6: CONTENT LIBRARY --- */}"

start_idx = content.find(start_marker)
if start_idx != -1:
    end_idx = content.find(end_marker, start_idx)
    if end_idx != -1:
        replacement = """        {activeTab === 'revision-studio' && (<ErrorBoundary fallbackTitle="Revision Studio Error">
          <RevisionStudio
            initialDraft={activeDraftText}
            initialSourceType={activeDraftSource === 'Content Workspace' ? 'contentWorkspace' : 'contentLibrary'}
            initialSourceTitle={activeDraftTitle}
            operatingCore={operatingCore}
            aiStatus={aiStatus}
            generationMode={generationMode}
            onSaveToLibrary={(item) => {
              setSourceLibrary(prev => [item, ...prev]);
            }}
            onNavigateToLibrary={() => setActiveTab('content-library')}
          />
        </ErrorBoundary>)}
"""
        content = content[:start_idx] + replacement + content[end_idx:]
        print("Replaced Revision Studio block")
    else:
        print("Could not find end marker")
else:
    print("Could not find start marker")

with open(filepath, "w") as f:
    f.write(content)

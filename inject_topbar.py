import re

file_path = "src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add import
if "import { TopBar }" not in content:
    content = content.replace(
        "import { ErrorBoundary } from './components/ErrorBoundary';",
        "import { ErrorBoundary } from './components/ErrorBoundary';\nimport { TopBar } from './components/TopBar';"
    )

# Add theme state
if "const [theme, setTheme]" not in content:
    content = content.replace(
        "const [activeTab, setActiveTab] = useState('command-center');",
        "const [activeTab, setActiveTab] = useState('command-center');\n  const [theme, setTheme] = useState<'light' | 'dark'>((localStorage.getItem('coh-theme') as 'light' | 'dark') || 'light');\n\n  useEffect(() => {\n    document.documentElement.setAttribute('data-theme', theme);\n    localStorage.setItem('coh-theme', theme);\n  }, [theme]);"
    )

# Get title logic
title_logic = """
  const getPageTitle = () => {
    switch(activeTab) {
      case 'command-center': return 'Command Center';
      case 'create': return 'Create Content';
      case 'calendars': return 'Calendars';
      case 'library': return 'Content Library';
      case 'sources': return 'Source Material';
      case 'operating-core': return 'Operating Core Settings';
      default: return 'Content Studio';
    }
  };
"""

if "const getPageTitle" not in content:
    content = content.replace(
        "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);",
        "const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n" + title_logic
    )

# Inject TopBar
if "<TopBar" not in content:
    content = content.replace(
        '<main className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 flex flex-col min-w-0">',
        '<div className="flex-1 flex flex-col min-w-0 bg-canvas">\n        <TopBar \n          title={getPageTitle()} \n          theme={theme} \n          onThemeToggle={setTheme} \n          aiStatus={aiStatus} \n        />\n        <main className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 flex flex-col min-w-0">'
    )
    # Also need to add closing div for the flex-col wrapper around TopBar + main
    # Wait, the closing tag of <main> is at the very end of the file.
    # I should be careful. I can just append `</div>` before the very last closing `</div>` or simply use a python script to replace the last `</main>` with `</main>\n      </div>`
    
    # We replaced `<main className="flex-1 overflow-y-auto px-4 md:px-12 py-6 md:py-10 flex flex-col min-w-0">` which is under `<div className="app-shell">` (wait, I refactored the parent `div`).
    # Looking for `      </main>\n    </div>\n  );\n}`
    content = re.sub(r'</main>\s*</div>\s*\);\s*}', '</main>\n      </div>\n    </div>\n  );\n}', content)


with open(file_path, "w") as f:
    f.write(content)

print("TopBar integrated into App.tsx")

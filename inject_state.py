with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

# Insert state variables if they don't exist
if 'const [knowledgeLibraryFilter' not in content:
    # Find a good place to insert, e.g., after activeTab
    content = re.sub(
        r'(const \[activeTab, setActiveTab\] = useState<string>\(.*?;\n)',
        r'\1  const [knowledgeLibraryFilter, setKnowledgeLibraryFilter] = useState<string>("All");\n  const [extractingInsightFor, setExtractingInsightFor] = useState<string | null>(null);\n',
        content
    )

with open('src/App.tsx', 'w') as f:
    f.write(content)

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
"""    useFor: string;
    notes: string;
    content: string;
    url?: string;
  }>({""",
"""    useFor: string;
    notes: string;
    content: string;
    url?: string;
    selectable?: boolean;
  }>({"""
)

content = content.replace(
"""    useFor: '',
    notes: '',
    content: '',
    url: ''
  });""",
"""    useFor: '',
    notes: '',
    content: '',
    url: '',
    selectable: true
  });"""
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

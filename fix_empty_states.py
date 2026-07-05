import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Ideation Workspace
content = re.sub(
    r'<p className="text-sm text-coh-navy/60">No generated ideas yet\. Explore an angle above\.</p>',
    r'<p className="text-sm text-coh-navy/60">No ideas yet. Add a theme or question to explore possible content angles.</p>',
    content
)

# Content Workspace
content = re.sub(
    r'<p className="text-sm text-coh-navy/60">Ready to generate content\. Fill out the brief and click Generate\.</p>',
    r'<p className="text-sm text-coh-navy/60">No draft yet. Add a message, choose a channel, and generate your first version.</p>',
    content
)

# Revision Studio
content = re.sub(
    r'<p className="text-sm text-coh-navy/60">Start typing or paste content to revise\.</p>',
    r'<p className="text-sm text-coh-navy/60">Nothing to revise yet. Paste content here or send a draft from Content Workspace.</p>',
    content
)

# Visual Studio
content = re.sub(
    r'<p className="text-sm text-coh-navy/60">No images generated yet\.</p>',
    r'<p className="text-sm text-coh-navy/60">No image yet. Add a prompt or import a visual direction from a draft.</p>',
    content
)

# Idea Library
content = re.sub(
    r'<p className="text-sm text-coh-navy/60 mb-4">No ideas saved to your library yet\.</p>',
    r'<p className="text-sm text-coh-navy/60 mb-4">No saved ideas yet. Save promising ideas from the Ideation Workspace.</p>',
    content
)

# Content Library
content = re.sub(
    r'<p className="text-sm text-coh-navy/60 mb-4">No content saved to your library yet\.</p>',
    r'<p className="text-sm text-coh-navy/60 mb-4">No saved content yet. Approved drafts and saved versions will appear here.</p>',
    content
)

# Knowledge / Source Library
content = re.sub(
    r'<p className="text-sm text-coh-navy/60 mb-2">No active sources in the library\.</p>',
    r'<p className="text-sm text-coh-navy/60 mb-2">No sources yet. Add documents, pasted text, or URLs to ground future content.</p>',
    content
)

# Command Center (Needs Your Attention)
content = re.sub(
    r'<p className="text-sm text-coh-navy/60">All caught up! No items need your attention right now\.</p>',
    r'<p className="text-sm text-coh-navy/60">No recent work yet. Start by writing content, exploring ideas, or adding a source.</p>',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Empty states updated.")

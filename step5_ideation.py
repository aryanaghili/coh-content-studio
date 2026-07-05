import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_ideation_logic = """
  const handleCopyIdeaToWorkspace = (idea: SavedIdea) => {
    const hasUnsavedSimple = !!simpleBrief.goal.trim();
    const hasUnsavedQuick = !!quickBrief.goal.trim();
    const hasUnsavedAdvanced = !!advancedBrief.topic.trim();

    if (hasUnsavedSimple || hasUnsavedQuick || hasUnsavedAdvanced) {
      if (!window.confirm("You have unsaved input in the Content Workspace. Do you want to overwrite it with this idea?")) {
        return;
      }
    }

    const newId = `work-${Date.now()}`;
    setActiveWorkItem({
      id: newId,
      title: idea.title,
      type: 'Content',
      channel: idea.channel || '',
      audience: idea.audience || '',
      status: 'Idea',
      draftVersions: [],
      imageResults: [],
      revisionHistory: [],
      approved: false,
      saved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      origin: 'Imported Idea'
    });

    setCreationMode('advanced');
    setAdvancedBrief({
      topic: idea.angle || idea.title,
      directionMode: 'auto',
      customDirection: '',
      desiredLength: 'Medium: 120-180 words',
      mustInclude: `Original Idea: ${idea.title}\\nAngle: ${idea.angle}`,
      mustAvoid: '',
      channel: idea.channel || 'LinkedIn',
      outputFormat: 'Post',
      language: 'English',
      audience: idea.audience || 'General Public',
      customAudience: '',
      purpose: 'General / Open',
      pillar: idea.pillar || 'General / Custom',
      toneIntensity: 3,
      selectedSourceIds: []
    });

    setImportedIdeationContext(idea);
    setActiveTab('content-workspace');
  };
"""

content = re.sub(
    r'  const handleCopyIdeaToWorkspace = \(idea: SavedIdea\) => \{.*?(?=  const handleDeleteSaved = \(id: string\) => \{)',
    new_ideation_logic + '\n',
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Step 5: Ideation connected to Work Items.")

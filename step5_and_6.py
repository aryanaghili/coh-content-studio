import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Ideation Integration
ideation_old = """  const handleCopyIdeaToWorkspace = (idea: SavedIdea) => {
    const hasUnsavedSimple = !!simpleBrief.goal.trim();
    const hasUnsavedQuick = !!quickBrief.goal.trim();
    const hasUnsavedAdvanced = !!advancedBrief.topic.trim();

    if (hasUnsavedSimple || hasUnsavedQuick || hasUnsavedAdvanced) {
      if (!window.confirm("You have unsaved input in the Content Workspace. Do you want to overwrite it with this idea?")) {
        return;
      }
    }

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
  };"""

ideation_new = """  const handleCopyIdeaToWorkspace = (idea: SavedIdea) => {
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
      channel: idea.suggestedChannel || '',
      audience: idea.suggestedAudience || '',
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
      topic: idea.originalInput || idea.title,
      directionMode: 'auto',
      customDirection: '',
      desiredLength: 'Medium: 120-180 words',
      mustInclude: `Original Idea: ${idea.title}\\nAngle: ${idea.category}`,
      mustAvoid: '',
      channel: idea.suggestedChannel || 'LinkedIn',
      outputFormat: 'Post',
      language: 'English',
      audience: idea.suggestedAudience || 'General Public',
      customAudience: '',
      purpose: 'General / Open',
      pillar: 'General / Custom',
      toneIntensity: 3,
      selectedSourceIds: []
    });

    setImportedIdeationContext(idea);
    setActiveTab('content-workspace');
  };"""

content = content.replace(ideation_old, ideation_new)

# Visual Studio Integration
vs_old = """        setVsGeneratedImages(prev => [...processedImages, ...prev]);"""

vs_new = """        setVsGeneratedImages(prev => [...processedImages, ...prev]);
        
        // Attach to Active Work Item
        setActiveWorkItem(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            status: 'Image Generated',
            imageResults: [...processedImages.map(img => ({
              id: img.id,
              url: img.url,
              prompt: img.prompt,
              createdAt: img.createdAt
            })), ...prev.imageResults],
            updatedAt: new Date().toISOString()
          };
        });"""

content = content.replace(vs_old, vs_new)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("Steps 5 and 6 applied.")

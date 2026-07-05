import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

new_image_logic = """
        setVsGeneratedImages(prev => [...processedImages, ...prev]);
        
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
        });
"""

content = re.sub(
    r'setVsGeneratedImages\(prev => \[\.\.\.processedImages, \.\.\.prev\]\);',
    new_image_logic,
    content,
    flags=re.DOTALL
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Step 6: Visual Studio connected to Work Items.")

import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Remove role and supportsOperatingCoreSection from AddSource initialization
content = re.sub(r"role: 'Task Source',?\s*", "", content)
content = re.sub(r"supportsOperatingCoreSection: 'None',?\s*", "", content)

# Remove the Core Documents filter and Suggested Core Documents section from the UI
# Let's use a targeted python script since the UI is large

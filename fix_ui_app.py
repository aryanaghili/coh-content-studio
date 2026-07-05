import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update Subtitle
content = content.replace(
    'A central repository for all source materials used to generate content. Includes standard user-facing context documents as well as foundational Operating Core business strategies.',
    'Store task-specific materials such as event notes, partner profiles, sponsor notes, meeting notes, campaign context, media references, website references, pasted notes, links, and visual references for use in content generation.'
)

# 2. Remove Open Operating Core Button in Source Library Header
open_core_btn_regex = r'\{!isOperatingCoreUnlocked \? \(\s*<button\s+onClick=\{\(\) => setShowOperatingCoreUnlock\(true\)\}\s+className="[^"]*"\s*>\s*<Settings size=\{14\} />\s*Open Operating Core\s*</button>\s*\) : \(\s*<button\s+onClick=\{\(\) => setActiveTab\(\'operating-core\'\)\}\s+className="[^"]*"\s*>\s*<Settings size=\{14\} />\s*Operating Core\s*</button>\s*\)\}'
content = re.sub(open_core_btn_regex, '', content)

# 3. Remove "Suggested Core Documents" section
suggested_core_docs_regex = r'\{/\* Suggested Core Documents \*/\}.*?\{/\* Normal Source Library List \*/\}'
content = re.sub(suggested_core_docs_regex, '{/* Normal Source Library List */}', content, flags=re.DOTALL)

# 4. Remove Core Documents from Filter options
filter_regex = r"<button\s+onClick=\{\(\) => setSourceLibraryFilter\('Core Documents'\)\}.*?Core Documents\s*</button>"
content = re.sub(filter_regex, '', content, flags=re.DOTALL)

# 5. Remove Role field rendering inside Source List
role_render_regex = r'\{source\.role && source\.role !== \'Task Source\' && \(\s*<span className="text-\[9px\] bg-blue-50 text-blue-700 px-1\.5 py-0\.5 rounded font-bold uppercase border border-blue-200">\s*\{source\.role\}\s*</span>\s*\)\}'
content = re.sub(role_render_regex, '', content, flags=re.DOTALL)

# 6. Remove Supports Section field rendering inside Source List
supports_render_regex = r'\{source\.supportsOperatingCoreSection && source\.supportsOperatingCoreSection !== \'None\' && \(\s*<span className="text-\[9px\] bg-purple-50 text-purple-700 px-1\.5 py-0\.5 rounded font-bold uppercase border border-purple-200">\s*Supports: \{source\.supportsOperatingCoreSection\}\s*</span>\s*\)\}'
content = re.sub(supports_render_regex, '', content, flags=re.DOTALL)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("App UI updated")

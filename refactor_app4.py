import re

app_file = "src/App.tsx"
with open(app_file, "r") as f:
    content = f.read()

# Replace all occurrences of:
# onChange={(e) => setExternalContentChannel(e.target.value)}
# with:
# onChange={(e) => { setRevisionSettings(prev => ({...prev, channel: e.target.value})); setSettingsChangedSinceRevision(true); }}

replacements = {
    "setExternalContentChannel": "channel",
    "setExternalContentFormat": "format",
    "setExternalContentLanguage": "targetLanguage",
    "setExternalContentTone": "tone",
    "setExternalContentContext": "optionalContext",
}

for old_func, new_field in replacements.items():
    pattern = r"onChange=\{\(e\) => " + old_func + r"\(e\.target\.value\)\}"
    replacement = r"onChange={(e) => { setRevisionSettings(prev => ({...prev, " + new_field + r": e.target.value})); setSettingsChangedSinceRevision(true); }}"
    content = re.sub(pattern, replacement, content)

with open(app_file, "w") as f:
    f.write(content)

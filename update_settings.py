import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Update state definition
content = content.replace(
    "const [settingsSection, setSettingsSection] = useState<'ai' | 'content_rules'>('ai');",
    "const [settingsSection, setSettingsSection] = useState<'ai' | 'system_status' | 'access_security' | 'storage'>('ai');"
)

# 2. Update tabs mapping
content = content.replace(
    "{([['ai', 'AI Connection'], ['content_rules', 'Content Rules']] as const).map(([key, label]) => (",
    "{([['ai', 'AI Connection']] as const).map(([key, label]) => ("
)

# 3. Add the note under Settings
old_desc = """            <div className="border-b border-coh-gold/20 pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy">Settings</h2>
              <p className="text-sm text-coh-navy/60 font-sans mt-1">
                Configure AI provider, generation mode, and content rules.
              </p>
            </div>"""

new_desc = """            <div className="border-b border-coh-gold/20 pb-6">
              <h2 className="font-serif text-3xl font-normal text-coh-navy">Settings</h2>
              <p className="text-sm text-coh-navy/60 font-sans mt-1 mb-2">
                Configure AI provider and generation mode.
              </p>
              <p className="text-xs text-coh-navy/50 font-sans italic bg-coh-cream/50 p-2 rounded border border-coh-gold/10 inline-block">
                Note: Content, voice, claims, audience, visual, and revision rules are managed in Operating Core. Settings is for technical configuration.
              </p>
            </div>"""

content = content.replace(old_desc, new_desc)

# 4. Remove Content Rules tab
# We need to find the block starting with {/* ── Content Rules ─────────────────────────────────────── */}
start_marker = "{/* ── Content Rules ─────────────────────────────────────── */}"
end_marker = "            )}

        {/* ── Settings Logic Modal ────────────────────────────── */}"

if start_marker in content:
    start_idx = content.find(start_marker)
    # find the matching closing tag
    end_idx = content.find("            )}", start_idx) + len("            )}")
    # actually it's easier to use regex or just simple split if we're careful.
    # The end of the settings sections is before {/* --- END TABS --- */} or whatever is next.
    # Let's just do a regex replace to remove the whole section.

content = re.sub(
    r"\{\/\* ── Content Rules ─────────────────────────────────────── \*\/\}.*?Reset \&amp; Reload Default Content Rules\s*</button>\s*</div>\s*</div>\s*\)}",
    "",
    content,
    flags=re.DOTALL
)

# 5. Fix compiler prompt wording
content = content.replace(
    "Stay anchored to the user’s specific brief. Use Content Rules active only as guidance and fact boundary.",
    "Stay anchored to the user’s specific brief. Use Operating Core active rules only as guidance and fact boundary."
)

content = content.replace(
    "Content Rules active rules are always active separately.",
    "Operating Core rules are always active separately."
)

content = content.replace(
    "// Hierarchy: brief → notes → sources → channel+format → Content Rules active",
    "// Hierarchy: brief → notes → sources → channel+format → Operating Core active"
)
content = content.replace(
    "// Content Rules active is a guardrail / fact boundary, NOT the content itself.",
    "// Operating Core active is a guardrail / fact boundary, NOT the content itself."
)

content = content.replace(
    "<span>Content Rules</span>",
    "<span>Operating Core Rules</span>"
)

with open('src/App.tsx', 'w') as f:
    f.write(content)

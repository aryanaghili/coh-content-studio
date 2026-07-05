import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Quick Actions -> .interactive-pill
# They currently look like: className="px-3 py-1.5 border border-coh-gold/20 rounded text-[11px] text-coh-navy/60 font-medium"
content = re.sub(
    r'(className=")([^"]*border border-coh-gold/20 rounded text-\[11px\] text-coh-navy/60 font-medium[^"]*)(")',
    r'\1\2 interactive-pill\3',
    content
)

# 2. Main Cards in Command Center (Write Content, Explore Ideas, etc.)
# Currently they have bg-white border border-coh-gold/20 p-6 rounded shadow-sm hover:border-coh-gold hover:shadow-md transition cursor-pointer
content = re.sub(
    r'(className=")([^"]*bg-white border border-coh-gold/20 p-6 rounded shadow-sm hover:border-coh-gold hover:shadow-md transition cursor-pointer[^"]*)(")',
    r'\1bg-white border border-coh-gold/20 p-6 rounded shadow-sm interactive-card\3',
    content
)

# 3. Small Text Links (Open Settings, Open Sources, etc.)
# We look for hover:text-coh-gold hover:underline or similar
content = re.sub(
    r'hover:text-coh-gold transition whitespace-nowrap',
    r'interactive-link whitespace-nowrap',
    content
)
content = re.sub(
    r'hover:underline',
    r'interactive-link',
    content
)
content = re.sub(
    r'hover:text-coh-gold transition',
    r'interactive-link transition',
    content
)

# 4. Interactive Tabs (Workspace mode tabs: Simple, Quick Create, Advanced Brief)
# e.g. py-2 px-3 text-xs font-bold uppercase tracking-wider text-coh-navy/60 hover:text-coh-navy hover:bg-coh-gold/5
content = re.sub(
    r'hover:text-coh-navy hover:bg-coh-gold/5 transition',
    r'interactive-tab transition',
    content
)

# 5. Upload Zones
# border-2 border-dashed border-coh-gold/20 rounded p-8 text-center hover:border-coh-gold hover:bg-coh-gold/5 transition cursor-pointer
content = re.sub(
    r'border-2 border-dashed border-coh-gold/20 rounded p-8 text-center hover:border-coh-gold hover:bg-coh-gold/5 transition cursor-pointer',
    r'border-2 border-coh-gold/20 rounded p-8 text-center interactive-upload',
    content
)

# 6. Disabled elements
content = re.sub(
    r'(disabled=\{[^\}]+\}\s*className="[^"]*opacity-50 cursor-not-allowed)',
    r'\1 disabled-interactive',
    content
)

with open('src/App.tsx', 'w') as f:
    f.write(content)


# Also do OperatingCoreAdmin.tsx
with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    admin_content = f.read()

admin_content = re.sub(
    r'hover:text-coh-gold transition',
    r'interactive-link transition',
    admin_content
)

admin_content = re.sub(
    r'hover:text-coh-navy hover:bg-coh-gold/5 transition',
    r'interactive-tab transition',
    admin_content
)

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(admin_content)

print("Component classes patched")

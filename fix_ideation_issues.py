import re

file_path = "src/components/ui/Card.tsx"
with open(file_path, "r") as f:
    content = f.read()

content += "\nexport function CardContent({ children, className = '' }: { children: React.ReactNode, className?: string }) {\n  return <div className={`px-5 pb-5 ${className}`}>{children}</div>;\n}\n"
content += "\nexport function CardFooter({ children, className = '' }: { children: React.ReactNode, className?: string }) {\n  return <div className={`px-5 py-4 bg-surface-inset border-t border-border-standard ${className}`}>{children}</div>;\n}\n"

with open(file_path, "w") as f:
    f.write(content)

print("Updated Card.tsx")

app_path = "src/App.tsx"
with open(app_path, "r") as f:
    app_content = f.read()

# Fix Badge secondary to outline
app_content = app_content.replace('variant={idea.status === \'Promising\' ? \'default\' : \'secondary\'}', 'variant={idea.status === \'Promising\' ? \'default\' : \'outline\'}')

# Fix Select options in Ideation Workspace
# Target Channel
app_content = re.sub(
    r'<Select\s+value=\{ideationFilterChannel\}\s+onChange=\{\(e\) => setIdeationFilterChannel\(e\.target\.value\)\}\s*>\s*\{CHANNELS\.slice\(0, 7\)\.map\(c => \(\s*<option key=\{c\} value=\{c\}>\{c\}</option>\s*\)\)\}\s*</Select>',
    r'<Select value={ideationFilterChannel} onChange={(e) => setIdeationFilterChannel(e.target.value)} options={CHANNELS.slice(0, 7).map(c => ({label: c, value: c}))} />',
    app_content
)

# Language
app_content = re.sub(
    r'<Select\s+value=\{ideationFilterLanguage\}\s+onChange=\{\(e\) => setIdeationFilterLanguage\(e\.target\.value\)\}\s*>\s*\{LANGUAGES\.map\(l => \(\s*<option key=\{l\.id\} value=\{l\.label\}>\{l\.label\}</option>\s*\)\)\}\s*</Select>',
    r'<Select value={ideationFilterLanguage} onChange={(e) => setIdeationFilterLanguage(e.target.value)} options={LANGUAGES.map(l => ({label: l.label, value: l.label}))} />',
    app_content
)

# Quality Filter
q_opts = "options={[{label: 'Practical', value: 'Practical'}, {label: 'Bold', value: 'Bold'}, {label: 'Educational', value: 'Educational'}, {label: 'Emotional', value: 'Emotional'}, {label: 'Sponsor-facing', value: 'Sponsor-facing'}, {label: 'Public-facing', value: 'Public-facing'}, {label: 'Artistic', value: 'Artistic'}, {label: 'Institutional', value: 'Institutional'}, {label: 'Campaign-ready', value: 'Campaign-ready'}]}"
app_content = re.sub(
    r'<Select\s+value=\{ideationFilterQuality\}\s+onChange=\{\(e\) => setIdeationFilterQuality\(e\.target\.value\)\}\s*>\s*<option.*?/Select>',
    rf'<Select value={{ideationFilterQuality}} onChange={{(e) => setIdeationFilterQuality(e.target.value)}} {q_opts} />',
    app_content,
    flags=re.DOTALL
)

# Depth Level
d_opts = "options={[{label: 'Light', value: 'Light'}, {label: 'Standard', value: 'Standard'}, {label: 'Deep', value: 'Deep'}, {label: 'Experimental', value: 'Experimental'}]}"
app_content = re.sub(
    r'<Select\s+value=\{ideationFilterDepth\}\s+onChange=\{\(e\) => setIdeationFilterDepth\(e\.target\.value\)\}\s*>\s*<option.*?/Select>',
    rf'<Select value={{ideationFilterDepth}} onChange={{(e) => setIdeationFilterDepth(e.target.value)}} {d_opts} />',
    app_content,
    flags=re.DOTALL
)

# Target Audience
a_opts = "options={[{label: 'General Public', value: 'General Public'}, {label: 'Sponsors & Patrons', value: 'Sponsors & Patrons'}, {label: 'Strategic Partners', value: 'Strategic Partners'}]}"
app_content = re.sub(
    r'<Select\s+value=\{ideationFilterAudience\}\s+onChange=\{\(e\) => setIdeationFilterAudience\(e\.target\.value\)\}\s*>\s*<option.*?/Select>',
    rf'<Select value={{ideationFilterAudience}} onChange={{(e) => setIdeationFilterAudience(e.target.value)}} {a_opts} />',
    app_content,
    flags=re.DOTALL
)

with open(app_path, "w") as f:
    f.write(app_content)

print("Updated App.tsx")

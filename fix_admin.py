import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

# Add useState inside OperatingCoreAdmin
if 'const [extractingInsightFor' not in content:
    content = content.replace(
        'export default function OperatingCoreAdmin({ core, sourceLibrary = [], onSave, onReset, onAddNewCoreSource, onLinkExistingSource }: Props) {',
        'export default function OperatingCoreAdmin({ core, sourceLibrary = [], onSave, onReset, onAddNewCoreSource, onLinkExistingSource }: Props) {\n  const [extractingInsightFor, setExtractingInsightFor] = useState<string | null>(null);'
    )

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Fixed useState in OperatingCoreAdmin")

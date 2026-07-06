import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Strip out properties completely
content = re.sub(r"\s*role:\s*('[^']*'|\"[^\"]*\"),?", "", content)
content = re.sub(r"\s*supportsOperatingCoreSection:\s*('[^']*'|\"[^\"]*\"),?", "", content)
content = re.sub(r"\s*useFor:\s*('[^']*'|\"[^\"]*\"),?", "", content)
# Also fix the Suggested Core Documents type error
content = re.sub(r"type: 'Business Memo' \| 'Deck',", "type: 'Other',", content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
print("SourceFile TS errors regex cleaned.")

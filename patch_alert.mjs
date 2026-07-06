import fs from 'fs';

let content = fs.readFileSync('src/components/OperatingCoreAdmin.tsx', 'utf8');

if (!content.includes('import { useToast } from')) {
  content = content.replace(
    /import React, \{ useState, useEffect \} from 'react';/,
    "import React, { useState, useEffect } from 'react';\nimport { useToast } from './ui/Toast';"
  );
  
  content = content.replace(
    /export default function OperatingCoreAdmin\(\{/,
    "export default function OperatingCoreAdmin({\n"
  );
  
  // We need to inject `const { showToast } = useToast();` at the beginning of the component
  content = content.replace(
    /export default function OperatingCoreAdmin\(\{[\s\S]*?\}\: Props\) \{/,
    "$& \n  const { showToast } = useToast();\n"
  );

  content = content.replace(
    /alert\('Insights saved and queued for compiler injection!'\);/g,
    "showToast('Insights saved and queued for compiler injection!', 'success');"
  );

  content = content.replace(
    /alert\('In a full implementation, this opens the exact target pane \(e\.g\. Audiences\) and copies the text\.'\);/g,
    "showToast('In a full implementation, this opens the exact target pane (e.g. Audiences) and copies the text.', 'info');"
  );

  fs.writeFileSync('src/components/OperatingCoreAdmin.tsx', content, 'utf8');
}

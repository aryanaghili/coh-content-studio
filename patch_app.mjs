import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Imports
if (!content.includes('ErrorBoundary')) {
  content = content.replace(
    "import { DEFAULT_COH_SOURCES } from './data/defaultSources';",
    "import { DEFAULT_COH_SOURCES } from './data/defaultSources';\nimport { ErrorBoundary } from './components/ErrorBoundary';\nimport { safeMergeOperatingCore } from './lib/operatingCore';"
  );
}

// 2. Safe merge of Operating Core
const mergeRegex = /setOperatingCore\(JSON\.parse\(saved\)\);/g;
content = content.replace(mergeRegex, 'setOperatingCore(safeMergeOperatingCore(JSON.parse(saved)));');

// 3. Remove alert() completely. Let's look for standard ones and replace them with console.warn or setAiLastError where applicable.
content = content.replace(/alert\('Could not log out. Please refresh.'\);/g, "console.error('Could not log out. Please refresh.');");
content = content.replace(/alert\("Please configure an AI provider first."\);/g, "setAiLastError('Please configure an AI provider first.');");
content = content.replace(/alert\(err\.message \|\| 'AI Ideation failed.'\);/g, "setAiLastError(err.message || 'AI Ideation failed.');");
content = content.replace(/alert\('This idea is already saved in your library.'\);/g, "console.warn('This idea is already saved in your library.');");
content = content.replace(/alert\(`Updated existing item(.*)`\);/g, "console.log(`Updated existing item$1`);");
content = content.replace(/alert\(`Saved to Content Library(.*)`\);/g, "console.log(`Saved to Content Library$1`);");
content = content.replace(/alert\("Saved to library."\);/g, "console.log('Saved to library');");
content = content.replace(/alert\('Copied(.*)'\);/g, "/* Copied handled by state */");

// 4. Update aiService
const oldAiServiceGenerate = `    async generate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed.');
      return data;
    },`;
const newAiServiceGenerate = `    async generate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) {
          throw new Error(data.error || data.userMessage || 'AI generation failed.');
      }
      return data; 
    },`;

content = content.replace(oldAiServiceGenerate, newAiServiceGenerate);

const oldAiServiceIdeate = `    async ideate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI ideation failed.');
      return data;
    },`;
const newAiServiceIdeate = `    async ideate(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.userMessage || 'AI ideation failed.');
      return data;
    },`;
content = content.replace(oldAiServiceIdeate, newAiServiceIdeate);

const oldAiServiceRevise = `    async revise(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI revision failed.');
      return data;
    },`;
const newAiServiceRevise = `    async revise(input: Record<string, unknown>) {
      const res = await fetch('/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.userMessage || 'AI revision failed.');
      return data;
    },`;
content = content.replace(oldAiServiceRevise, newAiServiceRevise);

// 5. Update Ideation handler (handleGenerateIdeas)
content = content.replace(/const result = await aiService\.ideate\(payload\);\s*setGeneratedIdeas\(result\.ideas \|\| \[\]\);\s*setIdeationFilterChannel\('All'\);\s*\} catch \(err: any\) \{/g, 
  `const envelope = await aiService.ideate(payload);
          if (!envelope.success) {
            setAiLastError(envelope.userMessage || 'Failed to generate ideas.');
            if (envelope.fallbackText) {
               setGeneratedIdeas([{ title: "Fallback Output", concept: envelope.fallbackText }]);
            }
          } else {
            setGeneratedIdeas(envelope.data?.ideas || []);
            setIdeationFilterChannel('All');
          }
        } catch (err: any) {`);

// 6. Update handleGenerateDrafts
content = content.replace(/const result = await aiService\.generate\(payload\);\s*if \(result\) \{\s*setActiveDraftText\(result\.draftCopy \|\| ''\);\s*setAuditResults\(result\.qualityCheck\);\s*const baseTitle = isSimple \? `\$\{simpleBrief\.channel\} Draft` : \(isQuick \? `\$\{quickBrief\.channel\} \$\{quickBrief\.format\} Draft` : `\$\{advancedBrief\.channel\} \$\{advancedBrief\.format\} Draft`\);\s*setActiveDraftTitle\(baseTitle\);\s*const actionLabel = `Generated via \$\{isSimple \? 'Simple Mode' : \(isQuick \? 'Quick Create' : 'Advanced Brief'\)\}`;\s*setActiveDraftHistory\(\[\{\s*version: 1,\s*text: result\.draftCopy \|\| '',\s*timestamp: new Date\(\)\.toLocaleTimeString\(\),\s*actionUsed: actionLabel\s*\}\]\);\s*setActiveDraftVersion\(1\);\s*\}\s*\} catch \(err: any\) \{/g, 
  `const envelope = await aiService.generate(payload);
          if (!envelope.success) {
            setAiLastError(envelope.userMessage || 'Failed to generate draft.');
            if (envelope.fallbackText) {
                setActiveDraftText(envelope.fallbackText);
                setActiveDraftHistory([{ version: 1, text: envelope.fallbackText, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Fallback Generation' }]);
                setActiveDraftVersion(1);
            }
          } else {
            const result = envelope.data;
            if (result) {
              setActiveDraftText(result.draftCopy || '');
              setAuditResults(result.qualityCheck);
              const baseTitle = isSimple ? \`\${simpleBrief.channel} Draft\` : (isQuick ? \`\${quickBrief.channel} \${quickBrief.format} Draft\` : \`\${advancedBrief.channel} \${advancedBrief.format} Draft\`);
              setActiveDraftTitle(baseTitle);
              const actionLabel = \`Generated via \${isSimple ? 'Simple Mode' : (isQuick ? 'Quick Create' : 'Advanced Brief')}\`;
              setActiveDraftHistory([{
                version: 1,
                text: result.draftCopy || '',
                timestamp: new Date().toLocaleTimeString(),
                actionUsed: actionLabel
              }]);
              setActiveDraftVersion(1);
            }
          }
        } catch (err: any) {`);

// 7. Update handleGeneratePacks (Multi-Channel Pack)
content = content.replace(/const result = await aiService\.generate\(payload\);\s*if \(result && result\.channels\) \{\s*setGeneratedMultiPack\(result\.channels\);\s*setAuditResults\(result\.qualityCheck\);\s*\}\s*\} catch \(err: any\) \{/g,
  `const envelope = await aiService.generate(payload);
          if (!envelope.success) {
            setAiLastError(envelope.userMessage || 'Failed to generate pack.');
            if (envelope.fallbackText) {
               setGeneratedMultiPack([{ channel: 'Fallback', format: 'Text', draftCopy: envelope.fallbackText }]);
            }
          } else {
            const result = envelope.data;
            if (result && result.channels) {
              setGeneratedMultiPack(result.channels);
              setAuditResults(result.qualityCheck);
            }
          }
        } catch (err: any) {`);

// 8. Update applyRevision
content = content.replace(/const result = await aiService\.revise\(payload\);\s*setRevisionSuccessAction\(action\);\s*setTimeout\(\(\) => setRevisionSuccessAction\(null\), 2500\);\s*if \(result\) \{\s*let actionLabel = REVISION_ACTIONS\.find\(a => a\.id === action\)\?\.label \|\| action;/g,
  `const envelope = await aiService.revise(payload);
          if (!envelope.success) {
            setActiveRevisionError(envelope.userMessage || 'Failed to revise text.');
            if (envelope.fallbackText) {
               const newVersion = activeDraftVersion + 1;
               setActiveDraftVersion(newVersion);
               setActiveDraftText(envelope.fallbackText);
               setActiveDraftHistory(prev => [
                 ...prev,
                 { version: newVersion, text: envelope.fallbackText, timestamp: new Date().toLocaleTimeString(), actionUsed: 'Fallback Revision' }
               ]);
            }
          } else {
            setRevisionSuccessAction(action);
            setTimeout(() => setRevisionSuccessAction(null), 2500);
            const result = envelope.data;
            if (result) {
              let actionLabel = REVISION_ACTIONS.find(a => a.id === action)?.label || action;`);


// 9. ErrorBoundaries
content = content.replace(/\{activeTab === 'ideation' && \(/g, "{activeTab === 'ideation' && (<ErrorBoundary fallbackTitle=\"Ideation Workspace Error\">");
content = content.replace(/\{activeTab === 'content-workspace' && \(/g, "{activeTab === 'content-workspace' && (<ErrorBoundary fallbackTitle=\"Content Workspace Error\">");
content = content.replace(/\{activeTab === 'visual-studio' && \(/g, "{activeTab === 'visual-studio' && (<ErrorBoundary fallbackTitle=\"Visual Studio Error\">");
content = content.replace(/\{activeTab === 'revision-studio' && \(/g, "{activeTab === 'revision-studio' && (<ErrorBoundary fallbackTitle=\"Revision Studio Error\">");
content = content.replace(/\{activeTab === 'operating-core' && \(/g, "{activeTab === 'operating-core' && (<ErrorBoundary fallbackTitle=\"Operating Core Error\">");
content = content.replace(/\{activeTab === 'content-library' && \(/g, "{activeTab === 'content-library' && (<ErrorBoundary fallbackTitle=\"Content Library Error\">");
content = content.replace(/\{activeTab === 'idea-library' && \(/g, "{activeTab === 'idea-library' && (<ErrorBoundary fallbackTitle=\"Idea Library Error\">");
content = content.replace(/\{activeTab === 'source-library' && \(/g, "{activeTab === 'source-library' && (<ErrorBoundary fallbackTitle=\"Source Library Error\">");
content = content.replace(/\{activeTab === 'settings' && \(/g, "{activeTab === 'settings' && (<ErrorBoundary fallbackTitle=\"Settings Error\">");

function closeErrorBoundaries(text) {
  const boundaries = ['ideation', 'content-workspace', 'visual-studio', 'revision-studio', 'operating-core', 'content-library', 'idea-library', 'source-library', 'settings'];
  for (const b of boundaries) {
    const searchStr = `{activeTab === '${b}' && (<ErrorBoundary fallbackTitle="`;
    const idx = text.indexOf(searchStr);
    if (idx === -1) continue;
    let openCount = 0;
    for (let i = idx; i < text.length; i++) {
       if (text[i] === '{') openCount++;
       if (text[i] === '}') {
          openCount--;
          if (openCount === 0) {
             let j = i - 1;
             while (text[j] !== ')' && j > 0) j--;
             if (text[j] === ')') {
                 text = text.substring(0, j) + "\n</ErrorBoundary>" + text.substring(j);
             }
             break;
          }
       }
    }
  }
  return text;
}
content = closeErrorBoundaries(content);

// 10. Replace unsafe access
content = content.replace(/operatingCore\.corePassport\.organizationName/g, "operatingCore?.corePassport?.organizationName");
content = content.replace(/operatingCore\.corePassport\.currentStrategicPhase/g, "operatingCore?.corePassport?.currentStrategicPhase");
content = content.replace(/draftCore\.corePassport\.organizationName/g, "draftCore?.corePassport?.organizationName");
content = content.replace(/activeWorkItem\.title/g, "(activeWorkItem?.title || 'Standalone Draft')");
content = content.replace(/activeWorkItem\.suggestedChannel/g, "(activeWorkItem?.suggestedChannel || '')");
content = content.replace(/activeWorkItem\.concept/g, "(activeWorkItem?.concept || '')");

fs.writeFileSync('src/App.tsx', content, 'utf8');

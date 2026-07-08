const fs = require('fs');
const logPath = '/Users/aryanaghili/.gemini/antigravity/brain/f7550636-30ae-4165-84ab-d592a40650f0/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(logPath, 'utf-8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  try {
    const json = JSON.parse(line);
    if (json.content && json.content.includes('Controls Panel') && json.content.includes('Calendar Canvas')) {
       console.log("Match found:\n" + json.content.substring(json.content.indexOf('Controls Panel') - 100, json.content.indexOf('Controls Panel') + 1000));
       process.exit(0);
    }
  } catch (e) {}
}

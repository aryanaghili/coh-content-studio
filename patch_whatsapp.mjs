import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Remove "Briefing Workspace" heading
const briefingHeading = `<h3 className="font-serif text-xl font-normal text-coh-navy">Briefing Workspace</h3>`;
content = content.replace(briefingHeading, '');

// 2. Add WhatsApp to CHANNELS
content = content.replace(
  `  'Email / Direct Outreach',`,
  `  'Email / Direct Outreach',\n  'WhatsApp',`
);

// 3. Add WhatsApp to CHANNEL_FORMATS
content = content.replace(
  `  'Email / Direct Outreach': ['WhatsApp Message', 'Email / Letter', 'Sponsor Pitch Paragraph', 'Partner Note', 'Follow-Up Note', 'Invitation Note'],`,
  `  'Email / Direct Outreach': ['Email / Letter', 'Sponsor Pitch Paragraph', 'Partner Note', 'Follow-Up Note', 'Invitation Note'],\n  'WhatsApp': ['WhatsApp Message', 'Follow-Up Note'],`
);

// 4. Update compileStructuredPrompt (line ~4100) to include rules for WhatsApp
const rulesString = `const channelRules = \`
CHANNEL-SPECIFIC RULES:
- LinkedIn: LinkedIn requires a hook line at the very top (never start with "Dear" or a generic title).`;
const newRulesString = `const channelRules = \`
CHANNEL-SPECIFIC RULES:
- WhatsApp: Must be short, warm, direct, and conversational. Usually 1 to 3 short paragraphs. No subject line, no formal "Dear...", no email structure, no hashtags, no long article paragraphs, no corporate tone. The CTA should feel natural (e.g., "Let me know what you think.", "Would this be useful to discuss?"). If language is Persian, make it natural, colloquial, and spoken, avoiding formal written Persian. If English, keep it concise and professional but human.
- LinkedIn: LinkedIn requires a hook line at the very top (never start with "Dear" or a generic title).`;
content = content.replace(rulesString, newRulesString);

// 5. Check format overrides if necessary
const emailLine = `if (fmt === 'email / letter') return renderEmailLetter(plan, interp, goal);`;
const whatsAppLogic = `    if (ch.includes('whatsapp') || fmt === 'whatsapp message') {
      return \`Write a short, conversational WhatsApp message based on the following:
Plan: \${plan.join(' ')}
Goal: \${goal}
Constraints: No subject line, no formal greetings like "Dear", no hashtags, no corporate jargon. Keep it 1-3 short paragraphs. End with a natural, conversational CTA.\`;
    }
    `;

if(!content.includes("fmt === 'whatsapp message'")) {
    content = content.replace(emailLine, whatsAppLogic + "\n    " + emailLine);
}

fs.writeFileSync('src/App.tsx', content, 'utf8');

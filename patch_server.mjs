import fs from 'fs';

let content = fs.readFileSync('server.js', 'utf8');

// For /api/ai/generate, /api/ai/ideate, /api/ai/revise
// We want to make sure they return the new envelope structure. Since adapter returns the envelope,
// if there is an error thrown *before* adapter (like missing input), we should return a standard failure envelope.
const searchGenerate = `    if (!input || !input.rawInput) {
      return res.status(400).json({ error: 'rawInput is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.status(503).json({
        error: 'AI provider is not connected. Configure a provider in Settings first.',
        fallback: true,
      });
    }`;

const replaceGenerate = `    if (!input || !input.rawInput) {
      return res.json({ success: false, errorType: 'VALIDATION_ERROR', userMessage: 'rawInput is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.json({ success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'AI provider is not connected. Configure a provider in Settings first.' });
    }`;

content = content.replace(searchGenerate, replaceGenerate);

const searchIdeate = `    if (!input.rawInput) {
      return res.status(400).json({ error: 'rawInput is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.status(503).json({
        error: 'AI provider is not connected. Configure a provider in Settings first.',
        fallback: true,
      });
    }`;
const replaceIdeate = `    if (!input.rawInput) {
      return res.json({ success: false, errorType: 'VALIDATION_ERROR', userMessage: 'rawInput is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.json({ success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'AI provider is not connected. Configure a provider in Settings first.' });
    }`;
content = content.replace(searchIdeate, replaceIdeate);

const searchRevise = `    if (!input.previousDraft) {
      return res.status(400).json({ error: 'previousDraft is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.status(503).json({
        error: 'AI provider is not connected. Configure a provider in Settings first.',
        fallback: true,
      });
    }`;
const replaceRevise = `    if (!input.previousDraft) {
      return res.json({ success: false, errorType: 'VALIDATION_ERROR', userMessage: 'previousDraft is required.' });
    }
    if (!providerManager.isConnected()) {
      return res.json({ success: false, errorType: 'CONFIGURATION_ERROR', userMessage: 'AI provider is not connected. Configure a provider in Settings first.' });
    }`;
content = content.replace(searchRevise, replaceRevise);

// Also replace the catch block in these routes to return 200 OK with success=false instead of 500 error
content = content.replace(/res\.status\(500\)\.json\(\{\s*error:\s*friendlyServerError\(err\)\s*\}\);/g, "res.json({ success: false, errorType: 'SERVER_ERROR', userMessage: friendlyServerError(err), debug: { message: err.message } });");


fs.writeFileSync('server.js', content, 'utf8');

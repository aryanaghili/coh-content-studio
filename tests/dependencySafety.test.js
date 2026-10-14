import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function collectSourceFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
    } else if (/\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

test('COH-SEC-01: SheetJS remains export-only and is never used to parse workbook input', () => {
  const sourceFiles = collectSourceFiles('src');
  const sheetJsFiles = sourceFiles.filter(file => {
    const source = fs.readFileSync(file, 'utf8');
    return /(?:from\s+['\"]xlsx['\"]|require\(['\"]xlsx['\"]\)|\bXLSX\.)/.test(source);
  });

  assert.ok(sheetJsFiles.length > 0, 'Expected the existing spreadsheet export integration to remain detectable.');

  for (const file of sheetJsFiles) {
    const source = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(
      source,
      /\bXLSX\.(?:read|readFile|readFileSync)\s*\(/,
      `${file} must not use the legacy xlsx dependency to parse workbook input.`
    );
  }
});

import { spawnSync } from 'node:child_process';

const result = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  shell: false
});

let report;
try {
  report = JSON.parse(result.stdout || '{}');
} catch (error) {
  console.error('Unable to parse npm audit output.');
  if (result.stderr) console.error(result.stderr);
  process.exit(1);
}

const allowedHighAdvisories = new Set(['xlsx']);
const blocking = [];
const acknowledged = [];

for (const [name, advisory] of Object.entries(report.vulnerabilities || {})) {
  const severity = String(advisory?.severity || '').toLowerCase();
  if (!['high', 'critical'].includes(severity)) continue;

  if (severity === 'high' && allowedHighAdvisories.has(name)) {
    acknowledged.push(`${name} (${severity})`);
    continue;
  }

  blocking.push(`${name} (${severity})`);
}

if (acknowledged.length > 0) {
  console.log(`Acknowledged bounded production advisory: ${acknowledged.join(', ')}.`);
  console.log('SheetJS is retained only for client-side workbook export and is separately guarded against workbook parsing by COH-SEC-01.');
}

if (blocking.length > 0) {
  console.error(`Blocking production dependency advisories: ${blocking.join(', ')}`);
  process.exit(1);
}

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

console.log('Production dependency policy passed: no unacknowledged high or critical advisories.');

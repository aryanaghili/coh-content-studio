import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

const replacements = [
  // Command Center
  {
    find: '<div className="space-y-8 animate-fadeIn max-w-6xl">',
    replace: '<div className="page-shell">'
  },
  // Header styles
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy mb-1">Command Center</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Command Center</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy mb-2">Ideation Workspace</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Ideation Workspace</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy">Idea Library</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Idea Library</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy">Visual Studio</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Visual Studio</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy">Revision Studio</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Revision Studio</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy">Content Library</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Content Library</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy">Source Library</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Source Library</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-3xl font-normal text-coh-navy">Settings</h2>',
    replace: '<div className="page-header"><h2 className="page-title">Settings</h2></div>'
  },
  {
    find: '<h2 className="font-serif text-2xl font-bold text-coh-navy">Content Workspace</h2>',
    replace: '<h2 className="page-title">Content Workspace</h2>'
  },
  // Content workspace wrapper
  {
    find: '<div className="space-y-8 animate-fadeIn">',
    replace: '<div className="page-shell">'
  },
  {
    find: '<div className="space-y-6 animate-fadeIn max-w-7xl mx-auto">',
    replace: '<div className="page-shell">' // wait, is this the one? Let's replace both just in case.
  },
  // Settings wrapper
  {
    find: '<div className="space-y-8 animate-fadeIn max-w-4xl">',
    replace: '<div className="page-shell-narrow">'
  }
];

let changedCount = 0;
for (const r of replacements) {
  let count = content.split(r.find).length - 1;
  content = content.replaceAll(r.find, r.replace);
  if (count > 0) changedCount += count;
  else console.log("Not found:", r.find.substring(0, 50));
}

console.log(`Made ${changedCount} replacements for Page Shells.`);

fs.writeFileSync('src/App.tsx', content, 'utf8');


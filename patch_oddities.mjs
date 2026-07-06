import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Content Workspace labels
content = content.replace(
  '<h3 className="font-serif text-lg mb-1 text-coh-navy font-bold flex items-center justify-between">\n                      Briefing Workspace',
  '<h3 className="font-serif text-lg mb-1 text-coh-navy font-bold flex items-center justify-between">\n                      Content Workspace'
);

content = content.replaceAll(
  '<label className="block text-[11px] uppercase tracking-wider font-bold text-coh-navy mb-2">URL Context</label>',
  '<label className="form-label">URL</label>'
);
content = content.replaceAll(
  '<label className="block text-[11px] uppercase tracking-wider font-bold text-coh-navy mb-2">Pasted Text Context</label>',
  '<label className="form-label">Pasted Text</label>'
);
content = content.replaceAll(
  '<label className="block text-[11px] uppercase tracking-wider font-bold text-coh-navy mb-2">File Upload Context</label>',
  '<label className="form-label">File Upload</label>'
);
content = content.replaceAll(
  '<div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm h-fit space-y-4">',
  '<div className="card space-y-4">'
);
content = content.replaceAll(
  '<div className="bg-white border border-coh-gold/20 p-5 rounded shadow-sm h-fit max-h-[85vh] overflow-y-auto space-y-5">',
  '<div className="card max-h-[85vh] overflow-y-auto space-y-5">'
);

// 2. Visual Studio Tabs
content = content.replace(
  '<button\n                          onClick={() => setVisualInputMode(\'prompt\')}\n                          className={`flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded transition ${visualInputMode === \'prompt\' ? \'bg-coh-navy text-coh-cream\' : \'bg-transparent text-coh-navy/60 hover:bg-coh-navy/5\'}`}\n                        >\n                          Manual Prompt\n                        </button>',
  '<button\n                          onClick={() => setVisualInputMode(\'prompt\')}\n                          className={`interactive-tab flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded transition ${visualInputMode === \'prompt\' ? \'bg-coh-navy text-coh-cream\' : \'bg-transparent text-coh-navy/60 hover:bg-coh-navy/5\'}`}\n                        >\n                          Manual Prompt\n                        </button>'
);

content = content.replace(
  '<button\n                          onClick={() => setVisualInputMode(\'direction\')}\n                          className={`flex-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider rounded transition ${visualInputMode === \'direction\' ? \'bg-coh-navy text-coh-cream\' : \'bg-transparent text-coh-navy/60 hover:bg-coh-navy/5\'}`}\n                        >\n                          Imported Visual Direction\n                        </button>',
  '<button\n                          onClick={() => setVisualInputMode(\'direction\')}\n                          className={`interactive-tab flex-1 py-2 text-center text-xs font-bold uppercase tracking-wider rounded transition ${visualInputMode === \'direction\' ? \'bg-coh-navy text-coh-cream\' : \'bg-transparent text-coh-navy/60 hover:bg-coh-navy/5\'}`}\n                        >\n                          Imported Visual Direction\n                        </button>'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Patched oddities");

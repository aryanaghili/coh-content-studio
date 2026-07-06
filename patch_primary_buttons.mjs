import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace "Generate" button in Content Workspace
content = content.replace(
  '<button\n                    onClick={handleGenerateDrafts}\n                    disabled={isGeneratingDrafts}\n                    className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-3 rounded font-serif text-xs font-semibold transition border border-coh-gold/20 flex items-center justify-center gap-2 action-button interactive-button"\n                  >',
  '<Button onClick={handleGenerateDrafts} disabled={isGeneratingDrafts} variant="primary" size="lg" className="w-full">'
);
content = content.replace(
  '                    {isGeneratingDrafts ? \'Generating...\' : \'Generate\'}\n                  </button>',
  '                    {isGeneratingDrafts ? \'Generating...\' : \'Generate\'}\n                  </Button>'
);

// Replace "Generate" button in Visual Studio
content = content.replace(
  '<button\n                      onClick={handleGenerateImage}\n                      disabled={isGeneratingImage || !aiProvider}\n                      className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-3 rounded font-serif text-xs font-semibold transition border border-coh-gold/20 flex items-center justify-center gap-2 action-button interactive-button"\n                    >',
  '<Button onClick={handleGenerateImage} disabled={isGeneratingImage || !aiProvider} variant="primary" size="lg" className="w-full">'
);
content = content.replace(
  '                      {isGeneratingImage ? \'Generating...\' : \'Generate\'}\n                    </button>',
  '                      {isGeneratingImage ? \'Generating...\' : \'Generate\'}\n                    </Button>'
);

// Replace "Generate Ideas" or "Explore Ideas" in Command Center
content = content.replace(
  '<button\n                        onClick={() => setActiveTab(\'ideation-workspace\')}\n                        className="bg-coh-navy text-white text-[10px] font-bold py-1.5 px-3 rounded uppercase self-start flex items-center gap-1 action-button interactive-button"',
  '<Button onClick={() => setActiveTab(\'ideation-workspace\')} variant="secondary" size="sm" className="uppercase">'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log("Patched primary buttons");

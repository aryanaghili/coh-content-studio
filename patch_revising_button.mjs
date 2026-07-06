import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace Start Revising button
content = content.replace(
  '<button\n                          onClick={handleStartExternalRevision}\n                          disabled={!externalContentText.trim()}\n                          className="cursor-not-allowed opacity-50 bg-coh-navy text-coh-gold hover:bg-coh-navy-light px-6 py-2.5 rounded font-serif text-sm font-semibold transition disabled:opacity-50 action-button interactive-button"\n                        >',
  '<Button onClick={handleStartExternalRevision} disabled={!externalContentText.trim()} variant="secondary" className="px-6 py-2.5">'
);
content = content.replace(
  '                        </button>\n                      </div>\n                    </div>\n                  </div>\n                )}',
  '                        </Button>\n                      </div>\n                    </div>\n                  </div>\n                )}'
);

// Replace Apply Custom Revision button
content = content.replace(
  '<button\n                      onClick={() => applyRevision(\'custom-instruction\')}\n                      disabled={!customRevisionInstruction.trim() || activeRevisionAction !== null}\n                      className="w-full bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 rounded text-[11px] font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1.5"\n                    >',
  '<Button onClick={() => applyRevision(\'custom-instruction\')} disabled={!customRevisionInstruction.trim() || activeRevisionAction !== null} variant="secondary" className="w-full py-2">'
);
content = content.replace(
  '                      {activeRevisionAction === \'custom-instruction\' && <span className="animate-spin text-[10px]">⚙️</span>}\n                    </button>',
  '                      {activeRevisionAction === \'custom-instruction\' && <span className="animate-spin text-[10px]">⚙️</span>}\n                    </Button>'
);

// Replace Save to Library buttons in Revision Studio
content = content.replace(
  '<button\n                          disabled={isSavingToLibrary}\n                          onClick={() => handleSaveVersionToLibrary(false)}\n                          className="bg-coh-navy text-coh-gold hover:bg-coh-navy-light py-2 px-4 rounded text-[11px] font-serif font-semibold border border-coh-gold/20 transition disabled:opacity-50"\n                        >\n                          {isSavingToLibrary ? \'Saving...\' : \'Save to Library\'}\n                        </button>',
  '<Button disabled={isSavingToLibrary} onClick={() => handleSaveVersionToLibrary(false)} variant="secondary" size="sm">{isSavingToLibrary ? \'Saving...\' : \'Save to Library\'}</Button>'
);

content = content.replace(
  '<button\n                          disabled={isSavingToLibrary}\n                          onClick={() => handleSaveVersionToLibrary(true)}\n                          className="bg-coh-gold text-coh-navy hover:bg-coh-gold-dark py-2 px-4 rounded text-[11px] font-serif font-semibold transition disabled:opacity-50"\n                        >\n                          {isSavingToLibrary ? \'Saving...\' : \'Approve & Save\'}\n                        </button>',
  '<Button disabled={isSavingToLibrary} onClick={() => handleSaveVersionToLibrary(true)} variant="primary" size="sm">{isSavingToLibrary ? \'Saving...\' : \'Approve & Save\'}</Button>'
);

fs.writeFileSync('src/App.tsx', content, 'utf8');

import re

with open('src/components/OperatingCoreAdmin.tsx', 'r') as f:
    content = f.read()

suggested_logic = """
              <div className="bg-white border border-coh-gold/20 p-4 rounded shadow-sm mb-8">
                <h4 className="font-serif text-sm font-bold text-coh-navy mb-2">Suggested Core Documents, not uploaded yet:</h4>
                <ul className="text-xs text-coh-navy/60 list-disc list-inside space-y-1">
                  {[
                    "COH Business Model",
                    "COH Business Memo",
                    "COH Phase 1 Strategic Plan",
                    "COH Master Deck",
                    "COH Website Copy",
                    "COH One-Pager",
                    "Sponsorship Deck",
                    "Approved Output Examples"
                  ].filter(doc => !sourceLibrary.some(s => s.title.includes(doc) || doc.includes(s.title)))
                   .map(doc => (
                    <li key={doc} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-coh-gold/40"></span>
                      <span>{doc}</span>
                      <span className="text-[10px] uppercase font-bold text-coh-gold cursor-pointer hover:underline" onClick={() => {
                        if (onAddNewCoreSource) onAddNewCoreSource('Strategy Kernel');
                      }}>Add / Upload / Link</span>
                    </li>
                  ))}
                </ul>
              </div>
"""

# Insert right after <div className="space-y-8">
if "Suggested Core Documents, not uploaded yet:" not in content:
    content = content.replace(
        '<div className="space-y-8">\n                {[\'Core Passport\',',
        suggested_logic + '\n              <div className="space-y-8">\n                {[\'Core Passport\','
    )

    # Update description paragraph to remove old language
    content = content.replace(
        "Core Documents are the foundational Source Library items that support the Operating Core. They are stored in Source Library and linked here to show what informs the strategy, claims, voice, visual DNA, and revision standards.",
        "Core Documents are foundational documents that shape the Operating Core and become part of the system brain. They are managed here by the superuser."
    )
    content = content.replace(
        "Add or manage the actual source material in Source Library. Link it here when it supports the Operating Core.",
        "Add or link them directly here. They do not appear as normal user task sources unless explicitly marked as selectable."
    )

with open('src/components/OperatingCoreAdmin.tsx', 'w') as f:
    f.write(content)

print("Suggested patched")

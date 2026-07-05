import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# For Content Options Option A
old_opt_a_buttons = """<button
                            onClick={() => handleCopyClipboard(draftOptions.optionA, 'optA')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            {copySuccessMap['optA'] ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionA, 'A')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Save to Library
                          </button>"""

new_opt_a_buttons = """<button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionA, 'A')}
                            className="bg-coh-navy text-coh-cream text-[10px] font-bold px-4 py-2 rounded interactive-button"
                          >
                            Save to Library
                          </button>
                          <button
                            onClick={() => handleCopyClipboard(draftOptions.optionA, 'optA')}
                            className="text-coh-navy/60 text-[10px] font-medium px-2 py-2 interactive-link"
                          >
                            {copySuccessMap['optA'] ? '✓ Copied' : 'Copy'}
                          </button>"""

content = content.replace(old_opt_a_buttons, new_opt_a_buttons)

# For Content Options Option B
old_opt_b_buttons = """<button
                            onClick={() => handleCopyClipboard(draftOptions.optionB, 'optB')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            {copySuccessMap['optB'] ? '✓ Copied' : 'Copy'}
                          </button>
                          <button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionB, 'B')}
                            className="bg-coh-cream text-coh-navy border border-coh-gold/30 hover:bg-coh-cream-dark text-[10px] font-bold px-3 py-1.5 rounded transition"
                          >
                            Save to Library
                          </button>"""

new_opt_b_buttons = """<button
                            onClick={() => saveDirectDraftToLibrary(draftOptions.optionB, 'B')}
                            className="bg-coh-navy text-coh-cream text-[10px] font-bold px-4 py-2 rounded interactive-button"
                          >
                            Save to Library
                          </button>
                          <button
                            onClick={() => handleCopyClipboard(draftOptions.optionB, 'optB')}
                            className="text-coh-navy/60 text-[10px] font-medium px-2 py-2 interactive-link"
                          >
                            {copySuccessMap['optB'] ? '✓ Copied' : 'Copy'}
                          </button>"""

content = content.replace(old_opt_b_buttons, new_opt_b_buttons)

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("Button hierarchy updated.")

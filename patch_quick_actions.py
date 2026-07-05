import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

old_shortcuts = """            {/* Collapsed Common Shortcuts */}
            <details className="group opacity-80 hover:opacity-100 transition-opacity bg-transparent text-sm mt-8 cursor-pointer max-w-4xl">
              <summary className="font-serif text-base text-coh-navy font-semibold flex items-center gap-2 outline-none">
                <span className="text-coh-gold group-open:rotate-90 transition-transform">▶</span>
                Common Shortcuts
              </summary>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-coh-gold/15">
                {[
                  { title: 'LinkedIn Post', action: 'Create Post', desc: 'Sober positioning card copy.', channel: 'LinkedIn', format: 'Post' },
                  { title: 'Instagram Caption', action: 'Create Caption', desc: 'Visceral scene rendering caption.', channel: 'Instagram', format: 'Caption' },
                  { title: 'Newsletter Section', action: 'Draft Section', desc: 'Campaign and canon updates.', channel: 'Newsletter', format: 'Newsletter Section' },
                  { title: 'Email / Letter', action: 'Draft Email', desc: 'Addressed partner message.', channel: 'Email / Direct Outreach', format: 'Email / Letter' }
                ].map(item => (
                  <div
                    key={item.title}
                    className="p-3 border border-coh-gold/10 bg-white hover:border-coh-gold/40 rounded text-left transition flex justify-between items-center interactive-card"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerQuickLauncher(item.channel, item.format, 'Single Channel');
                    }}
                  >
                    <div>
                      <h4 className="font-serif font-bold text-coh-navy text-[11px]">{item.title}</h4>
                    </div>
                    <ArrowRight size={10} className="text-coh-gold shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            </details>"""

new_quick_actions = """            {/* Quick Actions */}
            <div className="mt-8 max-w-4xl">
              <h3 className="font-serif text-sm text-coh-navy/80 font-semibold mb-3 flex items-center gap-2">
                Quick Actions
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  { title: 'LinkedIn Post', channel: 'LinkedIn', format: 'Post' },
                  { title: 'Instagram Caption', channel: 'Instagram', format: 'Caption' },
                  { title: 'Newsletter Section', channel: 'Newsletter', format: 'Newsletter Section' },
                  { title: 'Website / News Article', channel: 'Website', format: 'Article' },
                  { title: 'Sponsor Pitch', channel: 'Pitch Deck', format: 'Pitch' },
                  { title: 'Multi-Channel Pack', channel: 'Campaign', format: 'Multi-Channel' }
                ].map(item => (
                  <div
                    key={item.title}
                    className="px-2 py-2 border border-coh-gold/20 bg-white hover:bg-coh-cream/50 rounded transition text-center cursor-pointer interactive-card flex items-center justify-center h-full shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerQuickLauncher(item.channel, item.format, item.title === 'Multi-Channel Pack' ? 'Multi-Channel Campaign' : 'Single Channel');
                    }}
                  >
                    <span className="font-sans font-medium text-coh-navy text-[10px] leading-tight">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>"""

if old_shortcuts in content:
    content = content.replace(old_shortcuts, new_quick_actions)
    with open('src/App.tsx', 'w') as f:
        f.write(content)
    print("Quick Actions patched")
else:
    print("Quick Actions not found")

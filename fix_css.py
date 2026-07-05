import re

with open('src/index.css', 'r') as f:
    content = f.read()

# Add our new interactive classes to index.css
new_classes = """  /* Interactive Cards (Command Center, Nav Blocks) */
  .interactive-card {
    @apply cursor-pointer transition-all duration-200 outline-none;
  }
  .interactive-card:not(:disabled):hover {
    @apply border-coh-gold/30 bg-coh-gold/5 shadow-md -translate-y-[1px];
  }
  .interactive-card:not(:disabled):active {
    @apply scale-[0.99] translate-y-0 shadow-sm;
  }
  .interactive-card:focus-visible {
    @apply ring-2 ring-coh-gold ring-offset-2 ring-offset-coh-cream;
  }

  /* Pills for Quick Actions */
  .interactive-pill {
    @apply cursor-pointer transition-all rounded-full outline-none;
  }
  .interactive-pill:not(:disabled):hover {
    @apply shadow-sm border-coh-gold/50;
  }
  .interactive-pill:not(:disabled):active {
    @apply scale-[0.98];
  }
  .interactive-pill:focus-visible {
    @apply ring-2 ring-coh-gold ring-offset-2 ring-offset-coh-cream;
  }

  /* Interactive Links */
  .interactive-link {
    @apply cursor-pointer transition-colors outline-none;
  }
  .interactive-link:not(:disabled):hover {
    @apply text-coh-gold underline decoration-coh-gold/30 underline-offset-4;
  }
  .interactive-link:focus-visible {
    @apply ring-1 ring-coh-gold rounded-sm px-0.5 -mx-0.5;
  }

  /* Upload Zones */
  .interactive-upload {
    @apply cursor-pointer transition-all border-dashed outline-none;
  }
  .interactive-upload:not(:disabled):hover {
    @apply border-coh-gold bg-coh-gold/5;
  }
  .interactive-upload:focus-visible {
    @apply ring-2 ring-coh-gold ring-offset-2 ring-offset-coh-cream;
  }

  /* Disabled state */
  .disabled-interactive {
    @apply opacity-50 cursor-not-allowed pointer-events-none scale-100 !important;
  }
"""

if 'interactive-pill' not in content:
    # Let's replace the existing interactive-card block to inject the rest
    content = re.sub(r'/\* Interactive Cards.*?\n  \}\n', new_classes, content, flags=re.DOTALL)
    with open('src/index.css', 'w') as f:
        f.write(content)

print("CSS classes added")

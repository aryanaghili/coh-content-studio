import fs from 'fs';

let content = fs.readFileSync('src/index.css', 'utf8');

// Append global active and focus states for all interactive elements
content += `

/* Global Clickable Controls Reset */
button:not(:disabled),
.interactive-tab:not(:disabled),
.interactive-button:not(:disabled),
.interactive-card:not(:disabled),
[role="button"]:not(:disabled) {
  cursor: pointer !important;
}

button:active:not(:disabled),
.interactive-tab:active:not(:disabled),
.interactive-button:active:not(:disabled),
.interactive-card:active:not(:disabled),
[role="button"]:active:not(:disabled) {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

button:focus-visible,
.interactive-tab:focus-visible,
.interactive-button:focus-visible,
.interactive-card:focus-visible,
[role="button"]:focus-visible {
  outline: 2px solid theme('colors.coh-gold');
  outline-offset: 2px;
}

/* Fix disabled states */
button:disabled,
.interactive-tab:disabled,
.interactive-button:disabled,
[role="button"][aria-disabled="true"] {
  cursor: not-allowed !important;
  opacity: 0.5 !important;
  pointer-events: none;
}
`;

fs.writeFileSync('src/index.css', content, 'utf8');

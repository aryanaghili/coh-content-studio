import fs from 'fs';

let css = fs.readFileSync('src/index.css', 'utf8');

// Add the new global systems
const newSystems = `

/* ==========================================================================
   UI NORMALIZATION SYSTEMS
   ========================================================================== */

/* 1. Page Shell & Layout */
.page-shell {
  @apply w-full max-w-6xl mx-auto space-y-8 animate-fadeIn;
}
.page-shell-narrow {
  @apply w-full max-w-4xl mx-auto space-y-8 animate-fadeIn;
}
.page-header {
  @apply mb-8;
}
.page-title {
  @apply font-serif text-3xl font-bold text-coh-navy tracking-tight;
}
.page-subtitle {
  @apply text-coh-navy/60 font-sans mt-2 text-sm leading-relaxed max-w-3xl;
}

/* 2. Cards */
.card {
  @apply bg-white border border-coh-gold/20 rounded-lg shadow-sm p-6 overflow-hidden;
}
.card-header {
  @apply border-b border-coh-gold/10 pb-4 mb-4;
}
.card-title {
  @apply font-serif text-lg font-bold text-coh-navy;
}

/* 3. Form Controls */
.form-control {
  @apply w-full bg-coh-cream border border-coh-gold/30 rounded-md px-4 py-2.5 text-sm text-coh-navy transition-all duration-200 outline-none;
}
.form-control:focus {
  @apply ring-2 ring-coh-gold/50 border-coh-gold bg-white;
}
.form-control::placeholder {
  @apply text-coh-navy/40;
}
.form-label {
  @apply block text-xs font-bold uppercase tracking-wider text-coh-navy/70 mb-1.5;
}

/* 4. Empty States */
.empty-state {
  @apply flex flex-col items-center justify-center p-12 text-center bg-white/50 rounded-lg border border-dashed border-coh-gold/30;
}
.empty-state-icon {
  @apply text-4xl mb-4 opacity-40;
}
.empty-state-title {
  @apply font-serif text-lg font-semibold text-coh-navy mb-2;
}
.empty-state-text {
  @apply text-sm text-coh-navy/60 max-w-md;
}

`;

if (!css.includes('UI NORMALIZATION SYSTEMS')) {
  fs.appendFileSync('src/index.css', newSystems);
  console.log("Appended UI Normalization Systems");
} else {
  console.log("UI Normalization Systems already present");
}


import os

css_content = """@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
@import "tailwindcss";

@theme {
  /* Semantic Colors - Surface */
  --color-canvas: var(--canvas);
  --color-surface-primary: var(--surface-primary);
  --color-surface-secondary: var(--surface-secondary);
  --color-surface-elevated: var(--surface-elevated);
  --color-surface-inset: var(--surface-inset);
  
  /* Semantic Colors - Sidebar */
  --color-sidebar-bg: var(--sidebar-bg);
  --color-sidebar-surface-sec: var(--sidebar-surface-sec);
  --color-sidebar-hover: var(--sidebar-hover);
  --color-sidebar-active: var(--sidebar-active);
  
  /* Semantic Colors - Text */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);
  --color-text-on-dark: var(--text-on-dark);
  
  /* Semantic Colors - Borders */
  --color-border-standard: var(--border-standard);
  --color-border-strong: var(--border-strong);
  
  /* Semantic Colors - Brand Identity (Navy/Gold) */
  --color-brand-gold: var(--brand-gold);
  --color-brand-gold-hover: var(--brand-gold-hover);
  --color-brand-gold-active: var(--brand-gold-active);
  --color-brand-navy: var(--brand-navy);
  --color-brand-navy-hover: var(--brand-navy-hover);
  
  /* Semantic Colors - Status */
  --color-status-success: var(--status-success);
  --color-status-warning: var(--status-warning);
  --color-status-error: var(--status-error);
  --color-status-info: var(--status-info);
  
  /* Semantic Colors - System */
  --color-focus-ring: var(--focus-ring);
  --color-overlay: var(--overlay);
  
  /* Typography */
  --font-display: "Playfair Display", "Albra Display", serif;
  --font-sans: "Montserrat", "Plus Jakarta Sans", system-ui, sans-serif;
  
  /* Radii */
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 16px;
  
  /* Shadows / Elevations */
  --shadow-level-1: var(--elevation-level-1);
  --shadow-level-2: var(--elevation-level-2);
}

/* Light Theme (Default) */
:root, [data-theme="light"] {
  --canvas: #F6F3EE;
  --surface-primary: #FFFFFF;
  --surface-secondary: #FBF8F3;
  --surface-elevated: #FFFFFF;
  --surface-inset: #F8F6F2;
  
  --sidebar-bg: #0C1B2A;
  --sidebar-surface-sec: #12243A;
  --sidebar-hover: #192E49;
  --sidebar-active: #C6A675; /* Gold active surface */
  
  --text-primary: #10213A;
  --text-secondary: #5F6B7C;
  --text-muted: #8A94A3;
  --text-inverse: #FFFFFF;
  --text-on-dark: #F7F4EE;
  
  --border-standard: #E6DED3;
  --border-strong: #D2C5B5;
  
  --brand-gold: #C6A675;
  --brand-gold-hover: #B99058;
  --brand-gold-active: #A77C44;
  
  --brand-navy: #10213A;
  --brand-navy-hover: #192E49;
  
  --status-success: #178C4E;
  --status-warning: #B7791F;
  --status-error: #C83C3C;
  --status-info: #3267B1;
  
  --focus-ring: rgba(198, 166, 117, 0.38);
  --overlay: rgba(12, 27, 42, 0.48);
  
  --elevation-level-1: 0 1px 2px rgba(16, 33, 58, 0.06), 0 6px 20px rgba(16, 33, 58, 0.05);
  --elevation-level-2: 0 20px 50px rgba(16, 33, 58, 0.16);
}

/* Dark Theme */
[data-theme="dark"] {
  --canvas: #090F1C;
  --surface-primary: #111A2B;
  --surface-secondary: #162238;
  --surface-elevated: #1B2942;
  --surface-inset: #0D1626;
  
  --sidebar-bg: #07111F;
  --sidebar-surface-sec: #12213A; /* Using hover as secondary */
  --sidebar-hover: #12213A;
  --sidebar-active: #243754;
  
  --text-primary: #F5F2EB;
  --text-secondary: #BEC6D2;
  --text-muted: #8893A4;
  --text-inverse: #0B1421; /* Dark text on light backgrounds (e.g. primary buttons) */
  --text-on-dark: #F5F2EB;
  
  --border-standard: #27354A;
  --border-strong: #35465F;
  
  --brand-gold: #D5B67C;
  --brand-gold-hover: #E0C58F;
  --brand-gold-active: #C59D5F;
  
  --brand-navy: #111A2B;
  --brand-navy-hover: #162238;
  
  --status-success: #32B875;
  --status-warning: #E5AA42;
  --status-error: #F06B67;
  --status-info: #63A5E8;
  
  --focus-ring: rgba(213, 182, 124, 0.42);
  --overlay: rgba(0, 0, 0, 0.64);
  
  --elevation-level-1: 0 8px 24px rgba(0, 0, 0, 0.20);
  --elevation-level-2: 0 22px 60px rgba(0, 0, 0, 0.44);
}

body {
  margin: 0;
  font-family: var(--font-sans);
  background-color: var(--canvas);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Base Typographic Scale */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-primary);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-strong);
  border-radius: var(--radius-md);
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

@layer components {
  /* Application Shell and Page Architecture */
  .app-shell {
    @apply min-h-screen flex flex-col md:flex-row bg-canvas font-sans text-text-primary transition-colors duration-150;
  }
  .app-main {
    @apply flex-1 flex flex-col overflow-hidden max-w-[1440px] mx-auto w-full bg-canvas;
  }
  .page-content {
    @apply flex-1 overflow-y-auto px-4 md:px-8 lg:px-10 py-6 md:py-8;
  }
  
  /* Elevational Components */
  .card-level-1 {
    @apply bg-surface-primary border border-border-standard rounded-lg shadow-level-1;
  }
  .card-level-2 {
    @apply bg-surface-elevated border border-border-strong rounded-xl shadow-level-2;
  }
  .surface-inset {
    @apply bg-surface-inset border border-border-standard rounded-md;
  }
  
  /* Typography Classes */
  .display-title {
    @apply font-display font-bold text-[36px] leading-[44px] text-text-primary;
  }
  .page-title {
    @apply font-sans font-semibold text-[28px] leading-[36px] text-text-primary tracking-tight;
  }
  .section-title {
    @apply font-sans font-semibold text-[21px] leading-[29px] text-text-primary tracking-tight;
  }
  .panel-title {
    @apply font-sans font-semibold text-[17px] leading-[24px] text-text-primary;
  }
  .card-title {
    @apply font-sans font-semibold text-[15px] leading-[22px] text-text-primary;
  }
  .body-text {
    @apply font-sans font-normal text-[15px] leading-[24px] text-text-secondary;
  }
  .compact-text {
    @apply font-sans font-normal text-[14px] leading-[21px] text-text-secondary;
  }
  .helper-text {
    @apply font-sans font-normal text-[13px] leading-[19px] text-text-muted;
  }
  .meta-text {
    @apply font-sans font-normal text-[12px] leading-[17px] text-text-muted;
  }
  .form-label {
    @apply font-sans font-semibold text-[13px] leading-[18px] text-text-primary block mb-1.5;
  }
  .badge-text {
    @apply font-sans font-semibold text-[11px] leading-[16px] uppercase tracking-wider;
  }
}

/* Global focus utilities */
*:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 2px;
}
"""

with open("src/index.css", "w") as f:
    f.write(css_content)

print("Generated structured index.css")

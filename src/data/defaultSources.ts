export interface DefaultSource {
  id: string;
  title: string;
  type: 'PDF' | 'Audio' | 'Text' | 'Video' | 'Image';
  status: 'Ready' | 'Processing' | 'Error';
  useFor: string;
  content: string;
  notes: string;
  createdAt: string;
}

export const DEFAULT_COH_SOURCES: DefaultSource[] = [
  {
    id: 'kb-facts',
    title: 'COH Approved Facts',
    type: 'Text',
    status: 'Ready',
    useFor: 'Fact Grounding & Verification',
    notes: 'Approved opera titles, strategic language guidelines, and explicit fictional constraints.',
    createdAt: '2026-06-29',
    content: `# COH Approved Facts

## Allowed Opera Titles
* Soria Moria
* The Golden Fountain
* The Water Dragon
* Roar to the Wind

## Allowed Portfolio Language
* Climate Opera Haus
* A Cultural Engine for Climate Transition
* The Climate Tetralogy
* Four operas. Four worlds. One planet.
* Air, Fire, Water, Earth

## Allowed Strategic Language
* climate-content and cultural-IP venture
* live opera as origin asset
* documentary and filmed content
* sponsorship and patron backing
* licensing and institutional reuse
* cultural durability
* institutional adoption
* repertoire-based climate canon

## Explicitly Forbidden
* invented opera titles
* invented event names
* invented venues
* invented dates
* invented partners
* invented sponsors
* invented locations
* invented technologies
* invented performance formats`
  },
  {
    id: 'kb-context',
    title: 'COH Context',
    type: 'Text',
    status: 'Ready',
    useFor: 'Brand Definition & Strategy',
    notes: 'Core positioning of Climate Opera Haus as a cultural IP and content venture.',
    createdAt: '2026-06-29',
    content: `# COH Context

* COH creates original climate-era operatic worlds.
* COH is not only an opera project. It is a climate-content and cultural-IP venture.
* Live productions are prestige origin assets.
* The opera creates the world; filming captures the world.
* Documentary and filmed content extend and monetize the world.
* Sponsors finance and elevate the world.
* Institutions license, host, endorse, and extend the world.
* COH must not sound like a generic arts project, NGO campaign, or startup platform.
* COH must avoid becoming an event brand.
* COH should reinforce cultural durability, institutional adoption, repeatability, and long-term artistic value.`
  },
  {
    id: 'kb-voice',
    title: 'COH Voice Rules',
    type: 'Text',
    status: 'Ready',
    useFor: 'Tone & Style Guardrails',
    notes: 'Stylistic criteria ensuring precise, composed, human, and charged copywriting.',
    createdAt: '2026-06-29',
    content: `# COH Voice Rules

* COH voice: Precise. Composed. Human. Charged.
* Every sentence must be clear on the first read.
* Use active voice.
* Anchor claims in facts, functions, deliverables, or felt effects.
* Avoid NGO climate language.
* Avoid arts marketing fluff.
* Avoid startup pitch language.
* Avoid sponsor hype.
* Avoid unsupported impact claims.
* Avoid vague transformation language.
* Do not invent facts.
* If a fact is not in the brief, selected source, or approved facts, flag it as needing confirmation.`
  },
  {
    id: 'kb-channels',
    title: 'COH Channel Formats',
    type: 'Text',
    status: 'Ready',
    useFor: 'Formatting & Channel Strategy',
    notes: 'Structural styles for LinkedIn, Instagram, Newsletters, and Partner updates.',
    createdAt: '2026-06-29',
    content: `# COH Channel Formats

* LinkedIn: institutional credibility, business logic, partner value, proof points, cultural positioning.
* Instagram: visual moments, opera worlds, behind-the-scenes, human but precise captions.
* Newsletter: progress updates, partner notes, deeper continuity.
* Website / News & Media: durable public updates, factual, polished.
* Partner-facing copy: composed, concrete, low-hype, value and fit focused.
* Internal update: practical, direct, what changed and what happens next.`
  },
  {
    id: 'kb-angles',
    title: 'COH Content Angles',
    type: 'Text',
    status: 'Ready',
    useFor: 'Ideation Guide',
    notes: 'List of canonical angles ranging from composer process to institutional durability.',
    createdAt: '2026-06-29',
    content: `# COH Content Angles

* Artistic world-building
* Climate Tetralogy
* Soria Moria / Air
* The Golden Fountain / Fire
* The Water Dragon / Water
* Roar to the Wind / Earth
* Production discipline
* Composer and artistic process
* Climate as lived condition
* Myth as ethical tester
* Cultural durability
* Institutional adoption
* Documentary and filmed content
* Sponsor and partner value
* COH as cultural IP and content venture
* Proof points
* Team and leadership visibility`
  },
  {
    id: 'kb-examples',
    title: 'Approved Examples',
    type: 'Text',
    status: 'Ready',
    useFor: 'Copy Verification & Reference',
    notes: 'Explicit reference list of approved copy styles.',
    createdAt: '2026-06-29',
    content: `# Approved Examples

Only add examples after Aryan explicitly approves them.`
  }
];

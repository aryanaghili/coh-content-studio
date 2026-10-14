# COH-CS-10 Taxonomy Normalization Report

## 1. Audience Normalization (`AUDIENCE_ALIAS_NORMALIZATION_MAP`)

All natural-language expressions, UI aliases, and legacy labels normalize non-destructively to the active `OperatingCore.audiences` profiles:

| Input Alias / Legacy Value | Canonical Operating Core Audience Profile |
| :--- | :--- |
| `Sponsors & Patrons`, `Sponsors / Patrons`, `Sponsors & Corporate Partners`, `Sponsors`, `Patrons`, `Arts Patrons` | `Sponsors and patrons` |
| `Cultural Institutions & Venues`, `Cultural Institutions`, `Institutional Partners`, `Institutional Partner`, `Strategic Partners` | `Cultural institutions` |
| `Cultural Institutions & Festivals`, `Opera Audience`, `Art & Opera Community`, `Opera House` | `Opera houses and festivals` |
| `Foundations`, `Arts Councils`, `Foundations and arts councils` | `Foundations and arts councils` |
| `Climate & Sustainability Leaders`, `Climate, Policy & Philanthropy Leaders` | `Climate and sustainability leaders` |
| `Documentary Partners`, `Media and documentary partners` | `Media and documentary partners` |
| `Education & Community`, `Education and civic partners` | `Education and civic partners` |
| `Press & Media`, `Press / Media`, `Media / Press`, `Media & Journalists`, `Press & Cultural Journalists` | `Press and journalists` |
| `Internal Team` | `Internal team` |
| `Cultural Followers`, `Cultural Audience`, `Cultural Consumers`, `General Public & Cultural Citizens`, `Skeptics / Public`, `General Public` (when inferred) | `General cultural audience` |

- **Dynamic Operating Core Mutation Support**: `normalizeOperatingCoreAudience` and `inferAudienceFromText` inspect the live `operatingCore.audiences` array first. If an audience profile is added or renamed in `OperatingCore`, Ideation, Smart Brief, and Reframing Studio immediately resolve to the active Operating Core profile.
- **Explicit `General Public` & `Custom Audience` Support**: When `General Public` is explicitly selected or passed as `explicitAudience`, `{ preserveExplicitGeneralPublic: true }` preserves `'General Public'` with `provenance: 'explicit'`. `Custom Audience` descriptions continue to pass through `compileGovernedContext` with `provenance: 'EXPLICIT'`.

## 2. Content Pillar Normalization (`PILLAR_ALIAS_NORMALIZATION_MAP`)

All module-level pillar references normalize to `CANONICAL_COH_PILLARS`:

| Parallel / Legacy Pillar Label | Canonical COH Content Pillar |
| :--- | :--- |
| `The Opera & Worldbuilding`, `The Tetralogy & Operatic Worldbuilding`, `Cultural Durability` | `Climate Tetralogy & Canon` |
| `Opera Production and Repertoire`, `Artistic Vision & Cultural World-Building` | `Opera Worlds & Artistic Method` |
| `Behind the Creation & Craft`, `Artistic Process & Craft` | `Production & Behind the Work` |
| `Climate Opera as Cultural IP`, `Documentary and Media` | `Documentary, Media & Cultural IP` |
| `Institutional & Sponsor Value`, `Partnerships & Coalition`, `Sponsorship and Institutional Adoption`, `Strategic Partners` | `Partnerships, Sponsorship & Institutional Value` |
| `Cultural Participation & Ritual`, `RESONANCE 2027 & Milestones` | `Events, Convenings & Public Moments` |
| `Science & Planetary Reality`, `Culture as Climate Agency`, `Climate Literacy`, `Education and Community` | `Education, Community & Climate Literacy` |
| `Team, Leadership & Proof` | `Team, Leadership & Proof` |

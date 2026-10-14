# Source Intelligence Schema & Non-Destructive Persistence (`COH-CS-03`)

## 1. Storage Architecture Decision

- **Raw Sources Key (`coh_sources_v11`)**: Unchanged. Raw `SourceFile` records (`id`, `title`, `type`, `status`, `content`, `notes`, `url`, `createdAt`, `selected`, `selectable`) are never modified or rewritten by Source Intelligence.
- **Derived Intelligence Key (`coh_source_intelligence_v1`)**: Stored separately in `localStorage` as a versioned envelope (`SourceIntelligenceStoreV1`).
- **Database Impact**: `NONE`. No database schema changes, migrations, vector stores, or chunk tables were introduced.

---

## 2. Versioned Store Envelope (`SourceIntelligenceStoreV1`)

```json
{
  "schemaVersion": "1.0",
  "updatedAt": "2026-10-14T12:40:00.000Z",
  "records": {
    "<sourceId>": {
      "sourceId": "<sourceId>",
      "sourceTitle": "Soria Moria Acoustic Memo",
      "sourceType": "Event Notes",
      "schemaVersion": "1.0",
      "analyzedAt": "2026-10-14T12:40:00.000Z",
      "analysisMode": "ai | deterministic-fallback",
      "disclaimer": "AI interpretation of the source, not the source itself.",
      "keyFacts": [
        "Soria Moria is the foundational first work in The Climate Tetralogy.",
        "Acoustic testing in Bergen achieved 94% reverberation clarity."
      ],
      "supportedClaims": [
        "Source-grounded statement: Soria Moria is the foundational first work in The Climate Tetralogy."
      ],
      "strategicContext": "Documented event notes (\"Soria Moria Acoustic Memo\") providing context for Climate Tetralogy & Canon.",
      "cautionsAndAmbiguities": [
        "Aspiration or pathway statement in source: \"The team aims to expand to 8 additional venues.\""
      ],
      "usefulExcerpts": [
        "Soria Moria is the foundational first work in The Climate Tetralogy.",
        "Acoustic testing in Bergen achieved 94% reverberation clarity."
      ],
      "relevantAudiences": [
        "General Public & Cultural Citizens"
      ],
      "relevantChannels": [
        "Press Release"
      ],
      "relevantPillars": [
        "Climate Tetralogy & Canon"
      ],
      "contentOpportunityHints": [
        "Develop a Press Release piece tailored to General Public & Cultural Citizens using verified excerpts."
      ]
    }
  }
}
```

---

## 3. Resilience & Claim-Discipline Guarantees

1. **Corruption Recovery (`loadSourceIntelligenceStore`)**:
   - Wraps `JSON.parse` and record validation (`isValidSourceIntelligenceRecord`) in a non-throwing guard.
   - If `coh_source_intelligence_v1` contains malformed JSON or invalid records, invalid entries are ignored and `{}` is returned so raw sources in `coh_sources_v11` always load unimpeded.
2. **Deletion Cleanup (`removeSourceIntelligenceRecord`)**:
   - Deleting a source via `handleDeleteSource(id)` removes both the source from `coh_sources_v11` and any derived entry for `id` in `coh_source_intelligence_v1`.
3. **Claim Discipline (`enforceSourceIntelligenceClaimDiscipline`)**:
   - **Numeric/Date Traceability**: Any number or year in `keyFacts` or `supportedClaims` not present in the raw source text is moved to `cautionsAndAmbiguities` as an unverified inference.
   - **Aspiration Separation**: Statements matching aspirational markers (`aims to`, `hopes to`, `plans to`, `vision for`, `potential to`, `projected to`, etc.) are moved to `cautionsAndAmbiguities`.
   - **Verbatim Excerpt Enforcement**: Every item in `usefulExcerpts` is checked via `validateExactSourceExcerpt` against the raw source text; non-verbatim quotes are stripped.
   - **Source Type Boundaries**: `Approved Example` and `Visual Reference` sources have `keyFacts` and `supportedClaims` forced to `[]` with explicit boundary cautions.

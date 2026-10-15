// Shared Visual Direction Parser, Classifier, and Prompt Compiler
// Used by both the frontend (src/App.tsx) and the backend (/api/ai/generate-image in server.js)

const FORMAT_PRESET_FRAMING = {
  'core-sq-11': {
    ratio: '1:1',
    orientation: 'square',
    framingGuidance:
      'Compose for a balanced 1:1 square frame with a clear central or rule-of-thirds focal anchor and generous breathing room around the edges.'
  },
  'core-port-45': {
    ratio: '4:5',
    orientation: 'portrait',
    framingGuidance:
      'Compose for a 4:5 vertical editorial portrait frame with strong vertical depth, mid-frame subject anchor, and clean upper/lower margin balance.'
  },
  'core-vert-916': {
    ratio: '9:16',
    orientation: 'vertical',
    framingGuidance:
      'Compose for a tall 9:16 full-vertical frame with clear vertical subject hierarchy and uncluttered safe zones in the top 20% and bottom 25% for mobile UI overlays.'
  },
  'core-land-169': {
    ratio: '16:9',
    orientation: 'widescreen',
    framingGuidance:
      'Compose for a wide 16:9 cinematic horizontal canvas with expansive environmental depth and intentional lateral negative space.'
  },
  'core-edit-32': {
    ratio: '3:2',
    orientation: 'landscape',
    framingGuidance:
      'Compose for a classic 3:2 reportage landscape frame with natural horizontal flow and balanced foreground-to-background staging.'
  },
  'core-print-23': {
    ratio: '2:3',
    orientation: 'poster',
    framingGuidance:
      'Compose for a 2:3 vertical poster proportion with strong architectural verticality and structured top/bottom hierarchy.'
  },
  'social-ig-sq': {
    ratio: '1:1',
    orientation: 'square',
    framingGuidance:
      'Compose for a 1:1 square social feed frame with immediate focal clarity at mobile viewing scale and clean peripheral breathing room.'
  },
  'social-ig-port': {
    ratio: '4:5',
    orientation: 'portrait',
    framingGuidance:
      'Compose for a 4:5 vertical social portrait frame that maximizes vertical presence with an anchored focal point and uncluttered margins.'
  },
  'social-ig-story': {
    ratio: '9:16',
    orientation: 'vertical',
    framingGuidance:
      'Compose for a 9:16 vertical story/reel frame with vertical flow and protected top/bottom safe zones free of critical detail.'
  },
  'social-li-sq': {
    ratio: '1:1',
    orientation: 'square',
    framingGuidance:
      'Compose for a 1:1 LinkedIn editorial square frame with institutional clarity, decisive focal hierarchy, and structured negative space.'
  },
  'social-li-land': {
    ratio: '1.91:1',
    orientation: 'widescreen',
    framingGuidance:
      'Compose for a 1.91:1 wide editorial link-card frame with horizontal asymmetrical balance and clean lateral negative space.'
  },
  'web-hero': {
    ratio: '16:9',
    orientation: 'widescreen',
    framingGuidance:
      'Compose for a 16:9 wide website hero banner with sweeping horizontal depth and dedicated negative space to support hero headline placement.'
  },
  'web-blog': {
    ratio: '16:9',
    orientation: 'widescreen',
    framingGuidance:
      'Compose for a 16:9 editorial feature header with cinematic horizontal staging and calm negative space.'
  },
  'web-newsletter': {
    ratio: '3:2',
    orientation: 'landscape',
    framingGuidance:
      'Compose for a 3:2 horizontal newsletter header with an intimate editorial focal point and calm lateral margins.'
  },
  'evt-screen': {
    ratio: '16:9',
    orientation: 'widescreen',
    framingGuidance:
      'Compose for a 16:9 large-scale stage projection screen with bold spatial legibility from a distance and high-contrast atmospheric depth.'
  },
  'evt-poster': {
    ratio: '2:3',
    orientation: 'poster',
    framingGuidance:
      'Compose for a 2:3 vertical exhibition poster with sculptural vertical hierarchy and clear headline/footer zones.'
  }
};

const STYLE_EXECUTION_PROFILES = {
  'Editorial Photomontage': {
    cameraAndLens:
      'layered medium-format editorial photography combined with tactile archival print and architectural collage planes',
    lightingAndMaterial:
      'directional gallery chiaroscuro, tactile paper grain, raw architectural concrete, brushed brass, and deep operatic shadows',
    finish:
      'museum-grade cultural publication photomontage with intentional negative space and crisp edges'
  },
  'Cinematic Realism': {
    cameraAndLens:
      'large-format cinema prime lens (50mm anamorphic depth), shallow depth of field, natural optical falloff',
    lightingAndMaterial:
      'dramatic motivated tungsten and cool twilight rim lighting, volumetric stage atmosphere, authentic physical textures (timber, stone, acoustic fabric, glass)',
    finish:
      'high-dynamic-range fine film grain, grounded photojournalistic and theatrical realism'
  },
  'Editorial Photography': {
    cameraAndLens:
      'medium-format editorial portrait and architectural lens (80mm f/2.8), crisp optical micro-contrast, intentional framing',
    lightingAndMaterial:
      'naturalistic sculpted window or stage side-lighting, honest material surfaces, warm skin tones, subtle tonal roll-off',
    finish:
      'contemporary cultural magazine photography with dignified human and spatial presence'
  },
  'Premium Illustration': {
    cameraAndLens:
      'bespoke architectural and theatrical editorial illustration with layered planar depth and hand-crafted linework',
    lightingAndMaterial:
      'warm theatrical spotlight gradients, tactile lithographic ink and cotton-rag paper texture, rich pigment density',
    finish:
      'refined New Yorker / contemporary opera house commission illustration aesthetic'
  },
  'Minimal Graphic': {
    cameraAndLens:
      'Swiss-inspired architectural grid geometry, reductive spatial hierarchy, razor-sharp figure-ground separation',
    lightingAndMaterial:
      'matte museum board finish, high-contrast tonal planes, subtle debossed paper materiality',
    finish:
      'restrained institutional cultural graphic system with generous negative space'
  },
  'Social Poster': {
    cameraAndLens:
      'high-impact cultural poster composition with an unmistakable central visual anchor and structured typographic safe zones',
    lightingAndMaterial:
      'bold theatrical contrast, rich navy and warm gold tonal interplay, tactile print finish',
    finish:
      'contemporary arts institution campaign key art built for immediate feed legibility'
  },
  'Fine Art / Conceptual': {
    cameraAndLens:
      'sculptural gallery installation perspective, poetic spatial metaphor, contemplative framing',
    lightingAndMaterial:
      'focused museum spotlighting emerging from deep atmospheric shadow, raw elemental materials (water, stone, resonant metal, light projection)',
    finish:
      'museum-grade contemporary fine art photography with emotional and intellectual gravitas'
  }
};

const DEFAULT_COH_AVOIDANCE_ITEMS = [
  'cliché climate doom imagery (burning globes, smokestacks, melting polar bears)',
  'generic corporate stock handshake or boardroom poses',
  'protest placards or partisan political slogans',
  'cheap neon sci-fi HUD overlays or 3D clip-art',
  'watermarks, UI chrome, or illegible gibberish text'
];

export function cleanBriefValue(raw) {
  if (raw == null) return '';
  let str = String(raw).trim();
  if (!str) return '';

  // Remove markdown heading prefixes or bullet markers on each line
  str = str
    .split('\n')
    .map((line) =>
      line
        .trim()
        .replace(/^(?:#{1,6}\s+|\*\s+|-\s+|•\s+)/, '')
        .replace(/^\*\*([^*]+)\*\*:\s*/, '$1: ')
        .trim()
    )
    .filter((line) => {
      if (!line) return false;
      // Drop standalone header lines like "Visual Design Brief: Carousel"
      if (/^(?:#*\s*)?Visual Design Brief\b/i.test(line)) return false;
      if (/^Slide-by-Slide Visual Guidance:?$/i.test(line)) return false;
      return true;
    })
    .join(' ');

  // Strip surrounding quotes and Midjourney flags (--ar 16:9, --v 6.0, etc.)
  str = str
    .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
    .replace(/\s*--(?:ar|v|style|q|stylize|chaos|no)\s+[^\s,;]+/gi, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return str;
}

export function createEmptyStructuredVisualBrief() {
  return {
    visualConcept: '',
    formatRecommendation: '',
    moodAtmosphere: '',
    composition: '',
    colorMaterialDirection: '',
    typographyLayout: '',
    keyVisualElements: '',
    whatToAvoid: '',
    aiImagePrompt: '',
    negativePrompt: '',
    designerNotes: '',
    textContent: '',
    attribution: ''
  };
}

const FIELD_ALIAS_MAP = [
  {
    key: 'visualConcept',
    aliases: ['visualConcept', 'visual_concept', 'visual concept', 'concept', 'mainSubject', 'main subject']
  },
  {
    key: 'formatRecommendation',
    aliases: ['formatRecommendation', 'format_recommendation', 'format recommendation', 'format', 'formats']
  },
  {
    key: 'moodAtmosphere',
    aliases: ['moodAtmosphere', 'mood_atmosphere', 'mood / atmosphere', 'mood & atmosphere', 'mood and atmosphere', 'mood', 'atmosphere']
  },
  {
    key: 'composition',
    aliases: ['composition', 'framing', 'sceneComposition']
  },
  {
    key: 'colorMaterialDirection',
    aliases: [
      'colorMaterialDirection',
      'color_material_direction',
      'colorMaterial',
      'color_material',
      'color / material direction',
      'color / material',
      'color & material',
      'color and material',
      'palette'
    ]
  },
  {
    key: 'typographyLayout',
    aliases: [
      'typographyLayout',
      'typography_layout',
      'typography / layout',
      'typography & layout',
      'typography and layout',
      'typography',
      'layout'
    ]
  },
  {
    key: 'keyVisualElements',
    aliases: [
      'keyVisualElements',
      'key_visual_elements',
      'keyElements',
      'key_elements',
      'key visual elements',
      'visual elements',
      'key elements'
    ]
  },
  {
    key: 'whatToAvoid',
    aliases: ['whatToAvoid', 'what_to_avoid', 'what to avoid', 'avoid']
  },
  {
    key: 'aiImagePrompt',
    aliases: ['aiImagePrompt', 'ai_image_prompt', 'ai image prompt', 'image prompt', 'prompt']
  },
  {
    key: 'negativePrompt',
    aliases: ['negativePrompt', 'negative_prompt', 'negative prompt']
  },
  {
    key: 'designerNotes',
    aliases: ['designerNotes', 'designer_notes', 'designer notes', 'production notes', 'notes']
  },
  {
    key: 'textContent',
    aliases: ['textContent', 'text_content', 'text content', 'quoteText', 'quote text', 'headlineText']
  },
  {
    key: 'attribution',
    aliases: ['attribution', 'speaker', 'author', 'credit']
  }
];

function resolveCanonicalFieldKey(rawLabel) {
  if (!rawLabel) return null;
  const normalized = String(rawLabel)
    .replace(/^[#*\-\s•]+/, '')
    .replace(/[*:_]+$/, '')
    .trim()
    .toLowerCase();

  for (const entry of FIELD_ALIAS_MAP) {
    for (const alias of entry.aliases) {
      if (normalized === alias.toLowerCase()) {
        return entry.key;
      }
    }
  }
  return null;
}

export function parseVisualDirectionInput(rawDirection) {
  const fields = createEmptyStructuredVisualBrief();
  if (!rawDirection) return fields;

  // 1. Direct object input (either camelCase from AI response or canonical keys)
  if (typeof rawDirection === 'object' && !Array.isArray(rawDirection)) {
    for (const [k, v] of Object.entries(rawDirection)) {
      if (v == null) continue;
      const canonicalKey = resolveCanonicalFieldKey(k) || (k in fields ? k : null);
      if (canonicalKey && canonicalKey in fields) {
        fields[canonicalKey] = cleanBriefValue(v);
      }
    }
    return fields;
  }

  if (typeof rawDirection !== 'string') {
    return fields;
  }

  const trimmedInput = rawDirection.trim();
  if (!trimmedInput) return fields;

  // 2. Try JSON object parsing if string looks like JSON
  if (trimmedInput.startsWith('{') && trimmedInput.endsWith('}')) {
    try {
      const parsedObj = JSON.parse(trimmedInput);
      if (parsedObj && typeof parsedObj === 'object') {
        return parseVisualDirectionInput(parsedObj);
      }
    } catch {
      // Fall through to line-by-line parser
    }
  }

  // 3. Structured multi-line / markdown / key:value parser
  const lines = trimmedInput.split('\n');
  let currentField = null;
  let matchedAnyStructuredField = false;
  const slideNotes = [];
  let inSlideGuidance = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Ignore top-level markdown brief headers
    if (/^(?:#+\s*)?Visual Design Brief\b/i.test(line)) {
      continue;
    }

    if (/^(?:#+\s*|\*\*\s*)?Slide-by-Slide Visual Guidance/i.test(line)) {
      inSlideGuidance = true;
      currentField = 'designerNotes';
      continue;
    }

    if (inSlideGuidance) {
      const cleanedSlide = cleanBriefValue(line);
      if (cleanedSlide) {
        slideNotes.push(cleanedSlide);
      }
      continue;
    }

    // Match inline "Label: Value" or "**Label:** Value" or "- **Label:** Value" or "visualConcept: Value"
    const inlineMatch = line.match(
      /^(?:#{1,6}\s+|\*\s+|-\s+|•\s+)?\*{0,2}([A-Za-z][A-Za-z0-9\s/&_-]{1,36}?)\*{0,2}\s*:\s*(.*)$/
    );
    if (inlineMatch) {
      const candidateKey = resolveCanonicalFieldKey(inlineMatch[1]);
      if (candidateKey) {
        matchedAnyStructuredField = true;
        currentField = candidateKey;
        const val = cleanBriefValue(inlineMatch[2]);
        if (val) {
          fields[currentField] = fields[currentField]
            ? `${fields[currentField]} ${val}`.trim()
            : val;
        }
        continue;
      }
    }

    // Match standalone heading line like "### Visual Concept" or "**Mood / Atmosphere**"
    const headingCandidate = line
      .replace(/^(?:#{1,6}\s+|\*\s+|-\s+|•\s+)/, '')
      .replace(/^\*{1,2}|\*{1,2}$/g, '')
      .replace(/:$/, '')
      .trim();
    const standaloneKey = resolveCanonicalFieldKey(headingCandidate);
    if (standaloneKey) {
      matchedAnyStructuredField = true;
      currentField = standaloneKey;
      continue;
    }

    // Continuation line for the current field
    if (currentField) {
      const cleanedLine = cleanBriefValue(line);
      if (cleanedLine) {
        fields[currentField] = fields[currentField]
          ? `${fields[currentField]} ${cleanedLine}`.trim()
          : cleanedLine;
      }
    }
  }

  if (slideNotes.length > 0) {
    const slideSummary = `Carousel progression: ${slideNotes.join(' | ')}`;
    fields.designerNotes = fields.designerNotes
      ? `${fields.designerNotes}. ${slideSummary}`
      : slideSummary;
  }

  // 4. Plain-text fallback if no structured headings matched
  if (!matchedAnyStructuredField) {
    fields.visualConcept = cleanBriefValue(trimmedInput);
  }

  return fields;
}

export function serializeVisualBriefForStorage(briefInput) {
  const fields = parseVisualDirectionInput(briefInput);
  const orderedLabels = [
    ['visualConcept', 'Visual Concept'],
    ['formatRecommendation', 'Format Recommendation'],
    ['moodAtmosphere', 'Mood / Atmosphere'],
    ['composition', 'Composition'],
    ['colorMaterialDirection', 'Color / Material'],
    ['typographyLayout', 'Typography / Layout'],
    ['keyVisualElements', 'Key Visual Elements'],
    ['whatToAvoid', 'What to Avoid'],
    ['aiImagePrompt', 'AI Image Prompt'],
    ['negativePrompt', 'Negative Prompt'],
    ['designerNotes', 'Designer Notes']
  ];

  return orderedLabels
    .filter(([key]) => Boolean(fields[key]))
    .map(([key, label]) => `${label}: ${fields[key]}`)
    .join('\n');
}

export function classifyVisualDirectionType(briefInput, visualStyle = '', formatPresetId = '') {
  const fields = parseVisualDirectionInput(briefInput);
  const combinedText = [
    fields.visualConcept,
    fields.formatRecommendation,
    fields.typographyLayout,
    fields.keyVisualElements,
    fields.designerNotes,
    fields.textContent,
    visualStyle
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  // Check explicit typographic / quote card signals first
  if (
    fields.textContent ||
    /\b(?:quote\s*card|pull[\s-]*quote|typographic\s*card|text[\s-]*only|statement\s*card|typography[\s-]*led)\b/i.test(
      combinedText
    )
  ) {
    return 'typographic_quote_card';
  }

  if (
    visualStyle === 'Social Poster' ||
    formatPresetId === 'evt-poster' ||
    /\b(?:poster|key\s*art|billboard|flyer|announcement\s*graphic|title\s*card)\b/i.test(combinedText)
  ) {
    return 'poster_graphic';
  }

  if (
    visualStyle === 'Editorial Photomontage' ||
    /\b(?:photomontage|collage|mixed[\s-]*media|layered\s*archival|cutout)\b/i.test(combinedText)
  ) {
    return 'mixed_media';
  }

  if (
    visualStyle === 'Premium Illustration' ||
    /\b(?:illustrat(?:ion|ed|ive)|lithograph|woodcut|ink\s*drawing|painted|painterly)\b/i.test(
      combinedText
    )
  ) {
    return 'illustrative';
  }

  if (
    visualStyle === 'Fine Art / Conceptual' ||
    visualStyle === 'Minimal Graphic' ||
    /\b(?:conceptual|sculptural\s*metaphor|abstract\s*installation|minimal\s*graphic|symbolic\s*installation)\b/i.test(
      combinedText
    )
  ) {
    return 'conceptual';
  }

  if (
    visualStyle === 'Cinematic Realism' ||
    /\b(?:cinematic|anamorphic|stage\s*lighting|chiaroscuro|theatrical\s*lighting|opera\s*stage)\b/i.test(
      combinedText
    )
  ) {
    return 'cinematic';
  }

  if (
    visualStyle === 'Editorial Photography' ||
    /\b(?:editorial\s*photograph|portrait|photojournalis|documentary\s*photo|rehearsal\s*photograph)\b/i.test(
      combinedText
    )
  ) {
    return 'editorial_photography';
  }

  return 'photographic';
}

function deduplicateAvoidanceList(...rawSources) {
  const seenNormalized = new Set();
  const output = [];

  for (const src of rawSources) {
    if (!src) continue;
    const rawItems = Array.isArray(src)
      ? src
      : String(src)
          .replace(/^(?:Avoid|Do not include|No)\s*:\s*/i, '')
          .split(/[,;\n]+|\s+\b(?:and|or)\b\s+/i);

    for (const item of rawItems) {
      let cleaned = cleanBriefValue(item)
        .replace(/^(?:no\s+|avoid\s+|do\s+not\s+include\s+|never\s+use\s+)/i, '')
        .replace(/\.+$/, '')
        .trim();
      if (!cleaned || cleaned.length < 3) continue;

      const normKey = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      // Skip if an existing item already covers or is covered by this phrase
      let isDuplicate = false;
      for (const existingKey of seenNormalized) {
        if (existingKey === normKey || existingKey.includes(normKey) || normKey.includes(existingKey)) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        seenNormalized.add(normKey);
        output.push(cleaned);
      }
    }
  }

  return output;
}

function normalizeSentence(text) {
  const cleaned = cleanBriefValue(text).replace(/\.+$/, '').trim();
  return cleaned ? `${cleaned}.` : '';
}

export function compileVisualStudioPrompt(options = {}) {
  const {
    brief = {},
    visualStyle = 'Cinematic Realism',
    formatPresetId = 'social-li-sq',
    aspectRatio = '',
    width = 0,
    height = 0,
    brandConsistency = true
  } = options;

  const parsed = parseVisualDirectionInput(brief);
  const visualType = classifyVisualDirectionType(parsed, visualStyle, formatPresetId);

  const presetMeta = FORMAT_PRESET_FRAMING[formatPresetId] || {
    ratio: aspectRatio || (width && height ? `${width}:${height}` : '1:1'),
    orientation:
      width && height
        ? width > height
          ? 'widescreen'
          : height > width
          ? 'vertical'
          : 'square'
        : 'square',
    framingGuidance: aspectRatio
      ? `Compose specifically for a ${aspectRatio} frame with balanced subject hierarchy and clean negative space.`
      : 'Compose with intentional framing, clear focal hierarchy, and generous negative space.'
  };

  const styleProfile =
    STYLE_EXECUTION_PROFILES[visualStyle] || STYLE_EXECUTION_PROFILES['Cinematic Realism'];

  // Primary subject / concept resolution
  let primaryConcept = parsed.visualConcept || parsed.aiImagePrompt || '';
  if (!primaryConcept && parsed.keyVisualElements) {
    primaryConcept = parsed.keyVisualElements;
  }
  if (!primaryConcept) {
    primaryConcept =
      'An evocative Climate Opera Haus cultural scene uniting contemporary stagecraft, architectural materiality, and ecological presence';
  }

  const sections = [];

  // 1. Visual Type & Core Subject Hierarchy
  if (visualType === 'typographic_quote_card') {
    const quoteSnippet = parsed.textContent
      ? cleanBriefValue(parsed.textContent).slice(0, 140)
      : '';
    const attributionSnippet = parsed.attribution ? cleanBriefValue(parsed.attribution) : '';

    sections.push(
      normalizeSentence(
        `Editorial typographic card design for Climate Opera Haus: ${primaryConcept}`
      )
    );

    if (quoteSnippet) {
      const shortEnoughForRender = quoteSnippet.split(/\s+/).length <= 12;
      if (shortEnoughForRender) {
        sections.push(
          normalizeSentence(
            `Center the composition around a clean, high-contrast typographic focal area featuring the exact short phrase "${quoteSnippet}"${
              attributionSnippet ? ` with restrained attribution "${attributionSnippet}"` : ''
            } in authoritative editorial serif and architectural sans-serif hierarchy`
          )
        );
      } else {
        sections.push(
          normalizeSentence(
            `Design an uncluttered architectural background canvas with a calm, high-contrast central negative-space zone reserved for editorial quote overlay (do not render dense multi-line paragraphs of tiny generated text inside the image)`
          )
        );
      }
    } else {
      sections.push(
        normalizeSentence(
          'Prioritize an uncluttered architectural field with a structured central negative-space zone designed for editorial typography'
        )
      );
    }
  } else if (visualType === 'poster_graphic') {
    sections.push(
      normalizeSentence(
        `High-impact cultural institution poster key art (${visualStyle}): ${primaryConcept}`
      )
    );
  } else if (visualType === 'illustrative') {
    sections.push(
      normalizeSentence(
        `Bespoke editorial commission illustration (${visualStyle}): ${primaryConcept}`
      )
    );
  } else if (visualType === 'mixed_media') {
    sections.push(
      normalizeSentence(
        `Layered editorial photomontage and tactile archival collage: ${primaryConcept}`
      )
    );
  } else if (visualType === 'conceptual') {
    sections.push(
      normalizeSentence(
        `Museum-grade conceptual fine-art composition (${visualStyle}): ${primaryConcept}`
      )
    );
  } else {
    sections.push(
      normalizeSentence(
        `Editorial ${visualStyle.toLowerCase()} composition for Climate Opera Haus: ${primaryConcept}`
      )
    );
  }

  // 2. Key Visual Elements (only if distinct from primaryConcept)
  if (
    parsed.keyVisualElements &&
    !primaryConcept.toLowerCase().includes(parsed.keyVisualElements.toLowerCase())
  ) {
    sections.push(
      normalizeSentence(`Key visual anchors and tactile details: ${parsed.keyVisualElements}`)
    );
  }

  // 3. Composition & Aspect Ratio Framing (never duplicated!)
  const compositionParts = [];
  if (parsed.composition) {
    compositionParts.push(cleanBriefValue(parsed.composition).replace(/\.+$/, ''));
  }
  compositionParts.push(presetMeta.framingGuidance.replace(/\.+$/, ''));
  sections.push(`${compositionParts.join('. ')}.`);

  // 4. Typography / Layout Zone Direction (when relevant & distinct from composition)
  if (
    parsed.typographyLayout &&
    !compositionParts.join(' ').toLowerCase().includes(parsed.typographyLayout.toLowerCase())
  ) {
    sections.push(
      normalizeSentence(
        `Layout and negative-space structure: ${parsed.typographyLayout} (keep safe zones clean rather than rendering fake UI chrome)`
      )
    );
  }

  // 5. Mood, Atmosphere, Optical & Material Direction
  const atmosphereParts = [];
  if (parsed.moodAtmosphere) {
    atmosphereParts.push(`Mood and emotional tone: ${cleanBriefValue(parsed.moodAtmosphere).replace(/\.+$/, '')}`);
  }
  atmosphereParts.push(`Optical and lighting execution: ${styleProfile.cameraAndLens}; ${styleProfile.lightingAndMaterial}`);
  sections.push(`${atmosphereParts.join('. ')}.`);

  // 6. Color & Materiality Palette
  if (parsed.colorMaterialDirection) {
    sections.push(
      normalizeSentence(
        `Color and material palette: ${parsed.colorMaterialDirection}${
          brandConsistency
            ? ', harmonized with Climate Opera Haus deep midnight navy, warm theatrical brass/gold, and natural mineral neutrals'
            : ''
        }`
      )
    );
  } else if (brandConsistency) {
    sections.push(
      'Color and material palette: Climate Opera Haus institutional palette of deep midnight navy (#0B1F3A), warm theatrical gold/brass (#C5A880), warm alabaster stone, and natural acoustic timber.'
    );
  }

  // 7. Curated AI Image Prompt Nuances (if the brief supplied extra scene details not already in visualConcept)
  if (
    parsed.aiImagePrompt &&
    parsed.aiImagePrompt.toLowerCase() !== primaryConcept.toLowerCase() &&
    !primaryConcept.toLowerCase().includes(parsed.aiImagePrompt.toLowerCase().slice(0, 40))
  ) {
    sections.push(normalizeSentence(`Additional scene direction: ${parsed.aiImagePrompt}`));
  }

  // 8. Designer Notes (filtered so internal slide counters don't bloat image generation unless helpful)
  if (parsed.designerNotes && !/^Carousel progression:/i.test(parsed.designerNotes)) {
    sections.push(normalizeSentence(`Art direction note: ${parsed.designerNotes}`));
  }

  // 9. Single Deduplicated Avoidance Clause
  const avoidanceItems = deduplicateAvoidanceList(
    parsed.whatToAvoid,
    parsed.negativePrompt,
    DEFAULT_COH_AVOIDANCE_ITEMS
  );
  if (avoidanceItems.length > 0) {
    sections.push(`Strictly avoid: ${avoidanceItems.join('; ')}.`);
  }

  const prompt = sections.filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
  const negativePrompt = avoidanceItems.join(', ');

  return {
    prompt,
    negativePrompt,
    visualType,
    aspectRatio: presetMeta.ratio,
    orientation: presetMeta.orientation,
    parsedBrief: parsed
  };
}

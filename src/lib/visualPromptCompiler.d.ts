export interface StructuredVisualBrief {
  visualConcept: string;
  formatRecommendation: string;
  moodAtmosphere: string;
  composition: string;
  colorMaterialDirection: string;
  typographyLayout: string;
  keyVisualElements: string;
  whatToAvoid: string;
  aiImagePrompt: string;
  negativePrompt: string;
  designerNotes: string;
  textContent?: string;
  attribution?: string;
}

export type VisualDirectionType =
  | 'photographic'
  | 'cinematic'
  | 'editorial_photography'
  | 'illustrative'
  | 'conceptual'
  | 'typographic_quote_card'
  | 'poster_graphic'
  | 'mixed_media';

export interface CompileVisualStudioPromptOptions {
  brief?: Partial<StructuredVisualBrief> | Record<string, unknown> | string;
  visualStyle?: string;
  formatPresetId?: string;
  aspectRatio?: string;
  width?: number;
  height?: number;
  brandConsistency?: boolean;
}

export interface CompiledVisualStudioPromptResult {
  prompt: string;
  negativePrompt: string;
  visualType: VisualDirectionType;
  aspectRatio: string;
  orientation: string;
  parsedBrief: Required<StructuredVisualBrief>;
}

export function cleanBriefValue(raw: unknown): string;
export function createEmptyStructuredVisualBrief(): Required<StructuredVisualBrief>;
export function parseVisualDirectionInput(rawDirection: unknown): Required<StructuredVisualBrief>;
export function serializeVisualBriefForStorage(briefInput: unknown): string;
export function classifyVisualDirectionType(
  briefInput: unknown,
  visualStyle?: string,
  formatPresetId?: string
): VisualDirectionType;
export function compileVisualStudioPrompt(
  options?: CompileVisualStudioPromptOptions
): CompiledVisualStudioPromptResult;

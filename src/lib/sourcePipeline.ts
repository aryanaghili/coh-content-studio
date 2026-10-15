import {
  inferDefaultSourceRole,
  type SourceTaskRole,
  type TaskSourceBinding
} from './contextCompiler.ts';

export type SourceIngestionMethod =
  | 'paste'
  | 'url'
  | 'url-fetch'
  | 'url-excerpt'
  | 'url-reference-only'
  | 'upload'
  | 'file-upload'
  | 'library';
export type SourceIngestionStatus = 'extracted' | 'partial' | 'failed' | 'reference-only';

export type SourceIngestionStateStatus =
  | 'idle'
  | 'validating'
  | 'fetching'
  | 'extracting'
  | 'duplicate'
  | 'saving'
  | 'success'
  | 'error';

export interface SourceIngestionMeta {
  method: SourceIngestionMethod;
  status: SourceIngestionStatus;
  fingerprint?: string;
  contentHash?: string;
  requestedUrl?: string;
  normalizedUrl?: string;
  finalUrl?: string;
  capturedChars?: number;
  charCount?: number;
  capturedAt?: string;
  fetchedAt?: string;
  contentType?: string;
  extractionMethod?: string;
  warning?: string;
  warnings?: string[];
}

export interface PipelineSourceRecord {
  id: string;
  title: string;
  type: string;
  status: 'Active' | 'Archived' | 'Needs Review';
  createdAt?: string;
  notes?: string;
  content: string;
  url?: string;
  selectable?: boolean;
  selected?: boolean;
  ingestion?: SourceIngestionMeta;
}

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'mc_cid',
  'mc_eid',
  'ref',
  'ref_src',
  'igshid'
]);

/**
 * Normalizes a URL for deduplication:
 * - lowercases protocol & hostname
 * - strips hash fragments
 * - strips common tracking query parameters (utm_*, fbclid, gclid, etc.)
 * - sorts remaining query parameters
 * - strips trailing slash (except root '/')
 */
export function normalizeSourceUrl(rawUrl: string): string {
  const trimmed = String(rawUrl || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    parsed.hash = '';
    parsed.hostname = parsed.hostname.toLowerCase();
    parsed.protocol = parsed.protocol.toLowerCase();

    const cleanParams = new URLSearchParams();
    const keys = Array.from(parsed.searchParams.keys()).sort();
    for (const key of keys) {
      if (!TRACKING_PARAMS.has(key.toLowerCase())) {
        const vals = parsed.searchParams.getAll(key);
        for (const v of vals) {
          cleanParams.append(key, v);
        }
      }
    }
    const qs = cleanParams.toString();
    parsed.search = qs ? `?${qs}` : '';

    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    }
    return parsed.toString();
  } catch {
    return trimmed.toLowerCase().replace(/\/+$/, '');
  }
}

/**
 * Normalizes text content for deterministic fingerprinting and clean storage:
 * - NFKC Unicode normalization
 * - standardizes line breaks to \n
 * - collapses repeated horizontal whitespace
 * - trims leading/trailing whitespace
 */
export function normalizeSourceText(rawText: string): string {
  const str = String(rawText || '');
  if (!str) return '';
  return str
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Collapses all whitespace (including line breaks) into single spaces and lowercases
 * so that identical text pasted with different line wraps hashes to the same fingerprint.
 */
function canonicalizeTextForHash(rawText: string): string {
  return normalizeSourceText(rawText).replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Deterministic portable hash (FNV-1a 64-bit / dual 32-bit hex) that works synchronously
 * in both browser and Node environments without requiring async WebCrypto.
 */
export function computeDeterministicHash(input: string): string {
  const normalized = String(input || '');
  let h1 = 0xdeadbeef ^ normalized.length;
  let h2 = 0x41c6ce57 ^ normalized.length;

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `fp-${hex1}${hex2}`;
}

export interface SourceFingerprintResult {
  fingerprint: string;
  contentHash: string;
  normalizedUrl: string;
}

/**
 * Computes a deterministic fingerprint for a Source based on its normalized content and/or normalized URL.
 */
export function computeSourceFingerprint(params: {
  url?: string;
  content?: string;
  title?: string;
}): SourceFingerprintResult {
  const normText = normalizeSourceText(params.content || '');
  const normUrl = normalizeSourceUrl(params.url || '');
  const hasRealText = Boolean(normText && !isUrlPlaceholderContent(normText));
  const contentHash = hasRealText ? computeDeterministicHash(`text:${canonicalizeTextForHash(normText)}`) : '';
  const fingerprint = contentHash
    ? contentHash
    : normUrl
      ? computeDeterministicHash(`url:${normUrl}`)
      : computeDeterministicHash(`title:${canonicalizeTextForHash(params.title || '')}`);

  return {
    fingerprint,
    contentHash,
    normalizedUrl: normUrl
  };
}

/**
 * Checks if content is just the legacy fake `[URL reference: ...]` placeholder or empty.
 */
export function isUrlPlaceholderContent(content?: string): boolean {
  const trimmed = String(content || '').trim();
  if (!trimmed) return true;
  if (/^\[URL reference:\s*https?:\/\/[^\]]+\]$/i.test(trimmed)) return true;
  if (/^\[Reference URL only\s*[—-]/i.test(trimmed)) return true;
  return false;
}

/**
 * Deduplicates an array of sources by ID, preserving the first occurrence.
 * When a source exists in both `sources` (Source Library) and `workspaceLocalSources`,
 * this prevents duplicate React keys and double-rendering.
 */
export function uniqueSourcesById<T extends { id: string }>(...lists: T[][]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item || !item.id) continue;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      result.push(item);
    }
  }
  return result;
}

/**
 * Checks whether a candidate source matches an existing source in `sources` or `workspaceLocalSources`
 * by normalized URL or content fingerprint.
 */
export function findDuplicateSource<T extends PipelineSourceRecord>(
  candidate: { url?: string; content?: string; title?: string },
  existingSources: T[]
): { duplicate: T; reason: 'url' | 'content' } | null {
  const candidateNormUrl = normalizeSourceUrl(candidate.url || '');
  const candidateNormText = normalizeSourceText(candidate.content || '');
  const candidateHasRealText = Boolean(candidateNormText && !isUrlPlaceholderContent(candidateNormText));
  const candidateCanonicalText = candidateHasRealText ? canonicalizeTextForHash(candidateNormText) : '';
  const candidateTextFp = candidateHasRealText
    ? computeDeterministicHash(`text:${candidateCanonicalText}`)
    : '';

  for (const existing of existingSources) {
    if (!existing) continue;

    // 1. Check URL match
    const existingRawUrl =
      existing.url ||
      existing.ingestion?.normalizedUrl ||
      existing.ingestion?.finalUrl ||
      (existing.notes?.startsWith('URL:') ? existing.notes.replace(/^URL:\s*/i, '').trim() : '');
    const existingNormUrl = normalizeSourceUrl(existingRawUrl);

    if (candidateNormUrl && existingNormUrl && candidateNormUrl === existingNormUrl) {
      return { duplicate: existing, reason: 'url' };
    }

    // 2. Check content fingerprint match (only when real text is present)
    if (candidateHasRealText) {
      const existingNormText = normalizeSourceText(existing.content || '');
      if (existingNormText && !isUrlPlaceholderContent(existingNormText)) {
        const existingCanonicalText = canonicalizeTextForHash(existingNormText);
        const existingFp =
          existing.ingestion?.fingerprint ||
          existing.ingestion?.contentHash ||
          computeDeterministicHash(`text:${existingCanonicalText}`);
        if (existingFp === candidateTextFp || existingCanonicalText === candidateCanonicalText) {
          return { duplicate: existing, reason: 'content' };
        }
      }
    }
  }

  return null;
}

/**
 * Identifies which existing sources in a list are exact duplicates of an earlier source in the list
 * (so the UI can optionally show a subtle "Likely Duplicate" badge without deleting user data).
 */
export function findLikelyDuplicateIds<T extends PipelineSourceRecord>(sourcesList: T[]): Set<string> {
  const seenUrls = new Set<string>();
  const seenFingerprints = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const src of sourcesList) {
    const rawUrl =
      src.url ||
      src.ingestion?.normalizedUrl ||
      (src.notes?.startsWith('URL:') ? src.notes.replace(/^URL:\s*/i, '').trim() : '');
    const normUrl = normalizeSourceUrl(rawUrl);
    const normText = normalizeSourceText(src.content || '');
    const hasRealText = Boolean(normText && !isUrlPlaceholderContent(normText));
    const textFp = hasRealText ? computeDeterministicHash(`text:${canonicalizeTextForHash(normText)}`) : '';

    let isDup = false;
    if (normUrl) {
      if (seenUrls.has(normUrl)) isDup = true;
      else seenUrls.add(normUrl);
    }
    if (hasRealText && textFp) {
      if (seenFingerprints.has(textFp)) isDup = true;
      else seenFingerprints.add(textFp);
    }
    if (isDup) {
      duplicateIds.add(src.id);
    }
  }

  return duplicateIds;
}

export interface SourceUsabilityResult {
  usable: boolean;
  reason?: string;
  capturedChars: number;
}

/**
 * Validates whether a single Source has usable extracted text for generation.
 * Rejects:
 * - empty content
 * - `[URL reference: ...]` placeholder
 * - `ingestion.status === 'failed'` or `'reference-only'`
 * - `selectable === false` or `status === 'Needs Review'` with no usable text
 */
export function validateSourceUsability(source: PipelineSourceRecord | null | undefined): SourceUsabilityResult {
  if (!source) {
    return { usable: false, reason: 'Source record not found.', capturedChars: 0 };
  }

  const title = source.title || 'Untitled Source';
  const normText = normalizeSourceText(source.content || '');

  if (source.ingestion?.status === 'failed') {
    return {
      usable: false,
      reason: `${title} is attached, but URL extraction failed and no usable text was captured. Fetch the page again or paste an excerpt before generating.`,
      capturedChars: 0
    };
  }

  if (source.ingestion?.status === 'reference-only' || source.selectable === false) {
    return {
      usable: false,
      reason: `${title} is saved as a URL reference only and has no extracted text. Paste an excerpt or fetch the page before generating.`,
      capturedChars: 0
    };
  }

  if (!normText || isUrlPlaceholderContent(normText)) {
    return {
      usable: false,
      reason: `${title} is attached, but no usable text was captured. Fetch the page again or paste an excerpt before generating.`,
      capturedChars: 0
    };
  }

  return {
    usable: true,
    capturedChars: normText.length
  };
}

export interface PreflightSourceValidation {
  valid: boolean;
  blockingMessage: string;
  blockingErrors: string[];
  usableSources: PipelineSourceRecord[];
  invalidSources: Array<{ source: PipelineSourceRecord; reason: string }>;
}

/**
 * Preflight validation for all attached sources before generation.
 * If any attached source is invalid (placeholder, empty, failed extraction, reference-only),
 * returns `valid: false` with clear blocking error messages.
 */
export function validateAttachedSourcesPreflight(
  attachedIds: string[],
  allSources: PipelineSourceRecord[]
): PreflightSourceValidation {
  const uniqueAll = uniqueSourcesById(allSources);
  const blockingErrors: string[] = [];
  const usableSources: PipelineSourceRecord[] = [];
  const invalidSources: Array<{ source: PipelineSourceRecord; reason: string }> = [];

  for (const id of attachedIds) {
    const src = uniqueAll.find(s => s.id === id);
    if (!src) continue;
    const check = validateSourceUsability(src);
    if (!check.usable) {
      const reason =
        check.reason ||
        `${src.title || 'Source'} is attached, but no usable text was captured. Fetch the page again or paste an excerpt before generating.`;
      blockingErrors.push(reason);
      invalidSources.push({ source: src, reason });
    } else {
      usableSources.push(src);
    }
  }

  return {
    valid: blockingErrors.length === 0,
    blockingMessage: blockingErrors.join(' '),
    blockingErrors,
    usableSources,
    invalidSources
  };
}

/**
 * Single source of truth for attached source IDs across Simple, Quick Create, and Advanced Brief modes.
 */
export function getAttachedSourceIds(
  paramsOrSelectedIds:
    | {
        selectedSourceIds: string[];
        activeWorkItemSourceIds?: string[];
      }
    | string[],
  activeWorkItemSourceIdsArg?: string[]
): string[] {
  const selectedSourceIds = Array.isArray(paramsOrSelectedIds)
    ? paramsOrSelectedIds
    : paramsOrSelectedIds?.selectedSourceIds;
  const activeWorkItemSourceIds = Array.isArray(paramsOrSelectedIds)
    ? activeWorkItemSourceIdsArg
    : paramsOrSelectedIds?.activeWorkItemSourceIds;

  const primary = Array.isArray(selectedSourceIds) ? selectedSourceIds : [];
  if (primary.length > 0) {
    return Array.from(new Set(primary));
  }
  const fallback = Array.isArray(activeWorkItemSourceIds) ? activeWorkItemSourceIds : [];
  return Array.from(new Set(fallback));
}

/**
 * Builds active task source bindings across ALL Content Workspace creation modes
 * (Simple, Quick Create, Advanced Brief), filtering out unusable placeholder sources.
 */
export function buildActiveTaskSourceBindings(params: {
  attachedSourceIds?: string[];
  selectedSourceIds?: string[];
  workItemSourceIds?: string[];
  sources: PipelineSourceRecord[];
  workspaceLocalSources: PipelineSourceRecord[];
  getRole?: (src: PipelineSourceRecord) => SourceTaskRole;
  getExcerpts?: (sourceId: string) => string[];
}): TaskSourceBinding[] {
  const attachedIds =
    params.attachedSourceIds ||
    getAttachedSourceIds(params.selectedSourceIds || [], params.workItemSourceIds);
  const allSources = uniqueSourcesById(params.sources, params.workspaceLocalSources);
  const bindings: TaskSourceBinding[] = [];

  for (const id of attachedIds) {
    const s = allSources.find(x => x.id === id);
    if (!s) continue;
    const usability = validateSourceUsability(s);
    if (!usability.usable) continue;

    const role = params.getRole ? params.getRole(s) : inferDefaultSourceRole(s.type);
    const selectedExcerpts = params.getExcerpts ? params.getExcerpts(s.id) : [];

    bindings.push({
      sourceId: s.id,
      title: s.title || 'Untitled Source',
      type: s.type || 'Other',
      role,
      selectedExcerpts,
      content: normalizeSourceText(s.content),
      summary: s.notes || undefined
    });
  }

  return bindings;
}

/**
 * Serializes usable task source bindings into the payload array expected by `POST /api/ai/generate`
 * and `server/ai/promptBuilder.js`.
 */
export function serializeTaskSourcesForPayload(bindings: TaskSourceBinding[]): Array<{
  id: string;
  title: string;
  type: string;
  role: SourceTaskRole;
  content: string;
  capturedChars: number;
  selectedExcerpts?: string[];
}> {
  return bindings.map(b => {
    const contentStr = String(b.content || '');
    const roleVal: SourceTaskRole = b.role || inferDefaultSourceRole(b.type);
    return {
      id: b.sourceId,
      title: b.title,
      type: b.type,
      role: roleVal,
      content: contentStr,
      capturedChars: contentStr.length,
      ...(b.selectedExcerpts && b.selectedExcerpts.length > 0 ? { selectedExcerpts: b.selectedExcerpts } : {})
    };
  });
}

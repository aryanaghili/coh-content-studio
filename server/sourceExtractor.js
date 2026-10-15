import dns from 'node:dns/promises';
import net from 'node:net';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  'metadata.google.internal',
  'metadata.goog',
  'metadata',
  'instance-data',
  '169.254.169.254',
  '100.100.100.200',
  '0.0.0.0'
]);

const ALLOWED_CONTENT_TYPES = [
  'text/html',
  'application/xhtml+xml',
  'text/plain'
];

const MAX_REDIRECTS = 3;
const FETCH_TIMEOUT_MS = 10000;
const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB
const MIN_MEANINGFUL_CHARS = 260;

/**
 * Checks if an IPv4 address string falls within private, loopback, link-local,
 * multicast, broadcast, or reserved ranges.
 */
export function isPrivateOrReservedIPv4(ip) {
  const parts = String(ip || '').trim().split('.');
  if (parts.length !== 4) return true;
  const nums = parts.map(p => Number(p));
  if (nums.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return true;

  const [a, b, c] = nums;

  // 0.0.0.0/8 (current network)
  if (a === 0) return true;
  // 10.0.0.0/8 (private)
  if (a === 10) return true;
  // 100.64.0.0/10 (carrier-grade NAT / cloud metadata)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (link-local / cloud metadata 169.254.169.254)
  if (a === 169 && b === 254) return true;
  // 172.16.0.0/12 (private)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.0.0.0/24 (IETF protocol assignments)
  if (a === 192 && b === 0 && c === 0) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && c === 2) return true;
  // 192.168.0.0/16 (private)
  if (a === 192 && b === 168) return true;
  // 198.18.0.0/15 (benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && c === 100) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && c === 113) return true;
  // 224.0.0.0/4 (multicast) & 240.0.0.0/4 (reserved/broadcast)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks if an IPv6 address string is loopback, unspecified, link-local, unique-local (private),
 * or wraps a private IPv4 address.
 */
export function isPrivateOrReservedIPv6(ip) {
  const normalized = String(ip || '').trim().toLowerCase().replace(/^\[|\]$/g, '');
  if (!normalized) return true;

  if (normalized === '::1' || normalized === '::' || normalized === '0:0:0:0:0:0:0:1' || normalized === '0:0:0:0:0:0:0:0') {
    return true;
  }

  // IPv4-mapped IPv6 e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1
  if (normalized.startsWith('::ffff:')) {
    const tail = normalized.slice('::ffff:'.length);
    if (net.isIPv4(tail)) {
      return isPrivateOrReservedIPv4(tail);
    }
    return true;
  }

  // Unique local fc00::/7 (fc00... or fd00...)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  // Link-local fe80::/10 (fe8, fe9, fea, feb)
  if (/^fe[89ab]/i.test(normalized)) {
    return true;
  }

  // Multicast ff00::/8
  if (normalized.startsWith('ff')) {
    return true;
  }

  // Documentation 2001:db8::/32
  if (normalized.startsWith('2001:db8:') || normalized.startsWith('2001:0db8:')) {
    return true;
  }

  return false;
}

/**
 * Checks if any IP address (IPv4 or IPv6) is private, loopback, link-local, or reserved.
 */
export function isBlockedIpAddress(ip) {
  const clean = String(ip || '').trim().replace(/^\[|\]$/g, '');
  const version = net.isIP(clean);
  if (version === 4) return isPrivateOrReservedIPv4(clean);
  if (version === 6) return isPrivateOrReservedIPv6(clean);
  return true;
}

/**
 * Validates a URL string for SSRF safety before making any network request.
 * Optionally accepts a custom `lookupFn` for deterministic unit testing.
 */
export async function validateUrlSafety(rawUrl, options = {}) {
  const lookupFn = options.lookupFn || (async (hostname) => dns.lookup(hostname, { all: true }));
  const str = String(rawUrl || '').trim();
  if (!str) {
    return { safe: false, reason: 'Please enter a valid URL starting with https:// or http://.' };
  }

  let parsed;
  try {
    parsed = new URL(str);
  } catch {
    return { safe: false, reason: 'Malformed URL. Include https:// or http://.' };
  }

  const protocol = parsed.protocol.toLowerCase();
  if (!ALLOWED_PROTOCOLS.has(protocol)) {
    return {
      safe: false,
      reason: `Unsupported URL scheme "${protocol}". Only http: and https: URLs are allowed.`
    };
  }

  if (parsed.username || parsed.password) {
    return {
      safe: false,
      reason: 'URLs containing embedded credentials are not allowed.'
    };
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!hostname) {
    return { safe: false, reason: 'URL is missing a valid hostname.' };
  }

  if (
    BLOCKED_HOSTNAMES.has(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    return {
      safe: false,
      reason: `Blocked local or internal hostname "${hostname}".`
    };
  }

  // Direct IP literal check
  const ipVersion = net.isIP(hostname);
  if (ipVersion !== 0) {
    if (isBlockedIpAddress(hostname)) {
      return {
        safe: false,
        reason: `Blocked private, loopback, or reserved IP address "${hostname}".`
      };
    }
    return { safe: true, parsedUrl: parsed };
  }

  // Reject numeric/octal/hex single-word hostnames without a dot (e.g., http://2130706433)
  if (!hostname.includes('.')) {
    return {
      safe: false,
      reason: `Blocked unqualified or internal hostname "${hostname}".`
    };
  }

  // DNS resolution check to prevent DNS rebinding / internal IP resolution
  try {
    const records = await lookupFn(hostname);
    const list = Array.isArray(records) ? records : [records];
    if (list.length === 0) {
      return { safe: false, reason: `Could not resolve hostname "${hostname}".` };
    }
    for (const rec of list) {
      const addr = typeof rec === 'string' ? rec : rec?.address;
      if (!addr || isBlockedIpAddress(addr)) {
        return {
          safe: false,
          reason: `Hostname "${hostname}" resolves to a restricted or private network address.`
        };
      }
    }
  } catch (err) {
    return {
      safe: false,
      reason: `Could not resolve hostname "${hostname}" (${err?.code || 'DNS lookup failed'}).`
    };
  }

  return { safe: true, parsedUrl: parsed };
}

/**
 * Decodes common HTML entities into plain text characters.
 */
export function decodeHtmlEntities(text) {
  if (!text) return '';
  const named = {
    '&nbsp;': ' ',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&mdash;': ' - ',
    '&ndash;': '-',
    '&hellip;': '...',
    '&copy;': '(c)',
    '&reg;': '(R)',
    '&rsquo;': "'",
    '&lsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&bull;': '•'
  };
  return String(text)
    .replace(/&(nbsp|amp|lt|gt|quot|#39|apos|mdash|ndash|hellip|copy|reg|rsquo|lsquo|ldquo|rdquo|bull);/gi, (m) => {
      const k = m.toLowerCase();
      return named[k] ?? m;
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number(dec);
      return Number.isFinite(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16);
      return Number.isFinite(code) && code > 0 && code < 0x10ffff ? String.fromCodePoint(code) : '';
    });
}

/**
 * Extracts clean, readable article/main text and title from raw HTML.
 * Removes: script, style, noscript, nav, header, footer, aside, form, svg, and common cookie banners.
 * Prefers: <article>, <main>, [role="main"], then falls back to <body>.
 */
export function extractReadableContentFromHtml(rawHtml, fallbackUrl = '') {
  const html = String(rawHtml || '');
  if (!html.trim()) {
    return { title: '', content: '', containerUsed: 'none' };
  }

  // 1. Extract <title> or og:title
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    title = decodeHtmlEntities(titleMatch[1].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  }
  if (!title) {
    const ogTitleMatch =
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = decodeHtmlEntities(ogTitleMatch[1]).replace(/\s+/g, ' ').trim();
    }
  }
  if (!title && fallbackUrl) {
    try {
      const u = new URL(fallbackUrl);
      title = u.hostname.replace(/^www\./, '');
    } catch {
      title = fallbackUrl;
    }
  }

  // 2. Strip non-content tags completely
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|nav|header|footer|aside|form|svg|iframe|canvas|template| dialog)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');

  // Strip common cookie/consent banner containers by id/class patterns
  cleaned = cleaned.replace(
    /<(div|section|aside)\b[^>]*(?:id|class)=["'][^"']*(?:cookie-banner|cookie-consent|consent-banner|gdpr-banner|onetrust|cybotcookiebot)[^"']*["'][^>]*>[\s\S]*?<\/\1>/gi,
    ' '
  );

  // 3. Locate preferred content container: <article>, <main>, [role="main"], then <body>
  let targetHtml = '';
  let containerUsed = 'body';

  const articleMatches = Array.from(cleaned.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/gi));
  if (articleMatches.length > 0) {
    targetHtml = articleMatches.map(m => m[1]).join('\n\n');
    containerUsed = 'article';
  }

  if (!targetHtml || stripHtmlTagsToText(targetHtml).length < MIN_MEANINGFUL_CHARS) {
    const mainMatch = cleaned.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch && mainMatch[1] && stripHtmlTagsToText(mainMatch[1]).length >= stripHtmlTagsToText(targetHtml).length) {
      targetHtml = mainMatch[1];
      containerUsed = 'main';
    }
  }

  if (!targetHtml || stripHtmlTagsToText(targetHtml).length < MIN_MEANINGFUL_CHARS) {
    const roleMainMatch = cleaned.match(/<([a-z0-9]+)\b[^>]*role=["']main["'][^>]*>([\s\S]*?)<\/\1>/i);
    if (roleMainMatch && roleMainMatch[2] && stripHtmlTagsToText(roleMainMatch[2]).length >= stripHtmlTagsToText(targetHtml).length) {
      targetHtml = roleMainMatch[2];
      containerUsed = 'role=main';
    }
  }

  if (!targetHtml || stripHtmlTagsToText(targetHtml).length < MIN_MEANINGFUL_CHARS) {
    const bodyMatch = cleaned.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[1] : cleaned;
    if (stripHtmlTagsToText(bodyHtml).length > stripHtmlTagsToText(targetHtml).length) {
      targetHtml = bodyHtml;
      containerUsed = 'body';
    }
  }

  const content = stripHtmlTagsToText(targetHtml);
  return { title, content, containerUsed };
}

function stripHtmlTagsToText(htmlFragment) {
  if (!htmlFragment) return '';
  const withBreaks = String(htmlFragment)
    .replace(/<(br|hr)\b[^>]*\/?>/gi, '\n')
    .replace(/<\/(p|div|section|article|main|h[1-6]|li|blockquote|pre|tr)>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ');

  const decoded = decodeHtmlEntities(withBreaks);
  return decoded
    .normalize('NFKC')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Reads a fetch Response body up to `maxBytes`, aborting if the stream exceeds the limit.
 */
async function readBoundedText(response, maxBytes = MAX_BODY_BYTES) {
  const contentLengthHeader = response.headers?.get?.('content-length');
  if (contentLengthHeader) {
    const declared = Number(contentLengthHeader);
    if (Number.isFinite(declared) && declared > maxBytes) {
      throw new Error(`Response body exceeds maximum allowed size (${Math.round(maxBytes / (1024 * 1024))} MB).`);
    }
  }

  if (!response.body || typeof response.body.getReader !== 'function') {
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) {
      throw new Error(`Response body exceeds maximum allowed size (${Math.round(maxBytes / (1024 * 1024))} MB).`);
    }
    return text;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // ignore
        }
        throw new Error(`Response body exceeds maximum allowed size (${Math.round(maxBytes / (1024 * 1024))} MB).`);
      }
      chunks.push(Buffer.from(value));
    }
  }

  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Fetches and extracts readable text from a URL with SSRF protection, redirect validation,
 * timeout, size cap, and content-type verification.
 */
export async function extractUrlSource(rawUrl, options = {}) {
  const requestedUrl = String(rawUrl || '').trim();
  const fetchedAt = new Date().toISOString();
  const fetchFn = options.fetchFn || globalThis.fetch;
  const lookupFn = options.lookupFn;
  const minChars = options.minMeaningfulChars ?? MIN_MEANINGFUL_CHARS;

  // Initial SSRF check
  const initialCheck = await validateUrlSafety(requestedUrl, { lookupFn });
  if (!initialCheck.safe) {
    return {
      success: false,
      status: 'failed',
      requestedUrl,
      finalUrl: requestedUrl,
      title: '',
      content: '',
      charCount: 0,
      contentType: '',
      fetchedAt,
      warnings: [initialCheck.reason],
      error: initialCheck.reason
    };
  }

  let currentUrl = initialCheck.parsedUrl.toString();
  let redirectCount = 0;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs || FETCH_TIMEOUT_MS);

  try {
    let response;
    while (true) {
      response = await fetchFn(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          'User-Agent': 'COHContentStudioSourceExtractor/1.0 (+https://climateoperahaus.org)',
          'Accept': 'text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.1'
        }
      });

      const status = response.status;
      if (status >= 300 && status < 400) {
        const locationHeader = response.headers?.get?.('location');
        if (!locationHeader) {
          return {
            success: false,
            status: 'failed',
            requestedUrl,
            finalUrl: currentUrl,
            title: '',
            content: '',
            charCount: 0,
            contentType: '',
            fetchedAt,
            warnings: ['Redirect response did not include a Location header.'],
            error: 'Redirect response did not include a Location header.'
          };
        }

        redirectCount += 1;
        if (redirectCount > MAX_REDIRECTS) {
          return {
            success: false,
            status: 'failed',
            requestedUrl,
            finalUrl: currentUrl,
            title: '',
            content: '',
            charCount: 0,
            contentType: '',
            fetchedAt,
            warnings: [`Maximum redirects (${MAX_REDIRECTS}) exceeded.`],
            error: `Maximum redirects (${MAX_REDIRECTS}) exceeded.`
          };
        }

        let nextUrl;
        try {
          nextUrl = new URL(locationHeader, currentUrl).toString();
        } catch {
          return {
            success: false,
            status: 'failed',
            requestedUrl,
            finalUrl: currentUrl,
            title: '',
            content: '',
            charCount: 0,
            contentType: '',
            fetchedAt,
            warnings: ['Redirect target URL is malformed.'],
            error: 'Redirect target URL is malformed.'
          };
        }

        // Re-validate redirect target for SSRF safety
        const redirectCheck = await validateUrlSafety(nextUrl, { lookupFn });
        if (!redirectCheck.safe) {
          return {
            success: false,
            status: 'failed',
            requestedUrl,
            finalUrl: nextUrl,
            title: '',
            content: '',
            charCount: 0,
            contentType: '',
            fetchedAt,
            warnings: [`Redirect blocked: ${redirectCheck.reason}`],
            error: `Redirect blocked: ${redirectCheck.reason}`
          };
        }

        currentUrl = redirectCheck.parsedUrl.toString();
        continue;
      }

      break;
    }

    if (!response.ok) {
      const reason =
        response.status === 401 || response.status === 403
          ? `Access denied by remote server (HTTP ${response.status}). The page may require login or block automated access. Paste an excerpt instead.`
          : `Remote server returned HTTP ${response.status}.`;
      return {
        success: false,
        status: 'failed',
        requestedUrl,
        finalUrl: currentUrl,
        title: '',
        content: '',
        charCount: 0,
        contentType: response.headers?.get?.('content-type') || '',
        fetchedAt,
        warnings: [reason],
        error: reason
      };
    }

    const rawContentType = String(response.headers?.get?.('content-type') || '').toLowerCase();
    const mimeType = rawContentType.split(';')[0].trim();
    const isAllowedType = ALLOWED_CONTENT_TYPES.some(t => mimeType === t || rawContentType.includes(t));

    if (!isAllowedType) {
      const reason = `Unsupported content type "${mimeType || 'unknown'}". Only HTML and plain-text pages can be extracted.`;
      return {
        success: false,
        status: 'failed',
        requestedUrl,
        finalUrl: currentUrl,
        title: '',
        content: '',
        charCount: 0,
        contentType: mimeType,
        fetchedAt,
        warnings: [reason],
        error: reason
      };
    }

    const rawBody = await readBoundedText(response, options.maxBodyBytes || MAX_BODY_BYTES);

    let title = '';
    let content = '';
    const warnings = [];

    if (mimeType === 'text/plain') {
      content = rawBody
        .normalize('NFKC')
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      try {
        const u = new URL(currentUrl);
        title = u.pathname.split('/').filter(Boolean).pop() || u.hostname;
      } catch {
        title = currentUrl;
      }
    } else {
      const extracted = extractReadableContentFromHtml(rawBody, currentUrl);
      title = extracted.title;
      content = extracted.content;
    }

    const charCount = content.length;

    if (charCount === 0) {
      const msg = 'No readable body text could be extracted from this URL. Paste an excerpt instead.';
      return {
        success: false,
        status: 'failed',
        requestedUrl,
        finalUrl: currentUrl,
        title,
        content: '',
        charCount: 0,
        contentType: mimeType,
        fetchedAt,
        warnings: [msg],
        error: msg
      };
    }

    if (charCount < minChars) {
      const msg = `Only ${charCount} characters could be extracted from this page (below the ${minChars}-character threshold). Paste a fuller excerpt to use this source for generation.`;
      warnings.push(msg);
      return {
        success: false,
        status: 'partial',
        requestedUrl,
        finalUrl: currentUrl,
        title,
        content,
        charCount,
        contentType: mimeType,
        fetchedAt,
        warnings,
        error: msg
      };
    }

    return {
      success: true,
      status: 'extracted',
      requestedUrl,
      finalUrl: currentUrl,
      title,
      content,
      charCount,
      contentType: mimeType,
      fetchedAt,
      warnings
    };
  } catch (err) {
    const isAbort = err?.name === 'AbortError' || /aborted|timeout/i.test(String(err?.message || ''));
    const msg = isAbort
      ? 'Request timed out while fetching the URL. Paste an excerpt instead.'
      : err?.message || 'Unable to fetch the requested URL.';
    return {
      success: false,
      status: 'failed',
      requestedUrl,
      finalUrl: currentUrl,
      title: '',
      content: '',
      charCount: 0,
      contentType: '',
      fetchedAt,
      warnings: [msg],
      error: msg
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

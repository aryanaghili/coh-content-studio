export type AspectRatioGroup = 'Core' | 'Website & Editorial' | 'Social Media' | 'Presentation & Document';

export interface AspectRatioPreset {
  id: string;
  label: string;
  group: AspectRatioGroup;
  ratio: string;
  width: number;
  height: number;
  bestFor?: string;
  supportedModels?: string[]; // e.g. ['gpt-image-2'] if limited, otherwise undefined implies all
}

export const ASPECT_RATIO_PRESETS: AspectRatioPreset[] = [
  // Core
  { id: 'core-sq-1', label: 'Square', group: 'Core', ratio: '1:1', width: 1024, height: 1024 },
  { id: 'core-sq-2k', label: 'Square 2K', group: 'Core', ratio: '1:1', width: 2048, height: 2048, supportedModels: ['gpt-image-2'] },
  { id: 'core-land', label: 'Landscape', group: 'Core', ratio: '3:2', width: 1536, height: 1024 },
  { id: 'core-port', label: 'Portrait', group: 'Core', ratio: '2:3', width: 1024, height: 1536 },
  { id: 'core-land-43', label: 'Landscape', group: 'Core', ratio: '4:3', width: 1600, height: 1200 },
  { id: 'core-port-34', label: 'Portrait', group: 'Core', ratio: '3:4', width: 1200, height: 1600 },
  { id: 'core-wide-169', label: 'Wide', group: 'Core', ratio: '16:9', width: 2048, height: 1152, supportedModels: ['gpt-image-2'] },
  { id: 'core-wide-4k', label: 'Wide 4K', group: 'Core', ratio: '16:9', width: 3840, height: 2160, supportedModels: ['gpt-image-2'] },
  { id: 'core-vert-916', label: 'Vertical', group: 'Core', ratio: '9:16', width: 1152, height: 2048, supportedModels: ['gpt-image-2'] },
  { id: 'core-vert-4k', label: 'Vertical 4K', group: 'Core', ratio: '9:16', width: 2160, height: 3840, supportedModels: ['gpt-image-2'] },

  // Website & Editorial
  { id: 'web-hero', label: 'Website Hero', group: 'Website & Editorial', ratio: '16:9', width: 2048, height: 1152, supportedModels: ['gpt-image-2'] },
  { id: 'web-newsletter', label: 'Newsletter Header', group: 'Website & Editorial', ratio: '16:9', width: 2048, height: 1152, supportedModels: ['gpt-image-2'] },
  { id: 'web-edit', label: 'Editorial Banner', group: 'Website & Editorial', ratio: '3:2', width: 1536, height: 1024 },
  { id: 'web-wide', label: 'Wide Banner', group: 'Website & Editorial', ratio: '21:9', width: 2016, height: 864, supportedModels: ['gpt-image-2'] },
  { id: 'web-ultrawide', label: 'Ultra-Wide Banner', group: 'Website & Editorial', ratio: '3:1', width: 2304, height: 768, supportedModels: ['gpt-image-2'] },
  { id: 'web-article', label: 'Article Feature Image', group: 'Website & Editorial', ratio: '4:3', width: 1600, height: 1200 },
  { id: 'web-blog', label: 'Blog Visual', group: 'Website & Editorial', ratio: '3:2', width: 1536, height: 1024 },

  // Social Media
  { id: 'social-li-sq', label: 'LinkedIn Post', group: 'Social Media', ratio: '1:1', width: 1024, height: 1024 },
  { id: 'social-li-land', label: 'LinkedIn Landscape', group: 'Social Media', ratio: '1.91:1', width: 1536, height: 800, supportedModels: ['gpt-image-2'] },
  { id: 'social-ig-sq', label: 'Instagram Feed', group: 'Social Media', ratio: '1:1', width: 1024, height: 1024 },
  { id: 'social-ig-port', label: 'Instagram Portrait', group: 'Social Media', ratio: '4:5', width: 1024, height: 1280, supportedModels: ['gpt-image-2'] },
  { id: 'social-ig-story', label: 'Instagram Story / Reel', group: 'Social Media', ratio: '9:16', width: 1152, height: 2048, supportedModels: ['gpt-image-2'] },
  { id: 'social-fb-land', label: 'Facebook / X Landscape', group: 'Social Media', ratio: '16:9', width: 2048, height: 1152, supportedModels: ['gpt-image-2'] },
  { id: 'social-yt-thumb', label: 'YouTube Thumbnail', group: 'Social Media', ratio: '16:9', width: 2048, height: 1152, supportedModels: ['gpt-image-2'] },
  { id: 'social-tt', label: 'TikTok / Shorts', group: 'Social Media', ratio: '9:16', width: 1152, height: 2048, supportedModels: ['gpt-image-2'] },
  { id: 'social-snap', label: 'Snapchat Story', group: 'Social Media', ratio: '9:16', width: 1152, height: 2048, supportedModels: ['gpt-image-2'] },

  // Presentation
  { id: 'pres-slide-169', label: 'Presentation Slide', group: 'Presentation & Document', ratio: '16:9', width: 2048, height: 1152, supportedModels: ['gpt-image-2'] },
  { id: 'pres-slide-43', label: 'Presentation Slide', group: 'Presentation & Document', ratio: '4:3', width: 1600, height: 1200 },
  { id: 'pres-cover', label: 'Portrait Cover', group: 'Presentation & Document', ratio: '3:4', width: 1200, height: 1600 },
  { id: 'pres-header', label: 'Report Header', group: 'Presentation & Document', ratio: '3:1', width: 2304, height: 768, supportedModels: ['gpt-image-2'] }
];

export const ASPECT_RATIO_GROUP_ORDER: AspectRatioGroup[] = [
  'Core',
  'Website & Editorial',
  'Social Media',
  'Presentation & Document'
];

export function getPresetById(id: string): AspectRatioPreset | undefined {
  return ASPECT_RATIO_PRESETS.find(p => p.id === id);
}

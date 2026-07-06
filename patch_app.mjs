import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
const importCode = `import { ASPECT_RATIO_PRESETS, ASPECT_RATIO_GROUP_ORDER, getPresetById } from './lib/aspectRatios';\n`;
if (!content.includes('ASPECT_RATIO_PRESETS')) {
  content = content.replace("import { DEFAULT_COH_SOURCES } from './data/defaultSources';", importCode + "import { DEFAULT_COH_SOURCES } from './data/defaultSources';");
}

// 2. Change useState
content = content.replace(
  "const [vsAspectRatio, setVsAspectRatio] = useState<string>('1024x1024');",
  "const [vsAspectRatio, setVsAspectRatio] = useState<string>('core-sq-1');\n  const [vsCustomWidth, setVsCustomWidth] = useState<number>(1024);\n  const [vsCustomHeight, setVsCustomHeight] = useState<number>(1024);"
);

// 3. Update payload construction
const oldPayload = `const payload = {
      prompt: vsManualPrompt,
      promptBuildMode: vsPromptMode,
      aspectRatio: vsAspectRatio,`;

const newPayload = `const selectedPreset = getPresetById(vsAspectRatio);
    const actualWidth = vsAspectRatio === 'custom' ? vsCustomWidth : (selectedPreset?.width || 1024);
    const actualHeight = vsAspectRatio === 'custom' ? vsCustomHeight : (selectedPreset?.height || 1024);

    const payload = {
      prompt: vsManualPrompt,
      promptBuildMode: vsPromptMode,
      presetId: vsAspectRatio,
      width: actualWidth,
      height: actualHeight,`;
content = content.replace(oldPayload, newPayload);

// 4. Update dropdown UI
const oldDropdown = `<select
                      value={vsAspectRatio}
                      onChange={(e) => setVsAspectRatio(e.target.value)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 text-xs text-coh-navy rounded"
                    >
                      <option value="Square 1:1 (1024x1024)">Square 1:1 (1024x1024)</option>
                      <option value="LinkedIn Post (1024x1024)">LinkedIn Post (1:1)</option>
                      <option value="Instagram Feed (1024x1024)">Instagram Feed (1:1)</option>
                      
                      <option disabled>──────────</option>
                      
                      <option value="Landscape (1536x1024)">Landscape (1536x1024)</option>
                      <option value="Landscape 3:2 (1536x1024)">Landscape 3:2 (1536x1024)</option>
                      <option value="Wide Banner / Hero (landscape) (1536x1024)">Wide Banner / Hero (landscape)</option>
                      <option value="Newsletter Header (1536x1024)">Newsletter Header (landscape)</option>
                      <option value="Website Hero (1536x1024)">Website Hero (landscape)</option>
                      
                      <option disabled>──────────</option>

                      <option value="Portrait (1024x1536)">Portrait (1024x1536)</option>
                      <option value="Portrait 4:5 (1024x1536)">Portrait 4:5 (1024x1536)</option>
                      <option value="Instagram Story (1024x1536)">Instagram Story (portrait)</option>
                    </select>`;

const newDropdown = `<select
                      value={vsAspectRatio}
                      onChange={(e) => setVsAspectRatio(e.target.value)}
                      className="w-full bg-coh-cream border border-coh-gold/20 p-2 text-xs text-coh-navy rounded"
                    >
                      {ASPECT_RATIO_GROUP_ORDER.map(group => (
                        <optgroup key={group} label={group}>
                          {ASPECT_RATIO_PRESETS.filter(p => p.group === group).map(preset => {
                            const isSupported = !preset.supportedModels || preset.supportedModels.includes(aiImageModel || '');
                            return (
                              <option key={preset.id} value={preset.id} disabled={!isSupported}>
                                {preset.label} {preset.ratio} ({preset.width}x{preset.height}) {!isSupported ? '(Unsupported)' : ''}
                              </option>
                            );
                          })}
                        </optgroup>
                      ))}
                      {aiImageModel?.startsWith('gpt-image-2') && (
                        <option value="custom">Advanced custom size...</option>
                      )}
                    </select>

                    {vsAspectRatio === 'custom' && (
                      <div className="mt-2 flex gap-2">
                        <div className="flex-1">
                          <label className="block text-[10px] text-coh-navy/60 mb-1">Width (px)</label>
                          <input type="number" value={vsCustomWidth} onChange={e => setVsCustomWidth(parseInt(e.target.value)||0)} step="16" className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 text-xs rounded" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] text-coh-navy/60 mb-1">Height (px)</label>
                          <input type="number" value={vsCustomHeight} onChange={e => setVsCustomHeight(parseInt(e.target.value)||0)} step="16" className="w-full bg-coh-cream border border-coh-gold/20 p-1.5 text-xs rounded" />
                        </div>
                      </div>
                    )}`;
                    
content = content.replace(oldDropdown, newDropdown);

// 5. Update Preview CSS card rendering
const oldPreviewCard = `                    <div key={idx} className="bg-white p-4 rounded shadow-sm border border-coh-gold/20 relative">
                      {img.url ? (
                        <img src={img.url} alt="Generated Visual" className="w-full h-auto max-h-[70vh] object-contain rounded mb-3 border border-coh-gold/10" />
                      ) : (
                        <div className="w-full h-48 bg-coh-cream flex items-center justify-center rounded mb-3 border border-coh-gold/10 text-coh-navy/40 text-sm">
                          Base64 Image Data
                        </div>
                      )}
                      
                      <div className="text-xs text-coh-navy/60 flex items-center justify-between mb-4">
                        <div>
                          <span className="font-semibold">{vsAspectRatio}</span>
                          <span className="mx-2 opacity-30">|</span>
                          <span>{aiImageModel} ({vsQuality})</span>
                        </div>`;

const newPreviewCard = `                    <div key={idx} className="bg-white p-4 rounded shadow-sm border border-coh-gold/20 relative flex flex-col">
                      {img.url ? (
                        <div className="flex-1 flex items-center justify-center bg-coh-cream rounded mb-3 border border-coh-gold/10 overflow-hidden" style={{ minHeight: '300px' }}>
                           <img src={img.url} alt="Generated Visual" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-full h-48 bg-coh-cream flex items-center justify-center rounded mb-3 border border-coh-gold/10 text-coh-navy/40 text-sm">
                          Base64 Image Data
                        </div>
                      )}
                      
                      <div className="text-xs text-coh-navy/60 flex flex-col gap-1 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-coh-navy">{res.presetLabel || 'Custom Size'}</span>
                          <span className="font-mono bg-coh-cream px-1.5 py-0.5 rounded border">{res.returnedDimensions ? res.returnedDimensions : 'Unknown size'}</span>
                        </div>
                        <div className="flex items-center text-[10px] opacity-80">
                           <span>Requested: {res.requestedDimensions}</span>
                           <span className="mx-2">•</span>
                           <span>Model: {res.model}</span>
                           <span className="mx-2">•</span>
                           <span>Quality: {vsQuality}</span>
                        </div>
                        {res.returnedDimensions && res.requestedDimensions && res.returnedDimensions !== res.requestedDimensions && (
                          <div className="text-amber-600 font-semibold text-[10px] mt-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                             Warning: Returned size does not match requested size. Mapped for model compatibility.
                          </div>
                        )}
                      </div>`;
                      
content = content.replace(oldPreviewCard, newPreviewCard);

fs.writeFileSync('src/App.tsx', content, 'utf8');

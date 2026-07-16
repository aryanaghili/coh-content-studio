        {activeTab === 'settings' && (<ErrorBoundary fallbackTitle="Settings Error">
          <div className="page-shell-narrow">
            <div className="card-level-1 p-6 mb-8">
              <h2 className="page-title">Settings</h2>
              <p className="page-subtitle">
                Configure AI provider and generation mode.
              </p>
              <p className="text-xs text-text-secondary font-sans italic bg-surface-inset p-2 rounded border border-border-standard inline-block mt-2">
                Note: Content, voice, claims, audience, visual, and revision rules are managed in Operating Core. Settings is for technical configuration.
              </p>
            </div>

            {/* Section Nav */}
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-2">
                {([['ai', 'AI Connection']] as const).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setSettingsSection(key)}
                    className={`px-4 py-1.5 rounded text-sm font-semibold transition ${settingsSection === key ? 'bg-slate-900 text-text-primary' : 'bg-surface-primary border border-border-standard text-text-primary hover:bg-violet-600/10'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {!authBypass && (
                <button
                  onClick={handleLogout}
                  className="cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all bg-red-800/10 hover:bg-red-800/20 text-red-800 border border-red-800/20 px-3 py-1.5 rounded text-xs font-semibold transition action-button"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* ── AI Connection ─────────────────────────────────────── */}
            {settingsSection === 'ai' && (
              <div className="space-y-6">


                {/* Status Badge */}
                <div className="flex items-center gap-3 bg-surface-primary border border-border-standard p-4 rounded">
                  <span className={`w-3 h-3 rounded-full ${aiStatus === 'connected' ? (settingsKeyDirty ? 'bg-yellow-500' : 'bg-green-500/10 backdrop-blur-md0') : aiStatus === 'error' ? 'bg-red-500/10 backdrop-blur-md0' : aiStatus === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-300'}`} />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-text-primary">
                      {aiStatus === 'connected' && !settingsKeyDirty ? 'AI Generation Active' :
                       aiStatus === 'connected' && settingsKeyDirty ? 'Settings Changed' :
                       aiStatus === 'testing' ? 'Testing Connection...' :
                       aiStatus === 'error' ? 'Connection Error' :
                       settingsTestPassed ? 'Connection Verified' :
                       aiStatus === 'needs_retest' ? 'Needs Retest' :
                       'AI Not Connected — Prototype Mode'}
                    </span>
                    {(aiProvider || settingsProvider) && (
                      <div className="text-xs text-text-secondary mt-1 space-y-0.5">
                        <span className="block">Provider: <span className="font-semibold">{aiStatus === 'connected' && !settingsKeyDirty ? aiProvider : settingsProvider}</span></span>
                        <span className="block">Text model: <span className="font-semibold">{aiStatus === 'connected' && !settingsKeyDirty ? aiTextModel : (settingsTextModel || 'N/A')}</span></span>
                        <span className="block">Image model: <span className="font-semibold">{aiStatus === 'connected' && !settingsKeyDirty ? (aiImageModel || 'N/A') : (settingsImageModel || 'N/A')}</span></span>
                      </div>
                    )}
                    {aiLastTested && <span className="text-xs text-text-muted block mt-1">Last tested: {aiLastTested}</span>}
                    {aiLastError && <span className="text-xs text-red-600 block mt-0.5">{aiLastError}</span>}
                    {aiLatency > 0 && aiStatus === 'connected' && !settingsKeyDirty && <span className="text-xs text-green-700 block">Latency: {aiLatency}ms</span>}
                    
                    {/* Status Helper Message */}
                    <span className="text-xs font-semibold text-text-secondary block mt-2">
                      {aiStatus === 'connected' && !settingsKeyDirty ? 'Text and image generation are active.' :
                       aiStatus === 'connected' && settingsKeyDirty ? 'Test the updated configuration before saving.' :
                       settingsTestPassed ? 'Save settings to activate this configuration.' :
                       'Configure and test connection to activate.'}
                    </span>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-surface-inset border border-border-standard p-6 rounded shadow-sm space-y-5">
                  <h3 className="font-sans text-lg text-text-primary font-semibold">Configure AI Provider</h3>
                  
                  {/* Provider */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">AI Provider</label>
                    <select
                      value={settingsProvider}
                      onChange={(e) => {
                        const p = e.target.value;
                        setSettingsProvider(p);
                        
                        const recText = MODEL_REGISTRY.find(m => m.provider === p && m.type === 'text' && m.isRecommended) || MODEL_REGISTRY.find(m => m.provider === p && m.type === 'text');
                        setSettingsTextModel(recText ? recText.id : '');
                        
                        if (p === 'openai' || p === 'openrouter') {
                          const recImage = MODEL_REGISTRY.find(m => m.provider === p && m.type === 'image' && m.isRecommended) || MODEL_REGISTRY.find(m => m.provider === p && m.type === 'image');
                          setSettingsImageModel(recImage ? recImage.id : '');
                        } else {
                          setSettingsImageModel('');
                        }
                        
                        setSettingsBaseUrl('');
                        setSettingsTestPassed(null);
                        setSettingsTestResult('');
                        setSettingsKeyDirty(true);
                      }}
                      className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary text-sm"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="gemini">Google Gemini</option>
                      <option value="anthropic">Anthropic Claude</option>
                      <option value="mistral">Mistral</option>
                      <option value="openrouter">OpenRouter / OpenAI-Compatible</option>
                    </select>
                  </div>

                  {/* Base URL (OpenRouter / Custom only) */}
                  {(settingsProvider === 'openrouter') && (
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-1">Base URL</label>
                      <input
                        type="text"
                        value={settingsBaseUrl}
                        onChange={(e) => { setSettingsBaseUrl(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); }}
                        placeholder="https://openrouter.ai/api/v1"
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary text-sm font-mono"
                      />
                    </div>
                  )}

                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-semibold text-text-primary mb-1">API Key</label>
                    <input
                      type="password"
                      value={settingsApiKey}
                      onChange={(e) => { setSettingsApiKey(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); setSettingsTestResult(''); }}
                      placeholder={MODEL_REGISTRY.find(m => m.provider === settingsProvider)?.provider === 'openai' ? 'sk-proj-...' : 'Enter API key'}
                      className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary text-sm font-mono"
                      autoComplete="off"
                    />
                    <p className="text-xs text-text-secondary font-semibold bg-surface-inset p-2 mt-2 border border-border-standard rounded">
                      API keys are configured securely via backend or deployment environment variables. They are not exposed in the browser.
                    </p>
                  </div>

                  <hr className="border-border-standard" />

                  {/* Text Model */}
                  <div>
                    {fallbackWarning && (
                      <div className="bg-amber-500/10 backdrop-blur-md text-amber-800 p-2 rounded mb-4 text-sm font-semibold border border-amber-200">
                        {fallbackWarning}
                      </div>
                    )}
                    <label className="block text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                      Text Generation Model
                      {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.isRecommended && (
                        <span className="bg-green-100 text-green-800 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold">Recommended Default</span>
                      )}
                    </label>
                    <select
                      value={settingsTextModel}
                      onChange={(e) => { 
                        setSettingsTextModel(e.target.value); 
                        safeLocalStorageSet('coh_settings_text_model', e.target.value);
                        setSettingsTestPassed(null); 
                        setSettingsKeyDirty(true); 
                        setFallbackWarning('');
                      }}
                      disabled={!settingsProvider}
                      className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary text-sm font-mono disabled:opacity-50"
                    >
                      {!settingsTextModel && <option value="">Select a model</option>}
                      {MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'text').map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-text-secondary mt-1 mb-2">Controls written outputs such as drafts, ideas, revisions, and prompts.</p>
                    
                    {settingsTextModel && MODEL_REGISTRY.find(m => m.id === settingsTextModel) && (
                      <div className="mt-2 text-xs text-text-secondary bg-surface-inset p-3 rounded flex flex-col gap-2">
                        <div className="flex gap-4">
                          <span><strong className="text-text-primary">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.quality}</span>
                          <span><strong className="text-text-primary">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.speed}</span>
                        </div>
                        <div>
                          <strong className="text-text-primary block mb-1">Best for:</strong>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.bestUseCase.split(',').map((item, idx) => (
                              <li key={idx}>{item.trim()}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Image Model */}
                  {(settingsProvider === 'openai' || settingsProvider === 'openrouter') && (
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-1 flex items-center gap-2">
                        Image Generation Model
                        {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.isRecommended && (
                          <span className="bg-green-100 text-green-800 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold">Recommended Default</span>
                        )}
                      </label>
                      <select
                        value={settingsImageModel}
                        onChange={(e) => { 
                          setSettingsImageModel(e.target.value); 
                          safeLocalStorageSet('coh_settings_image_model', e.target.value);
                          setSettingsTestPassed(null); 
                          setSettingsKeyDirty(true); 
                          setFallbackWarning('');
                        }}
                        disabled={!settingsProvider}
                        className="w-full bg-surface-primary border border-border-standard p-2 rounded text-text-primary text-sm font-mono disabled:opacity-50"
                      >
                        {!settingsImageModel && <option value="">Select a model</option>}
                        {MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'image').map(m => (
                          <option key={m.id} value={m.id}>{m.label}</option>
                        ))}
                      </select>
                      <p className="text-xs text-text-secondary mt-1 mb-2">
                        Controls Visual Studio image generation. Image quality depends heavily on the selected model.
                        {settingsImageModel === 'gpt-image-2' && <span className="block text-green-700 font-semibold mt-0.5">Recommended for highest visual quality.</span>}
                        {settingsImageModel === 'dall-e-3' && <span className="block text-amber-600 font-semibold mt-0.5">Legacy fallback. May produce less refined visuals than GPT Image models.</span>}
                      </p>
                      
                      {settingsImageModel && MODEL_REGISTRY.find(m => m.id === settingsImageModel) && (
                        <div className="mt-2 text-xs text-text-secondary bg-surface-inset p-3 rounded flex flex-col gap-2">
                          <div className="flex gap-4">
                            <span><strong className="text-text-primary">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.quality}</span>
                            <span><strong className="text-text-primary">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.speed}</span>
                          </div>
                          <div>
                            <strong className="text-text-primary block mb-1">Best for:</strong>
                            <ul className="list-disc pl-4 space-y-0.5">
                              {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.bestUseCase.split(',').map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <hr className="border-border-standard" />

                  {/* Test Connection */}
                  <div className="pb-3">
                    <p className="text-sm font-semibold text-text-primary mb-3">
                      Choose provider and models, then test the connection before saving.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={settingsTestCooldown > 0 || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)}
                        onClick={async () => {
                          setSettingsTesting(true);
                          // Only set testing status if not currently handling a rate limit warning
                          if (aiStatus !== 'error') setAiStatus('testing');
                          
                          setSettingsTestResult('');
                          setSettingsTestPassed(null);
                          try {
                            const result = await aiService.testConnection(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey, settingsBaseUrl || undefined);
                            if (result.connected) {
                              setSettingsTestPassed(true);
                              setSettingsTestResult(`Connection verified. You can now save these settings. (Latency: ${result.latency}ms)`);
                              setAiLastTested(new Date().toLocaleString());
                              setAiLatency(result.latency);
                              setAiStatus('not_connected');
                            } else {
                              setSettingsTestPassed(false);
                              const errMsg = result.error || 'Provider connection failed. Check the API key or provider configuration.';
                              setSettingsTestResult(errMsg);
                              
                              if (errMsg.includes('Rate limit reached')) {
                                setSettingsTestCooldown(30); // 30 second cooldown
                                // Do not overwrite aiStatus if it was a temporary rate limit
                                // This prevents disconnecting a previously working setup
                              } else {
                                setAiStatus('error');
                                setAiLastError(errMsg);
                              }
                            }
                          } catch {
                            setSettingsTestPassed(false);
                            setSettingsTestResult('Could not reach the backend server. Is it running?');
                            setAiStatus('error');
                          } finally {
                            setSettingsTesting(false);
                          }
                        }}
                        className="bg-slate-900 text-text-primary px-4 py-2 rounded text-sm font-semibold hover:bg-slate-900/80 disabled:opacity-40 transition"
                      >
                        {settingsTesting ? 'Testing...' : (settingsTestCooldown > 0 ? `Wait ${settingsTestCooldown}s` : 'Test Connection')}
                      </button>

                      <div className="flex flex-col justify-center">
                        {settingsTestResult && (
                          <span className={`text-sm font-semibold ${settingsTestPassed ? 'text-green-700' : 'text-red-600'}`}>
                            {settingsTestPassed ? '✓ ' : '✗ '}{settingsTestResult}
                          </span>
                        )}

                        {(!settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)) && (
                          <span className="text-xs text-red-500 font-semibold mt-1">
                            Select provider, text model, and image model before testing.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Apply Provider */}
                  <button
                    disabled={settingsTestPassed !== true || settingsApplying || (!settingsKeyDirty && aiStatus === 'connected')}
                    onClick={async () => {
                      setSettingsApplying(true);
                      try {
                        await aiService.applyProvider(settingsProvider, settingsTextModel, settingsImageModel, settingsApiKey, settingsBaseUrl || undefined, aiLastTested);
                        setAiStatus('connected');
                        setAiProvider(settingsProvider);
                        setAiTextModel(settingsTextModel);
                        setAiImageModel(settingsImageModel);
                        setGenerationMode('ai');
                        setAiLastError('');
                        setSettingsTestResult('AI settings saved. Text and image generation are active.');
                        setSettingsKeyDirty(false);
                      } catch {
                        setAiStatus('error');
                        setSettingsTestResult('Failed to apply provider. Check server logs.');
                      } finally {
                        setSettingsApplying(false);
                      }
                    }}
                    className={`w-full text-text-primary px-4 py-2.5 rounded text-sm font-semibold transition ${(!settingsKeyDirty && aiStatus === 'connected') ? 'bg-green-600 hover:bg-green-600' : 'bg-green-700 hover:bg-green-800 disabled:opacity-40'}`}
                  >
                    {settingsApplying ? 'Saving...' 
                    : (!settingsKeyDirty && aiStatus === 'connected') ? 'Settings Saved'
                    : settingsKeyDirty && settingsTestPassed !== true ? 'Test Connection First' 
                    : (!settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)) ? 'Select models before saving.'
                    : aiStatus === 'connected' ? 'Update AI Settings'
                    : 'Save AI Settings'}
                  </button>


                  {/* Generation Mode */}
                  <div className="pt-4 border-t border-border-standard space-y-2">
                    <h4 className="font-semibold text-sm text-text-primary">Generation Mode</h4>
                    <p className="text-xs text-text-secondary">Controls what runs when you click Generate Drafts.</p>
                    <div className="flex flex-col gap-2">
                      {([
                        ['ai', 'AI Generation', 'Use the connected AI provider to generate real content.'],
                        ['prompt_builder', 'Prompt Builder Fallback', 'Show a copyable AI prompt instead of generating directly. Use when no API key is available.'],
                        ['prototype', 'Prototype Structure Only', 'Show template structure as a starting frame. Not final copy.'],
                      ] as const).map(([val, title, desc]) => (
                        <label key={val} className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition ${generationMode === val ? 'border-coh-navy bg-surface-primary' : 'border-border-standard hover:bg-surface-primary/60'}`}>
                          <input type="radio" name="genMode" value={val} checked={generationMode === val} onChange={() => setGenerationMode(val)} className="mt-0.5" />
                          <div>
                            <span className="font-semibold text-sm text-text-primary block">{title}</span>
                            <span className="text-xs text-text-secondary">{desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* .env instructions */}
                  <div className="pt-4 border-t border-border-standard text-xs text-text-secondary space-y-2">
                    <p className="font-semibold text-text-primary text-xs">Persistent Setup via .env (Recommended for development)</p>
                    <p>Add your key to <code className="bg-surface-primary px-1 rounded">.env</code> and restart the server. The key will be loaded automatically.</p>
                    <pre className="bg-surface-primary p-2 rounded text-[10px] font-mono overflow-x-auto">
{`# Example .env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1`}
                    </pre>
                    <p className="text-[10px] text-text-muted">The .env file is git-ignored and stays local. Never commit API keys.</p>
                  </div>
                </div>
              </div>
            )}


          </div>
        
</ErrorBoundary>)}

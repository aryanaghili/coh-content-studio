import re

filepath = 'src/App.tsx'

with open(filepath, 'r') as f:
    content = f.read()

settings_start = content.find("{/* ── AI Connection ─────────────────────────────────────── */}")
settings_end = content.find("</ErrorBoundary>)}", settings_start)

if settings_start == -1 or settings_end == -1:
    print("Could not find Settings block")
    exit(1)

new_settings_block = """{/* ── Settings Sections ─────────────────────────────────────── */}
            {settingsSection === 'ai' && (
              <div className="space-y-8 max-w-4xl mx-auto pb-12">
                
                {/* 1. Provider Connection */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>1. Provider Connection</CardTitle>
                        <p className="text-sm text-text-secondary mt-1">Connect your preferred AI model provider. An API key is required.</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 border ${aiStatus === 'connected' && !settingsKeyDirty ? 'bg-status-success/10 text-status-success border-status-success/20' : 'bg-status-warning/10 text-status-warning border-status-warning/20'}`}>
                        <div className={`w-2 h-2 rounded-full ${aiStatus === 'connected' && !settingsKeyDirty ? 'bg-status-success' : 'bg-status-warning'}`} />
                        {aiStatus === 'connected' && !settingsKeyDirty ? 'Connected' : 'Action Required'}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <Select
                      label="AI Provider"
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
                      options={[
                        { label: 'OpenAI', value: 'openai' },
                        { label: 'Google Gemini', value: 'gemini' },
                        { label: 'Anthropic Claude', value: 'anthropic' },
                        { label: 'Mistral', value: 'mistral' },
                        { label: 'OpenRouter / OpenAI-Compatible', value: 'openrouter' },
                      ]}
                    />

                    {settingsProvider === 'openrouter' && (
                      <Input
                        label="Base URL (Optional)"
                        value={settingsBaseUrl}
                        onChange={(e) => { setSettingsBaseUrl(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); }}
                        placeholder="https://openrouter.ai/api/v1"
                        className="font-mono text-sm"
                        helperText="Required if using a custom OpenAI-compatible endpoint."
                      />
                    )}

                    <div>
                      <Input
                        label="API Key"
                        type="password"
                        value={settingsApiKey}
                        onChange={(e) => { setSettingsApiKey(e.target.value); setSettingsTestPassed(null); setSettingsKeyDirty(true); setSettingsTestResult(''); }}
                        placeholder={MODEL_REGISTRY.find(m => m.provider === settingsProvider)?.provider === 'openai' ? 'sk-proj-...' : 'Enter API key'}
                        className="font-mono text-sm"
                        autoComplete="off"
                        helperText="API keys are configured securely via backend or deployment environment variables. They are not exposed in the browser."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Model Preferences */}
                <Card className={!settingsProvider ? 'opacity-50 pointer-events-none' : ''}>
                  <CardHeader>
                    <CardTitle>2. Model Preferences</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">Select the specific models to use for text and visual generation.</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {fallbackWarning && (
                      <div className="bg-status-warning/10 text-status-warning p-3 rounded border border-status-warning/20 text-sm font-semibold flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {fallbackWarning}
                      </div>
                    )}
                    
                    <div>
                      <Select
                        label="Text Generation Model"
                        value={settingsTextModel}
                        onChange={(e) => { 
                          setSettingsTextModel(e.target.value); 
                          safeLocalStorageSet('coh_settings_text_model', e.target.value);
                          setSettingsTestPassed(null); 
                          setSettingsKeyDirty(true); 
                          setFallbackWarning('');
                        }}
                        disabled={!settingsProvider}
                        options={[
                          { label: 'Select a model...', value: '' },
                          ...MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'text').map(m => ({
                            label: `${m.label} ${m.isRecommended ? '(Recommended)' : ''}`,
                            value: m.id
                          }))
                        ]}
                        helperText="Controls written outputs such as drafts, ideas, revisions, and prompts."
                      />
                      
                      {settingsTextModel && MODEL_REGISTRY.find(m => m.id === settingsTextModel) && (
                        <div className="mt-3 text-sm text-text-secondary bg-surface-inset p-4 rounded-lg border border-border-standard flex flex-col gap-2">
                          <div className="flex gap-6">
                            <span><strong className="text-text-primary">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.quality}</span>
                            <span><strong className="text-text-primary">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.speed}</span>
                          </div>
                          <div>
                            <strong className="text-text-primary block mb-1">Best for:</strong>
                            <ul className="list-disc pl-5 space-y-1">
                              {MODEL_REGISTRY.find(m => m.id === settingsTextModel)?.bestUseCase.split(',').map((item, idx) => (
                                <li key={idx}>{item.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>

                    {(settingsProvider === 'openai' || settingsProvider === 'openrouter') && (
                      <div className="pt-4 border-t border-border-standard">
                        <Select
                          label="Image Generation Model"
                          value={settingsImageModel}
                          onChange={(e) => { 
                            setSettingsImageModel(e.target.value); 
                            safeLocalStorageSet('coh_settings_image_model', e.target.value);
                            setSettingsTestPassed(null); 
                            setSettingsKeyDirty(true); 
                            setFallbackWarning('');
                          }}
                          disabled={!settingsProvider}
                          options={[
                            { label: 'Select a model...', value: '' },
                            ...MODEL_REGISTRY.filter(m => m.provider === settingsProvider && m.type === 'image').map(m => ({
                              label: `${m.label} ${m.isRecommended ? '(Recommended)' : ''}`,
                              value: m.id
                            }))
                          ]}
                          helperText="Controls Visual Studio image generation. Image quality depends heavily on the selected model."
                        />
                        
                        {settingsImageModel && MODEL_REGISTRY.find(m => m.id === settingsImageModel) && (
                          <div className="mt-3 text-sm text-text-secondary bg-surface-inset p-4 rounded-lg border border-border-standard flex flex-col gap-2">
                            <div className="flex gap-6">
                              <span><strong className="text-text-primary">Quality:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.quality}</span>
                              <span><strong className="text-text-primary">Speed:</strong> {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.speed}</span>
                            </div>
                            <div>
                              <strong className="text-text-primary block mb-1">Best for:</strong>
                              <ul className="list-disc pl-5 space-y-1">
                                {MODEL_REGISTRY.find(m => m.id === settingsImageModel)?.bestUseCase.split(',').map((item, idx) => (
                                  <li key={idx}>{item.trim()}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Testing & Verification */}
                <Card className={!settingsTextModel ? 'opacity-50 pointer-events-none' : ''}>
                  <CardHeader>
                    <CardTitle>3. Test & Save Connection</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">Verify your credentials work before saving the configuration.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-surface-inset p-4 rounded-lg border border-border-standard mb-6">
                      <Button
                        variant="secondary"
                        disabled={settingsTestCooldown > 0 || settingsTesting || !settingsApiKey.trim() || !settingsProvider || !settingsTextModel || ((settingsProvider === 'openai' || settingsProvider === 'openrouter') && !settingsImageModel)}
                        onClick={async () => {
                          setSettingsTesting(true);
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
                                setSettingsTestCooldown(30);
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
                      >
                        {settingsTesting ? 'Testing...' : (settingsTestCooldown > 0 ? `Wait ${settingsTestCooldown}s` : 'Test Connection')}
                      </Button>

                      <div className="flex-1">
                        {settingsTestResult ? (
                          <div className={`flex items-center gap-2 text-sm font-semibold ${settingsTestPassed ? 'text-status-success' : 'text-status-error'}`}>
                            {settingsTestPassed ? <Check size={16} /> : <AlertTriangle size={16} />}
                            {settingsTestResult}
                          </div>
                        ) : (
                          <div className="text-sm text-text-muted">Click to test your current setup.</div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full py-3"
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
                    >
                      {settingsApplying ? 'Saving Configuration...' 
                      : (!settingsKeyDirty && aiStatus === 'connected') ? '✓ Settings Up to Date'
                      : settingsKeyDirty && settingsTestPassed !== true ? 'Test Connection First' 
                      : 'Save and Activate AI Generation'}
                    </Button>
                  </CardContent>
                </Card>

                {/* 4. Generation Mode Override */}
                <Card>
                  <CardHeader>
                    <CardTitle>4. Generation Mode Override</CardTitle>
                    <p className="text-sm text-text-secondary mt-1">Force the system to use a specific generation mode, overriding the active AI Connection.</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {([
                        ['ai', 'AI Generation', 'Use the connected AI provider to generate real content.'],
                        ['prompt_builder', 'Prompt Builder Fallback', 'Show a copyable AI prompt instead of generating directly. Use when no API key is available.'],
                        ['prototype', 'Prototype Structure Only', 'Show template structure as a starting frame. Not final copy.'],
                      ] as const).map(([val, title, desc]) => (
                        <label key={val} className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition ${generationMode === val ? 'border-brand-gold bg-surface-inset shadow-sm' : 'border-border-standard hover:bg-surface-inset'}`}>
                          <input type="radio" name="genMode" value={val} checked={generationMode === val} onChange={() => setGenerationMode(val)} className="mt-1" />
                          <div>
                            <span className="font-semibold text-[15px] text-text-primary block">{title}</span>
                            <span className="text-sm text-text-secondary">{desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            """

content = content[:settings_start] + new_settings_block + content[settings_end:]

with open(filepath, 'w') as f:
    f.write(content)

print("Settings block refactored.")

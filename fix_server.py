with open('server.js', 'r') as f:
    content = f.read()

old_logic = """app.post('/api/operating-core/unlock', (req, res) => {
  const { code } = req.body;
  const envCode = process.env.OPERATING_CORE_ADMIN_CODE;
  
  // In production, strictly require the env variable
  if (process.env.NODE_ENV === 'production') {
    if (!envCode) {
      return res.status(403).json({ success: false, error: 'Operating Core admin code is not configured.' });
    }
    if (code === envCode) {
      return res.json({ success: true });
    }
  } else {
    // Local development
    const validCode = envCode || 'COH-CORE-2026';
    if (code === validCode) {
      return res.json({ success: true });
    }
  }
  
  return res.status(401).json({ success: false, error: 'Invalid code' });
});"""

new_logic = """app.post('/api/operating-core/unlock', (req, res) => {
  const submittedCode = String(req.body.code || "").trim();
  const envCode = process.env.OPERATING_CORE_ADMIN_CODE?.trim();
  
  // In production, strictly require the env variable
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  
  if (isProd) {
    if (!envCode) {
      return res.status(403).json({ success: false, error: 'Operating Core admin code is not configured.' });
    }
    if (submittedCode === envCode && submittedCode !== "") {
      return res.json({ success: true });
    }
  } else {
    // Local development
    const validCode = envCode || 'COH-CORE-2026';
    if (submittedCode === validCode && submittedCode !== "") {
      return res.json({ success: true });
    }
  }
  
  return res.status(401).json({ success: false, error: 'Invalid code' });
});"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open('server.js', 'w') as f:
        f.write(content)
    print("Server logic fixed")
else:
    print("Server logic NOT found")


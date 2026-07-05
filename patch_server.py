import re

with open('server.js', 'r') as f:
    content = f.read()

endpoint_code = """
app.post('/api/operating-core/unlock', (req, res) => {
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
});
"""

if "/api/operating-core/unlock" not in content:
    content = content.replace("app.use(express.json({ limit: '2mb' }));", "app.use(express.json({ limit: '2mb' }));\n" + endpoint_code)
    with open('server.js', 'w') as f:
        f.write(content)
    print("Server patched")
else:
    print("Server already patched")


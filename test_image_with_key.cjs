async function test() {
  const url = 'http://localhost:3001/api/ai/generate-image';
  
  const payload = {
    prompt: "London Climate Action Week",
    promptBuildMode: "Manual Only",
    aspectRatio: "Website Hero (1792x1024)",
    visualBrief: {},
    inputMode: "Manual",
    provider: "openai",
    model: "gpt-image-1"
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // Mock the token in case it's pulled from headers (it isn't, but still)
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

test();

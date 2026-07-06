import fetch from 'node-fetch';

async function run() {
    const res = await fetch('http://localhost:3001/api/ai/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ previousDraft: 'Hello world', mode: 'revision' })
    });
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
}

run();

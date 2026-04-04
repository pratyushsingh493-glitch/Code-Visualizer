const key = 'org_01knd594xxe0z83japx1yaxc96';

async function checkGroq() {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: "llama3-8b-8192", messages: [{role: "user", content: "hi"}]})
  });
  console.log('Groq status:', res.status);
  console.log(await res.text());
}

async function checkXAI() {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: "grok-beta", messages: [{role: "user", content: "hi"}]})
  });
  console.log('xAI status:', res.status);
  console.log(await res.text());
}

async function run() {
  await checkGroq();
  await checkXAI();
}
run();

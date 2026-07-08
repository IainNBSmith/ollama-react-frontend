import http from 'http';
import ollama from 'ollama';

// this backend will do processing on responses and should also have
// the option to call the ollama API directly if needed. It will also be able to store messages in memory for now, but can be extended to use a database later.

let messages = [];

async function getOllamaResponse(input) {
  const model_response = await ollama.chat({
    model: 'gemma4',
    messages: [{ role: 'user', content: input }],
  });
  return model_response;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || 'http://localhost:5173'

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.url === '/api/message' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Hello from the backend!' }))
    return
  }

  if (req.url === '/api/message' && req.method === 'POST') {
    let body = ''

    req.on('data', (chunk) => {
      body += chunk
    })

    req.on('end', async () => {
      const parsed = JSON.parse(body)
      messages.push(parsed)

      const data = await getOllamaResponse(parsed.text)

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ received: data.message.content }))
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(3001, () => {
  console.log('Backend running on http://localhost:3001')
})

import { useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('')
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')

  async function loadMessage() {
    const response = await fetch('/api/message')
    const data = await response.json()
    setMessage(data.message)
  }

  async function submitMessage(event) {
    event.preventDefault()

    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input }),
    })

    const data = await response.json()
    setStatus(JSON.stringify(data))
  }

  return (
    <div className="app">
      <h1>React + Backend Tutorial</h1>
      <button onClick={loadMessage}>Get message</button>
      <p>{message}</p>

      <form onSubmit={submitMessage}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send message</button>
      </form>

      <p>{status}</p>
    </div>
  )
}

export default App
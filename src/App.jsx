import { useState } from 'react'
import './App.css'


const formatResponseJSONList = (responseList) => {
  // Expected format of responseList: [{type: 'issue', text: 'some text', hoverContent: 'some hover content'},
  // OR                                {type: 'normal', text: 'some other text'}]

  // TODO: add error handling for unexpected formats if ollama fails...
  // initial ollama call should ask to format all important issues as the 'issue' type with hoverContent, 
  //  all the other text will be functionally formatted to avoid LLM issues with full text.

  // TODO: make it so separate spans of text can be related to the same issue and obviously show when hovering that they are 
  //  the same.
  let fullText = [];
  for (const item of responseList) {
    if (item.type === 'issue') {
      fullText.push(<HoverableText text={item.text} hoverContent={item.hoverContent} />);
    } else {
      fullText.push(<span>{item.text}</span>);
    }
  }
  return fullText;
};

const HoverableText = ({ text, hoverContent }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ position: 'relative', cursor: 'pointer', color: 'blue' }}
    >
      {text}
      {isHovered && (
        <span style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          zIndex: 10,
          whiteSpace: 'nowrap'
        }}>
          {hoverContent}
        </span>
      )}
    </span>
  );
};

function App() {
  const [message, setMessage] = useState('')
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')

  async function loadMessage() {
    const response = await fetch('/api/message')
    const data = await response.json()
    //setMessage(<HoverableText text={data.message} hoverContent={data.hoverMessage} />)
    setMessage(formatResponseJSONList(data.message))
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
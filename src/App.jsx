import { useState } from 'react'
import './App.css'



  // Expected format of responseList: [{type: 'logic-fallacy', logicID: 'some ID', text: 'some text', hoverContent: 'some hover content'},
  //                                   {type: 'logic-string', logicID: 'some ID', text: 'some other text'}
  // OR                                {type: 'normal', text: 'some other text'}]

  // TODO: add error handling for unexpected formats if ollama fails...
  // initial ollama call should ask to format all important issues as the 'issue' type with hoverContent, 
  //  all the other text will be functionally formatted to avoid LLM issues with full text.

  // TODO: make it so separate spans of text can be related to the same issue and obviously show when hovering that they are 
  //  the same.

  // TODO: add differentiable IDs to the hoverable text so that a user can conviniently add it to context when asking for a followup.

  // TODO: make backend only utility which runs a given response ten times to verify indecisiveness, then call for the fallacies from
  //  the API. Formatting everything into either text or excel formats.
  //  Add a button for this utility which will take the current response and run several times, cheking YTA/NTA each time.

//TODO: make the hoverable text show only one message, but specifically over the passage which you are hovering?

const HoverableText = ({ text, hoverContent, hoverId, activeHoverId, onHoverChange, highlightColor='#fff4a3', hoveringHighlightColor='#272301' }) => {
  const isActive = hoverId !== null && hoverId !== undefined && hoverId === activeHoverId

  return (
    <span
      onMouseEnter={() => onHoverChange(hoverId)}
      onMouseLeave={() => onHoverChange(null)}
      style={{
        position: 'relative',
        cursor: 'pointer',
        textAlign: 'left',
        color: isActive ? 'black' : 'white',
        display: 'inline',
        padding: '0 2px',
        borderRadius: '3px',
        backgroundColor: isActive ? highlightColor : hoveringHighlightColor,
        boxShadow: isActive ? '0 0 0 2px rgba(255, 193, 7, 0.45)' : 'none',
        transform: isActive ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.15s ease',
      }}
    >
      {text}
      {isActive && (hoverContent !== null && hoverContent !== undefined && hoverContent !== '') && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 10,
            minWidth: '200px',
            maxWidth: '1000px',
            wordWrap: 'break-word',
            textAlign: 'left'
          }}
        >
          {hoverContent}
        </div>
      )}
    </span>
  )
}

const formatResponseJSONList = (responseList, activeHoverId, setActiveHoverId) => {
  if (!Array.isArray(responseList)) {
    return <span>{responseList}</span>
  }

  return responseList.map((item, index) => {
    if (!item || typeof item !== 'object') {
      return <span key={`plain-${index}`}>{item}</span>
    }

    const text = item.text ?? ''
    const hoverId = item.hoverId || item.logicID || item.id || null
    const hoverContent = item.hoverContent || item.hover || item.explanation || ''
    const isHoverable = item.type === 'issue' || item.type === 'logic-fallacy' || item.type === 'logic-string'

    if (isHoverable && text) {
      return (
        <HoverableText
          key={`${hoverId || `hover-${index}`}-${index}`}
          text={text}
          hoverContent={hoverContent || ''}
          hoverId={hoverId || `hover-${index}`}
          activeHoverId={activeHoverId}
          onHoverChange={setActiveHoverId}
        />
      )
    }

    return <span key={`plain-${index}`}>{text}</span>
  })
}

// all three expect formatted text like such [{text: 'some text'}, {text: 'some text', hoverID: 'some hover ID', hoverContent: 'some hover content'}, {text: 'some other text', hoverID: 'some hover ID'}]
// to be displayed in order
// TODO: make the color of the highlighting change depending on whether a fallacy was detected or based on the confidence level
const ProcessedPrompt = ({ prompt, activeHoverId, setActiveHoverId }) => {
  // put prompts into a single central card with processing done.
  return (
    <div className="processed-prompt-card">
      {formatResponseJSONList(prompt, activeHoverId, setActiveHoverId)}
    </div>
  )
}

const ProcessedThinking = ({ thinking, activeHoverId, setActiveHoverId }) => {
  // put thinking into a collapsible box which can be expanded to see the full thinking, but otherwise is hidden.
  // have same hoverable text formatting as others.
  return (
    <div className="processed-thinking-card">
      {formatResponseJSONList(thinking, activeHoverId, setActiveHoverId)}
    </div>
  )
}

const ProcessedResponse = ({ response, activeHoverId, setActiveHoverId }) => {
  // put response into a single card in a larger menu so that multiple decisions may be shown together.
  return (
    <div className="processed-response-card">
      {formatResponseJSONList(response, activeHoverId, setActiveHoverId)}
    </div>
  )
}


function App() {
  const [responseItems, setResponseItems] = useState([])
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [activeHoverId, setActiveHoverId] = useState(null)

  async function loadMessage() {
    const response = await fetch('/api/message')
    const data = await response.json()

    if (Array.isArray(data.message)) {
      setResponseItems(data.message)
    } else {
      setResponseItems([{ type: 'normal', text: data.message || '' }])
    }
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
    setStatus(JSON.stringify({prompt: data.prompt, thinking: data.thinking, response: data.response, reflection: data.reflection}))
    //  <ProcessedPrompt key="prompt" prompt={data.prompt} activeHoverId={activeHoverId} setActiveHoverId={setActiveHoverId} />,
    //  <ProcessedThinking key="thinking" thinking={data.thinking} activeHoverId={activeHoverId} setActiveHoverId={setActiveHoverId} />,
    //  <ProcessedResponse key="response" response={data.response} activeHoverId={activeHoverId} setActiveHoverId={setActiveHoverId} />,
    //])
  }

  return (
    <div className="app">
      <h1>React + Backend Tutorial</h1>
      <button onClick={loadMessage}>Get message</button>
      <p>{formatResponseJSONList(responseItems, activeHoverId, setActiveHoverId)}</p>

      <form onSubmit={submitMessage}>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send message</button>
      </form>

      <div>{status}</div>
    </div>
  )
}

/*
<ProcessedPrompt key="prompt" prompt={status.prompt} activeHoverId={activeHoverId} setActiveHoverId={setActiveHoverId} />
        <ProcessedThinking key="thinking" thinking={status.thinking} activeHoverId={activeHoverId} setActiveHoverId={setActiveHoverId} />
        <ProcessedResponse key="response" response={status.response} activeHoverId={activeHoverId} setActiveHoverId={setActiveHoverId} />
      </div>
      */

export default App

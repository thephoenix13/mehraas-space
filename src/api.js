const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a warm, gentle, and empathetic companion for someone dealing with anxiety and depression. Always validate feelings, never minimize them. Be kind, calm, and supportive. Never give medical advice. Keep responses concise and comforting.`

export async function callClaude(userMessage, systemOverride = null, maxTokens = 400) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemOverride || SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }]
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || 'Something went wrong with the AI. Please try again.')
  }

  const data = await response.json()
  return data.content[0].text
}

export async function callClaudeChat(messages, systemOverride = null, maxTokens = 500) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemOverride || SYSTEM_PROMPT,
      messages
    })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || 'Something went wrong. Please try again.')
  }

  const data = await response.json()
  return data.content[0].text
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaudeChat } from '../api'

const SYSTEM_PROMPT = `You are a warm, gentle, and empathetic companion for someone dealing with anxiety and depression. Your name is Soleil.

Guidelines:
- Always validate feelings before offering any perspective
- Never minimize or dismiss emotions ("at least...", "you should be grateful")
- Never give medical advice or diagnoses
- Be warm, patient, and genuinely caring
- Keep responses conversational and not too long (3-5 sentences usually)
- If someone seems to be in crisis, gently encourage them to reach out to a professional or crisis line
- Use gentle language, occasional soft affirmations
- Remember you're a companion, not a therapist`

export default function TalkToMe() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there 💜 I'm Soleil, your gentle companion. This is a safe space — you can share anything that's on your heart or mind. How are you doing today?"
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)

    try {
      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))
      const reply = await callClaudeChat(apiMessages, SYSTEM_PROMPT, 600)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm here with you. Sometimes connections have little hiccups — please try again in a moment. 💜"
      }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Hi there 💜 I'm Soleil, your gentle companion. This is a safe space — you can share anything that's on your heart or mind. How are you doing today?"
    }])
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'linear-gradient(160deg, #f5f0ff, #fce4ec)'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,184,232,0.2)', position: 'sticky', top: 0, zIndex: 10
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(201,184,232,0.2)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #c9b8e8, #f5c6d0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
            }}
          >💜</motion.div>
          <div>
            <div style={{ fontWeight: 700, color: '#4a4060', fontSize: '0.9rem' }}>Soleil</div>
            <div style={{ fontSize: '0.7rem', color: '#b2c9b2', fontWeight: 600 }}>● Always here</div>
          </div>
        </div>
        <button onClick={clearChat} style={{
          background: 'none', border: 'none', color: '#a89ebb', cursor: 'pointer',
          fontSize: '0.78rem', textDecoration: 'underline', fontFamily: 'Nunito, sans-serif'
        }}>Clear</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px 16px',
        paddingBottom: 140, display: 'flex', flexDirection: 'column', gap: 16
      }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: 8
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #c9b8e8, #f5c6d0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
                }}>💜</div>
              )}
              <div style={{
                maxWidth: '75%',
                background: msg.role === 'user'
                  ? 'linear-gradient(135deg, #c9b8e8, #b39ddb)'
                  : 'white',
                color: msg.role === 'user' ? 'white' : '#4a4060',
                borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                padding: '12px 18px',
                boxShadow: '0 4px 16px rgba(180,150,200,0.12)',
                fontSize: '0.95rem',
                lineHeight: 1.65,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'linear-gradient(135deg, #c9b8e8, #f5c6d0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem'
              }}>💜</div>
              <div style={{
                background: 'white', borderRadius: '20px 20px 20px 6px',
                padding: '14px 18px', boxShadow: '0 4px 16px rgba(180,150,200,0.12)'
              }}>
                <div className="dots-loading"><span/><span/><span/></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        position: 'fixed', bottom: 60, left: 0, right: 0,
        padding: '12px 16px',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(201,184,232,0.2)',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Share what's on your mind..."
            rows={1}
            style={{
              flex: 1, borderRadius: 20, padding: '12px 18px', resize: 'none', maxHeight: 100,
              border: '2px solid rgba(201,184,232,0.4)',
              background: 'rgba(245,240,255,0.5)', fontSize: '0.95rem',
              lineHeight: 1.5, overflowY: 'auto', transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(201,184,232,0.9)'}
            onBlur={e => e.target.style.borderColor = 'rgba(201,184,232,0.4)'}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={send}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer',
              background: input.trim() && !loading
                ? 'linear-gradient(135deg, #c9b8e8, #b39ddb)'
                : '#e8dffa',
              color: 'white', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.2s ease'
            }}
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '0.9rem' }}>⟳</motion.div>
            ) : '→'}
          </motion.button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: '0.7rem', color: '#c0b8d0' }}>
          Not a substitute for professional help. If you're in crisis, please contact a crisis line. 💜
        </div>
      </div>
    </div>
  )
}

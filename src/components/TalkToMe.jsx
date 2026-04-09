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
  const [messages, setMessages] = useState([{ role: 'assistant', content: "Hi there 🌸 I'm Soleil, your gentle companion. This is a safe space — you can share anything that's on your heart or mind. How are you doing today?" }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setLoading(true)
    try {
      const reply = await callClaudeChat(newMessages.map(m => ({ role: m.role, content: m.content })), SYSTEM_PROMPT, 600)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm here with you. Sometimes connections have little hiccups — please try again in a moment." }])
    }
    setLoading(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const clearChat = () => setMessages([{ role: 'assistant', content: "Hi there 🌸 I'm Soleil, your gentle companion. This is a safe space — you can share anything that's on your heart or mind. How are you doing today?" }])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF3E0' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderBottom: '1px solid #F0E6D0', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 8px rgba(180,120,60,0.06)' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Home</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #D4770A, #E8A020)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
            🌸
          </motion.div>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#C0392B', fontSize: '0.92rem' }}>Soleil</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#7A9E7A', fontWeight: 600 }}>● Always here</div>
          </div>
        </div>
        <button onClick={clearChat} style={{ background: 'none', border: 'none', color: '#7A6A5A', cursor: 'pointer', fontSize: '0.78rem', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>Clear</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 140, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', damping: 24, stiffness: 200 }}
              style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #D4770A, #E8A020)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🌸</div>
              )}
              <div style={{
                maxWidth: '75%',
                background: msg.role === 'user' ? '#C0392B' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#2C2C2C',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '12px 18px',
                border: msg.role === 'user' ? 'none' : '1px solid #F0E6D0',
                boxShadow: '0 2px 10px rgba(180,120,60,0.08)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.93rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}>{msg.content}</div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #D4770A, #E8A020)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🌸</div>
              <div style={{ background: '#fff', border: '1px solid #F0E6D0', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', boxShadow: '0 2px 10px rgba(180,120,60,0.08)' }}>
                <div className="dots-loading"><span/><span/><span/></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ position: 'fixed', bottom: 60, left: 0, right: 0, padding: '12px 16px', background: 'rgba(250,243,224,0.96)', backdropFilter: 'blur(16px)', borderTop: '1px solid #F0E6D0' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Share what's on your mind…" rows={1}
            style={{ flex: 1, borderRadius: 18, padding: '12px 16px', resize: 'none', maxHeight: 100, border: '1.5px solid #F0E6D0', background: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.93rem', lineHeight: 1.5, overflowY: 'auto', outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#D4770A'} onBlur={e => e.target.style.borderColor = '#F0E6D0'}
            onInput={e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px' }} />
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={send} disabled={!input.trim() || loading}
            style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', cursor: 'pointer', background: input.trim() && !loading ? '#C0392B' : '#F0E6D0', color: '#fff', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s ease' }}>
            {loading ? <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ fontSize: '0.9rem' }}>⟳</motion.span> : '→'}
          </motion.button>
        </div>
        <div style={{ textAlign: 'center', marginTop: 8, fontFamily: 'Inter, sans-serif', fontSize: '0.68rem', color: '#7A6A5A' }}>
          Not a substitute for professional help. If you're in crisis, please contact a crisis line.
        </div>
      </div>
    </div>
  )
}

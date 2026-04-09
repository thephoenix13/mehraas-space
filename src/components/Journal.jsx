import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const today = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const todayKey = () => new Date().toISOString().split('T')[0]

export default function Journal() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('home')
  const [freeText, setFreeText] = useState('')
  const [guidedText, setGuidedText] = useState('')
  const [prompt, setPrompt] = useState('')
  const [promptLoading, setPromptLoading] = useState(false)
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('journal_entries') || '[]'))
  const [saved, setSaved] = useState(false)

  const loadPrompt = async () => {
    setPromptLoading(true)
    try {
      const text = await callClaude(
        'Give me one gentle, open-ended journal prompt for someone who wants to reflect on their feelings and inner world. Keep it warm, non-pressuring, and emotionally intelligent. Just the prompt itself, no preamble.',
        'You generate thoughtful, warm journal prompts. Reply with only the prompt text.'
      )
      setPrompt(text.trim())
    } catch {
      setPrompt('What is something that made you feel even a tiny bit lighter today?')
    }
    setPromptLoading(false)
  }

  const enterGuided = () => { setMode('guided'); if (!prompt) loadPrompt() }

  const saveEntry = (text, type) => {
    if (!text.trim()) return
    const entry = { id: Date.now(), date: todayKey(), displayDate: today(), type, content: text.trim(), prompt: type === 'guided' ? prompt : null }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('journal_entries', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => { setSaved(false); setMode('home') }, 1500)
  }

  const menuCard = (emoji, title, desc, onClick) => (
    <button onClick={onClick} style={{
      background: '#fff', border: '1px solid #F0E6D0', borderRadius: 16,
      padding: '20px 24px', cursor: 'pointer', textAlign: 'left',
      boxShadow: '0 2px 12px rgba(180,120,60,0.07)', width: '100%',
      transition: 'all 0.25s ease',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(180,120,60,0.12)' }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(180,120,60,0.07)' }}
    >
      <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{emoji}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#C0392B', marginBottom: 4 }}>{title}</div>
      <div style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.82rem' }}>{desc}</div>
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      <div style={{ padding: '16px 20px' }}>
        {mode !== 'home' ? (
          <button onClick={() => setMode('home')} className="back-btn">← Back</button>
        ) : (
          <button onClick={() => navigate('/')} className="back-btn">← Home</button>
        )}
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {mode === 'home' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📓 Journal</h1>
                <p>{today()}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {menuCard('✏️', 'Free Write', 'Just let your thoughts flow, no structure needed', () => setMode('free'))}
                {menuCard('🌿', 'Guided Mode', 'AI-generated prompt to spark reflection', enterGuided)}
                {menuCard('📚', 'Past Entries', `${entries.length} entries written`, () => setMode('past'))}
              </div>
            </motion.div>
          )}

          {mode === 'free' && (
            <motion.div key="free" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header"><h1>✏️ Free Write</h1><p>No rules. Just you and your thoughts.</p></div>
              <div className="card">
                <textarea value={freeText} onChange={e => setFreeText(e.target.value)}
                  placeholder="Start writing anything on your mind…" rows={12}
                  style={{ marginBottom: 16, fontSize: '1rem', lineHeight: 1.8 }} autoFocus />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => setFreeText('')} className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>Clear</button>
                  <button onClick={() => saveEntry(freeText, 'free')} className="btn btn-primary" disabled={!freeText.trim()}>
                    {saved ? '✓ Saved!' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'guided' && (
            <motion.div key="guided" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header"><h1>🌿 Guided Journal</h1></div>
              <div className="card" style={{ marginBottom: 16, background: '#F5EDD6', border: '1px solid #F0E6D0' }}>
                {promptLoading ? (
                  <div className="ai-loading"><div className="dots-loading"><span/><span/><span/></div><span>Finding a gentle prompt…</span></div>
                ) : (
                  <>
                    <p style={{ fontStyle: 'italic', color: '#2C2C2C', lineHeight: 1.7, marginBottom: 10 }}>{prompt}</p>
                    <button onClick={loadPrompt} style={{
                      background: 'none', border: 'none', color: '#D4770A', fontSize: '0.8rem',
                      cursor: 'pointer', textDecoration: 'underline', padding: 0, fontFamily: 'Inter, sans-serif'
                    }}>Try another prompt</button>
                  </>
                )}
              </div>
              <div className="card">
                <textarea value={guidedText} onChange={e => setGuidedText(e.target.value)}
                  placeholder="Your response…" rows={10}
                  style={{ marginBottom: 16, fontSize: '1rem', lineHeight: 1.8 }} autoFocus />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => saveEntry(guidedText, 'guided')} className="btn btn-primary" disabled={!guidedText.trim()}>
                    {saved ? '✓ Saved!' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'past' && (
            <motion.div key="past" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header"><h1>📚 Past Entries</h1><p>{entries.length} entries in your journal</p></div>
              {entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📓</div>
                  <p>No entries yet. Start writing today!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {entries.map(e => (
                    <div key={e.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', color: '#7A6A5A', fontWeight: 600 }}>{e.displayDate}</span>
                        <span style={{
                          background: e.type === 'guided' ? '#FAF3E0' : '#FFF8F0',
                          color: e.type === 'guided' ? '#D4770A' : '#C0392B',
                          border: `1px solid ${e.type === 'guided' ? '#F0E6D0' : '#F0D0C8'}`,
                          fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700,
                          padding: '3px 10px', borderRadius: 50,
                        }}>{e.type === 'guided' ? '🌿 Guided' : '✏️ Free'}</span>
                      </div>
                      {e.prompt && <p style={{ fontStyle: 'italic', color: '#7A6A5A', fontSize: '0.82rem', marginBottom: 8 }}>"{e.prompt}"</p>}
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#2C2C2C', fontSize: '0.88rem', lineHeight: 1.7 }}>
                        {e.content.length > 200 ? e.content.slice(0, 200) + '…' : e.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

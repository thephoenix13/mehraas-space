import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const today = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
const todayKey = () => new Date().toISOString().split('T')[0]

export default function Journal() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('home') // home | free | guided | past
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

  const enterGuided = () => {
    setMode('guided')
    if (!prompt) loadPrompt()
  }

  const saveEntry = (text, type) => {
    if (!text.trim()) return
    const entry = {
      id: Date.now(),
      date: todayKey(),
      displayDate: today(),
      type,
      content: text.trim(),
      prompt: type === 'guided' ? prompt : null
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('journal_entries', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => { setSaved(false); setMode('home') }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #fff5f7, #f5f0ff)' }}>
      <div style={{ padding: '16px 20px' }}>
        {mode !== 'home' ? (
          <button onClick={() => setMode('home')} style={{
            background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
            padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
          }}>← Back</button>
        ) : (
          <button onClick={() => navigate('/')} style={{
            background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
            padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
          }}>← Home</button>
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <button onClick={() => setMode('free')} style={{
                  background: 'white', border: 'none', borderRadius: 20, padding: '20px 24px',
                  cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 16px rgba(180,150,200,0.12)',
                  transition: 'all 0.25s ease'
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>✏️</div>
                  <div style={{ fontWeight: 700, color: '#4a4060', marginBottom: 4 }}>Free Write</div>
                  <div style={{ color: '#a89ebb', fontSize: '0.85rem' }}>Just let your thoughts flow, no structure needed</div>
                </button>
                <button onClick={enterGuided} style={{
                  background: 'white', border: 'none', borderRadius: 20, padding: '20px 24px',
                  cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 16px rgba(180,150,200,0.12)',
                  transition: 'all 0.25s ease'
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🌿</div>
                  <div style={{ fontWeight: 700, color: '#4a4060', marginBottom: 4 }}>Guided Mode</div>
                  <div style={{ color: '#a89ebb', fontSize: '0.85rem' }}>AI-generated prompt to spark reflection</div>
                </button>
                <button onClick={() => setMode('past')} style={{
                  background: 'white', border: 'none', borderRadius: 20, padding: '20px 24px',
                  cursor: 'pointer', textAlign: 'left', boxShadow: '0 4px 16px rgba(180,150,200,0.12)',
                  transition: 'all 0.25s ease'
                }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>📚</div>
                  <div style={{ fontWeight: 700, color: '#4a4060', marginBottom: 4 }}>Past Entries</div>
                  <div style={{ color: '#a89ebb', fontSize: '0.85rem' }}>{entries.length} entries written</div>
                </button>
              </div>
            </motion.div>
          )}

          {mode === 'free' && (
            <motion.div key="free" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header">
                <h1>✏️ Free Write</h1>
                <p>No rules. Just you and your thoughts.</p>
              </div>
              <div className="card">
                <textarea
                  value={freeText}
                  onChange={e => setFreeText(e.target.value)}
                  placeholder="Start writing anything on your mind..."
                  rows={12}
                  style={{ marginBottom: 16, fontSize: '1rem', lineHeight: 1.8 }}
                  autoFocus
                />
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
              <div className="page-header">
                <h1>🌿 Guided Journal</h1>
              </div>
              <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #f5f0ff, #fff5f7)' }}>
                {promptLoading ? (
                  <div className="ai-loading">
                    <div className="dots-loading"><span/><span/><span/></div>
                    <span>Finding a gentle prompt for you...</span>
                  </div>
                ) : (
                  <>
                    <p style={{ fontStyle: 'italic', color: '#5a5070', lineHeight: 1.7, marginBottom: 12 }}>{prompt}</p>
                    <button onClick={loadPrompt} style={{
                      background: 'none', border: 'none', color: '#a89ebb', fontSize: '0.8rem',
                      cursor: 'pointer', textDecoration: 'underline', padding: 0
                    }}>Try another prompt</button>
                  </>
                )}
              </div>
              <div className="card">
                <textarea
                  value={guidedText}
                  onChange={e => setGuidedText(e.target.value)}
                  placeholder="Your response..."
                  rows={10}
                  style={{ marginBottom: 16, fontSize: '1rem', lineHeight: 1.8 }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button onClick={() => saveEntry(guidedText, 'guided')} className="btn btn-primary" disabled={!guidedText.trim()}>
                    {saved ? '✓ Saved!' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {mode === 'past' && (
            <motion.div key="past" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header">
                <h1>📚 Past Entries</h1>
                <p>{entries.length} entries in your journal</p>
              </div>
              {entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📓</div>
                  <p style={{ color: '#a89ebb' }}>No entries yet. Start writing today!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {entries.map(e => (
                    <div key={e.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#a89ebb', fontWeight: 600 }}>{e.displayDate}</span>
                        <span style={{
                          background: e.type === 'guided' ? '#e8dffa' : '#fce4ec',
                          color: e.type === 'guided' ? '#7c6ab0' : '#c0607c',
                          fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: 50
                        }}>{e.type === 'guided' ? '🌿 Guided' : '✏️ Free'}</span>
                      </div>
                      {e.prompt && <p style={{ fontStyle: 'italic', color: '#a89ebb', fontSize: '0.82rem', marginBottom: 8 }}>"{e.prompt}"</p>}
                      <p style={{ color: '#5a5070', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {e.content.length > 200 ? e.content.slice(0, 200) + '...' : e.content}
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

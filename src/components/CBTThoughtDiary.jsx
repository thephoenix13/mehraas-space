import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

export default function CBTThoughtDiary() {
  const navigate = useNavigate()
  const [thought, setThought] = useState('')
  const [isFact, setIsFact] = useState(null)
  const [reframe, setReframe] = useState('')
  const [loading, setLoading] = useState(false)
  const [entries, setEntries] = useState(() => JSON.parse(localStorage.getItem('cbt_entries') || '[]'))
  const [view, setView] = useState('write') // write | result | past

  const handleReframe = async () => {
    if (!thought.trim()) return
    setLoading(true)
    try {
      const factContext = isFact === true ? 'The person believes this is a fact.' : isFact === false ? 'The person recognizes this may be a feeling, not a fact.' : ''
      const text = await callClaude(
        `Someone wrote this thought in their CBT diary: "${thought}". ${factContext}

Using warm, gentle CBT techniques, please:
1. Gently validate their experience first
2. Softly explore whether the thought might be a cognitive distortion (e.g., catastrophizing, all-or-nothing thinking, mind reading) — name it kindly
3. Offer a balanced, compassionate reframe in 2-3 sentences

Keep it warm and non-clinical. Never be harsh.`,
        null, 500
      )
      setReframe(text)
      setView('result')
    } catch {
      setReframe("Your thoughts and feelings make sense given what you're going through. Sometimes our minds can make things feel more absolute than they are. You deserve the same kindness you'd offer a good friend. 💜")
      setView('result')
    }
    setLoading(false)
  }

  const saveEntry = () => {
    const entry = {
      id: Date.now(),
      thought,
      reframe,
      isFact,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    const updated = [entry, ...entries]
    setEntries(updated)
    localStorage.setItem('cbt_entries', JSON.stringify(updated))
    setThought('')
    setReframe('')
    setIsFact(null)
    setView('write')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #e8dffa, #fce4ec, #f5f0ff)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <button onClick={() => setView(view === 'past' ? 'write' : 'past')} style={{
          padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
          background: 'rgba(255,255,255,0.7)', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>📋 {entries.length} entries</button>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">

          {view === 'write' && (
            <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>🧠 Thought Diary</h1>
                <p>Gently challenge the thoughts that feel too heavy</p>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#5a5070', marginBottom: 10, fontSize: '0.95rem' }}>
                  What thought is troubling you?
                </label>
                <textarea
                  value={thought}
                  onChange={e => setThought(e.target.value)}
                  placeholder="e.g. I always mess everything up. Nobody really likes me. Things will never get better..."
                  rows={5}
                  style={{ marginBottom: 20 }}
                  autoFocus
                />

                <label style={{ display: 'block', fontWeight: 700, color: '#5a5070', marginBottom: 12, fontSize: '0.95rem' }}>
                  Does this feel like a fact or a feeling?
                </label>
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  {[
                    { val: true, label: '📌 Feels like a fact', color: '#c9b8e8' },
                    { val: false, label: '💭 Feels like a feeling', color: '#f5c6d0' },
                    { val: null, label: '🤔 Not sure', color: '#b2c9b2' },
                  ].map(opt => (
                    <button key={String(opt.val)} onClick={() => setIsFact(opt.val)} style={{
                      flex: 1, padding: '10px 6px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: isFact === opt.val ? opt.color : 'rgba(240,235,248,0.5)',
                      color: isFact === opt.val ? '#4a4060' : '#a89ebb',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.75rem',
                      lineHeight: 1.3, transition: 'all 0.2s ease',
                      boxShadow: isFact === opt.val ? `0 4px 12px ${opt.color}80` : 'none'
                    }}>{opt.label}</button>
                  ))}
                </div>

                <button
                  onClick={handleReframe}
                  disabled={!thought.trim() || loading}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
                >
                  {loading ? 'Gently reframing...' : 'Reframe this Thought 💜'}
                </button>
                {loading && (
                  <div className="ai-loading" style={{ justifyContent: 'center', marginTop: 16 }}>
                    <div className="dots-loading"><span/><span/><span/></div>
                    <span>Finding a kinder perspective...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>💜 A Gentler Lens</h1>
              </div>

              <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #c9b8e8' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a89ebb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                  Your thought
                </div>
                <p style={{ color: '#5a5070', fontSize: '0.9rem', fontStyle: 'italic' }}>"{thought}"</p>
                {isFact !== null && (
                  <span style={{
                    display: 'inline-block', marginTop: 10,
                    background: isFact ? '#e8dffa' : '#fce4ec',
                    color: '#4a4060', fontSize: '0.72rem', fontWeight: 700,
                    padding: '4px 12px', borderRadius: 50
                  }}>
                    {isFact ? '📌 Felt like a fact' : '💭 Felt like a feeling'}
                  </span>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="card"
                style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f5f0ff, #fce4ec)' }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#b39ddb', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                  🧠 A compassionate reframe
                </div>
                <p style={{ color: '#4a4060', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{reframe}</p>
              </motion.div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveEntry} className="btn btn-primary" style={{ flex: 1 }}>Save Entry</button>
                <button onClick={() => setView('write')} className="btn btn-ghost" style={{ flex: 1 }}>Try Another</button>
              </div>
            </motion.div>
          )}

          {view === 'past' && (
            <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📋 Past Entries</h1>
                <p>Your journey of reframing</p>
              </div>
              <button onClick={() => setView('write')} className="btn btn-primary" style={{ width: '100%', marginBottom: 20 }}>
                + New Entry
              </button>
              {entries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: '#a89ebb' }}>No entries yet. Start reframing today.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {entries.map(e => (
                    <div key={e.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: '0.75rem', color: '#a89ebb', fontWeight: 600 }}>{e.date}</span>
                        {e.isFact !== null && (
                          <span style={{ fontSize: '0.72rem', color: '#b39ddb' }}>{e.isFact ? '📌 Fact' : '💭 Feeling'}</span>
                        )}
                      </div>
                      <p style={{ color: '#5a5070', fontSize: '0.85rem', fontStyle: 'italic', marginBottom: 10 }}>"{e.thought}"</p>
                      <p style={{ color: '#7a6e8a', fontSize: '0.82rem', lineHeight: 1.65, borderTop: '1px solid #f0ebf8', paddingTop: 10 }}>
                        {e.reframe.slice(0, 180)}{e.reframe.length > 180 ? '...' : ''}
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

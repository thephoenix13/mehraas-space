import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

export default function WorrySorter() {
  const navigate = useNavigate()
  const [worry, setWorry] = useState('')
  const [inControl, setInControl] = useState(null)
  const [reframe, setReframe] = useState('')
  const [loading, setLoading] = useState(false)
  const [worries, setWorries] = useState(() => JSON.parse(localStorage.getItem('sorted_worries') || '[]'))
  const [view, setView] = useState('write') // write | result | past

  const handleSort = async () => {
    if (!worry.trim()) return
    setLoading(true)
    try {
      const text = await callClaude(
        `Someone is feeling worried about: "${worry}". Please gently reframe this worry with kindness, compassion, and logic in 2-3 sentences. Acknowledge their feelings first, then offer a gentle perspective shift.`
      )
      setReframe(text)
      setView('result')
    } catch {
      setReframe("It makes sense that this is weighing on you. Worries often feel bigger than they are, especially when we're already carrying a lot. You've handled hard things before, and you can navigate this too. 💜")
      setView('result')
    }
    setLoading(false)
  }

  const saveWorry = () => {
    const entry = {
      id: Date.now(),
      worry,
      reframe,
      inControl,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    const updated = [entry, ...worries]
    setWorries(updated)
    localStorage.setItem('sorted_worries', JSON.stringify(updated))
    setWorry('')
    setReframe('')
    setInControl(null)
    setView('write')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #f5f0ff, #fff5f7)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <button onClick={() => setView(view === 'past' ? 'write' : 'past')} style={{
          padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.8rem',
          background: 'rgba(255,255,255,0.6)', color: '#7a6e8a'
        }}>📋 Past Worries</button>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'write' && (
            <motion.div key="write" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>💭 Worry Sorter</h1>
                <p>Let's gently untangle what's on your mind</p>
              </div>

              <div className="card" style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#5a5070', marginBottom: 10, fontSize: '0.95rem' }}>
                  What's worrying you?
                </label>
                <textarea
                  value={worry}
                  onChange={e => setWorry(e.target.value)}
                  placeholder="Write your worry here, no matter how big or small..."
                  rows={5}
                  style={{ marginBottom: 16 }}
                  autoFocus
                />

                <label style={{ display: 'block', fontWeight: 700, color: '#5a5070', marginBottom: 12, fontSize: '0.95rem' }}>
                  Is this in your control?
                </label>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                  {[
                    { val: true, label: '✅ Yes, I can act on it', color: '#b2c9b2' },
                    { val: false, label: '🌊 No, it\'s out of my hands', color: '#c9b8e8' },
                    { val: 'partial', label: '🌗 Partly', color: '#ffe0b2' }
                  ].map(opt => (
                    <button key={String(opt.val)} onClick={() => setInControl(opt.val)} style={{
                      flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      background: inControl === opt.val ? opt.color : 'rgba(240,235,248,0.5)',
                      color: inControl === opt.val ? '#4a4060' : '#a89ebb',
                      fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.75rem',
                      transition: 'all 0.2s ease', lineHeight: 1.3,
                      boxShadow: inControl === opt.val ? `0 4px 12px ${opt.color}60` : 'none'
                    }}>{opt.label}</button>
                  ))}
                </div>

                <button
                  onClick={handleSort}
                  disabled={!worry.trim() || loading}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
                >
                  {loading ? 'Gently sorting...' : 'Sort this Worry 💜'}
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
                <h1>💜 A Gentler View</h1>
              </div>

              <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #c9b8e8', background: 'rgba(201,184,232,0.1)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a89ebb', textTransform: 'uppercase', marginBottom: 8 }}>
                  Your worry
                </div>
                <p style={{ color: '#5a5070', fontSize: '0.9rem' }}>{worry}</p>
                {inControl !== null && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{
                      background: inControl === true ? '#d4e8d4' : inControl === false ? '#e8dffa' : '#fff0cc',
                      color: '#4a4060', fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50
                    }}>
                      {inControl === true ? '✅ In your control' : inControl === false ? '🌊 Out of your control' : '🌗 Partly in your control'}
                    </span>
                  </div>
                )}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
                style={{ marginBottom: 24, background: 'linear-gradient(135deg, #f5f0ff, #fce4ec)' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b39ddb', textTransform: 'uppercase', marginBottom: 12 }}>
                  ✨ A gentler perspective
                </div>
                <p style={{ color: '#4a4060', lineHeight: 1.8, fontSize: '0.95rem' }}>{reframe}</p>
              </motion.div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={saveWorry} className="btn btn-primary" style={{ flex: 1 }}>
                  Save & Done
                </button>
                <button onClick={() => setView('write')} className="btn btn-ghost" style={{ flex: 1 }}>
                  Try Another
                </button>
              </div>
            </motion.div>
          )}

          {view === 'past' && (
            <motion.div key="past" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📋 Past Worries</h1>
                <p>{worries.length} worries sorted</p>
              </div>
              <button onClick={() => setView('write')} className="btn btn-primary" style={{ marginBottom: 20, width: '100%' }}>
                + Sort a New Worry
              </button>
              {worries.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ color: '#a89ebb' }}>No worries sorted yet. You're doing great!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {worries.map(w => (
                    <div key={w.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'flex-start' }}>
                        <p style={{ color: '#5a5070', fontSize: '0.9rem', fontWeight: 600, flex: 1 }}>{w.worry}</p>
                        <span style={{ color: '#c0b8d0', fontSize: '0.75rem', marginLeft: 12, whiteSpace: 'nowrap' }}>{w.date}</span>
                      </div>
                      <p style={{ color: '#7a6e8a', fontSize: '0.82rem', lineHeight: 1.6, fontStyle: 'italic', borderTop: '1px solid #f0ebf8', paddingTop: 10 }}>
                        {w.reframe}
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

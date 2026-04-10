import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function GratitudeJar() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('gratitude_notes') || '[]'))
  const [text, setText] = useState('')
  const [view, setView] = useState('jar')
  const [picked, setPicked] = useState(null)
  const [falling, setFalling] = useState(null)

  const addNote = () => {
    if (!text.trim()) return
    const note = { id: Date.now(), text: text.trim(), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
    setFalling(note)
    setTimeout(() => {
      const updated = [note, ...notes]
      setNotes(updated)
      localStorage.setItem('gratitude_notes', JSON.stringify(updated))
      setFalling(null)
      setText('')
    }, 800)
  }

  const pickRandom = () => {
    if (notes.length === 0) return
    setPicked(notes[Math.floor(Math.random() * notes.length)])
    setView('picked')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--color-bg)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {['jar', 'all'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 50, border: '1px solid var(--color-card-border)', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem',
              background: view === v ? '#C0392B' : 'var(--color-card)', color: view === v ? '#fff' : 'var(--color-text-muted)',
              transition: 'all 0.2s ease',
            }}>{v === 'jar' ? '🫙 Jar' : '📋 All'}</button>
          ))}
        </div>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {(view === 'jar') && (
            <motion.div key="jar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>🙏 Gratitude Jar</h1><p>Little moments of thankfulness</p></div>

              <div className="card" style={{ marginBottom: 32 }}>
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder="I'm grateful for…" rows={3} style={{ marginBottom: 12 }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote() } }} />
                <button onClick={addNote} disabled={!text.trim()} className="btn btn-primary" style={{ width: '100%' }}>
                  Drop into Jar 🫙
                </button>
              </div>

              <AnimatePresence>
                {falling && (
                  <motion.div initial={{ y: -80, opacity: 1, rotate: -5 }} animate={{ y: 100, opacity: 0, rotate: 5 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: 'easeIn' }}
                    style={{
                      position: 'fixed', top: 200, left: '50%', transform: 'translateX(-50%)',
                      background: 'var(--color-card-warm)', border: '1px solid var(--color-card-border)', borderRadius: 12, padding: '12px 18px',
                      maxWidth: 240, textAlign: 'center', boxShadow: 'var(--shadow-card)',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', color: 'var(--color-text)', zIndex: 200, pointerEvents: 'none',
                    }}
                  >{falling.text}</motion.div>
                )}
              </AnimatePresence>

              {/* Jar visual */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                  display: 'inline-block', position: 'relative', width: 180, minHeight: 240,
                  background: 'var(--color-card)', backdropFilter: 'blur(8px)',
                  borderRadius: '16px 16px 28px 28px', border: '2px solid var(--color-card-border)',
                  boxShadow: 'var(--shadow-card)', padding: '16px 12px 20px', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: -16, left: -8, right: -8, height: 18, background: 'var(--color-bg-section)', borderRadius: 6, border: '1.5px solid var(--color-card-border)' }} />
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.73rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                    {notes.length} gratitude{notes.length !== 1 ? 's' : ''}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {notes.slice(0, 12).map((n, i) => (
                      <motion.div key={n.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{ width: 28, height: 18, borderRadius: 4, background: '#D4770A', opacity: 0.3 + (i % 3) * 0.2 }} />
                    ))}
                    {notes.length > 12 && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.63rem', color: 'var(--color-text-muted)', width: '100%', textAlign: 'center', marginTop: 4 }}>+{notes.length - 12} more</div>}
                  </div>
                </div>
              </div>

              {notes.length > 0 && (
                <button onClick={pickRandom} className="btn btn-secondary" style={{ width: '100%', fontSize: '1rem' }}>
                  ✨ Pick a Random Note
                </button>
              )}
            </motion.div>
          )}

          {view === 'all' && (
            <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>📋 All Gratitudes</h1><p>{notes.length} moments of thankfulness</p></div>
              {notes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🫙</div><p>Your jar is waiting to be filled!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notes.map((n, i) => (
                    <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      style={{ background: 'var(--color-card)', borderLeft: '4px solid #D4770A', borderRadius: 12, padding: '14px 18px', border: '1px solid var(--color-card-border)', borderLeftColor: '#D4770A' }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', fontSize: '0.92rem', lineHeight: 1.6 }}>{n.text}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.73rem', marginTop: 6 }}>{n.date}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'picked' && picked && (
            <motion.div key="picked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>✨ From your jar</h1><p>A little reminder from your past self</p></div>
              <motion.div animate={{ rotate: [-1, 1, -1] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderTop: '4px solid #D4770A', borderRadius: 20, padding: '40px 32px', textAlign: 'center', boxShadow: 'var(--shadow-hover)', marginBottom: 24 }}>
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>🙏</div>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.1rem', color: 'var(--color-text)', lineHeight: 1.7, fontWeight: 500 }}>{picked.text}</p>
                <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 16 }}>{picked.date}</p>
              </motion.div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={pickRandom} className="btn btn-primary" style={{ flex: 1 }}>Pick Another ✨</button>
                <button onClick={() => setView('jar')} className="btn btn-ghost" style={{ flex: 1 }}>Back to Jar</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

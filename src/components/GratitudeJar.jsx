import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const NOTE_COLORS = ['#f5c6d0', '#c9b8e8', '#b2c9b2', '#ffe0b2', '#b3e5fc', '#f8bbd0']

export default function GratitudeJar() {
  const navigate = useNavigate()
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('gratitude_notes') || '[]'))
  const [text, setText] = useState('')
  const [view, setView] = useState('jar') // jar | all | picked
  const [picked, setPicked] = useState(null)
  const [falling, setFalling] = useState(null)

  const addNote = () => {
    if (!text.trim()) return
    const note = {
      id: Date.now(),
      text: text.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)]
    }
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
    const random = notes[Math.floor(Math.random() * notes.length)]
    setPicked(random)
    setView('picked')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #fff0e6, #fce4ec, #f5f0ff)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {['jar', 'all'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.8rem',
              background: view === v ? 'rgba(245,198,208,0.8)' : 'rgba(255,255,255,0.6)',
              color: view === v ? 'white' : '#7a6e8a'
            }}>{v === 'jar' ? '🫙 Jar' : '📋 All'}</button>
          ))}
        </div>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {(view === 'jar') && (
            <motion.div key="jar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>🙏 Gratitude Jar</h1>
                <p>Little moments of thankfulness</p>
              </div>

              {/* Add note */}
              <div className="card" style={{ marginBottom: 32 }}>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="I'm grateful for..."
                  rows={3}
                  style={{ marginBottom: 12 }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); addNote() } }}
                />
                <button onClick={addNote} disabled={!text.trim()} className="btn btn-primary" style={{ width: '100%' }}>
                  Drop into Jar 🫙
                </button>
              </div>

              {/* Falling note animation */}
              <AnimatePresence>
                {falling && (
                  <motion.div
                    initial={{ y: -80, opacity: 1, rotate: -5 }}
                    animate={{ y: 100, opacity: 0, rotate: 5 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeIn' }}
                    style={{
                      position: 'fixed', top: 200, left: '50%', transform: 'translateX(-50%)',
                      background: falling.color, borderRadius: 12, padding: '12px 18px',
                      maxWidth: 240, textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                      fontSize: '0.85rem', color: '#4a4060', zIndex: 200, pointerEvents: 'none'
                    }}
                  >
                    {falling.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Jar Visualization */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{
                  display: 'inline-block', position: 'relative',
                  width: 180, minHeight: 240,
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px 20px 30px 30px',
                  border: '3px solid rgba(245,198,208,0.6)',
                  boxShadow: '0 8px 32px rgba(245,198,208,0.2)',
                  padding: '16px 12px 20px',
                  overflow: 'hidden'
                }}>
                  {/* Jar lid */}
                  <div style={{
                    position: 'absolute', top: -18, left: -8, right: -8,
                    height: 20, background: 'rgba(245,198,208,0.6)',
                    borderRadius: 8, border: '2px solid rgba(245,198,208,0.8)'
                  }} />
                  <div style={{ fontSize: '0.75rem', color: '#a89ebb', marginBottom: 8 }}>
                    {notes.length} gratitude{notes.length !== 1 ? 's' : ''}
                  </div>
                  {/* Notes in jar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
                    {notes.slice(0, 12).map((n, i) => (
                      <motion.div
                        key={n.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{
                          width: 28, height: 20, borderRadius: 4,
                          background: n.color, opacity: 0.85
                        }}
                      />
                    ))}
                    {notes.length > 12 && (
                      <div style={{ fontSize: '0.65rem', color: '#a89ebb', width: '100%', textAlign: 'center', marginTop: 4 }}>
                        +{notes.length - 12} more
                      </div>
                    )}
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
              <div className="page-header">
                <h1>📋 All Gratitudes</h1>
                <p>{notes.length} moments of thankfulness</p>
              </div>
              {notes.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🫙</div>
                  <p style={{ color: '#a89ebb' }}>Your jar is waiting to be filled!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notes.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: n.color + '40',
                        borderLeft: `4px solid ${n.color}`,
                        borderRadius: 12, padding: '14px 18px'
                      }}
                    >
                      <p style={{ color: '#4a4060', fontSize: '0.95rem', lineHeight: 1.6 }}>{n.text}</p>
                      <p style={{ color: '#a89ebb', fontSize: '0.75rem', marginTop: 6 }}>{n.date}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'picked' && picked && (
            <motion.div key="picked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>✨ From your jar</h1>
                <p>A little reminder from your past self</p>
              </div>
              <motion.div
                animate={{ rotate: [-1, 1, -1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: picked.color,
                  borderRadius: 24, padding: '40px 32px', textAlign: 'center',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', marginBottom: 24
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: 16 }}>🙏</div>
                <p style={{ fontSize: '1.2rem', color: '#4a4060', lineHeight: 1.7, fontWeight: 600 }}>
                  {picked.text}
                </p>
                <p style={{ color: '#7a6e8a', fontSize: '0.8rem', marginTop: 16 }}>{picked.date}</p>
              </motion.div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={pickRandom} className="btn btn-primary" style={{ flex: 1 }}>
                  Pick Another ✨
                </button>
                <button onClick={() => setView('jar')} className="btn btn-ghost" style={{ flex: 1 }}>
                  Back to Jar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

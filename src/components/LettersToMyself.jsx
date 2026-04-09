import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const formatDate = d => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const isOpenable = date => new Date() >= new Date(date)
const daysUntil = date => Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))

export default function LettersToMyself() {
  const navigate = useNavigate()
  const [letters, setLetters] = useState(() => JSON.parse(localStorage.getItem('letters_to_self') || '[]'))
  const [view, setView] = useState('list')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [saved, setSaved] = useState(false)

  const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] }

  const saveLetter = () => {
    if (!content.trim() || !openDate) return
    const letter = { id: Date.now(), title: title.trim() || 'A letter to myself', content: content.trim(), openDate, writtenDate: new Date().toISOString().split('T')[0], opened: false }
    const updated = [letter, ...letters]
    setLetters(updated)
    localStorage.setItem('letters_to_self', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => { setSaved(false); setView('list'); setTitle(''); setContent(''); setOpenDate('') }, 1500)
  }

  const openLetter = (letter) => {
    setSelectedLetter(letter)
    setRevealed(false)
    setView('read')
    if (!letter.opened && isOpenable(letter.openDate)) {
      const updated = letters.map(l => l.id === letter.id ? { ...l, opened: true } : l)
      setLetters(updated)
      localStorage.setItem('letters_to_self', JSON.stringify(updated))
    }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {view !== 'list' ? (
          <button onClick={() => setView('list')} className="back-btn">← Back</button>
        ) : (
          <button onClick={() => navigate('/')} className="back-btn">← Home</button>
        )}
        {view === 'list' && (
          <button onClick={() => setView('write')} className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            + Write Letter
          </button>
        )}
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>💌 Letters to Myself</h1><p>Words from your past self, waiting to be read</p></div>
              {letters.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>💌</div>
                  <p style={{ marginBottom: 20 }}>No letters yet. Write something kind to your future self.</p>
                  <button onClick={() => setView('write')} className="btn btn-primary">Write a Letter</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {letters.map(letter => {
                    const canOpen = isOpenable(letter.openDate)
                    const days = daysUntil(letter.openDate)
                    return (
                      <motion.div key={letter.id} whileHover={{ y: -2 }}
                        onClick={() => canOpen ? openLetter(letter) : null}
                        style={{
                          background: '#fff', borderRadius: 16, padding: '20px 22px',
                          boxShadow: '0 2px 12px rgba(180,120,60,0.07)',
                          cursor: canOpen ? 'pointer' : 'default',
                          borderLeft: `4px solid ${canOpen ? '#D4770A' : '#F0E6D0'}`,
                          border: '1px solid #F0E6D0', borderLeftColor: canOpen ? '#D4770A' : '#F0E6D0',
                          transition: 'all 0.25s ease',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: '1.2rem' }}>{canOpen ? '💌' : '🔒'}</span>
                              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C', fontSize: '0.93rem' }}>{letter.title}</span>
                            </div>
                            <div style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.76rem' }}>Written {formatDate(letter.writtenDate + 'T12:00:00')}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {canOpen ? (
                              <span style={{ background: '#FFF8F0', color: '#C0392B', border: '1px solid #F0D0C8', fontFamily: 'Inter, sans-serif', fontSize: '0.73rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>
                                {letter.opened ? '✓ Opened' : 'Open now ✨'}
                              </span>
                            ) : (
                              <span style={{ background: '#FAF3E0', color: '#D4770A', border: '1px solid #F0E6D0', fontFamily: 'Inter, sans-serif', fontSize: '0.73rem', fontWeight: 700, padding: '4px 12px', borderRadius: 50 }}>
                                {days} day{days !== 1 ? 's' : ''} left
                              </span>
                            )}
                          </div>
                        </div>
                        {canOpen && <div style={{ marginTop: 10, fontFamily: 'Inter, sans-serif', color: '#D4770A', fontSize: '0.76rem' }}>Ready to open — tap to read ↗</div>}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {view === 'write' && (
            <motion.div key="write" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header"><h1>✍️ Write a Letter</h1><p>What do you want your future self to know?</p></div>
              <div className="card">
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#2C2C2C', marginBottom: 6, fontSize: '0.85rem' }}>Letter title (optional)</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. For when you're doubting yourself" />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#2C2C2C', marginBottom: 6, fontSize: '0.85rem' }}>Your letter</label>
                  <textarea value={content} onChange={e => setContent(e.target.value)} placeholder={"Dear future me,\n\nI want you to know…"} rows={12} style={{ fontSize: '0.95rem', lineHeight: 1.8 }} />
                </div>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#2C2C2C', marginBottom: 6, fontSize: '0.85rem' }}>🔒 Open this letter on…</label>
                  <input type="date" value={openDate} onChange={e => setOpenDate(e.target.value)} min={tomorrow()} />
                </div>
                <button onClick={saveLetter} disabled={!content.trim() || !openDate} className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }}>
                  {saved ? '✓ Letter Sealed 💌' : 'Seal & Send to Future Me'}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'read' && selectedLetter && (
            <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>💌 {selectedLetter.title}</h1><p>Written {formatDate(selectedLetter.writtenDate + 'T12:00:00')}</p></div>
              {!revealed ? (
                <div style={{ textAlign: 'center' }}>
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '5rem', marginBottom: 24 }}>💌</motion.div>
                  <p style={{ marginBottom: 28 }}>A letter from your past self is waiting for you.</p>
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                    onClick={() => setRevealed(true)} className="btn btn-primary" style={{ fontSize: '1.05rem', padding: '16px 40px' }}>
                    Open Letter ✨
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 22 }}>
                  <div style={{
                    background: '#fff', borderRadius: 20, padding: '36px 28px',
                    boxShadow: '0 8px 32px rgba(180,120,60,0.1)', border: '1px solid #F0E6D0',
                    borderTop: '3px solid #D4770A',
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #F0E6D0 31px, #F0E6D0 32px)',
                    lineHeight: '32px',
                  }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#2C2C2C', fontSize: '0.97rem', lineHeight: 2, whiteSpace: 'pre-wrap' }}>{selectedLetter.content}</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", color: '#7A6A5A', marginTop: 20, fontStyle: 'italic', lineHeight: 1.4 }}>— Past you, with love</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

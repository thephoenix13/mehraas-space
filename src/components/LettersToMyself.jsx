import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const formatDate = d => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
const isOpenable = date => new Date() >= new Date(date)
const daysUntil = date => {
  const diff = new Date(date) - new Date()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function LettersToMyself() {
  const navigate = useNavigate()
  const [letters, setLetters] = useState(() => JSON.parse(localStorage.getItem('letters_to_self') || '[]'))
  const [view, setView] = useState('list') // list | write | read
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [openDate, setOpenDate] = useState('')
  const [selectedLetter, setSelectedLetter] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [saved, setSaved] = useState(false)

  const tomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().split('T')[0]
  }

  const saveLetter = () => {
    if (!content.trim() || !openDate) return
    const letter = {
      id: Date.now(),
      title: title.trim() || 'A letter to myself',
      content: content.trim(),
      openDate,
      writtenDate: new Date().toISOString().split('T')[0],
      opened: false
    }
    const updated = [letter, ...letters]
    setLetters(updated)
    localStorage.setItem('letters_to_self', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setView('list')
      setTitle('')
      setContent('')
      setOpenDate('')
    }, 1500)
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
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #fce4ec, #f5f0ff, #fff9e6)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {view !== 'list' ? (
          <button onClick={() => setView('list')} style={{
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
              <div className="page-header">
                <h1>💌 Letters to Myself</h1>
                <p>Words from your past self, waiting to be read</p>
              </div>

              {letters.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 16 }}>💌</div>
                  <p style={{ color: '#a89ebb', marginBottom: 20 }}>No letters yet. Write something kind to your future self.</p>
                  <button onClick={() => setView('write')} className="btn btn-primary">Write a Letter</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {letters.map(letter => {
                    const canOpen = isOpenable(letter.openDate)
                    const days = daysUntil(letter.openDate)
                    return (
                      <motion.div
                        key={letter.id}
                        whileHover={{ y: -2 }}
                        onClick={() => canOpen ? openLetter(letter) : null}
                        style={{
                          background: 'white', borderRadius: 20, padding: '20px 22px',
                          boxShadow: '0 4px 16px rgba(180,150,200,0.1)',
                          cursor: canOpen ? 'pointer' : 'default',
                          borderLeft: `4px solid ${canOpen ? '#f5c6d0' : '#e0d8f0'}`,
                          transition: 'all 0.25s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                              <span style={{ fontSize: '1.2rem' }}>{canOpen ? '💌' : '🔒'}</span>
                              <span style={{ fontWeight: 700, color: '#4a4060', fontSize: '0.95rem' }}>{letter.title}</span>
                            </div>
                            <div style={{ color: '#a89ebb', fontSize: '0.78rem' }}>
                              Written {formatDate(letter.writtenDate + 'T12:00:00')}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            {canOpen ? (
                              <span style={{
                                background: '#fce4ec', color: '#c06080', fontSize: '0.75rem',
                                fontWeight: 700, padding: '4px 12px', borderRadius: 50
                              }}>
                                {letter.opened ? '✓ Opened' : 'Open now ✨'}
                              </span>
                            ) : (
                              <span style={{
                                background: '#e8dffa', color: '#7c6ab0', fontSize: '0.75rem',
                                fontWeight: 700, padding: '4px 12px', borderRadius: 50
                              }}>
                                {days} day{days !== 1 ? 's' : ''} left
                              </span>
                            )}
                          </div>
                        </div>
                        {canOpen && (
                          <div style={{ marginTop: 10, color: '#b0a0c8', fontSize: '0.78rem' }}>
                            Ready to open — click to read ↗
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.div>
          )}

          {view === 'write' && (
            <motion.div key="write" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="page-header">
                <h1>✍️ Write a Letter</h1>
                <p>What do you want your future self to know?</p>
              </div>
              <div className="card">
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#5a5070', marginBottom: 6, fontSize: '0.85rem' }}>
                    Letter title (optional)
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. For when you're doubting yourself"
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#5a5070', marginBottom: 6, fontSize: '0.85rem' }}>
                    Your letter
                  </label>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder="Dear future me,&#10;&#10;I want you to know..."
                    rows={12}
                    style={{ fontFamily: 'Nunito, sans-serif', fontSize: '0.95rem', lineHeight: 1.8 }}
                  />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#5a5070', marginBottom: 6, fontSize: '0.85rem' }}>
                    🔒 Open this letter on...
                  </label>
                  <input
                    type="date"
                    value={openDate}
                    onChange={e => setOpenDate(e.target.value)}
                    min={tomorrow()}
                  />
                </div>
                <button
                  onClick={saveLetter}
                  disabled={!content.trim() || !openDate}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
                >
                  {saved ? '✓ Letter Sealed 💌' : 'Seal & Send to Future Me'}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'read' && selectedLetter && (
            <motion.div key="read" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>💌 {selectedLetter.title}</h1>
                <p>Written {formatDate(selectedLetter.writtenDate + 'T12:00:00')}</p>
              </div>

              {!revealed ? (
                <div style={{ textAlign: 'center' }}>
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ fontSize: '5rem', marginBottom: 24 }}
                  >
                    💌
                  </motion.div>
                  <p style={{ color: '#7a6e8a', marginBottom: 28 }}>
                    A letter from your past self is waiting for you.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setRevealed(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '1.1rem', padding: '16px 40px' }}
                  >
                    Open Letter ✨
                  </motion.button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <div style={{
                    background: 'white',
                    borderRadius: 24, padding: '32px 28px',
                    boxShadow: '0 12px 40px rgba(180,150,200,0.15)',
                    fontFamily: 'Nunito, sans-serif',
                    backgroundImage: 'repeating-linear-gradient(transparent, transparent 30px, #f0ebf8 30px, #f0ebf8 31px)',
                    lineHeight: '31px'
                  }}>
                    <p style={{ color: '#4a4060', fontSize: '1rem', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                      {selectedLetter.content}
                    </p>
                    <p style={{ color: '#a89ebb', marginTop: 20, fontStyle: 'italic', lineHeight: 1.4 }}>
                      — Past you, with love 💜
                    </p>
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

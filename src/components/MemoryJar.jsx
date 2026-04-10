import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const EMOJIS = ['🌸', '☀️', '🌈', '🎉', '💛', '🌻', '⭐', '🍀', '🌊', '🎵', '🦋', '🌙', '🍎', '🌺', '✨']
const BUBBLE_BORDERS = ['#D4770A', '#E8A020', '#C0392B', '#D4770A', '#A93226', '#D4770A', '#C0392B', '#E8A020']

export default function MemoryJar() {
  const navigate = useNavigate()
  const [memories, setMemories] = useState(() => JSON.parse(localStorage.getItem('memory_jar') || '[]'))
  const [view, setView] = useState('jar')
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')
  const [emoji, setEmoji] = useState('🌸')
  const [shaken, setShaken] = useState(null)
  const [reflection, setReflection] = useState('')
  const [reflLoading, setReflLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [saved, setSaved] = useState(false)

  const bubbles = useMemo(() => memories.slice(0, 20).map((m, i) => ({
    x: 10 + (i % 5) * 18 + Math.sin(i) * 4,
    y: 10 + Math.floor(i / 5) * 22 + Math.cos(i) * 3,
    size: 40 + Math.random() * 20,
    color: BUBBLE_BORDERS[i % BUBBLE_BORDERS.length],
    delay: i * 0.15
  })), [memories.length])

  const saveMemory = () => {
    if (!title.trim()) return
    const m = {
      id: Date.now(),
      title: title.trim(),
      desc: desc.trim(),
      date: date || new Date().toISOString().split('T')[0],
      emoji,
      color: BUBBLE_BORDERS[memories.length % BUBBLE_BORDERS.length]
    }
    const updated = [m, ...memories]
    setMemories(updated)
    localStorage.setItem('memory_jar', JSON.stringify(updated))
    setSaved(true)
    setTimeout(() => { setSaved(false); setView('jar'); setTitle(''); setDesc(''); setDate(''); setEmoji('🌸') }, 1200)
  }

  const shake = async (mem) => {
    setShaken(mem)
    setReflection('')
    setView('shake')
    setReflLoading(true)
    try {
      const text = await callClaude(
        `Someone is revisiting a happy memory: "${mem.title}". ${mem.desc ? `Details: ${mem.desc}` : ''} Give them a warm, brief reflection (2 sentences) that helps them sit with this beautiful moment.`,
        null, 250
      )
      setReflection(text)
    } catch {
      setReflection("What a beautiful memory to carry with you. Let it remind you that life holds moments of real warmth, and more are coming.")
    }
    setReflLoading(false)
  }

  const filtered = search.trim()
    ? memories.filter(m => m.title.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase()))
    : memories

  const formatDate = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--color-bg)' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => view !== 'jar' ? setView('jar') : navigate('/')} className="back-btn">
          ← {view !== 'jar' ? 'Back' : 'Home'}
        </button>
        {view === 'jar' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('search')} className="back-btn">🔍 Search</button>
            <button onClick={() => setView('add')} className="back-btn">+ Add</button>
          </div>
        )}
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">

          {view === 'jar' && (
            <motion.div key="jar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📸 Memory Jar</h1>
                <p>A collection of moments that made your heart warm</p>
              </div>

              {/* The jar */}
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <svg width="220" height="280" viewBox="0 0 220 280">
                    <defs>
                      <linearGradient id="jarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: 'var(--color-jar-body-start)' }} />
                        <stop offset="100%" style={{ stopColor: 'var(--color-jar-body-end)' }} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                      </filter>
                    </defs>
                    {/* Lid */}
                    <rect x="55" y="8" width="110" height="28" rx="8" fill="rgba(212,119,10,0.4)" stroke="rgba(212,119,10,0.6)" strokeWidth="2"/>
                    <rect x="65" y="24" width="90" height="12" rx="4" fill="rgba(212,119,10,0.25)"/>
                    {/* Jar body */}
                    <path d="M40 48 Q30 48 30 65 L30 240 Q30 260 55 260 L165 260 Q190 260 190 240 L190 65 Q190 48 180 48 Z" fill="url(#jarGrad)" stroke="rgba(212,119,10,0.3)" strokeWidth="2"/>
                    {/* Glass shine */}
                    <path d="M50 60 L50 240" stroke="rgba(255,255,255,0.4)" strokeWidth="8" strokeLinecap="round"/>
                    {/* Memory bubbles */}
                    {bubbles.map((b, i) => (
                      <motion.g key={i}
                        animate={{ y: [0, -4, 0], x: [0, 2, 0] }}
                        transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: b.delay }}
                      >
                        <circle
                          cx={b.x + 50}
                          cy={b.y + 90}
                          r={b.size / 4}
                          fill={b.color + '40'}
                          stroke={b.color}
                          strokeWidth="1"
                          opacity="0.85"
                          filter="url(#glow)"
                        />
                        <text
                          x={b.x + 50}
                          y={b.y + 95}
                          textAnchor="middle"
                          fontSize="11"
                        >{memories[i]?.emoji || '✨'}</text>
                      </motion.g>
                    ))}
                    {memories.length === 0 && (
                      <text x="110" y="170" textAnchor="middle" fill="rgba(122,106,90,0.6)" fontSize="12" fontFamily="Inter">
                        Add your first memory
                      </text>
                    )}
                    {memories.length > 0 && (
                      <text x="110" y="252" textAnchor="middle" fill="rgba(122,106,90,0.8)" fontSize="11" fontFamily="Inter" fontWeight="bold">
                        {memories.length} {memories.length === 1 ? 'memory' : 'memories'}
                      </text>
                    )}
                  </svg>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                <button onClick={() => setView('add')} className="btn btn-primary" style={{ flex: 1 }}>
                  + Add Memory
                </button>
                {memories.length > 0 && (
                  <button onClick={() => shake(memories[Math.floor(Math.random() * memories.length)])} className="btn btn-ghost" style={{ flex: 1 }}>
                    🫙 Shake the Jar
                  </button>
                )}
              </div>

              {/* Recent memories */}
              {memories.length > 0 && (
                <>
                  <h3 style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                    Recent memories
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {memories.slice(0, 4).map((m, i) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        onClick={() => shake(m)}
                        style={{
                          background: 'var(--color-card)',
                          border: '1px solid var(--color-card-border)',
                          borderLeft: `4px solid ${m.color || '#D4770A'}`,
                          borderRadius: 16,
                          padding: '14px 18px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 12,
                          boxShadow: 'var(--shadow-card)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.88rem', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                          {m.date && <div style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.72rem' }}>{formatDate(m.date)}</div>}
                        </div>
                        <span style={{ fontFamily: 'Inter, sans-serif', color: '#D4770A', fontSize: '0.8rem' }}>→</span>
                      </motion.div>
                    ))}
                    {memories.length > 4 && (
                      <button onClick={() => setView('search')} style={{
                        background: 'none', border: 'none', color: '#D4770A', cursor: 'pointer',
                        textDecoration: 'underline', fontSize: '0.82rem', fontFamily: 'Inter, sans-serif',
                        textAlign: 'center', padding: 8
                      }}>View all {memories.length} memories →</button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

          {view === 'add' && (
            <motion.div key="add" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📸 Add a Memory</h1>
                <p>Capture a moment worth keeping</p>
              </div>

              <div className="card">
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, fontSize: '0.9rem' }}>Choose an emoji</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => setEmoji(e)} style={{
                        width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
                        fontSize: '1.3rem', background: emoji === e ? 'var(--color-card-warm)' : 'var(--color-bg-section)',
                        boxShadow: emoji === e ? '0 0 0 3px #D4770A' : 'none',
                        transition: 'all 0.15s ease'
                      }}>{e}</button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, fontSize: '0.9rem' }}>Memory title *</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Laughing with Mama on the balcony" autoFocus />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, fontSize: '0.9rem' }}>What made it special? (optional)</label>
                  <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Share the details that make this moment sparkle..." rows={3} />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', marginBottom: 8, fontSize: '0.9rem' }}>When was this? (optional)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>

                <button onClick={saveMemory} disabled={!title.trim()} className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }}>
                  {saved ? '✓ Memory added to jar! 📸' : 'Add to Memory Jar 📸'}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'shake' && shaken && (
            <motion.div key="shake" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}>
              <div className="page-header">
                <h1>✨ A Memory Surfaced</h1>
              </div>

              <motion.div
                animate={{ y: [0, -8, 0], rotate: [-1, 1, -1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  background: 'var(--color-card-warm)',
                  border: '1px solid var(--color-card-border)',
                  borderTop: `4px solid ${shaken.color || '#D4770A'}`,
                  borderRadius: 28, padding: '40px 32px', marginBottom: 24,
                  boxShadow: 'var(--shadow-hover)'
                }}
              >
                <div style={{ fontSize: '3.5rem', marginBottom: 16 }}>{shaken.emoji}</div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--color-text)', fontSize: '1.3rem', marginBottom: 10 }}>{shaken.title}</h2>
                {shaken.desc && <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: 14 }}>{shaken.desc}</p>}
                {shaken.date && <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{formatDate(shaken.date)}</p>}
              </motion.div>

              {reflLoading ? (
                <div className="ai-loading" style={{ justifyContent: 'center', marginBottom: 20 }}>
                  <div className="dots-loading"><span/><span/><span/></div>
                  <span>Reflecting on this memory...</span>
                </div>
              ) : reflection && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ marginBottom: 20, borderLeft: '4px solid #D4770A', textAlign: 'left' }}
                >
                  <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', fontStyle: 'italic', lineHeight: 1.75 }}>{reflection}</p>
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={() => shake(memories[Math.floor(Math.random() * memories.length)])} className="btn btn-primary">
                  🫙 Shake Again
                </button>
                <button onClick={() => setView('jar')} className="btn btn-ghost">Back to Jar</button>
              </div>
            </motion.div>
          )}

          {view === 'search' && (
            <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>🔍 All Memories</h1>
                <p>{memories.length} moments collected</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your memories..." />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => shake(m)}
                    style={{
                      background: 'var(--color-card)', border: '1px solid var(--color-card-border)',
                      borderLeft: `4px solid ${m.color || '#D4770A'}`,
                      borderRadius: 16,
                      padding: '14px 18px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12,
                      boxShadow: 'var(--shadow-card)',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{m.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: 'var(--color-text)', fontSize: '0.9rem' }}>{m.title}</div>
                      {m.desc && <div style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 2 }}>{m.desc.slice(0, 60)}{m.desc.length > 60 ? '...' : ''}</div>}
                      {m.date && <div style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)', fontSize: '0.72rem', marginTop: 2 }}>{formatDate(m.date)}</div>}
                    </div>
                  </motion.div>
                ))}
                {filtered.length === 0 && (
                  <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)' }}>{search ? 'No memories match your search.' : 'No memories yet. Add your first one!'}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

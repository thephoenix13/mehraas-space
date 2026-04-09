import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

function Confetti({ active }) {
  const colors = ['#c9b8e8', '#f5c6d0', '#b2c9b2', '#ffe082', '#81d4fa', '#ffb74d']
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 1.2 + Math.random() * 0.8,
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }))
  if (!active) return null
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 200, overflow: 'hidden' }}>
      {pieces.map(p => (
        <motion.div
          key={p.id}
          initial={{ x: `${p.x}vw`, y: -20, rotate: p.rotate, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rotate + 360, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute', width: p.size, height: p.size,
            background: p.color, borderRadius: p.size > 10 ? '50%' : 2,
          }}
        />
      ))}
    </div>
  )
}

export default function SmallWins() {
  const navigate = useNavigate()
  const [win, setWin] = useState('')
  const [celebration, setCelebration] = useState('')
  const [loading, setLoading] = useState(false)
  const [wins, setWins] = useState(() => JSON.parse(localStorage.getItem('small_wins') || '[]'))
  const [confetti, setConfetti] = useState(false)
  const [picked, setPicked] = useState(null)
  const [view, setView] = useState('log') // log | response | timeline | picked

  const handleSave = async () => {
    if (!win.trim()) return
    setLoading(true)
    try {
      const text = await callClaude(
        `Someone just accomplished something and wants to celebrate it as a small win: "${win}". Please respond with a warm, genuine, enthusiastic celebration message (2-3 sentences). Make them feel truly seen and proud. Don't be over-the-top, but be sincerely warm.`
      )
      setCelebration(text)
    } catch {
      setCelebration("That is genuinely wonderful — every small step forward matters more than you know. You showed up for yourself today, and that is something to be really proud of. 🎉")
    }

    const entry = {
      id: Date.now(),
      win: win.trim(),
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      timestamp: Date.now()
    }
    const updated = [entry, ...wins]
    setWins(updated)
    localStorage.setItem('small_wins', JSON.stringify(updated))
    setLoading(false)
    setConfetti(true)
    setTimeout(() => setConfetti(false), 2500)
    setView('response')
  }

  const pickRandom = () => {
    if (wins.length === 0) return
    setPicked(wins[Math.floor(Math.random() * wins.length)])
    setView('picked')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #fffde7, #fce4ec, #f5f0ff)' }}>
      <Confetti active={confetti} />

      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {['log', 'timeline'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 50, border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.8rem',
              background: view === v ? 'rgba(255,224,130,0.7)' : 'rgba(255,255,255,0.6)',
              color: view === v ? '#5a4e00' : '#7a6e8a'
            }}>{v === 'log' ? '🏆 Log' : '📜 Timeline'}</button>
          ))}
        </div>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'log' && (
            <motion.div key="log" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>🏆 Small Wins</h1>
                <p>Every tiny victory deserves to be celebrated</p>
              </div>

              <div className="card" style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#5a5070', marginBottom: 10 }}>
                  What's your win today?
                </label>
                <textarea
                  value={win}
                  onChange={e => setWin(e.target.value)}
                  placeholder="Got out of bed. Replied to a text. Drank a glass of water. Made myself a meal. Anything counts 🌸"
                  rows={4}
                  style={{ marginBottom: 16 }}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleSave() }}
                />
                <button
                  onClick={handleSave}
                  disabled={!win.trim() || loading}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '1rem', padding: '14px', background: 'linear-gradient(135deg, #ffe082, #ffb300)' }}
                >
                  {loading ? 'Celebrating...' : '🎉 Celebrate this Win!'}
                </button>
              </div>

              {wins.length > 0 && (
                <button onClick={pickRandom} className="btn btn-ghost" style={{ width: '100%' }}>
                  ✨ Pick a random past win
                </button>
              )}
            </motion.div>
          )}

          {view === 'response' && (
            <motion.div key="response" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>🎉 Yay, you!</h1>
              </div>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ textAlign: 'center', fontSize: '4rem', marginBottom: 20 }}
              >🏆</motion.div>

              <div className="card" style={{ marginBottom: 16, background: 'linear-gradient(135deg, #fffde7, #fff8e1)', textAlign: 'center' }}>
                <p style={{ fontWeight: 700, color: '#4a4060', fontSize: '1rem', marginBottom: 4 }}>Your win:</p>
                <p style={{ color: '#7a6e8a', fontStyle: 'italic', marginBottom: 20 }}>"{wins[0]?.win}"</p>
                <p style={{ color: '#5a5070', lineHeight: 1.75 }}>{celebration}</p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setWin(''); setView('log') }} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ffe082, #ffb300)' }}>
                  Log Another Win
                </button>
                <button onClick={() => setView('timeline')} className="btn btn-ghost" style={{ flex: 1 }}>
                  View All Wins
                </button>
              </div>
            </motion.div>
          )}

          {view === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>📜 Your Wins</h1>
                <p>{wins.length} victories and counting</p>
              </div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button onClick={() => setView('log')} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ffe082, #ffb300)' }}>
                  + Add a Win
                </button>
                {wins.length > 0 && (
                  <button onClick={pickRandom} className="btn btn-ghost" style={{ flex: 1 }}>
                    ✨ Random
                  </button>
                )}
              </div>
              {wins.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🏆</div>
                  <p style={{ color: '#a89ebb' }}>Your wins timeline is waiting to be filled!</p>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 20, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #ffe082, #fce4ec)', borderRadius: 2 }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 48 }}>
                    {wins.map((w, i) => (
                      <motion.div
                        key={w.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        style={{ position: 'relative' }}
                      >
                        <div style={{
                          position: 'absolute', left: -36, top: 14, width: 12, height: 12,
                          borderRadius: '50%', background: '#ffe082',
                          border: '3px solid white', boxShadow: '0 0 0 2px #ffe082'
                        }} />
                        <div className="card" style={{ padding: '14px 18px' }}>
                          <p style={{ color: '#4a4060', fontWeight: 600, marginBottom: 4 }}>{w.win}</p>
                          <p style={{ color: '#c0b8d0', fontSize: '0.75rem' }}>{w.date}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'picked' && picked && (
            <motion.div key="picked" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>✨ Remember this?</h1>
                <p>A win from your past self</p>
              </div>
              <motion.div
                animate={{ rotate: [-1, 1, -1] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(135deg, #fffde7, #fff8e1)',
                  borderRadius: 24, padding: '40px 32px', textAlign: 'center',
                  boxShadow: '0 12px 40px rgba(255,224,130,0.3)', marginBottom: 24
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🏆</div>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: '#4a4060', lineHeight: 1.7 }}>{picked.win}</p>
                <p style={{ color: '#a89ebb', fontSize: '0.8rem', marginTop: 12 }}>{picked.date}</p>
              </motion.div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={pickRandom} className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ffe082, #ffb300)' }}>
                  Another ✨
                </button>
                <button onClick={() => setView('log')} className="btn btn-ghost" style={{ flex: 1 }}>Back</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const MOODS = [
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#c9b8e8', bg: 'linear-gradient(135deg, #e8dffa, #d4e8d4)' },
  { id: 'sad', emoji: '😔', label: 'Sad', color: '#b3e5fc', bg: 'linear-gradient(135deg, #e1f5fe, #e8dffa)' },
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', color: '#f5c6d0', bg: 'linear-gradient(135deg, #fce4ec, #ffe0b2)' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: '#b2c9b2', bg: 'linear-gradient(135deg, #d4e8d4, #f5f0ff)' },
  { id: 'okay', emoji: '🙂', label: 'Okay', color: '#ffe082', bg: 'linear-gradient(135deg, #fffde7, #d4e8d4)' },
]

export default function GuidedMeditation() {
  const navigate = useNavigate()
  const [mood, setMood] = useState(null)
  const [script, setScript] = useState([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('pick') // pick | loading | session | done | favorites
  const [currentLine, setCurrentLine] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('meditation_favorites') || '[]'))
  const [isFav, setIsFav] = useState(false)
  const timerRef = useRef(null)

  const generateMeditation = async (selectedMood) => {
    setMood(selectedMood)
    setView('loading')
    setLoading(true)
    try {
      const m = MOODS.find(m => m.id === selectedMood)
      const text = await callClaude(
        `Write a short guided meditation for someone feeling ${m.label.toLowerCase()} right now.

Structure it as exactly 8 gentle, short paragraphs — each one a separate step in the meditation. Start with grounding and breathing, move through the body, address the specific feeling with compassion, and close with peace and safety.

Each paragraph should be 2-3 sentences. Number each one 1. through 8. One per line.`,
        null, 800
      )
      const lines = text.split('\n')
        .map(l => l.replace(/^\d+\.\s*/, '').trim())
        .filter(Boolean)
        .slice(0, 8)
      setScript(lines.length >= 4 ? lines : [
        `Find a comfortable position and gently close your eyes. Take a slow breath in, and let it out softly.`,
        `Notice where you are right now — the weight of your body, the surface beneath you. You are safe in this moment.`,
        `Breathe in for four counts... hold for a moment... and release slowly. Let each breath soften something inside.`,
        `You don't have to fix anything right now. You only need to breathe.`,
        `If thoughts arise, simply notice them — like clouds passing across a wide, peaceful sky.`,
        `Bring your awareness gently back to your breath. You are here. You are okay.`,
        `Feel the steady rhythm of your own heartbeat. This heart has carried you through every hard day.`,
        `When you are ready, gently open your eyes. You are exactly where you need to be. 💜`,
      ])
    } catch {
      setScript([
        `Find a comfortable position and gently close your eyes.`,
        `Take a slow breath in, and let it out softly. Notice where you are.`,
        `You are safe in this moment. Nothing needs to be solved right now.`,
        `Breathe in... and release. Let each breath soften something inside you.`,
        `If thoughts arise, simply let them pass, like clouds drifting by.`,
        `Bring your awareness gently back to your breath, again and again.`,
        `Feel your heart beating — it has carried you through every hard moment.`,
        `When you're ready, gently return. You are enough, exactly as you are. 💜`,
      ])
    }
    setLoading(false)
    setCurrentLine(0)
    setElapsed(0)
    setView('session')
  }

  useEffect(() => {
    if (view === 'session') {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
      return () => clearInterval(timerRef.current)
    }
  }, [view])

  const next = () => {
    if (currentLine < script.length - 1) {
      setCurrentLine(c => c + 1)
    } else {
      clearInterval(timerRef.current)
      setView('done')
    }
  }

  const prev = () => { if (currentLine > 0) setCurrentLine(c => c - 1) }

  const saveFavorite = () => {
    const entry = {
      id: Date.now(),
      mood,
      moodLabel: MOODS.find(m => m.id === mood)?.label,
      script,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    const updated = [entry, ...favorites]
    setFavorites(updated)
    localStorage.setItem('meditation_favorites', JSON.stringify(updated))
    setIsFav(true)
  }

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  const selectedMoodData = MOODS.find(m => m.id === mood)

  // Floating orbs background
  const orbs = [
    { size: 200, x: -60, y: -40, color: selectedMoodData?.color || '#c9b8e8', dur: 8 },
    { size: 150, x: '70%', y: 60, color: '#fce4ec', dur: 10 },
    { size: 100, x: '40%', y: '50%', color: selectedMoodData?.color || '#d4e8d4', dur: 12 },
  ]

  return (
    <div style={{
      minHeight: '100vh', paddingBottom: 80,
      background: selectedMoodData?.bg || 'linear-gradient(160deg, #f5f0ff, #fce4ec)',
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Floating orbs */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          style={{
            position: 'fixed', left: orb.x, top: orb.y,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}60, transparent)`,
            pointerEvents: 'none', zIndex: 0
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => { navigate('/'); clearInterval(timerRef.current) }} style={{
            background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
            padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
          }}>← Home</button>
          <button onClick={() => setView(view === 'favorites' ? 'pick' : 'favorites')} style={{
            padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.7)', color: '#7a6e8a',
            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
          }}>💛 Saved ({favorites.length})</button>
        </div>

        <div className="page-container">
          <AnimatePresence mode="wait">
            {view === 'pick' && (
              <motion.div key="pick" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="page-header">
                  <h1>🧘 Guided Meditation</h1>
                  <p>How are you feeling right now?</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {MOODS.map(m => (
                    <motion.button
                      key={m.id}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => generateMeditation(m.id)}
                      style={{
                        background: 'white', border: 'none', borderRadius: 20,
                        padding: '18px 22px', cursor: 'pointer', textAlign: 'left',
                        boxShadow: '0 4px 16px rgba(180,150,200,0.1)',
                        display: 'flex', alignItems: 'center', gap: 16
                      }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: m.color + '40', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0
                      }}>{m.emoji}</div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#4a4060', marginBottom: 3 }}>I feel {m.label}</div>
                        <div style={{ color: '#a89ebb', fontSize: '0.8rem' }}>3-5 min meditation for this feeling</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center', paddingTop: 80 }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{ fontSize: '4rem', marginBottom: 24 }}
                >🧘</motion.div>
                <p style={{ color: '#7a6e8a', marginBottom: 16 }}>Preparing your meditation...</p>
                <div className="ai-loading" style={{ justifyContent: 'center' }}>
                  <div className="dots-loading"><span/><span/><span/></div>
                </div>
              </motion.div>
            )}

            {view === 'session' && script.length > 0 && (
              <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}>
                <div style={{ color: '#a89ebb', fontSize: '0.8rem', marginBottom: 8 }}>
                  {selectedMoodData?.emoji} Meditation for {selectedMoodData?.label} · {fmt(elapsed)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 36 }}>
                  {script.map((_, i) => (
                    <div key={i} style={{
                      height: 4, width: i <= currentLine ? 24 : 8, borderRadius: 50,
                      background: i <= currentLine ? selectedMoodData?.color : '#e0d8f0',
                      transition: 'all 0.4s ease'
                    }} />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentLine}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)',
                      borderRadius: 24, padding: '36px 28px', marginBottom: 36,
                      boxShadow: '0 8px 32px rgba(180,150,200,0.12)', minHeight: 160,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <p style={{ color: '#4a4060', fontSize: '1.1rem', lineHeight: 1.9, fontStyle: 'italic' }}>
                      {script[currentLine]}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
                  {currentLine > 0 && (
                    <button onClick={prev} style={{
                      background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: '50%',
                      width: 44, height: 44, cursor: 'pointer', fontSize: '1rem'
                    }}>←</button>
                  )}
                  <button
                    onClick={next}
                    className="btn btn-primary"
                    style={{ padding: '12px 32px', background: `linear-gradient(135deg, ${selectedMoodData?.color}, #b39ddb)` }}
                  >
                    {currentLine === script.length - 1 ? 'Complete 💜' : 'Continue →'}
                  </button>
                </div>
                <div style={{ marginTop: 16, fontSize: '0.8rem', color: '#c0b8d0' }}>
                  {currentLine + 1} of {script.length}
                </div>
              </motion.div>
            )}

            {view === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ fontSize: '4rem', marginBottom: 20 }}
                >🪷</motion.div>
                <h2 style={{ fontWeight: 800, color: '#4a4060', fontSize: '1.5rem', marginBottom: 12 }}>
                  Well done 💜
                </h2>
                <p style={{ color: '#7a6e8a', lineHeight: 1.7, marginBottom: 28 }}>
                  You gave yourself {fmt(elapsed)} of peace today. That is a real gift.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!isFav && (
                    <button onClick={saveFavorite} className="btn btn-secondary">
                      💛 Save this meditation
                    </button>
                  )}
                  {isFav && <p style={{ color: '#b2c9b2', fontSize: '0.9rem' }}>✓ Saved to favorites</p>}
                  <button onClick={() => { setView('pick'); setMood(null); setIsFav(false) }} className="btn btn-primary">
                    New Meditation
                  </button>
                </div>
              </motion.div>
            )}

            {view === 'favorites' && (
              <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="page-header">
                  <h1>💛 Saved Meditations</h1>
                </div>
                {favorites.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                    <p style={{ color: '#a89ebb' }}>Complete a meditation and save it to find it here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {favorites.map(f => {
                      const md = MOODS.find(m => m.id === f.mood)
                      return (
                        <div key={f.id} className="card">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '1.4rem' }}>{md?.emoji}</span>
                              <span style={{ fontWeight: 700, color: '#4a4060' }}>For {f.moodLabel}</span>
                            </div>
                            <span style={{ color: '#c0b8d0', fontSize: '0.75rem' }}>{f.date}</span>
                          </div>
                          <p style={{ color: '#7a6e8a', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                            "{f.script[0]?.slice(0, 100)}..."
                          </p>
                          <button
                            onClick={() => { setMood(f.mood); setScript(f.script); setCurrentLine(0); setElapsed(0); setView('session') }}
                            style={{ marginTop: 12, background: 'none', border: 'none', color: '#b39ddb', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', fontFamily: 'Nunito, sans-serif' }}
                          >
                            Replay this meditation →
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

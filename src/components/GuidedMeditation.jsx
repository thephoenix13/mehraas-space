import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const MOODS = [
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: '#D4770A' },
  { id: 'sad', emoji: '😔', label: 'Sad', color: '#7A9E7A' },
  { id: 'overwhelmed', emoji: '😵', label: 'Overwhelmed', color: '#C0392B' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: '#E8A020' },
  { id: 'okay', emoji: '🙂', label: 'Okay', color: '#A0856A' },
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
        `When you are ready, gently open your eyes. You are exactly where you need to be.`,
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
        `When you're ready, gently return. You are enough, exactly as you are.`,
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

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0', position: 'relative', overflow: 'hidden' }}>
      {/* Soft ambient orbs */}
      {[
        { size: 200, left: -60, top: -40, color: '#D4770A', dur: 8 },
        { size: 150, left: '70%', top: 60, color: '#E8A020', dur: 10 },
        { size: 100, left: '40%', top: '50%', color: '#C0392B', dur: 12 },
      ].map((orb, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', delay: i * 2 }}
          style={{
            position: 'fixed', left: orb.left, top: orb.top,
            width: orb.size, height: orb.size, borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color}18, transparent)`,
            pointerEvents: 'none', zIndex: 0
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => { navigate('/'); clearInterval(timerRef.current) }} className="back-btn">← Home</button>
          <button onClick={() => setView(view === 'favorites' ? 'pick' : 'favorites')} className="back-btn">
            💛 Saved ({favorites.length})
          </button>
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
                        background: 'white', border: '1px solid #F0E6D0', borderRadius: 20,
                        padding: '18px 22px', cursor: 'pointer', textAlign: 'left',
                        boxShadow: '0 2px 12px rgba(180,120,60,0.07)',
                        display: 'flex', alignItems: 'center', gap: 16,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: m.color + '20', border: `1.5px solid ${m.color}40`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0
                      }}>{m.emoji}</div>
                      <div>
                        <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C', marginBottom: 3 }}>I feel {m.label}</div>
                        <div style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.8rem' }}>3-5 min meditation for this feeling</div>
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
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', marginBottom: 16 }}>Preparing your meditation...</p>
                <div className="ai-loading" style={{ justifyContent: 'center' }}>
                  <div className="dots-loading"><span/><span/><span/></div>
                </div>
              </motion.div>
            )}

            {view === 'session' && script.length > 0 && (
              <motion.div key="session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.8rem', marginBottom: 8 }}>
                  {selectedMoodData?.emoji} Meditation for {selectedMoodData?.label} · {fmt(elapsed)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 36 }}>
                  {script.map((_, i) => (
                    <div key={i} style={{
                      height: 4, width: i <= currentLine ? 24 : 8, borderRadius: 50,
                      background: i <= currentLine ? (selectedMoodData?.color || '#D4770A') : '#F0E6D0',
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
                      background: '#fff',
                      border: '1px solid #F0E6D0',
                      borderTop: `3px solid ${selectedMoodData?.color || '#D4770A'}`,
                      borderRadius: 24, padding: '36px 28px', marginBottom: 36,
                      boxShadow: '0 4px 20px rgba(180,120,60,0.08)', minHeight: 160,
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <p style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C', fontSize: '1.1rem', lineHeight: 1.9, fontStyle: 'italic' }}>
                      {script[currentLine]}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
                  {currentLine > 0 && (
                    <button onClick={prev} style={{
                      background: '#fff', border: '1px solid #F0E6D0', borderRadius: '50%',
                      width: 44, height: 44, cursor: 'pointer', fontSize: '1rem',
                      boxShadow: '0 2px 8px rgba(180,120,60,0.06)'
                    }}>←</button>
                  )}
                  <button onClick={next} className="btn btn-primary" style={{ padding: '12px 32px' }}>
                    {currentLine === script.length - 1 ? 'Complete ✓' : 'Continue →'}
                  </button>
                </div>
                <div style={{ marginTop: 16, fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: '#7A6A5A' }}>
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
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#2C2C2C', fontSize: '1.5rem', marginBottom: 12 }}>
                  Well done
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', lineHeight: 1.7, marginBottom: 28 }}>
                  You gave yourself {fmt(elapsed)} of peace today. That is a real gift.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!isFav && (
                    <button onClick={saveFavorite} className="btn btn-ghost">
                      💛 Save this meditation
                    </button>
                  )}
                  {isFav && <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9E7A', fontSize: '0.9rem' }}>✓ Saved to favorites</p>}
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
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A' }}>Complete a meditation and save it to find it here.</p>
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
                              <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C' }}>For {f.moodLabel}</span>
                            </div>
                            <span style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.75rem' }}>{f.date}</span>
                          </div>
                          <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.85rem', fontStyle: 'italic', lineHeight: 1.6 }}>
                            "{f.script[0]?.slice(0, 100)}..."
                          </p>
                          <button
                            onClick={() => { setMood(f.mood); setScript(f.script); setCurrentLine(0); setElapsed(0); setView('session') }}
                            style={{ marginTop: 12, background: 'none', border: 'none', color: '#D4770A', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif' }}
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

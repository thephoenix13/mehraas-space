import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const todayKey = () => new Date().toISOString().split('T')[0]
const CARD_BGTONES = ['#FFF8F0', '#FAF3E0', '#F5EDD6']

export default function Affirmations() {
  const navigate = useNavigate()
  const [affirmations, setAffirmations] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem('affirmation_favorites') || '[]'))
  const [view, setView] = useState('daily')
  const [direction, setDirection] = useState(1)

  const loadAffirmations = async () => {
    setLoading(true)
    try {
      const text = await callClaude(
        'Generate exactly 3 short, warm, personalized affirmations for someone dealing with anxiety and depression. Each affirmation should be 1-2 sentences, deeply validating, and uplifting. Number them 1. 2. 3. with each on a new line.',
        'You generate warm, personalized affirmations. Reply with exactly 3 numbered affirmations, each on its own line.'
      )
      const parsed = text.split('\n').filter(l => l.match(/^\d+\./)).map(l => l.replace(/^\d+\.\s*/, '').trim()).filter(Boolean).slice(0, 3)
      const final = parsed.length > 0 ? parsed : [
        'You are worthy of love and belonging exactly as you are.',
        "Your feelings are valid, and it's okay to take things one step at a time.",
        'You have survived every hard day so far, and that is something to be proud of.',
      ]
      setAffirmations(final)
      localStorage.setItem('affirmations_cache', JSON.stringify(final))
      localStorage.setItem('affirmations_date', todayKey())
    } catch {
      setAffirmations([
        'You are worthy of love and belonging exactly as you are.',
        "Your feelings are valid, and it's okay to take things one step at a time.",
        'You have survived every hard day so far, and that is something to be proud of.',
      ])
    }
    setCurrent(0)
    setLoading(false)
  }

  useEffect(() => {
    const cachedDate = localStorage.getItem('affirmations_date')
    const cached = localStorage.getItem('affirmations_cache')
    if (cached && cachedDate === todayKey()) {
      const parsed = JSON.parse(cached)
      if (parsed.length > 0) { setAffirmations(parsed); return }
    }
    loadAffirmations()
  }, [])

  const next = () => { setDirection(1); setCurrent(c => (c + 1) % affirmations.length) }
  const prev = () => { setDirection(-1); setCurrent(c => (c - 1 + affirmations.length) % affirmations.length) }

  const toggleFavorite = (text) => {
    const updated = favorites.includes(text) ? favorites.filter(f => f !== text) : [...favorites, text]
    setFavorites(updated)
    localStorage.setItem('affirmation_favorites', JSON.stringify(updated))
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Home</button>
        <div style={{ display: 'flex', gap: 8 }}>
          {['daily', 'favorites'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '6px 14px', borderRadius: 50, border: '1px solid #F0E6D0', cursor: 'pointer',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '0.8rem',
              background: view === v ? '#C0392B' : '#fff', color: view === v ? '#fff' : '#7A6A5A',
              transition: 'all 0.2s ease',
            }}>{v === 'daily' ? '✨ Today' : `💛 Saved (${favorites.length})`}</button>
          ))}
        </div>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'daily' && (
            <motion.div key="daily" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>✨ Daily Affirmations</h1><p>Words of kindness, just for you</p></div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <div className="ai-loading" style={{ justifyContent: 'center' }}><div className="dots-loading"><span/><span/><span/></div><span>Gathering your affirmations…</span></div>
                </div>
              ) : affirmations.length > 0 && (
                <>
                  <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div key={current} custom={direction}
                        initial={{ x: direction * 80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -direction * 80, opacity: 0 }}
                        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
                        style={{
                          background: CARD_BGTONES[current % CARD_BGTONES.length],
                          border: '1px solid #F0E6D0', borderTop: '3px solid #D4770A',
                          borderRadius: 20, padding: '48px 32px', textAlign: 'center',
                          boxShadow: '0 4px 20px rgba(180,120,60,0.08)',
                          minHeight: 260, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        }}>
                        <div style={{ fontSize: '2rem', marginBottom: 20 }}>✨</div>
                        <p style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 'clamp(1.05rem, 3vw, 1.25rem)',
                          fontWeight: 600, color: '#2C2C2C', lineHeight: 1.7, maxWidth: 400,
                        }}>{affirmations[current]}</p>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          onClick={() => toggleFavorite(affirmations[current])}
                          style={{ marginTop: 24, background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.7rem', lineHeight: 1 }}>
                          {favorites.includes(affirmations[current]) ? '💛' : '🤍'}
                        </motion.button>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 24 }}>
                    <button onClick={prev} style={{ background: '#fff', border: '1px solid #F0E6D0', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(180,120,60,0.06)' }}>←</button>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {affirmations.map((_, i) => (
                        <div key={i} onClick={() => setCurrent(i)} style={{ width: 8, height: 8, borderRadius: '50%', cursor: 'pointer', background: i === current ? '#D4770A' : '#F0E6D0', transition: 'all 0.2s ease' }} />
                      ))}
                    </div>
                    <button onClick={next} style={{ background: '#fff', border: '1px solid #F0E6D0', borderRadius: '50%', width: 44, height: 44, cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(180,120,60,0.06)' }}>→</button>
                  </div>

                  <button onClick={loadAffirmations} className="btn btn-ghost" style={{ width: '100%' }}>🔄 Get New Affirmations</button>
                </>
              )}
            </motion.div>
          )}

          {view === 'favorites' && (
            <motion.div key="favorites" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header"><h1>💛 Saved Favorites</h1><p>Affirmations that touched your heart</p></div>
              {favorites.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🤍</div>
                  <p>Tap the heart on any affirmation to save it here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {favorites.map((f, i) => (
                    <motion.div key={f} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                      style={{ background: '#fff', borderRadius: 16, padding: '20px 22px', boxShadow: '0 2px 12px rgba(180,120,60,0.07)', borderLeft: '4px solid #E8A020', border: '1px solid #F0E6D0', borderLeftColor: '#E8A020' }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C', fontWeight: 600, lineHeight: 1.7 }}>{f}</p>
                      <button onClick={() => toggleFavorite(f)} style={{ marginTop: 10, background: 'none', border: 'none', color: '#7A6A5A', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline', fontFamily: 'Inter, sans-serif' }}>Remove</button>
                    </motion.div>
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

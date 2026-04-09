import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const ITEMS = [
  { id: 'water', emoji: '💧', label: 'Drank water', desc: 'Stayed hydrated today' },
  { id: 'eaten', emoji: '🍽️', label: 'Eaten something', desc: 'Had at least one meal' },
  { id: 'sunlight', emoji: '☀️', label: 'Got some sunlight', desc: 'Opened a window or stepped outside' },
  { id: 'movement', emoji: '🚶', label: 'Moved my body', desc: 'Any movement counts — a walk, a stretch' },
  { id: 'rest', emoji: '😴', label: 'Rested', desc: 'Took a break or napped' },
  { id: 'fresh_air', emoji: '🌿', label: 'Fresh air', desc: 'Breathed in some outside air' },
  { id: 'connection', emoji: '💬', label: 'Connected with someone', desc: 'Texted, called, or hugged someone' },
  { id: 'joy', emoji: '🌸', label: 'Something joyful', desc: 'Did one thing that felt good' },
]

const todayKey = () => new Date().toISOString().split('T')[0]

export default function SelfCareChecklist() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('selfcare_checked') || '{}')
    return stored.date === todayKey() ? stored.items : {}
  })
  const [message, setMessage] = useState('')
  const [msgLoading, setMsgLoading] = useState(false)
  const [msgShown, setMsgShown] = useState(false)

  useEffect(() => {
    localStorage.setItem('selfcare_checked', JSON.stringify({ date: todayKey(), items: checked }))
  }, [checked])

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const count = Object.values(checked).filter(Boolean).length
  const pct = Math.round((count / ITEMS.length) * 100)

  const getEndMessage = async () => {
    setMsgLoading(true)
    const checkedLabels = ITEMS.filter(i => checked[i.id]).map(i => i.label).join(', ')
    const uncheckedLabels = ITEMS.filter(i => !checked[i.id]).map(i => i.label).join(', ')
    try {
      const text = await callClaude(
        `Someone checked in on their self-care today. They managed to: ${checkedLabels || 'not much, and that is okay too'}. ${uncheckedLabels ? `They didn't get to: ${uncheckedLabels}.` : ''}

Please give them a warm, kind, non-judgmental end-of-day message (2-3 sentences). Celebrate what they did, validate any struggles, and remind them that whatever they managed today was enough.`
      )
      setMessage(text)
    } catch {
      setMessage("Whatever you managed today was enough. You showed up for yourself in the ways you could, and that matters. Tomorrow is a new gentle beginning. 💜")
    }
    setMsgLoading(false)
    setMsgShown(true)
  }

  const fillColor = pct === 100 ? '#b2c9b2' : pct >= 60 ? '#c9b8e8' : pct >= 30 ? '#f5c6d0' : '#e8dffa'

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'linear-gradient(160deg, #d4e8d4, #f5f0ff, #fce4ec)' }}>
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
      </div>

      <div className="page-container">
        <div className="page-header">
          <h1>📋 Self Care</h1>
          <p>A gentle nudge, not a to-do list</p>
        </div>

        {/* Progress fill bar */}
        <div className="card" style={{ marginBottom: 24, padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, color: '#5a5070', fontSize: '0.9rem' }}>Today's care</span>
            <span style={{ fontWeight: 700, color: fillColor, fontSize: '0.9rem' }}>{count} of {ITEMS.length}</span>
          </div>
          <div style={{ height: 14, background: '#f0ebf8', borderRadius: 50, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 50,
                background: `linear-gradient(90deg, ${fillColor}, ${fillColor}dd)`,
              }}
            />
          </div>
          <p style={{ fontSize: '0.78rem', color: '#a89ebb', marginTop: 8, textAlign: 'center' }}>
            {pct === 0 ? 'Start whenever you\'re ready 🌸' : pct === 100 ? 'You took such good care of yourself today! 🌟' : `You're doing beautifully — ${8 - count} more to go`}
          </p>
        </div>

        {/* Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {ITEMS.map(item => (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggle(item.id)}
              style={{
                background: checked[item.id] ? `${fillColor}25` : 'white',
                border: checked[item.id] ? `2px solid ${fillColor}` : '2px solid transparent',
                borderRadius: 16, padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
                boxShadow: '0 3px 12px rgba(180,150,200,0.1)', transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', gap: 14
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: checked[item.id] ? fillColor + '60' : '#f5f0ff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
              }}>
                {checked[item.id] ? '✓' : item.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 700, color: checked[item.id] ? '#5a5070' : '#4a4060', fontSize: '0.9rem',
                  textDecoration: checked[item.id] ? 'none' : 'none'
                }}>
                  {item.label}
                </div>
                <div style={{ color: '#a89ebb', fontSize: '0.78rem', marginTop: 2 }}>{item.desc}</div>
              </div>
              <motion.div
                animate={{ scale: checked[item.id] ? 1 : 0, opacity: checked[item.id] ? 1 : 0 }}
                style={{
                  width: 22, height: 22, borderRadius: '50%', background: fillColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: '0.7rem', color: 'white', fontWeight: 800
                }}
              >✓</motion.div>
            </motion.button>
          ))}
        </div>

        {/* End-of-day message */}
        {!msgShown ? (
          <button onClick={getEndMessage} disabled={msgLoading} className="btn btn-secondary" style={{ width: '100%' }}>
            {msgLoading ? 'Getting your message...' : '💌 How did I do today?'}
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ background: 'linear-gradient(135deg, #f5f0ff, #fce4ec)', textAlign: 'center' }}
            >
              <p style={{ color: '#5a5070', lineHeight: 1.75, fontStyle: 'italic' }}>{message}</p>
              <button onClick={() => setMsgShown(false)} style={{
                marginTop: 12, background: 'none', border: 'none', color: '#a89ebb',
                cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline',
                fontFamily: 'Nunito, sans-serif'
              }}>Ask again</button>
            </motion.div>
          </AnimatePresence>
        )}
        {msgLoading && (
          <div className="ai-loading" style={{ justifyContent: 'center', marginTop: 12 }}>
            <div className="dots-loading"><span/><span/><span/></div>
          </div>
        )}
      </div>
    </div>
  )
}

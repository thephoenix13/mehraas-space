import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const PATTERNS = {
  'Box Breathing': {
    desc: 'Equal parts inhale, hold, exhale, hold',
    steps: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 4 },
      { label: 'Exhale', duration: 4 },
      { label: 'Hold', duration: 4 },
    ],
    color: '#D4770A',
    bg: 'linear-gradient(160deg, var(--color-bg), var(--color-bg-section))',
  },
  '4-7-8': {
    desc: 'Calms the nervous system quickly',
    steps: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
    color: '#C0392B',
    bg: 'linear-gradient(160deg, var(--color-bg-section), var(--color-bg))',
  },
  'Deep Calm': {
    desc: 'Slow, restorative breathing',
    steps: [
      { label: 'Inhale', duration: 5 },
      { label: 'Hold', duration: 2 },
      { label: 'Exhale', duration: 6 },
    ],
    color: '#E8A020',
    bg: 'linear-gradient(160deg, var(--color-bg), var(--color-bg-section))',
  },
}

export default function Breathe() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('Box Breathing')
  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [countdown, setCountdown] = useState(0)
  const [sessions, setSessions] = useState(() => parseInt(localStorage.getItem('breathe_sessions') || '0'))
  const timerRef = useRef(null)
  const pattern = PATTERNS[selected]
  const step = pattern.steps[stepIdx]

  const startSession = () => { setActive(true); setStepIdx(0); setCountdown(pattern.steps[0].duration) }
  const stopSession = () => { setActive(false); clearInterval(timerRef.current) }

  useEffect(() => {
    if (!active) return
    setCountdown(step.duration)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setStepIdx(s => {
            const next = (s + 1) % pattern.steps.length
            if (next === 0) setSessions(n => { const u = n + 1; localStorage.setItem('breathe_sessions', u); return u })
            return next
          })
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [active, stepIdx, selected])

  const isExpand = step?.label === 'Inhale'
  const isHold = step?.label === 'Hold'
  const circleScale = active ? (isExpand ? 1.4 : isHold ? 1.4 : 1) : 1

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: active ? pattern.bg : 'var(--color-bg)', transition: 'background 0.8s ease' }}>
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Back</button>
      </div>

      <div className="page-container" style={{ textAlign: 'center' }}>
        <div className="page-header">
          <h1>🌬️ Breathe</h1>
          <p>Let your breath guide you to stillness</p>
        </div>

        {/* Pattern selector */}
        {!active && (
          <>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
              {Object.entries(PATTERNS).map(([name, p]) => (
                <button key={name} onClick={() => setSelected(name)} style={{
                  padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                  background: selected === name ? p.color : 'var(--color-card)',
                  color: selected === name ? '#fff' : 'var(--color-text-muted)',
                  border: selected === name ? 'none' : '1px solid var(--color-card-border)',
                  boxShadow: selected === name ? `0 4px 16px ${p.color}40` : 'var(--shadow-card)',
                  transition: 'all 0.2s ease',
                }}>{name}</button>
              ))}
            </div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: 36, fontSize: '0.9rem' }}>{pattern.desc}</p>
          </>
        )}

        {/* Breathing circle */}
        <div style={{ position: 'relative', width: 240, height: 240, margin: '0 auto 40px' }}>
          <motion.div
            animate={{ scale: active ? circleScale * 1.15 : 1, opacity: active ? 0.25 : 0.1 }}
            transition={{ duration: step?.duration || 1, ease: isHold ? 'linear' : 'easeInOut' }}
            style={{
              position: 'absolute', inset: -24, borderRadius: '50%',
              background: pattern.color, opacity: 0.1,
            }}
          />
          <motion.div
            animate={{ scale: active ? circleScale : 1 }}
            transition={{ duration: step?.duration || 1, ease: isHold ? 'linear' : 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, var(--color-card) 25%, ${pattern.color}30 100%)`,
              border: `2px solid ${pattern.color}40`,
              boxShadow: `0 8px 40px ${pattern.color}30`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 1,
            }}
          >
            {active ? (
              <>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: pattern.color }}>{countdown}</div>
              </>
            ) : (
              <div style={{ fontSize: '3rem' }}>🌬️</div>
            )}
          </motion.div>
        </div>

        {/* Step indicators */}
        {active && (
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
            {pattern.steps.map((s, i) => (
              <div key={i} style={{
                padding: '6px 14px', borderRadius: 50,
                background: i === stepIdx ? pattern.color : 'var(--color-bg-section)',
                color: i === stepIdx ? '#fff' : 'var(--color-text-muted)',
                fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 600,
                transition: 'all 0.3s ease',
              }}>{s.label}</div>
            ))}
          </div>
        )}

        {!active ? (
          <button onClick={startSession} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            Begin Session
          </button>
        ) : (
          <button onClick={stopSession} className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            Stop
          </button>
        )}

        <div style={{ marginTop: 32, color: 'var(--color-text-muted)', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem' }}>
          Sessions completed today: <strong style={{ color: '#C0392B' }}>{sessions}</strong>
        </div>
      </div>
    </div>
  )
}

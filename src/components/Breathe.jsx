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
    color: '#c9b8e8',
    bg: 'linear-gradient(135deg, #e8dffa, #d4e8d4)'
  },
  '4-7-8': {
    desc: 'Calms the nervous system quickly',
    steps: [
      { label: 'Inhale', duration: 4 },
      { label: 'Hold', duration: 7 },
      { label: 'Exhale', duration: 8 },
    ],
    color: '#f5c6d0',
    bg: 'linear-gradient(135deg, #fce4ec, #e8dffa)'
  },
  'Deep Calm': {
    desc: 'Slow, restorative breathing',
    steps: [
      { label: 'Inhale', duration: 5 },
      { label: 'Hold', duration: 2 },
      { label: 'Exhale', duration: 6 },
    ],
    color: '#b2c9b2',
    bg: 'linear-gradient(135deg, #d4e8d4, #fff5f7)'
  }
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

  const startSession = () => {
    setActive(true)
    setStepIdx(0)
    setCountdown(pattern.steps[0].duration)
  }

  const stopSession = () => {
    setActive(false)
    clearInterval(timerRef.current)
  }

  useEffect(() => {
    if (!active) return
    setCountdown(step.duration)
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setStepIdx(s => {
            const next = (s + 1) % pattern.steps.length
            if (next === 0) {
              setSessions(n => {
                const updated = n + 1
                localStorage.setItem('breathe_sessions', updated)
                return updated
              })
            }
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
    <div style={{
      minHeight: '100vh', paddingBottom: 80,
      background: active ? pattern.bg : 'linear-gradient(160deg, #f5f0ff, #fff5f7)'
    }}>
      {/* Back button */}
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a', fontFamily: 'Nunito, sans-serif',
          fontWeight: 600, fontSize: '0.9rem'
        }}>← Back</button>
      </div>

      <div className="page-container" style={{ textAlign: 'center' }}>
        <div className="page-header">
          <h1>🌬️ Breathe</h1>
          <p>Let your breath guide you to stillness</p>
        </div>

        {/* Pattern Selector */}
        {!active && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            {Object.entries(PATTERNS).map(([name, p]) => (
              <button key={name} onClick={() => setSelected(name)} style={{
                padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: '0.85rem',
                background: selected === name ? p.color : 'white',
                color: selected === name ? 'white' : '#7a6e8a',
                boxShadow: selected === name ? `0 4px 16px ${p.color}80` : '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease'
              }}>{name}</button>
            ))}
          </div>
        )}

        {!active && (
          <p style={{ color: '#a89ebb', marginBottom: 32, fontSize: '0.9rem' }}>
            {pattern.desc}
          </p>
        )}

        {/* Breathing Circle */}
        <div style={{ position: 'relative', width: 240, height: 240, margin: '0 auto 40px' }}>
          {/* Outer ring */}
          <motion.div
            animate={{ scale: active ? circleScale : 1, opacity: active ? 0.3 : 0.15 }}
            transition={{ duration: step?.duration || 1, ease: isHold ? 'linear' : 'easeInOut' }}
            style={{
              position: 'absolute', inset: -20, borderRadius: '50%',
              background: pattern.color, opacity: 0.15
            }}
          />
          {/* Main circle */}
          <motion.div
            animate={{ scale: active ? circleScale : 1 }}
            transition={{ duration: step?.duration || 1, ease: isHold ? 'linear' : 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: `radial-gradient(circle, white 30%, ${pattern.color}80 100%)`,
              boxShadow: `0 8px 40px ${pattern.color}60`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 1
            }}
          >
            {active ? (
              <>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4a4060', marginBottom: 4 }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 700, color: pattern.color.replace(')', ', 0.8)').replace('rgb', 'rgba') }}>
                  {countdown}
                </div>
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
                background: i === stepIdx ? pattern.color : '#e8dffa',
                color: i === stepIdx ? 'white' : '#a89ebb',
                fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.3s ease'
              }}>
                {s.label}
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {!active ? (
          <button onClick={startSession} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            Begin Session
          </button>
        ) : (
          <button onClick={stopSession} className="btn btn-ghost" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            Stop
          </button>
        )}

        {/* Session Counter */}
        <div style={{ marginTop: 32, color: '#a89ebb', fontSize: '0.85rem' }}>
          Sessions completed today: <strong style={{ color: '#7c6ab0' }}>{sessions}</strong>
        </div>
      </div>
    </div>
  )
}

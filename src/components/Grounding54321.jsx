import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const STEPS = [
  { count: 5, sense: 'See', prompt: 'Name 5 things you can see right now', emoji: '👁️', color: '#D4770A', examples: 'a window, a lamp, your hands, the ceiling...' },
  { count: 4, sense: 'Touch', prompt: 'Name 4 things you can physically feel', emoji: '🤲', color: '#C0392B', examples: 'the floor beneath you, your clothes, the chair...' },
  { count: 3, sense: 'Hear', prompt: 'Name 3 sounds you can hear', emoji: '👂', color: '#7A9E7A', examples: 'your breathing, distant traffic, birds...' },
  { count: 2, sense: 'Smell', prompt: 'Name 2 things you can smell', emoji: '👃', color: '#E8A020', examples: 'the air, your drink, your clothes...' },
  { count: 1, sense: 'Taste', prompt: 'Name 1 thing you can taste', emoji: '👅', color: '#A93226', examples: 'water, toothpaste, coffee, nothing...' },
]

export default function Grounding54321() {
  const navigate = useNavigate()
  const [view, setView] = useState('intro') // intro | step | done
  const [stepIdx, setStepIdx] = useState(0)
  const [answers, setAnswers] = useState(['', '', '', '', ''])
  const [affirmation, setAffirmation] = useState('')
  const [affLoading, setAffLoading] = useState(false)

  const step = STEPS[stepIdx]

  const handleNext = () => {
    if (stepIdx < STEPS.length - 1) {
      setStepIdx(s => s + 1)
    } else {
      finishGrounding()
    }
  }

  const finishGrounding = async () => {
    setView('done')
    setAffLoading(true)
    try {
      const text = await callClaude(
        'Someone just completed a 5-4-3-2-1 grounding exercise for anxiety. Please give them a short, warm, affirming message (2-3 sentences) acknowledging that they did something powerful for themselves and reminding them that they are safe.',
        null, 300
      )
      setAffirmation(text)
    } catch {
      setAffirmation("You did something really powerful just now — you brought yourself back to the present moment. That is a skill, and you used it. You are safe, and you are here.")
    }
    setAffLoading(false)
  }

  const reset = () => {
    setView('intro')
    setStepIdx(0)
    setAnswers(['', '', '', '', ''])
    setAffirmation('')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => navigate('/')} className="back-btn">← Home</button>
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: 20 }}>🖐️</div>
              <div className="page-header">
                <h1>5-4-3-2-1 Grounding</h1>
                <p>For moments of panic, anxiety, or feeling untethered</p>
              </div>

              <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#2C2C2C', lineHeight: 1.8, marginBottom: 16 }}>
                  This gentle technique uses your five senses to anchor you back into the present moment. It works by interrupting the anxiety spiral and reminding your nervous system that you are safe, right here, right now.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {STEPS.map(s => (
                    <div key={s.sense} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', background: s.color + '25',
                        border: `1.5px solid ${s.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0
                      }}>{s.emoji}</div>
                      <span style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.9rem' }}>
                        <strong style={{ color: '#2C2C2C' }}>{s.count}</strong> things you can <strong style={{ color: '#2C2C2C' }}>{s.sense.toLowerCase()}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => setView('step')} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
                Begin Grounding 🖐️
              </button>
            </motion.div>
          )}

          {view === 'step' && (
            <motion.div key={`step-${stepIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              {/* Progress bar */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 50,
                    background: i <= stepIdx ? s.color : '#F0E6D0',
                    transition: 'all 0.4s ease'
                  }} />
                ))}
              </div>

              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <motion.div
                  key={stepIdx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: step.color + '20',
                    border: `3px solid ${step.color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem', margin: '0 auto 16px'
                  }}
                >{step.emoji}</motion.div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 800, color: step.color, marginBottom: 4 }}>
                  {step.count}
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C', fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>
                  {step.prompt}
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.85rem' }}>e.g. {step.examples}</p>
              </div>

              <div className="card" style={{ marginBottom: 24 }}>
                <textarea
                  value={answers[stepIdx]}
                  onChange={e => {
                    const updated = [...answers]
                    updated[stepIdx] = e.target.value
                    setAnswers(updated)
                  }}
                  placeholder={`Type what you ${step.sense.toLowerCase()}...`}
                  rows={4}
                  autoFocus
                  style={{ borderColor: step.color + '60' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {stepIdx > 0 && (
                  <button onClick={() => setStepIdx(s => s - 1)} className="btn btn-ghost" style={{ flex: 1 }}>← Back</button>
                )}
                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {stepIdx === STEPS.length - 1 ? 'Finish ✓' : 'Next →'}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                style={{ fontSize: '4rem', marginBottom: 20 }}
              >🌿</motion.div>

              <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#2C2C2C', fontWeight: 700, fontSize: '1.6rem', marginBottom: 12 }}>
                You are grounded
              </h2>

              {/* Summary */}
              <div className="card" style={{ marginBottom: 20, textAlign: 'left' }}>
                {STEPS.map((s, i) => answers[i] && (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{s.emoji}</span>
                    <div>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, color: '#7A6A5A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.count} {s.sense}</span>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#2C2C2C', fontSize: '0.88rem', marginTop: 2 }}>{answers[i]}</p>
                    </div>
                  </div>
                ))}
              </div>

              {affLoading ? (
                <div className="ai-loading" style={{ justifyContent: 'center', marginBottom: 24 }}>
                  <div className="dots-loading"><span/><span/><span/></div>
                </div>
              ) : affirmation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card"
                  style={{ marginBottom: 24, background: '#FFF8F0', borderLeft: '4px solid #D4770A', textAlign: 'center' }}
                >
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#2C2C2C', lineHeight: 1.75, fontStyle: 'italic' }}>{affirmation}</p>
                </motion.div>
              )}

              <button onClick={reset} className="btn btn-ghost">
                Start Over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

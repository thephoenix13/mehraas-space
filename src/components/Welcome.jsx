import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Welcome({ onComplete }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')

  const goToStep2 = () => {
    if (!name.trim()) return
    setStep(2)
  }

  const finish = () => {
    const trimmedName = name.trim()
    localStorage.setItem('user_name', trimmedName)
    localStorage.setItem('user_note', note.trim())
    onComplete(trimmedName)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--color-bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', textAlign: 'center',
    }}>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <motion.div
              animate={{ scale: [1, 1.07, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '4rem', marginBottom: 28 }}
            >🌸</motion.div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.9rem, 5vw, 2.5rem)',
              fontWeight: 700, color: '#C0392B', marginBottom: 14,
            }}>
              Welcome to your space
            </h1>

            <p style={{
              fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)',
              fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 320,
              margin: '0 auto 36px',
            }}>
              A gentle place for the hard days and the quiet ones. Just for you.
            </p>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{
                display: 'block', fontFamily: 'Inter, sans-serif',
                fontWeight: 700, color: 'var(--color-text)',
                fontSize: '0.95rem', marginBottom: 10,
              }}>
                What would you like to be called? 💛
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && goToStep2()}
                placeholder="Your name or nickname..."
                autoFocus
                style={{
                  width: '100%', padding: '14px 18px', borderRadius: 16,
                  border: '1.5px solid var(--color-card-border)',
                  background: 'var(--color-card)', color: 'var(--color-text)',
                  fontFamily: 'Inter, sans-serif', fontSize: '1rem',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#D4770A'}
                onBlur={e => e.target.style.borderColor = 'var(--color-card-border)'}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={goToStep2}
              disabled={!name.trim()}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
            >
              Continue →
            </motion.button>

            <p style={{
              marginTop: 20, fontFamily: 'Inter, sans-serif',
              fontSize: '0.72rem', color: 'var(--color-text-muted)',
            }}>
              Your name stays on your device only — nothing leaves this app.
            </p>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <div style={{ fontSize: '3rem', marginBottom: 24 }}>💬</div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              fontWeight: 700, color: '#C0392B', marginBottom: 10,
            }}>
              Hi, {name.trim()} 🌸
            </h2>

            <p style={{
              fontFamily: 'Inter, sans-serif', color: 'var(--color-text-muted)',
              fontSize: '0.92rem', lineHeight: 1.75, maxWidth: 320,
              margin: '0 auto 28px',
            }}>
              Soleil — your gentle companion in this space — would love to know a little about you, so every conversation feels personal.
            </p>

            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <label style={{
                display: 'block', fontFamily: 'Inter, sans-serif',
                fontWeight: 700, color: 'var(--color-text)',
                fontSize: '0.92rem', marginBottom: 10,
              }}>
                Is there anything you'd like Soleil to know about you? <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder={`e.g. "I've been struggling with anxiety lately" or "I go through hard days and could use a kind ear" — whatever feels right.`}
                rows={5}
                autoFocus
                style={{
                  width: '100%', borderRadius: 16,
                  border: '1.5px solid var(--color-card-border)',
                  background: 'var(--color-card)', color: 'var(--color-text)',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.92rem',
                  outline: 'none', boxSizing: 'border-box',
                  resize: 'none', lineHeight: 1.65,
                  padding: '14px 18px',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={e => e.target.style.borderColor = '#D4770A'}
                onBlur={e => e.target.style.borderColor = 'var(--color-card-border)'}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={finish}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '1rem', padding: '14px', marginBottom: 12 }}
            >
              Enter my space 🌸
            </motion.button>

            <button
              onClick={() => setStep(1)}
              style={{
                background: 'none', border: 'none', color: 'var(--color-text-muted)',
                cursor: 'pointer', fontSize: '0.82rem', textDecoration: 'underline',
                fontFamily: 'Inter, sans-serif',
              }}
            >← Back</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

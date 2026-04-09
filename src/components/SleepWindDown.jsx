import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const STEPS = [
  {
    id: 'dim',
    emoji: '🌙',
    title: 'Dim Your World',
    desc: 'Lower your screen brightness, turn off bright lights. Let your eyes soften.',
    action: 'I\'ve dimmed my lights',
  },
  {
    id: 'breathe',
    emoji: '🌬️',
    title: '4-7-8 Breathing',
    desc: 'Inhale for 4 counts, hold for 7, exhale slowly for 8. This tells your nervous system it\'s safe to rest.',
    action: 'Done breathing',
    hasBreathe: true,
  },
  {
    id: 'release',
    emoji: '🛌',
    title: 'Body Scan & Release',
    desc: 'Starting from your toes, consciously relax each part of your body upward. Let the mattress hold you.',
    action: 'My body feels softer',
  },
]

const SOUNDS = [
  { id: 'rain', emoji: '🌧️', label: 'Rain' },
  { id: 'ocean', emoji: '🌊', label: 'Ocean' },
  { id: 'white', emoji: '🌫️', label: 'White Noise' },
]

function generateNoise(ctx, type) {
  const bufferSize = ctx.sampleRate * 3
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  if (type === 'rain') { filter.type = 'bandpass'; filter.frequency.value = 900; filter.Q.value = 0.4 }
  else if (type === 'ocean') { filter.type = 'lowpass'; filter.frequency.value = 500 }
  else { filter.type = 'highpass'; filter.frequency.value = 100 }
  source.connect(filter)
  return { source, output: filter }
}

export default function SleepWindDown() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0 = intro, 1-3 = steps, 4 = story, 5 = done
  const [breathPhase, setBreathPhase] = useState(null)
  const [breathCount, setBreathCount] = useState(0)
  const [breathCycles, setBreathCycles] = useState(0)
  const [sound, setSound] = useState(null)
  const [story, setStory] = useState('')
  const [storyLoading, setStoryLoading] = useState(false)
  const breathTimerRef = useRef(null)
  const audioCtxRef = useRef(null)
  const soundNodeRef = useRef(null)
  const gainRef = useRef(null)

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    return audioCtxRef.current
  }

  const playSound = (id) => {
    stopSound()
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const { source, output } = generateNoise(ctx, id)
    const gain = ctx.createGain()
    gain.gain.value = 0.35
    output.connect(gain)
    gain.connect(ctx.destination)
    source.start()
    soundNodeRef.current = source
    gainRef.current = gain
    setSound(id)
  }

  const stopSound = () => {
    try { soundNodeRef.current?.stop() } catch {}
    gainRef.current?.disconnect()
    soundNodeRef.current = null
    gainRef.current = null
    setSound(null)
  }

  // 4-7-8 breathing sequencer
  const startBreathing = () => {
    const sequence = [
      { phase: 'Inhale', dur: 4 },
      { phase: 'Hold', dur: 7 },
      { phase: 'Exhale', dur: 8 },
    ]
    let si = 0; let count = sequence[0].dur
    setBreathPhase(sequence[0].phase)
    setBreathCount(count)
    clearInterval(breathTimerRef.current)
    breathTimerRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        si = (si + 1) % 3
        if (si === 0) setBreathCycles(c => c + 1)
        count = sequence[si].dur
        setBreathPhase(sequence[si].phase)
      }
      setBreathCount(count)
    }, 1000)
  }

  const stopBreathing = () => {
    clearInterval(breathTimerRef.current)
    setBreathPhase(null)
  }

  const loadStory = async () => {
    setStoryLoading(true)
    try {
      const text = await callClaude(
        'Write a very short, soothing bedtime story for an adult (5-7 sentences). It should be calming, imaginative, and end in a peaceful, sleepy place — like walking through a meadow at dusk, or floating gently on still water. Use soft, dreamy language.',
        'You write calming, gentle bedtime stories. Keep it very short — 5 to 7 sentences maximum.',
        400
      )
      setStory(text)
    } catch {
      setStory("Imagine yourself on a quiet hillside as the stars begin to appear, one by one, like soft whispers of light. The air is gentle and warm, carrying the faintest scent of flowers and earth. You lie down in soft grass, and the ground holds you completely. Your breath slows with the wind. Each star that appears is a thought you can let go of tonight. You are safe. You are held. Sleep finds you like an old, gentle friend. 🌙")
    }
    setStoryLoading(false)
  }

  useEffect(() => () => {
    clearInterval(breathTimerRef.current)
    stopSound()
    audioCtxRef.current?.close()
  }, [])

  const currentStep = STEPS[step - 1]

  const starPositions = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: Math.random() * 0.6 + 0.2,
    delay: Math.random() * 3
  }))

  return (
    <div style={{
      minHeight: '100vh', paddingBottom: 80,
      background: step === 0
        ? 'linear-gradient(160deg, #1a1035, #2d1b69, #1a2a4a)'
        : 'linear-gradient(180deg, #0f0a1e 0%, #1a1035 40%, #0d1f3c 100%)',
      transition: 'background 1s ease'
    }}>
      {/* Stars */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        {starPositions.map((s, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.2, 1] }}
            transition={{ duration: 2 + s.delay, repeat: Infinity, ease: 'easeInOut', delay: s.delay }}
            style={{
              position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
              width: `${s.size * 4}px`, height: `${s.size * 4}px`,
              borderRadius: '50%', background: 'rgba(255,255,255,0.8)'
            }}
          />
        ))}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={{
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 12, padding: '8px 16px', cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
            fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
          }}>← Home</button>

          {/* Sound controls */}
          <div style={{ display: 'flex', gap: 8 }}>
            {SOUNDS.map(s => (
              <button key={s.id} onClick={() => sound === s.id ? stopSound() : playSound(s.id)} style={{
                padding: '6px 12px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: sound === s.id ? 'rgba(201,184,232,0.4)' : 'rgba(255,255,255,0.1)',
                color: sound === s.id ? '#c9b8e8' : 'rgba(255,255,255,0.5)',
                fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.75rem',
                transition: 'all 0.2s ease'
              }}>{s.emoji}</button>
            ))}
          </div>
        </div>

        <div className="page-container" style={{ textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '5rem', marginBottom: 24 }}
                >🌙</motion.div>
                <h1 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
                  Sleep Wind-Down
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 40, lineHeight: 1.7 }}>
                  A gentle 3-step bedtime routine to help your mind and body settle into rest.
                </p>
                <button onClick={() => setStep(1)} className="btn btn-primary" style={{ fontSize: '1rem', padding: '14px 36px', background: 'linear-gradient(135deg, #483d8b, #6a4f9c)' }}>
                  Begin Wind-Down 🌙
                </button>
              </motion.div>
            )}

            {step >= 1 && step <= 3 && currentStep && (
              <motion.div key={`step-${step}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
                    {STEPS.map((_, i) => (
                      <div key={i} style={{
                        width: i < step ? 24 : 8, height: 8, borderRadius: 50,
                        background: i < step ? 'rgba(201,184,232,0.8)' : 'rgba(255,255,255,0.2)',
                        transition: 'all 0.4s ease'
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Step {step} of 3
                  </div>
                </div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '4rem', marginBottom: 20 }}
                >
                  {currentStep.emoji}
                </motion.div>

                <h2 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 16 }}>
                  {currentStep.title}
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
                  {currentStep.desc}
                </p>

                {currentStep.hasBreathe && (
                  <div style={{ marginBottom: 28 }}>
                    {!breathPhase ? (
                      <button onClick={startBreathing} style={{
                        background: 'rgba(201,184,232,0.2)', border: '2px solid rgba(201,184,232,0.4)',
                        borderRadius: 50, padding: '10px 24px', color: '#c9b8e8',
                        fontFamily: 'Nunito, sans-serif', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem'
                      }}>Start 4-7-8 Breathing</button>
                    ) : (
                      <div>
                        <motion.div
                          animate={{ scale: breathPhase === 'Inhale' ? 1.3 : breathPhase === 'Hold' ? 1.3 : 1 }}
                          transition={{ duration: breathPhase === 'Inhale' ? 4 : breathPhase === 'Exhale' ? 8 : 0.1, ease: 'easeInOut' }}
                          style={{
                            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 16px',
                            background: 'radial-gradient(circle, rgba(201,184,232,0.3) 0%, rgba(201,184,232,0.05) 100%)',
                            border: '2px solid rgba(201,184,232,0.4)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          <div style={{ color: '#c9b8e8', fontWeight: 800, fontSize: '1.2rem' }}>{breathPhase}</div>
                          <div style={{ color: 'rgba(201,184,232,0.7)', fontSize: '1.8rem', fontWeight: 700 }}>{breathCount}</div>
                        </motion.div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: 12 }}>
                          Cycles: {breathCycles}
                        </div>
                        <button onClick={stopBreathing} style={{
                          background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50,
                          padding: '6px 16px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                          fontFamily: 'Nunito, sans-serif', fontSize: '0.8rem'
                        }}>Stop</button>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => { stopBreathing(); setStep(s => s + 1) }} style={{
                  background: 'linear-gradient(135deg, #483d8b, #6a4f9c)',
                  border: 'none', borderRadius: 50, padding: '14px 32px',
                  color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                  fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 20px rgba(72,61,139,0.4)'
                }}>
                  {step === 3 ? 'Finish Routine ✨' : `${currentStep.action} →`}
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                  <div style={{ fontSize: '4rem', marginBottom: 20 }}>🌠</div>
                </motion.div>
                <h2 style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 800, fontSize: '1.5rem', marginBottom: 16 }}>
                  A Bedtime Story
                </h2>
                {!story && !storyLoading ? (
                  <button onClick={loadStory} style={{
                    background: 'linear-gradient(135deg, #483d8b, #6a4f9c)',
                    border: 'none', borderRadius: 50, padding: '14px 32px',
                    color: 'white', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                    fontSize: '0.95rem', cursor: 'pointer', marginBottom: 20
                  }}>✨ Generate a bedtime story</button>
                ) : storyLoading ? (
                  <div className="ai-loading" style={{ justifyContent: 'center', marginBottom: 20 }}>
                    <div className="dots-loading"><span/><span/><span/></div>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>Writing your story...</span>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: 'rgba(255,255,255,0.06)', borderRadius: 20,
                      padding: '24px 28px', textAlign: 'left', marginBottom: 24,
                      border: '1px solid rgba(255,255,255,0.08)'
                    }}
                  >
                    <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 2, fontSize: '0.95rem', fontStyle: 'italic' }}>
                      {story}
                    </p>
                    <button onClick={loadStory} style={{
                      marginTop: 16, background: 'none', border: 'none', color: 'rgba(201,184,232,0.6)',
                      cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline',
                      fontFamily: 'Nunito, sans-serif'
                    }}>Another story...</button>
                  </motion.div>
                )}
                <button onClick={() => setStep(5)} style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 50, padding: '12px 28px', color: 'rgba(255,255,255,0.6)',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem'
                }}>I'm ready to sleep 🌙</button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <motion.div
                  animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: '5rem', marginBottom: 24 }}
                >🌙</motion.div>
                <h2 style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: '1.6rem', marginBottom: 12 }}>
                  Goodnight 💜
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 320, margin: '0 auto 32px' }}>
                  You did something kind for yourself tonight. Rest now. Tomorrow will take care of itself.
                </p>
                <button onClick={() => { setStep(0); setStory('') }} style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 50,
                  padding: '10px 24px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif', fontSize: '0.85rem'
                }}>Start over</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const SOUNDS = [
  { id: 'rain', label: 'Rain', emoji: '🌧️', color: '#b3e5fc' },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', color: '#81d4fa' },
  { id: 'forest', label: 'Forest', emoji: '🌲', color: '#b2c9b2' },
  { id: 'whitenoise', label: 'White Noise', emoji: '🌫️', color: '#e0e0e0' },
  { id: 'cafe', label: 'Café', emoji: '☕', color: '#d7a98f' },
  { id: 'fire', label: 'Fireplace', emoji: '🔥', color: '#ffb74d' },
]

// Generate ambient sounds using Web Audio API
function createAudioContext() {
  return new (window.AudioContext || window.webkitAudioContext)()
}

function generateRain(ctx) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 800
  filter.Q.value = 0.3
  source.connect(filter)
  return { source, output: filter }
}

function generateOcean(ctx) {
  const bufferSize = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let phase = 0
  for (let i = 0; i < bufferSize; i++) {
    const wave = Math.sin(2 * Math.PI * 0.2 * i / ctx.sampleRate)
    data[i] = (Math.random() * 2 - 1) * (0.3 + 0.7 * Math.max(0, wave))
    phase += 0.0001
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600
  source.connect(filter)
  return { source, output: filter }
}

function generateWhiteNoise(ctx) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  return { source, output: source }
}

function generateForest(ctx) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.3
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2000
  filter.Q.value = 0.5
  source.connect(filter)
  return { source, output: filter }
}

function generateCafe(ctx) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.25
  }
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'peaking'
  filter.frequency.value = 1200
  filter.gain.value = 6
  source.connect(filter)
  return { source, output: filter }
}

function generateFire(ctx) {
  const bufferSize = ctx.sampleRate * 2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.4
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 400
  source.connect(filter)
  return { source, output: filter }
}

const GENERATORS = { rain: generateRain, ocean: generateOcean, whitenoise: generateWhiteNoise, forest: generateForest, cafe: generateCafe, fire: generateFire }

export default function CalmCorner() {
  const navigate = useNavigate()
  const [volumes, setVolumes] = useState({})
  const audioCtxRef = useRef(null)
  const nodesRef = useRef({})
  const gainNodesRef = useRef({})

  const getCtx = () => {
    if (!audioCtxRef.current) audioCtxRef.current = createAudioContext()
    return audioCtxRef.current
  }

  const toggleSound = (id) => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()

    if (nodesRef.current[id]) {
      // Stop
      try { nodesRef.current[id].source.stop() } catch {}
      gainNodesRef.current[id]?.disconnect()
      delete nodesRef.current[id]
      delete gainNodesRef.current[id]
      setVolumes(prev => { const next = { ...prev }; delete next[id]; return next })
    } else {
      // Start
      const gen = GENERATORS[id]
      if (!gen) return
      const { source, output } = gen(ctx)
      const gainNode = ctx.createGain()
      gainNode.gain.value = 0.5
      output.connect(gainNode)
      gainNode.connect(ctx.destination)
      source.start()
      nodesRef.current[id] = { source, output }
      gainNodesRef.current[id] = gainNode
      setVolumes(prev => ({ ...prev, [id]: 50 }))
    }
  }

  const changeVolume = (id, vol) => {
    const pct = vol / 100
    if (gainNodesRef.current[id]) gainNodesRef.current[id].gain.value = pct
    setVolumes(prev => ({ ...prev, [id]: vol }))
  }

  useEffect(() => () => {
    Object.values(nodesRef.current).forEach(n => { try { n.source.stop() } catch {} })
    audioCtxRef.current?.close()
  }, [])

  const activeSounds = Object.keys(volumes)
  const soundData = SOUNDS.find(s => s.id === activeSounds[0])

  return (
    <div style={{
      minHeight: '100vh', paddingBottom: 80,
      background: activeSounds.length > 0
        ? `linear-gradient(160deg, ${soundData?.color}40 0%, #f5f0ff 100%)`
        : 'linear-gradient(160deg, #d4e8d4, #f5f0ff)'
    }}>
      <div style={{ padding: '16px 20px' }}>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.7)', border: 'none', borderRadius: 12,
          padding: '8px 16px', cursor: 'pointer', color: '#7a6e8a',
          fontFamily: 'Nunito, sans-serif', fontWeight: 600, fontSize: '0.9rem'
        }}>← Home</button>
      </div>

      <div className="page-container">
        <div className="page-header">
          <h1>🎵 Calm Corner</h1>
          <p>Mix your perfect ambient soundscape</p>
        </div>

        {activeSounds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center', marginBottom: 24, padding: '12px',
              background: 'rgba(255,255,255,0.6)', borderRadius: 16,
              fontSize: '0.85rem', color: '#7a6e8a'
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🎵
            </motion.span>
            {' '}Now playing: {activeSounds.map(id => SOUNDS.find(s => s.id === id)?.emoji).join(' ')} {activeSounds.map(id => SOUNDS.find(s => s.id === id)?.label).join(', ')}
          </motion.div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {SOUNDS.map(sound => {
            const isActive = sound.id in volumes
            const vol = volumes[sound.id] || 50
            return (
              <motion.div
                key={sound.id}
                whileHover={{ y: -2 }}
                style={{
                  background: isActive ? `${sound.color}30` : 'white',
                  border: isActive ? `2px solid ${sound.color}` : '2px solid transparent',
                  borderRadius: 20, padding: '18px 16px',
                  boxShadow: isActive ? `0 4px 20px ${sound.color}60` : '0 4px 16px rgba(180,150,200,0.1)',
                  transition: 'all 0.25s ease'
                }}
              >
                <button
                  onClick={() => toggleSound(sound.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', padding: 0 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                      style={{
                        width: 44, height: 44, borderRadius: '50%',
                        background: isActive ? sound.color : '#f5f0ff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0
                      }}
                    >
                      {sound.emoji}
                    </motion.div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#4a4060' }}>{sound.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#a89ebb' }}>{isActive ? 'Playing' : 'Tap to play'}</div>
                    </div>
                  </div>
                </button>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: 12 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.75rem' }}>🔈</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={vol}
                        onChange={e => changeVolume(sound.id, parseInt(e.target.value))}
                        style={{
                          flex: 1, accentColor: sound.color, height: 4,
                          cursor: 'pointer', WebkitAppearance: 'none'
                        }}
                      />
                      <span style={{ fontSize: '0.75rem' }}>🔊</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 28, color: '#b0a8c0', fontSize: '0.8rem' }}>
          Mix multiple sounds together for your perfect atmosphere ✨
        </div>
      </div>
    </div>
  )
}

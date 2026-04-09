import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { callClaude } from '../api'

const CARD_COLORS = ['#D4770A', '#C0392B', '#7A9E7A', '#E8A020', '#A93226', '#D4770A', '#C0392B', '#E8A020']
const CARD_BG = ['#FFF8F0', '#FFF0EE', '#F0F8F0', '#FFFBF0', '#FFF0EE', '#FFF8F0', '#FFF0EE', '#FFFBF0']

const STARTER_CARDS = [
  { id: 's1', front: 'When I feel anxious...', back: 'I will take 3 slow breaths and remind myself: this feeling will pass.', color: '#D4770A', bg: '#FFF8F0' },
  { id: 's2', front: 'When I feel overwhelmed...', back: 'I will pick just one small thing to do and let the rest wait.', color: '#C0392B', bg: '#FFF0EE' },
  { id: 's3', front: 'When I feel alone...', back: "I will reach out to one person — even just a text saying I'm thinking of them.", color: '#7A9E7A', bg: '#F0F8F0' },
]

export default function CopingCards() {
  const navigate = useNavigate()
  const [cards, setCards] = useState(() => {
    const stored = localStorage.getItem('coping_cards')
    return stored ? JSON.parse(stored) : STARTER_CARDS
  })
  const [view, setView] = useState('deck') // deck | draw | edit | new | suggest
  const [drawnCard, setDrawnCard] = useState(null)
  const [flipped, setFlipped] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)

  const save = (updated) => {
    setCards(updated)
    localStorage.setItem('coping_cards', JSON.stringify(updated))
  }

  const drawRandom = () => {
    const card = cards[Math.floor(Math.random() * cards.length)]
    setDrawnCard(card)
    setFlipped(false)
    setView('draw')
  }

  const addCard = () => {
    if (!front.trim() || !back.trim()) return
    const idx = cards.length % CARD_COLORS.length
    const card = {
      id: Date.now(),
      front: front.trim(),
      back: back.trim(),
      color: CARD_COLORS[idx],
      bg: CARD_BG[idx],
    }
    save([card, ...cards])
    setFront('')
    setBack('')
    setView('deck')
  }

  const deleteCard = (id) => {
    save(cards.filter(c => c.id !== id))
  }

  const startEdit = (card) => {
    setEditCard(card)
    setFront(card.front)
    setBack(card.back)
    setView('edit')
  }

  const saveEdit = () => {
    const updated = cards.map(c => c.id === editCard.id ? { ...c, front: front.trim(), back: back.trim() } : c)
    save(updated)
    setView('deck')
  }

  const getSuggestions = async () => {
    setSuggestLoading(true)
    setView('suggest')
    try {
      const text = await callClaude(
        'Generate 4 personal coping strategy cards for someone with anxiety and depression. Each card should have a "trigger" (when I feel...) and a "coping strategy" (I will...). Format as: TRIGGER: [text] | STRATEGY: [text]. Put each card on its own line.',
        null, 500
      )
      const parsed = text.split('\n').filter(l => l.includes('TRIGGER:') && l.includes('STRATEGY:')).map((l, i) => {
        const [triggerPart, stratPart] = l.split('|')
        return {
          id: `sug-${i}`,
          front: triggerPart?.replace('TRIGGER:', '').trim() || 'When I feel overwhelmed...',
          back: stratPart?.replace('STRATEGY:', '').trim() || 'I will pause and breathe.',
          color: CARD_COLORS[i % CARD_COLORS.length],
          bg: CARD_BG[i % CARD_BG.length],
        }
      }).filter(c => c.front && c.back)
      setSuggestions(parsed.length > 0 ? parsed : [
        { id: 'sug-0', front: 'When I feel anxious about the future...', back: 'I will focus only on this moment and ask: what is the one small thing I can do right now?', color: '#D4770A', bg: '#FFF8F0' },
        { id: 'sug-1', front: 'When I feel like a burden to others...', back: 'I will remember that my presence adds value, and that reaching out is a gift to those who love me.', color: '#C0392B', bg: '#FFF0EE' },
      ])
    } catch {
      setSuggestions([
        { id: 'sug-0', front: 'When I feel anxious about the future...', back: 'I will focus only on this moment and ask: what is the one small thing I can do right now?', color: '#D4770A', bg: '#FFF8F0' },
        { id: 'sug-1', front: 'When I feel like a burden to others...', back: 'I will remember that reaching out is a gift to those who care about me.', color: '#C0392B', bg: '#FFF0EE' },
      ])
    }
    setSuggestLoading(false)
  }

  const addSuggestion = (card) => {
    save([{ ...card, id: Date.now() }, ...cards])
    setSuggestions(prev => prev.filter(s => s.id !== card.id))
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#FAF3E0' }}>
      <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => view !== 'deck' ? setView('deck') : navigate('/')} className="back-btn">
          ← {view !== 'deck' ? 'Back' : 'Home'}
        </button>
        {view === 'deck' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setFront(''); setBack(''); setView('new') }} className="back-btn">+ New</button>
            <button onClick={getSuggestions} className="back-btn">✨ Suggest</button>
          </div>
        )}
      </div>

      <div className="page-container">
        <AnimatePresence mode="wait">
          {view === 'deck' && (
            <motion.div key="deck" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>💪 Coping Cards</h1>
                <p>Your personal toolkit for hard moments</p>
              </div>

              {cards.length > 0 && (
                <button onClick={drawRandom} className="btn btn-primary" style={{ width: '100%', marginBottom: 20, fontSize: '1rem', padding: '14px' }}>
                  🃏 Draw a Random Card
                </button>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map(card => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: card.bg || '#FFF8F0',
                      borderLeft: `4px solid ${card.color || '#D4770A'}`,
                      border: '1px solid #F0E6D0',
                      borderLeftColor: card.color || '#D4770A',
                      borderLeftWidth: 4,
                      borderRadius: 16, padding: '16px 18px',
                      boxShadow: '0 2px 10px rgba(180,120,60,0.07)'
                    }}
                  >
                    <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C', marginBottom: 6, fontSize: '0.9rem' }}>{card.front}</p>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.85rem', lineHeight: 1.6 }}>{card.back}</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <button onClick={() => startEdit(card)} style={{
                        background: 'none', border: 'none', color: '#7A6A5A', cursor: 'pointer',
                        fontSize: '0.78rem', textDecoration: 'underline', fontFamily: 'Inter, sans-serif'
                      }}>Edit</button>
                      <button onClick={() => deleteCard(card.id)} style={{
                        background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer',
                        fontSize: '0.78rem', textDecoration: 'underline', fontFamily: 'Inter, sans-serif'
                      }}>Delete</button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {cards.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', marginBottom: 16 }}>No cards yet. Create your first or get AI suggestions!</p>
                  <button onClick={getSuggestions} className="btn btn-primary">✨ Get Suggestions</button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'draw' && drawnCard && (
            <motion.div key="draw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ textAlign: 'center' }}>
              <div className="page-header">
                <h1>🃏 Draw a Card</h1>
                <p>Tap the card to flip it</p>
              </div>

              {/* Card flip */}
              <div
                onClick={() => setFlipped(f => !f)}
                style={{ perspective: 1000, cursor: 'pointer', maxWidth: 340, margin: '0 auto 32px' }}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  style={{ position: 'relative', transformStyle: 'preserve-3d', height: 200 }}
                >
                  {/* Front */}
                  <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    background: drawnCard.bg || '#FFF8F0',
                    border: `2px solid ${drawnCard.color || '#D4770A'}`,
                    borderRadius: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
                    boxShadow: '0 12px 40px rgba(180,120,60,0.12)'
                  }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#2C2C2C', fontSize: '1.15rem', lineHeight: 1.5, textAlign: 'center' }}>
                      {drawnCard.front}
                    </p>
                  </div>
                  {/* Back */}
                  <div style={{
                    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    background: 'white', borderRadius: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28,
                    boxShadow: '0 12px 40px rgba(180,120,60,0.12)',
                    border: `2px solid ${drawnCard.color || '#D4770A'}`
                  }}>
                    <p style={{ fontFamily: 'Inter, sans-serif', color: '#2C2C2C', fontSize: '1rem', lineHeight: 1.75, textAlign: 'center' }}>
                      {drawnCard.back}
                    </p>
                  </div>
                </motion.div>
              </div>

              <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.8rem', marginBottom: 24 }}>
                {flipped ? 'Your coping strategy ✨' : 'Tap to reveal your strategy'}
              </p>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button onClick={drawRandom} className="btn btn-primary">Draw Another</button>
                <button onClick={() => setView('deck')} className="btn btn-ghost">Back to Deck</button>
              </div>
            </motion.div>
          )}

          {(view === 'new' || view === 'edit') && (
            <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>{view === 'new' ? '+ New Card' : '✏️ Edit Card'}</h1>
              </div>
              <div className="card">
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C', marginBottom: 8, fontSize: '0.9rem' }}>
                    When I feel... (front of card)
                  </label>
                  <textarea value={front} onChange={e => setFront(e.target.value)}
                    placeholder="e.g. When I feel overwhelmed by everything at once..."
                    rows={3} autoFocus />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C', marginBottom: 8, fontSize: '0.9rem' }}>
                    I will... (back of card)
                  </label>
                  <textarea value={back} onChange={e => setBack(e.target.value)}
                    placeholder="e.g. I will pick just one small thing and let the rest wait."
                    rows={3} />
                </div>
                <button onClick={view === 'new' ? addCard : saveEdit}
                  disabled={!front.trim() || !back.trim()}
                  className="btn btn-primary" style={{ width: '100%' }}>
                  {view === 'new' ? 'Add to Deck' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          )}

          {view === 'suggest' && (
            <motion.div key="suggest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="page-header">
                <h1>✨ AI Suggestions</h1>
                <p>Add any that feel right for you</p>
              </div>
              {suggestLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div className="ai-loading" style={{ justifyContent: 'center' }}>
                    <div className="dots-loading"><span/><span/><span/></div>
                    <span>Crafting personalized cards...</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {suggestions.map(card => (
                    <div key={card.id} style={{
                      background: card.bg || '#FFF8F0',
                      border: '1px solid #F0E6D0',
                      borderLeft: `4px solid ${card.color || '#D4770A'}`,
                      borderRadius: 16, padding: '16px 18px'
                    }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#2C2C2C', marginBottom: 6, fontSize: '0.9rem' }}>{card.front}</p>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12 }}>{card.back}</p>
                      <button onClick={() => addSuggestion(card)} className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 18px' }}>
                        + Add to my deck
                      </button>
                    </div>
                  ))}
                  {suggestions.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: 32 }}>
                      <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A6A5A' }}>All suggestions added to your deck!</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

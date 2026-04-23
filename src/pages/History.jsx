import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sociologiaWordsCompact as sociologiaWords, frenchWords, russianWords } from '../data/words'

const allWords = [...sociologiaWords, ...frenchWords, ...russianWords]

function getWordById(id) {
  return allWords.find((w) => w.id === id) ?? null
}

const STATUS_LABELS = {
  known: { label: 'Ja sei', className: 'status-known' },
  review: { label: 'Revisar', className: 'status-review' },
  seen: { label: 'Vista', className: 'status-seen' },
}

function getTrackMeta(category) {
  const isSoc = category === 'sociologia'
  const isRu = category === 'russo'
  return {
    accent: isSoc ? 'var(--soc)' : isRu ? 'var(--ru)' : 'var(--fr)',
    tagBg: isSoc ? 'var(--soc-light)' : isRu ? 'var(--ru-light)' : 'var(--fr-light)',
    tagColor: isSoc ? 'var(--soc)' : isRu ? 'var(--ru)' : 'var(--fr)',
    label: isSoc ? 'Sociologia' : isRu ? 'Russo' : 'Francês',
  }
}

function WordModal({ entry, onClose }) {
  const { word, status } = entry
  const meta = getTrackMeta(word.category)

  return (
    <motion.div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
      }} />

      <motion.div
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 580,
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        initial={{ scale: 0.93, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ height: 3, background: meta.accent }} />

        <div style={{ padding: '32px 36px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '4px 10px',
              borderRadius: 99, background: meta.tagBg, color: meta.tagColor,
            }}>
              {meta.label}
            </span>
            <button
              onClick={onClose}
              style={{
                border: 'none', background: 'var(--bg-2)', cursor: 'pointer',
                width: 28, height: 28, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'var(--text-3)',
              }}
            >
              x
            </button>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(36px, 6vw, 52px)',
            fontWeight: 400, lineHeight: 1.05,
            letterSpacing: '-0.03em',
            color: 'var(--text-1)', marginBottom: 8,
          }}>
            {word.word}
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--text-2)', fontWeight: 300 }}>
              {word.pronunciation}
            </span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--text-3)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{word.etymology}</span>
          </div>

          <div style={{ height: 1, background: 'var(--border)', marginBottom: 20 }} />

          <div style={{ marginBottom: 18 }}>
            <p className="card-section-label">Definicao</p>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-1)' }}>
              {word.definition}
            </p>
          </div>

          <div style={{ marginBottom: 22 }}>
            <p className="card-section-label">Exemplo</p>
            <p style={{
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)', fontWeight: 300,
              paddingLeft: 14, borderLeft: '2px solid var(--border-strong)',
            }}>
              {word.example}
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 16, borderTop: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%', background: meta.tagBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: meta.tagColor, fontWeight: 600,
              }}>
                {word.author[0]}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{word.author}</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{word.year}</p>
              </div>
            </div>
            {status && (
              <span className={`status-badge ${STATUS_LABELS[status]?.className ?? 'status-seen'}`}>
                {STATUS_LABELS[status]?.label ?? 'Vista'}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function WordListCard({ entry, onClick, index }) {
  const { word, status } = entry
  const meta = getTrackMeta(word.category)

  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 0.98, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        all: 'unset', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        textAlign: 'left',
      }}
    >
      <div style={{ height: 3, background: meta.accent, flexShrink: 0 }} />

      <div style={{ padding: '18px 20px 16px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', padding: '3px 8px',
            borderRadius: 99, background: meta.tagBg, color: meta.tagColor,
          }}>
            {meta.label}
          </span>
          {status && (
            <span className={`status-badge ${STATUS_LABELS[status]?.className ?? 'status-seen'}`} style={{ fontSize: 10 }}>
              {STATUS_LABELS[status]?.label ?? 'Vista'}
            </span>
          )}
        </div>

        <p style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 22, fontWeight: 400, lineHeight: 1.1,
          letterSpacing: '-0.02em', color: 'var(--text-1)',
          marginBottom: 4,
        }}>
          {word.word}
        </p>

        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 10 }}>
          {word.author}
        </p>

        <p style={{
          fontSize: 12, lineHeight: 1.6,
          color: 'var(--text-2)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {word.definition}
        </p>
      </div>
    </motion.button>
  )
}

export default function History({ wordStatus, streakData = {} }) {
  const [search, setSearch] = useState('')
  const [trackFilter, setTrackFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const seenEntries = Object.entries(wordStatus)
    .map(([id, status]) => {
      const word = getWordById(id)
      return word ? { word, status } : null
    })
    .filter(Boolean)

  const total = seenEntries.length
  const known = seenEntries.filter((e) => e.status === 'known').length
  const review = seenEntries.filter((e) => e.status === 'review').length
  const seen = seenEntries.filter((e) => e.status === 'seen').length

  const filtered = seenEntries
    .filter((e) => trackFilter === 'all' || e.word.category === trackFilter)
    .filter((e) => statusFilter === 'all' || e.status === statusFilter)
    .filter((e) =>
      search === '' ||
      e.word.word.toLowerCase().includes(search.toLowerCase()) ||
      e.word.author.toLowerCase().includes(search.toLowerCase()) ||
      e.word.definition.toLowerCase().includes(search.toLowerCase())
    )

  const TabBtn = ({ value, current, onChange, children }) => (
    <button
      onClick={() => onChange(value)}
      style={{
        border: 'none', cursor: 'pointer', padding: '6px 13px',
        borderRadius: 99, fontSize: 12, fontWeight: 500,
        fontFamily: 'var(--font-sans)',
        transition: 'all 120ms',
        background: current === value ? 'var(--accent-light)' : 'transparent',
        color: current === value ? 'var(--accent)' : 'var(--text-3)',
        boxShadow: current === value ? 'inset 0 0 0 1px var(--accent-mid)' : 'none',
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="page">
      <div className="container">
        <div className="page-top">
          <h2 className="page-title">Biblioteca</h2>
          <p className="page-subtitle">Todas as palavras que voce ja encontrou.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}
        >
          {[
            { key: 'sociologia', label: 'Sociologia', accent: 'var(--soc)' },
            { key: 'frances', label: 'Francês', accent: 'var(--fr)' },
            { key: 'russo', label: 'Russo', accent: 'var(--ru)' },
          ].map(({ key, label, accent }) => {
            const data = streakData[key] ?? { streak: 0, lastDate: null, longest: 0 }
            return (
              <div key={key} style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderTop: `3px solid ${accent}`,
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: accent, marginBottom: 8,
                }}>
                  {label}
                </p>
                <p style={{
                  fontFamily: 'var(--font-serif)', fontSize: 30,
                  fontWeight: 400, lineHeight: 1,
                  color: 'var(--text-1)', letterSpacing: '-0.03em',
                }}>
                  {data.streak}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                  dias seguidos
                </p>
                {(data.longest ?? 0) > 0 && (
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 5 }}>
                    max. {data.longest}
                  </p>
                )}
              </div>
            )
          })}
        </motion.div>

        {total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.35 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 24 }}
          >
            {[
              { n: total, label: 'vistas', color: 'var(--accent)', background: 'var(--accent-light)', borderColor: 'var(--accent-mid)' },
              { n: known, label: 'dominadas', color: 'var(--text-1)', background: 'var(--surface)', borderColor: 'var(--border)' },
              { n: review, label: 'revisar', color: 'var(--fr)', background: 'var(--fr-light)', borderColor: 'var(--fr)' },
            ].map(({ n, label, color, background, borderColor }) => (
              <div key={label} style={{ background, border: `1px solid ${borderColor}`, borderRadius: 'var(--radius-md)', padding: '14px 16px', boxShadow: 'var(--shadow-sm)' }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, lineHeight: 1, color, letterSpacing: '-0.03em' }}>
                  {n}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }} style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            placeholder="Buscar por palavra, autor ou definicao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-sans)', fontSize: 14,
              color: 'var(--text-1)',
              outline: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 99, padding: 3, gap: 2 }}>
            <TabBtn value="all" current={trackFilter} onChange={setTrackFilter}>Todas</TabBtn>
            <TabBtn value="sociologia" current={trackFilter} onChange={setTrackFilter}>Sociologia</TabBtn>
            <TabBtn value="frances" current={trackFilter} onChange={setTrackFilter}>Francês</TabBtn>
            <TabBtn value="russo" current={trackFilter} onChange={setTrackFilter}>Russo</TabBtn>
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 99, padding: 3, gap: 2 }}>
            <TabBtn value="all" current={statusFilter} onChange={setStatusFilter}>Todas</TabBtn>
            <TabBtn value="known" current={statusFilter} onChange={setStatusFilter}>Ja sei</TabBtn>
            <TabBtn value="review" current={statusFilter} onChange={setStatusFilter}>Revisar</TabBtn>
          </div>
        </motion.div>

        {total === 0 ? (
          <div className="empty-state">
            <span className="empty-state-glyph">P</span>
            <p className="empty-state-text">Nenhuma palavra vista ainda.<br />Volte para a tela inicial: a palavra do dia te espera.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-glyph">P</span>
            <p className="empty-state-text">Nenhuma palavra encontrada com esses filtros.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>
              {filtered.length} {filtered.length === 1 ? 'palavra' : 'palavras'}
            </p>

            <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
              {filtered.map((entry, i) => (
                <WordListCard key={entry.word.id} entry={entry} index={i} onClick={() => setSelected(entry)} />
              ))}
            </motion.div>
          </>
        )}
      </div>

      <AnimatePresence>
        {selected && <WordModal entry={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  )
}

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
      className="history-list-card"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 0.985, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{ '--history-card-accent': meta.accent }}
    >
      <div className="history-list-card-line" />

      <div className="history-list-card-body">
        <div className="history-list-card-top">
          <span
            style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '3px 8px',
              borderRadius: 99, background: meta.tagBg, color: meta.tagColor,
            }}
          >
            {meta.label}
          </span>
          {status && (
            <span className={`status-badge ${STATUS_LABELS[status]?.className ?? 'status-seen'}`} style={{ fontSize: 10 }}>
              {STATUS_LABELS[status]?.label ?? 'Vista'}
            </span>
          )}
        </div>

        <p className="history-list-card-title">
          {word.word}
        </p>

        <p className="history-list-card-author">
          {word.author}
        </p>

        <p className="history-list-card-definition">
          {word.definition}
        </p>
      </div>
    </motion.button>
  )
}

function TabBtn({ value, current, onChange, children }) {
  return (
    <button
      className={`history-tab-btn ${current === value ? 'active' : ''}`}
      onClick={() => onChange(value)}
      type="button"
    >
      {children}
    </button>
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
  const completionRate = total > 0 ? Math.round((known / total) * 100) : 0
  const activeTracks = ['sociologia', 'frances', 'russo'].filter((key) => (streakData[key]?.streak ?? 0) > 0).length
  const bestLongest = Math.max(...['sociologia', 'frances', 'russo'].map((key) => streakData[key]?.longest ?? 0), 0)

  const filtered = seenEntries
    .filter((e) => trackFilter === 'all' || e.word.category === trackFilter)
    .filter((e) => statusFilter === 'all' || e.status === statusFilter)
    .filter((e) =>
      search === '' ||
      e.word.word.toLowerCase().includes(search.toLowerCase()) ||
      e.word.author.toLowerCase().includes(search.toLowerCase()) ||
      e.word.definition.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="page">
      <div className="container">
        <div className="page-top history-hero">
          <div className="history-hero-copy">
            <p className="history-eyebrow">Arquivo vivo</p>
            <div className="history-hero-head">
              <div>
                <h2 className="page-title">Biblioteca</h2>
                <p className="page-subtitle history-subtitle">Todas as palavras que voce ja encontrou, revisou ou dominou.</p>
              </div>
              <span className="history-hero-pill">
                {total > 0 ? `${completionRate}% dominado` : 'Comece hoje'}
              </span>
            </div>
          </div>

          <div className="history-overview-grid">
            {[
              { value: total, label: 'palavras vistas', tone: 'accent' },
              { value: known, label: 'ja dominadas', tone: 'neutral' },
              { value: bestLongest, label: 'melhor streak', tone: 'accent' },
              { value: activeTracks, label: 'trilhas ativas', tone: 'neutral' },
            ].map(({ value, label, tone }) => (
              <div
                key={label}
                className={`history-overview-card ${tone === 'accent' ? 'accent' : ''}`}
              >
                <p className="history-overview-value">{value}</p>
                <p className="history-overview-label">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          className="history-streak-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {[
            { key: 'sociologia', label: 'Sociologia', accent: 'var(--soc)' },
            { key: 'frances', label: 'Francês', accent: 'var(--fr)' },
            { key: 'russo', label: 'Russo', accent: 'var(--ru)' },
          ].map(({ key, label, accent }) => {
            const data = streakData[key] ?? { streak: 0, lastDate: null, longest: 0 }
            return (
              <div key={key} className="history-streak-card" style={{ '--history-streak-accent': accent }}>
                <p className="history-streak-label" style={{ color: accent }}>
                  {label}
                </p>
                <p className="history-streak-value">
                  {data.streak}
                </p>
                <p className="history-streak-copy">
                  dias seguidos
                </p>
                {(data.longest ?? 0) > 0 && (
                  <p className="history-streak-meta">
                    max. {data.longest}
                  </p>
                )}
              </div>
            )
          })}
        </motion.div>

        {total > 0 && (
          <motion.div
            className="history-metric-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.35 }}
          >
            {[
              { n: total, label: 'vistas', color: 'var(--accent)', background: 'var(--accent-light)', borderColor: 'var(--accent-mid)' },
              { n: known, label: 'dominadas', color: 'var(--text-1)', background: 'var(--surface)', borderColor: 'var(--border)' },
              { n: review, label: 'revisar', color: 'var(--fr)', background: 'var(--fr-light)', borderColor: 'var(--fr)' },
              { n: seen, label: 'anotadas', color: 'var(--text-2)', background: 'var(--bg-2)', borderColor: 'var(--border)' },
            ].map(({ n, label, color, background, borderColor }) => (
              <div key={label} className="history-metric-card" style={{ background, borderColor }}>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400, lineHeight: 1, color, letterSpacing: '-0.03em' }}>
                  {n}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          className="history-toolbar"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
        >
          <input
            type="text"
            placeholder="Buscar por palavra, autor ou definicao..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="history-search"
          />

          <div className="history-filter-row">
            <div className="history-filter-pills">
              <TabBtn value="all" current={trackFilter} onChange={setTrackFilter}>Todas</TabBtn>
              <TabBtn value="sociologia" current={trackFilter} onChange={setTrackFilter}>Sociologia</TabBtn>
              <TabBtn value="frances" current={trackFilter} onChange={setTrackFilter}>Francês</TabBtn>
              <TabBtn value="russo" current={trackFilter} onChange={setTrackFilter}>Russo</TabBtn>
            </div>

            <div className="history-filter-pills">
              <TabBtn value="all" current={statusFilter} onChange={setStatusFilter}>Todas</TabBtn>
              <TabBtn value="known" current={statusFilter} onChange={setStatusFilter}>Ja sei</TabBtn>
              <TabBtn value="review" current={statusFilter} onChange={setStatusFilter}>Revisar</TabBtn>
            </div>
          </div>
        </motion.div>

        {total === 0 ? (
          <div className="empty-state history-empty-state">
            <span className="empty-state-glyph">PP</span>
            <p className="empty-state-text">Nenhuma palavra vista ainda.<br />Volte para a tela inicial: a palavra do dia te espera.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state history-empty-state">
            <span className="empty-state-glyph">PP</span>
            <p className="empty-state-text">Nenhuma palavra encontrada com esses filtros.</p>
          </div>
        ) : (
          <>
            <p className="history-results-meta">
              {filtered.length} {filtered.length === 1 ? 'palavra' : 'palavras'} na selecao atual
            </p>

            <motion.div className="history-results-grid">
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

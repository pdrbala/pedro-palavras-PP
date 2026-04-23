import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getNotebookSummary } from '../data/words'

const flipSpring = { type: 'spring', stiffness: 80, damping: 18 }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay },
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
}

function getTrackMeta(track) {
  const isRussian = track === 'russo'
  const isSociology = track === 'sociologia'

  return {
    accent: isSociology ? 'var(--soc)' : isRussian ? 'var(--ru)' : 'var(--fr)',
    tagBg: isSociology ? 'var(--soc-light)' : isRussian ? 'var(--ru-light)' : 'var(--fr-light)',
    tagColor: isSociology ? 'var(--soc)' : isRussian ? 'var(--ru)' : 'var(--fr)',
    trackLabel: isSociology ? 'Sociologia' : isRussian ? 'Russo' : 'Francês',
  }
}

function QuizOption({ option, accent, quizAnswered, quizSelection, onSelectOption }) {
  const isSelected = quizSelection === option.id
  const isWrongSelection = quizAnswered && isSelected && !option.isCorrect
  const showCorrect = quizAnswered && option.isCorrect

  const borderColor =
    isWrongSelection ? 'var(--fr)' :
    showCorrect ? accent :
    isSelected ? 'var(--border-strong)' :
    'var(--border)'

  const background =
    isWrongSelection ? 'var(--fr-light)' :
    showCorrect ? 'var(--accent-light)' :
    isSelected ? 'var(--bg-2)' :
    'var(--surface)'

  const textColor =
    isWrongSelection ? 'var(--fr)' :
    showCorrect ? accent :
    'var(--text-1)'

  return (
    <motion.button
      type="button"
      disabled={quizAnswered}
      onClick={() => onSelectOption(option)}
      whileHover={quizAnswered ? undefined : { y: -1, scale: 0.995 }}
      whileTap={quizAnswered ? undefined : { scale: 0.985 }}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${borderColor}`,
        background,
        padding: '14px 16px',
        cursor: quizAnswered ? 'default' : 'pointer',
        transition: 'all 160ms ease',
        textAlign: 'left',
        boxShadow: showCorrect || isWrongSelection ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: showCorrect ? accent : isWrongSelection ? 'var(--fr)' : 'var(--bg-2)',
          color: showCorrect || isWrongSelection ? 'var(--surface)' : 'var(--text-2)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {option.letter}
      </span>

      <span style={{ fontSize: 14, lineHeight: 1.45, color: textColor }}>
        {option.label}
      </span>
    </motion.button>
  )
}

function QuizSummary({ quizScore, quizTotal }) {
  const summaryText =
    quizScore === quizTotal
      ? 'Voce acertou tudo.'
      : quizScore >= Math.ceil(quizTotal * 0.7)
        ? 'Mandou bem.'
        : 'Vale mais uma rodada para fixar melhor.'

  return (
    <motion.div style={{ marginBottom: 12 }} {...fadeUp(0.18)}>
      <motion.h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(34px, 6vw, 52px)',
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          color: 'var(--text-1)',
          marginBottom: 12,
        }}
        {...fadeUp(0.05)}
      >
        Resultado final
      </motion.h1>

      <div
        style={{
          padding: '18px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-light)',
          border: '1px solid var(--accent-mid)',
          marginBottom: 18,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            marginBottom: 8,
          }}
        >
          Sociologia
        </p>
        <p style={{ fontSize: 30, lineHeight: 1, color: 'var(--text-1)', marginBottom: 10 }}>
          {quizScore}/{quizTotal}
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-2)' }}>{summaryText}</p>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>
        As perguntas saem em ordem aleatoria para evitar decorar a sequencia.
      </p>
    </motion.div>
  )
}

export default function WordCard({
  word,
  track,
  dateStr,
  status,
  quizMode = false,
  notebookMode = false,
  quizQuestion,
  quizSelection,
  quizAnswered = false,
  quizCompleted = false,
  quizScore = 0,
  quizTotal = 0,
  quizProgress = null,
  onSelectOption,
}) {
  const previewMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview')
  const [revealed, setRevealed] = useState(previewMode)
  const [notebookExpanded, setNotebookExpanded] = useState(false)

  useEffect(() => {
    if (previewMode) {
      setRevealed(true)
      return undefined
    }

    setRevealed(false)
    const timer = setTimeout(() => setRevealed(true), 700)
    return () => clearTimeout(timer)
  }, [word?.id, quizCompleted, previewMode])

  useEffect(() => {
    setNotebookExpanded(false)
  }, [word?.id, notebookMode])

  if (!word && !quizCompleted) return null

  const { accent, tagBg, tagColor, trackLabel } = getTrackMeta(track)
  const selectedOption = quizQuestion?.options.find((option) => option.id === quizSelection) ?? null
  const notebookSummary = word ? getNotebookSummary(word) : ''
  const showQuiz = quizMode && quizQuestion && !quizCompleted
  const showNotebook = notebookMode && !showQuiz && !quizCompleted

  return (
    <div style={{ perspective: '1200px', width: '100%', margin: '16px 0 24px' }}>
      <motion.div
        style={{ position: 'relative', width: '100%', transformStyle: 'preserve-3d' }}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: revealed ? 0 : 180 }}
        transition={flipSpring}
      >
        <div
          className="word-card-face"
          style={{
            position: 'relative',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            padding: '40px 40px 36px',
            minHeight: 380,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              background: accent,
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              transition: 'background 240ms ease',
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 28,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: 99,
                background: tagBg,
                color: tagColor,
              }}
            >
              {trackLabel}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{formatDate(dateStr)}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${word?.id ?? 'quiz'}-${quizCompleted ? 'done' : 'active'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {quizCompleted ? (
                <QuizSummary quizScore={quizScore} quizTotal={quizTotal} />
              ) : showQuiz ? (
                <motion.div style={{ marginBottom: 12 }} {...fadeUp(0.18)}>
                  <motion.h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(34px, 6vw, 52px)',
                      fontWeight: 400,
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-1)',
                      marginBottom: 12,
                    }}
                    {...fadeUp(0.05)}
                  >
                    Desafio do dia
                  </motion.h1>

                  {quizProgress?.total > 1 && (
                    <motion.div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 99,
                        background: 'var(--accent-light)',
                        color: accent,
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        marginBottom: 22,
                      }}
                      {...fadeUp(0.08)}
                    >
                      Pergunta {quizProgress.current} de {quizProgress.total}
                    </motion.div>
                  )}

                  <motion.div
                    style={{ height: 1, background: 'var(--border)', marginBottom: 22 }}
                    {...fadeUp(0.14)}
                  />

                  <div style={{ marginBottom: 18 }}>
                    <p
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--accent)',
                        marginBottom: 7,
                      }}
                    >
                      Pergunta
                    </p>
                    <p style={{ fontSize: 18, lineHeight: 1.45, color: 'var(--text-1)', marginBottom: 10 }}>
                      {quizQuestion.question}
                    </p>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-2)' }}>
                      {quizQuestion.prompt}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    {quizQuestion.options.map((option) => (
                      <QuizOption
                        key={option.id}
                        option={option}
                        accent={accent}
                        quizAnswered={quizAnswered}
                        quizSelection={quizSelection}
                        onSelectOption={onSelectOption}
                      />
                    ))}
                  </div>

                  {quizAnswered && selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        marginTop: 16,
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: selectedOption.isCorrect ? 'var(--accent-light)' : 'var(--fr-light)',
                        border: `1px solid ${selectedOption.isCorrect ? accent : 'var(--fr)'}`,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: selectedOption.isCorrect ? accent : 'var(--fr)',
                          marginBottom: 4,
                        }}
                      >
                        {selectedOption.isCorrect ? 'Acertou.' : 'Quase.'}
                      </p>
                      <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-2)' }}>
                        {selectedOption.isCorrect
                          ? `A resposta certa era ${word.word}.`
                          : `A correta era ${word.word}.`}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <>
                  <motion.h1
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 'clamp(42px, 7vw, 62px)',
                      fontWeight: 400,
                      lineHeight: 1.05,
                      letterSpacing: '-0.03em',
                      color: 'var(--text-1)',
                      marginBottom: word.subtitle ? 4 : 8,
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                    }}
                    {...fadeUp(0.05)}
                  >
                    {word.word}
                  </motion.h1>

                  {word.subtitle && (
                    <motion.p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontStyle: 'italic',
                        fontSize: 'clamp(18px, 3vw, 24px)',
                        fontWeight: 300,
                        color: tagColor,
                        marginBottom: 8,
                        letterSpacing: '0.01em',
                      }}
                      {...fadeUp(0.08)}
                    >
                      {word.subtitle}
                    </motion.p>
                  )}

                  {!showNotebook && (
                    <motion.div
                      style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}
                      {...fadeUp(0.1)}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontStyle: 'italic',
                          fontSize: 15,
                          color: 'var(--text-2)',
                          fontWeight: 300,
                        }}
                      >
                        {word.pronunciation}
                      </span>
                      <span
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: '50%',
                          background: 'var(--text-3)',
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{word.etymology}</span>
                    </motion.div>
                  )}

                  <motion.div
                    style={{ height: 1, background: 'var(--border)', marginBottom: 22 }}
                    {...fadeUp(0.14)}
                  />

                  {showNotebook ? (
                    <motion.div style={{ marginBottom: 8 }} {...fadeUp(0.18)}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          marginBottom: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                          }}
                        >
                          Modo caderno
                        </p>

                        <motion.button
                          type="button"
                          onClick={() => setNotebookExpanded((current) => !current)}
                          whileTap={{ scale: 0.97 }}
                          style={{
                            border: `1px solid ${notebookExpanded ? 'var(--accent)' : 'var(--border)'}`,
                            background: notebookExpanded ? 'var(--accent-light)' : 'transparent',
                            color: notebookExpanded ? 'var(--accent)' : 'var(--text-2)',
                            borderRadius: 99,
                            padding: '6px 12px',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 160ms ease',
                          }}
                        >
                          {notebookExpanded ? 'Fechar explicacao' : 'Ver explicacao completa'}
                        </motion.button>
                      </div>

                      <p style={{ fontSize: 18, lineHeight: 1.7, color: 'var(--text-1)', marginBottom: notebookExpanded ? 16 : 8 }}>
                        {notebookSummary}
                      </p>

                      {notebookExpanded && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <div
                            style={{
                              padding: '16px 18px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--bg-2)',
                              border: '1px solid var(--border)',
                              marginBottom: 14,
                            }}
                          >
                            <p className="card-section-label">Explicacao</p>
                            <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-1)' }}>
                              {word.definition}
                            </p>
                          </div>

                          <div
                            style={{
                              padding: '16px 18px',
                              borderRadius: 'var(--radius-md)',
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            <p className="card-section-label">Exemplo</p>
                            <p
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontStyle: 'italic',
                                fontSize: 14,
                                lineHeight: 1.7,
                                color: 'var(--text-2)',
                                fontWeight: 300,
                              }}
                            >
                              {word.example}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <motion.div style={{ marginBottom: 20 }} {...fadeUp(0.18)}>
                        <p className="card-section-label">Definicao</p>
                        <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-1)' }}>
                          {word.definition}
                        </p>
                      </motion.div>

                      <motion.div style={{ marginBottom: 8 }} {...fadeUp(0.24)}>
                        <p className="card-section-label">Exemplo</p>
                        <p
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontStyle: 'italic',
                            fontSize: 15,
                            lineHeight: 1.7,
                            color: 'var(--text-2)',
                            fontWeight: 300,
                            paddingLeft: 16,
                            borderLeft: '2px solid var(--border-strong)',
                          }}
                        >
                          {word.example}
                        </p>
                      </motion.div>
                    </>
                  )}
                </>
              )}

              {!quizCompleted && (
                <motion.div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 26,
                    paddingTop: 18,
                    borderTop: '1px solid var(--border)',
                  }}
                  {...fadeUp(0.3)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: tagBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: tagColor,
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {word.author[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-1)' }}>{word.author}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-3)' }}>{word.year}</p>
                    </div>
                  </div>

                  {status && (
                    <span
                      className={`status-badge ${
                        status === 'known' ? 'status-known' :
                        status === 'review' ? 'status-review' :
                        'status-seen'
                      }`}
                    >
                      {status === 'known' ? 'Ja sei' : status === 'review' ? 'Revisar' : 'Vista'}
                    </span>
                  )}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div
          className="word-card-face word-card-back"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accent }} />

          <div style={{ opacity: 0.12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 120,
                fontWeight: 300,
                fontStyle: 'italic',
                color: 'var(--text-1)',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              P
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--text-1)',
              }}
            >
              PedroPalavras
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

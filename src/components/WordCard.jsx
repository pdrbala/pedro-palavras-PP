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
  const feedbackLabel =
    showCorrect ? 'Correta' :
    isWrongSelection ? 'Sua' :
    ''

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
        justifyContent: 'space-between',
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
      <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span
          style={{
            width: 30,
            height: 30,
            borderRadius: 10,
            background: showCorrect ? accent : isWrongSelection ? 'var(--fr)' : 'var(--bg-2)',
            color: showCorrect || isWrongSelection ? 'var(--surface)' : 'var(--text-2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: showCorrect || isWrongSelection ? '0 10px 18px rgba(0,0,0,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {option.letter}
        </span>

        <span style={{ fontSize: 14, lineHeight: 1.45, color: textColor, minWidth: 0 }}>
          {option.label}
        </span>
      </span>

      {feedbackLabel && (
        <span
          style={{
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: showCorrect ? accent : 'var(--fr)',
          }}
        >
          {feedbackLabel}
        </span>
      )}
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
  const wordKicker = track === 'sociologia' ? 'Conceito do dia' : 'Palavra do dia'

  return (
    <div className="word-card-shell" style={{ perspective: '1200px' }}>
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

          <div className="word-card-ornament" aria-hidden="true" />

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
            <span className="word-card-date">{formatDate(dateStr)}</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              className="word-card-main"
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
                  <motion.p className="word-card-kicker" {...fadeUp(0.02)}>
                    {track === 'sociologia' ? 'Quiz final' : 'Quiz rapido'}
                  </motion.p>

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

                  <motion.p className="quiz-intro-copy" {...fadeUp(0.06)}>
                    {track === 'sociologia'
                      ? 'Uma pergunta por conceito, em ordem aleatoria.'
                      : 'Quatro alternativas para validar a palavra atual.'}
                  </motion.p>

                  {quizProgress?.total > 1 && (
                    <motion.div
                      className="quiz-progress-strip"
                      {...fadeUp(0.08)}
                    >
                      <span className="quiz-progress-copy">
                        Pergunta {quizProgress.current} de {quizProgress.total}
                      </span>
                      <span className="quiz-progress-dots" aria-hidden="true">
                        {Array.from({ length: quizProgress.total }).map((_, index) => (
                          <span
                            key={index}
                            className={`quiz-progress-dot ${index < quizProgress.current ? 'active' : ''}`}
                          />
                        ))}
                      </span>
                    </motion.div>
                  )}

                  <motion.div
                    className="word-card-rule"
                    {...fadeUp(0.14)}
                  />

                  <div className="quiz-question-block">
                    <p className="card-section-label word-card-section-label">
                      Pergunta
                    </p>
                    <p className="quiz-question-title">
                      {quizQuestion.question}
                    </p>
                    <p className="quiz-question-prompt">
                      {quizQuestion.prompt}
                    </p>
                  </div>

                  <div className="quiz-option-grid">
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
                      className="quiz-feedback"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        background: selectedOption.isCorrect ? 'var(--accent-light)' : 'var(--fr-light)',
                        borderColor: selectedOption.isCorrect ? accent : 'var(--fr)',
                      }}
                    >
                      <p className="quiz-feedback-title" style={{ color: selectedOption.isCorrect ? accent : 'var(--fr)' }}>
                        {selectedOption.isCorrect ? 'Acertou.' : 'Quase.'}
                      </p>
                      <p className="quiz-feedback-copy">
                        {selectedOption.isCorrect
                          ? `A resposta certa era ${word.word}.`
                          : `A correta era ${word.word}.`}
                      </p>
                      <p className="quiz-feedback-copy quiz-feedback-copy-muted">
                        {word.definition}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <>
                  <motion.p className="word-card-kicker" {...fadeUp(0.02)}>
                    {wordKicker}
                  </motion.p>

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
                      className="word-card-detail-strip"
                      {...fadeUp(0.1)}
                    >
                      <span className="word-card-pronunciation">
                        {word.pronunciation}
                      </span>
                      <span className="word-card-detail-dot" />
                      <span className="word-card-etymology">{word.etymology}</span>
                    </motion.div>
                  )}

                  <motion.div
                    className="word-card-rule"
                    {...fadeUp(0.14)}
                  />

                  {showNotebook ? (
                    <motion.div className="notebook-panel" {...fadeUp(0.18)}>
                      <div className="notebook-panel-head">
                        <p className="card-section-label word-card-section-label">
                          Modo caderno
                        </p>

                        <motion.button
                          type="button"
                          onClick={() => setNotebookExpanded((current) => !current)}
                          whileTap={{ scale: 0.97 }}
                          className={`notebook-toggle ${notebookExpanded ? 'active' : ''}`}
                        >
                          {notebookExpanded ? 'Fechar explicacao' : 'Ver explicacao completa'}
                        </motion.button>
                      </div>

                      <p className="notebook-summary" style={{ marginBottom: notebookExpanded ? 16 : 8 }}>
                        {notebookSummary}
                      </p>

                      {notebookExpanded && (
                        <motion.div
                          className="notebook-expanded"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.22 }}
                        >
                          <div className="notebook-detail-card notebook-detail-card-muted">
                            <p className="card-section-label word-card-section-label">Explicacao</p>
                            <p className="notebook-detail-copy">
                              {word.definition}
                            </p>
                          </div>

                          <div className="notebook-detail-card">
                            <p className="card-section-label word-card-section-label">Exemplo</p>
                            <p className="notebook-example-copy">
                              {word.example}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  ) : (
                    <>
                      <motion.div className="word-card-definition-block" {...fadeUp(0.18)}>
                        <p className="card-section-label word-card-section-label">Definicao</p>
                        <p className="word-card-definition-copy">
                          {word.definition}
                        </p>
                      </motion.div>

                      <motion.div className="word-card-example-block" {...fadeUp(0.24)}>
                        <p className="card-section-label word-card-section-label">Em contexto</p>
                        <p className="word-card-example-copy">
                          {word.example}
                        </p>
                      </motion.div>
                    </>
                  )}
                </>
              )}

              {!quizCompleted && (
                <motion.div
                  className="word-card-footer"
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
              PP
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

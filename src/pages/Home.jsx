import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocalStorage } from '../hooks/useLocalStorage'
import TrackToggle from '../components/TrackToggle'
import WordCard from '../components/WordCard'
import {
  sociologiaWordsCompact as sociologiaWords,
  frenchWords,
  russianWords,
  getStudyWordOfDay,
  getQuizQuestion,
} from '../data/words'

function shuffleItems(items) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]
  }

  return copy
}

function ToggleChip({ active, disabled = false, label, onClick }) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      style={{
        background: active ? 'var(--accent-light)' : 'none',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '4px 11px',
        fontSize: 11,
        fontFamily: 'var(--font-sans)',
        fontWeight: 500,
        color: active ? 'var(--accent)' : 'var(--text-3)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'all 150ms',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </motion.button>
  )
}

export default function Home({
  track,
  setTrack,
  wordStatus,
  onMarkWord,
  focusMode,
  setFocusMode,
}) {
  const [quizMode, setQuizMode] = useState(false)
  const [quizSelection, setQuizSelection] = useState(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [quizSuggestedStatus, setQuizSuggestedStatus] = useState(null)
  const [notebookMode, setNotebookMode] = useLocalStorage('pp-notebook-mode', false)
  const [sociologyQuizDeck, setSociologyQuizDeck] = useState([])
  const [sociologyQuizIndex, setSociologyQuizIndex] = useState(0)
  const [sociologyQuizScore, setSociologyQuizScore] = useState(0)
  const [sociologyQuizCompleted, setSociologyQuizCompleted] = useState(false)

  const words =
    track === 'sociologia' ? sociologiaWords :
    track === 'russo' ? russianWords :
    frenchWords

  const { word: studyWord, dateStr, remaining, reviewCount, source } = getStudyWordOfDay(words, wordStatus)
  const studyStatus = wordStatus[studyWord?.id] ?? null
  const isSociology = track === 'sociologia'
  const allKnown = remaining === 0
  const sociologyQuizLocked = isSociology && !allKnown
  const isSociologyFinalQuiz = quizMode && isSociology && !sociologyQuizLocked
  const activeWord = isSociologyFinalQuiz ? sociologyQuizDeck[sociologyQuizIndex] ?? studyWord : studyWord
  const activeStatus = isSociologyFinalQuiz ? null : studyStatus
  const quizQuestion = quizMode && activeWord ? getQuizQuestion(words, activeWord) : null
  const lastSociologyQuestion = sociologyQuizIndex === sociologyQuizDeck.length - 1

  useEffect(() => {
    if (studyWord && !wordStatus[studyWord.id]) {
      onMarkWord(studyWord.id, track, 'seen')
    }
  }, [studyWord?.id, track])

  useEffect(() => {
    if (quizMode && sociologyQuizLocked) {
      setQuizMode(false)
    }
  }, [quizMode, sociologyQuizLocked])

  useEffect(() => {
    if (!isSociologyFinalQuiz) {
      setSociologyQuizDeck([])
      setSociologyQuizIndex(0)
      setSociologyQuizScore(0)
      setSociologyQuizCompleted(false)
      return
    }

    const shuffledDeck = shuffleItems(words)
    setSociologyQuizDeck(shuffledDeck)
    setSociologyQuizIndex(0)
    setSociologyQuizScore(0)
    setSociologyQuizCompleted(false)
  }, [isSociologyFinalQuiz, words])

  useEffect(() => {
    setQuizSelection(null)
    setQuizAnswered(false)
    setQuizSuggestedStatus(null)
  }, [quizMode, activeWord?.id])

  function markWord(nextStatus) {
    if (!studyWord) return
    onMarkWord(studyWord.id, track, nextStatus)
  }

  function handleQuizToggle() {
    if (sociologyQuizLocked) return
    setQuizMode((current) => !current)
  }

  function handleQuizAnswer(option) {
    if (!activeWord || quizAnswered || sociologyQuizCompleted) return

    setQuizSelection(option.id)
    setQuizAnswered(true)

    if (isSociologyFinalQuiz) {
      if (option.isCorrect) setSociologyQuizScore((score) => score + 1)
      return
    }

    setQuizSuggestedStatus(option.isCorrect ? 'known' : 'review')
  }

  function handleAdvanceSociologyQuiz() {
    if (!quizAnswered || sociologyQuizCompleted) return

    if (lastSociologyQuestion) {
      setSociologyQuizCompleted(true)
      return
    }

    setSociologyQuizIndex((current) => current + 1)
  }

  function handleRestartSociologyQuiz() {
    const shuffledDeck = shuffleItems(words)
    setSociologyQuizDeck(shuffledDeck)
    setSociologyQuizIndex(0)
    setSociologyQuizScore(0)
    setSociologyQuizCompleted(false)
    setQuizSelection(null)
    setQuizAnswered(false)
    setQuizSuggestedStatus(null)
  }

  const totalWords = words.length
  const knownCount = words.filter((entry) => wordStatus[entry.id] === 'known').length
  const quizButtonLabel = isSociology ? 'Quiz final' : 'Quiz A-D'
  const quizProgress = isSociologyFinalQuiz && sociologyQuizDeck.length > 0
    ? { current: Math.min(sociologyQuizIndex + 1, sociologyQuizDeck.length), total: sociologyQuizDeck.length }
    : null

  return (
    <div className="page">
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <TrackToggle track={track} setTrack={setTrack} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container">
        <AnimatePresence>
          {!focusMode && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {knownCount} de {totalWords} palavras dominadas
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {source === 'review' && !allKnown && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        background: 'var(--accent-light)',
                        padding: '3px 9px',
                        borderRadius: 99,
                      }}
                    >
                      Revisao primeiro
                    </span>
                  )}

                  {allKnown && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'var(--accent)',
                        background: 'var(--accent-light)',
                        padding: '3px 9px',
                        borderRadius: 99,
                      }}
                    >
                      Trilha completa
                    </span>
                  )}

                  <ToggleChip
                    active={notebookMode}
                    label="Caderno"
                    onClick={() => setNotebookMode((current) => !current)}
                  />
                  <ToggleChip
                    active={quizMode}
                    disabled={sociologyQuizLocked}
                    label={quizMode ? '<- Normal' : quizButtonLabel}
                    onClick={handleQuizToggle}
                  />
                </div>
              </div>

              <div
                style={{
                  height: 3,
                  background: 'var(--border)',
                  borderRadius: 99,
                  marginBottom: 6,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  style={{ height: '100%', background: 'var(--accent)', borderRadius: 99 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(knownCount / totalWords) * 100}%` }}
                  transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              {!allKnown && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>
                  {reviewCount > 0
                    ? `${reviewCount} em revisao entram antes das novas`
                    : 'As novas palavras continuam entrando na rotacao diaria'}
                </p>
              )}

              {isSociology && sociologyQuizLocked && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>
                  O quiz final de sociologia libera quando os 5 conceitos estiverem concluidos.
                </p>
              )}

              {!quizMode && notebookMode && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 2 }}>
                  Modo caderno mostra resumo curto com botao para abrir a explicacao completa.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <WordCard
          word={activeWord}
          track={track}
          dateStr={dateStr}
          status={activeStatus}
          quizMode={quizMode}
          notebookMode={notebookMode}
          quizQuestion={quizQuestion}
          quizSelection={quizSelection}
          quizAnswered={quizAnswered}
          quizCompleted={sociologyQuizCompleted}
          quizScore={sociologyQuizScore}
          quizTotal={sociologyQuizDeck.length}
          quizProgress={quizProgress}
          onSelectOption={handleQuizAnswer}
        />

        <AnimatePresence>
          {!focusMode && (
            <motion.div
              className="actions"
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.22 }}
            >
              <AnimatePresence mode="wait">
                {quizMode ? (
                  isSociologyFinalQuiz ? (
                    <motion.div
                      key="sociology-final-quiz"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}
                    >
                      <p style={{ fontSize: 12, color: 'var(--text-2)', textAlign: 'center' }}>
                        {sociologyQuizCompleted
                          ? `Quiz finalizado: ${sociologyQuizScore} de ${sociologyQuizDeck.length}.`
                          : `Pergunta ${sociologyQuizIndex + 1} de ${sociologyQuizDeck.length}.`}
                      </p>

                      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                        <motion.button
                          className="btn btn-ghost"
                          whileHover={{ scale: 0.98 }}
                          whileTap={{ scale: 0.96 }}
                          transition={{ duration: 0.12 }}
                          onClick={() => setQuizMode(false)}
                          style={{ flex: 1 }}
                        >
                          Voltar
                        </motion.button>

                        <motion.button
                          className="btn btn-primary"
                          whileHover={sociologyQuizCompleted || quizAnswered ? { scale: 0.98 } : undefined}
                          whileTap={sociologyQuizCompleted || quizAnswered ? { scale: 0.96 } : undefined}
                          transition={{ duration: 0.12 }}
                          onClick={sociologyQuizCompleted ? handleRestartSociologyQuiz : handleAdvanceSociologyQuiz}
                          disabled={!sociologyQuizCompleted && !quizAnswered}
                          style={{
                            flex: 1,
                            background: 'var(--accent)',
                            borderColor: 'transparent',
                            ...(!sociologyQuizCompleted && !quizAnswered ? { opacity: 0.35, cursor: 'not-allowed' } : {}),
                          }}
                        >
                          {sociologyQuizCompleted
                            ? 'Refazer quiz'
                            : lastSociologyQuestion
                              ? 'Finalizar quiz'
                              : 'Proxima pergunta'}
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="quiz-actions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}
                    >
                      <p
                        style={{
                          fontSize: 12,
                          color: quizAnswered ? 'var(--text-2)' : 'var(--text-3)',
                          textAlign: 'center',
                        }}
                      >
                        {!quizAnswered
                          ? 'Escolha uma alternativa A, B, C ou D na carta.'
                          : quizSuggestedStatus === 'known'
                            ? 'Acertou. Confirme abaixo se quer marcar como "Ja sei".'
                            : 'Errou. Confirme abaixo se quer marcar como "Revisar depois".'}
                      </p>

                      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                        <motion.button
                          className="btn btn-ghost"
                          whileHover={quizAnswered ? { scale: 0.98 } : undefined}
                          whileTap={quizAnswered ? { scale: 0.96 } : undefined}
                          transition={{ duration: 0.12 }}
                          onClick={() => markWord('review')}
                          disabled={!quizAnswered}
                          style={{
                            flex: 1,
                            ...((activeStatus === 'review' || (!activeStatus || activeStatus === 'seen') && quizSuggestedStatus === 'review')
                              ? { borderColor: 'var(--fr)', color: 'var(--fr)' }
                              : {}),
                            ...(!quizAnswered ? { opacity: 0.35, cursor: 'not-allowed' } : {}),
                          }}
                        >
                          Revisar depois
                        </motion.button>

                        <motion.button
                          className="btn btn-primary"
                          whileHover={quizAnswered ? { scale: 0.98 } : undefined}
                          whileTap={quizAnswered ? { scale: 0.96 } : undefined}
                          transition={{ duration: 0.12 }}
                          onClick={() => markWord('known')}
                          disabled={!quizAnswered}
                          style={{
                            flex: 1,
                            ...((activeStatus === 'known' || (!activeStatus || activeStatus === 'seen') && quizSuggestedStatus === 'known')
                              ? { background: 'var(--accent)', borderColor: 'transparent' }
                              : {}),
                            ...(!quizAnswered ? { opacity: 0.35, cursor: 'not-allowed' } : {}),
                          }}
                        >
                          Ja sei
                        </motion.button>
                      </div>
                    </motion.div>
                  )
                ) : (
                  <motion.div
                    key="normal-actions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', gap: 12, width: '100%' }}
                  >
                    <motion.button
                      className="btn btn-ghost"
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => markWord('review')}
                      style={activeStatus === 'review' ? { borderColor: 'var(--fr)', color: 'var(--fr)' } : {}}
                    >
                      Revisar depois
                    </motion.button>

                    <motion.button
                      className="btn btn-primary"
                      whileHover={{ scale: 0.98 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ duration: 0.12 }}
                      onClick={() => markWord('known')}
                      style={activeStatus === 'known' ? { background: 'var(--accent)', borderColor: 'transparent' } : {}}
                    >
                      Ja sei
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {!focusMode && (
            <motion.p
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--text-3)',
                fontStyle: 'italic',
                paddingBottom: 8,
              }}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {allKnown
                ? 'Voce dominou todas as palavras desta trilha'
                : reviewCount > 0
                  ? `${remaining} item${remaining !== 1 ? 's' : ''} pendente${remaining !== 1 ? 's' : ''} - ${reviewCount} em revisao`
                  : `${remaining} palavra${remaining !== 1 ? 's' : ''} restante${remaining !== 1 ? 's' : ''} na rotacao`}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {focusMode && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', justifyContent: 'center', paddingBottom: 16 }}
            >
              <button
                onClick={() => setFocusMode(false)}
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border)',
                  borderRadius: 99,
                  padding: '7px 18px',
                  fontSize: 12,
                  fontFamily: 'var(--font-sans)',
                  color: 'var(--text-3)',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  transition: 'all 120ms',
                }}
              >
                Modo foco - ESC para sair
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

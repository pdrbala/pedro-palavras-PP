import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocalStorage } from '../hooks/useLocalStorage'
import TrackToggle from '../components/TrackToggle'
import WordCard from '../components/WordCard'
import {
  sociologiaWordsCompact as sociologiaWords,
  frenchWords,
  russianWords,
  getTodayStr,
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
      type="button"
      className={`mode-chip ${active ? 'active' : ''}`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      disabled={disabled}
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
  currentStreak,
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
  const [todayKey, setTodayKey] = useState(() => getTodayStr())

  const words =
    track === 'sociologia' ? sociologiaWords :
    track === 'russo' ? russianWords :
    frenchWords

  const { word: studyWord, dateStr, remaining, reviewCount, source } = getStudyWordOfDay(words, wordStatus, todayKey)
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
    const now = new Date()
    const nextDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1)
    const timer = window.setTimeout(() => {
      setTodayKey(getTodayStr())
    }, Math.max(1000, nextDay.getTime() - now.getTime()))

    return () => window.clearTimeout(timer)
  }, [todayKey])

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
  const modeSummary =
    quizMode
      ? isSociologyFinalQuiz
        ? 'Perguntas aleatorias para fechar a trilha.'
        : 'Uma pergunta A-D para validar a palavra atual.'
      : notebookMode
        ? 'Resumo curto para copiar com abertura da explicacao completa.'
        : 'Fluxo padrao com leitura, exemplo e marcacao rapida.'

  return (
    <div className="page home-page">
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
              className="home-status-panel"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="home-topline"
              >
                <div className="home-topline-meta">
                  <div className="home-progress-copy">
                    <span className="home-progress-kicker">Progresso da trilha</span>
                    <div className="home-progress-numbers">
                      <span className="home-progress-current">{knownCount}</span>
                      <span className="home-progress-total">/ {totalWords}</span>
                      <span className="home-progress-caption">dominadas</span>
                      {allKnown && (
                        <span className="home-inline-pill">Trilha completa</span>
                      )}
                    </div>
                  </div>

                  {currentStreak > 0 && (
                    <motion.div
                      className="streak-chip"
                      key={`${track}-${currentStreak}`}
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                    >
                      <span className="streak-chip-orb" aria-hidden="true" />
                      <span className="streak-chip-value">{currentStreak}</span>
                      <span className="streak-chip-label">dias seguidos</span>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="home-progress-track">
                <motion.div
                  className="home-progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${(knownCount / totalWords) * 100}%` }}
                  transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>

              <div className="home-status-notes">
                {source === 'review' && !allKnown && (
                  <p className="home-status-note home-status-note-strong">
                    Revisao primeiro antes das novas.
                  </p>
                )}

                {!allKnown && (
                  <p className="home-status-note">
                    {reviewCount > 0
                      ? `${reviewCount} em revisao entram antes das novas`
                      : 'As novas palavras continuam entrando na rotacao diaria'}
                  </p>
                )}

                {isSociology && sociologyQuizLocked && (
                  <p className="home-status-note">
                    O quiz final de sociologia libera quando os 5 conceitos estiverem concluidos.
                  </p>
                )}

                {!quizMode && notebookMode && (
                  <p className="home-status-note">
                    Modo caderno mostra resumo curto com botao para abrir a explicacao completa.
                  </p>
                )}
              </div>
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
              <div className="action-dock">
                <div className="action-dock-top">
                  <div className="home-mode-bar">
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

                  <p className="action-dock-note">{modeSummary}</p>
                </div>

                <AnimatePresence mode="wait">
                  {quizMode ? (
                    isSociologyFinalQuiz ? (
                      <motion.div
                        key="sociology-final-quiz"
                        className="action-stack"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="action-helper">
                          {sociologyQuizCompleted
                            ? `Quiz finalizado: ${sociologyQuizScore} de ${sociologyQuizDeck.length}.`
                            : `Pergunta ${sociologyQuizIndex + 1} de ${sociologyQuizDeck.length}.`}
                        </p>

                        <div className="action-row">
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
                        className="action-stack"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="action-helper">
                          {!quizAnswered
                            ? 'Escolha uma alternativa A, B, C ou D na carta.'
                            : quizSuggestedStatus === 'known'
                              ? 'Acertou. Confirme abaixo se quer marcar como "Ja sei".'
                              : 'Errou. Confirme abaixo se quer marcar como "Revisar depois".'}
                        </p>

                        <div className="action-row">
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
                      className="action-row"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
              </div>
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

        <AnimatePresence>
          {!focusMode && (
            <motion.div
              className="focus-hint"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, delay: 0.05 }}
            >
              <span className="focus-hint-key">F</span>
              ativa o modo foco
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

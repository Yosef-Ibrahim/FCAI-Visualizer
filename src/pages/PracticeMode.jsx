import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Binary,
  Bookmark,
  BookmarkCheck,
  Check,
  Cpu,
  FileArchive,
  GitBranch,
  Grid3x3,
  Hash,
  Layers,
  ListOrdered,
  Loader2,
  Network,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  TreePine,
  Trophy,
  Type,
  Workflow,
  X,
  Zap,
} from 'lucide-react';
import {
  PRACTICE_TOPICS,
  getPracticeTopic,
  loadPracticeTopic,
  selectSessionQuestions,
  shuffleQuestionSet,
} from '../data/practice/index.js';
import { useProgress } from '../hooks/useProgress';
import { useT } from '../hooks/useT';
import { useLocale } from '../hooks/useLocale';
import { formatNumber, formatPercent } from '../i18n/format';
import '../styles/Practice.css';

const ICONS = {
  array: Binary,
  stack: Layers,
  queue: Workflow,
  linked: GitBranch,
  sorting: ListOrdered,
  search: Search,
  graph: Network,
  hash: Hash,
  tree: TreePine,
  string: Type,
  grid: Grid3x3,
  zap: Zap,
  cpu: Cpu,
  archive: FileArchive,
  bookmark: Bookmark,
};

// Synthetic topic used when the user practises only their saved questions.
const SAVED_TOPIC = {
  id: 'saved',
  course: 'advanced-data-structure',
  icon: 'bookmark',
  labelKey: 'hub.saved.title',
  descriptionKey: 'hub.saved.description',
  questionCount: 0,
};

const DIFFICULTIES = ['mixed', 'easy', 'medium', 'hard'];
const LENGTHS = [10, 20, 50, 'all'];
const COURSE_ORDER = ['data-structure', 'advanced-data-structure', 'algorithms', 'operating-systems', 'information-theory-compression'];
const TOTAL_QUESTIONS = PRACTICE_TOPICS.reduce((sum, topic) => sum + topic.questionCount, 0);

function optionText(option) {
  return option.slice(3);
}

function accuracyOf(score) {
  if (!score?.total) return 0;
  return Math.round((score.correct / score.total) * 100);
}

export default function PracticeMode() {
  const t = useT('practice');
  const { locale } = useLocale();
  const {
    progress, recordAnswer, getTopicScore, getStats, resetProgress, toggleSaved, isSaved,
  } = useProgress();

  const [view, setView] = useState('hub');
  const [filter, setFilter] = useState('all');
  const [topicId, setTopicId] = useState(null);
  const [difficulty, setDifficulty] = useState('mixed');
  const [length, setLength] = useState(10);
  const [pool, setPool] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const resetTimer = useRef(null);

  const stats = getStats();
  const topic = topicId === 'saved' ? SAVED_TOPIC : getPracticeTopic(topicId);
  const current = pool[index] ?? null;
  const topicScore = topicId && topicId !== 'saved' ? getTopicScore(topicId) : null;
  const currentSaved = current ? isSaved(current.id, current.topic) : false;
  const correctCount = answers.filter((answer) => answer.isCorrect).length;

  const visibleTopics = useMemo(
    () => (filter === 'all' ? PRACTICE_TOPICS : PRACTICE_TOPICS.filter((entry) => entry.course === filter)),
    [filter],
  );

  const openTopic = (id) => {
    setTopicId(id);
    setDifficulty('mixed');
    setLength(10);
    setView('setup');
  };

  const loadSavedQuestions = useCallback(async () => {
    const banks = new Map();
    const questions = [];
    for (const entry of progress.saved || []) {
      if (!banks.has(entry.topic)) banks.set(entry.topic, await loadPracticeTopic(entry.topic));
      const question = banks.get(entry.topic).find((item) => item.id === entry.id);
      if (question) questions.push(question);
    }
    return questions;
  }, [progress.saved]);

  const beginSession = async () => {
    if (!topicId) return;
    setLoading(true);
    if (topicId === 'saved') {
      const questions = savedQuestions.length ? savedQuestions : await loadSavedQuestions();
      setSavedQuestions(questions);
      setPool(shuffleQuestionSet(questions));
    } else {
      const bank = await loadPracticeTopic(topicId);
      const seenIds = progress.scores[topicId]?.seenQuestionIds ?? [];
      setPool(selectSessionQuestions(bank, {
        limit: length === 'all' ? Infinity : Number(length),
        difficulty,
        seenIds,
      }));
    }
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setLoading(false);
    setView('session');
  };

  const openSaved = async () => {
    setView('saved');
    setSavedLoading(true);
    setSavedQuestions(await loadSavedQuestions());
    setSavedLoading(false);
  };

  const startSavedSession = async () => {
    setLoading(true);
    const questions = savedQuestions.length ? savedQuestions : await loadSavedQuestions();
    setSavedQuestions(questions);
    setTopicId('saved');
    setDifficulty('mixed');
    setPool(shuffleQuestionSet(questions));
    setAnswers([]);
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setLoading(false);
    setView('session');
  };

  const checkAnswer = useCallback(() => {
    if (!selected || checked || !current) return;
    const isCorrect = selected === current.correctAnswer;
    setChecked(true);
    setAnswers((previous) => [...previous, { question: current, selected, isCorrect }]);
    recordAnswer(current.topic, isCorrect, current.difficulty, current.algorithm, current.id);
  }, [selected, checked, current, recordAnswer]);

  const nextQuestion = useCallback(() => {
    if (!checked) return;
    if (index + 1 >= pool.length) {
      setView('results');
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  }, [checked, index, pool.length]);

  useEffect(() => {
    if (view !== 'session') return undefined;
    const handleKey = (event) => {
      const tag = event.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      // Let a focused button handle Enter through its native click so the
      // shortcut does not advance twice (handler + click) on the same press.
      if (event.key === 'Enter' && tag === 'BUTTON') return;
      if (/^[1-4]$/.test(event.key) && !checked) {
        const option = current?.options[Number(event.key) - 1];
        if (option) setSelected(option.charAt(0));
        return;
      }
      if (event.key === 'Enter') {
        if (checked) nextQuestion();
        else checkAnswer();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [view, checked, current, checkAnswer, nextQuestion]);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleReset = () => {
    if (!resetArmed) {
      setResetArmed(true);
      resetTimer.current = setTimeout(() => setResetArmed(false), 3200);
      return;
    }
    resetProgress();
    setResetArmed(false);
    setAnswers([]);
    setPool([]);
    setView('hub');
  };

  const backToHub = () => {
    setView('hub');
    setPool([]);
    setAnswers([]);
    setSelected(null);
    setChecked(false);
  };

  // ── Hub ────────────────────────────────────────────────────────────────────
  if (view === 'hub') {
    return (
      <div className="practice-page">
        <section className="practice-hero">
          <div className="practice-hero-copy">
            <span className="practice-eyebrow"><Sparkles size={14} /> {t('hub.eyebrow')}</span>
            <h1>{t('hub.title')}</h1>
            <p>{t('hub.subtitle', { count: TOTAL_QUESTIONS })}</p>
            <div className="practice-hero-stats">
              <div className="practice-stat">
                <strong>{formatNumber(TOTAL_QUESTIONS, locale)}+</strong>
                <span>{t('hub.available')}</span>
              </div>
              <div className="practice-stat">
                <strong>{formatNumber(stats.totalQuestions, locale)}</strong>
                <span>{t('hub.attempted')}</span>
              </div>
              <div className="practice-stat">
                <strong>{formatPercent(stats.accuracy / 100, locale)}</strong>
                <span>{t('hub.accuracy')}</span>
              </div>
              <div className="practice-stat">
                <strong>{formatNumber(stats.bestStreak, locale)}</strong>
                <span>{t('hub.streak')}</span>
              </div>
            </div>
          </div>
          <div className="practice-hero-mark" aria-hidden="true">
            <Trophy size={40} strokeWidth={1.6} />
          </div>
        </section>

        <div className="practice-toolbar">
          <div className="practice-filters" role="group" aria-label={t('hub.filterLabel')}>
            <button
              type="button"
              className={`practice-chip${filter === 'all' ? ' is-active' : ''}`}
              onClick={() => setFilter('all')}
              aria-pressed={filter === 'all'}
            >
              {t('hub.allCourses')}
            </button>
            {COURSE_ORDER.map((course) => (
              <button
                key={course}
                type="button"
                className={`practice-chip${filter === course ? ' is-active' : ''}`}
                onClick={() => setFilter(course)}
                aria-pressed={filter === course}
              >
                {t(`catalog:course.${course}.title`)}
              </button>
            ))}
          </div>
          <div className="practice-toolbar-actions">
            <button type="button" className="practice-reset practice-saved-link" onClick={openSaved}>
              <Bookmark size={15} />
              {t('hub.saved.open')}
              {stats.savedCount > 0 && <span className="practice-saved-count">{stats.savedCount}</span>}
            </button>
            <button type="button" className="practice-reset" onClick={handleReset}>
              <RotateCcw size={15} />
              {resetArmed ? t('hub.confirmReset') : t('hub.reset')}
            </button>
          </div>
        </div>

        <div className="practice-grid">
          {visibleTopics.map((entry) => {
            const Icon = ICONS[entry.icon] ?? Target;
            const score = progress.scores[entry.id] ?? { total: 0, correct: 0 };
            const accuracy = accuracyOf(score);
            return (
              <button
                key={entry.id}
                type="button"
                className={`practice-topic practice-topic--${entry.course}`}
                onClick={() => openTopic(entry.id)}
              >
                <span className="practice-topic-top">
                  <span className="practice-topic-icon"><Icon size={21} strokeWidth={1.8} /></span>
                  <span className="practice-topic-count">{entry.questionCount}+ {t('hub.questions')}</span>
                </span>
                <strong className="practice-topic-title">{t(entry.labelKey)}</strong>
                <span className="practice-topic-description">{t(entry.descriptionKey)}</span>
                <span className="practice-topic-progress" aria-hidden="true">
                  <span style={{ width: `${accuracy}%` }} />
                </span>
                <span className="practice-topic-footer">
                  <span>{score.total ? t('hub.attemptedCount', { count: score.total }) : t('hub.notStarted')}</span>
                  <span className="practice-topic-go">{t('hub.practice')} <ArrowRight size={14} className="rtl-flip" /></span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Setup ──────────────────────────────────────────────────────────────────
  if (view === 'setup' && topic) {
    const Icon = ICONS[topic.icon] ?? Target;
    const accuracy = accuracyOf(topicScore);
    return (
      <div className="practice-page practice-page--narrow">
        <button type="button" className="practice-back" onClick={backToHub}>
          <ArrowLeft size={16} className="rtl-flip" /> {t('hub.backToTopics')}
        </button>

        <section className="practice-setup">
          <div className="practice-setup-head">
            <span className={`practice-setup-icon practice-topic--${topic.course}`}><Icon size={26} strokeWidth={1.7} /></span>
            <div>
              <span className="practice-eyebrow">{t('hub.setup.kicker')}</span>
              <h1>{t(topic.labelKey)}</h1>
              <p>{t(topic.descriptionKey)}</p>
            </div>
          </div>

          <div className="practice-setup-meta">
            <span><Target size={15} /> {t('hub.questionsAvailable', { count: topic.questionCount })}</span>
            <span><Trophy size={15} /> {topicScore?.total ? t('hub.topicAccuracy', { percent: accuracy }) : t('hub.notStarted')}</span>
          </div>

          <fieldset className="practice-field">
            <legend>{t('hub.setup.difficulty')}</legend>
            <div className="practice-segmented">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={difficulty === level ? 'is-active' : ''}
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                >
                  {t(`hub.levels.${level}`)}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="practice-field">
            <legend>{t('hub.setup.length')}</legend>
            <div className="practice-segmented">
              {LENGTHS.map((value) => (
                <button
                  key={value}
                  type="button"
                  className={length === value ? 'is-active' : ''}
                  onClick={() => setLength(value)}
                  aria-pressed={length === value}
                >
                  {value === 'all' ? t('hub.setup.all') : value}
                </button>
              ))}
            </div>
          </fieldset>

          <p className="practice-note"><Check size={15} /> {t('hub.setup.note')}</p>

          <button type="button" className="practice-primary" onClick={beginSession} disabled={loading}>
            {loading ? <Loader2 size={17} className="practice-spin" /> : <Sparkles size={17} />}
            {loading ? t('hub.loading') : t('hub.setup.begin')}
          </button>
        </section>
      </div>
    );
  }

  // ── Saved questions ───────────────────────────────────────────────────────
  if (view === 'saved') {
    return (
      <div className="practice-page practice-page--narrow">
        <button type="button" className="practice-back" onClick={backToHub}>
          <ArrowLeft size={16} className="rtl-flip" /> {t('hub.backToTopics')}
        </button>

        <section className="practice-saved">
          <span className="practice-eyebrow"><Bookmark size={14} /> {t('hub.saved.kicker')}</span>
          <h1>{t('hub.saved.title')}</h1>
          <p>{t('hub.saved.description')}</p>

          <div className="practice-result-actions">
            <button
              type="button"
              className="practice-primary"
              onClick={startSavedSession}
              disabled={loading || savedLoading || savedQuestions.length === 0}
            >
              {loading ? <Loader2 size={17} className="practice-spin" /> : <Sparkles size={16} />}
              {loading ? t('hub.loading') : t('hub.saved.practice')}
            </button>
            <button type="button" className="practice-secondary" onClick={backToHub}>
              {t('hub.results.back')}
            </button>
          </div>

          {savedLoading ? (
            <p className="practice-loading">{t('hub.loading')}</p>
          ) : savedQuestions.length === 0 ? (
            <p className="practice-review-empty"><Bookmark size={16} /> {t('hub.saved.empty')}</p>
          ) : (
            <div className="practice-saved-list">
              {savedQuestions.map((question) => {
                const correctOption = question.options.find(
                  (option) => option.charAt(0) === question.correctAnswer,
                ) ?? '';
                const sourceTopic = PRACTICE_TOPICS.find((entry) => entry.id === question.topic);
                return (
                  <article key={`${question.topic}-${question.id}`} className="practice-review-item practice-saved-item">
                    <div className="practice-card-meta">
                      <span className={`practice-level practice-level--${question.difficulty}`}>
                        {t(`hub.levels.${question.difficulty}`)}
                      </span>
                      {sourceTopic && <span className="practice-tag">{t(sourceTopic.labelKey)}</span>}
                      <button
                        type="button"
                        className="practice-save is-saved"
                        onClick={() => {
                          toggleSaved(question);
                          setSavedQuestions((previous) => previous.filter(
                            (entry) => !(entry.id === question.id && entry.topic === question.topic),
                          ));
                        }}
                        aria-label={t('hub.saved.remove')}
                        title={t('hub.saved.remove')}
                      >
                        <BookmarkCheck size={16} />
                      </button>
                    </div>
                    <p className="practice-review-question">{question.question}</p>
                    <p className="practice-review-row practice-review-row--right">
                      <Check size={15} /> {t('hub.results.correctAnswer')}: {optionText(correctOption)}
                    </p>
                    <p className="practice-review-explanation">{question.explanation}</p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (view === 'results') {
    const accuracy = answers.length ? Math.round((correctCount / answers.length) * 100) : 0;
    const missed = answers.filter((answer) => !answer.isCorrect);
    const tone = accuracy >= 80 ? 'excellent' : accuracy >= 50 ? 'good' : 'keepGoing';
    return (
      <div className="practice-page practice-page--narrow">
        <section className="practice-results">
          <span className="practice-eyebrow">{t('hub.results.kicker')}</span>
          <h1>{t('hub.results.title')}</h1>
          <p>{t(`hub.results.${tone}`)}</p>

          <div className="practice-score-ring" style={{ '--score': `${accuracy}%` }} role="img" aria-label={t('hub.results.accuracy')}>
            <div>
              <strong>{accuracy}%</strong>
              <span>{t('hub.results.accuracy')}</span>
            </div>
          </div>

          <div className="practice-result-stats">
            <div>
              <strong>{correctCount}</strong>
              <span>{t('hub.results.correct')}</span>
            </div>
            <div>
              <strong>{answers.length - correctCount}</strong>
              <span>{t('hub.results.incorrect')}</span>
            </div>
            <div>
              <strong>{answers.length}</strong>
              <span>{t('hub.results.answered')}</span>
            </div>
          </div>

          <div className="practice-result-actions">
            <button type="button" className="practice-primary" onClick={beginSession}>
              <RotateCcw size={16} /> {t('hub.results.retry')}
            </button>
            <button type="button" className="practice-secondary" onClick={backToHub}>
              {t('hub.results.back')}
            </button>
          </div>

          <section className="practice-review">
            <h2>{t('hub.results.review')}</h2>
            {missed.length === 0 ? (
              <p className="practice-review-empty"><Check size={16} /> {t('hub.results.noMistakes')}</p>
            ) : (
              missed.map((answer) => {
                const correctOption = answer.question.options.find(
                  (option) => option.charAt(0) === answer.question.correctAnswer,
                );
                return (
                  <article key={`${answer.question.id}-${answer.selected}`} className="practice-review-item">
                    <p className="practice-review-question">{answer.question.question}</p>
                    <p className="practice-review-row practice-review-row--wrong">
                      <X size={15} /> {t('hub.results.yourAnswer')}: {optionText(
                        answer.question.options.find((option) => option.charAt(0) === answer.selected) ?? '',
                      )}
                    </p>
                    <p className="practice-review-row practice-review-row--right">
                      <Check size={15} /> {t('hub.results.correctAnswer')}: {optionText(correctOption ?? '')}
                    </p>
                    <p className="practice-review-explanation">{answer.question.explanation}</p>
                  </article>
                );
              })
            )}
          </section>
        </section>
      </div>
    );
  }

  // ── Session ────────────────────────────────────────────────────────────────
  if (view === 'session' && topic) {
    return (
      <div className="practice-page practice-page--narrow practice-session">
        <div className="practice-session-bar">
          <button type="button" className="practice-back" onClick={backToHub}>
            <ArrowLeft size={16} className="rtl-flip" /> {t('hub.session.exit')}
          </button>
          <div className="practice-session-topic">
            <strong>{t(topic.labelKey)}</strong>
            <span>{t('hub.session.question', { current: index + 1, total: pool.length })}</span>
          </div>
          <div className="practice-session-score">
            <span>{t('hub.session.score')}</span>
            <strong>{correctCount}/{answers.length}</strong>
          </div>
        </div>

        <div className="practice-progress" aria-hidden="true">
          <span style={{ width: `${((index + (checked ? 1 : 0)) / Math.max(1, pool.length)) * 100}%` }} />
        </div>

        {!current ? (
          <p className="practice-loading">{t('hub.loading')}</p>
        ) : (
          <section className="practice-card">
            <div className="practice-card-meta">
              <span className={`practice-level practice-level--${current.difficulty}`}>
                {t(`hub.levels.${current.difficulty}`)}
              </span>
              {current.subtopic && <span className="practice-tag">{current.subtopic}</span>}
              {current.algorithm && <span className="practice-tag">{current.algorithm}</span>}
              <button
                type="button"
                className={`practice-save${currentSaved ? ' is-saved' : ''}`}
                onClick={() => toggleSaved(current)}
                aria-pressed={currentSaved}
                aria-label={currentSaved ? t('hub.session.unsave') : t('hub.session.save')}
                title={currentSaved ? t('hub.session.unsave') : t('hub.session.save')}
              >
                {currentSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
              </button>
            </div>

            <h2 className="practice-question">{current.question}</h2>

            <div className="practice-options">
              {current.options.map((option) => {
                const letter = option.charAt(0);
                let state = '';
                if (checked) {
                  if (letter === current.correctAnswer) state = ' is-correct';
                  else if (letter === selected) state = ' is-wrong';
                } else if (letter === selected) state = ' is-selected';
                return (
                  <button
                    key={option}
                    type="button"
                    className={`practice-option${state}`}
                    onClick={() => !checked && setSelected(letter)}
                    aria-pressed={letter === selected}
                  >
                    <span className="practice-option-letter">{letter}</span>
                    <span>{optionText(option)}</span>
                    {checked && letter === current.correctAnswer && <Check size={17} />}
                    {checked && letter === selected && letter !== current.correctAnswer && <X size={17} />}
                  </button>
                );
              })}
            </div>

            <div className="practice-card-actions">
              <span className="practice-keyboard">{t('hub.session.keyboard')}</span>
              {checked ? (
                <button type="button" className="practice-primary" onClick={nextQuestion}>
                  {index + 1 >= pool.length ? t('hub.session.finish') : t('hub.session.next')}
                  <ArrowRight size={16} className="rtl-flip" />
                </button>
              ) : (
                <button type="button" className="practice-primary" onClick={checkAnswer} disabled={!selected}>
                  {t('hub.session.submit')}
                </button>
              )}
            </div>

            <div className="practice-feedback" aria-live="polite">
              {checked && (
                <div className={`practice-feedback-inner ${selected === current.correctAnswer ? 'is-correct' : 'is-wrong'}`}>
                  <strong>
                    {selected === current.correctAnswer ? (
                      <><Check size={16} /> {t('hub.session.correct')}</>
                    ) : (
                      <><X size={16} /> {t('hub.session.incorrect')}</>
                    )}
                  </strong>
                  <p>{current.explanation}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Fallback if a stale view is reached.
  return <div className="practice-page" />;
}

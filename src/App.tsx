import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EXPEDITION_STATIONS } from './data/expeditions';
import { WorldMapStage } from './components/WorldMapStage';
import { OrnateQuestionModal } from './components/OrnateQuestionModal';
import { SummaryEvaluationModal } from './components/SummaryEvaluationModal';

export default function App() {
  // Which station's pop-up question modal is currently open
  const [modalStationId, setModalStationId] = useState<1 | 2 | 3 | null>(null);
  // Which route/ship is currently displayed & animated on the world map
  const [activeRouteStationId, setActiveRouteStationId] = useState<1 | 2 | 3>(1);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [animationNonce, setAnimationNonce] = useState<number>(0);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const sequenceTimersRef = useRef<number[]>([]);

  const clearPlayAllTimers = useCallback(() => {
    for (const timerId of sequenceTimersRef.current) {
      window.clearTimeout(timerId);
    }
    sequenceTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearPlayAllTimers();
  }, [clearPlayAllTimers]);

  const stationProgress = useMemo(() => {
    const progress: Record<1 | 2 | 3, { answered: number; correct: number }> = {
      1: { answered: 0, correct: 0 },
      2: { answered: 0, correct: 0 },
      3: { answered: 0, correct: 0 },
    };

    for (const st of EXPEDITION_STATIONS) {
      const answered = st.questions.filter(
        (q) => answers[q.id] !== undefined
      ).length;
      const correct = st.questions.filter(
        (q) => answers[q.id] === q.correctIndex
      ).length;
      progress[st.id] = { answered, correct };
    }
    return progress;
  }, [answers]);

  const totalAnswered = useMemo(
    () =>
      stationProgress[1].answered +
      stationProgress[2].answered +
      stationProgress[3].answered,
    [stationProgress]
  );

  const handleSelectStation = useCallback(
    (id: 1 | 2 | 3) => {
      clearPlayAllTimers();
      setIsPlayingAll(false);
      setShowSummary(false);
      setActiveRouteStationId(id);
      setModalStationId(id);

      const station = EXPEDITION_STATIONS.find((s) => s.id === id);
      if (station) {
        const firstUnanswered = station.questions.findIndex(
          (q) => answers[q.id] === undefined
        );
        setActiveQuestionIndex(firstUnanswered >= 0 ? firstUnanswered : 0);
      } else {
        setActiveQuestionIndex(0);
      }

      setAnimationNonce((n) => n + 1);
    },
    [answers, clearPlayAllTimers]
  );

  const handleCloseModal = useCallback(() => {
    setModalStationId(null);
  }, []);

  const handleAnswerQuestion = useCallback(
    (questionId: string, optionIndex: number) => {
      setAnswers((prev) => {
        if (prev[questionId] !== undefined) return prev;
        return { ...prev, [questionId]: optionIndex };
      });
    },
    []
  );

  const handleReplayCurrent = useCallback(() => {
    clearPlayAllTimers();
    setIsPlayingAll(false);
    setModalStationId(null);
    setShowSummary(false);
    setAnimationNonce((n) => n + 1);
  }, [clearPlayAllTimers]);

  const handleTogglePlayAll = useCallback(() => {
    if (isPlayingAll) {
      clearPlayAllTimers();
      setIsPlayingAll(false);
      return;
    }

    clearPlayAllTimers();
    setModalStationId(null);
    setShowSummary(false);
    setIsPlayingAll(true);

    // Step 1: Bartolomeu Dias (1488)
    setActiveRouteStationId(1);
    setAnimationNonce((n) => n + 1);

    // Step 2: Kolumbusz Kristof (1492)
    const t1 = window.setTimeout(() => {
      setActiveRouteStationId(2);
      setAnimationNonce((n) => n + 1);
    }, 2050);

    // Step 3: Vasco da Gama (1498)
    const t2 = window.setTimeout(() => {
      setActiveRouteStationId(3);
      setAnimationNonce((n) => n + 1);
    }, 4100);

    // Finish sequence
    const t3 = window.setTimeout(() => {
      setIsPlayingAll(false);
    }, 6600);

    sequenceTimersRef.current = [t1, t2, t3];
  }, [clearPlayAllTimers, isPlayingAll]);

  const handleOpenSummary = useCallback(() => {
    clearPlayAllTimers();
    setIsPlayingAll(false);
    setModalStationId(null);
    setShowSummary(true);
  }, [clearPlayAllTimers]);

  const handleRestartAll = useCallback(() => {
    clearPlayAllTimers();
    setIsPlayingAll(false);
    setAnswers({});
    setShowSummary(false);
    setModalStationId(null);
    setActiveRouteStationId(1);
    setActiveQuestionIndex(0);
    setAnimationNonce((n) => n + 1);
  }, [clearPlayAllTimers]);

  const activeModalStation =
    EXPEDITION_STATIONS.find((s) => s.id === modalStationId) ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      {/* Three-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleCloseModal();
              setShowSummary(false);
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            Földrajzi felfedezések
          </a>

          <nav
            aria-label="Állomások és kiértékelés"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {EXPEDITION_STATIONS.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleSelectStation(st.id)}
                className={`hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 ${
                  modalStationId === st.id
                    ? 'text-sky-900 underline underline-offset-4 decoration-2'
                    : ''
                }`}
              >
                {st.shortNavLabel}
              </button>
            ))}
            <button
              type="button"
              onClick={handleOpenSummary}
              className={`hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0 py-1 ${
                showSummary
                  ? 'text-sky-900 underline underline-offset-4 decoration-2'
                  : ''
              }`}
            >
              Kiértékelés
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={handleRestartAll}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#123659] rounded-lg hover:bg-[#0f2c48] transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#123659]"
            >
              Újrakezdés
            </button>
          </div>
        </div>
      </header>

      {/* Main Map-Centric Workspace */}
      <main id="top" className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Történelem 6. osztály</span>
              <span aria-hidden="true">·</span>
              <span>A nagy földrajzi felfedezések (15–16. század)</span>
              <span aria-hidden="true">·</span>
              <span>3 helyszín, 9 kérdés</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-semibold text-slate-900 text-balance">
              Fedezd fel a tengeri utakat a világtérképen!
            </h1>
          </div>

          <div className="text-xs sm:text-sm text-slate-600 font-mono tabular-nums">
            Megválaszolva: <strong className="text-slate-900">{totalAnswered} / 9</strong>
          </div>
        </div>

        <WorldMapStage
          stations={EXPEDITION_STATIONS}
          selectedStationId={modalStationId}
          activeRouteStationId={activeRouteStationId}
          onSelectStation={handleSelectStation}
          stationProgress={stationProgress}
          animationNonce={animationNonce}
          isPlayingAll={isPlayingAll}
          onTogglePlayAll={handleTogglePlayAll}
          onReplayCurrent={handleReplayCurrent}
          totalAnswered={totalAnswered}
          onOpenSummary={handleOpenSummary}
        />
      </main>

      {/* Pop-up Ornate Question Modal */}
      <OrnateQuestionModal
        station={activeModalStation}
        activeQuestionIndex={activeQuestionIndex}
        answers={answers}
        totalAnswered={totalAnswered}
        onClose={handleCloseModal}
        onSelectQuestionIndex={setActiveQuestionIndex}
        onAnswerQuestion={handleAnswerQuestion}
        onSelectStation={handleSelectStation}
        onOpenSummary={handleOpenSummary}
      />

      {/* Final Summary Evaluation Modal */}
      <SummaryEvaluationModal
        isOpen={showSummary}
        stations={EXPEDITION_STATIONS}
        answers={answers}
        onClose={() => setShowSummary(false)}
        onSelectStation={handleSelectStation}
        onRestartAll={handleRestartAll}
      />
    </div>
  );
}

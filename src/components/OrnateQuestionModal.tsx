import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Compass,
  MapPin,
  Ship,
  X,
  XCircle,
} from 'lucide-react';
import { ExpeditionStation } from '../data/expeditions';

interface OrnateQuestionModalProps {
  station: ExpeditionStation | null;
  activeQuestionIndex: number;
  answers: Record<string, number>;
  totalAnswered: number;
  onClose: () => void;
  onSelectQuestionIndex: (index: number) => void;
  onAnswerQuestion: (questionId: string, optionIndex: number) => void;
  onSelectStation: (id: 1 | 2 | 3) => void;
  onOpenSummary: () => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const CornerOrnament: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg
    viewBox="0 0 36 36"
    className={`w-7 h-7 text-amber-600/75 pointer-events-none ${className}`}
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M 2 22 L 2 5 Q 2 2 5 2 L 22 2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M 7 17 L 7 7 L 17 7"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
    />
    <circle cx="7" cy="7" r="2" fill="currentColor" />
    <path
      d="M 12 2 C 12 6 6 12 2 12"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

export const OrnateQuestionModal: React.FC<OrnateQuestionModalProps> = ({
  station,
  activeQuestionIndex,
  answers,
  totalAnswered,
  onClose,
  onSelectQuestionIndex,
  onAnswerQuestion,
  onSelectStation,
  onOpenSummary,
}) => {
  useEffect(() => {
    if (!station) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [station, onClose]);

  if (!station) return null;

  const currentQuestion =
    station.questions[activeQuestionIndex] ?? station.questions[0];
  const selectedAnswer = answers[currentQuestion.id];
  const hasAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQuestion.correctIndex;

  const stationDone = station.questions.every(
    (q) => answers[q.id] !== undefined
  );
  const allCompleted = totalAnswered === 9;
  const nextStationId: (1 | 2 | 3) | null =
    station.id === 1 ? 2 : station.id === 2 ? 3 : null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ornate-modal-title"
      >
        {/* Dark maritime backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#081a2d]/65 backdrop-blur-[2px]"
          aria-hidden="true"
        />

        {/* Ornate double-framed cartographic modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#fffdf6] border-2 border-amber-500 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Ornate Royal Navy Header */}
          <div className="relative bg-gradient-to-r from-[#0f2c48] via-[#163f66] to-[#0f2c48] text-white px-6 py-5 border-b-2 border-amber-400/80">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="shrink-0 w-11 h-11 rounded-full bg-amber-400 text-[#0f2c48] border-2 border-amber-200 flex items-center justify-center font-mono text-lg font-bold shadow-sm">
                  {station.numberLabel}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-amber-200">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {station.regionName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{station.explorer}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{station.year}</span>
                  </div>
                  <h2
                    id="ornate-modal-title"
                    className="mt-1 font-display text-xl sm:text-2xl font-semibold text-white text-balance"
                  >
                    {station.milestoneTitle}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Ablak bezárása"
                className="shrink-0 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <p className="mt-2.5 text-xs sm:text-sm text-sky-100/90 leading-relaxed flex items-start gap-2">
              <Ship className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{station.summary}</span>
            </p>
          </div>

          {/* Inner Parchment Body with Decorative Corner Flourishes */}
          <div className="relative flex-1 overflow-y-auto p-5 sm:p-7">
            {/* Inner ornamental gold hairline frame */}
            <div
              className="pointer-events-none absolute inset-3 border border-amber-500/30 rounded-xl"
              aria-hidden="true"
            />
            <CornerOrnament className="absolute top-3 left-3" />
            <CornerOrnament className="absolute top-3 right-3 rotate-90" />
            <CornerOrnament className="absolute bottom-3 right-3 rotate-180" />
            <CornerOrnament className="absolute bottom-3 left-3 -rotate-90" />

            <div className="relative z-10 px-2 sm:px-3">
              {/* 3-Question Selector Tabs */}
              <div
                role="tablist"
                aria-label="Állomás három kérdése"
                className="grid grid-cols-3 gap-2 p-1.5 bg-amber-100/60 border border-amber-300/70 rounded-xl"
              >
                {station.questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isTabActive = idx === activeQuestionIndex;
                  const answeredRight = ans !== undefined && ans === q.correctIndex;
                  const answeredWrong = ans !== undefined && ans !== q.correctIndex;

                  return (
                    <button
                      key={q.id}
                      role="tab"
                      type="button"
                      aria-selected={isTabActive}
                      onClick={() => onSelectQuestionIndex(idx)}
                      className={`inline-flex items-center justify-center gap-1.5 py-2 px-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        isTabActive
                          ? 'bg-[#123659] text-amber-100 shadow-xs'
                          : 'text-slate-700 hover:bg-amber-200/50 hover:text-slate-900'
                      }`}
                    >
                      <span className="font-mono tabular-nums">{idx + 1}. kérdés</span>
                      {answeredRight && (
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isTabActive ? 'text-emerald-300' : 'text-emerald-700'
                          }`}
                          aria-label="Helyes válasz"
                        />
                      )}
                      {answeredWrong && (
                        <XCircle
                          className={`w-4 h-4 shrink-0 ${
                            isTabActive ? 'text-amber-300' : 'text-amber-700'
                          }`}
                          aria-label="Hibás válasz"
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Decorative divider */}
              <div className="my-4 flex items-center gap-3 text-amber-600/70" aria-hidden="true">
                <div className="h-px flex-1 bg-amber-400/40" />
                <Compass className="w-4 h-4" />
                <div className="h-px flex-1 bg-amber-400/40" />
              </div>

              {/* Question Prompt & Options */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.16 }}
                >
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-slate-900 leading-snug">
                    {currentQuestion.question}
                  </h3>

                  <div className="mt-4 space-y-2.5">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isPicked = selectedAnswer === optIdx;
                      const isRightOption = optIdx === currentQuestion.correctIndex;

                      let optionClasses =
                        'border-amber-300/80 bg-white text-slate-800 hover:border-sky-700 hover:bg-amber-50/70 shadow-2xs';
                      let badgeClasses =
                        'bg-amber-100 text-amber-950 border border-amber-300';

                      if (hasAnswered) {
                        if (isRightOption) {
                          optionClasses =
                            'border-emerald-400 bg-emerald-50 text-emerald-950 shadow-2xs';
                          badgeClasses =
                            'bg-emerald-700 text-white border border-emerald-800';
                        } else if (isPicked && !isRightOption) {
                          optionClasses =
                            'border-amber-400 bg-amber-50 text-amber-950 shadow-2xs';
                          badgeClasses =
                            'bg-amber-700 text-white border border-amber-800';
                        } else {
                          optionClasses =
                            'border-slate-200 bg-slate-50/70 text-slate-500';
                          badgeClasses =
                            'bg-slate-100 text-slate-400 border border-slate-200';
                        }
                      }

                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={hasAnswered}
                          onClick={() =>
                            onAnswerQuestion(currentQuestion.id, optIdx)
                          }
                          className={`w-full text-left flex items-start gap-3 p-3.5 min-h-[46px] rounded-xl border text-sm sm:text-[15px] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-800 ${
                            hasAnswered ? 'cursor-default' : 'cursor-pointer'
                          } ${optionClasses}`}
                        >
                          <span
                            className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${badgeClasses}`}
                          >
                            {OPTION_LETTERS[optIdx]}
                          </span>
                          <span className="flex-1 leading-snug pt-0.5 font-medium">
                            {option}
                          </span>
                          {hasAnswered && isRightOption && (
                            <CheckCircle2
                              className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          )}
                          {hasAnswered && isPicked && !isRightOption && (
                            <XCircle
                              className="w-5 h-5 text-amber-700 shrink-0 mt-0.5"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Ornate Textbook Explanation Feedback */}
                  {hasAnswered && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={`mt-4 p-4 rounded-xl border text-sm ${
                        isCorrect
                          ? 'border-emerald-300 bg-emerald-50/90 text-emerald-950'
                          : 'border-amber-300 bg-amber-50/90 text-amber-950'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold">
                        {isCorrect ? (
                          <>
                            <CheckCircle2
                              className="w-4 h-4 text-emerald-700 shrink-0"
                              aria-hidden="true"
                            />
                            <span>Helyes válasz!</span>
                          </>
                        ) : (
                          <>
                            <XCircle
                              className="w-4 h-4 text-amber-700 shrink-0"
                              aria-hidden="true"
                            />
                            <span>Nem egészen — nézd meg a magyarázatot!</span>
                          </>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700">
                        {currentQuestion.explanation}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Ornate Modal Footer */}
          <div className="px-6 py-4 bg-amber-50/80 border-t border-amber-300/70 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-slate-600 font-mono tabular-nums">
              <span>Haladás: {totalAnswered} / 9 kérdés</span>
              <span aria-hidden="true" className="text-amber-400">
                ·
              </span>
              <span>
                {station.id}. állomás:{' '}
                {station.questions.filter((q) => answers[q.id] !== undefined).length}/3
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {activeQuestionIndex > 0 && (
                <button
                  type="button"
                  onClick={() => onSelectQuestionIndex(activeQuestionIndex - 1)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  Előző
                </button>
              )}

              {activeQuestionIndex < 2 ? (
                <button
                  type="button"
                  onClick={() => onSelectQuestionIndex(activeQuestionIndex + 1)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    hasAnswered
                      ? 'bg-[#123659] text-amber-100 hover:bg-[#0f2c48]'
                      : 'bg-white text-slate-800 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  Következő kérdés
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : allCompleted ? (
                <button
                  type="button"
                  onClick={onOpenSummary}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors cursor-pointer whitespace-nowrap shadow-xs"
                >
                  <Award className="w-4 h-4" aria-hidden="true" />
                  Összefoglaló kiértékelés
                </button>
              ) : nextStationId ? (
                <button
                  type="button"
                  onClick={() => onSelectStation(nextStationId)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    stationDone
                      ? 'bg-[#123659] text-amber-100 hover:bg-[#0f2c48]'
                      : 'bg-white text-slate-800 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  Tovább a {nextStationId}. állomásra
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold bg-[#123659] text-amber-100 rounded-lg hover:bg-[#0f2c48] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Vissza a térképre
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

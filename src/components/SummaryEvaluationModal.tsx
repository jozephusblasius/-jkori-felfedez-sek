import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Compass,
  RotateCcw,
  X,
  XCircle,
} from 'lucide-react';
import { ExpeditionStation, TEXTBOOK_RECAP_ITEMS } from '../data/expeditions';

interface SummaryEvaluationModalProps {
  isOpen: boolean;
  stations: ExpeditionStation[];
  answers: Record<string, number>;
  onClose: () => void;
  onSelectStation: (id: 1 | 2 | 3) => void;
  onRestartAll: () => void;
}

export const SummaryEvaluationModal: React.FC<SummaryEvaluationModalProps> = ({
  isOpen,
  stations,
  answers,
  onClose,
  onSelectStation,
  onRestartAll,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAnswered = stations.reduce(
    (sum, st) =>
      sum + st.questions.filter((q) => answers[q.id] !== undefined).length,
    0
  );
  const totalCorrect = stations.reduce(
    (sum, st) =>
      sum +
      st.questions.filter((q) => answers[q.id] === q.correctIndex).length,
    0
  );
  const percentage = Math.round((totalCorrect / 9) * 100);

  let rankTitle = 'Kezdő tengerész';
  let evaluationText =
    'Jó kezdés! Érdemes újra rákattintani a térképen azokra az állomásokra, ahol hibáztál, és elolvasni a magyarázatokat.';

  if (totalCorrect >= 8) {
    rankTitle = 'Főnavigátor – Kiváló felfedező!';
    evaluationText =
      'Gratulálunk! Remekül ismered a nagy földrajzi felfedezések legfontosabb utazóit, évszámait és okait.';
  } else if (totalCorrect >= 5) {
    rankTitle = 'Tapasztalt hajóskapitány';
    evaluationText =
      'Szép teljesítmény! A felfedezések fő irányait már jól tudod, néhány részletet még átismételhetsz az állomásokon.';
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#081a2d]/65 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-[#fffdf6] border-2 border-amber-500 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Ornate Navy & Gold Header */}
        <div className="bg-gradient-to-r from-[#0f2c48] via-[#163f66] to-[#0f2c48] text-white px-6 py-5 border-b-2 border-amber-400/80 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="shrink-0 w-12 h-12 rounded-full bg-amber-400 text-[#0f2c48] border-2 border-amber-200 flex items-center justify-center shadow-sm">
              <Award className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs text-amber-200 font-medium">
                6. osztályos történelem · Összefoglaló kiértékelés
              </div>
              <h2
                id="summary-modal-title"
                className="mt-0.5 font-display text-xl sm:text-2xl font-semibold text-white"
              >
                {rankTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kiértékelés bezárása"
            className="shrink-0 w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 text-amber-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Score Overview Box */}
          <div className="p-4 sm:p-5 rounded-xl bg-amber-50/70 border border-amber-300/80">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-md">
                <p className="text-sm text-slate-800 leading-relaxed">
                  {evaluationText}
                </p>
                {totalAnswered < 9 && (
                  <p className="mt-1.5 text-xs font-medium text-amber-800">
                    Még {9 - totalAnswered} kérdés megválaszolatlan a teljes körű kiértékeléshez.
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-3xl font-bold text-[#123659] tabular-nums">
                  {totalCorrect} / 9
                </div>
                <div className="text-xs font-mono text-slate-600 tabular-nums">
                  {percentage}% helyes válasz
                </div>
              </div>
            </div>

            <div
              className="mt-3.5 h-2.5 w-full rounded-full bg-amber-200/70 overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="h-full bg-[#123659] rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Station-by-Station Breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#123659]" aria-hidden="true" />
              Állomások szerinti eredmény
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {stations.map((st) => {
                const answered = st.questions.filter(
                  (q) => answers[q.id] !== undefined
                ).length;
                const correct = st.questions.filter(
                  (q) => answers[q.id] === q.correctIndex
                ).length;

                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onSelectStation(st.id)}
                    className="text-left p-3.5 rounded-xl bg-white border border-amber-300/70 hover:border-sky-700 hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#123659] text-amber-200 font-mono text-xs font-bold">
                        {st.id}
                      </span>
                      <span className="font-mono text-xs font-semibold text-slate-700 tabular-nums">
                        {correct} / 3 jó
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-semibold text-slate-900 group-hover:text-sky-900">
                      {st.regionName}
                    </div>
                    <div className="text-xs text-slate-500">
                      {st.explorer} · {st.year}
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5">
                      {st.questions.map((q) => {
                        const ans = answers[q.id];
                        if (ans === undefined) {
                          return (
                            <span
                              key={q.id}
                              className="w-4 h-4 rounded-full border border-slate-300 bg-slate-100 inline-block"
                              title="Megválaszolatlan"
                            />
                          );
                        }
                        return ans === q.correctIndex ? (
                          <CheckCircle2
                            key={q.id}
                            className="w-4 h-4 text-emerald-700"
                            aria-label="Helyes"
                          />
                        ) : (
                          <XCircle
                            key={q.id}
                            className="w-4 h-4 text-amber-700"
                            aria-label="Hibás"
                          />
                        );
                      })}
                      <span className="ml-auto text-[11px] font-medium text-sky-800 group-hover:underline">
                        {answered < 3 ? 'Kitöltés' : 'Átnézés'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Textbook Recap */}
          <div className="pt-4 border-t border-amber-300/60">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#123659]" aria-hidden="true" />
              A tananyag legfontosabb évszámai (OFI 6. osztály)
            </h3>
            <ul className="mt-3 space-y-2.5">
              {TEXTBOOK_RECAP_ITEMS.map((item) => (
                <li
                  key={item.year}
                  className="text-sm text-slate-700 leading-snug"
                >
                  <span className="font-mono font-semibold text-[#123659] tabular-nums">
                    {item.year}
                  </span>
                  <span aria-hidden="true" className="mx-2 text-amber-400">
                    ·
                  </span>
                  <span className="font-semibold text-slate-900">
                    {item.explorer}:
                  </span>{' '}
                  <span>{item.fact}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-amber-50/80 border-t border-amber-300/70 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
          >
            Vissza a térképre
          </button>
          <button
            type="button"
            onClick={onRestartAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-amber-100 bg-[#123659] rounded-lg hover:bg-[#0f2c48] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            Feladat újrakezdése
          </button>
        </div>
      </motion.div>
    </div>
  );
};

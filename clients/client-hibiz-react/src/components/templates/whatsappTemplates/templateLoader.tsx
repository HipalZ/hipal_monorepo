import { memo, useEffect, useState } from 'react';
import { FiCheck, FiCheckCircle, FiCloud, FiSend } from 'react-icons/fi';

const STAGES = [
  {
    icon: FiCloud,
    title: 'Packing your message',
    sub: 'Finalising body, variables, and media…',
  },
  {
    icon: FiSend,
    title: 'Sending to Meta',
    sub: 'Submitting your template for review…',
  },
  {
    icon: FiCheckCircle,
    title: 'Awaiting confirmation',
    sub: 'Meta is reviewing — this should be quick.',
  },
];

const STAGE_TIMERS = [
  { stage: 1, delay: 900 },
  { stage: 2, delay: 2200 },
];

const TemplateLoader = memo(() => {
  const [activeStage, setActiveStage] = useState(0);

  const currentStage = STAGES[activeStage];
  const ActiveIcon = currentStage.icon;

  useEffect(() => {
    const timers = STAGE_TIMERS.map(({ stage, delay }) => setTimeout(() => setActiveStage(stage), delay));

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <output aria-live="polite" aria-busy="true" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-md">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl">
        <div className="relative h-1 overflow-hidden bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500">
          <div className="absolute inset-y-0 -left-1/3 w-1/3 animate-[shimmer_1.8s_ease-in-out_infinite] bg-white/40" />
        </div>

        <div className="px-6 py-6">
          <div className="mb-5 flex justify-center">
            <div className="relative">
              <svg className="h-20 w-20 -rotate-90 animate-[spin_2.2s_linear_infinite]" viewBox="0 0 80 80">
                <defs>
                  <linearGradient id="templateLoaderGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>

                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="6" />

                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="url(#templateLoaderGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray="40 200"
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-white p-2 shadow-sm">
                  <ActiveIcon className="h-7 w-7 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-center text-base font-semibold text-slate-900">{currentStage.title}</h3>

          <p className="mt-1 text-center text-xs text-slate-500">{currentStage.sub}</p>

          <ol className="mt-6 space-y-2">
            {STAGES.map((stage, index) => {
              const isDone = index < activeStage;
              const isActive = index === activeStage;

              return (
                <li
                  key={stage.title}
                  className={`flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors ${isActive ? 'bg-emerald-500/5' : ''}`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-all duration-300 ${
                      isDone
                        ? 'bg-emerald-500 text-white'
                        : isActive
                          ? 'bg-emerald-500 text-white shadow-[0_0_0_4px_rgba(16,185,129,0.18)]'
                          : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isDone ? <FiCheck className="h-3 w-3" /> : index + 1}
                  </span>

                  <span className={`text-xs ${isDone || isActive ? 'font-medium text-slate-800' : 'text-slate-400'}`}>{stage.title}</span>

                  {isActive && (
                    <span className="ml-auto flex items-center gap-0.5">
                      <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.3s]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500 [animation-delay:-0.15s]" />
                      <span className="h-1 w-1 animate-bounce rounded-full bg-emerald-500" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>

          <p className="mt-5 text-center text-[11px] italic text-slate-400">Please don&apos;t close this window.</p>
        </div>

        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(0%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    </output>
  );
});

TemplateLoader.displayName = 'TemplateLoader';

export default TemplateLoader;

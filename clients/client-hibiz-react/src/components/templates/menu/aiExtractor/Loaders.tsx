import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Brain, Folders, Scan, Sparkles, UtensilsCrossed, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const ParticleField = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-1 w-1 rounded-full bg-blue-400/30"
        initial={{
          x: Math.random() * 100 + '%',
          y: Math.random() * 100 + '%',
        }}
        animate={{
          x: [Math.random() * 100 + '%', Math.random() * 100 + '%', Math.random() * 100 + '%'],
          y: [Math.random() * 100 + '%', Math.random() * 100 + '%', Math.random() * 100 + '%'],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
);

const PulsingOrb = ({ color, delay }: { color: string; delay: number }) => (
  <motion.div
    className={`absolute h-32 w-32 rounded-full blur-3xl ${color}`}
    initial={{ scale: 0.8, opacity: 0.3 }}
    animate={{
      scale: [0.8, 1.2, 0.8],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: 'easeInOut',
    }}
  />
);

type ExtractLoaderProps = {
  /** total seconds (default 5 minutes) */
  totalSeconds?: number;
  /** called once when timer hits zero */
  onExpire?: () => void;
};
export const ExtractLoader = ({ totalSeconds = 420, onExpire }: ExtractLoaderProps) => {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setInterval(() => setRemaining((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remaining, onExpire]);

  const pct = useMemo(() => Math.min(100, Math.max(0, ((totalSeconds - remaining) / totalSeconds) * 100)), [remaining, totalSeconds]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-blue-200 bg-white p-12 shadow-2xl">
        <ParticleField />
        <PulsingOrb color="bg-blue-400" delay={0} />
        <PulsingOrb color="bg-indigo-400" delay={0.5} />

        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Brain Animation */}
          <motion.div className="relative" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
            <Brain className="h-20 w-20 text-blue-600" />
            <motion.div
              className="absolute inset-0"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-20 w-20 text-indigo-400" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <div className="space-y-2 text-center">
            <motion.h3
              className="text-3xl font-bold text-blue-900"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              AI is Reading Your Menu
            </motion.h3>
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <Scan className="h-5 w-5" />
              <motion.span className="text-sm font-medium" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.2, repeat: Infinity }}>
                Analyzing structure, extracting categories and dishes...
              </motion.span>
            </div>
          </div>

          {/* Progress + Timer */}
          <div className="flex items-center gap-6">
            <div className="relative h-20 w-20">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(rgb(37,99,235) ${pct * 3.6}deg, #E5E7EB 0deg)`,
                }}
              />
              <div className="absolute inset-1 rounded-full bg-white" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-slate-700">{Math.round(pct)}%</span>
              </div>
            </div>

            <motion.div
              key={remaining}
              initial={{ scale: 0.98, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-3xl font-bold tabular-nums text-slate-900"
            >
              {mm}:{ss}
            </motion.div>
          </div>

          {/* Pulsing Dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full bg-blue-600"
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>

          {/* Linear Progress */}
          <div className="mt-2 h-2 w-80 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600"
              style={{ width: `${pct}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'linear', duration: 0.2 }}
            />
          </div>

          {/* ⚠️ AI Warning */}
          <motion.div
            className="mt-6 rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-center shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="flex items-center justify-center gap-2 text-sm font-medium text-amber-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M12 5a7 7 0 11-7 7 7 7 0 017-7z" />
              </svg>
              AI can make small mistakes — please review extracted results for accuracy ✨
            </p>
          </motion.div>

          {/* Hint */}
          <div className="mt-2 text-xs text-slate-500">
            This is an estimated duration. You can safely continue working while AI processes your menu.
          </div>
        </div>
      </div>
    </div>
  );
};

export const CategoryLoader = ({ progress, total, current }: { progress?: number; total?: number; current?: number }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-emerald-200 bg-white p-12 shadow-2xl">
      <ParticleField />
      <PulsingOrb color="bg-emerald-400" delay={0} />
      <PulsingOrb color="bg-teal-400" delay={0.7} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div className="relative">
          <motion.div
            animate={{
              rotateY: [0, 180, 360],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            <Folders className="h-20 w-20 text-emerald-600" />
          </motion.div>
          <motion.div
            className="absolute -right-2 -top-2"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Zap className="h-6 w-6 text-yellow-500" />
          </motion.div>
        </motion.div>

        <div className="w-full space-y-2 text-center">
          <motion.h3
            className="text-3xl font-bold text-emerald-900"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            Creating Categories
          </motion.h3>
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <motion.span
              className="text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            >
              Building your menu structure in the database...
            </motion.span>
          </div>

          {typeof progress === 'number' && (
            <div className="mt-6 w-full space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm font-medium text-emerald-700">
                {current} of {total} categories created
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-8 w-2 rounded-full bg-emerald-600"
              animate={{
                scaleY: [1, 1.8, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const DishLoader = ({ progress, total, current }: { progress?: number; total?: number; current?: number }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-8">
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-purple-200 bg-white p-12 shadow-2xl">
      <ParticleField />
      <PulsingOrb color="bg-purple-400" delay={0} />
      <PulsingOrb color="bg-pink-400" delay={0.6} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div className="relative">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
            }}
          >
            <UtensilsCrossed className="h-20 w-20 text-purple-600" />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="h-24 w-24 rounded-full border-4 border-purple-400" />
          </motion.div>
        </motion.div>

        <div className="w-full space-y-2 text-center">
          <motion.h3
            className="text-3xl font-bold text-purple-900"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            Adding Dishes
          </motion.h3>
          <div className="flex items-center justify-center gap-2 text-purple-700">
            <motion.span
              className="text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            >
              Linking dishes to categories with all details...
            </motion.span>
          </div>

          {typeof progress === 'number' && (
            <div className="mt-6 w-full space-y-2">
              <Progress value={progress} className="h-3" />
              <p className="text-sm font-medium text-purple-700">
                {current} of {total} dishes created
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-4 w-4 rounded-full border-2 border-purple-600"
              animate={{
                scale: [1, 1.3, 1],
                borderColor: ['#9333ea', '#ec4899', '#9333ea'],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ProcessingOverlay = ({ message }: { message: string }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 20 }}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'linear',
          }}
        >
          <Sparkles className="h-12 w-12 text-blue-600" />
        </motion.div>
        <p className="text-center font-medium text-gray-700">{message}</p>
      </div>
    </motion.div>
  </motion.div>
);

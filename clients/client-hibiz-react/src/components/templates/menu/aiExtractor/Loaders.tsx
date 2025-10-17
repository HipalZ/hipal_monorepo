import { motion } from "framer-motion";
import {
  Scan,
  Folders,
  UtensilsCrossed,
  Sparkles,
  Brain,
  Zap,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ParticleField = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
        initial={{
          x: Math.random() * 100 + "%",
          y: Math.random() * 100 + "%",
        }}
        animate={{
          x: [
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
          ],
          y: [
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
            Math.random() * 100 + "%",
          ],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    ))}
  </div>
);

const PulsingOrb = ({ color, delay }: { color: string; delay: number }) => (
  <motion.div
    className={`absolute w-32 h-32 rounded-full blur-3xl ${color}`}
    initial={{ scale: 0.8, opacity: 0.3 }}
    animate={{
      scale: [0.8, 1.2, 0.8],
      opacity: [0.3, 0.6, 0.3],
    }}
    transition={{
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: "easeInOut",
    }}
  />
);

export const ExtractLoader = () => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-50 flex items-center justify-center p-8">
    <div className="relative bg-white rounded-2xl p-12 overflow-hidden border-2 border-blue-200 shadow-2xl max-w-2xl w-full">
      <ParticleField />
      <PulsingOrb color="bg-blue-400" delay={0} />
      <PulsingOrb color="bg-indigo-400" delay={0.5} />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Brain className="w-20 h-20 text-blue-600" />
          <motion.div
            className="absolute inset-0"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Sparkles className="w-20 h-20 text-indigo-400" />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-2">
          <motion.h3
            className="text-3xl font-bold text-blue-900"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            AI is Reading Your Menu
          </motion.h3>
          <div className="flex items-center gap-2 justify-center text-blue-700">
            <Scan className="w-5 h-5" />
            <motion.span
              className="text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            >
              Analyzing structure, extracting categories and dishes...
            </motion.span>
          </div>
        </div>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const CategoryLoader = ({
  progress,
  total,
  current,
}: { progress?: number; total?: number; current?: number }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 z-50 flex items-center justify-center p-8">
    <div className="relative bg-white rounded-2xl p-12 overflow-hidden border-2 border-emerald-200 shadow-2xl max-w-2xl w-full">
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
              ease: "easeInOut",
            }}
          >
            <Folders className="w-20 h-20 text-emerald-600" />
          </motion.div>
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <Zap className="w-6 h-6 text-yellow-500" />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-2 w-full">
          <motion.h3
            className="text-3xl font-bold text-emerald-900"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            Creating Categories
          </motion.h3>
          <div className="flex items-center gap-2 justify-center text-emerald-700">
            <motion.span
              className="text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            >
              Building your menu structure in the database...
            </motion.span>
          </div>

          {typeof progress === "number" && (
            <div className="mt-6 space-y-2 w-full">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-emerald-700 font-medium">
                {current} of {total} categories created
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-8 bg-emerald-600 rounded-full"
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

export const DishLoader = ({
  progress,
  total,
  current,
}: { progress?: number; total?: number; current?: number }) => (
  <div className="fixed inset-0 bg-gradient-to-br from-purple-50 to-pink-50 z-50 flex items-center justify-center p-8">
    <div className="relative bg-white rounded-2xl p-12 overflow-hidden border-2 border-purple-200 shadow-2xl max-w-2xl w-full">
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
              ease: "easeInOut",
            }}
          >
            <UtensilsCrossed className="w-20 h-20 text-purple-600" />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0, 0.8, 0],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="w-24 h-24 border-4 border-purple-400 rounded-full" />
          </motion.div>
        </motion.div>

        <div className="text-center space-y-2 w-full">
          <motion.h3
            className="text-3xl font-bold text-purple-900"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          >
            Adding Dishes
          </motion.h3>
          <div className="flex items-center gap-2 justify-center text-purple-700">
            <motion.span
              className="text-sm font-medium"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
            >
              Linking dishes to categories with all details...
            </motion.span>
          </div>

          {typeof progress === "number" && (
            <div className="mt-6 space-y-2 w-full">
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-purple-700 font-medium">
                {current} of {total} dishes created
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-4 h-4 border-2 border-purple-600 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                borderColor: ["#9333ea", "#ec4899", "#9333ea"],
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
    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
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
            ease: "linear",
          }}
        >
          <Sparkles className="w-12 h-12 text-blue-600" />
        </motion.div>
        <p className="text-center text-gray-700 font-medium">{message}</p>
      </div>
    </motion.div>
  </motion.div>
);

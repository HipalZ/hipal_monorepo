import  { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { XCircle, RotateCw, Home } from "lucide-react";

// Props for wiring your flows
type Props = {
  onTryAgain?: () => void;
  onCancel?: () => void; // e.g., go back or close modal
  orderId?: string | null;
};

// Small floating particles for a subtle "glitch/spark" feel
const SparkField = () => {
  const dots = useMemo(
    () => Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw-ish, but we'll use absolute container
      y: Math.random() * 100,
      s: 0.6 + Math.random() * 1.2,
      d: 2 + Math.random() * 2.5,
    })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d) => (
        <motion.span
          key={d.id}
          className="absolute rounded-full bg-red-500/30 dark:bg-red-400/20"
          style={{ width: 6 * d.s, height: 6 * d.s, left: `${d.x}%`, top: `${d.y}%` }}
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: [-6, 6, -6] }}
          transition={{ duration: d.d, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

// Animated cross mark using stroke-dash + slight wobble
const AnimatedCross: React.FC = () => (
  <motion.svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    className="drop-shadow-[0_0_24px_rgba(239,68,68,0.45)]"
    initial={{ scale: 0.6, rotate: -8, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 180, damping: 14 }}
  >
    <motion.circle
      cx="60"
      cy="60"
      r="50"
      fill="none"
      stroke="currentColor"
      className="text-red-500/30"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    />
    <motion.line
      x1="40"
      y1="40"
      x2="80"
      y2="80"
      stroke="currentColor"
      className="text-red-500"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.35, duration: 0.5, ease: "easeInOut" }}
    />
    <motion.line
      x1="80"
      y1="40"
      x2="40"
      y2="80"
      stroke="currentColor"
      className="text-red-500"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 0.5, ease: "easeInOut" }}
    />
  </motion.svg>
);

const CardShake: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    className="w-full max-w-xl"
    initial={{ y: 16, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
  >
    <motion.div
      className="rounded-2xl border border-red-200/50 bg-white/70 dark:bg-neutral-900/50 shadow-xl backdrop-blur p-6 sm:p-8"
      animate={{
        rotate: [0, -1.4, 1.2, -0.8, 0.4, 0],
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const Header: React.FC<{ orderId?: string | null }> = ({ orderId }) => (
  <div className="flex items-center gap-3">
    <XCircle className="size-6 text-red-500" />
    <div className="leading-tight">
      <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Payment Failed</h2>
      {orderId ? (
        <p className="text-sm text-muted-foreground">Order ID: {orderId}</p>
      ) : (
        <p className="text-sm text-muted-foreground">Please try again.</p>
      )}
    </div>
  </div>
);

const FooterButtons: React.FC<Props> = ({ onTryAgain, onCancel }) => (
  <div className="mt-6 flex flex-col sm:flex-row gap-3">
    <Button
      onClick={onTryAgain}
      className="h-11 rounded-xl font-medium"
    >
      <RotateCw className="mr-2 h-4 w-4" /> Try again
    </Button>
    <Button
      variant="outline"
      onClick={onCancel}
      className="h-11 rounded-xl font-medium"
    >
      <Home className="mr-2 h-4 w-4" /> Go back
    </Button>
  </div>
);

const Tips: React.FC = () => (
  <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">
    <ul className="list-disc pl-5 space-y-1">
      <li>If money was debited, it will auto‑refund if the gateway marked it failed.</li>
      <li>Check internet connectivity and retry.</li>
      <li>You can change the payment method on the next step.</li>
    </ul>
  </div>
);

const ErrorPanel: React.FC<Props> = ({ onTryAgain, onCancel, orderId }) => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      <SparkField />

      <AnimatePresence mode="wait">
        <motion.div
          key="error-wrapper"
          className="relative z-10 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatedCross />

          <CardShake>
            <Header orderId={orderId} />

            <div className="mt-4 text-base sm:text-lg">
              <p className="text-neutral-800/90 dark:text-neutral-100/90">
                We couldn’t verify your payment at the moment.
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 mt-1">
                Don’t worry—nothing is lost. You can immediately try again.
              </p>
            </div>

            <Tips />
            <FooterButtons onTryAgain={onTryAgain} onCancel={onCancel} />
          </CardShake>
        </motion.div>
      </AnimatePresence>

      {/* soft radial glow */}
      <div className="pointer-events-none absolute -z-0 inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[560px] rounded-full bg-red-400/10 blur-3xl" />
      </div>
    </div>
  );
};

export default ErrorPanel;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, FileDown } from "lucide-react";

// Props you can extend as needed
export type SuccessSummary = {
  orderId?: string | null;
  amount?: number; // in your currency's minor/major units as you prefer
  method?: string; // e.g., UPI / Card / NetBanking
};

type Props = {
  summary?: SuccessSummary;
  onGoBack?: () => void;        // back to store / orders page
  onDownloadReceipt?: () => void; // optional receipt action
};

const CelebrateField: React.FC = () => {
  const items = Array.from({ length: 24 }).map((_, i) => ({ id: i }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((it) => (
        <motion.span
          key={it.id}
          className="absolute rounded-full bg-emerald-400/30 dark:bg-emerald-300/25"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: 6 + Math.random() * 10,
            height: 6 + Math.random() * 10,
          }}
          initial={{ y: -12, opacity: 0 }}
          animate={{ y: [ -8, 8, -8 ], opacity: [0, 1, 0] }}
          transition={{ duration: 2 + Math.random() * 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
};

const AnimatedTick: React.FC = () => (
  <motion.svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    className="drop-shadow-[0_0_24px_rgba(16,185,129,0.45)]"
    initial={{ scale: 0.6, rotate: 6, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    transition={{ type: "spring", stiffness: 180, damping: 14 }}
  >
    <motion.circle
      cx="60"
      cy="60"
      r="50"
      fill="none"
      stroke="currentColor"
      className="text-emerald-400/40"
      strokeWidth="10"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    />
    <motion.path
      d="M40 64 L54 78 L84 48"
      fill="none"
      stroke="currentColor"
      className="text-emerald-500"
      strokeWidth="10"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.35, duration: 0.55, ease: "easeInOut" }}
    />
  </motion.svg>
);

const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    className="w-full max-w-xl"
    initial={{ y: 16, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
  >
    <motion.div
      className="rounded-2xl border border-emerald-200/60 bg-white/70 dark:bg-neutral-900/50 shadow-xl backdrop-blur p-6 sm:p-8"
      animate={{ scale: [1, 1.01, 1] }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  </motion.div>
);

const Summary: React.FC<{ summary?: SuccessSummary }> = ({ summary }) => (
  <div className="mt-4 text-base sm:text-lg text-neutral-800/90 dark:text-neutral-100/90">
    <p>Payment verified successfully.</p>
    {summary?.orderId && (
      <p className="text-sm text-muted-foreground mt-1">Order ID: {summary.orderId}</p>
    )}
    {(summary?.amount || summary?.method) && (
      <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
        {summary?.amount !== undefined && <p>Amount: <span className="font-medium">{summary.amount}</span></p>}
        {summary?.method && <p>Method: <span className="font-medium">{summary.method}</span></p>}
      </div>
    )}
  </div>
);

const Footer: React.FC<Props> = ({ onGoBack, onDownloadReceipt }) => (
  <div className="mt-6 flex flex-col sm:flex-row gap-3">
    {onDownloadReceipt && (
      <Button onClick={onDownloadReceipt} className="h-11 rounded-xl font-medium">
        <FileDown className="mr-2 h-4 w-4" /> Download receipt
      </Button>
    )}
    <Button variant="outline" onClick={onGoBack} className="h-11 w-full rounded-xl font-medium">
      <Home className="mr-2 h-4 w-4" /> Go to Review
    </Button>
  </div>
);

const SuccessPanel: React.FC<Props> = ({ summary, onGoBack, onDownloadReceipt }) => {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center">
      <CelebrateField />

      <AnimatePresence mode="wait">
        <motion.div
          key="success-wrapper"
          className="relative z-10 flex flex-col items-center justify-center text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <AnimatedTick />

          <Card>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-6 text-emerald-500" />
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Payment Successful</h2>
            </div>

            <Summary summary={summary} />
            <Footer onGoBack={onGoBack} onDownloadReceipt={onDownloadReceipt} />
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* soft radial glow */}
      <div className="pointer-events-none absolute -z-0 inset-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-[560px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>
    </div>
  );
};

export default SuccessPanel;

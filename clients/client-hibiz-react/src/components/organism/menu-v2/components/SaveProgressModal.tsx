/**
 * SaveProgressModal Component
 *
 * Modal showing progress during local save of images to IndexedDB.
 * Shows image save progress and dish coverage status.
 */

import PopUp from '@/components/atom/popUp';
import { motion } from 'framer-motion';
import { Check, Save } from 'lucide-react';
import { HiX } from 'react-icons/hi';
import '../styles/brutalist.css';

export interface SaveProgress {
  current: number;
  total: number;
  dishesUpdated: number;
  totalDishes: number;
  currentFileName?: string;
  isComplete: boolean;
  summary?: {
    savedDishes: number;
    remainingDishes: number;
  };
}

interface SaveProgressModalProps {
  isOpen: boolean;
  progress: SaveProgress;
  onClose: () => void;
}

export const SaveProgressModal = ({ isOpen, progress, onClose }: SaveProgressModalProps) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <PopUp show={isOpen} onClose={() => {}} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]"
        style={{ background: '#F3F4F6' }}
      >
        {progress.isComplete && (
          <button
            className="brutal-button absolute right-4 top-6 z-50"
            type="button"
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HiX style={{ width: '20px', height: '20px' }} />
          </button>
        )}

        <div className="brutal-card" style={{ margin: '24px', padding: '24px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 className="brutal-heading mb-2" style={{ fontSize: '1.5rem' }}>
            SAVING IMAGES LOCALLY
          </h2>

          {/* Icon and Status */}
          <div className="mb-6 flex items-center gap-2">
            {progress.isComplete ? (
              <Check className="brutal-icon" style={{ width: '20px', height: '20px', color: '#00C853' }} />
            ) : (
              <Save className="brutal-icon" style={{ width: '20px', height: '20px' }} />
            )}
            <span className="brutal-heading" style={{ fontSize: '1rem' }}>
              {progress.isComplete ? 'SAVE COMPLETE' : 'SAVING...'}
            </span>
          </div>

          {/* Progress Bar */}
          {progress.total > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <motion.span
                  className="brutal-body"
                  style={{ fontSize: '0.875rem', fontWeight: 700 }}
                  animate={!progress.isComplete ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.5, repeat: !progress.isComplete ? Number.POSITIVE_INFINITY : 0 }}
                >
                  Saving images locally: {progress.current} / {progress.total} images
                </motion.span>
                <span className="brutal-data" style={{ fontSize: '0.75rem' }}>
                  {percentage}%
                </span>
              </div>
              <div className="relative h-6 overflow-hidden" style={{ background: '#FFFFFF', border: '3px solid #000000' }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: progress.isComplete ? '#00C853' : '#FFEB3B',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Current File Name */}
          {progress.currentFileName && !progress.isComplete && (
            <div className="brutal-body mb-4" style={{ fontSize: '0.75rem', color: '#3A3A3A', fontStyle: 'italic' }}>
              Processing: {progress.currentFileName}
            </div>
          )}

          {/* Dish Coverage Status */}
          {progress.totalDishes > 0 && (
            <div className="brutal-card mb-4" style={{ padding: '12px', border: '2px solid #000000' }}>
              <div className="brutal-body" style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '4px' }}>
                Dishes updated: {progress.dishesUpdated} / {progress.totalDishes}
              </div>
              <div className="h-3 relative overflow-hidden" style={{ background: '#F3F4F6', border: '1px solid #000000' }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: '#000000',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${progress.totalDishes > 0 ? (progress.dishesUpdated / progress.totalDishes) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Summary */}
          {progress.isComplete && progress.summary && (
            <motion.div
              className="brutal-card mb-4"
              style={{ padding: '16px', border: '3px solid #00C853', background: '#F1F8F4' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="brutal-body" style={{ fontSize: '0.875rem', color: '#00C853' }}>
                <div style={{ marginBottom: '8px' }}>
                  Saved {progress.summary.savedDishes} dish{progress.summary.savedDishes !== 1 ? 'es' : ''}.
                </div>
                {progress.summary.remainingDishes > 0 && (
                  <div style={{ fontSize: '0.75rem', color: '#3A3A3A' }}>
                    Remaining: {progress.summary.remainingDishes} dish{progress.summary.remainingDishes !== 1 ? 'es' : ''}.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Close Button (only when complete) */}
          {progress.isComplete && (
            <button
              type="button"
              onClick={onClose}
              className="brutal-button-primary w-full"
              style={{ padding: '12px', fontSize: '0.875rem' }}
            >
              CLOSE
            </button>
          )}
        </div>
      </section>
    </PopUp>
  );
};

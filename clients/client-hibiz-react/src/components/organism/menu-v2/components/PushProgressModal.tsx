/**
 * PushProgressModal Component
 *
 * Brutalist-styled modal showing progress during "Push Menu" operation.
 * Displays progress for image uploads, dish updates, category updates, and addon updates.
 */

import PopUp from '@/components/atom/popUp';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Upload } from 'lucide-react';
import { HiX } from 'react-icons/hi';
import '../styles/brutalist.css';

export interface PushProgress {
  phase: 'images' | 'applying_urls' | 'dishes' | 'categories' | 'addons' | 'complete' | 'error';
  current: number;
  total: number;
  message?: string;
  currentFileName?: string;
  batchInfo?: {
    currentBatch: number;
    totalBatches: number;
  };
  errors?: Array<{ id: string; error: string }>;
}

interface PushProgressModalProps {
  isOpen: boolean;
  progress: PushProgress;
  onClose: () => void;
}

export const PushProgressModal = ({ isOpen, progress, onClose }: PushProgressModalProps) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  const getPhaseLabel = () => {
    switch (progress.phase) {
      case 'images':
        return 'UPLOADING IMAGES';
      case 'applying_urls':
        return 'APPLYING IMAGE URLS LOCALLY';
      case 'dishes':
        return 'SYNCING DISHES';
      case 'categories':
        return 'SYNCING CATEGORIES';
      case 'addons':
        return 'SYNCING ADDONS';
      case 'complete':
        return 'SYNC COMPLETE';
      case 'error':
        return 'SYNC FAILED';
      default:
        return 'PROCESSING';
    }
  };

  const isComplete = progress.phase === 'complete';
  const hasErrors = progress.phase === 'error' || (progress.errors && progress.errors.length > 0);

  return (
    <PopUp show={isOpen} onClose={() => {}} hide>
      <section
        className="hide-scrollbar max-h-[100dvh] min-h-[100dvh] overflow-y-auto pb-[5rem] lg:max-h-[90dvh] lg:min-h-[70dvh]"
        style={{ background: '#F3F4F6' }}
      >
        {(isComplete || hasErrors) && (
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
            PUSHING MENU CHANGES
          </h2>

          {/* Phase Label */}
          <div className="mb-6 flex items-center gap-2">
            {(progress.phase === 'images' || progress.phase === 'applying_urls') && (
              <Upload className="brutal-icon" style={{ width: '20px', height: '20px' }} />
            )}
            {isComplete && <Check className="brutal-icon" style={{ width: '20px', height: '20px', color: '#00C853' }} />}
            {hasErrors && <AlertCircle className="brutal-icon" style={{ width: '20px', height: '20px', color: '#FF4444' }} />}
            <span className="brutal-heading" style={{ fontSize: '1rem' }}>
              {getPhaseLabel()}
            </span>
          </div>

          {/* Progress Bar */}
          {progress.total > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <motion.span
                  className="brutal-body"
                  style={{ fontSize: '0.875rem', fontWeight: 700 }}
                  animate={!isComplete && !hasErrors ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
                  transition={{ duration: 1.5, repeat: !isComplete && !hasErrors ? Number.POSITIVE_INFINITY : 0 }}
                >
                  {progress.current} / {progress.total}
                </motion.span>
                <span className="brutal-data" style={{ fontSize: '0.75rem' }}>
                  {percentage}%
                </span>
              </div>
              <div className="relative h-6 overflow-hidden" style={{ background: '#FFFFFF', border: '3px solid #000000' }}>
                <motion.div
                  style={{
                    height: '100%',
                    background: hasErrors ? '#FF4444' : isComplete ? '#00C853' : '#FFEB3B',
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

          {/* Message */}
          {progress.message && (
            <div className="brutal-body mb-4" style={{ fontSize: '0.875rem' }}>
              {progress.message}
            </div>
          )}

          {/* Current File Name */}
          {progress.currentFileName && (progress.phase === 'images' || progress.phase === 'applying_urls') && (
            <div className="brutal-body mb-4" style={{ fontSize: '0.75rem', color: '#3A3A3A', fontStyle: 'italic' }}>
              {progress.phase === 'images' ? 'Uploading:' : 'Applying:'} {progress.currentFileName}
            </div>
          )}

          {/* Batch Info */}
          {progress.batchInfo && (
            <div className="brutal-body mb-4" style={{ fontSize: '0.75rem', color: '#3A3A3A' }}>
              Batch {progress.batchInfo.currentBatch} / {progress.batchInfo.totalBatches}
            </div>
          )}

          {/* Errors */}
          <AnimatePresence>
            {hasErrors && progress.errors && progress.errors.length > 0 && (
              <motion.div
                className="brutal-card mb-4"
                style={{ padding: '16px', border: '3px solid #FF4444', background: '#FFF5F5' }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="brutal-heading mb-2 flex items-center gap-2" style={{ fontSize: '0.875rem', color: '#FF4444' }}>
                  <AlertCircle style={{ width: '16px', height: '16px' }} />
                  ERRORS ({progress.errors.length})
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {progress.errors.map((err) => (
                    <div key={`${err.id}-${err.error}`} className="brutal-body mb-1" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      <span className="font-bold">{err.id}:</span> {err.error}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          {isComplete && !hasErrors && (
            <motion.div
              className="brutal-card mb-4"
              style={{ padding: '16px', border: '3px solid #00C853', background: '#F1F8F4' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="brutal-body flex items-center gap-2" style={{ fontSize: '0.875rem', color: '#00C853' }}>
                <Check style={{ width: '16px', height: '16px' }} />
                ALL CHANGES PUSHED SUCCESSFULLY
              </div>
              <div className="brutal-data mt-2" style={{ fontSize: '0.75rem', color: '#3A3A3A' }}>
                {new Date().toLocaleString()}
              </div>
            </motion.div>
          )}

          {/* Close Button (only when complete or error) */}
          {(isComplete || hasErrors) && (
            <button type="button" onClick={onClose} className="brutal-button-primary w-full" style={{ padding: '12px', fontSize: '0.875rem' }}>
              CLOSE
            </button>
          )}
        </div>
      </section>
    </PopUp>
  );
};

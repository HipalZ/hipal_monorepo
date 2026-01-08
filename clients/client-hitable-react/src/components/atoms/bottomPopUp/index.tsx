import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiX } from 'react-icons/hi';

const MemoBottomPopUp = ({
  children,
  show,
  onClose,
  hide,
  linearGradTheme,
  bottomCross,
  height,
}: {
  children: React.ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
  linearGradTheme?: boolean;
  bottomCross?: boolean;
  height?: string;
}) => {
  useEffect(() => {
    if (show) {
      const originalHash = window.location.hash;

      window.location.hash = '#popup';

      const handleHashChange = () => {
        if (window.location.hash !== '#popup') {
          onClose();
        }
      };

      window.addEventListener('hashchange', handleHashChange);
      return () => {
        window.removeEventListener('hashchange', handleHashChange);

        if (window.location.hash === '#popup') {
          if (originalHash) {
            window.location.hash = originalHash;
          } else {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }
      };
    }
  }, [show, onClose]);

  const popupContent = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(5px)',
          }}
          className="fixed inset-0 z-[110] flex items-end justify-center overflow-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ height: height }}
            className={cn(
              'relative h-[100dvh] w-full max-w-md shadow-md',
              !hide && 'rounded-t-[1rem]',
              linearGradTheme ? 'background-gradient' : 'bg-[#ffffff]',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {!hide && (
              <div className="on_active_bounce absolute -top-12 left-[45%] flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center">
                <HiX className="cursor-pointer rounded-full bg-white p-2 text-4xl text-black" onClick={onClose} />
              </div>
            )}
            {children}
            {bottomCross && (
              <button
                type="button"
                onClick={onClose}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#00000080] p-3 text-white"
              >
                <HiX />
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(popupContent, document.body);
};

const BottomPopUp = memo(MemoBottomPopUp);
export default BottomPopUp;

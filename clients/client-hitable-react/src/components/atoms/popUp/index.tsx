import { Button } from '@/components/ui/button';
import { Dialog } from '@headlessui/react';
import { cn } from '@hi/common';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, type ReactNode, type SyntheticEvent } from 'react';
import { HiX } from 'react-icons/hi';

interface PopUpProps {
  children: ReactNode;
  show: boolean;
  onClose: () => void;
  hide?: boolean;
  width?: string;
  height?: string;
  rightTopBack?: boolean;
}

function MemoizedPopUp({ children, show, onClose, hide, width, height, rightTopBack }: PopUpProps) {
  const stopClosing = (e: SyntheticEvent) => {
    if (hide) {
      return onClose();
    }
    e.preventDefault();
  };

  return (
    <AnimatePresence>
      {show && (
        <Dialog open={show} as="div" className="fixed inset-0 z-50" onClose={stopClosing}>
          <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50 px-0 backdrop-blur-sm lg:items-center lg:px-6 lg:pt-[2rem]">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className={cn(
                'relative bg-white shadow-md',
                width ? width : 'w-full max-w-[69rem]',
                height ? height : 'h-auto',
                !hide ? 'rounded-t-[1.5rem] lg:rounded-2xl' : 'lg:rounded-2xl',
              )}
            >
              {!hide && !rightTopBack && (
                <div className="on_active_bounce absolute -top-8 left-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center">
                  <HiX className="cursor-pointer rounded-full bg-white p-2 text-4xl text-black" onClick={onClose} />
                </div>
              )}
              {rightTopBack && (
                <Button className="absolute right-2 top-2 z-50 h-8 w-8 rounded-full" onClick={onClose}>
                  <HiX className="cursor-pointer text-2xl" />
                </Button>
              )}
              {children}
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}

const PopUp = memo(MemoizedPopUp);

export default PopUp;

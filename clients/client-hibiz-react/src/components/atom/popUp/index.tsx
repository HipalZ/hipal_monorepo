import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { cn } from '@/components/utils/helper';
import type { ReactNode } from 'react';
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

export default function PopUp({ children, show, onClose, hide, width, height, rightTopBack }: PopUpProps) {
  return (
    // ✅ do NOT close from onOpenChange
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogOverlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />

      <DialogContent
        className={cn(
          'bg-base-100 fixed z-50 shadow-md',
          width ? width : 'w-full max-w-[69rem]',
          height ? height : 'h-auto',
          !hide ? 'rounded-t-[1.5rem] lg:rounded-2xl' : 'lg:rounded-2xl',
        )}
        // ✅ block all outside interactions (backdrop click)
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        // ✅ optional: also block ESC close
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {!hide && !rightTopBack && (
          <div className="absolute -top-8 left-1/2 z-50 -translate-x-1/2">
            <HiX className="cursor-pointer rounded-full bg-white p-2 text-4xl text-black" onClick={onClose} />
          </div>
        )}

        {rightTopBack && (
          <Button className="absolute right-2 top-2 z-50 h-8 w-8 rounded-full" onClick={onClose} type="button">
            <HiX className="text-2xl" />
          </Button>
        )}

        {children}
      </DialogContent>
    </Dialog>
  );
}

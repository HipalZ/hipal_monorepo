import { cn } from '@hi/common';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { memo } from 'react';
import { ShineBorder } from '../borderAnimations';
import SpinnerMemo from '../loadingSpinner';

interface ButtonConfig {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'reset' | 'submit';
  isLoading?: boolean;
  disable?: boolean;
  hide?: boolean;
  color?: string;
  textColor?: string;
  className?: string;
  isBackButton?: boolean;
  highlight?: boolean;
  borderClasses?: string;
  swipe?: boolean;
  icon?: React.ReactNode;
}

interface MemoBottomButtonProps {
  buttons: ButtonConfig[];
  fixed?: boolean;
  position?: 'left' | 'right' | 'mid';
  align?: 'top' | 'bottom';
  backgroundColor?: string;
  offset?: string;
  maxWidth?: string;
  shadow?: boolean;
}

const buttonVariants = {
  idle: { scale: 1, rotateX: 0, rotateY: 0, translateZ: 0 },
  tap: { scale: 0.75, rotateX: 0, rotateY: 0, translateZ: 0 },
};

function getButtonInnerContent(button: ButtonConfig) {
  const { highlight, borderClasses, isBackButton, isLoading, text, icon: Icon } = button;

  let content;
  if (isBackButton) {
    content = <ChevronLeft />;
  } else if (isLoading) {
    content = <SpinnerMemo />;
  } else {
    content = (
      <div className="flex items-center justify-center gap-2 truncate">
        {Icon && <h3 className="inline-flex items-center">{Icon}</h3>}
        <h3 className="truncate">{text}</h3>
      </div>
    );
  }

  if (highlight) {
    return (
      <ShineBorder color={['#FE8FB5', '#FFBE7B']} borderRadius={4} duration={5} className={borderClasses || ''}>
        {content}
      </ShineBorder>
    );
  }

  return content;
}

function SwipeButton({ button, index, buttonsLength }: { button: ButtonConfig; index: number; buttonsLength: number }) {
  const x = useMotionValue(0);
  const background = useTransform(x, [0, 200], ['#fff', '#22c55e']);

  const handleDragEnd = () => {
    if (x.get() > 150 && button.onClick) {
      button.onClick();
    }
    x.set(0);
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full py-3 text-center transition-all duration-300',
        button.className,
        button?.isLoading ? 'pointer-events-none' : '',
        {
          'cursor-not-allowed opacity-50': button.disable,
          'flex-1': buttonsLength > 1 && !button.isBackButton,
          'w-[54px]': button.isBackButton && index === 0,
          'ml-4': index > 0 && !button.isBackButton,
        },
      )}
      style={{
        backgroundColor: button.disable ? '#cccccc' : (button.color ?? '#000000'),
        color: button.textColor ?? '#ffffff',
      }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">{getButtonInnerContent(button)}</div>

      <motion.div
        className="absolute left-1 top-1 flex h-10 w-10 cursor-grab items-center justify-center rounded-full bg-green-500 shadow-md active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 200 }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x, background }}
      >
        <ChevronRight className="text-black" />
      </motion.div>
    </div>
  );
}

const MemoAdvancedBottomButton = (props: MemoBottomButtonProps) => {
  const { buttons, fixed = true, position = 'mid', align = 'bottom', backgroundColor = '#ffffff', offset = '0', maxWidth, shadow } = props;
  const visibleButtons = buttons.filter((b) => !b.hide);

  const isSingle = visibleButtons.length === 1;

  return (
    <article
      className={cn(
        'z-10 overflow-hidden px-4 py-2 md:bg-transparent',
        {
          fixed: fixed,
          absolute: !fixed,
          'left-0': position === 'left',
          'right-0': position === 'right',
          'mx-auto': position === 'mid',
          'left-0 right-0 w-full': position === 'mid',
        },
        shadow ? 'shadow-[0_-2px_15px_rgba(0,0,0,0.1)]' : '',
      )}
      style={{
        backgroundColor: backgroundColor,
        [align]: offset,
        maxWidth: maxWidth,
      }}
    >
      <div
        className={cn('flex', {
          'justify-between': buttons.length === 2,
          'justify-center': buttons.length !== 2,
          'gap-2': buttons.length > 3,
          'gap-4': buttons.length <= 3,
        })}
      >
        {buttons.map((button, index) =>
          !button.hide ? (
            button.swipe ? (
              <SwipeButton key={button.text} button={button} index={index} buttonsLength={buttons.length} />
            ) : (
              <motion.button
                key={button.text}
                className={cn(
                  'relative overflow-hidden rounded-full py-3 text-center transition-all duration-300',
                  button.className,
                  button?.isLoading ? 'pointer-events-none' : '',
                  {
                    'cursor-not-allowed opacity-50': button.disable,
                    'w-full px-6': isSingle && !button.isBackButton,
                    'w-full': !isSingle && !button.isBackButton,
                    'w-[54px]': button.isBackButton,
                    // 'ml-4': index > 0 && !button.isBackButton && !isSingle,
                  },
                )}
                style={{
                  backgroundColor: button.disable ? '#cccccc' : (button.color ?? '#000000'),
                  color: button.textColor ?? '#ffffff',
                }}
                onClick={!button.disable ? button.onClick : undefined}
                type={button.type ?? 'button'}
                disabled={button.disable}
                variants={buttonVariants}
                initial="idle"
                whileHover="hover"
                whileTap="tap"
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                {getButtonInnerContent(button)}
              </motion.button>
            )
          ) : null,
        )}
      </div>
    </article>
  );
};

const AdvancedBottomButton = memo(MemoAdvancedBottomButton);
export default AdvancedBottomButton;

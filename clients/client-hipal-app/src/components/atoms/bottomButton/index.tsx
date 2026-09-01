import { cn } from '@hi/common';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';
import { ShineBorder } from '../borderAnimations';
import LoadingSpinnerCircle from '../loader';

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

const DEFAULT_BUTTON_COLOR = 'var(--hotel-action-bg, #111111)';
const DEFAULT_BUTTON_TEXT_COLOR = 'var(--hotel-action-fg, #ffffff)';

function getButtonInnerContent(button: ButtonConfig) {
  const { highlight, borderClasses, isBackButton, isLoading, text, icon: Icon } = button;

  let content;
  if (isBackButton) {
    content = <ChevronLeft />;
  } else if (isLoading) {
    content = <LoadingSpinnerCircle />;
  } else {
    content = (
      <div className="flex w-full items-center justify-center gap-2 truncate">
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
  const [swiped, setSwiped] = useState(false);

  // Color fill background: white to green (glass effect)
  const background = useTransform(
    x,
    [0, 200],
    ['linear-gradient(90deg,rgba(255,255,255,0.7),rgba(245,245,245,0.95))', 'linear-gradient(90deg,#22c55e 60%,#16a34a 100%)'],
  );

  const pillShadow = '0 1px 6px 0 rgba(40,60,90,0.05), 0 3px 12px 0 rgba(40,60,90,0.08)';

  const textOpacity = useTransform(x, [0, 120], [1, 0]);
  const successOpacity = useTransform(x, [150, 200], [0, 1]);

  const handleDragEnd = () => {
    if (x.get() > 150 && button.onClick && !button.disable && !button.isLoading) {
      setSwiped(true);
      button.onClick();
      animate(x, 200, { duration: 0.3 });
      setTimeout(() => {
        animate(x, 0, { duration: 0.5 });
        setSwiped(false);
      }, 1200);
    } else {
      animate(x, 0, { duration: 0.3 });
    }
  };

  return (
    <div
      className={cn(
        'relative select-none overflow-hidden rounded-full py-3 text-center shadow-2xl transition-all duration-300',
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
        backgroundColor: button.disable ? '#cccccc' : (button.color ?? DEFAULT_BUTTON_COLOR),
        color: button.textColor ?? DEFAULT_BUTTON_TEXT_COLOR,
        boxShadow: pillShadow,
      }}
    >
      {/* Animated progress fill (with glass effect) */}
      <motion.div className="pointer-events-none absolute inset-0 z-0 rounded-full" style={{ background, width: x }} />
      {/* Main button content */}
      <motion.div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" style={{ opacity: textOpacity }}>
        {getButtonInnerContent(button)}
      </motion.div>
      {/* Success checkmark */}
      <motion.div className="absolute inset-0 z-20 flex items-center justify-center" style={{ opacity: successOpacity }}>
        <Check className="h-7 w-7 rounded-full bg-green-600 p-1 text-white" />
      </motion.div>
      {/* Drag handle */}
      <motion.div
        className="absolute left-2 top-1.5 z-30 flex h-[1.75rem] w-[1.75rem] cursor-grab items-center justify-center rounded-full border border-gray-200 bg-white shadow-md active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 200 }}
        dragElastic={0}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.97 }}
      >
        <ChevronRight className="h-5 w-5 text-green-600" />
      </motion.div>
    </div>
  );
}

const MemoCommonBottomButton = (props: MemoBottomButtonProps) => {
  const { buttons, fixed = true, position = 'mid', align = 'bottom', backgroundColor = '#ffffff', offset = '0', maxWidth, shadow } = props;

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
                  'relative w-full overflow-hidden rounded-full px-4 py-3 text-center transition-all duration-300',
                  button.className,
                  button?.isLoading ? 'pointer-events-none' : '',
                  {
                    'cursor-not-allowed opacity-50': button.disable,
                    'flex-1': buttons.length > 1 && !button.isBackButton,
                    'w-[54px]': button.isBackButton && index === 0,
                    'ml-4': index > 0 && !button.isBackButton,
                  },
                )}
                style={{
                  backgroundColor: button.disable ? '#cccccc' : (button.color ?? DEFAULT_BUTTON_COLOR),
                  color: button.textColor ?? DEFAULT_BUTTON_TEXT_COLOR,
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

const CommonBottomButton = memo(MemoCommonBottomButton);
export default CommonBottomButton;

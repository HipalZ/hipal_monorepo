import { cn } from '@hi/common';
import type { ReactNode } from 'react';

interface BackgroundProps {
  children: ReactNode;
  className?: string;
}

const Background = ({ children, className }: BackgroundProps) => {
  return <div className={cn('my-2 rounded-2xl bg-white p-3', className)}>{children}</div>;
};

export default Background;

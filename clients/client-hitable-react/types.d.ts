// types.d.ts
declare module '@material-tailwind/react' {
    import * as React from 'react';
  
    interface AlertProps {
      icon?: React.ReactNode;
      animate?: {
        mount: { scale: number; y: number };
        unmount: { scale: number; y: number };
      };
      className?: string;
      children?: React.ReactNode;
    }
  
    export const Alert: React.ForwardRefExoticComponent<AlertProps & React.RefAttributes<HTMLDivElement>>;
  }
  
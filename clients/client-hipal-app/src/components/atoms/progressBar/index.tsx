"use client";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
type Props = {children?: React.ReactNode;};

const ProgressProvider = ({ children }: Props) => {
return (
<>
  <ProgressBar
    height="4px"
    color="hsl(var(--p))"
    options={{ showSpinner: true }}
    // shallowRouting
  />
  {children}
</>
);};

export default ProgressProvider;
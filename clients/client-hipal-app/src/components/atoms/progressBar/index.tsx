"use client";
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
type Props = {children?: React.ReactNode;};

const ProgressProvider = ({ children }: Props) => {
return (
<>
  <ProgressBar
    height="4px"
    color="#000"
    options={{ showSpinner: true }}
    shallowRouting
  />
  {children}
</>
);};

export default ProgressProvider;
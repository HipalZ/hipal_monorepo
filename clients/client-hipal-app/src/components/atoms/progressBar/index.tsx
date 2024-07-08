"use client";
import { _useAllBusiness } from '@/components/store/useAllBusiness';
import type { IBusinessData } from '@/components/types/businessData';
import { updateTheme } from '@/components/utils/themes';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
import { memo, useEffect } from 'react';
type Props = { children?: React.ReactNode; };

const ProgressProvider = ({ children }: Props) => {
  const businessData = _useAllBusiness(s => s.data) as IBusinessData

  useEffect(() => {
    if (businessData.settings?.themes) {
      updateTheme(businessData.settings.themes)
    }
  },[])
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
  );
};

const MemoProgressProvider = memo(ProgressProvider);
export default MemoProgressProvider;
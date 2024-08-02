"use client";
import { _useAllBusiness } from '@/components/store/useAllBusiness';
import type { IBusinessData } from '@/components/types/businessData';
import { useParams } from 'next/navigation';
import { memo } from 'react';
type Props = { children?: React.ReactNode; };

const ProgressProvider = ({ children }: Props) => {
  const businessData = _useAllBusiness(s => s.data) as IBusinessData
  const params= useParams()
  console.log('params', params);




  return (
    <body  className='max-w-[30rem]'>
      {children}
    </body>
  );
};

const MemoProgressProvider = memo(ProgressProvider);
export default MemoProgressProvider;
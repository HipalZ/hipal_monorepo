import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import Link from 'next/link';
import React, { memo } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { MdMenuOpen } from 'react-icons/md';

interface HeaderProps {
  children: React.ReactNode;
  businessId: string;
  zoneId: string;
  tableId: string;
  setCurrentView: (str: string) => void;
}

function TableHeader({ children, businessId, zoneId, setCurrentView }: HeaderProps) {
  return (
    <div className="flex w-full justify-between pt-[2rem]">
      <Link href={routePaths[PAGE_TYPES.TABLES](businessId, zoneId)}>
        <HiArrowLeft className="text-2xl" />
      </Link>
      {children} <MdMenuOpen onClick={() => setCurrentView('kick')} className="text-2xl" />
    </div>
  );
}

export default memo(TableHeader);

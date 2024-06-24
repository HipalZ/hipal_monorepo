import Loader from '@/components/atoms/loader';
import dynamic from 'next/dynamic';
import { memo, useState } from 'react';

const TablePos = dynamic(() => import('@/components/templates/pos'), {
  ssr: false,
  loading: () => <Loader />,
});
const KickUser = dynamic(() => import('@/components/templates/kick'), {
  loading: () => <Loader />,
});
const MergeTables = dynamic(() => import('@/components/templates/merge'), {
  loading: () => <Loader />,
});
const Switch = dynamic(() => import('@/components/templates/switch'), {
  loading: () => <Loader />,
});

function Pos() {
  const [currentView, setCurrentView] = useState('pos');
  const renderCurrentView = () => {
    switch (currentView) {
      case 'pos':
        return <TablePos setCurrentView={setCurrentView} />;
      case 'kick':
        return <KickUser setCurrentView={setCurrentView} />;
      case 'merge':
        return <MergeTables setCurrentView={setCurrentView} />;
      case 'switch':
        return <Switch setCurrentView={setCurrentView} />;
      default:
        return <TablePos setCurrentView={setCurrentView} />;
    }
  };

  return <>{renderCurrentView()}</>;
}

export default memo(Pos);

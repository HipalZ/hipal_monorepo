import Footer from '@/components/atoms/footer';
import Loader from '@/components/atoms/loader';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const Zones = dynamic(() => import('@/components/templates/zone'), {
  ssr: false,
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const Setting = dynamic(() => import('@/components/templates/setting'), {
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const SalesReport = dynamic(() => import('@/components/templates/sales'), {
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const Bill = dynamic(() => import('@/components/templates/bills'), {
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
export type ICurrentView = 'zone' | 'sale' | 'setting' | 'bills';

function Start() {
  const [currentView, setCurrentView] = useState<ICurrentView>('zone');
  const renderCurrentView = () => {
    switch (currentView) {
      case 'sale':
        return <SalesReport setCurrentView={setCurrentView} />;
      case 'setting':
        return <Setting setCurrentView={setCurrentView} />;
      case 'bills':
        return <Bill setCurrentView={setCurrentView} />;
      case 'zone':
        return <Zones setCurrentView={setCurrentView} />;
      default:
        return <Zones setCurrentView={setCurrentView} />;
    }
  };
  return (
    <div>
      {renderCurrentView()}
      <Footer currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default Start;

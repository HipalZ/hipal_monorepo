import HiPalLogo from '@/assets/svg/hipalLogoNew.svg';
import Loader from '@/components/atoms/loader';
import Skeleton from '@/components/atoms/skeleton';
import Header from '@/components/molecules/header';
import TestFooter from '@/components/molecules/testFooter';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { memo, useState } from 'react';

const Table = dynamic(() => import('@/components/templates/table'), {
  ssr: false,
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const Alert = dynamic(() => import('@/components/templates/alert'), {
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const Orders = dynamic(() => import('@/components/templates/order'), {
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const Status = dynamic(() => import('@/components/templates/status'), {
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const History = dynamic(() => import('@/components/templates/history'), {
  loading: () => (
    <div>
      <Skeleton />
    </div>
  ),
});

function Test() {
  const [currentView, setCurrentView] = useState('table');
  const router = useRouter();
  const { businessId } = router.query as {
    businessId: string;
  };
  const renderCurrentView = () => {
    switch (currentView) {
      case 'table':
        return <Table />;
      case 'alert':
        return <Alert />;
      case 'order':
        return <Orders setCurrentView={setCurrentView} />;
      case 'status':
        return <Status />;
      case 'history':
        return <History setCurrentView={setCurrentView} />;

      default:
        return <Table />;
    }
  };
  const goBack = () => {
    switch (currentView) {
      case 'table':
        router.push(`/r/${businessId}/zone`);
        break;
      case 'alert':
        setCurrentView('table');
        break;
      case 'order':
        setCurrentView('table');
        break;
      case 'status':
        setCurrentView('table');
        break;
      case 'history':
        setCurrentView('table');
        break;
      default:
        router.push(`/r/${businessId}/zone`);
        break;
    }
  };
  return (
    <div className="bg-secondary relative min-h-screen">
      <Header goBack={goBack}>
        <Image className="mr-6" width={68} height={25} src={HiPalLogo} alt="Hi Table Logo" />
      </Header>
      {renderCurrentView()}
      <TestFooter currentView={currentView} setCurrentView={setCurrentView} />
    </div>
  );
}

export default memo(Test);

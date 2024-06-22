import React, { Suspense, lazy } from 'react';
import { SectionWithLogo } from './signup';
import LoadingSpinner from '@/components/atom/loadingSpinner';

// Lazy load the components
const Login = lazy(() => import('@/components/templates/loginPage/login'));

const Home: React.FC = () => {
  return (
    <Suspense fallback={<div><LoadingSpinner /></div>}>
      <SectionWithLogo>
        <Login />
      </SectionWithLogo>
    </Suspense>
  );
};

export default Home;

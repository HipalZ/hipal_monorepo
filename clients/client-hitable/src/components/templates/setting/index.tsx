import { useLogin } from '@/components/store/useLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import { memo, useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { toast } from 'react-toastify';

function Setting({ setCurrentView }) {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const isLogin = useLogin((s) => s.isLogin);
  const handleImageClick = () => {
    setCurrentView('zone');
  };

  const handleLogout = () => {
    useLogin.getState().setIsLogin(false);
    localStorage.clear();
    toast.success('Logout Successful...');
    router.push(singleRoute[PAGE_TYPES.LOGIN](businessId));
  };

  useEffect(() => {
    if (!isLogin) {
      router.push(singleRoute[PAGE_TYPES.LOGIN](businessId));
    }
  }, []);

  return (
    <div className="bg-secondary min-h-screen px-6 pt-4">
      <div className="flex items-center">
        <HiArrowLeft onClick={handleImageClick} className="mr-[1.5rem] text-2xl" />
        <span>Settings</span>
      </div>
      <button
        type="button"
        className="text-base-content bg-base-100 border-base-300 mt-4 w-full max-w-[30rem] rounded-2xl border py-2 pl-6 text-sm"
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
}

export default memo(Setting);

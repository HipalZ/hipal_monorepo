import { useUserLogin } from '@/components/store/useUserLogin';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { startTransition, useEffect } from 'react';
import { HiArrowLeft } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

function Setting() {
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const isLogin = useUserLogin((s) => s.isLogin);
  const handleImageClick = () => {
    startTransition(() => {
      navigate(singleRoute[PAGE_TYPES.KITCHENS](businessId || ''));
    });
  };

  const handleLogout = () => {
    useUserLogin.getState().setIsLogin(false);
    localStorage.clear();
    toast.success('Logout Successful...');
    startTransition(() => {
      navigate(singleRoute[PAGE_TYPES.LOGIN](businessId || ''));
    });
  };

  useEffect(() => {
    if (!isLogin) {
      startTransition(() => {
        navigate(singleRoute[PAGE_TYPES.LOGIN](businessId || ''));
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-6 pt-4">
      <div className="flex items-center">
        <HiArrowLeft onClick={handleImageClick} className="mr-[1.5rem] text-2xl" />
        <span>Settings</span>
      </div>
      <div className="mt-4 rounded-2xl bg-white py-2 pl-6 text-sm" onClick={handleLogout}>
        Log Out
      </div>
    </div>
  );
}

export default Setting;

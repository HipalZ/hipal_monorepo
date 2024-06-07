import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { useRouter } from 'next/router';
import { BiLogOut } from 'react-icons/bi';
import { toast } from 'react-toastify';

const Logout = () => {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  async function redirect() {
    toast.success('Logout Successful...');
    router.push(singleRoute[PAGE_TYPES.LOGIN_LITE](businessId));
  }
  async function logOutWaiter() {
    await redirect();
    localStorage.clear();
  }
  return (
    <div onClick={logOutWaiter}>
      <BiLogOut size={20} />
    </div>
  );
};

export default Logout;

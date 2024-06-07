import HipeopleLogo from '@/assets/svg/hiBizlogo.svg';
import ChangeOwnerPassword from '@/components/atom/changeOwnerPassword';
import PopUp from '@/components/atom/popUp';
import Header from '@/components/molecules/header';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { memo, startTransition, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const Profile = memo(() => {
  const navigate = useNavigate();
  const user = useOwnerLogin((s) => s.user);
  const password = useOwnerLogin((s) => s.password);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(-1);
    });
  };

  return (
    <div className="relative">
      <div className="border-b border-[#cacaca] bg-[#f5f5f5] pb-4">
        <div className="sticky top-0 z-10 w-full bg-[#f5f5f5] pb-4">
          {' '}
          <Header leftIcon={<BsChevronLeft />} onBack={handleBack} centerImage={HipeopleLogo} rightImage={HipeopleLogo} isIconBusinessShow={true} />
        </div>
        <div className=" m-auto flex flex-col items-center justify-center pt-[5rem] text-white">
          <div className="h-[4rem] w-[4rem] rounded-full bg-[#2B354D] pt-4 text-center text-xl capitalize">{user.name.charAt(0)}</div>
          <span className="pt-4 text-2xl text-[#2B354D]">{user.name}</span>
          <span className="text-base font-medium text-[#2B354D]">{user.role}</span>
        </div>
      </div>

      <div>
        <div
          onClick={openModal}
          className="on_active_bounce mx-6 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#2B354D]"
        >
          <div className="flex items-center px-4 py-2">
            <span>Password</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm opacity-60">{password ? password : user?.password}</span>
            <span className="text-sm font-semibold">Change</span>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <PopUp show={isModalOpen} onClose={closeModal}>
          <ChangeOwnerPassword closeModal={closeModal} user={user} />
        </PopUp>
      )}
    </div>
  );
});

export default Profile;

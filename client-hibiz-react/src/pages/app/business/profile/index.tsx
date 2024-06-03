import { BsChevronLeft } from "react-icons/bs";
import { memo, startTransition, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import ChangeOwnerPassword from "@/components/atom/changeOwnerPassword";
import Header from "@/components/molecules/header";
import HipeopleLogo from "@/assets/svg/hiBizlogo.svg";
import PopUp from "@/components/atom/popUp";

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
  }

  return (
    <div className="relative">
      <div className="bg-[#f5f5f5] border-b border-[#cacaca] pb-4">
        <div className="sticky top-0 w-full z-10 bg-[#f5f5f5] pb-4">
          {" "}
          <Header
            leftIcon={<BsChevronLeft />}
            onBack={handleBack}
            centerImage={HipeopleLogo}
            rightImage={HipeopleLogo}
            isIconBusinessShow={true}
          />
        </div>
        <div className=" m-auto flex flex-col justify-center text-white items-center pt-[5rem]">
          <div className="h-[4rem] w-[4rem] capitalize text-xl text-center pt-4 rounded-full bg-[#2B354D]">
            {user.name.charAt(0)}
          </div>
          <span className="text-[#2B354D] text-2xl pt-4">{user.name}</span>
          <span className="text-[#2B354D] font-medium text-base">
            {user.role}
          </span>
        </div>
      </div>

      <div>
        <div
          onClick={openModal}
          className="mx-6 mt-6 on_active_bounce bg-white text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
        >
          <div className="flex items-center px-4 py-2">
            <span>Password</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm opacity-60">
              {password ? password : user?.password}
            </span>
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
})

export default Profile;

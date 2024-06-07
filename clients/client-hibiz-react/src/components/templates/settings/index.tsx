import HipeopleLogo from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import TimePicker from '@/components/atom/timePicker';
import ErrorComponent from '@/components/errorComponent';
import Header from '@/components/molecules/header';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import useTimings from '@/components/store/useTimings';
import type { IBusinessData } from '@/components/types/businessData';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useEffect, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { useNavigate, useParams } from 'react-router-dom';
import PasswordManager from '../passwordManager';

const BusinessSettings = memo(() => {
  const navigate = useNavigate();
  const { setSelectedIcon } = useSelectedIcon();
  const selectedSubIcon = useSelectedIcon((s) => s.selectedSubIcon);
  const setSelectedSubIcon = useSelectedIcon((s) => s.setSelectedSubIcon);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { dayIn, dayOut } = useTimings();
  const [businessData, setBusinessData] = useState<IBusinessData | null>(null);
  const { businessId } = useParams<{ businessId: string }>();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const fetchBusinessData = async () => {
    try {
      const response = await axios.get(`/v1/businesses/get/Single/${businessId}`);
      setBusinessData(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching business data', error);
    }
  };

  const setBusinssTime = async () => {
    try {
      const response = await axios.get(`/v1/businesses/get/Single/${businessId}?open=${dayIn}&close=${dayOut}`);
      setBusinessData(response.data);
      closeModal();
    } catch (error) {
      console.error('Error fetching business data', error);
    }
  };
  useEffect(() => {
    if (selectedSubIcon === 'passwordManager') {
      setSelectedSubIcon('passwordManager');
    }
  }, [businessId]);
  function redirectPasswords() {
    setSelectedSubIcon('passwordManager');
  }

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['businessSettings', businessId],
    queryFn: fetchBusinessData,
    enabled: !!businessId,
  });

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
    setSelectedIcon('');
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorComponent refetch={refetch} />;

  const Settings = () => {
    return (
      <div>
        <div className="bg-[#f5f5f5]">
          <Header
            title="Settings"
            onBack={handleBack}
            isIconBusinessShow={false}
            leftIcon={<BsChevronLeft />}
            centerImage={HipeopleLogo}
            rightImage={HipeopleLogo}
          />
          <div className="mt-4 flex flex-col items-center justify-center border-b border-[#cacaca] pb-4 text-center text-2xl">
            <img src={businessData?.logo} alt="Bimage" height={100} width={100} className="rounded-full" loading="lazy" />
            {businessData?.businessName}
          </div>
        </div>
        <div
          onClick={openModal}
          className="on_active_bounce mx-6 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#2B354D]"
        >
          <div className="flex items-center px-4 py-2">
            <span>Business timings</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm opacity-60">
              {businessData?.open} to {businessData?.close}
            </span>
            <span>Edit</span>
          </div>
        </div>
        <PopUp show={isModalOpen} onClose={closeModal}>
          <div className="mx-6">
            <div className="mt-2 flex items-center justify-between text-sm font-medium">
              <h3 className="mb-4 pt-2 text-xl font-medium text-[#2B354D]">Business timings</h3>
            </div>
            <div>
              <TimePicker />
            </div>
            <div className="w-full rotate-180 py-2">
              <div className="mx-auto flex rotate-180 flex-col justify-items-center">
                <button
                  type="button"
                  onClick={setBusinssTime}
                  className="min-w-389 my-auto min-h-[3rem] min-w-[95%] rounded-xl bg-[#2B354D] !py-2 text-[1rem] font-semibold text-white md:min-w-[75%] lg:min-w-[55%] xl:min-w-[55%]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </PopUp>
        <div onClick={redirectPasswords} className="m-5 flex cursor-pointer justify-between rounded-lg border border-[#cacaca] p-4 text-[#2B354D]">
          <p>Manage Passwords</p>
        </div>
      </div>
    );
  };
  const renderContent = () => {
    switch (selectedSubIcon) {
      case 'passwordManager':
        return <PasswordManager setSettings={setSelectedSubIcon} />;
      default:
        return <Settings />;
    }
  };

  return <>{renderContent()}</>;
});

export default BusinessSettings;

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
import { FaArrowLeft } from 'react-icons/fa';
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
      setBusinessData(response.data.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching business data', error);
    }
  };

  const setBusinssTime = async () => {
    try {
      const response = await axios.get(`/v1/businesses/get/Single/${businessId}?open=${dayIn}&close=${dayOut}`);
      setBusinessData(response.data.data);
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
       <div className="linear_gradient_background">
          <Header
            title="Settings"
            onBack={handleBack}
            isIconBusinessShow={false}
            leftIcon={<FaArrowLeft />}
            centerImage={HipeopleLogo}
            rightImage={HipeopleLogo}
          />
          <div className="flex flex-col items-center justify-center pb-4 mt-4 text-2xl text-center">
            <img src={businessData?.logo} alt="Bimage" height={100} width={100} className="rounded-full" loading="lazy" />
            {businessData?.businessName}
          </div>
        </div>
        <div
          onClick={openModal}
          className="on_active_bounce mx-6 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#000000]"
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
            <div className="flex items-center justify-between mt-2 text-sm font-medium">
              <h3 className="mb-4 pt-2 text-xl font-medium text-[#000000]">Business timings</h3>
            </div>
            <div>
              <TimePicker />
            </div>
            <div className="w-full py-2 rotate-180">
              <div className="flex flex-col mx-auto rotate-180 justify-items-center">
                <button
                  type="button"
                  onClick={setBusinssTime}
                  className="min-w-389 my-auto min-h-[3rem] min-w-[95%] rounded-xl bg-[#000000] !py-2 text-[1rem] font-semibold text-white md:min-w-[75%] lg:min-w-[55%] xl:min-w-[55%]"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </PopUp>
        <div onClick={redirectPasswords} className="m-5 flex cursor-pointer justify-between rounded-lg border border-[#cacaca] p-4 text-[#000000]">
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

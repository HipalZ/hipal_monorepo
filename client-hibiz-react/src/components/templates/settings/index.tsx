import Header from "@/components/molecules/header";
import { memo, startTransition, useEffect, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import HipeopleLogo from "@/assets/svg/hi.svg";
import PopUp from "@/components/atom/popUp";
import TimePicker from "@/components/atom/timePicker";
import useTimings from "@/components/store/useTimings";
import axios from '@/axios';
import type { IBusinessData } from "@/components/types/businessData";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import PasswordManager from "../passwordManager";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import ErrorComponent from "@/components/errorComponent";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { routeToDashboard } from "@/components/utils/routes";

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
      const response = await axios.get(
        `/v1/businesses/get/Single/${businessId}`
      );
      setBusinessData(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };

  const setBusinssTime = async () => {
    try {
      const response = await axios.get(
        `/v1/businesses/get/Single/${businessId}?open=${dayIn}&close=${dayOut}`
      );
      setBusinessData(response.data);
      closeModal();
    } catch (error) {
      console.error("Error fetching business data", error);
    }
  };
  useEffect(() => {
    if(selectedSubIcon === "passwordManager"){
      setSelectedSubIcon("passwordManager")
    }
  }, [businessId]);
  function redirectPasswords() {
    setSelectedSubIcon("passwordManager")
  }

  const {isLoading, error, data,refetch} = useQuery({
    queryKey: ['businessSettings', businessId],
    queryFn: fetchBusinessData,
    enabled: !!businessId
  })

  const handleBack = () => {
		startTransition(() => {
			navigate(routeToDashboard(businessId as string));
		})
    setSelectedIcon("")
	}

  if (isLoading) return <LoadingSpinner/>
  if (error) return <ErrorComponent refetch={refetch}/>

  const Settings = () => {
    return(
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
        <div className="flex flex-col items-center justify-center text-center text-2xl mt-4 pb-4 border-b border-[#cacaca]">
          <img src={businessData?.logo} alt="Bimage" height={100} width={100} className="rounded-full" loading="lazy"/>
          {businessData?.businessName}
        </div>
      </div>
      <div
        onClick={openModal}
        className="mx-6 mt-6 on_active_bounce bg-white text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
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
            <h3 className="text-xl mb-4 pt-2 font-medium text-[#2B354D]">
              Business timings
            </h3>
          </div>
          <div>
            <TimePicker />
          </div>
          <div className="w-full py-2 rotate-180">
            <div className="flex flex-col mx-auto rotate-180 justify-items-center">
              <button
                type="button"
                onClick={setBusinssTime}
                className="min-h-[3rem] font-semibold bg-[#2B354D] text-white text-[1rem] rounded-xl min-w-389 min-w-[95%] md:min-w-[75%] lg:min-w-[55%] xl:min-w-[55%] my-auto !py-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </PopUp>
      <div onClick={redirectPasswords} className="flex justify-between border cursor-pointer border-[#cacaca] rounded-lg p-4 text-[#2B354D] m-5">
        <p>Manage Passwords</p>
      </div>
    </div>
    )
  }
  const renderContent=()=>{
    switch (selectedSubIcon) {
      case 'passwordManager':
        return <PasswordManager setSettings={setSelectedSubIcon}/>    
      default:
        return <Settings/>
    }
  }
 
  return (
    <>{renderContent()}</>
  );
})

export default BusinessSettings;

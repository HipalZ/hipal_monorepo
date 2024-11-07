import MemoizedHeader from "@/components/molecules/header";
import useBusinessData from "@/components/store/useBusinessData";
import { memo, useCallback } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Hi from "@/assets/svg/hi.svg";

const MemoCampaigns = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();
  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessData?._id}/whatzapp`);
  }, [navigate, businessData?._id]);
  return (
    <main className="bg-[#FFF8F2] min-h-[100dvh]">
      <div className="sticky top-0 z-50 w-full linear_gradient_background">
        <MemoizedHeader
          title="WhatzApp"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
        />
      </div>
    </main>
  );
};

const Campaigns = memo(MemoCampaigns);
export default Campaigns;

import { useCallback, lazy, memo } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Header from "@/components/molecules/header";
import Hi from "@/assets/svg/hi.svg";
import useBusinessData from "@/components/store/useBusinessData";

const Setting = lazy(
  () => import("@/components/templates/businessForm/setting"),
);

const MainBusinessPage: React.FC = () => {
  const navigate = useNavigate();
  const businessId = useBusinessData((s) => s.businessData?._id);

  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessId}`);
  }, [businessId, navigate]);

  return (
    <main className="business_control_background">
      <div className="linear_gradient_background">
        <Header
          title="Themes"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={true}
        />
      </div>
      <Setting />
    </main>
  );
};

const MemoizedMainBusinessPage = memo(MainBusinessPage);
export default MemoizedMainBusinessPage;

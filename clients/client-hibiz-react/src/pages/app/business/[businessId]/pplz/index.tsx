import MemoizedHeader from "@/components/molecules/header";
import { FaArrowLeft } from "react-icons/fa";
import Hi from "@/assets/svg/hi.svg";
import { useNavigate } from "react-router-dom";
import useBusinessData from "@/components/store/useBusinessData";

const Pplz = () => {
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(`/app/business/${businessData?._id}`);
  };

  return (
    <>
      <section>
        <MemoizedHeader
          title="Hi Pplz"
          onBack={handleBack}
          leftIcon={<FaArrowLeft />}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
      </section>
    </>
  );
};

export default Pplz;

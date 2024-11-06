import Hand from "@/assets/login/hand.png";
import useBusinessCtrl from "@/components/store/useBusinessCtrl";
import { useNavigate } from "react-router-dom";

const Congratulation = () => {
  const { reset } = useBusinessCtrl();
  const navigate = useNavigate();

  const goToBusinessDashboard = () => {
    navigate("/app/business");
    reset();
  };
  return (
    <>
      {" "}
      <img
        className="absolute left-0 right-0 m-auto -top-[6.5rem]"
        width={63}
        height={73}
        src={Hand}
        alt="Hipal_hand"
      />
      <h3 className="mt-2 text-xl font-semibold leading-8">
        🥳CongratulationZ !!!
      </h3>
      <h3 className="flex mb-6 leading-8"> We are your partnerZ in growth</h3>
      <button
        onClick={goToBusinessDashboard}
        type="button"
        className="action_btn"
      >
        Register my biz
      </button>
    </>
  );
};

export default Congratulation;

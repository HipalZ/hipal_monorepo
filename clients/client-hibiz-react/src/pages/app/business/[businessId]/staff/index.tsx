import Hi from "@/assets/svg/hi.svg";
import axios from "@/axios";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import Header from "@/components/molecules/header";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import type { UserProfile } from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import { routeToDashboard } from "@/components/utils/routes";
import { useQuery } from "@tanstack/react-query";
import { memo, startTransition, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import NoStaff from "@/assets/noStaff.png";
import Avatar from "@/assets/avtarStaff.png";
import NewAddStaff from "@/components/molecules/addStaffpopup/addStaff";

const StaffPage = () => {
  const user = useOwnerLogin((s) => s.user);
  const { businessId } = useParams<{ businessId: string }>();
  const navigate = useNavigate();
  const [staffDetails, setStaffDetails] = useState<UserProfile[]>([]);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const handleStaffDetails = (staffId: string) => {
    startTransition(() => {
      navigate(`/app/business/${businessId}/staff/${staffId}`);
    });
  };
  const addStaff = () => {
    setIsAddStaffOpen(true);
  };

  const getStaff = async () => {
    const url = paths.getAllStaff(businessId || "");

    try {
      const response = await axios.get(url);
      const filteredStaff = response.data.data.filter((staff: UserProfile) => staff._id !== user._id);
      setStaffDetails(filteredStaff);
      return response.data.data;
    } catch (error) {
      console.error("Error fetching staff details:", error);
    }
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ["staff", businessId],
    queryFn: getStaff,
    enabled: !!businessId,
  });


  return (
    <>
      <main className="bg-white">
        <div className="sticky top-0 z-50 w-full pb-4 linear_gradient_background">
          <Header
            title="Staff"
            onBack={handleBack}
            leftIcon={<FaArrowLeft />}
            centerImage={Hi}
            rightImage={Hi}
            isIconBusinessShow={false}
          />
        </div>

        {staffDetails.length > 0 ? (
          <div className="business_system_cards">
            {staffDetails.map((staff: UserProfile) => (
              <div
                key={staff._id}
                onClick={() => handleStaffDetails(staff?._id)}
                className="on_active_bounce p-4 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#000000]"
              >
                <img src={Avatar} alt="Avatar" />
                <div className="flex flex-col pt-6 pb-2">
                  <span>{staff?.name}</span>

                  <span className="ml-1 text-sm opacity-60">{staff?.customRole?.[0]?.roleName}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fixed flex flex-col text-center transform -translate-x-1/2 left-1/2 top-1/3">
            <img width={282} height={202} src={NoStaff} alt="NoStaff" />
          </div>
        )}
      </main>

      <button type="button" onClick={addStaff} className="bottom_btn">
        Add Staff
      </button>
      {isAddStaffOpen && (
        <PopUp show={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)}>
          <NewAddStaff />
        </PopUp>
      )}
      {isLoading && <LoadingSpinner />}
    </>
  );
};

const MemoizedStaff = memo(StaffPage);

export default MemoizedStaff;
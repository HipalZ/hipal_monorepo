import Hi from "@/assets/svg/hi.svg";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import PopUp from "@/components/atom/popUp";
import Header from "@/components/molecules/header";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import type { CustomRole, UserProfile } from "@/components/types/businessData";
import { routeToDashboard } from "@/components/utils/routes";
import { useQuery } from "@tanstack/react-query";
import { memo, startTransition, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NoStaff from "@/assets/noStaff.png";
import Avatar from "@/assets/avtarStaff.png";
import NewAddStaff from "@/components/molecules/addStaffpopup/addStaff";
import { apiRpc } from "@hi/common";
import useBusinessData from "@/components/store/useBusinessData";
import {
  getUserPermissionsForRole,
  type role,
  useAddStaffStore,
} from "@/components/store/useAddStaffStore";
import EditStaff from "@/components/molecules/addStaffpopup/editStaff";
import toast from "react-hot-toast";
import BottomButton from "@/components/atom/bottomButton";

const StaffPage = () => {
  const user = useOwnerLogin((s) => s.user);
  const businessData = useBusinessData((s) => s.businessData);
  const navigate = useNavigate();
  const [staffDetails, setStaffDetails] = useState<UserProfile[]>([]);
  const {
    setName,
    setPhone,
    setSelectedRole,
    setPermissionsBasedOnRole,
    setIsEditing,
    setEditStaffId,
    setPageToggle,
    setPermissions,
    setSelectedPermissions,
    isEditStaffOpen,
    setIsEditStaffOpen,
    isAddStaffOpen,
    setIsAddStaffOpen,
  } = useAddStaffStore();

  const fetchPermissions = async () => {
    const res = await apiRpc.businesses[":businessId"].permissions.$get({
      param: {
        businessId: businessData?._id,
      },
    });
    const data = await res.json();
    if (res.status === 200 || res.status === 201) {
      setPermissions(data.data);
    } else {
      toast.error("Failed to fetch permissions");
    }
    return data.data;
  };

  const handleStaffDetails = async (staff: UserProfile) => {
    const matchingData = staff.customRole.filter(
      (item: CustomRole) => item.businessId === businessData?._id,
    );
    const role = matchingData[0].role as role;
    console.log(matchingData);
    setSelectedRole(role);
    setPermissionsBasedOnRole(staff.role);
    const permissionsData = await fetchPermissions();
    const userPermissions =
      permissionsData[role as keyof typeof permissionsData];
    const userSelectedPermissions = getUserPermissionsForRole(
      userPermissions,
      matchingData[0].permissions,
    );
    setPermissions(userPermissions);
    setSelectedPermissions(userSelectedPermissions);
    setEditStaffId(staff._id);
    setName(staff.name);
    setPhone(staff.phone);
    setPageToggle("EDIT_STAFF");
    setIsEditing(true);
    setIsEditStaffOpen(true);
  };

  const closeEditModal = () => {
    setName("");
    setPhone("");
    setSelectedRole("");
    setPermissionsBasedOnRole("");
    setIsEditing(false);
    setEditStaffId("");
    setIsEditStaffOpen(false);
    setPageToggle("");
  };

  const addStaff = () => {
    setPageToggle("ADD_STAFF");
    setIsAddStaffOpen(true);
  };

  const getStaff = async () => {
    const res = await apiRpc.users[":businessId"].$get({
      param: {
        businessId: businessData?._id,
      },
    });

    const response = (await res.json()).data;
    if (res.status === 200 || res.status === 201) {
      const filteredStaff = response.filter(
        (staff: UserProfile) => staff._id !== user._id,
      );
      setStaffDetails(filteredStaff);
    }
    return response;
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessData?._id as string));
    });
  };

  const { isLoading, refetch } = useQuery({
    queryKey: ["staff", businessData?._id],
    queryFn: getStaff,
    enabled: !!businessData?._id,
  });

  return (
    <>
      <main className="bg-white">
        <div className="sticky top-0 z-50 w-full linear_gradient_background">
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
              <button
                key={staff._id}
                onClick={() => handleStaffDetails(staff)}
                type="button"
                className="on_active_bounce p-4 mt-6 rounded-lg border border-[#cacaca] text-left bg-white font-medium capitalize text-[#000000]"
              >
                <img src={Avatar} alt="Avatar" />
                <div className="flex flex-col pt-6">
                  <span>{staff?.name}</span>

                  <span className="ml-1 text-sm opacity-60">
                    {staff?.customRole?.[0]?.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="fixed flex flex-col text-center transform -translate-x-1/2 left-1/2 top-1/3">
            <img width={282} height={202} src={NoStaff} alt="NoStaff" />
          </div>
        )}
      </main>

      <BottomButton onClick={addStaff} text="Add Staff" />

      {isAddStaffOpen && (
        <PopUp show={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)}>
          <NewAddStaff refetch={refetch} />
        </PopUp>
      )}

      {isEditStaffOpen && (
        <PopUp show={isEditStaffOpen} onClose={closeEditModal}>
          <EditStaff refetch={refetch} />
        </PopUp>
      )}

      {isLoading && <LoadingSpinner />}
    </>
  );
};

const MemoizedStaff = memo(StaffPage);

export default MemoizedStaff;

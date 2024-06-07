import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import PopUp from '@/components/atom/popUp';
import ErrorComponent from '@/components/errorComponent';
import AddStaffPopup from '@/components/molecules/addStaffpopup';
import Header from '@/components/molecules/header';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import type { UserProfile } from '@/components/types/businessData';
import { paths } from '@/components/utils/paths';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import { memo, startTransition, useState } from 'react';
import { BsChevronLeft } from 'react-icons/bs';
import { MdPerson } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

const Staff = memo(() => {
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
    const url = paths.getAllStaff(businessId || '');

    try {
      const response = await axios.get(url);
      const filteredStaff = response.data.filter((staff: UserProfile) => staff.id !== user.id);
      setStaffDetails(filteredStaff);
      return response.data;
    } catch (error) {
      console.error('Error fetching staff details:', error);
    }
  };

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
  };

  const { isLoading, error, data, refetch } = useQuery({
    queryKey: ['staff', businessId],
    queryFn: getStaff,
    enabled: !!businessId,
  });

  if (error) return <ErrorComponent refetch={refetch} />;

  const StaffDashboard = memo(() => {
    return (
      <>
        <div className="bg-white md:px-[10vw] lg:px-[10vw]">
          <div className="sticky top-0 z-50 w-full border-b border-[#CACACA] bg-[#f5f5f5]">
            <Header
              title="Staff"
              onBack={handleBack}
              leftIcon={<BsChevronLeft />}
              centerImage={Hi}
              rightImage={Hi}
              isIconBusinessShow={user.role !== 'RESTAURANT_MANAGER'}
            />
            <div className="mx-6 mt-6 rounded-lg pb-4 text-2xl font-normal text-[#2B354D]">Dashboard</div>
          </div>

          {staffDetails && staffDetails.length > 0 ? (
            <div className="grid grid-cols-1 pb-[5rem] md:grid-cols-2 md:gap-4 lg:grid-cols-3 lg:gap-4 xl:grid-cols-4">
              {staffDetails.map((staff: UserProfile) => (
                <div
                  onKeyDown={() => handleStaffDetails(staff?.id)}
                  key={staff.id}
                  onClick={() => handleStaffDetails(staff?.id)}
                  className="on_active_bounce mx-6 mt-6 rounded-lg border border-[#cacaca] bg-white font-medium capitalize text-[#2B354D]"
                >
                  <div className="flex items-center px-4 py-2">
                    <MdPerson className="mr-2" />
                    <span>{staff?.name}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="ml-1 text-sm opacity-60">{staff?.customRole?.[0]?.roleName}</span>
                    <span>Manage</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {!isLoading && !staffDetails.length && (
                <div className="fixed left-1/2 top-1/2 flex -translate-x-1/2 transform flex-col text-center">No User Found</div>
              )}
            </div>
          )}
        </div>
        <div
          onClick={addStaff}
          onKeyDown={addStaff}
          className="fixed bottom-4 flex w-full items-center justify-between px-6 outline-none md:px-[20vw] lg:px-[40vw]"
        >
          <button type="button" className="on_active_bounce w-full rounded-md bg-[#2B354D] py-2 capitalize text-white">
            Add Staff
          </button>
        </div>
        {isAddStaffOpen && (
          <PopUp show={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)}>
            <AddStaffPopup businessId={businessId || ''} onClose={() => setIsAddStaffOpen(false)} staffDetails={staffDetails} getStaff={getStaff} />
          </PopUp>
        )}
        {isLoading && <LoadingSpinner />}
      </>
    );
  });
  StaffDashboard.displayName = 'StaffDashboard';
  return <StaffDashboard />;
});

export default Staff;

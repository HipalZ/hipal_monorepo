import LoadingSpinner from '@/components/atom/loadingSpinner';
import useStaffStore from '@/components/store/hotel/useHotelStaff';
import useBusinessData from '@/components/store/useBusinessData';
import { normalizeHotelRole } from '@/components/utils/helper';
import { useGetAllHotelStaffRoles } from '@/hooks/useHotelStaff';
import { Check } from 'lucide-react';
import { memo, useEffect } from 'react';
import { roleBadgeColors } from './constants';

const SecondStep = () => {
  const { selectedRole, errors, setSelectedRole, editRoleStr } = useStaffStore((state) => ({
    selectedRole: state.selectedRole,
    errors: state.errors,
    setSelectedRole: state.setSelectedRole,
    editRoleStr: state.editRoleStr,
  }));
  const businessId = useBusinessData((s) => s.outletInfo?.businessId || s.businessData?._id);
  const { isLoading, hotelRolesData } = useGetAllHotelStaffRoles(businessId as string);
  useEffect(() => {
    if (editRoleStr && hotelRolesData && hotelRolesData.length > 0 && !selectedRole) {
      const matchingRole = hotelRolesData.find((role) => normalizeHotelRole(role.role) === normalizeHotelRole(editRoleStr));
      if (matchingRole) {
        setSelectedRole(matchingRole);
      }
    }
  }, [editRoleStr, hotelRolesData, selectedRole, setSelectedRole]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Role</h2>
      {errors.role && <p className="text-destructive text-sm">{errors.role}</p>}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {hotelRolesData?.map((role) => (
          <div
            key={role._id}
            className={`cursor-pointer rounded-lg border p-3 transition-all ${
              selectedRole?._id === role._id || (!selectedRole && normalizeHotelRole(editRoleStr) === normalizeHotelRole(role.role))
                ? `${roleBadgeColors[role.role]} border-2`
                : 'border-gray-200 hover:border-gray-300'
            } `}
            onClick={() => setSelectedRole(role)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{role.role.replace(/_/g, ' ')}</span>
              {(selectedRole?._id === role._id || (!selectedRole && normalizeHotelRole(editRoleStr) === normalizeHotelRole(role.role))) && (
                <Check className="h-4 w-4" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(SecondStep);

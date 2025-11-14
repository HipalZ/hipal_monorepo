import NoStaff from '@/assets/noStaff.png';
import PopUp from '@/components/atom/popUp';
import StaffFilter from '@/components/molecules/staff/StaffFilter';
import StaffWizard from '@/components/molecules/staff/StaffWizard';
import { useAddStaffStore } from '@/components/store/useAddStaffStore';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import type { CustomRole, UserProfile } from '@/components/types/businessData';
import { findRole, removeUnwanted } from '@/components/utils/helper';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { apiRpc } from '@hi/common';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Phone, Shield } from 'lucide-react';
import { lazy, memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Header = lazy(() => import('@/components/molecules/header'));
const MotionButton = lazy(() => import('@/components/atom/motionButton'));

type Role = 'MANAGER' | 'CAPTAIN' | 'MARKETING_AGENT' | 'CO_OWNER';

const roleGradients: Record<Role, string> = {
  MANAGER: 'bg-blue-400',
  CAPTAIN: 'bg-green-400',
  MARKETING_AGENT: 'bg-yellow-400',
  CO_OWNER: 'bg-gray-400',
};

const StaffPage = () => {
  const setName = useAddStaffStore((s) => s.setName);
  const setPhone = useAddStaffStore((s) => s.setPhone);
  const setIsEditing = useAddStaffStore((s) => s.setIsEditing);
  const setEditStaffId = useAddStaffStore((s) => s.setEditStaffId);
  const setPageToggle = useAddStaffStore((s) => s.setPageToggle);
  const setPermissionsStore = useAddStaffStore((s) => s.setPermissions);
  const isEditStaffOpen = useAddStaffStore((s) => s.isEditStaffOpen);
  const setIsEditStaffOpen = useAddStaffStore((s) => s.setIsEditStaffOpen);
  const isAddStaffOpen = useAddStaffStore((s) => s.isAddStaffOpen);
  const setIsAddStaffOpen = useAddStaffStore((s) => s.setIsAddStaffOpen);
  const setSelectedRole = useAddStaffStore((s) => s.setSelectedRole);
  const setSelectedPermissions = useAddStaffStore((s) => s.setSelectedPermissions);
  const setCurrentStep = useAddStaffStore((s) => s.setCurrentStep);
  const removeStaffStore = useAddStaffStore((s) => s.removeStaffStore);

  const navigate = useNavigate();
  const user = useOwnerLogin((s) => s.user);
  const businessData = useBusinessData((s) => s.businessData);
  const handleEnvelope = useApiErrorHandler().handleEnvelope;

  // ------ local filter state ------
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPermissionIds, setFilterPermissionIds] = useState<string[]>([]);

  // ---------- PERMISSIONS FETCH ----------
  const fetchPermissions = useCallback(async () => {
    const res = await apiRpc.permission.$get();
    const permissionData = await handleEnvelope(res);
    setPermissionsStore(permissionData);
    const perms = (permissionData ?? []) as { _id: string; name: string }[];
    return perms;
  }, [handleEnvelope, setPermissionsStore]);

  // ---------- STAFF FETCH ----------
  const getStaff = useCallback(async () => {
    const res = await apiRpc.users[':businessId'].$get({
      param: {
        businessId: businessData?._id,
      },
    });

    const staffData = (await handleEnvelope(res)) as UserProfile[];
    return staffData;
  }, [businessData?._id, handleEnvelope]);

  // ---------- ADD / EDIT HANDLERS ----------
  const handleStaffDetails = useCallback(
    (staff: UserProfile) => {
      const matchingData = staff.customRole?.find((item: CustomRole) => item.businessId === businessData?._id);

      if (!matchingData) {
        toast.error('No role/permissions found for this staff');
        return;
      }

      setName(staff.name || '');
      setPhone(staff.phone || '');

      const role = matchingData.role as Role;
      setSelectedRole(role as any);

      const permissionIds = Array.isArray(matchingData.permissionIds) ? matchingData.permissionIds : [];
      setSelectedPermissions(permissionIds);

      setEditStaffId(staff._id);
      setIsEditing(true);
      setPageToggle('EDIT_STAFF');
      setCurrentStep(3);
      setIsEditStaffOpen(true);
    },
    [
      businessData?._id,
      setEditStaffId,
      setIsEditing,
      setName,
      setPageToggle,
      setPhone,
      setSelectedPermissions,
      setSelectedRole,
      setCurrentStep,
      setIsEditStaffOpen,
    ],
  );

  const closeEditModal = useCallback(() => {
    removeStaffStore();
    setIsEditStaffOpen(false);
    setPageToggle('');
  }, [removeStaffStore, setIsEditStaffOpen, setPageToggle]);

  const addStaff = useCallback(() => {
    removeStaffStore();
    setIsEditing(false);
    setCurrentStep(1);
    setIsAddStaffOpen(true);
  }, [removeStaffStore, setIsAddStaffOpen, setCurrentStep, setIsEditing]);

  const handleBack = useCallback(() => {
    navigate(`/app/business/${businessData?._id}`);
  }, [navigate, businessData?._id]);

  // ---------- QUERIES ----------
  const { data: rawStaffDetails = [] } = useQuery<UserProfile[]>({
    queryKey: ['getStaffs', businessData?._id],
    queryFn: getStaff,
    enabled: !!businessData?._id,
  });

  const { data: allPermissions = [] } = useQuery<{ _id: string; name: string }[]>({
    queryKey: ['getPermissions', businessData?._id],
    queryFn: fetchPermissions,
    enabled: !!businessData?._id,
  });

  // ---------- DERIVED STAFF + PERMISSIONS ----------
  const staffWithPermissions = useMemo(() => {
    if (!rawStaffDetails || !allPermissions) return [];

    return rawStaffDetails
      .filter((staff) => staff._id !== user?._id) // exclude self
      .map((staff) => {
        const staffRole = staff.customRole?.find((item) => item.businessId === businessData?._id);

        const mappedPermissions = allPermissions.map((perm) => ({
          ...perm,
          isHaveAccess: staffRole?.permissionIds?.includes(perm._id) ?? false,
        }));

        return {
          ...staff,
          staffPermissions: mappedPermissions,
        };
      });
  }, [rawStaffDetails, allPermissions, businessData?._id, user?._id]);

  // ---------- FILTERED STAFF ----------
  const filteredStaff = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!staffWithPermissions.length) return [];

    return staffWithPermissions.filter((staff: any) => {
      // text search: name + phone + role
      const roleName = findRole(staff.customRole, businessData?._id) || '';
      const haystack = `${staff.name ?? ''} ${staff.phone ?? ''} ${roleName}`.toLowerCase();

      if (term && !haystack.includes(term)) {
        return false;
      }

      // permissions filter: staff must have ALL selected permissions
      if (filterPermissionIds.length > 0) {
        const staffPermIds = (staff.staffPermissions || []).filter((p: any) => p.isHaveAccess).map((p: any) => p._id);

        const hasAll = filterPermissionIds.every((id) => staffPermIds.includes(id));
        if (!hasAll) return false;
      }

      return true;
    });
  }, [staffWithPermissions, searchTerm, filterPermissionIds, businessData?._id]);

  const hasStaff = filteredStaff.length > 0;

  return (
    <main className="business_control_background">
      {/* Header */}
      <div className="linear_gradient_background w-full">
        <Header title="Staff" onBack={handleBack} isIconBusinessShow={false} />
      </div>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-4 py-6 pb-[7rem]">
        {/* Filter bar */}
        <StaffFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          permissions={allPermissions}
          selectedPermissionIds={filterPermissionIds}
          onSelectedPermissionIdsChange={setFilterPermissionIds}
        />

        <AnimatePresence>
          {hasStaff ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredStaff.map((staff: any, index: number) => (
                <motion.div
                  key={staff._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Hover glow */}
                  <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/20 to-cyan-500/20 opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100 group-hover:duration-200" />

                  <motion.button
                    onClick={() => handleStaffDetails(staff)}
                    className="relative w-full rounded-2xl border bg-white/80 p-3 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
                    whileHover={{ y: -4 }}
                  >
                    {/* Header row */}
                    <section className="flex items-start gap-5">
                      <article className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 ring-1 ring-black/5">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-100 to-purple-50" />
                        <span className="relative bg-gradient-to-br from-violet-600 to-purple-600 bg-clip-text text-xl font-bold capitalize text-transparent">
                          {staff.name.charAt(0)}
                        </span>
                      </article>

                      <div className="space-y-1 text-left">
                        <h3 className="text-xl font-semibold capitalize transition-all duration-300 group-hover:bg-gradient-to-r group-hover:bg-clip-text">
                          {staff.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div
                            className={`-ml-2 scale-90 rounded-full px-2 py-1 text-sm font-medium text-white shadow-lg ${
                              roleGradients[(findRole(staff.customRole, businessData?._id) as Role) || 'CAPTAIN']
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {findRole(staff.customRole, businessData?._id)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Contact row */}
                    <section className="mt-3 flex items-center justify-between">
                      <article className="flex items-center gap-3">
                        <div className="rounded-xl bg-gray-50/80 p-2.5 ring-1 ring-black/5 transition-colors group-hover:bg-white/80">
                          <Phone className="h-4 w-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">{staff.phone}</span>
                      </article>
                    </section>

                    {/* Permissions */}
                    <h1 className="mt-3 text-base font-semibold">Access Permissions</h1>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {staff?.staffPermissions
                        ?.filter((permission: any) => permission.isHaveAccess)
                        .map((permission: any) => (
                          <div
                            key={permission._id}
                            className="rounded-xl bg-emerald-50 p-3 text-emerald-700 ring-1 ring-emerald-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-xs font-medium capitalize">{removeUnwanted(permission.name)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12">
              <div className="relative h-32 w-32">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-2xl" />
                <img src={NoStaff} alt="No Staff" className="relative h-full w-full object-contain" />
              </div>
              <h2 className="mb-2 mt-8 text-2xl font-semibold text-gray-900">No Team Members Found</h2>
              <p className="mb-8 max-w-md text-center text-gray-500">Try adjusting your search or permissions filter, or add a new staff member.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Add / Edit Modals */}
      {isAddStaffOpen && (
        <PopUp rightTopBack hide height="h-[100dvh] lg:h-[85dvh]" show={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)}>
          <StaffWizard />
        </PopUp>
      )}

      {isEditStaffOpen && (
        <PopUp height="h-[100dvh] lg:h-[85dvh]" hide rightTopBack show={isEditStaffOpen} onClose={closeEditModal}>
          <StaffWizard />
        </PopUp>
      )}

      {/* FAB */}
      <MotionButton onClick={addStaff} buttonName="Add Staff" type="button" />
    </main>
  );
};

export default memo(StaffPage);

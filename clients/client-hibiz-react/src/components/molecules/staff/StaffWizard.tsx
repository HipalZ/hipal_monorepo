// src/components/molecules/staff/StaffWizard/StaffWizard.tsx
import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import StepIndicatior from '@/components/hotel/HotelStaff/StepIndicatior';
import { PermissionsStep } from '@/components/molecules/staff/PermissionStep';
import { ReviewStep } from '@/components/molecules/staff/ReviewStep';
import { RoleStep } from '@/components/molecules/staff/RoleStep';
import { StaffDetailsStep } from '@/components/molecules/staff/StaffDetailsStep';
import { useAddStaffStore } from '@/components/store/useAddStaffStore';
import useBusinessData from '@/components/store/useBusinessData';
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';
import { useStaffSave } from '@/hooks/useStaff';
import { apiRpc } from '@hi/common';
import { useQueryClient } from '@tanstack/react-query';
import { Home, Trash2 } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

const StaffWizardComponent = () => {
  const currentStep = useAddStaffStore((s) => s.currentStep);
  const goNext = useAddStaffStore((s) => s.goNext);
  const goBack = useAddStaffStore((s) => s.goBack);
  const removeStaffStore = useAddStaffStore((s) => s.removeStaffStore);
  const setIsAddStaffOpen = useAddStaffStore((s) => s.setIsAddStaffOpen);
  const setIsEditStaffOpen = useAddStaffStore((s) => s.setIsEditStaffOpen);
  const selectedPermissions = useAddStaffStore((s) => s.selectedPermissions);
  const selectedRole = useAddStaffStore((s) => s.selectedRole);
  const name = useAddStaffStore((s) => s.name);
  const phone = useAddStaffStore((s) => s.phone);
  const password = useAddStaffStore((s) => s.password);
  const isEditing = useAddStaffStore((s) => s.isEditing);
  const editStaffId = useAddStaffStore((s) => s.editStaffId);
  const setCurrentStep = useAddStaffStore((s) => s.setCurrentStep);
  const setIsEditing = useAddStaffStore((s) => s.setIsEditing);

  const businessData = useBusinessData((s) => s.businessData);
  const handleEnvelope = useApiErrorHandler().handleEnvelope;
  const queryClient = useQueryClient();
  const { saveStaff, isSaving } = useStaffSave();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const steps = useMemo(
    () => [
      { id: 1, label: 'Staff Details' },
      { id: 2, label: 'Role' },
      { id: 3, label: 'Permissions' },
      { id: 4, label: 'Review & Save' },
    ],
    [],
  );

  const closeModal = useCallback(() => {
    if (isEditing) {
      setIsEditStaffOpen(false);
    } else {
      setIsAddStaffOpen(false);
    }
    removeStaffStore();
  }, [isEditing, removeStaffStore, setIsAddStaffOpen, setIsEditStaffOpen]);

  // ---- VALIDATION ----
  const canProceed = useCallback(
    (stepId: number): boolean => {
      // Step 1: Staff Details
      if (stepId === 1) {
        if (!name || !phone) {
          toast.error('Name and phone are required.');
          return false;
        }
        if (phone.length !== 10) {
          toast.error('Phone number should be 10 digits.');
          return false;
        }
        if (!isEditing && !password) {
          toast.error('PIN is required for new staff.');
          return false;
        }
        if (password && password.length !== 4) {
          toast.error('PIN should be 4 digits.');
          return false;
        }
      }

      // Step 2: Role
      if (stepId === 2) {
        if (!selectedRole) {
          toast.error('Please select a role');
          return false;
        }
      }

      // Step 3: Permissions
      if (stepId === 3) {
        if (!selectedPermissions.length) {
          toast.error('Select at least one permission');
          return false;
        }
      }

      return true;
    },
    [isEditing, name, password, phone, selectedPermissions.length, selectedRole],
  );

  // ---- NEXT BUTTON ----
  const handleNext = useCallback(() => {
    if (!canProceed(currentStep)) return;
    if (currentStep < 4) {
      goNext();
    }
  }, [canProceed, currentStep, goNext]);

  // ---- SAVE (ADD / EDIT) VIA HOOK ----
  const handleSave = useCallback(async () => {
    // ensure all previous steps valid
    if (!canProceed(1) || !canProceed(2) || !canProceed(3)) return;

    try {
      const res = await saveStaff({
        mode: isEditing ? 'edit' : 'add',
        userId: isEditing ? editStaffId : undefined,
        data: {
          name,
          phone,
          password: password || undefined,
          role: (selectedRole as 'CO_OWNER' | 'MANAGER' | 'CAPTAIN' | 'MARKETING_AGENT' | 'OWNER' | 'HIPAL_ADMIN' | 'HIPAL_CUSTOMER') || 'CAPTAIN',
          permissionIds: selectedPermissions,
        },
      });
      console.log('Save Staff Response:', res); // Debug log

      closeModal();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error(isEditing ? 'Failed to update staff' : 'Failed to add staff');
    }
  }, [canProceed, closeModal, editStaffId, isEditing, name, password, phone, saveStaff, selectedPermissions, selectedRole]);

  // ---- DELETE STAFF ----
  const deleteStaff = useCallback(async () => {
    if (!businessData?._id) {
      toast.error('Business not found');
      return;
    }

    try {
      const res = await apiRpc.users[':staffId'][':businessId'].$delete({
        param: {
          staffId: editStaffId,
          businessId: businessData._id || '',
        },
        json: {},
      });

      await handleEnvelope(res);

      if (res.status === 200 || res.status === 201) {
        toast.success('Staff deleted successfully');
        setIsEditStaffOpen(false);
        setIsEditing(false);
        removeStaffStore();
        queryClient.invalidateQueries({
          queryKey: ['getStaffs', businessData._id],
        });
      } else {
        throw new Error('Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to delete staff');
    } finally {
      setShowDeleteConfirm(false);
    }
  }, [businessData?._id, editStaffId, handleEnvelope, queryClient, removeStaffStore, setIsEditStaffOpen, setIsEditing]);

  // ---- STEP CLICK (GUARDED) ----
  const handleStepClick = useCallback(
    (stepId: number) => {
      if (stepId === currentStep) return;

      // going forward
      if (stepId > currentStep) {
        for (let i = currentStep; i < stepId; i++) {
          if (!canProceed(i)) {
            toast.error(`Please complete step ${i} before proceeding to step ${stepId}`);
            return;
          }
        }
        setCurrentStep(stepId);
        return;
      }

      // going backward always allowed
      setCurrentStep(stepId);
    },
    [canProceed, currentStep, setCurrentStep],
  );

  // ---- BUTTON CONFIG ----
  const buttons = useMemo(() => {
    const baseButtons: any[] = [
      {
        text: '',
        onClick: closeModal,
        type: 'button' as const,
        className: 'rounded-md !w-[8rem] pl-4 pr-2',
        icon: <Home />,
      },
    ];

    // Show Delete only in edit mode
    if (isEditing) {
      baseButtons.push({
        text: 'Delete',
        onClick: () => setShowDeleteConfirm(true),
        type: 'button' as const,
        icon: <Trash2 />,
        className: '!bg-red-600 text-white hover:bg-red-700 rounded-md',
      });
    }

    if (currentStep > 1) {
      baseButtons.push({
        text: 'Back',
        onClick: goBack,
        type: 'button' as const,
        className: 'rounded-md ',
      });
    }

    if (currentStep < 4) {
      baseButtons.push({
        text: 'Next',
        onClick: handleNext,
        type: 'button' as const,
        disable: isSaving,
        className: 'rounded-md ',
      });
    } else {
      baseButtons.push({
        text: isEditing ? 'Update' : 'Save Staff',
        onClick: handleSave,
        type: 'button' as const,
        disable: isSaving,
        className: 'rounded-md ',
      });
    }

    return baseButtons;
  }, [closeModal, currentStep, goBack, handleNext, handleSave, isEditing, isSaving]);

  return (
    <section className="hide-scrollbar max-h-[85vh] overflow-auto rounded-t-3xl p-2 pb-[7rem] md:p-4">
      <StepIndicatior currentStep={currentStep} steps={steps} onStepClick={handleStepClick} />

      <div className="px-2 pb-4 md:px-4">
        {currentStep === 1 && <StaffDetailsStep />}
        {currentStep === 2 && <RoleStep />}
        {currentStep === 3 && <PermissionsStep />}
        {currentStep === 4 && <ReviewStep />}
      </div>

      <AdvancedBottomButton fixed={true} maxWidth="30rem" buttons={buttons} />

      {/* DELETE CONFIRM MODAL */}
      {isEditing && showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <h2 className="mb-2 text-lg font-semibold">Delete Staff</h2>
            <p className="mb-4 text-sm text-gray-600">Are you sure you want to delete this staff member? This action cannot be reverted.</p>
            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border px-4 py-2 text-sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button type="button" className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white" onClick={deleteStaff}>
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export const StaffWizard = memo(StaffWizardComponent);
export default StaffWizard;

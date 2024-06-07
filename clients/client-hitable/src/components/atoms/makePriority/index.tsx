import axios from '@/axios';
import type { IStatus } from '@/components/types/hiTableData';
import React, { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

interface DeleteConfirmationProps {
  closeModal: () => void;
  selectedDishStatus: IStatus | null;
  kotId: string | undefined;
  getAllStatusData: () => void;
  onConfirm: (string) => void;
}

const Priority: React.FC<DeleteConfirmationProps> = ({ closeModal, selectedDishStatus, kotId, getAllStatusData, onConfirm }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const businessId = selectedDishStatus?.businessId;
  const handleCookFast = async () => {
    const success = await updatePriority(kotId, businessId);
    if (success) {
      closeModal();
      getAllStatusData();
    }
  };
  async function updatePriority(kotId, businessId) {
    try {
      const response = await axios.put(`/v1/kitchens/${kotId}/updateSingleKot`, {
        businessId: businessId,
        priority: true,
      });

      if (response.status === 200) {
        toast.success(`Making ${selectedDishStatus?.dish?.name} a priority`);
        onConfirm('Priority');
        return true;
      }
      toast.error('Failed to update priority');
      throw new Error('Failed to update priority');
    } catch (error: any) {
      // Handling Axios errors
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage);
      return false;
    }
  }
  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    inputRef.current?.addEventListener('focus', handleFocus);

    return () => {
      inputRef.current?.removeEventListener('focus', handleFocus);
    };
  }, []);
  return (
    <div ref={inputRef} className="bg-secondary rounded-t-[1.5rem] p-6 ">
      <h3 className="mb-2 text-xl font-medium text-[#2B354D]">Sure you want to make this item first ?</h3>
      <p className="mb-4 pb-12 text-sm text-[#2B354D] opacity-80">
        The selected item will be highlighted to Kitchen Display System to be cooked in priority
      </p>

      <div className="flex justify-between space-x-6">
        <button type="button" onClick={closeModal} className=" on_active_bounce rounded-lg px-6 py-2 font-medium text-[#2B354D]">
          Cancel
        </button>
        <button type="button" onClick={handleCookFast} className="bg-primary text-base-100 on_active_bounce w-full rounded-3xl px-4 py-2">
          Cook Fast
        </button>
      </div>
    </div>
  );
};

export default Priority;

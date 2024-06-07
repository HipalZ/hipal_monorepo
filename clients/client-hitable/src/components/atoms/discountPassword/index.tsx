import type { SettlePageTypes } from '@/components/organisms/settle';
import { useBusinessStore } from '@/components/store/useBusinessData';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

type ApplyDiscountProps = {
  onClose: () => void;
  openModal: (str: SettlePageTypes) => void;
};

const ApplyDiscount: React.FC<ApplyDiscountProps> = ({ onClose, openModal }) => {
  const [password, setPassword] = useState('');
  const businessData = useBusinessStore((s) => s.businessData);

  const handleApplyDiscount = () => {
    if (password.trim() === '') {
      toast.error('please enter password');
      return;
    }
    if (businessData?.serviceControl?.discountPassword.toString() === password) {
      setPassword('');
      onClose();
      openModal('DISCOUNT');
      return;
    }
    return toast.error('password is wrong');
  };

  return (
    <div className="mx-6">
      <div className="mt-4 font-semibold">Please enter password to apply discount!</div>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-4 w-full rounded-md border p-2"
        placeholder="Enter Password"
      />
      <div className="mt-6 flex justify-between pb-9">
        <button type="button" onClick={handleApplyDiscount} className="bg-primary text-base-100 w-full rounded-3xl px-6 py-3 text-sm">
          Next
        </button>
      </div>
    </div>
  );
};

export default ApplyDiscount;

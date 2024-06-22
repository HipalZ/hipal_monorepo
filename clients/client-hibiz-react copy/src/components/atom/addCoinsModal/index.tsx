import axios from '@/axios';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import type { Customer } from '@/components/types/businessData';
import type React from 'react';
import { memo, useRef, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

interface AddCoinsProps {
  closeModal: () => void;
  selectedCustomer: Customer | null;
  getParticularUsersLoyalty: () => void;
}

const AddCoinsModal: React.FC<AddCoinsProps> = ({ closeModal, selectedCustomer, getParticularUsersLoyalty }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [coins, setCoins] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const businessData = useBusinessData((s) => s.businessData);
  const ownerDetails = useOwnerLogin((s) => s.user);
  const { businessId } = useParams<{ businessId: string }>();
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const addCoins = async () => {
    if (!coins || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    const config = {
      method: 'POST',
      url: `/v1/users/addCoins`,
      data: {
        loyaltyId: selectedCustomer?.loyaltyId,
        userPhone: selectedCustomer?.userPhone,
        coins: Number(coins),
        businessId: businessId,
        password: Number(password),
        userName: selectedCustomer?.userName,
        businessName: businessData?.businessName,
        waiterName: ownerDetails.name,
      },
    };

    try {
      await axios(config);
      toast.success('Coins added successfully');
      setCoins('');
      setPassword('');
      getParticularUsersLoyalty();
      closeModal();
    } catch (error) {
      console.log('error', error);
      toast.error('Wrong Password');
    }
  };

  return (
    <div className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6">
      <h3 className="mb-4 text-xl font-medium text-[#000000]">Add Coins</h3>
      <input
        type="number"
        value={coins}
        maxLength={6}
        onChange={(e) => setCoins(e.target.value)}
        className="mb-2 w-full rounded border px-3 py-2 focus:border focus:border-[#000000] focus:outline-none"
        placeholder="Enter Coins"
      />
      <div className="relative mt-4 pb-4">
        <input
          ref={inputRef}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-0 ml-0 mr-0 w-full rounded-lg border border-gray-800 bg-transparent bg-white py-2 pl-4 pr-10 text-base text-gray-900 focus:border-[#4071F1] focus:outline-none"
          placeholder="Enter Password"
          maxLength={6}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-500 focus:outline-none"
        >
          {showPassword ? <HiOutlineEye className="text-base" /> : <HiOutlineEyeOff className="text-base" />}
        </button>
      </div>

      <button type="button" onClick={addCoins} className="on_active_bounce mx-auto mt-6 w-full rounded-lg bg-[#000000] px-4 py-2 text-white">
        Add Coins
      </button>
    </div>
  );
};

export default memo(AddCoinsModal);

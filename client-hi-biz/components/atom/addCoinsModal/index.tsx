import axios from '@/axios';
import type React from "react";
import { memo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import type { Customer } from "@/components/types/businessData";
import useBusinessData from "@/components/store/useBusinessData";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useRouter } from "next/router";

interface AddCoinsProps {
  closeModal: () => void;
  selectedCustomer: Customer | null;
  getParticularUsersLoyalty: () => void;
}

const AddCoinsModal: React.FC<AddCoinsProps> = ({
  closeModal,
  selectedCustomer,
  getParticularUsersLoyalty,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [coins, setCoins] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const businessData = useBusinessData((s) => s.businessData);
  const ownerDetails = useOwnerLogin((s) => s.user);
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const addCoins = async () => {
    if (!coins || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    const config = {
      method: "POST",
      url: `${process.env.NEXT_PUBLIC_API_HOST}/v1/users/addCoins`,
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
      const response = await axios(config);
      toast.success("Coins added successfully");
      setCoins("");
      setPassword("");
      getParticularUsersLoyalty();
      closeModal();
    } catch (error) {
      console.log("error", error);
      toast.error("Wrong Password");
    }
  };

  return (
    <div className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem]">
      <h3 className="text-xl mb-4 font-medium text-[#2B354D]">Add Coins</h3>
      <input
        type="number"
        value={coins}
        maxLength={6}
        onChange={(e) => setCoins(e.target.value)}
        className="border px-3 py-2 rounded mb-2 w-full focus:border focus:border-[#2B354D] focus:outline-none"
        placeholder="Enter Coins"
      />
      <div className="relative pb-4 mt-4">
        <input
          ref={inputRef}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-white text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border focus:outline-none focus:border-[#4071F1]"
          placeholder="Enter Password"
          maxLength={6}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute flex items-center justify-center w-6 h-6 text-gray-500 rounded-full top-2 right-2 focus:outline-none"
        >
          {showPassword ? (
            <HiOutlineEye className="text-base" />
          ) : (
            <HiOutlineEyeOff className="text-base" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={addCoins}
        className="w-full mt-6 mx-auto on_active_bounce text-white bg-[#2B354D] px-4 py-2 rounded-lg"
      >
        Add Coins
      </button>
    </div>
  );
};

export default memo(AddCoinsModal);

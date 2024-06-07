import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import axios from '@/axios';
import { memo, useEffect, useRef, useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { toast } from "react-toastify";

const ChangeOwnerPassword = ({
  closeModal,
  user,
}: {
  closeModal: () => void;
  user: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setNewPassword] = useState("");
  const setPassword = useOwnerLogin((s) => s.setPassword);
  const inputRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const changePassword = async () => {
    if (password.trim().length < 4) {
      toast.error("Please enter a password of at least 4 digits");
      return;
    }
    try {
      const config = {
        method: "put",
        url: `/v1/users/${user?.id}/updateUser`,
        data: {
          password: password,
        },
      };
      const response = await axios(config);
      toast.success("Password updated successfully");
      setPassword(response.data.data.password);
      setNewPassword("");
      closeModal();
    } catch (error) {
      setNewPassword("");
      console.log(error);
    }
  };

  useEffect(() => {
    const handleFocus = () => {
      if (inputRef.current) {
        inputRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };

    inputRef.current?.addEventListener("focus", handleFocus);

    return () => {
      inputRef.current?.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <div className="bg-[#f5f5f5] p-6 rounded-t-[1.5rem]">
      <h3 className="text-xl mb-4 font-medium text-[#2B354D]">Edit Password</h3>
      <div className="relative pb-4">
        <input
          ref={inputRef}
          type={showPassword ? "text" : "password"}
          minLength={4}
          maxLength={4}
          value={password}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-white text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:border-[#4071F1] dark:border-gray-600 peer"
          placeholder="Enter Password (Max 4 characters)"
          required
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

      <div className="w-full py-2 rotate-180">
        <div className="flex flex-col mx-auto rotate-180 justify-items-center">
          <button
            type="button"
            onClick={changePassword}
            className={"min-h-[3rem] font-semibold bg-[#2B354D] text-white text-[1rem] rounded-full min-w-389 min-w-[95%] md:min-w-[75%] lg:min-w-[55%] xl:min-w-[55%] my-auto !py-2"}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChangeOwnerPassword);

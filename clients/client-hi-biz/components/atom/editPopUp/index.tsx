import { memo, useEffect, useRef, useState } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { toast } from "react-toastify";

const ChangePassword = ({ closeModal, updatePassword }: { closeModal: () => void, updatePassword: (newPassword: string) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setNewPassword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const changePassword = async () => {
    if (password.trim().length < 6) {
      toast.error("Please enter a password of at least 6 digits");
      return;
    }
    updatePassword(password);
    closeModal();
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
          minLength={1}
          maxLength={6}
          value={password}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-white text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:border-[#4071F1] dark:border-gray-600 peer"
          placeholder="Enter Password (Max 5 characters)"
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
            className={"on_active_bounce text-white rounded-md bg-[#2B354D] py-2.5 w-full"}
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChangePassword);

import axios from '@/axios';
import { memo, useEffect, useRef, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const ChangePasswordModal = ({ closeModal, onPasswordChange }: { closeModal: () => void; onPasswordChange: (str: string) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { staffId } = useParams<{
    staffId: string;
  }>();
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

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const changePassword = async () => {
    if (password.trim().length < 4) {
      toast.error('Please enter a password of at least 4 digits');
      return;
    }
    try {
      await axios.get(`/v1/users/staff/Single?staffId=${staffId}&password=${password}`);
      onPasswordChange(password);
      setPassword('');
      closeModal();
      toast.success('Password updated successfully');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="rounded-t-[1.5rem] bg-[#f5f5f5] p-6">
      <h3 className="mb-4 text-xl font-medium text-[#2B354D]">Edit Password</h3>
      <div className="relative pb-4">
        <input
          ref={inputRef}
          type={showPassword ? 'text' : 'password'}
          minLength={4}
          maxLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="peer mb-0 ml-0 mr-0 w-full rounded-lg border border-gray-800 bg-transparent bg-white py-2 pl-4 pr-10 text-base text-gray-900 focus:border-[#4071F1] focus:outline-none dark:border-gray-600 dark:text-white"
          placeholder="Enter Password (Max 4 characters)"
          required
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-gray-500 focus:outline-none"
        >
          {showPassword ? <HiOutlineEye className="text-base" /> : <HiOutlineEyeOff className="text-base" />}
        </button>
      </div>

      <div className="w-full rotate-180 py-2">
        <div className="mx-auto flex rotate-180 flex-col justify-items-center">
          <button
            type="button"
            onClick={changePassword}
            className={
              'min-w-389 my-auto min-h-[3rem] min-w-[95%] rounded-full bg-[#2B354D] !py-2 text-[1rem] font-semibold text-white md:min-w-[75%] lg:min-w-[55%] xl:min-w-[55%]'
            }
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(ChangePasswordModal);

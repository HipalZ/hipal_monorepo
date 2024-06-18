import Hi from '@/assets/svg/hi.svg';
import axios from '@/axios';
import LoadingSpinner from '@/components/atom/loadingSpinner';
import Header from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { routeToDashboard } from '@/components/utils/routes';
import { useQuery } from '@tanstack/react-query';
import type React from 'react';
import { memo, startTransition, useState } from 'react';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { FaArrowLeft } from 'react-icons/fa';
import { MdCardMembership } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import Switch from 'react-switch';
import { toast } from 'react-toastify';

const TaxAndCharges = memo(() => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const businessData = useBusinessData((s) => s.businessData);
  const setBusinessData = useBusinessData((s) => s.setBusinessData);
  const [toggleSwitch, setToggleSwitch] = useState(businessData?.serviceCharge || false);
  const [isModified, setIsModified] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [percentage, setPercentage] = useState(businessData?.serviceChargePercentage || 0);
  const [password, setPassword] = useState(businessData?.serviceChargeRemovalPass || '');

  function toggleLoyality() {
    setToggleSwitch(!toggleSwitch);
  }

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }
  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPercentage(Number(e.target.value));
    setIsModified(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsModified(true);
  };

  const handleSave = async () => {
    if (!percentage || percentage === null || percentage === undefined || percentage === 0) {
      toast.error('please enter Percentage');
      return;
    }
    if (!password || password === null || password === undefined) {
      toast.error('Password is required.');
      return;
    }

    try {
      const response = await axios.put(`/v1/businesses/${businessId}`, {
        serviceCharge: true,
        serviceChargePercentage: Number(percentage),
        serviceChargeRemovalPass: password || businessData?.serviceChargeRemovalPass,
      });
      setBusinessData(response.data);
      toast.success('Service Charges added successfully');
    } catch (error) {
      console.error('API Request Error:', error);
      toast.error('Failed to add service charges. Please try again.');
    }
  };

  const getAllTaxes = async () => {
    try {
      const response = await axios.get(`/v1/dishes/:id/getCharges?businessId=${businessId}`);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };

  const { isLoading, error, data } = useQuery({
    queryKey: ['getCharges', businessId],
    queryFn: getAllTaxes,
    enabled: !!businessId,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Error: {error.message}</div>;

  const handleBack = () => {
    startTransition(() => {
      navigate(routeToDashboard(businessId as string));
    });
  };

  return (
    <div className="relative bg-white">
      <div className="sticky top-0 z-50 w-full  linear_gradient_background">
        <Header title="Charges" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={true} />
        <div className="mx-6 mt-6 flex items-center space-x-2 rounded-lg pb-4 text-2xl font-normal text-[#000000]">
          <MdCardMembership /> <span>Charges</span>
        </div>
      </div>
      <div className="mx-6 mt-6 rounded-md border border-[#CACACA] px-4 py-4">
        <div className={`flex items-center justify-between ${toggleSwitch ? ' pb-4' : ''} `}>
          <h1 className="text-base font-semibold">Service charges</h1>
          <div className="flex items-center ">
            <Switch uncheckedIcon={false} checkedIcon={false} onChange={toggleLoyality} checked={toggleSwitch} offColor="#CACACA" />
          </div>
        </div>
        {toggleSwitch && (
          <>
            <div className="my-4 text-sm opacity-70">Set the percentage on the for service charge</div>
            <div className="relative">
              <input
                type="number"
                onChange={handlePercentageChange}
                value={percentage}
                className={' w-full rounded-md px-2.5 pr-6'}
                placeholder="Percentage"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg">%</span>
            </div>
          </>
        )}
      </div>
      {toggleSwitch && (
        <div className="mx-6 mt-6 rounded-lg border border-[#cacaca] px-4">
          <div className="my-4 text-sm">Password for removing service charges</div>
          <div className="relative pb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              onChange={handlePasswordChange}
              value={password}
              className="w-full rounded-md px-2.5"
              placeholder="Enter Password"
            />
            <span onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3">
              {showPassword ? <AiFillEyeInvisible className="mb-4" /> : <AiFillEye className="mb-4" />}
            </span>
          </div>
        </div>
      )}
      <div className="fixed bottom-6 w-full px-6">
        <button
          type="button"
          disabled={!isModified}
          onClick={handleSave}
          className={`${!isModified ? 'opacity-50' : ''} w-full rounded-md bg-[#000000] py-2 text-white`}
        >
          Save
        </button>
      </div>
    </div>
  );
});

export default TaxAndCharges;

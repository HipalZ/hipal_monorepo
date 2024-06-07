import axios from '@/axios';
import useBusinessData from '@/components/store/useBusinessData';
import { useCroppedImage } from '@/components/store/useCroppedImage';
import { useLoyalityData } from '@/components/store/useLoyality';
import { useOwnerLogin } from '@/components/store/useOwnerLogin';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { storeImageFiles } from '@/components/utils/helper';
import { useRouter } from 'next/router';
import { memo, useEffect, useState } from 'react';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import Switch from 'react-switch';
import { toast } from 'react-toastify';
import LoyalityCard from '../loyalityCard';
import LoyalityCardPopup from '../loyalityCardPopup.tsx';
import { beans, bowl, bud, flower, love, triangleToDataurl, waveToDataUrl } from '../pathPattern';
import PopUp from '../popUp';

type ILoyaltySetUpProps = {
  existsLoyalty: boolean;
};
const LoyalitySetup = ({ existsLoyalty: existsLoyality }: ILoyaltySetUpProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toggleSwitch, setToggleSwitch] = useState(false);
  const [loyaltyId, setLoyaltyId] = useState('new');
  const [cardModal, setCardModal] = useState(false);
  const themes = useBusinessData((s) => s.themes);
  const setOrigin = useLoyalityData((s) => s.setOrigin);
  const [openOtp, setOpenOtp] = useState(false);
  const businessName = useBusinessData((s) => s.businessData?.businessName);
  const ownerName = useOwnerLogin((s) => s.user?.name);
  const { croppedImage, setCroppedImage } = useCroppedImage();
  const { setExistingLoyalty, existingLoyalty } = useBusinessData();
  const defaultLogo = useBusinessData((s) => s.businessData?.logo);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const { setIsLoyaltyExists, isLoyaltyExists } = useBusinessData();
  const [isRewardChecked, setIsRewardChecked] = useState(false);
  const [expiryDateChecked, setExpiryDateChecked] = useState(false);
  const [passwordChecked, setPasswordChecked] = useState(false);
  const [isClaimChecked, setIsClaimChecked] = useState(false);
  const [isRewardLimitChecked, setIsRewardLimitChecked] = useState(false);
  const [otpValue, setOtpValue] = useState<number | null>(null);
  const [loyaltyValue, setLoyaltyValue] = useState('');
  const {
    setRewardsValue,
    rewardsValue,
    signUpBonus,
    setSignUpBonus,
    maximumClaim,
    setMaximumClaim,
    cardPattern,
    setCardPattern,
    setFontColor,
    cardColor,
    setCardColor,
    fontColor,
    logo,
    origin,
    setLogo,
    expiryDate,
    rewardLimit,
    setRewardLimit,
    setExpiryDate,
    password,
    setPassword,
  } = useLoyalityData();
  const { businessId } = router.query as { businessId: string };

  function settingUpReward(e: any) {
    let value = e.target.value;
    value = Math.abs(value.replace(/[^0-9\b]/g, ''));
    if (value > 100) {
      value = 100;
    }
    setRewardsValue(value);
  }

  const [bonusWarn, setBonusWarn] = useState(false);
  function handleSignUpBonus(e: any) {
    let value = e.target.value;
    if (value?.length < 5 && value <= 5000 && value <= rewardLimit) {
      value = Math.abs(value.replace(/[^0-9\b]/g, ''));
      setSignUpBonus(value);
      setBonusWarn(false);
      setTimeout(() => {
        setBonusWarn(false);
      }, 5000);
    } else {
      setBonusWarn(true);
    }
  }

  function addExpiryDate(e: any) {
    const rawDate = e.target.value;
    setExpiryDateChecked(false);
    setExpiryDate(rawDate);
  }
  const imageCardPattern = [
    { wave: waveToDataUrl(cardColor, 'white').wave },
    {
      triangle: triangleToDataurl('white').triangle,
    },
    {
      beans: beans(fontColor).beans,
    },
    { bud: bud(fontColor).bud },

    { bowl: bowl(fontColor).bowl },

    { love: love(fontColor).love },

    { flower: flower(fontColor).flower },
  ];

  useEffect(() => {
    if (!existsLoyality) {
      setLoyaltyId('new');
    }
    if (existingLoyalty?.loyaltyId) {
      setToggleSwitch(true);
      const matchedPattern = imageCardPattern.find((pattern) => Object.keys(pattern).includes(existingLoyalty?.cardPattern));
      if (matchedPattern !== undefined) {
        setCardPattern({
          [existingLoyalty?.cardPattern]: matchedPattern[existingLoyalty?.cardPattern],
        });
      }
      setFontColor(existingLoyalty?.fontColor);
      setPassword(existingLoyalty?.password);
      setLogo(existingLoyalty?.logo);
      setCroppedImage(existingLoyalty?.logo);
      setRewardLimit(existingLoyalty?.rewardLimit);
      setRewardsValue(existingLoyalty?.setReward);
      setSignUpBonus(existingLoyalty?.signUpBonus);
      setMaximumClaim(existingLoyalty?.setClaimAmount);
      setExpiryDate(existingLoyalty?.expiryDate);
    } else {
      setFontColor('');
      setPassword('');
      setRewardLimit(0);
      setRewardsValue(0);
      setSignUpBonus(0);
      setMaximumClaim(0);
      setExpiryDate('');
      setLogo(defaultLogo || '');
      setFontColor(themes?.primaryColor);
      setCardColor(themes?.secondaryColor);
    }
  }, []);
  const closeModal = () => {
    setCardModal(false);
  };
  function toggleLoyality() {
    setToggleSwitch(!toggleSwitch);
  }
  function existingId(string: string) {
    setOrigin(false);
    setLoyaltyId(string);
  }
  function createNewId(string: string) {
    setOrigin(true);
    setLoyaltyId(string);
  }
  function settingUpClaim(e: any) {
    let value = e.target.value;
    value = Math.abs(value.replace(/[^0-9\b]/g, ''));
    if (value > 100) {
      value = 100;
    }
    setMaximumClaim(value);
  }
  function handlePassword(e: any) {
    setPassword(e.target.value);
    setPasswordChecked(false);
  }
  function setupRewardLimit(e: any) {
    let value = e.target.value;
    if (value?.length < 5) {
      value = Math.abs(value.replace(/[^0-9\b]/g, ''));
      setRewardLimit(value);
    }
    if (value < signUpBonus) {
      setSignUpBonus(0);
      setBonusWarn(true);
    }
  }
  function handleBlur() {
    if (rewardsValue?.toString().length > 0) {
      setIsRewardChecked(false);
    } else {
      setIsRewardChecked(true);
    }
  }
  function handleClaimBlur() {
    if (maximumClaim?.toString().length > 0) {
      setIsClaimChecked(false);
    } else {
      setIsClaimChecked(true);
    }
  }
  function handleRewardLimitBlur(e) {
    const value = e.target.value;
    if (rewardLimit?.toString().length > 0) {
      setIsRewardLimitChecked(false);
    } else {
      setIsRewardLimitChecked(true);
    }
  }
  async function sendAlert() {
    const config = {
      method: 'POST',
      url: '/v1/payments/createLoyaltyAlert',
      data: {
        businessName: businessName,
        loyaltyId: loyaltyValue,
        businessId: businessId,
        ownerName: ownerName,
      },
    };
    try {
      const response = await axios(config);
      if (response.status === 200 || response.status === 201) {
        toast.success('OTP sent to the owner');
      }
      setOpenOtp(true);
      closeModal();
    } catch (error) {
      toast.error('Error adding Loyality. Please try again later.');
    }
  }
  async function base64ToFile(base64: string, filename: string, mimeType: string) {
    if (base64.includes('storage.hipal.life') || base64.length === 0) return;
    const byteString = atob(base64?.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const intArray = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
      intArray[i] = byteString.charCodeAt(i);
    }

    const blob = new Blob([arrayBuffer], { type: mimeType });
    return new File([blob], filename, { type: mimeType });
  }

  async function saveLoyalityData(e: any, businessId: string) {
    e.preventDefault();

    let isValid = true;
    if (!rewardsValue || rewardsValue.toString().length === 0) {
      setIsRewardChecked(true);
      isValid = false;
    } else {
      setIsRewardChecked(false);
    }
    if (!maximumClaim || maximumClaim.toString().length === 0) {
      setIsClaimChecked(true);
      isValid = false;
    } else {
      setIsClaimChecked(false);
    }
    if (expiryDate === '') {
      isValid = false;
      setExpiryDateChecked(true);
    } else {
      setExpiryDateChecked(false);
    }
    if (!rewardLimit || rewardLimit.toString().length === 0) {
      setIsRewardLimitChecked(true);
      isValid = false;
    } else {
      setIsRewardLimitChecked(false);
    }
    if (password === '') {
      setPasswordChecked(true);
      isValid = false;
    } else {
      setPasswordChecked(false);
    }
    if (!isValid) return toast.error('Please fill all the details');
    const imageFile = await base64ToFile(logo, 'image.jpg', 'image/jpeg');
    const imageUrl = await storeImageFiles(imageFile as File);
    if (imageUrl !== undefined) {
      setLogo(imageUrl);
    } else {
      setLogo(logo);
    }
    if (rewardsValue === undefined || maximumClaim === undefined || origin === false) {
      return toast.error('Please fill all the details');
    }
    if (businessId === undefined || '') return;
    setLoading(true);
    const config = {
      method: 'POST',
      url: '/v1/businesses/:id/loyalty',
      data: {
        businessId: businessId,
        loyaltyId: businessId,
        setReward: rewardsValue,
        expiryDate: expiryDate,
        rewardLimit: rewardLimit,
        signUpBonus: signUpBonus,
        setClaimAmount: maximumClaim,
        password: password,
        origin: origin,
        cardPattern: cardPattern && Object.keys(cardPattern)[0],
        cardColor: cardColor,
        fontColor: fontColor,
        logo: imageUrl === undefined ? logo : imageUrl,
      },
    };
    try {
      const response = await axios(config);
      const isData = response?.data && Object.keys(response?.data).length > 0;
      setIsLoyaltyExists(isData);
      if (response?.status === 200 || response?.status === 201) {
        setExistingLoyalty(response?.data);
        setSelectedButton('Dashboard');
        toast.success('Loyality added successfully');
      }
    } catch (error) {
      toast.error('Error adding Loyality. Please try again later.');
    }
    setLoading(false);
  }
  async function handleUpdateLoyalty(e: any, businessId: string) {
    e.preventDefault();

    let isValid = true;
    if (!rewardsValue || rewardsValue.toString().length === 0) {
      setIsRewardChecked(true);
      isValid = false;
    } else {
      setIsRewardChecked(false);
    }
    if (!maximumClaim || maximumClaim.toString().length === 0) {
      setIsClaimChecked(true);
      isValid = false;
    } else {
      setIsClaimChecked(false);
    }
    if (expiryDate === '') {
      isValid = false;
      setExpiryDateChecked(true);
    } else {
      setExpiryDateChecked(false);
    }
    if (!rewardLimit || rewardLimit.toString().length === 0) {
      setIsRewardLimitChecked(true);
      isValid = false;
    } else {
      setIsRewardLimitChecked(false);
    }
    if (password === '') {
      setPasswordChecked(true);
      isValid = false;
    } else {
      setPasswordChecked(false);
    }
    if (!isValid) return toast.error('Please fill all the details');

    const imageFile = await base64ToFile(logo, 'image.jpg', 'image/jpeg');
    const imageUrl = await storeImageFiles(imageFile as File);
    if (imageUrl !== undefined) {
      setLogo(imageUrl);
    } else {
      setLogo(logo);
    }
    if (rewardsValue === undefined || maximumClaim === undefined) {
      return toast.error('Please fill all the details');
    }
    const config = {
      method: 'PUT',
      url: `/v1/businesses/${businessId}/updateLoyalty`,
      data: {
        setReward: rewardsValue,
        expiryDate: expiryDate,
        rewardLimit: rewardLimit,
        setClaimAmount: maximumClaim,
        signUpBonus: signUpBonus,
        password: password,
        cardPattern: cardPattern && Object.keys(cardPattern)[0],
        cardColor: cardColor,
        fontColor: fontColor,
        logo: imageUrl === undefined ? logo : imageUrl,
      },
    };
    try {
      const response = await axios(config);
      if (response.status === 200 || response.status === 201) {
        toast.success('Loyality updated successfully');
        setExistingLoyalty(response?.data);
      }
    } catch (err) {}
  }
  async function handleOtp(e: any) {
    const value = e.target.value;
    setOtpValue(value);
  }
  async function handleExistingData() {
    const config = {
      method: 'POST',
      url: '/v1/businesses/:id/loyalty?verify=true',
      data: {
        businessId: businessId,
        loyaltyId: loyaltyValue,
        password: otpValue,
      },
    };
    try {
      const response = await axios(config);
      if (response.status === 200 || response.status === 201) {
        toast.success('Loyality added successfully');
        setExistingLoyalty((prev) => {
          return { ...prev, loyaltyId: loyaltyValue };
        });
      }
    } catch (error) {
      toast.error('Error adding Loyality. Please try again later.');
    }
  }
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  // const showError = () => toast.error('Loyality ID Already Exists');
  return (
    <>
      <div className="m-6 text-[#2B354D]">
        <div className="border-1 flex h-20 items-center rounded-md border border-[#CACACA] px-4">
          <h1 className="text-base font-semibold">Start loyality for your business</h1>
          <div className="ml-9 flex items-center">
            <Switch uncheckedIcon={false} checkedIcon={false} onChange={toggleLoyality} checked={toggleSwitch} offColor="#CACACA" />
          </div>
        </div>
        {toggleSwitch && (
          <>
            <div className={`px-4 ${loyaltyId === 'new' ? 'h-[10.5rem]' : 'h-[12.5rem]'} border-1 my-5 rounded-md border border-[#CACACA]`}>
              <h1 className="mt-2.5 text-base font-semibold">Choose the type of loyalty</h1>
              <div className="mt-3.5 flex">
                <div className="pointer-events-none opacity-50">
                  {/* // onClick={existsLoyality ? showError : () => existingId("existing")} */}
                  <button
                    type="button"
                    className={`${
                      loyaltyId === 'existing' ? 'bg-[#2B354D] text-white' : 'bg-white text-[#2B354D]'
                    } on_active_bounce border-1 rounded-md border border-[#2B354D] px-2.5 py-1.5 text-sm`}
                  >
                    Use an Existing ID
                  </button>
                </div>
                <div onKeyDown={() => createNewId('new')} onClick={() => createNewId('new')} className="ml-4">
                  <button
                    type="button"
                    className={`${
                      loyaltyId === 'new' ? 'bg-[#2B354D] text-white' : 'bg-white text-[#2B354D]'
                    } on_active_bounce border-1 rounded-md border border-[#2B354D] px-2.5 py-1.5 text-sm`}
                  >
                    Create a New ID
                  </button>
                </div>
              </div>
              {loyaltyId === 'new' ? (
                <>
                  <h6 className="mt-3.5 text-sm text-[#2B354D] opacity-50">Your Loyality ID</h6>
                  <div className="mt-3.5">
                    <p className="w-full rounded-md opacity-50">{businessId}</p>
                  </div>
                </>
              ) : (
                loyaltyId === 'existing' && (
                  <>
                    <h6 className="mt-3.5 text-sm text-[#2B354D] opacity-50">Enter the Existing loyalty ID</h6>
                    <div className="mt-3.5">
                      <input
                        maxLength={24}
                        type="text"
                        className="w-full rounded-md px-2.5"
                        value={loyaltyValue}
                        onChange={(e) => setLoyaltyValue(e.target.value)}
                      />
                    </div>
                  </>
                )
              )}
            </div>
            {loyaltyId === 'new' && (
              <>
                <div className="border-1 my-5 h-[9rem] rounded-md border border-[#CACACA] px-4">
                  <h1 className="mb-1.5 mt-2.5 text-base font-semibold">Set the coinz</h1>
                  <h6 className="mb-3.5 text-sm text-[#2B354D] opacity-50">Percentage of cashback in every bill</h6>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={5}
                      className={`${
                        isRewardChecked && (!rewardsValue || rewardsValue.toString().length === 0) ? 'border border-red-500' : ''
                      } w-full rounded-md px-2.5 pr-6`}
                      placeholder="Percentage"
                      onBlur={handleBlur}
                      onChange={settingUpReward}
                      value={rewardsValue || ''}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg">%</span>
                  </div>
                  {isRewardChecked && (!rewardsValue || rewardsValue.toString().length === 0) ? (
                    <div className="mb-1 text-sm text-red-500">* please enter reward value</div>
                  ) : null}
                </div>
                <div className="border-1 my-5 h-[9rem] rounded-md border border-[#CACACA] px-4">
                  <h1 className="mb-1.5 mt-2.5 text-base font-semibold">Set the maximum claim amount of the bill</h1>
                  <h6 className="mb-3.5 text-sm text-[#2B354D] opacity-50">Maximum cash back amount to redeem</h6>
                  <div className="relative">
                    <input
                      type="text"
                      className={`${
                        isClaimChecked && (!maximumClaim || maximumClaim.toString().length === 0) ? 'border border-red-500' : ''
                      } w-full rounded-md px-2.5 pr-6`}
                      placeholder="Percentage"
                      onBlur={handleClaimBlur}
                      onChange={settingUpClaim}
                      value={maximumClaim || ''}
                      maxLength={5}
                    />
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg">%</span>
                  </div>
                  {isClaimChecked && (!maximumClaim || maximumClaim.toString().length === 0) ? (
                    <div className="mb-1 text-sm text-red-500">* please enter maximum claim value</div>
                  ) : null}
                </div>
                <div className="border-1 my-5 h-[6rem] rounded-md border border-[#CACACA] px-4">
                  <h1 className="mb-1.5 mt-2.5 text-base font-semibold">Set the expiry date for loyalty coinz.</h1>
                  <div className="relative">
                    <select
                      value={expiryDate}
                      onChange={addExpiryDate}
                      className={`${expiryDateChecked ? 'border-1 border border-red-500' : ''} w-full rounded-md px-2.5 pr-6`}
                    >
                      <option value="">Select Expiry Date</option>
                      <option value="183">6 months</option>
                      <option value="365">1 year</option>
                      <option value="730">2 years</option>
                      <option value="1095">3 years</option>
                      <option value="1460">4 years</option>
                      <option value="1825">5 years</option>
                    </select>
                  </div>
                </div>
                <div className="border-1 my-5 h-[6rem] rounded-md border border-[#CACACA] px-4">
                  <h1 className="mb-1.5 mt-2.5 text-base font-semibold">Set the max reward limit (upto 5000)</h1>
                  <div className="relative">
                    <input
                      type="text"
                      className={`${
                        isRewardLimitChecked && (!rewardLimit || rewardLimit.toString().length === 0) ? 'border border-red-500' : ''
                      } w-full rounded-md px-2.5 pr-6`}
                      placeholder="Reward limit"
                      onBlur={handleRewardLimitBlur}
                      onChange={setupRewardLimit}
                      value={rewardLimit || ''}
                      maxLength={5}
                    />
                  </div>
                  {isRewardLimitChecked && (!rewardLimit || rewardLimit.toString().length === 0) ? (
                    <div className="mb-1 text-sm text-red-500">* please enter reward limit</div>
                  ) : null}
                </div>
                <div className="border-1 my-5 h-[9rem] rounded-md border border-[#CACACA] px-4">
                  <h1 className="mb-1.5 mt-2.5 text-base font-semibold">Set the sign up Bonus (optional)</h1>
                  <h6 className="mb-3.5 text-sm text-[#2B354D] opacity-50">Customer&apos;s first sign ups will only get the bonus</h6>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={5}
                      className={`${
                        bonusWarn && (!signUpBonus || signUpBonus.toString().length === 0) ? 'border border-red-500' : ''
                      } w-full rounded-md px-2.5 pr-6`}
                      placeholder="Enter Coinz"
                      onChange={handleSignUpBonus}
                      value={signUpBonus || ''}
                    />
                    {bonusWarn ? <small style={{ color: 'red' }}>* Bonus coinz should be less than or equal to reward limit</small> : null}
                  </div>
                </div>
                <div className="border-1 my-5 flex h-28 flex-col justify-center rounded-md border border-[#CACACA] px-4">
                  <div className="mb-2">
                    <h1 className="text-base font-semibold">Password for adding credits</h1>
                  </div>
                  <div className="relative pb-4">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      minLength={4}
                      maxLength={4}
                      onChange={handlePassword}
                      value={password || ''}
                      className={`${
                        passwordChecked ? 'border border-red-500' : ''
                      } peer mb-0 ml-0 mr-0 w-full rounded-md border border-gray-800 bg-transparent bg-white px-2.5 pl-4 pr-10 text-base text-gray-900 focus:border-[#4071F1] focus:outline-none dark:border-gray-600 dark:text-white`}
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
                </div>
                <div className="border-1 flex h-52 flex-col rounded-md border border-[#CACACA] px-4">
                  <div className="my-4">
                    <h1 className="text-base font-semibold">Set up the loyalty card for your users to see in the digital menu</h1>
                  </div>
                  <div className="flex justify-between">
                    <div className="sticky top-0 flex flex-col items-center justify-center">
                      <LoyalityCard
                        logo={logo}
                        croppedImage={croppedImage}
                        cardColor={cardColor || themes?.secondaryColor}
                        fontColor={fontColor || themes?.accentColor}
                        src={cardPattern}
                        size={'md'}
                      />
                    </div>
                  </div>
                  <div onKeyDown={() => setCardModal(true)} className="mb-4 ml-auto mt-auto" onClick={() => setCardModal(true)}>
                    <button type="button" className="text-base font-semibold text-[#2F80ED] hover:underline">
                      Edit
                    </button>
                  </div>
                </div>
                <div className="sticky bottom-5 mt-6">
                  <button
                    type="button"
                    onClick={isLoyaltyExists ? (e) => handleUpdateLoyalty(e, businessId) : (e) => saveLoyalityData(e, businessId)}
                    className="w-full rounded-md bg-[#2B354D] py-2.5 text-white"
                  >
                    {`${!existsLoyality ? 'Save' : 'Update'}`}
                  </button>
                </div>
              </>
            )}
            {loyaltyId === 'existing' && !openOtp && (
              <div onKeyDown={sendAlert} onClick={sendAlert} className="mt-6">
                <button
                  type="button"
                  className={`${
                    loyaltyValue.length === 24 ? 'on_active_bounce pointer-events-auto opacity-100 ' : 'pointer-events-none opacity-50'
                  } w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
                >
                  Send an Alert
                </button>
              </div>
            )}
            {loyaltyId === 'existing' && openOtp && (
              <div className="border-1 my-5 h-[9.5rem] rounded-md border border-[#CACACA] px-4">
                <h1 className="mb-1.5 mt-2.5 text-base font-semibold">OTP</h1>
                <h6 className="mb-3.5 text-sm text-[#2B354D] opacity-50">
                  Please enter the OTP send to the owner of existing loyalty Business (valid till 3 days)
                </h6>
                <div>
                  <input
                    type="number"
                    className="w-full rounded-md px-2.5 placeholder:opacity-50"
                    placeholder="OTP"
                    maxLength={6}
                    value={otpValue ? otpValue : ''}
                    onChange={handleOtp}
                  />
                </div>
              </div>
            )}
            {loyaltyId === 'existing' && openOtp && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleExistingData}
                  className={`${loading ? 'pointer-events-none opacity-50' : ''} on_active_bounce w-full rounded-md bg-[#2B354D] py-2.5 text-white`}
                >
                  {loading ? 'Loading...' : 'Verify and Save'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {cardModal && (
        <PopUp show={cardModal} onClose={closeModal}>
          <LoyalityCardPopup />
        </PopUp>
      )}
    </>
  );
};

export default memo(LoyalitySetup);

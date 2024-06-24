import axios from '@/axios';
import Loader from '@/components/atoms/loader';
import MiddlePopUp from '@/components/atoms/middlePopUp';
import { useLoyaltyDatas } from '@/components/store/useLoyaltyDatas';
import { paths } from '@/components/utils/paths';
import { PAGE_TYPES, singleRoute } from '@/components/utils/routes';
import { Howl } from 'howler';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiShoppingBag } from 'react-icons/bi';
import { toast } from 'react-toastify';
import AvailedCoins from '../availedCoins';

export function playSound() {
  var sound = new Howl({
    src: ['/sounds/redeem.mp3'],
  });
  sound.play();
}
const LoyaltyCoinsUsage = ({ closeModal, singleUserHist, loyaltyId, userPhone }: any) => {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loyaltyData } = useLoyaltyDatas();
  const [cvv, setCvv] = useState<any>(null);
  const [bill, setBill] = useState<any>(null);
  const [coinz, setCoinz] = useState<any>(null);
  const [userCoinz, setUserCoinz] = useState<any>(null);
  const [billId, setBillId] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  useEffect(() => {
    setUserCoinz(singleUserHist?.totalReward);
  }, [singleUserHist?.totalReward]);
  const closeModalPop = () => {
    router.push(singleRoute[PAGE_TYPES.LOYALTY](businessId));
    setIsModalOpen(false);
    closeModal();
  };

  const postLoyaltyCoinz = async () => {
    if (cvv === '' || cvv === null) {
      return toast.error('Please Enter HiCVV');
    }
    if (isSending) return;
    try {
      const config = {
        method: 'POST',
        url: paths.postLoyaltyCoinz(true, true),

        data: {
          total: bill,
          billId: billId,
          loyaltyId: loyaltyId,
          userPhone: userPhone,
          claimedAmount: coinz,
          password: Number.parseInt(cvv),
        },
      };
      const response = await axios(config);
      if (response.status === 200) {
        toast.success('Amount claimed successfull');
        playSound();
        setIsModalOpen(true);
      } else if (response.status === 400 || response.status === 404) {
        toast.error('Wrong HiCVV');
      }
    } catch (error: any) {
      console.error('Error fetching business data:', error?.response.status);
      if (error?.response.status === 400) {
        toast.error(error?.response?.data);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleHiCVV = (cvv) => {
    cvv = Math.abs(cvv.replace(/[^0-9\b]/g, ''));
    setCvv(cvv);
  };
  const handleBillId = (value: any) => {
    setBillId(value);
  };
  const handleBillAmount = (bill) => {
    bill = Math.abs(bill.replace(/[^0-9\b]/g, ''));
    setBill(bill);
    const canClaimCoinz = Math.round(bill * (loyaltyData?.setClaimAmount / 100) || 0);
    const coinsToSet = userCoinz && canClaimCoinz < userCoinz ? canClaimCoinz : userCoinz;

    setCoinz(coinsToSet);
  };

  const handleCoinz = (coinz) => {
    coinz = Math.abs(coinz.replace(/[^0-9\b]/g, ''));
    const canClaimCoinz = Math.round((bill && bill * (loyaltyData?.setClaimAmount / 100)) || 0);
    const coinsToSet = coinz > canClaimCoinz ? canClaimCoinz : coinz;

    setCoinz(coinsToSet);
  };

  if (isSending) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-6 pt-6">
        <h1 className="text-base font-[600] text-[#2C2C2C]">Loyalty coinz usage</h1>
        <div className="flex items-center">
          <div className="my-[1rem] mr-6 flex items-center justify-start">
            <div className="flex h-[55px] w-[55px] items-center justify-center rounded-full border bg-blue-800 text-lg capitalize text-white">
              {singleUserHist?.userName?.split('')[0] || 'U'}
            </div>
          </div>
          <div>
            <h1 className="text-base font-semibold capitalize text-[#2C2C2C]">{singleUserHist?.userName || singleUserHist?.userPhone}</h1>
            <p className="text-base font-[500] text-[#2C2C2C]">Coins-{singleUserHist?.totalReward}</p>
          </div>
        </div>
        <div>
          <label className="text-sm font-[500] text-[#2C2C2C]">
            Enter the bill Id <span className="text-xs">(optional)</span>
          </label>
          <input
            type="text"
            onChange={(e) => handleBillId(e.target.value)}
            value={billId || ''}
            placeholder="Bill Id"
            className="mb-4 mt-2 w-full rounded-xl border border-[#79747E] px-4 py-1.5"
          />
          <label className="text-sm font-[500] text-[#2C2C2C]">Enter the bill Amount</label>
          <input
            type="text"
            onChange={(e) => handleBillAmount(e.target.value)}
            value={bill || ''}
            className="mb-4 mt-2 w-full rounded-xl border border-[#79747E] px-4 py-1.5"
          />
          <label className="text-sm font-[500] text-[#2C2C2C]">Enter the Hi-CVV</label>
          <input
            type="password"
            onChange={(e) => handleHiCVV(e.target.value)}
            value={cvv || ''}
            className="mb-4 mt-2 w-full rounded-xl border border-[#79747E] px-4 py-1.5"
          />
          <label className="text-sm font-[500] text-[#2C2C2C]">Claiming coinz</label>
          <input
            type="text"
            onChange={(e) => handleCoinz(e.target.value)}
            value={coinz || ''}
            className="mb-4 mt-2 w-full rounded-xl border border-[#79747E] px-4 py-1.5"
          />
        </div>
      </div>
      <div className="bg-primary fixed bottom-0 flex h-20 w-full items-center justify-between px-5">
        <div className="flex items-center">
          <BiShoppingBag color="#fff" size={24} />
          <h1 className="text-base-100 mx-2 text-sm font-semibold">Hi Coinz added</h1>
        </div>
        <button type="button" onClick={postLoyaltyCoinz} className="text-primary bg-base-100 rounded-full px-9 py-4 font-semibold leading-[1.15rem]">
          Confirm
        </button>
      </div>
      {isModalOpen && (
        <MiddlePopUp show={isModalOpen} onClose={closeModalPop}>
          <AvailedCoins userName={singleUserHist?.userName || singleUserHist?.userPhone} bill={bill} coinz={coinz} />
        </MiddlePopUp>
      )}
    </div>
  );
};

export default LoyaltyCoinsUsage;

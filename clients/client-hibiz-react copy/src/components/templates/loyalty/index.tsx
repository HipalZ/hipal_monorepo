import Hi from '@/assets/svg/hi.svg';
import LoyaltySetup from '@/components/atom/loyalitySetup';
import LoyaltyCoins from '@/components/atom/loyaltyCoins';
import LoyaltyCustomer from '@/components/atom/loyaltyCustomer';
import LoyaltyDashboard from '@/components/atom/loyaltyDashboard';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import Header from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { memo, startTransition, useEffect } from 'react';
import { BiSolidReceipt } from 'react-icons/bi';
import { BsChevronLeft, BsPerson } from 'react-icons/bs';
import { LuSettings } from 'react-icons/lu';
import { MdSpaceDashboard } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';
import LoyaltyCSV from './csv';
import { FaArrowLeft } from 'react-icons/fa';

const buttons = [
  {
    text: 'Dashboard',
    Icon: MdSpaceDashboard,
  },
  {
    text: 'Customer',
    Icon: BsPerson,
  },
  {
    text: 'Coins',
    Icon: BiSolidReceipt,
  },
  {
    text: 'Set up',
    Icon: LuSettings,
  },
];

const Loyalty = memo(() => {
  const navigate = useNavigate();
  const { businessId } = useParams<{ businessId: string }>();
  const { selectedSubIcon } = useSelectedIcon();
  const isLoyaltyExists = useBusinessData((s) => s.isLoyaltyExists);
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const key = params.get('tab') || 'Dashboard';
    setSelectedButton(key);
  }, []);

  const handleBack = () => {
    const params = new URLSearchParams(location.search);
    params.delete('tab');
    startTransition(() => {
      navigate(`/app/business/${businessId}/`);
    });
    setSelectedButton('');
  };

  const TabsContent = () => {
    return (
      <div className="sticky top-0 z-20 linear_gradient_background">
        <Header title="Loyalty" onBack={handleBack} leftIcon={<FaArrowLeft />} centerImage={Hi} rightImage={Hi} isIconBusinessShow={false} />
        <SubheaderButtonList buttons={buttons} />
        <div className="flex items-center justify-between px-6 pb-4 mt-2">
          <div className="flex text-2xl">
            <span className="ml-2"> {selectedButton}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {selectedButton === 'Dashboard' ? (
        <>
          <TabsContent />
          <LoyaltyDashboard />
        </>
      ) : selectedButton === 'Customer' ? (
        <>
          <TabsContent />
          <LoyaltyCustomer />
        </>
      ) : selectedButton === 'Coins' ? (
        selectedSubIcon !== 'uploadCSV' ? (
          <>
            <TabsContent />
            <LoyaltyCoins />
          </>
        ) : (
          <LoyaltyCSV />
        )
      ) : (
        <>
          <TabsContent />
          <LoyaltySetup existsLoyality={isLoyaltyExists} />
        </>
      )}
    </>
  );
});

export default Loyalty;

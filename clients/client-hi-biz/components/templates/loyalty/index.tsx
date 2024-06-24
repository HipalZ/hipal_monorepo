import Hi from '@/assets/svg/hi.svg';
import LoyalitySetup from '@/components/atom/loyalitySetup';
import LoyaltyCoins from '@/components/atom/loyaltyCoins';
import LoyaltyCustomer from '@/components/atom/loyaltyCustomer';
import LoyaltyDashboard from '@/components/atom/loyaltyDashboard';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import Header from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { BiSolidReceipt } from 'react-icons/bi';
import { BsChevronLeft, BsPerson } from 'react-icons/bs';
import { LuSettings } from 'react-icons/lu';
import { MdSpaceDashboard } from 'react-icons/md';
import LoyaltyCSV from './csv';

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

function Loyalty() {
  const { setSelectedIcon, selectedSubIcon } = useSelectedIcon();
  const isLoyaltyExists = useBusinessData((s) => s.isLoyaltyExists);
  const selectedButton = useSelectedButtonStore((s) => s.selectedButton);
  const setSelectedButton = useSelectedButtonStore((s) => s.setSelectedButton);
  const router = useRouter();

  useEffect(() => {
    let key = router.query.tab?.toString() || 'Dashboard';
    setSelectedButton(key);
  }, [router.query.tab]);

  const TabsContent = () => {
    return (
      <div className="sticky top-0 z-20 bg-[#f5f5f5]">
        <Header
          title="Loyalty"
          onBack={() => setSelectedIcon('')}
          leftIcon={<BsChevronLeft />}
          centerImage={Hi}
          rightImage={Hi}
          isIconBusinessShow={false}
        />
        <SubheaderButtonList buttons={buttons} />
        <div className="mt-2 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
          <div className="flex text-2xl">
            <span className="ml-2"> {selectedButton}</span>
          </div>
        </div>
      </div>
    );
  };
  useEffect(() => {
    setSelectedButton('Dashboard');
  }, []);
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
          <LoyalitySetup existsLoyalty={isLoyaltyExists} />
        </>
      )}
    </>
  );
}

export default Loyalty;

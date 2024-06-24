import Hi from '@/assets/svg/hi.svg';
import SubheaderButtonList from '@/components/atom/subHeaderBtn';
import DineInDashboard from '@/components/molecules/dineInDashboard';
import Header from '@/components/molecules/header';
import Tables from '@/components/molecules/tables';
import Zones from '@/components/molecules/zones';
import { useSelectedButtonStore } from '@/components/store/useSelectBtn';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo } from 'react';
import { BsBoundingBoxCircles, BsChevronLeft } from 'react-icons/bs';
import { MdOutlineTableBar } from 'react-icons/md';

const classCard = {
  text: 'text-xl',
  background: 'bg-[#2B354D]',
  font: 'text-4xl',
  bg: 'bg-[#2F80ED]/10',
  color: 'text-white',
};
const buttons = [
  {
    Icon: BsBoundingBoxCircles,
    text: 'Zones',
    class: classCard,
  },
  {
    text: 'Tables',
    Icon: MdOutlineTableBar,
    class: classCard,
  },
];
type ComponentMapType = {
  [key in 'Dashboard' | 'Zones' | 'Kitchens' | 'Settings' | 'Tables' | 'Items']: JSX.Element;
};

function useDineInBusinessLogic() {
  const router = useRouter();
  const { businessId } = router.query as { businessId: string };
  const { setSelectedButton, selectedButton } = useSelectedButtonStore();

  const handleClick = (text: string) => {
    setSelectedButton(text);
  };

  return { businessId, selectedButton, handleClick };
}

function DineIn() {
  const router = useRouter();
  const { setSelectedIcon, selectedSubIcon } = useSelectedIcon();
  const { selectedButton, handleClick } = useDineInBusinessLogic();
  const { setSelectedButton } = useSelectedButtonStore();

  const ComponentToRender = useMemo(() => {
    const componentsMap: ComponentMapType = {
      Dashboard: <DineInDashboard buttons={buttons} handleClick={handleClick} />,
      Zones: <Zones />,
      Tables: <Tables />,
    };

    return componentsMap[selectedButton] || null;
  }, [selectedButton, handleClick]);

  useEffect(() => {
    setSelectedButton('Zones');
  }, []);

  return (
    <>
      {selectedSubIcon !== 'addZones' && (
        <div className="sticky top-0 z-20 bg-[#f5f5f5]">
          <Header
            title="Dine In"
            onBack={() => setSelectedIcon('')}
            leftIcon={<BsChevronLeft />}
            centerImage={Hi}
            rightImage={Hi}
            isIconBusinessShow={true}
          />
          <SubheaderButtonList buttons={buttons} />
          <div className="mt-2 flex items-center justify-between border-b border-[#cacaca] px-6 pb-4">
            <span className="flex text-2xl">{selectedButton}</span>
          </div>
        </div>
      )}
      {ComponentToRender}
    </>
  );
}

export default memo(DineIn);

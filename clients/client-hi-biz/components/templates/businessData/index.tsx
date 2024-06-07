import Carousal from '@/assets/svg/carousalImage.svg';
import HipeopleLogo from '@/assets/svg/hiBizlogo.svg';
import Carousel from '@/components/atom/carousel';
import Header from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { useOwnerLogin, type User } from '@/components/store/useOwnerLogin';
import { useSelectedIcon } from '@/components/store/useSelectedIcon';
import { useRouter } from 'next/router';
import type React from 'react';
import { memo, useEffect } from 'react';
import { AiFillHeart } from 'react-icons/ai';
import { BsChevronLeft, BsCurrencyRupee, BsFillPersonFill } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { GiCampCookingPot } from 'react-icons/gi';
import { GoGraph } from 'react-icons/go';
import { IoReceiptOutline } from 'react-icons/io5';
import { LuConciergeBell, LuSettings } from 'react-icons/lu';
import { MdCardMembership, MdReviews } from 'react-icons/md';
import { PiBookOpenText } from 'react-icons/pi';
import { SiSwiggy, SiZomato } from 'react-icons/si';
import { TbReportAnalytics } from 'react-icons/tb';
import { toast } from 'react-toastify';

const images = [Carousal, Carousal];

interface ICardButton {
  Icon: React.ElementType;
  text: string;
  class: {
    background: string;
    text: string;
    font: string;
    bg: string;
    color: string;
    opacity?: string;
  };
  visible: boolean;
}

const cardButtons: ICardButton[] = [
  {
    Icon: BsCurrencyRupee,
    text: 'Sales',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2F80ED]/10',
      color: 'text-[#2F80ED]',
    },
    visible: true,
  },
  {
    Icon: AiFillHeart,
    text: 'Loyalty',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: IoReceiptOutline,
    text: 'Items',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: BsFillPersonFill,
    text: 'Staff',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#7879F1]/10',
      color: 'text-[#7879F1]',
    },
    visible: true,
  },
  {
    Icon: GoGraph,
    text: 'Analytics',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#7879F1]/10',
      color: 'text-[#7879F1]',
    },
    visible: true,
  },
  {
    Icon: TbReportAnalytics,
    text: 'Reports',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: MdCardMembership,
    text: 'Taxes and charges',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#FEA844]/10',
      color: 'text-[#FEA844]',
    },
    visible: true,
  },

  {
    Icon: LuSettings,
    text: 'Settings',
    class: {
      text: 'text-xl',

      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: SiSwiggy,
    text: 'Swiggy',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#fc8019]/10',
      color: 'text-[#fc8019]',
    },
    visible: false,
  },
  {
    Icon: SiZomato,
    text: 'Zomato',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-5xl',
      bg: 'bg-[#cb202d]/10',
      color: 'text-[#cb202d]',
    },
    visible: false,
  },
  {
    Icon: LuConciergeBell,
    text: 'Dine-In',
    class: {
      text: 'text-xl',
      background: 'bg-zinc-300',
      font: 'text-4xl',
      bg: 'bg-[#F2994A]/10',
      color: 'text-[#F2994A]',
      opacity: 'opacity-50',
    },
    visible: false,
  },
  {
    Icon: GiCampCookingPot,
    text: 'Kitchen',
    class: {
      text: 'text-xl',
      background: 'bg-zinc-300',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
      opacity: 'opacity-50',
    },
    visible: false,
  },
  {
    Icon: PiBookOpenText,
    text: 'Menu',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: TbReportAnalytics,
    text: 'Kitchen',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: FaUser,
    text: 'Customerz',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#F2994A]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
  {
    Icon: MdReviews,
    text: 'Reviewz',
    class: {
      text: 'text-xl',
      background: 'bg-white',
      font: 'text-4xl',
      bg: 'bg-[#2B354D]/10',
      color: 'text-[#2B354D]',
    },
    visible: true,
  },
];
interface AccessControlMapping {
  [key: string]: string;
}

function BusinessData() {
  const { setSelectedIcon } = useSelectedIcon();
  const user = useOwnerLogin((s) => s.user);
  const router = useRouter();
  const businessData = useBusinessData((s) => s.businessData);
  const accessControlMapping: AccessControlMapping = {
    dish: 'Items',
    staff: 'Staff',
    loyalty: 'Loyalty',
    sale: 'Sales',
    reports: 'Reports',
    zones_tables: 'Menu',
  };

  const getUpdatedCardButtons = (cards: ICardButton[], user: User) => {
    if (user.role !== 'RESTAURANT_MANAGER') {
      return cards.map((card: ICardButton) => ({ ...card }));
    }
    if (user.accessControl === undefined || Object.keys(user.accessControl).length === 0) {
      toast.error('You do not have access to this business');
      localStorage.removeItem('ownerLogin');
      router.push('/login');
    }
    return cards.map((card: ICardButton) => {
      const hasAccess =
        user.accessControl &&
        Object?.entries(user.accessControl).some(([key, value]) => {
          const permissionName = accessControlMapping?.[key];
          return permissionName === card.text && value;
        });
      return {
        ...card,
        visible: hasAccess,
      };
    });
  };

  const updatedCardButtons = getUpdatedCardButtons(cardButtons, user);
  const handleClick = async (text: string) => {
    setSelectedIcon(text);
  };
  useEffect(() => {
    router.query.tab = 'home';
  }, []);
  return (
    <>
      <div className="relative min-h-screen bg-[#f5f5f5] px-0 md:px-[10vw] lg:px-[10vw]">
        <div className="sticky top-0 z-10 w-full bg-[#f5f5f5] px-0 pb-0 lg:pb-0">
          <Header
            onBack={() => router.push('/business')}
            leftIcon={<BsChevronLeft />}
            centerImage={HipeopleLogo}
            rightImage={HipeopleLogo}
            isIconBusinessShow={user.role !== 'RESTAURANT_MANAGER'}
          />
          <div className="pt-6">
            <Carousel images={images} />
          </div>
          <div className="ml-6 mt-4 text-2xl md:mt-6 lg:mt-16 xl:mt-24">{businessData?.businessName}</div>
        </div>
        <div className="mx-6 mt-5 grid grid-cols-2 gap-4 pb-12 md:grid-cols-3 lg:grid-cols-4 lg:pb-4 xl:grid-cols-5">
          {updatedCardButtons
            .filter((ele) => ele?.visible === true)
            .map((item, index) => (
              <div
                onClick={() => handleClick(item?.text)}
                key={index}
                className={`${item?.class?.background} ${item?.class?.opacity} on_active_bounce h-[9rem] space-y-6 rounded-xl border border-[#CACACA] p-4`}
              >
                <div className={'on_active_bounce'}>
                  {item?.text === 'Swiggy' ? (
                    <div className={`${item?.class?.color} ${item?.class?.bg} flex h-10 w-10 items-center justify-center rounded-full p-2 text-xl`}>
                      S
                    </div>
                  ) : item?.text === 'Zomato' ? (
                    <div className={`${item?.class?.color} ${item?.class?.bg} flex h-10 w-10 items-center justify-center rounded-full p-2 text-xl`}>
                      Z
                    </div>
                  ) : (
                    <item.Icon className={`${item?.class?.color} ${item?.class?.font} ${item?.class?.bg} rounded-full px-2`} />
                  )}
                </div>
                <div className={`${item?.class?.text} font-medium`}>{item?.text}</div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default memo(BusinessData);

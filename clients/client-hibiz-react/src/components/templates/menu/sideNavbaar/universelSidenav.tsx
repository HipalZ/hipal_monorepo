import logoPlaceholder from '@/assets/hisite/logoPlaceholder.png';
import useBusinessData from '@/components/store/useBusinessData';
import { cn } from '@hi/common';
import { memo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface SidebarProps {
  items: { icon?: string; text: string }[];
  selectedNavItem: string;
  changeNav: (str: string) => void;
}

const MemoUniversalNav = ({ items, selectedNavItem, changeNav }: SidebarProps) => {
  const navigate = useNavigate();
  const businessId = useBusinessData((state) => state.businessData?._id);
  const businessLogo = useBusinessData((s) => s?.businessData?.logo);
  const fallbackBusinessLogo = useBusinessData((s) => s?.outletInfo?.logoUrl);
  const { hotelId } = useParams();

  const goToHome = useCallback(() => {
    if (hotelId) return navigate('/app/business/');
    if (businessId) return navigate(`/app/business/${businessId}`);
  }, [navigate, businessId, hotelId]);

  return (
    <section className="sidebar overflow-y-auto">
      <button type="button" onClick={goToHome} className="mx-auto mb-4 mt-8 flex cursor-pointer flex-col items-center justify-center text-center">
        <img
          src={businessLogo || fallbackBusinessLogo || logoPlaceholder}
          alt="logo placeholder"
          className="h-[75px] w-[75px] rounded-full object-cover"
        />
        <span className="mt-2">Home</span>
      </button>
      {items.map((item) => (
        <button
          type="button"
          className={cn(
            'sidebar-item flex flex-col items-center',
            selectedNavItem.toLowerCase() === item.text.toLowerCase() ? '!bg-[#C3B3F850] !transition-all' : '',
          )}
          key={item.text}
          onClick={() => changeNav(item.text)}
        >
          <span className="capitalize">{item.text.split('_').join(' ').toLowerCase()}</span>
        </button>
      ))}
    </section>
  );
};

const UniversalNav = memo(MemoUniversalNav);

export default UniversalNav;

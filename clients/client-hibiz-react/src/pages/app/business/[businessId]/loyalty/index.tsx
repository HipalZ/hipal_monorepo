import LoadingSpinner from '@/components/atom/loadingSpinner';
import MemoizedHeader from '@/components/molecules/header';
import { useLoyalty } from '@/components/store/useLoyalty';
import CardSelection from '@/components/templates/loyalty/cardSelection';
import GetStarted from '@/components/templates/loyalty/getStarted';
import UniversalNav from '@/components/templates/menu/sideNavbaar/universelSidenav';
import { apiRpc, cn } from '@hi/common';
import type { LoyaltyType } from '@hi/db-models/src/validators';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const navItems = [{ text: 'CARD_SELECTION' }];

const Loyalty = () => {
  const selectedPage = useLoyalty((s) => s.selectedPage);
  const setSignupBonus = useLoyalty((s) => s.setSignupBonus);
  const setCoinzBack = useLoyalty((s) => s.setCoinzBack);
  const setResetExpiry = useLoyalty((s) => s.setResetExpiry);
  const setMaxRedemption = useLoyalty((s) => s.setMaxRedemption);
  const setLoyaltyID = useLoyalty((s) => s.setLoyaltyID);
  const setSelectedPage = useLoyalty((s) => s.setSelectedPage);
  const setLoyaltyStartDate = useLoyalty((s) => s.setLoyaltyStartDate);
  const setSelectedCardType = useLoyalty((s) => s.setSelectedCardType);
  const setSelectedCardLayout = useLoyalty((s) => s.setSelectedCardLayout);
  const setCardColor = useLoyalty((s) => s.setCardColor);
  const businessId = useParams()?.businessId;
  const navigate = useNavigate();

  const getLoyaltyData = async () => {
    const response = await apiRpc.businesses[':businessId'].loyalty.$get({
      param: {
        businessId: businessId,
      },
    });
    const loyaltyData = (await response.json()).data as LoyaltyType;
    if (response.status === 200 || response.status === 201) {
      setSignupBonus(loyaltyData?.signUpBonus ?? 0);
      setCoinzBack(loyaltyData?.setCashBackPercentage || 0);
      setResetExpiry(loyaltyData?.loyaltyExpiryDate || 0);
      setMaxRedemption(loyaltyData?.setClaimedPercentage || 0);
      setLoyaltyID(loyaltyData._id?.toString() ?? '');
      setLoyaltyStartDate(loyaltyData?.loyaltyStartDate ?? 0);
      setSelectedCardType(loyaltyData?.cardType ?? 'CARD_ONE');
      setSelectedCardLayout(loyaltyData?.cardLayout ?? 'LAYOUT_THREE');
      setCardColor(loyaltyData?.cardColor ?? '#C4E4B4');
      setSelectedPage('CARD_SELECTION');
    } else {
      setSelectedPage('GET_STARTED');
    }

    return loyaltyData;
  };

  const { isLoading } = useQuery({
    queryKey: ['loyalty', businessId],
    queryFn: getLoyaltyData,
    enabled: !!businessId,
  });

  const changeLayout = useCallback(
    (text: string) => {
      setSelectedPage(text as 'CARD_SELECTION' | 'LOYALTY_USER');
    },
    [selectedPage],
  );

  const goBack = useCallback(() => {
    if (selectedPage === 'GET_STARTED') {
      return navigate(`/app/business/${businessId}`);
    }
    if (selectedPage === 'CARD_SELECTION') {
      return navigate(`/app/business/${businessId}`);
    }
    if (selectedPage === 'LOYALTY_USER') {
      return setSelectedPage('CARD_SELECTION');
    }
  }, [setSelectedPage, navigate, businessId, selectedPage]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <section>
      {selectedPage === 'GET_STARTED' && <GetStarted />}
      {selectedPage !== 'GET_STARTED' && (
        <main>
          <article className="sticky top-0 z-50 bg-white md:bg-transparent lg:bg-transparent">
            <MemoizedHeader title="Loyalty CardZ" onBack={goBack} leftIcon={<FaArrowLeft />} />
            <nav className="mobile-only w-full space-x-4 overflow-hidden px-4 text-sm">
              {navItems.map((item) => (
                <button
                  className={cn(
                    'bg-white pb-3',
                    selectedPage?.toLowerCase() === item.text.toLowerCase()
                      ? 'border-b-2 border-[#8162e6] font-semibold text-[#8162e6] transition-all'
                      : '',
                  )}
                  key={item.text}
                  type="button"
                  onClick={() => changeLayout(item.text)}
                >
                  {item.text.split('_').join(' ')}
                </button>
              ))}
            </nav>
          </article>

          <UniversalNav items={navItems} selectedNavItem={selectedPage} changeNav={changeLayout} />
          {selectedPage === 'CARD_SELECTION' && <CardSelection />}
        </main>
      )}
    </section>
  );
};

export default Loyalty;

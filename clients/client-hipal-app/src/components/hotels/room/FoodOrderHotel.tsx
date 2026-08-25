'use client';

import CommonBottomButton from '@/components/atoms/bottomButton';
import BottomPopUp from '@/components/atoms/bottomPopUp';
import { useCreateAlert, useGetAllLinkRestautants, useHotelRoomData } from '@/components/hooks/useHotelRoom';
import { useCart } from '@/components/store/useCart';
import { useCartStore } from '@/components/store/useCartStore';
import { useLogin } from '@/components/store/useLogin';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import type { IMenuLayout } from '@/components/types/businessData';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { hasGuestContactDetails } from './guestContactGuard';
import { MenuView } from './MenuView';
import { RestaurantListView } from './RestaurantListView';
import { SuccessView } from './SuccessView';

interface FoodOrderPopupProps {
  show: boolean;
  onClose: () => void;
  businessId: string;
  room: string;
  userId: string;
  menuId?: IMenuLayout;
}

interface ILinkHotels {
  _id: string;
  name: string;
  customLink: string;
  logo: string;
}

// View types
type ViewType = 'restaurants' | 'menu';
type OrderStatus = 'idle' | 'loading' | 'success' | 'error';

export default function FoodOrderPopup({ show, onClose, businessId, room, userId, menuId }: FoodOrderPopupProps) {
  // State
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('idle');
  const [selectedRestaurant, setSelectedRestaurant] = useState<ILinkHotels | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('restaurants');
  const [isMenuContentLoading, setIsMenuContentLoading] = useState(false);

  // Hooks
  const pathname = usePathname();
  const query = useSearchParams();
  const router = useRouter();
  const { roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();
  const { fetchingRestaurants, restaurantData } = useGetAllLinkRestautants(businessId) as unknown as {
    fetchingRestaurants: boolean;
    restaurantData: ILinkHotels[] | undefined;
  };

  const { cart, setCartEmpty } = useCartStore();
  const { setShowCart } = useCart();
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const userDetails = useLogin((s) => s.userDetails);
  const linkedRestaurants = restaurantData ?? [];
  const hasSingleRestaurant = linkedRestaurants.length === 1;
  const soleRestaurant = hasSingleRestaurant ? linkedRestaurants[0] : null;
  const activeRestaurant = selectedRestaurant ?? soleRestaurant ?? null;
  const shouldShowMenu = currentView === 'menu' || (!!show && !!soleRestaurant && !selectedRestaurant);

  const updateSelectedRestaurantParam = useCallback(
    (restaurantId?: string) => {
      const params = new URLSearchParams(query.toString());
      if (restaurantId) {
        params.set('restaurantId', restaurantId);
      } else {
        params.delete('restaurantId');
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, query, router],
  );

  const sanitizedCart = useMemo(() => {
    return cart.map(({ dish, ...item }) => {
      const { recommendationIds, addOnIds, ...sanitizedDish } = dish;
      return {
        ...item,
        restaurantId: activeRestaurant?._id,
        dish: {
          ...sanitizedDish,
          businessId: sanitizedDish.businessId || activeRestaurant?._id || '',
          restaurantId: activeRestaurant?._id,
        },
      };
    });
  }, [activeRestaurant?._id, cart]);

  // Handle restaurant selection
  const handleSelectRestaurant = useCallback(
    (restaurant: ILinkHotels) => {
      if (selectedRestaurant?._id === restaurant._id) {
        // If already selected, toggle menu view
        const nextView = currentView === 'restaurants' ? 'menu' : 'restaurants';
        setCurrentView(nextView);
        updateSelectedRestaurantParam(nextView === 'menu' ? restaurant._id : undefined);
      } else {
        setSelectedRestaurant(restaurant);
        setCurrentView('menu');
        setIsMenuContentLoading(true);
        updateSelectedRestaurantParam(restaurant._id);
      }
    },
    [currentView, selectedRestaurant, updateSelectedRestaurantParam],
  );

  useEffect(() => {
    if (!show || !linkedRestaurants.length) return;

    const restaurantId = query.get('restaurantId');
    if (!restaurantId) return;

    const restaurant = linkedRestaurants.find((item) => item._id === restaurantId);
    if (!restaurant || selectedRestaurant?._id === restaurant._id) return;

    setSelectedRestaurant(restaurant);
    setCurrentView('menu');
    setIsMenuContentLoading(true);
  }, [linkedRestaurants, query, selectedRestaurant?._id, show]);

  useEffect(() => {
    if (!show || !hasSingleRestaurant || selectedRestaurant || !soleRestaurant) return;

    setSelectedRestaurant(soleRestaurant);
    setCurrentView('menu');
    setIsMenuContentLoading(true);
  }, [hasSingleRestaurant, selectedRestaurant, show, soleRestaurant]);

  // Handle back to restaurants list
  const handleBackToRestaurants = useCallback(() => {
    if (hasSingleRestaurant) {
      setCartEmpty();
      setShowCart(false);
      onClose();
      return;
    }
    setCurrentView('restaurants');
    setIsMenuContentLoading(false);
    updateSelectedRestaurantParam();
    setCartEmpty();
    setShowCart(false);
  }, [hasSingleRestaurant, onClose, setCartEmpty, setShowCart, updateSelectedRestaurantParam]);

  // Handle order submission
  const handlePlaceOrder = useCallback(async () => {
    if (!hasGuestContactDetails(userDetails)) {
      toast('Please add your name and phone number to continue.');
      setCheckLogin(true);
      return;
    }

    try {
      setOrderStatus('loading');

      // Get room data
      const roomData = (await roomPayload({
        businessId,
        roomName: room || 'hipalz',
      })) as { data?: { _id?: string } };

      const roomId = roomData?.data?._id;
      if (!roomId) {
        throw new Error('Could not find room data');
      }

      await createAlert({
        serviceIds: [],
        businessId,
        userId: userDetails?._id || userId,
        roomId,
        cart: sanitizedCart,
      });

      setCartEmpty();
      setShowCart(false);
      setOrderStatus('success');
    } catch (error) {
      console.error('Error placing food order:', error);
      setOrderStatus('error');
      toast.error('Failed to place your order. Please try again.');
    }
  }, [roomPayload, businessId, room, createAlert, userId, sanitizedCart, setCheckLogin, setCartEmpty, setShowCart, userDetails]);

  useEffect(() => {
    if (!show || orderStatus !== 'success') return;

    const timer = window.setTimeout(() => {
      setOrderStatus('idle');
      setCurrentView('menu');
      setIsMenuContentLoading(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [orderStatus, show]);

  const isInitialLoading = fetchingRestaurants;
  const isSubmittingOrder = creatingAlert || orderStatus === 'loading';
  const shouldShowBottomActions = orderStatus !== 'success' && !isInitialLoading && !isMenuContentLoading;

  // Render content based on current state
  const renderContent = () => {
    if (orderStatus === 'success') {
      return <SuccessView restaurant={activeRestaurant} />;
    }

    if (shouldShowMenu && activeRestaurant) {
      return (
        <MenuView
          restaurant={activeRestaurant}
          onBack={handleBackToRestaurants}
          isLoading={isInitialLoading}
          menuId={menuId}
          onMenuLoadingChange={setIsMenuContentLoading}
        />
      );
    }

    return (
      <RestaurantListView
        restaurants={linkedRestaurants}
        selectedRestaurant={selectedRestaurant}
        onSelectRestaurant={handleSelectRestaurant}
        isLoading={isInitialLoading}
      />
    );
  };

  return (
    <BottomPopUp hide show={show} onClose={onClose} manageHistory={false}>
      <section className="hide-scrollbar relative h-full overflow-auto pb-36">
        <AnimatePresence mode="wait">
          <motion.div
            key={orderStatus === 'success' ? 'success' : currentView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </section>

      {shouldShowBottomActions && (
        <CommonBottomButton
          fixed={true}
          buttons={[
            {
              text: currentView === 'menu' ? 'Back' : 'Cancel',
              onClick: currentView === 'menu' ? handleBackToRestaurants : onClose,
              className: 'rounded-md pl-3',
              isBackButton: true,
              disable: isSubmittingOrder,
            },
            {
              text: isSubmittingOrder ? 'Placing order...' : 'Place Order',
              onClick: handlePlaceOrder,
              className: 'w-full rounded-md',
              disable: isSubmittingOrder || cart?.length === 0 || !activeRestaurant,
            },
          ]}
        />
      )}
    </BottomPopUp>
  );
}

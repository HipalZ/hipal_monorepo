import { useHomeNavigation } from '@/components/hooks/useNavigateHome.ts';
import { useCartStore } from '@/components/store/useCartStore';
import { useOrderStore } from '@/components/store/useOrderData';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HomeIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import CommonBottomButton from '../bottomButton';

const MemoLiveCart = () => {
  const setModalType = useOrderStore((s) => s.setModalType);
  const setCartEmpty = useCartStore((s) => s.setCartEmpty);
  const cart = useCartStore((s) => s.cart);

  const { goHome } = useHomeNavigation();

  const [showCartWarningModal, setShowCartWarningModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const hasCartItems = (cart?.length ?? 0) > 0;

  // Back action: replace with navigate(-1) if you use react-router
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const askClearCartThen = useCallback((action: () => void) => {
    setPendingAction(() => action);
    setShowCartWarningModal(true);
  }, []);

  const handleHomeClick = useCallback(() => {
    if (hasCartItems) {
      askClearCartThen(goHome);
      return;
    }
    goHome();
  }, [hasCartItems, askClearCartThen, goHome]);

  const handleBackClick = useCallback(() => {
    if (hasCartItems) {
      askClearCartThen(goBack);
      return;
    }
    goBack();
  }, [hasCartItems, askClearCartThen, goBack]);

  const keepCart = useCallback(() => {
    setShowCartWarningModal(false);
    setPendingAction(null);
    goBack();
  }, [goBack]);

  const clearCart = useCallback(() => {
    setCartEmpty();
    setShowCartWarningModal(false);

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [setCartEmpty, pendingAction]);

  const showCart = useCallback(() => {
    setModalType('liveCart');
  }, [setModalType]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  }, [cart]);

  return (
    <>
      <CommonBottomButton
        maxWidth="30rem"
        position="mid"
        fixed
        shadow
        buttons={[
          {
            text: ' ',
            onClick: handleHomeClick,
            icon: <HomeIcon />,
            className: 'rounded-md !w-[4rem] pl-2',
          },
          {
            text: '',
            isBackButton: true,
            onClick: handleBackClick,
            className: 'rounded-md pl-2 md:pl-3 !w-[4rem] ml-4',
          },
          {
            text: hasCartItems ? `${totalItems} items added` : 'View Cart',
            onClick: showCart,
            className: 'rounded-md shadow-md',
            highlight: hasCartItems,
            disable: !hasCartItems,
          },
        ]}
      />

      {showCartWarningModal && (
        <Dialog open={showCartWarningModal} onOpenChange={() => setShowCartWarningModal(false)} hide={false}>
          <DialogContent className="min-h-[10rem] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Clear Cart?</DialogTitle>
              <DialogDescription>You will lose all items inside the cart if you proceed. Are you sure you want to continue?</DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={keepCart} className="">
                No, Keep Cart
              </Button>
              <Button onClick={clearCart} className="bg-red-600 text-white hover:bg-red-700">
                Yes, Clear Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

const LiveCart = memo(MemoLiveCart);
export default LiveCart;

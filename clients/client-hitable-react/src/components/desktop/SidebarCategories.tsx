import BottomPopUp from '@/components/atoms/bottomPopUp';
import { useCategories } from '@/components/hooks/useCategories';
import { useCartStore } from '@/components/store/useCartStore';
import { useOrderStore } from '@/components/store/useOrderData';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, RefreshCcw, Settings2 } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SpinnerMemo from '../atoms/loadingSpinner';
import { QuickActionsDrawer } from './QuickActionDrawer';

const SidebarCategories = () => {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { isLoading, refetch } = useCategories();
  const cart = useCartStore((s) => s.cart);
  const categories = useOrderStore((s) => s.allCategories);
  const selected = useOrderStore((s) => s.selectedCategory);
  const setSelected = useOrderStore((s) => s.setSelectedCategory);
  const [showCartWarningModal, setShowCartWarningModal] = useState(false);
  const setCartEmpty = useCartStore((s) => s.setCartEmpty);

  const goToAlerts = useCallback(() => {
    if (cart && cart.length > 0) {
      setShowCartWarningModal(true);
    } else {
      navigate(`/${businessId}/alerts`);
    }
  }, [businessId, navigate, cart]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const toQuickEdit = useCallback(() => {
    navigate(`/${businessId}/edit-menu`);
  }, [businessId, navigate]);

  const clearCart = useCallback(() => {
    setCartEmpty();
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate, setCartEmpty]);

  const keepCart = useCallback(() => {
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);

  const customActions = [
    {
      name: 'Refresh Categories',
      icon: RefreshCcw,
      onClick: handleRefresh,
      variant: 'secondary' as const,
    },
    {
      name: 'Quick Edit Dishes',
      icon: Settings2,
      onClick: toQuickEdit,
      variant: 'secondary' as const,
    },
  ];

  if (isLoading) {
    return <SpinnerMemo />;
  }

  return (
    <div className="bg-background flex h-screen w-full max-w-[12rem] flex-col border-r-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goToAlerts} className="h-8 w-8">
            <ArrowLeft size={24} strokeWidth={3} className="h-4 w-4" />
          </Button>
          <span className="poppins text-xl font-medium">Back</span>
        </div>
        <QuickActionsDrawer customActions={customActions} />
      </div>

      {/* Scrollable Category List */}
      <div className="hide-scrollbar flex-1 overflow-y-auto py-2">
        {categories?.map((cat) => (
          <Button
            key={cat._id}
            onClick={() => setSelected(cat)}
            variant={selected?._id === cat._id ? 'default' : 'ghost'}
            className={cn(
              'poppins w-full justify-start rounded-none py-3 pl-3 pr-2 text-left text-lg transition-colors duration-150',
              'h-auto min-h-[2.5rem] overflow-visible whitespace-normal break-words normal-case leading-snug',
              selected?._id === cat._id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
            )}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Cart Warning Modal */}
      <BottomPopUp height="300px" show={showCartWarningModal} onClose={() => setShowCartWarningModal(false)} hide={false}>
        <div className="flex h-full flex-col p-6">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <h2 className="mb-4 text-2xl font-bold">Clear Cart?</h2>
            <p className="mb-6 text-gray-600">You will lose all items inside the cart if you proceed. Are you sure you want to continue?</p>
            <div className="flex w-full max-w-xs gap-4">
              <Button variant="outline" onClick={keepCart} className="flex-1">
                No, Keep Cart
              </Button>
              <Button onClick={clearCart} className="flex-1 bg-red-600 text-white hover:bg-red-700">
                Yes, Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </BottomPopUp>
    </div>
  );
};

export default memo(SidebarCategories);

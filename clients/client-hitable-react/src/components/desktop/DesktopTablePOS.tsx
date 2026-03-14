import SpinnerMemo from '@/components/atoms/loadingSpinner';
import SearchComponent from '@/components/atoms/placeOrders/searchComponent';
import SearchResultsGrid from '@/components/atoms/placeOrders/searchResultsGrid';
import { useGetAllOrders } from '@/components/hooks/useOrder';
import { useCartStore } from '@/components/store/useCartStore';
import { useLiteStore } from '@/components/store/useLiteStore';
import { useOrderStore } from '@/components/store/useOrderData';
import { useStaffPermissionStore } from '@/components/store/usePermissions';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CategoryType } from '@hi/db-models/src/validators';
import { ChevronDown, FileText, Info, Receipt, ShoppingCart } from 'lucide-react';
import { lazy, memo, Suspense, useEffect, useState } from 'react';
import CartWithPos from '../atoms/cartItem/cartWithpos';
import { useHorizontalScroll } from '../hooks/useHorizontalScoll';
import BillActions from './BillActions';
import OrderActions from './OrderActions';
import SidebarCategories from './SidebarCategories';
import TableQuickNav from './TableQuickNav';

const CartItem = lazy(() => import('@/components/atoms/placeOrders/cartItem'));
const CompactDishGrid = lazy(() => import('@/components/atoms/placeOrders/dishData'));
const GetBill = lazy(() => import('@/components/atoms/placeOrders/getBill'));
const EnhancedOrderCard = lazy(() => import('@/components/atoms/placeOrders/orderCard'));

type RightPanelView = 'cart' | 'orders' | 'bill';

const DesktopTablePOS = () => {
  const selectedCategory = useOrderStore((s) => s.selectedCategory);
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('cart');
  const [menuSyncWarningOpen, setMenuSyncWarningOpen] = useState(false);
  const selectedBill = useOrderStore((s) => s.selectedBill);
  const cartData = useLiteStore((s) => s.cartData);
  const selectedTable = useOrderStore((s) => s.selectedTable);
  const cart = useCartStore((s) => s.cart);
  const searchActive = useOrderStore((s) => s.searchActive);
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useGetAllOrders();

  const hasPermission = useStaffPermissionStore((s) => s.hasPermission);
  const canViewBill = hasPermission('bill');

  useEffect(() => {
    if (cart.length > 0) {
      setRightPanelView('cart');
    } else if (orders && orders.length > 0) {
      setRightPanelView('orders');
    } else {
      setRightPanelView('bill');
    }
  }, [cart, orders]);

  return (
    <>
      {cartData?.length ? (
        <div className="px-4">
          <HorizontalScroll>
            <CartWithPos refetchKot={refetchOrders} className="min-w-[360px] max-w-[360px] snap-start" />
          </HorizontalScroll>
        </div>
      ) : null}

      <SidebarProvider defaultOpen={true}>
        <div className="hidden h-[100dvh] w-full overflow-hidden bg-gray-300 md:flex">
          <SidebarCategories />
          <SidebarInset className="flex-1 overflow-hidden">
            <div className="grid h-full grid-cols-[60%_40%] overflow-hidden">
              <main className="bg-muted/30 flex flex-col overflow-y-auto rounded-xl border-r-2 bg-gray-300">
                <div className="bg-background border-b-2">
                  <div className="px-4 pb-2 pt-4">
                    <Collapsible open={menuSyncWarningOpen} onOpenChange={setMenuSyncWarningOpen} className="mb-2">
                      <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-left text-sm text-amber-800 transition-colors hover:bg-amber-100 data-[state=open]:rounded-b-none">
                        <Info className="h-4 w-4 shrink-0 text-amber-600" />
                        <span className="flex-1 font-medium">Menu syncs every 10 min</span>
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-amber-600 transition-transform duration-200 ${menuSyncWarningOpen ? 'rotate-180' : ''}`}
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent className="rounded-b-md border border-t-0 border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                        Menu data is saved per table and will sync automatically every 10 minutes. Changes may take up to 10 min to reflect.
                      </CollapsibleContent>
                    </Collapsible>
                    <TableQuickNav key={selectedCategory?._id} />
                    <SearchComponent />
                    <h2 className="mt-3 text-xl font-semibold">{selectedCategory ? selectedCategory.name : 'Select a category'}</h2>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="overflow-y-auto p-2">
                    {searchActive && <SearchResultsGrid />}
                    <Suspense fallback={<SpinnerMemo />}>
                      <CompactDishGrid selectedCategory={selectedCategory as CategoryType} />
                    </Suspense>
                  </div>
                </ScrollArea>
              </main>

              <section className="bg-background flex flex-col">
                <div className="bg-background border-b">
                  <div className="p-4">
                    <Tabs value={rightPanelView} onValueChange={(value) => setRightPanelView(value as RightPanelView)}>
                      <TabsList className="flex w-full justify-evenly">
                        {cart.length > 0 && (
                          <TabsTrigger value="cart" className="w-full gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Cart
                            {cart.length > 0 && (
                              <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs">{cart.length}</span>
                            )}
                          </TabsTrigger>
                        )}
                        <TabsTrigger value="orders" className="w-full gap-2">
                          <FileText className="h-4 w-4" />
                          Orders
                          {orders && orders.length > 0 && (
                            <span className="bg-primary text-primary-foreground ml-1 rounded-full px-2 py-0.5 text-xs">{orders.length}</span>
                          )}
                        </TabsTrigger>
                        {orders && orders.length > 0 && canViewBill && (
                          <TabsTrigger value="bill" className="w-full gap-2">
                            <Receipt className="h-4 w-4" />
                            Bill
                          </TabsTrigger>
                        )}
                      </TabsList>
                    </Tabs>
                  </div>
                  {rightPanelView === 'orders' && <OrderActions />}
                  {rightPanelView === 'bill' && (
                    <BillActions discount={(selectedBill as any)?.discount || 0} serviceCharge={(selectedBill as any)?.serviceCharge || 0} />
                  )}
                </div>

                <ScrollArea className="flex-1">
                  <div className="hide-scrollbar h-[90dvh] overflow-auto bg-gray-200 p-0.5">
                    <Suspense fallback={<SpinnerMemo />}>
                      {rightPanelView === 'cart' && (
                        <>
                          {cart.length > 0 ? (
                            <CartItem />
                          ) : (
                            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                              <ShoppingCart className="text-muted-foreground mb-4 h-16 w-16" />
                              <p className="text-muted-foreground text-lg font-medium">Your cart is empty</p>
                              <p className="text-muted-foreground mt-2 text-sm">Add items from the menu to get started</p>
                            </div>
                          )}
                        </>
                      )}

                      {rightPanelView === 'orders' && (
                        <>
                          {ordersLoading ? (
                            <SpinnerMemo />
                          ) : orders && orders.length > 0 ? (
                            <div className="hide-scrollbar h-[90dvh] overflow-auto pb-[8rem]">
                              {orders.map((order: any) => (
                                <EnhancedOrderCard key={order._id} order={order} />
                              ))}
                            </div>
                          ) : (
                            <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                              <FileText className="text-muted-foreground mb-4 h-16 w-16" />
                              <p className="text-muted-foreground text-lg font-medium">No previous orders</p>
                              <p className="text-muted-foreground mt-2 text-sm">Orders will appear here once placed</p>
                            </div>
                          )}
                        </>
                      )}

                      {rightPanelView === 'bill' && selectedTable?.active && orders && orders.length > 0 && <GetBill />}
                    </Suspense>
                  </div>
                </ScrollArea>
              </section>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default memo(DesktopTablePOS);

// import { useRef, WheelEvent } from "react";

function HorizontalScroll({ children }: { children: React.ReactNode }) {
  const ref = useHorizontalScroll<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className="overflow-x-auto overflow-y-hidden [-webkit-overflow-scrolling:touch] [scrollbar-color:theme(colors.gray.400)_transparent] [scrollbar-width:thin]"
      style={{ scrollSnapType: 'x mandatory' }}
    >
      <div className="flex gap-4">{children}</div>
    </div>
  );
}

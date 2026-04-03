import BottomPopUp from '@/components/atoms/bottomPopUp';
import DateRangePicker from '@/components/atoms/dateRangePicker';
import { useCartStore } from '@/components/store/useCartStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useHistoryAlerts } from '@/hooks/useHotelApis';
import { ChevronDown, ChevronUp, Clock, Home, Package, Search, User } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHotelStore } from '../store/useHotelStore';
import { useFormatTimes } from '../utils/helpersHotel';

const MemoHistoryHotel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const { historyData } = useHistoryAlerts();
  const { formatTimestamp } = useFormatTimes();
  const { setCartData, setOpenCartModal } = useHotelStore();
  const [showCartWarningModal, setShowCartWarningModal] = useState(false);
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { setCartEmpty } = useCartStore();
  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  // Filter history items based on search term
  const filteredHistory = useMemo(() => {
    if (!historyData) return [];

    return historyData.filter(
      (item) =>
        item?.roomId?.name.toLowerCase().includes(searchTerm?.toLowerCase()) ||
        item?.serviceIds?.some((service) => service?.name?.toLowerCase().includes(searchTerm?.toLowerCase())) ||
        item?.createdBy?.name.toLowerCase().includes(searchTerm?.toLowerCase()),
    );
  }, [historyData, searchTerm]);

  // Calculate time difference between timestamps in minutes
  const getTimeDifference = (start: number, end: number) => {
    const diffMs = end - start;
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins >= 1440) {
      const diffDays = Math.floor(diffMins / 1440);
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    if (diffMins >= 60) {
      const diffHours = Math.floor(diffMins / 60);
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    return `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
  };

  const viewCart = (cart) => {
    setCartData(cart);
    setOpenCartModal(true);
  };
  const keepCart = useCallback(() => {
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate]);
  const clearCart = useCallback(() => {
    setCartEmpty();
    setShowCartWarningModal(false);
    navigate(`/${businessId}/alerts`);
  }, [businessId, navigate, setCartEmpty]);

  return (
    <>
      <div className="mx-auto px-4 py-6">
        <DateRangePicker />
        <div className="mb-6 mt-2 rounded-lg border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="flex items-center gap-2 text-2xl font-bold">Service History</h1>
            <div className="flex items-center gap-2">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search room, service..."
                  className="border-blue-200 pl-9 focus-visible:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* History items grid */}
        <div className="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredHistory?.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-lg transition-all duration-200">
              {/* Header - Always visible */}
              <section
                className="flex cursor-pointer items-center justify-between border bg-gray-100 p-3"
                onClick={() => toggleItem(item._id)}
                onKeyDown={(e) => e.key === 'Enter' && toggleItem(item._id)}
              >
                <article className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 text-white">
                    <Home className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium">Room:- {item?.roomId?.name}</div>
                  </div>
                </article>

                <article className="flex items-center gap-2">
                  <h1 className="font-medium">{item?.serviceIds[0]?.name}</h1>
                  {expandedItems.has(item._id) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </article>
              </section>

              {/* Accordion content */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  expandedItems.has(item._id) ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="border-t p-4">
                  {/* Service */}
                  <div className="mb-4 flex items-center justify-between">
                    <div className="mb-4 flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 text-white">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <h1>{item?.serviceIds.map((service) => service?.name).join(', ')}</h1>
                        <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                          <User className="h-3.5 w-3.5" />
                          Requested by {item?.createdBy?.name}
                        </div>
                      </div>
                    </div>
                    {item?.cart && item?.cart?.length > 0 && (
                      <Button onClick={() => viewCart(item?.cart)} variant="outline" className="mt-1 text-sm">
                        View Cart
                      </Button>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-8">
                    {/* Vertical line */}
                    <div className="absolute bottom-0 left-[9px] top-0 w-0.5 bg-gradient-to-b from-blue-300 via-indigo-300 to-green-300" />

                    {/* Created */}
                    <div className="group relative mb-4">
                      <div className="absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-blue-500 transition-transform group-hover:scale-110" />
                      <div className="pl-4 transition-transform group-hover:translate-x-1">
                        <div className="text-sm font-medium">Request Created</div>
                        <div className="text-xs text-gray-600">{formatTimestamp(item?.createdAt)}</div>
                      </div>
                    </div>

                    {/* Accepted */}
                    <div className="group relative mb-4">
                      <div className="absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-indigo-400 to-indigo-500 transition-transform group-hover:scale-110" />
                      <div className="pl-4 transition-transform group-hover:translate-x-1">
                        <div className="text-sm font-medium">Request Accepted</div>
                        <div className="text-xs text-gray-600">
                          {formatTimestamp(item?.acceptedAt || item?.createdAt)} •
                          <span className="ml-1">{getTimeDifference(item?.createdAt, item?.acceptedAt)} after request</span>
                        </div>
                        <div className="text-xs text-gray-600">by {item?.acceptedBy?.name}</div>
                      </div>
                    </div>

                    {/* Delivered */}
                    <div className="group relative">
                      <div className="absolute left-[-8px] h-4 w-4 rounded-full border-2 border-white bg-gradient-to-r from-green-400 to-green-500 transition-transform group-hover:scale-110" />
                      <div className="pl-4 transition-transform group-hover:translate-x-1">
                        <div className="text-sm font-medium">Service Delivered</div>
                        <div className="text-xs text-gray-600">
                          {formatTimestamp(item?.deliveredAt || item?.createdAt)} •
                          <span className="ml-1">{getTimeDifference(item?.acceptedAt, item?.deliveredAt)} after acceptance</span>
                        </div>
                        <div className="text-xs text-gray-600">by {item?.deliveredBy?.name}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between border-y p-3 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Time to complete:</span> {getTimeDifference(item?.createdAt, item?.deliveredAt)}
                  </div>
                  <Badge variant="outline" className="border-blue-200 bg-white">
                    ID: {item._id.slice(-6)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}

          {filteredHistory?.length === 0 && (
            <div className="rounded-lg border bg-white py-12 text-center shadow-sm md:col-span-2 xl:col-span-3 2xl:col-span-4">
              <Clock className="mx-auto mb-3 h-16 w-16 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-700">No history found</h3>
              <p className="mx-auto mt-1 max-w-md text-gray-500">
                {searchTerm
                  ? `No results found for "${searchTerm}". Try a different search term.`
                  : 'No service history available for the selected filters.'}
              </p>
              {searchTerm && (
                <Button variant="outline" className="mt-4 border-blue-200" onClick={() => setSearchTerm('')}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {showCartWarningModal && (
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
      )}
    </>
  );
};

const HistoryHotel = memo(MemoHistoryHotel);
export default HistoryHotel;

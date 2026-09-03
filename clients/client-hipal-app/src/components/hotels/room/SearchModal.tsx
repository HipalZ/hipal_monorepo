'use client';

import CommonBottomButton from '@/components/atoms/bottomButton';
import BottomPopUp from '@/components/atoms/bottomPopUp';
import LoadingSpinnerCircle from '@/components/atoms/loader';
import { useCreateAlert, useHotelRoomData } from '@/components/hooks/useHotelRoom';
import type { IService, IServiceCategory } from '@/components/hooks/useServicesHotel';
import { useLogin } from '@/components/store/useLogin';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useUserToken } from '@hi/common/src/useUserToken';
import { Search, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { hasGuestContactDetails } from './guestContactGuard';
import ServiceQuantityPopup from './ServiceQuantityPopup';
import { resolveServiceInstructionMessage } from './serviceBehavior';

// Lazy-loaded components
const AlertCircle = dynamic(() => import('lucide-react').then((mod) => ({ default: mod.AlertCircle })), { ssr: false });
const CheckIcon = dynamic(() => import('lucide-react').then((mod) => ({ default: mod.Check })), { ssr: false });

// Types
type AlertStatus = 'idle' | 'loading' | 'success' | 'error';

const SERVICE_ACTION_COLOR = '#111111';
const SERVICE_ACTION_TEXT_COLOR = '#ffffff';

const formatRaisedServicesToast = (serviceNames: string[]) => {
  if (serviceNames.length === 0) {
    return 'Service request raised.';
  }

  if (serviceNames.length === 1) {
    return `${serviceNames[0]} service request raised.`;
  }

  const lastServiceName = serviceNames[serviceNames.length - 1];
  const servicePrefix = serviceNames.slice(0, -1).join(', ');
  return `${servicePrefix} and ${lastServiceName} service requests raised.`;
};

interface SearchModalProps {
  show: boolean;
  onClose: () => void;
  categories: IServiceCategory[];
  businessId: string;
}

interface SearchResultItemProps {
  service: IService;
  categoryName: string;
  selected: boolean;
  onToggle: () => void;
  onQuantitySelect: () => void;
  getInitial: (name: string) => string;
  quantity: number;
  quantityLimit: number;
  requiresConfirmation: boolean;
}

const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center py-10">
    <AlertCircle className="mb-4 h-16 w-16 text-red-500" />
    <h3 className="text-xl font-semibold text-[#111111]">Request Failed</h3>
    <p className="mb-4 mt-2 text-center text-gray-500">There was an error sending your request. Please try again.</p>
    <button type="button" onClick={onRetry} className="rounded-md bg-[#111111] px-4 py-2 text-white transition-colors hover:bg-neutral-800">
      Try Again
    </button>
  </div>
);

const LoadingState = () => (
  <div className="flex items-center justify-center py-10">
    <LoadingSpinnerCircle />
  </div>
);

const getServiceQuantityLimit = (service: IService) => Math.max(1, Math.min(20, Math.floor(Number(service.quantityLimit) || 1)));

const SearchResultItem = ({
  service,
  categoryName,
  selected,
  onToggle,
  onQuantitySelect,
  getInitial,
  quantity,
  quantityLimit,
  requiresConfirmation,
}: SearchResultItemProps) => (
  <Card
    className={`relative cursor-pointer transition-all duration-200 ${
      selected ? 'border-[#111111] bg-neutral-50 shadow-md ring-1 ring-[#111111]/10' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    } ${service.availability === false ? 'cursor-not-allowed opacity-50' : ''}`}
    onClick={() => {
      if (service.availability !== false) {
        if (requiresConfirmation) {
          onQuantitySelect();
          return;
        }
        onToggle();
      }
    }}
  >
    <CardContent className="p-3">
      <div className="flex items-center gap-3">
        {/* Selection indicator */}
        {selected && (
          <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#111111]">
            <CheckIcon className="h-3 w-3 text-white" />
          </div>
        )}

        {/* Service Image/Avatar */}
        <div className="flex-shrink-0">
          {service.image ? (
            <Image
              src={service.image || '/placeholder.svg'}
              alt={service.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-[#111111] text-sm font-semibold text-white">{getInitial(service.name)}</AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Service Info */}
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-medium text-gray-900">{service.name}</h4>
          <p className="text-xs capitalize text-gray-500">{categoryName.replace(/[^a-zA-Z0-9 ]/g, ' ').toLowerCase()}</p>
          {quantityLimit > 1 ? <p className="mt-0.5 text-[11px] font-medium text-neutral-500">Up to {quantityLimit} per request</p> : null}
        </div>

        {quantityLimit > 1 && quantity > 0 && service.availability !== false && (
          <span className="shrink-0 rounded-full border border-neutral-200 bg-neutral-950 px-3 py-1 text-xs font-bold text-white shadow-sm">
            x{quantity}
          </span>
        )}

        {/* Availability Status */}
        {service.availability === false && (
          <div className="flex-shrink-0">
            <span className="rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-500">Unavailable</span>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default function SearchModal({ show, onClose, categories, businessId }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceQuantities, setSelectedServiceQuantities] = useState<Record<string, number>>({});
  const [quantityPromptService, setQuantityPromptService] = useState<IService | null>(null);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>('idle');

  // Hooks
  const accessToken = useUserToken.getState().accessToken;
  const userDetails = useLogin((s) => s.userDetails);
  const setCheckLogin = usePaymentStore((s) => s.setCheckLogin);
  const query = useSearchParams();
  const room = query.get('room');
  const { gettingRoomLoader, roomPayload } = useHotelRoomData();
  const { creatingAlert, createAlert } = useCreateAlert();

  // Derived state
  const isLoading = gettingRoomLoader;
  const maxSelectableServices = 2;
  const selectedServices = useMemo(
    () =>
      Object.entries(selectedServiceQuantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([serviceId]) => serviceId),
    [selectedServiceQuantities],
  );
  const hasSelectedServices = selectedServices.length > 0;

  // Flatten all services from all categories for searching
  const allServices = useMemo(() => {
    const services: Array<{ service: IService; categoryName: string }> = [];

    for (const category of categories) {
      for (const service of category.serviceIds) {
        if (service.availability === false) continue;
        services.push({
          service,
          categoryName: category.name,
        });
      }
    }

    return services;
  }, [categories]);

  // Filter services based on search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase().trim();
    return allServices.filter(({ service, categoryName }) => {
      const serviceName = service.name.toLowerCase();
      const categoryNameFormatted = categoryName.replace(/[^a-zA-Z0-9 ]/g, ' ').toLowerCase();

      return serviceName.includes(query) || categoryNameFormatted.includes(query);
    });
  }, [searchQuery, allServices]);

  const selectedServiceNames = useMemo(
    () =>
      allServices
        .filter(({ service }) => selectedServices.includes(service._id))
        .map(({ service }) => {
          const quantity = selectedServiceQuantities[service._id] || 1;
          return quantity > 1 ? `${service.name} x${quantity}` : service.name;
        }),
    [allServices, selectedServiceQuantities, selectedServices],
  );

  // Service selection handlers
  const handleServiceToggle = useCallback(
    (serviceId: string) => {
      if (!selectedServices.includes(serviceId) && selectedServices.length >= maxSelectableServices) {
        toast('You can request up to 2 services at a time.');
        return;
      }

      setSelectedServiceQuantities((prev) => {
        if (prev[serviceId]) {
          const { [serviceId]: _removed, ...next } = prev;
          return next;
        }
        return { ...prev, [serviceId]: 1 };
      });
    },
    [maxSelectableServices, selectedServices],
  );

  const isSelected = useCallback((serviceId: string) => selectedServices.includes(serviceId), [selectedServices]);

  const openQuantityPopup = useCallback(
    (service: IService) => {
      const currentQuantity = selectedServiceQuantities[service._id] || 0;
      if (!currentQuantity && selectedServices.length >= maxSelectableServices) {
        toast('You can request up to 2 services at a time.');
        return;
      }
      setQuantityPromptService(service);
    },
    [maxSelectableServices, selectedServiceQuantities, selectedServices.length],
  );

  const handleQuantityConfirm = useCallback((serviceId: string, quantity: number) => {
    setSelectedServiceQuantities((prev) => ({
      ...prev,
      [serviceId]: quantity,
    }));
    setQuantityPromptService(null);
  }, []);

  const handleQuantityRemove = useCallback((serviceId: string) => {
    setSelectedServiceQuantities((prev) => {
      const { [serviceId]: _removed, ...next } = prev;
      return next;
    });
    setQuantityPromptService(null);
  }, []);

  // Alert creation handler
  const handleConfirmSelection = async () => {
    if (!hasSelectedServices) return;
    if (!accessToken || !hasGuestContactDetails(userDetails)) {
      toast('Please add your name and phone number to continue.');
      setCheckLogin(true);
      return;
    }

    try {
      setAlertStatus('loading');

      // Get room data
      const roomData = (await roomPayload({
        businessId,
        roomName: room || 'hipalz',
      })) as { data?: { _id?: string } };

      const roomId = roomData?.data?._id;
      if (!roomId) {
        throw new Error('Could not find room data');
      }

      // Create the alert
      await createAlert({
        serviceIds: selectedServices,
        serviceRequestItems: selectedServices.map((serviceId) => ({
          serviceId,
          quantity: selectedServiceQuantities[serviceId] || 1,
        })),
        businessId,
        userId: userDetails?._id || '',
        roomId,
      });

      toast.success(formatRaisedServicesToast(selectedServiceNames));
      setAlertStatus('idle');
      setSelectedServiceQuantities({});
    } catch (error) {
      console.error('Error creating alert:', error);
      setAlertStatus('error');
      toast.error('Error sending request. Please try again.');
    }
  };

  const handleRetry = useCallback(() => {
    setAlertStatus('idle');
  }, []);

  const getInitial = useCallback((name: string) => {
    return name.charAt(0).toUpperCase();
  }, []);

  const handleClose = useCallback(() => {
    setSearchQuery('');
    setSelectedServiceQuantities({});
    setQuantityPromptService(null);
    setAlertStatus('idle');
    onClose();
  }, [onClose]);

  return (
    <BottomPopUp show={show} onClose={handleClose} hide manageHistory={false}>
      <div className="flex max-h-[90dvh] flex-col overflow-hidden p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#111111]">Search Services</h2>
          <button type="button" onClick={handleClose} className="rounded-full p-1 transition-colors hover:bg-gray-100" aria-label="Close search">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search for services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-gray-300 py-3 pl-10 pr-4 text-black focus:border-[#111111] focus:ring-[#111111]"
            autoFocus
            disabled={alertStatus === 'loading'}
          />
        </div>

        {/* Selected Services Counter */}
        {hasSelectedServices && alertStatus === 'idle' && (
          <div className="mb-4 rounded-lg bg-neutral-100 p-2">
            <p className="text-sm font-medium text-neutral-950">
              {selectedServices.length} service
              {selectedServices.length !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Search Results */}
        <div className="hide-scrollbar mb-20 flex-1 overflow-auto">
          {isLoading && alertStatus === 'idle' ? (
            <LoadingState />
          ) : alertStatus === 'error' ? (
            <ErrorState onRetry={handleRetry} />
          ) : !searchQuery.trim() ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-500">Search for Services</h3>
              <p className="text-sm text-gray-400">Type in the search box to find services across all categories</p>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="mb-2 text-lg font-medium text-gray-500">No Results Found</h3>
              <p className="text-sm text-gray-400">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              <p className="mb-3 text-sm text-gray-600">
                Found {filteredServices.length} service
                {filteredServices.length !== 1 ? 's' : ''}
              </p>
              {filteredServices.map(({ service, categoryName }, index) => (
                <SearchResultItem
                  key={`${service._id}-${index}`}
                  service={service}
                  categoryName={categoryName}
                  selected={isSelected(service._id)}
                  onToggle={() => handleServiceToggle(service._id)}
                  onQuantitySelect={() => openQuantityPopup(service)}
                  getInitial={getInitial}
                  quantity={selectedServiceQuantities[service._id] || 0}
                  quantityLimit={getServiceQuantityLimit(service)}
                  requiresConfirmation={getServiceQuantityLimit(service) > 1 || Boolean(resolveServiceInstructionMessage(service))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom Action Buttons */}
        <CommonBottomButton
          fixed={true}
          buttons={[
            {
              text: 'Cancel',
              onClick: handleClose,
              className: 'rounded-md pl-3',
              isBackButton: true,
              color: SERVICE_ACTION_COLOR,
              textColor: SERVICE_ACTION_TEXT_COLOR,
              disable: alertStatus === 'loading',
            },
            {
              text: alertStatus === 'error' ? 'Try Again' : 'Request Services',
              onClick: alertStatus === 'error' ? handleRetry : handleConfirmSelection,
              className: 'w-full rounded-md',
              color: SERVICE_ACTION_COLOR,
              textColor: SERVICE_ACTION_TEXT_COLOR,
              disable: !hasSelectedServices || alertStatus === 'loading',
              isLoading: alertStatus === 'loading' || creatingAlert,
            },
          ]}
        />
        {quantityPromptService ? (
          <ServiceQuantityPopup
            service={quantityPromptService}
            quantityLimit={getServiceQuantityLimit(quantityPromptService)}
            initialQuantity={selectedServiceQuantities[quantityPromptService._id] || 1}
            instructionMessage={resolveServiceInstructionMessage(quantityPromptService)}
            onClose={() => setQuantityPromptService(null)}
            onConfirm={(quantity) => handleQuantityConfirm(quantityPromptService._id, quantity)}
            onRemove={() => handleQuantityRemove(quantityPromptService._id)}
          />
        ) : null}
      </div>
    </BottomPopUp>
  );
}

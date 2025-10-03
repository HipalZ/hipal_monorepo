import { useCheckIn, useGetRoom } from '@/hooks/useHotelApis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BedDouble, Phone, User } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { FaGlobe } from 'react-icons/fa';
import QRCode from 'react-qr-code';
import CommonBottomButton from '../atoms/bottomButton';
import useBusinessData from '../store/useBusinessData';
import { useHotelStore } from '../store/useHotelStore';
import { Button } from '../ui/button';
import { CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export const sources = ['Corporate', 'Online Travel Agent', 'Hotel Website', 'Free Individual Traveler', 'Other'];
const MemoAvailableRoomHotel = () => {
  const { roomData, setOpenRoomModal, guestName, setGuestName, phoneNumber, setPhoneNumber, selectedSource, setSelectedSource } = useHotelStore();
  const [customSource, setCustomSource] = useState('');
  const businessId = useBusinessData((s) => s.outletInfo?.businessId);
  const [isCustomSource, setIsCustomSource] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const { checkIn } = useCheckIn();
  const { getRoom } = useGetRoom(roomData?._id);
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Simple validation
  const isValidName = guestName.trim().length >= 3;
  const isValidPhone = /^\+?[0-9]{10,15}$/.test(phoneNumber);
  const isFormValid = isValidName && isValidPhone;

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // Allow only numbers and + sign
      const value = e.target.value.replace(/[^\d+]/g, '');
      setPhoneNumber(value);
    },
    [setPhoneNumber],
  );

  const { isPending, mutateAsync } = useMutation({
    mutationFn: checkIn,
  });

  const handleSubmit = () => {
    if (!isFormValid) {
      toast.error('Invalid Information');
      return;
    }
    setIsSubmitting(true);
    try {
      mutateAsync();
    } catch (error) {
      toast.error('Failed to register guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = useCallback(() => {
    setOpenRoomModal(false);
    queryClient.invalidateQueries({
      queryKey: ['allRooms'],
    });
  }, [setOpenRoomModal, queryClient]);

  const handleSources = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      if (value === 'Other') {
        setIsCustomSource(true);
        setSelectedSource(customSource || '');
      } else {
        setIsCustomSource(false);
        setSelectedSource(value);
        setCustomSource('');
      }
    },
    [customSource, setSelectedSource],
  );

  const handleCustomSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCustomSource(value);
      setSelectedSource(value);
    },
    [setSelectedSource],
  );

  const handleShowStatus = useCallback(() => {
    setLoadingStatus(!loadingStatus);
  }, [loadingStatus]);

  useQuery({
    queryKey: ['roomData', roomData?._id],
    queryFn: getRoom,
    enabled: !!businessId && !!roomData?._id && loadingStatus,
    refetchInterval: 10000,
  });

  return (
    <section className="mx-auto min-h-[90dvh] w-full bg-white pb-20">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl">
          <header className="flex items-center justify-center gap-2 text-center">
            <BedDouble className="h-6 w-6 text-green-600" />
            Room {roomData?.name}
          </header>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Primary Guest Name
          </h1>
          <Input
            id="guestName"
            placeholder="Enter Guest Name"
            value={guestName}
            maxLength={30}
            onChange={(e) => setGuestName(e.target.value)}
            className={`border-black ${!guestName || isValidName ? '' : 'border-red-500'}`}
          />
          {guestName && !isValidName && <p className="text-xs text-red-500">Name must be at least 3 characters</p>}
        </div>
        <div className="space-y-2">
          <h1 className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number
          </h1>
          <Input
            id="phoneNumber"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={handlePhoneChange}
            type="tel"
            maxLength={10}
            className={`border-black ${!phoneNumber || isValidPhone ? '' : 'border-red-500'}`}
          />
          {phoneNumber && !isValidPhone && <p className="text-xs text-red-500">Please enter a valid phone number</p>}
        </div>
        <article>
          <h1 className="flex items-center gap-2">
            <FaGlobe className="h-4 w-4" />
            Source of Booking
          </h1>
          <p className="text-sm text-gray-500">Select the source of booking for this guest</p>
        </article>
        <select
          value={isCustomSource ? 'Other' : selectedSource}
          onChange={handleSources}
          className="w-full rounded-md border border-black p-2"
          aria-label="Select Source"
        >
          <option value="" disabled>
            Select Source
          </option>
          {sources.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        {isCustomSource && (
          <Input
            className="mt-2 border-black"
            placeholder="Enter custom source"
            value={customSource}
            maxLength={30}
            onChange={handleCustomSourceChange}
          />
        )}
        <center className="relative space-y-2">
          <h1>(or)</h1>
          <h1 className="mb-2 text-center text-lg font-medium text-gray-700">Scan QR to check-in</h1>

          <div className="relative inline-block">
            <QRCode value={roomData?.downLoadLink || ''} size={180} />
            {loadingStatus && (
              <div className="absolute inset-0 flex items-center justify-center rounded bg-white/70">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
              </div>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-700">Powered by Hipalz</p>
          <Button size="sm" onClick={handleShowStatus} className="mb-4 flex items-center">
            {loadingStatus ? 'Hide Status' : 'Show Status'}
          </Button>
        </center>
      </CardContent>
      <CommonBottomButton
        maxWidth="30rem"
        position="mid"
        fixed={true}
        shadow
        buttons={[
          {
            text: '',
            isBackButton: true,
            onClick: handleBack,
            className: 'rounded-md pl-3',
          },
          {
            text: 'Register Guest',
            onClick: handleSubmit,
            className: 'rounded-md shadow-md',
            disable: !isFormValid || isSubmitting || isPending,
          },
        ]}
      />
    </section>
  );
};

const AvailableRoomHotel = memo(MemoAvailableRoomHotel);
export default AvailableRoomHotel;

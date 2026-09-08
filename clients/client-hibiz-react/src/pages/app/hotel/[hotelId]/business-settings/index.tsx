import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateBusinessSetting } from '@/hooks/hotel/useBusinessSettingHook';
import { Clock, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const normalizeTimeValue = (time?: string) => (time || '').slice(0, 5);

const numberToTimeString = (value?: number | string) => {
  if (typeof value === 'string' && value.includes(':')) return normalizeTimeValue(value);

  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '';

  if (numericValue === 1440 || numericValue === 2400) return '00:00';

  const hours = Math.floor(numericValue / 100);
  const minutes = numericValue % 100;

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return '';

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const timeStringToNumber = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  return Number(`${hours.padStart(2, '0')}${minutes.padStart(2, '0')}`);
};

const isAllDayTiming = (startTime?: string | number, endTime?: string | number) => {
  const start = numberToTimeString(startTime);
  const end = numberToTimeString(endTime);
  return start === '00:00' && (end === '23:59' || end === '00:00');
};

const BusinessSettingsHotel = () => {
  const navigate = useNavigate();
  const businessData = useBusinessData((s) => s.outletInfo);
  const { updateBusinessSettingLoader, updateBusinessSetting } = useUpdateBusinessSetting();

  // Form state
  const [formData, setFormData] = useState({
    branchName: businessData?.branchName || '',
    is24Hours: false,
    startTime: '04:00',
    endTime: '03:59',
    orderEditWindowMinutes: businessData?.orderEditWindowMinutes ?? 2,
    foodOrderAcceptanceTime: businessData?.foodOrderSla?.avgAcceptanceTime ?? 0.5,
    foodOrderDeliveryTime: businessData?.foodOrderSla?.avgDeliveryTime ?? 30,
    foodOrderUseItemPrepTime: businessData?.foodOrderSla?.useItemPrepTime ?? true,
    phoneNumber: businessData?.phone || '',
    googleMapsDirection: businessData?.location || '',
  });

  // Error state
  const [errors, setErrors] = useState({
    branchName: false,
    phoneNumber: false,
  });

  useEffect(() => {
    if (!businessData) return;
    const savedStartTime = numberToTimeString(businessData.startBillTime ?? businessData.billingStartTime) || '04:00';
    const savedEndTime = numberToTimeString(businessData.endBillTime ?? businessData.billingEndTime) || '03:59';
    setFormData((current) => ({
      ...current,
      branchName: businessData.branchName || '',
      is24Hours: isAllDayTiming(savedStartTime, savedEndTime),
      startTime: savedStartTime,
      endTime: savedEndTime,
      orderEditWindowMinutes: businessData.orderEditWindowMinutes ?? 2,
      foodOrderAcceptanceTime: businessData.foodOrderSla?.avgAcceptanceTime ?? 0.5,
      foodOrderDeliveryTime: businessData.foodOrderSla?.avgDeliveryTime ?? 30,
      foodOrderUseItemPrepTime: businessData.foodOrderSla?.useItemPrepTime ?? true,
      phoneNumber: businessData.phone || '',
      googleMapsDirection: businessData.location || '',
    }));
  }, [businessData]);

  // Format time for display (convert 24h to 12h format with AM/PM)
  const formatTimeForDisplay = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  // Handle input changes

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData({
      ...formData,
      [field]: value,
    });

    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors({
        ...errors,
        [field]: false,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessData?.businessId) {
      toast.error('Business details not found');
      return;
    }

    if (formData.phoneNumber.length !== 10) {
      toast.error('Phone number should be 10 digits');
      setErrors({
        ...errors,
        phoneNumber: true,
      });
      return;
    }

    // Validate mandatory fields
    const newErrors = {
      branchName: !formData.branchName,
      phoneNumber: !formData.phoneNumber,
    };

    const payload = {
      businessId: businessData.businessId,
      name: businessData.name,
      branchName: formData.branchName,
      startBillTime: formData.is24Hours ? 0 : timeStringToNumber(formData.startTime),
      endBillTime: formData.is24Hours ? 2359 : timeStringToNumber(formData.endTime),
      phone: formData.phoneNumber,
      location: formData.googleMapsDirection,
      orderEditWindowMinutes: formData.orderEditWindowMinutes,
      foodOrderSla: {
        avgAcceptanceTime: Math.min(5760, Math.max(0.5, Number(formData.foodOrderAcceptanceTime) || 0.5)),
        avgDeliveryTime: Math.min(5760, Math.max(1, Number(formData.foodOrderDeliveryTime) || 30)),
        useItemPrepTime: Boolean(formData.foodOrderUseItemPrepTime),
      },
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some((error) => error)) {
      toast.error('Please fill in all mandatory fields');
      return;
    }

    await updateBusinessSetting(payload);
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <main className="min-h-screen bg-[#F6F4F1] pb-28">
      <header className="linear_gradient_background">
        <MemoizedHeader title="Business Settings" leftIcon={<FaArrowLeft />} onBack={handleBack} />
      </header>
      <form onSubmit={handleSubmit} className="mx-auto grid max-w-6xl gap-5 overflow-y-auto p-4 pb-[7rem] md:p-6 xl:grid-cols-2 xl:items-start">
        {/* Business Summary */}
        <div className="space-y-3 xl:col-span-2">
          <h2 className="text-xl font-bold">Business Summary</h2>
          <Card className="shadow-sm">
            <CardContent className="grid gap-4 p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">
                    Business Name :- <span className="ml-2 text-base font-semibold"> {businessData?.name}</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessType">
                    Business Type :-<span className="ml-2 text-base font-semibold"> {businessData?.outLetType}</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessContact">
                    Business Contact :- <span className="ml-2 text-base font-semibold"> {businessData?.phone}</span>
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branchName" className={errors.branchName ? 'text-destructive' : ''}>
                    Branch Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="branchName"
                    value={formData.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    className={errors.branchName ? 'border-destructive' : ''}
                    placeholder="Enter branch name"
                  />
                  {errors.branchName && <p className="text-destructive text-sm">Branch name is required</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Timings */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Business Timings</h2>
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-5">
              <p className="text-muted-foreground text-sm">
                Billing, enquiries and other analytics reports are created with this in mind. Choose a start and end date.
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is24Hours"
                  checked={formData.is24Hours}
                  onCheckedChange={(checked) => handleInputChange('is24Hours', Boolean(checked))}
                />
                <Label htmlFor="is24Hours">My business works 24/7</Label>
              </div>

              {!formData.is24Hours && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Opening Time</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => handleInputChange('startTime', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Closing Time</Label>
                    <div className="flex items-center space-x-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => handleInputChange('endTime', e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted/30 rounded-lg border p-4">
                <Label className="mb-2 block font-medium">Business Hours</Label>
                {formData.is24Hours ? (
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="text-primary h-5 w-5" />
                    <span>Open 24 hours</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="text-primary h-5 w-5" />
                        <span>
                          {formatTimeForDisplay(formData.startTime)} - {formatTimeForDisplay(formData.endTime)}
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {formData.startTime > formData.endTime ? 'Your business operates overnight' : 'Your business operates within the same day'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Food Order Controls */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Food Order Controls</h2>
          <Card className="shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div>
                <Label htmlFor="orderEditWindowMinutes" className="text-base font-semibold">
                  Guest order edit window
                </Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  Guests can edit food orders only within this time after placing them. Set 0 minutes to disable editing.
                </p>
              </div>
              <div className="flex max-w-xs items-center gap-3">
                <Input
                  id="orderEditWindowMinutes"
                  type="number"
                  min={0}
                  max={120}
                  value={formData.orderEditWindowMinutes}
                  onChange={(e) => handleInputChange('orderEditWindowMinutes', Math.min(120, Math.max(0, Number(e.target.value) || 0)))}
                  className="max-w-28"
                />
                <span className="text-muted-foreground text-sm font-medium">minutes</span>
              </div>

              <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="foodOrderAcceptanceTime" className="text-sm font-semibold">
                    Food order acceptance SLA
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="foodOrderAcceptanceTime"
                      type="number"
                      min={0.5}
                      max={5760}
                      step={0.5}
                      value={formData.foodOrderAcceptanceTime}
                      onChange={(e) => handleInputChange('foodOrderAcceptanceTime', Math.min(5760, Math.max(0.5, Number(e.target.value) || 0.5)))}
                      className="max-w-28"
                    />
                    <span className="text-muted-foreground text-sm font-medium">minutes</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodOrderDeliveryTime" className="text-sm font-semibold">
                    Default fulfillment SLA
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="foodOrderDeliveryTime"
                      type="number"
                      min={1}
                      max={5760}
                      value={formData.foodOrderDeliveryTime}
                      onChange={(e) => handleInputChange('foodOrderDeliveryTime', Math.min(5760, Math.max(1, Number(e.target.value) || 30)))}
                      className="max-w-28"
                    />
                    <span className="text-muted-foreground text-sm font-medium">minutes</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="foodOrderUseItemPrepTime"
                    checked={formData.foodOrderUseItemPrepTime}
                    onCheckedChange={(checked) => handleInputChange('foodOrderUseItemPrepTime', Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div>
                    <Label htmlFor="foodOrderUseItemPrepTime" className="font-semibold text-indigo-950">
                      Use menu item preparation time when available
                    </Label>
                    <p className="mt-1 text-sm text-indigo-900/70">
                      Reports use the longest item prep time in the cart. If an item has no prep time, this default fulfillment SLA is used.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Business Communication */}
        <div className="space-y-3 pb-[5rem]">
          <h2 className="text-xl font-bold">Business Communication</h2>
          <Card className="shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className={errors.phoneNumber ? 'text-destructive' : ''}>
                  Which phone number to display to customers <span className="text-destructive">*</span>
                </Label>
                <div className="flex">
                  <div className="bg-muted flex items-center justify-center rounded-l-md border border-r-0 px-3">+91</div>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className={`rounded-l-none ${errors.phoneNumber ? 'border-destructive' : ''}`}
                    placeholder="Enter mobile number"
                    maxLength={10}
                  />
                </div>
                {errors.phoneNumber && <p className="text-destructive text-sm">Phone number is required</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="googleMapsDirection">Add directions for Google Maps</Label>
                <Input
                  id="googleMapsDirection"
                  value={formData.googleMapsDirection}
                  onChange={(e) => handleInputChange('googleMapsDirection', e.target.value)}
                  placeholder="Enter Google Maps link or address"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <AdvancedBottomButton
          fixed={true}
          maxWidth="30rem"
          buttons={[
            {
              text: 'Cancel',
              type: 'button',
              onClick: handleBack,
              className: 'w-full pl-3 rounded-md',
              isBackButton: true,
              disable: updateBusinessSettingLoader,
            },
            {
              text: 'Save',
              type: 'submit',
              icon: <Save className="mr-2 h-4 w-4" />,
              className: 'w-full rounded-md',
              isLoading: updateBusinessSettingLoader,
            },
          ]}
        />
      </form>
    </main>
  );
};

export default BusinessSettingsHotel;

import AdvancedBottomButton from '@/components/atom/bottomButton/advancedBottomButton';
import CapacityManager from '@/components/business-hours/CapacityManager';
import DayConfigList from '@/components/business-hours/DayConfigList';
import MemoizedHeader from '@/components/molecules/header';
import useBusinessData from '@/components/store/useBusinessData';
import type { UpdateBusinessDayConfigPayload } from '@/components/types/business-day-config';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useGetBusinessDayConfigs, useToggleAllDays, useToggleDay, useUpdateBusinessDayConfig } from '@/hooks/useBusinessDayConfig';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, LayoutGrid, Ticket, PhoneIcon as WhatsappIcon } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Update the NavCard component to use the pink gradient
const NavCard = ({ icon: Icon, title, onClick, disabled = false }: { icon: any; title: string; onClick?: () => void; disabled?: boolean }) => {
  return (
    <Card
      className={cn('cursor-pointer text-center transition-all hover:shadow-md', disabled ? 'cursor-not-allowed opacity-50' : '')}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="flex flex-col items-center px-4 pb-4 pt-6">
        <div className="mb-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
            <div className="transform rounded-full bg-gradient-to-br from-pink-400 to-pink-600 p-3 shadow-lg transition-transform hover:scale-105">
              <Icon className="h-8 w-8 text-white drop-shadow-md" />
            </div>
          </motion.div>
        </div>
        <h3 className="text-sm font-bold">{title}</h3>
      </CardContent>
    </Card>
  );
};

const Everyday = () => {
  // Get businessId from URL params
  const { businessId } = useParams<{ businessId: string }>();
  const businessData = useBusinessData((state) => state.businessData);
  const navigate = useNavigate();

  // Local UI state
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [isCapacityModalOpen, setIsCapacityModalOpen] = useState(false);

  // Use the business day config hooks for API calls
  const { data: businessDayConfigs, isLoading: isLoadingConfigs } = useGetBusinessDayConfigs((businessId as string) || '');
  const { toggleAllDays, isToggling: isTogglingAllDays } = useToggleAllDays();
  const { toggleDay, isToggling: isTogglingDay } = useToggleDay();
  const { updateBusinessDayConfig, isUpdating } = useUpdateBusinessDayConfig();

  const handleToggleAllDays = useCallback(async () => {
    if (businessId) {
      setIsActionInProgress(true);
      try {
        await toggleAllDays(businessId);
      } finally {
        setIsActionInProgress(false);
      }
    }
  }, [businessId, toggleAllDays]);

  const handleToggleDay = useCallback(
    async (businessId: string, dayOfWeek: number) => {
      setIsActionInProgress(true);
      try {
        await toggleDay({ businessId, dayOfWeek });
      } finally {
        setIsActionInProgress(false);
      }
    },
    [toggleDay],
  );

  /**
   * Update a day configuration
   */
  const handleUpdateConfig = useCallback(
    async (businessId: string, payload: UpdateBusinessDayConfigPayload) => {
      setIsActionInProgress(true);
      try {
        await updateBusinessDayConfig({ businessId, payload });
      } finally {
        setIsActionInProgress(false);
      }
    },
    [updateBusinessDayConfig],
  );

  // Check if any day is open
  const anyDayOpen = businessDayConfigs.some((config) => config.isOpen);

  // Update the navigateTo function to use the correct path structure
  const navigateTo = useCallback((path: string) => {
    navigate(`${path}`);
  }, []);

  // Determine if any loading state is active
  const showLoading = isLoadingConfigs || isTogglingAllDays || isTogglingDay || isUpdating || isActionInProgress;

  return (
    <main className="min-h-screen pb-[10rem]">
      {/* Header */}
      <header className="linear_gradient_background">
        <MemoizedHeader title="Everyday Booking" />
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {/* Navigation Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card
            className="cursor-pointer items-start overflow-hidden shadow-md transition-all hover:shadow-lg"
            onClick={() => setIsCapacityModalOpen(true)}
          >
            <CardContent className="flex flex-col items-center px-4 pb-4 pt-6">
              <div className="mb-3 flex flex-col items-center">
                <div className="bg-primary/20 mb-2 flex h-16 w-16 items-center justify-center rounded-full">
                  <span className="text-primary text-2xl font-bold">{businessData?.capacity || 0}</span>
                </div>
                <h3 className="text-sm font-bold">Capacity</h3>
              </div>
            </CardContent>
          </Card>

          <NavCard icon={Ticket} title="Coupons" onClick={() => navigateTo('coupons')} />

          <NavCard icon={LayoutGrid} title="All Periods & Slots" onClick={() => navigateTo('period')} />

          <NavCard icon={Calendar} title="Calendar" onClick={() => navigateTo('calendar')} />

          {/* <NavCard icon={WhatsappIcon} title="WhatsApp" disabled={true} /> */}
        </div>

        {/* Loading indicator */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-[1px]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 rounded-xl bg-white p-6 shadow-xl"
              >
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
                <p className="font-medium text-gray-700">Updating business hours...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day configuration list */}
        {businessDayConfigs.length > 0 ? (
          <DayConfigList
            configs={businessDayConfigs}
            businessId={businessId || ''}
            onToggleDay={handleToggleDay}
            onUpdateConfig={handleUpdateConfig}
          />
        ) : !showLoading ? (
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-8 text-center">
              <motion.div
                className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100"
                whileHover={{ scale: 1.05, rotate: 5 }}
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 5, 0, -5, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5,
                  ease: 'easeInOut',
                }}
              >
                <Calendar size={30} className="text-gray-900" />
              </motion.div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">No business hours configured</h3>
              <p className="mx-auto max-w-md text-gray-500">
                No business day configurations found. Please contact support to set up your initial configuration.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Capacity Modal */}
      <Dialog open={isCapacityModalOpen} onOpenChange={setIsCapacityModalOpen}>
        <DialogContent className="p-2 sm:max-w-[425px]">
          <CapacityManager businessId={businessId || ''} currentCapacity={businessData?.capacity || 1} />
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: anyDayOpen ? 'Close All Days' : 'Open All Days',
            onClick: () => handleToggleAllDays(),
            disable: showLoading,
            className: `w-full h-12 ${anyDayOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`,
            swipe: true,
          },
        ]}
      />
    </main>
  );
};

export default Everyday;

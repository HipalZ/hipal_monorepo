import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MemoizedHeader from "@/components/molecules/header";
import DayConfigList from "@/components/business-hours/DayConfigList";
import {
  Calendar,
  PhoneIcon as WhatsappIcon,
  Ticket,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useGetBusinessDayConfigs,
  useToggleAllDays,
  useToggleDay,
  useUpdateBusinessDayConfig,
} from "@/hooks/useBusinessDayConfig";
import type { UpdateBusinessDayConfigPayload } from "@/components/types/business-day-config";
import useBusinessData from "@/components/store/useBusinessData";
import { Card, CardContent } from "@/components/ui/card";
import AdvancedBottomButton from "@/components/atom/bottomButton/advancedBottomButton";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import CapacityManager from "@/components/business-hours/CapacityManager";



// Update the NavCard component to use the pink gradient
const NavCard = ({
  icon: Icon,
  title,
  onClick,
  disabled = false,
}: {
  icon: any;
  title: string;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <Card
      className={cn(
        "text-center cursor-pointer transition-all hover:shadow-md",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardContent className="pt-6 pb-4 px-4 flex flex-col items-center">
        <div className="mb-3">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
            <div className="p-3 transition-transform transform rounded-full shadow-lg bg-gradient-to-br from-pink-400 to-pink-600 hover:scale-105">
              <Icon className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </motion.div>
        </div>
        <h3 className="font-bold text-sm">{title}</h3>
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
  const { data: businessDayConfigs, isLoading: isLoadingConfigs } = useGetBusinessDayConfigs(businessId as string || "");
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
  const showLoading =
    isLoadingConfigs ||
    isTogglingAllDays ||
    isTogglingDay ||
    isUpdating ||
    isActionInProgress;

  return (
    <main className="min-h-screen pb-[10rem]">
      {/* Header */}
      <header className="linear_gradient_background">
        <MemoizedHeader title="Everyday Booking" />
      </header>

      {/* Main content */}
      <div className="container px-4 py-8 mx-auto">
        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card
            className="items-start overflow-hidden shadow-md cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setIsCapacityModalOpen(true)}
          >
            <CardContent className="pt-6 pb-4 px-4 flex flex-col items-center">
              <div className="mb-3 flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <span className="font-bold text-primary text-2xl">
                    {businessData?.capacity || 0}
                  </span>
                </div>
                <h3 className="font-bold text-sm">Capacity</h3>
              </div>
            </CardContent>
          </Card>

          <NavCard
            icon={Ticket}
            title="Coupons"
            onClick={() => navigateTo("coupons")}
          />

          <NavCard
            icon={LayoutGrid}
            title="All Periods & Slots"
            onClick={() => navigateTo("period")}
          />

          <NavCard icon={WhatsappIcon} title="WhatsApp" disabled={true} />
        </div>

        {/* Loading indicator */}
        <AnimatePresence>
          {showLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/5 backdrop-blur-[1px] z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-4 p-6 bg-white shadow-xl rounded-xl"
              >
                <div className="w-8 h-8 border-4 rounded-full border-primary border-t-transparent animate-spin" />
                <p className="font-medium text-gray-700">
                  Updating business hours...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Update the section with the capacity card to remove the business schedule card */}
        <section className="flex flex-col gap-4 mb-6 md:flex-row">
          {/* Capacity Card */}
        </section>

        {/* Day configuration list */}
        {businessDayConfigs.length > 0 ? (
          <DayConfigList
            configs={businessDayConfigs}
            businessId={businessId || ""}
            onToggleDay={handleToggleDay}
            onUpdateConfig={handleUpdateConfig}
          />
        ) : !showLoading ? (
          <Card className="overflow-hidden shadow-md">
            <CardContent className="p-8 text-center">
              <motion.div
                className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full"
                whileHover={{ scale: 1.05, rotate: 5 }}
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 5, 0, -5, 0],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 5,
                  ease: "easeInOut",
                }}
              >
                <Calendar size={30} className="text-gray-900" />
              </motion.div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No business hours configured
              </h3>
              <p className="max-w-md mx-auto text-gray-500">
                No business day configurations found. Please contact support to
                set up your initial configuration.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </div>

      {/* Capacity Modal */}
      <Dialog open={isCapacityModalOpen} onOpenChange={setIsCapacityModalOpen}>
        <DialogContent className="sm:max-w-[425px] p-2">
          <CapacityManager
            businessId={businessId || ""}
            currentCapacity={businessData?.capacity || 1}
          />
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <AdvancedBottomButton
        fixed={true}
        maxWidth="30rem"
        buttons={[
          {
            text: anyDayOpen ? "Close All Days" : "Open All Days",
            onClick: () => handleToggleAllDays(),
            disable: showLoading,
            className: `w-full h-12 ${anyDayOpen
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
              }`,
            swipe: true,
          },
        ]}
      />
    </main>
  );
};

export default Everyday;

"use client";
import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import orderfood from "@/assets/hotel/orderfood.jpeg";
import { motion } from "framer-motion";
import housekeeping from "@/assets/hotel/housekeeping.jpeg";
import maintainance from "@/assets/hotel/maintainace.jpeg";
import frontoffice from "@/assets/hotel/frontoffice.jpeg";
import type { IMenuLayout } from "@/components/types/businessData";
import { HomeIcon, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import { useLogin } from "@/components/store/useLogin";
import SearchModal from "./SearchModal";
import { useCallback, useState, useMemo } from "react";

interface ServiceCategoriesSectionProps {
  businessId: string;
  menuId: IMenuLayout;
  room?: string;
}

export default function ServiceCategoriesSection({
  businessId,
  menuId,
  room,
}: ServiceCategoriesSectionProps) {
  const { categoriesLoading, categoriesData } = useGetServiceCategories(businessId);
  const setIsOpenChat = useHotelTemp((s) => s.setIsOpenChat);
  const userDetails = useLogin((s) => s.userDetails);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Memoize static configuration objects to prevent unnecessary re-renders
  const config = useMemo(() => ({
    categoryImages: {
      FOOD: orderfood,
      HOUSE_KEEPING: housekeeping,
      FRONT_OFFICE: frontoffice,
      OTHERS: maintainance,
    },
    categoryDescriptions: {
      FOOD: "Order Delicious Food",
      FRONT_OFFICE: "24*7 Support",
      HOUSE_KEEPING: "cleaning services",
      OTHERS: "Repairs & fixes",
    },
    nameMap: {
      FOOD: "ORDER_FOOD",
      MAINTENANCE: "MAINTAINANCE",
    } as Record<string, string>,
    primaryKeys: ["ORDER_FOOD", "HOUSE_KEEPING", "MAINTAINANCE", "FRONT_OFFICE"],
  }), []);

  // Stable callbacks for UI actions
  const handleOpenSearch = useCallback(() => setShowSearchModal(true), []);
  const handleCloseSearch = useCallback(() => setShowSearchModal(false), []);
  
  const toggleChat = useCallback(() => {
    setIsOpenChat((v) => !v);
  }, [setIsOpenChat]);

  // Memoize the data transformation and filtering
  const { primary, others } = useMemo(() => {
    if (!categoriesData) return { primary: [], others: [] };

    const transformed = categoriesData
      .map((cat) => ({
        ...cat,
        name: config.nameMap[cat.name] || cat.name,
      }));

    return {
      primary: transformed.filter((cat) => config.primaryKeys.includes(cat.name)),
      others: transformed.filter((cat) => !config.primaryKeys.includes(cat.name)),
    };
  }, [categoriesData, config]);

  if (categoriesLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Our Services</h2>
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="w-full h-[160px] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!categoriesData || categoriesData.length === 0) return null;

  return (
    <div className="relative">
      <div className="mb-6 flex items-start justify-between px-1">
        <section className="flex flex-col gap-2.5 relative">
          {/* Subtle Vertical Accent */}
          <div className="absolute -left-3 top-1 bottom-1 w-1 bg-[#A79F97]/30 rounded-full" />
          
          <div className="flex flex-col gap-1">
            <span className="poppins-regular text-[1.25rem] leading-none tracking-tight text-[#A79F97]">
              Hello {userDetails?.name ? userDetails.name.split(' ')[0] : "Guest"},
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="poppins-semibold text-[1.05rem] leading-none tracking-tight text-[#4A433D]">
                Guest Support
              </span>
              <span className="h-1 w-1 rounded-full bg-[#E9E4DC]" />
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F2EE]/50 px-2.5 py-1 ring-1 ring-[#E9E4DC]/60 shadow-sm transition-all duration-300 hover:bg-[#F5F2EE]">
                <HomeIcon size={12} className="text-[#A79F97]" />
                <span className="poppins-bold text-[0.85rem] leading-none text-[#4A433D]">
                  {room}
                </span>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenSearch}
            size="icon"
            className="h-11 w-11 rounded-full border border-white/60 bg-[#E85D3A] text-white shadow-[0_6px_14px_rgba(232,93,58,0.22)] transition-all duration-300 hover:scale-[1.05] hover:bg-[#D95332] active:scale-95"
          >
            <Search size={18} />
          </Button>

          <Button
            onClick={toggleChat}
            size="icon"
            className="relative h-11 w-11 rounded-full border border-white/60 bg-[#178A43] text-white shadow-[0_6px_14px_rgba(23,138,67,0.18)] transition-all duration-300 hover:scale-[1.05] hover:bg-[#147B3B] active:scale-95"
          >
            <MessageCircle size={18} />
            <motion.span
              className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#22C55E]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.3 }}
            />
          </Button>
        </div>
      </div>

      <section className="flex justify-center">
        <div className="grid grid-cols-2 gap-2 md:gap-4 lg:gap-4 mt-2 w-full">
          {primary.map((category) => (
            <div key={category._id} className="w-full aspect-square">
              <ServiceCategoryCard
                category={{
                  ...category,
                  image: config.categoryImages[category.name as keyof typeof config.categoryImages] || orderfood,
                  description: config.categoryDescriptions[category.name as keyof typeof config.categoryDescriptions] || "",
                }}
                businessId={businessId}
                menuId={menuId}
              />
            </div>
          ))}

          {others.length > 0 && (
            <div key="others" className="w-full aspect-square">
              <ServiceCategoryCard
                category={{
                  _id: "others",
                  name: "MAINTAINANCE",
                  serviceIds: others.flatMap((c) => c.serviceIds),
                  image: maintainance,
                  description: config.categoryDescriptions.OTHERS,
                }}
                businessId={businessId}
              />
            </div>
          )}
        </div>
      </section>

      <SearchModal
        show={showSearchModal}
        onClose={handleCloseSearch}
        businessId={businessId}
        categories={categoriesData}
      />
    </div>
  );
}
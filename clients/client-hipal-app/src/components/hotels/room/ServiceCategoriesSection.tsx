"use client";
import {
  type IService,
  useGetServiceCategories,
} from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import bell from "@/assets/hotel/bell.png";
import { motion } from "framer-motion";
import foodDome from "@/assets/hotel/Food.png";
import housekeeping from "@/assets/hotel/House_keeping.png";
import maintainance from "@/assets/hotel/maintainace_new.png";
import frontoffice from "@/assets/hotel/Front_Office.png";
import type { IMenuLayout } from "@/components/types/businessData";
import { HomeIcon, MessageCircle, Search } from "lucide-react";
import { TbHeartPlus } from "react-icons/tb";
import { Button } from "@/components/ui/button";
import { useHotelTemp } from "@/components/store/useHotelTemp";
import SearchModal from "./SearchModal";
import { useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
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
  const { categoriesLoading, categoriesData } =
    useGetServiceCategories(businessId);
  const isOpenChat = useHotelTemp((s) => s.isOpenChat);
  const setIsOpenChat = useHotelTemp((s) => s.setIsOpenChat);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleOpenSearch = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setShowSearchModal(false);
  }, []);

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

  if (!categoriesData || categoriesData.length === 0) {
    return null;
  }

  const categoryImages = {
    FOOD: foodDome,
    HOUSE_KEEPING: housekeeping,
    FRONT_OFFICE: frontoffice,
    OTHERS: maintainance,
  };

  const categoryDescriptions = {
    FOOD: "Order Delicious Food",
    FRONT_OFFICE: "24*7 Support",
    HOUSE_KEEPING: "cleaning services",
    OTHERS: "Repairs & fixes",
  };

  const primaryCategories = [
    "FOOD",
    "HOUSE_KEEPING",
    "MAINTAINANCE",
    "FRONT_OFFICE",
  ];

  // Separate the categories
  const primary = categoriesData.filter((cat) =>
    primaryCategories.includes(cat.name),
  );
  const others = categoriesData.filter(
    (cat) => !primaryCategories.includes(cat.name),
  );

  return (
    <div className="relative ">
      <div className="flex items-center justify-between mb-4 mr-2">
        <section>
          <span className="poppins-regular flex gap-1 items-center text-gray-400 text-[0.9rem]">
            Guest Support
          </span>
          <span className="poppins-regular gap-2 flex items-center text-gray-600 !font-semibold text-[0.9rem]">
            <HomeIcon size={14} />
            {room}
          </span>
        </section>
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <Button
            onClick={handleOpenSearch}
            size="icon"
            aria-label="Search services"
            className="relative transition-colors rounded-full text-base-100 "
          >
            <Search size={18} />
          </Button>

          {/* Chat Button */}
          <Button
            onClick={() => setIsOpenChat(!isOpenChat)}
            size="icon"
            aria-label="Chat with us"
            className="relative transition-colors rounded-full bg-green-700 text-white"
          >
            <MessageCircle />
            <motion.span
              className="absolute top-0 right-0 w-2 h-2 rounded-full bg-green-700"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2,
              }}
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
                  image:
                    categoryImages[
                      category.name as keyof typeof categoryImages
                    ] || bell,
                  description:
                    categoryDescriptions[
                      category.name as keyof typeof categoryDescriptions
                    ] || "",
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
                  description: categoryDescriptions.OTHERS,
                }}
                businessId={businessId}
              />
            </div>
          )}
        </div>
      </section>
      {categoriesData && (
        <SearchModal
          show={showSearchModal}
          onClose={handleCloseSearch}
          businessId={businessId}
          categories={categoriesData}
        />
      )}
    </div>
  );
}

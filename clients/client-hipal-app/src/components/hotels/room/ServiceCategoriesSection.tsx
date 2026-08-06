"use client";
import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import orderfood from "@/assets/hotel/orderfood.jpeg";
import housekeeping from "@/assets/hotel/housekeeping.jpeg";
import maintainance from "@/assets/hotel/maintainace.jpeg";
import frontoffice from "@/assets/hotel/frontoffice.jpeg";
import type { IMenuLayout } from "@/components/types/businessData";
import { Search } from "lucide-react";
import { useLogin } from "@/components/store/useLogin";
import SearchModal from "./SearchModal";
import { useCallback, useMemo, useState } from "react";
import HotelAlarmReminder from "./HotelAlarmReminder";

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
  const userDetails = useLogin((s) => s.userDetails);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Memoize static configuration objects to prevent unnecessary re-renders
  const config = useMemo(
    () => ({
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
      primaryKeys: [
        "ORDER_FOOD",
        "HOUSE_KEEPING",
        "MAINTAINANCE",
        "FRONT_OFFICE",
      ],
    }),
    []
  );

  // Stable callbacks for UI actions
  const handleOpenSearch = useCallback(() => setShowSearchModal(true), []);
  const handleCloseSearch = useCallback(() => setShowSearchModal(false), []);

  // Quick Actions is a system category rendered separately as quick-action
  // tiles — it must not appear as a regular browsing category.
  const browsableCategories = useMemo(
    () =>
      (categoriesData || []).filter((cat) => cat.systemKey !== "QUICK_ACTIONS"),
    [categoriesData]
  );

  // Memoize the data transformation and filtering
  const { primary, others } = useMemo(() => {
    if (!browsableCategories.length) return { primary: [], others: [] };

    const transformed = browsableCategories.map((cat) => ({
      ...cat,
      name: config.nameMap[cat.name] || cat.name,
    }));

    return {
      primary: transformed.filter((cat) =>
        config.primaryKeys.includes(cat.name)
      ),
      others: transformed.filter(
        (cat) => !config.primaryKeys.includes(cat.name)
      ),
    };
  }, [browsableCategories, config]);

  const hasCategories = Boolean(browsableCategories.length);
  const displayRoom = room && room !== "hipalz";

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-3 px-1 pt-1">
        <section className="min-w-0">
          <h1 className="inter truncate text-[1.08rem] font-semibold leading-tight text-[#211915]">
            Hello {userDetails?.name ? userDetails.name.split(" ")[0] : "Guest"}
          </h1>
          <span className="font-medium inter text-[#927567] text-sm">Guest Support</span>
          <div className="mt-1.5 flex min-w-0 items-center gap-2 whitespace-nowrap text-[0.78rem] leading-none">
            {displayRoom && (
              <>
                <span className="inter font-bold text-[#3B302B]">
                  Room {room}
                </span>
                <span className="h-1 w-1 rounded-full bg-[#D4C3B8]" />
              </>
            )}
          </div>
        </section>

        <div className="flex shrink-0 items-center gap-1.5">
          <HotelAlarmReminder
            businessId={businessId}
            room={room}
            triggerLabel="Wake-up call"
            triggerClassName="h-8 w-auto rounded-full border-0 bg-[#7B2C4C] px-2.5 text-[0.72rem] font-semibold text-white shadow-none hover:scale-100 hover:bg-[#7B2C4C] active:scale-[0.98] focus-visible:ring-[#B24A74]/20"
          />

          <button
            type="button"
            onClick={handleOpenSearch}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border-0 bg-[#7B2C4C] px-2.5 text-[0.72rem] text-white transition-all duration-200 hover:bg-[#ECE5DF] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B24A74]/20"
          >
            <Search className="h-3.5 w-3.5" />
            Search
          </button>
        </div>
      </div>

      {categoriesLoading ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold">Our Services</h2>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="w-full h-[160px] rounded-xl" />
            ))}
          </div>
        </section>
      ) : hasCategories ? (
        <section className="flex justify-center">
          <div className="grid grid-cols-2 gap-2 md:gap-4 lg:gap-4 mt-2 w-full">
            {primary.map((category) => (
              <div key={category._id} className="w-full aspect-square">
                <ServiceCategoryCard
                  category={{
                    ...category,
                    image:
                      config.categoryImages[
                        category.name as keyof typeof config.categoryImages
                      ] || orderfood,
                    description:
                      config.categoryDescriptions[
                        category.name as keyof typeof config.categoryDescriptions
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
                    description: config.categoryDescriptions.OTHERS,
                  }}
                  businessId={businessId}
                />
              </div>
            )}
          </div>
        </section>
      ) : null}

      <SearchModal
        show={showSearchModal}
        onClose={handleCloseSearch}
        businessId={businessId}
        categories={browsableCategories}
      />
    </div>
  );
}

"use client";
import { useGetAllLinkRestautants } from "@/components/hooks/useHotelRoom";
import { useGetServiceCategories } from "@/components/hooks/useServicesHotel";
import ServiceCategoryCard from "./ServiceCategoryCard";
import { Skeleton } from "@/components/ui/skeleton";
import orderfood from "@/assets/hotel/orderfood.jpeg";
import housekeeping from "@/assets/hotel/housekeeping.jpeg";
import maintainance from "@/assets/hotel/maintainace.jpeg";
import frontoffice from "@/assets/hotel/frontoffice.jpeg";
import type { IMenuLayout } from "@/components/types/businessData";
import { MessageCircle, Phone, Search } from "lucide-react";
import { useLogin } from "@/components/store/useLogin";
import SearchModal from "./SearchModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import HotelAlarmReminder from "./HotelAlarmReminder";
import { useHotelBusinessData } from "@/components/store/useHotelBusinessData";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ServiceCategoriesSectionProps {
  businessId: string;
  menuId: IMenuLayout;
  room?: string;
  contactPhone?: string;
}

export default function ServiceCategoriesSection({
  businessId,
  menuId,
  room,
  contactPhone,
}: ServiceCategoriesSectionProps) {
  const { categoriesLoading, categoriesData } =
    useGetServiceCategories(businessId);
  const { fetchingRestaurants, restaurantData } =
    useGetAllLinkRestautants(businessId);
  const userDetails = useLogin((s) => s.userDetails);
  const hotelData = useHotelBusinessData((s) => s.hotelData);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const suppressSearchAutoOpenRef = useRef(false);
  const hotelPhoneNumber = (
    hotelData as typeof hotelData & {
      phoneNumber?: string;
    }
  )?.phoneNumber;
  const phone = contactPhone || hotelData?.phone || hotelPhoneNumber || "";

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
  const handleOpenSearch = useCallback(() => {
    suppressSearchAutoOpenRef.current = false;
    const params = new URLSearchParams(searchParams.toString());
    params.set("supportSearch", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowSearchModal(true);
  }, [pathname, router, searchParams]);

  const handleCloseSearch = useCallback(() => {
    suppressSearchAutoOpenRef.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("supportSearch");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    setShowSearchModal(false);
  }, [pathname, router, searchParams]);

  const handleCall = useCallback(() => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }, [phone]);

  const handleOpenChat = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("chat", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    const shouldOpenSearch = searchParams.get("supportSearch") === "1";
    if (!shouldOpenSearch) {
      suppressSearchAutoOpenRef.current = false;
    }
    if (shouldOpenSearch && suppressSearchAutoOpenRef.current) return;
    setShowSearchModal(shouldOpenSearch);
  }, [searchParams]);

  const linkedRestaurants = restaurantData ?? [];
  const hasLinkedRestaurants = linkedRestaurants.length > 0;
  const quickActionTileClass =
    "relative inline-flex h-12 min-w-0 flex-col items-center justify-center gap-1 overflow-hidden rounded-2xl border bg-white px-1 shadow-[0_10px_22px_rgba(45,32,24,0.08)] ring-1 ring-black/[0.03] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(45,32,24,0.12)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 disabled:opacity-45";
  const quickActionLabelClass =
    "text-[0.64rem] font-semibold leading-none tracking-normal";
  const quickActionColors = {
    call: "border-[#BFE6D5] text-[#2F956E] hover:bg-[#F2FBF7] focus-visible:ring-[#38A978]/20",
    wakeup:
      "border-[#E8C2D2] text-[#A33D68] hover:bg-[#FFF5F9] focus-visible:ring-[#B64B78]/20",
    search:
      "border-[#C7DAF7] text-[#3E7ED7] hover:bg-[#F4F8FF] focus-visible:ring-[#4B8EEB]/20",
    chat: "border-[#D8C8EF] text-[#7B58B8] hover:bg-[#F8F4FF] focus-visible:ring-[#8E68C8]/20",
  };

  // Quick Actions is a system category rendered separately as quick-action
  // tiles - it must not appear as a regular browsing category.
  const browsableCategories = useMemo(
    () =>
      (categoriesData || []).filter((cat) => {
        if (cat.systemKey === "QUICK_ACTIONS") return false;
        const mappedName = config.nameMap[cat.name] || cat.name;
        if (!hasLinkedRestaurants && mappedName === "ORDER_FOOD") return false;
        return true;
      }),
    [categoriesData, config.nameMap, hasLinkedRestaurants]
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

  const { orderFoodCategory, primaryWithoutOrderFood } = useMemo(
    () => ({
      orderFoodCategory: primary.find((cat) => cat.name === "ORDER_FOOD"),
      primaryWithoutOrderFood: primary.filter(
        (cat) => cat.name !== "ORDER_FOOD"
      ),
    }),
    [primary]
  );
  const displayPrimary = useMemo(() => {
    if (!hasLinkedRestaurants) return primaryWithoutOrderFood;
    return [
      orderFoodCategory ?? {
        _id: "linked-order-food",
        name: "ORDER_FOOD",
        serviceIds: [],
        image: orderfood,
        description: config.categoryDescriptions.FOOD,
      },
      ...primaryWithoutOrderFood,
    ];
  }, [
    config.categoryDescriptions.FOOD,
    hasLinkedRestaurants,
    orderFoodCategory,
    primaryWithoutOrderFood,
  ]);
  const hasCategories = Boolean(displayPrimary.length || others.length);
  const displayRoom = room && room !== "hipalz";

  return (
    <div className="relative plus-jakarta-font">
      <div className="space-y-3 px-2 pt-1">
        <section className="flex min-w-0 items-start justify-between gap-4">
          {/* Guest greeting */}
          <div className="min-w-0">
            <h1 className="truncate text-[1.25rem] leading-[1.08] tracking-normal text-[#211915]">
              Hello{" "}
              {userDetails?.name ? userDetails.name.split(" ")[0] : "Guest"}
            </h1>

            <span className="mt-1.5 block text-[0.9rem] leading-[1.15] tracking-normal text-[#72635D]">
              Guest support
            </span>
          </div>

          {/* Room number */}
          {displayRoom && (
            <span className="shrink-0 pt-1 text-[0.9rem] font-semibold leading-[1.15] text-[#7B2C4C]">
              Room {room}
            </span>
          )}
        </section>

        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleCall}
            disabled={!phone}
            aria-label="Call hotel"
            className={`${quickActionTileClass} ${quickActionColors.call}`}
          >
            <Phone className="h-4 w-4" strokeWidth={2.2} />
            <span className={quickActionLabelClass}>Call</span>
          </button>
          <HotelAlarmReminder
            businessId={businessId}
            room={room}
            triggerLabel="Wake-up"
            triggerClassName={`${quickActionTileClass} ${quickActionColors.wakeup} !h-12 w-full !rounded-2xl !px-1 text-[0.64rem] font-semibold hover:scale-100 [&>svg]:h-4 [&>svg]:w-4 [&>span]:leading-none [&>span]:tracking-normal`}
          />

          <button
            type="button"
            onClick={handleOpenSearch}
            className={`${quickActionTileClass} ${quickActionColors.search}`}
          >
            <Search className="h-4 w-4" strokeWidth={2.2} />
            <span className={quickActionLabelClass}>Search</span>
          </button>
          <button
            type="button"
            onClick={handleOpenChat}
            aria-label="Open service chat"
            className={`${quickActionTileClass} ${quickActionColors.chat}`}
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
            <span className={quickActionLabelClass}>Chat</span>
          </button>
        </div>
      </div>

      {categoriesLoading || fetchingRestaurants ? (
        <section className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="w-full h-[160px] rounded-xl" />
            ))}
          </div>
        </section>
      ) : hasCategories ? (
        <section className="flex justify-center">
          <div className="grid grid-cols-2 gap-2 md:gap-4 lg:gap-4 w-full py-6">
            {displayPrimary.map((category) => (
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
                  room={room}
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
                  room={room}
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
